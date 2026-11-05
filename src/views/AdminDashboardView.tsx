import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService.ts';
import {
  Partner,
  Order,
  Product,
  ProductStatus,
  WellnessProgram,
  EducationalArticle,
  FAQ,
  Testimonial,
  PartnerEarning,
  PartnerStatus,
  OrderStatus,
  AuditLogEntry
} from '../types/index.ts';

interface AdminDashboardViewProps {
  navigate: (path: string, param?: string) => void;
}

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

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'partners' | 'orders' | 'payouts' | 'products' | 'content' | 'audit'>('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [partners, setPartners] = useState<Partner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [earnings, setEarnings] = useState<PartnerEarning[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [programs, setPrograms] = useState<WellnessProgram[]>([]);
  const [articles, setArticles] = useState<EducationalArticle[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Search & Filters
  const [searchPartner, setSearchPartner] = useState('');
  const [partnerStatusFilter, setPartnerStatusFilter] = useState<string>('ALL');
  const [searchOrder, setSearchOrder] = useState('');

  // Partner Review Modal State
  const [reviewingPartner, setReviewingPartner] = useState<Partner | null>(null);
  const [partnerAdminNotes, setPartnerAdminNotes] = useState('');
  const [savingPartnerReview, setSavingPartnerReview] = useState(false);

  // Add / Edit Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodCategory, setProdCategory] = useState<'metabolic' | 'cellular' | 'recovery' | 'longevity' | 'stacks'>('metabolic');
  const [prodStatus, setProdStatus] = useState<ProductStatus>('ACTIVE');
  const [prodPrice, setProdPrice] = useState(250);
  const [prodWholesalePrice, setProdWholesalePrice] = useState(175);
  const [prodPurity, setProdPurity] = useState('99.5%');
  const [prodStock, setProdStock] = useState(50);
  const [prodLotNumber, setProdLotNumber] = useState('2026-A');
  const [prodImageUrl, setProdImageUrl] = useState('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80');
  const [prodShortDesc, setProdShortDesc] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodDisclosures, setProdDisclosures] = useState('');
  const [prodEducationalMaterial, setProdEducationalMaterial] = useState('');

  const reloadData = async () => {
    try {
      const [pts, ords, erngs, prods, progs, arts, fqs, tests, logs] = await Promise.all([
        dbService.getPartners(),
        dbService.getOrders(),
        dbService.getPartnerEarnings(),
        dbService.getProducts(),
        dbService.getPrograms(),
        dbService.getArticles(),
        dbService.getFaqs(),
        dbService.getTestimonials(),
        dbService.getAuditLogs()
      ]);
      setPartners(pts);
      setOrders(ords);
      setEarnings(erngs);
      setProducts(prods);
      setPrograms(progs);
      setArticles(arts);
      setFaqs(fqs);
      setTestimonials(tests);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  // KPIs
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING' || o.status === 'PROCESSING' || o.status === 'CONFIRMED').length;
  const activePartnersCount = partners.filter((p) => p.status === 'APPROVED').length;
  const totalPartnerEarnings = earnings.reduce((acc, e) => acc + e.earningAmount, 0);

  // Partner status updater
  const handleUpdatePartnerStatus = async (partnerId: string, status: PartnerStatus, notes?: string) => {
    setSavingPartnerReview(true);
    try {
      await dbService.updatePartnerStatus(partnerId, status, notes, 'SUPER_ADMIN');
      await reloadData();
      if (reviewingPartner && reviewingPartner.id === partnerId) {
        setReviewingPartner((prev) => (prev ? { ...prev, status, adminNotes: notes ?? prev.adminNotes } : null));
      }
    } finally {
      setSavingPartnerReview(false);
    }
  };

  const openPartnerReviewModal = (partner: Partner) => {
    setReviewingPartner(partner);
    setPartnerAdminNotes(partner.adminNotes || '');
  };

  // Order status updater
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await dbService.updateOrderStatus(orderId, status);
    await reloadData();
  };

  // Earnings payout updater
  const handleUpdateEarningStatus = async (earningId: string, status: 'PENDING' | 'APPROVED' | 'PAID') => {
    await dbService.updatePartnerEarningStatus(earningId, status);
    await reloadData();
  };

  // Open Product Modal for Create or Edit
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
    setProdImageUrl('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80');
    setProdShortDesc('');
    setProdDescription('');
    setProdDisclosures('For research and educational wellness use. Store lyophilized vials at 2°C–8°C protected from light.');
    setProdEducationalMaterial('');
    setProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
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
  };

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

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const numericPrice = Number(prodPrice);
    const numericWholesale = Number(prodWholesalePrice);

    if (editingProduct) {
      const updatedStrengths = editingProduct.strengths?.length
        ? editingProduct.strengths.map((s, idx) =>
            idx === 0 ? { ...s, price: numericPrice } : s
          )
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

  if (loading) {
    return (
      <div className="py-24 text-center text-[#5a6b7c] space-y-3">
        <span className="w-8 h-8 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin inline-block"></span>
        <p className="text-xs">Initializing Clinical Operations Center...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-[#dfd7c7] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-widest text-[#c5a059]">
              Clinical Operations &amp; Administration
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0c2340] text-[#fffdfb]">
              SUPER ADMIN
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#0c2340] font-bold">
            Executive Control Center
          </h1>
          <p className="text-xs text-[#5a6b7c] mt-1">
            Live database records, cold-chain fulfillment, partner commissions, and content CMS.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={openCreateProductModal}
            className="px-4 py-2.5 rounded-xl bg-[#c5a059] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0c2340] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>New Formulation</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-[#dfd7c7] p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#5a6b7c] block">Gross Revenue</span>
          <span className="font-serif text-2xl font-bold text-[#0c2340] block mt-1">${totalRevenue.toFixed(0)}</span>
          <span className="text-[10px] text-[#c5a059]">Real-time orders</span>
        </div>
        <div className="bg-white border border-[#dfd7c7] p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#5a6b7c] block">Total Orders</span>
          <span className="font-serif text-2xl font-bold text-[#0c2340] block mt-1">{totalOrdersCount}</span>
          <span className="text-[10px] text-[#5a6b7c]">All channels</span>
        </div>
        <div className="bg-white border border-[#dfd7c7] p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#5a6b7c] block">Active Partners</span>
          <span className="font-serif text-2xl font-bold text-[#c5a059] block mt-1">{activePartnersCount}</span>
          <span className="text-[10px] text-[#5a6b7c]">Approved clinics</span>
        </div>
        <div className="bg-white border border-[#dfd7c7] p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#5a6b7c] block">Pending Orders</span>
          <span className="font-serif text-2xl font-bold text-[#c5a059] block mt-1">{pendingOrdersCount}</span>
          <span className="text-[10px] text-[#5a6b7c]">Fulfillment queue</span>
        </div>
        <div className="bg-white border border-[#dfd7c7] p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#5a6b7c] block">Partner Payouts</span>
          <span className="font-serif text-2xl font-bold text-[#c5a059] block mt-1">${totalPartnerEarnings.toFixed(2)}</span>
          <span className="text-[10px] text-[#5a6b7c]">Audit ledger</span>
        </div>
        <div className="bg-[#c5a059] text-white p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#dfd7c7] block">Active Formulations</span>
          <span className="font-serif text-2xl font-bold block mt-1">{products.length}</span>
          <span className="text-[10px] text-[#dfd7c7]">In cGMP stock</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border border-[#dfd7c7] rounded-3xl bg-white overflow-hidden shadow-xs">
        
        {/* Navigation Bar */}
        <div className="p-4 bg-[#f6f4ee] border-b border-[#dfd7c7] flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-[#c5a059] text-white' : 'text-[#5a6b7c] hover:bg-[#dfd7c7]/50'
            }`}
          >
            Analytics Overview
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'partners' ? 'bg-[#c5a059] text-white' : 'text-[#5a6b7c] hover:bg-[#dfd7c7]/50'
            }`}
          >
            Partner Management ({partners.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'orders' ? 'bg-[#c5a059] text-white' : 'text-[#5a6b7c] hover:bg-[#dfd7c7]/50'
            }`}
          >
            Order Fulfillment ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'payouts' ? 'bg-[#c5a059] text-white' : 'text-[#5a6b7c] hover:bg-[#dfd7c7]/50'
            }`}
          >
            Commission Ledger ({earnings.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'products' ? 'bg-[#c5a059] text-white' : 'text-[#5a6b7c] hover:bg-[#dfd7c7]/50'
            }`}
          >
            Product Catalog ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'content' ? 'bg-[#c5a059] text-white' : 'text-[#5a6b7c] hover:bg-[#dfd7c7]/50'
            }`}
          >
            CMS &amp; Education
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'audit' ? 'bg-[#c5a059] text-white' : 'text-[#5a6b7c] hover:bg-[#dfd7c7]/50'
            }`}
          >
            Audit Logs ({auditLogs.length})
          </button>
        </div>

        {/* Tab 1: Overview Analytics */}
        {activeTab === 'overview' && (
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Partner Leaderboard */}
              <div className="border border-[#dfd7c7] rounded-2xl p-6 bg-[#fffdfb]/50 space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#0c2340] flex items-center justify-between">
                  <span>Top Performing Partner Clinics</span>
                  <span className="text-xs text-[#5a6b7c] font-normal">Referred Revenue</span>
                </h3>
                <div className="space-y-3 text-xs">
                  {partners.map((pt) => {
                    const ptOrders = orders.filter((o) => o.partnerId === pt.id || o.partnerSlug === pt.slug);
                    const ptRev = ptOrders.reduce((acc, o) => acc + o.subtotal, 0);
                    return (
                      <div key={pt.id} className="p-3 rounded-xl bg-white border border-[#dfd7c7] flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-sm text-[#0c2340] block">{pt.name}</span>
                          <span className="text-[#5a6b7c]">{pt.category} • {ptOrders.length} Orders</span>
                        </div>
                        <div className="text-right">
                          <span className="font-serif font-bold text-sm text-[#c5a059] block">${ptRev.toFixed(2)}</span>
                          <span className="text-[10px] text-[#5a6b7c]">{(pt.commissionRate * 100).toFixed(0)}% Commission</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Product Performance */}
              <div className="border border-[#dfd7c7] rounded-2xl p-6 bg-[#fffdfb]/50 space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#0c2340] flex items-center justify-between">
                  <span>Formulation Stock &amp; Velocity</span>
                  <span className="text-xs text-[#5a6b7c] font-normal">Purity &amp; Inventory</span>
                </h3>
                <div className="space-y-3 text-xs">
                  {products.slice(0, 5).map((p) => (
                    <div key={p.id} className="p-3 rounded-xl bg-white border border-[#dfd7c7] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-[#f6f4ee]" />
                        <div>
                          <span className="font-semibold text-xs text-[#0c2340] block">{p.name}</span>
                          <span className="text-[11px] text-[#5a6b7c]">{p.categoryLabel}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-xs text-[#0c2340] block">{p.stockQuantity} in stock</span>
                        <span className="text-[10px] text-[#c5a059] font-bold">{p.purity || '99.4%'} HPLC</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Partner Management */}
        {activeTab === 'partners' && (
          <div>
            <div className="p-4 border-b border-[#dfd7c7]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <span className="material-symbols-outlined text-[#5a6b7c] text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Search partners by name, ID, location, or contact email..."
                  value={searchPartner}
                  onChange={(e) => setSearchPartner(e.target.value)}
                  className="w-full text-xs text-[#0c2340] placeholder-[#5a6b7c] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(['ALL', 'NEW', 'UNDER REVIEW', 'APPROVED', 'NEEDS INFORMATION', 'DECLINED', 'SUSPENDED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setPartnerStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap transition-colors ${
                      partnerStatusFilter === st
                        ? 'bg-[#0c2340] text-white'
                        : 'bg-[#f6f4ee] text-[#5a6b7c] hover:bg-[#dfd7c7]/60'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#fffdfb] text-[#0c2340] font-serif border-b border-[#dfd7c7]">
                  <tr>
                    <th className="p-4 font-bold">Partner ID</th>
                    <th className="p-4 font-bold">Business / Organization</th>
                    <th className="p-4 font-bold">Owner / Contact</th>
                    <th className="p-4 font-bold">Type &amp; Location</th>
                    <th className="p-4 font-bold">Member Base</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Review &amp; Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dfd7c7]/40 text-[#5a6b7c]">
                  {partners
                    .filter((p) => {
                      const matchesFilter = partnerStatusFilter === 'ALL' || p.status === partnerStatusFilter;
                      const q = searchPartner.toLowerCase();
                      const matchesSearch =
                        !q ||
                        p.name.toLowerCase().includes(q) ||
                        p.partnerId.toLowerCase().includes(q) ||
                        p.email.toLowerCase().includes(q) ||
                        (p.location || '').toLowerCase().includes(q);
                      return matchesFilter && matchesSearch;
                    })
                    .map((p) => {
                      const statusBadgeClass =
                        p.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'NEW'
                          ? 'bg-blue-100 text-blue-800'
                          : p.status === 'UNDER REVIEW' || p.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : p.status === 'NEEDS INFORMATION'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-700';

                      return (
                        <tr key={p.id} className="hover:bg-[#fffdfb]/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-[#c5a059]">{p.partnerId}</td>
                          <td className="p-4 font-medium text-[#0c2340]">
                            <div>{p.name}</div>
                            <button
                              onClick={() => navigate('partner-page', p.slug)}
                              className="text-[10px] text-[#c5a059] hover:underline cursor-pointer"
                            >
                              /partner/{p.slug}
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
                          <td className="p-4">{p.memberBaseSize || '—'}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${statusBadgeClass}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openPartnerReviewModal(p)}
                                className="px-2.5 py-1 rounded bg-[#0c2340] text-white text-[10px] font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer"
                              >
                                Review Application
                              </button>
                              <select
                                value={p.status}
                                onChange={(e) => handleUpdatePartnerStatus(p.id, e.target.value as PartnerStatus, p.adminNotes)}
                                className="px-2 py-1 rounded bg-white border border-[#dfd7c7] text-[10px] font-semibold text-[#0c2340] cursor-pointer"
                                aria-label={`Change status for ${p.name}`}
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
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Order Fulfillment */}
        {activeTab === 'orders' && (
          <div>
            <div className="p-4 border-b border-[#dfd7c7]/50 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#5a6b7c] text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search orders by number, customer, or tracking number..."
                value={searchOrder}
                onChange={(e) => setSearchOrder(e.target.value)}
                className="w-full text-xs text-[#0c2340] placeholder-[#5a6b7c] focus:outline-none"
              />
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
                    <th className="p-4 font-bold">Cold-Chain Status</th>
                    <th className="p-4 font-bold">Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dfd7c7]/40 text-[#5a6b7c]">
                  {orders
                    .filter((o) => o.orderNumber.toLowerCase().includes(searchOrder.toLowerCase()) || o.customerName.toLowerCase().includes(searchOrder.toLowerCase()))
                    .map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#fffdfb]/50">
                        <td className="p-4 font-mono font-bold text-[#0c2340]">{ord.orderNumber}</td>
                        <td className="p-4">{new Date(ord.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 font-medium text-[#0c2340]">{ord.customerName}</td>
                        <td className="p-4">
                          {ord.partnerName ? (
                            <span className="text-[#c5a059] font-semibold">{ord.partnerName} (${(ord.partnerCommission || 0).toFixed(2)})</span>
                          ) : (
                            <span className="text-[#5a6b7c]">Direct Patient</span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-[#0c2340]">${ord.total.toFixed(2)}</td>
                        <td className="p-4 font-mono text-[11px] text-[#c5a059]">{ord.trackingNumber || 'WH-EXP-CC-8291'}</td>
                        <td className="p-4">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                            className="px-2 py-1 rounded bg-white border border-[#dfd7c7] text-xs font-semibold cursor-pointer"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Partner Payouts */}
        {activeTab === 'payouts' && (
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
                  <th className="p-4 font-bold text-right">Payout Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dfd7c7]/40 text-[#5a6b7c]">
                {earnings.map((e) => (
                  <tr key={e.id} className="hover:bg-[#fffdfb]/50">
                    <td className="p-4 font-mono text-[#5a6b7c]">{e.id.slice(0, 8)}</td>
                    <td className="p-4 font-mono font-semibold text-[#0c2340]">{e.orderNumber}</td>
                    <td className="p-4">{e.customerName}</td>
                    <td className="p-4">${e.grossSales.toFixed(2)}</td>
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
                    <td className="p-4 text-right space-x-1.5">
                      {e.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateEarningStatus(e.id, 'APPROVED')}
                          className="px-2.5 py-1 rounded bg-[#c5a059] text-white text-[10px] font-semibold cursor-pointer"
                        >
                          Approve Commission
                        </button>
                      )}
                      {e.status === 'APPROVED' && (
                        <button
                          onClick={() => handleUpdateEarningStatus(e.id, 'PAID')}
                          className="px-2.5 py-1 rounded bg-[#c5a059] text-white text-[10px] font-semibold cursor-pointer"
                        >
                          Disburse &amp; Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Product Catalog CMS */}
        {activeTab === 'products' && (
          <div>
            <div className="p-4 border-b border-[#dfd7c7]/50 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-[#0c2340]">
                  Full Product Catalog Management
                </h3>
                <p className="text-[11px] text-[#5a6b7c]">
                  Edit formulations, adjust retail &amp; wholesale pricing, upload images, update disclosures, or disable/mark unavailable.
                </p>
              </div>
              <button
                onClick={openCreateProductModal}
                className="px-3.5 py-2 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Product</span>
              </button>
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
                  {products.map((p) => {
                    const statusClass =
                      p.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'UNAVAILABLE' || p.status === 'OUT_OF_STOCK'
                        ? 'bg-amber-100 text-amber-800'
                        : p.status === 'DISABLED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-[#dfd7c7] text-[#0c2340]';

                    return (
                      <tr key={p.id} className="hover:bg-[#fffdfb]/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover bg-[#f6f4ee] border border-[#dfd7c7]"
                            />
                            <div>
                              <span className="font-semibold text-[#0c2340] block">{p.name}</span>
                              <span className="font-mono text-[10px] text-[#5a6b7c]">{p.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">{p.categoryLabel}</td>
                        <td className="p-4">
                          <span className="font-bold text-[#0c2340]">${p.price.toFixed(2)}</span>
                          <span className="block text-[10px] text-[#c5a059]">
                            Wholesale: ${(p.wholesalePrice ?? Math.round(p.price * 0.7)).toFixed(2)}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-[#c5a059]">{p.purity || '99.4%'}</td>
                        <td className="p-4">{p.stockQuantity} kits</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusClass}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditProductModal(p)}
                              className="px-2.5 py-1 rounded bg-[#0c2340] text-white text-[10px] font-semibold hover:bg-[#c5a059] cursor-pointer"
                            >
                              Edit
                            </button>
                            {p.status !== 'UNAVAILABLE' ? (
                              <button
                                onClick={() => handleQuickProductStatus(p, 'UNAVAILABLE')}
                                className="px-2.5 py-1 rounded border border-amber-300 text-amber-800 bg-amber-50 text-[10px] font-semibold hover:bg-amber-100 cursor-pointer"
                              >
                                Mark Unavailable
                              </button>
                            ) : (
                              <button
                                onClick={() => handleQuickProductStatus(p, 'ACTIVE')}
                                className="px-2.5 py-1 rounded border border-emerald-300 text-emerald-800 bg-emerald-50 text-[10px] font-semibold hover:bg-emerald-100 cursor-pointer"
                              >
                                Mark Active
                              </button>
                            )}
                            {p.status !== 'DISABLED' ? (
                              <button
                                onClick={() => handleQuickProductStatus(p, 'DISABLED')}
                                className="px-2.5 py-1 rounded border border-red-200 text-red-700 bg-red-50 text-[10px] font-semibold hover:bg-red-100 cursor-pointer"
                              >
                                Disable
                              </button>
                            ) : (
                              <button
                                onClick={() => handleQuickProductStatus(p, 'ACTIVE')}
                                className="px-2.5 py-1 rounded border border-emerald-300 text-emerald-800 bg-emerald-50 text-[10px] font-semibold hover:bg-emerald-100 cursor-pointer"
                              >
                                Enable
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: CMS & Content */}
        {activeTab === 'content' && (
          <div className="p-6 space-y-6 text-xs">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#0c2340] mb-3">
                Wellness Programs CMS ({programs.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {programs.map((pr) => (
                  <div key={pr.id} className="p-4 rounded-2xl border border-[#dfd7c7] bg-[#fffdfb]">
                    <div className="flex justify-between font-semibold text-sm text-[#0c2340]">
                      <span>{pr.name}</span>
                      <span>${pr.priceMonthly}/mo</span>
                    </div>
                    <p className="text-[11px] text-[#5a6b7c] mt-1">{pr.shortDescription}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#dfd7c7]/60">
              <h3 className="font-serif text-lg font-bold text-[#0c2340] mb-3">
                Educational Articles ({articles.length})
              </h3>
              <div className="space-y-2">
                {articles.map((art) => (
                  <div key={art.id} className="p-3 rounded-xl border border-[#dfd7c7] flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-xs text-[#0c2340] block">{art.title}</span>
                      <span className="text-[11px] text-[#5a6b7c]">{art.category} • {art.readTime}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#c5a059]/10 text-[#c5a059] text-[10px] font-semibold">
                      {art.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Audit Logs */}
        {activeTab === 'audit' && (
          <div>
            <div className="p-4 border-b border-[#dfd7c7]/50">
              <h3 className="font-serif text-base font-bold text-[#0c2340]">
                Administrative Audit Trail
              </h3>
              <p className="text-[11px] text-[#5a6b7c]">
                Immutable log of partner application reviews, status transitions, and product catalog modifications.
              </p>
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
                      <tr key={log.id} className="hover:bg-[#fffdfb]/50">
                        <td className="p-4 font-mono text-[11px]">
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
        )}

      </div>

      {/* Partner Application Review Modal */}
      {reviewingPartner && (
        <div className="fixed inset-0 z-50 bg-[#0c2340]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#fffdfb] w-full max-w-2xl rounded-3xl border border-[#dfd7c7] shadow-2xl p-6 sm:p-8 space-y-5 text-xs my-8">
            <div className="flex justify-between items-start border-b border-[#dfd7c7] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#c5a059]">
                  Partner Application Review • {reviewingPartner.partnerId}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#0c2340] mt-0.5">
                  {reviewingPartner.name}
                </h3>
                <p className="text-[11px] text-[#5a6b7c]">
                  Submitted {new Date(reviewingPartner.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setReviewingPartner(null)}
                className="text-[#5a6b7c] hover:text-[#0c2340] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#f6f4ee] p-4 rounded-2xl border border-[#dfd7c7]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5a6b7c] block">Owner / Contact</span>
                <span className="font-semibold text-[#0c2340]">{reviewingPartner.contactPerson}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5a6b7c] block">Email &amp; Phone</span>
                <span className="font-semibold text-[#0c2340]">{reviewingPartner.email} • {reviewingPartner.phone}</span>
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
              <div className="sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-[#5a6b7c] block">Population Served</span>
                <span className="text-[#0c2340]">{reviewingPartner.populationServed || '—'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5a6b7c] block">Current Wellness Services</span>
                <p className="p-2.5 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] mt-1">
                  {reviewingPartner.currentWellnessServices || reviewingPartner.description || '—'}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5a6b7c] block">Why They Want to Partner</span>
                <p className="p-2.5 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] mt-1">
                  {reviewingPartner.whyPartner || '—'}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5a6b7c] block">Marketing Strategy</span>
                  <p className="p-2.5 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] mt-1">
                    {reviewingPartner.marketingStrategy || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5a6b7c] block">Promotion Plan</span>
                  <p className="p-2.5 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] mt-1">
                    {reviewingPartner.promotionPlan || '—'}
                  </p>
                </div>
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
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
              />
            </div>

            <div className="pt-2 border-t border-[#dfd7c7] space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#5a6b7c] block">
                Set Application Status (Current: <strong className="text-[#0c2340]">{reviewingPartner.status}</strong>)
              </span>
              <div className="flex flex-wrap gap-2">
                {PARTNER_STATUS_OPTIONS.map((st) => (
                  <button
                    key={st}
                    disabled={savingPartnerReview}
                    onClick={() => handleUpdatePartnerStatus(reviewingPartner.id, st, partnerAdminNotes)}
                    className={`px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                      reviewingPartner.status === st
                        ? 'bg-[#c5a059] text-white'
                        : 'bg-[#f6f4ee] text-[#0c2340] hover:bg-[#0c2340] hover:text-white'
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

      {/* Add / Edit Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0c2340]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#fffdfb] w-full max-w-2xl rounded-3xl border border-[#dfd7c7] shadow-2xl p-6 sm:p-8 space-y-4 text-xs my-8">
            <div className="flex justify-between items-center border-b border-[#dfd7c7] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#0c2340]">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add Clinical Formulation'}
              </h3>
              <button
                onClick={() => {
                  setProductModalOpen(false);
                  setEditingProduct(null);
                }}
                className="text-[#5a6b7c] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
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
                    onChange={(e) => setProdCategory(e.target.value as any)}
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

              {/* Product Image Upload & URL */}
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
                      placeholder="Or paste image URL..."
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
                    placeholder="Regulatory disclosures, storage temperature, handling..."
                    value={prodDisclosures}
                    onChange={(e) => setProdDisclosures(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">Educational Material</label>
                  <textarea
                    rows={2}
                    placeholder="Educational notes, protocol context, or resource links..."
                    value={prodEducationalMaterial}
                    onChange={(e) => setProdEducationalMaterial(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#c5a059] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0c2340] cursor-pointer"
              >
                {editingProduct ? 'Save Product Changes' : 'Save Formulation to Database'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
