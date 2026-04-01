import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

type ReportDetailsType = {
  report_id: number;
  tracking_number: string;
  report_date: string;
  location: string;
  disease: { disease_name: string } | null;
  report_history: { report_status: string, created_at: string }[];
};

export default function ReportDetails() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [report, setReport] = useState<ReportDetailsType | null>(null);
  const [addressName, setAddressName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('report')
        .select(`
          report_id,
          tracking_number,
          report_date,
          location,
          disease:disease_id(disease_name),
          report_history(report_status, created_at)
        `)
        .eq('report_id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        data.report_history = data.report_history?.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) || [];
        setReport(data);

        // Try to reverse geocode the location
        if (data.location && typeof data.location !== 'string' && (data.location as any).coordinates) {
          try {
            const lng = (data.location as any).coordinates[0];
            const lat = (data.location as any).coordinates[1];
            // the openstreetmap reverse geocode uses accept-language based on i18n
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1&accept-language=${i18n.language}`);
            const locData = await res.json();
            if (locData && locData.address) {
              const placeNames = [locData.address.neighbourhood, locData.address.suburb, locData.address.city, locData.address.state]
                .filter(Boolean);
              if (placeNames.length > 0) {
                setAddressName(placeNames.join('، '));
              } else if (locData.display_name) {
                setAddressName(locData.display_name.split(',').slice(0, 3).join('، '));
              }
            }
          } catch (e) {
            console.error('Failed to reverse geocode:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching report details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'verified' || s === 'completed') {
      return { bg: 'bg-green-100', text: 'text-green-700', label: t('Verified'), icon: 'check_circle', color: 'bg-green-500', bannerBg: 'bg-green-50', bannerBorder: 'border-green-200', iconText: 'text-green-600', timelineLine: 'bg-green-300' };
    }
    if (s === 'under review' || s === 'under_review' || s === 'in_progress') {
      return { bg: 'bg-orange-100', text: 'text-orange-700', label: t('Under Review'), icon: 'pending_actions', color: 'bg-orange-500', bannerBg: 'bg-orange-50', bannerBorder: 'border-orange-200', iconText: 'text-orange-600', timelineLine: 'bg-orange-300' };
    }
    if (s === 'rejected' || s === 'cancelled') {
      return { bg: 'bg-red-100', text: 'text-red-700', label: t('Rejected'), icon: 'cancel', color: 'bg-red-500', bannerBg: 'bg-red-50', bannerBorder: 'border-red-200', iconText: 'text-red-600', timelineLine: 'bg-red-300' };
    }
    // Default / new / received
    return { bg: 'bg-blue-100', text: 'text-blue-700', label: t('Received'), icon: 'inbox', color: 'bg-blue-500', bannerBg: 'bg-blue-50', bannerBorder: 'border-blue-200', iconText: 'text-blue-600', timelineLine: 'bg-blue-300' };
  };

  const getStatusStepInfo = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'new' || s === 'received') return { title: t('Received'), desc: t('Your report has been successfully received') };
    if (s === 'under review' || s === 'under_review' || s === 'in_progress') return { title: t('Under Review'), desc: t('Attached data is being reviewed by specialists') };
    if (s === 'verified' || s === 'completed') return { title: t('Verified'), desc: t('The report has been verified and necessary action will be taken') };
    if (s === 'rejected' || s === 'cancelled') return { title: t('Rejected'), desc: t('The report was rejected, please review the notes') };
    return { title: status, desc: '' };
  };

  const getLocalizedDiseaseName = (engName: string | undefined) => {
    const diseaseMap: Record<string, string> = {
      'measles': 'حصبة',
      'polio': 'شلل أطفال',
      'cholera': 'كوليرا',
      'diphtheria': 'دفتيريا',
      'pertussis': 'سعال ديكي',
      'hemorrhagic fevers': 'حمى نزفية'
    };
    if (!engName) return t('Suspected Case');
    return i18n.language === 'ar' ? (diseaseMap[engName.toLowerCase()] || engName) : engName;
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-light">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

  const latestStatus = report.report_history?.[report.report_history.length - 1]?.report_status || 'received';
  const statusInfo = getStatusColor(latestStatus);
  const reportDateFormatted = new Date(report.report_date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-background-light text-text-main antialiased selection:bg-primary selection:text-white h-screen flex flex-col overflow-hidden">
      <header className="sticky top-0 z-40 bg-background-light/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm max-w-md mx-auto w-full">
        <div className={`flex items-center gap-3 ${i18n.language === 'ar' ? '' : 'order-1 flex-row'}`}>
          <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center text-primary border border-primary/20">
            <span className="material-symbols-outlined text-[24px]">shield</span>
          </div>
          <span className="text-xl font-extrabold text-black tracking-wide">{t('Rasid')}</span>
        </div>
        <div className={`flex items-center gap-3 ${i18n.language === 'ar' ? '' : 'order-2 flex-row-reverse'}`}>
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <span className={`material-symbols-outlined text-text-main ${i18n.language === 'ar' ? '' : 'rotate-180'}`}>arrow_forward</span>
          </button>
          <h1 className="text-lg font-bold text-text-main">{t('Report Details')}</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-6 max-w-md mx-auto w-full">
        <div className={`${statusInfo.bannerBg} border ${statusInfo.bannerBorder} rounded-2xl p-4 flex items-center gap-4 ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse text-right'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
          <div className={`w-10 h-10 bg-white rounded-full flex items-center justify-center ${statusInfo.iconText} shadow-sm shrink-0`}>
            <span className="material-symbols-outlined text-[24px]">{statusInfo.icon}</span>
          </div>
          <div className={`${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
            <h2 className="text-sm font-medium text-gray-500 mb-1">{t('Report Status')}</h2>
            <p className="text-lg font-bold text-gray-900">{statusInfo.label}</p>
          </div>
        </div>

        <div className="bg-surface-light rounded-2xl p-5 shadow-sm space-y-4" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
          <div className={`flex justify-between items-start ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className={`${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
              <h3 className="text-xl font-bold text-text-main mb-1">{t('Suspected')} {getLocalizedDiseaseName(report.disease?.disease_name)}</h3>
              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-medium">#{report.tracking_number}</span>
            </div>
          </div>
          <div className="h-px bg-gray-100"></div>
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
                  {addressName ? addressName : (typeof report.location === 'string' ? report.location : (report.location as any).coordinates ? `${(report.location as any).coordinates[1].toFixed(4)}, ${(report.location as any).coordinates[0].toFixed(4)}` : t('Specific Geographic Location'))}
                </p>
              </div>
            </div>
            )}
          </div>
        </div>

        <div className="bg-surface-light rounded-2xl p-5 shadow-sm" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
          <h3 className={`font-bold text-text-main mb-6 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{t('Processing Path')}</h3>
          <div className={`relative ${i18n.language === 'ar' ? 'pr-2' : 'pl-2'}`}>
            {[
              { id: 'received', title: t('Received'), activeTitle: t('Received'), desc: t('Your report has been received successfully') },
              { id: 'under_review', title: t('Under Review'), activeTitle: t('Under Review'), desc: t('Attached data is being reviewed') },
              { id: 'verified', title: t('Field Verification'), activeTitle: t('Verified'), desc: t('The report has been verified and necessary action will be taken') },
              { id: 'completed', title: t('Report Completed'), activeTitle: t('Completed'), desc: t('The report has been closed and necessary action taken') }
            ].map((stepDef, index, arr) => {
              const isLastElement = index === arr.length - 1;
              let isPast = false;
              let isCurrent = false;
              let isRejected = false;
              let historyDateStr = '';

              const statusesInHistory = report.report_history.map(h => h.report_status?.toLowerCase());
              const currentStatus = statusesInHistory[statusesInHistory.length - 1] || 'new';

              // Flatten equivalents
              const normalizedCurrent = currentStatus.replace('new', 'received').replace('in_progress', 'under_review').replace('under review', 'under_review');
              
              if (normalizedCurrent === 'rejected' || normalizedCurrent === 'cancelled') {
                isRejected = true;
                if (index === 0) {
                  isPast = true;
                } else if (index === 1) {
                  isCurrent = true;
                  stepDef.title = t('Rejected');
                  stepDef.activeTitle = t('Rejected');
                  stepDef.desc = t('The report was closed due to unmet conditions');
                }
              } else {
                const stepIndex = arr.findIndex(s => s.id === normalizedCurrent);
                if (index < stepIndex) isPast = true;
                if (index === stepIndex) isCurrent = true;
                if (normalizedCurrent === 'received' && index === 0) isCurrent = true;
              }

              // Extract date if available for this step
              // Basic matching for demo purposes
              let matchedHistory = report.report_history.find(h => {
                const s = h.report_status?.toLowerCase().replace('new', 'received').replace('under review', 'under_review');
                return s === stepDef.id;
              });
              if (isRejected && index === 1) {
                matchedHistory = report.report_history[report.report_history.length - 1];
              }

              if (matchedHistory) {
                historyDateStr = new Date(matchedHistory.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              }

              let circleContent;
              let lineClass = 'bg-gray-200';
              
              if (isPast) {
                circleContent = (
                  <div className="relative z-10 w-6 h-6 rounded-full bg-[#56BCA4] flex items-center justify-center text-white ring-4 ring-white">
                    <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                  </div>
                );
                lineClass = 'bg-[#56BCA4]/30';
              } else if (isCurrent) {
                if (isRejected) {
                  circleContent = (
                    <div className="relative z-10 w-6 h-6 rounded-full bg-red-100 border border-red-200 flex items-center justify-center ring-4 ring-white">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                    </div>
                  );
                } else {
                  circleContent = (
                    <div className="relative z-10 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center ring-4 ring-white">
                      <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse"></div>
                    </div>
                  );
                }
                lineClass = 'bg-gray-200';
              } else {
                circleContent = (
                  <div className="relative z-10 w-6 h-6 rounded-full bg-gray-50 border-2 border-gray-200 ring-4 ring-white"></div>
                );
              }

              return (
                <div key={index} className={`relative flex items-start gap-4 ${isLastElement ? '' : 'pb-8'} group`}>
                  {!isLastElement && (
                    <div className={`absolute top-8 ${i18n.language === 'ar' ? 'right-[11px]' : 'left-[11px]'} h-[calc(100%-8px)] w-0.5 ${lineClass}`}></div>
                  )}
                  {circleContent}
                  <div className={`flex-1 mt-0.5 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                    <h4 className={`font-bold text-sm ${isPast || isCurrent ? (isRejected && isCurrent ? 'text-red-600' : 'text-text-main') : 'text-gray-400'}`}>
                      {isPast || isCurrent ? stepDef.activeTitle : stepDef.title}
                    </h4>
                    {(isPast || isCurrent) && (
                      <p className="text-xs text-text-muted mt-1">{stepDef.desc}</p>
                    )}
                  </div>
                  {historyDateStr && (
                    <div className="text-[10px] text-gray-400 mt-1" dir="ltr">{historyDateStr}</div>
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
    </div>
  );
}
