import React, { useState } from 'react';
import { dbService } from '../services/dbService.ts';
import { Partner } from '../types/index.ts';

interface PartnersViewProps {
  navigate: (path: string, param?: string) => void;
}

export const PartnersView: React.FC<PartnersViewProps> = ({ navigate }) => {
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Fitness / Yoga Studio');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [populationServed, setPopulationServed] = useState('');
  const [memberBaseSize, setMemberBaseSize] = useState('');
  const [currentWellnessServices, setCurrentWellnessServices] = useState('');
  const [whyPartner, setWhyPartner] = useState('');
  const [marketingStrategy, setMarketingStrategy] = useState('');
  const [promotionPlan, setPromotionPlan] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [createdPartner, setCreatedPartner] = useState<Partner | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return;
    setLoading(true);

    try {
      const slug = businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const count = await dbService.getPartners().then((p) => p.length);
      const partnerId = `WH-P-${String(count + 1).padStart(6, '0')}`;

      const partnerData: Omit<Partner, 'id'> = {
        partnerId,
        name: businessName,
        slug,
        contactPerson,
        email,
        phone,
        category,
        website,
        location,
        address: address || location,
        populationServed,
        memberBaseSize,
        currentWellnessServices,
        whyPartner,
        marketingStrategy,
        promotionPlan,
        description: whyPartner || currentWellnessServices || `${category} serving ${populationServed}`,
        agreedToTerms: true,
        agreedAt: new Date().toISOString(),
        status: 'NEW',
        commissionRate: 0.25,
        memberDiscountRate: 0.15,
        createdAt: new Date().toISOString()
      };

      const partner = await dbService.createPartner(partnerData);
      setCreatedPartner(partner);
    } catch (err) {
      console.error('Failed to submit partner application', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero Header */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-[#c5a059]">
          WHOLE HARBOR → YOUR WELLNESS JOURNEY → PARTNER WITH US
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#0c2340] font-bold">
          BRING WHOLE HARBOR WELLNESS TO YOUR COMMUNITY
        </h1>
        <p className="font-serif text-lg sm:text-xl text-[#c5a059] font-medium">
          Your Community. Your Brand. Our Wellness Infrastructure.
        </p>
        <div className="text-xs sm:text-sm text-[#5a6b7c] leading-relaxed space-y-3 max-w-3xl mx-auto pt-2">
          <p className="font-semibold text-[#0c2340]">You already have something valuable: People who trust you.</p>
          <p>
            Maybe you run a fitness studio, yoga studio, wellness practice, gym, coaching business, athletic organization, community program or another business serving people who care about their health.
          </p>
          <p>
            Whole Harbor gives you an opportunity to expand the wellness resources you can offer your community—without having to build the entire infrastructure yourself.
          </p>
        </div>
      </div>

      {/* Become a Partner Callout */}
      <div className="bg-[#0c2340] text-white rounded-3xl p-8 sm:p-10 shadow-lg max-w-4xl mx-auto text-center space-y-4 border border-[#c5a059]/40">
        <span className="text-xs uppercase font-bold tracking-widest text-[#c5a059] block">
          BECOME A WHOLE HARBOR PARTNER
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold">
          We'll help provide the infrastructure behind the experience.
        </h2>
        <p className="text-sm text-[#dfd7c7] max-w-xl mx-auto">
          You bring the relationship. We help build the platform.
        </p>
        <div className="pt-2">
          <a
            href="#partner-form"
            className="inline-block px-8 py-3 rounded-xl bg-[#c5a059] text-white text-xs font-semibold uppercase tracking-wider hover:bg-white hover:text-[#0c2340] transition-colors shadow-sm"
          >
            Apply to Become a Partner ↓
          </a>
        </div>
      </div>

      {/* WHAT YOUR PARTNERSHIP CAN INCLUDE - 5 Cards */}
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase font-bold tracking-widest text-[#c5a059]">
            PARTNERSHIP INFRASTRUCTURE
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-[#0c2340] font-bold">
            WHAT YOUR PARTNERSHIP CAN INCLUDE
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {/* Card 1 */}
          <div className="bg-[#f6f4ee] border border-[#dfd7c7] p-7 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#c5a059] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">storefront</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0c2340]">
              A BRANDED WELLNESS EXPERIENCE
            </h3>
            <p className="text-xs text-[#5a6b7c] leading-relaxed">
              We can help create a Whole Harbor-powered landing page designed around your business and your audience.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#f6f4ee] border border-[#dfd7c7] p-7 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#c5a059] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">link</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0c2340]">
              YOUR OWN UNIQUE LINK
            </h3>
            <p className="text-xs text-[#5a6b7c] leading-relaxed">
              Your clients can access your wellness experience through a dedicated link associated with your organization.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#f6f4ee] border border-[#dfd7c7] p-7 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#c5a059] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">analytics</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0c2340]">
              TRANSPARENT SALES TRACKING
            </h3>
            <p className="text-xs text-[#5a6b7c] leading-relaxed">
              Partners receive access to reporting that allows them to see eligible activity and sales generated through their referral channel.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#f6f4ee] border border-[#dfd7c7] p-7 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#c5a059] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">campaign</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0c2340]">
              MARKETING SUPPORT
            </h3>
            <p className="text-xs text-[#5a6b7c] leading-relaxed">
              We'll provide approved educational materials, digital resources, QR codes and promotional tools to help you introduce the program to your community.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-[#f6f4ee] border border-[#dfd7c7] p-7 rounded-3xl space-y-3 md:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 rounded-2xl bg-[#c5a059] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">support_agent</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0c2340]">
              ONGOING SUPPORT
            </h3>
            <p className="text-xs text-[#5a6b7c] leading-relaxed">
              You won't simply receive a link and be left on your own. Whole Harbor is building a partnership model designed to provide ongoing resources, education and support.
            </p>
          </div>
        </div>
      </div>

      {/* Narrative Section: YOU FOCUS ON YOUR COMMUNITY */}
      <div className="bg-gradient-to-r from-[#f6f4ee] via-white to-[#f6f4ee] border border-[#dfd7c7] rounded-3xl p-8 sm:p-12 shadow-xs max-w-4xl mx-auto space-y-4 text-center">
        <span className="text-xs uppercase font-bold tracking-widest text-[#c5a059]">
          SHARED VISION
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0c2340]">
          YOU FOCUS ON YOUR COMMUNITY.<br />
          WE HELP POWER THE WELLNESS EXPERIENCE BEHIND IT.
        </h2>
        <p className="text-xs sm:text-sm text-[#5a6b7c] leading-relaxed max-w-2xl mx-auto">
          Whether you're a fitness professional looking to expand your services, a yoga studio looking for new wellness resources, a coach serving a growing community or an organization looking for additional ways to support the people you serve, Whole Harbor can help you create a more connected wellness experience.
        </p>
        <p className="text-sm sm:text-base font-serif font-bold text-[#0c2340] pt-2">
          Your clients already trust you.<br />
          <span className="text-[#c5a059]">Let's give them another reason to keep moving forward.</span>
        </p>
      </div>

      {/* DEDICATED LINKS EXPLANATION: Individual Buyers vs Partner Buyers */}
      <div className="bg-white border-2 border-[#c5a059]/40 rounded-3xl p-8 sm:p-10 shadow-sm max-w-5xl mx-auto space-y-6">
        <div className="border-b border-[#dfd7c7] pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/20 text-[#0c2340] text-xs font-semibold mb-2">
            <span className="material-symbols-outlined text-[16px]">link</span>
            <span>Dedicated Links Architecture</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#0c2340]">
            Separate Links for Individual Buyers vs. Partner Buyers
          </h3>
          <p className="text-xs sm:text-sm text-[#5a6b7c] mt-1">
            Individual direct consumers and partner-referred clients do <strong>not</strong> use the same link. Each channel has its own dedicated URL, storefront branding, and pricing structure:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Individual Buyer Link */}
          <div className="p-6 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7] space-y-3 flex flex-col justify-between">
            <div>
              <span className="px-2.5 py-1 rounded-full bg-[#0c2340] text-white text-[10px] font-bold uppercase tracking-wider inline-block mb-2">
                1. Individual Direct Buyer Link
              </span>
              <h4 className="font-serif text-lg font-bold text-[#0c2340]">Direct Public Store</h4>
              <p className="text-[#5a6b7c] leading-relaxed mt-1">
                For independent consumers discovering Whole Harbor directly. Unaffiliated public retail catalog without partner branding.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <div className="bg-white p-2.5 rounded-xl border border-[#dfd7c7] font-mono text-[11px] text-[#0c2340] break-all">
                {window.location.origin}/#/shop
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/#/shop`);
                  alert('Copied Direct Individual Buyer link to clipboard!');
                }}
                className="w-full py-2 rounded-lg bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer"
              >
                Copy Direct Store Link
              </button>
            </div>
          </div>

          {/* Partner Buyer Link */}
          <div className="p-6 rounded-2xl bg-[#fffdfb] border-2 border-[#c5a059] space-y-3 flex flex-col justify-between shadow-xs">
            <div>
              <span className="px-2.5 py-1 rounded-full bg-[#c5a059] text-white text-[10px] font-bold uppercase tracking-wider inline-block mb-2">
                2. Partner Buyer Dedicated Link
              </span>
              <h4 className="font-serif text-lg font-bold text-[#0c2340]">Co-Branded Client Experience</h4>
              <p className="text-[#5a6b7c] leading-relaxed mt-1">
                For your studio, gym, or clinic clients. Opens your dedicated partner landing page with your logo, welcome message, automated 15% VIP discount, and 30-day attribution.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <div className="bg-[#f6f4ee] p-2.5 rounded-xl border border-[#dfd7c7] font-mono text-[11px] text-[#c5a059] font-bold break-all">
                {window.location.origin}/#/partner/your-organization
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/#/partner/apex-wellness`);
                  alert('Copied sample Partner Dedicated Client link to clipboard!');
                }}
                className="w-full py-2 rounded-lg bg-[#c5a059] text-white text-xs font-semibold hover:bg-[#0c2340] transition-colors cursor-pointer"
              >
                Copy Sample Partner Link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Form Section */}
      <div id="partner-form" className="bg-white border border-[#dfd7c7] rounded-3xl p-8 sm:p-12 shadow-sm max-w-4xl mx-auto">
        {createdPartner ? (
          <div className="text-center py-8 space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#dfd7c7] text-[#c5a059] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-[#c5a059] text-white text-xs font-semibold uppercase tracking-wider">
                Application Submitted
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#0c2340] mt-3">
                Welcome, {createdPartner.name}!
              </h3>
              <p className="text-xs text-[#5a6b7c] mt-1">
                Your assigned Partner ID: <strong className="text-[#0c2340] font-mono">{createdPartner.partnerId}</strong>
              </p>
            </div>

            <div className="bg-[#fffdfb] p-4 rounded-2xl border border-[#dfd7c7] text-left text-xs max-w-md mx-auto space-y-2">
              <div className="flex justify-between">
                <span className="text-[#5a6b7c]">Partner Slug:</span>
                <span className="font-mono text-[#c5a059]">/partner/{createdPartner.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a6b7c]">Status:</span>
                <span className="font-semibold text-[#c5a059]">{createdPartner.status} (Pending Admin Review)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a6b7c]">Commission Rate:</span>
                <span className="font-semibold text-[#0c2340]">{(createdPartner.commissionRate * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a6b7c]">Patient Discount:</span>
                <span className="font-semibold text-[#0c2340]">{(createdPartner.memberDiscountRate * 100).toFixed(0)}% Off</span>
              </div>
            </div>

            <p className="text-xs text-[#5a6b7c] max-w-md mx-auto">
              Your application has been logged with status <strong>NEW</strong>. Our partnership review team evaluates all applications before granting wholesale &amp; co-branded storefront access.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => navigate('partner-portal')}
                className="px-6 py-2.5 rounded-xl bg-[#c5a059] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0c2340] cursor-pointer"
              >
                Explore Partner Portal
              </button>
              <button
                onClick={() => navigate('shop')}
                className="px-6 py-2.5 rounded-xl border border-[#dfd7c7] text-[#5a6b7c] text-xs font-semibold uppercase tracking-wider hover:bg-[#f6f4ee] cursor-pointer"
              >
                Return to Storefront
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="border-b border-[#dfd7c7] pb-6 mb-6">
              <span className="text-[11px] uppercase font-bold tracking-widest text-[#c5a059] block mb-1">
                Partner Application
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#0c2340]">
                Become a Whole Harbor Partner
              </h2>
              <p className="text-xs text-[#5a6b7c] mt-1">
                Complete all required fields below. Applications enter our review queue (Status: NEW) and wholesale access is provisioned upon approval.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {/* Section 1: Organization & Contact */}
              <div className="space-y-4">
                <h3 className="font-serif text-sm font-bold text-[#0c2340] border-b border-[#dfd7c7]/60 pb-1.5">
                  1. Organization &amp; Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">
                      1. Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Harbor Peak Fitness &amp; Wellness"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">
                      2. Owner / Primary Contact *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Full Name &amp; Title"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">
                      3. Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="partners@organization.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">
                      4. Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">
                      5. Website
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">
                      6. Business Type *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059] cursor-pointer"
                    >
                      <option value="Fitness / Yoga Studio">Fitness / Yoga Studio</option>
                      <option value="Wellness Practice / Clinic">Wellness Practice / Clinic</option>
                      <option value="Gym / Athletic Organization">Gym / Athletic Organization</option>
                      <option value="Health &amp; Wellness Coaching">Health &amp; Wellness Coaching</option>
                      <option value="Medical Spa &amp; Aesthetics">Medical Spa &amp; Aesthetics</option>
                      <option value="Community Health Program">Community Health Program</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">
                      7. Location (City, State / Region) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Austin, TX"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">
                      Street Address (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="100 Wellness Way, Suite 400"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Community & Wellness Profile */}
              <div className="space-y-4">
                <h3 className="font-serif text-sm font-bold text-[#0c2340] border-b border-[#dfd7c7]/60 pb-1.5">
                  2. Community &amp; Wellness Profile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">
                      8. Population Served *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Active adults, endurance athletes, longevity seekers"
                      value={populationServed}
                      onChange={(e) => setPopulationServed(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">
                      9. Approximate Customer / Member Base *
                    </label>
                    <select
                      required
                      value={memberBaseSize}
                      onChange={(e) => setMemberBaseSize(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059] cursor-pointer"
                    >
                      <option value="">Select member base size...</option>
                      <option value="Under 100">Under 100 members</option>
                      <option value="100 - 500">100 – 500 members</option>
                      <option value="500 - 1,500">500 – 1,500 members</option>
                      <option value="1,500 - 5,000">1,500 – 5,000 members</option>
                      <option value="5,000+">5,000+ members</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[#5a6b7c] font-medium mb-1">
                      10. Current Wellness Services *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Describe the wellness, fitness, recovery, or coaching services you currently offer..."
                      value={currentWellnessServices}
                      onChange={(e) => setCurrentWellnessServices(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Partnership Alignment & Promotion */}
              <div className="space-y-4">
                <h3 className="font-serif text-sm font-bold text-[#0c2340] border-b border-[#dfd7c7]/60 pb-1.5">
                  3. Partnership Alignment &amp; Promotion Plan
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">
                      11. Why You Want to Partner with Whole Harbor *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Share your goals for partnering with Whole Harbor Wellness..."
                      value={whyPartner}
                      onChange={(e) => setWhyPartner(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">
                      12. Marketing Strategy *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Describe your primary marketing channels (email newsletters, in-studio signage, social media, workshops)..."
                      value={marketingStrategy}
                      onChange={(e) => setMarketingStrategy(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">
                      13. How You Intend to Promote Whole Harbor *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="How will you introduce your dedicated Whole Harbor link and educational resources to your community?"
                      value={promotionPlan}
                      onChange={(e) => setPromotionPlan(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                    />
                  </div>
                </div>
              </div>

              {/* 14. Agreement Checkbox */}
              <div className="p-4 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7]">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#c5a059] rounded cursor-pointer"
                  />
                  <span className="text-xs text-[#0c2340] leading-relaxed">
                    <strong>14. Partner Program Agreement *:</strong> I confirm that the information provided is accurate and I agree to represent Whole Harbor Wellness educational materials and referral links in accordance with brand and compliance guidelines. I understand that submitting this application does not automatically grant wholesale access until reviewed and approved.
                  </span>
                </label>
              </div>

              {/* 15. Submit Application Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !agreedToTerms}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#c5a059] text-[#fffdfb] text-xs font-semibold uppercase tracking-wider hover:bg-[#0c2340] disabled:opacity-50 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      <span>15. Submit Partner Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

    </div>
  );
};
