import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService.ts';
import { Partner, Order, Product, WellnessProgram, EducationalArticle, FAQ, Testimonial, PartnerEarning, PartnerStatus, OrderStatus } from '../types/index.ts';

interface AdminDashboardViewProps {
  navigate: (path: string, param?: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'partners' | 'orders' | 'payouts' | 'products' | 'content'>('overview');
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

  // Search & Filters
  const [searchPartner, setSearchPartner] = useState('');
  const [searchOrder, setSearchOrder] = useState('');
  const [newProductModal, setNewProductModal] = useState(false);

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<'metabolic' | 'cellular' | 'recovery' | 'longevity' | 'stacks'>('metabolic');
  const [newProdPrice, setNewProdPrice] = useState(250);
  const [newProdPurity, setNewProdPurity] = useState('99.5%');
  const [newProdStock, setNewProdStock] = useState(50);
  const [newProdShortDesc, setNewProdShortDesc] = useState('');

  const reloadData = async () => {
    try {
      const [pts, ords, erngs, prods, progs, arts, fqs, tests] = await Promise.all([
        dbService.getPartners(),
        dbService.getOrders(),
        dbService.getPartnerEarnings(),
        dbService.getProducts(),
        dbService.getPrograms(),
        dbService.getArticles(),
        dbService.getFaqs(),
        dbService.getTestimonials()
      ]);
      setPartners(pts);
      setOrders(ords);
      setEarnings(erngs);
      setProducts(prods);
      setPrograms(progs);
      setArticles(arts);
      setFaqs(fqs);
      setTestimonials(tests);
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
  const handleUpdatePartnerStatus = async (partnerId: string, status: PartnerStatus) => {
    await dbService.updatePartnerStatus(partnerId, status);
    await reloadData();
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

  // Create Product handler
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = newProdName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const categoryLabels: Record<string, string> = {
      metabolic: 'Metabolic Support',
      cellular: 'Cellular Optimization',
      recovery: 'Tissue Recovery',
      longevity: 'Longevity & Vitality',
      stacks: 'Synergy Multi-Kits'
    };

    const newProd: Omit<Product, 'id'> = {
      name: newProdName,
      slug,
      sku: `WH-${slug.slice(0, 4).toUpperCase()}-2026`,
      category: newProdCategory,
      categoryLabel: categoryLabels[newProdCategory] || 'Peptide',
      shortDescription: newProdShortDesc,
      description: newProdShortDesc,
      price: Number(newProdPrice),
      stockQuantity: Number(newProdStock),
      status: 'ACTIVE',
      featured: false,
      purity: newProdPurity,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      strengths: [
        { label: '5mg (10 Vials)', vialsCount: 10, price: Number(newProdPrice) },
        { label: '10mg (10 Vials)', vialsCount: 10, price: Number(newProdPrice) * 1.75 }
      ],
      createdAt: new Date().toISOString()
    };

    await dbService.createProduct(newProd);
    setNewProductModal(false);
    setNewProdName('');
    setNewProdShortDesc('');
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
            onClick={() => setNewProductModal(true)}
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
            <div className="p-4 border-b border-[#dfd7c7]/50 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#5a6b7c] text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search partners by name, ID, or contact email..."
                value={searchPartner}
                onChange={(e) => setSearchPartner(e.target.value)}
                className="w-full text-xs text-[#0c2340] placeholder-[#5a6b7c] focus:outline-none"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#fffdfb] text-[#0c2340] font-serif border-b border-[#dfd7c7]">
                  <tr>
                    <th className="p-4 font-bold">Partner ID</th>
                    <th className="p-4 font-bold">Practice Name</th>
                    <th className="p-4 font-bold">Contact Person</th>
                    <th className="p-4 font-bold">Category</th>
                    <th className="p-4 font-bold">Commission</th>
                    <th className="p-4 font-bold">VIP Discount</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dfd7c7]/40 text-[#5a6b7c]">
                  {partners
                    .filter((p) => p.name.toLowerCase().includes(searchPartner.toLowerCase()) || p.partnerId.toLowerCase().includes(searchPartner.toLowerCase()))
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-[#fffdfb]/50 transition-colors">
                        <td className="p-4 font-mono font-bold text-[#c5a059]">{p.partnerId}</td>
                        <td className="p-4 font-medium text-[#0c2340]">
                          <div>{p.name}</div>
                          <button
                            onClick={() => navigate('partner-page', p.slug)}
                            className="text-[10px] text-[#c5a059] hover:underline"
                          >
                            /partner/{p.slug}
                          </button>
                        </td>
                        <td className="p-4">{p.contactPerson} ({p.email})</td>
                        <td className="p-4">{p.category}</td>
                        <td className="p-4 font-semibold text-[#0c2340]">{(p.commissionRate * 100).toFixed(0)}%</td>
                        <td className="p-4 font-semibold text-[#0c2340]">{(p.memberDiscountRate * 100).toFixed(0)}%</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'APPROVED'
                              ? 'bg-[#dfd7c7] text-[#c5a059]'
                              : p.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {p.status !== 'APPROVED' && (
                              <button
                                onClick={() => handleUpdatePartnerStatus(p.id, 'APPROVED')}
                                className="px-2.5 py-1 rounded bg-[#c5a059] text-white text-[10px] font-semibold hover:bg-[#0c2340] cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                            {p.status !== 'SUSPENDED' && (
                              <button
                                onClick={() => handleUpdatePartnerStatus(p.id, 'SUSPENDED')}
                                className="px-2.5 py-1 rounded border border-[#dfd7c7] text-[#5a6b7c] text-[10px] font-semibold hover:bg-[#f6f4ee] cursor-pointer"
                              >
                                Suspend
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
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
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#fffdfb] text-[#0c2340] font-serif border-b border-[#dfd7c7]">
                <tr>
                  <th className="p-4 font-bold">SKU</th>
                  <th className="p-4 font-bold">Formulation Name</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Base Price</th>
                  <th className="p-4 font-bold">Purity</th>
                  <th className="p-4 font-bold">Stock</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dfd7c7]/40 text-[#5a6b7c]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#fffdfb]/50">
                    <td className="p-4 font-mono text-[#5a6b7c]">{p.sku}</td>
                    <td className="p-4 font-semibold text-[#0c2340]">{p.name}</td>
                    <td className="p-4">{p.categoryLabel}</td>
                    <td className="p-4 font-bold text-[#0c2340]">${p.price.toFixed(2)}</td>
                    <td className="p-4 font-semibold text-[#c5a059]">{p.purity || '99.4%'}</td>
                    <td className="p-4">{p.stockQuantity} kits</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#dfd7c7] text-[#c5a059]">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      </div>

      {/* New Formulation Modal */}
      {newProductModal && (
        <div className="fixed inset-0 z-50 bg-[#0c2340]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fffdfb] w-full max-w-lg rounded-3xl border border-[#dfd7c7] shadow-2xl p-6 sm:p-8 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-[#dfd7c7] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#0c2340]">
                Add Clinical Formulation
              </h3>
              <button onClick={() => setNewProductModal(false)} className="text-[#5a6b7c] cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-[#5a6b7c] font-medium mb-1">Formulation Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Epithalon Telomeric Activator"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
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
                  <label className="block text-[#5a6b7c] font-medium mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">HPLC Purity</label>
                  <input
                    type="text"
                    required
                    value={newProdPurity}
                    onChange={(e) => setNewProdPurity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#5a6b7c] font-medium mb-1">Short Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Clinical mechanism and indication..."
                  value={newProdShortDesc}
                  onChange={(e) => setNewProdShortDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#c5a059] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0c2340] cursor-pointer"
              >
                Save Formulation to Database
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
