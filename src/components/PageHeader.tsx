import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type PageHeaderProps = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  brandLabel?: string;
};

export default function PageHeader({
  title,
  showBack = false,
  onBack,
  brandLabel,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const brand = brandLabel ?? t('Rasidna');

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm border-b border-gray-100 dark:border-white/10 max-w-md mx-auto w-full">
      <div className={`flex items-center gap-2 ${isAr ? '' : 'order-1 flex-row'}`}>
        <img src="/shield.svg" alt="Logo" className="w-10 h-10" />
        <span className="text-xl text-text-main font-almarai">{brand}</span>
      </div>

      <div className={`flex items-center gap-3 ${isAr ? '' : showBack ? 'order-2 flex-row-reverse' : 'order-2'}`}>
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center transition-colors"
            aria-label={t('Go Back')}
          >
            <span className="material-symbols-outlined text-text-main rtl:rotate-180">
              arrow_back
            </span>
          </button>
        )}
        <h1 className="text-lg font-bold text-text-main font-almarai">{title}</h1>
      </div>
    </header>
  );
}
