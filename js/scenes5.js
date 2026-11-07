'use strict';
// Café scenes: the dusty floor, the striped awning, the name board over the
// door, the bistro tables and the old espresso machine on the counter. Same
// layers as every other scene (see scenes.js). Needs scenes2.js first.

(() => {
  const { W, H, field, ramp, softShadow, paintStamp, peelingPaint, grime, barnBricks, weatherboards, limewash, ashlar, decoRender } = SCENES;

  // ------------------------------------------------------------ shared bits
  function glow(c, x, y, rad, col) {
    const g = c.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,214,140,0)');
    c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }

  // brick wall in running bond, every brick a slightly different red
  function bricks(c, r, nz, x0, y0, x1, y1, bw = 30, bh = 12) {
    c.fillStyle = '#d3c3a8'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    const cols = ['#b5644a', '#a85a42', '#c06d50', '#9c5240', '#b86a4e', '#ad6650'];
    for (let row = 0, y = y0; y < y1; y += bh, row++) {
      for (let x = x0 - (row % 2 ? bw / 2 : 0); x < x1; x += bw) {
        c.fillStyle = U.shade(U.pick(r, cols), (nz.n2(x * 0.03, y * 0.03) - 0.5) * 0.3);
        c.fillRect(x + 1, y + 1, bw - 2, bh - 2);
        c.fillStyle = 'rgba(255,225,190,0.12)'; c.fillRect(x + 1, y + 1, bw - 2, 2);
        c.fillStyle = 'rgba(60,25,15,0.15)'; c.fillRect(x + 1, y + bh - 3, bw - 2, 2);
      }
    }
    // a little soot so it does not look brand new
    field(c, x0, y0, x1, y1, 4, (x, y) => [70, 50, 40, Math.max(0, nz.fbm(x * 0.015 + 40, y * 0.015, 3) - 0.42) * 170]);
  }

  // checked tiles laid on the diagonal; the shade of each tile comes from its
  // position, so the same floor painted twice lines up exactly
  const TILE_A = '#efe5cf', TILE_B = '#2e6a5a';
  function checker(c, nz, x0, y0, x1, y1, a, b, s = 34) {
    c.save();
    c.beginPath(); c.rect(x0, y0, x1 - x0, y1 - y0); c.clip();
    c.fillStyle = '#d4c7ad'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    c.translate(W / 2, H / 2); c.rotate(Math.PI / 4);
    const n = Math.ceil(Math.hypot(W, H) / s / 2) + 3;
    for (let j = -n; j <= n; j++) for (let i = -n; i <= n; i++) {
      c.fillStyle = U.shade((i + j) & 1 ? a : b, (nz.n2(i * 0.9 + 20, j * 0.9) - 0.5) * 0.14);
      c.fillRect(i * s + 0.9, j * s + 0.9, s - 1.8, s - 1.8);
    }
    c.restore();
  }

  function deadLeaf(c, r, x, y, s) {
    c.save(); c.translate(x, y); c.rotate(r() * 6.28);
    c.fillStyle = U.pick(r, ['#b5762f', '#9c5a2a', '#c98c3a', '#8c5a2b', '#d0903e']);
    c.beginPath(); c.moveTo(-s, 0); c.quadraticCurveTo(0, -s * 0.65, s, 0); c.quadraticCurveTo(0, s * 0.65, -s, 0); c.fill();
    c.strokeStyle = 'rgba(70,40,15,0.5)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(-s, 0); c.lineTo(s, 0); c.stroke();
    c.restore();
  }
  function paperScrap(c, r, x, y, s) {
    c.save(); c.translate(x, y); c.rotate(r() * 6.28);
    c.fillStyle = U.pick(r, ['#f4f1ea', '#ebe6da', '#f7efe0']);
    c.beginPath();
    for (let k = 0; k < 9; k++) { const a = (k / 9) * 6.283, rr = s * (0.6 + r() * 0.5); c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    c.closePath(); c.fill();
    c.strokeStyle = 'rgba(120,110,95,0.5)'; c.lineWidth = 0.7;
    for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo((r() - 0.5) * s, (r() - 0.5) * s); c.lineTo((r() - 0.5) * s, (r() - 0.5) * s); c.stroke(); }
    c.restore();
  }
  function cobweb(c, cx, cy, a0, len) {
    c.strokeStyle = 'rgba(255,255,255,0.65)'; c.lineWidth = 0.7;
    for (let k = 0; k < 6; k++) { const a = a0 + (k / 5) * (Math.PI / 2); c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len); c.stroke(); }
    for (let ring = 12; ring < len; ring += 12) {
      c.beginPath();
      for (let k = 0; k <= 5; k++) { const a = a0 + (k / 5) * (Math.PI / 2), rr = ring + (k % 2) * 2; c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
      c.stroke();
    }
  }
  function dropping(c, r, x, y, s) {
    c.fillStyle = 'rgba(245,243,235,0.95)';
    c.beginPath();
    for (let k = 0; k < 10; k++) { const a = (k / 10) * 6.283, rr = s * (0.5 + r() * 0.6); c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(120,115,105,0.7)'; c.beginPath(); c.arc(x + (r() - 0.5) * s * 0.4, y + (r() - 0.5) * s * 0.4, s * 0.3, 0, 7); c.fill();
    c.strokeStyle = 'rgba(245,243,235,0.9)'; c.lineWidth = s * 0.3; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y + s * 0.5); c.lineTo(x + (r() - 0.5) * 2, y + s * (1.5 + r() * 1.5)); c.stroke();
  }

  // ------------------------------------------------------- OTHER FLOORS
  // The same job somewhere else: looking down at the pottery's workshop floor
  // (terracotta quarry tiles under clay dust, the wheel and the clay bin
  // standing on it), the station's waiting room (old floorboards under
  // dust, the stove, a hat box, a milk churn and a mat by the door), the
  // haberdashery (honey boards, threads and snippets, a dress form, a basket
  // of wool, bolts of cloth), the curiosity shop (dark creaky boards, a
  // worn rug, a floor globe, a leather armchair, a sea chest) or the painter's
  // loft (pale scrubbed boards under dried paint, the easel, a stool, a tray of
  // tins, a jar of brushes).
  function otherFloor(S, where) {
    const { r, nz, bleed } = S;
    const pottery = where === 'pottery', beads = where === 'beads', curio = where === 'curio', loft = where === 'loft';
    const top = 92, bot = 584;
    const things = pottery
      ? [{ x: 112, y: 262, r: 50, kind: 'wheel' }, { x: 200, y: 330, r: 17, kind: 'stool' }, { x: 286, y: 432, r: 30, kind: 'bin' }, { x: 262, y: 196, r: 19, kind: 'bucket' }, { x: 74, y: 474, r: 24, kind: 'sack' }]
      : beads ? [{ x: 88, y: 230, r: 34, kind: 'form' }, { x: 276, y: 290, r: 30, kind: 'woolbasket' }, { x: 176, y: 400, r: 16, kind: 'stool' }, { x: 290, y: 488, r: 27, kind: 'bolts' }, { x: 64, y: 452, r: 21, kind: 'buttontin' }]
      : loft ? [{ x: 100, y: 226, r: 2, kind: 'easel' }, { x: 276, y: 196, r: 18, kind: 'stool' }, { x: 278, y: 434, r: 33, kind: 'tins' }, { x: 74, y: 488, r: 22, kind: 'brushjar' }]
      : curio ? [{ x: 74, y: 204, r: 30, kind: 'floorglobe' }, { x: 290, y: 226, r: 38, kind: 'armchair' }, { x: 66, y: 494, r: 20, kind: 'brolly' }, { x: 294, y: 488, r: 28, kind: 'chest' }]
      : [{ x: 276, y: 214, r: 36, kind: 'stove' }, { x: 60, y: 196, r: 27, kind: 'palm' }, { x: 116, y: 410, r: 23, kind: 'hatbox' }, { x: 298, y: 462, r: 21, kind: 'churn' }];
    const mat = pottery || beads || curio || loft ? null : [112, 516, 136, 56];
    // the curiosity shop's worn rug in the middle of the floor
    const RUG = [96, 262, 168, 196];
    function rug(c, dull) {
      const [x, y, w, h] = RUG, col = (v) => (dull ? U.mix(v, '#7d7466', 0.55) : v);
      c.fillStyle = 'rgba(30,18,10,0.3)'; c.fillRect(x + 3, y + 4, w, h);
      c.fillStyle = col('#7d2a34'); c.fillRect(x, y, w, h);
      c.fillStyle = col('#2b3a5a'); c.fillRect(x + 8, y + 8, w - 16, h - 16);
      c.fillStyle = col('#8e3440'); c.fillRect(x + 18, y + 18, w - 36, h - 36);
      c.strokeStyle = col('#e9d9b0'); c.lineWidth = 1.4; c.beginPath();
      for (let t = 0; t <= 24; t++) { const xx = x + 10 + ((w - 20) * t) / 24; c.lineTo(xx, y + 12 + (t % 2) * 4); }
      c.moveTo(x + 10, y + h - 12); for (let t = 0; t <= 24; t++) { const xx = x + 10 + ((w - 20) * t) / 24; c.lineTo(xx, y + h - 12 - (t % 2) * 4); }
      c.stroke();
      const mx = x + w / 2, my = y + h / 2;
      c.fillStyle = col('#c9a24a'); c.beginPath(); c.moveTo(mx, my - 46); c.lineTo(mx + 34, my); c.lineTo(mx, my + 46); c.lineTo(mx - 34, my); c.closePath(); c.fill();
      c.fillStyle = col('#2f5546'); c.beginPath(); c.moveTo(mx, my - 30); c.lineTo(mx + 22, my); c.lineTo(mx, my + 30); c.lineTo(mx - 22, my); c.closePath(); c.fill();
      c.fillStyle = col('#e9d9b0'); c.beginPath(); c.arc(mx, my, 6, 0, 7); c.fill();
      for (const [dx, dy] of [[-48, -58], [48, -58], [-48, 58], [48, 58]]) { c.fillStyle = col('#c9a24a'); c.beginPath(); c.arc(mx + dx, my + dy, 7, 0, 7); c.fill(); c.fillStyle = col('#2f5546'); c.beginPath(); c.arc(mx + dx, my + dy, 3.4, 0, 7); c.fill(); }
      // worn pale where feet have crossed it, and a fringe at both ends
      const g = c.createRadialGradient(mx, my + 20, 4, mx, my + 20, 80); g.addColorStop(0, 'rgba(235,220,200,0.28)'); g.addColorStop(1, 'rgba(235,220,200,0)');
      c.fillStyle = g; c.fillRect(x, y, w, h);
      c.strokeStyle = col('#e9d9b0'); c.lineWidth = 1.2;
      for (let xx = x + 2; xx < x + w; xx += 4) { c.beginPath(); c.moveTo(xx, y); c.lineTo(xx + (r() - 0.5) * 2, y - 7); c.moveTo(xx, y + h); c.lineTo(xx + (r() - 0.5) * 2, y + h + 7); c.stroke(); }
    }
    const region = new Path2D();
    region.rect(0, top, W, bot - top);
    for (const t of things) { region.moveTo(t.x + t.r, t.y); region.arc(t.x, t.y, t.r, 0, Math.PI * 2); }
    if (mat) region.rect(...mat);
    const shadowOf = (c, x, y, rad) => { c.fillStyle = 'rgba(40,28,18,0.25)'; c.beginPath(); c.arc(x + 4, y + 5, rad, 0, 7); c.fill(); };
    // the floor itself, crisp or dull
    function floor(c, x0, y0, x1, y1, dull) {
      c.save(); c.beginPath(); c.rect(x0, y0, x1 - x0, y1 - y0); c.clip();
      if (pottery) {
        const s = 40;
        c.fillStyle = dull ? '#a99c8a' : '#d9c9b0'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
        for (let j = Math.floor((y0 - top) / s) - 1; top + j * s < y1; j++) for (let i = Math.floor(x0 / s) - 1; i * s < x1; i++) {
          const v = nz.n2(i * 0.9 + 3, j * 0.9);
          c.fillStyle = U.shade(dull ? '#9d7a64' : U.pick(() => v, ['#c87a52', '#bd6f48', '#d08a5e', '#c27450']), (v - 0.5) * 0.18);
          c.fillRect(i * s + 1.5, top + j * s + 1.5, s - 3, s - 3);
          if (!dull) { c.fillStyle = 'rgba(255,235,210,0.14)'; c.fillRect(i * s + 2, top + j * s + 2, s - 4, 3); }
        }
      } else {
        // floorboards: honey at the haberdashery, dark and old at the curiosity shop
        const bw = beads ? 22 : curio ? 30 : loft ? 36 : 26, crisp = beads ? '#cfa56c' : curio ? '#7a5236' : loft ? '#dcc9a6' : '#b88a5c', dim = beads ? '#9c8366' : curio ? '#5e4c3e' : loft ? '#a2957f' : '#8c7a64';
        for (let i = Math.floor(x0 / bw) - 1; i * bw < x1; i++) {
          const v = nz.n2(i * 1.7, 4);
          c.fillStyle = U.shade(dull ? dim : crisp, (v - 0.5) * 0.22);
          c.fillRect(i * bw, y0, bw, y1 - y0);
          c.fillStyle = dull ? 'rgba(40,30,20,0.4)' : 'rgba(70,40,20,0.45)'; c.fillRect(i * bw, y0, 1.6, y1 - y0);
          c.fillStyle = 'rgba(255,230,190,0.1)'; c.fillRect(i * bw + 1.6, y0, 1.2, y1 - y0);
          // board ends, staggered
          for (let y = top + ((i * 97) % 160); y < y1; y += 210) { c.fillStyle = 'rgba(60,35,18,0.4)'; c.fillRect(i * bw, y, bw, 1.4); c.fillStyle = '#3a2a1e'; c.beginPath(); c.arc(i * bw + 6, y + 6, 1.3, 0, 7); c.arc(i * bw + bw - 6, y + 6, 1.3, 0, 7); c.fill(); }
        }
        for (let k = 0; k < 140; k++) { c.strokeStyle = 'rgba(70,45,25,0.18)'; c.lineWidth = 0.8; const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0); c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 2, y + 14 + r() * 40); c.stroke(); }
        if (curio) rug(c, dull);
      }
      c.restore();
    }
    function thing(c, t) {
      const { x, y } = t;
      shadowOf(c, x, y, t.r + 2);
      if (t.kind === 'wheel') {
        c.fillStyle = '#b9c0c4'; c.beginPath(); c.arc(x, y, t.r, 0, 7); c.fill();
        c.fillStyle = '#d5dbde'; c.beginPath(); c.arc(x, y, t.r - 6, 0, 7); c.fill();
        c.fillStyle = '#8d969e'; c.beginPath(); c.arc(x, y, 28, 0, 7); c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 1; for (const rr of [10, 18, 24]) { c.beginPath(); c.arc(x, y, rr, 0, 7); c.stroke(); }
        c.fillStyle = '#b9805e'; c.beginPath(); c.arc(x, y, 12, 0, 7); c.fill();
        c.fillStyle = '#9c6a4c'; c.beginPath(); c.arc(x, y, 7, 0, 7); c.fill();
        c.fillStyle = '#6f8f6a'; c.beginPath(); c.roundRect(x + t.r - 8, y - 9, 22, 18, 4); c.fill();
      } else if (t.kind === 'stool') {
        c.fillStyle = '#8a5a3c'; c.beginPath(); c.arc(x, y, t.r, 0, 7); c.fill();
        c.fillStyle = '#a77b56'; c.beginPath(); c.arc(x, y, t.r - 3, 0, 7); c.fill();
        c.strokeStyle = 'rgba(70,40,20,0.35)'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, t.r - 8, 0, 7); c.stroke();
      } else if (t.kind === 'bin') {
        c.fillStyle = '#7d8a6e'; c.beginPath(); c.arc(x, y, t.r, 0, 7); c.fill();
        c.fillStyle = '#93a084'; c.beginPath(); c.arc(x, y, t.r - 4, 0, 7); c.fill();
        c.fillStyle = '#5f6b52'; c.beginPath(); c.roundRect(x - 10, y - 4, 20, 8, 4); c.fill();
      } else if (t.kind === 'bucket') {
        c.fillStyle = '#9aa3ad'; c.beginPath(); c.arc(x, y, t.r, 0, 7); c.fill();
        c.fillStyle = '#b7a58f'; c.beginPath(); c.arc(x, y, t.r - 4, 0, 7); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.ellipse(x - 4, y - 4, 6, 3, -0.6, 0, 7); c.fill();
        c.fillStyle = '#f2d88a'; c.beginPath(); c.roundRect(x - 2, y - 2, 12, 9, 3); c.fill();
      } else if (t.kind === 'sack') {
        c.fillStyle = '#c9b28a'; c.beginPath(); c.ellipse(x, y, t.r, t.r * 0.85, 0.3, 0, 7); c.fill();
        c.strokeStyle = 'rgba(110,85,50,0.5)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x - 10, y - 8); c.quadraticCurveTo(x, y, x + 12, y + 6); c.stroke();
        c.fillStyle = '#8a6a46'; c.beginPath(); c.arc(x - 14, y - 12, 5, 0, 7); c.fill();
      } else if (t.kind === 'stove') {
        c.fillStyle = '#26262b'; c.beginPath(); c.arc(x, y, t.r, 0, 7); c.fill();
        c.fillStyle = '#3a3a40'; c.beginPath(); c.arc(x, y, t.r - 6, 0, 7); c.fill();
        c.fillStyle = '#ff9a48'; c.beginPath(); c.arc(x, y, 12, 0, 7); c.fill();
        c.fillStyle = '#ffd890'; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill();
        c.strokeStyle = '#26262b'; c.lineWidth = 2.4; for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(x + k * 6, y - 12); c.lineTo(x + k * 6, y + 12); c.stroke(); }
        glow(c, x, y, 70, 'rgba(255,170,90,0.22)');
      } else if (t.kind === 'palm') {
        c.fillStyle = '#b5652f'; c.beginPath(); c.arc(x, y, t.r, 0, 7); c.fill();
        c.fillStyle = '#4a3324'; c.beginPath(); c.arc(x, y, t.r - 5, 0, 7); c.fill();
        for (let k = 0; k < 9; k++) {
          const a = (k / 9) * 6.283 + 0.2, len = 30 + (k % 3) * 8;
          c.save(); c.translate(x, y); c.rotate(a);
          c.fillStyle = U.pick(r, ['#3f7a3a', '#4f8a3c', '#5d9644']);
          c.beginPath(); c.ellipse(len * 0.55, 0, len * 0.55, 6, 0, 0, 7); c.fill();
          c.restore();
        }
      } else if (t.kind === 'hatbox') {
        c.fillStyle = '#efb4ae'; c.beginPath(); c.arc(x, y, t.r, 0, 7); c.fill();
        c.strokeStyle = '#f7f3ea'; c.lineWidth = 3; for (let k = 0; k < 12; k++) { const a = (k / 12) * 6.283; c.beginPath(); c.moveTo(x + Math.cos(a) * (t.r - 7), y + Math.sin(a) * (t.r - 7)); c.lineTo(x + Math.cos(a) * (t.r - 1), y + Math.sin(a) * (t.r - 1)); c.stroke(); }
        c.fillStyle = '#c9474f'; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill();
      } else if (t.kind === 'form') {
        // a dress form from above: its round shoulders, the neck knob, a tape measure draped over
        c.fillStyle = '#5b3a26'; c.beginPath(); c.arc(x, y, t.r * 0.95, 0, 7); c.fill();
        c.fillStyle = '#e8dcc6'; c.beginPath(); c.ellipse(x, y, t.r, t.r * 0.62, 0, 0, 7); c.fill();
        c.fillStyle = '#e9a39b'; c.beginPath(); c.ellipse(x, y + 3, t.r * 0.86, t.r * 0.45, 0, 0, Math.PI); c.fill();
        c.fillStyle = '#c9b89c'; c.beginPath(); c.arc(x, y - 2, 9, 0, 7); c.fill();
        c.strokeStyle = '#f2d88a'; c.lineWidth = 5; c.beginPath(); c.moveTo(x - t.r * 0.7, y + 10); c.quadraticCurveTo(x - 10, y - 18, x + 4, y - 12); c.quadraticCurveTo(x + 18, y - 6, x + t.r * 0.8, y + 14); c.stroke();
        for (let k = 0; k < 5; k++) { c.fillStyle = U.pick(r, ['#3d5a86', '#e2574c', '#f2d88a']); c.beginPath(); c.arc(x - 18 + k * 9, y + 14 + (k % 2) * 3, 1.8, 0, 7); c.fill(); }
      } else if (t.kind === 'woolbasket') {
        c.fillStyle = '#9a6b45'; c.beginPath(); c.arc(x, y, t.r, 0, 7); c.fill();
        c.strokeStyle = 'rgba(60,35,20,0.45)'; c.lineWidth = 1; for (let k = 0; k < 18; k++) { const a = (k / 18) * 6.283; c.beginPath(); c.arc(x + Math.cos(a) * (t.r - 3), y + Math.sin(a) * (t.r - 3), 3, 0, 7); c.stroke(); }
        c.fillStyle = '#6b4a32'; c.beginPath(); c.arc(x, y, t.r - 6, 0, 7); c.fill();
        for (const [dx, dy, br, col] of [[-9, -7, 11, '#bba9df'], [9, -5, 10, '#9cc5a1'], [-4, 10, 10, '#efb4ae'], [12, 12, 8, '#f2d88a']]) {
          c.fillStyle = col; c.beginPath(); c.arc(x + dx, y + dy, br, 0, 7); c.fill();
          c.strokeStyle = U.shade(col, -0.25); c.lineWidth = 0.9; for (let l = -1; l <= 1; l++) { c.beginPath(); c.arc(x + dx + l * 2, y + dy, br * 0.65, 3.4, 5.8); c.stroke(); }
        }
        c.strokeStyle = '#c9a24a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 24, y - 20); c.lineTo(x + 18, y + 24); c.moveTo(x + 22, y - 22); c.lineTo(x - 14, y + 22); c.stroke();
      } else if (t.kind === 'bolts') {
        // bolts of cloth standing on end in a round basket
        c.fillStyle = '#b98f5a'; c.beginPath(); c.arc(x, y, t.r, 0, 7); c.fill();
        for (const [dx, dy, col] of [[-10, -9, '#3d5a86'], [10, -10, '#efb4ae'], [-11, 10, '#9cc5a1'], [10, 10, '#f2d88a'], [0, 0, '#e2574c']]) {
          c.fillStyle = col; c.beginPath(); c.arc(x + dx, y + dy, 9.5, 0, 7); c.fill();
          c.strokeStyle = U.shade(col, -0.3); c.lineWidth = 0.8; c.beginPath(); c.arc(x + dx, y + dy, 6, 0, 5.5); c.stroke();
          c.fillStyle = '#e8dcc6'; c.beginPath(); c.arc(x + dx, y + dy, 2.4, 0, 7); c.fill();
        }
      } else if (t.kind === 'buttontin') {
        c.fillStyle = '#4b8682'; c.beginPath(); c.arc(x, y, t.r, 0, 7); c.fill();
        c.fillStyle = '#6aa7a3'; c.beginPath(); c.arc(x, y, t.r - 3, 0, 7); c.fill();
        for (let k = 0; k < 22; k++) {
          const a = r() * 6.283, d = Math.sqrt(r()) * (t.r - 7), bc = U.pick(r, ['#e2574c', '#f2d88a', '#3d5a86', '#efb4ae', '#f4ecdc', '#bba9df']);
          c.fillStyle = bc; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 3.4, 0, 7); c.fill();
          c.fillStyle = U.shade(bc, -0.4); c.beginPath(); c.arc(x + Math.cos(a) * d - 0.8, y + Math.sin(a) * d, 0.6, 0, 7); c.arc(x + Math.cos(a) * d + 0.8, y + Math.sin(a) * d, 0.6, 0, 7); c.fill();
        }
      } else if (t.kind === 'floorglobe') {
        // a globe on a floor stand, from above: the wooden horizon ring round the world
        c.fillStyle = '#6b452c'; c.beginPath(); c.arc(x, y, t.r, 0, 7); c.fill();
        c.strokeStyle = '#c9a24a'; c.lineWidth = 1; for (let k = 0; k < 24; k++) { const a = (k / 24) * 6.283; c.beginPath(); c.moveTo(x + Math.cos(a) * (t.r - 2), y + Math.sin(a) * (t.r - 2)); c.lineTo(x + Math.cos(a) * (t.r - 5), y + Math.sin(a) * (t.r - 5)); c.stroke(); }
        c.fillStyle = '#8fbfe6'; c.beginPath(); c.arc(x, y, t.r - 7, 0, 7); c.fill();
        c.fillStyle = '#c9b48f'; c.beginPath(); c.moveTo(x - 12, y - 10); c.quadraticCurveTo(x + 2, y - 18, x + 6, y - 4); c.quadraticCurveTo(x - 4, y + 8, x - 12, y + 2); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(x + 6, y + 6); c.quadraticCurveTo(x + 16, y + 2, x + 16, y + 12); c.quadraticCurveTo(x + 8, y + 18, x + 6, y + 12); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.ellipse(x - 7, y - 8, 7, 4, -0.6, 0, 7); c.fill();
      } else if (t.kind === 'armchair') {
        // a buttoned leather wing chair from above, its back to the wall
        c.fillStyle = '#5e1f27'; c.beginPath(); c.roundRect(x - 27, y - 27, 54, 54, 11); c.fill();
        c.fillStyle = '#7d2a34'; c.beginPath(); c.roundRect(x - 19, y - 12, 38, 36, 7); c.fill();
        c.fillStyle = '#6b2430'; c.fillRect(x - 27, y - 27, 54, 13);
        c.fillStyle = 'rgba(255,220,210,0.18)'; c.fillRect(x - 17, y - 10, 34, 3);
        for (const [dx, dy] of [[-9, 0], [9, 0], [0, 10], [-9, 18], [9, 18]]) { c.fillStyle = '#4a1820'; c.beginPath(); c.arc(x + dx, y + dy, 1.6, 0, 7); c.fill(); }
      } else if (t.kind === 'brolly') {
        c.fillStyle = '#9a7a2e'; c.beginPath(); c.arc(x, y, t.r, 0, 7); c.fill();
        c.fillStyle = '#c9a24a'; c.beginPath(); c.arc(x, y, t.r - 3, 0, 7); c.fill();
        c.fillStyle = '#3a2a20'; c.beginPath(); c.arc(x, y, t.r - 7, 0, 7); c.fill();
        c.strokeStyle = '#2b2b30'; c.lineWidth = 3.4; c.lineCap = 'round'; c.beginPath(); c.arc(x - 4, y - 2, 6, Math.PI, 0); c.stroke();
        c.strokeStyle = '#8a5a3c'; c.beginPath(); c.arc(x + 6, y + 3, 5, Math.PI * 1.2, Math.PI * 0.2); c.stroke();
      } else if (t.kind === 'chest') {
        c.fillStyle = '#6b452c'; c.beginPath(); c.roundRect(x - 23, y - 17, 46, 34, 4); c.fill();
        c.fillStyle = '#7d5434'; c.beginPath(); c.roundRect(x - 20, y - 14, 40, 28, 3); c.fill();
        c.fillStyle = '#3a3438'; for (const dx of [-12, 12]) c.fillRect(x + dx - 2, y - 17, 4, 34);
        c.fillStyle = '#c9a24a'; c.fillRect(x - 4, y + 10, 8, 7); c.fillStyle = '#5a4520'; c.fillRect(x - 1, y + 12, 2, 3);
      } else if (t.kind === 'easel') {
        // an easel from above: its three feet spread, the canvas edge on along the ledge
        c.strokeStyle = 'rgba(40,28,18,0.22)'; c.lineWidth = 8; c.lineCap = 'round';
        c.beginPath(); c.moveTo(x + 3, y + 9); c.lineTo(x - 31, y + 36); c.moveTo(x + 3, y + 9); c.lineTo(x + 37, y + 36); c.moveTo(x + 3, y + 9); c.lineTo(x + 3, y - 32); c.stroke();
        c.strokeStyle = '#8a5f3c'; c.lineWidth = 7;
        c.beginPath(); c.moveTo(x, y + 6); c.lineTo(x - 34, y + 32); c.moveTo(x, y + 6); c.lineTo(x + 34, y + 32); c.moveTo(x, y + 6); c.lineTo(x, y - 36); c.stroke();
        c.fillStyle = '#a77b56'; c.beginPath(); c.roundRect(x - 44, y - 3, 88, 13, 3); c.fill();
        c.fillStyle = '#f4efe2'; c.fillRect(x - 40, y - 1, 80, 6);
        c.fillStyle = '#2f5fa8'; c.fillRect(x - 40, y + 1, 80, 2.4);
        c.fillStyle = 'rgba(255,230,190,0.3)'; c.fillRect(x - 44, y + 7, 88, 1.6);
      } else if (t.kind === 'tins') {
        // a tray of open paint tins, a stick across the cobalt
        c.fillStyle = '#8a5a3c'; c.beginPath(); c.roundRect(x - t.r, y - t.r, t.r * 2, t.r * 2, 6); c.fill();
        c.fillStyle = '#a77b56'; c.beginPath(); c.roundRect(x - t.r + 3, y - t.r + 3, t.r * 2 - 6, t.r * 2 - 6, 5); c.fill();
        for (const [dx, dy, col] of [[-15, -15, '#2f5fa8'], [15, -15, '#d9a53c'], [-15, 15, '#e2392f'], [15, 15, '#f7f3ea']]) {
          c.fillStyle = '#9aa3ad'; c.beginPath(); c.arc(x + dx, y + dy, 13.5, 0, 7); c.fill();
          c.fillStyle = '#d5dbde'; c.beginPath(); c.arc(x + dx, y + dy, 12, 0, 7); c.fill();
          c.fillStyle = col; c.beginPath(); c.arc(x + dx, y + dy, 10.4, 0, 7); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.ellipse(x + dx - 3, y + dy - 3, 4, 2, -0.6, 0, 7); c.fill();
        }
        c.strokeStyle = '#c9a77a'; c.lineWidth = 3.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 26, y - 3); c.lineTo(x - 2, y - 26); c.stroke();
      } else if (t.kind === 'brushjar') {
        // a jar of brushes from above, the brushes fanning out over its rim
        c.fillStyle = '#b9d3dc'; c.beginPath(); c.arc(x, y, t.r, 0, 7); c.fill();
        c.fillStyle = '#dcecf1'; c.beginPath(); c.arc(x, y, t.r - 3.4, 0, 7); c.fill();
        c.fillStyle = 'rgba(120,160,185,0.5)'; c.beginPath(); c.arc(x, y, t.r - 8, 0, 7); c.fill();
        for (const [a, col] of [[0.4, '#b0352c'], [1.5, '#2b3550'], [2.6, '#c8903a'], [3.7, '#3f7f6e'], [4.9, '#7d5434']]) {
          const ex = x + Math.cos(a) * (t.r + 8), ey = y + Math.sin(a) * (t.r + 8);
          c.strokeStyle = col; c.lineWidth = 3.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + Math.cos(a) * 4, y + Math.sin(a) * 4); c.lineTo(ex, ey); c.stroke();
          c.fillStyle = '#d5dbde'; c.beginPath(); c.arc(ex, ey, 3, 0, 7); c.fill();
          c.fillStyle = '#ead9b4'; c.beginPath(); c.ellipse(ex + Math.cos(a) * 5, ey + Math.sin(a) * 5, 5.6, 3.4, a, 0, 7); c.fill();
        }
      } else if (t.kind === 'churn') {
        c.fillStyle = '#aab1b8'; c.beginPath(); c.arc(x, y, t.r, 0, 7); c.fill();
        c.fillStyle = '#d0d6db'; c.beginPath(); c.arc(x, y, t.r - 5, 0, 7); c.fill();
        c.fillStyle = '#8d969e'; c.beginPath(); c.arc(x, y, 7, 0, 7); c.fill();
        c.strokeStyle = '#6b7178'; c.lineWidth = 2.4; c.beginPath(); c.arc(x, y, t.r - 2, 0.4, 1.4); c.moveTo(x - t.r + 2, y); c.arc(x, y, t.r - 2, Math.PI + 0.4, Math.PI + 1.4); c.stroke();
      }
    }
    return {
      family: 'dust', particle: 'dust', region,
      tough: (x, y) => (x < 18 || x > 342 || y < top + 14 || y > bot - 14 ? 1.35 : 1),
      decor(c) {
        floor(c, bleed.x0, top, bleed.x1, bleed.y1, false);
        if (pottery) {
          // the workbench along the top: a slab of wedged clay, a bowl of slip, tools
          c.fillStyle = '#8a6142'; c.fillRect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, top - bleed.y0);
          for (let i = 0; i < 70; i++) { const y = bleed.y0 + r() * (top - 14 - bleed.y0), x = bleed.x0 + r() * (bleed.x1 - bleed.x0); c.strokeStyle = r() < 0.6 ? 'rgba(40,22,12,0.25)' : 'rgba(255,220,180,0.1)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 40 + r() * 80, y + (r() - 0.5) * 2); c.stroke(); }
          c.fillStyle = '#a77b56'; c.fillRect(bleed.x0, top - 14, bleed.x1 - bleed.x0, 8);
          c.fillStyle = '#5b3a26'; c.fillRect(bleed.x0, top - 6, bleed.x1 - bleed.x0, 6);
          c.fillStyle = 'rgba(30,18,10,0.3)'; c.beginPath(); c.ellipse(74, 46, 34, 22, 0.1, 0, 7); c.fill();
          c.fillStyle = '#b9805e'; c.beginPath(); c.ellipse(70, 40, 34, 22, 0.1, 0, 7); c.fill();
          c.fillStyle = 'rgba(255,230,210,0.25)'; c.beginPath(); c.ellipse(62, 34, 16, 8, 0.1, 0, 7); c.fill();
          c.fillStyle = 'rgba(30,18,10,0.3)'; c.beginPath(); c.arc(184, 44, 22, 0, 7); c.fill();
          c.fillStyle = '#f4ecdc'; c.beginPath(); c.arc(181, 40, 22, 0, 7); c.fill();
          c.fillStyle = '#c7a98a'; c.beginPath(); c.arc(181, 40, 15, 0, 7); c.fill();
          c.fillStyle = '#c9a77a'; c.beginPath(); c.ellipse(262, 34, 12, 7, 0.4, 0, 7); c.fill();
          c.strokeStyle = '#9aa3ad'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(290, 52); c.quadraticCurveTo(312, 30, 334, 50); c.stroke();
          c.fillStyle = '#b98654'; c.fillRect(286, 50, 8, 5); c.fillRect(330, 48, 8, 5);
          // the wooden sill of the barn door and the cobbles beyond
          c.fillStyle = '#6b4a32'; c.fillRect(bleed.x0, bot, bleed.x1 - bleed.x0, 8);
          c.fillStyle = '#9a8f80'; c.fillRect(bleed.x0, bot + 8, bleed.x1 - bleed.x0, bleed.y1 - bot);
          for (let x = bleed.x0; x < bleed.x1; x += 15) { c.fillStyle = U.pick(r, ['#a49a8a', '#b3a998', '#978d7e']); c.beginPath(); c.ellipse(x + 7, bot + 15, 6.5, 4, 0, 0, 7); c.fill(); }
        } else if (beads) {
          // the glass-topped counter, button cards under the glass, a brass yard measure along its edge
          c.fillStyle = '#8a5a3c'; c.fillRect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, top - bleed.y0);
          c.fillStyle = '#d6e6e6'; c.fillRect(bleed.x0 + 8, bleed.y0 + 6, bleed.x1 - bleed.x0 - 16, top - 26 - bleed.y0);
          for (let x = 18; x < 340; x += 38) {
            c.fillStyle = '#f7f1e2'; c.fillRect(x, 10, 30, 46);
            for (let k = 0; k < 4; k++) { const bc = U.pick(r, ['#e2574c', '#3d5a86', '#f2d88a', '#5f9e9b', '#bba9df', '#2b2b30']); c.fillStyle = bc; c.beginPath(); c.arc(x + 9 + (k % 2) * 12, 22 + Math.floor(k / 2) * 18, 5, 0, 7); c.fill(); c.fillStyle = U.shade(bc, -0.4); c.beginPath(); c.arc(x + 8 + (k % 2) * 12, 22 + Math.floor(k / 2) * 18, 0.9, 0, 7); c.arc(x + 10 + (k % 2) * 12, 22 + Math.floor(k / 2) * 18, 0.9, 0, 7); c.fill(); }
          }
          c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.moveTo(60, bleed.y0); c.lineTo(90, bleed.y0); c.lineTo(60, top - 20); c.lineTo(30, top - 20); c.closePath(); c.fill();
          c.fillStyle = '#c9a24a'; c.fillRect(bleed.x0, top - 20, bleed.x1 - bleed.x0, 8);
          c.fillStyle = '#5a4520'; for (let x = Math.ceil(bleed.x0 / 9) * 9; x < bleed.x1; x += 9) c.fillRect(x, top - 20, 1, x % 36 ? 3 : 6);
          c.fillStyle = '#5b3a26'; c.fillRect(bleed.x0, top - 12, bleed.x1 - bleed.x0, 12);
          c.strokeStyle = '#a9b1b7'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(270, 24); c.lineTo(310, 52); c.moveTo(270, 52); c.lineTo(310, 24); c.stroke();
          c.strokeStyle = '#c9a24a'; c.lineWidth = 2.4; c.beginPath(); c.arc(264, 20, 6, 0, 7); c.arc(264, 56, 6, 0, 7); c.stroke();
          // the doorway: a brass threshold and the pavement beyond
          c.fillStyle = '#c9a24a'; c.fillRect(bleed.x0, bot, bleed.x1 - bleed.x0, 5);
          c.fillStyle = '#b3a895'; c.fillRect(bleed.x0, bot + 5, bleed.x1 - bleed.x0, bleed.y1 - bot);
          for (let x = bleed.x0; x < bleed.x1; x += 60) { c.fillStyle = 'rgba(80,72,60,0.4)'; c.fillRect(x, bot + 5, 1.5, bleed.y1 - bot); }
        } else if (loft) {
          // the long painting bench: a big palette, jars, tubes and a rag
          c.fillStyle = '#b38a5c'; c.fillRect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, top - bleed.y0);
          for (let i = 0; i < 70; i++) { const y = bleed.y0 + r() * (top - 14 - bleed.y0), x = bleed.x0 + r() * (bleed.x1 - bleed.x0); c.strokeStyle = r() < 0.6 ? 'rgba(70,40,20,0.2)' : 'rgba(255,230,190,0.12)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 14 + r() * 30, y); c.stroke(); }
          for (let i = 0; i < 30; i++) { c.fillStyle = U.pick(r, ['#2f5fa8', '#d9a53c', '#e2392f', '#3f8f8a', '#f7f3ea']); c.beginPath(); c.ellipse(bleed.x0 + r() * (bleed.x1 - bleed.x0), bleed.y0 + r() * (top - 16 - bleed.y0), 1.2 + r() * 3, 1 + r() * 2, 0, 0, 7); c.fill(); }
          c.fillStyle = 'rgba(40,25,10,0.26)'; c.beginPath(); c.ellipse(84, 46, 56, 25, -0.08, 0, 7); c.fill();
          c.fillStyle = '#d9b488'; c.beginPath(); c.ellipse(80, 40, 56, 25, -0.08, 0, 7); c.fill();
          c.fillStyle = '#c0935f'; c.beginPath(); c.ellipse(42, 48, 8, 5.4, 0, 0, 7); c.fill();
          for (const [dx, dy, col] of [[-16, -13, '#e2392f'], [4, -16, '#d9a53c'], [24, -12, '#2f5fa8'], [37, 0, '#f7f3ea'], [26, 12, '#3f8f8a']]) { c.fillStyle = col; c.beginPath(); c.arc(80 + dx, 40 + dy, 5.6, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.arc(78.6 + dx, 38.6 + dy, 1.6, 0, 7); c.fill(); }
          for (const [x, col] of [[190, '#2f5fa8'], [226, '#d9a53c']]) { c.fillStyle = 'rgba(40,25,10,0.25)'; c.beginPath(); c.arc(x + 3, 44, 16, 0, 7); c.fill(); c.fillStyle = '#d5dbde'; c.beginPath(); c.arc(x, 40, 16, 0, 7); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(x, 40, 13, 0, 7); c.fill(); }
          c.fillStyle = '#f2ecdf'; c.beginPath(); c.moveTo(270, 22); c.quadraticCurveTo(310, 12, 340, 28); c.quadraticCurveTo(346, 50, 322, 62); c.quadraticCurveTo(286, 66, 268, 48); c.closePath(); c.fill();
          c.fillStyle = '#2f5fa8'; c.beginPath(); c.arc(300, 38, 6, 0, 7); c.fill(); c.fillStyle = '#e2392f'; c.beginPath(); c.arc(318, 46, 3.6, 0, 7); c.fill();
          c.fillStyle = '#8a5f3c'; c.fillRect(bleed.x0, top - 14, bleed.x1 - bleed.x0, 8);
          c.fillStyle = '#5b3a26'; c.fillRect(bleed.x0, top - 6, bleed.x1 - bleed.x0, 6);
          // the door sill and the top of the outside stairs beyond
          c.fillStyle = '#6b4a32'; c.fillRect(bleed.x0, bot, bleed.x1 - bleed.x0, 6);
          c.fillStyle = '#b39a76'; c.fillRect(bleed.x0, bot + 6, bleed.x1 - bleed.x0, bleed.y1 - bot);
          for (let x = bleed.x0; x < bleed.x1; x += 42) { c.fillStyle = 'rgba(70,50,30,0.4)'; c.fillRect(x, bot + 6, 1.5, bleed.y1 - bot); }
        } else if (curio) {
          // the mahogany counter: an open ledger, an inkwell and quill, a brass bell
          c.fillStyle = '#5a2e22'; c.fillRect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, top - bleed.y0);
          for (let i = 0; i < 80; i++) { const y = bleed.y0 + r() * (top - 14 - bleed.y0), x = bleed.x0 + r() * (bleed.x1 - bleed.x0); c.strokeStyle = r() < 0.6 ? 'rgba(30,12,8,0.3)' : 'rgba(255,200,170,0.1)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 40 + r() * 80, y + (r() - 0.5) * 2); c.stroke(); }
          c.fillStyle = 'rgba(20,10,5,0.3)'; c.fillRect(34, 16, 112, 52);
          c.fillStyle = '#f2e8d2'; c.fillRect(30, 12, 54, 52); c.fillRect(86, 12, 54, 52);
          c.fillStyle = '#7d2a34'; c.fillRect(84, 10, 4, 56);
          c.fillStyle = 'rgba(80,60,40,0.4)'; for (let k = 0; k < 7; k++) { c.fillRect(36, 20 + k * 6, 42, 1); c.fillRect(92, 20 + k * 6, 42 - (k % 3) * 8, 1); }
          c.fillStyle = '#26262b'; c.beginPath(); c.arc(196, 40, 11, 0, 7); c.fill(); c.fillStyle = '#4a4a55'; c.beginPath(); c.arc(194, 38, 5, 0, 7); c.fill();
          c.strokeStyle = '#f4ecdc'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(196, 36); c.quadraticCurveTo(220, 20, 238, 8); c.stroke();
          c.fillStyle = '#9a7a2e'; c.beginPath(); c.arc(300, 42, 18, 0, 7); c.fill();
          c.fillStyle = '#d8b25a'; c.beginPath(); c.arc(300, 42, 14, 0, 7); c.fill();
          c.fillStyle = '#f2d88a'; c.beginPath(); c.arc(296, 38, 5, 0, 7); c.fill(); c.fillStyle = '#5a4520'; c.beginPath(); c.arc(300, 42, 3.4, 0, 7); c.fill();
          c.fillStyle = '#c9a24a'; c.fillRect(bleed.x0, top - 14, bleed.x1 - bleed.x0, 4);
          c.fillStyle = '#3a1c14'; c.fillRect(bleed.x0, top - 10, bleed.x1 - bleed.x0, 10);
          // the doorway: a brass threshold and the cobbles beyond
          c.fillStyle = '#c9a24a'; c.fillRect(bleed.x0, bot, bleed.x1 - bleed.x0, 5);
          c.fillStyle = '#8f897d'; c.fillRect(bleed.x0, bot + 5, bleed.x1 - bleed.x0, bleed.y1 - bot);
          for (let x = bleed.x0; x < bleed.x1; x += 15) { c.fillStyle = U.pick(r, ['#a09a8e', '#857f74', '#9a9488']); c.beginPath(); c.ellipse(x + 7, bot + 13, 6.5, 4, 0, 0, 7); c.fill(); }
        } else {
          // the long platform bench under the window, seen from above
          c.fillStyle = '#d9cbb0'; c.fillRect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, top - bleed.y0);
          c.fillStyle = '#8e3b3f'; c.fillRect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, 30 - bleed.y0);
          c.fillStyle = 'rgba(30,18,10,0.3)'; c.fillRect(bleed.x0, 36, bleed.x1 - bleed.x0, 50);
          for (let k = 0; k < 4; k++) { c.fillStyle = k % 2 ? '#a77b56' : '#b98654'; c.fillRect(bleed.x0, 32 + k * 12, bleed.x1 - bleed.x0, 10); c.fillStyle = 'rgba(255,230,190,0.18)'; c.fillRect(bleed.x0, 32 + k * 12, bleed.x1 - bleed.x0, 2); }
          for (const x of [40, 180, 320]) { c.fillStyle = '#2b2b30'; c.fillRect(x - 5, 30, 10, 54); }
          c.fillStyle = '#3d5a86'; c.beginPath(); c.roundRect(214, 26, 60, 40, 5); c.fill();
          c.fillStyle = '#c9a24a'; c.fillRect(228, 26, 4, 40); c.fillRect(256, 26, 4, 40);
          c.fillStyle = '#5b3a26'; c.fillRect(bleed.x0, top - 6, bleed.x1 - bleed.x0, 6);
          // the threshold and the platform beyond the door
          c.fillStyle = '#c9a24a'; c.fillRect(bleed.x0, bot, bleed.x1 - bleed.x0, 5);
          c.fillStyle = '#a8a196'; c.fillRect(bleed.x0, bot + 5, bleed.x1 - bleed.x0, bleed.y1 - bot);
          for (let x = bleed.x0; x < bleed.x1; x += 40) { c.fillStyle = 'rgba(80,75,65,0.4)'; c.fillRect(x, bot + 5, 1.5, bleed.y1 - bot); }
        }
      },
      clean(c) {
        floor(c, 0, top, W, bot, false);
        for (const [o, w, a] of [[-150, 70, 0.1], [20, 26, 0.08], [130, 90, 0.07]]) {
          c.fillStyle = `rgba(255,255,255,${a})`;
          c.beginPath(); c.moveTo(o, bot); c.lineTo(o + w, bot); c.lineTo(o + w + 300, top); c.lineTo(o + 300, top); c.closePath(); c.fill();
        }
      },
      cleanOver(c) {
        glow(c, 120, 250, 120, 'rgba(255,244,214,0.16)');
        glow(c, 260, 360, 100, 'rgba(255,244,214,0.12)');
      },
      dirt(c) {
        floor(c, 0, top, W, bot, true);
        const g = pottery ? ramp(['#a99e90', '#bab0a2', '#c9c0b3', '#d6cec2']) : loft ? ramp(['#ada392', '#bcb2a2', '#cac2b3', '#d6cfc2']) : curio ? ramp(['#8e8578', '#a0978a', '#b2aa9d', '#c2bbaf']) : ramp(['#a29a8c', '#b3ac9e', '#c3bcaf', '#d0c9bd']);
        field(c, 0, top, W, bot, 2, (x, y) => { const v = nz.fbm(x * 0.03, y * 0.03, 5); return [...g(v), 212 + v * 40]; });
        grime(c, r, 0, top, W, bot, 22);
        if (pottery) {
          // dried clay splats and crumbs round the wheel, trimmings curling on the tiles
          const wh = things[0];
          for (let i = 0; i < 70; i++) {
            const a = r() * 6.28, d = wh.r + 4 + Math.pow(r(), 1.6) * 110, x = wh.x + Math.cos(a) * d, y = wh.y + Math.sin(a) * d, s = 2 + r() * 7;
            c.fillStyle = U.pick(r, ['rgba(150,110,85,0.75)', 'rgba(175,140,115,0.7)', 'rgba(205,190,170,0.8)']);
            c.beginPath(); for (let k = 0; k < 8; k++) { const aa = (k / 8) * 6.283, rr = s * (0.5 + r() * 0.6); c.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr); } c.closePath(); c.fill();
          }
          c.lineCap = 'round';
          for (let i = 0; i < 26; i++) {
            const x = 40 + r() * 280, y = top + 30 + r() * 440, a = r() * 6.28;
            c.strokeStyle = U.pick(r, ['#a87a5c', '#b98a6a', '#c9a284']); c.lineWidth = 2.2;
            c.beginPath(); for (let k = 0; k < 14; k++) { const t = k / 13; c.lineTo(x + Math.cos(a + t * 5) * (2 + t * 7), y + Math.sin(a + t * 5) * (2 + t * 7)); } c.stroke();
          }
          // clay footprints from the door to the wheel
          c.fillStyle = 'rgba(214,204,190,0.65)';
          for (let i = 0, y = bot - 20; y > top + 60; i++, y -= 30) {
            const x = 180 + Math.sin(y * 0.01) * 40 + (i % 2 ? 9 : -9);
            c.save(); c.translate(x, y); c.rotate(Math.cos(y * 0.01) * 0.3);
            c.beginPath(); c.ellipse(0, -6, 5, 7.5, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(0, 7, 4, 3.6, 0, 0, 7); c.fill();
            c.restore();
          }
          for (let i = 0; i < 12; i++) deadLeaf(c, r, 120 + r() * 140, bot - Math.pow(r(), 1.8) * 160, 5 + r() * 4);
        } else if (beads) {
          // threads and snippets everywhere, pins, a few stray buttons and fluff
          c.lineCap = 'round';
          for (let i = 0; i < 60; i++) {
            const x = 20 + r() * 320, y = top + 20 + r() * 450, a = r() * 6.28, n = 6 + (r() * 8) | 0;
            c.strokeStyle = U.pick(r, ['#e2574c', '#5f9e9b', '#f2d88a', '#bba9df', '#efb4ae', '#3d5a86', '#f4ecdc', '#9cc5a1']); c.lineWidth = 1.3;
            c.beginPath(); c.moveTo(x, y);
            for (let k = 1; k <= n; k++) c.lineTo(x + Math.cos(a + k * 0.9) * (2 + k * 1.9) + k * 1.4, y + Math.sin(a + k * 0.9) * (2 + k * 1.9));
            c.stroke();
          }
          for (let i = 0; i < 26; i++) {
            c.save(); c.translate(20 + r() * 320, top + 20 + r() * 450); c.rotate(r() * 6.28);
            const col = U.pick(r, ['#efb4ae', '#3d5a86', '#9cc5a1', '#f2d88a', '#e9a39b']), w = 8 + r() * 12;
            c.fillStyle = col; c.beginPath(); c.moveTo(-w / 2, -4); c.lineTo(w / 2, -6); c.lineTo(w / 2 - 2, 5); c.lineTo(-w / 2 + 3, 4); c.closePath(); c.fill();
            c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); c.arc(-1, -1, 1.2, 0, 7); c.arc(3, 1, 1.2, 0, 7); c.fill();
            c.restore();
          }
          for (let i = 0; i < 16; i++) {
            const x = 20 + r() * 320, y = top + 20 + r() * 450, a = r() * 6.28;
            c.strokeStyle = '#b9c0c4'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 12, y + Math.sin(a) * 12); c.stroke();
            c.fillStyle = U.pick(r, ['#e2574c', '#f2d88a', '#3d5a86', '#f4ecdc']); c.beginPath(); c.arc(x, y, 2, 0, 7); c.fill();
          }
          for (let i = 0; i < 7; i++) { const bc = U.pick(r, ['#e2574c', '#f2d88a', '#3d5a86', '#2b2b30']), x = 30 + r() * 300, y = top + 30 + r() * 440; c.fillStyle = bc; c.beginPath(); c.arc(x, y, 4.5, 0, 7); c.fill(); c.fillStyle = U.shade(bc, -0.45); c.beginPath(); c.arc(x - 1.2, y, 0.8, 0, 7); c.arc(x + 1.2, y, 0.8, 0, 7); c.fill(); }
          c.fillStyle = 'rgba(105,88,66,0.28)';
          for (let i = 0, y = bot - 16; y > top + 40; i++, y -= 30) {
            const x = 180 + Math.sin(y * 0.013) * 30 + (i % 2 ? 9 : -9);
            c.save(); c.translate(x, y); c.rotate(Math.cos(y * 0.013) * 0.3);
            c.beginPath(); c.ellipse(0, -6, 5, 7.5, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(0, 7, 4, 3.6, 0, 0, 7); c.fill();
            c.restore();
          }
        } else if (loft) {
          // dried paint everywhere: splats with their drops, wipes of a loaded brush,
          // scraps of masking tape, and a cat that walked through the cobalt
          const cols = ['#2f5fa8', '#d9a53c', '#e2392f', '#3f8f8a', '#f7f3ea', '#2f5fa8', '#d9a53c'];
          c.lineCap = 'round';
          for (let i = 0; i < 14; i++) {
            const x = 30 + r() * 300, y = top + 24 + r() * 440, a = r() * 6.28, l = 26 + r() * 50;
            c.strokeStyle = U.pick(r, cols); c.globalAlpha = 0.8; c.lineWidth = 5 + r() * 6;
            c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + 0.5) * l * 0.5, y + Math.sin(a + 0.5) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
            c.globalAlpha = 1;
          }
          for (let i = 0; i < 40; i++) {
            const x = 18 + r() * 324, y = top + 16 + r() * 460, s = 4 + r() * 13, col = U.pick(r, cols);
            c.fillStyle = col; c.beginPath();
            for (let k = 0; k < 9; k++) { const a = (k / 9) * 6.283, rr = s * (0.62 + r() * 0.5); c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.86); }
            c.closePath(); c.fill();
            c.fillStyle = 'rgba(255,255,255,0.2)'; c.beginPath(); c.ellipse(x - s * 0.2, y - s * 0.24, s * 0.3, s * 0.14, -0.4, 0, 7); c.fill();
            for (let k = 0; k < 5; k++) { const a = r() * 6.283, d = s * (1.2 + r() * 1); c.fillStyle = col; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 0.8 + r() * 1.8, 0, 7); c.fill(); }
          }
          for (let i = 0; i < 9; i++) {
            c.save(); c.translate(24 + r() * 312, top + 24 + r() * 440); c.rotate(r() * 6.28);
            c.fillStyle = 'rgba(232,216,170,0.9)'; c.fillRect(-13, -4, 26, 8); c.restore();
          }
          c.fillStyle = 'rgba(47,95,168,0.8)';
          for (let i = 0, t = 0; t < 1; i++, t += 0.075) {
            const x = 150 + Math.sin(t * 5) * 60 + (i % 2 ? 7 : -7), y = bot - 24 - t * 390;
            c.beginPath(); c.ellipse(x, y, 4.2, 3.6, 0, 0, 7); c.fill();
            for (const [dx, dy] of [[-5, -4], [-1.8, -6.4], [1.8, -6.4], [5, -4]]) { c.beginPath(); c.arc(x + dx, y + dy, 1.5, 0, 7); c.fill(); }
          }
        } else if (curio) {
          // old papers and luggage tags, a lost playing card, marbles, leaves by the door, footprints
          for (let i = 0; i < 10; i++) paperScrap(c, r, 20 + r() * 320, top + 20 + r() * 440, 7 + r() * 6);
          for (let i = 0; i < 8; i++) {
            c.save(); c.translate(20 + r() * 320, top + 20 + r() * 440); c.rotate(r() * 6.28);
            c.fillStyle = '#d8c39a'; c.beginPath(); c.moveTo(-10, -6); c.lineTo(8, -6); c.lineTo(12, 0); c.lineTo(8, 6); c.lineTo(-10, 6); c.closePath(); c.fill();
            c.fillStyle = '#8a6a46'; c.beginPath(); c.arc(7, 0, 1.6, 0, 7); c.fill();
            c.strokeStyle = 'rgba(160,140,110,0.8)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(7, 0); c.quadraticCurveTo(16, -8, 22, 2); c.stroke();
            c.restore();
          }
          c.save(); c.translate(150, 330); c.rotate(0.4);
          c.fillStyle = '#f7f3ea'; c.fillRect(-9, -13, 18, 26); c.fillStyle = '#c9474f'; c.font = '800 9px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('♥', 0, 0);
          c.restore();
          for (let i = 0; i < 5; i++) { const x = 40 + r() * 280, y = top + 40 + r() * 420, col = U.pick(r, ['#5d7fd8', '#e2574c', '#6f9a6a', '#e9bf4f']); c.fillStyle = col; c.beginPath(); c.arc(x, y, 3.6, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.arc(x - 1, y - 1, 1.2, 0, 7); c.fill(); }
          for (let i = 0; i < 18; i++) deadLeaf(c, r, r() * W, bot - Math.pow(r(), 1.8) * 200, 5 + r() * 5);
          c.fillStyle = 'rgba(95,80,62,0.3)';
          for (let i = 0, y = bot - 16; y > top + 40; i++, y -= 30) {
            const x = 186 + Math.sin(y * 0.011) * 40 + (i % 2 ? 9 : -9);
            c.save(); c.translate(x, y); c.rotate(Math.cos(y * 0.011) * 0.35);
            c.beginPath(); c.ellipse(0, -6, 5, 7.5, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(0, 7, 4, 3.6, 0, 0, 7); c.fill();
            c.restore();
          }
        } else {
          // leaves and old tickets blown in, a lost glove, footprints to the bench
          for (let i = 0; i < 44; i++) deadLeaf(c, r, r() * W, bot - Math.pow(r(), 1.6) * 320, 5 + r() * 6);
          for (let i = 0; i < 12; i++) {
            c.save(); c.translate(20 + r() * 320, top + 20 + r() * 440); c.rotate(r() * 6.28);
            c.fillStyle = '#efe6cf'; c.fillRect(-9, -5, 18, 10);
            c.fillStyle = '#c9474f'; c.fillRect(-9, -1.5, 18, 3);
            c.fillStyle = 'rgba(70,60,50,0.45)'; c.fillRect(-6, -4, 6, 1.4); c.restore();
          }
          for (let i = 0; i < 6; i++) paperScrap(c, r, 20 + r() * 320, top + 20 + r() * 440, 7 + r() * 6);
          c.fillStyle = 'rgba(105,88,66,0.3)';
          for (let i = 0, y = bot - 16; y > top + 40; i++, y -= 30) {
            const x = 190 + Math.sin(y * 0.013) * 36 + (i % 2 ? 9 : -9);
            c.save(); c.translate(x, y); c.rotate(Math.cos(y * 0.013) * 0.35);
            c.beginPath(); c.ellipse(0, -6, 5, 7.5, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(0, 7, 4, 3.6, 0, 0, 7); c.fill();
            c.restore();
          }
          c.fillStyle = '#c9474f'; c.save(); c.translate(200, 250); c.rotate(0.5); c.beginPath(); c.roundRect(-10, -7, 20, 16, 4); c.fill(); c.fillRect(-10, -14, 4, 9); c.fillRect(-4, -16, 4, 10); c.fillRect(2, -15, 4, 9); c.restore();
        }
        for (let i = 0; i < 30; i++) {
          const x = r() < 0.5 ? r() * 40 + (r() < 0.5 ? 0 : 320) : r() * W, y = top + 6 + r() * (bot - top - 12), s = 5 + r() * 9;
          for (let k = 0; k < 9; k++) { const v = 150 + r() * 40; c.fillStyle = `rgba(${v},${v - 5},${v - 12},0.7)`; c.beginPath(); c.arc(x + (r() - 0.5) * s, y + (r() - 0.5) * s * 0.7, s * 0.4, 0, 7); c.fill(); }
        }
        cobweb(c, 0, top, 0, 70);
        cobweb(c, W, top, Math.PI / 2, 60);
      },
      top(c) {
        const g = c.createLinearGradient(0, top, 0, top + 22);
        g.addColorStop(0, 'rgba(40,25,15,0.35)'); g.addColorStop(1, 'rgba(40,25,15,0)');
        c.fillStyle = g; c.fillRect(bleed.x0, top, bleed.x1 - bleed.x0, 22);
        for (const t of things) thing(c, t);
        if (mat) {
          const [x, y, w, h] = mat;
          c.fillStyle = 'rgba(40,28,18,0.25)'; c.fillRect(x + 3, y + 4, w, h);
          c.fillStyle = '#8a6236'; c.beginPath(); c.roundRect(x, y, w, h, 4); c.fill();
          c.fillStyle = '#b8915a'; c.beginPath(); c.roundRect(x + 5, y + 5, w - 10, h - 10, 3); c.fill();
          c.strokeStyle = 'rgba(110,80,40,0.35)'; c.lineWidth = 1; for (let k = x + 9; k < x + w - 6; k += 4) { c.beginPath(); c.moveTo(k, y + 6); c.lineTo(k, y + h - 6); c.stroke(); }
          c.fillStyle = '#8e3b3f'; c.font = '900 13px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('WELCOME', x + w / 2, y + h / 2 + 1);
        }
      },
    };
  }

  // ------------------------------------------------------------------ FLOOR
  // Looking down at the café floor, from the counter to the door.
  function cafeFloor(S) {
    if (['pottery', 'halt', 'beads', 'curio', 'loft'].includes(S.opts.where)) return otherFloor(S, S.opts.where);
    const { r, nz, bleed } = S;
    const top = 92, bot = 584;
    const stools = [80, 180, 280].map((x) => ({ x, y: 140, r: 17 }));
    const table = { x: 128, y: 384, r: 48 };
    const chairs = [{ x: 56, y: 324, r: 18, a: -2.45 }, { x: 206, y: 446, r: 18, a: 0.7 }];
    const plant = { x: 298, y: 526, r: 30 };
    const region = new Path2D();
    region.rect(0, top, W, bot - top);
    for (const t of [...stools, table, ...chairs, plant]) { region.moveTo(t.x + t.r, t.y); region.arc(t.x, t.y, t.r, 0, Math.PI * 2); }
    const shadowOf = (c, x, y, rad) => { c.fillStyle = 'rgba(40,28,18,0.25)'; c.beginPath(); c.arc(x + 4, y + 5, rad, 0, 7); c.fill(); };
    return {
      family: 'dust', particle: 'dust', region,
      tough: (x, y) => (x < 18 || x > 342 || y < top + 14 || y > bot - 14 ? 1.35 : 1),
      decor(c) {
        checker(c, nz, bleed.x0, top, bleed.x1, bleed.y1, TILE_A, TILE_B);
        // the counter along the top, seen from above
        c.fillStyle = '#6b452c'; c.fillRect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, top - bleed.y0);
        for (let i = 0; i < 90; i++) {
          const y = bleed.y0 + r() * (top - 14 - bleed.y0), x = bleed.x0 + r() * (bleed.x1 - bleed.x0);
          c.strokeStyle = r() < 0.6 ? 'rgba(40,22,12,0.25)' : 'rgba(255,220,180,0.1)'; c.lineWidth = 1;
          c.beginPath(); c.moveTo(x, y); c.lineTo(x + 40 + r() * 80, y + (r() - 0.5) * 2); c.stroke();
        }
        c.fillStyle = '#8a5d3d'; c.fillRect(bleed.x0, top - 14, bleed.x1 - bleed.x0, 8);
        c.fillStyle = '#3e2718'; c.fillRect(bleed.x0, top - 6, bleed.x1 - bleed.x0, 6);
        // cups, a cake stand and the bell on the counter
        for (const [x, y] of [[44, 34], [318, 46]]) {
          c.fillStyle = 'rgba(30,18,10,0.3)'; c.beginPath(); c.arc(x + 2, y + 3, 11, 0, 7); c.fill();
          c.fillStyle = '#f7f3ea'; c.beginPath(); c.arc(x, y, 11, 0, 7); c.fill();
          c.fillStyle = '#e9e2d3'; c.beginPath(); c.arc(x, y, 7.5, 0, 7); c.fill();
          c.fillStyle = '#6b4022'; c.beginPath(); c.arc(x, y, 5.5, 0, 7); c.fill();
          c.fillStyle = '#c9a07a'; c.beginPath(); c.arc(x - 1, y - 1, 2.6, 0, 7); c.fill();
          c.fillStyle = '#f7f3ea'; c.fillRect(x + 7, y - 2, 6, 4);
        }
        c.fillStyle = 'rgba(30,18,10,0.3)'; c.beginPath(); c.arc(186, 42, 26, 0, 7); c.fill();
        c.fillStyle = '#f4efe6'; c.beginPath(); c.arc(183, 38, 26, 0, 7); c.fill();
        c.fillStyle = '#efb4ae'; c.beginPath(); c.arc(183, 38, 18, 0, 7); c.fill();
        c.strokeStyle = '#f8e7e3'; c.lineWidth = 1.5;
        for (let k = 0; k < 6; k++) { const a = (k / 6) * 6.283; c.beginPath(); c.moveTo(183, 38); c.lineTo(183 + Math.cos(a) * 18, 38 + Math.sin(a) * 18); c.stroke(); }
        c.fillStyle = '#c9474f'; for (let k = 0; k < 6; k++) { const a = (k / 6 + 0.08) * 6.283; c.beginPath(); c.arc(183 + Math.cos(a) * 12, 38 + Math.sin(a) * 12, 2, 0, 7); c.fill(); }
        c.fillStyle = '#d9b35a'; c.beginPath(); c.arc(250, 30, 8, 0, 7); c.fill();
        c.fillStyle = '#f2d88a'; c.beginPath(); c.arc(248, 28, 4, 0, 7); c.fill();
        // brass threshold and a coir mat by the door
        c.fillStyle = '#c9a24a'; c.fillRect(bleed.x0, bot, bleed.x1 - bleed.x0, 5);
        c.fillStyle = '#a77d48'; c.fillRect(bleed.x0, bot + 5, bleed.x1 - bleed.x0, bleed.y1 - bot);
        c.fillStyle = '#8a6236'; c.fillRect(70, bot + 12, 220, bleed.y1 - bot);
        c.fillStyle = '#b8915a'; c.fillRect(78, bot + 18, 204, bleed.y1 - bot);
      },
      clean(c) {
        checker(c, nz, 0, top, W, bot, TILE_A, TILE_B);
        // freshly mopped: soft light gliding over the tiles
        for (const [o, w, a] of [[-150, 70, 0.1], [20, 26, 0.08], [130, 90, 0.07]]) {
          c.fillStyle = `rgba(255,255,255,${a})`;
          c.beginPath(); c.moveTo(o, bot); c.lineTo(o + w, bot); c.lineTo(o + w + 300, top); c.lineTo(o + 300, top); c.closePath(); c.fill();
        }
      },
      cleanOver(c) {
        glow(c, 110, 250, 110, 'rgba(255,244,214,0.16)');
        glow(c, 270, 330, 90, 'rgba(255,244,214,0.12)');
      },
      dirt(c) {
        checker(c, nz, 0, top, W, bot, '#cfc5b0', '#87907e');
        const g = ramp(['#a29a8c', '#b3ac9e', '#c3bcaf', '#d0c9bd']);
        field(c, 0, top, W, bot, 2, (x, y) => { const v = nz.fbm(x * 0.03, y * 0.03, 5); return [...g(v), 212 + v * 40]; });
        grime(c, r, 0, top, W, bot, 26);
        // dust bunnies along the walls and under the stools
        for (let i = 0; i < 34; i++) {
          const x = r() < 0.5 ? r() * 40 + (r() < 0.5 ? 0 : 320) : r() * W, y = top + 6 + r() * (bot - top - 12), s = 5 + r() * 9;
          for (let k = 0; k < 9; k++) { const v = 150 + r() * 40; c.fillStyle = `rgba(${v},${v - 5},${v - 12},0.7)`; c.beginPath(); c.arc(x + (r() - 0.5) * s, y + (r() - 0.5) * s * 0.7, s * 0.4, 0, 7); c.fill(); }
        }
        // leaves blown in under the door, scraps of paper, sugar packets
        for (let i = 0; i < 40; i++) deadLeaf(c, r, r() * W, bot - Math.pow(r(), 1.8) * 300, 5 + r() * 6);
        for (let i = 0; i < 9; i++) paperScrap(c, r, 20 + r() * 320, top + 20 + r() * 440, 7 + r() * 6);
        for (let i = 0; i < 7; i++) {
          c.save(); c.translate(20 + r() * 320, top + 20 + r() * 460); c.rotate(r() * 6.28);
          c.fillStyle = U.pick(r, ['#f3c2cf', '#ffffff', '#d9c6a0']); c.fillRect(-7, -3.5, 14, 7);
          c.fillStyle = 'rgba(120,90,60,0.35)'; c.fillRect(-7, -1, 14, 2); c.restore();
        }
        // an old newspaper page
        c.save(); c.translate(250, 250); c.rotate(0.35);
        c.fillStyle = '#e9e2cf'; c.fillRect(-34, -44, 68, 88);
        c.fillStyle = 'rgba(70,65,55,0.55)'; c.fillRect(-28, -38, 56, 9);
        c.fillStyle = 'rgba(70,65,55,0.3)'; for (let y = -24; y < 40; y += 5) { c.fillRect(-28, y, 25, 2); c.fillRect(3, y, 25, 2); }
        c.restore();
        // shoe prints from the door up to the counter
        c.fillStyle = 'rgba(105,88,66,0.32)';
        for (let i = 0, y = bot - 16; y > top + 40; i++, y -= 30) {
          const x = 176 + Math.sin(y * 0.012) * 30 + (i % 2 ? 9 : -9), a = Math.cos(y * 0.012) * 0.35;
          c.save(); c.translate(x, y); c.rotate(a);
          c.beginPath(); c.ellipse(0, -6, 5, 7.5, 0, 0, 7); c.fill();
          c.beginPath(); c.ellipse(0, 7, 4, 3.6, 0, 0, 7); c.fill();
          c.restore();
        }
        cobweb(c, 0, top, 0, 70);
        cobweb(c, W, top, Math.PI / 2, 60);
      },
      top(c) {
        // the counter's shadow on the floor
        const g = c.createLinearGradient(0, top, 0, top + 22);
        g.addColorStop(0, 'rgba(40,25,15,0.35)'); g.addColorStop(1, 'rgba(40,25,15,0)');
        c.fillStyle = g; c.fillRect(bleed.x0, top, bleed.x1 - bleed.x0, 22);
        // bar stools: red leather on chrome rings
        for (const s of stools) {
          shadowOf(c, s.x, s.y, s.r + 3);
          c.strokeStyle = '#aab1b8'; c.lineWidth = 2; c.beginPath(); c.arc(s.x, s.y, s.r + 3, 0, 7); c.stroke();
          c.fillStyle = '#c9ced3'; c.beginPath(); c.arc(s.x, s.y, s.r, 0, 7); c.fill();
          c.fillStyle = '#b8443b'; c.beginPath(); c.arc(s.x, s.y, s.r - 3, 0, 7); c.fill();
          c.fillStyle = '#d0645a'; c.beginPath(); c.arc(s.x - 3, s.y - 3, s.r - 8, 0, 7); c.fill();
          c.fillStyle = '#8e2f29'; c.beginPath(); c.arc(s.x, s.y, 2, 0, 7); c.fill();
        }
        // bentwood chairs with cane seats
        for (const ch of chairs) {
          shadowOf(c, ch.x, ch.y, ch.r);
          c.fillStyle = '#7a4b2e'; c.beginPath(); c.arc(ch.x, ch.y, ch.r, 0, 7); c.fill();
          c.fillStyle = '#dcc28a'; c.beginPath(); c.arc(ch.x, ch.y, ch.r - 4, 0, 7); c.fill();
          c.strokeStyle = 'rgba(150,110,50,0.5)'; c.lineWidth = 0.8;
          c.save(); c.beginPath(); c.arc(ch.x, ch.y, ch.r - 4, 0, 7); c.clip();
          for (let k = -20; k <= 20; k += 4) { c.beginPath(); c.moveTo(ch.x + k - 20, ch.y - 20); c.lineTo(ch.x + k + 20, ch.y + 20); c.moveTo(ch.x + k + 20, ch.y - 20); c.lineTo(ch.x + k - 20, ch.y + 20); c.stroke(); }
          c.restore();
          c.strokeStyle = '#5e3a24'; c.lineWidth = 5; c.lineCap = 'round';
          c.beginPath(); c.arc(ch.x, ch.y, ch.r + 2, ch.a - 1.1, ch.a + 1.1); c.stroke();
        }
        // the round table with a little vase of flowers
        shadowOf(c, table.x, table.y, table.r);
        c.fillStyle = '#b8913d'; c.beginPath(); c.arc(table.x, table.y, table.r, 0, 7); c.fill();
        const mg = c.createRadialGradient(table.x - 16, table.y - 18, 4, table.x, table.y, table.r);
        mg.addColorStop(0, '#ffffff'); mg.addColorStop(1, '#ddd8cf');
        c.fillStyle = mg; c.beginPath(); c.arc(table.x, table.y, table.r - 4, 0, 7); c.fill();
        c.strokeStyle = 'rgba(130,130,140,0.35)'; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(table.x - 34, table.y + 10); c.quadraticCurveTo(table.x - 4, table.y - 4, table.x + 30, table.y + 22); c.stroke();
        c.fillStyle = '#5f8fc7'; c.beginPath(); c.arc(table.x + 4, table.y - 4, 7, 0, 7); c.fill();
        for (let k = 0; k < 5; k++) { const a = (k / 5) * 6.283; c.fillStyle = '#ef8aa6'; c.beginPath(); c.arc(table.x + 4 + Math.cos(a) * 5, table.y - 4 + Math.sin(a) * 5, 3.2, 0, 7); c.fill(); }
        c.fillStyle = '#f7c548'; c.beginPath(); c.arc(table.x + 4, table.y - 4, 2.4, 0, 7); c.fill();
        // a big leafy plant by the door
        shadowOf(c, plant.x, plant.y, plant.r + 8);
        c.fillStyle = '#b5652f'; c.beginPath(); c.arc(plant.x, plant.y, plant.r, 0, 7); c.fill();
        c.fillStyle = '#4a3324'; c.beginPath(); c.arc(plant.x, plant.y, plant.r - 5, 0, 7); c.fill();
        for (let k = 0; k < 11; k++) {
          const a = (k / 11) * 6.283 + r() * 0.3, len = 26 + r() * 16;
          c.save(); c.translate(plant.x, plant.y); c.rotate(a);
          c.fillStyle = U.pick(r, ['#3f7a3a', '#4f8a3c', '#5d9644', '#467e37']);
          c.beginPath(); c.ellipse(len * 0.55, 0, len * 0.55, 8 + r() * 4, 0, 0, 7); c.fill();
          c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(4, 0); c.lineTo(len, 0); c.stroke();
          c.restore();
        }
      },
    };
  }

  // ----------------------------------------------------------------- AWNING
  // The striped awning over the shop window, seen from across the street.
  const STRIPE_A = '#f4ecda', STRIPE_B = '#2f8068';
  function awning(S) {
    const { r, nz, bleed } = S;
    const yT = 122, yF = 318, yV = 360, N = 9;
    const xT0 = 40, xT1 = 320, xF0 = 14, xF1 = 346, sw = (xF1 - xF0) / N;
    // x of stripe edge k at height y on the sloping face
    const at = (k, y) => { const t = (y - yT) / (yF - yT), a = U.lerp(xT0, xF0, t), b = U.lerp(xT1, xF1, t); return a + ((b - a) * k) / N; };
    const region = new Path2D();
    region.moveTo(xT0, yT); region.lineTo(xT1, yT); region.lineTo(xF1, yF); region.lineTo(xF1, yV);
    for (let k = N - 1; k >= 0; k--) region.arc(xF0 + sw * (k + 0.5), yV, sw / 2, 0, Math.PI);
    region.lineTo(xF0, yF); region.closePath();
    const yB = yV + sw / 2;
    // the second colour; the first one is laid underneath so no seams show
    function stripes(c, col) {
      c.fillStyle = col;
      for (let k = 1; k < N; k += 2) {
        c.beginPath(); c.moveTo(at(k, yT), yT); c.lineTo(at(k + 1, yT), yT); c.lineTo(at(k + 1, yF), yF); c.lineTo(at(k, yF), yF); c.closePath(); c.fill();
        c.fillRect(xF0 + sw * k, yF - 0.5, sw, yB - yF + 1);
      }
    }
    return {
      family: 'wash', particle: 'suds', region,
      tough: (x, y) => (y < yT + 30 ? 1.4 : 1),
      decor(c) {
        bricks(c, r, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1);
        // the bottom of the name board peeks in at the top
        c.fillStyle = '#4a3322'; c.fillRect(18, bleed.y0, 324, 62 - bleed.y0);
        c.fillStyle = '#2f4f45'; c.fillRect(30, bleed.y0, 300, 50 - bleed.y0);
        c.fillStyle = '#d8ad4c'; c.fillRect(42, 36, 276, 2);
        // the shop window underneath
        const wx0 = 26, wx1 = 334, wy0 = 380, wy1 = 566;
        c.fillStyle = '#2f4f45'; c.fillRect(wx0 - 10, wy0 - 10, wx1 - wx0 + 20, wy1 - wy0 + 20);
        const gl = c.createLinearGradient(0, wy0, 0, wy1); gl.addColorStop(0, '#1d2f33'); gl.addColorStop(1, '#344a4a');
        c.fillStyle = gl; c.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
        for (const x of [96, 264]) {
          glow(c, x, 420, 80, 'rgba(255,196,120,0.55)');
          c.strokeStyle = '#111'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, wy0); c.lineTo(x, 404); c.stroke();
          c.fillStyle = '#c9a24a'; c.beginPath(); c.ellipse(x, 412, 14, 9, 0, Math.PI, 0); c.fill();
          c.fillStyle = '#ffe6a8'; c.beginPath(); c.ellipse(x, 412, 9, 3, 0, 0, Math.PI); c.fill();
        }
        c.fillStyle = '#3a2a22'; c.fillRect(wx0, 500, wx1 - wx0, wy1 - 500);
        c.fillStyle = '#5c4434'; c.fillRect(wx0, 500, wx1 - wx0, 5);
        // a cake under a glass dome and the coffee machine on the counter
        c.fillStyle = '#d9cbb0'; c.fillRect(118, 494, 30, 4); c.fillRect(131, 482, 4, 12);
        c.fillStyle = '#efb4ae'; c.fillRect(114, 462, 38, 20); c.fillStyle = '#fff3ea'; c.fillRect(114, 470, 38, 3);
        c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1.5; c.beginPath(); c.arc(133, 482, 30, Math.PI, 0); c.stroke();
        c.fillStyle = '#9aa4ae'; c.fillRect(226, 456, 54, 40); c.fillStyle = '#c87a45'; c.beginPath(); c.ellipse(253, 456, 22, 16, 0, Math.PI, 0); c.fill();
        // reflections on the glass, the mullion and the sill
        c.fillStyle = 'rgba(255,255,255,0.08)';
        for (const [o, w] of [[40, 50], [120, 18], [210, 60]]) { c.beginPath(); c.moveTo(wx0 + o, wy1); c.lineTo(wx0 + o + w, wy1); c.lineTo(wx0 + o + w + 90, wy0); c.lineTo(wx0 + o + 90, wy0); c.closePath(); c.fill(); }
        c.fillStyle = '#2f4f45'; c.fillRect(176, wy0, 8, wy1 - wy0);
        c.fillStyle = '#b9b2a6'; c.fillRect(bleed.x0, wy1 + 10, bleed.x1 - bleed.x0, bleed.y1 - wy1);
        c.fillStyle = '#a39b8f'; for (let x = bleed.x0; x < bleed.x1; x += 46) c.fillRect(x, wy1 + 10, 2, bleed.y1 - wy1);
        // the awning's shadow on the wall and window
        const sg = c.createLinearGradient(0, yV, 0, yV + 70);
        sg.addColorStop(0, 'rgba(30,20,15,0.4)'); sg.addColorStop(1, 'rgba(30,20,15,0)');
        c.fillStyle = sg; c.fillRect(xF0 - 6, yV - 10, xF1 - xF0 + 12, 80);
      },
      clean(c) {
        c.fillStyle = STRIPE_A; c.fillRect(0, yT - 2, W, yB - yT + 4);
        stripes(c, STRIPE_B);
        // darker up under the wall, a soft light along the front edge
        let g = c.createLinearGradient(0, yT, 0, yF);
        g.addColorStop(0, 'rgba(30,20,10,0.34)'); g.addColorStop(0.55, 'rgba(30,20,10,0.06)'); g.addColorStop(1, 'rgba(255,250,235,0.14)');
        c.fillStyle = g; c.fillRect(0, yT, W, yF - yT);
        g = c.createLinearGradient(0, yF, 0, yB);
        g.addColorStop(0, 'rgba(30,20,10,0.3)'); g.addColorStop(0.3, 'rgba(30,20,10,0.02)'); g.addColorStop(1, 'rgba(30,20,10,0.2)');
        c.fillStyle = g; c.fillRect(0, yF, W, yB - yF);
        // canvas weave and the seams between stripes
        field(c, 0, yT, W, yB, 1.5, (x, y) => { const v = nz.n2(x * 0.9, y * 0.9); return v > 0.5 ? [255, 255, 255, (v - 0.5) * 50] : [0, 0, 0, (0.5 - v) * 34]; });
        c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 1;
        for (let k = 1; k < N; k++) { c.beginPath(); c.moveTo(at(k, yT), yT); c.lineTo(at(k, yF), yF); c.lineTo(xF0 + sw * k, yB); c.stroke(); }
      },
      dirt(c) {
        // faded, grubby stripes that barely show
        c.fillStyle = '#cbbfa6'; c.fillRect(0, yT - 2, W, yB - yT + 4);
        stripes(c, '#76897a');
        const g = ramp(['#5f5444', '#74685a', '#8c8170']);
        field(c, 0, yT, W, yB, 2, (x, y) => {
          const v = nz.fbm(x * 0.02, y * 0.03, 5), streak = nz.n2(x * 0.12, y * 0.006);
          return [...g(v), 110 + v * 100 + streak * 60];
        });
        // green algae creeping in from the wall and the edges
        field(c, 0, yT, W, yB, 2, (x, y) => {
          const v = nz.fbm(x * 0.03 + 70, y * 0.03, 4) + (y < yT + 50 ? 0.15 : 0) + (x < 60 || x > 300 ? 0.1 : 0);
          return [84, 108, 50, Math.max(0, v - 0.52) * 560];
        });
        // dirty water has run down the slope
        for (let i = 0; i < 70; i++) {
          const k = r() * N, y = yT + r() * (yF - yT) * 0.7, l = 40 + r() * 110;
          c.strokeStyle = `rgba(55,45,32,${0.15 + r() * 0.2})`; c.lineWidth = 1 + r() * 2.5;
          c.beginPath(); c.moveTo(at(k, y), y); c.lineTo(at(k, Math.min(yF, y + l)), Math.min(yF, y + l)); c.stroke();
        }
        // tide marks along the scallops
        c.strokeStyle = 'rgba(60,48,32,0.35)'; c.lineWidth = 2;
        for (let k = 0; k < N; k++) { c.beginPath(); c.arc(xF0 + sw * (k + 0.5), yV - 3, sw / 2 - 3, 0.2, Math.PI - 0.2); c.stroke(); }
        for (let i = 0; i < 6; i++) dropping(c, r, 40 + r() * 280, yT + 20 + r() * 200, 4 + r() * 3);
        for (let i = 0; i < 26; i++) { const y = yF - Math.pow(r(), 2) * (yF - yT); deadLeaf(c, r, at(r() * N, y), y, 6 + r() * 5); }
        cobweb(c, xT0, yT, 0, 60);
        cobweb(c, xT1, yT, Math.PI / 2, 50);
      },
      top(c) {
        // the roller box along the wall
        c.fillStyle = '#29332f'; c.beginPath(); c.roundRect(xT0 - 12, yT - 16, xT1 - xT0 + 24, 18, 5); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(xT0 - 8, yT - 14, xT1 - xT0 + 16, 3);
        // arms from the wall out to the front rail
        c.strokeStyle = '#2b2b30'; c.lineWidth = 3; c.lineCap = 'round';
        c.beginPath(); c.moveTo(xT0 - 4, yT + 4); c.lineTo(xF0 + 2, yF); c.moveTo(xT1 + 4, yT + 4); c.lineTo(xF1 - 2, yF); c.stroke();
        // the front rail with brass ends
        c.fillStyle = '#2b2b30'; c.beginPath(); c.roundRect(xF0 - 6, yF - 3, xF1 - xF0 + 12, 6, 3); c.fill();
        c.fillStyle = '#c9a24a'; c.beginPath(); c.arc(xF0 - 6, yF, 5, 0, 7); c.arc(xF1 + 6, yF, 5, 0, 7); c.fill();
        c.fillStyle = '#f2d88a'; c.beginPath(); c.arc(xF0 - 7.5, yF - 1.5, 1.8, 0, 7); c.arc(xF1 + 4.5, yF - 1.5, 1.8, 0, 7); c.fill();
      },
    };
  }

  // ------------------------------------------------------------------- SIGN
  // The name board over the café front, painted in the player's colour.
  // Gold-leaf letters with a dark outline read on every colour in the paint
  // box, and they sit above the paint so the brush never covers them.
  function sign(S) {
    const { r, nz, bleed, opts } = S;
    // the café's sign by default; other places bring their own words, a paw
    // instead of the cup, and a barn wall instead of the café front
    const title = opts.title || 'CAFÉ', sub = opts.sub || '· COFFEE & CAKE ·';
    // the canal's sign (the one with the fish) hangs on the lock-keeper's cottage
    const lock = opts.lock || opts.icon === 'fish';
    const ghostTitle = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const ox0 = 20, oy0 = 160, ox1 = 340, oy1 = 392, f = 16;
    const ix0 = ox0 + f, iy0 = oy0 + f, ix1 = ox1 - f, iy1 = oy1 - f, cx = (ix0 + ix1) / 2;
    const region = new Path2D();
    region.rect(ix0, iy0, ix1 - ix0, iy1 - iy0);
    const seams = [iy0 + (iy1 - iy0) / 3, iy0 + ((iy1 - iy0) * 2) / 3];
    const FONT = 'Georgia, "Times New Roman", serif';
    function gold(c, y0, y1) {
      const g = c.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, '#fff3c0'); g.addColorStop(0.45, '#e9bd55'); g.addColorStop(0.56, '#b8822a'); g.addColorStop(1, '#f2d37e');
      return g;
    }
    function letters(c, text, y, size, ghost) {
      c.save();
      c.font = `bold ${size}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
      if (ghost) { c.fillStyle = ghost; c.fillText(text, cx, y); c.restore(); return; }
      c.lineJoin = 'round';
      c.fillStyle = 'rgba(30,20,10,0.5)'; c.fillText(text, cx + size * 0.05, y + size * 0.06);
      c.strokeStyle = '#3a2814'; c.lineWidth = Math.max(2.5, size * 0.09); c.strokeText(text, cx, y);
      c.fillStyle = gold(c, y - size * 0.45, y + size * 0.45); c.fillText(text, cx, y);
      c.restore();
    }
    // shrink a word until it fits the board with a margin
    function fit(c, text, size) {
      c.save(); c.font = `bold ${size}px ${FONT}`; const w = c.measureText(text).width; c.restore();
      const max = ix1 - ix0 - 32;
      return w > max ? Math.floor((size * max) / w) : size;
    }
    function pawIcon(c, x, y, s) {
      c.save(); c.translate(x, y); c.lineJoin = 'round';
      const shape = () => {
        c.beginPath(); c.ellipse(0, s * 0.35, s * 0.62, s * 0.5, 0, 0, 7);
        for (const [dx, dy] of [[-0.66, -0.28], [-0.24, -0.66], [0.24, -0.66], [0.66, -0.28]]) { c.moveTo(dx * s + s * 0.24, dy * s); c.ellipse(dx * s, dy * s, s * 0.24, s * 0.3, 0, 0, 7); }
      };
      c.strokeStyle = '#3a2814'; c.lineWidth = 5; shape(); c.stroke();
      c.fillStyle = gold(c, -s, s); shape(); c.fill();
      c.restore();
    }
    function cup(c, x, y, s) {
      c.save(); c.translate(x, y); c.lineJoin = 'round'; c.lineCap = 'round';
      const body = () => { c.beginPath(); c.moveTo(-s, -s * 0.35); c.lineTo(s, -s * 0.35); c.quadraticCurveTo(s * 0.95, s * 0.75, 0, s * 0.75); c.quadraticCurveTo(-s * 0.95, s * 0.75, -s, -s * 0.35); c.closePath(); };
      c.strokeStyle = '#3a2814'; c.lineWidth = 5;
      body(); c.stroke();
      c.beginPath(); c.arc(s * 1.05, s * 0.05, s * 0.32, -1.3, 1.6); c.stroke();
      c.beginPath(); c.ellipse(0, s * 0.85, s * 1.35, s * 0.22, 0, 0, 7); c.stroke();
      for (const dx of [-s * 0.35, s * 0.3]) { c.beginPath(); c.moveTo(dx, -s * 0.6); c.bezierCurveTo(dx - s * 0.3, -s * 0.9, dx + s * 0.3, -s * 1.1, dx, -s * 1.45); c.stroke(); }
      c.strokeStyle = c.fillStyle = gold(c, -s * 1.4, s);
      c.lineWidth = 2.2;
      body(); c.fill();
      c.beginPath(); c.arc(s * 1.05, s * 0.05, s * 0.32, -1.3, 1.6); c.stroke();
      c.beginPath(); c.ellipse(0, s * 0.85, s * 1.35, s * 0.22, 0, 0, 7); c.fill();
      for (const dx of [-s * 0.35, s * 0.3]) { c.beginPath(); c.moveTo(dx, -s * 0.6); c.bezierCurveTo(dx - s * 0.3, -s * 0.9, dx + s * 0.3, -s * 1.1, dx, -s * 1.45); c.stroke(); }
      c.restore();
    }
    function fishIcon(c, x, y, s) {
      c.save(); c.translate(x, y); c.lineJoin = 'round';
      const shape = () => {
        c.beginPath(); c.moveTo(-s * 1.1, 0);
        c.quadraticCurveTo(-s * 0.2, -s * 0.85, s * 0.72, -s * 0.1);
        c.lineTo(s * 1.25, -s * 0.55); c.lineTo(s * 1.12, 0); c.lineTo(s * 1.25, s * 0.55); c.lineTo(s * 0.72, s * 0.1);
        c.quadraticCurveTo(-s * 0.2, s * 0.85, -s * 1.1, 0); c.closePath();
      };
      c.strokeStyle = '#3a2814'; c.lineWidth = 5; shape(); c.stroke();
      c.fillStyle = gold(c, -s, s); shape(); c.fill();
      c.fillStyle = '#3a2814'; c.beginPath(); c.arc(-s * 0.62, -s * 0.12, s * 0.12, 0, 7); c.fill();
      c.strokeStyle = '#3a2814'; c.lineWidth = 1.6;
      c.beginPath(); c.arc(-s * 0.32, 0, s * 0.34, -1.1, 1.1); c.stroke();
      for (const dx of [0.05, 0.3]) { c.beginPath(); c.arc(s * dx, 0, s * 0.22, -0.9, 0.9); c.stroke(); }
      c.restore();
    }
    function bookIcon(c, x, y, s) {
      c.save(); c.translate(x, y); c.lineJoin = 'round';
      const shape = () => {
        c.beginPath(); c.moveTo(0, -s * 0.55);
        c.quadraticCurveTo(-s * 0.6, -s * 0.85, -s * 1.3, -s * 0.6); c.lineTo(-s * 1.3, s * 0.6);
        c.quadraticCurveTo(-s * 0.6, s * 0.35, 0, s * 0.65);
        c.quadraticCurveTo(s * 0.6, s * 0.35, s * 1.3, s * 0.6); c.lineTo(s * 1.3, -s * 0.6);
        c.quadraticCurveTo(s * 0.6, -s * 0.85, 0, -s * 0.55); c.closePath();
      };
      c.strokeStyle = '#3a2814'; c.lineWidth = 5; shape(); c.stroke();
      c.fillStyle = gold(c, -s, s); shape(); c.fill();
      // the spine and a few lines of print on each page
      c.strokeStyle = '#3a2814'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(0, -s * 0.5); c.lineTo(0, s * 0.6); c.stroke();
      c.lineWidth = 1.2;
      for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { const yy = -s * 0.22 + k * s * 0.24; c.beginPath(); c.moveTo(sd * s * 0.25, yy); c.quadraticCurveTo(sd * s * 0.7, yy - s * 0.12, sd * s * 1.08, yy - s * 0.02); c.stroke(); }
      c.restore();
    }
    // a little vase with a fat belly, a neck and a band of pattern
    function potIcon(c, x, y, s) {
      c.save(); c.translate(x, y); c.lineJoin = 'round';
      const shape = () => {
        c.beginPath(); c.moveTo(-s * 0.42, -s * 1.05); c.lineTo(s * 0.42, -s * 1.05);
        c.quadraticCurveTo(s * 0.26, -s * 0.72, s * 0.32, -s * 0.5);
        c.quadraticCurveTo(s * 1.15, -s * 0.22, s * 0.62, s * 0.62);
        c.lineTo(s * 0.4, s * 0.95); c.lineTo(-s * 0.4, s * 0.95); c.lineTo(-s * 0.62, s * 0.62);
        c.quadraticCurveTo(-s * 1.15, -s * 0.22, -s * 0.32, -s * 0.5);
        c.quadraticCurveTo(-s * 0.26, -s * 0.72, -s * 0.42, -s * 1.05); c.closePath();
      };
      c.strokeStyle = '#3a2814'; c.lineWidth = 5; shape(); c.stroke();
      c.fillStyle = gold(c, -s, s); shape(); c.fill();
      c.strokeStyle = '#3a2814'; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(-s * 0.72, -s * 0.05); c.quadraticCurveTo(0, s * 0.12, s * 0.72, -s * 0.05); c.stroke();
      c.beginPath(); c.moveTo(-s * 0.66, s * 0.3); c.quadraticCurveTo(0, s * 0.47, s * 0.66, s * 0.3); c.stroke();
      for (const dx of [-0.42, -0.14, 0.14, 0.42]) { c.beginPath(); c.arc(dx * s, s * 0.16, s * 0.07, 0, 7); c.stroke(); }
      c.restore();
    }
    // a little steam engine puffing along, side on
    function trainIcon(c, x, y, s) {
      c.save(); c.translate(x, y); c.lineJoin = 'round';
      const shape = () => {
        c.beginPath();
        c.moveTo(-s * 1.35, s * 0.45); c.lineTo(-s * 1.35, -s * 0.12);
        c.lineTo(-s * 0.95, -s * 0.12); c.lineTo(-s * 0.95, -s * 0.55); c.lineTo(-s * 0.72, -s * 0.55); c.lineTo(-s * 0.72, -s * 0.12);
        c.lineTo(s * 0.2, -s * 0.12); c.lineTo(s * 0.2, -s * 0.85); c.lineTo(s * 1.3, -s * 0.85); c.lineTo(s * 1.3, s * 0.45); c.closePath();
        c.moveTo(-s * 1.12, -s * 0.9); c.lineTo(-s * 0.55, -s * 0.9); c.lineTo(-s * 0.72, -s * 0.55); c.lineTo(-s * 0.95, -s * 0.55); c.closePath();
      };
      const wheels = () => { c.beginPath(); for (const dx of [-0.85, -0.15, 0.75]) { const rr = dx > 0.5 ? 0.42 : 0.32; c.moveTo(dx * s + rr * s, s * 0.55); c.arc(dx * s, s * 0.55, rr * s, 0, 7); } };
      c.strokeStyle = '#3a2814'; c.lineWidth = 5; shape(); c.stroke(); wheels(); c.stroke();
      c.fillStyle = gold(c, -s, s); shape(); c.fill(); wheels(); c.fill();
      c.fillStyle = '#3a2814'; c.beginPath(); c.roundRect(s * 0.42, -s * 0.66, s * 0.62, s * 0.4, 2); c.fill();
      c.strokeStyle = '#3a2814'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-s * 1.0, s * 0.55); c.lineTo(s * 0.75, s * 0.55); c.stroke();
      for (const dx of [-0.85, -0.15, 0.75]) { c.fillStyle = '#3a2814'; c.beginPath(); c.arc(dx * s, s * 0.55, s * 0.08, 0, 7); c.fill(); }
      // puffs of steam
      c.strokeStyle = '#3a2814'; c.lineWidth = 3; c.fillStyle = gold(c, -s * 1.6, -s);
      for (const [dx, dy, rr] of [[-0.55, -1.2, 0.2], [-0.15, -1.42, 0.26], [0.32, -1.5, 0.2]]) { c.beginPath(); c.arc(dx * s, dy * s, rr * s, 0, 7); c.stroke(); c.fill(); }
      c.restore();
    }
    // a big four-holed button, sewn on with a cross of thread
    function buttonIcon(c, x, y, s) {
      c.save(); c.translate(x, y);
      c.strokeStyle = '#3a2814'; c.lineWidth = 5; c.beginPath(); c.arc(0, 0, s, 0, 7); c.stroke();
      c.fillStyle = gold(c, -s, s); c.beginPath(); c.arc(0, 0, s, 0, 7); c.fill();
      c.strokeStyle = '#3a2814'; c.lineWidth = 1.6; c.beginPath(); c.arc(0, 0, s * 0.72, 0, 7); c.stroke();
      const h = s * 0.28;
      c.lineWidth = 2.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(-h, -h); c.lineTo(h, h); c.moveTo(h, -h); c.lineTo(-h, h); c.stroke();
      c.fillStyle = '#3a2814'; for (const [dx, dy] of [[-h, -h], [h, -h], [-h, h], [h, h]]) { c.beginPath(); c.arc(dx, dy, s * 0.13, 0, 7); c.fill(); }
      c.restore();
    }
    // an old key lying on its side: a ring bow, a collar, the shaft and its bit
    function keyIcon(c, x, y, s) {
      c.save(); c.translate(x, y); c.lineJoin = 'round';
      const shape = () => {
        c.beginPath();
        c.arc(-s * 0.85, 0, s * 0.52, 0, Math.PI * 2);
        c.moveTo(-s * 0.85 + s * 0.24, 0); c.arc(-s * 0.85, 0, s * 0.24, 0, Math.PI * 2, true);
        c.rect(-s * 0.36, -s * 0.13, s * 1.72, s * 0.26);
        c.rect(-s * 0.3, -s * 0.24, s * 0.14, s * 0.48);
        c.rect(s * 0.92, s * 0.1, s * 0.16, s * 0.5); c.rect(s * 1.16, s * 0.1, s * 0.2, s * 0.36);
      };
      c.strokeStyle = '#3a2814'; c.lineWidth = 5; shape(); c.stroke();
      c.fillStyle = gold(c, -s, s); shape(); c.fill();
      c.strokeStyle = '#3a2814'; c.lineWidth = 1.4; c.beginPath(); c.arc(-s * 0.85, 0, s * 0.38, 0.4, 2.7); c.stroke();
      c.restore();
    }
    // a lucky horseshoe, the open end up, its nail holes picked out
    function horseshoeIcon(c, x, y, s) {
      c.save(); c.translate(x, y); c.lineJoin = 'round';
      const shape = () => {
        c.beginPath(); c.moveTo(-s * 0.66, -s * 1.02);
        c.bezierCurveTo(-s * 1.4, -s * 0.2, -s * 1.16, s * 1.04, 0, s * 1.04); c.bezierCurveTo(s * 1.16, s * 1.04, s * 1.4, -s * 0.2, s * 0.66, -s * 1.02);
        c.lineTo(s * 0.26, -s * 1.02);
        c.bezierCurveTo(s * 0.76, -s * 0.24, s * 0.56, s * 0.46, 0, s * 0.46); c.bezierCurveTo(-s * 0.56, s * 0.46, -s * 0.76, -s * 0.24, -s * 0.26, -s * 1.02);
        c.closePath();
      };
      c.strokeStyle = '#3a2814'; c.lineWidth = 5; shape(); c.stroke();
      c.fillStyle = gold(c, -s, s); shape(); c.fill();
      c.fillStyle = '#3a2814';
      for (const [dx, dy] of [[-0.66, -0.6], [-0.8, -0.18], [-0.68, 0.3], [-0.34, 0.68], [0.66, -0.6], [0.8, -0.18], [0.68, 0.3], [0.34, 0.68]]) { c.beginPath(); c.arc(dx * s, dy * s, s * 0.075, 0, 7); c.fill(); }
      c.restore();
    }
    // a painter's palette with a thumb hole and five dabs, a brush across it
    function paletteIcon(c, x, y, s) {
      c.save(); c.translate(x, y); c.lineJoin = 'round';
      const shape = () => {
        c.beginPath(); c.moveTo(-s * 1.15, s * 0.1);
        c.bezierCurveTo(-s * 1.2, -s * 0.8, s * 0.2, -s * 1.1, s * 0.92, -s * 0.72);
        c.bezierCurveTo(s * 1.4, -s * 0.42, s * 1.36, s * 0.2, s * 0.82, s * 0.2);
        c.bezierCurveTo(s * 0.36, s * 0.2, s * 0.4, s * 0.8, 0, s * 0.92);
        c.bezierCurveTo(-s * 0.6, s * 1.02, -s * 1.1, s * 0.7, -s * 1.15, s * 0.1); c.closePath();
        c.moveTo(s * 0.46, -s * 0.28); c.arc(s * 0.3, -s * 0.28, s * 0.16, 0, 7);
      };
      c.strokeStyle = '#3a2814'; c.lineWidth = 5; shape(); c.stroke();
      c.fillStyle = gold(c, -s, s); shape(); c.fill('evenodd');
      c.strokeStyle = '#3a2814'; c.lineWidth = 1.4;
      for (const [dx, dy] of [[-0.72, 0.06], [-0.5, -0.46], [-0.02, -0.68], [0.5, -0.74], [-0.28, 0.52]]) { c.beginPath(); c.arc(dx * s, dy * s, s * 0.17, 0, 7); c.stroke(); }
      c.restore();
    }
    // a faceted five-pointed star, with three small ones around it
    function starIcon(c, x, y, s) {
      c.save(); c.translate(x, y); c.lineJoin = 'round';
      const shape = (sx, sy, q) => {
        c.beginPath();
        for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, d = k % 2 ? q * 0.42 : q; c.lineTo(sx + Math.cos(a) * d, sy + Math.sin(a) * d); }
        c.closePath();
      };
      for (const [dx, dy, q] of [[-s * 1.86, -s * 0.46, s * 0.5], [s * 1.84, -s * 0.74, s * 0.42], [s * 1.66, s * 0.58, s * 0.34], [0, s * 0.06, s * 1.34]]) {
        c.strokeStyle = '#3a2814'; c.lineWidth = q > s ? 5 : 3.6; shape(dx, dy, q); c.stroke();
        c.fillStyle = gold(c, dy - q, dy + q); shape(dx, dy, q); c.fill();
      }
      // each point cut in two, one side in shadow
      c.fillStyle = 'rgba(110,70,20,0.3)';
      for (let k = 0; k < 5; k++) {
        const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5, b = a + Math.PI / 5, q = s * 1.34, cy = s * 0.06;
        c.beginPath(); c.moveTo(0, cy); c.lineTo(Math.cos(a) * q, cy + Math.sin(a) * q); c.lineTo(Math.cos(b) * q * 0.42, cy + Math.sin(b) * q * 0.42); c.closePath(); c.fill();
      }
      c.restore();
    }
    // a stylised breaking wave: the crest curling over in bands, two swells below it
    // a theatre mask: a rounded shield with arched eyes and a wide smile
    function maskIcon(c, x, y, s) {
      c.save(); c.translate(x, y); c.lineJoin = 'round'; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-s * 1.12, -s * 0.92);
      c.quadraticCurveTo(0, -s * 1.3, s * 1.12, -s * 0.92);
      c.bezierCurveTo(s * 1.24, s * 0.2, s * 0.72, s * 1.12, 0, s * 1.24);
      c.bezierCurveTo(-s * 0.72, s * 1.12, -s * 1.24, s * 0.2, -s * 1.12, -s * 0.92);
      c.closePath();
      c.fillStyle = '#f6ecd6'; c.fill(); c.strokeStyle = '#d8ae4e'; c.lineWidth = s * 0.16; c.stroke();
      c.fillStyle = '#2b2233';
      for (const k of [-1, 1]) { c.beginPath(); c.moveTo(k * s * 0.72, -s * 0.2); c.quadraticCurveTo(k * s * 0.44, -s * 0.74, k * s * 0.16, -s * 0.2); c.quadraticCurveTo(k * s * 0.44, -s * 0.36, k * s * 0.72, -s * 0.2); c.closePath(); c.fill(); }
      c.beginPath(); c.moveTo(-s * 0.62, s * 0.28); c.quadraticCurveTo(0, s * 0.42, s * 0.62, s * 0.28); c.quadraticCurveTo(s * 0.34, s * 1.0, 0, s * 0.98); c.quadraticCurveTo(-s * 0.34, s * 1.0, -s * 0.62, s * 0.28); c.closePath();
      c.fillStyle = '#8c2f39'; c.fill();
      c.restore();
    }
    function waveIcon(c, x, y, s) {
      c.save(); c.translate(x, y); c.lineJoin = 'round'; c.lineCap = 'round';
      const shape = () => {
        c.beginPath(); c.moveTo(-s * 1.62, s * 0.62);
        c.bezierCurveTo(-s * 1.2, s * 0.1, -s * 0.9, -s * 1.12, s * 0.28, -s * 1.12);
        c.bezierCurveTo(s * 1.04, -s * 1.12, s * 1.56, -s * 0.5, s * 1.3, 0);
        c.bezierCurveTo(s * 1.14, s * 0.3, s * 0.72, s * 0.3, s * 0.6, s * 0.02);
        c.bezierCurveTo(s * 0.92, s * 0.08, s * 1.04, -s * 0.3, s * 0.72, -s * 0.46);
        c.bezierCurveTo(s * 0.2, -s * 0.72, -s * 0.12, -s * 0.1, s * 0.24, s * 0.62);
        c.closePath();
      };
      c.strokeStyle = '#3a2814'; c.lineWidth = 5; shape(); c.stroke();
      c.fillStyle = gold(c, -s * 1.1, s * 0.7); shape(); c.fill();
      // the speed lines of the crest, running up the back of the wave
      c.strokeStyle = '#3a2814'; c.lineWidth = 1.8;
      c.beginPath(); c.moveTo(-s * 1.02, s * 0.42); c.bezierCurveTo(-s * 0.72, -s * 0.2, -s * 0.46, -s * 0.8, s * 0.34, -s * 0.84); c.stroke();
      c.beginPath(); c.moveTo(-s * 0.54, s * 0.42); c.bezierCurveTo(-s * 0.4, -s * 0.02, -s * 0.18, -s * 0.5, s * 0.28, -s * 0.56); c.stroke();
      // the two swells, gold on a dark edge
      for (const [dy, a] of [[s * 0.84, 1.8], [s * 1.26, 1.5]]) {
        const swell = () => { c.beginPath(); c.moveTo(-s * a, dy); for (let k = 0; k < 4; k++) { const xa = -s * a + ((k + 0.5) * s * a * 2) / 4, xb = -s * a + ((k + 1) * s * a * 2) / 4; c.quadraticCurveTo(xa, dy + (k % 2 ? s * 0.3 : -s * 0.3), xb, dy); } };
        c.strokeStyle = '#3a2814'; c.lineWidth = 5.4; swell(); c.stroke();
        c.strokeStyle = gold(c, dy - s * 0.3, dy + s * 0.3); c.lineWidth = 2.8; swell(); c.stroke();
      }
      c.restore();
    }
    // a long title of two words goes on two lines rather than shrinking away
    function titleLines(c, text) {
      const one = fit(c, text, 86), sp = text.indexOf(' ');
      if (sp < 0 || one >= 44) return { icon: iy0 + 46, lines: [[text, iy0 + 112, one]] };
      let best = sp;
      for (let i = sp; i >= 0 && i < text.length; i = text.indexOf(' ', i + 1)) if (Math.abs(i - text.length / 2) < Math.abs(best - text.length / 2)) best = i;
      const a = text.slice(0, best), b = text.slice(best + 1), size = Math.min(fit(c, a, 60), fit(c, b, 60));
      return { icon: iy0 + 38, lines: [[a, iy0 + 86, size], [b, iy0 + 128, size]] };
    }
    // sun-bleached grey planks running along the board
    function oldWood(c) {
      const g = ramp(['#746d66', '#88817a', '#9b948a', '#aea79c']);
      field(c, ix0, iy0, ix1, iy1, 1.5, (x, y) => g(nz.fbm(x * 0.008, y * 0.09, 4) * 0.85 + nz.n2(x * 0.05, y * 0.7) * 0.15));
      for (let i = 0; i < 160; i++) {
        const x = ix0 + r() * (ix1 - ix0), y = iy0 + r() * (iy1 - iy0), l = 30 + r() * 90;
        c.strokeStyle = r() < 0.7 ? 'rgba(55,48,40,0.35)' : 'rgba(255,255,255,0.16)'; c.lineWidth = 0.8;
        c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + l / 2, y + (r() - 0.5) * 4, x + l, y + (r() - 0.5) * 3); c.stroke();
      }
    }
    return {
      family: 'paint', particle: 'paint', region,
      tough: (x, y) => (x < ix0 + 12 || x > ix1 - 12 || y < iy0 + 12 || y > iy1 - 12 ? 1.35 : 1),
      decor(c) {
        if (lock) {
          // the lock-keeper's whitewashed wall with a window and geraniums,
          // and the lock below: grass, the black and white beam, dark water
          const { x0, y0, x1, y1 } = bleed;
          field(c, x0, y0, x1, 446, 3, (x, y) => { const v = nz.fbm(x * 0.02, y * 0.03, 3); return [240 - v * 22, 236 - v * 22, 226 - v * 24]; });
          c.fillStyle = '#f7f3ea'; c.fillRect(128, y0, 104, 102 - y0);
          const gl = c.createLinearGradient(0, y0, 0, 92); gl.addColorStop(0, '#9ec9de'); gl.addColorStop(1, '#d8ecf2');
          c.fillStyle = gl; c.fillRect(136, y0, 88, 92 - y0);
          c.fillStyle = '#f7f3ea'; c.fillRect(177, y0, 6, 92 - y0); c.fillRect(136, 44, 88, 5);
          c.fillStyle = '#4b4a52'; c.fillRect(120, 96, 120, 10);
          for (let i = 0; i < 7; i++) {
            const x = 140 + i * 13;
            c.fillStyle = '#4f8a3a'; c.beginPath(); c.ellipse(x, 92, 7, 5, r(), 0, 7); c.fill();
            c.fillStyle = U.pick(r, ['#e0485a', '#f06a7e', '#d93b4f']); c.beginPath(); c.arc(x + (r() - 0.5) * 6, 86 - r() * 6, 3.6, 0, 7); c.fill();
          }
          c.fillStyle = '#6d9a58'; c.fillRect(x0, 440, x1 - x0, 34);
          const wg = c.createLinearGradient(0, 474, 0, y1); wg.addColorStop(0, '#2c463b'); wg.addColorStop(1, '#436452');
          c.fillStyle = wg; c.fillRect(x0, 474, x1 - x0, y1 - 474);
          c.fillStyle = 'rgba(214,234,226,0.35)'; for (let i = 0; i < 24; i++) c.fillRect(x0 + r() * (x1 - x0), 480 + r() * Math.max(1, y1 - 486), 8 + r() * 20, 1.2);
          c.fillStyle = '#1f2124'; c.fillRect(x0, 452, x1 - x0, 16);
          c.fillStyle = '#f4f1ea'; c.fillRect(x1 - 70, 452, 70, 16);
          c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(x0, 452, x1 - x0, 3);
          const board = new Path2D(); board.rect(ox0, oy0, ox1 - ox0, oy1 - oy0);
          softShadow(c, board, 12, 0.45, 4, 7);
          return;
        }
        if (opts.icon === 'pot') {
          // the pottery's brick barn, a loft door above, lavender and stacked pots below
          barnBricks(c, r, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1);
          c.fillStyle = '#6b4a32'; c.fillRect(132, bleed.y0, 96, 110 - bleed.y0);
          c.fillStyle = '#9cc5a1'; c.fillRect(138, bleed.y0, 84, 104 - bleed.y0);
          for (let x = 150; x < 222; x += 14) { c.fillStyle = 'rgba(40,60,40,0.3)'; c.fillRect(x, bleed.y0, 1.6, 104 - bleed.y0); }
          c.strokeStyle = '#2f2c2a'; c.lineWidth = 6; c.beginPath(); c.moveTo(138, 30); c.lineTo(196, 30); c.moveTo(138, 80); c.lineTo(196, 80); c.stroke();
          c.fillStyle = '#6b4a32'; c.fillRect(bleed.x0, 410, bleed.x1 - bleed.x0, 8);
          for (let i = 0; i < 40; i++) {
            const x = bleed.x0 + r() * (bleed.x1 - bleed.x0), len = 30 + r() * 40, a = -Math.PI / 2 + (r() - 0.5) * 0.7, ex = x + Math.cos(a) * len, ey = 470 + Math.sin(a) * len;
            c.strokeStyle = '#7d9a6a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x, 470); c.lineTo(ex, ey); c.stroke();
            for (let k = 0; k < 5; k++) { c.fillStyle = U.pick(r, ['#9a7fc8', '#8a6fbd', '#b39ad8']); c.beginPath(); c.ellipse(ex - Math.cos(a) * k * 3.4, ey - Math.sin(a) * k * 3.4, 2.4, 3.2, a, 0, 7); c.fill(); }
          }
          c.fillStyle = '#8f8576'; c.fillRect(bleed.x0, 470, bleed.x1 - bleed.x0, bleed.y1 - 470);
          for (let y = 472; y < bleed.y1; y += 12) for (let x = bleed.x0 - (y % 24 ? 8 : 0); x < bleed.x1; x += 16) { c.fillStyle = U.pick(r, ['#a49a8a', '#b3a998', '#978d7e', '#bdb3a2']); c.beginPath(); c.ellipse(x + 8, y + 5, 7, 5, 0, 0, 7); c.fill(); }
          for (const [x, n] of [[40, 3], [318, 4]]) for (let k = 0; k < n; k++) {
            const y = 540 - k * 12;
            c.fillStyle = k % 2 ? '#c8763f' : '#d08a5e'; c.beginPath(); c.moveTo(x - 26, y - 12); c.lineTo(x + 26, y - 12); c.lineTo(x + 20, y + 10); c.lineTo(x - 20, y + 10); c.closePath(); c.fill();
            c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(x - 26, y - 12, 52, 3);
          }
          const board = new Path2D(); board.rect(ox0, oy0, ox1 - ox0, oy1 - oy0);
          softShadow(c, board, 12, 0.45, 4, 7);
          return;
        }
        if (opts.icon === 'train') {
          // the station's cream weatherboards, two hanging baskets, the platform and the line
          weatherboards(c, r, nz, bleed.x0, bleed.y0, bleed.x1, 430);
          c.fillStyle = '#8e3b3f'; c.fillRect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, 40 - bleed.y0);
          c.fillStyle = '#efe6d2'; for (let x = Math.floor(bleed.x0 / 24) * 24; x < bleed.x1; x += 24) { c.beginPath(); c.moveTo(x, 40); c.lineTo(x + 24, 40); c.lineTo(x + 12, 54); c.closePath(); c.fill(); }
          c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(bleed.x0, 40, bleed.x1 - bleed.x0, 3);
          for (const bx of [44, 316]) {
            c.strokeStyle = '#2b2b30'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(bx, 54); c.lineTo(bx - 14, 92); c.moveTo(bx, 54); c.lineTo(bx + 14, 92); c.stroke();
            c.fillStyle = '#5b4a33'; c.beginPath(); c.ellipse(bx, 96, 20, 10, 0, 0, Math.PI); c.fill();
            for (let k = 0; k < 12; k++) { c.fillStyle = U.pick(r, ['#4f8a3a', '#62a042']); c.beginPath(); c.ellipse(bx + (r() - 0.5) * 40, 94 + r() * 22, 5, 2.6, r() * 3, 0, 7); c.fill(); }
            for (let k = 0; k < 9; k++) { c.fillStyle = U.pick(r, ['#e0485a', '#f7f3ea', '#bba9df', '#f06a7e']); c.beginPath(); c.arc(bx + (r() - 0.5) * 36, 90 + r() * 24, 3, 0, 7); c.fill(); }
          }
          const pg = ramp(['#a39b8e', '#b3ab9e', '#c2bbaf']);
          field(c, bleed.x0, 430, bleed.x1, 520, 2, (x, y) => pg(nz.fbm(x * 0.04, y * 0.04, 3)));
          for (let x = Math.floor(bleed.x0 / 48) * 48; x < bleed.x1; x += 48) { c.fillStyle = 'rgba(70,65,55,0.35)'; c.fillRect(x, 430, 1.5, 90); }
          c.fillStyle = 'rgba(70,65,55,0.35)'; c.fillRect(bleed.x0, 474, bleed.x1 - bleed.x0, 1.5);
          c.fillStyle = '#f4f1ea'; c.fillRect(bleed.x0, 510, bleed.x1 - bleed.x0, 10);
          c.fillStyle = '#6f675c'; c.fillRect(bleed.x0, 520, bleed.x1 - bleed.x0, bleed.y1 - 520);
          c.fillStyle = '#7d8590'; c.fillRect(bleed.x0, 556, bleed.x1 - bleed.x0, 6); c.fillStyle = '#c9cfd4'; c.fillRect(bleed.x0, 556, bleed.x1 - bleed.x0, 2);
          const board = new Path2D(); board.rect(ox0, oy0, ox1 - ox0, oy1 - oy0);
          softShadow(c, board, 12, 0.45, 4, 7);
          return;
        }
        if (opts.icon === 'palette') {
          // the loft's white boards under a cobalt eave, a little window above the
          // board, and poppies along the foot of the wall on the cobbles
          limewash(c, r, nz, bleed.x0, bleed.y0, bleed.x1, 480);
          c.fillStyle = '#3f6fb0'; c.fillRect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, 26 - bleed.y0);
          c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(bleed.x0, 26, bleed.x1 - bleed.x0, 5);
          c.fillStyle = '#3f6fb0'; c.fillRect(130, 48, 100, 90);
          const gl = c.createLinearGradient(0, 56, 0, 130); gl.addColorStop(0, '#9ec9de'); gl.addColorStop(1, '#d8ecf2');
          c.fillStyle = gl; c.fillRect(138, 56, 84, 74);
          c.fillStyle = '#3f6fb0'; c.fillRect(177, 56, 6, 74); c.fillRect(138, 90, 84, 5);
          c.fillStyle = '#8f8576'; c.fillRect(bleed.x0, 480, bleed.x1 - bleed.x0, bleed.y1 - 480);
          for (let y = 486; y < bleed.y1 + 8; y += 13) for (let x = bleed.x0 - (y % 26 ? 8 : 0); x < bleed.x1 + 10; x += 19) { c.fillStyle = U.pick(r, ['#a49a8a', '#b3a998', '#978d7e', '#bdb3a2']); c.beginPath(); c.ellipse(x, y, 8.4, 5.4, 0, 0, 7); c.fill(); }
          for (let i = 0; i < 34; i++) {
            const x = bleed.x0 + r() * (bleed.x1 - bleed.x0), h = 26 + r() * 46, fx = x + (r() - 0.5) * 10, fy = 482 - h;
            c.strokeStyle = '#5d8a48'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, 484); c.quadraticCurveTo(x + (r() - 0.5) * 8, 484 - h / 2, fx, fy); c.stroke();
            c.fillStyle = U.pick(r, ['#e2392f', '#ef5a48', '#d3362a']); c.beginPath(); c.arc(fx, fy, 6 + r() * 3, 0, 7); c.fill();
            c.fillStyle = '#2b2030'; c.beginPath(); c.arc(fx, fy, 2, 0, 7); c.fill();
          }
          const board = new Path2D(); board.rect(ox0, oy0, ox1 - ox0, oy1 - oy0);
          softShadow(c, board, 12, 0.45, 4, 7);
          return;
        }
        if (opts.icon === 'key') {
          // the curiosity shop's deep green shopfront: old brick and a sash window above,
          // fluted pilasters, and the top of the bow window glowing below the board
          bricks(c, r, nz, bleed.x0, bleed.y0, bleed.x1, 150);
          c.fillStyle = '#efe7d8'; c.fillRect(118, bleed.y0, 124, 100 - bleed.y0);
          const gl = c.createLinearGradient(0, bleed.y0, 0, 88); gl.addColorStop(0, '#9ec9de'); gl.addColorStop(1, '#d8ecf2');
          c.fillStyle = gl; c.fillRect(128, bleed.y0, 104, 88 - bleed.y0);
          c.fillStyle = '#efe7d8'; c.fillRect(177, bleed.y0, 6, 88 - bleed.y0); c.fillRect(128, 40, 104, 5);
          c.fillStyle = '#2f5546'; c.fillRect(bleed.x0, 140, bleed.x1 - bleed.x0, bleed.y1 - 140);
          c.fillStyle = '#c9a24a'; c.fillRect(bleed.x0, 140, bleed.x1 - bleed.x0, 4); c.fillRect(bleed.x0, 404, bleed.x1 - bleed.x0, 4);
          for (const [a, b] of [[bleed.x0, 16], [344, bleed.x1]]) for (let x = a + 3; x < b - 2; x += 6) { c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x, 144, 2, bleed.y1 - 144); }
          c.fillStyle = '#ffd98a'; c.fillRect(30, 420, 300, bleed.y1 - 420);
          const wg = c.createLinearGradient(0, 420, 0, 520); wg.addColorStop(0, 'rgba(255,200,120,0.2)'); wg.addColorStop(1, 'rgba(120,70,30,0.5)');
          c.fillStyle = wg; c.fillRect(30, 420, 300, bleed.y1 - 420);
          for (const [x, h, col] of [[70, 40, '#6b3a24'], [120, 26, '#7d2a34'], [250, 34, '#2f5546'], [292, 46, '#c9a24a']]) { c.fillStyle = col; c.fillRect(x - 12, 520 - h, 24, h); }
          c.fillStyle = '#8fbfe6'; c.beginPath(); c.arc(188, 486, 22, 0, 7); c.fill(); c.fillStyle = '#6b452c'; c.fillRect(185, 506, 6, 20);
          c.fillStyle = '#2a4a3d'; c.fillRect(24, 412, 312, 10);
          for (const x of [90, 150, 210, 270]) c.fillRect(x - 3, 420, 6, bleed.y1 - 420);
          c.fillRect(30, 470, 300, 5);
          const board = new Path2D(); board.rect(ox0, oy0, ox1 - ox0, oy1 - oy0);
          softShadow(c, board, 12, 0.45, 4, 7);
          return;
        }
        if (opts.icon === 'horseshoe') {
          // the sign on the stable wall: oak boards under a slate eave, the white
          // paddock rails and foxgloves along the foot of the wall
          SCENES.oakBoards(c, r, nz, bleed.x0, bleed.y0, bleed.x1, 470);
          c.fillStyle = '#4b4f58'; c.fillRect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, 44 - bleed.y0);
          c.fillStyle = 'rgba(255,255,255,0.1)'; for (let x = Math.floor(bleed.x0 / 22) * 22; x < bleed.x1; x += 22) c.fillRect(x, bleed.y0, 1.4, 44 - bleed.y0);
          c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(bleed.x0, 44, bleed.x1 - bleed.x0, 6);
          c.fillStyle = '#7f9a58'; c.fillRect(bleed.x0, 470, bleed.x1 - bleed.x0, bleed.y1 - 470);
          for (let i = 0; i < 260; i++) { c.fillStyle = U.pick(r, ['#6b8f48', '#8fae62', '#5d8040']); c.fillRect(bleed.x0 + r() * (bleed.x1 - bleed.x0), 470 + r() * (bleed.y1 - 470), 1.6, 6 + r() * 6); }
          for (let i = 0; i < 9; i++) {
            const x = bleed.x0 + 16 + i * 44 + r() * 20, h = 70 + r() * 44, n = 11;
            c.strokeStyle = '#5f8a4a'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, 486); c.lineTo(x, 486 - h); c.stroke();
            for (let k = 0; k < n; k++) { const t = k / (n - 1), sz = 8 - t * 5, sd = k % 2 ? 1 : -1; c.fillStyle = U.pick(r, ['#b45f9e', '#c975ad', '#a8518f']); c.beginPath(); c.ellipse(x + sd * sz * 0.7, 486 - h * (0.3 + 0.7 * t), sz * 0.8, sz * 1.15, sd * 0.4, 0, 7); c.fill(); }
          }
          c.fillStyle = '#f4f0e6';
          for (const x of [18, 180, 342]) { c.fillRect(x - 6, 438, 12, bleed.y1 - 438); c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x + 3, 438, 3, bleed.y1 - 438); c.fillStyle = '#f4f0e6'; }
          for (const y of [456, 502, 548]) { c.fillRect(bleed.x0, y, bleed.x1 - bleed.x0, 11); }
          c.fillStyle = 'rgba(0,0,0,0.14)'; for (const y of [465, 511, 557]) c.fillRect(bleed.x0, y, bleed.x1 - bleed.x0, 2);
          const board = new Path2D(); board.rect(ox0, oy0, ox1 - ox0, oy1 - oy0);
          softShadow(c, board, 12, 0.45, 4, 7);
          return;
        }
        if (opts.icon === 'star') {
          // the sign on the observatory: dressed stone under a copper eave gone green
          // and weeping down the wall, a round window above the board, a stone owl
          // on its plinth, and wild thyme along the foot of the wall on the hill path
          const { x0, y0, x1, y1 } = bleed;
          ashlar(c, r, nz, x0, y0, x1, 484);
          for (let i = 0; i < 18; i++) {
            const x = x0 + r() * (x1 - x0), h = 24 + r() * 90, w = 5 + r() * 12;
            const sg = c.createLinearGradient(0, 34, 0, 34 + h); sg.addColorStop(0, 'rgba(94,170,150,0.42)'); sg.addColorStop(1, 'rgba(94,170,150,0)');
            c.fillStyle = sg; c.beginPath(); c.moveTo(x, 34); c.lineTo(x + w, 34); c.quadraticCurveTo(x + w * 0.8, 34 + h * 0.7, x + w * 0.5, 34 + h); c.quadraticCurveTo(x + w * 0.2, 34 + h * 0.7, x, 34); c.fill();
          }
          c.fillStyle = '#5e9a8c'; c.fillRect(x0, y0, x1 - x0, 30 - y0);
          for (let x = Math.floor(x0 / 34) * 34; x < x1; x += 34) { c.fillStyle = 'rgba(190,232,216,0.55)'; c.fillRect(x, y0, 3, 30 - y0); c.fillStyle = 'rgba(26,62,54,0.4)'; c.fillRect(x + 3, y0, 2, 30 - y0); }
          c.fillStyle = '#b86f3f'; c.fillRect(x0, 28, x1 - x0, 9); c.fillStyle = '#e0a26f'; c.fillRect(x0, 28, x1 - x0, 2.4); c.fillStyle = 'rgba(40,24,14,0.32)'; c.fillRect(x0, 37, x1 - x0, 5);
          // the round window in its ring of stones
          const ox = 180, oy = 96;
          for (let k = 0; k < 14; k++) {
            const a = (k / 14) * 6.283, b = ((k + 1) / 14) * 6.283;
            c.fillStyle = k % 2 ? '#cdc4b2' : '#d6cdbc'; c.beginPath(); c.arc(ox, oy, 53, a + 0.012, b - 0.012); c.arc(ox, oy, 40, b - 0.012, a + 0.012, true); c.closePath(); c.fill();
          }
          const gl = c.createRadialGradient(ox - 8, oy - 8, 4, ox, oy, 42); gl.addColorStop(0, '#5c6fa6'); gl.addColorStop(1, '#27315a');
          c.fillStyle = gl; c.beginPath(); c.arc(ox, oy, 40, 0, 7); c.fill();
          c.strokeStyle = '#c9a24a'; c.lineWidth = 3; c.beginPath(); c.arc(ox, oy, 15, 0, 7); c.stroke();
          for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.283; c.beginPath(); c.moveTo(ox + Math.cos(a) * 15, oy + Math.sin(a) * 15); c.lineTo(ox + Math.cos(a) * 40, oy + Math.sin(a) * 40); c.stroke(); }
          c.fillStyle = 'rgba(255,255,255,0.26)'; c.beginPath(); c.ellipse(ox - 17, oy - 18, 12, 5, -0.7, 0, 7); c.fill();
          // the hill path
          const pg = ramp(['#ad9f88', '#bbae98', '#c8bca7']);
          field(c, x0, 484, x1, y1, 3, (x, y) => pg(nz.fbm(x * 0.03, y * 0.05, 3)));
          for (let i = 0; i < 240; i++) { c.fillStyle = U.pick(r, ['#8f8371', '#d6ccb9', '#a3977f', '#e2dac9']); c.beginPath(); c.ellipse(x0 + r() * (x1 - x0), 492 + r() * (y1 - 492), 1.4 + r() * 2.4, 1 + r() * 1.5, 0, 0, 7); c.fill(); }
          // the stone owl, keeping an eye on the path
          const qx = 308;
          c.fillStyle = 'rgba(30,22,14,0.3)'; c.beginPath(); c.ellipse(qx + 4, 487, 34, 7, 0, 0, 7); c.fill();
          c.fillStyle = '#a89e8c'; c.fillRect(qx - 27, 452, 54, 35); c.fillStyle = '#c4baa8'; c.fillRect(qx - 31, 446, 62, 9); c.fillStyle = 'rgba(255,248,232,0.34)'; c.fillRect(qx - 31, 446, 62, 2);
          c.fillStyle = '#bdb3a0'; c.beginPath(); c.moveTo(qx - 22, 446); c.quadraticCurveTo(qx - 27, 410, qx - 17, 400); c.lineTo(qx - 20, 396); c.lineTo(qx - 8, 400); c.quadraticCurveTo(qx, 397, qx + 8, 400); c.lineTo(qx + 20, 396); c.lineTo(qx + 17, 400); c.quadraticCurveTo(qx + 27, 410, qx + 22, 446); c.closePath(); c.fill();
          c.fillStyle = 'rgba(70,58,44,0.2)'; c.beginPath(); c.moveTo(qx + 22, 446); c.quadraticCurveTo(qx + 27, 410, qx + 17, 400); c.quadraticCurveTo(qx + 20, 424, qx + 8, 446); c.closePath(); c.fill();
          for (const dx of [-8.5, 8.5]) { c.fillStyle = '#d6cdbc'; c.beginPath(); c.arc(qx + dx, 411, 8, 0, 7); c.fill(); c.fillStyle = '#6b5f4e'; c.beginPath(); c.arc(qx + dx, 411, 3.4, 0, 7); c.fill(); }
          c.fillStyle = '#8f8371'; c.beginPath(); c.moveTo(qx - 3, 415); c.lineTo(qx + 3, 415); c.lineTo(qx, 422); c.closePath(); c.fill();
          c.strokeStyle = 'rgba(90,76,60,0.5)'; c.lineWidth = 1.2;
          for (let row = 0; row < 4; row++) for (let k = -1 - (row % 2); k <= 1; k++) { c.beginPath(); c.arc(qx + k * 9 + (row % 2 ? 4.5 : 0), 427 + row * 5.5, 4, 0.2, Math.PI - 0.2); c.stroke(); }
          // cushions of wild thyme in flower along the foot of the wall
          for (let tx = x0 + 6; tx < x1 + 10; tx += 26 + r() * 16) {
            if (Math.abs(tx - qx) < 40) continue;
            const ty = 478 + r() * 10, tw = 22 + r() * 14, th = 12 + r() * 7;
            c.fillStyle = 'rgba(30,22,14,0.22)'; c.beginPath(); c.ellipse(tx + 2, ty + th * 0.7, tw + 2, th * 0.5, 0, 0, 7); c.fill();
            c.fillStyle = '#4c7440'; c.beginPath(); c.ellipse(tx, ty, tw, th, 0, 0, 7); c.fill();
            for (let i = 0; i < 46; i++) {
              const a = r() * 6.283, d = Math.sqrt(r()), px = tx + Math.cos(a) * d * tw, py = ty + Math.sin(a) * d * th;
              c.fillStyle = U.pick(r, ['#5f8a4a', '#6f9a58', '#7fa862', '#55803f']); c.beginPath(); c.ellipse(px, py, 2.4, 1.5, r() * 3, 0, 7); c.fill();
              if (i % 2) { c.fillStyle = U.pick(r, ['#b48fd8', '#c9a6e2', '#9a78c6', '#d8bfe8']); c.beginPath(); c.arc(px + (r() - 0.5) * 3, py - 2, 1.5, 0, 7); c.fill(); }
            }
          }
          const board = new Path2D(); board.rect(ox0, oy0, ox1 - ox0, oy1 - oy0);
          softShadow(c, board, 12, 0.45, 4, 7);
          return;
        }
        if (opts.icon === 'wave') {
          // the sign over the lido's entrance: cream render under a stepped parapet
          // against the blue, two pennants, speed lines, the doors with their
          // portholes between pale blue tiles, a terrazzo step and two palms in pots
          const { x0, y0, x1, y1 } = bleed;
          decoRender(c, r, nz, x0, y0, x1, y1, [112]);
          const sg = c.createLinearGradient(0, y0, 0, 70); sg.addColorStop(0, '#83c5ea'); sg.addColorStop(1, '#cdeaf5');
          const STEPS = [[x1, 62], [282, 62], [282, 42], [248, 42], [248, 22], [112, 22], [112, 42], [78, 42], [78, 62], [x0, 62]];
          c.fillStyle = sg; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y0); for (const [a, b] of STEPS) c.lineTo(a, b); c.closePath(); c.fill();
          c.strokeStyle = '#c9474f'; c.lineWidth = 5; c.lineJoin = 'miter'; c.beginPath(); STEPS.forEach(([a, b], k) => (k ? c.lineTo(a, b + 3) : c.moveTo(a, b + 3))); c.stroke();
          c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 1.4; c.beginPath(); STEPS.forEach(([a, b], k) => (k ? c.lineTo(a, b + 8) : c.moveTo(a, b + 8))); c.stroke();
          for (const fx of [78, 282]) {
            c.fillStyle = '#c9d2d6'; c.fillRect(fx - 1.5, 2, 3, 40);
            const dir = fx < 180 ? -1 : 1;
            c.fillStyle = '#c9474f'; c.beginPath(); c.moveTo(fx, 3); c.quadraticCurveTo(fx + dir * 16, 6, fx + dir * 30, 11); c.quadraticCurveTo(fx + dir * 14, 14, fx, 21); c.closePath(); c.fill();
          }
          // the tiles and the terrazzo step
          const T = 18, ty = 436, py = 546;
          c.fillStyle = '#eef6f3'; c.fillRect(x0, ty, x1 - x0, py - ty);
          for (let y = ty; y < py; y += T) for (let x = Math.floor(x0 / T) * T; x < x1; x += T) {
            c.fillStyle = U.pick(r, ['#a9d6dc', '#b4dde2', '#bfe3e6', '#9ecfd6']); c.fillRect(x + 1, y + 1, T - 2, T - 2);
            c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(x + 1, y + 1, T - 2, 2);
          }
          c.fillStyle = '#c9474f'; c.fillRect(x0, ty - 6, x1 - x0, 6);
          c.fillStyle = '#e8e0d0'; c.fillRect(x0, py, x1 - x0, y1 - py);
          for (let i = 0; i < 420; i++) { c.fillStyle = U.pick(r, ['#d39a92', '#a3cdd1', '#b9b1a1', '#f7f1e4', '#8f897c']); c.beginPath(); c.ellipse(x0 + r() * (x1 - x0), py + 4 + r() * (y1 - py), 0.6 + r() * 1.3, 0.5 + r() * 0.9, r() * 3, 0, 7); c.fill(); }
          c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(x0, py, x1 - x0, 2); c.fillStyle = 'rgba(40,30,20,0.2)'; c.fillRect(x0, py - 4, x1 - x0, 4);
          // the double doors: pale blue, a porthole each and long steel handles
          c.fillStyle = 'rgba(40,30,20,0.28)'; c.fillRect(112, 410, 142, 136);
          c.fillStyle = '#f7efdf'; c.fillRect(108, 404, 144, 142);
          c.fillStyle = '#7fc2c9'; c.fillRect(116, 412, 62, 134); c.fillRect(182, 412, 62, 134);
          c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(116, 412, 62, 3); c.fillRect(182, 412, 62, 3);
          for (const dx of [147, 213]) {
            c.fillStyle = '#c9d2d6'; c.beginPath(); c.arc(dx, 450, 21, 0, 7); c.fill();
            const pg = c.createLinearGradient(0, 432, 0, 468); pg.addColorStop(0, '#3e6f86'); pg.addColorStop(1, '#8fd0dc');
            c.fillStyle = pg; c.beginPath(); c.arc(dx, 450, 16.5, 0, 7); c.fill();
            c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); c.ellipse(dx - 6, 443, 6, 2.6, -0.7, 0, 7); c.fill();
          }
          for (const hx of [171, 189]) { c.fillStyle = '#c9d2d6'; c.beginPath(); c.roundRect(hx - 2.5, 482, 5, 40, 2.5); c.fill(); c.fillStyle = '#f2f6f7'; c.fillRect(hx - 1.6, 484, 1.4, 36); }
          // the palms in their coral pots
          for (const px of [50, 310]) {
            c.fillStyle = 'rgba(30,22,14,0.26)'; c.beginPath(); c.ellipse(px + 4, 566, 34, 6, 0, 0, 7); c.fill();
            for (const k of [-3, 3, -2, 2, -1, 1, 0]) {
              const side = Math.sign(k) || 1, ex = px + k * 25, ey = 500 + k * k * 2.6 - (3 - Math.abs(k)) * 24, bx = px + k * 15, by = 500 - 38 - (3 - Math.abs(k)) * 16;
              c.strokeStyle = U.pick(r, ['#3f8a5a', '#4f9a64', '#347a4e']); c.lineCap = 'round';
              for (let q = 2; q <= 15; q++) {
                const t = q / 15, u = 1 - t, lx = u * u * px + 2 * u * t * bx + t * t * ex, ly = u * u * 508 + 2 * u * t * by + t * t * ey;
                const a = Math.atan2(2 * u * (by - 508) + 2 * t * (ey - by), 2 * u * (bx - px) + 2 * t * (ex - bx)), ll = 17 * (1.1 - t * t);
                c.lineWidth = 2.5 - t * 1.5; c.beginPath();
                for (const o of [-0.55, 0.55]) { c.moveTo(lx, ly); c.lineTo(lx - Math.cos(a + o * side) * -ll, ly - Math.sin(a + o * side) * -ll + ll * 0.3); }
                c.stroke();
              }
              c.lineWidth = 2; c.beginPath(); c.moveTo(px, 508); c.quadraticCurveTo(bx, by, ex, ey); c.stroke();
            }
            c.fillStyle = '#c9474f'; c.beginPath(); c.moveTo(px - 25, 512); c.lineTo(px + 25, 512); c.lineTo(px + 18, 566); c.lineTo(px - 18, 566); c.closePath(); c.fill();
            c.fillStyle = '#e06a62'; c.fillRect(px - 27, 506, 54, 9); c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(px - 18, 512, 6, 52);
            c.fillStyle = '#f7efdf'; for (let k = 0; k < 2; k++) c.fillRect(px - 24 + k * 2, 524 + k * 7, 48 - k * 4, 2.4);
          }
          const board = new Path2D(); board.rect(ox0, oy0, ox1 - ox0, oy1 - oy0);
          softShadow(c, board, 12, 0.45, 4, 7);
          return;
        }
        if (opts.farm) {
          // barn-red boards, a hayloft door with straw poking out, and the farm gate
          field(c, bleed.x0, bleed.y0, bleed.x1, bleed.y1, 3, (x, y) => { const v = nz.fbm(x * 0.01, y * 0.04, 3); return [166 + v * 26, 72 + v * 16, 54 + v * 12]; });
          for (let x = Math.floor(bleed.x0 / 24) * 24; x < bleed.x1; x += 24) {
            c.fillStyle = 'rgba(60,20,12,0.35)'; c.fillRect(x, bleed.y0, 2, bleed.y1 - bleed.y0);
            c.fillStyle = 'rgba(255,220,200,0.08)'; c.fillRect(x + 2, bleed.y0, 1.5, bleed.y1 - bleed.y0);
          }
          c.fillStyle = '#7a3426'; c.fillRect(130, bleed.y0, 100, 112 - bleed.y0);
          c.strokeStyle = '#f4ecdc'; c.lineWidth = 6; c.strokeRect(133, 6, 94, 102);
          c.beginPath(); c.moveTo(133, 6); c.lineTo(227, 108); c.moveTo(227, 6); c.lineTo(133, 108); c.stroke();
          c.strokeStyle = '#e8c35a'; c.lineWidth = 1.6; c.lineCap = 'round';
          for (let i = 0; i < 26; i++) { const x = 136 + r() * 88; c.beginPath(); c.moveTo(x, 110); c.lineTo(x + (r() - 0.5) * 14, 118 + r() * 12); c.stroke(); }
          c.fillStyle = '#f4ecdc';
          for (const x of [24, 324]) c.fillRect(x, 420, 12, bleed.y1 - 420);
          for (const y of [436, 470, 504, 538]) c.fillRect(24, y, 312, 9);
          c.save(); c.beginPath(); c.rect(36, 436, 288, 111); c.clip();
          c.lineWidth = 9; c.strokeStyle = '#f4ecdc'; c.beginPath(); c.moveTo(36, 547); c.lineTo(324, 436); c.stroke();
          c.restore();
          c.fillStyle = 'rgba(0,0,0,0.15)'; for (const y of [445, 479, 513, 547]) c.fillRect(24, y, 312, 2);
          const board = new Path2D(); board.rect(ox0, oy0, ox1 - ox0, oy1 - oy0);
          softShadow(c, board, 12, 0.45, 4, 7);
          return;
        }
        bricks(c, r, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1);
        // a first-floor window with a box of geraniums
        c.fillStyle = '#efe7d8'; c.fillRect(118, bleed.y0, 124, 100 - bleed.y0);
        const gl = c.createLinearGradient(0, bleed.y0, 0, 88); gl.addColorStop(0, '#9ec9de'); gl.addColorStop(1, '#d8ecf2');
        c.fillStyle = gl; c.fillRect(128, bleed.y0, 104, 88 - bleed.y0);
        c.fillStyle = '#efe7d8'; c.fillRect(177, bleed.y0, 6, 88 - bleed.y0);
        c.fillStyle = '#efb4ae'; c.beginPath(); c.moveTo(128, bleed.y0); c.lineTo(150, bleed.y0); c.quadraticCurveTo(138, 40, 146, 88); c.lineTo(128, 88); c.fill();
        c.fillStyle = '#8a5a3c'; c.fillRect(110, 92, 140, 18);
        for (let i = 0; i < 9; i++) {
          const x = 118 + i * 15.5;
          c.fillStyle = '#4f8a3a'; c.beginPath(); c.ellipse(x, 90, 8, 5, r(), 0, 7); c.fill();
          c.fillStyle = U.pick(r, ['#e0485a', '#f06a7e', '#d93b4f']); c.beginPath(); c.arc(x + (r() - 0.5) * 6, 84 - r() * 6, 4, 0, 7); c.fill();
        }
        // the top of the striped awning below the board
        const ay = 432;
        c.fillStyle = '#29332f'; c.beginPath(); c.roundRect(28, ay - 16, 304, 18, 5); c.fill();
        c.save(); c.beginPath(); c.moveTo(40, ay); c.lineTo(320, ay); c.lineTo(346, bleed.y1); c.lineTo(14, bleed.y1); c.closePath(); c.clip();
        c.fillStyle = STRIPE_A; c.fillRect(0, ay, W, bleed.y1 - ay);
        c.fillStyle = STRIPE_B;
        for (let k = 1; k < 9; k += 2) { const xa = 40 + (280 * k) / 9, xb = 40 + (280 * (k + 1)) / 9; c.beginPath(); c.moveTo(xa, ay); c.lineTo(xb, ay); c.lineTo(14 + (332 * (k + 1)) / 9, bleed.y1); c.lineTo(14 + (332 * k) / 9, bleed.y1); c.closePath(); c.fill(); }
        const g = c.createLinearGradient(0, ay, 0, ay + 90); g.addColorStop(0, 'rgba(30,20,10,0.35)'); g.addColorStop(1, 'rgba(30,20,10,0)');
        c.fillStyle = g; c.fillRect(0, ay, W, 90);
        c.restore();
        const board = new Path2D(); board.rect(ox0, oy0, ox1 - ox0, oy1 - oy0);
        softShadow(c, board, 12, 0.45, 4, 7);
      },
      clean(c, paint) { c.fillStyle = paint; c.fillRect(0, 0, W, H); },
      cleanOver(c) {
        // grain and plank seams so the paint reads as wood
        for (let i = 0; i < 200; i++) {
          const x = ix0 + r() * (ix1 - ix0), y = iy0 + r() * (iy1 - iy0), l = 30 + r() * 90;
          c.strokeStyle = r() < 0.7 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.09)'; c.lineWidth = 0.8;
          c.beginPath(); c.moveTo(x, y); c.lineTo(x + l, y + (r() - 0.5) * 2); c.stroke();
        }
        for (const y of seams) { c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(ix0, y - 1, ix1 - ix0, 2); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(ix0, y + 1, ix1 - ix0, 1.5); }
        c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(ix0, iy0, ix1 - ix0, 5); c.fillRect(ix0, iy0, 5, iy1 - iy0);
        c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(ix0, iy1 - 4, ix1 - ix0, 4); c.fillRect(ix1 - 4, iy0, 4, iy1 - iy0);
        // a gold line just inside the edge, with little diamonds in the corners
        c.strokeStyle = '#3a2814'; c.lineWidth = 4; c.strokeRect(ix0 + 13, iy0 + 13, ix1 - ix0 - 26, iy1 - iy0 - 26);
        c.strokeStyle = '#e2b850'; c.lineWidth = 2; c.strokeRect(ix0 + 13, iy0 + 13, ix1 - ix0 - 26, iy1 - iy0 - 26);
        for (const [x, y] of [[ix0 + 13, iy0 + 13], [ix1 - 13, iy0 + 13], [ix0 + 13, iy1 - 13], [ix1 - 13, iy1 - 13]]) {
          c.fillStyle = '#3a2814'; c.beginPath(); c.moveTo(x, y - 8); c.lineTo(x + 8, y); c.lineTo(x, y + 8); c.lineTo(x - 8, y); c.closePath(); c.fill();
          c.fillStyle = '#e9bd55'; c.beginPath(); c.moveTo(x, y - 5.5); c.lineTo(x + 5.5, y); c.lineTo(x, y + 5.5); c.lineTo(x - 5.5, y); c.closePath(); c.fill();
        }
        const tl = titleLines(c, title), iy = tl.icon - iy0 - 46;
        if (opts.icon === 'paw') pawIcon(c, cx, iy0 + 46 + iy, 15);
        else if (opts.icon === 'fish') fishIcon(c, cx, iy0 + 46 + iy, 17);
        else if (opts.icon === 'book') bookIcon(c, cx, iy0 + 47 + iy, 16);
        else if (opts.icon === 'pot') potIcon(c, cx, iy0 + 46 + iy, 17);
        else if (opts.icon === 'train') trainIcon(c, cx, iy0 + 50 + iy, 16);
        else if (opts.icon === 'button') buttonIcon(c, cx, iy0 + 46 + iy, 16);
        else if (opts.icon === 'key') keyIcon(c, cx + 4, iy0 + 46 + iy, 17);
        else if (opts.icon === 'palette') paletteIcon(c, cx, iy0 + 46 + iy, 17);
        else if (opts.icon === 'horseshoe') horseshoeIcon(c, cx, iy0 + 47 + iy, 16);
        else if (opts.icon === 'star') starIcon(c, cx, iy0 + 46 + iy, 16);
        else if (opts.icon === 'wave') waveIcon(c, cx, iy0 + 40 + iy, 15);
        else if (opts.icon === 'mask') maskIcon(c, cx, iy0 + 46 + iy, 16);
        else cup(c, cx, iy0 + 44, 14);
        for (const [t, y, size] of tl.lines) letters(c, t, y, size);
        letters(c, sub, iy1 - 32, fit(c, sub, 17));
      },
      dirt(c) {
        oldWood(c);
        // the ghost of the old lettering
        const gl = titleLines(c, ghostTitle);
        if (gl.lines.length === 1) letters(c, ghostTitle, iy0 + 112, fit(c, ghostTitle, 82), 'rgba(235,225,200,0.15)');
        else for (const [t, y, size] of gl.lines) letters(c, t, y, size - 2, 'rgba(235,225,200,0.15)');
        peelingPaint(c, r, ix0, iy0, ix1, iy1, 44, '#a3b7b1');
        for (const y of seams) { c.fillStyle = 'rgba(40,34,28,0.5)'; c.fillRect(ix0, y - 1.5, ix1 - ix0, 3); }
        c.strokeStyle = 'rgba(50,42,34,0.55)'; c.lineWidth = 0.9;
        for (let i = 0; i < 10; i++) {
          let x = ix0 + r() * (ix1 - ix0), y = iy0 + r() * (iy1 - iy0);
          c.beginPath(); c.moveTo(x, y);
          for (let k = 0; k < 6; k++) { x += 6 + r() * 12; y += (r() - 0.5) * 5; c.lineTo(x, y); }
          c.stroke();
        }
        grime(c, r, ix0, iy0, ix1, iy1, 18);
        const g = c.createLinearGradient(0, iy1 - 50, 0, iy1); g.addColorStop(0, 'rgba(60,50,35,0)'); g.addColorStop(1, 'rgba(60,50,35,0.45)');
        c.fillStyle = g; c.fillRect(ix0, iy1 - 50, ix1 - ix0, 50);
        dropping(c, r, 250, iy0 + 30, 6);
        dropping(c, r, 92, iy0 + 120, 5);
        cobweb(c, ix0, iy0, 0, 64);
      },
      top(c) {
        // the moulded frame
        c.fillStyle = '#4a3322';
        c.beginPath(); c.rect(ox0, oy0, ox1 - ox0, oy1 - oy0); c.rect(ix1, iy0, ix0 - ix1, iy1 - iy0); c.fill('evenodd');
        c.fillStyle = 'rgba(255,230,190,0.18)'; c.fillRect(ox0, oy0, ox1 - ox0, 4); c.fillRect(ox0, oy0, 4, oy1 - oy0);
        c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(ox0, oy1 - 4, ox1 - ox0, 4); c.fillRect(ox1 - 4, oy0, 4, oy1 - oy0);
        c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(ix0 - 3, iy0 - 3, ix1 - ix0 + 6, 3); c.fillRect(ix0 - 3, iy0, 3, iy1 - iy0);
        for (const [x, y] of [[ox0 + 8, oy0 + 8], [ox1 - 8, oy0 + 8], [ox0 + 8, oy1 - 8], [ox1 - 8, oy1 - 8]]) {
          c.fillStyle = '#c9a24a'; c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill();
          c.fillStyle = '#f2d88a'; c.beginPath(); c.arc(x - 1, y - 1, 1.6, 0, 7); c.fill();
        }
        // two gooseneck lamps lighting the board
        for (const x of [96, 264]) {
          c.fillStyle = 'rgba(255,240,200,0.1)';
          c.beginPath(); c.moveTo(x - 10, 134); c.lineTo(x + 10, 134); c.lineTo(x + 58, 300); c.lineTo(x - 58, 300); c.closePath(); c.fill();
          c.fillStyle = '#2b2b30'; c.fillRect(x - 6, 104, 12, 8);
          c.strokeStyle = '#2b2b30'; c.lineWidth = 3; c.lineCap = 'round';
          c.beginPath(); c.moveTo(x, 108); c.quadraticCurveTo(x, 84, x + 10, 96); c.quadraticCurveTo(x + 12, 112, x, 122); c.stroke();
          c.fillStyle = '#2f4f45'; c.beginPath(); c.moveTo(x - 13, 134); c.lineTo(x + 13, 134); c.lineTo(x + 5, 120); c.lineTo(x - 5, 120); c.closePath(); c.fill();
          c.fillStyle = '#fff1c4'; c.beginPath(); c.ellipse(x, 134, 11, 3, 0, 0, Math.PI); c.fill();
        }
      },
      stamp: paintStamp,
    };
  }

  // ----------------------------------------------------------------- TABLES
  // Bistro tables from above: marble tops on the tiled floor.
  function tables(S) {
    const { r, nz, bleed } = S;
    const T = [
      { x: 106, y: 152, R: 64, chairs: [-2.5, 0.5] }, { x: 260, y: 268, R: 60, chairs: [-0.9, 2.3] },
      { x: 108, y: 402, R: 62, chairs: [-2.0, 1.2] }, { x: 262, y: 516, R: 56, chairs: [-1.4, 0.2] },
    ];
    const things = [
      { t: 0, dx: 24, dy: -20, r: 10, kind: 'vase' }, { t: 1, dx: -22, dy: 16, r: 11, kind: 'sugar' },
      { t: 2, dx: 20, dy: 18, r: 9, kind: 'candle' }, { t: 3, dx: -16, dy: -12, r: 6, kind: 'salt' }, { t: 3, dx: -1, dy: -18, r: 6, kind: 'pepper' },
    ].map((o) => Object.assign(o, { x: T[o.t].x + o.dx, y: T[o.t].y + o.dy }));
    const region = new Path2D();
    for (const t of T) { region.moveTo(t.x + t.R - 6, t.y); region.arc(t.x, t.y, t.R - 6, 0, Math.PI * 2); }
    for (const o of things) { region.moveTo(o.x + o.r, o.y); region.arc(o.x, o.y, o.r, 0, Math.PI * 2); }
    function marble(c, t, dull) {
      const base = dull ? ramp(['#b3a690', '#c3b7a2', '#cfc4b0']) : ramp(['#e5e1da', '#f1eee8', '#fbfaf7']);
      field(c, t.x - t.R, t.y - t.R, t.x + t.R, t.y + t.R, 1.5, (x, y) => base(nz.fbm(x * 0.04 + t.x, y * 0.04, 4)));
      c.strokeStyle = dull ? 'rgba(110,95,75,0.3)' : 'rgba(118,118,130,0.35)'; c.lineWidth = 0.9;
      for (let k = 0; k < 7; k++) {
        let x = t.x + (r() - 0.5) * t.R * 1.6, y = t.y + (r() - 0.5) * t.R * 1.6;
        const a = r() * 6.28;
        c.beginPath(); c.moveTo(x, y);
        for (let s = 0; s < 12; s++) { x += Math.cos(a + (r() - 0.5) * 1.6) * 9; y += Math.sin(a + (r() - 0.5) * 1.6) * 9; c.lineTo(x, y); }
        c.stroke();
      }
    }
    function chair(c, x, y, a) {
      c.fillStyle = 'rgba(40,28,18,0.25)'; c.beginPath(); c.arc(x + 4, y + 5, 19, 0, 7); c.fill();
      c.fillStyle = '#7a4b2e'; c.beginPath(); c.arc(x, y, 19, 0, 7); c.fill();
      c.fillStyle = '#dcc28a'; c.beginPath(); c.arc(x, y, 15, 0, 7); c.fill();
      c.strokeStyle = 'rgba(150,110,50,0.45)'; c.lineWidth = 0.8;
      c.save(); c.beginPath(); c.arc(x, y, 15, 0, 7); c.clip();
      for (let k = -20; k <= 20; k += 4) { c.beginPath(); c.moveTo(x + k - 20, y - 20); c.lineTo(x + k + 20, y + 20); c.moveTo(x + k + 20, y - 20); c.lineTo(x + k - 20, y + 20); c.stroke(); }
      c.restore();
      c.strokeStyle = '#5e3a24'; c.lineWidth = 5; c.lineCap = 'round';
      c.beginPath(); c.arc(x, y, 21, a - 1.1, a + 1.1); c.stroke();
    }
    return {
      family: 'wash', particle: 'suds', region,
      tough: (x, y) => { for (const t of T) { const d = Math.hypot(x - t.x, y - t.y); if (d < t.R) return d > t.R - 16 ? 1.3 : 1; } return 1; },
      decor(c) {
        checker(c, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1, TILE_A, TILE_B);
        for (const t of T) for (const a of t.chairs) chair(c, t.x + Math.cos(a) * (t.R + 12), t.y + Math.sin(a) * (t.R + 12), a);
        for (const t of T) {
          const p = new Path2D(); p.arc(t.x, t.y, t.R, 0, Math.PI * 2);
          softShadow(c, p, 10, 0.4, 5, 7);
          c.fillStyle = '#b8913d'; c.fill(p);
          c.strokeStyle = '#e3c26e'; c.lineWidth = 2; c.beginPath(); c.arc(t.x, t.y, t.R - 2, 3.4, 5.4); c.stroke();
          c.strokeStyle = '#8a6a26'; c.beginPath(); c.arc(t.x, t.y, t.R - 2, 0.3, 2.3); c.stroke();
        }
      },
      clean(c) {
        for (const t of T) {
          marble(c, t, false);
          const g = c.createRadialGradient(t.x - t.R * 0.35, t.y - t.R * 0.4, 2, t.x, t.y, t.R);
          g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.5, 'rgba(255,255,255,0.08)'); g.addColorStop(1, 'rgba(120,110,100,0.18)');
          c.fillStyle = g; c.beginPath(); c.arc(t.x, t.y, t.R, 0, 7); c.fill();
        }
      },
      cleanOver(c) {
        // the window reflected in each polished top
        for (const t of T) {
          c.save(); c.translate(t.x + t.R * 0.15, t.y - t.R * 0.2); c.rotate(-0.6);
          c.fillStyle = 'rgba(255,255,255,0.24)'; c.fillRect(-t.R * 0.6, -6, t.R * 1.2, 7);
          c.fillStyle = 'rgba(255,255,255,0.16)'; c.fillRect(-t.R * 0.5, 6, t.R, 3);
          c.restore();
        }
      },
      dirt(c) {
        for (const t of T) {
          marble(c, t, true);
          // an old greasy film, thicker in places
          field(c, t.x - t.R, t.y - t.R, t.x + t.R, t.y + t.R, 2, (x, y) => [120, 100, 75, 60 + nz.fbm(x * 0.05 + 9, y * 0.05, 4) * 120]);
          // coffee rings, some of them twice
          for (let k = 0; k < 5; k++) {
            const a = r() * 6.28, d = r() * t.R * 0.6, x = t.x + Math.cos(a) * d, y = t.y + Math.sin(a) * d, s = 9 + r() * 4;
            for (let n = 0; n < 2; n++) {
              c.strokeStyle = `rgba(105,62,30,${0.35 + r() * 0.3})`; c.lineWidth = 1.5 + r() * 1.5;
              c.beginPath(); c.arc(x + n * (r() - 0.5) * 6, y + n * (r() - 0.5) * 6, s, 0, 7); c.stroke();
            }
            c.fillStyle = 'rgba(105,62,30,0.12)'; c.beginPath(); c.arc(x, y, s, 0, 7); c.fill();
          }
          // jam and honey smears
          for (let k = 0; k < 3; k++) {
            const x = t.x + (r() - 0.5) * t.R, y = t.y + (r() - 0.5) * t.R, a = r() * 6.28;
            c.save(); c.translate(x, y); c.rotate(a);
            c.fillStyle = U.pick(r, ['rgba(168,40,58,0.6)', 'rgba(120,30,70,0.55)', 'rgba(214,150,40,0.55)']);
            c.beginPath(); c.moveTo(-12, -3); c.quadraticCurveTo(0, -9, 14, -2); c.quadraticCurveTo(16, 4, 4, 5); c.quadraticCurveTo(-10, 7, -12, -3); c.fill();
            c.restore();
          }
          // crumbs and spilled sugar
          for (let k = 0; k < 40; k++) {
            const a = r() * 6.28, d = Math.sqrt(r()) * (t.R - 8);
            c.fillStyle = U.pick(r, ['#c98e4a', '#a8702e', '#e2b46a', '#8c5a2b']);
            c.fillRect(t.x + Math.cos(a) * d, t.y + Math.sin(a) * d, 1.5 + r() * 2.5, 1.5 + r() * 2);
          }
          const sx = t.x + (r() - 0.5) * t.R * 0.8, sy = t.y + (r() - 0.5) * t.R * 0.8;
          c.fillStyle = 'rgba(255,255,255,0.9)';
          for (let k = 0; k < 70; k++) c.fillRect(sx + (r() - 0.5) * 22, sy + (r() - 0.5) * 14, 1.1, 1.1);
        }
        paperScrap(c, r, T[1].x + 22, T[1].y - 18, 11);
        paperScrap(c, r, T[2].x - 26, T[2].y + 8, 10);
        // an abandoned teaspoon
        c.save(); c.translate(T[0].x - 24, T[0].y + 22); c.rotate(0.6);
        c.fillStyle = '#9aa1a8'; c.fillRect(-18, -1.5, 22, 3); c.beginPath(); c.ellipse(9, 0, 7, 4.5, 0, 0, 7); c.fill();
        c.restore();
      },
      top(c) {
        for (const o of things) {
          c.fillStyle = 'rgba(40,28,18,0.25)'; c.beginPath(); c.arc(o.x + 3, o.y + 4, o.r, 0, 7); c.fill();
          if (o.kind === 'vase') {
            c.fillStyle = '#5f8fc7'; c.beginPath(); c.arc(o.x, o.y, o.r, 0, 7); c.fill();
            for (let k = 0; k < 6; k++) { const a = (k / 6) * 6.283; c.fillStyle = '#f7a1b5'; c.beginPath(); c.arc(o.x + Math.cos(a) * 6, o.y + Math.sin(a) * 6, 4, 0, 7); c.fill(); }
            c.fillStyle = '#f7c548'; c.beginPath(); c.arc(o.x, o.y, 3, 0, 7); c.fill();
          } else if (o.kind === 'sugar') {
            c.fillStyle = '#f7f3ea'; c.beginPath(); c.arc(o.x, o.y, o.r, 0, 7); c.fill();
            c.strokeStyle = '#d9d2c4'; c.lineWidth = 1.2; c.beginPath(); c.arc(o.x, o.y, o.r - 3, 0, 7); c.stroke();
            c.fillStyle = '#e9e2d3'; c.beginPath(); c.arc(o.x, o.y, 3, 0, 7); c.fill();
          } else if (o.kind === 'candle') {
            c.fillStyle = 'rgba(220,235,240,0.75)'; c.beginPath(); c.arc(o.x, o.y, o.r, 0, 7); c.fill();
            c.fillStyle = '#f6eedc'; c.beginPath(); c.arc(o.x, o.y, o.r - 3, 0, 7); c.fill();
            glow(c, o.x, o.y, 16, 'rgba(255,214,140,0.5)');
            c.fillStyle = '#ffcf5a'; c.beginPath(); c.arc(o.x, o.y, 2, 0, 7); c.fill();
          } else {
            c.fillStyle = '#e4e8ec'; c.beginPath(); c.arc(o.x, o.y, o.r, 0, 7); c.fill();
            c.fillStyle = '#aab1b8'; c.beginPath(); c.arc(o.x, o.y, o.r - 2, 0, 7); c.fill();
            c.fillStyle = o.kind === 'salt' ? '#ffffff' : '#3d3d42';
            for (let k = 0; k < 3; k++) { const a = (k / 3) * 6.283; c.beginPath(); c.arc(o.x + Math.cos(a) * 1.8, o.y + Math.sin(a) * 1.8, 0.8, 0, 7); c.fill(); }
          }
        }
      },
    };
  }

  // ------------------------------------------------------- POTTER'S WHEEL
  // The pottery's wheel, caked in dried clay: the splash pan round the
  // wheel head and the sage-green cabinet under it, seen a little from above
  // in the workshop, with the pedal, a stool and a bucket of water.
  function potterWheel(S) {
    const { r, nz, bleed } = S;
    const cx = 180, py = 288, prx = 150, pry = 58, wall = 44, bx0 = 104, bx1 = 256, by1 = 500;
    const head = { y: 280, rx: 96, ry: 34, t: 12 };
    const lowY = py + wall;
    const a = Math.acos((bx1 - cx) / prx), yAttach = lowY + pry * Math.sin(a);
    const outline = (p) => {
      p.moveTo(cx - prx, py);
      p.ellipse(cx, py, prx, pry, 0, Math.PI, 0);
      p.lineTo(cx + prx, lowY);
      p.ellipse(cx, lowY, prx, pry, 0, 0, a);
      p.lineTo(bx1 - 6, by1); p.lineTo(bx0 + 6, by1); p.lineTo(bx0, yAttach);
      p.ellipse(cx, lowY, prx, pry, 0, Math.PI - a, Math.PI);
      p.closePath();
      return p;
    };
    const region = outline(new Path2D());
    const body = outline(new Path2D());
    return {
      family: 'wipe', particle: 'suds', region,
      tough: (x, y) => (nz.fbm(x * 0.05 + 7, y * 0.05, 4) > 0.62 ? 1.45 : 1),
      decor(c) {
        // lime-washed wall, a shelf of drying pots, terracotta floor
        const g = ramp(['#e6d9c2', '#efe4d0', '#f6eee0']);
        field(c, bleed.x0, bleed.y0, bleed.x1, 470, 3, (x, y) => g(nz.fbm(x * 0.012, y * 0.012, 3)));
        c.fillStyle = '#9a6b45'; c.fillRect(bleed.x0, 120, bleed.x1 - bleed.x0, 8); c.fillStyle = 'rgba(40,25,15,0.18)'; c.fillRect(bleed.x0, 128, bleed.x1 - bleed.x0, 6);
        for (let x = 6; x < 360; x += 30) {
          const h = 16 + r() * 22, w2 = 9 + r() * 6;
          c.fillStyle = U.pick(r, ['#e8b48a', '#e2a87c', '#ecc09a']);
          c.beginPath(); c.moveTo(x - w2 * 0.6, 120 - h); c.lineTo(x + w2 * 0.6, 120 - h); c.quadraticCurveTo(x + w2 * 1.2, 120 - h * 0.4, x + w2 * 0.7, 120); c.lineTo(x - w2 * 0.7, 120); c.quadraticCurveTo(x - w2 * 1.2, 120 - h * 0.4, x - w2 * 0.6, 120 - h); c.fill();
        }
        c.fillStyle = '#c47a52'; c.fillRect(bleed.x0, 470, bleed.x1 - bleed.x0, bleed.y1 - 470);
        for (let y = 470, row = 0; y < bleed.y1; y += 20, row++) for (let x = bleed.x0 - (row % 2) * 20; x < bleed.x1; x += 40) { c.fillStyle = U.pick(r, ['#c67b50', '#b9704a', '#d08a5e', '#bd6f45']); c.fillRect(x + 1.5, y + 1.5, 37, 17); }
        c.fillStyle = 'rgba(70,40,20,0.25)'; c.fillRect(bleed.x0, 470, bleed.x1 - bleed.x0, 5);
        // a stool, the pedal, a bucket with a sponge
        c.fillStyle = 'rgba(40,25,15,0.25)'; c.beginPath(); c.ellipse(46, 560, 34, 7, 0, 0, 7); c.fill();
        c.fillStyle = '#7d5434'; c.fillRect(22, 470, 8, 90); c.fillRect(62, 470, 8, 90);
        c.fillStyle = '#a77b56'; c.beginPath(); c.ellipse(46, 466, 36, 11, 0, 0, 7); c.fill();
        c.fillStyle = '#c9a77a'; c.beginPath(); c.ellipse(46, 463, 30, 8, 0, 0, 7); c.fill();
        c.fillStyle = 'rgba(40,25,15,0.3)'; c.beginPath(); c.ellipse(292, 552, 34, 6, 0, 0, 7); c.fill();
        c.fillStyle = '#4b5158'; c.beginPath(); c.moveTo(264, 548); c.lineTo(322, 548); c.lineTo(316, 532); c.lineTo(270, 536); c.closePath(); c.fill();
        c.strokeStyle = '#3a3a40'; c.lineWidth = 3; c.beginPath(); c.moveTo(264, 544); c.quadraticCurveTo(250, 528, 246, 500); c.stroke();
        c.fillStyle = 'rgba(40,25,15,0.25)'; c.beginPath(); c.ellipse(334, 506, 26, 6, 0, 0, 7); c.fill();
        c.fillStyle = '#b9c0c4'; c.beginPath(); c.moveTo(312, 456); c.lineTo(356, 456); c.lineTo(350, 504); c.lineTo(318, 504); c.closePath(); c.fill();
        c.fillStyle = '#8fa9b4'; c.beginPath(); c.ellipse(334, 458, 22, 5, 0, 0, 7); c.fill();
        c.fillStyle = '#f2d88a'; c.beginPath(); c.roundRect(326, 448, 18, 12, 4); c.fill();
        softShadow(c, body, 14, 0.4, 6, 8);
      },
      clean(c) {
        // the pan: creamy enamel, shaded inside; the cabinet in sage green
        let g = c.createLinearGradient(cx - prx, 0, cx + prx, 0);
        for (const [o, col] of [[0, '#c9c3b5'], [0.3, '#f2ede2'], [0.6, '#e6e0d3'], [1, '#bdb6a6']]) g.addColorStop(o, col);
        c.fillStyle = g; c.beginPath(); c.ellipse(cx, lowY, prx, pry, 0, 0, Math.PI); c.rect(cx - prx, py, prx * 2, wall); c.fill();
        g = c.createLinearGradient(bx0, 0, bx1, 0);
        for (const [o, col] of [[0, '#5f7d5a'], [0.4, '#86a882'], [0.7, '#7a9b76'], [1, '#56724f']]) g.addColorStop(o, col);
        c.fillStyle = g; c.fillRect(bx0, lowY, bx1 - bx0, by1 - lowY);
        c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(bx0 + 10, yAttach + 12, 6, by1 - yAttach - 30);
        c.fillStyle = '#e7e1d4'; c.beginPath(); c.ellipse(cx, py, prx, pry, 0, 0, 7); c.fill();
        c.fillStyle = '#cfc8b9'; c.beginPath(); c.ellipse(cx, py + 4, prx - 12, pry - 9, 0, 0, 7); c.fill();
        // the wheel head: polished aluminium with turned rings
        c.fillStyle = '#7d8790'; c.beginPath(); c.ellipse(cx, head.y + head.t, head.rx, head.ry, 0, 0, 7); c.fill();
        c.fillRect(cx - head.rx, head.y, head.rx * 2, head.t);
        g = c.createLinearGradient(cx - head.rx, 0, cx + head.rx, 0);
        for (const [o, col] of [[0, '#9aa4ad'], [0.35, '#eef2f5'], [0.55, '#c6cdd3'], [1, '#8d969e']]) g.addColorStop(o, col);
        c.fillStyle = g; c.beginPath(); c.ellipse(cx, head.y, head.rx, head.ry, 0, 0, 7); c.fill();
        c.strokeStyle = 'rgba(90,100,110,0.35)'; c.lineWidth = 1;
        for (const k of [0.25, 0.5, 0.75]) { c.beginPath(); c.ellipse(cx, head.y, head.rx * k, head.ry * k, 0, 0, 7); c.stroke(); }
        for (const dx of [-62, 62]) { c.fillStyle = '#5b636b'; c.beginPath(); c.ellipse(cx + dx, head.y, 3.4, 1.8, 0, 0, 7); c.fill(); }
        // the brand plate and a little control knob on the cabinet
        c.fillStyle = '#e9bf4f'; c.beginPath(); c.roundRect(cx - 30, 392, 60, 16, 4); c.fill();
        c.fillStyle = '#6b4a20'; c.font = 'bold 10px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('KILN LANE', cx, 400.5);
        c.fillStyle = '#26221f'; c.beginPath(); c.arc(cx + 48, 430, 9, 0, 7); c.fill(); c.fillStyle = '#d0d6db'; c.fillRect(cx + 47, 422, 2, 7);
      },
      cleanOver(c) {
        c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); c.ellipse(cx - 34, head.y - 10, 26, 6, -0.12, 0, 7); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.3)';
        for (const [x, y, h] of [[60, 300, 28], [296, 300, 24]]) c.fillRect(x, y, 3, h);
        c.fillStyle = 'rgba(90,120,140,0.25)'; c.beginPath(); c.ellipse(cx + 70, py + 30, 22, 6, 0, 0, 7); c.fill();
      },
      dirt(c) {
        // a crust of dried clay over everything, cracked as it dried
        const g = ramp(['#9c8670', '#ad987f', '#bfab92', '#cdbca5']);
        field(c, cx - prx - 2, py - pry - 2, cx + prx + 2, by1 + 2, 1.5, (x, y) => { const v = nz.fbm(x * 0.03, y * 0.03, 5); return [...g(v), 236 + v * 18]; });
        field(c, cx - prx - 2, py - pry - 2, cx + prx + 2, by1 + 2, 2, (x, y) => [120, 85, 60, Math.max(0, nz.fbm(x * 0.05 + 21, y * 0.05, 4) - 0.5) * 420]);
        // the head's edge still shows through as a raised ring
        c.strokeStyle = 'rgba(80,65,50,0.45)'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(cx, head.y, head.rx, head.ry, 0, 0, 7); c.stroke();
        c.strokeStyle = 'rgba(80,65,50,0.35)'; c.lineWidth = 2; c.beginPath(); c.ellipse(cx, py, prx - 4, pry - 3, 0, Math.PI, 0); c.stroke();
        // cracks
        c.strokeStyle = 'rgba(70,55,40,0.55)'; c.lineWidth = 0.9;
        for (let i = 0; i < 60; i++) {
          let x = cx - prx + r() * prx * 2, y = py - pry + r() * (by1 - py + pry);
          c.beginPath(); c.moveTo(x, y);
          for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 18; y += (r() - 0.5) * 12; c.lineTo(x, y); }
          c.stroke();
        }
        // trimmings curling in the pan and lumps on the head
        c.lineCap = 'round';
        for (let i = 0; i < 30; i++) {
          const ang = r() * 6.28, d = 0.35 + r() * 0.6, x = cx + Math.cos(ang) * prx * d, y = py + Math.sin(ang) * pry * d, a0 = r() * 6.28;
          c.strokeStyle = U.pick(r, ['#8a6a50', '#9c7a5c', '#b08e70']); c.lineWidth = 2.6;
          c.beginPath(); for (let k = 0; k < 14; k++) { const t = k / 13; c.lineTo(x + Math.cos(a0 + t * 5) * (2 + t * 8), y + Math.sin(a0 + t * 5) * (2 + t * 6)); } c.stroke();
        }
        for (let i = 0; i < 16; i++) {
          const x = cx + (r() - 0.5) * head.rx * 1.4, y = head.y + (r() - 0.5) * head.ry * 1.1, s = 4 + r() * 8;
          c.fillStyle = U.pick(r, ['#8f7258', '#a5856a', '#7d624c']);
          c.beginPath(); for (let k = 0; k < 9; k++) { const aa = (k / 9) * 6.283, rr = s * (0.5 + r() * 0.6); c.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr * 0.6); } c.closePath(); c.fill();
          c.fillStyle = 'rgba(255,240,220,0.25)'; c.beginPath(); c.arc(x - s * 0.2, y - s * 0.2, s * 0.25, 0, 7); c.fill();
        }
        // slip that ran down the front of the pan and the cabinet
        for (let i = 0; i < 26; i++) {
          const x = bx0 + 8 + r() * (bx1 - bx0 - 16), y = lowY + pry * 0.6 + r() * 30, l = 20 + r() * 90;
          c.strokeStyle = `rgba(150,120,95,${0.45 + r() * 0.3})`; c.lineWidth = 3 + r() * 4;
          c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 3, Math.min(by1 - 4, y + l)); c.stroke();
        }
        grime(c, r, bx0, by1 - 70, bx1, by1, 14);
      },
      top(c) {
        // the rim of the pan catches the light
        c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 2; c.beginPath(); c.ellipse(cx, py, prx - 1, pry - 1, 0, Math.PI * 1.1, Math.PI * 1.75); c.stroke();
        // feet under the cabinet
        c.fillStyle = '#3a3a40'; c.fillRect(bx0 + 4, by1, 18, 8); c.fillRect(bx1 - 22, by1, 18, 8);
      },
    };
  }

  // ---------------------------------------------------------------- COUNTER
  // The old espresso machine on the counter, front on: chrome body, copper
  // dome, and a counter front of green glazed tiles.
  function counter(S) {
    if (S.opts.what === 'wheel') return potterWheel(S);
    const { r, nz, bleed } = S;
    const bx0 = 92, bx1 = 268, by0 = 214, by1 = 376;
    const dcx = 180, drx = 74, dry = 66;
    const ctop = 376, cf = 396, cb = 560;
    const gauge = { x: 180, y: 258, r: 17 };
    const groups = [{ x: 134, y: 318 }, { x: 226, y: 318 }];
    const outline = (p) => {
      p.moveTo(bx0, by1); p.lineTo(bx0, by0); p.lineTo(dcx - drx, by0);
      p.ellipse(dcx, by0, drx, dry, 0, Math.PI, 0);
      p.lineTo(bx1, by0); p.lineTo(bx1, by1); p.closePath();
      return p;
    };
    const machine = outline(new Path2D());
    const region = outline(new Path2D());
    region.rect(0, cf, W, cb - cf);
    region.moveTo(gauge.x + gauge.r, gauge.y); region.arc(gauge.x, gauge.y, gauge.r, 0, Math.PI * 2);
    for (const g of groups) region.rect(g.x - 17, g.y - 12, 34, 24);
    function tiles(c, dull) {
      const s = 30;
      c.fillStyle = dull ? '#a69d88' : '#e8e1d0'; c.fillRect(0, cf, W, cb - cf);
      for (let y = cf; y < cb; y += s) for (let x = -6; x < W; x += s) {
        const v = nz.n2(x * 0.11, y * 0.11);
        c.fillStyle = dull ? U.shade('#4f6d5e', (v - 0.5) * 0.3) : U.shade('#2f7d65', (v - 0.5) * 0.35);
        c.fillRect(x + 1.5, y + 1.5, s - 3, s - 3);
        if (!dull) {
          const g = c.createLinearGradient(x, y, x + s, y + s);
          g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(0.35, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.12)');
          c.fillStyle = g; c.fillRect(x + 1.5, y + 1.5, s - 3, s - 3);
        }
      }
    }
    return {
      family: 'scrub', particle: 'dust', region,
      tough: (x, y) => (nz.fbm(x * 0.05 + 11, y * 0.05, 4) > 0.6 ? 1.5 : 1),
      decor(c) {
        // cream metro tiles on the back wall
        c.fillStyle = '#d8cfbf'; c.fillRect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, ctop - bleed.y0);
        for (let row = 0, y = bleed.y0; y < ctop; y += 15, row++) {
          for (let x = bleed.x0 - (row % 2 ? 16 : 0); x < bleed.x1; x += 32) {
            c.fillStyle = U.shade('#f1eadc', (nz.n2(x * 0.07, y * 0.07) - 0.5) * 0.06); c.fillRect(x + 1, y + 1, 30, 13);
            c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x + 2, y + 2, 26, 2);
          }
        }
        // shelves with cups either side
        for (const [x0, x1] of [[bleed.x0, 78], [282, bleed.x1]]) {
          c.fillStyle = '#7a5236'; c.fillRect(x0, 136, x1 - x0, 7);
          c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x0, 143, x1 - x0, 6);
          for (let x = Math.max(x0, -10) + 10; x < x1 - 14; x += 22) {
            c.fillStyle = U.pick(r, ['#f7f3ea', '#efb4ae', '#a6d3d4', '#f2d88a']);
            c.beginPath(); c.moveTo(x - 8, 118); c.lineTo(x + 8, 118); c.lineTo(x + 6, 136); c.lineTo(x - 6, 136); c.closePath(); c.fill();
            c.strokeStyle = c.fillStyle; c.lineWidth = 2; c.beginPath(); c.arc(x + 9, 126, 3.5, -1.2, 1.4); c.stroke();
          }
        }
        softShadow(c, machine, 14, 0.4, 6, 6);
        // marble counter top
        c.fillStyle = '#e6e0d4'; c.fillRect(bleed.x0, ctop, bleed.x1 - bleed.x0, cf - ctop);
        c.fillStyle = '#f7f3ec'; c.fillRect(bleed.x0, ctop, bleed.x1 - bleed.x0, 4);
        c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(bleed.x0, cf - 4, bleed.x1 - bleed.x0, 4);
        // a stack of cups to the right, a cake under glass to the left
        for (let k = 0; k < 4; k++) {
          const y = ctop - 6 - k * 15, x = 316;
          c.fillStyle = '#e9e2d3'; c.beginPath(); c.ellipse(x, y + 4, 20, 4, 0, 0, 7); c.fill();
          c.fillStyle = '#f9f6ef'; c.beginPath(); c.moveTo(x - 13, y - 9); c.lineTo(x + 13, y - 9); c.quadraticCurveTo(x + 12, y + 3, x, y + 3); c.quadraticCurveTo(x - 12, y + 3, x - 13, y - 9); c.fill();
          c.strokeStyle = '#f9f6ef'; c.lineWidth = 2.4; c.beginPath(); c.arc(x + 14, y - 4, 4, -1.4, 1.4); c.stroke();
        }
        c.fillStyle = '#d9cbb0'; c.fillRect(22, ctop - 5, 50, 4); c.fillRect(45, ctop - 14, 4, 10);
        c.fillStyle = '#efb4ae'; c.fillRect(26, ctop - 44, 42, 30);
        c.fillStyle = '#fff3ea'; c.fillRect(26, ctop - 33, 42, 4); c.fillRect(26, ctop - 46, 42, 4);
        c.fillStyle = '#c9474f'; for (const x of [32, 44, 56, 64]) { c.beginPath(); c.arc(x, ctop - 48, 2.6, 0, 7); c.fill(); }
        c.fillStyle = 'rgba(220,240,255,0.18)'; c.beginPath(); c.arc(47, ctop - 14, 34, Math.PI, 0); c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.65)'; c.lineWidth = 1.5; c.beginPath(); c.arc(47, ctop - 14, 34, Math.PI, 0); c.stroke();
        c.beginPath(); c.arc(47, ctop - 14, 28, Math.PI * 1.15, Math.PI * 1.4); c.stroke();
        // skirting and floor below the counter
        c.fillStyle = '#3e2a1c'; c.fillRect(bleed.x0, cb, bleed.x1 - bleed.x0, 16);
        checker(c, nz, bleed.x0, cb + 16, bleed.x1, bleed.y1, TILE_A, TILE_B);
      },
      clean(c) {
        // polished chrome: bright and dark bands like a drum
        let g = c.createLinearGradient(bx0, 0, bx1, 0);
        for (const [o, col] of [[0, '#5f6873'], [0.14, '#dfe5ea'], [0.3, '#8d97a1'], [0.5, '#f6f9fb'], [0.68, '#a7b0b9'], [0.84, '#e9eef2'], [1, '#6b7480']]) g.addColorStop(o, col);
        c.fillStyle = g; c.fillRect(bx0, by0, bx1 - bx0, by1 - by0);
        // copper dome
        g = c.createLinearGradient(dcx - drx, 0, dcx + drx, 0);
        for (const [o, col] of [[0, '#7a3416'], [0.25, '#c9703f'], [0.45, '#f6bd8c'], [0.6, '#d98a55'], [1, '#8e4320']]) g.addColorStop(o, col);
        c.fillStyle = g; c.beginPath(); c.ellipse(dcx, by0, drx, dry, 0, Math.PI, 0); c.fill();
        c.fillStyle = 'rgba(255,240,220,0.4)'; c.beginPath(); c.ellipse(dcx - 22, by0 - 34, 8, 22, 0.35, 0, 7); c.fill();
        // brass bands and the drip tray grille
        g = c.createLinearGradient(0, by0, 0, by0 + 14);
        g.addColorStop(0, '#f2d88a'); g.addColorStop(0.5, '#c9952a'); g.addColorStop(1, '#8a6a26');
        c.fillStyle = g; c.fillRect(bx0, by0, bx1 - bx0, 14); c.fillRect(bx0, by1 - 30, bx1 - bx0, 6);
        c.fillStyle = '#3d4248'; c.fillRect(bx0 + 10, by1 - 22, bx1 - bx0 - 20, 18);
        c.fillStyle = '#9aa3ad'; for (let x = bx0 + 14; x < bx1 - 12; x += 6) c.fillRect(x, by1 - 20, 3, 14);
        tiles(c, false);
      },
      cleanOver(c) {
        // an enamel name plate on the front
        c.fillStyle = '#c9a24a'; c.beginPath(); c.ellipse(dcx, 292, 40, 10, 0, 0, 7); c.fill();
        c.fillStyle = '#f7f1e3'; c.beginPath(); c.ellipse(dcx, 292, 37, 8, 0, 0, 7); c.fill();
        c.fillStyle = '#b8443b'; c.font = 'bold 9px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('ESPRESSO', dcx, 292.5);
        // glints on the chrome
        c.fillStyle = 'rgba(255,255,255,0.55)';
        for (const [x, y, h] of [[141, 240, 60], [222, 250, 40], [118, 330, 22]]) c.fillRect(x, y, 3, h);
      },
      dirt(c) {
        // tarnished metal with rust blooming through
        const g = ramp(['#4f4a43', '#615a50', '#746b5e', '#857b6b']);
        field(c, bx0 - 2, by0 - dry - 4, bx1 + 2, by1 + 2, 1.5, (x, y) => g(nz.fbm(x * 0.04, y * 0.04, 5)));
        field(c, bx0 - 2, by0 - dry - 4, bx1 + 2, by1 + 2, 2, (x, y) => [150, 78, 32, Math.max(0, nz.fbm(x * 0.05 + 11, y * 0.05, 4) - 0.5) * 620]);
        // white limescale crust round the group heads and on the tray
        for (let i = 0; i < 160; i++) {
          const gp = U.pick(r, groups), x = gp.x + (r() - 0.5) * 70, y = gp.y + 12 + Math.sqrt(r()) * 46;
          c.fillStyle = `rgba(228,224,212,${0.3 + r() * 0.35})`; c.beginPath(); c.arc(x, y, 1.5 + r() * 3.5, 0, 7); c.fill();
        }
        // grime running down from the dome
        for (let i = 0; i < 40; i++) {
          const x = bx0 + r() * (bx1 - bx0), y = by0 - r() * 40, l = 30 + r() * 120;
          c.strokeStyle = `rgba(40,32,24,${0.2 + r() * 0.25})`; c.lineWidth = 1 + r() * 2.5;
          c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 4, y + l); c.stroke();
        }
        // dust settled on the dome
        c.fillStyle = 'rgba(190,182,168,0.6)'; c.beginPath(); c.ellipse(dcx, by0 - dry * 0.62, drx * 0.7, dry * 0.35, 0, Math.PI, 0); c.fill();
        // the tiled front: dull, grubby, splashed along the bottom
        tiles(c, true);
        field(c, 0, cf, W, cb, 2, (x, y) => [90, 75, 55, 70 + nz.fbm(x * 0.03, y * 0.03, 4) * 110 + (y > cb - 60 ? 60 : 0)]);
        grime(c, r, 0, cf, W, cb, 24);
        for (let i = 0; i < 50; i++) { c.fillStyle = `rgba(95,72,45,${0.3 + r() * 0.4})`; c.beginPath(); c.arc(r() * W, cb - Math.pow(r(), 2) * 70, 1.5 + r() * 4, 0, 7); c.fill(); }
        c.strokeStyle = 'rgba(60,50,40,0.5)'; c.lineWidth = 1.2;
        for (let i = 0; i < 8; i++) { const x = r() * W, y = cf + r() * (cb - cf); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 20 + r() * 30, y + (r() - 0.5) * 6); c.stroke(); }
        cobweb(c, 0, cb, -Math.PI / 2, 60);
        cobweb(c, W, cb, Math.PI, 56);
        cobweb(c, bx1, by0, -Math.PI / 2 + 0.2, 40);
      },
      top(c) {
        // pressure gauge
        c.fillStyle = '#b8913d'; c.beginPath(); c.arc(gauge.x, gauge.y, gauge.r, 0, 7); c.fill();
        c.fillStyle = '#fbf8f0'; c.beginPath(); c.arc(gauge.x, gauge.y, gauge.r - 3.5, 0, 7); c.fill();
        c.strokeStyle = '#3d3d42'; c.lineWidth = 1;
        for (let k = 0; k <= 8; k++) { const a = Math.PI * 0.8 + (k / 8) * Math.PI * 1.4; c.beginPath(); c.moveTo(gauge.x + Math.cos(a) * 9, gauge.y + Math.sin(a) * 9); c.lineTo(gauge.x + Math.cos(a) * 12, gauge.y + Math.sin(a) * 12); c.stroke(); }
        c.strokeStyle = '#c9474f'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(gauge.x, gauge.y); c.lineTo(gauge.x + 8, gauge.y - 6); c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.ellipse(gauge.x - 5, gauge.y - 6, 4, 2.2, -0.6, 0, 7); c.fill();
        // group heads with their handles, cups waiting below
        for (const gp of groups) {
          const g = c.createLinearGradient(gp.x - 17, 0, gp.x + 17, 0);
          g.addColorStop(0, '#6b7480'); g.addColorStop(0.45, '#f4f7f9'); g.addColorStop(1, '#7d8792');
          c.fillStyle = g; c.beginPath(); c.roundRect(gp.x - 17, gp.y - 12, 34, 24, 6); c.fill();
          c.fillStyle = '#4b5158'; c.fillRect(gp.x - 12, gp.y + 10, 24, 5);
          c.save(); c.translate(gp.x + 6, gp.y + 13); c.rotate(0.45);
          c.fillStyle = '#26221f'; c.beginPath(); c.roundRect(0, -4, 34, 8, 4); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(4, -3, 26, 2);
          c.restore();
          c.fillStyle = '#f9f6ef'; c.beginPath(); c.moveTo(gp.x - 9, by1 - 36); c.lineTo(gp.x + 9, by1 - 36); c.quadraticCurveTo(gp.x + 8, by1 - 22, gp.x, by1 - 22); c.quadraticCurveTo(gp.x - 8, by1 - 22, gp.x - 9, by1 - 36); c.fill();
          c.fillStyle = '#e9e2d3'; c.beginPath(); c.ellipse(gp.x, by1 - 21, 13, 3, 0, 0, 7); c.fill();
        }
        // the steam wand
        c.strokeStyle = '#9aa3ad'; c.lineWidth = 5; c.lineCap = 'round';
        c.beginPath(); c.moveTo(bx1 - 6, 300); c.quadraticCurveTo(bx1 + 20, 302, bx1 + 18, 356); c.stroke();
        c.strokeStyle = '#e4e8ec'; c.lineWidth = 1.6;
        c.beginPath(); c.moveTo(bx1 - 4, 299); c.quadraticCurveTo(bx1 + 18, 301, bx1 + 16, 352); c.stroke();
        c.fillStyle = '#26221f'; c.beginPath(); c.roundRect(bx1 - 2, 288, 14, 9, 3); c.fill();
        // a brass crown on the dome
        c.fillStyle = '#c9952a'; c.beginPath(); c.ellipse(dcx, by0 - dry, 12, 4, 0, 0, 7); c.fill();
        c.beginPath(); c.arc(dcx, by0 - dry - 10, 8, 0, 7); c.fill();
        c.fillStyle = '#f2d88a'; c.beginPath(); c.arc(dcx - 2.5, by0 - dry - 12.5, 3, 0, 7); c.fill();
        c.fillStyle = '#c9952a'; c.beginPath(); c.moveTo(dcx - 3, by0 - dry - 17); c.lineTo(dcx, by0 - dry - 28); c.lineTo(dcx + 3, by0 - dry - 17); c.closePath(); c.fill();
      },
    };
  }

  Object.assign(SCENES.KINDS, { cafeFloor, awning, sign, tables, counter });
})();
