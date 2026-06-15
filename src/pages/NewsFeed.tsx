import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import PageShell from "../components/PageShell";
import PageHeader from "../components/PageHeader";
import { fetchGlobalNews, fetchLocalNews } from "../lib/queries";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { toast } from "sonner";
import type { NewsRow, GlobalNewsItem } from "../types/models";
import { getNewsTypeLabel, getNewsTypeBadgeColor, matchesNewsTypeFilter } from "../lib/newsUtils";
import { formatAppDate } from "../lib/localeUtils";

function cleanTitle(title: string): string {
  // Remove source suffix e.g., " - ..." or " | ..."
  let cleaned = title.replace(/\s+[-|]\s+.*$/, "");
  // Remove non-word characters
  cleaned = cleaned.replace(/[^\p{L}\p{N}\s]/gu, "");
  // Normalize Arabic letters (e.g., أ, إ, آ -> ا; ة -> ه)
  cleaned = cleaned
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return cleaned;
}

function areTitlesSimilar(t1: string, t2: string): boolean {
  const c1 = cleanTitle(t1);
  const c2 = cleanTitle(t2);

  if (c1 === c2) return true;
  if (c1.includes(c2) && c2.length > 10) return true;
  if (c2.includes(c1) && c1.length > 10) return true;

  const words1 = new Set(c1.split(" ").filter((w) => w.length > 2));
  const words2 = new Set(c2.split(" ").filter((w) => w.length > 2));

  if (words1.size === 0 || words2.size === 0) return false;

  let intersectionCount = 0;
  for (const w of words1) {
    if (words2.has(w)) {
      intersectionCount++;
    }
  }

  const minSize = Math.min(words1.size, words2.size);
  const overlapRatio = intersectionCount / minSize;

  return overlapRatio > 0.65;
}

