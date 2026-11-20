import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  Query
} from 'firebase/firestore';
import {
  auth,
  db,
  ensureFirestoreReachable,
  handleFirestoreError,
  OperationType
} from '../lib/firebase.ts';
import {
  Product,
  WellnessProgram,
  Partner,
  Order,
  PartnerEarning,
  EducationalArticle,
  FAQ,
  Testimonial,
  OrderStatus,
  PartnerStatus,
  AuditLogEntry,
  UserProfile,
  UserRole,
  ContactInquiry,
  AnalyticsEvent
} from '../types/index.ts';
import {
  INITIAL_PROGRAMS,
  INITIAL_PARTNERS,
  INITIAL_ORDERS,
  INITIAL_EARNINGS,
  INITIAL_ARTICLES,
  INITIAL_FAQS,
  INITIAL_TESTIMONIALS
} from '../lib/seedData.ts';
import { WHW_PRODUCTS } from '../lib/whwCatalog.ts';
import { TEST_VARS } from '../lib/testVariables.ts';

// Local storage keys for instant responsiveness and resilient offline fallback
const STORAGE_PREFIX = 'whole_harbor_';
const getLocal = <T>(key: string, fallback: T): T => {
  try {
    const val = localStorage.getItem(STORAGE_PREFIX + key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};
const setLocal = <T>(key: string, data: T) => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch {
    // ignore
  }
};

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'admin-kelvin',
    uid: 'admin-kelvin',
    email: TEST_VARS.auth.adminEmail,
    displayName: 'Kelvin Director of Wellness',
    role: 'ADMIN',
    status: 'ACTIVE',
    wholesaleApprovalStatus: 'APPROVED',
    mfaEnabled: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'partner-equinox-owner',
    uid: 'partner-equinox-owner',
    email: 'julian@vancemedical.com',
    displayName: 'Dr. Julian Vance',
    businessName: 'Equinox Longevity Suite',
    role: 'PARTNER_OWNER',
    status: 'ACTIVE',
    partnerId: 'WH-P-000001',
    partnerSlug: 'equinox-longevity',
    wholesaleApprovalStatus: 'APPROVED',
    createdAt: '2026-01-05T00:00:00Z'
  },
  {
    id: 'partner-harbor-owner',
    uid: 'partner-harbor-owner',
    email: 'helena@harborsanctuary.com',
    displayName: 'Dr. Helena Vance',
    businessName: 'Harbor Sanctuary Beverly Hills',
    role: 'PARTNER_OWNER',
    status: 'ACTIVE',
    partnerId: 'WH-P-000002',
    partnerSlug: 'harbor-sanctuary',
    wholesaleApprovalStatus: 'APPROVED',
    createdAt: '2026-01-12T00:00:00Z'
  },
  {
    id: 'cust-elena-r',
    uid: 'cust-elena-r',
    email: 'elena.rostova@example.com',
    displayName: 'Elena Rostova',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    wholesaleApprovalStatus: 'NONE',
    createdAt: '2026-02-01T00:00:00Z'
  },
  {
    id: 'cust-marcus-c',
    uid: 'cust-marcus-c',
    email: 'marcus.chen@example.com',
    displayName: 'Marcus Chen',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    wholesaleApprovalStatus: 'NONE',
    createdAt: '2026-02-08T00:00:00Z'
  },
  {
    id: 'cust-sarah-m',
    uid: 'cust-sarah-m',
    email: 'sarah.miller@example.com',
    displayName: 'Sarah Miller',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    wholesaleApprovalStatus: 'NONE',
    createdAt: '2026-02-14T00:00:00Z'
  }
];

function isPermissionError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('Missing or insufficient permissions') ||
    message.includes('permission-denied')
  );
}

function isBootstrappedAdminAuth(): boolean {
  const email = auth.currentUser?.email?.toLowerCase() || '';
  return email === 'muchuikelvin423@gmail.com' || email === 'admin@wholeharborwellness.com';
}

// Safe timeout wrapper for queries so UI never stalls
const safeQuery = async <T>(promise: Promise<T>, timeoutMs = 4500): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore query timeout')), timeoutMs)
    )
  ]);
};

async function safeGetCollection<T>(
  collectionName: string,
  customQuery?: Query
): Promise<T[] | null> {
  const reachable = await ensureFirestoreReachable();
  if (!reachable) return null;

  try {
    const target = customQuery || collection(db, collectionName);
    const snap = await safeQuery(getDocs(target));
    if (!snap.empty) {
      return snap.docs.map(d => ({ ...(d.data() as Record<string, unknown>), id: d.id } as T));
    }
    return [];
  } catch (e) {
    if (isPermissionError(e)) {
      if (auth.currentUser) {
        try {
          handleFirestoreError(e, OperationType.LIST, collectionName);
        } catch {
          // Graceful fallback after structured error log
        }
      }
      return null;
    }
    return null;
  }
}

