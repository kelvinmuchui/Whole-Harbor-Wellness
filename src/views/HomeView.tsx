import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../services/dbService.ts';
import { Product, WellnessProgram, Testimonial, FAQ } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';

interface HomeViewProps {
  navigate: (path: string, param?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ navigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [programs, setPrograms] = useState<WellnessProgram[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [activeFaqId, setActiveFaqId] = useState<string | null>('faq-1');

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Quick concierge message state
  const [quickContactSent, setQuickContactSent] = useState(false);
  const [quickEmail, setQuickEmail] = useState('');
  const [quickMessage, setQuickMessage] = useState('');

  const { addToCart, setIsOpen } = useCart();

  useEffect(() => {
    const load = async () => {
      try {
        const [prods, progs, tests, faqData] = await Promise.all([
          dbService.getProducts(),
          dbService.getPrograms(),
          dbService.getTestimonials(),
          dbService.getFaqs()
        ]);
        setProducts(prods);
        setPrograms(progs);
        setTestimonials(tests);
        setFaqs(faqData);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEmail) return;
    setQuickContactSent(true);
  };

  const filteredCatalog = useMemo(() => {
    return products.filter(p => {
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="space-y-12">
      {/* 1. Hero Section */}
      <section className="hero" id="shop">
        <img
          src="/images/editorial-hero.png"
          alt="Premium wellness products in a warm editorial setting"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div className="hero-overlay"></div>
        <div className="hero-copy">
          <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#dfd7c7] shadow-xs mb-3.5">
            <img src="/images/whw-logo.png" alt="Whole Harbor Wellness" className="w-8 h-8 sm:w-9 sm:h-9 object-contain" />
            <span className="font-serif font-bold text-xs sm:text-sm text-[#0c2340] tracking-tight">Whole Harbor <span className="text-[#c5a059] font-sans text-[10px] uppercase font-bold tracking-widest">Wellness</span></span>
          </div>
          <h1>
            Feel Your Best,<br />
            <em>Beautifully.</em>
          </h1>
          <p>
            Pharmaceutical-grade peptide protocols, unbroken cold-chain delivery, and personal guidance from first question to every reorder.
          </p>
          <div className="hero-actions">
            <a
              className="primary cursor-pointer"
              href="#catalog"
              onClick={(e) => {
                e.preventDefault();
                scrollToCatalog();
              }}
            >
              Explore Catalog <span>→</span>
            </a>
            <a
              className="secondary cursor-pointer"
              href="#learn"
              onClick={(e) => {
                e.preventDefault();
                navigate('learn');
              }}
            >
              Education Studio
            </a>
          </div>
        </div>
      </section>

      {/* 2. Wellness Goals Pills */}
      <section className="goals">
        <button
          onClick={() => {
            setSelectedCategory('cellular');
            scrollToCatalog();
          }}
        >
          <span>⚡</span>
          Energy &amp; Stamina
        </button>
        <button
          onClick={() => {
            setSelectedCategory('recovery');
            scrollToCatalog();
          }}
        >
          <span>💧</span>
          Recovery &amp; Repair
        </button>
        <button
          onClick={() => {
            setSelectedCategory('longevity');
            scrollToCatalog();
          }}
        >
          <span>🌿</span>
          Calm &amp; Sleep
        </button>
        <button
          onClick={() => {
            setSelectedCategory('metabolic');
            scrollToCatalog();
          }}
        >
          <span>✨</span>
          Metabolic Balance
        </button>
      </section>

      {/* 3. Section Head: Best Sellers */}
      <section className="section-head" id="best-sellers">
        <div>
          <h2>Best Sellers</h2>
          <p className="text-xs text-[var(--muted)] mt-1">
            Independently verified with high-performance liquid chromatography and mass spectrometry.
          </p>
        </div>
        <a
          href="#catalog"
          onClick={(e) => {
            e.preventDefault();
            scrollToCatalog();
          }}
          className="cursor-pointer"
        >
          View all {products.length || 103} options →
        </a>
      </section>

      {/* 4. Product Grid (Featured Trio with Authentic Assets) */}
      <section className="product-grid">
        {/* SEMAGLUTIDE */}
        <article className="product-card">
          <div className="product-image">
            <img
              src="/images/featured-semaglutide.png"
              alt="SEMAGLUTIDE"
              className="w-full h-full object-cover"
            />
            <span>Most Popular</span>
          </div>
          <div className="product-info">
            <h3 className="font-serif text-xl font-semibold text-[var(--deep)] mb-1">SEMAGLUTIDE</h3>
            <p className="text-xs text-[var(--muted)] mb-3 line-clamp-2">
              Dual-action GLP-1 receptor agonist studied for appetite regulation and metabolic balance.
            </p>
            <div className="strength">
              <span>Option</span>
              <b>5mg • 10 vials</b>
            </div>
            <div className="price-row">
              <div>
                <small className="text-[10px] text-[var(--muted)] block">From</small>
                <strong>$145.00</strong>
              </div>
              <button
                onClick={() => navigate('product-detail', 'semaglutide-b12')}
                className="cursor-pointer"
              >
                View Options →
              </button>
            </div>
          </div>
        </article>

        {/* BPC-157 */}
        <article className="product-card">
          <div className="product-image">
            <img
              src="/images/featured-bpc157-clean.png"
              alt="BPC-157"
              className="w-full h-full object-cover"
            />
            <span>Clinician Choice</span>
          </div>
          <div className="product-info">
            <h3 className="font-serif text-xl font-semibold text-[var(--deep)] mb-1">BPC-157</h3>
            <p className="text-xs text-[var(--muted)] mb-3 line-clamp-2">
              Synthesized pentadecapeptide studied for tendon, ligament, and gut mucosal tissue repair.
            </p>
            <div className="strength">
              <span>Option</span>
              <b>10mg • 10 vials</b>
            </div>
            <div className="price-row">
              <div>
                <small className="text-[10px] text-[var(--muted)] block">From</small>
                <strong>$165.00</strong>
              </div>
              <button
                onClick={() => navigate('product-detail', 'bpc-157-tb-500')}
                className="cursor-pointer"
              >
                View Options →
              </button>
            </div>
          </div>
        </article>

        {/* MOTS-C */}
        <article className="product-card">
          <div className="product-image">
            <img
              src="/images/featured-motsc.png"
              alt="MOTS-C"
              className="w-full h-full object-cover"
            />
            <span>Mitochondrial</span>
          </div>
          <div className="product-info">
            <h3 className="font-serif text-xl font-semibold text-[var(--deep)] mb-1">MOTS-C</h3>
            <p className="text-xs text-[var(--muted)] mb-3 line-clamp-2">
              Mitochondrial-derived 16-amino acid peptide for intracellular AMPK bioenergetics and resilience.
            </p>
            <div className="strength">
              <span>Option</span>
              <b>20mg • 10 vials</b>
            </div>
            <div className="price-row">
              <div>
                <small className="text-[10px] text-[var(--muted)] block">From</small>
                <strong>$285.00</strong>
              </div>
              <button
                onClick={() => navigate('product-detail', 'mots-c-activator')}
                className="cursor-pointer"
              >
                View Options →
              </button>
            </div>
          </div>
        </article>
      </section>

      {/* 5. Savings Strip (Multi-tier volume discounts) */}
      <section className="savings-strip">
        <div>
          <b>5% OFF</b>
          <span>2+ KITS</span>
        </div>
        <div>
          <b>10% OFF</b>
          <span>3+ KITS</span>
        </div>
        <div>
          <b>15% OFF</b>
          <span>5+ KITS</span>
        </div>
        <div>
          <b>20% OFF</b>
          <span>10+ KITS</span>
        </div>
      </section>

      {/* 6. Full Catalog Section */}
      <section className="catalog-section" id="catalog">
        <div className="catalog-heading flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <p className="eyebrow text-xs uppercase tracking-widest text-[var(--rose)] font-bold mb-1">
              FORMULATION CATALOG
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[var(--deep)]">
              Curated Peptide Portfolio
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-white border border-[var(--line)] rounded-full px-4 py-2 w-full md:w-80 shadow-2xs">
            <span className="material-symbols-outlined text-[18px] text-[var(--muted)]">search</span>
            <input
              type="text"
              placeholder="Search formulations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-transparent outline-none text-[var(--ink)] placeholder:text-[var(--muted)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[var(--muted)] hover:text-[var(--deep)] cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {[
            { id: 'all', label: 'All Formulations' },
            { id: 'metabolic', label: 'Metabolic Support' },
            { id: 'cellular', label: 'Cellular Optimization' },
            { id: 'recovery', label: 'Tissue Recovery' },
            { id: 'longevity', label: 'Longevity & Sleep' },
            { id: 'stacks', label: 'Synergy Multi-Kits' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[var(--deep)] text-white shadow-xs'
                  : 'bg-white border border-[var(--line)] text-[var(--muted)] hover:text-[var(--deep)] hover:bg-[var(--blush)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Catalog Grid */}
        <div className="catalog-grid">
          {filteredCatalog.map(prod => (
            <article key={prod.id} className="catalog-card">
              <div className="catalog-card-head">
                <h3 
                  onClick={() => navigate('product-detail', prod.slug)}
                  className="cursor-pointer hover:text-[var(--rose)] transition-colors"
                >
                  {prod.name}
                </h3>
                <span>{prod.strengths.length} options</span>
              </div>
              <div className="catalog-purpose">
                <span>{prod.categoryLabel}</span>
                <p>{prod.shortDescription}</p>
                <button
                  onClick={() => navigate('product-detail', prod.slug)}
                  className="cursor-pointer"
                >
                  Learn more <b>→</b>
                </button>
              </div>

              {/* Variant List */}
              <div className="variant-list">
                {prod.strengths.map((str, idx) => (
                  <div key={idx}>
                    <span>
                      <b>{str.label.split('/')[0].trim()}</b>
                      <small>{str.vialsCount} vials • HPLC {prod.purity}</small>
                    </span>
                    <span className="variant-price">
                      <strong>${str.price.toFixed(2)}</strong>
                      <small>${(str.pricePerVial ?? (str.price / (str.vialsCount || 1))).toFixed(2)} / vial</small>
                    </span>
                    <button
                      onClick={() => {
                        addToCart(prod, str, 1);
                        setIsOpen(true);
                      }}
                      aria-label={`Add ${prod.name} ${str.label} to cart`}
                      title="Quick Add to Cart"
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        {filteredCatalog.length === 0 && (
          <div className="no-results my-8 text-center py-12">
            <h3 className="font-serif text-2xl font-bold text-[var(--deep)] mb-2">
              No matching formulations
            </h3>
            <p className="text-xs text-[var(--muted)] mb-4">
              Try adjusting your search criteria or category filter.
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="px-4 py-2 rounded-xl bg-[var(--rose)] text-white text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* 7. About Whole Harbor Wellness Story Teaser */}
      <section className="bg-gradient-to-br from-[#f6f4ee] to-white border border-[#dfd7c7] rounded-3xl p-8 sm:p-12 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs uppercase font-bold tracking-widest text-[#c5a059]">
              About Whole Harbor Wellness
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#0c2340] font-bold">
              Restoring Clinical Integrity to Longevity Medicine
            </h2>
            <p className="text-xs sm:text-sm text-[#5a6b7c] leading-relaxed">
              Founded by clinical chemists and functional physicians, Whole Harbor Wellness eliminates the safety hazards of unregulated online research vendors. We provide certified cGMP solid-phase synthesized peptides, unbroken cold-chain temperature telemetry, and seamless physician protocol alignment.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-white/80 border border-[#dfd7c7] p-4 rounded-2xl">
                <span className="font-serif text-2xl font-bold text-[#0c2340] block">≥ 99.4%</span>
                <span className="text-[11px] text-[#5a6b7c]">Single-Peak HPLC Assay</span>
              </div>
              <div className="bg-white/80 border border-[#dfd7c7] p-4 rounded-2xl">
                <span className="font-serif text-2xl font-bold text-[#0c2340] block">2°C – 8°C</span>
                <span className="text-[11px] text-[#5a6b7c]">Monitored Cold-Chain Transit</span>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => navigate('about')}
                className="px-6 py-3 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <span>Read Full About Story</span>
                <span>→</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-[#dfd7c7] p-6 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-[#c5a059]">
                <span className="material-symbols-outlined text-[20px]">science</span>
                <h4 className="font-serif font-bold text-sm text-[#0c2340]">Third-Party Certified CoAs</h4>
              </div>
              <p className="text-xs text-[#5a6b7c]">
                Every batch lot number is tied to public Mass Spectrometry and Counter-Ion testing certificates.
              </p>
            </div>

            <div className="bg-white border border-[#dfd7c7] p-6 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-[#c5a059]">
                <span className="material-symbols-outlined text-[20px]">thermostat</span>
                <h4 className="font-serif font-bold text-sm text-[#0c2340]">Thermal Integrity Guarantee</h4>
              </div>
              <p className="text-xs text-[#5a6b7c]">
                Fragile amino acid chains never experience ambient transit denaturing. Phase-change packs in every box.
              </p>
            </div>

            <div className="bg-white border border-[#dfd7c7] p-6 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-[#c5a059]">
                <span className="material-symbols-outlined text-[20px]">handshake</span>
                <h4 className="font-serif font-bold text-sm text-[#0c2340]">Turnkey Clinic Network</h4>
              </div>
              <p className="text-xs text-[#5a6b7c]">
                Over 60+ partner medical spas and functional wellness practices trust Whole Harbor for patient therapeutics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Our Clinical Approach (4-Pillars Preview) */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest text-[#c5a059]">
            Methodology &amp; Standards
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-[#0c2340] font-bold">
            The Whole Harbor Clinical Approach
          </h2>
          <p className="text-xs sm:text-sm text-[#5a6b7c]">
            A rigorous 4-step framework guaranteeing pharmaceutical purity and biological potency.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#f6f4ee] border border-[#dfd7c7] p-6 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#c5a059] text-white flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0c2340]">Verified Synthesis</h3>
            <p className="text-xs text-[#5a6b7c] leading-relaxed">
              cGMP cleanroom facilities utilizing solid-phase synthesis and certified counter-ion exchange.
            </p>
          </div>

          <div className="bg-[#f6f4ee] border border-[#dfd7c7] p-6 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#c5a059] text-white flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0c2340]">Dual Assay Testing</h3>
            <p className="text-xs text-[#5a6b7c] leading-relaxed">
              High-Performance Liquid Chromatography (HPLC) and Mass Spectrometry for &gt;99.2% purity.
            </p>
          </div>

          <div className="bg-[#f6f4ee] border border-[#dfd7c7] p-6 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#c5a059] text-white flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0c2340]">Active Cold-Chain</h3>
            <p className="text-xs text-[#5a6b7c] leading-relaxed">
              Medical-grade insulated containers with phase-change cold packs prevent thermal denaturing.
            </p>
          </div>

          <div className="bg-[#f6f4ee] border border-[#dfd7c7] p-6 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#c5a059] text-white flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0c2340]">Physician Oversight</h3>
            <p className="text-xs text-[#5a6b7c] leading-relaxed">
              Integrated protocols with partner physicians ensure correct patient titration and biometric feedback.
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => navigate('approach')}
            className="px-6 py-2.5 rounded-xl border border-[#dfd7c7] bg-white text-[#0c2340] text-xs font-semibold hover:bg-[#f6f4ee] transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <span>Compare Clinical Specifications vs Online Research Vendors</span>
            <span>→</span>
          </button>
        </div>
      </section>

      {/* 9. Physician-Guided Wellness Programs Preview */}
      <section className="bg-white border border-[#dfd7c7] rounded-3xl p-8 sm:p-12 shadow-xs space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#c5a059]">
              Supervised Healthcare
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#0c2340] font-bold mt-1">
              Physician-Guided Longevity Programs
            </h2>
            <p className="text-xs text-[#5a6b7c] mt-1 max-w-xl">
              Turnkey clinical protocols combining verified peptides, lab biomarker baseline testing, and continuous physician consultation.
            </p>
          </div>
          <button
            onClick={() => navigate('wellness-programs')}
            className="px-5 py-2.5 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer whitespace-nowrap self-start md:self-auto"
          >
            View All Programs →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.slice(0, 2).map((prog) => (
            <div
              key={prog.id}
              className="bg-[#f6f4ee] border border-[#dfd7c7] rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:shadow-md transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#c5a059] text-white text-[11px] font-bold uppercase tracking-wider">
                    {prog.tag}
                  </span>
                  <span className="text-xs text-[#5a6b7c] font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    {prog.duration}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-xl font-bold text-[#0c2340]">{prog.name}</h3>
                  <p className="text-xs text-[#5a6b7c] mt-1.5 leading-relaxed">
                    {prog.shortDescription}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#dfd7c7]/60 text-xs text-[#0c2340]">
                  {prog.features.slice(0, 3).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#c5a059]">verified</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#dfd7c7] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#5a6b7c] block">Supervised Protocol</span>
                  <span className="font-serif text-xl font-bold text-[#0c2340]">
                    ${prog.priceMonthly}
                    <span className="text-xs font-normal text-[#5a6b7c]"> / mo</span>
                  </span>
                </div>
                <button
                  onClick={() => navigate('wellness-programs')}
                  className="px-4 py-2 rounded-xl bg-[#c5a059] text-white text-xs font-semibold hover:bg-[#0c2340] transition-colors cursor-pointer"
                >
                  Learn &amp; Enroll →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Clinician & Member Testimonials */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-[#c5a059]">
            Clinical Endorsements
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-[#0c2340] font-bold">
            Voices from Our Medical Network
          </h2>
          <p className="text-xs text-[#5a6b7c]">
            Over 2,400+ members and 60+ partner medical spas trust Whole Harbor Wellness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-[#dfd7c7] rounded-3xl p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-[#c5a059] mb-3">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[16px]">star</span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#5a6b7c] italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-[#dfd7c7]/50">
                <h4 className="font-serif font-bold text-sm text-[#0c2340]">{t.name}</h4>
                <p className="text-[11px] text-[#5a6b7c]">{t.role} • {t.organization}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 11. Interactive Frequently Asked Questions (FAQ) Accordion on Homepage */}
      <section className="bg-[#f6f4ee] border border-[#dfd7c7] rounded-3xl p-6 sm:p-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#c5a059]">
              Knowledge Base
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0c2340] mt-1">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-[#5a6b7c] mt-1">
              Everything you need to know about peptide reconstitution, cold-chain delivery, and medical protocols.
            </p>
          </div>
          <button
            onClick={() => navigate('faq')}
            className="px-5 py-2.5 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] text-xs font-semibold hover:bg-[#fffdfb] transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap"
          >
            Explore Full FAQ &amp; Search →
          </button>
        </div>

        <div className="space-y-3">
          {faqs.slice(0, 4).map((faq) => {
            const isExpanded = activeFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white border border-[#dfd7c7] rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaqId(isExpanded ? null : faq.id)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-[#c5a059]">
                      {faq.category}
                    </span>
                    <h3 className="font-serif text-base font-bold text-[#0c2340]">
                      {faq.question}
                    </h3>
                  </div>
                  <span className={`material-symbols-outlined text-[20px] text-[#c5a059] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                {isExpanded && (
                  <div className="px-5 pb-5 text-xs text-[#5a6b7c] leading-relaxed border-t border-[#dfd7c7]/40 pt-3">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 12. Quick Clinical Concierge Contact Form & Channels */}
      <section className="bg-white border border-[#dfd7c7] rounded-3xl p-6 sm:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs uppercase font-bold tracking-widest text-[#c5a059]">
              Personal Concierge
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#0c2340] font-bold">
              Have a Specific Protocol or Question?
            </h2>
            <p className="text-xs sm:text-sm text-[#5a6b7c] leading-relaxed">
              Our clinical concierge team provides personal guidance for members, doctors, and sports specialists. Reach out directly or send a quick inquiry below.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="https://wa.me/529841721536?text=Hi%20Kelvin%2C%20I%20have%20a%20question%20about%20Whole%20Harbor%20Wellness."
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>💬 WhatsApp Kelvin Directly</span>
              </a>
              <button
                onClick={() => navigate('contact')}
                className="px-5 py-2.5 rounded-xl border border-[#dfd7c7] bg-[#f6f4ee] text-[#0c2340] text-xs font-semibold hover:bg-white transition-colors cursor-pointer"
              >
                Full Contact Intake →
              </button>
            </div>
          </div>

          <div className="bg-[#f6f4ee] border border-[#dfd7c7] rounded-2xl p-6">
            {quickContactSent ? (
              <div className="text-center py-6 space-y-3">
                <span className="material-symbols-outlined text-[32px] text-emerald-600">check_circle</span>
                <h4 className="font-serif text-lg font-bold text-[#0c2340]">Message Transmitted!</h4>
                <p className="text-xs text-[#5a6b7c]">
                  Our clinical concierge will follow up at {quickEmail} shortly.
                </p>
                <button
                  onClick={() => { setQuickContactSent(false); setQuickEmail(''); setQuickMessage(''); }}
                  className="text-xs text-[#c5a059] font-semibold underline cursor-pointer"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuickContact} className="space-y-3 text-xs">
                <h4 className="font-serif font-bold text-base text-[#0c2340]">Quick Concierge Dispatch</h4>
                <div>
                  <label className="block text-[#5a6b7c] mb-1">Your Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={quickEmail}
                    onChange={(e) => setQuickEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#5a6b7c] mb-1">Your Question or Protocol Inquiries *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Ask about cold-chain, reconstitution, or dosing..."
                    value={quickMessage}
                    onChange={(e) => setQuickMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#c5a059] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0c2340] cursor-pointer transition-colors shadow-xs"
                >
                  Send to Concierge
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 13. Learn Section (with exact 8 guide cards and images) */}
      <section className="learn-section" id="learn">
        <div className="learn-heading">
          <div>
            <p className="eyebrow">CUSTOMER GUIDE</p>
            <h2>Learn with Confidence</h2>
            <p>
              Practical product guides, ordering answers and care information—designed for Whole Harbor Wellness.
            </p>
          </div>
          <div className="learn-contact">
            <a
              href="#learn"
              onClick={(e) => {
                e.preventDefault();
                navigate('learn');
              }}
            >
              Open Education Studio
            </a>
            <a
              href="https://wa.me/529841721536?text=Hi%20Kelvin%2C%20I%20have%20a%20question%20about%20Whole%20Harbor%20Wellness."
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp Kelvin
            </a>
          </div>
        </div>

        <div className="learn-grid">
          {/* 1. Welcome from Kelvin */}
          <button onClick={() => navigate('learn', 'welcome')}>
            <div className="learn-card-image">
              <img
                src="/images/learn/welcome.png"
                alt="Personal welcome and guidance materials in the Whole Harbor Wellness studio"
              />
              <span>♡</span>
            </div>
            <div className="learn-card-copy">
              <h3>Welcome from Kelvin</h3>
              <p>Meet Kelvin and discover the story behind Whole Harbor Wellness.</p>
              <b>Open guide →</b>
            </div>
          </button>

          {/* 2. How Ordering Works */}
          <button onClick={() => navigate('learn', 'ordering')}>
            <div className="learn-card-image">
              <img
                src="/images/learn/ordering.png"
                alt="Tablet, checklist and package showing the ordering process"
              />
              <span>♧</span>
            </div>
            <div className="learn-card-copy">
              <h3>How Ordering Works</h3>
              <p>A clear walkthrough from browsing to delivery tracking.</p>
              <b>Open guide →</b>
            </div>
          </button>

          {/* 3. Shipping & Delivery */}
          <button onClick={() => navigate('learn', 'shipping')}>
            <div className="learn-card-image">
              <img
                src="/images/learn/shipping.png"
                alt="Insulated wellness delivery package prepared with care"
              />
              <span>▱</span>
            </div>
            <div className="learn-card-copy">
              <h3>Shipping &amp; Delivery</h3>
              <p>Processing times, tracking, address care and our delivery guarantee.</p>
              <b>Open guide →</b>
            </div>
          </button>

          {/* 4. Mixing Your Peptides */}
          <button onClick={() => navigate('learn', 'mixing')}>
            <div className="learn-card-image">
              <img
                src="/images/learn/mixing.png"
                alt="Clean safety-first peptide preparation supplies"
              />
              <span>◇</span>
            </div>
            <div className="learn-card-copy">
              <h3>Mixing Your Peptides</h3>
              <p>A calm, safety-first reconstitution checklist from the client care guide.</p>
              <b>Open guide →</b>
            </div>
          </button>

          {/* 5. Storage & Care */}
          <button onClick={() => navigate('learn', 'storage')}>
            <div className="learn-card-image">
              <img
                src="/images/learn/storage.png"
                alt="Labeled vial storage box on the center shelf of a refrigerator"
              />
              <span>❧</span>
            </div>
            <div className="learn-card-copy">
              <h3>Storage &amp; Care</h3>
              <p>How to inspect, label and store products before and after mixing.</p>
              <b>Open guide →</b>
            </div>
          </button>

          {/* 6. Frequently Asked Questions */}
          <button onClick={() => navigate('learn', 'faq')}>
            <div className="learn-card-image">
              <img
                src="/images/learn/faq.png"
                alt="Tablet conversation and question notebook representing customer support"
              />
              <span>?</span>
            </div>
            <div className="learn-card-copy">
              <h3>Frequently Asked Questions</h3>
              <p>Quick answers about orders, payment, delivery, storage and support.</p>
              <b>Open guide →</b>
            </div>
          </button>

          {/* 7. About Us */}
          <button onClick={() => navigate('learn', 'about')}>
            <div className="learn-card-image">
              <img
                src="/images/learn/about.png"
                alt="Wellness team hands arranging educational and quality-care materials"
              />
              <span>✦</span>
            </div>
            <div className="learn-card-copy">
              <h3>About Us</h3>
              <p>Our commitment to a premium, private and supportive experience.</p>
              <b>Open guide →</b>
            </div>
          </button>

          {/* 8. Peptide Directory */}
          <button className="directory-card" onClick={() => navigate('learn', 'directory')}>
            <div className="learn-card-image">
              <img
                src="/images/learn/directory.png"
                alt="Organized peptide reference cards with molecular diagrams"
              />
              <span>⌕</span>
            </div>
            <div className="learn-card-copy">
              <h3>Peptide Directory</h3>
              <p>Browse every product and open its individual educational overview.</p>
              <b>Explore products →</b>
            </div>
          </button>
        </div>

        {/* Safety First Banner */}
        <div className="learn-safety">
          <span>i</span>
          <p>
            <b>Safety first</b>
            This guide is here to make product information, kit options and ordering feel simple. Always check the sealed product label for the specific details that apply to your item, and keep products and supplies safely away from children and pets.
          </p>
        </div>
      </section>

      {/* 14. Trust Row */}
      <section className="trust-row">
        <div>
          <span>♧</span>
          <p>
            <b>Personal support</b>
            Real guidance from Kelvin and our clinical concierge team.
          </p>
        </div>
        <div>
          <span>♙</span>
          <p>
            <b>Private ordering</b>
            Encrypted transactions and temperature-buffered packaging.
          </p>
        </div>
        <div>
          <span>▱</span>
          <p>
            <b>Simple delivery</b>
            FedEx priority air with continuous cold-chain verification.
          </p>
        </div>
      </section>
    </div>
  );
};
