import React from 'react';

interface PerksModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string, param?: string) => void;
}

export const PerksModal: React.FC<PerksModalProps> = ({ isOpen, onClose, navigate }) => {
  if (!isOpen) return null;

  const perks = [
    {
      icon: '◇',
      title: 'First-order offer',
      desc: 'Use FIRST20 at checkout for 20% savings with Bitcoin or 15% with card payment.'
    },
    {
      icon: '♔',
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
      desc: 'Direct concierge support via WhatsApp or email before, during, and after dispatch.'
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="relative bg-[#fffdfb] max-w-xl w-full rounded-3xl border border-[#ead2ce] shadow-2xl p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#fff6f3] hover:bg-[#ead2ce] text-[#744241] flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header with Crown */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-[#fff6f3] border border-[#ead2ce] text-[#b87572] flex items-center justify-center font-serif text-2xl mx-auto shadow-2xs">
            ♕
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#b87572] pt-2">
            YOUR MEMBER BENEFITS
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#744241]">
            Your Whole Harbor Perks
          </h2>
          <p className="text-xs text-[#7c6b69] max-w-md mx-auto leading-relaxed">
            Thoughtful savings and personal support designed to make every order easier.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[55vh] overflow-y-auto pr-1">
          {perks.map((p, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#fff6f3] border border-[#ead2ce] flex items-start gap-3 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-white border border-[#ead2ce] text-[#b87572] flex items-center justify-center font-serif text-base shrink-0">
                {p.icon}
              </div>
              <div className="space-y-0.5">
                <b className="text-xs font-bold text-[#744241] block">{p.title}</b>
                <p className="text-[11px] text-[#7c6b69] leading-snug">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-[#ead2ce]">
          <button
            onClick={() => {
              onClose();
              navigate('shop');
            }}
            className="w-full py-3.5 rounded-xl bg-[#b87572] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#744241] transition-colors cursor-pointer shadow-xs text-center"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
