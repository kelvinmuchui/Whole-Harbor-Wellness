import React, { useState } from 'react';
import { USER_ROLES, PARTNER_CONSTANTS, VOLUME_DISCOUNT_TIERS } from '../../config/constants.ts';
import { colors } from '../../config/design-tokens.ts';
import { ROLE_PERMISSIONS } from '../../server/rbac.ts';
import { formatPartnerId, generatePartnerSlug } from '../../server/services/partnerService.ts';

interface ArchitectureViewProps {
  navigate: (path: string, param?: string) => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ navigate }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'database' | 'rbac' | 'referral' | 'tokens' | 'roadmap'>('overview');
  
  // Interactive Partner ID simulator
  const [partnerSeq, setPartnerSeq] = useState(1);
  const [sampleBusinessName, setSampleBusinessName] = useState('Apex Athletic Performance');

  // Selected Role for RBAC Inspection
  const [inspectedRole, setInspectedRole] = useState<keyof typeof ROLE_PERMISSIONS>('ADMIN');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Module 1 Header Badge */}
      <div className="border-b border-[#ead2ce] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b87572] text-[#fffdfb] text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="material-symbols-outlined text-[16px]">architecture</span>
            <span>Module 1 Completed — System Analysis &amp; Architecture</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#744241] font-bold">
            Technical Architecture &amp; Foundations
          </h1>
          <p className="text-xs sm:text-sm text-[#7c6b69] max-w-2xl mt-2 leading-relaxed">
            The architectural foundation for Whole Harbor Wellness. Defines the PostgreSQL schema, server-side RBAC, 
            immutable Partner ID generator, 30-day attribution engine, Zod validators, and design tokens.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate('home')}
            className="px-4 py-2 rounded-xl border border-[#ead2ce] text-[#7c6b69] hover:bg-[#fff6f3] text-xs font-semibold cursor-pointer"
          >
            Public Site
          </button>
          <button
            onClick={() => navigate('partner-portal')}
            className="px-4 py-2 rounded-xl bg-[#b87572] text-white text-xs font-semibold hover:bg-[#744241] cursor-pointer"
          >
            Partner Portal
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#ead2ce]/60 pb-3 overflow-x-auto">
        {[
          { id: 'overview', label: '1. Architecture & Tiers', icon: 'hub' },
          { id: 'database', label: '2. PostgreSQL & Prisma', icon: 'database' },
          { id: 'rbac', label: '3. Roles & RBAC Matrix', icon: 'shield_person' },
          { id: 'referral', label: '4. Partner & Referral Engine', icon: 'sync_alt' },
          { id: 'tokens', label: '5. Design System Tokens', icon: 'palette' },
          { id: 'roadmap', label: '6. MVP Modules Roadmap', icon: 'map' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSection === tab.id
                ? 'bg-[#b87572] text-[#fffdfb] shadow-xs'
                : 'bg-[#fff6f3] text-[#7c6b69] hover:text-[#744241] hover:bg-[#ead2ce]/50'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Section 1: Architecture Diagram & Tiers */}
      {activeSection === 'overview' && (
        <div className="space-y-8 animate-in fade-in">
          <div className="bg-white border border-[#ead2ce] rounded-3xl p-8 shadow-xs space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#744241] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#b87572] text-[28px]">account_tree</span>
              <span>Whole Harbor Tiered Architectural Flow</span>
            </h2>

            <div className="bg-[#744241] text-[#fffdfb] p-6 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed">
              <pre>{`                    WHOLE HARBOR WELLNESS
                              |
         +--------------------+--------------------+
         |                                         |
  [ CLIENT TIER ]                           [ BACKEND TIER ]
         |                                         |
  React / Next.js / TypeScript              Node.js / Express Server
  Tailwind CSS (Stitch Theme)               Zod Input Validation
  Vite SPA & Context State                  Session Security & RBAC Guards
         |                                         |
         +---------------- RESTful API ------------+
                                  |
                      [ CORE BUSINESS SERVICES ]
                                  |
       +-----------------+--------+--------+-----------------+
       |                 |                 |                 |
  Partner Service  Referral Service  Order Service     Audit Service
   - Format ID      - 30-day Window   - Tier Discounts  - Immutable
   - Slug Check     - Commission Map  - Cold-Chain Calc - State logs
       |                 |                 |                 |
       +-----------------+--------+--------+-----------------+
                                  |
                      [ DATA PERSISTENCE TIER ]
                                  |
                         PostgreSQL Database
                           (Prisma ORM)
                      Normalized Relational Models`}</pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#fff6f3] border border-[#ead2ce] space-y-2">
                <span className="font-semibold text-sm text-[#744241] block">Zero Leakage Boundary</span>
                <p className="text-[#7c6b69] leading-relaxed">
                  Presentation components are strictly decoupled from database access. All data flows through typed services with Zod schema verification.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#fff6f3] border border-[#ead2ce] space-y-2">
                <span className="font-semibold text-sm text-[#744241] block">Immutable Business Identity</span>
                <p className="text-[#7c6b69] leading-relaxed">
                  Every clinic receives an immutable human-readable Partner ID (e.g. <code>WH-P-000001</code>) preventing internal database ID exposure.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#fff6f3] border border-[#ead2ce] space-y-2">
                <span className="font-semibold text-sm text-[#744241] block">30-Day Attribution Window</span>
                <p className="text-[#7c6b69] leading-relaxed">
                  When a customer enters via a partner URL, secure cookies establish a 30-day referral attribution window for automated commissions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: PostgreSQL Schema Inspector */}
      {activeSection === 'database' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white border border-[#ead2ce] rounded-3xl p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ead2ce] pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#744241]">
                  PostgreSQL Relational Schema (Prisma 3NF)
                </h2>
                <p className="text-xs text-[#7c6b69] mt-1">
                  Defined in <code>/prisma/schema.prisma</code> with relations, compound indices, and audit logging.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#b87572] text-white text-xs font-semibold font-mono">
                19 Models Configured
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {[
                { name: 'User', count: '10 fields', desc: 'Accounts, password hashes, role enum, audit timestamps' },
                { name: 'Partner', count: '14 fields', desc: 'Unique Partner ID, slug, commission rates, status enum' },
                { name: 'PartnerUser', count: '5 fields', desc: 'Junction mapping partner organizations to user accounts' },
                { name: 'Referral', count: '10 fields', desc: 'Attribution session, visitor ID, 30-day expiry, conversion link' },
                { name: 'Order', count: '19 fields', desc: 'Financial breakdown, cold-chain courier tracking, partner attribution' },
                { name: 'OrderItem', count: '7 fields', desc: 'Product link, vial strength tier, unit price, quantity' },
                { name: 'PartnerEarning', count: '12 fields', desc: 'Auditable commission ledger (PENDING, APPROVED, PAID)' },
                { name: 'Product', count: '17 fields', desc: 'SKU, purity assay, lot number, stock, cold-chain CoA' },
                { name: 'WellnessProgram', count: '11 fields', desc: 'Physician-supervised protocols, syllabus, monthly pricing' },
                { name: 'AuditLog', count: '9 fields', desc: 'Append-only audit trail of security and state mutations' },
                { name: 'EducationalArticle', count: '10 fields', desc: 'Clinical studies, research summaries, author attribution' },
                { name: 'Payment', count: '7 fields', desc: 'Gateway transaction logs and reconciliation statuses' }
              ].map((m) => (
                <div key={m.name} className="p-4 rounded-2xl bg-[#fffdfb] border border-[#ead2ce] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-[#b87572]">{m.name}</span>
                    <span className="text-[10px] text-[#7c6b69] uppercase font-semibold">{m.count}</span>
                  </div>
                  <p className="text-[#7c6b69] text-[11px] leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Roles & RBAC Matrix */}
      {activeSection === 'rbac' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white border border-[#ead2ce] rounded-3xl p-8 shadow-xs space-y-6">
            <div className="border-b border-[#ead2ce] pb-4">
              <h2 className="font-serif text-2xl font-bold text-[#744241]">
                Server-Side Role-Based Access Control (RBAC)
              </h2>
              <p className="text-xs text-[#7c6b69] mt-1">
                Authorization enforced server-side via <code>/server/rbac.ts</code>. Includes resource ownership checks preventing IDOR vulnerabilities.
              </p>
            </div>

            {/* Role Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {(Object.keys(ROLE_PERMISSIONS) as (keyof typeof ROLE_PERMISSIONS)[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setInspectedRole(r)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                    inspectedRole === r
                      ? 'bg-[#b87572] text-white shadow-xs'
                      : 'bg-[#fff6f3] text-[#7c6b69] hover:bg-[#ead2ce]/50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Permissions Granted */}
            <div className="bg-[#fffdfb] p-6 rounded-2xl border border-[#ead2ce] space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-serif text-lg font-bold text-[#744241]">
                  Permissions for Role: <span className="text-[#b87572]">{inspectedRole}</span>
                </span>
                <span className="text-xs font-semibold text-[#7c6b69]">
                  {ROLE_PERMISSIONS[inspectedRole].length} Authorized Actions
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                {ROLE_PERMISSIONS[inspectedRole].map((act) => (
                  <div key={act} className="p-2.5 bg-white rounded-xl border border-[#ead2ce] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#b87572] text-[16px]">check_circle</span>
                    <span className="font-mono text-[#744241]">{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Ownership Note */}
            <div className="p-4 rounded-2xl bg-[#b87572]/10 border border-[#7c6b69]/30 text-xs text-[#b87572] space-y-1">
              <span className="font-bold block">Strict Resource Ownership Guard:</span>
              <p>
                A partner user (e.g. <code>PARTNER_OWNER</code> or <code>PARTNER_STAFF</code>) can only access sales and earnings where <code>user.partnerId === order.partnerId</code>. 
                Attempting to inspect another clinic's telemetry triggers a <code>403 FORBIDDEN</code> error and logs a security audit event.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Partner & Referral Engine Simulator */}
      {activeSection === 'referral' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white border border-[#ead2ce] rounded-3xl p-8 shadow-xs space-y-6">
            <div className="border-b border-[#ead2ce] pb-4">
              <h2 className="font-serif text-2xl font-bold text-[#744241]">
                Partner ID &amp; 30-Day Attribution Engine
              </h2>
              <p className="text-xs text-[#7c6b69] mt-1">
                Test the deterministic ID generator and slug validation algorithms defined in <code>/server/services/partnerService.ts</code>.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Simulator Inputs */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#7c6b69] font-medium mb-1">
                    Partner Registration Sequence Index
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={partnerSeq}
                    onChange={(e) => setPartnerSeq(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#ead2ce] text-[#744241]"
                  />
                </div>

                <div>
                  <label className="block text-[#7c6b69] font-medium mb-1">
                    Practice Name
                  </label>
                  <input
                    type="text"
                    value={sampleBusinessName}
                    onChange={(e) => setSampleBusinessName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#ead2ce] text-[#744241]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[#fff6f3] border border-[#ead2ce] space-y-2">
                  <span className="font-semibold text-xs text-[#744241] block">Multi-Tier Volume Savings Matrix:</span>
                  <div className="space-y-1 text-[11px] text-[#7c6b69]">
                    {VOLUME_DISCOUNT_TIERS.map((tier) => (
                      <div key={tier.minKits} className="flex justify-between">
                        <span>{tier.minKits}+ Kits in Cart:</span>
                        <span className="font-bold text-[#b87572]">{(tier.discountRate * 100).toFixed(0)}% Off</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generated Output Card */}
              <div className="bg-[#744241] text-[#fffdfb] p-6 rounded-2xl space-y-4 text-xs">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#b87572] block">
                  Generated Partner Artifacts
                </span>
                
                <div className="space-y-3 font-mono">
                  <div>
                    <span className="text-[#7c6b69] text-[10px] block">Immutable Partner ID</span>
                    <span className="text-xl text-[#fffdfb] font-bold">{formatPartnerId(partnerSeq)}</span>
                  </div>

                  <div>
                    <span className="text-[#7c6b69] text-[10px] block">Attribution Slug</span>
                    <span className="text-sm text-[#7c6b69]">
                      /partner/<strong className="text-white">{generatePartnerSlug(sampleBusinessName)}</strong>
                    </span>
                  </div>

                  <div>
                    <span className="text-[#7c6b69] text-[10px] block">Attribution Cookie</span>
                    <span className="text-[11px] text-[#ead2ce] break-all">
                      wh_partner_ref={generatePartnerSlug(sampleBusinessName)}; max-age=2592000; SameSite=Lax
                    </span>
                  </div>

                  <div>
                    <span className="text-[#7c6b69] text-[10px] block">Commercial Revenue Share</span>
                    <span className="text-sm text-[#fffdfb]">25% Commission • 15% Patient VIP Discount</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Section 5: Design System Tokens */}
      {activeSection === 'tokens' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white border border-[#ead2ce] rounded-3xl p-8 shadow-xs space-y-6">
            <div className="border-b border-[#ead2ce] pb-4">
              <h2 className="font-serif text-2xl font-bold text-[#744241]">
                Whole Harbor Design Tokens
              </h2>
              <p className="text-xs text-[#7c6b69] mt-1">
                Visual identity specifications defined in <code>/config/design-tokens.ts</code>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {Object.entries(colors).map(([name, hex]) => (
                <div key={name} className="p-3 rounded-2xl border border-[#ead2ce] bg-[#fffdfb] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl shadow-xs shrink-0 border border-black/10" style={{ backgroundColor: hex }} />
                  <div>
                    <span className="font-semibold text-xs text-[#744241] block capitalize">{name}</span>
                    <span className="font-mono text-[11px] text-[#7c6b69]">{hex}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#ead2ce] grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="p-4 rounded-2xl bg-[#fff6f3] border border-[#ead2ce]">
                <span className="font-serif text-lg font-bold text-[#744241] block mb-1">Playfair Display</span>
                <span className="text-[#7c6b69]">Primary Editorial &amp; Display Typography for Headings</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#fff6f3] border border-[#ead2ce]">
                <span className="font-sans text-lg font-bold text-[#744241] block mb-1">Inter</span>
                <span className="text-[#7c6b69]">Clean, High-Legibility Sans-Serif for Body, Telemetry &amp; Forms</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 6: MVP Roadmap */}
      {activeSection === 'roadmap' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white border border-[#ead2ce] rounded-3xl p-8 shadow-xs space-y-6">
            <div className="border-b border-[#ead2ce] pb-4">
              <h2 className="font-serif text-2xl font-bold text-[#744241]">
                MVP Implementation Roadmap (Modules 1–12)
              </h2>
              <p className="text-xs text-[#7c6b69] mt-1">
                Defined in <code>/docs/mvp-scope.md</code>.
              </p>
            </div>

            <div className="divide-y divide-[#ead2ce]/40 text-xs">
              {[
                { mod: 'Module 1', name: 'System Analysis & Architecture', status: 'COMPLETED', desc: 'Database schema, RBAC, domain types, Zod validators, business services, design tokens' },
                { mod: 'Module 2', name: 'Public Website & UI/UX', status: 'Queued', desc: 'Homepage, About, Approach, Catalog layout with Playfair Display & Inter' },
                { mod: 'Module 3', name: 'Authentication & User Accounts', status: 'Queued', desc: 'Password hashing, session storage, customer portal, profile management' },
                { mod: 'Module 4', name: 'Product & Program Catalog', status: 'Queued', desc: 'Formulation catalog, strength/vial selection, CoA laboratory viewer' },
                { mod: 'Module 5', name: 'Partner Management', status: 'Queued', desc: 'Partner onboarding, unique Partner ID generation (WH-P-000001), approval workflows' },
                { mod: 'Module 6', name: 'Partner Pages & Referral Engine', status: 'Queued', desc: 'Dedicated /partner/:slug pages, co-branding, 30-day attribution tracking' },
                { mod: 'Module 7', name: 'Orders & Clinical Fulfillment', status: 'Queued', desc: 'Multi-tier volume savings (5%, 8%, 12%), cold-chain shipping logistics' },
                { mod: 'Module 8', name: 'Partner Dashboard & Ledger', status: 'Queued', desc: 'Real-time sales telemetry, CSV export, auditable commission earnings ledger' },
                { mod: 'Module 9', name: 'Executive Admin Dashboard', status: 'Queued', desc: 'Platform revenue metrics, partner approval/suspension queue' },
                { mod: 'Module 10', name: 'CMS & Educational Knowledgebase', status: 'Queued', desc: 'Admin content management for research studies, articles, FAQs' },
                { mod: 'Module 11', name: 'SEO & Analytics', status: 'Queued', desc: 'Meta cards, OpenGraph, JSON-LD clinical schemas, conversion tracking' },
                { mod: 'Module 12', name: 'Security Hardening & Deployment', status: 'Queued', desc: 'Rate limiting, pen-testing, audit verification, production container build' }
              ].map((m) => (
                <div key={m.mod} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#b87572]">{m.mod}:</span>
                      <span className="font-semibold text-[#744241]">{m.name}</span>
                    </div>
                    <p className="text-[#7c6b69] text-[11px] mt-0.5">{m.desc}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                    m.status === 'COMPLETED' ? 'bg-[#ead2ce] text-[#b87572]' : 'bg-[#fff6f3] text-[#7c6b69]'
                  }`}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
