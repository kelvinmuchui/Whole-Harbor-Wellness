import React from 'react';

interface ApproachViewProps {
  navigate: (path: string, param?: string) => void;
}

export const ApproachView: React.FC<ApproachViewProps> = ({ navigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-[#5a6b7c]">
          Methodology &amp; Standards
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#0c2340] font-bold">
          The Whole Harbor Clinical Standard
        </h1>
        <p className="text-xs sm:text-sm text-[#5a6b7c] leading-relaxed">
          Peptide synthesis and hormone precursor distribution require rigorous analytical chemistry. 
          We eliminate the safety hazards common to unregulated research chemical vendors.
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#f6f4ee] border border-[#dfd7c7] p-6 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#c5a059] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">biotech</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-[#0c2340]">
            1. Verified Synthesis
          </h3>
          <p className="text-xs text-[#5a6b7c] leading-relaxed">
            Synthesized in compliant cGMP cleanroom facilities utilizing solid-phase peptide synthesis (SPPS) and certified counter-ion exchange.
          </p>
        </div>

        <div className="bg-[#f6f4ee] border border-[#dfd7c7] p-6 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#c5a059] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-[#0c2340]">
            2. Dual Analytical Assay
          </h3>
          <p className="text-xs text-[#5a6b7c] leading-relaxed">
            Every batch undergoes High-Performance Liquid Chromatography (HPLC) and Mass Spectrometry (MS) to guarantee &gt;99.2% single main-peak purity.
          </p>
        </div>

        <div className="bg-[#f6f4ee] border border-[#dfd7c7] p-6 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#c5a059] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">ac_unit</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-[#0c2340]">
            3. Active Cold-Chain
          </h3>
          <p className="text-xs text-[#5a6b7c] leading-relaxed">
            Biological peptides undergo thermal denaturation when exposed to ambient transit heat. We ship strictly via insulated, cold-packed overnight couriers.
          </p>
        </div>

        <div className="bg-[#f6f4ee] border border-[#dfd7c7] p-6 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#c5a059] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">handshake</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-[#0c2340]">
            4. Physician Integration
          </h3>
          <p className="text-xs text-[#5a6b7c] leading-relaxed">
            Protocols are integrated with partner physicians and sports medicine clinics to ensure appropriate patient dosing and continuous biomarker feedback.
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white border border-[#dfd7c7] rounded-3xl overflow-hidden shadow-xs">
        <div className="p-6 bg-[#f6f4ee] border-b border-[#dfd7c7]">
          <h3 className="font-serif text-xl font-bold text-[#0c2340]">
            Specification Benchmark: Whole Harbor vs. Research Vendors
          </h3>
          <p className="text-xs text-[#5a6b7c] mt-1">
            Understanding why pharmaceutical rigor is essential for human administration.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#fffdfb] text-[#0c2340] font-serif border-b border-[#dfd7c7]">
              <tr>
                <th className="p-4 font-bold">Standard Metric</th>
                <th className="p-4 font-bold text-[#c5a059]">Whole Harbor Wellness</th>
                <th className="p-4 font-bold text-[#5a6b7c]">Generic Online Vendors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dfd7c7]/40 text-[#5a6b7c]">
              <tr>
                <td className="p-4 font-semibold text-[#0c2340]">HPLC Purity Benchmark</td>
                <td className="p-4 font-bold text-[#c5a059]">&gt; 99.2% Guaranteed</td>
                <td className="p-4 text-[#5a6b7c]">Unverified (Often 80%–92%)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-[#0c2340]">Endotoxin Threshold</td>
                <td className="p-4 font-bold text-[#c5a059]">&lt; 0.01 EU/mg (LAL Tested)</td>
                <td className="p-4 text-[#5a6b7c]">Rarely tested; high pyrogen risk</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-[#0c2340]">Residual Trifluoroacetic Acid (TFA)</td>
                <td className="p-4 font-bold text-[#c5a059]">Exchanged to Acetate/HCl Salt</td>
                <td className="p-4 text-[#5a6b7c]">Retained; causes localized tissue burn</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-[#0c2340]">Cold-Chain Packaging</td>
                <td className="p-4 font-bold text-[#c5a059]">Insulated refrigerated express</td>
                <td className="p-4 text-[#5a6b7c]">Standard bubble mailer, room temp</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-[#0c2340]">Batch Lot Traceability</td>
                <td className="p-4 font-bold text-[#c5a059]">Public CoA on Every Box</td>
                <td className="p-4 text-[#5a6b7c]">Recycled or fabricated PDFs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-[#c5a059] text-white p-8 sm:p-12 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-serif text-2xl font-bold">Ready to Experience True Clinical Purity?</h3>
          <p className="text-xs text-[#dfd7c7] mt-1 max-w-xl">
            Explore our metabolic support kits or consult with a Whole Harbor partner clinic.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('shop')}
            className="px-6 py-3 rounded-xl bg-[#fffdfb] text-[#c5a059] text-xs font-semibold uppercase tracking-wider hover:bg-white cursor-pointer"
          >
            Explore Catalog
          </button>
          <button
            onClick={() => navigate('partners')}
            className="px-6 py-3 rounded-xl border border-white/40 text-white text-xs font-semibold uppercase tracking-wider hover:bg-white/10 cursor-pointer"
          >
            Partner With Us
          </button>
        </div>
      </div>

    </div>
  );
};
