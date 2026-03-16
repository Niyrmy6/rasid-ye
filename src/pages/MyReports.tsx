import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('الكل');

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
    if (s === 'verified' || s === 'completed') return { bg: 'bg-green-100', text: 'text-green-700', label: 'تم التحقق' };
    if (s === 'under review' || s === 'under_review' || s === 'in_progress') return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'قيد المراجعة' };
    if (s === 'rejected' || s === 'cancelled') return { bg: 'bg-red-100', text: 'text-red-700', label: 'مرفوض' };
    return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'مستلم' }; // For received / new
  };

  const getArabicDiseaseName = (engName: string | undefined) => {
    const diseaseMap: Record<string, string> = {
      'measles': 'حصبة',
      'polio': 'شلل أطفال',
      'cholera': 'كوليرا',
      'diphtheria': 'دفتيريا',
      'pertussis': 'سعال ديكي',
      'hemorrhagic fevers': 'حمى نزفية'
    };
    return diseaseMap[engName?.toLowerCase() || ''] || engName || 'اشتباه حالة';
  };

  const filteredReports = reports.filter(report => {
    const latestStatusRaw = report.report_history?.[0]?.report_status || 'received';
    const statusLabel = getStatusColor(latestStatusRaw).label;
    const matchesSearch = report.tracking_number?.includes(searchQuery) || getArabicDiseaseName(report.disease?.disease_name).includes(searchQuery);
    const matchesStatus = statusFilter === 'الكل' || statusLabel === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-background-light text-text-main antialiased selection:bg-primary selection:text-white h-screen flex flex-col overflow-hidden">
      <header className="sticky top-0 z-40 bg-background-light/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm border-b border-gray-100 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#eefcfc] rounded-xl flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">shield</span>
          </div>
          <span className="text-xl font-bold text-text-main">راصد</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-text-main">بلاغاتي</h1>
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-text-main">arrow_back</span>
          </button>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto pb-32 max-w-md mx-auto w-full">
        <div className="px-4 py-4 sticky top-0 bg-background-light z-30">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input 
              className="block w-full pr-10 pl-10 py-2.5 bg-white border-none ring-1 ring-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary shadow-sm text-text-main placeholder-gray-400 transition-shadow" 
              placeholder="البحث في البلاغات أو تصفية الحالة..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center text-gray-400 hover:text-primary"
              >
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </button>
            </div>
            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg ring-1 ring-black/5 overflow-hidden z-40">
                <div className="p-1">
                  <button onClick={() => { setStatusFilter('الكل'); setIsFilterOpen(false); }} className="w-full text-right px-3 py-2 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2">
                    الكل
                  </button>
                  <button onClick={() => { setStatusFilter('تم التحقق'); setIsFilterOpen(false); }} className="w-full text-right px-3 py-2 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    تم التحقق
                  </button>
                  <button onClick={() => { setStatusFilter('قيد المراجعة'); setIsFilterOpen(false); }} className="w-full text-right px-3 py-2 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    قيد المراجعة
                  </button>
                  <button onClick={() => { setStatusFilter('مستلم'); setIsFilterOpen(false); }} className="w-full text-right px-3 py-2 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    مستلم
                  </button>
                  <button onClick={() => { setStatusFilter('مرفوض'); setIsFilterOpen(false); }} className="w-full text-right px-3 py-2 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    مرفوض
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
              <p className="text-gray-500 font-medium">لا توجد بلاغات لعرضها</p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const latestStatusRaw = report.report_history?.[0]?.report_status || 'received';
              const status = getStatusColor(latestStatusRaw);
              const reportDate = new Date(report.report_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              
              return (
                <div key={report.report_id} className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-gray-100 transition-transform active:scale-[0.99] cursor-pointer" onClick={() => navigate(`/report-details/${report.report_id}`)}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-base text-gray-900 font-almarai">اشتباه {getArabicDiseaseName(report.disease?.disease_name)}</h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-end mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="material-symbols-outlined text-[16px] ml-1.5">calendar_today</span>
                        <span dir="ltr">{reportDate}</span>
                      </div>
                      <div className="text-xs text-gray-400 font-mono tracking-wider text-right pr-6">
                        #{report.tracking_number}
                      </div>
                    </div>
                    
                    <button className="text-[#56BCA4] text-xs font-bold flex items-center gap-1 hover:text-primary-dark">
                      <span className="material-symbols-outlined text-[16px] rotate-0">chevron_left</span>
                      التفاصيل
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
            className="bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-2xl shadow-lg shadow-primary/30 flex items-center gap-2 transition-all active:scale-95 font-almarai font-bold text-sm"
          >
            <span className="material-symbols-outlined text-[22px]">add_circle</span>
            تقديم بلاغ جديد
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
