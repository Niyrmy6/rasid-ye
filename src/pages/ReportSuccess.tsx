import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageShell, { MAIN_CLASS } from '../components/PageShell';
import PageHeader from '../components/PageHeader';
import { fetchLatestUserReport, fetchTrackingNumber } from '../lib/queries';
import { useEffect, useState } from 'react';
import { getStoredUser } from '../lib/session';

export default function ReportSuccess() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const reportId = location.state?.reportId;
  const [trackingNumber, setTrackingNumber] = useState<string>('');

  useEffect(() => {
    const loadTracking = async () => {
      // Deep link may omit state — fall back to latest report for this user
      let id = reportId;
      if (!id) {
        const user = getStoredUser();
        if (user) {
          try {
            const { data } = await fetchLatestUserReport(user.user_id);
            if (data?.tracking_number) setTrackingNumber(data.tracking_number);
          } catch {
            // ignore — tracking number stays empty
          }
        }
      } else {
        try {
          const { data } = await fetchTrackingNumber(id);
          if (data?.tracking_number) setTrackingNumber(data.tracking_number);
        } catch {
          // ignore
        }
      }
    };
    loadTracking();
  }, [reportId]);

  const handleTrackReport = async () => {
    let id = reportId;
    if (!id) {
      // Same fallback as display — open details or list if id still unknown
      const user = getStoredUser();
      if (user) {
        try {
          const { data } = await fetchLatestUserReport(user.user_id);
          if (data) id = data.report_id;
        } catch {
          // fall through to /my-reports
        }
      }
    }
    if (id) {
      navigate(`/report-details/${id}`);
    } else {
      navigate('/my-reports');
    }
  };

  return (
    <PageShell withBottomNav>
      <PageHeader title={t('Submission Success')} />

      <main className={`${MAIN_CLASS} flex flex-col items-center justify-center text-center p-6`}>
        <div className="w-full max-w-sm mx-auto flex flex-col items-center space-y-6">
          <div className="relative w-64 h-64 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 bg-green-50 rounded-full scale-110 animate-pulse opacity-50"></div>
            <div className="bg-[#e0f5f0] rounded-full w-48 h-48 flex items-center justify-center shadow-sm relative z-10">
              <span className="material-symbols-outlined text-primary filled" style={{ fontSize: '70px' }}>check_circle</span>
              <div className="absolute -top-4 -right-4 text-yellow-400 transform rotate-12">
                <span className="material-symbols-outlined text-4xl filled">celebration</span>
              </div>
              <div className="absolute -bottom-2 -left-4 text-blue-300 transform -rotate-12">
                <span className="material-symbols-outlined text-3xl filled">star</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold font-almarai text-gray-900">{t('Report submitted successfully!')}</h2>
            <p className="text-gray-500 leading-relaxed max-w-xs mx-auto text-base">
              {t('Thank you for contributing to protecting your community. Your report has been received and is now under review. You can track the report status from My Reports section.')}
            </p>
          </div>

          <div className="bg-white w-full rounded-2xl p-4 border border-dashed border-gray-300 shadow-sm flex flex-col items-center justify-center gap-1 mt-4">
            <span className="text-xs text-text-muted font-bold tracking-wide uppercase">{t('Reference Number')}</span>
            <span className="text-3xl font-bold text-primary font-almarai tracking-wider">
              {trackingNumber ? `#${trackingNumber}` : '...'}
            </span>
          </div>

          <div className="w-full space-y-3 pt-6">
            <button 
              onClick={handleTrackReport}
              className="w-full bg-primary hover:bg-primary-dark text-white p-4 rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-almarai font-bold text-lg"
            >
              <span>{t('Track Report Status')}</span>
            </button>
            <button 
              onClick={() => navigate('/news')}
              className="w-full bg-transparent border-2 border-primary text-primary hover:bg-green-50 p-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-almarai font-bold text-lg"
            >
              <span>{t('Back to Home')}</span>
            </button>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
