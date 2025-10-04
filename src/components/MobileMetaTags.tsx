import { useEffect } from 'react';

export function MobileMetaTags() {
  useEffect(() => {
    // Ensure viewport meta tag is set correctly
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');

    // Add PWA meta tags
    const metaTags = [
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: 'System Wolontariatu' },
      { name: 'application-name', content: 'System Wolontariatu' },
      { name: 'theme-color', content: '#ffffff' },
      { name: 'msapplication-navbutton-color', content: '#ffffff' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'touch-action', content: 'manipulation' }
    ];

    metaTags.forEach(({ name, content }) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });

    // Add manifest link
    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.setAttribute('rel', 'manifest');
      manifestLink.setAttribute('href', '/manifest.json');
      document.head.appendChild(manifestLink);
    }

    // Prevent zoom on double tap (iOS)
    let lastTouchEnd = 0;
    const preventZoom = (e: TouchEvent) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };
    
    document.addEventListener('touchend', preventZoom, { passive: false });

    // Add mobile-specific classes
    document.body.classList.add('mobile-optimized');
    
    // Detect if it's running as PWA
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      document.body.classList.add('pwa-mode');
    }

    // Handle orientation changes
    const handleOrientationChange = () => {
      // Force viewport recalculation
      const meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        meta.setAttribute('content', 'width=1, initial-scale=1');
        setTimeout(() => {
          meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
        }, 100);
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);

    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    return () => {
      document.removeEventListener('touchend', preventZoom);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return null;
}