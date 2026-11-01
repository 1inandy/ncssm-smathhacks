// One continuous hillside. Every object has a fixed home on a terrain tier; native scroll is the camera.
// Two compositions of the same world: `wide` (desktop, 1440 units across) and `tall` (phone, 600 across).
import CRESTS from './crests.js';
import { layoutSkyAnnouncements } from './sky-announcements.js';
import { placeTrailBoard } from './trail-boards.js';

const A = 'assets/mvp/', P = A + 'props/', E = A + 'environment/', H_ = 'assets/hillside/';
// name: [src, intrinsic width, intrinsic height]
const ART = {
  cloudLong: [E + 'atmosphere/cloud-long.webp', 1000, 181], cloudPuff: [E + 'atmosphere/cloud-puff.webp', 1000, 358], cloudWisp: [E + 'atmosphere/cloud-wisp.webp', 1000, 159],
  tower: [E + 'atmosphere/morganton-water-tower.webp', 587, 1000],
  watts: [H_ + 'watts.webp', 640, 394], barn: [H_ + 'morganton-barn.webp', 700, 345], sphere: [H_ + 'sphere-monument.webp', 420, 394], tetra: [H_ + 'tetragranny.webp', 420, 411],
  gate: [H_ + 'fruit-circuit-gate.webp', 420, 345], pinwheel: [H_ + 'pixel-pinwheel.webp', 388, 420], pump: [H_ + 'drip-irrigation-pump.webp', 420, 373],
  crate: [H_ + 'harvest-crate.webp', 420, 238], solar: [H_ + 'leaf-solar-charger.webp', 420, 407], drawers: [H_ + 'component-drawers.webp', 420, 371],
  spool: [H_ + 'vine-cable-spool.webp', 420, 249], breadboard: [H_ + 'toast-breadboard.webp', 420, 331], battery: [H_ + 'bubble-tea-battery.webp', 405, 420],
  compost: [H_ + 'compost-monitor.webp', 420, 351], controller: [H_ + 'cookie-controller.webp', 420, 282], rover: [H_ + 'snack-delivery-rover.webp', 420, 400],
  printer: [H_ + 'recipe-card-printer.webp', 420, 361],
  bit: [H_ + 'bit-master.webp', 480, 568], amp: [H_ + 'amp-master.webp', 451, 600], bite: [H_ + 'bite-master.webp', 480, 540],
  bench: [P + 'tables-v2/amp-bench.webp', 510, 270], desk: [P + 'tables-v2/bite-desk.webp', 430, 230], notice: [P + 'notice-frame.svg', 1180, 850], countdown: [P + 'countdown-clock/clock.webp', 800, 364],
  stem: [E + 'left-stem.svg', 280, 720], leafA: [E + 'left-leaf-a.svg', 240, 320], leafB: [E + 'right-leaf-a.svg', 240, 320],
};
// The end billboard is assembled from separate painted pieces, not the flat notice icon.
const BILLBOARD = {
  panel: [P + 'billboard-v2/billboard-panel.webp', 1600, 610],
  post: [P + 'billboard-v2/billboard-post.webp', 141, 1200],
  inside: { left: .105, top: .235, right: .885, bottom: .80 },
};
// Each hill: its painted crest (bottom faded out) over a seamless tile of the same grass, so the
// ground is textured all the way down. Both are generated from assets/mvp/environment/terrain-v2.
const STRIP = {
  edge: n => H_ + `terrain/${n}-edge.webp`, ground: n => H_ + `terrain/${n}-ground.webp`, tileAspect: 169 / 1600, fadeFrom: .793,
  base: { 'far-ridge-right': '#adbd68', 'middle-hill-left': '#6e904b', 'middle-hill-right': '#769853', 'near-bank': '#567949', 'front-bank': '#3c5a37' },
};
// How an object meets the ground: what grows over its base.
const KIND = {
  watts: 'landmark', barn: 'landmark', sphere: 'landmark', tetra: 'landmark', tower: 'landmark', gate: 'landmark', notice: 'landmark',
  bit: 'character', amp: 'character', bite: 'character', bench: 'furniture', desk: 'furniture',
};
// Where things rest on a support: the middle of its painted top face, as a fraction of image height.
const SURFACE = { bench: .12, desk: .14 };

