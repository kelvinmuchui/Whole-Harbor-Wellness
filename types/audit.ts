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
    | 'PARTNER_STATUS_CHANGED'
    | 'ORDER_CREATED'
    | 'ORDER_STATUS_CHANGED'
    | 'PAYMENT_PROCESSED'
    | 'EARNING_APPROVED'
    | 'EARNING_PAID'
    | 'PRODUCT_CREATED'
    | 'PRODUCT_UPDATED'
    | 'PRODUCT_DISABLED'
    | 'PRODUCT_UNAVAILABLE'
    | 'PRODUCT_DELETED'
    | 'CMS_UPDATED'
    | 'NOTIFICATION_DISPATCHED'
    | 'SECURITY_EVENT';
  resource: 'User' | 'Partner' | 'Order' | 'Product' | 'PartnerEarning' | 'Session' | 'CMS' | 'Notification';
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export type NotificationEventType =
  | 'PARTNER_APPLICATION_RECEIVED'
  | 'PARTNER_APPLICATION_APPROVED'
  | 'PARTNER_STATUS_UPDATED'
  | 'PARTNER_ACCOUNT_CREATED'
  | 'ACCOUNT_SECURITY_UPDATED';

export interface NotificationRecord {
  id: string;
  eventType: NotificationEventType;
  recipientEmail: string;
  recipientName?: string;
  recipientUid?: string;
  partnerId?: string;
  subject: string;
  body: string;
  channel: 'EMAIL_WEBHOOK' | 'IN_APP_LEDGER';
  deliveryStatus: 'SENT' | 'LOGGED' | 'FAILED';
  read?: boolean;
  createdAt: string;
}
