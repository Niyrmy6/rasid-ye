import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function ContactUs() {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light text-text-main antialiased selection:bg-primary selection:text-white h-screen flex flex-col overflow-hidden">
      <header className="sticky top-0 z-40 bg-background-light/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm border-b border-gray-100 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 order-1">
          <div className="w-10 h-10 bg-[#eefcfc] rounded-xl flex items-center justify-center text-primary">
            <span
              className="material-symbols-outlined text-[24px]"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              shield
            </span>
          </div>
          <span className="text-xl font-bold text-text-main font-almarai">
            راصد
          </span>
        </div>
        <div className="flex items-center gap-3 order-2">
          <h1 className="text-lg font-bold text-text-main font-almarai">
            اتصل بنا
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-text-main">
              arrow_back
            </span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 max-w-md mx-auto w-full">
        <div className="px-6 py-8 flex flex-col items-center text-center">
          <div className="mb-6 relative w-32 h-32">
            <div className="absolute inset-0 bg-blue-50 rounded-full blur-2xl opacity-60"></div>
            <div className="relative w-full h-full bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
              <span 
                className="material-symbols-outlined text-primary/80" 
                style={{ fontSize: '80px', fontVariationSettings: "'wght' 300" }}
              >
                support_agent
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-status-orange rounded-full flex items-center justify-center border-4 border-white">
              <span className="material-symbols-outlined text-status-orange-text text-[24px]">
                mail
              </span>
            </div>
          </div>
          <p className="text-text-muted max-w-xs leading-relaxed font-medium">
            يسعدنا تواصلكم معنا. نحن هنا لمساعدتكم في أي استفسار.
          </p>
        </div>

        <div className="px-4 mb-8 grid grid-cols-1 gap-3">
          <a
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all active:scale-[0.99] group"
            href="tel:800123456"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
              <span className="material-symbols-outlined text-[24px]">
                call
              </span>
            </div>
            <div className="flex flex-col items-start text-right flex-1">
              <span className="text-xs text-text-muted mb-1">
                اتصل بنا مباشرة
              </span>
              <span
                className="text-lg font-bold font-almarai text-text-main"
                dir="ltr"
              >
                800-123-456
              </span>
            </div>
            <span className="material-symbols-outlined text-gray-300 text-[20px] rotate-180 group-hover:text-primary transition-colors">
              chevron_right
            </span>
          </a>

          <a
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all active:scale-[0.99] group"
            href="mailto:support@rasid.ye"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
              <span className="material-symbols-outlined text-[24px]">
                mail
              </span>
            </div>
            <div className="flex flex-col items-start text-right flex-1">
              <span className="text-xs text-text-muted mb-1">
                ارسل لنا بريداً إلكترونياً
              </span>
              <span
                className="text-base font-bold font-almarai text-text-main font-sans"
                dir="ltr"
              >
                support@rasid.ye
              </span>
            </div>
            <span className="material-symbols-outlined text-gray-300 text-[20px] rotate-180 group-hover:text-primary transition-colors">
              chevron_right
            </span>
          </a>

          <a
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all active:scale-[0.99] group"
            href="#"
          >
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
              <svg
                className="w-6 h-6 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
              </svg>
            </div>
            <div className="flex flex-col items-start text-right flex-1">
              <span className="text-xs text-text-muted mb-1">
                تواصل عبر واتساب
              </span>
              <span className="text-base font-bold font-almarai text-text-main">
                راصد واتساب
              </span>
            </div>
            <span className="material-symbols-outlined text-gray-300 text-[20px] rotate-180 group-hover:text-primary transition-colors">
              chevron_right
            </span>
          </a>
        </div>

        <div className="px-4 mt-6 mb-8"></div>
      </main>

      <BottomNav />
    </div>
  );
}
