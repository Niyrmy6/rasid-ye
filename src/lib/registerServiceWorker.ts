/**
 * Registers the PWA service worker with a build-scoped URL so deployments
 * invalidate stale caches (paired with network-first HTML in `public/sw.js`).
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  const buildId = import.meta.env.VITE_BUILD_ID ?? 'dev';

  window.addEventListener('load', () => {
    void (async () => {
      try {
        const registration = await navigator.serviceWorker.register(`/sw.js?build=${buildId}`, {
          updateViaCache: 'none',
        });

        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          if (!installing) return;

          installing.addEventListener('statechange', () => {
            if (installing.state !== 'installed') return;
            if (!navigator.serviceWorker.controller) return;
            installing.postMessage({ type: 'SKIP_WAITING' });
          });
        });

        await registration.update();
      } catch (error) {
        console.warn('Service worker registration failed:', error);
      }
    })();
  });

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}