async function safeWriteOp(
  op: () => Promise<void>,
  operationType: OperationType,
  path: string
): Promise<boolean> {
  const reachable = await ensureFirestoreReachable();
  if (!reachable) return false;

  try {
    await safeQuery(op(), 4500);
    return true;
  } catch (e) {
    if (isPermissionError(e) && auth.currentUser) {
      handleFirestoreError(e, operationType, path);
    }
    return false;
  }
}

async function batchSeedCollection<T extends { id?: string; uid?: string }>(
  collectionName: string,
  items: T[]
): Promise<void> {
  if (!items.length) return;
  const batch = writeBatch(db);
  for (const item of items) {
    const docId = item.id || item.uid;
    if (!docId) continue;
    batch.set(doc(db, collectionName, docId), item, { merge: true });
  }
  await safeQuery(batch.commit(), 6000);
}

// --- INITIAL SEEDING HELPER ---
let isSeeded = false;
const CATALOG_VERSION = 'whw_prices_v4';

export async function seedInitialDatabase(): Promise<void> {
  if (isSeeded) return;
  try {
    const syncedVersion = localStorage.getItem(STORAGE_PREFIX + 'catalog_version');
    if (syncedVersion !== CATALOG_VERSION) {
      setLocal('products', WHW_PRODUCTS);
      localStorage.setItem(STORAGE_PREFIX + 'catalog_version', CATALOG_VERSION);
    }

    // Ensure local cache has seeded user accounts ready
    const existingLocalUsers = getLocal<UserProfile[]>('users', []);
    if (!existingLocalUsers.length) {
      setLocal('users', INITIAL_USERS);
    }

    const reachable = await ensureFirestoreReachable();
    if (!reachable) {
      isSeeded = true;
      return;
    }

    // Seed public catalog & content collections when admin is authenticated
    if (auth.currentUser && isBootstrappedAdminAuth()) {
      const seedTargets: Array<{ name: string; data: Array<{ id?: string; uid?: string }> }> = [
        { name: 'products', data: WHW_PRODUCTS },
        { name: 'wellness_programs', data: INITIAL_PROGRAMS },
        { name: 'partners', data: INITIAL_PARTNERS },
        { name: 'users', data: INITIAL_USERS },
        { name: 'orders', data: INITIAL_ORDERS },
        { name: 'partner_earnings', data: INITIAL_EARNINGS },
        { name: 'educational_articles', data: INITIAL_ARTICLES },
        { name: 'faqs', data: INITIAL_FAQS },
        { name: 'testimonials', data: INITIAL_TESTIMONIALS }
      ];

      await Promise.all(
        seedTargets.map(async ({ name, data }) => {
          try {
            const snap = await safeQuery(getDocs(collection(db, name)));
            if (snap.empty) {
              await batchSeedCollection(name, data);
            }
          } catch {
            // Skip collections blocked for non-admin sessions
          }
        })
      );
    }

    isSeeded = true;
  } catch {
    isSeeded = true;
  }
}

// --- USERS & ROLES (CLIENTS, PARTNERS, ADMINS) ---
export async function getUsers(): Promise<UserProfile[]> {
  if (auth.currentUser) {
    const items = await safeGetCollection<UserProfile>(
      'users',
      isBootstrappedAdminAuth()
        ? collection(db, 'users')
        : query(collection(db, 'users'), where('uid', '==', auth.currentUser.uid))
    );
    if (items && items.length > 0) {
      if (isBootstrappedAdminAuth()) {
        setLocal('users', items);
      }
      return items;
    }
  }
  return getLocal<UserProfile[]>('users', INITIAL_USERS);
}

export async function getUserByUid(uid: string): Promise<UserProfile | null> {
  const reachable = await ensureFirestoreReachable();
  if (reachable && auth.currentUser) {
    try {
      const snap = await safeQuery(getDoc(doc(db, 'users', uid)));
      if (snap.exists()) {
        return { ...(snap.data() as UserProfile), id: snap.id };
      }
    } catch (e) {
      if (isPermissionError(e) && auth.currentUser.uid === uid) {
        handleFirestoreError(e, OperationType.GET, `users/${uid}`);
      }
    }
  }
  const localUsers = getLocal<UserProfile[]>('users', INITIAL_USERS);
  return localUsers.find(u => u.uid === uid || u.id === uid) || null;
}

