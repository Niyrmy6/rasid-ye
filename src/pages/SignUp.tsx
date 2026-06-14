import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { notificationService } from '../lib/notifications';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { validateYemenPhone } from '../lib/phoneValidation';
import AuthLayout from '../components/AuthLayout';

export default function SignUp() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullname.trim() || !phone.trim() || !password) {
      setError(t('Please fill all fields'));
      return;
    }

    if (fullname.trim().length < 2) {
      setError(t('signup.nameMinLength'));
      return;
    }

    const nameParts = fullname.trim().split(/\s+/);
    if (nameParts.length < 4) {
      setError(t('signup.nameQuadrupleRequired'));
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

      // Fail fast before WhatsApp OTP cost if phone already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('user')
        .select('user_id')
        .eq('phone', fullPhone)
        .maybeSingle();

      if (checkError) {
        handleError(checkError, { context: 'SignUp Check Existing User' });
        return;
      }

      if (existingUser) {
        setError(t('signup.phoneAlreadyRegistered'));
        return;
      }

      const result = await notificationService.sendOtp(fullPhone);

      if (!result.success) {
        const detail = result.error || result.details || '';
        if (detail.includes('Failed to fetch') || detail.includes('NetworkError') || detail.includes('net::ERR') || detail.includes('Network Error')) {
          setError(t('signup.networkError'));
        } else if (detail.includes('rate') || detail.includes('limit')) {
          setError(t('signup.tooManyAttempts'));
        } else {
          setError(t('signup.otpSendFailed'));
        }
        if (detail) {
          handleError(new Error(detail), { context: 'SignUp OTP function', silent: true });
        }
        return;
      }

      navigate('/verify-otp', {
        state: { phone: fullPhone, fullname: fullname.trim(), password, expectedOtp: result.otp },
      });
    } catch (err) {
      if (err instanceof TypeError && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        setError(t('signup.networkError'));
      } else {
        setError(t('signup.unexpectedError'));
      }
      handleError(err, { context: 'SignUp Catch Block', silent: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout footerGradient="bg-gradient-to-t from-card to-transparent">
      <main className="flex-1 flex flex-col w-full max-w-md mx-auto px-6 pb-8 relative z-10 justify-center">
        <div className="relative w-full h-64 mb-6 flex items-end justify-center">
          <div className="absolute top-4 left-1/4 w-32 h-32 bg-pastel-green rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-4 right-1/4 w-32 h-32 bg-pastel-purple rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-8 left-1/3 w-24 h-24 bg-pastel-yellow rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>

          <div className="relative w-full max-w-[280px] h-[200px] flex items-end justify-center">
            <div className="absolute bottom-0 w-64 h-48 dome-shape z-20 border-t border-white/50 overflow-hidden flex items-start justify-center pt-2">
              <div className="w-8 h-1 bg-white/40 rounded-full"></div>
            </div>

            <div className="absolute -top-4 z-30 bg-white p-2 rounded-full shadow-md border-2 border-pastel-green">
              <span className="material-symbols-outlined text-2xl text-primary font-bold">
                security
              </span>
            </div>

            <div className="relative z-10 flex items-end justify-center -space-x-3 space-x-reverse mb-1">
              <div className="flex flex-col items-center transform translate-y-2 scale-90 opacity-90">
                <div className="w-10 h-10 bg-pastel-purple rounded-full border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                  <span className="material-symbols-outlined text-2xl text-accent-purple/70 mt-1">
                    face_6
                  </span>
                </div>
                <div className="w-12 h-10 bg-accent-purple/20 rounded-t-2xl mt-[-4px]"></div>
              </div>

              <div className="flex flex-col items-center relative z-20 transform -translate-y-4">
                <div className="w-16 h-16 bg-mint-light rounded-full border-2 border-white shadow-lg flex items-center justify-center overflow-hidden">
                  <span className="material-symbols-outlined text-4xl text-primary mt-2 filled">
                    person
                  </span>
                </div>
                <div className="w-20 h-16 bg-primary/20 rounded-t-3xl mt-[-6px] flex justify-center">
                  <div className="w-1 h-full bg-white/40"></div>
                </div>
              </div>

              <div className="flex flex-col items-center z-10">
                <div className="w-12 h-12 bg-pastel-yellow rounded-full border-2 border-white shadow-md flex items-center justify-center overflow-hidden">
                  <span className="material-symbols-outlined text-3xl text-accent-yellow/70 mt-2">
                    face_3
                  </span>
                </div>
                <div className="w-16 h-14 bg-accent-yellow/20 rounded-t-3xl mt-[-5px] flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center mt-[-10px]">
                    <span className="material-symbols-outlined text-white text-sm">favorite</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center transform translate-y-2 scale-90 opacity-90">
                <div className="w-10 h-10 bg-pastel-green rounded-full border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                  <span className="material-symbols-outlined text-2xl text-accent-green/70 mt-1">
                    face_5
                  </span>
                </div>
                <div className="w-12 h-10 bg-accent-green/20 rounded-t-2xl mt-[-4px]"></div>
              </div>
            </div>

            <div className="absolute bottom-0 w-56 h-4 bg-primary/10 rounded-[100%] blur-sm z-0"></div>

            <div className="absolute top-10 left-0 animate-bounce" style={{ animationDuration: '4s' }}>
              <div className="bg-white/80 p-1 rounded-full shadow-sm">
                <span className="material-symbols-outlined text-accent-blue text-sm">
                  health_and_safety
                </span>
              </div>
            </div>
            <div className="absolute top-16 right-2 animate-pulse">
              <div className="bg-white/80 p-1 rounded-full shadow-sm">
                <span className="material-symbols-outlined text-accent-pink text-sm text-[var(--color-error-soft, #f87171)]">
                  volunteer_activism
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-foreground text-3xl font-extrabold tracking-tight">{t('Create New Account')}</h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium">{t('Join Rasid community')}</p>
        </div>

        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className={`text-foreground font-bold text-sm block ${i18n.language === 'ar' ? 'mr-1 text-right' : 'ml-1 text-left'}`} htmlFor="fullname">
              {t('Full Name')}
            </label>
            <div className="relative" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
              <input
                className={`w-full bg-input-bg border border-transparent text-foreground font-medium py-4 px-12 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-input transition-all placeholder:text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}
                dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                id="fullname"
                placeholder={t('Full Name')}
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
              <div className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none ${i18n.language === 'ar' ? 'right-4' : 'left-4'}`}>
                <span className="material-symbols-outlined">person</span>
              </div>
            </div>
          </div>

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
                    // السماح فقط بالأرقام
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
            <p className={`text-xs text-muted-foreground ${i18n.language === 'ar' ? 'mr-1' : 'ml-1'}`}>
              {t('signup.passwordHint')}
            </p>
          </div>

          <div className="pt-4">
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
              {loading ? t('Sending...') : t('Create Account')}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
          <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t("Already have an account? ")}
            <Link to="/login" className={`text-primary font-bold hover:underline ${i18n.language === 'ar' ? 'mr-1' : 'ml-1'}`}>
              {t('Login')}
            </Link>
          </button>
        </div>
      </main>
    </AuthLayout>
  );
}
