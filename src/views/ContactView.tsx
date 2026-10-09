import React, { useState } from 'react';

interface ContactViewProps {
  navigate: (path: string, param?: string) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ navigate }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Clinical Inquiries & Protocols',
    orderNumber: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-[#5a6b7c]">
          Direct Clinical Channels
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#0c2340] font-bold">
          Contact Clinical Concierge
        </h1>
        <p className="text-xs sm:text-sm text-[#5a6b7c] leading-relaxed">
          Whether you need protocol consultation, cold-chain shipment updates, custom batch certificates of analysis, 
          or clinic partnership onboarding, our concierge team is at your disposal.
        </p>
      </div>

      {/* 3 Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#f6f4ee] border border-[#dfd7c7] p-6 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#c5a059] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">chat</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-[#0c2340]">Instant WhatsApp</h3>
          <p className="text-xs text-[#5a6b7c] leading-relaxed">
            Direct real-time messaging with Kelvin and the personal care concierge team.
          </p>
          <a
            href="https://wa.me/529841721536?text=Hi%20Kelvin%2C%20I%20have%20a%20question%20about%20Whole%20Harbor%20Wellness."
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c5a059] hover:text-[#0c2340] pt-1"
          >
            <span>Open WhatsApp Chat</span>
            <span>→</span>
          </a>
        </div>

        <div className="bg-[#f6f4ee] border border-[#dfd7c7] p-6 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#c5a059] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">mail</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-[#0c2340]">Clinical Inquiries</h3>
          <p className="text-xs text-[#5a6b7c] leading-relaxed">
            Submit questions regarding peptide reconstitution, HPLC testing, or dosages.
          </p>
          <a
            href="mailto:concierge@wholeharborwellness.com"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c5a059] hover:text-[#0c2340] pt-1"
          >
            <span>concierge@wholeharborwellness.com</span>
            <span>→</span>
          </a>
        </div>

        <div className="bg-[#f6f4ee] border border-[#dfd7c7] p-6 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#c5a059] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">schedule</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-[#0c2340]">Concierge Hours</h3>
          <p className="text-xs text-[#5a6b7c] leading-relaxed">
            Monday – Saturday: 8:00 AM – 8:00 PM EST<br />
            Priority cold-chain monitoring 24/7.
          </p>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#5a6b7c]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Clinicians on duty</span>
          </span>
        </div>
      </div>

      {/* Main Inquiry Form */}
      <div className="bg-white border border-[#dfd7c7] rounded-3xl p-6 sm:p-12 shadow-sm max-w-3xl mx-auto">
        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#dfd7c7] text-[#c5a059] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0c2340]">
              Inquiry Dispatched to Concierge
            </h2>
            <p className="text-xs sm:text-sm text-[#5a6b7c] max-w-md mx-auto">
              Thank you, <strong className="text-[#0c2340]">{formData.name}</strong>. A Whole Harbor clinical concierge specialist has received your inquiry for <em>{formData.department}</em> and will follow up at <strong className="text-[#0c2340]">{formData.email}</strong> within 4 hours.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    department: 'Clinical Inquiries & Protocols',
                    orderNumber: '',
                    message: ''
                  });
                }}
                className="px-5 py-2.5 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] text-xs font-semibold hover:bg-[#f6f4ee] transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
              <button
                onClick={() => navigate('shop')}
                className="px-6 py-2.5 rounded-xl bg-[#c5a059] text-white text-xs font-semibold hover:bg-[#0c2340] transition-colors cursor-pointer"
              >
                Return to Shop
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="border-b border-[#dfd7c7] pb-4 mb-6">
              <span className="text-xs uppercase font-bold tracking-widest text-[#5a6b7c]">
                Send a Message
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0c2340] mt-1">
                Clinical Concierge Intake Form
              </h2>
              <p className="text-xs text-[#5a6b7c] mt-1">
                Please provide your contact information and details. All clinical inquiries are treated with strict confidentiality.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Jordan Hayes or Alex Morgan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jordan@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">
                    Phone / Mobile (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">
                    Order # or Batch Lot (If applicable)
                  </label>
                  <input
                    type="text"
                    placeholder="WH-ORD-2026-XXXX or Lot #8841-A"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#5a6b7c] font-medium mb-1">
                  Department / Subject <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-none focus:border-[#c5a059] cursor-pointer"
                >
                  <option value="Clinical Inquiries & Protocols">Clinical Inquiries &amp; Formulation Specifications</option>
                  <option value="Practice Partnership Application">Practice Partnership &amp; Clinic Co-Branding</option>
                  <option value="Order & Cold-Chain Tracking">Order Status &amp; Cold-Chain Verification</option>
                  <option value="CoA Lab Requests">Certificate of Analysis (CoA) Lab Reports</option>
                  <option value="General Concierge">General Inquiries &amp; Account Support</option>
                </select>
              </div>

              <div>
                <label className="block text-[#5a6b7c] font-medium mb-1">
                  Message Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="How can our clinical concierge team assist you with your longevity or formulation requirements?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#fffdfb] border border-[#dfd7c7] text-[#0c2340] focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#c5a059] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0c2340] cursor-pointer transition-colors shadow-sm"
              >
                Transmit Message to Concierge Team
              </button>

              <p className="text-[11px] text-[#5a6b7c] text-center pt-2">
                🔒 Protected by HIPAA-compliant secure handling. For acute medical emergencies, please dial 911 immediately.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
