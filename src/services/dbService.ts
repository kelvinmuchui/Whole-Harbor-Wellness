import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
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
  PartnerStatus
} from '../types/index.ts';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_PROGRAMS, 
  INITIAL_PARTNERS, 
  INITIAL_ORDERS, 
  INITIAL_EARNINGS, 
  INITIAL_ARTICLES, 
  INITIAL_FAQS, 
  INITIAL_TESTIMONIALS 
} from '../lib/seedData.ts';

// Local storage keys for instant responsiveness and resilient fallback
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

// --- INITIAL SEEDING HELPER ---
let isSeeded = false;
export async function seedInitialDatabase(): Promise<void> {
  if (isSeeded) return;
  try {
    // Check if products collection exists in Firestore
    const productsSnap = await getDocs(collection(db, 'products'));
    if (productsSnap.empty) {
      console.log('Seeding initial products into Firestore...');
      for (const p of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', p.id), p);
      }
      for (const prog of INITIAL_PROGRAMS) {
        await setDoc(doc(db, 'wellness_programs', prog.id), prog);
      }
      for (const part of INITIAL_PARTNERS) {
        await setDoc(doc(db, 'partners', part.id), part);
      }
      for (const ord of INITIAL_ORDERS) {
        await setDoc(doc(db, 'orders', ord.id), ord);
      }
      for (const earn of INITIAL_EARNINGS) {
        await setDoc(doc(db, 'partner_earnings', earn.id), earn);
      }
      for (const art of INITIAL_ARTICLES) {
        await setDoc(doc(db, 'educational_articles', art.id), art);
      }
      for (const f of INITIAL_FAQS) {
        await setDoc(doc(db, 'faqs', f.id), f);
      }
      for (const t of INITIAL_TESTIMONIALS) {
        await setDoc(doc(db, 'testimonials', t.id), t);
      }
      console.log('Firestore seed complete!');
    }
    isSeeded = true;
  } catch (err) {
    console.warn('Firestore seed probe completed with local sync:', err);
    isSeeded = true;
  }
}

// --- PRODUCTS ---
export async function getProducts(): Promise<Product[]> {
  try {
    const snap = await getDocs(collection(db, 'products'));
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as Product));
      setLocal('products', items);
      return items;
    }
  } catch (e) {
    console.warn('Using local fallback for products:', e);
  }
  return getLocal('products', INITIAL_PRODUCTS);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await getProducts();
  return all.find(p => p.slug === slug) || null;
}

export async function createProduct(prod: Omit<Product, 'id'>): Promise<Product> {
  const id = 'prod-' + Date.now();
  const newProduct: Product = { ...prod, id };
  try {
    await setDoc(doc(db, 'products', id), newProduct);
  } catch (e) {
    console.warn('Firestore createProduct local save:', e);
  }
  const current = getLocal('products', INITIAL_PRODUCTS);
  const updated = [newProduct, ...current];
  setLocal('products', updated);
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  try {
    await updateDoc(doc(db, 'products', id), updates);
  } catch (e) {
    console.warn('Firestore updateProduct local save:', e);
  }
  const current = getLocal('products', INITIAL_PRODUCTS);
  const updated = current.map(p => p.id === id ? { ...p, ...updates } : p);
  setLocal('products', updated);
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (e) {
    console.warn('Firestore deleteProduct local delete:', e);
  }
  const current = getLocal('products', INITIAL_PRODUCTS);
  const updated = current.filter(p => p.id !== id);
  setLocal('products', updated);
}

// --- WELLNESS PROGRAMS ---
export async function getPrograms(): Promise<WellnessProgram[]> {
  try {
    const snap = await getDocs(collection(db, 'wellness_programs'));
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as WellnessProgram));
      setLocal('programs', items);
      return items;
    }
  } catch (e) {
    console.warn('Using local fallback for programs:', e);
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
  try {
    await setDoc(doc(db, 'wellness_programs', id), newProg);
  } catch (e) {
    console.warn('Firestore createProgram local save:', e);
  }
  const current = getLocal('programs', INITIAL_PROGRAMS);
  const updated = [newProg, ...current];
  setLocal('programs', updated);
  return newProg;
}

