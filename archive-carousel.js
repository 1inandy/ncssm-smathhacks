// Past-event photo strips. Native scroll-snap does the work; buttons, keys, and the counter are enhancement.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

for (const carousel of document.querySelectorAll('.carousel')) {
  const track = carousel.querySelector('.carousel-track');
  const slides = [...track.children];
  const controls = carousel.querySelector('.carousel-controls');
  const prev = controls.querySelector('.carousel-prev');
  const next = controls.querySelector('.carousel-next');
  const count = controls.querySelector('.carousel-count');
  let index = 0;

  function render(i) {
    if (i !== index) count.textContent = `${i + 1} / ${slides.length}`;
    index = i;
    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
  }

  function show(i) {
    const target = Math.max(0, Math.min(slides.length - 1, i));
    render(target);
    track.scrollTo({ left: slides[target].offsetLeft, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }

  // Follows swipes and trackpad scrolls; the last slide can't snap to the start edge, so the end counts as last.
  function sync() {
    const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    const step = slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : 1;
    render(atEnd ? slides.length - 1 : Math.round(track.scrollLeft / step));
  }

  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  track.addEventListener('scroll', sync, { passive: true });
  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
  });

  controls.hidden = false;
  carousel.classList.add('is-ready');
  sync();
}
