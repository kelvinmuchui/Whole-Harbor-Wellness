import React from 'react';

interface GoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string, param?: string) => void;
}

export const GoalsModal: React.FC<GoalsModalProps> = ({ isOpen, onClose, navigate }) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Explore wellness goals"
    >
      <div
        className="relative bg-[#fffdfb] max-w-xl w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#dfd7c7] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Header */}
        <div className="shrink-0 px-5 sm:px-7 py-5 border-b border-[#dfd7c7] bg-[#f6f4ee] flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#c5a059] mb-1">
              SHOP WITH PURPOSE
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0c2340]">
              What would you like to explore?
            </h2>
            <p className="text-xs text-[#5a6b7c] mt-1 leading-relaxed">
              Choose a wellness goal and we will take you directly to the most relevant formulations.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white border border-[#dfd7c7] hover:border-[#0c2340] text-[#0c2340] flex items-center justify-center text-sm font-bold transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Goals Choice Grid */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-3">
          {goals.map((goal) => (
            <button
              key={goal.id}
              type="button"
              onClick={() => handleSelectGoal(goal.id)}
              className="w-full text-left p-4 rounded-2xl bg-[#f6f4ee] hover:bg-white border border-[#dfd7c7] hover:border-[#c5a059] transition-all flex items-center justify-between gap-4 group cursor-pointer shadow-2xs hover:shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-[#c5a059] text-[#c5a059] group-hover:text-white border border-[#dfd7c7] flex items-center justify-center transition-colors shrink-0">
                  <span className="material-symbols-outlined text-[20px]">{goal.icon}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0c2340] group-hover:text-[#c5a059] transition-colors">
                    {goal.title}
                  </h4>
                  <p className="text-[11px] text-[#5a6b7c] line-clamp-2 mt-0.5 leading-snug">
                    {goal.desc}
                  </p>
                </div>
              </div>
              <span className="text-[#c5a059] font-bold text-sm group-hover:translate-x-1 transition-transform shrink-0">
                →
              </span>
            </button>
          ))}
        </div>

        {/* Pinned Footer with Cancel */}
        <div className="shrink-0 px-5 sm:px-7 py-3.5 pb-[calc(14px+env(safe-area-inset-bottom))] border-t border-[#dfd7c7] bg-[#f6f4ee] flex flex-wrap items-center justify-between gap-3 text-xs text-[#5a6b7c]">
          <div>
            <span>Not sure where to begin? </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('learn');
              }}
              className="text-[#c5a059] font-bold hover:underline cursor-pointer"
            >
              Explore guides →
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] hover:border-[#0c2340] font-semibold cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
