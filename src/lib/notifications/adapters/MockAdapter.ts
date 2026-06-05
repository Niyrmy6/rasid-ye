import { toast } from 'sonner';
import type { NotificationProvider } from '../NotificationProvider';
import type {
  NotificationPayload,
  NotificationResult,
  OtpNotificationResult,
} from '../types';

const NETWORK_DELAY_MS = 1000;
const OTP_MESSAGE_PREFIX = 'رمز التحقق الخاص بك لرصدنا هو: ';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockAdapter implements NotificationProvider {
  async sendWhatsApp({ phone, message }: NotificationPayload): Promise<NotificationResult> {
    await delay(NETWORK_DELAY_MS);
    toast.success(`واتساب → ${phone}: ${message}`, { duration: 40000 });
    return { success: true };
  }

  async sendOtp(phone: string): Promise<OtpNotificationResult> {
    const otp = generateOtp();
    const message = `${OTP_MESSAGE_PREFIX}${otp}`;
    const result = await this.sendWhatsApp({ phone, message });
    return { ...result, otp: result.success ? otp : undefined };
  }
}
