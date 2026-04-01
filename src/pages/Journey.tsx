import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BottomNav from '../components/BottomNav';

export default function Journey() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="bg-background-light text-text-main antialiased selection:bg-primary selection:text-white h-screen flex flex-col overflow-hidden">
      <header className="sticky top-0 z-40 bg-background-light/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm border-b border-gray-100 max-w-md mx-auto w-full">
        <div className={`flex items-center gap-2 ${i18n.language === 'ar' ? 'order-1' : 'order-1 flex-row'}`}>
          <div className="w-10 h-10 bg-[#eefcfc] rounded-xl flex items-center justify-center text-primary border border-primary/20">
            <span className="material-symbols-outlined text-[24px]">shield</span>
          </div>
          <span className="text-xl font-bold text-text-main font-almarai">{t('Rasid')}</span>
        </div>
        <div className={`flex items-center gap-3 ${i18n.language === 'ar' ? 'order-2' : 'order-2 flex-row-reverse'}`}>
          <h1 className="text-lg font-bold text-text-main font-almarai">{t('Your Journey with Rasid')}</h1>
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <span className={`material-symbols-outlined text-text-main ${i18n.language === 'ar' ? '' : 'rotate-180'}`}>arrow_back</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 bg-white max-w-md mx-auto w-full">
        <div className="px-6 py-8 relative">
          <div className={`absolute top-16 bottom-32 w-1 bg-gradient-to-b from-[#57bca5] via-[#a7f3d0] to-[#eefcfc] rounded-full z-0 opacity-40 ${i18n.language === 'ar' ? 'right-[3.65rem]' : 'left-[3.65rem]'}`}></div>
          
          <div className="space-y-12 relative z-10">
            <div className={`flex items-start gap-6 group ${i18n.language === 'ar' ? 'text-right' : 'text-left flex-row-reverse'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-[0_8px_16px_-6px_rgba(59,130,246,0.3)] border border-blue-200 transform transition-transform group-hover:scale-105 duration-300">
                  <div className="relative">
                    <span className="material-symbols-outlined text-[40px] text-blue-600 drop-shadow-sm">campaign</span>
                  </div>
                </div>
                <div className={`absolute -bottom-3 bg-white rounded-xl p-1.5 shadow-md border border-gray-100 ${i18n.language === 'ar' ? '-right-3 rotate-12' : '-left-3 -rotate-12'}`}>
                  <span className="material-symbols-outlined text-[20px] text-primary">smartphone</span>
                </div>
              </div>
              <div className="flex-1 pt-2">
                <div className={`flex items-center gap-2 mb-1 ${i18n.language === 'ar' ? '' : 'flex-row-reverse'}`}>
                  <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">1</span>
                  <h3 className="font-bold text-lg font-almarai text-text-main">{t('Quick Reporting')}</h3>
                </div>
                <p className="text-sm leading-relaxed text-text-muted">{t('Share what you see around you in simple and quick steps to help.')}</p>
              </div>
            </div>

            <div className={`flex items-start gap-6 group ${i18n.language === 'ar' ? 'text-right' : 'text-left flex-row-reverse'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center shadow-[0_8px_16px_-6px_rgba(245,158,11,0.3)] border border-orange-200 transform transition-transform group-hover:scale-105 duration-300">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-full h-full rounded-full border-2 border-orange-300/30 animate-ping"></span>
                    <span className="material-symbols-outlined text-[40px] text-orange-500 drop-shadow-sm">notifications_active</span>
                  </div>
                </div>
                <div className={`absolute -bottom-3 bg-white rounded-xl p-1.5 shadow-md border border-gray-100 ${i18n.language === 'ar' ? '-right-3 -rotate-6' : '-left-3 rotate-6'}`}>
                  <span className="material-symbols-outlined text-[20px] text-orange-400">sentiment_satisfied</span>
                </div>
              </div>
              <div className="flex-1 pt-2">
                <div className={`flex items-center gap-2 mb-1 ${i18n.language === 'ar' ? '' : 'flex-row-reverse'}`}>
                  <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold">2</span>
                  <h3 className="font-bold text-lg font-almarai text-text-main">{t('Receive Alerts')}</h3>
                </div>
                <p className="text-sm leading-relaxed text-text-muted">{t('Stay informed about what\'s happening in your surroundings and community.')}</p>
              </div>
            </div>

            <div className={`flex items-start gap-6 group ${i18n.language === 'ar' ? 'text-right' : 'text-left flex-row-reverse'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-purple-50 to-fuchsia-100 flex items-center justify-center shadow-[0_8px_16px_-6px_rgba(168,85,247,0.3)] border border-purple-200 transform transition-transform group-hover:scale-105 duration-300">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full text-purple-300/50" fill="currentColor" viewBox="0 0 24 24"><path d="M15 19l-6-2.11-4.03 1.35C4.26 18.5 3.5 17.96 3.5 17.27V5.4c0-.79.82-1.32 1.54-1.09l4.99 1.58 6-2.11 5.03-1.68C21.74 1.84 22.5 2.38 22.5 3.07v11.86c0 .79-.82 1.32-1.54 1.09l-4.99-1.58L15 19z" opacity="0.4"></path></svg>
                    <span className={`material-symbols-outlined text-[36px] text-purple-600 relative z-10 drop-shadow-md -translate-y-1 ${i18n.language === 'ar' ? 'translate-x-1' : '-translate-x-1'}`}>search</span>
                  </div>
                </div>
                <div className={`absolute -bottom-3 bg-white rounded-xl p-1.5 shadow-md border border-gray-100 ${i18n.language === 'ar' ? '-right-3 rotate-6' : '-left-3 -rotate-6'}`}>
                  <span className="material-symbols-outlined text-[20px] text-purple-400">explore</span>
                </div>
              </div>
              <div className="flex-1 pt-2">
                <div className={`flex items-center gap-2 mb-1 ${i18n.language === 'ar' ? '' : 'flex-row-reverse'}`}>
                  <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold">3</span>
                  <h3 className="font-bold text-lg font-almarai text-text-main">{t('Follow the Map')}</h3>
                </div>
                <p className="text-sm leading-relaxed text-text-muted">{t('Track cases and reports directly on an interactive map.')}</p>
              </div>
            </div>

            <div className={`flex items-start gap-6 group ${i18n.language === 'ar' ? 'text-right' : 'text-left flex-row-reverse'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center shadow-[0_8px_16px_-6px_rgba(16,185,129,0.3)] border border-green-200 transform transition-transform group-hover:scale-105 duration-300">
                  <div className="relative flex items-center justify-center">
                    <span className="material-symbols-outlined text-[48px] text-green-200 absolute top-[-6px]">verified_user</span>
                    <div className={`flex items-center justify-center gap-[-4px] pt-2 z-10 ${i18n.language === 'ar' ? '' : 'flex-row-reverse'}`}>
                      <span className="material-symbols-outlined text-[20px] text-green-600">face</span>
                      <span className={`material-symbols-outlined text-[20px] text-green-600 ${i18n.language === 'ar' ? '-ml-1' : '-mr-1'}`}>face_3</span>
                      <span className={`material-symbols-outlined text-[20px] text-green-600 ${i18n.language === 'ar' ? '-ml-1' : '-mr-1'}`}>face_6</span>
                    </div>
                  </div>
                </div>
                <div className={`absolute -bottom-3 bg-white rounded-xl p-1.5 shadow-md border border-gray-100 ${i18n.language === 'ar' ? '-right-3 -rotate-3' : '-left-3 rotate-3'}`}>
                  <span className="material-symbols-outlined text-[20px] text-green-500">health_and_safety</span>
                </div>
              </div>
              <div className="flex-1 pt-2">
                <div className={`flex items-center gap-2 mb-1 ${i18n.language === 'ar' ? '' : 'flex-row-reverse'}`}>
                  <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">4</span>
                  <h3 className="font-bold text-lg font-almarai text-text-main">{t('Safe Community')}</h3>
                </div>
                <p className="text-sm leading-relaxed text-text-muted">{t('Together we contribute to building a safer and more aware environment for everyone.')}</p>
              </div>
            </div>
          </div>

          <div className="mt-20 mb-4">
            <button 
              onClick={() => navigate('/news')}
              className="w-full bg-[#56BCA4] hover:bg-[#4aa590] text-white p-4 rounded-2xl shadow-[0_10px_20px_-10px_rgba(86,188,164,0.5)] flex items-center justify-center gap-3 transition-all active:scale-[0.98] font-almarai font-bold text-lg group"
            >
              {t('Start Your Journey')}
              <span className={`material-symbols-outlined group-hover:-translate-x-1 transition-transform ${i18n.language === 'ar' ? 'rotate-180' : ''}`}>arrow_right_alt</span>
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
