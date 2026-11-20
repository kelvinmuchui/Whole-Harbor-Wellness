import React from 'react';

interface PerksModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string, param?: string) => void;
}

export const PerksModal: React.FC<PerksModalProps> = ({ isOpen, onClose, navigate }) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const perks = [
    {
      icon: '◇',
      title: 'First-order offer',
      desc: 'Use FIRST20 at checkout for 20% savings with Bitcoin or 15% with card payment.'
    },
    {
      icon: '✦',
      title: 'Complimentary reward',
      desc: 'Orders over $300 automatically receive complimentary USP Bacteriostatic Water included in the package.'
    },
    {
      icon: '▱',
      title: 'Free standard shipping',
      desc: 'Orders over $200 qualify for free express temperature-buffered shipping.'
    },
    {
      icon: '♡',
      title: 'Volume savings',
      desc: 'Save 5% on 2–3 kits, 8% on 4–5 kits, and 12% on 6 or more kits applied automatically.'
    },
    {
      icon: '↗',
      title: 'Referral benefits',
      desc: 'Partner members receive dedicated attribution discounts and ongoing commission earnings.'
    },
    {
      icon: '□',
      title: 'Personal order care',
      desc: 'Direct customer support via email or in-app support before, during, and after dispatch.'
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Whole Harbor Member Perks"
    >
      <div
        className="relative bg-[#fffdfb] max-w-xl w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#dfd7c7] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Header */}
        <div className="shrink-0 relative px-5 sm:px-7 py-5 border-b border-[#dfd7c7] bg-[#f6f4ee] text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white border border-[#dfd7c7] hover:border-[#0c2340] text-[#0c2340] flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>

          <div className="w-11 h-11 rounded-full bg-white border border-[#dfd7c7] text-[#c5a059] flex items-center justify-center font-serif text-xl mx-auto shadow-2xs">
            ✦
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#c5a059] pt-2">
            YOUR MEMBER BENEFITS
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0c2340]">
            Your Whole Harbor Perks
          </h2>
          <p className="text-xs text-[#5a6b7c] max-w-md mx-auto leading-relaxed mt-0.5">
            Thoughtful savings and personal support designed to make every order easier.
          </p>
        </div>

        {/* Scrollable Benefits Grid */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {perks.map((p, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7] flex items-start gap-3 shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-[#dfd7c7] text-[#c5a059] flex items-center justify-center font-serif text-base shrink-0">
                  {p.icon}
                </div>
                <div className="space-y-0.5">
                  <b className="text-xs font-bold text-[#0c2340] block">{p.title}</b>
                  <p className="text-[11px] text-[#5a6b7c] leading-snug">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pinned Footer with Close + Continue */}
        <div className="shrink-0 px-5 sm:px-7 py-3.5 pb-[calc(14px+env(safe-area-inset-bottom))] border-t border-[#dfd7c7] bg-[#f6f4ee] flex flex-col-reverse sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="sm:w-32 py-3 px-4 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] hover:border-[#0c2340] text-xs font-semibold transition-colors cursor-pointer text-center"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('shop');
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-[#c5a059] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#0c2340] transition-colors cursor-pointer shadow-xs text-center"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
