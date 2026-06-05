import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageShell, { MAIN_CLASS } from '../components/PageShell';
import PageHeader from '../components/PageHeader';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useTheme } from '../hooks/useTheme';
import { fetchUserReportCount } from '../lib/queries';
import { getAppLocale } from '../lib/localeUtils';
import { getStoredUser, clearStoredUser } from '../lib/session';

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { handleError } = useErrorHandler();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  const navLinkClass =
    'w-full bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between group active:scale-[0.99] transition-all';
  const navIconClass = 'material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors';
  const navLabelClass = 'font-medium text-text-main font-almarai';
  const navChevronClass = `material-symbols-outlined text-gray-300 dark:text-gray-600 text-[20px] group-hover:text-primary transition-colors ${i18n.language === 'ar' ? 'rotate-180' : ''}`;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [reportCount, setReportCount] = useState<number | string>('...');

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = getStoredUser();
      if (storedUser) {
        try {
          setIsLoggedIn(true);
          setUserName(storedUser.full_name || t('Rasid User'));
          setUserId(storedUser.user_id);
          setProfilePicture(storedUser.profile_picture || null);

          const { count, error: supaError } = await fetchUserReportCount(storedUser.user_id);
            
            if (supaError) {
              handleError(supaError, { context: 'Profile count fetch' });
            } else if (count !== null) {
              setReportCount(count);
            } else {
              setReportCount(0);
            }
        } catch (e) {
          handleError(e, { context: 'Profile parse/fetch catch' });
        }
      }
    };
    fetchUser();
  }, [handleError, t]);

  const handleLogout = () => {
    clearStoredUser();
    setIsLoggedIn(false);
  };

  return (
    <PageShell withBottomNav>
      <PageHeader title={t('Profile')} brandLabel={t('Rasidna')} />

      <main className={`${MAIN_CLASS} flex flex-col items-center pt-6`}>
        {isLoggedIn ? (
          <div className="w-full">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-28 h-28 rounded-full bg-white dark:bg-surface-dark shadow-lg flex items-center justify-center overflow-hidden border-4 border-white dark:border-surface-dark">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined filled text-[112px] text-gray-300 dark:text-gray-600">person</span>
                  )}
                </div>
              </div>
              <h2 className="text-2xl font-bold font-almarai text-text-main mb-1">{userName}</h2>
            </div>

            <div className="px-4 mb-6 mt-6">
              <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">assignment_turned_in</span>
                  </div>
                  <span className="font-bold text-text-main">{t('Total Reports')}</span>
                </div>
                <span className="text-2xl font-bold font-almarai text-primary">
                  {typeof reportCount === 'number' ? reportCount.toLocaleString(getAppLocale(i18n.language)) : reportCount}
                </span>
              </div>
            </div>

            <div className="px-4 space-y-3">
              <Link to="/new-report" className="w-full bg-[#56BCA4] hover:bg-primary-dark text-white p-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-almarai font-bold mb-5">
                <span className="material-symbols-outlined">add_circle</span>
                {t('Submit New Report')}
              </Link>

              <Link to="/my-reports" className={navLinkClass} dir={dir}>
                <div className="flex items-center gap-3">
                  <span className={navIconClass}>article</span>
                  <span className={navLabelClass}>{t('My Reports')}</span>
                </div>
                <span className={navChevronClass}>chevron_right</span>
              </Link>

              <Link to="/personal-info" className={navLinkClass} dir={dir}>
                <div className="flex items-center gap-3">
                  <span className={navIconClass}>person_pin</span>
                  <span className={navLabelClass}>{t('Personal Information')}</span>
                </div>
                <span className={navChevronClass}>chevron_right</span>
              </Link>

              <Link to="/notifications" className={navLinkClass} dir={dir}>
                <div className="flex items-center gap-3">
                  <span className={navIconClass}>notifications</span>
                  <span className={navLabelClass}>{t('Notifications')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={navChevronClass}>chevron_right</span>
                </div>
              </Link>

              <Link to="/journey" className={navLinkClass} dir={dir}>
                <div className="flex items-center gap-3">
                  <span className={navIconClass}>info</span>
                  <span className={navLabelClass}>{t('Your Journey with Rasid')}</span>
                </div>
                <span className={navChevronClass}>chevron_right</span>
              </Link>

              <Link to="/contact" className={navLinkClass} dir={dir}>
                <div className="flex items-center gap-3">
                  <span className={navIconClass}>support_agent</span>
                  <span className={navLabelClass}>{t('Contact Us')}</span>
                </div>
                <span className={navChevronClass}>chevron_right</span>
              </Link>

              <button 
                onClick={toggleDarkMode} 
                className={`w-full bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between group active:scale-[0.99] transition-all ${i18n.language === 'ar' ? 'flex-row' : 'flex-row'}`}
                dir="ltr"
              >
                <div className={`w-12 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${isDarkMode ? 'right-0.5' : 'left-0.5'}`}></div>
                </div>
                <div className={`flex items-center gap-3 ${i18n.language === 'ar' ? '' : 'flex-row-reverse'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">
                    {isDarkMode ? 'light_mode' : 'dark_mode'}
                  </span>
                  <span className="font-medium text-text-main font-almarai">
                    {isDarkMode ? t('Light Mode') : t('Dark Mode')}
                  </span>
                </div>
              </button>

              <button 
                onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')} 
                className={`w-full bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between group active:scale-[0.99] transition-all ${i18n.language === 'ar' ? '' : 'flex-row-reverse'}`}
                dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">language</span>
                  <span className="font-medium text-text-main font-almarai">
                    {i18n.language === 'ar' ? 'English' : 'العربية'}
                  </span>
                </div>
                <span className={`material-symbols-outlined text-gray-300 dark:text-gray-600 text-[20px] group-hover:text-primary transition-colors ${i18n.language === 'ar' ? 'rotate-180' : ''}`}>swap_horiz</span>
              </button>
            </div>

            <div className="px-4 mt-8 mb-8">
              <button 
                onClick={handleLogout}
                className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-text-muted p-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-almarai font-bold border border-gray-200 dark:border-gray-700"
              >
                <span className="material-symbols-outlined">logout</span>
                {t('Logout')}
              </button>
            </div>
          </div>
        ) : (
          // Guest Profile
          <div className="w-full max-w-sm px-6 flex flex-col items-center text-center" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="mb-6 relative w-64 h-56 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-green-50 rounded-full opacity-60 blur-2xl"></div>
              <img
                alt="Community epidemiological surveillance illustration showing community shield"
                className="relative z-10 w-full h-full object-contain drop-shadow-sm rounded-2xl"
                src={new URL('../assets/surveillance_illustration.webp', import.meta.url).href}
              />
            </div>
            <h2 className="text-2xl font-extrabold font-almarai text-text-main mb-6 leading-tight">
              {t('Join Rasid Now')}
            </h2>

            <div className="w-full space-y-5 mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mt-1">
                  <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                </div>
                <div className="flex flex-col text-start">
                  <h3 className="font-bold font-almarai text-text-main text-base">
                    {t('Instant Alerts')}
                  </h3>
                  <p className={`text-sm text-text-muted mt-0.5 leading-relaxed ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('Be the first to know about epidemics in your area.')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mt-1">
                  <span className="material-symbols-outlined text-[20px]">record_voice_over</span>
                </div>
                <div className="flex flex-col text-start">
                  <h3 className="font-bold font-almarai text-text-main text-base">
                    {t('Accurate Reporting')}
                  </h3>
                  <p className={`text-sm text-text-muted mt-0.5 leading-relaxed ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('Contribute to protecting your community through official reports.')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mt-1">
                  <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
                </div>
                <div className="flex flex-col text-start">
                  <h3 className="font-bold font-almarai text-text-main text-base">
                    {t('Customized Guidelines')}
                  </h3>
                  <p className={`text-sm text-text-muted mt-0.5 leading-relaxed ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('Get preventive tips based on your condition and location.')}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full space-y-3 mt-auto mb-4">
              <Link
                to="/signup"
                className="w-full bg-[#57BCA5] hover:bg-primary-dark text-white py-4 px-6 rounded-2xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-almarai font-bold text-lg"
              >
                {t('Create New Account')}
              </Link>
              <Link
                to="/login"
                className="w-full bg-white dark:bg-surface-dark border-2 border-[#57BCA5] text-[#57BCA5] hover:bg-primary/5 py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-almarai font-bold text-lg"
              >
                {t('Login')}
              </Link>
              <Link
                to="/"
                className="w-full bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-white/10 text-text-muted dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5 py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-almarai font-bold text-lg"
              >
                <span className="material-symbols-outlined">home</span>
                {i18n.language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Return to Home Page'}
              </Link>
            </div>

            <div className="mb-6 w-full">
              <button 
                onClick={toggleDarkMode} 
                className={`w-full bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between group active:scale-[0.99] transition-all ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}
                dir="ltr"
              >
                <div className={`w-12 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${isDarkMode ? 'right-0.5' : 'left-0.5'}`}></div>
                </div>
                <div className={`flex items-center gap-3 ${i18n.language === 'ar' ? '' : 'flex-row-reverse'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">
                    {isDarkMode ? 'light_mode' : 'dark_mode'}
                  </span>
                  <span className="font-medium text-text-main font-almarai">
                    {isDarkMode ? t('Light Mode') : t('Dark Mode')}
                  </span>
                </div>
              </button>

              <button 
                onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')} 
                className={`w-full bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between group active:scale-[0.99] transition-all mt-3 ${i18n.language === 'ar' ? '' : 'flex-row-reverse'}`}
                dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">language</span>
                  <span className="font-medium text-text-main font-almarai">
                    {i18n.language === 'ar' ? 'English' : 'العربية'}
                  </span>
                </div>
                <span className={`material-symbols-outlined text-gray-300 dark:text-gray-600 text-[20px] group-hover:text-primary transition-colors ${i18n.language === 'ar' ? 'rotate-180' : ''}`}>swap_horiz</span>
              </button>
            </div>

            <div className="mb-6">
              <Link 
                to="/contact"
                className="text-sm text-text-muted hover:text-primary transition-colors font-medium border-b border-transparent hover:border-primary/50 pb-0.5"
              >
                {t('Need Help? Contact Us')}
              </Link>
            </div>
          </div>
        )}
      </main>

    </PageShell>
  );
}
