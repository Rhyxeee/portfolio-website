// scripts.js - robust toggle + diagnostics + persistence
(function () {
  'use strict';

  // Global error catcher to help debugging
  window.addEventListener('error', function (e) {
    console.error('[scripts.js] window error', e.error || e.message, e.filename, 'line', e.lineno);
  });

  document.addEventListener('DOMContentLoaded', () => {
    const $ = sel => document.querySelector(sel);
    const $$ = sel => Array.from(document.querySelectorAll(sel));
    const log = (...args) => {
      if (window.console && console.info) console.info('[scripts.js]', ...args);
    };

    log('DOM ready');

    // ===== ELEMENTS =====
    const mobileViewBtn = $('#mobileViewBtn');
    const desktopViewBtn = $('#desktopViewBtn');
    const body = document.body;
    const scrollBtn = $('#scrollTopBtn');

    log('elements', { mobileViewBtn, desktopViewBtn, body, scrollBtn });

    // Defensive: if elements missing, try fallback selectors
    if (!mobileViewBtn) {
      const m = document.querySelector('.view-toggle-buttons button:first-child');
      if (m) {
        log('mobileViewBtn not found by id; using fallback', m);
      }
    }
    if (!desktopViewBtn) {
      const d = document.querySelector('.view-toggle-buttons button:last-child');
      if (d) {
        log('desktopViewBtn not found by id; using fallback', d);
      }
    }

    // Helper to update UI + aria + storage
    function setViewState({ mobile }) {
      try {
        if (mobile) {
          body.classList.add('mobile-view');
          if (mobileViewBtn) { mobileViewBtn.classList.add('active'); mobileViewBtn.setAttribute('aria-pressed', 'true'); }
          if (desktopViewBtn) { desktopViewBtn.classList.remove('active'); desktopViewBtn.setAttribute('aria-pressed', 'false'); }
          localStorage.setItem('preferredView', 'mobile');
          log('setViewState -> mobile');
        } else {
          body.classList.remove('mobile-view');
          if (desktopViewBtn) { desktopViewBtn.classList.add('active'); desktopViewBtn.setAttribute('aria-pressed', 'true'); }
          if (mobileViewBtn) { mobileViewBtn.classList.remove('active'); mobileViewBtn.setAttribute('aria-pressed', 'false'); }
          localStorage.setItem('preferredView', 'desktop');
          log('setViewState -> desktop');
        }
      } catch (err) {
        console.error('[scripts.js] setViewState error', err);
      }
    }

    // Initialize from localStorage or markup
    try {
      const pref = localStorage.getItem('preferredView');
      if (pref === 'mobile') setViewState({ mobile: true });
      else if (pref === 'desktop') setViewState({ mobile: false });
      else {
        // fall back to markup: if desktop button has .active or aria-pressed true
        const desktopPressed = desktopViewBtn && (desktopViewBtn.classList.contains('active') || desktopViewBtn.getAttribute('aria-pressed') === 'true');
        setViewState({ mobile: !desktopPressed });
      }
    } catch (err) {
      console.error('[scripts.js] init localStorage error', err);
    }

    // Attach listeners safely
    function attach(btn, fn) {
      if (!btn) return;
      // pointerup covers touch and mouse; click as fallback
      btn.addEventListener('pointerup', fn, { passive: true });
      btn.addEventListener('click', fn, { passive: true });
      btn.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          fn(ev);
        }
      });
      // add a small aria toggle when activated by keyboard or click
      btn.setAttribute('role', 'button');
    }

    // Guard to prevent ultra-rapid toggles
    let lastToggle = 0;
    function guard(fn) {
      return function (ev) {
        const now = Date.now();
        if (now - lastToggle < 120) return;
        lastToggle = now;
        try { fn(ev); } catch (err) { console.error('[scripts.js] guarded handler error', err); }
      };
    }

    attach(mobileViewBtn, guard((ev) => {
      ev && ev.preventDefault && ev.preventDefault();
      setViewState({ mobile: true });
    }));
    attach(desktopViewBtn, guard((ev) => {
      ev && ev.preventDefault && ev.preventDefault();
      setViewState({ mobile: false });
    }));

    // Expose a helper for console testing
    window.debugToggleMobile = function () {
      const isMobile = document.body.classList.contains('mobile-view');
      setViewState({ mobile: !isMobile });
      log('debugToggleMobile -> now mobile?', document.body.classList.contains('mobile-view'));
    };

    log('listeners attached. Try window.debugToggleMobile() or click the buttons.');

    // Optional: quick visual sanity log when body.mobile-view class changes
    new MutationObserver((mutations) => {
      mutations.forEach(m => {
        if (m.attributeName === 'class') {
          log('body class changed:', body.className);
        }
      });
    }).observe(body, { attributes: true, attributeFilter: ['class'] });

    // End of DOMContentLoaded
  }); // DOMContentLoaded
})(); // IIFE