export async function upsertUserProfile(user: UserProfile): Promise<UserProfile> {
  const cleanUser: UserProfile = {
    ...user,
    id: user.uid,
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (auth.currentUser && (auth.currentUser.uid === cleanUser.uid || isBootstrappedAdminAuth())) {
    await safeWriteOp(
      () => setDoc(doc(db, 'users', cleanUser.uid), cleanUser, { merge: true }),
      OperationType.WRITE,
      `users/${cleanUser.uid}`
    ).catch(() => false);
  }

  const localUsers = getLocal<UserProfile[]>('users', INITIAL_USERS);
  const existsIdx = localUsers.findIndex(u => u.uid === cleanUser.uid || u.email === cleanUser.email);
  const updated =
    existsIdx >= 0
      ? localUsers.map((u, i) => (i === existsIdx ? { ...u, ...cleanUser } : u))
      : [cleanUser, ...localUsers];
  setLocal('users', updated);

  return cleanUser;
}

export async function updateUserRole(
  uid: string,
  role: UserRole,
  wholesaleApprovalStatus?: UserProfile['wholesaleApprovalStatus']
): Promise<void> {
  const updatedAt = new Date().toISOString();
  const payload: Partial<UserProfile> = {
    role,
    updatedAt,
    ...(wholesaleApprovalStatus !== undefined ? { wholesaleApprovalStatus } : {})
  };

  if (auth.currentUser) {
    await safeWriteOp(
      () => updateDoc(doc(db, 'users', uid), payload),
      OperationType.UPDATE,
      `users/${uid}`
    );
  }

  const localUsers = getLocal<UserProfile[]>('users', INITIAL_USERS);
  const updated = localUsers.map(u => (u.uid === uid || u.id === uid ? { ...u, ...payload } : u));
  setLocal('users', updated);

  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: 'ADMIN',
    action: 'SECURITY_EVENT',
    resource: 'User',
    resourceId: uid,
    metadata: { role, wholesaleApprovalStatus }
  });
}

export async function updateUserStatus(
  uid: string,
  status: UserProfile['status'],
  partnerId?: string,
  partnerSlug?: string
): Promise<void> {
  const updatedAt = new Date().toISOString();
  const payload: Partial<UserProfile> = {
    status,
    updatedAt,
    ...(partnerId !== undefined ? { partnerId } : {}),
    ...(partnerSlug !== undefined ? { partnerSlug } : {})
  };

  if (auth.currentUser) {
    await safeWriteOp(
      () => updateDoc(doc(db, 'users', uid), payload),
      OperationType.UPDATE,
      `users/${uid}`
    );
  }

  const localUsers = getLocal<UserProfile[]>('users', INITIAL_USERS);
  const updated = localUsers.map(u => (u.uid === uid || u.id === uid ? { ...u, ...payload } : u));
  setLocal('users', updated);

  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: 'ADMIN',
    action: 'SECURITY_EVENT',
    resource: 'User',
    resourceId: uid,
    metadata: { status, partnerId, partnerSlug }
  });
}

// --- PRODUCTS ---
export async function getProducts(): Promise<Product[]> {
  const syncedVersion = localStorage.getItem(STORAGE_PREFIX + 'catalog_version');
  if (syncedVersion !== CATALOG_VERSION) {
    setLocal('products', WHW_PRODUCTS);
    localStorage.setItem(STORAGE_PREFIX + 'catalog_version', CATALOG_VERSION);
  }

  const items = await safeGetCollection<Product>('products');
  if (items && items.length > 0) {
    setLocal('products', items);
    return items;
  }

  return getLocal('products', WHW_PRODUCTS);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await getProducts();
  return all.find(p => p.slug === slug) || null;
}

export async function createProduct(prod: Omit<Product, 'id'>, actorRole = 'ADMIN'): Promise<Product> {
  const id = 'prod-' + Date.now();
  const newProduct: Product = { ...prod, id };
  if (auth.currentUser) {
    await safeWriteOp(() => setDoc(doc(db, 'products', id), newProduct), OperationType.CREATE, `products/${id}`);
  }
  const current = getLocal('products', WHW_PRODUCTS);
  const updated = [newProduct, ...current];
  setLocal('products', updated);
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: actorRole,
    action: 'PRODUCT_CREATED',
    resource: 'Product',
    resourceId: id,
    metadata: { name: newProduct.name, sku: newProduct.sku, price: newProduct.price, status: newProduct.status }
  });
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>, actorRole = 'ADMIN'): Promise<void> {
  const payload = { ...updates, updatedAt: new Date().toISOString() };
  if (auth.currentUser) {
    await safeWriteOp(() => updateDoc(doc(db, 'products', id), payload), OperationType.UPDATE, `products/${id}`);
  }
  const current = getLocal('products', WHW_PRODUCTS);
  const existing = current.find(p => p.id === id);
  const updated = current.map(p => (p.id === id ? { ...p, ...payload } : p));
  setLocal('products', updated);

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
      productName: updates.name || existing?.name || id,
      changedFields: Object.keys(updates),
      ...(updates.price !== undefined ? { newPrice: updates.price, previousPrice: existing?.price } : {}),
      ...(updates.wholesalePrice !== undefined ? { newWholesalePrice: updates.wholesalePrice } : {}),
      ...(updates.status !== undefined ? { newStatus: updates.status, previousStatus: existing?.status } : {}),
      ...(updates.category !== undefined ? { newCategory: updates.category } : {})
    }
  });
}

