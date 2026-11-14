// Holds the loading screen until the first view of the hillside is actually painted: fonts settled,
// and every image the visitor will see in roughly the first screen and a half decoded.
// Runs after hillside.js, so the scene has already been laid out once by the time this executes.
const root = document.documentElement;
const loader = document.querySelector('.site-loader');
// Long enough for the descent to read as a landing even when everything is already cached.
const MIN_MS = 1300, MAX_MS = 8000, GLIDE_MS = 1600;
// The descent stops just above the ground (a few vh up) while the cookie gets its chomp, then flares down to land.
const HOVER_P = .82;
// How far below the page top we land (px); see measureGround().
let ground = 0;

if (loader && root.classList.contains('is-loading')) run();
else loader?.remove();

async function run() {
  // index.html fades the loader's own art in from an inline script; this times from that moment.
  const shownAt = () => window.__loaderShownAt ?? performance.now();

  const cookie = buildCookie(loader.querySelector('[data-loader-cookie]'));
  const caption = loader.querySelector('[data-loader-caption]');
  const percent = loader.querySelector('[data-loader-percent]');
  const captions = ['Planting the hillside…', 'Watering the seedlings…', 'Hanging the signboards…', 'Baking the last bits…'];
  let shown = 0, lastMove = performance.now();
  const setProgress = p => {
    const v = Math.max(shown, Math.min(1, p));
    if (v !== shown) lastMove = performance.now();
    shown = v;
    cookie.setTarget(v);
    root.style.setProperty('--loader-p', Math.min(v, HOVER_P).toFixed(3));
    caption.textContent = captions[Math.min(captions.length - 1, Math.floor(v * captions.length))];
  };
  measureGround();
  cookie.onCount = n => { percent.textContent = n === cookie.total ? `${n} / ${n} bits baked` : `${n} / ${cookie.total} bits`; };
  setProgress(.05);

  const timeout = new Promise(resolve => setTimeout(resolve, MAX_MS));
  await Promise.race([document.fonts?.ready, timeout]);
  setProgress(.15);
  // Fonts can trigger a relayout; let hillside.js redraw before we look for what's on screen.
  await new Promise(r => { requestAnimationFrame(r); setTimeout(r, 100); });
  measureGround();

  const urls = visibleImageUrls();
  let done = 0;
  const step = () => setProgress(.15 + .85 * (++done / Math.max(1, urls.length)));
  await Promise.race([Promise.all(urls.map(src => preload(src).then(step))), timeout]);
  setProgress(1);
  // Let the last bits land (they drop in one at a time even when progress jumps).
  await Promise.race([cookie.filled, timeout]);

  // Give the fade-in time to finish so the screen never blinks in and straight back out.
  // ...and for the last stretch of the descent (the 1.6s --loader-glide in loader.css) to finish before touchdown.
  const now = performance.now();
  const wait = Math.max(MIN_MS - (now - shownAt()), GLIDE_MS - (now - lastMove));
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  await cookie.chomp(loader.querySelector('.loader-crew img:last-child'));
  // Final flare: the last few vh of descent, then touchdown.
  root.style.setProperty('--loader-p', '1');
  await new Promise(r => setTimeout(r, GLIDE_MS * .8));
  finish();
}

// Where to land. If the first painted hill crest sits below ~55% of the screen (narrow layouts, where the first
// view is all sky), descend that much further so the hills are under us; finish() then pans back up to the top.
function measureGround() {
  const worldTop = document.querySelector('.world')?.getBoundingClientRect().top ?? 0;
  const edges = [...document.querySelectorAll('#world-art image[href*="-edge."]')].map(el => el.getBoundingClientRect()).filter(r => r.height);
  if (!edges.length) return;
  const crest = Math.min(...edges.map(r => r.top - worldTop + r.height * .08));
  ground = Math.max(0, Math.round(crest - innerHeight * .55));
  root.style.setProperty('--loader-ground', `${ground}px`);
}

// Image sources in the first ~1.5 viewports: SVG <image>s from the hillside plus eager <img>s.
function visibleImageUrls() {
  const limit = innerHeight * 1.5, urls = new Set();
  // Measured from the top of the world, since the page is lowered (transformed) while we're "in the air".
  const worldTop = document.querySelector('.world')?.getBoundingClientRect().top ?? 0;
  const nearTop = el => { const r = el.getBoundingClientRect(); return r.bottom - worldTop > 0 && r.top - worldTop < limit && r.width > 0; };
  document.querySelectorAll('#world-art image').forEach(el => {
    const href = el.getAttribute('href');
    if (href && nearTop(el)) urls.add(new URL(href, location.href).href);
  });
  document.querySelectorAll('main img:not([loading="lazy"]), .site-header img').forEach(el => {
    if (el.currentSrc || el.src) if (nearTop(el)) urls.add(el.currentSrc || el.src);
  });
  return [...urls];
}

