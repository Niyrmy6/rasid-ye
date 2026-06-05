import axios, { isAxiosError } from 'npm:axios@1.7.9';
import type { NotificationProvider } from '../NotificationProvider.ts';
import type {
  NotificationPayload,
  NotificationResult,
  OtpNotificationResult,
} from '../types.ts';

const OTP_MESSAGE_PREFIX = 'رمز التحقق الخاص بك لرصدنا هو: ';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function formatPhone(phone: string): string {
  return phone.startsWith('+') ? phone : `+${phone}`;
}

export class TwilioAdapter implements NotificationProvider {
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly fromNumber: string;

  constructor() {
    this.accountSid = Deno.env.get('TWILIO_ACCOUNT_SID') ?? '';
    this.authToken = Deno.env.get('TWILIO_AUTH_TOKEN') ?? '';
    this.fromNumber = Deno.env.get('TWILIO_FROM_NUMBER') ?? '+14155238886';
  }

  async sendWhatsApp({ phone, message }: NotificationPayload): Promise<NotificationResult> {
    if (!this.accountSid || !this.authToken) {
      return {
        success: false,
        error: 'سيرفر الخدمة غير مهيأ بعد',
      };
    }

    const formattedPhone = formatPhone(phone);
    const body = new URLSearchParams({
      To: `whatsapp:${formattedPhone}`,
      From: `whatsapp:${this.fromNumber}`,
      Body: message,
    });

    try {
      const response = await axios.post<{ sid?: string }>(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        body,
        {
          auth: {
            username: this.accountSid,
            password: this.authToken,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return { success: true, messageId: response.data.sid };
    } catch (error) {
      if (isAxiosError(error)) {
        const twilioMessage =
          (error.response?.data as { message?: string } | undefined)?.message ??
          error.message;
        return {
          success: false,
          error: 'فشل إرسال رسالة الواتساب',
          details: twilioMessage,
        };
      }

      throw error;
    }
  }

  async sendOtp(phone: string): Promise<OtpNotificationResult> {
    const otp = generateOtp();
    const message = `${OTP_MESSAGE_PREFIX}${otp}`;
    const result = await this.sendWhatsApp({ phone, message });
    return { ...result, otp: result.success ? otp : undefined };
  }
}
