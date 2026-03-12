import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function SignUp() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/verify-otp');
  };

  return (
    <div className="bg-background-light text-foreground min-h-screen flex flex-col font-display overflow-x-hidden selection:bg-primary selection:text-white">
      <nav className="flex items-center justify-between px-6 py-5 sticky top-0 z-50 bg-background-light/95 backdrop-blur-sm transition-colors duration-300">
        <div className="flex items-center gap-2">
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
            <span className="material-symbols-outlined text-xl rotate-180">arrow_forward</span>
          </button>
        </div>
      </nav>

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

              <div className="flex flex-col items-center relative -z-10 transform -translate-y-2">
                <div className="w-11 h-11 bg-mint-light rounded-full border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                  <span className="material-symbols-outlined text-3xl text-primary mt-1">
                    medical_services
                  </span>
                </div>
                <div className="w-14 h-12 bg-primary/20 rounded-t-2xl mt-[-4px] flex justify-center">
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
          <h1 className="text-foreground text-3xl font-extrabold tracking-tight">إنشاء حساب جديد</h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium">انضم إلى مجتمع راصد</p>
        </div>

        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-foreground font-bold text-sm mr-1 block" htmlFor="fullname">
              الاسم الكامل
            </label>
            <div className="relative">
              <input
                className="w-full bg-input-bg border-0 text-foreground text-right font-medium py-4 px-5 pr-12 rounded-2xl focus:ring-2 focus:ring-primary/50 shadow-input transition-all placeholder:text-muted-foreground"
                dir="rtl"
                id="fullname"
                placeholder="الاسم الكامل"
                type="text"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <span className="material-symbols-outlined">person</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-foreground font-bold text-sm mr-1 block" htmlFor="phone">
              رقم الهاتف
            </label>
            <div className="relative">
              <input
                className="w-full bg-input-bg border-0 text-foreground text-right font-medium py-4 px-5 pr-12 rounded-2xl focus:ring-2 focus:ring-primary/50 shadow-input transition-all placeholder:text-muted-foreground"
                dir="rtl"
                id="phone"
                placeholder="77xxxxxxx"
                type="tel"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <span className="material-symbols-outlined">smartphone</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-foreground font-bold text-sm mr-1 block" htmlFor="password">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                className="w-full bg-input-bg border-0 text-foreground text-right font-medium py-4 px-5 pr-12 pl-12 rounded-2xl focus:ring-2 focus:ring-primary/50 shadow-input transition-all placeholder:text-muted-foreground"
                dir="rtl"
                id="password"
                placeholder="••••••••"
                type="password"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <span className="material-symbols-outlined">lock</span>
              </div>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                <span className="material-symbols-outlined">visibility_off</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              className="w-full bg-primary hover:bg-primary-dark text-white text-lg font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary/30 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center"
              type="submit"
            >
              إنشاء حساب
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-primary font-bold hover:underline mr-1">
              تسجيل الدخول
            </Link>
          </button>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-card to-transparent pointer-events-none z-0"></div>
    </div>
  );
}
