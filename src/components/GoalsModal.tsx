import React from 'react';

interface GoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string, param?: string) => void;
}

export const GoalsModal: React.FC<GoalsModalProps> = ({ isOpen, onClose, navigate }) => {
  if (!isOpen) return null;

  const goals = [
    {
      id: 'metabolic',
      icon: 'monitor_weight',
      title: 'Metabolic & Weight Care',
      desc: 'Dual-target GLP-1 & GIP activators with methylated B12 for sustainable body composition and metabolic health.'
    },
    {
      id: 'cellular',
      icon: 'bolt',
      title: 'Cellular Optimization & NAD+',
      desc: 'Mitochondrial biogenesis peptides and NAD+ cofactors to restore intracellular bioenergetics.'
    },
    {
      id: 'recovery',
      icon: 'healing',
      title: 'Tissue & Joint Recovery',
      desc: 'Synthesized restorative peptide complexes engineered for tendon, ligament, and gut mucosal repair.'
    },
    {
      id: 'longevity',
      icon: 'hourglass_empty',
      title: 'Longevity & Deep Vitality',
      desc: 'Telomeric maintenance, GH secretagogue protocols, and deep sleep architecture enhancement.'
    },
    {
      id: 'stacks',
      icon: 'layers',
      title: 'Synergy Multi-Kits',
      desc: 'Combined therapeutic regimens engineered for compound clinical outcomes with tiered savings.'
    }
  ];

  const handleSelectGoal = (categoryId: string) => {
    onClose();
    navigate('shop', categoryId);
  };

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

        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#b87572] mb-1">
            SHOP WITH PURPOSE
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#744241]">
            What would you like to explore?
          </h2>
          <p className="text-xs text-[#7c6b69] mt-1 leading-relaxed">
            Choose a wellness goal and we will take you directly to the most relevant products and educational information.
          </p>
        </div>

        {/* Goals Choice Grid */}
        <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {goals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => handleSelectGoal(goal.id)}
              className="w-full text-left p-4 rounded-2xl bg-[#fff6f3] hover:bg-white border border-[#ead2ce] hover:border-[#b87572] transition-all flex items-center justify-between gap-4 group cursor-pointer shadow-2xs hover:shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-[#b87572] text-[#b87572] group-hover:text-white border border-[#ead2ce] flex items-center justify-center transition-colors shrink-0">
                  <span className="material-symbols-outlined text-[20px]">{goal.icon}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#744241] group-hover:text-[#b87572] transition-colors">
                    {goal.title}
                  </h4>
                  <p className="text-[11px] text-[#7c6b69] line-clamp-2 mt-0.5 leading-snug">
                    {goal.desc}
                  </p>
                </div>
              </div>
              <span className="text-[#b87572] font-bold text-sm group-hover:translate-x-1 transition-transform shrink-0">
                →
              </span>
            </button>
          ))}
        </div>

        {/* Guidance Prompt */}
        <div className="pt-2 border-t border-[#ead2ce] text-center text-xs text-[#7c6b69]">
          <span>Not sure where to begin? </span>
          <a
            href="https://wa.me/529841721536?text=Hi%20Kelvin%2C%20I%20would%20like%20help%20choosing%20a%20wellness%20category."
            target="_blank"
            rel="noreferrer"
            className="text-[#b87572] font-bold hover:underline"
          >
            Ask Kelvin for personal guidance →
          </a>
        </div>
      </div>
    </div>
  );
};
