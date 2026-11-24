import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import {
  auth,
  db,
  ensureFirestoreReachable,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection
} from '../lib/firebase.ts';
import {
  INITIAL_ARTICLES,
  INITIAL_CMS_PAGES,
  INITIAL_EARNINGS,
  INITIAL_FAQS,
  INITIAL_MEDIA_ASSETS,
  INITIAL_ORDERS,
  INITIAL_PARTNERS,
  INITIAL_PROGRAMS,
  INITIAL_TESTIMONIALS
} from '../lib/seedData.ts';
import { INITIAL_USERS } from '../lib/seedUsers.ts';
import { getSupabaseClient, isSupabaseConfigured, type Json } from '../lib/supabase.ts';
import { demoModeEnabled, TEST_VARS } from '../lib/testVariables.ts';
import { WHW_PRODUCTS } from '../lib/whwCatalog.ts';
import type {
  AnalyticsEvent,
  AuditLogEntry,
  CmsPageContent,
  ContactInquiry,
  EducationalArticle,
  FAQ,
  MediaAsset,
  NotificationEventType,
  NotificationRecord,
  Order,
  OrderStatus,
  Partner,
  PartnerEarning,
  PartnerStatus,
  Product,
  Testimonial,
  UserProfile,
  UserRole,
  WellnessProgram
} from '../types/index.ts';

export type CollectionName =
  | 'users'
  | 'partners'
  | 'products'
  | 'orders'
  | 'partner_earnings'
  | 'wellness_programs'
  | 'educational_articles'
  | 'faqs'
  | 'testimonials'
  | 'cms_pages'
  | 'media_assets'
  | 'notifications'
  | 'inquiries'
  | 'analytics_events'
  | 'audit_logs';

interface RecordRow {
  record_id: string;
  data: Json;
  is_demo: boolean;
}

export { INITIAL_USERS };

const LOCAL_STORAGE_PREFIX = 'whw_v2_';
const PUBLIC_COLLECTIONS: ReadonlySet<CollectionName> = new Set([
  'products',
  'wellness_programs',
  'educational_articles',
  'faqs',
  'testimonials',
  'cms_pages',
  'media_assets'
]);

const collectionListeners = new Map<CollectionName, Set<() => void>>();

let connectionTestStarted = false;
function ensureStartupConnectionTest(): void {
  if (connectionTestStarted || isSupabaseConfigured()) return;
  connectionTestStarted = true;
  void testFirestoreConnection();
}

function getSeedData(collectionName: CollectionName): unknown[] {
  switch (collectionName) {
    case 'users':
      return INITIAL_USERS;
    case 'partners':
      return INITIAL_PARTNERS;
    case 'products':
      return WHW_PRODUCTS;
    case 'orders':
      return INITIAL_ORDERS;
    case 'partner_earnings':
      return INITIAL_EARNINGS;
    case 'wellness_programs':
      return INITIAL_PROGRAMS;
    case 'educational_articles':
      return INITIAL_ARTICLES;
    case 'faqs':
      return INITIAL_FAQS;
    case 'testimonials':
      return INITIAL_TESTIMONIALS;
    case 'cms_pages':
      return INITIAL_CMS_PAGES;
    case 'media_assets':
      return INITIAL_MEDIA_ASSETS;
    case 'notifications':
    case 'inquiries':
    case 'analytics_events':
    case 'audit_logs':
      return [];
  }
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function storageKey(collectionName: CollectionName): string {
  return `${LOCAL_STORAGE_PREFIX}${collectionName}`;
}

function notifyCollectionListeners(collectionName: CollectionName): void {
  const listeners = collectionListeners.get(collectionName);
  if (!listeners) return;
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (err) {
      console.error(`Listener error for ${collectionName}:`, err);
    }
  });
}

function readLocalCollection<T>(collectionName: CollectionName): T[] {
  const seed = cloneJson(getSeedData(collectionName)) as T[];
  if (typeof window === 'undefined' || !window.localStorage) {
    return seed;
  }

  try {
    const raw = window.localStorage.getItem(storageKey(collectionName));
    if (!raw) {
      window.localStorage.setItem(storageKey(collectionName), JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      if (collectionName === 'products') {
        const deletedRaw = window.localStorage.getItem(`${LOCAL_STORAGE_PREFIX}deleted_products`);
        const deletedIds = new Set<string>(deletedRaw ? (JSON.parse(deletedRaw) as string[]) : []);
        const existingIds = new Set(
          parsed.map((item) => (item as { id?: string }).id).filter(Boolean) as string[]
        );
        const missingSeeds = seed.filter((item) => {
          const id = (item as { id?: string }).id;
          return id && !existingIds.has(id) && !deletedIds.has(id);
        });
        if (missingSeeds.length > 0) {
          const merged = [...parsed, ...missingSeeds];
          window.localStorage.setItem(storageKey(collectionName), JSON.stringify(merged));
          return merged as T[];
        }
      }
      return parsed as T[];
    }
  } catch (err) {
    console.warn(`Failed to read local store for ${collectionName}:`, err);
  }
  return seed;
}

function writeLocalCollection<T>(collectionName: CollectionName, items: T[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(storageKey(collectionName), JSON.stringify(items));
  } catch (err) {
    console.warn(`Failed to persist local store for ${collectionName}:`, err);
  }
}

function mergeRecordsById<T>(primary: T[], secondary: T[]): T[] {
  const map = new Map<string, T>();
  secondary.forEach((item) => {
    try {
      const id = getId(item as object);
      map.set(id, item);
    } catch {
      // skip records without id
    }
  });
  primary.forEach((item) => {
    try {
      const id = getId(item as object);
      map.set(id, item);
    } catch {
      // skip records without id
    }
  });
  return Array.from(map.values());
}

function isFirebaseAdminSession(): boolean {
  const email = auth.currentUser?.email?.toLowerCase();
  if (!auth.currentUser?.emailVerified || !email) return false;
  return (
    email === 'muchuimalcolm423@gmail.com' ||
    email === 'muchuikelvin423@gmail.com' ||
    email === 'admin@wholeharborwellness.com' ||
    email === TEST_VARS.auth.adminEmail.toLowerCase()
  );
}

function raiseSupabaseError(operation: string, error: { message: string }): never {
  console.error(`Supabase ${operation} failed:`, error.message);
  throw new Error(`Supabase ${operation} failed: ${error.message}`);
}

function fromRow<T>(row: RecordRow): T {
  if (!row.data || typeof row.data !== 'object' || Array.isArray(row.data)) {
    throw new Error(`Supabase record "${row.record_id}" has invalid JSON data.`);
  }
  return { ...(row.data as Record<string, unknown>), id: row.record_id } as T;
}

function toJson(value: object): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

function isDemoEnvironment(): boolean {
  return demoModeEnabled;
}

function makeId(prefix: string): string {
  return `${prefix}-${globalThis.crypto.randomUUID()}`;
}

function getId(record: object): string {
  if ('id' in record && typeof record.id === 'string') return record.id;
  if ('uid' in record && typeof record.uid === 'string') return record.uid;
  throw new Error('Records must have an id or uid.');
}

async function getRecord<T>(collectionName: CollectionName, id: string): Promise<T | null> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseClient()
      .from('whw_records')
      .select('record_id,data,is_demo')
      .eq('collection', collectionName)
      .eq('record_id', id)
      .maybeSingle();

    if (error) raiseSupabaseError(`read ${collectionName}/${id}`, error);
    return data ? fromRow<T>(data as RecordRow) : null;
  }

  ensureStartupConnectionTest();

  const localItems = readLocalCollection<T>(collectionName);
  const localMatch =
    localItems.find((item) => {
      const obj = item as Record<string, unknown>;
      return obj.id === id || obj.uid === id;
    }) ?? null;

  const canReadFirestore =
    PUBLIC_COLLECTIONS.has(collectionName) ||
    isFirebaseAdminSession() ||
    (collectionName === 'users' && auth.currentUser?.uid === id) ||
    (collectionName === 'partners' && auth.currentUser !== null);

  if (canReadFirestore && (await ensureFirestoreReachable())) {
    const path = `${collectionName}/${id}`;
    try {
      const snap = await getDoc(doc(db, collectionName, id));
      if (snap.exists()) {
        return { ...(snap.data() as Record<string, unknown>), id: snap.id } as T;
      }
    } catch (err) {
      if (!demoModeEnabled) {
        handleFirestoreError(err, OperationType.GET, path);
      }
    }
  }

  return localMatch;
}

