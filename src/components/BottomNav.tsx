import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card dark:bg-surface-dark border-t border-border dark:border-white/10 shadow-[var(--shadow-bottom-nav)]">
      <div className="flex justify-around items-center h-16 pb-safe px-2 max-w-md mx-auto">
        <Link
          to="/news"
          className={`flex flex-col items-center justify-center p-2 group w-full transition-colors ${
            isActive('/news')
              ? 'text-primary'
              : 'text-text-muted dark:text-gray-500 hover:text-primary dark:hover:text-primary'
          }`}
        >
          <span
            className="material-symbols-outlined text-[28px] font-normal"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            newspaper
          </span>
        </Link>
        <Link
          to="/map"
          className={`flex flex-col items-center justify-center w-full p-2 transition-colors group ${
            isActive('/map')
              ? 'text-primary'
              : 'text-text-muted dark:text-gray-500 hover:text-primary dark:hover:text-primary'
          }`}
        >
          <span
            className="material-symbols-outlined text-[28px] font-normal"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            location_on
          </span>
        </Link>
        <Link
          to="/chat"
          className={`flex flex-col items-center justify-center w-full p-2 transition-colors group ${
            isActive('/chat')
              ? 'text-primary'
              : 'text-text-muted dark:text-gray-500 hover:text-primary dark:hover:text-primary'
          }`}
        >
          <span
            className="material-symbols-outlined text-[28px] font-normal"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            smart_toy
          </span>
        </Link>
        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center w-full p-2 transition-colors group ${
            isActive('/profile')
              ? 'text-primary'
              : 'text-text-muted dark:text-gray-500 hover:text-primary dark:hover:text-primary'
          }`}
        >
          <span
            className="material-symbols-outlined text-[28px] font-normal"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            person
          </span>
        </Link>
      </div>
    </nav>
  );
}
