import { remainingTime } from './countdown-time.js';

const clock = document.querySelector('#event-countdown');
let target = clock?.dataset.countdownAt, timeout;

function tick() {
  clearTimeout(timeout);
  if (!clock) return;
  const value = remainingTime(target);
  const timer = clock.querySelector('[data-countdown-timer]');
  const caption = clock.querySelector('[data-countdown-caption]');
  if (!value) {
    caption.textContent = 'Date coming soon';
    timer.setAttribute('aria-label', 'Event countdown date is not configured');
    for (const el of document.querySelectorAll('[data-countdown-unit]')) el.textContent = '—';
    return;
  }
  for (const el of document.querySelectorAll('[data-countdown-unit]')) {
    const unit = el.dataset.countdownUnit;
    el.textContent = unit === 'days' ? String(value.days) : String(value[unit]).padStart(2, '0');
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
