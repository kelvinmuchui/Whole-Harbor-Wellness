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
import { dbService, INITIAL_USERS, setActiveSessionRole } from '../services/dbService.ts';
import { notificationService } from '../services/notificationService.ts';
import { UserProfile, UserRole, PermissionMatrix } from '../types/index.ts';
import { demoModeEnabled, TEST_VARS } from '../lib/testVariables.ts';

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
  updateCurrentUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
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
    setActiveSessionRole(currentUser?.role ?? null);
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
        setCurrentUser((user) => {
          const isDemoPersona =
            demoModeEnabled &&
            [...Object.values(DEFAULT_USERS), ...SEEDED_ACCOUNTS.partners, ...SEEDED_ACCOUNTS.customers]
              .some((demoUser) => demoUser.uid === user?.uid);
          return isDemoPersona ? user : null;
        });
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
        if (existingProfile?.status === 'SUSPENDED') {
          await signOut(auth);
          setCurrentUser(null);
          setAuthLoading(false);
          return;
        }

        const isAdminEmail =
          firebaseUser.emailVerified &&
          [
            'muchuimalcolm423@gmail.com',
            'muchuikelvin423@gmail.com',
            'admin@wholeharborwellness.com',
            TEST_VARS.auth.adminEmail.toLowerCase()
          ].includes(email);

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

        setActiveSessionRole(resolvedProfile.role);
        setCurrentUser(resolvedProfile);
      } catch (err) {
        console.error('Failed to sync Firebase auth user profile:', err);
        setCurrentUser(null);
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
    if (!demoModeEnabled) {
      console.error('Demo role switching is only available when test seed mode is enabled.');
      return;
    }
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
      cleanEmail === TEST_VARS.auth.adminEmail.toLowerCase() ||
      cleanEmail === 'muchuimalcolm423@gmail.com' ||
      cleanEmail === 'muchuikelvin423@gmail.com' ||
      cleanEmail === 'director@wholeharborwellness.com';
    if (isAdminAccount && demoModeEnabled && !mfaCode) {
      return { success: false, requiresMfa: true };
    }

    if (
      isAdminAccount &&
      demoModeEnabled &&
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

    const seededAccounts = [
      { profile: SEEDED_ACCOUNTS.admin, expectedPassword: TEST_VARS.auth.demoPasswords.admin },
      ...SEEDED_ACCOUNTS.partners.map((profile) => ({
        profile,
        expectedPassword: TEST_VARS.auth.demoPasswords.partner
      })),
      ...SEEDED_ACCOUNTS.customers.map((profile) => ({
        profile,
        expectedPassword: TEST_VARS.auth.demoPasswords.customer
      }))
    ];
    const seededAccount = seededAccounts.find(
      ({ profile }) => profile.email.toLowerCase() === cleanEmail
    );

    if (seededAccount && demoModeEnabled) {
      if (password !== seededAccount.expectedPassword) {
        return { success: false, error: 'Invalid email or password. Please try again.' };
      }
      setCurrentUser(seededAccount.profile);
      return { success: true };
    }

    if (!password) {
      return { success: false, error: 'Enter your password to sign in.' };
    }

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      return { success: true };
    } catch (err) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err ? err.code : '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/user-not-found') {
        return { success: false, error: 'Invalid email or password. Please try again.' };
      }
      if (code === 'auth/operation-not-allowed') {
        return {
          success: false,
          error: 'Email and password sign-in is not enabled for this Firebase project.'
        };
      }
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unable to sign in. Please try again.'
      };
    }
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

    if (!passwordOrName || passwordOrName.length < 8) {
      return {
        success: false,
        error: 'A password of at least 8 characters is required.'
      };
    }

    const isPartnerApplicant = assignedRole === 'PARTNER_OWNER';
    const wholesaleApprovalStatus = isPartnerApplicant ? 'PENDING' : 'NONE';

    let resolvedUid: string;
    pendingRegistrationEmail.current = cleanEmail;
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, passwordOrName);
      resolvedUid = cred.user.uid;
    } catch (err) {
      pendingRegistrationEmail.current = null;
      const code =
        typeof err === 'object' && err !== null && 'code' in err ? err.code : '';
      if (code === 'auth/email-already-in-use') {
        return { success: false, error: 'An account with this email already exists. Please sign in.' };
      }
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Firebase account creation failed.'
      };
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
      if (assignedRole === 'PARTNER_OWNER') {
        await notificationService
          .dispatchTransactionalNotification({
            eventType: 'PARTNER_ACCOUNT_CREATED',
            recipientEmail: savedUser.email,
            recipientName: savedUser.displayName,
            recipientUid: savedUser.uid,
            partnerId: savedUser.partnerId,
            subject: `Partner Account Created (${savedUser.partnerId || 'Pending'}) – Whole Harbor Wellness`,
            body: `Welcome to Whole Harbor Wellness, ${savedUser.displayName}. Your partner applicant account for ${registeredBusinessName} has been created and is awaiting compliance review.`
          })
          .catch(() => {});
      }
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
    } catch (err) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err ? err.code : '';
      if (code === 'auth/user-not-found') {
        return {
          success: true,
          message: `If an account exists for ${cleanEmail}, password recovery instructions will be sent.`
        };
      }
      if (code === 'auth/operation-not-allowed') {
        return {
          success: false,
          error: 'Password recovery is not enabled for this Firebase project.'
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
          await notificationService
            .dispatchTransactionalNotification({
              eventType: 'ACCOUNT_SECURITY_UPDATED',
              recipientEmail: auth.currentUser.email,
              recipientName: currentUser?.displayName || auth.currentUser.email,
              recipientUid: auth.currentUser.uid,
              partnerId: currentUser?.partnerId,
              subject: 'Security Alert: Password Updated – Whole Harbor Wellness',
              body: 'Your Whole Harbor Wellness account password was recently changed. If you did not authorize this update, contact support immediately.'
            })
            .catch(() => {});
          return { success: true, message: 'Your account password has been updated.' };
        }
        return {
          success: true,
          message: 'Your Google-linked session manages passwords via your Google Account security settings.'
        };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to update password. Check your current password.'
        };
      }
    }
    return {
      success: false,
      error: 'A verified Firebase session is required to change your password.'
    };
  };

  const updateCurrentUserProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!currentUser) return;
    const updatedAt = new Date().toISOString();
    const updated: UserProfile = {
      ...currentUser,
      ...updates,
      updatedAt
    };
    await dbService.updateUserProfileFields(currentUser.uid, {
      ...updates,
      updatedAt
    });
    setCurrentUser(updated);
    if (updates.mfaEnabled !== undefined && updates.mfaEnabled !== currentUser.mfaEnabled) {
      await notificationService
        .dispatchTransactionalNotification({
          eventType: 'ACCOUNT_SECURITY_UPDATED',
          recipientEmail: updated.email,
          recipientName: updated.displayName,
          recipientUid: updated.uid,
          partnerId: updated.partnerId,
          subject: `Multi-Factor Authentication ${updates.mfaEnabled ? 'Enabled' : 'Disabled'} – Whole Harbor Wellness`,
          body: `Multi-factor authentication has been ${updates.mfaEnabled ? 'enabled' : 'disabled'} on your Whole Harbor Wellness account.`
        })
        .catch(() => {});
    }
  };

  const logout = async () => {
    setActiveSessionRole(null);
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