export async function deleteProduct(id: string, actorRole = 'ADMIN'): Promise<void> {
  if (auth.currentUser) {
    await safeWriteOp(() => deleteDoc(doc(db, 'products', id)), OperationType.DELETE, `products/${id}`);
  }
  const current = getLocal('products', WHW_PRODUCTS);
  const existing = current.find(p => p.id === id);
  const updated = current.filter(p => p.id !== id);
  setLocal('products', updated);
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: actorRole,
    action: 'PRODUCT_DELETED',
    resource: 'Product',
    resourceId: id,
    metadata: { productName: existing?.name || id, sku: existing?.sku }
  });
}

// --- WELLNESS PROGRAMS ---
export async function getPrograms(): Promise<WellnessProgram[]> {
  const items = await safeGetCollection<WellnessProgram>('wellness_programs');
  if (items && items.length > 0) {
    setLocal('programs', items);
    return items;
  }
  return getLocal('programs', INITIAL_PROGRAMS);
}

export async function getProgramBySlug(slug: string): Promise<WellnessProgram | null> {
  const all = await getPrograms();
  return all.find(p => p.slug === slug) || null;
}

export async function createProgram(prog: Omit<WellnessProgram, 'id'>): Promise<WellnessProgram> {
  const id = 'prog-' + Date.now();
  const newProg: WellnessProgram = { ...prog, id };
  if (auth.currentUser) {
    await safeWriteOp(
      () => setDoc(doc(db, 'wellness_programs', id), newProg),
      OperationType.CREATE,
      `wellness_programs/${id}`
    );
  }
  const current = getLocal('programs', INITIAL_PROGRAMS);
  const updated = [newProg, ...current];
  setLocal('programs', updated);
  return newProg;
}

export async function updateProgram(id: string, updates: Partial<WellnessProgram>): Promise<void> {
  if (auth.currentUser) {
    await safeWriteOp(
      () => updateDoc(doc(db, 'wellness_programs', id), updates),
      OperationType.UPDATE,
      `wellness_programs/${id}`
    );
  }
  const current = getLocal('programs', INITIAL_PROGRAMS);
  setLocal('programs', current.map(p => (p.id === id ? { ...p, ...updates } : p)));
}

export async function deleteProgram(id: string): Promise<void> {
  if (auth.currentUser) {
    await safeWriteOp(
      () => deleteDoc(doc(db, 'wellness_programs', id)),
      OperationType.DELETE,
      `wellness_programs/${id}`
    );
  }
  const current = getLocal('programs', INITIAL_PROGRAMS);
  setLocal('programs', current.filter(p => p.id !== id));
}

// --- PARTNERS ---
export async function getPartners(includeUnapproved = false): Promise<Partner[]> {
  const partnerQuery =
    includeUnapproved && isBootstrappedAdminAuth()
      ? collection(db, 'partners')
      : query(collection(db, 'partners'), where('status', '==', 'APPROVED'));

  const items = await safeGetCollection<Partner>('partners', partnerQuery);
  if (items && items.length > 0) {
    if (includeUnapproved) {
      setLocal('partners', items);
    }
    return items;
  }
  return getLocal('partners', INITIAL_PARTNERS);
}

export async function getMyPartnerApplications(): Promise<Partner[]> {
  if (auth.currentUser) {
    const items = await safeGetCollection<Partner>(
      'partners',
      query(collection(db, 'partners'), where('ownerUid', '==', auth.currentUser.uid))
    );
    if (items && items.length > 0) {
      return items;
    }
  }
  const email = auth.currentUser?.email?.toLowerCase();
  const uid = auth.currentUser?.uid;
  const local = getLocal('partners', INITIAL_PARTNERS);
  return local.filter(
    p => (uid && p.ownerUid === uid) || (email && p.email.toLowerCase() === email)
  );
}

export async function getPartnerBySlug(slug: string): Promise<Partner | null> {
  const all = await getPartners();
  const normalized = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return all.find(p => p.slug.toLowerCase() === normalized) || null;
}

export async function getPartnerById(partnerId: string): Promise<Partner | null> {
  const all = await getPartners();
  return all.find(p => p.id === partnerId || p.partnerId === partnerId) || null;
}

export async function registerPartner(data: {
  name: string;
  contactPerson: string;
  email: string;
  phone?: string;
  description: string;
  category: string;
  website?: string;
  address?: string;
}): Promise<Partner> {
  const all = await getPartners(true);
  const nextNum = (all.length + 1).toString().padStart(6, '0');
  const partnerId = `WH-P-${nextNum}`;

  let baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!baseSlug) baseSlug = 'partner-' + nextNum;
  let slug = baseSlug;
  let counter = 1;
  while (all.some(p => p.slug === slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const id = 'partner-' + Date.now();
  const newPartner: Partner = {
    id,
    partnerId,
    name: data.name,
    slug,
    contactPerson: data.contactPerson,
    email: data.email,
    phone: data.phone,
    description: data.description,
    category: data.category,
    website: data.website,
    address: data.address,
    ownerUid: auth.currentUser?.uid,
    status: 'NEW',
    commissionRate: 0.25,
    memberDiscountRate: 0.15,
    createdAt: new Date().toISOString()
  };

  if (auth.currentUser) {
    await safeWriteOp(() => setDoc(doc(db, 'partners', id), newPartner), OperationType.CREATE, `partners/${id}`);
  }
  const current = getLocal('partners', INITIAL_PARTNERS);
  setLocal('partners', [newPartner, ...current]);
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: auth.currentUser ? 'PARTNER_APPLICANT' : 'PUBLIC_APPLICANT',
    action: 'PARTNER_CREATED',
    resource: 'Partner',
    resourceId: id,
    metadata: { partnerId, name: data.name, status: 'NEW' }
  });
  return newPartner;
}

