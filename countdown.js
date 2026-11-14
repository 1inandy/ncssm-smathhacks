import { remainingTime } from './countdown-time.js';

// Drives the countdown lettered on the sky banner. The default date lives on the banner itself,
// so it still ticks if fetching the event configuration fails.
const banner = document.querySelector('[data-countdown-at]');
let target = banner?.dataset.countdownAt, timeout;

function tick() {
  clearTimeout(timeout);
  const value = remainingTime(target);
  for (const el of document.querySelectorAll('[data-countdown-unit]')) {
    const unit = el.dataset.countdownUnit;
    el.textContent = !value ? '—' : unit === 'days' ? String(value.days) : String(value[unit]).padStart(2, '0');
  }
  if (value && !value.arrived && !document.hidden) timeout = setTimeout(tick, 1015 - Date.now() % 1000);
}

export function configureCountdown(config) {
  if (remainingTime(config.countdownAt)) target = config.countdownAt;
  tick();
}

document.addEventListener('visibilitychange', () => { clearTimeout(timeout); if (!document.hidden) tick(); });
tick();
