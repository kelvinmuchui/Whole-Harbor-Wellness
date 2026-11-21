import React, { useState, useEffect, useMemo, useRef } from 'react';
import QRCode from 'qrcode';
import {
  LayoutDashboard,
  User,
  Link2,
  Package,
  ShoppingCart,
  Wallet,
  Globe,
  Flower2,
  BookOpen,
  BarChart3,
  Bell,
  Settings,
  Headphones,
  LogOut,
  Search,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  Trophy,
  Zap,
  Download,
  ExternalLink,
  Store,
  Menu,
  X,
  QrCode,
  ShieldCheck,
  Handshake,
  ArrowRight,
  Lock,
  Plus,
  Minus
} from 'lucide-react';
import { dbService } from '../services/dbService.ts';
import {
  Partner,
  Order,
  PartnerEarning,
  Product,
  ProductCategoryType,
  WellnessProgram,
  EducationalArticle
} from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { KpiSparkBars, PartnerPerformanceChart } from '../components/AdminCharts.tsx';
import partnerWelcomeHero from '../assets/images/partner_welcome_hero_1795244583921.jpg';
import partnerGrowthBanner from '../assets/images/partner_growth_banner_1795244583224.jpg';

interface PartnerDashboardViewProps {
  navigate: (path: string, param?: string) => void;
}

type PartnerSection =
  | 'overview'
  | 'profile'
  | 'referral'
  | 'wholesale'
  | 'orders'
  | 'earnings'
  | 'landing-page'
  | 'programs'
  | 'resources'
  | 'reports'
  | 'notifications'
  | 'settings';

interface WholesaleCartItem {
  product: Product;
  strengthLabel: string;
  kitPrice: number;
  kitsCount: number;
}

interface PartnerSettings {
  emailOrderAlerts: boolean;
  emailPayoutAlerts: boolean;
  defaultDateFilter: 'current_month' | 'prev_month' | 'ytd' | 'all';
  defaultDeliveryNote: string;
}

const DEFAULT_PARTNER_SETTINGS: PartnerSettings = {
  emailOrderAlerts: true,
  emailPayoutAlerts: true,
  defaultDateFilter: 'all',
  defaultDeliveryNote: 'Deliver to clinic reception during regular practice hours (9am–5pm).'
};

const WELLNESS_CATEGORIES: Array<{ key: ProductCategoryType; label: string }> = [
  { key: 'metabolic', label: 'Metabolic Support' },
  { key: 'cellular', label: 'Cellular Optimization' },
  { key: 'recovery', label: 'Tissue Recovery' },
  { key: 'longevity', label: 'Longevity & Vitality' },
  { key: 'stacks', label: 'Synergy Multi-Kits' }
];

const matchesDateFilter = (isoDate: string, filter: 'current_month' | 'prev_month' | 'ytd' | 'all'): boolean => {
  if (filter === 'all') return true;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return true;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (filter === 'current_month') {
    return d.getFullYear() === year && d.getMonth() === month;
  }
  if (filter === 'prev_month') {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
  }
  if (filter === 'ytd') {
    return d.getFullYear() === year && d <= now;
  }
  return true;
};

