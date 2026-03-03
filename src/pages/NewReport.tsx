import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function NewReport() {
  const navigate = useNavigate();
  const [gender, setGender] = useState('male');

  return (
    <div className="bg-background-light text-text-main antialiased selection:bg-primary selection:text-white h-screen flex flex-col overflow-hidden">
      <header className="sticky top-0 z-40 bg-background-light/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm border-b border-gray-100 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 order-1">
          <div className="w-10 h-10 bg-[#eefcfc] rounded-xl flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">shield</span>
          </div>
          <span className="text-xl font-bold text-text-main font-almarai">راصد</span>
        </div>
        <div className="flex items-center gap-2 order-2">
          <h1 className="text-lg font-bold text-text-main font-almarai">إنشاء بلاغ جديد</h1>
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 max-w-md mx-auto w-full">
        <div className="p-4 space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <label className="block text-sm font-bold text-text-muted mb-2 font-almarai">اسم المريض</label>
            <div className="relative">
              <input 
                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#56BCA4] focus:border-[#56BCA4] outline-none transition-all text-right placeholder-gray-400" 
                placeholder="أدخل اسم المريض بالكامل" 
                type="text"
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">person</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-bold text-text-muted font-almarai">تحديد الموقع</label>
              <button className="text-xs text-primary font-bold hover:text-primary-dark transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">my_location</span>
                استخدام موقعي الحالي
              </button>
            </div>
            <div className="relative w-full h-40 bg-gray-200 rounded-xl overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=24.7136,46.6753&zoom=13&size=600x300&maptype=roadmap&style=feature:poi|visibility:off')] bg-cover bg-center opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50">
                <span className="material-symbols-outlined text-4xl text-primary drop-shadow-md animate-bounce">location_on</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <label className="block text-sm font-bold text-text-muted mb-3 font-almarai">الأعراض (اختر ما ينطبق)</label>
            <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto scrollbar-hide pr-1">
              {['حمى', 'سعال', 'صداع', 'إعياء', 'ضيق تنفس', 'توقف مؤقت للتنفس', 'ألم في الظهر', 'نزيف من العين أو الأذن', 'إسهال دموي', 'ألم في العظام', 'قشعريرة', 'غيبوبة', 'دوار أو دوخة', 'جفاف الأغشية المخاطية', 'إرهاق شديد', 'عطش شديد', 'شلل رخو', 'حمى عالية', 'صوت شهيق عالٍ', 'بحة في الصوت', 'نزيف داخلي', 'ألم في المفاصل', 'بقع بيضاء في الفم', 'فقدان ردود الفعل', 'فقدان مرونة الجلد', 'انخفاض ضغط الدم', 'حمى خفيفة', 'شعور عام بالاعتلال', 'سعال خفيف متقطع', 'آلام عضلية', 'تشنجات عضلية', 'ضعف في العضلات', 'إفرازات أنفية', 'غثيان', 'تصلب الرقبة', 'قيء بعد السعال', 'إسهال مائي حاد', 'تسارع ضربات القلب', 'احمرار وتدميع العين', 'سيلان الأنف', 'تشنجات', 'نوبات سعال شديدة', 'صدمة', 'طفح جلدي', 'التهاب الحلق', 'ألم في المعدة', 'تورم غدد الرقبة', 'غشاء رمادي بالحلق', 'قيء', 'طفح جلدي واسع'].map((symptom, idx) => (
                <label key={idx} className="cursor-pointer">
                  <input className="peer hidden" type="checkbox" defaultChecked={idx === 0} />
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 bg-gray-50 text-gray-600 transition-all hover:bg-gray-100 select-none peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary">
                    <span className="text-sm font-medium font-almarai">{symptom}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <label className="block text-sm font-bold text-text-muted mb-3 font-almarai">بيانات إضافية</label>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-[16px] text-gray-400">cake</span>
                  <label className="text-xs text-gray-500 block">العمر</label>
                </div>
                <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#56BCA4] focus:border-[#56BCA4] outline-none text-sm appearance-none cursor-pointer">
                  <option disabled selected value="">اختر</option>
                  <option value="child">طفل (0-12)</option>
                  <option value="teen">مراهق (13-19)</option>
                  <option value="adult">بالغ (20-60)</option>
                  <option value="senior">مسن (60+)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">الجنس</label>
                <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-200">
                  <button 
                    onClick={() => setGender('male')}
                    className={`flex-1 py-1 rounded-lg text-sm font-medium transition-all ${gender === 'male' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >ذكر</button>
                  <button 
                    onClick={() => setGender('female')}
                    className={`flex-1 py-1 rounded-lg text-sm font-medium transition-all ${gender === 'female' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >أنثى</button>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">تاريخ الإصابة</label>
                <div className="relative">
                  <input className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#56BCA4] focus:border-[#56BCA4] outline-none text-right text-sm text-gray-700" type="date" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">رقم هاتف آخر</label>
                <div className="relative">
                  <input className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#56BCA4] focus:border-[#56BCA4] outline-none text-right text-sm text-gray-700 placeholder-gray-400" placeholder="05xxxxxxxx" type="tel" />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">phone</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <label className="block text-sm font-bold text-text-muted mb-2 font-almarai">ملاحظات إضافية</label>
            <textarea 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#56BCA4] focus:border-[#56BCA4] outline-none resize-none placeholder-gray-400" 
              placeholder="هل هناك تفاصيل أخرى تود إضافتها؟" 
              rows={4}
            ></textarea>
          </div>

          <button 
            onClick={() => navigate('/report-success')}
            className="w-full bg-[#56BCA4] hover:bg-primary-dark text-white p-4 rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-almarai font-bold text-lg mt-4"
          >
            <span className="material-symbols-outlined">send</span>
            إرسال البلاغ
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
