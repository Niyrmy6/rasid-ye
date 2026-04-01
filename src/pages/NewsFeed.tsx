import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import BottomNav from "../components/BottomNav";
import { supabase } from "../lib/supabase";

type LocalNews = {
  item_id: number;
  title: string;
  content: string;
  image: string;
  type: string;
  publish_date: string;
};

type GlobalNews = {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  thumbnail: string;
};

export default function NewsFeed() {
  const { t, i18n } = useTranslation();
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [localNews, setLocalNews] = useState<LocalNews[]>([]);
  const [globalNews, setGlobalNews] = useState<GlobalNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        // Fetch Local News
        const { data: localData, error } = await supabase
          .from('news')
          .select('*')
          .order('publish_date', { ascending: false })
          .limit(5);
        
        if (error) {
          console.error("Local news error:", error);
        } else {
          setLocalNews(localData || []);
        }

        // Fetch Global News via RSS to JSON API
        const rssUrl = encodeURIComponent("https://news.google.com/rss/search?q=الأمراض+الصحة&hl=ar&gl=AE&ceid=AE:ar");
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
        const rssData = await res.json();
        
        if (rssData.status === 'ok') {
          // Parse and filter out articles without thumbnails initially if possible, or just limit to 10
          setGlobalNews(rssData.items.slice(0, 15));
        }
      } catch (err) {
        console.error("News fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-slate-100 antialiased selection:bg-primary selection:text-white pb-32 min-h-screen">
      <header className={`sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between max-w-md mx-auto ${i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
        <h1 className="text-xl font-bold text-text-main dark:text-slate-100">
          {t('News')}
        </h1>
        <div className={`flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="w-10 h-10 bg-[#eefcfc] dark:bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px] icon-hollow">
              shield
            </span>
          </div>
          <span className="text-xl font-bold text-text-main dark:text-slate-100">
            {t('Rasid')}
          </span>
        </div>
      </header>

      <div className="max-w-md mx-auto">
        <div className="px-4 pt-2 pb-2">
          <label className={`relative flex items-center h-12 w-full rounded-xl bg-white dark:bg-surface-dark shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 focus-within:ring-2 focus-within:ring-primary overflow-hidden transition-shadow ${i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="flex items-center justify-center w-12 text-text-muted dark:text-gray-400">
              <span className="material-symbols-outlined text-[24px] icon-hollow">
                search
              </span>
            </div>
            <input
              className={`w-full h-full bg-transparent border-none text-base text-text-main dark:text-slate-100 placeholder:text-text-muted dark:placeholder:text-gray-500 focus:ring-0 p-0 ${i18n.language === 'ar' ? 'pr-4 text-right' : 'pl-4 text-left'}`}
              placeholder={t('Search health news...')}
              dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
              type="text"
            />
          </label>
        </div>

        <div className="px-4 py-2 grid grid-cols-1 gap-3">
          <div className="relative w-full">
            <button
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-surface-dark rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 text-sm font-medium text-text-muted dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}
            >
              <span>{t('News Type')}</span>
              <span className="material-symbols-outlined text-[20px] text-gray-400 icon-hollow">
                expand_more
              </span>
            </button>
            {isTypeDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-surface-dark rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 overflow-hidden z-20 block">
                <div className="p-1">
                  <button
                    onClick={() => setIsTypeDropdownOpen(false)}
                    className={`w-full px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 ${i18n.language === 'ar' ? 'text-right flex-row' : 'text-left flex-row-reverse'}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    {t('Urgent')}
                  </button>
                  <button
                    onClick={() => setIsTypeDropdownOpen(false)}
                    className={`w-full px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 ${i18n.language === 'ar' ? 'text-right flex-row' : 'text-left flex-row-reverse'}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    {t('Alert')}
                  </button>
                  <button
                    onClick={() => setIsTypeDropdownOpen(false)}
                    className={`w-full px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 ${i18n.language === 'ar' ? 'text-right flex-row' : 'text-left flex-row-reverse'}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {t('Guidelines')}
                  </button>
                  <button
                    onClick={() => setIsTypeDropdownOpen(false)}
                    className={`w-full px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 ${i18n.language === 'ar' ? 'text-right flex-row' : 'text-left flex-row-reverse'}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {t('Event')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <main className="px-4 py-2 space-y-6">
          <section>
            <h2 className={`text-xl font-bold mb-3 text-text-main dark:text-slate-100 flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
              <span className="material-symbols-outlined text-primary icon-hollow">
                breaking_news
              </span>
              {t('Local News')}
            </h2>
            <div className="flex flex-col gap-4">
              {loading && localNews.length === 0 ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : localNews.length > 0 ? (
                localNews.map((news) => (
                  <article key={news.item_id} className={`relative flex bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5 dark:ring-white/10 h-32 ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                    <div className="w-32 shrink-0 relative overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url("${news.image || 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=200'}")`,
                        }}
                      ></div>
                      <div className={`absolute top-2 ${i18n.language === 'ar' ? 'right-2' : 'left-2'}`}>
                        <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          {news.type || t('Article')}
                        </span>
                      </div>
                    </div>
                    <div className={`flex flex-col justify-between p-3 flex-1 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                      <div>
                        <h3 className="text-base font-bold text-text-main dark:text-slate-100 line-clamp-2 leading-snug mb-1">
                          {news.title}
                        </h3>
                      </div>
                      <div className={`flex items-end justify-between text-xs text-text-muted dark:text-gray-400 mt-auto w-full ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                        <span>{new Date(news.publish_date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { year: "numeric", month: "short", day: "numeric" })}</span>
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                          <span className="material-symbols-outlined text-[18px] icon-hollow">
                            share
                          </span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">{t('No local news currently.')}</p>
              )}
            </div>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-3 mt-6 text-text-main dark:text-slate-100 flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
              <span className="material-symbols-outlined text-[#56BCA4] icon-hollow">
                public
              </span>
              {t('Global News')}
            </h2>
            <div className="flex flex-col gap-4">
              {loading && globalNews.length === 0 ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#56BCA4]"></div>
                </div>
              ) : globalNews.length > 0 ? (
                globalNews.map((news, index) => {
                  const fallbackImages = [
                    'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=200',
                    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=200',
                    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=200',
                    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=200'
                  ];
                  const hasValidThumbnail = news.thumbnail && news.thumbnail.length > 20;
                  const thumbnail = hasValidThumbnail ? news.thumbnail : fallbackImages[index % fallbackImages.length];
                  return (
                    <a key={index} href={news.link} target="_blank" rel="noopener noreferrer" className={`relative flex bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5 dark:ring-white/10 h-32 hover:shadow-md transition-shadow ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                      <div className="w-32 shrink-0 relative overflow-hidden">
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url("${thumbnail}")` }}
                        ></div>
                        <div className={`absolute top-2 ${i18n.language === 'ar' ? 'right-2' : 'left-2'}`}>
                          <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            {t('Global')}
                          </span>
                        </div>
                      </div>
                      <div className={`flex flex-col justify-between p-3 flex-1 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                        <div>
                          <h3 className="text-base font-bold text-text-main dark:text-slate-100 line-clamp-2 leading-snug mb-1">
                            {news.title}
                          </h3>
                        </div>
                        <div className={`flex items-end justify-between text-[11px] text-text-muted dark:text-gray-400 mt-auto w-full ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                          <span>{new Date(news.pubDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { year: "numeric", month: "short", day: "numeric" })}</span>
                          <span className="text-[#56BCA4] font-bold flex items-center gap-1">{t('Source ')} <span className="material-symbols-outlined text-[14px]">open_in_new</span></span>
                        </div>
                      </div>
                    </a>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">{t('Global news cannot be fetched currently.')}</p>
              )}
            </div>
          </section>
        </main>

        <div className="fixed bottom-20 left-0 right-0 z-30 max-w-md mx-auto pointer-events-none px-4">
          <div className="flex justify-end w-full pointer-events-auto">
            <Link
              to="/new-report"
              className={`flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 group ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}
            >
              <span className="material-symbols-outlined text-[24px] icon-hollow">
                add_alert
              </span>
              <span className="font-bold text-base">{t('Submit Report')}</span>
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
