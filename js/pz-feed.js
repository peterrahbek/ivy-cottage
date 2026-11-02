'use strict';
// Feeding time at Bluebell Rescue, a thinking job for the Puzzle Room. The
// feeding chart pinned on the kennel kitchen wall says who eats what and how
// many scoops; the bowls wait on the floor, each with a name tag and its
// animal sitting behind it, and the food stands on the bench in between.
// Take a scoop from a bag, read the chart, pour it into the right bowl. A
// full bowl and its animal tucks in; the chart fills in as you go.
//   node test/run.mjs puzzle js/pz-feed.js feeding --seeds 20
(() => {
  const INK = PZ.INK, INK2 = PZ.INK2, PAPER = PZ.PAPER, CREAM = PZ.CREAM;
  const dot = (c, x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill(); };
  const oval = (c, x, y, rx, ry, rot, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, 7); c.fill(); };
  function heart(c, x, y, s, col) {
    c.fillStyle = col; c.beginPath(); c.moveTo(x, y + s * 0.9);
    c.bezierCurveTo(x - s * 1.6, y - s * 0.1, x - s * 0.7, y - s * 1.3, x, y - s * 0.4);
    c.bezierCurveTo(x + s * 0.7, y - s * 1.3, x + s * 1.6, y - s * 0.1, x, y + s * 0.9);
    c.fill();
  }
  // a little paw print, toes pointing along a
  function paw(c, x, y, a, s, col) {
    c.save(); c.translate(x, y); c.rotate(a + Math.PI / 2); c.fillStyle = col;
    c.beginPath(); c.ellipse(0, s * 0.35, s * 0.62, s * 0.5, 0, 0, 7); c.fill();
    for (const [dx, dy] of [[-0.62, -0.25], [-0.22, -0.62], [0.22, -0.62], [0.62, -0.25]]) { c.beginPath(); c.ellipse(dx * s, dy * s, s * 0.22, s * 0.27, 0, 0, 7); c.fill(); }
    c.restore();
  }

  // ------------------------------------------------------------------ FOOD
  // Each food has a picture (on its bag and on the chart), a heap colour and
  // its own little bits, so shape always goes with colour.
  const FOODS = {
    kibble: { name: 'Kibble', heap: '#8a5a32', bits: ['#9c6332', '#b5793f', '#7a4a24'] },
    puppy: { name: 'Puppy', heap: '#d9a066', bits: ['#efcf98', '#e2b97a', '#f6dfb4'] },
    fish: { name: 'Fish', heap: '#d98b78', bits: ['#f2b8a2', '#e9a08a', '#fbd2c2'] },
    greens: { name: 'Greens', heap: '#7aa56a', bits: ['#e8893c', '#5f8f5a', '#9cc58a'] },
    grain: { name: 'Grain', heap: '#d9b24e', bits: ['#f2d88a', '#e8c86a', '#c99a3a'] },
  };
  const FOOD_IDS = Object.keys(FOODS);
  // the same scatter of bits for every heap, so nothing flickers
  const BITS = (() => { const r = U.rng(7), out = []; for (let i = 0; i < 26; i++) out.push({ u: (r() * 2 - 1) * 0.92, v: r(), rot: r() * 3, k: r(), col: (r() * 3) | 0 }); return out; })();

  function icon(c, food, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s);
    if (food === 'kibble') {
      oval(c, -5, 3, 5.4, 4.2, 0.3, '#9c6332'); oval(c, 5, 3.5, 5.4, 4.2, -0.4, '#b5793f'); oval(c, 0, -4, 5.4, 4.2, 0.1, '#7a4a24');
      for (const [hx, hy] of [[-6, 2], [4, 2.5], [-1, -5]]) dot(c, hx, hy, 1.2, 'rgba(255,230,190,0.5)');
    } else if (food === 'puppy') {
      // a bone-shaped biscuit
      c.fillStyle = '#d9a066'; PZ.rr(c, -7, -2.6, 14, 5.2, 2.6); c.fill();
      for (const [bx, by] of [[-7.5, -2.8], [-7.5, 2.8], [7.5, -2.8], [7.5, 2.8]]) dot(c, bx, by, 3.3, '#d9a066');
      c.fillStyle = 'rgba(255,240,210,0.5)'; PZ.rr(c, -5, -1.6, 10, 1.4, 0.7); c.fill();
    } else if (food === 'fish') {
      c.fillStyle = '#6f9cbc'; c.beginPath(); c.moveTo(5, 0); c.lineTo(11.5, -5.5); c.lineTo(11.5, 5.5); c.closePath(); c.fill();
      oval(c, -2, 0, 9, 5.6, 0, '#7fa8c4');
      oval(c, -2, 1.8, 6, 2.4, 0, '#b9d4e3');
      dot(c, -7, -1.2, 1.4, INK);
    } else if (food === 'greens') {
      oval(c, -2.5, -8, 2.2, 5, -0.5, '#6f9a6a'); oval(c, 1.5, -9, 2.2, 5.2, 0.3, '#5f8f5a');
      c.fillStyle = '#e8893c'; c.beginPath(); c.moveTo(-4.5, -4.5); c.lineTo(4.5, -4.5); c.lineTo(0.5, 11); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(150,70,20,0.45)'; c.lineWidth = 0.9;
      c.beginPath(); c.moveTo(-2.6, -0.5); c.lineTo(0.4, -0.5); c.moveTo(-1.4, 4); c.lineTo(1.4, 4); c.stroke();
    } else {
      // an ear of wheat
      c.strokeStyle = '#b98f5a'; c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 11); c.lineTo(0, -8); c.stroke();
      for (let k = 0; k < 4; k++) { oval(c, -2.8, -6 + k * 4.2, 2.3, 3.5, 0.55, '#e3b84e'); oval(c, 2.8, -6 + k * 4.2, 2.3, 3.5, -0.55, '#e3b84e'); }
      oval(c, 0, -10, 2.1, 3.4, 0, '#e8c86a');
    }
    c.restore();
  }
  function bit(c, food, x, y, p) {
    const col = FOODS[food].bits[p.col];
    if (food === 'kibble') oval(c, x, y, 2.8, 2.2, p.rot, col);
    else if (food === 'puppy') {
      const dx = Math.cos(p.rot) * 2.6, dy = Math.sin(p.rot) * 2.6;
      c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(x - dx, y - dy); c.lineTo(x + dx, y + dy); c.stroke();
      dot(c, x - dx, y - dy, 1.5, col); dot(c, x + dx, y + dy, 1.5, col);
    } else if (food === 'fish') oval(c, x, y, 3, 2, p.rot, col);
    else if (food === 'greens') { if (p.k < 0.5) oval(c, x, y, 3.8, 1.4, p.rot, '#e8893c'); else oval(c, x, y, 3, 1.9, p.rot, col); }
    else dot(c, x, y, 1.5, col);
  }
  // a domed heap of food at x, y (the middle of its rim), rise above the rim
  function heap(c, food, x, y, rx, ry, rise, n) {
    c.fillStyle = FOODS[food].heap;
    c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI); c.ellipse(x, y, rx, ry + rise, 0, Math.PI, Math.PI * 2); c.fill();
    if (food === 'puppy') c.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const p = BITS[i], w = Math.sqrt(1 - p.u * p.u);
      const top = y - (ry + rise) * w * 0.85, bot = y + ry * w * 0.45;
      bit(c, food, x + p.u * rx * 0.88, bot + (top - bot) * p.v, p);
    }
  }
  // a steel scoop with a heap of food in it; x, y is the middle of its mouth
  function scoop(c, food, x, y, rot, alpha) {
    c.save(); c.globalAlpha = alpha; c.translate(x, y); c.rotate(rot);
    c.fillStyle = '#8e979f'; PZ.rr(c, 16, -3, 30, 9, 4.5); c.fill();
    c.fillStyle = '#b9c1c8'; PZ.rr(c, 17, -2.5, 28, 4, 2); c.fill();
    oval(c, 0, 0, 22, 7, 0, '#7d868e');
    heap(c, food, 0, 0, 19.5, 5.5, 10, 12);
    c.fillStyle = '#c9d0d6';
    c.beginPath(); c.ellipse(0, 0, 22, 7, 0, Math.PI, 0, true);
    c.quadraticCurveTo(21, 24, 0, 25); c.quadraticCurveTo(-21, 24, -22, 0); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, 22, 7, 0, 2.2, 2.9); c.stroke();
    c.strokeStyle = 'rgba(70,80,90,0.25)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(0, 0, 22, 7, 0, 0, Math.PI); c.stroke();
    c.restore();
  }

  // --------------------------------------------------------------- SOURCES
  // The five foods on the bench, standing on its top at y = base.
  function source(c, food, x, b) {
    PZ.shadow(c, x + 2, b, 29, 5, 0.2);
    if (food === 'kibble') {
      // a paper sack with its top rolled down
      c.fillStyle = '#c9a46a'; c.beginPath(); c.moveTo(x - 26, b); c.lineTo(x - 23, 240); c.lineTo(x + 23, 240); c.lineTo(x + 26, b); c.closePath(); c.fill();
      c.fillStyle = 'rgba(90,60,30,0.14)'; c.fillRect(x + 12, 242, 12, b - 242);
      c.fillStyle = '#b08a52'; PZ.rr(c, x - 26, 230, 52, 13, 6); c.fill();
      c.fillStyle = PAPER; PZ.rr(c, x - 17, 251, 34, 34, 8); c.fill();
      icon(c, 'kibble', x, 268, 1.3);
    } else if (food === 'puppy') {
      // a soft rose bag with a crimped top and a paw print
      c.fillStyle = '#efb4ae'; c.beginPath(); c.moveTo(x - 23, b); c.lineTo(x - 21, 236); c.lineTo(x + 21, 236); c.lineTo(x + 23, b); c.closePath(); c.fill();
      c.fillStyle = '#e09a93'; c.beginPath(); c.moveTo(x - 21, 238); c.lineTo(x - 21, 228);
      for (let k = 0; k <= 7; k++) c.lineTo(x - 21 + k * 6, k % 2 ? 224 : 228);
      c.lineTo(x + 21, 238); c.closePath(); c.fill();
      dot(c, x, 264, 16, PAPER);
      icon(c, 'puppy', x, 264, 1.3);
      paw(c, x, 290, -Math.PI / 2, 5, 'rgba(255,250,241,0.85)');
    } else if (food === 'fish') {
      // an open tin, its lid peeled back
      oval(c, x + 9, 248, 19, 6, -0.55, '#aeb7bf');
      c.fillStyle = '#c9d0d6'; PZ.rr(c, x - 23, 256, 46, b - 256, 5); c.fill();
      c.fillStyle = '#a6d3d4'; c.fillRect(x - 23, 263, 46, 30);
      c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(x - 19, 263, 6, 30);
      icon(c, 'fish', x, 278, 1.35);
      oval(c, x, 256, 23, 6.5, 0, '#dfe4e8');
      oval(c, x, 256.5, 19, 4.6, 0, '#e9a08a');
      for (const [fx, fy] of [[-8, 256], [3, 255], [10, 257.5], [-2, 258]]) oval(c, x + fx, fy, 3, 1.6, fx * 0.3, '#f6c8b4');
    } else if (food === 'greens') {
      // a wicker basket of carrots and greens
      c.strokeStyle = '#a87a45'; c.lineWidth = 4.5; c.beginPath(); c.arc(x, 268, 23, Math.PI, 0); c.stroke();
      for (const [lx, a] of [[-14, -0.4], [-4, 0.1], [9, 0.5], [17, 0.2]]) oval(c, x + lx, 258, 4.5, 11, a, lx % 2 ? '#6f9a6a' : '#8fb87a');
      for (const [cx, a] of [[-9, -0.35], [3, 0.25], [13, -0.15]]) {
        c.save(); c.translate(x + cx, 262); c.rotate(a);
        oval(c, -2, -9, 2, 5, -0.4, '#5f8f5a'); oval(c, 2, -9, 2, 5, 0.4, '#5f8f5a');
        c.fillStyle = '#e8893c'; c.beginPath(); c.moveTo(-4.5, -5); c.lineTo(4.5, -5); c.lineTo(0, 12); c.closePath(); c.fill();
        c.restore();
      }
      c.fillStyle = '#c99a5e'; c.beginPath(); c.moveTo(x - 29, 270); c.lineTo(x + 29, 270); c.lineTo(x + 24, b); c.lineTo(x - 24, b); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(110,70,30,0.35)'; c.lineWidth = 1.2;
      for (let yy = 277; yy < b; yy += 7) { c.beginPath(); c.moveTo(x - 28, yy); c.lineTo(x + 28, yy); c.stroke(); }
      for (let xx = -24; xx <= 24; xx += 8) for (let yy = 270; yy < b; yy += 14) { c.beginPath(); c.moveTo(x + xx + ((yy / 7) % 2) * 4, yy + 1); c.lineTo(x + xx + ((yy / 7) % 2) * 4, yy + 6); c.stroke(); }
      c.fillStyle = '#b5844a'; PZ.rr(c, x - 31, 265, 62, 8, 4); c.fill();
    } else {
      // a cream sack of grain, tied at the neck, a few grains spilled
      c.fillStyle = '#efe3c6'; c.beginPath(); c.moveTo(x - 25, b); c.quadraticCurveTo(x - 32, 258, x - 13, 241); c.lineTo(x + 13, 241); c.quadraticCurveTo(x + 32, 258, x + 25, b); c.closePath(); c.fill();
      c.fillStyle = 'rgba(150,120,80,0.14)'; c.beginPath(); c.moveTo(x + 10, 244); c.quadraticCurveTo(x + 28, 262, x + 23, b); c.lineTo(x + 12, b); c.closePath(); c.fill();
      c.fillStyle = '#e6d6b2'; c.beginPath(); c.moveTo(x - 12, 239); c.lineTo(x - 19, 226); c.lineTo(x - 6, 232); c.lineTo(x, 223); c.lineTo(x + 6, 232); c.lineTo(x + 19, 226); c.lineTo(x + 12, 239); c.closePath(); c.fill();
      c.fillStyle = '#b98f5a'; PZ.rr(c, x - 14, 236, 28, 6, 3); c.fill();
      icon(c, 'grain', x, 272, 1.45);
      for (const [gx, gy] of [[-30, 298], [-26, 300], [28, 299], [32, 297]]) oval(c, x + gx, gy, 1.8, 1.2, gx, '#e3b84e');
    }
  }

  // --------------------------------------------------------------- ANIMALS
  // Seen from the front, sitting. Each body is drawn from its feet (0, 0)
  // upwards; the head is drawn on its own round its middle, so it can shake,
  // dip into the bowl, or sit in a little round frame on the chart.
  const COATS = {
    dog: [
      { fur: '#e2b36a', ear: '#c48c48', muzzle: '#f3dcb0' },
      { fur: '#f4efe6', ear: '#5b4a42', muzzle: '#fffaf1', patch: '#5b4a42' },
      { fur: '#a8754a', ear: '#7f5534', muzzle: '#d9b58c' },
      { fur: '#8d8f96', ear: '#5d5f66', muzzle: '#dcdde1' },
      { fur: '#5b4a42', ear: '#43362f', muzzle: '#c9a27a' },
    ],
    puppy: [
      { fur: '#f2d6a8', ear: '#d9a066', muzzle: '#fff4e2' },
      { fur: '#f4efe6', ear: '#c48c48', muzzle: '#fffaf1', patch: '#c48c48' },
      { fur: '#d7d8dc', ear: '#8d8f96', muzzle: '#fffaf1' },
    ],
    cat: [
      { fur: '#e6a061', stripe: '#c47a3c', muzzle: '#fbe8d2' },
      { fur: '#a2a2a8', stripe: '#74747c', muzzle: '#f0f0f0' },
      { fur: '#5b4a42', muzzle: '#f4efe6' },
    ],
    rabbit: [
      { fur: '#f4efe6', muzzle: '#fffaf1' },
      { fur: '#b98f5a', muzzle: '#efdcc0' },
      { fur: '#a6a3a0', muzzle: '#e9e6e2' },
    ],
    goat: [
      { fur: '#f4efe6', muzzle: '#e6dccd', beard: '#e3d8c8' },
      { fur: '#b98f5a', muzzle: '#efe2cc', beard: '#efe2cc' },
    ],
    hen: [
      { fur: '#c96a3a', wing: '#a9552c' },
      { fur: '#f6efe0', wing: '#e3d8c4' },
      { fur: '#8a5a3c', wing: '#6e472f', speck: true },
    ],
  };
  // where the head sits above the feet, and how far it dips to eat
  const POSE = { dog: [70, 40], puppy: [58, 34], cat: [62, 34], rabbit: [48, 24], goat: [74, 40], hen: [58, 30] };
  const COLLARS = ['#d98b63', '#8fbfe6', '#6f9a6a', '#bba9df'];

  function eye(c, x, y, rad, closed) {
    if (closed) { c.strokeStyle = INK; c.lineWidth = 1.8; c.lineCap = 'round'; c.beginPath(); c.arc(x, y + rad * 0.7, rad, Math.PI * 1.18, Math.PI * 1.82); c.stroke(); return; }
    dot(c, x, y, rad, INK); dot(c, x - rad * 0.3, y - rad * 0.35, rad * 0.36, PAPER);
  }
  function head(c, a, closed, chart) {
    const k = a.coat;
    if (a.kind === 'dog' || a.kind === 'puppy') {
      const E = a.kind === 'puppy' ? 1.25 : 1;
      oval(c, -17, -1, 8 * E, 15 * E, 0.35, k.ear); oval(c, 17, -1, 8 * E, 15 * E, -0.35, k.ear);
      dot(c, 0, 0, 20, k.fur);
      if (k.patch) oval(c, -7, -5, 8, 7.5, 0.2, k.patch);
      oval(c, 0, 8, 11.5, 8.5, 0, k.muzzle);
      eye(c, -7.5, -4, 2.8, closed); eye(c, 7.5, -4, 2.8, closed);
      oval(c, 0, 3.6, 4.2, 3, 0, INK);
      c.strokeStyle = INK2; c.lineWidth = 1.3; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, 6.5); c.lineTo(0, 9); c.moveTo(-4, 10.5); c.quadraticCurveTo(0, 13, 0, 9); c.quadraticCurveTo(0, 13, 4, 10.5); c.stroke();
    } else if (a.kind === 'cat') {
      for (const s of [-1, 1]) {
        c.fillStyle = k.fur; c.beginPath(); c.moveTo(s * 19, -6); c.lineTo(s * 15, -27); c.lineTo(s * 3, -15); c.closePath(); c.fill();
        c.fillStyle = '#efb4ae'; c.beginPath(); c.moveTo(s * 15.5, -9); c.lineTo(s * 14, -21.5); c.lineTo(s * 7, -14); c.closePath(); c.fill();
      }
      oval(c, 0, 0, 21, 18, 0, k.fur);
      if (k.stripe) { c.strokeStyle = k.stripe; c.lineWidth = 2.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(-5, -16); c.lineTo(-4, -10); c.moveTo(0, -17.5); c.lineTo(0, -11); c.moveTo(5, -16); c.lineTo(4, -10); c.stroke(); }
      dot(c, -4.5, 7, 5.2, k.muzzle); dot(c, 4.5, 7, 5.2, k.muzzle);
      if (!k.stripe) oval(c, 0, 12, 8, 5, 0, k.muzzle);
      eye(c, -8, -3, 2.8, closed); eye(c, 8, -3, 2.8, closed);
      c.fillStyle = '#e48f95'; c.beginPath(); c.moveTo(-2.6, 3); c.lineTo(2.6, 3); c.lineTo(0, 5.8); c.closePath(); c.fill();
      if (!chart) {
        c.strokeStyle = 'rgba(107,97,87,0.6)'; c.lineWidth = 0.9;
        for (const s of [-1, 1]) for (const d of [-2, 1.5]) { c.beginPath(); c.moveTo(s * 9, 7 + d * 0.6); c.lineTo(s * 22, 5 + d * 2); c.stroke(); }
      }
    } else if (a.kind === 'rabbit') {
      for (const s of [-1, 1]) { oval(c, s * 7, -25, 6, 17, s * 0.13, k.fur); oval(c, s * 7, -24, 2.8, 12, s * 0.13, '#efb4ae'); }
      oval(c, 0, 0, 18, 16, 0, k.fur);
      dot(c, -6, 6, 6.5, k.muzzle); dot(c, 6, 6, 6.5, k.muzzle);
      eye(c, -8, -2.5, 2.7, closed); eye(c, 8, -2.5, 2.7, closed);
      oval(c, 0, 2.8, 2.6, 1.9, 0, '#e48f95');
      c.fillStyle = PAPER; PZ.rr(c, -2.6, 9, 5.2, 4.6, 1.2); c.fill();
    } else if (a.kind === 'goat') {
      c.strokeStyle = '#b8a688'; c.lineWidth = 4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-6, -16); c.quadraticCurveTo(-9, -27, -15, -28); c.moveTo(6, -16); c.quadraticCurveTo(9, -27, 15, -28); c.stroke();
      oval(c, -19, -5, 11, 4.8, 0.35, k.fur); oval(c, 19, -5, 11, 4.8, -0.35, k.fur);
      oval(c, -19, -5, 6.5, 2.2, 0.35, '#efb4ae'); oval(c, 19, -5, 6.5, 2.2, -0.35, '#efb4ae');
      oval(c, 0, 0, 15, 21, 0, k.fur);
      c.fillStyle = k.beard; c.beginPath(); c.moveTo(-5, 18); c.lineTo(0, 31); c.lineTo(5, 18); c.closePath(); c.fill();
      oval(c, 0, 12, 11, 9, 0, k.muzzle);
      oval(c, -3.4, 11, 1.4, 2, 0.3, INK2); oval(c, 3.4, 11, 1.4, 2, -0.3, INK2);
      if (closed) { eye(c, -8, -6, 3, true); eye(c, 8, -6, 3, true); }
      else for (const s of [-1, 1]) { dot(c, s * 8, -6, 3.4, '#e8c86a'); c.fillStyle = INK; PZ.rr(c, s * 8 - 2.6, -6.9, 5.2, 1.8, 0.9); c.fill(); }
    } else {
      dot(c, -4, -13, 4, '#d9705f'); dot(c, 0.5, -15, 4.6, '#d9705f'); dot(c, 5, -12.5, 3.8, '#d9705f');
      dot(c, 0, 0, 12.5, k.fur);
      oval(c, 0, 9.5, 2.6, 4.2, 0, '#d9705f');
      c.fillStyle = '#e8a94a'; c.beginPath(); c.moveTo(-3.8, 1); c.lineTo(3.8, 1); c.lineTo(0, 7.5); c.closePath(); c.fill();
      eye(c, -5.5, -3, 2.1, closed); eye(c, 5.5, -3, 2.1, closed);
    }
  }
  function body(c, a, wag) {
    const k = a.coat;
    if (a.kind === 'dog' || a.kind === 'puppy') {
      const s = a.kind === 'puppy' ? 0.8 : 1;
      c.save(); c.scale(s, s);
      c.strokeStyle = k.ear; c.lineWidth = 7; c.lineCap = 'round';
      c.beginPath(); c.moveTo(14, -12); c.quadraticCurveTo(34, -16, 31 + wag * 7, -40); c.stroke();
      oval(c, 0, -28, 24, 30, 0, k.fur);
      oval(c, 0, -33, 12, 19, 0, k.muzzle);
      c.fillStyle = U.shade(k.fur, -0.07); PZ.rr(c, -16, -30, 11, 30, 5.5); c.fill(); PZ.rr(c, 5, -30, 11, 30, 5.5); c.fill();
      oval(c, -10.5, -2, 7, 4, 0, k.muzzle); oval(c, 10.5, -2, 7, 4, 0, k.muzzle);
      if (a.eatK < 0.3) { c.fillStyle = a.collar; PZ.rr(c, -14, -60, 28, 6, 3); c.fill(); dot(c, 0, -52, 3.4, '#f2d88a'); } // the collar dips with the head
      c.restore();
    } else if (a.kind === 'cat') {
      c.strokeStyle = k.fur; c.lineWidth = 6.5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(16, -8); c.quadraticCurveTo(34, -18, 27 + wag * 5, -44); c.stroke();
      oval(c, 0, -26, 21, 27, 0, k.fur);
      oval(c, 0, -30, 10, 17, 0, k.muzzle);
      if (k.stripe) { c.strokeStyle = k.stripe; c.lineWidth = 2.4; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(s * 20, -36 + i * 9); c.lineTo(s * 13, -33 + i * 9); c.stroke(); } }
      oval(c, -7, -3, 6.5, 4, 0, k.muzzle); oval(c, 7, -3, 6.5, 4, 0, k.muzzle);
    } else if (a.kind === 'rabbit') {
      dot(c, 23 + wag * 2, -9, 6.5, PAPER);
      oval(c, 0, -22, 25, 22, 0, k.fur);
      oval(c, 0, -19, 12, 14, 0, k.muzzle);
      oval(c, -13, -3, 9, 4.5, 0, k.muzzle); oval(c, 13, -3, 9, 4.5, 0, k.muzzle);
    } else if (a.kind === 'goat') {
      c.fillStyle = U.shade(k.fur, -0.08); PZ.rr(c, -16, -24, 9, 24, 4.5); c.fill(); PZ.rr(c, 7, -24, 9, 24, 4.5); c.fill();
      c.fillStyle = k.fur; PZ.rr(c, -21, -62, 42, 46, 18); c.fill();
      oval(c, 0, -40, 11, 16, 0, k.muzzle);
      if (a.eatK < 0.3) { dot(c, 0, -57, 4.2, '#f2d88a'); dot(c, 0, -55, 1.3, '#c99a3a'); }
    } else {
      oval(c, 16, -48, 6, 14, 0.5 + wag * 0.08, k.wing); oval(c, 21, -40, 6, 13, 0.95 + wag * 0.08, k.wing);
      oval(c, 0, -28, 25, 27, 0, k.fur);
      // the wings lift out happily while she eats, so they never frame the head like ears
      const e = a.eatK;
      oval(c, -19 - 8 * e, -27 - 2 * e, 9, 16, 0.25 - 1.15 * e, k.wing); oval(c, 19 + 8 * e, -27 - 2 * e, 9, 16, -0.25 + 1.15 * e, k.wing);
      if (k.speck) for (const [sx, sy] of [[-6, -36], [4, -30], [-2, -22], [7, -40], [-9, -26], [1, -14]]) dot(c, sx, sy, 1.6, '#f6efe0');
    }
  }
  // the whole animal behind its bowl: shaking its head, bouncing, eating
  function animal(c, a, x, y, t) {
    const [hp, dip] = POSE[a.kind], eat = a.eatK;
    const sh = a.shake > 0 ? Math.sin(a.shake * 26) * 0.26 * Math.min(1, a.shake / 0.3) : 0;
    const bounce = a.content > 0 ? -Math.abs(Math.sin(a.content * 9)) * 5 * a.content : 0;
    const happy = eat > 0.5 || a.content > 0;
    const wag = happy ? Math.sin(t * 11 + a.phase) : Math.sin(t * 1.3 + a.phase) * 0.3;
    const blink = ((t * 0.23 + a.phase) % 1) < 0.03;
    c.save(); c.translate(x, y + bounce);
    PZ.shadow(c, 0, 0, 26, 6, 0.16);
    body(c, a, wag);
    c.translate(0, -hp + eat * dip + (eat > 0.9 ? Math.sin(t * 8 + a.phase) * 1.6 : 0) + Math.sin(t * 1.7 + a.phase) * 0.6);
    c.rotate(sh);
    head(c, a, happy || blink, false);
    c.restore();
  }
  // a head in a little round frame on the chart
  function portrait(c, a, x, y) {
    const fit = { dog: [0.56, 3], puppy: [0.5, 3], cat: [0.58, 3], rabbit: [0.5, 8], goat: [0.5, 2], hen: [0.82, 3] }[a.kind];
    c.save();
    dot(c, x, y, 17, '#e4efe9');
    c.beginPath(); c.arc(x, y, 17, 0, 7); c.clip();
    c.translate(x, y + fit[1]); c.scale(fit[0], fit[0]);
    head(c, a, false, true);
    c.restore();
    c.strokeStyle = 'rgba(111,154,106,0.55)'; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y, 17, 0, 7); c.stroke();
  }

  // ------------------------------------------------------------------ BOARD
  const NAMES = ['Bramble', 'Pip', 'Mittens', 'Clover', 'Biscuit', 'Willow', 'Pepper', 'Hazel', 'Bean', 'Maple'];
  const BOWL_COLS = ['#d98b63', '#a6d3d4', '#6f9a6a', '#f2d88a', '#bba9df', '#efb4ae'];
  const BASE = 300;                  // the bench top the food stands on
  const SRC_Y = 266;                 // the middle of a bag, where a scoop starts
  const BOWL_Y = 474;                // the middle of a bowl's rim
  const FEET_Y = 464;                // where the animals sit, just behind their bowls
  const ROW_Y = 70, ROW_H = 38;      // the chart's rows

  function feeding(S) {
    const r = S.r;
    // four different foods, an animal for each (a goat eats greens or grain)
    const foods = PZ.shuffle(r, FOOD_IDS.slice()).slice(0, 4);
    const names = PZ.shuffle(r, NAMES.slice());
    let goat = false;
    const animals = foods.map((food, i) => {
      let kind = { kibble: 'dog', puppy: 'puppy', fish: 'cat', greens: 'rabbit', grain: 'hen' }[food];
      if ((food === 'greens' || food === 'grain') && !goat && r() < 0.4) { kind = 'goat'; goat = true; }
      return { kind, food, name: names[i], coat: U.pick(r, COATS[kind]), collar: U.pick(r, COLLARS), phase: r(),
        need: 1, fill: 0, shown: 0, eatK: 0, shake: 0, content: 0 };
    });
    // 1 to 3 scoops each, 4 to 9 in all
    do { for (const a of animals) a.need = 1 + ((r() * 3) | 0); } while (animals.reduce((s, a) => s + a.need, 0) > 9);
    // the chart and the bowls never list them in the same order
    const chart = PZ.shuffle(r, animals.slice());
    let floor;
    do { floor = PZ.shuffle(r, animals.slice()); } while (floor.every((a, i) => a === chart[i]));
    const bowlCols = PZ.shuffle(r, BOWL_COLS.slice());
    floor.forEach((a, i) => { a.x = 50 + i * 86.7; a.bowl = bowlCols[i]; });
    chart.forEach((a, i) => { a.row = ROW_Y + i * ROW_H; });
    const sources = PZ.shuffle(r, FOOD_IDS.slice()).map((food, i) => ({ food, x: 42 + i * 69 }));
    const srcFor = (food) => sources.find((s) => s.food === food);
    const steps = animals.reduce((s, a) => s + a.need, 0);

    let held = null, hint = null, hintT = 0, fx = null;
    const flights = [], pours = [], hearts = [];

    function settle(a, n) { a.fill = a.shown = Math.max(0, Math.min(a.need, n | 0)); a.eatK = a.fill >= a.need ? 1 : 0; }
    function sendBack(food, x, y) { const s = srcFor(food); flights.push({ food, x, y, tx: s.x, ty: SRC_Y }); }
    const bowlAt = (x, y) => floor.find((a) => Math.abs(a.x - x) < 43 && y > 330 && y < 560);

    // a bowl seen from a little above, with its food heaped inside
    function bowl(c, a) {
      const x = a.x, y = BOWL_Y, col = a.bowl;
      oval(c, x, y, 37, 12.5, 0, U.shade(col, 0.25));
      oval(c, x, y + 1, 31.5, 9.5, 0, U.shade(col, -0.18));
      oval(c, x, y + 2.5, 29, 7, 0, U.shade(CREAM, -0.04));
      if (a.shown > 0.02) heap(c, a.food, x, y + 1.5, 28.5 * Math.min(1, 0.7 + a.shown / a.need * 0.3), 7.5, 2 + 11 * (a.shown / a.need), Math.round(6 + 18 * a.shown / a.need));
      c.fillStyle = col; c.beginPath(); c.ellipse(x, y, 37, 12.5, 0, Math.PI, 0, true);
      c.lineTo(x + 30, y + 21); c.quadraticCurveTo(x, y + 29, x - 30, y + 21); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.22)'; c.beginPath(); c.ellipse(x - 18, y + 14, 6, 3, -0.3, 0, 7); c.fill();
      c.strokeStyle = U.shade(col, 0.45); c.lineWidth = 2; c.beginPath(); c.ellipse(x, y, 36, 12, 0, 0.2, Math.PI - 0.2); c.stroke();
      paw(c, x + 14, y + 17, -Math.PI / 2, 4, 'rgba(255,250,241,0.7)');
    }

    const sc = {
      puzzle: true, indoor: true, steps,
      crop: { x: 0, y: 206, w: 360, h: 360 }, // the bench, the bowls and everyone eating
      decor(c) {
        const { x0, y0, x1, y1 } = S.bleed, r = U.rng(11); // the same straw every time it is painted
        // the kitchen wall, a duck-egg tiled splashback behind the bench
        c.fillStyle = '#efe6d3'; c.fillRect(x0, y0, x1 - x0, 300 - y0);
        c.fillStyle = 'rgba(185,143,90,0.08)'; for (let x = Math.floor(x0 / 24) * 24; x < x1; x += 24) c.fillRect(x, y0, 9, 212 - y0);
        c.fillStyle = '#d3e7e3'; c.fillRect(x0, 212, x1 - x0, 88);
        c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 1.5;
        for (let y = 212; y < 300; y += 22) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); }
        for (let row = 0; row < 4; row++) for (let x = Math.floor(x0 / 30) * 30 + (row % 2) * 15; x < x1; x += 30) { c.beginPath(); c.moveTo(x, 212 + row * 22); c.lineTo(x, 234 + row * 22); c.stroke(); }
        // the floor: warm tiles, a few paw prints and bits of straw
        c.fillStyle = '#e8d8bc'; c.fillRect(x0, 300, x1 - x0, y1 - 300);
        c.strokeStyle = 'rgba(150,120,90,0.22)'; c.lineWidth = 1.5;
        for (let x = Math.floor(x0 / 45) * 45; x < x1; x += 45) { c.beginPath(); c.moveTo(x, 320); c.lineTo(x, y1); c.stroke(); }
        for (let y = 365; y < y1; y += 45) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); }
        for (let i = 0; i < 5; i++) paw(c, 40 + i * 62 + r() * 20, 551 + (i % 2) * 4, -0.3 + r() * 0.6, 5, 'rgba(150,120,90,0.16)');
        c.strokeStyle = 'rgba(214,180,100,0.55)'; c.lineWidth = 1.3; c.lineCap = 'round';
        for (let i = 0; i < 14; i++) { const x = r() * 360, y = 336 + r() * 250, a = r() * 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9); c.stroke(); }
        // the feeding chart, pinned to the wall
        c.fillStyle = 'rgba(60,40,20,0.14)'; PZ.rr(c, 23, 17, 320, 190, 10); c.fill();
        c.fillStyle = PAPER; PZ.rr(c, 20, 13, 320, 190, 10); c.fill();
        dot(c, 40, 22, 4.5, '#d98b63'); dot(c, 320, 22, 4.5, '#8fbfe6');
        dot(c, 39, 21, 1.5, 'rgba(255,255,255,0.7)'); dot(c, 319, 21, 1.5, 'rgba(255,255,255,0.7)');
        PZ.text(c, 'Feeding chart', 180, 34, { size: 17 });
        PZ.text(c, 'scoops', 275, 46, { size: 13, color: INK2, weight: 700 });
        for (const a of chart) {
          const y = a.row + 4;
          c.strokeStyle = 'rgba(107,97,87,0.18)'; c.lineWidth = 1; c.setLineDash([3, 4]);
          c.beginPath(); c.moveTo(32, y - ROW_H / 2); c.lineTo(328, y - ROW_H / 2); c.stroke(); c.setLineDash([]);
          portrait(c, a, 50, y);
          PZ.text(c, a.name, 76, y, { size: 16, align: 'left', maxW: 100 });
          dot(c, 196, y, 15, CREAM);
          icon(c, a.food, 196, y, 1.05);
          for (let j = 0; j < a.need; j++) { dot(c, 251 + j * 24, y, 8.5, '#fbeed3'); c.strokeStyle = '#d98b63'; c.lineWidth = 2; c.beginPath(); c.arc(251 + j * 24, y, 8, 0, 7); c.stroke(); }
        }
        // the bench, the food on it and a name on its front edge for each
        c.fillStyle = 'rgba(40,30,20,0.18)'; c.fillRect(x0, 320, x1 - x0, 7);
        c.fillStyle = '#cfa874'; c.fillRect(x0, 293, x1 - x0, 8);
        c.fillStyle = '#a77d4b'; c.fillRect(x0, 301, x1 - x0, 20);
        c.fillStyle = 'rgba(255,240,210,0.3)'; c.fillRect(x0, 293, x1 - x0, 1.5);
        for (const s of sources) { source(c, s.food, s.x, BASE); PZ.text(c, FOODS[s.food].name, s.x, 311.5, { size: 13, color: PAPER }); }
        // a name tag on the floor in front of every bowl
        for (const a of floor) {
          PZ.shadow(c, a.x, BOWL_Y + 24, 40, 8, 0.2);
          c.fillStyle = 'rgba(60,40,20,0.14)'; PZ.rr(c, a.x - 37, 514, 76, 28, 9); c.fill();
          c.fillStyle = PAPER; PZ.rr(c, a.x - 39, 511, 78, 28, 9); c.fill();
          c.strokeStyle = U.shade(a.bowl, -0.1); c.lineWidth = 2; PZ.rr(c, a.x - 39, 511, 78, 28, 9); c.stroke();
          PZ.text(c, a.name, a.x, 525.5, { size: 15, maxW: 70 });
        }
        PZ.text(c, 'Feed everyone just as the chart says', 180, 572, { size: 13, color: INK2, weight: 700, maxW: 330 });
      },
      draw(c, t, still) {
        // the chart fills in as scoops go in, and a tick for every full bowl
        for (const a of chart) {
          const y = a.row + 4;
          for (let j = 0; j < a.fill; j++) dot(c, 251 + j * 24, y, 6.5, '#d98b63');
          if (a.fill >= a.need) {
            c.strokeStyle = '#6f9a6a'; c.lineWidth = 3.5; c.lineCap = 'round'; c.lineJoin = 'round';
            c.beginPath(); c.moveTo(318, y); c.lineTo(323, y + 5); c.lineTo(332, y - 6); c.stroke();
          }
        }
        // a hint rings the chart row, the food and the bowl for one scoop
        if (hint && hintT > 0 && !still) {
          const s = srcFor(hint.food);
          c.strokeStyle = `rgba(255,214,90,${0.6 + 0.3 * Math.sin(t * 5)})`; c.lineWidth = 3;
          PZ.rr(c, 27, hint.row + 4 - ROW_H / 2 + 1, 306, ROW_H - 2, 9); c.stroke();
          PZ.glow(c, s.x, SRC_Y + 4, 36, t); PZ.glow(c, hint.x, BOWL_Y, 42, t);
        }
        for (const a of floor) { animal(c, a, a.x, FEET_Y, t); bowl(c, a); }
        // a little heart now and then over everyone who has eaten
        for (const a of floor) {
          if (a.eatK < 0.9) continue;
          const life = (t * 0.4 + a.phase) % 1;
          c.globalAlpha = Math.sin(life * Math.PI) * 0.9;
          heart(c, a.x + 18, FEET_Y - POSE[a.kind][0] - 12 - life * 26, 4.5 + life * 2, '#efb4ae');
        }
        c.globalAlpha = 1;
        if (still) return;
        for (const h of hearts) { c.globalAlpha = Math.max(0, 1 - h.age / 1.4); heart(c, h.x, h.y - h.age * 34, 7 + h.age * 3, '#e48f95'); }
        c.globalAlpha = 1;
        for (const p of pours) {
          const k = Math.min(1, p.age / 0.4);
          for (let i = 0; i < 5; i++) { const f = (k * 1.6 + i * 0.2) % 1; bit(c, p.food, p.x - 14 + i * 3, p.y + 6 + f * 22, BITS[i]); }
          scoop(c, p.food, p.x, p.y, -1.1 * Math.min(1, k * 2), 1 - Math.max(0, k - 0.7) / 0.3);
        }
        for (const f of flights) scoop(c, f.food, f.x, f.y, 0, Math.min(1, PZ.dist(f.x, f.y, f.tx, f.ty) / 30));
        if (held) { PZ.shadow(c, held.x + 6, held.y + 40, 24, 5, 0.12); scoop(c, held.food, held.x, held.y, 0, 1); }
      },
      step(dt) {
        hintT -= dt;
        for (const a of animals) {
          a.shown = PZ.approach(a.shown, a.fill, dt, 7);
          a.eatK = PZ.approach(a.eatK, a.fill >= a.need && a.shown > a.need - 0.3 ? 1 : 0, dt, 4);
          a.shake = Math.max(0, a.shake - dt); a.content = Math.max(0, a.content - dt);
        }
        if (held) { held.x = PZ.approach(held.x, held.tx, dt, 22); held.y = PZ.approach(held.y, held.ty, dt, 22); }
        for (let i = flights.length - 1; i >= 0; i--) {
          const f = flights[i]; f.x = PZ.approach(f.x, f.tx, dt, 11); f.y = PZ.approach(f.y, f.ty, dt, 11);
          if (PZ.dist(f.x, f.y, f.tx, f.ty) < 2) flights.splice(i, 1);
        }
        for (let i = pours.length - 1; i >= 0; i--) if ((pours[i].age += dt) > 0.45) pours.splice(i, 1);
        for (let i = hearts.length - 1; i >= 0; i--) if ((hearts[i].age += dt) > 1.4) hearts.splice(i, 1);
      },
      down(x, y) {
        if (held) return;
        const s = sources.find((q) => Math.abs(q.x - x) < 34 && y > 220 && y < 324);
        if (!s) return;
        held = { food: s.food, x: s.x, y: SRC_Y, tx: x, ty: y - PZ.LIFT };
        fx.sound('pick');
      },
      move(x, y) { if (held) { held.tx = x; held.ty = y - PZ.LIFT; } },
      up(x, y) {
        if (!held) return;
        const food = held.food, dx = x, dy = y - PZ.LIFT; // judged where it is drawn
        held = null;
        const a = bowlAt(dx, dy);
        if (a && a.food === food && a.fill < a.need) {
          a.fill++;
          pours.push({ food, x: a.x + 6, y: BOWL_Y - 34, age: 0 });
          fx.sound('pour'); fx.good(a.x, BOWL_Y - 8);
          if (a.fill >= a.need) { fx.sound('happy'); hearts.push({ x: a.x + 20, y: FEET_Y - POSE[a.kind][0] - 20, age: 0 }); }
          if (hint === a && a.fill >= a.need) hintT = 0;
          return;
        }
        if (a && a.fill >= a.need) a.content = 0.7; // already full: a contented little bounce
        else if (a) a.shake = 0.7;                  // not its food: a gentle shake of the head
        sendBack(food, dx, dy);
        fx.sound(a || dy >= 330 ? 'nope' : 'drop'); // put back on the bench is not a wrong move
      },
      cancel() { if (held) { sendBack(held.food, held.x, held.y); held = null; } },
      progress: () => animals.reduce((s, a) => s + a.fill, 0) / steps,
      solved: () => animals.every((a) => a.fill >= a.need),
      hint() { hint = chart.find((a) => a.fill < a.need) || null; hintT = 3; },
      save: () => ({ fill: floor.map((a) => a.fill) }),
      load(s) { if (s && Array.isArray(s.fill)) s.fill.forEach((n, i) => { if (floor[i]) settle(floor[i], n); }); },
      solveAll() { for (const a of animals) settle(a, a.need); },
      // finger positions: pick up at the bag, let go PZ.LIFT below the bowl
      debugPlan() {
        const plan = [];
        for (const a of floor) for (let k = a.fill; k < a.need; k++) { const s = srcFor(a.food); plan.push({ drag: [s.x, SRC_Y, a.x, BOWL_Y + PZ.LIFT] }); }
        return plan;
      },
    };
    Object.defineProperty(sc, 'fx', { get: () => fx, set: (v) => { fx = v; } });
    return sc;
  }
  Object.assign(SCENES.KINDS, { feeding });
})();
