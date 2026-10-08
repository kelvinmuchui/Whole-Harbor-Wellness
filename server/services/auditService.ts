/**
 * WHOLE HARBOR WELLNESS — AUDIT LOGGING SERVICE
 * Maintains immutable audit records for regulatory and business accountability
 */

import { AuditLogEntry } from '../../types/audit.ts';

export function createAuditEntry(
  action: AuditLogEntry['action'],
  resource: AuditLogEntry['resource'],
  resourceId?: string,
  user?: { uid: string; role?: string },
  metadata?: Record<string, unknown>
): AuditLogEntry {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId: user?.uid,
    userRole: user?.role,
    action,
    resource,
    resourceId,
    metadata,
    timestamp: new Date().toISOString()
  };
}
