import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Home,
  Handshake,
  FileText,
  Users,
  ShoppingCart,
  Wallet,
  Link2,
  Flower2,
  BookOpen,
  HelpCircle,
  Star,
  Image as ImageIcon,
  Layers,
  BarChart3,
  ShieldCheck,
  Settings,
  Headphones,
  Bell,
  Search,
  ChevronRight,
  ChevronDown,
  Plus,
  CheckCircle2,
  Clock,
  Trophy,
  Zap,
  ExternalLink,
  ArrowRight,
  Download,
  Package,
  Menu,
  X,
  LogOut,
  Mail,
  Store,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { dbService } from '../services/dbService.ts';
import { analyticsService } from '../services/analyticsService.ts';
import { KpiSparkBars, SalesPerformanceChart } from '../components/AdminCharts.tsx';
import {
  Partner,
  Order,
  Product,
  ProductStatus,
  ProductCategoryType,
  WellnessProgram,
  EducationalArticle,
  FAQ,
  Testimonial,
  PartnerEarning,
  PartnerStatus,
  OrderStatus,
  AuditLogEntry,
  UserProfile,
  UserRole,
  ContactInquiry
} from '../types/index.ts';

interface AdminDashboardViewProps {
  navigate: (path: string, param?: string) => void;
}

type AdminSection =
  | 'overview'
  | 'partners'
  | 'applications'
  | 'partner-users'
  | 'orders'
  | 'payouts'
  | 'partner-pages'
  | 'products'
  | 'programs'
  | 'articles'
  | 'faqs'
  | 'testimonials'
  | 'inquiries'
  | 'media'
  | 'website-pages'
  | 'analytics'
  | 'users'
  | 'settings';

interface PlatformSettings {
  defaultCommissionRate: number;
  memberDiscountRate: number;
  freeShippingThreshold: number;
  coldChainNotice: string;
  announcementBanner: string;
  wholesaleAutoReview: boolean;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  defaultCommissionRate: 25,
  memberDiscountRate: 15,
  freeShippingThreshold: 300,
  coldChainNotice: 'Insulated 2°C–8°C cold-chain dispatch within 24 hours of HPLC lot release.',
  announcementBanner: 'Complimentary cold-chain shipping on qualifying orders over $300.',
  wholesaleAutoReview: true
};

const SETTINGS_STORAGE_KEY = 'whole_harbor_admin_settings_v1';

const CATEGORY_LABELS: Record<string, string> = {
  metabolic: 'Metabolic Support',
  cellular: 'Cellular Optimization',
  recovery: 'Tissue Recovery',
  longevity: 'Longevity & Vitality',
  stacks: 'Synergy Multi-Kits'
};

const PARTNER_STATUS_OPTIONS: PartnerStatus[] = [
  'NEW',
  'UNDER REVIEW',
  'APPROVED',
  'NEEDS INFORMATION',
  'DECLINED',
  'SUSPENDED'
];

const PENDING_PARTNER_STATUSES: PartnerStatus[] = ['NEW', 'UNDER REVIEW', 'NEEDS INFORMATION', 'PENDING'];

const MEDIA_LIBRARY_ASSETS: Array<{
  id: string;
  title: string;
  category: 'Brand & Hero' | 'Products' | 'Learn Studio';
  url: string;
}> = [
  { id: 'm-logo', title: 'Whole Harbor Wellness Primary Crest', category: 'Brand & Hero', url: '/images/whw-logo.png' },
  { id: 'm-logo-tr', title: 'Whole Harbor Crest (Transparent)', category: 'Brand & Hero', url: '/images/whw-logo-transparent.png' },
  { id: 'm-hero', title: 'Editorial Sanctuary Hero Banner', category: 'Brand & Hero', url: '/images/editorial-hero.png' },
  { id: 'm-feat-1', title: 'Featured Semaglutide Vial', category: 'Products', url: '/images/featured-semaglutide.png' },
  { id: 'm-feat-2', title: 'Featured BPC-157 Clean Vial', category: 'Products', url: '/images/featured-bpc157-clean.png' },
  { id: 'm-feat-3', title: 'Featured MOTS-c Vial', category: 'Products', url: '/images/featured-motsc.png' },
  { id: 'm-p-tirz', title: 'Tirzepatide Product Card', category: 'Products', url: '/images/products/tirzepatide.jpg' },
  { id: 'm-p-reta', title: 'Retatrutide Product Card', category: 'Products', url: '/images/products/retatrutide.jpg' },
  { id: 'm-p-glow', title: 'GLOW 70 Matrix Card', category: 'Products', url: '/images/products/glow-70.jpg' },
  { id: 'm-p-klow', title: 'KLOW 80 Matrix Card', category: 'Products', url: '/images/products/klow-80.jpg' },
  { id: 'm-p-wolv', title: 'Wolverine Blend Card', category: 'Products', url: '/images/products/wolverine-blend.jpg' },
  { id: 'm-p-tesa', title: 'Tesamorelin Card', category: 'Products', url: '/images/products/tesamorelin.jpg' },
  { id: 'm-p-lipo', title: 'Lipo Mino Mix Card', category: 'Products', url: '/images/products/lipo-mino-mix.jpg' },
  { id: 'm-p-shred', title: 'Super Shred Card', category: 'Products', url: '/images/products/super-shred.jpg' },
  { id: 'm-l-welcome', title: 'Learn Studio Welcome Cover', category: 'Learn Studio', url: '/images/learn/welcome.png' },
  { id: 'm-l-mixing', title: 'Reconstitution & Mixing Guide', category: 'Learn Studio', url: '/images/learn/mixing.png' },
  { id: 'm-l-storage', title: 'Cold-Chain Storage Standards', category: 'Learn Studio', url: '/images/learn/storage.png' },
  { id: 'm-l-shipping', title: 'Insulated Fulfillment Guide', category: 'Learn Studio', url: '/images/learn/shipping.png' }
];

const WEBSITE_ROUTES: Array<{
  title: string;
  path: string;
  hash: string;
  category: string;
  description: string;
}> = [
  { title: 'Storefront Home', path: 'home', hash: '#/', category: 'Storefront', description: 'Hero showcase, curated goal shortcuts, featured formulations & trust standards.' },
  { title: 'Peptide Catalog & Shop', path: 'shop', hash: '#/shop', category: 'Storefront', description: 'Full retail and partner wholesale peptide catalog with strength & vial selectors.' },
  { title: 'Learn Studio', path: 'learn', hash: '#/learn', category: 'Education', description: 'Clinical education hub, peptide dosing guides, storage & reconstitution manuals.' },
  { title: 'Partner Ecosystem', path: 'partners', hash: '#/partners', category: 'Partners', description: 'Partner directory, wholesale tier overview, and public partner application intake.' },
  { title: 'Wellness Programs', path: 'wellness-programs', hash: '#/wellness-programs', category: 'Clinical', description: 'Physician-guided multi-week metabolic, cellular, and longevity protocols.' },
  { title: 'Our Approach', path: 'approach', hash: '#/approach', category: 'Clinical', description: 'Third-party HPLC testing, COA batch verification, and cold-chain standards.' },
  { title: 'About Whole Harbor', path: 'about', hash: '#/about', category: 'Company', description: 'Mission, clinical advisory governance, and partnership commitment.' },
  { title: 'Frequently Asked Questions', path: 'faq', hash: '#/faq', category: 'Support', description: 'Searchable member & clinic knowledge base on shipping, vials, and accounts.' },
  { title: 'Contact & Concierge', path: 'contact', hash: '#/contact', category: 'Support', description: 'Direct member care, wholesale onboarding support, and inquiry submission.' },
  { title: 'System Architecture Specs', path: 'architecture', hash: '#/architecture', category: 'Technical', description: 'Platform security boundaries, partner attribution flow, and data governance.' }
];

const matchesOrderDate = (isoDate: string, filter: 'all' | 'current_month' | 'prev_month' | 'ytd'): boolean => {
  if (filter === 'all') return true;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return true;
  const now = new Date();
  if (filter === 'current_month') {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }
  if (filter === 'prev_month') {
    const pm = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const py = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return d.getFullYear() === py && d.getMonth() === pm;
  }
  if (filter === 'ytd') {
    return d.getFullYear() === now.getFullYear() && d <= now;
  }
  return true;
};

const getTimeGreeting = (): string => {
  const hr = new Date().getHours();
  if (hr < 12) return 'Good morning';
  if (hr < 17) return 'Good afternoon';
  return 'Good evening';
};

