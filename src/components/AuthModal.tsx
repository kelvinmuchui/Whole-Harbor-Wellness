import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string, param?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, navigate }) => {
  const { login, register, switchRole, currentUser, role, logout } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('CUSTOMER');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, displayName, selectedRole);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      console.error('Auth error', err);
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#744241]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-[#fffdfb] w-full max-w-md rounded-3xl border border-[#ead2ce] shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ead2ce] pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b87572] text-[24px]">lock</span>
            <h3 className="font-serif text-xl font-bold text-[#744241]">
              {isRegister ? 'Register Account' : 'Clinical Sign In'}
            </h3>
          </div>
          <button onClick={onClose} className="text-[#7c6b69] hover:text-[#744241] cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Quick Demo Persona Switcher */}
        <div className="bg-[#fff6f3] p-3 rounded-2xl border border-[#ead2ce] space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#7c6b69] block">
            Instant Test Persona Switcher
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              onClick={() => handleQuickPersona('CUSTOMER')}
              className={`p-1.5 rounded-lg text-center font-medium cursor-pointer ${
                role === 'CUSTOMER' ? 'bg-[#b87572] text-white' : 'bg-white hover:bg-[#fffdfb] text-[#744241]'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => handleQuickPersona('PARTNER_OWNER')}
              className={`p-1.5 rounded-lg text-center font-medium cursor-pointer ${
                role === 'PARTNER_OWNER' ? 'bg-[#b87572] text-white' : 'bg-white hover:bg-[#fffdfb] text-[#744241]'
              }`}
            >
              Partner
            </button>
            <button
              onClick={() => handleQuickPersona('ADMIN')}
              className={`p-1.5 rounded-lg text-center font-medium cursor-pointer ${
                role === 'ADMIN' ? 'bg-[#b87572] text-white' : 'bg-white hover:bg-[#fffdfb] text-[#744241]'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-[#7c6b69] font-medium mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                placeholder="Dr. Jordan Hayes"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#ead2ce] text-[#744241]"
              />
            </div>
          )}

          <div>
            <label className="block text-[#7c6b69] font-medium mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="user@wholeharbor.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-[#ead2ce] text-[#744241]"
            />
          </div>

          <div>
            <label className="block text-[#7c6b69] font-medium mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-[#ead2ce] text-[#744241]"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-[#7c6b69] font-medium mb-1">Select Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#ead2ce] text-[#744241] cursor-pointer"
              >
                <option value="CUSTOMER">Customer / Patient</option>
                <option value="PARTNER_OWNER">Partner Owner (Clinic / Medspa)</option>
                <option value="PARTNER_STAFF">Partner Staff / Care Coordinator</option>
                <option value="ADMIN">System Administrator</option>
                <option value="SALES_ADMIN">Sales Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#b87572] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#744241] cursor-pointer transition-colors shadow-sm"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center pt-2 text-[#7c6b69]">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-[#b87572] font-semibold underline cursor-pointer"
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
                className="text-[#b87572] font-semibold underline cursor-pointer"
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
