export interface NotificationPayload {
  phone: string;
  message: string;
}

export interface NotificationResult {
  success: boolean;
  error?: string;
  details?: string;
  messageId?: string;
}

export interface OtpNotificationResult extends NotificationResult {
  otp?: string;
}

export type ServiceType = 'mock' | 'twilio';
