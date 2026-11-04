'use strict';
// Scenes for The Painter's Loft: the brushes left stiff with paint, the store
// of old frames, the swing seat in the yard and the poppies by the wall. Each
// is a variant of an older kind, built through SCENES.VARIANTS, with the same
// layers as every other scene (see scenes.js):
//   counter { what: 'brushes' }    jars of brushes at the studio bench (wipe)
//   attic { where: 'loft' }        the store of frames (dust)
//   fence { what: 'swing' }        the swing seat, in the player's colour (paint)
//   bed { flower: 'poppy' }        the poppies along the yard wall (weed)

(() => {
  const { W, H, field, ramp, rrPath, softShadow, inside, paintStamp, peelingPaint, grime, weatheredWood, limewash, strokesByColour } = SCENES;
  const TAU = Math.PI * 2;
  const COBALT = '#2f5fa8', OCHRE = '#d9a53c', RED = '#e2392f', TEAL = '#3f8f8a', CHALK = '#f7f3ea';
  const dot = (c, x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, TAU); c.fill(); };
  const lin = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); for (const [o, col] of stops) g.addColorStop(o, col); return g; };

  // ------------------------------------------------------------ shared bits
  function cobweb(c, cx, cy, a0, len) {
    c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 0.7;
    for (let k = 0; k < 6; k++) { const a = a0 + (k / 5) * (Math.PI / 2); c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len); c.stroke(); }
    for (let ring = 10; ring < len; ring += 10) { c.beginPath(); for (let k = 0; k <= 5; k++) { const a = a0 + (k / 5) * (Math.PI / 2); c.lineTo(cx + Math.cos(a) * ring, cy + Math.sin(a) * ring); } c.stroke(); }
  }
  // a dust bunny: a soft grey tuft
  function bunny(c, r, x, y, s) {
    for (let k = 0; k < 9; k++) {
      const v = (150 + r() * 40) | 0;
      c.fillStyle = `rgba(${v},${v - 5},${v - 10},0.7)`; c.beginPath(); c.arc(x + (r() - 0.5) * s, y + (r() - 0.5) * s * 0.6, s * 0.4, 0, TAU); c.fill();
    }
  }
  // round cobbles laid close together over a grey bed
  function cobbles(c, r, x0, y0, x1, y1) {
    c.fillStyle = '#8c8578'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    for (let y = y0 + 8, row = 0; y < y1 + 10; y += 15, row++) {
      for (let x = x0 - (row % 2) * 10; x < x1 + 12; x += 21) {
        c.fillStyle = U.pick(r, ['#b6ad9c', '#a79e8e', '#c2baa9', '#9c9383', '#aea595']);
        c.beginPath(); c.ellipse(x + (r() - 0.5) * 3, y + (r() - 0.5) * 2, 9.4, 6.4, (r() - 0.5) * 0.4, 0, TAU); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.13)'; c.beginPath(); c.ellipse(x - 2, y - 2, 4.6, 2.2, 0, 0, TAU); c.fill();
      }
    }
  }
  // a blob of paint with a little ring of drops round it
  function splat(c, r, x, y, s, col) {
    c.fillStyle = col; c.beginPath();
    for (let k = 0; k < 9; k++) { const a = (k / 9) * TAU, rr = s * (0.62 + r() * 0.5); c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8); }
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.2)'; c.beginPath(); c.ellipse(x - s * 0.2, y - s * 0.24, s * 0.3, s * 0.14, -0.4, 0, TAU); c.fill();
    for (let k = 0; k < 4; k++) { const a = r() * TAU, d = s * (1.2 + r() * 0.8); dot(c, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, 0.8 + r() * 1.6, col); }
  }

  // ---------------------------------------------- THE LOFT: WASH THE BRUSHES
  // Three big jars at the end of the studio bench, under a wall of white tiles,
  // each with three brushes left to dry bristles up and stiff with paint.
  // Wipe them and the bristles come up soft, the ferrules bright, the water in
  // the jars clear. Nothing is ever really clean in a studio, so the bench keeps
  // its old drips.
  // counter { what: 'brushes' }
  function washBrushes(S) {
    const { r, nz, bleed } = S;
    const BACK = 416, FRONT = 468, EDGE = 484; // the bench: its back edge, front edge and the foot of its lip
    const JARS = [{ x: 76, tint: COBALT }, { x: 182, tint: OCHRE }, { x: 288, tint: TEAL }].map((j) => Object.assign(j, { w: 88, y0: 322, y1: 448 }));
    const LOOKS = [
      { kind: 'flat', handle: '#b0352c', paint: COBALT, hair: '#ead9b4' },
      { kind: 'round', handle: '#2b3550', paint: RED, hair: '#8a5a36' },
      { kind: 'flat', handle: '#c8903a', paint: TEAL, hair: '#e3cfa6' },
      { kind: 'fan', handle: '#7d5434', paint: OCHRE, hair: '#ead9b4' },
      { kind: 'round', handle: '#3f7f6e', paint: COBALT, hair: '#94633d' },
      { kind: 'flat', handle: '#2b3550', paint: RED, hair: '#e3cfa6' },
      { kind: 'round', handle: '#b0352c', paint: OCHRE, hair: '#8a5a36' },
      { kind: 'fan', handle: '#c8903a', paint: TEAL, hair: '#ead9b4' },
      { kind: 'flat', handle: '#3f7f6e', paint: RED, hair: '#e3cfa6' },
    ];
    const brushes = [];
    JARS.forEach((j, n) => {
      // the outer jars lean inwards, so every brush stays on the bench
      const lean = n === 0 ? [-0.1, 0.03, 0.2] : n === 1 ? [-0.2, 0.01, 0.2] : [-0.2, -0.03, 0.1];
      [[-22, lean[0], 330], [2, lean[1], 356], [24, lean[2], 322]].forEach(([dx, a, len], k) => {
        const look = LOOKS[n * 3 + k], ux = Math.sin(a), uy = -Math.cos(a);
        brushes.push(Object.assign({ x: j.x + dx, y: 438, ux, uy, nx: -uy, ny: ux, len: len + (r() - 0.5) * 12, hairs: look.kind === 'fan' ? 40 : look.kind === 'flat' ? 56 : 52 }, look));
      });
    });
    const at = (b, d, n) => [b.x + b.ux * d + b.nx * n, b.y + b.uy * d + b.ny * n];
    const poly = (p, b, pts) => { pts.forEach(([d, n], i) => { const [x, y] = at(b, d, n); if (i) p.lineTo(x, y); else p.moveTo(x, y); }); p.closePath(); };
    // the three parts of a brush, in distance from the foot of the handle
    const handleEnd = (b) => b.len - b.hairs - 26, ferruleEnd = (b) => b.len - b.hairs;
    function handlePath(p, b) { const e = handleEnd(b); poly(p, b, [[0, -3.5], [e * 0.72, -7], [e, -5.5], [e, 5.5], [e * 0.72, 7], [0, 3.5]]); }
    function ferrulePath(p, b) {
      const e = handleEnd(b), f = ferruleEnd(b), w = b.kind === 'round' ? 8 : 15;
      poly(p, b, [[e, -6], [f, -w], [f, w], [e, 6]]);
    }
    function hairPath(p, b) {
      const f = ferruleEnd(b), L = b.len;
      if (b.kind === 'flat') poly(p, b, [[f, -15], [L - 4, -17], [L, -12], [L + 1, 0], [L, 12], [L - 4, 17], [f, 15]]);
      else if (b.kind === 'fan') {
        const [x, y] = at(b, f, 0), a = Math.atan2(b.uy, b.ux);
        p.moveTo(x, y); p.arc(x, y, b.hairs, a - 0.72, a + 0.72); p.closePath();
      } else {
        const [ax, ay] = at(b, f, -8), [bx, by] = at(b, f + b.hairs * 0.42, -13), [tx, ty] = at(b, L, 0), [ex, ey] = at(b, f + b.hairs * 0.42, 13), [gx, gy] = at(b, f, 8);
        p.moveTo(ax, ay); p.quadraticCurveTo(bx, by, tx, ty); p.quadraticCurveTo(ex, ey, gx, gy); p.closePath();
      }
    }
    const region = new Path2D();
    for (const b of brushes) { handlePath(region, b); ferrulePath(region, b); hairPath(region, b); }
    for (const j of JARS) rrPath(region, j.x - j.w / 2, j.y0, j.w, j.y1 - j.y0, 14);

    // the wall of white tiles, a cobalt band, the shelf and the old bench; it
    // uses its own numbers, so it can be painted again behind the glass and match
    function wall(c, x0, y0, x1, y1) {
      const s = 36, q = U.rng(315);
      c.fillStyle = '#d9d3c4'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
      for (let j = Math.floor(y0 / s); j * s < y1; j++) {
        for (let i = Math.floor(x0 / s) - 1; i * s < x1; i++) {
          const x = i * s + (j % 2 ? s / 2 : 0), y = j * s + 8;
          c.fillStyle = j === 6 ? U.shade(COBALT, (q() - 0.5) * 0.12) : U.shade('#f5f1e7', (q() - 0.5) * 0.06);
          c.fillRect(x + 1, y + 1, s - 2, s - 2);
          c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(x + 2, y + 2, s - 4, 2);
        }
      }
    }
    function bench(c, x0, x1) {
      c.fillStyle = lin(c, 0, BACK, 0, FRONT, [[0, '#a87e54'], [1, '#c79f6e']]); c.fillRect(x0, BACK, x1 - x0, FRONT - BACK);
      for (const y of [430, 447]) { c.fillStyle = 'rgba(70,40,20,0.22)'; c.fillRect(x0, y, x1 - x0, 1.2); }
      c.fillStyle = '#8a5f3c'; c.fillRect(x0, FRONT, x1 - x0, EDGE - FRONT);
      c.fillStyle = 'rgba(255,230,190,0.3)'; c.fillRect(x0, FRONT, x1 - x0, 2);
      // years of drips and rings that no one is going to wipe off
      const q = U.rng(4411);
      for (let i = 0; i < 44; i++) {
        const x = x0 + q() * (x1 - x0), y = BACK + 4 + q() * (FRONT - BACK - 8), col = U.pick(q, [COBALT, OCHRE, RED, TEAL, CHALK]);
        c.fillStyle = col; c.globalAlpha = 0.7; c.beginPath(); c.ellipse(x, y, 1.4 + q() * 4, 0.9 + q() * 2, 0, 0, TAU); c.fill(); c.globalAlpha = 1;
      }
      for (let i = 0; i < 16; i++) {
        const x = x0 + q() * (x1 - x0), col = U.pick(q, [COBALT, OCHRE, RED, TEAL]), h = 8 + q() * 22;
        c.fillStyle = col; c.beginPath(); c.roundRect(x, FRONT, 2.6, h, 1.3); c.fill(); dot(c, x + 1.3, FRONT + h, 2, col);
      }
    }
    // one brush as it is once washed
    function brushClean(c, b) {
      const across = (d) => { const [ax, ay] = at(b, d, -16), [bx, by] = at(b, d, 16); return [ax, ay, bx, by]; };
      const hp = new Path2D(); handlePath(hp, b);
      const e = handleEnd(b), [a0, a1, a2, a3] = across(e * 0.7);
      c.fillStyle = lin(c, a0, a1, a2, a3, [[0.26, U.shade(b.handle, -0.3)], [0.44, U.shade(b.handle, 0.3)], [0.58, b.handle], [0.74, U.shade(b.handle, -0.34)]]); c.fill(hp);
      const fp = new Path2D(); ferrulePath(fp, b);
      const [f0, f1, f2, f3] = across(e + 12);
      c.fillStyle = lin(c, f0, f1, f2, f3, [[0.08, '#7f868c'], [0.3, '#eef1f3'], [0.5, '#bcc3c8'], [0.72, '#d6dbdf'], [0.94, '#6f767c']]); c.fill(fp);
      c.strokeStyle = 'rgba(40,45,50,0.4)'; c.lineWidth = 1;
      for (const d of [e + 5, e + 21]) { const w = 8 + ((d - e) / 26) * (b.kind === 'round' ? 1 : 7); const [p0, p1] = at(b, d, -w), [p2, p3] = at(b, d, w); c.beginPath(); c.moveTo(p0, p1); c.lineTo(p2, p3); c.stroke(); }
      const hairs = new Path2D(); hairPath(hairs, b);
      c.save(); c.clip(hairs);
      c.fillStyle = b.hair; c.fill(hairs);
      const f = ferruleEnd(b), q = U.rng(b.len * 37);
      c.lineWidth = 1;
      for (let k = 0; k < 90; k++) {
        const n = (q() - 0.5) * (b.kind === 'fan' ? 90 : 34), s = 0.2 * q();
        const [x0, y0] = at(b, f - 2, n * 0.4), [x1, y1] = at(b, f + b.hairs * (0.7 + s * 2.4), n);
        c.strokeStyle = q() < 0.5 ? U.shade(b.hair, -0.2) : U.shade(b.hair, 0.28);
        c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
      }
      const [g0, g1] = at(b, f, 0), [g2, g3] = at(b, f + 14, 0);
      c.fillStyle = lin(c, g0, g1, g2, g3, [[0, 'rgba(40,25,15,0.35)'], [1, 'rgba(40,25,15,0)']]); c.fill(hairs);
      c.restore();
    }
    // the same brush left to dry: its hairs one stiff lump of paint
    function brushDirty(c, b) {
      const hp = new Path2D(); handlePath(hp, b);
      c.fillStyle = U.mix(b.handle, '#8d8272', 0.62); c.fill(hp);
      const fp = new Path2D(); ferrulePath(fp, b);
      c.fillStyle = '#7f7a70'; c.fill(fp);
      const q = U.rng(b.len * 53), e = handleEnd(b), f = ferruleEnd(b);
      const hairs = new Path2D(); hairPath(hairs, b);
      c.save(); c.clip(hairs);
      c.fillStyle = U.shade(b.paint, -0.18); c.fill(hairs);
      for (let k = 0; k < 26; k++) {
        const [x, y] = at(b, f + q() * b.hairs, (q() - 0.5) * (b.kind === 'fan' ? 80 : 30));
        c.fillStyle = q() < 0.55 ? U.shade(b.paint, 0.2) : U.shade(b.paint, -0.34);
        c.beginPath(); c.ellipse(x, y, 3 + q() * 7, 2 + q() * 4, q() * 3, 0, TAU); c.fill();
      }
      c.restore();
      // paint run down over the ferrule and dried in drips along the handle
      c.save(); c.clip(fp);
      for (let k = 0; k < 7; k++) { const [x, y] = at(b, e + 8 + q() * 20, (q() - 0.5) * 22); dot(c, x, y, 2 + q() * 4.4, U.shade(b.paint, (q() - 0.5) * 0.3)); }
      c.restore();
      c.save(); c.clip(hp);
      for (let k = 0; k < 5; k++) { const [x, y] = at(b, e * (0.56 + q() * 0.44), (q() - 0.5) * 10); c.fillStyle = U.shade(b.paint, (q() - 0.5) * 0.3); c.beginPath(); c.ellipse(x, y, 2 + q() * 2, 4 + q() * 9, Math.atan2(b.ny, b.nx), 0, TAU); c.fill(); }
      c.restore();
    }
    function jarGlass(c, j, dirty) {
      const x = j.x - j.w / 2, w = j.w;
      c.save(); c.beginPath(); c.roundRect(x, j.y0, w, j.y1 - j.y0, 14); c.clip();
      const wy = j.y0 + 40;
      if (dirty) {
        c.fillStyle = U.mix(j.tint, '#6b6355', 0.55); c.globalAlpha = 0.86; c.fillRect(x, wy, w, j.y1 - wy); c.globalAlpha = 1;
        c.fillStyle = 'rgba(190,180,160,0.5)'; c.fillRect(x, j.y0, w, wy - j.y0);
        c.fillStyle = U.shade(U.mix(j.tint, '#6b6355', 0.4), -0.2); c.fillRect(x, wy - 2, w, 7);
        const q = U.rng(j.x * 7);
        for (let k = 0; k < 9; k++) { c.strokeStyle = `rgba(90,80,66,${(0.2 + q() * 0.3).toFixed(2)})`; c.lineWidth = 2 + q() * 5; const px = x + 6 + q() * (w - 12), py = j.y0 + q() * 30; c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(px + (q() - 0.5) * 12, py + 40, px + (q() - 0.5) * 8, py + 70 + q() * 30); c.stroke(); }
      } else {
        c.fillStyle = 'rgba(214,236,244,0.28)'; c.fillRect(x, j.y0, w, j.y1 - j.y0);
        c.fillStyle = 'rgba(160,205,226,0.3)'; c.fillRect(x, wy, w, j.y1 - wy);
        c.fillStyle = 'rgba(255,255,255,0.55)'; c.fillRect(x, wy - 1, w, 2.4);
        c.fillStyle = 'rgba(255,255,255,0.38)'; c.fillRect(x + 8, j.y0 + 10, 9, j.y1 - j.y0 - 24);
        c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(x + w - 16, j.y0 + 16, 5, j.y1 - j.y0 - 34);
      }
      c.restore();
      c.strokeStyle = dirty ? 'rgba(90,80,66,0.5)' : 'rgba(150,185,200,0.75)'; c.lineWidth = 2;
      c.beginPath(); c.roundRect(x + 1, j.y0 + 1, w - 2, j.y1 - j.y0 - 2, 13); c.stroke();
      c.fillStyle = dirty ? 'rgba(150,140,120,0.7)' : 'rgba(220,238,244,0.9)'; c.beginPath(); c.ellipse(j.x, j.y0 + 2, w / 2 - 4, 4.4, 0, 0, TAU); c.fill();
    }
    return {
      family: 'wipe', particle: 'suds', region, fillRule: 'nonzero',
      tough: (x, y) => (y < 250 ? 1.5 : nz.fbm(x * 0.05 + 8, y * 0.05, 3) > 0.62 ? 1.3 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        wall(c, x0, y0, x1, BACK);
        bench(c, x0, x1);
        // cupboards under the bench, with the same old drips down their doors
        c.fillStyle = '#3f6a9a'; c.fillRect(x0, EDGE, x1 - x0, y1 - EDGE);
        for (const [a, b] of [[x0 - 40, 56], [64, 176], [184, 296], [304, x1 + 40]]) {
          c.fillStyle = '#4c7aab'; c.fillRect(a, EDGE + 8, b - a, y1 - EDGE);
          c.fillStyle = '#42709f'; c.fillRect(a + 12, EDGE + 20, b - a - 24, y1 - EDGE);
          c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(a, EDGE + 8, b - a, 1.6);
        }
        for (const x of [160, 200]) { dot(c, x, EDGE + 44, 4.4, '#c9a24a'); dot(c, x - 1, EDGE + 43, 1.5, '#f2d88a'); }
        c.fillStyle = 'rgba(30,18,10,0.3)'; c.fillRect(x0, EDGE, x1 - x0, 7);
        // a shelf of tins high on the wall, in the sun
        c.fillStyle = '#a77b56'; c.fillRect(x0, 76, x1 - x0, 7); c.fillStyle = 'rgba(40,25,10,0.22)'; c.fillRect(x0, 83, x1 - x0, 5);
        const q = U.rng(2719);
        for (let x = x0 + 8; x < x1 - 10;) {
          const tw = 22 + q() * 12, th = 24 + q() * 16, col = U.pick(q, [COBALT, OCHRE, RED, TEAL, CHALK, '#c9744a']);
          c.fillStyle = col; c.fillRect(x, 76 - th, tw, th);
          c.fillStyle = 'rgba(255,255,255,0.28)'; c.fillRect(x + 2, 76 - th, 3, th);
          c.fillStyle = '#b9c0c4'; c.fillRect(x - 1, 76 - th - 3, tw + 2, 3);
          c.fillStyle = col === CHALK ? '#d9c9ac' : 'rgba(255,255,255,0.55)'; c.fillRect(x + 4, 76 - th * 0.6, tw - 8, th * 0.28);
          x += tw + 8 + q() * 12;
        }
        // a cake of soap on a saucer and a folded rag on the bench
        c.fillStyle = 'rgba(40,25,10,0.22)'; c.beginPath(); c.ellipse(30, 464, 22, 5, 0, 0, TAU); c.fill();
        c.fillStyle = '#eef1f3'; c.beginPath(); c.ellipse(28, 460, 20, 6, 0, 0, TAU); c.fill();
        c.fillStyle = '#efd9c0'; c.beginPath(); c.roundRect(16, 451, 24, 8, 3); c.fill();
        c.fillStyle = 'rgba(40,25,10,0.2)'; c.fillRect(304, 462, 50, 5);
        c.fillStyle = '#f2ecdf'; c.beginPath(); c.roundRect(302, 452, 50, 12, 3); c.fill();
        c.fillStyle = COBALT; c.fillRect(302, 456, 50, 2.4);
        softShadow(c, region, 10, 0.26, 5, 6);
      },
      clean(c) {
        wall(c, -10, -10, W + 10, BACK);
        bench(c, -10, W + 10);
        for (const b of brushes) brushClean(c, b);
        for (const j of JARS) jarGlass(c, j, false);
      },
      dirt(c) {
        const g = ramp(['#94897a', '#a59a8a', '#b5aa99', '#c3b9a8']);
        field(c, 0, 80, W, 460, 2, (x, y) => [...g(nz.fbm(x * 0.03, y * 0.03, 4)), 245]);
        for (const b of brushes) brushDirty(c, b);
        for (const j of JARS) jarGlass(c, j, true);
        grime(c, r, 0, 90, W, 450, 26);
        for (let i = 0; i < 700; i++) { c.fillStyle = 'rgba(70,60,48,0.22)'; c.fillRect(r() * W, 90 + r() * 360, 1.2, 1.2); }
      },
    };
  }

  // ------------------------------------------------- THE LOFT: THE STORE OF FRAMES
  // The back of the loft, under the rafters: frames of every kind hung on the
  // limewashed boards, some with old paintings still in them, and the big ones
  // leaning against the wall on the floor. Everything has a coat of dust; the
  // gilt comes up bright as it goes.
  // attic { where: 'loft' }
  function frameStore(S) {
    const { r, nz, bleed } = S;
    const X0 = -6, X1 = 366, Y0 = 90, Y1 = 556;
    const GILT = { outer: '#a97c28', mid: '#e3bb58', inner: '#7a5a1e', t: 12, beads: true };
    const OAK = { outer: '#7d5434', mid: '#a0754c', inner: '#5e3e28', t: 10 };
    const BLACK = { outer: '#2b2a30', mid: '#45444d', inner: '#17161a', t: 8 };
    const WHITE = { outer: '#efe9dc', mid: '#faf6ec', inner: '#cfc6b3', t: 9 };
    const BLUE = { outer: '#2c5a9e', mid: '#3f6fb0', inner: '#223f70', t: 9 };
    const PICS = ['hills', 'sea', 'poppies', 'cat', 'bowl', 'moon', 'house', 'sun'];
    // the hanging ones, a little askew; the pictures change places with the seed
    const pics = PICS.slice();
    for (let i = pics.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [pics[i], pics[j]] = [pics[j], pics[i]]; }
    const HUNG = [
      { x: 28, y: 110, w: 104, h: 128, s: GILT, p: pics[0], a: -0.012 },
      { x: 146, y: 104, w: 78, h: 66, s: OAK, p: pics[1], a: 0.02 },
      { x: 238, y: 112, w: 92, h: 108, s: BLACK, p: pics[2], a: -0.01 },
      { x: 148, y: 184, w: 76, h: 96, s: WHITE, p: '', a: -0.02 },
      { x: 36, y: 252, w: 86, h: 70, s: BLUE, p: pics[3], a: 0.016 },
      { x: 240, y: 234, w: 88, h: 74, s: GILT, p: pics[4], a: 0.012 },
    ];
    // the big ones on the floor, leaning on the wall, back to front
    const LEAN = [
      { x: 30, y: 344, w: 150, h: 200, s: OAK, p: '', a: -0.03 },
      { x: 186, y: 330, w: 142, h: 214, s: GILT, p: '', a: 0.03 },
      { x: 92, y: 392, w: 118, h: 150, s: GILT, p: '', a: 0.02 },
      { x: 214, y: 420, w: 104, h: 124, s: BLACK, p: pics[5], a: -0.02 },
    ];
    const region = new Path2D(); region.rect(X0, Y0, X1 - X0, Y1 - Y0);

    function back(c, x0, y0, x1, y1) { limewash(c, U.rng(77), nz, x0, y0, x1, y1); }
    function floorboards(c, x0, y0, x1, y1) {
      c.fillStyle = '#6e4d32'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
      for (let y = y0, k = 0; y < y1; y += 10 + k * 2.4, k++) { c.fillStyle = U.shade('#94693f', ((k * 5) % 4) * 0.04 - 0.05); c.fillRect(x0, y + 1, x1 - x0, 9 + k * 2.4 - 1.6); }
    }
    // the little paintings
    function painting(c, kind, x, y, w, h, q) {
      c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
      const sky = (a, b, end = 0.62) => { c.fillStyle = lin(c, 0, y, 0, y + h * end, [[0, a], [1, b]]); c.fillRect(x, y, w, h); };
      if (kind === 'hills') {
        sky(COBALT, '#b5cfe6');
        dot(c, x + w * 0.72, y + h * 0.24, w * 0.1, CHALK);
        c.fillStyle = OCHRE; c.beginPath(); c.moveTo(x, y + h * 0.66); c.quadraticCurveTo(x + w * 0.4, y + h * 0.44, x + w, y + h * 0.62); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.fill();
        c.fillStyle = '#b5713a'; c.beginPath(); c.moveTo(x, y + h * 0.86); c.quadraticCurveTo(x + w * 0.6, y + h * 0.62, x + w, y + h * 0.84); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.fill();
      } else if (kind === 'sea') {
        sky('#cfe3ef', '#f6efdf', 0.5);
        c.fillStyle = COBALT; c.fillRect(x, y + h * 0.56, w, h * 0.44);
        c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1; for (let k = 0; k < 4; k++) { const ly = y + h * (0.64 + k * 0.1); c.beginPath(); c.moveTo(x + w * 0.1, ly); c.lineTo(x + w * 0.5 + k * 6, ly); c.stroke(); }
        c.fillStyle = CHALK; c.beginPath(); c.moveTo(x + w * 0.5, y + h * 0.16); c.lineTo(x + w * 0.5, y + h * 0.52); c.lineTo(x + w * 0.76, y + h * 0.52); c.fill();
        c.fillStyle = '#b0352c'; c.beginPath(); c.moveTo(x + w * 0.3, y + h * 0.54); c.lineTo(x + w * 0.8, y + h * 0.54); c.lineTo(x + w * 0.7, y + h * 0.64); c.lineTo(x + w * 0.38, y + h * 0.64); c.fill();
      } else if (kind === 'poppies') {
        sky('#f0d9a6', '#f7ecd2', 0.42);
        c.fillStyle = lin(c, 0, y + h * 0.42, 0, y + h, [[0, '#7aa25a'], [1, '#4f7f3f']]); c.fillRect(x, y + h * 0.42, w, h * 0.58);
        for (let k = 0; k < 26; k++) { const py = y + h * (0.46 + q() * 0.52); dot(c, x + q() * w, py, 1.4 + ((py - y) / h) * 3.4, U.pick(q, [RED, '#ef5a48'])); }
      } else if (kind === 'cat') {
        c.fillStyle = '#f2e8d2'; c.fillRect(x, y, w, h);
        const cx = x + w / 2, cy = y + h * 0.6, k = Math.min(w, h) / 70;
        c.fillStyle = '#26232b'; c.beginPath(); c.ellipse(cx + 2 * k, cy + 8 * k, 13 * k, 16 * k, 0, 0, TAU); c.fill();
        dot(c, cx - 3 * k, cy - 12 * k, 10 * k, '#26232b');
        c.beginPath(); c.moveTo(cx - 12 * k, cy - 16 * k); c.lineTo(cx - 12 * k, cy - 28 * k); c.lineTo(cx - 5 * k, cy - 20 * k); c.closePath(); c.moveTo(cx + 1 * k, cy - 20 * k); c.lineTo(cx + 6 * k, cy - 29 * k); c.lineTo(cx + 7 * k, cy - 15 * k); c.closePath(); c.fill();
      } else if (kind === 'bowl') {
        c.fillStyle = '#e9dcc0'; c.fillRect(x, y, w, h);
        c.fillStyle = '#b98f5a'; c.fillRect(x, y + h * 0.68, w, h * 0.32);
        dot(c, x + w * 0.4, y + h * 0.42, w * 0.11, RED); dot(c, x + w * 0.58, y + h * 0.4, w * 0.12, OCHRE); dot(c, x + w * 0.5, y + h * 0.5, w * 0.11, '#6f9a4a');
        c.fillStyle = COBALT; c.beginPath(); c.moveTo(x + w * 0.2, y + h * 0.52); c.lineTo(x + w * 0.8, y + h * 0.52); c.quadraticCurveTo(x + w * 0.74, y + h * 0.8, x + w * 0.5, y + h * 0.8); c.quadraticCurveTo(x + w * 0.26, y + h * 0.8, x + w * 0.2, y + h * 0.52); c.fill();
      } else if (kind === 'moon') {
        c.fillStyle = lin(c, 0, y, 0, y + h, [[0, '#1b2a55'], [1, '#3d5a8c']]); c.fillRect(x, y, w, h);
        dot(c, x + w * 0.66, y + h * 0.3, w * 0.13, '#fbefc8'); dot(c, x + w * 0.7, y + h * 0.27, w * 0.11, '#22325f');
        for (let k = 0; k < 14; k++) dot(c, x + q() * w, y + q() * h * 0.7, 0.7 + q() * 0.9, '#fff3cf');
        c.fillStyle = '#16203f'; c.beginPath(); c.moveTo(x, y + h * 0.84); c.quadraticCurveTo(x + w * 0.5, y + h * 0.66, x + w, y + h * 0.82); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.fill();
      } else if (kind === 'house') {
        sky('#bfe2ef', '#eef4e6');
        c.fillStyle = '#8fbd78'; c.fillRect(x, y + h * 0.68, w, h * 0.32);
        c.fillStyle = '#f2d88a'; c.fillRect(x + w * 0.3, y + h * 0.42, w * 0.4, h * 0.3);
        c.fillStyle = '#b0352c'; c.beginPath(); c.moveTo(x + w * 0.24, y + h * 0.44); c.lineTo(x + w * 0.5, y + h * 0.2); c.lineTo(x + w * 0.76, y + h * 0.44); c.fill();
        c.fillStyle = COBALT; c.fillRect(x + w * 0.45, y + h * 0.54, w * 0.1, h * 0.18);
      } else {
        sky('#f7c97a', '#fbe8c2', 0.7);
        dot(c, x + w / 2, y + h * 0.44, Math.min(w, h) * 0.2, '#ef8f3a');
        c.strokeStyle = '#ef8f3a'; c.lineWidth = 2; for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU, r0 = Math.min(w, h) * 0.25, r1 = Math.min(w, h) * 0.34; c.beginPath(); c.moveTo(x + w / 2 + Math.cos(a) * r0, y + h * 0.44 + Math.sin(a) * r0); c.lineTo(x + w / 2 + Math.cos(a) * r1, y + h * 0.44 + Math.sin(a) * r1); c.stroke(); }
        c.fillStyle = COBALT; c.fillRect(x, y + h * 0.8, w, h * 0.2);
      }
      c.fillStyle = 'rgba(70,50,20,0.1)'; c.fillRect(x, y, w, h);
      c.restore();
    }
    function frame(c, f, i) {
      const { x, y, w, h, s, p, a } = f, t = s.t, q = U.rng(i * 113 + 9);
      c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(a); c.translate(-w / 2, -h / 2);
      c.fillStyle = 'rgba(50,38,24,0.3)'; c.fillRect(4, 6, w, h);
      // the wire it hangs by
      if (y < 330) { c.strokeStyle = 'rgba(90,80,66,0.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(w * 0.28, 2); c.lineTo(w / 2, -9); c.lineTo(w * 0.72, 2); c.stroke(); dot(c, w / 2, -10, 2, '#8a7a62'); }
      c.fillStyle = lin(c, 0, 0, w, h, [[0, s.mid], [0.5, s.outer], [1, s.mid]]); c.fillRect(0, 0, w, h);
      // the four sides, lit from the top left, and the mitres in the corners
      c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(0, 0, w, 2); c.fillRect(0, 0, 2, h);
      c.fillStyle = 'rgba(20,10,5,0.25)'; c.fillRect(0, h - 2, w, 2); c.fillRect(w - 2, 0, 2, h);
      c.strokeStyle = 'rgba(30,18,8,0.28)'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(t, t); c.moveTo(w, 0); c.lineTo(w - t, t); c.moveTo(0, h); c.lineTo(t, h - t); c.moveTo(w, h); c.lineTo(w - t, h - t); c.stroke();
      if (s.beads) {
        for (let k = t + 4; k < w - t - 2; k += 6) { dot(c, k, t * 0.55, 1.6, '#f6dd8e'); dot(c, k, h - t * 0.55, 1.6, '#c9982f'); }
        for (let k = t + 4; k < h - t - 2; k += 6) { dot(c, t * 0.55, k, 1.6, '#f6dd8e'); dot(c, w - t * 0.55, k, 1.6, '#c9982f'); }
      }
      c.fillStyle = s.inner; c.fillRect(t - 2, t - 2, w - 2 * t + 4, h - 2 * t + 4);
      if (p) painting(c, p, t, t, w - 2 * t, h - 2 * t, q);
      else {
        // nothing in it but the wall behind
        c.fillStyle = '#ece8dc'; c.fillRect(t, t, w - 2 * t, h - 2 * t);
        c.fillStyle = 'rgba(150,135,110,0.18)'; for (let k = t + 8; k < w - t; k += 26) c.fillRect(k, t, 1.4, h - 2 * t);
        c.fillStyle = 'rgba(50,38,24,0.16)'; c.fillRect(t, t, w - 2 * t, 5); c.fillRect(t, t, 4, h - 2 * t);
      }
      c.restore();
    }
    return {
      family: 'dust', particle: 'dust', region,
      tough: (x, y) => (x < 24 || x > 336 || y > 536 ? 1.4 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        back(c, x0, y0, x1, Y1);
        floorboards(c, x0, Y1, x1, y1);
        // the rafters and the tie beam overhead
        c.fillStyle = '#6e4a30'; c.beginPath(); c.moveTo(x0, 60); c.lineTo(180, y0 - 50); c.lineTo(x1, 60); c.lineTo(x1, 86); c.lineTo(180, y0 - 24); c.lineTo(x0, 86); c.closePath(); c.fill();
        c.fillStyle = '#5e3e28'; c.fillRect(x0, 66, x1 - x0, 18);
        c.fillStyle = 'rgba(255,220,180,0.2)'; c.fillRect(x0, 66, x1 - x0, 2.5);
        c.fillStyle = 'rgba(30,18,10,0.25)'; c.fillRect(x0, 84, x1 - x0, 7);
        c.fillStyle = '#ddd5c4'; c.fillRect(x0, Y1 - 8, x1 - x0, 8);
      },
      clean(c) {
        back(c, 0, Y0 - 10, W, Y1);
        c.fillStyle = 'rgba(30,18,10,0.2)'; c.fillRect(0, Y0, W, 4);
        c.fillStyle = '#ddd5c4'; c.fillRect(0, Y1 - 8, W, 8);
        HUNG.forEach((f, i) => frame(c, f, i));
        floorboards(c, 0, Y1 - 2, W, Y1);
        c.fillStyle = 'rgba(50,38,24,0.2)'; c.fillRect(0, Y1 - 14, W, 12);
        LEAN.forEach((f, i) => frame(c, f, i + 10));
      },
      liveTop(c, t) {
        // light from the skylight with dust drifting in it
        c.save();
        c.globalCompositeOperation = 'lighter';
        const g = c.createLinearGradient(0, 40, 0, 560);
        g.addColorStop(0, 'rgba(255,240,205,0.08)'); g.addColorStop(1, 'rgba(255,240,205,0)');
        c.fillStyle = g;
        for (const k of [1, 0.74, 0.5]) { c.beginPath(); c.moveTo(70 - 50 * k, 40); c.lineTo(70 + 50 * k, 40); c.lineTo(210 + 90 * k, 560); c.lineTo(210 - 90 * k, 560); c.closePath(); c.fill(); }
        for (let i = 0; i < 20; i++) {
          const ph = i * 1.7, x = 60 + ((i * 47) % 200) + Math.sin(t * 0.3 + ph) * 10, y = 100 + ((i * 67 + t * 5) % 430);
          c.fillStyle = `rgba(255,248,220,${(0.2 + 0.2 * Math.sin(t + ph)).toFixed(3)})`; c.beginPath(); c.arc(x, y, 1.2, 0, TAU); c.fill();
        }
        c.restore();
      },
      dirt(c) {
        const g = ramp(['#a39a8b', '#b3aa9b', '#c1b9ab', '#cdc6b9']);
        field(c, 0, Y0 - 4, W, Y1 + 4, 2, (x, y) => [...g(nz.fbm(x * 0.03 + 5, y * 0.03, 5)), 248]);
        // the frames still show faintly under the dust
        for (const f of HUNG.concat(LEAN)) {
          c.save(); c.translate(f.x + f.w / 2, f.y + f.h / 2); c.rotate(f.a);
          c.strokeStyle = 'rgba(92,80,62,0.34)'; c.lineWidth = f.s.t; c.strokeRect(-f.w / 2 + f.s.t / 2, -f.h / 2 + f.s.t / 2, f.w - f.s.t, f.h - f.s.t);
          c.fillStyle = 'rgba(150,140,126,0.5)'; c.fillRect(-f.w / 2 - 2, -f.h / 2 - 3, f.w + 4, 6);
          c.restore();
        }
        for (const f of HUNG.concat(LEAN)) for (let i = 0; i < 3; i++) bunny(c, r, f.x + 8 + r() * (f.w - 16), f.y - 1, 6 + r() * 7);
        for (let i = 0; i < 10; i++) bunny(c, r, 20 + r() * 320, Y1 - 6 - r() * 8, 7 + r() * 9);
        for (let i = 0; i < 700; i++) { c.fillStyle = 'rgba(90,80,66,0.24)'; c.fillRect(X0 + r() * (X1 - X0), Y0 + r() * (Y1 - Y0), 1.2, 1.2); }
        cobweb(c, 0, Y0, 0, 60); cobweb(c, W, Y0, Math.PI / 2, 52);
        cobweb(c, 180, 322, 0.5, 30); cobweb(c, W, Y1, Math.PI, 40);
      },
    };
  }

  // ------------------------------------------------------ THE LOFT: THE SWING SEAT
  // A long garden swing hung from an oak frame in the yard, against the loft's
  // white wall: a curved top rail, slats, arms and a seat of three boards, all
  // in the player's colour, on two lengths of chain.
  // fence { what: 'swing' }
  function swingSeat(S) {
    const { r, nz, bleed } = S;
    const GROUND = 486;
    const L = 62, R = 298, TOP = 232, BELOW = 350, SEAT0 = 376, SEAT1 = 422;
    const SLATS = 9, slatW = 16, slatGap = (R - L - 34 - SLATS * slatW) / (SLATS - 1);
    const slats = [];
    for (let k = 0; k < SLATS; k++) slats.push(L + 17 + k * (slatW + slatGap));
    const railTop = (p) => { p.moveTo(L, TOP + 20); p.quadraticCurveTo(180, TOP - 24, R, TOP + 20); p.lineTo(R, TOP + 46); p.quadraticCurveTo(180, TOP + 2, L, TOP + 46); p.closePath(); };
    const railY = (x) => { const t = (x - L) / (R - L); return (1 - t) * (1 - t) * (TOP + 46) + 2 * (1 - t) * t * (TOP + 2) + t * t * (TOP + 46); };
    const region = new Path2D();
    railTop(region);
    for (const x of slats) region.rect(x, railY(x + slatW / 2) - 4, slatW, BELOW - railY(x + slatW / 2) + 8);
    region.rect(L, BELOW, R - L, 18);                    // the lower rail
    region.rect(L, TOP + 24, 15, SEAT0 - TOP - 20); region.rect(R - 15, TOP + 24, 15, SEAT0 - TOP - 20); // the back posts
    rrPath(region, L - 12, SEAT0, R - L + 24, 14, 5); rrPath(region, L - 12, SEAT0 + 16, R - L + 24, 14, 5); rrPath(region, L - 12, SEAT0 + 32, R - L + 24, 14, 6);
    for (const x of [L - 16, R - 34]) { rrPath(region, x, 300, 50, 13, 6); }   // the arms
    for (const x of [L - 8, R - 8]) region.rect(x, 312, 16, SEAT0 - 310);       // the arm posts
    const seat = new Path2D(); seat.addPath(region);

    function chain(c, x0, y0, x1, y1) {
      const n = Math.round(Math.hypot(x1 - x0, y1 - y0) / 8), a = Math.atan2(y1 - y0, x1 - x0);
      for (let k = 0; k <= n; k++) {
        const t = k / n, x = U.lerp(x0, x1, t), y = U.lerp(y0, y1, t);
        c.save(); c.translate(x, y); c.rotate(a);
        c.strokeStyle = 'rgba(30,26,22,0.5)'; c.lineWidth = 2.6; c.beginPath(); if (k % 2) c.ellipse(0.8, 0.8, 5.4, 2.2, 0, 0, TAU); else { c.moveTo(-4.6, 0.8); c.lineTo(6, 0.8); } c.stroke();
        c.strokeStyle = '#8d9299'; c.lineWidth = 1.8; c.beginPath(); if (k % 2) c.ellipse(0, 0, 5.4, 2.2, 0, 0, TAU); else { c.moveTo(-5, 0); c.lineTo(5, 0); } c.stroke();
        c.restore();
      }
    }
    function oak(c, x0, y0, x1, y1, thick) {
      c.strokeStyle = '#7d5434'; c.lineWidth = thick; c.lineCap = 'butt'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
      c.strokeStyle = 'rgba(255,225,185,0.2)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0 - thick * 0.3, y0); c.lineTo(x1 - thick * 0.3, y1); c.stroke();
      c.strokeStyle = 'rgba(40,22,10,0.24)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0 + thick * 0.34, y0); c.lineTo(x1 + thick * 0.34, y1); c.stroke();
    }
    return {
      family: 'paint', particle: 'paint', region, fillRule: 'nonzero',
      tough: (x, y) => (y > SEAT0 - 4 ? 1.35 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        limewash(c, U.rng(91), nz, x0, y0, x1, GROUND);
        cobbles(c, U.rng(92), x0, GROUND, x1, y1);
        c.fillStyle = 'rgba(40,30,20,0.22)'; c.fillRect(x0, GROUND, x1 - x0, 6);
        // poppies along the foot of the wall, either side of the swing
        const q = U.rng(93);
        for (let i = 0; i < 30; i++) {
          const x = x0 + q() * (x1 - x0), h = 22 + q() * 34;
          c.strokeStyle = '#5d8a48'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, GROUND + 2); c.quadraticCurveTo(x + (q() - 0.5) * 8, GROUND - h / 2, x + (q() - 0.5) * 10, GROUND - h); c.stroke();
          const fx = x + (q() - 0.5) * 8, fy = GROUND - h;
          c.fillStyle = U.pick(q, [RED, '#ef5a48', '#d3362a']); c.beginPath(); c.arc(fx, fy, 5 + q() * 3, 0, TAU); c.fill();
          dot(c, fx, fy, 1.6, '#2b2030');
        }
        // the oak frame: two A-shaped ends and the beam across the top
        oak(c, 34, 60, 6, GROUND + 26, 14); oak(c, 34, 60, 60, GROUND + 22, 14);
        oak(c, 326, 60, 300, GROUND + 22, 14); oak(c, 326, 60, 354, GROUND + 26, 14);
        c.fillStyle = '#7d5434'; c.fillRect(8, 52, 344, 22);
        c.fillStyle = 'rgba(255,225,185,0.22)'; c.fillRect(8, 52, 344, 2.5);
        c.fillStyle = 'rgba(40,22,10,0.25)'; c.fillRect(8, 70, 344, 4);
        for (const y of [62]) for (const x of [34, 326]) { dot(c, x, y, 3, '#3a3a40'); dot(c, x - 0.8, y - 0.8, 1, '#8d9299'); }
        // the shadow of the seat on the wall and of the frame on the cobbles
        softShadow(c, seat, 14, 0.3, 8, 16);
        c.fillStyle = 'rgba(40,30,20,0.2)'; c.beginPath(); c.ellipse(180, GROUND + 30, 150, 12, 0, 0, TAU); c.fill();
      },
      clean(c, paint) { c.fillStyle = paint; c.fillRect(0, 0, W, H); },
      cleanOver(c) {
        // the grain of the wood through the paint
        for (let i = 0; i < 240; i++) {
          const x = 30 + r() * 300, y = 190 + r() * 250, l = 14 + r() * 40;
          c.strokeStyle = r() < 0.7 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.1)'; c.lineWidth = 0.8;
          c.beginPath(); c.moveTo(x, y); if (y > SEAT0 || (y > 296 && y < 316) || (y > BELOW && y < BELOW + 18)) c.lineTo(x + l, y + (r() - 0.5) * 2); else c.lineTo(x + (r() - 0.5) * 2, y + l); c.stroke();
        }
        // the light along the top edges and the shadow under them
        c.save(); c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(L, TOP + 21); c.quadraticCurveTo(180, TOP - 23, R, TOP + 21); c.stroke(); c.restore();
        c.fillStyle = 'rgba(255,255,255,0.22)';
        c.fillRect(L, BELOW, R - L, 2.2);
        for (const y of [SEAT0, SEAT0 + 16, SEAT0 + 32]) c.fillRect(L - 12, y, R - L + 24, 2.4);
        for (const x of [L - 16, R - 34]) c.fillRect(x + 2, 300, 46, 2.4);
        c.fillStyle = 'rgba(0,0,0,0.16)';
        for (const y of [SEAT0 + 11, SEAT0 + 27, SEAT0 + 43]) c.fillRect(L - 12, y, R - L + 24, 3);
        c.fillRect(L, BELOW + 15, R - L, 3);
        for (const x of [L - 16, R - 34]) c.fillRect(x + 2, 310, 46, 3);
        for (const x of slats) { c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(x, TOP, 2, BELOW - TOP); c.fillStyle = 'rgba(0,0,0,0.13)'; c.fillRect(x + slatW - 3, TOP, 3, BELOW - TOP); }
      },
      dirt(c) {
        weatheredWood(c, r, nz, 30, TOP - 14, 334, SEAT1 + 4);
        peelingPaint(c, r, 40, TOP, 320, SEAT1, 70, '#d9d3c4');
        // green creeping up from the seat, and rust running down from the chains
        const gr = c.createLinearGradient(0, BELOW - 30, 0, SEAT1);
        gr.addColorStop(0, 'rgba(90,120,50,0)'); gr.addColorStop(1, 'rgba(90,120,50,0.55)');
        c.fillStyle = gr; c.fillRect(30, BELOW - 30, 304, SEAT1 - BELOW + 34);
        grime(c, r, 34, SEAT0 - 16, 326, SEAT1, 22);
        for (const x of [L + 8, R - 8]) { const g = c.createLinearGradient(0, 296, 0, 350); g.addColorStop(0, 'rgba(130,70,30,0.45)'); g.addColorStop(1, 'rgba(130,70,30,0)'); c.fillStyle = g; c.fillRect(x - 6, 296, 12, 54); }
      },
      top(c) {
        // two chains from the beam down to each arm, and the eyes and bolts that hold them
        const hooks = [[94, 74], [266, 74]], arms = [[L + 8, 300], [R - 8, 300]];
        for (let k = 0; k < 2; k++) {
          chain(c, hooks[k][0], hooks[k][1] + 6, arms[k][0], arms[k][1] + 2);
          dot(c, hooks[k][0], hooks[k][1] + 2, 6, '#3a3a40'); dot(c, hooks[k][0], hooks[k][1] + 2, 3.4, '#8d9299');
          dot(c, arms[k][0], arms[k][1] + 2, 4, '#3a3a40'); dot(c, arms[k][0] - 0.6, arms[k][1] + 1.4, 1.5, '#8d9299');
        }
        c.fillStyle = 'rgba(50,50,56,0.75)';
        for (const x of [L + 7, R - 7]) for (const y of [SEAT0 + 7, SEAT0 + 23, SEAT0 + 39, BELOW + 9]) { c.beginPath(); c.arc(x, y, 1.8, 0, TAU); c.fill(); }
      },
      stamp: paintStamp,
    };
  }

  // ------------------------------------------------- THE LOFT: POPPIES BY THE WALL
  // A long border under the loft's yard wall, gone over with weeds. Pull them
  // and the poppies come up underneath: papery scarlet petals with dark hearts,
  // grey-green leaves, nodding buds and seed heads, a few cornflowers among them.
  // bed { flower: 'poppy' }
  function poppyBed(S) {
    const { r, nz, bleed } = S;
    const WALL = 136;
    const region = new Path2D();
    rrPath(region, 20, 150, 320, 384, 28);
    const plants = [];
    for (let y = 174; y < 526; y += 40) for (let x = 42 + (((y - 174) / 40) % 2) * 20; x < 330; x += 40) {
      const px = x + (r() - 0.5) * 12, py = y + (r() - 0.5) * 12;
      if (inside(region, px, py)) plants.push([px, py]);
    }
    const bigWeeds = [];
    for (let i = 0; i < 14; i++) { const x = 40 + r() * 280, y = 170 + r() * 350; if (inside(region, x, y)) bigWeeds.push([x, y, 16 + r() * 10]); }
    function poppy(c, x, y, s, col) {
      const a0 = r() * TAU;
      for (let k = 0; k < 4; k++) {
        const a = a0 + (k * Math.PI) / 2, px = x + Math.cos(a) * s * 0.46, py = y + Math.sin(a) * s * 0.46;
        c.fillStyle = k % 2 ? col : U.shade(col, -0.12);
        c.beginPath();
        for (let j = 0; j < 10; j++) { const b = a - 1.5 + (j / 9) * 3, rr = s * (0.62 + (j % 2) * 0.1); c.lineTo(px + Math.cos(b) * rr, py + Math.sin(b) * rr); }
        c.lineTo(x, y); c.closePath(); c.fill();
      }
      c.strokeStyle = U.shade(col, -0.3); c.lineWidth = 0.7;
      for (let k = 0; k < 8; k++) { const a = a0 + (k / 8) * TAU; c.beginPath(); c.moveTo(x + Math.cos(a) * s * 0.3, y + Math.sin(a) * s * 0.3); c.lineTo(x + Math.cos(a) * s * 0.8, y + Math.sin(a) * s * 0.8); c.stroke(); }
      dot(c, x, y, s * 0.34, '#2b2030');
      c.fillStyle = '#5f5a6a'; for (let k = 0; k < 10; k++) { const a = (k / 10) * TAU; c.beginPath(); c.arc(x + Math.cos(a) * s * 0.3, y + Math.sin(a) * s * 0.3, 0.9, 0, TAU); c.fill(); }
      dot(c, x, y, s * 0.15, '#a9b86c');
    }
    return {
      family: 'weed', particle: 'weed', region, depth: true,
      tough(x, y) { for (const [wx, wy, s] of bigWeeds) if (Math.hypot(x - wx, y - wy) < s * 0.6) return 1.6; return 1; },
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        limewash(c, U.rng(61), nz, x0, y0, x1, WALL);
        cobbles(c, U.rng(62), x0, WALL, x1, y1);
        c.fillStyle = 'rgba(40,30,20,0.25)'; c.fillRect(x0, WALL, x1 - x0, 7);
        // the foot of the wall: a cobalt band of the mural just showing, and a stone kerb round the bed
        c.fillStyle = COBALT; c.globalAlpha = 0.85; c.fillRect(x0, y0, x1 - x0, 34 - y0); c.globalAlpha = 1;
        c.fillStyle = OCHRE; c.beginPath(); c.moveTo(x0, 34); c.quadraticCurveTo(120, 8, 220, 28); c.quadraticCurveTo(290, 40, x1, 22); c.lineTo(x1, 34); c.closePath(); c.fill();
        softShadow(c, region, 6, 0.3);
        c.save(); c.strokeStyle = '#a8a091'; c.lineWidth = 12; c.setLineDash([18, 3]); c.stroke(region); c.restore();
        c.save(); c.strokeStyle = 'rgba(255,255,255,0.22)'; c.lineWidth = 3; c.setLineDash([18, 3]); c.stroke(region); c.restore();
      },
      clean(c) {
        const g = ramp(['#3e2a1e', '#4d3424', '#5e412c', '#6b4a33']);
        field(c, 0, 130, W, 550, 2, (x, y) => g(nz.fbm(x * 0.07, y * 0.07, 4) * 0.8 + nz.n2(x * 0.5, y * 0.5) * 0.2));
        for (let i = 0; i < 700; i++) { c.fillStyle = r() < 0.5 ? 'rgba(255,230,200,0.08)' : 'rgba(0,0,0,0.18)'; c.fillRect(r() * W, 140 + r() * 400, 1.5, 1.5); }
        // the grey-green leaves first, so every flower lies on top
        for (const [x, y] of plants) {
          for (let k = 0; k < 7; k++) {
            const a = (k / 7) * TAU + r(), len = 17 + r() * 10;
            c.fillStyle = U.pick(r, ['#6f9a68', '#7da874', '#5f8c5c']);
            c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.moveTo(0, 0);
            for (let j = 1; j <= 5; j++) c.lineTo((len * j) / 5, j % 2 ? -5 : -2);
            c.lineTo(len + 3, 0); for (let j = 5; j >= 1; j--) c.lineTo((len * j) / 5, j % 2 ? 5 : 2);
            c.closePath(); c.fill(); c.restore();
          }
        }
        for (const [x, y] of plants) {
          // a stem out to a bud or a seed head, then the flower
          const a = r() * TAU, d = 16 + r() * 10, bx = x + Math.cos(a) * d, by = y + Math.sin(a) * d;
          c.strokeStyle = '#5f8c5c'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + 0.6) * d * 0.6, y + Math.sin(a + 0.6) * d * 0.6, bx, by); c.stroke();
          const k = r();
          if (k < 0.5) { c.fillStyle = '#7da874'; c.beginPath(); c.ellipse(bx, by, 3.2, 5, a, 0, TAU); c.fill(); c.fillStyle = RED; c.beginPath(); c.ellipse(bx + Math.cos(a) * 3, by + Math.sin(a) * 3, 1.8, 2.8, a, 0, TAU); c.fill(); }
          else if (k < 0.75) { dot(c, bx, by, 4, '#a9b86c'); c.strokeStyle = '#6f7a48'; c.lineWidth = 0.8; for (let j = 0; j < 6; j++) { const b = (j / 6) * TAU; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + Math.cos(b) * 4, by + Math.sin(b) * 4); c.stroke(); } }
          else {
            for (let j = 0; j < 8; j++) { const b = (j / 8) * TAU; c.fillStyle = COBALT; c.beginPath(); c.ellipse(bx + Math.cos(b) * 4.4, by + Math.sin(b) * 4.4, 3.2, 1.7, b, 0, TAU); c.fill(); }
            dot(c, bx, by, 2, '#22325f');
          }
          if (r() < 0.72) poppy(c, x, y, 9.4 + r() * 4.4, U.pick(r, [RED, '#ef5a48', '#d3362a', RED, '#f07a5e']));
        }
      },
      dirt(c) {
        const g = ramp(['#2f5a24', '#3d6e2c', '#4d8034', '#5f8f3c']);
        field(c, 0, 130, W, 550, 3, (x, y) => g(nz.fbm(x * 0.04, y * 0.04, 4)));
        const items = [];
        for (let i = 0; i < 2100; i++) {
          const x = r() * W, y = 140 + r() * 400, l = 8 + r() * 16, lean = (r() - 0.5) * 12;
          items.push({ x0: x, y0: y, cx: x + lean * 0.3, cy: y - l * 0.6, x1: x + lean, y1: y - l, col: U.pick(r, ['#3b7229', '#4d8a34', '#62a042', '#7bb553', '#8aa84a']), w: 1.6 });
        }
        strokesByColour(c, items, 1.6);
        for (const [x, y, s] of bigWeeds) {
          for (let k = 0; k < 9; k++) {
            const a = (k / 9) * TAU;
            c.fillStyle = U.pick(r, ['#4f8a3a', '#5d9a44', '#6aa04c']);
            c.save(); c.translate(x, y); c.rotate(a);
            c.beginPath(); c.moveTo(0, 0);
            for (let j = 1; j <= 4; j++) c.lineTo((s * j) / 4, j % 2 ? -4 : -1.5);
            c.lineTo(s, 0); for (let j = 4; j >= 1; j--) c.lineTo((s * j) / 4, j % 2 ? 4 : 1.5);
            c.closePath(); c.fill(); c.restore();
          }
          dot(c, x, y, 4.5, r() < 0.6 ? '#f3cf3a' : '#b48fd8');
        }
        for (let i = 0; i < 34; i++) {
          const x = r() * W, y = 150 + r() * 390;
          for (let k = 0; k < 3; k++) dot(c, x + Math.cos(k * 2.1) * 3, y + Math.sin(k * 2.1) * 3, 3, '#6fae55');
        }
      },
      stamp(c, x, y) {
        // a few soil crumbs where weeds come out
        if (Math.random() < 0.15) { c.fillStyle = 'rgba(30,20,12,0.25)'; c.beginPath(); c.arc(x + (Math.random() - 0.5) * 10, y + (Math.random() - 0.5) * 10, 1.2, 0, TAU); c.fill(); }
      },
    };
  }

  SCENES.VARIANTS.push(
    { kind: 'counter', test: (o) => o.what === 'brushes', make: washBrushes },
    { kind: 'attic', test: (o) => o.where === 'loft', make: frameStore },
    { kind: 'fence', test: (o) => o.what === 'swing', make: swingSeat },
    { kind: 'bed', test: (o) => o.flower === 'poppy', make: poppyBed },
  );
})();
