import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function Profile() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [reportCount, setReportCount] = useState<number | string>('...');

  useEffect(() => {
    const fetchUser = async () => {
      const storedUserStr = localStorage.getItem('user');
      if (storedUserStr) {
        try {
          const storedUser = JSON.parse(storedUserStr);
          if (storedUser) {
            setIsLoggedIn(true);
            setUserName(storedUser.full_name || storedUser.name || 'مستخدم راصد');
            setUserId(storedUser.user_id);
            setProfilePicture(storedUser.profile_picture || null);

            // Fetch report count
            const { supabase } = await import('../lib/supabase');
            const { count, error } = await supabase
              .from('report')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', storedUser.user_id);
            
            if (!error && count !== null) {
              setReportCount(count);
            } else {
              setReportCount(0);
            }
          }
        } catch (e) {
          console.error('Failed to parse user from localStorage');
        }
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0 || !userId) {
        return;
      }
      
      const file = event.target.files[0];
      
      // 1. التحقق من نوع الملف (صور فقط)
      if (!file.type.startsWith('image/')) {
        alert('حدث خطأ: يُسمح برفع الصور فقط.');
        return;
      }

      // 2. التحقق من حجم الملف (الحد الأقصى 5 ميجابايت)
      const MAX_SIZE_MB = 5;
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`حدث خطأ: حجم الصورة يجب ألا يتجاوز ${MAX_SIZE_MB} ميجابايت.`);
        return;
      }

      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { supabase } = await import('../lib/supabase');

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('user')
        .update({ profile_picture: publicUrl })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      setProfilePicture(publicUrl);
      
      const storedUserStr = localStorage.getItem('user');
      if (storedUserStr) {
        const storedUser = JSON.parse(storedUserStr);
        storedUser.profile_picture = publicUrl;
        localStorage.setItem('user', JSON.stringify(storedUser));
      }

    } catch (error) {
      console.error('Error uploading image: ', error);
      alert('حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-background-light text-text-main antialiased selection:bg-primary selection:text-white h-screen flex flex-col overflow-hidden">
      <header className="sticky top-0 z-40 bg-background-light/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm border-b border-gray-100 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 order-1">
          <div className="w-10 h-10 bg-[#eefcfc] rounded-xl flex items-center justify-center text-primary border border-primary/20">
            <span
              className="material-symbols-outlined text-[24px]"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              shield
            </span>
          </div>
          <span className="text-xl font-bold text-text-main">راصد</span>
        </div>
        <div className="flex items-center gap-3 order-2">
          <h1 className="text-lg font-bold text-text-main">الملف الشخصي</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 flex flex-col items-center pt-6 max-w-md mx-auto w-full">
        {isLoggedIn ? (
          // Registered User Profile
          <div className="w-full">
            <div className="px-4 flex flex-col items-center">
              <label htmlFor="profile-upload" className="relative mb-4 cursor-pointer group">
                <div className="w-28 h-28 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined filled text-[64px] text-gray-300">person</span>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-full">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-1 right-1 w-8 h-8 bg-primary rounded-full border-4 border-white flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                </div>
                <input 
                  type="file" 
                  id="profile-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                  disabled={uploading}
                />
              </label>
              <h2 className="text-2xl font-bold font-almarai text-text-main mb-1">{userName}</h2>
            </div>

            <div className="px-4 mb-6 mt-6">
              <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">assignment_turned_in</span>
                  </div>
                  <span className="font-bold text-text-main">إجمالي البلاغات</span>
                </div>
                <span className="text-2xl font-bold font-almarai text-primary">
                  {reportCount.toLocaleString('ar-EG')}
                </span>
              </div>
            </div>

            <div className="px-4 space-y-3">
              <Link to="/new-report" className="w-full bg-[#56BCA4] hover:bg-primary-dark text-white p-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-almarai font-bold mb-5">
                <span className="material-symbols-outlined">add_circle</span>
                تقديم بلاغ جديد
              </Link>

              <Link to="/my-reports" className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.99] transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">article</span>
                  <span className="font-medium text-text-main font-almarai">بلاغاتي</span>
                </div>
                <span className="material-symbols-outlined text-gray-300 text-[20px] rotate-180 group-hover:text-primary transition-colors">chevron_right</span>
              </Link>

              <Link to="/personal-info" className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.99] transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">person_pin</span>
                  <span className="font-medium text-text-main font-almarai">معلومات شخصية</span>
                </div>
                <span className="material-symbols-outlined text-gray-300 text-[20px] rotate-180 group-hover:text-primary transition-colors">chevron_right</span>
              </Link>

              <Link to="/notifications" className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.99] transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">notifications</span>
                  <span className="font-medium text-text-main font-almarai">التنبيهات</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-300 text-[20px] rotate-180 group-hover:text-primary transition-colors">chevron_right</span>
                </div>
              </Link>

              <Link to="/journey" className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.99] transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">info</span>
                  <span className="font-medium text-text-main font-almarai">رحلتك مع راصد</span>
                </div>
                <span className="material-symbols-outlined text-gray-300 text-[20px] rotate-180 group-hover:text-primary transition-colors">chevron_right</span>
              </Link>

              <Link to="/contact" className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.99] transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">support_agent</span>
                  <span className="font-medium text-text-main font-almarai">اتصل بنا</span>
                </div>
                <span className="material-symbols-outlined text-gray-300 text-[20px] rotate-180 group-hover:text-primary transition-colors">chevron_right</span>
              </Link>
            </div>

            <div className="px-4 mt-8 mb-8">
              <button 
                onClick={handleLogout}
                className="w-full bg-gray-100 hover:bg-gray-200 text-text-muted p-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-almarai font-bold border border-gray-200"
              >
                <span className="material-symbols-outlined">logout</span>
                تسجيل الخروج
              </button>
            </div>
          </div>
        ) : (
          // Guest Profile
          <div className="w-full max-w-sm px-6 flex flex-col items-center text-center">
            <div className="mb-6 relative w-64 h-56 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-green-50 rounded-full opacity-60 blur-2xl"></div>
              <img
                alt="Community epidemiological surveillance illustration showing diverse people and a health worker monitoring health icons over a map"
                className="relative z-10 w-full h-full object-contain drop-shadow-sm"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJRE0ACKMwbrz3UYcj_OFhucgepx3g4bz8XTHHgc2FcxqOeVdMcIVD18cXa2IHk5m3AMyUdpwzuJQvIxPr9XMXau4HyZQh0s-OewDlvKDQ0dQdwJSUwD0x1pNyT7zODvSVPVLlveWZHjdjVsmQD6wHVxpaW1ZxrSqDgLzQ5nbZY7PK5bIxqwbkWDhloMSdf-YAfBDfBvGQOmxxNOHPxivhj0bFAB5czjRhE1BJajW1k3gu6_W7Y8m8dfNaYdnuisMkM-83aOcNoXYA"
                style={{ mixBlendMode: 'multiply' }}
              />
            </div>
            <h2 className="text-2xl font-extrabold font-almarai text-text-main mb-6 leading-tight">
              انضم إلى راصد الآن
            </h2>

            <div className="w-full space-y-5 mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mt-1">
                  <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                </div>
                <div className="flex flex-col text-right">
                  <h3 className="font-bold font-almarai text-text-main text-base">
                    تنبيهات فورية
                  </h3>
                  <p className="text-sm text-text-muted mt-0.5 leading-relaxed">
                    كن أول من يعلم بالأوبئة في منطقتك.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mt-1">
                  <span className="material-symbols-outlined text-[20px]">record_voice_over</span>
                </div>
                <div className="flex flex-col text-right">
                  <h3 className="font-bold font-almarai text-text-main text-base">
                    بلاغات دقيقة
                  </h3>
                  <p className="text-sm text-text-muted mt-0.5 leading-relaxed">
                    ساهم في حماية مجتمعك من خلال بلاغاتك الرسمية.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mt-1">
                  <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
                </div>
                <div className="flex flex-col text-right">
                  <h3 className="font-bold font-almarai text-text-main text-base">
                    إرشادات مخصصة
                  </h3>
                  <p className="text-sm text-text-muted mt-0.5 leading-relaxed">
                    احصل على نصائح وقائية مبنية على حالتك وموقعك.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full space-y-3 mt-auto mb-4">
              <Link
                to="/signup"
                className="w-full bg-[#57BCA5] hover:bg-primary-dark text-white py-4 px-6 rounded-2xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-almarai font-bold text-lg"
              >
                إنشاء حساب جديد
              </Link>
              <Link
                to="/login"
                className="w-full bg-white border-2 border-[#57BCA5] text-[#57BCA5] hover:bg-primary/5 py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-almarai font-bold text-lg"
              >
                تسجيل الدخول
              </Link>
            </div>

            <div className="mb-6">
              <Link 
                to="/contact"
                className="text-sm text-text-muted hover:text-primary transition-colors font-medium border-b border-transparent hover:border-primary/50 pb-0.5"
              >
                تحتاج مساعدة؟ اتصل بنا
              </Link>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
