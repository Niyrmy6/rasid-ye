import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function ReportSuccess() {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light text-text-main antialiased selection:bg-primary selection:text-white h-screen flex flex-col overflow-hidden">
      <header className="sticky top-0 z-40 bg-background-light/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm border-b border-gray-100 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 order-1">
          <div className="w-10 h-10 bg-[#eefcfc] rounded-xl flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 0" }}>shield</span>
          </div>
          <span className="text-xl font-bold text-text-main font-almarai">راصد</span>
        </div>
        <div className="flex items-center gap-2 order-2">
          <h1 className="text-lg font-bold text-text-main font-almarai">نجاح الإرسال</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto w-full">
        <div className="w-full max-w-sm mx-auto flex flex-col items-center space-y-6">
          <div className="relative w-64 h-64 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 bg-green-50 rounded-full scale-110 animate-pulse opacity-50"></div>
            <div className="bg-[#e0f5f0] rounded-full w-48 h-48 flex items-center justify-center shadow-sm relative z-10">
              <span className="material-symbols-outlined text-[120px] text-primary filled">check_circle</span>
              <div className="absolute -top-4 -right-4 text-yellow-400 transform rotate-12">
                <span className="material-symbols-outlined text-4xl filled">celebration</span>
              </div>
              <div className="absolute -bottom-2 -left-4 text-blue-300 transform -rotate-12">
                <span className="material-symbols-outlined text-3xl filled">star</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold font-almarai text-gray-900">تم إرسال البلاغ بنجاح!</h2>
            <p className="text-gray-500 leading-relaxed max-w-xs mx-auto text-base">
              شكراً لمساهمتك في حماية مجتمعك. تم استلام بلاغك وهو الآن قيد المراجعة. يمكنك تتبع حالة البلاغ من قسم بلاغاتي.
            </p>
          </div>

          <div className="bg-white w-full rounded-2xl p-4 border border-dashed border-gray-300 shadow-sm flex flex-col items-center justify-center gap-1 mt-4">
            <span className="text-xs text-text-muted font-bold tracking-wide uppercase">رقم المرجع</span>
            <span className="text-3xl font-bold text-primary font-almarai tracking-wider">#٨٤٣٥</span>
          </div>

          <div className="w-full space-y-3 pt-6">
            <button 
              onClick={() => navigate('/report-details')}
              className="w-full bg-primary hover:bg-primary-dark text-white p-4 rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-almarai font-bold text-lg"
            >
              <span>تتبع حالة البلاغ</span>
            </button>
            <button 
              onClick={() => navigate('/news')}
              className="w-full bg-transparent border-2 border-primary text-primary hover:bg-green-50 p-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-almarai font-bold text-lg"
            >
              <span>العودة للرئيسية</span>
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