// Tier: strip art, approximate crest y, horizontal span (×W), mirrored or not, parallax depth.
// `pathW`: width of the route where this tier is the nearest surface; `via`: route points on this tier.
// `clearing`: a copy block placed at (x, y, w); `h` is its planned height. Every tier below moves by the
//   difference between real and planned height, so the gap after each clearing stays as designed
//   whatever the text does (long copy, an open FAQ, text zoom).
//   `in`/`out` say where along its top/bottom edge the route enters and leaves.
// `sign`: the sponsor billboard, standing just past the info clearing; `ground` is where its posts stand.
//   However tall its logos make it, every tier after it moves down to keep the ground below it clear.
// Items: x is the centre; base at `ground` (absolute y, moves with its tier) or crest + `sink`.
//   `on` sets an item on a support item's top surface, offset by `dx` (and down by `sink`). `bed` is worked ground
//   (soil or trodden grass) under a station.
const LAYOUTS = {
  wide: {
    W: 1440, sky: 1100,
    clouds: [['cloudWisp', 470, 30, 440], ['cloudLong', 1080, 60, 640], ['cloudPuff', 760, 240, 230], ['cloudPuff', 1350, 260, 290],
      ['cloudWisp', 1240, 470, 300], ['cloudLong', 300, 600, 400]],
    hero: { x: 96, y: 130, w: 540 },
    tiers: [
      { id: 'ridge', strip: 'far-ridge-right', crest: 650, span: 1.2, depth: .22, items: [
        { a: 'tower', x: 770, w: 104, sink: 16 }, { a: 'watts', x: 1100, w: 500, sink: 60 } ] },
      { id: 'meadow', strip: 'middle-hill-left', crest: 770, span: 1.1, flip: true, depth: .09, items: [
        { a: 'pinwheel', x: 205, w: 84, sink: 18, cls: 'sway slow' } ] },
      { id: 'gate', strip: 'near-bank', crest: 868, pathW: 30, via: [[884, 888], [876, 960], [800, 1020], [690, 1075]], items: [
        { a: 'gate', x: 880, w: 210, sink: 30 } ] },
      { id: 'themeStop', strip: 'middle-hill-left', crest: 1080, span: 1.2, pathW: 42,
        trail: { kind: 'theme', x: 330, w: 500, ground: 1250, gap: 80 }, items: [] },
      { id: 'sphere', strip: 'middle-hill-right', crest: 1075, span: 1.15, pathW: 46, via: [[592, 1135], [590, 1200], [650, 1265]], items: [
        { a: 'sphere', x: 1215, w: 250, sink: 62 } ] },
      { id: 'garden', strip: 'near-bank', crest: 1250, span: 1.25, flip: true, pathW: 70, via: [[720, 1310]],
        clearing: { copy: 'bit', x: 800, y: 1350, w: 500, h: 350, in: .14, out: .3 }, items: [
        { a: 'bed', kind: 'soil', x: 255, ground: 1592, w: 300, h: 56 },
        { a: 'solar', x: 105, w: 130, ground: 1550 }, { a: 'pump', x: 330, w: 170, ground: 1600, id: 'pump' },
        { a: 'crate', x: 475, w: 150, ground: 1590 }, { a: 'bit', x: 620, w: 220, ground: 1655 },
        { a: 'plant', x: -20, top: 1700, h: 380 } ] },

      { id: 'barn', strip: 'middle-hill-left', crest: 2000, span: 1.2, pathW: 82, via: [[870, 2060], [905, 2150]], items: [
        { a: 'barn', x: 1215, w: 420, sink: 40 } ] },
      { id: 'workshop', strip: 'near-bank', crest: 2150, span: 1.2, pathW: 92, via: [[1000, 2250], [975, 2390]],
        clearing: { copy: 'amp', x: 420, y: 2490, w: 600, h: 322, in: .86, out: .2 }, items: [
        { a: 'bed', kind: 'trodden', x: 520, ground: 2370, w: 820, h: 100 },
        { a: 'spool', x: 210, w: 135, ground: 2335 }, { a: 'bench', x: 480, w: 340, ground: 2370, id: 'bench' },
        { on: 'bench', a: 'drawers', dx: -95, w: 100 }, { on: 'bench', a: 'breadboard', dx: 50, w: 115, sink: 5, id: 'breadboard' },
        { a: 'amp', x: 770, w: 210, ground: 2410 }, { a: 'battery', x: 885, w: 66, ground: 2382 },
        { a: 'plant', x: 1300, top: 2470, h: 420, flip: true } ] },

      { id: 'lane', strip: 'middle-hill-right', crest: 3030, span: 1.2, pathW: 100, via: [[540, 3080], [480, 3190]], items: [
        { a: 'tetra', x: 190, w: 300, sink: 78 } ] },
      { id: 'play', strip: 'near-bank', crest: 3180, span: 1.25, flip: true, pathW: 110,
        clearing: { copy: 'bite', x: 140, y: 3300, w: 520, h: 295, in: .6, out: .7 },
        lane: { from: [700, 3600], to: [1380, 3600], w: 62 }, items: [
        { a: 'bed', kind: 'trodden', x: 1140, ground: 3480, w: 560, h: 90 },
        { a: 'desk', x: 1060, w: 320, ground: 3470, id: 'desk' },
        { on: 'desk', a: 'controller', dx: -80, w: 105 }, { on: 'desk', a: 'printer', dx: 70, w: 92 },
        { a: 'bite', x: 1265, w: 195, ground: 3505 }, { a: 'rover', x: 820, w: 120, ground: 3622, id: 'rover', drive: 420 } ] },

      { id: 'fieldBack', strip: 'middle-hill-left', crest: 3900, span: 1.2, pathW: 114, via: [[600, 3950], [760, 4060]], items: [
        { a: 'pinwheel', x: 1240, w: 80, sink: 22, cls: 'sway slow' } ] },
      { id: 'field', strip: 'near-bank', crest: 4050, span: 1.25, pathW: 116, via: [[900, 4150]],
        clearing: { copy: 'data', x: 800, y: 4250, w: 500, h: 400, in: .2, out: .5 }, items: [
        { a: 'bed', kind: 'trodden', x: 360, ground: 4300, w: 560, h: 90 },
        { a: 'crate', x: 170, w: 150, ground: 4300 }, { a: 'compost', x: 360, w: 150, ground: 4300 },
        { a: 'printer', x: 545, w: 125, ground: 4295 } ] },

      { id: 'galleryStop', strip: 'middle-hill-right', crest: 4780, span: 1.2, pathW: 116,
        trail: { kind: 'gallery', x: 720, w: 920, ground: 5690, gap: 110 }, items: [] },
      { id: 'quiet', strip: 'middle-hill-left', crest: 4900, span: 1.2, pathW: 120, via: [[600, 4950], [700, 5040]], items: [
        { a: 'solar', x: 1230, w: 115, sink: 30 }, { a: 'spool', x: 190, w: 125, sink: 34 } ] },
      { id: 'info', strip: 'near-bank', crest: 5030, span: 1.3, pathW: 130,
        clearing: { copy: 'details', x: 200, y: 5140, w: 1040, h: 648, in: .5, out: .5 }, items: [
        { a: 'printer', x: 1340, w: 120, ground: 5330 }, { a: 'plant', x: -150, top: 5380, h: 420 } ] },

      { id: 'gatherBack', strip: 'middle-hill-right', crest: 6080, span: 1.2, pathW: 140, sign: { copy: 'footer', x: 340, w: 760, ground: 6110 }, items: [
        { a: 'crate', x: 110, w: 140, sink: 40 }, { a: 'pinwheel', x: 1340, w: 84, sink: 24, cls: 'sway slow' } ] },
      { id: 'gather', strip: 'near-bank', crest: 6210, span: 1.3, flip: true, pathW: 150,
        clearing: { copy: 'finale', x: 430, y: 6530, w: 580, h: 202, in: .5, out: .5 }, items: [
        { a: 'bed', kind: 'trodden', x: 740, ground: 6440, w: 1020, h: 110 },
        { a: 'bench', x: 720, w: 400, ground: 6430, id: 'table' }, { on: 'table', a: 'countdown', dx: 0, w: 300 },
        { a: 'bit', x: 440, w: 170, ground: 6460 }, { a: 'amp', x: 1000, w: 178, ground: 6470 }, { a: 'bite', x: 1185, w: 165, ground: 6455 } ] },

      { id: 'end', strip: 'front-bank', crest: 6890, span: 1.3, pathW: 160, items: [] },
    ],
  },
  tall: {
    W: 600, sky: 1300,
    clouds: [['cloudWisp', 420, 50, 300], ['cloudPuff', 520, 850, 170], ['cloudLong', 150, 760, 340], ['cloudPuff', 500, 720, 200]],
    hero: { x: 40, y: 140, w: 520 },
    tiers: [
      { id: 'ridge', strip: 'far-ridge-right', crest: 900, span: 1.9, depth: .2, items: [
        { a: 'tower', x: 230, w: 62, sink: 10 }, { a: 'watts', x: 420, w: 300, sink: 36 } ] },
      { id: 'meadow', strip: 'middle-hill-left', crest: 985, span: 1.9, flip: true, depth: .08, items: [
        { a: 'pinwheel', x: 80, w: 60, sink: 12, cls: 'sway slow' } ] },
      { id: 'gate', strip: 'near-bank', crest: 1070, span: 1.9, pathW: 24, via: [[332, 1088], [332, 1120], [385, 1180], [450, 1230]], items: [
        { a: 'gate', x: 330, w: 160, sink: 22 } ] },
      { id: 'themeStop', strip: 'middle-hill-left', crest: 1300, span: 2, pathW: 32,
        trail: { kind: 'theme', x: 300, w: 530, ground: 1740, gap: 100 }, items: [] },
      { id: 'sphere', strip: 'middle-hill-right', crest: 1220, span: 2, pathW: 36, via: [[482, 1275], [470, 1330]], items: [
        { a: 'sphere', x: 548, w: 140, sink: 40 } ] },
      { id: 'garden', strip: 'near-bank', crest: 1340, span: 2.1, flip: true, pathW: 54, via: [[488, 1410], [470, 1510]],
        clearing: { copy: 'bit', x: 50, y: 1600, w: 500, h: 620, in: .8, out: .3 }, items: [
        { a: 'bed', kind: 'soil', x: 125, sink: 40, w: 200, h: 46 },
        { a: 'pump', x: 135, w: 110, sink: 32, id: 'pump' }, { a: 'crate', x: 245, w: 100, sink: 24 }, { a: 'bit', x: 350, w: 150, sink: 46 } ] },

      { id: 'barn', strip: 'middle-hill-left', crest: 2420, span: 2, pathW: 60, via: [[200, 2470], [270, 2560]], items: [
        { a: 'barn', x: 465, w: 250, sink: 24 } ] },
      { id: 'workshop', strip: 'near-bank', crest: 2560, span: 2, pathW: 70, via: [[310, 2650]],
        clearing: { copy: 'amp', x: 50, y: 2800, w: 500, h: 500, in: .55, out: .7 }, items: [
        { a: 'bed', kind: 'trodden', x: 300, sink: 58, w: 580, h: 60 },
        { a: 'bench', x: 130, w: 220, sink: 44, id: 'bench' }, { on: 'bench', a: 'drawers', dx: -58, w: 70 },
        { on: 'bench', a: 'breadboard', dx: 42, w: 74, sink: 3, id: 'breadboard' }, { a: 'amp', x: 480, w: 140, sink: 60 } ] },

      { id: 'lane', strip: 'middle-hill-right', crest: 3560, span: 2, pathW: 80, via: [[420, 3600], [380, 3690]], items: [
        { a: 'tetra', x: 120, w: 190, sink: 50 } ] },
      { id: 'play', strip: 'near-bank', crest: 3700, span: 2.1, flip: true, pathW: 90, via: [[330, 3790], [320, 3960]],
        clearing: { copy: 'bite', x: 50, y: 4090, w: 500, h: 500, in: .5, out: .4 },
        lane: { from: [30, 3940], to: [590, 3940], w: 44 }, items: [
        { a: 'desk', x: 455, w: 230, sink: 70, id: 'desk' }, { on: 'desk', a: 'controller', dx: -45, w: 74 },
        { a: 'bite', x: 190, w: 140, sink: 80 }, { a: 'rover', x: 90, w: 90, ground: 3958, id: 'rover', drive: 360 } ] },

      { id: 'fieldBack', strip: 'middle-hill-left', crest: 4820, span: 2, pathW: 94, via: [[300, 4870], [330, 4960]], items: [
        { a: 'pinwheel', x: 520, w: 56, sink: 14, cls: 'sway slow' } ] },
      { id: 'field', strip: 'near-bank', crest: 4960, span: 2.1, pathW: 96, via: [[320, 5060]],
        clearing: { copy: 'data', x: 50, y: 5180, w: 500, h: 560, in: .55, out: .5 }, items: [
        { a: 'bed', kind: 'trodden', x: 150, sink: 56, w: 270, h: 56 },
        { a: 'crate', x: 85, w: 105, sink: 30 }, { a: 'compost', x: 200, w: 95, sink: 34 }, { a: 'printer', x: 505, w: 90, sink: 30 } ] },

      { id: 'galleryStop', strip: 'middle-hill-right', crest: 5840, span: 2, pathW: 98,
        trail: { kind: 'gallery', x: 300, w: 560, ground: 6520, gap: 110 }, items: [] },
      { id: 'quiet', strip: 'middle-hill-left', crest: 5940, span: 2, pathW: 100, via: [[260, 5980], [300, 6060]], items: [
        { a: 'solar', x: 500, w: 80, sink: 22 } ] },
      { id: 'info', strip: 'near-bank', crest: 6080, span: 2.1, pathW: 110,
        clearing: { copy: 'details', x: 40, y: 6190, w: 520, h: 1280, in: .5, out: .5 }, items: [] },

      { id: 'gatherBack', strip: 'middle-hill-right', crest: 7640, span: 2, pathW: 120, sign: { copy: 'footer', x: 50, w: 500, ground: 7690 }, items: [] },
      { id: 'gather', strip: 'near-bank', crest: 7760, span: 2.1, flip: true, pathW: 130,
        clearing: { copy: 'finale', x: 50, y: 8080, w: 500, h: 410, in: .5, out: .5 }, items: [
        { a: 'bed', kind: 'trodden', x: 300, ground: 7970, w: 590, h: 70 },
        { a: 'bench', x: 300, w: 270, ground: 7950, id: 'table' }, { on: 'table', a: 'countdown', dx: 0, w: 300 },
        { a: 'bit', x: 85, w: 118, ground: 7970 }, { a: 'amp', x: 515, w: 120, ground: 7980 }, { a: 'bite', x: 300, w: 104, ground: 8030 } ] },

      { id: 'end', strip: 'front-bank', crest: 8680, span: 2.1, pathW: 140, items: [] },
    ],
  },
};