// --- PARTNERS ---
export async function getPartners(): Promise<Partner[]> {
  try {
    const snap = await getDocs(collection(db, 'partners'));
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as Partner));
      setLocal('partners', items);
      return items;
    }
  } catch (e) {
    console.warn('Using local fallback for partners:', e);
  }
  return getLocal('partners', INITIAL_PARTNERS);
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
  const all = await getPartners();
  // Generate next unique partnerId: WH-P-00000X
  const nextNum = (all.length + 1).toString().padStart(6, '0');
  const partnerId = `WH-P-${nextNum}`;
  
  // Generate unique slug
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
    status: 'PENDING',
    commissionRate: 0.25, // default 25%
    memberDiscountRate: 0.15, // default 15% VIP discount
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'partners', id), newPartner);
  } catch (e) {
    console.warn('Firestore registerPartner local save:', e);
  }
  const current = getLocal('partners', INITIAL_PARTNERS);
  setLocal('partners', [newPartner, ...current]);
  return newPartner;
}

export async function updatePartnerStatus(id: string, status: PartnerStatus): Promise<void> {
  try {
    await updateDoc(doc(db, 'partners', id), { status, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.warn('Firestore updatePartnerStatus local save:', e);
  }
  const current = getLocal('partners', INITIAL_PARTNERS);
  const updated = current.map(p => p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p);
  setLocal('partners', updated);
}

export async function updatePartner(id: string, updates: Partial<Partner>): Promise<void> {
  try {
    await updateDoc(doc(db, 'partners', id), { ...updates, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.warn('Firestore updatePartner local save:', e);
  }
  const current = getLocal('partners', INITIAL_PARTNERS);
  const updated = current.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p);
  setLocal('partners', updated);
}

// --- ORDERS & EARNINGS ---
export async function getOrders(): Promise<Order[]> {
  try {
    const snap = await getDocs(collection(db, 'orders'));
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as Order));
      setLocal('orders', items);
      return items;
    }
  } catch (e) {
    console.warn('Using local fallback for orders:', e);
  }
  return getLocal('orders', INITIAL_ORDERS);
}

export async function getOrdersByPartner(partnerId: string): Promise<Order[]> {
  const all = await getOrders();
  return all.filter(o => o.partnerId === partnerId || o.partnerSlug === partnerId);
}

export async function getOrdersByCustomer(customerEmail: string): Promise<Order[]> {
  const all = await getOrders();
  return all.filter(o => o.customerEmail.toLowerCase() === customerEmail.toLowerCase());
}

export async function createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<Order> {
  const id = 'ord-' + Date.now();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `WH-ORD-2026-${randomSuffix}`;
  const createdAt = new Date().toISOString();

  const newOrder: Order = {
    ...orderData,
    id,
    orderNumber,
    createdAt
  };

  try {
    await setDoc(doc(db, 'orders', id), newOrder);
  } catch (e) {
    console.warn('Firestore createOrder local save:', e);
  }

  const currentOrders = getLocal('orders', INITIAL_ORDERS);
  setLocal('orders', [newOrder, ...currentOrders]);

  // If order was referred by an approved partner, create an auditable PartnerEarning record
  if (newOrder.partnerId && newOrder.partnerCommission && newOrder.partnerCommission > 0) {
    const earningId = 'earn-' + Date.now();
    const newEarning: PartnerEarning = {
      id: earningId,
      partnerId: newOrder.partnerId,
      partnerSlug: newOrder.partnerSlug || '',
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

    try {
      await setDoc(doc(db, 'partner_earnings', earningId), newEarning);
    } catch (e) {
      console.warn('Firestore createPartnerEarning local save:', e);
    }

    const currentEarnings = getLocal('partner_earnings', INITIAL_EARNINGS);
    setLocal('partner_earnings', [newEarning, ...currentEarnings]);
  }

  return newOrder;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  try {
    await updateDoc(doc(db, 'orders', orderId), { status, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.warn('Firestore updateOrderStatus local save:', e);
  }
  const current = getLocal('orders', INITIAL_ORDERS);
  const updated = current.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o);
  setLocal('orders', updated);
}

// --- PARTNER EARNINGS ---
export async function getPartnerEarnings(): Promise<PartnerEarning[]> {
  try {
    const snap = await getDocs(collection(db, 'partner_earnings'));
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as PartnerEarning));
      setLocal('partner_earnings', items);
      return items;
    }
  } catch (e) {
    console.warn('Using local fallback for earnings:', e);
  }
  return getLocal('partner_earnings', INITIAL_EARNINGS);
}

