import React, { useEffect, useState } from 'react';

interface CookieConsentBannerProps {
  navigate: (path: string, param?: string) => void;
}

const CONSENT_STORAGE_KEY = 'whw_cookie_consent_v1';

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ navigate }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const existing = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!existing) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }

    const handleReopen = () => setVisible(true);
    window.addEventListener('whw-open-cookie-settings', handleReopen);
    return () => window.removeEventListener('whw-open-cookie-settings', handleReopen);
  }, []);

  const savePreference = (mode: 'essential' | 'all') => {
    try {
      localStorage.setItem(
        CONSENT_STORAGE_KEY,
        JSON.stringify({ mode, updatedAt: new Date().toISOString() })
      );
      window.dispatchEvent(new CustomEvent('whw-cookie-consent-changed', { detail: { mode } }));
    } catch {
      // ignore storage errors
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie and Privacy Preferences"
      className="fixed bottom-20 md:bottom-5 left-4 right-4 md:left-auto md:right-6 md:max-w-lg z-40 bg-[#fffdfb] border border-[#dfd7c7] rounded-2xl shadow-2xl p-5 text-[#0c2340]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5a059]">
            Privacy &amp; Cookie Notice
          </p>
          <p className="text-xs text-[#5a6b7c] leading-relaxed">
            Whole Harbor Wellness uses essential session storage for cart items and optional 30-day partner attribution cookies so member discounts apply cleanly across visits.{' '}
            <button
              type="button"
              onClick={() => navigate('privacy')}
              className="underline font-semibold text-[#0c2340] hover:text-[#c5a059] cursor-pointer"
            >
              Read Privacy Policy
            </button>
            .
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => savePreference('essential')}
          className="px-3.5 py-2 rounded-xl border border-[#dfd7c7] bg-[#f6f4ee] text-[#0c2340] text-xs font-semibold hover:border-[#0c2340] transition-colors cursor-pointer"
        >
          Essential Only
        </button>
        <button
          type="button"
          onClick={() => savePreference('all')}
          className="px-4 py-2 rounded-xl bg-[#0c2340] text-white text-xs font-semibold hover:bg-[#c5a059] transition-colors cursor-pointer shadow-xs"
        >
          Accept All Cookies
        </button>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
