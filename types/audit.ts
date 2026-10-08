/**
 * Audit Log Type Definitions
 */

export interface AuditLogEntry {
  id: string;
  userId?: string;
  userRole?: string;
  action: 
    | 'USER_LOGIN'
    | 'USER_REGISTERED'
    | 'PARTNER_CREATED'
    | 'PARTNER_APPROVED'
    | 'PARTNER_SUSPENDED'
    | 'PARTNER_REJECTED'
    | 'ORDER_CREATED'
    | 'ORDER_STATUS_CHANGED'
    | 'PAYMENT_PROCESSED'
    | 'EARNING_APPROVED'
    | 'EARNING_PAID'
    | 'PRODUCT_CREATED'
    | 'PRODUCT_UPDATED'
    | 'SECURITY_EVENT';
  resource: 'User' | 'Partner' | 'Order' | 'Product' | 'PartnerEarning' | 'Session';
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}
