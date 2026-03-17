import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { supabase } from "../lib/supabase";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in leaflet under React/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapEventsHandler({ onSelect, location }: { onSelect: (lat: number, lng: number) => void, location: {lat: number, lng: number} | null }) {
  const map = useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  
  useEffect(() => {
    if (location) {
      // Fly to selection but do it smoothly, if already nearby just pan
      map.flyTo([location.lat, location.lng], map.getZoom() < 13 ? 14 : map.getZoom());
    }
  }, [location, map]);

  return null;
}

const SYMPTOM_MAP: Record<string, number> = {
  "توقف مؤقت للتنفس": 1,
  "ألم في الظهر": 2,
  "نزيف من العين أو الأذن": 3,
  "إسهال دموي": 4,
  "ألم في العظام": 5,
  "قشعريرة": 6,
  "غيبوبة": 7,
  "سعال": 8,
  "ضيق تنفس": 9,
  "دوار أو دوخة": 10,
  "جفاف الأغشية المخاطية": 11,
  "إرهاق شديد": 12,
  "عطش شديد": 13,
  "إعياء": 14,
  "حمى": 15,
  "شلل رخو": 16,
  "صداع": 17,
  "حمى عالية": 18,
  "صوت شهيق عالٍ": 19,
  "بحة في الصوت": 20,
  "نزيف داخلي": 21,
  "ألم في المفاصل": 22,
  "بقع بيضاء في الفم": 23,
  "فقدان ردود الفعل": 24,
  "فقدان مرونة الجلد": 25,
  "انخفاض ضغط الدم": 26,
  "حمى خفيفة": 27,
  "شعور عام بالاعتلال": 28,
  "سعال خفيف متقطع": 29,
  "آلام عضلية": 30,
  "تشنجات عضلية": 31,
  "ضعف في العضلات": 32,
  "إفرازات أنفية": 33,
  "غثيان": 34,
  "تصلب الرقبة": 35,
  "قيء بعد السعال": 36,
  "إسهال مائي حاد": 37,
  "تسارع ضربات القلب": 38,
  "احمرار وتدميع العين": 39,
  "سيلان الأنف": 40,
  "تشنجات": 41,
  "نوبات سعال شديدة": 42,
  "صدمة": 43,
  "طفح جلدي": 44,
  "التهاب الحلق": 45,
  "ألم في المعدة": 46,
  "تورم غدد الرقبة": 47,
  "غشاء رمادي بالحلق": 48,
  "قيء": 49,
  "طفح جلدي واسع": 50
};

const DISEASE_MAP: Record<string, number> = {
  "الكوليرا": 3,
  "الحصبة": 1,
  "حمى الضنك": 6,
  "شلل الأطفال": 2,
  "الدفتيريا": 4,
  "السعال الديكي": 5
};

