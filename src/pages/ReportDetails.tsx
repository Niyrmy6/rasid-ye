import { useNavigate } from 'react-router-dom';

export default function ReportDetails() {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light text-text-main antialiased selection:bg-primary selection:text-white h-screen flex flex-col overflow-hidden">
      <header className="sticky top-0 z-40 bg-background-light/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm max-w-md mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center text-primary border border-primary/20">
            <span className="material-symbols-outlined text-[24px]">shield</span>
          </div>
          <span className="text-xl font-extrabold text-black tracking-wide">راصد</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-text-main">تفاصيل البلاغ</h1>
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-text-main">arrow_back</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-6 max-w-md mx-auto w-full">
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-600 shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[24px]">pending_actions</span>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-1">حالة البلاغ</h2>
            <p className="text-lg font-bold text-gray-900">قيد المراجعة</p>
          </div>
        </div>

        <div className="bg-surface-light rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-text-main mb-1">اشتباه حالة كوليرا</h3>
              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-medium">#٨٤٣٥</span>
            </div>
          </div>
          <div className="h-px bg-gray-100"></div>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-text-muted mt-0.5 text-[20px]">calendar_today</span>
              <div>
                <p className="text-xs text-text-muted mb-0.5">تاريخ البلاغ</p>
                <p className="text-sm font-medium text-text-main">١٢ فبراير ٢٠٢٤ - ٠٩:٠٠ م</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-text-muted mt-0.5 text-[20px]">location_on</span>
              <div>
                <p className="text-xs text-text-muted mb-0.5">الموقع</p>
                <p className="text-sm font-medium text-text-main">صنعاء، حي الأصبحي</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-light rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-text-main mb-6">مسار المعالجة</h3>
          <div className="relative pr-2">
            <div className="relative flex items-start gap-4 pb-8 group">
              <div className="absolute top-8 right-[11px] h-[calc(100%-8px)] w-0.5 bg-primary/30"></div>
              <div className="relative z-10 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white ring-4 ring-white">
                <span className="material-symbols-outlined text-[14px] font-bold">check</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-text-main">تم الاستلام</h4>
                <p className="text-xs text-text-muted mt-1">تم استلام بلاغك بنجاح</p>
              </div>
            </div>
            <div className="relative flex items-start gap-4 pb-8 group">
              <div className="absolute top-8 right-[11px] h-[calc(100%-8px)] w-0.5 bg-gray-200"></div>
              <div className="relative z-10 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center ring-4 ring-white">
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h4 className="font-bold text-sm text-text-main">قيد المراجعة</h4>
                <p className="text-xs text-text-muted mt-1">جاري مراجعة البيانات المرفقة</p>
              </div>
            </div>
            <div className="relative flex items-start gap-4 pb-8 group">
              <div className="absolute top-8 right-[11px] h-[calc(100%-8px)] w-0.5 bg-gray-200"></div>
              <div className="relative z-10 w-6 h-6 rounded-full bg-gray-100 border-2 border-gray-200 ring-4 ring-white"></div>
              <div>
                <h4 className="font-bold text-sm text-gray-400">التحقق الميداني</h4>
              </div>
            </div>
            <div className="relative flex items-start gap-4 group">
              <div className="relative z-10 w-6 h-6 rounded-full bg-gray-100 border-2 border-gray-200 ring-4 ring-white"></div>
              <div>
                <h4 className="font-bold text-sm text-gray-400">اكتمال البلاغ</h4>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background-light/95 backdrop-blur-md p-4 border-t border-gray-200 max-w-md mx-auto">
        <button 
          onClick={() => navigate('/contact')}
          className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold text-base transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">support_agent</span>
          تواصل مع الدعم
        </button>
      </div>
    </div>
  );
}
