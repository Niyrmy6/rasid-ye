import { useTranslation } from 'react-i18next';

type SpinnerSize = 'sm' | 'md' | 'lg';

type LoadingSpinnerProps = {
  size?: SpinnerSize;
  label?: string;
  fullScreen?: boolean;
  className?: string;
};

const SIZE_CLASS: Record<SpinnerSize, string> = {
  sm: 'h-6 w-6 border-b-2',
  md: 'h-8 w-8 border-b-2',
  lg: 'h-12 w-12 border-t-2 border-b-2',
};

export default function LoadingSpinner({
  size = 'md',
  label,
  fullScreen = false,
  className = '',
}: LoadingSpinnerProps) {
  const { t } = useTranslation();
  const message = label ?? t('Loading...');

  const spinner = (
    <div className={`animate-spin rounded-full border-primary ${SIZE_CLASS[size]}`} role="status" aria-label={message} />
  );

  if (fullScreen) {
    return (
      <div className={`h-screen flex items-center justify-center bg-background-light dark:bg-background-dark ${className}`.trim()}>
        {spinner}
      </div>
    );
  }

  if (label || size === 'lg') {
    return (
      <div className={`flex flex-col items-center justify-center py-8 gap-4 ${className}`.trim()}>
        {spinner}
        {message && <p className="text-text-muted">{message}</p>}
      </div>
    );
  }

  return (
    <div className={`flex justify-center p-8 ${className}`.trim()}>
      {spinner}
    </div>
  );
}