async function getCollection<T>(collectionName: CollectionName): Promise<T[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseClient()
      .from('whw_records')
      .select('record_id,data,is_demo')
      .eq('collection', collectionName);

    if (error) raiseSupabaseError(`list ${collectionName}`, error);
    return ((data ?? []) as RecordRow[]).map((row) => fromRow<T>(row));
  }

  ensureStartupConnectionTest();
  const localItems = readLocalCollection<T>(collectionName);

  const reachable = await ensureFirestoreReachable();
  if (!reachable) {
    return localItems;
  }

  try {
    if (PUBLIC_COLLECTIONS.has(collectionName)) {
      const snap = await getDocs(collection(db, collectionName));
      if (snap.empty) return localItems;
      const remote = snap.docs.map(
        (d) => ({ ...(d.data() as Record<string, unknown>), id: d.id } as T)
      );
      if (collectionName === 'products') {
        return mergeRecordsById(remote, localItems);
      }
      return remote;
    }

    if (collectionName === 'partners') {
      if (isFirebaseAdminSession()) {
        const snap = await getDocs(collection(db, 'partners'));
        const remote = snap.docs.map(
          (d) => ({ ...(d.data() as Record<string, unknown>), id: d.id } as T)
        );
        return mergeRecordsById(remote, localItems);
      }
      const approvedSnap = await getDocs(
        query(collection(db, 'partners'), where('status', '==', 'APPROVED'))
      );
      const approvedRemote = approvedSnap.docs.map(
        (d) => ({ ...(d.data() as Record<string, unknown>), id: d.id } as T)
      );
      let ownRemote: T[] = [];
      if (auth.currentUser?.uid) {
        const ownSnap = await getDocs(
          query(collection(db, 'partners'), where('ownerUid', '==', auth.currentUser.uid))
        );
        ownRemote = ownSnap.docs.map(
          (d) => ({ ...(d.data() as Record<string, unknown>), id: d.id } as T)
        );
      }
      const combinedRemote = mergeRecordsById(ownRemote, approvedRemote);
      return demoModeEnabled
        ? mergeRecordsById(combinedRemote, localItems)
        : combinedRemote.length > 0
        ? combinedRemote
        : localItems;
    }

    if (!auth.currentUser) {
      return localItems;
    }

    if (isFirebaseAdminSession()) {
      const snap = await getDocs(collection(db, collectionName));
      const remote = snap.docs.map(
        (d) => ({ ...(d.data() as Record<string, unknown>), id: d.id } as T)
      );
      return demoModeEnabled ? mergeRecordsById(remote, localItems) : remote;
    }

    if (collectionName === 'users') {
      const snap = await getDocs(
        query(collection(db, 'users'), where('uid', '==', auth.currentUser.uid))
      );
      const remote = snap.docs.map(
        (d) => ({ ...(d.data() as Record<string, unknown>), id: d.id } as T)
      );
      return demoModeEnabled ? mergeRecordsById(remote, localItems) : remote;
    }

    if (collectionName === 'orders') {
      const [custSnap, partnerSnap] = await Promise.all([
        getDocs(query(collection(db, 'orders'), where('customerUid', '==', auth.currentUser.uid))).catch(
          () => null
        ),
        getDocs(query(collection(db, 'orders'), where('partnerOwnerUid', '==', auth.currentUser.uid))).catch(
          () => null
        )
      ]);
      const remote = mergeRecordsById(
        custSnap?.docs.map((d) => ({ ...(d.data() as Record<string, unknown>), id: d.id } as T)) ?? [],
        partnerSnap?.docs.map((d) => ({ ...(d.data() as Record<string, unknown>), id: d.id } as T)) ?? []
      );
      return demoModeEnabled ? mergeRecordsById(remote, localItems) : remote;
    }

    if (collectionName === 'partner_earnings') {
      const snap = await getDocs(
        query(collection(db, 'partner_earnings'), where('partnerOwnerUid', '==', auth.currentUser.uid))
      );
      const remote = snap.docs.map(
        (d) => ({ ...(d.data() as Record<string, unknown>), id: d.id } as T)
      );
      return demoModeEnabled ? mergeRecordsById(remote, localItems) : remote;
    }

    if (collectionName === 'inquiries') {
      const snap = await getDocs(
        query(collection(db, 'inquiries'), where('userId', '==', auth.currentUser.uid))
      );
      const remote = snap.docs.map(
        (d) => ({ ...(d.data() as Record<string, unknown>), id: d.id } as T)
      );
      return demoModeEnabled ? mergeRecordsById(remote, localItems) : remote;
    }

    if (collectionName === 'notifications') {
      const email = auth.currentUser.email;
      const [uidSnap, emailSnap] = await Promise.all([
        getDocs(query(collection(db, 'notifications'), where('recipientUid', '==', auth.currentUser.uid))).catch(
          () => null
        ),
        email
          ? getDocs(query(collection(db, 'notifications'), where('recipientEmail', '==', email))).catch(
              () => null
            )
          : Promise.resolve(null)
      ]);
      const remote = mergeRecordsById(
        uidSnap?.docs.map((d) => ({ ...(d.data() as Record<string, unknown>), id: d.id } as T)) ?? [],
        emailSnap?.docs.map((d) => ({ ...(d.data() as Record<string, unknown>), id: d.id } as T)) ?? []
      );
      return demoModeEnabled ? mergeRecordsById(remote, localItems) : remote;
    }

    return localItems;
  } catch (err) {
    if (demoModeEnabled) {
      return localItems;
    }
    handleFirestoreError(err, OperationType.LIST, collectionName);
  }
}

