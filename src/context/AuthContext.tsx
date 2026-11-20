import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, PermissionMatrix } from '../types/index.ts';
import { TEST_VARS } from '../lib/testVariables.ts';

export interface AuthContextType {
  currentUser: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPartner: boolean;
  isWholesaleApproved: boolean;
  permissions: PermissionMatrix;
  switchRole: (role: UserRole, customUser?: Partial<UserProfile>) => void;
  login: (email: string, password?: string, mfaCode?: string) => Promise<{ success: boolean; requiresMfa?: boolean; error?: string }>;
  register: (
    email: string,
    passwordOrName?: string,
    displayNameOrRole?: string | UserRole,
    role?: UserRole,
    businessInfo?: { businessName?: string; partnerCategory?: string }
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateCurrentUserProfile: (updates: Partial<UserProfile>) => void;
}

export const ROLE_PERMISSIONS: Record<UserRole, PermissionMatrix> = {
  ADMIN: {
    canManageUsers: true,
    canManagePartners: true,
    canApprovePartners: true,
    canViewAllOrders: true,
    canManageCatalog: true,
    canManageEarnings: true,
    canAccessPartnerPortal: true,
    canViewPartnerSales: true,
    canAccessCustomerDashboard: true
  },
  SALES_ADMIN: {
    canManageUsers: false,
    canManagePartners: true,
    canApprovePartners: true,
    canViewAllOrders: true,
    canManageCatalog: false,
    canManageEarnings: true,
    canAccessPartnerPortal: true,
    canViewPartnerSales: true,
    canAccessCustomerDashboard: false
  },
  PARTNER_OWNER: {
    canManageUsers: false,
    canManagePartners: false,
    canApprovePartners: false,
    canViewAllOrders: false,
    canManageCatalog: false,
    canManageEarnings: false,
    canAccessPartnerPortal: true,
    canViewPartnerSales: true,
    canAccessCustomerDashboard: true
  },
  PARTNER_STAFF: {
    canManageUsers: false,
    canManagePartners: false,
    canApprovePartners: false,
    canViewAllOrders: false,
    canManageCatalog: false,
    canManageEarnings: false,
    canAccessPartnerPortal: true,
    canViewPartnerSales: false, // Limited marketing access only per PDF
    canAccessCustomerDashboard: true
  },
  CUSTOMER: {
    canManageUsers: false,
    canManagePartners: false,
    canApprovePartners: false,
    canViewAllOrders: false,
    canManageCatalog: false,
    canManageEarnings: false,
    canAccessPartnerPortal: false,
    canViewPartnerSales: false,
    canAccessCustomerDashboard: true
  }
};

// SEEDED DEMO ACCOUNTS: 3 Customers, 2 Partners, 1 Admin
export const SEEDED_ACCOUNTS = {
  admin: {
    uid: 'admin-kelvin',
    email: TEST_VARS.auth.adminEmail,
    displayName: 'Kelvin Director of Wellness',
    role: 'ADMIN' as UserRole,
    status: 'ACTIVE' as const,
    wholesaleApprovalStatus: 'APPROVED' as const,
    mfaEnabled: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  partners: [
    {
      uid: 'partner-equinox-owner',
      email: 'julian@vancemedical.com',
      displayName: 'Dr. Julian Vance',
      businessName: 'Equinox Longevity Suite',
      role: 'PARTNER_OWNER' as UserRole,
      status: 'ACTIVE' as const,
      partnerId: 'WH-P-000001',
      partnerSlug: 'equinox-longevity',
      wholesaleApprovalStatus: 'APPROVED' as const,
      createdAt: '2026-01-05T00:00:00Z'
    },
    {
      uid: 'partner-harbor-owner',
      email: 'helena@harborsanctuary.com',
      displayName: 'Dr. Helena Vance',
      businessName: 'Harbor Sanctuary Beverly Hills',
      role: 'PARTNER_OWNER' as UserRole,
      status: 'ACTIVE' as const,
      partnerId: 'WH-P-000002',
      partnerSlug: 'harbor-sanctuary',
      wholesaleApprovalStatus: 'APPROVED' as const,
      createdAt: '2026-01-12T00:00:00Z'
    }
  ],
  customers: [
    {
      uid: 'cust-elena-r',
      email: 'elena.rostova@example.com',
      displayName: 'Elena Rostova',
      role: 'CUSTOMER' as UserRole,
      status: 'ACTIVE' as const,
      wholesaleApprovalStatus: 'NONE' as const,
      createdAt: '2026-02-01T00:00:00Z'
    },
    {
      uid: 'cust-marcus-c',
      email: 'marcus.chen@example.com',
      displayName: 'Marcus Chen',
      role: 'CUSTOMER' as UserRole,
      status: 'ACTIVE' as const,
      wholesaleApprovalStatus: 'NONE' as const,
      createdAt: '2026-02-08T00:00:00Z'
    },
    {
      uid: 'cust-sarah-m',
      email: 'sarah.miller@example.com',
      displayName: 'Sarah Miller',
      role: 'CUSTOMER' as UserRole,
      status: 'ACTIVE' as const,
      wholesaleApprovalStatus: 'NONE' as const,
      createdAt: '2026-02-14T00:00:00Z'
    }
  ]
};

const DEFAULT_USERS: Record<UserRole, UserProfile> = {
  ADMIN: SEEDED_ACCOUNTS.admin,
  PARTNER_OWNER: SEEDED_ACCOUNTS.partners[0],
  PARTNER_STAFF: {
    uid: 'staff-soma-1',
    email: 'intake@somawellness.com',
    displayName: 'Care Coordinator (Staff)',
    businessName: 'Soma Longevity',
    role: 'PARTNER_STAFF',
    status: 'ACTIVE',
    partnerId: 'WH-P-000003',
    partnerSlug: 'soma-longevity',
    wholesaleApprovalStatus: 'APPROVED',
    createdAt: '2026-01-20T00:00:00Z'
  },
  CUSTOMER: SEEDED_ACCOUNTS.customers[0],
  SALES_ADMIN: {
    uid: 'sales-admin-1',
    email: 'partnerships@wholeharborwellness.com',
    displayName: 'Jordan Reed',
    role: 'SALES_ADMIN',
    status: 'ACTIVE',
    wholesaleApprovalStatus: 'APPROVED',
    mfaEnabled: true,
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
  const isWholesaleApproved = 
    isAdmin || 
    (isPartner && currentUser?.wholesaleApprovalStatus === 'APPROVED');
  const permissions: PermissionMatrix = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.CUSTOMER;

  const switchRole = (newRole: UserRole, customUser?: Partial<UserProfile>) => {
    const base = DEFAULT_USERS[newRole];
    const userToSet: UserProfile = {
      ...base,
      ...customUser,
      role: newRole
    };
    setCurrentUser(userToSet);
  };

  const login = async (
    email: string, 
    password?: string, 
    mfaCode?: string
  ): Promise<{ success: boolean; requiresMfa?: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // Check for admin MFA requirement (Per PDF: Multi-factor authentication for administrators)
    const isAdminAccount = cleanEmail.includes('admin') || cleanEmail === 'director@wholeharborwellness.com' || cleanEmail.includes('muchuikelvin');
    if (isAdminAccount && !mfaCode) {
      // Require 2FA code step
      return { success: false, requiresMfa: true };
    }

    if (
      isAdminAccount &&
      mfaCode &&
      mfaCode.trim() !== TEST_VARS.auth.mfaCode &&
      mfaCode.trim() !== TEST_VARS.auth.fallbackMfaCode
    ) {
      return { success: false, requiresMfa: true, error: 'Invalid MFA verification code. Please check your authenticator or SMS.' };
    }

    // Direct match against seeded admin
    if (cleanEmail === SEEDED_ACCOUNTS.admin.email || cleanEmail.includes('admin') || cleanEmail.includes('muchuikelvin')) {
      setCurrentUser(SEEDED_ACCOUNTS.admin);
      return { success: true };
    }

    // Direct match against seeded partners
    const matchedPartner = SEEDED_ACCOUNTS.partners.find(p => p.email.toLowerCase() === cleanEmail);
    if (matchedPartner) {
      setCurrentUser(matchedPartner);
      return { success: true };
    }

    // Direct match against seeded customers
    const matchedCustomer = SEEDED_ACCOUNTS.customers.find(c => c.email.toLowerCase() === cleanEmail);
    if (matchedCustomer) {
      setCurrentUser(matchedCustomer);
      return { success: true };
    }

    // Check general partner domain keywords
    if (cleanEmail.includes('vance') || cleanEmail.includes('equinox') || cleanEmail.includes('partner')) {
      setCurrentUser(SEEDED_ACCOUNTS.partners[0]);
      return { success: true };
    }

    if (cleanEmail.includes('staff') || cleanEmail.includes('soma')) {
      setCurrentUser(DEFAULT_USERS.PARTNER_STAFF);
      return { success: true };
    }

    // General Customer login
    const customerUser: UserProfile = {
      uid: 'user-' + Date.now(),
      email: cleanEmail,
      displayName: cleanEmail.split('@')[0],
      role: 'CUSTOMER',
      status: 'ACTIVE',
      wholesaleApprovalStatus: 'NONE',
      createdAt: new Date().toISOString()
    };
    setCurrentUser(customerUser);
    return { success: true };
  };

  const register = async (
    email: string, 
    passwordOrName?: string, 
    displayNameOrRole?: string | UserRole, 
    userRole?: UserRole,
    businessInfo?: { businessName?: string; partnerCategory?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    let name = 'New User';
    let assignedRole: UserRole = 'CUSTOMER';

    if (userRole) {
      assignedRole = userRole;
      name = (typeof displayNameOrRole === 'string' ? displayNameOrRole : '') || cleanEmail.split('@')[0];
    } else if (typeof displayNameOrRole === 'string' && ['CUSTOMER', 'PARTNER_OWNER', 'PARTNER_STAFF', 'ADMIN', 'SALES_ADMIN'].includes(displayNameOrRole)) {
      assignedRole = displayNameOrRole as UserRole;
      name = passwordOrName || cleanEmail.split('@')[0];
    } else if (typeof displayNameOrRole === 'string') {
      name = displayNameOrRole;
    } else if (passwordOrName) {
      name = passwordOrName;
    }

    // Password strength check (Per PDF: Strong password requirements)
    if (passwordOrName && passwordOrName.length < 8) {
      return { success: false, error: 'Security requirement: Password must be at least 8 characters long.' };
    }

    // Partners start in PENDING approval status per PDF section 1 & 4
    const isPartnerApplicant = assignedRole === 'PARTNER_OWNER' || assignedRole === 'PARTNER_STAFF';
    const wholesaleApprovalStatus = isPartnerApplicant ? 'PENDING' : 'NONE';

    const newUser: UserProfile = {
      uid: 'user-' + Date.now(),
      email: cleanEmail,
      displayName: name,
      businessName: businessInfo?.businessName,
      role: assignedRole,
      status: isPartnerApplicant ? 'PENDING_VERIFICATION' : 'ACTIVE',
      wholesaleApprovalStatus,
      mfaEnabled: assignedRole === 'ADMIN' || assignedRole === 'SALES_ADMIN',
      createdAt: new Date().toISOString()
    };

    setCurrentUser(newUser);
    return { success: true };
  };

  const updateCurrentUserProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates, updatedAt: new Date().toISOString() };
    setCurrentUser(updated);
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
        isWholesaleApproved,
        permissions,
        switchRole,
        login,
        register,
        logout,
        updateCurrentUserProfile
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
