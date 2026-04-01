import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BottomNav from '../components/BottomNav';

export default function NewsDetails() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-slate-100 antialiased selection:bg-primary selection:text-white pb-24 min-h-screen">
      <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm border-b border-gray-100 dark:border-white/10 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 order-1">
          <div className="w-10 h-10 bg-[#eefcfc] dark:bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <span
              className="material-symbols-outlined text-[24px]"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              shield
            </span>
          </div>
          <span className="text-xl font-bold text-text-main dark:text-slate-100">{t('Rasid')}</span>
        </div>
        <div className="flex items-center gap-3 order-2">
          <h1 className="text-lg font-bold text-text-main dark:text-slate-100">
            {t('newsDetails.title')}
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-text-main dark:text-slate-100">arrow_back</span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-lg mx-auto">
        <div className="relative w-full aspect-[4/3] bg-gray-200 dark:bg-surface-dark">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCJcR91WYmJGgoHzi7BYWAvaP1fsPL41RtvNFzN_BHtR5bQyfFkeNUke2fZd744TeM3yGbXypi7m5s_czw8491aaV3tgZz033nNBLeNt9VBAaDXHjLEMwo1oaWKjEamWBiRZxiO-Nl5HDH6MTIDcZHbK4kd1iWM1LWGaClgVxoJ1MXAwPRC2ZrVL--0K5PViD7Oj-SDlkPh4Do_5iR7-cQI1Bc-tQSMzZaIi4G3O-Dpj6INImHMKcUeGoZSSusho8UiQ3Ry1aiH_1Op")',
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute bottom-4 right-4 z-10">
            <span className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-sm">
              {t('newsDetails.urgent')}
            </span>
          </div>
        </div>

        <div className="px-5 py-6 -mt-4 relative bg-background-light dark:bg-background-dark rounded-t-3xl z-20">
          <div className="flex items-center justify-between text-sm text-text-muted dark:text-gray-400 mb-4">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                {t('newsDetails.date')}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                {t('newsDetails.city')}
              </span>
            </div>
            <div className="flex gap-2">
              <button className="text-text-muted hover:text-primary transition-colors">
                <span className="material-symbols-outlined">bookmark_border</span>
              </button>
            </div>
          </div>

          <h2 className="text-2xl font-bold leading-tight text-text-main dark:text-slate-100 mb-6 font-display">
            {t('newsDetails.headline')}
          </h2>

          <div className="w-full h-px bg-gray-200 dark:bg-white/10 mb-6"></div>

          <div className="prose prose-lg dark:prose-invert max-w-none text-text-main dark:text-gray-300 font-body leading-relaxed">
            <p className="mb-4 text-base">
              {t('newsDetails.p1')}
            </p>
            <p className="mb-4 text-base">
              {t('newsDetails.p2')}
            </p>
            <p className="mb-4 text-base">
              {t('newsDetails.p3')}
            </p>
            <p className="text-base">
              {t('newsDetails.p4')}
            </p>
          </div>

          <div className="mt-8 flex gap-3">
            <button className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px]">share</span>
              {t('newsDetails.share')}
            </button>
            <button className="w-14 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-text-muted hover:text-primary rounded-xl flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-95">
              <span className="material-symbols-outlined">bookmark</span>
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
