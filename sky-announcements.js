// The theme plane lives in the opening sky; native scrolling carries it out of view.
// Return the extra sky in world units so EVERY terrain tier moves together on smaller screens.
export function layoutSkyAnnouncements({ width, scale, heroBottom, wide }) {
  const flight = document.querySelector('.sky-flight');
  if (!flight) return 0;
  const place = (el, x, y, w, h) => Object.assign(el.style, {
    left: `${x}px`, top: `${y}px`, width: `${w}px`, height: h ? `${h}px` : 'auto',
  });
  if (width >= 900) {
    place(flight, 840 * scale, Math.max(155, 210 * scale), 540 * scale, 151 * scale);
    return 0;
  }
  const top = heroBottom * scale + 30;
  const fw = Math.min(540, width * .86);
  place(flight, (width - fw) / 2, top, fw, fw * .28);
  // No empty balloon-sized gap: reserve only the flight and a little skyline clearance.
  const bottom = top + fw * .28;
  const firstLandmarkTop = (wide ? 360 : 690) * scale;
  return Math.max(0, (bottom + 35 - firstLandmarkTop) / scale);
}
