import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageShell, { MAIN_CLASS } from '../components/PageShell';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  getReportStatusDetail,
  getLocalizedDiseaseName,
} from '../lib/reportUtils';
import { fetchReportDetails as loadReportDetails } from '../lib/queries';
import { formatAppDate } from '../lib/localeUtils';
import { parseGeoPoint, formatGeoPointLabel, reverseGeocodeLabel } from '../lib/geoUtils';
import { getStoredUser } from '../lib/session';
import type { ReportDetailsItem } from '../types/models';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { logger } from '../lib/logger';

export default function ReportDetails() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const { id } = useParams();
  const [report, setReport] = useState<ReportDetailsItem | null>(null);
  const [addressName, setAddressName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    if (!id) return;
    try {
      setLoading(true);
      
      const loggedUser = getStoredUser();
      if (!loggedUser) {
        navigate('/login');
        return;
      }

      const loggedUserId = loggedUser.user_id;
      const loggedUserRoleId = loggedUser.role_id;

      const { data, error } = await loadReportDetails(id);

      if (error) throw error;
      
      if (data) {
        // role_id 1/2 = staff roles allowed to view citizen reports with PII
        if (data.user_id !== loggedUserId && loggedUserRoleId !== 1 && loggedUserRoleId !== 2) {
          setUnauthorized(true);
          setLoading(false);
          return;
        }

        setReport(data);

        const geoPoint = parseGeoPoint(data.location);
        if (geoPoint) {
          try {
            const [lng, lat] = geoPoint.coordinates;
            const label = await reverseGeocodeLabel(lat, lng, i18n.language);
            if (label) setAddressName(label);
          } catch (e) {
            logger.error('Failed to reverse geocode', e);
          }
        }
      }
    } catch (error) {
      handleError(error, { context: 'Fetch report details', silent: true });
    } finally {
      setLoading(false);
    }
  };

  const localizedDisease = (name: string | undefined, arName: string | null | undefined) =>
    getLocalizedDiseaseName(name, arName, i18n.language, t('Undetermined Case'));

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (unauthorized) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background-light p-6 text-center" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <span className="material-symbols-outlined text-red-500 text-6xl mb-4">lock</span>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('Access Denied')}</h2>
        <p className="text-gray-600 mb-6 max-w-sm">
          {i18n.language === 'ar' 
            ? 'عذراً، هذا البلاغ يحتوي على معلومات شخصية ولا يسمح باستعراضه إلا لصاحب البلاغ الأصلي أو للموظفين المختصين.'
            : 'Sorry, this report contains personal information and can only be viewed by the creator or authorized staff.'}
        </p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-primary/20"
        >
          {i18n.language === 'ar' ? 'العودة للرئيسية' : 'Go to Home'}
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background-light">
        <span className="material-symbols-outlined text-gray-400 text-5xl mb-4">error</span>
        <p className="text-gray-500 mb-4 font-medium">{t('Sorry, report not found')}</p>
        <button onClick={() => navigate(-1)} className="text-primary font-bold">{t('Go Back')}</button>
      </div>
    );
  }

  // History is ascending from `fetchReportDetails` — last entry is the current status
  const latestStatus = report.report_history.length > 0 
    ? report.report_history[report.report_history.length - 1].report_status 
    : 'received';
    
  const statusInfo = getReportStatusDetail(latestStatus, t);
  const reportDateFormatted = formatAppDate(report.report_date, i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const geoPoint = parseGeoPoint(report.location);

  type TimelineState = 'new' | 'pending' | 'resolved' | 'rejected' | 'cancelled';

  /**
   * Collapses many DB status strings onto three happy-path steps (new → pending → resolved)
   * so the visual timeline stays stable regardless of backend wording.
   */
  const normalizeTimelineState = (rawStatus?: string): TimelineState => {
    const s = rawStatus?.toLowerCase() ?? '';
    if (s === 'rejected' || s === 'cancelled') return s;

    const mapped = s
      .replace('received', 'new')
      .replace('in_progress', 'pending')
      .replace('under review', 'pending')
      .replace('under_review', 'pending')
      .replace('completed', 'resolved')
      .replace('verified', 'resolved');

    if (!['new', 'pending', 'resolved', 'rejected', 'cancelled'].includes(mapped)) return 'new';
    return mapped as TimelineState;
  };

  const normalizedHistory = report.report_history.map((h) => normalizeTimelineState(h.report_status));
  const normalizedCurrent = normalizedHistory.at(-1) ?? 'new';
  const isRejectedCurrent = normalizedCurrent === 'rejected' || normalizedCurrent === 'cancelled';

  const timelineSteps = [
    {
      id: 'new',
      title: t('Received'),
      activeTitle: t('Received'),
      desc: t('Your report has been received successfully'),
    },
    {
      id: 'pending',
      title: t('Under Review'),
      activeTitle: t('Under Review'),
      desc: t('Attached data is being reviewed'),
    },
    {
      id: 'resolved',
      title: t('Report Completed'),
      activeTitle: t('Completed'),
      desc: t('The report has been closed and necessary action taken'),
    },
  ] as const;

  return (
    <PageShell>
      <PageHeader title={t('Report Details')} showBack />

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-6 max-w-md mx-auto w-full">
        <div className={`${statusInfo.bannerBg} border ${statusInfo.bannerBorder} rounded-2xl p-4 flex items-center gap-4 ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse text-right'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
          <div className={`w-10 h-10 bg-white rounded-full flex items-center justify-center ${statusInfo.iconText} shadow-sm shrink-0`}>
            <span className="material-symbols-outlined text-[24px]">{statusInfo.icon}</span>
          </div>
          <div className={`${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
            <h2 className="text-sm font-medium text-text-muted mb-1">{t('Report Status')}</h2>
            <p className="text-lg font-bold text-gray-900">{statusInfo.label}</p>
          </div>
        </div>

        <div className="bg-surface-light rounded-2xl p-5 shadow-sm space-y-4" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
          <div className={`flex justify-between items-start ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className={`${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
              <h3 className="text-xl font-bold text-text-main mb-1">
                {report.disease?.disease_name && report.disease?.disease_name !== 'unknown'
                  ? `${t('Suspected')} ${localizedDisease(report.disease?.disease_name, report.disease?.ar_name)}`
                  : localizedDisease(report.disease?.disease_name, report.disease?.ar_name)}
              </h3>
              <span className="inline-block bg-gray-100 dark:bg-gray-800/40 text-text-muted text-xs px-2 py-1 rounded-md font-medium">#{report.tracking_number}</span>
            </div>
          </div>
          <div className="h-px bg-gray-100 dark:bg-gray-800"></div>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-text-muted mt-0.5 text-[20px]">calendar_today</span>
              <div className={`${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                <p className="text-xs text-text-muted mb-0.5">{t('Report Date')}</p>
                <p className="text-sm font-medium text-text-main" dir="ltr">{reportDateFormatted}</p>
              </div>
            </div>
            {report.location && (
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-text-muted mt-0.5 text-[20px]">location_on</span>
              <div className={`${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                <p className="text-xs text-text-muted mb-0.5">{t('Location')}</p>
                <p className="text-sm font-medium text-text-main" dir="ltr" style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>
                  {addressName
                    ? addressName
                    : typeof report.location === 'string'
                      ? report.location
                      : geoPoint
                        ? formatGeoPointLabel(geoPoint)
                        : t('Specific Geographic Location')}
                </p>
              </div>
            </div>
            )}
          </div>
        </div>

        <div className="bg-surface-light rounded-2xl p-5 shadow-sm" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
          <h3 className={`font-bold text-text-main mb-6 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{t('Processing Path')}</h3>
          <div className={`relative ${i18n.language === 'ar' ? 'pr-2' : 'pl-2'}`}>
            {timelineSteps.map((stepDef, index) => {
              const isLastElement = index === timelineSteps.length - 1;

              let isPast = false;
              let isCurrent = false;

              if (isRejectedCurrent) {
                if (index === 0) isPast = true;
                if (index === 1) isCurrent = true;
              } else {
                const stepIndex = timelineSteps.findIndex((s) => s.id === normalizedCurrent);
                if (index < stepIndex) isPast = true;
                if (index === stepIndex) isCurrent = true;
                if (stepIndex === -1 && index === 0) isCurrent = true;
              }

              const isRejected = isRejectedCurrent;

              // Extract date if available for this step (keep existing formatting behavior)
              let historyDateStr = '';
              if (index === 0) {
                historyDateStr = new Date(report.report_date).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
              } else {
                let matchedHistory = report.report_history.find((h) => {
                  const hState = normalizeTimelineState(h.report_status);
                  return hState === stepDef.id;
                });

                if (isRejected && index === 1) {
                  matchedHistory = report.report_history[report.report_history.length - 1];
                }

                if (matchedHistory) {
                  historyDateStr = new Date(matchedHistory.created_at).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                }
              }

              let circleContent: ReactNode;
              let lineClass = 'bg-gray-200';

              if (isPast) {
                circleContent = (
                  <div className="relative z-10 w-6 h-6 rounded-full bg-[#56BCA4] flex items-center justify-center text-white ring-4 ring-card">
                    <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                  </div>
                );
                lineClass = 'bg-[#56BCA4]';
              } else if (isCurrent) {
                if (isRejected) {
                  circleContent = (
                    <div className="relative z-10 w-6 h-6 rounded-full bg-red-100 dark:bg-red-950/40 border border-red-200 dark:border-red-900/30 flex items-center justify-center ring-4 ring-card">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                    </div>
                  );
                } else {
                  circleContent = (
                    <div className="relative z-10 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center ring-4 ring-card">
                      <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse"></div>
                    </div>
                  );
                }
                lineClass = 'bg-gray-200 dark:bg-gray-800';
              } else {
                circleContent = (
                  <div className="relative z-10 w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 ring-4 ring-card"></div>
                );
              }

              const isRejectedActive = isRejected && isCurrent;
              const activeTitle = isRejectedActive ? t('Rejected') : stepDef.activeTitle;
              const activeDesc = isRejectedActive ? t('The report was closed due to unmet conditions') : stepDef.desc;

              return (
                <div key={index} className={`relative flex items-start gap-4 ${isLastElement ? '' : 'pb-8'} group`}>
                  {!isLastElement && (
                    <div
                      className={`absolute top-8 ${i18n.language === 'ar' ? 'right-[11px]' : 'left-[11px]'} h-[calc(100%-8px)] w-0.5 ${lineClass} transition-colors duration-300`}
                    ></div>
                  )}
                  {circleContent}
                  <div className={`flex-1 mt-0.5 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                    <h4
                      className={`font-bold text-sm ${
                        isPast || isCurrent ? (isRejectedActive ? 'text-red-600' : 'text-text-main') : 'text-gray-400'
                      }`}
                    >
                      {isPast || isCurrent ? activeTitle : stepDef.title}
                    </h4>
                    {(isPast || isCurrent) && <p className="text-xs text-text-muted mt-1">{activeDesc}</p>}
                  </div>
                  {historyDateStr && (
                    <div className="text-[10px] text-text-muted mt-1" dir="ltr">
                      {historyDateStr}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background-light/95 backdrop-blur-md p-4 border-t border-gray-200 max-w-md mx-auto">
        <button 
          onClick={() => navigate('/contact')}
          className={`w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold text-base transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}
        >
          <span className="material-symbols-outlined">support_agent</span>
          {t('Contact Support')}
        </button>
      </div>
    </PageShell>
  );
}
