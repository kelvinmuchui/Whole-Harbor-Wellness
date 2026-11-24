import React, { useEffect, useState } from 'react';
import { dbService } from '../services/dbService.ts';
import { sanitizeLinkUrl } from '../lib/mediaUtils.ts';
import type { CmsPageContent } from '../types/index.ts';

interface LegalViewProps {
  slug: string;
  navigate: (path: string, param?: string) => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ slug, navigate }) => {
  const [page, setPage] = useState<CmsPageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadPage = async () => {
      setLoading(true);
      try {
        const found = await dbService.getCmsPageBySlug(slug);
        if (active) {
          setPage(found);
        }
      } catch (err) {
        console.error('Failed to load CMS page:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadPage();
    const unsub = dbService.subscribeToCollections(['cms_pages'], () => {
      void loadPage();
    });
    return () => {
      active = false;
      unsub();
    };
  }, [slug]);

  useEffect(() => {
    if (!page) return;
    document.title = page.seoTitle || `${page.title} – Whole Harbor Wellness`;
  }, [page]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-[#5a6b7c]">
        <p className="text-sm">Loading page...</p>
      </div>
    );
  }

  if (!page || page.status === 'DRAFT') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-[#fffdfb] border border-[#dfd7c7] rounded-3xl p-10 text-center space-y-4 shadow-xs">
          <span className="material-symbols-outlined text-[40px] text-[#c5a059]">article</span>
          <h1 className="font-serif text-3xl font-bold text-[#0c2340]">
            Page Not Found
          </h1>
          <p className="text-sm text-[#5a6b7c] max-w-md mx-auto">
            The requested document or page is not currently published.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('home')}
              className="px-5 py-2.5 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer"
            >
              Return Home
            </button>
            <button
              type="button"
              onClick={() => navigate('shop')}
              className="px-5 py-2.5 rounded-xl border border-[#dfd7c7] text-[#0c2340] text-xs font-semibold hover:bg-[#f6f4ee] transition-colors cursor-pointer"
            >
              Browse Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  const safeCtaPath = sanitizeLinkUrl(page.ctaPath);

  const handleCtaClick = () => {
    if (!page.ctaPath) {
      navigate('shop');
      return;
    }
    if (/^https?:\/\//i.test(page.ctaPath)) {
      window.location.href = page.ctaPath;
      return;
    }
    const clean = page.ctaPath.replace(/^#?\//, '');
    navigate(clean || 'shop');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-10">
      <div className="space-y-4 border-b border-[#dfd7c7] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f6f4ee] border border-[#dfd7c7] text-[#c5a059] text-[10px] font-bold uppercase tracking-widest">
            {page.category}
          </span>
          <span className="text-xs text-[#5a6b7c]">
            Updated {new Date(page.updatedAt).toLocaleDateString()}
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#0c2340] tracking-tight">
          {page.title}
        </h1>
        {page.subtitle && (
          <p className="text-base text-[#5a6b7c] leading-relaxed max-w-3xl">
            {page.subtitle}
          </p>
        )}
      </div>

      <div className="bg-[#fffdfb] border border-[#dfd7c7] rounded-3xl p-7 sm:p-10 shadow-xs space-y-6">
        <div className="space-y-4 text-sm text-[#111d2b] leading-relaxed">
          {page.body
            .split(/\n{2,}/)
            .map((para) => para.trim())
            .filter(Boolean)
            .map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
        </div>

        {page.sections && page.sections.length > 0 && (
          <div className="pt-4 border-t border-[#dfd7c7] space-y-5">
            {page.sections.map((section, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7]/80 space-y-2"
              >
                <h2 className="font-serif text-xl font-semibold text-[#0c2340]">
                  {section.title}
                </h2>
                <p className="text-sm text-[#5a6b7c] leading-relaxed">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-[#dfd7c7] flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('contact')}
            className="text-xs font-semibold text-[#5a6b7c] hover:text-[#0c2340] cursor-pointer"
          >
            Questions? Contact Compliance &amp; Care Support →
          </button>

          {page.ctaLabel && safeCtaPath ? (
            <button
              type="button"
              onClick={handleCtaClick}
              className="px-5 py-2.5 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer"
            >
              {page.ctaLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('shop')}
              className="px-5 py-2.5 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer"
            >
              Explore Formulations
            </button>
          )}
        </div>
      </div>

      {/* Quick navigation across compliance documents */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Privacy Policy', path: 'privacy' },
          { label: 'Terms of Service', path: 'terms' },
          { label: 'CoA Verification', path: 'coa-verification' },
          { label: 'Cold-Chain Protocol', path: 'cold-chain' }
        ].map((item) => (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate(item.path)}
            className={`px-4 py-3 rounded-2xl border text-xs font-semibold text-left transition-all cursor-pointer ${
              slug === item.path
                ? 'bg-[#0c2340] text-white border-[#0c2340]'
                : 'bg-[#fffdfb] text-[#0c2340] border-[#dfd7c7] hover:border-[#c5a059]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LegalView;
