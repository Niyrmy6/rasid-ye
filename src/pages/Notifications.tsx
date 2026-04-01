import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
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
                title = `${t('Update on your report status #')}${report.tracking_number}`;
                message = t('Report received successfully in the system.');
              } else if (status === 'under review' || status === 'under_review' || status === 'in_progress') {
                title = `${t('Update on your report status #')}${report.tracking_number}`;
                message = t('Attached data is being reviewed by specialists.');
              } else if (status === 'verified' || status === 'completed') {
                title = `${t('Report closed #')}${report.tracking_number}`;
                message = t('Report has been verified and necessary action taken.');
              } else if (status === 'rejected' || status === 'cancelled') {
                title = `${t('Report rejected #')}${report.tracking_number}`;
                message = t('Report rejected due to unmet conditions.');
              } else {
                title = `${t('Update on report #')}${report.tracking_number}`;
                message = t('Report status has changed.');
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
    if (interval > 1) {
      const val = Math.floor(interval);
      return i18n.language === 'ar' ? `منذ ${val} سنة` : `${val} year${val > 1 ? 's' : ''} ago`;
    }
    
    interval = seconds / 2592000;
    if (interval > 1) {
      const val = Math.floor(interval);
      return i18n.language === 'ar' ? `منذ ${val} شهر` : `${val} month${val > 1 ? 's' : ''} ago`;
    }
    
    interval = seconds / 86400;
    if (interval > 1) {
      const days = Math.floor(interval);
      if (days === 1) return t('Yesterday');
      return i18n.language === 'ar' ? `منذ ${days} أيام` : `${days} days ago`;
    }
    
    interval = seconds / 3600;
    if (interval > 1) {
      const hours = Math.floor(interval);
      if (hours === 1) return i18n.language === 'ar' ? 'منذ ساعة' : 'an hour ago';
      if (hours === 2) return i18n.language === 'ar' ? 'منذ ساعتين' : '2 hours ago';
      return i18n.language === 'ar' ? `منذ ${hours} ساعات` : `${hours} hours ago`;
    }
    
    interval = seconds / 60;
    if (interval > 1) {
      const minutes = Math.floor(interval);
      return i18n.language === 'ar' ? `منذ ${minutes} دقائق` : `${minutes} minutes ago`;
    }
    
    return t('Just now');
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
          <h1 className="text-lg font-bold text-text-main">{t('Notifications')}</h1>
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
            <p className="text-gray-500 font-medium">{t('No new notifications')}</p>
          </div>
        ) : (
          <div dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            {todayNotifs.length > 0 && (
              <div className="px-4 pt-6">
                <h2 className="text-sm font-bold text-text-muted mb-3 px-1">{t('Today')}</h2>
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
                          <div className={`flex-1 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                            <h3 className="font-bold font-almarai text-text-main text-base leading-snug mb-1">{notif.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                            <p className="text-xs text-text-muted" dir="ltr" style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>{getTimeAgo(notif.date)}</p>
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
                <h2 className="text-sm font-bold text-text-muted mb-3 px-1">{t('Earlier')}</h2>
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
                          <div className={`flex-1 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                            <h3 className="font-bold font-almarai text-text-main text-base leading-snug mb-1">{notif.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                            <p className="text-xs text-text-muted" dir="ltr" style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>{getTimeAgo(notif.date)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
