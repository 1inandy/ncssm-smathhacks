// FAQ answers slide open and shut instead of popping. The block holds the taller of its start and
// end heights while an answer slides, so the hillside redraws once per toggle (clearing ready before
// an answer opens, shrinking after one closes) instead of rebuilding the whole scene every frame.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const EASE = 'cubic-bezier(.3,.7,.4,1)';

for (const details of document.querySelectorAll('.faq details')) {
  const summary = details.querySelector('summary'), answer = details.querySelector('summary + *');
  if (!summary || !answer) continue;
  const block = details.closest('[data-copy]') || details;
  let running = null;
  summary.addEventListener('click', event => {
    if (reduceMotion.matches) return;
    event.preventDefault();
    // A click mid-animation reverses from wherever the answer currently is.
    const from = running ? answer.getBoundingClientRect().height : null;
    running?.cancel();
    const opening = !details.open || details.classList.contains('is-closing');
    details.classList.remove('is-closing');
    details.open = true;
    const full = answer.scrollHeight;
    const start = from ?? (opening ? 0 : full), end = opening ? full : 0;
    if (!opening) details.classList.add('is-closing');
    answer.style.overflow = 'hidden';
    // The answer sits at its natural height here; reserve room for whichever end of the slide is taller.
    block.style.minHeight = '';
    const rest = block.getBoundingClientRect().height - answer.getBoundingClientRect().height;
    block.style.minHeight = `${rest + Math.max(start, end)}px`;
    // Padding travels with the height, so nothing pops in before the slide starts.
    const pad = getComputedStyle(answer).paddingBottom, frame = (h, shown) => ({ height: `${h}px`, paddingBottom: h ? pad : '0px', opacity: shown ? 1 : 0 });
    running = answer.animate([frame(start, !opening), frame(end, opening)],
      { duration: 180 + Math.min(260, Math.abs(end - start) * 1.2), easing: EASE },
    );
    running.onfinish = () => {
      running = null;
      answer.style.overflow = '';
      block.style.minHeight = '';
      if (!opening) { details.open = false; details.classList.remove('is-closing'); }
    };
  });
}