const formatRelativeTime = (isoDate: string): string => {
  const ts = new Date(isoDate).getTime();
  if (Number.isNaN(ts)) return 'Recently';
  const diffMin = Math.floor((Date.now() - ts) / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const PartnerDashboardView: React.FC<PartnerDashboardViewProps> = ({ navigate }) => {
  const { currentUser, isAdmin, logout } = useAuth();
  const [allPartners, setAllPartners] = useState<Partner[]>([]);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [earnings, setEarnings] = useState<PartnerEarning[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [programs, setPrograms] = useState<WellnessProgram[]>([]);
  const [articles, setArticles] = useState<EducationalArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // Navigation & Shell Controls
  const [activeSection, setActiveSection] = useState<PartnerSection>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchFocused, setGlobalSearchFocused] = useState(false);

  // Filters & Charts
  const [dateFilter, setDateFilter] = useState<'current_month' | 'prev_month' | 'ytd' | 'all'>('all');
  const [chartMonths, setChartMonths] = useState<6 | 12>(6);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [ordersSearchQuery, setOrdersSearchQuery] = useState('');

  // Clipboard & QR
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDirectLink, setCopiedDirectLink] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<EducationalArticle | null>(null);

  // Partner Notifications Read State
  const [readNotifications, setReadNotifications] = useState<string[]>([]);

  // Partner Settings
  const [partnerSettings, setPartnerSettings] = useState<PartnerSettings>(DEFAULT_PARTNER_SETTINGS);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);

  // Editable Partner Profile & Assets State
  const [profileName, setProfileName] = useState('');
  const [profileContactPerson, setProfileContactPerson] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileWebsite, setProfileWebsite] = useState('');
  const [profileLocation, setProfileLocation] = useState('');
  const [profileDescription, setProfileDescription] = useState('');
  const [profileLogoUrl, setProfileLogoUrl] = useState('');
  const [profileCategories, setProfileCategories] = useState<ProductCategoryType[]>([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaveMsg, setProfileSaveMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Wholesale 10-Vial Kit Cart State
  const [wholesaleCart, setWholesaleCart] = useState<WholesaleCartItem[]>([]);
  const [selectedWholesaleTier, setSelectedWholesaleTier] = useState<Record<string, number>>({});
  const [wholesaleShippingNotes, setWholesaleShippingNotes] = useState('');
  const [submittingWholesale, setSubmittingWholesale] = useState(false);
  const [wholesaleOrderSuccess, setWholesaleOrderSuccess] = useState<string | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const syncProfileForm = (selectedPartner: Partner | null) => {
    if (!selectedPartner) return;
    setProfileName(selectedPartner.name || '');
    setProfileContactPerson(selectedPartner.contactPerson || '');
    setProfilePhone(selectedPartner.phone || '');
    setProfileWebsite(selectedPartner.website || '');
    setProfileLocation(selectedPartner.location || selectedPartner.address || '');
    setProfileDescription(selectedPartner.description || '');
    setProfileLogoUrl(selectedPartner.logoUrl || '');
    setProfileCategories(selectedPartner.preferredCategories || []);
    setProfileSaveMsg(null);
    setProfileErrorMsg(null);
  };

  const loadPartnerDetails = async (selectedPartner: Partner | null) => {
    setPartner(selectedPartner);
    syncProfileForm(selectedPartner);
    if (selectedPartner) {
      const [allOrders, allEarnings] = await Promise.all([
        dbService.getOrders('partner'),
        dbService.getPartnerEarnings(selectedPartner.id)
      ]);
      const partnerOrders = allOrders.filter(
        (o) =>
          o.partnerId === selectedPartner.id ||
          o.partnerId === selectedPartner.partnerId ||
          o.partnerSlug === selectedPartner.slug
      );
      setOrders(partnerOrders);
      setEarnings(allEarnings);

      try {
        const storedSettings = localStorage.getItem(`whw_partner_settings_v1_${selectedPartner.id}`);
        if (storedSettings) {
          const parsed = JSON.parse(storedSettings) as Partial<PartnerSettings>;
          setPartnerSettings({ ...DEFAULT_PARTNER_SETTINGS, ...parsed });
          if (parsed.defaultDateFilter) {
            setDateFilter(parsed.defaultDateFilter);
          }
          if (parsed.defaultDeliveryNote && !wholesaleShippingNotes) {
            setWholesaleShippingNotes(parsed.defaultDeliveryNote);
          }
        }
        const storedRead = localStorage.getItem(`whw_partner_read_notif_${selectedPartner.id}`);
        if (storedRead) {
          setReadNotifications(JSON.parse(storedRead));
        }
      } catch {
        // Ignore storage read failure
      }
    } else {
      setOrders([]);
      setEarnings([]);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [partnersList, myApps, productsList, programsList, articlesList] = await Promise.all([
          dbService.getPartners(),
          dbService.getMyPartnerApplications(),
          dbService.getProducts(),
          dbService.getPrograms(),
          dbService.getArticles()
        ]);

        const mergedMap = new Map<string, Partner>();
        [...myApps, ...partnersList].forEach((p) => {
          mergedMap.set(p.id, p);
        });
        const mergedPartners = Array.from(mergedMap.values());
        setAllPartners(mergedPartners);
        setProducts(productsList.filter((p) => p.status === 'ACTIVE'));
        setPrograms(programsList.filter((pr) => pr.status === 'ACTIVE'));
        setArticles(articlesList.filter((a) => a.status === 'PUBLISHED'));

        const matchedPartner =
          mergedPartners.find(
            (p) =>
              (currentUser?.partnerId &&
                (p.id === currentUser.partnerId || p.partnerId === currentUser.partnerId)) ||
              (currentUser?.uid && p.ownerUid === currentUser.uid) ||
              (currentUser?.email && p.email.toLowerCase() === currentUser.email.toLowerCase())
          ) ||
          mergedPartners[0] ||
          null;

        await loadPartnerDetails(matchedPartner);
      } catch (err) {
        console.error('Failed to load partner dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [currentUser]);

  const referralUrl = partner ? `${window.location.origin}/#/partner/${partner.slug}` : '';

  useEffect(() => {
    if (!referralUrl) {
      setQrCodeUrl('');
      return;
    }
    QRCode.toDataURL(referralUrl, {
      width: 240,
      margin: 2,
      color: { dark: '#0c2340', light: '#fffdfb' }
    })
      .then(setQrCodeUrl)
      .catch(() => setQrCodeUrl(''));
  }, [referralUrl]);

  // Close popovers & modals on Escape / outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setGlobalSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedOrder(null);
        setSelectedArticle(null);
        setNotificationsOpen(false);
        setProfileMenuOpen(false);
        setGlobalSearchFocused(false);
        setMobileSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  const dateFilteredOrders = useMemo(
    () => orders.filter((o) => matchesDateFilter(o.createdAt, dateFilter)),
    [orders, dateFilter]
  );

  const dateFilteredEarnings = useMemo(
    () => earnings.filter((e) => matchesDateFilter(e.createdAt, dateFilter)),
    [earnings, dateFilter]
  );

  const monthlySummary = useMemo(() => {
    const buckets: Record<
      string,
      { label: string; ordersCount: number; completedCount: number; cancelledCount: number; grossSales: number; commission: number }
    > = {};

    dateFilteredOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = Number.isNaN(d.getTime())
        ? 'Unknown'
        : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = Number.isNaN(d.getTime())
        ? 'Unknown'
        : d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
      if (!buckets[key]) {
        buckets[key] = { label, ordersCount: 0, completedCount: 0, cancelledCount: 0, grossSales: 0, commission: 0 };
      }
      buckets[key].ordersCount += 1;
      if (o.status === 'COMPLETED') buckets[key].completedCount += 1;
      if (o.status === 'CANCELLED') buckets[key].cancelledCount += 1;
      buckets[key].grossSales += o.subtotal;
      buckets[key].commission += o.partnerCommission || 0;
    });

    return Object.entries(buckets)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([, v]) => v);
  }, [dateFilteredOrders]);

  // Top Performing Products computed from partner orders (fallback to curated products if empty)
  const topProducts = useMemo(() => {
    const productStats = new Map<
      string,
      { id: string; name: string; imageUrl: string; units: number; revenue: number; product?: Product }
    >();

    for (const o of orders) {
      if (o.status === 'CANCELLED' || o.status === 'REFUNDED') continue;
      for (const item of o.items) {
        const key = item.productId || item.productName;
        const matchedProd = products.find((p) => p.id === item.productId || p.name === item.productName);
        const existing = productStats.get(key) || {
          id: key,
          name: item.productName,
          imageUrl: item.imageUrl || matchedProd?.imageUrl || '/images/featured-bpc157-clean.png',
          units: 0,
          revenue: 0,
          product: matchedProd
        };
        existing.units += item.quantity;
        existing.revenue += item.unitPrice * item.quantity;
        productStats.set(key, existing);
      }
    }

    const sorted = Array.from(productStats.values()).sort((a, b) => b.revenue - a.revenue);
    if (sorted.length >= 3) return sorted.slice(0, 5);

    const existingIds = new Set(sorted.map((s) => s.id));
    const fallback = products
      .filter((p) => !existingIds.has(p.id))
      .slice(0, 3 - sorted.length)
      .map((p) => ({
        id: p.id,
        name: p.name,
        imageUrl: p.imageUrl,
        units: 0,
        revenue: p.price,
        product: p
      }));
    return [...sorted, ...fallback];
  }, [orders, products]);

  // Partner Notifications Feed
  const partnerNotifications = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      detail: string;
      time: string;
      targetSection: PartnerSection;
      type: 'order' | 'earning' | 'status';
    }> = [];

    if (partner) {
      items.push({
        id: `status-${partner.status}`,
        title:
          partner.status === 'APPROVED'
            ? 'Wholesale & Referral Storefront Active'
            : `Partner Application: ${partner.status}`,
        detail:
          partner.status === 'APPROVED'
            ? `${partner.name} is verified for 10-vial kit wholesale ordering and ${(partner.commissionRate * 100).toFixed(0)}% commission tracking.`
            : partner.adminNotes || 'Our partner team is reviewing your organization details.',
        time: formatRelativeTime(partner.updatedAt || partner.createdAt),
        targetSection: partner.status === 'APPROVED' ? 'wholesale' : 'profile',
        type: 'status'
      });
    }

    orders.slice(0, 5).forEach((ord) => {
      items.push({
        id: `ord-${ord.id}`,
        title: `New order ${ord.orderNumber}`,
        detail: `${ord.customerName} · $${ord.subtotal.toFixed(2)} (${ord.status})`,
        time: formatRelativeTime(ord.createdAt),
        targetSection: 'orders',
        type: 'order'
      });
    });

    earnings.slice(0, 3).forEach((earn) => {
      items.push({
        id: `earn-${earn.id}`,
        title: `Commission ${earn.status === 'PAID' ? 'settled' : 'logged'}: +$${earn.earningAmount.toFixed(2)}`,
        detail: `Ref ${earn.orderNumber} (${(earn.commissionRate * 100).toFixed(0)}% share)`,
        time: formatRelativeTime(earn.createdAt),
        targetSection: 'earnings',
        type: 'earning'
      });
    });

    return items;
  }, [partner, orders, earnings]);

  const unreadNotifCount = partnerNotifications.filter((n) => !readNotifications.includes(n.id)).length;

  const markAllNotificationsRead = () => {
    if (!partner) return;
    const ids = partnerNotifications.map((n) => n.id);
    setReadNotifications(ids);
    try {
      localStorage.setItem(`whw_partner_read_notif_${partner.id}`, JSON.stringify(ids));
    } catch {
      // Ignore storage error
    }
  };

  // Global search results
  const searchResults = useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase();
    if (!q) return { orders: [], products: [], articles: [] };
    return {
      orders: orders
        .filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q) ||
            o.items.some((i) => i.productName.toLowerCase().includes(q))
        )
        .slice(0, 4),
      products: products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.categoryLabel.toLowerCase().includes(q)
        )
        .slice(0, 4),
      articles: articles
        .filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q)
        )
        .slice(0, 3)
    };
  }, [globalSearchQuery, orders, products, articles]);

  const switchSection = (section: PartnerSection) => {
    setActiveSection(section);
    setMobileSidebarOpen(false);
    setNotificationsOpen(false);
    setProfileMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f8f4] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium text-[#5a6b7c]">Loading Partner Telemetry &amp; Storefront Console...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-[#f9f8f4] flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-[#fffdfb] border border-[#dfd7c7] rounded-3xl p-8 text-center space-y-4 shadow-xs">
          <img src="/images/whw-logo.png" alt="Whole Harbor Wellness" className="w-14 h-14 object-contain mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#0c2340]">No Partner Account Found</h2>
          <p className="text-xs text-[#5a6b7c]">
            Submit a clinic or studio partner application or sign in with approved partner credentials to access your dashboard.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('partners')}
              className="px-5 py-2.5 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer"
            >
              Apply to Become a Partner
            </button>
            <button
              type="button"
              onClick={() => navigate('home')}
              className="px-5 py-2.5 rounded-xl border border-[#dfd7c7] text-[#0c2340] text-xs font-semibold hover:bg-[#f6f4ee] cursor-pointer"
            >
              Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Metrics
  const totalOrders = dateFilteredOrders.length;
  const completedOrders = dateFilteredOrders.filter((o) => o.status === 'COMPLETED').length;
  const pendingOrders = dateFilteredOrders.filter(
    (o) => o.status === 'PENDING' || o.status === 'PROCESSING' || o.status === 'CONFIRMED'
  ).length;
  const grossSales = dateFilteredOrders
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REFUNDED')
    .reduce((acc, o) => acc + o.subtotal, 0);
  const totalEarnings = dateFilteredEarnings.reduce((acc, e) => acc + e.earningAmount, 0);
  const pendingEarnings = dateFilteredEarnings
    .filter((e) => e.status === 'PENDING' || e.status === 'APPROVED')
    .reduce((acc, e) => acc + e.earningAmount, 0);
  const paidEarnings = dateFilteredEarnings
    .filter((e) => e.status === 'PAID')
    .reduce((acc, e) => acc + e.earningAmount, 0);

  const filteredOrders = dateFilteredOrders.filter((o) => {
    const matchesStatus =
      orderStatusFilter === 'ALL'
        ? true
        : orderStatusFilter === 'PENDING_GROUP'
        ? o.status === 'PENDING' || o.status === 'PROCESSING' || o.status === 'CONFIRMED'
        : o.status === orderStatusFilter;
    if (!matchesStatus) return false;
    if (!ordersSearchQuery.trim()) return true;
    const q = ordersSearchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.items.some((it) => it.productName.toLowerCase().includes(q))
    );
  });

  const partnerContactName =
    partner.contactPerson ||
    currentUser?.displayName ||
    partner.name;
  const partnerInitials = partnerContactName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'WH';

  const copyReferralLink = () => {
    if (navigator.clipboard && referralUrl) {
      navigator.clipboard.writeText(referralUrl).catch(() => {});
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleExportCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer', 'Status', 'Source', 'Gross Sales', 'Commission'];
    const rows = dateFilteredOrders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      `"${o.customerName.replace(/"/g, '""')}"`,
      o.status,
      `"${(o.referralSource || 'partner_url').replace(/"/g, '""')}"`,
      o.subtotal.toFixed(2),
      (o.partnerCommission || 0).toFixed(2)
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${partner.slug}-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportEarningsCSV = () => {
    const headers = ['Ledger ID', 'Date', 'Order Ref', 'Customer', 'Gross Order', 'Commission Rate', 'Earning Amount', 'Status'];
    const rows = dateFilteredEarnings.map((e) => [
      e.id,
      new Date(e.createdAt).toLocaleDateString(),
      e.orderNumber,
      `"${e.customerName.replace(/"/g, '""')}"`,
      e.grossSales.toFixed(2),
      `${(e.commissionRate * 100).toFixed(0)}%`,
      e.earningAmount.toFixed(2),
      e.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((row) => row.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${partner.slug}-earnings-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 750 * 1024) {
      setProfileErrorMsg('Logo file must be under 750 KB.');
      return;
    }
    setProfileErrorMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfileLogoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleProfileCategory = (cat: ProductCategoryType) => {
    setProfileCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSavePartnerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSaveMsg(null);
    setProfileErrorMsg(null);
    try {
      const updates: Partial<Partner> = {
        name: profileName.trim(),
        contactPerson: profileContactPerson.trim(),
        phone: profilePhone.trim() || undefined,
        website: profileWebsite.trim() || undefined,
        location: profileLocation.trim() || undefined,
        description: profileDescription.trim(),
        logoUrl: profileLogoUrl.trim() || undefined,
        preferredCategories: profileCategories
      };
      await dbService.updatePartner(partner.id, updates);
      const updatedPartner = { ...partner, ...updates };
      setPartner(updatedPartner);
      setAllPartners((prev) => prev.map((p) => (p.id === partner.id ? updatedPartner : p)));
      setProfileSaveMsg('Partner profile, storefront branding & curated categories saved.');
    } catch {
      setProfileErrorMsg('Unable to save profile updates right now.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePartnerSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(`whw_partner_settings_v1_${partner.id}`, JSON.stringify(partnerSettings));
      setDateFilter(partnerSettings.defaultDateFilter);
      setSettingsSavedMsg(true);
      setTimeout(() => setSettingsSavedMsg(false), 3000);
    } catch {
      // Ignore storage error
    }
  };

  const navItems: Array<{
    id: PartnerSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'referral', label: 'Referral Link', icon: Link2 },
    { id: 'wholesale', label: 'Wholesale Kits', icon: Package },
    { id: 'orders', label: 'Sales & Orders', icon: ShoppingCart },
    { id: 'earnings', label: 'Earnings', icon: Wallet },
    { id: 'landing-page', label: 'My Landing Page', icon: Globe },
    { id: 'programs', label: 'Wellness Programs', icon: Flower2 },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifCount },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const sectionLabels: Record<PartnerSection, string> = {
    overview: 'Dashboard',
    profile: 'My Profile',
    referral: 'Referral Link',
    wholesale: 'Wholesale 10-Vial Kits',
    orders: 'Sales & Orders',
    earnings: 'Earnings & Payouts',
    'landing-page': 'My Landing Page',
    programs: 'Wellness Programs',
    resources: 'Partner Resources',
    reports: 'Reports & Analytics',
    notifications: 'Notifications',
    settings: 'Settings'
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#0c2340] via-[#0a1e37] to-[#07172b] text-[#fffdfb]">
      {/* Official Brand Header */}
      <div className="px-4 pt-5 pb-3 border-b border-white/10">
        <button
          type="button"
          onClick={() => navigate('home')}
          title="Return to Whole Harbor Wellness Storefront"
          className="w-full flex items-center gap-3 p-2 rounded-2xl bg-[#fffdfb] border border-[#dfd7c7] shadow-sm hover:border-[#c5a059] transition-colors cursor-pointer text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden p-0.5">
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
              Partner Portal
            </span>
          </div>
        </button>

        {/* Partner Identity Card inside Sidebar */}
        <div className="mt-3 p-3 rounded-2xl bg-white/8 border border-white/12 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#fffdfb] border border-[#c5a059]/60 flex items-center justify-center shrink-0 overflow-hidden p-0.5">
            {partner.logoUrl ? (
              <img
                src={partner.logoUrl}
                alt={partner.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain rounded-full"
              />
            ) : (
              <span className="font-serif font-bold text-sm text-[#0c2340]">{partnerInitials}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{partner.name}</p>
            <p className="text-[10px] text-[#dfd7c7]/80 font-mono truncate">
              ID: {partner.partnerId}
            </p>
            <span
              className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                partner.status === 'APPROVED'
                  ? 'bg-[#c5a059] text-[#0c2340]'
                  : 'bg-white/15 text-[#dfd7c7]'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{partner.status === 'APPROVED' ? 'Verified' : partner.status}</span>
            </span>
          </div>
        </div>

        {/* Admin Partner Switcher (if logged in as Admin) */}
        {isAdmin && allPartners.length > 1 && (
          <div className="mt-2.5">
            <select
              value={partner.id}
              onChange={(e) => {
                const found = allPartners.find((p) => p.id === e.target.value) || null;
                setWholesaleCart([]);
                setWholesaleOrderSuccess(null);
                loadPartnerDetails(found);
              }}
              aria-label="Switch Partner Account"
              className="w-full px-2.5 py-1.5 rounded-xl bg-[#07172b] border border-[#c5a059]/40 text-[11px] text-[#fffdfb] font-medium cursor-pointer focus:outline-none"
            >
              {allPartners.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name} ({pt.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5" aria-label="Partner portal navigation">
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

      {/* Bottom Need Help Box & Logout */}
      <div className="p-3 border-t border-white/10 space-y-2">
        <div className="p-3 rounded-2xl bg-white/8 border border-white/12 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Headphones className="w-4 h-4 text-[#c5a059]" />
            <span>Need Help?</span>
          </div>
          <p className="text-[11px] text-[#dfd7c7]/80">
            support@wholeharborwellness.com
          </p>
          <button
            type="button"
            onClick={() => navigate('contact')}
            className="w-full mt-1 py-1.5 px-3 rounded-lg bg-white/12 hover:bg-[#c5a059] text-white text-[11px] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
          >
            <span>Contact Support</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border border-white/15 text-[11px] font-semibold text-[#dfd7c7] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <Store className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Storefront</span>
          </button>
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate('home');
            }}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border border-white/15 text-[11px] font-semibold text-[#dfd7c7] hover:bg-red-500/20 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#f9f8f4] text-[#111d2b] font-sans">
      {/* Desktop Sticky Left Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen border-r border-[#dfd7c7]/40 z-30">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#0c2340]/55 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close navigation drawer"
              className="absolute top-3 right-3 z-20 p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* Right Main Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Utility Header Bar */}
        <header className="sticky top-0 z-20 bg-[#fffdfb]/95 backdrop-blur-sm border-b border-[#dfd7c7] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Hamburger + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open partner navigation"
              className="lg:hidden p-2 rounded-xl border border-[#dfd7c7] bg-[#f9f8f4] text-[#0c2340] hover:bg-[#f6f4ee] cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-[#5a6b7c] whitespace-nowrap">
              <button
                type="button"
                onClick={() => switchSection('overview')}
                className="hover:text-[#0c2340] font-medium cursor-pointer flex items-center gap-1"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Partner</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#dfd7c7]" />
              <span className="font-semibold text-[#0c2340]">{sectionLabels[activeSection]}</span>
            </nav>
          </div>

          {/* Center: Live Global Search */}
          <div ref={searchRef} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#5a6b7c] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={globalSearchQuery}
              onFocus={() => setGlobalSearchFocused(true)}
              onChange={(e) => {
                setGlobalSearchQuery(e.target.value);
                setGlobalSearchFocused(true);
              }}
              placeholder="Search orders, products, resources..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-[#f6f4ee] border border-[#dfd7c7] text-xs text-[#0c2340] placeholder-[#5a6b7c] focus:outline-none focus:border-[#c5a059] focus:bg-white transition-colors"
            />
            {globalSearchQuery && (
              <button
                type="button"
                onClick={() => setGlobalSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a6b7c] hover:text-[#0c2340] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {globalSearchFocused && globalSearchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-[#fffdfb] border border-[#dfd7c7] shadow-xl p-2 z-50 max-h-80 overflow-y-auto text-xs space-y-2">
                {searchResults.orders.length === 0 &&
                searchResults.products.length === 0 &&
                searchResults.articles.length === 0 ? (
                  <p className="p-3 text-center text-[#5a6b7c]">No matches found for &ldquo;{globalSearchQuery}&rdquo;.</p>
                ) : (
                  <>
                    {searchResults.orders.length > 0 && (
                      <div>
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#c5a059] block">
                          Orders
                        </span>
                        {searchResults.orders.map((ord) => (
                          <button
                            key={ord.id}
                            type="button"
                            onClick={() => {
                              setSelectedOrder(ord);
                              setGlobalSearchFocused(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f6f4ee] flex items-center justify-between cursor-pointer"
                          >
                            <span className="font-semibold text-[#0c2340]">
                              {ord.orderNumber} · {ord.customerName}
                            </span>
                            <span className="font-mono text-[#c5a059] font-semibold tabular-nums">
                              ${ord.subtotal.toFixed(2)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.products.length > 0 && (
                      <div>
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#c5a059] block">
                          Formulations
                        </span>
                        {searchResults.products.map((prod) => (
                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => {
                              switchSection('wholesale');
                              setGlobalSearchFocused(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f6f4ee] flex items-center justify-between cursor-pointer"
                          >
                            <span className="font-semibold text-[#0c2340]">{prod.name}</span>
                            <span className="text-[11px] text-[#5a6b7c]">{prod.categoryLabel}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.articles.length > 0 && (
                      <div>
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#c5a059] block">
                          Resources &amp; Guides
                        </span>
                        {searchResults.articles.map((art) => (
                          <button
                            key={art.id}
                            type="button"
                            onClick={() => {
                              setSelectedArticle(art);
                              setGlobalSearchFocused(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f6f4ee] flex items-center justify-between cursor-pointer"
                          >
                            <span className="font-semibold text-[#0c2340] truncate">{art.title}</span>
                            <span className="text-[11px] text-[#5a6b7c] shrink-0">{art.readTime}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right: Notifications Bell + Partner Account Dropdown */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Notifications Bell */}
            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  setProfileMenuOpen(false);
                }}
                aria-label="Partner notifications"
                className="relative p-2 rounded-xl border border-[#dfd7c7] bg-[#fffdfb] text-[#0c2340] hover:bg-[#f6f4ee] transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#c5a059] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] rounded-2xl bg-[#fffdfb] border border-[#dfd7c7] shadow-xl p-3 z-50 text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-[#dfd7c7] pb-2">
                    <span className="font-serif text-sm font-bold text-[#0c2340]">Partner Notifications</span>
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[11px] font-semibold text-[#c5a059] hover:text-[#0c2340] cursor-pointer"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#dfd7c7]/50">
                    {partnerNotifications.slice(0, 5).map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => switchSection(n.targetSection)}
                        className="w-full text-left py-2.5 px-2 rounded-xl hover:bg-[#f6f4ee] transition-colors cursor-pointer block"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[#0c2340] truncate">{n.title}</span>
                          <span className="text-[10px] text-[#5a6b7c] shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-[#5a6b7c] mt-0.5 line-clamp-2">{n.detail}</p>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => switchSection('notifications')}
                    className="w-full py-2 rounded-xl bg-[#f6f4ee] text-[#0c2340] font-semibold hover:bg-[#dfd7c7]/50 cursor-pointer"
                  >
                    View all notifications →
                  </button>
                </div>
              )}
            </div>

            {/* Partner Account Profile Menu */}
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen((prev) => !prev);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full border border-[#dfd7c7] bg-[#fffdfb] hover:bg-[#f6f4ee] transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#0c2340] text-[#fffdfb] text-xs font-bold flex items-center justify-center shrink-0">
                  {partnerInitials}
                </div>
                <div className="hidden md:block text-left leading-tight">
                  <span className="text-xs font-semibold text-[#0c2340] block max-w-[140px] truncate">
                    {partnerContactName}
                  </span>
                  <span className="text-[10px] text-[#5a6b7c] block">Partner</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#5a6b7c]" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[#fffdfb] border border-[#dfd7c7] shadow-xl p-1.5 z-50 text-xs text-[#0c2340]">
                  <div className="px-3 py-2 border-b border-[#dfd7c7] mb-1">
                    <p className="font-semibold truncate">{partner.name}</p>
                    <p className="text-[11px] text-[#5a6b7c] truncate">{partner.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => switchSection('profile')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f6f4ee] flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>My Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate('partner-page', partner.slug);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f6f4ee] flex items-center gap-2 cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Live Partner Storefront</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => switchSection('settings')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f6f4ee] flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Settings</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate('home');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f6f4ee] flex items-center gap-2 cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Storefront Home</span>
                  </button>
                  <div className="border-t border-[#dfd7c7] my-1" />
                  <button
                    type="button"
                    onClick={async () => {
                      setProfileMenuOpen(false);
                      await logout();
                      navigate('home');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-red-700 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          {/* ======================= OVERVIEW (DASHBOARD) ======================= */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Hero Banner matching reference image with WHW colors */}
              <section className="relative overflow-hidden rounded-3xl border border-[#dfd7c7] bg-[#fffdfb] shadow-2xs min-h-[168px] flex items-center">
                <img
                  src={partnerWelcomeHero}
                  alt="Whole Harbor Wellness Partner"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover object-right pointer-events-none select-none"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(90deg, #f9f8f4 0%, #f9f8f4 46%, rgba(249,248,244,0.82) 66%, rgba(249,248,244,0.18) 100%)'
                  }}
                />
                <div className="relative z-10 w-full p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="max-w-xl space-y-1.5">
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0c2340] tracking-tight text-balance">
                      Welcome back, {partnerContactName}!
                    </h1>
                    <p className="text-sm text-[#5a6b7c]">
                      Grow your wellness business with Whole Harbor Wellness
                    </p>
                    <div className="flex flex-wrap items-center gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => switchSection('wholesale')}
                        className="px-4 py-2 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {partner.status === 'APPROVED' ? 'Order 10-Vial Wholesale Kits' : 'Check Wholesale Status'}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('partner-page', partner.slug)}
                        className="px-4 py-2 rounded-xl bg-[#fffdfb]/90 border border-[#dfd7c7] text-[#0c2340] text-xs font-semibold hover:bg-[#f6f4ee] transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                      >
                        <span>View Live Storefront</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* 4-Column KPI Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setOrderStatusFilter('ALL');
                    switchSection('orders');
                  }}
                  className="text-left bg-[#fffdfb] border border-[#dfd7c7] rounded-2xl p-5 hover:border-[#c5a059] transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-full bg-[#0c2340] text-[#fffdfb] flex items-center justify-center shrink-0">
                        <ShoppingCart className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-medium text-[#5a6b7c] truncate">Total Orders</span>
                    </div>
                    <div className="font-serif text-3xl font-bold text-[#0c2340] tabular-nums pt-1">
                      {totalOrders.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-medium text-[#4b6b58] tabular-nums">
                      ↑ {totalOrders > 0 ? '+12.5%' : '0.0%'} referral activity
                    </div>
                  </div>
                  <KpiSparkBars values={[24, 38, 32, 52, 61, 74, 88]} tone="navy" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOrderStatusFilter('COMPLETED');
                    switchSection('orders');
                  }}
                  className="text-left bg-[#fffdfb] border border-[#dfd7c7] rounded-2xl p-5 hover:border-[#c5a059] transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-full bg-[#4b6b58] text-[#fffdfb] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-medium text-[#5a6b7c] truncate">Completed Orders</span>
                    </div>
                    <div className="font-serif text-3xl font-bold text-[#0c2340] tabular-nums pt-1">
                      {completedOrders.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-medium text-[#4b6b58] tabular-nums">
                      ↑ Dispatched by lab
                    </div>
                  </div>
                  <KpiSparkBars values={[28, 34, 45, 50, 62, 76, 86]} tone="sage" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOrderStatusFilter('PENDING_GROUP');
                    switchSection('orders');
                  }}
                  className="text-left bg-[#fffdfb] border border-[#dfd7c7] rounded-2xl p-5 hover:border-[#c5a059] transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-full bg-[#c5a059] text-[#fffdfb] flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-medium text-[#5a6b7c] truncate">Pending Orders</span>
                    </div>
                    <div className="font-serif text-3xl font-bold text-[#0c2340] tabular-nums pt-1">
                      {pendingOrders.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-medium text-[#c5a059] tabular-nums">
                      In cold-chain queue
                    </div>
                  </div>
                  <KpiSparkBars values={[18, 26, 22, 30, 36, 42, 48]} tone="gold" />
                </button>

                <button
                  type="button"
                  onClick={() => switchSection('reports')}
                  className="text-left bg-[#fffdfb] border border-[#dfd7c7] rounded-2xl p-5 hover:border-[#c5a059] transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-full bg-[#0c2340] text-[#c5a059] flex items-center justify-center shrink-0">
                        <DollarSign className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-medium text-[#5a6b7c] truncate">Gross Sales</span>
                    </div>
                    <div className="font-serif text-3xl font-bold text-[#0c2340] tabular-nums pt-1">
                      ${grossSales.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-[11px] font-medium text-[#4b6b58] tabular-nums">
                      ↑ +15.2% community volume
                    </div>
                  </div>
                  <KpiSparkBars values={[32, 46, 54, 62, 74, 84, 96]} tone="navy" />
                </button>
              </div>

              {/* Middle Grid: Performance Overview Chart (8 cols) + Referral Link & Earnings Stack (4 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Performance Chart */}
                <div className="lg:col-span-8 bg-[#fffdfb] border border-[#dfd7c7] rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <BarChart3 className="w-5 h-5 text-[#c5a059]" />
                      <h2 className="font-serif text-xl font-bold text-[#0c2340]">
                        Your Performance Overview
                      </h2>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 text-xs text-[#5a6b7c]">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#0c2340] inline-block" />
                          Sales
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059] inline-block" />
                          Earnings
                        </span>
                      </div>
                      <select
                        value={chartMonths}
                        onChange={(e) => setChartMonths(Number(e.target.value) as 6 | 12)}
                        aria-label="Chart timeframe"
                        className="px-3 py-1.5 rounded-xl bg-[#f6f4ee] border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] cursor-pointer focus:outline-none"
                      >
                        <option value={6}>Last 6 Months</option>
                        <option value={12}>Last 12 Months</option>
                      </select>
                    </div>
                  </div>

                  <PartnerPerformanceChart
                    orders={orders}
                    commissionRate={partner.commissionRate}
                    monthsCount={chartMonths}
                  />
                </div>

                {/* Right Column Stack: Your Referral Link + Your Earnings */}
                <div className="lg:col-span-4 flex flex-col gap-5">
                  {/* Dark Navy Referral Card */}
                  <div className="rounded-2xl bg-gradient-to-br from-[#0c2340] via-[#0a1e37] to-[#07172b] text-[#fffdfb] p-5 border border-[#c5a059]/30 space-y-3.5 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-[#c5a059]" />
                        <h3 className="font-serif text-lg font-bold">Your Referral Link</h3>
                      </div>
                      <button
                        type="button"
                        onClick={copyReferralLink}
                        className="px-3 py-1 rounded-full bg-white/12 hover:bg-[#c5a059] text-white text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {copiedLink ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 bg-[#fffdfb] rounded-xl px-3 py-2 text-[#0c2340]">
                      <span className="font-mono text-[11px] truncate flex-1 select-all">{referralUrl}</span>
                      <button
                        type="button"
                        onClick={copyReferralLink}
                        aria-label="Copy referral URL"
                        className="text-[#5a6b7c] hover:text-[#0c2340] cursor-pointer shrink-0"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-3.5 pt-0.5">
                      {qrCodeUrl && (
                        <button
                          type="button"
                          onClick={() => switchSection('referral')}
                          title="Open full QR Code studio"
                          className="w-16 h-16 rounded-xl bg-[#fffdfb] p-1 shrink-0 cursor-pointer hover:ring-2 hover:ring-[#c5a059] transition-all"
                        >
                          <img src={qrCodeUrl} alt="Partner Referral QR Code" className="w-full h-full object-contain" />
                        </button>
                      )}
                      <div className="space-y-1.5 min-w-0">
                        <p className="text-xs text-[#dfd7c7] leading-snug">
                          Share your unique link and earn {(partner.commissionRate * 100).toFixed(0)}% commissions!
                        </p>
                        <button
                          type="button"
                          onClick={() => switchSection('referral')}
                          className="text-[11px] font-semibold text-[#c5a059] hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Download QR &amp; Links</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Your Earnings Card */}
                  <div className="flex-1 rounded-2xl bg-[#fffdfb] border border-[#dfd7c7] p-5 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-[#c5a059]" />
                        <h3 className="font-serif text-lg font-bold text-[#0c2340]">Your Earnings</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => switchSection('earnings')}
                        className="px-3 py-1 rounded-full border border-[#dfd7c7] text-[11px] font-semibold text-[#0c2340] hover:bg-[#f6f4ee] transition-colors cursor-pointer inline-flex items-center gap-1 whitespace-nowrap"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif text-3xl font-bold text-[#0c2340] tabular-nums">
                            ${totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-xs font-semibold text-[#4b6b58] tabular-nums">
                            ↑ {(partner.commissionRate * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-xs text-[#5a6b7c] mt-1 tabular-nums">
                          Eligible for payout:{' '}
                          <strong className="text-[#0c2340]">
                            ${pendingEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </strong>
                        </p>
                      </div>
                      <KpiSparkBars values={[22, 34, 40, 56, 68, 78, 92]} tone="gold" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom 3-Column Row: Top Performing Products, Recent Sales Activity, Growth Banner */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Top Performing Products */}
                <div className="lg:col-span-4 bg-[#fffdfb] border border-[#dfd7c7] rounded-2xl p-5 flex flex-col">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#dfd7c7]">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#c5a059]" />
                      <h3 className="font-serif text-lg font-bold text-[#0c2340]">Top Performing Products</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => switchSection('reports')}
                      className="text-xs font-semibold text-[#0c2340] hover:text-[#c5a059] transition-colors cursor-pointer inline-flex items-center gap-1 whitespace-nowrap"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="divide-y divide-[#dfd7c7]/60 flex-1">
                    {topProducts.slice(0, 3).map((item, idx) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => switchSection('wholesale')}
                        className="w-full py-3.5 flex items-center justify-between gap-3 hover:bg-[#f6f4ee]/60 rounded-xl px-1.5 transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 tabular-nums ${
                              idx === 0
                                ? 'bg-[#c5a059] text-white'
                                : idx === 1
                                ? 'bg-[#0c2340] text-white'
                                : 'bg-[#dfd7c7] text-[#0c2340]'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-lg object-cover border border-[#dfd7c7] bg-[#f6f4ee] shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#0c2340] truncate">{item.name}</p>
                            <p className="text-[11px] text-[#5a6b7c] tabular-nums">
                              {item.units > 0 ? `${item.units} units referred` : 'Featured formulation'}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#0c2340] tabular-nums shrink-0">
                          ${item.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Sales Activity */}
                <div className="lg:col-span-4 bg-[#fffdfb] border border-[#dfd7c7] rounded-2xl p-5 flex flex-col">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#dfd7c7]">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#c5a059]" />
                      <h3 className="font-serif text-lg font-bold text-[#0c2340]">Recent Sales Activity</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => switchSection('orders')}
                      className="text-xs font-semibold text-[#0c2340] hover:text-[#c5a059] transition-colors cursor-pointer inline-flex items-center gap-1 whitespace-nowrap"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="pt-3 space-y-3 flex-1">
                    {orders.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#5a6b7c]">
                        Share your referral link to start recording community orders.
                      </div>
                    ) : (
                      orders.slice(0, 3).map((ord, idx) => (
                        <button
                          key={ord.id}
                          type="button"
                          onClick={() => setSelectedOrder(ord)}
                          className="w-full text-left flex items-start gap-3 p-2 rounded-xl hover:bg-[#f6f4ee] transition-colors cursor-pointer"
                        >
                          <div className="flex flex-col items-center pt-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059]" />
                            {idx < Math.min(orders.length, 3) - 1 && (
                              <span className="w-px h-7 bg-[#dfd7c7] mt-1" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[#0c2340] truncate">
                              New order {ord.orderNumber}
                            </p>
                            <p className="text-[11px] text-[#5a6b7c] tabular-nums mt-0.5">
                              {formatRelativeTime(ord.createdAt)} · ${ord.subtotal.toFixed(2)}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Growth & Partner Resources Promotional Card */}
                <div className="lg:col-span-4 relative overflow-hidden rounded-2xl border border-[#dfd7c7] bg-[#f6f4ee] p-5 flex flex-col justify-between min-h-[210px]">
                  <img
                    src={partnerGrowthBanner}
                    alt="Whole Harbor Partner Resources"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover object-right pointer-events-none select-none"
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(249,248,244,0.97) 0%, rgba(249,248,244,0.9) 52%, rgba(249,248,244,0.22) 100%)'
                    }}
                  />
                  <div className="relative z-10 max-w-[65%] space-y-2">
                    <span className="w-10 h-10 rounded-xl bg-[#0c2340] text-[#c5a059] flex items-center justify-center">
                      <Handshake className="w-5 h-5" />
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-[#0c2340] leading-tight">
                      Let&rsquo;s grow together!
                    </h3>
                    <p className="text-xs text-[#5a6b7c]">
                      Share wellness. Earn more with clinical guides and marketing kits.
                    </p>
                  </div>
                  <div className="relative z-10 pt-4">
                    <button
                      type="button"
                      onClick={() => switchSection('resources')}
                      className="px-4 py-2 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <span>View Partner Resources</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================= MY PROFILE ======================= */}
          {activeSection === 'profile' && (
            <div className="bg-[#fffdfb] border border-[#dfd7c7] rounded-3xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
              <form onSubmit={handleSavePartnerProfile} className="lg:col-span-7 space-y-5">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#0c2340]">
                    Practice Profile, Branding &amp; Curated Categories
                  </h2>
                  <p className="text-[#5a6b7c] mt-0.5">
                    Customize your co-branded storefront logo, contact details, and featured formulation categories.
                  </p>
                </div>

                {profileSaveMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{profileSaveMsg}</span>
                  </div>
                )}

                {profileErrorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
                    {profileErrorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">Practice / Studio Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">Primary Contact Name</label>
                    <input
                      type="text"
                      required
                      value={profileContactPerson}
                      onChange={(e) => setProfileContactPerson(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">Phone</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">Location</label>
                    <input
                      type="text"
                      value={profileLocation}
                      onChange={(e) => setProfileLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[#5a6b7c] font-medium mb-1">Website URL</label>
                    <input
                      type="text"
                      value={profileWebsite}
                      onChange={(e) => setProfileWebsite(e.target.value)}
                      placeholder="https://yourpractice.com"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[#5a6b7c] font-medium mb-1">Storefront Description</label>
                    <textarea
                      rows={3}
                      value={profileDescription}
                      onChange={(e) => setProfileDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="p-4 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7] space-y-3">
                  <label className="block text-[#0c2340] font-semibold">Custom Practice Logo</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {profileLogoUrl ? (
                      <img
                        src={profileLogoUrl}
                        alt={profileName}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-2xl object-contain bg-white border border-[#dfd7c7] p-1 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-white border border-[#dfd7c7] flex items-center justify-center text-[#c5a059] shrink-0">
                        <Store className="w-7 h-7" />
                      </div>
                    )}
                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="block w-full text-[11px] text-[#5a6b7c] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0c2340] file:text-white hover:file:bg-[#c5a059] cursor-pointer"
                      />
                      <input
                        type="text"
                        placeholder="Or paste custom logo image URL..."
                        value={profileLogoUrl}
                        onChange={(e) => setProfileLogoUrl(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340] text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Curated Categories */}
                <div className="space-y-2">
                  <label className="block text-[#0c2340] font-semibold">
                    Featured Wellness Categories (Shown on Your Landing Page)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {WELLNESS_CATEGORIES.map((cat) => {
                      const checked = profileCategories.includes(cat.key);
                      return (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => toggleProfileCategory(cat.key)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                            checked
                              ? 'bg-[#0c2340] text-white border-[#0c2340]'
                              : 'bg-white text-[#5a6b7c] border-[#dfd7c7] hover:border-[#c5a059]'
                          }`}
                        >
                          {checked ? '✓ ' : '+ '}
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingProfile ? 'Saving Profile...' : 'Save Partner Profile & Branding'}
                </button>
              </form>

              <div className="lg:col-span-5 space-y-5">
                <div className="p-5 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7] space-y-3">
                  <h3 className="font-serif text-lg font-bold text-[#0c2340]">
                    Attribution &amp; Commercial Terms
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[#5a6b7c] block">Partner ID</span>
                      <span className="font-mono font-semibold text-[#c5a059]">{partner.partnerId}</span>
                    </div>
                    <div>
                      <span className="text-[#5a6b7c] block">Account Status</span>
                      <span className="font-semibold text-[#0c2340]">{partner.status}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#5a6b7c] block">Account Email</span>
                      <span className="font-semibold text-[#0c2340] break-all">{partner.email}</span>
                    </div>
                    <div>
                      <span className="text-[#5a6b7c] block">Commission Share</span>
                      <span className="font-semibold text-[#0c2340] tabular-nums">
                        {(partner.commissionRate * 100).toFixed(0)}% Revenue Share
                      </span>
                    </div>
                    <div>
                      <span className="text-[#5a6b7c] block">Member VIP Discount</span>
                      <span className="font-semibold text-[#0c2340] tabular-nums">
                        {(partner.memberDiscountRate * 100).toFixed(0)}% Discount
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================= REFERRAL LINK & QR STUDIO ======================= */}
          {activeSection === 'referral' && (
            <div className="space-y-6">
              <div className="bg-[#fffdfb] border border-[#dfd7c7] rounded-3xl p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#0c2340]">
                    Separate Buying Links &amp; Clinic QR Code
                  </h2>
                  <p className="text-xs text-[#5a6b7c] mt-1">
                    Share your dedicated Partner Link so your clients receive VIP community pricing and your portal automatically receives commission attribution.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-5 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7] space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#0c2340] text-white inline-block">
                      Individual Buyer Link (Direct Retail)
                    </span>
                    <p className="text-xs text-[#5a6b7c]">
                      Standard direct storefront link without partner commission attribution.
                    </p>
                    <div className="bg-white p-2.5 rounded-xl border border-[#dfd7c7] font-mono text-[11px] text-[#0c2340] select-all break-all">
                      {window.location.origin}/#/shop
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(`${window.location.origin}/#/shop`).catch(() => {});
                        }
                        setCopiedDirectLink(true);
                        setTimeout(() => setCopiedDirectLink(false), 2500);
                      }}
                      className="w-full py-2.5 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] hover:bg-[#dfd7c7]/40 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {copiedDirectLink ? 'Copied Direct Retail Link!' : 'Copy Direct Retail Link'}
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border-2 border-[#c5a059] space-y-3 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#c5a059] text-white inline-block">
                      Partner Buyer Link (Dedicated to {partner.name})
                    </span>
                    <p className="text-xs text-[#5a6b7c]">
                      Displays your studio banner, applies {(partner.memberDiscountRate * 100).toFixed(0)}% VIP community savings, and tracks {(partner.commissionRate * 100).toFixed(0)}% earnings.
                    </p>
                    <div className="bg-[#f6f4ee] p-2.5 rounded-xl border border-[#c5a059]/40 font-mono text-[11px] text-[#0c2340] select-all break-all font-semibold">
                      {referralUrl}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={copyReferralLink}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#0c2340] text-white hover:bg-[#c5a059] text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedLink ? 'Copied Partner Link!' : 'Copy Partner Link'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('partner-page', partner.slug)}
                        className="px-4 py-2.5 rounded-xl border border-[#dfd7c7] text-[#0c2340] hover:bg-[#f6f4ee] text-xs font-semibold cursor-pointer"
                      >
                        Preview Page
                      </button>
                    </div>
                  </div>
                </div>

                {qrCodeUrl && (
                  <div className="p-6 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7] flex flex-col sm:flex-row items-center gap-6">
                    <div className="p-3 rounded-2xl bg-[#fffdfb] border border-[#dfd7c7] shrink-0">
                      <img src={qrCodeUrl} alt={`${partner.name} QR Code`} className="w-40 h-40" />
                    </div>
                    <div className="space-y-3 text-center sm:text-left">
                      <h3 className="font-serif text-xl font-bold text-[#0c2340]">
                        Clinic Reception &amp; Print Display QR Code
                      </h3>
                      <p className="text-xs text-[#5a6b7c] max-w-lg">
                        Print this high-contrast QR code for front-desk signage, welcome packets, or social cards. Every scan routes patients directly into your co-branded Whole Harbor storefront.
                      </p>
                      <a
                        href={qrCodeUrl}
                        download={`${partner.slug}-qr.png`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Download QR Code PNG</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================= WHOLESALE 10-VIAL KITS ======================= */}
          {activeSection === 'wholesale' && (
            <div className="bg-[#fffdfb] border border-[#dfd7c7] rounded-3xl p-6 sm:p-8">
              {partner.status !== 'APPROVED' ? (
                <div className="max-w-2xl mx-auto text-center py-10 space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7] text-[#c5a059] flex items-center justify-center mx-auto">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-serif text-2xl font-bold text-[#0c2340]">
                      Wholesale 10-Vial Kit Pricing Is Restricted to Approved Partners
                    </h2>
                    <p className="text-xs text-[#5a6b7c] leading-relaxed max-w-lg mx-auto">
                      Your organization (<strong>{partner.name}</strong>) currently has application status{' '}
                      <strong className="text-[#0c2340]">{partner.status}</strong>. Once an administrator approves your partner account, private 10-vial kit wholesale pricing and direct ordering unlock here.
                    </p>
                  </div>
                  {partner.adminNotes && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs max-w-lg mx-auto">
                      <span className="text-[10px] uppercase font-bold text-amber-800 block mb-1">Reviewer Notes</span>
                      <p className="text-[#0c2340]">{partner.adminNotes}</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate('partners')}
                    className="px-6 py-2.5 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer"
                  >
                    View Partner Application Page
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dfd7c7] pb-4">
                    <div>
                      <span className="text-[11px] font-semibold text-[#c5a059] block">
                        Approved Partner Wholesale Catalog · 10-Vial Kits
                      </span>
                      <h2 className="font-serif text-2xl font-bold text-[#0c2340]">
                        Private Wholesale 10-Vial Kit Ordering
                      </h2>
                      <p className="text-xs text-[#5a6b7c]">
                        Approved partners order sealed 10-vial kits at clinic wholesale rates with 2°C–8°C cold-chain dispatch.
                      </p>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold self-start inline-flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Approved Wholesale Tier</span>
                    </span>
                  </div>

                  {wholesaleOrderSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                      <span>
                        <strong>Wholesale Order Submitted:</strong> {wholesaleOrderSuccess}
                      </span>
                      <button
                        type="button"
                        onClick={() => setWholesaleOrderSuccess(null)}
                        className="text-emerald-700 font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {products.map((prod) => {
                        const tiers =
                          prod.wholesaleStrengths && prod.wholesaleStrengths.length > 0
                            ? prod.wholesaleStrengths
                            : [
                                {
                                  label: '10-Vial Wholesale Kit',
                                  vialsCount: 10,
                                  price: prod.wholesalePrice ?? Math.round(prod.price * 0.7)
                                }
                              ];
                        const activeTierIdx = selectedWholesaleTier[prod.id] ?? 0;
                        const activeTier = tiers[activeTierIdx] || tiers[0];
                        const kitPrice = activeTier.price;
                        const wholesalePerVial = (kitPrice / (activeTier.vialsCount || 10)).toFixed(2);
                        const inCart = wholesaleCart.find(
                          (c) => c.product.id === prod.id && c.strengthLabel === activeTier.label
                        );

                        return (
                          <div
                            key={prod.id}
                            className="p-4 rounded-2xl border border-[#dfd7c7] bg-[#fffdfb] flex flex-col justify-between space-y-3"
                          >
                            <div className="flex items-start gap-3">
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                referrerPolicy="no-referrer"
                                className="w-14 h-14 rounded-xl object-cover border border-[#dfd7c7] bg-[#f6f4ee] shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <span className="text-[11px] font-semibold text-[#c5a059] block">
                                  {prod.categoryLabel}
                                </span>
                                <h3 className="font-serif text-base font-bold text-[#0c2340] truncate">
                                  {prod.name}
                                </h3>
                                <span className="font-mono text-[11px] text-[#5a6b7c]">
                                  HPLC {prod.purity || '99.5%'}
                                </span>
                              </div>
                            </div>

                            {tiers.length > 1 && (
                              <div>
                                <label className="block text-[11px] font-medium text-[#5a6b7c] mb-1">
                                  Select 10-Vial Kit Strength:
                                </label>
                                <select
                                  value={activeTierIdx}
                                  onChange={(e) =>
                                    setSelectedWholesaleTier((prev) => ({
                                      ...prev,
                                      [prod.id]: Number(e.target.value)
                                    }))
                                  }
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] cursor-pointer"
                                >
                                  {tiers.map((t, idx) => (
                                    <option key={t.label} value={idx}>
                                      {t.label} — ${t.price.toFixed(2)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            <div className="p-3 rounded-xl bg-[#f6f4ee] border border-[#dfd7c7]/70 flex items-center justify-between text-xs">
                              <div>
                                <span className="text-[11px] text-[#5a6b7c] block">{activeTier.label}</span>
                                <strong className="font-serif text-lg text-[#0c2340] tabular-nums">
                                  ${kitPrice.toFixed(2)}
                                </strong>
                                <span className="text-[11px] text-[#c5a059] font-semibold block tabular-nums">
                                  ${wholesalePerVial} / vial
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setWholesaleCart((prev) => {
                                    const existing = prev.find(
                                      (item) =>
                                        item.product.id === prod.id && item.strengthLabel === activeTier.label
                                    );
                                    if (existing) {
                                      return prev.map((item) =>
                                        item.product.id === prod.id && item.strengthLabel === activeTier.label
                                          ? { ...item, kitsCount: item.kitsCount + 1 }
                                          : item
                                      );
                                    }
                                    return [
                                      ...prev,
                                      {
                                        product: prod,
                                        strengthLabel: activeTier.label,
                                        kitPrice,
                                        kitsCount: 1
                                      }
                                    ];
                                  });
                                }}
                                className="px-3.5 py-2 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer"
                              >
                                {inCart ? `Add Another (${inCart.kitsCount})` : '+ Add Kit'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right Wholesale Order Summary Box */}
                    <div className="lg:col-span-4 p-5 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7] space-y-4 sticky top-24">
                      <h3 className="font-serif text-xl font-bold text-[#0c2340]">
                        Facility Wholesale Order
                      </h3>
                      {wholesaleCart.length === 0 ? (
                        <p className="text-xs text-[#5a6b7c] py-4">
                          Select 10-vial kits from the catalog to build your wholesale facility order.
                        </p>
                      ) : (
                        <div className="space-y-3 text-xs">
                          {wholesaleCart.map((item) => (
                            <div
                              key={`${item.product.id}-${item.strengthLabel}`}
                              className="p-3 rounded-xl bg-white border border-[#dfd7c7] flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <span className="font-semibold text-[#0c2340] block truncate">{item.product.name}</span>
                                <span className="text-[11px] text-[#5a6b7c] tabular-nums">
                                  {item.kitsCount} × {item.strengthLabel} (${item.kitPrice.toFixed(2)}/kit)
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setWholesaleCart((prev) =>
                                      prev
                                        .map((c) =>
                                          c.product.id === item.product.id &&
                                          c.strengthLabel === item.strengthLabel
                                            ? { ...c, kitsCount: c.kitsCount - 1 }
                                            : c
                                        )
                                        .filter((c) => c.kitsCount > 0)
                                    )
                                  }
                                  className="w-6 h-6 rounded bg-[#f6f4ee] text-[#0c2340] flex items-center justify-center cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-bold text-[#0c2340] w-5 text-center tabular-nums">
                                  {item.kitsCount}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setWholesaleCart((prev) =>
                                      prev.map((c) =>
                                        c.product.id === item.product.id &&
                                        c.strengthLabel === item.strengthLabel
                                          ? { ...c, kitsCount: c.kitsCount + 1 }
                                          : c
                                      )
                                    )
                                  }
                                  className="w-6 h-6 rounded bg-[#f6f4ee] text-[#0c2340] flex items-center justify-center cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}

                          <div>
                            <label className="block text-[11px] font-semibold text-[#5a6b7c] mb-1">
                              Facility Delivery / Cold-Chain Notes
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Receiving hours, suite number, or cold-chain instructions..."
                              value={wholesaleShippingNotes}
                              onChange={(e) => setWholesaleShippingNotes(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340]"
                            />
                          </div>

                          <div className="pt-2 border-t border-[#dfd7c7] space-y-1 tabular-nums">
                            <div className="flex justify-between text-[#5a6b7c]">
                              <span>Total Kits (10 vials/kit):</span>
                              <span className="font-semibold text-[#0c2340]">
                                {wholesaleCart.reduce((acc, i) => acc + i.kitsCount, 0)} kits (
                                {wholesaleCart.reduce((acc, i) => acc + i.kitsCount * 10, 0)} vials)
                              </span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-[#0c2340]">
                              <span>Wholesale Total:</span>
                              <span className="font-serif text-[#c5a059]">
                                $
                                {wholesaleCart
                                  .reduce((acc, i) => acc + i.kitPrice * i.kitsCount, 0)
                                  .toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={submittingWholesale}
                            onClick={async () => {
                              setSubmittingWholesale(true);
                              try {
                                const subtotal = wholesaleCart.reduce(
                                  (acc, i) => acc + i.kitPrice * i.kitsCount,
                                  0
                                );
                                const createdOrder = await dbService.createOrder({
                                  customerName: `${partner.name} (Wholesale)`,
                                  customerEmail: partner.email,
                                  shippingAddress: {
                                    fullName: partner.contactPerson || partner.name,
                                    addressLine1: partner.address || partner.location || 'Partner Facility',
                                    city: partner.location || 'Austin',
                                    state: 'TX',
                                    postalCode: '78701',
                                    country: 'US',
                                    phone: partner.phone
                                  },
                                  items: wholesaleCart.map((c) => ({
                                    productId: c.product.id,
                                    productName: `${c.product.name} [Wholesale 10-Vial Kit]`,
                                    productSlug: c.product.slug,
                                    selectedStrength: {
                                      label: c.strengthLabel,
                                      vialsCount: 10,
                                      price: c.kitPrice
                                    },
                                    unitPrice: c.kitPrice,
                                    quantity: c.kitsCount,
                                    imageUrl: c.product.imageUrl
                                  })),
                                  subtotal,
                                  volumeDiscount: 0,
                                  partnerDiscount: 0,
                                  shipping: 0,
                                  tax: 0,
                                  total: subtotal,
                                  status: 'CONFIRMED',
                                  paymentStatus: 'PAID',
                                  partnerId: partner.id,
                                  partnerSlug: partner.slug,
                                  partnerName: partner.name,
                                  referralSource: wholesaleShippingNotes || 'Wholesale 10-Vial Kit Order',
                                  partnerCommission: 0,
                                  commissionStatus: 'NONE'
                                });
                                setWholesaleOrderSuccess(`${createdOrder.orderNumber} ($${subtotal.toFixed(2)})`);
                                setWholesaleCart([]);
                                setWholesaleShippingNotes('');
                                await loadPartnerDetails(partner);
                              } finally {
                                setSubmittingWholesale(false);
                              }
                            }}
                            className="w-full py-3 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer"
                          >
                            {submittingWholesale ? 'Submitting Wholesale Order...' : 'Submit Wholesale 10-Vial Order'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================= SALES & ORDERS ======================= */}
          {activeSection === 'orders' && (
            <div className="bg-[#fffdfb] border border-[#dfd7c7] rounded-3xl overflow-hidden shadow-2xs">
              <div className="p-5 sm:p-6 border-b border-[#dfd7c7] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#0c2340]">Sales &amp; Referred Orders</h2>
                  <p className="text-xs text-[#5a6b7c]">
                    Track community referral orders, facility wholesale kits, and fulfillment status.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#dfd7c7] text-xs font-medium text-[#0c2340] cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING_GROUP">Pending / Processing</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as 'current_month' | 'prev_month' | 'ytd' | 'all')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#dfd7c7] text-xs font-medium text-[#0c2340] cursor-pointer"
                  >
                    <option value="all">Lifetime History</option>
                    <option value="current_month">Current Month</option>
                    <option value="prev_month">Previous Month</option>
                    <option value="ytd">Year to Date</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="px-3.5 py-1.5 rounded-xl border border-[#dfd7c7] bg-[#f6f4ee] hover:bg-[#dfd7c7]/50 text-xs font-semibold text-[#0c2340] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              <div className="p-4 border-b border-[#dfd7c7]/60 flex items-center gap-3 bg-[#f9f8f4]">
                <Search className="w-4 h-4 text-[#5a6b7c]" />
                <input
                  type="text"
                  placeholder="Filter orders by ID, patient name, or formulation..."
                  value={ordersSearchQuery}
                  onChange={(e) => setOrdersSearchQuery(e.target.value)}
                  className="w-full text-xs text-[#0c2340] placeholder-[#5a6b7c] bg-transparent focus:outline-none"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f6f4ee] text-[#0c2340] font-serif border-b border-[#dfd7c7]">
                    <tr>
                      <th className="p-4 font-bold">Date</th>
                      <th className="p-4 font-bold">Order ID</th>
                      <th className="p-4 font-bold">Customer</th>
                      <th className="p-4 font-bold">Formulations</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold text-right">Revenue</th>
                      <th className="p-4 font-bold text-right text-[#c5a059]">Commission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dfd7c7]/50 text-[#5a6b7c]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-10 text-center text-[#5a6b7c]">
                          No orders found matching this filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr
                          key={ord.id}
                          onClick={() => setSelectedOrder(ord)}
                          className="hover:bg-[#f6f4ee]/60 transition-colors cursor-pointer"
                        >
                          <td className="p-4 whitespace-nowrap tabular-nums">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 font-mono font-semibold text-[#0c2340] whitespace-nowrap">
                            {ord.orderNumber}
                          </td>
                          <td className="p-4 font-medium text-[#0c2340]">{ord.customerName}</td>
                          <td className="p-4 max-w-xs truncate">
                            {ord.items.map((i) => `${i.productName} × ${i.quantity}`).join(', ')}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                ord.status === 'COMPLETED'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : ord.status === 'CANCELLED'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-4 text-right font-semibold text-[#0c2340] tabular-nums">
                            ${ord.subtotal.toFixed(2)}
                          </td>
                          <td className="p-4 text-right font-bold text-[#c5a059] tabular-nums">
                            ${(ord.partnerCommission || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================= EARNINGS LEDGER ======================= */}
          {activeSection === 'earnings' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#fffdfb] border border-[#dfd7c7] rounded-2xl p-5">
                  <span className="text-xs font-medium text-[#5a6b7c]">Total Partner Earnings</span>
                  <div className="font-serif text-3xl font-bold text-[#0c2340] tabular-nums mt-1">
                    ${totalEarnings.toFixed(2)}
                  </div>
                  <span className="text-[11px] text-[#c5a059] font-semibold">
                    {(partner.commissionRate * 100).toFixed(0)}% Partner Revenue Share
                  </span>
                </div>
                <div className="bg-[#0c2340] text-white rounded-2xl p-5">
                  <span className="text-xs font-medium text-[#dfd7c7]">Eligible / Pending Payout</span>
                  <div className="font-serif text-3xl font-bold text-[#c5a059] tabular-nums mt-1">
                    ${pendingEarnings.toFixed(2)}
                  </div>
                  <span className="text-[11px] text-[#dfd7c7]">Scheduled on next payout cycle</span>
                </div>
                <div className="bg-[#fffdfb] border border-[#dfd7c7] rounded-2xl p-5">
                  <span className="text-xs font-medium text-[#5a6b7c]">Total Settled &amp; Paid</span>
                  <div className="font-serif text-3xl font-bold text-[#4b6b58] tabular-nums mt-1">
                    ${paidEarnings.toFixed(2)}
                  </div>
                  <span className="text-[11px] text-[#5a6b7c]">Completed disbursements</span>
                </div>
              </div>

              <div className="bg-[#fffdfb] border border-[#dfd7c7] rounded-3xl overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-[#dfd7c7] flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#0c2340]">Commission Ledger</h2>
                    <p className="text-xs text-[#5a6b7c]">Line-by-line commission attribution across referred orders.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportEarningsCSV}
                    className="px-4 py-2 rounded-xl border border-[#dfd7c7] bg-[#f6f4ee] hover:bg-[#dfd7c7]/50 text-xs font-semibold text-[#0c2340] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Earnings CSV</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#f6f4ee] text-[#0c2340] font-serif border-b border-[#dfd7c7]">
                      <tr>
                        <th className="p-4 font-bold">Ledger Date</th>
                        <th className="p-4 font-bold">Order Ref</th>
                        <th className="p-4 font-bold">Customer</th>
                        <th className="p-4 font-bold text-right">Gross Order</th>
                        <th className="p-4 font-bold text-right">Rate</th>
                        <th className="p-4 font-bold text-right">Earning</th>
                        <th className="p-4 font-bold">Payout Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dfd7c7]/50 text-[#5a6b7c]">
                      {dateFilteredEarnings.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-10 text-center text-[#5a6b7c]">
                            No ledger records found for this date period.
                          </td>
                        </tr>
                      ) : (
                        dateFilteredEarnings.map((e) => (
                          <tr key={e.id} className="hover:bg-[#f6f4ee]/60">
                            <td className="p-4 tabular-nums">{new Date(e.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 font-mono font-semibold text-[#0c2340]">{e.orderNumber}</td>
                            <td className="p-4 text-[#0c2340]">{e.customerName}</td>
                            <td className="p-4 text-right tabular-nums">${e.grossSales.toFixed(2)}</td>
                            <td className="p-4 text-right tabular-nums">{(e.commissionRate * 100).toFixed(0)}%</td>
                            <td className="p-4 text-right font-bold text-[#c5a059] tabular-nums">
                              ${e.earningAmount.toFixed(2)}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                  e.status === 'PAID'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : e.status === 'APPROVED'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {e.status}
                              </span>
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

          {/* ======================= MY LANDING PAGE ======================= */}
          {activeSection === 'landing-page' && (
            <div className="bg-[#fffdfb] border border-[#dfd7c7] rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dfd7c7] pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#0c2340]">
                    Your Co-Branded Partner Landing Page
                  </h2>
                  <p className="text-xs text-[#5a6b7c]">
                    Preview how clients experience your curated Whole Harbor Wellness storefront.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => switchSection('profile')}
                    className="px-4 py-2 rounded-xl border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] hover:bg-[#f6f4ee] cursor-pointer"
                  >
                    Edit Page Branding
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('partner-page', partner.slug)}
                    className="px-4 py-2 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>Launch Live Landing Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7] grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8 space-y-3">
                  <span className="text-xs font-semibold text-[#c5a059]">
                    Live URL: {referralUrl}
                  </span>
                  <h3 className="font-serif text-3xl font-bold text-[#0c2340]">{partner.name}</h3>
                  <p className="text-xs sm:text-sm text-[#5a6b7c] leading-relaxed">
                    {partner.description || 'Dedicated wellness storefront delivering HPLC-verified formulations to your community.'}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 text-xs text-[#0c2340]">
                    <span className="font-semibold">Featured Categories:</span>
                    {(partner.preferredCategories && partner.preferredCategories.length > 0
                      ? partner.preferredCategories
                      : ['metabolic', 'recovery', 'longevity']
                    ).map((cat) => (
                      <span key={cat} className="text-[#5a6b7c]">
                        {WELLNESS_CATEGORIES.find((c) => c.key === cat)?.label || cat}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-[#dfd7c7]">
                  {partner.logoUrl ? (
                    <img src={partner.logoUrl} alt={partner.name} referrerPolicy="no-referrer" className="h-20 object-contain mb-2" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#0c2340] text-white font-serif text-xl font-bold flex items-center justify-center mb-2">
                      {partnerInitials}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-[#0c2340]">{(partner.memberDiscountRate * 100).toFixed(0)}% VIP Community Discount Active</span>
                </div>
              </div>
            </div>
          )}

          {/* ======================= WELLNESS PROGRAMS ======================= */}
          {activeSection === 'programs' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#0c2340]">Wellness Programs</h2>
                  <p className="text-xs text-[#5a6b7c]">
                    Structured wellness protocols you can share with patients through your partner storefront.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('wellness-programs')}
                  className="px-4 py-2 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer self-start"
                >
                  Open Public Programs Page →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {programs.length === 0 ? (
                  <div className="col-span-full bg-[#fffdfb] border border-[#dfd7c7] rounded-2xl p-8 text-center text-xs text-[#5a6b7c]">
                    No active wellness programs published yet.
                  </div>
                ) : (
                  programs.map((prog) => (
                    <div
                      key={prog.id}
                      className="bg-[#fffdfb] border border-[#dfd7c7] rounded-2xl overflow-hidden flex flex-col justify-between p-5 space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="font-semibold text-[#c5a059]">
                            {prog.duration || 'Structured Program'}
                          </span>
                          <span className="text-[#5a6b7c] font-medium">
                            {prog.tag || prog.category}
                          </span>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-[#0c2340]">{prog.name}</h3>
                        <p className="text-xs text-[#5a6b7c] line-clamp-3">{prog.shortDescription}</p>
                        {prog.priceMonthly > 0 && (
                          <p className="text-xs font-semibold text-[#0c2340] tabular-nums pt-1">
                            ${prog.priceMonthly.toFixed(0)} / month guided track
                          </p>
                        )}
                      </div>
                      <div className="pt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={copyReferralLink}
                            className="flex-1 py-2 px-3 rounded-xl bg-[#f6f4ee] border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] hover:bg-[#dfd7c7]/50 cursor-pointer"
                          >
                            {copiedLink ? 'Link Copied!' : 'Copy Referral Link'}
                          </button>
                        <button
                          type="button"
                          onClick={() => navigate('partner-page', partner.slug)}
                          className="py-2 px-3 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] cursor-pointer"
                        >
                          Share
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ======================= PARTNER RESOURCES ======================= */}
          {activeSection === 'resources' && (
            <div className="space-y-6">
              <div className="bg-[#0c2340] text-white rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-[#c5a059]/30">
                <div className="space-y-2 max-w-2xl">
                  <span className="text-xs font-semibold text-[#c5a059] block">
                    Partner Education &amp; Marketing Toolkit
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold">
                    Bring Whole Harbor Wellness to Your Community
                  </h2>
                  <p className="text-xs sm:text-sm text-[#dfd7c7]">
                    Access reconstitution guides, cold-chain protocols, and printable reception QR signage for your members.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 shrink-0">
                  {qrCodeUrl && (
                    <a
                      href={qrCodeUrl}
                      download={`${partner.slug}-qr.png`}
                      className="px-4 py-2.5 rounded-xl bg-[#c5a059] text-white text-xs font-semibold hover:bg-white hover:text-[#0c2340] transition-colors inline-flex items-center gap-1.5"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Download Clinic QR</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate('learn')}
                    className="px-4 py-2.5 rounded-xl border border-white/25 text-white text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Open Education Hub →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {articles.map((art) => (
                  <div
                    key={art.id}
                    className="bg-[#fffdfb] border border-[#dfd7c7] rounded-2xl overflow-hidden flex flex-col justify-between"
                  >
                    {art.imageUrl && (
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-36 object-cover border-b border-[#dfd7c7]"
                      />
                    )}
                    <div className="p-5 space-y-2.5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-[11px] text-[#5a6b7c] flex items-center gap-1.5">
                          <span className="font-semibold text-[#c5a059]">{art.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{art.readTime}</span>
                        </div>
                        <h3 className="font-serif text-lg font-bold text-[#0c2340] mt-1">{art.title}</h3>
                        <p className="text-xs text-[#5a6b7c] mt-1 line-clamp-3">{art.summary}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedArticle(art)}
                        className="w-full mt-3 py-2 rounded-xl bg-[#f6f4ee] border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] hover:bg-[#0c2340] hover:text-white transition-colors cursor-pointer"
                      >
                        Read Clinical Guide →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================= REPORTS & ANALYTICS ======================= */}
          {activeSection === 'reports' && (
            <div className="space-y-6">
              <div className="bg-[#fffdfb] border border-[#dfd7c7] rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dfd7c7] pb-4">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#0c2340]">Reports &amp; Analytics</h2>
                    <p className="text-xs text-[#5a6b7c]">Monthly performance telemetry and exportable settlement logs.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="px-4 py-2 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Orders CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportEarningsCSV}
                      className="px-4 py-2 rounded-xl border border-[#dfd7c7] bg-[#f6f4ee] text-[#0c2340] text-xs font-semibold hover:bg-[#dfd7c7]/50 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Earnings CSV</span>
                    </button>
                  </div>
                </div>

                {monthlySummary.length === 0 ? (
                  <p className="text-xs text-[#5a6b7c] py-6 text-center">No monthly telemetry recorded yet for this range.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    {monthlySummary.map((m) => (
                      <div key={m.label} className="p-4 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7] space-y-1.5 tabular-nums">
                        <div className="flex items-center justify-between font-semibold text-[#0c2340]">
                          <span>{m.label}</span>
                          <span className="text-[#c5a059] font-bold">${m.commission.toFixed(2)}</span>
                        </div>
                        <div className="text-[11px] text-[#5a6b7c] flex justify-between">
                          <span>{m.ordersCount} orders ({m.completedCount} completed)</span>
                          <span>${m.grossSales.toFixed(0)} gross</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2">
                  <h3 className="font-serif text-lg font-bold text-[#0c2340] mb-3">Top Formulations Breakdown</h3>
                  <div className="divide-y divide-[#dfd7c7]/60 border border-[#dfd7c7] rounded-2xl overflow-hidden">
                    {topProducts.map((item, idx) => (
                      <div key={item.id} className="p-3.5 bg-white flex items-center justify-between gap-3 text-xs tabular-nums">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono font-bold text-[#c5a059] w-5">0{idx + 1}</span>
                          <img src={item.imageUrl} alt={item.name} referrerPolicy="no-referrer" className="w-9 h-9 rounded-lg object-cover border border-[#dfd7c7]" />
                          <div className="min-w-0">
                            <p className="font-semibold text-[#0c2340] truncate">{item.name}</p>
                            <p className="text-[11px] text-[#5a6b7c]">{item.units} units</p>
                          </div>
                        </div>
                        <span className="font-bold text-[#0c2340]">${item.revenue.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================= NOTIFICATIONS ======================= */}
          {activeSection === 'notifications' && (
            <div className="bg-[#fffdfb] border border-[#dfd7c7] rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-[#dfd7c7] pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#0c2340]">Partner Notifications</h2>
                  <p className="text-xs text-[#5a6b7c]">Real-time order attribution, commission settlements, and status updates.</p>
                </div>
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="px-4 py-2 rounded-xl border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] hover:bg-[#f6f4ee] cursor-pointer"
                >
                  Mark All Read
                </button>
              </div>
              <div className="divide-y divide-[#dfd7c7]/60">
                {partnerNotifications.map((n) => {
                  const isUnread = !readNotifications.includes(n.id);
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => switchSection(n.targetSection)}
                      className={`w-full text-left p-4 rounded-2xl transition-colors cursor-pointer flex items-start justify-between gap-4 ${
                        isUnread ? 'bg-[#f6f4ee]/80 hover:bg-[#f6f4ee]' : 'hover:bg-[#f9f8f4]'
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[#0c2340]">{n.title}</p>
                        <p className="text-xs text-[#5a6b7c]">{n.detail}</p>
                      </div>
                      <span className="text-[11px] text-[#5a6b7c] shrink-0">{n.time}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================= SETTINGS ======================= */}
          {activeSection === 'settings' && (
            <form onSubmit={handleSavePartnerSettings} className="bg-[#fffdfb] border border-[#dfd7c7] rounded-3xl p-6 sm:p-8 max-w-3xl space-y-5 text-xs">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#0c2340]">Partner Portal Settings</h2>
                <p className="text-[#5a6b7c] mt-0.5">Configure alert preferences and default wholesale delivery instructions.</p>
              </div>

              {settingsSavedMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Partner preferences saved locally.</span>
                </div>
              )}

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7] cursor-pointer">
                  <div>
                    <span className="font-semibold text-[#0c2340] block">Order Attribution Alerts</span>
                    <span className="text-[#5a6b7c]">Notify when patients place referred orders through your URL</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={partnerSettings.emailOrderAlerts}
                    onChange={(e) => setPartnerSettings((s) => ({ ...s, emailOrderAlerts: e.target.checked }))}
                    className="w-4 h-4 accent-[#0c2340]"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7] cursor-pointer">
                  <div>
                    <span className="font-semibold text-[#0c2340] block">Payout Settlement Notices</span>
                    <span className="text-[#5a6b7c]">Receive summary updates when eligible commissions are settled</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={partnerSettings.emailPayoutAlerts}
                    onChange={(e) => setPartnerSettings((s) => ({ ...s, emailPayoutAlerts: e.target.checked }))}
                    className="w-4 h-4 accent-[#0c2340]"
                  />
                </label>
              </div>

              <div>
                <label className="block font-semibold text-[#0c2340] mb-1">Default Reporting Period</label>
                <select
                  value={partnerSettings.defaultDateFilter}
                  onChange={(e) =>
                    setPartnerSettings((s) => ({
                      ...s,
                      defaultDateFilter: e.target.value as PartnerSettings['defaultDateFilter']
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340]"
                >
                  <option value="all">Lifetime History</option>
                  <option value="current_month">Current Month</option>
                  <option value="prev_month">Previous Month</option>
                  <option value="ytd">Year to Date (YTD)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#0c2340] mb-1">Default Wholesale Cold-Chain Delivery Note</label>
                <textarea
                  rows={2}
                  value={partnerSettings.defaultDeliveryNote}
                  onChange={(e) => setPartnerSettings((s) => ({ ...s, defaultDeliveryNote: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340]"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#0c2340] text-white font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer"
              >
                Save Preferences
              </button>
            </form>
          )}
        </main>
      </div>

      {/* ======================= ORDER DETAIL MODAL ======================= */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-[#0c2340]/55 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-[#fffdfb] border border-[#dfd7c7] rounded-3xl w-full max-w-lg max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-[#f6f4ee] border-b border-[#dfd7c7] flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-[#c5a059] font-bold">{selectedOrder.orderNumber}</span>
                <h3 className="font-serif text-xl font-bold text-[#0c2340]">Order Attribution Dossier</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close modal"
                className="p-2 rounded-xl hover:bg-[#dfd7c7]/50 text-[#0c2340] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7]">
                <div>
                  <span className="text-[#5a6b7c] block">Customer</span>
                  <span className="font-semibold text-[#0c2340]">{selectedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-[#5a6b7c] block">Order Date</span>
                  <span className="font-semibold text-[#0c2340] tabular-nums">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-[#5a6b7c] block">Order Status</span>
                  <span className="font-semibold text-[#0c2340]">{selectedOrder.status}</span>
                </div>
                <div>
                  <span className="text-[#5a6b7c] block">Partner Commission</span>
                  <span className="font-bold text-[#c5a059] tabular-nums">
                    ${(selectedOrder.partnerCommission || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-[#0c2340] block">Line Items</span>
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-[#dfd7c7] flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-semibold text-[#0c2340] block">{item.productName}</span>
                      <span className="text-[11px] text-[#5a6b7c]">
                        {item.selectedStrength.label} · Qty {item.quantity}
                      </span>
                    </div>
                    <span className="font-bold text-[#0c2340] tabular-nums">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-[#f6f4ee] border-t border-[#dfd7c7] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= RESOURCE ARTICLE READER MODAL ======================= */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 bg-[#0c2340]/55 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-[#fffdfb] border border-[#dfd7c7] rounded-3xl w-full max-w-2xl max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-[#f6f4ee] border-b border-[#dfd7c7] flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-[#c5a059]">
                  {selectedArticle.category} · {selectedArticle.readTime}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#0c2340] truncate">{selectedArticle.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                aria-label="Close guide"
                className="p-2 rounded-xl hover:bg-[#dfd7c7]/50 text-[#0c2340] cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-[#5a6b7c] leading-relaxed">
              {selectedArticle.imageUrl && (
                <img
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-48 object-cover rounded-2xl border border-[#dfd7c7]"
                />
              )}
              <p className="font-semibold text-[#0c2340]">{selectedArticle.summary}</p>
              <div className="whitespace-pre-line">{selectedArticle.content}</div>
            </div>

            <div className="px-6 py-4 bg-[#f6f4ee] border-t border-[#dfd7c7] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setSelectedArticle(null);
                  navigate('learn');
                }}
                className="text-xs font-semibold text-[#c5a059] hover:text-[#0c2340] cursor-pointer"
              >
                Open Full Education Hub →
              </button>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer"
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