const svg = document.getElementById('world-art');
const world = document.querySelector('.world');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let s = 1, depthGroups = [];

const r1 = n => Math.round(n * 10) / 10;
const tierGeom = (t, W) => {
  const span = t.span || 1, tw = W * span, left = (W - tw) / 2;
  return { tw, left, th: tw * CRESTS[t.strip].aspect, y: t.crest - .16 * tw };
};
function crestY(t, x, W) {
  const g = tierGeom(t, W), prof = CRESTS[t.strip].crest;
  let u = (x - g.left) / g.tw; if (t.flip) u = 1 - u;
  const i = Math.max(0, Math.min(prof.length - 1.001, u * 48)), f = i - Math.floor(i);
  return g.y + (prof[Math.floor(i)] * (1 - f) + prof[Math.ceil(i)] * f) * g.tw;
}
// Deterministic randomness, so the scattered detail is identical on every visit and re-layout.
function rng(seed) {
  return () => {
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const hash = str => [...str].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);

// Catmull-Rom through the points, as cubic Béziers.
function controls(p, closed) {
  const n = p.length, at = i => closed ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))], segs = [];
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const [a, b, c, e] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    segs.push([b, [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6], [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6], c]);
  }
  return segs;
}
function smooth(p, closed) {
  return `M${p[0].map(r1)}` + controls(p, closed).map(([, c1, c2, c]) => `C${c1.map(r1)} ${c2.map(r1)} ${c.map(r1)}`).join('') + (closed ? 'Z' : '');
}
// Points along the same curve, for keeping scattered detail off the path.
function sample(p) {
  const out = [];
  for (const [b, c1, c2, c] of controls(p)) for (let k = 0; k < 8; k++) {
    const t = k / 8, u = 1 - t;
    out.push([0, 1].map(i => u * u * u * b[i] + 3 * u * u * t * c1[i] + 3 * u * t * t * c2[i] + t * t * t * c[i]));
  }
  return out;
}
// An irregular rounded clearing around a rectangle — drawn ground, not a cut-out card.
// It traces a rounded rectangle just outside the padded text box and only ever wobbles outward,
// so any aspect ratio (a tall phone FAQ included) keeps every line of text on the ground.
function clearingShape([x0, y0, x1, y1], seed) {
  const e = 14, X0 = x0 - e, Y0 = y0 - e, X1 = x1 + e, Y1 = y1 + e;
  const r = Math.min(120, (X1 - X0) / 3, (Y1 - Y0) / 3), step = 110, pts = [];
  const jitter = k => { const v = Math.sin(k * 12.9898 + seed * 78.233) * 43758.5453; return (v - Math.floor(v)) * 22; };
  const push = (x, y, nx, ny) => { const j = jitter(pts.length); pts.push([x + nx * j, y + ny * j]); };
  // corner centres and the angle each corner's arc starts at, walking clockwise from top-left
  const corners = [[X0 + r, Y0 + r, Math.PI], [X1 - r, Y0 + r, -Math.PI / 2], [X1 - r, Y1 - r, 0], [X0 + r, Y1 - r, Math.PI / 2]];
  corners.forEach(([cx, cy, a], i) => {
    for (const t of [0, .5]) { const ang = a + t * Math.PI / 2; push(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, Math.cos(ang), Math.sin(ang)); }
    const [nx, ny, na] = corners[(i + 1) % 4], end = a + Math.PI / 2;
    const sx = cx + Math.cos(end) * r, sy = cy + Math.sin(end) * r, tx = nx + Math.cos(na) * r, ty = ny + Math.sin(na) * r;
    const n = Math.max(1, Math.round(Math.hypot(tx - sx, ty - sy) / step));
    for (let k = 0; k < n; k++) push(sx + (tx - sx) * k / n, sy + (ty - sy) * k / n, Math.cos(end), Math.sin(end));
  });
  return smooth(pts, true);
}
// A loose organic blob, for beds of soil and trodden grass.
function blob(cx, cy, rx, ry, rand) {
  const pts = [];
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, j = .88 + rand() * .2; pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]); }
  return smooth(pts, true);
}
const img = (a, x, y, w, extra = '') => {
  const [src, iw, ih] = ART[a], h = w * ih / iw;
  return `<image href="${src}" x="${r1(x - w / 2)}" y="${r1(y - h)}" width="${r1(w)}" height="${r1(h)}" preserveAspectRatio="none" ${extra}/>`;
};
const stroke = (d, w, color) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${r1(w)}" stroke-linecap="round" stroke-linejoin="round"/>`;

