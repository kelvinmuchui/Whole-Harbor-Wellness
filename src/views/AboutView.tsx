import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService.ts';
import { Testimonial } from '../types/index.ts';

interface AboutViewProps {
  initialSection?: string;
  navigate: (path: string, param?: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ initialSection, navigate }) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('Clinical Inquiries');
  const [message, setMessage] = useState('');

  useEffect(() => {
    dbService.getTestimonials().then(setTestimonials);
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      
      {/* 1. Hero & Mission */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-[#7c6b69]">
          Our Purpose &amp; Heritage
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#744241] font-bold">
          Restoring Clinical Integrity to Longevity Medicine
        </h1>
        <p className="text-xs sm:text-sm text-[#7c6b69] leading-relaxed">
          Whole Harbor Wellness was founded by clinical chemists, functional physicians, and sports scientists who recognized a critical gap: 
          patients and practitioners needed verified, cold-chain protected peptide therapeutics backed by transparent third-party Certificates of Analysis.
        </p>
      </section>

      {/* 2. Three Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#fff6f3] border border-[#ead2ce] p-8 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#b87572] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">science</span>
          </div>
          <h3 className="font-serif text-xl font-bold text-[#744241]">
            Pharmaceutical Rigor
          </h3>
          <p className="text-xs text-[#7c6b69] leading-relaxed">
            All formulations undergo rigorous high-performance liquid chromatography, counter-ion exchange, and sterility testing to exceed human-use standards.
          </p>
        </div>

        <div className="bg-[#fff6f3] border border-[#ead2ce] p-8 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#b87572] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">thermostat</span>
          </div>
          <h3 className="font-serif text-xl font-bold text-[#744241]">
            Unbroken Cold-Chain
          </h3>
          <p className="text-xs text-[#7c6b69] leading-relaxed">
            From sterile synthesis through transit to your doorstep, our monitored insulated cold-chain process prevents thermal denaturing of fragile amino acids.
          </p>
        </div>

        <div className="bg-[#fff6f3] border border-[#ead2ce] p-8 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#b87572] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">hub</span>
          </div>
          <h3 className="font-serif text-xl font-bold text-[#744241]">
            Integrated Clinic Network
          </h3>
          <p className="text-xs text-[#7c6b69] leading-relaxed">
            We partner with leading medical spas, longevity clinics, and sports facilities so patients receive physician guidance alongside pharmacy delivery.
          </p>
        </div>
      </section>

      {/* 3. Clinician Testimonials */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-[#7c6b69]">
            Professional Endorsements
          </span>
          <h2 className="font-serif text-3xl text-[#744241] font-bold mt-1">
            Voices from Our Clinical Network
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-[#ead2ce] rounded-3xl p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-[#b87572] mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[16px]">star</span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#7c6b69] italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-[#ead2ce]/50">
                <h4 className="font-serif font-bold text-sm text-[#744241]">{t.name}</h4>
                <p className="text-[11px] text-[#7c6b69]">{t.role} • {t.organization}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Contact Clinical Concierge Form */}
      <section className="bg-white border border-[#ead2ce] rounded-3xl p-8 sm:p-12 shadow-sm max-w-3xl mx-auto">
        {contactSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#ead2ce] text-[#b87572] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]">check</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#744241]">
              Message Received
            </h3>
            <p className="text-xs text-[#7c6b69] max-w-md mx-auto">
              Thank you, {name}. A member of the Whole Harbor clinical concierge team will respond within 24 business hours to {email}.
            </p>
            <button
              onClick={() => setContactSubmitted(false)}
              className="px-6 py-2.5 rounded-xl bg-[#b87572] text-white text-xs font-semibold cursor-pointer"
            >
              Send Another Inquiry
            </button>
          </div>
        ) : (
          <div>
            <div className="border-b border-[#ead2ce] pb-4 mb-6">
              <span className="text-xs uppercase font-bold tracking-widest text-[#7c6b69]">
                Get in Touch
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#744241] mt-1">
                Contact Clinical Concierge
              </h2>
              <p className="text-xs text-[#7c6b69] mt-1">
                Have questions about custom peptide protocols, cold-chain logistics, or partner integration?
              </p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#7c6b69] font-medium mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Jordan Hayes"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#ead2ce] text-[#744241]"
                  />
                </div>
                <div>
                  <label className="block text-[#7c6b69] font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="jordan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#ead2ce] text-[#744241]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#7c6b69] font-medium mb-1">Inquiry Department *</label>
                <select
                  value={inquiryType}
                  onChange={(e) => setInquiryType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#ead2ce] text-[#744241] cursor-pointer"
                >
                  <option value="Clinical Inquiries">Clinical Inquiries &amp; Formulation Specs</option>
                  <option value="Partnership Application">Practice Partnership &amp; Storefronts</option>
                  <option value="Order & Cold-Chain">Order Fulfillment &amp; Cold-Chain Tracking</option>
                  <option value="General Concierge">General Inquiries</option>
                </select>
              </div>

              <div>
                <label className="block text-[#7c6b69] font-medium mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can our clinical team assist you?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#ead2ce] text-[#744241]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#b87572] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#744241] cursor-pointer transition-colors shadow-sm"
              >
                Transmit Message to Concierge
              </button>
            </form>
          </div>
        )}
      </section>

    </div>
  );
};
