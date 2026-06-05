import { TwilioAdapter } from './adapters/TwilioAdapter.ts';
import type { NotificationProvider } from './NotificationProvider.ts';

export class NotificationService {
  private readonly provider: NotificationProvider;

  constructor(provider: NotificationProvider = new TwilioAdapter()) {
    this.provider = provider;
  }

  sendWhatsApp(phone: string, message: string) {
    return this.provider.sendWhatsApp({ phone, message });
  }

  sendOtp(phone: string) {
    return this.provider.sendOtp(phone);
  }
}

export const notificationService = new NotificationService();
