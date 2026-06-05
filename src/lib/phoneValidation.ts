import type { TFunction } from 'i18next';

export type PhoneValidationResult = {
  valid: boolean;
  fullPhone: string;
  errorMsg: string;
};

/**
 * Normalizes Yemen mobile input to E.164 (+9677xxxxxxxx) for DB/Twilio.
 * Strips leading zeros and optional country prefix before length/prefix checks.
 *
 * @param rawPhone - User input from signup/login forms
 * @param t - i18n for validation error messages shown in UI
 */
export function validateYemenPhone(rawPhone: string, t: TFunction): PhoneValidationResult {
  let cleaned = rawPhone.replace(/\s+/g, '').replace(/^0+/, '');

  if (cleaned.startsWith('+967')) {
    cleaned = cleaned.substring(4);
  } else if (cleaned.startsWith('967')) {
    cleaned = cleaned.substring(3);
  }

  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, fullPhone: '', errorMsg: t('signup.phoneInvalidChars') };
  }

  if (cleaned.length !== 9) {
    return { valid: false, fullPhone: '', errorMsg: t('signup.phoneInvalidLength') };
  }

  if (!cleaned.startsWith('7')) {
    return { valid: false, fullPhone: '', errorMsg: t('signup.phoneInvalidStart') };
  }

  return { valid: true, fullPhone: `+967${cleaned}`, errorMsg: '' };
}
