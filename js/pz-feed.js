'use strict';
// Feeding time at Bluebell Rescue, a thinking job for the Puzzle Room. The
// feeding chart pinned on the kennel kitchen wall says who eats what and how
// many scoops; the bowls wait on the floor, each with a name tag and its
// animal sitting behind it, and the food stands on the bench in between.
// Take a scoop from a bag, read the chart, pour it into the right bowl. A
// full bowl and its animal tucks in; the chart fills in as you go.
// Ice creams for the queue is the same job at the lido kiosk, opts.what 'ices':
// the order board on the wall says who wants which flavour and how many scoops.
// Drag a scoop from a tub onto the right cone. A finished ice and its guest
// smiles and takes a lick; the board ticks itself off as you go.
//   node test/run.mjs puzzle js/pz-feed.js feeding --seeds 20 [--opts '{"what":"ices"}']
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
    if (S.opts.what === 'ices') return ices(S);
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
  // ------------------------------------------------------------------- ICES
  // Each flavour has a colour, a name and its own mark on the tub and on every
  // scoop: specks, a strawberry, a mint leaf, ridges, a slice of lemon.
  const FLAVOURS = {
    vanilla: { name: 'Vanilla', base: '#f9eecf', lite: '#fffaea', deep: '#e6d09c' },
    strawberry: { name: 'Strawberry', base: '#f6b3bb', lite: '#fddcdf', deep: '#e58a99' },
    mint: { name: 'Mint', base: '#b9e6cf', lite: '#e3f7ec', deep: '#86c8a7' },
    chocolate: { name: 'Chocolate', base: '#8f5f41', lite: '#b08263', deep: '#694330' },
    lemon: { name: 'Lemon', base: '#f8df68', lite: '#fdf2b4', deep: '#e3bb38' },
  };
  const FLAVOUR_IDS = Object.keys(FLAVOURS);

  // the mark of a flavour, drawn for a scoop of radius 20 round 0, 0
  function mark(c, id) {
    if (id === 'vanilla') {
      for (const [x, y, s] of [[-10, -9, 1.5], [-2, -13, 1.2], [7, -10, 1.7], [13, -3, 1.3], [-14, -1, 1.2], [-5, -3, 1.8], [3, -1, 1.3], [10, 5, 1.6], [-9, 7, 1.5], [1, 8, 1.3]]) dot(c, x, y, s, '#8a6238');
    } else if (id === 'strawberry') {
      c.fillStyle = '#dc4a44'; c.beginPath(); c.moveTo(0, 13); c.bezierCurveTo(-12, 5, -14, -6, -6.5, -8); c.quadraticCurveTo(0, -9.8, 6.5, -8); c.bezierCurveTo(14, -6, 12, 5, 0, 13); c.fill();
      for (const [x, y] of [[-6, -3], [0, -4], [6, -3], [-3.4, 2], [3.4, 2], [-6.6, 2.4], [6.6, 2.4], [0, 7], [-3, 6.6], [3, 6.6]]) oval(c, x, y, 0.8, 1.2, 0, '#fbdc8c');
      for (const a of [-1.1, -0.45, 0.25, 0.9]) oval(c, Math.sin(a) * 6, -9 - Math.cos(a) * 0.8, 4.4, 1.9, a, '#5f9a5a');
      c.strokeStyle = '#4f8a4c'; c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -10); c.lineTo(1, -13.6); c.stroke();
    } else if (id === 'mint') {
      c.save(); c.translate(0, -1); c.rotate(-0.55);
      c.fillStyle = '#3f9a6c'; c.beginPath(); c.moveTo(0, -14); c.bezierCurveTo(11, -8, 11, 5, 0, 13); c.bezierCurveTo(-11, 5, -11, -8, 0, -14); c.fill();
      c.strokeStyle = '#c9efd9'; c.lineWidth = 1.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -10); c.lineTo(0, 10);
      for (const y of [-5, 0, 5]) { c.moveTo(0, y + 2.5); c.lineTo(-5.6, y - 1.5); c.moveTo(0, y + 2.5); c.lineTo(5.6, y - 1.5); }
      c.stroke();
      c.restore();
    } else if (id === 'chocolate') {
      c.lineCap = 'round';
      for (const y of [-11, -3.5, 4, 11.5]) {
        c.strokeStyle = '#573424'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(-19, y + 4); c.quadraticCurveTo(0, y - 5, 19, y + 4); c.stroke();
        c.strokeStyle = 'rgba(214,170,140,0.7)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-17, y + 1.8); c.quadraticCurveTo(0, y - 7, 17, y + 1.8); c.stroke();
      }
    } else {
      dot(c, 0, -1, 12, '#d99a1e'); dot(c, 0, -1, 10.4, '#fff7d6');
      c.fillStyle = '#f6cf3e';
      for (let k = 0; k < 7; k++) {
        const a0 = (k / 7) * Math.PI * 2 + 0.09, a1 = ((k + 1) / 7) * Math.PI * 2 - 0.09, m = (a0 + a1) / 2;
        c.beginPath(); c.moveTo(Math.cos(m) * 1.6, -1 + Math.sin(m) * 1.6); c.arc(0, -1, 9.2, a0, a1); c.closePath(); c.fill();
      }
    }
  }
  // the outline of a scoop at radius 20: a dome on a ruffled skirt
  const SCOOP = (() => {
    const p = new Path2D(), y = (q) => 6 + 10 * Math.sin(Math.PI * q);
    p.arc(0, 0, 20, Math.PI - 0.3, 0.3);
    for (let i = 1; i <= 6; i++) p.quadraticCurveTo(19 - (38 * (i - 0.5)) / 6, y((i - 0.5) / 6) + 6, 19 - (38 * i) / 6, y(i / 6));
    p.closePath();
    return p;
  })();
  function scoopBall(c, id, x, y, rad, alpha = 1) {
    const F = FLAVOURS[id], k = rad / 20;
    c.save(); c.globalAlpha = alpha; c.translate(x, y); c.scale(k, k);
    c.fillStyle = F.base; c.fill(SCOOP);
    c.save(); c.clip(SCOOP);
    oval(c, 5, 16, 25, 10, 0, F.deep);
    oval(c, -7, -11, 10, 6, -0.5, F.lite);
    mark(c, id);
    c.restore();
    c.strokeStyle = F.deep; c.lineWidth = 1.1; c.stroke(SCOOP);
    c.restore();
  }
  // a waffle cone, its rim at x, y and its tip below
  function waffle(c, x, y) {
    const w = 18, h = 58;
    c.save();
    c.beginPath(); c.moveTo(x - w, y); c.lineTo(x - 2, y + h - 2); c.quadraticCurveTo(x, y + h + 1, x + 2, y + h - 2); c.lineTo(x + w, y); c.closePath();
    c.fillStyle = '#e6b973'; c.fill(); c.clip();
    c.strokeStyle = '#c4904a'; c.lineWidth = 1.3; c.beginPath();
    for (let k = -4; k <= 4; k++) { const q = k * 12; c.moveTo(x + q - 34, y - 4); c.lineTo(x + q + 34, y + 60); c.moveTo(x + q + 34, y - 4); c.lineTo(x + q - 34, y + 60); }
    c.stroke();
    c.fillStyle = 'rgba(120,70,20,0.17)'; c.beginPath(); c.moveTo(x + 5, y); c.lineTo(x + w + 1, y); c.lineTo(x + 2, y + h); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,240,200,0.22)'; c.beginPath(); c.moveTo(x - w, y); c.lineTo(x - 8, y); c.lineTo(x - 1, y + h); c.closePath(); c.fill();
    c.restore();
    c.fillStyle = '#f1d199'; PZ.rr(c, x - w - 1.5, y - 3.5, 2 * w + 3, 7, 3.5); c.fill();
    c.fillStyle = 'rgba(150,95,40,0.3)'; PZ.rr(c, x - w - 1, y + 1.5, 2 * w + 2, 1.8, 0.9); c.fill();
  }

  // ---------------------------------------------------------------- GUESTS
  // The lido's regulars, each known by a hat, hair or glasses as well as a name.
  const REGULARS = [
    { name: 'Mabel', look: 'sunhat', skin: '#f1c9a5', hair: '#bdb6ab', top: 'dots', col: '#e4705f' },
    { name: 'Otis', look: 'curls', skin: '#8d5a3b', hair: '#2f231c', top: 'shirt', col: '#7fbcd2' },
    { name: 'Nell', look: 'cap', skin: '#f6d3b3', hair: '#6b4a32', top: 'stripes', col: '#3d5a86' },
    { name: 'Stanley', look: 'moustache', skin: '#e8b48f', hair: '#efe9df', top: 'towel', col: '#e9bf4f' },
    { name: 'Amara', look: 'bunches', skin: '#a8714c', hair: '#2f231c', top: 'suit', col: '#e4705f' },
    { name: 'Wilf', look: 'shades', skin: '#f6d3b3', hair: '#c4703f', top: 'shirt', col: '#e9bf4f' },
    { name: 'Sanjay', look: 'beard', skin: '#c98d63', hair: '#3b2a22', top: 'towel', col: '#6fb59a' },
    { name: 'Rosa', look: 'bun', skin: '#e8b48f', hair: '#5a3a28', top: 'suit', col: '#7fbcd2' },
    { name: 'Sid', look: 'bucket', skin: '#c98d63', hair: '#6b4a32', top: 'stripes', col: '#e4705f' },
    { name: 'Ruby', look: 'long', skin: '#f1c9a5', hair: '#a8452d', top: 'dots', col: '#6fb59a' },
  ];
  // hair over the top of the head, with a side-swept fringe
  function hairCap(c, col) {
    c.fillStyle = col; c.beginPath(); c.arc(0, 1, 22.6, Math.PI * 0.97, Math.PI * 2.03);
    c.quadraticCurveTo(13, -8, 2, -11); c.quadraticCurveTo(-11, -13, -22.6, 3); c.closePath(); c.fill();
  }
  function rubberFlower(c, x, y, s, col) {
    for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 - 0.3; dot(c, x + Math.cos(a) * s, y + Math.sin(a) * s, s * 0.82, col); }
    dot(c, x, y, s * 0.62, '#f2c84b');
  }
  // a guest's head round its middle: for the queue and for the little round
  // frames on the board. closed = smiling eyes; lick 0..1 = the tongue comes out
  function guestHead(c, g, closed, happy, lick) {
    const sk = g.skin, hr = g.hair, look = g.look;
    // what sits behind the face
    if (look === 'long') {
      c.fillStyle = hr; c.beginPath(); c.moveTo(-25, -4); c.bezierCurveTo(-26, -34, 26, -34, 25, -4); c.quadraticCurveTo(27, 18, 32, 34); c.quadraticCurveTo(18, 41, 9, 32); c.lineTo(-9, 32); c.quadraticCurveTo(-18, 41, -32, 34); c.quadraticCurveTo(-27, 18, -25, -4); c.closePath(); c.fill();
      c.fillStyle = U.shade(sk, -0.07); c.fillRect(-7, 16, 14, 18);
    }
    if (look === 'sunhat') { c.fillStyle = hr; PZ.rr(c, -24.5, -14, 49, 31, [10, 10, 15, 15]); c.fill(); }
    if (look === 'bunches') for (const s of [-1, 1]) { dot(c, s * 28, 5, 11, hr); dot(c, s * 31, 14, 8, hr); oval(c, s * 21.5, -2, 3, 5, s * 0.5, '#f2c84b'); }
    if (look === 'bun') { dot(c, 0, -28, 11, hr); oval(c, -3, -32, 4, 2.4, -0.4, U.shade(hr, 0.2)); }
    if (look === 'curls') for (let k = 0; k <= 11; k++) { const a = Math.PI * (0.82 + (k / 11) * 1.36); dot(c, Math.cos(a) * 23, -2 + Math.sin(a) * 23, 10, k % 2 ? hr : U.shade(hr, 0.1)); }
    // the ears and the face
    if (look !== 'long' && look !== 'cap') { dot(c, -21, 2, 4.6, sk); dot(c, 21, 2, 4.6, sk); }
    oval(c, 0, 0, 21, 22, 0, sk);
    const blush = U.rgba('#ef8aa6', happy ? 0.45 : 0.3);
    dot(c, -13.5, 7, 4, blush); dot(c, 13.5, 7, 4, blush);
    // hair, hats and whiskers
    if (look === 'sunhat') {
      oval(c, 0, -13, 36, 9.5, 0, '#e6cf9c');
      oval(c, 0, -14.5, 34, 7.6, 0, '#f1dfb4');
      c.fillStyle = '#f1dfb4'; c.beginPath(); c.moveTo(-18, -15); c.bezierCurveTo(-18, -41, 18, -41, 18, -15); c.quadraticCurveTo(0, -11, -18, -15); c.fill();
      c.fillStyle = '#e4705f'; c.beginPath(); c.moveTo(-18, -15.5); c.lineTo(-17.2, -22); c.quadraticCurveTo(0, -18, 17.2, -22); c.lineTo(18, -15.5); c.quadraticCurveTo(0, -11, -18, -15.5); c.fill();
      c.strokeStyle = 'rgba(170,130,70,0.4)'; c.lineWidth = 0.8; c.beginPath();
      for (const q of [0.45, 0.72]) c.ellipse(0, -14.5, 34 * q + 8, 7.6 * q + 1, 0, 0.3, Math.PI - 0.3);
      c.stroke();
    } else if (look === 'curls') {
      for (const [x, y, s] of [[-14, -17, 7], [-5, -20, 7.6], [5, -20, 7.6], [14, -17, 7], [-19, -9, 5.4], [19, -9, 5.4]]) dot(c, x, y, s, hr);
    } else if (look === 'cap') {
      c.fillStyle = '#fffaf1'; c.beginPath(); c.arc(0, 1, 23, Math.PI * 0.94, Math.PI * 2.06); c.quadraticCurveTo(0, -18, -23, 3); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(120,140,160,0.4)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-22, 1.5); c.quadraticCurveTo(0, -16, 22, 1.5); c.stroke();
      rubberFlower(c, -11, -14, 3.7, '#e4705f'); rubberFlower(c, 3, -19, 3.1, '#7fbcd2'); rubberFlower(c, 13, -11, 3.4, '#f1a7b5');
    } else if (look === 'moustache') {
      oval(c, -7, -15, 6.4, 3.2, -0.4, 'rgba(255,255,255,0.4)');
      dot(c, -20.5, -7, 5.6, hr); dot(c, 20.5, -7, 5.6, hr); dot(c, -22, -1, 4.2, hr); dot(c, 22, -1, 4.2, hr);
      c.strokeStyle = hr; c.lineWidth = 3; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-12, -9); c.quadraticCurveTo(-8, -11.5, -4, -9.5); c.moveTo(12, -9); c.quadraticCurveTo(8, -11.5, 4, -9.5); c.stroke();
    } else if (look === 'bunches') {
      hairCap(c, hr);
      for (const [x, y] of [[-12, 3.4], [-9, 5], [-14.5, 5.6], [12, 3.4], [9, 5], [14.5, 5.6]]) dot(c, x, y, 0.8, 'rgba(90,50,30,0.5)');
    } else if (look === 'shades') {
      c.fillStyle = hr; c.beginPath(); c.arc(0, 1, 22.6, Math.PI * 0.97, Math.PI * 2.03); c.lineTo(15, -11); c.lineTo(9, -7); c.lineTo(4, -13); c.lineTo(-3, -8); c.lineTo(-9, -13); c.lineTo(-15, -7); c.closePath(); c.fill();
      for (const [x, y, s] of [[-15, -21, 5], [-6, -24, 6], [5, -24, 6], [15, -20, 5]]) dot(c, x, y, s, hr);
    } else if (look === 'beard') {
      hairCap(c, hr);
      c.fillStyle = hr; c.beginPath(); c.moveTo(-21.5, -1); c.quadraticCurveTo(-23, 25, 0, 27); c.quadraticCurveTo(23, 25, 21.5, -1); c.quadraticCurveTo(15, 7, 7, 4.5); c.quadraticCurveTo(0, 3, -7, 4.5); c.quadraticCurveTo(-15, 7, -21.5, -1); c.closePath(); c.fill();
    } else if (look === 'bun') {
      hairCap(c, hr);
    } else if (look === 'bucket') {
      hairCap(c, hr);
      c.fillStyle = '#e9e1cf'; c.beginPath(); c.moveTo(-18, -13); c.lineTo(-14.5, -33); c.quadraticCurveTo(0, -37.5, 14.5, -33); c.lineTo(18, -13); c.closePath(); c.fill();
      c.fillStyle = '#e4705f'; c.beginPath(); c.moveTo(-17.6, -15); c.lineTo(-16.5, -21); c.quadraticCurveTo(0, -17, 16.5, -21); c.lineTo(17.6, -15); c.quadraticCurveTo(0, -11, -17.6, -15); c.fill();
      c.fillStyle = '#d8cdb6'; c.beginPath(); c.moveTo(-19, -16); c.quadraticCurveTo(0, -11, 19, -16); c.lineTo(29, -6); c.quadraticCurveTo(0, 0, -29, -6); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(120,100,70,0.35)'; c.lineWidth = 0.9; c.setLineDash([2.4, 2.2]); c.beginPath(); c.moveTo(-26, -7.4); c.quadraticCurveTo(0, -1.6, 26, -7.4); c.stroke(); c.setLineDash([]);
    } else if (look === 'long') {
      c.fillStyle = hr;
      c.beginPath(); c.moveTo(0, -23); c.bezierCurveTo(-14, -21, -23, -11, -23, 8); c.quadraticCurveTo(-21, 22, -24, 32); c.lineTo(-13, 30); c.quadraticCurveTo(-18, 10, -15, -2); c.quadraticCurveTo(-11, -12, 0, -15); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(0, -23); c.bezierCurveTo(14, -21, 23, -11, 23, 8); c.quadraticCurveTo(21, 22, 24, 32); c.lineTo(13, 30); c.quadraticCurveTo(18, 10, 15, -2); c.quadraticCurveTo(11, -12, 0, -15); c.closePath(); c.fill();
      c.strokeStyle = '#fffaf1'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.arc(0, -1, 22, Math.PI * 1.13, Math.PI * 1.87); c.stroke();
      rubberFlower(c, 17, -14, 3.3, '#e4705f');
    }
    // the face itself
    if (look === 'shades') {
      c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-20, -5); c.lineTo(20, -5); c.stroke();
      c.fillStyle = '#2f3440'; PZ.rr(c, -17.5, -7, 15, 11.5, 4.6); c.fill(); PZ.rr(c, 2.5, -7, 15, 11.5, 4.6); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(-14, -3.4); c.lineTo(-10.4, -5); c.moveTo(6, -3.4); c.lineTo(9.6, -5); c.stroke();
    } else {
      eye(c, -8, -3, 2.8, closed); eye(c, 8, -3, 2.8, closed);
      if (look === 'bun') {
        c.strokeStyle = '#5a4436'; c.lineWidth = 1.5; c.beginPath(); c.arc(-8, -3, 6.6, 0, 7); c.moveTo(14.6, -3); c.arc(8, -3, 6.6, 0, 7); c.moveTo(-1.6, -4); c.quadraticCurveTo(0, -5.6, 1.6, -4); c.moveTo(-14.6, -4); c.lineTo(-21, -5.4); c.moveTo(14.6, -4); c.lineTo(21, -5.4); c.stroke();
      }
    }
    c.strokeStyle = U.shade(sk, -0.28); c.lineWidth = 1.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-1.6, 3.6); c.quadraticCurveTo(0, 5.6, 1.6, 3.6); c.stroke();
    if (look === 'moustache' || look === 'beard') {
      const m = look === 'beard' ? hr : U.shade(hr, -0.04);
      c.fillStyle = m; c.beginPath(); c.moveTo(0, 5.4); c.quadraticCurveTo(-7, 3.8, -13, 8.6); c.quadraticCurveTo(-6, 11, 0, 8.4); c.quadraticCurveTo(6, 11, 13, 8.6); c.quadraticCurveTo(7, 3.8, 0, 5.4); c.fill();
    }
    const my = look === 'moustache' || look === 'beard' ? 12 : 9.5;
    if (happy) {
      c.fillStyle = '#8f3a35'; c.beginPath(); c.arc(0, my, 6.6, 0.08, Math.PI - 0.08); c.closePath(); c.fill();
      c.fillStyle = '#fffaf1'; c.fillRect(-4, my, 8, 1.5);
      if (lick > 0.08) oval(c, 0, my + 5 + lick * 2.4, 3.6, 2.8 + lick * 2.6, 0, '#ec8a94');
    } else {
      c.strokeStyle = look === 'beard' ? '#fffaf1' : '#6e3a30'; c.lineWidth = 1.8; c.lineCap = 'round'; c.beginPath(); c.arc(0, my - 3, 5, 0.22 * Math.PI, 0.78 * Math.PI); c.stroke();
    }
  }
  // the shoulders and what a guest has on; x is the middle, top the neck
  function torso(c, g, x, top) {
    const sk = g.skin, col = g.col, bare = g.top === 'suit' || g.top === 'towel', lt = '#fffaf1';
    c.fillStyle = U.shade(sk, -0.07); c.fillRect(x - 7, top - 14, 14, 18);
    c.save();
    c.beginPath(); c.moveTo(x - 38, SILL + 2); c.bezierCurveTo(x - 39, top + 14, x - 30, top + 4, x - 9, top + 1); c.lineTo(x + 9, top + 1); c.bezierCurveTo(x + 30, top + 4, x + 39, top + 14, x + 38, SILL + 2); c.closePath();
    c.fillStyle = bare ? sk : col; c.fill(); c.clip();
    if (g.top === 'suit') {
      c.fillStyle = col; c.beginPath(); c.moveTo(x - 40, SILL + 4); c.lineTo(x - 26, top + 28); c.quadraticCurveTo(x, top + 42, x + 26, top + 28); c.lineTo(x + 40, SILL + 4); c.closePath(); c.fill();
      c.strokeStyle = col; c.lineWidth = 4.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 17, top + 3); c.lineTo(x - 22, top + 30); c.moveTo(x + 17, top + 3); c.lineTo(x + 22, top + 30); c.stroke();
    } else if (g.top === 'towel') {
      c.lineCap = 'round'; c.strokeStyle = col; c.lineWidth = 15; c.beginPath(); c.moveTo(x - 17, top + 1); c.quadraticCurveTo(x - 10, top + 22, x - 19, SILL + 8); c.moveTo(x + 17, top + 1); c.quadraticCurveTo(x + 10, top + 22, x + 19, SILL + 8); c.stroke();
      c.strokeStyle = U.rgba(lt, 0.8); c.lineWidth = 2.6; c.beginPath(); c.moveTo(x - 17, top + 1); c.quadraticCurveTo(x - 10, top + 22, x - 19, SILL + 8); c.moveTo(x + 17, top + 1); c.quadraticCurveTo(x + 10, top + 22, x + 19, SILL + 8); c.stroke();
    } else if (g.top === 'stripes') {
      c.fillStyle = lt; for (let y = top + 5; y < SILL; y += 12) c.fillRect(x - 40, y, 80, 5.5);
      oval(c, x, top + 1, 12, 9, 0, sk);
    } else if (g.top === 'dots') {
      for (let j = 0; j < 6; j++) for (let i = -3; i <= 3; i++) dot(c, x + i * 13 + (j % 2) * 6.5, top + 11 + j * 11, 2.1, U.rgba(lt, 0.85));
      oval(c, x, top + 1, 12, 8, 0, sk);
    } else {
      // a loud holiday shirt, open at the neck
      for (let j = 0; j < 5; j++) for (let i = -2; i <= 2; i++) rubberFlower(c, x + i * 17 + (j % 2) * 8.5, top + 15 + j * 15, 1.9, U.shade(col, -0.2));
      c.fillStyle = sk; c.beginPath(); c.moveTo(x - 9, top); c.lineTo(x, top + 16); c.lineTo(x + 9, top); c.closePath(); c.fill();
      c.fillStyle = U.shade(col, 0.45); c.beginPath(); c.moveTo(x - 11, top - 1); c.lineTo(x - 15, top + 10); c.lineTo(x - 1, top + 16); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(x + 11, top - 1); c.lineTo(x + 15, top + 10); c.lineTo(x + 1, top + 16); c.closePath(); c.fill();
    }
    c.restore();
  }

  // --------------------------------------------------------------- THE KIOSK
  // Seen from behind the counter: the order board on the wall above the hatch,
  // the queue in the sunshine with the pool at their backs, the cones on the
  // counter in front of them and the tubs right by your hands, so a scoop
  // travels up and away from the finger.
  const WALL_Y = 196, SILL = 352;  // the top and the bottom of the hatch
  const HEAD_Y = 250;              // the middle of a guest's head
  const CONE_Y = 338, CUP_Y = 368; // a cone's rim, and the rim of the cup it stands in
  const TAG_Y = 412;               // the name tags in front of the cups
  const TUB_Y = 458;               // the middle of a tub's rim
  const ROW0 = 34, ROWS_H = 143;   // the board's rows, under its heading
  const CORAL = '#e4705f', SKY_BLUE = '#7fbcd2';

  // what you see out of the hatch
  function poolView(c, x0, x1, parasols) {
    const w = x1 - x0, sky = c.createLinearGradient(0, WALL_Y, 0, 298);
    sky.addColorStop(0, '#9fd8ef'); sky.addColorStop(1, '#eaf7f2');
    c.fillStyle = sky; c.fillRect(x0, WALL_Y - 8, w, 110);
    const sun = c.createRadialGradient(232, 236, 2, 232, 236, 74);
    sun.addColorStop(0, 'rgba(255,250,214,0.95)'); sun.addColorStop(0.28, 'rgba(255,246,196,0.55)'); sun.addColorStop(1, 'rgba(255,246,196,0)');
    c.fillStyle = sun; c.fillRect(150, WALL_Y, 164, 150);
    // the far side of the pool: a hedge and the pavilion, rounded at both ends
    c.fillStyle = '#a7d3a4'; c.fillRect(x0, 280, w, 18);
    c.fillStyle = '#fbf1dd'; PZ.rr(c, 16, 262, 328, 36, [15, 15, 0, 0]); c.fill();
    c.fillStyle = '#fbf1dd'; PZ.rr(c, 142, 240, 76, 30, [9, 9, 0, 0]); c.fill(); PZ.rr(c, 164, 228, 32, 16, [7, 7, 0, 0]); c.fill();
    c.fillStyle = CORAL; c.fillRect(16, 273, 328, 3); c.fillRect(142, 251, 76, 2.4);
    c.fillStyle = '#8fc7d8';
    for (let x = 34; x < 340; x += 26) { c.beginPath(); c.arc(x, 286, 4.6, 0, 7); c.fill(); }
    // the pool, sparkling
    c.fillStyle = '#8fd5e6'; c.fillRect(x0, 298, w, 42);
    const rr = U.rng(5);
    for (let i = 0; i < 46; i++) { c.fillStyle = `rgba(255,255,255,${(0.25 + rr() * 0.45).toFixed(2)})`; c.fillRect(x0 + rr() * w, 301 + rr() * 36, 7 + rr() * 16, 1.5); }
    c.fillStyle = '#f4e6cc'; c.fillRect(x0, 336, w, 20);
    c.fillStyle = '#fbf3e2'; c.fillRect(x0, 336, w, 2);
    // a parasol at either end of the deck
    for (const px of parasols) {
      c.fillStyle = '#b89a6c'; c.fillRect(px - 1.2, 300, 2.4, 40);
      for (let k = 0; k < 6; k++) {
        const a = -30 + k * 10;
        c.fillStyle = k % 2 ? '#fbf3e2' : CORAL; c.beginPath(); c.moveTo(px, 286); c.quadraticCurveTo(px + a * 0.6, 288, px + a, 304); c.lineTo(px + a + 10, 304); c.quadraticCurveTo(px + (a + 10) * 0.6, 288, px, 286); c.fill();
      }
    }
  }
  // the kiosk's own awning overhead, the sun coming through it
  function awningOver(c, x0, x1) {
    const sw = 30;
    for (let k = Math.floor(x0 / sw); k * sw < x1; k++) {
      const x = k * sw;
      c.fillStyle = k % 2 ? '#fdf3df' : '#ee8a78'; c.fillRect(x, WALL_Y - 8, sw + 0.4, 19);
      c.beginPath(); c.ellipse(x + sw / 2, WALL_Y + 11, sw / 2, 12, 0, 0, Math.PI); c.fill();
    }
    c.fillStyle = 'rgba(70,40,30,0.13)'; c.fillRect(x0, WALL_Y - 8, x1 - x0, 7);
  }
  // a fan of rays in the corner of the board, art deco style
  function fan(c, x, y, dir) {
    c.strokeStyle = 'rgba(255,250,241,0.7)'; c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath();
    for (let k = 0; k < 5; k++) { const a = (k / 4) * (Math.PI / 2) - Math.PI / 2; c.moveTo(x + dir * Math.cos(a) * 5, y + Math.sin(a) * 5); c.lineTo(x + dir * Math.cos(a) * 16, y + Math.sin(a) * 16); }
    c.stroke();
  }
  // a tub on the counter, its mark on a round label and in the ice cream
  function tubArt(c, id, x) {
    const F = FLAVOURS[id], y = TUB_Y, b = y + 50;
    PZ.shadow(c, x + 3, b + 7, 39, 8, 0.2);
    c.save();
    c.beginPath(); c.moveTo(x - 37, y); c.lineTo(x - 33, b); c.quadraticCurveTo(x, b + 13, x + 33, b); c.lineTo(x + 37, y); c.closePath();
    c.fillStyle = '#fdf6e8'; c.fill(); c.clip();
    c.fillStyle = 'rgba(120,100,70,0.1)'; c.fillRect(x + 15, y, 30, 70);
    c.strokeStyle = '#8fc7d8'; c.lineWidth = 3.4;
    for (const q of [5, 45]) { c.beginPath(); c.ellipse(x, y + q, 38, 12, 0, 0.05, Math.PI - 0.05); c.stroke(); }
    c.restore();
    // the label
    c.save(); c.translate(x, y + 30); c.scale(0.8, 0.8);
    dot(c, 0, 0, 21, F.deep); dot(c, 0, 0, 19.6, F.base);
    c.save(); c.beginPath(); c.arc(0, 0, 19.6, 0, 7); c.clip(); mark(c, id); c.restore();
    c.restore();
    // the rim and the ice cream, heaped a little
    oval(c, x, y, 37.5, 12.5, 0, '#efe2c9');
    oval(c, x, y + 1, 33.5, 10, 0, F.deep);
    c.fillStyle = F.base; c.beginPath(); c.moveTo(x - 32, y + 1); c.bezierCurveTo(x - 25, y - 14, x + 25, y - 14, x + 32, y + 1); c.quadraticCurveTo(x, y + 13, x - 32, y + 1); c.fill();
    oval(c, x - 11, y - 5, 12, 3.4, -0.1, F.lite);
    c.strokeStyle = F.deep; c.lineWidth = 1.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x - 25, y + 2); c.quadraticCurveTo(x - 9, y + 8, x + 5, y + 4.6); c.quadraticCurveTo(x + 16, y + 2, x + 26, y + 3); c.stroke();
    c.save(); c.translate(x + 2, y - 1.5); c.scale(0.62, 0.3); mark(c, id); c.restore();
  }
  // a guest in a little round frame on the board
  function badge(c, g, x, y) {
    const fit = { sunhat: [0.52, 5], curls: [0.6, 2], cap: [0.66, 1], moustache: [0.68, 1], bunches: [0.6, 0], shades: [0.62, 2], beard: [0.62, -2], bun: [0.6, 4], bucket: [0.58, 4], long: [0.62, 0] }[g.look];
    c.save();
    dot(c, x, y, 16.5, '#d9eff4');
    c.beginPath(); c.arc(x, y, 16.5, 0, 7); c.clip();
    c.translate(x, y + fit[1]); c.scale(fit[0], fit[0]);
    guestHead(c, g, false, false, 0);
    c.restore();
    c.strokeStyle = SKY_BLUE; c.lineWidth = 1.6; c.beginPath(); c.arc(x, y, 16.5, 0, 7); c.stroke();
  }
  // the front of the little enamel cup a cone stands in
  function cupFront(c, x) {
    c.save();
    c.beginPath(); c.moveTo(x - 16, CUP_Y); c.lineTo(x - 12, CUP_Y + 26); c.quadraticCurveTo(x, CUP_Y + 31, x + 12, CUP_Y + 26); c.lineTo(x + 16, CUP_Y); c.ellipse(x, CUP_Y, 16, 5, 0, 0, Math.PI); c.closePath();
    c.fillStyle = CORAL; c.fill(); c.clip();
    c.fillStyle = '#fdf3df'; c.beginPath(); c.ellipse(x, CUP_Y + 9, 18, 5, 0, 0, Math.PI); c.lineTo(x - 18, CUP_Y + 4); c.ellipse(x, CUP_Y + 4, 18, 5, 0, Math.PI, 0, true); c.closePath(); c.fill();
    c.fillStyle = 'rgba(120,50,30,0.14)'; c.fillRect(x + 6, CUP_Y, 14, 36);
    c.restore();
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1.3; c.beginPath(); c.ellipse(x, CUP_Y, 16, 5, 0, 0.3, Math.PI - 0.3); c.stroke();
  }

  function ices(S) {
    const r = S.r;
    // four tubs on the counter, three or four guests, each wanting one of them
    const tubs = PZ.shuffle(r, FLAVOUR_IDS.slice()).slice(0, 4).map((id, i) => ({ id, x: 50 + i * 86.7 }));
    const count = r() < 0.5 ? 3 : 4;
    const wants = PZ.shuffle(r, tubs.map((b) => b.id)).slice(0, count);
    if (count === 4 && r() < 0.3) wants[3] = wants[0]; // now and then two fancy the same one
    const guests = PZ.shuffle(r, REGULARS.slice()).slice(0, count).map((p, i) => Object.assign({}, p, { id: wants[i], need: 1, fill: 0, land: null, eatK: 0, wait: 0, shake: 0, phase: r() }));
    // one to three scoops each, five to ten in all
    const total = () => guests.reduce((s, g) => s + g.need, 0);
    do { for (const g of guests) g.need = 1 + ((r() * 3) | 0); } while (total() < 5 || total() > 10);
    const steps = total();
    // the board and the queue never list them in the same order
    const board = PZ.shuffle(r, guests.slice());
    let queue;
    do { queue = PZ.shuffle(r, guests.slice()); } while (queue.every((g, i) => g === board[i]));
    const slot = count === 3 ? 114 : 86.7, rowH = ROWS_H / count;
    queue.forEach((g, i) => {
      g.x = count === 3 ? 66 + i * slot : 50 + i * slot;
      // how far a finished ice lifts to reach the mouth
      g.rise = Math.max(0, CONE_Y - 24 - (g.need - 1) * 19 - HEAD_Y - 22);
    });
    board.forEach((g, i) => { g.row = ROW0 + (i + 0.5) * rowH; });
    const tubFor = (id) => tubs.find((b) => b.id === id);
    const spot = (g, k) => [g.x + [0, -1.5, 1.6][k], CONE_Y - 7 - k * 19];
    const guestAt = (x, y) => queue.find((g) => Math.abs(g.x - x) < slot / 2 && y > WALL_Y && y < TAG_Y + 12);

    let held = null, hint = null, hintT = 0, fx = null;
    const flights = [], hearts = [];

    function settle(g, n) {
      g.fill = Math.max(0, Math.min(g.need, n | 0)); g.land = null;
      g.eatK = g.fill >= g.need ? 1 : 0; g.wait = g.eatK;
    }
    function sendBack(id, x, y) { const b = tubFor(id); flights.push({ id, x, y, tx: b.x, ty: TUB_Y - 6 }); }

    // a guest at the hatch with their cone; a picture always shows the settled moment
    function figure(c, g, t, still) {
      const eat = still && g.fill >= g.need ? 1 : g.eatK, happy = eat > 0.4;
      const lick = eat > 0.95 ? Math.pow(Math.max(0, Math.sin(t * 1.4 + g.phase * 6)), 2) : 0;
      const sway = Math.sin(t * 0.9 + g.phase * 6) * 1.1;
      const sh = g.shake > 0 && !still ? Math.sin(g.shake * 15) * 0.17 * Math.min(1, g.shake / 0.3) : 0;
      const blink = !still && ((t * 0.21 + g.phase) % 1) < 0.03;
      c.save(); c.beginPath(); c.rect(g.x - 60, 150, 120, SILL - 151); c.clip();
      torso(c, g, g.x + sway * 0.4, HEAD_Y + 24);
      c.restore();
      c.save(); c.translate(g.x + sway, HEAD_Y + lick * 4); c.rotate(sh);
      guestHead(c, g, happy || blink, happy, lick);
      c.restore();
      // the ice, and the hand that lifts it to the mouth once it is finished
      const up = g.rise * eat;
      c.save(); c.translate(0, -up);
      waffle(c, g.x, CONE_Y);
      for (let j = 0; j < g.fill; j++) {
        const [x, y] = spot(g, j);
        if (g.land && j === g.fill - 1 && !still) {
          const k = U.easeOut(Math.min(1, g.land.k));
          scoopBall(c, g.id, U.lerp(g.land.x, x, k), U.lerp(g.land.y, y, k), U.lerp(25, 17, k));
        } else scoopBall(c, g.id, x, y, 17);
      }
      c.restore();
      cupFront(c, g.x);
      if (eat > 0.02) {
        const hx = U.lerp(g.x + 30, g.x + 9, eat), hy = U.lerp(SILL - 4, CONE_Y + 18 - up, eat);
        c.strokeStyle = U.shade(g.skin, -0.05); c.lineWidth = 9.5; c.lineCap = 'round';
        c.beginPath(); c.moveTo(g.x + 32, HEAD_Y + 46); c.quadraticCurveTo(g.x + 44, SILL - 8, hx + 7, hy + 3); c.stroke();
        c.lineWidth = 3.8; c.beginPath();
        for (let k = 0; k < 4; k++) { const y = hy - 4.2 + k * 3.8; c.moveTo(hx + 7, y); c.lineTo(hx - 7, y + 0.8); }
        c.stroke();
      }
    }

    const sc = {
      puzzle: true, indoor: true, steps,
      crop: { x: 0, y: 198, w: 360, h: 360 }, // the queue, their ices and the tubs
      decor(c) {
        const { x0, y0, x1, y1 } = S.bleed, w = x1 - x0, rr = U.rng(23);
        // the wall above the hatch, cream tiles and a pale blue beam
        c.fillStyle = '#f5eada'; c.fillRect(x0, y0, w, WALL_Y - y0);
        c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 1.4;
        for (let y = WALL_Y - 8 - 24; y > y0; y -= 24) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); }
        for (let x = Math.floor(x0 / 24) * 24; x < x1; x += 24) { c.beginPath(); c.moveTo(x, y0); c.lineTo(x, WALL_Y); c.stroke(); }
        poolView(c, x0, x1, count === 3 ? [123, 237] : [94, 268]); // in the gaps between the guests
        awningOver(c, x0, x1);
        c.fillStyle = SKY_BLUE; c.fillRect(x0, WALL_Y - 12, w, 7);
        c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x0, WALL_Y - 12, w, 1.6);
        // the counter: terrazzo in cream, coral and pale blue, with sun across it
        c.fillStyle = '#f6ecd9'; c.fillRect(x0, SILL, w, y1 - SILL);
        const chips = ['#efb9a9', '#bfe0e9', '#d9ccb6', '#ffffff'], many = Math.round(((y1 - SILL) * w) / 210);
        for (let i = 0; i < many; i++) { const col = chips[(rr() * chips.length) | 0]; c.globalAlpha = 0.45 + rr() * 0.4; oval(c, x0 + rr() * w, SILL + rr() * (y1 - SILL), 1 + rr() * 2, 0.8 + rr() * 1.3, rr() * 3, col); }
        c.globalAlpha = 1;
        const sun = c.createLinearGradient(0, SILL, 0, SILL + 130);
        sun.addColorStop(0, 'rgba(255,240,180,0.55)'); sun.addColorStop(1, 'rgba(255,240,180,0)');
        c.fillStyle = sun; c.fillRect(x0, SILL, w, 130);
        c.fillStyle = '#b9d3da'; c.fillRect(x0, SILL - 3, w, 7);
        c.fillStyle = 'rgba(255,255,255,0.75)'; c.fillRect(x0, SILL - 3, w, 2);
        c.fillStyle = 'rgba(60,70,80,0.16)'; c.fillRect(x0, SILL + 4, w, 2.4);
        // the order board
        c.fillStyle = 'rgba(60,40,20,0.15)'; PZ.rr(c, 17, 6, 330, 180, 11); c.fill();
        c.fillStyle = SKY_BLUE; PZ.rr(c, 14, 3, 332, 180, 11); c.fill();
        c.fillStyle = PAPER; PZ.rr(c, 19, 8, 322, 170, 8); c.fill();
        c.fillStyle = CORAL; PZ.rr(c, 19, 8, 322, 26, [8, 8, 0, 0]); c.fill();
        fan(c, 22, 33, 1); fan(c, 338, 33, -1);
        PZ.text(c, 'Orders', 180, 22, { size: 17, color: PAPER });
        PZ.text(c, 'scoops', 276, 22.5, { size: 12.5, color: PAPER, weight: 700 });
        board.forEach((g, i) => {
          const y = g.row;
          if (i) { c.strokeStyle = 'rgba(107,97,87,0.2)'; c.lineWidth = 1; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(26, y - rowH / 2); c.lineTo(334, y - rowH / 2); c.stroke(); c.setLineDash([]); }
          badge(c, g, 42, y);
          PZ.text(c, g.name, 64, y, { size: 14.5, align: 'left', maxW: 56 });
          scoopBall(c, g.id, 137, y - 0.5, 12.5);
          PZ.text(c, FLAVOURS[g.id].name, 153, y, { size: 13, align: 'left', color: INK2, maxW: 70 });
          PZ.text(c, String(g.need), 236, y + 0.5, { size: 19, weight: 900, color: '#d9604e' });
          for (let j = 0; j < g.need; j++) { dot(c, 258 + j * 20, y, 8.6, '#fbf3e2'); c.strokeStyle = 'rgba(228,112,95,0.75)'; c.lineWidth = 1.5; c.beginPath(); c.arc(258 + j * 20, y, 8.2, 0, 7); c.stroke(); }
        });
        // the cups and the name tags
        for (const g of queue) {
          PZ.shadow(c, g.x + 2, CUP_Y + 28, 19, 5, 0.2);
          oval(c, g.x, CUP_Y, 16, 5, 0, '#b9503f');
          c.fillStyle = 'rgba(60,40,20,0.13)'; PZ.rr(c, g.x - 32, TAG_Y - 9, 66, 22, 8); c.fill();
          c.fillStyle = PAPER; PZ.rr(c, g.x - 33, TAG_Y - 11, 66, 22, 8); c.fill();
          c.strokeStyle = 'rgba(228,112,95,0.7)'; c.lineWidth = 1.6; c.stroke();
          PZ.text(c, g.name, g.x, TAG_Y + 0.5, { size: 14, maxW: 58 });
        }
        for (const b of tubs) {
          tubArt(c, b.id, b.x);
          c.fillStyle = 'rgba(60,40,20,0.12)'; PZ.rr(c, b.x - 36, 527, 74, 22, 8); c.fill();
          c.fillStyle = PAPER; PZ.rr(c, b.x - 37, 525, 74, 22, 8); c.fill();
          PZ.text(c, FLAVOURS[b.id].name, b.x, 536.5, { size: 13.5, maxW: 66 });
        }
        PZ.text(c, 'Scoop each ice just as the board says', 180, 570, { size: 13, color: INK2, weight: 700, maxW: 330 });
      },
      draw(c, t, still) {
        // the board fills in as scoops go on, and a tick for every finished ice
        for (const g of board) {
          for (let j = 0; j < g.fill; j++) scoopBall(c, g.id, 258 + j * 20, g.row - 0.5, 8.6);
          if (g.fill >= g.need) {
            c.strokeStyle = '#3f8f8a'; c.lineWidth = 3.5; c.lineCap = 'round'; c.lineJoin = 'round';
            c.beginPath(); c.moveTo(316, g.row); c.lineTo(321, g.row + 5); c.lineTo(330, g.row - 6); c.stroke();
          }
        }
        // the tubs get a dent for every scoop taken from them
        for (const b of tubs) {
          let used = 0;
          for (const g of guests) if (g.id === b.id) used += g.fill;
          const F = FLAVOURS[b.id];
          for (let j = 0; j < Math.min(used, 3); j++) {
            const x = b.x + [12, -13, 1][j], y = TUB_Y + [-1, 1, 3.4][j];
            oval(c, x, y, 9.5, 3.6, 0, F.deep); oval(c, x, y + 1.2, 8.2, 2.6, 0, F.base);
          }
        }
        for (const g of queue) figure(c, g, t, still);
        // a hint rings the board's row, the tub and the cone for one scoop
        if (hint && hintT > 0 && !still) {
          const b = tubFor(hint.id);
          c.strokeStyle = `rgba(255,214,90,${0.6 + 0.3 * Math.sin(t * 5)})`; c.lineWidth = 3;
          PZ.rr(c, 23, hint.row - rowH / 2 + 2, 314, rowH - 4, 9); c.stroke();
          PZ.glow(c, b.x, TUB_Y + 22, 44, t); PZ.glow(c, hint.x, CONE_Y + 8, 32, t);
        }
        if (still) return;
        for (const h of hearts) { c.globalAlpha = Math.max(0, 1 - h.age / 1.4); heart(c, h.x, h.y - h.age * 30, 6 + h.age * 3, '#ec8a94'); }
        c.globalAlpha = 1;
        for (const f of flights) scoopBall(c, f.id, f.x, f.y, 25, Math.min(1, PZ.dist(f.x, f.y, f.tx, f.ty) / 30));
        if (held) { PZ.shadow(c, held.x + 6, held.y + 36, 22, 5, 0.12); scoopBall(c, held.id, held.x, held.y, 25); }
      },
      step(dt) {
        hintT -= dt;
        for (const g of guests) {
          g.shake = Math.max(0, g.shake - dt);
          if (g.land && (g.land.k += dt / 0.2) >= 1) g.land = null;
          g.wait = g.fill >= g.need && !g.land ? g.wait + dt : 0;
          g.eatK = PZ.approach(g.eatK, g.wait > 0.3 ? 1 : 0, dt, 3.6);
        }
        if (held) { held.x = PZ.approach(held.x, held.tx, dt, 22); held.y = PZ.approach(held.y, held.ty, dt, 22); }
        for (let i = flights.length - 1; i >= 0; i--) {
          const f = flights[i]; f.x = PZ.approach(f.x, f.tx, dt, 11); f.y = PZ.approach(f.y, f.ty, dt, 11);
          if (PZ.dist(f.x, f.y, f.tx, f.ty) < 2) flights.splice(i, 1);
        }
        for (let i = hearts.length - 1; i >= 0; i--) if ((hearts[i].age += dt) > 1.4) hearts.splice(i, 1);
      },
      down(x, y) {
        if (held) return;
        const b = tubs.find((q) => Math.abs(q.x - x) < 42 && y > TUB_Y - 24 && y < 552);
        if (!b) return;
        held = { id: b.id, x: b.x, y: TUB_Y - 6, tx: x, ty: y - PZ.LIFT };
        fx.sound('pick');
      },
      move(x, y) { if (held) { held.tx = x; held.ty = y - PZ.LIFT; } },
      up(x, y) {
        if (!held) return;
        const id = held.id, dx = x, dy = y - PZ.LIFT; // judged where it is drawn
        held = null;
        const g = guestAt(dx, dy);
        if (g && g.id === id && g.fill < g.need) {
          g.land = { x: dx, y: dy, k: 0 };
          g.fill++;
          const [sx, sy] = spot(g, g.fill - 1);
          fx.sound('drop'); fx.good(sx, sy);
          if (g.fill >= g.need) {
            fx.sound('happy'); hearts.push({ x: g.x + 25, y: HEAD_Y - 22, age: 0 });
            if (hint === g) hintT = 0;
            if (sc.solved()) fx.sound('chime');
          }
          return;
        }
        if (g) g.shake = 0.7; // not that flavour, or quite enough already: a gentle shake of the head
        sendBack(id, dx, dy);
        fx.sound(g || dy < TAG_Y + 12 ? 'nope' : 'drop'); // put back by the tubs is not a wrong move
      },
      cancel() { if (held) { sendBack(held.id, held.x, held.y); held = null; } },
      progress: () => guests.reduce((s, g) => s + g.fill, 0) / steps,
      solved: () => guests.every((g) => g.fill >= g.need),
      hint() { hint = board.find((g) => g.fill < g.need) || null; hintT = 3; },
      save: () => ({ fill: queue.map((g) => g.fill) }),
      load(s) { if (s && Array.isArray(s.fill)) s.fill.forEach((n, i) => { if (queue[i]) settle(queue[i], n); }); },
      solveAll() { for (const g of guests) settle(g, g.need); },
      // finger positions: pick up at the tub, let go PZ.LIFT below the top of the cone
      debugPlan() {
        const plan = [];
        for (const g of queue) for (let k = g.fill; k < g.need; k++) { const b = tubFor(g.id), [x, y] = spot(g, k); plan.push({ drag: [b.x, TUB_Y + 24, x, y + PZ.LIFT] }); }
        return plan;
      },
    };
    Object.defineProperty(sc, 'fx', { get: () => fx, set: (v) => { fx = v; } });
    return sc;
  }
  Object.assign(SCENES.KINDS, { feeding });
})();
