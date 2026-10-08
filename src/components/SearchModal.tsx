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
    if (isOpen) {
      dbService.getProducts().then(setProducts);
      dbService.getPrograms().then(setPrograms);
      dbService.getArticles().then(setArticles);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const matchingProducts = trimmed
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmed) ||
          p.categoryLabel.toLowerCase().includes(trimmed) ||
          p.description.toLowerCase().includes(trimmed)
      )
    : products.slice(0, 4);

  const matchingPrograms = trimmed
    ? programs.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmed) ||
          p.category.toLowerCase().includes(trimmed) ||
          p.shortDescription.toLowerCase().includes(trimmed)
      )
    : [];

  const matchingArticles = trimmed
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(trimmed) ||
          a.summary.toLowerCase().includes(trimmed) ||
          a.category.toLowerCase().includes(trimmed)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#744241]/50 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
      <div className="relative bg-[#fffdfb] w-full max-w-2xl rounded-2xl border border-[#ead2ce] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#ead2ce] bg-[#fff6f3] flex items-center gap-3">
          <span className="material-symbols-outlined text-[#b87572] text-[24px]">search</span>
          <input
            type="text"
            autoFocus
            placeholder="Search peptides, programs, articles, or clinical protocols..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#744241] placeholder-[#7c6b69] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#7c6b69] hover:text-[#744241] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-[#7c6b69] hover:text-[#744241] rounded-lg bg-[#ead2ce]/40 cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          
          {/* Products */}
          {matchingProducts.length > 0 && (
            <div>
              <h4 className="text-xs uppercase font-bold tracking-wider text-[#7c6b69] mb-3 px-2">
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
                    className="p-2.5 rounded-xl hover:bg-[#fff6f3] transition-colors flex items-center gap-3 cursor-pointer group"
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-12 h-12 rounded-lg object-cover bg-white border border-[#ead2ce] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#744241] group-hover:text-[#b87572]">
                          {p.name}
                        </span>
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#b87572]/10 text-[#b87572] font-semibold">
                          {p.categoryLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7c6b69] truncate">{p.shortDescription}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-[#744241]">
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
              <h4 className="text-xs uppercase font-bold tracking-wider text-[#7c6b69] mb-3 px-2">
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
                    className="p-2.5 rounded-xl hover:bg-[#fff6f3] transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#744241] group-hover:text-[#b87572]">
                          {prog.name}
                        </span>
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#b87572]/15 text-[#b87572] font-semibold">
                          {prog.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7c6b69]">{prog.shortDescription}</p>
                    </div>
                    <span className="text-xs font-medium text-[#b87572]">
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
              <h4 className="text-xs uppercase font-bold tracking-wider text-[#7c6b69] mb-3 px-2">
                Clinical Research &amp; Articles ({matchingArticles.length})
              </h4>
              <div className="space-y-2">
                {matchingArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => {
                      onClose();
                      navigate('learn');
                    }}
                    className="p-2.5 rounded-xl hover:bg-[#fff6f3] transition-colors cursor-pointer group"
                  >
                    <span className="text-xs font-semibold text-[#744241] group-hover:text-[#b87572]">
                      {art.title}
                    </span>
                    <p className="text-[11px] text-[#7c6b69] truncate">{art.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {trimmed && matchingProducts.length === 0 && matchingPrograms.length === 0 && matchingArticles.length === 0 && (
            <div className="text-center py-8 text-[#7c6b69]">
              <p className="text-xs">No matching formulations or protocols found for "{query}".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