export function subscribeToCollections(
  collections: CollectionName[],
  onChange: () => void
): () => void {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    const channels = collections.map((collectionName) =>
      client
        .channel(`whw-${collectionName}-${globalThis.crypto.randomUUID()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'whw_records',
            filter: `collection=eq.${collectionName}`
          },
          onChange
        )
        .subscribe((status, error) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error(
              `Supabase realtime subscription failed for ${collectionName} (${status}):`,
              error
            );
          }
        })
    );

    return () => {
      channels.forEach((channel) => {
        void client.removeChannel(channel).catch((error) => {
          console.error('Failed to close Supabase realtime subscription:', error);
        });
      });
    };
  }

  collections.forEach((collectionName) => {
    let set = collectionListeners.get(collectionName);
    if (!set) {
      set = new Set();
      collectionListeners.set(collectionName, set);
    }
    set.add(onChange);
  });

  const watchedKeys = new Set(collections.map(storageKey));
  const onStorage = (event: StorageEvent) => {
    if (event.key && watchedKeys.has(event.key)) {
      onChange();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }

  return () => {
    collections.forEach((collectionName) => {
      collectionListeners.get(collectionName)?.delete(onChange);
    });
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}

async function syncFirestoreWrite(
  collectionName: CollectionName,
  id: string,
  payload: Record<string, unknown>,
  operation: 'set' | 'update'
): Promise<void> {
  if (!auth.currentUser || !(await ensureFirestoreReachable())) return;
  try {
    const ref = doc(db, collectionName, id);
    if (operation === 'set') {
      await setDoc(ref, payload, { merge: true });
    } else {
      await updateDoc(ref, payload);
    }
  } catch (err) {
    if (demoModeEnabled) {
      console.warn(`Firestore ${operation} fallback to local store for ${collectionName}/${id}:`, err);
      return;
    }
    handleFirestoreError(
      err,
      operation === 'set' ? OperationType.WRITE : OperationType.UPDATE,
      `${collectionName}/${id}`
    );
  }
}

async function insertRecord<T extends object>(
  collectionName: CollectionName,
  record: T
): Promise<T> {
  if (isSupabaseConfigured()) {
    const id = getId(record);
    const { data, error } = await getSupabaseClient()
      .from('whw_records')
      .insert({
        collection: collectionName,
        record_id: id,
        data: toJson(record),
        is_demo: isDemoEnvironment()
      })
      .select('record_id,data,is_demo')
      .single();

    if (error) raiseSupabaseError(`create ${collectionName}/${id}`, error);
    return fromRow<T>(data as RecordRow);
  }

  const id = getId(record);
  const cleanRecord = cloneJson({ ...record, id }) as T;
  const items = readLocalCollection<T>(collectionName);
  const filtered = items.filter((item) => {
    const obj = item as Record<string, unknown>;
    return obj.id !== id && obj.uid !== id;
  });
  filtered.push(cleanRecord);
  writeLocalCollection(collectionName, filtered);
  notifyCollectionListeners(collectionName);
  await syncFirestoreWrite(collectionName, id, cleanRecord as Record<string, unknown>, 'set');
  return cleanRecord;
}

async function upsertRecord<T extends object>(
  collectionName: CollectionName,
  id: string,
  record: T
): Promise<T> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseClient()
      .from('whw_records')
      .upsert(
        {
          collection: collectionName,
          record_id: id,
          data: toJson(record),
          is_demo: isDemoEnvironment()
        },
        { onConflict: 'collection,record_id' }
      )
      .select('record_id,data,is_demo')
      .single();

    if (error) raiseSupabaseError(`save ${collectionName}/${id}`, error);
    return fromRow<T>(data as RecordRow);
  }

  const cleanRecord = cloneJson({ ...record, id }) as T;
  const items = readLocalCollection<T>(collectionName);
  const index = items.findIndex((item) => {
    const obj = item as Record<string, unknown>;
    return obj.id === id || obj.uid === id;
  });
  if (index >= 0) {
    items[index] = cleanRecord;
  } else {
    items.push(cleanRecord);
  }
  writeLocalCollection(collectionName, items);
  notifyCollectionListeners(collectionName);
  await syncFirestoreWrite(collectionName, id, cleanRecord as Record<string, unknown>, 'set');
  return cleanRecord;
}

async function updateRecord<U extends object>(
  collectionName: CollectionName,
  id: string,
  updates: U
): Promise<void> {
  if (isSupabaseConfigured()) {
    const existing = await getRecord<Record<string, unknown>>(collectionName, id);
    if (!existing) {
      throw new Error(`Cannot update missing ${collectionName} record "${id}".`);
    }

    const { data, error } = await getSupabaseClient()
      .from('whw_records')
      .update({ data: toJson({ ...existing, ...updates, id }) })
      .eq('collection', collectionName)
      .eq('record_id', id)
      .select('record_id,data,is_demo')
      .maybeSingle();

    if (error) raiseSupabaseError(`update ${collectionName}/${id}`, error);
    if (!data) {
      throw new Error(`Supabase did not update ${collectionName}/${id}; check the row policy.`);
    }
    return;
  }

  const items = readLocalCollection<Record<string, unknown>>(collectionName);
  const index = items.findIndex((item) => item.id === id || item.uid === id);
  const existing = index >= 0 ? items[index] : await getRecord<Record<string, unknown>>(collectionName, id);
  if (!existing) {
    throw new Error(`Cannot update missing ${collectionName} record "${id}".`);
  }

  const merged = cloneJson({ ...existing, ...updates, id });
  if (index >= 0) {
    items[index] = merged;
  } else {
    items.push(merged);
  }
  writeLocalCollection(collectionName, items);
  notifyCollectionListeners(collectionName);
  await syncFirestoreWrite(collectionName, id, merged, 'set');
}

async function deleteRecord(collectionName: CollectionName, id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getSupabaseClient()
      .from('whw_records')
      .delete()
      .eq('collection', collectionName)
      .eq('record_id', id)
      .select('record_id')
      .maybeSingle();

    if (error) raiseSupabaseError(`delete ${collectionName}/${id}`, error);
    if (!data) {
      throw new Error(`Supabase did not delete ${collectionName}/${id}; check the row policy.`);
    }
    return;
  }

  const items = readLocalCollection<Record<string, unknown>>(collectionName);
  const next = items.filter((item) => item.id !== id && item.uid !== id);
  writeLocalCollection(collectionName, next);
  if (collectionName === 'products' && typeof window !== 'undefined' && window.localStorage) {
    try {
      const deletedRaw = window.localStorage.getItem(`${LOCAL_STORAGE_PREFIX}deleted_products`);
      const deletedIds = new Set<string>(deletedRaw ? (JSON.parse(deletedRaw) as string[]) : []);
      deletedIds.add(id);
      window.localStorage.setItem(
        `${LOCAL_STORAGE_PREFIX}deleted_products`,
        JSON.stringify(Array.from(deletedIds))
      );
    } catch {
      // ignore
    }
  }
  notifyCollectionListeners(collectionName);

  if (auth.currentUser && (await ensureFirestoreReachable())) {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      if (demoModeEnabled) {
        console.warn(`Firestore delete fallback for ${collectionName}/${id}:`, err);
        return;
      }
      handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${id}`);
    }
  }
}

