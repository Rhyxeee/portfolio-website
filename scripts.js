/* NAV HIGHLIGHTER
 * - Uses IntersectionObserver to detect the section most visible around the viewport center.
 * - Falls back to viewport-midpoint checking if IntersectionObserver is not available.
 * - Always highlights exactly one nav link.
 * - Handles top and bottom edges, fixed header offsets, and logs debug info when debug=true.
 */

/* ==== CONFIG ==== */
const DEBUG = true;            // set false to turn off console logs
const ACTIVE_CLASS = 'active'; // CSS class to toggle on links
const NAV_SELECTOR = '.floating-nav'; // selector for the nav container
const LINK_SELECTOR = `${NAV_SELECTOR} a`; // selector to collect links
const SECTION_OFFSET = 0;      // if you have a fixed header, set header height (px) here

/* ==== DOM SETUP ==== */
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

  // Map each link -> target section element (or null)
  const linkToSection = links.map(link => {
    const href = link.getAttribute('href') || '';
    // Only handle same-page anchors (starting with '#')
    if (!href.startsWith('#')) return { link, section: null, href };
    const id = href.slice(1);
    const section = document.getElementById(id);
    return { link, section, href, id };
  });

  // Quick sanity check: ensure all anchor targets exist
  linkToSection.forEach(({ link, section, href, id }) => {
    if (!section) {
      console.error('Nav link target not found for', href, ' — check your HTML id/href match.');
    } else if (DEBUG) {
      console.log('Mapped link', href, '->', section.tagName, 'id=' + section.id);
    }
  });

  // Filter to only valid pairs (links with section)
  const validPairs = linkToSection.filter(x => x.section);

  if (validPairs.length === 0) {
    if (DEBUG) console.warn('No valid link->section pairs. Aborting.');
    return;
  }

  /* ==== Utility: clear all active states and set one === */
  function setActiveLink(activeLink) {
    links.forEach(a => a.classList.remove(ACTIVE_CLASS));
    if (activeLink) activeLink.classList.add(ACTIVE_CLASS);
  }

  /* ==== Primary approach: IntersectionObserver (recommended) ==== */
  if ('IntersectionObserver' in window) {
    // We'll observe each section and pick the section with highest intersection ratio
    // The rootMargin is tuned so the intersection evaluates roughly around viewport center.
    const observerOptions = {
      root: null,
      rootMargin: `-${Math.max(0, SECTION_OFFSET)}px 0px -50% 0px`, 
      threshold: buildThresholdList()
    };

    // thresholds for smoother ratio changes
    function buildThresholdList() {
      const thresholds = [];
      for (let i=0; i<=100; i+=5) thresholds.push(i/100);
      return thresholds;
    }

    let visibilityMap = new Map(); // section -> intersectionRatio

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

      // Choose section with highest intersectionRatio
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

    // observe the target sections
    validPairs.forEach(p => {
      visibilityMap.set(p.section, 0);
      io.observe(p.section);
    });

    // edge-case fix: when loading at bottom or top, force one active
    window.addEventListener('load', () => {
      // If nothing active, pick the nearest section to viewport center
      const currentlyActive = nav.querySelector(`a.${ACTIVE_CLASS}`);
      if (!currentlyActive) findByMidpointAndSet();
    });

  } else {
    /* ==== Fallback: viewport midpoint check on scroll (robust enough) ==== */
    if (DEBUG) console.warn('IntersectionObserver not supported — using fallback.');

    function findByMidpointAndSet() {
      const midpoint = window.innerHeight / 2;
      // compute distance of midpoint to each section's bounding rect center
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

    // throttle helper
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

    // initial set
    findByMidpointAndSet();
  }

  /* ==== Helper: exact top/bottom edge handling (optional) ==== */
  // If user scrolled to very top, highlight Home explicitly
  window.addEventListener('scroll', () => {
    const sc = window.scrollY || window.pageYOffset;
    if (sc === 0) {
      const homePair = validPairs.find(p => p.id === 'home' || p.href === '#home');
      if (homePair) setActiveLink(homePair.link);
      if (DEBUG) console.log('TOP OF PAGE -> Home active');
    }
    // bottom of page: ensure last section active
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2) {
      const last = validPairs[validPairs.length-1];
      if (last) setActiveLink(last.link);
      if (DEBUG) console.log('BOTTOM OF PAGE ->', last.id || last.href);
    }
  }, { passive: true });

}); // end DOMContentLoaded
