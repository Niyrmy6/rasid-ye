import type { TFunction } from 'i18next';
import { pickLocalizedName } from './localization';

export type ReportStatusKey = 'verified' | 'under_review' | 'rejected' | 'received';

/**
 * Maps heterogeneous DB/status strings onto a small UI vocabulary.
 * Backend history rows may use `completed`, `under_review`, `in_progress`, etc.
 */
export function normalizeReportStatus(status: string): ReportStatusKey {
  const s = status?.toLowerCase() || '';
  if (s === 'verified' || s === 'completed' || s === 'resolved') return 'verified';
  if (s === 'under review' || s === 'under_review' || s === 'pending' || s === 'in_progress') {
    return 'under_review';
  }
  if (s === 'rejected' || s === 'cancelled' || s === 'failed') return 'rejected';
  return 'received';
}

/**
 * @param undeterminedLabel - i18n fallback when disease is missing or `unknown`
 */
export function getLocalizedDiseaseName(
  engName: string | undefined,
  arName: string | null | undefined,
  language: string,
  undeterminedLabel: string,
): string {
  if (!engName || engName === 'unknown') return undeterminedLabel;
  return pickLocalizedName(engName, arName, language);
}

/** Compact badge styles for report list cards */
export function getReportStatusBadge(status: string, t: TFunction) {
  const key = normalizeReportStatus(status);
  const styles = {
    verified: { bg: 'bg-green-100', text: 'text-green-700', label: t('Report Completed'), key: 'verified' as const },
    under_review: { bg: 'bg-orange-100', text: 'text-orange-700', label: t('Under Review'), key: 'under_review' as const },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', label: t('Rejected'), key: 'rejected' as const },
    received: { bg: 'bg-blue-100', text: 'text-blue-700', label: t('Received'), key: 'received' as const },
  };
  return styles[key];
}

/** Richer status theme for report details (banner, timeline, icons) */
export function getReportStatusDetail(status: string, t: TFunction) {
  const key = normalizeReportStatus(status);
  const styles = {
    verified: {
      bg: 'bg-green-100', text: 'text-green-700', label: t('Completed'), icon: 'check_circle',
      color: 'bg-green-500', bannerBg: 'bg-green-50', bannerBorder: 'border-green-200',
      iconText: 'text-green-600', timelineLine: 'bg-green-300', key: 'verified' as const,
    },
    under_review: {
      bg: 'bg-orange-100', text: 'text-orange-700', label: t('Under Review'), icon: 'pending_actions',
      color: 'bg-orange-500', bannerBg: 'bg-orange-50', bannerBorder: 'border-orange-200',
      iconText: 'text-orange-600', timelineLine: 'bg-orange-300', key: 'under_review' as const,
    },
    rejected: {
      bg: 'bg-red-100', text: 'text-red-700', label: t('Rejected'), icon: 'cancel',
      color: 'bg-red-500', bannerBg: 'bg-red-50', bannerBorder: 'border-red-200',
      iconText: 'text-red-600', timelineLine: 'bg-red-300', key: 'rejected' as const,
    },
    received: {
      bg: 'bg-blue-100', text: 'text-blue-700', label: t('Received'), icon: 'inbox',
      color: 'bg-blue-500', bannerBg: 'bg-blue-50', bannerBorder: 'border-blue-200',
      iconText: 'text-blue-600', timelineLine: 'bg-blue-300', key: 'received' as const,
    },
  };
  return styles[key];
}

export function getStatusIconInfo(status?: string) {
  const key = normalizeReportStatus(status || '');
  const icons = {
    verified: { bg: 'bg-green-100', text: 'text-green-600', icon: 'check_circle' },
    under_review: { bg: 'bg-orange-100', text: 'text-orange-600', icon: 'sync_alt' },
    rejected: { bg: 'bg-red-100', text: 'text-red-600', icon: 'cancel' },
    received: { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'info' },
  };
  return icons[key];
}

/**
 * Builds in-app notification copy from raw history status + tracking number.
 * Uses separate string matching from `normalizeReportStatus` to preserve granular messages.
 */
export function getNotificationContent(
  status: string | undefined,
  trackingNumber: string,
  t: TFunction,
): { title: string; message: string } {
  const s = status?.toLowerCase() ?? '';
  if (s === 'received' || s === 'new') {
    return {
      title: `${t('Update on your report status #')}${trackingNumber}`,
      message: t('Report received successfully in the system.'),
    };
  }
  if (s === 'under review' || s === 'under_review' || s === 'in_progress') {
    return {
      title: `${t('Update on your report status #')}${trackingNumber}`,
      message: t('Attached data is being reviewed by specialists.'),
    };
  }
  if (s === 'verified' || s === 'completed') {
    return {
      title: `${t('Report closed #')}${trackingNumber}`,
      message: t('Report has been verified and necessary action taken.'),
    };
  }
  if (s === 'rejected' || s === 'cancelled') {
    return {
      title: `${t('Report rejected #')}${trackingNumber}`,
      message: t('Report rejected due to unmet conditions.'),
    };
  }
  return {
    title: `${t('Update on report #')}${trackingNumber}`,
    message: t('Report status has changed.'),
  };
}

/** Timeline step labels keyed off raw status strings from `report_history` */
export function getStatusStepInfo(status: string, t: TFunction) {
  const s = status?.toLowerCase() || '';
  if (s === 'new' || s === 'received') {
    return { title: t('Received'), desc: t('Your report has been successfully received') };
  }
  if (s === 'pending' || s === 'under review' || s === 'under_review' || s === 'in_progress') {
    return { title: t('Under Review'), desc: t('Attached data is being reviewed by specialists') };
  }
  if (s === 'resolved' || s === 'completed') {
    return { title: t('Completed'), desc: t('The report has been resolved and necessary action was taken') };
  }
  if (s === 'rejected' || s === 'cancelled') {
    return { title: t('Rejected'), desc: t('The report was rejected, please review the notes') };
  }
  return { title: status, desc: '' };
}
