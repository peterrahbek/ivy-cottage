'use strict';
// Mix the colours: a making job at The Painter's Loft (and in the puzzle room).
// Four paint cards hang on the wall, each with a colour to match and its name.
// Four jars stand on the tray, Red, Yellow, Blue and White, each with its name
// and a shape of its own on the label. Tap a jar, or drag it to the bowl, and
// it pours. Two different jars make a mix: if a card is still waiting for that
// colour, the paint goes up and fills the card; if not, the little jug rinses
// the bowl and nothing is lost. Eight taps in all. The same jar twice simply
// tips back again. What is in the bowl is always named on the tag below it.
//   node test/run.mjs puzzle js/pz-mix.js mix --seeds 30

(() => {
  const W = 360;
  const JARS = [
    { name: 'Red', col: '#d8443c', shape: 'round' },
    { name: 'Yellow', col: '#f3c433', shape: 'triangle' },
    { name: 'Blue', col: '#3f6fc4', shape: 'square' },
    { name: 'White', col: '#f6f1e6', shape: 'star' },
  ];
  // every pair of jars makes one of these six; a, b = places in JARS
  const COLOURS = [
    { name: 'Orange', col: '#ee8b2e', a: 0, b: 1 }, { name: 'Green', col: '#5aa64f', a: 1, b: 2 },
    { name: 'Purple', col: '#8a55b5', a: 0, b: 2 }, { name: 'Pink', col: '#f2a0b4', a: 0, b: 3 },
    { name: 'Sky', col: '#9cc8ee', a: 2, b: 3 }, { name: 'Cream', col: '#f7e6ad', a: 1, b: 3 },
  ];
  const TABLE_Y = 192;
  const CARD = { y: 106, w: 78, h: 132, xs: [51, 137, 223, 309], tilt: [-1.5, 1.2, -0.9, 1.5] };
  const BOWL = { x: 180, y: 288, rx: 106, ry: 45, ix: 94, iy: 35 };
  const JAR_Y = 484, SLOT_X = [51, 137, 223, 309], JAR_W = 72, JAR_H = 110;
  const JUG = { x: 314, y: 344 };
  const HIT = 0.26;     // seconds after a tap that a jar's paint reaches the bowl
  const SEND = 0.82;    // when a mix that matches goes up to its card
  const RINSE = 0.8;    // when one that does not is rinsed away
  const DUR = 0.96;     // a jar's whole trip to the bowl and back
  const GOOD_MS = 300;  // a right mix pays as the second colour lands
  const EDGE = 'rgba(52,36,28,0.5)';

  function spots(c, r, x0, y0, x1, y1, n, cols) {
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), s = 3 + r() * r() * 15, col = cols[(r() * cols.length) | 0];
      c.fillStyle = col; c.globalAlpha = 0.72 + r() * 0.2;
      c.beginPath();
      for (let k = 0; k < 9; k++) { const a = (k / 9) * 6.283, d = s * (0.8 + r() * 0.34); c.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.72); }
      c.closePath(); c.fill();
      for (let k = 0; k < 3; k++) { const a = r() * 6.283, d = s + 3 + r() * 9; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.7, 0.8 + r() * 1.5, 0, 7); c.fill(); }
    }
    c.globalAlpha = 1;
  }
  function shapePath(c, shape, x, y, s) {
    c.beginPath();
    if (shape === 'round') c.arc(x, y, s, 0, 7);
    else if (shape === 'square') c.rect(x - s * 0.88, y - s * 0.88, s * 1.76, s * 1.76);
    else if (shape === 'triangle') { c.moveTo(x, y - s * 1.12); c.lineTo(x + s * 1.12, y + s * 0.82); c.lineTo(x - s * 1.12, y + s * 0.82); c.closePath(); }
    else {
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5, d = i % 2 ? s * 0.5 : s * 1.22;
        c.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d + s * 0.08);
      }
      c.closePath();
    }
  }
  // a jar drawn around its middle; a = how far it is tipped
  function jarArt(c, jar, x, y, a, k = 1) {
    c.save(); c.translate(x, y); c.rotate(a); c.scale(k, k);
    const hw = 33, top = -38, bot = 50;
    // the glass, and the paint in it
    c.fillStyle = 'rgba(232,240,240,0.82)'; PZ.rr(c, -hw, top, hw * 2, bot - top, 13); c.fill();
    const g = c.createLinearGradient(-hw, 0, hw, 0);
    g.addColorStop(0, U.shade(jar.col, 0.22)); g.addColorStop(0.45, jar.col); g.addColorStop(1, U.shade(jar.col, -0.17));
    c.fillStyle = g; PZ.rr(c, -hw + 3, -22, hw * 2 - 6, bot + 19, [6, 6, 11, 11]); c.fill();
    c.fillStyle = U.shade(jar.col, 0.3); c.beginPath(); c.ellipse(0, -21, hw - 4, 3.4, 0, 0, 7); c.fill();
    // the neck, the lip and a drip down the side
    c.fillStyle = 'rgba(226,236,236,0.95)'; PZ.rr(c, -25, top - 10, 50, 13, 4); c.fill();
    c.strokeStyle = EDGE; c.lineWidth = 1.3; PZ.rr(c, -hw, top, hw * 2, bot - top, 13); c.stroke();
    PZ.rr(c, -28, top - 13, 56, 7, 3.5); c.fillStyle = '#f4f7f6'; c.fill(); c.stroke();
    c.fillStyle = jar.col; c.beginPath(); c.moveTo(-14, top - 7); c.lineTo(-5, top - 7); c.quadraticCurveTo(-5, top + 2, -7.6, top + 11); c.quadraticCurveTo(-9.6, top + 15, -11, top + 8); c.quadraticCurveTo(-13, top + 2, -14, top - 7); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(52,36,28,0.28)'; c.lineWidth = 0.9; c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.5)'; PZ.rr(c, -hw + 6, top + 4, 5, 62, 2.5); c.fill();
    // the label: a shape of its own and the name
    c.fillStyle = 'rgba(60,40,20,0.14)'; PZ.rr(c, -26, 1.4, 54, 40, 5); c.fill();
    c.fillStyle = PZ.PAPER; PZ.rr(c, -27, 0, 54, 40, 5); c.fill();
    c.strokeStyle = 'rgba(120,95,70,0.4)'; c.lineWidth = 0.9; c.stroke();
    shapePath(c, jar.shape, 0, 12, 6.6);
    c.fillStyle = jar.col; c.fill(); c.strokeStyle = PZ.INK; c.lineWidth = 1.2; c.stroke();
    PZ.text(c, jar.name, 0, 30, { size: 13.5, weight: 900, maxW: 50 });
    c.restore();
  }
  // a little four-pointed twinkle
  function glint(c, x, y, rad, a) {
    if (rad <= 0.3 || a <= 0.01) return;
    c.save(); c.globalAlpha = Math.min(1, a); c.fillStyle = '#fffbea';
    c.beginPath();
    c.moveTo(x, y - rad); c.quadraticCurveTo(x + rad * 0.12, y - rad * 0.12, x + rad, y); c.quadraticCurveTo(x + rad * 0.12, y + rad * 0.12, x, y + rad);
    c.quadraticCurveTo(x - rad * 0.12, y + rad * 0.12, x - rad, y); c.quadraticCurveTo(x - rad * 0.12, y - rad * 0.12, x, y - rad);
    c.fill(); c.restore();
  }

  function mix(S) {
    const r = S.r;
    // J = the jars as they stand on the tray today; cards = four of the six colours
    const J = PZ.shuffle(r, JARS.slice());
    const slot = (jar) => J.indexOf(JARS[jar]);
    const cards = PZ.shuffle(r, COLOURS.slice()).slice(0, 4).map((q) => ({ name: q.name, col: q.col, a: slot(q.a), b: slot(q.b) }));
    const colourOf = (a, b) => COLOURS.find((q) => (slot(q.a) === a && slot(q.b) === b) || (slot(q.a) === b && slot(q.b) === a));
    const decorSeed = (r() * 1e6) | 0;
    const HOME = SLOT_X.map((x) => ({ x, y: JAR_Y }));
    const steps = 4;

    // what is true: bowl = the jar in the bowl so far; filled = the cards done
    let bowl = null, paid = 0, fx = null;
    const filled = [false, false, false, false];
    let pend = null;   // a right mix, paid the moment its second colour lands
    // how it looks
    let pool = null, held = null, hintT = 0, shine = 0, jugT = -1;
    const trip = [null, null, null, null], off = HOME.map(() => ({ x: 0, y: 0 })), nudge = [0, 0, 0, 0];
    const fillK = [0, 0, 0, 0], running = [false, false, false, false], blobs = [];

    const solved = () => paid >= steps;
    const flush = () => { if (!pend) return; pend = null; paid++; fx.good(BOWL.x, BOWL.y - 6); };
    // the paint leaves the bowl for its card
    function send(p) {
      if (p.sent || p.i < 0) return;
      p.sent = true;
      blobs.push({ i: p.i, t: 0, col: p.col });
    }
    function pour(j, from) {
      flush();
      trip[j] = { t: 0, from };
      fx.sound('pour');
      hintT = 0;
      if (pool && pool.cols.length > 1) { send(pool); pool = null; jugT = -1; }
      if (bowl === null) {
        bowl = j;
        pool = { cols: [j], t: 0, lev: pool ? pool.lev : 0, spin: 0, mix: 0, water: 0, i: -1, name: J[j].name + ' +' };
        return;
      }
      const q = colourOf(bowl, j), i = cards.findIndex((m, k) => m.name === q.name && !filled[k]);
      if (!pool) pool = { cols: [bowl], t: 0, lev: 0.62, spin: 0, mix: 0, water: 0, i: -1 };
      pool.cols.push(j); pool.t = 0; pool.col = q.col; pool.i = i;
      pool.name = `${J[bowl].name} + ${J[j].name} = ${q.name}`;
      bowl = null;
      if (i >= 0) { filled[i] = true; pend = { at: performance.now() + GOOD_MS }; }
    }

    // ------------------------------------------------------------ the room
    function wall(c) {
      const { x0, y0, x1 } = S.bleed;
      const g = c.createLinearGradient(0, y0, 0, TABLE_Y);
      g.addColorStop(0, '#f8f4ea'); g.addColorStop(1, '#efe8d9');
      c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, TABLE_Y - y0);
      c.fillStyle = 'rgba(150,130,100,0.13)'; for (let x = Math.floor(x0 / 44) * 44; x < x1; x += 44) c.fillRect(x, y0, 1.3, TABLE_Y - y0);
      // the light from the skylight, slanting across the boards
      c.fillStyle = 'rgba(255,255,255,0.42)';
      c.beginPath(); c.moveTo(150, y0); c.lineTo(250, y0); c.lineTo(120, TABLE_Y); c.lineTo(24, TABLE_Y); c.closePath(); c.fill();
      c.fillStyle = '#3f5fa8'; c.fillRect(x0, TABLE_Y - 8, x1 - x0, 3);
      PZ.text(c, 'Two jars in the bowl for each colour', W / 2, 20, { size: 13, color: PZ.INK2, maxW: 340 });
    }
    function table(c) {
      const { x0, x1, y1 } = S.bleed, rr = U.rng(decorSeed);
      c.fillStyle = '#c29a6c'; c.fillRect(x0, TABLE_Y, x1 - x0, y1 - TABLE_Y);
      c.strokeStyle = 'rgba(110,70,35,0.16)'; c.lineWidth = 0.9;
      for (let i = 0; i < 120; i++) { const x = x0 + rr() * (x1 - x0), y = TABLE_Y + 4 + rr() * (y1 - TABLE_Y), l = 18 + rr() * 60; c.beginPath(); c.moveTo(x, y); c.lineTo(x + l, y + (rr() - 0.5) * 2); c.stroke(); }
      c.fillStyle = 'rgba(90,55,25,0.2)'; for (let y = TABLE_Y + 70; y < y1; y += 78) c.fillRect(x0, y, x1 - x0, 1.6);
      // years of paint
      spots(c, rr, x0, TABLE_Y + 14, x1, y1, 26, ['#3f5fa8', '#d9a441', '#c95a48', '#f4efe2', '#5aa64f', '#8a55b5']);
      c.fillStyle = 'rgba(60,40,20,0.26)'; c.fillRect(x0, TABLE_Y, x1 - x0, 5);
      // a rag, soft and paint-stained, by the left of the bowl
      c.fillStyle = 'rgba(60,40,20,0.2)'; c.beginPath(); c.ellipse(42, 362, 36, 11, -0.1, 0, 7); c.fill();
      c.fillStyle = '#e9dfca'; c.beginPath(); c.moveTo(8, 356); c.quadraticCurveTo(26, 330, 46, 340); c.quadraticCurveTo(66, 332, 76, 352); c.quadraticCurveTo(60, 372, 34, 368); c.quadraticCurveTo(14, 372, 8, 356); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(120,95,70,0.35)'; c.lineWidth = 1; c.stroke();
      c.strokeStyle = 'rgba(120,95,70,0.3)'; c.beginPath(); c.moveTo(24, 346); c.quadraticCurveTo(40, 356, 40, 366); c.moveTo(48, 342); c.quadraticCurveTo(56, 352, 62, 356); c.stroke();
      spots(c, rr, 22, 346, 60, 362, 3, ['#3f5fa8', '#d9a441', '#c95a48']);
    }
    function bowlArt(c) {
      const { x, y, rx, ry, ix, iy } = BOWL;
      c.fillStyle = 'rgba(60,40,20,0.26)'; c.beginPath(); c.ellipse(x + 4, y + 75, 84, 14, 0, 0, 7); c.fill();
      // the enamel side and the foot
      const g = c.createLinearGradient(x - rx, 0, x + rx, 0);
      g.addColorStop(0, '#d9d3c5'); g.addColorStop(0.3, '#fbf8f0'); g.addColorStop(1, '#cfc8b8');
      c.fillStyle = g; c.beginPath(); c.moveTo(x - rx, y); c.bezierCurveTo(x - rx + 6, y + 52, x - 58, y + 68, x - 44, y + 72);
      c.lineTo(x + 44, y + 72); c.bezierCurveTo(x + 58, y + 68, x + rx - 6, y + 52, x + rx, y); c.closePath(); c.fill();
      c.strokeStyle = EDGE; c.lineWidth = 1.2; c.stroke();
      c.fillStyle = '#d7d0c0'; c.beginPath(); c.ellipse(x, y + 72, 46, 7, 0, 0, 7); c.fill(); c.stroke();
      // the rim and the inside
      c.fillStyle = '#3f5fa8'; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 7); c.fill();
      c.fillStyle = '#5b79bf'; c.beginPath(); c.ellipse(x, y - 1, rx - 2, ry - 2, 0, 3.5, 5.9); c.lineTo(x, y); c.closePath(); c.fill();
      const q = c.createLinearGradient(0, y - iy, 0, y + iy);
      q.addColorStop(0, '#d3cdbf'); q.addColorStop(0.6, '#efeadf'); q.addColorStop(1, '#fbf8f1');
      c.fillStyle = q; c.beginPath(); c.ellipse(x, y, ix + 4, iy + 4, 0, 0, 7); c.fill();
      c.strokeStyle = 'rgba(52,36,28,0.3)'; c.lineWidth = 1; c.stroke();
    }
    function tray(c) {
      const y = JAR_Y + 44;
      c.fillStyle = 'rgba(60,40,20,0.22)'; PZ.rr(c, 6, y + 7, 352, 26, 9); c.fill();
      c.fillStyle = '#8a5a36'; PZ.rr(c, 4, y, 352, 25, 9); c.fill();
      c.fillStyle = '#a8764a'; PZ.rr(c, 8, y + 3, 344, 13, 6); c.fill();
      c.fillStyle = 'rgba(255,225,180,0.25)'; PZ.rr(c, 12, y + 4, 336, 2.4, 1.2); c.fill();
    }
    function card(c, i, t, still) {
      const q = cards[i], x = CARD.xs[i], { y, w, h } = CARD, on = still ? filled[i] : running[i];
      const k = still ? (filled[i] ? 1 : 0) : fillK[i];
      c.save(); c.translate(x, y); c.rotate((CARD.tilt[i] * Math.PI) / 180);
      c.fillStyle = 'rgba(60,40,20,0.2)'; PZ.rr(c, -w / 2 + 2, -h / 2 + 3, w, h, 4); c.fill();
      c.fillStyle = PZ.PAPER; PZ.rr(c, -w / 2, -h / 2, w, h, 4); c.fill();
      c.strokeStyle = 'rgba(150,125,95,0.4)'; c.lineWidth = 0.9; c.stroke();
      // the swatch: a faint outline of the colour until it has been mixed
      const sx = -30, sy = -h / 2 + 15, sw = 60, sh = 78;
      c.fillStyle = U.mix(q.col, '#fffaf1', 0.74); PZ.rr(c, sx, sy, sw, sh, 3); c.fill();
      c.setLineDash([4, 3.2]); c.strokeStyle = U.shade(q.col, -0.3); c.lineWidth = 1.3; PZ.rr(c, sx, sy, sw, sh, 3); c.stroke(); c.setLineDash([]);
      if (on || k > 0) {
        // thick paint, brushed across from the left
        const edge = sx - 6 + (sw + 12) * U.easeOut(k);
        c.save(); c.beginPath(); c.moveTo(sx - 2, sy - 2);
        for (let yy = sy - 2; yy <= sy + sh + 2; yy += 6) c.lineTo(edge + Math.sin(yy * 0.55 + i) * 4, yy);
        c.lineTo(sx - 2, sy + sh + 2); c.closePath(); c.clip();
        c.fillStyle = q.col; PZ.rr(c, sx, sy, sw, sh, 3); c.fill();
        c.strokeStyle = U.shade(q.col, 0.22); c.lineWidth = 2.4; c.lineCap = 'round';
        for (const yy of [10, 26, 44, 62]) { c.beginPath(); c.moveTo(sx + 6, sy + yy); c.quadraticCurveTo(sx + 30, sy + yy + 3, sx + 54, sy + yy - 1); c.stroke(); }
        c.strokeStyle = U.shade(q.col, -0.12); c.lineWidth = 1.4;
        for (const yy of [18, 35, 53, 70]) { c.beginPath(); c.moveTo(sx + 8, sy + yy); c.quadraticCurveTo(sx + 30, sy + yy - 2, sx + 52, sy + yy + 1); c.stroke(); }
        c.restore();
      }
      PZ.text(c, q.name, 0, h / 2 - 20, { size: 15, weight: 900, maxW: w - 8 });
      // a little tick once it is done
      const tk = U.smooth(0.72, 1, k);
      if (tk > 0) {
        const s = tk * (1 + 0.3 * Math.sin(tk * Math.PI)), tx = w / 2 - 15, ty = -h / 2 + 14;
        c.save(); c.translate(tx, ty); c.scale(s, s);
        c.fillStyle = 'rgba(60,40,20,0.22)'; c.beginPath(); c.arc(0.8, 1.2, 11, 0, 7); c.fill();
        c.fillStyle = '#4f8a5c'; c.beginPath(); c.arc(0, 0, 11, 0, 7); c.fill();
        c.strokeStyle = '#fffaf1'; c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round';
        c.beginPath(); c.moveTo(-5, 0.5); c.lineTo(-1.4, 4.2); c.lineTo(5.4, -3.8); c.stroke();
        c.restore();
      }
      // masking tape holding it to the wall
      c.fillStyle = 'rgba(236,218,170,0.86)'; c.save(); c.translate(0, -h / 2); c.rotate(-0.06); c.fillRect(-15, -7, 30, 13); c.restore();
      c.restore();
    }
    function bowlPaint(c, t) {
      const p = pool;
      if (!p || p.lev <= 0.01) return;
      const { x, y, ix, iy } = BOWL, lev = p.lev, cy = y + 4 + (1 - lev) * 9;
      const rx = ix * (0.46 + 0.54 * lev), ry = iy * (0.46 + 0.54 * lev);
      const A = J[p.cols[0]].col, two = p.cols.length > 1, B = two ? J[p.cols[1]].col : A;
      c.save();
      c.globalAlpha = U.clamp(lev * 5, 0, 1); // a thin film comes and goes softly
      c.beginPath(); c.ellipse(x, y, ix + 3, iy + 3, 0, 0, 7); c.clip();
      c.beginPath(); c.ellipse(x, cy, rx, ry, 0, 0, 7); c.clip();
      c.fillStyle = two ? U.mix(A, p.col, p.mix) : A; c.fillRect(x - ix - 6, y - iy - 6, ix * 2 + 12, iy * 2 + 12);
      // the second colour swirling in until the two are one
      if (two && p.t > HIT && p.mix < 1) {
        c.lineCap = 'round'; c.lineJoin = 'round';
        for (const arm of [0, Math.PI]) {
          c.strokeStyle = U.mix(B, p.col, p.mix); c.lineWidth = 15 * (1 - p.mix * 0.7);
          c.beginPath();
          for (let k = 0; k <= 40; k++) {
            const f = k / 40, a = f * 7.5 + p.spin + arm;
            c.lineTo(x + Math.cos(a) * rx * f * 0.96, cy + Math.sin(a) * ry * f * 0.96);
          }
          c.stroke();
        }
      }
      // rinse water, clear and rippling
      if (p.water > 0) {
        c.fillStyle = `rgba(214,233,243,${(0.92 * p.water).toFixed(3)})`; c.fillRect(x - ix - 6, y - iy - 6, ix * 2 + 12, iy * 2 + 12);
        c.strokeStyle = `rgba(255,255,255,${(0.75 * p.water).toFixed(3)})`; c.lineWidth = 1.6;
        const film = c.globalAlpha;
        for (let k = 0; k < 3; k++) { const f = ((t * 0.7 + k / 3) % 1); c.globalAlpha = film * (1 - f); c.beginPath(); c.ellipse(x, cy, rx * f, ry * f, 0, 0, 7); c.stroke(); }
        c.globalAlpha = film;
      }
      // the wet shine on top
      c.fillStyle = 'rgba(255,255,255,0.24)'; c.beginPath(); c.ellipse(x - rx * 0.32, cy - ry * 0.4, rx * 0.34, ry * 0.17, -0.1, 0, 7); c.fill();
      c.restore();
    }
    // the mixing brush, in the bowl while a mix is stirred
    function brush(c) {
      const p = pool;
      if (!p || p.cols.length < 2 || p.sent || p.rinsing) return;
      const a = U.smooth(HIT - 0.06, HIT + 0.12, p.t) * (1 - U.smooth(SEND - 0.14, SEND, p.t));
      if (a <= 0.02) return;
      const ang = p.spin * 1.1, tx = BOWL.x + Math.cos(ang) * 46, ty = BOWL.y + 2 + Math.sin(ang) * 17;
      c.save(); c.globalAlpha = a; c.translate(tx, ty); c.rotate(0.5 + Math.cos(ang) * 0.1);
      c.fillStyle = '#c98f55'; PZ.rr(c, -3.4, -112, 6.8, 88, 3); c.fill();
      c.strokeStyle = EDGE; c.lineWidth = 1; c.stroke();
      c.fillStyle = 'rgba(255,240,215,0.5)'; c.fillRect(-1.6, -108, 1.6, 80);
      c.fillStyle = '#b9bcc0'; PZ.rr(c, -5, -28, 10, 11, 1.5); c.fill(); c.stroke();
      c.fillStyle = U.mix(J[p.cols[1]].col, p.col, p.mix);
      c.beginPath(); c.moveTo(-5, -18); c.quadraticCurveTo(-7, -4, 0, 2); c.quadraticCurveTo(7, -4, 5, -18); c.closePath(); c.fill(); c.stroke();
      c.restore();
    }
    function jarPose(j) {
      const h = HOME[j];
      if (held && held.j === j) return { x: held.x, y: held.y, a: 0, k: 1.05, up: true };
      const tr = trip[j];
      if (tr) {
        const side = h.x < BOWL.x ? -1 : 1, px = BOWL.x + side * 90, py = BOWL.y - 62, tilt = -side * 1.16;
        const f = tr.from || h, u = tr.t;
        if (u < 0.24) { const e = U.easeOut(u / 0.24); return { x: U.lerp(f.x, px, e), y: U.lerp(f.y, py, e), a: tilt * e, k: 1, up: true }; }
        if (u < 0.62) return { x: px, y: py, a: tilt, k: 1, up: true, pouring: u };
        const e = U.smooth(0.62, DUR, u);
        return { x: U.lerp(px, h.x, e), y: U.lerp(py, h.y, e), a: tilt * (1 - e), k: 1, up: true };
      }
      const a = nudge[j] > 0 ? Math.sin(nudge[j] * 34) * nudge[j] * 0.34 : 0;
      return { x: h.x + off[j].x, y: h.y + off[j].y, a, k: 1, up: Math.abs(off[j].x) + Math.abs(off[j].y) > 3 };
    }
    function ribbon(c, j, pose) {
      const rise = U.smooth(0.24, 0.3, pose.pouring) * (1 - U.smooth(0.56, 0.62, pose.pouring));
      if (rise <= 0) return;
      const mouth = 56, mx = pose.x + Math.sin(pose.a) * mouth, my = pose.y - Math.cos(pose.a) * mouth;
      const ex = U.lerp(mx, BOWL.x + (mx < BOWL.x ? -14 : 14), 0.6), ey = BOWL.y + 2;
      const col = J[j].col;
      c.lineCap = 'round';
      c.strokeStyle = 'rgba(52,36,28,0.2)'; c.lineWidth = 8.4 * rise; c.beginPath(); c.moveTo(mx, my); c.quadraticCurveTo(mx + (ex - mx) * 0.3, my + 6, ex, ey); c.stroke();
      c.strokeStyle = col; c.lineWidth = 6.6 * rise; c.beginPath(); c.moveTo(mx, my); c.quadraticCurveTo(mx + (ex - mx) * 0.3, my + 6, ex, ey); c.stroke();
    }
    function shadowUnder(c, x) { c.fillStyle = 'rgba(60,40,20,0.2)'; c.beginPath(); c.ellipse(x + 3, JAR_Y + 49, 36, 6, 0, 0, 7); c.fill(); }
    // the little jug that rinses the bowl
    function jug(c) {
      const u = jugT < 0 ? 0 : jugT, lean = jugT < 0 ? 0 : U.smooth(0, 0.28, u) * (1 - U.smooth(1.0, 1.32, u));
      const x = U.lerp(JUG.x, 286, lean), y = U.lerp(JUG.y, 238, lean), a = -1.25 * lean;
      if (lean < 0.05) { c.fillStyle = 'rgba(60,40,20,0.22)'; c.beginPath(); c.ellipse(JUG.x + 3, JUG.y + 31, 26, 6, 0, 0, 7); c.fill(); }
      if (lean > 0.9) {
        const f = (lean - 0.9) * 10, sx = x + Math.sin(a) * 44 - Math.cos(a) * 15, sy = y - Math.cos(a) * 44 - Math.sin(a) * 15;
        c.lineCap = 'round'; c.strokeStyle = 'rgba(190,220,236,0.92)'; c.lineWidth = 5 * f;
        c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(sx - 16, sy + 8, BOWL.x + 38, BOWL.y + 4); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,0.65)'; c.lineWidth = 1.4 * f; c.stroke();
      }
      c.save(); c.translate(x, y); c.rotate(a);
      // the handle, the body with its blue rim, and the spout
      c.strokeStyle = '#3f5fa8'; c.lineWidth = 5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(22, -18); c.bezierCurveTo(40, -16, 38, 14, 23, 12); c.stroke();
      c.fillStyle = '#f6f2e8'; c.beginPath(); c.moveTo(-22, -32); c.lineTo(22, -32); c.lineTo(26, 26); c.quadraticCurveTo(26, 31, 21, 31); c.lineTo(-21, 31); c.quadraticCurveTo(-26, 31, -26, 26); c.closePath(); c.fill();
      c.strokeStyle = EDGE; c.lineWidth = 1.2; c.stroke();
      c.fillStyle = '#f6f2e8'; c.beginPath(); c.moveTo(-22, -32); c.lineTo(-32, -38); c.lineTo(-20, -18); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#3f5fa8'; PZ.rr(c, -23.5, -35, 47, 6, 3); c.fill();
      c.fillStyle = 'rgba(214,233,243,0.9)'; c.beginPath(); c.ellipse(0, 6, 15, 12, 0, 0, 7); c.fill();
      c.fillStyle = '#3f5fa8'; PZ.text(c, 'water', 0, 6, { size: 11, weight: 800, color: '#3f5fa8', maxW: 30 });
      c.restore();
    }
    function tag(c) {
      const p = pool;
      if (!p || !p.name || p.lev <= 0.05) return;
      const a = U.clamp(p.lev * 3, 0, 1) * (1 - p.water);
      if (a <= 0.02) return;
      c.save(); c.globalAlpha = a;
      c.font = PZ.font(14, 800);
      const w = Math.min(320, c.measureText(p.name).width + 26), x = BOWL.x - w / 2, y = 376;
      c.fillStyle = 'rgba(60,40,20,0.2)'; PZ.rr(c, x + 1.6, y + 2.4, w, 26, 6); c.fill();
      c.fillStyle = PZ.PAPER; PZ.rr(c, x, y, w, 26, 6); c.fill();
      c.strokeStyle = 'rgba(150,125,95,0.4)'; c.lineWidth = 0.9; c.stroke();
      PZ.text(c, p.name, BOWL.x, y + 13.5, { size: 14, weight: 800, maxW: w - 12 });
      c.restore();
    }
    const nextPair = () => {
      const open = cards.map((q, i) => (filled[i] ? -1 : i)).filter((i) => i >= 0);
      if (!open.length) return null;
      const i = bowl === null ? open[0] : open.find((k) => cards[k].a === bowl || cards[k].b === bowl);
      return i === undefined ? { i: open[0], rinse: true } : { i };
    };

    const sc = {
      puzzle: true, indoor: true, steps,
      crop: { x: 0, y: 34, w: 360, h: 360 },
      decor(c) { wall(c); table(c); bowlArt(c); tray(c); },
      draw(c, t, still) {
        for (let i = 0; i < 4; i++) card(c, i, t, still);
        if (!still || bowl !== null) bowlPaint(c, t);
        const poses = J.map((_, j) => (still ? { x: HOME[j].x, y: HOME[j].y, a: 0, k: 1 } : jarPose(j)));
        J.forEach((_, j) => { if (!poses[j].up) shadowUnder(c, poses[j].x); });
        if (still) { jug(c); J.forEach((jar, j) => jarArt(c, jar, poses[j].x, poses[j].y, 0)); }
        else {
          jug(c);
          brush(c);
          J.forEach((jar, j) => { if (!poses[j].up) jarArt(c, jar, poses[j].x, poses[j].y, poses[j].a, poses[j].k); });
          J.forEach((jar, j) => { const p = poses[j]; if (p.pouring) ribbon(c, j, p); if (p.up) jarArt(c, jar, p.x, p.y, p.a, p.k); });
          tag(c);
          for (const b of blobs) {
            const e = U.easeOut(b.t), tx = CARD.xs[b.i], ty = CARD.y - 16, x = U.lerp(BOWL.x, tx, e), y = U.lerp(BOWL.y, ty, e) - Math.sin(b.t * Math.PI) * 26, s = 13 - b.t * 3;
            c.fillStyle = 'rgba(52,36,28,0.2)'; c.beginPath(); c.arc(x + 1.2, y + 1.6, s + 0.6, 0, 7); c.fill();
            c.fillStyle = b.col; c.beginPath(); c.arc(x, y, s, 0, 7); c.fill();
            c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); c.ellipse(x - s * 0.3, y - s * 0.36, s * 0.3, s * 0.17, -0.6, 0, 7); c.fill();
          }
          if (hintT > 0 && !solved()) {
            const h = nextPair();
            if (h) {
              const q = cards[h.i];
              PZ.glow(c, CARD.xs[h.i], CARD.y - 16, 44, t);
              for (const j of [q.a, q.b]) if (j !== bowl) PZ.glow(c, HOME[j].x, HOME[j].y + 18, 36, t);
              if (bowl !== null) PZ.glow(c, BOWL.x, BOWL.y, 60, t);
            }
          }
          if (held) { const p = poses[held.j]; if (Math.hypot(p.x - HOME[held.j].x, p.y - HOME[held.j].y) > 12) PZ.glow(c, BOWL.x, BOWL.y, 54, t); }
        }
        // all four done: the cards catch the light
        if (solved()) {
          if (still) { for (let i = 0; i < 4; i++) glint(c, CARD.xs[i] - 17, CARD.y - 14 + (i % 2) * 22, 7, 0.95); return; }
          const k = shine * 1.1, i = Math.floor(k) % 4;
          glint(c, CARD.xs[i] - 15, CARD.y - 30 + (i % 2) * 32, 8 * Math.sin((k % 1) * Math.PI), 0.9);
        }
      },
      step(dt) {
        hintT -= dt;
        // by the clock rather than by frames, so a slow frame never holds it up
        if (pend && performance.now() >= pend.at) flush();
        if (held) { held.x = PZ.approach(held.x, held.tx, dt, 24); held.y = PZ.approach(held.y, held.ty, dt, 24); }
        for (let j = 0; j < 4; j++) {
          nudge[j] = Math.max(0, nudge[j] - dt);
          off[j].x = PZ.approach(off[j].x, 0, dt, 12); off[j].y = PZ.approach(off[j].y, 0, dt, 12);
          if (trip[j]) { trip[j].t += dt; if (trip[j].t >= DUR) trip[j] = null; }
        }
        const p = pool;
        if (p) {
          p.t += dt;
          if (p.cols.length < 2) {
            p.spin += dt * 0.6;
            if (p.t > HIT) p.lev = PZ.approach(p.lev, 0.62, dt, 7);
          } else {
            p.spin += dt * 3.4;
            p.mix = U.smooth(HIT, SEND - 0.08, p.t);
            if (p.i >= 0 && p.t >= SEND) send(p);
            if (p.i < 0 && p.t >= RINSE && !p.rinsing) { p.rinsing = true; jugT = 0; fx.sound('nope'); }
            if (p.rinsing) p.water = U.smooth(RINSE + 0.3, RINSE + 0.8, p.t);
            // the paint goes up to its card, the rinse water drains away
            if (p.sent || (p.rinsing && p.t > RINSE + 1)) { p.lev -= dt / 0.36; if (p.lev <= 0) pool = null; }
            else if (p.t > HIT) p.lev = PZ.approach(p.lev, 1, dt, 7);
          }
        }
        if (jugT >= 0) { jugT += dt; if (jugT > 1.34) jugT = -1; }
        for (let k = blobs.length - 1; k >= 0; k--) {
          const b = blobs[k];
          b.t += dt / 0.36;
          if (b.t >= 1) {
            blobs.splice(k, 1); running[b.i] = true; fx.sound('chime');
            for (let n = 0; n < 7; n++) fx.sparkle(CARD.xs[b.i] + (Math.random() - 0.5) * 60, CARD.y - 16 + (Math.random() - 0.5) * 70);
          }
        }
        for (let i = 0; i < 4; i++) if (running[i] && fillK[i] < 1) fillK[i] = Math.min(1, fillK[i] + dt / 0.46);
        if (solved()) shine += dt;
      },
      down(x, y) {
        if (held || solved()) return;
        const j = HOME.findIndex((h) => Math.abs(x - h.x) <= JAR_W / 2 + 6 && y >= h.y - JAR_H / 2 - 12 && y <= h.y + JAR_H / 2 + 12);
        if (j < 0) return;
        held = { j, x: HOME[j].x, y: HOME[j].y, tx: HOME[j].x, ty: HOME[j].y, sx: x, sy: y, moved: false };
      },
      move(x, y) {
        if (!held) return;
        if (!held.moved && PZ.dist(x, y, held.sx, held.sy) < 12) return;
        held.moved = true; held.tx = x; held.ty = y - PZ.LIFT;
      },
      up(x, y) {
        if (!held) return;
        const h = held, j = h.j; held = null;
        const dx = x, dy = y - PZ.LIFT;
        const over = h.moved && Math.abs(dx - BOWL.x) <= BOWL.rx + 24 && Math.abs(dy - BOWL.y) <= BOWL.ry + 62;
        if (h.moved && !over) { off[j].x = h.x - HOME[j].x; off[j].y = h.y - HOME[j].y; fx.sound('nope'); return; }
        if (bowl === j) {
          // it is in the bowl already: the jar just tips back
          off[j].x = h.x - HOME[j].x; off[j].y = h.y - HOME[j].y;
          nudge[j] = 0.45; fx.sound('nope');
          return;
        }
        pour(j, h.moved ? { x: h.x, y: h.y } : null);
      },
      cancel() { if (held) { off[held.j].x = held.x - HOME[held.j].x; off[held.j].y = held.y - HOME[held.j].y; held = null; } },
      progress: () => paid / steps,
      solved,
      hint() { if (!solved()) hintT = 3.5; },
      save() { flush(); return { f: filled.map((v) => (v ? 1 : 0)), b: bowl }; },
      load(st) {
        if (!st || typeof st !== 'object' || !Array.isArray(st.f) || st.f.length !== 4) return;
        const b = st.b === null || st.b === undefined ? null : Math.round(+st.b);
        if (b !== null && !(b >= 0 && b < 4)) return;
        st.f.forEach((v, i) => { filled[i] = !!v; running[i] = !!v; fillK[i] = v ? 1 : 0; });
        paid = filled.filter(Boolean).length;
        bowl = b;
        pool = b === null ? null : { cols: [b], t: 9, lev: 0.62, spin: 0, mix: 0, water: 0, i: -1, name: J[b].name + ' +' };
      },
      solveAll() {
        pend = null; bowl = null; pool = null; blobs.length = 0; paid = steps;
        for (let i = 0; i < 4; i++) { filled[i] = true; running[i] = true; fillK[i] = 1; }
      },
      // finger positions: a tap on each jar, two for every card still empty
      debugPlan() {
        const plan = [], tap = (j) => plan.push({ tap: [HOME[j].x, HOME[j].y + 14] });
        const left = cards.filter((_, i) => !filled[i]);
        if (bowl !== null) {
          const k = left.findIndex((q) => q.a === bowl || q.b === bowl);
          if (k >= 0) { const q = left.splice(k, 1)[0]; tap(q.a === bowl ? q.b : q.a); }
          else tap((bowl + 1) % 4); // no card wants this one: any other jar rinses it
        }
        for (const q of left) { tap(q.a); tap(q.b); }
        return plan;
      },
      // for the tests: the cards and what they take
      debugCards: () => cards.map((q) => `${q.name} = ${J[q.a].name} + ${J[q.b].name}`),
    };
    Object.defineProperty(sc, 'fx', { get: () => fx, set: (v) => { fx = v; } });
    return sc;
  }

  Object.assign(SCENES.KINDS, { mix });
})();
