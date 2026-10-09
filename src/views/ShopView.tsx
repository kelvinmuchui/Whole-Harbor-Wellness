import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../services/dbService.ts';
import { Product, ProductStrength } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';

interface ShopViewProps {
  initialCategory?: string;
  navigate: (path: string, param?: string) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ initialCategory, navigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [selectedEducationProduct, setSelectedEducationProduct] = useState<Product | null>(null);
  const [modalSelectedStrength, setModalSelectedStrength] = useState<ProductStrength | null>(null);

  const { addToCart, setIsOpen, activeReferral, showToast } = useCart();

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await dbService.getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Smooth scroll if loaded with hash
  useEffect(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('best-sellers') || hash.includes('shop')) {
      setTimeout(() => {
        const el = document.getElementById('best-sellers');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
    } else if (hash.includes('catalog')) {
      setTimeout(() => {
        const el = document.getElementById('catalog');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 200);
    }
  }, []);

  const categories = [
    { id: 'all', label: 'All Formulations' },
    { id: 'metabolic', label: 'Metabolic Support' },
    { id: 'cellular', label: 'Cellular Optimization' },
    { id: 'recovery', label: 'Tissue Recovery' },
    { id: 'longevity', label: 'Longevity & Sleep' },
    { id: 'stacks', label: 'Synergy Multi-Kits' }
  ];

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickAdd = (prod: Product, strength: ProductStrength) => {
    addToCart(prod, strength, 1);
    const key = `${prod.id}-${strength.label}`;
    setAddedItems((prev) => ({ ...prev, [key]: true }));
    showToast(`Added ${prod.name} (${strength.label}) to cart`);
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [key]: false }));
    }, 1500);
  };

  const filteredCatalog = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Find featured items for Best Sellers trio
  const semaglutideProd = products.find((p) => p.slug === 'semaglutide-b12') || products[0];
  const bpcProd = products.find((p) => p.slug === 'bpc-157-tb-500') || products[1];
  const motscProd = products.find((p) => p.slug === 'mots-c-activator') || products[2];

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
          <p className="eyebrow">WHOLE HARBOR WELLNESS • WHW</p>
          <h1>
            Feel Your Best,<br />
            <em>Beautifully.</em>
          </h1>
          <p>
            Pharmaceutical-grade peptide protocols, unbroken cold-chain delivery, and personal guidance from first question to every reorder.
          </p>
          {activeReferral && (
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-[#c5a059] text-[11px] font-semibold text-[#0c2340]">
              <span>✦</span>
              <span>{(activeReferral.discountRate * 100).toFixed(0)}% Partner VIP Benefit Applied</span>
            </div>
          )}
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

      {/* 2. Wellness Goals Selectors */}
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

      {/* 4. Product Grid (Best Sellers Featured Trio) */}
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
            <p className="product-detail">Metabolic Regulation</p>
            <h3 className="font-serif text-xl font-semibold text-[var(--deep)] mb-1">SEMAGLUTIDE</h3>
            <p className="text-xs text-[var(--muted)] mb-3 line-clamp-2">
              Dual-action GLP-1 receptor agonist studied for appetite regulation and metabolic balance.
            </p>
            <div className="strength">
              <span>Option</span>
              <b>5mg • 10 vials</b>
            </div>
            <div className="price-row">
              <div className="featured-price">
                <small>From</small>
                <strong>$145.00</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (semaglutideProd?.strengths?.[0]) {
                      handleQuickAdd(semaglutideProd, semaglutideProd.strengths[0]);
                      setIsOpen(true);
                    }
                  }}
                  className="cursor-pointer"
                  title="Quick Add to Cart"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => navigate('product-detail', 'semaglutide-b12')}
                  className="cursor-pointer !bg-white !text-[var(--deep)] !border !border-[var(--line)] hover:!bg-[var(--blush)]"
                  title="View detailed formulation specifications"
                >
                  Options
                </button>
              </div>
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
            <p className="product-detail">Tissue &amp; Gut Repair</p>
            <h3 className="font-serif text-xl font-semibold text-[var(--deep)] mb-1">BPC-157</h3>
            <p className="text-xs text-[var(--muted)] mb-3 line-clamp-2">
              Synthesized pentadecapeptide studied for tendon, ligament, and gut mucosal tissue repair.
            </p>
            <div className="strength">
              <span>Option</span>
              <b>10mg • 10 vials</b>
            </div>
            <div className="price-row">
              <div className="featured-price">
                <small>From</small>
                <strong>$165.00</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (bpcProd?.strengths?.[0]) {
                      handleQuickAdd(bpcProd, bpcProd.strengths[0]);
                      setIsOpen(true);
                    }
                  }}
                  className="cursor-pointer"
                  title="Quick Add to Cart"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => navigate('product-detail', 'bpc-157-tb-500')}
                  className="cursor-pointer !bg-white !text-[var(--deep)] !border !border-[var(--line)] hover:!bg-[var(--blush)]"
                  title="View detailed formulation specifications"
                >
                  Options
                </button>
              </div>
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
            <p className="product-detail">Cellular Energy</p>
            <h3 className="font-serif text-xl font-semibold text-[var(--deep)] mb-1">MOTS-C</h3>
            <p className="text-xs text-[var(--muted)] mb-3 line-clamp-2">
              Mitochondrial-derived 16-amino acid peptide for intracellular AMPK bioenergetics and resilience.
            </p>
            <div className="strength">
              <span>Option</span>
              <b>20mg • 10 vials</b>
            </div>
            <div className="price-row">
              <div className="featured-price">
                <small>From</small>
                <strong>$285.00</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (motscProd?.strengths?.[0]) {
                      handleQuickAdd(motscProd, motscProd.strengths[0]);
                      setIsOpen(true);
                    }
                  }}
                  className="cursor-pointer"
                  title="Quick Add to Cart"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => navigate('product-detail', 'mots-c-activator')}
                  className="cursor-pointer !bg-white !text-[var(--deep)] !border !border-[var(--line)] hover:!bg-[var(--blush)]"
                  title="View detailed formulation specifications"
                >
                  Options
                </button>
              </div>
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
        <div className="catalog-heading">
          <div>
            <p className="eyebrow">FORMULATION CATALOG</p>
            <h2>Curated Peptide Portfolio</h2>
            <p>All items ship same-day under monitored refrigerated cold chain.</p>
          </div>
          <label>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search formulations or symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>

        {/* Category Filters */}
        <div className="category-filters">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={selectedCategory === cat.id ? 'active' : ''}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center text-[var(--muted)] space-y-3">
            <span className="w-8 h-8 border-2 border-[var(--rose)] border-t-transparent rounded-full animate-spin inline-block"></span>
            <p className="text-xs">Loading clinical catalog...</p>
          </div>
        ) : (
          /* Catalog Grid */
          <div className="catalog-grid">
            {filteredCatalog.map((prod) => (
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
                    onClick={() => {
                      setSelectedEducationProduct(prod);
                      setModalSelectedStrength(prod.strengths[0] || null);
                    }}
                    className="cursor-pointer"
                  >
                    Learn more <b>→</b>
                  </button>
                </div>

                {/* Variant List */}
                <div className="variant-list">
                  {prod.strengths.map((str, idx) => {
                    const key = `${prod.id}-${str.label}`;
                    const isAdded = !!addedItems[key];
                    return (
                      <div key={idx}>
                        <span>
                          <b>{str.label.split('/')[0].trim()}</b>
                          <small>{str.vialsCount} vials • HPLC {prod.purity || '≥ 99.4%'}</small>
                        </span>
                        <span className="variant-price">
                          <strong>${str.price.toFixed(2)}</strong>
                          <small>
                            ${(str.pricePerVial ?? (str.price / (str.vialsCount || 1))).toFixed(2)} / vial
                          </small>
                        </span>
                        <button
                          className={isAdded ? 'added' : ''}
                          onClick={() => handleQuickAdd(prod, str)}
                          aria-label={`Add ${prod.name} ${str.label} to cart`}
                          title="Quick Add to Cart"
                        >
                          {isAdded ? '✓' : '+'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && filteredCatalog.length === 0 && (
          <div className="no-results my-8 text-center py-12">
            <h3>No matching formulations</h3>
            <p>Try adjusting your search query or choosing another category filter.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="show-all"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* 7. Curated Synergies & Stacks Section */}
      <section className="stacks-section">
        <div className="section-head">
          <div>
            <h2>Curated Synergies &amp; Stacks</h2>
            <p>Multi-peptide regimens designed for synergistic cellular pathways.</p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('stacks');
              scrollToCatalog();
            }}
          >
            View All Stacks →
          </button>
        </div>

        <div className="stack-grid">
          {/* Wolverine Protocol */}
          <article>
            <span>Tissue Recovery</span>
            <h3>Wolverine Protocol</h3>
            <p>
              Dual-action BPC-157 and TB-500 synergy for accelerating tendon, ligament, and connective tissue remodeling.
            </p>
            <div>
              <small>20 Vials Total • Syringes Included</small>
              <strong>$320.00</strong>
              <button
                onClick={() => {
                  const item = products.find((p) => p.slug === 'bpc-157-tb-500');
                  if (item?.strengths?.[1]) {
                    handleQuickAdd(item, item.strengths[1]);
                    setIsOpen(true);
                  }
                }}
              >
                Add Kit +
              </button>
            </div>
          </article>

          {/* Metabolic Ignite */}
          <article>
            <span>Metabolic Balance</span>
            <h3>Metabolic Ignite</h3>
            <p>
              Semaglutide paired with synergistic micronutrient methylation for prolonged appetite and glucose stability.
            </p>
            <div>
              <small>20 Vials Total • Cold Pouch</small>
              <strong>$280.00</strong>
              <button
                onClick={() => {
                  const item = products.find((p) => p.slug === 'metabolic-optimizer-stack') || semaglutideProd;
                  if (item?.strengths?.[0]) {
                    handleQuickAdd(item, item.strengths[0]);
                    setIsOpen(true);
                  }
                }}
              >
                Add Kit +
              </button>
            </div>
          </article>

          {/* Cellular Rejuvenation */}
          <article>
            <span>Longevity &amp; DNA</span>
            <h3>Cellular Rejuvenation</h3>
            <p>
              Mitochondrial MOTS-c combined with pure NAD+ co-factor to trigger deep intracellular ATP synthesis.
            </p>
            <div>
              <small>20 Vials Total • HPLC &gt;99.5%</small>
              <strong>$450.00</strong>
              <button
                onClick={() => {
                  const item = products.find((p) => p.slug === 'glow-rebuild-collagen-matrix') || motscProd;
                  if (item?.strengths?.[0]) {
                    handleQuickAdd(item, item.strengths[0]);
                    setIsOpen(true);
                  }
                }}
              >
                Add Kit +
              </button>
            </div>
          </article>

          {/* Deep Rest & Renewal */}
          <article>
            <span>Restorative Sleep</span>
            <h3>Deep Rest &amp; Renewal</h3>
            <p>
              Nocturnal growth hormone secretagogue blend synchronizing slow-wave delta restorative sleep.
            </p>
            <div>
              <small>20 Vials Total • Fast Dispatch</small>
              <strong>$290.00</strong>
              <button
                onClick={() => {
                  const item = products.find((p) => p.slug === 'sleep-architecture-gh-blend') || products[0];
                  if (item?.strengths?.[0]) {
                    handleQuickAdd(item, item.strengths[0]);
                    setIsOpen(true);
                  }
                }}
              >
                Add Kit +
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* 8. Trust Row */}
      <section className="trust-row">
        <div>
          <span>🔬</span>
          <div>
            <b>HPLC Verified &gt;99% Purity</b>
            <p>Independent 3rd-party batch testing and single-peak purity assay on every vial.</p>
          </div>
        </div>
        <div>
          <span>❄️</span>
          <div>
            <b>Refrigerated Cold-Chain</b>
            <p>Insulated thermal mailers with phase-change cold packs maintain peptide tertiary structure.</p>
          </div>
        </div>
        <div>
          <span>👩‍⚕️</span>
          <div>
            <b>Clinical Concierge Support</b>
            <p>Personal protocol guidance for reconstitution volumes, needle gauges, and titration.</p>
          </div>
        </div>
      </section>

      {/* 9. Interactive Education Modal */}
      {selectedEducationProduct && (
        <div
          className="modal-backdrop centered education-backdrop"
          onClick={() => setSelectedEducationProduct(null)}
        >
          <div
            className="education-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              onClick={() => setSelectedEducationProduct(null)}
              aria-label="Close"
            >
              ✕
            </button>

            <div className="education-tags">
              <span>{selectedEducationProduct.categoryLabel}</span>
              <span>HPLC {selectedEducationProduct.purity || '≥ 99.4%'}</span>
              <span>2°C–8°C Cold Chain</span>
              <span>Lot #{selectedEducationProduct.lotNumber || '2026-A'}</span>
            </div>

            <h2>{selectedEducationProduct.name}</h2>
            <p className="education-detail">{selectedEducationProduct.description}</p>

            <div className="education-note">
              <span>i</span>
              <div>
                <b>Clinical Reconstitution &amp; Storage</b>
                <p>
                  Lyophilized cake must be reconstituted with Bacteriostatic Reconstitution Saline (0.9% Benzyl Alcohol). Once reconstituted, store protected from light at 2°C–8°C and use within 28 days.
                </p>
              </div>
            </div>

            {/* Strength selector inside modal */}
            <div className="my-6">
              <label className="block text-xs font-bold text-[var(--deep)] mb-2 uppercase tracking-wider">
                Select Packaging Tier
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedEducationProduct.strengths.map((str, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setModalSelectedStrength(str)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      modalSelectedStrength?.label === str.label
                        ? 'border-[var(--rose)] bg-[var(--blush)] shadow-xs'
                        : 'border-[var(--line)] bg-white hover:bg-[var(--blush)]/50'
                    }`}
                  >
                    <b className="text-xs text-[var(--deep)] block">{str.label}</b>
                    <span className="text-xs text-[var(--rose)] font-bold">
                      ${str.price.toFixed(2)}
                    </span>
                    <small className="text-[10px] text-[var(--muted)] ml-2">
                      ({str.vialsCount} vials)
                    </small>
                  </button>
                ))}
              </div>
            </div>

            <div className="education-modal-actions">
              <button
                type="button"
                onClick={() => {
                  if (modalSelectedStrength) {
                    handleQuickAdd(selectedEducationProduct, modalSelectedStrength);
                    setIsOpen(true);
                    setSelectedEducationProduct(null);
                  }
                }}
              >
                Add Tier to Cart (${modalSelectedStrength?.price.toFixed(2) || selectedEducationProduct.price.toFixed(2)})
              </button>
              <button
                type="button"
                onClick={() => {
                  const slug = selectedEducationProduct.slug;
                  setSelectedEducationProduct(null);
                  navigate('product-detail', slug);
                }}
              >
                Full Monograph →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