export default function NewReport() {
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState("");
  const [selectedDisease, setSelectedDisease] = useState("الكوليرا");
  const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([]);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [onsetDate, setOnsetDate] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      setShowAuthModal(true);
    }
  }, []);

  const toggleSymptom = (symptomName: string, isChecked: boolean) => {
    const sId = SYMPTOM_MAP[symptomName];
    if (!sId) return;

    if (isChecked) {
      setSelectedSymptoms((prev) => [...prev, sId]);
    } else {
      setSelectedSymptoms((prev) => prev.filter((id) => id !== sId));
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => alert("تعذر الحصول على الموقع: " + err.message)
      );
    } else {
      alert("ميزة الموقع غير مدعومة في متصفحك");
    }
  };

  const handleSubmit = async () => {
    if (!patientName || selectedSymptoms.length === 0) {
      setError("الرجاء إدخال اسم المريض واختيار عرض واحد على الأقل.");
      return;
    }

    const userStr = localStorage.getItem("user");
    if (!userStr) {
      setError("يجب تسجيل الدخول لتقديم بلاغ.");
      return;
    }
    const user = JSON.parse(userStr);

    setLoading(true);
    setError(null);

    const disease_id = DISEASE_MAP[selectedDisease] || null;

    try {
      // 1. Insert report
      const { data: reportData, error: reportError } = await supabase
        .from("report")
        .insert([
          {
            patient_name: patientName,
            age: age || null,
            gender: gender,
            phone: phone || null,
            onset_date: onsetDate ? new Date(onsetDate).toISOString() : null,
            notes: notes || null,
            report_date: new Date().toISOString(),
            user_id: user.user_id,
            disease_id: disease_id,
            classification_id: 1, // suspected defaults to 1 based on backend "suspected" classification
            location: location ? `POINT(${location.lng} ${location.lat})` : null
          },
        ])
        .select()
        .single();

      if (reportError) throw reportError;

      // 2. Insert symptoms
      if (reportData && reportData.report_id) {
        const symptomsToInsert = selectedSymptoms.map((sId) => ({
          report_id: reportData.report_id,
          symptom_id: sId,
        }));

        const { error: sympError } = await supabase
          .from("symptom_report")
          .insert(symptomsToInsert);

        if (sympError) throw sympError;
      }

      navigate("/report-success");
    } catch (err: any) {
      console.error(err);
      setError("حدث خطأ أثناء إرسال البلاغ: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-slate-100 antialiased selection:bg-primary selection:text-white h-screen flex flex-col overflow-hidden">
      <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm border-b border-gray-100 dark:border-white/5 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 order-1">
          <div className="w-10 h-10 bg-[#eefcfc] dark:bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">
              shield
            </span>
          </div>
          <span className="text-xl font-bold text-text-main dark:text-slate-100 font-almarai">
            راصد
          </span>
        </div>
        <div className="flex items-center gap-2 order-2">
          <h1 className="text-lg font-bold text-text-main dark:text-slate-100 font-almarai">
            إنشاء بلاغ جديد
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">
              arrow_back
            </span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 max-w-md mx-auto w-full">
        <div className="p-4 space-y-6">
          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <label className="block text-sm font-bold text-text-muted mb-2 font-almarai">
              اسم المريض
            </label>
            <div className="relative">
              <input
                className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-right placeholder-gray-400"
                placeholder="أدخل اسم المريض بالكامل"
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                person
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-bold text-text-muted font-almarai">
                تحديد الموقع
              </label>
              <button 
                onClick={handleGetLocation}
                className="text-xs text-primary font-bold hover:text-primary-dark transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">
                  my_location
                </span>
                استخدام موقعي الحالي
              </button>
            </div>
            {location ? (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-700 dark:text-green-400 text-sm font-bold text-center border border-green-200 dark:border-green-800 mb-3">
                تم تحديد الموقع بنجاح ✓ 
                <br/>
                <span className="text-xs font-normal">({location.lat.toFixed(4)}, {location.lng.toFixed(4)})</span>
              </div>
            ) : null}

            <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden shadow-inner z-0 border border-gray-200 dark:border-gray-800">
              <MapContainer 
                center={[12.8, 45.0333]} // Default starting position slightly near Aden
                zoom={12} 
                style={{ height: '100%', width: '100%', zIndex: 1 }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapEventsHandler onSelect={(lat, lng) => setLocation({lat, lng})} location={location} />
                {location && <Marker position={[location.lat, location.lng]} />}
              </MapContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
            <label className="block text-sm font-bold text-text-muted mb-1 font-almarai">
              اختر المرض
            </label>
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
              {[
                {
                  name: "الكوليرا",
                  description:
                    "عدوى بكتيرية حادة تصيب الأمعاء وتسبب إسهالاً مائياً شديداً وجفافاً.",
                },
                {
                  name: "الحصبة",
                  description:
                    "مرض فيروسي شديد العدوى يسبب طفحاً جلدياً وحمى وأعراضاً تشبه الزكام.",
                },
                {
                  name: "حمى الضنك",
                  description:
                    "عدوى فيروسية تنتقل عبر البعوض وتسبب حمى شديدة وآلاماً في العضلات والمفاصل.",
                },
                {
                  name: "شلل الأطفال",
                  description:
                    "مرض فيروسي قد يهاجم الجهاز العصبي ويؤدي إلى شلل دائم في بعض الحالات.",
                },
                {
                  name: "الدفتيريا",
                  description:
                    "عدوى بكتيرية خطيرة تؤثر على الأغشية المخاطية للحلق والأنف.",
                },
                {
                  name: "السعال الديكي",
                  description:
                    "عدوى تنفسية شديدة العدوى تتميز بسعال جاف وعنيف يتبعه صوت شهيق عالٍ.",
                },
              ].map((disease, idx) => (
                <label key={disease.name} className="cursor-pointer block group">
                  <input
                    className="hidden"
                    name="disease"
                    type="radio"
                    checked={selectedDisease === disease.name}
                    onChange={(e) => e.target.checked && setSelectedDisease(disease.name)}
                  />
                  <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 transition-all group-hover:bg-gray-100 dark:group-hover:bg-white/10 group-has-[:checked]:!bg-primary group-has-[:checked]:!border-primary">
                    <h4 className="font-bold text-primary group-has-[:checked]:!text-white mb-1 font-almarai text-base transition-colors">
                      {disease.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 group-has-[:checked]:!text-white/90 leading-relaxed transition-colors">
                      {disease.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <label className="block text-sm font-bold text-text-muted mb-3 font-almarai">
              الأعراض (اختر ما ينطبق)
            </label>
            <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto scrollbar-hide pr-1">
              {[
                "حمى",
                "سعال",
                "صداع",
                "إعياء",
                "ضيق تنفس",
                "توقف مؤقت للتنفس",
                "ألم في الظهر",
                "نزيف من العين أو الأذن",
                "إسهال دموي",
                "ألم في العظام",
                "قشعريرة",
                "غيبوبة",
                "دوار أو دوخة",
                "جفاف الأغشية المخاطية",
                "إرهاق شديد",
                "عطش شديد",
                "شلل رخو",
                "حمى عالية",
                "صوت شهيق عالٍ",
                "بحة في الصوت",
                "نزيف داخلي",
                "ألم في المفاصل",
                "بقع بيضاء في الفم",
                "فقدان ردود الفعل",
                "فقدان مرونة الجلد",
                "انخفاض ضغط الدم",
                "حمى خفيفة",
                "شعور عام بالاعتلال",
                "سعال خفيف متقطع",
                "آلام عضلية",
                "تشنجات عضلية",
                "ضعف في العضلات",
                "إفرازات أنفية",
                "غثيان",
                "تصلب الرقبة",
                "قيء بعد السعال",
                "إسهال مائي حاد",
                "تسارع ضربات القلب",
                "احمرار وتدميع العين",
                "سيلان الأنف",
                "تشنجات",
                "نوبات سعال شديدة",
                "صدمة",
                "طفح جلدي",
                "التهاب الحلق",
                "ألم في المعدة",
                "تورم غدد الرقبة",
                "غشاء رمادي بالحلق",
                "قيء",
                "طفح جلدي واسع",
              ].map((symptom, idx) => (
                <label key={idx} className="cursor-pointer group">
                  <input
                    className="hidden"
                    type="checkbox"
                    onChange={(e) => toggleSymptom(symptom, e.target.checked)}
                  />
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 transition-all group-hover:bg-gray-100 dark:group-hover:bg-white/10 select-none group-has-[:checked]:!bg-primary group-has-[:checked]:!text-white group-has-[:checked]:!border-primary">
                    <span className="text-sm font-medium font-almarai">
                      {symptom}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <label className="block text-sm font-bold text-text-muted mb-3 font-almarai">
              بيانات إضافية
            </label>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">العمر</label>
                <div className="relative">
                  <select
                    value={age}
                    onChange={(e) => setAge(e.target.value)} 
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm appearance-none cursor-pointer">
                  <option disabled value="">
                    اختر
                  </option>
                  <option value="child">طفل (0-12)</option>
                  <option value="teen">مراهق (13-19)</option>
                  <option value="adult">بالغ (20-60)</option>
                  <option value="senior">مسن (60+)</option>
                </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-gray-400 pointer-events-none">
                    cake
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  الجنس
                </label>
                <div className="flex bg-gray-50 dark:bg-white/5 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setGender("male")}
                    className={`flex-1 py-1 rounded-lg text-sm font-medium transition-all ${
                      gender === "male"
                        ? "bg-white dark:bg-primary text-primary dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    ذكر
                  </button>
                  <button
                    onClick={() => setGender("female")}
                    className={`flex-1 py-1 rounded-lg text-sm font-medium transition-all ${
                      gender === "female"
                        ? "bg-white dark:bg-primary text-primary dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    أنثى
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  تاريخ الإصابة
                </label>
                <div className="relative">
                  <input
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-right text-sm text-gray-700 dark:text-gray-300 relative z-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    type="date"
                    value={onsetDate}
                    onChange={(e) => setOnsetDate(e.target.value)}
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-20">
                    calendar_month
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  رقم هاتف آخر
                </label>
                <div className="relative">
                  <input
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-right text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400"
                    placeholder="05xxxxxxxx"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    phone
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <label className="block text-sm font-bold text-text-muted mb-2 font-almarai">
              ملاحظات إضافية
            </label>
            <textarea
              className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none placeholder-gray-400"
              placeholder="هل هناك تفاصيل أخرى تود إضافتها؟"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          <div className="pt-2">
            {error && <p className="text-red-500 text-sm font-bold text-center mb-4">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#56BCA4] hover:bg-primary-dark text-white p-4 rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-almarai font-bold text-lg mt-4 disabled:opacity-70 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined">send</span>
              {loading ? "جاري الإرسال..." : "إرسال البلاغ"}
            </button>
          </div>
        </div>
      </main>

      <BottomNav />

      {/* Modern Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-[2rem] p-8 shadow-2xl border border-gray-100 dark:border-gray-800 text-center transform scale-100 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white dark:border-surface-dark shadow-soft">
              <span className="material-symbols-outlined text-4xl text-[var(--color-error-soft, #f87171)]">
                lock
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-foreground dark:text-white mb-3 tracking-tight">
              تسجيل الدخول إلزامي
            </h2>
            <p className="text-muted-foreground dark:text-gray-400 mb-8 leading-relaxed font-medium">
              عذراً، يجب عليك تسجيل الدخول بحسابك أولاً حتى تتمكن من المساهمة وتقديم بلاغ صحي جديد.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-primary hover:bg-primary-dark text-white text-lg font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-primary/30 active:scale-[0.98]"
              >
                تسجيل الدخول الآن
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full bg-muted hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-muted-foreground dark:text-gray-300 font-bold py-4 rounded-2xl transition-all duration-300 active:scale-[0.98]"
              >
                العودة للرئيسية
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
