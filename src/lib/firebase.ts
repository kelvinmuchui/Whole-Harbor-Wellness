import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
  disableNetwork,
  doc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Must use firestoreDatabaseId from firebase-applet-config.json.
// Force HTTP long-polling and in-memory cache so proxied/sandboxed iframes do not
// stall on WebChannel FetchStreams or IndexedDB multi-tab locks for 10 seconds.
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      localCache: memoryLocalCache(),
      experimentalForceLongPolling: true,
      ignoreUndefinedProperties: true
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  // If already initialized, retrieve existing instance
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreInstance;
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function buildFirestoreErrorInfo(
  error: unknown,
  operationType: OperationType,
  path: string | null
): FirestoreErrorInfo {
  return {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId ?? null,
          email: provider.email ?? null
        })) || []
    },
    operationType,
    path
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo = buildFirestoreErrorInfo(error, operationType, path);
  const serialized = JSON.stringify(errInfo);
  console.error('Firestore Error: ', serialized);
  throw new Error(serialized);
}

let reachabilityPromise: Promise<boolean> | null = null;
let lastCheckedAt = 0;
let lastReachable = false;

/**
 * Fast HTTP preflight probe against Firestore REST endpoint (2.5s max).
 * Prevents Firestore SDK's internal Watch stream from hanging for 10s and
 * logging "Could not reach Cloud Firestore backend" when network/proxy blocks it.
 */
export async function ensureFirestoreReachable(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    lastReachable = false;
    disableNetwork(db).catch(() => {});
    return false;
  }

  const now = Date.now();
  if (reachabilityPromise && now - lastCheckedAt < 30000) {
    return reachabilityPromise;
  }

  lastCheckedAt = now;
  reachabilityPromise = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    try {
      const probeUrl =
        `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}` +
        `/databases/${firebaseConfig.firestoreDatabaseId}/documents/test/connection` +
        `?key=${firebaseConfig.apiKey}`;
      const res = await fetch(probeUrl, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store'
      });
      // Any HTTP response from Firestore (200, 403, 404) confirms backend reachability
      const reachable = res.status >= 200 && res.status < 500;
      lastReachable = reachable;
      if (!reachable) {
        await disableNetwork(db).catch(() => {});
      }
      return reachable;
    } catch {
      lastReachable = false;
      await disableNetwork(db).catch(() => {});
      return false;
    } finally {
      clearTimeout(timer);
    }
  })();

  return reachabilityPromise;
}

export function isFirestoreKnownOffline(): boolean {
  return reachabilityPromise !== null && !lastReachable;
}

// Startup connection test helper
export async function testFirestoreConnection(): Promise<boolean> {
  const reachable = await ensureFirestoreReachable();
  if (!reachable) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.', error.message);
      return false;
    }
    return true;
  }
}

export default app;
