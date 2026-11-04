'use strict';
// Scenes for Foxglove Stables. Each is a variant of an older kind, built
// through SCENES.VARIANTS, with the same layers as every other scene (see
// scenes.js):
//   door { what: 'half' }     a stable door, its top half hooked back and a pony looking out (paint)
//   fence { what: 'jumps' }   two show jumps in the paddock (paint)
//   attic { where: 'tack' }   the tack-room wall of saddles and bridles (dust)
//   hutch { what: 'stable' }  a loose box to muck out, a pony looking in (muck)
//   cat { what: 'pony' }      the pony to groom (brush)
//   bowls { what: 'trough' }  the stone water trough to fill, out in the yard (feed)
//   walk { what: 'pony' }     the track round the paddock, leading the pony (walk)
// The ponies are always content: they watch, blink and enjoy themselves.

(() => {
  const { W, H, field, ramp, softShadow, strokesByColour, mowedLawn, grassGrain, shrub, flowerClump, oakBoards, tackSaddle, tackBridle, tackRosette, paintStamp, peelingPaint, grime, weatheredWood } = SCENES;
  const TAU = Math.PI * 2;
  const dot = (c, x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, TAU); c.fill(); };
  const rect = (c, x, y, w, h, rad) => { c.beginPath(); c.roundRect(x, y, w, h, rad); };
  const circle = (p, x, y, rad) => { p.moveTo(x + rad, y); p.arc(x, y, rad, 0, TAU); };
  const poly = (p, pts) => { p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); };
  const pop = (k) => (k >= 1 ? 1 : Math.max(0, U.easeBack(Math.min(1, k))));
  const PONIES = ['CLOVER', 'BRAMBLE', 'TOFFEE', 'PIPPIN', 'THISTLE', 'BISCUIT', 'NUTMEG', 'MAPLE'];

  // ---------------------------------------------------------------- ponies
  const COATS = [
    { fur: '#a9683c', light: '#cc9460', dark: '#7a4626', mane: '#2f2420', muzzle: '#54423a', nose: '#2f2420', blaze: true },
    { fur: '#c47a42', light: '#e4a86c', dark: '#96562a', mane: '#f0dcae', muzzle: '#f0d2b4', nose: '#b98a78', blaze: true },
    { fur: '#c2c5c8', light: '#e8eaec', dark: '#94999e', mane: '#f6f4f0', muzzle: '#8e8c8e', nose: '#55535a', dapple: true },
    { fur: '#dcb26a', light: '#f2d69e', dark: '#b58a48', mane: '#fbf3e0', muzzle: '#f2d7bc', nose: '#b98a78' },
  ];
  // a pony seen from the front, ears up, x, y at the middle of its face
  function ponyHead(c, x, y, s, C, o = {}) {
    c.save(); c.translate(x, y); c.rotate(o.tilt || 0); c.scale(s, s); c.lineCap = 'round'; c.lineJoin = 'round';
    for (const sx of [-1, 1]) {
      c.save(); c.translate(sx * 21, -54); c.rotate(sx * 0.3);
      c.fillStyle = C.dark; c.beginPath(); c.moveTo(-10, 9); c.quadraticCurveTo(-10, -14, 0, -27); c.quadraticCurveTo(10, -14, 10, 9); c.closePath(); c.fill();
      c.fillStyle = C.fur; c.beginPath(); c.moveTo(-8.6, 8); c.quadraticCurveTo(-8.6, -13, 0, -24); c.quadraticCurveTo(8.6, -13, 8.6, 8); c.closePath(); c.fill();
      c.fillStyle = 'rgba(70,40,30,0.4)'; c.beginPath(); c.moveTo(-4, 6); c.quadraticCurveTo(-4, -8, 0, -16); c.quadraticCurveTo(4, -8, 4, 6); c.closePath(); c.fill();
      c.restore();
    }
    const face = new Path2D();
    face.moveTo(-34, -38); face.bezierCurveTo(-36, -66, 36, -66, 34, -38); face.bezierCurveTo(35, -8, 26, 16, 27, 38); face.bezierCurveTo(28, 68, -28, 68, -27, 38); face.bezierCurveTo(-26, 16, -35, -8, -34, -38); face.closePath();
    const g = c.createLinearGradient(-30, -56, 30, 60);
    g.addColorStop(0, C.light); g.addColorStop(0.5, C.fur); g.addColorStop(1, C.dark);
    c.fillStyle = g; c.fill(face);
    c.save(); c.clip(face);
    if (C.blaze) { c.fillStyle = 'rgba(255,250,240,0.92)'; c.beginPath(); c.moveTo(-5, -30); c.quadraticCurveTo(0, -38, 5, -30); c.quadraticCurveTo(9, 0, 13, 30); c.lineTo(-13, 30); c.quadraticCurveTo(-9, 0, -5, -30); c.closePath(); c.fill(); }
    if (C.dapple) for (const [dx, dy, rr] of [[-20, -30, 5], [-8, -38, 4], [17, -26, 5], [-24, -8, 4], [22, -4, 4], [-14, 12, 3.4], [15, 16, 3.4], [2, -10, 3]]) dot(c, dx, dy, rr, 'rgba(255,255,255,0.28)');
    c.fillStyle = C.muzzle; c.beginPath(); c.moveTo(-32, 34); c.quadraticCurveTo(0, 18, 32, 34); c.lineTo(32, 70); c.lineTo(-32, 70); c.closePath(); c.fill();
    c.restore();
    for (const sx of [-1, 1]) { c.fillStyle = C.nose; c.beginPath(); c.ellipse(sx * 12, 42, 4.2, 5.4, -sx * 0.35, 0, TAU); c.fill(); }
    c.strokeStyle = C.nose; c.lineWidth = 2; c.beginPath(); c.moveTo(-9, 54); c.quadraticCurveTo(0, 59, 9, 54); c.stroke();
    // kind eyes
    for (const sx of [-1, 1]) {
      const ex = sx * 20, ey = -16;
      dot(c, ex, ey, 7.4, '#2b211c'); dot(c, ex - 2, ey - 2.4, 2.5, '#ffffff'); dot(c, ex + 2.4, ey + 2.4, 1.2, 'rgba(255,255,255,0.7)');
      c.strokeStyle = U.shade(C.dark, -0.3); c.lineWidth = 1.8; c.beginPath(); c.arc(ex, ey, 8.8, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
    }
    dot(c, -24, 4, 6.5, 'rgba(239,138,166,0.26)'); dot(c, 24, 4, 6.5, 'rgba(239,138,166,0.26)');
    // the forelock
    c.fillStyle = C.mane;
    c.beginPath(); c.moveTo(-16, -60); c.quadraticCurveTo(0, -72, 16, -60); c.quadraticCurveTo(16, -36, 5, -24); c.quadraticCurveTo(2, -34, -3, -22); c.quadraticCurveTo(-8, -32, -13, -26); c.quadraticCurveTo(-18, -42, -16, -60); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.14)'; c.lineWidth = 1; for (const dx of [-8, -1, 6]) { c.beginPath(); c.moveTo(dx, -60); c.quadraticCurveTo(dx + 1, -44, dx - 1, -30); c.stroke(); }
    if (o.halter) {
      c.strokeStyle = o.halter; c.lineWidth = 3.4;
      c.beginPath(); c.moveTo(-29, 24); c.quadraticCurveTo(0, 16, 29, 24); c.moveTo(-29, 24); c.quadraticCurveTo(-35, -8, -33, -40); c.moveTo(29, 24); c.quadraticCurveTo(35, -8, 33, -40); c.stroke();
      c.fillStyle = '#c9a24a'; for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * 29, 24, 3.4, 0, TAU); c.fill(); }
    }
    c.restore();
  }
  // now and then a slow blink: the same place on the face, eyes shut
  function ponyBlink(c, x, y, s, C, tilt = 0) {
    c.save(); c.translate(x, y); c.rotate(tilt); c.scale(s, s); c.lineCap = 'round';
    for (const sx of [-1, 1]) {
      const ex = sx * 20, ey = -16;
      dot(c, ex, ey, 9.4, U.mix(C.fur, C.light, 0.4));
      c.strokeStyle = '#2b211c'; c.lineWidth = 2.6; c.beginPath(); c.arc(ex, ey - 3, 8, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke();
    }
    c.restore();
  }
  // the neck behind a head seen from the front, running down to the mane side
  function ponyNeck(c, x, y0, y1, w, C, lean = 0) {
    const g = c.createLinearGradient(x - w, 0, x + w, 0);
    g.addColorStop(0, C.dark); g.addColorStop(0.4, C.fur); g.addColorStop(1, C.dark);
    c.fillStyle = g; c.beginPath(); c.moveTo(x - w * 0.62, y0); c.quadraticCurveTo(x - w * 0.8 + lean * 0.4, (y0 + y1) / 2, x - w + lean, y1); c.lineTo(x + w + lean, y1); c.quadraticCurveTo(x + w * 0.8 + lean * 0.4, (y0 + y1) / 2, x + w * 0.62, y0); c.closePath(); c.fill();
    // the mane falling down one side
    c.fillStyle = C.mane; c.beginPath(); c.moveTo(x + w * 0.2, y0 - 6); c.quadraticCurveTo(x + w * 0.9, (y0 + y1) / 2, x + w * 0.96 + lean, y1); c.lineTo(x + w * 0.52 + lean, y1); c.quadraticCurveTo(x + w * 0.5, (y0 + y1) / 2, x + w * 0.1, y0 - 6); c.closePath(); c.fill();
  }
  // a little pony far away, side on
  function tinyPony(c, x, y, s, C, grazing) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = C.fur;
    c.beginPath(); c.ellipse(0, -14, 15, 8, 0, 0, TAU); c.fill();
    for (const lx of [-11, -6, 7, 12]) c.fillRect(lx - 1.2, -10, 2.4, 11);
    c.beginPath(); c.moveTo(-10, -18); c.lineTo(-13, -9); if (grazing) { c.lineTo(-23, 0); c.lineTo(-27, -2); c.lineTo(-22, -9); } else { c.lineTo(-20, -24); c.lineTo(-27, -21); c.lineTo(-22, -31); c.lineTo(-16, -31); } c.closePath(); c.fill();
    c.strokeStyle = C.mane; c.lineWidth = 2.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(14, -18); c.quadraticCurveTo(19, -10, 17, -2); c.stroke();
    c.restore();
  }

  // -------------------------------------------------------------- shared bits
  function cobbles(c, r, x0, y0, x1, y1, cols = ['#a49a8a', '#b3a998', '#978d7e', '#bdb3a2']) {
    c.fillStyle = '#72685a'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    let row = 0;
    for (let y = y0 + 1; y < y1; y += 12, row++) for (let x = x0 - (row % 2 ? 8 : 0); x < x1; x += 16) { c.fillStyle = U.pick(r, cols); c.beginPath(); c.ellipse(x + 8, y + 5, 7, 5, 0, 0, TAU); c.fill(); }
  }
  function foxglove(c, r, x, y, h) {
    c.lineCap = 'round';
    for (const [dx, a] of [[-9, -0.5], [9, 0.5], [-5, -0.9], [6, 0.9]]) { c.fillStyle = U.pick(r, ['#5f8a4a', '#6f9a58', '#527c40']); c.save(); c.translate(x + dx, y - 6); c.rotate(a); c.beginPath(); c.ellipse(0, -9, 6, 15, 0, 0, TAU); c.fill(); c.restore(); }
    c.strokeStyle = '#5f8a4a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 3, y - h * 0.5, x - 2, y - h); c.stroke();
    const n = 12;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), py = y - h * (0.34 + 0.64 * t), side = i % 2 ? 1 : -1, s = U.lerp(8.4, 3, t), px = x + side * s * 0.75 + (1 - t) * 1.5 - t * 3;
      c.fillStyle = U.pick(r, ['#b45f9e', '#c975ad', '#a8518f']);
      c.beginPath(); c.ellipse(px, py, s * 0.86, s * 1.2, side * 0.45, 0, TAU); c.fill();
      c.fillStyle = '#f7e3ef'; c.beginPath(); c.ellipse(px + side * s * 0.16, py + s * 0.72, s * 0.52, s * 0.34, 0, 0, TAU); c.fill();
      c.fillStyle = '#7a2f68'; c.beginPath(); c.arc(px + side * s * 0.16, py + s * 0.72, s * 0.14, 0, TAU); c.fill();
    }
  }
  function strawStrokes(c, r, x0, y0, x1, y1, n, cols, flat) {
    const items = [];
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), l = 7 + r() * 13;
      const a = flat ? (r() - 0.5) * 0.9 + (r() < 0.5 ? 0 : Math.PI) : r() * Math.PI * 2;
      items.push({ x0: x, y0: y, cx: x + Math.cos(a + 0.3) * l * 0.5, cy: y + Math.sin(a + 0.3) * l * 0.5, x1: x + Math.cos(a) * l, y1: y + Math.sin(a) * l, col: U.pick(r, cols), w: 1.2 + r() * 0.8 });
    }
    strokesByColour(c, items, 1.5);
  }
  function hayNet(c, r, x, y, s = 1) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.strokeStyle = '#8a7a5a'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -30); c.lineTo(0, 0); c.stroke();
    dot(c, 0, -32, 4, '#3a2b20');
    c.fillStyle = '#d9b860'; c.beginPath(); c.ellipse(0, 34, 30, 38, 0, 0, TAU); c.fill();
    strawStrokes(c, r, -28, -2, 28, 70, 90, ['#e8c35a', '#c9a24a', '#a8b45a', '#f0d47a'], false);
    c.strokeStyle = '#6f8a5a'; c.lineWidth = 1.2;
    for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(k * 16, 34, k * 5, 74); c.stroke(); }
    for (const yy of [16, 34, 52]) { c.beginPath(); c.ellipse(0, yy, 29 - Math.abs(yy - 34) * 0.36, 7, 0, 0, TAU); c.stroke(); }
    c.restore();
  }

  // ------------------------------------------------------------- HALF DOOR
  // A stable door: the bottom half shut, the top half hooked back on the wall,
  // both in the chosen colour, and a pony looking out over it. Oak boards all
  // round, foxgloves at the foot of the wall, a brass name plate above.
  function halfDoor(S) {
    const { r, nz, bleed } = S;
    const C = COATS[(r() * COATS.length) | 0], name = U.pick(r, PONIES);
    const x0 = 64, x1 = 296, y0 = 110, mid = 318, y1 = 552, cx = 180;
    const fold = [[x1 + 12, y0 + 8], [354, y0 - 22], [354, mid + 24], [x1 + 12, mid - 2]];
    const ledges = [[mid, mid + 26], [y1 - 36, y1 - 10]];
    const brace = [x0 + 12, y1 - 36, x1 - 12, mid + 26];
    const straps = [[x0, mid + 7, 104], [x0, y1 - 29, 104]];
    const latch = [x1 - 54, mid + 42, 34, 12];
    const region = new Path2D();
    region.rect(x0, mid, x1 - x0, y1 - mid);
    for (const [x, y, w] of straps) region.rect(x, y, w, 12);
    region.rect(...latch);
    poly(region, fold);
    const px = cx - 4, py = 214, ps = 1.14, tilt = -0.06, halter = '#c9474f';
    return {
      family: 'paint', particle: 'paint', region,
      tough: (x, y) => (y > y1 - 46 ? 1.35 : 1),
      decor(c) {
        oakBoards(c, r, nz, bleed.x0, bleed.y0, bleed.x1, y1 + 6);
        // the white frame and the dark stable behind it
        const inside = c.createLinearGradient(0, y0, 0, mid + 20);
        inside.addColorStop(0, '#2b2019'); inside.addColorStop(1, '#46331f');
        c.fillStyle = inside; c.fillRect(x0, y0, x1 - x0, y1 - y0);
        c.fillStyle = 'rgba(240,210,150,0.1)'; for (let x = x0 + 18; x < x1; x += 46) c.fillRect(x, y0, 2, mid - y0);
        c.strokeStyle = 'rgba(232,195,90,0.3)'; c.lineWidth = 1.4;
        for (let i = 0; i < 40; i++) { const x = x0 + r() * (x1 - x0), y = mid - 4 - r() * 14, a = r() * 6.28; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 10, y + Math.sin(a) * 6); c.stroke(); }
        const fr = new Path2D(); fr.rect(x0 - 12, y0 - 12, x1 - x0 + 24, y1 - y0 + 12); fr.rect(x0, y0, x1 - x0, y1 - y0);
        c.fillStyle = '#efe9db'; c.fill(fr, 'evenodd');
        c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x0 - 3, y0, 3, y1 - y0); c.fillRect(x0, y0 - 3, x1 - x0, 3);
        c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x0 - 12, y0 - 12, x1 - x0 + 24, 2);
        // the name plate
        c.fillStyle = 'rgba(0,0,0,0.28)'; rect(c, cx - 56, 53, 116, 32, 3); c.fill();
        c.fillStyle = '#d9b562'; rect(c, cx - 58, 50, 116, 32, 3); c.fill();
        c.fillStyle = '#f2dc9a'; c.fillRect(cx - 54, 53, 108, 2);
        c.fillStyle = '#4a3218'; c.font = '700 18px Georgia, "Times New Roman", serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(name, cx, 67);
        for (const sx of [-1, 1]) dot(c, cx + sx * 50, 66, 2, '#7a5a26');
        // the yard, and foxgloves at the foot of the wall
        cobbles(c, r, bleed.x0, y1, bleed.x1, bleed.y1);
        c.fillStyle = 'rgba(30,18,8,0.3)'; c.fillRect(bleed.x0, y1, bleed.x1 - bleed.x0, 4);
        for (const [x, h] of [[22, 150], [44, 112], [8, 96]]) foxglove(c, r, x, y1 + 6, h);
        const leaf = new Path2D(); poly(leaf, fold);
        softShadow(c, leaf, 8, 0.4, -4, 5);
        const low = new Path2D(); low.rect(x0, mid, x1 - x0, y1 - mid);
        softShadow(c, low, 8, 0.3, 0, -4);
      },
      clean(c, paint) { c.fillStyle = paint; c.fillRect(0, 0, W, H); },
      cleanOver(c) {
        for (let x = x0 + 33; x < x1 - 8; x += 33) { c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(x - 1, mid, 2, y1 - mid); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x + 1, mid, 1.5, y1 - mid); }
        for (let i = 0; i < 160; i++) { c.strokeStyle = 'rgba(0,0,0,0.05)'; c.lineWidth = 0.8; const x = x0 + r() * (x1 - x0), y = mid + r() * (y1 - mid); c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 20 + r() * 40); c.stroke(); }
        for (const [a, b] of ledges) { c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x0, b, x1 - x0, 4); c.fillStyle = 'rgba(255,255,255,0.16)'; c.fillRect(x0, a, x1 - x0, 2.5); }
        c.save(); c.lineCap = 'butt';
        c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 24; c.beginPath(); c.moveTo(brace[0], brace[1] + 3); c.lineTo(brace[2], brace[3] + 3); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,0.1)'; c.lineWidth = 22; c.beginPath(); c.moveTo(brace[0], brace[1]); c.lineTo(brace[2], brace[3]); c.stroke();
        c.restore();
        // the folded leaf: darker, its planks running away from us
        c.fillStyle = 'rgba(0,0,0,0.14)'; c.beginPath(); fold.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill();
        for (const t of [0.33, 0.66]) { const xx = fold[0][0] + (fold[1][0] - fold[0][0]) * t, a = fold[0][1] + (fold[1][1] - fold[0][1]) * t, b = fold[3][1] + (fold[2][1] - fold[3][1]) * t; c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(xx, a, 1.6, b - a); }
      },
      dirt(c) {
        weatheredWood(c, r, nz, x0 - 2, mid - 2, x1 + 2, y1 + 2);
        weatheredWood(c, r, nz, fold[0][0] - 2, fold[1][1] - 2, fold[1][0] + 2, fold[2][1] + 2);
        peelingPaint(c, r, x0, mid, x1, y1, 40, '#a3b7b1');
        peelingPaint(c, r, fold[0][0], y0, fold[1][0], mid, 12, '#a3b7b1');
        for (const [a, b] of ledges) { c.fillStyle = 'rgba(40,32,24,0.4)'; c.fillRect(x0, b, x1 - x0, 4); c.fillStyle = 'rgba(255,255,255,0.1)'; c.fillRect(x0, a, x1 - x0, 2); }
        c.save(); c.strokeStyle = 'rgba(40,32,24,0.3)'; c.lineWidth = 24; c.beginPath(); c.moveTo(brace[0], brace[1] + 3); c.lineTo(brace[2], brace[3] + 3); c.stroke(); c.restore();
        const gr = c.createLinearGradient(0, y1 - 110, 0, y1); gr.addColorStop(0, 'rgba(90,70,40,0)'); gr.addColorStop(1, 'rgba(90,70,40,0.6)');
        c.fillStyle = gr; c.fillRect(x0, y1 - 110, x1 - x0, 110);
        grime(c, r, x0, y1 - 80, x1, y1, 22);
        // mud kicked up from the yard
        for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(100,72,44,${(0.25 + r() * 0.35).toFixed(2)})`; c.beginPath(); c.ellipse(x0 + r() * (x1 - x0), y1 - r() * r() * 150, 2 + r() * 6, 1.6 + r() * 4, r() * 3, 0, TAU); c.fill(); }
      },
      top(c) {
        // the iron: strap hinges, the bolt, the bar along the top edge
        for (const [x, y, w] of straps) {
          c.fillStyle = '#2f2c2a'; c.fillRect(x, y, w, 12);
          c.beginPath(); c.moveTo(x + w, y - 3); c.lineTo(x + w + 14, y + 6); c.lineTo(x + w, y + 15); c.closePath(); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(x, y + 1, w, 2);
          for (let k = 0; k < 4; k++) dot(c, x + 12 + k * 26, y + 6, 2.2, '#56504a');
        }
        const [lx, ly, lw, lh] = latch;
        c.fillStyle = '#2f2c2a'; rect(c, lx, ly, lw, lh, 3); c.fill(); c.fillRect(lx - 6, ly - 4, 6, 20); c.fillRect(lx + lw, ly - 4, 6, 20);
        c.strokeStyle = '#2f2c2a'; c.lineWidth = 4; c.beginPath(); c.moveTo(lx + 17, ly + lh); c.lineTo(lx + 17, ly + lh + 14); c.stroke(); dot(c, lx + 17, ly + lh + 16, 3.4, '#2f2c2a');
        // the hinges of the top half
        for (const yy of [y0 + 30, mid - 30]) { c.fillStyle = '#2f2c2a'; c.fillRect(x1 + 6, yy, 12, 10); }
        // the pony, chin over the door
        ponyNeck(c, px + 2, py + 20, mid + 2, 62, C, 10);
        c.fillStyle = '#4b4a52'; c.fillRect(x0, mid - 4, x1 - x0, 8);
        c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(x0, mid - 4, x1 - x0, 2);
        ponyHead(c, px, py, ps, C, { tilt, halter });
      },
      liveTop(c, t) { if ((t + 1.2) % 5.3 < 0.16) ponyBlink(c, px, py, ps, C, tilt); },
      stamp: paintStamp,
    };
  }

  // ----------------------------------------------------------------- JUMPS
  // Two show jumps standing in the paddock. The poles carry fixed white bands
  // between the painted ones, and the wings slope away from them.
  function jumps(S) {
    const { r, nz, bleed } = S;
    const C = COATS[(r() * COATS.length) | 0];
    const J = [
      { x0: 62, x1: 298, w: 40, top: 196, bot: 312, ys: [216, 246, 276], ph: 16 },
      { x0: 8, x1: 352, w: 58, top: 344, bot: 548, ys: [376, 428, 480], ph: 25 },
    ];
    const region = new Path2D(), slats = [], bands = [], poles = [], wings = [];
    const wing = (p, x, y, w, h, flip) => {
      const out = flip ? x + w : x, inn = flip ? x : x + w;
      p.moveTo(out, y + h); p.lineTo(out, y + h * 0.52); p.quadraticCurveTo(out + (inn - out) * 0.2, y + h * 0.12, inn, y); p.lineTo(inn, y + h); p.closePath();
    };
    for (const j of J) {
      const h = j.bot - j.top;
      for (const flip of [false, true]) {
        const x = flip ? j.x1 - j.w : j.x0;
        wing(region, x, j.top, j.w, h, flip); wings.push({ x, y: j.top, w: j.w, h, flip });
        // two gaps between the boards
        for (const k of [0.3, 0.62]) { const gx = x + j.w * (flip ? 0.16 : 0.46), gw = j.w * 0.38, gy = j.top + h * k, gh = h * 0.26; region.rect(gx, gy, gw, gh); slats.push([gx, gy, gw, gh]); }
      }
      const a = j.x0 + j.w, b = j.x1 - j.w, seg = (b - a) / 5;
      for (const y of j.ys) {
        region.rect(a, y, b - a, j.ph); poles.push([a, y, b - a, j.ph]);
        for (const k of [1, 3]) { region.rect(a + k * seg, y, seg, j.ph); bands.push([a + k * seg, y, seg, j.ph]); }
      }
    }
    const shape = (fn) => { const p = new Path2D(); fn(p); return p; };
    return {
      family: 'paint', particle: 'paint', region,
      tough: (x, y) => (y > 520 ? 1.3 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        const sky = c.createLinearGradient(0, y0, 0, 170); sky.addColorStop(0, '#bfe0ee'); sky.addColorStop(1, '#eef4e4');
        c.fillStyle = sky; c.fillRect(x0, y0, x1 - x0, 176 - y0);
        c.fillStyle = 'rgba(255,255,255,0.8)'; for (const [x, y, s] of [[70, 58, 1], [262, 92, 0.8]]) { for (const [dx, dy, rr] of [[-24, 0, 14], [-4, -8, 19], [20, 0, 15]]) { c.beginPath(); c.arc(x + dx * s, y + dy * s, rr * s, 0, TAU); c.fill(); } }
        // a far hedge and a line of trees
        c.fillStyle = '#b8d89a'; c.beginPath(); c.moveTo(x0, 150); c.quadraticCurveTo(120, 118, x1, 142); c.lineTo(x1, 190); c.lineTo(x0, 190); c.fill();
        for (let i = 0; i < 70; i++) { c.fillStyle = U.pick(r, ['#5d9644', '#4f8a3c', '#6aa04c', '#477d38']); c.beginPath(); c.arc(x0 + r() * (x1 - x0), 148 + r() * 22, 7 + r() * 10, 0, TAU); c.fill(); }
        // the paddock
        mowedLawn(c, nz, x0, 168, x1, y1, false);
        grassGrain(c, r, x0, 168, x1, y1, 6, 0.2);
        // the white rails along the far side, and the other pony having a graze
        c.fillStyle = '#f4f0e6'; for (let x = Math.floor(x0 / 54) * 54; x < x1; x += 54) c.fillRect(x, 150, 6, 34);
        c.fillRect(x0, 156, x1 - x0, 5); c.fillRect(x0, 170, x1 - x0, 5);
        tinyPony(c, 256, 182, 0.72, C, true);
        for (let i = 0; i < 12; i++) flowerClump(c, r, x0 + r() * (x1 - x0), 196 + r() * 390, U.pick(r, ['#ffffff', '#f2c230', '#ffffff']));
        // shadows on the grass
        for (const j of J) {
          c.fillStyle = 'rgba(30,50,20,0.25)';
          c.beginPath(); c.ellipse((j.x0 + j.x1) / 2 + 6, j.bot + 4, (j.x1 - j.x0) / 2 + 4, 9 + j.w * 0.1, 0, 0, TAU); c.fill();
          softShadow(c, shape((p) => { for (const y of j.ys) p.rect(j.x0 + j.w, y, j.x1 - j.x0 - j.w * 2, j.ph); }), 5, 0.25, 2, 6);
        }
      },
      clean(c, paint) { c.fillStyle = paint; c.fillRect(0, 0, W, H); },
      cleanOver(c) {
        for (const [x, y, w, h] of poles) {
          const g = c.createLinearGradient(0, y, 0, y + h);
          g.addColorStop(0, 'rgba(255,255,255,0.32)'); g.addColorStop(0.45, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.22)');
          c.fillStyle = g; c.fillRect(x, y, w, h);
        }
        for (const q of wings) {
          for (let x = q.x + q.w * 0.2; x < q.x + q.w; x += q.w * 0.26) { c.fillStyle = 'rgba(0,0,0,0.13)'; c.fillRect(x, q.y, 1.6, q.h); }
          c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(q.flip ? q.x : q.x + q.w - 3, q.y, 3, q.h);
        }
        for (const [x, y, w, h] of slats) { c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(x - 3, y, w + 6, 3); c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(x - 3, y + h - 2, w + 6, 2); }
      },
      dirt(c) {
        weatheredWood(c, r, nz, 0, J[0].top - 4, W, J[1].bot + 4);
        peelingPaint(c, r, J[0].x0, J[0].top, J[0].x1, J[0].bot, 26);
        peelingPaint(c, r, J[1].x0, J[1].top, J[1].x1, J[1].bot, 44);
        for (const [x, y, w, h] of poles) {
          const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0.25)');
          c.fillStyle = g; c.fillRect(x, y, w, h);
        }
        for (const j of J) { const gr = c.createLinearGradient(0, j.bot - 70, 0, j.bot); gr.addColorStop(0, 'rgba(90,110,50,0)'); gr.addColorStop(1, 'rgba(90,110,50,0.6)'); c.fillStyle = gr; c.fillRect(j.x0, j.bot - 70, j.x1 - j.x0, 70); }
        grime(c, r, 8, 460, 352, 548, 18);
      },
      top(c) {
        // the white bands, the cups the poles rest on, and feet on the grass
        for (const [x, y, w, h] of bands) {
          c.fillStyle = '#f7f3ea'; c.fillRect(x, y, w, h);
          const g = c.createLinearGradient(0, y, 0, y + h);
          g.addColorStop(0, 'rgba(255,255,255,0.6)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(60,50,40,0.25)');
          c.fillStyle = g; c.fillRect(x, y, w, h);
        }
        for (const j of J) {
          const cw = j.w * 0.26;
          for (const y of j.ys) for (const [x, sx] of [[j.x0 + j.w, 1], [j.x1 - j.w, -1]]) {
            c.fillStyle = '#c3c9cf'; c.beginPath(); c.moveTo(x, y + j.ph + 3); c.lineTo(x + sx * cw, y + j.ph + 3); c.lineTo(x + sx * cw * 0.7, y + j.ph - 4); c.lineTo(x, y + j.ph - 4); c.closePath(); c.fill();
            dot(c, x + sx * 4, y + j.ph / 2, 2, '#7d858c');
          }
          for (const q of [j.x0 - 3, j.x1 - j.w - 3]) { c.fillStyle = '#6b4a32'; c.fillRect(q, j.bot - 7, j.w + 6, 9); c.fillStyle = 'rgba(255,230,190,0.2)'; c.fillRect(q, j.bot - 7, j.w + 6, 2); }
        }
      },
      stamp: paintStamp,
    };
  }

  // ------------------------------------------------------------- TACK ROOM
  // The wall of the tack room, seen straight on: saddles on their racks,
  // bridles on round holders, rosettes, and the trunk under a shelf of
  // brushes and tins, all under years of dust.
  function tackRoom(S) {
    const { r, nz, bleed } = S;
    const X0 = 22, X1 = 338, Y0 = 62, Y1 = 556, FLOOR = 556;
    const region = new Path2D();
    region.rect(X0, Y0, X1 - X0, Y1 - Y0);
    const SADDLES = [[92, 158, '#8a4f2a', '#4e7b5b'], [268, 158, '#5e3a24', '#c9474f']];
    const pine = ramp(['#c9a26a', '#d6b27c', '#e0bf8c', '#e8cb9c']);
    return {
      family: 'dust', particle: 'dust', region,
      tough: (x, y) => (y > 430 ? 1.25 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        oakBoards(c, r, nz, x0, y0, x1, FLOOR + 8);
        // a white beam along the top, a brick floor
        c.fillStyle = '#6b4a32'; c.fillRect(x0, y0, x1 - x0, 44 - y0);
        c.fillStyle = 'rgba(255,225,180,0.14)'; c.fillRect(x0, 40, x1 - x0, 3);
        for (let y = FLOOR, row = 0; y < y1; y += 13, row++) for (let x = x0 - (row % 2) * 16; x < x1; x += 32) { c.fillStyle = U.pick(r, ['#a4644a', '#ad6e52', '#98593f', '#b47a5c']); c.fillRect(x + 1, y + 1, 30, 11); }
        const wall = new Path2D(); wall.rect(X0, Y0, X1 - X0, Y1 - Y0);
        softShadow(c, wall, 10, 0.4, 2, 5);
      },
      clean(c) {
        field(c, X0, Y0, X1, Y1, 2, (x, y) => pine(U.clamp(nz.fbm(Math.floor(x / 44) * 2.3 + x * 0.04, y * 0.009, 4), 0, 1)));
        for (let x = X0 + 4; x < X1; x += 44) { c.fillStyle = 'rgba(100,62,26,0.3)'; c.fillRect(x, Y0, 1.8, Y1 - Y0); c.fillStyle = 'rgba(255,240,210,0.28)'; c.fillRect(x + 1.8, Y0, 1.3, Y1 - Y0); }
        for (let i = 0; i < 120; i++) { c.strokeStyle = 'rgba(120,80,40,0.14)'; c.lineWidth = 0.8; const x = X0 + r() * (X1 - X0), y = Y0 + r() * (Y1 - Y0); c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 2, y + 20 + r() * 50); c.stroke(); }
        // saddles on racks, their cloths folded under them
        for (const [x, y, col, cloth] of SADDLES) {
          c.fillStyle = 'rgba(60,35,15,0.28)'; rect(c, x - 56, y - 26, 122, 112, 12); c.fill();
          c.fillStyle = '#6b4a32'; c.fillRect(x - 12, y - 4, 24, 10);
          c.fillStyle = cloth; c.beginPath(); c.moveTo(x - 58, y - 18); c.quadraticCurveTo(x, y + 16, x + 58, y - 22); c.lineTo(x + 46, y + 74); c.lineTo(x - 46, y + 74); c.closePath(); c.fill();
          c.strokeStyle = '#f4ecdc'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x - 46, y + 66); c.lineTo(x + 40, y + 66); c.stroke();
          tackSaddle(c, x, y - 4, 1.36, col);
        }
        // the name painted over them
        c.fillStyle = '#3f6a4c'; c.font = '800 21px ui-rounded, "SF Pro Rounded", system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('FOXGLOVE', 180, 92);
        // bridles and rosettes
        const ry = 272;
        for (const [x, col] of [[62, '#5e3a24'], [132, '#7a4a2a'], [202, '#3b2a20']]) {
          c.fillStyle = 'rgba(60,35,15,0.13)'; c.beginPath(); c.ellipse(x + 4, ry + 60, 22, 62, 0, 0, TAU); c.fill();
          tackBridle(c, x, ry, 1.08, col);
        }
        tackRosette(c, 262, ry + 10, 1.25, '#c9474f'); tackRosette(c, 310, ry + 38, 1.1, '#3d5a86'); tackRosette(c, 258, ry + 78, 1.1, '#e8c35a');
        // the shelf of tins and brushes
        const sy = 430;
        for (const [x, tw, th, col] of [[34, 34, 40, '#4e7b5b'], [74, 26, 30, '#c9474f'], [106, 30, 36, '#e8c35a'], [146, 22, 44, '#7a4a2a']]) {
          c.fillStyle = col; c.fillRect(x, sy - th, tw, th); c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(x + 3, sy - th, 4, th);
          c.fillStyle = '#f4ecdc'; c.fillRect(x + 4, sy - th * 0.66, tw - 8, th * 0.32); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x, sy - th, tw, 3);
        }
        // a dandy brush and a curry comb
        c.fillStyle = '#8a5a3c'; rect(c, 190, sy - 22, 62, 14, 4); c.fill();
        c.fillStyle = '#d9b860'; c.fillRect(194, sy - 8, 54, 8); c.strokeStyle = 'rgba(120,80,30,0.5)'; c.lineWidth = 1; for (let x = 196; x < 248; x += 4) { c.beginPath(); c.moveTo(x, sy - 8); c.lineTo(x, sy); c.stroke(); }
        c.fillStyle = '#c9474f'; rect(c, 262, sy - 26, 50, 26, 8); c.fill();
        c.fillStyle = '#a93a42'; for (let x = 268; x < 310; x += 7) c.fillRect(x, sy - 8, 3, 8);
        c.fillStyle = '#8a6242'; c.fillRect(X0, sy, X1 - X0, 9); c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(X0, sy + 9, X1 - X0, 5); c.fillStyle = 'rgba(255,235,200,0.25)'; c.fillRect(X0, sy, X1 - X0, 2);
        // the trunk
        c.fillStyle = 'rgba(40,22,8,0.3)'; c.beginPath(); c.ellipse(180, 552, 130, 7, 0, 0, TAU); c.fill();
        c.fillStyle = '#3f6a4c'; rect(c, 62, 466, 236, 84, 7); c.fill();
        c.fillStyle = '#4e7b5b'; rect(c, 62, 462, 236, 28, 7); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(68, 465, 224, 3);
        c.fillStyle = '#c9a24a'; c.fillRect(90, 462, 9, 88); c.fillRect(261, 462, 9, 88); rect(c, 170, 482, 20, 20, 3); c.fill();
        c.fillStyle = '#6e521c'; dot(c, 180, 492, 3, '#6e521c');
      },
      liveTop(c, t) {
        // a slant of light from the door, motes drifting in it
        c.save(); c.globalCompositeOperation = 'lighter';
        const g = c.createLinearGradient(40, 60, 240, 540);
        g.addColorStop(0, 'rgba(255,240,200,0.11)'); g.addColorStop(1, 'rgba(255,240,200,0)');
        c.fillStyle = g; c.beginPath(); c.moveTo(0, 60); c.lineTo(120, 60); c.lineTo(330, 560); c.lineTo(150, 560); c.closePath(); c.fill();
        for (let i = 0; i < 22; i++) {
          const ph = i * 1.9, x = 60 + ((i * 41) % 220) + Math.sin(t * 0.3 + ph) * 12, y = 80 + ((i * 67 + t * 6) % 440);
          c.fillStyle = `rgba(255,248,220,${(0.25 + 0.25 * Math.sin(t + ph)).toFixed(2)})`; c.beginPath(); c.arc(x, y, 1.2, 0, TAU); c.fill();
        }
        c.restore();
      },
      dirt(c) {
        const g = ramp(['#8e877b', '#a29b8e', '#b3ad9f', '#c1bbae']);
        field(c, X0, Y0, X1, Y1, 2, (x, y) => { const v = nz.fbm(x * 0.03, y * 0.03, 5); return [...g(v), 232 + v * 22]; });
        // the shapes showing faintly under the dust
        c.save(); c.globalAlpha = 0.16;
        for (const [x, y] of SADDLES) tackSaddle(c, x, y - 4, 1.36, '#6e675c');
        for (const x of [62, 132, 202]) tackBridle(c, x, 272, 1.08, '#6e675c');
        c.fillStyle = '#6e675c'; c.fillRect(X0, 430, X1 - X0, 9); rect(c, 62, 464, 236, 86, 7); c.fill();
        c.restore();
        // dust bunnies along the shelf and the trunk
        for (let i = 0; i < 16; i++) {
          const x = X0 + 10 + r() * (X1 - X0 - 20), y = i < 9 ? 424 + r() * 8 : 456 + r() * 8, s = 6 + r() * 8;
          for (let k = 0; k < 8; k++) { const v = 150 + r() * 40; c.fillStyle = `rgba(${v},${v - 4},${v - 10},0.7)`; c.beginPath(); c.arc(x + (r() - 0.5) * s, y + (r() - 0.5) * s * 0.7, s * 0.4, 0, TAU); c.fill(); }
        }
        // cobwebs in the top corners
        for (const [cx, cy, a0] of [[X0 + 2, Y0 + 2, 0], [X1 - 2, Y0 + 2, Math.PI / 2]]) {
          c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 0.7;
          for (let k = 0; k < 6; k++) { const a = a0 + (k / 5) * (Math.PI / 2); c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * 92, cy + Math.sin(a) * 92); c.stroke(); }
          for (let ring = 12; ring < 92; ring += 12) { c.beginPath(); for (let k = 0; k <= 5; k++) { const a = a0 + (k / 5) * (Math.PI / 2); c.lineTo(cx + Math.cos(a) * ring, cy + Math.sin(a) * ring); } c.stroke(); }
        }
      },
    };
  }

  // ------------------------------------------------------------- LOOSE BOX
  // A loose box from above: out with the old flattened straw, in with deep
  // golden straw. A pony looks in over the half-door in the back wall, a hay
  // net hangs by it, and a bucket stands in the corner.
  function stableBox(S) {
    const { r, nz, bleed } = S;
    const C = COATS[(r() * COATS.length) | 0];
    const fx0 = 26, fy0 = 206, fx1 = 334, fy1 = 566;
    const bucket = { x: 288, y: 254, r: 28 };
    const px = 248, py = 106, ps = 0.68;
    const region = new Path2D();
    region.rect(fx0, fy0, fx1 - fx0, fy1 - fy0);
    circle(region, bucket.x, bucket.y, bucket.r + 2);
    function fresh(c) {
      const g = ramp(['#d9b54e', '#e6c463', '#f0d47a', '#f6e29b']);
      c.save(); c.beginPath(); c.rect(fx0, fy0, fx1 - fx0, fy1 - fy0); c.clip();
      field(c, fx0, fy0, fx1, fy1, 3, (x, y) => g(nz.fbm(x * 0.04 + 3, y * 0.04, 4)));
      strawStrokes(c, r, fx0, fy0, fx1, fy1, 3000, ['#f5dc7a', '#e8c35a', '#d9ae45', '#fbe9a6', '#c99a3a'], false);
      c.restore();
    }
    return {
      family: 'muck', particle: 'chips', region, depth: true, indoor: true,
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        oakBoards(c, r, nz, x0, y0, x1, y1);
        // the half-door in the back wall, the yard beyond it
        const sky = c.createLinearGradient(0, y0, 0, 150); sky.addColorStop(0, '#cfe8f1'); sky.addColorStop(1, '#f2f4e2');
        c.fillStyle = '#efe9db'; c.fillRect(170, 22, 156, 186);
        c.fillStyle = sky; c.fillRect(180, 32, 136, 176);
        c.fillStyle = '#b8d89a'; c.fillRect(180, 96, 136, 112);
        for (let i = 0; i < 26; i++) { c.fillStyle = U.pick(r, ['#5d9644', '#4f8a3c', '#6aa04c']); c.beginPath(); c.arc(180 + r() * 136, 94 + r() * 10, 6 + r() * 7, 0, TAU); c.fill(); }
        hayNet(c, r, 92, 92, 0.92);
        // a fresh corner: the box's own straw round the walls
        fresh(c);
        c.fillStyle = 'rgba(30,18,8,0.4)'; c.fillRect(fx0, fy0, fx1 - fx0, 4);
      },
      clean: fresh,
      dirt(c) {
        const g = ramp(['#7d705c', '#928469', '#a69678', '#b5a585']);
        field(c, fx0 - 4, fy0 - 4, fx1 + 4, fy1 + 4, 3, (x, y) => [...g(nz.fbm(x * 0.03, y * 0.03, 4)), 240]);
        strawStrokes(c, r, fx0, fy0, fx1, fy1, 2100, ['#8f8068', '#a3937a', '#7a6c58', '#b3a386', '#6f624f'], true);
        for (let i = 0; i < 20; i++) { c.fillStyle = 'rgba(70,58,42,0.32)'; c.beginPath(); c.ellipse(fx0 + r() * (fx1 - fx0), fy0 + r() * (fy1 - fy0), 12 + r() * 20, 7 + r() * 11, r() * 3, 0, TAU); c.fill(); }
        // hoof marks trodden into it
        for (let i = 0; i < 12; i++) {
          const x = fx0 + 20 + r() * (fx1 - fx0 - 40), y = fy0 + 20 + r() * (fy1 - fy0 - 40), a = r() * TAU;
          c.strokeStyle = 'rgba(60,48,34,0.3)'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.arc(x, y, 7.4, a + 0.7, a + 5.6); c.stroke();
        }
      },
      top(c) {
        // the shade along the walls
        const sh = (x, y, w, h, a0, b0, a1, b1) => { const g = c.createLinearGradient(a0, b0, a1, b1); g.addColorStop(0, 'rgba(40,25,10,0.32)'); g.addColorStop(1, 'rgba(40,25,10,0)'); c.fillStyle = g; c.fillRect(x, y, w, h); };
        sh(fx0, fy0, fx1 - fx0, 18, 0, fy0, 0, fy0 + 18); sh(fx0, fy0, 14, fy1 - fy0, fx0, 0, fx0 + 14, 0); sh(fx1 - 14, fy0, 14, fy1 - fy0, fx1, 0, fx1 - 14, 0);
        // the pony, chin over the half-door
        c.save(); c.beginPath(); c.rect(180, 32, 136, 176); c.clip();
        ponyNeck(c, px + 2, py + 14, 170, 40, C, 6);
        c.restore();
        ponyHead(c, px, py, ps, C, { tilt: -0.08, halter: '#3d5a86' });
        c.fillStyle = '#4e7b5b'; c.fillRect(180, 144, 136, 62);
        c.fillStyle = 'rgba(0,0,0,0.15)'; for (let x = 202; x < 316; x += 22) c.fillRect(x, 144, 1.6, 62);
        c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(180, 144, 136, 3);
        c.fillStyle = '#4b4a52'; c.fillRect(180, 141, 136, 6);
        // the bucket
        dot(c, bucket.x + 3, bucket.y + 4, bucket.r + 3, 'rgba(40,25,10,0.3)');
        dot(c, bucket.x, bucket.y, bucket.r, '#2f3a44');
        const w = c.createRadialGradient(bucket.x - 8, bucket.y - 8, 2, bucket.x, bucket.y, bucket.r - 5); w.addColorStop(0, '#a5dbe9'); w.addColorStop(1, '#4f9bbf');
        dot(c, bucket.x, bucket.y, bucket.r - 5, '#000'); c.fillStyle = w; c.beginPath(); c.arc(bucket.x, bucket.y, bucket.r - 5, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1.2; c.beginPath(); c.arc(bucket.x - 2, bucket.y - 2, 12, 3.4, 5.2); c.stroke();
        c.strokeStyle = '#9aa3ad'; c.lineWidth = 2.6; c.beginPath(); c.arc(bucket.x, bucket.y, bucket.r + 1, 0.3, 2.9); c.stroke();
      },
      liveTop(c, t) { if ((t + 2.4) % 4.7 < 0.16) ponyBlink(c, px, py, ps, C, -0.08); },
    };
  }

  // ------------------------------------------------------------- THE PONY
  // A pony tied up in the yard, dusty from a good roll, burrs in its mane.
  // Brushing brings up the shine. It stands with one hind hoof resting and
  // its eyes half shut, thoroughly enjoying it.
  const clockwise = (pts) => {
    let a = 0;
    for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; }
    return a < 0 ? pts.slice().reverse() : pts;
  };
  // a smooth closed curve through points, sampled, so it can be used with 'nonzero'
  function smooth(pts, n = 8) {
    const out = [], m = pts.length;
    for (let i = 0; i < m; i++) {
      const p0 = pts[(i + m - 1) % m], p1 = pts[i], p2 = pts[(i + 1) % m], p3 = pts[(i + 2) % m];
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        out.push([
          0.5 * (2 * p1[0] + (p2[0] - p0[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (3 * p1[0] - p0[0] - 3 * p2[0] + p3[0]) * t3),
          0.5 * (2 * p1[1] + (p2[1] - p0[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (3 * p1[1] - p0[1] - 3 * p2[1] + p3[1]) * t3),
        ]);
      }
    }
    return out;
  }
  function burr(c, x, y, s) {
    c.strokeStyle = '#5d7a2e'; c.lineWidth = 1;
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; c.beginPath(); c.moveTo(x + Math.cos(a) * s * 0.6, y + Math.sin(a) * s * 0.6); c.lineTo(x + Math.cos(a) * s * 1.4, y + Math.sin(a) * s * 1.4); c.stroke(); }
    dot(c, x, y, s, '#6f8f37'); dot(c, x - s * 0.3, y - s * 0.3, s * 0.4, '#9cb85a');
  }
  function ponyGroom(S) {
    const { r, nz, bleed } = S;
    const C = COATS[(r() * COATS.length) | 0], halter = '#c9474f';
    // the whole pony, side on, facing left: back, rump, belly, chest, neck and head
    const BODY = clockwise(smooth([
      [150, 206], [200, 216], [250, 212], [296, 206], [332, 232], [342, 282], [334, 336], [310, 378],
      [262, 396], [206, 402], [156, 396], [118, 372], [100, 330], [92, 290], [84, 256], [72, 266], [50, 292], [24, 302], [8, 278], [14, 240], [32, 200], [48, 160], [66, 124], [94, 122], [122, 164],
    ], 7));
    const EARS = [[[56, 134], [50, 92], [76, 122]], [[74, 124], [80, 88], [94, 128]]].map(clockwise);
    const leg = (x, y0, w, foot, x2 = x) => clockwise([[x - w, y0], [x + w, y0], [x2 + w * 0.7, y0 + (foot - y0) * 0.55], [x2 + w * 0.62, foot], [x2 - w * 0.62, foot], [x2 - w * 0.7, y0 + (foot - y0) * 0.55]]);
    const FEET = [[140, 24, 506], [176, 20, 494, 180], [264, 21, 494, 270], [306, 28, 506, 314]];
    const LEGS = FEET.map(([x, w, foot, x2]) => leg(x, 366, w, foot, x2 === undefined ? x : x2));
    const MANE = clockwise(smooth([[84, 118], [102, 122], [128, 156], [156, 198], [182, 214], [164, 232], [134, 212], [106, 186], [84, 146]], 6));
    const FORE = clockwise(smooth([[66, 120], [86, 124], [76, 160], [58, 186], [50, 170], [58, 142]], 6));
    const TAIL = clockwise(smooth([[330, 216], [350, 230], [354, 296], [358, 370], [350, 436], [328, 426], [332, 354], [332, 286]], 6));
    const region = new Path2D();
    for (const q of [BODY, ...EARS, ...LEGS, MANE, FORE, TAIL]) poly(region, q);
    const hit = U.canvas(1, 1).getContext('2d');
    const inPony = (x, y) => hit.isPointInPath(region, x, y, 'nonzero');
    const hair = [];
    for (let i = 0; i < 3400 && hair.length < 1400; i++) {
      const x = 8 + r() * 350, y = 90 + r() * 420;
      if (!inPony(x, y)) continue;
      // the coat lies back along the body and down the legs
      const a = y > 396 ? Math.PI / 2 + (r() - 0.5) * 0.3 : x < 110 ? 0.9 + (r() - 0.5) * 0.4 : (r() - 0.5) * 0.5 + 0.15;
      hair.push({ x, y, a, l: 6 + r() * 6, c: r() < 0.5 ? C.dark : C.light });
    }
    const outline = (c, q) => { c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); };
    return {
      family: 'brush', particle: 'dust', region, depth: true, fillRule: 'nonzero', indoor: true,
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        // a limewashed wall, an oak beam, a window on the yard
        const wall = ramp(['#e6dcc6', '#eee5d2', '#f4edde']);
        field(c, x0, y0, x1, 472, 3, (x, y) => wall(nz.fbm(x * 0.012, y * 0.02, 4)));
        for (let i = 0; i < 14; i++) { c.fillStyle = `rgba(150,120,90,${(0.03 + r() * 0.04).toFixed(2)})`; c.beginPath(); c.ellipse(x0 + r() * (x1 - x0), y0 + r() * (472 - y0), 8 + r() * 26, 4 + r() * 10, r() * 3, 0, TAU); c.fill(); }
        for (const [x, y] of [[26, 120], [320, 150], [300, 400], [20, 430], [120, 86]]) for (let k = 0; k < 4; k++) { c.fillStyle = U.pick(r, ['#c98a68', '#bb7a58']); c.fillRect(x + (k % 2) * 16 - 8, y + k * 9, 28, 7.4); }
        c.fillStyle = '#6b4a32'; c.fillRect(x0, 46, x1 - x0, 20); c.fillStyle = 'rgba(255,225,180,0.16)'; c.fillRect(x0, 46, x1 - x0, 3); c.fillStyle = 'rgba(40,25,10,0.3)'; c.fillRect(x0, 66, x1 - x0, 4);
        c.fillStyle = '#efe9db'; c.fillRect(216, 82, 118, 96);
        const sky = c.createLinearGradient(0, 88, 0, 172); sky.addColorStop(0, '#bfe0ee'); sky.addColorStop(1, '#eef4e4');
        c.fillStyle = sky; c.fillRect(224, 90, 102, 80);
        for (let i = 0; i < 12; i++) { c.fillStyle = U.pick(r, ['#5d9644', '#4f8a3c', '#6aa04c']); c.beginPath(); c.arc(224 + r() * 102, 154 + r() * 16, 8 + r() * 8, 0, TAU); c.fill(); }
        c.fillStyle = '#efe9db'; c.fillRect(272, 90, 6, 80); c.fillRect(224, 128, 102, 5);
        c.fillStyle = '#e0d8c6'; c.fillRect(210, 176, 130, 7);
        hayNet(c, r, 164, 92, 0.78);
        // the ring the pony is tied to
        c.strokeStyle = '#2f2c2a'; c.lineWidth = 3.4; c.beginPath(); c.arc(20, 346, 8, 0, TAU); c.stroke(); dot(c, 20, 338, 3, '#2f2c2a');
        // cobbles, and the grooming box
        cobbles(c, r, x0, 472, x1, y1);
        const g = c.createLinearGradient(0, 472, 0, 500); g.addColorStop(0, 'rgba(30,18,8,0.32)'); g.addColorStop(1, 'rgba(30,18,8,0)');
        c.fillStyle = g; c.fillRect(x0, 472, x1 - x0, 28);
        c.fillStyle = 'rgba(30,20,10,0.3)'; c.beginPath(); c.ellipse(226, 508, 150, 15, 0, 0, TAU); c.fill();
        softShadow(c, region, 12, 0.3, 4, 6);
        c.fillStyle = 'rgba(30,18,8,0.3)'; rect(c, 34, 550, 112, 38, 8); c.fill();
        c.fillStyle = '#3d5a86'; rect(c, 30, 544, 112, 38, 8); c.fill();
        c.fillStyle = '#4f6fa0'; rect(c, 30, 544, 112, 10, 6); c.fill();
        c.fillStyle = '#8a5a3c'; rect(c, 46, 531, 44, 13, 4); c.fill();
        c.fillStyle = '#d9b860'; c.fillRect(100, 533, 28, 11);
      },
      clean(c) {
        const g = c.createRadialGradient(170, 230, 30, 200, 320, 300);
        g.addColorStop(0, C.light); g.addColorStop(0.55, C.fur); g.addColorStop(1, C.dark);
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        // soft shape: the barrel rounding away below, the far legs in shade
        c.save(); outline(c, BODY); c.clip();
        const belly = c.createLinearGradient(0, 320, 0, 404); belly.addColorStop(0, 'rgba(30,15,5,0)'); belly.addColorStop(1, 'rgba(30,15,5,0.26)');
        c.fillStyle = belly; c.fillRect(90, 320, W, 86);
        c.restore();
        // the far legs, in shade below the belly
        c.save(); c.beginPath(); c.rect(0, 397, W, 120); c.clip();
        c.fillStyle = 'rgba(30,15,5,0.24)'; for (const q of [LEGS[1], LEGS[2]]) { outline(c, q); c.fill(); }
        c.restore();
        if (C.dapple) for (let i = 0; i < 80; i++) dot(c, 110 + r() * 220, 216 + r() * 170, 5 + r() * 7, 'rgba(255,255,255,0.18)');
        // white socks on the near legs
        c.fillStyle = 'rgba(255,250,240,0.92)'; for (const q of [LEGS[0], LEGS[3]]) { c.save(); outline(c, q); c.clip(); c.fillRect(0, 456, W, 60); c.restore(); }
        for (const f of hair) { c.strokeStyle = U.rgba(f.c, 0.32); c.lineWidth = 1.1; c.beginPath(); c.moveTo(f.x, f.y); c.quadraticCurveTo(f.x + Math.cos(f.a + 0.4) * f.l * 0.5, f.y + Math.sin(f.a + 0.4) * f.l * 0.5, f.x + Math.cos(f.a) * f.l, f.y + Math.sin(f.a) * f.l); c.stroke(); }
        // the mane, forelock and tail, combed out and shining
        for (const q of [MANE, FORE, TAIL]) {
          outline(c, q); c.fillStyle = C.mane; c.fill();
          c.save(); outline(c, q); c.clip();
          for (let i = 0; i < 90; i++) {
            const x = 50 + r() * 310, y = 110 + r() * 340;
            c.strokeStyle = r() < 0.5 ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)'; c.lineWidth = 1.4;
            c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 8, y + 24, x + 6, y + 46); c.stroke();
          }
          c.restore();
        }
        // the gloss of a well-groomed coat
        c.save(); outline(c, BODY); c.clip();
        for (const [x, y, rx, ry, a, k] of [[214, 250, 96, 24, -0.03, 0.3], [302, 258, 30, 24, 0.5, 0.22], [122, 252, 16, 46, 0.5, 0.18]]) {
          c.save(); c.translate(x, y); c.rotate(a); c.scale(rx, ry);
          const gl = c.createRadialGradient(0, 0, 0, 0, 0, 1); gl.addColorStop(0, `rgba(255,255,255,${k})`); gl.addColorStop(1, 'rgba(255,255,255,0)');
          c.fillStyle = gl; c.beginPath(); c.arc(0, 0, 1, 0, TAU); c.fill(); c.restore();
        }
        c.restore();
      },
      dirt(c) {
        const g = ramp([U.mix(C.dark, '#6e5a44', 0.5), U.mix(C.fur, '#8a7458', 0.55), U.mix(C.fur, '#a08c70', 0.5)]);
        field(c, 0, 80, W, 520, 3, (x, y) => [...g(nz.fbm(x * 0.03, y * 0.03, 4)), 216 + nz.n2(x * 0.09, y * 0.09) * 39]);
        // dried mud, thickest on the legs and under the belly
        for (let i = 0; i < 80; i++) {
          const low = r() < 0.7, x = 100 + r() * 236, y = low ? 356 + r() * 150 : 220 + r() * 130;
          c.fillStyle = `rgba(${96 + r() * 26},${70 + r() * 18},${44 + r() * 14},${(0.22 + r() * 0.26).toFixed(2)})`;
          c.beginPath(); c.ellipse(x, y, 4 + r() * 9, 3 + r() * 6, r() * 3, 0, TAU); c.fill();
        }
        // a few dusty tufts
        for (let i = 0; i < 26; i++) { const x = 70 + r() * 260, y = 150 + r() * 220; for (let k = 0; k < 4; k++) dot(c, x + (r() - 0.5) * 10, y + (r() - 0.5) * 8, 2 + r() * 2.4, 'rgba(226,214,190,0.4)'); }
        // a tangled mane and tail
        for (const q of [MANE, FORE, TAIL]) {
          c.save(); outline(c, q); c.clip();
          c.strokeStyle = U.rgba(U.shade(C.mane, -0.3), 0.75); c.lineWidth = 1.5;
          for (let i = 0; i < 90; i++) { let x = 50 + r() * 310, y = 110 + r() * 340; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 16; y += (r() - 0.5) * 16; c.lineTo(x, y); } c.stroke(); }
          c.restore();
        }
        for (const [x, y] of [[104, 160], [132, 192], [158, 214], [76, 136], [342, 300], [346, 356], [340, 400], [340, 250]]) burr(c, x, y, 3.6 + r() * 1.4);
        for (let i = 0; i < 20; i++) { c.save(); c.translate(110 + r() * 210, 226 + r() * 150); c.rotate(r() * 6.28); c.strokeStyle = U.pick(r, ['#e8c35a', '#d9ae45', '#c9a24a']); c.lineWidth = 1.5; c.beginPath(); c.moveTo(-7, 0); c.lineTo(7, 0); c.stroke(); c.restore(); }
      },
      top(c) {
        c.lineCap = 'round'; c.lineJoin = 'round';
        // hooves
        for (const [x, w, y, x2] of FEET) {
          const hx = x2 === undefined ? x : x2, hw = w * 0.66;
          c.fillStyle = '#2f2622'; c.beginPath(); c.moveTo(hx - hw, y - 10); c.lineTo(hx + hw, y - 10); c.lineTo(hx + hw + 3, y + 3); c.lineTo(hx - hw - 3, y + 3); c.closePath(); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(hx - hw + 2, y - 8, hw * 2 - 4, 2);
        }
        // the inside of the ears
        for (const e of EARS) { const mx = (e[0][0] + e[1][0] + e[2][0]) / 3, my = (e[0][1] + e[1][1] + e[2][1]) / 3; c.fillStyle = 'rgba(70,40,30,0.45)'; c.beginPath(); e.forEach(([x, y], i) => { const px = mx + (x - mx) * 0.5, py = my + (y - my) * 0.5 + 3; if (i) c.lineTo(px, py); else c.moveTo(px, py); }); c.closePath(); c.fill(); }
        // a soft muzzle, a nostril and a contented mouth
        c.save(); outline(c, BODY); c.clip();
        c.fillStyle = C.muzzle; c.beginPath(); c.moveTo(0, 242); c.quadraticCurveTo(34, 244, 54, 296); c.lineTo(40, 320); c.lineTo(-6, 320); c.closePath(); c.fill();
        c.restore();
        c.fillStyle = C.nose; c.beginPath(); c.ellipse(21, 268, 4.2, 5.8, -0.6, 0, TAU); c.fill();
        c.strokeStyle = C.nose; c.lineWidth = 2; c.beginPath(); c.moveTo(20, 292); c.quadraticCurveTo(32, 296, 42, 286); c.stroke();
        // the halter, and the lead rope in a slack loop to the ring on the wall
        c.strokeStyle = halter; c.lineWidth = 4.6;
        c.beginPath(); c.moveTo(16, 226); c.quadraticCurveTo(42, 236, 72, 250); c.moveTo(66, 247); c.lineTo(86, 146); c.moveTo(60, 148); c.quadraticCurveTo(74, 152, 88, 150); c.stroke();
        c.fillStyle = '#c9a24a'; for (const [x, y] of [[66, 247], [85, 148]]) { c.beginPath(); c.arc(x, y, 3.8, 0, TAU); c.fill(); }
        c.strokeStyle = '#d9c9a0'; c.lineWidth = 3; c.beginPath(); c.moveTo(66, 250); c.bezierCurveTo(74, 372, 26, 380, 20, 354); c.stroke();
        c.strokeStyle = 'rgba(120,100,60,0.5)'; c.lineWidth = 1; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(66, 250); c.bezierCurveTo(74, 372, 26, 380, 20, 354); c.stroke(); c.setLineDash([]);
        // a half-shut, happy eye
        const ex = 54, ey = 182;
        c.fillStyle = '#2b211c'; c.beginPath(); c.arc(ex, ey, 7.4, 0, Math.PI); c.fill();
        dot(c, ex - 2, ey + 2, 1.8, '#ffffff');
        c.strokeStyle = U.shade(C.dark, -0.3); c.lineWidth = 3; c.beginPath(); c.moveTo(ex - 10, ey + 1); c.quadraticCurveTo(ex, ey - 4, ex + 10, ey); c.stroke();
        c.lineWidth = 1.6; c.beginPath(); c.moveTo(ex - 8, ey - 1); c.lineTo(ex - 12, ey - 4); c.moveTo(ex - 5, ey - 2); c.lineTo(ex - 8, ey - 6); c.stroke();
        dot(c, 52, 214, 7, 'rgba(239,138,166,0.3)');
      },
      liveTop(c, t) {
        // a little heart now and then, for a lovely scratch
        const life = (t * 0.22) % 1;
        c.globalAlpha = Math.sin(life * Math.PI) * 0.85;
        const x = 30 - life * 10, y = 112 - life * 46, s = 5 + life * 3;
        c.fillStyle = '#ef8aa6'; c.beginPath(); c.moveTo(x, y + s * 0.9);
        c.bezierCurveTo(x - s * 1.6, y - s * 0.1, x - s * 0.7, y - s * 1.3, x, y - s * 0.4);
        c.bezierCurveTo(x + s * 0.7, y - s * 1.3, x + s * 1.6, y - s * 0.1, x, y + s * 0.9); c.fill();
        c.globalAlpha = 1;
      },
    };
  }

  // ---------------------------------------------------------------- TROUGH
  // The long stone trough in the yard, dry as a bone, under the pump. Four bays
  // between its iron straps fill up one by one, and a pony watches over the
  // stable door from the wall behind.
  function drawBay(c, u, k) {
    const s = pop(k);
    c.save(); c.beginPath(); c.rect(u.x, u.y, u.w, u.h); c.clip();
    bayWater(c, u, true);
    if (k < 1) {
      c.strokeStyle = `rgba(255,255,255,${(0.8 * (1 - k)).toFixed(2)})`; c.lineWidth = 2;
      c.beginPath(); c.ellipse(u.x + u.w / 2, u.y + u.h / 2, (u.w * 0.5 * s) + 4, (u.h * 0.5 * s) + 2, 0, 0, TAU); c.stroke();
    }
    c.restore();
  }
  function bayWater(c, u, full) {
    const g = c.createLinearGradient(u.x, u.y, u.x + u.w, u.y + u.h);
    g.addColorStop(0, full ? '#a7dcea' : '#8fcbdc'); g.addColorStop(1, full ? '#4f9bbf' : '#5ca6c4');
    c.fillStyle = g; c.fillRect(u.x, u.y, u.w, u.h);
    const q = U.rng(u.seed);
    c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 1.3;
    for (let i = 0; i < 6; i++) { const x = u.x + 14 + q() * (u.w - 50), y = u.y + 10 + q() * (u.h - 20), l = 14 + q() * 30; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + l / 2, y - 4, x + l, y); c.stroke(); }
  }
  function waterTrough(S) {
    const { r, nz, opts, bleed } = S;
    const C = COATS[(r() * COATS.length) | 0];
    const ox0 = 62, ox1 = 298, oy0 = 186, oy1 = 548, rim = 20;
    const ix0 = ox0 + rim, ix1 = ox1 - rim, iy0 = oy0 + rim, iy1 = oy1 - rim, bars = 4, bay = (iy1 - iy0) / bars;
    const units = [], region = new Path2D();
    for (let i = 0; i < bars; i++) {
      const y = iy0 + i * bay + (i ? 2 : 0), h = bay - (i ? 2 : 0) - (i < bars - 1 ? 2 : 0);
      units.push({ shape: 'rect', x: ix0, y, w: ix1 - ix0, h, seed: (r() * 1e9) | 0 });
      region.rect(ix0, y, ix1 - ix0, h);
    }
    const px = 284, py = 82, ps = 0.56;
    const stone = ramp(['#9a9488', '#aca698', '#bcb6a8', '#c8c2b4']);
    return {
      family: 'feed', particle: 'water', region, depth: false,
      unitKind: 'clink', unitParticle: 'water', unitThreshold: 0.4, unitDur: 0.45,
      units: opts.dirt ? [] : units, drawUnit: drawBay,
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        // the stable wall behind, a half-door with a pony at it, foxgloves at its foot
        oakBoards(c, r, nz, x0, y0, x1, 152);
        c.fillStyle = '#efe9db'; c.fillRect(218, 6, 132, 146);
        c.fillStyle = '#2b2019'; c.fillRect(228, 16, 112, 136);
        // cobbles round the trough, grass at the edges of the yard
        cobbles(c, r, x0, 152, x1, y1);
        c.fillStyle = 'rgba(30,18,8,0.32)'; c.fillRect(x0, 152, x1 - x0, 4);
        for (let i = 0; i < 80; i++) { const left = r() < 0.5, x = left ? x0 + r() * 34 : x1 - r() * 34, y = 240 + r() * 360; c.fillStyle = U.pick(r, ['#6b9a4a', '#7fae58', '#5d8c3e']); c.beginPath(); c.ellipse(x, y, 4 + r() * 6, 2 + r() * 4, r() * 3, 0, TAU); c.fill(); }
        for (const [x, h] of [[26, 104], [46, 78], [12, 66]]) foxglove(c, r, x, 160, h);
        // the trough itself
        const tr = new Path2D(); tr.rect(ox0, oy0, ox1 - ox0, oy1 - oy0);
        softShadow(c, tr, 10, 0.45, 4, 8);
        field(c, ox0, oy0, ox1, oy1, 2, (x, y) => { const v = stone(nz.fbm(x * 0.03, y * 0.03, 4)); return v; });
        c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(ox0, oy0, ox1 - ox0, 3); c.fillRect(ox0, oy0, 3, oy1 - oy0);
        c.fillStyle = 'rgba(50,40,30,0.3)'; c.fillRect(ox0, oy1 - 4, ox1 - ox0, 4); c.fillRect(ox1 - 4, oy0, 4, oy1 - oy0);
        for (let i = 0; i < 26; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '70,90,50' : '60,50,40'},${(0.08 + r() * 0.16).toFixed(2)})`; c.beginPath(); c.ellipse(ox0 + r() * (ox1 - ox0), oy0 + r() * (oy1 - oy0), 4 + r() * 12, 3 + r() * 7, r() * 3, 0, TAU); c.fill(); }
        // moss on the corners
        for (const [x, y] of [[ox0 + 8, oy1 - 8], [ox1 - 8, oy1 - 8], [ox0 + 8, oy0 + 8]]) for (let k = 0; k < 8; k++) { c.fillStyle = U.pick(r, ['#6f8a42', '#7f9a4c']); c.beginPath(); c.arc(x + (r() - 0.5) * 16, y + (r() - 0.5) * 14, 2.4 + r() * 3, 0, TAU); c.fill(); }
        c.fillStyle = 'rgba(40,30,20,0.35)'; c.fillRect(ix0 - 2, iy0 - 2, ix1 - ix0 + 4, iy1 - iy0 + 4);
      },
      clean(c) {
        for (const u of units) bayWater(c, u, false);
        if (opts.dirt) for (const u of units) drawBay(c, u, 1);
      },
      dirt(c) {
        // the dry bottom, a tide mark, dust and a few dead leaves
        const g = ramp(['#8d8778', '#9d9788', '#ada798']);
        field(c, ix0, iy0, ix1, iy1, 2, (x, y) => g(nz.fbm(x * 0.05, y * 0.05, 4)));
        c.fillStyle = 'rgba(40,30,20,0.22)'; c.fillRect(ix0, iy0, ix1 - ix0, 12); c.fillRect(ix0, iy0, 10, iy1 - iy0);
        c.strokeStyle = 'rgba(235,228,205,0.55)'; c.lineWidth = 2.4; c.strokeRect(ix0 + 8, iy0 + 8, ix1 - ix0 - 16, iy1 - iy0 - 16);
        for (let i = 0; i < 26; i++) {
          c.save(); c.translate(ix0 + 14 + r() * (ix1 - ix0 - 28), iy0 + 14 + r() * (iy1 - iy0 - 28)); c.rotate(r() * 6.28);
          c.fillStyle = U.pick(r, ['#b5762f', '#8c5a2b', '#9a8a3a']); c.beginPath(); c.ellipse(0, 0, 6, 3, 0, 0, TAU); c.fill();
          c.restore();
        }
        for (let i = 0; i < 160; i++) { c.fillStyle = 'rgba(90,80,62,0.28)'; c.fillRect(ix0 + r() * (ix1 - ix0), iy0 + r() * (iy1 - iy0), 1.6, 1.6); }
      },
      top(c) {
        // the iron straps across the trough
        for (let i = 1; i < bars; i++) {
          const y = iy0 + i * bay;
          c.fillStyle = '#3a3a40'; c.fillRect(ox0 + 6, y - 4, ox1 - ox0 - 12, 8);
          c.fillStyle = 'rgba(255,255,255,0.16)'; c.fillRect(ox0 + 6, y - 4, ox1 - ox0 - 12, 2);
          for (const x of [ox0 + 12, ox1 - 12]) dot(c, x, y, 2.4, '#6a6a72');
        }
        // the pump
        c.fillStyle = 'rgba(30,20,10,0.3)'; c.beginPath(); c.ellipse(142, 182, 30, 9, 0, 0, TAU); c.fill();
        c.fillStyle = '#3f5e4b'; rect(c, 124, 60, 34, 124, 5); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(129, 62, 5, 120);
        c.fillStyle = '#2f4739'; c.fillRect(118, 170, 46, 12); c.fillRect(120, 54, 42, 10);
        c.beginPath(); c.arc(141, 52, 10, Math.PI, 0); c.fill();
        c.strokeStyle = '#2f4739'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(124, 110); c.quadraticCurveTo(100, 112, 96, 136); c.stroke();
        c.strokeStyle = '#3f5e4b'; c.lineWidth = 6; c.beginPath(); c.moveTo(158, 70); c.quadraticCurveTo(196, 40, 214, 76); c.stroke();
        dot(c, 216, 80, 6, '#2f4739');
        // the pony at its half-door
        c.save(); c.beginPath(); c.rect(228, 16, 112, 136); c.clip();
        ponyNeck(c, px, py + 10, 152, 34, C, 4);
        c.restore();
        ponyHead(c, px, py, ps, C, { tilt: -0.1, halter: '#3d5a86' });
        c.fillStyle = '#4e7b5b'; c.fillRect(228, 116, 112, 36);
        c.fillStyle = 'rgba(0,0,0,0.15)'; for (let x = 248; x < 340; x += 20) c.fillRect(x, 116, 1.6, 36);
        c.fillStyle = '#4b4a52'; c.fillRect(228, 113, 112, 5);
      },
      liveTop(c, t) {
        if ((t + 0.8) % 5.1 < 0.16) ponyBlink(c, px, py, ps, C, -0.1);
        // glints on the water
        for (const u of units) {
          if (!u.done) continue;
          const life = (t * 0.4 + (u.seed % 100) / 100) % 1, s = 1.6 + Math.sin(life * Math.PI) * 1.4, x = u.x + 30 + (u.seed % 130), y = u.y + 12 + (u.seed % 41);
          c.globalAlpha = Math.sin(life * Math.PI) * 0.9;
          c.fillStyle = '#ffffff'; c.beginPath();
          c.moveTo(x, y - s * 2); c.lineTo(x + s * 0.45, y - s * 0.45); c.lineTo(x + s * 2, y); c.lineTo(x + s * 0.45, y + s * 0.45);
          c.lineTo(x, y + s * 2); c.lineTo(x - s * 0.45, y + s * 0.45); c.lineTo(x - s * 2, y); c.lineTo(x - s * 0.45, y - s * 0.45); c.closePath(); c.fill();
        }
        c.globalAlpha = 1;
      },
    };
  }

  // ------------------------------------------------------------- PONY WALK
  // The paddock from above: a track round the inside of the rails, gone to
  // long grass, a jump and an oak in the middle. Leading the pony round
  // treads it back into a track, with hoof prints all the way.
  function hoofprint(c, x, y, a, s, col) {
    c.save(); c.translate(x, y); c.rotate(a + Math.PI / 2);
    c.strokeStyle = col; c.lineWidth = s * 0.5; c.lineCap = 'round';
    c.beginPath(); c.arc(0, 0, s, Math.PI * 0.8 + Math.PI, Math.PI * 0.2 + Math.PI * 2 + Math.PI); c.stroke();
    c.restore();
  }
  // the pony on its lead, seen from above, walking along +x; the tool's reach sets its size
  function ponySprite(c, t) {
    const now = typeof performance !== 'undefined' ? performance.now() / 1000 : 0;
    const k = (t.r || 12) * 0.95 + 8, trot = Math.sin(now * 9), swish = Math.sin(now * 4.4) * 0.35, fur = '#a9683c', mane = '#2f2420';
    c.save(); c.lineCap = 'round';
    // the lead rope, up to the hand walking beside the head
    c.strokeStyle = '#c9474f'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(k * 1.5, 0); c.quadraticCurveTo(k * 1.1, -k * 0.5, k * 0.9, -k * 0.92); c.stroke();
    c.fillStyle = '#e9b46a'; c.beginPath(); c.arc(k * 0.9, -k * 0.92, 3.2, 0, TAU); c.fill();
    // legs, swinging as it walks
    c.fillStyle = U.shade(fur, -0.25);
    for (const [px, py, ph] of [[0.62, -0.33, 1], [0.62, 0.33, -1], [-0.72, -0.34, -1], [-0.72, 0.34, 1]]) { c.beginPath(); c.arc(k * (px + trot * ph * 0.1), k * py, k * 0.13, 0, TAU); c.fill(); }
    // tail, body, neck and head
    c.strokeStyle = mane; c.lineWidth = k * 0.2; c.beginPath(); c.moveTo(-k * 1.05, 0); c.quadraticCurveTo(-k * 1.4, swish * k * 0.5, -k * 1.7, swish * k); c.stroke();
    c.fillStyle = fur; c.beginPath(); c.ellipse(-k * 0.05, 0, k * 1.08, k * 0.43, 0, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(k * 0.7, -k * 0.26); c.quadraticCurveTo(k * 1.1, -k * 0.18, k * 1.3, -k * 0.13); c.lineTo(k * 1.3, k * 0.13); c.quadraticCurveTo(k * 1.1, k * 0.18, k * 0.7, k * 0.26); c.closePath(); c.fill();
    c.beginPath(); c.ellipse(k * 1.46, 0, k * 0.34, k * 0.2, 0, 0, TAU); c.fill();
    c.fillStyle = U.shade(fur, 0.2); c.beginPath(); c.ellipse(k * 1.68, 0, k * 0.14, k * 0.13, 0, 0, TAU); c.fill();
    c.strokeStyle = mane; c.lineWidth = k * 0.13; c.beginPath(); c.moveTo(k * 0.4, 0); c.lineTo(k * 1.26, 0); c.stroke();
    c.fillStyle = fur; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(k * 1.26, s * k * 0.17, k * 0.11, k * 0.06, s * 0.5, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,0.14)'; c.beginPath(); c.ellipse(-k * 0.2, -k * 0.14, k * 0.62, k * 0.13, 0, 0, TAU); c.fill();
    c.restore();
  }
  function ponyWalk(S) {
    const { r, nz, bleed } = S;
    const C = COATS[(r() * COATS.length) | 0];
    const cx = 180, cy = 308, ax = 122, ay = 204, half = 22;
    const onTrack = (spread = 1) => { const a = r() * TAU, d = (r() - 0.5) * 2 * half * spread; return [cx + Math.cos(a) * (ax + d), cy + Math.sin(a) * (ay + d)]; };
    const region = new Path2D();
    region.ellipse(cx, cy, ax + half, ay + half, 0, 0, TAU);
    region.moveTo(cx + ax - half, cy); region.ellipse(cx, cy, ax - half, ay - half, 0, 0, TAU);
    let last = null, acc = 0, side = 1;
    return {
      family: 'walk', particle: 'grass', region, depth: true,
      toolSprite: ponySprite,
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        mowedLawn(c, nz, x0, y0, x1, y1, false);
        grassGrain(c, r, x0, y0, x1, y1, 6, 0.2);
        // the white rails round the outside, from above: a double line and posts
        const rails = (c2, rx, ry) => { c2.beginPath(); c2.ellipse(cx, cy, rx, ry, 0, 0, TAU); c2.stroke(); };
        c.strokeStyle = 'rgba(30,50,20,0.28)'; c.lineWidth = 7; c.save(); c.translate(2, 4); rails(c, ax + half + 15, ay + half + 15); c.restore();
        c.strokeStyle = '#f4f0e6'; c.lineWidth = 3.6; rails(c, ax + half + 13, ay + half + 13); rails(c, ax + half + 18, ay + half + 18);
        for (let i = 0; i < 26; i++) { const a = (i / 26) * TAU, x = cx + Math.cos(a) * (ax + half + 15.5), y = cy + Math.sin(a) * (ay + half + 15.5); c.fillStyle = 'rgba(30,50,20,0.3)'; c.fillRect(x - 3, y, 8, 8); c.fillStyle = '#fbf8ef'; c.fillRect(x - 4.5, y - 4.5, 9, 9); }
        // hedges and trees beyond the rails
        for (const [x, y, s] of [[14, 30, 36], [340, 40, 40], [20, 580, 40], [344, 574, 36], [30, 96, 22], [330, 110, 22]]) { c.fillStyle = 'rgba(30,50,20,0.25)'; c.beginPath(); c.ellipse(x + 8, y + 8, s, s * 0.8, 0, 0, TAU); c.fill(); shrub(c, r, x, y, s, U.pick(r, ['#4f8a3c', '#5d9644', '#467e37'])); }
        // in the middle: an old oak with its shade, a jump, the other pony
        c.fillStyle = 'rgba(30,50,20,0.26)'; c.beginPath(); c.ellipse(198, 254, 54, 44, 0, 0, TAU); c.fill();
        shrub(c, r, 186, 240, 46, '#4f8a3c');
        c.fillStyle = 'rgba(30,50,20,0.25)'; c.fillRect(132, 378, 100, 10);
        c.fillStyle = '#f4f0e6'; c.fillRect(126, 366, 8, 16); c.fillRect(226, 366, 8, 16);
        for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#f7f3ea' : '#c9474f'; c.fillRect(134 + i * 23, 370, 23, 7); }
        tinyPony(c, 190, 330, 0.8, C, true);
        for (let i = 0; i < 12; i++) { const a = r() * TAU, d = r() * 0.8, x = cx + Math.cos(a) * (ax - half - 12) * d, y = cy + Math.sin(a) * (ay - half - 12) * d; flowerClump(c, r, x, y, U.pick(r, ['#ffffff', '#f2c230', '#e98aa2'])); }
        c.save(); c.strokeStyle = 'rgba(55,85,35,0.32)'; c.lineWidth = 10; c.stroke(region); c.restore();
      },
      clean(c) {
        const g = ramp(['#9c7c55', '#ad8d64', '#bf9f74', '#cdb084']);
        field(c, 0, 0, W, H, 3, (x, y) => g(nz.fbm(x * 0.04, y * 0.04, 4) * 0.8 + nz.n2(x * 0.3, y * 0.3) * 0.2));
        for (let i = 0; i < 400; i++) { const [x, y] = onTrack(0.95); dot(c, x, y, 0.8 + r() * 1.5, U.pick(r, ['#e2d3b8', '#d6c4a4', '#cbb994', '#efe3cc'])); }
        c.save(); c.strokeStyle = 'rgba(80,60,35,0.3)'; c.lineWidth = 5; c.stroke(region); c.restore();
      },
      dirt(c) {
        const base = ramp(['#a8925f', '#b9a26f', '#c7b280']);
        field(c, 0, 0, W, H, 3, (x, y) => base(nz.fbm(x * 0.03 + 5, y * 0.03, 3)));
        const cols = ['#4d8a34', '#62a042', '#7bb553', '#94c562', '#a8c463', '#6f9a3c'], items = [];
        for (let i = 0; i < 6800; i++) {
          const [x, y] = onTrack(1.1), l = 7 + r() * 10, lean = (r() - 0.5) * 8;
          items.push({ x0: x, y0: y, cx: x + lean * 0.3, cy: y - l * 0.6, x1: x + lean, y1: y - l, col: U.pick(r, cols), w: 1.2 + r() * 0.6 });
        }
        strokesByColour(c, items, 1.4);
        for (let i = 0; i < 150; i++) {
          const [x, y] = onTrack(1);
          if (r() < 0.65) { dot(c, x, y, 2.7, '#f2c230'); dot(c, x - 0.5, y - 0.5, 1.4, '#fbe27a'); }
          else {
            c.fillStyle = '#ffffff';
            for (let k = 0; k < 7; k++) { const a = (k / 7) * TAU; c.beginPath(); c.ellipse(x + Math.cos(a) * 2.2, y + Math.sin(a) * 2.2, 1.6, 0.9, a, 0, TAU); c.fill(); }
            dot(c, x, y, 1.3, '#f2c230');
          }
        }
      },
      // hoof prints along the way, a little to each side
      stamp(c, x, y, a, t, paint, isHelper) {
        if (isHelper) return;
        if (last) { const d = Math.hypot(x - last.x, y - last.y); acc = d > 40 ? 0 : acc + d; }
        last = { x, y };
        if (acc < 15) return;
        acc = 0; side = -side;
        const nx = -Math.sin(a), ny = Math.cos(a), o = side * 6;
        hoofprint(c, x + nx * o, y + ny * o, a, 5, 'rgba(92,62,32,0.6)');
      },
    };
  }

  SCENES.VARIANTS.push(
    { kind: 'door', test: (o) => o.what === 'half', make: halfDoor },
    { kind: 'fence', test: (o) => o.what === 'jumps', make: jumps },
    { kind: 'attic', test: (o) => o.where === 'tack', make: tackRoom },
    { kind: 'hutch', test: (o) => o.what === 'stable', make: stableBox },
    { kind: 'cat', test: (o) => o.what === 'pony', make: ponyGroom },
    { kind: 'bowls', test: (o) => o.what === 'trough', make: waterTrough },
    { kind: 'walk', test: (o) => o.what === 'pony', make: ponyWalk },
  );
})();
