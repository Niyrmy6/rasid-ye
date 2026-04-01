import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      setError(t('Please enter phone number and password'));
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const fullPhone = phone.startsWith('+967') ? phone : `+967${phone.replace(/^0+/, '')}`;

      const { data, error: supaError } = await supabase
        .from('user')
        .select('*')
        .eq('phone', fullPhone)
        .eq('password', password)
        .maybeSingle();

      if (supaError) {
        console.error('Supabase Login Error:', supaError);
        setError(`${t('Error: ')}${supaError.message || t('An unexpected error occurred')}`);
      } else if (!data) {
        setError(t('Incorrect phone number or password'));
      } else {
        if (data.role_id === 3) {
          localStorage.setItem('user', JSON.stringify(data));
          navigate('/news');
        } else {
          setError(t('Sorry, this app is for reporters only. Staff interface is not available here.'));
        }
      }
    } catch (err) {
      setError(t('Error connecting to server'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light text-foreground min-h-screen flex flex-col font-display overflow-x-hidden selection:bg-primary selection:text-white">
      <nav className="flex items-center justify-between px-6 py-5 sticky top-0 z-50 bg-background-light/95 backdrop-blur-sm transition-colors duration-300">
        <div className={`flex items-center gap-2 ${i18n.language === 'ar' ? '' : 'order-1 flex-row'}`}>
          <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
            <span className="material-symbols-outlined text-xl">shield</span>
          </div>
          <h2 className="text-foreground text-lg font-bold tracking-tight">{t('Rasid')}</h2>
        </div>
        <div className={`flex items-center gap-2 ${i18n.language === 'ar' ? '' : 'order-2 flex-row-reverse'}`}>
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted hover:bg-muted text-muted-foreground transition-colors"
          >
            <span className={`material-symbols-outlined text-xl ${i18n.language === 'ar' ? '' : 'rotate-180'}`}>arrow_back</span>
          </button>
        </div>
      </nav>

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
                  placeholder="77xxxxxxx"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
            {error && <p className="text-red-500 text-sm font-bold text-center mb-4">{error}</p>}
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

      <div className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent pointer-events-none z-0"></div>
    </div>
  );
}
