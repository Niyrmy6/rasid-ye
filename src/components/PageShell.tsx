import { ReactNode } from 'react';
import BottomNav from './BottomNav';

type PageShellProps = {
  children: ReactNode;
  withBottomNav?: boolean;
  variant?: 'app' | 'scroll';
  className?: string;
};

const SHELL_CLASS = {
  app: 'bg-background-light dark:bg-background-dark text-text-main antialiased selection:bg-primary selection:text-white h-screen flex flex-col overflow-hidden',
  scroll: 'bg-background dark:bg-background-dark text-text-main antialiased selection:bg-primary selection:text-white pb-32 min-h-screen',
};

export default function PageShell({
  children,
  withBottomNav = false,
  variant = 'app',
  className = '',
}: PageShellProps) {
  return (
    <div className={`${SHELL_CLASS[variant]} ${className}`.trim()}>
      {children}
      {withBottomNav && <BottomNav />}
    </div>
  );
}

export const MAIN_CLASS = 'flex-1 overflow-y-auto pb-32 max-w-md mx-auto w-full';
