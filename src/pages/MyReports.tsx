import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function MyReports() {
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="bg-background-light text-text-main antialiased selection:bg-primary selection:text-white h-screen flex flex-col overflow-hidden">
      <header className="sticky top-0 z-40 bg-background-light/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm border-b border-gray-100 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#eefcfc] rounded-xl flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">shield</span>
          </div>
          <span className="text-xl font-bold text-text-main">راصد</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-text-main">بلاغاتي</h1>
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-text-main">arrow_back</span>
          </button>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto pb-32 max-w-md mx-auto w-full">
        <div className="px-4 py-4 sticky top-0 bg-background-light z-30">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input 
              className="block w-full pr-10 pl-10 py-2.5 bg-white border-none ring-1 ring-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary shadow-sm text-text-main placeholder-gray-400 transition-shadow" 
              placeholder="البحث في البلاغات أو تصفية الحالة..." 
              type="text"
            />
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center text-gray-400 hover:text-primary"
              >
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </button>
            </div>
            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg ring-1 ring-black/5 overflow-hidden z-40">
                <div className="p-1">
                  <button onClick={() => setIsFilterOpen(false)} className="w-full text-right px-3 py-2 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2">
                    الكل
                  </button>
                  <button onClick={() => setIsFilterOpen(false)} className="w-full text-right px-3 py-2 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    تم التحقق
                  </button>
                  <button onClick={() => setIsFilterOpen(false)} className="w-full text-right px-3 py-2 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    قيد المراجعة
                  </button>
                  <button onClick={() => setIsFilterOpen(false)} className="w-full text-right px-3 py-2 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    مستلم
                  </button>
                  <button onClick={() => setIsFilterOpen(false)} className="w-full text-right px-3 py-2 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    مرفوض
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 transition-transform active:scale-[0.99] cursor-pointer" onClick={() => navigate('/report-details')}>
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-base text-gray-900 font-almarai">اشتباه حالة كوليرا</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                تم التحقق
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-xs text-text-muted">
                <span className="material-symbols-outlined text-[16px] ml-1.5">calendar_today</span>
                <span dir="ltr">١٢ فبراير ٢٠٢٤ - ٠٩:٠٠ م</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-400 font-mono tracking-wider">#٨٤٣٥</span>
                <button className="text-primary text-xs font-bold flex items-center gap-1 hover:text-primary-dark">
                  التفاصيل
                  <span className="material-symbols-outlined text-[14px] rotate-180">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 transition-transform active:scale-[0.99] cursor-pointer" onClick={() => navigate('/report-details')}>
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-base text-gray-900 font-almarai">تفشي حمى الضنك</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                قيد المراجعة
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-xs text-text-muted">
                <span className="material-symbols-outlined text-[16px] ml-1.5">calendar_today</span>
                <span dir="ltr">١٠ فبراير ٢٠٢٤ - ٠٢:١٥ م</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-400 font-mono tracking-wider">#٨٤٢٠</span>
                <button className="text-primary text-xs font-bold flex items-center gap-1 hover:text-primary-dark">
                  التفاصيل
                  <span className="material-symbols-outlined text-[14px] rotate-180">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 transition-transform active:scale-[0.99] cursor-pointer" onClick={() => navigate('/report-details')}>
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-base text-gray-900 font-almarai">تلوث مياه شرب</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                مستلم
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-xs text-text-muted">
                <span className="material-symbols-outlined text-[16px] ml-1.5">calendar_today</span>
                <span dir="ltr">٠٨ فبراير ٢٠٢٤ - ١١:٣٠ ص</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-400 font-mono tracking-wider">#٨٤٠١</span>
                <button className="text-primary text-xs font-bold flex items-center gap-1 hover:text-primary-dark">
                  التفاصيل
                  <span className="material-symbols-outlined text-[14px] rotate-180">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 transition-transform active:scale-[0.99] opacity-75 cursor-pointer" onClick={() => navigate('/report-details')}>
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-base text-gray-900 font-almarai">بلاغ تجريبي</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                مرفوض
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-xs text-text-muted">
                <span className="material-symbols-outlined text-[16px] ml-1.5">calendar_today</span>
                <span dir="ltr">٠١ فبراير ٢٠٢٤ - ٠٨:٠٠ ص</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-400 font-mono tracking-wider">#٨٣٩٠</span>
                <button className="text-primary text-xs font-bold flex items-center gap-1 hover:text-primary-dark">
                  التفاصيل
                  <span className="material-symbols-outlined text-[14px] rotate-180">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 transition-transform active:scale-[0.99] cursor-pointer" onClick={() => navigate('/report-details')}>
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-base text-gray-900 font-almarai">حالة تسمم غذائي جماعي</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                تم التحقق
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-xs text-text-muted">
                <span className="material-symbols-outlined text-[16px] ml-1.5">calendar_today</span>
                <span dir="ltr">٢٥ يناير ٢٠٢٤ - ٠٦:٤٥ م</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-400 font-mono tracking-wider">#٨٢٥٥</span>
                <button className="text-primary text-xs font-bold flex items-center gap-1 hover:text-primary-dark">
                  التفاصيل
                  <span className="material-symbols-outlined text-[14px] rotate-180">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-20 left-0 right-0 z-40 max-w-md mx-auto px-4 pointer-events-none">
        <div className="flex justify-end w-full pointer-events-auto">
          <button 
            onClick={() => navigate('/new-report')}
            className="bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-2xl shadow-lg shadow-primary/30 flex items-center gap-2 transition-all active:scale-95 font-almarai font-bold text-sm"
          >
            <span className="material-symbols-outlined text-[22px]">add_circle</span>
            تقديم بلاغ جديد
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
