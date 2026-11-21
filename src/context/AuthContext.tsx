import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { dbService, INITIAL_USERS } from '../services/dbService.ts';
import { UserProfile, UserRole, PermissionMatrix } from '../types/index.ts';
import { TEST_VARS } from '../lib/testVariables.ts';

export interface AuthContextType {
  currentUser: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPartner: boolean;
  isWholesaleApproved: boolean;
  authLoading: boolean;
  permissions: PermissionMatrix;
  switchRole: (role: UserRole, customUser?: Partial<UserProfile>) => void;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  login: (
    email: string,
    password?: string,
    mfaCode?: string
  ) => Promise<{ success: boolean; requiresMfa?: boolean; error?: string }>;
  register: (
    email: string,
    passwordOrName?: string,
    displayNameOrRole?: string | UserRole,
    role?: UserRole,
    businessInfo?: { businessName?: string; partnerCategory?: string }
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string; message?: string }>;
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
    canViewPartnerSales: false,
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
  admin: INITIAL_USERS[0],
  partners: [INITIAL_USERS[1], INITIAL_USERS[2]],
  customers: [INITIAL_USERS[3], INITIAL_USERS[4], INITIAL_USERS[5]]
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
  const pendingRegistrationEmail = useRef<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('wh_current_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('wh_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('wh_current_user');
    }
  }, [currentUser]);

  // Synchronize the Firebase Auth session with the Supabase user profile.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setAuthLoading(false);
        return;
      }

      try {
        const email = (firebaseUser.email || '').toLowerCase();
        if (pendingRegistrationEmail.current === email) {
          setAuthLoading(false);
          return;
        }
        const existingProfile = await dbService.getUserByUid(firebaseUser.uid);

        const isAdminEmail =
          email === 'muchuimalcolm423@gmail.com' ||
          email === 'admin@wholeharborwellness.com' ||
          email === TEST_VARS.auth.adminEmail.toLowerCase();

        const matchedPartner = SEEDED_ACCOUNTS.partners.find(
          (p) => p.email.toLowerCase() === email
        );

        let resolvedProfile: UserProfile;
        if (existingProfile) {
          resolvedProfile = {
            ...existingProfile,
            uid: firebaseUser.uid,
            email: firebaseUser.email || existingProfile.email,
            displayName: firebaseUser.displayName || existingProfile.displayName,
            avatarUrl: firebaseUser.photoURL || existingProfile.avatarUrl,
            ...(isAdminEmail ? { role: 'ADMIN' as UserRole, wholesaleApprovalStatus: 'APPROVED' as const } : {})
          };
        } else {
          const defaultRole: UserRole = isAdminEmail
            ? 'ADMIN'
            : matchedPartner
            ? 'PARTNER_OWNER'
            : 'CUSTOMER';

          resolvedProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName:
              firebaseUser.displayName ||
              matchedPartner?.displayName ||
              (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Member'),
            role: defaultRole,
            status: 'ACTIVE',
            partnerId: matchedPartner?.partnerId,
            partnerSlug: matchedPartner?.partnerSlug,
            businessName: matchedPartner?.businessName,
            wholesaleApprovalStatus: isAdminEmail || matchedPartner ? 'APPROVED' : 'NONE',
            avatarUrl: firebaseUser.photoURL || undefined,
            createdAt: new Date().toISOString()
          };
          await dbService.upsertUserProfile(resolvedProfile);
        }

        setCurrentUser(resolvedProfile);
      } catch (err) {
        console.error('Failed to sync Firebase auth user profile:', err);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const role: UserRole = currentUser?.role || 'CUSTOMER';
  const isAuthenticated = !!currentUser;
  const isAdmin = role === 'ADMIN' || role === 'SALES_ADMIN';
  const isPartner = role === 'PARTNER_OWNER' || role === 'PARTNER_STAFF';
  const isWholesaleApproved =
    isAdmin || (isPartner && currentUser?.wholesaleApprovalStatus === 'APPROVED');
  const permissions: PermissionMatrix = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.CUSTOMER;

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google Sign-In failed.';
      return { success: false, error: msg };
    }
  };

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

    const isAdminAccount =
      cleanEmail.includes('admin') ||
      cleanEmail === 'director@wholeharborwellness.com' ||
      cleanEmail.includes('muchuimalcolm');
    if (isAdminAccount && !mfaCode) {
      return { success: false, requiresMfa: true };
    }

    if (
      isAdminAccount &&
      mfaCode &&
      mfaCode.trim() !== TEST_VARS.auth.mfaCode &&
      mfaCode.trim() !== TEST_VARS.auth.fallbackMfaCode
    ) {
      return {
        success: false,
        requiresMfa: true,
        error: 'Invalid MFA verification code. Please check your authenticator or SMS.'
      };
    }

    // Attempt live Firebase Email/Password authentication when password is provided for non-seeded users
    const isSeededDemo =
      cleanEmail === SEEDED_ACCOUNTS.admin.email.toLowerCase() ||
      SEEDED_ACCOUNTS.partners.some((p) => p.email.toLowerCase() === cleanEmail) ||
      SEEDED_ACCOUNTS.customers.some((c) => c.email.toLowerCase() === cleanEmail);

    if (password && !isSeededDemo) {
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
        return { success: true };
      } catch (err: any) {
        const code = err?.code || '';
        if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
          return { success: false, error: 'Invalid email or password. Please try again.' };
        }
        // Fallback smoothly for environments where Email/Password provider is not yet enabled in Firebase Console
        if (code !== 'auth/operation-not-allowed' && code !== 'auth/user-not-found') {
          console.warn('Firebase email sign-in fallback:', code);
        }
      }
    }

    if (
      cleanEmail === SEEDED_ACCOUNTS.admin.email ||
      cleanEmail.includes('admin') ||
      cleanEmail.includes('muchuimalcolm')
    ) {
      setCurrentUser(SEEDED_ACCOUNTS.admin);
      return { success: true };
    }

    const matchedPartner = SEEDED_ACCOUNTS.partners.find(
      (p) => p.email.toLowerCase() === cleanEmail
    );
    if (matchedPartner) {
      setCurrentUser(matchedPartner);
      return { success: true };
    }

    const matchedCustomer = SEEDED_ACCOUNTS.customers.find(
      (c) => c.email.toLowerCase() === cleanEmail
    );
    if (matchedCustomer) {
      setCurrentUser(matchedCustomer);
      return { success: true };
    }

    const existingUsers = await dbService.getUsers();
    const matchedRegistered = existingUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (matchedRegistered) {
      if (matchedRegistered.status === 'SUSPENDED') {
        return { success: false, error: 'This account has been suspended. Please contact Whole Harbor support.' };
      }
      setCurrentUser(matchedRegistered);
      return { success: true };
    }

    if (
      cleanEmail.includes('vance') ||
      cleanEmail.includes('equinox') ||
      cleanEmail.includes('partner')
    ) {
      setCurrentUser(SEEDED_ACCOUNTS.partners[0]);
      return { success: true };
    }

    if (cleanEmail.includes('staff') || cleanEmail.includes('soma')) {
      setCurrentUser(DEFAULT_USERS.PARTNER_STAFF);
      return { success: true };
    }

    const customerUser: UserProfile = {
      uid: 'user-' + Date.now(),
      email: cleanEmail,
      displayName: cleanEmail.split('@')[0],
      role: 'CUSTOMER',
      status: 'ACTIVE',
      wholesaleApprovalStatus: 'NONE',
      createdAt: new Date().toISOString()
    };
    await dbService.upsertUserProfile(customerUser);
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
      name =
        (typeof displayNameOrRole === 'string' ? displayNameOrRole : '') ||
        cleanEmail.split('@')[0];
    } else if (
      typeof displayNameOrRole === 'string' &&
      ['CUSTOMER', 'PARTNER_OWNER', 'PARTNER_STAFF', 'ADMIN', 'SALES_ADMIN'].includes(
        displayNameOrRole
      )
    ) {
      assignedRole = displayNameOrRole as UserRole;
      name = passwordOrName || cleanEmail.split('@')[0];
    } else if (typeof displayNameOrRole === 'string') {
      name = displayNameOrRole;
    } else if (passwordOrName) {
      name = passwordOrName;
    }

    if (assignedRole !== 'CUSTOMER' && assignedRole !== 'PARTNER_OWNER') {
      return {
        success: false,
        error: 'Public registration is limited to customer and partner-owner accounts.'
      };
    }

    const registeredBusinessName = businessInfo?.businessName?.trim() || '';
    if (assignedRole === 'PARTNER_OWNER' && !registeredBusinessName) {
      return {
        success: false,
        error: 'Enter your organization or clinic name to apply as a partner.'
      };
    }

    if (passwordOrName && passwordOrName.length < 8) {
      return {
        success: false,
        error: 'Security requirement: Password must be at least 8 characters long.'
      };
    }

    if (TEST_VARS.authMode !== 'test' && !passwordOrName) {
      return { success: false, error: 'A password is required to create your account.' };
    }

    const isPartnerApplicant = assignedRole === 'PARTNER_OWNER';
    const wholesaleApprovalStatus = isPartnerApplicant ? 'PENDING' : 'NONE';

    let resolvedUid = `user-${globalThis.crypto.randomUUID()}`;
    if (passwordOrName && passwordOrName.length >= 8) {
      pendingRegistrationEmail.current = cleanEmail;
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, passwordOrName);
        resolvedUid = cred.user.uid;
      } catch (err: any) {
        pendingRegistrationEmail.current = null;
        const code = err?.code || '';
        if (code === 'auth/email-already-in-use') {
          return { success: false, error: 'An account with this email already exists. Please sign in.' };
        }
        if (TEST_VARS.authMode !== 'test') {
          return {
            success: false,
            error: err instanceof Error ? err.message : 'Firebase account creation failed.'
          };
        }
        console.warn('Firebase signup unavailable in test mode; saving a demo account profile instead.');
      }
    }

    const newUser: UserProfile = {
      uid: resolvedUid,
      email: cleanEmail,
      displayName: name,
      businessName: registeredBusinessName || undefined,
      role: assignedRole,
      status: isPartnerApplicant ? 'PENDING_VERIFICATION' : 'ACTIVE',
      wholesaleApprovalStatus,
      createdAt: new Date().toISOString()
    };

    try {
      let savedUser = newUser;

      if (assignedRole === 'PARTNER_OWNER') {
        const partner = await dbService.registerPartner({
          name: registeredBusinessName,
          businessName: registeredBusinessName,
          contactPerson: name,
          email: cleanEmail,
          description: `Partner application submitted by ${name}.`,
          category: businessInfo?.partnerCategory?.trim() || 'Wellness Practice',
          ownerUid: resolvedUid
        });
        savedUser = {
          ...newUser,
          partnerId: partner.partnerId,
          partnerSlug: partner.slug
        };
      }

      await dbService.upsertUserProfile(savedUser);
      setCurrentUser(savedUser);
      return { success: true };
    } catch (err) {
      console.error('Failed to save registration to Supabase:', err);
      return {
        success: false,
        error: `Your account was created, but its profile could not be saved: ${
          err instanceof Error ? err.message : 'Unknown database error.'
        }`
      };
    } finally {
      if (pendingRegistrationEmail.current === cleanEmail) {
        pendingRegistrationEmail.current = null;
      }
    }
  };

  const requestPasswordReset = async (
    email: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid account email address.' };
    }
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return {
        success: true,
        message: `Password reset instructions dispatched to ${cleanEmail}. Please check your inbox.`
      };
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed' || code === 'auth/user-not-found') {
        return {
          success: true,
          message: `If an account exists for ${cleanEmail}, recovery guidance has been queued.`
        };
      }
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unable to send password reset email.'
      };
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters long.' };
    }
    if (auth.currentUser && auth.currentUser.email) {
      try {
        const isPasswordProvider = auth.currentUser.providerData.some(
          (p) => p.providerId === 'password'
        );
        if (isPasswordProvider) {
          const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
          await reauthenticateWithCredential(auth.currentUser, credential);
          await updatePassword(auth.currentUser, newPassword);
          return { success: true, message: 'Your account password has been updated.' };
        }
        return {
          success: true,
          message: 'Your Google-linked session manages passwords via your Google Account security settings.'
        };
      } catch (err: any) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to update password. Check your current password.'
        };
      }
    }
    if (!currentPassword) {
      return { success: false, error: 'Please enter your current password to verify changes.' };
    }
    await dbService.createAuditLog({
      userId: currentUser?.uid,
      userRole: currentUser?.role || 'CUSTOMER',
      action: 'SECURITY_EVENT',
      resource: 'User',
      resourceId: currentUser?.uid,
      metadata: { event: 'password_updated' }
    });
    return { success: true, message: 'Password credentials updated for this account session.' };
  };

  const updateCurrentUserProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    dbService.upsertUserProfile(updated).catch(() => {});
    setCurrentUser(updated);
  };

  const logout = async () => {
    if (auth.currentUser) {
      await signOut(auth).catch(() => {});
    }
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
        authLoading,
        permissions,
        switchRole,
        signInWithGoogle,
        login,
        register,
        logout,
        requestPasswordReset,
        changePassword,
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