// Hand-drawn ground detail, in the artwork's own palette and ink.
const GREENS = ['#6A994E', '#A7C957', '#86ad4f', '#4f7a3f'];
function tuft(x, y, size, rand) {
  const n = 4 + Math.floor(rand() * 3), sw = Math.max(1.2, size * .045);
  let d = '';
  for (let i = 0; i < n; i++) {
    const bx = x + (i - (n - 1) / 2) * size * .16, lean = (rand() - .5) * size * .55 + (i - (n - 1) / 2) * size * .08;
    const h = size * (.55 + rand() * .5), half = size * .065;
    d += `M${r1(bx - half)},${r1(y)}Q${r1(bx + lean * .3)},${r1(y - h * .55)} ${r1(bx + lean)},${r1(y - h)}Q${r1(bx + lean * .2)},${r1(y - h * .45)} ${r1(bx + half)},${r1(y)}Z`;
  }
  return `<path d="${d}" fill="${GREENS[Math.floor(rand() * GREENS.length)]}" stroke="var(--ink)" stroke-width="${r1(sw)}" stroke-linejoin="round"/>`;
}
function flower(x, y, r, rand) {
  const color = ['#F8F4EA', '#E5C0AE', '#D7988C', '#F6D86B'][Math.floor(rand() * 4)], sw = Math.max(1, r * .22);
  let petals = '';
  for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2 + rand(); petals += `<circle cx="${r1(x + Math.cos(a) * r * .85)}" cy="${r1(y - r * 1.6 + Math.sin(a) * r * .85)}" r="${r1(r * .62)}"/>`; }
  return `<path d="M${r1(x)},${r1(y)}q${r1(r * .3)},${r1(-r * .8)} 0,${r1(-r * 1.6)}" fill="none" stroke="var(--ink)" stroke-width="${r1(sw)}"/>`
    + `<g fill="${color}" stroke="var(--ink)" stroke-width="${r1(sw)}">${petals}</g><circle cx="${r1(x)}" cy="${r1(y - r * 1.6)}" r="${r1(r * .42)}" fill="${color === '#F6D86B' ? '#D7988C' : '#F6D86B'}" stroke="var(--ink)" stroke-width="${r1(sw)}"/>`;
}
const stone = (x, y, r, rand) => `<ellipse cx="${r1(x)}" cy="${r1(y - r * .45)}" rx="${r1(r)}" ry="${r1(r * (.5 + rand() * .2))}" fill="${rand() < .5 ? '#cfc6ad' : '#b9b092'}" stroke="var(--ink)" stroke-width="${r1(Math.max(1, r * .18))}"/>`;

