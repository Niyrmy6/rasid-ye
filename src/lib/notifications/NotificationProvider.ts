import type {
  NotificationPayload,
  NotificationResult,
  OtpNotificationResult,
} from './types';

export interface NotificationProvider {
  sendWhatsApp(payload: NotificationPayload): Promise<NotificationResult>;
  sendOtp(phone: string): Promise<OtpNotificationResult>;
}
