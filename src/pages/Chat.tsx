import BottomNav from '../components/BottomNav';

export default function Chat() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-slate-100 antialiased selection:bg-primary selection:text-white h-screen flex flex-col overflow-hidden">
      <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm max-w-md mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#eefcfc] dark:bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">shield</span>
          </div>
          <span className="text-xl font-bold text-text-main dark:text-slate-100">راصد</span>
        </div>
        <h1 className="text-lg font-bold text-text-main dark:text-slate-100">المساعد الذكي</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-6 pb-48 max-w-md mx-auto w-full">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-mint-light flex items-center justify-center text-[#2C7A6B]">
            <span className="material-symbols-outlined text-2xl">smart_toy</span>
          </div>
          <div className="bg-mint-light dark:bg-[#2C3E50] p-4 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm">
            <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-100">
              أهلاً بك! أنا مساعدك الصحي الذكي. كيف يمكنني مساعدتك اليوم؟ يمكنك سؤالي عن أعراض
              الأمراض أو طرق الوقاية.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 flex-row-reverse">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
            <span className="material-symbols-outlined text-2xl">person</span>
          </div>
          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-100">
              ما هي أعراض الكوليرا؟
            </p>
          </div>
        </div>
      </main>

      <div className="fixed bottom-[65px] left-0 right-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md pt-2 max-w-md mx-auto">
        <div className="px-4 mb-3">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            <button className="whitespace-nowrap px-4 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-full text-sm text-text-muted hover:border-primary hover:text-primary transition-colors shadow-sm">
              طرق الوقاية
            </button>
            <button className="whitespace-nowrap px-4 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-full text-sm text-text-muted hover:border-primary hover:text-primary transition-colors shadow-sm">
              أقرب مركز صحي
            </button>
            <button className="whitespace-nowrap px-4 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-full text-sm text-text-muted hover:border-primary hover:text-primary transition-colors shadow-sm">
              أحدث التنبيهات
            </button>
            <button className="whitespace-nowrap px-4 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-full text-sm text-text-muted hover:border-primary hover:text-primary transition-colors shadow-sm">
              أعراض حمى الضنك
            </button>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="bg-white dark:bg-surface-dark rounded-full shadow-lg border border-gray-100 dark:border-gray-800 p-2 flex items-center gap-2">
            <button className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full text-text-muted hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span className="material-symbols-outlined">mic</span>
            </button>
            <input
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-text-main dark:text-white placeholder-gray-400 min-w-0"
              placeholder="اكتب رسالتك هنا..."
              type="text"
            />
            <button className="flex-shrink-0 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full text-sm font-bold transition-colors shadow-md flex items-center gap-1">
              <span>إرسال</span>
              <span className="material-symbols-outlined text-[18px] rotate-180">send</span>
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