// Grass growing over an object's base, so it stands in the hill instead of on top of it.
function rootIn(a, x, y, w, rand) {
  const kind = KIND[a] || 'prop';
  let out = '';
  if (kind === 'landmark') {
    const n = Math.max(4, Math.round(w / 45)), size = Math.min(48, Math.max(16, w * .14));
    for (let k = 0; k < n; k++) out += tuft(x - w * .46 + w * .92 * k / (n - 1) + (rand() - .5) * 10, y + 4, size * (.75 + rand() * .45), rand);
  } else if (kind === 'character') {
    for (const u of [-.34, .32]) out += tuft(x + u * w, y + 4, Math.max(12, w * .15), rand);
  } else if (kind === 'furniture') {
    for (const u of [-.42, -.36, .36, .43]) out += tuft(x + u * w, y + 4, Math.max(12, w * .085), rand);
  } else {
    for (const u of [-.42, .42]) out += tuft(x + u * w, y + 4, Math.min(34, Math.max(11, w * .2)), rand);
  }
  return out;
}

function placeCopy(name, x, y, w) {
  const el = document.querySelector(`[data-copy="${name}"]`);
  Object.assign(el.style, { left: `${x * s}px`, top: `${y * s}px`, width: `${w * s}px` });
  return el.offsetHeight / s;
}

// Keep HTML inside the recessed face. An empty sponsor board keeps its natural
// painted aspect ratio on a phone instead of stretching its timber into a tall slab.
function placeSign(sign, sh, W, minTop = 0) {
  const pad = 12, post = W > 1000 ? 130 : 110, ground = sign.ground + sh;
  const face = BILLBOARD.inside, fw = face.right - face.left, fh = face.bottom - face.top;
  const iw = Math.min((sign.w + pad * 2) / fw, W - 16);
  const ix = sign.x + sign.w / 2 - iw / 2, contentX = ix + iw * face.left + pad;
  const contentW = iw * fw - pad * 2;
  const el = document.querySelector(`[data-copy="${sign.copy}"]`);
  const empty = !el.children.length && !el.textContent.trim();
  const sponsorBoard = el.classList.contains('sponsor-billboard');
  const naturalHeight = iw * BILLBOARD.panel[2] / BILLBOARD.panel[1];
  const topInset = sponsorBoard ? iw * .10 : naturalHeight * face.top;
  const bottomInset = sponsorBoard ? iw * .08 : naturalHeight * (1 - face.bottom);
  el.style.minHeight = empty || sponsorBoard ? `${Math.max(1, naturalHeight - topInset - bottomInset - pad * 2) * s}px` : '';
  const h = placeCopy(sign.copy, contentX, 0, contentW);
  const ih = Math.max(naturalHeight, sponsorBoard ? h + pad * 2 + topInset + bottomInset : (h + pad * 2) / fh), iy = Math.max(ground - post - ih, minTop);
  const footing = iy + ih + post;
  placeCopy(sign.copy, contentX, iy + (sponsorBoard ? topInset : ih * face.top) + pad, contentW);
  return { ix, iy, iw, ih, ground: footing, box: [ix, iy, ix + iw, footing] };
}

