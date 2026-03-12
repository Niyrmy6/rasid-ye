import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function Map() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-slate-100 antialiased selection:bg-primary selection:text-white h-screen flex flex-col overflow-hidden">
      <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm max-w-md mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#eefcfc] dark:bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">
              shield
            </span>
          </div>
          <span className="text-xl font-bold text-text-main dark:text-slate-100">
            راصد
          </span>
        </div>
        <h1 className="text-lg font-bold text-text-main dark:text-slate-100">
          الخريطة
        </h1>
      </header>

      <div className="max-w-md mx-auto w-full flex-1 flex flex-col relative">
        <div className="px-4 py-3 z-30 bg-background-light dark:bg-background-dark border-b border-gray-100 dark:border-white/5">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="relative w-full">
              <label className="block text-xs font-medium text-text-muted mb-1 px-1">
                نوع المرض
              </label>
              <div className="relative">
                <select className="block w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark py-2.5 pr-3 pl-8 text-text-main dark:text-slate-100 focus:border-primary focus:ring-primary text-sm shadow-sm appearance-none">
                  <option selected>الكل</option>
                  <option>الكوليرا</option>
                  <option>الحميات النزفية</option>
                  <option>شلل الأطفال</option>
                  <option>الحصبة</option>
                  <option>الدفتيريا</option>
                  <option>سعال ديكي</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-text-muted">
                  <span className="material-symbols-outlined text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
            <div className="relative w-full">
              <label className="block text-xs font-medium text-text-muted mb-1 px-1">
                المحافظة
              </label>
              <div className="relative">
                <select className="block w-full rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark py-2.5 pr-3 pl-8 text-text-main dark:text-slate-100 focus:border-primary focus:ring-primary text-sm shadow-sm appearance-none">
                  <option selected>الكل</option>
                  <option>عدن</option>
                  <option>أبين</option>
                  <option>لحج</option>
                  <option>حضرموت</option>
                  <option>شبوة</option>
                  <option>المهرة</option>
                  <option>الضالع</option>
                  <option>مأرب</option>
                  <option>سقطرى</option>
                  <option>تعز</option>
                  <option>الحديدة</option>
                  <option>الجوف</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-text-muted">
                  <span className="material-symbols-outlined text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 relative w-full h-full bg-[#eefcfc] dark:bg-black/20 overflow-hidden pb-24">
          <div className="map-container flex items-center justify-center p-4 relative w-full h-full">
            <svg
              className="yemen-map w-full h-auto max-h-[70vh] drop-shadow-xl"
              viewBox="0 0 800 500"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M450,150 Q600,100 700,180 L750,250 Q650,350 500,300 Z"
                fill="#fff9c4"
              ></path>
              <path
                d="M700,180 L780,190 L790,280 L750,250 Z"
                fill="#fffde7"
              ></path>
              <path
                d="M400,250 Q450,200 500,300 L450,380 Q350,350 400,250 Z"
                fill="#ffcc80"
              ></path>
              <path
                d="M350,180 Q400,150 450,200 L400,250 L320,220 Z"
                fill="#ffab91"
              ></path>
              <path
                d="M280,200 Q320,180 350,210 L320,260 L280,240 Z"
                fill="#ef5350"
              ></path>
              <g className="relative group">
                <path
                  d="M300,215 A15,15 0 1,1 300,235 A15,15 0 1,1 300,215 Z"
                  fill="#c62828"
                ></path>
              </g>
              <path
                d="M270,160 Q300,150 320,180 L280,200 L260,180 Z"
                fill="#ffb74d"
              ></path>
              <path
                d="M220,160 Q250,140 270,160 L260,220 L210,200 Z"
                fill="#ef5350"
              ></path>
              <path
                d="M200,200 L210,250 L230,320 L190,300 L180,220 Z"
                fill="#e53935"
              ></path>
              <path
                d="M230,320 L260,350 L240,380 L200,360 Z"
                fill="#b71c1c"
              ></path>
              <path
                d="M260,280 L280,310 L260,330 L240,300 Z"
                fill="#d32f2f"
              ></path>
              <path
                d="M280,240 L320,260 L300,300 L260,280 Z"
                fill="#ff7043"
              ></path>
              <path
                d="M320,260 L400,250 L380,320 L300,300 Z"
                fill="#ffcc80"
              ></path>
              <path
                d="M280,380 L300,390 L290,410 L270,400 Z"
                fill="#e53935"
              ></path>
              <path
                d="M260,350 L320,340 L300,390 L280,380 Z"
                fill="#ffe082"
              ></path>
              <path
                d="M320,340 L380,320 L400,380 L320,390 Z"
                fill="#fff59d"
              ></path>
              <path
                d="M250,100 Q300,90 330,140 L270,160 L220,130 Z"
                fill="#ff8a65"
              ></path>
              <path
                d="M330,140 Q450,100 500,160 L450,200 L350,180 Z"
                fill="#fff176"
              ></path>
            </svg>

            <div
              className="absolute bg-[#1f2b28]/95 text-white px-3 py-2 rounded-lg text-sm pointer-events-none shadow-md z-50"
              style={{
                top: "38%",
                left: "38%",
              }}
            >
              <div className="font-bold text-sm">محافظة صنعاء</div>
              <div className="text-xs text-gray-300">١٥٠ بلاغ</div>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#1f2b28]/95"></div>
            </div>

            <div className="absolute bottom-6 right-4 bg-white/90 dark:bg-surface-dark/90 backdrop-blur rounded-lg p-3 shadow-lg border border-gray-100 dark:border-white/10 text-xs">
              <div className="font-bold mb-2 text-text-main dark:text-slate-100">
                معدل البلاغات
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#c62828]"></span>
                  <span>مرتفع جداً</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#ef5350]"></span>
                  <span>مرتفع</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#ffb74d]"></span>
                  <span>متوسط</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#fff9c4]"></span>
                  <span>منخفض</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <div className="fixed bottom-20 left-0 right-0 z-[60] max-w-md mx-auto pointer-events-none px-4">
          <div className="flex justify-end w-full pointer-events-auto">
            <button
              onClick={() => navigate("/new-report")}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 group"
            >
              <span className="material-symbols-outlined text-[24px]">
                add_alert
              </span>
              <span className="font-bold text-base">تقديم بلاغ</span>
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
