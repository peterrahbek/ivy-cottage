'use strict';
// Scenes for Wisteria Manor: the tall windows, the wisteria on the stone, the
// topiary, the grand door, the lake and the fountain, the chandelier and the
// ballroom floor, the iron gate, the boathouse, the gravel drive and the great
// lawn. Each is a variant of an older kind, built through SCENES.VARIANTS, with
// the same layers as every other scene (see scenes.js):
//   window { room: 'ballroom' }                 a tall window, the ballroom behind (wash)
//   window { room: 'library' }                  a tall window, the library behind (wash)
//   bed { flower: 'wisteria' }                  wisteria along the stone wall (weed)
//   bed { flower: 'box' }                       clipped box in a knot of hedges (weed)
//   door { what: 'grand' }                      the double door, in the player's colour (paint)
//   pond { what: 'lake' }                       the long lake and its reeds (skim)
//   pond { what: 'fountain', where: 'manor' }   the stone fountain (skim)
//   lantern { where: 'manor' }                  the crystal chandelier (wash)
//   cafeFloor { where: 'ballroom' }             the parquet ballroom floor (dust)
//   fence { what: 'iron' }                      the iron gate, in the player's colour (paint)
//   hut { what: 'boathouse' }                   the boathouse, in the player's colour (paint)
//   sand { what: 'gravel' }                     the gravel drive (rake)
//   lawn { shape: 'wide' }                      the great lawn, with mow stripes (mow)

