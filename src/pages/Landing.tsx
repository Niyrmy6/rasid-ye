import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function Landing() {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const interval = setInterval(() => {
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      const isRtl = window.getComputedStyle(carousel).direction === 'rtl';
      const currentScroll = Math.abs(carousel.scrollLeft);
      
      if (currentScroll >= maxScroll - 10) {
        carousel.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carousel.scrollBy({ left: isRtl ? -300 : 300, behavior: 'smooth' });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-background-light text-slate-800 min-h-screen flex flex-col font-display overflow-x-hidden selection:bg-primary selection:text-white pb-12">
      <nav className="flex items-center justify-between px-6 py-5 sticky top-0 z-50 bg-background-light/95 backdrop-blur-sm transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <span className="material-symbols-outlined text-2xl">shield</span>
          </div>
          <h2 className="text-slate-800 text-lg font-bold tracking-tight">راصد</h2>
        </div>
        <div className="relative">
          <div className="absolute -inset-1 bg-primary/30 rounded-xl blur-sm animate-pulse"></div>
          <div className="absolute inset-0 bg-primary/40 rounded-xl animate-ring-glow -z-10"></div>
          <Link
            to="/login"
            className="relative bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20 transition-all duration-300 transform active:scale-95 text-sm font-bold flex items-center gap-2 px-4 py-2.5 rounded-xl group overflow-hidden animate-soft-pulse"
          >
            <span className="absolute inset-0 bg-white/20 rounded-xl animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
            الإبلاغ الآن
            <span className="material-symbols-outlined text-lg animate-bounce">
              notifications_active
            </span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col w-full max-w-md mx-auto px-6 relative z-10">
        <div className="relative w-full h-64 mt-4 mb-2 flex items-center justify-center">
          <div className="absolute top-4 left-4 w-40 h-40 bg-pastel-purple rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-4 right-4 w-40 h-40 bg-pastel-yellow rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-2 left-10 w-40 h-40 bg-pastel-green rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

          <div className="relative z-10 w-full h-full bg-white/40 backdrop-blur-[2px] rounded-3xl border border-white/50 shadow-sm overflow-hidden flex items-end justify-center">
            <div className="absolute top-6 left-8 text-accent-purple/20">
              <span className="material-symbols-outlined text-5xl">cloud</span>
            </div>
            <div className="absolute top-10 right-10 text-primary/20">
              <span className="material-symbols-outlined text-4xl">cloud</span>
            </div>
            <div
              className="absolute top-8 left-1/4 bg-pastel-pink p-1.5 rounded-full text-red-400 shadow-sm animate-bounce"
              style={{ animationDuration: '3s' }}
            >
              <span className="material-symbols-outlined text-xl">coronavirus</span>
            </div>
            <div
              className="absolute top-16 right-1/4 bg-pastel-green p-1.5 rounded-full text-primary shadow-sm animate-bounce"
              style={{ animationDuration: '4s' }}
            >
              <span className="material-symbols-outlined text-xl">biotech</span>
            </div>
            <div
              className="absolute top-24 left-10 bg-pastel-yellow p-1.5 rounded-full text-amber-500 shadow-sm animate-bounce"
              style={{ animationDuration: '3.5s' }}
            >
              <span className="material-symbols-outlined text-xl">science</span>
            </div>

            <div className="relative flex flex-col items-center">
              <div className="absolute -top-16 -right-12 bg-white px-3 py-2 rounded-xl rounded-bl-none shadow-md border-2 border-primary transform rotate-6 z-20">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-red-500 text-base">
                    warning
                  </span>
                  <span className="text-xs font-bold text-slate-700">تنبيه جديد!</span>
                </div>
              </div>

              <div className="w-32 h-32 bg-pastel-purple rounded-full flex items-center justify-center relative border-4 border-white shadow-soft">
                <span className="material-symbols-outlined text-[5rem] text-accent-purple">
                  face_3
                </span>
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 bg-accent-yellow p-2 rounded-full text-white shadow-sm transform -rotate-12 border-2 border-white">
                  <span className="material-symbols-outlined text-2xl">campaign</span>
                </div>
                <div className="absolute -left-2 bottom-0 bg-primary p-2 rounded-lg text-white shadow-sm transform rotate-6 border-2 border-white">
                  <span className="material-symbols-outlined text-xl">tablet_mac</span>
                </div>
              </div>
              <div className="w-48 h-16 bg-gradient-to-t from-pastel-purple to-transparent rounded-t-full mt-[-10px] opacity-50"></div>
            </div>
          </div>
        </div>

        <div className="text-center mb-6 mt-2">
          <h1 className="text-slate-800 text-[38px] leading-[1.2] font-extrabold tracking-tight mb-3">
            مجتمعك،{' '}
            <span className="text-primary inline-block relative">
              صحتك،
              <svg
                className="absolute w-full h-3 -bottom-1 left-0 text-primary/20"
                preserveAspectRatio="none"
                viewBox="0 0 100 20"
              >
                <path
                  d="M0 15 Q 50 25 100 15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                ></path>
              </svg>
            </span>
            <br />
            مستقبلك
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed max-w-xs mx-auto font-medium">
            منصة الإبلاغ الوبائي الأذكى والأكثر سهولة في اليمن.
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-8 w-full">
          <Link
            to="/news"
            className="w-full bg-mint-light hover:bg-[#bcecdb] text-slate-800 text-lg font-bold py-4 px-8 rounded-2xl shadow-sm transition-all duration-300 transform active:scale-[0.98] text-center"
          >
            استكشاف
          </Link>
          <Link
            to="/login"
            className="w-full bg-primary hover:bg-primary-dark text-white text-xl font-bold py-5 px-8 rounded-2xl shadow-lg shadow-primary/30 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-3"
          >
            تسجيل الدخول
            <span className="material-symbols-outlined rtl:rotate-180 bg-white/20 rounded-full p-1">
              arrow_forward
            </span>
          </Link>
          <Link
            to="/signup"
            className="w-full text-center text-sm font-semibold text-slate-500 hover:text-primary transition-colors py-2"
          >
            ليس لديك حساب؟ <span className="text-primary hover:underline">إنشاء حساب جديد</span>
          </Link>
        </div>

        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex items-center bg-white p-2 pr-4 pl-2 rounded-full shadow-card border border-slate-100">
            <p className="text-slate-600 font-bold ml-3 text-sm">+10,000 مستخدم نشط</p>
            <div className="flex -space-x-3 space-x-reverse">
              <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden relative">
                <img
                  alt="User"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZCMdV2GQiUY4GXgLiUO8PEAfUKmo0FzXY5mV4HPAUgmVJnWJrhbvTrsEhh9rPh7UdGAOUqjeTXNUQWWpd-hwPf98YRNgA_3VS8QV9lqj6jq-2zgVsdgKexGT6cI1kkIA7SX0EaH3lqWdp9Ti75Mz4nh2hgQ79gxfQif6ieawwSlVVCyo7OZmZ_AVcN0GOGoKQz-TSGgthUvGH9P0inKpPapM8-AZ6txFImb6Fo8CHxKpVu5u35zt3MW-Y51tHhy1H-2figLO46lC1"
                />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden relative">
                <img
                  alt="User"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCId-lDEyv7Ywa42zjHGIlY7Abf-yPY5hB6bmXsYqudEwWC-cziBp8PF_qOHpa5UBo4nBGJvpUcNRNrXQY2JRyQ2TmuxRkfwOk8SEYxW5enfZYjZhfekofrxztdWG-1XM_SdBiqEl4pF57WnPtEpl5TtSM35fSVyQjKt0L46m_6q1i6Ln3A6HZOyXLLOMebscLDb6_qed7UQHjM_oFRkDzbn3LY_JJ_0id8l6TCpR0YGfNl1sRpiRektmKqy54Kn3l11n4otOA_ERSZ"
                />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden relative">
                <img
                  alt="User"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6F8Wda39UNJchUt5nqbs2hPQD0Olg_ui7jU9XyUEBn3vcfoQh8-vJndEnWoIYVbBV86ouYARIkfxYRsn7AFBmbrUcEFCp_DprO8ir9-_mHNAlUTdPQnIbWZWXiZGnNOEu3hRcAyC4DhVgOrCNjszRSwoURIMIlOYXXwgHs3h_scUPavpqIDZpzgDvzd5PZfPnvKCDCducxkC7EfLxaVJxAu6O5VEKz6JmV6zYFYIwyNzmfsxylXlwkeXi2EqpOEINzCZ8KlEDLYIm"
                />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-sm">add</span>
              </div>
            </div>
          </div>
        </div>

        <div 
          ref={carouselRef}
          className="flex overflow-x-auto hide-scrollbar gap-5 pb-12 pt-8 px-4 -mx-6 mb-4 snap-x snap-mandatory scroll-smooth"
        >
          <div className="min-w-[280px] snap-center transform -rotate-1 translate-y-[-10px]">
            <div className="bg-pastel-purple h-full p-6 rounded-[2rem] flex flex-col items-start text-right gap-4 transition-transform hover:-translate-y-2 hover:shadow-xl cursor-pointer border-4 border-white shadow-soft relative overflow-hidden">
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/30 rounded-full blur-xl"></div>
              <div className="bg-white p-4 rounded-2xl shadow-sm text-accent-purple relative z-10">
                <span className="material-symbols-outlined text-4xl">mic</span>
              </div>
              <div className="relative z-10 mt-2">
                <h3 className="font-extrabold text-slate-800 text-2xl mb-2">أبلغ بسهولة</h3>
                <p className="text-base text-slate-600 leading-relaxed font-medium">
                  ميزة الإبلاغ السريع عن حالة اشتباه
                </p>
              </div>
            </div>
          </div>

          <div className="min-w-[280px] snap-center transform rotate-2 translate-y-[20px]">
            <div className="bg-pastel-green h-full p-6 rounded-[2rem] flex flex-col items-start text-right gap-4 transition-transform hover:-translate-y-2 hover:shadow-xl cursor-pointer border-4 border-white shadow-soft relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/30 rounded-full blur-xl"></div>
              <div className="bg-white p-4 rounded-2xl shadow-sm text-primary relative z-10">
                <span className="material-symbols-outlined text-4xl">explore</span>
              </div>
              <div className="relative z-10 mt-2">
                <h3 className="font-extrabold text-slate-800 text-2xl mb-2">تابع بلاغك</h3>
                <p className="text-base text-slate-600 leading-relaxed font-medium">
                  متابعة حالة التقرير والتقصي لحظة بلحظة
                </p>
              </div>
            </div>
          </div>

          <div className="min-w-[280px] snap-center transform -rotate-2 translate-y-[-10px]">
            <div className="bg-pastel-yellow h-full p-6 rounded-[2rem] flex flex-col items-start text-right gap-4 transition-transform hover:-translate-y-2 hover:shadow-xl cursor-pointer border-4 border-white shadow-soft relative overflow-hidden">
              <div className="absolute bottom-10 right-0 w-20 h-20 bg-white/40 rounded-full blur-xl"></div>
              <div className="bg-white p-4 rounded-2xl shadow-sm text-accent-yellow relative z-10">
                <span className="material-symbols-outlined text-4xl">query_stats</span>
              </div>
              <div className="relative z-10 mt-2">
                <h3 className="font-extrabold text-slate-800 text-2xl mb-2">بيانات شفافة</h3>
                <p className="text-base text-slate-600 leading-relaxed font-medium">
                  الاطلاع على الخريطة الوبائية، الإحصائيات العامة، وأخبار الصحة
                </p>
              </div>
            </div>
          </div>

          <div className="min-w-[280px] snap-center transform rotate-1 translate-y-[20px]">
            <div className="bg-pastel-purple h-full p-6 rounded-[2rem] flex flex-col items-start text-right gap-4 transition-transform hover:-translate-y-2 hover:shadow-xl cursor-pointer border-4 border-white shadow-soft relative overflow-hidden">
              <div className="absolute -top-5 -left-5 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
              <div className="bg-white p-4 rounded-2xl shadow-sm text-accent-purple relative z-10">
                <span className="material-symbols-outlined text-4xl">smart_toy</span>
              </div>
              <div className="relative z-10 mt-2">
                <h3 className="font-extrabold text-slate-800 text-2xl mb-2">
                  مساعدك الصحي الذكي
                </h3>
                <p className="text-base text-slate-600 leading-relaxed font-medium">
                  احصل على إجابات فورية عن أسئلتك الصحية عند تسجيل حسابك
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-100 py-10 px-6 mt-4">
        <div className="w-full max-w-md mx-auto flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h4 className="text-lg font-bold text-slate-800">روابط سريعة</h4>
            <ul className="flex flex-col gap-2 text-slate-600 text-base">
              <li>
                <Link to="/news" className="hover:text-primary transition-colors duration-200">
                  الأخبار
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-primary transition-colors duration-200">
                  الخريطة
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-primary transition-colors duration-200">
                  حسابي
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-lg font-bold text-slate-800">معلومات التواصل</h4>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="material-symbols-outlined text-primary text-xl">
                phone_in_talk
              </span>
              <span dir="ltr">+٩٦٧ ١٢٣ ٤٥٦</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="material-symbols-outlined text-primary text-xl">mail</span>
              <span>support@rasid.ye</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-lg font-bold text-slate-800">تابعنا</h4>
            <div className="flex gap-4">
              <a
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-all duration-200 shadow-sm"
                href="#"
              >
                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    clipRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </a>
              <a
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-all duration-200 shadow-sm"
                href="#"
              >
                <svg aria-hidden="true" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z"></path>
                </svg>
              </a>
              <a
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-all duration-200 shadow-sm"
                href="#"
              >
                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    clipRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.315 2zm-3.196 1.883c-2.31 0-2.58.008-3.487.05-1.118.05-1.725.234-2.128.39-.533.207-.914.455-1.312.853a3.606 3.606 0 00-.853 1.312c-.156.403-.34.91-.39 2.128-.041.907-.05 1.176-.05 3.487 0 2.31.008 2.58.05 3.487.05 1.118.234 1.725.39 2.128.207.533.455.914.853 1.312.398.398.78.646 1.312.853.403.156.91.34 2.128.39.907.041 1.176.05 3.487.05 2.31 0 2.58-.008 3.487-.05 1.118-.05 1.725-.234 2.128-.39.533-.207.914-.455 1.312-.853.398-.398.646-.78.853-1.312.156-.403.34-.91.39-2.128.041-.907.05-1.176.05-3.487 0-2.31-.008-2.58-.05-3.487-.05-1.118-.234-1.725-.39-2.128-.207-.533-.455-.914-.853-1.312a3.606 3.606 0 00-1.312-.853c-.403-.156-.91-.34-2.128-.39-.907-.041-1.176-.05-3.487-.05zM12.315 6.824a5.491 5.491 0 110 10.982 5.491 5.491 0 010-10.982zm0 1.883a3.608 3.608 0 100 7.216 3.608 3.608 0 000-7.216zm5.325-3.81a1.254 1.254 0 110 2.508 1.254 1.254 0 010-2.508z"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-6 text-center">
          <p className="text-slate-500 text-sm">© ٢٠٢٤ راصد. جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}
