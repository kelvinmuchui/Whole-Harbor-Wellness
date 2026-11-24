import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService.ts';
import { WellnessProgram } from '../types/index.ts';

interface ProgramsViewProps {
  navigate: (path: string, param?: string) => void;
}

export const ProgramsView: React.FC<ProgramsViewProps> = ({ navigate }) => {
  const [programs, setPrograms] = useState<WellnessProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<WellnessProgram | null>(null);
  const [enrollSubmitted, setEnrollSubmitted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let active = true;
    const loadPrograms = async () => {
      try {
        const data = await dbService.getPrograms();
        if (active) setPrograms(data.filter((p) => p.status === 'ACTIVE'));
      } catch (error) {
        console.error('Failed to load wellness programs', error);
      }
    };
    void loadPrograms();
    const unsubscribe = dbService.subscribeToCollections(['wellness_programs'], () => {
      void loadPrograms();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!selectedProgram) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProgram(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProgram]);

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-[#c5a059]">
          STRUCTURED WELLNESS PATHWAYS
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#0c2340] font-bold">
          Holistic Longevity &amp; Wellness Programs
        </h1>
        <p className="text-xs sm:text-sm text-[#5a6b7c] leading-relaxed">
          Comprehensive, research-backed protocols combining verified peptide education, 
          continuous biomarker tracking, lifestyle optimization, and structured wellness oversight.
        </p>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {programs.map((prog) => (
          <div
            key={prog.id}
            className="bg-[#f6f4ee] border border-[#dfd7c7] rounded-3xl p-8 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1 rounded-full bg-[#c5a059] text-[#fffdfb] text-xs font-bold uppercase tracking-wider">
                  {prog.tag}
                </span>
                <span className="text-xs font-semibold text-[#5a6b7c] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  {prog.duration}
                </span>
              </div>

              {prog.imageUrl && (
                <div className="h-44 rounded-2xl overflow-hidden border border-[#dfd7c7] bg-white">
                  <img
                    src={prog.imageUrl}
                    alt={prog.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0c2340]">
                  {prog.name}
                </h3>
                <p className="text-xs text-[#5a6b7c] mt-2 leading-relaxed">
                  {prog.fullDescription || prog.shortDescription}
                </p>
                {prog.eligibility && (
                  <p className="text-[11px] font-medium text-[#0c2340] bg-white/80 border border-[#dfd7c7] rounded-xl px-3 py-2 mt-3">
                    <span className="font-bold text-[#c5a059] uppercase tracking-wider mr-1.5">Eligibility:</span>
                    {prog.eligibility}
                  </p>
                )}
              </div>

              {/* Inclusions */}
              <div className="space-y-3 pt-4 border-t border-[#dfd7c7]/60 text-xs text-[#0c2340]">
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#5a6b7c]">
                  What's Included:
                </h4>
                {prog.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-[#c5a059]">verified</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-[#dfd7c7] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#5a6b7c] block">Supervised Protocol</span>
                <span className="font-serif text-2xl font-bold text-[#0c2340]">
                  ${prog.priceMonthly}
                  <span className="text-xs font-normal text-[#5a6b7c]"> / month</span>
                </span>
              </div>

              <button
                onClick={() => {
                  const link = prog.ctaLink?.trim();
                  if (link && link.startsWith('/')) {
                    navigate(link.replace(/^#?\//, ''));
                    return;
                  }
                  setSelectedProgram(prog);
                  setEnrollSubmitted(false);
                }}
                className="px-6 py-3 rounded-xl bg-[#c5a059] text-[#fffdfb] text-xs font-semibold uppercase tracking-wider hover:bg-[#0c2340] transition-colors cursor-pointer shadow-sm"
              >
                {prog.ctaLabel || 'Enroll in Track'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Clinical Consultation Modal */}
      {selectedProgram && (
        <div
          className="fixed inset-0 z-50 bg-[#0c2340]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedProgram(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Program onboarding"
        >
          <div
            className="relative bg-[#fffdfb] w-full sm:max-w-lg max-h-[92dvh] sm:max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#dfd7c7] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pinned Header */}
            <div className="shrink-0 px-5 sm:px-7 py-4 border-b border-[#dfd7c7] bg-[#f6f4ee] flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#c5a059]">
                  Program Onboarding
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0c2340] mt-0.5">
                  {selectedProgram.name}
                </h3>
                <p className="text-xs text-[#5a6b7c] mt-0.5">
                  ${selectedProgram.priceMonthly}/month • {selectedProgram.duration} supervised track
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                aria-label="Cancel"
                className="w-10 h-10 rounded-full bg-white border border-[#dfd7c7] hover:border-[#0c2340] flex items-center justify-center text-[#5a6b7c] hover:text-[#0c2340] cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {enrollSubmitted ? (
              <div className="flex-1 overflow-y-auto text-center p-6 sm:p-8 space-y-4 pb-[calc(24px+env(safe-area-inset-bottom))]">
                <div className="w-14 h-14 rounded-full bg-[#dfd7c7] text-[#c5a059] flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[32px]">check</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#0c2340]">
                  Intake Request Received
                </h3>
                <p className="text-xs text-[#5a6b7c] max-w-sm mx-auto leading-relaxed">
                  Our clinical care coordinator has reserved your onboarding slot for the <strong>{selectedProgram.name}</strong>. A medical questionnaire has been dispatched to {email}.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedProgram(null)}
                  className="px-6 py-2.5 rounded-xl bg-[#c5a059] text-white text-xs font-semibold cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <form id="whw-program-enroll-form" onSubmit={handleEnrollSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-4 text-xs">
                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">Primary Wellness Objective / Notes</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Visceral fat loss, lean muscle recovery, mitochondrial fatigue..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                  </div>
                </form>

                {/* Pinned Footer with Cancel */}
                <div className="shrink-0 px-5 sm:px-7 py-3.5 pb-[calc(14px+env(safe-area-inset-bottom))] border-t border-[#dfd7c7] bg-[#f6f4ee] flex flex-col-reverse sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedProgram(null)}
                    className="sm:w-32 py-3 px-4 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] hover:border-[#0c2340] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="whw-program-enroll-form"
                    className="flex-1 py-3 px-4 rounded-xl bg-[#c5a059] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0c2340] transition-colors cursor-pointer"
                  >
                    Submit Consultation Request
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