export async function getEarningsByPartner(partnerId: string): Promise<PartnerEarning[]> {
  const all = await getPartnerEarnings();
  return all.filter(e => e.partnerId === partnerId || e.partnerSlug === partnerId);
}

export async function updateEarningStatus(
  earningId: string, 
  status: 'PENDING' | 'APPROVED' | 'PAID'
): Promise<void> {
  const updates: Partial<PartnerEarning> = {
    status,
    ...(status === 'PAID' ? { paidAt: new Date().toISOString(), payoutBatchId: 'ACH-' + Date.now().toString().slice(-6) } : {})
  };

  try {
    await updateDoc(doc(db, 'partner_earnings', earningId), updates);
  } catch (e) {
    console.warn('Firestore updateEarningStatus local save:', e);
  }

  const current = getLocal('partner_earnings', INITIAL_EARNINGS);
  const updated = current.map(e => e.id === earningId ? { ...e, ...updates } : e);
  setLocal('partner_earnings', updated);
}

// --- ARTICLES, FAQS & TESTIMONIALS ---
export async function getArticles(): Promise<EducationalArticle[]> {
  try {
    const snap = await getDocs(collection(db, 'educational_articles'));
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as EducationalArticle));
      setLocal('articles', items);
      return items;
    }
  } catch (e) {
    console.warn('Using local fallback for articles:', e);
  }
  return getLocal('articles', INITIAL_ARTICLES);
}

export async function createArticle(article: Omit<EducationalArticle, 'id'>): Promise<EducationalArticle> {
  const id = 'art-' + Date.now();
  const newArticle: EducationalArticle = { ...article, id };
  try {
    await setDoc(doc(db, 'educational_articles', id), newArticle);
  } catch (e) {
    console.warn('Firestore createArticle local save:', e);
  }
  const current = getLocal('articles', INITIAL_ARTICLES);
  setLocal('articles', [newArticle, ...current]);
  return newArticle;
}

export async function getFAQs(): Promise<FAQ[]> {
  try {
    const snap = await getDocs(collection(db, 'faqs'));
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as FAQ));
      setLocal('faqs', items);
      return items;
    }
  } catch (e) {
    console.warn('Using local fallback for FAQs:', e);
  }
  return getLocal('faqs', INITIAL_FAQS);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const snap = await getDocs(collection(db, 'testimonials'));
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as Testimonial));
      setLocal('testimonials', items);
      return items;
    }
  } catch (e) {
    console.warn('Using local fallback for testimonials:', e);
  }
  return getLocal('testimonials', INITIAL_TESTIMONIALS);
}

export async function createPartner(partner: Omit<Partner, 'id'>): Promise<Partner> {
  const all = await getPartners();
  const nextNum = (all.length + 1).toString().padStart(6, '0');
  const partnerId = partner.partnerId || `WH-P-${nextNum}`;
  const id = 'partner-' + Date.now();
  const newPartner: Partner = {
    ...partner,
    id,
    partnerId,
    status: partner.status || 'PENDING'
  };

  try {
    await setDoc(doc(db, 'partners', id), newPartner);
  } catch (e) {
    console.warn('Firestore createPartner local save:', e);
  }
  const current = getLocal('partners', INITIAL_PARTNERS);
  setLocal('partners', [newPartner, ...current]);
  return newPartner;
}

export const getFaqs = getFAQs;
export const updatePartnerEarningStatus = updateEarningStatus;

export const dbService = {
  seedInitialDatabase,
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getPrograms,
  getProgramBySlug,
  createProgram,
  getPartners,
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
  getPartnerEarnings: async (partnerId?: string) => {
    if (partnerId) {
      return getEarningsByPartner(partnerId);
    }
    return getPartnerEarnings();
  },
  getEarningsByPartner,
  updateEarningStatus,
  updatePartnerEarningStatus: updateEarningStatus,
  getArticles,
  createArticle,
  getFAQs,
  getFaqs,
  getTestimonials
};

export default dbService;
