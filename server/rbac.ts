/**
 * WHOLE HARBOR WELLNESS — ROLE-BASED ACCESS CONTROL (RBAC) & RESOURCE OWNERSHIP GUARDS
 * Enforces strict server-side authorization boundaries
 */

import { UserRole } from '../types/auth.ts';

export type PermissionAction = 
  | 'manage_users'
  | 'view_users'
  | 'manage_partners'
  | 'approve_partners'
  | 'view_all_partners'
  | 'view_assigned_partner'
  | 'edit_assigned_partner'
  | 'manage_catalog'
  | 'view_all_orders'
  | 'view_assigned_orders'
  | 'view_own_orders'
  | 'update_order_status'
  | 'view_all_earnings'
  | 'view_assigned_earnings'
  | 'disburse_earnings'
  | 'manage_cms_content'
  | 'view_analytics'
  | 'manage_system_settings';

/**
 * Role Permission Mapping Table
 */
export const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  ADMIN: [
    'manage_users',
    'view_users',
    'manage_partners',
    'approve_partners',
    'view_all_partners',
    'view_assigned_partner',
    'edit_assigned_partner',
    'manage_catalog',
    'view_all_orders',
    'view_assigned_orders',
    'view_own_orders',
    'update_order_status',
    'view_all_earnings',
    'view_assigned_earnings',
    'disburse_earnings',
    'manage_cms_content',
    'view_analytics',
    'manage_system_settings'
  ],

  SALES_ADMIN: [
    'view_users',
    'manage_partners',
    'approve_partners',
    'view_all_partners',
    'view_assigned_partner',
    'manage_catalog',
    'view_all_orders',
    'view_assigned_orders',
    'view_all_earnings',
    'view_assigned_earnings',
    'manage_cms_content',
    'view_analytics'
  ],

  PARTNER_OWNER: [
    'view_assigned_partner',
    'edit_assigned_partner',
    'view_assigned_orders',
    'view_assigned_earnings'
  ],

  PARTNER_STAFF: [
    'view_assigned_partner',
    'view_assigned_orders'
  ],

  CUSTOMER: [
    'view_own_orders'
  ]
};

/**
 * Validates whether a user's role has permission for a specific action
 */
export function hasPermission(role: UserRole, action: PermissionAction): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(action);
}

/**
 * Enforces resource ownership.
 * CRITICAL RULE: A partner user must NEVER access another partner's sales or data.
 */
export function canAccessPartnerResource(
  user: { role: UserRole; partnerId?: string; uid: string },
  targetPartnerId: string
): { allowed: boolean; reason?: string } {
  // Admins & Sales Admins have global visibility
  if (user.role === 'ADMIN' || user.role === 'SALES_ADMIN') {
    return { allowed: true };
  }

  // Partners can only access their explicitly associated organization
  if (user.role === 'PARTNER_OWNER' || user.role === 'PARTNER_STAFF') {
    if (!user.partnerId) {
      return { allowed: false, reason: 'Partner user has no associated organization ID' };
    }
    if (user.partnerId !== targetPartnerId) {
      return { allowed: false, reason: 'Unauthorized access attempt to another partner organization' };
    }
    return { allowed: true };
  }

  return { allowed: false, reason: 'Insufficient role privileges' };
}

/**
 * Enforces customer order ownership.
 * Customers can only access their own orders.
 */
export function canAccessOrder(
  user: { role: UserRole; partnerId?: string; uid: string; email: string },
  order: { customerUid?: string; customerEmail: string; partnerId?: string }
): { allowed: boolean; reason?: string } {
  // Admins have access
  if (user.role === 'ADMIN' || user.role === 'SALES_ADMIN') {
    return { allowed: true };
  }

  // Partner can view if the order was referred through their partner ID
  if ((user.role === 'PARTNER_OWNER' || user.role === 'PARTNER_STAFF') && user.partnerId) {
    if (order.partnerId === user.partnerId) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Order is not attributed to this partner organization' };
  }

  // Customer can view if it matches their user ID or email
  if (user.role === 'CUSTOMER') {
    if (order.customerUid === user.uid || order.customerEmail.toLowerCase() === user.email.toLowerCase()) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Customer can only view their own orders' };
  }

  return { allowed: false, reason: 'Access denied' };
}
