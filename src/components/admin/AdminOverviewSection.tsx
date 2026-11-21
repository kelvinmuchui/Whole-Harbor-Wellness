import React, { useMemo, useState } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  ShoppingCart,
  TrendingUp,
  Coins,
  FileText,
  Trophy,
  Zap,
  ArrowRight,
  ArrowUpRight
} from 'lucide-react';
import {
  Partner,
  Order,
  PartnerEarning,
  AuditLogEntry,
  ContactInquiry
} from '../../types/index.ts';

export type AdminSectionId =
  | 'overview'
  | 'partners'
  | 'applications'
  | 'partner-users'
  | 'orders'
  | 'payouts'
  | 'products'
  | 'partner-pages'
  | 'programs'
  | 'articles'
  | 'faqs'
  | 'testimonials'
  | 'inquiries'
  | 'analytics'
  | 'users'
  | 'audit'
  | 'settings';

interface AdminOverviewSectionProps {
  partners: Partner[];
  orders: Order[];
  earnings: PartnerEarning[];
  auditLogs: AuditLogEntry[];
  inquiries: ContactInquiry[];
  timeframe: '30d' | '90d' | 'ytd' | 'all';
  onNavigateSection: (section: AdminSectionId) => void;
  onReviewPartner: (partner: Partner) => void;
  onInspectOrder: (order: Order) => void;
  onOpenPartnerPage: (slug: string) => void;
}

