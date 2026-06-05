import type { NotificationProvider } from './NotificationProvider';
import type { ServiceType } from './types';
import { MockAdapter } from './adapters/MockAdapter';
import { TwilioAdapter } from './adapters/TwilioAdapter';

/** VITE_SERVICE_TYPE in .env is the single switch for client-side notification behavior. */
function resolveServiceType(): ServiceType {
  const raw = (import.meta.env.VITE_SERVICE_TYPE ?? 'mock').toLowerCase();
  return raw === 'twilio' ? 'twilio' : 'mock';
}

function createProvider(serviceType: ServiceType): NotificationProvider {
  switch (serviceType) {
    case 'twilio':
      return new TwilioAdapter();
    case 'mock':
    default:
      return new MockAdapter();
  }
}

export class NotificationService {
  private readonly provider: NotificationProvider;

  constructor(provider?: NotificationProvider) {
    this.provider = provider ?? createProvider(resolveServiceType());
  }

  sendWhatsApp(phone: string, message: string) {
    return this.provider.sendWhatsApp({ phone, message });
  }

  sendOtp(phone: string) {
    return this.provider.sendOtp(phone);
  }
}

export const notificationService = new NotificationService();
