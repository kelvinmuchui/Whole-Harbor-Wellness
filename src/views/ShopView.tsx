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
  const [loadError, setLoadError] = useState<string | null>(null);
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
    if (!selectedEducationProduct) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedEducationProduct(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEducationProduct]);

  useEffect(() => {
    let active = true;
    const loadProducts = async () => {
      try {
        const data = await dbService.getProducts();
        if (active) {
          setProducts(data);
          setLoadError(null);
        }
      } catch (err) {
        console.error('Failed to load products', err);
        if (active) {
          setLoadError('Unable to load the catalog from the database. Please try again shortly.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadProducts();
    const unsubscribe = dbService.subscribeToCollections(['products'], () => {
      void loadProducts();
    });
    return () => {
      active = false;
      unsubscribe();
    };
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
      if (p.status === 'DISABLED') return false;
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const featuredProducts = products.filter((product) => product.featured && product.status === 'ACTIVE').slice(0, 3);
  const featuredStacks = products.filter(
    (product) => product.isStack && product.status === 'ACTIVE'
  );

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
          <h2>Featured Formulations</h2>
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
          View all {products.length} options →
        </a>
      </section>

      {/* 4. Featured products from the catalog */}
      {featuredProducts.length > 0 && (
        <section className="product-grid">
          {featuredProducts.map((product) => {
            const strength = product.strengths[0];
            return (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  <span>{product.categoryLabel}</span>
                </div>
                <div className="product-info">
                  <p className="product-detail">{product.categoryLabel}</p>
                  <h3 className="font-serif text-xl font-semibold text-[var(--deep)] mb-1">{product.name}</h3>
                  <p className="text-xs text-[var(--muted)] mb-3 line-clamp-2">{product.shortDescription}</p>
                  {strength && (
                    <>
                      <div className="strength">
                        <span>Available option</span>
                        <b>{strength.label}</b>
                      </div>
                      <div className="price-row">
                        <div className="featured-price">
                          <small>{strength.vialsCount} vial{strength.vialsCount === 1 ? '' : 's'}</small>
                          <strong>${strength.price.toFixed(2)}</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              handleQuickAdd(product, strength);
                              setIsOpen(true);
                            }}
                            className="cursor-pointer"
                            title={`Add ${product.name} to cart`}
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => navigate('product-detail', product.slug)}
                            className="cursor-pointer !bg-white !text-[var(--deep)] !border !border-[var(--line)] hover:!bg-[var(--blush)]"
                            title="View detailed formulation specifications"
                          >
                            Options
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* 5. Savings Strip (Multi-tier volume discounts) */}
      <section className="savings-strip">
        <div>
          <b>5% OFF</b>
          <span>2-3 KITS</span>
        </div>
        <div>
          <b>8% OFF</b>
          <span>4-5 KITS</span>
        </div>
        <div>
          <b>12% OFF</b>
          <span>6+ KITS</span>
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
        ) : loadError ? (
          <div className="my-8 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-800" role="alert">
            {loadError}
          </div>
        ) : (
          /* Catalog Grid */
          <div className="catalog-grid">
            {filteredCatalog.map((prod) => {
              const isUnavailable = prod.status === 'UNAVAILABLE' || prod.status === 'OUT_OF_STOCK';
              return (
                <article key={prod.id} className={`catalog-card ${isUnavailable ? 'opacity-75' : ''}`}>
                  <div
                    onClick={() => navigate('product-detail', prod.slug)}
                    className="mb-3 rounded-xl overflow-hidden bg-[#f7f4ef] border border-[var(--line)] aspect-[16/10] cursor-pointer group"
                  >
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="catalog-card-head">
                    <h3
                      onClick={() => navigate('product-detail', prod.slug)}
                      className="cursor-pointer hover:text-[var(--rose)] transition-colors"
                    >
                      {prod.name}
                    </h3>
                    <span>{isUnavailable ? 'Unavailable' : `${prod.strengths.length} options`}</span>
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
                            <strong>
                              ${(str.pricePerVial ?? (str.price / (str.vialsCount || 1))).toFixed(2)} / vial
                            </strong>
                            <small>
                              ${str.price.toFixed(2)} total ({str.vialsCount} vials)
                            </small>
                          </span>
                          <button
                            className={isAdded ? 'added' : ''}
                            disabled={isUnavailable}
                            onClick={() => !isUnavailable && handleQuickAdd(prod, str)}
                            aria-label={isUnavailable ? `${prod.name} unavailable` : `Add ${prod.name} ${str.label} to cart`}
                            title={isUnavailable ? 'Currently Unavailable' : 'Quick Add to Cart'}
                          >
                            {isUnavailable ? '—' : isAdded ? '✓' : '+'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
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

      {/* 7. Stacks from the active database catalog */}
      {featuredStacks.length > 0 && (
        <section className="stacks-section">
          <div className="section-head">
            <div>
              <h2>Curated Synergies &amp; Stacks</h2>
              <p>Available combinations and prices from the current product catalog.</p>
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
            {featuredStacks.map((product) => {
              const strength = product.strengths[0];
              return (
                <article key={product.id}>
                  <span>{product.categoryLabel}</span>
                  <h3>{product.name}</h3>
                  <p>{product.shortDescription}</p>
                  {strength && (
                    <div>
                      <small>{strength.label}</small>
                      <strong>${strength.price.toFixed(2)}</strong>
                      <button
                        onClick={() => {
                          handleQuickAdd(product, strength);
                          setIsOpen(true);
                        }}
                      >
                        Add Kit +
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

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
          <span>📦</span>
          <div>
            <b>100% Delivery Guarantee</b>
            <p>Thermal-integrity tracked arrival guarantee with rapid batch replacement protection.</p>
          </div>
        </div>
      </section>

      {/* 9. Interactive Education Modal */}
      {selectedEducationProduct && (
        <div
          className="fixed inset-0 z-50 bg-[#0c2340]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedEducationProduct(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedEducationProduct.name}
        >
          <div
            className="bg-[#fffdfb] w-full sm:max-w-xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#dfd7c7] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pinned Header */}
            <div className="shrink-0 px-5 sm:px-7 py-4 border-b border-[#dfd7c7] bg-[#f6f4ee] flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-white border border-[#dfd7c7] text-[10px] font-bold uppercase tracking-wider text-[#c5a059]">
                    {selectedEducationProduct.categoryLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-[#dfd7c7] text-[10px] font-bold text-[#0c2340]">
                    HPLC {selectedEducationProduct.purity || '≥ 99.4%'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-[#dfd7c7] text-[10px] font-bold text-[#5a6b7c]">
                    Lot #{selectedEducationProduct.lotNumber || '2026-A'}
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0c2340] leading-tight">
                  {selectedEducationProduct.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEducationProduct(null)}
                aria-label="Close"
                className="w-10 h-10 rounded-full bg-white border border-[#dfd7c7] hover:border-[#0c2340] text-[#0c2340] flex items-center justify-center text-sm font-bold transition-colors cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
              <p className="text-xs sm:text-sm text-[#5a6b7c] leading-relaxed">
                {selectedEducationProduct.description}
              </p>

              <div className="p-4 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7] flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-white border border-[#dfd7c7] text-[#c5a059] font-serif font-bold flex items-center justify-center shrink-0">
                  i
                </span>
                <div className="text-xs text-[#5a6b7c] leading-relaxed">
                  <b className="text-[#0c2340] block mb-1">Clinical Reconstitution &amp; Storage</b>
                  <p>
                    {selectedEducationProduct.disclosures ||
                      'Lyophilized cake must be reconstituted with Bacteriostatic Reconstitution Saline (0.9% Benzyl Alcohol). Once reconstituted, store protected from light at 2°C–8°C and use within 28 days.'}
                  </p>
                  {selectedEducationProduct.educationalMaterial && (
                    <p className="mt-2 pt-2 border-t border-[#dfd7c7]">
                      <strong>Educational Notes:</strong> {selectedEducationProduct.educationalMaterial}
                    </p>
                  )}
                </div>
              </div>

              {/* Strength selector inside modal */}
              <div>
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
            </div>

            {/* Pinned Responsive Footer */}
            <div className="shrink-0 px-5 sm:px-7 py-3.5 pb-[calc(14px+env(safe-area-inset-bottom))] border-t border-[#dfd7c7] bg-[#f6f4ee] flex flex-col-reverse sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedEducationProduct(null)}
                className="sm:w-28 py-3 px-4 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] hover:border-[#0c2340] text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const slug = selectedEducationProduct.slug;
                  setSelectedEducationProduct(null);
                  navigate('product-detail', slug);
                }}
                className="sm:w-40 py-3 px-4 rounded-xl bg-white border border-[#c5a059] text-[#0c2340] hover:bg-[#fffdfb] text-xs font-bold transition-colors cursor-pointer"
              >
                Full Monograph →
              </button>
              <button
                type="button"
                onClick={() => {
                  if (modalSelectedStrength) {
                    handleQuickAdd(selectedEducationProduct, modalSelectedStrength);
                    setIsOpen(true);
                    setSelectedEducationProduct(null);
                  }
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#0c2340] text-white hover:bg-[#c5a059] text-xs font-bold transition-colors cursor-pointer"
              >
                Add Tier to Cart (${modalSelectedStrength?.price.toFixed(2) || selectedEducationProduct.price.toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
