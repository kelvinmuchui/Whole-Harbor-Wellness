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
  const [category, setCategory] = useState('Medical Spa & Aesthetics');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [createdPartner, setCreatedPartner] = useState<Partner | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate clean slug
      const slug = businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // Formatted ID
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
        address,
        description,
        status: 'PENDING',
        commissionRate: 0.25, // default 25%
        memberDiscountRate: 0.15, // default 15% VIP discount
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
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-[#c5a059]">
          Whole Harbor Partner Ecosystem
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#0c2340] font-bold">
          Empower Your Practice with Clinical Peptides
        </h1>
        <p className="text-xs sm:text-sm text-[#5a6b7c] leading-relaxed">
          Join leading wellness centers, athletic performance facilities, medical spas, and longevity clinics. 
          Provide your clients with tested formulations without holding costly inventory or managing cold-chain fulfillment.
        </p>
      </div>

      {/* 3 Core Value Props */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#f6f4ee] border border-[#dfd7c7] p-8 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#c5a059] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">storefront</span>
          </div>
          <h3 className="font-serif text-xl font-bold text-[#0c2340]">
            Dedicated Co-Branded Storefront
          </h3>
          <p className="text-xs text-[#5a6b7c] leading-relaxed">
            Your clinic receives a unique URL (e.g., <code>/partner/your-clinic</code>) with your branding, curated product recommendations, and custom patient discount rates.
          </p>
        </div>

        <div className="bg-[#f6f4ee] border border-[#dfd7c7] p-8 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#c5a059] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">payments</span>
          </div>
          <h3 className="font-serif text-xl font-bold text-[#0c2340]">
            20%–30% Transparent Commission
          </h3>
          <p className="text-xs text-[#5a6b7c] leading-relaxed">
            Earn recurring revenue share on every formulation and longevity protocol ordered by your patients, tracked live with automated monthly payouts.
          </p>
        </div>

        <div className="bg-[#f6f4ee] border border-[#dfd7c7] p-8 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#c5a059] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">inventory_2</span>
          </div>
          <h3 className="font-serif text-xl font-bold text-[#0c2340]">
            Zero Inventory or Cold-Storage
          </h3>
          <p className="text-xs text-[#5a6b7c] leading-relaxed">
            We handle pharmaceutical batch testing, sterile vial storage, and cold-pack overnight home delivery directly to your clients.
          </p>
        </div>
      </div>

      {/* Onboarding Form Section */}
      <div className="bg-white border border-[#dfd7c7] rounded-3xl p-8 sm:p-12 shadow-sm max-w-4xl mx-auto">
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
              Our clinical partnership team reviews all applications within 24 hours. You can preview your store or explore the partner portal below.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => navigate('partner-page', createdPartner.slug)}
                className="px-6 py-2.5 rounded-xl bg-[#c5a059] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0c2340] cursor-pointer"
              >
                Preview Co-Branded Store
              </button>
              <button
                onClick={() => navigate('partner-portal')}
                className="px-6 py-2.5 rounded-xl border border-[#dfd7c7] text-[#5a6b7c] text-xs font-semibold uppercase tracking-wider hover:bg-[#f6f4ee] cursor-pointer"
              >
                Access Partner Portal
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="border-b border-[#dfd7c7] pb-6 mb-6">
              <h2 className="font-serif text-2xl font-bold text-[#0c2340]">
                Partner Onboarding Application
              </h2>
              <p className="text-xs text-[#5a6b7c] mt-1">
                Complete the profile below to generate your unique Partner ID and referral ecosystem.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">
                    Business / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lumina Longevity Clinic"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">
                    Primary Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Elena Rostova"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="partners@clinic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">
                    Direct Phone Number *
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
                    Practice / Organization Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059] cursor-pointer"
                  >
                    <option value="Medical Spa & Aesthetics">Medical Spa &amp; Aesthetics</option>
                    <option value="Integrative & Longevity Medicine">Integrative &amp; Longevity Medicine</option>
                    <option value="Performance Gym & Athletics">Performance Gym &amp; Athletics</option>
                    <option value="Physical Therapy & Sports Rehab">Physical Therapy &amp; Sports Rehab</option>
                    <option value="Functional Medicine Clinic">Functional Medicine Clinic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#5a6b7c] font-medium mb-1">
                    Facility Physical Address
                  </label>
                  <input
                    type="text"
                    placeholder="100 Wellness Way, Suite 400, Austin, TX 78701"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#5a6b7c] font-medium mb-1">
                    Practice Description &amp; Patient Demographic *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Briefly describe your practice and the primary protocols your patients seek..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-[#c5a059]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#c5a059] text-[#fffdfb] text-xs font-semibold uppercase tracking-wider hover:bg-[#0c2340] disabled:opacity-50 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span>Registering Partner Profile...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      <span>Submit Application &amp; Generate Partner ID</span>
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
