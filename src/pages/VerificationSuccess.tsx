import { useNavigate } from 'react-router-dom';

export default function VerificationSuccess() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/news');
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
            <span className="material-symbols-outlined text-2xl rotate-180">
              arrow_forward
            </span>
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col w-full max-w-md mx-auto px-6 relative z-10 justify-center">
        <div className="relative w-full h-64 mt-4 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-pastel-green/50 rounded-full scale-110 blur-3xl opacity-60"></div>
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <div className="w-48 h-48 bg-pastel-green rounded-full flex items-center justify-center relative border-8 border-white shadow-soft">
              <span className="material-symbols-outlined filled text-[8rem] text-primary">
                check_circle
              </span>
              <div className="absolute -right-4 top-0 text-accent-yellow transform rotate-12">
                <span className="material-symbols-outlined text-3xl">star</span>
              </div>
              <div className="absolute -left-2 bottom-8 text-accent-purple transform -rotate-12">
                <span className="material-symbols-outlined text-2xl">celebration</span>
              </div>
              <div className="absolute right-8 bottom-0 text-pastel-pink bg-white rounded-full p-1 shadow-sm">
                <span className="material-symbols-outlined text-xl text-primary">favorite</span>
              </div>
              <div className="absolute left-4 top-4 text-accent-green transform rotate-45 opacity-60">
                <span className="material-symbols-outlined text-4xl">pentagon</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-slate-800 text-3xl font-extrabold tracking-tight mb-4">
            تم التحقق بنجاح!
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed font-medium px-4">
            لقد تم تأمين حسابك بنجاح. يمكنك الآن البدء في استخدام كافة مميزات المنصة.
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-8 w-full mt-auto pb-8">
          <div className="relative w-full group">
            <div className="absolute -inset-1 bg-primary/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <button
              onClick={handleStart}
              className="relative w-full bg-primary hover:bg-primary-dark text-white text-xl font-bold py-5 px-8 rounded-2xl shadow-lg shadow-primary/30 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-3"
            >
              ابدأ الآن
              <span className="material-symbols-outlined text-2xl">check</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
