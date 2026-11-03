'use strict';
// Throw a pot: a making job at Kiln Lane Pottery (and in the puzzle room).
// A lump of wet clay sits on the potter's wheel, and an order card pinned to
// the wall shows what to make (a bowl, a mug, a vase or a jug, as a dashed
// outline) and which glaze it wants (a colour and a pattern, with its name).
// Tap the pedal and the wheel starts to turn. Then pull the clay up with a
// finger, three times, upwards along its side: every pull raises the walls
// a third of the way to the outline, and nothing can go wrong while shaping.
// Last of all, tap the glaze pot from the order and the pot is dipped.
//   node test/run.mjs puzzle js/pz-wheel.js wheel --seeds 30

(() => {
  const W = 360;
  const WX = 176, BY = 380;                     // the middle of the wheel head, where the clay stands
  const HEAD = { rx: 76, ry: 15, t: 7 };
  const PAN = { y: 394, rx: 114, ry: 27 };
  const PX = 302, PY = 450, PR = 38;            // the pedal, and how far a tap on it reaches
  const JAR_Y = 532, JAR_XS = [50, 137, 224, 311], JAR_R = 38;
  const BENCH = 562;                            // the top of the glaze bench
  const PULL = 50;                              // finger travel up the clay for a third of the wall
  const TAP = 26;
  const RIMK = 0.24;                            // how round the rim looks from here

  // a pot's side, in eleven half-widths from the foot (0) to the rim (10)
  const LUMP = { h: 40, hw: [35, 35.5, 35.5, 35, 34, 32.5, 30, 26.5, 21.5, 14.5, 4] };
  const SHAPES = {
    bowl: { name: 'a bowl', h: 56, hw: [21, 30, 37, 42.5, 47, 50.5, 53, 55, 56.5, 57.5, 58] },
    mug: { name: 'a mug', h: 78, hw: [27, 28.5, 29, 29, 29, 29, 29, 29, 29, 29.5, 30], handle: true },
    vase: { name: 'a vase', h: 116, hw: [24, 33, 39, 41, 38.5, 31, 22.5, 16, 14, 15.5, 20] },
    jug: { name: 'a jug', h: 98, hw: [28, 35, 39.5, 41, 40, 37, 32, 27.5, 25, 25.5, 27.5], handle: true, spout: true },
  };
  const SHAPE_IDS = Object.keys(SHAPES);

  // glazes: a colour and a pattern each, and both in the name
  const GLAZES = [
    { id: 'dots', name: 'Blue dots', col: '#8fbfe6', deep: '#3f6fa8', pat: 'dots' },
    { id: 'stripes', name: 'Green stripes', col: '#a5d7ba', deep: '#3f8a63', pat: 'stripes' },
    { id: 'waves', name: 'Yellow waves', col: '#f2d88a', deep: '#b9861c', pat: 'waves' },
    { id: 'speckles', name: 'Pink speckles', col: '#efb4ae', deep: '#b04f48', pat: 'speckles' },
    { id: 'flowers', name: 'Lilac flowers', col: '#c9badf', deep: '#6d55a6', pat: 'flowers' },
    { id: 'drips', name: 'Cream drips', col: '#f4ead6', deep: '#8a5a36', pat: 'drips' },
  ];
  // wet clay: terracotta, buff stoneware, pale porcelain, red earthenware
  const CLAYS = [
    { col: '#c98a5e', dark: '#93603f' }, { col: '#c7a57c', dark: '#8f7151' },
    { col: '#e6d4ba', dark: '#b49a78' }, { col: '#b36d4f', dark: '#7f4a33' },
  ];

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  // a small seeded random of our own, so speckles and wood grain hold still
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  // a smooth curve through the eleven half-widths
  function hwAt(a, t) {
    const x = clamp(t, 0, 1) * (a.length - 1), i = Math.min(a.length - 2, Math.floor(x)), f = x - i;
    const p0 = a[Math.max(0, i - 1)], p1 = a[i], p2 = a[i + 1], p3 = a[Math.min(a.length - 1, i + 2)];
    return 0.5 * (2 * p1 + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (-p0 + 3 * p1 - 3 * p2 + p3) * f * f * f);
  }
  // the lump on its way to the shape: f = 0 the lump, f = 1 the finished shape
  function profile(shape, f) {
    const e = f * f * (3 - 2 * f) * 0.35 + f * 0.65;
    return { h: LUMP.h + (shape.h - LUMP.h) * e, hw: LUMP.hw.map((v, i) => v + (shape.hw[i] - v) * e), open: clamp(f * 3, 0, 1) };
  }
  const widest = (pr) => Math.max(...pr.hw);
  // the outline of a pot standing at x, y: up the left side, over the back of
  // the rim, down the right side and round the front of the foot
  function bodyPath(pr, x, y, s = 1) {
    const p = new Path2D(), M = 24;
    const b = pr.hw[0] * s, top = y - pr.h * s, rx = hwAt(pr.hw, 1) * s;
    p.moveTo(x - b, y);
    for (let k = 1; k <= M; k++) { const t = k / M; p.lineTo(x - hwAt(pr.hw, t) * s, y - t * pr.h * s); }
    p.ellipse(x, top, rx, rx * RIMK, 0, Math.PI, Math.PI * 2, false);
    for (let k = M; k >= 0; k--) { const t = k / M; p.lineTo(x + hwAt(pr.hw, t) * s, y - t * pr.h * s); }
    p.ellipse(x, y, b, b * 0.16, 0, 0, Math.PI, false);
    p.closePath();
    return p;
  }
  // a mug's or a jug's handle on the right, pulled from the side
  function handlePath(pr, x, y, s = 1) {
    const p = new Path2D(), t0 = 0.8, t1 = 0.28;
    const ax = x + hwAt(pr.hw, t0) * s - 2, ay = y - t0 * pr.h * s, bx = x + hwAt(pr.hw, t1) * s - 2, by = y - t1 * pr.h * s;
    const out = 24 * s;
    p.moveTo(ax, ay);
    p.bezierCurveTo(ax + out * 1.2, ay - 4 * s, bx + out * 1.3, by + 2 * s, bx, by);
    return p;
  }
  // a jug's lip, pinched out on the left of the rim
  function spoutPath(pr, x, y, s = 1) {
    const p = new Path2D(), rx = hwAt(pr.hw, 1) * s, top = y - pr.h * s;
    p.moveTo(x - rx + 8 * s, top - 3 * s);
    p.quadraticCurveTo(x - rx - 4 * s, top - 5 * s, x - rx - 11 * s, top - 3 * s);
    p.quadraticCurveTo(x - rx - 3 * s, top + 4 * s, x - rx + 6 * s, top + 10 * s);
    p.closePath();
    return p;
  }

  function flower(p, x, y, d) {
    for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 - Math.PI / 2, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d; p.moveTo(px + d * 0.8, py); p.arc(px, py, d * 0.8, 0, 7); }
  }
  // a glaze's pattern over a box (the caller clips it to the pot or the swatch)
  function pattern(c, g, x0, y0, x1, y1, s = 1) {
    const p = new Path2D();
    c.fillStyle = g.deep; c.strokeStyle = g.deep;
    if (g.pat === 'dots') {
      for (let y = y0 + 5 * s, row = 0; y < y1 + 4; y += 9 * s, row++) for (let x = x0 + (row % 2 ? 4.5 * s : 0); x < x1 + 4; x += 9 * s) { p.moveTo(x + 2.3 * s, y); p.arc(x, y, 2.3 * s, 0, 7); }
      c.fill(p);
    } else if (g.pat === 'stripes') {
      for (let y = y0 + 4 * s; y < y1; y += 9 * s) p.rect(x0 - 2, y, x1 - x0 + 4, 3.2 * s);
      c.fill(p);
    } else if (g.pat === 'waves') {
      c.lineWidth = 2.3 * s; c.lineCap = 'round'; c.lineJoin = 'round';
      for (let y = y0 + 6 * s; y < y1 + 4; y += 10 * s) { p.moveTo(x0 - 4, y); for (let x = x0 - 4; x <= x1 + 4; x += 2) p.lineTo(x, y + Math.sin((x - x0) / (4.4 * s)) * 2.4 * s); }
      c.stroke(p);
    } else if (g.pat === 'speckles') {
      const rr = rng(911), n = Math.round(((x1 - x0) * (y1 - y0)) / (30 * s * s));
      for (let i = 0; i < n; i++) { const x = x0 + rr() * (x1 - x0), y = y0 + rr() * (y1 - y0), d = (0.7 + rr() * 1.3) * s; p.moveTo(x + d, y); p.arc(x, y, d, 0, 7); }
      c.fill(p);
    } else if (g.pat === 'flowers') {
      const ctr = new Path2D();
      for (let y = y0 + 9 * s, row = 0; y < y1 + 6; y += 17 * s, row++) for (let x = x0 + (row % 2 ? 9 * s : 0); x < x1 + 8; x += 18 * s) { flower(p, x, y, 3 * s); ctr.moveTo(x + 1.8 * s, y); ctr.arc(x, y, 1.8 * s, 0, 7); }
      c.fill(p); c.fillStyle = '#fff3c4'; c.fill(ctr);
    } else if (g.pat === 'drips') {
      const rr = rng(377);
      p.rect(x0 - 2, y0 - 2, x1 - x0 + 4, 6 * s);
      for (let x = x0 + 2 * s; x < x1; x += 6.5 * s) { const l = (6 + rr() * 14) * s; p.roundRect(x, y0, 3.6 * s, l, 1.8 * s); }
      c.fill(p);
    }
  }
  // a round swatch of a glaze, as on the order card and the glaze pots
  function swatch(c, g, x, y, r) {
    c.fillStyle = 'rgba(59,53,46,0.18)'; c.beginPath(); c.arc(x + 1, y + 1.6, r + 2.4, 0, 7); c.fill();
    c.fillStyle = '#fffaf1'; c.beginPath(); c.arc(x, y, r + 2.4, 0, 7); c.fill();
    c.fillStyle = g.col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.clip();
    pattern(c, g, x - r, y - r - (g.pat === 'drips' ? 0 : 1), x + r, y + r, Math.max(0.7, r / 16));
    c.restore();
    c.strokeStyle = 'rgba(59,53,46,0.3)'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke();
  }

  // the pot on the wheel: wet clay, or glazed; f = 0..1 how far it is thrown
  function drawPot(c, o) {
    const { shape, f, x, y, clay, glaze, gk, spin, handleK } = o;
    const pr = profile(shape, f), body = bodyPath(pr, x, y), top = y - pr.h, rx = hwAt(pr.hw, 1), mw = widest(pr);
    const glazed = glaze && gk > 0;
    // a soft shadow on the wheel
    c.fillStyle = 'rgba(40,30,20,0.22)'; c.beginPath(); c.ellipse(x + 3, y + 2, pr.hw[0] + 9, (pr.hw[0] + 9) * 0.2, 0, 0, 7); c.fill();
    const fill = (col, dark) => {
      const gr = c.createLinearGradient(x - mw, 0, x + mw, 0);
      gr.addColorStop(0, dark); gr.addColorStop(0.3, U.shade(col, 0.12)); gr.addColorStop(0.55, col); gr.addColorStop(1, dark);
      return gr;
    };
    // the handle sits behind the body's right edge
    if (shape.handle && handleK > 0) {
      c.save(); c.translate(x, top + pr.h * 0.5); c.scale(handleK, 1); c.translate(-x, -(top + pr.h * 0.5));
      const hp = handlePath(pr, x, y);
      c.lineCap = 'round';
      c.strokeStyle = 'rgba(59,53,46,0.4)'; c.lineWidth = 11; c.stroke(hp);
      c.strokeStyle = glazed && gk >= 1 ? U.shade(glaze.col, -0.06) : U.shade(clay.col, -0.06); c.lineWidth = 8.6; c.stroke(hp);
      if (glazed && gk >= 1) { c.save(); c.strokeStyle = glaze.deep; c.globalAlpha = 0.5; c.lineWidth = 2; c.setLineDash([3, 5]); c.stroke(hp); c.restore(); }
      c.restore();
    }
    // a jug's lip, also tucked behind the body
    if (shape.spout && handleK > 0) {
      const sp = spoutPath(pr, x, y);
      c.save(); c.globalAlpha = handleK;
      c.fillStyle = glazed && gk >= 1 ? glaze.col : clay.col; c.fill(sp);
      c.strokeStyle = 'rgba(59,53,46,0.42)'; c.lineWidth = 1.2; c.stroke(sp);
      c.restore();
    }
    // the clay
    c.fillStyle = fill(clay.col, clay.dark); c.fill(body);
    c.save(); c.clip(body);
    // throwing ridges, and a wet shine that travels round as the wheel turns
    if (f > 0.15) {
      c.strokeStyle = U.rgba(clay.dark, 0.28); c.lineWidth = 1.1;
      for (let yy = y - 7; yy > top + 4; yy -= 7.5) { const t = (y - yy) / pr.h, w = hwAt(pr.hw, t); c.beginPath(); c.ellipse(x, yy, w, w * RIMK * 0.9, 0, 0.15, Math.PI - 0.15); c.stroke(); }
    }
    const sx = x + Math.sin(spin) * mw * 0.5;
    const sh = c.createLinearGradient(sx - 12, 0, sx + 12, 0);
    sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(255,255,255,0.24)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = sh; c.fillRect(sx - 12, top - 10, 24, pr.h + 20);
    // the glaze, dipped from the rim down, with a band of bare clay at the foot
    if (glazed) {
      c.save();
      c.beginPath(); c.rect(x - mw - 20, top - 14, (mw + 20) * 2, (pr.h + 14) * gk); c.clip();
      c.beginPath(); c.rect(x - mw - 20, top - 14, (mw + 20) * 2, pr.h + 14 - 7); c.clip();
      c.fillStyle = fill(glaze.col, U.shade(glaze.col, -0.16)); c.fillRect(x - mw - 20, top - 14, (mw + 20) * 2, pr.h + 14);
      pattern(c, glaze, x - mw, top, x + mw, y - 7, 1);
      c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(x - mw * 0.55, top, mw * 0.16, pr.h);
      c.restore();
      if (gk >= 1) { c.strokeStyle = U.rgba(glaze.deep, 0.35); c.lineWidth = 1.2; c.beginPath(); c.moveTo(x - mw - 4, y - 7); c.lineTo(x + mw + 4, y - 7); c.stroke(); }
    }
    c.restore();
    c.strokeStyle = 'rgba(59,53,46,0.42)'; c.lineWidth = 1.3; c.stroke(body);
    // the opening at the top, once the clay is opened up
    if (pr.open > 0.05) {
      const k = pr.open, th = 3.6 * k, irx = Math.max(1, rx - th), iry = Math.max(0.6, rx * RIMK - th * 0.35);
      c.fillStyle = glazed && gk >= 1 ? U.shade(glaze.col, -0.28) : U.shade(clay.dark, -0.12);
      c.globalAlpha = k; c.beginPath(); c.ellipse(x, top, irx, iry, 0, 0, 7); c.fill();
      c.fillStyle = 'rgba(0,0,0,0.12)'; c.beginPath(); c.ellipse(x, top + iry * 0.3, irx * 0.8, iry * 0.6, 0, 0, 7); c.fill();
      c.globalAlpha = 1;
      c.strokeStyle = glazed && gk >= 1 ? U.shade(glaze.col, 0.25) : U.shade(clay.col, 0.18); c.lineWidth = 1.4;
      c.beginPath(); c.ellipse(x, top, rx - 0.7, rx * RIMK - 0.4, 0, 0.1, Math.PI - 0.1); c.stroke();
    }
  }

  // the wheel head, with its marks going round
  function drawHead(c, spin) {
    const hy = BY + 1;
    c.fillStyle = '#7f878a'; c.beginPath(); c.ellipse(WX, hy + HEAD.t, HEAD.rx, HEAD.ry, 0, 0, 7); c.fill();
    c.fillRect(WX - HEAD.rx, hy, HEAD.rx * 2, HEAD.t);
    const gr = c.createLinearGradient(WX - HEAD.rx, 0, WX + HEAD.rx, 0);
    gr.addColorStop(0, '#a7aeb1'); gr.addColorStop(0.4, '#c9cfd1'); gr.addColorStop(1, '#a1a8ab');
    c.fillStyle = gr; c.beginPath(); c.ellipse(WX, hy, HEAD.rx, HEAD.ry, 0, 0, 7); c.fill();
    c.strokeStyle = 'rgba(80,88,92,0.35)'; c.lineWidth = 0.9;
    for (const k of [0.45, 0.72, 0.94]) { c.beginPath(); c.ellipse(WX, hy, HEAD.rx * k, HEAD.ry * k, 0, 0, 7); c.stroke(); }
    // a smear of slip and three marks that go round with the wheel
    c.fillStyle = 'rgba(160,110,75,0.25)'; c.beginPath(); c.ellipse(WX - 30, hy + 4, 16, 3, 0.1, 0, 7); c.fill();
    for (let i = 0; i < 3; i++) {
      const a = spin + (i * Math.PI * 2) / 3, mx = WX + Math.cos(a) * HEAD.rx * 0.84, my = hy + Math.sin(a) * HEAD.ry * 0.84;
      c.fillStyle = Math.sin(a) > 0 ? 'rgba(70,76,80,0.55)' : 'rgba(70,76,80,0.3)';
      c.beginPath(); c.ellipse(mx, my, 3.4, 1.4, 0, 0, 7); c.fill();
    }
  }

  // the pedal on the floor, pressed down once the wheel is turning
  function drawPedal(c, on) {
    PZ.shadow(c, PX + 2, PY + 15, 34, 6, 0.2);
    c.fillStyle = '#5d6466'; PZ.rr(c, PX - 32, PY - 2, 64, 16, 6); c.fill();
    c.save(); c.translate(PX - 28, PY + 2); c.rotate(on ? -0.02 : -0.16);
    c.fillStyle = on ? '#6f787a' : '#8b9497'; PZ.rr(c, 0, -12, 58, 14, 5); c.fill();
    c.strokeStyle = 'rgba(40,44,46,0.45)'; c.lineWidth = 1.4;
    for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(12 + k * 8, -9); c.lineTo(12 + k * 8, -1); c.stroke(); }
    c.restore();
    c.fillStyle = on ? '#9fd08a' : '#c9b9a0'; c.beginPath(); c.arc(PX + 22, PY + 6, 3, 0, 7); c.fill();
  }

  // a glaze pot on the bench: stoneware with the glaze showing at the top,
  // running down the rim, and a big painted swatch on its front
  function drawJar(c, g, x, y, rot) {
    c.save(); c.translate(x, y + 28); c.rotate(rot); c.translate(-x, -(y + 28));
    PZ.shadow(c, x + 2, y + 29, 28, 5, 0.2);
    const jar = new Path2D();
    jar.moveTo(x - 22, y + 28);
    jar.bezierCurveTo(x - 30, y + 18, x - 30, y - 6, x - 21, y - 14);
    jar.lineTo(x - 21, y - 20); jar.lineTo(x + 21, y - 20); jar.lineTo(x + 21, y - 14);
    jar.bezierCurveTo(x + 30, y - 6, x + 30, y + 18, x + 22, y + 28);
    jar.closePath();
    const gr = c.createLinearGradient(x - 28, 0, x + 28, 0);
    gr.addColorStop(0, '#cfc3ad'); gr.addColorStop(0.35, '#f1e9da'); gr.addColorStop(1, '#c2b59d');
    c.fillStyle = gr; c.fill(jar);
    c.strokeStyle = 'rgba(59,53,46,0.38)'; c.lineWidth = 1.2; c.stroke(jar);
    // the glaze inside, and a drip or two over the rim
    c.fillStyle = '#e4d9c4'; c.beginPath(); c.ellipse(x, y - 20, 21, 5.4, 0, 0, 7); c.fill();
    c.fillStyle = g.col; c.beginPath(); c.ellipse(x, y - 19.4, 17.5, 4, 0, 0, 7); c.fill();
    c.strokeStyle = 'rgba(59,53,46,0.3)'; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y - 20, 21, 5.4, 0, 0, 7); c.stroke();
    c.fillStyle = g.col;
    PZ.rr(c, x - 15, y - 17, 4.2, 12, 2.1); c.fill(); PZ.rr(c, x + 9, y - 17, 4.2, 8, 2.1); c.fill();
    swatch(c, g, x, y + 7, 14.5);
    c.restore();
  }

  function wheel(S) {
    const r = S.r;
    const shapeId = SHAPE_IDS[(r() * SHAPE_IDS.length) | 0], shape = SHAPES[shapeId];
    const glazes = PZ.shuffle(r, GLAZES.slice()).slice(0, 4);       // the four pots on the bench, left to right
    const want = (r() * 4) | 0, goal = glazes[want];
    const clay = CLAYS[(r() * CLAYS.length) | 0];
    let spun = false, walls = 0, glazed = false;
    // how it looks right now, eased towards the state
    let shown = 0, gk = 0, handleK = 0, spin = r() * 6, speed = 0, pedalT = 0;
    let press = null, hintT = 0, nudgeT = 0, fx = null;
    const wob = [0, 0, 0, 0], drops = [];

    const need = () => (!spun ? 'pedal' : walls < 3 ? 'pull' : !glazed ? 'glaze' : null);
    const pullK = () => (press && press.kind === 'pull' && !press.done ? press.k : 0);
    const clayNow = () => profile(shape, Math.min(1, (walls + pullK()) / 3));
    function onClay(x, y) {
      const pr = profile(shape, shown / 3);
      return Math.abs(x - WX) <= widest(pr) + 46 && y >= BY - pr.h - 44 && y <= BY + 30;
    }
    const jarAt = (x, y) => JAR_XS.findIndex((jx) => PZ.dist(jx, JAR_Y, x, y) <= JAR_R);
    function nudge() { nudgeT = 1.6; }

    function raise() {
      press.done = true;
      walls++;
      const pr = profile(shape, walls / 3);
      for (let k = 0; k < 10; k++) {
        const side = k % 2 ? 1 : -1, t = 0.3 + (k / 10) * 0.6;
        drops.push({ x: WX + side * hwAt(pr.hw, t), y: BY - t * pr.h, vx: side * (40 + (k * 13) % 30), vy: -30 - (k * 7) % 25, t: 0 });
      }
      fx.good(WX + widest(pr) * 0.6, BY - pr.h * 0.6);
    }

    const sc = {
      puzzle: true, indoor: true, steps: 5,
      crop: { x: 66, y: 236, w: 220, h: 220 },
      decor(c) {
        const { x0, y0, x1, y1 } = S.bleed, rr = rng(3307);
        // the workshop wall: limewashed brick, warm and a little uneven
        c.fillStyle = '#efe3cf'; c.fillRect(x0, y0, x1 - x0, 448 - y0);
        c.fillStyle = 'rgba(190,150,110,0.12)';
        for (let y = Math.floor(y0 / 18) * 18; y < 448; y += 18) for (let x = Math.floor(x0 / 44) * 44 + ((y / 18) % 2 ? 22 : 0); x < x1; x += 44) PZ.rr(c, x + 2, y + 2, 40, 14, 3), c.fill();
        PZ.text(c, 'Spin the wheel, pull up the clay, then glaze it', W / 2, 22, { size: 13, color: PZ.INK2, maxW: 344 });
        // a little window with the lane outside
        c.fillStyle = 'rgba(60,40,20,0.14)'; PZ.rr(c, 23, 51, 100, 100, 5); c.fill();
        c.fillStyle = '#b98f5a'; PZ.rr(c, 20, 46, 100, 100, 5); c.fill();
        const sky = c.createLinearGradient(0, 54, 0, 138); sky.addColorStop(0, '#bfe0ee'); sky.addColorStop(1, '#eef4e6');
        c.fillStyle = sky; c.fillRect(28, 54, 84, 84);
        c.fillStyle = '#a9cf8f'; c.beginPath(); c.moveTo(28, 116); c.quadraticCurveTo(64, 100, 112, 112); c.lineTo(112, 138); c.lineTo(28, 138); c.closePath(); c.fill();
        c.fillStyle = '#8fbd78'; c.beginPath(); c.moveTo(28, 128); c.quadraticCurveTo(76, 118, 112, 126); c.lineTo(112, 138); c.lineTo(28, 138); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.ellipse(52, 72, 12, 4, 0, 0, 7); c.ellipse(62, 69, 8, 5, 0, 0, 7); c.fill();
        c.fillStyle = '#b98f5a'; c.fillRect(68.5, 54, 3, 84); c.fillRect(28, 94.5, 84, 3);
        c.fillStyle = '#d8c09a'; PZ.rr(c, 14, 144, 112, 8, 2); c.fill();
        // lavender in a jug on the sill
        c.strokeStyle = '#6f9a6a'; c.lineWidth = 1.2;
        for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(102, 134); c.lineTo(92 + k * 4, 112 + (k % 2) * 4); c.stroke(); }
        c.fillStyle = '#9b86c9';
        for (let k = 0; k < 6; k++) for (let j = 0; j < 4; j++) { c.beginPath(); c.ellipse(92 + k * 4 + j * 0.4, 112 + (k % 2) * 4 + j * 3, 1.6, 2, 0, 0, 7); c.fill(); }
        c.fillStyle = '#d98b63'; PZ.rr(c, 95, 130, 15, 14, 3); c.fill();
        // a shelf of pots drying, plain and pale
        c.fillStyle = 'rgba(60,40,20,0.16)'; c.fillRect(14, 202, 184, 6);
        c.fillStyle = '#c19a64'; c.fillRect(12, 192, 186, 10);
        c.fillStyle = '#a77d4b'; c.fillRect(24, 202, 6, 12); c.fillRect(178, 202, 6, 12);
        const bisque = { col: '#ecdcc6', dark: '#cdb89b' };
        [[40, 'vase', 0.4], [92, 'bowl', 0.42], [142, 'mug', 0.44], [178, 'jug', 0.3]].forEach(([x, id, s]) => {
          const pr = profile(SHAPES[id], 1), p = bodyPath(pr, x, 192, s);
          c.fillStyle = bisque.col; c.fill(p); c.strokeStyle = 'rgba(59,53,46,0.3)'; c.lineWidth = 1; c.stroke(p);
          c.fillStyle = bisque.dark; c.beginPath(); c.ellipse(x, 192 - pr.h * s, hwAt(pr.hw, 1) * s - 1, (hwAt(pr.hw, 1) * s - 1) * RIMK, 0, 0, 7); c.fill();
        });
        // a potter's apron on a peg
        c.fillStyle = '#8a6a4a'; c.beginPath(); c.arc(170, 58, 3, 0, 7); c.fill();
        c.strokeStyle = '#d8c7a6'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(158, 76); c.lineTo(170, 58); c.lineTo(182, 76); c.stroke();
        c.fillStyle = '#9cc5a1'; c.beginPath(); c.moveTo(156, 76); c.lineTo(184, 76); c.lineTo(190, 104); c.quadraticCurveTo(192, 150, 186, 166); c.lineTo(154, 166); c.quadraticCurveTo(148, 150, 150, 104); c.closePath(); c.fill();
        c.fillStyle = 'rgba(160,110,75,0.35)'; c.beginPath(); c.ellipse(164, 140, 6, 4, 0.4, 0, 7); c.ellipse(178, 128, 4, 3, 0, 0, 7); c.fill();
        c.fillStyle = '#86b48c'; PZ.rr(c, 160, 118, 20, 16, 3); c.fill();

        // the order card, pinned to the wall: the shape and the glaze
        const cx0 = 210, cy0 = 44, cw = 138, ch = 176;
        c.save(); c.translate(cx0 + cw / 2, cy0 + ch / 2); c.rotate(-0.025); c.translate(-(cx0 + cw / 2), -(cy0 + ch / 2));
        c.fillStyle = 'rgba(60,40,20,0.18)'; PZ.rr(c, cx0 + 3, cy0 + 4, cw, ch, 5); c.fill();
        c.fillStyle = '#fffaf1'; PZ.rr(c, cx0, cy0, cw, ch, 5); c.fill();
        c.strokeStyle = '#e5d9c6'; c.lineWidth = 1; PZ.rr(c, cx0 + 5, cy0 + 5, cw - 10, ch - 10, 3); c.stroke();
        PZ.text(c, 'Please make', cx0 + cw / 2, cy0 + 20, { size: 11, color: PZ.INK2, weight: 700 });
        PZ.text(c, shape.name, cx0 + cw / 2, cy0 + 38, { size: 17 });
        const full = profile(shape, 1), s = Math.min(64 / shape.h, 90 / (2 * widest(full) + (shape.handle ? 24 : 0)));
        const ox = cx0 + cw / 2 - (shape.handle ? 6 : 0), oy = cy0 + 124;
        c.save(); c.setLineDash([4, 3.4]); c.lineWidth = 1.6; c.strokeStyle = '#8d8578'; c.lineCap = 'round';
        c.fillStyle = 'rgba(205,184,155,0.18)'; const bp = bodyPath(full, ox, oy, s); c.fill(bp); c.stroke(bp);
        if (shape.handle) c.stroke(handlePath(full, ox, oy, s));
        if (shape.spout) c.stroke(spoutPath(full, ox, oy, s));
        c.restore();
        c.strokeStyle = '#e5d9c6'; c.beginPath(); c.moveTo(cx0 + 14, cy0 + 136); c.lineTo(cx0 + cw - 14, cy0 + 136); c.stroke();
        swatch(c, goal, cx0 + 27, cy0 + 156, 12.5);
        PZ.text(c, goal.name, cx0 + 47, cy0 + 156, { size: 13, align: 'left', maxW: cw - 54 });
        c.restore();
        c.fillStyle = '#d98b63'; c.beginPath(); c.arc(cx0 + cw / 2, cy0 + 6, 5, 0, 7); c.fill();
        c.fillStyle = '#f0b08c'; c.beginPath(); c.arc(cx0 + cw / 2 - 1.4, cy0 + 4.6, 1.8, 0, 7); c.fill();

        // the floor: old terracotta tiles
        c.fillStyle = '#d7a27c'; c.fillRect(x0, 448, x1 - x0, y1 - 448);
        c.strokeStyle = 'rgba(140,85,55,0.35)'; c.lineWidth = 1.2;
        for (let y = 448; y < BENCH; y += 22) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); }
        for (let y = 448, row = 0; y < BENCH; y += 22, row++) for (let x = Math.floor(x0 / 44) * 44 + (row % 2 ? 22 : 0); x < x1; x += 44) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 22); c.stroke(); }
        c.fillStyle = 'rgba(60,40,20,0.14)'; c.fillRect(x0, 448, x1 - x0, 4);
        // the wheel's frame, its splash pan and the cord to the pedal
        c.strokeStyle = '#4d5355'; c.lineWidth = 3; c.lineCap = 'round';
        c.beginPath(); c.moveTo(WX + 74, 430); c.bezierCurveTo(WX + 104, 452, PX - 50, PY + 12, PX - 30, PY + 6); c.stroke();
        PZ.shadow(c, WX + 4, 452, 96, 9, 0.22);
        c.fillStyle = '#8aa19e'; c.beginPath(); c.moveTo(WX - 84, 406); c.lineTo(WX + 84, 406); c.lineTo(WX + 70, 446); c.lineTo(WX - 70, 446); c.closePath(); c.fill();
        c.fillStyle = 'rgba(40,60,58,0.2)'; c.fillRect(WX - 76, 432, 152, 14);
        c.fillStyle = '#6f8784'; c.fillRect(WX - 64, 444, 14, 8); c.fillRect(WX + 50, 444, 14, 8);
        c.fillStyle = '#9cb3b0'; c.beginPath(); c.ellipse(WX, PAN.y, PAN.rx, PAN.ry, 0, 0, 7); c.fill();
        c.fillStyle = '#6c8380'; c.beginPath(); c.ellipse(WX, PAN.y - 2, PAN.rx - 9, PAN.ry - 7, 0, 0, 7); c.fill();
        c.fillStyle = 'rgba(160,110,75,0.3)'; c.beginPath(); c.ellipse(WX + 46, PAN.y + 8, 18, 4, 0.1, 0, 7); c.ellipse(WX - 70, PAN.y + 4, 9, 3, 0, 0, 7); c.fill();
        c.fillStyle = '#7f878a'; c.fillRect(WX - 8, PAN.y - 6, 16, 12);
        // a sponge and a wire on the edge of the pan
        c.fillStyle = '#f2d88a'; PZ.rr(c, WX - 104, PAN.y - 8, 18, 11, 4); c.fill();
        c.strokeStyle = '#8d8578'; c.lineWidth = 1; c.beginPath(); c.moveTo(WX + 88, PAN.y - 10); c.quadraticCurveTo(WX + 100, PAN.y - 2, WX + 92, PAN.y + 8); c.stroke();
        c.fillStyle = '#b98f5a'; PZ.rr(c, WX + 84, PAN.y - 14, 8, 5, 2); c.fill(); PZ.rr(c, WX + 88, PAN.y + 6, 8, 5, 2); c.fill();

        // the glaze bench along the front
        c.fillStyle = 'rgba(60,40,20,0.2)'; c.fillRect(x0, BENCH - 4, x1 - x0, 6);
        c.fillStyle = '#c9a372'; c.fillRect(x0, BENCH, x1 - x0, 10);
        c.fillStyle = 'rgba(255,240,210,0.4)'; c.fillRect(x0, BENCH, x1 - x0, 1.4);
        c.fillStyle = '#a77d4b'; c.fillRect(x0, BENCH + 10, x1 - x0, y1 - BENCH - 10);
        c.strokeStyle = 'rgba(80,50,20,0.2)'; c.lineWidth = 0.8;
        for (let i = 0; i < 40; i++) { const gx = x0 + rr() * (x1 - x0), gy = BENCH + 14 + rr() * (y1 - BENCH - 16); c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx + 14 + rr() * 30, gy); c.stroke(); }
        // a name tag under each pot
        JAR_XS.forEach((x, i) => {
          c.fillStyle = 'rgba(60,40,20,0.2)'; PZ.rr(c, x - 39, BENCH + 15, 80, 20, 4); c.fill();
          c.fillStyle = '#fbf3e2'; PZ.rr(c, x - 40, BENCH + 13, 80, 20, 4); c.fill();
          PZ.text(c, glazes[i].name, x, BENCH + 23.5, { size: 11.5, maxW: 74 });
        });
      },
      draw(c, t, still) {
        const show = (k) => !still && (hintT > 0 || nudgeT > 0) && need() === k;
        drawHead(c, spin);
        // the outline to aim for, until the walls are up
        if (walls < 3) {
          c.save(); c.setLineDash([5, 5]); c.lineDashOffset = -spin * 8; c.lineWidth = 1.6; c.strokeStyle = 'rgba(107,97,87,0.45)';
          const full = profile(shape, 1); c.stroke(bodyPath(full, WX, BY));
          if (shape.handle) c.stroke(handlePath(full, WX, BY));
          c.restore();
        }
        drawPot(c, { shape, f: shown / 3, x: WX, y: BY, clay, glaze: glazed ? goal : null, gk: still ? (glazed ? 1 : 0) : gk, spin, handleK: still ? (walls >= 3 ? 1 : 0) : handleK });
        if (!still) for (const d of drops) { c.fillStyle = `rgba(150,105,75,${0.6 * (1 - d.t / 0.6)})`; c.beginPath(); c.arc(d.x, d.y, 2, 0, 7); c.fill(); }
        drawPedal(c, spun || pedalT > 0);
        JAR_XS.forEach((x, i) => drawJar(c, glazes[i], x, JAR_Y, still ? 0 : Math.sin(wob[i] * 38) * wob[i] * 0.5));
        // hints: the pedal, the side of the clay with an arrow up, or the right glaze
        if (show('pedal')) PZ.glow(c, PX, PY + 4, 34, t);
        if (show('pull')) {
          const pr = profile(shape, shown / 3), ax = WX + widest(pr) + 20, ay = BY - pr.h * 0.45;
          PZ.glow(c, ax, ay, 24, t);
          const k = (t * 0.9) % 1;
          c.save(); c.globalAlpha = 0.9 * Math.sin(k * Math.PI); c.strokeStyle = '#e9a93a'; c.fillStyle = '#e9a93a'; c.lineWidth = 4; c.lineCap = 'round';
          const yy = ay + 20 - k * 40;
          c.beginPath(); c.moveTo(ax, yy + 18); c.lineTo(ax, yy); c.stroke();
          c.beginPath(); c.moveTo(ax - 8, yy + 4); c.lineTo(ax, yy - 7); c.lineTo(ax + 8, yy + 4); c.closePath(); c.fill();
          c.restore();
        }
        if (show('glaze')) PZ.glow(c, JAR_XS[want], JAR_Y + 2, 36, t);
      },
      step(dt) {
        hintT -= dt; nudgeT -= dt; pedalT -= dt;
        speed = PZ.approach(speed, spun ? 3.4 : 0, dt, 2);
        spin += speed * dt;
        const target = Math.min(3, walls + pullK() * 0.999);
        shown = PZ.approach(shown, target, dt, press && !press.done ? 18 : 7);
        if (Math.abs(shown - target) < 0.002) shown = target;
        if (walls >= 3) handleK = Math.min(1, handleK + dt * 2.5);
        if (glazed) gk = Math.min(1, gk + dt * 1.4);
        for (let i = 0; i < 4; i++) wob[i] = Math.max(0, wob[i] - dt);
        for (let i = drops.length - 1; i >= 0; i--) { const d = drops[i]; d.t += dt; d.vy += 260 * dt; d.x += d.vx * dt; d.y += d.vy * dt; if (d.t > 0.6) drops.splice(i, 1); }
      },
      down(x, y) {
        press = null;
        if (glazed) return;
        if (PZ.dist(x, y, PX, PY + 4) <= PR) {
          if (!spun) { spun = true; pedalT = 0.3; hintT = 0; fx.sound('turn'); fx.good(PX, PY - 8); }
          else fx.sound('pick');
          return;
        }
        const j = jarAt(x, y);
        if (j >= 0) { press = { kind: 'jar', i: j, x0: x, y0: y }; return; }
        if (onClay(x, y)) {
          if (!spun) { nudge(); fx.sound('nope'); return; }
          if (walls < 3) press = { kind: 'pull', y0: y, k: 0, done: false, poured: false };
        }
      },
      move(x, y) {
        if (!press || press.kind !== 'pull' || press.done) return;
        press.k = clamp((press.y0 - y) / PULL, 0, 1);
        if (press.k > 0.12 && !press.poured) { press.poured = true; fx.sound('pour'); }
        if (press.k >= 1) { hintT = 0; raise(); }
      },
      up(x, y) {
        const p = press; press = null;
        if (!p) return;
        if (p.kind === 'pull') {
          if (!p.done) {
            p.k = Math.max(p.k, clamp((p.y0 - y) / PULL, 0, 1));
            if (p.k >= 0.55) { press = p; hintT = 0; raise(); press = null; }
          }
          return;
        }
        if (p.kind === 'jar' && PZ.dist(x, y, p.x0, p.y0) <= TAP && PZ.dist(x, y, JAR_XS[p.i], JAR_Y) <= JAR_R + 8) {
          if (walls < 3) { wob[p.i] = 0.35; nudge(); fx.sound('nope'); return; }
          if (p.i !== want) { wob[p.i] = 0.5; fx.sound('nope'); return; }
          glazed = true; gk = 0; hintT = 0; fx.sound('chime');
          const pr = profile(shape, 1);
          fx.good(WX, BY - pr.h * 0.5);
        }
      },
      cancel() { press = null; },
      progress: () => ((spun ? 1 : 0) + walls + (glazed ? 1 : 0)) / 5,
      solved: () => glazed,
      hint() { hintT = 3.5; },
      save: () => ({ spun, walls, glazed }),
      load(s) {
        if (!s || typeof s !== 'object') return;
        walls = clamp(Math.round(+s.walls || 0), 0, 3);
        spun = !!s.spun || walls > 0;
        glazed = !!s.glazed && walls === 3;
        shown = walls; handleK = walls >= 3 ? 1 : 0; gk = glazed ? 1 : 0; speed = spun ? 3.4 : 0;
      },
      solveAll() { spun = true; walls = 3; glazed = true; shown = 3; handleK = 1; gk = 1; speed = 3.4; },
      // the pedal, three pulls up the side of the clay, then the right glaze
      debugPlan() {
        const plan = [];
        if (glazed) return plan;
        if (!spun) plan.push({ tap: [PX, PY + 4] });
        const pr = profile(shape, walls / 3), sx = WX + Math.min(widest(pr) + 14, 90);
        for (let k = walls; k < 3; k++) plan.push({ drag: [sx, BY - 10, sx, BY - 96] });
        plan.push({ tap: [JAR_XS[want], JAR_Y + 4] });
        return plan;
      },
    };
    Object.defineProperty(sc, 'fx', { get: () => fx, set: (v) => { fx = v; } });
    return sc;
  }

  Object.assign(SCENES.KINDS, { wheel });
})();
