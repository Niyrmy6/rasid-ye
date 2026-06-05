import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageShell, { MAIN_CLASS } from '../components/PageShell';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { fetchUserReports } from '../lib/queries';
import { formatAppDate } from '../lib/localeUtils';
import { getReportStatusBadge, getLocalizedDiseaseName } from '../lib/reportUtils';
import { getStoredUser } from '../lib/session';
import type { ReportListItem } from '../types/models';

export default function MyReports() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const user = getStoredUser();
      if (!user?.user_id) return;

      const { data, error: supaError } = await fetchUserReports(user.user_id);

      if (supaError) {
        handleError(supaError, { context: 'Fetch My Reports' });
        return;
      }

      setReports(data ?? []);
    } catch (err) {
      handleError(err, { context: 'Fetch My Reports Catch' });
    } finally {
      setLoading(false);
    }
  };

  const localizedDisease = (name: string | undefined, arName: string | null | undefined) =>
    getLocalizedDiseaseName(name, arName, i18n.language, t('Undetermined Case'));

  const filteredReports = reports.filter(report => {
    // fetchUserReports sorts history desc — index 0 is the current status for filtering
    const latestStatusRaw = report.report_history?.[0]?.report_status || 'received';
    const statusObj = getReportStatusBadge(latestStatusRaw, t);
    const matchesSearch =
      report.tracking_number?.includes(searchQuery) ||
      localizedDisease(report.disease?.disease_name, report.disease?.ar_name).includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || statusObj.key === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageShell withBottomNav>
      <PageHeader title={t('My Reports')} showBack />
      
      <main className={MAIN_CLASS}>
        <div className="px-4 py-4 sticky top-0 bg-background-light z-30">
          <div className="relative">
            <div className={`absolute inset-y-0 ${i18n.language === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-gray-400`}>
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input 
              className={`block w-full py-2.5 bg-white border-none ring-1 ring-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary shadow-sm text-text-main placeholder-gray-400 transition-shadow ${i18n.language === 'ar' ? 'pr-10 pl-10 text-right' : 'pl-10 pr-10 text-left'}`}
              placeholder={t('Search reports or filter status...')} 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
            />
            <div className={`absolute inset-y-0 ${i18n.language === 'ar' ? 'left-0 pl-2' : 'right-0 pr-2'} flex items-center`}>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center text-gray-400 hover:text-primary"
              >
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </button>
            </div>
            {isFilterOpen && (
              <div className={`absolute top-full ${i18n.language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-48 bg-white rounded-xl shadow-lg ring-1 ring-black/5 overflow-hidden z-40`}>
                <div className="p-1">
                  <button onClick={() => { setStatusFilter('all'); setIsFilterOpen(false); }} className={`w-full ${i18n.language === 'ar' ? 'text-right' : 'text-left'} px-3 py-2 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                    {t('All')}
                  </button>
                  <button onClick={() => { setStatusFilter('under_review'); setIsFilterOpen(false); }} className={`w-full ${i18n.language === 'ar' ? 'text-right' : 'text-left'} px-3 py-2 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    {t('Under Review')}
                  </button>
                  <button onClick={() => { setStatusFilter('received'); setIsFilterOpen(false); }} className={`w-full ${i18n.language === 'ar' ? 'text-right' : 'text-left'} px-3 py-2 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {t('Received')}
                  </button>
                  <button onClick={() => { setStatusFilter('verified'); setIsFilterOpen(false); }} className={`w-full ${i18n.language === 'ar' ? 'text-right' : 'text-left'} px-3 py-2 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {t('Report Completed')}
                  </button>
                  <button onClick={() => { setStatusFilter('rejected'); setIsFilterOpen(false); }} className={`w-full ${i18n.language === 'ar' ? 'text-right' : 'text-left'} px-3 py-2 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    {t('Rejected')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 space-y-4">
          {loading ? (
            <LoadingSpinner />
          ) : filteredReports.length === 0 ? (
            <EmptyState icon="folder_open" message={t('No reports to display')} variant="card" />
          ) : (
            filteredReports.map((report) => {
              const latestStatusRaw = report.report_history?.[0]?.report_status || 'received';
              const status = getReportStatusBadge(latestStatusRaw, t);
              const reportDate = formatAppDate(report.report_date, i18n.language, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              
              return (
                <div key={report.report_id} className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-gray-100 transition-transform active:scale-[0.99] cursor-pointer" onClick={() => navigate(`/report-details/${report.report_id}`)}>
                  <div className={`flex justify-between items-start mb-2 ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                    <h3 className={`font-bold text-base text-gray-900 font-almarai ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {report.disease?.disease_name && report.disease?.disease_name !== 'unknown'
                        ? `${t('Suspected')} ${localizedDisease(report.disease?.disease_name, report.disease?.ar_name)}`
                        : localizedDisease(report.disease?.disease_name, report.disease?.ar_name)}
                    </h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>
                  
                  <div className={`flex justify-between items-end mt-4 ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                    <div className="space-y-2">
                      <div className={`flex items-center text-xs text-gray-500 ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                        <span className={`material-symbols-outlined text-[16px] ${i18n.language === 'ar' ? 'ml-1.5' : 'mr-1.5'}`}>calendar_today</span>
                        <span dir="ltr">{reportDate}</span>
                      </div>
                      <div className={`text-xs text-gray-400 font-mono tracking-wider ${i18n.language === 'ar' ? 'text-right pr-6' : 'text-left pl-6'}`}>
                        #{report.tracking_number}
                      </div>
                    </div>
                    
                    <button className={`text-[#56BCA4] text-xs font-bold flex items-center gap-1 hover:text-primary-dark ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                      <span className={`material-symbols-outlined text-[16px] ${i18n.language === 'ar' ? '' : 'rotate-180'}`}>chevron_left</span>
                      {t('Details')}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <div className="fixed bottom-20 left-0 right-0 z-40 max-w-md mx-auto px-4 pointer-events-none">
        <div className="flex justify-end w-full pointer-events-auto">
          <button 
            onClick={() => navigate('/new-report')}
            className={`bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-2xl shadow-lg shadow-primary/30 flex items-center gap-2 transition-all active:scale-95 font-almarai font-bold text-sm ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}
          >
            <span className="material-symbols-outlined text-[22px]">add_circle</span>
            {t('Submit New Report')}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
