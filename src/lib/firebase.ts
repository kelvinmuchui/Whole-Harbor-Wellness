import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
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
        `/databases/${firebaseConfig.firestoreDatabaseId}/documents/products/prod-5-amino-1mq` +
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

// Connection test helper
export async function testFirestoreConnection(): Promise<boolean> {
  const reachable = await ensureFirestoreReachable();
  if (!reachable) return false;
  try {
    await getDocFromServer(doc(db, 'products', 'prod-5-amino-1mq'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline notice:', error.message);
      return false;
    }
    return true;
  }
}

export default app;
