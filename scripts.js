const DEBUG = true;
const ACTIVE_CLASS = 'active';
const NAV_SELECTOR = '.floating-nav';
const LINK_SELECTOR = `${NAV_SELECTOR} a`;
const SECTION_OFFSET = 0;

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector(NAV_SELECTOR);
  if (!nav) {
    if (DEBUG) console.warn('Nav not found:', NAV_SELECTOR);
    return;
  }

  const links = Array.from(document.querySelectorAll(LINK_SELECTOR));
  if (links.length === 0) {
    if (DEBUG) console.warn('No nav links found for selector:', LINK_SELECTOR);
    return;
  }

  const linkToSection = links.map(link => {
    const href = link.getAttribute('href') || '';
    if (!href.startsWith('#')) return { link, section: null, href };
    const id = href.slice(1);
    const section = document.getElementById(id);
    return { link, section, href, id };
  });

  linkToSection.forEach(({ link, section, href, id }) => {
    if (!section) {
      console.error('Nav link target not found for', href, ' — check your HTML id/href match.');
    } else if (DEBUG) {
      console.log('Mapped link', href, '->', section.tagName, 'id=' + section.id);
    }
  });

  const validPairs = linkToSection.filter(x => x.section);

  if (validPairs.length === 0) {
    if (DEBUG) console.warn('No valid link->section pairs. Aborting.');
    return;
  }

  function setActiveLink(activeLink) {
    links.forEach(a => a.classList.remove(ACTIVE_CLASS));
    if (activeLink) activeLink.classList.add(ACTIVE_CLASS);
  }

  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: `-${Math.max(0, SECTION_OFFSET)}px 0px -50% 0px`, 
      threshold: buildThresholdList()
    };

    function buildThresholdList() {
      const thresholds = [];
      for (let i=0; i<=100; i+=5) thresholds.push(i/100);
      return thresholds;
    }

    let visibilityMap = new Map();

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const sec = entry.target;
        visibilityMap.set(sec, entry.intersectionRatio || 0);
        if (DEBUG) {
          console.log('[IO]', sec.id, 'ratio=', entry.intersectionRatio.toFixed(3),
            'rectTop=', Math.round(entry.boundingClientRect.top),
            'rectBottom=', Math.round(entry.boundingClientRect.bottom));
        }
      });

      let best = { section: null, ratio: -1 };
      for (const [sec, ratio] of visibilityMap.entries()) {
        if (ratio > best.ratio) best = { section: sec, ratio };
      }

      if (best.section) {
        const pair = validPairs.find(p => p.section === best.section);
        if (pair) {
          setActiveLink(pair.link);
          if (DEBUG) console.log('ACTIVE ->', pair.id, 'ratio=', best.ratio.toFixed(3));
        }
      }
    }, observerOptions);

    validPairs.forEach(p => {
      visibilityMap.set(p.section, 0);
      io.observe(p.section);
    });

    window.addEventListener('load', () => {
      const currentlyActive = nav.querySelector(`a.${ACTIVE_CLASS}`);
      if (!currentlyActive) findByMidpointAndSet();
    });

  } else {
    if (DEBUG) console.warn('IntersectionObserver not supported — using fallback.');

    function findByMidpointAndSet() {
      const midpoint = window.innerHeight / 2;
      let best = { section: null, dist: Infinity };
      validPairs.forEach(p => {
        const rect = p.section.getBoundingClientRect();
        const center = (rect.top + rect.bottom) / 2;
        const dist = Math.abs(center - midpoint);
        if (dist < best.dist) best = { section: p.section, dist };
      });
      if (best.section) {
        const pair = validPairs.find(p => p.section === best.section);
        setActiveLink(pair.link);
        if (DEBUG) console.log('MIDPOINT ACTIVE ->', pair.id, 'dist=', Math.round(best.dist));
      }
    }
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          findByMidpointAndSet();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    findByMidpointAndSet();
  }
  window.addEventListener('scroll', () => {
    const sc = window.scrollY || window.pageYOffset;
    if (sc === 0) {
      const homePair = validPairs.find(p => p.id === 'home' || p.href === '#home');
      if (homePair) setActiveLink(homePair.link);
      if (DEBUG) console.log('TOP OF PAGE -> Home active');
    }
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2) {
      const last = validPairs[validPairs.length-1];
      if (last) setActiveLink(last.link);
      if (DEBUG) console.log('BOTTOM OF PAGE ->', last.id || last.href);
    }
  }, { passive: true });

const profileLogo = document.getElementById('profileLogo');
const profileModalBack = document.querySelector('.profile-modal-back');
const profileModalClose = document.querySelector('.profile-modal-close');
const body = document.body;

function openProfileModal() {
  console.log('Profile modal opening');
  profileModalBack.classList.add('show');
  profileModalBack.setAttribute('aria-hidden', 'false');
  profileModalClose.focus();
  body.style.overflow = 'hidden';
}

function closeProfileModal() {
  console.log('Profile modal closing');
  profileModalBack.classList.remove('show');
  profileModalBack.setAttribute('aria-hidden', 'true');
  body.style.overflow = '';
  profileLogo.focus();
}

if (profileLogo) {
  profileLogo.addEventListener('click', openProfileModal);
  profileLogo.addEventListener('keypress', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openProfileModal();
    }
  });
}

if (profileModalClose) {
  profileModalClose.addEventListener('click', closeProfileModal);
}

if (profileModalBack) {
  profileModalBack.addEventListener('click', e => {
    if (e.target === profileModalBack) closeProfileModal();
  });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && profileModalBack.classList.contains('show')) {
    closeProfileModal();
  }
});

const NAV_WRAPPER_SELECTOR = '.floating-nav-wrapper';
const HIDDEN_CLASS = 'hidden-nav';
const SCROLL_HIDE_DELAY = 550;
const SCROLL_THRESHOLD = 5;

const navWrapper = document.querySelector(NAV_WRAPPER_SELECTOR);

if (navWrapper) {
    let isNavHidden = false;
    let lastScrollY = window.scrollY;
    let scrollTimeout = null;
    let scrollTicking = false;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    function hideNav() {
        if (isNavHidden) return;
        navWrapper.classList.add(HIDDEN_CLASS);
        isNavHidden = true;
        if (DEBUG) console.log('Nav hidden');
    }
    
    function showNav() {
        if (!isNavHidden) return;
        navWrapper.classList.remove(HIDDEN_CLASS);
        isNavHidden = false;
        if (DEBUG) console.log('Nav shown');
    }
    
    function handleScrollForNav() {
        const currentScrollY = window.scrollY;
        const scrollDifference = Math.abs(currentScrollY - lastScrollY);

        if (scrollDifference < SCROLL_THRESHOLD) {
            return;
        }

        if (!isNavHidden) {
            hideNav();
        }

        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }

        scrollTimeout = setTimeout(() => {
            showNav();
        }, SCROLL_HIDE_DELAY);
        
        lastScrollY = currentScrollY;
    }

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => {
                handleScrollForNav();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });

    navWrapper.addEventListener('mouseenter', () => {
        showNav();
        if (scrollTimeout) clearTimeout(scrollTimeout);
    });

    navWrapper.addEventListener('focusin', () => {
        showNav();
        if (scrollTimeout) clearTimeout(scrollTimeout);
    });
    
    navWrapper.addEventListener('mouseleave', () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (!navWrapper.matches(':focus-within')) {
                hideNav();
            }
        }, SCROLL_HIDE_DELAY * 2);
    });
    
    if (DEBUG) console.log('Auto-hide navigation initialized');
}

});
