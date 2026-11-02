'use strict';
// The cutting garden: a thinking job in the walled garden. A raised bed is
// marked out with garden string into four rows of four squares, and a few
// flowers are already growing in it. Seedlings of four kinds wait in their
// trays below. Every row and every column of the bed should end up with one
// of each kind. There is only one way to finish it, and it can always be
// worked out square by square; a seedling put where it does not belong just
// goes back to its tray (and a flower of the same kind in that row or column
// gives a little wiggle, to show why).
//   node test/run.mjs puzzle js/pz-plan.js plan --seeds 20

(() => {
  const N = 4, CELL = 68;
  const GX = 44, GY = 106, GX1 = GX + N * CELL, GY1 = GY + N * CELL;   // the soil, 272 square
  const FX0 = 30, FY0 = 92, FX1 = 330, FY1 = 392;                       // the wooden frame round it
  const TX = [54, 138, 222, 306], TY = 469, TRAY_Y0 = 438;              // the seed trays
  const WALL = 86;                                                      // where the brick wall meets the lawn
  // where the seedlings stand in a tray holding 0 to 4 of them (x from the middle, foot from the top)
  const SLOTS = [[], [[0, 42]], [[-14, 42], [14, 42]], [[-14, 32], [14, 32], [0, 50]], [[-14, 32], [14, 32], [-10, 50], [18, 50]]];
  const BASE = 20;                       // a plant's foot sits this far below its square's middle
  const cxOf = (i) => GX + (i % N) * CELL + CELL / 2;
  const cyOf = (i) => GY + ((i / N) | 0) * CELL + CELL / 2;
  const ROWS = [0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((k) => r * N + k));
  const COLS = [0, 1, 2, 3].map((c) => [0, 1, 2, 3].map((k) => k * N + c));
  const LINES = ROWS.concat(COLS);

  const STEM = '#5f8f5a', SAGE = '#6f9a6a', SAGE_L = '#93b98a', GREY = '#8fa596';
  const dot = (c, x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill(); };

  // ------------------------------------------------------------- FLOWERS
  // Each kind has its own shape as well as its own colour: a pink cup, a
  // white daisy, a big sunflower with a dark middle, lavender spikes, an
  // open red poppy and a frilly blue cornflower. Drawn standing on 0, 0.
  function stalk(c, x1, y1, w, col = STEM) {
    c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(x1 * 0.15, y1 * 0.6, x1, y1); c.stroke();
  }
  // a long leaf from x, y, pointing along angle a
  function blade(c, x, y, len, wid, a, col) {
    c.save(); c.translate(x, y); c.rotate(a);
    c.fillStyle = col; c.beginPath(); c.moveTo(0, 0);
    c.quadraticCurveTo(len * 0.45, -wid, len, 0); c.quadraticCurveTo(len * 0.45, wid, 0, 0); c.fill();
    c.restore();
  }
  // a broad leaf, pointing up and turned by a
  function broad(c, x, y, s, a, col) {
    c.save(); c.translate(x, y); c.rotate(a);
    c.fillStyle = col; c.beginPath(); c.moveTo(0, 0);
    c.bezierCurveTo(-s, -s * 0.2, -s * 0.9, -s * 1.3, 0, -s * 1.6); c.bezierCurveTo(s * 0.9, -s * 1.3, s, -s * 0.2, 0, 0); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(0, -s * 0.15); c.lineTo(0, -s * 1.35); c.stroke();
    c.restore();
  }
  const DRAW = {
    tulip(c) {
      blade(c, -1, -1, 30, 5.5, -1.95, SAGE); blade(c, 1, -1, 26, 5, -1.2, SAGE_L);
      stalk(c, 0, -36, 2.6);
      const y = -44;
      c.fillStyle = '#e57c9b';
      c.beginPath(); c.moveTo(-12, y - 8);
      c.quadraticCurveTo(-8, y - 6, -5, y - 1); c.quadraticCurveTo(-3, y - 10, 0, y - 13);
      c.quadraticCurveTo(3, y - 10, 5, y - 1); c.quadraticCurveTo(8, y - 6, 12, y - 8);
      c.bezierCurveTo(13, y + 4, 8, y + 11, 0, y + 11); c.bezierCurveTo(-8, y + 11, -13, y + 4, -12, y - 8);
      c.closePath(); c.fill();
      // the petal in front, lighter, and a soft shade down one side
      c.fillStyle = '#f3a7bd';
      c.beginPath(); c.moveTo(-5.5, y - 1); c.quadraticCurveTo(0, y - 10, 5.5, y - 1); c.quadraticCurveTo(7, y + 8, 0, y + 10); c.quadraticCurveTo(-7, y + 8, -5.5, y - 1); c.closePath(); c.fill();
      c.fillStyle = 'rgba(150,40,80,0.16)';
      c.beginPath(); c.moveTo(12, y - 8); c.bezierCurveTo(13, y + 4, 8, y + 11, 0, y + 11); c.quadraticCurveTo(8, y + 4, 7, y - 3); c.closePath(); c.fill();
    },
    daisy(c) {
      blade(c, 0, -2, 15, 4.5, -2.5, SAGE); blade(c, 0, -2, 15, 4.5, -0.65, SAGE_L);
      stalk(c, 1, -38, 2);
      c.save(); c.translate(1, -44); c.scale(1, 0.88);
      c.lineWidth = 0.9; c.strokeStyle = 'rgba(120,105,85,0.45)';
      for (let i = 0; i < 13; i++) {
        const a = (i / 13) * Math.PI * 2;
        c.fillStyle = i % 2 ? '#fffdf7' : '#f6efe3';
        c.beginPath(); c.ellipse(Math.cos(a) * 9.5, Math.sin(a) * 9.5, 7.2, 2.9, a, 0, 7); c.fill(); c.stroke();
      }
      dot(c, 0, 0, 5.8, '#e8b52e'); dot(c, -1.3, -1.3, 3.2, '#f6d465');
      c.restore();
    },
    sunflower(c) {
      broad(c, -1, -12, 10, -1.05, SAGE); broad(c, 1, -20, 9, 1.0, SAGE_L);
      stalk(c, 0, -40, 3.4);
      c.save(); c.translate(0, -46);
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 + 0.1;
        c.fillStyle = i % 2 ? '#f4b937' : '#e8a12a';
        c.beginPath(); c.ellipse(Math.cos(a) * 12.5, Math.sin(a) * 12.5, 7, 3.4, a, 0, 7); c.fill();
      }
      dot(c, 0, 0, 9, '#5c3a1f');
      for (let k = 0; k < 12; k++) { const a = k * 2.4, d = 2 + (k % 3) * 2.2; dot(c, Math.cos(a) * d, Math.sin(a) * d, 0.9, '#7f5533'); }
      c.restore();
    },
    lavender(c) {
      blade(c, 0, -1, 19, 2.2, -2.3, GREY); blade(c, 0, -1, 19, 2.2, -0.85, GREY); blade(c, 0, -1, 15, 2, -1.75, '#a7b9aa');
      for (const [sx, sy] of [[-10, -46], [0, -56], [10, -46]]) {
        c.strokeStyle = '#7f9a7a'; c.lineWidth = 1.6; c.lineCap = 'round';
        c.beginPath(); c.moveTo(0, -3); c.quadraticCurveTo(sx * 0.3, sy * 0.6, sx, sy); c.stroke();
        // buds on the top of each stem, smaller towards the tip
        for (let k = 0; k < 7; k++) {
          const t = 0.5 + k * 0.083, m = 1 - t;
          const bx = 2 * m * t * sx * 0.3 + t * t * sx, by = -3 * m * m + 2 * m * t * sy * 0.6 + t * t * sy, w = 2.9 - k * 0.22;
          c.fillStyle = k % 2 ? '#8a6cc6' : '#a58bdb';
          c.beginPath(); c.ellipse(bx - w * 0.5, by, w, w * 1.25, -0.3, 0, 7); c.fill();
          c.beginPath(); c.ellipse(bx + w * 0.5, by - 1, w, w * 1.25, 0.3, 0, 7); c.fill();
        }
      }
    },
    poppy(c) {
      blade(c, 0, -2, 16, 3.5, -2.4, SAGE); blade(c, 0, -2, 14, 3.5, -0.75, SAGE_L);
      c.strokeStyle = STEM; c.lineWidth = 2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-4, -16, 6, -26, 1, -37); c.stroke();
      const y = -44;
      dot(c, -6, y - 3, 8.5, '#c63f2c'); dot(c, 6, y - 3, 8.5, '#c63f2c');   // two petals behind
      dot(c, -5, y + 3, 8, '#e5553d'); dot(c, 5, y + 3, 8, '#e5553d');       // and two in front
      c.fillStyle = 'rgba(255,205,185,0.35)'; c.beginPath(); c.ellipse(-7, y + 2, 3, 5, 0.4, 0, 7); c.fill();
      dot(c, 0, y - 1, 4.4, '#2f2a28');
      for (let k = 0; k < 8; k++) { const a = k * 0.785; dot(c, Math.cos(a) * 6, y - 1 + Math.sin(a) * 6, 0.9, '#3b302b'); }
      dot(c, 0, y - 1, 1.8, '#8f8a6a');
    },
    cornflower(c) {
      blade(c, 0, -2, 18, 2.2, -2.2, GREY); blade(c, 0, -2, 17, 2.2, -0.9, GREY);
      stalk(c, 0, -38, 1.8, '#6f8f73');
      c.save(); c.translate(0, -45);
      // a ring of little frilled trumpets
      for (let i = 0; i < 9; i++) {
        c.save(); c.rotate((i / 9) * Math.PI * 2 - Math.PI / 2);
        c.fillStyle = i % 2 ? '#4f86d6' : '#6a9de3';
        c.beginPath(); c.moveTo(2, -2.2); c.lineTo(10, -4.8); c.lineTo(12, -2.4); c.lineTo(10.4, -0.4); c.lineTo(12.6, 1.6); c.lineTo(10, 4.8); c.lineTo(2, 2.2); c.closePath(); c.fill();
        c.restore();
      }
      dot(c, 0, 0, 4.4, '#34488a');
      for (let k = 0; k < 6; k++) { const a = k * 1.05; dot(c, Math.cos(a) * 2.2, Math.sin(a) * 2.2, 0.9, '#6a82c6'); }
      c.restore();
    },
  };
  const FLOWERS = [
    { id: 'tulip', name: 'Tulip' }, { id: 'daisy', name: 'Daisy' }, { id: 'sunflower', name: 'Sunflower' },
    { id: 'lavender', name: 'Lavender' }, { id: 'poppy', name: 'Poppy' }, { id: 'cornflower', name: 'Cornflower' },
  ];

  // each flower is drawn once at four times the size (sharp on a big iPad),
  // then stamped wherever it grows
  const SW = 64, SH = 74, SX = 32, SY = 68, K = 4;
  const sprites = new Map();
  function sprite(id) {
    if (sprites.has(id)) return sprites.get(id);
    const cv = U.canvas(SW * K, SH * K), x = cv.getContext('2d');
    x.scale(K, K); x.translate(SX, SY);
    DRAW[id](x);
    sprites.set(id, cv);
    return cv;
  }
  function stamp(c, id, x, y, s, rot = 0) {
    c.save(); c.translate(x, y); if (rot) c.rotate(rot); if (s !== 1) c.scale(s, s);
    c.drawImage(sprite(id), -SX, -SY, SW, SH);
    c.restore();
  }

  // --------------------------------------------------------------- LOGIC
  // the bed is 16 numbers, -1 for an empty square or 0..3 for a kind
  function fits(g, i, v) {
    const row = (i / N) | 0, col = i % N;
    for (let k = 0; k < N; k++) if (g[row * N + k] === v || g[k * N + col] === v) return false;
    return true;
  }
  const cands = (g, i) => [0, 1, 2, 3].filter((v) => fits(g, i, v));
  // a square that can be worked out from where it is: the only kind left for
  // it, or the only square left for a kind in its row or column
  function forced(g) {
    for (let i = 0; i < 16; i++) if (g[i] < 0) { const c = cands(g, i); if (c.length === 1) return { i, v: c[0] }; }
    for (const line of LINES) {
      for (let v = 0; v < N; v++) {
        if (line.some((i) => g[i] === v)) continue;
        const spots = line.filter((i) => g[i] < 0 && fits(g, i, v));
        if (spots.length === 1) return { i: spots[0], v };
      }
    }
    return null;
  }
  // can it be finished one sure square at a time, without guessing?
  function bySingles(cells) {
    const g = cells.slice();
    for (let f = forced(g); f; f = forced(g)) g[f.i] = f.v;
    return g.every((v) => v >= 0);
  }
  // a random full square: each row and column holds every kind once
  function latin(r) {
    const g = new Array(16).fill(-1);
    const fill = (i) => {
      if (i === 16) return true;
      for (const v of PZ.shuffle(r, [0, 1, 2, 3])) if (fits(g, i, v)) { g[i] = v; if (fill(i + 1)) return true; g[i] = -1; }
      return false;
    };
    fill(0);
    return g;
  }
  // Take flowers out of a full bed one by one, keeping each one out only if
  // the bed can still be worked out square by square (so there is exactly
  // one way to finish it). Six to eight stay; never four of one kind, and
  // never a whole row or column, so every tray and every line has work.
  function generate(r) {
    for (let tries = 0; ; tries++) {
      const sol = latin(r);
      const target = 6 + ((r() * 3) | 0);
      const giv = sol.slice();
      let n = 16;
      for (const i of PZ.shuffle(r, [...Array(16).keys()])) {
        if (n <= target) break;
        const v = giv[i]; giv[i] = -1;
        if (bySingles(giv)) n--; else giv[i] = v;
      }
      const per = [0, 0, 0, 0];
      for (const v of giv) if (v >= 0) per[v]++;
      const fine = n >= 6 && n <= 8 && per.every((k) => k <= 3) && !LINES.some((l) => l.every((i) => giv[i] >= 0));
      if (fine || tries > 60) return { sol, given: giv.map((v) => v >= 0) };
    }
  }

  // --------------------------------------------------------------- SCENE
  function plan(S) {
    const r = S.r;
    const { sol, given } = generate(r);
    const kinds = PZ.shuffle(r, FLOWERS.slice()).slice(0, N);     // kind v grows in tray v
    const cur = sol.map((v, i) => (given[i] ? v : -1));             // what grows in each square now
    const empty = [...Array(16).keys()].filter((i) => !given[i]);
    const steps = empty.length;
    const grow = new Array(16).fill(1), wob = new Array(16).fill(0), lineK = new Array(8).fill(0);
    const lineDone = LINES.map((l) => l.every((i) => cur[i] >= 0));
    lineDone.forEach((d, k) => { if (d) lineK[k] = 1; });
    // a little garden every time: where the watering can and the trowel lie
    const canX = 262 + r() * 40, trowelX = 40 + r() * 40;
    let planted = 0, held = null, hint = -1, hintT = 0, fx = null;
    const flights = [];

    const left = (v) => empty.filter((i) => cur[i] < 0 && sol[i] === v).length;
    const shownLeft = (v) => left(v) - (held && held.v === v ? 1 : 0) - flights.filter((f) => f.v === v).length;
    function cellAt(x, y) {
      const col = Math.floor((x - GX) / CELL), row = Math.floor((y - GY) / CELL);
      return col < 0 || col >= N || row < 0 || row >= N ? -1 : row * N + col;
    }
    const trayAt = (x, y) => (y < TRAY_Y0 - 8 || y > 530 ? -1 : TX.findIndex((t) => Math.abs(t - x) <= 40));

    function plantIn(i, pay) {
      cur[i] = sol[i]; planted++;
      grow[i] = pay ? 0 : 1;
      if (hint === i) hintT = 0;
      LINES.forEach((l, k) => {
        if (lineDone[k] || !l.every((j) => cur[j] >= 0)) return;
        lineDone[k] = true;
        if (pay) for (const j of l) fx.sparkle(cxOf(j), cyOf(j) - 8);
        else lineK[k] = 1;
      });
      if (pay) { fx.good(cxOf(i), cyOf(i)); fx.sound('happy'); }
    }
    function sendBack(v, x, y) { flights.push({ v, x, y }); }

    function badge(c, x, y, k) {
      dot(c, x, y, 5.5, 'rgba(60,38,20,0.32)');
      if (k < 0.02) return;
      c.globalAlpha = k; dot(c, x, y, 6.5, '#6f9a6a');
      c.strokeStyle = '#fffaf1'; c.lineWidth = 1.8; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(x - 3, y + 0.2); c.lineTo(x - 0.8, y + 2.6); c.lineTo(x + 3.2, y - 2.4); c.stroke();
      c.globalAlpha = 1;
    }
    // the seedling in the hand or on its way back: a plant with its root ball
    function seedling(c, v, x, y, s) {
      c.fillStyle = '#6e4c36'; c.beginPath(); c.ellipse(x, y + 22 * s, 11 * s, 6 * s, 0, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,230,200,0.18)'; c.beginPath(); c.ellipse(x - 3 * s, y + 20 * s, 5 * s, 2 * s, 0, 0, 7); c.fill();
      stamp(c, kinds[v].id, x, y + 22 * s, s);
    }
    function butterfly(c, x, y, t, still) {
      const flap = still ? 0.75 : 0.35 + 0.65 * Math.abs(Math.sin(t * 9));
      c.save(); c.translate(x, y); c.scale(1.4, 1.4);
      for (const k of [-1, 1]) {
        c.save(); c.scale(k * flap, 1);
        c.fillStyle = '#f2a65a'; c.beginPath(); c.ellipse(5, -3, 6, 4.5, -0.5, 0, 7); c.fill();
        c.fillStyle = '#f6c98a'; c.beginPath(); c.ellipse(4, 3, 4, 3, 0.5, 0, 7); c.fill();
        dot(c, 6.5, -4, 1.3, '#fffaf1');
        c.restore();
      }
      c.fillStyle = PZ.INK; c.beginPath(); c.ellipse(0, 0, 1.3, 5, 0, 0, 7); c.fill();
      c.strokeStyle = PZ.INK; c.lineWidth = 0.8;
      c.beginPath(); c.moveTo(0, -4); c.lineTo(-3, -9); c.moveTo(0, -4); c.lineTo(3, -9); c.stroke();
      c.restore();
    }

    const sc = {
      puzzle: true, indoor: false, steps,
      crop: { x: 0, y: 68, w: 360, h: 360 },
      decor(c) {
        const B = S.bleed, bw = B.x1 - B.x0, dr = U.rng(5311);
        // the old brick wall of the walled garden
        c.fillStyle = '#dcc4a8'; c.fillRect(B.x0, B.y0, bw, WALL - B.y0);
        for (let y = WALL - 14, row = 0; y > B.y0 - 14; y -= 13, row++) {
          for (let x = Math.floor(B.x0 / 28) * 28 - (row % 2) * 14; x < B.x1; x += 28) {
            const v = dr();
            c.fillStyle = v < 0.33 ? '#cf8d6b' : v < 0.66 ? '#bd7756' : '#c7825f';
            c.fillRect(x + 1, y + 1, 26, 11);
          }
        }
        // ivy climbing up it at both ends
        for (const [x0, k] of [[16, 1], [344, -1]]) {
          for (let i = 0; i < 9; i++) {
            const y = WALL - 4 - i * 8, x = x0 + Math.sin(i * 1.1) * 5 * k;
            c.fillStyle = i % 2 ? SAGE : '#5d8a58';
            c.beginPath(); c.ellipse(x, y, 5.5, 3.8, (i % 2 ? 0.7 : -0.7) * k, 0, 7); c.fill();
          }
        }
        c.fillStyle = '#e8dfcf'; c.fillRect(B.x0, WALL - 6, bw, 8);
        c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(B.x0, WALL - 6, bw, 1.5);
        // the lawn, with soft mowing stripes
        c.fillStyle = '#a9cd8f'; c.fillRect(B.x0, WALL + 2, bw, B.y1 - WALL - 2);
        c.fillStyle = 'rgba(255,255,255,0.07)';
        for (let x = Math.floor(B.x0 / 80) * 80; x < B.x1; x += 80) c.fillRect(x, WALL + 2, 40, B.y1 - WALL - 2);
        c.fillStyle = 'rgba(40,70,30,0.2)'; c.fillRect(B.x0, WALL + 2, bw, 4);
        for (let i = 0; i < 260; i++) {
          c.fillStyle = dr() < 0.5 ? 'rgba(90,140,70,0.35)' : 'rgba(210,235,180,0.4)';
          c.fillRect(B.x0 + dr() * bw, WALL + 6 + dr() * (B.y1 - WALL - 6), 1.2, 2.6);
        }
        // the rule, on a card pinned to the wall
        c.fillStyle = 'rgba(80,60,40,0.12)'; PZ.rr(c, 54, 15, 252, 50, 13); c.fill();
        c.fillStyle = PZ.PAPER; PZ.rr(c, 54, 11, 252, 50, 13); c.fill();
        c.strokeStyle = '#e5d9c6'; c.lineWidth = 1.2; c.stroke();
        dot(c, 74, 19, 3.6, '#d98b63'); dot(c, 286, 19, 3.6, '#8fbfe6');
        PZ.text(c, 'One of each flower', 180, 28.5, { size: 16 });
        PZ.text(c, 'in every row and every column', 180, 47.5, { size: 13, color: PZ.INK2, weight: 700 });
        // the raised bed: a wooden frame, dark soil, string marking the squares
        c.fillStyle = 'rgba(40,60,20,0.22)'; PZ.rr(c, FX0 + 4, FY0 + 8, FX1 - FX0, FY1 - FY0, 12); c.fill();
        c.fillStyle = '#c49a64'; PZ.rr(c, FX0, FY0, FX1 - FX0, FY1 - FY0, 10); c.fill();
        c.strokeStyle = 'rgba(110,70,35,0.22)'; c.lineWidth = 0.8;
        for (let k = 0; k < 40; k++) {
          const side = k % 4, a = dr(), l = 14 + dr() * 40;
          c.beginPath();
          if (side === 0) { const y = FY0 + 3 + dr() * 8, x = FX0 + a * 260; c.moveTo(x, y); c.lineTo(x + l, y); }
          else if (side === 1) { const y = FY1 - 11 + dr() * 8, x = FX0 + a * 260; c.moveTo(x, y); c.lineTo(x + l, y); }
          else if (side === 2) { const x = FX0 + 3 + dr() * 8, y = FY0 + a * 260; c.moveTo(x, y); c.lineTo(x, y + l); }
          else { const x = FX1 - 11 + dr() * 8, y = FY0 + a * 260; c.moveTo(x, y); c.lineTo(x, y + l); }
          c.stroke();
        }
        c.fillStyle = 'rgba(255,240,215,0.35)'; c.fillRect(FX0 + 6, FY0 + 1, FX1 - FX0 - 12, 1.5);
        for (const [x, y] of [[FX0, FY0], [FX1 - 16, FY0], [FX0, FY1 - 16], [FX1 - 16, FY1 - 16]]) {
          c.fillStyle = '#a27a4b'; PZ.rr(c, x, y, 16, 16, 4); c.fill();
          c.fillStyle = 'rgba(255,240,215,0.3)'; c.fillRect(x + 3, y + 3, 10, 1.5);
        }
        c.fillStyle = '#6f4d37'; c.fillRect(GX, GY, GX1 - GX, GY1 - GY);
        for (let i = 0; i < 520; i++) {
          c.fillStyle = dr() < 0.5 ? 'rgba(150,110,80,0.45)' : 'rgba(55,36,24,0.45)';
          c.beginPath(); c.arc(GX + 2 + dr() * (GX1 - GX - 4), GY + 2 + dr() * (GY1 - GY - 4), 0.7 + dr() * 1.3, 0, 7); c.fill();
        }
        c.fillStyle = 'rgba(30,18,10,0.28)'; c.fillRect(GX, GY, GX1 - GX, 5); c.fillRect(GX, GY, 4, GY1 - GY);
        // the strings and their pegs
        for (let k = 1; k < N; k++) {
          const x = GX + k * CELL, y = GY + k * CELL;
          c.strokeStyle = 'rgba(40,25,15,0.3)'; c.lineWidth = 1.6;
          c.beginPath(); c.moveTo(x + 1, GY); c.lineTo(x + 1, GY1); c.moveTo(GX, y + 1); c.lineTo(GX1, y + 1); c.stroke();
          c.strokeStyle = '#efe2c2'; c.lineWidth = 1.4;
          c.beginPath(); c.moveTo(x, GY - 7); c.lineTo(x, GY1 + 7); c.moveTo(GX - 7, y); c.lineTo(GX1 + 7, y); c.stroke();
          for (const [px, py] of [[x, FY0 + 7], [x, FY1 - 7], [FX0 + 7, y], [FX1 - 7, y]]) { dot(c, px, py, 3.2, '#8a6440'); dot(c, px - 0.6, py - 0.6, 1.8, '#e2c9a0'); }
        }
        // a planting hole in every empty square
        for (const i of empty) {
          const x = cxOf(i), y = cyOf(i) + BASE;
          c.fillStyle = 'rgba(170,130,95,0.5)'; c.beginPath(); c.ellipse(x, y - 0.6, 11, 4.8, 0, 0, 7); c.fill();
          c.fillStyle = '#3e2a1e'; c.beginPath(); c.ellipse(x, y, 9.5, 3.9, 0, 0, 7); c.fill();
        }
        // the seed trays, and a name tag under each
        for (let v = 0; v < N; v++) {
          const x = TX[v];
          c.fillStyle = 'rgba(40,60,20,0.22)'; PZ.rr(c, x - 35, TRAY_Y0 + 5, 74, 62, 9); c.fill();
          c.fillStyle = '#b98f5a'; PZ.rr(c, x - 37, TRAY_Y0, 74, 62, 9); c.fill();
          c.fillStyle = '#7a553d'; PZ.rr(c, x - 31, TRAY_Y0 + 7, 62, 47, 5); c.fill();
          for (let k = 0; k < 26; k++) dot(c, x - 28 + dr() * 56, TRAY_Y0 + 10 + dr() * 41, 0.7 + dr(), dr() < 0.5 ? 'rgba(160,120,85,0.5)' : 'rgba(55,36,24,0.45)');
          c.fillStyle = 'rgba(255,240,215,0.35)'; c.fillRect(x - 33, TRAY_Y0 + 1.5, 66, 1.5);
          c.fillStyle = 'rgba(40,60,20,0.15)'; PZ.rr(c, x - 35, 507, 72, 22, 8); c.fill();
          c.fillStyle = PZ.PAPER; PZ.rr(c, x - 36, 505, 72, 22, 8); c.fill();
          PZ.text(c, kinds[v].name, x, 516.5, { size: 13, maxW: 66 });
        }
        // a gravel path along the bottom, with a watering can and a trowel
        c.fillStyle = '#e6dac4'; c.fillRect(B.x0, 540, bw, B.y1 - 540);
        c.fillStyle = 'rgba(60,80,40,0.18)'; c.fillRect(B.x0, 540, bw, 3);
        for (let i = 0; i < 150; i++) dot(c, B.x0 + dr() * bw, 546 + dr() * (B.y1 - 546), 0.8 + dr() * 1.6, dr() < 0.5 ? '#cdbfa5' : '#f3ebdc');
        const cy = 584;
        PZ.shadow(c, canX, cy + 1, 22, 3.5, 0.18);
        c.lineCap = 'round'; c.strokeStyle = '#7fb0b1'; c.lineWidth = 5;
        c.beginPath(); c.moveTo(canX + 12, cy - 16); c.lineTo(canX + 28, cy - 32); c.stroke();
        c.fillStyle = '#7fb0b1'; PZ.rr(c, canX + 24, cy - 38, 9, 7, 2); c.fill();
        c.lineWidth = 4; c.beginPath(); c.arc(canX - 4, cy - 30, 11, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
        c.fillStyle = '#a6d3d4'; c.beginPath(); c.moveTo(canX - 15, cy - 28); c.lineTo(canX + 13, cy - 28); c.lineTo(canX + 15, cy); c.lineTo(canX - 17, cy); c.closePath(); c.fill();
        c.fillStyle = 'rgba(60,90,90,0.16)'; c.fillRect(canX + 5, cy - 28, 9, 28);
        c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(canX - 11, cy - 24, 3, 20);
        c.save(); c.translate(trowelX, cy - 8); c.rotate(-1.1);
        PZ.shadow(c, 2, 4, 20, 3, 0.15);
        c.fillStyle = '#b98f5a'; PZ.rr(c, -3.5, 4, 7, 17, 3.5); c.fill();
        c.fillStyle = '#8f9a92'; c.beginPath(); c.moveTo(-7, 3); c.quadraticCurveTo(-7, -14, 0, -19); c.quadraticCurveTo(7, -14, 7, 3); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(-4, -10, 2, 11);
        c.restore();
      },
      draw(c, t, still) {
        // while a seedling is held over the bed, its row and column light up
        const over = held && !still ? cellAt(held.x, held.y) : -1;
        if (over >= 0) {
          const row = (over / N) | 0, col = over % N;
          c.fillStyle = 'rgba(255,244,205,0.16)';
          c.fillRect(GX, GY + row * CELL, GX1 - GX, CELL); c.fillRect(GX + col * CELL, GY, CELL, GY1 - GY);
          if (cur[over] < 0) {
            c.strokeStyle = 'rgba(255,250,235,0.85)'; c.lineWidth = 2; c.setLineDash([6, 5]);
            PZ.rr(c, GX + col * CELL + 5, GY + row * CELL + 5, CELL - 10, CELL - 10, 9); c.stroke(); c.setLineDash([]);
          }
        }
        // everything growing in the bed, back rows first
        for (let i = 0; i < 16; i++) {
          if (cur[i] < 0) continue;
          const x = cxOf(i), y = cyOf(i) + BASE, g = still ? 1 : grow[i];
          c.fillStyle = '#5b3d2a'; c.beginPath(); c.ellipse(x, y, 12, 4.6, 0, 0, 7); c.fill();
          const s = 0.92 * (g >= 1 ? 1 : 0.35 + 0.65 * U.easeBack(g));
          const w = still ? 0 : wob[i] > 0 ? Math.sin(wob[i] * 24) * 0.2 * Math.min(1, wob[i] / 0.25) : 0;
          const sway = still ? 0 : Math.sin(t * 1.3 + i * 1.7) * 0.025;
          stamp(c, kinds[cur[i]].id, x, y, s, w + sway);
        }
        // a tick on the frame at the end of every finished row and column
        for (let k = 0; k < N; k++) {
          badge(c, FX1 - 7, cyOf(k * N), still ? (lineDone[k] ? 1 : 0) : lineK[k]);
          badge(c, cxOf(k), FY1 - 7, still ? (lineDone[N + k] ? 1 : 0) : lineK[N + k]);
        }
        // the seedlings still waiting in each tray, and how many
        for (let v = 0; v < N; v++) {
          const x = TX[v], n = Math.max(0, shownLeft(v));
          for (const [dx, by] of SLOTS[n]) stamp(c, kinds[v].id, x + dx, TRAY_Y0 + by, 0.48);
          const bx = x + 31, by = TRAY_Y0 + 3;
          dot(c, bx, by, 11, 'rgba(40,30,20,0.18)'); dot(c, bx, by - 1, 11, PZ.PAPER);
          if (left(v) > 0) PZ.text(c, String(n), bx, by - 0.5, { size: 13, color: n ? PZ.INK : PZ.INK2 });
          else {
            c.strokeStyle = '#6f9a6a'; c.lineWidth = 2.4; c.lineCap = 'round'; c.lineJoin = 'round';
            c.beginPath(); c.moveTo(bx - 4.5, by - 1); c.lineTo(bx - 1.2, by + 2.6); c.lineTo(bx + 4.8, by - 4.4); c.stroke();
          }
        }
        if (!still && hint >= 0 && hintT > 0 && cur[hint] < 0) { PZ.glow(c, cxOf(hint), cyOf(hint), 30, t); PZ.glow(c, TX[sol[hint]], TRAY_Y0 + 31, 40, t); }
        if (!still) for (const f of flights) seedling(c, f.v, f.x, f.y, 0.8);
        if (held && !still) {
          PZ.shadow(c, held.x + 4, held.y + 40, 18, 4, 0.13);
          seedling(c, held.v, held.x, held.y, 1);
        }
        // once every square is planted, a butterfly comes to look
        if (planted === steps) {
          if (still) butterfly(c, 247, 170, t, true);
          else butterfly(c, 180 + Math.sin(t * 0.6) * 92, 236 + Math.sin(t * 1.1) * 70, t, false);
        }
      },
      step(dt) {
        hintT -= dt;
        for (let i = 0; i < 16; i++) { if (grow[i] < 1) grow[i] = Math.min(1, grow[i] + dt / 0.35); if (wob[i] > 0) wob[i] = Math.max(0, wob[i] - dt); }
        lineDone.forEach((d, k) => { lineK[k] = PZ.approach(lineK[k], d ? 1 : 0, dt, 8); });
        if (held) { held.x = PZ.approach(held.x, held.tx, dt, 22); held.y = PZ.approach(held.y, held.ty, dt, 22); }
        for (let k = flights.length - 1; k >= 0; k--) {
          const f = flights[k], ty = TRAY_Y0 + 24;
          f.x = PZ.approach(f.x, TX[f.v], dt, 11); f.y = PZ.approach(f.y, ty, dt, 11);
          if (PZ.dist(f.x, f.y, TX[f.v], ty) < 2) flights.splice(k, 1);
        }
      },
      down(x, y) {
        if (held || planted === steps) return;
        const v = trayAt(x, y);
        if (v < 0 || shownLeft(v) <= 0) return;
        held = { v, x: TX[v], y: TRAY_Y0 + 24, tx: x, ty: y - PZ.LIFT };
        fx.sound('pick');
      },
      move(x, y) { if (held) { held.tx = x; held.ty = y - PZ.LIFT; } },
      up(x, y) {
        if (!held) return;
        const h = held; held = null;
        const dx = x, dy = y - PZ.LIFT; // judged where it is drawn
        const i = cellAt(dx, dy);
        if (i >= 0 && cur[i] < 0 && sol[i] === h.v) { plantIn(i, true); return; }
        sendBack(h.v, h.x, h.y);
        if (i >= 0 && cur[i] < 0) {
          // not this square: the same kind in its row or column wiggles, to show why
          const row = (i / N) | 0, col = i % N;
          for (const j of ROWS[row].concat(COLS[col])) if (cur[j] === h.v) wob[j] = 0.7;
          fx.sound('nope');
        } else fx.sound(i < 0 && dy >= TRAY_Y0 - 30 ? 'drop' : 'nope'); // set down by the trays again is not a wrong move
      },
      cancel() { if (held) { sendBack(held.v, held.x, held.y); held = null; } },
      progress: () => planted / steps,
      solved: () => planted === steps,
      // a square that can be worked out right now, and the tray it needs
      hint() {
        if (planted === steps) return;
        const f = forced(cur);
        hint = f ? f.i : empty.find((i) => cur[i] < 0);
        hintT = 3.5;
      },
      // the squares planted so far, each as its kind + 1 ('0' for the rest)
      save: () => ({ bed: cur.map((v, i) => (given[i] || v < 0 ? 0 : v + 1)).join('') }),
      load(s) {
        if (!s || typeof s.bed !== 'string' || s.bed.length !== 16 || !/^[0-4]+$/.test(s.bed)) return;
        const d = [...s.bed].map(Number);
        if (d.some((n, i) => n && (given[i] || sol[i] !== n - 1))) return; // made for another layout
        d.forEach((n, i) => { if (n && cur[i] < 0) plantIn(i, false); });
      },
      solveAll() { for (const i of empty) if (cur[i] < 0) plantIn(i, false); },
      // finger positions: pick up at the tray, let go PZ.LIFT below the square
      debugPlan: () => empty.filter((i) => cur[i] < 0).map((i) => ({ drag: [TX[sol[i]], TY, cxOf(i), cyOf(i) + PZ.LIFT] })),
      // test hook for the generator sweep
      debugLayout: () => ({ sol: sol.slice(), given: given.slice(), kinds: kinds.map((k) => k.id) }),
    };
    Object.defineProperty(sc, 'fx', { get: () => fx, set: (v) => { fx = v; } });
    return sc;
  }

  Object.assign(SCENES.KINDS, { plan });
})();