export async function updatePartnerStatus(
  id: string,
  status: PartnerStatus,
  adminNotes?: string,
  actorRole = 'ADMIN'
): Promise<void> {
  const updatedAt = new Date().toISOString();
  const payload: Partial<Partner> = {
    status,
    updatedAt,
    ...(adminNotes !== undefined ? { adminNotes } : {})
  };
  if (auth.currentUser) {
    await safeWriteOp(() => updateDoc(doc(db, 'partners', id), payload), OperationType.UPDATE, `partners/${id}`);
  }
  const current = getLocal('partners', INITIAL_PARTNERS);
  const existing = current.find(p => p.id === id);
  const updated = current.map(p => (p.id === id ? { ...p, ...payload } : p));
  setLocal('partners', updated);

  // Sync wholesaleApprovalStatus & partner link on the corresponding user profile
  if (existing) {
    const mappedWholesaleStatus: UserProfile['wholesaleApprovalStatus'] =
      status === 'APPROVED'
        ? 'APPROVED'
        : status === 'DECLINED' || status === 'REJECTED' || status === 'SUSPENDED'
        ? 'DECLINED'
        : 'PENDING';
    const localUsers = getLocal<UserProfile[]>('users', INITIAL_USERS);
    const matchingUser = localUsers.find(
      u =>
        (existing.ownerUid && u.uid === existing.ownerUid) ||
        u.email.toLowerCase() === existing.email.toLowerCase()
    );
    const targetUid = existing.ownerUid || matchingUser?.uid;
    if (targetUid) {
      const userSyncPayload: Partial<UserProfile> = {
        wholesaleApprovalStatus: mappedWholesaleStatus,
        partnerId: existing.partnerId,
        partnerSlug: existing.slug,
        ...(status === 'APPROVED' && (!matchingUser || matchingUser.role === 'CUSTOMER')
          ? { role: 'PARTNER_OWNER' as UserRole }
          : {}),
        updatedAt
      };
      if (auth.currentUser) {
        await safeWriteOp(
          () => updateDoc(doc(db, 'users', targetUid), userSyncPayload),
          OperationType.UPDATE,
          `users/${targetUid}`
        ).catch(() => false);
      }
      setLocal(
        'users',
        localUsers.map(u => (u.uid === targetUid ? { ...u, ...userSyncPayload } : u))
      );
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
  });
}

export async function updatePartner(id: string, updates: Partial<Partner>): Promise<void> {
  if (auth.currentUser) {
    await safeWriteOp(
      () => updateDoc(doc(db, 'partners', id), { ...updates, updatedAt: new Date().toISOString() }),
      OperationType.UPDATE,
      `partners/${id}`
    );
  }
  const current = getLocal('partners', INITIAL_PARTNERS);
  const updated = current.map(p =>
    p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
  );
  setLocal('partners', updated);
}

// --- ORDERS & EARNINGS ---
export async function getOrders(scope: 'admin' | 'partner' | 'customer' = 'admin'): Promise<Order[]> {
  if (auth.currentUser) {
    if (!isBootstrappedAdminAuth() && scope === 'admin') {
      return getLocal('orders', INITIAL_ORDERS);
    }

    let orderQuery: Query = collection(db, 'orders');
    if (!isBootstrappedAdminAuth()) {
      orderQuery =
        scope === 'partner'
          ? query(collection(db, 'orders'), where('partnerOwnerUid', '==', auth.currentUser.uid))
          : query(collection(db, 'orders'), where('customerUid', '==', auth.currentUser.uid));
    }

    const items = await safeGetCollection<Order>('orders', orderQuery);
    if (items && items.length > 0) {
      if (scope === 'admin' && isBootstrappedAdminAuth()) {
        setLocal('orders', items);
      }
      return items;
    }
  }
  return getLocal('orders', INITIAL_ORDERS);
}

export async function getOrdersByPartner(partnerId: string): Promise<Order[]> {
  const all = await getOrders('partner');
  return all.filter(o => o.partnerId === partnerId || o.partnerSlug === partnerId);
}

export async function getOrdersByCustomer(customerEmail: string): Promise<Order[]> {
  const all = await getOrders('customer');
  return all.filter(o => o.customerEmail.toLowerCase() === customerEmail.toLowerCase());
}

