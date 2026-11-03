'use strict';
// Scenes for Button & Bead, the haberdashery: the brass shop scales and the
// old sewing machine (counter { what: 'scales' | 'machine' }, wiped with the
// cloths, like the café's coffee machine) and the wall of little button
// drawers (attic { where: 'beads' }, dusted like the attic). They are variants
// of those kinds, so they keep their tools; same layers as every other scene
// (see scenes.js).

(() => {
  const { W, field, ramp, softShadow } = SCENES;
  const dot = (c, x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill(); };
  const lin = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); for (const [o, col] of stops) g.addColorStop(o, col); return g; };
  // polished brass, lit from the upper left
  const BRASS = [[0, '#8a6a26'], [0.15, '#d1a23e'], [0.34, '#f8e39b'], [0.5, '#e7c05a'], [0.76, '#b98a2f'], [1, '#7a5a1e']];
  // black japanned iron with a soft sheen
  const IRON = [[0, '#121115'], [0.22, '#2c2b33'], [0.38, '#45444d'], [0.52, '#24232a'], [1, '#0e0d11']];
  const STEEL = [[0, '#8d949b'], [0.3, '#eef2f5'], [0.55, '#bfc6cc'], [1, '#7c838a']];
  const BUTTON_COLS = ['#c9474f', '#3f8f8a', '#e8c35a', '#3d5a86', '#8fb08a', '#d9817a', '#a891d1', '#f1e6cf', '#8a5a3c', '#2f2d33'];
  const RIBBONS = ['#c9474f', '#3f8f8a', '#e8c35a', '#a891d1', '#8fb08a', '#3d5a86', '#efb4ae', '#f1e6cf', '#d98b63'];

  // ------------------------------------------------------------ shared bits
  // dusty rose wallpaper with cream stripes and little sprigs
  function wallpaper(c, nz, x0, y0, x1, y1) {
    const g = ramp(['#dba79e', '#e3b4ab', '#eac1b8']);
    field(c, x0, y0, x1, y1, 4, (x, y) => g(nz.fbm(x * 0.008 + 3, y * 0.008, 3)));
    let col = 0;
    for (let x = Math.floor(x0 / 32) * 32; x < x1; x += 32, col++) {
      c.fillStyle = 'rgba(255,244,232,0.36)'; c.fillRect(x, y0, 10, y1 - y0);
      c.fillStyle = 'rgba(255,244,232,0.22)'; c.fillRect(x + 12, y0, 2, y1 - y0);
      for (let y = Math.floor(y0 / 40) * 40 + (col % 2) * 20; y < y1; y += 40) sprig(c, x + 23, y);
    }
  }
  function sprig(c, x, y) {
    c.strokeStyle = 'rgba(112,144,112,0.55)'; c.lineWidth = 0.9;
    c.beginPath(); c.moveTo(x, y + 6); c.quadraticCurveTo(x + 1, y, x - 1, y - 5); c.stroke();
    c.fillStyle = 'rgba(112,144,112,0.5)';
    c.beginPath(); c.ellipse(x - 2.6, y + 1.4, 2.4, 1.1, -0.6, 0, 7); c.fill();
    c.beginPath(); c.ellipse(x + 2.6, y - 0.6, 2.4, 1.1, 0.6, 0, 7); c.fill();
    dot(c, x - 1, y - 6, 1.8, 'rgba(252,238,232,0.9)');
  }
  // a sewing button: round, rimmed, square or flower-shaped, two or four holes
  function button(c, x, y, rad, b) {
    const dk = U.shade(b.col, -0.3), lt = U.shade(b.col, 0.35);
    const shape = new Path2D();
    if (b.kind === 'flower') {
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2, px = x + Math.cos(a) * rad * 0.46, py = y + Math.sin(a) * rad * 0.46;
        shape.moveTo(px + rad * 0.54, py); shape.arc(px, py, rad * 0.54, 0, Math.PI * 2);
      }
    } else if (b.kind === 'square') shape.roundRect(x - rad * 0.88, y - rad * 0.88, rad * 1.76, rad * 1.76, rad * 0.32);
    else { shape.moveTo(x + rad, y); shape.arc(x, y, rad, 0, Math.PI * 2); }
    c.save(); c.translate(0.8, 1.4); c.fillStyle = 'rgba(40,25,15,0.28)'; c.fill(shape); c.restore();
    c.fillStyle = b.col; c.fill(shape);
    c.strokeStyle = dk; c.lineWidth = Math.max(0.6, rad * 0.1); c.stroke(shape);
    if (b.kind === 'rim') { c.strokeStyle = lt; c.lineWidth = rad * 0.16; c.beginPath(); c.arc(x, y, rad * 0.7, 0, 7); c.stroke(); }
    else if (b.kind === 'flower') dot(c, x, y, rad * 0.42, lt);
    else dot(c, x, y, rad * 0.58, U.shade(b.col, -0.1));
    const d = rad * 0.24, hr = Math.max(0.7, rad * 0.1);
    c.fillStyle = U.lum(b.col) < 0.3 ? '#9a96a0' : U.shade(b.col, -0.55);
    for (const [hx, hy] of b.holes === 2 ? [[-d, 0], [d, 0]] : [[-d, -d], [d, -d], [-d, d], [d, d]]) { c.beginPath(); c.arc(x + hx, y + hy, hr, 0, 7); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.ellipse(x - rad * 0.36, y - rad * 0.42, rad * 0.26, rad * 0.12, -0.6, 0, 7); c.fill();
  }
  const randomButton = (r) => ({ col: U.pick(r, BUTTON_COLS), holes: r() < 0.5 ? 2 : 4, kind: U.pick(r, ['round', 'round', 'rim', 'flower', 'square']) });
  // a short upright cylinder seen from a little above, by its bottom centre
  function cylPath(p, x, y, rx, ry, h) {
    p.moveTo(x + rx, y - h); p.ellipse(x, y - h, rx, ry, 0, 0, Math.PI * 2);
    p.rect(x - rx, y - h, rx * 2, h);
    p.moveTo(x + rx, y); p.ellipse(x, y, rx, ry, 0, 0, Math.PI);
  }
  function cylDraw(c, x, y, rx, ry, h, stops, top) {
    const side = new Path2D(); side.rect(x - rx, y - h, rx * 2, h); side.moveTo(x + rx, y); side.ellipse(x, y, rx, ry, 0, 0, Math.PI);
    c.fillStyle = lin(c, x - rx, 0, x + rx, 0, stops); c.fill(side);
    c.fillStyle = top; c.beginPath(); c.ellipse(x, y - h, rx, ry, 0, 0, 7); c.fill();
    c.strokeStyle = 'rgba(90,60,20,0.35)'; c.lineWidth = 0.8; c.stroke();
  }
  function cobweb(c, cx, cy, a0, len) {
    c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 0.7;
    for (let k = 0; k < 6; k++) { const a = a0 + (k / 5) * (Math.PI / 2); c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len); c.stroke(); }
    for (let ring = 12; ring < len; ring += 12) { c.beginPath(); for (let k = 0; k <= 5; k++) { const a = a0 + (k / 5) * (Math.PI / 2); c.lineTo(cx + Math.cos(a) * ring, cy + Math.sin(a) * ring); } c.stroke(); }
  }
  // snipped threads, curling where they fell
  function threads(c, r, x0, y0, x1, y1, n) {
    c.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      let x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), a = r() * 6.28;
      c.strokeStyle = U.pick(r, RIBBONS); c.lineWidth = 0.9 + r() * 0.5;
      c.beginPath(); c.moveTo(x, y);
      for (let k = 0; k < 7; k++) { a += (r() - 0.5) * 1.6; x += Math.cos(a) * 3.4; y += Math.sin(a) * 2.2; c.lineTo(x, y); }
      c.stroke();
    }
  }
  // dust as soft grey fluff, a fingerprint whorl
  function fluff(c, r, x, y, s, a = 0.7) {
    for (let k = 0; k < 10; k++) { const v = 186 + r() * 40; c.fillStyle = `rgba(${v},${v - 3},${v - 8},${a})`; c.beginPath(); c.arc(x + (r() - 0.5) * s, y + (r() - 0.5) * s * 0.6, s * 0.36, 0, 7); c.fill(); }
    c.strokeStyle = `rgba(236,232,224,${a * 0.8})`; c.lineWidth = 0.6;
    for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (r() - 0.5) * s * 2, y + (r() - 0.5) * s, x + (r() - 0.5) * s * 2.4, y + (r() - 0.5) * s * 1.4); c.stroke(); }
  }
  function fingerprint(c, x, y, s, a, col) {
    c.save(); c.translate(x, y); c.rotate(a); c.strokeStyle = col; c.lineWidth = 0.7;
    for (let k = 1; k <= 6; k++) { c.beginPath(); c.ellipse(0, 0, (s * 0.55 * k) / 6, (s * 0.75 * k) / 6, 0, 0.4, Math.PI * 2 - 0.2); c.stroke(); }
    c.restore();
  }
  function sparkle(c, x, y, s) {
    c.fillStyle = 'rgba(255,253,236,0.9)';
    c.beginPath(); c.moveTo(x, y - s); c.lineTo(x + s * 0.22, y - s * 0.22); c.lineTo(x + s, y); c.lineTo(x + s * 0.22, y + s * 0.22);
    c.lineTo(x, y + s); c.lineTo(x - s * 0.22, y + s * 0.22); c.lineTo(x - s, y); c.lineTo(x - s * 0.22, y - s * 0.22); c.closePath(); c.fill();
  }

  // a shelf of ribbon reels: flanged reels wound with ribbon, some striped or dotted
  function reelShelf(c, x0, x1, y) {
    c.fillStyle = 'rgba(60,35,25,0.18)'; c.fillRect(x0, y + 8, x1 - x0, 6);
    let k = 0;
    for (let x = Math.floor(x0 / 26) * 26 + 6; x < x1 - 4; x += 26, k++) {
      const col = RIBBONS[(k * 4 + 1) % RIBBONS.length], h = 24 + (k % 3) * 3;
      c.fillStyle = col; c.fillRect(x + 2, y - h + 3, 18, h - 6);
      c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(x + 4, y - h + 3, 4, h - 6);
      c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x + 16, y - h + 3, 4, h - 6);
      if (k % 3 === 1) { c.fillStyle = 'rgba(255,255,255,0.55)'; for (let yy = y - h + 6; yy < y - 4; yy += 5) c.fillRect(x + 2, yy, 18, 1.4); }
      if (k % 3 === 2) for (let yy = y - h + 7, j = 0; yy < y - 4; yy += 4.5, j++) dot(c, x + 7 + (j % 2) * 8, yy, 1.1, 'rgba(255,255,255,0.7)');
      c.fillStyle = '#efe4cf'; c.fillRect(x, y - h, 22, 3); c.fillRect(x, y - 3, 22, 3);
      c.fillStyle = 'rgba(80,60,40,0.28)'; c.fillRect(x, y - h + 2.4, 22, 0.8); c.fillRect(x, y - 0.8, 22, 0.8);
    }
    c.fillStyle = '#8a5d3b'; c.fillRect(x0, y, x1 - x0, 8);
    c.fillStyle = '#a7754e'; c.fillRect(x0, y, x1 - x0, 2);
  }
  // teal panelled wainscot under a cream dado rail
  function wainscot(c, nz, x0, y0, x1, y1) {
    c.fillStyle = '#f3e7d2'; c.fillRect(x0, y0 - 9, x1 - x0, 8);
    c.fillStyle = 'rgba(80,60,40,0.22)'; c.fillRect(x0, y0 - 1, x1 - x0, 2);
    const g = ramp(['#4f8c87', '#5a9893', '#64a29d']);
    field(c, x0, y0, x1, y1, 3, (x, y) => g(nz.fbm(x * 0.03 + 5, y * 0.004, 3)));
    for (let x = Math.floor(x0 / 72) * 72 + 8; x < x1; x += 72) {
      c.strokeStyle = 'rgba(30,60,58,0.45)'; c.lineWidth = 2; c.strokeRect(x, y0 + 10, 58, y1 - y0 - 20);
      c.strokeStyle = 'rgba(230,250,245,0.3)'; c.lineWidth = 1.2; c.strokeRect(x + 2.5, y0 + 12.5, 53, y1 - y0 - 25);
    }
  }
  // the counter's front: mahogany panels, gold letters and a brass kick rail
  function counterFront(c, nz, x0, y0, x1, y1) {
    const g = ramp(['#58301f', '#683925', '#78442c']);
    field(c, x0, y0, x1, y1, 3, (x, y) => g(nz.fbm(x * 0.012, y * 0.05 + 9, 3)));
    c.fillStyle = '#4a2818'; c.fillRect(x0, y0, x1 - x0, 12);
    c.fillStyle = 'rgba(255,220,180,0.25)'; c.fillRect(x0, y0, x1 - x0, 2);
    c.fillStyle = 'rgba(20,10,5,0.3)'; c.fillRect(x0, y0 + 12, x1 - x0, 4);
    c.save();
    c.font = 'bold 12px Georgia, "Times New Roman", serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = 'rgba(30,15,8,0.5)'; c.fillText('BUTTONS  ·  BEADS  ·  RIBBONS', 181, y0 + 35);
    c.fillStyle = lin(c, 0, y0 + 28, 0, y0 + 42, [[0, '#f8e39b'], [0.5, '#d9ad45'], [1, '#a77d2c']]); c.fillText('BUTTONS  ·  BEADS  ·  RIBBONS', 180, y0 + 34);
    c.restore();
    for (let x = Math.floor(x0 / 118) * 118 + 12; x < x1; x += 118) {
      c.strokeStyle = 'rgba(25,12,6,0.5)'; c.lineWidth = 3; c.strokeRect(x, y0 + 54, 100, 92);
      c.strokeStyle = 'rgba(255,220,180,0.14)'; c.lineWidth = 1.5; c.strokeRect(x + 3, y0 + 57, 94, 86);
    }
    c.fillStyle = lin(c, 0, y0 + 160, 0, y0 + 168, [[0, '#f2d27c'], [0.5, '#c99a3a'], [1, '#8a6a26']]); c.fillRect(x0, y0 + 160, x1 - x0, 8);
    c.fillStyle = '#3a1f12'; c.fillRect(x0, y0 + 168, x1 - x0, y1 - y0 - 168);
  }

  // ------------------------------------------------------------------ SCALES
  // The shop's big brass balance on the counter, face on: a fluted column on
  // a stepped foot, the beam with its pointer, two pans on chains (buttons in
  // one, a weight in the other) and a row of weights on a mahogany board.
  // Tarnish and dust to wipe off, and the counter top with it.
  function scales(S) {
    const { r, nz, bleed } = S;
    const CX = 180, BY = 176, CT0 = 418, CT1 = 446;
    const HOOKS = [64, 296], PANS = [{ x: 64, y: 340 }, { x: 296, y: 340 }], PRX = 56, PRY = 12, PD = 30;
    // the stepped foot, by bottom centre, largest first
    const STEPS = [{ y: 410, rx: 42, ry: 7, h: 8 }, { y: 402, rx: 30, ry: 5.5, h: 8 }, { y: 394, rx: 19, ry: 4, h: 7 }];
    const WEIGHTS = [{ x: 234, y: 411, w: 20, h: 26 }, { x: 254, y: 411, w: 15, h: 19 }, { x: 270, y: 411, w: 11, h: 14 }];
    const PANW = { x: 300, y: 342, w: 20, h: 22 };
    const BOARD = { x0: 88, x1: 282, y0: 404, y1: 414, y2: 426 };
    const colTop = BY + 18, colBot = STEPS[2].y - STEPS[2].h + 1;

    function weightPath(p, w) {
      const rx = w.w / 2, ry = rx * 0.32, ky = w.y - w.h - ry, kr = Math.max(3, rx * 0.36);
      cylPath(p, w.x, w.y, rx, ry, w.h);
      p.rect(w.x - 2, ky - 4, 4, 6);
      p.moveTo(w.x + kr, ky - 6); p.arc(w.x, ky - 6, kr, 0, Math.PI * 2);
    }
    const brass = new Path2D();
    for (const s of STEPS) cylPath(brass, CX, s.y, s.rx, s.ry, s.h);
    brass.rect(CX - 7, colTop, 14, colBot - colTop);
    brass.rect(CX - 12, 304, 24, 8); brass.rect(CX - 10, 250, 20, 6); brass.rect(CX - 14, BY + 8, 28, 10);
    // the beam, thicker at the pivot, with a ball at each end
    brass.moveTo(66, BY - 3.5); brass.lineTo(CX - 22, BY - 7); brass.lineTo(CX + 22, BY - 7); brass.lineTo(294, BY - 3.5);
    brass.lineTo(294, BY + 3.5); brass.lineTo(CX + 22, BY + 8); brass.lineTo(CX - 22, BY + 8); brass.lineTo(66, BY + 3.5); brass.closePath();
    for (const hx of HOOKS) { brass.moveTo(hx + 6.5, BY); brass.arc(hx, BY, 6.5, 0, Math.PI * 2); }
    brass.moveTo(CX + 12, BY); brass.arc(CX, BY, 12, 0, Math.PI * 2);
    // the finial: a spindle, an acorn, a bead
    brass.rect(CX - 3, BY - 24, 6, 14);
    brass.moveTo(CX + 6, BY - 30); brass.ellipse(CX, BY - 30, 6, 8, 0, 0, Math.PI * 2);
    brass.moveTo(CX + 3, BY - 40); brass.arc(CX, BY - 40, 3, 0, Math.PI * 2);
    brass.roundRect(CX - 22, BY + 34, 44, 16, 4);
    for (const q of PANS) {
      brass.moveTo(q.x + PRX, q.y); brass.ellipse(q.x, q.y, PRX, PRY, 0, 0, Math.PI * 2);
      brass.moveTo(q.x + PRX, q.y); brass.ellipse(q.x, q.y, PRX, PD, 0, 0, Math.PI);
    }
    weightPath(brass, PANW);
    for (const w of WEIGHTS) weightPath(brass, w);
    const wood = new Path2D();
    wood.rect(0, CT0, W, CT1 - CT0);
    wood.rect(BOARD.x0, BOARD.y0, BOARD.x1 - BOARD.x0, BOARD.y2 - BOARD.y0);
    const region = new Path2D(); region.addPath(brass); region.addPath(wood);

    // buttons lying in the left pan, laid out once
    const inPan = [];
    for (let i = 0; i < 18; i++) {
      const a = r() * 6.28, d = Math.sqrt(r()) * 0.86;
      inPan.push({ x: PANS[0].x + Math.cos(a) * (PRX - 9) * d, y: PANS[0].y + Math.sin(a) * (PRY - 3) * d, rad: 5.5 + r() * 2.5, b: randomButton(r) });
    }
    inPan.sort((a, b) => a.y - b.y);

    function counterTop(c, x0, x1) {
      const g = ramp(['#7a4630', '#8b5236', '#9c603f', '#ad6e49']);
      field(c, x0, CT0, x1, CT1, 2, (x, y) => g(nz.fbm(x * 0.004 + 2, y * 0.09, 4) * 0.8 + nz.n2(x * 0.3, y * 0.6) * 0.2));
      c.fillStyle = 'rgba(255,236,210,0.16)'; c.fillRect(x0, CT0 + 3, x1 - x0, 5);
      c.fillStyle = 'rgba(40,20,10,0.2)'; c.fillRect(x0, CT0, x1 - x0, 1.5);
    }
    function weightDraw(c, w) {
      const rx = w.w / 2, ry = rx * 0.32, ky = w.y - w.h - ry, kr = Math.max(3, rx * 0.36);
      cylDraw(c, w.x, w.y, rx, ry, w.h, BRASS, '#f0d27a');
      c.strokeStyle = 'rgba(120,85,25,0.45)'; c.lineWidth = 1; c.beginPath(); c.ellipse(w.x, w.y - w.h * 0.42, rx, ry, 0, 0.1, Math.PI - 0.1); c.stroke();
      c.fillStyle = lin(c, w.x - 2, 0, w.x + 2, 0, BRASS); c.fillRect(w.x - 2, ky - 4, 4, 6);
      const g = c.createRadialGradient(w.x - kr * 0.4, ky - 6 - kr * 0.4, 0.5, w.x, ky - 6, kr);
      g.addColorStop(0, '#fff2c0'); g.addColorStop(0.5, '#e2b851'); g.addColorStop(1, '#8a6a26');
      c.fillStyle = g; c.beginPath(); c.arc(w.x, ky - 6, kr, 0, 7); c.fill();
    }
    function ball(c, x, y, rad) {
      const g = c.createRadialGradient(x - rad * 0.4, y - rad * 0.4, 0.5, x, y, rad);
      g.addColorStop(0, '#fff2c0'); g.addColorStop(0.45, '#e2b851'); g.addColorStop(1, '#7a5a1e');
      c.fillStyle = g; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill();
    }
    function panDraw(c, q, inside) {
      const g = c.createRadialGradient(q.x - 16, q.y - 4, 3, q.x, q.y, PRX);
      g.addColorStop(0, '#f1d37e'); g.addColorStop(0.6, '#c49536'); g.addColorStop(1, '#8a6624');
      c.fillStyle = g; c.beginPath(); c.ellipse(q.x, q.y, PRX, PRY, 0, 0, 7); c.fill();
      inside(c, q);
      const front = new Path2D();
      front.moveTo(q.x + PRX, q.y); front.ellipse(q.x, q.y, PRX, PD, 0, 0, Math.PI); front.ellipse(q.x, q.y, PRX, PRY, 0, Math.PI, 0, true);
      c.fillStyle = lin(c, q.x - PRX, 0, q.x + PRX, 0, BRASS); c.fill(front);
      c.save(); c.clip(front);
      c.fillStyle = 'rgba(255,248,220,0.35)'; c.beginPath(); c.ellipse(q.x - PRX * 0.36, q.y + PD * 0.5, PRX * 0.2, PD * 0.3, -0.3, 0, 7); c.fill();
      c.strokeStyle = 'rgba(110,80,25,0.4)'; c.lineWidth = 1; c.beginPath(); c.ellipse(q.x, q.y + PD * 0.3, PRX * 0.93, PD * 0.55, 0, 0.12, Math.PI - 0.12); c.stroke();
      c.restore();
      c.strokeStyle = '#f3d98a'; c.lineWidth = 2.6; c.beginPath(); c.ellipse(q.x, q.y, PRX, PRY, 0, 0, 7); c.stroke();
      c.strokeStyle = 'rgba(120,85,25,0.6)'; c.lineWidth = 0.9; c.beginPath(); c.ellipse(q.x, q.y + 1.4, PRX, PRY, 0, 0.05, Math.PI - 0.05); c.stroke();
    }
    function chain(c, x0, y0, x1, y1) {
      const len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.floor(len / 4.2)), a = Math.atan2(y1 - y0, x1 - x0);
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        c.save(); c.translate(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t); c.rotate(a);
        if (i % 2) { c.fillStyle = '#9c7428'; c.fillRect(-2.6, -0.7, 5.2, 1.4); }
        else { c.strokeStyle = '#d0a446'; c.lineWidth = 1.1; c.beginPath(); c.ellipse(0, 0, 2.8, 1.6, 0, 0, 7); c.stroke(); }
        c.restore();
      }
    }
    // a tomato pincushion on the counter (its pins are drawn on top, in top())
    const PIN = { x: 34, y: 434 };
    function pincushion(c, x, y) {
      c.fillStyle = 'rgba(40,25,15,0.25)'; c.beginPath(); c.ellipse(x + 3, y + 8, 20, 4, 0, 0, 7); c.fill();
      c.fillStyle = '#c9474f'; c.beginPath(); c.ellipse(x, y, 19, 10, 0, 0, 7); c.fill();
      c.strokeStyle = '#9c3038'; c.lineWidth = 1;
      for (const k of [-11, -4, 4, 11]) { c.beginPath(); c.moveTo(x + k * 0.6, y - 9.5); c.quadraticCurveTo(x + k * 1.35, y, x + k * 0.6, y + 9.5); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.ellipse(x - 8, y - 4, 6, 2.6, -0.4, 0, 7); c.fill();
      c.fillStyle = '#5f8f4a';
      c.beginPath(); for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2, rr = k % 2 ? 2.4 : 6; c.lineTo(x + Math.cos(a) * rr, y - 9 + Math.sin(a) * rr * 0.45); } c.closePath(); c.fill();
      // the little strawberry on its thread
      c.strokeStyle = '#3f6a32'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x + 4, y - 9); c.quadraticCurveTo(x + 20, y - 7, x + 24, y + 1); c.stroke();
      c.fillStyle = '#d6404a'; c.beginPath(); c.moveTo(x + 24, y); c.quadraticCurveTo(x + 30, y + 2, x + 26, y + 9); c.quadraticCurveTo(x + 18, y + 4, x + 24, y); c.fill();
      for (const [dx, dy] of [[1, 3], [3, 5], [0, 6]]) dot(c, x + 24 + dx, y + dy, 0.5, '#f2d88a');
    }
    function pins(c, x, y) {
      for (const [dx, a, col] of [[-12, -0.5, '#3d5a86'], [-4, -0.15, '#e8c35a'], [5, 0.2, '#f1e6cf'], [12, 0.55, '#3f8f8a']]) {
        const tx = x + dx + Math.sin(a) * 16, ty = y - 6 - Math.cos(a) * 16;
        c.strokeStyle = '#c9ced4'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(x + dx * 0.7, y - 5); c.lineTo(tx, ty); c.stroke();
        dot(c, tx, ty, 2.2, col); dot(c, tx - 0.6, ty - 0.6, 0.7, 'rgba(255,255,255,0.8)');
      }
    }
    function scissors(c, x, y, a) {
      c.save(); c.translate(x, y); c.rotate(a);
      c.fillStyle = 'rgba(40,25,15,0.22)'; c.beginPath(); c.ellipse(4, 4, 24, 4, 0, 0, 7); c.fill();
      c.fillStyle = lin(c, 0, -3, 0, 3, STEEL);
      c.beginPath(); c.moveTo(-2, -2.2); c.lineTo(28, -0.6); c.lineTo(-2, 1.2); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(-2, -0.4); c.lineTo(26, 1.6); c.lineTo(-2, 2.8); c.closePath(); c.fill();
      dot(c, 0, 0.2, 1.6, '#8a6a26');
      c.strokeStyle = '#c99a3a'; c.lineWidth = 2.4;
      c.beginPath(); c.ellipse(-11, -5, 7, 4.4, 0.35, 0, 7); c.stroke();
      c.beginPath(); c.ellipse(-11, 6, 7, 4.4, -0.35, 0, 7); c.stroke();
      c.restore();
    }
    function tape(c, x0, y0, x1) {
      c.save(); c.lineCap = 'round';
      const path = new Path2D(); path.moveTo(x0, y0);
      for (let x = x0; x <= x1; x += 4) path.lineTo(x, y0 + Math.sin((x - x0) * 0.07) * 3 + (x - x0) * 0.04);
      c.strokeStyle = 'rgba(40,25,15,0.2)'; c.lineWidth = 6; c.translate(1, 1.5); c.stroke(path); c.translate(-1, -1.5);
      c.strokeStyle = '#ecc95e'; c.lineWidth = 5.4; c.stroke(path);
      c.strokeStyle = 'rgba(70,50,20,0.7)'; c.lineWidth = 2; c.setLineDash([0.8, 3.2]); c.stroke(path); c.setLineDash([]);
      c.restore();
      c.fillStyle = '#e9e2d3'; c.beginPath(); c.roundRect(x0 - 12, y0 - 6, 14, 12, 3); c.fill();
      c.fillStyle = '#c9474f'; c.fillRect(x0 - 8, y0 - 6, 6, 12);
    }

    return {
      family: 'wipe', particle: 'suds', region, fillRule: 'nonzero',
      tough: (x, y) => (nz.fbm(x * 0.06 + 31, y * 0.06, 4) > 0.6 ? 1.5 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        wallpaper(c, nz, x0, y0, x1, 300);
        wainscot(c, nz, x0, 309, x1, CT0);
        reelShelf(c, x0, x1, 104);
        counterTop(c, x0, x1);
        counterFront(c, nz, x0, CT1, x1, y1);
        softShadow(c, brass, 12, 0.3, 7, 8);
      },
      clean(c) {
        counterTop(c, 0, W);
        pincushion(c, PIN.x, PIN.y);
        tape(c, 300, 432, 352);
        scissors(c, 110, 436, -0.12);
        // the board under the scales
        const { x0, x1, y0, y1, y2 } = BOARD;
        c.fillStyle = lin(c, 0, y0, 0, y1, [[0, '#a5643f'], [1, '#86492d']]); c.fillRect(x0, y0, x1 - x0, y1 - y0);
        c.fillStyle = '#5a2f1d'; c.fillRect(x0, y1, x1 - x0, y2 - y1);
        c.fillStyle = 'rgba(255,230,200,0.18)'; for (let k = 0; k < 6; k++) c.fillRect(x0 + 6 + k * 31, y0 + 2 + (k % 3) * 2.4, 22, 0.8);
        c.fillStyle = '#d9ad45'; c.fillRect(x0, y1, x1 - x0, 1.6);
        for (const w of WEIGHTS) weightDraw(c, w);
        for (const s of STEPS) cylDraw(c, CX, s.y, s.rx, s.ry, s.h, BRASS, '#efcd72');
        // the fluted column, its collars and the capital
        c.fillStyle = lin(c, CX - 7, 0, CX + 7, 0, BRASS); c.fillRect(CX - 7, colTop, 14, colBot - colTop);
        c.strokeStyle = 'rgba(120,85,25,0.35)'; c.lineWidth = 0.8;
        for (const dx of [-3.5, 0, 3.5]) { c.beginPath(); c.moveTo(CX + dx, colTop + 4); c.lineTo(CX + dx, colBot - 3); c.stroke(); }
        for (const [y, w, h] of [[304, 24, 8], [250, 20, 6], [BY + 8, 28, 10]]) {
          c.fillStyle = lin(c, CX - w / 2, 0, CX + w / 2, 0, BRASS); c.beginPath(); c.roundRect(CX - w / 2, y, w, h, 2.5); c.fill();
          c.fillStyle = 'rgba(255,250,220,0.5)'; c.fillRect(CX - w / 2 + 2, y + 1, w - 4, 1.2);
        }
        // the pointer's little scale, cream enamel with ticks
        c.fillStyle = lin(c, CX - 22, 0, CX + 22, 0, BRASS); c.beginPath(); c.roundRect(CX - 22, BY + 34, 44, 16, 4); c.fill();
        c.fillStyle = '#f6efe0'; c.beginPath(); c.roundRect(CX - 19, BY + 36.5, 38, 11, 3); c.fill();
        c.strokeStyle = '#6b5a3e'; c.lineWidth = 0.8;
        for (let k = -4; k <= 4; k++) { c.beginPath(); c.moveTo(CX + k * 4, BY + 47); c.lineTo(CX + k * 4, BY + 47 - (k === 0 ? 7 : k % 2 ? 3 : 4.5)); c.stroke(); }
        c.strokeStyle = '#2f2a24'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(CX, BY + 8); c.lineTo(CX, BY + 45); c.stroke();
        c.fillStyle = '#2f2a24'; c.beginPath(); c.moveTo(CX - 2.4, BY + 40); c.lineTo(CX + 2.4, BY + 40); c.lineTo(CX, BY + 46); c.closePath(); c.fill();
        // the beam, its balls, the pivot and the finial
        const beam = new Path2D();
        beam.moveTo(66, BY - 3.5); beam.lineTo(CX - 22, BY - 7); beam.lineTo(CX + 22, BY - 7); beam.lineTo(294, BY - 3.5);
        beam.lineTo(294, BY + 3.5); beam.lineTo(CX + 22, BY + 8); beam.lineTo(CX - 22, BY + 8); beam.lineTo(66, BY + 3.5); beam.closePath();
        c.fillStyle = lin(c, 0, BY - 7, 0, BY + 8, [[0, '#fbeaa8'], [0.35, '#e6bd55'], [0.7, '#b98a2f'], [1, '#7a5a1e']]); c.fill(beam);
        c.strokeStyle = 'rgba(110,80,25,0.5)'; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(74, BY + 0.5); c.lineTo(CX - 26, BY + 0.5); c.moveTo(CX + 26, BY + 0.5); c.lineTo(286, BY + 0.5); c.stroke();
        for (const hx of HOOKS) ball(c, hx, BY, 6.5);
        c.fillStyle = lin(c, CX - 3, 0, CX + 3, 0, BRASS); c.fillRect(CX - 3, BY - 24, 6, 14);
        const ga = c.createRadialGradient(CX - 2.5, BY - 33, 0.5, CX, BY - 30, 8);
        ga.addColorStop(0, '#fff2c0'); ga.addColorStop(0.5, '#e2b851'); ga.addColorStop(1, '#8a6a26');
        c.fillStyle = ga; c.beginPath(); c.ellipse(CX, BY - 30, 6, 8, 0, 0, 7); c.fill();
        c.strokeStyle = 'rgba(120,85,25,0.5)'; c.lineWidth = 0.8; c.beginPath(); c.ellipse(CX, BY - 27, 5.6, 2, 0, 0, Math.PI); c.stroke();
        ball(c, CX, BY - 40, 3);
        ball(c, CX, BY, 12);
        dot(c, CX, BY, 3.4, '#6b4f1c'); dot(c, CX - 0.8, BY - 0.8, 1.2, '#f8e39b');
        // the pans: buttons heaped in one, a weight in the other
        panDraw(c, PANS[0], () => {
          c.save(); c.beginPath(); c.ellipse(PANS[0].x, PANS[0].y, PRX - 2, PRY - 1.5, 0, 0, 7); c.clip();
          for (const b of inPan) { c.save(); c.translate(b.x, b.y); c.scale(1, 0.5); button(c, 0, 0, b.rad, b.b); c.restore(); }
          c.restore();
        });
        panDraw(c, PANS[1], () => weightDraw(c, PANW));
      },
      cleanOver(c) {
        c.fillStyle = 'rgba(255,255,255,0.5)';
        c.fillRect(CX - 4.5, colTop + 14, 2, 70); c.fillRect(CX - 4.5, 318, 2, 60);
        for (const q of PANS) { c.beginPath(); c.ellipse(q.x - PRX * 0.5, q.y + PD * 0.55, 3, 8, -0.5, 0, 7); c.fill(); }
        c.fillRect(100, BY - 2.5, 50, 1.4); c.fillRect(214, BY - 2.5, 44, 1.4);
        sparkle(c, CX - 3, BY - 34, 5); sparkle(c, PANS[0].x - 40, PANS[0].y - 3, 4); sparkle(c, PANS[1].x + 36, PANS[1].y - 2, 4.5); sparkle(c, 236, 392, 3.5);
      },
      dirt(c) {
        // tarnish over all the brass: dull brown, green bloom in the hollows
        c.save(); c.clip(brass, 'nonzero');
        const g = ramp(['#4f4128', '#5e4e30', '#6f5e38', '#827045']);
        field(c, 0, BY - 50, W, BOARD.y2 + 4, 1.5, (x, y) => { const v = nz.fbm(x * 0.045, y * 0.045, 5); return [...g(v), 242]; });
        field(c, 0, BY - 50, W, BOARD.y2 + 4, 2, (x, y) => [92, 128, 104, Math.max(0, nz.fbm(x * 0.06 + 31, y * 0.06, 4) - 0.54) * 520]);
        // the shapes still show faintly through
        c.strokeStyle = 'rgba(40,30,14,0.4)'; c.lineWidth = 1;
        for (const q of PANS) { c.beginPath(); c.ellipse(q.x, q.y, PRX - 1, PRY - 1, 0, 0, 7); c.stroke(); c.beginPath(); c.ellipse(q.x, q.y, PRX - 1, PD - 1, 0, 0.1, Math.PI - 0.1); c.stroke(); }
        for (const s of STEPS) { c.beginPath(); c.ellipse(CX, s.y - s.h, s.rx, s.ry, 0, 0, 7); c.stroke(); }
        c.beginPath(); c.moveTo(70, BY + 0.5); c.lineTo(290, BY + 0.5); c.stroke();
        // dust lying in the pans and on the steps, dark blotches, fingerprints
        for (const q of PANS) { c.fillStyle = 'rgba(168,160,146,0.6)'; c.beginPath(); c.ellipse(q.x, q.y, PRX - 6, PRY - 3, 0, 0, 7); c.fill(); for (let k = 0; k < 4; k++) fluff(c, r, q.x + (r() - 0.5) * PRX * 1.4, q.y + (r() - 0.5) * 6, 5 + r() * 4, 0.55); }
        for (const s of STEPS) { c.fillStyle = 'rgba(168,160,146,0.55)'; c.beginPath(); c.ellipse(CX, s.y - s.h, s.rx - 2, s.ry - 1, 0, 0, 7); c.fill(); }
        for (let i = 0; i < 40; i++) {
          const x = 20 + r() * 320, y = BY - 40 + r() * 260;
          c.fillStyle = `rgba(32,24,12,${(0.12 + r() * 0.2).toFixed(2)})`; c.beginPath(); c.ellipse(x, y, 4 + r() * 10, 3 + r() * 6, r() * 3, 0, 7); c.fill();
        }
        for (const [x, y] of [[CX + 2, 280], [PANS[0].x + 26, PANS[0].y + 16], [PANS[1].x - 30, PANS[1].y + 14], [CX - 1, BY + 2], [234, 398]]) fingerprint(c, x, y, 9, r() * 3, 'rgba(30,22,10,0.4)');
        c.restore();
        // dust and loose threads on the counter and the board
        c.save(); c.clip(wood, 'nonzero');
        field(c, 0, CT0, W, CT1, 2, (x, y) => [168, 158, 142, 150 + nz.fbm(x * 0.03 + 9, y * 0.05, 4) * 90]);
        c.fillStyle = 'rgba(176,166,150,0.75)'; c.fillRect(BOARD.x0, BOARD.y0, BOARD.x1 - BOARD.x0, BOARD.y1 - BOARD.y0);
        c.fillStyle = 'rgba(140,130,116,0.55)'; c.fillRect(BOARD.x0, BOARD.y1, BOARD.x1 - BOARD.x0, BOARD.y2 - BOARD.y1);
        threads(c, r, 4, CT0 + 2, W - 4, CT1 - 2, 22);
        for (let i = 0; i < 5; i++) fluff(c, r, 10 + r() * 340, CT0 + 6 + r() * 20, 6 + r() * 5, 0.6);
        // a ring from a cup of tea and a few pins
        c.strokeStyle = 'rgba(96,58,30,0.45)'; c.lineWidth = 2; c.beginPath(); c.ellipse(70, CT0 + 14, 14, 5, 0, 0, 7); c.stroke();
        c.strokeStyle = 'rgba(210,214,220,0.9)'; c.lineWidth = 0.9;
        for (let i = 0; i < 6; i++) { const x = 140 + r() * 140, y = CT0 + 16 + r() * 10, a = r() * 6.28; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 3); c.stroke(); dot(c, x, y, 1.3, U.pick(r, RIBBONS)); }
        c.restore();
      },
      top(c) {
        pins(c, PIN.x, PIN.y);
        // the hooks and the chains the pans hang from
        c.lineCap = 'round';
        for (let k = 0; k < 2; k++) {
          const hx = HOOKS[k], q = PANS[k];
          c.strokeStyle = '#b98a2f'; c.lineWidth = 1.8;
          c.beginPath(); c.arc(hx, BY + 10, 3.4, -Math.PI / 2, Math.PI / 2, false); c.stroke();
          c.beginPath(); c.arc(hx, BY + 17, 3.4, -Math.PI / 2, Math.PI / 2, true); c.stroke();
          for (const [ex, ey] of [[q.x - PRX + 5, q.y - 1], [q.x, q.y - PRY + 1.5], [q.x + PRX - 5, q.y - 1]]) chain(c, hx, BY + 21, ex, ey);
        }
      },
    };
  }

  // ----------------------------------------------------------------- MACHINE
  // The old black sewing machine in the back room, face on, needle to the
  // left and the hand wheel to the right: gold scrolls on the japanned iron,
  // a spool of thread on top and a strip of rosebud cotton under the foot.
  // Fluff, dust and old oil to wipe off, and the table top with it.
  function machine(S) {
    const { r, nz, bleed } = S;
    const T0 = 398, T1 = 426;
    const BED = { x0: 40, x1: 320, y0: 360, top: 374, y1: 404 };
    const WHEEL = { x: 306, y: 226, r: 40 };
    const SPOOL = { x: 204, y: 194 };

    const iron = new Path2D();
    iron.moveTo(WHEEL.x + WHEEL.r, WHEEL.y); iron.arc(WHEEL.x, WHEEL.y, WHEEL.r, 0, Math.PI * 2);
    iron.moveTo(246, 206); iron.lineTo(292, 206); iron.lineTo(300, 362); iron.lineTo(238, 362); iron.closePath();
    iron.moveTo(98, 204); iron.quadraticCurveTo(196, 192, 294, 198); iron.lineTo(296, 250); iron.lineTo(244, 252); iron.quadraticCurveTo(170, 242, 104, 246); iron.closePath();
    iron.roundRect(44, 190, 68, 122, [16, 12, 6, 8]);
    iron.roundRect(BED.x0, BED.y0, BED.x1 - BED.x0, BED.y1 - BED.y0, [10, 10, 6, 6]);
    iron.rect(70, 306, 10, 46); iron.rect(86, 306, 7, 44); iron.roundRect(76, 346, 30, 12, 3);
    iron.rect(SPOOL.x - 2, SPOOL.y - 38, 4, 38); iron.roundRect(SPOOL.x - 13, SPOOL.y - 36, 26, 30, 3);
    const table = new Path2D(); table.rect(0, T0, W, T1 - T0);
    const region = new Path2D(); region.addPath(iron); region.addPath(table);
    // the strip of cotton under the presser foot, over the bed and onto the table
    const cloth = new Path2D();
    cloth.moveTo(58, 362); cloth.lineTo(126, 361); cloth.lineTo(128, BED.top); cloth.quadraticCurveTo(134, 390, 140, BED.y1);
    cloth.lineTo(150, 424); cloth.lineTo(44, 425); cloth.lineTo(50, BED.y1); cloth.quadraticCurveTo(52, 388, 54, BED.top); cloth.closePath();
    const clothDots = [];
    for (let y = 368; y < 424; y += 7) for (let x = 46 + ((y / 7) % 2) * 4; x < 152; x += 9) clothDots.push([x + (r() - 0.5) * 2, y + (r() - 0.5) * 2]);

    // gold leaf: a scroll of curls and leaves along a line
    function scroll(c, x0, x1, y, amp, dir = 1) {
      c.strokeStyle = '#d6b052'; c.lineWidth = 1.2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x0, y);
      for (let x = x0; x <= x1; x += 2) c.lineTo(x, y + Math.sin((x - x0) * 0.12) * amp * dir);
      c.stroke();
      for (let x = x0 + 13; x < x1 - 6; x += 26) {
        const yy = y + Math.sin((x - x0) * 0.12) * amp * dir, up = Math.cos((x - x0) * 0.12) > 0 ? -1 : 1;
        c.beginPath(); c.arc(x + 3, yy + up * 5, 4, 0, Math.PI * 1.6); c.stroke();
        c.fillStyle = '#e2bd5c'; c.beginPath(); c.ellipse(x - 4, yy - up * 4, 3.4, 1.4, up * 0.8, 0, 7); c.fill();
        dot(c, x + 8, yy + up * 1, 1.2, '#f2d27c');
      }
    }
    function medallion(c, x, y, rx, ry) {
      c.fillStyle = lin(c, x - rx, y - ry, x + rx, y + ry, [[0, '#f6dc8c'], [0.5, '#c99a3a'], [1, '#8a6a26']]);
      c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 7); c.fill();
      c.fillStyle = '#1a191e'; c.beginPath(); c.ellipse(x, y, rx - 2.4, ry - 2.4, 0, 0, 7); c.fill();
      // a little flower sewn in gold thread
      for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 - Math.PI / 2; c.fillStyle = '#e2bd5c'; c.beginPath(); c.ellipse(x + Math.cos(a) * ry * 0.32, y + Math.sin(a) * ry * 0.32, ry * 0.2, ry * 0.12, a, 0, 7); c.fill(); }
      dot(c, x, y, ry * 0.12, '#f6dc8c');
    }
    function tableTop(c, x0, x1) {
      const g = ramp(['#b07a4c', '#bf8857', '#cc9663', '#d6a370']);
      field(c, x0, T0, x1, T1, 2, (x, y) => g(nz.fbm(x * 0.005 + 4, y * 0.1, 4) * 0.8 + nz.n2(x * 0.4, y * 0.5) * 0.2));
      c.fillStyle = 'rgba(255,240,215,0.2)'; c.fillRect(x0, T0 + 4, x1 - x0, 4);
      c.fillStyle = 'rgba(60,30,10,0.22)'; c.fillRect(x0, T0, x1 - x0, 1.5);
    }

    return {
      family: 'wipe', particle: 'suds', region, fillRule: 'nonzero',
      tough: (x, y) => ((x > 56 && x < 130 && y > 300 && y < 380) || nz.fbm(x * 0.07 + 13, y * 0.07, 3) > 0.63 ? 1.5 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        // a soft sage wall, and a rack of thread cones on it
        const g = ramp(['#b6ccc6', '#c1d6d0', '#cbdfd9']);
        field(c, x0, y0, x1, 580, 4, (x, y) => g(nz.fbm(x * 0.01 + 6, y * 0.01, 3)));
        c.fillStyle = lin(c, 0, T1 + 40, 0, 580, [[0, 'rgba(40,50,48,0.45)'], [1, 'rgba(40,50,48,0.12)']]); c.fillRect(x0, T1 + 40, x1 - x0, 580 - T1 - 40);
        c.fillStyle = 'rgba(60,40,25,0.16)'; c.fillRect(36, 48, 292, 112);
        c.fillStyle = '#a77a52'; c.fillRect(32, 42, 292, 110);
        c.fillStyle = '#b98a5e'; c.fillRect(32, 42, 292, 4);
        let k = 0;
        for (let row = 0; row < 3; row++) {
          for (let x = 48 + (row % 2) * 12; x < 316; x += 24, k++) {
            const y = 76 + row * 34, col = RIBBONS[(k * 5 + row) % RIBBONS.length];
            c.fillStyle = 'rgba(40,25,15,0.25)'; c.fillRect(x + 2, y + 2, 2, 8);
            c.fillStyle = col; c.beginPath(); c.moveTo(x - 7, y + 4); c.lineTo(x + 7, y + 4); c.lineTo(x + 4, y - 22); c.lineTo(x - 4, y - 22); c.closePath(); c.fill();
            c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(x - 3.4, y - 21, 2.4, 24);
            c.fillStyle = 'rgba(0,0,0,0.12)'; for (let yy = y - 18; yy < y + 3; yy += 3) c.fillRect(x - 6, yy, 12, 0.6);
            c.fillStyle = '#efe4cf'; c.fillRect(x - 8, y + 3, 16, 3);
          }
        }
        // a pair of scissors on a nail
        c.save(); c.translate(20, 196); c.rotate(Math.PI / 2 - 0.08);
        c.fillStyle = lin(c, 0, -3, 0, 3, STEEL); c.beginPath(); c.moveTo(-2, -2.4); c.lineTo(40, -0.4); c.lineTo(-2, 2.4); c.closePath(); c.fill();
        c.strokeStyle = '#3a3a44'; c.lineWidth = 3; c.beginPath(); c.ellipse(-12, -5, 8, 5, 0.3, 0, 7); c.stroke(); c.beginPath(); c.ellipse(-12, 6, 8, 5, -0.3, 0, 7); c.stroke();
        c.restore(); dot(c, 20, 182, 2, '#6b6157');
        // the drive belt from the hand wheel down through the table
        c.strokeStyle = '#7a4a2a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(WHEEL.x + 12, WHEEL.y + 30); c.lineTo(WHEEL.x + 12, T0 + 2); c.stroke();
        tableTop(c, x0, x1);
        // the table's apron with its little drawer, the iron treadle stand below
        c.fillStyle = '#9a6a42'; c.fillRect(x0, T1, x1 - x0, 44);
        c.fillStyle = 'rgba(255,230,200,0.2)'; c.fillRect(x0, T1, x1 - x0, 2);
        c.strokeStyle = 'rgba(50,25,10,0.45)'; c.lineWidth = 1.6; c.strokeRect(130, T1 + 8, 100, 28);
        dot(c, 180, T1 + 22, 3.6, '#c99a3a'); dot(c, 179, T1 + 21, 1.2, '#f8e39b');
        c.fillStyle = 'rgba(30,15,5,0.3)'; c.fillRect(x0, T1 + 44, x1 - x0, 6);
        // the floor and the stand
        c.fillStyle = '#8a6448'; c.fillRect(x0, 572, x1 - x0, y1 - 572);
        for (let y = 572; y < y1; y += 13) { c.fillStyle = 'rgba(50,30,15,0.25)'; c.fillRect(x0, y, x1 - x0, 1.2); }
        c.strokeStyle = '#26252b'; c.lineCap = 'round';
        for (const fx of [62, 298]) {
          c.lineWidth = 7; c.beginPath(); c.moveTo(fx - 22, T1 + 50); c.lineTo(fx - 28, 574); c.moveTo(fx + 22, T1 + 50); c.lineTo(fx + 28, 574); c.stroke();
          c.lineWidth = 3;
          for (const s of [-1, 1]) { c.beginPath(); c.moveTo(fx, T1 + 60); c.bezierCurveTo(fx + s * 20, T1 + 76, fx + s * 4, T1 + 100, fx + s * 18, T1 + 112); c.stroke(); c.beginPath(); c.arc(fx + s * 12, T1 + 92, 5, 0, 7); c.stroke(); }
          c.lineWidth = 4; c.beginPath(); c.moveTo(fx - 26, 540); c.lineTo(fx + 26, 540); c.stroke();
        }
        c.lineWidth = 4; c.beginPath(); c.moveTo(84, 512); c.lineTo(276, 512); c.stroke();
        // the treadle plate and the big wheel that turns the belt
        c.fillStyle = '#2c2b31'; c.beginPath(); c.roundRect(120, 548, 120, 16, 4); c.fill();
        c.strokeStyle = '#4a4952'; c.lineWidth = 1.4; for (let x = 128; x < 236; x += 9) { c.beginPath(); c.moveTo(x, 551); c.lineTo(x + 5, 561); c.stroke(); }
        c.strokeStyle = '#26252b'; c.lineWidth = 5; c.beginPath(); c.arc(298, 506, 40, 0, 7); c.stroke();
        c.lineWidth = 3; for (let s = 0; s < 6; s++) { const a = (s / 6) * Math.PI * 2 + 0.3; c.beginPath(); c.moveTo(298, 506); c.lineTo(298 + Math.cos(a) * 38, 506 + Math.sin(a) * 38); c.stroke(); }
        dot(c, 298, 506, 6, '#3a3940');
        c.strokeStyle = '#7a4a2a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(WHEEL.x + 12, T1 + 44); c.lineTo(336, 506); c.stroke();
        softShadow(c, iron, 14, 0.4, 8, 8);
      },
      clean(c) {
        tableTop(c, 0, W);
        // a reel of thread and a thimble on the table
        c.fillStyle = 'rgba(40,25,15,0.25)'; c.beginPath(); c.ellipse(24, 420, 13, 3, 0, 0, 7); c.fill();
        c.fillStyle = '#3f8f8a'; c.fillRect(14, 404, 18, 14); c.fillStyle = '#efe4cf'; c.fillRect(12, 402, 22, 3); c.fillRect(12, 417, 22, 3);
        c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(16, 405, 4, 12);
        c.fillStyle = 'rgba(40,25,15,0.25)'; c.beginPath(); c.ellipse(342, 421, 10, 2.6, 0, 0, 7); c.fill();
        c.fillStyle = lin(c, 334, 0, 350, 0, STEEL); c.beginPath(); c.moveTo(335, 420); c.lineTo(337, 404); c.quadraticCurveTo(342, 398, 347, 404); c.lineTo(349, 420); c.closePath(); c.fill();
        c.fillStyle = 'rgba(80,90,100,0.5)'; for (let y = 406; y < 418; y += 3) for (let x = 338; x < 348; x += 3) dot(c, x + ((y / 3) % 2), y, 0.6, 'rgba(80,90,100,0.5)');
        // the hand wheel, behind the arm
        const wg = c.createRadialGradient(WHEEL.x - 12, WHEEL.y - 14, 4, WHEEL.x, WHEEL.y, WHEEL.r);
        wg.addColorStop(0, '#3e3d45'); wg.addColorStop(1, '#141318');
        c.fillStyle = wg; c.beginPath(); c.arc(WHEEL.x, WHEEL.y, WHEEL.r, 0, 7); c.fill();
        c.strokeStyle = lin(c, WHEEL.x - WHEEL.r, 0, WHEEL.x + WHEEL.r, 0, STEEL); c.lineWidth = 6; c.beginPath(); c.arc(WHEEL.x, WHEEL.y, WHEEL.r - 3, 0, 7); c.stroke();
        c.fillStyle = '#c1d6d0'; c.beginPath();
        for (let s = 0; s < 5; s++) { const a = (s / 5) * Math.PI * 2 + 0.2; c.moveTo(WHEEL.x + Math.cos(a + 0.3) * 30, WHEEL.y + Math.sin(a + 0.3) * 30); c.arc(WHEEL.x, WHEEL.y, 30, a + 0.3, a + 1.0); c.arc(WHEEL.x, WHEEL.y, 13, a + 1.0, a + 0.3, true); c.closePath(); }
        c.fill();
        c.strokeStyle = '#d6b052'; c.lineWidth = 1; c.beginPath(); c.arc(WHEEL.x, WHEEL.y, WHEEL.r - 8, 0, 7); c.stroke();
        dot(c, WHEEL.x, WHEEL.y, 9, '#2c2b31'); dot(c, WHEEL.x, WHEEL.y, 4, '#bfc6cc');
        // the pillar and the arm, glossy black with gold scrolls
        const pillar = new Path2D(); pillar.moveTo(246, 206); pillar.lineTo(292, 206); pillar.lineTo(300, 362); pillar.lineTo(238, 362); pillar.closePath();
        c.fillStyle = lin(c, 238, 0, 300, 0, IRON); c.fill(pillar);
        const arm = new Path2D(); arm.moveTo(98, 204); arm.quadraticCurveTo(196, 192, 294, 198); arm.lineTo(296, 250); arm.lineTo(244, 252); arm.quadraticCurveTo(170, 242, 104, 246); arm.closePath();
        c.fillStyle = lin(c, 0, 194, 0, 252, [[0, '#4a4952'], [0.18, '#2a2930'], [0.6, '#17161b'], [1, '#0e0d11']]); c.fill(arm);
        c.save(); c.clip(arm); scroll(c, 120, 286, 222, 6); scroll(c, 132, 276, 236, 3, -1); c.restore();
        c.save(); c.clip(pillar);
        c.strokeStyle = '#d6b052'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(269, 262); for (let y = 262; y < 350; y += 2) c.lineTo(269 + Math.sin(y * 0.14) * 7, y); c.stroke();
        for (let y = 270; y < 348; y += 16) { c.fillStyle = '#e2bd5c'; c.beginPath(); c.ellipse(269 + Math.sin(y * 0.14) * 7 + 5, y, 3.6, 1.5, 0.6, 0, 7); c.fill(); }
        c.restore();
        medallion(c, 268, 236, 13, 17);
        // the stitch lever on the pillar
        c.fillStyle = lin(c, 252, 0, 286, 0, STEEL); c.beginPath(); c.roundRect(252, 296, 32, 14, 4); c.fill();
        c.strokeStyle = '#5a6168'; c.lineWidth = 0.8; for (let x = 256; x < 282; x += 4) { c.beginPath(); c.moveTo(x, 298); c.lineTo(x, 302); c.stroke(); }
        c.fillStyle = '#2c2b31'; c.fillRect(270, 302, 3, 6); dot(c, 271.5, 302, 2.6, '#bfc6cc');
        // the head: black, a gold band, the silver needle bar below
        c.fillStyle = lin(c, 44, 0, 112, 0, IRON); c.beginPath(); c.roundRect(44, 190, 68, 122, [16, 12, 6, 8]); c.fill();
        c.fillStyle = lin(c, 48, 0, 70, 0, STEEL); c.beginPath(); c.roundRect(48, 214, 20, 86, 8); c.fill();
        c.strokeStyle = 'rgba(80,90,100,0.6)'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(58, 226); for (let y = 226; y < 290; y += 2) c.lineTo(58 + Math.sin(y * 0.3) * 4, y); c.stroke();
        c.strokeStyle = '#d6b052'; c.lineWidth = 1.4; c.beginPath(); c.roundRect(74, 202, 32, 98, 6); c.stroke();
        c.strokeStyle = '#d6b052'; c.lineWidth = 1.2; c.beginPath(); for (let y = 212; y < 292; y += 2) c.lineTo(90 + Math.sin(y * 0.16) * 6, y); c.stroke();
        for (let y = 218; y < 290; y += 14) { c.fillStyle = '#e2bd5c'; c.beginPath(); c.ellipse(90 + Math.sin(y * 0.16) * 6 + (y % 28 ? 5 : -5), y, 3.4, 1.4, y % 28 ? 0.6 : -0.6, 0, 7); c.fill(); }
        dot(c, 90, 212, 1.6, '#f2d27c');
        // the thread take-up lever peeping out of the head
        c.fillStyle = lin(c, 76, 0, 98, 0, STEEL); c.beginPath(); c.roundRect(82, 194, 16, 7, 3); c.fill();
        c.fillStyle = lin(c, 70, 0, 80, 0, STEEL); c.fillRect(70, 306, 10, 44);
        c.fillStyle = lin(c, 86, 0, 93, 0, STEEL); c.fillRect(86, 306, 7, 42);
        // the bed: a glossy top with gold lines, the needle plate and the slide
        const bed = new Path2D(); bed.roundRect(BED.x0, BED.y0, BED.x1 - BED.x0, BED.y1 - BED.y0, [10, 10, 6, 6]);
        c.fillStyle = lin(c, 0, BED.y0, 0, BED.y1, [[0, '#3c3b43'], [0.3, '#1d1c22'], [0.32, '#121115'], [1, '#0c0b0f']]); c.fill(bed);
        c.strokeStyle = '#d6b052'; c.lineWidth = 1; c.beginPath(); c.roundRect(BED.x0 + 6, BED.y0 + 3, BED.x1 - BED.x0 - 12, BED.top - BED.y0 - 5, 6); c.stroke();
        c.beginPath(); c.roundRect(BED.x0 + 8, BED.top + 6, BED.x1 - BED.x0 - 16, BED.y1 - BED.top - 12, 4); c.stroke();
        c.save(); c.beginPath(); c.rect(BED.x0 + 10, BED.top + 7, BED.x1 - BED.x0 - 20, BED.y1 - BED.top - 14); c.clip();
        scroll(c, 160, 236, BED.top + 15, 3); c.restore();
        medallion(c, 200, BED.top + 15, 12, 8);
        c.fillStyle = lin(c, 62, 0, 120, 0, STEEL); c.beginPath(); c.roundRect(62, BED.y0 + 2, 56, 10, 2); c.fill();
        c.fillStyle = '#3a3a44'; for (let k = 0; k < 3; k++) c.fillRect(70 + k * 4, BED.y0 + 5, 2, 5);
        c.fillStyle = lin(c, 124, 0, 172, 0, STEEL); c.beginPath(); c.roundRect(124, BED.y0 + 3, 48, 9, 2); c.fill();
        c.strokeStyle = 'rgba(80,90,100,0.6)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(148, BED.y0 + 4); c.lineTo(148, BED.y0 + 11); c.stroke();
        // the strip of rosebud cotton under the foot, a fresh seam down it
        c.fillStyle = '#efb4ae'; c.fill(cloth);
        c.save(); c.clip(cloth);
        for (const [x, y] of clothDots) { dot(c, x, y, 1.7, '#d9817a'); dot(c, x + 1.6, y - 1.2, 1.1, '#fff6ef'); c.fillStyle = '#8fb08a'; c.beginPath(); c.ellipse(x - 2.2, y + 1, 1.5, 0.7, 0.5, 0, 7); c.fill(); }
        c.fillStyle = 'rgba(80,40,30,0.12)'; c.fillRect(40, BED.top, 120, 3);
        c.restore();
        c.strokeStyle = 'rgba(140,70,60,0.35)'; c.lineWidth = 1; c.stroke(cloth);
        c.strokeStyle = '#c9474f'; c.lineWidth = 1.4; c.setLineDash([4, 3]);
        c.beginPath(); c.moveTo(78, 364); c.lineTo(80, BED.top); c.quadraticCurveTo(86, 392, 92, 424); c.stroke(); c.setLineDash([]);
        c.fillStyle = lin(c, 76, 0, 106, 0, STEEL); c.beginPath(); c.roundRect(76, 348, 30, 10, 3); c.fill();
        c.strokeStyle = '#7c838a'; c.lineWidth = 0.8; for (let x = 80; x < 104; x += 4) { c.beginPath(); c.moveTo(x, 351); c.lineTo(x, 356); c.stroke(); }
        c.strokeStyle = '#d0d6db'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(75, 350); c.lineTo(75, 364); c.stroke();
        // the spool of thread on its pin, and the thread down to the needle
        c.fillStyle = lin(c, SPOOL.x - 2, 0, SPOOL.x + 2, 0, STEEL); c.fillRect(SPOOL.x - 2, SPOOL.y - 38, 4, 40);
        c.fillStyle = '#c9474f'; c.fillRect(SPOOL.x - 11, SPOOL.y - 32, 22, 22);
        c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(SPOOL.x - 8, SPOOL.y - 32, 4, 22);
        c.fillStyle = 'rgba(0,0,0,0.15)'; for (let y = SPOOL.y - 30; y < SPOOL.y - 10; y += 2.4) c.fillRect(SPOOL.x - 11, y, 22, 0.6);
        c.fillStyle = '#e9dcc4'; c.fillRect(SPOOL.x - 13, SPOOL.y - 36, 26, 4); c.fillRect(SPOOL.x - 13, SPOOL.y - 10, 26, 4);
        c.strokeStyle = '#c9474f'; c.lineWidth = 0.9;
        c.beginPath(); c.moveTo(SPOOL.x - 11, SPOOL.y - 20); c.lineTo(114, 200); c.lineTo(90, 197); c.lineTo(78, 222); c.lineTo(76, 352); c.stroke();
      },
      cleanOver(c) {
        // the japanning gleams
        c.fillStyle = 'rgba(255,255,255,0.22)';
        c.beginPath(); c.ellipse(190, 201, 70, 2.6, -0.02, 0, 7); c.fill();
        c.fillRect(52, 196, 3, 90); c.fillRect(244, 216, 3, 120);
        c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.ellipse(180, BED.y0 + 4, 110, 1.6, 0, 0, 7); c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 2; c.beginPath(); c.arc(WHEEL.x, WHEEL.y, WHEEL.r - 3, -2.6, -1.6); c.stroke();
        sparkle(c, 58, 220, 4); sparkle(c, 268, 226, 4); sparkle(c, 96, 364, 3.5); sparkle(c, WHEEL.x + 26, WHEEL.y - 26, 4);
      },
      dirt(c) {
        // grey dust over the black iron, the gold showing faintly through
        c.save(); c.clip(iron, 'nonzero');
        const g = ramp(['#6c675f', '#7b766c', '#8a8479', '#999387']);
        field(c, 30, 150, 350, BED.y1 + 2, 1.5, (x, y) => { const v = nz.fbm(x * 0.04, y * 0.04, 5); return [...g(v), 232]; });
        c.strokeStyle = 'rgba(200,170,90,0.22)'; c.lineWidth = 1.2;
        c.beginPath(); for (let x = 120; x < 286; x += 2) c.lineTo(x, 222 + Math.sin((x - 120) * 0.12) * 6); c.stroke();
        c.beginPath(); c.roundRect(BED.x0 + 6, BED.y0 + 3, BED.x1 - BED.x0 - 12, BED.top - BED.y0 - 5, 6); c.stroke();
        c.strokeStyle = 'rgba(40,36,30,0.35)'; c.lineWidth = 1.2;
        c.beginPath(); c.arc(WHEEL.x, WHEEL.y, WHEEL.r - 3, 0, 7); c.stroke();
        c.beginPath(); c.moveTo(BED.x0, BED.top); c.lineTo(BED.x1, BED.top); c.stroke();
        // fluff round the needle and the plates, a few long fibres
        for (let i = 0; i < 26; i++) fluff(c, r, 60 + r() * 120, BED.y0 + 2 + r() * 12, 6 + r() * 6, 0.75);
        for (let i = 0; i < 14; i++) fluff(c, r, 66 + r() * 44, 310 + r() * 44, 5 + r() * 5, 0.7);
        for (let i = 0; i < 18; i++) fluff(c, r, 50 + r() * 260, 196 + r() * 170, 4 + r() * 6, 0.5);
        // old oil, dark and glossy, by the needle bar and under the wheel
        for (let i = 0; i < 8; i++) {
          const near = i < 4, x = near ? 64 + r() * 44 : 246 + r() * 60, y = near ? 300 + r() * 50 : 262 + r() * 96, a = (r() - 0.5) * 1.2;
          for (let k = 0; k < 5; k++) {
            c.fillStyle = `rgba(42,30,14,${(0.22 + r() * 0.2).toFixed(2)})`;
            c.beginPath(); c.ellipse(x + Math.cos(a) * k * 4, y + Math.sin(a) * k * 4 + k * 2, 7 - k * 0.8, 3 + r() * 2, a, 0, 7); c.fill();
          }
          c.strokeStyle = 'rgba(255,240,200,0.2)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 3, y - 2); c.lineTo(x + 6, y - 1); c.stroke();
        }
        // a cobweb in the spokes of the wheel
        c.save(); c.beginPath(); c.arc(WHEEL.x, WHEEL.y, WHEEL.r - 6, 0, 7); c.clip();
        c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 0.7;
        for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2; c.beginPath(); c.moveTo(WHEEL.x, WHEEL.y); c.lineTo(WHEEL.x + Math.cos(a) * 40, WHEEL.y + Math.sin(a) * 40); c.stroke(); }
        for (let ring = 8; ring < 36; ring += 6) { c.beginPath(); for (let k = 0; k <= 9; k++) { const a = (k / 9) * Math.PI * 2; c.lineTo(WHEEL.x + Math.cos(a) * ring, WHEEL.y + Math.sin(a) * ring); } c.stroke(); }
        c.restore();
        threads(c, r, BED.x0 + 6, BED.y0, BED.x1 - 6, BED.y1, 18);
        c.restore();
        // the table: dust, snipped threads, pins and a few sequins
        c.save(); c.clip(table);
        field(c, 0, T0, W, T1, 2, (x, y) => [170, 160, 146, 150 + nz.fbm(x * 0.03 + 4, y * 0.06, 4) * 95]);
        threads(c, r, 4, T0 + 2, W - 4, T1 - 2, 26);
        for (let i = 0; i < 6; i++) fluff(c, r, 10 + r() * 340, T0 + 6 + r() * 20, 6 + r() * 5, 0.6);
        c.strokeStyle = 'rgba(210,214,220,0.9)'; c.lineWidth = 0.9;
        for (let i = 0; i < 7; i++) { const x = 30 + r() * 300, y = T0 + 8 + r() * 16, a = r() * 6.28; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 3); c.stroke(); dot(c, x, y, 1.3, U.pick(r, RIBBONS)); }
        for (let i = 0; i < 12; i++) { const x = 20 + r() * 320, y = T0 + 6 + r() * 18; dot(c, x, y, 1.8, U.pick(r, ['#e8c35a', '#a6d3d4', '#efb4ae', '#c9ced4'])); dot(c, x - 0.5, y - 0.5, 0.6, 'rgba(255,255,255,0.9)'); }
        c.restore();
      },
    };
  }

  // ----------------------------------------------------------------- DRAWERS
  // The wall of little button drawers behind the counter, face on: a teal
  // cabinet of thirty-five drawers, each with a brass label frame, the button
  // that lives inside sewn to its front and a brass knob. Thick with dust.
  function drawers(S) {
    const { r, nz, bleed } = S;
    const X0 = 16, X1 = 344, Y0 = 70, Y1 = 568;
    const GX0 = 26, GX1 = 334, GY0 = 102, GY1 = 538;
    const COLS = 5, ROWS = 7, CW = (GX1 - GX0) / COLS, CH = (GY1 - GY0) / ROWS;
    const region = new Path2D(); region.rect(X0, Y0, X1 - X0, Y1 - Y0);
    // every drawer's front, label and button, laid out once
    const fronts = [];
    for (let j = 0; j < ROWS; j++) {
      for (let i = 0; i < COLS; i++) {
        const x = GX0 + i * CW + 3, y = GY0 + j * CH + 3;
        fronts.push({ x, y, w: CW - 6, h: CH - 6, cx: x + (CW - 6) / 2, n: j * COLS + i + 1, b: { col: BUTTON_COLS[(j * 3 + i * 7 + ((r() * 3) | 0)) % BUTTON_COLS.length], holes: r() < 0.5 ? 2 : 4, kind: U.pick(r, ['round', 'round', 'rim', 'flower', 'square']) } });
      }
    }
    const fallen = [{ x: 74, y: 553, b: randomButton(r) }, { x: 236, y: 556, b: randomButton(r) }, { x: 252, y: 551, b: randomButton(r) }];

    function knob(c, x, y) {
      c.fillStyle = 'rgba(30,50,48,0.35)'; c.beginPath(); c.ellipse(x + 1.2, y + 2.4, 5, 3, 0, 0, 7); c.fill();
      const g = c.createRadialGradient(x - 1.6, y - 1.8, 0.4, x, y, 5);
      g.addColorStop(0, '#fff2c0'); g.addColorStop(0.45, '#e2b851'); g.addColorStop(1, '#7a5a1e');
      c.fillStyle = g; c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill();
    }
    function labelFrame(c, f) {
      const x = f.cx - 17, y = f.y + 6;
      c.fillStyle = lin(c, x, 0, x + 34, 0, BRASS); c.beginPath(); c.roundRect(x, y, 34, 16, 2.5); c.fill();
      c.fillStyle = '#fbf3e2'; c.fillRect(x + 3, y + 3, 28, 10);
      c.fillStyle = 'rgba(120,85,25,0.6)'; dot(c, x + 1.6, y + 8, 0.9, '#8a6a26'); dot(c, x + 32.4, y + 8, 0.9, '#8a6a26');
      c.fillStyle = '#5b5148'; c.font = 'italic 700 8px Georgia, "Times New Roman", serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(`No ${f.n}`, f.cx, y + 8.4);
    }

    return {
      family: 'dust', particle: 'dust', region,
      tough: (x, y) => (x < X0 + 14 || x > X1 - 14 || y < Y0 + 30 || y > Y1 - 26 ? 1.5 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        wallpaper(c, nz, x0, y0, x1, 560);
        // the floorboards the cabinet stands on
        const g = ramp(['#8d6446', '#9b7051', '#a77c5c']);
        field(c, x0, 556, x1, y1, 3, (x, y) => g(nz.fbm(x * 0.006, y * 0.1 + 3, 3)));
        for (let y = 556; y < y1; y += 14) { c.fillStyle = 'rgba(50,30,15,0.28)'; c.fillRect(x0, y, x1 - x0, 1.4); }
        c.fillStyle = '#efe4cf'; c.fillRect(x0, 548, x1 - x0, 8); c.fillStyle = 'rgba(60,40,25,0.2)'; c.fillRect(x0, 555, x1 - x0, 2);
        // a little painted board hanging over the cabinet
        c.strokeStyle = '#8a7a62'; c.lineWidth = 1; c.beginPath(); c.moveTo(146, 26); c.lineTo(180, 4); c.lineTo(214, 26); c.stroke();
        dot(c, 180, 4, 2, '#6b6157');
        c.fillStyle = 'rgba(60,40,25,0.2)'; c.beginPath(); c.roundRect(124, 28, 116, 30, 5); c.fill();
        c.fillStyle = '#f3e7d2'; c.beginPath(); c.roundRect(122, 25, 116, 30, 5); c.fill();
        c.strokeStyle = '#3f8f8a'; c.lineWidth = 1.6; c.beginPath(); c.roundRect(126, 29, 108, 22, 3); c.stroke();
        c.fillStyle = '#3f8f8a'; c.font = 'bold 14px Georgia, "Times New Roman", serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BUTTONS', 180, 40.5);
        button(c, 134, 40, 4.4, { col: '#c9474f', holes: 4, kind: 'round' }); button(c, 226, 40, 4.4, { col: '#e8c35a', holes: 2, kind: 'round' });
        // two jars of buttons on top of the cabinet
        for (const [jx, seed] of [[46, 1], [312, 2]]) {
          c.fillStyle = 'rgba(40,25,15,0.2)'; c.beginPath(); c.ellipse(jx + 2, Y0, 18, 3, 0, 0, 7); c.fill();
          for (let k = 0; k < 14; k++) { const bx = jx - 12 + ((k * 7 + seed * 3) % 24), by = Y0 - 5 - ((k * 5) % 22); button(c, bx, by, 4, { col: BUTTON_COLS[(k * 3 + seed) % BUTTON_COLS.length], holes: k % 2 ? 2 : 4, kind: 'round' }); }
          c.fillStyle = 'rgba(220,240,245,0.28)'; c.beginPath(); c.roundRect(jx - 16, Y0 - 34, 32, 34, 5); c.fill();
          c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1.2; c.stroke();
          c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(jx - 12, Y0 - 30, 3, 26);
          c.fillStyle = lin(c, jx - 14, 0, jx + 14, 0, BRASS); c.beginPath(); c.roundRect(jx - 14, Y0 - 40, 28, 7, 2); c.fill();
        }
        const p = new Path2D(); p.rect(X0, Y0, X1 - X0, Y1 - Y0); softShadow(c, p, 14, 0.4, 5, 6);
      },
      clean(c) {
        // the painted carcass
        const g = ramp(['#4a8580', '#54918b', '#5e9c96']);
        field(c, X0, Y0, X1, Y1, 2, (x, y) => g(nz.fbm(x * 0.05 + 2, y * 0.006, 3) * 0.7 + nz.n2(x * 0.3, y * 0.02) * 0.3));
        // the cornice and the plinth
        c.fillStyle = '#3f736e'; c.fillRect(X0, Y0, X1 - X0, 8);
        c.fillStyle = lin(c, 0, Y0 + 8, 0, Y0 + 26, [[0, '#6aa7a1'], [0.5, '#4f8a85'], [1, '#3a6a66']]); c.fillRect(X0, Y0 + 8, X1 - X0, 18);
        c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(X0, Y0 + 8, X1 - X0, 2);
        c.fillStyle = lin(c, 0, GY1 + 2, 0, Y1, [[0, '#3f736e'], [1, '#2f5a56']]); c.fillRect(X0, GY1 + 2, X1 - X0, Y1 - GY1 - 2);
        c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(X0, GY1 + 2, X1 - X0, 2);
        c.fillStyle = 'rgba(20,40,38,0.35)'; c.fillRect(X0 + 10, Y1 - 6, X1 - X0 - 20, 6);
        // the drawers: a raised front each, a label, its button, a knob
        for (const f of fronts) {
          c.fillStyle = 'rgba(20,40,38,0.45)'; c.fillRect(f.x - 1.5, f.y - 1.5, f.w + 3, f.h + 3);
          c.fillStyle = U.shade('#5e9c96', (nz.n2(f.x * 0.05, f.y * 0.05) - 0.5) * 0.12); c.fillRect(f.x, f.y, f.w, f.h);
          c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(f.x, f.y, f.w, 2); c.fillRect(f.x, f.y, 2, f.h);
          c.fillStyle = 'rgba(15,35,33,0.25)'; c.fillRect(f.x, f.y + f.h - 2, f.w, 2); c.fillRect(f.x + f.w - 2, f.y, 2, f.h);
          labelFrame(c, f);
          button(c, f.cx, f.y + 33, 8, f.b);
          knob(c, f.cx, f.y + f.h - 9);
        }
        for (const b of fallen) { c.save(); c.translate(b.x, b.y); c.scale(1, 0.5); button(c, 0, 0, 5.5, b.b); c.restore(); }
      },
      cleanOver(c) {
        c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(X0 + 4, Y0 + 30, 4, Y1 - Y0 - 60);
        for (const k of [3, 11, 17, 26, 32]) { const f = fronts[k]; sparkle(c, f.cx + 2, f.y + 30, 3.5); }
      },
      liveTop(c, t) {
        // a slant of light from the shop window, dust drifting in it
        c.save();
        c.globalCompositeOperation = 'lighter';
        const g = c.createLinearGradient(40, 60, 260, 540);
        g.addColorStop(0, 'rgba(255,240,200,0.17)'); g.addColorStop(1, 'rgba(255,240,200,0)');
        c.fillStyle = g; c.beginPath(); c.moveTo(-10, 80); c.lineTo(90, 60); c.lineTo(320, 560); c.lineTo(170, 560); c.closePath(); c.fill();
        for (let i = 0; i < 22; i++) {
          const ph = i * 1.9, x = 60 + ((i * 41) % 140) + Math.sin(t * 0.3 + ph) * 10 + ((t * 4 + i * 11) % 50);
          const y = 110 + ((i * 61 + t * 6) % 400);
          c.fillStyle = `rgba(255,248,220,${0.22 + 0.22 * Math.sin(t + ph)})`; c.beginPath(); c.arc(x, y, 1.2, 0, 7); c.fill();
        }
        c.restore();
      },
      dirt(c) {
        const g = ramp(['#a39a8e', '#b2aa9e', '#c1bab0', '#ccc6bc']);
        field(c, X0, Y0, X1, Y1, 2, (x, y) => { const v = nz.fbm(x * 0.03, y * 0.03, 5); return [...g(v), 247]; });
        // the drawers still show faintly through: their edges, labels and knobs
        c.strokeStyle = 'rgba(112,104,94,0.38)'; c.lineWidth = 1.2;
        for (const f of fronts) {
          c.strokeRect(f.x, f.y, f.w, f.h);
          c.fillStyle = 'rgba(150,128,84,0.22)'; c.fillRect(f.cx - 17, f.y + 6, 34, 16);
          c.fillStyle = 'rgba(120,112,100,0.35)'; c.beginPath(); c.arc(f.cx, f.y + f.h - 9, 5, 0, 7); c.fill();
          c.fillStyle = 'rgba(216,210,200,0.7)'; c.beginPath(); c.ellipse(f.cx, f.y + f.h - 13, 4.4, 1.6, 0, 0, 7); c.fill();
        }
        // dust lies thickest along the ledges, the cornice and the plinth
        for (let j = 0; j <= ROWS; j++) { c.fillStyle = 'rgba(214,208,198,0.55)'; c.fillRect(X0, GY0 + j * CH - 2, X1 - X0, 4); }
        c.fillStyle = 'rgba(210,204,194,0.6)'; c.fillRect(X0, Y0, X1 - X0, 10); c.fillRect(X0, GY1 + 2, X1 - X0, 6);
        for (let i = 0; i < 26; i++) {
          const x = X0 + 10 + r() * (X1 - X0 - 20), y = U.pick(r, [GY0 - 2, GY1 + 6, Y1 - 10, GY0 + ((r() * ROWS) | 0) * CH]);
          fluff(c, r, x, y, 6 + r() * 8, 0.75);
        }
        // where a finger opened a drawer the dust is thinner
        c.save(); c.globalCompositeOperation = 'destination-out';
        for (const k of [7, 19, 28]) { const f = fronts[k]; for (let n = 0; n < 3; n++) { c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.ellipse(f.cx - 4 + n * 4, f.y + f.h - 12 + n, 3.6, 5.4, 0.2, 0, 7); c.fill(); } }
        c.restore();
        // cobwebs in the top corners and between two knobs
        cobweb(c, X0, Y0, 0, 74); cobweb(c, X1, Y0, Math.PI / 2, 62);
        const a = fronts[22], b = fronts[23];
        c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 0.7;
        for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(a.cx + 4, a.y + a.h - 9 - k * 1.5); c.quadraticCurveTo((a.cx + b.cx) / 2, a.y + a.h - 2 + k, b.cx - 4, b.y + b.h - 9 - k * 1.2); c.stroke(); }
        threads(c, r, X0 + 8, Y0 + 30, X1 - 8, Y1 - 10, 8);
      },
    };
  }

  SCENES.VARIANTS.push(
    { kind: 'counter', test: (o) => o.what === 'scales', make: scales },
    { kind: 'counter', test: (o) => o.what === 'machine', make: machine },
    { kind: 'attic', test: (o) => o.where === 'beads', make: drawers },
  );
})();
