'use strict';
// Seashell Cove: raking seaweed off the beach, the beach hut, the old rowing
// boat (scrubbed, then painted), the rock pool, the lighthouse from its
// lantern room down to the striped tower, and the camper van in the dunes
// (tidied, washed, waxed, polished). Same layers as every other scene (see
// scenes.js). Needs scenes2.js first for the paint helpers.

(() => {
  const { W, H, field, ramp, blob, softShadow, inside, paintStamp, peelingPaint, grime, weatheredWood } = SCENES;

  const dot = (c, x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill(); };

  // ------------------------------------------------------------ shared bits
  // golden sand seen from above
  function sandField(c, nz, x0, y0, x1, y1, tones = ['#d6b97f', '#e2c790', '#ecd5a4', '#f3e1b8']) {
    const g = ramp(tones);
    field(c, x0, y0, x1, y1, 2, (x, y) => g(nz.fbm(x * 0.012, y * 0.012, 4) * 0.75 + nz.n2(x * 0.45, y * 0.45) * 0.25));
  }
  function grains(c, r, x0, y0, x1, y1, n) {
    for (let i = 0; i < n; i++) {
      c.fillStyle = r() < 0.55 ? 'rgba(125,95,55,0.22)' : 'rgba(255,250,236,0.4)';
      c.fillRect(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 1 + r(), 1 + r());
    }
  }
  // the little curved ridges the wind leaves on dry sand
  function windRipples(c, r, x0, y0, x1, y1, n, alpha) {
    c.lineWidth = 1.4; c.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), l = 30 + r() * 60, bend = (r() - 0.5) * 10;
      c.strokeStyle = `rgba(150,115,65,${alpha})`;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + l / 2, y + bend, x + l, y); c.stroke();
      c.strokeStyle = `rgba(255,248,225,${alpha * 1.2})`;
      c.beginPath(); c.moveTo(x, y - 1.6); c.quadraticCurveTo(x + l / 2, y + bend - 1.6, x + l, y - 1.6); c.stroke();
    }
  }
  function shell(c, r, x, y, s) {
    c.save(); c.translate(x, y); c.rotate(r() * 6.28);
    const col = U.pick(r, ['#f3e6d6', '#f2cfc1', '#efe0c8', '#e8d4e0', '#f7efe4']);
    if (r() < 0.6) {
      // a scallop: a fan of ribs
      c.fillStyle = 'rgba(80,60,40,0.25)'; c.beginPath(); c.moveTo(1, s * 0.5 + 1); c.arc(1, s * 0.5 + 1, s, -Math.PI * 0.92, -Math.PI * 0.08); c.closePath(); c.fill();
      c.fillStyle = col; c.beginPath(); c.moveTo(0, s * 0.5); c.arc(0, s * 0.5, s, -Math.PI * 0.92, -Math.PI * 0.08); c.closePath(); c.fill();
      c.strokeStyle = U.shade(col, -0.25); c.lineWidth = 0.7;
      for (let k = 1; k < 7; k++) { const a = -Math.PI * 0.92 + (k / 7) * Math.PI * 0.84; c.beginPath(); c.moveTo(0, s * 0.5); c.lineTo(Math.cos(a) * s, s * 0.5 + Math.sin(a) * s); c.stroke(); }
    } else {
      // a little spiral whelk
      c.fillStyle = 'rgba(80,60,40,0.25)'; c.beginPath(); c.ellipse(1, 1.5, s * 0.55, s, 0, 0, 7); c.fill();
      c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, s * 0.55, s, 0, 0, 7); c.fill();
      c.strokeStyle = U.shade(col, -0.3); c.lineWidth = 0.8;
      for (let k = 1; k <= 3; k++) { c.beginPath(); c.ellipse(0, -s + (k * s * 2) / 4.5, s * 0.5 * (1 - k * 0.12), s * 0.18, 0, 0, Math.PI); c.stroke(); }
    }
    c.restore();
  }
  function pebble(c, r, x, y, s, cols = ['#b9b2a6', '#9f978a', '#cfc6b8', '#a39689', '#c2b49f', '#8c8b86']) {
    const col = U.pick(r, cols), a = r() * 3;
    c.fillStyle = 'rgba(40,30,20,0.25)'; c.beginPath(); c.ellipse(x + 1, y + 1.5, s, s * 0.75, a, 0, 7); c.fill();
    c.fillStyle = col; c.beginPath(); c.ellipse(x, y, s, s * 0.75, a, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.ellipse(x - s * 0.3, y - s * 0.25, s * 0.4, s * 0.25, a, 0, 7); c.fill();
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
  function rustStreak(c, r, x, y, l) {
    dot(c, x, y, 1.3, '#5a3a24');
    const g = c.createLinearGradient(0, y, 0, y + l);
    g.addColorStop(0, 'rgba(150,80,30,0.6)'); g.addColorStop(1, 'rgba(150,80,30,0)');
    c.fillStyle = g;
    c.beginPath(); c.moveTo(x - 1.4, y); c.lineTo(x + 1.4, y); c.lineTo(x + 0.6 + (r() - 0.5) * 2, y + l); c.lineTo(x - 0.6 + (r() - 0.5) * 2, y + l); c.closePath(); c.fill();
  }
  function cloud(c, x, y, s, a = 0.9) {
    c.fillStyle = `rgba(255,255,255,${a})`;
    for (const [dx, dy, rr] of [[0, 0, 1], [0.9, 0.15, 0.75], [-0.85, 0.2, 0.7], [0.4, -0.35, 0.7], [-0.35, -0.3, 0.6]]) { c.beginPath(); c.ellipse(x + dx * s, y + dy * s, rr * s, rr * s * 0.7, 0, 0, 7); c.fill(); }
  }
  function gull(c, x, y, s) {
    c.strokeStyle = 'rgba(60,64,70,0.75)'; c.lineWidth = 1.4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x - s, y - s * 0.2); c.quadraticCurveTo(x - s * 0.5, y - s * 0.6, x, y); c.quadraticCurveTo(x + s * 0.5, y - s * 0.6, x + s, y - s * 0.2); c.stroke();
  }
  function sky(c, y0, y1, x0, x1, top = '#9fd0ea', bot = '#e9f4ef') {
    const g = c.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, top); g.addColorStop(1, bot);
    c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  }
  // the sea seen front on, from the horizon down
  function seaBand(c, r, nz, x0, x1, y0, y1) {
    const g = ramp(['#2f7896', '#3d8fae', '#57a8bd', '#7cc0c8']);
    field(c, x0, y0, x1, y1, 2, (x, y) => g(U.clamp(((y - y0) / (y1 - y0)) * 0.8 + (nz.fbm(x * 0.01, y * 0.05, 3) - 0.5) * 0.3, 0, 1)));
    c.fillStyle = 'rgba(255,255,255,0.5)';
    for (let i = 0; i < 46; i++) { const y = y0 + 4 + Math.pow(r(), 1.3) * (y1 - y0 - 6), l = 4 + ((y - y0) / (y1 - y0)) * 16; c.fillRect(x0 + r() * (x1 - x0), y, l, 1.2); }
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x0, y0, x1 - x0, 1.5);
  }
  // a rounded, slightly wobbly patch (between a rectangle and an oval)
  function organic(p, nz, cx, cy, a, b, n, wob, pts = 48) {
    const P = [];
    for (let i = 0; i < pts; i++) {
      const t = (i / pts) * Math.PI * 2, co = Math.cos(t), si = Math.sin(t);
      const k = 1 + (nz.n2(co * 1.7 + 11, si * 1.7 + 3) - 0.5) * 2 * wob;
      P.push([cx + a * k * Math.sign(co) * Math.pow(Math.abs(co), 2 / n), cy + b * k * Math.sign(si) * Math.pow(Math.abs(si), 2 / n)]);
    }
    for (let i = 0; i < pts; i++) {
      const A = P[i], B = P[(i + 1) % pts];
      if (i === 0) { const Z = P[pts - 1]; p.moveTo((Z[0] + A[0]) / 2, (Z[1] + A[1]) / 2); }
      p.quadraticCurveTo(A[0], A[1], (A[0] + B[0]) / 2, (A[1] + B[1]) / 2);
    }
    p.closePath();
  }
  function rock(c, r, x, y, s, cols = ['#7d7468', '#8a8174', '#6f675d', '#958b7d', '#6a6a66']) {
    const col = U.pick(r, cols), pts = [];
    for (let k = 0; k < 9; k++) { const a = (k / 9) * 6.283, rr = s * (0.75 + r() * 0.35); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8]); }
    const poly = (dx, dy) => { c.beginPath(); pts.forEach(([px, py], i) => (i ? c.lineTo(px + dx, py + dy) : c.moveTo(px + dx, py + dy))); c.closePath(); };
    c.fillStyle = 'rgba(25,20,15,0.35)'; poly(2, 3); c.fill();
    c.fillStyle = U.shade(col, -0.18); poly(0, 0); c.fill();
    c.save(); poly(0, 0); c.clip();
    c.fillStyle = col; c.beginPath(); c.ellipse(x - s * 0.15, y - s * 0.2, s * 0.85, s * 0.6, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.2)'; c.beginPath(); c.ellipse(x - s * 0.35, y - s * 0.35, s * 0.4, s * 0.22, -0.4, 0, 7); c.fill();
    for (let k = 0; k < 4; k++) dot(c, x + (r() - 0.5) * s, y + (r() - 0.5) * s * 0.7, 0.9 + r() * 1.2, 'rgba(235,230,215,0.8)');
    c.restore();
  }

  // ---------------------------------------------------------------- seaweed
  const WEED = ['#5f5a24', '#6b6a2a', '#7a6a2c', '#4f4a1c', '#806b30'];
  // a long kelp ribbon, wide in the middle and frilly at the edges, with a
  // lighter rib down the middle
  function kelp(c, r, x, y, len, a) {
    const col = U.pick(r, ['#6b4a1f', '#7a5626', '#5e4a1d', '#6f6026']);
    const n = 14, wdt = 4 + r() * 5, mid = [], L = [], R = [];
    for (let k = 0; k <= n; k++) {
      const t = k / n, half = wdt * Math.pow(Math.sin(Math.PI * Math.min(0.98, t * 0.9 + 0.08)), 0.6) * (0.85 + r() * 0.3);
      mid.push([x, y]); L.push([x + Math.cos(a - Math.PI / 2) * half, y + Math.sin(a - Math.PI / 2) * half]); R.push([x + Math.cos(a + Math.PI / 2) * half, y + Math.sin(a + Math.PI / 2) * half]);
      a += (r() - 0.5) * 0.7; x += (Math.cos(a) * len) / n; y += (Math.sin(a) * len) / n;
    }
    const outline = (dx, dy) => { c.beginPath(); L.forEach(([px, py], i) => (i ? c.lineTo(px + dx, py + dy) : c.moveTo(px + dx, py + dy))); for (let i = R.length - 1; i >= 0; i--) c.lineTo(R[i][0] + dx, R[i][1] + dy); c.closePath(); };
    c.fillStyle = 'rgba(30,22,8,0.3)'; outline(1.5, 2.5); c.fill();
    c.fillStyle = col; outline(0, 0); c.fill();
    c.strokeStyle = U.shade(col, -0.3); c.lineWidth = 1; c.lineJoin = 'round'; c.stroke();
    c.strokeStyle = U.rgba(U.shade(col, 0.4), 0.6); c.lineWidth = 1; c.lineCap = 'round';
    c.beginPath(); mid.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.stroke();
  }
  // bladderwrack: forked olive fronds with air bladders at the forks
  function wrack(c, r, x, y, l, a, depth) {
    const col = U.pick(r, WEED);
    const go = (x, y, a, l, d) => {
      const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l;
      c.strokeStyle = col; c.lineWidth = 1.6 + d * 1.1; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo((x + x2) / 2 + Math.sin(a) * l * 0.15, (y + y2) / 2 - Math.cos(a) * l * 0.15, x2, y2); c.stroke();
      if (d <= 0) return;
      c.fillStyle = U.shade(col, 0.18); c.beginPath(); c.ellipse(x2, y2, 3.2, 2.2, a, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,220,0.25)'; c.beginPath(); c.ellipse(x2 - 0.8, y2 - 0.8, 1.2, 0.8, a, 0, 7); c.fill();
      go(x2, y2, a + 0.42 + (r() - 0.5) * 0.3, l * 0.78, d - 1);
      go(x2, y2, a - 0.42 + (r() - 0.5) * 0.3, l * 0.78, d - 1);
    };
    go(x, y, a, l, depth);
  }
  // sea lettuce: thin bright green sheets
  function seaLettuce(c, r, x, y, s) {
    c.save(); c.translate(x, y); c.rotate(r() * 6.28);
    c.fillStyle = U.pick(r, ['rgba(126,186,72,0.85)', 'rgba(108,170,60,0.85)', 'rgba(146,198,88,0.8)']);
    c.beginPath();
    for (let k = 0; k < 12; k++) { const a = (k / 12) * 6.283, rr = s * (0.6 + r() * 0.5); c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * 0.7); }
    c.closePath(); c.fill();
    c.strokeStyle = 'rgba(220,250,180,0.35)'; c.lineWidth = 0.7;
    for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(0, 0); c.lineTo((r() - 0.5) * s * 1.4, (r() - 0.5) * s); c.stroke(); }
    c.restore();
  }
  // a tangle of thin dark weed
  function tangle(c, r, x, y, s) {
    c.lineWidth = 1.1; c.lineCap = 'round';
    for (let k = 0; k < 14; k++) {
      c.strokeStyle = U.pick(r, ['#3f3c18', '#4f4a1c', '#3f5a24', '#5a3f1c']);
      let px = x + (r() - 0.5) * s, py = y + (r() - 0.5) * s * 0.6;
      c.beginPath(); c.moveTo(px, py);
      for (let j = 0; j < 4; j++) { const nx = px + (r() - 0.5) * s * 0.7, ny = py + (r() - 0.5) * s * 0.5; c.quadraticCurveTo(px + (r() - 0.5) * s * 0.5, py + (r() - 0.5) * s * 0.5, nx, ny); px = nx; py = ny; }
      c.stroke();
    }
  }
  function driftwood(c, r, x, y, l) {
    c.save(); c.translate(x, y); c.rotate(r() * 6.28);
    c.fillStyle = 'rgba(40,30,20,0.3)'; c.beginPath(); c.roundRect(-l / 2 + 1.5, -1, l, 6, 3); c.fill();
    c.fillStyle = U.pick(r, ['#bba98c', '#c7b79b', '#a99878']);
    c.beginPath(); c.moveTo(-l / 2, -2); c.quadraticCurveTo(0, -4, l / 2, -2.5); c.lineTo(l / 2, 2); c.quadraticCurveTo(0, 3.5, -l / 2, 2.5); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(90,75,55,0.6)'; c.lineWidth = 0.6; c.stroke();
    c.beginPath(); c.moveTo(-l / 2 + 3, -0.8); c.lineTo(l / 2 - 4, -0.4); c.moveTo(-l / 2 + 6, 1); c.lineTo(l / 2 - 8, 1.2); c.stroke();
    dot(c, l * 0.15, 0, 1.2, 'rgba(90,70,50,0.7)');
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(-l / 2 + 3, -2.6, l - 8, 1);
    c.restore();
  }
  function foam(c, r, x, y, s) {
    for (let k = 0; k < 10; k++) {
      const bx = x + (r() - 0.5) * s * 2, by = y + (r() - 0.5) * s, br = 1 + r() * 2.6;
      c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.arc(bx, by, br, 0, 7); c.fill();
      c.strokeStyle = 'rgba(190,200,190,0.6)'; c.lineWidth = 0.5; c.stroke();
    }
  }
  // marram grass seen from above: blades fanning out from a clump
  function marram(c, r, x, y) {
    c.lineCap = 'round'; c.lineWidth = 1.3;
    for (let k = 0; k < 12; k++) {
      const a = r() * 6.283, l = 8 + r() * 14;
      c.strokeStyle = U.pick(r, ['#9aa35a', '#8a9a4f', '#b3b56e', '#7f8e48']);
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + 0.3) * l * 0.5, y + Math.sin(a + 0.3) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
    }
  }
  // the same grass seen front on, standing up out of a dune
  function marramUp(c, r, x, y, h) {
    c.lineCap = 'round'; c.lineWidth = 1.4;
    for (let k = 0; k < 9; k++) {
      const hh = h * (0.6 + r() * 0.5), lean = (r() - 0.45) * hh * 0.6;
      c.strokeStyle = U.pick(r, ['#9aa35a', '#8a9a4f', '#b3b56e', '#7f8e48']);
      c.beginPath(); c.moveTo(x + (r() - 0.5) * 8, y); c.quadraticCurveTo(x + lean * 0.3, y - hh * 0.6, x + lean, y - hh); c.stroke();
    }
  }

  // ------------------------------------------------------------------- SAND
  // The beach after a storm: seaweed and driftwood piled along the tide
  // lines. Raking leaves neat grooves in the sand behind you.
  function sand(S) {
    const { r, nz, bleed } = S;
    const edge = (x) => 92 + Math.sin(x * 0.03 + 1) * 7 + (nz.n2(x * 0.02, 7.3) - 0.5) * 16;
    const region = new Path2D();
    organic(region, nz, 180, 356, 164, 210, 5, 0.05);
    const tide1 = (x) => 222 + Math.sin(x * 0.025) * 18, tide2 = (x) => 438 + Math.sin(x * 0.02 + 2) * 22;
    const pile = (x, y) => Math.max(0, 1 - Math.min(Math.abs(y - tide1(x)), Math.abs(y - tide2(x))) / 50);
    const onTide = (x) => (r() < 0.5 ? tide1(x) : tide2(x));
    return {
      family: 'rake', particle: 'seaweed', region, depth: true,
      tough: (x, y) => (pile(x, y) * (0.7 + nz.n2(x * 0.03, y * 0.03) * 0.6) > 0.6 ? 1.5 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        sandField(c, nz, x0, y0, x1, y1);
        windRipples(c, r, x0, 150, x1, y1, 60, 0.22);
        grains(c, r, x0, y0, x1, y1, 2500);
        // wet sand at the water's edge, then the sea itself
        const wet = ramp(['#b39462', '#c0a170', '#cdb080']);
        field(c, x0, y0, x1, 175, 2, (x, y) => { const d = y - edge(x); return [...wet(nz.fbm(x * 0.02, y * 0.04, 3)), d < 0 ? 255 : Math.max(0, 1 - d / 60) * 255]; });
        const sea = ramp(['#2c7a8f', '#3a91a2', '#56aeb5', '#86cfc6', '#b7e3d6']);
        field(c, x0, y0, x1, 140, 2, (x, y) => { const d = edge(x) - y; return d < 0 ? [0, 0, 0, 0] : [...sea(U.clamp(1 - d / 110 + (nz.fbm(x * 0.015, y * 0.03, 3) - 0.5) * 0.3, 0, 1)), Math.min(255, d * 40)]; });
        c.lineCap = 'round';
        for (let i = 0; i < 26; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (edge(x) - y0 - 14), l = 20 + r() * 50; c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + l / 2, y - 3, x + l, y); c.stroke(); }
        c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 3;
        c.beginPath(); for (let x = x0; x <= x1; x += 4) { const y = edge(x) - 2; if (x === x0) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke();
        for (let x = x0; x < x1; x += 3) if (r() < 0.6) dot(c, x, edge(x) - 4 - r() * 8, 0.8 + r() * 1.6, 'rgba(255,255,255,0.7)');
        // marram grass on the dune at the bottom, shells and pebbles about
        for (let i = 0; i < 26; i++) marram(c, r, x0 + r() * (x1 - x0), y1 - 6 - r() * 30);
        for (let i = 0; i < 60; i++) {
          const x = x0 + r() * (x1 - x0), y = 130 + r() * (y1 - 130);
          if (inside(region, x, y)) continue;
          if (r() < 0.5) shell(c, r, x, y, 4 + r() * 3); else pebble(c, r, x, y, 2.5 + r() * 3);
        }
        // a gull walked along the shore
        c.strokeStyle = 'rgba(120,95,60,0.55)'; c.lineWidth = 1;
        for (let i = 0, x = 20, y = 128; i < 16; i++, x += 22) {
          const yy = y + Math.sin(i * 0.9) * 5;
          c.beginPath(); c.moveTo(x, yy); c.lineTo(x - 5, yy - 3); c.moveTo(x, yy); c.lineTo(x - 5, yy + 3); c.moveTo(x, yy); c.lineTo(x - 6, yy); c.stroke();
        }
      },
      clean(c) {
        sandField(c, nz, 0, 0, W, H, ['#e0c48c', '#e8cf9e', '#efdab0', '#f5e4c0']);
        grains(c, r, 0, 0, W, H, 2600);
      },
      dirt(c) {
        // trampled damp sand under everything
        const g = ramp(['#9f8456', '#ad9162', '#bb9f70', '#c8ad7e']);
        field(c, 0, 0, W, H, 2, (x, y) => g(nz.fbm(x * 0.02 + 30, y * 0.02, 5) * 0.8 + nz.n2(x * 0.3, y * 0.3) * 0.2));
        for (let i = 0; i < 260; i++) {
          const x = r() * W, y = r() * H, s = 2 + r() * 4;
          c.fillStyle = 'rgba(90,70,40,0.25)'; c.beginPath(); c.ellipse(x + 0.8, y + 1, s, s * 0.7, 0, 0, 7); c.fill();
          c.fillStyle = 'rgba(210,190,150,0.5)'; c.beginPath(); c.ellipse(x, y, s, s * 0.7, 0, 0, 7); c.fill();
        }
        for (let i = 0; i < 30; i++) shell(c, r, r() * W, r() * H, 3 + r() * 3);
        // sea lettuce and kelp everywhere, wrack and tangles piled on the tide lines
        for (let i = 0; i < 30; i++) seaLettuce(c, r, r() * W, r() * H, 8 + r() * 10);
        for (let i = 0; i < 220; i++) wrack(c, r, r() * W, r() * H, 5 + r() * 5, r() * 6.28, r() < 0.5 ? 2 : 1);
        for (let i = 0; i < 46; i++) { const x = r() * W, y = r() < 0.6 ? onTide(x) + (r() - 0.5) * 70 : 120 + r() * 460; kelp(c, r, x, y, 50 + r() * 90, r() * 6.28); }
        for (let i = 0; i < 70; i++) { const x = r() * W; tangle(c, r, x, onTide(x) + (r() - 0.5) * 60, 22 + r() * 16); }
        for (let i = 0; i < 240; i++) { const x = r() * W; wrack(c, r, x, onTide(x) + (r() - 0.5) * 80 * r(), 7 + r() * 6, r() * 6.28, r() < 0.4 ? 3 : 2); }
        for (let i = 0; i < 16; i++) driftwood(c, r, r() * W, 130 + r() * 450, 26 + r() * 40);
        for (let i = 0; i < 14; i++) foam(c, r, r() * W, 140 + r() * 100, 10 + r() * 10);
      },
      // raking leaves grooves; the sparkle dots at the very end leave none
      stamp(c, x, y, a, t) {
        if (t.shape === 'circle' && t.r < 4) return;
        const w = t.shape === 'rect' ? t.w : t.r * 1.6, d = t.shape === 'rect' ? t.h : t.r * 0.7;
        const n = Math.max(2, Math.round(w / 4.5));
        c.save(); c.translate(x, y); c.rotate(a);
        for (let k = 0; k < n; k++) {
          const yy = -w / 2 + (w * (k + 0.5)) / n;
          c.fillStyle = '#cdae78'; c.fillRect(-d / 2, yy - 0.75, d, 1.4);
          c.fillStyle = '#fbf0d6'; c.fillRect(-d / 2, yy + 0.8, d, 1);
        }
        c.restore();
      },
    };
  }

  // -------------------------------------------------------------------- HUT
  // A beach hut on short stilts, front on, painted in the player's colour.
  // Trim, roof, windows and the door handle sit above the paint.
  function hut(S) {
    const { r, nz, bleed, opts } = S;
    const garden = !!(opts && opts.garden);
    const xL = 68, xR = 292, yE = 210, yA = 132, yB = 470, cx = 180;
    const door = { x0: 138, x1: 222, y0: 282, y1: 470 };
    const wins = [{ x: 101, y: 330 }, { x: 259, y: 330 }];
    const port = { x: 180, y: 184, r: 15 };
    const region = new Path2D();
    region.moveTo(xL, yB); region.lineTo(xL, yE); region.lineTo(cx, yA); region.lineTo(xR, yE); region.lineTo(xR, yB); region.closePath();
    for (const w of wins) region.rect(w.x - 18, w.y - 25, 36, 50);
    region.moveTo(port.x + port.r + 4, port.y); region.arc(port.x, port.y, port.r + 4, 0, Math.PI * 2);
    const seams = (c, dark, light) => {
      for (let x = xL + 16; x < xR; x += 16) { c.fillStyle = dark; c.fillRect(x - 0.6, yA, 1.3, yB - yA); c.fillStyle = light; c.fillRect(x + 0.8, yA, 1, yB - yA); }
    };
    // a neighbour's hut peeking in at the edge, boards in two colours
    function neighbour(c, x0, x1, apex, colA, colB) {
      c.fillStyle = '#4b5058'; c.beginPath(); c.moveTo(x0 - 30, 238); c.lineTo(apex, 168); c.lineTo(x1 + 30, 238); c.lineTo(x1 + 30, 246); c.lineTo(apex, 178); c.lineTo(x0 - 30, 246); c.closePath(); c.fill();
      c.save(); c.beginPath(); c.moveTo(x0, 486); c.lineTo(x0, 240); c.lineTo(apex, 182); c.lineTo(x1, 240); c.lineTo(x1, 486); c.closePath(); c.clip();
      for (let x = x0, i = 0; x < x1; x += 14, i++) { c.fillStyle = i % 2 ? colA : colB; c.fillRect(x, 170, 14, 320); }
      c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x0, 240, x1 - x0, 14);
      c.restore();
      c.fillStyle = '#6b4a32'; for (const x of [x0 + 10, x1 - 16]) c.fillRect(x, 486, 7, 34);
    }
    return {
      family: 'paint', particle: 'paint', region,
      tough: (x, y) => (x < xL + 12 || x > xR - 12 || y > yB - 12 ? 1.3 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        if (garden) {
          // the potting shed in the walled garden: brick wall, lawn, a stone step
          sky(c, y0, 260, x0, x1, '#a3d4ec', '#e6f3f1');
          cloud(c, 70, 70, 20);
          for (let y = 150, row = 0; y < 330; y += 13, row++) for (let x = x0 - (row % 2) * 15; x < x1; x += 30) {
            c.fillStyle = U.pick(r, ['#b5603f', '#a8573a', '#bf6c48', '#9e5236']); c.fillRect(x + 1, y + 1, 28, 11);
          }
          c.fillStyle = '#d9d3c5'; c.fillRect(x0, 142, x1 - x0, 10);
          for (let i = 0; i < 9; i++) { c.fillStyle = U.pick(r, ['#4f8a3c', '#467e37', '#5d9644']); c.beginPath(); c.ellipse(x0 + r() * (x1 - x0), 330 + r() * 30, 30 + r() * 20, 26 + r() * 10, 0, 0, 7); c.fill(); }
          SCENES.mowedLawn(c, nz, x0, 360, x1, y1, true);
          c.fillStyle = 'rgba(60,45,25,0.25)'; c.beginPath(); c.ellipse(cx + 6, 478, 150, 10, 0, 0, 7); c.fill();
          c.fillStyle = '#a49c8c'; c.fillRect(xL - 8, yB - 2, xR - xL + 16, 12);
          c.fillStyle = '#bdb6a6'; c.fillRect(door.x0 - 10, yB + 8, door.x1 - door.x0 + 20, 12);
          for (const px of [44, 316]) { c.fillStyle = '#b8653f'; c.beginPath(); c.moveTo(px - 16, 448); c.lineTo(px + 16, 448); c.lineTo(px + 12, 478); c.lineTo(px - 12, 478); c.closePath(); c.fill(); for (let k = 0; k < 7; k++) { c.fillStyle = U.pick(r, ['#4f8a3a', '#62a042']); c.beginPath(); c.ellipse(px + (r() - 0.5) * 26, 440 - r() * 18, 7, 4, r() * 3, 0, 7); c.fill(); } for (let k = 0; k < 4; k++) { c.fillStyle = U.pick(r, ['#e98aa2', '#f2c230', '#ffffff']); c.beginPath(); c.arc(px + (r() - 0.5) * 22, 432 - r() * 14, 3.4, 0, 7); c.fill(); } }
          const p = new Path2D(); p.moveTo(xL, yB); p.lineTo(xL, yE); p.lineTo(cx, yA); p.lineTo(xR, yE); p.lineTo(xR, yB); p.closePath();
          softShadow(c, p, 12, 0.3, 5, 6);
          return;
        }
        sky(c, y0, 300, x0, x1, '#a3d4ec', '#e6f3f1');
        cloud(c, 60, 70, 22); cloud(c, 300, 110, 18, 0.8);
        seaBand(c, r, nz, x0, x1, 300, 392);
        c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.moveTo(312, 296); c.lineTo(312, 282); c.lineTo(321, 296); c.closePath(); c.fill();
        c.fillStyle = '#5a6470'; c.fillRect(306, 296, 18, 2.5);
        // the beach, front on
        const g = ramp(['#dcc28c', '#e6cf9f', '#efdcb3']);
        field(c, x0, 390, x1, y1, 2, (x, y) => g(nz.fbm(x * 0.02, y * 0.05, 3) * 0.7 + ((y - 390) / (y1 - 390)) * 0.3));
        grains(c, r, x0, 390, x1, y1, 900);
        c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x0, 390, x1 - x0, 2);
        neighbour(c, x0 - 60, 34, -20, '#e98a8a', '#f7efe4');
        neighbour(c, 326, x1 + 80, 420, '#f2d06b', '#f7efe4');
        // stilts, steps and the hut's shadow on the sand
        c.fillStyle = 'rgba(60,45,25,0.28)'; c.beginPath(); c.ellipse(cx + 8, 524, 150, 12, 0, 0, 7); c.fill();
        for (const x of [76, 124, 230, 278]) { c.fillStyle = '#5a3d28'; c.fillRect(x, 474, 9, 50); c.fillStyle = '#7a5236'; c.fillRect(x, 474, 3, 50); }
        c.strokeStyle = '#5a3d28'; c.lineWidth = 3; c.beginPath(); c.moveTo(80, 482); c.lineTo(128, 516); c.moveTo(282, 482); c.lineTo(234, 516); c.stroke();
        for (const [sx, sy, sw] of [[146, 478, 68], [152, 496, 56]]) {
          c.fillStyle = '#8a6142'; c.fillRect(sx, sy, sw, 10);
          c.fillStyle = '#a77b56'; c.fillRect(sx, sy, sw, 4);
        }
        const p = new Path2D(); p.moveTo(xL, yB); p.lineTo(xL, yE); p.lineTo(cx, yA); p.lineTo(xR, yE); p.lineTo(xR, yB); p.closePath();
        softShadow(c, p, 12, 0.35, 5, 6);
      },
      clean(c, paint) { c.fillStyle = paint; c.fillRect(0, 0, W, H); },
      cleanOver(c) {
        // board seams and grain so the paint reads as wood
        seams(c, 'rgba(0,0,0,0.2)', 'rgba(255,255,255,0.14)');
        c.lineWidth = 0.8;
        for (let i = 0; i < 260; i++) {
          const x = xL + r() * (xR - xL), y = yA + r() * (yB - yA), l = 20 + r() * 60;
          c.strokeStyle = r() < 0.7 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)';
          c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 2, y + l); c.stroke();
        }
        // light from the left, shade under the eaves and low down
        let g = c.createLinearGradient(xL, 0, xR, 0);
        g.addColorStop(0, 'rgba(255,255,255,0.12)'); g.addColorStop(1, 'rgba(0,0,0,0.12)');
        c.fillStyle = g; c.fillRect(xL, yA, xR - xL, yB - yA);
        c.fillStyle = 'rgba(20,15,10,0.2)';
        c.beginPath(); c.moveTo(xL, 222); c.lineTo(cx, 142); c.lineTo(xR, 222); c.lineTo(xR, 236); c.lineTo(cx, 156); c.lineTo(xL, 236); c.closePath(); c.fill();
        g = c.createLinearGradient(0, yB - 40, 0, yB);
        g.addColorStop(0, 'rgba(20,15,10,0)'); g.addColorStop(1, 'rgba(20,15,10,0.16)');
        c.fillStyle = g; c.fillRect(xL, yB - 40, xR - xL, 40);
        // the door: planks held by two ledges and a brace
        c.strokeStyle = 'rgba(0,0,0,0.32)'; c.lineWidth = 2; c.strokeRect(door.x0 + 1, door.y0 + 1, door.x1 - door.x0 - 2, door.y1 - door.y0 - 2);
        for (let x = door.x0 + 14; x < door.x1 - 4; x += 14) { c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(x, door.y0, 1.2, door.y1 - door.y0); }
        const ledge = (y) => { c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(door.x0 + 6, y, door.x1 - door.x0 - 12, 3); c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(door.x0 + 6, y + 11, door.x1 - door.x0 - 12, 3); };
        ledge(door.y0 + 26); ledge(door.y1 - 44);
        c.save(); c.beginPath(); c.rect(door.x0 + 6, door.y0 + 40, door.x1 - door.x0 - 12, door.y1 - door.y0 - 84); c.clip();
        c.strokeStyle = 'rgba(0,0,0,0.22)'; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(door.x0 + 6, door.y1 - 44); c.lineTo(door.x1 - 6, door.y0 + 40); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,0.14)'; c.beginPath(); c.moveTo(door.x0 + 6, door.y1 - 58); c.lineTo(door.x1 - 6, door.y0 + 26); c.stroke();
        c.restore();
      },
      dirt(c) {
        weatheredWood(c, r, nz, xL - 4, yA - 10, xR + 4, yB + 6);
        seams(c, 'rgba(45,38,30,0.55)', 'rgba(255,255,255,0.08)');
        // what is left of the old paint
        peelingPaint(c, r, xL, yA, xR, yB, 70, '#bcd3cc');
        // salt crust (green moss in the garden) creeping up from the bottom
        const crust = garden ? [104, 132, 70] : [238, 234, 222];
        field(c, xL, yA, xR, yB, 2, (x, y) => { const v = nz.fbm(x * 0.03 + 5, y * 0.03, 4) + ((y - yA) / (yB - yA)) * 0.35; return [...crust, Math.max(0, v - 0.62) * 600]; });
        grime(c, r, xL, yA, xR, yB, 26);
        c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 2; c.strokeRect(door.x0 + 1, door.y0 + 1, door.x1 - door.x0 - 2, door.y1 - door.y0 - 2);
        for (let i = 0; i < 18; i++) rustStreak(c, r, xL + 16 * (1 + ((r() * 13) | 0)) + (r() < 0.5 ? -4 : 4), yE + 10 + r() * 220, 20 + r() * 40);
        dropping(c, r, 120, 244, 5); dropping(c, r, 248, 300, 4);
      },
      top(c) {
        // roof felt above the white bargeboards, and a finial on top
        c.lineJoin = 'miter'; c.lineCap = 'butt';
        c.strokeStyle = '#4b5058'; c.lineWidth = 10;
        c.beginPath(); c.moveTo(32, 230); c.lineTo(cx, 118); c.lineTo(328, 230); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(34, 225); c.lineTo(cx, 113); c.lineTo(326, 225); c.stroke();
        c.strokeStyle = '#f7f3ea'; c.lineWidth = 13;
        c.beginPath(); c.moveTo(46, 230); c.lineTo(cx, 131); c.lineTo(314, 230); c.stroke();
        c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(46, 236); c.lineTo(cx, 137); c.lineTo(314, 236); c.stroke();
        c.fillStyle = '#f7f3ea'; c.fillRect(cx - 2.5, 100, 5, 18); dot(c, cx, 99, 4.5, '#f7f3ea');
        // corner boards, skirting and the door frame
        const board = (x, y, w, h) => { c.fillStyle = '#f7f3ea'; c.fillRect(x, y, w, h); c.fillStyle = 'rgba(0,0,0,0.1)'; c.fillRect(x + w - 2, y, 2, h); };
        board(xL - 6, yE, 12, yB - yE + 6); board(xR - 6, yE, 12, yB - yE + 6);
        board(xL - 6, yB - 8, door.x0 - xL, 14); board(door.x1 + 6, yB - 8, xR - door.x1, 14);
        board(door.x0 - 7, door.y0 - 7, 7, door.y1 - door.y0 + 7); board(door.x1, door.y0 - 7, 7, door.y1 - door.y0 + 7);
        board(door.x0 - 7, door.y0 - 7, door.x1 - door.x0 + 14, 7);
        c.fillStyle = '#8f8a80'; c.fillRect(door.x0 - 2, yB - 2, door.x1 - door.x0 + 4, 6);
        // brass handle and a starfish on the door (a wreath of leaves on the shed)
        dot(c, door.x1 - 14, 386, 6, '#b8913d'); dot(c, door.x1 - 14, 386, 4, '#e2bd5e'); dot(c, door.x1 - 15.5, 384.5, 1.4, '#fff3c4');
        if (garden) {
          for (let k = 0; k < 16; k++) { const a = (k / 16) * 6.283; c.fillStyle = k % 2 ? '#4f8a3a' : '#62a042'; c.beginPath(); c.ellipse(cx + Math.cos(a) * 14, 318 + Math.sin(a) * 14, 6, 3, a + 1.2, 0, 7); c.fill(); }
          dot(c, cx, 304, 3, '#e98aa2'); dot(c, cx + 10, 309, 2.6, '#f2c230');
        } else {
          c.save(); c.translate(cx, 318); c.rotate(0.2);
          c.fillStyle = 'rgba(30,20,10,0.3)'; starPath(c, 1.5, 2, 13, 5); c.fill();
          c.fillStyle = '#ee8a4f'; starPath(c, 0, 0, 13, 5); c.fill();
          for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k / 5) * 6.283; for (let j = 1; j <= 3; j++) dot(c, Math.cos(a) * j * 3.2, Math.sin(a) * j * 3.2, 0.9, '#f9c38f'); }
          c.restore();
        }
        // two little windows with gingham curtains
        for (const w of wins) {
          c.fillStyle = 'rgba(30,20,10,0.25)'; c.fillRect(w.x - 22, w.y - 27, 48, 62);
          c.fillStyle = '#f7f3ea'; c.fillRect(w.x - 24, w.y - 31, 48, 62);
          const gl = c.createLinearGradient(0, w.y - 25, 0, w.y + 25);
          gl.addColorStop(0, '#bfe0ee'); gl.addColorStop(1, '#5d8fa8');
          c.fillStyle = gl; c.fillRect(w.x - 18, w.y - 25, 36, 50);
          for (const side of [-1, 1]) {
            c.save(); c.beginPath(); c.moveTo(w.x + side * 18, w.y - 25); c.lineTo(w.x + side * 5, w.y - 25); c.quadraticCurveTo(w.x + side * 12, w.y, w.x + side * 18, w.y + 22); c.closePath(); c.clip();
            c.fillStyle = '#f7f3ea'; c.fillRect(w.x - 20, w.y - 26, 40, 50);
            c.fillStyle = 'rgba(201,71,79,0.55)'; for (let k = -20; k < 20; k += 6) { c.fillRect(w.x + k, w.y - 26, 3, 50); c.fillRect(w.x - 20, w.y - 26 + k + 20, 40, 3); }
            c.restore();
          }
          c.fillStyle = '#f7f3ea'; c.fillRect(w.x - 1.5, w.y - 25, 3, 50); c.fillRect(w.x - 18, w.y - 1.5, 36, 3);
          c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.moveTo(w.x - 14, w.y + 20); c.lineTo(w.x - 2, w.y - 22); c.lineTo(w.x + 4, w.y - 22); c.lineTo(w.x - 8, w.y + 20); c.closePath(); c.fill();
          c.fillStyle = '#f7f3ea'; c.fillRect(w.x - 27, w.y + 29, 54, 6);
        }
        // the porthole in the gable
        dot(c, port.x + 1, port.y + 2, port.r + 5, 'rgba(30,20,10,0.25)');
        dot(c, port.x, port.y, port.r + 5, '#f7f3ea');
        const pg = c.createLinearGradient(0, port.y - port.r, 0, port.y + port.r);
        pg.addColorStop(0, '#bfe0ee'); pg.addColorStop(1, '#4f86a2');
        c.fillStyle = pg; c.beginPath(); c.arc(port.x, port.y, port.r, 0, 7); c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 2.5; c.beginPath(); c.arc(port.x, port.y, port.r - 5, 3.6, 4.6); c.stroke();
      },
      stamp: paintStamp,
    };
  }
  function starPath(c, x, y, R, n) {
    c.beginPath();
    for (let k = 0; k < n * 2; k++) {
      const a = -Math.PI / 2 + (k / (n * 2)) * 6.283, rr = k % 2 ? R * 0.42 : R;
      if (k) c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    c.closePath();
  }

  // ------------------------------------------------------------------- BOAT
  // An old rowing boat lying upside down on the sand, seen from above: the
  // bow at the top, the transom at the bottom, clinker planks along it.
  const BOAT = (() => {
    const cx = 180, y0 = 50, y1 = 548, B = 104, keel = 6, N = 80;
    const w = (y) => {
      const t = U.clamp((y - y0) / (y1 - y0), 0, 1);
      if (t < 0.58) return B * Math.pow(Math.sin(((t / 0.58) * Math.PI) / 2), 0.72);
      const u = (t - 0.58) / 0.42;
      return B * (1 - 0.4 * u * u);
    };
    const outline = new Path2D();
    outline.moveTo(cx, y0);
    for (let i = 1; i <= N; i++) { const y = y0 + ((y1 - y0) * i) / N; outline.lineTo(cx + w(y), y); }
    outline.quadraticCurveTo(cx, y1 + 16, cx - w(y1), y1);
    for (let i = N - 1; i >= 1; i--) { const y = y0 + ((y1 - y0) * i) / N; outline.lineTo(cx - w(y), y); }
    outline.closePath();
    // the edges of the planks: the same fraction of the half-width all along
    const FR = [0.2, 0.38, 0.54, 0.68, 0.8, 0.9];
    function line(c, f, side, dx) {
      c.beginPath();
      for (let i = 0; i <= N; i++) { const y = y0 + 6 + ((y1 - y0 - 6) * i) / N, x = cx + side * f * w(y) + dx; if (i) c.lineTo(x, y); else c.moveTo(x, y); }
      c.stroke();
    }
    function strakes(c, dark, light) {
      for (const f of FR) for (const side of [-1, 1]) {
        c.strokeStyle = dark; c.lineWidth = 1.6; line(c, f, side, 0);
        c.strokeStyle = light; c.lineWidth = 1; line(c, f, side, -side * 1.6);
      }
    }
    // rounder towards the rim: lighter on the left, darker to the right and at the ends
    function shade(c, k) {
      field(c, cx - B - 2, y0 - 2, cx + B + 2, y1 + 18, 3, (x, y) => {
        const s = (x - cx) / Math.max(8, w(y)), t = (y - y0) / (y1 - y0);
        const v = -s * 0.45 + (1 - s * s) * 0.25 - Math.max(0, 0.12 - t) * 3 - Math.max(0, t - 0.94) * 4;
        return v > 0 ? [255, 250, 235, v * 90 * k] : [20, 15, 10, -v * 150 * k];
      });
    }
    function keelStrip(c, col) {
      c.fillStyle = 'rgba(20,15,10,0.35)'; c.fillRect(cx - keel + 2, y0 + 10, keel * 2, y1 - y0);
      c.fillStyle = col; c.beginPath(); c.roundRect(cx - keel, y0 + 4, keel * 2, y1 - y0 + 6, 3); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(cx - keel + 1.5, y0 + 8, 2.5, y1 - y0 - 6);
      for (let y = y0 + 40; y < y1; y += 62) dot(c, cx, y, 1.6, '#4d4034');
    }
    // weathered bare planks, with the last of the old red and white paint
    function bareWood(c, r, nz) {
      const g = ramp(['#857867', '#988a77', '#ab9d88', '#bcae97']);
      field(c, cx - B - 4, y0 - 4, cx + B + 4, y1 + 18, 1.5, (x, y) => g(nz.fbm(x * 0.07, y * 0.006, 4) * 0.85 + nz.n2(x * 0.5, y * 0.03) * 0.15));
      c.lineWidth = 0.7;
      for (let i = 0; i < 260; i++) {
        const x = cx + (r() - 0.5) * B * 2, y = y0 + r() * (y1 - y0), l = 20 + r() * 70;
        c.strokeStyle = r() < 0.7 ? 'rgba(60,50,38,0.3)' : 'rgba(255,255,255,0.14)';
        c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 3, y + l); c.stroke();
      }
      field(c, cx - B, y0, cx + B, y1 + 14, 2, (x, y) => {
        const v = nz.fbm(x * 0.04 + 50, y * 0.02, 4), s = Math.abs(x - cx) / Math.max(8, w(y));
        return s > 0.82 ? [236, 230, 216, Math.max(0, v - 0.45) * 420] : [168, 82, 70, Math.max(0, v - 0.55) * 380];
      });
      strakes(c, 'rgba(45,35,25,0.55)', 'rgba(255,245,225,0.25)');
      shade(c, 1);
    }
    function barnacle(c, r, x, y, s) {
      c.fillStyle = 'rgba(30,25,20,0.35)'; c.beginPath(); c.arc(x + 0.8, y + 1, s, 0, 7); c.fill();
      c.fillStyle = U.pick(r, ['#d8d3c4', '#cfc9b8', '#e2ddd0', '#bdb7a7']); c.beginPath(); c.arc(x, y, s, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); c.arc(x - s * 0.3, y - s * 0.3, s * 0.45, 0, 7); c.fill();
      c.fillStyle = '#5a554a'; c.beginPath(); c.ellipse(x, y, s * 0.35, s * 0.18, r() * 3, 0, 7); c.fill();
    }
    function oar(c, x0, y0, x1, y1) {
      const a = Math.atan2(y1 - y0, x1 - x0), l = Math.hypot(x1 - x0, y1 - y0);
      c.save(); c.translate(x0, y0); c.rotate(a);
      c.fillStyle = 'rgba(40,30,20,0.3)'; c.fillRect(2, 1, l, 6);
      c.fillStyle = '#b08a5e'; c.beginPath(); c.roundRect(0, -3, l - 70, 6, 3); c.fill();
      c.fillStyle = '#6b4a32'; c.beginPath(); c.roundRect(0, -3.5, 26, 7, 3.5); c.fill();
      c.fillStyle = '#c99d6a'; c.beginPath(); c.moveTo(l - 76, -3); c.quadraticCurveTo(l - 50, -10, l, -9); c.quadraticCurveTo(l + 4, 0, l, 9); c.quadraticCurveTo(l - 50, 10, l - 76, 3); c.closePath(); c.fill();
      c.fillStyle = '#c9474f'; c.beginPath(); c.moveTo(l - 22, -9.2); c.quadraticCurveTo(l + 4, -8, l + 2.5, 0); c.quadraticCurveTo(l + 4, 8, l - 22, 9.2); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(2, -2.5, l - 80, 1.5);
      c.restore();
    }
    function decor(c, r, nz, bleed) {
      const { x0, y0, x1, y1 } = bleed;
      sandField(c, nz, x0, y0, x1, y1);
      windRipples(c, r, x0, y0, x1, y1, 50, 0.2);
      grains(c, r, x0, y0, x1, y1, 2200);
      for (let i = 0; i < 70; i++) {
        const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0);
        if (inside(outline, x, y)) continue;
        if (r() < 0.5) shell(c, r, x, y, 3.5 + r() * 3); else pebble(c, r, x, y, 2.5 + r() * 3);
      }
      for (let i = 0; i < 8; i++) wrack(c, r, x0 + r() * 60, y0 + r() * (y1 - y0), 6, r() * 6.28, 2);
      oar(c, 26, 92, 58, 470);
      oar(c, 44, 128, 70, 520);
      // a coil of rope by the stern
      for (let k = 0; k < 6; k++) {
        c.strokeStyle = k % 2 ? '#c9a86a' : '#b8955a'; c.lineWidth = 4;
        c.beginPath(); c.ellipse(316, 548, 8 + k * 4.2, 6 + k * 3.4, 0.2, 0, 7); c.stroke();
      }
      c.strokeStyle = 'rgba(90,70,40,0.4)'; c.lineWidth = 1; c.setLineDash([2, 3]);
      for (let k = 0; k < 6; k++) { c.beginPath(); c.ellipse(316, 548, 8 + k * 4.2, 6 + k * 3.4, 0.2, 0, 7); c.stroke(); }
      c.setLineDash([]);
      softShadow(c, outline, 12, 0.5, 6, 10);
    }
    return { cx, y0, y1, B, keel, N, w, outline, strakes, shade, keelStrip, bareWood, barnacle, decor };
  })();

  function boat(S) {
    const { r, nz, bleed } = S;
    const { cx, y0, y1, B, w, outline } = BOAT;
    return {
      family: 'scrub', particle: 'moss', region: outline, depth: true,
      tough: (x, y) => (Math.abs(x - cx) < 9 ? 1.4 : 1),
      decor(c) { BOAT.decor(c, r, nz, bleed); },
      clean(c) { BOAT.bareWood(c, r, nz); BOAT.keelStrip(c, '#7d6e5c'); },
      dirt(c) {
        // dark grimy planks under weed, salt and barnacles
        const g = ramp(['#45473b', '#535546', '#626352', '#70705c']);
        field(c, cx - B - 4, y0 - 4, cx + B + 4, y1 + 18, 2, (x, y) => g(nz.fbm(x * 0.05, y * 0.01, 4)));
        BOAT.strakes(c, 'rgba(20,20,15,0.6)', 'rgba(255,255,255,0.08)');
        BOAT.shade(c, 0.8);
        BOAT.keelStrip(c, '#4a463a');
        // green weed, thickest towards the rim and the stern
        c.lineWidth = 1; c.lineCap = 'round';
        for (let i = 0; i < 2800; i++) {
          const y = y0 + r() * (y1 - y0), s = (r() - 0.5) * 2, t = (y - y0) / (y1 - y0);
          if (r() > Math.abs(s) * 0.8 + t * 0.4) continue;
          const x = cx + s * w(y), a = r() * 6.28, l = 3 + r() * 5;
          c.strokeStyle = U.pick(r, ['#4f7a2a', '#5e8c34', '#3f6a24', '#6f9a3c']);
          c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
        }
        // crusted salt
        field(c, cx - B, y0, cx + B, y1 + 14, 2, (x, y) => [232, 230, 220, Math.max(0, nz.fbm(x * 0.03 + 9, y * 0.02, 4) - 0.55) * 500]);
        // rust run from the keel bolts
        for (let y = y0 + 40; y < y1; y += 62) for (const side of [-1, 1]) {
          const l = 20 + r() * 26, g2 = c.createLinearGradient(cx, 0, cx + side * l, 0);
          g2.addColorStop(0, 'rgba(150,80,30,0.65)'); g2.addColorStop(1, 'rgba(150,80,30,0)');
          c.fillStyle = g2; c.beginPath(); c.moveTo(cx, y - 2); c.lineTo(cx + side * l, y + (r() - 0.5) * 6); c.lineTo(cx, y + 2.5); c.closePath(); c.fill();
        }
        // barnacles in clusters
        for (let i = 0; i < 48; i++) {
          const y = y0 + 30 + r() * (y1 - y0 - 20), s = (r() < 0.5 ? -1 : 1) * (0.25 + r() * 0.7), x = cx + s * w(y);
          for (let k = 0; k < 6 + r() * 9; k++) BOAT.barnacle(c, r, x + (r() - 0.5) * 22, y + (r() - 0.5) * 22, 1.8 + r() * 2.8);
        }
        grime(c, r, cx - B, y0, cx + B, y1, 20);
        dropping(c, r, 150, 210, 5); dropping(c, r, 220, 390, 4);
      },
      top(c) { c.strokeStyle = 'rgba(40,30,20,0.55)'; c.lineWidth = 2; c.stroke(outline); },
    };
  }

  // the same hull, scrubbed bare and now painted, with a white sheer stripe
  // and her name; the keel stays varnished wood
  function boatPaint(S) {
    const { r, nz, bleed } = S;
    const { cx, y0, y1, B, keel, N, w, outline } = BOAT;
    const region = new Path2D(outline);
    region.rect(cx - keel, y0 + 4, keel * 2, y1 - y0 + 6);
    const stripe = (side) => {
      const p = new Path2D();
      for (let i = 0; i <= N; i++) { const y = y0 + 8 + ((y1 - y0 - 8) * i) / N; const x = cx + side * 0.86 * w(y); if (i) p.lineTo(x, y); else p.moveTo(x, y); }
      for (let i = N; i >= 0; i--) { const y = y0 + 8 + ((y1 - y0 - 8) * i) / N; p.lineTo(cx + side * 0.93 * w(y), y); }
      p.closePath();
      return p;
    };
    return {
      family: 'paint', particle: 'paint', region,
      tough: (x, y) => (y > y1 - 20 || y < y0 + 30 ? 1.3 : 1),
      decor(c) { BOAT.decor(c, r, nz, bleed); },
      clean(c, paint) { c.fillStyle = paint; c.fillRect(0, 0, W, H); },
      cleanOver(c) {
        BOAT.strakes(c, 'rgba(0,0,0,0.25)', 'rgba(255,255,255,0.16)');
        BOAT.shade(c, 0.8);
        // a glossy streak down the lit side
        c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 6; c.lineCap = 'round';
        c.beginPath();
        for (let i = 6; i <= N - 8; i++) { const y = y0 + ((y1 - y0) * i) / N, x = cx - 0.46 * w(y); if (i > 6) c.lineTo(x, y); else c.moveTo(x, y); }
        c.stroke();
      },
      dirt(c) { BOAT.bareWood(c, r, nz); },
      top(c) {
        BOAT.keelStrip(c, '#9a6a40');
        for (const side of [-1, 1]) {
          const p = stripe(side);
          c.fillStyle = '#f7f3ea'; c.fill(p);
          c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 1; c.stroke(p);
        }
        // her name along the side, near the stern
        const y = y0 + (y1 - y0) * 0.66, x = cx + 0.73 * w(y);
        c.save(); c.translate(x, y); c.rotate(Math.PI / 2);
        c.font = 'bold 13px Georgia, "Times New Roman", serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.lineJoin = 'round'; c.strokeStyle = 'rgba(30,25,20,0.75)'; c.lineWidth = 3; c.strokeText('SEASHELL', 0, 0);
        c.fillStyle = '#fbf3dd'; c.fillText('SEASHELL', 0, 0);
        c.restore();
        c.strokeStyle = 'rgba(40,30,20,0.55)'; c.lineWidth = 2; c.stroke(outline);
      },
      stamp: paintStamp,
    };
  }

  // --------------------------------------------------------------- ROCKPOOL
  // A rock pool among the rocks, from above. Under the scum: clear water over
  // sand and pebbles, anemones, mussels, a starfish, two fish and a crab.
  function crabAt(c, x, y, walk) {
    c.save(); c.translate(x, y);
    c.fillStyle = 'rgba(0,30,40,0.2)'; c.beginPath(); c.ellipse(3, 5, 15, 10, 0, 0, 7); c.fill();
    c.strokeStyle = '#a8402a'; c.lineWidth = 2; c.lineCap = 'round'; c.lineJoin = 'round';
    for (const side of [-1, 1]) for (let k = 0; k < 4; k++) {
      const sw = Math.sin(walk * 22 + k * 1.6 + (side > 0 ? 0 : Math.PI)) * 2.5;
      const bx = side * 9, by = -3 + k * 3.2;
      c.beginPath(); c.moveTo(bx, by); c.lineTo(side * 16, by + 1 + k * 1.2 + sw); c.lineTo(side * 20, by + 7 + k * 1.8 + sw); c.stroke();
    }
    // claws
    for (const side of [-1, 1]) {
      c.strokeStyle = '#b8462e'; c.lineWidth = 2.6;
      c.beginPath(); c.moveTo(side * 6, -6); c.lineTo(side * 10, -12); c.stroke();
      c.fillStyle = '#d8573a'; c.beginPath(); c.ellipse(side * 11, -16, 4, 5.5, side * 0.3, 0, 7); c.fill();
      c.strokeStyle = '#8e2f1e'; c.lineWidth = 1; c.beginPath(); c.moveTo(side * 11, -21); c.lineTo(side * 11, -15); c.stroke();
    }
    c.fillStyle = '#c94d33'; c.beginPath(); c.ellipse(0, 0, 12, 8.5, 0, 0, 7); c.fill();
    c.fillStyle = '#ec7a52'; c.beginPath(); c.ellipse(-2, -2, 7, 4.5, 0, 0, 7); c.fill();
    dot(c, 4, 2, 1.2, '#a8402a'); dot(c, -5, 3, 1, '#a8402a');
    for (const side of [-1, 1]) { dot(c, side * 3.5, -9.5, 2, '#f7f3ea'); dot(c, side * 3.7, -10, 1.2, '#1f1a18'); }
    c.restore();
  }
  function rockpool(S) {
    const { r, nz, bleed } = S;
    const cx = 180, cy = 300;
    const region = new Path2D();
    blob(region, cx, cy, 134, 214, r, 0.12, 18);
    const room = (x, y, m) => inside(region, x, y) && inside(region, x + m, y) && inside(region, x - m, y) && inside(region, x, y + m) && inside(region, x, y - m);
    const spots = (n, minD, m) => {
      const out = [];
      for (let i = 0; i < 500 && out.length < n; i++) {
        const x = cx + (r() - 0.5) * 260, y = cy + (r() - 0.5) * 420;
        if (!room(x, y, m) || out.some((p) => Math.hypot(p[0] - x, p[1] - y) < minD)) continue;
        out.push([x, y]);
      }
      return out;
    };
    const anem = spots(9, 42, 16), muss = spots(4, 70, 22), star = spots(1, 0, 28)[0] || [150, 380];
    const fish = [{ ph: 0.5, sp: 0.55, rx: 80, ry: 130, col: '#a9b9bd', fin: '#7f9196' }, { ph: 3.1, sp: 0.42, rx: 60, ry: 100, col: '#d2bf93', fin: '#b09a6a' }];
    const crab = { x0: 116, x1: 196, y: 424 };
    // where the rock rim meets the water, all the way round
    const rim = [];
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * 6.283;
      let k = 0.8, x = cx, y = cy;
      for (let s = 0; s < 40; s++) { x = cx + Math.cos(a) * 134 * k; y = cy + Math.sin(a) * 214 * k; if (!inside(region, x, y)) break; k += 0.02; }
      rim.push([x, y, a]);
    }
    return {
      family: 'skim', particle: 'water', region, depth: true,
      tough: (x, y) => (nz.fbm(x * 0.025, y * 0.025, 3) > 0.62 ? 1.45 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        // a rocky shore with patches of sand
        const g = ramp(['#5f5850', '#6f675d', '#80776b', '#91877a']);
        field(c, x0, y0, x1, y1, 2, (x, y) => g(nz.fbm(x * 0.015 + 40, y * 0.015, 5)));
        field(c, x0, y0, x1, y1, 2, (x, y) => { const v = nz.fbm(x * 0.01 + 80, y * 0.01, 3); return [220, 196, 146, Math.max(0, v - 0.58) * 900]; });
        c.strokeStyle = 'rgba(30,25,20,0.35)'; c.lineWidth = 1.2;
        for (let i = 0; i < 50; i++) {
          let x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0);
          c.beginPath(); c.moveTo(x, y);
          for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 30; y += (r() - 0.5) * 30; c.lineTo(x, y); }
          c.stroke();
        }
        for (let i = 0; i < 24; i++) rock(c, r, x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 14 + r() * 22);
        for (let i = 0; i < 50; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0); dot(c, x, y, 1.2 + r() * 1.2, 'rgba(215,210,195,0.7)'); dot(c, x, y, 0.5, 'rgba(90,80,70,0.7)'); }
        for (let i = 0; i < 14; i++) wrack(c, r, x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 6, r() * 6.28, 2);
        softShadow(c, region, 12, 0.55);
      },
      clean(c) {
        // the sandy bottom, ripples, pebbles and the things living there
        sandField(c, nz, 0, 0, W, H, ['#c9b07a', '#d8c08a', '#e4cf9c', '#eedcae']);
        c.strokeStyle = 'rgba(120,95,60,0.25)'; c.lineWidth = 1.5;
        for (let y = 20; y < H; y += 11) { c.beginPath(); for (let x = 0; x <= W; x += 12) { const yy = y + Math.sin(x * 0.06 + y) * 2.5; if (x) c.lineTo(x, yy); else c.moveTo(x, yy); } c.stroke(); }
        for (let i = 0; i < 110; i++) pebble(c, r, r() * W, r() * H, 2 + r() * 5, ['#a79d8c', '#cfc4b0', '#b9a48c', '#d9cfc0', '#c49a7a', '#e2d6c4']);
        c.lineCap = 'round';
        for (let i = 0; i < 22; i++) {
          const x = r() * W, y = r() * H;
          for (let k = 0; k < 6; k++) {
            const a = -Math.PI / 2 + (r() - 0.5) * 1.6, l = 14 + r() * 18;
            c.strokeStyle = U.pick(r, ['#4f8a3a', '#5e9a44', '#6faa4c']); c.lineWidth = 2.2;
            c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + 0.4) * l * 0.5, y + Math.sin(a + 0.4) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
          }
        }
        // clear water over the bottom, deeper in the middle; the creatures
        // sit just under the surface so they keep their colours
        const wg = c.createRadialGradient(cx, cy, 20, cx, cy, 250);
        wg.addColorStop(0, 'rgba(10,120,145,0.5)'); wg.addColorStop(0.7, 'rgba(40,160,175,0.34)'); wg.addColorStop(1, 'rgba(90,195,200,0.2)');
        c.fillStyle = wg; c.fillRect(0, 0, W, H);
        for (const [x, y] of muss) for (let k = 0; k < 8; k++) {
          const mx = x + (r() - 0.5) * 30, my = y + (r() - 0.5) * 24, a = r() * 6.28;
          c.save(); c.translate(mx, my); c.rotate(a);
          c.fillStyle = 'rgba(20,20,30,0.3)'; c.beginPath(); c.ellipse(1, 1.5, 8, 4, 0, 0, 7); c.fill();
          c.fillStyle = '#2c3446'; c.beginPath(); c.ellipse(0, 0, 8, 4, 0, 0, 7); c.fill();
          c.fillStyle = '#4c5a78'; c.beginPath(); c.ellipse(-1.5, -1.2, 5, 1.6, 0, 0, 7); c.fill();
          c.restore();
        }
        for (const [x, y] of anem) {
          const s = 7 + r() * 5;
          c.strokeStyle = '#d9465a'; c.lineWidth = 1.6;
          for (let k = 0; k < 16; k++) { const a = (k / 16) * 6.283; c.beginPath(); c.moveTo(x + Math.cos(a) * s * 0.7, y + Math.sin(a) * s * 0.7); c.lineTo(x + Math.cos(a + 0.15) * s * 1.5, y + Math.sin(a + 0.15) * s * 1.5); c.stroke(); }
          dot(c, x, y, s, '#b8243a'); dot(c, x - s * 0.2, y - s * 0.2, s * 0.65, '#d9465a'); dot(c, x, y, s * 0.25, '#7a1424');
        }
        c.save(); c.translate(star[0], star[1]); c.rotate(r() * 6.28);
        c.fillStyle = 'rgba(40,20,10,0.3)'; starPath(c, 2, 3, 22, 5); c.fill();
        c.fillStyle = '#e8743a'; starPath(c, 0, 0, 22, 5); c.fill();
        c.fillStyle = '#f39a5a'; starPath(c, -1, -1, 15, 5); c.fill();
        for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k / 5) * 6.283; for (let j = 1; j <= 4; j++) dot(c, Math.cos(a) * j * 4.3, Math.sin(a) * j * 4.3, 1.1, '#fbd2a8'); }
        c.restore();
        c.fillStyle = 'rgba(80,190,200,0.1)'; c.fillRect(0, 0, W, H);
      },
      cleanOver(c) {
        // light dancing on the bottom
        c.save(); c.globalCompositeOperation = 'lighter';
        c.strokeStyle = 'rgba(255,255,255,0.09)'; c.lineWidth = 1.4;
        for (let i = 0; i < 80; i++) { const x = r() * W, y = r() * H, l = 10 + r() * 22; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + l * 0.3, y - 4, x + l * 0.6, y + 4, x + l, y); c.stroke(); }
        c.restore();
      },
      live(c, t) {
        for (const f of fish) {
          const a = t * f.sp + f.ph;
          const x = cx + Math.sin(a) * f.rx, y = cy + Math.sin(a * 1.7 + f.ph) * f.ry * 0.6;
          const dx = Math.cos(a) * f.rx, dy = Math.cos(a * 1.7 + f.ph) * f.ry * 1.02;
          c.save(); c.translate(x, y); c.rotate(Math.atan2(dy, dx)); c.globalAlpha = 0.9;
          c.fillStyle = 'rgba(0,30,40,0.2)'; c.beginPath(); c.ellipse(3, 5, 9, 3.5, 0, 0, 7); c.fill();
          c.fillStyle = f.fin;
          c.save(); c.translate(-8, 0); c.rotate(Math.sin(t * 10 + f.ph) * 0.4); c.beginPath(); c.moveTo(0, 0); c.lineTo(-6, -4); c.lineTo(-5, 0); c.lineTo(-6, 4); c.closePath(); c.fill(); c.restore();
          c.fillStyle = f.col; c.beginPath(); c.ellipse(0, 0, 9, 3.6, 0, 0, 7); c.fill();
          c.fillStyle = 'rgba(60,70,70,0.35)'; for (const sx of [-3, 1, 5]) c.fillRect(sx, -3, 1.5, 6);
          dot(c, 6, -1.2, 0.9, '#1f1a18');
          c.restore();
        }
        // the crab: a quick sideways dash every few seconds, then a rest
        const n = Math.floor(t / 5.5), u = t - n * 5.5, k = u < 1.2 ? U.smooth(0, 1.2, u) : 1;
        const from = n % 2 ? crab.x1 : crab.x0, to = n % 2 ? crab.x0 : crab.x1;
        crabAt(c, U.lerp(from, to, k), crab.y, u < 1.2 ? t : 0);
        c.fillStyle = 'rgba(255,255,255,0.2)';
        for (let i = 0; i < 6; i++) { const gx = 80 + ((i * 53 + t * 8) % 200), gy = 140 + ((i * 97) % 320); c.beginPath(); c.ellipse(gx, gy, 9, 1.4, 0, 0, 7); c.fill(); }
      },
      dirt(c) {
        const g = ramp(['#4e5530', '#5d6236', '#6c6e3e', '#7b7a48', '#8b8656']);
        field(c, 0, 0, W, H, 2, (x, y) => [...g(nz.fbm(x * 0.03, y * 0.03, 5)), 238]);
        for (let i = 0; i < 1600; i++) { c.fillStyle = U.pick(r, ['rgba(130,140,70,0.6)', 'rgba(100,110,55,0.6)', 'rgba(160,160,100,0.5)']); c.beginPath(); c.arc(r() * W, r() * H, 1 + r() * 2, 0, 7); c.fill(); }
        for (let i = 0; i < 24; i++) seaLettuce(c, r, r() * W, r() * H, 9 + r() * 9);
        for (let i = 0; i < 70; i++) wrack(c, r, r() * W, r() * H, 7 + r() * 6, r() * 6.28, r() < 0.4 ? 3 : 2);
        for (let i = 0; i < 18; i++) kelp(c, r, r() * W, r() * H, 40 + r() * 60, r() * 6.28);
        for (let i = 0; i < 36; i++) tangle(c, r, r() * W, r() * H, 16 + r() * 14);
        for (const [x, y] of rim) if (r() < 0.6) foam(c, r, x - Math.cos(Math.atan2(y - cy, x - cx)) * 10, y - Math.sin(Math.atan2(y - cy, x - cx)) * 10, 9 + r() * 6);
        // a few bits of litter the tide brought in
        c.save(); c.translate(130, 210); c.rotate(0.4);
        c.fillStyle = 'rgba(80,140,210,0.75)'; c.beginPath(); c.moveTo(-14, -8); c.lineTo(10, -12); c.lineTo(16, 4); c.lineTo(4, 12); c.lineTo(-12, 8); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-8, -4); c.lineTo(8, 6); c.stroke();
        c.restore();
        dot(c, 232, 360, 6, '#c9474f'); c.strokeStyle = '#8e2f29'; c.lineWidth = 1; c.setLineDash([1, 1.4]); c.beginPath(); c.arc(232, 360, 6, 0, 7); c.stroke(); c.setLineDash([]); dot(c, 232, 360, 3.5, '#e06a70');
        c.strokeStyle = '#6aa05a'; c.lineWidth = 3.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(150, 470); c.bezierCurveTo(170, 455, 190, 485, 215, 468); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(150, 470); c.bezierCurveTo(170, 455, 190, 485, 215, 468); c.stroke(); c.setLineDash([]);
      },
      top(c) {
        // rough rocks all round the rim, a few with weed hanging into the water
        for (const [x, y, a] of rim) rock(c, r, x + Math.cos(a) * 9, y + Math.sin(a) * 9, 13 + r() * 12);
        for (let i = 0; i < 6; i++) {
          const [x, y, a] = rim[(i * 11 + 3) % rim.length];
          kelp(c, r, x + Math.cos(a) * 6, y + Math.sin(a) * 6, 26 + r() * 20, a + Math.PI + (r() - 0.5) * 0.6);
        }
      },
    };
  }

  // ---------------------------------------------------------------- LANTERN
  // The lighthouse lantern room, front on: curved glass in a red frame, the
  // big lens inside, and the sea and sky seen right through it.
  function lantern(S) {
    const { r, nz, bleed } = S;
    const cx = 180, R = 150, gy0 = 156, gy1 = 466, ty = 312, mw = 10;
    const posts = [-62, -21, 21, 62].map((d) => cx + R * Math.sin((d * Math.PI) / 180));
    const panes = [];
    for (let i = 0; i < 3; i++) for (const [a, b] of [[gy0, ty - mw / 2], [ty + mw / 2, gy1]]) panes.push([posts[i] + mw / 2, a, posts[i + 1] - mw / 2, b]);
    const region = new Path2D();
    for (const [a, b, c2, d] of panes) region.rect(a, b, c2 - a, d - b);
    const hz = 352;
    function lens(c) {
      const lx0 = 108, lx1 = 252, ly0 = 178, ly1 = 428;
      c.fillStyle = 'rgba(255,236,170,0.35)'; c.beginPath(); c.ellipse(cx, 304, 110, 150, 0, 0, 7); c.fill();
      // glass rings above and below the bullseye
      for (let y = ly0 + 14, k = 0; y < ly1 - 14; y += 12, k++) {
        if (y > 256 && y < 352) continue;
        c.fillStyle = k % 2 ? 'rgba(214,236,244,0.85)' : 'rgba(184,214,230,0.85)'; c.fillRect(lx0, y, lx1 - lx0, 12);
        c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(lx0, y, lx1 - lx0, 1.6);
        c.fillStyle = 'rgba(70,110,130,0.35)'; c.fillRect(lx0, y + 10.5, lx1 - lx0, 1.5);
      }
      c.fillStyle = 'rgba(205,230,240,0.9)'; c.fillRect(lx0, 258, lx1 - lx0, 94);
      for (let rr = 46; rr > 4; rr -= 7) { c.strokeStyle = rr % 2 ? 'rgba(255,255,255,0.85)' : 'rgba(90,130,150,0.45)'; c.lineWidth = 2.4; c.beginPath(); c.arc(cx, 305, rr, 0, 7); c.stroke(); }
      const gl = c.createRadialGradient(cx, 305, 2, cx, 305, 34); gl.addColorStop(0, 'rgba(255,248,200,0.95)'); gl.addColorStop(1, 'rgba(255,240,180,0)');
      c.fillStyle = gl; c.beginPath(); c.arc(cx, 305, 34, 0, 7); c.fill();
      // round like a drum: darker at both sides
      const sg = c.createLinearGradient(lx0, 0, lx1, 0);
      sg.addColorStop(0, 'rgba(40,70,90,0.35)'); sg.addColorStop(0.3, 'rgba(255,255,255,0.08)'); sg.addColorStop(0.7, 'rgba(255,255,255,0)'); sg.addColorStop(1, 'rgba(40,70,90,0.4)');
      c.fillStyle = sg; c.fillRect(lx0, ly0, lx1 - lx0, ly1 - ly0);
      // brass caps and the frame bars
      for (const [y, h] of [[ly0, 16], [ly1 - 16, 16]]) { c.fillStyle = '#9a7a2e'; c.fillRect(lx0 - 6, y, lx1 - lx0 + 12, h); c.fillStyle = '#d8b25a'; c.fillRect(lx0 - 6, y + 2, lx1 - lx0 + 12, 4); }
      for (const x of [lx0, cx, lx1]) { c.fillStyle = 'rgba(150,115,45,0.8)'; c.fillRect(x - 1.5, ly0, 3, ly1 - ly0); }
      // the pedestal it stands on
      c.fillStyle = '#2f3a36'; c.fillRect(cx - 26, ly1, 52, gy1 - ly1);
      c.fillStyle = '#b8913d'; c.fillRect(cx - 30, ly1 + 6, 60, 5); c.fillRect(cx - 30, gy1 - 14, 60, 5);
      c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(cx - 22, ly1, 6, gy1 - ly1);
    }
    return {
      family: 'wash', particle: 'suds', region,
      tough(x, y) {
        for (const [a, b, c2, d] of panes) if (x >= a && x <= c2 && y >= b && y <= d) return Math.min(x - a, c2 - x, y - b, d - y) < 12 ? 1.4 : 1;
        return 1;
      },
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        sky(c, y0, 520, x0, x1, '#8fc6e6', '#e3f1f2');
        cloud(c, 40, 120, 20, 0.85); cloud(c, 330, 70, 24, 0.85);
        gull(c, 60, 210, 9); gull(c, 316, 250, 7); gull(c, 296, 160, 6);
        seaBand(c, r, nz, x0, x1, 520, y1);
        // the white tower top below the gallery
        c.fillStyle = '#f3efe6'; c.beginPath(); c.moveTo(70, 494); c.lineTo(290, 494); c.lineTo(300, y1); c.lineTo(60, y1); c.closePath(); c.fill();
        const tg = c.createLinearGradient(60, 0, 300, 0); tg.addColorStop(0, 'rgba(255,255,255,0.3)'); tg.addColorStop(1, 'rgba(0,0,0,0.18)');
        c.fillStyle = tg; c.fillRect(60, 494, 240, y1 - 494);
        c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(56, 494, 248, 10);
      },
      clean(c) {
        // the far side: sky and sea seen straight through the lantern
        const g = c.createLinearGradient(0, gy0, 0, hz);
        g.addColorStop(0, '#8cc5e6'); g.addColorStop(1, '#dff0f4');
        c.fillStyle = g; c.fillRect(0, gy0, W, hz - gy0);
        seaBand(c, r, nz, 0, W, hz, gy1);
        cloud(c, 80, 210, 18, 0.9); cloud(c, 290, 190, 14, 0.85);
        lens(c);
      },
      cleanOver(c) {
        // reflections on the curved glass, darker towards the sides
        for (const [a, b, c2, d] of panes) {
          const sg = c.createLinearGradient(a, 0, c2, 0);
          const side = (a + c2) / 2 < cx - 60 ? -1 : (a + c2) / 2 > cx + 60 ? 1 : 0;
          sg.addColorStop(0, side < 0 ? 'rgba(20,50,70,0.22)' : 'rgba(255,255,255,0.04)');
          sg.addColorStop(1, side > 0 ? 'rgba(20,50,70,0.22)' : 'rgba(255,255,255,0.04)');
          c.fillStyle = sg; c.fillRect(a, b, c2 - a, d - b);
        }
        c.save(); c.globalCompositeOperation = 'lighter';
        for (const [o, wdt, al] of [[-40, 30, 0.2], [30, 12, 0.14], [150, 44, 0.12]]) {
          c.fillStyle = `rgba(255,255,255,${al})`;
          c.beginPath(); c.moveTo(posts[0] + o + 110, gy0); c.lineTo(posts[0] + o + 110 + wdt, gy0); c.lineTo(posts[0] + o - 30 + wdt, gy1); c.lineTo(posts[0] + o - 30, gy1); c.closePath(); c.fill();
        }
        c.restore();
      },
      dirt(c) {
        // salt crust, thickest low down on every pane
        const g = ramp(['#b4bbb4', '#c9cec6', '#dadcd4', '#e8eae3']);
        for (const [a, b, c2, d] of panes) field(c, a, b, c2, d, 2, (x, y) => { const v = nz.fbm(x * 0.03, y * 0.03, 5); return [...g(v), Math.min(255, 196 + v * 40 + ((y - b) / (d - b)) * 34)]; });
        for (let i = 0; i < 1800; i++) { c.fillStyle = r() < 0.6 ? 'rgba(255,255,255,0.7)' : 'rgba(140,145,135,0.5)'; c.fillRect(r() * W, gy0 + r() * (gy1 - gy0), 1 + r(), 1 + r()); }
        // spray dried in streaks, grime, and the gulls have been busy
        c.lineCap = 'round';
        for (let i = 0; i < 60; i++) {
          const x = 40 + r() * 280, y = gy0 + r() * 220, l = 20 + r() * 80;
          c.strokeStyle = `rgba(120,105,80,${0.1 + r() * 0.15})`; c.lineWidth = 1 + r() * 2.5;
          c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 4, y + l); c.stroke();
        }
        grime(c, r, 40, gy0, 320, gy1, 22);
        for (let i = 0; i < 9; i++) dropping(c, r, 60 + r() * 240, gy0 + 10 + r() * 270, 4 + r() * 4);
        c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 0.9;
        for (let i = 0; i < 40; i++) { c.beginPath(); c.arc(40 + r() * 280, gy0 + r() * (gy1 - gy0), 1.5 + r() * 3, 0, 7); c.stroke(); }
        // a gull feather stuck to the glass
        c.save(); c.translate(236, 404); c.rotate(-0.6);
        c.fillStyle = '#f2f0ea'; c.beginPath(); c.moveTo(0, -16); c.quadraticCurveTo(7, -4, 2, 16); c.lineTo(-2, 16); c.quadraticCurveTo(-6, -2, 0, -16); c.fill();
        c.strokeStyle = '#9a958a'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, -15); c.lineTo(0, 18); c.stroke();
        c.restore();
      },
      top(c) {
        // the dome: a red cap with a black vent ball and a lightning rod
        c.strokeStyle = '#2b2b30'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(cx, 30); c.lineTo(cx, 6); c.stroke();
        dot(c, cx, 36, 12, '#2b2b30'); dot(c, cx - 4, 32, 4, 'rgba(255,255,255,0.3)');
        c.fillStyle = '#a83a32'; c.beginPath(); c.ellipse(cx, gy0 - 14, 150, 104, 0, Math.PI, 0); c.closePath(); c.fill();
        c.save(); c.beginPath(); c.ellipse(cx, gy0 - 14, 150, 104, 0, Math.PI, 0); c.closePath(); c.clip();
        c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 1.5;
        for (const d of [-62, -40, -21, 0, 21, 40, 62]) { const x = cx + R * Math.sin((d * Math.PI) / 180); c.beginPath(); c.moveTo(x, gy0 - 14); c.quadraticCurveTo((x + cx) / 2, 60, cx, 46); c.stroke(); }
        const dg = c.createLinearGradient(30, 0, 330, 0);
        dg.addColorStop(0, 'rgba(255,255,255,0.22)'); dg.addColorStop(0.4, 'rgba(255,255,255,0)'); dg.addColorStop(1, 'rgba(0,0,0,0.28)');
        c.fillStyle = dg; c.fillRect(20, 40, 320, gy0);
        c.restore();
        c.fillStyle = '#2b2b30'; c.fillRect(22, gy0 - 16, 316, 16);
        c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(22, gy0 - 16, 316, 3);
        // the frame: the edges of the drum, the posts and the rail across
        for (const [a, b] of [[24, posts[0] + mw / 2], [posts[3] - mw / 2, 336]]) { c.fillStyle = '#7d2a24'; c.fillRect(a, gy0, b - a, gy1 - gy0); }
        for (const x of posts) {
          c.fillStyle = '#a83a32'; c.fillRect(x - mw / 2, gy0, mw, gy1 - gy0);
          c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(x - mw / 2, gy0, 2.5, gy1 - gy0);
          c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x + mw / 2 - 2.5, gy0, 2.5, gy1 - gy0);
          for (let y = gy0 + 14; y < gy1; y += 40) dot(c, x, y, 1.3, '#5d1d18');
        }
        c.fillStyle = '#a83a32'; c.fillRect(posts[0], ty - mw / 2, posts[3] - posts[0], mw);
        c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(posts[0], ty - mw / 2, posts[3] - posts[0], 2.5);
        // the gallery round the lantern, with its railing
        c.fillStyle = '#2b2b30'; c.fillRect(14, gy1, 332, 16);
        c.fillStyle = '#3d4148'; c.fillRect(0, gy1 + 16, W, 12);
        c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(0, gy1 + 16, W, 3);
        c.fillStyle = '#26282d';
        for (let x = 10; x < 360; x += 30) c.fillRect(x - 1.5, gy1 + 28, 3, 52);
        c.fillRect(0, gy1 + 28, W, 4); c.fillRect(0, gy1 + 54, W, 2.5); c.fillRect(0, gy1 + 78, W, 3);
      },
    };
  }

  // ------------------------------------------------------------- LIGHTHOUSE
  // The tower front on: bands in the player's colour between white ones.
  // The white bands, windows, door and the gallery sit above the paint.
  function lighthouse(S) {
    const { r, nz, bleed } = S;
    const cx = 180, yT = 176, yB = 566, hT = 58, hB = 100, N = 7, bh = (yB - yT) / N;
    const half = (y) => U.lerp(hT, hB, (y - yT) / (yB - yT));
    const band = (p, i) => {
      const a = yT + i * bh, b = a + bh;
      p.moveTo(cx - half(a), a); p.lineTo(cx + half(a), a); p.lineTo(cx + half(b), b); p.lineTo(cx - half(b), b); p.closePath();
    };
    const region = new Path2D();
    for (let i = 0; i < N; i += 2) band(region, i);
    const whites = new Path2D();
    for (let i = 1; i < N; i += 2) band(whites, i);
    const tower = new Path2D();
    tower.moveTo(cx - hT, yT); tower.lineTo(cx + hT, yT); tower.lineTo(cx + hB, yB); tower.lineTo(cx - hB, yB); tower.closePath();
    const wins = [[cx - 16, yT + bh * 1.5], [cx + 20, yT + bh * 3.5], [cx - 22, yT + bh * 5.5], [cx + 14, yT + bh * 2.5]];
    // round like a column: lit from the left
    const roundness = (c, k) => field(c, cx - hB - 2, yT, cx + hB + 2, yB, 2, (x, y) => {
      const s = (x - cx) / half(y), v = -s * 0.45 + (1 - s * s) * 0.15;
      return v > 0 ? [255, 252, 240, v * 120 * k] : [20, 15, 10, -v * 170 * k];
    });
    const courses = (c, a) => { c.fillStyle = `rgba(0,0,0,${a})`; for (let y = yT + 9; y < yB; y += 9) c.fillRect(cx - half(y), y, half(y) * 2, 0.8); };
    return {
      family: 'paint', particle: 'paint', region,
      tough(x, y) { const k = (y - yT) / bh; return k - Math.floor(k) < 0.12 || k - Math.floor(k) > 0.88 ? 1.3 : 1; },
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        sky(c, y0, 500, x0, x1, '#9fd0ea', '#e6f3f1');
        cloud(c, 60, 230, 22, 0.85); cloud(c, 300, 140, 26, 0.85); cloud(c, 320, 340, 16, 0.7);
        gull(c, 70, 120, 9); gull(c, 96, 140, 6); gull(c, 290, 260, 8);
        seaBand(c, r, nz, x0, x1, 478, y1);
        for (let i = 0; i < 9; i++) rock(c, r, 30 + i * 38 + (r() - 0.5) * 20, 560 + r() * 30, 18 + r() * 12);
        softShadow(c, tower, 10, 0.3, 4, 4);
      },
      clean(c, paint) { c.fillStyle = paint; c.fillRect(0, 0, W, H); },
      cleanOver(c) { courses(c, 0.06); roundness(c, 1); },
      dirt(c) {
        // old paint faded to a chalky pink, flaking off the render
        const g = ramp(['#b48d84', '#c09a91', '#cba79e', '#d6b4ac']);
        field(c, cx - hB - 2, yT, cx + hB + 2, yB, 2, (x, y) => g(nz.fbm(x * 0.03, y * 0.03, 5) * 0.8 + nz.n2(x * 0.3, y * 0.3) * 0.2));
        peelingPaint(c, r, cx - hB, yT, cx + hB, yB, 90, '#b5b0a6');
        courses(c, 0.08);
        for (let i = 0; i < 26; i++) rustStreak(c, r, cx + (r() - 0.5) * 2 * hT, yT + 4 + r() * (yB - yT - 60), 30 + r() * 50);
        grime(c, r, cx - hB, yT, cx + hB, yB, 24);
        roundness(c, 0.9);
      },
      top(c) {
        // the white bands, with the same roundness and a little weathering
        c.save(); c.clip(whites);
        c.fillStyle = '#f4f1ea'; c.fillRect(0, yT, W, yB - yT);
        courses(c, 0.05); roundness(c, 0.9);
        for (let i = 0; i < 10; i++) { c.fillStyle = 'rgba(150,120,80,0.08)'; c.beginPath(); c.ellipse(cx + (r() - 0.5) * 120, yT + r() * (yB - yT), 6 + r() * 10, 12 + r() * 20, 0, 0, 7); c.fill(); }
        c.restore();
        c.strokeStyle = 'rgba(40,40,45,0.3)'; c.lineWidth = 1.5; c.stroke(tower);
        // little arched windows
        for (const [x, y] of wins) {
          c.fillStyle = '#e9e4da'; c.beginPath(); c.moveTo(x - 11, y + 16); c.lineTo(x - 11, y - 6); c.arc(x, y - 6, 11, Math.PI, 0); c.lineTo(x + 11, y + 16); c.closePath(); c.fill();
          c.fillStyle = '#2f4a5c'; c.beginPath(); c.moveTo(x - 7, y + 13); c.lineTo(x - 7, y - 6); c.arc(x, y - 6, 7, Math.PI, 0); c.lineTo(x + 7, y + 13); c.closePath(); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x - 5, y - 6, 2.5, 14);
          c.fillStyle = '#d8d2c6'; c.fillRect(x - 13, y + 15, 26, 4);
        }
        // the door at the bottom, in a stone surround, with a step
        c.fillStyle = '#d9d2c4'; c.beginPath(); c.moveTo(cx - 25, yB); c.lineTo(cx - 25, yB - 44); c.arc(cx, yB - 44, 25, Math.PI, 0); c.lineTo(cx + 25, yB); c.closePath(); c.fill();
        c.fillStyle = '#2f5547'; c.beginPath(); c.moveTo(cx - 19, yB); c.lineTo(cx - 19, yB - 44); c.arc(cx, yB - 44, 19, Math.PI, 0); c.lineTo(cx + 19, yB); c.closePath(); c.fill();
        c.fillStyle = 'rgba(0,0,0,0.22)'; for (const x of [cx - 7, cx + 6]) c.fillRect(x, yB - 60, 1.5, 60);
        dot(c, cx + 12, yB - 26, 2.2, '#c9a24a');
        c.fillStyle = '#bfb8aa'; c.fillRect(cx - 32, yB, 64, 7);
        // the gallery, the lantern room with its light, and a black dome
        c.fillStyle = '#26282d'; c.fillRect(cx - hT - 20, yT - 14, (hT + 20) * 2, 14);
        c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(cx - hT - 20, yT - 14, (hT + 20) * 2, 3);
        c.fillStyle = 'rgba(30,30,30,0.3)'; c.fillRect(cx - hT, yT, hT * 2, 6);
        c.fillStyle = '#e8eef0'; c.fillRect(cx - 40, yT - 78, 80, 64);
        c.fillStyle = 'rgba(255,236,170,0.95)'; c.beginPath(); c.ellipse(cx, yT - 46, 18, 24, 0, 0, 7); c.fill();
        c.fillStyle = 'rgba(255,248,210,0.4)'; c.beginPath(); c.ellipse(cx, yT - 46, 46, 30, 0, 0, 7); c.fill();
        c.fillStyle = '#26282d'; for (const x of [cx - 40, cx - 14, cx + 12, cx + 38]) c.fillRect(x, yT - 78, 3, 64);
        c.fillRect(cx - hT - 20, yT - 46, (hT + 20) * 2, 3);
        for (let x = cx - hT - 18; x <= cx + hT + 18; x += 13) c.fillRect(x, yT - 46, 2, 32);
        c.fillStyle = '#26282d'; c.beginPath(); c.moveTo(cx - 46, yT - 76); c.quadraticCurveTo(cx - 40, yT - 118, cx, yT - 122); c.quadraticCurveTo(cx + 40, yT - 118, cx + 46, yT - 76); c.closePath(); c.fill();
        dot(c, cx, yT - 128, 7, '#26282d');
        c.strokeStyle = '#26282d'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, yT - 134); c.lineTo(cx, yT - 152); c.stroke();
        // rocks round the foot of the tower
        for (let i = 0; i < 7; i++) rock(c, r, cx - 130 + i * 44 + (r() - 0.5) * 16, yB + 14 + r() * 16, 14 + r() * 10);
      },
      stamp: paintStamp,
    };
  }

  // -------------------------------------------------------------------- VAN
  // A classic rounded camper van parked on the sand by the dunes, seen from
  // the side: mint below the waist, cream above. One kind, four jobs: tidy it
  // inside, wash it, wax it, polish it.
  const VAN = (() => {
    const x0 = 22, x1 = 338, yR = 196, yB = 404, belt = 320;
    const wheels = [{ x: 94, y: 412 }, { x: 270, y: 412 }], WR = 34, AR = 42;
    const side = [[50, 216, 118, 290], [128, 216, 186, 290], [196, 216, 248, 290]];
    const body = new Path2D(), region = new Path2D();
    for (const p of [body, region]) {
      p.moveTo(x0 + 30, yR); p.lineTo(x1 - 70, yR); p.quadraticCurveTo(x1, yR, x1, yR + 80);
      p.lineTo(x1, yB - 14); p.quadraticCurveTo(x1, yB, x1 - 14, yB);
      for (const w of [wheels[1], wheels[0]]) { p.lineTo(w.x + AR, yB); p.arc(w.x, yB, AR, 0, Math.PI, true); }
      p.lineTo(x0 + 12, yB); p.quadraticCurveTo(x0, yB, x0, yB - 12);
      p.lineTo(x0, yR + 30); p.quadraticCurveTo(x0, yR, x0 + 30, yR); p.closePath();
    }
    // the windows are holes in the paintwork
    const winPath = (p) => {
      for (const [a, b, c2, d] of side) p.roundRect(a, b, c2 - a, d - b, 9);
      p.moveTo(268, 216); p.lineTo(298, 216); p.quadraticCurveTo(318, 218, 322, 250); p.lineTo(322, 290);
      p.quadraticCurveTo(322, 296, 316, 296); p.lineTo(268, 296); p.quadraticCurveTo(262, 296, 262, 290); p.lineTo(262, 222); p.quadraticCurveTo(262, 216, 268, 216); p.closePath();
    };
    winPath(region);
    const wins = new Path2D(); winPath(wins);
    const MINT = '#9fd8c4', CREAM = '#f4ecdc';

    // the paint in three states: dull after the wash, hazy with wax, glossy
    function paint(c, r, nz, look) {
      const mint = look === 'gloss' ? '#8fd4bc' : MINT, cream = look === 'gloss' ? '#faf4e8' : CREAM;
      c.fillStyle = cream; c.fillRect(0, 0, W, belt);
      c.fillStyle = mint; c.fillRect(0, belt, W, H - belt);
      let g = c.createLinearGradient(0, yR, 0, yB);
      g.addColorStop(0, 'rgba(255,255,255,0.18)'); g.addColorStop(0.45, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.16)');
      c.fillStyle = g; c.fillRect(0, yR, W, yB - yR);
      if (look === 'dull' || look === 'wax') {
        // flat and a little chalky, the way paint looks after years of sun
        field(c, x0, yR, x1, yB, 2, (x, y) => { const v = nz.n2(x * 0.25, y * 0.25); return v > 0.5 ? [255, 255, 255, (v - 0.5) * 44] : [60, 60, 50, (0.5 - v) * 30]; });
        c.fillStyle = 'rgba(200,195,180,0.12)'; c.fillRect(x0, yR, x1 - x0, yB - yR);
      }
      if (look === 'wax') {
        // a hazy white film of wax, thicker in places
        field(c, x0, yR, x1, yB, 2, (x, y) => [252, 250, 244, 70 + nz.fbm(x * 0.02 + 20, y * 0.02, 4) * 90]);
        c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 2.5;
        for (let i = 0; i < 46; i++) { const x = x0 + 20 + r() * (x1 - x0 - 40), y = yR + 20 + r() * (yB - yR - 40), s = 8 + r() * 10; c.beginPath(); c.arc(x, y, s, r() * 6, r() * 6 + 4); c.stroke(); }
      }
      if (look === 'gloss') {
        // the sky and the dunes mirrored in the paint, crisp highlights
        g = c.createLinearGradient(0, 292, 0, 330);
        g.addColorStop(0, 'rgba(160,210,236,0)'); g.addColorStop(0.55, 'rgba(160,210,236,0.55)'); g.addColorStop(0.8, 'rgba(120,170,200,0.3)'); g.addColorStop(1, 'rgba(160,210,236,0)');
        c.fillStyle = g; c.fillRect(0, 292, W, 38);
        g = c.createLinearGradient(0, belt, 0, belt + 40);
        g.addColorStop(0, 'rgba(150,120,70,0.28)'); g.addColorStop(1, 'rgba(150,120,70,0)');
        c.fillStyle = g; c.fillRect(0, belt, W, 40);
        c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(x0, yR + 4, x1 - x0 - 60, 2.5);
        c.save(); c.globalCompositeOperation = 'lighter';
        for (const [o, wdt] of [[40, 16], [70, 5], [210, 22], [244, 6]]) {
          c.fillStyle = 'rgba(255,255,255,0.32)';
          c.beginPath(); c.moveTo(o, yB); c.lineTo(o + wdt, yB); c.lineTo(o + wdt + 60, yR); c.lineTo(o + 60, yR); c.closePath(); c.fill();
        }
        c.restore();
      }
      // the doors
      c.strokeStyle = 'rgba(0,0,0,0.22)'; c.lineWidth = 1.5;
      c.strokeRect(122, 206, 70, 194); c.strokeRect(254, 206, 74, 194);
    }
    function chromeBelt(c, gleam) {
      c.fillStyle = '#c9ced3'; c.fillRect(x0 + 4, belt - 2.5, x1 - x0 - 8, 5);
      c.fillStyle = gleam ? '#ffffff' : '#e4e7ea'; c.fillRect(x0 + 4, belt - 2.5, x1 - x0 - 8, 1.6);
      if (gleam) for (const x of [70, 228]) { c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.moveTo(x, belt - 9); c.lineTo(x + 1.5, belt - 1.5); c.lineTo(x + 9, belt); c.lineTo(x + 1.5, belt + 1.5); c.lineTo(x, belt + 9); c.lineTo(x - 1.5, belt + 1.5); c.lineTo(x - 9, belt); c.lineTo(x - 1.5, belt - 1.5); c.closePath(); c.fill(); }
    }
    function scenery(c, r, nz, bleed) {
      const { x0: bx0, y0: by0, x1: bx1, y1: by1 } = bleed;
      sky(c, by0, 420, bx0, bx1, '#a3d4ec', '#ecf5ef');
      cloud(c, 70, 90, 24, 0.9); cloud(c, 290, 60, 18, 0.8);
      // rolling dunes with marram grass, then flat sand
      const dune = (yy, amp, ph, col) => {
        c.fillStyle = col; c.beginPath(); c.moveTo(bx0, by1);
        for (let x = bx0; x <= bx1; x += 6) c.lineTo(x, yy - Math.sin(x * 0.012 + ph) * amp - Math.sin(x * 0.031 + ph * 2) * amp * 0.3);
        c.lineTo(bx1, by1); c.closePath(); c.fill();
      };
      dune(330, 26, 0.5, '#e6cf9c'); dune(360, 20, 2.1, '#dcc18a');
      for (let i = 0; i < 18; i++) { const x = bx0 + r() * (bx1 - bx0); marramUp(c, r, x, 340 + r() * 30 - Math.sin(x * 0.012 + 0.5) * 20, 18 + r() * 16); }
      const g = ramp(['#d9bd86', '#e3c995', '#ecd6a8']);
      field(c, bx0, 380, bx1, by1, 2, (x, y) => g(nz.fbm(x * 0.02, y * 0.06, 3) * 0.7 + ((y - 380) / (by1 - 380)) * 0.3));
      grains(c, r, bx0, 380, bx1, by1, 1000);
      // the van's shadow and the dark wheel wells
      c.fillStyle = 'rgba(60,45,25,0.35)'; c.beginPath(); c.ellipse(184, 446, 176, 14, 0, 0, 7); c.fill();
      for (const w of wheels) { c.fillStyle = '#2a2622'; c.beginPath(); c.arc(w.x, yB, AR, Math.PI, 0); c.closePath(); c.fill(); }
      // a bucket and spade left on the sand
      c.fillStyle = '#e2574c'; c.beginPath(); c.moveTo(20, 500); c.lineTo(44, 500); c.lineTo(40, 528); c.lineTo(24, 528); c.closePath(); c.fill();
      c.fillStyle = '#f08a7c'; c.fillRect(20, 500, 24, 4);
      c.strokeStyle = '#3d86c6'; c.lineWidth = 3; c.beginPath(); c.moveTo(56, 492); c.lineTo(66, 528); c.stroke();
      c.fillStyle = '#3d86c6'; c.beginPath(); c.ellipse(67, 532, 6, 8, -0.3, 0, 7); c.fill();
      softShadow(c, body, 10, 0.3, 3, 5);
    }
    function parts(c, belt) {
      // surfboard on the roof rack
      c.fillStyle = '#5b636d'; for (const x of [84, 246]) c.fillRect(x, 184, 4, 13);
      c.fillStyle = '#5b636d'; c.fillRect(70, 182, 196, 3);
      c.fillStyle = 'rgba(30,25,20,0.25)'; c.beginPath(); c.ellipse(176, 178, 132, 7, 0, 0, 7); c.fill();
      c.fillStyle = '#f08a5d'; c.beginPath(); c.ellipse(174, 174, 132, 7.5, 0, 0, 7); c.fill();
      c.fillStyle = '#fbf3e4'; c.fillRect(60, 172.5, 230, 2.5);
      // windows: glass, curtains, chrome rims
      c.save(); c.clip(wins);
      const gl = c.createLinearGradient(0, 214, 0, 296); gl.addColorStop(0, '#bfe0ee'); gl.addColorStop(1, '#4f7f98');
      c.fillStyle = gl; c.fillRect(0, 210, W, 90);
      for (const [a, b, c2, d] of side) {
        for (const s of [0, 1]) {
          const cx2 = s ? c2 - 12 : a + 12;
          c.fillStyle = '#f7f3ea'; c.beginPath(); c.moveTo(cx2 - 12, b); c.lineTo(cx2 + 12, b); c.quadraticCurveTo(cx2 + 4, (b + d) / 2, cx2 + (s ? 12 : -12) * 0.2, d); c.lineTo(cx2 - 12 * (s ? -1 : 1) * 0.2, d); c.closePath(); c.fill();
          c.fillStyle = 'rgba(224,90,80,0.5)'; for (let k = b; k < d; k += 6) c.fillRect(cx2 - 12, k, 24, 2.5);
        }
      }
      c.fillStyle = 'rgba(255,255,255,0.3)';
      for (const o of [60, 140, 210, 275]) { c.beginPath(); c.moveTo(o, 292); c.lineTo(o + 12, 292); c.lineTo(o + 40, 214); c.lineTo(o + 28, 214); c.closePath(); c.fill(); }
      c.restore();
      c.strokeStyle = '#c9ced3'; c.lineWidth = 3; c.stroke(wins);
      c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1; c.stroke(wins);
      if (belt) chromeBelt(c, false);
      // bumpers, lights, mirror and handles
      for (const [a, b] of [[12, 44], [318, 352]]) {
        c.fillStyle = '#9aa1a8'; c.beginPath(); c.roundRect(a, 388, b - a, 15, 6); c.fill();
        c.fillStyle = '#e4e7ea'; c.beginPath(); c.roundRect(a + 2, 390, b - a - 4, 5, 3); c.fill();
      }
      dot(c, 328, 352, 15, '#9aa1a8'); dot(c, 328, 352, 12, '#fff6d6'); dot(c, 324, 348, 4, '#ffffff');
      c.fillStyle = '#f2a33a'; c.beginPath(); c.roundRect(330, 372, 8, 7, 2); c.fill();
      c.fillStyle = '#d9473f'; c.beginPath(); c.roundRect(22, 334, 7, 22, 3); c.fill();
      c.fillStyle = '#5b636d'; c.fillRect(326, 296, 12, 3); c.beginPath(); c.roundRect(334, 286, 9, 14, 3); c.fill();
      for (const x of [184, 318]) { c.fillStyle = '#c9ced3'; c.beginPath(); c.roundRect(x - 12, 326, 14, 4, 2); c.fill(); }
      // white-wall tyres with chrome hubcaps
      for (const w of wheels) {
        dot(c, w.x, w.y, WR, '#2b2b2e');
        dot(c, w.x, w.y, WR - 7, '#f4f1ea');
        dot(c, w.x, w.y, WR - 13, '#3a3a3e');
        const hg = c.createRadialGradient(w.x - 4, w.y - 4, 1, w.x, w.y, 14);
        hg.addColorStop(0, '#ffffff'); hg.addColorStop(1, '#9aa1a8');
        c.fillStyle = hg; c.beginPath(); c.arc(w.x, w.y, 13, 0, 7); c.fill();
        dot(c, w.x, w.y, 3, '#6b7178');
      }
    }
    return { x0, x1, yR, yB, belt, wheels, body, region, wins, paint, parts, scenery, chromeBelt };
  })();

  // the inside, from above: bench seats in a retro check, a little table,
  // a wooden floor; the cab and the kitchen unit stay as they are
  function vanInside(S) {
    const { r, nz, bleed } = S;
    const ix0 = 52, ix1 = 314, iy0 = 150, iy1 = 556;
    const kit = { x0: 238, y0: 182, x1: 314, y1: 398 };
    const benchL = { x0: 52, y0: 198, x1: 118, y1: 392 }, benchB = { x0: 52, y0: 462, x1: 314, y1: 556 };
    const table = { x0: 132, y0: 252, x1: 216, y1: 334 };
    const region = new Path2D();
    region.rect(ix0, iy0, ix1 - ix0, iy1 - iy0);
    region.rect(kit.x0, kit.y0, kit.x1 - kit.x0, kit.y1 - kit.y0);
    function check(c, b) {
      c.fillStyle = '#e8a04a'; c.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0);
      c.save(); c.beginPath(); c.rect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); c.clip();
      c.fillStyle = 'rgba(140,70,30,0.35)';
      for (let x = b.x0; x < b.x1; x += 12) c.fillRect(x, b.y0, 6, b.y1 - b.y0);
      for (let y = b.y0; y < b.y1; y += 12) c.fillRect(b.x0, y, b.x1 - b.x0, 6);
      c.fillStyle = 'rgba(255,240,210,0.25)';
      for (let x = b.x0 + 2; x < b.x1; x += 12) c.fillRect(x, b.y0, 1.5, b.y1 - b.y0);
      c.restore();
    }
    function cushions(c, b, n, vertical) {
      for (let k = 1; k < n; k++) {
        c.fillStyle = 'rgba(90,40,10,0.35)';
        if (vertical) c.fillRect(b.x0, b.y0 + ((b.y1 - b.y0) * k) / n - 1, b.x1 - b.x0, 2.5);
        else c.fillRect(b.x0 + ((b.x1 - b.x0) * k) / n - 1, b.y0, 2.5, b.y1 - b.y0);
      }
      const g = c.createLinearGradient(b.x0, b.y0, b.x1, b.y1);
      g.addColorStop(0, 'rgba(255,255,255,0.16)'); g.addColorStop(1, 'rgba(60,30,10,0.16)');
      c.fillStyle = g; c.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0);
    }
    function floor(c) {
      const g = ramp(['#b98a55', '#c99a62', '#d6a970']);
      field(c, ix0, iy0, ix1, iy1, 2, (x, y) => g(nz.fbm(x * 0.006, y * 0.08, 4)));
      for (let y = iy0; y < iy1; y += 18) { c.fillStyle = 'rgba(80,50,25,0.35)'; c.fillRect(ix0, y, ix1 - ix0, 1.4); }
      c.strokeStyle = 'rgba(90,60,30,0.2)'; c.lineWidth = 0.8;
      for (let i = 0; i < 90; i++) { const x = ix0 + r() * (ix1 - ix0), y = iy0 + r() * (iy1 - iy0); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 30 + r() * 50, y + (r() - 0.5) * 2); c.stroke(); }
    }
    function tableTop(c) {
      c.fillStyle = 'rgba(40,25,10,0.3)'; c.fillRect(table.x0 + 4, table.y0 + 6, table.x1 - table.x0, table.y1 - table.y0);
      c.fillStyle = '#8a5a3c'; c.beginPath(); c.roundRect(table.x0, table.y0, table.x1 - table.x0, table.y1 - table.y0, 8); c.fill();
      c.fillStyle = '#f4ecdc'; c.beginPath(); c.roundRect(table.x0 + 4, table.y0 + 4, table.x1 - table.x0 - 8, table.y1 - table.y0 - 8, 6); c.fill();
      c.fillStyle = 'rgba(159,216,196,0.5)'; c.fillRect(table.x0 + 4, table.y0 + 30, table.x1 - table.x0 - 8, 6);
    }
    return {
      family: 'dust', particle: 'dust', region,
      tough: (x, y) => (nz.fbm(x * 0.02 + 7, y * 0.02, 3) > 0.62 ? 1.4 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        c.fillStyle = '#d9bd86'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
        sandField(c, nz, x0, y0, x1, y1);
        // the body from above: mint roof edge round a cream inside
        c.fillStyle = 'rgba(40,30,20,0.3)'; c.beginPath(); c.roundRect(34, 22, 304, 556, 40); c.fill();
        c.fillStyle = '#9fd8c4'; c.beginPath(); c.roundRect(30, 16, 300, 556, 40); c.fill();
        c.fillStyle = '#f4ecdc'; c.beginPath(); c.roundRect(42, 28, 276, 534, 32); c.fill();
        // the cab: dashboard, wheel, two seats
        c.fillStyle = '#3d4148'; c.beginPath(); c.roundRect(52, 36, 256, 22, 10); c.fill();
        c.strokeStyle = '#2b2b30'; c.lineWidth = 4; c.beginPath(); c.arc(110, 70, 18, 0, 7); c.stroke();
        c.lineWidth = 2; c.beginPath(); c.moveTo(92, 70); c.lineTo(128, 70); c.stroke();
        for (const x of [72, 196]) { check(c, { x0: x, y0: 92, x1: x + 76, y1: 140 }); c.fillStyle = 'rgba(90,40,10,0.35)'; c.fillRect(x, 130, 76, 10); }
      },
      clean(c) {
        floor(c);
        check(c, benchL); cushions(c, benchL, 3, true);
        check(c, benchB); cushions(c, benchB, 4, false);
        c.fillStyle = 'rgba(90,40,10,0.45)'; c.fillRect(benchB.x0, benchB.y1 - 20, benchB.x1 - benchB.x0, 20);
        tableTop(c);
        // a rag rug by the door
        c.fillStyle = '#7fb3c9'; c.beginPath(); c.ellipse(170, 410, 46, 22, 0, 0, 7); c.fill();
        c.strokeStyle = '#f4ecdc'; c.lineWidth = 3; c.beginPath(); c.ellipse(170, 410, 34, 15, 0, 0, 7); c.stroke();
        c.strokeStyle = '#e8a04a'; c.beginPath(); c.ellipse(170, 410, 22, 8, 0, 0, 7); c.stroke();
      },
      dirt(c) {
        // the same, under sand, crumbs and the clutter of a beach day
        floor(c);
        check(c, benchL); check(c, benchB); tableTop(c);
        field(c, ix0, iy0, ix1, iy1, 2, (x, y) => [214, 190, 140, 120 + nz.fbm(x * 0.02, y * 0.02, 4) * 110]);
        grains(c, r, ix0, iy0, ix1, iy1, 2200);
        for (let i = 0; i < 300; i++) dot(c, ix0 + r() * (ix1 - ix0), iy0 + r() * (iy1 - iy0), 0.8 + r() * 1.4, U.pick(r, ['#8a5a2b', '#b5762f', '#6b4a32', '#d9a066']));
        // sweet wrappers, shells, a lost sock
        for (let i = 0; i < 12; i++) {
          c.save(); c.translate(ix0 + 10 + r() * (ix1 - ix0 - 20), iy0 + 10 + r() * (iy1 - iy0 - 20)); c.rotate(r() * 6.28);
          const col = U.pick(r, ['#e2574c', '#f2c230', '#5cae5a', '#bba9df', '#3d86c6']);
          c.fillStyle = col; c.fillRect(-6, -3.5, 12, 7);
          c.beginPath(); c.moveTo(-6, -3.5); c.lineTo(-11, -5); c.lineTo(-11, 5); c.lineTo(-6, 3.5); c.fill();
          c.beginPath(); c.moveTo(6, -3.5); c.lineTo(11, -5); c.lineTo(11, 5); c.lineTo(6, 3.5); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(-5, -2.5, 10, 1.5);
          c.restore();
        }
        for (let i = 0; i < 9; i++) shell(c, r, ix0 + 10 + r() * (ix1 - ix0 - 20), iy0 + 10 + r() * (iy1 - iy0 - 20), 4 + r() * 3);
        c.save(); c.translate(84, 300); c.rotate(0.5);
        c.fillStyle = '#f4ecdc'; c.beginPath(); c.roundRect(-8, -24, 16, 34, 6); c.fill(); c.beginPath(); c.roundRect(-8, 2, 26, 14, 7); c.fill();
        c.fillStyle = '#e2574c'; for (const y of [-18, -10]) c.fillRect(-8, y, 16, 4);
        c.restore();
        for (let i = 0; i < 26; i++) { const x = ix0 + r() * (ix1 - ix0), y = iy0 + r() * (iy1 - iy0), s = 4 + r() * 7; for (let k = 0; k < 6; k++) { const v = 160 + r() * 40; c.fillStyle = `rgba(${v},${v - 6},${v - 14},0.6)`; c.beginPath(); c.arc(x + (r() - 0.5) * s, y + (r() - 0.5) * s * 0.7, s * 0.4, 0, 7); c.fill(); } }
        for (let i = 0; i < 6; i++) wrack(c, r, ix0 + r() * (ix1 - ix0), iy0 + r() * (iy1 - iy0), 5, r() * 6.28, 1);
      },
      top(c) {
        // the kitchen unit: worktop, sink, two burners
        c.fillStyle = 'rgba(40,25,10,0.3)'; c.fillRect(kit.x0 - 4, kit.y0 + 4, kit.x1 - kit.x0 + 4, kit.y1 - kit.y0);
        c.fillStyle = '#b98a55'; c.fillRect(kit.x0, kit.y0, kit.x1 - kit.x0, kit.y1 - kit.y0);
        c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(kit.x0, kit.y0, 3, kit.y1 - kit.y0);
        c.fillStyle = '#c9ced3'; c.beginPath(); c.roundRect(kit.x0 + 12, kit.y0 + 20, 50, 60, 10); c.fill();
        c.fillStyle = '#9aa1a8'; c.beginPath(); c.roundRect(kit.x0 + 17, kit.y0 + 25, 40, 50, 8); c.fill();
        dot(c, kit.x0 + 37, kit.y0 + 64, 3, '#6b7178');
        c.strokeStyle = '#c9ced3'; c.lineWidth = 3; c.beginPath(); c.moveTo(kit.x0 + 37, kit.y0 + 14); c.lineTo(kit.x0 + 37, kit.y0 + 32); c.stroke();
        for (const y of [kit.y0 + 120, kit.y0 + 170]) { dot(c, kit.x0 + 37, y, 15, '#3d4148'); c.strokeStyle = '#8a8f96'; c.lineWidth = 2; c.beginPath(); c.arc(kit.x0 + 37, y, 9, 0, 7); c.stroke(); }
        // the sliding door's step along the left side
        c.fillStyle = '#7a8088'; c.fillRect(42, 398, 10, 64);
      },
    };
  }

  function van(S) {
    const { r, nz, opts, bleed } = S;
    const stage = opts.stage || 'wash';
    if (stage === 'inside') return vanInside(S);
    const looks = { wash: ['dirty', 'dull'], wax: ['dull', 'wax'], polish: ['wax', 'gloss'] }[stage] || ['dirty', 'dull'];
    const paintAs = (c, look) => {
      if (look !== 'dirty') { VAN.paint(c, r, nz, look); if (stage === 'polish') VAN.chromeBelt(c, look === 'gloss'); return; }
      // muddy and dusty, salt-dulled, splashed up from the wheels
      VAN.paint(c, r, nz, 'dull');
      field(c, VAN.x0, VAN.yR, VAN.x1, VAN.yB, 2, (x, y) => [176, 160, 128, 110 + nz.fbm(x * 0.02, y * 0.02, 4) * 90]);
      field(c, VAN.x0, VAN.yR, VAN.x1, VAN.yB, 2, (x, y) => [240, 238, 230, Math.max(0, nz.fbm(x * 0.03 + 60, y * 0.03, 4) - 0.5) * 300]);
      for (let i = 0; i < 70; i++) {
        const w = VAN.wheels[i % 2], x = w.x + (r() - 0.5) * 150, y = VAN.yB - Math.pow(r(), 1.6) * 110, s = 3 + r() * 9;
        c.fillStyle = U.pick(r, ['rgba(110,80,50,0.75)', 'rgba(90,65,40,0.7)', 'rgba(130,100,60,0.7)']);
        c.beginPath(); for (let k = 0; k < 9; k++) { const a = (k / 9) * 6.283, rr = s * (0.5 + r() * 0.7); c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill();
        if (r() < 0.4) { c.strokeStyle = 'rgba(100,72,45,0.6)'; c.lineWidth = s * 0.3; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 3, y + s * 1.6); c.stroke(); }
      }
      c.strokeStyle = 'rgba(120,100,70,0.3)'; c.lineWidth = 2;
      for (let i = 0; i < 40; i++) { const x = VAN.x0 + 10 + r() * (VAN.x1 - VAN.x0 - 20), y = 290 + r() * 30; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 3, y + 20 + r() * 60); c.stroke(); }
      grains(c, r, VAN.x0, VAN.yR, VAN.x1, VAN.yB, 1600);
      for (let i = 0; i < 5; i++) dropping(c, r, 60 + r() * 240, VAN.yR + 10 + r() * 60, 4 + r() * 3);
      grime(c, r, VAN.x0, VAN.yR, VAN.x1, VAN.yB, 24);
    };
    return {
      family: stage === 'wash' ? 'wash' : 'polish', particle: stage === 'polish' ? 'shine' : 'suds', region: VAN.region,
      tough: (x, y) => (y > VAN.yB - 40 && stage === 'wash' ? 1.4 : 1),
      decor(c) { VAN.scenery(c, r, nz, bleed); },
      clean(c) { paintAs(c, looks[1]); },
      dirt(c) { paintAs(c, looks[0]); },
      top(c) { VAN.parts(c, stage !== 'polish'); },
      // waxing leaves soft round swirls behind the cloth
      stamp: stage === 'wax' ? (c, x, y, a, t) => {
        if (t.shape === 'circle' && t.r < 4) return;
        const s = (t.shape === 'rect' ? t.w : t.r * 2) * 0.32;
        c.strokeStyle = 'rgba(255,255,255,0.09)'; c.lineWidth = 2.5;
        c.beginPath(); c.arc(x + Math.cos(a * 3) * s * 0.3, y + Math.sin(a * 3) * s * 0.3, s, a, a + 4.2); c.stroke();
      } : undefined,
    };
  }

  Object.assign(SCENES.KINDS, { sand, hut, boat, boatPaint, rockpool, lantern, lighthouse, van });
})();
