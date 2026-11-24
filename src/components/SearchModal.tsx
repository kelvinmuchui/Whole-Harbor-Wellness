import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService.ts';
import { Product, WellnessProgram, EducationalArticle } from '../types/index.ts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string, param?: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, navigate }) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [programs, setPrograms] = useState<WellnessProgram[]>([]);
  const [articles, setArticles] = useState<EducationalArticle[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const loadSearchData = async () => {
      try {
        const [productData, programData, articleData] = await Promise.all([
          dbService.getProducts(),
          dbService.getPrograms(),
          dbService.getArticles()
        ]);
        if (active) {
          setProducts(productData);
          setPrograms(programData);
          setArticles(articleData);
        }
      } catch (error) {
        console.error('Failed to load search data', error);
      }
    };
    void loadSearchData();
    const unsubscribe = dbService.subscribeToCollections(
      ['products', 'wellness_programs', 'educational_articles'],
      () => {
        void loadSearchData();
      }
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const activeProducts = products.filter(
    (p) => !['DISABLED', 'DRAFT', 'ARCHIVED'].includes(p.status)
  );
  const activePrograms = programs.filter((p) => p.status === 'ACTIVE');
  const publishedArticles = articles.filter((a) => a.status === 'PUBLISHED');

  const matchingProducts = trimmed
    ? activeProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmed) ||
          p.categoryLabel.toLowerCase().includes(trimmed) ||
          p.description.toLowerCase().includes(trimmed)
      )
    : activeProducts.slice(0, 4);

  const matchingPrograms = trimmed
    ? activePrograms.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmed) ||
          p.category.toLowerCase().includes(trimmed) ||
          p.shortDescription.toLowerCase().includes(trimmed)
      )
    : [];

  const matchingArticles = trimmed
    ? publishedArticles.filter(
        (a) =>
          a.title.toLowerCase().includes(trimmed) ||
          a.summary.toLowerCase().includes(trimmed) ||
          a.category.toLowerCase().includes(trimmed)
      )
    : [];

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0c2340]/50 backdrop-blur-xs flex items-end sm:items-start justify-center p-0 sm:pt-16 sm:px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search Whole Harbor"
    >
      <div
        className="relative bg-[#fffdfb] w-full sm:max-w-2xl max-h-[88dvh] sm:max-h-[80vh] flex flex-col rounded-t-3xl sm:rounded-2xl border border-[#dfd7c7] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Pinned Search Input Bar */}
        <div className="shrink-0 p-4 border-b border-[#dfd7c7] bg-[#f6f4ee] flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[#c5a059] text-[22px] shrink-0">search</span>
          <input
            type="text"
            autoFocus
            placeholder="Search peptides, programs, articles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-sm text-[#0c2340] placeholder-[#5a6b7c] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search query"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#5a6b7c] hover:text-[#0c2340] hover:bg-white cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">backspace</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-bold text-[#0c2340] bg-white border border-[#dfd7c7] hover:border-[#0c2340] rounded-xl cursor-pointer shrink-0"
          >
            Cancel
          </button>
        </div>

        {/* Scrollable Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-[calc(16px+env(safe-area-inset-bottom))]">
          
          {/* Products */}
          {matchingProducts.length > 0 && (
            <div>
              <h4 className="text-xs uppercase font-bold tracking-wider text-[#5a6b7c] mb-3 px-2">
                Products &amp; Formulations ({matchingProducts.length})
              </h4>
              <div className="space-y-2">
                {matchingProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onClose();
                      navigate('product-detail', p.slug);
                    }}
                    className="p-2.5 rounded-xl hover:bg-[#f6f4ee] transition-colors flex items-center gap-3 cursor-pointer group"
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      loading="lazy"
                      className="w-12 h-12 rounded-lg object-cover bg-white border border-[#dfd7c7] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#0c2340] group-hover:text-[#c5a059]">
                          {p.name}
                        </span>
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#c5a059]/10 text-[#c5a059] font-semibold">
                          {p.categoryLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5a6b7c] truncate">{p.shortDescription}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-[#0c2340]">
                        ${p.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Programs */}
          {matchingPrograms.length > 0 && (
            <div>
              <h4 className="text-xs uppercase font-bold tracking-wider text-[#5a6b7c] mb-3 px-2">
                Wellness Programs ({matchingPrograms.length})
              </h4>
              <div className="space-y-2">
                {matchingPrograms.map((prog) => (
                  <div
                    key={prog.id}
                    onClick={() => {
                      onClose();
                      navigate('wellness-programs');
                    }}
                    className="p-2.5 rounded-xl hover:bg-[#f6f4ee] transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#0c2340] group-hover:text-[#c5a059]">
                          {prog.name}
                        </span>
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#c5a059]/15 text-[#c5a059] font-semibold">
                          {prog.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5a6b7c]">{prog.shortDescription}</p>
                    </div>
                    <span className="text-xs font-medium text-[#c5a059]">
                      ${prog.priceMonthly}/mo
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Articles */}
          {matchingArticles.length > 0 && (
            <div>
              <h4 className="text-xs uppercase font-bold tracking-wider text-[#5a6b7c] mb-3 px-2">
                Clinical Research &amp; Articles ({matchingArticles.length})
              </h4>
              <div className="space-y-2">
                {matchingArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => {
                      onClose();
                      navigate('article-detail', art.slug);
                    }}
                    className="p-2.5 rounded-xl hover:bg-[#f6f4ee] transition-colors cursor-pointer group"
                  >
                    <span className="text-xs font-semibold text-[#0c2340] group-hover:text-[#c5a059]">
                      {art.title}
                    </span>
                    <p className="text-[11px] text-[#5a6b7c] truncate">{art.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {trimmed && matchingProducts.length === 0 && matchingPrograms.length === 0 && matchingArticles.length === 0 && (
            <div className="text-center py-8 text-[#5a6b7c]">
              <p className="text-xs">No matching formulations or protocols found for "{query}".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