// Same URL as the page uses, so the browser shares the request; resolves on load or error.
// (Load events rather than img.decode(), which can stall in background tabs.)
function preload(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = img.onerror = resolve;
    img.src = src;
    if (img.complete) resolve();
  });
}

function finish() {
  try { sessionStorage.setItem('smh-loaded', '1'); } catch {}
  root.classList.add('loader-leaving');
  root.classList.remove('is-loading');
  loader.setAttribute('aria-hidden', 'true');
  loader.removeAttribute('aria-busy');
  // Landed on the hills below the fold: after the bump, pan up to the top, and only then bring in the words.
  const PAN_MS = 1400, BUMP_MS = 750;
  if (ground && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.style.setProperty('--loader-reveal', `${(BUMP_MS + PAN_MS - 300) / 1000}s`);
    setTimeout(() => { root.classList.add('loader-panning'); root.style.setProperty('--loader-ground', '0px'); }, BUMP_MS);
  }
  // The slowest cloud finishes around 2s (plus the pan, if any); then the loader is removed from the page entirely.
  setTimeout(() => {
    loader.remove();
    root.classList.remove('loader-leaving', 'loader-ready', 'loader-panning');
    ['--loader-p', '--loader-ground', '--loader-reveal'].forEach(v => root.style.removeProperty(v));
  }, ground ? BUMP_MS + PAN_MS + 400 : 2100);
}

// A pixel cookie: a 13×13 grid cut to a circle. Bits fill from the middle out (with some scatter, like
// bits arriving), dropping in one at a time so even a big jump in progress reads as baking.
function buildCookie(el) {
  const COLS = 13, C = (COLS - 1) / 2, R = 6.45;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const chips = new Set(['4,4', '8,3', '3,7', '6,6', '9,7', '5,10', '8,10', '10,5', '2,5']);
  const inside = (x, y) => Math.hypot(x - C, y - C) <= R;
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const bits = [];
  el.style.setProperty('--cols', COLS);
  for (let y = 0; y < COLS; y++) for (let x = 0; x < COLS; x++) {
    const i = document.createElement('i');
    el.append(i);
    if (!inside(x, y)) { i.className = 'out'; continue; }
    const d = Math.hypot(x - C, y - C);
    const rim = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
    i.className = 'slot ' + (rim ? 'edge' : chips.has(`${x},${y}`) ? 'chip' : (x + y < 7 && d > 3.2) ? 'hi' : '');
    bits.push({ i, x, y, key: d + rand() * 3.5 });
  }
  bits.sort((a, b) => a.key - b.key);

  let target = 0, count = 0, raf = 0, resolveFilled;
  const api = {
    total: bits.length,
    onCount: () => {},
    filled: new Promise(r => (resolveFilled = r)),
    setTarget(p) { target = Math.round(p * bits.length); schedule(); },
    // Bite leans in; on contact a scalloped bite comes out of the upper right and the crumbs fall.
    async chomp(biter) {
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const bites = [[11.3, 0.9, 3.7], [12.9, 4.1, 2.9], [8.7, -0.9, 2.8]];
      const bitten = b => bites.some(([cx, cy, r]) => Math.hypot(b.x - cx, b.y - cy) <= r);
      if (!reduce && biter) { biter.classList.add('chomping'); await wait(200); }
      bits.forEach(b => {
        if (bitten(b)) {
          b.i.style.setProperty('--dx', `${(rand() * 40 + 6).toFixed(0)}px`);
          b.i.style.setProperty('--rot', `${(rand() * 240 - 120).toFixed(0)}deg`);
          b.i.style.setProperty('--cd', `${(rand() * .12).toFixed(2)}s`);
          b.i.classList.add('eaten');
        } else if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => bitten({ x: b.x + dx, y: b.y + dy }))) {
          b.i.className = b.i.className.replace(/\b(hi|chip)\b/, '') + ' edge'; // the bitten rim browns like the outer one
        }
      });
      el.classList.add('chomped');
      await wait(reduce ? 150 : 650);
    },
  };
  // rAF never fires in a background tab: if the backup timer beats it (or the tab is hidden), every pending bit lands at once.
  let timer = 0;
  function schedule() {
    if (raf || timer) return;
    raf = requestAnimationFrame(tick);
    timer = setTimeout(tick, 120, true);
  }
  function tick(stalled) {
    cancelAnimationFrame(raf); clearTimeout(timer); raf = timer = 0;
    if (count >= target) return;
    // Catch up quickly when far behind, but never place more than a few bits per frame.
    const n = stalled === true || document.hidden ? target - count : Math.min(target - count, Math.max(1, Math.ceil((target - count) / 10)), 4);
    for (let k = 0; k < n; k++) bits[count++].i.classList.replace('slot', 'on');
    api.onCount(count);
    if (count === bits.length) resolveFilled();
    schedule();
  }
  return api;
}
