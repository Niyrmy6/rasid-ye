import type { TFunction } from 'i18next';

const NEWS_TYPE_KEYS = ['urgent', 'alert', 'guidelines', 'event', 'global'] as const;

const NEWS_TYPE_COLORS: Record<string, string> = {
  urgent: 'bg-red-500',
  alert: 'bg-orange-500',
  guidelines: 'bg-blue-500',
  event: 'bg-green-500',
  global: 'bg-purple-500',
};

export function getNewsTypeLabel(type: string, t: TFunction, fallback?: string): string {
  if (!type) return fallback ?? t('Article');
  const cleanType = type.toLowerCase().trim();
  if ((NEWS_TYPE_KEYS as readonly string[]).includes(cleanType)) {
    return t(cleanType);
  }
  return type;
}

export function getNewsTypeBadgeColor(type: string): string {
  const cleanType = (type || '').toLowerCase().trim();
  return NEWS_TYPE_COLORS[cleanType] ?? 'bg-primary';
}

/**
 * Supports filter chips in Arabic and English because `news.type` may be stored either way.
 */
const NEWS_TYPE_ALIASES: Record<string, string[]> = {
  urgent: ['urgent', 'عاجل'],
  alert: ['alert', 'تنبيه'],
  guidelines: ['guidelines', 'إرشادات', 'ارشدات'],
  event: ['event', 'حدث'],
  global: ['global', 'عالمي'],
};

/**
 * @param filter - Chip id from UI (`all` | `urgent` | …)
 */
export function matchesNewsTypeFilter(newsType: string, filter: string): boolean {
  const normalizedType = (newsType || '').toLowerCase().trim();
  const normalizedFilter = filter.toLowerCase().trim();
  if (normalizedFilter === 'all') return true;
  if (normalizedType === normalizedFilter) return true;
  const aliases = NEWS_TYPE_ALIASES[normalizedFilter];
  return aliases ? aliases.includes(normalizedType) : false;
}
