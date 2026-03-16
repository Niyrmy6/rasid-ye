import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';

type NotificationItem = {
  id: string;
  type: 'report_update' | 'global';
  report_id?: number;
  tracking_number?: string;
  status?: string;
  title: string;
  message: string;
  date: Date;
  isToday: boolean;
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
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
          report_history(report_status, created_at)
        `)
        .eq('user_id', user.user_id);

      if (error) throw error;

      const notifs: NotificationItem[] = [];
      const now = new Date();

      if (data) {
        data.forEach((report: any) => {
          if (report.report_history) {
            report.report_history.forEach((history: any) => {
              const histDate = new Date(history.created_at);
              const isToday = histDate.getDate() === now.getDate() && histDate.getMonth() === now.getMonth() && histDate.getFullYear() === now.getFullYear();
              
              let title = '';
              let message = '';
              const status = history.report_status?.toLowerCase();

              if (status === 'received' || status === 'new') {
                title = `تم تحديث حالة بلاغك #${report.tracking_number}`;
                message = 'تم استلام البلاغ بنجاح في النظام.';
              } else if (status === 'under review' || status === 'under_review' || status === 'in_progress') {
                title = `تم تحديث حالة بلاغك #${report.tracking_number}`;
                message = 'جاري مراجعة البيانات المرفقة من قبل المختصين.';
              } else if (status === 'verified' || status === 'completed') {
                title = `تم إغلاق البلاغ #${report.tracking_number}`;
                message = 'تم التحقق من البلاغ واتخاذ الإجراء اللازم.';
              } else if (status === 'rejected' || status === 'cancelled') {
                title = `تم رفض البلاغ #${report.tracking_number}`;
                message = 'تم رفض البلاغ لعدم استيفاء الشروط.';
              } else {
                title = `تحديث في بلاغ #${report.tracking_number}`;
                message = 'تم تغيير حالة البلاغ.';
              }

              notifs.push({
                id: `${report.report_id}-${history.created_at}`,
                type: 'report_update',
                report_id: report.report_id,
                tracking_number: report.tracking_number,
                status: status,
                title,
                message,
                date: histDate,
                isToday
              });
            });
          }
        });
      }

      // Sort by date descending
      notifs.sort((a, b) => b.date.getTime() - a.date.getTime());
      setNotifications(notifs);

    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return 'منذ ' + Math.floor(interval) + ' سنة';
    
    interval = seconds / 2592000;
    if (interval > 1) return 'منذ ' + Math.floor(interval) + ' شهر';
    
    interval = seconds / 86400;
    if (interval > 1) {
      const days = Math.floor(interval);
      return days === 1 ? 'أمس' : 'منذ ' + days + ' أيام';
    }
    
    interval = seconds / 3600;
    if (interval > 1) {
      const hours = Math.floor(interval);
      return hours === 1 ? 'منذ ساعة' : hours === 2 ? 'منذ ساعتين' : 'منذ ' + hours + ' ساعات';
    }
    
    interval = seconds / 60;
    if (interval > 1) {
      const minutes = Math.floor(interval);
      return 'منذ ' + minutes + ' دقائق';
    }
    
    return 'الآن';
  };

  const getStatusIconInfo = (status?: string) => {
    if (status === 'verified' || status === 'completed') return { bg: 'bg-green-100', text: 'text-green-600', icon: 'check_circle' };
    if (status === 'under review' || status === 'under_review' || status === 'in_progress') return { bg: 'bg-orange-100', text: 'text-orange-600', icon: 'sync_alt' };
    if (status === 'rejected' || status === 'cancelled') return { bg: 'bg-red-100', text: 'text-red-600', icon: 'cancel' };
    return { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'info' }; // Default / received
  };

  const todayNotifs = notifications.filter(n => n.isToday);
  const earlierNotifs = notifications.filter(n => !n.isToday);

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
          <h1 className="text-lg font-bold text-text-main">التنبيهات</h1>
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-text-main">arrow_back</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 max-w-md mx-auto w-full">
        {loading ? (
           <div className="flex justify-center py-8">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
           </div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-8 mt-10">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <span className="material-symbols-outlined text-[32px]">notifications_off</span>
            </div>
            <p className="text-gray-500 font-medium">لا توجد تنبيهات جديدة</p>
          </div>
        ) : (
          <>
            {todayNotifs.length > 0 && (
              <div className="px-4 pt-6">
                <h2 className="text-sm font-bold text-text-muted mb-3 px-1">اليوم</h2>
                <div className="space-y-3">
                  {todayNotifs.map(notif => {
                    const iconInfo = getStatusIconInfo(notif.status);
                    return (
                      <div 
                        key={notif.id}
                        onClick={() => notif.report_id ? navigate(`/report-details/${notif.report_id}`) : null}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative group active:scale-[0.99] transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-full ${iconInfo.bg} flex items-center justify-center flex-shrink-0 mt-1`}>
                            <span className={`material-symbols-outlined ${iconInfo.text}`}>{iconInfo.icon}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold font-almarai text-text-main text-base leading-snug mb-1">{notif.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                            <p className="text-xs text-text-muted">{getTimeAgo(notif.date)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {earlierNotifs.length > 0 && (
              <div className="px-4 pt-6">
                <h2 className="text-sm font-bold text-text-muted mb-3 px-1">سابقاً</h2>
                <div className="space-y-3">
                  {earlierNotifs.map(notif => {
                    const iconInfo = getStatusIconInfo(notif.status);
                    return (
                      <div 
                        key={notif.id}
                        onClick={() => notif.report_id ? navigate(`/report-details/${notif.report_id}`) : null}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative group active:scale-[0.99] transition-all cursor-pointer opacity-80"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-full ${iconInfo.bg} flex items-center justify-center flex-shrink-0 mt-1`}>
                            <span className={`material-symbols-outlined ${iconInfo.text}`}>{iconInfo.icon}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold font-almarai text-text-main text-base leading-snug mb-1">{notif.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                            <p className="text-xs text-text-muted">{getTimeAgo(notif.date)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
