import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageShell, { MAIN_CLASS } from '../components/PageShell';
import PageHeader from '../components/PageHeader';
import { supabase } from '../lib/supabase';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { getStoredUser, setStoredUser } from '../lib/session';
import { validateYemenPhone } from '../lib/phoneValidation';
import { notificationService } from '../lib/notifications';

export default function PersonalInfo() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [originalPhone, setOriginalPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) return;

    const stripPrefix = (ph: string) => {
      if (!ph) return '';
      let display = ph;
      if (display.startsWith('+967')) {
        display = display.substring(4);
      } else if (display.startsWith('967')) {
        display = display.substring(3);
      }
      return display;
    };

    // Load initial values from localStorage
    if (storedUser.full_name) setFullname(storedUser.full_name);
    if (storedUser.phone) {
      const display = stripPrefix(storedUser.phone);
      setPhone(display);
      setOriginalPhone(storedUser.phone); // Full phone is stored in DB
    }
    if (storedUser.password) setPassword(storedUser.password);
    if (storedUser.email) setEmail(storedUser.email);
    setUserId(storedUser.user_id);
    if (storedUser.profile_picture) setProfilePicture(storedUser.profile_picture);

    // Fetch latest from database to support database updates reflection
    const fetchUserData = async () => {
      try {
        const { data, error: fetchErr } = await supabase
          .from('user')
          .select('*')
          .eq('user_id', storedUser.user_id)
          .single();

        if (fetchErr) {
          console.error("Error fetching database profile updates", fetchErr);
          return;
        }

        if (data) {
          setStoredUser(data);
          if (data.full_name) setFullname(data.full_name);
          if (data.phone) {
            const display = stripPrefix(data.phone);
            setPhone(display);
            setOriginalPhone(data.phone);
          }
          if (data.password) setPassword(data.password);
          if (data.email) setEmail(data.email || '');
          if (data.profile_picture) setProfilePicture(data.profile_picture);
        }
      } catch (err) {
        console.error("Error in fetchUserData catch block", err);
      }
    };

    fetchUserData();
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0 || !userId) {
        return;
      }
      
      const file = event.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        handleError(new Error(t('Error: Only images are allowed.')), { context: 'Avatar Upload format' });
        return;
      }

      const MAX_SIZE_MB = 5;
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        handleError(new Error(`${t('Error: Image size must not exceed')} ${MAX_SIZE_MB} ${t('MB')}`), { context: 'Avatar Upload size' });
        return;
      }

      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      // Storage path prefix matches bucket policy; random suffix avoids overwrite on re-upload
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        handleError(uploadError, { context: 'Avatar Storage Upload' });
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('user')
        .update({ profile_picture: publicUrl })
        .eq('user_id', userId);

      if (updateError) {
        handleError(updateError, { context: 'Avatar DB Update' });
        setUploading(false);
        return;
      }

      setProfilePicture(publicUrl);
      
      const storedUser = getStoredUser();
      if (storedUser) {
        setStoredUser({ ...storedUser, profile_picture: publicUrl });
      }

    } catch (error) {
      handleError(error, { context: 'Avatar Upload Catch' });
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

    const user = getStoredUser();
    if (!user) {
      handleError(new Error(t("Error: No user found")), { context: 'Profile Save session' });
      setLoading(false);
      return;
    }

    // 1. Validate Full Name
    if (!fullname.trim()) {
      setError(t('Please fill all fields'));
      setLoading(false);
      return;
    }
    if (fullname.trim().length < 2) {
      setError(t('signup.nameMinLength'));
      setLoading(false);
      return;
    }
    const nameParts = fullname.trim().split(/\s+/);
    if (nameParts.length < 4) {
      setError(t('signup.nameQuadrupleRequired'));
      setLoading(false);
      return;
    }

    // 2. Validate Password
    if (!password) {
      setError(t('Please fill all fields'));
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError(t('signup.passwordMinLength'));
      setLoading(false);
      return;
    }

    // 3. Validate Phone
    const phoneValidation = validateYemenPhone(phone, t);
    if (!phoneValidation.valid) {
      setError(phoneValidation.errorMsg);
      setLoading(false);
      return;
    }
    const fullPhone = phoneValidation.fullPhone;
    const phoneChanged = fullPhone !== originalPhone;

    try {
      if (phoneChanged) {
        // Fail fast before WhatsApp OTP cost if phone already exists
        const { data: existingUser, error: checkError } = await supabase
          .from('user')
          .select('user_id')
          .eq('phone', fullPhone)
          .neq('user_id', user.user_id)
          .maybeSingle();

        if (checkError) {
          handleError(checkError, { context: 'Profile Phone Check' });
          setLoading(false);
          return;
        }

        if (existingUser) {
          setError(t('signup.phoneAlreadyRegistered'));
          setLoading(false);
          return;
        }

        // Send OTP
        const result = await notificationService.sendOtp(fullPhone);

        if (!result.success) {
          const detail = result.error || result.details || '';
          if (detail.includes('Failed to fetch') || detail.includes('NetworkError') || detail.includes('net::ERR') || detail.includes('Network Error')) {
            setError(t('signup.networkError'));
          } else if (detail.includes('rate') || detail.includes('limit')) {
            setError(t('signup.tooManyAttempts'));
          } else {
            setError(t('signup.otpSendFailed'));
          }
          if (detail) {
            handleError(new Error(detail), { context: 'Profile OTP function', silent: true });
          }
          setLoading(false);
          return;
        }

        // Navigate to OTPVerification page with isPhoneChange flow context
        navigate('/verify-otp', {
          state: {
            phone: fullPhone,
            fullname: fullname.trim(),
            password,
            email: email || null,
            expectedOtp: result.otp,
            isPhoneChange: true,
          },
        });
      } else {
        // Update direct profile details since phone number is unchanged
        const { data, error: updateError } = await supabase
          .from('user')
          .update({ full_name: fullname, password, email: email || null })
          .eq('user_id', user.user_id)
          .select()
          .single();

        if (updateError) {
          handleError(updateError, { context: 'Profile Info Save' });
          setLoading(false);
          return;
        }
        
        if (data) {
          setStoredUser(data);
        }

        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000);
      }
    } catch (err: any) {
      handleError(err, { context: 'Profile Save Catch' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <PageShell withBottomNav>
      <PageHeader title={t('Personal Information')} showBack />

      <main className={MAIN_CLASS}>
        <div className="px-4 py-8 flex flex-col items-center">
          <div className="relative mb-4">
            <div className={`w-28 h-28 rounded-full bg-white dark:bg-surface-dark shadow-lg flex items-center justify-center overflow-hidden border-4 border-white dark:border-surface-dark ${uploading ? 'opacity-50' : ''}`}>
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined filled text-[64px] text-gray-300 dark:text-gray-600">person</span>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <label className="absolute bottom-1 right-1 w-8 h-8 bg-primary rounded-full border-4 border-white dark:border-surface-dark flex items-center justify-center text-white shadow-sm cursor-pointer hover:bg-primary-dark transition-colors">
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
                className={`w-full bg-white dark:bg-surface-dark text-text-main rounded-2xl border border-transparent ring-1 ring-gray-200 dark:ring-gray-700 py-3.5 focus:ring-1 focus:ring-[#56BCA4] focus:border-[#56BCA4] outline-none transition-all placeholder:text-gray-400 font-almarai ${i18n.language === 'ar' ? 'text-right pr-12 pl-4' : 'text-left pl-12 pr-4'}`} 
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
            <div className="relative" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
              <div className={`absolute top-1/2 -translate-y-1/2 font-bold text-gray-500 font-sans flex items-center gap-2 pointer-events-none ${i18n.language === 'ar' ? 'left-4' : 'left-4'}`} dir="ltr">
                <span>|</span>
                <span className="text-text-main">+967</span>
              </div>
              <input 
                className={`w-full bg-white dark:bg-surface-dark text-text-main rounded-2xl border border-transparent ring-1 ring-gray-200 dark:ring-gray-700 py-3.5 focus:ring-1 focus:ring-[#56BCA4] focus:border-[#56BCA4] outline-none transition-all placeholder:text-gray-400 font-almarai ${i18n.language === 'ar' ? 'pr-12 pl-24 text-right' : 'pl-24 pr-12 text-left'}`} 
                dir="ltr" 
                id="phone" 
                type="tel" 
                inputMode="numeric"
                maxLength={9}
                value={phone}
                disabled={loading}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d]/g, '');
                  setPhone(val);
                }}
                style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}
              />
              <div className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${i18n.language === 'ar' ? 'right-4' : 'left-4 pl-42'}`} style={i18n.language !== 'ar' ? { left: 'auto', right: '1rem' } : {}}>
                <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">phone</span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <label className={`block text-sm font-medium text-text-muted mb-1.5 ${i18n.language === 'ar' ? 'mr-1' : 'ml-1'}`} htmlFor="password">{t('Password')}</label>
            <div className="relative">
              <input 
                className={`w-full bg-white dark:bg-surface-dark text-text-main rounded-2xl border border-transparent ring-1 ring-gray-200 dark:ring-gray-700 py-3.5 focus:ring-1 focus:ring-[#56BCA4] focus:border-[#56BCA4] outline-none transition-all placeholder:text-gray-400 font-almarai ${i18n.language === 'ar' ? 'text-right pr-12 pl-12' : 'text-left pl-12 pr-12'}`} 
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
                className={`w-full bg-white dark:bg-surface-dark text-text-main rounded-2xl border border-transparent ring-1 ring-gray-200 dark:ring-gray-700 py-3.5 focus:ring-1 focus:ring-[#56BCA4] focus:border-[#56BCA4] outline-none transition-all placeholder:text-gray-400 font-almarai ${i18n.language === 'ar' ? 'text-right pr-12 pl-4' : 'text-left pl-12 pr-4'}`} 
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
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500">
              <span className="material-symbols-outlined text-[32px]">warning</span>
            </div>
            <h3 className="text-xl font-bold text-text-main mb-2">{t('Confirm Save')}</h3>
            <p className="text-text-muted mb-6">{t('Are you sure you want to save changes to your personal information?')}</p>
            <div className="flex gap-3" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
              <button 
                onClick={handleCancel}
                className="flex-1 py-3 rounded-xl font-bold text-text-main bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <h3 className="text-xl font-bold text-text-main mb-2">{t('Saved Successfully')}</h3>
            <p className="text-text-muted">{t('Your personal information has been successfully updated.')}</p>
          </div>
        </div>
      )}

    </PageShell>
  );
}