function render() {
  const vw = document.documentElement.clientWidth;
  if (!vw) return;
  const L = vw >= 760 ? LAYOUTS.wide : LAYOUTS.tall, W = L.W;
  s = vw / W;
  world.classList.add('is-laid-out');
  const heroHeight = placeCopy('hero', L.hero.x, L.hero.y, L.hero.w);
  const skyExtra = layoutSkyAnnouncements({ width: vw, scale: s, heroBottom: L.hero.y + heroHeight });

  // Walk downhill: place each clearing's real copy, and move everything after it to keep the gap.
  let shift = skyExtra, seed = 0, lastClearingBottom = 0;
  const route = [];
  const tiers = L.tiers.map(t => {
    const T = { ...t, sh: shift, crest: t.crest + shift, boxes: [] };
    for (const [x, y] of t.via || []) route.push([x, y + shift]);
    if (t.clearing) {
      const c = t.clearing, y = c.y + shift, h = placeCopy(c.copy, c.x, y, c.w), pad = W > 1000 ? 44 : 30;
      const [x0, y0, x1, y1] = T.clear = [c.x - pad, y - pad, c.x + c.w + pad, y + h + pad];
      lastClearingBottom = y1;
      T.seed = seed += 3;
      route.push([x0 + (x1 - x0) * c.in, y0 + 30], [x0 + (x1 - x0) * c.out, y1 - 30]);
      shift += h - c.h;
    }
    if (t.sign) {
      T.board = placeSign(t.sign, shift, W, lastClearingBottom + (W > 1000 ? 110 : 100));
      route.push([t.sign.x + t.sign.w / 2, T.board.ground - 6]);
      shift += Math.max(0, T.board.ground - (t.sign.ground + shift));
      lastClearingBottom = T.board.ground;
    }
    if (t.trail) {
      const requestedGround = t.trail.ground + shift;
      T.trailBoard = placeTrailBoard(t.trail, shift, W, lastClearingBottom + 100, s);
      route.push([W * .15, T.trailBoard.ground + 25]);
      // New stops add actual world space; all later terrain, objects and copy move together.
      shift += T.trailBoard.ih + t.trail.gap + Math.max(0, T.trailBoard.ground - requestedGround);
      lastClearingBottom = T.trailBoard.ground;
      T.boxes.push(T.trailBoard.box);
    }
    return T;
  });
  // The world ends a little below the last stop on the route, and never above any tier's painted ground.
  const groundTop = t => { const g = tierGeom(t, W); return g.y + g.th * STRIP.fadeFrom; };
  const H = Math.max(lastClearingBottom + (W > 1000 ? 150 : 110), ...tiers.map(t => groundTop(t) + 40));
  const routeD = smooth(route), routePts = sample(route);

  let defs = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A7D3E8"/><stop offset="1" stop-color="#EDF3E8"/></linearGradient>`;
  let body = `<rect width="${W}" height="${L.sky + skyExtra}" fill="url(#sky)"/>`;
  body += `<g data-depth=".35">${L.clouds.map(([a, x, y, w], i) => `<g class="drift" style="animation-delay:${-i * 5}s">${img(a, x, y + w * ART[a][2] / ART[a][1], w)}</g>`).join('')}</g>`;

  const homes = {};
  tiers.forEach((t, ti) => {
    const g = tierGeom(t, W), next = tiers[ti + 1], rand = rng(hash(t.id + W));
    const flipT = t.flip ? ` transform="translate(${r1(2 * g.left + g.tw)} 0) scale(-1 1)"` : '';
    const edge = `<image href="${STRIP.edge(t.strip)}" x="${r1(g.left)}" y="${r1(g.y)}" width="${r1(g.tw)}" height="${r1(g.th)}" preserveAspectRatio="none"${flipT}/>`;
    const gy = g.y + g.th * STRIP.fadeFrom - 2, tileH = g.tw * STRIP.tileAspect;
    defs += `<pattern id="gp-${t.id}" patternUnits="userSpaceOnUse" x="${r1(g.left)}" y="${r1(gy)}" width="${r1(g.tw)}" height="${r1(tileH)}"${t.flip ? ` patternTransform="translate(${r1(2 * g.left + g.tw)} 0) scale(-1 1)"` : ''}><image href="${STRIP.ground(t.strip)}" width="${r1(g.tw)}" height="${r1(tileH)}" preserveAspectRatio="none"/></pattern>`;
    const ground = `<rect x="${r1(g.left)}" y="${r1(gy)}" width="${r1(g.tw)}" height="${r1(H - gy)}" fill="${STRIP.base[t.strip]}"/><rect x="${r1(g.left)}" y="${r1(gy)}" width="${r1(g.tw)}" height="${r1(H - gy)}" fill="url(#gp-${t.id})"/>`;
    defs += `<mask id="m-${t.id}" maskUnits="userSpaceOnUse" x="${-W}" y="0" width="${W * 3}" height="${r1(H + 10)}" style="mask-type:alpha">${edge}<rect x="${r1(g.left)}" y="${r1(gy)}" width="${r1(g.tw)}" height="${r1(H - gy)}"/></mask>`;

    // Ground marks live inside the tier's own silhouette, so they vanish over its crest. Every tier
    // draws the same route; wherever a nearer tier stands in front, it hides the farther one's copy.
    let ink = '', worn = '';
    if (t.pathW) { ink += stroke(routeD, t.pathW + 7, 'var(--ink)'); worn += stroke(routeD, t.pathW, 'var(--ground)'); }
    if (t.lane) {
      const { from: [ax, ay], to: [bx, by], w } = t.lane, d = smooth([[ax, ay + t.sh], [(ax + bx) / 2, (ay + by) / 2 + t.sh + 8], [bx, by + t.sh]]);
      ink += stroke(d, w + 7, 'var(--ink)');
      worn += stroke(d, w, 'var(--ground)') + `<path d="${d}" fill="none" stroke="var(--peach)" stroke-width="4" stroke-dasharray="18 16" stroke-linecap="round"/>`;
    }
    if (t.clear) {
      const shape = clearingShape(t.clear, t.seed);
      ink += `<path d="${shape}" fill="var(--ink)" stroke="var(--ink)" stroke-width="7" stroke-linejoin="round"/>`;
      worn += `<path d="${shape}" fill="var(--ground)"/>`;
    }

    let items = '';
    for (const it of t.items) items += item(it, t, W, homes, rand);
    if (t.board) items += board(t.board, rand);
    if (t.trailBoard) items += trailBoard(t.trailBoard, rand);
    body += `<g data-depth="${t.depth || 0}">${ground}${edge}<g mask="url(#m-${t.id})">${ink}${worn}</g>${scatter(t, next, W, H, routePts, rand)}${items}</g>`;
  });

  svg.setAttribute('viewBox', `0 0 ${W} ${r1(H)}`);
  svg.setAttribute('width', vw);
  svg.setAttribute('height', Math.ceil(H * s));
  svg.innerHTML = `<defs>${defs}</defs>${body}`;
  world.style.height = `${Math.ceil(H * s)}px`;
  depthGroups = [...svg.querySelectorAll('[data-depth]')].filter(g => +g.dataset.depth);
  updateDepth();
}

// Grounded painted stops: cast shadow, whole artwork, then tufts over the post feet.
function trailBoard({ kind, art, extra, naturalHeight, ix, iy, iw, ih, ground }, rand) {
  const feet = art.feet.map(u => ix + iw * u);
  const shadows = feet.map(x => `<ellipse cx="${r1(x)}" cy="${r1(ground - 1)}" rx="${r1(iw * .09)}" ry="${r1(iw * .018)}" fill="#22331a" opacity=".23"/>`).join('');
  const grass = feet.map(x => tuft(x - iw * .025, ground + 3, iw * .04, rand) + tuft(x + iw * .025, ground + 4, iw * .035, rand)).join('');
  let painting = `<image href="${art.src}" x="${r1(ix)}" y="${r1(iy)}" width="${r1(iw)}" height="${r1(ih)}"/>`;
  if (extra > 0) {
    const y0 = art.face[1], y1 = art.face[3];
    const source = [0, art.height * y0, art.height * y1, art.height];
    const dest = [0, naturalHeight * y0, naturalHeight * y1 + extra, ih];
    painting = [0, 1, 2].map(i => `<svg x="${r1(ix)}" y="${r1(iy + dest[i])}" width="${r1(iw)}" height="${r1(dest[i + 1] - dest[i] + .1)}" viewBox="0 ${source[i]} ${art.width} ${source[i + 1] - source[i]}" preserveAspectRatio="none" overflow="hidden"><image href="${art.src}" width="${art.width}" height="${art.height}"/></svg>`).join('');
  }
  return `<g data-trail-art="${kind}">${shadows}${painting}${grass}</g>`;
}

