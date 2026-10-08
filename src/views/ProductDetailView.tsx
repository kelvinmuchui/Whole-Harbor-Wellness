import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService.ts';
import { Product, ProductStrength } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';

interface ProductDetailViewProps {
  slug: string;
  navigate: (path: string, param?: string) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ slug, navigate }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedStrength, setSelectedStrength] = useState<ProductStrength | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'clinical' | 'coa' | 'protocol'>('clinical');

  const { addToCart, setIsOpen, activeReferral } = useCart();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const prod = await dbService.getProductBySlug(slug);
        if (prod) {
          setProduct(prod);
          setSelectedStrength(prod.strengths[0] || null);
          const all = await dbService.getProducts();
          setRelatedProducts(all.filter((p) => p.id !== prod.id && p.category === prod.category).slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load product', err);
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
        <p className="text-xs">Accessing formulation dossier...</p>
      </div>
    );
  }

  if (!product || !selectedStrength) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h2 className="font-serif text-2xl font-bold text-[#744241] mb-4">Formulation Not Found</h2>
        <p className="text-xs text-[#7c6b69] mb-6">The requested peptide protocol is either in archive or has been renamed.</p>
        <button
          onClick={() => navigate('shop')}
          className="px-6 py-2.5 rounded-xl bg-[#b87572] text-white text-xs font-semibold cursor-pointer"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const currentPrice = selectedStrength.price;
  const pricePerVial = selectedStrength.pricePerVial || (selectedStrength.vialsCount > 0 ? currentPrice / selectedStrength.vialsCount : currentPrice);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#7c6b69]">
        <button onClick={() => navigate('home')} className="hover:text-[#744241] cursor-pointer">
          Home
        </button>
        <span>/</span>
        <button onClick={() => navigate('shop')} className="hover:text-[#744241] cursor-pointer">
          Formulations
        </button>
        <span>/</span>
        <button onClick={() => navigate('shop', product.category)} className="hover:text-[#744241] cursor-pointer">
          {product.categoryLabel}
        </button>
        <span>/</span>
        <span className="text-[#744241] font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Image & Authenticity Guarantee */}
        <div className="lg:col-span-6 space-y-6">
          <div className="relative rounded-3xl overflow-hidden bg-white border border-[#ead2ce] shadow-lg group">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-[460px] object-cover transition-transform duration-500 group-hover:scale-102"
            />
            
            {/* Top Overlay Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="px-3 py-1 rounded-lg bg-[#744241]/85 backdrop-blur-md text-[#fffdfb] text-xs font-bold uppercase tracking-wider">
                {product.categoryLabel}
              </span>
              {product.isStack && (
                <span className="px-3 py-1 rounded-lg bg-[#b87572] text-[#fffdfb] text-xs font-bold uppercase tracking-wider">
                  Synergy Multi-Kit
                </span>
              )}
            </div>

            {product.purity && (
              <div className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-[#b87572] text-[#fffdfb] text-xs font-bold flex items-center gap-1.5 shadow-md">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>{product.purity} HPLC Purity</span>
              </div>
            )}
          </div>

          {/* Cold-Chain Quality Callout Card */}
          <div className="bg-[#fff6f3] border border-[#ead2ce] rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#b87572] text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">ac_unit</span>
            </div>
            <div className="text-xs space-y-1">
              <h4 className="font-semibold text-sm text-[#744241]">
                Cold-Chain Verified Fulfillment
              </h4>
              <p className="text-[#7c6b69] leading-relaxed">
                Shipped with medical insulated foam and frozen refrigerant core. Guaranteed &lt;8°C integrity during express transit to protect peptide molecular stability.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Strength Selector & Add to Cart */}
        <div className="lg:col-span-6 space-y-8">
          
          <div>
            <div className="flex items-center gap-3 mb-2 text-xs text-[#7c6b69]">
              <span className="font-mono bg-[#fff6f3] px-2 py-0.5 rounded border border-[#ead2ce]">
                SKU: {product.sku}
              </span>
              <span>•</span>
              <span className="font-mono bg-[#fff6f3] px-2 py-0.5 rounded border border-[#ead2ce]">
                LOT: {product.lotNumber || '2026-B12'}
              </span>
              <span>•</span>
              <span className="text-[#b87572] font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#b87572] animate-pulse"></span>
                In Stock ({product.stockQuantity} kits)
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-[#744241] font-bold">
              {product.name}
            </h1>

            <p className="text-xs sm:text-sm text-[#7c6b69] mt-3 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Strength / Packaging Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#744241] uppercase tracking-wider">
                Select Formulation Tier &amp; Vial Count
              </span>
              <span className="text-[#7c6b69]">Lyophilized Powder</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.strengths.map((str) => {
                const isSelected = selectedStrength.label === str.label;
                const vialPrice = (str.price / str.vialsCount).toFixed(0);
                return (
                  <div
                    key={str.label}
                    onClick={() => setSelectedStrength(str)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#b87572] bg-[#b87572]/5 ring-1 ring-[#b87572]'
                        : 'border-[#ead2ce] bg-white hover:border-[#7c6b69]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-xs text-[#744241]">
                        {str.label}
                      </span>
                      <span className="font-serif font-bold text-sm text-[#b87572]">
                        ${str.price}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#7c6b69] flex items-center justify-between">
                      <span>{str.vialsCount} Sealed Vials</span>
                      <span className="font-medium text-[#744241]">${vialPrice}/vial</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Volume Savings Highlight */}
          <div className="bg-[#b87572]/10 border border-[#7c6b69]/30 rounded-2xl p-4 text-xs space-y-2 text-[#b87572]">
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                Multi-Kit Protocol Discount
              </span>
              <span className="text-[#b87572]">Auto-Applied In Cart</span>
            </div>
            <p className="text-[11px] text-[#7c6b69]">
              Order 2–3 kits for <strong>5% off</strong>, 4–5 kits for <strong>8% off</strong>, or 6+ kits for <strong>12% off</strong>.
            </p>
          </div>

          {/* Quantity & Add to Cart Zone */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            
            {/* Quantity Selector */}
            <div className="flex items-center border border-[#ead2ce] rounded-xl bg-white overflow-hidden h-12">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 text-sm font-semibold text-[#7c6b69] hover:bg-[#fff6f3] transition-colors cursor-pointer"
              >
                -
              </button>
              <span className="px-4 text-sm font-bold text-[#744241]">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 text-sm font-semibold text-[#7c6b69] hover:bg-[#fff6f3] transition-colors cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Total Price and Action */}
            <button
              onClick={() => {
                addToCart(product, selectedStrength, quantity);
                setIsOpen(true);
              }}
              className="flex-1 h-12 px-6 rounded-xl bg-[#b87572] text-[#fffdfb] text-xs font-semibold uppercase tracking-wider hover:bg-[#744241] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
              <span>
                Add to Protocol — ${(currentPrice * quantity).toFixed(2)}
              </span>
            </button>
          </div>

          {/* Partner Attribution if referred */}
          {activeReferral && (
            <p className="text-xs text-[#b87572] flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Referred by <strong>{activeReferral.partnerName}</strong> — VIP Discount applied at checkout.</span>
            </p>
          )}

        </div>
      </div>

      {/* Tabs: Clinical Specs, CoA Verification, Administration Protocol */}
      <div className="border border-[#ead2ce] rounded-3xl bg-white overflow-hidden shadow-xs">
        <div className="flex border-b border-[#ead2ce] bg-[#fff6f3]">
          <button
            onClick={() => setActiveTab('clinical')}
            className={`flex-1 py-4 px-6 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer text-center ${
              activeTab === 'clinical'
                ? 'bg-white text-[#b87572] border-t-2 border-[#b87572]'
                : 'text-[#7c6b69] hover:text-[#744241]'
            }`}
          >
            Clinical Rationale &amp; Mechanism
          </button>
          <button
            onClick={() => setActiveTab('coa')}
            className={`flex-1 py-4 px-6 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer text-center ${
              activeTab === 'coa'
                ? 'bg-white text-[#b87572] border-t-2 border-[#b87572]'
                : 'text-[#7c6b69] hover:text-[#744241]'
            }`}
          >
            CoA &amp; Analytical Lab Report
          </button>
          <button
            onClick={() => setActiveTab('protocol')}
            className={`flex-1 py-4 px-6 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer text-center ${
              activeTab === 'protocol'
                ? 'bg-white text-[#b87572] border-t-2 border-[#b87572]'
                : 'text-[#7c6b69] hover:text-[#744241]'
            }`}
          >
            Storage &amp; Reconstitution
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'clinical' && (
            <div className="max-w-3xl space-y-4 text-xs sm:text-sm text-[#7c6b69] leading-relaxed">
              <h3 className="font-serif text-xl font-bold text-[#744241]">
                Pharmacological Overview
              </h3>
              <p>
                Whole Harbor compounds are engineered to meet strict molecular stability thresholds. 
                Our research team validates receptor binding kinetics, elimination half-lives, and compound synergy to ensure reproducible clinical outcomes under medical supervision.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-[#fffdfb] border border-[#ead2ce]">
                  <span className="font-semibold text-xs text-[#744241] block mb-1">Target Pathways</span>
                  <span className="text-xs text-[#7c6b69]">Receptor-mediated intracellular signaling cascade, mitochondrial uncoupling &amp; restorative biogenesis.</span>
                </div>
                <div className="p-4 rounded-xl bg-[#fffdfb] border border-[#ead2ce]">
                  <span className="font-semibold text-xs text-[#744241] block mb-1">Purity Benchmark</span>
                  <span className="text-xs text-[#7c6b69]">Endotoxin tested &lt;0.01 EU/mg, TFA salt exchanged, &gt;99.2% single main-peak HPLC resolution.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'coa' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ead2ce]/50 pb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#744241]">
                    Certificate of Analytical Testing
                  </h3>
                  <p className="text-xs text-[#7c6b69]">
                    Independent third-party analytical laboratory assay
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#b87572] text-[20px]">verified</span>
                  <span className="text-xs font-mono font-semibold text-[#b87572]">PASS: 99.4% HPLC</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-[#fffdfb] border border-[#ead2ce]">
                  <span className="text-[10px] text-[#7c6b69] uppercase font-bold block">Assay Date</span>
                  <span className="font-semibold text-[#744241]">October 2026</span>
                </div>
                <div className="p-3 rounded-xl bg-[#fffdfb] border border-[#ead2ce]">
                  <span className="text-[10px] text-[#7c6b69] uppercase font-bold block">Method</span>
                  <span className="font-semibold text-[#744241]">RP-HPLC / MS</span>
                </div>
                <div className="p-3 rounded-xl bg-[#fffdfb] border border-[#ead2ce]">
                  <span className="text-[10px] text-[#7c6b69] uppercase font-bold block">Residual Solvent</span>
                  <span className="font-semibold text-[#744241]">&lt; 0.05% (Compliant)</span>
                </div>
                <div className="p-3 rounded-xl bg-[#fffdfb] border border-[#ead2ce]">
                  <span className="text-[10px] text-[#7c6b69] uppercase font-bold block">Sterility</span>
                  <span className="font-semibold text-[#b87572]">100% Sterile (0 CFU)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'protocol' && (
            <div className="max-w-3xl space-y-4 text-xs sm:text-sm text-[#7c6b69] leading-relaxed">
              <h3 className="font-serif text-xl font-bold text-[#744241]">
                Handling &amp; Reconstitution Best Practices
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Lyophilized Storage:</strong> Store unopened vials in a dark refrigerator between 2°C to 8°C. Stable for 24 months.
                </li>
                <li>
                  <strong>Reconstitution:</strong> Reconstitute using bacteriostatic water (0.9% benzyl alcohol). Introduce diluent slowly down the glass wall of the vial to minimize shear force.
                </li>
                <li>
                  <strong>Post-Reconstitution:</strong> Do not shake or vortex. Store reconstituted solution refrigerated at 2°C to 8°C and use within 30 to 45 days.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Synergistic Recommendations */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6">
          <h3 className="font-serif text-2xl font-bold text-[#744241]">
            Synergistic Formulations in this Category
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => navigate('product-detail', rel.slug)}
                className="bg-white rounded-2xl border border-[#ead2ce] p-4 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4 group"
              >
                <img
                  src={rel.imageUrl}
                  alt={rel.name}
                  className="w-16 h-16 rounded-xl object-cover bg-[#fff6f3] shrink-0"
                />
                <div>
                  <h4 className="font-serif text-sm font-semibold text-[#744241] group-hover:text-[#b87572] transition-colors">
                    {rel.name}
                  </h4>
                  <span className="text-xs font-bold text-[#b87572] block mt-1">
                    ${rel.price.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
