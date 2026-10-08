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
        <span className="text-xs uppercase font-bold tracking-widest text-[#7c6b69]">
          Direct Clinical Channels
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#744241] font-bold">
          Contact Clinical Concierge
        </h1>
        <p className="text-xs sm:text-sm text-[#7c6b69] leading-relaxed">
          Whether you need protocol consultation, cold-chain shipment updates, custom batch certificates of analysis, 
          or clinic partnership onboarding, our concierge team is at your disposal.
        </p>
      </div>

      {/* 3 Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#fff6f3] border border-[#ead2ce] p-6 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#b87572] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">chat</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-[#744241]">Instant WhatsApp</h3>
          <p className="text-xs text-[#7c6b69] leading-relaxed">
            Direct real-time messaging with Kelvin and the personal care concierge team.
          </p>
          <a
            href="https://wa.me/529841721536?text=Hi%20Kelvin%2C%20I%20have%20a%20question%20about%20Whole%20Harbor%20Wellness."
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b87572] hover:text-[#744241] pt-1"
          >
            <span>Open WhatsApp Chat</span>
            <span>→</span>
          </a>
        </div>

        <div className="bg-[#fff6f3] border border-[#ead2ce] p-6 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#b87572] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">mail</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-[#744241]">Clinical Inquiries</h3>
          <p className="text-xs text-[#7c6b69] leading-relaxed">
            Submit questions regarding peptide reconstitution, HPLC testing, or dosages.
          </p>
          <a
            href="mailto:concierge@wholeharborwellness.com"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b87572] hover:text-[#744241] pt-1"
          >
            <span>concierge@wholeharborwellness.com</span>
            <span>→</span>
          </a>
        </div>

        <div className="bg-[#fff6f3] border border-[#ead2ce] p-6 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#b87572] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">schedule</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-[#744241]">Concierge Hours</h3>
          <p className="text-xs text-[#7c6b69] leading-relaxed">
            Monday – Saturday: 8:00 AM – 8:00 PM EST<br />
            Priority cold-chain monitoring 24/7.
          </p>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#7c6b69]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Clinicians on duty</span>
          </span>
        </div>
      </div>

      {/* Main Inquiry Form */}
      <div className="bg-white border border-[#ead2ce] rounded-3xl p-6 sm:p-12 shadow-sm max-w-3xl mx-auto">
        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#ead2ce] text-[#b87572] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#744241]">
              Inquiry Dispatched to Concierge
            </h2>
            <p className="text-xs sm:text-sm text-[#7c6b69] max-w-md mx-auto">
              Thank you, <strong className="text-[#744241]">{formData.name}</strong>. A Whole Harbor clinical concierge specialist has received your inquiry for <em>{formData.department}</em> and will follow up at <strong className="text-[#744241]">{formData.email}</strong> within 4 hours.
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
                className="px-5 py-2.5 rounded-xl bg-white border border-[#ead2ce] text-[#744241] text-xs font-semibold hover:bg-[#fff6f3] transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
              <button
                onClick={() => navigate('shop')}
                className="px-6 py-2.5 rounded-xl bg-[#b87572] text-white text-xs font-semibold hover:bg-[#744241] transition-colors cursor-pointer"
              >
                Return to Shop
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="border-b border-[#ead2ce] pb-4 mb-6">
              <span className="text-xs uppercase font-bold tracking-widest text-[#7c6b69]">
                Send a Message
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#744241] mt-1">
                Clinical Concierge Intake Form
              </h2>
              <p className="text-xs text-[#7c6b69] mt-1">
                Please provide your contact information and details. All clinical inquiries are treated with strict confidentiality.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#7c6b69] font-medium mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Jordan Hayes or Alex Morgan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#fffdfb] border border-[#ead2ce] text-[#744241] focus:outline-none focus:border-[#b87572]"
                  />
                </div>
                <div>
                  <label className="block text-[#7c6b69] font-medium mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jordan@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#fffdfb] border border-[#ead2ce] text-[#744241] focus:outline-none focus:border-[#b87572]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#7c6b69] font-medium mb-1">
                    Phone / Mobile (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#fffdfb] border border-[#ead2ce] text-[#744241] focus:outline-none focus:border-[#b87572]"
                  />
                </div>
                <div>
                  <label className="block text-[#7c6b69] font-medium mb-1">
                    Order # or Batch Lot (If applicable)
                  </label>
                  <input
                    type="text"
                    placeholder="WH-ORD-2026-XXXX or Lot #8841-A"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#fffdfb] border border-[#ead2ce] text-[#744241] focus:outline-none focus:border-[#b87572]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#7c6b69] font-medium mb-1">
                  Department / Subject <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#fffdfb] border border-[#ead2ce] text-[#744241] focus:outline-none focus:border-[#b87572] cursor-pointer"
                >
                  <option value="Clinical Inquiries & Protocols">Clinical Inquiries &amp; Formulation Specifications</option>
                  <option value="Practice Partnership Application">Practice Partnership &amp; Clinic Co-Branding</option>
                  <option value="Order & Cold-Chain Tracking">Order Status &amp; Cold-Chain Verification</option>
                  <option value="CoA Lab Requests">Certificate of Analysis (CoA) Lab Reports</option>
                  <option value="General Concierge">General Inquiries &amp; Account Support</option>
                </select>
              </div>

              <div>
                <label className="block text-[#7c6b69] font-medium mb-1">
                  Message Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="How can our clinical concierge team assist you with your longevity or formulation requirements?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#fffdfb] border border-[#ead2ce] text-[#744241] focus:outline-none focus:border-[#b87572]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#b87572] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#744241] cursor-pointer transition-colors shadow-sm"
              >
                Transmit Message to Concierge Team
              </button>

              <p className="text-[11px] text-[#7c6b69] text-center pt-2">
                🔒 Protected by HIPAA-compliant secure handling. For acute medical emergencies, please dial 911 immediately.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
