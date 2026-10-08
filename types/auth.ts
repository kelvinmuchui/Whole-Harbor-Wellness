/**
 * Authentication & RBAC Type Definitions
 */

export type UserRole = 
  | 'CUSTOMER' 
  | 'PARTNER_OWNER' 
  | 'PARTNER_STAFF' 
  | 'ADMIN' 
  | 'SALES_ADMIN';

export type UserStatus = 
  | 'ACTIVE' 
  | 'INACTIVE' 
  | 'SUSPENDED' 
  | 'PENDING_VERIFICATION';

export interface UserProfile {
  id?: string;
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status?: UserStatus;
  partnerId?: string; // Associated partner organization if applicable
  partnerSlug?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  partnerId?: string;
  issuedAt: number;
  expiresAt: number;
}

export interface PermissionMatrix {
  canManageUsers: boolean;
  canManagePartners: boolean;
  canApprovePartners: boolean;
  canViewAllOrders: boolean;
  canManageCatalog: boolean;
  canManageEarnings: boolean;
  canAccessPartnerPortal: boolean;
  canViewPartnerSales: boolean;
  canAccessCustomerDashboard: boolean;
}