// Wildflowers, tufts and stones across the open ground of a tier, kept off the path, the
// clearings and the objects, and smaller on distant tiers.
function scatter(t, next, W, H, routePts, rand) {
  const wide = W > 1000, far = !!t.depth, k = (wide ? 1 : .78) * (far ? .55 : 1);
  const keepOut = [...(t.clear ? [t.clear] : []), ...(t.board ? [t.board.box] : []), ...t.boxes];
  const offPath = (x, y) => !t.pathW || routePts.every(([px, py]) => Math.hypot(px - x, py - y) > t.pathW / 2 + 16 * k);
  const offLane = (x, y) => !t.lane || Math.abs(y - (t.lane.from[1] + t.sh)) > t.lane.w / 2 + 14;
  let out = '';
  // Sparse and evenly spread: each mark keeps its distance from the others, so the ground reads as
  // dressed rather than carpeted.
  const tries = Math.round((wide ? 56 : 30) * (far ? .6 : 1)), gap = (wide ? 95 : 70) * k, placed = [];
  for (let n = 0; n < tries; n++) {
    const x = rand() * W, top = crestY(t, x, W) + (far ? 14 : 34);
    const bottom = Math.min(next ? crestY(next, x, W) - 4 : H - 10, top + 820);
    if (bottom - top < 24) continue;
    const y = top + rand() * (bottom - top), m = 22 * k, r = rand();
    if (keepOut.some(([x0, y0, x1, y1]) => x > x0 - m && x < x1 + m && y > y0 - m && y < y1 + m) || !offPath(x, y) || !offLane(x, y)) continue;
    if (placed.some(([px, py]) => Math.hypot(px - x, py - y) < gap)) continue;
    placed.push([x, y]);
    if (r < .4) out += tuft(x, y, (18 + rand() * 16) * k, rand);
    else if (r < .84) for (let f = 0, c = rand() < .6 ? 1 : 2; f < c; f++) out += flower(x + f * 14 * k, y + (rand() - .5) * 8 * k, (5 + rand() * 2.5) * k, rand);
    else out += stone(x, y, (6 + rand() * 5) * k, rand);
  }
  return out;
}

function item(it, t, W, homes, rand) {
  if (it.a === 'plant') return plant(it.x, it.top + t.sh, it.h, it.flip);
  let x, y;
  if (it.on) { const h = homes[it.on]; x = h.x + it.dx; y = h.top + h.h * SURFACE[h.a] + (it.sink || 0); }
  else if (it.ground != null) { x = it.x; y = it.ground + t.sh; }
  // On a crest, stand on the lowest ground under the footprint, so no corner hangs over a downslope.
  else { x = it.x; y = Math.max(...[-.46, -.23, 0, .23, .46].map(u => crestY(t, x + u * it.w, W))) + it.sink; }
  if (it.a === 'bed') {
    t.boxes.push([x - it.w / 2, y - it.h / 2, x + it.w / 2, y + it.h / 2]);
    if (it.kind === 'trodden') return `<path d="${blob(x, y, it.w / 2, it.h / 2, rand)}" fill="#c9d98f" opacity=".42"/>`;
    const furrows = [-1, 0, 1].map(f => `M${r1(x - it.w * .32)},${r1(y + f * it.h * .2)}Q${r1(x)},${r1(y + f * it.h * .2 - it.h * .1)} ${r1(x + it.w * .32)},${r1(y + f * it.h * .2)}`).join('');
    return `<path d="${blob(x, y, it.w / 2, it.h / 2, rand)}" fill="#b98a5e" stroke="var(--ink)" stroke-width="3"/><path d="${furrows}" fill="none" stroke="#956640" stroke-width="3" stroke-linecap="round"/>`;
  }
  const [, iw, ih] = ART[it.a], h = it.w * ih / iw;
  if (it.id) homes[it.id] = { a: it.a, x, y, w: it.w, h, top: y - h };
  if (!it.on) t.boxes.push([x - it.w / 2, y - h, x + it.w / 2, y + 6]);
  // Contact shadow on the owning ground (or tabletop), then grass grown over the base.
  const shadow = it.on ? `<ellipse cx="${r1(x)}" cy="${r1(y - 1)}" rx="${r1(it.w * .48)}" ry="${r1(Math.max(3, it.w * .05))}" fill="#5a3a1c" opacity=".28"/>` : `<ellipse cx="${r1(x)}" cy="${r1(y - 2)}" rx="${r1(it.w * .52)}" ry="${r1(Math.max(5, it.w * .07))}" fill="#22331a" opacity=".2"/><ellipse cx="${r1(x)}" cy="${r1(y - 2)}" rx="${r1(it.w * .34)}" ry="${r1(Math.max(3, it.w * .035))}" fill="#22331a" opacity=".22"/>`;
  const roots = it.on || it.id === 'rover' ? '' : rootIn(it.a, x, y, it.w, rand);
  if (it.a === 'countdown') {
    const clock = document.getElementById('event-countdown');
    if (clock) Object.assign(clock.style, { left: `${(x - it.w / 2) * s}px`, top: `${(y - h) * s}px`, width: `${it.w * s}px`, height: `${h * s}px` });
    return shadow;
  }
  if (it.id === 'rover') return `<g class="rover-body" style="--drive:${it.drive}px">${shadow}${img(it.a, x, y, it.w)}</g>`;
  let out = `${shadow}<g${it.cls ? ` class="${it.cls}"` : ''}>${img(it.a, x, y, it.w)}</g>`;
  if (it.id === 'pump') out += seedling(x - it.w / 2 + it.w * .07, y + 2, it.w * .44, h);
  if (it.id === 'breadboard') out += [[.33, .4], [.52, .3], [.7, .48]].map(([u, v], i) => {
    const cx = r1(x - it.w / 2 + u * it.w), cy = r1(y - h + v * h);
    return `<g class="led" style="animation-delay:${i * .3}s"><circle cx="${cx}" cy="${cy}" r="${r1(it.w * .09)}" fill="#F6D86B" opacity=".45"/><circle cx="${cx}" cy="${cy}" r="${r1(it.w * .04)}" fill="#F6D86B" stroke="var(--ink)" stroke-width="2"/></g>`;
  }).join('');
  return out + roots;
}

