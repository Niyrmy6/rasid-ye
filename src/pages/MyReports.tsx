import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';

type Report = {
  report_id: number;
  tracking_number: string;
  report_date: string;
  disease: { disease_name: string } | null;
  report_history: { report_status: string, created_at: string }[];
};

export default function MyReports() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      
      const user = JSON.parse(userStr);
      if (!user.user_id) return;

      const { data, error } = await supabase
        .from('report')
        .select(`
          report_id,
          tracking_number,
          report_date,
          disease:disease_id(disease_name),
          report_history(report_status, created_at)
        `)
        .eq('user_id', user.user_id)
        .order('report_date', { ascending: false });

      if (error) throw error;
      
      // Sort history to get the latest status
      const formattedReports = data?.map((rep: any) => ({
        ...rep,
        report_history: rep.report_history?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || []
      })) || [];

      setReports(formattedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'verified' || s === 'completed') return { bg: 'bg-green-100', text: 'text-green-700', label: t('Verified'), key: 'verified' };
    if (s === 'under review' || s === 'under_review' || s === 'in_progress') return { bg: 'bg-orange-100', text: 'text-orange-700', label: t('Under Review'), key: 'under_review' };
    if (s === 'rejected' || s === 'cancelled') return { bg: 'bg-red-100', text: 'text-red-700', label: t('Rejected'), key: 'rejected' };
    return { bg: 'bg-blue-100', text: 'text-blue-700', label: t('Received'), key: 'received' }; // For received / new
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

  const filteredReports = reports.filter(report => {
    const latestStatusRaw = report.report_history?.[0]?.report_status || 'received';
    const statusObj = getStatusColor(latestStatusRaw);
    const matchesSearch = report.tracking_number?.includes(searchQuery) || getLocalizedDiseaseName(report.disease?.disease_name).includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || statusObj.key === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-background-light text-text-main antialiased selection:bg-primary selection:text-white h-screen flex flex-col overflow-hidden">
      <header className="sticky top-0 z-40 bg-background-light/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm border-b border-gray-100 max-w-md mx-auto w-full">
        <div className={`flex items-center gap-2 ${i18n.language === 'ar' ? '' : 'order-1 flex-row'}`}>
          <div className="w-10 h-10 bg-[#eefcfc] rounded-xl flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">shield</span>
          </div>
          <span className="text-xl font-bold text-text-main">{t('Rasid')}</span>
        </div>
        <div className={`flex items-center gap-3 ${i18n.language === 'ar' ? '' : 'order-2 flex-row-reverse'}`}>
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <span className={`material-symbols-outlined text-text-main ${i18n.language === 'ar' ? '' : 'rotate-180'}`}>arrow_forward</span>
          </button>
          <h1 className="text-lg font-bold text-text-main">{t('My Reports')}</h1>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto pb-32 max-w-md mx-auto w-full">
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
                  <button onClick={() => { setStatusFilter('verified'); setIsFilterOpen(false); }} className={`w-full ${i18n.language === 'ar' ? 'text-right' : 'text-left'} px-3 py-2 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {t('Verified')}
                  </button>
                  <button onClick={() => { setStatusFilter('under_review'); setIsFilterOpen(false); }} className={`w-full ${i18n.language === 'ar' ? 'text-right' : 'text-left'} px-3 py-2 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    {t('Under Review')}
                  </button>
                  <button onClick={() => { setStatusFilter('received'); setIsFilterOpen(false); }} className={`w-full ${i18n.language === 'ar' ? 'text-right' : 'text-left'} px-3 py-2 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {t('Received')}
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
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <span className="material-symbols-outlined text-[32px]">folder_open</span>
              </div>
              <p className="text-gray-500 font-medium">{t('No reports to display')}</p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const latestStatusRaw = report.report_history?.[0]?.report_status || 'received';
              const status = getStatusColor(latestStatusRaw);
              const reportDate = new Date(report.report_date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              
              return (
                <div key={report.report_id} className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-gray-100 transition-transform active:scale-[0.99] cursor-pointer" onClick={() => navigate(`/report-details/${report.report_id}`)}>
                  <div className={`flex justify-between items-start mb-2 ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                    <h3 className={`font-bold text-base text-gray-900 font-almarai ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {t('Suspected')} {getLocalizedDiseaseName(report.disease?.disease_name)}
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

      <BottomNav />
    </div>
  );
}
