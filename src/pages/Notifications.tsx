import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function Notifications() {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light text-text-main antialiased selection:bg-primary selection:text-white h-screen flex flex-col overflow-hidden">
      <header className="sticky top-0 z-40 bg-background-light/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm border-b border-gray-100 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 order-1">
          <div className="w-10 h-10 bg-[#eefcfc] rounded-xl flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">shield</span>
          </div>
          <span className="text-xl font-bold text-text-main">راصد</span>
        </div>
        <div className="flex items-center gap-3 order-2">
          <h1 className="text-lg font-bold text-text-main">التنبيهات</h1>
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-text-main">arrow_back</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 max-w-md mx-auto w-full">
        <div className="px-4 pt-6">
          <h2 className="text-sm font-bold text-text-muted mb-3 px-1">اليوم</h2>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group active:scale-[0.99] transition-all cursor-pointer">
              <div className="absolute top-0 right-0 w-1 h-full bg-red-500"></div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="material-symbols-outlined text-red-600 filled">warning</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold font-almarai text-text-main text-base leading-snug">تنبيه عاجل: زيادة حالات الكوليرا في منطقتك</h3>
                  </div>
                  <p className="text-xs text-text-muted mt-2">منذ ١٠ دقائق</p>
                </div>
              </div>
            </div>

            <div 
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative group active:scale-[0.99] transition-all cursor-pointer"
              onClick={() => navigate('/report-details')}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="material-symbols-outlined text-orange-600">sync_alt</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold font-almarai text-text-main text-base leading-snug mb-1">تم تحديث حالة بلاغك #٨٤٣٥</h3>
                  <p className="text-sm text-gray-600 mb-2">تم استلام البلاغ وجاري العمل على معالجته من قبل الفريق المختص.</p>
                  <p className="text-xs text-text-muted">منذ ساعتين</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pt-6">
          <h2 className="text-sm font-bold text-text-muted mb-3 px-1">سابقاً</h2>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative group active:scale-[0.99] transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="material-symbols-outlined text-blue-600">info</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold font-almarai text-text-main text-base leading-snug mb-1">إرشادات جديدة للوقاية من حمى الضنك</h3>
                  <p className="text-sm text-gray-600 mb-2">تعرف على أحدث الطرق لحماية نفسك وعائلتك.</p>
                  <p className="text-xs text-text-muted">أمس</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative group active:scale-[0.99] transition-all cursor-pointer opacity-75">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="material-symbols-outlined text-green-600">check_circle</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold font-almarai text-text-main text-base leading-snug mb-1">تم إغلاق البلاغ #٨٢٠١</h3>
                  <p className="text-xs text-text-muted">منذ ٣ أيام</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
