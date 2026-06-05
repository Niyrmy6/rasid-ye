/** Locale tags aligned with app `i18n.language` (`ar` | `en`) */
export const AR_LOCALE = 'ar-EG';
export const EN_LOCALE = 'en-US';

/**
 * @param language - `i18n.language`
 * @returns BCP 47 tag for `Intl` formatters
 */
export function getAppLocale(language: string): string {
  return language === 'ar' ? AR_LOCALE : EN_LOCALE;
}

export function isArabic(language: string): boolean {
  return language === 'ar';
}

/**
 * @param date - ISO string or Date from Supabase
 * @param options - `Intl.DateTimeFormatOptions` per screen (date-only vs date-time)
 */
export function formatAppDate(
  date: Date | string,
  language: string,
  options: Intl.DateTimeFormatOptions,
): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  return value.toLocaleDateString(getAppLocale(language), options);
}
