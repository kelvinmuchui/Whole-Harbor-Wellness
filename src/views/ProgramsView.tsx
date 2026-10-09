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
    dbService.getPrograms().then(setPrograms);
  }, []);

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-[#5a6b7c]">
          Structured Protocols
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#0c2340] font-bold">
          Physician-Guided Longevity Programs
        </h1>
        <p className="text-xs sm:text-sm text-[#5a6b7c] leading-relaxed">
          Comprehensive, research-backed protocols combining pharmaceutical-grade peptide therapy, 
          continuous biomarker tracking, and personalized medical oversight from licensed longevity physicians.
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

              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0c2340]">
                  {prog.name}
                </h3>
                <p className="text-xs text-[#5a6b7c] mt-2 leading-relaxed">
                  {prog.fullDescription || prog.shortDescription}
                </p>
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
                  setSelectedProgram(prog);
                  setEnrollSubmitted(false);
                }}
                className="px-6 py-3 rounded-xl bg-[#c5a059] text-[#fffdfb] text-xs font-semibold uppercase tracking-wider hover:bg-[#0c2340] transition-colors cursor-pointer shadow-sm"
              >
                Enroll in Track
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Clinical Consultation Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c2340]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-[#fffdfb] w-full max-w-lg rounded-3xl border border-[#dfd7c7] shadow-2xl overflow-hidden p-6 sm:p-8 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedProgram(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[#5a6b7c] hover:bg-[#f6f4ee] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {enrollSubmitted ? (
              <div className="text-center py-8 space-y-4">
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
                  onClick={() => setSelectedProgram(null)}
                  className="px-6 py-2.5 rounded-xl bg-[#c5a059] text-white text-xs font-semibold cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5a6b7c]">
                  Program Onboarding
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#0c2340] mt-1">
                  {selectedProgram.name}
                </h3>
                <p className="text-xs text-[#5a6b7c] mt-1">
                  ${selectedProgram.priceMonthly}/month • {selectedProgram.duration} supervised track
                </p>

                <form onSubmit={handleEnrollSubmit} className="mt-6 space-y-4 text-xs">
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

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#c5a059] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0c2340] transition-colors cursor-pointer"
                  >
                    Submit Clinical Consultation Request
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
