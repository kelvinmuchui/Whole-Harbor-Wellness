import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../services/dbService.ts';
import { FAQ } from '../types/index.ts';

interface FAQViewProps {
  navigate: (path: string, param?: string) => void;
}

export const FAQView: React.FC<FAQViewProps> = ({ navigate }) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');

  useEffect(() => {
    dbService.getFaqs().then((data) => {
      setFaqs(data);
    });
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(faqs.map(f => f.category)));
    return ['all', ...cats];
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter(f => {
      const matchesCat = activeCategory === 'all' || f.category === activeCategory;
      const matchesSearch = !searchQuery || 
        f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [faqs, activeCategory, searchQuery]);

  const toggleAccordion = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-[#5a6b7c]">
          Knowledge Base &amp; Help Desk
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#0c2340] font-bold">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-[#5a6b7c] leading-relaxed">
          Comprehensive answers on peptide reconstitution, cold-chain temperature monitoring, clinical verification, partner practice integration, and order logistics.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-2 bg-white border border-[#dfd7c7] rounded-full px-4 py-3 shadow-xs">
          <span className="material-symbols-outlined text-[20px] text-[#5a6b7c]">search</span>
          <input
            type="text"
            placeholder="Search answers by keyword (e.g. cold-chain, purity, dosing)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm bg-transparent outline-none text-[#111d2b] placeholder:text-[#5a6b7c]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-[#5a6b7c] hover:text-[#0c2340] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-[#0c2340] text-white shadow-xs'
                : 'bg-white border border-[#dfd7c7] text-[#5a6b7c] hover:text-[#0c2340] hover:bg-[#f6f4ee]'
            }`}
          >
            {cat === 'all' ? 'All Questions' : cat}
          </button>
        ))}
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isExpanded = expandedId === faq.id;
          return (
            <div
              key={faq.id}
              className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'bg-white border-[#c5a059] shadow-sm'
                  : 'bg-[#fffdfb] border-[#dfd7c7] hover:border-[#c5a059]/60'
              }`}
            >
              <button
                onClick={() => toggleAccordion(faq.id)}
                className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
              >
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#c5a059]">
                    {faq.category}
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#0c2340]">
                    {faq.question}
                  </h3>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                  isExpanded ? 'bg-[#c5a059] text-white rotate-180' : 'bg-[#f6f4ee] text-[#0c2340]'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#5a6b7c] leading-relaxed border-t border-[#dfd7c7]/50">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12 bg-white border border-[#dfd7c7] rounded-3xl space-y-3">
            <span className="material-symbols-outlined text-[36px] text-[#c5a059]">help_outline</span>
            <h3 className="font-serif text-xl font-bold text-[#0c2340]">No matching questions found</h3>
            <p className="text-xs text-[#5a6b7c] max-w-md mx-auto">
              We couldn't find an answer matching "{searchQuery}". Please reach out to our Clinical Concierge directly for personal guidance.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="px-5 py-2 rounded-xl bg-[#c5a059] text-white text-xs font-semibold cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        )}
      </div>

      {/* Still Have Questions Banner */}
      <div className="bg-[#f6f4ee] border border-[#dfd7c7] rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0c2340]">
            Still have questions about your protocol?
          </h3>
          <p className="text-xs text-[#5a6b7c] max-w-lg">
            Our clinical team and concierge are available 6 days a week to assist with titration schedules, HPLC lab reports, or clinic partnership setup.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('contact')}
            className="px-6 py-3 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer"
          >
            Contact Concierge
          </button>
          <a
            href="https://wa.me/529841721536?text=Hi%20Kelvin%2C%20I%20have%20a%20question%20about%20Whole%20Harbor%20Wellness."
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] text-xs font-semibold hover:bg-[#fffdfb] transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>WhatsApp Kelvin</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </div>
  );
};
