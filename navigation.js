const header = document.querySelector('.site-header');
const toggle = header?.querySelector('.menu-toggle');
const explore = header?.querySelector('.explore-menu');
const mobile = matchMedia('(max-width: 759px)');

if (header && toggle && explore) {
  document.documentElement.classList.add('navigation-ready');
  toggle.hidden = false;

  function closeNavigation(restoreFocus = false) {
    const wasOpen = header.classList.contains('menu-is-open');
    header.classList.remove('menu-is-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (!mobile.matches) explore.open = false;
    if (restoreFocus) {
      if (mobile.matches && wasOpen) toggle.focus();
      else explore.querySelector('summary').focus();
    }
  }

  toggle.addEventListener('click', () => {
    const open = !header.classList.contains('menu-is-open');
    header.classList.toggle('menu-is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  header.addEventListener('click', event => {
    if (event.target.closest('a')) closeNavigation();
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) closeNavigation();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && (header.classList.contains('menu-is-open') || (!mobile.matches && explore.open))) {
      closeNavigation(true);
    }
  });
  // Collapse when keyboard focus leaves the navigation, without trapping focus inside it.
  header.addEventListener('focusout', event => {
    if (!header.contains(event.relatedTarget)) closeNavigation();
  });
  function syncLayout() {
    closeNavigation();
    explore.open = mobile.matches;
  }
  mobile.addEventListener('change', syncLayout);
  syncLayout();
}

// A link from a reading page must land on the finished hillside, whose clearings move
// as fonts and artwork load. Native in-page links already work once it is laid out.
if (location.hash && document.querySelector('.world')) {
  let userMoved = false;
  const noteInteraction = () => { userMoved = true; };
  const inputs = ['pointerdown', 'wheel', 'keydown', 'touchstart'];
  for (const input of inputs) addEventListener(input, noteInteraction, { passive: true, once: true });
  const loaded = document.readyState === 'complete' ? Promise.resolve()
    : new Promise(resolve => addEventListener('load', resolve, { once: true }));
  Promise.all([loaded, document.fonts.ready]).then(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      for (const input of inputs) removeEventListener(input, noteInteraction);
      if (userMoved) return;
      try {
        document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ block: 'start', behavior: 'instant' });
      } catch { /* Leave malformed or unknown fragments to the browser. */ }
    }));
  });
}