export async function createOrder(
  orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'> & { orderNumber?: string }
): Promise<Order> {
  const id = 'ord-' + Date.now();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = orderData.orderNumber || `WH-ORD-2026-${randomSuffix}`;
  const createdAt = new Date().toISOString();

  let partnerOwnerUid: string | undefined;
  if (orderData.partnerId) {
    const matchedPartner = await getPartnerById(orderData.partnerId);
    partnerOwnerUid = matchedPartner?.ownerUid;
  }

  const newOrder: Order = {
    ...orderData,
    customerUid: auth.currentUser?.uid || orderData.customerUid || 'guest-cust-id',
    ...(partnerOwnerUid ? { partnerOwnerUid } : {}),
    id,
    orderNumber,
    createdAt
  };

  if (auth.currentUser) {
    await safeWriteOp(() => setDoc(doc(db, 'orders', id), newOrder), OperationType.CREATE, `orders/${id}`);
  }

  const currentOrders = getLocal('orders', INITIAL_ORDERS);
  setLocal('orders', [newOrder, ...currentOrders]);

  // If order was referred by an approved partner, create an auditable PartnerEarning record
  if (newOrder.partnerId && newOrder.partnerCommission && newOrder.partnerCommission > 0) {
    const earningId = 'earn-' + Date.now();
    const newEarning: PartnerEarning & { partnerOwnerUid?: string } = {
      id: earningId,
      partnerId: newOrder.partnerId,
      partnerSlug: newOrder.partnerSlug || '',
      ...(partnerOwnerUid ? { partnerOwnerUid } : {}),
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      customerName: newOrder.customerName,
      grossSales: newOrder.subtotal,
      eligibleSales: newOrder.subtotal - (newOrder.partnerDiscount || 0),
      commissionRate: 0.25,
      earningAmount: newOrder.partnerCommission,
      status: 'PENDING',
      createdAt
    };

    if (auth.currentUser) {
      await safeWriteOp(
        () => setDoc(doc(db, 'partner_earnings', earningId), newEarning),
        OperationType.CREATE,
        `partner_earnings/${earningId}`
      );
    }

    const currentEarnings = getLocal('partner_earnings', INITIAL_EARNINGS);
    setLocal('partner_earnings', [newEarning, ...currentEarnings]);
  }

  return newOrder;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  if (auth.currentUser) {
    await safeWriteOp(
      () => updateDoc(doc(db, 'orders', orderId), { status, updatedAt: new Date().toISOString() }),
      OperationType.UPDATE,
      `orders/${orderId}`
    );
  }
  const current = getLocal('orders', INITIAL_ORDERS);
  const updated = current.map(o =>
    o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
  );
  setLocal('orders', updated);
}

// --- PARTNER EARNINGS ---
export async function getPartnerEarnings(partnerId?: string): Promise<PartnerEarning[]> {
  if (auth.currentUser) {
    const earningsQuery = isBootstrappedAdminAuth()
      ? collection(db, 'partner_earnings')
      : query(collection(db, 'partner_earnings'), where('partnerOwnerUid', '==', auth.currentUser.uid));

    const items = await safeGetCollection<PartnerEarning>('partner_earnings', earningsQuery);
    if (items && items.length > 0) {
      if (isBootstrappedAdminAuth()) {
        setLocal('partner_earnings', items);
      }
      return partnerId
        ? items.filter(e => e.partnerId === partnerId || e.partnerSlug === partnerId)
        : items;
    }
  }
  const local = getLocal('partner_earnings', INITIAL_EARNINGS);
  return partnerId
    ? local.filter(e => e.partnerId === partnerId || e.partnerSlug === partnerId)
    : local;
}

export async function getEarningsByPartner(partnerId: string): Promise<PartnerEarning[]> {
  return getPartnerEarnings(partnerId);
}

export async function updateEarningStatus(
  earningId: string,
  status: 'PENDING' | 'APPROVED' | 'PAID'
): Promise<void> {
  const updates: Partial<PartnerEarning> = {
    status,
    ...(status === 'PAID'
      ? { paidAt: new Date().toISOString(), payoutBatchId: 'ACH-' + Date.now().toString().slice(-6) }
      : {})
  };

  if (auth.currentUser) {
    await safeWriteOp(
      () => updateDoc(doc(db, 'partner_earnings', earningId), updates),
      OperationType.UPDATE,
      `partner_earnings/${earningId}`
    );
  }

  const current = getLocal('partner_earnings', INITIAL_EARNINGS);
  const updated = current.map(e => (e.id === earningId ? { ...e, ...updates } : e));
  setLocal('partner_earnings', updated);
}

// --- ARTICLES, FAQS & TESTIMONIALS ---
export async function getArticles(): Promise<EducationalArticle[]> {
  const items = await safeGetCollection<EducationalArticle>('educational_articles');
  if (items && items.length > 0) {
    setLocal('articles', items);
    return items;
  }
  return getLocal('articles', INITIAL_ARTICLES);
}

