import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';

export default function PersonalInfo() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const storedUserStr = localStorage.getItem('user');
    if (storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        if (storedUser.full_name || storedUser.name) setFullname(storedUser.full_name || storedUser.name);
        if (storedUser.phone) setPhone(storedUser.phone);
        if (storedUser.password) setPassword(storedUser.password);
        if (storedUser.email) setEmail(storedUser.email);
        if (storedUser.user_id) setUserId(storedUser.user_id);
        if (storedUser.profile_picture) setProfilePicture(storedUser.profile_picture);
      } catch (e) {
        console.error('Failed to parse user from localStorage');
      }
    }
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0 || !userId) {
        return;
      }
      
      const file = event.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        alert(t('Error: Only images are allowed.'));
        return;
      }

      const MAX_SIZE_MB = 5;
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`${t('Error: Image size must not exceed')} ${MAX_SIZE_MB} ${t('MB')}`);
        return;
      }

      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('user')
        .update({ profile_picture: publicUrl })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      setProfilePicture(publicUrl);
      
      const storedUserStr = localStorage.getItem('user');
      if (storedUserStr) {
        const storedUser = JSON.parse(storedUserStr);
        storedUser.profile_picture = publicUrl;
        localStorage.setItem('user', JSON.stringify(storedUser));
      }

    } catch (error) {
      console.error('Error uploading image: ', error);
      alert(t('An error occurred while uploading the image'));
    } finally {
      setUploading(false);
    }
  };

  const handleSaveClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError(null);

    const storedUserStr = localStorage.getItem('user');
    if (!storedUserStr) {
      setError(t("Error: No user found"));
      setLoading(false);
      return;
    }
    
    const user = JSON.parse(storedUserStr);

    try {
      const { data, error: updateError } = await supabase
        .from('user')
        .update({ full_name: fullname, phone, password, email: email || null })
        .eq('user_id', user.user_id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      // Update local storage
      localStorage.setItem('user', JSON.stringify(data));

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(t("Error saving data: ") + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className="bg-background-light text-text-main antialiased selection:bg-primary selection:text-white h-screen flex flex-col overflow-hidden">
      <header className="sticky top-0 z-40 bg-background-light/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm border-b border-gray-100 max-w-md mx-auto w-full">
        <div className={`flex items-center gap-2 ${i18n.language === 'ar' ? '' : 'order-1 flex-row'}`}>
          <div className="w-10 h-10 bg-[#eefcfc] rounded-xl flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 0" }}>shield</span>
          </div>
          <span className="text-xl font-bold text-text-main font-almarai">{t('Rasid')}</span>
        </div>
        <div className={`flex items-center gap-3 ${i18n.language === 'ar' ? '' : 'order-2 flex-row-reverse'}`}>
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <span className={`material-symbols-outlined text-text-main ${i18n.language === 'ar' ? '' : 'rotate-180'}`}>arrow_forward</span>
          </button>
          <h1 className="text-lg font-bold text-text-main">{t('Personal Information')}</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 max-w-md mx-auto w-full">
        <div className="px-4 py-8 flex flex-col items-center">
          <div className="relative mb-4">
            <div className={`w-28 h-28 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden border-4 border-white ${uploading ? 'opacity-50' : ''}`}>
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined filled text-[64px] text-gray-300">person</span>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <label className="absolute bottom-1 right-1 w-8 h-8 bg-primary rounded-full border-4 border-white flex items-center justify-center text-white shadow-sm cursor-pointer hover:bg-primary-dark transition-colors">
              <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {error && <p className="text-red-500 font-bold text-center mt-2 px-4">{error}</p>}

        <div className="px-4 space-y-5" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="relative group">
            <label className={`block text-sm font-medium text-text-muted mb-1.5 ${i18n.language === 'ar' ? 'mr-1' : 'ml-1'}`} htmlFor="fullname">{t('Full Name')}</label>
            <div className="relative">
              <input 
                className={`w-full bg-white text-text-main rounded-2xl border border-transparent ring-1 ring-gray-200 py-3.5 focus:ring-1 focus:ring-[#56BCA4] focus:border-[#56BCA4] outline-none transition-all placeholder:text-gray-400 font-almarai ${i18n.language === 'ar' ? 'text-right pr-12 pl-4' : 'text-left pl-12 pr-4'}`} 
                id="fullname" 
                placeholder={t("Enter your full name")} 
                type="text" 
                value={fullname}
                disabled={loading}
                onChange={(e) => setFullname(e.target.value)}
              />
              <div className={`absolute inset-y-0 ${i18n.language === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none`}>
                <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">person</span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <label className={`block text-sm font-medium text-text-muted mb-1.5 ${i18n.language === 'ar' ? 'mr-1' : 'ml-1'}`} htmlFor="phone">{t('Phone Number')}</label>
            <div className="relative">
              <input 
                className={`w-full bg-white text-text-main rounded-2xl border border-transparent ring-1 ring-gray-200 py-3.5 focus:ring-1 focus:ring-[#56BCA4] focus:border-[#56BCA4] outline-none transition-all placeholder:text-gray-400 font-almarai ${i18n.language === 'ar' ? 'text-right pr-12 pl-4' : 'text-left pl-12 pr-4'}`} 
                dir="ltr" 
                id="phone" 
                type="tel" 
                value={phone}
                disabled={loading}
                onChange={(e) => setPhone(e.target.value)}
                style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}
              />
              <div className={`absolute inset-y-0 ${i18n.language === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none`}>
                <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">phone</span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <label className={`block text-sm font-medium text-text-muted mb-1.5 ${i18n.language === 'ar' ? 'mr-1' : 'ml-1'}`} htmlFor="password">{t('Password')}</label>
            <div className="relative">
              <input 
                className={`w-full bg-white text-text-main rounded-2xl border border-transparent ring-1 ring-gray-200 py-3.5 focus:ring-1 focus:ring-[#56BCA4] focus:border-[#56BCA4] outline-none transition-all placeholder:text-gray-400 font-almarai ${i18n.language === 'ar' ? 'text-right pr-12 pl-12' : 'text-left pl-12 pr-12'}`} 
                id="password" 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className={`absolute inset-y-0 ${i18n.language === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none`}>
                <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">lock</span>
              </div>
              <button
                type="button"
                className={`absolute inset-y-0 ${i18n.language === 'ar' ? 'left-0 pl-3.5' : 'right-0 pr-3.5'} flex items-center text-gray-400 hover:text-primary transition-colors`}
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          </div>

          <div className="relative group">
            <label className={`block text-sm font-medium text-text-muted mb-1.5 ${i18n.language === 'ar' ? 'mr-1' : 'ml-1'}`} htmlFor="email">{t('Email')} <span className="text-gray-400 text-xs font-normal">{t('(Optional)')}</span></label>
            <div className="relative">
              <input 
                className={`w-full bg-white text-text-main rounded-2xl border border-transparent ring-1 ring-gray-200 py-3.5 focus:ring-1 focus:ring-[#56BCA4] focus:border-[#56BCA4] outline-none transition-all placeholder:text-gray-400 font-almarai ${i18n.language === 'ar' ? 'text-right pr-12 pl-4' : 'text-left pl-12 pr-4'}`} 
                id="email" 
                placeholder="example@email.com" 
                type="email" 
                value={email}
                disabled={loading}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className={`absolute inset-y-0 ${i18n.language === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none`}>
                <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">mail</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 mt-8 mb-8">
          <button 
            onClick={handleSaveClick}
            disabled={loading}
            className={`w-full bg-primary hover:bg-primary-dark text-white p-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-almarai font-bold text-lg disabled:opacity-70 disabled:pointer-events-none ${i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}
          >
            <span className="material-symbols-outlined">save</span>
            {loading ? t('Saving...') : t('Save Changes')}
          </button>
        </div>
      </main>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500">
              <span className="material-symbols-outlined text-[32px]">warning</span>
            </div>
            <h3 className="text-xl font-bold text-text-main mb-2">{t('Confirm Save')}</h3>
            <p className="text-text-muted mb-6">{t('Are you sure you want to save changes to your personal information?')}</p>
            <div className="flex gap-3" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
              <button 
                onClick={handleCancel}
                className="flex-1 py-3 rounded-xl font-bold text-text-main bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {t('Cancel')}
              </button>
              <button 
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-colors"
              >
                {t('Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Dialog */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <h3 className="text-xl font-bold text-text-main mb-2">{t('Saved Successfully')}</h3>
            <p className="text-text-muted">{t('Your personal information has been successfully updated.')}</p>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
