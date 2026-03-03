import { useNavigate } from 'react-router-dom';

export default function OTPVerification() {
  const navigate = useNavigate();

  const handleConfirm = () => {
    navigate('/verification-success');
  };

  return (
    <div className="bg-background-light text-slate-800 min-h-screen flex flex-col font-display overflow-x-hidden selection:bg-primary selection:text-white">
      <nav className="flex items-center justify-between px-6 py-5 sticky top-0 z-50 bg-background-light/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <span className="material-symbols-outlined text-2xl">shield</span>
          </div>
          <h2 className="text-slate-800 text-lg font-bold tracking-tight">راصد</h2>
        </div>
        <div className="relative">
          <button
            onClick={() => navigate(-1)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all duration-300 p-2 rounded-xl group"
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
          <h1 className="text-slate-800 text-3xl font-extrabold tracking-tight mb-3">رمز التحقق</h1>
          <p className="text-slate-500 text-lg leading-relaxed font-medium">
            تم إرسال رمز التحقق إلى رقم هاتفك
            <br />
            <span className="text-slate-800 font-bold mt-1 block" dir="ltr">
              +967 770 000 000
            </span>
          </p>
        </div>

        <div className="flex justify-center gap-3 mb-8" dir="ltr">
          {[1, 2, 3, 4].map((i) => (
            <input
              key={i}
              className="w-16 h-16 text-center text-2xl font-bold bg-white border-2 border-slate-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm text-slate-700 placeholder-transparent"
              maxLength={1}
              placeholder="0"
              type="number"
            />
          ))}
        </div>

        <div className="flex flex-col gap-4 mb-8 w-full mt-auto pb-8">
          <div className="text-center text-sm font-semibold text-slate-500 mb-2">
            لم يصلك الرمز؟{' '}
            <button className="text-primary hover:text-primary-dark transition-colors font-bold">
              إعادة الإرسال
            </button>{' '}
            <span className="text-slate-400 font-normal">(00:45)</span>
          </div>
          <div className="relative w-full group">
            <div className="absolute -inset-1 bg-primary/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <button
              onClick={handleConfirm}
              className="relative w-full bg-primary hover:bg-primary-dark text-white text-xl font-bold py-5 px-8 rounded-2xl shadow-lg shadow-primary/30 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-3"
            >
              تأكيد
              <span className="material-symbols-outlined text-2xl">check_circle</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
