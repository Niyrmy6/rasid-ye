import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type AuthHeaderProps = {
  onBack?: () => void;
};

export default function AuthHeader({ onBack }: AuthHeaderProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 py-5 sticky top-0 z-50 bg-background-light/95 backdrop-blur-sm transition-colors duration-300">
      <div className={`flex items-center gap-2 ${isAr ? '' : 'order-1 flex-row'}`}>
        <img src="/shield.svg" alt="Logo" className="w-10 h-10" />
        <span className="text-xl text-text-main dark:text-slate-100 font-normal font-almarai">{t('Rasid')}</span>
      </div>
      <div className={`flex items-center gap-2 ${isAr ? '' : 'order-2 flex-row-reverse'}`}>
        <button
          type="button"
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted hover:bg-muted text-muted-foreground transition-colors"
          aria-label={t('Go Back')}
        >
          <span className="material-symbols-outlined text-xl rtl:rotate-180">arrow_back</span>
        </button>
      </div>
    </nav>
  );
}
