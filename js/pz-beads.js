'use strict';
// String the beads: a making job at Button & Bead (and in the puzzle room).
// A thread lies on a velvet tray with twelve places along it. The first few
// beads are on already and show the pattern: two, three or four beads that
// repeat. A box below holds six kinds of bead, each with a shape and a colour
// of its own. Drag the next bead from the box to the next place on the thread
// (only that place takes one, so there is never a gap): the right bead clicks
// on with a little bounce, any other glides back to the box.
// opts.what: undefined (a necklace on a velvet tray), 'sequins' (a row round the neck of a costume), 'bracelet' (twelve
// places round a little cushion), 'collar' (a cat's collar with a buckle) or
// 'mane' (ribbons along the plait in a pony's mane, out of a wooden saddle box).
//   node test/run.mjs puzzle js/pz-beads.js beads --seeds 30 [--opts '{"what":"bracelet"}']

(() => {
  const W = 360, N = 12;
  const INK2 = PZ.INK2;
  // the bead box: six compartments, three by two
  const TRAY = { x: 10, y: 420, w: 340, h: 170 };
  const CELLS = [];
  for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) CELLS.push({ x: 18 + i * 110, y: 428 + j * 80, w: 104, h: 74, cx: 70 + i * 110, cy: 465 + j * 80 });
  const HELD = 48;       // a bead in the hand is drawn this big
  const NEAR = 34;       // let go this close to the next place, a bead goes on
  const EDGE = 'rgba(52,36,28,0.5)';

  // every kind is a shape and a colour, paired afresh for each layout, so the
  // shape alone always tells the kinds apart
  const SHAPES = ['round', 'cube', 'star', 'heart', 'tube', 'flower', 'disc'];
  const COLOURS = ['#e2574c', '#5d7fd8', '#f2c84b', '#ee8db0', '#5fae6e', '#a98bd9', '#45b0ad', '#ef9a4c'];
  // these follow the thread round; the others stay upright, so they read at a glance
  const TURNS = { cube: true, tube: true, disc: true };

  function beadPath(c, shape, r) {
    c.beginPath();
    if (shape === 'round') c.arc(0, 0, r, 0, 7);
    else if (shape === 'cube') c.roundRect(-r * 0.84, -r * 0.84, r * 1.68, r * 1.68, r * 0.3);
    else if (shape === 'star') {
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5, d = i % 2 ? r * 0.52 : r * 1.1;
        const x = Math.cos(a) * d, y = Math.sin(a) * d + r * 0.08;
        if (i) c.lineTo(x, y); else c.moveTo(x, y);
      }
      c.closePath();
    } else if (shape === 'heart') {
      c.moveTo(0, r * 0.95);
      c.bezierCurveTo(-r * 1.55, -r * 0.02, -r * 0.7, -r * 1.22, 0, -r * 0.42);
      c.bezierCurveTo(r * 0.7, -r * 1.22, r * 1.55, -r * 0.02, 0, r * 0.95);
      c.closePath();
    } else if (shape === 'tube') c.roundRect(-r * 1.08, -r * 0.6, r * 2.16, r * 1.2, r * 0.42);
    else if (shape === 'flower') {
      for (let k = 0; k < 5; k++) {
        const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5, px = Math.cos(a) * r * 0.52, py = Math.sin(a) * r * 0.52;
        c.moveTo(px + r * 0.5, py); c.arc(px, py, r * 0.5, 0, 7);
      }
    } else c.ellipse(0, 0, r * 0.46, r * 1.02, 0, 0, 7); // a disc: flat, across the thread
  }
  // a ribbon tied in a bow: two tails, two loops and a knot in the middle in
  // the bead's own shape, so the shape tells the kinds apart as well as the colour
  function ribbon(c, kd, x, y, s, a) {
    const r = s / 2, col = kd.col, deep = U.shade(col, -0.24), pale = U.shade(col, 0.34);
    c.save(); c.translate(x, y); c.rotate(a);
    c.lineJoin = 'round'; c.lineWidth = Math.max(0.8, s * 0.035); c.strokeStyle = EDGE;
    for (const sd of [-1, 1]) {
      c.fillStyle = deep;
      c.beginPath(); c.moveTo(sd * r * 0.12, r * 0.08);
      c.quadraticCurveTo(sd * r * 0.62, r * 0.62, sd * r * 0.8, r * 1.3);
      c.lineTo(sd * r * 0.42, r * 1.08); c.lineTo(sd * r * 0.22, r * 1.36);
      c.quadraticCurveTo(sd * r * 0.2, r * 0.7, -sd * r * 0.08, r * 0.1);
      c.closePath(); c.fill(); c.stroke();
    }
    for (const sd of [-1, 1]) {
      const g = c.createLinearGradient(0, -r, 0, r);
      g.addColorStop(0, pale); g.addColorStop(0.55, col); g.addColorStop(1, deep);
      c.fillStyle = g;
      c.beginPath(); c.moveTo(0, -r * 0.14);
      c.bezierCurveTo(sd * r * 0.5, -r * 0.98, sd * r * 1.26, -r * 0.86, sd * r * 1.24, -r * 0.04);
      c.bezierCurveTo(sd * r * 1.24, r * 0.66, sd * r * 0.56, r * 0.62, 0, r * 0.14);
      c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(52,36,28,0.28)'; c.beginPath(); c.moveTo(sd * r * 0.3, 0); c.quadraticCurveTo(sd * r * 0.62, -r * 0.2, sd * r * 0.88, -r * 0.16); c.moveTo(sd * r * 0.3, r * 0.08); c.quadraticCurveTo(sd * r * 0.6, r * 0.3, sd * r * 0.84, r * 0.26); c.stroke();
      c.strokeStyle = EDGE;
    }
    c.restore();
  }
  // one bead, s units across at x, y; a = the direction of the thread there
  function bead(c, kd, x, y, s, a = 0, hole = false) {
    if (kd.ribbon) { ribbon(c, kd, x, y, s, a); kd = kd.knot; s *= 0.64; hole = false; }
    const r = s / 2, col = kd.col, rot = TURNS[kd.shape] ? a : 0;
    c.save(); c.translate(x, y); c.rotate(rot);
    // the light comes from the top left however the bead is turned
    const ca = Math.cos(-rot), sa = Math.sin(-rot);
    const g = c.createLinearGradient(-r * ca + r * sa, -r * sa - r * ca, r * ca - r * sa, r * sa + r * ca);
    g.addColorStop(0, U.shade(col, 0.45)); g.addColorStop(0.5, col); g.addColorStop(1, U.shade(col, -0.26));
    beadPath(c, kd.shape, r);
    c.fillStyle = g; c.fill();
    c.strokeStyle = EDGE; c.lineWidth = Math.max(0.9, s * 0.045); c.stroke();
    if (kd.shape === 'tube') {
      c.strokeStyle = 'rgba(40,25,15,0.2)'; c.lineWidth = Math.max(1, s * 0.06);
      c.beginPath(); c.moveTo(-r * 0.58, -r * 0.6); c.lineTo(-r * 0.58, r * 0.6); c.moveTo(r * 0.58, -r * 0.6); c.lineTo(r * 0.58, r * 0.6); c.stroke();
    } else if (kd.shape === 'flower') {
      c.fillStyle = '#fff3cf'; c.beginPath(); c.arc(0, 0, r * 0.3, 0, 7); c.fill();
      c.strokeStyle = EDGE; c.lineWidth = Math.max(0.8, s * 0.035); c.stroke();
    } else if (kd.shape === 'disc') {
      c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = Math.max(1, s * 0.06);
      c.beginPath(); c.moveTo(0, -r * 0.84); c.lineTo(0, r * 0.84); c.stroke();
    } else if (kd.shape === 'cube') {
      c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = Math.max(0.9, s * 0.04);
      c.beginPath(); c.roundRect(-r * 0.56, -r * 0.56, r * 1.12, r * 1.12, r * 0.2); c.stroke();
    }
    if (hole && kd.shape === 'round') {
      c.fillStyle = 'rgba(40,25,15,0.45)'; c.beginPath(); c.arc(0, 0, r * 0.18, 0, 7); c.fill();
    }
    c.restore();
    c.fillStyle = 'rgba(255,255,255,0.7)';
    c.beginPath(); c.ellipse(x - r * 0.3, y - r * 0.34, r * 0.24, r * 0.13, -0.6, 0, 7); c.fill();
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

  // a curve u -> [x, y], sampled, with n places spread evenly along its length from f0 to f1
  function along(fn, f0, f1, n) {
    const pts = [];
    for (let i = 0; i <= 400; i++) pts.push(fn(i / 400));
    const len = [0];
    for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = len[len.length - 1], places = [];
    let i = 1;
    for (let k = 0; k < n; k++) {
      const want = total * (f0 + ((f1 - f0) * (k + 0.5)) / n);
      while (i < len.length - 1 && len[i] < want) i++;
      const f = (want - len[i - 1]) / (len[i] - len[i - 1] || 1), [ax, ay] = pts[i - 1], [bx, by] = pts[i];
      places.push({ x: ax + (bx - ax) * f, y: ay + (by - ay) * f, a: Math.atan2(by - ay, bx - ax) });
    }
    return { pts, places };
  }

  // the shapes the thread can take: where its twelve places are, how big a
  // bead is on it, a point inside it (the little arrow points away from it),
  // and the square used for pictures
  const RING = { x: 180, y: 226, r: 108 };
  const COLLAR = { x: 180, y: 106.3, r: 169.7, from: 165.1, to: 14.9 };
  const collarAt = (u) => { const th = ((COLLAR.from + (COLLAR.to - COLLAR.from) * u) * Math.PI) / 180; return [COLLAR.x + COLLAR.r * Math.cos(th), COLLAR.y + COLLAR.r * Math.sin(th)]; };
  // the plait down a pony's neck, from behind the ears to the shoulder
  const maneAt = (u) => { const v = 1 - u; return [v * v * 100 + 2 * v * u * 250 + u * u * 342, v * v * 104 + 2 * v * u * 98 + u * u * 358]; };
  const PONIES = [['#b98354', '#4a3226'], ['#a9693f', '#3b2a22'], ['#a7a29a', '#4f4a44'], ['#c9a066', '#6b4a32']];
  const STRINGS = {
    necklace: {
      size: 34, inside: [180, 150], crop: { x: 0, y: 40, w: 360, h: 360 },
      make: () => along((u) => [44 + 272 * u, 98 + 240 * (1 - Math.pow(Math.abs(2 * u - 1), 2.2))], 0.035, 0.965, N),
    },
    bracelet: {
      size: 34, inside: [RING.x, RING.y], crop: { x: 20, y: 66, w: 320, h: 320 },
      make: () => {
        const pts = [], places = [];
        for (let i = 0; i <= 120; i++) { const a = (i / 120) * Math.PI * 2; pts.push([RING.x + RING.r * Math.cos(a), RING.y + RING.r * Math.sin(a)]); }
        // round from the clasp at the top, the way a clock goes
        for (let i = 0; i < N; i++) { const a = ((-75 + i * 30) * Math.PI) / 180; places.push({ x: RING.x + RING.r * Math.cos(a), y: RING.y + RING.r * Math.sin(a), a: a + Math.PI / 2 }); }
        return { pts, places };
      },
    },
    collar: {
      size: 26, inside: [COLLAR.x, COLLAR.y], crop: { x: 0, y: 60, w: 360, h: 360 },
      make: () => along(collarAt, 0.13, 0.9, N),
    },
    mane: {
      size: 27, inside: [620, 220], crop: { x: 0, y: 44, w: 360, h: 360 },
      make: () => along(maneAt, 0.03, 0.985, N),
    },
    // a row of sequins round the neck of a stage costume on its dress form
    sequins: {
      size: 34, inside: [180, 150], crop: { x: 0, y: 40, w: 360, h: 360 },
      make: () => along((u) => [44 + 272 * u, 98 + 240 * (1 - Math.pow(Math.abs(2 * u - 1), 2.2))], 0.035, 0.965, N),
    },
  };

  // the smallest period of a row of beads read straight through
  const period = (s) => { for (let q = 1; q < s.length; q++) if (s.every((v, i) => i + q >= s.length || v === s[i + q])) return q; return s.length; };
  // the smallest period of a pattern that goes round and round
  const cyclic = (m) => { for (let q = 1; q < m.length; q++) if (m.length % q === 0 && m.every((v, i) => v === m[(i + q) % m.length])) return q; return m.length; };
  // a pattern of two, three or four beads (kinds 0..5), and how many are on
  // already: always enough to show the whole pattern and a little more
  function makePattern(r) {
    for (let tries = 0; tries < 200; tries++) {
      const p = 2 + ((r() * 3) | 0);
      const pool = PZ.shuffle(r, [0, 1, 2, 3, 4, 5]).slice(0, p), m = [];
      for (let i = 0; i < p; i++) m.push(i < 2 || r() < 0.6 ? pool[i] : pool[(r() * i) | 0]);
      if (new Set(m).size < 2 || cyclic(m) < p) continue;
      const filled = p === 2 ? 4 + ((r() * 2) | 0) : p === 3 ? 5 + ((r() * 2) | 0) : 6;
      if (period(Array.from({ length: filled }, (_, i) => m[i % p])) < p) continue;
      return { motif: m, filled };
    }
    return { motif: [0, 1], filled: 4 };
  }

  function beads(S) {
    const r = S.r, what = STRINGS[S.opts && S.opts.what] ? S.opts.what : 'necklace', V = STRINGS[what];
    const shapes = PZ.shuffle(r, SHAPES.slice()).slice(0, 6), cols = PZ.shuffle(r, COLOURS.slice()).slice(0, 6);
    const kinds = shapes.map((shape, i) => ({ shape, col: cols[i] }));
    // in a mane every kind is a ribbon, and the kind's shape is the knot in it
    if (what === 'mane') for (const kd of kinds) { kd.ribbon = true; kd.knot = { shape: kd.shape, col: U.shade(kd.col, 0.2) }; }
    const kindIn = PZ.shuffle(r, [0, 1, 2, 3, 4, 5]);           // kindIn[compartment] = kind
    const cellOf = kindIn.map((_, k) => kindIn.indexOf(k));   // cellOf[kind] = compartment
    const { motif, filled } = makePattern(r);
    const need = (i) => motif[i % motif.length];
    const { pts, places: P } = V.make();
    const s = V.size, steps = N - filled;
    const velvet = U.pick(r, ['#34575a', '#4a3a52', '#2f4a3c']);
    const pony = what === 'mane' ? U.pick(r, PONIES) : null;
    // a little heap in every compartment, the clearest one in front
    const heaps = CELLS.map(() => {
      const out = [];
      for (let k = 0; k < 6; k++) out.push({ dx: (r() - 0.5) * 70, dy: (r() - 0.5) * 38, s: 21 + r() * 5, a: r() * 6.28 });
      out.push({ dx: 0, dy: 2, s: 32, a: 0 });
      return out;
    });
    // which way is "outside" at each place, for the little arrow
    const out = P.map((p) => { const dx = p.x - V.inside[0], dy = p.y - V.inside[1], d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; });

    let placed = 0, held = null, hintT = 0, nudge = 0, shine = 0, fx = null;
    const pop = new Array(N).fill(1), from = new Array(N).fill(null), flying = [];
    const next = () => filled + placed;
    const solved = () => placed >= steps;

    // ---------------------------------------------------------- the table
    const poly = (c, ps, dx = 0, dy = 0) => { c.beginPath(); ps.forEach(([x, y], i) => (i ? c.lineTo(x + dx, y + dy) : c.moveTo(x + dx, y + dy))); };
    // the same line moved off sideways (d > 0 is to the right of the way it runs)
    const offset = (ps, d) => ps.map(([x, y], i) => {
      const [ax, ay] = ps[Math.max(0, i - 1)], [bx, by] = ps[Math.min(ps.length - 1, i + 1)], l = Math.hypot(bx - ax, by - ay) || 1;
      return [x - ((by - ay) / l) * d, y + ((bx - ax) / l) * d];
    });
    function wall(c) {
      const { x0, y0, x1 } = S.bleed;
      if (what === 'mane') {
        // the stable block: whitewashed boards above the stall
        c.fillStyle = '#efe6d4'; c.fillRect(x0, y0, x1 - x0, 46 - y0);
        c.fillStyle = 'rgba(120,95,65,0.14)'; for (let x = Math.floor(x0 / 30) * 30; x < x1; x += 30) c.fillRect(x, y0, 1.4, 46 - y0);
      } else if (what === 'collar') {
        // the farmhouse kitchen: painted boards
        c.fillStyle = '#b9cdb0'; c.fillRect(x0, y0, x1 - x0, 46 - y0);
        c.fillStyle = 'rgba(60,80,50,0.2)'; for (let x = Math.floor(x0 / 26) * 26; x < x1; x += 26) c.fillRect(x, y0, 1.4, 46 - y0);
      } else {
        // the shop: striped paper in dusty rose
        c.fillStyle = '#f0d6d0'; c.fillRect(x0, y0, x1 - x0, 46 - y0);
        c.fillStyle = 'rgba(205,140,140,0.2)'; for (let x = Math.floor(x0 / 18) * 18; x < x1; x += 18) c.fillRect(x, y0, 7, 46 - y0);
      }
      PZ.text(c, what === 'mane' ? 'Carry on the pattern, ribbon by ribbon' : what === 'sequins' ? 'Carry on the pattern, sequin by sequin' : 'Carry on the pattern, bead by bead', W / 2, 22, { size: 13, color: INK2, maxW: 340 });
    }
    function table(c) {
      const { x0, x1, y1 } = S.bleed, rr = U.rng(4517);
      if (what === 'mane') {
        // the stable floor, swept, with a little straw about
        c.fillStyle = '#b89c70'; c.fillRect(x0, 40, x1 - x0, y1 - 40);
        c.fillStyle = 'rgba(90,60,30,0.14)'; for (let y = 430; y < y1; y += 26) c.fillRect(x0, y, x1 - x0, 1.4);
        c.lineCap = 'round'; c.lineWidth = 1.3;
        for (let i = 0; i < 90; i++) { const x = x0 + rr() * (x1 - x0), y = 412 + rr() * (y1 - 412), a = rr() * 3.14; c.strokeStyle = `rgba(${rr() < 0.5 ? '233,201,120' : '206,168,92'},0.75)`; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * (6 + rr() * 9), y + Math.sin(a) * 3); c.stroke(); }
        return;
      }
      if (what === 'collar') {
        // a blue gingham cloth on the kitchen table
        c.fillStyle = '#f7f2e8'; c.fillRect(x0, 40, x1 - x0, y1 - 40);
        c.fillStyle = 'rgba(111,147,184,0.3)';
        for (let x = Math.floor(x0 / 28) * 28; x < x1; x += 28) c.fillRect(x, 40, 14, y1 - 40);
        for (let y = 40; y < y1; y += 28) c.fillRect(x0, y, x1 - x0, 14);
      } else {
        c.fillStyle = '#c99e6c'; c.fillRect(x0, 40, x1 - x0, y1 - 40);
        c.fillStyle = 'rgba(90,55,25,0.13)'; for (let y = 108; y < y1; y += 66) c.fillRect(x0, y, x1 - x0, 1.6);
        c.strokeStyle = 'rgba(110,70,35,0.15)'; c.lineWidth = 0.9;
        for (let i = 0; i < 90; i++) { const x = x0 + rr() * (x1 - x0), y = 44 + rr() * (y1 - 44), l = 20 + rr() * 60; c.beginPath(); c.moveTo(x, y); c.lineTo(x + l, y + (rr() - 0.5) * 2); c.stroke(); }
      }
      c.fillStyle = 'rgba(60,40,20,0.22)'; c.fillRect(x0, 40, x1 - x0, 6); // the table's back edge
    }
    // the soft nap of velvet: light and dark specks over the colour
    function nap(c, x, y, w, h, n) {
      const rr = U.rng(2203);
      for (let i = 0; i < n; i++) { c.fillStyle = rr() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'; c.fillRect(x + rr() * w, y + rr() * h, 1.5, 1.5); }
    }
    function goldRing(c, x, y, rad) {
      c.strokeStyle = '#c99a2e'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, rad, 0, 7); c.stroke();
      c.strokeStyle = '#f6d77a'; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y, rad, 3.6, 5.2); c.stroke();
    }
    function thread(c, ps) {
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 3; poly(c, ps, 0.8, 1.4); c.stroke();
      c.strokeStyle = '#f3e3c3'; c.lineWidth = 2; poly(c, ps); c.stroke();
    }
    // the costume on its dress form: deep blue velvet, gold braid at the shoulders
    function sequinBase(c) {
      c.fillStyle = 'rgba(60,40,20,0.22)'; PZ.rr(c, 19, 53, 328, 352, 22); c.fill();
      c.fillStyle = '#6e2630'; PZ.rr(c, 16, 48, 328, 352, 22); c.fill();
      c.fillStyle = 'rgba(30,8,14,0.2)'; for (let x = 28; x < 340; x += 26) c.fillRect(x, 50, 11, 348);
      c.save(); PZ.rr(c, 16, 48, 328, 352, 22); c.clip();
      const dress = () => { c.beginPath(); c.moveTo(34, 58); c.quadraticCurveTo(10, 150, 58, 260); c.quadraticCurveTo(84, 330, 66, 404); c.lineTo(294, 404); c.quadraticCurveTo(276, 330, 302, 260); c.quadraticCurveTo(350, 150, 326, 58); c.closePath(); };
      c.fillStyle = '#2b3a66'; dress(); c.fill();
      c.save(); dress(); c.clip(); nap(c, 16, 48, 328, 352, 1100); c.restore();
      c.fillStyle = 'rgba(0,0,0,0.16)'; c.beginPath(); c.moveTo(150, 330); c.quadraticCurveTo(180, 404, 170, 404); c.lineTo(190, 404); c.quadraticCurveTo(180, 404, 210, 330); c.closePath(); c.fill();
      // the neckline, cut away to the lining
      c.fillStyle = '#f0e4cc'; c.beginPath(); c.moveTo(74, 58); c.quadraticCurveTo(180, 240, 286, 58); c.closePath(); c.fill();
      c.strokeStyle = '#d8ae4e'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(74, 58); c.quadraticCurveTo(180, 240, 286, 58); c.stroke();
      c.restore();
      thread(c, pts);
    }
    function necklaceBase(c) {
      const x = 16, y = 48, w = 328, h = 352;
      c.fillStyle = 'rgba(60,40,20,0.25)'; PZ.rr(c, x + 3, y + 5, w, h, 22); c.fill();
      c.fillStyle = '#8a5a36'; PZ.rr(c, x, y, w, h, 22); c.fill();
      c.fillStyle = 'rgba(255,225,180,0.25)'; PZ.rr(c, x + 6, y + 2, w - 12, 3, 2); c.fill();
      c.save(); PZ.rr(c, x + 8, y + 8, w - 16, h - 16, 16); c.clip();
      c.fillStyle = velvet; c.fillRect(x + 8, y + 8, w - 16, h - 16);
      nap(c, x + 8, y + 8, w - 16, h - 16, 1100);
      const g = c.createLinearGradient(0, y + 8, 0, y + 40); g.addColorStop(0, 'rgba(0,0,0,0.3)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.fillRect(x + 8, y + 8, w - 16, 32);
      c.restore();
      thread(c, pts);
      // the clasp: a lobster clasp on one end, a ring on the other
      const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
      c.save(); c.translate(ax, ay - 6);
      c.fillStyle = '#e1b34a'; c.beginPath(); c.ellipse(0, -4, 5.4, 8, 0, 0, 7); c.fill();
      c.fillStyle = velvet; c.beginPath(); c.ellipse(0.6, -4, 2.4, 4.6, 0, 0, 7); c.fill();
      c.strokeStyle = '#a77d1e'; c.lineWidth = 1; c.beginPath(); c.ellipse(0, -4, 5.4, 8, 0, 0, 7); c.stroke();
      c.fillStyle = '#f6d77a'; c.beginPath(); c.ellipse(-2.6, -7, 1.2, 2.4, 0.3, 0, 7); c.fill();
      c.restore();
      goldRing(c, bx, by - 6, 5.4);
    }
    function braceletBase(c) {
      const { x, y } = RING;
      c.fillStyle = 'rgba(60,40,20,0.22)'; c.beginPath(); c.arc(x + 4, y + 7, 152, 0, 7); c.fill();
      c.fillStyle = '#efe2cf'; c.beginPath(); c.arc(x, y, 150, 0, 7); c.fill();
      // a soft linen weave
      c.save(); c.beginPath(); c.arc(x, y, 150, 0, 7); c.clip();
      c.strokeStyle = 'rgba(160,130,100,0.06)'; c.lineWidth = 1;
      for (let k = -150; k <= 150; k += 4) { c.beginPath(); c.moveTo(x + k, y - 150); c.lineTo(x + k, y + 150); c.moveTo(x - 150, y + k); c.lineTo(x + 150, y + k); c.stroke(); }
      // tufted towards a button in the middle
      c.strokeStyle = 'rgba(150,110,90,0.12)'; c.lineWidth = 1.5;
      for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; c.beginPath(); c.moveTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14); c.quadraticCurveTo(x + Math.cos(a + 0.2) * 40, y + Math.sin(a + 0.2) * 40, x + Math.cos(a) * 70, y + Math.sin(a) * 70); c.stroke(); }
      c.restore();
      c.strokeStyle = '#d9a3a6'; c.lineWidth = 6; c.beginPath(); c.arc(x, y, 147, 0, 7); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1.4; c.beginPath(); c.arc(x, y, 148, 3.4, 5.4); c.stroke();
      // the velvet groove the bracelet sits in
      c.strokeStyle = velvet; c.lineWidth = 48; c.beginPath(); c.arc(x, y, RING.r, 0, 7); c.stroke();
      c.save(); c.beginPath(); c.arc(x, y, RING.r + 24, 0, 7); c.arc(x, y, RING.r - 24, 0, 7, true); c.clip('evenodd');
      nap(c, x - 140, y - 140, 280, 280, 1100);
      c.strokeStyle = 'rgba(0,0,0,0.22)'; c.lineWidth = 6; c.beginPath(); c.arc(x, y - 2, RING.r - 21, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
      c.restore();
      dot(c, x, y, 10, '#d9a3a6'); dot(c, x - 3, y, 1.8, 'rgba(90,50,50,0.5)'); dot(c, x + 3, y, 1.8, 'rgba(90,50,50,0.5)');
      thread(c, pts);
      // the clasp at the top, between the last place and the first
      c.fillStyle = '#e1b34a'; PZ.rr(c, x - 7, y - RING.r - 5, 14, 10, 3); c.fill();
      c.strokeStyle = '#a77d1e'; c.lineWidth = 1; c.stroke();
      c.fillStyle = '#f6d77a'; c.fillRect(x - 4, y - RING.r - 3, 8, 2);
    }
    // the plait itself: a rope of hair with strands crossing it, tied off with a tuft
    function plait(c, ps, hair) {
      const pale = U.shade(hair, 0.36), step = 11;
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.strokeStyle = 'rgba(40,25,15,0.3)'; c.lineWidth = 16; poly(c, ps, 1.6, 3); c.stroke();
      c.strokeStyle = U.shade(hair, -0.2); c.lineWidth = 12; poly(c, ps); c.stroke();
      for (let i = 0, k = 0; i + 4 < ps.length; i += step, k++) {
        const [x, y] = ps[i], [ax, ay] = ps[i + 4], a = Math.atan2(ay - y, ax - x) + (k % 2 ? 0.74 : -0.74);
        c.fillStyle = k % 2 ? pale : hair; c.strokeStyle = 'rgba(25,15,10,0.5)'; c.lineWidth = 1;
        c.beginPath(); c.ellipse(x, y, 11, 5, a, 0, 7); c.fill(); c.stroke();
      }
    }
    // a pony in its stall, looking out over the half-door, quite content
    function maneBase(c) {
      const { x0, x1 } = S.bleed, rr = U.rng(3307), [coat, hair] = pony;
      const deep = U.shade(coat, -0.2), soft = U.shade(coat, 0.18), muzzle = U.shade(coat, -0.38);
      // the boards at the back of the stall, and the beam over it
      c.fillStyle = '#7a5a40'; c.fillRect(x0, 40, x1 - x0, 376);
      for (let x = Math.floor(x0 / 36) * 36; x < x1; x += 36) {
        c.fillStyle = `rgba(${rr() < 0.5 ? '255,225,180' : '40,25,15'},${(0.03 + rr() * 0.06).toFixed(3)})`; c.fillRect(x, 40, 36, 376);
        c.fillStyle = 'rgba(40,25,15,0.3)'; c.fillRect(x, 40, 1.6, 376);
      }
      c.fillStyle = '#5e4330'; c.fillRect(x0, 40, x1 - x0, 12);
      c.fillStyle = 'rgba(255,225,180,0.2)'; c.fillRect(x0, 40, x1 - x0, 1.6);
      c.fillStyle = 'rgba(30,20,10,0.25)'; c.fillRect(x0, 52, x1 - x0, 5);
      // a rack of hay on the far wall
      c.strokeStyle = 'rgba(40,25,15,0.3)'; c.lineWidth = 7; c.beginPath(); c.moveTo(258, 116); c.lineTo(346, 116); c.stroke();
      for (let i = 0; i < 60; i++) { const x = 256 + rr() * 92, y = 76 + rr() * 42, a = -1.57 + (rr() - 0.5) * 1.5; c.strokeStyle = rr() < 0.5 ? '#e4c777' : '#cdaa58'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 16, y + Math.sin(a) * 16); c.stroke(); }
      c.strokeStyle = '#8a6a4a'; c.lineWidth = 3.4; for (let x = 262; x <= 346; x += 14) { c.beginPath(); c.moveTo(x, 70); c.lineTo(x + 3, 116); c.stroke(); }
      c.strokeStyle = '#6b4a32'; c.lineWidth = 6; c.beginPath(); c.moveTo(252, 70); c.lineTo(352, 70); c.moveTo(254, 116); c.lineTo(352, 116); c.stroke();
      // an old horseshoe on a nail, for luck
      c.strokeStyle = '#a9a39a'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.arc(38, 84, 13, Math.PI * 0.85, Math.PI * 2.15); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 1.4; c.beginPath(); c.arc(38, 84, 14.6, Math.PI * 1.1, Math.PI * 1.6); c.stroke();
      c.fillStyle = '#3a2a22'; c.beginPath(); c.arc(38, 70, 2, 0, 7); c.fill();
      // the neck and the shoulder, running down behind the half-door
      const g = c.createLinearGradient(120, 280, 250, 150);
      g.addColorStop(0, deep); g.addColorStop(1, soft);
      c.fillStyle = 'rgba(30,20,10,0.25)';
      neck(c, 5, 6); c.fill();
      c.fillStyle = g; neck(c, 0, 0); c.fill();
      c.strokeStyle = 'rgba(70,45,25,0.25)'; c.lineWidth = 1.4; neck(c, 0, 0); c.stroke();
      // far ear, then the head
      ear(c, 87, 78, -0.2, deep, muzzle);
      c.fillStyle = 'rgba(30,20,10,0.18)'; head(c, 4, 5); c.fill();
      const hg = c.createLinearGradient(40, 220, 130, 110);
      hg.addColorStop(0, deep); hg.addColorStop(0.5, coat); hg.addColorStop(1, soft);
      c.fillStyle = hg; head(c, 0, 0); c.fill();
      c.strokeStyle = 'rgba(70,45,25,0.3)'; c.lineWidth = 1.4; head(c, 0, 0); c.stroke();
      // the soft muzzle, a smile and a nostril
      c.save(); head(c, 0, 0); c.clip();
      c.fillStyle = muzzle; c.globalAlpha = 0.55; c.beginPath(); c.ellipse(36, 226, 30, 25, -0.6, 0, 7); c.fill(); c.globalAlpha = 1;
      c.restore();
      c.fillStyle = 'rgba(30,20,15,0.7)'; c.beginPath(); c.ellipse(36, 208, 5, 3.4, -0.9, 0, 7); c.fill();
      c.strokeStyle = 'rgba(30,20,15,0.65)'; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(30, 232); c.quadraticCurveTo(46, 238, 62, 224); c.stroke();
      // a little white star between the eyes
      c.fillStyle = '#fbf6ec'; c.beginPath();
      for (let i = 0; i < 10; i++) { const a = -1.2 + (i * Math.PI) / 5, d = i % 2 ? 3.6 : 7.6; const x = 73 + Math.cos(a) * d, y = 151 + Math.sin(a) * d; if (i) c.lineTo(x, y); else c.moveTo(x, y); }
      c.closePath(); c.fill();
      // the eye
      c.fillStyle = '#3a2a22'; c.beginPath(); c.ellipse(EYE.x, EYE.y, 7.5, 8.5, -0.3, 0, 7); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(EYE.x - 2.4, EYE.y - 3, 2.4, 0, 7); c.fill();
      c.beginPath(); c.arc(EYE.x + 2.4, EYE.y + 2.6, 1.1, 0, 7); c.fill();
      c.strokeStyle = 'rgba(40,25,15,0.55)'; c.lineWidth = 1.6; c.beginPath(); c.arc(EYE.x, EYE.y, 11, -2.6, -0.5); c.stroke();
      // near ear and forelock
      ear(c, 112, 78, 0.16, coat, muzzle);
      c.fillStyle = hair; c.beginPath(); c.moveTo(114, 82); c.bezierCurveTo(96, 80, 82, 92, 74, 118); c.bezierCurveTo(84, 110, 88, 112, 92, 122); c.bezierCurveTo(96, 110, 102, 106, 108, 112); c.bezierCurveTo(112, 104, 118, 98, 124, 96); c.closePath(); c.fill();
      c.strokeStyle = U.shade(hair, 0.28); c.lineWidth = 1.6; c.beginPath(); c.moveTo(108, 88); c.quadraticCurveTo(92, 92, 82, 108); c.moveTo(112, 92); c.quadraticCurveTo(102, 96, 96, 110); c.stroke();
      // the short mane along the top of the neck, tufts leaning back
      const crest = offset(pts, -9);
      for (let i = 6; i < crest.length - 8; i += 8) {
        const [x, y] = crest[i], [ax, ay] = crest[i + 3];
        c.fillStyle = i % 16 ? hair : U.shade(hair, 0.14);
        c.beginPath(); c.ellipse(x, y, 8, 3.6, Math.atan2(ay - y, ax - x) - 0.9, 0, 7); c.fill();
      }
      plait(c, pts, hair);
      // the half-door across the front, in green planks with an oak rail
      c.fillStyle = 'rgba(30,20,10,0.3)'; c.fillRect(x0, 346, x1 - x0, 8);
      c.fillStyle = '#4e7b5b'; c.fillRect(x0, 352, x1 - x0, 62);
      for (let x = Math.floor(x0 / 40) * 40; x < x1; x += 40) {
        c.fillStyle = `rgba(${rr() < 0.5 ? '255,250,230' : '20,40,25'},${(0.04 + rr() * 0.06).toFixed(3)})`; c.fillRect(x, 352, 40, 62);
        c.fillStyle = 'rgba(20,40,25,0.32)'; c.fillRect(x, 352, 1.6, 62);
      }
      c.strokeStyle = 'rgba(20,40,25,0.35)'; c.lineWidth = 9; c.lineCap = 'butt'; c.beginPath(); c.moveTo(x0, 412); c.lineTo(x1, 362); c.stroke();
      c.strokeStyle = '#5f8a6a'; c.lineWidth = 7; c.beginPath(); c.moveTo(x0, 412); c.lineTo(x1, 362); c.stroke();
      c.fillStyle = '#6b4a32'; c.fillRect(x0, 348, x1 - x0, 10);
      c.fillStyle = 'rgba(255,225,180,0.3)'; c.fillRect(x0, 348, x1 - x0, 1.6);
      c.fillStyle = 'rgba(30,20,10,0.3)'; c.fillRect(x0, 412, x1 - x0, 6);
    }
    const EYE = { x: 86, y: 132 };
    function neck(c, dx, dy) {
      const { x1 } = S.bleed;
      c.beginPath(); c.moveTo(88 + dx, 92 + dy);
      c.quadraticCurveTo(252 + dx, 80 + dy, 352 + dx, 340 + dy);
      c.lineTo(x1 + 8 + dx, 350 + dy); c.lineTo(x1 + 8 + dx, 416 + dy); c.lineTo(112 + dx, 416 + dy);
      c.quadraticCurveTo(136 + dx, 290 + dy, 118 + dx, 196 + dy);
      c.closePath();
    }
    function head(c, dx, dy) {
      c.beginPath(); c.moveTo(104 + dx, 84 + dy);
      c.bezierCurveTo(84 + dx, 92 + dy, 66 + dx, 124 + dy, 52 + dx, 156 + dy);
      c.bezierCurveTo(42 + dx, 178 + dy, 22 + dx, 196 + dy, 22 + dx, 218 + dy);
      c.bezierCurveTo(22 + dx, 240 + dy, 46 + dx, 248 + dy, 62 + dx, 238 + dy);
      c.bezierCurveTo(78 + dx, 228 + dy, 92 + dx, 210 + dy, 112 + dx, 200 + dy);
      c.bezierCurveTo(142 + dx, 186 + dy, 154 + dx, 150 + dy, 140 + dx, 116 + dy);
      c.bezierCurveTo(134 + dx, 98 + dy, 122 + dx, 84 + dy, 104 + dx, 84 + dy);
      c.closePath();
    }
    function ear(c, x, y, rot, col, inner) {
      c.save(); c.translate(x, y); c.rotate(rot);
      c.fillStyle = col; c.beginPath(); c.moveTo(-10, 12); c.bezierCurveTo(-13, -8, -5, -24, 2, -32); c.bezierCurveTo(10, -22, 14, -6, 11, 12); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(70,45,25,0.3)'; c.lineWidth = 1.2; c.stroke();
      c.fillStyle = inner; c.globalAlpha = 0.55; c.beginPath(); c.moveTo(-4, 10); c.bezierCurveTo(-6, -6, -2, -16, 2, -22); c.bezierCurveTo(6, -14, 8, -4, 6, 10); c.closePath(); c.fill(); c.globalAlpha = 1;
      c.restore();
    }
    function collarBase(c) {
      // a ball of wool, and the cat asleep in a basket, waiting for nothing at all
      const wx = 70, wy = 352;
      c.fillStyle = 'rgba(60,40,20,0.2)'; c.beginPath(); c.ellipse(wx + 4, wy + 22, 30, 7, 0, 0, 7); c.fill();
      dot(c, wx, wy, 24, '#bba9df');
      c.strokeStyle = '#8f7bc0'; c.lineWidth = 1.4;
      for (const [a, b] of [[-0.6, 2.2], [0.2, 3.1], [1.2, 3.8], [2.4, 5.2], [3.4, 6]]) { c.beginPath(); c.arc(wx, wy, 18, a, b); c.stroke(); }
      c.beginPath(); c.moveTo(wx - 20, wy + 10); c.quadraticCurveTo(wx, wy - 12, wx + 20, wy + 8); c.stroke();
      c.strokeStyle = '#bba9df'; c.lineWidth = 2; c.beginPath(); c.moveTo(wx + 20, wy + 14); c.bezierCurveTo(wx + 40, wy + 30, wx + 60, wy + 10, wx + 80, wy + 36); c.stroke();
      const bx = 286, by = 364;
      c.fillStyle = 'rgba(60,40,20,0.22)'; c.beginPath(); c.ellipse(bx + 4, by + 30, 62, 12, 0, 0, 7); c.fill();
      c.fillStyle = '#c9a06a'; c.beginPath(); c.ellipse(bx, by + 10, 60, 32, 0, 0, 7); c.fill();
      c.strokeStyle = 'rgba(110,75,40,0.45)'; c.lineWidth = 1.4;
      for (let k = -50; k <= 50; k += 10) { c.beginPath(); c.moveTo(bx + k, by - 14); c.quadraticCurveTo(bx + k * 1.1, by + 14, bx + k * 0.9, by + 38); c.stroke(); }
      c.fillStyle = '#e2c79a'; c.beginPath(); c.ellipse(bx, by + 2, 52, 22, 0, 0, 7); c.fill();
      c.fillStyle = '#efb4ae'; c.beginPath(); c.ellipse(bx, by + 4, 46, 17, 0, 0, 7); c.fill();
      const fur = '#e39a52', dk = '#b8692e', lt = '#f6c48a';
      c.fillStyle = fur; c.beginPath(); c.ellipse(bx + 6, by - 2, 34, 15, 0, 0, 7); c.fill();
      c.fillStyle = lt; c.beginPath(); c.ellipse(bx + 4, by - 6, 22, 5, 0, 0, 7); c.fill();
      c.strokeStyle = dk; c.lineWidth = 1.8; c.globalAlpha = 0.7;
      for (const k of [-8, 4, 16]) { c.beginPath(); c.moveTo(bx + k, by - 15); c.quadraticCurveTo(bx + k + 4, by - 8, bx + k, by); c.stroke(); }
      c.globalAlpha = 1;
      c.strokeStyle = fur; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx + 38, by + 2); c.quadraticCurveTo(bx + 40, by + 16, bx + 10, by + 14); c.lineTo(bx - 14, by + 13); c.stroke();
      dot(c, bx - 24, by - 2, 13, fur);
      c.fillStyle = fur; c.beginPath(); c.moveTo(bx - 34, by - 8); c.lineTo(bx - 36, by - 21); c.lineTo(bx - 26, by - 13); c.closePath(); c.moveTo(bx - 20, by - 13); c.lineTo(bx - 12, by - 21); c.lineTo(bx - 12, by - 9); c.closePath(); c.fill();
      c.fillStyle = '#f4a9b8'; c.beginPath(); c.moveTo(bx - 33, by - 10); c.lineTo(bx - 34, by - 17); c.lineTo(bx - 28, by - 13); c.closePath(); c.fill();
      c.strokeStyle = '#5a3a22'; c.lineWidth = 1.2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(bx - 31, by - 2); c.quadraticCurveTo(bx - 28.5, by, bx - 26, by - 2); c.moveTo(bx - 22, by - 2); c.quadraticCurveTo(bx - 19.5, by, bx - 17, by - 2); c.stroke();
      dot(c, bx - 24, by + 3, 1.3, '#e2768b');
      c.strokeStyle = 'rgba(138,131,168,0.75)'; c.lineWidth = 1.5; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(bx - 8, by - 30); c.lineTo(bx - 2, by - 30); c.lineTo(bx - 8, by - 23); c.lineTo(bx - 2, by - 23); c.stroke();
      c.beginPath(); c.moveTo(bx + 4, by - 44); c.lineTo(bx + 9, by - 44); c.lineTo(bx + 4, by - 38); c.lineTo(bx + 9, by - 38); c.stroke();
      // the collar: soft brown leather, stitched along both edges
      const band = [];
      for (let i = 0; i <= 160; i++) band.push(collarAt(0.03 + (i / 160) * 0.97));
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.strokeStyle = 'rgba(40,25,15,0.28)'; c.lineWidth = 22; poly(c, band, 1.4, 3.4); c.stroke();
      c.strokeStyle = '#7a4a32'; c.lineWidth = 20; poly(c, band); c.stroke();
      c.strokeStyle = 'rgba(255,215,170,0.22)'; c.lineWidth = 3; poly(c, offset(band, -6.5)); c.stroke();
      c.setLineDash([3.4, 3]); c.strokeStyle = 'rgba(246,228,196,0.8)'; c.lineWidth = 1.2;
      poly(c, offset(band, 6.6)); c.stroke(); poly(c, offset(band, -6.6)); c.stroke(); c.setLineDash([]);
      // holes near the tip
      for (const u of [0.935, 0.965]) { const [hx, hy] = collarAt(u); dot(c, hx, hy, 2.6, '#3a2418'); }
      // the buckle near the other end, and a brass heart tag on a ring
      const [kx, ky] = collarAt(0.075), [lx, ly] = collarAt(0.09), ang = Math.atan2(ly - ky, lx - kx);
      c.save(); c.translate(kx, ky); c.rotate(ang);
      c.strokeStyle = '#c99a2e'; c.lineWidth = 3.6; c.beginPath(); c.roundRect(-7, -15, 14, 30, 4); c.stroke();
      c.strokeStyle = '#f6d77a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-5, -13); c.lineTo(5, -13); c.stroke();
      c.strokeStyle = '#a77d1e'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(0, 0); c.lineTo(10, 0); c.stroke();
      c.restore();
      const [tx, ty] = collarAt(0.12), [nx, ny] = [tx - COLLAR.x, ty - COLLAR.y], nd = Math.hypot(nx, ny);
      const rx = tx + (nx / nd) * 15, ry = ty + (ny / nd) * 15;
      goldRing(c, rx, ry, 4.4);
      c.save(); c.translate(rx + (nx / nd) * 13, ry + (ny / nd) * 13); c.rotate(Math.atan2(ny, nx) - Math.PI / 2);
      c.fillStyle = '#e9bf4f'; heartPath(c, 0, 0, 9); c.fill(); c.fillStyle = '#f6d77a'; heartPath(c, 0, -0.6, 6); c.fill();
      c.restore();
    }
    function heartPath(c, x, y, rad) {
      c.beginPath(); c.moveTo(x, y + rad * 0.95);
      c.bezierCurveTo(x - rad * 1.55, y - rad * 0.02, x - rad * 0.7, y - rad * 1.22, x, y - rad * 0.42);
      c.bezierCurveTo(x + rad * 0.7, y - rad * 1.22, x + rad * 1.55, y - rad * 0.02, x, y + rad * 0.95);
      c.closePath();
    }
    function dot(c, x, y, rad, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill(); }
    // the bead box (a biscuit tin at the farmhouse), a little heap in each compartment
    function box(c) {
      const { x, y, w, h } = TRAY, tin = what === 'collar', tack = what === 'mane';
      c.fillStyle = 'rgba(60,40,20,0.26)'; PZ.rr(c, x + 3, y + 5, w, h, 12); c.fill();
      c.fillStyle = tin ? '#6f93b8' : tack ? '#7b5232' : '#9c6b43'; PZ.rr(c, x, y, w, h, tack ? 7 : 12); c.fill();
      c.fillStyle = tin ? 'rgba(255,255,255,0.3)' : 'rgba(255,225,180,0.22)'; PZ.rr(c, x + 8, y + 2, w - 16, 3, 2); c.fill();
      if (tin) { c.strokeStyle = 'rgba(246,239,227,0.6)'; c.lineWidth = 1.4; c.setLineDash([2, 4]); PZ.rr(c, x + 3.5, y + 3.5, w - 7, h - 7, 10); c.stroke(); c.setLineDash([]); }
      // a saddle box: dark oak, brass corners and a leather strap
      if (tack) {
        for (const [px, py, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) {
          c.fillStyle = '#c99a2e'; c.beginPath(); c.moveTo(px, py); c.lineTo(px + sx * 15, py); c.lineTo(px, py + sy * 15); c.closePath(); c.fill();
          c.fillStyle = '#f6d77a'; c.beginPath(); c.arc(px + sx * 4.4, py + sy * 4.4, 1.3, 0, 7); c.fill();
        }
      }
      for (const q of CELLS) {
        c.fillStyle = tin ? '#f4eee2' : tack ? '#ecdcbc' : '#f1e6d2'; PZ.rr(c, q.x, q.y, q.w, q.h, 7); c.fill();
        const g = c.createLinearGradient(0, q.y, 0, q.y + 14); g.addColorStop(0, 'rgba(60,40,20,0.22)'); g.addColorStop(1, 'rgba(60,40,20,0)');
        c.fillStyle = g; PZ.rr(c, q.x, q.y, q.w, 14, 7); c.fill();
      }
      CELLS.forEach((q, ci) => { const kd = kinds[kindIn[ci]]; for (const b of heaps[ci]) bead(c, kd, q.cx + b.dx, q.cy + b.dy, b.s, b.a, true); });
    }

    // a bead that has just gone on: from where it was let go, with a bounce
    function drawPlaced(c, i, still) {
      const p = P[i], k = still ? 1 : pop[i], kd = kinds[need(i)], turn = what === 'mane' ? 0 : p.a;
      if (k >= 1 || !from[i]) { bead(c, kd, p.x, p.y, s, turn); return; }
      const e = U.easeOut(Math.min(1, k * 1.5)), f = from[i];
      const size = U.lerp(HELD * 0.8, s, e) * (1 + 0.24 * Math.sin(k * Math.PI));
      bead(c, kd, U.lerp(f.x, p.x, e), U.lerp(f.y, p.y, e), size, turn);
    }
    // the next place: a dashed ring that breathes, and a little arrow from outside
    function marker(c, t, still) {
      const i = next(), p = P[i], [ox, oy] = out[i];
      const shake = nudge > 0 && !still ? Math.sin(nudge * 40) * nudge * 7 : 0;
      const x = p.x + shake, y = p.y, rad = s * 0.58 + (still ? 0 : Math.sin(t * 3) * 1.4);
      c.save();
      c.strokeStyle = 'rgba(255,238,175,0.95)'; c.lineWidth = 2.4; c.setLineDash([4, 3.4]); c.lineDashOffset = still ? 0 : -t * 9;
      c.beginPath(); c.arc(x, y, rad, 0, 7); c.stroke(); c.setLineDash([]);
      c.fillStyle = 'rgba(255,238,175,0.18)'; c.beginPath(); c.arc(x, y, rad - 2, 0, 7); c.fill();
      const d = s * 0.95 + 8 + (still ? 0 : Math.sin(t * 3) * 2.4), ax = x + ox * d, ay = y + oy * d, ang = Math.atan2(-oy, -ox);
      c.translate(ax, ay); c.rotate(ang);
      c.fillStyle = 'rgba(255,238,175,0.95)'; c.strokeStyle = 'rgba(52,36,28,0.35)'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(7, 0); c.lineTo(-5, -6.5); c.lineTo(-2, 0); c.lineTo(-5, 6.5); c.closePath(); c.fill(); c.stroke();
      c.restore();
    }

    const sc = {
      puzzle: true, indoor: true, steps,
      crop: V.crop,
      decor(c) {
        wall(c);
        table(c);
        if (what === 'bracelet') braceletBase(c); else if (what === 'collar') collarBase(c); else if (what === 'mane') maneBase(c); else if (what === 'sequins') sequinBase(c); else necklaceBase(c);
        box(c);
      },
      draw(c, t, still) {
        const i0 = next();
        // the pony blinks now and then, and that is all it needs
        if (pony && !still && t % 5.3 < 0.16) { c.fillStyle = pony[0]; c.beginPath(); c.ellipse(EYE.x, EYE.y, 9, 10, -0.3, 0, 7); c.fill(); c.strokeStyle = 'rgba(40,25,15,0.6)'; c.lineWidth = 1.8; c.lineCap = 'round'; c.beginPath(); c.moveTo(EYE.x - 8, EYE.y + 1); c.quadraticCurveTo(EYE.x, EYE.y + 5, EYE.x + 8, EYE.y); c.stroke(); }
        // the places still to fill: faint rings, and the next one marked
        for (let i = i0 + 1; i < N; i++) {
          c.strokeStyle = 'rgba(255,248,232,0.4)'; c.lineWidth = 1.4;
          c.beginPath(); c.arc(P[i].x, P[i].y, s * 0.36, 0, 7); c.stroke();
        }
        if (!solved()) marker(c, t, still);
        for (let i = 0; i < i0; i++) drawPlaced(c, i, still);
        if (!still && hintT > 0 && !solved()) {
          const q = CELLS[cellOf[need(i0)]];
          PZ.glow(c, q.cx, q.cy, 42, t); PZ.glow(c, P[i0].x, P[i0].y, s * 0.62, t);
        }
        if (!still) for (const f of flying) bead(c, kinds[f.k], f.x, f.y, 32, 0);
        if (held && !still) {
          PZ.shadow(c, held.x + 5, held.y + HELD * 0.62, HELD * 0.38, HELD * 0.12, 0.16);
          bead(c, kinds[held.k], held.x, held.y, HELD, 0);
        }
        // finished: a glint runs along the beads, then one twinkles now and then
        if (solved()) {
          if (still) { for (const i of [1, 5, 9]) glint(c, P[i].x - s * 0.18, P[i].y - s * 0.22, s * 0.34, 0.95); return; }
          const w = shine * 10;
          for (let i = 0; i < N; i++) { const d = w - i; if (d > 0 && d < 2) glint(c, P[i].x - s * 0.16, P[i].y - s * 0.22, s * 0.45 * Math.sin((d / 2) * Math.PI), 0.95); }
          if (shine > 1.4) { const k = shine * 1.7, i = (Math.floor(k) * 5) % N; glint(c, P[i].x - s * 0.16, P[i].y - s * 0.22, s * 0.36 * Math.sin((k % 1) * Math.PI), 0.9); }
        }
      },
      step(dt) {
        hintT -= dt; nudge = Math.max(0, nudge - dt);
        if (held) { held.x = PZ.approach(held.x, held.tx, dt, 22); held.y = PZ.approach(held.y, held.ty, dt, 22); }
        for (let i = 0; i < N; i++) if (pop[i] < 1) pop[i] = Math.min(1, pop[i] + dt / 0.34);
        for (let k = flying.length - 1; k >= 0; k--) {
          const f = flying[k], q = CELLS[f.cell];
          f.x = PZ.approach(f.x, q.cx, dt, 12); f.y = PZ.approach(f.y, q.cy, dt, 12);
          if (PZ.dist(f.x, f.y, q.cx, q.cy) < 3) flying.splice(k, 1);
        }
        if (solved()) shine += dt;
      },
      down(x, y) {
        if (held || solved()) return;
        const ci = CELLS.findIndex((q) => x >= q.x - 4 && x <= q.x + q.w + 4 && y >= q.y - 4 && y <= q.y + q.h + 4);
        if (ci < 0) return;
        held = { k: kindIn[ci], cell: ci, x, y: y - PZ.LIFT, tx: x, ty: y - PZ.LIFT };
        fx.sound('pick');
      },
      move(x, y) { if (held) { held.tx = x; held.ty = y - PZ.LIFT; } },
      up(x, y) {
        if (!held) return;
        const h = held; held = null;
        const dx = x, dy = y - PZ.LIFT, i = next(); // judged where it is drawn
        if (i < N && PZ.dist(dx, dy, P[i].x, P[i].y) <= NEAR) {
          if (h.k === need(i)) {
            placed++; pop[i] = 0; from[i] = { x: h.x, y: h.y }; hintT = 0;
            fx.sound(what === 'mane' ? 'drop' : 'clink'); fx.good(P[i].x, P[i].y);
            return;
          }
          nudge = 0.45; // not this one: the place gives a little shake
        }
        flying.push({ k: h.k, cell: h.cell, x: h.x, y: h.y });
        fx.sound(dy >= TRAY.y - 6 ? 'drop' : 'nope');
      },
      cancel() { if (held) { flying.push({ k: held.k, cell: held.cell, x: held.x, y: held.y }); held = null; } },
      progress: () => placed / steps,
      solved,
      hint() { if (!solved()) hintT = 3.5; },
      save: () => ({ n: placed }),
      load(st) {
        if (!st || typeof st !== 'object') return;
        const n = Math.round(+st.n);
        if (!(n >= 0 && n <= steps)) return;
        placed = n; pop.fill(1);
      },
      solveAll() { placed = steps; pop.fill(1); },
      // finger positions: pick a bead up from its compartment, let go PZ.LIFT below the next place
      debugPlan() {
        const plan = [];
        for (let i = next(); i < N; i++) { const q = CELLS[cellOf[need(i)]]; plan.push({ drag: [q.cx, q.cy, P[i].x, P[i].y + PZ.LIFT] }); }
        return plan;
      },
      // for the tests: the pattern and the kinds
      debugPattern: () => ({ motif: motif.map((k) => kinds[k].shape), filled, steps }),
    };
    Object.defineProperty(sc, 'fx', { get: () => fx, set: (v) => { fx = v; } });
    return sc;
  }

  Object.assign(SCENES.KINDS, { beads });
})();
