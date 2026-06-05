import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { fetchNewsById } from '../lib/queries';
import PageShell from '../components/PageShell';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'sonner';
import type { NewsRow } from '../types/models';
import { getNewsTypeLabel, getNewsTypeBadgeColor } from '../lib/newsUtils';
import { formatAppDate } from '../lib/localeUtils';
import { useErrorHandler } from '../hooks/useErrorHandler';

export default function NewsDetails() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { handleError } = useErrorHandler();
  const [newsItem, setNewsItem] = useState<NewsRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await fetchNewsById(parseInt(id));

        if (error) {
          handleError(error, { context: 'Fetch news detail', silent: true });
        } else {
          setNewsItem(data);
        }
      } catch (err) {
        handleError(err, { context: 'Fetch news detail catch', silent: true });
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id]);

  const handleShare = async () => {
    const shareTitle = newsItem ? newsItem.title : t('newsDetails.headline');
    const shareText = newsItem ? newsItem.content.substring(0, 100) + '...' : t('newsDetails.p1').substring(0, 100) + '...';
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success(i18n.language === 'ar' ? 'تمت المشاركة بنجاح!' : 'Shared successfully!');
      } catch {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(i18n.language === 'ar' ? 'تم نسخ رابط الخبر إلى الحافظة!' : 'News link copied to clipboard!');
      } catch (err) {
        toast.error(i18n.language === 'ar' ? 'فشل نسخ الرابط' : 'Failed to copy link');
      }
    }
  };

  const getFormattedDate = (dateStr: string) => {
    try {
      return formatAppDate(dateStr, i18n.language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return t('newsDetails.date');
    }
  };

  return (
    <PageShell withBottomNav variant="scroll" className="!pb-24">
      <PageHeader title={t('newsDetails.title')} showBack />

      <main className="w-full max-w-lg mx-auto">
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : (
          <>
            <div className="relative w-full aspect-[4/3] bg-gray-200 dark:bg-surface-dark">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url("${
                    newsItem?.image ||
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuCJcR91WYmJGgoHzi7BYWAvaP1fsPL41RtvNFzN_BHtR5bQyfFkeNUke2fZd744TeM3yGbXypi7m5s_czw8491aaV3tgZz033nNBLeNt9VBAaDXHjLEMwo1oaWKjEamWBiRZxiO-Nl5HDH6MTIDcZHbK4kd1iWM1LWGaClgVxoJ1MXAwPRC2ZrVL--0K5PViD7Oj-SDlkPh4Do_5iR7-cQI1Bc-tQSMzZaIi4G3O-Dpj6INImHMKcUeGoZSSusho8UiQ3Ry1aiH_1Op"'
                  }")`,
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 right-4 z-10">
                <span className={`${newsItem ? getNewsTypeBadgeColor(newsItem.type) : 'bg-red-500'} text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-sm`}>
                  {newsItem ? getNewsTypeLabel(newsItem.type, t, t('newsDetails.urgent')) : t('newsDetails.urgent')}
                </span>
              </div>
            </div>

            <div className="px-5 py-6 -mt-4 relative bg-background dark:bg-background-dark rounded-t-3xl z-20">
              <div className="flex items-center justify-between text-sm text-text-muted mb-4">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    {newsItem ? getFormattedDate(newsItem.publish_date) : t('newsDetails.date')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    {t('newsDetails.city')}
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-bold leading-tight text-text-main mb-6 font-display">
                {newsItem ? newsItem.title : t('newsDetails.headline')}
              </h2>

              <div className="w-full h-px bg-gray-200 dark:bg-white/10 mb-6"></div>

              <div className="prose prose-lg dark:prose-invert max-w-none text-text-main font-body leading-relaxed">
                {newsItem ? (
                  newsItem.content.split('\n').map((para, index) => (
                    <p key={index} className="mb-4 text-base">
                      {para}
                    </p>
                  ))
                ) : (
                  <>
                    <p className="mb-4 text-base">{t('newsDetails.p1')}</p>
                    <p className="mb-4 text-base">{t('newsDetails.p2')}</p>
                    <p className="mb-4 text-base">{t('newsDetails.p3')}</p>
                    <p className="text-base">{t('newsDetails.p4')}</p>
                  </>
                )}
              </div>

              <div className="mt-8">
                <button
                  onClick={handleShare}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">share</span>
                  {t('newsDetails.share')}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </PageShell>
  );
}