(() => {
  const { W, H, field, ramp, rrPath, softShadow, paintStamp, peelingPaint, grime, ashlar, tallGrass, grassGrain, mowedLawn, GRASS, strokesByColour, shrub } = SCENES;
  const TAU = Math.PI * 2;
  const GOLD = '#d8ae4e', GOLD_LT = '#f6e19a', GOLD_DK = '#8f6a26', STONE = '#cfc6b2', STONE_LT = '#e9e2d0', STONE_DK = '#8f8676', LILAC = '#b79ad8', LILAC_DK = '#7d5fb0', LILAC_LT = '#dccdf0', OAK = '#6e452c', OAK_DK = '#3c2417', IRON = '#2f2b2e';
  const dot = (c, x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, TAU); c.fill(); };
  const lin = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); for (const [o, col] of stops) g.addColorStop(o, col); return g; };

  // ------------------------------------------------------------ shared bits
  function glow(c, x, y, rad, col) {
    const g = c.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,214,140,0)');
    c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  function cobweb(c, cx, cy, a0, len) {
    c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 0.7;
    for (let k = 0; k < 6; k++) { const a = a0 + (k / 5) * (Math.PI / 2); c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len); c.stroke(); }
    for (let ring = 12; ring < len; ring += 12) { c.beginPath(); for (let k = 0; k <= 5; k++) { const a = a0 + (k / 5) * (Math.PI / 2); c.lineTo(cx + Math.cos(a) * ring, cy + Math.sin(a) * ring); } c.stroke(); }
  }
  // one hanging spray of wisteria, fat at the top and thinning to a point
  function spray(c, q, x, y, len) {
    c.strokeStyle = '#6f8a4a'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + len); c.stroke();
    for (let k = 0, n = Math.round(len / 1.7); k < n; k++) {
      const t = k / n, w = (1 - t) * len * 0.17 + 0.8;
      dot(c, x + (q() - 0.5) * 2 * w, y + t * len, 2.5 - t * 1.2 + q() * 0.5, U.pick(q, t > 0.65 ? [LILAC_LT, LILAC] : [LILAC, LILAC_DK, '#9b7cc8', LILAC_LT]));
    }
  }
  // pale leaves on a thin stalk, in the sprays' own green
  function leaflets(c, q, x, y, a, n) {
    for (let k = 0; k < n; k++) {
      const lx = x + Math.cos(a) * k * 7, ly = y + Math.sin(a) * k * 7, s = k % 2 ? 1 : -1;
      c.fillStyle = U.pick(q, ['#6f9a4a', '#82ab56', '#5f8a42']);
      c.beginPath(); c.ellipse(lx + Math.cos(a + s) * 5, ly + Math.sin(a + s) * 5, 5.4, 2.2, a + s, 0, TAU); c.fill();
    }
  }
  // grey dust and rain over old glass, then runs, spots and a bird's visit
  function oldGlass(c, r, nz, x0, y0, x1, y1) {
    const g = ramp(['#8c8d82', '#9fa094', '#b0afa2', '#c0beb1']);
    field(c, x0, y0, x1, y1, 2, (x, y) => { const v = nz.fbm(x * 0.03, y * 0.022, 4); return [...g(v), 160 + v * 84]; });
    for (let i = 0; i < 90; i++) {
      const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0) * 0.7, l = 30 + r() * 110;
      c.strokeStyle = r() < 0.5 ? 'rgba(232,230,220,0.22)' : 'rgba(70,62,50,0.2)'; c.lineWidth = 1 + r() * 2;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 5, y + l); c.stroke();
    }
    for (let i = 0; i < 16; i++) {
      const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0);
      dot(c, x, y, 3 + r() * 3, 'rgba(238,234,222,0.75)');
      c.fillStyle = 'rgba(238,234,222,0.6)'; c.fillRect(x - 0.8, y, 1.6, 6 + r() * 12);
      dot(c, x + 0.6, y - 0.5, 1.2, 'rgba(90,84,70,0.5)');
    }
    grime(c, r, x0, y1 - 90, x1, y1, 16);
  }

  // ------------------------------------------- WISTERIA MANOR: THE TALL WINDOWS
  // One of the tall round-headed windows of the south front, in its stone surround
  // with the wisteria hanging over it. The glass has not been washed since the last
  // ball, and behind it is either the ballroom, all rose silk and gilt mirrors, or
  // the library, floor to ceiling in books with the green lamp lit.
  // window { room: 'ballroom' } and window { room: 'library' }
  function tallWindow(S) {
    const { r, nz, bleed, opts } = S;
    const CX = 180, GX0 = 64, GX1 = 296, AR = (GX1 - GX0) / 2, AY = 172, GY1 = 496, GY0 = AY - AR, FY = 420;
    const ball = opts.room === 'ballroom';
    const glassPath = (p) => { p.moveTo(GX0, GY1); p.lineTo(GX0, AY); p.arc(CX, AY, AR, Math.PI, 0); p.lineTo(GX1, GY1); p.closePath(); };
    const region = new Path2D();
    glassPath(region);

    function parquetFloor(c, q, tone) {
      c.fillStyle = tone; c.fillRect(GX0, FY, GX1 - GX0, GY1 - FY);
      for (let y = FY, k = 0; y < GY1; y += 9 + k * 3, k++) {
        for (let x = GX0 - 20 + (k % 2) * 16; x < GX1; x += 32) { c.fillStyle = U.shade(tone, (q() - 0.5) * 0.22); c.fillRect(x, y, 30, 8 + k * 3); }
      }
      c.fillStyle = lin(c, 0, FY, 0, FY + 24, [[0, 'rgba(30,14,10,0.34)'], [1, 'rgba(30,14,10,0)']]); c.fillRect(GX0, FY, GX1 - GX0, 24);
    }
    function ballroom(c) {
      const q = U.rng(1907), MX0 = 132, MX1 = 228, MA = 134;
      c.fillStyle = lin(c, 0, GY0, 0, FY, [[0, '#cfa79a'], [0.5, '#e6c3b2'], [1, '#f0d8c6']]); c.fillRect(GX0, GY0, GX1 - GX0, FY - GY0);
      // silk panels in white and gold mouldings
      for (const [a, b] of [[74, 122], [238, 286]]) {
        c.fillStyle = 'rgba(255,246,232,0.8)'; c.fillRect(a - 3, 120, b - a + 6, FY - 132);
        c.fillStyle = lin(c, a, 0, b, 0, [[0, '#d3a79c'], [0.5, '#e8c8bb'], [1, '#d3a79c']]); c.fillRect(a, 123, b - a, FY - 138);
        c.strokeStyle = GOLD; c.lineWidth = 1.4; c.strokeRect(a + 5, 128, b - a - 10, FY - 148);
      }
      // the great gilt mirror, with the candles in it
      c.fillStyle = 'rgba(40,20,16,0.28)'; c.fillRect(MX0 - 7, MA, MX1 - MX0 + 18, FY - MA - 4);
      c.fillStyle = lin(c, MX0 - 8, 0, MX1 + 8, 0, [[0, GOLD_DK], [0.3, GOLD_LT], [0.7, GOLD], [1, GOLD_DK]]);
      c.beginPath(); c.moveTo(MX0 - 8, FY - 6); c.lineTo(MX0 - 8, 176); c.arc(180, 176, 56, Math.PI, 0); c.lineTo(MX1 + 8, FY - 6); c.closePath(); c.fill();
      c.fillStyle = lin(c, 0, MA, 0, FY, [[0, '#8fa6ad'], [0.55, '#b9c6c4'], [1, '#e3d8c6']]);
      c.beginPath(); c.moveTo(MX0, FY - 12); c.lineTo(MX0, 176); c.arc(180, 176, 48, Math.PI, 0); c.lineTo(MX1, FY - 12); c.closePath(); c.fill();
      for (const [x, y] of [[156, 214], [180, 200], [204, 214], [168, 232], [192, 232]]) { glow(c, x, y, 20, 'rgba(255,226,160,0.7)'); dot(c, x, y, 2.2, '#fff6d8'); }
      parquetFloor(c, q, '#b9824e');
      // two gilt chairs against the wall
      for (const x of [104, 256]) {
        c.fillStyle = 'rgba(30,14,10,0.3)'; c.beginPath(); c.ellipse(x, 452, 24, 5, 0, 0, TAU); c.fill();
        c.fillStyle = GOLD; c.fillRect(x - 15, 396, 3, 56); c.fillRect(x + 12, 396, 3, 56);
        c.fillStyle = '#b4475a'; c.beginPath(); c.roundRect(x - 13, 372, 26, 40, 8); c.fill();
        c.fillStyle = GOLD_DK; c.beginPath(); c.roundRect(x - 19, 416, 38, 6, 2); c.fill();
        c.fillStyle = '#c45a6c'; c.beginPath(); c.roundRect(x - 18, 408, 36, 10, 4); c.fill();
      }
      // the crystal chandelier, lit
      glow(c, CX, 112, 130, 'rgba(255,226,160,0.62)');
      c.strokeStyle = GOLD_DK; c.lineWidth = 2; c.beginPath(); c.moveTo(CX, GY0); c.lineTo(CX, 84); c.stroke();
      c.strokeStyle = GOLD; c.lineWidth = 3; c.beginPath(); c.ellipse(CX, 112, 58, 12, 0, 0, TAU); c.stroke();
      for (let k = 0; k < 24; k++) {
        const a = (k / 24) * TAU, x = CX + Math.cos(a) * 58, y = 112 + Math.sin(a) * 12;
        c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x * 0.8 + CX * 0.2, 150); c.stroke();
        dot(c, x, y + 7, 1.8, q() < 0.5 ? '#ffffff' : '#fff0c4');
      }
      for (let k = 0; k < 7; k++) { const x = CX - 54 + k * 18; c.fillStyle = '#fff8e4'; c.fillRect(x - 1.5, 90, 3, 14); glow(c, x, 88, 11, 'rgba(255,226,160,0.85)'); dot(c, x, 88, 1.8, '#ffffff'); }
      // and the curtains, looped back at the sides
      for (const s of [-1, 1]) {
        const e = s < 0 ? GX0 : GX1, m = e - s * 34;
        c.fillStyle = lin(c, e, 0, m, 0, [[0, '#7c2a3c'], [0.6, '#a23f55'], [1, '#c26075']]);
        c.beginPath(); c.moveTo(e, GY0); c.lineTo(e - s * 44, GY0 + 40); c.quadraticCurveTo(e - s * 30, 290, e - s * 14, 330); c.quadraticCurveTo(e - s * 22, 380, e - s * 12, GY1); c.lineTo(e, GY1); c.closePath(); c.fill();
        c.fillStyle = GOLD; c.fillRect(Math.min(e, e - s * 28), 326, 28, 6);
      }
    }
    function library(c) {
      const q = U.rng(1908), BOOK = ['#7c2a33', '#2f4a6e', '#2e5a44', '#6a4a2a', '#8a6a2e', '#4a2e52', '#a2522e', '#31424e', '#c9b48a'];
      c.fillStyle = OAK_DK; c.fillRect(GX0, GY0, GX1 - GX0, FY - GY0);
      for (let y = GY0 + 8; y < FY - 8; y += 48) {
        c.fillStyle = '#21120c'; c.fillRect(GX0, y, GX1 - GX0, 40);
        for (let x = GX0 + 1; x < GX1 - 2;) {
          const w = 6 + q() * 8, h = 26 + q() * 12;
          if (q() < 0.08) { x += 8; continue; }
          const col = U.shade(U.pick(q, BOOK), (q() - 0.5) * 0.22);
          c.fillStyle = col; c.fillRect(x, y + 40 - h, w - 0.8, h);
          c.fillStyle = 'rgba(232,196,110,0.7)'; c.fillRect(x + 1, y + 44 - h, w - 2.8, 1.4); c.fillRect(x + 1, y + 34, w - 2.8, 1.2);
          x += w;
        }
        c.fillStyle = lin(c, 0, y + 40, 0, y + 48, [[0, '#9a6a40'], [1, OAK]]); c.fillRect(GX0, y + 40, GX1 - GX0, 8);
      }
      for (const x of [132, 228]) { c.fillStyle = lin(c, x - 7, 0, x + 7, 0, [[0, OAK], [0.5, '#8d6038'], [1, OAK_DK]]); c.fillRect(x - 7, GY0, 14, FY - GY0); }
      parquetFloor(c, q, '#7f5230');
      // a red rug, the ladder on its rail and the lamp lit on the table
      c.fillStyle = '#7c2a33'; c.beginPath(); c.ellipse(190, 470, 92, 20, 0, 0, TAU); c.fill();
      c.strokeStyle = GOLD; c.lineWidth = 1.6; c.beginPath(); c.ellipse(190, 470, 84, 17, 0, 0, TAU); c.stroke();
      c.strokeStyle = '#a97c4c'; c.lineWidth = 5; c.beginPath(); c.moveTo(250, 90); c.lineTo(274, 450); c.moveTo(214, 96); c.lineTo(236, 450); c.stroke();
      c.lineWidth = 3.4; for (let t = 0.1; t < 1; t += 0.11) { const y = 92 + t * 358; c.beginPath(); c.moveTo(214 + t * 22, y); c.lineTo(250 + t * 24, y); c.stroke(); }
      glow(c, 118, 356, 110, 'rgba(255,214,140,0.62)');
      c.fillStyle = OAK; c.beginPath(); c.ellipse(118, 408, 44, 9, 0, 0, TAU); c.fill(); c.fillStyle = OAK_DK; c.fillRect(113, 410, 10, 52); c.fillRect(96, 460, 44, 4);
      c.fillStyle = GOLD; c.fillRect(116, 366, 4, 40); c.fillRect(106, 402, 24, 4);
      c.fillStyle = lin(c, 92, 0, 144, 0, [[0, '#2c6b48'], [0.5, '#54b184'], [1, '#225a3c']]); c.beginPath(); c.moveTo(102, 348); c.lineTo(134, 348); c.lineTo(146, 372); c.lineTo(90, 372); c.closePath(); c.fill();
      c.fillStyle = '#7c2a33'; c.fillRect(132, 396, 30, 6); c.fillStyle = '#2f4a6e'; c.fillRect(136, 391, 22, 5);
      // the leather wing chair, turned to the lamp
      c.fillStyle = '#5a2a1e'; c.beginPath(); c.roundRect(186, 366, 62, 88, 12); c.fill();
      c.fillStyle = '#7a3d28'; c.beginPath(); c.roundRect(194, 374, 46, 56, 9); c.fill();
      c.fillStyle = '#8a4a30'; c.beginPath(); c.roundRect(178, 416, 78, 28, 9); c.fill();
      c.fillStyle = '#2a140c'; c.fillRect(190, 444, 6, 12); c.fillRect(238, 444, 6, 12);
    }
    return {
      family: 'wash', particle: 'suds', region,
      tough(x, y) { return y < AY ? 1.35 : nz.n2(x * 0.03, y * 0.03) > 0.64 ? 1.4 : 1; },
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        ashlar(c, U.rng(1907), nz, x0, y0, x1, y1);
        softShadow(c, region, 12, 0.4);
      },
      clean: ball ? ballroom : library,
      cleanOver(c) {
        // the sky in the old glass, a little wavy
        c.fillStyle = lin(c, 0, GY0, 0, GY1, [[0, 'rgba(190,220,240,0.22)'], [0.6, 'rgba(190,220,240,0.06)'], [1, 'rgba(190,220,240,0)']]); c.fillRect(GX0, GY0, GX1 - GX0, GY1 - GY0);
        for (const [o, w, a] of [[40, 54, 0.2], [120, 18, 0.14], [190, 70, 0.13]]) {
          c.fillStyle = `rgba(255,255,255,${a})`;
          c.beginPath(); c.moveTo(o, GY1); c.lineTo(o + w, GY1); c.lineTo(o + w + 190, GY0); c.lineTo(o + 190, GY0); c.closePath(); c.fill();
        }
      },
      dirt(c) {
        oldGlass(c, r, nz, GX0, GY0, GX1, GY1);
        cobweb(c, GX0 + 10, GY1 - 4, -Math.PI / 2, 64);
        cobweb(c, CX + 34, GY0 + 10, 0.3, 54);
      },
      top(c) {
        const q = U.rng(19071), fx = 13;
        // the white frame and the glazing bars, a fan in the arch
        c.save(); c.clip(region);
        c.strokeStyle = 'rgba(40,30,20,0.2)'; c.lineWidth = 6; c.beginPath(); glassPath(c); c.stroke();
        c.strokeStyle = '#f4efe2'; c.lineWidth = 5;
        c.beginPath();
        for (const x of [141, 219]) { c.moveTo(x, AY); c.lineTo(x, GY1); }
        for (let y = AY; y < GY1; y += 80) { c.moveTo(GX0, y); c.lineTo(GX1, y); }
        for (let k = 1; k < 6; k++) { const a = Math.PI + (k / 6) * Math.PI; c.moveTo(CX + Math.cos(a) * 30, AY + Math.sin(a) * 30); c.lineTo(CX + Math.cos(a) * AR, AY + Math.sin(a) * AR); }
        c.stroke();
        c.beginPath(); c.arc(CX, AY, 30, Math.PI, 0); c.stroke();
        c.restore();
        // the stone surround with its keystone, and the sill
        const frame = new Path2D();
        frame.moveTo(GX0 - fx, GY1 + 2); frame.lineTo(GX0 - fx, AY); frame.arc(CX, AY, AR + fx, Math.PI, 0); frame.lineTo(GX1 + fx, GY1 + 2); frame.closePath();
        glassPath(frame);
        c.fillStyle = lin(c, GX0 - fx, 0, GX1 + fx, 0, [[0, STONE_LT], [0.5, STONE], [1, '#b9af9b']]); c.fill(frame, 'evenodd');
        c.strokeStyle = STONE_DK; c.lineWidth = 1.6; c.beginPath(); glassPath(c); c.stroke();
        c.fillStyle = STONE_LT; c.beginPath(); c.moveTo(CX - 14, GY0 - 20); c.lineTo(CX + 14, GY0 - 20); c.lineTo(CX + 9, GY0 + 4); c.lineTo(CX - 9, GY0 + 4); c.closePath(); c.fill();
        c.strokeStyle = STONE_DK; c.lineWidth = 1; c.stroke();
        c.fillStyle = 'rgba(40,30,20,0.34)'; c.fillRect(GX0 - 24, GY1 + 18, GX1 - GX0 + 52, 7);
        c.fillStyle = lin(c, 0, GY1, 0, GY1 + 20, [[0, STONE_LT], [1, '#a89e8a']]); c.fillRect(GX0 - 26, GY1, GX1 - GX0 + 52, 20);
        // a run of little stone balusters under the sill
        for (let x = GX0 - 16; x < GX1 + 16; x += 25) {
          c.fillStyle = 'rgba(40,30,20,0.3)'; c.fillRect(x + 3, GY1 + 24, 13, 58);
          c.fillStyle = lin(c, x, 0, x + 15, 0, [[0, STONE_LT], [1, STONE_DK]]); c.beginPath(); c.moveTo(x + 5, GY1 + 22); c.lineTo(x + 10, GY1 + 22); c.quadraticCurveTo(x + 18, GY1 + 56, x + 12, GY1 + 80); c.lineTo(x + 3, GY1 + 80); c.quadraticCurveTo(x - 3, GY1 + 56, x + 5, GY1 + 22); c.closePath(); c.fill();
        }
        // the wisteria comes round the arch on both sides
        for (const [x0, flip] of [[0, 1], [W, -1]]) {
          c.strokeStyle = '#6e5a42'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0 - flip * 6, 70); c.bezierCurveTo(x0 + flip * 30, 40, x0 + flip * 50, 90, x0 + flip * 84, 30); c.stroke();
          for (let i = 0; i < 9; i++) {
            const x = x0 + flip * (4 + i * 8 + q() * 4), y = 20 + q() * 38;
            leaflets(c, q, x, y, q() * TAU, 4);
            spray(c, q, x, y + 6, 44 + q() * 44);
          }
        }
      },
    };
  }

  // ---------------------------------------------- weeds, for the two garden jobs
  function ivyLeaf(c, x, y, s, a, col) {
    c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = col;
    c.beginPath(); c.moveTo(0, -s); c.lineTo(s * 0.34, -s * 0.34); c.lineTo(s, -s * 0.2); c.lineTo(s * 0.5, s * 0.34); c.lineTo(s * 0.7, s); c.lineTo(0, s * 0.62); c.lineTo(-s * 0.7, s); c.lineTo(-s * 0.5, s * 0.34); c.lineTo(-s, -s * 0.2); c.lineTo(-s * 0.34, -s * 0.34); c.closePath(); c.fill();
    c.restore();
  }
  function dandelion(c, r, x, y, s) {
    for (let k = 0; k < 9; k++) {
      c.fillStyle = U.pick(r, ['#4f8a3a', '#5d9a44', '#6aa04c']);
      c.save(); c.translate(x, y); c.rotate((k / 9) * TAU);
      c.beginPath(); c.moveTo(0, 0);
      for (let j = 1; j <= 4; j++) c.lineTo((s * j) / 4, j % 2 ? -4 : -1.5);
      c.lineTo(s, 0); for (let j = 4; j >= 1; j--) c.lineTo((s * j) / 4, j % 2 ? 4 : 1.5);
      c.closePath(); c.fill(); c.restore();
    }
    dot(c, x, y, 4.5, r() < 0.6 ? '#f3cf3a' : '#ffffff');
  }
  // a few crumbs of soil where a weed comes out
  function crumbs(c, x, y) {
    if (Math.random() < 0.15) dot(c, x + (Math.random() - 0.5) * 10, y + (Math.random() - 0.5) * 10, 1.2, 'rgba(30,20,12,0.25)');
  }

  // ---------------------------------------------- WISTERIA MANOR: THE WISTERIA
  // The old wisteria the house is named for, two trunks trained along wires on the
  // south wall. Nobody has been up a ladder in years, and ivy, bindweed and bramble
  // have climbed all over it. Pull them away and the stone comes back, with the
  // long lilac sprays hanging in rows.
  // bed { flower: 'wisteria' }
  function wisteriaWall(S) {
    const { r, nz, bleed } = S;
    const X0 = 14, X1 = 346, Y0 = 52, Y1 = 522, WIRES = [126, 236, 346], SOIL = 470;
    const region = new Path2D();
    rrPath(region, X0, Y0, X1 - X0, Y1 - Y0, 26);
    const wall = (c) => ashlar(c, U.rng(1912), nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1);
    const thick = [];
    for (let i = 0; i < 12; i++) thick.push([X0 + 30 + r() * 270, Y0 + 30 + r() * 410, 22 + r() * 10]);
    function plant(c) {
      const q = U.rng(19121), bark = (w, path) => { c.lineCap = 'round'; c.strokeStyle = '#4a3a2a'; c.lineWidth = w + 2; c.beginPath(); path(); c.stroke(); c.strokeStyle = '#7d674c'; c.lineWidth = w; c.stroke(); c.strokeStyle = 'rgba(255,240,210,0.2)'; c.lineWidth = w * 0.3; c.stroke(); };
      c.strokeStyle = 'rgba(50,46,42,0.6)'; c.lineWidth = 1;
      for (const y of WIRES) { c.beginPath(); c.moveTo(X0, y); c.lineTo(X1, y); c.stroke(); for (let x = 44; x < X1; x += 136) dot(c, x, y, 2.4, IRON); }
      // the two old trunks, wound round each other on the way up
      bark(11, () => { c.moveTo(70, SOIL + 8); c.bezierCurveTo(30, 400, 96, 340, 64, 240); c.bezierCurveTo(44, 180, 70, 150, 92, WIRES[0]); });
      bark(9, () => { c.moveTo(290, SOIL + 8); c.bezierCurveTo(330, 400, 262, 340, 296, 240); c.bezierCurveTo(316, 180, 290, 150, 268, WIRES[0]); });
      for (const y of WIRES) {
        bark(5.5, () => { c.moveTo(66, y + 2); c.bezierCurveTo(120, y - 7, 150, y + 6, 196, y); });
        bark(5.5, () => { c.moveTo(294, y + 2); c.bezierCurveTo(250, y + 7, 216, y - 6, 176, y); });
      }
      for (const y of WIRES) for (let x = 26; x < 340; x += 22) {
        const px = x + q() * 10;
        leaflets(c, q, px, y - 2, -0.5 - q() * 2.1, 3);
        spray(c, q, px, y + 2, 46 + q() * 44);
      }
      // the bed at the foot of the wall
      c.fillStyle = lin(c, 0, SOIL, 0, Y1, [[0, '#4b3424'], [1, '#6a4d36']]); c.fillRect(X0, SOIL, X1 - X0, Y1 - SOIL);
      for (let i = 0; i < 260; i++) { c.fillStyle = q() < 0.5 ? 'rgba(255,230,200,0.1)' : 'rgba(0,0,0,0.2)'; c.fillRect(X0 + q() * (X1 - X0), SOIL + q() * (Y1 - SOIL), 1.6, 1.6); }
      for (let x = 30; x < 340; x += 34) if (Math.abs(x - 70) > 22 && Math.abs(x - 290) > 22) for (let k = 0; k < 7; k++) dot(c, x + (k - 3) * 3.4 + q() * 2, 500 - q() * 16, 2.1, U.pick(q, ['#6f9a7a', '#8bb08e', LILAC]));
    }
    return {
      family: 'weed', particle: 'weed', region, depth: true,
      tough(x, y) { for (const [wx, wy, s] of thick) if (Math.hypot(x - wx, y - wy) < s) return 1.6; return 1; },
      decor(c) {
        const { x0, x1, y1 } = bleed;
        wall(c);
        // the coping along the top, with the sky over it
        c.fillStyle = lin(c, 0, SOIL, 0, Y1, [[0, '#4b3424'], [1, '#6a4d36']]); c.fillRect(x0, SOIL, x1 - x0, Y1 - SOIL + 2);
        c.fillStyle = lin(c, 0, bleed.y0, 0, 30, [[0, '#a9cfe6'], [1, '#d6e9ef']]); c.fillRect(x0, bleed.y0, x1 - x0, 34);
        c.fillStyle = 'rgba(40,30,20,0.3)'; c.fillRect(x0, 44, x1 - x0, 6);
        c.fillStyle = lin(c, 0, 26, 0, 46, [[0, STONE_LT], [1, '#a59b87']]); c.fillRect(x0, 28, x1 - x0, 18);
        // the gravel walk, behind a stone kerb
        c.fillStyle = '#cdbf9f'; c.fillRect(x0, 530, x1 - x0, y1 - 530);
        const q = U.rng(19122);
        for (let i = 0; i < 700; i++) dot(c, x0 + q() * (x1 - x0), 530 + q() * (y1 - 530), 0.6 + q() * 1.2, U.pick(q, ['#b5a585', '#e2d6bc', '#a8977a', '#d8c9a8']));
        c.fillStyle = STONE; c.fillRect(x0, 522, x1 - x0, 12); c.fillStyle = STONE_LT; c.fillRect(x0, 522, x1 - x0, 3);
        for (let x = 20; x < x1; x += 62) { c.fillStyle = 'rgba(60,50,40,0.4)'; c.fillRect(x, 522, 1.2, 12); }
      },
      clean(c) { wall(c); plant(c); },
      dirt(c) {
        const g = ramp(['#26481f', '#315a26', '#3f6d2e', '#507f38']);
        field(c, 0, 0, W, H, 3, (x, y) => g(nz.fbm(x * 0.03, y * 0.03, 4)));
        // the long stems first, every way at once
        const stems = [];
        for (let i = 0; i < 520; i++) {
          const x = r() * W, y = r() * H, l = 30 + r() * 80, a = r() * TAU;
          stems.push({ x0: x, y0: y, cx: x + Math.cos(a + 1) * l * 0.5, cy: y + Math.sin(a + 1) * l * 0.5, x1: x + Math.cos(a) * l, y1: y + Math.sin(a) * l, col: U.pick(r, ['#5d4a30', '#46603a', '#6d7a44']), w: 1.4 });
        }
        strokesByColour(c, stems, 1.4);
        for (let i = 0; i < 1500; i++) ivyLeaf(c, r() * W, r() * H, 5 + r() * 5, r() * TAU, U.pick(r, ['#2f6128', '#3b7230', '#4a8438', '#5b9744', '#2a5424', '#6aa24e']));
        // bindweed flowers, and bramble with its few berries
        for (let i = 0; i < 46; i++) { const x = r() * W, y = r() * H; dot(c, x, y, 5.5, '#f6f2ea'); dot(c, x, y, 2.4, '#e2d8a8'); }
        for (const [x, y, s] of thick) { for (let k = 0; k < 16; k++) ivyLeaf(c, x + (r() - 0.5) * s * 2, y + (r() - 0.5) * s * 2, 7 + r() * 5, r() * TAU, U.pick(r, ['#2a5424', '#2f6128'])); for (let k = 0; k < 4; k++) dot(c, x + (r() - 0.5) * s, y + (r() - 0.5) * s, 2.6, '#3a2238'); }
      },
      top(c) {
        c.fillStyle = lin(c, 0, 50, 0, 62, [[0, 'rgba(40,30,20,0.3)'], [1, 'rgba(40,30,20,0)']]); c.fillRect(bleed.x0, 50, bleed.x1 - bleed.x0, 12);
      },
      stamp(c, x, y) { crumbs(c, x, y); },
    };
  }

  // ----------------------------------------------- WISTERIA MANOR: THE TOPIARY
  // The knot garden from above: low box hedges in a square, a diamond and a ring
  // round the sundial, a clipped ball on every corner and pale gravel between. It
  // has gone to weeds, the box has grown shaggy and the shape has all but gone.
  // bed { flower: 'box' }
  function boxKnot(S) {
    const { r, nz, bleed } = S;
    const X0 = 26, X1 = 334, Y0 = 56, Y1 = 544, CX = 180, CY = 300, DIAL = 30, I = 26;
    const region = new Path2D();
    rrPath(region, X0, Y0, X1 - X0, Y1 - Y0, 16);
    region.moveTo(CX + DIAL, CY); region.arc(CX, CY, DIAL, 0, TAU);
    const L = X0 + I, R = X1 - I, T = Y0 + I, B = Y1 - I;
    const BALLS = [[L, T], [R, T], [L, B], [R, B], [CX, T], [CX, B], [L, CY], [R, CY]];
    const LAV = [[86, 134], [274, 134], [86, 466], [274, 466]];
    const bigWeeds = [];
    for (let i = 0; i < 14; i++) bigWeeds.push([X0 + 24 + r() * 260, Y0 + 24 + r() * 440, 16 + r() * 10]);
    const lines = () => {
      const pts = [], run = (a, b) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 3.5); for (let k = 0; k <= n; k++) pts.push([U.lerp(a[0], b[0], k / n), U.lerp(a[1], b[1], k / n)]); };
      for (const [a, b] of [[[L, T], [R, T]], [[R, T], [R, B]], [[R, B], [L, B]], [[L, B], [L, T]], [[CX, T], [R, CY]], [[R, CY], [CX, B]], [[CX, B], [L, CY]], [[L, CY], [CX, T]]]) run(a, b);
      for (let k = 0; k < 100; k++) { const a = (k / 100) * TAU; pts.push([CX + Math.cos(a) * 56, CY + Math.sin(a) * 56]); }
      return pts;
    };
    function hedges(c, q, shaggy) {
      const pts = lines();
      for (const [x, y] of pts) dot(c, x + 3, y + 4, 12, 'rgba(30,40,20,0.08)');
      for (const [x, y] of pts) dot(c, x, y, 9.5, '#2f5a2c');
      for (const [x, y] of pts) dot(c, x - 1, y - 1.4, 8, '#47803c');
      for (const [x, y] of pts) for (let k = 0; k < 3; k++) dot(c, x + (q() - 0.5) * 15, y + (q() - 0.5) * 15, 0.9 + q() * 1.1, U.pick(q, ['#6fa850', '#5a9444', '#366b30', '#8ac060']));
      for (const [x, y] of BALLS) {
        dot(c, x + 5, y + 7, 19, 'rgba(30,40,20,0.3)');
        const g = c.createRadialGradient(x - 6, y - 7, 2, x, y, 20); g.addColorStop(0, '#7ab85c'); g.addColorStop(0.6, '#47803c'); g.addColorStop(1, '#2a5228');
        dot(c, x, y, 19, g);
        for (let k = 0; k < 60; k++) { const a = q() * TAU, d = q() * 18; dot(c, x + Math.cos(a) * d, y + Math.sin(a) * d, 0.9, U.pick(q, ['#8ac060', '#3a7234', '#66a24c'])); }
      }
      if (!shaggy) for (const [x, y] of LAV) for (let k = 0; k < 90; k++) { const a = q() * TAU, d = q() * 25; dot(c, x + Math.cos(a) * d, y + Math.sin(a) * d, 2.4, U.pick(q, [LILAC, LILAC_DK, '#8fae7e', LILAC_LT])); }
    }
    return {
      family: 'weed', particle: 'weed', region, depth: true,
      tough(x, y) { for (const [wx, wy, s] of bigWeeds) if (Math.hypot(x - wx, y - wy) < s * 0.6) return 1.6; return 1; },
      decor(c) {
        mowedLawn(c, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1, false);
        softShadow(c, region, 6, 0.3);
        c.save(); c.strokeStyle = STONE_DK; c.lineWidth = 10; c.setLineDash([26, 2]); c.stroke(region); c.strokeStyle = STONE_LT; c.lineWidth = 7; c.stroke(region); c.restore();
      },
      clean(c) {
        const q = U.rng(1903), g = ramp(['#d2c5a6', '#ddd1b5', '#e6dcc4']);
        field(c, 0, 0, W, H, 3, (x, y) => g(nz.fbm(x * 0.04, y * 0.04, 3)));
        for (let i = 0; i < 2200; i++) dot(c, q() * W, q() * H, 0.5 + q(), U.pick(q, ['#b9aa8a', '#efe6d0', '#a9987a']));
        hedges(c, q, false);
      },
      dirt(c) {
        const g = ramp(['#2f5a24', '#3d6e2c', '#4d8034', '#5f8f3c']);
        field(c, 0, 0, W, H, 3, (x, y) => g(nz.fbm(x * 0.04, y * 0.04, 4)));
        hedges(c, U.rng(1903), true);
        const items = [];
        for (let i = 0; i < 2300; i++) {
          const x = r() * W, y = r() * H, l = 8 + r() * 18, lean = (r() - 0.5) * 12;
          items.push({ x0: x, y0: y, cx: x + lean * 0.3, cy: y - l * 0.6, x1: x + lean, y1: y - l, col: U.pick(r, ['#3b7229', '#4d8a34', '#62a042', '#7bb553', '#8aa84a']), w: 1.6 });
        }
        strokesByColour(c, items, 1.6);
        for (const [x, y, s] of bigWeeds) dandelion(c, r, x, y, s);
        for (let i = 0; i < 40; i++) { const x = r() * W, y = r() * H; for (let k = 0; k < 3; k++) dot(c, x + Math.cos(k * 2.1) * 3, y + Math.sin(k * 2.1) * 3, 3, '#6fae55'); }
      },
      top(c) {
        // the sundial on its round stone plinth
        dot(c, CX + 3, CY + 5, DIAL + 3, 'rgba(30,30,20,0.35)');
        dot(c, CX, CY, DIAL + 1, STONE_DK); dot(c, CX - 0.6, CY - 0.8, DIAL - 1, STONE_LT); dot(c, CX, CY, DIAL - 8, '#c7a862'); dot(c, CX, CY, DIAL - 10, GOLD_LT);
        c.strokeStyle = GOLD_DK; c.lineWidth = 1.2;
        for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU; c.beginPath(); c.moveTo(CX + Math.cos(a) * 11, CY + Math.sin(a) * 11); c.lineTo(CX + Math.cos(a) * 18, CY + Math.sin(a) * 18); c.stroke(); }
        c.fillStyle = 'rgba(70,50,20,0.4)'; c.beginPath(); c.moveTo(CX, CY); c.lineTo(CX + 18, CY + 12); c.lineTo(CX + 2, CY + 4); c.closePath(); c.fill();
        c.fillStyle = GOLD_DK; c.beginPath(); c.moveTo(CX - 1.6, CY + 3); c.lineTo(CX + 1.6, CY + 3); c.lineTo(CX, CY - 19); c.closePath(); c.fill();
      },
      stamp(c, x, y) { crumbs(c, x, y); },
    };
  }

  // ----------------------------------------------- WISTERIA MANOR: THE GRAND DOOR
  // The double front door at the top of the steps, under a fanlight and between two
  // stone columns. The old paint is faded and flaking. It takes the player's colour
  // on both leaves, and the brass stays above the paint.
  // door { what: 'grand' }
  function grandDoor(S) {
    const { r, nz, bleed } = S;
    const X0 = 78, X1 = 282, CX = 180, DY = 228, BOT = 516, R = (X1 - X0) / 2, GAP = 2;
    const region = new Path2D();
    region.rect(X0, DY, CX - GAP - X0, BOT - DY); region.rect(CX + GAP, DY, X1 - CX - GAP, BOT - DY);
    const panels = [];
    for (const lx of [X0 + 14, CX + 14]) for (const [y, h] of [[DY + 16, 144], [DY + 176, 34], [DY + 226, 50]]) panels.push([lx, y, 74, h]);
    function step(c, x0, x1, y, h) {
      c.fillStyle = 'rgba(40,30,20,0.3)'; c.fillRect(x0, y + h, x1 - x0, 5);
      c.fillStyle = lin(c, 0, y, 0, y + h, [[0, STONE_LT], [0.3, STONE], [1, '#a2988a']]); c.fillRect(x0, y, x1 - x0, h);
      c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(x0, y, x1 - x0, 1.6);
    }
    function column(c, x) {
      c.fillStyle = 'rgba(40,30,20,0.3)'; c.fillRect(x - 12, 142, 34, 376);
      c.fillStyle = lin(c, x - 18, 0, x + 18, 0, [[0, '#a89e8a'], [0.35, STONE_LT], [0.75, STONE], [1, STONE_DK]]); c.fillRect(x - 15, 130, 30, 388);
      c.strokeStyle = 'rgba(90,80,66,0.3)'; c.lineWidth = 1.2;
      for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(x + k * 5.6, 140); c.lineTo(x + k * 5.6, 506); c.stroke(); }
      c.fillStyle = STONE_LT; c.fillRect(x - 21, 118, 42, 8); c.fillStyle = STONE; c.fillRect(x - 18, 126, 36, 7); c.fillStyle = STONE_LT; c.fillRect(x - 20, 504, 40, 14);
      c.fillStyle = STONE_DK; c.fillRect(x - 20, 516, 40, 2);
    }
    return {
      family: 'paint', particle: 'paint', region,
      tough: (x, y) => (y > BOT - 60 ? 1.35 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        ashlar(c, U.rng(1906), nz, x0, y0, x1, y1);
        // the deep stone reveal of the doorway, and the fanlight lit from inside
        c.fillStyle = '#3a342c'; c.beginPath(); c.moveTo(X0 - 6, BOT); c.lineTo(X0 - 6, DY); c.arc(CX, DY, R + 6, Math.PI, 0); c.lineTo(X1 + 6, BOT); c.closePath(); c.fill();
        c.save(); c.beginPath(); c.arc(CX, DY - 4, R - 2, Math.PI, 0); c.closePath(); c.clip();
        c.fillStyle = lin(c, 0, DY - R, 0, DY, [[0, '#6a5a44'], [1, '#e8b860']]); c.fillRect(X0, DY - R - 6, X1 - X0, R + 6);
        glow(c, CX, DY - 6, 90, 'rgba(255,226,160,0.8)');
        c.strokeStyle = '#f4efe2'; c.lineWidth = 3.4;
        for (let k = 1; k < 8; k++) { const a = Math.PI + (k / 8) * Math.PI; c.beginPath(); c.moveTo(CX + Math.cos(a) * 26, DY - 4 + Math.sin(a) * 26); c.lineTo(CX + Math.cos(a) * R, DY - 4 + Math.sin(a) * R); c.stroke(); }
        c.beginPath(); c.arc(CX, DY - 4, 26, Math.PI, 0); c.stroke();
        c.beginPath(); c.arc(CX, DY - 4, 64, Math.PI, 0); c.stroke();
        c.restore();
        c.fillStyle = STONE_LT; c.fillRect(X0 - 6, DY - 7, X1 - X0 + 12, 7); c.fillStyle = STONE_DK; c.fillRect(X0 - 6, DY - 1, X1 - X0 + 12, 2);
        c.strokeStyle = STONE_LT; c.lineWidth = 9; c.beginPath(); c.arc(CX, DY - 4, R + 8, Math.PI, 0); c.stroke();
        c.strokeStyle = STONE_DK; c.lineWidth = 1.4; c.beginPath(); c.arc(CX, DY - 4, R + 3, Math.PI, 0); c.stroke();
        for (const x of [39, 321]) column(c, x);
        // the pediment over the columns, with a wreath carved in it
        c.fillStyle = 'rgba(40,30,20,0.3)'; c.fillRect(8, 112, 344, 10);
        c.fillStyle = lin(c, 0, 94, 0, 118, [[0, STONE_LT], [1, '#b0a692']]); c.fillRect(8, 94, 344, 22);
        c.fillStyle = lin(c, 0, 8, 0, 92, [[0, STONE_LT], [1, STONE]]); c.beginPath(); c.moveTo(-4, 94); c.lineTo(CX, 6); c.lineTo(364, 94); c.closePath(); c.fill();
        c.fillStyle = '#b7ad99'; c.beginPath(); c.moveTo(42, 88); c.lineTo(CX, 22); c.lineTo(318, 88); c.closePath(); c.fill();
        c.strokeStyle = '#efe8d6'; c.lineWidth = 3.4; c.beginPath(); c.arc(CX, 62, 15, 0, TAU); c.stroke();
        c.strokeStyle = STONE_DK; c.lineWidth = 1; c.beginPath(); c.arc(CX, 62, 11, 0, TAU); c.stroke();
        // the steps, narrowing up to the door
        step(c, x0, x1, 560, 44); step(c, 14, 346, 538, 22); step(c, 44, 316, 516, 22);
      },
      clean(c, paint) { c.fillStyle = paint; c.fillRect(0, 0, W, H); },
      cleanOver(c) {
        for (const [x, y, w, h] of panels) {
          c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x, y, w, 4); c.fillRect(x, y, 4, h);
          c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(x, y + h - 4, w, 4); c.fillRect(x + w - 4, y, 4, h);
          c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(x + 11, y + 11, w - 22, h - 22);
          c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(x + 11, y + 11, w - 22, 2); c.fillRect(x + 11, y + 11, 2, h - 22);
        }
        const q = U.rng(19061);
        for (let i = 0; i < 170; i++) { c.strokeStyle = 'rgba(0,0,0,0.05)'; c.lineWidth = 0.8; const x = X0 + q() * (X1 - X0), y = DY + q() * 270; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 20 + q() * 30); c.stroke(); }
      },
      dirt(c) {
        const g = ramp(['#6f7f7a', '#808e87', '#909b93', '#a2aa9f']);
        field(c, X0 - 4, DY - 4, X1 + 4, BOT + 4, 1.5, (x, y) => g(nz.fbm(x * 0.06, y * 0.012, 4)));
        c.strokeStyle = 'rgba(60,55,45,0.5)'; c.lineWidth = 0.7;
        for (let i = 0; i < 160; i++) {
          let x = X0 + r() * (X1 - X0), y = DY + r() * (BOT - DY); c.beginPath(); c.moveTo(x, y);
          for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 16; y += (r() - 0.5) * 16; c.lineTo(x, y); }
          c.stroke();
        }
        peelingPaint(c, r, X0, DY, X1, BOT, 46, '#8a6a4c');
        for (const [x, y, w, h] of panels) { c.strokeStyle = 'rgba(50,45,38,0.5)'; c.lineWidth = 2; c.strokeRect(x, y, w, h); }
        grime(c, r, X0, BOT - 90, X1, BOT, 22);
      },
      top(c) {
        const brass = (x0, x1) => lin(c, x0, 0, x1, 0, [[0, GOLD_DK], [0.45, GOLD_LT], [1, GOLD_DK]]);
        // the line where the two leaves meet, and a shadow from the lintel
        c.fillStyle = 'rgba(20,14,10,0.7)'; c.fillRect(CX - GAP, DY, GAP * 2, BOT - DY);
        c.fillStyle = lin(c, 0, DY, 0, DY + 16, [[0, 'rgba(20,14,10,0.35)'], [1, 'rgba(20,14,10,0)']]); c.fillRect(X0, DY, X1 - X0, 16);
        // a ring in a lion's mane on each leaf, then the long pull handles and hinges
        for (const x of [CX - 45, CX + 45]) {
          dot(c, x + 1, DY + 88, 15, 'rgba(20,14,10,0.3)'); dot(c, x, DY + 86, 14, GOLD_DK);
          for (let k = 0; k < 14; k++) { const a = (k / 14) * TAU; dot(c, x + Math.cos(a) * 12, DY + 86 + Math.sin(a) * 12, 3, GOLD); }
          dot(c, x, DY + 86, 8.6, GOLD); dot(c, x - 2.6, DY + 83, 1.2, OAK_DK); dot(c, x + 2.6, DY + 83, 1.2, OAK_DK);
          c.strokeStyle = GOLD_LT; c.lineWidth = 3; c.beginPath(); c.arc(x, DY + 98, 11, 0.1, Math.PI - 0.1); c.stroke();
        }
        for (const s of [-1, 1]) {
          const x = CX + s * 12;
          c.fillStyle = 'rgba(20,14,10,0.3)'; c.fillRect(x - 3, DY + 174, 9, 66);
          c.fillStyle = brass(x - 5, x + 5); c.beginPath(); c.roundRect(x - 5, DY + 170, 10, 68, 5); c.fill();
          for (const y of [DY + 34, BOT - 34]) { c.fillStyle = GOLD_DK; c.fillRect(s < 0 ? X0 : X1 - 7, y, 7, 24); c.fillStyle = GOLD_LT; c.fillRect(s < 0 ? X0 + 1 : X1 - 6, y, 1.4, 24); }
        }
        c.fillStyle = brass(X0, X1); c.fillRect(X0 - 4, BOT - 5, X1 - X0 + 8, 5);
        // a bay tree in a stone urn on each side of the top step
        for (const x of [62, 298]) {
          c.fillStyle = 'rgba(40,30,20,0.3)'; c.beginPath(); c.ellipse(x + 3, 530, 21, 5, 0, 0, TAU); c.fill();
          c.fillStyle = OAK; c.fillRect(x - 2, 462, 4, 40);
          c.fillStyle = lin(c, x - 16, 0, x + 16, 0, [[0, STONE_LT], [1, STONE_DK]]); c.beginPath(); c.moveTo(x - 18, 494); c.lineTo(x + 18, 494); c.lineTo(x + 10, 530); c.lineTo(x - 10, 530); c.closePath(); c.fill();
          shrub(c, U.rng(x), x, 438, 30, '#4f8a3c');
        }
      },
      stamp: paintStamp,
    };
  }

  // -------------------------------------------------- WISTERIA MANOR: THE LAKE
  function reed(c, q, x, y, h, head) {
    const lean = (q() - 0.5) * 16;
    c.strokeStyle = U.pick(q, ['#6f8f48', '#86a253', '#5c7a3e', '#a3a85c']); c.lineWidth = 1.7; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + lean * 0.2, y - h * 0.6, x + lean, y - h); c.stroke();
    if (head) { c.fillStyle = '#5a3a24'; c.beginPath(); c.ellipse(x + lean * 0.86, y - h * 0.88, 2.7, 9, lean * 0.02, 0, TAU); c.fill(); }
  }
  function swan(c, x, y, s, dir) {
    c.save(); c.translate(x, y); c.scale(s * dir, s);
    c.fillStyle = 'rgba(60,110,120,0.3)'; c.beginPath(); c.ellipse(1, 7, 19, 3.4, 0, 0, TAU); c.fill();
    c.strokeStyle = '#fbf8f0'; c.lineWidth = 3.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(10, 0); c.bezierCurveTo(21, -5, 7, -13, 13, -21); c.stroke();
    c.fillStyle = '#fbf8f0'; c.beginPath(); c.moveTo(-17, -5); c.quadraticCurveTo(-6, -10, 8, -3); c.quadraticCurveTo(15, 0, 12, 4); c.quadraticCurveTo(0, 8, -12, 4); c.closePath(); c.fill();
    c.fillStyle = '#e5dfd2'; c.beginPath(); c.ellipse(-3, -1, 9, 3.6, 0.1, 0, TAU); c.fill();
    c.fillStyle = '#e98a3a'; c.beginPath(); c.moveTo(14, -23); c.lineTo(20, -20.5); c.lineTo(14, -19.5); c.closePath(); c.fill();
    dot(c, 13.6, -22.4, 0.9, '#2b2a33');
    c.restore();
  }
  // Looking up the length of the lake from the reeds, to the house on its hill at
  // the far end. Years of still water have given it a skin of duckweed, blanket
  // weed and fallen leaves. Skim it off and the sky comes back, with the lilies
  // and the two swans who never left.
  // pond { what: 'lake' }
  function longLake(S) {
    const { r, nz, bleed } = S;
    const Y0 = 134, Y1 = 544, CX = 180;
    const bank = (y, s) => CX + s * (56 + 180 * Math.pow(Math.max(0, y - Y0) / (Y1 - Y0), 0.75)) + (nz.n2(y * 0.02, s + 3) - 0.5) * 26;
    const foot = (x) => Y1 + Math.sin(x * 0.02 + 1) * 8;
    const region = new Path2D();
    region.moveTo(bank(Y0, -1), Y0);
    for (let y = Y0; y <= Y1; y += 10) region.lineTo(bank(y, 1), y);
    for (let x = 430; x >= -70; x -= 10) region.lineTo(x, foot(x));
    for (let y = Y1; y >= Y0; y -= 10) region.lineTo(bank(y, -1), y);
    region.closePath();
    const pads = [];
    for (let i = 0; i < 400 && pads.length < 22; i++) {
      const y = Y0 + 50 + r() * (Y1 - Y0 - 70), l = bank(y, -1), rr = bank(y, 1), t = (y - Y0) / (Y1 - Y0), x = r() < 0.5 ? l + 16 + r() * 60 * t : rr - 16 - r() * 60 * t;
      if (x > 4 && x < 356) pads.push([x, y, 7 + t * 15, r() * TAU, r() < 0.4]);
    }
    // a row of light on the water at each height, kept clear of the banks
    const GLINTS = Array.from({ length: 7 }, (_, i) => { const y = 190 + ((i * 67) % 320); return [y, Math.min(bank(y, 1) - 180, 180 - bank(y, -1)) - 22]; });
    function water(c) {
      const q = U.rng(19051);
      c.fillStyle = lin(c, 0, Y0, 0, Y1, [[0, '#d4e7e6'], [0.22, '#a9d5de'], [0.65, '#62acbd'], [1, '#3f8ca0']]); c.fillRect(-10, Y0 - 6, W + 20, Y1 - Y0 + 26);
      // the far trees and the house, upside down in the water
      for (const [x, w] of [[118, 34], [138, 26], [246, 34], [224, 24]]) { c.fillStyle = 'rgba(60,96,70,0.34)'; c.beginPath(); c.ellipse(x, Y0 + 12, w, 22, 0, 0, TAU); c.fill(); }
      c.fillStyle = lin(c, 0, Y0, 0, Y0 + 54, [[0, 'rgba(232,224,200,0.5)'], [1, 'rgba(232,224,200,0)']]); c.fillRect(146, Y0, 68, 54);
      for (const [x, y, w] of [[110, 250, 60], [236, 310, 88], [120, 390, 110], [250, 470, 120]]) { c.fillStyle = 'rgba(255,255,255,0.22)'; c.beginPath(); c.ellipse(x, y, w, 5 + w * 0.08, 0, 0, TAU); c.fill(); }
      c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 1.2;
      for (let i = 0; i < 70; i++) { const y = Y0 + 8 + q() * (Y1 - Y0), t = (y - Y0) / (Y1 - Y0), x = q() * W, l = 6 + t * 26; c.beginPath(); c.moveTo(x - l, y); c.quadraticCurveTo(x, y - 1.4, x + l, y); c.stroke(); }
      for (const [x, y, s, a, bloom] of pads) {
        c.save(); c.translate(x, y); c.scale(1, 0.42); c.rotate(a);
        c.fillStyle = 'rgba(30,70,70,0.3)'; c.beginPath(); c.arc(1, 3, s, 0, TAU); c.fill();
        c.fillStyle = '#4f8f48'; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, s, 0.35, TAU - 0.05); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(190,226,140,0.5)'; c.lineWidth = 1; for (let k = 0; k < 5; k++) { const b = 0.8 + k * 1.1; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(b) * s * 0.9, Math.sin(b) * s * 0.9); c.stroke(); }
        c.restore();
        if (bloom) for (let k = 0; k < 7; k++) { const b = (k / 7) * TAU; c.fillStyle = k % 2 ? '#f6c9d6' : '#fbe7ec'; c.beginPath(); c.ellipse(x + Math.cos(b) * s * 0.26, y - s * 0.2 + Math.sin(b) * s * 0.1, s * 0.26, s * 0.13, b, 0, TAU); c.fill(); }
        if (bloom) dot(c, x, y - s * 0.22, s * 0.1, '#f3cf3a');
      }
    }
    return {
      family: 'skim', particle: 'water', region, depth: true,
      tough: (x, y) => (nz.n2(x * 0.03, y * 0.03) > 0.7 ? 1.5 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed, q = U.rng(1905);
        c.fillStyle = lin(c, 0, y0, 0, Y0, [[0, '#9cc9e4'], [1, '#eef0e2']]); c.fillRect(x0, y0, x1 - x0, Y0 - y0 + 6);
        for (const [x, y, w] of [[70, 34, 54], [286, 22, 44], [190, 52, 34]]) { c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.ellipse(x, y, w, 9, 0, 0, TAU); c.ellipse(x - w * 0.3, y - 6, w * 0.4, 8, 0, 0, TAU); c.fill(); }
        c.fillStyle = '#a9c79a'; c.beginPath(); c.moveTo(x0, 112); c.quadraticCurveTo(110, 66, 180, 74); c.quadraticCurveTo(270, 62, x1, 110); c.lineTo(x1, Y0); c.lineTo(x0, Y0); c.closePath(); c.fill();
        // the house on its hill, small and far off
        c.fillStyle = '#7f8a9a'; c.beginPath(); c.moveTo(136, 88); c.lineTo(146, 78); c.lineTo(214, 78); c.lineTo(224, 88); c.closePath(); c.fill();
        c.fillStyle = '#e4dcc4'; c.fillRect(136, 88, 88, 32); c.fillRect(172, 68, 16, 30);
        c.fillStyle = '#7f8a9a'; c.beginPath(); c.moveTo(170, 68); c.lineTo(180, 56); c.lineTo(190, 68); c.closePath(); c.fill();
        c.fillStyle = '#5c6a7c'; for (let x = 141; x < 220; x += 10) if (Math.abs(x - 180) > 8) c.fillRect(x, 95, 5, 13);
        c.fillStyle = '#9b7cc8'; c.fillRect(138, 110, 84, 3);
        mowedLawn(c, nz, x0, Y0 - 12, x1, y1, false);
        for (const [x, y, s, col] of [[46, 104, 46, '#4f8a3c'], [96, 118, 34, '#5d9644'], [-4, 132, 56, '#467e37'], [314, 104, 48, '#467e37'], [262, 118, 36, '#5d9644'], [364, 132, 54, '#4f8a3c']]) shrub(c, q, x, y, s, col);
        softShadow(c, region, 8, 0.35);
        c.strokeStyle = '#6f5c42'; c.lineWidth = 5; c.stroke(region); c.strokeStyle = 'rgba(190,170,130,0.5)'; c.lineWidth = 1.6; c.stroke(region);
        for (let i = 0; i < 90; i++) { const y = Y0 + 20 + q() * (Y1 - Y0 - 20), s = q() < 0.5 ? -1 : 1, x = bank(y, s) + s * (2 + q() * 10), t = (y - Y0) / (Y1 - Y0); reed(c, q, x, y + 2, 10 + t * 42, q() < 0.14); }
      },
      clean: water,
      live(c, t) {
        const a = t * 0.09, x = 180 + Math.sin(a) * 62, y = 262 + Math.cos(a * 0.7) * 18, dir = Math.cos(a) >= 0 ? 1 : -1;
        swan(c, x, y, 0.8, dir); swan(c, x - dir * 34, y + 12, 0.92, dir);
        c.fillStyle = 'rgba(255,255,255,0.2)';
        GLINTS.forEach(([gy, w], i) => { const gx = 180 + (((i * 53 + t * 7) % 200) / 100 - 1) * w; c.beginPath(); c.ellipse(gx, gy, 8 + gy * 0.02, 1.3, 0, 0, TAU); c.fill(); });
      },
      dirt(c) {
        const g = ramp(['#4c6b34', '#5c7d3e', '#6f8f47', '#88a154']);
        field(c, 0, Y0 - 8, W, Y1 + 14, 2, (x, y) => { const k = 1.6 - (y - Y0) / (Y1 - Y0); return g(nz.fbm(x * 0.02 * k, y * 0.05 * k, 4)); });
        for (let i = 0; i < 2600; i++) { const y = Y0 + r() * (Y1 - Y0 + 10), t = 0.3 + ((y - Y0) / (Y1 - Y0)) * 0.8; c.fillStyle = U.pick(r, ['#9db85c', '#b4c86c', '#7f9e48', '#c6d27e']); c.beginPath(); c.ellipse(r() * W, y, 1.8 * t, 1 * t, 0, 0, TAU); c.fill(); }
        c.lineCap = 'round';
        for (let i = 0; i < 46; i++) { const x = r() * W, y = Y0 + 20 + r() * 390; c.strokeStyle = 'rgba(70,92,44,0.55)'; c.lineWidth = 2 + r() * 3; c.beginPath(); c.moveTo(x - 40, y); c.bezierCurveTo(x - 10, y + 12 * r(), x + 10, y - 12 * r(), x + 44, y + 4); c.stroke(); }
        for (let i = 0; i < 90; i++) {
          const x = r() * W, y = Y0 + 16 + r() * 400, s = 3 + ((y - Y0) / (Y1 - Y0)) * 6;
          c.save(); c.translate(x, y); c.rotate(r() * TAU); c.scale(1, 0.6); c.fillStyle = U.pick(r, ['#b8823e', '#a2622e', '#c9a04a', '#8a5a2a']);
          c.beginPath(); c.moveTo(-s, 0); c.quadraticCurveTo(0, -s * 0.9, s, 0); c.quadraticCurveTo(0, s * 0.9, -s, 0); c.fill(); c.restore();
        }
        for (let i = 0; i < 8; i++) { const x = 30 + r() * 300, y = 200 + r() * 320, a = (r() - 0.5) * 0.8, l = 22 + r() * 34; c.strokeStyle = '#4a3a2a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x - Math.cos(a) * l, y - Math.sin(a) * l); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.moveTo(x, y); c.lineTo(x + Math.cos(a + 0.6) * l * 0.6, y + Math.sin(a + 0.6) * l * 0.6); c.stroke(); }
      },
      top(c) {
        const q = U.rng(19052);
        // the near bank, then the reeds in front of everything
        c.fillStyle = lin(c, 0, Y1, 0, bleed.y1, [[0, '#5d8a42'], [1, '#4a7436']]); c.beginPath(); c.moveTo(bleed.x0, foot(bleed.x0) + 4);
        for (let x = bleed.x0; x <= bleed.x1 + 6; x += 8) c.lineTo(x, foot(x) + 4);
        c.lineTo(bleed.x1 + 6, bleed.y1); c.lineTo(bleed.x0, bleed.y1); c.closePath(); c.fill();
        for (let x = bleed.x0; x < bleed.x1; x += 3.4) {
          const d = Math.abs(x - 180) / 180, h = 18 + d * d * 110 + q() * 34;
          reed(c, q, x + q() * 3, foot(x) + 22 + q() * 34, h, q() < 0.12 + d * 0.1);
        }
      },
    };
  }

  // ---------------------------------------------- WISTERIA MANOR: THE FOUNTAIN
  // The fountain in the middle of the turning circle: a wide round basin of pale
  // stone, a shell of a bowl on a pedestal and a small one above it, and a stone
  // pineapple on the very top. The water has gone green and the bowl full of leaves.
  // pond { what: 'fountain', where: 'manor' }
  function manorFountain(S) {
    const { r, nz, bleed } = S;
    const cx = 180, cy = 356, RX = 168, RY = 116, FACE = 30, PX = 146, PY = 96, PCY = cy + 4;
    const BOWL = { y: 226, rx: 72, ry: 17 }, SMALL = { y: 140, rx: 36, ry: 9 }, FOOT = cy + 16;
    const region = new Path2D();
    region.moveTo(cx + PX, PCY); region.ellipse(cx, PCY, PX, PY, 0, 0, TAU); region.closePath();
    // the pedestal stands in the water, so that part is left out
    region.moveTo(cx - 22, 270); region.lineTo(cx + 22, 270); region.lineTo(cx + 22, FOOT - 12); region.lineTo(cx + 42, FOOT); region.ellipse(cx, FOOT, 42, 20, 0, 0, Math.PI); region.lineTo(cx - 22, FOOT - 12); region.closePath();
    const SPILL = [0.1, 0.62, 1.1, 1.57, 2.04, 2.52, 3.04].map((a, i) => ({ a, ph: i * 0.37, x0: cx + Math.cos(a) * BOWL.rx, y0: BOWL.y + Math.sin(a) * BOWL.ry, x1: cx + Math.cos(a) * (BOWL.rx + 14), y1: FOOT - 18 + Math.sin(a) * 34 }));
    const rimPath = new Path2D(); rimPath.ellipse(cx, cy + FACE, RX, RY, 0, 0, TAU);
    function bowl(c, b, drop) {
      const { y, rx, ry } = b;
      c.fillStyle = lin(c, cx - rx, 0, cx + rx, 0, [[0, STONE_LT], [0.45, STONE], [1, STONE_DK]]);
      c.beginPath(); c.moveTo(cx - rx, y); c.quadraticCurveTo(cx - rx * 0.76, y + drop, cx - 12, y + drop + 4); c.lineTo(cx + 12, y + drop + 4); c.quadraticCurveTo(cx + rx * 0.76, y + drop, cx + rx, y); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(100,90,74,0.32)'; c.lineWidth = 1.2;
      for (let k = -4; k <= 4; k++) { c.beginPath(); c.moveTo(cx + (k / 4) * rx * 0.94, y + ry * 0.4); c.quadraticCurveTo(cx + (k / 4) * rx * 0.7, y + drop * 0.7, cx + (k / 4) * 10, y + drop); c.stroke(); }
      c.fillStyle = STONE_LT; c.beginPath(); c.ellipse(cx, y, rx, ry, 0, 0, TAU); c.fill();
      c.fillStyle = STONE_DK; c.beginPath(); c.ellipse(cx, y + 1, rx - 4, ry - 3, 0, 0, TAU); c.fill();
    }
    return {
      family: 'skim', particle: 'water', region, depth: true,
      tough: (x, y) => (nz.n2(x * 0.03, y * 0.03) > 0.7 ? 1.5 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed, q = U.rng(1904), g = ramp(['#cdbf9f', '#d8cbad', '#e2d7bc']);
        field(c, x0, 90, x1, y1, 3, (x, y) => g(nz.fbm(x * 0.03, y * 0.05, 3)));
        for (let i = 0; i < 2400; i++) dot(c, x0 + q() * (x1 - x0), 90 + q() * (y1 - 90), 0.5 + q(), U.pick(q, ['#b5a585', '#efe6d0', '#a8977a', '#c9b995']));
        // the clipped yew hedge behind, and the sky over it
        c.fillStyle = lin(c, 0, y0, 0, 60, [[0, '#a4cde6'], [1, '#e4eee8']]); c.fillRect(x0, y0, x1 - x0, 64);
        c.fillStyle = lin(c, 0, 44, 0, 104, [[0, '#4a7a3e'], [1, '#2c5428']]); c.fillRect(x0, 44, x1 - x0, 60);
        for (let i = 0; i < 900; i++) dot(c, x0 + q() * (x1 - x0), 44 + q() * 60, 0.9 + q() * 0.8, U.pick(q, ['#5d9648', '#3a6a32', '#6fa850']));
        c.fillStyle = 'rgba(40,40,20,0.3)'; c.fillRect(x0, 104, x1 - x0, 7);
        softShadow(c, rimPath, 14, 0.36, 0, 6);
        // the basin: its stone face, then the broad rim
        c.fillStyle = lin(c, cx - RX, 0, cx + RX, 0, [[0, '#c8bfaa'], [0.4, STONE_LT], [1, STONE_DK]]);
        c.beginPath(); c.moveTo(cx - RX, cy); c.lineTo(cx - RX, cy + FACE); c.ellipse(cx, cy + FACE, RX, RY, 0, Math.PI, 0, true); c.lineTo(cx + RX, cy); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(90,80,66,0.34)'; c.lineWidth = 1.2;
        for (let k = 1; k < 16; k++) { const a = (k / 16) * Math.PI, x = cx + Math.cos(a) * RX, y = cy + Math.sin(a) * RY; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + FACE); c.stroke(); }
        c.fillStyle = lin(c, 0, cy - RY, 0, cy + RY, [[0, '#d3cab6'], [1, STONE_LT]]); c.beginPath(); c.ellipse(cx, cy, RX, RY, 0, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(90,80,66,0.3)';
        for (let k = 0; k < 28; k++) { const a = (k / 28) * TAU; c.beginPath(); c.moveTo(cx + Math.cos(a) * (PX + 4), PCY + Math.sin(a) * (PY + 4)); c.lineTo(cx + Math.cos(a) * RX, cy + Math.sin(a) * RY); c.stroke(); }
        c.fillStyle = '#5a564a'; c.beginPath(); c.ellipse(cx, PCY, PX + 3, PY + 3, 0, 0, TAU); c.fill();
      },
      clean(c) {
        const q = U.rng(19041), g = c.createRadialGradient(cx, PCY, 30, cx, PCY, PX + 10);
        g.addColorStop(0, '#b4e0e4'); g.addColorStop(0.7, '#86c6d0'); g.addColorStop(1, '#5da4b4');
        c.fillStyle = g; c.fillRect(0, 240, W, 240);
        // the pale stones of the floor, seen through the water, and some wished-on coins
        c.strokeStyle = 'rgba(255,255,255,0.24)'; c.lineWidth = 1.2;
        for (const k of [0.45, 0.7, 0.9]) { c.beginPath(); c.ellipse(cx, PCY, PX * k, PY * k, 0, 0, TAU); c.stroke(); }
        for (let i = 0; i < 18; i++) { const a = q() * TAU, d = 0.3 + q() * 0.6, x = cx + Math.cos(a) * PX * d, y = PCY + Math.sin(a) * PY * d; dot(c, x, y, 2.2, GOLD_DK); dot(c, x - 0.4, y - 0.4, 1.7, GOLD); dot(c, x - 0.8, y - 0.8, 0.6, GOLD_LT); }
        c.fillStyle = 'rgba(40,90,110,0.18)'; c.beginPath(); c.ellipse(cx + 8, PCY + 16, 92, 34, 0, 0, TAU); c.fill();
      },
      live(c, t) {
        for (const s of SPILL) for (const off of [0, 0.5]) {
          const k = (t * 0.6 + s.ph + off) % 1, rad = 4 + k * 20;
          c.strokeStyle = `rgba(255,255,255,${(0.42 * (1 - k)).toFixed(3)})`; c.lineWidth = 1.2;
          c.beginPath(); c.ellipse(s.x1, s.y1, rad, rad * 0.42, 0, 0, TAU); c.stroke();
        }
        c.fillStyle = 'rgba(255,255,255,0.2)';
        for (let i = 0; i < 6; i++) { const gx = 96 + ((i * 53 + t * 9) % 168), gy = 300 + ((i * 67) % 130); c.beginPath(); c.ellipse(gx, gy, 9, 1.4, 0, 0, TAU); c.fill(); }
      },
      dirt(c) {
        const g = ramp(['#4d6236', '#5e7640', '#708a48', '#859c56']);
        field(c, 0, 250, W, 470, 2, (x, y) => g(nz.fbm(x * 0.03, y * 0.05, 4)));
        for (let i = 0; i < 1100; i++) dot(c, r() * W, 256 + r() * 210, 0.7 + r() * 1.2, U.pick(r, ['#9db85c', '#b4c86c', '#7f9e48']));
        c.strokeStyle = 'rgba(40,52,28,0.5)'; c.lineWidth = 9; c.beginPath(); c.ellipse(cx, PCY, PX - 3, PY - 3, 0, 0, TAU); c.stroke();
        for (let i = 0; i < 70; i++) {
          const a = r() * TAU, d = 0.25 + r() * 0.75, x = cx + Math.cos(a) * PX * d, y = PCY + Math.sin(a) * PY * d, s = 4 + r() * 5;
          c.save(); c.translate(x, y); c.rotate(r() * TAU); c.scale(1, 0.62); c.fillStyle = U.pick(r, ['#b8823e', '#a2622e', '#c9a04a', '#8a5a2a']);
          c.beginPath(); c.moveTo(-s, 0); c.quadraticCurveTo(0, -s * 0.9, s, 0); c.quadraticCurveTo(0, s * 0.9, -s, 0); c.fill(); c.restore();
        }
        for (let i = 0; i < 26; i++) { const a = r() * TAU, x = cx + Math.cos(a) * PX * 0.88, y = PCY + Math.sin(a) * PY * 0.88; dot(c, x, y, 2 + r() * 3, 'rgba(236,234,214,0.5)'); }
      },
      top(c) {
        // the pedestal rising out of the water, its bowls and the pineapple on top
        c.fillStyle = 'rgba(30,50,50,0.3)'; c.beginPath(); c.ellipse(cx + 3, FOOT + 5, 46, 21, 0, 0, TAU); c.fill();
        c.fillStyle = lin(c, cx - 42, 0, cx + 42, 0, [[0, STONE_LT], [1, STONE_DK]]); c.beginPath(); c.moveTo(cx - 42, FOOT); c.ellipse(cx, FOOT, 42, 20, 0, Math.PI, 0, true); c.lineTo(cx + 42, FOOT); c.quadraticCurveTo(cx + 24, FOOT - 12, cx + 20, BOWL.y + 40); c.lineTo(cx - 20, BOWL.y + 40); c.quadraticCurveTo(cx - 24, FOOT - 12, cx - 42, FOOT); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(100,90,74,0.3)'; c.lineWidth = 1.2; for (const x of [-11, 0, 11]) { c.beginPath(); c.moveTo(cx + x, BOWL.y + 50); c.lineTo(cx + x * 1.3, FOOT + 8); c.stroke(); }
        bowl(c, BOWL, 40);
        c.fillStyle = '#a4d6dc'; c.beginPath(); c.ellipse(cx, BOWL.y + 1, BOWL.rx - 6, BOWL.ry - 5, 0, 0, TAU); c.fill();
        c.fillStyle = lin(c, cx - 11, 0, cx + 11, 0, [[0, STONE_LT], [1, STONE_DK]]); c.beginPath(); c.moveTo(cx - 8, SMALL.y + 26); c.lineTo(cx + 8, SMALL.y + 26); c.lineTo(cx + 15, BOWL.y + 2); c.lineTo(cx - 15, BOWL.y + 2); c.closePath(); c.fill();
        bowl(c, SMALL, 22);
        c.fillStyle = '#a4d6dc'; c.beginPath(); c.ellipse(cx, SMALL.y + 1, SMALL.rx - 5, SMALL.ry - 3.6, 0, 0, TAU); c.fill();
        const fy = SMALL.y - 10;
        c.fillStyle = STONE_DK; c.fillRect(cx - 6, fy + 2, 12, 7);
        c.fillStyle = lin(c, cx - 11, 0, cx + 11, 0, [[0, STONE_LT], [1, STONE_DK]]); c.beginPath(); c.ellipse(cx, fy - 8, 10, 13, 0, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(100,90,74,0.5)'; c.lineWidth = 0.8; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(cx + k * 5 - 8, fy - 18); c.lineTo(cx + k * 5 + 8, fy + 2); c.moveTo(cx + k * 5 + 8, fy - 18); c.lineTo(cx + k * 5 - 8, fy + 2); c.stroke(); }
        c.fillStyle = '#b4ab96'; for (const a of [-0.6, 0, 0.6]) { c.save(); c.translate(cx, fy - 20); c.rotate(a); c.beginPath(); c.ellipse(0, -5, 2.6, 7, 0, 0, TAU); c.fill(); c.restore(); }
      },
      liveTop(c, t) {
        c.save(); c.lineCap = 'round';
        const spill = (x0, y0, x1, y1, ph) => {
          const path = new Path2D(); path.moveTo(x0, y0); path.quadraticCurveTo(x1, y0 + 6, x1, y1);
          c.strokeStyle = 'rgba(200,232,240,0.5)'; c.lineWidth = 2.2; c.stroke(path);
          c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 1; c.setLineDash([3, 9]); c.lineDashOffset = -t * 40 - ph * 12; c.stroke(path); c.setLineDash([]);
        };
        for (const s of SPILL) spill(s.x0, s.y0, s.x1, s.y1, s.ph * 3);
        for (const a of [0.2, 1.1, 2, 2.9]) spill(cx + Math.cos(a) * SMALL.rx, SMALL.y + Math.sin(a) * SMALL.ry, cx + Math.cos(a) * (SMALL.rx + 6), BOWL.y + Math.sin(a) * 6, a);
        c.restore();
      },
    };
  }

  // -------------------------------------------- WISTERIA MANOR: THE CHANDELIER
  // The great chandelier of the ballroom, seen from the top of a ladder: ring on
  // ring of glass drops, widest at the candles, narrowing to one big prism at the
  // bottom. Years of dust and cobweb have turned the glass grey. Washed, every drop
  // catches the light again, and the candles are lit.
  // lantern { where: 'manor' }
  function chandelier(S) {
    const { r, nz, bleed } = S;
    const cx = 180, TOPY = 92, BOT = 520, RINGS = [136, 172, 208, 244, 280, 316, 352, 388, 424, 460];
    const WID = [[TOPY, 44], [136, 76], [172, 108], [208, 132], [244, 148], [290, 156], [352, 146], [388, 124], [424, 94], [460, 62], [BOT, 4]];
    const halfWidth = (y) => { for (let i = 1; i < WID.length; i++) if (y <= WID[i][0]) return U.lerp(WID[i - 1][1], WID[i][1], (y - WID[i - 1][0]) / (WID[i][0] - WID[i - 1][0])); return 4; };
    const region = new Path2D();
    region.moveTo(cx - WID[0][1], TOPY);
    for (let i = 1; i < WID.length; i++) region.lineTo(cx - WID[i][1], WID[i][0]);
    for (let i = WID.length - 1; i >= 0; i--) region.lineTo(cx + WID[i][1], WID[i][0]);
    region.closePath();
    const CANDLES = [];
    for (let k = 0; k < 9; k++) { const a = Math.PI * 0.04 + (k / 8) * Math.PI * 0.92; CANDLES.push([cx + Math.cos(a) * 128, 256 + Math.sin(a) * 26]); }
    for (let k = 0; k < 5; k++) { const a = Math.PI * 0.08 + (k / 4) * Math.PI * 0.84; CANDLES.push([cx + Math.cos(a) * 72, 164 + Math.sin(a) * 14]); }
    const twinkle = [];
    { const q = U.rng(19102); for (let i = 0; i < 26; i++) { const y = 120 + q() * 360, w = halfWidth(y) - 8; twinkle.push([cx + (q() * 2 - 1) * w, y, q() * TAU, 3 + q() * 5]); } }
    const ceiling = (c, x0, y0, x1, y1) => {
      c.fillStyle = lin(c, 0, y0, 0, y1, [[0, '#5b4254'], [0.5, '#6e4e60'], [1, '#4f3a4c']]); c.fillRect(x0, y0, x1 - x0, y1 - y0);
      c.strokeStyle = 'rgba(216,174,78,0.4)'; c.lineWidth = 1.6;
      for (const [rx, ry] of [[250, 300], [205, 256]]) { c.beginPath(); c.ellipse(cx, 300, rx, ry, 0, 0, TAU); c.stroke(); }
      for (let k = 0; k < 24; k++) { const a = (k / 24) * TAU; c.beginPath(); c.moveTo(cx + Math.cos(a) * 205, 300 + Math.sin(a) * 256); c.lineTo(cx + Math.cos(a) * 250, 300 + Math.sin(a) * 300); c.stroke(); }
    };
    // a cut glass drop, hanging from x, y
    function drop(c, x, y, s, q, dull) {
      c.fillStyle = dull ? U.pick(q, ['#8f8a7c', '#9c9686', '#857f72']) : U.pick(q, ['#eaf6fb', '#d6ecf6', '#fdf6e3', '#f4e3ee']);
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + s * 0.62, y + s * 1.1); c.lineTo(x, y + s * 2); c.lineTo(x - s * 0.62, y + s * 1.1); c.closePath(); c.fill();
      c.fillStyle = dull ? 'rgba(60,54,46,0.35)' : U.pick(q, ['rgba(120,180,220,0.6)', 'rgba(232,140,190,0.45)', 'rgba(240,200,110,0.55)']);
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + s * 0.62, y + s * 1.1); c.lineTo(x, y + s * 2); c.closePath(); c.fill();
      if (!dull) { c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(x - s * 0.3, y + s * 1); c.lineTo(x, y + s * 0.5); c.lineTo(x, y + s * 1.2); c.closePath(); c.fill(); }
    }
    function glass(c, dull) {
      const q = U.rng(1910);
      RINGS.forEach((ry, j) => {
        const w = halfWidth(ry + 18) - 6, n = Math.max(3, Math.round(w / 10));
        for (let i = -n; i <= n; i++) {
          const t = i / n, x = cx + Math.sin(t * Math.PI / 2) * w, y = ry + (1 - t * t) * 16, nx = cx + Math.sin(((i + 1) / n) * Math.PI / 2) * w, ny = ry + (1 - ((i + 1) / n) ** 2) * 16;
          // the swag of little beads across to the next drop, then the drop
          if (i < n) for (let k = 0; k < 4; k++) { const u = (k + 0.5) / 4; dot(c, U.lerp(x, nx, u), U.lerp(y, ny, u) + Math.sin(u * Math.PI) * 5, 1.5, dull ? '#a69f90' : '#f4fbff'); }
          if (i % 2 === 0 && j < RINGS.length - 1) for (let k = 0; k < 5; k++) dot(c, x, y + 19 + k * 4.4, 1.3, dull ? '#a69f90' : '#e8f4fb');
          drop(c, x, y + 3, 7 + (j % 3) * 0.8 + q() * 1.4, q, dull);
        }
      });
      drop(c, cx, 478, 20, q, dull);
    }
    return {
      family: 'wash', particle: 'suds', region,
      tough(x, y) { return y > 240 && y < 300 ? 1.4 : nz.n2(x * 0.03, y * 0.03) > 0.66 ? 1.35 : 1; },
      decor(c) {
        ceiling(c, bleed.x0, bleed.y0, bleed.x1, bleed.y1);
        // the plaster rose the whole thing hangs from
        const q = U.rng(19101);
        for (let k = 0; k < 16; k++) { const a = (k / 16) * TAU; dot(c, cx + Math.cos(a) * 40, 12 + Math.sin(a) * 15, 9, STONE_LT); dot(c, cx + Math.cos(a) * 40 + 1, 13 + Math.sin(a) * 15, 5, '#c7bda6'); }
        dot(c, cx, 12, 32, '#efe8d8'); dot(c, cx, 12, 24, GOLD); dot(c, cx, 12, 19, GOLD_LT);
        glow(c, cx, 300, 230, 'rgba(255,226,160,0.5)');
        for (let i = 0; i < 26; i++) dot(c, q() * W, q() * 90 + 4, 0.8, 'rgba(255,240,200,0.4)');
      },
      clean(c) {
        ceiling(c, 0, 0, W, H);
        glow(c, cx, 300, 230, 'rgba(255,226,160,0.5)');
        glass(c, false);
      },
      cleanOver(c) {
        for (const [x, y] of CANDLES) { glow(c, x, y - 28, 26, 'rgba(255,214,140,0.8)'); c.fillStyle = '#ffd98e'; c.beginPath(); c.moveTo(x - 3, y - 24); c.quadraticCurveTo(x, y - 37, x + 3, y - 24); c.quadraticCurveTo(x, y - 20, x - 3, y - 24); c.fill(); dot(c, x, y - 26, 1.3, '#ffffff'); }
      },
      live(c, t) {
        for (const [x, y, ph, s] of twinkle) {
          const a = Math.pow(Math.max(0, Math.sin(t * 0.9 + ph)), 6);
          if (a < 0.04) continue;
          c.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
          c.beginPath(); c.moveTo(x, y - s); c.quadraticCurveTo(x, y, x + s, y); c.quadraticCurveTo(x, y, x, y + s); c.quadraticCurveTo(x, y, x - s, y); c.quadraticCurveTo(x, y, x, y - s); c.fill();
        }
      },
      dirt(c) {
        ceiling(c, 0, 0, W, H);
        glass(c, true);
        const g = ramp(['#8d8678', '#9d9688', '#ada698', '#bdb6a8']);
        field(c, 0, TOPY - 4, W, BOT + 4, 2, (x, y) => { const v = nz.fbm(x * 0.03, y * 0.03, 4); return [...g(v), 120 + v * 90]; });
        grime(c, r, 30, 200, 330, 460, 18);
        cobweb(c, cx - 96, 150, 1.4, 90); cobweb(c, cx + 120, 214, 1.9, 110); cobweb(c, cx - 60, 300, 0.2, 90); cobweb(c, cx + 34, 390, 2.2, 66);
        // threads of web from ring to ring, heavy with dust
        for (let i = 0; i < 22; i++) { const y = 140 + r() * 320, w = halfWidth(y) - 6, x = cx + (r() * 2 - 1) * w; c.strokeStyle = 'rgba(232,228,218,0.5)'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 8, y + 26, x + (r() - 0.5) * 40, y + 40 + r() * 30); c.stroke(); }
      },
      top(c) {
        const gilt = (x0, x1) => lin(c, x0, 0, x1, 0, [[0, GOLD_DK], [0.45, GOLD_LT], [1, GOLD_DK]]);
        // the chain and the crown
        for (let y = 36, k = 0; y < TOPY - 4; y += 9, k++) { c.strokeStyle = k % 2 ? GOLD_DK : GOLD; c.lineWidth = 2.6; c.beginPath(); c.ellipse(cx, y, k % 2 ? 1.6 : 4, 6, 0, 0, TAU); c.stroke(); }
        c.fillStyle = gilt(cx - 50, cx + 50); c.beginPath(); c.moveTo(cx - 48, TOPY + 10); c.quadraticCurveTo(cx - 30, TOPY - 8, cx - 8, TOPY - 12); c.lineTo(cx + 8, TOPY - 12); c.quadraticCurveTo(cx + 30, TOPY - 8, cx + 48, TOPY + 10); c.closePath(); c.fill();
        c.strokeStyle = GOLD; c.lineWidth = 4; c.beginPath(); c.moveTo(cx - 48, TOPY + 9); c.lineTo(cx + 48, TOPY + 9); c.stroke();
        // two gilt hoops, front half only, and the candles on them
        for (const [y, rx, ry] of [[256, 128, 26], [164, 72, 14]]) {
          c.strokeStyle = 'rgba(40,24,10,0.35)'; c.lineWidth = 7; c.beginPath(); c.ellipse(cx, y + 3, rx, ry, 0, 0, Math.PI); c.stroke();
          c.strokeStyle = GOLD_DK; c.lineWidth = 6; c.beginPath(); c.ellipse(cx, y, rx, ry, 0, 0, Math.PI); c.stroke();
          c.strokeStyle = GOLD_LT; c.lineWidth = 2; c.beginPath(); c.ellipse(cx, y - 1, rx, ry, 0, 0, Math.PI); c.stroke();
        }
        for (const [x, y] of CANDLES) {
          c.fillStyle = GOLD; c.beginPath(); c.ellipse(x, y - 1, 8, 2.8, 0, 0, TAU); c.fill(); c.fillStyle = GOLD_DK; c.fillRect(x - 3, y - 2, 6, 5);
          c.fillStyle = lin(c, x - 3, 0, x + 3, 0, [[0, '#fbf6e8'], [1, '#d9cfb8']]); c.fillRect(x - 2.6, y - 22, 5.2, 21);
          c.strokeStyle = '#3a2a1a'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x, y - 22); c.lineTo(x, y - 24.5); c.stroke();
        }
      },
    };
  }

  // ------------------------------------------ WISTERIA MANOR: THE BALLROOM FLOOR
  // The floor from the end of the room: squares of oak laid on the diagonal inside
  // a dark walnut border, a compass star let into the middle, the piano in its
  // corner under a dust sheet of shadow. Dust lies thick, with all that the last ball
  // left behind: feathers, paper, a single glove and a ribbon.
  // cafeFloor { where: 'ballroom' }
  function ballroomFloor(S) {
    const { r, nz, bleed } = S;
    const top = 92, bot = 584, CX = 180, CY = 340;
    const piano = new Path2D();
    piano.moveTo(242, 116); piano.lineTo(342, 116); piano.lineTo(342, 268); piano.bezierCurveTo(330, 290, 292, 262, 288, 228); piano.bezierCurveTo(284, 196, 246, 196, 242, 168); piano.closePath();
    const region = new Path2D();
    region.rect(0, top, W, bot - top);
    region.addPath(piano);
    function floor(c, x0, x1, dull) {
      const q = U.rng(1909), s = 54, col = (v) => (dull ? U.mix(v, '#8f8778', 0.6) : v);
      c.save(); c.beginPath(); c.rect(x0, top, x1 - x0, bot - top); c.clip();
      c.fillStyle = col('#6a4226'); c.fillRect(x0, top, x1 - x0, bot - top);
      c.save(); c.translate(CX, CY); c.rotate(Math.PI / 4);
      for (let i = -9; i <= 9; i++) for (let j = -9; j <= 9; j++) {
        const x = i * s - s / 2, y = j * s - s / 2, across = (i + j) & 1, n = 5, w = s / n;
        for (let k = 0; k < n; k++) {
          c.fillStyle = col(U.shade(U.pick(q, ['#b98a52', '#c4955c', '#ad7f4a', '#cf9f66', '#b58550']), (q() - 0.5) * 0.12));
          if (across) c.fillRect(x + 0.5, y + k * w + 0.4, s - 1, w - 0.8); else c.fillRect(x + k * w + 0.4, y + 0.5, w - 0.8, s - 1);
          c.fillStyle = 'rgba(70,40,20,0.14)';
          if (across) c.fillRect(x + 6 + q() * 20, y + k * w + 2 + q() * 5, 20, 0.8); else c.fillRect(x + k * w + 2 + q() * 5, y + 6 + q() * 20, 0.8, 20);
        }
      }
      c.restore();
      // the walnut border with a thin line of holly
      c.strokeStyle = col('#4f2e1a'); c.lineWidth = 20; c.strokeRect(10, top + 10, W - 20, bot - top - 20);
      c.strokeStyle = col('#ecdcb8'); c.lineWidth = 2; c.strokeRect(24, top + 24, W - 48, bot - top - 48);
      // the compass star, in walnut, holly and a little brass
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * TAU, big = k % 2 === 0, l = big ? 96 : 56, sideA = a + (big ? 0.2 : 0.3), sideB = a - (big ? 0.2 : 0.3), m = 22;
        c.fillStyle = col(k % 4 === 0 ? '#ecdcb8' : big ? '#4f2e1a' : '#8a5a34');
        c.beginPath(); c.moveTo(CX, CY); c.lineTo(CX + Math.cos(sideA) * m, CY + Math.sin(sideA) * m); c.lineTo(CX + Math.cos(a) * l, CY + Math.sin(a) * l); c.lineTo(CX + Math.cos(sideB) * m, CY + Math.sin(sideB) * m); c.closePath(); c.fill();
      }
      c.strokeStyle = col(GOLD); c.lineWidth = 2.6; c.beginPath(); c.arc(CX, CY, 104, 0, TAU); c.stroke();
      c.strokeStyle = col('#4f2e1a'); c.lineWidth = 1.2; c.beginPath(); c.arc(CX, CY, 110, 0, TAU); c.stroke();
      dot(c, CX, CY, 9, col(GOLD)); dot(c, CX, CY, 5, col('#4f2e1a'));
      c.restore();
    }
    function glove(c, x, y, a) {
      c.save(); c.translate(x, y); c.rotate(a);
      c.fillStyle = 'rgba(40,28,18,0.25)'; c.fillRect(-14, -5, 42, 13);
      c.fillStyle = '#f2ebda'; c.beginPath(); c.roundRect(-4, -6, 36, 12, 4); c.fill();
      c.beginPath(); c.moveTo(-3, -6); c.lineTo(-14, -8); c.lineTo(-22, -6); c.lineTo(-14, -3); c.lineTo(-24, -1); c.lineTo(-14, 1); c.lineTo(-22, 4); c.lineTo(-13, 5); c.lineTo(-3, 6); c.closePath(); c.fill();
      c.restore();
    }
    function feather(c, x, y, a, s) {
      c.save(); c.translate(x, y); c.rotate(a);
      c.fillStyle = 'rgba(248,244,232,0.85)'; c.beginPath(); c.moveTo(-s, 0); c.quadraticCurveTo(0, -s * 0.5, s, 0); c.quadraticCurveTo(0, s * 0.42, -s, 0); c.fill();
      c.strokeStyle = 'rgba(150,140,120,0.7)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(-s * 1.3, 0); c.lineTo(s, 0); c.stroke();
      c.restore();
    }
    return {
      family: 'dust', particle: 'dust', region, indoor: true,
      tough: (x, y) => (x < 22 || x > 338 || y < top + 20 || y > bot - 20 ? 1.35 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        floor(c, x0, x1, false);
        // the end wall: rose silk, gilt mirrors between white pilasters
        c.fillStyle = lin(c, 0, y0, 0, top, [[0, '#c79f92'], [1, '#e6c3b2']]); c.fillRect(x0, y0, x1 - x0, top - y0);
        for (const x of [36, 142, 248]) {
          c.fillStyle = GOLD_DK; c.beginPath(); c.moveTo(x - 4, top - 10); c.lineTo(x - 4, 34); c.arc(x + 38, 34, 42, Math.PI, 0); c.lineTo(x + 80, top - 10); c.closePath(); c.fill();
          c.fillStyle = lin(c, 0, 0, 0, top, [[0, '#93a9b0'], [1, '#d7d6cc']]); c.beginPath(); c.moveTo(x, top - 12); c.lineTo(x, 34); c.arc(x + 38, 34, 38, Math.PI, 0); c.lineTo(x + 76, top - 12); c.closePath(); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.moveTo(x + 12, top - 12); c.lineTo(x + 30, 10); c.lineTo(x + 42, 10); c.lineTo(x + 24, top - 12); c.closePath(); c.fill();
        }
        for (const x of [12, 124, 230, 336]) { c.fillStyle = '#f4efe2'; c.fillRect(x, y0, 14, top - y0); c.fillStyle = 'rgba(150,130,110,0.34)'; c.fillRect(x + 11, y0, 3, top - y0); }
        c.fillStyle = '#efe8d8'; c.fillRect(x0, top - 8, x1 - x0, 8); c.fillStyle = GOLD; c.fillRect(x0, top - 9, x1 - x0, 1.6);
        // the threshold at the near end, down to the hall
        c.fillStyle = GOLD; c.fillRect(x0, bot, x1 - x0, 5); c.fillStyle = GOLD_LT; c.fillRect(x0, bot, x1 - x0, 1.2);
        c.fillStyle = '#3c2417'; c.fillRect(x0, bot + 5, x1 - x0, y1 - bot);
      },
      clean(c) { floor(c, 0, W, false); },
      cleanOver(c) {
        // the tall windows laid out across the wax, and the chandelier in the middle
        for (const [o, w, a] of [[-40, 56, 0.14], [64, 56, 0.12], [168, 56, 0.1]]) {
          c.fillStyle = `rgba(255,248,226,${a})`;
          c.beginPath(); c.moveTo(o, bot); c.lineTo(o + w, bot); c.lineTo(o + w + 180, top); c.lineTo(o + 180, top); c.closePath(); c.fill();
        }
        glow(c, CX, CY, 170, 'rgba(255,226,160,0.26)');
      },
      dirt(c) {
        floor(c, 0, W, true);
        const g = ramp(['#978e7e', '#a89f90', '#b9b1a3', '#c9c2b5']);
        field(c, 0, top, W, bot, 2, (x, y) => { const v = nz.fbm(x * 0.03, y * 0.03, 5); return [...g(v), 146 + v * 100]; });
        grime(c, r, 0, top, W, bot, 24);
        for (let i = 0; i < 34; i++) {
          const x = r() < 0.6 ? r() * 44 + (r() < 0.5 ? 0 : 316) : r() * W, y = top + 6 + r() * (bot - top - 12), s = 5 + r() * 9;
          for (let k = 0; k < 9; k++) { const v = 150 + r() * 40; c.fillStyle = `rgba(${v},${v - 5},${v - 12},0.7)`; c.beginPath(); c.arc(x + (r() - 0.5) * s, y + (r() - 0.5) * s * 0.7, s * 0.4, 0, TAU); c.fill(); }
        }
        // what the last ball left: paper rounds, feathers, a ribbon and a glove
        for (let i = 0; i < 90; i++) dot(c, 18 + r() * 324, top + 14 + r() * 464, 1.6 + r() * 1.6, U.pick(r, ['rgba(232,183,196,0.8)', 'rgba(216,174,78,0.8)', 'rgba(188,208,228,0.8)', 'rgba(255,255,255,0.75)']));
        for (let i = 0; i < 22; i++) feather(c, 20 + r() * 320, top + 16 + r() * 460, r() * TAU, 8 + r() * 7);
        c.strokeStyle = 'rgba(160,70,90,0.8)'; c.lineWidth = 3.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(66, 500); c.bezierCurveTo(110, 460, 96, 540, 150, 508); c.bezierCurveTo(170, 496, 176, 520, 192, 512); c.stroke();
        glove(c, 256, 474, 0.5);
        // slow footprints of a waltz across the dust
        c.fillStyle = 'rgba(95,78,60,0.26)';
        for (let i = 0; i < 26; i++) { const a = i * 0.62, d = 40 + i * 4.2, x = CX + Math.cos(a) * d, y = CY + Math.sin(a) * d * 1.3; c.save(); c.translate(x, y); c.rotate(a + 1.4); c.beginPath(); c.ellipse(0, 0, 4.4, 8, 0, 0, TAU); c.fill(); c.restore(); }
        cobweb(c, 0, top, 0, 70);
      },
      top(c) {
        c.fillStyle = lin(c, 0, top, 0, top + 22, [[0, 'rgba(20,14,26,0.34)'], [1, 'rgba(20,14,26,0)']]); c.fillRect(bleed.x0, top, bleed.x1 - bleed.x0, 22);
        // the grand piano, seen from above, with the keyboard towards the wall
        c.save(); c.translate(5, 8); c.fillStyle = 'rgba(30,20,20,0.32)'; c.fill(piano); c.restore();
        c.fillStyle = lin(c, 240, 110, 344, 290, [[0, '#3a3236'], [0.4, '#17141a'], [1, '#26222a']]); c.fill(piano);
        c.strokeStyle = 'rgba(255,255,255,0.22)'; c.lineWidth = 1.4; c.stroke(piano);
        c.fillStyle = '#f8f4e8'; c.fillRect(250, 118, 90, 12);
        c.fillStyle = '#14121a'; for (let x = 252; x < 338; x += 6) if ((x - 252) % 42 !== 12) c.fillRect(x, 118, 3, 7);
        c.fillStyle = 'rgba(255,255,255,0.14)'; c.beginPath(); c.moveTo(306, 142); c.lineTo(330, 142); c.lineTo(316, 240); c.lineTo(300, 214); c.closePath(); c.fill();
        // gilt chairs waiting along the wall
        for (let y = 170; y < 540; y += 94) {
          dot(c, 16, y + 2, 14, 'rgba(30,20,20,0.3)');
          c.fillStyle = GOLD; c.beginPath(); c.roundRect(-1, y - 14, 25, 28, 6); c.fill();
          c.fillStyle = '#b4475a'; c.beginPath(); c.roundRect(3, y - 11, 18, 22, 5); c.fill();
          c.fillStyle = GOLD_DK; c.fillRect(-1, y - 14, 5, 28);
        }
      },
    };
  }

  // ---------------------------------------------- WISTERIA MANOR: THE IRON GATE
  // The carriage gates at the end of the drive, two leaves of wrought iron under one
  // swept top rail, hung between stone pillars with the house far off through the
  // bars. Rust has had the iron for years. It takes the player's colour; the gilded
  // spear tips and the lock stay above the paint.
  // fence { what: 'iron' }
  function ironGate(S) {
    const { r, nz, bleed } = S;
    const L = 60, R = 300, CX = 180, GAP = 3, RAIL = 13, MID = 318, LOW = 470, FOOT = 524;
    const archY = (x) => 112 + 62 * ((x - CX) / 120) ** 2;
    const region = new Path2D();
    const UP = [];
    // every part wound the same way, so that overlaps stay filled
    const curveBar = (p, a, b, h) => { p.moveTo(a, archY(a)); for (let x = a; x <= b; x += 6) p.lineTo(x, archY(x)); p.lineTo(b, archY(b)); p.lineTo(b, archY(b) + h); for (let x = b; x >= a; x -= 6) p.lineTo(x, archY(x) + h); p.lineTo(a, archY(a) + h); p.closePath(); };
    const ring = (p, x, y, r1, r0) => { p.moveTo(x + r1, y); p.arc(x, y, r1, 0, TAU); p.moveTo(x + r0, y); p.arc(x, y, r0, 0, TAU, true); p.closePath(); };
    for (const [a, b] of [[L, CX - GAP], [CX + GAP, R]]) {
      curveBar(region, a, b, RAIL);
      for (const y of [MID, LOW]) region.rect(a, y, b - a, RAIL);
      region.rect(a, FOOT - 12, b - a, 12);
      region.rect(a, archY(a), 14, FOOT - archY(a)); region.rect(b - 14, archY(b), 14, FOOT - archY(b));
      for (let x = a + 34, k = 0; x < b - 20; x += 25, k++) { UP.push(x); region.rect(x - 5, archY(x) - 3, 10, FOOT - archY(x)); }
      // a row of rings under the middle rail, and a big ring in each leaf
      for (let x = a + 34 + 12.5; x < b - 24; x += 25) ring(region, x, MID + RAIL + 13, 13, 8);
      ring(region, (a + b) / 2, 232, 39, 30);
    }
    const ends = [L + 7, CX - GAP - 7, CX + GAP + 7, R - 7];
    function pillar(c, x) {
      c.fillStyle = 'rgba(40,30,20,0.34)'; c.fillRect(x - 24, 104, 56, 470);
      ashlar(c, U.rng(x | 0), nz, x - 26, 104, x + 26, 560);
      c.strokeStyle = STONE_DK; c.lineWidth = 1.4; c.strokeRect(x - 26, 104, 52, 456);
      c.fillStyle = lin(c, 0, 88, 0, 108, [[0, STONE_LT], [1, '#a59b87']]); c.fillRect(x - 32, 88, 64, 18);
      c.fillStyle = 'rgba(40,30,20,0.3)'; c.fillRect(x - 28, 106, 56, 5);
      const g = c.createRadialGradient(x - 10, 46, 3, x, 56, 32); g.addColorStop(0, STONE_LT); g.addColorStop(0.7, STONE); g.addColorStop(1, STONE_DK);
      dot(c, x, 58, 26, g);
      c.fillStyle = '#a59b87'; c.fillRect(x - 14, 82, 28, 7);
    }
    return {
      family: 'paint', particle: 'paint', region, fillRule: 'nonzero',
      tough: (x, y) => (y > 450 ? 1.35 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed, q = U.rng(1915);
        c.fillStyle = lin(c, 0, y0, 0, 300, [[0, '#9ccbe6'], [1, '#eaf0e4']]); c.fillRect(x0, y0, x1 - x0, 310);
        c.fillStyle = '#a9c79a'; c.fillRect(x0, 270, x1 - x0, 60);
        // the house through the bars, at the top of the avenue
        c.fillStyle = '#7f8a9a'; c.beginPath(); c.moveTo(112, 234); c.lineTo(124, 220); c.lineTo(236, 220); c.lineTo(248, 234); c.closePath(); c.fill();
        c.fillStyle = '#e4dcc4'; c.fillRect(112, 234, 136, 50); c.fillRect(168, 196, 24, 44);
        c.fillStyle = '#7f8a9a'; c.beginPath(); c.moveTo(165, 196); c.lineTo(180, 176); c.lineTo(195, 196); c.closePath(); c.fill();
        c.fillStyle = '#5c6a7c'; for (let x = 118; x < 244; x += 13) if (Math.abs(x - 177) > 9) c.fillRect(x, 244, 7, 22);
        c.fillStyle = '#9b7cc8'; c.fillRect(114, 278, 132, 4);
        // the lawns and the avenue of limes going away
        mowedLawn(c, nz, x0, 286, x1, y1, false);
        for (const [x, y, s, col] of [[34, 248, 56, '#467e37'], [84, 262, 40, '#4f8a3c'], [326, 248, 56, '#4f8a3c'], [276, 262, 40, '#467e37']]) shrub(c, q, x, y, s, col);
        // the drive, gravel, wide at the gate and narrow at the door
        const g = ramp(['#cdbf9f', '#d8cbad', '#e2d7bc']);
        c.save(); c.beginPath(); c.moveTo(160, 286); c.lineTo(200, 286); c.lineTo(370, 610); c.lineTo(-10, 610); c.closePath(); c.clip();
        field(c, x0, 280, x1, y1, 3, (x, y) => g(nz.fbm(x * 0.03, y * 0.05, 3)));
        for (let i = 0; i < 900; i++) dot(c, q() * W, 290 + q() * 320, 0.5 + q(), U.pick(q, ['#b5a585', '#efe6d0', '#a8977a']));
        c.restore();
        // the gate's own shadow along the gravel
        c.fillStyle = 'rgba(40,30,20,0.28)'; c.beginPath(); c.moveTo(L, FOOT); c.lineTo(R, FOOT); c.lineTo(R + 10, FOOT + 12); c.lineTo(L - 10, FOOT + 12); c.closePath(); c.fill();
        for (let x = L + 12; x < R; x += 25) { c.fillStyle = 'rgba(40,30,20,0.14)'; c.beginPath(); c.moveTo(x, FOOT + 10); c.lineTo(x + 9, FOOT + 10); c.lineTo(x + 14 + (x - CX) * 0.14, FOOT + 42); c.lineTo(x + 2 + (x - CX) * 0.14, FOOT + 42); c.closePath(); c.fill(); }
      },
      clean(c, paint) { c.fillStyle = paint; c.fillRect(0, 0, W, H); },
      cleanOver(c) {
        // a round of light down every bar and along every rail
        for (const x of UP) { c.fillStyle = 'rgba(255,255,255,0.24)'; c.fillRect(x - 3.4, 90, 2, 450); c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(x + 2, 90, 3, 450); }
        for (const x of ends) { c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(x - 5, 90, 2.4, 450); c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(x + 3, 90, 4, 450); }
        for (const y of [MID, LOW, FOOT - 12]) { c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(L, y + 1.4, R - L, 2); c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(L, y + 9, R - L, 4); }
        c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 2; c.beginPath(); for (let x = L; x <= R; x += 6) c.lineTo(x, archY(x) + 3); c.stroke();
      },
      dirt(c) {
        const g = ramp(['#5e3420', '#7a4428', '#94552e', '#ab6a3a']);
        field(c, L - 6, 90, R + 6, FOOT + 6, 1.5, (x, y) => g(nz.fbm(x * 0.09, y * 0.05, 4)));
        for (let i = 0; i < 900; i++) { const x = L + r() * (R - L), y = 100 + r() * 424; dot(c, x, y, 0.7 + r() * 1.4, U.pick(r, ['#c98a4c', '#4a2a1a', '#b5763e', '#3a2a24'])); }
        peelingPaint(c, r, L, 110, R, FOOT, 60, '#34302e');
        grime(c, r, L, 450, R, FOOT, 18);
      },
      top(c) {
        for (const x of [24, 336]) pillar(c, x);
        // gilded spear tips along the top rail
        for (const x of UP) {
          const y = archY(x) - 2;
          c.fillStyle = 'rgba(30,20,10,0.3)'; c.beginPath(); c.moveTo(x + 2, y + 2); c.lineTo(x + 9, y + 2); c.lineTo(x + 2.4, y - 25); c.closePath(); c.fill();
          c.fillStyle = lin(c, x - 6, 0, x + 6, 0, [[0, GOLD_DK], [0.45, GOLD_LT], [1, GOLD_DK]]);
          c.beginPath(); c.moveTo(x - 6.4, y + 3); c.quadraticCurveTo(x - 4, y - 8, x, y - 25); c.quadraticCurveTo(x + 4, y - 8, x + 6.4, y + 3); c.closePath(); c.fill();
          dot(c, x, y + 5, 3.4, GOLD);
        }
        // gilded rosettes in the big rings, the hinges and the lock
        for (const x of [(L + CX) / 2, (R + CX) / 2]) {
          for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU; c.fillStyle = GOLD; c.beginPath(); c.ellipse(x + Math.cos(a) * 15, 232 + Math.sin(a) * 15, 13, 4.4, a, 0, TAU); c.fill(); c.fillStyle = GOLD_LT; c.beginPath(); c.ellipse(x + Math.cos(a) * 15, 231 + Math.sin(a) * 15, 8, 1.6, a, 0, TAU); c.fill(); }
          dot(c, x, 232, 7, GOLD_DK); dot(c, x, 232, 4.4, GOLD_LT);
        }
        for (const [x, s] of [[L, -1], [R, 1]]) for (const y of [196, 486]) { c.fillStyle = IRON; c.fillRect(Math.min(x, x + s * 14), y - 4, 14, 8); dot(c, x + s * 12, y, 5, GOLD_DK); }
        c.fillStyle = 'rgba(30,20,10,0.35)'; c.fillRect(CX - 16, 356, 36, 50);
        c.fillStyle = lin(c, CX - 18, 0, CX + 18, 0, [[0, GOLD_DK], [0.5, GOLD_LT], [1, GOLD_DK]]); c.beginPath(); c.roundRect(CX - 18, 352, 36, 50, 4); c.fill();
        dot(c, CX, 372, 5, OAK_DK); c.fillStyle = OAK_DK; c.fillRect(CX - 1.8, 372, 3.6, 13);
        c.strokeStyle = IRON; c.lineWidth = 5; c.beginPath(); c.moveTo(CX, FOOT); c.lineTo(CX, FOOT + 22); c.stroke();
      },
      stamp: paintStamp,
    };
  }

  // ----------------------------------------------- WISTERIA MANOR: THE BOATHOUSE
  // The old boathouse at the end of the lake, weatherboarded and standing on its
  // legs in the water, with the rowing boat inside and the swallows' nests under
  // the eaves. The boards have gone silver and the paint hangs off in strips. It
  // takes the player's colour; the white trim, the slates and the jetty stay above.
  // hut { what: 'boathouse' }
  function boathouse(S) {
    const { r, nz, bleed } = S;
    const xL = 44, xR = 316, yE = 216, yA = 112, yB = 430, cx = 180, WY = 492;
    const D = { x0: 110, x1: 250, spring: 330, r: 70 }, PORT = { x: 180, y: 216, r: 22 }, WINS = [[77, 306], [283, 306]];
    const wall = (p) => { p.moveTo(xL, yB); p.lineTo(xL, yE); p.lineTo(cx, yA); p.lineTo(xR, yE); p.lineTo(xR, yB); p.closePath(); };
    const opening = (p) => { p.moveTo(D.x0, yB); p.lineTo(D.x0, D.spring); p.arc(cx, D.spring, D.r, Math.PI, 0); p.lineTo(D.x1, yB); p.closePath(); };
    const region = new Path2D();
    wall(region); opening(region);
    region.moveTo(PORT.x + PORT.r, PORT.y); region.arc(PORT.x, PORT.y, PORT.r, 0, TAU);
    for (const [x, y] of WINS) region.rect(x - 15, y - 32, 30, 64);
    return {
      family: 'paint', particle: 'paint', region,
      tough: (x, y) => (x < xL + 12 || x > xR - 12 || y > yB - 14 ? 1.3 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed, q = U.rng(1916);
        c.fillStyle = lin(c, 0, y0, 0, 300, [[0, '#9ccbe6'], [1, '#eef0e2']]); c.fillRect(x0, y0, x1 - x0, 320);
        for (const [x, y, w] of [[60, 50, 56], [300, 34, 46]]) { c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.ellipse(x, y, w, 9, 0, 0, TAU); c.ellipse(x - w * 0.3, y - 6, w * 0.4, 8, 0, 0, TAU); c.fill(); }
        // the far bank and its trees, then the water
        for (const [x, y, s, col] of [[6, 230, 74, '#467e37'], [70, 180, 60, '#5d9644'], [352, 226, 74, '#4f8a3c'], [296, 176, 58, '#467e37'], [24, 300, 60, '#4f8a3c'], [338, 300, 60, '#5d9644']]) shrub(c, q, x, y, s, col);
        c.fillStyle = '#7fae62'; c.fillRect(x0, 330, x1 - x0, 42);
        c.fillStyle = lin(c, 0, 366, 0, y1, [[0, '#a9d5de'], [0.4, '#62acbd'], [1, '#3f8ca0']]); c.fillRect(x0, 366, x1 - x0, y1 - 366);
        // the boathouse lying in the water, and the ripples through it
        c.fillStyle = 'rgba(70,84,90,0.34)'; c.beginPath(); c.moveTo(xL + 4, WY); c.lineTo(xR - 4, WY); c.lineTo(xR - 30, 600); c.lineTo(xL + 30, 600); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.32)'; c.lineWidth = 1.2;
        for (let i = 0; i < 60; i++) { const x = q() * W, y = 376 + q() * 224, l = 8 + q() * 26; c.beginPath(); c.moveTo(x - l, y); c.quadraticCurveTo(x, y - 1.4, x + l, y); c.stroke(); }
        // the legs it stands on, and the dark under the floor
        c.fillStyle = 'rgba(30,24,20,0.7)'; c.fillRect(xL + 4, yB, xR - xL - 8, 30);
        for (let x = xL + 6; x < xR; x += 40) { c.fillStyle = lin(c, x, 0, x + 12, 0, [[0, '#6a5240'], [1, '#3a2c22']]); c.fillRect(x, yB, 12, WY - yB + 8); c.fillStyle = 'rgba(70,92,60,0.6)'; c.fillRect(x, WY - 14, 12, 18); }
        // inside the boat door: dark, the water going in and the rowing boat
        c.fillStyle = '#231a16'; c.beginPath(); opening(c); c.fill();
        c.save(); c.beginPath(); opening(c); c.clip();
        c.fillStyle = lin(c, 0, 380, 0, yB, [[0, 'rgba(60,110,120,0)'], [1, 'rgba(90,160,170,0.8)']]); c.fillRect(D.x0, 380, D.x1 - D.x0, 60);
        for (let y = 300; y < 400; y += 18) { c.fillStyle = 'rgba(255,255,255,0.03)'; c.fillRect(D.x0, y, D.x1 - D.x0, 8); }
        c.fillStyle = 'rgba(10,8,6,0.5)'; c.beginPath(); c.ellipse(cx, 424, 62, 8, 0, 0, TAU); c.fill();
        c.fillStyle = lin(c, 0, 386, 0, 422, [[0, '#f4efe2'], [0.3, '#2f5a70'], [1, '#234658']]); c.beginPath(); c.moveTo(112, 386); c.quadraticCurveTo(180, 396, 248, 386); c.quadraticCurveTo(232, 424, 180, 424); c.quadraticCurveTo(128, 424, 112, 386); c.closePath(); c.fill();
        c.fillStyle = '#c99a5e'; c.beginPath(); c.ellipse(180, 391, 60, 4, 0, 0, TAU); c.fill(); c.fillStyle = '#7a5236'; c.fillRect(146, 388, 8, 5); c.fillRect(206, 388, 8, 5);
        c.restore();
        // glass in the windows, the sky in it
        for (const [x, y] of WINS) { c.fillStyle = lin(c, 0, y - 32, 0, y + 32, [[0, '#cfe6ee'], [1, '#6f97a8']]); c.fillRect(x - 15, y - 32, 30, 64); }
        c.fillStyle = lin(c, 0, PORT.y - PORT.r, 0, PORT.y + PORT.r, [[0, '#cfe6ee'], [1, '#6f97a8']]); c.beginPath(); c.arc(PORT.x, PORT.y, PORT.r, 0, TAU); c.fill();
      },
      clean(c, paint) { c.fillStyle = paint; c.fillRect(0, 0, W, H); },
      cleanOver(c) {
        // the lap of the weatherboards, and the shade under the eaves
        for (let y = yA; y < yB; y += 15) { c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(xL, y, xR - xL, 2.4); c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(xL, y + 2.4, xR - xL, 1.6); }
        c.fillStyle = 'rgba(0,0,0,0.1)'; for (let x = xL + 16; x < xR; x += 58) c.fillRect(x, yA, 1.2, yB - yA);
        c.fillStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); c.moveTo(xL, yE + 16); c.lineTo(cx, yA + 16); c.lineTo(xR, yE + 16); c.lineTo(xR, yE); c.lineTo(cx, yA); c.lineTo(xL, yE); c.closePath(); c.fill();
      },
      dirt(c) {
        const q = U.rng(19161), g = ramp(['#83837c', '#979690', '#a9a89f', '#bab8ad']);
        field(c, xL - 2, yA - 2, xR + 2, yB + 2, 1.5, (x, y) => g(nz.fbm(x * 0.012, y * 0.09, 4)));
        for (let y = yA; y < yB; y += 15) { c.fillStyle = 'rgba(46,40,34,0.42)'; c.fillRect(xL, y, xR - xL, 2.2); for (let k = 0; k < 7; k++) { c.fillStyle = 'rgba(60,54,46,0.2)'; c.fillRect(xL + q() * (xR - xL), y + 4 + q() * 8, 16 + q() * 60, 1); } }
        peelingPaint(c, r, xL, yA + 30, xR, yB, 66, '#6f97a0');
        grime(c, r, xL, yB - 110, xR, yB, 24);
        const moss = ramp(['#4f6e36', '#5f8040', '#74924a']);
        field(c, xL, yB - 44, xR, yB + 2, 2, (x, y) => { const v = nz.fbm(x * 0.05, y * 0.05, 3); return [...moss(v), Math.max(0, (y - (yB - 44)) / 44 - 0.2 - (0.6 - v)) * 340]; });
      },
      top(c) {
        const q = U.rng(19162);
        // the slates, down both slopes of the gable
        const roof = (s) => {
          c.save(); c.beginPath(); c.moveTo(cx, yA - 30); c.lineTo(cx + s * 164, yE + 10); c.lineTo(cx + s * 168, yE + 26); c.lineTo(cx + s * 136, yE + 4); c.lineTo(cx, yA + 2); c.closePath(); c.clip();
          c.fillStyle = '#5c6a7c'; c.fillRect(0, 0, W, 300);
          for (let y = 70, k = 0; y < 260; y += 10, k++) for (let x = k % 2 ? -6 : 8; x < W; x += 15) { c.fillStyle = U.shade(U.pick(q, ['#5c6a7c', '#667488', '#525f70', '#6e7a8c']), (q() - 0.5) * 0.12); c.fillRect(x, y, 14, 9); }
          c.restore();
        };
        c.fillStyle = 'rgba(30,24,20,0.3)'; c.beginPath(); c.moveTo(xL - 18, yE + 22); c.lineTo(cx, yA + 8); c.lineTo(xR + 18, yE + 22); c.closePath(); c.fill();
        roof(-1); roof(1);
        // the white scalloped barge boards
        for (const s of [-1, 1]) {
          const ex = cx + s * 150, ey = yE + 6, sx = cx, sy = yA - 2, n = 13;
          c.strokeStyle = '#f4efe2'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.stroke();
          c.fillStyle = '#f4efe2'; for (let k = 0; k < n; k++) { const t = (k + 0.5) / n; dot(c, U.lerp(sx, ex, t), U.lerp(sy, ey, t) + 4, 6, '#f4efe2'); }
        }
        c.fillStyle = OAK_DK; c.fillRect(cx - 1.6, yA - 40, 3.2, 12); dot(c, cx, yA - 28, 3.4, GOLD); c.fillStyle = GOLD; c.fillRect(cx - 16, yA - 40, 32, 2.4); c.beginPath(); c.moveTo(cx + 16, yA - 43); c.lineTo(cx + 24, yA - 39); c.lineTo(cx + 16, yA - 35); c.closePath(); c.fill();
        // white trim round the door, the windows and the round light
        c.strokeStyle = '#f4efe2'; c.lineWidth = 8; c.beginPath(); c.moveTo(D.x0 - 4, yB); c.lineTo(D.x0 - 4, D.spring); c.arc(cx, D.spring, D.r + 4, Math.PI, 0); c.lineTo(D.x1 + 4, yB); c.stroke();
        c.strokeStyle = 'rgba(60,50,40,0.3)'; c.lineWidth = 1; c.beginPath(); c.moveTo(D.x0, yB); c.lineTo(D.x0, D.spring); c.arc(cx, D.spring, D.r, Math.PI, 0); c.lineTo(D.x1, yB); c.stroke();
        for (const [x, y] of WINS) {
          c.strokeStyle = '#f4efe2'; c.lineWidth = 6; c.strokeRect(x - 16, y - 33, 32, 66);
          c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 33); c.lineTo(x, y + 33); c.moveTo(x - 16, y - 11); c.lineTo(x + 16, y - 11); c.moveTo(x - 16, y + 11); c.lineTo(x + 16, y + 11); c.stroke();
          c.fillStyle = '#f4efe2'; c.fillRect(x - 22, y + 34, 44, 6);
        }
        c.strokeStyle = '#f4efe2'; c.lineWidth = 6; c.beginPath(); c.arc(PORT.x, PORT.y, PORT.r + 1, 0, TAU); c.stroke();
        c.lineWidth = 2.6; c.beginPath(); c.moveTo(PORT.x - PORT.r, PORT.y); c.lineTo(PORT.x + PORT.r, PORT.y); c.moveTo(PORT.x, PORT.y - PORT.r); c.lineTo(PORT.x, PORT.y + PORT.r); c.stroke();
        // the board along the foot, then the jetty coming out to us
        c.fillStyle = '#f4efe2'; c.fillRect(xL - 3, yB, D.x0 - xL + 3, 7); c.fillRect(D.x1, yB, xR - D.x1 + 3, 7);
        c.fillStyle = 'rgba(20,30,40,0.3)'; c.beginPath(); c.moveTo(118, 512); c.lineTo(242, 512); c.lineTo(280, 610); c.lineTo(80, 610); c.closePath(); c.fill();
        for (let y = yB + 2, k = 0; y < 604; k++) {
          const t = (y - yB) / 170, a = 120 - t * 44, b = 240 + t * 44, h = 7 + t * 10;
          c.fillStyle = U.shade(U.pick(q, ['#a98a60', '#b4956a', '#9c7e56']), (q() - 0.5) * 0.14); c.fillRect(a, y, b - a, h - 1.2);
          c.fillStyle = 'rgba(40,28,18,0.4)'; c.fillRect(a, y + h - 1.4, b - a, 1.4);
          y += h;
        }
        for (const [x, y] of [[74, 584], [286, 584]]) {
          c.fillStyle = lin(c, x - 7, 0, x + 7, 0, [[0, '#7a5a3e'], [1, '#463226']]); c.fillRect(x - 7, y - 66, 14, 86);
          dot(c, x, y - 66, 7, '#8a6a4a');
          c.strokeStyle = '#e6d6b0'; c.lineWidth = 2.2; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(x - 8, y - 42 + k * 5); c.lineTo(x + 8, y - 38 + k * 5); c.stroke(); }
        }
        // reeds at both sides
        for (let i = 0; i < 44; i++) { const left = i % 2 === 0, x = (left ? -2 + q() * 48 : 314 + q() * 48), y = 506 + q() * 60; reed(c, q, x, y, 50 + q() * 70, q() < 0.2); }
      },
      stamp: paintStamp,
    };
  }

  // ------------------------------------------- WISTERIA MANOR: THE GRAVEL DRIVE
  // The drive coming up through the park, wide at our feet and curving away to the
  // steps of the house. Puddles, leaves, ruts and tufts of grass have spoiled it.
  // Raking lays the gold gravel back in long clean lines.
  // sand { what: 'gravel' }
  function gravelDrive(S) {
    const { r, nz, bleed } = S;
    const Y0 = 96, Y1 = 612;
    const mid = (y) => 180 + Math.sin((y - Y0) * 0.0098) * 40 * Math.min(1, (Y1 + 120 - y) / 300);
    const half = (y) => 30 + ((y - Y0) / (Y1 - Y0)) ** 1.15 * 150;
    const region = new Path2D();
    region.moveTo(mid(Y0) - half(Y0), Y0);
    for (let y = Y0; y <= Y1; y += 12) region.lineTo(mid(y) + half(y), y);
    for (let y = Y1; y >= Y0; y -= 12) region.lineTo(mid(y) - half(y), y);
    region.closePath();
    const rut = (x, y) => Math.abs(Math.abs(x - mid(y)) / half(y) - 0.42) < 0.08;
    function stones(c, q, cols, n) {
      for (let i = 0; i < n; i++) {
        const y = Y0 + q() * (Y1 - Y0), t = 0.5 + ((y - Y0) / (Y1 - Y0)) * 0.9, x = mid(y) + (q() * 2 - 1) * half(y);
        c.fillStyle = U.pick(q, cols); c.beginPath(); c.ellipse(x, y, (1 + q() * 1.2) * t, (0.7 + q() * 0.8) * t, q() * 3, 0, TAU); c.fill();
      }
    }
    return {
      family: 'rake', particle: 'sand', region, depth: true,
      tough: (x, y) => (rut(x, y) ? 1.5 : nz.n2(x * 0.03, y * 0.03) > 0.68 ? 1.3 : 1),
      decor(c) {
        const { x0, y0, x1, y1 } = bleed, q = U.rng(1901);
        c.fillStyle = lin(c, 0, y0, 0, 70, [[0, '#9ccbe6'], [1, '#eaf0e4']]); c.fillRect(x0, y0, x1 - x0, 74);
        mowedLawn(c, nz, x0, 66, x1, y1, false);
        // the front of the house, the steps and the door
        ashlar(c, q, nz, 80, 8, 280, 86);
        c.fillStyle = '#7f8a9a'; c.fillRect(70, 2, 220, 10);
        c.fillStyle = '#5c6a7c'; for (let x = 92; x < 276; x += 28) if (Math.abs(x - 176) > 20) c.fillRect(x, 26, 13, 34);
        c.fillStyle = '#3d5a86'; c.fillRect(164, 30, 32, 52); c.fillStyle = '#ffd98e'; c.beginPath(); c.arc(180, 30, 16, Math.PI, 0); c.fill();
        c.strokeStyle = 'rgba(155,124,200,0.8)'; c.lineWidth = 6; c.beginPath(); c.moveTo(80, 18); c.quadraticCurveTo(120, 26, 150, 14); c.moveTo(210, 14); c.quadraticCurveTo(240, 26, 280, 18); c.stroke();
        for (let k = 0; k < 4; k++) { c.fillStyle = k % 2 ? STONE : STONE_LT; c.fillRect(150 - k * 6, 82 + k * 4, 60 + k * 12, 4); }
        softShadow(c, region, 6, 0.3);
        c.strokeStyle = STONE_DK; c.lineWidth = 6; c.stroke(region); c.strokeStyle = STONE_LT; c.lineWidth = 3; c.stroke(region);
        // lime trees down both sides, small far off and big by us
        for (const [s, ys] of [[-1, [116, 156, 214, 300, 420]], [1, [116, 156, 214, 300, 420]]]) for (const y of ys) {
          const x = mid(y) + s * (half(y) + 22 + (y - 96) * 0.17), k = 0.35 + ((y - 96) / 320) * 1.1;
          c.fillStyle = 'rgba(30,50,20,0.22)'; c.beginPath(); c.ellipse(x + 10 * k, y + 4 * k, 34 * k, 11 * k, 0, 0, TAU); c.fill();
          c.fillStyle = '#6b4a32'; c.fillRect(x - 3.5 * k, y - 44 * k, 7 * k, 46 * k);
          shrub(c, q, x, y - 66 * k, 44 * k, U.pick(q, ['#4f8a3c', '#5d9644', '#467e37']));
        }
      },
      clean(c) {
        const q = U.rng(19011), g = ramp(['#d8c28e', '#e2cea0', '#ecdcb6', '#f2e6c8']);
        field(c, 0, Y0 - 6, W, H + 6, 3, (x, y) => g(nz.fbm(x * 0.04, y * 0.06, 3)));
        stones(c, q, ['#c9b284', '#f6edd6', '#b8a074', '#e6d4a8', '#a8926a'], 2800);
      },
      cleanOver(c) {
        // the long lines of the rake, following the curve of the drive
        for (let u = -0.92; u < 0.95; u += 0.1) {
          const line = (dx, col) => { c.strokeStyle = col; c.lineWidth = 1.2; c.beginPath(); for (let y = Y0; y <= Y1; y += 12) c.lineTo(mid(y) + u * half(y) + dx, y); c.stroke(); };
          line(0, 'rgba(150,120,70,0.34)'); line(1.4, 'rgba(255,248,226,0.5)');
        }
      },
      dirt(c) {
        const g = ramp(['#8c8066', '#9b8e72', '#aa9d80', '#b8ab8e']);
        field(c, 0, Y0 - 6, W, H + 6, 2, (x, y) => g(nz.fbm(x * 0.02 + 30, y * 0.03, 5) * 0.8 + nz.n2(x * 0.3, y * 0.3) * 0.2));
        stones(c, r, ['#6f6450', '#bcae90', '#837660', '#a79a7e'], 2600);
        // the two ruts the carts wore
        for (const u of [-0.42, 0.42]) { c.strokeStyle = 'rgba(70,58,42,0.42)'; c.lineCap = 'round'; c.lineWidth = 11; c.beginPath(); for (let y = Y0; y <= Y1; y += 12) c.lineTo(mid(y) + u * half(y), y); c.stroke(); }
        // puddles with the sky in them
        for (const [y, u, w] of [[256, -0.42, 22], [372, 0.42, 36], [486, -0.42, 50], [560, 0.42, 54]]) {
          const x = mid(y) + u * half(y);
          c.fillStyle = 'rgba(70,58,42,0.5)'; c.beginPath(); c.ellipse(x, y + 2, w + 3, w * 0.36 + 2, 0, 0, TAU); c.fill();
          c.fillStyle = lin(c, 0, y - w * 0.36, 0, y + w * 0.36, [[0, '#a8c6d0'], [1, '#7f9aa4']]); c.beginPath(); c.ellipse(x, y, w, w * 0.34, 0, 0, TAU); c.fill();
          c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 1; c.beginPath(); c.ellipse(x - w * 0.2, y - 2, w * 0.4, w * 0.1, 0, 0, TAU); c.stroke();
        }
        // tufts of grass and fallen lime leaves
        const items = [];
        for (let i = 0; i < 46; i++) {
          const y = Y0 + 20 + r() * (Y1 - Y0 - 20), x = mid(y) + (r() * 2 - 1) * half(y) * 0.96, t = 0.5 + ((y - Y0) / (Y1 - Y0)) * 0.9;
          for (let k = 0; k < 16; k++) { const dx = (r() - 0.5) * 14 * t, l = (7 + r() * 13) * t; items.push({ x0: x + dx, y0: y, cx: x + dx * 1.2, cy: y - l * 0.6, x1: x + dx * 1.7, y1: y - l, col: U.pick(r, ['#4d8a34', '#62a042', '#7bb553', '#3b7229']), w: 1.6 }); }
        }
        strokesByColour(c, items, 1.6);
        for (let i = 0; i < 120; i++) {
          const y = Y0 + 10 + r() * (Y1 - Y0 - 10), x = mid(y) + (r() * 2 - 1) * half(y), s = 2.4 + ((y - Y0) / (Y1 - Y0)) * 5;
          c.save(); c.translate(x, y); c.rotate(r() * TAU); c.scale(1, 0.62); c.fillStyle = U.pick(r, ['#c9a04a', '#b8823e', '#d8b85a', '#a2622e']); c.beginPath(); c.arc(0, 0, s, 0, TAU); c.fill(); c.restore();
        }
      },
      // raking leaves grooves; the sparkle dots at the very end leave none
      stamp(c, x, y, a, t) {
        if (t.shape === 'circle' && t.r < 4) return;
        const w = t.shape === 'rect' ? t.w : t.r * 1.6, d = t.shape === 'rect' ? t.h : t.r * 0.7, n = Math.max(2, Math.round(w / 4.5));
        c.save(); c.translate(x, y); c.rotate(a);
        for (let k = 0; k < n; k++) {
          const yy = -w / 2 + (w * (k + 0.5)) / n;
          c.fillStyle = '#c4ad7c'; c.fillRect(-d / 2, yy - 0.75, d, 1.4);
          c.fillStyle = '#f8eed4'; c.fillRect(-d / 2, yy + 0.8, d, 1);
        }
        c.restore();
      },
    };
  }

  // --------------------------------------------- WISTERIA MANOR: THE GREAT LAWN
  // The long lawn below the terrace, from the balustrade to the gravel walk at our
  // feet, gone to seed and full of daisies. Mown, it lies in broad light and dark
  // stripes running away towards the house, with the croquet hoops still in it.
  // lawn { shape: 'wide' }
  function greatLawn(S) {
    const { r, nz, bleed } = S;
    const X0 = 8, X1 = 352, Y0 = 122, Y1 = 566, VY = -340, N = 11, HOOPS = [[120, 214, 0.62], [240, 214, 0.62], [86, 352, 0.82], [274, 352, 0.82], [180, 470, 1]];
    const region = new Path2D();
    rrPath(region, X0, Y0, X1 - X0, Y1 - Y0, 16);
    const edge = (u, y) => 180 + (u - 180) * ((y - VY) / (Y1 - VY));
    return {
      family: 'mow', particle: 'grass', region, depth: true,
      decor(c) {
        const { x0, y0, x1, y1 } = bleed, q = U.rng(1902);
        // the south front across the top, the sky over it
        c.fillStyle = lin(c, 0, y0, 0, 60, [[0, '#9ccbe6'], [1, '#eaf0e4']]); c.fillRect(x0, y0, x1 - x0, 70);
        ashlar(c, q, nz, x0, 22, x1, 104);
        c.fillStyle = '#7f8a9a'; c.fillRect(x0, 12, x1 - x0, 12);
        for (let x = 12; x < W; x += 36) { c.fillStyle = '#566a7c'; c.beginPath(); c.moveTo(x, 90); c.lineTo(x, 44); c.arc(x + 10, 44, 10, Math.PI, 0); c.lineTo(x + 20, 90); c.closePath(); c.fill(); c.strokeStyle = '#f4efe2'; c.lineWidth = 1.4; c.stroke(); c.beginPath(); c.moveTo(x + 10, 34); c.lineTo(x + 10, 90); c.moveTo(x, 62); c.lineTo(x + 20, 62); c.stroke(); }
        for (let i = 0; i < 40; i++) { const x = q() * W; spray(c, q, x, 22, 12 + q() * 18); }
        // the balustrade along the terrace
        c.fillStyle = STONE; c.fillRect(x0, 86, x1 - x0, 6);
        for (let x = 4; x < W; x += 15) { c.fillStyle = lin(c, x, 0, x + 9, 0, [[0, STONE_LT], [1, STONE_DK]]); c.beginPath(); c.moveTo(x + 3, 92); c.lineTo(x + 6, 92); c.quadraticCurveTo(x + 11, 104, x + 7, 114); c.lineTo(x + 2, 114); c.quadraticCurveTo(x - 2, 104, x + 3, 92); c.closePath(); c.fill(); }
        c.fillStyle = lin(c, 0, 112, 0, 124, [[0, STONE_LT], [1, '#a59b87']]); c.fillRect(x0, 112, x1 - x0, 12);
        // the gravel walk at our feet
        c.fillStyle = '#d8cbad'; c.fillRect(x0, Y1, x1 - x0, y1 - Y1);
        for (let i = 0; i < 500; i++) dot(c, x0 + q() * (x1 - x0), Y1 + q() * (y1 - Y1), 0.6 + q(), U.pick(q, ['#b5a585', '#efe6d0', '#a8977a']));
        for (const x of [x0 - 2, x1 - 8]) { c.fillStyle = '#467e37'; c.fillRect(x, Y0, 12, Y1 - Y0); }
        softShadow(c, region, 6, 0.3);
        c.strokeStyle = STONE_DK; c.lineWidth = 5; c.stroke(region); c.strokeStyle = STONE_LT; c.lineWidth = 2.4; c.stroke(region);
      },
      clean(c) {
        c.fillStyle = GRASS.base; c.fillRect(0, 0, W, H);
        // the mower's stripes, closing together towards the house
        const s = (X1 - X0 + 180) / N;
        for (let i = 0; i < N; i++) {
          const a = X0 - 90 + i * s, b = a + s;
          c.fillStyle = i % 2 ? GRASS.light : GRASS.dark;
          c.beginPath(); c.moveTo(edge(a, Y0), Y0); c.lineTo(edge(b, Y0), Y0); c.lineTo(b, Y1); c.lineTo(a, Y1); c.closePath(); c.fill();
        }
        const q = U.rng(19021);
        field(c, 0, Y0, W, Y1, 3, (x, y) => [40, 90, 30, Math.max(0, nz.fbm(x * 0.012, y * 0.016, 3) - 0.5) * 90]);
        for (let i = 0; i < 30; i++) dot(c, X0 + q() * (X1 - X0), Y0 + 8 + q() * (Y1 - Y0 - 16), 1, 'rgba(255,255,255,0.65)');
      },
      cleanOver(c) { grassGrain(c, r, 0, Y0 - 4, W, Y1 + 4, 3.2, 0.26); },
      dirt(c) { tallGrass(c, r, nz, region, 0, 0, W, H); },
      top(c) {
        // the croquet hoops, a mallet and a ball left out in the grass
        for (const [x, y, k] of HOOPS) {
          c.fillStyle = 'rgba(30,50,20,0.25)'; c.beginPath(); c.ellipse(x + 4 * k, y + 1, 18 * k, 3 * k, 0, 0, TAU); c.fill();
          c.strokeStyle = '#f7f3e8'; c.lineWidth = 3.4 * k; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 14 * k, y); c.lineTo(x - 14 * k, y - 18 * k); c.arc(x, y - 18 * k, 14 * k, Math.PI, 0); c.lineTo(x + 14 * k, y); c.stroke();
        }
        c.strokeStyle = '#a97c4c'; c.lineWidth = 3; c.beginPath(); c.moveTo(212, 520); c.lineTo(262, 486); c.stroke();
        c.save(); c.translate(264, 484); c.rotate(-0.6); c.fillStyle = '#7a4a2a'; c.beginPath(); c.roundRect(-5, -13, 10, 26, 2); c.fill(); c.fillStyle = '#3d5a86'; c.fillRect(-5, -10, 10, 3); c.fillRect(-5, 7, 10, 3); c.restore();
        dot(c, 196, 522, 8, 'rgba(30,50,20,0.3)'); dot(c, 194, 518, 8, '#c9474f'); dot(c, 191.6, 515.6, 2.2, 'rgba(255,255,255,0.7)');
      },
    };
  }

  SCENES.VARIANTS.push(
    { kind: 'window', test: (o) => o.room === 'ballroom' || o.room === 'library', make: tallWindow },
    { kind: 'bed', test: (o) => o.flower === 'wisteria', make: wisteriaWall },
    { kind: 'bed', test: (o) => o.flower === 'box', make: boxKnot },
    { kind: 'door', test: (o) => o.what === 'grand', make: grandDoor },
    { kind: 'pond', test: (o) => o.what === 'lake', make: longLake },
    { kind: 'lantern', test: (o) => o.where === 'manor', make: chandelier },
    { kind: 'cafeFloor', test: (o) => o.where === 'ballroom', make: ballroomFloor },
    { kind: 'fence', test: (o) => o.what === 'iron', make: ironGate },
    { kind: 'hut', test: (o) => o.what === 'boathouse', make: boathouse },
    { kind: 'sand', test: (o) => o.what === 'gravel', make: gravelDrive },
    { kind: 'lawn', test: (o) => o.shape === 'wide', make: greatLawn },
  );
  // scenes13.js has a variant for every fountain, so this one has to be found first
  SCENES.VARIANTS.unshift({ kind: 'pond', test: (o) => o.what === 'fountain' && o.where === 'manor', make: manorFountain });
})();
