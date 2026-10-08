import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types/index.ts';

interface AuthContextType {
  currentUser: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPartner: boolean;
  switchRole: (role: UserRole, customUser?: Partial<UserProfile>) => void;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (email: string, passwordOrName?: string, displayNameOrRole?: string | UserRole, role?: UserRole) => Promise<boolean>;
  logout: () => void;
}

const DEFAULT_USERS: Record<UserRole, UserProfile> = {
  ADMIN: {
    uid: 'admin-kelvin',
    email: 'muchuikelvin423@gmail.com',
    displayName: 'Chief Clinical Director',
    role: 'ADMIN',
    createdAt: '2026-01-01T00:00:00Z'
  },
  PARTNER_OWNER: {
    uid: 'demo-partner-uid-1',
    email: 'julian@vancemedical.com',
    displayName: 'Dr. Julian Vance (Equinox)',
    role: 'PARTNER_OWNER',
    partnerId: 'partner-equinox',
    createdAt: '2026-01-05T00:00:00Z'
  },
  PARTNER_STAFF: {
    uid: 'staff-soma-1',
    email: 'intake@somawellness.com',
    displayName: 'Clinical Intake Nurse (Soma)',
    role: 'PARTNER_STAFF',
    partnerId: 'partner-soma',
    createdAt: '2026-01-20T00:00:00Z'
  },
  CUSTOMER: {
    uid: 'cust-elena-r',
    email: 'elena.rostova@example.com',
    displayName: 'Elena Rostova',
    role: 'CUSTOMER',
    createdAt: '2026-02-01T00:00:00Z'
  },
  SALES_ADMIN: {
    uid: 'sales-admin-1',
    email: 'partnerships@wholeharborwellness.com',
    displayName: 'Jordan Reed (Director of Partnerships)',
    role: 'SALES_ADMIN',
    createdAt: '2026-01-10T00:00:00Z'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('wh_current_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Default to CUSTOMER session for visitor experience
    return DEFAULT_USERS.CUSTOMER;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('wh_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('wh_current_user');
    }
  }, [currentUser]);

  const role: UserRole = currentUser?.role || 'CUSTOMER';
  const isAuthenticated = !!currentUser;
  const isAdmin = role === 'ADMIN' || role === 'SALES_ADMIN';
  const isPartner = role === 'PARTNER_OWNER' || role === 'PARTNER_STAFF';

  const switchRole = (newRole: UserRole, customUser?: Partial<UserProfile>) => {
    const base = DEFAULT_USERS[newRole];
    const userToSet: UserProfile = {
      ...base,
      ...customUser,
      role: newRole
    };
    setCurrentUser(userToSet);
  };

  const login = async (email: string): Promise<boolean> => {
    // Check if matches known role emails or create a customer profile
    if (email.toLowerCase().includes('admin')) {
      setCurrentUser(DEFAULT_USERS.ADMIN);
      return true;
    }
    if (email.toLowerCase().includes('vance') || email.toLowerCase().includes('equinox')) {
      setCurrentUser(DEFAULT_USERS.PARTNER_OWNER);
      return true;
    }
    if (email.toLowerCase().includes('partner')) {
      setCurrentUser(DEFAULT_USERS.PARTNER_OWNER);
      return true;
    }
    const newUser: UserProfile = {
      uid: 'user-' + Date.now(),
      email,
      displayName: email.split('@')[0],
      role: 'CUSTOMER',
      createdAt: new Date().toISOString()
    };
    setCurrentUser(newUser);
    return true;
  };

  const register = async (
    email: string, 
    passwordOrName?: string, 
    displayNameOrRole?: string | UserRole, 
    userRole?: UserRole
  ): Promise<boolean> => {
    let name = 'New User';
    let assignedRole: UserRole = 'CUSTOMER';

    if (userRole) {
      assignedRole = userRole;
      name = (typeof displayNameOrRole === 'string' ? displayNameOrRole : '') || email.split('@')[0];
    } else if (typeof displayNameOrRole === 'string' && ['CUSTOMER', 'PARTNER_OWNER', 'PARTNER_STAFF', 'ADMIN', 'SALES_ADMIN'].includes(displayNameOrRole)) {
      assignedRole = displayNameOrRole as UserRole;
      name = passwordOrName || email.split('@')[0];
    } else if (typeof displayNameOrRole === 'string') {
      name = displayNameOrRole;
    } else if (passwordOrName) {
      name = passwordOrName;
    }

    const newUser: UserProfile = {
      uid: 'user-' + Date.now(),
      email,
      displayName: name,
      role: assignedRole,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isAuthenticated,
        isAdmin,
        isPartner,
        switchRole,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
