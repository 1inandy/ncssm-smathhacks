import { remainingTime } from './countdown-time.js';

const clock = document.querySelector('#event-countdown');
let target = clock?.dataset.countdownAt, timeout;

// Seven-segment LCD digits for the tabletop clock, with the unlit segments faintly visible.
const hSeg = (cy, x1, x2) => `${x1},${cy} ${x1 + 1},${cy - 1} ${x2 - 1},${cy - 1} ${x2},${cy} ${x2 - 1},${cy + 1} ${x1 + 1},${cy + 1}`;
const vSeg = (cx, y1, y2) => `${cx},${y1} ${cx + 1},${y1 + 1} ${cx + 1},${y2 - 1} ${cx},${y2} ${cx - 1},${y2 - 1} ${cx - 1},${y1 + 1}`;
const SEGMENTS = { a: hSeg(1, 1.4, 10.6), b: vSeg(11, 1.4, 9.6), c: vSeg(11, 10.4, 18.6), d: hSeg(19, 1.4, 10.6), e: vSeg(1, 10.4, 18.6), f: vSeg(1, 1.4, 9.6), g: hSeg(10, 1.4, 10.6) };
const LIT = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg', '—': 'g' };
const segmentDigit = ch => `<svg class="seg" viewBox="0 0 12 20" aria-hidden="true">${Object.entries(SEGMENTS).map(([k, pts]) => `<polygon points="${pts}"${(LIT[ch] || '').includes(k) ? ' class="on"' : ''}/>`).join('')}</svg>`;
function show(el, text) {
  if (!clock.contains(el)) { el.textContent = text; return; }
  if (el.dataset.shown === text) return;
  el.dataset.shown = text;
  el.innerHTML = [...text].map(segmentDigit).join('');
}

function tick() {
  clearTimeout(timeout);
  if (!clock) return;
  const value = remainingTime(target);
  const timer = clock.querySelector('[data-countdown-timer]');
  const caption = clock.querySelector('[data-countdown-caption]');
  if (!value) {
    caption.textContent = 'Date coming soon';
    timer.setAttribute('aria-label', 'Event countdown date is not configured');
    for (const el of document.querySelectorAll('[data-countdown-unit]')) show(el, '—');
    return;
  }
  for (const el of document.querySelectorAll('[data-countdown-unit]')) {
    const unit = el.dataset.countdownUnit;
    show(el, unit === 'days' ? String(value.days) : String(value[unit]).padStart(2, '0'));
  }
  caption.textContent = value.arrived ? 'Event day is here!' : 'Until event day';
  // A timer is readable on demand but does not interrupt screen readers every second.
  timer.setAttribute('aria-label', value.arrived ? 'The event date has arrived' : `${value.days} days, ${value.hours} hours, ${value.minutes} minutes, ${value.seconds} seconds until event day`);
  if (!value.arrived && !document.hidden) timeout = setTimeout(tick, 1015 - Date.now() % 1000);
}

export function configureCountdown(config) {
  if (!clock) return;
  target = config.countdownAt;
  if (remainingTime(target)) {
    clock.dataset.countdownAt = target;
    const date = document.querySelector('[data-countdown-date]');
    if (date) {
      let formatter;
      try { formatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: config.countdownTimeZone || 'America/New_York' }); }
      catch { formatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' }); }
      date.textContent = formatter.format(new Date(target));
      date.dateTime = target;
    }
  }
  tick();
}

document.addEventListener('visibilitychange', () => { clearTimeout(timeout); if (!document.hidden) tick(); });
tick(); // The confirmed date also works if fetching the rest of the event configuration fails.
