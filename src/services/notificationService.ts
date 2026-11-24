import { dbService } from './dbService.ts';
import type { NotificationEventType, NotificationRecord } from '../types/index.ts';

export interface TransactionalNotificationPayload {
  eventType: NotificationEventType;
  recipientEmail: string;
  recipientName?: string;
  recipientUid?: string;
  partnerId?: string;
  subject: string;
  body: string;
}

export async function dispatchTransactionalNotification(
  payload: TransactionalNotificationPayload
): Promise<NotificationRecord> {
  return dbService.dispatchNotificationRecord(payload);
}

export const notificationService = {
  dispatchTransactionalNotification,
  getNotifications: dbService.getNotifications,
  markRead: dbService.markNotificationRead
};

export default notificationService;
