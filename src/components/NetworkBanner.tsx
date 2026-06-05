/**
 * NetworkBanner - شريط حالة الاتصال الثابت
 * يظهر في الجزء العلوي عند انقطاع الإنترنت ليخبر المستخدم بوضع عدم الاتصال.
 */

import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function NetworkBanner() {
  const { isOffline } = useNetworkStatus();
  const { t, i18n } = useTranslation();

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white text-center py-2 px-4 shadow-lg text-sm font-bold font-almarai border-b border-white/20"
          dir={i18n.dir()}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              wifi_off
            </span>
            <span>{t('network.offline')}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
