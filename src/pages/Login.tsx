import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { setStoredUser } from '../lib/session';
import { validateYemenPhone } from '../lib/phoneValidation';
import AuthLayout from '../components/AuthLayout';

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim() || !password) {
      setError(t('Please enter phone number and password'));
      return;
    }

    const phoneValidation = validateYemenPhone(phone, t);
    if (!phoneValidation.valid) {
      setError(phoneValidation.errorMsg);
      return;
    }

    if (password.length < 6) {
      setError(t('signup.passwordMinLength'));
      return;
    }

    setLoading(true);

    try {
      const fullPhone = phoneValidation.fullPhone;

      // Custom auth: credentials live on `user` row (not Supabase Auth JWT)
      const { data, error: supaError } = await supabase
        .from('user')
        .select('*')
        .eq('phone', fullPhone)
        .eq('password', password)
        .maybeSingle();

      if (supaError) {
        handleError(supaError, { context: 'Login Subquery', silent: true });
        setError(t('login.serverError'));
        return;
      } 
      
      if (!data) {
        setError(t('Incorrect phone number or password'));
      } else {
        // Citizen mobile app — staff use separate tooling (role_id 1/2)
        if (data.role_id === 3) {
          setStoredUser(data);
          navigate('/news');
        } else {
          setError(t('Sorry, this app is for reporters only. Staff interface is not available here.'));
        }
      }
    } catch (err) {
      if (err instanceof TypeError && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        setError(t('signup.networkError'));
      } else {
        setError(t('login.serverError'));
      }
      handleError(err, { context: 'Login Catch Block', silent: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <main className="flex-1 flex flex-col w-full max-w-md mx-auto px-6 pb-8 relative z-10 justify-center">
        <div className="relative w-full h-48 mb-6 flex items-center justify-center">
          <div className="absolute top-2 left-1/4 w-32 h-32 bg-pastel-purple rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-2 right-1/4 w-32 h-32 bg-pastel-yellow rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="relative z-10 w-full h-full flex items-end justify-center">
            <div className="absolute top-4 left-8 text-accent-purple/20 animate-pulse">
              <span className="material-symbols-outlined text-4xl">cloud</span>
            </div>
            <div className="absolute top-8 right-12 text-primary/20 animate-pulse delay-700">
              <span className="material-symbols-outlined text-3xl">cloud</span>
            </div>
            <div
              className="absolute top-10 left-16 bg-pastel-pink p-1.5 rounded-full text-red-400 shadow-sm animate-bounce"
              style={{ animationDuration: '3s' }}
            >
              <span className="material-symbols-outlined text-lg">coronavirus</span>
            </div>
            <div
              className="absolute top-16 right-16 bg-pastel-green p-1.5 rounded-full text-primary shadow-sm animate-bounce"
              style={{ animationDuration: '4s' }}
            >
              <span className="material-symbols-outlined text-lg">biotech</span>
            </div>

            <div className="relative flex flex-col items-center">
              <div className="w-28 h-28 bg-pastel-purple rounded-full flex items-center justify-center relative border-4 border-white shadow-soft z-20">
                <span className="material-symbols-outlined text-[4rem] text-accent-purple">
                  face_3
                </span>
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 bg-accent-yellow p-1.5 rounded-full text-white shadow-sm transform -rotate-12 border-2 border-white">
                  <span className="material-symbols-outlined text-lg">campaign</span>
                </div>
              </div>
              <div className="w-40 h-12 bg-gradient-to-t from-pastel-purple/50 to-transparent rounded-t-full mt-[-10px] opacity-60 blur-sm"></div>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-foreground text-3xl font-extrabold tracking-tight">{t('Login')}</h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium">{t('Welcome back to Rasid community')}</p>
        </div>

        <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className={`text-foreground font-bold text-sm block ${i18n.language === 'ar' ? 'mr-1 text-right' : 'ml-1 text-left'}`} htmlFor="phone">
              {t('Phone Number')}
            </label>
              <div className="relative" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                <div className={`absolute top-1/2 -translate-y-1/2 font-bold text-gray-500 font-sans flex items-center gap-2 pointer-events-none ${i18n.language === 'ar' ? 'left-4' : 'left-4'}`} dir="ltr">
                  <span>|</span>
                  <span className="text-foreground">+967</span>
                </div>
                <input
                  className={`w-full bg-input-bg border border-transparent text-foreground font-medium py-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-input transition-all placeholder:text-muted-foreground ${i18n.language === 'ar' ? 'pr-12 pl-24 text-right' : 'pl-24 pr-12 text-left'}`}
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
                  style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}
                />
                <div className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none ${i18n.language === 'ar' ? 'right-4' : 'left-4 pl-42'}`} style={i18n.language !== 'ar' ? { left: 'auto', right: '1rem' } : {}}>
                  <span className="material-symbols-outlined">smartphone</span>
                </div>
              </div>
          </div>

          <div className="space-y-2">
            <label className={`text-foreground font-bold text-sm block ${i18n.language === 'ar' ? 'mr-1 text-right' : 'ml-1 text-left'}`} htmlFor="password">
              {t('Password')}
            </label>
            <div className="relative" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
              <input
                className={`w-full bg-input-bg border border-transparent text-foreground font-medium py-4 px-12 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-input transition-all placeholder:text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}
                dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                id="password"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none ${i18n.language === 'ar' ? 'right-4' : 'left-4'}`}>
                <span className="material-symbols-outlined">lock</span>
              </div>
              <div 
                className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-primary transition-colors z-10 ${i18n.language === 'ar' ? 'left-4' : 'right-4'}`}
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </div>
            </div>
            <div className={`flex mt-1 ${i18n.language === 'ar' ? 'justify-end' : 'justify-start'}`}>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                {t('Forgot password?')}
              </Link>
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
              {loading ? t('Verifying...') : t('Login')}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
          <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t("Don't have an account? ")}
            <Link to="/signup" className={`text-primary font-bold hover:underline ${i18n.language === 'ar' ? 'mr-1' : 'ml-1'}`}>
              {t('Create new account')}
            </Link>
          </button>
        </div>
      </main>
    </AuthLayout>
  );
}
