import { ReactNode } from 'react';
import AuthHeader from './AuthHeader';

type AuthLayoutProps = {
  children: ReactNode;
  footerGradient?: string;
  onBack?: () => void;
};

export default function AuthLayout({
  children,
  footerGradient = 'bg-gradient-to-t from-white to-transparent',
  onBack,
}: AuthLayoutProps) {
  return (
    <div className="bg-background-light text-foreground min-h-screen flex flex-col font-display overflow-x-hidden selection:bg-primary selection:text-white">
      <AuthHeader onBack={onBack} />
      {children}
      <div className={`fixed bottom-0 left-0 w-full h-24 ${footerGradient} pointer-events-none z-0`} />
    </div>
  );
}