function newestFirst<T extends { createdAt?: string; timestamp?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aDate = a.createdAt || a.timestamp || '';
    const bDate = b.createdAt || b.timestamp || '';
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });
}

export async function seedInitialDatabase(): Promise<void> {
  if (isSupabaseConfigured()) return;
  // Ensures local fallback stores are initialized cleanly from seed datasets
  (
    [
      'users',
      'partners',
      'products',
      'orders',
      'partner_earnings',
      'wellness_programs',
      'educational_articles',
      'faqs',
      'testimonials',
      'cms_pages',
      'media_assets'
    ] as CollectionName[]
  ).forEach((name) => {
    readLocalCollection(name);
  });
}

export async function getUsers(): Promise<UserProfile[]> {
  return getCollection<UserProfile>('users');
}

export async function getUserByUid(uid: string): Promise<UserProfile | null> {
  return getRecord<UserProfile>('users', uid);
}

export async function upsertUserProfile(user: UserProfile): Promise<UserProfile> {
  const cleanUser: UserProfile = {
    ...user,
    id: user.uid,
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return upsertRecord('users', cleanUser.uid, cleanUser);
}

export async function updateUserRole(
  uid: string,
  role: UserRole,
  wholesaleApprovalStatus?: UserProfile['wholesaleApprovalStatus']
): Promise<void> {
  const existing = await getUserByUid(uid);
  const updates: Partial<UserProfile> = {
    role,
    updatedAt: new Date().toISOString(),
    ...(wholesaleApprovalStatus !== undefined ? { wholesaleApprovalStatus } : {})
  };
  await updateRecord('users', uid, updates);
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: 'ADMIN',
    action: 'SECURITY_EVENT',
    resource: 'User',
    resourceId: uid,
    metadata: { role, wholesaleApprovalStatus }
  }).catch(() => {});
  if (existing?.email) {
    await dispatchNotificationRecord({
      eventType: 'ACCOUNT_SECURITY_UPDATED',
      recipientEmail: existing.email,
      recipientName: existing.displayName,
      recipientUid: existing.uid,
      subject: 'Account Access & Role Updated – Whole Harbor Wellness',
      body: `Your Whole Harbor Wellness account role has been updated to ${role}.`
    }).catch(() => {});
  }
}

export async function updateUserStatus(
  uid: string,
  status: UserProfile['status'],
  partnerId?: string,
  partnerSlug?: string
): Promise<void> {
  const existing = await getUserByUid(uid);
  const updates: Partial<UserProfile> = {
    status,
    updatedAt: new Date().toISOString(),
    ...(partnerId !== undefined ? { partnerId } : {}),
    ...(partnerSlug !== undefined ? { partnerSlug } : {})
  };
  await updateRecord('users', uid, updates);
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: 'ADMIN',
    action: 'SECURITY_EVENT',
    resource: 'User',
    resourceId: uid,
    metadata: { status, partnerId, partnerSlug }
  }).catch(() => {});
  if (existing?.email) {
    await dispatchNotificationRecord({
      eventType: 'ACCOUNT_SECURITY_UPDATED',
      recipientEmail: existing.email,
      recipientName: existing.displayName,
      recipientUid: existing.uid,
      partnerId: partnerId || existing.partnerId,
      subject: 'Account Status Updated – Whole Harbor Wellness',
      body: `Your account status has been updated to ${status}.`
    }).catch(() => {});
  }
}

export async function getProducts(): Promise<Product[]> {
  return getCollection<Product>('products');
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return (await getProducts()).find((product) => product.slug === slug) ?? null;
}

export async function createProduct(
  product: Omit<Product, 'id'>,
  actorRole = 'ADMIN'
): Promise<Product> {
  const newProduct: Product = { ...product, id: makeId('prod') };
  await insertRecord('products', newProduct);
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: actorRole,
    action: 'PRODUCT_CREATED',
    resource: 'Product',
    resourceId: newProduct.id,
    metadata: {
      name: newProduct.name,
      sku: newProduct.sku,
      price: newProduct.price,
      status: newProduct.status
    }
  }).catch(() => {});
  return newProduct;
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>,
  actorRole = 'ADMIN'
): Promise<void> {
  const previous = await getRecord<Product>('products', id);
  await updateRecord('products', id, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
  const action =
    updates.status === 'DISABLED'
      ? 'PRODUCT_DISABLED'
      : updates.status === 'UNAVAILABLE'
      ? 'PRODUCT_UNAVAILABLE'
      : 'PRODUCT_UPDATED';

  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: actorRole,
    action,
    resource: 'Product',
    resourceId: id,
    metadata: {
      productName: updates.name || previous?.name || id,
      changedFields: Object.keys(updates),
      ...(updates.price !== undefined
        ? { newPrice: updates.price, previousPrice: previous?.price }
        : {}),
      ...(updates.wholesalePrice !== undefined
        ? { newWholesalePrice: updates.wholesalePrice }
        : {}),
      ...(updates.status !== undefined
        ? { newStatus: updates.status, previousStatus: previous?.status }
        : {}),
      ...(updates.category !== undefined ? { newCategory: updates.category } : {})
    }
  }).catch(() => {});
}