export default function NewsFeed() {
  const { t, i18n } = useTranslation();
  const { handleError } = useErrorHandler();
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [localNews, setLocalNews] = useState<NewsRow[]>([]);
  const [globalNews, setGlobalNews] = useState<GlobalNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [localLimit, setLocalLimit] = useState(3);
  const [globalLimit, setGlobalLimit] = useState(3);

  const handleShareNews = async (e: React.MouseEvent, title: string, itemId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/news/${itemId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: shareUrl,
        });
      } catch {
        // User cancelled share or share failed silently
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

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        // Fetch Local News
        const { data: localData, error: supaError } = await fetchLocalNews(50);

        if (supaError) {
          handleError(supaError, { context: 'Local news fetch' });
        } else {
          setLocalNews(localData || []);
        }

        const { data: globalData, error: globalError } = await fetchGlobalNews(i18n.language);
        if (globalError) {
          handleError(globalError, { context: 'Global news fetch', silent: true });
        }
        const uniqueGlobalData = (globalData || []).reduce<GlobalNewsItem[]>((acc, current) => {
          const isDuplicate = acc.some(item => 
            item.title === current.title || 
            item.link === current.link || 
            areTitlesSimilar(item.title, current.title)
          );
          if (!isDuplicate) {
            acc.push(current);
          }
          return acc;
        }, []);
        setGlobalNews(uniqueGlobalData);
      } catch (err) {
        handleError(err, { context: 'News Feed Catch' });
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [i18n.language]);

  const filteredLocalNews = localNews.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchQuery.toLowerCase()) || (news.content && news.content.toLowerCase().includes(searchQuery.toLowerCase()));
    const newsType = news.type ? news.type.toLowerCase().trim() : '';
    return matchesSearch && matchesNewsTypeFilter(newsType, activeFilter);
  });

  // RSS items only appear when filter is `all` or `global` — they have no local `type` column
  const filteredGlobalNews = globalNews.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchQuery.toLowerCase()) || (news.description && news.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = activeFilter === 'all' || activeFilter.toLowerCase() === 'global';
    return matchesSearch && matchesFilter;
  });

  return (
    <PageShell withBottomNav variant="scroll">
      <PageHeader title={t('News')} />

      <div className="max-w-md mx-auto">
        <div className="px-4 pt-2 pb-2">
          <label className={`relative flex items-center h-12 w-full rounded-xl bg-white dark:bg-surface-dark shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 focus-within:ring-2 focus-within:ring-primary overflow-hidden transition-shadow ${i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="flex items-center justify-center w-12 text-text-muted">
              <span className="material-symbols-outlined text-[24px] icon-hollow">
                search
              </span>
            </div>
            <input
              className={`w-full h-full bg-transparent border-none text-base text-text-main placeholder:text-text-muted focus:ring-0 p-0 ${i18n.language === 'ar' ? 'pr-4 text-right' : 'pl-4 text-left'}`}
              placeholder={t('Search health news...')}
              dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>

        {i18n.language !== 'en' && (
          <div className="px-4 py-2 grid grid-cols-1 gap-3">
            <div className="relative w-full">
              <button
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-surface-dark rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 text-sm font-medium text-text-muted hover:bg-gray-50 dark:hover:bg-white/5 transition-all ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className={`flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                  {activeFilter === 'all' && <span className="w-2 h-2 rounded-full bg-gray-500"></span>}
                  {activeFilter === 'urgent' && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                  {activeFilter === 'alert' && <span className="w-2 h-2 rounded-full bg-orange-500"></span>}
                  {activeFilter === 'guidelines' && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                  {activeFilter === 'event' && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                  {activeFilter === 'global' && <span className="w-2 h-2 rounded-full bg-purple-500"></span>}
                  <span className="font-bold text-text-main">{activeFilter === 'all' ? t('News Type') : t(activeFilter)}</span>
                </div>
                <span className="material-symbols-outlined text-[20px] text-gray-400 icon-hollow">
                  expand_more
                </span>
              </button>
              {isTypeDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-surface-dark rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 overflow-hidden z-20 block">
                  <div className="p-1">
                    <button
                      onClick={() => { setActiveFilter('all'); setIsTypeDropdownOpen(false); }}
                      className={`w-full px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 ${i18n.language === 'ar' ? 'text-right flex-row' : 'text-left flex-row-reverse'} ${activeFilter === 'all' ? 'bg-gray-100 dark:bg-gray-800 font-bold' : ''}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                      {t('All Types')}
                    </button>
                    <button
                      onClick={() => { setActiveFilter('urgent'); setIsTypeDropdownOpen(false); }}
                      className={`w-full px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 ${i18n.language === 'ar' ? 'text-right flex-row' : 'text-left flex-row-reverse'} ${activeFilter === 'urgent' ? 'bg-gray-100 dark:bg-gray-800 font-bold' : ''}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      {t('urgent')}
                    </button>
                    <button
                      onClick={() => { setActiveFilter('alert'); setIsTypeDropdownOpen(false); }}
                      className={`w-full px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 ${i18n.language === 'ar' ? 'text-right flex-row' : 'text-left flex-row-reverse'} ${activeFilter === 'alert' ? 'bg-gray-100 dark:bg-gray-800 font-bold' : ''}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      {t('alert')}
                    </button>
                    <button
                      onClick={() => { setActiveFilter('guidelines'); setIsTypeDropdownOpen(false); }}
                      className={`w-full px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 ${i18n.language === 'ar' ? 'text-right flex-row' : 'text-left flex-row-reverse'} ${activeFilter === 'guidelines' ? 'bg-gray-100 dark:bg-gray-800 font-bold' : ''}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      {t('guidelines')}
                    </button>
                    <button
                      onClick={() => { setActiveFilter('event'); setIsTypeDropdownOpen(false); }}
                      className={`w-full px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 ${i18n.language === 'ar' ? 'text-right flex-row' : 'text-left flex-row-reverse'} ${activeFilter === 'event' ? 'bg-gray-100 dark:bg-gray-800 font-bold' : ''}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {t('event')}
                    </button>
                    <button
                      onClick={() => { setActiveFilter('global'); setIsTypeDropdownOpen(false); }}
                      className={`w-full px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 ${i18n.language === 'ar' ? 'text-right flex-row' : 'text-left flex-row-reverse'} ${activeFilter === 'global' ? 'bg-gray-100 dark:bg-gray-800 font-bold' : ''}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      {t('global')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <main className="px-4 py-2 space-y-6">
          {i18n.language !== 'en' && (
            <section>
              <h2 className={`text-xl font-bold mb-3 text-text-main flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
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
                ) : filteredLocalNews.length > 0 ? (
                  <>
                    {filteredLocalNews.slice(0, localLimit).map((news) => (
                      <Link to={`/news/${news.item_id}`} key={news.item_id} className={`relative flex bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5 dark:ring-white/10 h-32 ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                        <div className="w-32 shrink-0 relative overflow-hidden">
                          <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                              backgroundImage: `url("${news.image || 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=200'}")`,
                            }}
                          ></div>
                          <div className={`absolute top-2 ${i18n.language === 'ar' ? 'right-2' : 'left-2'}`}>
                            <span className={`${getNewsTypeBadgeColor(news.type)} text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm`}>
                              {getNewsTypeLabel(news.type, t, t('Article'))}
                            </span>
                          </div>
                        </div>
                        <div className={`flex flex-col justify-between p-3 flex-1 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                          <div>
                            <h3 className="text-base font-bold text-text-main line-clamp-2 leading-snug mb-1">
                              {news.title}
                            </h3>
                          </div>
                          <div className={`flex items-end justify-between text-xs text-text-muted mt-auto w-full ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                            <span>{formatAppDate(news.publish_date, i18n.language, { year: "numeric", month: "short", day: "numeric" })}</span>
                            <button 
                              onClick={(e) => handleShareNews(e, news.title, news.item_id)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px] icon-hollow">
                                share
                              </span>
                            </button>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {filteredLocalNews.length > localLimit && (
                      <button
                        onClick={() => setLocalLimit((prev) => prev + 5)}
                        className="w-full py-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-primary font-bold rounded-xl text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.98] mt-2 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>{i18n.language === 'ar' ? 'عرض المزيد من الأخبار المحلية' : 'Show More Local News'}</span>
                        <span className="material-symbols-outlined text-[18px]">expand_more</span>
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">{t('No local news currently.')}</p>
                )}
              </div>
            </section>
          )}

          {(activeFilter === 'all' || activeFilter === 'global') && (
            <section>
              <h2 className={`text-lg font-bold mb-3 mt-6 text-text-main flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
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
                ) : filteredGlobalNews.length > 0 ? (
                  <>
                    {filteredGlobalNews.slice(0, globalLimit).map((news, index) => {
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
                              <span className="bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                {t('Global')}
                              </span>
                            </div>
                          </div>
                          <div className={`flex flex-col justify-between p-3 flex-1 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                            <div>
                              <h3 className="text-base font-bold text-text-main line-clamp-2 leading-snug mb-1">
                                {news.title}
                              </h3>
                            </div>
                            <div className={`flex items-end justify-between text-[11px] text-text-muted mt-auto w-full ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                              <span>{formatAppDate(news.pubDate, i18n.language, { year: "numeric", month: "short", day: "numeric" })}</span>
                              <span className="text-[#56BCA4] font-bold flex items-center gap-1">{t('Source ')} <span className="material-symbols-outlined text-[14px]">open_in_new</span></span>
                            </div>
                          </div>
                        </a>
                      );
                    })}
                    {filteredGlobalNews.length > globalLimit && (
                      <button
                        onClick={() => setGlobalLimit((prev) => prev + 5)}
                        className="w-full py-3 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-[#56BCA4] font-bold rounded-xl text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.98] mt-2 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>{i18n.language === 'ar' ? 'عرض المزيد من الأخبار العالمية' : 'Show More Global News'}</span>
                        <span className="material-symbols-outlined text-[18px]">expand_more</span>
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">{t('Global news cannot be fetched currently.')}</p>
                )}
              </div>
            </section>
          )}
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

    </PageShell>
  );
}
