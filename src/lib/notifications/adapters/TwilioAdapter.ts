import axios, { isAxiosError } from 'axios';
import type { NotificationProvider } from '../NotificationProvider';
import type {
  NotificationPayload,
  NotificationResult,
  OtpNotificationResult,
} from '../types';

interface EdgeOtpResponse {
  success?: boolean;
  otp?: string;
  error?: string;
  details?: string;
}

interface EdgeWhatsAppResponse {
  success?: boolean;
  error?: string;
  details?: string;
  messageId?: string;
}

/**
 * twilio mode: browser delegates to Edge Functions; server sends via Twilio API.
 */
export class TwilioAdapter implements NotificationProvider {
  private readonly supabaseUrl: string;
  private readonly supabaseAnonKey: string;

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
    this.supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
  }

  private get edgeHeaders() {
    return {
      Authorization: `Bearer ${this.supabaseAnonKey}`,
      'Content-Type': 'application/json',
    };
  }

  async sendWhatsApp({ phone, message }: NotificationPayload): Promise<NotificationResult> {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      return {
        success: false,
        error: 'سيرفر الخدمة غير مهيأ بعد',
      };
    }

    try {
      const response = await axios.post<EdgeWhatsAppResponse>(
        `${this.supabaseUrl}/functions/v1/send-whatsapp`,
        { phone, message },
        { headers: this.edgeHeaders },
      );

      const data = response.data;
      if (!data.success) {
        return {
          success: false,
          error: data.error ?? 'فشل إرسال رسالة الواتساب',
          details: data.details,
        };
      }

      return { success: true, messageId: data.messageId };
    } catch (error) {
      return this.handleAxiosError(error);
    }
  }

  async sendOtp(phone: string): Promise<OtpNotificationResult> {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      return {
        success: false,
        error: 'سيرفر الخدمة غير مهيأ بعد',
      };
    }

    try {
      const response = await axios.post<EdgeOtpResponse>(
        `${this.supabaseUrl}/functions/v1/send-whatsapp-otp`,
        { phone },
        { headers: this.edgeHeaders },
      );

      const data = response.data;
      if (!data.success) {
        return {
          success: false,
          error: data.error ?? 'فشل إرسال رسالة الواتساب',
          details: data.details,
        };
      }

      return { success: true, otp: data.otp };
    } catch (error) {
      return this.handleAxiosError(error);
    }
  }

  private handleAxiosError(error: unknown): NotificationResult {
    if (isAxiosError(error)) {
      const payload = error.response?.data as { error?: string; details?: string } | undefined;
      return {
        success: false,
        error: payload?.error ?? error.message,
        details: payload?.details,
      };
    }

    throw error;
  }
}