export async function deleteProduct(id: string, actorRole = 'ADMIN'): Promise<void> {
  const existing = await getRecord<Product>('products', id);
  await deleteRecord('products', id);
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: actorRole,
    action: 'PRODUCT_DELETED',
    resource: 'Product',
    resourceId: id,
    metadata: { productName: existing?.name || id, sku: existing?.sku }
  }).catch(() => {});
}

export async function getPrograms(): Promise<WellnessProgram[]> {
  return getCollection<WellnessProgram>('wellness_programs');
}

export async function getProgramBySlug(slug: string): Promise<WellnessProgram | null> {
  return (await getPrograms()).find((program) => program.slug === slug) ?? null;
}

export async function createProgram(
  program: Omit<WellnessProgram, 'id'>
): Promise<WellnessProgram> {
  const newProgram: WellnessProgram = { ...program, id: makeId('prog') };
  const created = await insertRecord('wellness_programs', newProgram);
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: 'ADMIN',
    action: 'CMS_UPDATED',
    resource: 'CMS',
    resourceId: created.id,
    metadata: { entity: 'WellnessProgram', action: 'CREATE', name: created.name }
  }).catch(() => {});
  return created;
}

export async function updateProgram(
  id: string,
  updates: Partial<WellnessProgram>
): Promise<void> {
  await updateRecord('wellness_programs', id, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: 'ADMIN',
    action: 'CMS_UPDATED',
    resource: 'CMS',
    resourceId: id,
    metadata: { entity: 'WellnessProgram', action: 'UPDATE', changedFields: Object.keys(updates) }
  }).catch(() => {});
}

export async function deleteProgram(id: string): Promise<void> {
  await deleteRecord('wellness_programs', id);
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: 'ADMIN',
    action: 'CMS_UPDATED',
    resource: 'CMS',
    resourceId: id,
    metadata: { entity: 'WellnessProgram', action: 'DELETE' }
  }).catch(() => {});
}

export async function getPartners(includeUnapproved = false): Promise<Partner[]> {
  const partners = await getCollection<Partner>('partners');
  return includeUnapproved
    ? partners
    : partners.filter((partner) => partner.status === 'APPROVED');
}

export async function getMyPartnerApplications(
  userUid = auth.currentUser?.uid,
  userEmail = auth.currentUser?.email
): Promise<Partner[]> {
  const uid = userUid;
  const email = userEmail?.toLowerCase();
  const partners = await getCollection<Partner>('partners');
  return partners.filter(
    (partner) =>
      (uid && partner.ownerUid === uid) ||
      (email && partner.email.toLowerCase() === email)
  );
}

export async function getPartnerBySlug(slug: string): Promise<Partner | null> {
  const normalized = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return (
    (await getPartners()).find(
      (partner) => partner.slug.toLowerCase() === normalized
    ) ?? null
  );
}

export async function getPartnerById(partnerId: string): Promise<Partner | null> {
  return (
    (await getPartners(true)).find(
      (partner) => partner.id === partnerId || partner.partnerId === partnerId
    ) ?? null
  );
}

export async function registerPartner(data: {
  name: string;
  businessName?: string;
  contactPerson: string;
  email: string;
  phone?: string;
  description: string;
  category: string;
  website?: string;
  address?: string;
  ownerUid?: string;
}): Promise<Partner> {
  const allPartners = await getPartners(true);
  const ownerUid = data.ownerUid || auth.currentUser?.uid;
  const existingApplication = ownerUid
    ? allPartners.find((partner) => partner.ownerUid === ownerUid)
    : undefined;
  if (existingApplication) return existingApplication;

  const nextNumber = String(allPartners.length + 1).padStart(6, '0');
  const partnerId = `WH-P-${nextNumber}`;
  const baseSlug =
    data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
    `partner-${nextNumber}`;
  let slug = baseSlug;
  let suffix = 1;
  while (allPartners.some((partner) => partner.slug === slug)) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const partner: Partner = {
    ...data,
    id: makeId('partner'),
    partnerId,
    slug,
    ...(ownerUid ? { ownerUid } : {}),
    status: 'NEW',
    commissionRate: 0.25,
    memberDiscountRate: 0.15,
    createdAt: new Date().toISOString()
  };
  const created = await insertRecord('partners', partner);
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: auth.currentUser ? 'PARTNER_APPLICANT' : 'PUBLIC_APPLICANT',
    action: 'PARTNER_CREATED',
    resource: 'Partner',
    resourceId: created.id,
    metadata: { partnerId, name: partner.name, status: partner.status }
  }).catch(() => {});
  await dispatchNotificationRecord({
    eventType: 'PARTNER_APPLICATION_RECEIVED',
    recipientEmail: created.email,
    recipientName: created.contactPerson || created.name,
    recipientUid: created.ownerUid,
    partnerId: created.partnerId,
    subject: `Partner Application Received (${created.partnerId}) – Whole Harbor Wellness`,
    body: `Thank you for applying to the Whole Harbor Wellness Partner Ecosystem for ${created.name}. Our clinical partnerships team will review your application and respond shortly.`
  }).catch(() => {});
  return created;
}

