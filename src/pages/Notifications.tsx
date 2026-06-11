import { useState, useEffect, type FC } from 'react';

import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import PageShell, { MAIN_CLASS } from '../components/PageShell';

import PageHeader from '../components/PageHeader';

import LoadingSpinner from '../components/LoadingSpinner';

import EmptyState from '../components/EmptyState';

import { useErrorHandler } from '../hooks/useErrorHandler';

import { fetchUserNotifications } from '../lib/queries';

import { getStatusIconInfo, getNotificationContent } from '../lib/reportUtils';

import { getStoredUser } from '../lib/session';



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



const NotificationCard: FC<{
  notif: NotificationItem;
  dimmed?: boolean;
  language: string;
  onNavigate: (reportId: number) => void;
  getTimeAgo: (date: Date) => string;
}> = ({ notif, dimmed, language, onNavigate, getTimeAgo }) => {

  const iconInfo = getStatusIconInfo(notif.status);

  return (

    <div

      onClick={() => notif.report_id && onNavigate(notif.report_id)}

      className={`bg-card p-4 rounded-2xl shadow-sm border border-border relative group active:scale-[0.99] transition-all cursor-pointer ${dimmed ? 'opacity-80' : ''}`}

    >

      <div className="flex items-start gap-4">

        <div className={`w-12 h-12 rounded-full ${iconInfo.bg} flex items-center justify-center flex-shrink-0 mt-1`}>

          <span className={`material-symbols-outlined ${iconInfo.text}`}>{iconInfo.icon}</span>

        </div>

        <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>

          <h3 className="font-bold font-almarai text-text-main text-base leading-snug mb-1">{notif.title}</h3>

          <p className="text-sm text-text-muted mb-2">{notif.message}</p>

          <p className="text-xs text-text-muted" dir="ltr" style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>

            {getTimeAgo(notif.date)}

          </p>

        </div>

      </div>

    </div>

  );

}



export default function Notifications() {

  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const { handleError } = useErrorHandler();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    fetchNotifications();

  }, []);



  const fetchNotifications = async () => {

    try {

      setLoading(true);

      const user = getStoredUser();

      if (!user?.user_id) return;



      const { data, error } = await fetchUserNotifications(user.user_id);

      if (error) throw error;



      const notifs: NotificationItem[] = [];

      const now = new Date();



      // Flatten each history row into its own notification (not just latest status per report)
      data.forEach((report) => {
        report.report_history?.forEach((history) => {

          const histDate = new Date(history.created_at);

          const isToday =

            histDate.getDate() === now.getDate() &&

            histDate.getMonth() === now.getMonth() &&

            histDate.getFullYear() === now.getFullYear();



          const { title, message } = getNotificationContent(

            history.report_status,

            report.tracking_number ?? '',

            t,

          );



          notifs.push({

            id: `${report.report_id}-${history.created_at}`,

            type: 'report_update',

            report_id: report.report_id,

            tracking_number: report.tracking_number ?? undefined,

            status: history.report_status?.toLowerCase(),

            title,

            message,

            date: histDate,

            isToday,

          });

        });

      });



      notifs.sort((a, b) => b.date.getTime() - a.date.getTime());

      setNotifications(notifs);

    } catch (error) {

      handleError(error, { context: 'Fetch notifications', silent: true });

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



  const todayNotifs = notifications.filter(n => n.isToday);

  const earlierNotifs = notifications.filter(n => !n.isToday);

  const goToReport = (reportId: number): void => {
    void navigate(`/report-details/${reportId}`);
  };



  return (

    <PageShell withBottomNav>

      <PageHeader title={t('Notifications')} showBack />



      <main className={MAIN_CLASS}>

        {loading ? (

          <LoadingSpinner />

        ) : notifications.length === 0 ? (

          <EmptyState icon="notifications_off" message={t('No new notifications')} />

        ) : (

          <div dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>

            {todayNotifs.length > 0 && (

              <div className="px-4 pt-6">

                <h2 className="text-sm font-bold text-text-muted mb-3 px-1">{t('Today')}</h2>

                 <div className="space-y-3">

                  {todayNotifs.map(notif => (

                    <NotificationCard

                      key={notif.id}

                      notif={notif}

                      language={i18n.language}

                      onNavigate={goToReport}

                      getTimeAgo={getTimeAgo}

                    />

                  ))}

                </div>

              </div>

            )}



            {earlierNotifs.length > 0 && (

              <div className="px-4 pt-6">

                <h2 className="text-sm font-bold text-text-muted mb-3 px-1">{t('Earlier')}</h2>

                <div className="space-y-3">

                  {earlierNotifs.map(notif => (

                    <NotificationCard

                      key={notif.id}

                      notif={notif}

                      dimmed

                      language={i18n.language}

                      onNavigate={goToReport}

                      getTimeAgo={getTimeAgo}

                    />

                  ))}

                </div>

              </div>

            )}

          </div>

        )}

      </main>

    </PageShell>

  );

}

