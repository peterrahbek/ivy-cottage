'use strict';
// The locked box, a thinking job for Marchbank's Curiosities: a little escape
// room. Three small pictures hang on the wall, each with a sign (a circle, a
// triangle or a square) and a few things to count, and the box on the desk
// has three dials with the same signs. Turn each dial to the number its
// picture shows: tap the top half of a dial to count up and the bottom half
// to count down, or roll it with a finger. A dial that comes to rest on its
// number gives a soft click; when all three are right the lid opens and
// something glints inside. A wrong combination simply does nothing.
// With opts.what = 'trunk' it is an old trunk in the cottage attic, 'chest' a
// chest in the bookshop stockroom and 'case' a lost suitcase at the station.
// With opts.dials = 'letters' the dials have letters and the three pictures
// spell a little word by their first letters; with opts.dice each number is
// what two dice add up to.
//   node test/run.mjs puzzle js/pz-lock.js lock --seeds 30 [--opts '{"what":"trunk"}']
(() => {
  const INK = PZ.INK, INK2 = PZ.INK2, TAU = Math.PI * 2;
  const INKL = 'rgba(59,53,46,0.55)';
  const FX = [62, 180, 298], FY0 = 48, FW = 108, FH = 132;   // the three pictures on the wall
  const DX = [118, 180, 242], DY = 420;                      // the three dials
  const WIN_W = 46, WIN_H = 64, ROW = 36;                    // a dial's window, and how far apart its numbers are
  const HIT_X = 31, HIT_Y = 66;                              // how far from a dial's middle a finger still turns it
  const REST = 0.32, DRAG = 28;                              // a dial counts once it has rested this long; a roll this far turns it one
  const BODY = { x0: 40, x1: 320, y0: 332, y1: 538 }, LID = { x0: 34, x1: 326, y0: 270 };
  const PLATE = { x0: 88, x1: 272, y0: 352, y1: 516 };
  const DESK_Y = 528;
  const SIGNS = ['circle', 'triangle', 'square'];
  const SIGN_COL = { circle: '#c9474f', triangle: '#3d5a86', square: '#4e7b5b' };
  const mod = (a, n) => ((a % n) + n) % n;

  // each kind of box: how its pictures hang, its room, its wood and its lining
  const STYLES = {
    box: { frame: 'gilt', room: 'curio', lining: '#7a2f3a' },
    trunk: { frame: 'wood', room: 'attic', lining: '#3d5a86' },
    chest: { frame: 'card', room: 'books', lining: '#4e7b5b' },
    case: { frame: 'label', room: 'halt', lining: '#c9474f' },
  };

  // ------------------------------------------------------------ drawing kit
  function ln(c, pts, col, w = 1.4) {
    c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    c.stroke();
  }
  const dot = (c, x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); };
  const oval = (c, x, y, rx, ry, rot, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU); c.fill(); };
  function outline(c, w = 1) { c.strokeStyle = INKL; c.lineWidth = w; c.lineJoin = 'round'; c.stroke(); }
  // a small seeded random of our own, for wood grain that never changes
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function grain(c, r, x, y, w, h, col, n = (w * h) / 240) {
    c.strokeStyle = col; c.lineWidth = 0.8;
    for (let i = 0; i < n; i++) {
      const gx = x + r() * w, gy = y + 2 + r() * Math.max(1, h - 4), l = 10 + r() * 36;
      c.beginPath(); c.moveTo(gx, gy); c.lineTo(Math.min(x + w, gx + l), gy + (r() - 0.5) * 0.8); c.stroke();
    }
  }

  // the three signs, and a brass badge with one enamelled on it
  function sign(c, kind, x, y, s, col) {
    c.fillStyle = col; c.beginPath();
    if (kind === 'circle') c.arc(x, y, s, 0, TAU);
    else if (kind === 'triangle') { c.moveTo(x, y - s * 1.15); c.lineTo(x + s * 1.15, y + s * 0.85); c.lineTo(x - s * 1.15, y + s * 0.85); c.closePath(); }
    else c.rect(x - s * 0.9, y - s * 0.9, s * 1.8, s * 1.8);
    c.fill();
  }
  function badge(c, kind, x, y, r = 12) {
    PZ.shadow(c, x + 1, y + r - 1, r * 0.9, 2.6, 0.2);
    dot(c, x, y, r, '#a8842a'); dot(c, x, y - 0.6, r - 1.5, '#e2c25a'); dot(c, x, y, r - 3.2, '#fbf3df');
    sign(c, kind, x, y + (kind === 'triangle' ? 1 : 0), (r - 3.2) * 0.62, SIGN_COL[kind]);
  }

  // --------------------------------------------------- things to count
  // Each is drawn around 0, 0 within about 18 units, with its own shape.
  const THINGS = {
    apple(c) {
      c.beginPath(); c.moveTo(0, -4.5); c.bezierCurveTo(5, -9.5, 10.5, -4.5, 8.6, 2); c.bezierCurveTo(7.5, 7.6, 3, 9.4, 0, 8); c.bezierCurveTo(-3, 9.4, -7.5, 7.6, -8.6, 2); c.bezierCurveTo(-10.5, -4.5, -5, -9.5, 0, -4.5); c.closePath();
      c.fillStyle = '#d9534f'; c.fill(); outline(c);
      ln(c, [0, -4.5, 1.4, -9.4], '#6b4a32', 1.8);
      oval(c, 5, -8.4, 3.8, 1.8, -0.45, '#6f9a6a');
      oval(c, -4.4, -1, 1.6, 3, 0.4, 'rgba(255,255,255,0.45)');
    },
    bird(c) {
      c.fillStyle = '#4f72c4'; c.beginPath(); c.moveTo(-6, 1); c.lineTo(-12.5, -3.5); c.lineTo(-11, 3.5); c.closePath(); c.fill();
      c.beginPath(); c.ellipse(-0.5, 1.5, 8, 6, 0, 0, TAU); c.fill(); outline(c);
      dot(c, 5.4, -3, 4.4, '#4f72c4');
      c.fillStyle = '#e9962c'; c.beginPath(); c.moveTo(9.2, -3.8); c.lineTo(12.6, -2.4); c.lineTo(9.2, -1.2); c.closePath(); c.fill();
      oval(c, 0.6, 3.4, 4.2, 2.8, 0, '#f2d88a');
      dot(c, 6.4, -4, 1.1, '#fffaf1'); dot(c, 6.6, -4, 0.55, INK);
      ln(c, [-1.6, 7.2, -2, 9], '#6b6157', 1); ln(c, [1.6, 7.2, 1.8, 9], '#6b6157', 1);
    },
    candle(c) {
      c.fillStyle = 'rgba(255,214,110,0.32)'; c.beginPath(); c.arc(0, -7, 6.4, 0, TAU); c.fill();
      c.beginPath(); c.rect(-3.4, -3, 6.8, 11); c.fillStyle = '#fbf3e2'; c.fill(); outline(c);
      ln(c, [0, -3, 0, -5], INK, 0.9);
      c.fillStyle = '#f6a83d'; c.beginPath(); c.moveTo(0, -11); c.quadraticCurveTo(3.4, -6.4, 0, -4.4); c.quadraticCurveTo(-3.4, -6.4, 0, -11); c.fill();
      oval(c, 0, -6.4, 1, 1.7, 0, '#fff3b0');
      oval(c, 0, 8.4, 6.4, 1.9, 0, '#c99a2e');
    },
    star(c) {
      c.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 4 : 9; c.lineTo(Math.cos(a) * r, Math.sin(a) * r + 0.6); }
      c.closePath(); c.fillStyle = '#efc24a'; c.fill(); outline(c);
      oval(c, -1.6, -1.6, 1.4, 2.2, 0.5, 'rgba(255,255,255,0.5)');
    },
    fish(c) {
      c.fillStyle = '#e9893a'; c.beginPath(); c.moveTo(-5, 0); c.lineTo(-11.5, -5.5); c.lineTo(-11.5, 5.5); c.closePath(); c.fill(); outline(c, 0.8);
      c.beginPath(); c.ellipse(1, 0, 8.4, 5.4, 0, 0, TAU); c.fillStyle = '#f0a04a'; c.fill(); outline(c);
      c.strokeStyle = 'rgba(160,80,20,0.45)'; c.lineWidth = 1; c.beginPath(); c.arc(-1, 0, 4, -1, 1); c.stroke();
      dot(c, 5.4, -1.4, 1.5, '#fffaf1'); dot(c, 5.7, -1.4, 0.7, INK);
    },
    flower(c) {
      ln(c, [0, 2, 0, 9.4], '#5c8458', 1.6);
      for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU - Math.PI / 2; oval(c, Math.cos(a) * 4.2, -1.6 + Math.sin(a) * 4.2, 3.6, 2.6, a, '#e98aa6'); }
      dot(c, 0, -1.6, 2.6, '#f2d24a'); dot(c, -0.8, -2.4, 0.8, '#fffaf1');
    },
    leaf(c) {
      c.save(); c.rotate(-0.6);
      c.beginPath(); c.moveTo(0, -9.5); c.bezierCurveTo(7, -5, 7, 4, 0, 9); c.bezierCurveTo(-7, 4, -7, -5, 0, -9.5); c.closePath();
      c.fillStyle = '#7fae5a'; c.fill(); outline(c);
      ln(c, [0, -7.5, 0, 10.5], '#557a3c', 1);
      for (const y of [-3, 1.5]) { ln(c, [0, y + 2, 3.4, y - 1], '#557a3c', 0.8); ln(c, [0, y + 2, -3.4, y - 1], '#557a3c', 0.8); }
      c.restore();
    },
    heart(c) {
      c.beginPath(); c.moveTo(0, 8.4); c.bezierCurveTo(-11, 1, -8, -9, 0, -3.6); c.bezierCurveTo(8, -9, 11, 1, 0, 8.4); c.closePath();
      c.fillStyle = '#e2574c'; c.fill(); outline(c);
      oval(c, -3.6, -2.8, 1.6, 2.4, 0.6, 'rgba(255,255,255,0.45)');
    },
  };
  const THING_IDS = Object.keys(THINGS);
  // rows that are easy to count at a glance
  const ROWS = { 1: [1], 2: [2], 3: [3], 4: [2, 2], 5: [3, 2], 6: [3, 3], 7: [2, 3, 2], 8: [3, 2, 3], 9: [3, 3, 3] };
  // one or two things are drawn bigger; more stand well apart, three to a row at most
  const sizeOf = (n) => (n === 1 ? 1.6 : n === 2 ? 1.3 : 1);
  function rowsOf(n, cx, cy) {
    const rows = ROWS[n], sx = 26 * sizeOf(n), sy = 25;
    return rows.map((m, j) => ({ y: cy + (j - (rows.length - 1) / 2) * sy, xs: Array.from({ length: m }, (_, i) => cx + (i - (m - 1) / 2) * sx) }));
  }

  // a die, its pips the usual way round
  const PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
  function die(c, n, x, y, s, rot) {
    PZ.shadow(c, x + 1.5, y + s / 2 + 1, s * 0.5, 3, 0.18);
    c.save(); c.translate(x, y); c.rotate(rot);
    c.fillStyle = '#fffdf7'; PZ.rr(c, -s / 2, -s / 2, s, s, s * 0.2); c.fill(); outline(c, 1.3);
    c.fillStyle = 'rgba(59,53,46,0.08)'; PZ.rr(c, -s / 2 + 2, s / 2 - 5, s - 4, 3, 1.5); c.fill();
    c.fillStyle = INK;
    for (const [i, j] of PIPS[n]) { c.beginPath(); c.arc(i * s * 0.27, j * s * 0.27, s * 0.09, 0, TAU); c.fill(); }
    c.restore();
  }

  // pictures for the letter dials: names that start with the same letter in
  // English and in Danish, so a picture always says its letter
  const PICS = { A: '⚓', B: '🐝', E: '🐘', F: '🐟', G: '🐐', H: '🏠', I: '🧊', L: '🦁', M: '🌙', N: '👃', P: '🍐', R: '🌹', S: '☀️', T: '🌳', Z: '🦓' };
  const WORDS = ['HAT', 'MAP', 'PIG', 'FIG', 'BIG', 'TEA', 'SEA', 'PEN', 'HEN', 'TEN', 'TIN', 'PIN', 'BAG', 'NAP', 'FAN', 'PAN', 'NET', 'PET', 'ZIP', 'MAT', 'BAT', 'LEG', 'GAP', 'LIP', 'TIP', 'SIT'];
  const ALPHA = 'ABCDEFGHIJKLMNOPRSTUVWY';

  // ------------------------------------------------------------ the rooms
  // the wall behind and the desk, floor or counter the box stands on
  function roomCurio(c, b, r) {
    // deep green paper with faint stripes and gold sprigs
    c.fillStyle = '#34503f'; c.fillRect(b.x0, b.y0, b.x1 - b.x0, 256 - b.y0);
    for (let x = Math.floor(b.x0 / 30) * 30; x < b.x1; x += 30) { c.fillStyle = 'rgba(255,240,200,0.05)'; c.fillRect(x, b.y0, 13, 256 - b.y0); }
    for (let y = 46, k = 0; y < 250; y += 34, k++) {
      for (let x = Math.floor(b.x0 / 30) * 30 + (k % 2 ? 21 : 6); x < b.x1; x += 30) {
        c.fillStyle = 'rgba(214,180,90,0.32)';
        c.beginPath(); c.arc(x, y, 1.6, 0, TAU); c.arc(x - 3, y + 3.4, 1.1, 0, TAU); c.arc(x + 3, y + 3.4, 1.1, 0, TAU); c.fill();
      }
    }
    // a warm patch of lamplight on the wall
    const g = c.createRadialGradient(300, 210, 10, 300, 210, 200);
    g.addColorStop(0, 'rgba(255,220,150,0.18)'); g.addColorStop(1, 'rgba(255,220,150,0)');
    c.fillStyle = g; c.fillRect(b.x0, b.y0, b.x1 - b.x0, 256 - b.y0);
    // the picture rail, the dado rail and dark panelling below
    c.fillStyle = '#5a3b28'; c.fillRect(b.x0, 26, b.x1 - b.x0, 6); c.fillStyle = 'rgba(255,230,190,0.3)'; c.fillRect(b.x0, 26, b.x1 - b.x0, 1.2);
    c.fillStyle = '#4a3022'; c.fillRect(b.x0, 256, b.x1 - b.x0, DESK_Y - 256);
    for (let x = Math.floor(b.x0 / 74) * 74 + 6; x < b.x1; x += 74) {
      c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x, 272, 62, DESK_Y - 290);
      c.fillStyle = 'rgba(255,220,180,0.08)'; c.fillRect(x + 2, 274, 58, 2); c.fillRect(x + 2, 274, 2, DESK_Y - 294);
    }
    c.fillStyle = '#6b4a32'; c.fillRect(b.x0, 250, b.x1 - b.x0, 9); c.fillStyle = 'rgba(255,230,190,0.28)'; c.fillRect(b.x0, 250, b.x1 - b.x0, 1.4);
    // the desk: a top seen a little from above, and its front with a drawer
    c.fillStyle = '#7a4128'; c.fillRect(b.x0, DESK_Y, b.x1 - b.x0, 22);
    grain(c, r, b.x0, DESK_Y, b.x1 - b.x0, 22, 'rgba(60,25,10,0.22)');
    c.fillStyle = 'rgba(255,220,170,0.3)'; c.fillRect(b.x0, DESK_Y, b.x1 - b.x0, 1.4);
    c.fillStyle = '#5e3020'; c.fillRect(b.x0, DESK_Y + 22, b.x1 - b.x0, b.y1 - DESK_Y - 22);
    c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(b.x0, DESK_Y + 22, b.x1 - b.x0, 4);
    c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1.4; c.strokeRect(70, DESK_Y + 34, 220, 30);
    dot(c, 180, DESK_Y + 49, 4, '#c9a14a'); dot(c, 179, DESK_Y + 48, 1.4, '#f2dc8a');
  }
  function roomAttic(c, b, r) {
    // plaster between old beams, light from a window off to the side
    c.fillStyle = '#ecdfc7'; c.fillRect(b.x0, b.y0, b.x1 - b.x0, 500 - b.y0);
    for (let i = 0; i < 90; i++) { c.fillStyle = 'rgba(160,130,90,0.045)'; c.beginPath(); c.ellipse(b.x0 + r() * (b.x1 - b.x0), 30 + r() * 460, 8 + r() * 18, 2 + r() * 3, (r() - 0.5) * 0.3, 0, TAU); c.fill(); }
    const g = c.createLinearGradient(b.x1, 40, 200, 300);
    g.addColorStop(0, 'rgba(255,245,210,0.35)'); g.addColorStop(1, 'rgba(255,245,210,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(b.x1, 30); c.lineTo(b.x1, 200); c.lineTo(150, 500); c.lineTo(60, 500); c.closePath(); c.fill();
    c.fillStyle = '#8a6142'; c.fillRect(b.x0, 18, b.x1 - b.x0, 14); grain(c, r, b.x0, 18, b.x1 - b.x0, 14, 'rgba(50,30,15,0.3)');
    c.fillStyle = 'rgba(255,230,190,0.3)'; c.fillRect(b.x0, 18, b.x1 - b.x0, 1.4);
    // the roof coming down in both corners
    c.fillStyle = '#b48a5a';
    c.beginPath(); c.moveTo(b.x0, 32); c.lineTo(4, 32); c.lineTo(b.x0, 46); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(b.x1, 32); c.lineTo(356, 32); c.lineTo(b.x1, 46); c.closePath(); c.fill();
    // a cobweb in the corner
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 0.7;
    for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(352, 32); c.lineTo(352 - 22 + k * 7, 32 + 4 + k * 6); c.stroke(); }
    for (const d of [7, 13, 19]) { c.beginPath(); c.arc(352, 32, d, Math.PI * 0.55, Math.PI * 0.95); c.stroke(); }
    // the skirting and the floorboards the trunk stands on
    c.fillStyle = '#c9a272'; c.fillRect(b.x0, 492, b.x1 - b.x0, 8);
    c.fillStyle = '#c69c66'; c.fillRect(b.x0, 500, b.x1 - b.x0, b.y1 - 500);
    grain(c, r, b.x0, 500, b.x1 - b.x0, b.y1 - 500, 'rgba(110,70,35,0.18)');
    for (let y = 512; y < b.y1; y += 15) { c.fillStyle = 'rgba(90,55,25,0.22)'; c.fillRect(b.x0, y, b.x1 - b.x0, 1.2); }
  }
  function roomBooks(c, b, r) {
    // a pale green stockroom wall with a long noticeboard, and a low shelf of books
    c.fillStyle = '#e3e8d6'; c.fillRect(b.x0, b.y0, b.x1 - b.x0, 500 - b.y0);
    c.fillStyle = 'rgba(111,154,106,0.13)'; for (let x = Math.floor(b.x0 / 30) * 30; x < b.x1; x += 30) c.fillRect(x, b.y0, 12, 500 - b.y0);
    c.fillStyle = 'rgba(60,40,20,0.18)'; c.fillRect(3, 34, 358, 160);
    c.fillStyle = '#8a6a4a'; c.fillRect(0, 30, 360, 160);
    c.fillStyle = '#d6ab79'; c.fillRect(6, 36, 348, 148);
    for (let i = 0; i < 260; i++) dot(c, 8 + r() * 344, 38 + r() * 144, 0.5 + r() * 0.9, ['#b98a5c', '#c0935f', '#e6c091', '#a87c50'][Math.floor(r() * 4)]);
    // the low shelf of books under it
    const sy = 246, cols = ['#c9474f', '#3d5a86', '#6f9a6a', '#d98b63', '#f2d88a', '#bba9df', '#a6d3d4'];
    c.fillStyle = '#6b4a32'; c.fillRect(b.x0, sy - 44, b.x1 - b.x0, 46);
    for (let x = b.x0 + 2; x < b.x1 - 4;) {
      const w = 7 + r() * 8, h = 26 + r() * 14;
      c.fillStyle = cols[Math.floor(r() * cols.length)]; c.fillRect(x, sy - h, w - 1, h);
      c.fillStyle = 'rgba(255,250,241,0.4)'; c.fillRect(x + 1, sy - h + 4, w - 3, 1.6);
      x += w;
    }
    c.fillStyle = '#a47a49'; c.fillRect(b.x0, sy, b.x1 - b.x0, 7); c.fillStyle = 'rgba(60,40,20,0.2)'; c.fillRect(b.x0, sy + 7, b.x1 - b.x0, 3);
    // the floor
    c.fillStyle = '#9c7a52'; c.fillRect(b.x0, 492, b.x1 - b.x0, 8);
    c.fillStyle = '#b98f5a'; c.fillRect(b.x0, 500, b.x1 - b.x0, b.y1 - 500);
    grain(c, r, b.x0, 500, b.x1 - b.x0, b.y1 - 500, 'rgba(110,70,35,0.2)');
    for (let y = 513; y < b.y1; y += 14) { c.fillStyle = 'rgba(90,55,25,0.22)'; c.fillRect(b.x0, y, b.x1 - b.x0, 1.2); }
  }
  function roomHalt(c, b, r) {
    // cream plaster above a wine-red rail, tongue-and-groove boards below, a peg rail for the labels
    c.fillStyle = '#f1e5cf'; c.fillRect(b.x0, b.y0, b.x1 - b.x0, 250 - b.y0);
    c.fillStyle = '#e8d6b6'; c.fillRect(b.x0, 250, b.x1 - b.x0, DESK_Y - 250);
    c.fillStyle = 'rgba(150,110,65,0.2)'; for (let x = Math.floor(b.x0 / 18) * 18; x < b.x1; x += 18) c.fillRect(x, 250, 1.4, DESK_Y - 250);
    c.fillStyle = '#9b3b44'; c.fillRect(b.x0, 244, b.x1 - b.x0, 8); c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(b.x0, 244, b.x1 - b.x0, 1.5);
    c.fillStyle = 'rgba(60,40,20,0.18)'; c.fillRect(b.x0, 31, b.x1 - b.x0, 4);
    c.fillStyle = '#8a6142'; c.fillRect(b.x0, 22, b.x1 - b.x0, 10); c.fillStyle = 'rgba(255,230,190,0.3)'; c.fillRect(b.x0, 22, b.x1 - b.x0, 1.4);
    // the counter
    c.fillStyle = 'rgba(40,30,20,0.18)'; c.fillRect(b.x0, DESK_Y + 34, b.x1 - b.x0, 8);
    c.fillStyle = '#d4ae7b'; c.fillRect(b.x0, DESK_Y, b.x1 - b.x0, 12);
    c.fillStyle = 'rgba(255,240,210,0.4)'; c.fillRect(b.x0, DESK_Y, b.x1 - b.x0, 1.5);
    c.fillStyle = '#a77d4b'; c.fillRect(b.x0, DESK_Y + 12, b.x1 - b.x0, b.y1 - DESK_Y - 12);
    grain(c, r, b.x0, DESK_Y + 14, b.x1 - b.x0, b.y1 - DESK_Y - 14, 'rgba(80,50,20,0.2)');
  }
  const ROOMS = { curio: roomCurio, attic: roomAttic, books: roomBooks, halt: roomHalt };

  // ------------------------------------------------------------ the pictures
  // where a picture's sign sits, by how it hangs
  const badgeY = (style) => FY0 + (style === 'label' ? 30 : 21);
  function hangPicture(c, style, x, sgn, r, draw) {
    const x0 = x - FW / 2, y0 = FY0, x1 = x + FW / 2, y1 = FY0 + FH;
    if (style === 'gilt') {
      // a cord up to the picture rail and a gold frame
      ln(c, [x - 26, y0 + 6, x, 31, x + 26, y0 + 6], '#b5a184', 1.2); dot(c, x, 30, 2.4, '#c9a14a');
      c.fillStyle = 'rgba(15,25,15,0.35)'; c.fillRect(x0 + 3, y0 + 4, FW, FH);
      c.fillStyle = '#9c7a26'; c.fillRect(x0, y0, FW, FH);
      c.fillStyle = '#e2c25a'; c.fillRect(x0 + 1.6, y0 + 1.6, FW - 3.2, FH - 3.2);
      c.fillStyle = '#c9a14a'; c.fillRect(x0 + 4, y0 + 4, FW - 8, FH - 8);
      c.fillStyle = '#9c7a26'; c.fillRect(x0 + 7.5, y0 + 7.5, FW - 15, FH - 15);
      c.fillStyle = 'rgba(255,240,180,0.55)';
      for (let k = x0 + 7; k < x1 - 5; k += 6) { c.beginPath(); c.arc(k, y0 + 2.8, 0.9, 0, TAU); c.arc(k, y1 - 2.8, 0.9, 0, TAU); c.fill(); }
      c.fillStyle = '#f6efe3'; c.fillRect(x0 + 9, y0 + 9, FW - 18, FH - 18);
    } else if (style === 'wood') {
      ln(c, [x - 22, y0 + 6, x, 25, x + 22, y0 + 6], '#8a7a62', 1.1); dot(c, x, 25, 2, '#6b6157');
      c.fillStyle = 'rgba(60,40,20,0.22)'; c.fillRect(x0 + 3, y0 + 4, FW, FH);
      c.fillStyle = '#6b4a32'; c.fillRect(x0, y0, FW, FH);
      grain(c, r, x0, y0, FW, FH, 'rgba(30,15,5,0.25)', 30);
      c.fillStyle = 'rgba(255,230,190,0.18)'; c.fillRect(x0, y0, FW, 1.6);
      c.fillStyle = '#f3ead6'; c.fillRect(x0 + 7, y0 + 7, FW - 14, FH - 14);
    } else if (style === 'card') {
      c.save(); c.translate(x, y0 + FH / 2); c.rotate((r() - 0.5) * 0.05); c.translate(-x, -(y0 + FH / 2));
      c.fillStyle = 'rgba(60,40,20,0.2)'; c.fillRect(x0 + 2, y0 + 3, FW, FH);
      c.fillStyle = '#fffaf1'; c.fillRect(x0, y0, FW, FH);
      c.strokeStyle = 'rgba(201,71,79,0.3)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y0 + 36); c.lineTo(x1, y0 + 36); c.stroke();
      c.strokeStyle = 'rgba(160,140,110,0.4)'; c.strokeRect(x0 + 0.5, y0 + 0.5, FW - 1, FH - 1);
      c.restore();
    } else {
      // a luggage label on a string from a peg
      dot(c, x, 27, 3.6, '#c9a14a'); dot(c, x - 1, 26, 1.2, '#f6e2a0');
      ln(c, [x, 28, x - 5, y0 + 12, x + 5, y0 + 12, x, 28], '#b5a184', 1.1);
      const lab = new Path2D();
      lab.moveTo(x0 + 14, y0); lab.lineTo(x1 - 14, y0); lab.lineTo(x1, y0 + 14); lab.lineTo(x1, y1); lab.lineTo(x0, y1); lab.lineTo(x0, y0 + 14); lab.closePath();
      c.save(); c.translate(3, 4); c.fillStyle = 'rgba(60,40,20,0.2)'; c.fill(lab); c.restore();
      c.fillStyle = '#f1dcb4'; c.fill(lab); c.strokeStyle = 'rgba(140,100,50,0.45)'; c.lineWidth = 1.2; c.stroke(lab);
      dot(c, x, y0 + 12, 6.4, '#d9b98a'); dot(c, x, y0 + 12, 3.6, '#efe1c4');
      c.strokeStyle = 'rgba(155,59,68,0.5)'; c.lineWidth = 1; c.strokeRect(x0 + 6, y0 + 44, FW - 12, FH - 48);
    }
    const by = badgeY(style);
    if (style === 'card') {
      // a red pin holds the card, its sign just under it
      dot(c, x + 1, y0 + 2, 4, 'rgba(60,40,20,0.25)'); dot(c, x, y0, 4.4, '#c9474f'); dot(c, x - 1.2, y0 - 1.2, 1.4, '#f6c6c4');
    }
    badge(c, sgn, x, by, 11.5);
    draw(c, x, PIC(style));
  }
  // the middle of what a picture shows
  const PIC = (style) => FY0 + (style === 'label' ? 88 : 82);

  // what one picture shows: things to count, two dice or a picture for a letter
  function showClue(c, clue, x, y) {
    if (clue.kind === 'dice') {
      die(c, clue.a, x - 22, y, 30, clue.rotA);
      die(c, clue.b, x + 22, y, 30, clue.rotB);
      PZ.text(c, '+', x, y - 1, { size: 15, weight: 900, color: INK2 });
      return;
    }
    if (clue.kind === 'letter') {
      c.fillStyle = 'rgba(232,220,198,0.5)'; c.beginPath(); c.arc(x, y + 2, 31, 0, TAU); c.fill();
      PZ.emoji(c, PICS[clue.letter], x, y, 44);
      return;
    }
    const rows = rowsOf(clue.n, x, y), k = sizeOf(clue.n);
    if (clue.thing === 'bird' || clue.thing === 'fish') {
      // a little sky for the birds, a little pond for the fish
      c.fillStyle = clue.thing === 'bird' ? 'rgba(170,210,235,0.35)' : 'rgba(150,200,220,0.35)';
      PZ.rr(c, x - 40, y - 40, 80, 80, 8); c.fill();
    }
    for (const row of rows) {
      // birds sit on a wire, candles stand on a shelf
      if (clue.thing === 'bird') ln(c, [x - 40, row.y + 8.6 * k, x + 40, row.y + 8.6 * k], 'rgba(80,70,60,0.55)', 1);
      if (clue.thing === 'candle') { c.fillStyle = '#b98f5a'; c.fillRect(x - 40, row.y + 9.5 * k, 80, 3); }
      for (const px of row.xs) { c.save(); c.translate(px, row.y); c.scale(k, k); THINGS[clue.thing](c); c.restore(); }
    }
  }

  // ------------------------------------------------------------ the boxes
  // the body stays put (decor); the lid lifts (drawn every frame)
  function bodyOf(c, what, r) {
    const { x0, x1, y0, y1 } = BODY, w = x1 - x0, h = y1 - y0;
    PZ.shadow(c, 180, y1 + 3, 156, 7, 0.3);
    if (what === 'box') {
      for (const fx of [x0 + 18, x1 - 18]) oval(c, fx, y1 + 1, 13, 6, 0, '#4a2a18');
      c.fillStyle = '#7a4a2e'; c.fillRect(x0, y0, w, h);
      grain(c, r, x0, y0, w, h, 'rgba(40,20,8,0.24)');
      c.fillStyle = 'rgba(255,220,170,0.22)'; c.fillRect(x0, y0, w, 2);
      c.strokeStyle = 'rgba(30,15,5,0.3)'; c.lineWidth = 1.4; c.strokeRect(x0 + 8, y0 + 8, w - 16, h - 16);
      c.fillStyle = '#5e3420'; c.fillRect(x0, y1 - 12, w, 12);
      corners(c, x0, y0, x1, y1, '#c9a14a', '#9c7a26');
    } else if (what === 'trunk') {
      c.fillStyle = '#7a3f2e'; c.fillRect(x0, y0, w, h);
      grain(c, r, x0, y0, w, h, 'rgba(40,15,8,0.2)', 60);
      // wooden slats across, and leather straps down
      for (const y of [y0 + 22, y1 - 24]) { c.fillStyle = '#a8784a'; c.fillRect(x0, y - 5, w, 10); c.fillStyle = 'rgba(255,230,190,0.25)'; c.fillRect(x0, y - 5, w, 1.4); for (let x = x0 + 12; x < x1; x += 34) dot(c, x, y, 1.4, '#6b4a32'); }
      for (const sx of [x0 + 24, x1 - 24]) { c.fillStyle = '#5a3420'; c.fillRect(sx - 9, y0, 18, h); c.fillStyle = 'rgba(255,220,180,0.16)'; c.fillRect(sx - 9, y0, 2, h); ln(c, [sx - 6, y0, sx - 6, y1], 'rgba(255,230,190,0.25)', 0.8); }
      corners(c, x0, y0, x1, y1, '#c9a14a', '#9c7a26');
    } else if (what === 'chest') {
      c.fillStyle = '#a8784a'; c.fillRect(x0, y0, w, h);
      for (let x = x0 + 40; x < x1; x += 40) { c.fillStyle = 'rgba(80,50,20,0.28)'; c.fillRect(x, y0, 1.6, h); }
      grain(c, r, x0, y0, w, h, 'rgba(90,55,20,0.2)');
      // iron bands, with rivets
      for (const bx of [x0 + 18, x1 - 18]) { c.fillStyle = '#4b4a52'; c.fillRect(bx - 8, y0, 16, h); for (let y = y0 + 12; y < y1; y += 26) dot(c, bx, y, 2, '#8d8f93'); }
      c.fillStyle = '#4b4a52'; c.fillRect(x0, y1 - 18, w, 12); for (let x = x0 + 30; x < x1 - 20; x += 30) dot(c, x, y1 - 12, 1.8, '#8d8f93');
      c.fillStyle = 'rgba(255,230,190,0.2)'; c.fillRect(x0, y0, w, 2);
    } else {
      // a leather suitcase with stitching, corner caps and two brass catches
      c.fillStyle = '#b5793f'; PZ.rr(c, x0, y0 - 4, w, h + 4, 10); c.fill();
      c.fillStyle = 'rgba(90,50,20,0.22)'; c.fillRect(x0, y1 - 26, w, 20);
      c.strokeStyle = 'rgba(255,235,200,0.55)'; c.lineWidth = 1; c.setLineDash([3, 3]); PZ.rr(c, x0 + 7, y0 + 3, w - 14, h - 14, 6); c.stroke(); c.setLineDash([]);
      for (const [cx, cy, a] of [[x0, y1, 0], [x1, y1, 1]]) {
        c.fillStyle = '#7a4a2e'; c.beginPath(); c.moveTo(cx, cy - 26); c.quadraticCurveTo(cx, cy, cx + (a ? -26 : 26), cy); c.lineTo(cx, cy); c.closePath(); c.fill();
      }
      for (const lx of [x0 + 30, x1 - 30]) { c.fillStyle = '#c9a14a'; PZ.rr(c, lx - 11, y0 + 2, 22, 22, 4); c.fill(); c.fillStyle = '#9c7a26'; PZ.rr(c, lx - 6, y0 + 7, 12, 12, 2); c.fill(); }
    }
  }
  function corners(c, x0, y0, x1, y1, col, deep) {
    for (const [cx, cy, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
      c.fillStyle = col; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + sx * 26, cy); c.lineTo(cx + sx * 26, cy + sy * 7); c.lineTo(cx + sx * 7, cy + sy * 7); c.lineTo(cx + sx * 7, cy + sy * 26); c.lineTo(cx, cy + sy * 26); c.closePath(); c.fill();
      dot(c, cx + sx * 4, cy + sy * 4, 1.6, deep); dot(c, cx + sx * 19, cy + sy * 3.5, 1.2, deep); dot(c, cx + sx * 3.5, cy + sy * 19, 1.2, deep);
    }
  }
  // the brass plate with the three dials' windows, their arrows and signs
  function plate(c, dials) {
    const { x0, x1, y0, y1 } = PLATE;
    c.fillStyle = 'rgba(40,25,10,0.3)'; PZ.rr(c, x0 + 3, y0 + 4, x1 - x0, y1 - y0, 12); c.fill();
    c.fillStyle = '#a8842a'; PZ.rr(c, x0, y0, x1 - x0, y1 - y0, 12); c.fill();
    c.fillStyle = '#d9b44a'; PZ.rr(c, x0 + 2, y0 + 2, x1 - x0 - 4, y1 - y0 - 5, 10); c.fill();
    c.strokeStyle = 'rgba(120,90,20,0.55)'; c.lineWidth = 1.2; PZ.rr(c, x0 + 8, y0 + 8, x1 - x0 - 16, y1 - y0 - 16, 7); c.stroke();
    c.fillStyle = 'rgba(255,245,200,0.35)'; c.fillRect(x0 + 12, y0 + 3, x1 - x0 - 24, 2);
    for (const [sx, sy] of [[x0 + 14, y0 + 14], [x1 - 14, y0 + 14], [x0 + 14, y1 - 14], [x1 - 14, y1 - 14]]) { dot(c, sx, sy, 3.4, '#9c7a26'); ln(c, [sx - 2.2, sy - 2.2, sx + 2.2, sy + 2.2], '#6b5418', 1); }
    for (const d of dials) {
      c.fillStyle = '#3b2a1a'; PZ.rr(c, d.x - WIN_W / 2 - 4, DY - WIN_H / 2 - 4, WIN_W + 8, WIN_H + 8, 9); c.fill();
      arrow(c, d.x, DY - 49, -1, 'rgba(90,65,15,0.75)');
      arrow(c, d.x, DY + 49, 1, 'rgba(90,65,15,0.75)');
      badge(c, d.sign, d.x, DY + 76, 12);
    }
  }
  // an engraved arrow on the plate: up (-1) or down (1)
  function arrow(c, x, y, dir, col) {
    c.fillStyle = col; c.beginPath(); c.moveTo(x, y + dir * 6); c.lineTo(x - 9, y - dir * 4); c.lineTo(x + 9, y - dir * 4); c.closePath(); c.fill();
  }
  // The lid at k (0 shut, 1 open), hinged at the back: first its front tips
  // away, getting shorter as it goes over, then its lined underside stands
  // up behind the box. DEPTH is how far back the hinge sits.
  const DEPTH = 30;
  const EDGE = { box: '#86523a', trunk: '#86452f', chest: '#b5864f', case: '#c0854a' };
  function lid(c, what, k, lining) {
    const x0 = LID.x0, x1 = LID.x1, w = x1 - x0, lh = BODY.y0 - LID.y0, back = BODY.y0 - DEPTH;
    if (k > 0.5) {
      const a = (k - 0.5) / 0.5, top = back - lh * a;
      if (a < 0.02) return;
      const panel = new Path2D();
      if (what === 'trunk') { panel.moveTo(x0, back); panel.lineTo(x0, top + 16 * a); panel.quadraticCurveTo(180, top - 22 * a, x1, top + 16 * a); panel.lineTo(x1, back); panel.closePath(); }
      else if (what === 'case') panel.roundRect(x0 + 6, top, w - 12, back - top + 6, [10, 10, 0, 0]);
      else panel.rect(x0, top, w, back - top);
      PZ.shadow(c, 180, back + 1, w * 0.5, 3, 0.25);
      c.save(); c.clip(panel);
      c.fillStyle = lining; c.fillRect(x0, top - 30, w, back - top + 40);
      const sh = c.createLinearGradient(0, top, 0, back);
      sh.addColorStop(0, 'rgba(255,255,255,0.1)'); sh.addColorStop(1, 'rgba(20,10,10,0.35)');
      c.fillStyle = sh; c.fillRect(x0, top - 30, w, back - top + 40);
      // a quilted lining: little buttons in rows
      for (let yy = top + 18; yy < back - 6; yy += 16) for (let xx = x0 + 30 + ((yy - top) % 32 ? 14 : 0); xx < x1 - 20; xx += 28) dot(c, xx, yy, 1.6, 'rgba(0,0,0,0.22)');
      // the wood round its edge
      c.strokeStyle = EDGE[what]; c.lineWidth = 14; c.stroke(panel);
      c.strokeStyle = 'rgba(255,230,190,0.25)'; c.lineWidth = 2; c.stroke(panel);
      c.restore();
      return;
    }
    const a = k / 0.5, bot = BODY.y0 - DEPTH * a, h = lh * (1 - a), top = bot - h;
    if (h < 0.5) return;
    if (what === 'case') {
      // the handle on top
      const hh = 22 * (1 - a);
      c.strokeStyle = '#6b3f22'; c.lineWidth = 8; c.lineCap = 'round';
      c.beginPath(); c.moveTo(146, top + 2); c.lineTo(150, top - hh); c.lineTo(210, top - hh); c.lineTo(214, top + 2); c.stroke();
      c.strokeStyle = 'rgba(255,220,180,0.3)'; c.lineWidth = 2; c.beginPath(); c.moveTo(152, top - hh - 1); c.lineTo(208, top - hh - 1); c.stroke();
      for (const hx of [146, 214]) { c.fillStyle = '#c9a14a'; c.fillRect(hx - 5, top - 2, 10, 6); }
    }
    c.save(); c.translate(0, top); c.scale(1, h / lh); c.translate(0, -LID.y0);
    const y0 = LID.y0, y1 = BODY.y0;
    PZ.shadow(c, 180, y1 + 2, w * 0.5, 4, 0.25);
    if (what === 'box') {
      c.fillStyle = '#86523a'; c.fillRect(x0, y0, w, lh);
      c.fillStyle = '#9a6244'; c.fillRect(x0 + 4, y0 + 4, w - 8, lh - 14);
      c.fillStyle = 'rgba(255,220,170,0.3)'; c.fillRect(x0, y0, w, 2);
      c.fillStyle = '#5e3420'; c.fillRect(x0, y1 - 8, w, 8);
      c.strokeStyle = 'rgba(30,15,5,0.3)'; c.lineWidth = 1.2; c.strokeRect(x0 + 12, y0 + 12, w - 24, lh - 30);
      for (const cx of [x0, x1]) { c.fillStyle = '#c9a14a'; c.fillRect(cx - (cx === x0 ? 0 : 22), y0, 22, 7); c.fillRect(cx - (cx === x0 ? 0 : 7), y0, 7, 22); }
    } else if (what === 'trunk') {
      // domed: the front's top edge curves up
      c.fillStyle = '#86452f';
      c.beginPath(); c.moveTo(x0, y1); c.lineTo(x0, y0 + 16); c.quadraticCurveTo(180, y0 - 26, x1, y0 + 16); c.lineTo(x1, y1); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,220,180,0.22)'; c.beginPath(); c.moveTo(x0 + 6, y0 + 16); c.quadraticCurveTo(180, y0 - 20, x1 - 6, y0 + 16); c.lineTo(x1 - 6, y0 + 20); c.quadraticCurveTo(180, y0 - 14, x0 + 6, y0 + 20); c.closePath(); c.fill();
      c.fillStyle = '#a8784a'; c.fillRect(x0, y1 - 14, w, 9);
      for (const sx of [x0 + 30, x1 - 30]) {
        c.fillStyle = '#5a3420'; c.fillRect(sx - 9, y0 + 2, 18, lh - 2);
        c.strokeStyle = '#c9a14a'; c.lineWidth = 2.4; c.strokeRect(sx - 11, y1 - 30, 22, 16); ln(c, [sx, y1 - 30, sx, y1 - 14], '#c9a14a', 2);
      }
    } else if (what === 'chest') {
      c.fillStyle = '#b5864f'; c.fillRect(x0, y0, w, lh);
      for (let x = x0 + 40; x < x1; x += 40) { c.fillStyle = 'rgba(80,50,20,0.25)'; c.fillRect(x, y0, 1.6, lh); }
      c.fillStyle = 'rgba(255,230,190,0.28)'; c.fillRect(x0, y0, w, 2);
      c.fillStyle = '#4b4a52'; c.fillRect(x0, y0 + lh * 0.42, w, 11);
      for (let x = x0 + 16; x < x1 - 8; x += 26) dot(c, x, y0 + lh * 0.42 + 5.5, 1.8, '#8d8f93');
      for (const bx of [x0 + 16, x1 - 16]) { c.fillStyle = '#4b4a52'; c.fillRect(bx - 8, y0, 16, lh); }
      c.fillStyle = '#7a5232'; c.fillRect(x0, y1 - 6, w, 6);
    } else {
      c.fillStyle = '#c0854a'; PZ.rr(c, x0 + 6, y0, w - 12, lh, 10); c.fill();
      c.strokeStyle = 'rgba(255,235,200,0.55)'; c.lineWidth = 1; c.setLineDash([3, 3]); PZ.rr(c, x0 + 13, y0 + 6, w - 26, lh - 14, 6); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#8a5a3a'; c.fillRect(x0 + 6, y1 - 6, w - 12, 6);
      for (const lx of [x0 + 36, x1 - 36]) { c.fillStyle = '#c9a14a'; PZ.rr(c, lx - 8, y1 - 14, 16, 14, 3); c.fill(); }
    }
    c.restore();
  }

  // ------------------------------------------------------------ the puzzle
  function lock(S) {
    const r = S.r, o = S.opts || {};
    const what = STYLES[o.what] ? o.what : 'box', V = STYLES[what];
    const mode = o.dials === 'letters' ? 'letters' : o.dice ? 'dice' : 'count';
    const N = mode === 'letters' ? 6 : 10;
    // the signs go on the dials in any order, and the pictures hang in another
    const signs = PZ.shuffle(r, SIGNS.slice());
    let place = PZ.shuffle(r, [0, 1, 2]);
    if (place.every((p, i) => p === i)) place = [place[1], place[2], place[0]];
    // what each dial wants, and what its picture shows
    let clues;
    if (mode === 'letters') {
      const word = WORDS[Math.floor(r() * WORDS.length)];
      clues = [...word].map((letter) => ({ kind: 'letter', letter }));
    } else if (mode === 'dice') {
      const sums = PZ.shuffle(r, [2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
      clues = sums.map((s) => { const lo = Math.max(1, s - 6), hi = Math.min(6, s - 1), a = lo + Math.floor(r() * (hi - lo + 1)); return { kind: 'dice', n: s, a, b: s - a, rotA: (r() - 0.5) * 0.3, rotB: (r() - 0.5) * 0.3 }; });
    } else {
      const ns = PZ.shuffle(r, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3), things = PZ.shuffle(r, THING_IDS.slice());
      clues = ns.map((n, i) => ({ kind: 'count', n, thing: things[i] }));
    }
    const dials = DX.map((x, i) => {
      const clue = clues[i];
      let letters = null, target;
      if (mode === 'letters') {
        const others = PZ.shuffle(r, [...ALPHA].filter((ch) => ch !== clue.letter)).slice(0, N - 1);
        letters = others.concat([clue.letter]).sort();
        target = letters.indexOf(clue.letter);
      } else target = clue.n;
      // it starts a few turns away, one way or the other (never on its number)
      const dist = 1 + Math.floor(r() * (mode === 'letters' ? 3 : 4)), dir = r() < 0.5 ? -1 : 1;
      const v = mod(target - dir * dist, N);
      return { i, x, sign: signs[i], frame: place[i], clue, letters, target, turn: v, value: v, shown: v, rest: 0, settled: true, paid: false, held: false, press: null, ring: 0 };
    });
    const label = (d, k) => (d.letters ? d.letters[mod(k, N)] : String(mod(k, N)));
    const right = (d) => d.settled && d.value === d.target;
    // the shortest way round to its number: + is up, - is down
    const way = (d) => { let s = mod(d.target - d.value, N); if (s > N / 2) s -= N; return s; };
    const seedDecor = Math.floor(r() * 1e9);
    let fx = null, g = null, hint = null, hintT = 0, opened = false, openK = 0, clock = 0;

    function turn(d, s) {
      d.turn += s; d.value = mod(d.turn, N);
      d.settled = false; d.rest = REST; d.press = { s, t: 0.2 };
      fx.sound('turn');
    }
    // a dial that has come to rest on its number: it pays the first time,
    // and the last of the three opens the lid
    function settle(d) {
      d.settled = true;
      if (d.value !== d.target) return;
      d.ring = 1;
      if (!d.paid) {
        d.paid = true;
        const last = dials.every((e) => e === d || (right(e) && e.paid));
        if (last) fx.good(180, BODY.y0 - 10); else { fx.sound('clink'); fx.good(d.x, DY); }
      }
      if (!opened && dials.every((e) => right(e) && e.paid)) { opened = true; fx.sound('chime'); }
    }
    const dialAt = (x, y) => dials.find((d) => Math.abs(x - d.x) < HIT_X && Math.abs(y - DY) < HIT_Y) || null;

    const sc = {
      puzzle: true, indoor: true, steps: 3,
      crop: { x: 0, y: 186, w: 360, h: 360 }, // the box with its lid and dials
      decor(c) {
        const b = S.bleed, rr = rng(seedDecor);
        ROOMS[V.room](c, b, rr);
        // the three pictures, each with its dial's sign
        for (const d of dials) hangPicture(c, V.frame, FX[d.frame], d.sign, rr, (cc, x, y) => showClue(cc, d.clue, x, y));
        bodyOf(c, what, rr);
        plate(c, dials);
        // above it all: what to do
        c.fillStyle = 'rgba(255,250,241,0.88)'; c.fillRect(b.x0, b.y0, b.x1 - b.x0, 18 - b.y0);
        c.fillStyle = 'rgba(120,90,60,0.25)'; c.fillRect(b.x0, 16.5, b.x1 - b.x0, 1.5);
        const say = mode === 'letters' ? 'Each dial takes the first letter of its picture' : mode === 'dice' ? 'Add up the dice, then turn the dial with that sign' : 'Count each picture, then turn the dial with its sign';
        PZ.text(c, say, 180, 8, { size: 12.5, color: INK2, maxW: 344 });
      },
      draw(c, t, still) {
        // the inside, as the lid lifts: a lining in shadow and something that glints
        const k = still && opened ? 1 : openK;
        if (k > 0.01) {
          const top = BODY.y0 - DEPTH * Math.min(1, k / 0.5) - 2, x0 = LID.x0 + 8, x1 = LID.x1 - 8;
          c.fillStyle = V.lining; c.fillRect(x0, top, x1 - x0, BODY.y0 + 1 - top);
          const sh = c.createLinearGradient(0, top, 0, BODY.y0 + 1);
          sh.addColorStop(0, 'rgba(20,10,10,0.55)'); sh.addColorStop(1, 'rgba(20,10,10,0.05)');
          c.fillStyle = sh; c.fillRect(x0, top, x1 - x0, BODY.y0 + 1 - top);
          c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 2;
          for (let x = x0 + 20; x < x1; x += 34) { c.beginPath(); c.moveTo(x, BODY.y0); c.quadraticCurveTo(x + 8, (top + BODY.y0) / 2, x + 2, top + 4); c.stroke(); }
          if (k > 0.5) {
            const a = Math.min(1, (k - 0.5) / 0.4), s = 7 + (still ? 0 : Math.sin(t * 5) * 2);
            c.save(); c.globalAlpha = a; c.translate(180, BODY.y0 - 14);
            c.fillStyle = '#fff3c4'; c.beginPath();
            for (let i = 0; i < 8; i++) { const ang = (i * Math.PI) / 4, rr = i % 2 ? s * 0.32 : s; c.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr); }
            c.closePath(); c.fill();
            c.fillStyle = 'rgba(255,230,140,0.35)'; c.beginPath(); c.arc(0, 0, s * 1.8, 0, TAU); c.fill();
            c.restore();
          }
        }
        lid(c, what, k, V.lining);
        if (hint && hintT > 0 && !still) {
          PZ.glow(c, hint.x, DY, 42, t);
          PZ.glow(c, FX[hint.frame], FY0 + FH / 2, 66, t);
        }
        for (const d of dials) {
          // the arrow pressed a moment ago lights up
          if (d.press && !still) {
            const a = d.press.t / 0.2;
            arrow(c, d.x, DY - d.press.s * 49, -d.press.s, `rgba(255,248,214,${(0.9 * a).toFixed(3)})`);
          }
          const x = d.x, y0 = DY - WIN_H / 2;
          c.save();
          PZ.rr(c, x - WIN_W / 2, y0, WIN_W, WIN_H, 7); c.clip();
          const gr = c.createLinearGradient(0, y0, 0, y0 + WIN_H);
          gr.addColorStop(0, '#7a6a52'); gr.addColorStop(0.24, '#ebdfc6'); gr.addColorStop(0.5, '#fffaf1'); gr.addColorStop(0.76, '#ebdfc6'); gr.addColorStop(1, '#7a6a52');
          c.fillStyle = gr; c.fillRect(x - WIN_W / 2, y0, WIN_W, WIN_H);
          const shown = still ? d.turn : d.shown;
          for (let n = Math.floor(shown) - 1; n <= Math.ceil(shown) + 1; n++) {
            const off = (n - shown) * ROW, fade = Math.max(0, 1 - Math.abs(off) / (ROW * 1.3));
            if (fade <= 0) continue;
            c.save(); c.globalAlpha = 0.22 + 0.78 * fade; c.translate(x, DY - off); c.scale(1, 0.5 + 0.5 * fade);
            PZ.text(c, label(d, n), 0, 1.5, { size: 30, weight: 900, color: INK });
            c.restore();
          }
          // the wheel's edges in shadow
          const ed = c.createLinearGradient(0, y0, 0, y0 + WIN_H);
          ed.addColorStop(0, 'rgba(40,25,10,0.45)'); ed.addColorStop(0.2, 'rgba(40,25,10,0)'); ed.addColorStop(0.8, 'rgba(40,25,10,0)'); ed.addColorStop(1, 'rgba(40,25,10,0.45)');
          c.fillStyle = ed; c.fillRect(x - WIN_W / 2, y0, WIN_W, WIN_H);
          c.restore();
          // the rim: gold once the dial is right
          const ok = right(d);
          c.strokeStyle = ok ? '#e9bf4f' : 'rgba(59,53,46,0.55)'; c.lineWidth = ok ? 3.2 : 1.4;
          PZ.rr(c, x - WIN_W / 2 - 1, y0 - 1, WIN_W + 2, WIN_H + 2, 8); c.stroke();
          if (ok && d.ring > 0 && !still) {
            c.strokeStyle = `rgba(255,236,150,${(0.8 * d.ring).toFixed(3)})`; c.lineWidth = 2;
            const gx = 4 + (1 - d.ring) * 12;
            PZ.rr(c, x - WIN_W / 2 - gx, y0 - gx, WIN_W + gx * 2, WIN_H + gx * 2, 10); c.stroke();
          }
        }
      },
      step(dt) {
        clock += dt; hintT -= dt;
        for (const d of dials) {
          d.shown = PZ.approach(d.shown, d.turn, dt, 16);
          if (d.press) { d.press.t -= dt; if (d.press.t <= 0) d.press = null; }
          if (d.ring > 0) d.ring = Math.max(0, d.ring - dt * 1.6);
          if (!d.held && !d.settled) { d.rest -= dt; if (d.rest <= 0) { d.rest = 0; settle(d); } }
        }
        if (opened) openK = PZ.approach(openK, 1, dt, 4);
      },
      down(x, y) {
        if (g || opened) return;
        const d = dialAt(x, y);
        if (!d) return;
        g = { d, y0: y, last: y, moved: false };
        d.held = true;
      },
      move(x, y) {
        if (!g) return;
        if (!g.moved && Math.abs(y - g.y0) > 10) g.moved = true;
        if (!g.moved) return;
        // rolling the wheel: pulling it down brings the next number in
        while (y - g.last >= DRAG) { turn(g.d, 1); g.last += DRAG; }
        while (g.last - y >= DRAG) { turn(g.d, -1); g.last -= DRAG; }
      },
      up() {
        if (!g) return;
        const d = g.d;
        if (!g.moved) turn(d, g.y0 < DY ? 1 : -1);
        d.held = false; g = null;
      },
      cancel() { if (g) { g.d.held = false; g = null; } },
      progress: () => dials.filter(right).length / 3,
      solved: () => opened,
      hint() { hint = dials.find((d) => d.value !== d.target) || null; hintT = 3.5; },
      save: () => ({ v: dials.map((d) => d.value), p: dials.map((d) => (d.paid ? 1 : 0)) }),
      load(s) {
        if (!s || !Array.isArray(s.v) || !Array.isArray(s.p)) return;
        dials.forEach((d, i) => {
          const v = s.v[i];
          if (!Number.isInteger(v) || v < 0 || v >= N) return;
          d.turn = d.value = d.shown = v; d.settled = true; d.rest = 0;
          // a dial left right a moment before it clicked is counted as paid; the engine pays the rest at the end
          d.paid = !!s.p[i] || v === d.target;
        });
        if (dials.every((d) => right(d) && d.paid)) { opened = true; openK = 1; }
      },
      solveAll() {
        for (const d of dials) { d.turn = d.value = d.shown = d.target; d.settled = true; d.rest = 0; d.paid = true; }
        opened = true; openK = 1;
      },
      // finger positions: taps on the top or bottom half of each dial, the
      // shortest way round, the dial with the fewest turns first
      debugPlan() {
        const plan = [];
        for (const d of dials.slice().sort((a, b) => Math.abs(way(a)) - Math.abs(way(b)))) {
          const s = way(d);
          for (let k = 0; k < Math.abs(s); k++) plan.push({ tap: [d.x, s > 0 ? DY - 34 : DY + 34] });
        }
        return plan;
      },
    };
    Object.defineProperty(sc, 'fx', { get: () => fx, set: (v) => { fx = v; } });
    return sc;
  }

  Object.assign(SCENES.KINDS, { lock });
})();
