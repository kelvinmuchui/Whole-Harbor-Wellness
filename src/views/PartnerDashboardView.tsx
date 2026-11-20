import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { dbService } from '../services/dbService.ts';
import { Partner, Order, PartnerEarning, Product, ProductCategoryType } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface PartnerDashboardViewProps {
  navigate: (path: string, param?: string) => void;
}

interface WholesaleCartItem {
  product: Product;
  strengthLabel: string;
  kitPrice: number;
  kitsCount: number;
}

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

export const PartnerDashboardView: React.FC<PartnerDashboardViewProps> = ({ navigate }) => {
  const { currentUser, isAdmin } = useAuth();
  const [allPartners, setAllPartners] = useState<Partner[]>([]);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [earnings, setEarnings] = useState<PartnerEarning[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [dateFilter, setDateFilter] = useState<'current_month' | 'prev_month' | 'ytd' | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'wholesale' | 'sales' | 'ledger' | 'assets'>('wholesale');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDirectLink, setCopiedDirectLink] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

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
    } else {
      setOrders([]);
      setEarnings([]);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [partnersList, myApps, productsList] = await Promise.all([
          dbService.getPartners(),
          dbService.getMyPartnerApplications(),
          dbService.getProducts()
        ]);

        const mergedMap = new Map<string, Partner>();
        [...myApps, ...partnersList].forEach((p) => {
          mergedMap.set(p.id, p);
        });
        const mergedPartners = Array.from(mergedMap.values());
        setAllPartners(mergedPartners);
        setProducts(productsList.filter((p) => p.status === 'ACTIVE'));

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

  if (loading) {
    return (
      <div className="py-24 text-center text-[#5a6b7c] space-y-3">
        <span className="w-8 h-8 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin inline-block"></span>
        <p className="text-xs">Loading Partner Telemetry &amp; Ledger...</p>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h2 className="font-serif text-2xl font-bold text-[#0c2340] mb-4">No Partner Account Found</h2>
        <p className="text-xs text-[#5a6b7c] mb-6">Please submit a partner application or log in with partner credentials.</p>
        <button
          onClick={() => navigate('partners')}
          className="px-6 py-2.5 rounded-xl bg-[#c5a059] text-white text-xs font-semibold cursor-pointer"
        >
          Become a Partner
        </button>
      </div>
    );
  }

  // KPI Calculations (Period-Filtered)
  const totalOrders = dateFilteredOrders.length;
  const completedOrders = dateFilteredOrders.filter((o) => o.status === 'COMPLETED').length;
  const pendingOrders = dateFilteredOrders.filter(
    (o) => o.status === 'PENDING' || o.status === 'PROCESSING' || o.status === 'CONFIRMED'
  ).length;
  const cancelledOrders = dateFilteredOrders.filter((o) => o.status === 'CANCELLED').length;
  const grossSales = dateFilteredOrders.reduce((acc, o) => acc + o.subtotal, 0);
  const totalEarnings = dateFilteredEarnings.reduce((acc, e) => acc + e.earningAmount, 0);
  const pendingEarnings = dateFilteredEarnings
    .filter((e) => e.status === 'PENDING')
    .reduce((acc, e) => acc + e.earningAmount, 0);
  const paidEarnings = dateFilteredEarnings
    .filter((e) => e.status === 'PAID')
    .reduce((acc, e) => acc + e.earningAmount, 0);

  // Search filter
  const filteredOrders = dateFilteredOrders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.items.some((it) => it.productName.toLowerCase().includes(q))
    );
  });

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralUrl);
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
      setProfileSaveMsg('Partner storefront profile, logo & featured categories saved.');
    } catch {
      setProfileErrorMsg('Unable to save profile updates right now.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-[#dfd7c7] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-[#c5a059] text-[#fffdfb] font-semibold">
              {partner.partnerId}
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-[#5a6b7c]">
              {partner.category}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#dfd7c7] text-[#c5a059]">
              STATUS: {partner.status}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-[#0c2340] font-bold mt-2">
            {partner.name} — Partner Portal
          </h1>
          <p className="text-xs text-[#5a6b7c] mt-1">
            Community sales tracking, transparent commission attribution &amp; partner infrastructure.
          </p>
        </div>

        {/* Header Action Buttons & Admin-only Partner Account Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && allPartners.length > 1 && (
            <select
              value={partner.id}
              onChange={(e) => {
                const found = allPartners.find((p) => p.id === e.target.value) || null;
                setWholesaleCart([]);
                setWholesaleOrderSuccess(null);
                loadPartnerDetails(found);
              }}
              className="px-3 py-2 rounded-xl bg-[#f6f4ee] border border-[#dfd7c7] text-[#0c2340] text-xs font-semibold cursor-pointer"
              aria-label="Switch Partner Account"
            >
              {allPartners.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name} ({pt.status})
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => navigate('partners')}
            className="px-4 py-2 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] hover:bg-[#f6f4ee] text-xs font-semibold transition-colors cursor-pointer"
          >
            Partner Application Page
          </button>
          <button
            onClick={() => navigate('partner-page', partner.slug)}
            className="px-4 py-2 rounded-xl bg-[#0c2340] text-white hover:bg-[#c5a059] text-xs font-semibold transition-colors cursor-pointer"
          >
            View Your Live Storefront →
          </button>
        </div>
      </div>

      {/* HOW TO PARTNER BLURB (Shown when visiting Partner Portal from bottom menu or top) */}
      <section className="bg-gradient-to-br from-[#f6f4ee] via-[#fffdfb] to-[#f6f4ee] border-2 border-[#c5a059]/40 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        <div className="space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest text-[#c5a059]">
            WHOLE HARBOR → YOUR WELLNESS JOURNEY → PARTNER WITH US
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#0c2340]">
            BRING WHOLE HARBOR WELLNESS TO YOUR COMMUNITY
          </h2>
          <p className="font-serif text-lg sm:text-xl text-[#c5a059] font-medium">
            Your Community. Your Brand. Our Wellness Infrastructure.
          </p>
          <div className="text-xs sm:text-sm text-[#5a6b7c] leading-relaxed space-y-2.5 max-w-4xl pt-1">
            <p className="font-semibold text-[#0c2340]">
              You already have something valuable: People who trust you.
            </p>
            <p>
              Maybe you run a fitness studio, yoga studio, wellness practice, gym, coaching business, athletic organization, community program or another business serving people who care about their health.
            </p>
            <p>
              Whole Harbor gives you an opportunity to expand the wellness resources you can offer your community—without having to build the entire infrastructure yourself.
            </p>
          </div>
        </div>

        {/* BECOME A WHOLE HARBOR PARTNER Callout */}
        <div className="bg-[#0c2340] text-white rounded-2xl p-6 sm:p-8 space-y-3 border border-[#c5a059]/30">
          <span className="text-xs uppercase font-bold tracking-widest text-[#c5a059] block">
            BECOME A WHOLE HARBOR PARTNER
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold">
            We'll help provide the infrastructure behind the experience.
          </h3>
          <p className="text-xs sm:text-sm text-[#dfd7c7]">
            You bring the relationship. We help build the platform.
          </p>
        </div>

        {/* WHAT YOUR PARTNERSHIP CAN INCLUDE - 5 Cards */}
        <div className="space-y-4">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0c2340]">
            WHAT YOUR PARTNERSHIP CAN INCLUDE
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#dfd7c7] space-y-2 shadow-2xs">
              <span className="font-mono text-xs font-bold text-[#c5a059] block">01</span>
              <h4 className="font-serif text-base font-bold text-[#0c2340]">A BRANDED WELLNESS EXPERIENCE</h4>
              <p className="text-xs text-[#5a6b7c] leading-relaxed">
                We can help create a Whole Harbor-powered landing page designed around your business and your audience.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#dfd7c7] space-y-2 shadow-2xs">
              <span className="font-mono text-xs font-bold text-[#c5a059] block">02</span>
              <h4 className="font-serif text-base font-bold text-[#0c2340]">YOUR OWN UNIQUE LINK</h4>
              <p className="text-xs text-[#5a6b7c] leading-relaxed">
                Your clients can access your wellness experience through a dedicated link associated with your organization.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#dfd7c7] space-y-2 shadow-2xs">
              <span className="font-mono text-xs font-bold text-[#c5a059] block">03</span>
              <h4 className="font-serif text-base font-bold text-[#0c2340]">TRANSPARENT SALES TRACKING</h4>
              <p className="text-xs text-[#5a6b7c] leading-relaxed">
                Partners receive access to reporting that allows them to see eligible activity and sales generated through their referral channel.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#dfd7c7] space-y-2 shadow-2xs">
              <span className="font-mono text-xs font-bold text-[#c5a059] block">04</span>
              <h4 className="font-serif text-base font-bold text-[#0c2340]">MARKETING SUPPORT</h4>
              <p className="text-xs text-[#5a6b7c] leading-relaxed">
                We'll provide approved educational materials, digital resources, QR codes and promotional tools to help you introduce the program to your community.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#dfd7c7] space-y-2 shadow-2xs md:col-span-2 lg:col-span-1">
              <span className="font-mono text-xs font-bold text-[#c5a059] block">05</span>
              <h4 className="font-serif text-base font-bold text-[#0c2340]">ONGOING SUPPORT</h4>
              <p className="text-xs text-[#5a6b7c] leading-relaxed">
                You won't simply receive a link and be left on your own. Whole Harbor is building a partnership model designed to provide ongoing resources, education and support.
              </p>
            </div>
          </div>
        </div>

        {/* Narrative Closing */}
        <div className="p-6 rounded-2xl bg-white border border-[#dfd7c7] text-center space-y-3">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0c2340]">
            YOU FOCUS ON YOUR COMMUNITY. WE HELP POWER THE WELLNESS EXPERIENCE BEHIND IT.
          </h3>
          <p className="text-xs sm:text-sm text-[#5a6b7c] max-w-3xl mx-auto leading-relaxed">
            Whether you're a fitness professional looking to expand your services, a yoga studio looking for new wellness resources, a coach serving a growing community or an organization looking for additional ways to support the people you serve, Whole Harbor can help you create a more connected wellness experience.
          </p>
          <p className="text-xs sm:text-sm font-semibold text-[#0c2340]">
            Your clients already trust you. Let's give them another reason to keep moving forward.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('partners')}
              className="px-6 py-2.5 rounded-xl bg-[#c5a059] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0c2340] transition-colors cursor-pointer shadow-xs"
            >
              Apply Today &amp; Power Wellness Under Your Brand
            </button>
          </div>
        </div>

        {/* SEPARATE LINKS ARCHITECTURE: Individual Buyers vs Partner Buyers */}
        <div className="bg-[#fffdfb] p-6 sm:p-8 rounded-2xl border border-[#dfd7c7] space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c5a059]">link</span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0c2340]">
              Separate Buying Links (Individual Buyers vs. Partner Buyers)
            </h3>
          </div>
          <p className="text-xs text-[#5a6b7c]">
            Individual direct buyers and partner buyers use separate, distinct links. Below are the two different URLs:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Direct Individual Link */}
            <div className="p-4 rounded-xl bg-[#f6f4ee] border border-[#dfd7c7] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0c2340] text-white inline-block">
                Individual Buyer Link (Direct Retail)
              </span>
              <p className="text-[11px] text-[#5a6b7c]">
                For direct individual customers. Standard retail shop without partner attribution.
              </p>
              <div className="bg-white p-2 rounded-lg border border-[#dfd7c7] font-mono text-[11px] text-[#0c2340] select-all break-all">
                {window.location.origin}/#/shop
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/#/shop`);
                  setCopiedDirectLink(true);
                  setTimeout(() => setCopiedDirectLink(false), 2500);
                }}
                className="w-full py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340] hover:bg-[#dfd7c7]/40 text-xs font-semibold transition-colors cursor-pointer"
              >
                {copiedDirectLink ? 'Copied Direct Store Link!' : 'Copy Individual Buyer Link'}
              </button>
            </div>

            {/* Dedicated Partner Link + QR Code */}
            <div className="p-4 rounded-xl bg-white border-2 border-[#c5a059] space-y-3 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#c5a059] text-white inline-block">
                Partner Buyer Link (Dedicated to Your Brand)
              </span>
              <p className="text-[11px] text-[#5a6b7c]">
                Dedicated to <strong>{partner.name}</strong> clients. Displays your community banner, applies VIP savings, and credits commission to your portal.
              </p>
              <div className="bg-[#f6f4ee] p-2 rounded-lg border border-[#c5a059]/40 font-mono text-[11px] text-[#0c2340] select-all break-all font-semibold">
                {referralUrl}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copyReferralLink}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#c5a059] text-white hover:bg-[#0c2340] text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copiedLink ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedLink ? 'Copied Partner Link!' : 'Copy Partner Link'}</span>
                </button>
                <button
                  onClick={() => navigate('partner-page', partner.slug)}
                  className="px-3 py-2 rounded-lg border border-[#dfd7c7] text-[#0c2340] hover:bg-[#f6f4ee] text-xs font-semibold cursor-pointer"
                >
                  Preview
                </button>
                {qrCodeUrl && (
                  <a
                    href={qrCodeUrl}
                    download={`${partner.slug}-qr.png`}
                    className="px-3 py-2 rounded-lg bg-[#0c2340] text-white hover:bg-[#c5a059] text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">qr_code_2</span>
                    <span>QR PNG</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards Grid (7 Metrics per Module 6) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-white border border-[#dfd7c7] p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5a6b7c] block">
            Total Orders
          </span>
          <span className="font-serif text-2xl font-bold text-[#0c2340] block mt-1">
            {totalOrders}
          </span>
          <span className="text-[10px] text-[#c5a059]">Selected period</span>
        </div>

        <div className="bg-white border border-[#dfd7c7] p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5a6b7c] block">
            Completed Orders
          </span>
          <span className="font-serif text-2xl font-bold text-[#c5a059] block mt-1">
            {completedOrders}
          </span>
          <span className="text-[10px] text-[#5a6b7c]">Dispatched by lab</span>
        </div>

        <div className="bg-white border border-[#dfd7c7] p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5a6b7c] block">
            Pending Orders
          </span>
          <span className="font-serif text-2xl font-bold text-[#c5a059] block mt-1">
            {pendingOrders}
          </span>
          <span className="text-[10px] text-[#5a6b7c]">In compounding</span>
        </div>

        <div className="bg-white border border-[#dfd7c7] p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5a6b7c] block">
            Cancelled Orders
          </span>
          <span className="font-serif text-2xl font-bold text-red-700 block mt-1">
            {cancelledOrders}
          </span>
          <span className="text-[10px] text-[#5a6b7c]">Voided / refunded</span>
        </div>

        <div className="bg-white border border-[#dfd7c7] p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5a6b7c] block">
            Gross Sales
          </span>
          <span className="font-serif text-2xl font-bold text-[#0c2340] block mt-1">
            ${grossSales.toFixed(0)}
          </span>
          <span className="text-[10px] text-[#5a6b7c]">Patient volume</span>
        </div>

        <div className="bg-white border border-[#dfd7c7] p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5a6b7c] block">
            Partner Earnings
          </span>
          <span className="font-serif text-2xl font-bold text-[#c5a059] block mt-1">
            ${totalEarnings.toFixed(2)}
          </span>
          <span className="text-[10px] text-[#c5a059]">{(partner.commissionRate * 100).toFixed(0)}% Rate</span>
        </div>

        <div className="bg-[#c5a059] text-white p-4 rounded-2xl col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#dfd7c7] block">
            Pending Payout
          </span>
          <span className="font-serif text-2xl font-bold block mt-1">
            ${pendingEarnings.toFixed(2)}
          </span>
          <span className="text-[10px] text-[#dfd7c7]">Paid: ${paidEarnings.toFixed(2)}</span>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="border border-[#dfd7c7] rounded-3xl bg-white overflow-hidden shadow-xs">
        
        {/* Navigation Tabs and Date Filter Bar */}
        <div className="p-4 bg-[#f6f4ee] border-b border-[#dfd7c7] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('wholesale')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'wholesale'
                  ? 'bg-[#c5a059] text-white'
                  : 'text-[#5a6b7c] hover:bg-[#dfd7c7]/50'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {partner.status === 'APPROVED' ? 'inventory_2' : 'lock'}
              </span>
              <span>Wholesale 10-Vial Kits</span>
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'sales'
                  ? 'bg-[#c5a059] text-white'
                  : 'text-[#5a6b7c] hover:bg-[#dfd7c7]/50'
              }`}
            >
              Sales &amp; Orders ({filteredOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'ledger'
                  ? 'bg-[#c5a059] text-white'
                  : 'text-[#5a6b7c] hover:bg-[#dfd7c7]/50'
              }`}
            >
              Earnings Ledger ({dateFilteredEarnings.length})
            </button>
            <button
              onClick={() => setActiveTab('assets')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'assets'
                  ? 'bg-[#c5a059] text-white'
                  : 'text-[#5a6b7c] hover:bg-[#dfd7c7]/50'
              }`}
            >
              Partner Profile &amp; Assets
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'current_month' | 'prev_month' | 'ytd' | 'all')}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#dfd7c7] text-xs text-[#0c2340] focus:outline-[#c5a059] cursor-pointer"
            >
              <option value="all">Lifetime History</option>
              <option value="current_month">Current Month</option>
              <option value="prev_month">Previous Month</option>
              <option value="ytd">Year to Date (YTD)</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg border border-[#dfd7c7] bg-white hover:bg-[#fffdfb] text-xs font-semibold text-[#5a6b7c] flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Orders CSV</span>
            </button>

            <button
              onClick={handleExportEarningsCSV}
              className="px-3 py-1.5 rounded-lg border border-[#dfd7c7] bg-white hover:bg-[#fffdfb] text-xs font-semibold text-[#5a6b7c] flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
              <span>Earnings CSV</span>
            </button>
          </div>
        </div>

        {/* Tab 0: Approval-Gated Private Wholesale 10-Vial Kit Portal */}
        {activeTab === 'wholesale' && (
          <div className="p-6 sm:p-8">
            {partner.status !== 'APPROVED' ? (
              <div className="max-w-2xl mx-auto text-center py-10 space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7] text-[#c5a059] flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[32px]">lock</span>
                </div>
                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-full bg-[#0c2340] text-white text-[10px] font-bold uppercase tracking-widest">
                    Approval-Gated Wholesale Access
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#0c2340]">
                    Wholesale 10-Vial Kit Pricing Is Restricted to Approved Partners
                  </h3>
                  <p className="text-xs text-[#5a6b7c] leading-relaxed max-w-lg mx-auto">
                    Your organization (<strong>{partner.name}</strong>) currently has application status{' '}
                    <strong className="text-[#0c2340]">{partner.status}</strong>. Once an administrator reviews and approves your partner application, private 10-vial kit wholesale pricing and direct ordering will unlock here.
                  </p>
                </div>

                {partner.adminNotes && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs max-w-lg mx-auto">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block mb-1">
                      Reviewer Notes
                    </span>
                    <p className="text-[#0c2340]">{partner.adminNotes}</p>
                  </div>
                )}

                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => navigate('partners')}
                    className="px-6 py-2.5 rounded-xl bg-[#c5a059] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0c2340] transition-colors cursor-pointer"
                  >
                    View Partner Application
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dfd7c7] pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#c5a059]">
                      Approved Partner Wholesale Catalog • 10-Vial Kits Only
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-[#0c2340]">
                      Private Wholesale 10-Vial Kit Ordering
                    </h3>
                    <p className="text-xs text-[#5a6b7c]">
                      Public retail shows individual vial pricing. Approved partners order sealed 10-vial kits at wholesale tier rates.
                    </p>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold self-start">
                    ✓ APPROVED WHOLESALE TIER
                  </span>
                </div>

                {wholesaleOrderSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                    <span>
                      <strong>Wholesale Order Submitted:</strong> {wholesaleOrderSuccess}
                    </span>
                    <button
                      onClick={() => setWholesaleOrderSuccess(null)}
                      className="text-emerald-700 font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* 10-Vial Kit Product Grid */}
                  <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map((prod) => {
                      const tiers = prod.wholesaleStrengths && prod.wholesaleStrengths.length > 0
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
                              className="w-14 h-14 rounded-xl object-cover border border-[#dfd7c7] bg-[#f6f4ee] shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059]">
                                {prod.categoryLabel}
                              </span>
                              <h4 className="font-serif text-base font-bold text-[#0c2340] truncate">
                                {prod.name}
                              </h4>
                              <span className="font-mono text-[10px] text-[#5a6b7c]">
                                HPLC {prod.purity || '99.5%'}
                              </span>
                            </div>
                          </div>

                          {tiers.length > 1 && (
                            <div>
                              <label className="block text-[10px] font-semibold text-[#5a6b7c] mb-1">
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
                              <span className="text-[10px] text-[#5a6b7c] block">{activeTier.label}</span>
                              <strong className="font-serif text-lg text-[#0c2340]">${kitPrice.toFixed(2)}</strong>
                              <span className="text-[10px] text-[#c5a059] font-semibold block">
                                ${wholesalePerVial} / vial
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setWholesaleCart((prev) => {
                                  const existing = prev.find(
                                    (item) =>
                                      item.product.id === prod.id &&
                                      item.strengthLabel === activeTier.label
                                  );
                                  if (existing) {
                                    return prev.map((item) =>
                                      item.product.id === prod.id &&
                                      item.strengthLabel === activeTier.label
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
                              {inCart ? `+ Add Kit (${inCart.kitsCount})` : '+ Add 10-Vial Kit'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Wholesale Order Summary */}
                  <div className="lg:col-span-4 bg-[#f6f4ee] border border-[#dfd7c7] rounded-2xl p-5 space-y-4">
                    <h4 className="font-serif text-lg font-bold text-[#0c2340] border-b border-[#dfd7c7] pb-2">
                      Wholesale 10-Vial Kit Order
                    </h4>

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
                            <div>
                              <span className="font-semibold text-[#0c2340] block">{item.product.name}</span>
                              <span className="text-[10px] text-[#5a6b7c]">
                                {item.kitsCount} × {item.strengthLabel} (${item.kitPrice.toFixed(2)}/kit)
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
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
                                className="w-6 h-6 rounded bg-[#f6f4ee] text-[#0c2340] font-bold cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-bold text-[#0c2340] w-5 text-center">{item.kitsCount}</span>
                              <button
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
                                className="w-6 h-6 rounded bg-[#f6f4ee] text-[#0c2340] font-bold cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#5a6b7c] mb-1">
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

                        <div className="pt-2 border-t border-[#dfd7c7] space-y-1">
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
                          className="w-full py-3 rounded-xl bg-[#c5a059] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0c2340] transition-colors cursor-pointer"
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

        {/* Tab 1: Sales & Orders */}
        {activeTab === 'sales' && (
          <div>
            {monthlySummary.length > 0 && (
              <div className="p-4 sm:p-6 bg-[#fffdfb] border-b border-[#dfd7c7]">
                <h4 className="font-serif text-base font-bold text-[#0c2340] mb-3">
                  Monthly Performance Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {monthlySummary.map((m) => (
                    <div key={m.label} className="p-3 rounded-xl bg-[#f6f4ee] border border-[#dfd7c7]">
                      <div className="flex items-center justify-between font-semibold text-[#0c2340]">
                        <span>{m.label}</span>
                        <span className="text-[#c5a059]">${m.commission.toFixed(2)}</span>
                      </div>
                      <div className="text-[11px] text-[#5a6b7c] mt-1 flex justify-between">
                        <span>{m.ordersCount} orders ({m.completedCount} completed)</span>
                        <span>${m.grossSales.toFixed(0)} gross</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 border-b border-[#dfd7c7]/50 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#5a6b7c] text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search orders by ID, patient name, or formulation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs text-[#0c2340] placeholder-[#5a6b7c] focus:outline-none"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#fffdfb] text-[#0c2340] font-serif border-b border-[#dfd7c7]">
                  <tr>
                    <th className="p-4 font-bold">Date</th>
                    <th className="p-4 font-bold">Order ID</th>
                    <th className="p-4 font-bold">Customer</th>
                    <th className="p-4 font-bold">Formulations</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Revenue</th>
                    <th className="p-4 font-bold text-[#c5a059]">Partner Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dfd7c7]/40 text-[#5a6b7c]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#5a6b7c]">
                        No referred patient orders found for this period or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#fffdfb]/50 transition-colors">
                        <td className="p-4 whitespace-nowrap">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 font-mono font-semibold text-[#0c2340]">
                          {ord.orderNumber}
                        </td>
                        <td className="p-4 font-medium text-[#0c2340]">
                          {ord.customerName}
                        </td>
                        <td className="p-4">
                          <span className="line-clamp-1">
                            {ord.items.map((i) => `${i.productName} (${i.selectedStrength.label}) × ${i.quantity}`).join(', ')}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ord.status === 'COMPLETED'
                              ? 'bg-[#dfd7c7] text-[#c5a059]'
                              : ord.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-[#0c2340]">
                          ${ord.subtotal.toFixed(2)}
                        </td>
                        <td className="p-4 font-bold text-[#c5a059]">
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

        {/* Tab 2: Earnings Ledger */}
        {activeTab === 'ledger' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#fffdfb] text-[#0c2340] font-serif border-b border-[#dfd7c7]">
                <tr>
                  <th className="p-4 font-bold">Ledger Date</th>
                  <th className="p-4 font-bold">Order Ref</th>
                  <th className="p-4 font-bold">Customer</th>
                  <th className="p-4 font-bold">Gross Order</th>
                  <th className="p-4 font-bold">Commission Rate</th>
                  <th className="p-4 font-bold">Earning Amount</th>
                  <th className="p-4 font-bold">Payout Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dfd7c7]/40 text-[#5a6b7c]">
                {dateFilteredEarnings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#5a6b7c]">
                      No audit ledger records found for the selected period.
                    </td>
                  </tr>
                ) : (
                  dateFilteredEarnings.map((e) => (
                    <tr key={e.id} className="hover:bg-[#fffdfb]/50">
                      <td className="p-4">{new Date(e.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 font-mono font-semibold text-[#0c2340]">{e.orderNumber}</td>
                      <td className="p-4">{e.customerName}</td>
                      <td className="p-4">${e.grossSales.toFixed(2)}</td>
                      <td className="p-4">{(e.commissionRate * 100).toFixed(0)}%</td>
                      <td className="p-4 font-bold text-[#c5a059]">${e.earningAmount.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          e.status === 'PAID'
                            ? 'bg-[#dfd7c7] text-[#c5a059]'
                            : e.status === 'APPROVED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Partner Profile & Assets */}
        {activeTab === 'assets' && (
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
            <form onSubmit={handleSavePartnerProfile} className="lg:col-span-7 space-y-5">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#0c2340]">
                  Practice Profile, Branding &amp; Curated Categories
                </h3>
                <p className="text-[#5a6b7c] mt-0.5">
                  Customize your co-branded storefront logo, contact info, and featured peptide categories.
                </p>
              </div>

              {profileSaveMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>{profileSaveMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{profileErrorMsg}</span>
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
                      className="w-16 h-16 rounded-2xl object-contain bg-white border border-[#dfd7c7] p-1 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-white border border-[#dfd7c7] flex items-center justify-center text-[#c5a059] shrink-0">
                      <span className="material-symbols-outlined text-[28px]">storefront</span>
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

              {/* Featured Wellness Categories */}
              <div className="space-y-2">
                <label className="block text-[#0c2340] font-semibold">
                  Partner-Specific Wellness Categories (Displayed on Your Storefront)
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
                className="px-6 py-2.5 rounded-xl bg-[#c5a059] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0c2340] transition-colors cursor-pointer disabled:opacity-50"
              >
                {savingProfile ? 'Saving Profile...' : 'Save Partner Profile & Branding'}
              </button>
            </form>

            {/* Right Column: Commercial Terms & Printable QR Collateral */}
            <div className="lg:col-span-5 space-y-5">
              <div className="p-5 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7] space-y-3">
                <h4 className="font-serif text-base font-bold text-[#0c2340]">
                  Attribution &amp; Commercial Terms
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[#5a6b7c] block">Partner ID</span>
                    <span className="font-mono font-semibold text-[#c5a059]">{partner.partnerId}</span>
                  </div>
                  <div>
                    <span className="text-[#5a6b7c] block">Account Email</span>
                    <span className="font-semibold text-[#0c2340] break-all">{partner.email}</span>
                  </div>
                  <div>
                    <span className="text-[#5a6b7c] block">Commission Share</span>
                    <span className="font-semibold text-[#0c2340]">
                      {(partner.commissionRate * 100).toFixed(0)}% Revenue Share
                    </span>
                  </div>
                  <div>
                    <span className="text-[#5a6b7c] block">Member VIP Discount</span>
                    <span className="font-semibold text-[#0c2340]">
                      {(partner.memberDiscountRate * 100).toFixed(0)}% Discount
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#dfd7c7] space-y-4 text-center">
                <h4 className="font-serif text-base font-bold text-[#0c2340]">
                  Patient Clinic Display QR Code
                </h4>
                <p className="text-[#5a6b7c]">
                  Print or embed this QR code at reception so clients scan straight into your co-branded storefront with VIP perks active.
                </p>
                {qrCodeUrl && (
                  <div className="inline-block p-3 rounded-2xl bg-[#fffdfb] border border-[#dfd7c7]">
                    <img
                      src={qrCodeUrl}
                      alt={`${partner.name} QR Code`}
                      className="w-44 h-44 mx-auto"
                    />
                  </div>
                )}
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={copyReferralLink}
                    className="px-4 py-2 rounded-xl bg-[#c5a059] text-white text-xs font-semibold cursor-pointer hover:bg-[#0c2340]"
                  >
                    {copiedLink ? 'Copied Referral URL' : 'Copy Referral URL'}
                  </button>
                  {qrCodeUrl && (
                    <a
                      href={qrCodeUrl}
                      download={`${partner.slug}-qr.png`}
                      className="px-4 py-2 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors"
                    >
                      Download QR PNG
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
