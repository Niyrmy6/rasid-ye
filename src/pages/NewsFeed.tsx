import { useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function NewsFeed() {
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-slate-100 antialiased selection:bg-primary selection:text-white pb-32 min-h-screen">
      <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between flex-row-reverse max-w-md mx-auto">
        <h1 className="text-xl font-bold text-text-main dark:text-slate-100">الأخبار</h1>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#eefcfc] dark:bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px] icon-hollow">shield</span>
          </div>
          <span className="text-xl font-bold text-text-main dark:text-slate-100">راصد</span>
        </div>
      </header>

      <div className="max-w-md mx-auto">
        <div className="px-4 pt-2 pb-2">
          <label className="relative flex items-center h-12 w-full rounded-xl bg-white dark:bg-surface-dark shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 focus-within:ring-2 focus-within:ring-primary overflow-hidden transition-shadow">
            <div className="flex items-center justify-center w-12 text-text-muted dark:text-gray-400">
              <span className="material-symbols-outlined text-[24px] icon-hollow">search</span>
            </div>
            <input
              className="w-full h-full bg-transparent border-none text-base text-text-main dark:text-slate-100 placeholder:text-text-muted dark:placeholder:text-gray-500 focus:ring-0 p-0 pl-4"
              placeholder="بحث عن أخبار صحية..."
              type="text"
            />
          </label>
        </div>

        <div className="px-4 py-2 grid grid-cols-2 gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-surface-dark rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 text-sm font-medium text-text-muted dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              <span>نوع الخبر</span>
              <span className="material-symbols-outlined text-[20px] text-gray-400 icon-hollow">
                expand_more
              </span>
            </button>
            {isTypeDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-surface-dark rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 overflow-hidden z-20 block">
                <div className="p-1">
                  <button 
                    onClick={() => setIsTypeDropdownOpen(false)}
                    className="w-full text-right px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    عاجل
                  </button>
                  <button 
                    onClick={() => setIsTypeDropdownOpen(false)}
                    className="w-full text-right px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    تنبيه
                  </button>
                  <button 
                    onClick={() => setIsTypeDropdownOpen(false)}
                    className="w-full text-right px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    إرشادات
                  </button>
                  <button 
                    onClick={() => setIsTypeDropdownOpen(false)}
                    className="w-full text-right px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    حدث
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="relative w-full">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-surface-dark rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 text-sm font-medium text-text-muted dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all pointer-events-none">
              <span>{selectedDate ? selectedDate : 'اختر التاريخ'}</span>
              <span className="material-symbols-outlined text-[20px] text-gray-400 icon-hollow">
                calendar_today
              </span>
            </div>
          </div>
        </div>

        <main className="px-4 py-2 space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-3 text-text-main dark:text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary icon-hollow">
                breaking_news
              </span>
              أحدث المستجدات
            </h2>
            <div
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-surface-dark shadow-sm ring-1 ring-black/5 dark:ring-white/10 transition-all hover:shadow-md"
            >
              <Link to="/news/1" className="relative w-full aspect-video overflow-hidden block">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  data-alt="Doctor checking patient vitals"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCJcR91WYmJGgoHzi7BYWAvaP1fsPL41RtvNFzN_BHtR5bQyfFkeNUke2fZd744TeM3yGbXypi7m5s_czw8491aaV3tgZz033nNBLeNt9VBAaDXHjLEMwo1oaWKjEamWBiRZxiO-Nl5HDH6MTIDcZHbK4kd1iWM1LWGaClgVxoJ1MXAwPRC2ZrVL--0K5PViD7Oj-SDlkPh4Do_5iR7-cQI1Bc-tQSMzZaIi4G3O-Dpj6INImHMKcUeGoZSSusho8UiQ3Ry1aiH_1Op")',
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                    عاجل
                  </span>
                </div>
              </Link>
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-text-muted dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] icon-hollow">
                      calendar_today
                    </span>
                    ١٢ أكتوبر ٢٠٢٣
                  </span>
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold">
                    صنعاء
                  </span>
                </div>
                <Link to="/news/1">
                  <h3 className="text-lg font-bold leading-tight text-text-main dark:text-slate-100 transition-colors">
                    حملة تطعيم وطنية شاملة ضد الكوليرا تنطلق في العاصمة صنعاء
                  </h3>
                </Link>
                <p className="text-sm text-text-muted dark:text-gray-400 line-clamp-2">
                  وزارة الصحة تعلن عن بدء المرحلة الأولى من حملة التطعيم التي تستهدف الأطفال دون سن
                  الخامسة في جميع مديريات الأمانة...
                </p>
                <Link to="/news/1" className="mt-1 flex items-center gap-1 text-primary text-sm font-bold w-fit">
                  <span>اقرأ المزيد</span>
                  <span className="material-symbols-outlined text-[16px] rtl:rotate-180">arrow_forward</span>
                </Link>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3 text-text-main dark:text-slate-100">
              أخبار سابقة
            </h2>
            <div className="flex flex-col gap-4">
              <article className="relative flex bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5 dark:ring-white/10 h-32">
                <div className="w-32 shrink-0 relative overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    data-alt="Medical supplies on table"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD9VJlpWw-QRxciN35IXaT-s6AC3XN_ClEHqgSSllqMtaeWfYS7T5XjKbQcJxhKLNiNo1Yl4Qv-tZucxS_zkqE45e8JBsETWEGjRTUzrd1pQvL6GIjOfz280KW43LoIudTxyIvT-cVUKIJG_nLFrwPOVtbpmMp3cs8YiTHmu1ukHJxCkMmLg6ktnwobJpKs2PAjBgqIDJzLmg7uZbsrAg69RrAL5FD8JU_xG9MMTCTK_1DsZ2EDWDEBrqoZZf1Gh0kSRBaH8l5SqYaZ")',
                    }}
                  ></div>
                  <div className="absolute top-2 right-2">
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      تنبيه
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-between p-3 flex-1">
                  <div>
                    <h3 className="text-base font-bold text-text-main dark:text-slate-100 line-clamp-2 leading-snug mb-1">
                      وصول شحنة مساعدات طبية جديدة إلى ميناء الحديدة
                    </h3>
                  </div>
                  <div className="flex items-end justify-between text-xs text-text-muted dark:text-gray-400 mt-auto w-full">
                    <span>١٠ أكتوبر ٢٠٢٣</span>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                      <span className="material-symbols-outlined text-[18px] icon-hollow">
                        share
                      </span>
                    </button>
                  </div>
                </div>
              </article>

              <article className="relative flex bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5 dark:ring-white/10 h-32">
                <div className="w-32 shrink-0 relative overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    data-alt="Nurse holding clipboard"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDY02sgDsErpjp3b0gelKNYGzIhh93evRZv279WRVtOOg4XglIC4viYVnPOs0RUGPzN5RvTLjaK7uPAAoSTLG_ZBQlJMVmppNsNDPfuYNIDjJeBUpAe9Pit0FWaSHcvKdZovS0TZocxjjrEUjqPjO25rZq_ZM980_SZ7PttPEDaaCYkYVJP5bW0cGmfYf_tNkHYGT-TefDtG5DOyKh3tmRtKrlHqAuJBZHu6x_mC5uO37qwWygOXMsTJIrv_uOpkU88tYmem1IzBnyu")',
                    }}
                  ></div>
                  <div className="absolute top-2 right-2">
                    <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      إرشادات
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-between p-3 flex-1">
                  <div>
                    <h3 className="text-base font-bold text-text-main dark:text-slate-100 line-clamp-2 leading-snug mb-1">
                      نصائح وإرشادات للوقاية من الأمراض الموسمية
                    </h3>
                  </div>
                  <div className="flex items-end justify-between text-xs text-text-muted dark:text-gray-400 mt-auto w-full">
                    <span>٠٨ أكتوبر ٢٠٢٣</span>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                      <span className="material-symbols-outlined text-[18px] icon-hollow">
                        share
                      </span>
                    </button>
                  </div>
                </div>
              </article>

              <article className="relative flex bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5 dark:ring-white/10 h-32">
                <div className="w-32 shrink-0 relative overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    data-alt="People talking in clinic"
                    style={{
                      backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAea14MRuY2PxkcJBJnDNCWRmJBhWgfhlEJu_sh5BFb0royzKhSovNahrY3LpyXHXXp-kbQ-cdkB9Y1xwTcfYxt3U1fV0MVSUTcYuyZh44V4ocmkwjkIrRt4H9OJo1dR4Ys7p5S310tCT6FTTFqSutzQ6hwUR_9Uv4KUYaz6z0QnNX0GbdkBsFEac9nW9L2jNbm4DRLeSgOSFc6aois9UJ6RmQO0ywcKxizKwIx5oe7NkK2NXMmtOR-CMkdZN6FhmFIzpIYK00kwVAM")',
                    }}
                  ></div>
                  <div className="absolute top-2 right-2">
                    <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      حدث
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-between p-3 flex-1">
                  <div>
                    <h3 className="text-base font-bold text-text-main dark:text-slate-100 line-clamp-2 leading-snug mb-1">
                      افتتاح مركز صحي جديد في محافظة تعز
                    </h3>
                  </div>
                  <div className="flex items-end justify-between text-xs text-text-muted dark:text-gray-400 mt-auto w-full">
                    <span>٠٥ أكتوبر ٢٠٢٣</span>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                      <span className="material-symbols-outlined text-[18px] icon-hollow">
                        share
                      </span>
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>

        <div className="fixed bottom-20 left-0 right-0 z-30 max-w-md mx-auto pointer-events-none px-4">
          <div className="flex justify-end w-full pointer-events-auto">
            <Link to="/new-report" className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 group">
              <span className="material-symbols-outlined text-[24px] icon-hollow">add_alert</span>
              <span className="font-bold text-base">تقديم بلاغ</span>
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
