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
        <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-white border border-[#dfd7c7] shadow-sm p-2 flex items-center justify-center">
          <img
            src="/images/whw-logo.png"
            alt="Whole Harbor Wellness Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <span className="text-xs uppercase font-bold tracking-widest text-[#c5a059]">
          ABOUT WHOLE HARBOR WELLNESS
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#0c2340] font-bold">
          Wellness Should Be Personal.
        </h1>
        <p className="text-xs sm:text-sm text-[#5a6b7c] leading-relaxed max-w-2xl mx-auto">
          At Whole Harbor Wellness, we believe taking care of your health should be more than chasing the latest trend, buying a product, or following a one-size-fits-all program. It should start with understanding you.
        </p>
      </section>

      {/* About Us Detailed Story Cards */}
      <section className="bg-white border border-[#dfd7c7] rounded-3xl p-8 sm:p-12 shadow-xs space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-bold text-[#0c2340]">
              It Should Start With Understanding You.
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#0c2340] font-medium">
              <li className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span>
                <span>Your goals.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span>
                <span>Your lifestyle.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span>
                <span>Your challenges.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span>
                <span>Your priorities.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span>
                <span>And the changes you want to make.</span>
              </li>
            </ul>
            <p className="text-xs text-[#5a6b7c] leading-relaxed pt-2">
              Whole Harbor was created to help people navigate today's rapidly changing wellness landscape with greater education, access, support and accountability.
            </p>
            <p className="text-xs text-[#5a6b7c] leading-relaxed">
              We bring together wellness resources, lifestyle strategies, nutrition, fitness, recovery and access to appropriate clinical treatment options to create a more complete approach to personal wellness.
            </p>
            <div className="p-4 rounded-2xl bg-[#f6f4ee] border border-[#dfd7c7] text-xs text-[#0c2340]">
              <strong className="block text-sm font-serif mb-1 text-[#0c2340]">Our Goal is Simple:</strong>
              Help people take greater ownership of their health and become active participants in their own wellness journey.
            </div>
          </div>

          <div className="space-y-4 bg-[#f6f4ee] p-7 rounded-2xl border border-[#dfd7c7]">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#c5a059]">
              OUR PHILOSOPHY
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#0c2340]">
              OUR APPROACH: We Look at the Whole Person—Not Just One Goal.
            </h3>
            <p className="text-xs text-[#5a6b7c] leading-relaxed">
              Someone may come to us because they want to lose weight. Someone else may want to improve their fitness, change their body composition, improve their lifestyle or explore new approaches to wellness.
            </p>
            <p className="text-xs text-[#5a6b7c] leading-relaxed font-semibold text-[#0c2340]">
              Those goals may look different, but the philosophy remains the same:
            </p>
            <blockquote className="p-3 bg-white rounded-xl border border-[#dfd7c7] font-serif text-base text-[#0c2340] italic">
              "Start with the person. Understand the goal. Build the right pathway."
            </blockquote>

            <div className="pt-3">
              <p className="text-xs font-bold text-[#0c2340] mb-2.5">
                Whole Harbor encourages a broader approach that can include:
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#0c2340]">
                {[
                  'Nutrition',
                  'Physical activity',
                  'Strength training',
                  'Recovery',
                  'Sleep and lifestyle habits',
                  'Weight management',
                  'Metabolic wellness',
                  'Wellness education',
                  'Accountability',
                  'Peptide Education & Resources'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-[#dfd7c7]/80">
                    <span className="text-[#c5a059] font-bold">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Three Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#f6f4ee] border border-[#dfd7c7] p-8 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#c5a059] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">science</span>
          </div>
          <h3 className="font-serif text-xl font-bold text-[#0c2340]">
            Pharmaceutical Rigor
          </h3>
          <p className="text-xs text-[#5a6b7c] leading-relaxed">
            All formulations undergo rigorous high-performance liquid chromatography, counter-ion exchange, and sterility testing to exceed human-use standards.
          </p>
        </div>

        <div className="bg-[#f6f4ee] border border-[#dfd7c7] p-8 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#c5a059] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">thermostat</span>
          </div>
          <h3 className="font-serif text-xl font-bold text-[#0c2340]">
            Unbroken Cold-Chain
          </h3>
          <p className="text-xs text-[#5a6b7c] leading-relaxed">
            From sterile synthesis through transit to your doorstep, our monitored insulated cold-chain process prevents thermal denaturing of fragile amino acids.
          </p>
        </div>

        <div className="bg-[#f6f4ee] border border-[#dfd7c7] p-8 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#c5a059] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">hub</span>
          </div>
          <h3 className="font-serif text-xl font-bold text-[#0c2340]">
            Community &amp; Studio Partners
          </h3>
          <p className="text-xs text-[#5a6b7c] leading-relaxed">
            We partner with trusted fitness studios, wellness practices, gyms, and coaches so communities receive reliable education and verified wellness resources.
          </p>
        </div>
      </section>

      {/* 3. Contact Form */}
      <section className="bg-white border border-[#dfd7c7] rounded-3xl p-8 sm:p-12 shadow-sm max-w-3xl mx-auto">
        {contactSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#dfd7c7] text-[#c5a059] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]">check</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#0c2340]">
              Message Received
            </h3>
            <p className="text-xs text-[#5a6b7c] max-w-md mx-auto">
              Thank you, {name}. A member of the Whole Harbor team will respond within 24 business hours to {email}.
            </p>
            <button
              onClick={() => setContactSubmitted(false)}
              className="px-6 py-2.5 rounded-xl bg-[#c5a059] text-white text-xs font-semibold cursor-pointer"
            >
              Send Another Inquiry
            </button>
          </div>
        ) : (
          <div>
            <div className="border-b border-[#dfd7c7] pb-4 mb-6">
              <span className="text-xs uppercase font-bold tracking-widest text-[#5a6b7c]">
                Get in Touch
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0c2340] mt-1">
                Contact Whole Harbor Wellness
              </h2>
              <p className="text-xs text-[#5a6b7c] mt-1">
                Have questions about custom peptide protocols, cold-chain logistics, or partner integration?
              </p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Jordan Hayes"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="jordan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#5a6b7c] font-medium mb-1">Inquiry Department *</label>
                <select
                  value={inquiryType}
                  onChange={(e) => setInquiryType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] cursor-pointer"
                >
                  <option value="Clinical Inquiries">Clinical Inquiries &amp; Formulation Specs</option>
                  <option value="Partnership Application">Practice Partnership &amp; Storefronts</option>
                  <option value="Order & Cold-Chain">Order Fulfillment &amp; Cold-Chain Tracking</option>
                  <option value="General Support">General Inquiries &amp; Support</option>
                </select>
              </div>

              <div>
                <label className="block text-[#5a6b7c] font-medium mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can our clinical team assist you?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#c5a059] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0c2340] cursor-pointer transition-colors shadow-sm"
              >
                Send Message
              </button>
            </form>
          </div>
        )}
      </section>

    </div>
  );
};
