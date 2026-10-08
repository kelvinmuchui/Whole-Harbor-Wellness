import React from 'react';

interface ApproachViewProps {
  navigate: (path: string, param?: string) => void;
}

export const ApproachView: React.FC<ApproachViewProps> = ({ navigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-[#7c6b69]">
          Methodology &amp; Standards
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#744241] font-bold">
          The Whole Harbor Clinical Standard
        </h1>
        <p className="text-xs sm:text-sm text-[#7c6b69] leading-relaxed">
          Peptide synthesis and hormone precursor distribution require rigorous analytical chemistry. 
          We eliminate the safety hazards common to unregulated research chemical vendors.
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#fff6f3] border border-[#ead2ce] p-6 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#b87572] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">biotech</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-[#744241]">
            1. Verified Synthesis
          </h3>
          <p className="text-xs text-[#7c6b69] leading-relaxed">
            Synthesized in compliant cGMP cleanroom facilities utilizing solid-phase peptide synthesis (SPPS) and certified counter-ion exchange.
          </p>
        </div>

        <div className="bg-[#fff6f3] border border-[#ead2ce] p-6 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#b87572] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-[#744241]">
            2. Dual Analytical Assay
          </h3>
          <p className="text-xs text-[#7c6b69] leading-relaxed">
            Every batch undergoes High-Performance Liquid Chromatography (HPLC) and Mass Spectrometry (MS) to guarantee &gt;99.2% single main-peak purity.
          </p>
        </div>

        <div className="bg-[#fff6f3] border border-[#ead2ce] p-6 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#b87572] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">ac_unit</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-[#744241]">
            3. Active Cold-Chain
          </h3>
          <p className="text-xs text-[#7c6b69] leading-relaxed">
            Biological peptides undergo thermal denaturation when exposed to ambient transit heat. We ship strictly via insulated, cold-packed overnight couriers.
          </p>
        </div>

        <div className="bg-[#fff6f3] border border-[#ead2ce] p-6 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#b87572] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">handshake</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-[#744241]">
            4. Physician Integration
          </h3>
          <p className="text-xs text-[#7c6b69] leading-relaxed">
            Protocols are integrated with partner physicians and sports medicine clinics to ensure appropriate patient dosing and continuous biomarker feedback.
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white border border-[#ead2ce] rounded-3xl overflow-hidden shadow-xs">
        <div className="p-6 bg-[#fff6f3] border-b border-[#ead2ce]">
          <h3 className="font-serif text-xl font-bold text-[#744241]">
            Specification Benchmark: Whole Harbor vs. Research Vendors
          </h3>
          <p className="text-xs text-[#7c6b69] mt-1">
            Understanding why pharmaceutical rigor is essential for human administration.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#fffdfb] text-[#744241] font-serif border-b border-[#ead2ce]">
              <tr>
                <th className="p-4 font-bold">Standard Metric</th>
                <th className="p-4 font-bold text-[#b87572]">Whole Harbor Wellness</th>
                <th className="p-4 font-bold text-[#7c6b69]">Generic Online Vendors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ead2ce]/40 text-[#7c6b69]">
              <tr>
                <td className="p-4 font-semibold text-[#744241]">HPLC Purity Benchmark</td>
                <td className="p-4 font-bold text-[#b87572]">&gt; 99.2% Guaranteed</td>
                <td className="p-4 text-[#7c6b69]">Unverified (Often 80%–92%)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-[#744241]">Endotoxin Threshold</td>
                <td className="p-4 font-bold text-[#b87572]">&lt; 0.01 EU/mg (LAL Tested)</td>
                <td className="p-4 text-[#7c6b69]">Rarely tested; high pyrogen risk</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-[#744241]">Residual Trifluoroacetic Acid (TFA)</td>
                <td className="p-4 font-bold text-[#b87572]">Exchanged to Acetate/HCl Salt</td>
                <td className="p-4 text-[#7c6b69]">Retained; causes localized tissue burn</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-[#744241]">Cold-Chain Packaging</td>
                <td className="p-4 font-bold text-[#b87572]">Insulated refrigerated express</td>
                <td className="p-4 text-[#7c6b69]">Standard bubble mailer, room temp</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-[#744241]">Batch Lot Traceability</td>
                <td className="p-4 font-bold text-[#b87572]">Public CoA on Every Box</td>
                <td className="p-4 text-[#7c6b69]">Recycled or fabricated PDFs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-[#b87572] text-white p-8 sm:p-12 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-serif text-2xl font-bold">Ready to Experience True Clinical Purity?</h3>
          <p className="text-xs text-[#ead2ce] mt-1 max-w-xl">
            Explore our metabolic support kits or consult with a Whole Harbor partner clinic.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('shop')}
            className="px-6 py-3 rounded-xl bg-[#fffdfb] text-[#b87572] text-xs font-semibold uppercase tracking-wider hover:bg-white cursor-pointer"
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