function formatRelativeTime(isoDate: string): string {
  const ts = new Date(isoDate).getTime();
  if (Number.isNaN(ts)) return 'Recently';
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  const days = Math.floor(diffSec / 86400);
  if (days < 30) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function filterOrdersByTimeframe(orders: Order[], timeframe: '30d' | '90d' | 'ytd' | 'all'): Order[] {
  if (timeframe === 'all') return orders;
  const now = new Date();
  return orders.filter((o) => {
    const d = new Date(o.createdAt);
    if (Number.isNaN(d.getTime())) return true;
    if (timeframe === 'ytd') {
      return d.getFullYear() === now.getFullYear();
    }
    const days = timeframe === '30d' ? 30 : 90;
    const cutoff = now.getTime() - days * 86400000;
    return d.getTime() >= cutoff;
  });
}

function getPartnerStatusBadge(status: string) {
  if (status === 'APPROVED') {
    return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  }
  if (status === 'UNDER REVIEW' || status === 'PENDING') {
    return 'bg-sky-50 text-sky-800 border-sky-200';
  }
  if (status === 'NEW' || status === 'NEEDS INFORMATION') {
    return 'bg-amber-50 text-amber-800 border-amber-200';
  }
  return 'bg-red-50 text-red-700 border-red-200';
}

const MiniSparkBars: React.FC<{ color: string; heights: number[] }> = ({ color, heights }) => (
  <svg
    viewBox="0 0 64 32"
    className="w-16 h-8 shrink-0 overflow-visible"
    aria-hidden="true"
  >
    {heights.map((h, i) => {
      const clamped = Math.max(4, Math.min(28, h));
      const opacity = 0.28 + (i / Math.max(1, heights.length - 1)) * 0.72;
      return (
        <rect
          key={i}
          x={i * 9}
          y={32 - clamped}
          width="6"
          height={clamped}
          rx="2"
          fill={color}
          fillOpacity={opacity}
        />
      );
    })}
  </svg>
);

export const AdminOverviewSection: React.FC<AdminOverviewSectionProps> = ({
  partners,
  orders,
  earnings,
  auditLogs,
  inquiries,
  timeframe,
  onNavigateSection,
  onReviewPartner,
  onInspectOrder,
  onOpenPartnerPage
}) => {
  const [chartRange, setChartRange] = useState<'6m' | '12m'>('6m');
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);

  const scopedOrders = useMemo(() => filterOrdersByTimeframe(orders, timeframe), [orders, timeframe]);

  const activePartnersCount = useMemo(
    () => partners.filter((p) => p.status === 'APPROVED').length,
    [partners]
  );

  const pendingAppsCount = useMemo(
    () =>
      partners.filter(
        (p) => p.status === 'NEW' || p.status === 'UNDER REVIEW' || p.status === 'NEEDS INFORMATION' || p.status === 'PENDING'
      ).length,
    [partners]
  );

  const grossSalesTotal = useMemo(
    () => scopedOrders.reduce((acc, o) => acc + o.total, 0),
    [scopedOrders]
  );

  const partnerCommissionMetrics = useMemo(() => {
    const eligibleTotal = earnings
      .filter((e) => e.status !== 'CANCELLED')
      .reduce((acc, e) => acc + e.earningAmount, 0);
    const pending = earnings
      .filter((e) => e.status === 'PENDING')
      .reduce((acc, e) => acc + e.earningAmount, 0);
    const approved = earnings
      .filter((e) => e.status === 'APPROVED')
      .reduce((acc, e) => acc + e.earningAmount, 0);
    const paid = earnings
      .filter((e) => e.status === 'PAID')
      .reduce((acc, e) => acc + e.earningAmount, 0);
    const partnerSalesGross = scopedOrders
      .filter((o) => Boolean(o.partnerId || o.partnerSlug || o.partnerName))
      .reduce((acc, o) => acc + o.total, 0);

    return {
      eligibleTotal,
      pending,
      approved,
      paid,
      partnerSalesShare: grossSalesTotal > 0 ? Math.round((partnerSalesGross / grossSalesTotal) * 100) : 0
    };
  }, [earnings, scopedOrders, grossSalesTotal]);

  // Build dynamic monthly performance data from real orders
  const monthlySeries = useMemo(() => {
    const monthsCount = chartRange === '6m' ? 6 : 12;
    const now = new Date();
    const buckets: {
      key: string;
      label: string;
      totalSales: number;
      partnerSales: number;
      orderCount: number;
    }[] = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      buckets.push({
        key,
        label,
        totalSales: 0,
        partnerSales: 0,
        orderCount: 0
      });
    }

    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const bucket = buckets.find((b) => b.key === key);
      if (!bucket) return;
      bucket.totalSales += o.total;
      bucket.orderCount += 1;
      if (o.partnerId || o.partnerSlug || o.partnerName) {
        bucket.partnerSales += o.total;
      }
    });

    return buckets;
  }, [orders, chartRange]);

  const maxChartVal = useMemo(() => {
    const rawMax = Math.max(
      1000,
      ...monthlySeries.map((m) => Math.max(m.totalSales, m.partnerSales))
    );
    const step = rawMax > 10000 ? 5000 : rawMax > 4000 ? 1000 : 500;
    return Math.ceil((rawMax * 1.15) / step) * step;
  }, [monthlySeries]);

  const recentPartnerRows = useMemo(() => {
    return [...partners]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [partners]);

  const topPerformingPartners = useMemo(() => {
    return partners
      .map((pt) => {
        const ptOrders = orders.filter(
          (o) => o.partnerId === pt.id || o.partnerId === pt.partnerId || o.partnerSlug === pt.slug
        );
        const sales = ptOrders.reduce((acc, o) => acc + o.subtotal, 0);
        return {
          partner: pt,
          ordersCount: ptOrders.length,
          sales
        };
      })
      .sort((a, b) => b.sales - a.sales || b.ordersCount - a.ordersCount)
      .slice(0, 4);
  }, [partners, orders]);

  const activityFeed = useMemo(() => {
    const items: {
      id: string;
      title: string;
      detail: string;
      timestamp: string;
      tone: 'navy' | 'gold' | 'emerald';
      onClick: () => void;
    }[] = [];

    orders.slice(0, 3).forEach((ord) => {
      items.push({
        id: `ord-${ord.id}`,
        title: `Order ${ord.orderNumber} placed`,
        detail: `${formatRelativeTime(ord.createdAt)} · $${ord.total.toFixed(2)}`,
        timestamp: ord.createdAt,
        tone: 'navy',
        onClick: () => onInspectOrder(ord)
      });
    });

    partners.slice(0, 2).forEach((pt) => {
      items.push({
        id: `pt-${pt.id}`,
        title:
          pt.status === 'APPROVED'
            ? `Partner ${pt.name} active`
            : `Partner application: ${pt.name}`,
        detail: `${formatRelativeTime(pt.updatedAt || pt.createdAt)} · ${pt.status}`,
        timestamp: pt.updatedAt || pt.createdAt,
        tone: 'gold',
        onClick: () => onReviewPartner(pt)
      });
    });

    inquiries.slice(0, 2).forEach((inq) => {
      items.push({
        id: `inq-${inq.id}`,
        title: `Inquiry from ${inq.name}`,
        detail: `${formatRelativeTime(inq.createdAt)} · ${inq.department}`,
        timestamp: inq.createdAt,
        tone: 'emerald',
        onClick: () => onNavigateSection('inquiries')
      });
    });

    auditLogs.slice(0, 2).forEach((log) => {
      items.push({
        id: `log-${log.id}`,
        title: log.action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
        detail: `${formatRelativeTime(log.timestamp)} · ${log.resource}`,
        timestamp: log.timestamp,
        tone: 'gold',
        onClick: () => onNavigateSection('audit')
      });
    });

    return items
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [orders, partners, inquiries, auditLogs, onInspectOrder, onReviewPartner, onNavigateSection]);

  // SVG chart coordinate calculations
  const chartW = 640;
  const chartH = 220;
  const padL = 48;
  const padR = 18;
  const padT = 16;
  const padB = 28;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const getCoord = (idx: number, val: number) => {
    const x =
      monthlySeries.length <= 1
        ? padL + plotW / 2
        : padL + (idx / (monthlySeries.length - 1)) * plotW;
    const y = padT + plotH - (val / maxChartVal) * plotH;
    return { x, y };
  };

  const totalLinePoints = monthlySeries.map((m, i) => getCoord(i, m.totalSales));
  const partnerLinePoints = monthlySeries.map((m, i) => getCoord(i, m.partnerSales));

  const buildPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const totalAreaPath =
    totalLinePoints.length > 0
      ? `${buildPath(totalLinePoints)} L ${totalLinePoints[totalLinePoints.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(1)} L ${totalLinePoints[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`
      : '';

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((frac) => Math.round(maxChartVal * frac));

  return (
    <div className="space-y-6">
      {/* Row 1: 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Total Partners */}
        <button
          type="button"
          onClick={() => onNavigateSection('partners')}
          className="text-left bg-[#fffdfb] border border-[#dfd7c7] rounded-2xl p-5 hover:border-[#c5a059] transition-colors cursor-pointer group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-full bg-[#0c2340] text-[#fffdfb] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#c5a059]" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-[#5a6b7c] block truncate">
                  Total Partners
                </span>
                <span className="font-serif text-3xl font-bold text-[#0c2340] tabular-nums leading-tight block mt-0.5">
                  {partners.length}
                </span>
              </div>
            </div>
            <MiniSparkBars color="#0c2340" heights={[10, 14, 12, 18, 22, 26]} />
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#dfd7c7]/60 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-semibold">
              {partners.length > 0 ? `${Math.round((activePartnersCount / partners.length) * 100)}% verified rate` : 'Ecosystem ready'}
            </span>
            <span className="text-[#c5a059] font-semibold group-hover:translate-x-0.5 transition-transform">
              Manage →
            </span>
          </div>
        </button>

        {/* Card 2: Active Partners */}
        <button
          type="button"
          onClick={() => onNavigateSection('partner-pages')}
          className="text-left bg-[#fffdfb] border border-[#dfd7c7] rounded-2xl p-5 hover:border-[#c5a059] transition-colors cursor-pointer group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-[#5a6b7c] block truncate">
                  Active Partners
                </span>
                <span className="font-serif text-3xl font-bold text-[#0c2340] tabular-nums leading-tight block mt-0.5">
                  {activePartnersCount}
                </span>
              </div>
            </div>
            <MiniSparkBars color="#15803d" heights={[9, 13, 15, 19, 23, 27]} />
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#dfd7c7]/60 flex items-center justify-between text-[11px]">
            <span className="text-[#5a6b7c] font-medium">Live clinic storefronts</span>
            <span className="text-[#c5a059] font-semibold group-hover:translate-x-0.5 transition-transform">
              Storefronts →
            </span>
          </div>
        </button>

        {/* Card 3: Pending Applications */}
        <button
          type="button"
          onClick={() => onNavigateSection('applications')}
          className="text-left bg-[#fffdfb] border border-[#dfd7c7] rounded-2xl p-5 hover:border-[#c5a059] transition-colors cursor-pointer group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-full bg-[#c5a059] text-white flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-[#5a6b7c] block truncate">
                  Pending Applications
                </span>
                <span className="font-serif text-3xl font-bold text-[#0c2340] tabular-nums leading-tight block mt-0.5">
                  {pendingAppsCount}
                </span>
              </div>
            </div>
            <MiniSparkBars color="#c5a059" heights={[12, 16, 14, 20, 18, 24]} />
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#dfd7c7]/60 flex items-center justify-between text-[11px]">
            <span className="text-amber-700 font-semibold">
              {pendingAppsCount > 0 ? 'Awaiting compliance review' : 'Review queue clear'}
            </span>
            <span className="text-[#c5a059] font-semibold group-hover:translate-x-0.5 transition-transform">
              Review →
            </span>
          </div>
        </button>

        {/* Card 4: Total Orders */}
        <button
          type="button"
          onClick={() => onNavigateSection('orders')}
          className="text-left bg-[#fffdfb] border border-[#dfd7c7] rounded-2xl p-5 hover:border-[#c5a059] transition-colors cursor-pointer group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-full bg-[#0c2340] text-white flex items-center justify-center shrink-0">
                <ShoppingCart className="w-5 h-5 text-[#c5a059]" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-[#5a6b7c] block truncate">
                  Total Orders
                </span>
                <span className="font-serif text-3xl font-bold text-[#0c2340] tabular-nums leading-tight block mt-0.5">
                  {scopedOrders.length}
                </span>
              </div>
            </div>
            <MiniSparkBars color="#0c2340" heights={[8, 12, 16, 20, 22, 28]} />
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#dfd7c7]/60 flex items-center justify-between text-[11px]">
            <span className="text-[#0c2340] font-semibold tabular-nums">
              ${grossSalesTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} gross
            </span>
            <span className="text-[#c5a059] font-semibold group-hover:translate-x-0.5 transition-transform">
              Fulfillment →
            </span>
          </div>
        </button>
      </div>

      {/* Row 2: Sales & Referral Performance Chart (8 cols) + Partner Earnings Navy Highlight Card (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* Left Chart Card */}
        <div className="xl:col-span-8 bg-[#fffdfb] border border-[#dfd7c7] rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#f6f4ee] border border-[#dfd7c7] flex items-center justify-center text-[#0c2340]">
                <TrendingUp className="w-4 h-4 text-[#c5a059]" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-[#0c2340] leading-tight">
                  Sales &amp; Referral Performance
                </h2>
                <p className="text-[11px] text-[#5a6b7c]">
                  Monthly gross order revenue compared against partner-attributed sales
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="hidden md:flex items-center gap-4 text-[11px] font-semibold text-[#5a6b7c]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0c2340]" />
                  <span>Total Sales</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059]" />
                  <span>Partner Sales</span>
                </span>
              </div>

              <select
                value={chartRange}
                onChange={(e) => setChartRange(e.target.value as '6m' | '12m')}
                aria-label="Chart range"
                className="px-3 py-1.5 rounded-xl bg-[#f6f4ee] border border-[#dfd7c7] text-xs font-semibold text-[#0c2340] cursor-pointer"
              >
                <option value="6m">Last 6 months</option>
                <option value="12m">Last 12 months</option>
              </select>
            </div>
          </div>

          {/* Mobile legend */}
          <div className="flex md:hidden items-center gap-4 text-[11px] font-semibold text-[#5a6b7c] mb-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0c2340]" />
              <span>Total Sales</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059]" />
              <span>Partner Sales</span>
            </span>
          </div>

          <div className="relative w-full">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-56 sm:h-64 select-none"
              role="img"
              aria-label="Monthly sales and partner referral performance chart"
            >
              <defs>
                <linearGradient id="whwSalesArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0c2340" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#0c2340" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines & Y-Axis Labels */}
              {yTicks.map((tick) => {
                const y = padT + plotH - (tick / maxChartVal) * plotH;
                const labelText =
                  tick === 0
                    ? '$0'
                    : tick >= 1000
                    ? `$${(tick / 1000).toFixed(tick % 1000 === 0 ? 0 : 1)}K`
                    : `$${tick}`;
                return (
                  <g key={tick}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={chartW - padR}
                      y2={y}
                      stroke="#dfd7c7"
                      strokeDasharray={tick === 0 ? undefined : '3 3'}
                      strokeWidth="1"
                    />
                    <text
                      x={padL - 8}
                      y={y + 4}
                      textAnchor="end"
                      fill="#5a6b7c"
                      fontSize="10"
                      fontFamily="Manrope, sans-serif"
                    >
                      {labelText}
                    </text>
                  </g>
                );
              })}

              {/* Area Fill under Total Sales */}
              {totalAreaPath && <path d={totalAreaPath} fill="url(#whwSalesArea)" />}

              {/* Partner Sales Line (Gold) */}
              {partnerLinePoints.length > 1 && (
                <path
                  d={buildPath(partnerLinePoints)}
                  fill="none"
                  stroke="#c5a059"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Total Sales Line (Deep Navy) */}
              {totalLinePoints.length > 1 && (
                <path
                  d={buildPath(totalLinePoints)}
                  fill="none"
                  stroke="#0c2340"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Points + Interactive Hover Columns */}
              {monthlySeries.map((bucket, idx) => {
                const tp = totalLinePoints[idx];
                const pp = partnerLinePoints[idx];
                const isHovered = hoveredMonthIdx === idx;
                return (
                  <g
                    key={bucket.key}
                    onMouseEnter={() => setHoveredMonthIdx(idx)}
                    onMouseLeave={() => setHoveredMonthIdx(null)}
                    className="cursor-pointer"
                  >
                    {isHovered && (
                      <line
                        x1={tp.x}
                        y1={padT}
                        x2={tp.x}
                        y2={padT + plotH}
                        stroke="#c5a059"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}
                    <circle
                      cx={pp.x}
                      cy={pp.y}
                      r={isHovered ? 5 : 3.5}
                      fill="#fffdfb"
                      stroke="#c5a059"
                      strokeWidth="2.2"
                    />
                    <circle
                      cx={tp.x}
                      cy={tp.y}
                      r={isHovered ? 5.5 : 4}
                      fill="#0c2340"
                      stroke="#fffdfb"
                      strokeWidth="2"
                    />
                    <rect
                      x={tp.x - 24}
                      y={padT}
                      width="48"
                      height={plotH + padB}
                      fill="transparent"
                    />
                    <text
                      x={tp.x}
                      y={chartH - 8}
                      textAnchor="middle"
                      fill={isHovered ? '#0c2340' : '#5a6b7c'}
                      fontWeight={isHovered ? '700' : '500'}
                      fontSize="10"
                      fontFamily="Manrope, sans-serif"
                    >
                      {bucket.label.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Interactive Hover Summary Bar */}
            {hoveredMonthIdx !== null && monthlySeries[hoveredMonthIdx] && (
              <div className="mt-2 px-3.5 py-2 rounded-xl bg-[#f6f4ee] border border-[#dfd7c7] flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-[#0c2340]">
                  {monthlySeries[hoveredMonthIdx].label}
                </span>
                <div className="flex flex-wrap items-center gap-4 tabular-nums">
                  <span className="text-[#0c2340]">
                    Total: <strong>${monthlySeries[hoveredMonthIdx].totalSales.toFixed(2)}</strong>
                  </span>
                  <span className="text-[#a68238]">
                    Partner: <strong>${monthlySeries[hoveredMonthIdx].partnerSales.toFixed(2)}</strong>
                  </span>
                  <span className="text-[#5a6b7c]">
                    {monthlySeries[hoveredMonthIdx].orderCount} orders
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Navy Highlight Card: Partner Earnings */}
        <div className="xl:col-span-4 rounded-2xl bg-gradient-to-br from-[#0c2340] via-[#102c4f] to-[#07172b] text-[#fffdfb] border border-[#c5a059]/35 p-6 flex flex-col justify-between relative overflow-hidden shadow-md">
          {/* Subtle Architectural Watermark */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -bottom-10 w-44 h-44 rounded-full border border-[#c5a059]/15 bg-[#c5a059]/5"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -bottom-4 w-28 h-28 rounded-full border border-[#c5a059]/20"
          />

          <div className="relative space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center">
                <Coins className="w-5 h-5 text-[#c5a059]" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-semibold text-[#fffdfb]">
                  Partner Earnings
                </h2>
                <p className="text-[11px] text-[#dfd7c7]/75">
                  Clinic commission audit ledger
                </p>
              </div>
            </div>

            <div>
              <p className="font-serif text-4xl sm:text-[42px] font-bold text-[#fffdfb] tabular-nums tracking-tight leading-none">
                ${partnerCommissionMetrics.eligibleTotal.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
              <p className="text-xs text-[#c5a059] font-semibold mt-2">
                Eligible &amp; Tracked Commissions
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-[11px] tabular-nums">
              <div>
                <span className="text-[#dfd7c7]/70 block">Pending</span>
                <strong className="text-white font-semibold">${partnerCommissionMetrics.pending.toFixed(0)}</strong>
              </div>
              <div>
                <span className="text-[#dfd7c7]/70 block">Approved</span>
                <strong className="text-[#c5a059] font-semibold">${partnerCommissionMetrics.approved.toFixed(0)}</strong>
              </div>
              <div>
                <span className="text-[#dfd7c7]/70 block">Disbursed</span>
                <strong className="text-emerald-300 font-semibold">${partnerCommissionMetrics.paid.toFixed(0)}</strong>
              </div>
            </div>
          </div>

          <div className="relative pt-5 mt-5 border-t border-white/10 flex items-center justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-xs font-semibold text-[#c5a059] tabular-nums">
                ↑ {partnerCommissionMetrics.partnerSalesShare}%
              </span>
              <span className="block text-[10px] text-[#dfd7c7]/75 mt-1">
                of gross order volume
              </span>
            </div>

            <button
              type="button"
              onClick={() => onNavigateSection('payouts')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-[#c5a059] border border-[#c5a059]/60 text-white hover:text-[#0c2340] text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Partner Applications | Top Performing Partners | Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Recent Partner Applications (5 cols) */}
        <div className="lg:col-span-5 bg-[#fffdfb] border border-[#dfd7c7] rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-[#dfd7c7]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#c5a059]" />
              <h3 className="font-serif text-lg font-bold text-[#0c2340]">
                Recent Partner Applications
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateSection('applications')}
              className="text-xs font-semibold text-[#c5a059] hover:text-[#0c2340] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1 mt-2">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-[11px] font-semibold text-[#5a6b7c] border-b border-[#dfd7c7]/60">
                  <th className="py-2.5 pr-2">Organization</th>
                  <th className="py-2.5 px-2">Category</th>
                  <th className="py-2.5 pl-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dfd7c7]/50">
                {recentPartnerRows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-[#5a6b7c]">
                      No partner applications recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentPartnerRows.map((pt) => (
                    <tr
                      key={pt.id}
                      onClick={() => onReviewPartner(pt)}
                      className="hover:bg-[#f6f4ee]/70 transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-[#f6f4ee] border border-[#dfd7c7] flex items-center justify-center shrink-0 overflow-hidden">
                            {pt.logoUrl ? (
                              <img
                                src={pt.logoUrl}
                                alt={pt.name}
                                className="w-full h-full object-contain p-0.5"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="font-serif font-bold text-xs text-[#0c2340]">
                                {pt.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-[#0c2340] block truncate max-w-[160px]">
                              {pt.name}
                            </span>
                            <span className="text-[10px] text-[#5a6b7c] block truncate">
                              {pt.contactPerson}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-[#5a6b7c] whitespace-nowrap">
                        {pt.category}
                      </td>
                      <td className="py-2.5 pl-2 text-right whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase ${getPartnerStatusBadge(pt.status)}`}
                        >
                          {pt.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performing Partners (4 cols) */}
        <div className="lg:col-span-4 bg-[#fffdfb] border border-[#dfd7c7] rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-[#dfd7c7]">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#c5a059]" />
              <h3 className="font-serif text-lg font-bold text-[#0c2340]">
                Top Performing Partners
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateSection('partners')}
              className="text-xs font-semibold text-[#c5a059] hover:text-[#0c2340] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1 mt-2">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-[11px] font-semibold text-[#5a6b7c] border-b border-[#dfd7c7]/60">
                  <th className="py-2.5 pr-2">Partner</th>
                  <th className="py-2.5 px-2 text-right">Orders</th>
                  <th className="py-2.5 pl-2 text-right">Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dfd7c7]/50 tabular-nums">
                {topPerformingPartners.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-[#5a6b7c]">
                      No partner revenue data yet.
                    </td>
                  </tr>
                ) : (
                  topPerformingPartners.map(({ partner: pt, ordersCount, sales }) => (
                    <tr
                      key={pt.id}
                      onClick={() => onOpenPartnerPage(pt.slug)}
                      className="hover:bg-[#f6f4ee]/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-[#f6f4ee] border border-[#dfd7c7] flex items-center justify-center shrink-0 overflow-hidden">
                            {pt.logoUrl ? (
                              <img
                                src={pt.logoUrl}
                                alt={pt.name}
                                className="w-full h-full object-contain p-0.5"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="font-serif font-bold text-xs text-[#0c2340]">
                                {pt.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <span className="font-semibold text-[#0c2340] group-hover:text-[#c5a059] truncate max-w-[140px]">
                            {pt.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right font-semibold text-[#5a6b7c]">
                        {ordersCount}
                      </td>
                      <td className="py-2.5 pl-2 text-right font-bold text-[#0c2340] inline-flex items-center justify-end gap-1 w-full">
                        <span>${sales.toFixed(2)}</span>
                        <ArrowUpRight className="w-3 h-3 text-[#c5a059] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity (3 cols) */}
        <div className="lg:col-span-3 bg-[#fffdfb] border border-[#dfd7c7] rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[#dfd7c7]">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#c5a059]" />
              <h3 className="font-serif text-lg font-bold text-[#0c2340]">
                Recent Activity
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateSection('audit')}
              className="text-xs font-semibold text-[#c5a059] hover:text-[#0c2340] cursor-pointer whitespace-nowrap shrink-0"
            >
              Audit →
            </button>
          </div>

          <div className="flex-1 mt-3 space-y-3">
            {activityFeed.length === 0 ? (
              <p className="text-xs text-[#5a6b7c] py-6 text-center">
                No recent operational events.
              </p>
            ) : (
              activityFeed.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onClick}
                  className="w-full text-left flex items-start gap-2.5 p-2 -mx-2 rounded-xl hover:bg-[#f6f4ee] transition-colors cursor-pointer"
                >
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                      item.tone === 'navy'
                        ? 'bg-[#0c2340]'
                        : item.tone === 'gold'
                        ? 'bg-[#c5a059]'
                        : 'bg-emerald-600'
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#0c2340] leading-snug truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-[#5a6b7c] truncate mt-0.5">
                      {item.detail}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