export async function updatePartnerStatus(
  id: string,
  status: PartnerStatus,
  adminNotes?: string,
  actorRole = 'ADMIN'
): Promise<void> {
  const existing = await getRecord<Partner>('partners', id);
  const updatedAt = new Date().toISOString();
  const updates: Partial<Partner> = {
    status,
    updatedAt,
    ...(adminNotes !== undefined ? { adminNotes } : {})
  };
  await updateRecord('partners', id, updates);

  if (existing?.ownerUid) {
    const user = await getUserByUid(existing.ownerUid);
    if (user) {
      const wholesaleApprovalStatus: UserProfile['wholesaleApprovalStatus'] =
        status === 'APPROVED'
          ? 'APPROVED'
          : ['DECLINED', 'REJECTED', 'SUSPENDED'].includes(status)
          ? 'DECLINED'
          : 'PENDING';
      await updateRecord('users', user.uid, {
        wholesaleApprovalStatus,
        partnerId: existing.partnerId,
        partnerSlug: existing.slug,
        ...(status === 'APPROVED' && user.role === 'CUSTOMER'
          ? { role: 'PARTNER_OWNER' as UserRole }
          : {}),
        updatedAt
      });
    }
  }

  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: actorRole,
    action: 'PARTNER_STATUS_CHANGED',
    resource: 'Partner',
    resourceId: id,
    metadata: {
      partnerName: existing?.name || id,
      partnerId: existing?.partnerId,
      previousStatus: existing?.status,
      newStatus: status,
      ...(adminNotes ? { adminNotes } : {})
    }
  }).catch(() => {});

  if (existing?.email) {
    const isApproved = status === 'APPROVED';
    await dispatchNotificationRecord({
      eventType: isApproved ? 'PARTNER_APPLICATION_APPROVED' : 'PARTNER_STATUS_UPDATED',
      recipientEmail: existing.email,
      recipientName: existing.contactPerson || existing.name,
      recipientUid: existing.ownerUid,
      partnerId: existing.partnerId,
      subject: isApproved
        ? `Partner Portal Approved (${existing.partnerId}) – Whole Harbor Wellness`
        : `Partner Application Update (${existing.partnerId}): ${status}`,
      body: isApproved
        ? `Congratulations! Your partner storefront (/partner/${existing.slug}) and wholesale kit access for ${existing.name} are now active.`
        : `Your partner status for ${existing.name} is now ${status}.${adminNotes ? ` Note: ${adminNotes}` : ''}`
    }).catch(() => {});
  }
}