const downloadCsv = (filename: string, headers: string[], rows: Array<Array<string | number>>) => {
  const escape = (val: string | number) => {
    const s = String(val ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csvContent = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ navigate }) => {
  const { currentUser, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Overview Controls
  const [overviewRange, setOverviewRange] = useState<'30d' | '90d' | 'ytd' | 'all'>('30d');
  const [chartMonths, setChartMonths] = useState<6 | 12>(6);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [sidebarProfileOpen, setSidebarProfileOpen] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Data states
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [earnings, setEarnings] = useState<PartnerEarning[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [programs, setPrograms] = useState<WellnessProgram[]>([]);
  const [articles, setArticles] = useState<EducationalArticle[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [analyticsSummary, setAnalyticsSummary] = useState<{
    totalEvents: number;
    pageViews: number;
    productViews: number;
    partnerVisits: number;
    addToCarts: number;
    checkouts: number;
  }>({ totalEvents: 0, pageViews: 0, productViews: 0, partnerVisits: 0, addToCarts: 0, checkouts: 0 });

  // Filters
  const [searchUser, setSearchUser] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'CLIENTS' | 'PARTNERS' | 'ADMINS'>('ALL');
  const [searchPartner, setSearchPartner] = useState('');
  const [partnerStatusFilter, setPartnerStatusFilter] = useState<string>('ALL');
  const [searchOrder, setSearchOrder] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [orderChannelFilter, setOrderChannelFilter] = useState<'ALL' | 'PARTNER' | 'DIRECT'>('ALL');
  const [orderDateFilter, setOrderDateFilter] = useState<'all' | 'current_month' | 'prev_month' | 'ytd'>('all');
  const [searchProduct, setSearchProduct] = useState('');
  const [mediaFilter, setMediaFilter] = useState<'ALL' | 'Brand & Hero' | 'Products' | 'Learn Studio'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<{ title: string; url: string } | null>(null);

  // Modals
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);
  const [reviewingPartner, setReviewingPartner] = useState<Partner | null>(null);
  const [partnerAdminNotes, setPartnerAdminNotes] = useState('');
  const [partnerReviewCategories, setPartnerReviewCategories] = useState<ProductCategoryType[]>([]);
  const [savingPartnerReview, setSavingPartnerReview] = useState(false);

  // Add Partner Modal
  const [addPartnerOpen, setAddPartnerOpen] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerContact, setNewPartnerContact] = useState('');
  const [newPartnerEmail, setNewPartnerEmail] = useState('');
  const [newPartnerPhone, setNewPartnerPhone] = useState('');
  const [newPartnerCategory, setNewPartnerCategory] = useState('Longevity Clinic');
  const [newPartnerLocation, setNewPartnerLocation] = useState('');
  const [newPartnerStatus, setNewPartnerStatus] = useState<PartnerStatus>('APPROVED');
  const [newPartnerCommission, setNewPartnerCommission] = useState(25);
  const [newPartnerDiscount, setNewPartnerDiscount] = useState(15);
  const [newPartnerDescription, setNewPartnerDescription] = useState('');
  const [savingNewPartner, setSavingNewPartner] = useState(false);

  // CMS Inline Editors
  const [editingProgram, setEditingProgram] = useState<Partial<WellnessProgram> | null>(null);
  const [editingArticle, setEditingArticle] = useState<Partial<EducationalArticle> | null>(null);
  const [editingFaq, setEditingFaq] = useState<Partial<FAQ> | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);

  // Add / Edit Product Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodCategory, setProdCategory] = useState<ProductCategoryType>('metabolic');
  const [prodStatus, setProdStatus] = useState<ProductStatus>('ACTIVE');
  const [prodPrice, setProdPrice] = useState(250);
  const [prodWholesalePrice, setProdWholesalePrice] = useState(175);
  const [prodPurity, setProdPurity] = useState('99.5%');
  const [prodStock, setProdStock] = useState(50);
  const [prodLotNumber, setProdLotNumber] = useState('2026-A');
  const [prodImageUrl, setProdImageUrl] = useState('/images/products/tirzepatide.jpg');
  const [prodShortDesc, setProdShortDesc] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodDisclosures, setProdDisclosures] = useState('');
  const [prodEducationalMaterial, setProdEducationalMaterial] = useState('');

  // Platform Settings State
  const [settings, setSettings] = useState<PlatformSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [settingsSavedNotice, setSettingsSavedNotice] = useState(false);

  // Escape & outside-click listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewMediaUrl) setPreviewMediaUrl(null);
        else if (inspectingOrder) setInspectingOrder(null);
        else if (productModalOpen) {
          setProductModalOpen(false);
          setEditingProduct(null);
        } else if (reviewingPartner) setReviewingPartner(null);
        else if (addPartnerOpen) setAddPartnerOpen(false);
        else if (sidebarMobileOpen) setSidebarMobileOpen(false);
        setSearchFocused(false);
        setNotificationsOpen(false);
        setProfileMenuOpen(false);
        setSidebarProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewMediaUrl, inspectingOrder, productModalOpen, reviewingPartner, addPartnerOpen, sidebarMobileOpen]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const reloadData = async () => {
    try {
      const [usrs, pts, ords, erngs, prods, progs, arts, fqs, tests, logs, inqs, analytics] = await Promise.all([
        dbService.getUsers(),
        dbService.getPartners(true),
        dbService.getOrders('admin'),
        dbService.getPartnerEarnings(),
        dbService.getProducts(),
        dbService.getPrograms(),
        dbService.getArticles(),
        dbService.getFaqs(),
        dbService.getTestimonials(),
        dbService.getAuditLogs(),
        dbService.getInquiries(),
        analyticsService.getSummary()
      ]);
      setUsers(usrs);
      setPartners(pts);
      setOrders(ords);
      setEarnings(erngs);
      setProducts(prods);
      setPrograms(progs);
      setArticles(arts);
      setFaqs(fqs);
      setTestimonials(tests);
      setAuditLogs(logs);
      setInquiries(inqs);
      setAnalyticsSummary(analytics);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const switchSection = (sec: AdminSection) => {
    setActiveSection(sec);
    if (sec === 'partner-users') {
      setUserRoleFilter('PARTNERS');
    } else if (sec === 'users') {
      setUserRoleFilter('ALL');
    }
    setSidebarMobileOpen(false);
    setNotificationsOpen(false);
  };

  // Filtered Orders for Order Fulfillment tab
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchOrder.trim().toLowerCase();
      const matchesSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.trackingNumber || '').toLowerCase().includes(q);
      const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
      const isPartnerOrder = Boolean(o.partnerId || o.partnerSlug || o.partnerName);
      const matchesChannel =
        orderChannelFilter === 'ALL' ||
        (orderChannelFilter === 'PARTNER' && isPartnerOrder) ||
        (orderChannelFilter === 'DIRECT' && !isPartnerOrder);
      const matchesDate = matchesOrderDate(o.createdAt, orderDateFilter);
      return matchesSearch && matchesStatus && matchesChannel && matchesDate;
    });
  }, [orders, searchOrder, orderStatusFilter, orderChannelFilter, orderDateFilter]);

  // Overview KPIs
  const activePartnersCount = useMemo(
    () => partners.filter((p) => p.status === 'APPROVED').length,
    [partners]
  );
  const pendingApplications = useMemo(
    () => partners.filter((p) => PENDING_PARTNER_STATUSES.includes(p.status)),
    [partners]
  );
  const openInquiries = useMemo(
    () => inquiries.filter((i) => i.status !== 'RESOLVED'),
    [inquiries]
  );
  const pendingOrdersCount = useMemo(
    () => orders.filter((o) => o.status === 'PENDING' || o.status === 'PROCESSING' || o.status === 'CONFIRMED').length,
    [orders]
  );

  const rangeOrders = useMemo(() => {
    if (overviewRange === 'all') return orders;
    const now = Date.now();
    const days = overviewRange === '30d' ? 30 : overviewRange === '90d' ? 90 : 365;
    const cutoff = now - days * 86400000;
    const matched = orders.filter((o) => {
      const ts = new Date(o.createdAt).getTime();
      return !Number.isNaN(ts) && ts >= cutoff;
    });
    // When historical seeded orders predate the sliding 30-day window, show full recorded order set for continuity
    return matched.length > 0 ? matched : orders;
  }, [orders, overviewRange]);

  const totalRevenue = useMemo(
    () => rangeOrders.reduce((acc, o) => acc + (o.total || 0), 0),
    [rangeOrders]
  );
  const totalPartnerEarnings = useMemo(
    () => earnings.reduce((acc, e) => acc + (e.earningAmount || 0), 0),
    [earnings]
  );
  const pendingEarningsTotal = useMemo(
    () => earnings.filter((e) => e.status === 'PENDING' || e.status === 'APPROVED').reduce((acc, e) => acc + e.earningAmount, 0),
    [earnings]
  );
  const paidEarningsTotal = useMemo(
    () => earnings.filter((e) => e.status === 'PAID').reduce((acc, e) => acc + e.earningAmount, 0),
    [earnings]
  );

  // Top Performing Partners sorted by referred sales
  const topPartners = useMemo(() => {
    return [...partners]
      .map((pt) => {
        const ptOrders = orders.filter(
          (o) => o.partnerId === pt.id || o.partnerId === pt.partnerId || o.partnerSlug === pt.slug
        );
        const gross = ptOrders.reduce((acc, o) => acc + o.subtotal, 0);
        return { partner: pt, orderCount: ptOrders.length, grossSales: gross };
      })
      .sort((a, b) => b.grossSales - a.grossSales || b.orderCount - a.orderCount)
      .slice(0, 5);
  }, [partners, orders]);

  // Recent Activity derived from live records
  const recentActivity = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      subtitle: string;
      ts: number;
      onClick: () => void;
    }> = [];

    for (const p of partners.slice(0, 4)) {
      items.push({
        id: `act-p-${p.id}`,
        title: p.status === 'APPROVED' ? `Partner approved: ${p.name}` : `Partner application: ${p.name}`,
        subtitle: `${new Date(p.createdAt).toLocaleDateString()} · ${p.category}`,
        ts: new Date(p.updatedAt || p.createdAt).getTime() || 0,
        onClick: () => openPartnerReviewModal(p)
      });
    }

    for (const o of orders.slice(0, 4)) {
      items.push({
        id: `act-o-${o.id}`,
        title: `Order ${o.orderNumber} (${o.status})`,
        subtitle: `${o.customerName} · $${o.total.toFixed(2)}`,
        ts: new Date(o.createdAt).getTime() || 0,
        onClick: () => setInspectingOrder(o)
      });
    }

    for (const e of earnings.slice(0, 3)) {
      items.push({
        id: `act-e-${e.id}`,
        title: `Partner earning ${e.status.toLowerCase()}`,
        subtitle: `${e.orderNumber} · +$${e.earningAmount.toFixed(2)}`,
        ts: new Date(e.createdAt).getTime() || 0,
        onClick: () => switchSection('payouts')
      });
    }

    return items.sort((a, b) => b.ts - a.ts).slice(0, 5);
  }, [partners, orders, earnings]);

  // Global search results across entities
  const globalSearchResults = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return [];
    const results: Array<{
      id: string;
      type: string;
      label: string;
      sublabel: string;
      onSelect: () => void;
    }> = [];

    for (const p of partners) {
      if (p.name.toLowerCase().includes(q) || p.partnerId.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)) {
        results.push({
          id: `sr-p-${p.id}`,
          type: 'Partner',
          label: p.name,
          sublabel: `${p.partnerId} · ${p.status}`,
          onSelect: () => {
            switchSection('partners');
            openPartnerReviewModal(p);
          }
        });
      }
    }

    for (const o of orders) {
      if (o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q)) {
        results.push({
          id: `sr-o-${o.id}`,
          type: 'Order',
          label: o.orderNumber,
          sublabel: `${o.customerName} · $${o.total.toFixed(2)}`,
          onSelect: () => {
            switchSection('orders');
            setInspectingOrder(o);
          }
        });
      }
    }

    for (const pr of products) {
      if (pr.name.toLowerCase().includes(q) || pr.sku.toLowerCase().includes(q)) {
        results.push({
          id: `sr-pr-${pr.id}`,
          type: 'Product',
          label: pr.name,
          sublabel: `${pr.sku} · $${pr.price.toFixed(2)}`,
          onSelect: () => {
            switchSection('products');
            openEditProductModal(pr);
          }
        });
      }
    }

    for (const art of articles) {
      if (art.title.toLowerCase().includes(q) || art.category.toLowerCase().includes(q)) {
        results.push({
          id: `sr-a-${art.id}`,
          type: 'Article',
          label: art.title,
          sublabel: `${art.category} · ${art.status}`,
          onSelect: () => {
            switchSection('articles');
            setEditingArticle(art);
          }
        });
      }
    }

    for (const u of users) {
      if (u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) {
        results.push({
          id: `sr-u-${u.uid}`,
          type: 'User',
          label: u.displayName,
          sublabel: `${u.email} · ${u.role}`,
          onSelect: () => {
            switchSection('users');
            setSearchUser(u.email);
          }
        });
      }
    }

    return results.slice(0, 8);
  }, [globalSearch, partners, orders, products, articles, users]);

  // Action Handlers
  const handleUpdatePartnerStatus = async (partnerId: string, status: PartnerStatus, notes?: string) => {
    setSavingPartnerReview(true);
    try {
      await dbService.updatePartner(partnerId, { preferredCategories: partnerReviewCategories });
      await dbService.updatePartnerStatus(partnerId, status, notes, 'SUPER_ADMIN');
      await reloadData();
      if (reviewingPartner && reviewingPartner.id === partnerId) {
        setReviewingPartner((prev) =>
          prev
            ? {
                ...prev,
                status,
                adminNotes: notes ?? prev.adminNotes,
                preferredCategories: partnerReviewCategories
              }
            : null
        );
      }
    } finally {
      setSavingPartnerReview(false);
    }
  };

  function openPartnerReviewModal(partner: Partner) {
    setReviewingPartner(partner);
    setPartnerAdminNotes(partner.adminNotes || '');
    setPartnerReviewCategories(partner.preferredCategories || []);
  }

  const handleCreateNewPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName.trim() || !newPartnerEmail.trim()) return;
    setSavingNewPartner(true);
    try {
      const slugBase = newPartnerName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const uniqueSlug = partners.some((p) => p.slug === slugBase)
        ? `${slugBase}-${Date.now().toString().slice(-4)}`
        : slugBase || `partner-${Date.now().toString().slice(-4)}`;

      await dbService.createPartner({
        partnerId: `WH-P-${String(partners.length + 1).padStart(6, '0')}`,
        name: newPartnerName.trim(),
        businessName: newPartnerName.trim(),
        slug: uniqueSlug,
        contactPerson: newPartnerContact.trim() || newPartnerName.trim(),
        email: newPartnerEmail.trim().toLowerCase(),
        phone: newPartnerPhone.trim() || undefined,
        category: newPartnerCategory,
        location: newPartnerLocation.trim() || 'United States',
        description:
          newPartnerDescription.trim() ||
          `Authorized Whole Harbor Wellness partner specializing in ${newPartnerCategory.toLowerCase()} optimization.`,
        status: newPartnerStatus,
        commissionRate: Number(newPartnerCommission) / 100,
        memberDiscountRate: Number(newPartnerDiscount) / 100,
        preferredCategories: ['metabolic', 'recovery', 'longevity'],
        createdAt: new Date().toISOString()
      });

      setAddPartnerOpen(false);
      setNewPartnerName('');
      setNewPartnerContact('');
      setNewPartnerEmail('');
      setNewPartnerPhone('');
      setNewPartnerLocation('');
      setNewPartnerDescription('');
      await reloadData();
    } finally {
      setSavingNewPartner(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await dbService.updateOrderStatus(orderId, status);
    if (inspectingOrder?.id === orderId) {
      setInspectingOrder((prev) => (prev ? { ...prev, status } : null));
    }
    await reloadData();
  };

  const handleUpdateEarningStatus = async (earningId: string, status: 'PENDING' | 'APPROVED' | 'PAID') => {
    await dbService.updatePartnerEarningStatus(earningId, status);
    await reloadData();
  };

  const handleUpdateUserRole = async (
    uid: string,
    role: UserRole,
    wholesaleApprovalStatus?: UserProfile['wholesaleApprovalStatus']
  ) => {
    await dbService.updateUserRole(uid, role, wholesaleApprovalStatus);
    await reloadData();
  };

  const handleUpdateUserStatus = async (
    uid: string,
    status: UserProfile['status'],
    partnerId?: string,
    partnerSlug?: string
  ) => {
    await dbService.updateUserStatus(uid, status, partnerId, partnerSlug);
    await reloadData();
  };

  const handleUpdateInquiryStatus = async (id: string, status: ContactInquiry['status']) => {
    await dbService.updateInquiryStatus(id, status);
    await reloadData();
  };

  const openCreateProductModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdSku('');
    setProdCategory('metabolic');
    setProdStatus('ACTIVE');
    setProdPrice(250);
    setProdWholesalePrice(175);
    setProdPurity('99.5%');
    setProdStock(50);
    setProdLotNumber('2026-A');
    setProdImageUrl('/images/products/tirzepatide.jpg');
    setProdShortDesc('');
    setProdDescription('');
    setProdDisclosures('For research and educational wellness use. Store lyophilized vials at 2°C–8°C protected from light.');
    setProdEducationalMaterial('');
    setProductModalOpen(true);
  };

  function openEditProductModal(product: Product) {
    setEditingProduct(product);
    setProdName(product.name);
    setProdSku(product.sku);
    setProdCategory(product.category);
    setProdStatus(product.status);
    setProdPrice(product.price);
    setProdWholesalePrice(product.wholesalePrice ?? Math.round(product.price * 0.7));
    setProdPurity(product.purity || '99.5%');
    setProdStock(product.stockQuantity);
    setProdLotNumber(product.lotNumber || '2026-A');
    setProdImageUrl(product.imageUrl);
    setProdShortDesc(product.shortDescription);
    setProdDescription(product.description);
    setProdDisclosures(product.disclosures || '');
    setProdEducationalMaterial(product.educationalMaterial || '');
    setProductModalOpen(true);
  }

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProdImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const numericPrice = Number(prodPrice);
    const numericWholesale = Number(prodWholesalePrice);

    if (editingProduct) {
      const updatedStrengths = editingProduct.strengths?.length
        ? editingProduct.strengths.map((s, idx) => (idx === 0 ? { ...s, price: numericPrice } : s))
        : [
            { label: '5mg (10 Vials)', vialsCount: 10, price: numericPrice },
            { label: '10mg (10 Vials)', vialsCount: 10, price: Math.round(numericPrice * 1.75) }
          ];

      await dbService.updateProduct(editingProduct.id, {
        name: prodName,
        sku: prodSku || editingProduct.sku,
        category: prodCategory,
        categoryLabel: CATEGORY_LABELS[prodCategory] || 'Peptide',
        status: prodStatus,
        price: numericPrice,
        wholesalePrice: numericWholesale,
        purity: prodPurity,
        stockQuantity: Number(prodStock),
        lotNumber: prodLotNumber,
        imageUrl: prodImageUrl,
        shortDescription: prodShortDesc,
        description: prodDescription || prodShortDesc,
        disclosures: prodDisclosures,
        educationalMaterial: prodEducationalMaterial,
        strengths: updatedStrengths
      });
    } else {
      const newProd: Omit<Product, 'id'> = {
        name: prodName,
        slug,
        sku: prodSku || `WH-${slug.slice(0, 4).toUpperCase()}-2026`,
        category: prodCategory,
        categoryLabel: CATEGORY_LABELS[prodCategory] || 'Peptide',
        shortDescription: prodShortDesc,
        description: prodDescription || prodShortDesc,
        disclosures: prodDisclosures,
        educationalMaterial: prodEducationalMaterial,
        price: numericPrice,
        wholesalePrice: numericWholesale,
        stockQuantity: Number(prodStock),
        status: prodStatus,
        featured: false,
        purity: prodPurity,
        lotNumber: prodLotNumber,
        imageUrl: prodImageUrl,
        strengths: [
          { label: '5mg (10 Vials)', vialsCount: 10, price: numericPrice },
          { label: '10mg (10 Vials)', vialsCount: 10, price: Math.round(numericPrice * 1.75) }
        ],
        createdAt: new Date().toISOString()
      };

      await dbService.createProduct(newProd);
    }

    setProductModalOpen(false);
    setEditingProduct(null);
    await reloadData();
  };

  const handleQuickProductStatus = async (product: Product, newStatus: ProductStatus) => {
    await dbService.updateProduct(product.id, { status: newStatus });
    await reloadData();
  };

  const handleCopyText = (id: string, value: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    await dbService.createAuditLog({
      userId: currentUser?.uid,
      userRole: 'ADMIN',
      action: 'SECURITY_EVENT',
      resource: 'Session',
      resourceId: 'platform-settings',
      metadata: { scope: 'PlatformSettings', ...settings }
    });
    setSettingsSavedNotice(true);
    setTimeout(() => setSettingsSavedNotice(false), 3000);
    await reloadData();
  };

  const adminFirstName = currentUser?.displayName ? currentUser.displayName.split(' ')[0] : 'Admin';
  const adminInitials = currentUser?.displayName
    ? currentUser.displayName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD';

  const navItems: Array<{
    id: AdminSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'partners', label: 'Partners', icon: Handshake },
    { id: 'applications', label: 'Applications', icon: FileText, badge: pendingApplications.length },
    { id: 'partner-users', label: 'Partner Users', icon: Users },
    { id: 'orders', label: 'Sales & Orders', icon: ShoppingCart },
    { id: 'payouts', label: 'Earnings', icon: Wallet },
    { id: 'partner-pages', label: 'Partner Pages', icon: Link2 },
    { id: 'products', label: 'Product Catalog', icon: Package },
    { id: 'programs', label: 'Wellness Programs', icon: Flower2 },
    { id: 'articles', label: 'Articles', icon: BookOpen },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'testimonials', label: 'Testimonials', icon: Star },
    { id: 'inquiries', label: 'Inquiries', icon: Mail, badge: openInquiries.length },
    { id: 'media', label: 'Media Library', icon: ImageIcon },
    { id: 'website-pages', label: 'Website Pages', icon: Layers },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'users', label: 'Users & Roles', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const sectionTitleMap: Record<AdminSection, string> = {
    overview: 'Overview',
    partners: 'Partners',
    applications: 'Partner Applications',
    'partner-users': 'Partner Users',
    orders: 'Sales & Orders',
    payouts: 'Earnings & Commissions',
    'partner-pages': 'Partner Pages',
    products: 'Product Catalog',
    programs: 'Wellness Programs',
    articles: 'Articles',
    faqs: 'FAQs',
    testimonials: 'Testimonials',
    inquiries: 'Inquiries Inbox',
    media: 'Media Library',
    'website-pages': 'Website Pages',
    analytics: 'Analytics & Reports',
    users: 'Users & Roles',
    settings: 'Settings'
  };

  const totalAlertsCount = pendingApplications.length + openInquiries.length + pendingOrdersCount;

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#0c2340] via-[#0a1e37] to-[#07172b] text-[#fffdfb]">
      {/* Brand Header with Official Website Logo */}
      <div className="px-4 pt-5 pb-4 border-b border-white/10">
        <button
          type="button"
          onClick={() => navigate('home')}
          title="Return to Whole Harbor Wellness Storefront"
          className="w-full flex items-center gap-3 p-2 rounded-2xl bg-[#fffdfb] border border-[#dfd7c7] shadow-sm hover:border-[#c5a059] transition-colors cursor-pointer text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden p-0.5">
            <img
              src="/images/whw-logo.png"
              alt="Whole Harbor Wellness Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <span className="font-serif font-bold text-base text-[#0c2340] block leading-tight truncate">
              Whole Harbor
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#c5a059] block">
              Wellness Admin
            </span>
          </div>
        </button>
      </div>

      {/* Scrollable Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5" aria-label="Admin navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => switchSection(item.id)}
              className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#c5a059] text-[#fffdfb] font-semibold shadow-sm'
                  : 'text-[#dfd7c7]/90 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#fffdfb]' : 'text-[#c5a059]'}`} />
                <span className="truncate whitespace-nowrap">{item.label}</span>
              </span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center tabular-nums shrink-0 ${
                    isActive ? 'bg-[#0c2340] text-white' : 'bg-[#c5a059] text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Storefront / Support & Admin Account */}
      <div className="p-3 border-t border-white/10 space-y-1.5">
        <button
          type="button"
          onClick={() => navigate('home')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-medium text-[#dfd7c7] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <Store className="w-4 h-4 text-[#c5a059]" />
            <span>View Storefront</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </button>

        <button
          type="button"
          onClick={() => navigate('contact')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-medium text-[#dfd7c7] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <Headphones className="w-4 h-4 text-[#c5a059]" />
            <span>Support</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </button>

        <div className="relative pt-1">
          <button
            type="button"
            onClick={() => setSidebarProfileOpen((prev) => !prev)}
            className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-white/8 hover:bg-white/14 border border-white/10 transition-colors cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-full bg-[#c5a059] text-white font-bold text-xs flex items-center justify-center shrink-0">
              {adminInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{adminFirstName}</p>
              <p className="text-[10px] text-[#dfd7c7]/80 truncate">{currentUser?.email || 'admin@wholeharborwellness.com'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#dfd7c7] shrink-0" />
          </button>

          {sidebarProfileOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl bg-[#fffdfb] border border-[#dfd7c7] shadow-xl p-1.5 text-xs text-[#0c2340] z-40">
              <button
                type="button"
                onClick={() => {
                  setSidebarProfileOpen(false);
                  navigate('home');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#f6f4ee] flex items-center gap-2 cursor-pointer"
              >
                <Store className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Storefront Home</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSidebarProfileOpen(false);
                  switchSection('settings');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#f6f4ee] flex items-center gap-2 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Platform Settings</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSidebarProfileOpen(false);
                  logout();
                  navigate('home');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-700 flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f8f4] flex items-center justify-center p-8 text-[#5a6b7c]">
        <div className="text-center space-y-3">
          <span className="w-9 h-9 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin inline-block" />
          <p className="font-serif text-lg text-[#0c2340]">Initializing Whole Harbor Executive Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f8f4] text-[#111d2b] font-sans flex">
      {/* Desktop Fixed Admin Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen shadow-xl z-30">
        <div className="w-full h-full">{renderSidebarContent()}</div>
      </aside>

      {/* Mobile / Tablet Slide-Over Admin Sidebar */}
      {sidebarMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex bg-[#0c2340]/50 backdrop-blur-xs"
          onClick={() => setSidebarMobileOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation menu"
        >
          <div className="w-72 max-w-[85vw] h-full relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSidebarMobileOpen(false)}
              aria-label="Close admin sidebar"
              className="absolute top-4 right-3 z-10 w-9 h-9 rounded-full bg-[#0c2340] text-white border border-white/20 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* Right Main Content Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Utility Header */}
        <header className="sticky top-0 z-20 h-16 bg-[#fffdfb]/95 backdrop-blur-md border-b border-[#dfd7c7] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle + Breadcrumb */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarMobileOpen(true)}
              aria-label="Open admin menu"
              className="lg:hidden w-10 h-10 rounded-xl border border-[#dfd7c7] bg-white text-[#0c2340] flex items-center justify-center cursor-pointer shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>

            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#5a6b7c] min-w-0">
              <button
                type="button"
                onClick={() => switchSection('overview')}
                className="flex items-center gap-1.5 hover:text-[#0c2340] font-medium cursor-pointer whitespace-nowrap"
              >
                <Home className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Admin</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#dfd7c7] shrink-0" />
              <span className="font-semibold text-[#0c2340] truncate whitespace-nowrap">
                {sectionTitleMap[activeSection]}
              </span>
            </nav>
          </div>

          {/* Center: Global Live Search */}
          <div ref={searchBoxRef} className="relative hidden md:block flex-1 max-w-md">
            <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-[#f6f4ee] border border-[#dfd7c7] focus-within:border-[#c5a059] focus-within:bg-white transition-colors">
              <Search className="w-4 h-4 text-[#5a6b7c] shrink-0" />
              <input
                type="text"
                placeholder="Search partners, orders, products, articles..."
                value={globalSearch}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setSearchFocused(true);
                }}
                className="w-full bg-transparent text-xs text-[#0c2340] placeholder-[#5a6b7c] focus:outline-none"
              />
              {globalSearch && (
                <button
                  type="button"
                  onClick={() => setGlobalSearch('')}
                  aria-label="Clear search"
                  className="text-[#5a6b7c] hover:text-[#0c2340] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {searchFocused && globalSearch.trim().length > 0 && (
              <div className="absolute left-0 right-0 mt-1.5 rounded-2xl bg-[#fffdfb] border border-[#dfd7c7] shadow-xl p-2 z-30 max-h-80 overflow-y-auto">
                {globalSearchResults.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-[#5a6b7c]">
                    No matching partners, orders, products, or articles found.
                  </p>
                ) : (
                  globalSearchResults.map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => {
                        res.onSelect();
                        setSearchFocused(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f6f4ee] flex items-center justify-between gap-3 cursor-pointer transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#0c2340] truncate">{res.label}</p>
                        <p className="text-[11px] text-[#5a6b7c] truncate">{res.sublabel}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059] shrink-0">
                        {res.type}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right: Notifications & Admin Menu */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  setProfileMenuOpen(false);
                }}
                aria-label="Action notifications"
                className="relative w-10 h-10 rounded-xl border border-[#dfd7c7] bg-white hover:border-[#c5a059] text-[#0c2340] flex items-center justify-center cursor-pointer transition-colors"
              >
                <Bell className="w-4 h-4" />
                {totalAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#c5a059] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {totalAlertsCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#fffdfb] border border-[#dfd7c7] shadow-xl p-3 z-40 space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#dfd7c7]">
                    <span className="font-serif font-bold text-sm text-[#0c2340]">Action Queue</span>
                    <span className="text-[11px] text-[#5a6b7c] tabular-nums">{totalAlertsCount} items</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-1.5">
                    {pendingApplications.slice(0, 3).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setNotificationsOpen(false);
                          openPartnerReviewModal(p);
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-[#f6f4ee] hover:bg-[#efe9dc] cursor-pointer transition-colors"
                      >
                        <p className="font-semibold text-[#0c2340]">Application: {p.name}</p>
                        <p className="text-[11px] text-[#5a6b7c]">{p.status} · Click to review</p>
                      </button>
                    ))}
                    {openInquiries.slice(0, 2).map((inq) => (
                      <button
                        key={inq.id}
                        type="button"
                        onClick={() => {
                          setNotificationsOpen(false);
                          switchSection('inquiries');
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-[#f6f4ee] hover:bg-[#efe9dc] cursor-pointer transition-colors"
                      >
                        <p className="font-semibold text-[#0c2340]">Inquiry from {inq.name}</p>
                        <p className="text-[11px] text-[#5a6b7c] truncate">{inq.message}</p>
                      </button>
                    ))}
                    {totalAlertsCount === 0 && (
                      <p className="py-4 text-center text-[#5a6b7c]">All applications &amp; inquiries reviewed.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen((prev) => !prev);
                  setNotificationsOpen(false);
                }}
                className="h-10 pl-1.5 pr-3 rounded-xl border border-[#dfd7c7] bg-white hover:border-[#c5a059] flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-[#0c2340] text-[#c5a059] text-[11px] font-bold flex items-center justify-center">
                  {adminInitials}
                </span>
                <span className="hidden sm:inline text-xs font-semibold text-[#0c2340] whitespace-nowrap">
                  {adminFirstName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#5a6b7c]" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#fffdfb] border border-[#dfd7c7] shadow-xl p-1.5 text-xs text-[#0c2340] z-40">
                  <div className="px-3 py-2 border-b border-[#dfd7c7]/60 mb-1">
                    <p className="font-semibold truncate">{currentUser?.displayName}</p>
                    <p className="text-[10px] text-[#5a6b7c] truncate">{currentUser?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate('home');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#f6f4ee] flex items-center gap-2 cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>View Storefront</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      switchSection('settings');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#f6f4ee] flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Admin Settings</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                      navigate('home');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-700 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Scrollable Viewport */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1440px] w-full mx-auto space-y-6">
          {/* ============================================================== */}
          {/* SECTION 1: OVERVIEW (Matches Reference Layout + WHW Theme)     */}
          {/* ============================================================== */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Greeting & Action Row */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0c2340] tracking-tight">
                    {getTimeGreeting()}, {adminFirstName}
                  </h1>
                  <p className="text-sm text-[#5a6b7c] mt-1">
                    Here&rsquo;s what&rsquo;s happening across your wellness platform.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative">
                    <select
                      value={overviewRange}
                      onChange={(e) => setOverviewRange(e.target.value as '30d' | '90d' | 'ytd' | 'all')}
                      aria-label="Overview timeframe"
                      className="h-10 pl-3.5 pr-8 rounded-xl bg-white border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] cursor-pointer hover:border-[#c5a059] focus:outline-none"
                    >
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                      <option value="ytd">Year to Date</option>
                      <option value="all">All Time</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={openCreateProductModal}
                    className="h-10 px-4 rounded-xl bg-white border border-[#dfd7c7] hover:border-[#c5a059] text-[#0c2340] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>New Formulation</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddPartnerOpen(true)}
                    className="h-10 px-4 rounded-xl bg-[#0c2340] hover:bg-[#c5a059] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Partner</span>
                  </button>
                </div>
              </div>

              {/* 4 KPI Stat Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <button
                  type="button"
                  onClick={() => switchSection('partners')}
                  className="text-left bg-white border border-[#dfd7c7] hover:border-[#c5a059] rounded-2xl p-5 flex items-center justify-between gap-3 transition-all shadow-[0_6px_20px_rgba(12,35,64,0.03)] cursor-pointer"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#0c2340] text-[#c5a059] flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-[#5a6b7c] block">Total Partners</span>
                      <span className="font-serif text-3xl font-bold text-[#0c2340] tabular-nums leading-tight block mt-0.5">
                        {partners.length}
                      </span>
                      <span className="text-[11px] font-semibold text-[#0c2340] mt-1 inline-block">
                        {partners.length > 0 ? `${Math.round((activePartnersCount / partners.length) * 100)}% verified` : 'Network ready'}
                      </span>
                    </div>
                  </div>
                  <KpiSparkBars values={[35, 42, 46, 58, 66, 78, 92]} tone="navy" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPartnerStatusFilter('APPROVED');
                    switchSection('partners');
                  }}
                  className="text-left bg-white border border-[#dfd7c7] hover:border-[#c5a059] rounded-2xl p-5 flex items-center justify-between gap-3 transition-all shadow-[0_6px_20px_rgba(12,35,64,0.03)] cursor-pointer"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#0c2340] text-emerald-300 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-[#5a6b7c] block">Active Partners</span>
                      <span className="font-serif text-3xl font-bold text-[#0c2340] tabular-nums leading-tight block mt-0.5">
                        {activePartnersCount}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 mt-1 inline-block">
                        Approved clinics
                      </span>
                    </div>
                  </div>
                  <KpiSparkBars values={[40, 44, 52, 60, 72, 80, 88]} tone="sage" />
                </button>

                <button
                  type="button"
                  onClick={() => switchSection('applications')}
                  className="text-left bg-white border border-[#dfd7c7] hover:border-[#c5a059] rounded-2xl p-5 flex items-center justify-between gap-3 transition-all shadow-[0_6px_20px_rgba(12,35,64,0.03)] cursor-pointer"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#c5a059] text-white flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-[#5a6b7c] block">Pending Applications</span>
                      <span className="font-serif text-3xl font-bold text-[#0c2340] tabular-nums leading-tight block mt-0.5">
                        {pendingApplications.length}
                      </span>
                      <span className="text-[11px] font-semibold text-[#c5a059] mt-1 inline-block">
                        {pendingApplications.length > 0 ? 'Review queue' : 'All caught up'}
                      </span>
                    </div>
                  </div>
                  <KpiSparkBars values={[28, 34, 48, 52, 66, 76, 84]} tone="gold" />
                </button>

                <button
                  type="button"
                  onClick={() => switchSection('orders')}
                  className="text-left bg-white border border-[#dfd7c7] hover:border-[#c5a059] rounded-2xl p-5 flex items-center justify-between gap-3 transition-all shadow-[0_6px_20px_rgba(12,35,64,0.03)] cursor-pointer"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#0c2340] text-[#fffdfb] flex items-center justify-center shrink-0">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-[#5a6b7c] block">Total Orders</span>
                      <span className="font-serif text-3xl font-bold text-[#0c2340] tabular-nums leading-tight block mt-0.5">
                        {rangeOrders.length}
                      </span>
                      <span className="text-[11px] font-semibold text-[#0c2340] mt-1 inline-block tabular-nums">
                        ${totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })} gross
                      </span>
                    </div>
                  </div>
                  <KpiSparkBars values={[30, 42, 48, 55, 70, 82, 98]} tone="navy" />
                </button>
              </div>

              {/* Middle Split: Sales & Referral Performance Chart + Partner Earnings Highlight Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                <div className="lg:col-span-8 bg-white border border-[#dfd7c7] rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-[0_6px_20px_rgba(12,35,64,0.03)]">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <h2 className="font-serif text-xl font-bold text-[#0c2340]">
                        Sales &amp; Referral Performance
                      </h2>
                      <div className="flex items-center gap-5 mt-1.5 text-xs text-[#5a6b7c]">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#0c2340] inline-block" />
                          <span>Total Sales</span>
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059] inline-block" />
                          <span>Partner Sales</span>
                        </span>
                      </div>
                    </div>

                    <select
                      value={chartMonths}
                      onChange={(e) => setChartMonths(Number(e.target.value) as 6 | 12)}
                      aria-label="Chart period"
                      className="h-9 px-3 rounded-xl bg-[#f6f4ee] border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] cursor-pointer"
                    >
                      <option value={6}>Last 6 months</option>
                      <option value={12}>Last 12 months</option>
                    </select>
                  </div>

                  <SalesPerformanceChart orders={rangeOrders} monthsCount={chartMonths} />
                </div>

                {/* Partner Earnings Dark Navy Card (Matching Screenshot Highlight Card) */}
                <div className="lg:col-span-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c2340] via-[#0c2340] to-[#17365d] text-[#fffdfb] p-6 flex flex-col justify-between border border-[#c5a059]/30 shadow-lg">
                  <svg
                    viewBox="0 0 240 240"
                    className="pointer-events-none absolute -right-10 -bottom-10 w-56 h-56 text-[#c5a059]/10"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M120 20c45 30 70 85 55 140-35 10-80 0-105-40C55 85 75 45 120 20zm-55 95c30 10 55 35 65 70-35 5-65-15-80-45 2-10 8-18 15-25z"
                    />
                  </svg>

                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <span className="font-serif text-lg font-semibold text-[#fffdfb]">Partner Earnings</span>
                    </div>

                    <div>
                      <div className="font-serif text-4xl sm:text-[42px] font-bold tracking-tight text-white tabular-nums leading-none">
                        ${totalPartnerEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <p className="text-xs text-[#dfd7c7] mt-2">
                        Eligible &amp; Paid Partner Commissions
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 pt-6 mt-6 border-t border-white/15 flex items-end justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/12 text-[#c5a059] text-xs font-bold tabular-nums">
                        {earnings.length} ledger entries
                      </span>
                      <p className="text-[11px] text-[#dfd7c7]/90 mt-1.5 tabular-nums">
                        ${pendingEarningsTotal.toFixed(2)} pending · ${paidEarningsTotal.toFixed(2)} paid
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => switchSection('payouts')}
                      className="h-9 px-3.5 rounded-xl bg-white/10 hover:bg-[#c5a059] border border-white/25 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom 3-Column Row: Applications + Top Partners + Recent Activity */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                {/* Recent Partner Applications */}
                <div className="xl:col-span-5 bg-white border border-[#dfd7c7] rounded-2xl overflow-hidden shadow-[0_6px_20px_rgba(12,35,64,0.03)] flex flex-col">
                  <div className="px-5 py-4 border-b border-[#dfd7c7] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#c5a059]" />
                      <h3 className="font-serif text-lg font-bold text-[#0c2340]">Recent Partner Applications</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => switchSection('applications')}
                      className="text-xs font-semibold text-[#0c2340] hover:text-[#c5a059] flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#f6f4ee] text-[#5a6b7c] border-b border-[#dfd7c7]">
                        <tr>
                          <th className="px-4 py-2.5 font-semibold">Organization</th>
                          <th className="px-4 py-2.5 font-semibold">Contact</th>
                          <th className="px-4 py-2.5 font-semibold">Category</th>
                          <th className="px-4 py-2.5 font-semibold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#dfd7c7]/50">
                        {partners.slice(0, 4).map((p) => {
                          const statusBadge =
                            p.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : p.status === 'UNDER REVIEW'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : p.status === 'DECLINED' || p.status === 'SUSPENDED'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200';
                          return (
                            <tr
                              key={p.id}
                              onClick={() => openPartnerReviewModal(p)}
                              className="hover:bg-[#f6f4ee]/60 cursor-pointer transition-colors"
                            >
                              <td className="px-4 py-3 font-semibold text-[#0c2340]">{p.name}</td>
                              <td className="px-4 py-3 text-[#5a6b7c]">{p.phone || p.contactPerson}</td>
                              <td className="px-4 py-3 text-[#5a6b7c]">{p.category}</td>
                              <td className="px-4 py-3 text-right">
                                <span className={`inline-block px-2 py-0.5 rounded-md border text-[10px] font-bold ${statusBadge}`}>
                                  {p.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Performing Partners */}
                <div className="xl:col-span-4 bg-white border border-[#dfd7c7] rounded-2xl overflow-hidden shadow-[0_6px_20px_rgba(12,35,64,0.03)] flex flex-col">
                  <div className="px-5 py-4 border-b border-[#dfd7c7] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#c5a059]" />
                      <h3 className="font-serif text-lg font-bold text-[#0c2340]">Top Performing Partners</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => switchSection('partners')}
                      className="text-xs font-semibold text-[#0c2340] hover:text-[#c5a059] flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#f6f4ee] text-[#5a6b7c] border-b border-[#dfd7c7]">
                        <tr>
                          <th className="px-4 py-2.5 font-semibold">Partner</th>
                          <th className="px-4 py-2.5 font-semibold text-right">Orders</th>
                          <th className="px-4 py-2.5 font-semibold text-right">Sales</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#dfd7c7]/50">
                        {topPartners.slice(0, 4).map(({ partner: pt, orderCount, grossSales }) => (
                          <tr
                            key={pt.id}
                            onClick={() => navigate('partner-page', pt.slug)}
                            className="hover:bg-[#f6f4ee]/60 cursor-pointer transition-colors"
                          >
                            <td className="px-4 py-3 font-semibold text-[#0c2340]">{pt.name}</td>
                            <td className="px-4 py-3 text-right text-[#5a6b7c] tabular-nums">{orderCount}</td>
                            <td className="px-4 py-3 text-right font-bold text-[#0c2340] tabular-nums">
                              ${grossSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="xl:col-span-3 bg-white border border-[#dfd7c7] rounded-2xl overflow-hidden shadow-[0_6px_20px_rgba(12,35,64,0.03)] flex flex-col">
                  <div className="px-5 py-4 border-b border-[#dfd7c7] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#c5a059]" />
                      <h3 className="font-serif text-lg font-bold text-[#0c2340]">Recent Activity</h3>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 flex-1">
                    {recentActivity.map((act) => (
                      <button
                        key={act.id}
                        type="button"
                        onClick={act.onClick}
                        className="w-full text-left flex items-start gap-2.5 group cursor-pointer"
                      >
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-[#c5a059] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#0c2340] group-hover:text-[#c5a059] transition-colors truncate">
                            {act.title}
                          </p>
                          <p className="text-[11px] text-[#5a6b7c] truncate">{act.subtitle}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 2: PARTNERS & PARTNER APPLICATIONS                     */}
          {/* ============================================================== */}
          {(activeSection === 'partners' || activeSection === 'applications') && (
            <div className="bg-white border border-[#dfd7c7] rounded-2xl overflow-hidden shadow-[0_6px_20px_rgba(12,35,64,0.03)]">
              <div className="px-6 py-5 border-b border-[#dfd7c7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#0c2340]">
                    {activeSection === 'applications' ? 'Partner Applications Queue' : 'Partner Directory & Network'}
                  </h2>
                  <p className="text-xs text-[#5a6b7c] mt-0.5">
                    {activeSection === 'applications'
                      ? 'Review new clinic and wellness studio applications, assign product categories, and approve wholesale privileges.'
                      : 'Manage approved partner storefronts, commission rates, and clinic onboarding status.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddPartnerOpen(true)}
                  className="h-10 px-4 rounded-xl bg-[#0c2340] hover:bg-[#c5a059] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Partner</span>
                </button>
              </div>

              <div className="p-4 bg-[#f6f4ee] border-b border-[#dfd7c7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1 bg-white border border-[#dfd7c7] rounded-xl px-3 h-10">
                  <Search className="w-4 h-4 text-[#5a6b7c]" />
                  <input
                    type="text"
                    placeholder="Search partners by name, ID, location, or contact email..."
                    value={searchPartner}
                    onChange={(e) => setSearchPartner(e.target.value)}
                    className="w-full text-xs text-[#0c2340] placeholder-[#5a6b7c] focus:outline-none"
                  />
                </div>

                {activeSection === 'partners' && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {(['ALL', 'NEW', 'UNDER REVIEW', 'APPROVED', 'NEEDS INFORMATION', 'DECLINED', 'SUSPENDED'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setPartnerStatusFilter(st)}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
                          partnerStatusFilter === st
                            ? 'bg-[#0c2340] text-white'
                            : 'bg-white border border-[#dfd7c7] text-[#5a6b7c] hover:text-[#0c2340]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fffdfb] text-[#0c2340] font-serif border-b border-[#dfd7c7]">
                    <tr>
                      <th className="p-4 font-bold">Partner ID</th>
                      <th className="p-4 font-bold">Organization</th>
                      <th className="p-4 font-bold">Owner / Contact</th>
                      <th className="p-4 font-bold">Category &amp; Location</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dfd7c7]/40 text-[#5a6b7c]">
                    {partners
                      .filter((p) => {
                        const matchesTab =
                          activeSection === 'applications'
                            ? PENDING_PARTNER_STATUSES.includes(p.status)
                            : partnerStatusFilter === 'ALL' || p.status === partnerStatusFilter;
                        const q = searchPartner.toLowerCase();
                        const matchesSearch =
                          !q ||
                          p.name.toLowerCase().includes(q) ||
                          p.partnerId.toLowerCase().includes(q) ||
                          p.email.toLowerCase().includes(q) ||
                          (p.location || '').toLowerCase().includes(q);
                        return matchesTab && matchesSearch;
                      })
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-[#f6f4ee]/40 transition-colors">
                          <td className="p-4 font-mono font-bold text-[#c5a059]">{p.partnerId}</td>
                          <td className="p-4">
                            <div className="font-semibold text-[#0c2340]">{p.name}</div>
                            <button
                              type="button"
                              onClick={() => navigate('partner-page', p.slug)}
                              className="text-[11px] text-[#c5a059] hover:underline cursor-pointer"
                            >
                              /partner/{p.slug} ↗
                            </button>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-[#0c2340]">{p.contactPerson}</div>
                            <div className="text-[11px] text-[#5a6b7c]">{p.email}</div>
                          </td>
                          <td className="p-4">
                            <div>{p.category}</div>
                            {p.location && <div className="text-[11px] text-[#5a6b7c]">{p.location}</div>}
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-0.5 rounded-md bg-[#f6f4ee] border border-[#dfd7c7] text-[#0c2340] text-[10px] font-bold uppercase">
                              {p.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openPartnerReviewModal(p)}
                                className="px-3 py-1.5 rounded-lg bg-[#0c2340] text-white text-[11px] font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer"
                              >
                                Review
                              </button>
                              <select
                                value={p.status}
                                onChange={(e) => handleUpdatePartnerStatus(p.id, e.target.value as PartnerStatus, p.adminNotes)}
                                aria-label={`Status for ${p.name}`}
                                className="px-2 py-1.5 rounded-lg bg-white border border-[#dfd7c7] text-[11px] font-semibold text-[#0c2340] cursor-pointer"
                              >
                                {PARTNER_STATUS_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 3: USERS & ROLES / PARTNER USERS                       */}
          {/* ============================================================== */}
          {(activeSection === 'users' || activeSection === 'partner-users') && (
            <div className="bg-white border border-[#dfd7c7] rounded-2xl overflow-hidden shadow-[0_6px_20px_rgba(12,35,64,0.03)]">
              <div className="px-6 py-5 border-b border-[#dfd7c7]">
                <h2 className="font-serif text-2xl font-bold text-[#0c2340]">
                  {activeSection === 'partner-users' ? 'Partner Users & Clinic Staff' : 'Users, Roles & Access Control'}
                </h2>
                <p className="text-xs text-[#5a6b7c] mt-0.5">
                  Manage client, partner owner, staff, and administrator roles, wholesale pricing clearance, and linked clinics.
                </p>
              </div>

              <div className="p-4 bg-[#f6f4ee] border-b border-[#dfd7c7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1 bg-white border border-[#dfd7c7] rounded-xl px-3 h-10">
                  <Search className="w-4 h-4 text-[#5a6b7c]" />
                  <input
                    type="text"
                    placeholder="Search clients, partners, or admins by name, email, or business..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="w-full text-xs text-[#0c2340] placeholder-[#5a6b7c] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {(
                    [
                      { key: 'ALL', label: `All (${users.length})` },
                      { key: 'CLIENTS', label: `Clients (${users.filter((u) => u.role === 'CUSTOMER').length})` },
                      {
                        key: 'PARTNERS',
                        label: `Partners (${users.filter((u) => u.role === 'PARTNER_OWNER' || u.role === 'PARTNER_STAFF').length})`
                      },
                      {
                        key: 'ADMINS',
                        label: `Admins (${users.filter((u) => u.role === 'ADMIN' || u.role === 'SALES_ADMIN').length})`
                      }
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setUserRoleFilter(item.key)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
                        userRoleFilter === item.key
                          ? 'bg-[#0c2340] text-white'
                          : 'bg-white border border-[#dfd7c7] text-[#5a6b7c] hover:text-[#0c2340]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fffdfb] text-[#0c2340] font-serif border-b border-[#dfd7c7]">
                    <tr>
                      <th className="p-4 font-bold">Account</th>
                      <th className="p-4 font-bold">Linked Partner</th>
                      <th className="p-4 font-bold">Role</th>
                      <th className="p-4 font-bold">Wholesale Access</th>
                      <th className="p-4 font-bold">Account Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dfd7c7]/40 text-[#5a6b7c]">
                    {users
                      .filter((u) => {
                        const matchesTier =
                          userRoleFilter === 'ALL' ||
                          (userRoleFilter === 'CLIENTS' && u.role === 'CUSTOMER') ||
                          (userRoleFilter === 'PARTNERS' && (u.role === 'PARTNER_OWNER' || u.role === 'PARTNER_STAFF')) ||
                          (userRoleFilter === 'ADMINS' && (u.role === 'ADMIN' || u.role === 'SALES_ADMIN'));

                        const q = searchUser.trim().toLowerCase();
                        const matchesSearch =
                          !q ||
                          u.displayName.toLowerCase().includes(q) ||
                          u.email.toLowerCase().includes(q) ||
                          (u.businessName || '').toLowerCase().includes(q);
                        return matchesTier && matchesSearch;
                      })
                      .map((u) => (
                        <tr key={u.uid} className="hover:bg-[#f6f4ee]/40 transition-colors">
                          <td className="p-4">
                            <div className="font-semibold text-[#0c2340]">{u.displayName}</div>
                            <div className="text-[11px] text-[#5a6b7c]">{u.email}</div>
                          </td>
                          <td className="p-4">
                            <select
                              value={u.partnerId || ''}
                              onChange={(e) => {
                                const chosen = partners.find((p) => p.partnerId === e.target.value || p.id === e.target.value);
                                handleUpdateUserStatus(
                                  u.uid,
                                  u.status || 'ACTIVE',
                                  chosen ? chosen.partnerId : '',
                                  chosen ? chosen.slug : ''
                                );
                              }}
                              aria-label={`Partner assignment for ${u.displayName}`}
                              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#dfd7c7] text-[11px] font-medium text-[#0c2340] cursor-pointer max-w-[175px]"
                            >
                              <option value="">None ({u.role === 'CUSTOMER' ? 'Direct Client' : 'HQ'})</option>
                              {partners.map((pt) => (
                                <option key={pt.id} value={pt.partnerId}>
                                  {pt.name} ({pt.partnerId})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-4">
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateUserRole(u.uid, e.target.value as UserRole, u.wholesaleApprovalStatus)}
                              aria-label={`Role for ${u.displayName}`}
                              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#dfd7c7] text-[11px] font-semibold text-[#0c2340] cursor-pointer"
                            >
                              <option value="CUSTOMER">CUSTOMER (Client)</option>
                              <option value="PARTNER_OWNER">PARTNER_OWNER</option>
                              <option value="PARTNER_STAFF">PARTNER_STAFF</option>
                              <option value="SALES_ADMIN">SALES_ADMIN</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <select
                              value={u.wholesaleApprovalStatus || 'NONE'}
                              onChange={(e) =>
                                handleUpdateUserRole(
                                  u.uid,
                                  u.role,
                                  e.target.value as UserProfile['wholesaleApprovalStatus']
                                )
                              }
                              aria-label={`Wholesale status for ${u.displayName}`}
                              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#dfd7c7] text-[11px] font-semibold text-[#0c2340] cursor-pointer"
                            >
                              <option value="NONE">NONE (Retail Only)</option>
                              <option value="PENDING">PENDING</option>
                              <option value="APPROVED">APPROVED</option>
                              <option value="DECLINED">DECLINED</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <select
                              value={u.status || 'ACTIVE'}
                              onChange={(e) =>
                                handleUpdateUserStatus(
                                  u.uid,
                                  e.target.value as UserProfile['status'],
                                  u.partnerId,
                                  u.partnerSlug
                                )
                              }
                              aria-label={`Status for ${u.displayName}`}
                              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#dfd7c7] text-[11px] font-bold uppercase text-[#0c2340] cursor-pointer"
                            >
                              <option value="ACTIVE">ACTIVE</option>
                              <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
                              <option value="INACTIVE">INACTIVE</option>
                              <option value="SUSPENDED">SUSPENDED</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 4: SALES & ORDER FULFILLMENT                           */}
          {/* ============================================================== */}
          {activeSection === 'orders' && (
            <div className="bg-white border border-[#dfd7c7] rounded-2xl overflow-hidden shadow-[0_6px_20px_rgba(12,35,64,0.03)]">
              <div className="px-6 py-5 border-b border-[#dfd7c7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#0c2340]">Sales &amp; Cold-Chain Orders</h2>
                  <p className="text-xs text-[#5a6b7c] mt-0.5">
                    Inspect customer orders, update fulfillment dispatch status, and verify partner commission attribution.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    downloadCsv(
                      'whw-orders.csv',
                      ['Order Number', 'Date', 'Customer', 'Partner', 'Total', 'Status', 'Tracking'],
                      filteredOrders.map((o) => [
                        o.orderNumber,
                        o.createdAt,
                        o.customerName,
                        o.partnerName || 'Direct Retail',
                        o.total.toFixed(2),
                        o.status,
                        o.trackingNumber || ''
                      ])
                    )
                  }
                  className="h-9 px-3.5 rounded-xl bg-white border border-[#dfd7c7] hover:border-[#c5a059] text-[#0c2340] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="p-4 bg-[#f6f4ee] border-b border-[#dfd7c7] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1 bg-white border border-[#dfd7c7] rounded-xl px-3 h-10">
                  <Search className="w-4 h-4 text-[#5a6b7c]" />
                  <input
                    type="text"
                    placeholder="Search orders by number, customer, or tracking number..."
                    value={searchOrder}
                    onChange={(e) => setSearchOrder(e.target.value)}
                    className="w-full text-xs text-[#0c2340] placeholder-[#5a6b7c] focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value as 'ALL' | OrderStatus)}
                    aria-label="Filter orders by status"
                    className="h-10 px-3 rounded-xl bg-white border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>

                  <select
                    value={orderChannelFilter}
                    onChange={(e) => setOrderChannelFilter(e.target.value as 'ALL' | 'PARTNER' | 'DIRECT')}
                    aria-label="Filter orders by channel"
                    className="h-10 px-3 rounded-xl bg-white border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] cursor-pointer"
                  >
                    <option value="ALL">All Channels</option>
                    <option value="PARTNER">Partner Attributed</option>
                    <option value="DIRECT">Direct Retail</option>
                  </select>

                  <select
                    value={orderDateFilter}
                    onChange={(e) => setOrderDateFilter(e.target.value as 'all' | 'current_month' | 'prev_month' | 'ytd')}
                    aria-label="Filter orders by date"
                    className="h-10 px-3 rounded-xl bg-white border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] cursor-pointer"
                  >
                    <option value="all">Lifetime History</option>
                    <option value="current_month">Current Month</option>
                    <option value="prev_month">Previous Month</option>
                    <option value="ytd">Year to Date (YTD)</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fffdfb] text-[#0c2340] font-serif border-b border-[#dfd7c7]">
                    <tr>
                      <th className="p-4 font-bold">Order Number</th>
                      <th className="p-4 font-bold">Date</th>
                      <th className="p-4 font-bold">Customer</th>
                      <th className="p-4 font-bold">Attributed Partner</th>
                      <th className="p-4 font-bold">Value</th>
                      <th className="p-4 font-bold">Cold-Chain Tracking</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dfd7c7]/40 text-[#5a6b7c]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-[#5a6b7c]">
                          No orders match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#f6f4ee]/40">
                          <td className="p-4 font-mono font-bold text-[#0c2340]">{ord.orderNumber}</td>
                          <td className="p-4 tabular-nums">{new Date(ord.createdAt).toLocaleDateString()}</td>
                          <td className="p-4 font-medium text-[#0c2340]">{ord.customerName}</td>
                          <td className="p-4">
                            {ord.partnerName ? (
                              <span className="text-[#c5a059] font-semibold">
                                {ord.partnerName} (${(ord.partnerCommission || 0).toFixed(2)})
                              </span>
                            ) : (
                              <span>Direct Retail</span>
                            )}
                          </td>
                          <td className="p-4 font-bold text-[#0c2340] tabular-nums">${ord.total.toFixed(2)}</td>
                          <td className="p-4 font-mono text-[11px] text-[#c5a059]">{ord.trackingNumber || 'WH-EXP-CC-8291'}</td>
                          <td className="p-4">
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                              aria-label={`Order status for ${ord.orderNumber}`}
                              className="px-2 py-1 rounded-lg bg-white border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] cursor-pointer"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="PROCESSING">PROCESSING</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              type="button"
                              onClick={() => setInspectingOrder(ord)}
                              className="px-3 py-1.5 rounded-lg bg-[#0c2340] text-white text-[11px] font-semibold hover:bg-[#c5a059] cursor-pointer"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 5: EARNINGS & COMMISSION LEDGER                        */}
          {/* ============================================================== */}
          {activeSection === 'payouts' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-[#dfd7c7] rounded-2xl p-5">
                  <span className="text-xs text-[#5a6b7c]">Total Partner Earnings</span>
                  <p className="font-serif text-3xl font-bold text-[#0c2340] mt-1 tabular-nums">
                    ${totalPartnerEarnings.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white border border-[#dfd7c7] rounded-2xl p-5">
                  <span className="text-xs text-[#5a6b7c]">Pending / Approved Payouts</span>
                  <p className="font-serif text-3xl font-bold text-[#c5a059] mt-1 tabular-nums">
                    ${pendingEarningsTotal.toFixed(2)}
                  </p>
                </div>
                <div className="bg-[#0c2340] text-white rounded-2xl p-5">
                  <span className="text-xs text-[#dfd7c7]">Disbursed to Clinics</span>
                  <p className="font-serif text-3xl font-bold text-white mt-1 tabular-nums">
                    ${paidEarningsTotal.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-[#dfd7c7] rounded-2xl overflow-hidden shadow-[0_6px_20px_rgba(12,35,64,0.03)]">
                <div className="px-6 py-5 border-b border-[#dfd7c7] flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#0c2340]">Commission Payout Ledger</h2>
                    <p className="text-xs text-[#5a6b7c]">Audit partner attribution earnings, approve balances, and mark payouts disbursed.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      downloadCsv(
                        'whw-earnings-ledger.csv',
                        ['Ledger ID', 'Order', 'Customer', 'Gross Sales', 'Earning', 'Status'],
                        earnings.map((e) => [e.id, e.orderNumber, e.customerName, e.grossSales.toFixed(2), e.earningAmount.toFixed(2), e.status])
                      )
                    }
                    className="h-9 px-3.5 rounded-xl bg-white border border-[#dfd7c7] hover:border-[#c5a059] text-[#0c2340] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Export Ledger</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#fffdfb] text-[#0c2340] font-serif border-b border-[#dfd7c7]">
                      <tr>
                        <th className="p-4 font-bold">Ledger ID</th>
                        <th className="p-4 font-bold">Order Number</th>
                        <th className="p-4 font-bold">Customer</th>
                        <th className="p-4 font-bold">Gross Sales</th>
                        <th className="p-4 font-bold">Earning Amount</th>
                        <th className="p-4 font-bold">Audit Status</th>
                        <th className="p-4 font-bold text-right">Payout Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dfd7c7]/40 text-[#5a6b7c]">
                      {earnings.map((e) => (
                        <tr key={e.id} className="hover:bg-[#f6f4ee]/40">
                          <td className="p-4 font-mono">{e.id.slice(0, 10)}</td>
                          <td className="p-4 font-mono font-semibold text-[#0c2340]">{e.orderNumber}</td>
                          <td className="p-4">{e.customerName}</td>
                          <td className="p-4 tabular-nums">${e.grossSales.toFixed(2)}</td>
                          <td className="p-4 font-bold text-[#c5a059] tabular-nums">${e.earningAmount.toFixed(2)}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-0.5 rounded-md bg-[#f6f4ee] border border-[#dfd7c7] text-[#0c2340] text-[10px] font-bold">
                              {e.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1.5">
                            {e.status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateEarningStatus(e.id, 'APPROVED')}
                                className="px-3 py-1.5 rounded-lg bg-[#c5a059] text-white text-[11px] font-semibold hover:bg-[#0c2340] cursor-pointer"
                              >
                                Approve Commission
                              </button>
                            )}
                            {e.status === 'APPROVED' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateEarningStatus(e.id, 'PAID')}
                                className="px-3 py-1.5 rounded-lg bg-[#0c2340] text-white text-[11px] font-semibold hover:bg-[#c5a059] cursor-pointer"
                              >
                                Disburse &amp; Mark Paid
                              </button>
                            )}
                            {e.status === 'PAID' && (
                              <span className="text-[11px] font-semibold text-emerald-700">Paid</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 6: PARTNER PAGES DIRECTORY                             */}
          {/* ============================================================== */}
          {activeSection === 'partner-pages' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#dfd7c7] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#0c2340]">Partner Storefronts &amp; Referral Links</h2>
                  <p className="text-xs text-[#5a6b7c] mt-0.5">
                    Launch dedicated clinic microsites, copy tracked referral links, or configure featured product categories.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('partners')}
                  className="h-10 px-4 rounded-xl bg-white border border-[#dfd7c7] hover:border-[#c5a059] text-xs font-semibold text-[#0c2340] flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Open Public Ecosystem</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {partners.map((pt) => {
                  const shareUrl = `${window.location.origin}/#/partner/${pt.slug}`;
                  return (
                    <div key={pt.id} className="bg-white border border-[#dfd7c7] rounded-2xl p-5 flex flex-col justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#c5a059]">{pt.partnerId}</span>
                          <span className="text-[10px] font-bold uppercase text-[#5a6b7c]">{pt.status}</span>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-[#0c2340]">{pt.name}</h3>
                        <p className="text-xs text-[#5a6b7c] line-clamp-2">{pt.description}</p>
                        <div className="text-[11px] text-[#0c2340] pt-1">
                          Commission: <strong>{(pt.commissionRate * 100).toFixed(0)}%</strong> · Member VIP Discount:{' '}
                          <strong>{(pt.memberDiscountRate * 100).toFixed(0)}%</strong>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#dfd7c7] flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate('partner-page', pt.slug)}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#0c2340] hover:bg-[#c5a059] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <span>Open Live Page</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyText(`pp-${pt.id}`, shareUrl)}
                          className="py-2 px-3 rounded-xl bg-[#f6f4ee] border border-[#dfd7c7] hover:border-[#c5a059] text-[#0c2340] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === `pp-${pt.id}` ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === `pp-${pt.id}` ? 'Copied' : 'Copy Link'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openPartnerReviewModal(pt)}
                          className="py-2 px-3 rounded-xl bg-white border border-[#dfd7c7] hover:border-[#0c2340] text-[#0c2340] text-xs font-semibold cursor-pointer"
                        >
                          Configure
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 7: PRODUCT CATALOG CMS                                 */}
          {/* ============================================================== */}
          {activeSection === 'products' && (
            <div className="bg-white border border-[#dfd7c7] rounded-2xl overflow-hidden shadow-[0_6px_20px_rgba(12,35,64,0.03)]">
              <div className="px-6 py-5 border-b border-[#dfd7c7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#0c2340]">Product Catalog Management</h2>
                  <p className="text-xs text-[#5a6b7c] mt-0.5">
                    Edit formulations, adjust retail and wholesale 10-vial pricing, upload images, or toggle availability.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openCreateProductModal}
                  className="h-10 px-4 rounded-xl bg-[#0c2340] hover:bg-[#c5a059] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              </div>

              <div className="p-4 bg-[#f6f4ee] border-b border-[#dfd7c7]">
                <div className="flex items-center gap-2.5 bg-white border border-[#dfd7c7] rounded-xl px-3 h-10 max-w-md">
                  <Search className="w-4 h-4 text-[#5a6b7c]" />
                  <input
                    type="text"
                    placeholder="Filter products by name, SKU, or category..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="w-full text-xs text-[#0c2340] placeholder-[#5a6b7c] focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fffdfb] text-[#0c2340] font-serif border-b border-[#dfd7c7]">
                    <tr>
                      <th className="p-4 font-bold">Product</th>
                      <th className="p-4 font-bold">Category</th>
                      <th className="p-4 font-bold">Retail / Wholesale</th>
                      <th className="p-4 font-bold">Purity</th>
                      <th className="p-4 font-bold">Stock</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dfd7c7]/40 text-[#5a6b7c]">
                    {products
                      .filter((p) => {
                        const q = searchProduct.trim().toLowerCase();
                        return !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.categoryLabel.toLowerCase().includes(q);
                      })
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-[#f6f4ee]/40">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-10 h-10 rounded-lg object-cover bg-[#f6f4ee] border border-[#dfd7c7]"
                              />
                              <div>
                                <button
                                  type="button"
                                  onClick={() => navigate('product-detail', p.slug)}
                                  className="font-semibold text-[#0c2340] hover:text-[#c5a059] block text-left cursor-pointer"
                                >
                                  {p.name}
                                </button>
                                <span className="font-mono text-[10px] text-[#5a6b7c]">{p.sku}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">{p.categoryLabel}</td>
                          <td className="p-4 tabular-nums">
                            <span className="font-bold text-[#0c2340]">${p.price.toFixed(2)}</span>
                            <span className="block text-[10px] text-[#c5a059]">
                              Wholesale: ${(p.wholesalePrice ?? Math.round(p.price * 0.7)).toFixed(2)}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-[#c5a059]">{p.purity || '99.4%'}</td>
                          <td className="p-4 tabular-nums">{p.stockQuantity} kits</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-[#f6f4ee] border border-[#dfd7c7] text-[#0c2340] text-[10px] font-bold uppercase">
                              {p.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditProductModal(p)}
                                className="px-2.5 py-1 rounded-lg bg-[#0c2340] text-white text-[11px] font-semibold hover:bg-[#c5a059] cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickProductStatus(p, p.status === 'UNAVAILABLE' ? 'ACTIVE' : 'UNAVAILABLE')}
                                className="px-2.5 py-1 rounded-lg border border-[#dfd7c7] bg-white text-[#0c2340] hover:border-[#c5a059] text-[11px] font-semibold cursor-pointer"
                              >
                                {p.status === 'UNAVAILABLE' ? 'Mark Active' : 'Unavailable'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickProductStatus(p, p.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED')}
                                className="px-2.5 py-1 rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 text-[11px] font-semibold cursor-pointer"
                              >
                                {p.status === 'DISABLED' ? 'Enable' : 'Disable'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 8: CMS (Programs, Articles, FAQs, Testimonials, Inbox) */}
          {/* ============================================================== */}
          {activeSection === 'programs' && (
            <div className="bg-white border border-[#dfd7c7] rounded-2xl p-6 space-y-5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#0c2340]">Wellness Programs ({programs.length})</h2>
                  <p className="text-[#5a6b7c]">Manage structured clinical programs published on the Wellness Programs storefront page.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('wellness-programs')}
                    className="h-9 px-3.5 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] font-semibold hover:border-[#c5a059] cursor-pointer"
                  >
                    View Live Page ↗
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingProgram({
                        name: '',
                        duration: '12 Weeks',
                        category: 'Metabolic',
                        tag: 'Physician Guided',
                        shortDescription: '',
                        fullDescription: '',
                        priceMonthly: 299,
                        features: [],
                        status: 'ACTIVE',
                        featured: true
                      })
                    }
                    className="h-9 px-4 rounded-xl bg-[#0c2340] hover:bg-[#c5a059] text-white font-semibold cursor-pointer"
                  >
                    + Add Program
                  </button>
                </div>
              </div>

              {editingProgram && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const slug = (editingProgram.name || 'program')
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)/g, '');
                    if (editingProgram.id) {
                      await dbService.updateProgram(editingProgram.id, editingProgram);
                    } else {
                      await dbService.createProgram({
                        name: editingProgram.name || 'New Program',
                        slug,
                        duration: editingProgram.duration || '12 Weeks',
                        category: editingProgram.category || 'Metabolic',
                        tag: editingProgram.tag || 'Physician Guided',
                        shortDescription: editingProgram.shortDescription || '',
                        fullDescription: editingProgram.fullDescription || editingProgram.shortDescription || '',
                        priceMonthly: Number(editingProgram.priceMonthly || 299),
                        features: editingProgram.features || [],
                        status: editingProgram.status || 'ACTIVE',
                        featured: Boolean(editingProgram.featured),
                        createdAt: new Date().toISOString()
                      });
                    }
                    setEditingProgram(null);
                    await reloadData();
                  }}
                  className="p-4 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7] space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Program Name"
                      value={editingProgram.name || ''}
                      onChange={(e) => setEditingProgram({ ...editingProgram, name: e.target.value })}
                      className="px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                    <input
                      type="text"
                      placeholder="Duration (e.g. 12 Weeks)"
                      value={editingProgram.duration || ''}
                      onChange={(e) => setEditingProgram({ ...editingProgram, duration: e.target.value })}
                      className="px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                    <input
                      type="number"
                      placeholder="Monthly Price ($)"
                      value={editingProgram.priceMonthly ?? 299}
                      onChange={(e) => setEditingProgram({ ...editingProgram, priceMonthly: Number(e.target.value) })}
                      className="px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Category (Metabolic, Longevity...)"
                      value={editingProgram.category || ''}
                      onChange={(e) => setEditingProgram({ ...editingProgram, category: e.target.value })}
                      className="px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                    <input
                      type="text"
                      placeholder="Tag Label"
                      value={editingProgram.tag || ''}
                      onChange={(e) => setEditingProgram({ ...editingProgram, tag: e.target.value })}
                      className="px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                    <select
                      value={editingProgram.status || 'ACTIVE'}
                      onChange={(e) => setEditingProgram({ ...editingProgram, status: e.target.value as WellnessProgram['status'] })}
                      className="px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                  <textarea
                    rows={2}
                    required
                    placeholder="Short description..."
                    value={editingProgram.shortDescription || ''}
                    onChange={(e) => setEditingProgram({ ...editingProgram, shortDescription: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 rounded-lg bg-[#0c2340] text-white font-semibold cursor-pointer">
                      Save Program
                    </button>
                    <button type="button" onClick={() => setEditingProgram(null)} className="px-4 py-2 rounded-lg border border-[#dfd7c7] bg-white text-[#5a6b7c] cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {programs.map((pr) => (
                  <div key={pr.id} className="p-4 rounded-2xl border border-[#dfd7c7] bg-[#fffdfb] space-y-2">
                    <div className="flex justify-between font-semibold text-sm text-[#0c2340]">
                      <span>{pr.name}</span>
                      <span className="tabular-nums">${pr.priceMonthly}/mo</span>
                    </div>
                    <p className="text-[11px] text-[#5a6b7c]">{pr.shortDescription}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-bold text-[#c5a059]">{pr.status} · {pr.duration}</span>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => setEditingProgram(pr)} className="text-[#0c2340] font-semibold hover:text-[#c5a059] cursor-pointer">
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await dbService.deleteProgram(pr.id);
                            await reloadData();
                          }}
                          className="text-red-700 font-semibold hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'articles' && (
            <div className="bg-white border border-[#dfd7c7] rounded-2xl p-6 space-y-5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#0c2340]">Educational Articles ({articles.length})</h2>
                  <p className="text-[#5a6b7c]">Author and publish peptide research briefings shown in Learn Studio.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('learn')}
                    className="h-9 px-3.5 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] font-semibold hover:border-[#c5a059] cursor-pointer"
                  >
                    Open Learn Studio ↗
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingArticle({
                        title: '',
                        category: 'Peptide Protocols',
                        readTime: '5 min read',
                        author: 'Whole Harbor Clinical Team',
                        summary: '',
                        content: '',
                        imageUrl: '/images/learn/welcome.png',
                        status: 'PUBLISHED'
                      })
                    }
                    className="h-9 px-4 rounded-xl bg-[#0c2340] hover:bg-[#c5a059] text-white font-semibold cursor-pointer"
                  >
                    + Add Article
                  </button>
                </div>
              </div>

              {editingArticle && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const slug = (editingArticle.title || 'article')
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)/g, '');
                    if (editingArticle.id) {
                      await dbService.updateArticle(editingArticle.id, editingArticle);
                    } else {
                      await dbService.createArticle({
                        title: editingArticle.title || 'Untitled Article',
                        slug,
                        category: editingArticle.category || 'Peptide Protocols',
                        readTime: editingArticle.readTime || '5 min read',
                        summary: editingArticle.summary || '',
                        content: editingArticle.content || editingArticle.summary || '',
                        imageUrl: editingArticle.imageUrl || '/images/learn/welcome.png',
                        author: editingArticle.author || 'Whole Harbor Clinical Team',
                        status: editingArticle.status || 'PUBLISHED',
                        createdAt: new Date().toISOString()
                      });
                    }
                    setEditingArticle(null);
                    await reloadData();
                  }}
                  className="p-4 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7] space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Article Title"
                      value={editingArticle.title || ''}
                      onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                      className="px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      value={editingArticle.category || ''}
                      onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                      className="px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                    <select
                      value={editingArticle.status || 'PUBLISHED'}
                      onChange={(e) => setEditingArticle({ ...editingArticle, status: e.target.value as EducationalArticle['status'] })}
                      className="px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                    >
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                  <textarea
                    rows={2}
                    required
                    placeholder="Summary..."
                    value={editingArticle.summary || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, summary: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                  <textarea
                    rows={3}
                    placeholder="Full educational content..."
                    value={editingArticle.content || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 rounded-lg bg-[#0c2340] text-white font-semibold cursor-pointer">
                      Save Article
                    </button>
                    <button type="button" onClick={() => setEditingArticle(null)} className="px-4 py-2 rounded-lg border border-[#dfd7c7] bg-white text-[#5a6b7c] cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2.5">
                {articles.map((art) => (
                  <div key={art.id} className="p-4 rounded-xl border border-[#dfd7c7] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-sm text-[#0c2340] block">{art.title}</span>
                      <span className="text-[11px] text-[#5a6b7c]">{art.category} · {art.readTime} · {art.author}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-[#c5a059]">{art.status}</span>
                      <button type="button" onClick={() => setEditingArticle(art)} className="text-[#0c2340] font-semibold hover:text-[#c5a059] cursor-pointer">
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await dbService.deleteArticle(art.id);
                          await reloadData();
                        }}
                        className="text-red-700 font-semibold hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'faqs' && (
            <div className="bg-white border border-[#dfd7c7] rounded-2xl p-6 space-y-5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#0c2340]">Frequently Asked Questions ({faqs.length})</h2>
                  <p className="text-[#5a6b7c]">Maintain member &amp; partner FAQ answers synced with the public FAQ view.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('faq')}
                    className="h-9 px-3.5 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] font-semibold hover:border-[#c5a059] cursor-pointer"
                  >
                    View Live FAQ ↗
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingFaq({
                        question: '',
                        answer: '',
                        category: 'Protocols',
                        orderIndex: faqs.length + 1
                      })
                    }
                    className="h-9 px-4 rounded-xl bg-[#0c2340] hover:bg-[#c5a059] text-white font-semibold cursor-pointer"
                  >
                    + Add FAQ
                  </button>
                </div>
              </div>

              {editingFaq && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (editingFaq.id) {
                      await dbService.updateFaq(editingFaq.id, editingFaq);
                    } else {
                      await dbService.createFaq({
                        question: editingFaq.question || '',
                        answer: editingFaq.answer || '',
                        category: editingFaq.category || 'Protocols',
                        orderIndex: Number(editingFaq.orderIndex || faqs.length + 1),
                        createdAt: new Date().toISOString()
                      });
                    }
                    setEditingFaq(null);
                    await reloadData();
                  }}
                  className="p-4 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7] space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Question"
                      value={editingFaq.question || ''}
                      onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                      className="sm:col-span-2 px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      value={editingFaq.category || ''}
                      onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                      className="px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                  </div>
                  <textarea
                    rows={2}
                    required
                    placeholder="Answer..."
                    value={editingFaq.answer || ''}
                    onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 rounded-lg bg-[#0c2340] text-white font-semibold cursor-pointer">
                      Save FAQ
                    </button>
                    <button type="button" onClick={() => setEditingFaq(null)} className="px-4 py-2 rounded-lg border border-[#dfd7c7] bg-white text-[#5a6b7c] cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2.5">
                {faqs.map((fq) => (
                  <div key={fq.id} className="p-4 rounded-xl border border-[#dfd7c7] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-[#0c2340] block">{fq.question}</span>
                      <span className="text-[11px] text-[#5a6b7c]">{fq.category} · {fq.answer.slice(0, 110)}...</span>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <button type="button" onClick={() => setEditingFaq(fq)} className="text-[#0c2340] font-semibold hover:text-[#c5a059] cursor-pointer">
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await dbService.deleteFaq(fq.id);
                          await reloadData();
                        }}
                        className="text-red-700 font-semibold hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'testimonials' && (
            <div className="bg-white border border-[#dfd7c7] rounded-2xl p-6 space-y-5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#0c2340]">Verified Testimonials ({testimonials.length})</h2>
                  <p className="text-[#5a6b7c]">Manage clinician and member testimonials displayed across storefront pages.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingTestimonial({
                      name: '',
                      role: 'Clinic Director',
                      organization: '',
                      quote: '',
                      rating: 5,
                      verified: true,
                      featured: true
                    })
                  }
                  className="h-9 px-4 rounded-xl bg-[#0c2340] hover:bg-[#c5a059] text-white font-semibold cursor-pointer"
                >
                  + Add Testimonial
                </button>
              </div>

              {editingTestimonial && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (editingTestimonial.id) {
                      await dbService.updateTestimonial(editingTestimonial.id, editingTestimonial);
                    } else {
                      await dbService.createTestimonial({
                        name: editingTestimonial.name || 'Client',
                        role: editingTestimonial.role || 'Member',
                        organization: editingTestimonial.organization || '',
                        quote: editingTestimonial.quote || '',
                        rating: Number(editingTestimonial.rating || 5),
                        verified: Boolean(editingTestimonial.verified ?? true),
                        featured: Boolean(editingTestimonial.featured ?? true),
                        createdAt: new Date().toISOString()
                      });
                    }
                    setEditingTestimonial(null);
                    await reloadData();
                  }}
                  className="p-4 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7] space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Author Name"
                      value={editingTestimonial.name || ''}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                      className="px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                    <input
                      type="text"
                      placeholder="Role (e.g. Clinic Director)"
                      value={editingTestimonial.role || ''}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                      className="px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                    <input
                      type="text"
                      placeholder="Organization"
                      value={editingTestimonial.organization || ''}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, organization: e.target.value })}
                      className="px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                  </div>
                  <textarea
                    rows={2}
                    required
                    placeholder="Testimonial quote..."
                    value={editingTestimonial.quote || ''}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 rounded-lg bg-[#0c2340] text-white font-semibold cursor-pointer">
                      Save Testimonial
                    </button>
                    <button type="button" onClick={() => setEditingTestimonial(null)} className="px-4 py-2 rounded-lg border border-[#dfd7c7] bg-white text-[#5a6b7c] cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {testimonials.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl border border-[#dfd7c7] bg-[#fffdfb] space-y-2">
                    <p className="italic text-[#0c2340]">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center justify-between text-[11px] text-[#5a6b7c]">
                      <span>
                        <strong className="text-[#0c2340]">{t.name}</strong> · {t.organization || t.role}
                      </span>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => setEditingTestimonial(t)} className="text-[#0c2340] font-semibold hover:text-[#c5a059] cursor-pointer">
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await dbService.deleteTestimonial(t.id);
                            await reloadData();
                          }}
                          className="text-red-700 font-semibold hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'inquiries' && (
            <div className="bg-white border border-[#dfd7c7] rounded-2xl p-6 space-y-4 text-xs">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#0c2340]">
                  Customer &amp; Partner Inquiries ({inquiries.length})
                </h2>
                <p className="text-[#5a6b7c]">Respond to messages submitted via the Contact and About pages.</p>
              </div>
              {inquiries.length === 0 ? (
                <p className="p-8 rounded-xl bg-[#f6f4ee] border border-[#dfd7c7] text-center text-[#5a6b7c]">
                  No inquiries received yet. Messages submitted from Contact and About pages appear here.
                </p>
              ) : (
                <div className="space-y-3">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="p-4 rounded-2xl border border-[#dfd7c7] bg-[#fffdfb] space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-semibold text-sm text-[#0c2340]">{inq.name}</span>
                          <span className="text-[11px] text-[#5a6b7c] ml-2">
                            ({inq.email}) · {inq.department} · {new Date(inq.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <select
                          value={inq.status}
                          onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value as ContactInquiry['status'])}
                          aria-label={`Status for inquiry from ${inq.name}`}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#dfd7c7] text-[11px] font-bold text-[#0c2340] cursor-pointer"
                        >
                          <option value="NEW">NEW</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                        </select>
                      </div>
                      <p className="text-[#5a6b7c] leading-relaxed">{inq.message}</p>
                      {inq.orderNumber && (
                        <span className="inline-block font-mono text-[10px] px-2 py-0.5 rounded bg-[#f6f4ee] text-[#0c2340]">
                          Order Ref: {inq.orderNumber}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 9: MEDIA LIBRARY                                       */}
          {/* ============================================================== */}
          {activeSection === 'media' && (
            <div className="bg-white border border-[#dfd7c7] rounded-2xl p-6 space-y-5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#0c2340]">Media Library</h2>
                  <p className="text-[#5a6b7c]">Verified Whole Harbor Wellness brand crests, product photography, and Learn Studio assets.</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['ALL', 'Brand & Hero', 'Products', 'Learn Studio'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setMediaFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer ${
                        mediaFilter === cat ? 'bg-[#0c2340] text-white' : 'bg-[#f6f4ee] text-[#5a6b7c] hover:text-[#0c2340]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {MEDIA_LIBRARY_ASSETS.filter((m) => mediaFilter === 'ALL' || m.category === mediaFilter).map((asset) => (
                  <div key={asset.id} className="border border-[#dfd7c7] rounded-2xl overflow-hidden bg-[#fffdfb] flex flex-col">
                    <button
                      type="button"
                      onClick={() => setPreviewMediaUrl({ title: asset.title, url: asset.url })}
                      className="h-36 bg-[#f6f4ee] overflow-hidden cursor-pointer flex items-center justify-center p-2"
                    >
                      <img src={asset.url} alt={asset.title} className="w-full h-full object-contain rounded-lg" />
                    </button>
                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="font-semibold text-[#0c2340] truncate">{asset.title}</p>
                        <p className="text-[10px] text-[#5a6b7c]">{asset.category}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyText(asset.id, asset.url)}
                        className="w-full py-1.5 rounded-lg bg-[#f6f4ee] hover:bg-[#0c2340] hover:text-white text-[#0c2340] text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedId === asset.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === asset.id ? 'Path Copied' : 'Copy Asset Path'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 10: WEBSITE PAGES LAUNCHER                             */}
          {/* ============================================================== */}
          {activeSection === 'website-pages' && (
            <div className="bg-white border border-[#dfd7c7] rounded-2xl p-6 space-y-5 text-xs">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#0c2340]">Website Pages &amp; Routes</h2>
                <p className="text-[#5a6b7c]">Inspect and launch any public storefront, educational hub, or clinical route directly.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WEBSITE_ROUTES.map((rt) => (
                  <div key={rt.path} className="p-4 rounded-2xl border border-[#dfd7c7] bg-[#fffdfb] flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059] block">{rt.category}</span>
                      <h3 className="font-serif text-lg font-bold text-[#0c2340]">{rt.title}</h3>
                      <p className="text-[11px] text-[#5a6b7c] mt-0.5">{rt.description}</p>
                      <span className="font-mono text-[10px] text-[#5a6b7c] mt-1 inline-block">{rt.hash}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(rt.path)}
                      className="h-9 px-3.5 rounded-xl bg-[#0c2340] hover:bg-[#c5a059] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                    >
                      <span>Visit</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 11: ANALYTICS, REPORTS & AUDIT TRAIL                   */}
          {/* ============================================================== */}
          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#dfd7c7] rounded-2xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#0c2340]">Analytics &amp; Conversion Funnel</h2>
                    <p className="text-xs text-[#5a6b7c]">Live telemetry across storefront visits, formulation views, and partner conversions.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        downloadCsv(
                          'whw-partners-report.csv',
                          ['Partner ID', 'Name', 'Category', 'Status', 'Commission Rate'],
                          partners.map((p) => [p.partnerId, p.name, p.category, p.status, `${(p.commissionRate * 100).toFixed(0)}%`])
                        )
                      }
                      className="h-9 px-3.5 rounded-xl bg-white border border-[#dfd7c7] hover:border-[#c5a059] text-xs font-semibold text-[#0c2340] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span>Partners CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        downloadCsv(
                          'whw-orders-report.csv',
                          ['Order Number', 'Customer', 'Partner', 'Total', 'Status', 'Date'],
                          orders.map((o) => [o.orderNumber, o.customerName, o.partnerName || 'Direct', o.total.toFixed(2), o.status, o.createdAt])
                        )
                      }
                      className="h-9 px-3.5 rounded-xl bg-[#0c2340] hover:bg-[#c5a059] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Orders CSV</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7]">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#5a6b7c] block">Page Views</span>
                    <span className="font-serif text-2xl font-bold text-[#0c2340] tabular-nums">{analyticsSummary.pageViews}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7]">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#5a6b7c] block">Product Dossiers</span>
                    <span className="font-serif text-2xl font-bold text-[#0c2340] tabular-nums">{analyticsSummary.productViews}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7]">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#5a6b7c] block">Partner Landings</span>
                    <span className="font-serif text-2xl font-bold text-[#c5a059] tabular-nums">{analyticsSummary.partnerVisits}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7]">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#5a6b7c] block">Add to Carts</span>
                    <span className="font-serif text-2xl font-bold text-[#0c2340] tabular-nums">{analyticsSummary.addToCarts}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7] col-span-2 sm:col-span-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#5a6b7c] block">Checkouts</span>
                    <span className="font-serif text-2xl font-bold text-[#c5a059] tabular-nums">{analyticsSummary.checkouts}</span>
                  </div>
                </div>
              </div>

              {/* Partner Performance Comparison Table */}
              <div className="bg-white border border-[#dfd7c7] rounded-2xl overflow-hidden">
                <div className="px-6 py-4 bg-[#f6f4ee] border-b border-[#dfd7c7]">
                  <h3 className="font-serif text-lg font-bold text-[#0c2340]">Partner Performance Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#fffdfb] text-[#0c2340] font-serif border-b border-[#dfd7c7]">
                      <tr>
                        <th className="p-4 font-bold">Partner</th>
                        <th className="p-4 font-bold">Orders</th>
                        <th className="p-4 font-bold">Completion</th>
                        <th className="p-4 font-bold">Gross Referred Sales</th>
                        <th className="p-4 font-bold">Pending Commissions</th>
                        <th className="p-4 font-bold">Paid Commissions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dfd7c7]/40 text-[#5a6b7c]">
                      {partners.map((pt) => {
                        const ptOrders = orders.filter(
                          (o) => o.partnerId === pt.id || o.partnerId === pt.partnerId || o.partnerSlug === pt.slug
                        );
                        const completed = ptOrders.filter((o) => o.status === 'COMPLETED').length;
                        const rate = ptOrders.length > 0 ? Math.round((completed / ptOrders.length) * 100) : 0;
                        const gross = ptOrders.reduce((acc, o) => acc + o.subtotal, 0);
                        const ptEarnings = earnings.filter(
                          (e) => e.partnerId === pt.id || e.partnerId === pt.partnerId || e.partnerSlug === pt.slug
                        );
                        const pendingComm = ptEarnings
                          .filter((e) => e.status === 'PENDING' || e.status === 'APPROVED')
                          .reduce((acc, e) => acc + e.earningAmount, 0);
                        const paidComm = ptEarnings
                          .filter((e) => e.status === 'PAID')
                          .reduce((acc, e) => acc + e.earningAmount, 0);

                        return (
                          <tr key={pt.id} className="hover:bg-[#f6f4ee]/40">
                            <td className="p-4">
                              <span className="font-semibold text-[#0c2340] block">{pt.name}</span>
                              <span className="font-mono text-[10px] text-[#c5a059]">{pt.partnerId} · {pt.status}</span>
                            </td>
                            <td className="p-4 tabular-nums">{ptOrders.length} ({completed} completed)</td>
                            <td className="p-4 font-semibold text-[#0c2340] tabular-nums">{rate}%</td>
                            <td className="p-4 font-bold text-[#0c2340] tabular-nums">${gross.toFixed(2)}</td>
                            <td className="p-4 font-semibold text-amber-700 tabular-nums">${pendingComm.toFixed(2)}</td>
                            <td className="p-4 font-bold text-[#c5a059] tabular-nums">${paidComm.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Administrative Audit Trail */}
              <div className="bg-white border border-[#dfd7c7] rounded-2xl overflow-hidden">
                <div className="px-6 py-4 bg-[#f6f4ee] border-b border-[#dfd7c7]">
                  <h3 className="font-serif text-lg font-bold text-[#0c2340]">Administrative Audit Trail ({auditLogs.length})</h3>
                  <p className="text-[11px] text-[#5a6b7c]">Immutable record of partner reviews, role modifications, and catalog changes.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#fffdfb] text-[#0c2340] font-serif border-b border-[#dfd7c7]">
                      <tr>
                        <th className="p-4 font-bold">Timestamp</th>
                        <th className="p-4 font-bold">Action</th>
                        <th className="p-4 font-bold">Resource</th>
                        <th className="p-4 font-bold">Actor</th>
                        <th className="p-4 font-bold">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dfd7c7]/40 text-[#5a6b7c]">
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-[#5a6b7c]">
                            No audit events recorded yet. Partner status changes and product edits will appear here.
                          </td>
                        </tr>
                      ) : (
                        auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-[#f6f4ee]/40">
                            <td className="p-4 font-mono text-[11px] tabular-nums">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded bg-[#0c2340] text-white text-[10px] font-bold">
                                {log.action}
                              </span>
                            </td>
                            <td className="p-4 font-mono text-[11px] text-[#0c2340]">
                              {log.resource}: {log.resourceId || '—'}
                            </td>
                            <td className="p-4 font-semibold text-[#c5a059]">{log.userRole || 'ADMIN'}</td>
                            <td className="p-4 text-[11px] max-w-md truncate">
                              {log.metadata ? JSON.stringify(log.metadata) : '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 12: SETTINGS                                           */}
          {/* ============================================================== */}
          {activeSection === 'settings' && (
            <div className="bg-white border border-[#dfd7c7] rounded-2xl p-6 max-w-3xl space-y-6 text-xs">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#0c2340]">Platform &amp; Partner Operations Settings</h2>
                <p className="text-[#5a6b7c] mt-0.5">
                  Configure default commission attribution rates, cold-chain fulfillment disclosures, and storefront notices.
                </p>
              </div>

              {settingsSavedNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Platform settings saved and logged to the administrative audit trail.</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-[#0c2340] mb-1">Default Partner Commission (%)</label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={settings.defaultCommissionRate}
                      onChange={(e) => setSettings({ ...settings, defaultCommissionRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#0c2340] mb-1">Member Referral Discount (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={settings.memberDiscountRate}
                      onChange={(e) => setSettings({ ...settings, memberDiscountRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#0c2340] mb-1">Free Cold-Chain Threshold ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={settings.freeShippingThreshold}
                      onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#0c2340] mb-1">Cold-Chain Dispatch Disclosure</label>
                  <textarea
                    rows={2}
                    value={settings.coldChainNotice}
                    onChange={(e) => setSettings({ ...settings, coldChainNotice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0c2340] mb-1">Storefront Shipping Notice</label>
                  <input
                    type="text"
                    value={settings.announcementBanner}
                    onChange={(e) => setSettings({ ...settings, announcementBanner: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f6f4ee] border border-[#dfd7c7] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.wholesaleAutoReview}
                    onChange={(e) => setSettings({ ...settings, wholesaleAutoReview: e.target.checked })}
                    className="accent-[#0c2340]"
                  />
                  <span className="font-medium text-[#0c2340]">
                    Queue new partner wholesale applications for manual clinical compliance verification
                  </span>
                </label>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-[#0c2340] hover:bg-[#c5a059] text-white font-semibold cursor-pointer transition-colors"
                  >
                    Save Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings(DEFAULT_SETTINGS)}
                    className="h-10 px-4 rounded-xl bg-white border border-[#dfd7c7] text-[#5a6b7c] hover:text-[#0c2340] font-semibold cursor-pointer"
                  >
                    Reset Defaults
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* ================================================================== */}
      {/* MODAL 1: ADD PARTNER MODAL                                         */}
      {/* ================================================================== */}
      {addPartnerOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#0c2340]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setAddPartnerOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Add new partner clinic"
        >
          <div
            className="bg-[#fffdfb] w-full sm:max-w-xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#dfd7c7] shadow-2xl overflow-hidden text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 flex justify-between items-center border-b border-[#dfd7c7] bg-[#f6f4ee] px-5 sm:px-7 py-4 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#c5a059] block">
                  Partner Network Onboarding
                </span>
                <h3 className="font-serif text-xl font-bold text-[#0c2340]">Add Partner Organization</h3>
              </div>
              <button
                type="button"
                onClick={() => setAddPartnerOpen(false)}
                aria-label="Cancel adding partner"
                className="w-10 h-10 rounded-full bg-white border border-[#dfd7c7] hover:border-[#0c2340] text-[#5a6b7c] hover:text-[#0c2340] flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="whw-add-partner-form" onSubmit={handleCreateNewPartner} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">Organization / Clinic Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Harbor Health Collective"
                    value={newPartnerName}
                    onChange={(e) => setNewPartnerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">Primary Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Elena Vance"
                    value={newPartnerContact}
                    onChange={(e) => setNewPartnerContact(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">Partner Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="director@clinic.com"
                    value={newPartnerEmail}
                    onChange={(e) => setNewPartnerEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (310) 555-0194"
                    value={newPartnerPhone}
                    onChange={(e) => setNewPartnerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">Category</label>
                  <select
                    value={newPartnerCategory}
                    onChange={(e) => setNewPartnerCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  >
                    <option value="Longevity Clinic">Longevity Clinic</option>
                    <option value="Wellness Practice">Wellness Practice</option>
                    <option value="Fitness Studio">Fitness Studio</option>
                    <option value="Medical Concierge">Medical Concierge</option>
                    <option value="Nutrition & Recovery">Nutrition &amp; Recovery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">City / Region</label>
                  <input
                    type="text"
                    placeholder="Austin, TX"
                    value={newPartnerLocation}
                    onChange={(e) => setNewPartnerLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">Initial Status</label>
                  <select
                    value={newPartnerStatus}
                    onChange={(e) => setNewPartnerStatus(e.target.value as PartnerStatus)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  >
                    <option value="APPROVED">APPROVED</option>
                    <option value="UNDER REVIEW">UNDER REVIEW</option>
                    <option value="NEW">NEW</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">Commission Rate (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={newPartnerCommission}
                    onChange={(e) => setNewPartnerCommission(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">Member VIP Discount (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={newPartnerDiscount}
                    onChange={(e) => setNewPartnerDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#5a6b7c] font-medium mb-1">Storefront Overview</label>
                <textarea
                  rows={2}
                  placeholder="Clinical specialty, member focus, and wellness philosophy..."
                  value={newPartnerDescription}
                  onChange={(e) => setNewPartnerDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                />
              </div>
            </form>

            <div className="shrink-0 px-5 sm:px-7 py-3.5 pb-[calc(14px+env(safe-area-inset-bottom))] border-t border-[#dfd7c7] bg-[#f6f4ee] flex flex-col-reverse sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setAddPartnerOpen(false)}
                className="sm:w-32 py-3 px-4 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] hover:border-[#0c2340] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="whw-add-partner-form"
                disabled={savingNewPartner}
                className="flex-1 py-3 px-4 rounded-xl bg-[#0c2340] hover:bg-[#c5a059] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                {savingNewPartner ? 'Saving Partner...' : 'Create Partner Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL 2: PARTNER APPLICATION REVIEW MODAL                          */}
      {/* ================================================================== */}
      {reviewingPartner && (
        <div
          className="fixed inset-0 z-50 bg-[#0c2340]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setReviewingPartner(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Partner application review"
        >
          <div
            className="bg-[#fffdfb] w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#dfd7c7] shadow-2xl overflow-hidden text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 flex justify-between items-start border-b border-[#dfd7c7] bg-[#f6f4ee] px-5 sm:px-7 py-4 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {reviewingPartner.logoUrl && (
                  <img
                    src={reviewingPartner.logoUrl}
                    alt={reviewingPartner.name}
                    className="w-12 h-12 rounded-xl object-contain bg-white border border-[#dfd7c7] p-1 shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#c5a059] block truncate">
                    Partner Application Review · {reviewingPartner.partnerId}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0c2340] mt-0.5 truncate">
                    {reviewingPartner.name}
                  </h3>
                  <p className="text-[11px] text-[#5a6b7c]">
                    Submitted {new Date(reviewingPartner.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReviewingPartner(null)}
                aria-label="Close review modal"
                className="w-10 h-10 rounded-full bg-white border border-[#dfd7c7] hover:border-[#0c2340] text-[#5a6b7c] hover:text-[#0c2340] flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#f6f4ee] p-4 rounded-2xl border border-[#dfd7c7]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5a6b7c] block">Owner / Contact</span>
                  <span className="font-semibold text-[#0c2340]">{reviewingPartner.contactPerson}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5a6b7c] block">Email &amp; Phone</span>
                  <span className="font-semibold text-[#0c2340]">{reviewingPartner.email} · {reviewingPartner.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5a6b7c] block">Business Type</span>
                  <span className="font-semibold text-[#0c2340]">{reviewingPartner.category}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5a6b7c] block">Location</span>
                  <span className="font-semibold text-[#0c2340]">{reviewingPartner.location || reviewingPartner.address || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5a6b7c] block">Website</span>
                  <span className="font-semibold text-[#c5a059] break-all">{reviewingPartner.website || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5a6b7c] block">Member Base</span>
                  <span className="font-semibold text-[#0c2340]">{reviewingPartner.memberBaseSize || '—'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5a6b7c] block">Wellness Services</span>
                  <p className="p-3 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] mt-1">
                    {reviewingPartner.currentWellnessServices || reviewingPartner.description || '—'}
                  </p>
                </div>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold text-[#5a6b7c] mb-1.5">
                  Featured Wellness Categories on Storefront
                </span>
                <div className="flex flex-wrap gap-2">
                  {(['metabolic', 'cellular', 'recovery', 'longevity', 'stacks'] as ProductCategoryType[]).map((cat) => {
                    const selected = partnerReviewCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() =>
                          setPartnerReviewCategories((prev) =>
                            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                          )
                        }
                        className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                          selected ? 'bg-[#0c2340] text-white border-[#0c2340]' : 'bg-white text-[#5a6b7c] border-[#dfd7c7]'
                        }`}
                      >
                        {selected ? '✓ ' : '+ '}
                        {CATEGORY_LABELS[cat]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#5a6b7c] mb-1">
                  Admin Reviewer Notes (Internal)
                </label>
                <textarea
                  rows={2}
                  placeholder="Add verification notes, follow-up questions, or approval conditions..."
                  value={partnerAdminNotes}
                  onChange={(e) => setPartnerAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340]"
                />
              </div>
            </div>

            <div className="shrink-0 px-5 sm:px-7 py-3.5 pb-[calc(14px+env(safe-area-inset-bottom))] border-t border-[#dfd7c7] bg-[#f6f4ee] space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase font-bold text-[#5a6b7c]">
                  Status: <strong className="text-[#0c2340]">{reviewingPartner.status}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const slug = reviewingPartner.slug;
                      setReviewingPartner(null);
                      navigate('partner-page', slug);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#dfd7c7] text-[#c5a059] hover:border-[#c5a059] text-[11px] font-semibold cursor-pointer"
                  >
                    Open Storefront ↗
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewingPartner(null)}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] hover:border-[#0c2340] text-[11px] font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {PARTNER_STATUS_OPTIONS.map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={savingPartnerReview}
                    onClick={() => handleUpdatePartnerStatus(reviewingPartner.id, st, partnerAdminNotes)}
                    className={`px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                      reviewingPartner.status === st
                        ? 'bg-[#c5a059] text-white'
                        : 'bg-white border border-[#dfd7c7] text-[#0c2340] hover:bg-[#0c2340] hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL 3: ADD / EDIT PRODUCT MODAL                                  */}
      {/* ================================================================== */}
      {productModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#0c2340]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => {
            setProductModalOpen(false);
            setEditingProduct(null);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Product formulation editor"
        >
          <div
            className="bg-[#fffdfb] w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#dfd7c7] shadow-2xl overflow-hidden text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 flex justify-between items-center border-b border-[#dfd7c7] bg-[#f6f4ee] px-5 sm:px-7 py-4 gap-3">
              <h3 className="font-serif text-xl font-bold text-[#0c2340] truncate">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add Clinical Formulation'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setProductModalOpen(false);
                  setEditingProduct(null);
                }}
                aria-label="Cancel product edit"
                className="w-10 h-10 rounded-full bg-white border border-[#dfd7c7] hover:border-[#0c2340] text-[#5a6b7c] hover:text-[#0c2340] flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="whw-admin-product-form" onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[#5a6b7c] font-medium mb-1">Formulation Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Epithalon Telomeric Activator"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="WH-EPIT-2026"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">Category *</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as ProductCategoryType)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  >
                    <option value="metabolic">Metabolic Support</option>
                    <option value="cellular">Cellular Optimization</option>
                    <option value="recovery">Tissue Recovery</option>
                    <option value="longevity">Longevity &amp; Vitality</option>
                    <option value="stacks">Synergy Multi-Kits</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">Catalog Status *</label>
                  <select
                    value={prodStatus}
                    onChange={(e) => setProdStatus(e.target.value as ProductStatus)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  >
                    <option value="ACTIVE">ACTIVE (Visible &amp; Purchasable)</option>
                    <option value="UNAVAILABLE">UNAVAILABLE (Visible, Out of Stock)</option>
                    <option value="DISABLED">DISABLED (Hidden from Storefront)</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">Retail Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">Wholesale Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodWholesalePrice}
                    onChange={(e) => setProdWholesalePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">HPLC Purity *</label>
                  <input
                    type="text"
                    required
                    value={prodPurity}
                    onChange={(e) => setProdPurity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7] space-y-2">
                <label className="block text-[#0c2340] font-semibold">Product Image</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {prodImageUrl && (
                    <img
                      src={prodImageUrl}
                      alt="Product preview"
                      className="w-16 h-16 rounded-xl object-cover border border-[#dfd7c7] bg-white shrink-0"
                    />
                  )}
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="block w-full text-[11px] text-[#5a6b7c] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0c2340] file:text-white hover:file:bg-[#c5a059] cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="Or paste image path..."
                      value={prodImageUrl}
                      onChange={(e) => setProdImageUrl(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340] text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#5a6b7c] font-medium mb-1">Short Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Clinical mechanism and indication..."
                  value={prodShortDesc}
                  onChange={(e) => setProdShortDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                />
              </div>

              <div>
                <label className="block text-[#5a6b7c] font-medium mb-1">Full Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed formulation overview..."
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">Disclosures &amp; Storage</label>
                  <textarea
                    rows={2}
                    placeholder="Regulatory disclosures, storage temperature..."
                    value={prodDisclosures}
                    onChange={(e) => setProdDisclosures(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">Educational Material</label>
                  <textarea
                    rows={2}
                    placeholder="Protocol context, educational notes..."
                    value={prodEducationalMaterial}
                    onChange={(e) => setProdEducationalMaterial(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
              </div>
            </form>

            <div className="shrink-0 px-5 sm:px-7 py-3.5 pb-[calc(14px+env(safe-area-inset-bottom))] border-t border-[#dfd7c7] bg-[#f6f4ee] flex flex-col-reverse sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setProductModalOpen(false);
                  setEditingProduct(null);
                }}
                className="sm:w-32 py-3 px-4 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] hover:border-[#0c2340] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="whw-admin-product-form"
                className="flex-1 py-3 px-4 rounded-xl bg-[#0c2340] hover:bg-[#c5a059] text-white text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                {editingProduct ? 'Save Product Changes' : 'Save Formulation to Database'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL 4: ORDER DETAIL INSPECTION MODAL                             */}
      {/* ================================================================== */}
      {inspectingOrder && (
        <div
          className="fixed inset-0 z-50 bg-[#0c2340]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setInspectingOrder(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Order audit dossier"
        >
          <div
            className="bg-[#fffdfb] w-full sm:max-w-xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#dfd7c7] shadow-2xl overflow-hidden text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 flex justify-between items-start border-b border-[#dfd7c7] bg-[#f6f4ee] px-5 sm:px-7 py-4 gap-3">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#c5a059] block">
                  Order Audit &amp; Cold-Chain Dossier
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0c2340] mt-0.5 truncate">
                  {inspectingOrder.orderNumber}
                </h3>
                <p className="text-[11px] text-[#5a6b7c]">
                  Placed {new Date(inspectingOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingOrder(null)}
                aria-label="Close order dossier"
                className="w-10 h-10 rounded-full bg-white border border-[#dfd7c7] hover:border-[#0c2340] text-[#5a6b7c] hover:text-[#0c2340] flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#f6f4ee] p-4 rounded-2xl border border-[#dfd7c7]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5a6b7c] block">Customer</span>
                  <span className="font-semibold text-[#0c2340] block">{inspectingOrder.customerName}</span>
                  <span className="text-[#5a6b7c]">{inspectingOrder.customerEmail}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5a6b7c] block">Shipping Destination</span>
                  <span className="text-[#0c2340] block">
                    {inspectingOrder.shippingAddress?.addressLine1}, {inspectingOrder.shippingAddress?.city},{' '}
                    {inspectingOrder.shippingAddress?.state} {inspectingOrder.shippingAddress?.postalCode}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5a6b7c] block">Attribution</span>
                  <span className="font-semibold text-[#c5a059] block">
                    {inspectingOrder.partnerName || 'Direct Retail'}
                  </span>
                  <span className="font-mono text-[10px] text-[#5a6b7c]">
                    {inspectingOrder.referralSource || 'direct_store'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5a6b7c] block">Cold-Chain Tracking</span>
                  <span className="font-mono font-semibold text-[#0c2340] block">
                    {inspectingOrder.trackingNumber || 'WH-EXP-CC-PENDING'}
                  </span>
                  <span className="text-[10px] text-[#5a6b7c]">
                    Commission: ${(inspectingOrder.partnerCommission || 0).toFixed(2)} ({inspectingOrder.commissionStatus || 'NONE'})
                  </span>
                </div>
              </div>

              <div className="border border-[#dfd7c7] rounded-2xl overflow-hidden">
                <div className="bg-[#f6f4ee] px-4 py-2.5 font-semibold text-[#0c2340]">
                  Ordered Formulations ({inspectingOrder.items.length})
                </div>
                <div className="p-4 space-y-2 bg-white divide-y divide-[#dfd7c7]/40">
                  {inspectingOrder.items.map((item, idx) => (
                    <div key={idx} className="pt-2 first:pt-0 flex justify-between">
                      <span className="text-[#0c2340]">
                        {item.productName} ({item.selectedStrength.label}) × {item.quantity}
                      </span>
                      <span className="font-semibold text-[#0c2340] tabular-nums">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-3 flex justify-between font-serif font-bold text-sm text-[#0c2340]">
                    <span>Total Charged</span>
                    <span className="text-[#c5a059] tabular-nums">${inspectingOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 px-5 sm:px-7 py-3.5 pb-[calc(14px+env(safe-area-inset-bottom))] border-t border-[#dfd7c7] bg-[#f6f4ee] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#0c2340]">Status</span>
                <select
                  value={inspectingOrder.status}
                  onChange={(e) => handleUpdateOrderStatus(inspectingOrder.id, e.target.value as OrderStatus)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#dfd7c7] text-xs font-bold text-[#0c2340] cursor-pointer"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => setInspectingOrder(null)}
                className="px-5 py-2 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] hover:border-[#0c2340] text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL 5: MEDIA PREVIEW MODAL                                       */}
      {/* ================================================================== */}
      {previewMediaUrl && (
        <div
          className="fixed inset-0 z-50 bg-[#0c2340]/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setPreviewMediaUrl(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Media preview"
        >
          <div
            className="bg-[#fffdfb] w-full sm:max-w-lg max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#dfd7c7] shadow-2xl overflow-hidden text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 flex items-center justify-between px-5 py-4 bg-[#f6f4ee] border-b border-[#dfd7c7]">
              <h3 className="font-serif text-lg font-bold text-[#0c2340] truncate">{previewMediaUrl.title}</h3>
              <button
                type="button"
                onClick={() => setPreviewMediaUrl(null)}
                aria-label="Close media preview"
                className="w-10 h-10 rounded-full bg-white border border-[#dfd7c7] flex items-center justify-center text-[#0c2340] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col items-center gap-3 bg-white">
              <img src={previewMediaUrl.url} alt={previewMediaUrl.title} className="max-h-72 object-contain rounded-xl" />
              <span className="font-mono text-[11px] text-[#5a6b7c] break-all">{previewMediaUrl.url}</span>
            </div>
            <div className="shrink-0 px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] bg-[#f6f4ee] border-t border-[#dfd7c7] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleCopyText('modal-media', previewMediaUrl.url)}
                className="px-4 py-2 rounded-xl bg-[#0c2340] text-white font-semibold cursor-pointer"
              >
                {copiedId === 'modal-media' ? 'Copied Path' : 'Copy Path'}
              </button>
              <button
                type="button"
                onClick={() => setPreviewMediaUrl(null)}
                className="px-4 py-2 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
