'use strict';
// Water the greenhouse: a thinking job for the Puzzle Room. Clay pipe tiles
// sit in a wooden tray between the tap on the beam and a few thirsty pots.
// Tap a tile to give it a quarter turn; water runs at once through every
// pipe that joins up, and a pot that gets water perks up and flowers. Done
// when every pot is watered at the same time.
//   node test/run.mjs puzzle js/pz-hose.js hose --seeds 20

(() => {
  const CELL = 56, COLS = 5, ROWS = 6, N = COLS * ROWS;
  const GX = 40, GY = 150, GX1 = GX + COLS * CELL, GY1 = GY + ROWS * CELL;
  // directions: 0 north, 1 east, 2 south, 3 west; a tile's openings are bits 1 << d
  const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
  const rotCW = (m) => ((m << 1) | (m >> 3)) & 15;
  const rotN = (m, k) => { for (let i = 0; i < (k & 3); i++) m = rotCW(m); return m; };
  const cx = (col) => GX + col * CELL + CELL / 2, cy = (row) => GY + row * CELL + CELL / 2;
  const QUARTER = Math.PI / 2;

  const CLAY = '#d6966f', CLAY_D = '#b0714f', DRY = '#ecd5c0', WATER = '#8fbfe6', WATER_L = '#d6ebf8';
  const BRASS = '#d6ae62', BRASS_D = '#a8833f', BRASS_L = '#f0d595', SAGE = '#6f9a6a', SAGE_L = '#93b98a';
  const FLOWERS = [
    { petal: '#efb4ae', dim: '#d9b9b0', mid: '#f2d88a', n: 5, w: 0.62 },
    { petal: '#bba9df', dim: '#c3b9cf', mid: '#fffaf1', n: 8, w: 0.36 },
    { petal: '#f2d88a', dim: '#ddd0a8', mid: '#d98b63', n: 6, w: 0.5 },
    { petal: '#a6d3d4', dim: '#bccfcd', mid: '#efb4ae', n: 5, w: 0.7 },
  ];
  // the filler pieces: dead end, straight, corner, T and now and then a cross
  const FILL = [[1, 0.2], [5, 0.3], [3, 0.3], [7, 0.17], [15, 0.03]];

  // a pipe tile drawn once at four times the size (sharp on a big iPad), then
  // turned as it is drawn
  const sprites = new Map();
  function sprite(mask, wet) {
    const key = mask * 2 + (wet ? 1 : 0);
    if (sprites.has(key)) return sprites.get(key);
    const K = 4, cv = U.canvas(CELL * K, CELL * K), x = cv.getContext('2d');
    x.scale(K, K); x.translate(CELL / 2, CELL / 2);
    x.lineCap = 'round'; x.lineJoin = 'round';
    const arms = () => { x.beginPath(); for (let d = 0; d < 4; d++) if (mask & (1 << d)) { x.moveTo(0, 0); x.lineTo(DX[d] * CELL / 2, DY[d] * CELL / 2); } };
    arms(); x.strokeStyle = 'rgba(80,50,30,0.12)'; x.lineWidth = 22; x.stroke();
    x.strokeStyle = CLAY_D; x.lineWidth = 20; x.stroke();
    x.strokeStyle = CLAY; x.lineWidth = 16.5; x.stroke();
    // collars where one tile meets the next
    for (let d = 0; d < 4; d++) {
      if (!(mask & (1 << d))) continue;
      x.save(); x.rotate(d * QUARTER);
      x.fillStyle = CLAY_D; x.beginPath(); x.roundRect(-12.5, -28, 25, 6, 2); x.fill();
      x.fillStyle = 'rgba(255,240,220,0.35)'; x.fillRect(-11, -27, 22, 1.5);
      x.restore();
    }
    arms(); x.strokeStyle = wet ? WATER : DRY; x.lineWidth = wet ? 8 : 6.5; x.stroke();
    if (wet) { x.strokeStyle = WATER_L; x.lineWidth = 2; x.globalAlpha = 0.6; x.stroke(); x.globalAlpha = 1; }
    // a dead end gets a brass stopper, so it reads as closed
    if (mask === 1 || mask === 2 || mask === 4 || mask === 8) {
      x.fillStyle = BRASS_D; x.beginPath(); x.arc(0, 0, 9.5, 0, 7); x.fill();
      x.fillStyle = BRASS; x.beginPath(); x.arc(0, 0, 7.5, 0, 7); x.fill();
      x.fillStyle = BRASS_L; x.beginPath(); x.arc(-2, -2, 2.5, 0, 7); x.fill();
    }
    sprites.set(key, cv);
    return cv;
  }

  // a terracotta pot: top centre x, y, top width tw, bottom width bw, height h
  function pot(c, x, y, tw, bw, h) {
    PZ.shadow(c, x, y + h + 1, bw * 0.75, 3, 0.2);
    c.fillStyle = '#d98b63';
    c.beginPath(); c.moveTo(x - tw / 2, y); c.lineTo(x + tw / 2, y); c.lineTo(x + bw / 2, y + h); c.lineTo(x - bw / 2, y + h); c.closePath(); c.fill();
    c.fillStyle = 'rgba(120,60,30,0.18)';
    c.beginPath(); c.moveTo(x + tw * 0.15, y); c.lineTo(x + tw / 2, y); c.lineTo(x + bw / 2, y + h); c.lineTo(x + bw * 0.1, y + h); c.closePath(); c.fill();
    c.fillStyle = '#c97a55'; PZ.rr(c, x - tw / 2 - 2, y - 2, tw + 4, Math.max(5, h * 0.24), 2.5); c.fill();
    c.fillStyle = 'rgba(255,235,210,0.35)'; c.fillRect(x - tw / 2, y - 1, tw * 0.6, 1.2);
    c.fillStyle = '#8a6a4f'; c.beginPath(); c.ellipse(x, y - 1, tw / 2 - 1, 2.6, 0, 0, 7); c.fill();
  }

  // a watering can resting on the bench, standing on x, y (only for show)
  function wateringCan(c, x, y, k) {
    PZ.shadow(c, x, y + 1, 20, 3, 0.18);
    c.save(); c.translate(x, y); c.scale(k, 1);
    c.lineCap = 'round';
    c.strokeStyle = '#7fb0b1'; c.lineWidth = 5;
    c.beginPath(); c.moveTo(12, -16); c.lineTo(28, -34); c.stroke();
    c.fillStyle = '#7fb0b1'; PZ.rr(c, 24, -40, 9, 7, 2); c.fill();
    c.lineWidth = 4; c.beginPath(); c.arc(-4, -30, 11, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
    c.fillStyle = '#a6d3d4';
    c.beginPath(); c.moveTo(-15, -28); c.lineTo(13, -28); c.lineTo(15, 0); c.lineTo(-17, 0); c.closePath(); c.fill();
    c.fillStyle = 'rgba(60,90,90,0.16)'; c.fillRect(5, -28, 9, 28);
    c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(-11, -24, 3, 20);
    c.fillStyle = '#8cc0c1'; c.fillRect(-16, -9, 31, 3);
    c.restore();
  }

  // a flower growing from x, y: b = 0 thirsty and drooping, 1 upright and open
  function flower(c, x, y, s, b, lean, f, droop = 0.75) {
    const a = lean + (1 - b) * droop * Math.sign(lean || 1);
    const len = s * (24 + 8 * b);
    const hx = x + Math.sin(a) * len, hy = y - Math.cos(a) * len * (0.75 + 0.25 * b);
    c.strokeStyle = b > 0.5 ? SAGE : '#8f9c76'; c.lineWidth = 2.6 * s; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x, y - len * 0.65, hx, hy); c.stroke();
    c.fillStyle = SAGE_L;
    c.beginPath(); c.ellipse(x + 4 * s * Math.sign(-lean || 1), y - len * 0.35, 5.5 * s, 2.4 * s, -0.6 * Math.sign(lean || 1), 0, 7); c.fill();
    const open = 0.42 + 0.58 * b, pr = s * 10 * open, pw = pr * f.w + 1;
    c.fillStyle = b > 0.5 ? f.petal : f.dim;
    for (let i = 0; i < f.n; i++) {
      const t = (i / f.n) * Math.PI * 2 + a - Math.PI / 2;
      c.beginPath(); c.ellipse(hx + Math.cos(t) * pr * 0.55, hy + Math.sin(t) * pr * 0.55, pr * 0.6, pw, t, 0, 7); c.fill();
    }
    c.fillStyle = f.mid; c.beginPath(); c.arc(hx, hy, s * (2.2 + 2 * b), 0, 7); c.fill();
    return [hx, hy];
  }

  function hose(S) {
    const r = S.r;
    let tapCol = 2, pots = [], tiles = [], par = [], order = [];

    const maskOf = (i) => (tiles[i].pipe ? rotN(tiles[i].base, tiles[i].turns) : 0);
    // where the water goes: from the tap through every opening that meets another
    function flow() {
      const wet = new Array(N).fill(false), edges = [], tap = tapCol;
      if (!(maskOf(tap) & 1)) return { wet, edges };
      wet[tap] = true;
      const q = [tap];
      while (q.length) {
        const i = q.shift(), m = maskOf(i), col = i % COLS, row = (i / COLS) | 0;
        for (let d = 0; d < 4; d++) {
          if (!(m & (1 << d))) continue;
          const nc = col + DX[d], nr = row + DY[d];
          if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
          const j = nr * COLS + nc;
          if (wet[j] || !(maskOf(j) & (1 << ((d + 2) % 4)))) continue;
          wet[j] = true; edges.push([i, j]); q.push(j);
        }
      }
      return { wet, edges };
    }
    const potWet = (p, wet) => wet[p.cell] && (maskOf(p.cell) & (1 << p.d)) !== 0;
    const tapsFor = (t) => { let k = 0; while (k < 4 && rotN(t.base, t.turns + k) !== t.target) k++; return k; };

    // the pots: on the left and right walls (not the top rows) and along the bench
    function placePots(want) {
      const slots = [];
      for (let row = 2; row < ROWS; row++) slots.push({ side: 'L', col: 0, row, d: 3 }, { side: 'R', col: COLS - 1, row, d: 1 });
      for (let col = 0; col < COLS; col++) slots.push({ side: 'B', col, row: ROWS - 1, d: 2 });
      PZ.shuffle(r, slots);
      const out = [];
      for (const s of slots) {
        if (out.length >= want) break;
        if (out.filter((o) => o.side === s.side).length >= 2) continue;
        if (out.some((o) => o.col === s.col && o.row === s.row)) continue;
        if (s.side !== 'B' && out.some((o) => o.side === s.side && Math.abs(o.row - s.row) < 2)) continue;
        out.push(s);
      }
      return out;
    }

    // a random tree from the tap to every cell (Prim's way, so it branches),
    // then only the branches that lead to a pot are kept as the answer
    function generate() {
      for (;;) {
        tapCol = 1 + ((r() * 3) | 0);
        const v = r(), want = v < 0.15 ? 2 : v < 0.8 ? 3 : 4;
        const slots = placePots(want);
        par = new Array(N).fill(-1);
        const pdir = new Array(N).fill(-1), inT = new Array(N).fill(false), front = [];
        const grow = (i) => {
          inT[i] = true; order.push(i);
          const col = i % COLS, row = (i / COLS) | 0;
          for (let d = 0; d < 4; d++) {
            const nc = col + DX[d], nr = row + DY[d];
            if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS) front.push([i, nr * COLS + nc, d]);
          }
        };
        order = []; grow(tapCol);
        while (front.length) {
          const [a, b, d] = front.splice((r() * front.length) | 0, 1)[0];
          if (inT[b]) continue;
          par[b] = a; pdir[b] = d; grow(b);
        }
        const mask = new Array(N).fill(0), used = new Array(N).fill(false);
        mask[tapCol] |= 1; used[tapCol] = true;
        for (const s of slots) {
          let b = s.row * COLS + s.col;
          mask[b] |= 1 << s.d; used[b] = true;
          while (b !== tapCol) { const a = par[b], d = pdir[b]; mask[a] |= 1 << d; mask[b] |= 1 << ((d + 2) % 4); used[a] = true; b = a; }
        }
        order = order.filter((i) => used[i]);
        tiles = [];
        for (let i = 0; i < N; i++) {
          const col = i % COLS, row = (i / COLS) | 0, t = { i, col, row, x: cx(col), y: cy(row), turns: 0, vis: 0, pipe: true, base: 0, target: null };
          if (used[i]) { t.base = t.target = mask[i]; }
          else if (r() < 0.32) { t.pipe = false; t.deco = (r() * 4) | 0; t.seed = r(); }
          else {
            let v = r(), piece = 5;
            for (const [m, w] of FILL) { if (v < w) { piece = m; break; } v -= w; }
            t.base = rotN(piece, (r() * 4) | 0);
          }
          tiles.push(t);
        }
        const fl = PZ.shuffle(r, FLOWERS.slice());
        pots = slots.map((s, k) => potFor(s, fl[k % fl.length]));
        // turn every tile at random; never a pot with water at the start
        for (let tries = 0; tries < 40; tries++) {
          for (const t of tiles) if (t.pipe) { t.turns = (r() * 4) | 0; t.vis = t.turns * QUARTER; }
          const { wet } = flow();
          const taps = order.reduce((n, i) => n + tapsFor(tiles[i]), 0);
          if (!pots.some((p) => potWet(p, wet)) && taps >= 6) return;
        }
      }
    }

    // where each pot sits, its spout and where the water drips
    function potFor(s, f) {
      const cell = s.row * COLS + s.col, p = { ...s, cell, f, paid: false, wet: false, bloom: 0 };
      if (s.side === 'B') {
        const x = cx(s.col), lean = s.col === 0 ? 0.45 : -0.45;
        Object.assign(p, { spout: [[x, GY1], [x, GY1 + 10]], nx: x, ny: GY1 + 16, px: x, py: 540, tw: 42, bw: 30, ph: 30, s: 1, lean, droop: 0.75, fx: x + lean * 30, fy: 512 });
      } else {
        const k = s.side === 'L' ? -1 : 1, edge = s.side === 'L' ? GX : GX1, y = cy(s.row), sx = 180 + k * 147, px = 180 + k * 155;
        Object.assign(p, { spout: [[edge, y], [sx, y], [sx, y + 6]], nx: sx, ny: y + 14, px, py: y + 30, tw: 26, bw: 19, ph: 24, s: 0.8, lean: k * 0.28, droop: 0.45, fx: px, fy: y + 10 });
      }
      return p;
    }

    generate();
    // tiles that happen to start the right way round are not progress yet
    const ok0 = order.filter((i) => maskOf(i) === tiles[i].target).length;
    // a flower is open while its pot has water, and droops a little again if
    // the water is turned away, so a garden that looks done is done
    const bloomFor = (p) => (p.wet ? 1 : p.paid ? 0.45 : 0);
    // a watering can on the bench, somewhere no pot stands
    const canSpots = [70, 126, 180, 234, 290].filter((x) => pots.every((p) => p.side !== 'B' || Math.abs(p.px - x) > 62));
    const can = canSpots.length ? { x: canSpots[(r() * canSpots.length) | 0], k: r() < 0.5 ? 1 : -1 } : null;
    let wetNow = new Array(N).fill(false), segs = [], done = false, press = null, hintT = 0, hintTile = null, fx = null;

    // after every turn: who has water now, and pay the pots that get it first
    function recompute(pay) {
      const { wet, edges } = flow();
      wetNow = wet;
      for (const p of pots) {
        p.wet = potWet(p, wet);
        if (p.wet && !p.paid) { p.paid = true; if (pay && fx) { fx.good(p.fx, p.fy); fx.sound('happy'); } }
      }
      if (pots.every((p) => p.wet)) done = true;
      // the moving shimmer runs the way the water goes
      segs = [];
      if (wet[tapCol]) segs.push([cx(tapCol), 126, cx(tapCol), cy(0), tapCol, tapCol]);
      for (const [a, b] of edges) segs.push([tiles[a].x, tiles[a].y, tiles[b].x, tiles[b].y, a, b]);
      for (const p of pots) if (p.wet) { const [ex, ey] = p.spout[1]; segs.push([tiles[p.cell].x, tiles[p.cell].y, ex, ey, p.cell, p.cell]); }
    }
    recompute(false);

    const settled = (t) => Math.abs(t.vis - t.turns * QUARTER) < 0.06;
    function tileAt(x, y) {
      const col = Math.floor((x - GX) / CELL), row = Math.floor((y - GY) / CELL);
      if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null;
      return tiles[row * COLS + col];
    }
    // the answer's path from the tap to a cell, tap end first
    function pathTo(cell) { const p = [cell]; while (p[0] !== tapCol) p.unshift(par[p[0]]); return p; }

    const sc = {
      puzzle: true, indoor: true, steps: pots.length,
      crop: { x: 0, y: 134, w: 360, h: 360 },
      decor(c) {
        const B = S.bleed, bw = B.x1 - B.x0;
        // warm light through the glass
        const g = c.createLinearGradient(0, B.y0, 0, B.y1);
        g.addColorStop(0, '#e4efe9'); g.addColorStop(0.45, '#f4efe2'); g.addColorStop(1, '#efe3cf');
        c.fillStyle = g; c.fillRect(B.x0, B.y0, bw, B.y1 - B.y0);
        const sun = c.createRadialGradient(40, 0, 10, 40, 0, 420);
        sun.addColorStop(0, 'rgba(242,216,138,0.38)'); sun.addColorStop(1, 'rgba(242,216,138,0)');
        c.fillStyle = sun; c.fillRect(B.x0, B.y0, bw, B.y1 - B.y0);
        // light falling in long soft streaks
        c.fillStyle = 'rgba(255,255,255,0.22)';
        for (const [x0, w] of [[-40, 26], [30, 12], [170, 34], [250, 14]]) {
          c.beginPath(); c.moveTo(x0, B.y0); c.lineTo(x0 + w, B.y0); c.lineTo(x0 + w + 220, B.y1); c.lineTo(x0 + 220, B.y1); c.closePath(); c.fill();
        }
        // the glazing bars of the glass walls
        for (let x = 0; x <= 360; x += 72) {
          c.fillStyle = '#d2b48a'; c.fillRect(x - 3, B.y0, 6, 575 - B.y0);
          c.fillStyle = 'rgba(255,245,225,0.6)'; c.fillRect(x - 3, B.y0, 1.5, 575 - B.y0);
        }
        for (const y of [-40, 330]) { c.fillStyle = '#d2b48a'; c.fillRect(B.x0, y - 3, bw, 6); }
        // the beam that carries the tap
        c.fillStyle = '#b98f5a'; c.fillRect(B.x0, 98, bw, 16);
        c.fillStyle = 'rgba(255,240,215,0.35)'; c.fillRect(B.x0, 98, bw, 2);
        c.fillStyle = 'rgba(70,40,18,0.22)'; c.fillRect(B.x0, 112, bw, 2);
        // ivy trailing down from the beam at both ends
        for (const [x0, k] of [[14, 1], [346, -1]]) {
          for (let i = 0; i < 7; i++) {
            const y = 112 + i * 10, x = x0 + Math.sin(i * 1.3) * 5 * k;
            c.fillStyle = i % 2 ? SAGE : SAGE_L;
            c.beginPath(); c.ellipse(x, y, 5.5, 3.6, (i % 2 ? 0.7 : -0.7) * k, 0, 7); c.fill();
          }
        }
        // the potting bench along the bottom
        c.fillStyle = '#c49a68'; c.fillRect(B.x0, 570, bw, B.y1 - 570);
        c.fillStyle = '#ad8352'; c.fillRect(B.x0, 570, bw, 4);
        c.fillStyle = 'rgba(70,40,18,0.18)';
        for (let y = 586; y < B.y1; y += 16) c.fillRect(B.x0, y, bw, 1.2);
        // the label with the rule as a picture
        c.fillStyle = 'rgba(80,60,40,0.08)'; PZ.rr(c, 52, 20, 256, 66, 14); c.fill();
        c.fillStyle = PZ.PAPER; PZ.rr(c, 52, 16, 256, 66, 14); c.fill();
        c.strokeStyle = '#e5d9c6'; c.lineWidth = 1.2; c.stroke();
        PZ.text(c, 'Water every flower', 180, 38, { size: 16 });
        c.fillStyle = '#f3e8d6'; PZ.rr(c, 86, 51, 22, 22, 5); c.fill();
        c.strokeStyle = CLAY; c.lineWidth = 6; c.lineCap = 'round';
        c.beginPath(); c.moveTo(97, 51); c.lineTo(97, 62); c.lineTo(108, 62); c.stroke();
        c.strokeStyle = PZ.INK2; c.lineWidth = 1.8;
        c.beginPath(); c.arc(97, 62, 15, -1.3, 0.2); c.stroke();
        c.fillStyle = PZ.INK2; c.beginPath(); c.moveTo(115, 61); c.lineTo(110, 63); c.lineTo(114.5, 66.5); c.closePath(); c.fill();
        PZ.text(c, 'Tap a pipe to turn it', 124, 63, { size: 13, color: PZ.INK2, align: 'left', weight: 700 });
        // the wooden tray and its cells
        c.fillStyle = 'rgba(70,40,18,0.15)'; PZ.rr(c, GX - 6, GY - 3, GX1 - GX + 12, GY1 - GY + 12, 12); c.fill();
        c.fillStyle = '#b98f5a'; PZ.rr(c, GX - 6, GY - 6, GX1 - GX + 12, GY1 - GY + 12, 12); c.fill();
        c.fillStyle = '#a27a4b'; PZ.rr(c, GX - 1, GY - 1, GX1 - GX + 2, GY1 - GY + 2, 8); c.fill();
        for (const t of tiles) {
          const x = t.x - CELL / 2, y = t.y - CELL / 2;
          if (t.pipe) {
            c.fillStyle = 'rgba(70,40,18,0.25)'; PZ.rr(c, x + 2, y + 3.5, CELL - 4, CELL - 4, 9); c.fill();
            c.fillStyle = '#f3e8d6'; PZ.rr(c, x + 2, y + 2, CELL - 4, CELL - 4, 9); c.fill();
            c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1.2; PZ.rr(c, x + 3, y + 3, CELL - 6, CELL - 6, 8); c.stroke();
          } else soilCell(c, t, x, y);
        }
        if (can) wateringCan(c, can.x, 570, can.k);
        // the spouts to the pots and the pots themselves
        for (const p of pots) {
          c.lineCap = 'round'; c.lineJoin = 'round';
          c.beginPath(); c.moveTo(p.spout[0][0], p.spout[0][1]); for (const [x, y] of p.spout.slice(1)) c.lineTo(x, y);
          c.strokeStyle = CLAY_D; c.lineWidth = 16; c.stroke();
          c.strokeStyle = CLAY; c.lineWidth = 12.5; c.stroke();
          c.strokeStyle = DRY; c.lineWidth = 6; c.stroke();
          // a little brass rose on the end, pointing down
          c.fillStyle = BRASS_D; c.beginPath(); c.moveTo(p.nx - 6, p.ny - 7); c.lineTo(p.nx + 6, p.ny - 7); c.lineTo(p.nx + 9, p.ny); c.lineTo(p.nx - 9, p.ny); c.closePath(); c.fill();
          c.fillStyle = BRASS; PZ.rr(c, p.nx - 9, p.ny - 2, 18, 4, 2); c.fill();
          if (p.side !== 'B') { c.fillStyle = '#b98f5a'; PZ.rr(c, p.px - 15, p.py + p.ph, 30, 5, 2); c.fill(); c.fillStyle = '#9c7546'; c.fillRect(p.px - 2 * Math.sign(p.lean) - 1, p.py + p.ph + 5, 3, 8); }
          pot(c, p.px, p.py, p.tw, p.bw, p.ph);
        }
        // the brass tap on the beam, feeding the top of the tray
        const tx = cx(tapCol);
        c.lineCap = 'round';
        c.beginPath(); c.moveTo(tx, 124); c.lineTo(tx, GY);
        c.strokeStyle = CLAY_D; c.lineWidth = 20; c.stroke();
        c.strokeStyle = CLAY; c.lineWidth = 16.5; c.stroke();
        c.strokeStyle = WATER; c.lineWidth = 8; c.stroke();
        c.fillStyle = BRASS_D; PZ.rr(c, tx - 15, 96, 30, 15, 5); c.fill();
        c.fillStyle = BRASS; PZ.rr(c, tx - 13, 98, 26, 11, 4); c.fill();
        c.fillStyle = BRASS_D; c.beginPath(); c.arc(tx, 117, 12.5, 0, 7); c.fill();
        c.fillStyle = BRASS; c.beginPath(); c.arc(tx, 117, 10.5, 0, 7); c.fill();
        c.fillStyle = BRASS_L; c.beginPath(); c.arc(tx - 4, 113, 3.2, 0, 7); c.fill();
        c.fillStyle = BRASS_D; c.fillRect(tx + 11, 104, 9, 4);
        c.strokeStyle = BRASS_D; c.lineWidth = 3;
        c.beginPath(); c.arc(tx + 24, 106, 8, 0, 7); c.stroke();
        c.beginPath(); c.moveTo(tx + 16, 106); c.lineTo(tx + 32, 106); c.moveTo(tx + 24, 98); c.lineTo(tx + 24, 114); c.stroke();
        c.fillStyle = BRASS; c.beginPath(); c.arc(tx + 24, 106, 3, 0, 7); c.fill();
      },
      draw(c, t, still) {
        // the pipes, turning smoothly; water shows once a tile has come to rest
        for (const tl of tiles) {
          if (!tl.pipe) continue;
          const rest = still || settled(tl);
          c.save(); c.translate(tl.x, tl.y); c.rotate(still ? tl.turns * QUARTER : tl.vis);
          c.drawImage(sprite(tl.base, rest && wetNow[tl.i]), -CELL / 2, -CELL / 2, CELL, CELL);
          c.restore();
        }
        // spouts that have water
        c.lineCap = 'round'; c.lineJoin = 'round';
        for (const p of pots) {
          if (!p.wet || !(still || settled(tiles[p.cell]))) continue;
          c.strokeStyle = WATER; c.lineWidth = 6;
          c.beginPath(); c.moveTo(p.spout[0][0], p.spout[0][1]); for (const [x, y] of p.spout.slice(1)) c.lineTo(x, y); c.stroke();
          // two drops falling into the pot
          c.fillStyle = WATER;
          for (let k = 0; k < 2; k++) {
            const f = (t * 1.4 + k * 0.5) % 1, y = p.ny + 3 + f * (p.py - p.ny - 4);
            c.globalAlpha = 1 - f * 0.6; c.beginPath(); c.ellipse(p.nx + (k - 0.5) * 6, y, 2, 3, 0, 0, 7); c.fill();
          }
          c.globalAlpha = 1;
        }
        // a gentle shimmer running along the water
        c.beginPath();
        for (const s of segs) {
          if (!still && !(settled(tiles[s[4]]) && settled(tiles[s[5]]))) continue;
          c.moveTo(s[0], s[1]); c.lineTo(s[2], s[3]);
        }
        c.setLineDash([4, 12]); c.lineDashOffset = -t * 22;
        c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 2.4; c.stroke();
        c.setLineDash([]);
        // the flowers, open while they have water
        for (const p of pots) {
          const b = still ? bloomFor(p) : p.bloom;
          if (p.wet) { c.fillStyle = 'rgba(90,60,40,0.35)'; c.beginPath(); c.ellipse(p.px, p.py - 1, p.tw / 2 - 2, 2.2, 0, 0, 7); c.fill(); }
          const sway = still ? 0 : Math.sin(t * 1.3 + p.cell) * 0.04 * b;
          flower(c, p.px - p.lean * 6, p.py - 1, p.s, b, p.lean + sway, p.f, p.droop);
        }
        if (!still && hintTile && hintT > 0) PZ.glow(c, hintTile.x, hintTile.y, 29, t);
      },
      step(dt) {
        hintT -= dt;
        for (const tl of tiles) if (tl.pipe) tl.vis = PZ.approach(tl.vis, tl.turns * QUARTER, dt, 16);
        for (const p of pots) p.bloom = PZ.approach(p.bloom, bloomFor(p), dt, 3);
      },
      // a tap is a down and an up close together; a second tap while turning adds a turn
      down(x, y) { press = done ? null : { x, y }; },
      move() {},
      up(x, y) {
        if (!press) return;
        const p = press; press = null;
        if (done || PZ.dist(p.x, p.y, x, y) > 18) return;
        const tl = tileAt(p.x, p.y);
        if (!tl || !tl.pipe) return;
        tl.turns++; fx.sound('turn');
        // the hint glow stays on its tile until that tile is right
        if (hintTile === tl) hintT = maskOf(tl.i) === tl.target ? 0 : Math.max(hintT, 2);
        recompute(true);
      },
      cancel() { press = null; },
      progress() {
        if (done) return 1;
        const ok = order.filter((i) => maskOf(i) === tiles[i].target).length;
        return Math.min(0.99, (0.75 * pots.filter((p) => p.paid).length) / pots.length + (0.25 * Math.max(0, ok - ok0)) / Math.max(1, order.length - ok0));
      },
      solved: () => done,
      // glow the first wrongly turned tile on the way to a pot without water
      hint() {
        hintTile = null;
        for (const p of pots) {
          if (p.wet) continue;
          const i = pathTo(p.cell).find((j) => maskOf(j) !== tiles[j].target);
          if (i !== undefined) { hintTile = tiles[i]; break; }
        }
        hintT = hintTile ? 3 : 0;
      },
      save: () => ({ turns: tiles.map((tl) => tl.turns & 3).join(''), paid: pots.map((p) => (p.paid ? 1 : 0)) }),
      load(s) {
        if (!s) return;
        if (typeof s.turns === 'string' && s.turns.length === tiles.length && /^[0-3]+$/.test(s.turns)) tiles.forEach((tl, i) => { tl.turns = +s.turns[i]; tl.vis = tl.turns * QUARTER; });
        if (Array.isArray(s.paid)) pots.forEach((p, i) => { p.paid = !!s.paid[i]; });
        recompute(false);
        for (const p of pots) p.bloom = bloomFor(p);
      },
      solveAll() {
        for (const i of order) { const tl = tiles[i]; tl.turns += tapsFor(tl); tl.vis = tl.turns * QUARTER; }
        recompute(false);
      },
      debugPlan() {
        if (done) return [];
        const plan = [];
        for (const i of order) { const tl = tiles[i]; for (let k = tapsFor(tl); k > 0; k--) plan.push({ tap: [tl.x, tl.y] }); }
        return plan;
      },
    };
    Object.defineProperty(sc, 'fx', { get: () => fx, set: (v) => { fx = v; } });
    return sc;
  }

  // an empty cell: a patch of soil with a trowel, leaves, a sprout or pebbles
  function soilCell(c, t, x, y) {
    const rr = U.rng(((t.seed * 1e6) | 0) + 7);
    c.fillStyle = '#9c7656'; PZ.rr(c, x + 3, y + 3, CELL - 6, CELL - 6, 10); c.fill();
    for (let i = 0; i < 16; i++) {
      c.fillStyle = i % 2 ? 'rgba(200,160,120,0.45)' : 'rgba(90,60,40,0.4)';
      c.beginPath(); c.arc(x + 8 + rr() * (CELL - 16), y + 8 + rr() * (CELL - 16), 0.8 + rr() * 1.4, 0, 7); c.fill();
    }
    const mx = x + CELL / 2, my = y + CELL / 2;
    if (t.deco === 0) { // a trowel
      c.save(); c.translate(mx, my); c.rotate(-0.7);
      c.fillStyle = '#b98f5a'; PZ.rr(c, -3.5, 4, 7, 16, 3.5); c.fill();
      c.fillStyle = '#8f9a92'; c.beginPath(); c.moveTo(-7, 3); c.quadraticCurveTo(-7, -14, 0, -19); c.quadraticCurveTo(7, -14, 7, 3); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(-4, -10, 2, 11);
      c.restore();
    } else if (t.deco === 1) { // fallen leaves
      for (const [dx, dy, a, col] of [[-8, -6, 0.6, SAGE], [7, 4, -0.9, SAGE_L], [-3, 10, 2.2, '#c9b25e']]) {
        c.fillStyle = col; c.beginPath(); c.ellipse(mx + dx, my + dy, 8, 4, a, 0, 7); c.fill();
      }
    } else if (t.deco === 2) { // a seedling
      c.strokeStyle = SAGE; c.lineWidth = 2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(mx, my + 10); c.lineTo(mx, my - 4); c.stroke();
      c.fillStyle = SAGE_L;
      c.beginPath(); c.ellipse(mx - 6, my - 6, 6, 3.2, 0.4, 0, 7); c.fill();
      c.beginPath(); c.ellipse(mx + 6, my - 7, 6, 3.2, -0.4, 0, 7); c.fill();
    } else { // pebbles
      for (const [dx, dy, s] of [[-7, 2, 5], [5, -4, 4], [4, 8, 3.5]]) {
        c.fillStyle = '#e9dfcf'; c.beginPath(); c.ellipse(mx + dx, my + dy, s * 1.3, s, 0.2, 0, 7); c.fill();
      }
    }
  }

  Object.assign(SCENES.KINDS, { hose });
})();
