import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !newPassword || !confirmPassword) {
      setError(t('forgot.fillRequired'));
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
    setError(null);

    try {
      const fullPhone = phone.startsWith('+967') ? phone : `+967${phone.replace(/^0+/, '')}`;

      // Check if user exists first
      const { data: user, error: fetchError } = await supabase
        .from('user')
        .select('user_id')
        .eq('phone', fullPhone)
        .maybeSingle();

      if (fetchError || !user) {
        setError(t('forgot.phoneNotRegistered'));
        setLoading(false);
        return;
      }

      const { data, error: funcError } = await supabase.functions.invoke('send-whatsapp-otp', {
        body: { phone: fullPhone }
      });

      if (funcError || !data?.success) {
        console.error('Error sending OTP:', funcError || data?.error);
        setError(t('forgot.errorSendingOtp'));
        setLoading(false);
        return;
      }

      // Navigate to OTP verification page with expected OTP and new password
      navigate('/verify-otp', { 
        state: { 
          phone: fullPhone, 
          newPassword, 
          expectedOtp: data.otp,
          isPasswordReset: true 
        } 
      });

    } catch (err) {
      setError(t('forgot.serverError'));
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light text-foreground min-h-screen flex flex-col font-display overflow-x-hidden selection:bg-primary selection:text-white">
      <nav className="flex items-center justify-between px-6 py-5 sticky top-0 z-50 bg-background-light/95 backdrop-blur-sm transition-colors duration-300">
        <div className="flex items-center gap-2 border-none">
        <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
            <span className="material-symbols-outlined text-xl">shield</span>
          </div>
          <h2 className="text-foreground text-lg font-bold tracking-tight">راصد</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted hover:bg-muted text-muted-foreground transition-colors"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
        </div>
      </nav>

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
                  placeholder="77xxxxxxx"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
              {error && <p className="text-red-500 text-sm font-bold text-center mb-4">{error}</p>}
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
      <div className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent pointer-events-none z-0"></div>
    </div>
  );
}
