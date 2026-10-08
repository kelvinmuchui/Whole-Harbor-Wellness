import React from 'react';

interface FooterProps {
  navigate: (path: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-[#744241] text-[#fffdfb] pt-16 pb-12 border-t border-[#7c6b69]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#7c6b69]/60">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-[#7c6b69]/40 flex items-center justify-center bg-[#b87572] text-[#fffdfb]">
                <span className="material-symbols-outlined text-[20px]">spa</span>
              </div>
              <div>
                <span className="font-serif text-2xl text-[#fffdfb] tracking-tight font-medium">
                  Whole Harbor
                </span>
                <span className="block font-sans text-[10px] uppercase tracking-[0.25em] text-[#7c6b69] font-semibold">
                  Wellness &amp; Health
                </span>
              </div>
            </div>
            
            <p className="text-sm text-[#ead2ce]/80 max-w-sm leading-relaxed">
              Wellness Should Be Personal. Whole Harbor unifies certified clinical-grade peptide protocols, 
              cold-chain metabolic kits, and turnkey clinic partnerships to help individuals and practitioners take true ownership of longevity.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b87572]/50 border border-[#7c6b69]/30 text-xs text-[#ead2ce]">
                <span className="w-2 h-2 rounded-full bg-[#7c6b69] animate-pulse"></span>
                <span>cGMP Certified Sourcing • Cold-Chain Tracked</span>
              </div>
            </div>
          </div>

          {/* Column 1: Catalog */}
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-[#fff6f3] mb-4">
              Formulations
            </h4>
            <ul className="space-y-2.5 text-xs text-[#ead2ce]/80">
              <li>
                <button onClick={() => navigate('shop', 'metabolic')} className="hover:text-white transition-colors cursor-pointer">
                  Metabolic Support Kits
                </button>
              </li>
              <li>
                <button onClick={() => navigate('shop', 'cellular')} className="hover:text-white transition-colors cursor-pointer">
                  Cellular Optimization
                </button>
              </li>
              <li>
                <button onClick={() => navigate('shop', 'recovery')} className="hover:text-white transition-colors cursor-pointer">
                  Tissue Recovery Protocols
                </button>
              </li>
              <li>
                <button onClick={() => navigate('shop', 'longevity')} className="hover:text-white transition-colors cursor-pointer">
                  Longevity &amp; Vitality
                </button>
              </li>
              <li>
                <button onClick={() => navigate('shop', 'stacks')} className="hover:text-white transition-colors cursor-pointer">
                  Synergy Multi-Kits
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Ecosystem */}
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-[#fff6f3] mb-4">
              Ecosystem
            </h4>
            <ul className="space-y-2.5 text-xs text-[#ead2ce]/80">
              <li>
                <button onClick={() => navigate('wellness-programs')} className="hover:text-white transition-colors cursor-pointer">
                  Physician-Led Programs
                </button>
              </li>
              <li>
                <button onClick={() => navigate('approach')} className="hover:text-white transition-colors cursor-pointer">
                  Our Clinical Approach
                </button>
              </li>
              <li>
                <button onClick={() => navigate('partners')} className="hover:text-white transition-colors cursor-pointer">
                  Become a Partner Clinic
                </button>
              </li>
              <li>
                <button onClick={() => navigate('partner-portal')} className="hover:text-white transition-colors cursor-pointer">
                  Partner Portal Login
                </button>
              </li>
              <li>
                <button onClick={() => navigate('learn')} className="hover:text-white transition-colors cursor-pointer">
                  Clinical Studies &amp; Research
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Support */}
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-[#fff6f3] mb-4">
              Company &amp; Trust
            </h4>
            <ul className="space-y-2.5 text-xs text-[#ead2ce]/80">
              <li>
                <button onClick={() => navigate('about')} className="hover:text-white transition-colors cursor-pointer">
                  About Whole Harbor
                </button>
              </li>
              <li>
                <button onClick={() => navigate('faq')} className="hover:text-white transition-colors cursor-pointer">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => navigate('about', 'testimonials')} className="hover:text-white transition-colors cursor-pointer">
                  Clinician Testimonials
                </button>
              </li>
              <li>
                <button onClick={() => navigate('contact')} className="hover:text-white transition-colors cursor-pointer">
                  Contact Clinical Concierge
                </button>
              </li>
              <li>
                <button onClick={() => navigate('admin')} className="hover:text-[#b87572] text-[#7c6b69] transition-colors cursor-pointer flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  Admin Control Center
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#7c6b69]">
          <p>© {new Date().getFullYear()} Whole Harbor Wellness, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="cursor-pointer hover:text-[#ead2ce]">Privacy Policy</span>
            <span className="cursor-pointer hover:text-[#ead2ce]">Terms of Service</span>
            <span className="cursor-pointer hover:text-[#ead2ce]">CoA Verification</span>
            <span className="cursor-pointer hover:text-[#ead2ce]">Cold-Chain Protocol</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
