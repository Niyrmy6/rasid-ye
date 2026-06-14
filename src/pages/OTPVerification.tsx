import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { notificationService } from '../lib/notifications';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { getStoredUser, setStoredUser } from '../lib/session';
import AuthLayout from '../components/AuthLayout';

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();
  // Router state carries flow context — no query params so OTP cannot be deep-linked without prior step
  const { phone, fullname, password, email, newPassword, expectedOtp, isPasswordReset, isPhoneChange } = location.state || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 digits
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expectedOtpState, setExpectedOtpState] = useState(expectedOtp);
  const [timer, setTimer] = useState(45);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Direct /verify-otp visits have no phone in state — send back to registration entry or profile editor
  useEffect(() => {
    if (!phone) {
      navigate(isPhoneChange ? '/personal-info' : '/signup');
    }
  }, [phone, navigate, isPhoneChange]);

  // Dismiss all toasts (like the mock WhatsApp notification) when leaving this page
  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Get last char
    setOtp(newOtp);

    // Focus next input automatically
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      setError(t('otp.enter6Digits'));
      return;
    }
    
    // Prototype: OTP returned from `send-whatsapp-otp` is compared client-side.
    // Production should verify server-side only and never expose the code in API responses.
    console.log("Expected OTP:", expectedOtpState);
    console.log("Entered OTP:", enteredOtp);

    if (enteredOtp !== expectedOtpState) {
      setError(t('otp.invalidOtp'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isPasswordReset) {
        // Password already chosen on ForgotPassword — OTP gate before plain-text column update
        const { error: updateError } = await supabase
          .from('user')
          .update({ password: newPassword })
          .eq('phone', phone);
        
        if (updateError) {
          handleError(updateError, { context: 'OTP Password Reset', silent: true });
          setError(t('otp.errorUpdatingPassword'));
        } else {
          toast.dismiss();
          navigate('/login');
        }
      } else if (isPhoneChange) {
        // Retrieve stored user id to identify target row
        const storedUser = getStoredUser();
        if (!storedUser) {
          setError(t("Error: No user found"));
          setLoading(false);
          return;
        }

        const { data, error: updateError } = await supabase
          .from('user')
          .update({ full_name: fullname, phone, password, email: email || null })
          .eq('user_id', storedUser.user_id)
          .select()
          .single();

        if (updateError) {
          handleError(updateError, { context: 'OTP Phone Change Update', silent: true });
          setError(t('forgot.serverError'));
        } else {
          setStoredUser(data);
          toast.dismiss();
          toast.success(t('Saved Successfully'));
          navigate('/personal-info');
        }
      } else {
        // role_id 3 = citizen reporter — matches Login gate (staff roles blocked in app)
        const { data, error: insertError } = await supabase
          .from('user')
          .insert([{ full_name: fullname, phone, password, role_id: 3 }])
          .select()
          .single();

        if (insertError) {
          const errMsg = insertError.message || '';
          const errCode = insertError.code || '';
          // Race: duplicate check on SignUp vs concurrent insert both surface as Postgres 23505
          if (errCode === '23505' || errMsg.includes('duplicate') || errMsg.includes('unique')) {
            setError(t('signup.phoneAlreadyRegistered'));
          } else {
            setError(t('otp.errorCreatingAccount'));
          }
          handleError(insertError, { context: 'OTP Sign Up Insert', silent: true });
        } else {
          setStoredUser(data);
          toast.dismiss();
          navigate('/verification-success');
        }
      }
    } catch (err: any) {
      // Show form-level message for fetch failures; useErrorHandler stays silent to avoid double toast
      if (err instanceof TypeError && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        setError(t('signup.networkError'));
      } else {
        setError(t('otp.serverConnectionFailed'));
      }
      handleError(err, { context: 'OTP handleConfirm Catch', silent: true });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending) return;
    
    setResending(true);
    setError(null);

    try {
      const result = await notificationService.sendOtp(phone);

      if (!result.success) {
        setError(result.error || result.details || t('otp.errorResending'));
      } else {
        setExpectedOtpState(result.otp);
        setTimer(45);
      }
    } catch (err) {
      handleError(err, { context: 'OTP Resend Catch' });
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <main className="flex-1 flex flex-col w-full max-w-md mx-auto px-6 relative z-10">
        <div className="relative w-full h-56 mt-4 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-pastel-green/50 rounded-full scale-90 blur-3xl opacity-60"></div>
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <div className="w-40 h-40 bg-pastel-green rounded-[2.5rem] flex items-center justify-center relative border-4 border-white shadow-soft transform rotate-3">
              <span className="material-symbols-outlined filled text-primary" style={{ fontSize: '5.5rem' }}>
                lock_person
              </span>
              <div className="absolute -right-6 top-10 bg-white p-3 rounded-2xl text-accent-yellow shadow-lg transform -rotate-12 border-2 border-slate-50">
                <span className="material-symbols-outlined text-2xl">key</span>
              </div>
              <div className="absolute -left-4 bottom-4 bg-primary p-2 rounded-xl text-white shadow-lg transform rotate-6 border-2 border-white">
                <span className="material-symbols-outlined text-xl">verified_user</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-foreground text-3xl font-extrabold tracking-tight mb-3">{t('otp.title')}</h1>
          <p className="text-muted-foreground text-lg leading-relaxed font-medium">
            {t('otp.subtitle')}
            <br />
            <span className="text-foreground font-bold mt-1 block" dir="ltr">
              {phone || ''}
            </span>
          </p>
          {error && <p className="text-red-500 font-bold mt-4 animate-pulse">{error}</p>}
        </div>

        <div className="flex justify-center gap-2 mb-8" dir="ltr">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-bold bg-card border-2 border-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm text-foreground placeholder-transparent"
              maxLength={1}
              placeholder="0"
              type="text"
            />
          ))}
        </div>

        <div className="flex flex-col gap-4 mb-8 w-full mt-auto pb-8">
          <div className="text-center text-sm font-semibold text-muted-foreground mb-2">
            {t('otp.didNotReceive')}{' '}
            <button 
              onClick={handleResend}
              disabled={timer > 0 || resending}
              className={`font-bold transition-colors ${timer > 0 || resending ? 'text-muted-foreground cursor-not-allowed' : 'text-primary hover:text-primary-dark'}`}
            >
              {resending ? t('chat.loading') : t('otp.resend')}
            </button>{' '}
            {timer > 0 && <span className="text-muted-foreground font-normal">(00:{timer.toString().padStart(2, '0')})</span>}
          </div>
          <div className="relative w-full group">
            <div className="absolute -inset-1 bg-primary/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="relative w-full bg-primary hover:bg-primary-dark text-white text-xl font-bold py-5 px-8 rounded-2xl shadow-lg shadow-primary/30 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? t('forgot.updating') : t('otp.confirmBtn')}
              <span className="material-symbols-outlined text-2xl">check_circle</span>
            </button>
          </div>
        </div>
      </main>
    </AuthLayout>
  );
}
