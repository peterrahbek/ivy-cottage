'use strict';
// Load the boat: a thinking job at the canal. The narrowboat's hold is open
// and marked out in chalk squares, and the cargo waits on the towpath:
// crates, sacks, barrels, logs, a box of apples, a coil of rope and pots of
// flowers, each load its own shape. Drag a load into the hold, where it
// snaps to the squares; tap one on the towpath to turn it. A load only goes
// in where it fits and where everything still waiting can fit around it, so
// there is no packing yourself into a corner: otherwise it slides back
// ashore. With opts.what = 'van' it is the camper van at the cove instead,
// parked on the sand with its side door open: suitcases, a cool box, a
// rolled-up tent, sleeping bags, boxes, the picnic basket and a beach bag.
// With opts.what = 'kiln' it is "Load the kiln" at Kiln Lane Pottery: the
// kiln seen from above with its lid open, and each load a kiln shelf (a bat)
// of pots waiting on the bench: bowls, mugs, jugs, vases, plates, teapots and
// flower pots, each its own shape, glaze and pattern.
//   node test/run.mjs puzzle js/pz-pack.js pack --seeds 30

(() => {
  const CELL = 50, ROWS = 4;
  const GY = 124, GY1 = GY + ROWS * CELL;        // the hold, four squares across
  const SHORE = 362;                             // where the towpath (or the sand) starts
  const ROW_Y = [432, 536];                      // the two rows of loads waiting ashore
  const SK = 0.62;                               // and how small they are drawn there
  const TAP = 9;                                 // finger travel that still counts as a tap
  const PAD = 7, RES = 3;                        // round each load's picture, and its sharpness
  const TURN = Math.PI / 2;

  // where each of k loads waits: one or two rows of up to three
  function slotsFor(k) {
    const top = Math.ceil(k / 2), out = [];
    for (let i = 0; i < k; i++) {
      const row = i < top ? 0 : 1, n = row ? k - top : top, j = row ? i - top : i;
      out.push({ x: 180 + (j - (n - 1) / 2) * (n === 3 ? 118 : 150), y: ROW_Y[row] });
    }
    return out;
  }

  // -------------------------------------------------------------- SHAPES
  // a shape is a list of [col, row] squares, moved to the top left corner
  // and sorted row by row, so its first square is the leftmost of its top row
  function norm(cells) {
    const c0 = Math.min(...cells.map((p) => p[0])), r0 = Math.min(...cells.map((p) => p[1]));
    return cells.map(([c, r]) => [c - c0, r - r0]).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  }
  const turned = (cells) => norm(cells.map(([c, r]) => [-r, c]));   // a quarter turn clockwise
  const keyOf = (cells) => cells.map((p) => p.join(',')).join(' ');
  // the four quarter turns of a shape, numbered by taps from how it was cut
  function turnsOf(base) {
    const out = [];
    let s = norm(base);
    for (let k = 0; k < 4; k++) {
      out.push({ cells: s, w: 1 + Math.max(...s.map((p) => p[0])), h: 1 + Math.max(...s.map((p) => p[1])), key: keyOf(s) });
      s = turned(s);
    }
    return out;
  }
  // the same name for a shape whichever way round it lies
  const shapeOf = (turns) => turns.map((t) => t.key).sort()[0];

  // ------------------------------------------------------------- CUTTING
  // Cut the hold into k loads of 2 to 5 squares, none longer than three
  // squares either way. k seed squares (never side by side) grow into free
  // neighbouring squares, the smaller loads more eagerly, until every square
  // belongs to a load. Returns null when a square is left that no load can
  // take; the caller simply cuts again.
  function cut(r, cols, k) {
    const n = cols * ROWS, own = new Array(n).fill(-1), regs = [];
    for (const i of PZ.shuffle(r, [...Array(n).keys()])) {
      if (regs.length === k) break;
      const c = i % cols, w = (i / cols) | 0;
      if (regs.some((R) => Math.abs(R.c0 - c) + Math.abs(R.r0 - w) < 2)) continue;
      own[i] = regs.length;
      regs.push({ cells: [i], c0: c, r0: w, minC: c, maxC: c, minR: w, maxR: w });
    }
    if (regs.length < k) return null;
    for (let free = n - k; free > 0; free--) {
      const cand = [];
      let sum = 0;
      regs.forEach((R, ri) => {
        if (R.cells.length >= 5) return;
        const wgt = (6 - R.cells.length) ** 2;
        for (const i of R.cells) {
          const c = i % cols, w = (i / cols) | 0;
          for (const [dc, dw] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const cc = c + dc, ww = w + dw;
            if (cc < 0 || cc >= cols || ww < 0 || ww >= ROWS || own[ww * cols + cc] >= 0) continue;
            if (Math.max(R.maxC, cc) - Math.min(R.minC, cc) > 2 || Math.max(R.maxR, ww) - Math.min(R.minR, ww) > 2) continue;
            cand.push([ri, ww * cols + cc, wgt]); sum += wgt;
          }
        }
      });
      if (!cand.length) return null;
      let pick = r() * sum, j = 0;
      while (j < cand.length - 1 && pick > cand[j][2]) { pick -= cand[j][2]; j++; }
      const [ri, i] = cand[j], R = regs[ri], c = i % cols, w = (i / cols) | 0;
      own[i] = ri; R.cells.push(i);
      R.minC = Math.min(R.minC, c); R.maxC = Math.max(R.maxC, c); R.minR = Math.min(R.minR, w); R.maxR = Math.max(R.maxR, w);
    }
    return regs.map((R) => R.cells.map((i) => [i % cols, (i / cols) | 0]));
  }
  // at most one little two-square load, and every load its own shape
  function fine(shapes, strict) {
    const sizes = shapes.map((s) => s.length);
    if (sizes.some((z) => z < 2 || z > 5)) return false;
    if (!strict) return true;
    if (sizes.filter((z) => z === 2).length > 1) return false;
    const names = shapes.map((s) => shapeOf(turnsOf(s)));
    return new Set(names).size === names.length;
  }
  // a hold of 4, 5 or 6 squares long (always 4 across) and 4 to 6 loads
  function generate(r) {
    const u = r(), cols = u < 0.3 ? 4 : u < 0.72 ? 5 : 6;
    const k = cols === 4 ? 4 + ((r() * 2) | 0) : cols === 5 ? 5 + ((r() * 2) | 0) : 6;
    for (let tries = 0; tries < 4000; tries++) {
      const shapes = cut(r, cols, k);
      if (shapes && fine(shapes, tries < 3000)) return { cols, shapes };
    }
    // never seen in a sweep of thousands of seeds, but just in case
    return { cols: 4, shapes: [[[0, 0], [1, 0], [2, 0], [0, 1]], [[3, 0], [2, 1], [3, 1], [3, 2]], [[1, 1], [0, 2], [1, 2], [0, 3]], [[2, 2], [1, 3], [2, 3], [3, 3]]] };
  }

  // -------------------------------------------------------------- SOLVER
  // Can the loads in `left` fill every free square of the hold? Each try
  // covers the first free square (row by row) with the first square of one
  // of the loads, turned one of its ways. `pref` lists how each load lies
  // right now; those ways are tried first, so hints need the fewest taps.
  // Returns the moves that fill it, or null.
  function solve(cols, grid, left, pieces, pref) {
    const g = grid.slice(), used = new Array(pieces.length).fill(false), out = [];
    const go = () => {
      const e = g.indexOf(-1);
      if (e < 0) return true;
      const ec = e % cols, er = (e / cols) | 0;
      for (const i of left) {
        if (used[i]) continue;
        const P = pieces[i];
        for (const k of orderOf(P, pref ? pref[i] : 0)) {
          const T = P.turns[k], c0 = ec - T.cells[0][0], r0 = er;
          if (c0 < 0 || c0 + T.w > cols || r0 + T.h > ROWS) continue;
          if (T.cells.some(([c, rr]) => g[(r0 + rr) * cols + c0 + c] >= 0)) continue;
          for (const [c, rr] of T.cells) g[(r0 + rr) * cols + c0 + c] = i;
          used[i] = true; out.push({ i, k, col: c0, row: r0 });
          if (go()) return true;
          out.pop(); used[i] = false;
          for (const [c, rr] of T.cells) g[(r0 + rr) * cols + c0 + c] = -1;
        }
      }
      return false;
    };
    return go() ? out : null;
  }
  // the different ways a load can lie, the way it lies now first
  function orderOf(P, k) {
    const now = P.turns[k].key;
    return P.uniq.slice().sort((a, b) => (P.turns[b].key === now) - (P.turns[a].key === now));
  }

  // --------------------------------------------------------------- LOADS
  // Each load has a look and a pattern of its own, never only a colour: a
  // rounded body the shape of the whole load, then something on every
  // square of it (k counts the squares, the first one gets the handle).
  const disc = (x, X, Y, rad, col) => { x.fillStyle = col; x.beginPath(); x.arc(X, Y, rad, 0, 7); x.fill(); };
  const ring = (x, X, Y, rad, col, w) => { x.strokeStyle = col; x.lineWidth = w; x.beginPath(); x.arc(X, Y, rad, 0, 7); x.stroke(); };
  const line = (x, ax, ay, bx, by, col, w) => { x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'round'; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); };
  function star(x, X, Y, R, col) {
    x.fillStyle = col; x.beginPath();
    for (let j = 0; j < 10; j++) { const a = -Math.PI / 2 + (j * Math.PI) / 5, d = j % 2 ? R * 0.45 : R; x.lineTo(X + Math.cos(a) * d, Y + Math.sin(a) * d); }
    x.closePath(); x.fill();
  }
  const LOADS = {
    // the narrowboat's cargo
    crates: { rim: '#86592f', fill: '#d4a86c', cell(x, X, Y) {
      for (const dy of [-13, -1, 11]) line(x, X - 19, Y + dy + 6, X + 19, Y + dy + 6, 'rgba(120,80,40,0.35)', 1.2);
      line(x, X - 15, Y + 15, X + 15, Y - 15, '#a2733f', 6.5);
      line(x, X - 15, Y + 15, X + 15, Y - 15, '#c99659', 3.8);
      for (const [a, b] of [[-15, -15], [15, -15], [-15, 15], [15, 15]]) disc(x, X + a, Y + b, 1.7, '#5e4127');
    } },
    sacks: { rim: '#8f7550', fill: '#c4ad80', cell(x, X, Y, k) {
      x.fillStyle = 'rgba(80,60,30,0.22)'; PZ.rr(x, X - 16, Y - 13, 36, 34, 12); x.fill();
      x.fillStyle = '#ead8b0'; PZ.rr(x, X - 18, Y - 15, 36, 33, 12); x.fill();
      x.strokeStyle = 'rgba(150,120,70,0.3)'; x.lineWidth = 0.8;
      for (let d = -11; d <= 13; d += 4) { x.beginPath(); x.moveTo(X - 15, Y + d); x.lineTo(X + 15, Y + d); x.stroke(); }
      x.fillStyle = k % 2 ? '#5f8fb8' : '#c9474f'; x.fillRect(X - 18, Y + 2, 36, 5);
      disc(x, X, Y - 15, 4.2, '#b89a63');
      line(x, X - 3, Y - 18, X - 7, Y - 22, '#b89a63', 2.2); line(x, X + 3, Y - 18, X + 7, Y - 22, '#b89a63', 2.2);
    } },
    barrels: { rim: '#5f4130', fill: '#8f6c4c', cell(x, X, Y) {
      disc(x, X + 1.5, Y + 2, 19, 'rgba(40,25,15,0.35)');
      disc(x, X, Y, 19, '#b07a46');
      for (const dx of [-7, 0, 7]) line(x, X + dx, Y - 16, X + dx, Y + 16, 'rgba(90,55,30,0.35)', 1);
      ring(x, X, Y, 18, '#3f342c', 3); ring(x, X, Y, 13.5, 'rgba(60,40,25,0.55)', 1.4);
      disc(x, X + 7, Y - 6, 2.6, '#4a3222');
      x.strokeStyle = 'rgba(255,240,215,0.4)'; x.lineWidth = 2; x.beginPath(); x.arc(X, Y, 15.5, 3.6, 4.6); x.stroke();
    } },
    apples: { rim: '#6f3a2c', fill: '#a35b42', cell(x, X, Y, k) {
      x.fillStyle = '#5f3427'; PZ.rr(x, X - 18, Y - 18, 36, 36, 5); x.fill();
      const cols = ['#d9483b', '#e0662f', '#c93a3a', '#e8873a'];
      [[-8, -8], [8, -8], [-8, 8], [8, 8]].forEach(([a, b], j) => {
        disc(x, X + a, Y + b, 8.6, cols[(j + k) % 4]);
        disc(x, X + a - 2.6, Y + b - 2.8, 2.4, 'rgba(255,225,205,0.65)');
        line(x, X + a, Y + b - 1, X + a + 1.5, Y + b - 4.5, '#5b3a24', 1.4);
      });
      x.fillStyle = '#6f9a4a'; x.beginPath(); x.ellipse(X + 11, Y - 13, 4.8, 2.4, -0.6, 0, 7); x.fill();
    } },
    rope: { rim: '#3d6787', fill: '#5f8fb8', cell(x, X, Y, k) {
      x.strokeStyle = 'rgba(255,255,255,0.14)'; x.lineWidth = 1; x.beginPath(); x.moveTo(X - 20, Y - 20); x.lineTo(X + 20, Y + 20); x.stroke();
      ring(x, X, Y, 15.5, '#8f6d43', 5.6); ring(x, X, Y, 15.5, '#dcb87e', 3.6);
      ring(x, X, Y, 9.5, '#8f6d43', 5.6); ring(x, X, Y, 9.5, '#e6c48c', 3.6);
      disc(x, X, Y, 4.2, '#dcb87e');
      x.strokeStyle = 'rgba(120,85,45,0.65)'; x.lineWidth = 1;
      for (let a = 0; a < 6.28; a += 0.45) { x.beginPath(); x.moveTo(X + Math.cos(a) * 13.6, Y + Math.sin(a) * 13.6); x.lineTo(X + Math.cos(a + 0.22) * 17.4, Y + Math.sin(a + 0.22) * 17.4); x.stroke(); }
      if (k === 0) { line(x, X + 14, Y + 6, X + 19, Y + 17, '#8f6d43', 5.6); line(x, X + 14, Y + 6, X + 19, Y + 17, '#dcb87e', 3.6); }
    } },
    logs: { rim: '#4a3223', fill: '#6c4d36', cell(x, X, Y) {
      for (const [a, b] of [[-9, -8], [9, -8], [0, 9]]) {
        disc(x, X + a, Y + b, 10.2, '#553a28');
        disc(x, X + a, Y + b, 8, '#e6c38f');
        ring(x, X + a, Y + b, 5.2, 'rgba(170,120,70,0.65)', 1); ring(x, X + a, Y + b, 2.4, 'rgba(170,120,70,0.65)', 1);
      }
    } },
    pots: { rim: '#64744a', fill: '#8fa26a', cell(x, X, Y, k) {
      disc(x, X + 1.5, Y + 2, 17, 'rgba(40,50,20,0.3)');
      disc(x, X, Y, 17, '#cf7d55'); disc(x, X, Y, 13.5, '#6d4a36');
      for (let j = 0; j < 6; j++) { const a = j * 1.047 + 0.3; x.fillStyle = j % 2 ? '#5f8f5a' : '#79a86a'; x.beginPath(); x.ellipse(X + Math.cos(a) * 8, Y + Math.sin(a) * 8, 6, 3.2, a, 0, 7); x.fill(); }
      const petal = ['#e57c9b', '#f2d24a', '#fffaf1', '#c9474f'][k % 4];
      for (let j = 0; j < 5; j++) { const a = j * 1.2566; disc(x, X + Math.cos(a) * 4, Y + Math.sin(a) * 4, 3.4, petal); }
      disc(x, X, Y, 2.4, '#e8b52e');
    } },
    // what goes in the camper van
    suitcase: { rim: '#a26a1c', fill: '#e3a63d', cell(x, X, Y, k) {
      x.setLineDash([3, 3]); x.strokeStyle = 'rgba(140,90,20,0.6)'; x.lineWidth = 1.2; PZ.rr(x, X - 16, Y - 16, 32, 32, 6); x.stroke(); x.setLineDash([]);
      line(x, X - 9, Y - 22, X - 9, Y + 22, '#7a5032', 4.2); line(x, X + 9, Y - 22, X + 9, Y + 22, '#7a5032', 4.2);
      x.fillStyle = '#efe6cf'; x.fillRect(X - 11.5, Y - 3, 5, 6); x.fillRect(X + 6.5, Y - 3, 5, 6);
      if (k === 0) { x.strokeStyle = '#5b3a24'; x.lineWidth = 4; x.lineCap = 'round'; x.beginPath(); x.moveTo(X - 6, Y - 12); x.quadraticCurveTo(X, Y - 20, X + 6, Y - 12); x.stroke(); }
      if (k === 1) { disc(x, X, Y + 11, 6, '#3d8fb0'); star(x, X, Y + 11, 4.2, '#fffaf1'); }
    } },
    coolbox: { rim: '#2c6a98', fill: '#5aa0d4', cell(x, X, Y, k) {
      x.fillStyle = '#f4f8fb'; PZ.rr(x, X - 16, Y - 16, 32, 32, 7); x.fill();
      x.strokeStyle = '#9cc8e6'; x.lineWidth = 1.6; PZ.rr(x, X - 12, Y - 12, 24, 24, 5); x.stroke();
      if (k === 0) { line(x, X - 10, Y, X + 10, Y, '#6f7f8a', 5.5); line(x, X - 10, Y, X + 10, Y, '#c4d0d8', 2.6); }
      else for (let j = 0; j < 3; j++) { const a = (j * Math.PI) / 3; line(x, X - Math.cos(a) * 6, Y - Math.sin(a) * 6, X + Math.cos(a) * 6, Y + Math.sin(a) * 6, '#5aa0d4', 1.8); }
    } },
    tent: { rim: '#386640', fill: '#5f9a62', cell(x, X, Y, k) {
      for (const d of [-14, -5, 4, 13]) { x.fillStyle = 'rgba(25,55,30,0.22)'; x.fillRect(X - 25, Y + d, 50, 3); }
      x.fillStyle = 'rgba(255,255,255,0.16)'; x.fillRect(X - 25, Y - 20, 50, 4);
      x.fillStyle = '#2e3a30'; x.fillRect(X - 2.6, Y - 25, 5.2, 50);
      if (k === 0) { x.fillStyle = '#e8873a'; PZ.rr(x, X + 6, Y - 7, 9, 13, 2.5); x.fill(); disc(x, X + 10.5, Y - 3.5, 1.4, '#fffaf1'); }
    } },
    sleeping: { rim: '#5a4398', fill: '#8a6cc6', cell(x, X, Y, k) {
      x.strokeStyle = 'rgba(255,255,255,0.3)'; x.lineWidth = 1.3; x.beginPath();
      for (let d = -36; d <= 36; d += 12) { x.moveTo(X + d - 25, Y - 25); x.lineTo(X + d + 25, Y + 25); x.moveTo(X + d + 25, Y - 25); x.lineTo(X + d - 25, Y + 25); }
      x.stroke();
      for (const [a, b] of [[-12, 0], [12, 0], [0, -12], [0, 12]]) disc(x, X + a, Y + b, 2.6, 'rgba(255,255,255,0.18)');
      if (k === 0) { line(x, X - 18, Y + 17, X + 18, Y + 17, '#f2d88a', 2); disc(x, X + 15, Y + 17, 2.6, '#f2d88a'); }
    } },
    boxes: { rim: '#94693c', fill: '#cfa36f', cell(x, X, Y, k) {
      x.fillStyle = '#e6c895'; x.fillRect(X - 5, Y - 25, 10, 50);
      x.fillStyle = 'rgba(120,85,45,0.18)'; x.fillRect(X - 5, Y - 25, 1.5, 50); x.fillRect(X + 3.5, Y - 25, 1.5, 50);
      line(x, X - 20, Y, X - 6, Y, 'rgba(110,75,40,0.45)', 1.2); line(x, X + 6, Y, X + 20, Y, 'rgba(110,75,40,0.45)', 1.2);
      if (k === 0) for (const dx of [-15, -9]) { line(x, X + dx, Y + 15, X + dx, Y + 7, '#5b3a24', 1.6); line(x, X + dx - 2.5, Y + 9.5, X + dx, Y + 7, '#5b3a24', 1.6); line(x, X + dx + 2.5, Y + 9.5, X + dx, Y + 7, '#5b3a24', 1.6); }
    } },
    basket: { rim: '#86592c', fill: '#c99a5b', cell(x, X, Y, k) {
      for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) {
        const cx = X - 15 + a * 10, cy = Y - 15 + b * 10;
        if ((a + b) % 2) line(x, cx - 3.5, cy, cx + 3.5, cy, '#a3743b', 3); else line(x, cx, cy - 3.5, cx, cy + 3.5, '#a3743b', 3);
      }
      if (k === 0) {
        x.save(); x.translate(X + 4, Y - 4); x.rotate(0.5);
        x.fillStyle = '#fffaf1'; x.fillRect(-11, -11, 22, 22);
        x.fillStyle = 'rgba(201,71,79,0.55)'; for (let j = -11; j < 11; j += 7.4) { x.fillRect(j, -11, 3.7, 22); x.fillRect(-11, j, 22, 3.7); }
        x.restore();
      }
    } },
    beachbag: { rim: '#2c7a75', fill: '#f4ecdc', cell(x, X, Y, k) {
      x.fillStyle = '#3f9a94'; x.fillRect(X - 15, Y - 25, 7, 50); x.fillRect(X + 3, Y - 25, 7, 50);
      if (k === 0) { x.strokeStyle = '#b48a5e'; x.lineWidth = 3; x.beginPath(); x.moveTo(X - 9, Y - 4); x.quadraticCurveTo(X, Y - 22, X + 9, Y - 4); x.stroke(); }
      if (k === 1) star(x, X - 2, Y + 9, 8, '#e8875a');
    } },
  };
  // what goes in the kiln: pots seen from above on a kiln shelf (a bat), each
  // load its own shape, glaze and pattern
  const glint = (x, X, Y, rad) => { x.fillStyle = 'rgba(255,255,255,0.45)'; x.beginPath(); x.ellipse(X - rad * 0.35, Y - rad * 0.4, rad * 0.32, rad * 0.18, -0.6, 0, 7); x.fill(); };
  Object.assign(LOADS, {
    bowls: { rim: '#8d877b', fill: '#d9d2c4', cell(x, X, Y) {
      disc(x, X + 1.5, Y + 2, 19, 'rgba(60,50,40,0.25)');
      disc(x, X, Y, 19, '#4c80b6'); disc(x, X, Y, 17, '#8fbfe6'); disc(x, X, Y, 11, '#a9cdee');
      ring(x, X, Y, 6, 'rgba(76,128,182,0.6)', 1.4);
      for (let j = 0; j < 10; j++) { const a = j * 0.628; disc(x, X + Math.cos(a) * 14, Y + Math.sin(a) * 14, 1.5, '#4c80b6'); }
      glint(x, X, Y, 17);
    } },
    mugs: { rim: '#7f7b72', fill: '#cfc8ba', cell(x, X, Y, k) {
      disc(x, X + 1.5, Y + 2, 15, 'rgba(60,50,40,0.25)');
      line(x, X + 12, Y, X + 21, Y, '#4c9470', 6); line(x, X + 12, Y, X + 21, Y, '#a5d7ba', 3);
      disc(x, X, Y, 15, '#4c9470'); disc(x, X, Y, 12.5, '#a5d7ba');
      for (const d of [5, 9]) ring(x, X, Y, d, '#4c9470', 1.8);
      disc(x, X, Y, 2.4, '#4c9470');
      glint(x, X, Y, 13);
    } },
    jugs: { rim: '#8a7c62', fill: '#dacdb2', cell(x, X, Y) {
      disc(x, X + 1.5, Y + 2, 16, 'rgba(60,50,40,0.25)');
      x.fillStyle = '#bb8e2a'; x.beginPath(); x.moveTo(X - 13, Y - 6); x.lineTo(X - 22, Y); x.lineTo(X - 13, Y + 6); x.closePath(); x.fill();
      line(x, X + 13, Y, X + 21, Y, '#bb8e2a', 6); line(x, X + 13, Y, X + 21, Y, '#f2d88a', 3);
      disc(x, X, Y, 15.5, '#bb8e2a'); disc(x, X, Y, 13, '#f2d88a'); disc(x, X, Y, 7, '#e9cb72');
      star(x, X, Y, 5.4, '#bb8e2a');
      glint(x, X, Y, 13);
    } },
    vases: { rim: '#8e7a7a', fill: '#ddcfcb', cell(x, X, Y) {
      disc(x, X + 1.5, Y + 2, 17, 'rgba(60,50,40,0.25)');
      disc(x, X, Y, 17, '#c4625a'); disc(x, X, Y, 15, '#efb4ae');
      x.fillStyle = '#c4625a';
      x.beginPath(); x.moveTo(X, Y + 12); x.bezierCurveTo(X - 13, Y + 3, X - 7, Y - 10, X, Y - 4); x.bezierCurveTo(X + 7, Y - 10, X + 13, Y + 3, X, Y + 12); x.fill();
      disc(x, X, Y - 1, 4.4, '#efb4ae'); disc(x, X, Y - 1, 2.6, '#7a3a34');
      glint(x, X, Y, 15);
    } },
    plates: { rim: '#7d7790', fill: '#d6d0de', cell(x, X, Y) {
      disc(x, X + 1.5, Y + 2, 21, 'rgba(60,50,40,0.25)');
      disc(x, X, Y, 21, '#7660b0'); disc(x, X, Y, 19.5, '#bba9df');
      ring(x, X, Y, 15.5, '#7660b0', 3); ring(x, X, Y, 9, 'rgba(118,96,176,0.5)', 1.2);
      glint(x, X, Y, 19);
    } },
    teapots: { rim: '#6f8686', fill: '#cfdcdc', cell(x, X, Y, k) {
      disc(x, X + 1.5, Y + 2, 15, 'rgba(60,50,40,0.25)');
      if (k === 0) { line(x, X - 12, Y + 3, X - 22, Y - 4, '#3f8a8c', 5); line(x, X - 12, Y + 3, X - 22, Y - 4, '#a6d3d4', 2.6); line(x, X + 12, Y, X + 21, Y, '#3f8a8c', 6); line(x, X + 12, Y, X + 21, Y, '#a6d3d4', 3); }
      disc(x, X, Y, 15, '#3f8a8c'); disc(x, X, Y, 13, '#a6d3d4');
      for (let j = 0; j < 4; j++) { const a = j * 1.571 + 0.785; line(x, X + Math.cos(a) * 9, Y + Math.sin(a) * 9, X + Math.cos(a) * 13, Y + Math.sin(a) * 13, '#3f8a8c', 2.2); }
      disc(x, X, Y, 7.5, '#3f8a8c'); disc(x, X, Y, 6, '#bfe0e0'); disc(x, X, Y, 2.4, '#3f8a8c');
      glint(x, X, Y, 13);
    } },
    flowerpots: { rim: '#8a6a58', fill: '#dcc7b5', cell(x, X, Y) {
      disc(x, X + 1.5, Y + 2, 17, 'rgba(60,50,40,0.25)');
      disc(x, X, Y, 17, '#a4553a'); disc(x, X, Y, 15, '#cf7d55'); ring(x, X, Y, 12, '#a4553a', 1.6);
      disc(x, X, Y, 10.5, '#b8653f'); disc(x, X, Y, 3, '#5a2e1f');
      x.strokeStyle = 'rgba(255,220,190,0.45)'; x.lineWidth = 2; x.beginPath(); x.arc(X, Y, 14, 3.6, 5.2); x.stroke();
    } },
  });
  const BOAT = ['crates', 'sacks', 'barrels', 'apples', 'rope', 'logs', 'pots'];
  const VAN = ['suitcase', 'coolbox', 'tent', 'sleeping', 'boxes', 'basket', 'beachbag'];
  const KILN = ['bowls', 'mugs', 'jugs', 'vases', 'plates', 'teapots', 'flowerpots'];

  // the outline of a load: every square rounded, and joined to its neighbours
  function blobPath(x, cells, inset, rad) {
    const has = new Set(cells.map((p) => p.join(','))), at = (c, r) => has.has(c + ',' + r), e = inset + rad;
    x.beginPath();
    for (const [c, r] of cells) {
      const X = c * CELL, Y = r * CELL;
      x.roundRect(X + inset, Y + inset, CELL - 2 * inset, CELL - 2 * inset, rad);
      if (at(c + 1, r)) x.rect(X + CELL - e, Y + inset, 2 * e, CELL - 2 * inset);
      if (at(c, r + 1)) x.rect(X + inset, Y + CELL - e, CELL - 2 * inset, 2 * e);
      if (at(c + 1, r) && at(c, r + 1) && at(c + 1, r + 1)) x.rect(X + CELL - e, Y + CELL - e, 2 * e, 2 * e);
    }
  }
  // each load is drawn once, sharp, the way it was cut; it is then stamped
  // turned and scaled wherever it is (its middle on x, y)
  function pictureOf(P) {
    if (P.pic) return P.pic;
    const T = P.turns[0], w = T.w * CELL + PAD * 2, h = T.h * CELL + PAD * 2;
    const make = (paint) => { const cv = U.canvas(w * RES, h * RES), x = cv.getContext('2d'); x.scale(RES, RES); x.translate(PAD, PAD); paint(x); return cv; };
    P.pic = {
      w, h,
      body: make((x) => {
        const L = P.look;
        x.fillStyle = L.rim; blobPath(x, T.cells, 2.5, 10); x.fill();
        x.fillStyle = L.fill; blobPath(x, T.cells, 5, 8); x.fill();
        x.save(); blobPath(x, T.cells, 5, 8); x.clip();
        T.cells.forEach(([c, r], k) => L.cell(x, c * CELL + CELL / 2, r * CELL + CELL / 2, k));
        x.restore();
      }),
      shade: make((x) => { x.fillStyle = '#2b2118'; blobPath(x, T.cells, 3, 10); x.fill(); }),
    };
    return P.pic;
  }
  function drawLoad(c, P, x, y, a, s, lift) {
    const p = pictureOf(P);
    c.save(); c.globalAlpha = 0.24; c.translate(x + 2 + lift * 2, y + 3 + lift * 3); c.rotate(a); c.scale(s, s);
    c.drawImage(p.shade, -p.w / 2, -p.h / 2, p.w, p.h); c.restore();
    c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
    c.drawImage(p.body, -p.w / 2, -p.h / 2, p.w, p.h); c.restore();
  }

  // --------------------------------------------------------------- SCENE
  function pack(S) {
    const r = S.r, van = S.opts.what === 'van', kiln = S.opts.what === 'kiln';
    const { cols, shapes } = generate(r);
    const GX = (360 - cols * CELL) / 2, GX1 = GX + cols * CELL;
    const looks = PZ.shuffle(r, (van ? VAN : kiln ? KILN : BOAT).slice());
    const slots = slotsFor(shapes.length);
    const sol = shapes.map((cells) => ({ k: 0, col: Math.min(...cells.map((p) => p[0])), row: Math.min(...cells.map((p) => p[1])) }));
    const pieces = shapes.map((cells, i) => {
      const turns = turnsOf(cells);
      const uniq = [0, 1, 2, 3].filter((k) => turns.findIndex((t) => t.key === turns[k].key) === k);
      const spin = (r() * 4) | 0;
      return { i, turns, uniq, look: LOADS[looks[i]], name: looks[i], spin, state: 'wait', k: 0, col: 0, row: 0, slot: slots[i], x: slots[i].x, y: slots[i].y, s: SK, a: spin * TURN, bump: 0, land: 1, pic: null };
    });
    const K = pieces.length, grid = new Array(cols * ROWS).fill(-1);
    // a few things placed differently every time
    const duckX = r() < 0.5 ? 30 + r() * 26 : 304 + r() * 26, birdSide = r() < 0.5;
    let placed = 0, press = null, held = null, fx = null, note = 0;
    let hint = null, hintT = 0;

    const left = () => pieces.filter((P) => P.state !== 'placed').map((P) => P.i);
    const centre = (T, col, row) => ({ x: GX + (col + T.w / 2) * CELL, y: GY + (row + T.h / 2) * CELL });
    const over = (x, y) => x > GX - CELL / 2 && x < GX1 + CELL / 2 && y > GY - CELL / 2 && y < GY1 + CELL / 2;
    // the squares a load lands on when let go with its middle at x, y
    const snap = (T, x, y) => ({
      col: U.clamp(Math.round((x - GX) / CELL - T.w / 2), 0, cols - T.w),
      row: U.clamp(Math.round((y - GY) / CELL - T.h / 2), 0, ROWS - T.h),
    });
    const free = (T, col, row) => T.cells.every(([c, rr]) => grid[(row + rr) * cols + col + c] < 0);
    // 'ok', 'full' (something is in the way) or 'stuck' (the rest would not fit then)
    function verdict(i, k, col, row) {
      const T = pieces[i].turns[k];
      if (!free(T, col, row)) return 'full';
      const g = grid.slice();
      for (const [c, rr] of T.cells) g[(row + rr) * cols + col + c] = i;
      return solve(cols, g, left().filter((j) => j !== i), pieces) ? 'ok' : 'stuck';
    }
    function placeIn(i, k, col, row, pay) {
      const P = pieces[i], T = P.turns[k];
      for (const [c, rr] of T.cells) grid[(row + rr) * cols + col + c] = i;
      Object.assign(P, { state: 'placed', k, col, row });
      placed++;
      hintT = 0;
      const m = centre(T, col, row);
      if (pay) {
        P.land = 0;
        fx.good(m.x, m.y); fx.sound('happy');
        if (placed === K) fx.sound('chime');
      } else Object.assign(P, { spin: k, x: m.x, y: m.y, s: 1, a: k * TURN, land: 1 });
    }
    const slotAt = (x, y) => pieces.findIndex((P) => P.state === 'wait' && Math.abs(x - P.slot.x) <= 58 && Math.abs(y - P.slot.y) <= 52);
    function lift(i, x, y) {
      held = { i, tx: x, ty: y - PZ.LIFT };
      pieces[i].state = 'held';
      press = null;
      fx.sound('pick');
    }
    function letGo(x, y) {
      const P = pieces[held.i], k = P.spin % 4, T = P.turns[k];
      held = null;
      if (over(x, y)) {
        const p = snap(T, x, y), v = verdict(P.i, k, p.col, p.row);
        if (v === 'ok') { placeIn(P.i, k, p.col, p.row, true); return; }
        if (v === 'stuck') note = 2.2;
        P.state = 'wait'; fx.sound('nope'); return;
      }
      // set down ashore again is not a wrong move
      P.state = 'wait'; fx.sound(y > SHORE - 30 ? 'drop' : 'nope');
    }

    // a ghost of a load lying on the squares col, row of the hold
    function ghost(c, T, col, row, a, dashed) {
      for (const [cc, rr] of T.cells) {
        const x = GX + (col + cc) * CELL, y = GY + (row + rr) * CELL;
        c.fillStyle = `rgba(255,250,235,${a})`; PZ.rr(c, x + 4, y + 4, CELL - 8, CELL - 8, 9); c.fill();
        if (dashed) { c.strokeStyle = 'rgba(255,250,235,0.9)'; c.lineWidth = 2; c.setLineDash([6, 5]); c.stroke(); c.setLineDash([]); }
      }
    }
    // a little round arrow: this one wants turning first
    function turnBadge(c, x, y, t) {
      const k = 0.5 + 0.5 * Math.sin(t * 5);
      PZ.shadow(c, x + 1, y + 3, 13, 4, 0.15);
      c.fillStyle = PZ.PAPER; c.beginPath(); c.arc(x, y, 13, 0, 7); c.fill();
      c.strokeStyle = `rgba(232,181,46,${0.6 + 0.4 * k})`; c.lineWidth = 2.5; c.stroke();
      c.strokeStyle = PZ.INK; c.lineWidth = 2.4; c.lineCap = 'round';
      c.beginPath(); c.arc(x, y, 6.5, -2.6, 1.6); c.stroke();
      c.fillStyle = PZ.INK; c.beginPath(); c.moveTo(x - 1.2, y + 3.4); c.lineTo(x + 5.2, y + 6.4); c.lineTo(x - 0.2, y + 10.4); c.closePath(); c.fill();
    }

    const sc = {
      puzzle: true, indoor: kiln, steps: K,
      crop: { x: 0, y: 60, w: 360, h: 360 },
      decor(c) {
        const L = { GX, GX1, cols, duckX };
        if (van) vanDecor(c, S.bleed, L); else if (kiln) kilnDecor(c, S.bleed, L); else boatDecor(c, S.bleed, L);
        // the rule, on a card at the top
        c.fillStyle = 'rgba(40,40,30,0.14)'; PZ.rr(c, 54, 14, 252, 46, 13); c.fill();
        c.fillStyle = PZ.PAPER; PZ.rr(c, 54, 10, 252, 46, 13); c.fill();
        c.strokeStyle = '#e5d9c6'; c.lineWidth = 1.2; c.stroke();
        PZ.text(c, van ? 'Fit it all into the van' : kiln ? 'Fit every pot into the kiln' : 'Fit it all into the hold', 180, 27, { size: 16 });
        PZ.text(c, van ? 'drag to pack · tap to turn' : 'drag to load · tap to turn', 180, 45, { size: 13, color: PZ.INK2, weight: 700 });
      },
      draw(c, t, still) {
        // where the load in the hand would land
        if (held && !still && over(held.tx, held.ty)) {
          const T = pieces[held.i].turns[pieces[held.i].spin % 4], p = snap(T, held.tx, held.ty);
          if (free(T, p.col, p.row)) ghost(c, T, p.col, p.row, 0.2, true);
        }
        for (const P of pieces) {
          if (P.state !== 'placed') continue;
          if (still) { const m = centre(P.turns[P.k], P.col, P.row); drawLoad(c, P, m.x, m.y, P.k * TURN, 1, 0); }
          else drawLoad(c, P, P.x, P.y, P.a, P.s * (1 + 0.05 * Math.sin(P.land * Math.PI)), (1 - P.land) * 2);
        }
        // the hint: where one load goes, turned the right way, and which one
        if (!still && hint && hintT > 0 && pieces[hint.i].state !== 'placed') {
          const P = pieces[hint.i], T = P.turns[hint.k];
          c.globalAlpha = Math.min(1, hintT / 0.4);
          ghost(c, T, hint.col, hint.row, 0.14 + 0.1 * Math.sin(t * 5), true);
          if (P.state === 'wait') PZ.glow(c, P.slot.x, P.slot.y, 50, t);
          c.globalAlpha = 1;
        }
        for (const P of pieces) {
          if (P.state !== 'wait') continue;
          if (still) drawLoad(c, P, P.slot.x, P.slot.y, (P.spin % 4) * TURN, SK, 0);
          else drawLoad(c, P, P.x, P.y, P.a, P.s, 0.3);
        }
        if (!still && hint && hintT > 0 && pieces[hint.i].state === 'wait') {
          const P = pieces[hint.i];
          if (P.turns[P.spin % 4].key !== P.turns[hint.k].key) { c.globalAlpha = Math.min(1, hintT / 0.4); turnBadge(c, P.slot.x + 44, P.slot.y - 36, t); c.globalAlpha = 1; }
        }
        if (held && !still) { const P = pieces[held.i]; drawLoad(c, P, P.x, P.y, P.a, P.s, 3); }
        // why a load that fits did not go in
        if (!still && note > 0) {
          c.globalAlpha = Math.min(1, note / 0.4, (2.2 - note) / 0.15);
          PZ.shadow(c, 180, 89, 104, 5, 0.12);
          c.fillStyle = PZ.PAPER; PZ.rr(c, 76, 66, 208, 24, 12); c.fill();
          PZ.text(c, 'Then the rest would not fit', 180, 78.5, { size: 13, color: PZ.INK2 });
          c.globalAlpha = 1;
        }
        // once it is all in, someone comes to have a look
        if (placed === K) {
          const bob = still ? 0 : Math.sin(t * 2.2) * 1.2;
          if (van) gull(c, birdSide ? 332 : 28, SHORE + 2 + bob, birdSide ? -1 : 1);
          else if (kiln) cat(c, birdSide ? 334 : 26, SHORE + 14, birdSide ? -1 : 1, still ? 0 : t);
          else kingfisher(c, birdSide ? 334 : 26, SHORE - 4 + bob, birdSide ? -1 : 1);
        }
      },
      step(dt) {
        hintT -= dt; note = Math.max(0, note - dt);
        for (const P of pieces) {
          let tx = P.slot.x, ty = P.slot.y, ts = SK * (1 + 0.07 * P.bump), sp = 12;
          if (P.state === 'held') { tx = held.tx; ty = held.ty; ts = 1; sp = 22; }
          else if (P.state === 'placed') { const m = centre(P.turns[P.k], P.col, P.row); tx = m.x; ty = m.y; ts = 1; sp = 18; }
          P.x = PZ.approach(P.x, tx, dt, sp); P.y = PZ.approach(P.y, ty, dt, sp); P.s = PZ.approach(P.s, ts, dt, 14);
          P.a = PZ.approach(P.a, P.spin * TURN, dt, 16);
          P.bump = Math.max(0, P.bump - dt * 5);
          if (P.land < 1) P.land = Math.min(1, P.land + dt / 0.3);
        }
      },
      down(x, y) {
        if (held || press || placed === K) return;
        const i = slotAt(x, y);
        if (i < 0) return;
        press = { i, x0: x, y0: y };
        pieces[i].bump = 1;
      },
      move(x, y) {
        if (press && PZ.dist(x, y, press.x0, press.y0) > TAP) lift(press.i, x, y);
        if (held) { held.tx = x; held.ty = y - PZ.LIFT; }
      },
      up(x, y) {
        if (press) {
          // a tap turns it a quarter, clockwise
          if (PZ.dist(x, y, press.x0, press.y0) <= TAP) { pieces[press.i].spin++; press = null; fx.sound('turn'); return; }
          lift(press.i, x, y);
        }
        if (held) letGo(x, y - PZ.LIFT); // judged where it is drawn
      },
      cancel() {
        press = null;
        if (held) { pieces[held.i].state = 'wait'; held = null; }
      },
      progress: () => placed / K,
      solved: () => placed === K,
      // one load and where it goes, from a way of finishing that fits what
      // is in the hold already and needs the fewest taps
      hint() {
        if (placed === K) return;
        const m = solve(cols, grid, left(), pieces, pieces.map((P) => P.spin % 4));
        if (!m) return;
        hint = m[0]; hintT = 3.5;
      },
      // the loads in the hold as [load, turn, col, row], and how each one
      // still ashore is turned
      save: () => ({
        hold: pieces.filter((P) => P.state === 'placed').map((P) => [P.i, P.k, P.col, P.row]),
        turns: pieces.map((P) => P.spin % 4),
      }),
      load(s) {
        if (!s || !Array.isArray(s.hold) || !Array.isArray(s.turns) || s.turns.length !== K) return;
        const int = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
        if (!s.turns.every((v) => int(v, 0, 3))) return;
        const g = grid.slice(), seen = new Set();
        for (const m of s.hold) {
          if (!Array.isArray(m) || m.length !== 4 || !int(m[0], 0, K - 1) || seen.has(m[0]) || !int(m[1], 0, 3)) return;
          const T = pieces[m[0]].turns[m[1]];
          if (!int(m[2], 0, cols - T.w) || !int(m[3], 0, ROWS - T.h)) return;
          if (T.cells.some(([c, rr]) => g[(m[3] + rr) * cols + m[2] + c] >= 0)) return;
          for (const [c, rr] of T.cells) g[(m[3] + rr) * cols + m[2] + c] = m[0];
          seen.add(m[0]);
        }
        // made for another layout if the rest cannot fit round it
        if (!solve(cols, g, pieces.map((P) => P.i).filter((i) => !seen.has(i)), pieces)) return;
        s.turns.forEach((v, i) => { const P = pieces[i]; P.spin = v; P.a = v * TURN; });
        for (const m of s.hold) placeIn(m[0], m[1], m[2], m[3], false);
      },
      solveAll() {
        const m = solve(cols, grid, left(), pieces, pieces.map((P) => P.spin % 4)) || [];
        for (const v of m) placeIn(v.i, v.k, v.col, v.row, false);
      },
      // finger positions: taps on a load ashore until it lies the right way,
      // then a drag that lets go PZ.LIFT below where its middle should be
      debugPlan() {
        const m = solve(cols, grid, left(), pieces, pieces.map((P) => P.spin % 4)) || [];
        // any order finishes it; the loads that need no turning go first
        const moves = m.map((v) => {
          const P = pieces[v.i], want = P.turns[v.k].key;
          let taps = 0;
          while (taps < 4 && P.turns[(P.spin + taps) % 4].key !== want) taps++;
          return { v, P, taps };
        }).sort((a, b) => a.taps - b.taps);
        const plan = [];
        for (const { v, P, taps } of moves) {
          for (let j = 0; j < taps; j++) plan.push({ tap: [P.slot.x, P.slot.y] });
          const k = (P.spin + taps) % 4, at = centre(P.turns[k], v.col, v.row);
          plan.push({ drag: [P.slot.x, P.slot.y, at.x, at.y + PZ.LIFT] });
        }
        return plan;
      },
      // test hook for the generator sweep
      debugLayout: () => ({ cols, looks: pieces.map((P) => P.name), shapes: shapes.map((s) => s.map((p) => p.slice())), sol: sol.map((v) => Object.assign({}, v)), spins: pieces.map((P) => P.spin % 4) }),
    };
    Object.defineProperty(sc, 'fx', { get: () => fx, set: (v) => { fx = v; } });
    return sc;
  }

  // ---------------------------------------------------------- BACKDROPS
  // the narrowboat, seen from above, moored along the towpath
  function hullPath(c, bx, sx, ty, by, d) {
    const mid = (ty + by) / 2;
    c.beginPath();
    c.moveTo(bx + d * 1.8, mid);
    c.bezierCurveTo(bx + 16 + d, ty + d + 8, bx + 46, ty + d, bx + 74, ty + d);
    c.lineTo(sx - 46, ty + d);
    c.bezierCurveTo(sx - d + 4, ty + d, sx - d, mid - 70, sx - d, mid);
    c.bezierCurveTo(sx - d, mid + 70, sx - d + 4, by - d, sx - 46, by - d);
    c.lineTo(bx + 74, by - d);
    c.bezierCurveTo(bx + 46, by - d, bx + 16 + d, by - d - 8, bx + d * 1.8, mid);
    c.closePath();
  }
  function rope(c, ax, ay, bx, by, sag) {
    c.lineCap = 'round';
    for (const [col, w, dy] of [['rgba(30,40,30,0.25)', 3.4, 2], ['#a88c5a', 3, 0], ['#dcc48e', 1.6, -0.4]]) {
      c.strokeStyle = col; c.lineWidth = w;
      c.beginPath(); c.moveTo(ax, ay + dy); c.quadraticCurveTo((ax + bx) / 2, Math.max(ay, by) + sag + dy, bx, by + dy); c.stroke();
    }
  }
  function boatDecor(c, B, L) {
    const dr = U.rng(7121), bw = B.x1 - B.x0, { GX, GX1 } = L;
    const top = GY - 26, bot = GY1 + 26, mid = (top + bot) / 2, bowX = GX - 74, sternX = GX1 + 104;
    // the canal, with ripples
    const water = c.createLinearGradient(0, B.y0, 0, SHORE);
    water.addColorStop(0, '#79a6a0'); water.addColorStop(1, '#5d8d88');
    c.fillStyle = water; c.fillRect(B.x0, B.y0, bw, SHORE - B.y0 + 4);
    for (let i = 0; i < 90; i++) {
      const x = B.x0 + dr() * bw, y = B.y0 + dr() * (SHORE - B.y0), l = 8 + dr() * 14;
      c.strokeStyle = dr() < 0.55 ? 'rgba(235,250,245,0.26)' : 'rgba(30,70,65,0.2)'; c.lineWidth = 1.3;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + l / 2, y - 2.2, x + l, y); c.stroke();
    }
    // reeds where the water meets the towpath
    for (const x0 of [B.x0 + 4, B.x1 - 42]) {
      for (let i = 0; i < 7; i++) {
        const x = x0 + i * 5 + dr() * 3, h = 16 + dr() * 16;
        c.strokeStyle = i % 2 ? '#5f8f4a' : '#7aa85a'; c.lineWidth = 2; c.lineCap = 'round';
        c.beginPath(); c.moveTo(x, SHORE + 2); c.quadraticCurveTo(x - 2, SHORE - h / 2, x + 1 - dr() * 4, SHORE - h); c.stroke();
        if (i % 3 === 1) { c.fillStyle = '#7a553d'; PZ.rr(c, x - 2.4, SHORE - h - 3, 5, 11, 2.5); c.fill(); }
      }
    }
    // the towpath: coping stones along the edge, then gravel, grass beyond
    c.fillStyle = '#cdbf9f'; c.fillRect(B.x0, SHORE, bw, B.y1 - SHORE);
    for (let i = 0; i < 460; i++) {
      c.fillStyle = dr() < 0.5 ? 'rgba(150,135,105,0.5)' : 'rgba(245,238,220,0.6)';
      c.beginPath(); c.arc(B.x0 + dr() * bw, SHORE + 18 + dr() * (B.y1 - SHORE - 18), 0.7 + dr() * 1.4, 0, 7); c.fill();
    }
    c.fillStyle = 'rgba(25,50,45,0.3)'; c.fillRect(B.x0, SHORE - 3, bw, 4);
    for (let x = Math.floor(B.x0 / 46) * 46; x < B.x1; x += 46) {
      c.fillStyle = '#e4ddcc'; PZ.rr(c, x + 1, SHORE, 44, 16, 3); c.fill();
      c.fillStyle = 'rgba(110,100,85,0.28)'; c.fillRect(x + 1, SHORE + 13, 44, 3);
      c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(x + 3, SHORE + 1.5, 40, 1.5);
    }
    c.fillStyle = '#9dbf7e'; c.fillRect(B.x0, 592, bw, B.y1 - 592);
    for (let x = B.x0; x < B.x1; x += 4) {
      c.strokeStyle = dr() < 0.5 ? '#86ad68' : '#b2d08f'; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(x, 594); c.lineTo(x + dr() * 3 - 1.5, 586 - dr() * 6); c.stroke();
    }
    // the boat's shadow, hull, painted band, gunwale and deck
    c.fillStyle = 'rgba(15,40,35,0.3)'; hullPath(c, bowX + 4, sternX + 4, top + 7, bot + 7, 0); c.fill();
    c.fillStyle = '#21423a'; hullPath(c, bowX, sternX, top, bot, 0); c.fill();
    c.fillStyle = '#b8423f'; hullPath(c, bowX, sternX, top, bot, 4); c.fill();
    c.fillStyle = '#2f5b4d'; hullPath(c, bowX, sternX, top, bot, 8); c.fill();
    c.fillStyle = '#b48a58'; hullPath(c, bowX, sternX, top, bot, 12); c.fill();
    c.save(); hullPath(c, bowX, sternX, top, bot, 12); c.clip();
    for (let y = top + 12; y < bot; y += 9) { c.fillStyle = 'rgba(120,85,45,0.28)'; c.fillRect(bowX, y, sternX - bowX, 1.2); }
    c.restore();
    // the cratch board at the bow, painted with diamonds, and a rope fender
    c.fillStyle = '#2f5b4d';
    c.beginPath(); c.moveTo(GX - 14, top + 16); c.lineTo(GX - 14, bot - 16); c.lineTo(bowX + 34, mid); c.closePath(); c.fill();
    c.strokeStyle = '#e8b52e'; c.lineWidth = 2; c.stroke();
    for (let j = 0; j < 3; j++) {
      const x = GX - 26 - j * 13, s = 5.5 - j;
      c.fillStyle = j % 2 ? '#e8b52e' : '#c9474f';
      c.beginPath(); c.moveTo(x, mid - s * 1.6); c.lineTo(x + s, mid); c.lineTo(x, mid + s * 1.6); c.lineTo(x - s, mid); c.closePath(); c.fill();
    }
    c.fillStyle = '#c9a27a'; c.beginPath(); c.ellipse(bowX + 3, mid, 8, 13, 0, 0, 7); c.fill();
    c.strokeStyle = 'rgba(120,85,45,0.6)'; c.lineWidth = 1;
    for (let y = mid - 10; y <= mid + 10; y += 4) { c.beginPath(); c.moveTo(bowX - 4, y); c.lineTo(bowX + 10, y + 1.5); c.stroke(); }
    // the cabin roof at the stern: chimney, a brass vent and pots of geraniums
    const rx = GX1 + 18;
    c.fillStyle = 'rgba(30,40,30,0.2)'; PZ.rr(c, rx + 3, top + 18, sternX - 30 - rx, bot - top - 28, 12); c.fill();
    c.fillStyle = '#efe6d4'; PZ.rr(c, rx, top + 14, sternX - 30 - rx, bot - top - 28, 12); c.fill();
    c.strokeStyle = '#2f5b4d'; c.lineWidth = 3; c.stroke();
    disc(c, rx + 20, top + 40, 8.5, '#2b2b2b'); ring(c, rx + 20, top + 40, 8, '#d8b45a', 2.4); disc(c, rx + 20, top + 40, 3.5, '#111');
    disc(c, rx + 20, bot - 42, 6, '#d8b45a'); disc(c, rx + 20, bot - 42, 3, '#b08f3a');
    for (const [px, py] of [[rx + 37, mid - 24], [rx + 37, mid + 24]]) {
      disc(c, px + 1.5, py + 2, 10, 'rgba(30,40,30,0.25)'); disc(c, px, py, 10, '#cf7d55'); disc(c, px, py, 7.5, '#5b8a50');
      for (let j = 0; j < 5; j++) { const a = j * 1.2566 + 0.4; disc(c, px + Math.cos(a) * 4.5, py + Math.sin(a) * 4.5, 2.6, '#d9483b'); }
    }
    // the open hold: a dark rim, a floor of boards and chalk squares
    c.fillStyle = '#4b3324'; PZ.rr(c, GX - 9, GY - 9, GX1 - GX + 18, GY1 - GY + 18, 8); c.fill();
    c.fillStyle = '#7d5c41'; c.fillRect(GX - 3, GY - 3, GX1 - GX + 6, GY1 - GY + 6);
    for (let y = GY; y < GY1; y += 12.5) { c.fillStyle = 'rgba(60,38,24,0.35)'; c.fillRect(GX - 3, y, GX1 - GX + 6, 1.4); }
    for (let i = 0; i < 160; i++) { c.fillStyle = dr() < 0.5 ? 'rgba(160,120,85,0.35)' : 'rgba(55,36,24,0.3)'; c.fillRect(GX + dr() * (GX1 - GX), GY + dr() * (GY1 - GY), 3 + dr() * 6, 0.9); }
    c.fillStyle = 'rgba(25,15,8,0.3)'; c.fillRect(GX - 3, GY - 3, GX1 - GX + 6, 5);
    chalk(c, GX, GX1);
    // bollards on the towpath and the mooring ropes out to the boat
    rope(c, GX - 30, bot - 12, 24, SHORE + 8, 14);
    rope(c, GX1 + 54, bot - 12, 336, SHORE + 8, 14);
    for (const x of [24, 336]) { disc(c, x + 1, SHORE + 10, 7.5, 'rgba(0,0,0,0.25)'); disc(c, x, SHORE + 8, 7, '#2e2e2e'); disc(c, x - 2, SHORE + 6, 2.2, 'rgba(255,255,255,0.3)'); }
    // a mallard paddling by
    duck(c, L.duckX, 84);
  }
  // squares in chalk on the floor of the hold (or the van; in pencil on the kiln floor)
  function chalk(c, GX, GX1, pencil) {
    c.strokeStyle = pencil ? 'rgba(120,100,80,0.45)' : 'rgba(245,235,210,0.5)'; c.lineWidth = 1.6; c.setLineDash([5, 4]);
    c.beginPath();
    for (let x = GX + CELL; x < GX1 - 1; x += CELL) { c.moveTo(x, GY + 3); c.lineTo(x, GY1 - 3); }
    for (let y = GY + CELL; y < GY1 - 1; y += CELL) { c.moveTo(GX + 3, y); c.lineTo(GX1 - 3, y); }
    c.stroke(); c.setLineDash([]);
    c.strokeStyle = pencil ? 'rgba(120,100,80,0.4)' : 'rgba(245,235,210,0.42)'; c.lineWidth = 2; PZ.rr(c, GX + 1, GY + 1, GX1 - GX - 2, GY1 - GY - 2, 4); c.stroke();
  }
  function duck(c, x, y) {
    c.strokeStyle = 'rgba(235,250,245,0.45)'; c.lineWidth = 1.4;
    for (const d of [16, 23]) { c.beginPath(); c.arc(x + 4, y + 2, d, 0.3, 1.2); c.stroke(); }
    c.fillStyle = 'rgba(20,45,40,0.25)'; c.beginPath(); c.ellipse(x + 2, y + 4, 14, 6, 0, 0, 7); c.fill();
    c.fillStyle = '#b9a78a'; c.beginPath(); c.ellipse(x, y, 13, 7.5, 0, 0, 7); c.fill();
    c.fillStyle = '#8c7a5e'; c.beginPath(); c.ellipse(x + 3, y - 1, 7, 4.5, 0.2, 0, 7); c.fill();
    c.fillStyle = '#3b3530'; c.beginPath(); c.moveTo(x + 9, y - 3); c.lineTo(x + 16, y - 6); c.lineTo(x + 13, y + 1); c.closePath(); c.fill();
    disc(c, x - 10, y - 5, 5.5, '#2f6f4f');
    c.fillStyle = '#fffaf1'; c.fillRect(x - 12.5, y - 0.5, 5, 1.6);
    c.fillStyle = '#e8b52e'; c.beginPath(); c.ellipse(x - 16, y - 4.5, 3.6, 1.8, -0.2, 0, 7); c.fill();
    disc(c, x - 11, y - 6.5, 0.9, '#111');
  }
  // the camper van, roof off, parked on the sand with its side door open
  function vanDecor(c, B, L) {
    const dr = U.rng(7393), bw = B.x1 - B.x0, { GX, GX1 } = L;
    const top = GY - 30, bot = GY1 + 30, vx0 = GX - 96, vx1 = GX1 + 30;
    // sand, the sea along the top and a line of foam
    c.fillStyle = '#ecd8ae'; c.fillRect(B.x0, B.y0, bw, B.y1 - B.y0);
    for (let i = 0; i < 700; i++) { c.fillStyle = dr() < 0.5 ? 'rgba(190,160,110,0.45)' : 'rgba(255,248,230,0.7)'; c.fillRect(B.x0 + dr() * bw, B.y0 + dr() * (B.y1 - B.y0), 1.3, 1.3); }
    c.fillStyle = '#86bfd3'; c.fillRect(B.x0, B.y0, bw, 52 - B.y0);
    c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.moveTo(B.x0, 52);
    for (let x = B.x0; x <= B.x1 + 12; x += 12) c.quadraticCurveTo(x + 6, 58 + (((x / 12) | 0) % 2) * 3, x + 12, 52);
    c.lineTo(B.x1 + 12, 46); c.lineTo(B.x0, 46); c.closePath(); c.fill();
    c.fillStyle = 'rgba(200,170,120,0.35)'; c.fillRect(B.x0, 58, bw, 6);
    // footprints and a shell or two
    for (let j = 0; j < 7; j++) {
      const x = 22 + j * 48 + dr() * 10, y = 364 - (j % 2) * 8;
      c.fillStyle = 'rgba(180,150,105,0.4)'; c.beginPath(); c.ellipse(x, y, 4, 6.5, 0.2, 0, 7); c.fill();
    }
    // the van: shadow, body, the white top edge and the floor inside
    c.fillStyle = 'rgba(80,60,30,0.22)'; PZ.rr(c, vx0 + 5, top + 8, vx1 - vx0, bot - top, 30); c.fill();
    for (const wx of [GX - 62, GX1 - 26]) for (const wy of [top - 5, bot - 7]) { c.fillStyle = '#2e2e2e'; PZ.rr(c, wx, wy, 34, 12, 5); c.fill(); }
    c.fillStyle = '#5f9a8c'; PZ.rr(c, vx0, top, vx1 - vx0, bot - top, 30); c.fill();
    c.fillStyle = '#8fc7b8'; PZ.rr(c, vx0 + 3, top + 3, vx1 - vx0 - 6, bot - top - 6, 27); c.fill();
    c.fillStyle = '#f4ecdc'; PZ.rr(c, vx0 + 9, top + 9, vx1 - vx0 - 18, bot - top - 18, 22); c.fill();
    c.fillStyle = '#5d6b6a'; PZ.rr(c, vx0 + 15, top + 15, vx1 - vx0 - 30, bot - top - 30, 17); c.fill();
    // the cab: the windscreen, the dashboard, two seats and a wheel
    c.fillStyle = '#a9d6e6'; PZ.rr(c, vx0 + 4, top + 22, 10, bot - top - 44, 5); c.fill();
    c.fillStyle = '#3e4747'; c.fillRect(vx0 + 15, top + 15, 14, bot - top - 30);
    for (const sy of [top + 30, bot - 76]) {
      c.fillStyle = '#e8875a'; PZ.rr(c, vx0 + 38, sy, 34, 46, 9); c.fill();
      c.fillStyle = '#d0704a'; PZ.rr(c, vx0 + 62, sy + 3, 10, 40, 4); c.fill();
    }
    ring(c, vx0 + 32, top + 53, 9, '#222', 3);
    c.fillStyle = '#4f8f80'; c.fillRect(GX - 16, top + 15, 6, bot - top - 30);
    // the floor of the back: a ribbed rubber mat with chalk squares
    c.fillStyle = '#8f9fa1'; c.fillRect(GX - 4, GY - 4, GX1 - GX + 8, GY1 - GY + 8);
    for (let y = GY - 2; y < GY1 + 2; y += 6) { c.fillStyle = 'rgba(40,55,58,0.2)'; c.fillRect(GX - 4, y, GX1 - GX + 8, 2); }
    c.fillStyle = 'rgba(30,40,40,0.25)'; c.fillRect(GX - 4, GY - 4, GX1 - GX + 8, 4);
    chalk(c, GX, GX1);
    // the side door slid back along the body, so the back is open to the sand
    c.fillStyle = '#ecd8ae'; c.fillRect(GX + 16, bot - 16, GX1 - GX - 32, 17);
    c.fillStyle = '#b9c3c4'; c.fillRect(GX + 16, bot - 16, GX1 - GX - 32, 7);
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(GX + 16, bot - 16, GX1 - GX - 32, 1.5);
    c.fillStyle = '#5f9a8c'; PZ.rr(c, GX1 - 70, bot - 4, 104, 12, 4); c.fill();
    c.fillStyle = '#8fc7b8'; PZ.rr(c, GX1 - 68, bot - 3, 100, 9, 3); c.fill();
    c.fillStyle = '#4b4a52'; PZ.rr(c, GX1 - 60, bot - 1, 14, 4, 2); c.fill();
    // lights and mirrors
    for (const y of [top + 12, bot - 22]) { c.fillStyle = '#d9483b'; PZ.rr(c, vx1 - 7, y, 6, 10, 2); c.fill(); }
    for (const y of [top - 7, bot - 3]) { c.fillStyle = '#4f8f80'; c.beginPath(); c.ellipse(vx0 + 44, y, 9, 5, 0, 0, 7); c.fill(); }
    // a striped beach towel where the things wait
    c.fillStyle = 'rgba(80,60,30,0.15)'; PZ.rr(c, 16, 384, 332, 206, 10); c.fill();
    c.fillStyle = '#f4ecdc'; PZ.rr(c, 14, 380, 332, 206, 10); c.fill();
    c.save(); PZ.rr(c, 14, 380, 332, 206, 10); c.clip();
    for (let x = 14; x < 346; x += 44) { c.fillStyle = 'rgba(143,191,230,0.55)'; c.fillRect(x, 380, 22, 206); }
    c.restore();
    for (let x = 18; x < 344; x += 6) { line(c, x, 586, x, 593, '#e6dccb', 1.4); line(c, x, 373, x, 380, '#e6dccb', 1.4); }
    shell(c, 330, 76, 0.4); shell(c, 176, 369, -0.3);
  }
  function shell(c, x, y, a) {
    c.save(); c.translate(x, y); c.rotate(a);
    c.fillStyle = '#f3c9b5'; c.beginPath(); c.moveTo(0, 6); c.lineTo(-8, -3); c.quadraticCurveTo(0, -11, 8, -3); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(190,120,100,0.6)'; c.lineWidth = 1;
    for (const k of [-5, -2, 1, 4]) { c.beginPath(); c.moveTo(0, 5); c.lineTo(k * 1.4, -6); c.stroke(); }
    c.restore();
  }
  // the kiln at the pottery, seen from above with its lid open, on a floor of
  // red tiles; the loads wait on the bench in front of it
  function kilnDecor(c, B, L) {
    const dr = U.rng(7577), bw = B.x1 - B.x0, { GX, GX1 } = L;
    const wall = 26, kx0 = GX - wall - 10, kx1 = GX1 + wall + 10, ky0 = GY - wall - 10, ky1 = GY1 + wall + 10;
    // the workshop floor
    c.fillStyle = '#d8c2a2'; c.fillRect(B.x0, B.y0, bw, SHORE - B.y0 + 4);
    const T = 46;
    for (let y = Math.floor(B.y0 / T) * T; y < SHORE; y += T) {
      for (let x = Math.floor(B.x0 / T) * T; x < B.x1; x += T) {
        c.fillStyle = ['#c27a58', '#b8704f', '#c98462', '#bd7654'][(dr() * 4) | 0]; c.fillRect(x + 1.5, y + 1.5, T - 3, T - 3);
        c.fillStyle = 'rgba(255,230,205,0.15)'; c.fillRect(x + 1.5, y + 1.5, T - 3, 2);
      }
    }
    for (let i = 0; i < 40; i++) { const q = 3 + dr() * 8; c.fillStyle = 'rgba(225,215,198,0.22)'; c.beginPath(); c.ellipse(B.x0 + dr() * bw, B.y0 + dr() * (SHORE - B.y0), q, q * 0.75, dr() * 3, 0, 7); c.fill(); }
    // the kiln: a shadow, a case of red brick with iron corners, a firebrick lining
    c.fillStyle = 'rgba(50,25,15,0.3)'; PZ.rr(c, kx0 + 5, ky0 + 7, kx1 - kx0, ky1 - ky0, 10); c.fill();
    c.fillStyle = '#9a4a32'; PZ.rr(c, kx0, ky0, kx1 - kx0, ky1 - ky0, 10); c.fill();
    c.save(); PZ.rr(c, kx0, ky0, kx1 - kx0, ky1 - ky0, 10); c.clip();
    c.strokeStyle = 'rgba(230,200,175,0.35)'; c.lineWidth = 1;
    for (let y = ky0; y < ky1; y += 10) { c.beginPath(); c.moveTo(kx0, y); c.lineTo(kx1, y); c.stroke(); for (let x = kx0 + ((Math.round((y - ky0) / 10) % 2) ? 11 : 0); x < kx1; x += 22) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 10); c.stroke(); } }
    c.restore();
    for (const [x, y] of [[kx0, ky0], [kx1 - 22, ky0], [kx0, ky1 - 22], [kx1 - 22, ky1 - 22]]) { c.fillStyle = '#3d434a'; PZ.rr(c, x, y, 22, 22, 5); c.fill(); c.fillStyle = '#7d8790'; c.beginPath(); c.arc(x + 11, y + 11, 2.4, 0, 7); c.fill(); }
    const lx0 = GX - 14, lx1 = GX1 + 14, ly0 = GY - 14, ly1 = GY1 + 14;
    c.fillStyle = '#e2c991'; c.fillRect(lx0, ly0, lx1 - lx0, ly1 - ly0);
    c.strokeStyle = 'rgba(150,115,60,0.45)'; c.lineWidth = 1;
    for (let y = ly0; y < ly1; y += 7) { c.beginPath(); c.moveTo(lx0, y); c.lineTo(lx1, y); c.stroke(); }
    c.fillStyle = 'rgba(60,40,20,0.2)'; c.fillRect(lx0, ly0, lx1 - lx0, 6);
    // the kiln floor: a pale shelf dusted with kiln wash, marked out in pencil
    c.fillStyle = '#d6d0c4'; c.fillRect(GX - 4, GY - 4, GX1 - GX + 8, GY1 - GY + 8);
    for (let i = 0; i < 220; i++) { c.fillStyle = dr() < 0.5 ? 'rgba(150,140,125,0.35)' : 'rgba(250,247,240,0.6)'; c.fillRect(GX + dr() * (GX1 - GX), GY + dr() * (GY1 - GY), 1.6, 1.6); }
    c.fillStyle = 'rgba(40,30,20,0.18)'; c.fillRect(GX - 4, GY - 4, GX1 - GX + 8, 5);
    chalk(c, GX, GX1, true);
    // the open lid, folded back against the wall behind, and the little dial
    c.fillStyle = 'rgba(50,25,15,0.25)'; PZ.rr(c, GX + 26, ky0 - 22, GX1 - GX - 44, 22, 6); c.fill();
    c.fillStyle = '#5b636b'; PZ.rr(c, GX + 20, ky0 - 26, GX1 - GX - 40, 22, 6); c.fill();
    c.fillStyle = '#7d8790'; PZ.rr(c, GX + 24, ky0 - 23, GX1 - GX - 48, 12, 4); c.fill();
    c.fillStyle = '#3d434a'; c.fillRect(GX + 40, ky0 - 6, 18, 8); c.fillRect(GX1 - 58, ky0 - 6, 18, 8);
    // a bench at the front where the shelves of pots wait
    c.fillStyle = '#b99a72'; c.fillRect(B.x0, SHORE, bw, B.y1 - SHORE);
    for (let y = SHORE + 34; y < B.y1; y += 34) { c.fillStyle = 'rgba(90,60,30,0.25)'; c.fillRect(B.x0, y, bw, 2); c.fillStyle = 'rgba(255,240,215,0.2)'; c.fillRect(B.x0, y + 2, bw, 1.4); }
    for (let i = 0; i < 300; i++) { c.strokeStyle = 'rgba(110,80,45,0.18)'; c.lineWidth = 0.8; const x = B.x0 + dr() * bw, y = SHORE + dr() * (B.y1 - SHORE); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 8 + dr() * 30, y + (dr() - 0.5)); c.stroke(); }
    for (let i = 0; i < 30; i++) { const q = 3 + dr() * 7; c.fillStyle = 'rgba(232,222,205,0.25)'; c.beginPath(); c.ellipse(B.x0 + dr() * bw, SHORE + 10 + dr() * (B.y1 - SHORE), q, q * 0.75, dr() * 3, 0, 7); c.fill(); }
    c.fillStyle = 'rgba(60,40,20,0.3)'; c.fillRect(B.x0, SHORE - 3, bw, 6);
    c.fillStyle = '#cfb48a'; c.fillRect(B.x0, SHORE, bw, 3);
  }
  // the pottery's ginger cat, sitting and looking at the kiln, tail curled round
  function cat(c, x, y, dir, t) {
    c.save(); c.translate(x, y); c.scale(dir, 1);
    PZ.shadow(c, 0, 12, 13, 3, 0.22);
    const fur = '#e39a52', dk = '#b8692e';
    c.strokeStyle = fur; c.lineWidth = 4.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-6, 9); c.quadraticCurveTo(-16, 10, -14, 0 + Math.sin(t * 1.4) * 1.5); c.stroke();
    c.fillStyle = fur; c.beginPath(); c.ellipse(0, 1, 9, 11, 0, 0, 7); c.fill();
    c.fillStyle = '#f6c48a'; c.beginPath(); c.ellipse(2.5, 4, 4.2, 6.5, 0, 0, 7); c.fill();
    disc(c, 1.5, -12, 7.5, fur);
    c.beginPath(); c.moveTo(-4.5, -16); c.lineTo(-3, -23); c.lineTo(1, -18); c.closePath(); c.moveTo(3, -18); c.lineTo(7, -23); c.lineTo(8, -15); c.closePath(); c.fill();
    c.strokeStyle = dk; c.lineWidth = 1.3; c.beginPath(); c.moveTo(-5, -4); c.lineTo(-1, -2); c.moveTo(-6, 0); c.lineTo(-1, 1); c.stroke();
    disc(c, 4.5, -13, 1.1, '#3b2a1a'); disc(c, -0.5, -13, 1.1, '#3b2a1a'); disc(c, 2, -10.5, 0.9, '#e2768b');
    c.restore();
  }
  // a kingfisher on a bollard, and a gull on the sand
  function kingfisher(c, x, y, dir) {
    c.save(); c.translate(x, y); c.scale(dir, 1);
    PZ.shadow(c, 0, 12, 9, 2.5, 0.2);
    c.fillStyle = '#2f8fc9'; c.beginPath(); c.ellipse(-3, -2, 9, 6, -0.3, 0, 7); c.fill();
    c.fillStyle = '#1f6f9f'; c.beginPath(); c.moveTo(-8, -4); c.lineTo(-17, 2); c.lineTo(-9, 3); c.closePath(); c.fill();
    c.fillStyle = '#e8873a'; c.beginPath(); c.ellipse(-1, 2.5, 6, 4, -0.2, 0, 7); c.fill();
    disc(c, 4, -8, 5.5, '#2f8fc9');
    c.fillStyle = '#e8873a'; c.beginPath(); c.ellipse(4.5, -6, 3, 1.8, 0, 0, 7); c.fill();
    c.fillStyle = '#2b2b2b'; c.beginPath(); c.moveTo(8, -9); c.lineTo(17, -7); c.lineTo(8, -6); c.closePath(); c.fill();
    disc(c, 5, -9.5, 1.3, '#111'); disc(c, 5.4, -9.9, 0.45, '#fff');
    line(c, -1, 6, -2, 10, '#d9483b', 1.4); line(c, 2, 6, 2, 10, '#d9483b', 1.4);
    c.restore();
  }
  function gull(c, x, y, dir) {
    c.save(); c.translate(x, y); c.scale(dir, 1);
    PZ.shadow(c, 0, 14, 11, 3, 0.2);
    line(c, -2, 6, -3, 13, '#e8b52e', 1.6); line(c, 2, 6, 2, 13, '#e8b52e', 1.6);
    c.fillStyle = '#fffaf1'; c.beginPath(); c.ellipse(-2, 0, 11, 7, -0.15, 0, 7); c.fill();
    c.fillStyle = '#a9b4bd'; c.beginPath(); c.ellipse(-5, -1.5, 9, 4.6, -0.2, 0, 7); c.fill();
    c.fillStyle = '#3b3b3b'; c.beginPath(); c.moveTo(-12, -2); c.lineTo(-19, 0); c.lineTo(-12, 2); c.closePath(); c.fill();
    disc(c, 6, -7, 5.5, '#fffaf1');
    c.fillStyle = '#e8b52e'; c.beginPath(); c.moveTo(10, -8); c.lineTo(17, -6.5); c.lineTo(10, -5); c.closePath(); c.fill();
    disc(c, 7, -8.5, 1.1, '#111');
    c.restore();
  }

  Object.assign(SCENES.KINDS, { pack });
})();