export async function createArticle(article: Omit<EducationalArticle, 'id'>): Promise<EducationalArticle> {
  const id = 'art-' + Date.now();
  const newArticle: EducationalArticle = { ...article, id };
  if (auth.currentUser) {
    await safeWriteOp(
      () => setDoc(doc(db, 'educational_articles', id), newArticle),
      OperationType.CREATE,
      `educational_articles/${id}`
    );
  }
  const current = getLocal('articles', INITIAL_ARTICLES);
  setLocal('articles', [newArticle, ...current]);
  return newArticle;
}

export async function updateArticle(id: string, updates: Partial<EducationalArticle>): Promise<void> {
  const payload = { ...updates, updatedAt: new Date().toISOString() };
  if (auth.currentUser) {
    await safeWriteOp(
      () => updateDoc(doc(db, 'educational_articles', id), payload),
      OperationType.UPDATE,
      `educational_articles/${id}`
    );
  }
  const current = getLocal('articles', INITIAL_ARTICLES);
  setLocal('articles', current.map(a => (a.id === id ? { ...a, ...payload } : a)));
}

export async function deleteArticle(id: string): Promise<void> {
  if (auth.currentUser) {
    await safeWriteOp(
      () => deleteDoc(doc(db, 'educational_articles', id)),
      OperationType.DELETE,
      `educational_articles/${id}`
    );
  }
  const current = getLocal('articles', INITIAL_ARTICLES);
  setLocal('articles', current.filter(a => a.id !== id));
}

export async function getFAQs(): Promise<FAQ[]> {
  const items = await safeGetCollection<FAQ>('faqs');
  if (items && items.length > 0) {
    setLocal('faqs', items);
    return items;
  }
  return getLocal('faqs', INITIAL_FAQS);
}

export async function createFaq(faq: Omit<FAQ, 'id'>): Promise<FAQ> {
  const id = 'faq-' + Date.now();
  const newFaq: FAQ = { ...faq, id };
  if (auth.currentUser) {
    await safeWriteOp(() => setDoc(doc(db, 'faqs', id), newFaq), OperationType.CREATE, `faqs/${id}`);
  }
  const current = getLocal('faqs', INITIAL_FAQS);
  setLocal('faqs', [...current, newFaq]);
  return newFaq;
}

export async function updateFaq(id: string, updates: Partial<FAQ>): Promise<void> {
  if (auth.currentUser) {
    await safeWriteOp(() => updateDoc(doc(db, 'faqs', id), updates), OperationType.UPDATE, `faqs/${id}`);
  }
  const current = getLocal('faqs', INITIAL_FAQS);
  setLocal('faqs', current.map(f => (f.id === id ? { ...f, ...updates } : f)));
}

export async function deleteFaq(id: string): Promise<void> {
  if (auth.currentUser) {
    await safeWriteOp(() => deleteDoc(doc(db, 'faqs', id)), OperationType.DELETE, `faqs/${id}`);
  }
  const current = getLocal('faqs', INITIAL_FAQS);
  setLocal('faqs', current.filter(f => f.id !== id));
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const items = await safeGetCollection<Testimonial>('testimonials');
  if (items && items.length > 0) {
    setLocal('testimonials', items);
    return items;
  }
  return getLocal('testimonials', INITIAL_TESTIMONIALS);
}

export async function createTestimonial(testimonial: Omit<Testimonial, 'id'>): Promise<Testimonial> {
  const id = 'test-' + Date.now();
  const newItem: Testimonial = { ...testimonial, id };
  if (auth.currentUser) {
    await safeWriteOp(() => setDoc(doc(db, 'testimonials', id), newItem), OperationType.CREATE, `testimonials/${id}`);
  }
  const current = getLocal('testimonials', INITIAL_TESTIMONIALS);
  setLocal('testimonials', [newItem, ...current]);
  return newItem;
}

export async function updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<void> {
  if (auth.currentUser) {
    await safeWriteOp(() => updateDoc(doc(db, 'testimonials', id), updates), OperationType.UPDATE, `testimonials/${id}`);
  }
  const current = getLocal('testimonials', INITIAL_TESTIMONIALS);
  setLocal('testimonials', current.map(t => (t.id === id ? { ...t, ...updates } : t)));
}

export async function deleteTestimonial(id: string): Promise<void> {
  if (auth.currentUser) {
    await safeWriteOp(() => deleteDoc(doc(db, 'testimonials', id)), OperationType.DELETE, `testimonials/${id}`);
  }
  const current = getLocal('testimonials', INITIAL_TESTIMONIALS);
  setLocal('testimonials', current.filter(t => t.id !== id));
}

