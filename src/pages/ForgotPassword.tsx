import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { notificationService } from '../lib/notifications';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { validateYemenPhone } from '../lib/phoneValidation';
import AuthLayout from '../components/AuthLayout';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim() || !newPassword || !confirmPassword) {
      setError(t('forgot.fillRequired'));
      return;
    }

    const phoneValidation = validateYemenPhone(phone, t);
    if (!phoneValidation.valid) {
      setError(phoneValidation.errorMsg);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('forgot.passwordsNotMatch'));
      return;
    }
    if (newPassword.length < 6) {
      setError(t('forgot.passwordLength'));
      return;
    }

    setLoading(true);

    try {
      const fullPhone = phoneValidation.fullPhone;

      // Avoid sending OTP to unknown numbers — same UX as "not registered"
      const { data: user, error: fetchError } = await supabase
        .from('user')
        .select('user_id')
        .eq('phone', fullPhone)
        .maybeSingle();

      if (fetchError) {
        handleError(fetchError, { context: 'ForgotPassword fetch user', silent: true });
        setError(t('login.serverError'));
        setLoading(false);
        return;
      }
      
      if (!user) {
        setError(t('forgot.phoneNotRegistered'));
        setLoading(false);
        return;
      }

      const result = await notificationService.sendOtp(fullPhone);

      if (!result.success) {
        const detail = result.error || result.details || '';
        if (detail.includes('Failed to fetch') || detail.includes('NetworkError') || detail.includes('net::ERR') || detail.includes('Network Error')) {
          setError(t('signup.networkError'));
        } else {
          setError(t('forgot.errorSendingOtp'));
        }
        if (detail) {
          handleError(new Error(detail), { context: 'ForgotPassword OTP function', silent: true });
        }
        setLoading(false);
        return;
      }

      navigate('/verify-otp', {
        state: {
          phone: fullPhone,
          newPassword,
          expectedOtp: result.otp,
          isPasswordReset: true,
        },
      });

    } catch (err) {
      if (err instanceof TypeError && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        setError(t('signup.networkError'));
      } else {
        setError(t('forgot.serverError'));
      }
      handleError(err, { context: 'ForgotPassword Catch Block', silent: true });
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <main className="flex-1 flex flex-col w-full max-w-md mx-auto px-6 pb-8 relative z-10 justify-center">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-pastel-purple rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-soft">
            <span className="material-symbols-outlined text-4xl text-accent-purple">
              lock_reset
            </span>
          </div>
          <h1 className="text-foreground text-3xl font-extrabold tracking-tight">{t('forgot.title')}</h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium leading-relaxed">
            {t('forgot.subtitle')}
          </p>
        </div>

        <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
          <div className="space-y-2">
              <label className="text-foreground font-bold text-sm mr-1 block" htmlFor="phone">
                رقم الهاتف
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500 font-sans flex items-center gap-2 pointer-events-none" dir="ltr">
                  <span>|</span>
                  <span className="text-foreground">+967</span>
                </div>
                <input
                  className="w-full bg-input-bg border border-transparent text-foreground text-right font-medium py-4 pr-12 pl-24 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-input transition-all placeholder:text-muted-foreground"
                  dir="ltr"
                  id="phone"
                  placeholder="7xxxxxxxx"
                  type="tel"
                  inputMode="numeric"
                  maxLength={9}
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d]/g, '');
                    setPhone(val);
                  }}
                  disabled={loading}
                  style={{ textAlign: 'right' }}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <span className="material-symbols-outlined">smartphone</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-foreground font-bold text-sm mr-1 block" htmlFor="newPassword">
                {t('forgot.newPasswordLabel')}
              </label>
              <div className="relative">
                <input
                  className="w-full bg-input-bg border border-transparent text-foreground text-right font-medium py-4 pr-12 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-input transition-all placeholder:text-muted-foreground"
                  dir="rtl"
                  id="newPassword"
                  placeholder={t('forgot.newPasswordPlaceholder')}
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <div 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-primary transition-colors z-10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mr-1">
                {t('signup.passwordHint')}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-foreground font-bold text-sm mr-1 block" htmlFor="confirmPassword">
                {t('forgot.confirmPasswordLabel')}
              </label>
              <div className="relative">
                <input
                  className="w-full bg-input-bg border border-transparent text-foreground text-right font-medium py-4 pr-12 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-input transition-all placeholder:text-muted-foreground"
                  dir="rtl"
                  id="confirmPassword"
                  placeholder={t('forgot.confirmPasswordPlaceholder')}
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  <span className="material-symbols-outlined">key</span>
                </div>
                <div 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-primary transition-colors z-10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-bold text-center mb-4 p-3 rounded-xl" dir="rtl">
                  <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                  <span>{error}</span>
                </div>
              )}
              <button
                className="w-full bg-primary hover:bg-primary-dark text-white text-lg font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary/30 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center disabled:opacity-70 disabled:pointer-events-none"
                type="submit"
                disabled={loading}
              >
                {loading ? t('forgot.updating') : t('forgot.updateBtn')}
              </button>
            </div>
          </form>
      </main>
    </AuthLayout>
  );
}
