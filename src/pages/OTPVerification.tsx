import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { phone, fullname, password, newPassword, expectedOtp, isPasswordReset } = location.state || {}; // From SignUp or ForgotPassword page

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

  useEffect(() => {
    if (!phone) {
      navigate('/signup');
    }
  }, [phone, navigate]);

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
      setError('يرجى إدخال الرمز المكون من 6 أرقام');
      return;
    }
    
    // In a real app, do secure verification via backend... but for demo matching locally:
    if (enteredOtp !== expectedOtpState) {
      setError('رمز التحقق غير صحيح، حاول مرة أخرى');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isPasswordReset) {
        // Handle Password Reset Logic
        const { error: updateError } = await supabase
          .from('user')
          .update({ password: newPassword })
          .eq('phone', phone);
        
        if (updateError) {
          setError('حدث خطأ أثناء تحديث كلمة المرور.');
        } else {
          // Password reset success -> go back to login with success message ideally, or just redirect
          navigate('/login'); 
        }
      } else {
        // Handle Normal Sign Up Logic
        const { data, error: insertError } = await supabase
          .from('user')
          .insert([{ full_name: fullname, phone, password, role_id: 3 }])
          .select()
          .single();

        if (insertError) {
          console.error('Insert user error:', insertError);
          setError('حدث خطأ أثناء إنشاء الحساب، قد يكون رقم الهاتف مستخدماً بالفعل.');
        } else {
          localStorage.setItem('user', JSON.stringify(data));
          navigate('/verification-success');
        }
      }
    } catch (err) {
      console.error(err);
      setError('فشل الاتصال بالخادم، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending) return;
    
    setResending(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('send-whatsapp-otp', {
        body: { phone }
      });

      if (funcError || !data?.success) {
        setError(data?.error || data?.details || 'حدث خطأ أثناء إعادة الإرسال.');
      } else {
        setExpectedOtpState(data.otp);
        setTimer(45); // Reset timer
        // Optionally show success message
      }
    } catch (err) {
      setError('فشل الاتصال بالخادم، يرجى المحاولة لاحقاً');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-background-light text-foreground min-h-screen flex flex-col font-display overflow-x-hidden selection:bg-primary selection:text-white">
      <nav className="flex items-center justify-between px-6 py-5 sticky top-0 z-50 bg-background-light/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <span className="material-symbols-outlined text-2xl">shield</span>
          </div>
          <h2 className="text-foreground text-lg font-bold tracking-tight">راصد</h2>
        </div>
        <div className="relative">
          <button
            onClick={() => navigate(-1)}
            className="bg-muted hover:bg-muted text-muted-foreground transition-all duration-300 p-2 rounded-xl group"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col w-full max-w-md mx-auto px-6 relative z-10">
        <div className="relative w-full h-56 mt-4 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-pastel-green/50 rounded-full scale-90 blur-3xl opacity-60"></div>
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <div className="w-40 h-40 bg-pastel-green rounded-[2.5rem] flex items-center justify-center relative border-4 border-white shadow-soft transform rotate-3">
              <span className="material-symbols-outlined filled text-[7rem] text-primary">
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
          <h1 className="text-foreground text-3xl font-extrabold tracking-tight mb-3">رمز التحقق</h1>
          <p className="text-muted-foreground text-lg leading-relaxed font-medium">
            تم إرسال رمز التحقق إلى رقم هاتفك
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
            لم يصلك الرمز؟{' '}
            <button 
              onClick={handleResend}
              disabled={timer > 0 || resending}
              className={`font-bold transition-colors ${timer > 0 || resending ? 'text-muted-foreground cursor-not-allowed' : 'text-primary hover:text-primary-dark'}`}
            >
              {resending ? 'جاري الإرسال...' : 'إعادة الإرسال'}
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
              {loading ? 'جاري التحقق...' : 'تأكيد'}
              <span className="material-symbols-outlined text-2xl">check_circle</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
