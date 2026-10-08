import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService.ts';
import { Partner, Order, PartnerEarning } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface PartnerDashboardViewProps {
  navigate: (path: string, param?: string) => void;
}

export const PartnerDashboardView: React.FC<PartnerDashboardViewProps> = ({ navigate }) => {
  const { currentUser, role } = useAuth();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [earnings, setEarnings] = useState<PartnerEarning[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [dateFilter, setDateFilter] = useState<'current_month' | 'prev_month' | 'ytd' | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'sales' | 'ledger' | 'assets'>('sales');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Load default partner or partner associated with current user
        const partners = await dbService.getPartners();
        const currentPartner = partners[0] || null; // default to Apex Performance or first
        setPartner(currentPartner);

        if (currentPartner) {
          const [allOrders, allEarnings] = await Promise.all([
            dbService.getOrders(),
            dbService.getPartnerEarnings(currentPartner.id)
          ]);
          // Filter orders attributed to this partner
          const partnerOrders = allOrders.filter(
            (o) => o.partnerId === currentPartner.id || o.partnerSlug === currentPartner.slug
          );
          setOrders(partnerOrders);
          setEarnings(allEarnings);
        }
      } catch (err) {
        console.error('Failed to load partner dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="py-24 text-center text-[#7c6b69] space-y-3">
        <span className="w-8 h-8 border-2 border-[#b87572] border-t-transparent rounded-full animate-spin inline-block"></span>
        <p className="text-xs">Loading Partner Telemetry &amp; Ledger...</p>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h2 className="font-serif text-2xl font-bold text-[#744241] mb-4">No Partner Account Found</h2>
        <p className="text-xs text-[#7c6b69] mb-6">Please submit a partner application or log in with partner credentials.</p>
        <button
          onClick={() => navigate('partners')}
          className="px-6 py-2.5 rounded-xl bg-[#b87572] text-white text-xs font-semibold cursor-pointer"
        >
          Become a Partner
        </button>
      </div>
    );
  }

  // KPI Calculations
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length;
  const pendingOrders = orders.filter((o) => o.status === 'PENDING' || o.status === 'PROCESSING' || o.status === 'CONFIRMED').length;
  const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED').length;
  const grossSales = orders.reduce((acc, o) => acc + o.subtotal, 0);
  const totalEarnings = earnings.reduce((acc, e) => acc + e.earningAmount, 0);
  const pendingEarnings = earnings.filter((e) => e.status === 'PENDING').reduce((acc, e) => acc + e.earningAmount, 0);
  const paidEarnings = earnings.filter((e) => e.status === 'PAID').reduce((acc, e) => acc + e.earningAmount, 0);

  // Search filter
  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.items.some((it) => it.productName.toLowerCase().includes(q))
    );
  });

  const referralUrl = `${window.location.origin}/#/partner/${partner.slug}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleExportCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer', 'Status', 'Gross Sales', 'Commission'];
    const rows = orders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      o.customerName,
      o.status,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-[#ead2ce] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-[#b87572] text-[#fffdfb] font-semibold">
              {partner.partnerId}
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-[#7c6b69]">
              {partner.category}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ead2ce] text-[#b87572]">
              STATUS: {partner.status}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-[#744241] font-bold mt-2">
            {partner.name} — Partner Portal
          </h1>
          <p className="text-xs text-[#7c6b69] mt-1">
            Referred patient sales tracking, automated commission attribution &amp; clinical ledger.
          </p>
        </div>

        {/* Co-Branded Link Action Card */}
        <div className="bg-[#fff6f3] border border-[#ead2ce] p-3.5 rounded-2xl flex items-center gap-3 text-xs">
          <div className="text-left">
            <span className="text-[10px] text-[#7c6b69] uppercase font-bold block">Patient Referral Link</span>
            <span className="font-mono text-xs text-[#b87572] font-semibold">
              /partner/{partner.slug}
            </span>
          </div>
          <button
            onClick={copyReferralLink}
            className="px-3 py-1.5 rounded-lg bg-[#b87572] text-white text-xs font-semibold hover:bg-[#744241] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">
              {copiedLink ? 'check' : 'content_copy'}
            </span>
            <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
          </button>
          <button
            onClick={() => navigate('partner-page', partner.slug)}
            className="px-3 py-1.5 rounded-lg border border-[#ead2ce] text-[#7c6b69] hover:bg-[#fffdfb] text-xs font-semibold cursor-pointer"
            title="Preview customer view"
          >
            Preview
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-[#ead2ce] p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c6b69] block">
            Total Orders
          </span>
          <span className="font-serif text-2xl font-bold text-[#744241] block mt-1">
            {totalOrders}
          </span>
          <span className="text-[10px] text-[#b87572]">Referred lifetime</span>
        </div>

        <div className="bg-white border border-[#ead2ce] p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c6b69] block">
            Completed Orders
          </span>
          <span className="font-serif text-2xl font-bold text-[#b87572] block mt-1">
            {completedOrders}
          </span>
          <span className="text-[10px] text-[#7c6b69]">Dispatched by lab</span>
        </div>

        <div className="bg-white border border-[#ead2ce] p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c6b69] block">
            Pending Orders
          </span>
          <span className="font-serif text-2xl font-bold text-[#b87572] block mt-1">
            {pendingOrders}
          </span>
          <span className="text-[10px] text-[#7c6b69]">In compounding</span>
        </div>

        <div className="bg-white border border-[#ead2ce] p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c6b69] block">
            Gross Sales
          </span>
          <span className="font-serif text-2xl font-bold text-[#744241] block mt-1">
            ${grossSales.toFixed(0)}
          </span>
          <span className="text-[10px] text-[#7c6b69]">Patient volume</span>
        </div>

        <div className="bg-white border border-[#ead2ce] p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c6b69] block">
            Eligible Earnings
          </span>
          <span className="font-serif text-2xl font-bold text-[#b87572] block mt-1">
            ${totalEarnings.toFixed(2)}
          </span>
          <span className="text-[10px] text-[#b87572]">{(partner.commissionRate * 100).toFixed(0)}% Rate</span>
        </div>

        <div className="bg-[#b87572] text-white p-4 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ead2ce] block">
            Pending Payout
          </span>
          <span className="font-serif text-2xl font-bold block mt-1">
            ${pendingEarnings.toFixed(2)}
          </span>
          <span className="text-[10px] text-[#ead2ce]">Paid: ${paidEarnings.toFixed(2)}</span>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="border border-[#ead2ce] rounded-3xl bg-white overflow-hidden shadow-xs">
        
        {/* Navigation Tabs and Date Filter Bar */}
        <div className="p-4 bg-[#fff6f3] border-b border-[#ead2ce] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'sales'
                  ? 'bg-[#b87572] text-white'
                  : 'text-[#7c6b69] hover:bg-[#ead2ce]/50'
              }`}
            >
              Sales &amp; Orders ({filteredOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'ledger'
                  ? 'bg-[#b87572] text-white'
                  : 'text-[#7c6b69] hover:bg-[#ead2ce]/50'
              }`}
            >
              Earnings Ledger ({earnings.length})
            </button>
            <button
              onClick={() => setActiveTab('assets')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'assets'
                  ? 'bg-[#b87572] text-white'
                  : 'text-[#7c6b69] hover:bg-[#ead2ce]/50'
              }`}
            >
              Partner Profile &amp; Assets
            </button>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#ead2ce] text-xs text-[#744241] focus:outline-[#b87572] cursor-pointer"
            >
              <option value="all">Lifetime History</option>
              <option value="current_month">Current Month</option>
              <option value="prev_month">Previous Month</option>
              <option value="ytd">Year to Date (YTD)</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg border border-[#ead2ce] bg-white hover:bg-[#fffdfb] text-xs font-semibold text-[#7c6b69] flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Sales & Orders */}
        {activeTab === 'sales' && (
          <div>
            <div className="p-4 border-b border-[#ead2ce]/50 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#7c6b69] text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search orders by ID, patient name, or formulation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs text-[#744241] placeholder-[#7c6b69] focus:outline-none"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#fffdfb] text-[#744241] font-serif border-b border-[#ead2ce]">
                  <tr>
                    <th className="p-4 font-bold">Date</th>
                    <th className="p-4 font-bold">Order ID</th>
                    <th className="p-4 font-bold">Customer</th>
                    <th className="p-4 font-bold">Formulations</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Revenue</th>
                    <th className="p-4 font-bold text-[#b87572]">Partner Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ead2ce]/40 text-[#7c6b69]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#7c6b69]">
                        No referred patient orders found for this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#fffdfb]/50 transition-colors">
                        <td className="p-4 whitespace-nowrap">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 font-mono font-semibold text-[#744241]">
                          {ord.orderNumber}
                        </td>
                        <td className="p-4 font-medium text-[#744241]">
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
                              ? 'bg-[#ead2ce] text-[#b87572]'
                              : ord.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-[#744241]">
                          ${ord.subtotal.toFixed(2)}
                        </td>
                        <td className="p-4 font-bold text-[#b87572]">
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
              <thead className="bg-[#fffdfb] text-[#744241] font-serif border-b border-[#ead2ce]">
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
              <tbody className="divide-y divide-[#ead2ce]/40 text-[#7c6b69]">
                {earnings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#7c6b69]">
                      No audit ledger records generated yet.
                    </td>
                  </tr>
                ) : (
                  earnings.map((e) => (
                    <tr key={e.id} className="hover:bg-[#fffdfb]/50">
                      <td className="p-4">{new Date(e.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 font-mono font-semibold text-[#744241]">{e.orderNumber}</td>
                      <td className="p-4">{e.customerName}</td>
                      <td className="p-4">${e.grossSales.toFixed(2)}</td>
                      <td className="p-4">{(e.commissionRate * 100).toFixed(0)}%</td>
                      <td className="p-4 font-bold text-[#b87572]">${e.earningAmount.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          e.status === 'PAID'
                            ? 'bg-[#ead2ce] text-[#b87572]'
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
          <div className="p-6 space-y-6 text-xs max-w-2xl">
            <h3 className="font-serif text-lg font-bold text-[#744241]">
              Practice Information &amp; Attribution Settings
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[#7c6b69] block">Practice Name</span>
                <span className="font-semibold text-[#744241]">{partner.name}</span>
              </div>
              <div>
                <span className="text-[#7c6b69] block">Partner ID</span>
                <span className="font-mono font-semibold text-[#b87572]">{partner.partnerId}</span>
              </div>
              <div>
                <span className="text-[#7c6b69] block">Commission Structure</span>
                <span className="font-semibold text-[#744241]">{(partner.commissionRate * 100).toFixed(0)}% Revenue Share</span>
              </div>
              <div>
                <span className="text-[#7c6b69] block">Member VIP Discount</span>
                <span className="font-semibold text-[#744241]">{(partner.memberDiscountRate * 100).toFixed(0)}% Discount</span>
              </div>
              <div className="col-span-2">
                <span className="text-[#7c6b69] block">Primary Contact</span>
                <span className="font-semibold text-[#744241]">{partner.contactPerson} ({partner.email})</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#ead2ce]/60">
              <h4 className="font-semibold text-[#744241] mb-2">Patient Marketing Collateral</h4>
              <p className="text-[#7c6b69] mb-3">
                Download printable clinic display QR codes and digital brochures mapped to your referral URL.
              </p>
              <button
                onClick={copyReferralLink}
                className="px-4 py-2 rounded-xl bg-[#b87572] text-white text-xs font-semibold cursor-pointer"
              >
                Copy Patient QR Link
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
