import { auth } from '../lib/firebase.ts';
import { INITIAL_USERS } from '../lib/seedUsers.ts';
import { getSupabaseClient, type Json } from '../lib/supabase.ts';
import { TEST_VARS } from '../lib/testVariables.ts';
import type {
  AnalyticsEvent,
  AuditLogEntry,
  ContactInquiry,
  EducationalArticle,
  FAQ,
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

type CollectionName =
  | 'users'
  | 'partners'
  | 'products'
  | 'orders'
  | 'partner_earnings'
  | 'wellness_programs'
  | 'educational_articles'
  | 'faqs'
  | 'testimonials'
  | 'inquiries'
  | 'analytics_events'
  | 'audit_logs';

interface RecordRow {
  record_id: string;
  data: Json;
  is_demo: boolean;
}

export { INITIAL_USERS };

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
  return TEST_VARS.appMode !== 'production';
}

function makeId(prefix: string): string {
  return `${prefix}-${globalThis.crypto.randomUUID()}`;
}

function getId(record: object): string {
  if ('id' in record && typeof record.id === 'string') return record.id;
  if ('uid' in record && typeof record.uid === 'string') return record.uid;
  throw new Error('Supabase records must have an id or uid.');
}

async function getRecord<T>(collectionName: CollectionName, id: string): Promise<T | null> {
  const { data, error } = await getSupabaseClient()
    .from('whw_records')
    .select('record_id,data,is_demo')
    .eq('collection', collectionName)
    .eq('record_id', id)
    .maybeSingle();

  if (error) raiseSupabaseError(`read ${collectionName}/${id}`, error);
  return data ? fromRow<T>(data as RecordRow) : null;
}

async function getCollection<T>(collectionName: CollectionName): Promise<T[]> {
  const { data, error } = await getSupabaseClient()
    .from('whw_records')
    .select('record_id,data,is_demo')
    .eq('collection', collectionName);

  if (error) raiseSupabaseError(`list ${collectionName}`, error);
  return ((data ?? []) as RecordRow[]).map((row) => fromRow<T>(row));
}

async function insertRecord<T extends object>(
  collectionName: CollectionName,
  record: T
): Promise<T> {
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

async function upsertRecord<T extends object>(
  collectionName: CollectionName,
  id: string,
  record: T
): Promise<T> {
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

async function updateRecord<U extends object>(
  collectionName: CollectionName,
  id: string,
  updates: U
): Promise<void> {
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
}

async function deleteRecord(collectionName: CollectionName, id: string): Promise<void> {
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
}

function newestFirst<T extends { createdAt?: string; timestamp?: string }>(items: T[]): T[] {
  return items.sort((a, b) => {
    const aDate = a.createdAt || a.timestamp || '';
    const bDate = b.createdAt || b.timestamp || '';
    return new Date(bDate).getTime() - new Date(aDate).getTime();
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
  });
}

export async function updateUserStatus(
  uid: string,
  status: UserProfile['status'],
  partnerId?: string,
  partnerSlug?: string
): Promise<void> {
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
  });
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
  });
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
  });
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
  });
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
  return insertRecord('wellness_programs', newProgram);
}

export async function updateProgram(
  id: string,
  updates: Partial<WellnessProgram>
): Promise<void> {
  await updateRecord('wellness_programs', id, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteProgram(id: string): Promise<void> {
  await deleteRecord('wellness_programs', id);
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
  });
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
  });
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

  if (!auth.currentUser && order.partnerId && (order.partnerCommission ?? 0) > 0) {
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
    await insertRecord('partner_earnings', earning);
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
  return insertRecord('educational_articles', {
    ...article,
    id: makeId('art')
  });
}

export async function updateArticle(
  id: string,
  updates: Partial<EducationalArticle>
): Promise<void> {
  await updateRecord('educational_articles', id, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteArticle(id: string): Promise<void> {
  await deleteRecord('educational_articles', id);
}

export async function getFAQs(): Promise<FAQ[]> {
  return getCollection<FAQ>('faqs');
}

export async function createFaq(faq: Omit<FAQ, 'id'>): Promise<FAQ> {
  return insertRecord('faqs', { ...faq, id: makeId('faq') });
}

export async function updateFaq(id: string, updates: Partial<FAQ>): Promise<void> {
  await updateRecord('faqs', id, updates);
}

export async function deleteFaq(id: string): Promise<void> {
  await deleteRecord('faqs', id);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return getCollection<Testimonial>('testimonials');
}

export async function createTestimonial(
  testimonial: Omit<Testimonial, 'id'>
): Promise<Testimonial> {
  return insertRecord('testimonials', {
    ...testimonial,
    id: makeId('testimonial')
  });
}

export async function updateTestimonial(
  id: string,
  updates: Partial<Testimonial>
): Promise<void> {
  await updateRecord('testimonials', id, updates);
}

export async function deleteTestimonial(id: string): Promise<void> {
  await deleteRecord('testimonials', id);
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
  });
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
  createAuditLog,
  getAuditLogs,
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  logAnalyticsEvent,
  getAnalyticsEvents
};

export default dbService;
