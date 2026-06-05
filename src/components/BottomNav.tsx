import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type NavItem = {
  path: string;
  icon: string;
  labelKey: string;
  matchSubRoutes?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { path: '/news', icon: 'newspaper', labelKey: 'nav.news', matchSubRoutes: true },
  { path: '/map', icon: 'location_on', labelKey: 'nav.map' },
  { path: '/chat', icon: 'smart_toy', labelKey: 'nav.chat' },
  { path: '/profile', icon: 'person', labelKey: 'nav.profile' },
];

function isNavActive(pathname: string, path: string, matchSubRoutes?: boolean) {
  if (matchSubRoutes) {
    return pathname === path || pathname.startsWith(`${path}/`);
  }
  return pathname === path;
}

function getLinkClassName(active: boolean) {
  return `flex flex-col items-center justify-center w-full p-2 transition-colors group ${
    active
      ? 'text-primary'
      : 'text-text-muted dark:text-gray-500 hover:text-primary dark:hover:text-primary'
  }`;
}

export default function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card dark:bg-surface-dark border-t border-border dark:border-white/10 shadow-[var(--shadow-bottom-nav)]"
      aria-label={t('nav.main')}
    >
      <div className="flex justify-around items-center h-16 pb-safe px-2 max-w-md mx-auto">
        {NAV_ITEMS.map(({ path, icon, labelKey, matchSubRoutes }) => {
          const active = isNavActive(location.pathname, path, matchSubRoutes);
          const label = t(labelKey);

          return (
            <Link
              key={path}
              to={path}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={getLinkClassName(active)}
            >
              <span
                className="material-symbols-outlined text-[28px] font-normal"
                style={{ fontVariationSettings: "'FILL' 0" }}
                aria-hidden="true"
              >
                {icon}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
