// Illustrated stops, not viewport overlays. Text/photos occupy a measured area of each painting.
export const TRAIL_ART = {
  theme: { src: 'assets/mvp/props/trail-boards/theme-trail-sign.webp', width: 1000, height: 770, face: [.12, .18, .88, .48], feet: [.11, .89] },
  gallery: { src: 'assets/mvp/props/trail-boards/gallery-trail-kiosk.webp', width: 1400, height: 1302, face: [.175, .225, .855, .74], feet: [.105, .935] },
};

export function placeTrailBoard(spec, shift, worldWidth, minTop, scale) {
  const art = TRAIL_ART[spec.kind], width = Math.min(spec.w, worldWidth - 24);
  const naturalHeight = width * art.height / art.width, left = spec.x - width / 2;
  const [x0, y0, x1, y1] = art.face;
  const face = document.querySelector(`[data-trail-board="${spec.kind}"]`);
  let extra = 0;
  if (face && spec.kind === 'gallery') {
    // Measure the real cards at this width. Only the cork/post middle grows; roof and feet don't stretch.
    Object.assign(face.style, { width: `${width * (x1 - x0) * scale}px`, height: 'auto' });
    extra = Math.max(0, face.offsetHeight / scale - naturalHeight * (y1 - y0));
  }
  const height = naturalHeight + extra;
  const top = Math.max(spec.ground + shift - height, minTop), ground = top + height;
  if (face) Object.assign(face.style, {
    left: `${(left + width * x0) * scale}px`, top: `${(top + naturalHeight * y0) * scale}px`,
    width: `${width * (x1 - x0) * scale}px`, height: `${(naturalHeight * (y1 - y0) + extra) * scale}px`,
  });
  return { kind: spec.kind, art, extra, naturalHeight, ix: left, iy: top, iw: width, ih: height, ground, box: [left, top, left + width, ground] };
}