// A rigid freestanding sign: rear braces, posts, then the thick front frame.
// Every piece shares this terrain tier; grass hides the feet at one ground line.
function board({ ix, iy, iw, ih, ground }, rand) {
  const postX = [.13, .85].map(u => ix + u * iw), pw = Math.max(24, iw * .055);
  const beam = (x, y, w, h, extra = '') => `<image href="${BILLBOARD.post[0]}" x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" preserveAspectRatio="none" ${extra}/>`;
  const cast = `<ellipse cx="${r1(ix + iw * .55)}" cy="${r1(ground + 10)}" rx="${r1(iw * .48)}" ry="18" fill="#22331a" opacity=".12"/>`;
  const braces = postX.map(px => {
    const bx = px + pw * 1.65, by = ground - 10, tx = px + pw * .15, ty = iy + ih * .68;
    const len = Math.hypot(tx - bx, by - ty), angle = Math.atan2(tx - bx, by - ty) * 180 / Math.PI;
    return `<ellipse cx="${r1(bx)}" cy="${r1(by + 2)}" rx="${r1(pw * .8)}" ry="6" fill="#22331a" opacity=".18"/><g data-billboard-brace="" opacity=".9" transform="rotate(${r1(angle)} ${r1(bx)} ${r1(by)})">${beam(bx - pw * .36, by - len, pw * .72, len)}</g>`;
  }).join('');
  const posts = postX.map(px => `<ellipse cx="${r1(px + 3)}" cy="${r1(ground + 2)}" rx="${r1(pw * 1.2)}" ry="8" fill="#22331a" opacity=".3"/>` + beam(px - pw / 2, iy + ih * .35, pw, ground - iy - ih * .35 + 3, 'data-billboard-post=""')).join('');
  const lipShade = postX.map(px => `<path d="M${r1(px - pw / 2)} ${r1(iy + ih - 2)}h${r1(pw)}v13h${r1(-pw)}Z" fill="#652713" opacity=".2"/>`).join('');
  // Nine-slice the painted frame: grow the logo area without making the top timber
  // comically thick on phones. Corners keep their original proportions.
  const sx = [0, 180, 1420, 1600], sy = [0, 130, 480, 610];
  const bx = iw * 180 / 1600, by = iw * 130 / 1600;
  const dx = [0, bx, iw - bx, iw], dy = [0, by, ih - by, ih];
  let pieces = '';
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
    pieces += `<svg x="${r1(ix + dx[col])}" y="${r1(iy + dy[row])}" width="${r1(dx[col + 1] - dx[col] + .15)}" height="${r1(dy[row + 1] - dy[row] + .15)}" viewBox="${sx[col]} ${sy[row]} ${sx[col + 1] - sx[col]} ${sy[row + 1] - sy[row]}" preserveAspectRatio="none" overflow="hidden"><image href="${BILLBOARD.panel[0]}" width="1600" height="610"/></svg>`;
  }
  const panel = `<g data-billboard-panel="">${pieces}</g>`;
  const grass = postX.map(px => tuft(px - pw * .45, ground + 5, 34, rand) + tuft(px + pw * .4, ground + 7, 28, rand)).join('');
  return `<g data-billboard="">${cast}${braces}${posts}${lipShade}${panel}${grass}</g>`;
}

// Bit's experiment: a pot under the pump's nozzle. Water falls from the nozzle; the sprout grows.
function seedling(x, groundY, w, pumpH) {
  const k = w / 160, top = groundY - 150 * k, nozzleY = groundY - pumpH * .72;
  return `<g id="seedling" transform="translate(${r1(x - 80 * k)} ${r1(top)}) scale(${r1(k * 100) / 100})">
    <g class="sprout"><image href="${P}sensor-stem.svg" x="62" y="-90" width="30" height="160"/>
      <image href="${P}sensor-leaf-left.svg" x="-8" y="-118" width="80" height="88"/><image href="${P}sensor-leaf-right.svg" x="76" y="-122" width="80" height="88"/></g>
    <image href="${P}sensor-pot.svg" x="0" y="0" width="160" height="160"/>
  </g>
  <g style="--fall:${r1(top - nozzleY + 40 * k)}px">${[0, 1, 2].map(i => `<ellipse class="drop" style="animation-delay:${i * .25}s" cx="${r1(x + (i - 1) * 4)}" cy="${r1(nozzleY)}" rx="${r1(10 * k)}" ry="${r1(14 * k)}" fill="#7cc4e4" stroke="var(--ink)" stroke-width="2"/>`).join('')}</g>`;
}

// A rooted foreground plant at the edge of the frame, partly off-canvas.
function plant(x, y, h, flip) {
  const k = h / 720, w = 280 * k;
  const leaf = (a, tx, ty, size, rot) => `<g class="sway" style="animation-delay:${-rot / 20}s"><image href="${ART[a][0]}" x="${r1(x + tx * k - size * .5)}" y="${r1(y + ty * k - size * 1.29)}" width="${r1(size)}" height="${r1(size * 1.33)}" transform="rotate(${rot} ${r1(x + tx * k)} ${r1(y + ty * k)})"/></g>`;
  const mirror = flip ? ` transform="translate(${r1(2 * x + w)} 0) scale(-1 1)"` : '';
  return `<g${mirror}><g class="sway slow"><image href="${ART.stem[0]}" x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}"/>
    ${leaf('leafA', 176, 64, 264 * k, 8)}${leaf('leafB', 244, 245, 220 * k, 62)}${leaf('leafA', 45, 420, 211 * k, -58)}</g></g>`;
}

// Depth: distant tiers lag native scroll a little, so the far ridge sinks behind nearer hills as you descend.
let ticking = false;
function updateDepth() {
  ticking = false;
  const y = motionOff() ? 0 : Math.min(scrollY, innerHeight * 1.2) / s;
  for (const g of depthGroups) g.setAttribute('transform', `translate(0 ${r1(y * g.dataset.depth)})`);
  header.classList.toggle('is-scrolled', scrollY > 24);
}
const header = document.querySelector('.site-header');
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateDepth); } }, { passive: true });

// Ambient loops and depth stop when the OS asks for reduced motion.
const motionOff = () => reduceMotion.matches;
function syncMotion() {
  document.documentElement.classList.toggle('motion-paused', motionOff());
  updateDepth();
}
reduceMotion.addEventListener('change', syncMotion);

// Re-lay out on resize, and whenever a copy block changes height (an FAQ opens, text zoom, fonts load).
let pending;
// If drawing fails, fall back to the plain stacked copy rather than leaving text positioned over nothing.
function safeRender() {
  try { render(); } catch (error) {
    console.error('Hillside unavailable:', error);
    world.classList.remove('is-laid-out');
    world.style.height = '';
    svg.replaceChildren();
    document.querySelectorAll('[data-copy]').forEach(el => el.removeAttribute('style'));
  }
}
const relayout = () => { cancelAnimationFrame(pending); pending = requestAnimationFrame(safeRender); };
addEventListener('resize', relayout);
document.addEventListener('trail-board-content-change', relayout);
const heights = new Map();
const watch = new ResizeObserver(entries => {
  let changed = false;
  for (const e of entries) {
    const h = Math.round(e.contentRect.height);
    if (heights.get(e.target) !== h) { heights.set(e.target, h); changed = true; }
  }
  if (changed) relayout();
});
document.querySelectorAll('[data-copy]').forEach(el => watch.observe(el));
safeRender();
if (world.classList.contains('is-laid-out')) syncMotion();
