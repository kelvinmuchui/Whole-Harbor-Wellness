import React, { useState } from 'react';
import { useAuth, SEEDED_ACCOUNTS } from '../context/AuthContext.tsx';
import { TEST_VARS } from '../lib/testVariables.ts';
import { UserRole } from '../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string, param?: string) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, navigate, initialMode = 'login' }) => {
  const { login, register, signInWithGoogle, switchRole, requestPasswordReset } = useAuth();
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsRegister(initialMode === 'register');
      setIsForgotPassword(false);
      setAuthError(null);
      setResetNotice(null);
      setRequiresMfa(false);
    }
  }, [isOpen, initialMode]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('CUSTOMER');
  const [mfaCode, setMfaCode] = useState('');
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDismiss = React.useCallback(() => {
    setRequiresMfa(false);
    setIsForgotPassword(false);
    setAuthError(null);
    setResetNotice(null);
    onClose();
  }, [onClose]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, handleDismiss]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    try {
      if (isRegister) {
        if (password.length < 8) {
          setAuthError('Password must be at least 8 characters with letters and numbers.');
          setLoading(false);
          return;
        }
        const res = await register(email, password, displayName, selectedRole, { businessName });
        if (!res.success) {
          setAuthError(res.error || 'Registration failed');
          return;
        }
      } else {
        const res = await login(email, password, requiresMfa ? mfaCode : undefined);
        if (res.requiresMfa) {
          setRequiresMfa(true);
          setLoading(false);
          return;
        }
        if (!res.success) {
          setAuthError(res.error || 'Authentication failed. Please verify your credentials.');
          return;
        }
      }
      onClose();
    } catch (err) {
      console.error('Auth error', err);
      setAuthError('An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPersona = (newRole: UserRole) => {
    switchRole(newRole);
    onClose();
    if (newRole === 'ADMIN' || newRole === 'SALES_ADMIN') {
      navigate('admin');
    } else if (newRole === 'PARTNER_OWNER' || newRole === 'PARTNER_STAFF') {
      navigate('partner-portal');
    } else {
      navigate('customer-portal');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0c2340]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => { if (!loading) handleDismiss(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Account authentication"
    >
      <div
        className="relative bg-[#fffdfb] w-full sm:max-w-md max-h-[92dvh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#dfd7c7] shadow-2xl overflow-hidden animate-in zoom-in-95 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Pinned Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-[#dfd7c7] bg-[#f6f4ee] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#dfd7c7] p-0.5 shadow-xs flex items-center justify-center shrink-0">
              <img src="/images/whw-logo.png" alt="Whole Harbor Wellness" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif text-xl font-bold text-[#0c2340] leading-tight truncate">
                {requiresMfa
                  ? 'Administrator 2FA'
                  : isForgotPassword
                  ? 'Reset Password'
                  : isRegister
                  ? 'Register Account'
                  : 'Secure Sign In'}
              </h3>
              <p className="text-[10px] text-[#5a6b7c] truncate">Whole Harbor Wellness • Encrypted Session</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Cancel and close"
            className="w-10 h-10 rounded-full bg-white border border-[#dfd7c7] text-[#5a6b7c] hover:text-[#0c2340] hover:border-[#0c2340] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">

        {/* Error / Success Banners */}
        {authError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
            <span>{authError}</span>
          </div>
        )}
        {resetNotice && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] shrink-0">check_circle</span>
            <span>{resetNotice}</span>
          </div>
        )}

        {/* Firebase Google Authentication */}
        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            setAuthError(null);
            setLoading(true);
            try {
              const res = await signInWithGoogle();
              if (!res.success) {
                setAuthError(res.error || 'Google Sign-In failed.');
                return;
              }
              onClose();
            } finally {
              setLoading(false);
            }
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#dfd7c7] hover:border-[#0c2340] text-[#0c2340] text-xs font-semibold flex items-center justify-center gap-2.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z" />
            <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-[#5a6b7c]">
          <span className="flex-1 h-px bg-[#dfd7c7]" />
          <span>or account switcher &amp; email</span>
          <span className="flex-1 h-px bg-[#dfd7c7]" />
        </div>

        {/* Seeded Accounts Switcher */}
        <div className="bg-[#f6f4ee] p-3 rounded-2xl border border-[#dfd7c7] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#5a6b7c]">
              Seeded Accounts (Click to Auto-fill &amp; Switch)
            </span>
            <span className="text-[10px] text-[#c5a059] font-semibold">1 Admin • 2 Partners • 3 Customers</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            {/* Admin */}
            <button
              type="button"
              onClick={() => {
                setEmail(SEEDED_ACCOUNTS.admin.email);
                setPassword(TEST_VARS.auth.demoPasswords.admin);
                switchRole('ADMIN');
                onClose();
                navigate('admin');
              }}
              className="w-full p-2 rounded-xl bg-white hover:bg-[#0c2340] hover:text-white border border-[#dfd7c7] text-left transition-colors flex items-center justify-between cursor-pointer group"
            >
              <div>
                <span className="font-semibold block text-[#0c2340] group-hover:text-white">
                  👑 Kelvin Director of Wellness
                </span>
                <span className="text-[10px] text-[#5a6b7c] group-hover:text-[#dfd7c7]">
                  admin@wholeharborwellness.com
                </span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-[#c5a059] text-white">
                Admin
              </span>
            </button>

            {/* Partners */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setEmail('julian@vancemedical.com');
                  setPassword(TEST_VARS.auth.demoPasswords.partner);
                  switchRole('PARTNER_OWNER', {
                    email: 'julian@vancemedical.com',
                    displayName: 'Dr. Julian Vance',
                    businessName: 'Equinox Longevity Suite',
                    partnerId: 'WH-P-000001',
                    partnerSlug: 'equinox-longevity',
                    wholesaleApprovalStatus: 'APPROVED'
                  });
                  onClose();
                  navigate('partner-portal');
                }}
                className="p-1.5 rounded-xl bg-white hover:bg-[#0c2340] hover:text-white border border-[#dfd7c7] text-left transition-colors cursor-pointer group"
              >
                <span className="font-semibold text-[#0c2340] group-hover:text-white block truncate">
                  🤝 Dr. Julian Vance
                </span>
                <span className="text-[9px] text-[#5a6b7c] group-hover:text-[#dfd7c7] block truncate">
                  Equinox Longevity
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('helena@harborsanctuary.com');
                  setPassword(TEST_VARS.auth.demoPasswords.partner);
                  switchRole('PARTNER_OWNER', {
                    email: 'helena@harborsanctuary.com',
                    displayName: 'Dr. Helena Vance',
                    businessName: 'Harbor Sanctuary Beverly Hills',
                    partnerId: 'WH-P-000002',
                    partnerSlug: 'harbor-sanctuary',
                    wholesaleApprovalStatus: 'APPROVED'
                  });
                  onClose();
                  navigate('partner-portal');
                }}
                className="p-1.5 rounded-xl bg-white hover:bg-[#0c2340] hover:text-white border border-[#dfd7c7] text-left transition-colors cursor-pointer group"
              >
                <span className="font-semibold text-[#0c2340] group-hover:text-white block truncate">
                  🤝 Dr. Helena Vance
                </span>
                <span className="text-[9px] text-[#5a6b7c] group-hover:text-[#dfd7c7] block truncate">
                  Harbor Sanctuary
                </span>
              </button>
            </div>

            {/* Customers */}
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => {
                  setEmail('elena.rostova@example.com');
                  setPassword(TEST_VARS.auth.demoPasswords.customer);
                  switchRole('CUSTOMER', {
                    email: 'elena.rostova@example.com',
                    displayName: 'Elena Rostova',
                    wholesaleApprovalStatus: 'NONE'
                  });
                  onClose();
                  navigate('customer-portal');
                }}
                className="p-1 rounded-lg bg-white hover:bg-[#0c2340] hover:text-white border border-[#dfd7c7] text-center transition-colors cursor-pointer group"
              >
                <span className="font-semibold text-[#0c2340] group-hover:text-white block truncate text-[10px]">
                  Elena Rostova
                </span>
                <span className="text-[8px] text-[#5a6b7c] group-hover:text-[#dfd7c7]">Patient 1</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('marcus.chen@example.com');
                  setPassword(TEST_VARS.auth.demoPasswords.customer);
                  switchRole('CUSTOMER', {
                    email: 'marcus.chen@example.com',
                    displayName: 'Marcus Chen',
                    wholesaleApprovalStatus: 'NONE'
                  });
                  onClose();
                  navigate('customer-portal');
                }}
                className="p-1 rounded-lg bg-white hover:bg-[#0c2340] hover:text-white border border-[#dfd7c7] text-center transition-colors cursor-pointer group"
              >
                <span className="font-semibold text-[#0c2340] group-hover:text-white block truncate text-[10px]">
                  Marcus Chen
                </span>
                <span className="text-[8px] text-[#5a6b7c] group-hover:text-[#dfd7c7]">Patient 2</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('sarah.miller@example.com');
                  setPassword(TEST_VARS.auth.demoPasswords.customer);
                  switchRole('CUSTOMER', {
                    email: 'sarah.miller@example.com',
                    displayName: 'Sarah Miller',
                    wholesaleApprovalStatus: 'NONE'
                  });
                  onClose();
                  navigate('customer-portal');
                }}
                className="p-1 rounded-lg bg-white hover:bg-[#0c2340] hover:text-white border border-[#dfd7c7] text-center transition-colors cursor-pointer group"
              >
                <span className="font-semibold text-[#0c2340] group-hover:text-white block truncate text-[10px]">
                  Sarah Miller
                </span>
                <span className="text-[8px] text-[#5a6b7c] group-hover:text-[#dfd7c7]">Patient 3</span>
              </button>
            </div>
          </div>
        </div>

        {/* Password Reset Flow */}
        {isForgotPassword ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setAuthError(null);
              setResetNotice(null);
              setLoading(true);
              try {
                const res = await requestPasswordReset(email);
                if (!res.success) {
                  setAuthError(res.error || 'Could not send reset email.');
                } else {
                  setResetNotice(res.message || 'Recovery email dispatched.');
                }
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-4"
          >
            <p className="text-xs text-[#5a6b7c] leading-relaxed">
              Enter your registered email address and we will send password recovery instructions.
            </p>
            <div>
              <label className="block text-[#5a6b7c] font-medium mb-1">Account Email</label>
              <input
                type="email"
                required
                placeholder="user@wholeharborwellness.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setAuthError(null);
                  setResetNotice(null);
                }}
                className="w-1/2 py-2.5 rounded-xl border border-[#dfd7c7] text-[#5a6b7c] hover:bg-[#f6f4ee] font-semibold cursor-pointer"
              >
                Back to Sign In
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 py-2.5 rounded-xl bg-[#c5a059] text-white font-semibold uppercase tracking-wider hover:bg-[#0c2340] transition-colors cursor-pointer"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        ) : requiresMfa ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-[#0c2340]/5 border border-[#c5a059]/30 text-center space-y-2">
              <span className="material-symbols-outlined text-[28px] text-[#c5a059]">verified_user</span>
              <p className="font-serif text-sm font-semibold text-[#0c2340]">Administrator Two-Factor Authentication</p>
              <p className="text-[11px] text-[#5a6b7c]">
                Per WHW security protocol, administrators require multi-factor verification. Enter test code <b>{TEST_VARS.auth.mfaCode}</b>.
              </p>
            </div>

            <div>
              <label className="block text-[#5a6b7c] font-medium mb-1">6-Digit Security Code</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder={TEST_VARS.auth.mfaCode}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                className="w-full text-center tracking-widest text-lg font-mono px-3 py-2.5 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                autoFocus
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRequiresMfa(false)}
                className="w-1/2 py-2.5 rounded-xl border border-[#dfd7c7] text-[#5a6b7c] hover:bg-[#f6f4ee] font-semibold cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 py-2.5 rounded-xl bg-[#c5a059] text-white font-semibold uppercase tracking-wider hover:bg-[#0c2340] transition-colors cursor-pointer"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>
          </form>
        ) : (
          /* Main Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Jordan Hayes"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                  />
                </div>

                <div>
                  <label className="block text-[#5a6b7c] font-medium mb-1">Account Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340] cursor-pointer"
                  >
                    <option value="CUSTOMER">Customer / Patient (Retail Access)</option>
                    <option value="PARTNER_OWNER">Partner Owner (Wholesale Portal • Review Required)</option>
                    <option value="PARTNER_STAFF">Partner Staff / Care Coordinator</option>
                    <option value="ADMIN">System Administrator (MFA Required)</option>
                    <option value="SALES_ADMIN">Sales Administrator</option>
                  </select>
                </div>

                {(selectedRole === 'PARTNER_OWNER' || selectedRole === 'PARTNER_STAFF') && (
                  <div>
                    <label className="block text-[#5a6b7c] font-medium mb-1">Organization / Studio / Clinic Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pure Movement Studio, Apex Performance"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
                    />
                    <p className="text-[10px] text-[#c5a059] mt-1">
                      ✦ Partner accounts require WHW review &amp; approval before wholesale 10-vial kit ordering is enabled.
                    </p>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-[#5a6b7c] font-medium mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="user@wholeharborwellness.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[#5a6b7c] font-medium">Password</label>
                {isRegister ? (
                  <span className="text-[10px] text-[#5a6b7c]">Min 8 characters</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setAuthError(null);
                    }}
                    className="text-[10px] font-semibold text-[#c5a059] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                minLength={isRegister ? 8 : 1}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#dfd7c7] text-[#0c2340]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#c5a059] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#0c2340] cursor-pointer transition-colors shadow-sm"
            >
              {loading ? 'Authenticating...' : isRegister ? 'Register & Submit' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Toggle Mode */}
        {!isForgotPassword && (
          <div className="text-center pt-2 text-[#5a6b7c]">
            {isRegister ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="text-[#c5a059] font-semibold underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Need an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="text-[#c5a059] font-semibold underline cursor-pointer"
                >
                  Create Account
                </button>
              </p>
            )}
          </div>
        )}

        </div>

        {/* Pinned Responsive Footer with Cancel */}
        <div className="shrink-0 border-t border-[#dfd7c7] bg-[#f6f4ee] px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] flex items-center justify-between gap-3">
          <span className="text-[10px] text-[#5a6b7c]">
            Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#dfd7c7] font-mono text-[9px]">ESC</kbd> or tap Cancel to close
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-white border border-[#dfd7c7] text-[#0c2340] hover:border-[#0c2340] text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
