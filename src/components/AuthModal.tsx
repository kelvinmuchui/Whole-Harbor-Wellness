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
  const { login, register, switchRole, currentUser, role, logout } = useAuth();
  const [isRegister, setIsRegister] = useState(initialMode === 'register');

  React.useEffect(() => {
    if (isOpen) {
      setIsRegister(initialMode === 'register');
      setAuthError(null);
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
  const [loading, setLoading] = useState(false);

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0c2340]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-[#fffdfb] w-full max-w-md rounded-3xl border border-[#dfd7c7] shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#dfd7c7] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#dfd7c7] p-0.5 shadow-xs flex items-center justify-center">
              <img src="/images/whw-logo.png" alt="Whole Harbor Wellness" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#0c2340] leading-tight">
                {requiresMfa ? 'Administrator 2FA' : isRegister ? 'Register Account' : 'Secure Sign In'}
              </h3>
              <p className="text-[10px] text-[#5a6b7c]">Whole Harbor Wellness • Encrypted Session</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setRequiresMfa(false);
              setAuthError(null);
              onClose();
            }} 
            className="text-[#5a6b7c] hover:text-[#0c2340] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Error Banner */}
        {authError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
            <span>{authError}</span>
          </div>
        )}

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

        {/* MFA Challenge Screen */}
        {requiresMfa ? (
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
                {isRegister && (
                  <span className="text-[10px] text-[#5a6b7c]">Min 8 characters</span>
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

      </div>
    </div>
  );
};