export async function updatePartner(
  id: string,
  updates: Partial<Partner>
): Promise<void> {
  await updateRecord('partners', id, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
}

export async function getOrders(
  scope: 'admin' | 'partner' | 'customer' = 'admin'
): Promise<Order[]> {
  const orders = await getCollection<Order & { partnerOwnerUid?: string }>('orders');
  const uid = auth.currentUser?.uid;
  if (scope === 'partner' && uid) {
    return orders.filter((order) => order.partnerOwnerUid === uid);
  }
  if (scope === 'customer' && uid) {
    return orders.filter((order) => order.customerUid === uid);
  }
  return orders;
}

export async function getOrdersByPartner(partnerId: string): Promise<Order[]> {
  return (await getOrders('partner')).filter(
    (order) => order.partnerId === partnerId || order.partnerSlug === partnerId
  );
}

export async function getOrdersByCustomer(customerEmail: string): Promise<Order[]> {
  const normalizedEmail = customerEmail.toLowerCase();
  return (await getOrders('customer')).filter(
    (order) => order.customerEmail.toLowerCase() === normalizedEmail
  );
}

export async function createOrder(
  orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'> & {
    orderNumber?: string;
  }
): Promise<Order> {
  const id = makeId('ord');
  const orderNumber =
    orderData.orderNumber ||
    `WH-ORD-${new Date().getFullYear()}-${globalThis.crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const createdAt = new Date().toISOString();
  const matchedPartner = orderData.partnerId
    ? await getPartnerById(orderData.partnerId)
    : null;
  const order: Order & { partnerOwnerUid?: string } = {
    ...orderData,
    id,
    orderNumber,
    createdAt,
    customerUid: auth.currentUser?.uid || orderData.customerUid || 'guest-cust-id',
    ...(matchedPartner?.ownerUid
      ? { partnerOwnerUid: matchedPartner.ownerUid }
      : {}),
    ...(auth.currentUser
      ? { status: 'PENDING' as const, paymentStatus: 'PENDING' as const }
      : {})
  };
  const created = await insertRecord('orders', order);

  if (order.partnerId && (order.partnerCommission ?? 0) > 0) {
    const earning: PartnerEarning & { partnerOwnerUid?: string } = {
      id: makeId('earn'),
      partnerId: order.partnerId,
      partnerSlug: order.partnerSlug || '',
      ...(matchedPartner?.ownerUid
        ? { partnerOwnerUid: matchedPartner.ownerUid }
        : {}),
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      grossSales: order.subtotal,
      eligibleSales: order.subtotal - order.partnerDiscount,
      commissionRate: matchedPartner?.commissionRate ?? 0.25,
      earningAmount: order.partnerCommission ?? 0,
      status: 'PENDING',
      createdAt
    };
    await insertRecord('partner_earnings', earning).catch(() => {});
  }

  return created;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  await updateRecord('orders', orderId, {
    status,
    updatedAt: new Date().toISOString()
  });
}

export async function getPartnerEarnings(
  partnerId?: string
): Promise<PartnerEarning[]> {
  const earnings = await getCollection<PartnerEarning>('partner_earnings');
  return partnerId
    ? earnings.filter(
        (earning) =>
          earning.partnerId === partnerId || earning.partnerSlug === partnerId
      )
    : earnings;
}

export async function getEarningsByPartner(
  partnerId: string
): Promise<PartnerEarning[]> {
  return getPartnerEarnings(partnerId);
}

export async function updateEarningStatus(
  earningId: string,
  status: 'PENDING' | 'APPROVED' | 'PAID'
): Promise<void> {
  await updateRecord('partner_earnings', earningId, {
    status,
    ...(status === 'PAID'
      ? {
          paidAt: new Date().toISOString(),
          payoutBatchId: `ACH-${Date.now().toString().slice(-6)}`
        }
      : {}),
    updatedAt: new Date().toISOString()
  });
}

export async function getArticles(): Promise<EducationalArticle[]> {
  return getCollection<EducationalArticle>('educational_articles');
}

export async function createArticle(
  article: Omit<EducationalArticle, 'id'>
): Promise<EducationalArticle> {
  const created = await insertRecord('educational_articles', {
    ...article,
    id: makeId('art')
  });
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: 'ADMIN',
    action: 'CMS_UPDATED',
    resource: 'CMS',
    resourceId: created.id,
    metadata: { entity: 'EducationalArticle', action: 'CREATE', title: created.title }
  }).catch(() => {});
  return created;
}

export async function updateArticle(
  id: string,
  updates: Partial<EducationalArticle>
): Promise<void> {
  await updateRecord('educational_articles', id, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: 'ADMIN',
    action: 'CMS_UPDATED',
    resource: 'CMS',
    resourceId: id,
    metadata: { entity: 'EducationalArticle', action: 'UPDATE', changedFields: Object.keys(updates) }
  }).catch(() => {});
}

export async function deleteArticle(id: string): Promise<void> {
  await deleteRecord('educational_articles', id);
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: 'ADMIN',
    action: 'CMS_UPDATED',
    resource: 'CMS',
    resourceId: id,
    metadata: { entity: 'EducationalArticle', action: 'DELETE' }
  }).catch(() => {});
}

export async function getFAQs(): Promise<FAQ[]> {
  return getCollection<FAQ>('faqs');
}

export async function createFaq(faq: Omit<FAQ, 'id'>): Promise<FAQ> {
  const now = new Date().toISOString();
  const created = await insertRecord<FAQ>('faqs', {
    status: 'PUBLISHED' as const,
    createdAt: now,
    ...faq,
    id: makeId('faq')
  });
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: 'ADMIN',
    action: 'CMS_UPDATED',
    resource: 'CMS',
    resourceId: created.id,
    metadata: { entity: 'FAQ', action: 'CREATE', question: created.question }
  }).catch(() => {});
  return created;
}

export async function updateFaq(id: string, updates: Partial<FAQ>): Promise<void> {
  await updateRecord('faqs', id, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: 'ADMIN',
    action: 'CMS_UPDATED',
    resource: 'CMS',
    resourceId: id,
    metadata: { entity: 'FAQ', action: 'UPDATE', changedFields: Object.keys(updates) }
  }).catch(() => {});
}

export async function deleteFaq(id: string): Promise<void> {
  await deleteRecord('faqs', id);
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: 'ADMIN',
    action: 'CMS_UPDATED',
    resource: 'CMS',
    resourceId: id,
    metadata: { entity: 'FAQ', action: 'DELETE' }
  }).catch(() => {});
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return getCollection<Testimonial>('testimonials');
}

export async function createTestimonial(
  testimonial: Omit<Testimonial, 'id'>
): Promise<Testimonial> {
  const now = new Date().toISOString();
  const created = await insertRecord<Testimonial>('testimonials', {
    status: 'PUBLISHED' as const,
    createdAt: now,
    ...testimonial,
    id: makeId('testimonial')
  });
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: 'ADMIN',
    action: 'CMS_UPDATED',
    resource: 'CMS',
    resourceId: created.id,
    metadata: { entity: 'Testimonial', action: 'CREATE', name: created.name }
  }).catch(() => {});
  return created;
}

export async function updateTestimonial(
  id: string,
  updates: Partial<Testimonial>
): Promise<void> {
  await updateRecord('testimonials', id, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: 'ADMIN',
    action: 'CMS_UPDATED',
    resource: 'CMS',
    resourceId: id,
    metadata: { entity: 'Testimonial', action: 'UPDATE', changedFields: Object.keys(updates) }
  }).catch(() => {});
}

export async function deleteTestimonial(id: string): Promise<void> {
  await deleteRecord('testimonials', id);
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: 'ADMIN',
    action: 'CMS_UPDATED',
    resource: 'CMS',
    resourceId: id,
    metadata: { entity: 'Testimonial', action: 'DELETE' }
  }).catch(() => {});
}

export async function getCmsPages(): Promise<CmsPageContent[]> {
  return getCollection<CmsPageContent>('cms_pages');
}

export async function getCmsPageBySlug(slug: string): Promise<CmsPageContent | null> {
  const normalized = slug.trim().toLowerCase();
  const pages = await getCmsPages();
  return (
    pages.find((page) => page.slug.toLowerCase() === normalized) ||
    INITIAL_CMS_PAGES.find((page) => page.slug.toLowerCase() === normalized) ||
    null
  );
}

export async function upsertCmsPage(
  page: Omit<CmsPageContent, 'id' | 'createdAt' | 'updatedAt'> & {
    id?: string;
    createdAt?: string;
  }
): Promise<CmsPageContent> {
  const now = new Date().toISOString();
  const id = page.id || makeId('cms');
  const record: CmsPageContent = {
    ...page,
    id,
    createdAt: page.createdAt || now,
    updatedAt: now
  };
  const saved = await upsertRecord('cms_pages', id, record);
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: 'ADMIN',
    action: 'CMS_UPDATED',
    resource: 'CMS',
    resourceId: saved.id,
    metadata: { entity: 'CmsPage', slug: saved.slug, status: saved.status }
  }).catch(() => {});
  return saved;
}

export async function deleteCmsPage(id: string): Promise<void> {
  await deleteRecord('cms_pages', id);
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: 'ADMIN',
    action: 'CMS_UPDATED',
    resource: 'CMS',
    resourceId: id,
    metadata: { entity: 'CmsPage', action: 'DELETE' }
  }).catch(() => {});
}

export async function getMediaAssets(): Promise<MediaAsset[]> {
  return getCollection<MediaAsset>('media_assets');
}

export async function createMediaAsset(
  asset: Omit<MediaAsset, 'id' | 'createdAt'>
): Promise<MediaAsset> {
  const now = new Date().toISOString();
  const created = await insertRecord('media_assets', {
    ...asset,
    id: makeId('media'),
    createdAt: now,
    updatedAt: now
  });
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: 'ADMIN',
    action: 'CMS_UPDATED',
    resource: 'CMS',
    resourceId: created.id,
    metadata: { entity: 'MediaAsset', action: 'CREATE', title: created.title }
  }).catch(() => {});
  return created;
}

export async function updateMediaAsset(
  id: string,
  updates: Partial<MediaAsset>
): Promise<void> {
  await updateRecord('media_assets', id, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: 'ADMIN',
    action: 'CMS_UPDATED',
    resource: 'CMS',
    resourceId: id,
    metadata: { entity: 'MediaAsset', action: 'UPDATE', changedFields: Object.keys(updates) }
  }).catch(() => {});
}

export async function deleteMediaAsset(id: string): Promise<void> {
  await deleteRecord('media_assets', id);
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: 'ADMIN',
    action: 'CMS_UPDATED',
    resource: 'CMS',
    resourceId: id,
    metadata: { entity: 'MediaAsset', action: 'DELETE' }
  }).catch(() => {});
}

export async function getNotifications(partnerId?: string): Promise<NotificationRecord[]> {
  const all = newestFirst(await getCollection<NotificationRecord>('notifications'));
  if (!partnerId) return all;
  return all.filter((item) => item.partnerId === partnerId);
}

export async function createNotification(
  payload: Omit<NotificationRecord, 'id' | 'createdAt'>
): Promise<NotificationRecord> {
  const record: NotificationRecord = {
    ...payload,
    id: makeId('notif'),
    read: payload.read ?? false,
    createdAt: new Date().toISOString()
  };
  return insertRecord('notifications', record);
}

export async function markNotificationRead(id: string): Promise<void> {
  await updateRecord('notifications', id, { read: true });
}

export async function dispatchNotificationRecord(params: {
  eventType: NotificationEventType;
  recipientEmail: string;
  recipientName?: string;
  recipientUid?: string;
  partnerId?: string;
  subject: string;
  body: string;
}): Promise<NotificationRecord> {
  const webhookUrl = import.meta.env.VITE_NOTIFICATION_WEBHOOK_URL?.trim();
  let channel: NotificationRecord['channel'] = 'IN_APP_LEDGER';
  let deliveryStatus: NotificationRecord['deliveryStatus'] = 'LOGGED';

  if (webhookUrl && /^https?:\/\//i.test(webhookUrl)) {
    channel = 'EMAIL_WEBHOOK';
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: params.eventType,
          to: params.recipientEmail,
          recipientName: params.recipientName,
          partnerId: params.partnerId,
          subject: params.subject,
          body: params.body,
          timestamp: new Date().toISOString()
        })
      });
      deliveryStatus = response.ok ? 'SENT' : 'FAILED';
    } catch {
      deliveryStatus = 'FAILED';
    }
  }

  const saved = await createNotification({
    eventType: params.eventType,
    recipientEmail: params.recipientEmail,
    ...(params.recipientName ? { recipientName: params.recipientName } : {}),
    ...(params.recipientUid ? { recipientUid: params.recipientUid } : {}),
    ...(params.partnerId ? { partnerId: params.partnerId } : {}),
    subject: params.subject,
    body: params.body,
    channel,
    deliveryStatus,
    read: false
  });

  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: isFirebaseAdminSession() ? 'ADMIN' : 'SYSTEM',
    action: 'NOTIFICATION_DISPATCHED',
    resource: 'Notification',
    resourceId: saved.id,
    metadata: {
      eventType: saved.eventType,
      recipientEmail: saved.recipientEmail,
      channel: saved.channel,
      deliveryStatus: saved.deliveryStatus
    }
  }).catch(() => {});

  return saved;
}

export async function createPartner(
  partner: Omit<Partner, 'id'>
): Promise<Partner> {
  const allPartners = await getPartners(true);
  const nextNumber = String(allPartners.length + 1).padStart(6, '0');
  const newPartner: Partner = {
    ...partner,
    id: makeId('partner'),
    partnerId: partner.partnerId || `WH-P-${nextNumber}`,
    ownerUid:
      partner.ownerUid ||
      (auth.currentUser?.email?.toLowerCase() === partner.email.toLowerCase()
        ? auth.currentUser.uid
        : undefined),
    status: partner.status || 'NEW'
  };
  const created = await insertRecord('partners', newPartner);
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: auth.currentUser ? 'PARTNER_APPLICANT' : 'PUBLIC_APPLICANT',
    action: 'PARTNER_CREATED',
    resource: 'Partner',
    resourceId: created.id,
    metadata: {
      partnerId: created.partnerId,
      name: created.name,
      status: created.status
    }
  }).catch(() => {});
  await dispatchNotificationRecord({
    eventType: 'PARTNER_APPLICATION_RECEIVED',
    recipientEmail: created.email,
    recipientName: created.contactPerson || created.name,
    recipientUid: created.ownerUid,
    partnerId: created.partnerId,
    subject: `Partner Application Received (${created.partnerId}) – Whole Harbor Wellness`,
    body: `Your clinic or studio partner record for ${created.name} has been created and queued for review.`
  }).catch(() => {});
  return created;
}

export async function createAuditLog(
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'>
): Promise<AuditLogEntry> {
  const auditLog: AuditLogEntry = {
    ...entry,
    id: makeId('audit'),
    timestamp: new Date().toISOString()
  };
  return insertRecord('audit_logs', auditLog);
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  return newestFirst(await getCollection<AuditLogEntry>('audit_logs'));
}

export async function createInquiry(
  data: Omit<ContactInquiry, 'id' | 'status' | 'createdAt'>
): Promise<ContactInquiry> {
  const inquiry: ContactInquiry = {
    ...data,
    id: makeId('inq'),
    status: 'NEW',
    userId: auth.currentUser?.uid,
    createdAt: new Date().toISOString()
  };
  return insertRecord('inquiries', inquiry);
}

export async function getInquiries(): Promise<ContactInquiry[]> {
  return newestFirst(await getCollection<ContactInquiry>('inquiries'));
}

export async function updateInquiryStatus(
  id: string,
  status: ContactInquiry['status']
): Promise<void> {
  await updateRecord('inquiries', id, {
    status,
    updatedAt: new Date().toISOString()
  });
}

export async function logAnalyticsEvent(
  event: Omit<AnalyticsEvent, 'id' | 'timestamp'>
): Promise<AnalyticsEvent> {
  const analyticsEvent: AnalyticsEvent = {
    ...event,
    id: makeId('evt'),
    userId: auth.currentUser?.uid,
    timestamp: new Date().toISOString()
  };
  return insertRecord('analytics_events', analyticsEvent);
}

export async function getAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  return newestFirst(await getCollection<AnalyticsEvent>('analytics_events'));
}

export const getFaqs = getFAQs;
export const updatePartnerEarningStatus = updateEarningStatus;

export const dbService = {
  seedInitialDatabase,
  getUsers,
  getUserByUid,
  upsertUserProfile,
  updateUserRole,
  updateUserStatus,
  getProducts,
  subscribeToCollections,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getPrograms,
  getProgramBySlug,
  createProgram,
  updateProgram,
  deleteProgram,
  getPartners,
  getMyPartnerApplications,
  getPartnerBySlug,
  getPartnerById,
  registerPartner,
  createPartner,
  updatePartnerStatus,
  updatePartner,
  getOrders,
  getOrdersByPartner,
  getOrdersByCustomer,
  createOrder,
  updateOrderStatus,
  getPartnerEarnings,
  getEarningsByPartner,
  updateEarningStatus,
  updatePartnerEarningStatus,
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getFAQs,
  getFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getCmsPages,
  getCmsPageBySlug,
  upsertCmsPage,
  deleteCmsPage,
  getMediaAssets,
  createMediaAsset,
  updateMediaAsset,
  deleteMediaAsset,
  getNotifications,
  createNotification,
  markNotificationRead,
  dispatchNotificationRecord,
  createAuditLog,
  getAuditLogs,
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  logAnalyticsEvent,
  getAnalyticsEvents
};

export default dbService;
