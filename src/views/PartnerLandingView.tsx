import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService.ts';
import { Partner, Product, WellnessProgram } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';

interface PartnerLandingViewProps {
  slug: string;
  navigate: (path: string, param?: string) => void;
}

export const PartnerLandingView: React.FC<PartnerLandingViewProps> = ({ slug, navigate }) => {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [programs, setPrograms] = useState<WellnessProgram[]>([]);
  const [loading, setLoading] = useState(true);

  const { setReferral, addToCart, setIsOpen, activeReferral } = useCart();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const found = await dbService.getPartnerBySlug(slug);
        if (found) {
          setPartner(found);
          // Set referral tracking attribution
          setReferral({
            partnerId: found.id,
            partnerSlug: found.slug,
            partnerName: found.name,
            discountRate: found.memberDiscountRate || 0.15,
            commissionRate: found.commissionRate || 0.25,
            timestamp: Date.now()
          });

          // Load featured items
          const [allProds, allProgs] = await Promise.all([
            dbService.getProducts(),
            dbService.getPrograms()
          ]);
          setProducts(allProds.slice(0, 4));
          setPrograms(allProgs.slice(0, 2));
        }
      } catch (err) {
        console.error('Failed to load partner page', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 text-center text-[#7c6b69] space-y-3">
        <span className="w-8 h-8 border-2 border-[#b87572] border-t-transparent rounded-full animate-spin inline-block"></span>
        <p className="text-xs">Loading partner ecosystem...</p>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h2 className="font-serif text-2xl font-bold text-[#744241] mb-4">Partner Storefront Not Found</h2>
        <p className="text-xs text-[#7c6b69] mb-6">The partner link "/partner/{slug}" could not be verified.</p>
        <button
          onClick={() => navigate('partners')}
          className="px-6 py-2.5 rounded-xl bg-[#b87572] text-white text-xs font-semibold cursor-pointer"
        >
          View Partner Network
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. Co-Branded Hero Section */}
      <section className="bg-gradient-to-b from-[#fff6f3] to-[#fffdfb] border-b border-[#ead2ce] pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* VIP Referral Active Callout */}
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#b87572] text-[#fffdfb] text-xs font-semibold shadow-xs">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>
              Exclusive Member Privilege: <strong>{(partner.memberDiscountRate * 100).toFixed(0)}% Off</strong> all formulations automatically applied.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white border border-[#ead2ce] flex items-center justify-center text-[#b87572] shadow-xs">
                  <span className="material-symbols-outlined text-[32px]">fitness_center</span>
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-[#7c6b69] uppercase tracking-wider block">
                    Official Clinical Partner • {partner.partnerId}
                  </span>
                  <h1 className="font-serif text-3xl sm:text-5xl text-[#744241] font-bold">
                    {partner.name}
                  </h1>
                </div>
              </div>

              <p className="text-sm text-[#7c6b69] max-w-2xl leading-relaxed pt-2">
                {partner.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4 text-xs text-[#7c6b69]">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#b87572]">category</span>
                  <span>{partner.category}</span>
                </span>
                {partner.address && (
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#b87572]">location_on</span>
                    <span>{partner.address}</span>
                  </span>
                )}
                {partner.website && (
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-[#b87572] hover:underline"
                  >
                    <span className="material-symbols-outlined text-[16px]">language</span>
                    <span>Visit Partner Website</span>
                  </a>
                )}
              </div>
            </div>

            {/* Quality Seal Box */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#ead2ce] shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#b87572]/10 text-[#b87572] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">shield_with_heart</span>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#744241]">
                    Prescribed Quality Guarantee
                  </h4>
                  <p className="text-[11px] text-[#7c6b69]">Dispatched via Whole Harbor Central Lab</p>
                </div>
              </div>
              <ul className="text-xs text-[#7c6b69] space-y-2 border-t border-[#ead2ce]/50 pt-3">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#b87572]">check</span>
                  <span>Cold-Chain Insulated Shipping</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#b87572]">check</span>
                  <span>&gt;99.2% Certified HPLC Purity</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#b87572]">check</span>
                  <span>Direct Clinic Coordination</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Curated Recommended Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#7c6b69]">
            Formulations Recommended By {partner.name}
          </span>
          <h2 className="font-serif text-3xl text-[#744241] font-bold mt-1">
            Curated Member Protocols
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl border border-[#ead2ce] overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div 
                className="relative h-52 bg-[#fff6f3] cursor-pointer"
                onClick={() => navigate('product-detail', prod.slug)}
              >
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#b87572] text-white text-[10px] font-bold uppercase">
                  {(partner.memberDiscountRate * 100).toFixed(0)}% VIP Discount
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    onClick={() => navigate('product-detail', prod.slug)}
                    className="font-serif text-base font-semibold text-[#744241] hover:text-[#b87572] cursor-pointer"
                  >
                    {prod.name}
                  </h3>
                  <p className="text-xs text-[#7c6b69] line-clamp-2 mt-1">
                    {prod.shortDescription}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#ead2ce]/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#7c6b69] line-through block">
                      ${prod.price.toFixed(2)}
                    </span>
                    <span className="font-serif text-base font-bold text-[#b87572]">
                      ${(prod.price * (1 - partner.memberDiscountRate)).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      addToCart(prod, prod.strengths[0], 1);
                      setIsOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#b87572] text-white text-xs font-semibold hover:bg-[#744241] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Partner Programs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#7c6b69]">
            Supervised Tracks
          </span>
          <h2 className="font-serif text-3xl text-[#744241] font-bold mt-1">
            Supervised Practice Programs
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {programs.map((prog) => (
            <div
              key={prog.id}
              className="bg-[#fff6f3] border border-[#ead2ce] rounded-3xl p-6 flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#b87572] text-white">
                  {prog.tag}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#744241] mt-3">
                  {prog.name}
                </h3>
                <p className="text-xs text-[#7c6b69] mt-1">
                  {prog.shortDescription}
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#ead2ce] flex items-center justify-between">
                <span className="font-serif text-xl font-bold text-[#744241]">
                  ${prog.priceMonthly}/mo
                </span>
                <button
                  onClick={() => navigate('wellness-programs')}
                  className="px-4 py-2 rounded-xl bg-[#b87572] text-white text-xs font-semibold cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Partner CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#b87572] text-[#fffdfb] rounded-3xl p-8 text-center space-y-4">
          <h3 className="font-serif text-2xl font-bold">Questions Regarding Your Protocol?</h3>
          <p className="text-xs text-[#ead2ce] max-w-md mx-auto">
            Contact your care team at {partner.name} or consult our Whole Harbor clinical concierges.
          </p>
          <button
            onClick={() => navigate('shop')}
            className="px-6 py-3 rounded-xl bg-white text-[#b87572] text-xs font-semibold uppercase tracking-wider hover:bg-[#fffdfb] cursor-pointer"
          >
            Explore Full Catalog
          </button>
        </div>
      </section>

    </div>
  );
};
