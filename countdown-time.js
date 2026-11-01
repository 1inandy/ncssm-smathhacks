// Pure arithmetic, shared by the live clock and boundary tests. Target must include a timezone.
export function remainingTime(target, now = Date.now()) {
  if (typeof target !== 'string' || !/(?:Z|[+-]\d{2}:\d{2})$/.test(target)) return null;
  const end = Date.parse(target);
  if (!Number.isFinite(end) || !Number.isFinite(now)) return null;
  const secondsLeft = Math.max(0, Math.ceil((end - now) / 1000));
  return {
    days: Math.floor(secondsLeft / 86400),
    hours: Math.floor(secondsLeft / 3600) % 24,
    minutes: Math.floor(secondsLeft / 60) % 60,
    seconds: secondsLeft % 60,
    arrived: end <= now,
  };
}