export async function createPartner(partner: Omit<Partner, 'id'>): Promise<Partner> {
  const all = await getPartners(true);
  const nextNum = (all.length + 1).toString().padStart(6, '0');
  const partnerId = partner.partnerId || `WH-P-${nextNum}`;
  const id = 'partner-' + Date.now();
  const newPartner: Partner = {
    ...partner,
    id,
    partnerId,
    ownerUid: partner.ownerUid || auth.currentUser?.uid,
    status: partner.status || 'NEW'
  };

  if (auth.currentUser) {
    await safeWriteOp(() => setDoc(doc(db, 'partners', id), newPartner), OperationType.CREATE, `partners/${id}`);
  }
  const current = getLocal('partners', INITIAL_PARTNERS);
  setLocal('partners', [newPartner, ...current]);
  await createAuditLog({
    userId: auth.currentUser?.uid,
    userRole: auth.currentUser ? 'PARTNER_APPLICANT' : 'PUBLIC_APPLICANT',
    action: 'PARTNER_CREATED',
    resource: 'Partner',
    resourceId: id,
    metadata: { partnerId, name: newPartner.name, status: newPartner.status }
  });
  return newPartner;
}

// --- AUDIT LOGS ---
export async function createAuditLog(
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'>
): Promise<AuditLogEntry> {
  const id = 'audit-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const fullEntry: AuditLogEntry = {
    ...entry,
    id,
    timestamp: new Date().toISOString()
  };
  if (auth.currentUser) {
    await safeWriteOp(() => setDoc(doc(db, 'audit_logs', id), fullEntry), OperationType.CREATE, `audit_logs/${id}`).catch(
      () => false
    );
  }
  const current = getLocal<AuditLogEntry[]>('audit_logs', []);
  setLocal('audit_logs', [fullEntry, ...current].slice(0, 250));
  return fullEntry;
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  if (auth.currentUser && isBootstrappedAdminAuth()) {
    const items = await safeGetCollection<AuditLogEntry>('audit_logs');
    if (items && items.length > 0) {
      const sorted = items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLocal('audit_logs', sorted);
      return sorted;
    }
  }
  return getLocal<AuditLogEntry[]>('audit_logs', []);
}

// --- INQUIRIES & ANALYTICS ---
export async function createInquiry(
  data: Omit<ContactInquiry, 'id' | 'status' | 'createdAt'>
): Promise<ContactInquiry> {
  const id = 'inq-' + Date.now();
  const inquiry: ContactInquiry = {
    ...data,
    id,
    status: 'NEW',
    userId: auth.currentUser?.uid,
    createdAt: new Date().toISOString()
  };

  if (auth.currentUser) {
    await safeWriteOp(
      () => setDoc(doc(db, 'inquiries', id), inquiry),
      OperationType.CREATE,
      `inquiries/${id}`
    ).catch(() => false);
  }

  const current = getLocal<ContactInquiry[]>('inquiries', []);
  setLocal('inquiries', [inquiry, ...current]);
  return inquiry;
}

export async function getInquiries(): Promise<ContactInquiry[]> {
  if (auth.currentUser) {
    const q = isBootstrappedAdminAuth()
      ? collection(db, 'inquiries')
      : query(collection(db, 'inquiries'), where('userId', '==', auth.currentUser.uid));
    const items = await safeGetCollection<ContactInquiry>('inquiries', q);
    if (items && items.length > 0) {
      const sorted = items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      if (isBootstrappedAdminAuth()) setLocal('inquiries', sorted);
      return sorted;
    }
  }
  return getLocal<ContactInquiry[]>('inquiries', []);
}

export async function updateInquiryStatus(id: string, status: ContactInquiry['status']): Promise<void> {
  const payload = { status, updatedAt: new Date().toISOString() };
  if (auth.currentUser) {
    await safeWriteOp(
      () => updateDoc(doc(db, 'inquiries', id), payload),
      OperationType.UPDATE,
      `inquiries/${id}`
    );
  }
  const current = getLocal<ContactInquiry[]>('inquiries', []);
  setLocal('inquiries', current.map(i => (i.id === id ? { ...i, ...payload } : i)));
}

export async function logAnalyticsEvent(
  event: Omit<AnalyticsEvent, 'id' | 'timestamp'>
): Promise<AnalyticsEvent> {
  const id = 'evt-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const fullEvent: AnalyticsEvent = {
    ...event,
    id,
    userId: auth.currentUser?.uid,
    timestamp: new Date().toISOString()
  };

  if (auth.currentUser) {
    await safeWriteOp(
      () => setDoc(doc(db, 'analytics_events', id), fullEvent),
      OperationType.CREATE,
      `analytics_events/${id}`
    ).catch(() => false);
  }

  const current = getLocal<AnalyticsEvent[]>('analytics_events', []);
  setLocal('analytics_events', [fullEvent, ...current].slice(0, 400));
  return fullEvent;
}

export async function getAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  if (auth.currentUser && isBootstrappedAdminAuth()) {
    const items = await safeGetCollection<AnalyticsEvent>('analytics_events');
    if (items && items.length > 0) {
      const sorted = items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLocal('analytics_events', sorted);
      return sorted;
    }
  }
  return getLocal<AnalyticsEvent[]>('analytics_events', []);
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
  updatePartnerEarningStatus: updateEarningStatus,
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
  createAuditLog,
  getAuditLogs,
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  logAnalyticsEvent,
  getAnalyticsEvents
};

export default dbService;
