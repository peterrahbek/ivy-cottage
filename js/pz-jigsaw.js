'use strict';
// The jigsaw, a thinking job at Marchbank's Curiosities. Nine pieces of a
// postcard lie in the open box lid, and a faint copy of the picture is
// printed on the board. Drag a piece onto the board: let go near its own
// place and it clicks in, anywhere else it glides back to the lid. Nothing
// to turn and no timer. The postcard shows one of the places, drawn here
// in canvas: opts.where 'curio', 'cottage', 'cafe', 'cove', 'rescue',
// 'glasshouse', 'canal', 'books', 'pottery', 'halt', 'beads', 'stables', 'loft',
// 'observatory' (a night sky) or 'lido' (without it one is picked), and
// opts.season 'autumn' or 'winter' turns its trees and roofs to the season.
//   node test/run.mjs puzzle js/pz-jigsaw.js jigsaw --seeds 30 [--opts '{"where":"cove","season":"winter"}']

(() => {
  const INK = PZ.INK, INK2 = PZ.INK2, PAPER = PZ.PAPER;
  // the picture on the board, cut three by three
  const PX = 30, PY = 68, PW = 300, PH = 225, N = 3;
  const CW = PW / N, CH = PH / N, T = Math.min(CW, CH);
  const E = Math.ceil(T * 0.37) + 2;            // room round a piece for its knobs
  const LID = { x: 10, y: 310, w: 340, h: 282 }; // the box lid the pieces wait in
  const HOME_X = [68, 180, 292], HOME_Y = [358, 450, 542];
  const SK = 0.6;                                // and how small they are drawn there
  const SNAP = 24, RES = 2.5;
  const HINT_ORDER = [0, 2, 6, 8, 1, 3, 5, 7, 4]; // corners first, like a real jigsaw

  // ------------------------------------------------------------- DRAWING
  const fill = (c, col) => { c.fillStyle = col; c.fill(); };
  function poly(c, pts, col) { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); fill(c, col); }
  const rect = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const rrect = (c, x, y, w, h, rad, col) => { c.beginPath(); c.roundRect(x, y, w, h, rad); fill(c, col); };
  const oval = (c, x, y, rx, ry, col) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 7); fill(c, col); };
  const dot = (c, x, y, rad, col) => oval(c, x, y, rad, rad, col);
  function line(c, col, w, pts) {
    c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  }
  function word(c, s, x, y, size, col, weight = 900, font) {
    c.font = font ? `${weight} ${size}px ${font}` : PZ.font(size, weight);
    c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, x, y);
  }
  const SERIF = "Georgia,'Times New Roman',serif";

  // the season decides the sky, the grass and the trees
  const SEASONS = {
    summer: { sky: ['#9fd3ef', '#e9f4ee'], far: '#b5d6a1', near: '#9cc785', grass: '#8cbd73', canopy: ['#5f9a4c', '#72ad5c', '#4f8a3c'], flowers: ['#ef8aa6', '#f7c548', '#ffffff', '#bba9df', '#e2574c'], sun: true },
    autumn: { sky: ['#efc39a', '#f8e8d4'], far: '#d9c690', near: '#cdb274', grass: '#bfa86a', canopy: ['#d9822b', '#c9592f', '#e6ad3c'], flowers: ['#e9962c', '#c9592f', '#f2d88a'], sun: true, leaves: true },
    winter: { sky: ['#bfcfdf', '#eef2f6'], far: '#eaf0f5', near: '#e0e9f0', grass: '#f3f6f9', canopy: null, flowers: null, snow: true },
  };
  const SNOW = '#f8fbfd';

  function sky(c, pal, r, o = {}) {
    const g = c.createLinearGradient(0, 0, 0, o.horizon || 160);
    g.addColorStop(0, pal.sky[0]); g.addColorStop(1, pal.sky[1]);
    c.fillStyle = g; c.fillRect(0, 0, PW, PH);
    const sx = o.sunX == null ? 252 : o.sunX;
    if (pal.sun && !o.noSun) {
      const s = c.createRadialGradient(sx, 34, 0, sx, 34, 30);
      s.addColorStop(0, '#fff6cf'); s.addColorStop(0.45, '#fde7a3'); s.addColorStop(1, 'rgba(253,231,163,0)');
      c.fillStyle = s; c.fillRect(sx - 30, 4, 60, 60);
      dot(c, sx, 34, 11, pal.leaves ? '#fbd98d' : '#fde9a6');
    }
    for (const [x, y, k] of o.clouds || [[70, 30, 1], [180, 20, 0.8]]) cloud(c, x, y, k, pal.snow ? '#f4f6f9' : '#ffffff');
    if (o.hills !== false) {
      c.beginPath(); c.moveTo(0, 120); c.bezierCurveTo(60, 92, 120, 104, 170, 98); c.bezierCurveTo(220, 92, 262, 84, PW, 104); c.lineTo(PW, PH); c.lineTo(0, PH); c.closePath(); fill(c, pal.far);
      c.beginPath(); c.moveTo(0, 138); c.bezierCurveTo(70, 118, 150, 132, 210, 122); c.bezierCurveTo(250, 116, 280, 120, PW, 126); c.lineTo(PW, PH); c.lineTo(0, PH); c.closePath(); fill(c, pal.near);
    }
  }
  function cloud(c, x, y, k, col) {
    c.globalAlpha = 0.85;
    oval(c, x, y, 20 * k, 7 * k, col); dot(c, x - 6 * k, y - 4 * k, 8 * k, col); dot(c, x + 7 * k, y - 5 * k, 10 * k, col);
    c.globalAlpha = 1;
  }
  // a round tree, or bare branches with snow on them in winter
  function tree(c, pal, x, base, h, r, fruit) {
    if (pal.canopy) {
      line(c, '#7a5638', h * 0.1, [[x, base], [x, base - h * 0.55]]);
      const cy = base - h * 0.72, rad = h * 0.3;
      dot(c, x, cy, rad, pal.canopy[2]);
      for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 + 0.4; dot(c, x + Math.cos(a) * rad * 0.55, cy + Math.sin(a) * rad * 0.45, rad * 0.62, pal.canopy[k % 2]); }
      dot(c, x - rad * 0.25, cy - rad * 0.3, rad * 0.45, pal.canopy[1]);
      if (fruit) for (let k = 0; k < 7; k++) dot(c, x + (r() - 0.5) * rad * 1.4, cy + (r() - 0.3) * rad, 1.8, pal.leaves ? '#e9962c' : fruit);
    } else {
      line(c, '#7a5638', h * 0.08, [[x, base], [x, base - h * 0.7]]);
      const br = [[-0.32, 0.92], [0.3, 0.88], [-0.18, 0.7], [0.22, 0.62], [0.02, 1.02]];
      for (const [dx, dy] of br) {
        line(c, '#7a5638', h * 0.035, [[x, base - h * 0.42 - dy * h * 0.2], [x + dx * h, base - dy * h]]);
        line(c, SNOW, h * 0.02, [[x + dx * h * 0.4, base - h * 0.5 - dy * h * 0.25], [x + dx * h * 0.95, base - dy * h - 1]]);
      }
    }
  }
  // a roof; in winter the top of it is under snow
  function roof(c, pal, pts, col, edge) {
    poly(c, pts, col);
    if (edge) { c.strokeStyle = edge; c.lineWidth = 1.6; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.stroke(); }
    if (!pal.snow) return;
    const ys = pts.map((p) => p[1]), top = Math.min(...ys), h = Math.max(...ys) - top, y1 = top + h * 0.5;
    c.save(); c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
    c.beginPath(); c.moveTo(-10, top - 10); c.lineTo(PW + 10, top - 10); c.lineTo(PW + 10, y1);
    for (let x = PW + 10; x > -10; x -= 12) c.quadraticCurveTo(x - 6, y1 + 5, x - 12, y1);
    c.closePath(); fill(c, SNOW);
    c.restore();
  }
  // a white line of snow along a ledge
  function ledge(c, pal, x, y, w) { if (pal.snow) rrect(c, x - 1, y - 3, w + 2, 4.5, 2.2, SNOW); }
  function windowAt(c, x, y, w, h, frame, glass, cols = 2, rows = 2, sill = true) {
    rect(c, x - 2, y - 2, w + 4, h + 4, frame);
    rect(c, x, y, w, h, glass);
    c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.moveTo(x + w * 0.15, y + h); c.lineTo(x + w * 0.55, y); c.lineTo(x + w * 0.72, y); c.lineTo(x + w * 0.32, y + h); c.closePath(); c.fill();
    for (let k = 1; k < cols; k++) rect(c, x + (w * k) / cols - 1, y, 2, h, frame);
    for (let k = 1; k < rows; k++) rect(c, x, y + (h * k) / rows - 1, w, 2, frame);
    if (sill) rect(c, x - 4, y + h + 2, w + 8, 3, U.shade(frame, -0.08));
  }
  function doorAt(c, x, y, w, h, col, arch, glass) {
    c.beginPath();
    if (arch) { c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath(); }
    else c.rect(x, y, w, h);
    fill(c, col);
    const lt = U.shade(col, 0.16);
    if (glass) rect(c, x + w * 0.2, y + (arch ? w * 0.45 : h * 0.12), w * 0.6, h * 0.3, glass);
    else rect(c, x + w * 0.2, y + h * 0.18 + (arch ? w * 0.3 : 0), w * 0.6, h * 0.26, lt);
    rect(c, x + w * 0.2, y + h * 0.6, w * 0.6, h * 0.3, lt);
    dot(c, x + w * 0.8, y + h * 0.56, 1.4, '#e9c35a');
  }
  // a striped awning with a scalloped edge
  function awning(c, pal, x, y, w, h, a, b, n) {
    const sw = w / n;
    for (let k = 0; k < n; k++) {
      rect(c, x + k * sw, y, sw + 0.3, h, k % 2 ? b : a);
      c.beginPath(); c.ellipse(x + k * sw + sw / 2, y + h, sw / 2, Math.min(sw / 2, h * 0.42), 0, 0, Math.PI); fill(c, k % 2 ? b : a);
    }
    rect(c, x, y, w, 1.6, 'rgba(60,40,30,0.25)');
    ledge(c, pal, x, y, w);
  }
  function board(c, x, y, w, h, bg, fg, text, size, font) {
    rrect(c, x, y, w, h, 2.5, bg);
    c.strokeStyle = U.shade(bg, -0.25); c.lineWidth = 1; c.beginPath(); c.roundRect(x + 1.5, y + 1.5, w - 3, h - 3, 2); c.stroke();
    word(c, text, x + w / 2, y + h / 2 + 0.5, size, fg, 900, font);
  }
  function pickets(c, x0, x1, y, h, col) {
    rect(c, x0, y + h * 0.3, x1 - x0, 2.6, U.shade(col, -0.1)); rect(c, x0, y + h * 0.7, x1 - x0, 2.6, U.shade(col, -0.1));
    for (let x = x0 + 3; x < x1; x += 9) poly(c, [[x, y + h], [x, y + 3], [x + 2.5, y], [x + 5, y + 3], [x + 5, y + h]], col);
  }
  // a row of flowers along the ground, or little drifts of snow in winter
  function flowers(c, pal, x0, x1, y, r, cols) {
    if (pal.snow) { for (let x = x0; x < x1; x += 9) oval(c, x + 4, y - 1, 6, 3, SNOW); return; }
    for (let x = x0; x < x1; x += 5) dot(c, x + r() * 3, y - 2 - r() * 5, 3, r() < 0.5 ? '#5f9a4c' : '#4f8a3c');
    const set = cols || pal.flowers;
    for (let x = x0 + 2; x < x1; x += 6) dot(c, x + r() * 3, y - 4 - r() * 6, 1.9, set[(r() * set.length) | 0]);
  }
  function cobbles(c, pal, y, r, base = '#c9bca6') {
    rect(c, 0, y, PW, PH - y, pal.snow ? '#e9eef2' : base);
    for (let row = 0, yy = y + 3; yy < PH; yy += 7, row++) {
      for (let x = -((row % 2) * 6); x < PW; x += 12) oval(c, x + 6, yy + 2, 5, 2.6, pal.snow ? '#f6f9fb' : U.shade(base, (r() - 0.5) * 0.18));
    }
  }
  function bricks(c, x, y, w, h, col) {
    rect(c, x, y, w, h, col);
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    c.strokeStyle = 'rgba(70,30,20,0.22)'; c.lineWidth = 0.7; c.beginPath();
    for (let yy = y + 5, row = 0; yy < y + h; yy += 5, row++) {
      c.moveTo(x, yy); c.lineTo(x + w, yy);
      for (let xx = x + (row % 2) * 6; xx < x + w; xx += 12) { c.moveTo(xx, yy); c.lineTo(xx, yy + 5); }
    }
    c.stroke(); c.restore();
  }
  function smoke(c, x, y) {
    for (let k = 0; k < 3; k++) { c.globalAlpha = 0.55 - k * 0.14; dot(c, x + k * 5, y - k * 9, 4 + k * 1.6, '#f4f2ee'); }
    c.globalAlpha = 1;
  }
  // falling leaves in autumn, snowflakes in winter
  function weather(c, pal, r) {
    if (pal.leaves) {
      for (let k = 0; k < 22; k++) {
        const x = r() * PW, y = r() * PH * 0.9;
        c.save(); c.translate(x, y); c.rotate(r() * 6); oval(c, 0, 0, 3.2, 1.6, ['#d9822b', '#c9592f', '#e6ad3c'][k % 3]); c.restore();
      }
    }
    if (pal.snow) for (let k = 0; k < 70; k++) dot(c, r() * PW, r() * PH, 0.7 + r() * 1.2, 'rgba(255,255,255,0.9)');
  }
  function caption(c, text) {
    c.font = PZ.font(13, 900);
    const w = c.measureText(text).width + 24, x = PW / 2 - w / 2, y = PH - 27;
    rrect(c, x + 1, y + 2, w, 19, 9.5, 'rgba(40,30,20,0.22)');
    rrect(c, x, y, w, 19, 9.5, PAPER);
    word(c, text, PW / 2, y + 10, 13, INK);
  }
  // a pony side on, facing left, standing on y; a green rug in winter
  function pony(c, x, y, k, coat, mane, rug) {
    const dk = U.shade(coat, -0.2), u = (n) => n * k;
    line(c, dk, u(3.4), [[x + u(13), y - u(22)], [x + u(14), y - 1]]);
    line(c, dk, u(3.4), [[x - u(12), y - u(22)], [x - u(11), y - 1]]);
    line(c, mane, u(3.6), [[x + u(20), y - u(35)], [x + u(29), y - u(26)], [x + u(27), y - u(11)]]);
    line(c, coat, u(4), [[x + u(8), y - u(22)], [x + u(9), y - 1]]);
    line(c, coat, u(4), [[x - u(16), y - u(22)], [x - u(16), y - 1]]);
    for (const hx of [14, -11, 9, -16]) rect(c, x + u(hx) - u(2.2), y - u(2.4), u(4.4), u(2.8), '#4b3a2c');
    oval(c, x, y - u(30), u(22), u(12), coat);
    poly(c, [[x - u(8), y - u(39)], [x - u(20), y - u(50)], [x - u(12), y - u(56)], [x - u(3), y - u(45)], [x + u(4), y - u(38)], [x - u(14), y - u(24)]], coat);
    if (rug) {
      c.beginPath(); c.ellipse(x + u(3), y - u(31), u(19), u(11.4), 0, Math.PI * 0.98, Math.PI * 2.02); c.lineTo(x + u(19), y - u(24)); c.quadraticCurveTo(x + u(3), y - u(19), x - u(13), y - u(24)); c.closePath(); fill(c, rug);
      rect(c, x - u(13), y - u(27), u(32), u(1.6), U.shade(rug, 0.4));
    }
    // the head, the ear, the eye and the muzzle
    c.save(); c.translate(x - u(23), y - u(50)); c.rotate(-0.72);
    rrect(c, u(-7), u(-5.8), u(21), u(11.6), u(5.4), coat);
    rrect(c, u(-7.4), u(-4.8), u(8), u(9.6), u(4.2), U.shade(coat, 0.28));
    dot(c, u(-4), u(1.6), u(0.8), '#3b2a20');
    poly(c, [[u(11), u(-5)], [u(17), u(-8)], [u(14), u(-1.6)]], dk);
    dot(c, u(5.4), u(-1.6), u(1.3), '#2f241c');
    c.restore();
    line(c, mane, u(4.6), [[x - u(12), y - u(57)], [x - u(4), y - u(47)], [x + u(5), y - u(39)]]);
    line(c, mane, u(2.8), [[x - u(14), y - u(58)], [x - u(20), y - u(57)]]);
  }
  function seagull(c, x, y) { line(c, '#5d6470', 1.3, [[x - 5, y], [x - 2, y - 2.4], [x, y]]); line(c, '#5d6470', 1.3, [[x, y], [x + 2, y - 2.4], [x + 5, y]]); }

  // --------------------------------------------------------------- MOTIFS
  // each draws one postcard in 300 x 225 units; `of` finishes "A postcard of ..."
  const MOTIFS = {
    cottage: { name: 'The cottage', of: 'the cottage', draw(c, pal, r) {
      sky(c, pal, r, { sunX: 250 });
      rect(c, 0, 168, PW, PH - 168, pal.grass);
      tree(c, pal, 30, 176, 128, r);
      // the walls, the roof and the chimney
      rect(c, 72, 112, 156, 66, '#f2d88a');
      rect(c, 72, 172, 156, 6, '#d9bc6c');
      roof(c, pal, [[58, 116], [150, 46], [242, 116]], '#b5603f', '#8e4430');
      rect(c, 196, 58, 14, 34, '#a14f35'); rect(c, 193, 55, 20, 5, '#8e4430');
      if (!pal.sun || pal.leaves) smoke(c, 203, 48);
      dot(c, 150, 90, 10, '#fbf7ee'); dot(c, 150, 90, 7.6, '#9fc9df'); rect(c, 149.2, 82.5, 1.6, 15, '#fbf7ee'); rect(c, 142.5, 89.2, 15, 1.6, '#fbf7ee');
      // shuttered windows and the green door
      for (const x of [88, 182]) {
        rect(c, x - 9, 124, 8, 30, '#a6d3d4'); rect(c, x + 31, 124, 8, 30, '#a6d3d4');
        windowAt(c, x, 124, 30, 30, '#fbf7ee', '#9fc9df');
        ledge(c, pal, x - 4, 157, 38);
      }
      doorAt(c, 139, 136, 22, 42, '#4e7b5b', true);
      // ivy climbing the left corner and over the door
      const ivy = ['#4f8a3c', '#6aa04c', '#3f7531'];
      for (let k = 0; k < 46; k++) { const t = r(); oval(c, 72 + r() * 26 * (1 - t * 0.4), 176 - t * 70, 3.4, 2.4, ivy[k % 3]); }
      for (let k = 0; k < 14; k++) { const a = Math.PI + (k / 13) * Math.PI; oval(c, 150 + Math.cos(a) * 15, 147 + Math.sin(a) * 14, 3, 2.2, ivy[k % 3]); }
      flowers(c, pal, 76, 132, 180, r); flowers(c, pal, 168, 226, 180, r);
      // the path and the picket fence
      poly(c, [[141, 178], [159, 178], [176, 225], [124, 225]], pal.snow ? '#eef2f5' : '#dccaa4');
      pickets(c, 0, 122, 188, 22, '#f6efe3'); pickets(c, 178, PW, 188, 22, '#f6efe3');
      tree(c, pal, 272, 170, 70, r);
    } },

    cafe: { name: 'Marigold Café', of: 'Marigold Café', draw(c, pal, r) {
      sky(c, pal, r, { sunX: 40, clouds: [[120, 26, 0.9], [230, 18, 0.7]] });
      // the café, two storeys on a corner
      rect(c, 36, 40, 228, 140, '#f1e6cc');
      rect(c, 30, 34, 240, 9, '#8a7a68'); ledge(c, pal, 30, 34, 240);
      for (const x of [62, 134, 206]) {
        windowAt(c, x, 52, 30, 28, '#fbf7ee', '#a9d3e0');
        rect(c, x - 3, 82, 36, 6, '#b98f5a'); flowers(c, pal, x - 2, x + 32, 82, r, ['#e9962c', '#f2b63a', '#d9822b']);
      }
      board(c, 48, 94, 204, 16, '#3d5a86', '#f6efe3', 'CAFÉ', 12);
      awning(c, pal, 44, 112, 212, 14, '#2f8068', '#f6efe3', 14);
      // the big window with cups on a shelf, and the red door
      windowAt(c, 56, 134, 112, 42, '#fbf7ee', '#cfe7ea', 3, 1, false);
      rect(c, 58, 158, 108, 3, '#b98f5a');
      for (let k = 0; k < 7; k++) { const x = 64 + k * 14; rrect(c, x, 151, 8, 7, 1.5, ['#efb4ae', '#a6d3d4', '#f2d88a', '#bba9df'][k % 4]); }
      doorAt(c, 186, 130, 28, 50, '#c9474f', false, '#cfe7ea');
      rect(c, 224, 136, 26, 30, '#fbf7ee'); rect(c, 226, 138, 22, 26, '#cfe7ea');
      // the terrace: flagstones, a table under a parasol and the marigolds
      rect(c, 0, 180, PW, PH - 180, pal.snow ? '#eef2f5' : '#d8cbb3');
      c.strokeStyle = 'rgba(120,100,80,0.25)'; c.lineWidth = 0.8; c.beginPath();
      for (let y = 188; y < PH; y += 12) { c.moveTo(0, y); c.lineTo(PW, y); }
      for (let x = 0; x < PW; x += 22) { c.moveTo(x, 180); c.lineTo(x - 10, PH); }
      c.stroke();
      line(c, '#8a7a68', 2, [[262, 150], [262, 204]]);
      poly(c, [[234, 156], [262, 136], [290, 156]], '#2f8068'); poly(c, [[248, 156], [262, 136], [276, 156]], '#f6efe3');
      ledge(c, pal, 238, 152, 48);
      oval(c, 262, 200, 18, 4, '#f6efe3'); line(c, '#8a7a68', 2, [[262, 200], [262, 214]]);
      for (const x of [238, 286]) { rect(c, x - 5, 196, 10, 3, '#c9474f'); line(c, '#8a7a68', 1.4, [[x - 4, 199], [x - 4, 212]]); line(c, '#8a7a68', 1.4, [[x + 4, 199], [x + 4, 212]]); }
      for (const x of [14, 196]) { rect(c, x, 186, 34, 14, '#b98f5a'); flowers(c, pal, x + 1, x + 33, 188, r, ['#e9962c', '#f2b63a', '#d9822b', '#f7c548']); }
    } },

    cove: { name: 'Seashell Cove', of: 'Seashell Cove', draw(c, pal, r) {
      sky(c, pal, r, { hills: false, horizon: 112, sunX: 60, clouds: [[150, 26, 0.9], [240, 40, 0.6]] });
      const sea = pal.snow ? '#8fb0c6' : pal.leaves ? '#7ea9c0' : '#68aed3';
      rect(c, 0, 106, PW, 70, sea);
      c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1.2;
      for (let k = 0; k < 14; k++) { const x = r() * 280, y = 112 + r() * 44; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 6, y - 2.4, x + 12, y); c.stroke(); }
      seagull(c, 120, 52); seagull(c, 138, 60);
      // the lighthouse on its rocks
      for (const [x, y, rx, ry, col] of [[240, 160, 50, 22, '#8d8b88'], [262, 150, 34, 18, '#a3a09b'], [212, 168, 26, 12, '#7b7976']]) oval(c, x, y, rx, ry, pal.snow ? U.mix(col, SNOW, 0.35) : col);
      const LX = 246;
      poly(c, [[LX - 15, 148], [LX - 10, 46], [LX + 10, 46], [LX + 15, 148]], '#fbf7ee');
      c.save(); c.beginPath(); c.moveTo(LX - 15, 148); c.lineTo(LX - 10, 46); c.lineTo(LX + 10, 46); c.lineTo(LX + 15, 148); c.closePath(); c.clip();
      for (const y of [56, 92, 128]) rect(c, LX - 20, y, 40, 18, '#c9474f');
      c.restore();
      rect(c, LX - 13, 40, 26, 6, '#4b4a52'); rect(c, LX - 8, 26, 16, 14, '#fde7a3'); rect(c, LX - 0.8, 26, 1.6, 14, '#4b4a52');
      poly(c, [[LX - 11, 27], [LX, 16], [LX + 11, 27]], '#c9474f'); ledge(c, pal, LX - 9, 25, 18);
      // the sand
      c.beginPath(); c.moveTo(0, 150); c.bezierCurveTo(80, 160, 160, 176, 230, 178); c.bezierCurveTo(260, 180, 290, 186, PW, 190); c.lineTo(PW, PH); c.lineTo(0, PH); c.closePath();
      fill(c, pal.snow ? '#eef0ef' : '#ecd8ab');
      c.globalAlpha = 0.5; c.beginPath(); c.moveTo(0, 150); c.bezierCurveTo(80, 160, 160, 176, 230, 178); c.bezierCurveTo(260, 180, 290, 186, PW, 190); c.lineTo(PW, 194); c.bezierCurveTo(200, 186, 90, 168, 0, 158); c.closePath(); fill(c, '#f8f1dc'); c.globalAlpha = 1;
      // the blue beach hut
      rect(c, 52, 102, 50, 62, '#8fbfe6');
      for (let x = 56; x < 100; x += 6) rect(c, x, 104, 1.2, 58, 'rgba(60,90,130,0.22)');
      roof(c, pal, [[46, 104], [77, 80], [108, 104]], '#f6efe3', '#c9474f');
      doorAt(c, 68, 124, 18, 40, '#fbf7ee', false);
      rect(c, 46, 162, 62, 5, '#b98f5a'); line(c, '#8a6a4a', 2, [[50, 167], [50, 176]]); line(c, '#8a6a4a', 2, [[104, 167], [104, 176]]);
      // the rowing boat drawn up on the sand, and shells
      c.beginPath(); c.moveTo(124, 186); c.quadraticCurveTo(160, 206, 198, 186); c.closePath(); fill(c, '#c9474f');
      rect(c, 128, 184, 66, 3, '#fbf7ee'); line(c, '#8a6a4a', 2.4, [[150, 190], [176, 178]]);
      for (const [x, y, col] of [[40, 192, '#efb4ae'], [228, 200, '#f6efe3'], [90, 210, '#e9962c']]) { oval(c, x, y, 4, 3, col); line(c, 'rgba(120,80,60,0.4)', 0.6, [[x - 2, y + 2], [x, y - 2], [x + 2, y + 2]]); }
    } },

    rescue: { name: 'Bluebell Rescue', of: 'Bluebell Rescue', draw(c, pal, r) {
      sky(c, pal, r, { sunX: 268, clouds: [[60, 24, 0.8], [170, 34, 0.9]] });
      rect(c, 0, 170, PW, PH - 170, pal.grass);
      // the big red barn
      rect(c, 26, 86, 128, 92, '#b5533c');
      for (let x = 30; x < 152; x += 7) rect(c, x, 88, 1, 88, 'rgba(70,25,15,0.18)');
      roof(c, pal, [[18, 90], [40, 58], [90, 42], [140, 58], [162, 90]], '#5b4a43', '#463833');
      rect(c, 66, 120, 48, 58, '#fbf7ee'); rect(c, 69, 123, 42, 55, '#b5533c');
      line(c, '#fbf7ee', 3, [[69, 123], [111, 178]]); line(c, '#fbf7ee', 3, [[111, 123], [69, 178]]); rect(c, 88.5, 123, 3, 55, '#fbf7ee');
      rect(c, 80, 66, 20, 18, '#fbf7ee'); rect(c, 83, 69, 14, 15, '#e9cf7a');
      for (let k = 0; k < 5; k++) line(c, '#c9a64a', 0.8, [[84 + k * 3, 84], [85 + k * 3, 72]]);
      // the farmhouse
      rect(c, 182, 104, 92, 74, '#f3ead6');
      roof(c, pal, [[174, 108], [228, 74], [282, 108]], '#5d6470', '#4b5160');
      rect(c, 252, 70, 10, 22, '#a14f35');
      windowAt(c, 194, 118, 22, 22, '#fbf7ee', '#a9d3e0'); windowAt(c, 244, 118, 22, 22, '#fbf7ee', '#a9d3e0');
      doorAt(c, 219, 140, 20, 38, '#3d5a86', false);
      // hay bales, the paddock fence, a dog and the bluebells
      for (const x of [12, 34]) { dot(c, x, 172, 11, '#e2c46e'); c.strokeStyle = '#c9a64a'; c.lineWidth = 0.8; c.beginPath(); c.arc(x, 172, 6, 0, 7); c.stroke(); }
      for (const y of [186, 198]) rect(c, 0, y, PW, 3.4, '#fbf7ee');
      for (let x = 10; x < PW; x += 46) rect(c, x, 180, 5, 26, '#fbf7ee');
      const fur = '#c98f52';
      oval(c, 168, 196, 9, 11, fur); dot(c, 168, 182, 7, fur); oval(c, 162, 182, 3, 5, '#8a5a32'); oval(c, 174, 182, 3, 5, '#8a5a32');
      dot(c, 165.6, 181, 1.1, INK); dot(c, 170.4, 181, 1.1, INK); dot(c, 168, 185, 1.6, INK); oval(c, 177, 204, 6, 2.2, fur);
      if (!pal.snow) for (let k = 0; k < 40; k++) { const x = r() * PW, y = 208 + r() * 16; line(c, '#5f9a4c', 1, [[x, y + 4], [x, y]]); dot(c, x, y, 1.8, k % 4 ? '#6f86d6' : '#9aa9e6'); }
      else flowers(c, pal, 0, PW, 214, r);
    } },

    glasshouse: { name: 'Primrose Glasshouse', of: 'Primrose Glasshouse', draw(c, pal, r) {
      sky(c, pal, r, { hills: false, sunX: 48, clouds: [[160, 24, 0.9]] });
      // the old wall across the back
      bricks(c, 0, 96, PW, 70, '#b8603f'); rect(c, 0, 92, PW, 6, '#a24f33'); ledge(c, pal, 0, 92, PW);
      rect(c, 0, 166, PW, PH - 166, pal.grass);
      tree(c, pal, 34, 176, 110, r, '#e2574c'); tree(c, pal, 268, 176, 104, r, '#e2574c');
      // the glasshouse: white frames, pale glass and a pitched roof
      const G = 'rgba(207,230,234,0.88)';
      rect(c, 66, 122, 168, 56, G);
      poly(c, [[60, 124], [150, 76], [240, 124]], G);
      c.fillStyle = 'rgba(255,255,255,0.45)';
      for (const x of [80, 140, 196]) { c.beginPath(); c.moveTo(x, 176); c.lineTo(x + 14, 124); c.lineTo(x + 22, 124); c.lineTo(x + 8, 176); c.closePath(); c.fill(); }
      c.strokeStyle = '#fbfaf6'; c.lineWidth = 2.4; c.beginPath();
      c.moveTo(60, 124); c.lineTo(150, 76); c.lineTo(240, 124); c.closePath();
      c.rect(66, 122, 168, 56);
      for (let x = 66; x <= 234; x += 21) { c.moveTo(x, 124); c.lineTo(x, 178); }
      for (let k = 1; k < 8; k++) { const x = 60 + k * 22.5; c.moveTo(x, 124); c.lineTo(150, 76); }
      c.moveTo(66, 150); c.lineTo(234, 150);
      c.stroke();
      if (pal.snow) poly(c, [[64, 122], [150, 78], [236, 122], [222, 122], [150, 86], [78, 122]], SNOW);
      for (let x = 72; x < 230; x += 9) dot(c, x + 3, 170, 4, pal.snow ? '#7aa866' : '#6aa858');
      for (let x = 74; x < 230; x += 14) dot(c, x + 4, 166, 2.4, pal.snow ? '#7aa866' : '#e2574c');
      rect(c, 141, 140, 18, 38, 'rgba(255,255,255,0.3)');
      line(c, '#fbfaf6', 2, [[141, 178], [141, 140], [159, 140], [159, 178]]); line(c, '#fbfaf6', 1.4, [[141, 158], [159, 158]]); dot(c, 155, 160, 1.4, '#e9c35a');
      // primroses along the border and the brick path
      poly(c, [[138, 178], [162, 178], [186, 225], [114, 225]], pal.snow ? '#eef1f3' : '#c97a5a');
      if (!pal.snow) {
        c.strokeStyle = 'rgba(110,50,30,0.3)'; c.lineWidth = 0.7; c.beginPath();
        for (let y = 184; y < PH; y += 7) { const k = (y - 178) / 47; c.moveTo(138 - 24 * k, y); c.lineTo(162 + 24 * k, y); }
        c.stroke();
      }
      flowers(c, pal, 4, 128, 196, r, ['#f7e27a', '#f2d050', '#fff3b0']); flowers(c, pal, 172, 296, 196, r, ['#f7e27a', '#f2d050', '#efb4ae']);
    } },

    canal: { name: 'Kingfisher Lock', of: 'Kingfisher Lock', draw(c, pal, r) {
      sky(c, pal, r, { sunX: 52, clouds: [[150, 28, 0.9], [250, 20, 0.7]] });
      const water = pal.snow ? '#9dbccc' : pal.leaves ? '#86afc0' : '#7fb7cc';
      rect(c, 0, 124, PW, 14, pal.snow ? '#e8eef2' : pal.leaves ? '#c9b47a' : '#8fbf74');
      rect(c, 0, 136, PW, 66, water);
      c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 1.1;
      for (let k = 0; k < 12; k++) { const x = r() * 280, y = 150 + r() * 44; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 10, y); c.stroke(); }
      // the humpback bridge: brick over a round arch, mirrored in the water
      const BX = 212, AR = 30, WL = 146;
      c.save(); c.beginPath(); c.moveTo(100, WL); c.quadraticCurveTo(BX, 48, 324, WL); c.closePath(); c.clip();
      bricks(c, 96, 60, 232, 90, '#b8603f'); c.restore();
      c.beginPath(); c.moveTo(100, WL); c.quadraticCurveTo(BX, 48, 324, WL); c.strokeStyle = pal.snow ? SNOW : '#d9c9a6'; c.lineWidth = 4; c.stroke();
      c.beginPath(); c.arc(BX, WL, AR, Math.PI, 0); c.closePath(); fill(c, U.shade(water, -0.4));
      c.strokeStyle = '#cf8a63'; c.lineWidth = 5; c.beginPath(); c.arc(BX, WL, AR + 2.5, Math.PI, 0); c.stroke();
      c.globalAlpha = 0.4; c.beginPath(); c.ellipse(BX, WL, AR + 3, (AR + 3) * 0.5, 0, 0, Math.PI); fill(c, U.shade(water, -0.4)); c.globalAlpha = 1;
      // the narrowboat, moored along the towpath with roses and castles on its side
      const B = '#4e7b5b';
      poly(c, [[14, 172], [194, 172], [208, 180], [196, 192], [26, 192], [10, 182]], '#2f2f33');
      rect(c, 12, 172, 190, 3.4, '#c9474f'); rect(c, 14, 177, 186, 1.4, '#f2d88a');
      rect(c, 36, 150, 140, 22, B); rect(c, 34, 147, 144, 4, pal.snow ? SNOW : '#c9474f');
      for (const x of [52, 72, 150, 164]) { dot(c, x, 160, 4.6, '#c99a2e'); dot(c, x, 160, 3.2, '#cfe7ea'); }
      rrect(c, 88, 153, 48, 15, 2, '#fbf7ee'); dot(c, 102, 160.5, 4, '#e2574c'); dot(c, 118, 160.5, 4, '#f2d88a'); poly(c, [[124, 166], [128, 155], [132, 166]], '#c9474f');
      rect(c, 48, 136, 6, 11, '#2f2f33'); if (!pal.sun || pal.leaves) smoke(c, 51, 128);
      for (const x of [140, 156]) { rect(c, x, 140, 10, 7, '#c4683f'); dot(c, x + 5, 138, 4, pal.snow ? SNOW : '#e2574c'); }
      line(c, '#6b4a32', 2, [[16, 172], [8, 156]]);
      // the towpath, and the kingfisher on a mooring post
      rect(c, 0, 198, PW, PH - 198, pal.snow ? '#eef2f5' : '#a9c48e');
      rect(c, 0, 198, PW, 5, pal.snow ? '#dfe6eb' : '#c8b896');
      flowers(c, pal, 8, 108, 214, r); flowers(c, pal, 196, 250, 214, r);
      rect(c, 262, 176, 8, 30, '#7a5638'); ledge(c, pal, 262, 176, 8);
      oval(c, 265, 170, 8, 5.4, '#2f86c4'); oval(c, 265, 172.5, 5.6, 3, '#e9822b'); dot(c, 271, 165, 4.2, '#2f86c4');
      poly(c, [[274, 164], [283, 166], [274, 167]], '#3b352e'); dot(c, 272, 164, 0.9, INK); poly(c, [[258, 169], [252, 172], [258, 172]], '#2f86c4');
    } },

    books: { name: 'Hollyhock Books', of: 'Hollyhock Books', draw(c, pal, r) {
      sky(c, pal, r, { sunX: 268, clouds: [[60, 22, 0.8]] });
      // the shop: rooms above, the shopfront below
      rect(c, 56, 24, 188, 158, '#efe3cc');
      rect(c, 50, 18, 200, 8, '#7a6a5a'); ledge(c, pal, 50, 18, 200);
      windowAt(c, 86, 36, 34, 34, '#fbf7ee', '#a9d3e0'); windowAt(c, 180, 36, 34, 34, '#fbf7ee', '#a9d3e0');
      ledge(c, pal, 82, 73, 42); ledge(c, pal, 176, 73, 42);
      rect(c, 56, 86, 188, 96, '#3d5a86');
      board(c, 66, 90, 168, 16, '#4e7b5b', '#f6efe3', 'BOOKS', 12, SERIF);
      awning(c, pal, 60, 108, 180, 12, '#efb4ae', '#fbf7ee', 12);
      // the window full of books, and a cat on the sill
      windowAt(c, 70, 128, 96, 50, '#2e4568', '#f3e7cf', 1, 1, false);
      for (const y of [152, 176]) rect(c, 70, y - 1, 96, 2, '#8a6a4a');
      for (let row = 0; row < 2; row++) {
        let x = 72;
        while (x < 162) { const w = 4 + r() * 4, h = 14 + r() * 7; rect(c, x, (row ? 175 : 151) - h, w, h, ['#e2574c', '#5d7fd8', '#6f9a6a', '#f2d88a', '#bba9df', '#d98b63'][(r() * 6) | 0]); x += w + 0.8; }
      }
      oval(c, 150, 172, 9, 5, '#4b4a52'); dot(c, 157, 166, 4.4, '#4b4a52'); poly(c, [[154, 163], [155, 158], [158, 162]], '#4b4a52'); poly(c, [[158, 162], [160, 158], [161, 163]], '#4b4a52');
      doorAt(c, 182, 128, 26, 54, '#2e4568', false, '#f3e7cf');
      // hollyhocks either side, and the cobbles
      cobbles(c, pal, 182, r);
      for (const [x, h, col] of [[30, 96, '#ef8aa6'], [44, 80, '#f5b3c4'], [262, 90, '#e0607e'], [276, 72, '#fbf7ee']]) {
        line(c, pal.snow ? '#8a7a68' : '#5f8a3a', 2, [[x, 184], [x, 184 - h]]);
        if (pal.snow) continue;
        for (let y = 184 - h; y < 170; y += 7) { dot(c, x - 2.4, y, 3.4, pal.leaves ? '#c9a36a' : col); dot(c, x + 2.4, y + 3, 3.4, pal.leaves ? '#b98f5a' : col); }
        for (let y = 140; y < 184; y += 10) oval(c, x + (y % 20 ? 4 : -4), y, 4, 2.2, '#5f9a4c');
      }
    } },

    pottery: { name: 'Kiln Lane Pottery', of: 'Kiln Lane Pottery', draw(c, pal, r) {
      sky(c, pal, r, { sunX: 40, clouds: [[120, 26, 0.9], [200, 40, 0.6]] });
      tree(c, pal, 172, 112, 64, r);
      // the brick barn with its window of pots and the sage door
      bricks(c, 16, 96, 148, 86, '#b5603f');
      roof(c, pal, [[8, 100], [90, 54], [172, 100]], '#c4683f', '#9b4a2e');
      rect(c, 82, 38, 16, 16, '#fbf7ee'); poly(c, [[78, 40], [90, 30], [102, 40]], '#9b4a2e'); ledge(c, pal, 80, 36, 20);
      board(c, 34, 104, 74, 12, '#8a4e2e', '#f6efe3', 'POTTERY', 8.5);
      windowAt(c, 30, 122, 78, 50, '#f3ead6', '#f3e2bf', 1, 1, false);
      for (const y of [140, 158]) rect(c, 30, y, 78, 2, '#b98f5a');
      for (let row = 0; row < 3; row++) for (let k = 0; k < 7; k++) {
        const x = 35 + k * 10.5, y = [138, 156, 171][row], col = ['#8fbfe6', '#efb4ae', '#f2d88a', '#9cc5a1', '#bba9df', '#fbf7ee'][(k + row * 2) % 6];
        rrect(c, x, y - 8, 7, 8, 2, col);
      }
      doorAt(c, 120, 128, 28, 54, '#9cc5a1', false);
      for (let k = 0; k < 4; k++) line(c, 'rgba(60,80,60,0.25)', 0.8, [[122, 132 + k * 12], [146, 140 + k * 12]]);
      // the bottle kiln and its tall chimney
      const KX = 236;
      c.beginPath(); c.moveTo(KX - 50, 182); c.bezierCurveTo(KX - 56, 140, KX - 22, 120, KX - 14, 70);
      c.lineTo(KX - 8, 22); c.lineTo(KX + 8, 22); c.lineTo(KX + 14, 70); c.bezierCurveTo(KX + 22, 120, KX + 56, 140, KX + 50, 182); c.closePath();
      c.save(); c.clip(); bricks(c, KX - 60, 18, 120, 170, '#b4553a'); c.restore();
      for (const y of [168, 148, 128]) { const hw = y > 150 ? 50 : y > 135 ? 42 : 30; line(c, '#3b2f2a', 2, [[KX - hw, y], [KX, y + 3], [KX + hw, y]]); }
      rect(c, KX - 10, 18, 20, 5, '#8e4430'); ledge(c, pal, KX - 10, 18, 20);
      c.beginPath(); c.moveTo(KX - 13, 182); c.lineTo(KX - 13, 166); c.arc(KX, 166, 13, Math.PI, 0); c.lineTo(KX + 13, 182); c.closePath(); fill(c, '#3b2f2a');
      c.beginPath(); c.moveTo(KX - 8, 182); c.lineTo(KX - 8, 170); c.arc(KX, 170, 8, Math.PI, 0); c.lineTo(KX + 8, 182); c.closePath(); fill(c, pal.snow || pal.leaves ? '#f2a84a' : '#5a4038');
      smoke(c, KX + 2, 12);
      // lavender in front of the cobbles
      cobbles(c, pal, 182, r, '#cbbfa8');
      flowers(c, pal, 6, 112, 188, r, ['#9b7fd1', '#b49be0', '#8a6cc4']); flowers(c, pal, 160, 296, 188, r, ['#9b7fd1', '#b49be0', '#8a6cc4']);
    } },

    halt: { name: 'Halfpenny Halt', of: 'Halfpenny Halt', draw(c, pal, r) {
      sky(c, pal, r, { sunX: 40, clouds: [[130, 22, 0.8], [230, 36, 0.7]] });
      rect(c, 262, 88, 8, 16, '#efe9dc'); poly(c, [[260, 88], [266, 74], [272, 88]], '#a3a09b');
      // the waiting room: cream boards, a wine-red dado, a slate roof with a clock
      rect(c, 58, 100, 184, 70, '#f3e9d4');
      for (let y = 104; y < 150; y += 6) rect(c, 58, y, 184, 0.8, 'rgba(160,120,80,0.2)');
      rect(c, 58, 150, 184, 20, '#9b3b45');
      roof(c, pal, [[46, 104], [108, 76], [150, 50], [192, 76], [254, 104]], '#5d6470', '#4b5160');
      poly(c, [[118, 80], [150, 54], [182, 80]], '#f3e9d4');
      dot(c, 150, 70, 10, '#fbf7ee'); c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.arc(150, 70, 10, 0, 7); c.stroke();
      line(c, INK, 1.4, [[150, 70], [150, 63]]); line(c, INK, 1.4, [[150, 70], [155, 72]]);
      board(c, 82, 104, 136, 14, '#9b3b45', '#f6efe3', 'HALFPENNY HALT', 8.6);
      windowAt(c, 74, 124, 30, 24, '#fbf7ee', '#a9d3e0'); windowAt(c, 196, 124, 30, 24, '#fbf7ee', '#a9d3e0');
      doorAt(c, 139, 126, 22, 44, '#4e7b5b', false, '#cfe7ea');
      for (const x of [64, 236]) { line(c, '#6b6157', 1, [[x, 103], [x, 108]]); oval(c, x, 112, 7, 4.6, '#8a6a4a'); flowers(c, pal, x - 7, x + 7, 110, r); }
      // the platform, two lamps and the line
      rect(c, 0, 170, PW, 18, pal.snow ? '#eef1f4' : '#cfc7b8'); rect(c, 0, 186, PW, 3, '#fbf7ee');
      for (const x of [30, 270]) { line(c, '#2f4a3f', 2.4, [[x, 186], [x, 128]]); rrect(c, x - 5, 116, 10, 13, 2, '#2f4a3f'); rect(c, x - 3, 118, 6, 9, '#fde7a3'); ledge(c, pal, x - 5, 116, 10); }
      rect(c, 0, 189, PW, PH - 189, pal.snow ? '#e4eaee' : '#a99a86');
      for (let x = 4; x < PW; x += 14) rect(c, x, 196, 7, 26, pal.snow ? '#c8bba8' : '#7a5a3e');
      rect(c, 0, 200, PW, 3, '#8d8b88'); rect(c, 0, 214, PW, 3, '#8d8b88');
    } },

    beads: { name: 'Button & Bead', of: 'Button & Bead', draw(c, pal, r) {
      sky(c, pal, r, { hills: false, sunX: 262, clouds: [[60, 20, 0.8]] });
      // the brick neighbours either side and the little shop between them
      bricks(c, 0, 40, 52, 150, '#c08a72'); bricks(c, 248, 34, 52, 156, '#a97a66');
      rect(c, 52, 22, 196, 160, '#f6e7dc');
      rect(c, 46, 16, 208, 8, '#8a6a68'); ledge(c, pal, 46, 16, 208);
      windowAt(c, 128, 34, 44, 36, '#fbf7ee', '#a9d3e0');
      rect(c, 124, 72, 52, 8, '#a6d3d4'); flowers(c, pal, 126, 174, 74, r, ['#efb4ae', '#f7c548', '#ffffff']);
      // the dusty rose shopfront, the sign and a teal striped awning
      rect(c, 52, 86, 196, 96, '#d99aa0');
      rect(c, 52, 86, 196, 3, '#c99a2e');
      board(c, 62, 90, 176, 16, '#efb4ae', '#6a3d44', 'BUTTON & BEAD', 10, SERIF);
      rect(c, 62, 106, 176, 1.4, '#c99a2e');
      awning(c, pal, 58, 110, 184, 12, '#4f9a9c', '#fbf7ee', 12);
      // the bow window: ribbons, jars of buttons and a dress form
      c.beginPath(); c.moveTo(68, 180); c.lineTo(68, 132); c.quadraticCurveTo(114, 124, 160, 132); c.lineTo(160, 180); c.closePath(); fill(c, '#fbf7ee');
      c.beginPath(); c.moveTo(72, 178); c.lineTo(72, 135); c.quadraticCurveTo(114, 128, 156, 135); c.lineTo(156, 178); c.closePath(); fill(c, '#f6ecd8');
      const rib = ['#e2574c', '#f2d88a', '#6f9a6a', '#5d7fd8', '#bba9df', '#efb4ae'];
      for (let k = 0; k < 6; k++) { const x = 78 + k * 7; line(c, rib[k], 3, [[x, 136], [x + 1, 154], [x - 1, 166]]); }
      for (const [x, col] of [[128, '#a6d3d4'], [144, '#efb4ae']]) {
        rrect(c, x - 6, 164, 12, 14, 2.5, 'rgba(255,255,255,0.7)');
        for (let k = 0; k < 4; k++) dot(c, x - 3 + (k % 2) * 6, 167 + ((k / 2) | 0) * 5, 2.2, k % 2 ? col : U.shade(col, -0.25));
      }
      oval(c, 138, 146, 7, 9, '#c9474f'); rect(c, 136.5, 155, 3, 8, '#6b4a32'); dot(c, 138, 135, 3, '#8a6a4a');
      c.strokeStyle = '#fbf7ee'; c.lineWidth = 1.6; c.beginPath();
      for (const x of [100, 128]) { c.moveTo(x, 131); c.lineTo(x, 178); }
      c.moveTo(72, 156); c.lineTo(156, 156); c.stroke();
      rect(c, 64, 178, 100, 4, '#c99a2e');
      doorAt(c, 180, 128, 28, 54, '#a6d3d4', false, '#f3e7cf');
      dot(c, 194, 124, 3, '#e9bf4f');
      rect(c, 216, 132, 24, 40, '#fbf7ee'); rect(c, 218, 134, 20, 36, '#f6ecd8');
      for (let k = 0; k < 6; k++) dot(c, 222 + (k % 2) * 12, 140 + ((k / 2) | 0) * 11, 3.6, ['#e2574c', '#5d7fd8', '#f2d88a', '#6f9a6a', '#bba9df', '#e9962c'][k]);
      cobbles(c, pal, 182, r, '#bfb3a3');
      // bunting across the street
      c.strokeStyle = '#8a7a68'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, 30); c.quadraticCurveTo(150, 52, PW, 28); c.stroke();
      for (let k = 0; k < 13; k++) { const t = (k + 0.5) / 13, x = t * PW, y = 30 + 2 * t * (1 - t) * 22 - (t * 2); poly(c, [[x - 5, y], [x + 5, y], [x, y + 9]], rib[k % 6]); }
    } },

    curio: { name: 'Marchbank\'s', of: 'Marchbank\'s Curiosities', draw(c, pal, r) {
      sky(c, pal, r, { hills: false, sunX: 44, clouds: [[160, 22, 0.9], [250, 34, 0.6]] });
      // a tall old house of soft stone, a green shopfront below
      rect(c, 40, 20, 220, 162, '#ddd0b8');
      for (let y = 30; y < 90; y += 10) rect(c, 40, y, 220, 0.8, 'rgba(120,100,70,0.18)');
      rect(c, 34, 14, 232, 8, '#6b5e52'); ledge(c, pal, 34, 14, 232);
      windowAt(c, 74, 32, 32, 40, '#fbf7ee', '#a9d3e0', 2, 3); windowAt(c, 194, 32, 32, 40, '#fbf7ee', '#a9d3e0', 2, 3);
      ledge(c, pal, 70, 75, 40); ledge(c, pal, 190, 75, 40);
      rect(c, 40, 88, 220, 94, '#2f5e4a');
      board(c, 48, 92, 204, 18, '#8e3b3f', '#e9bf4f', 'CURIOSITIES', 12, SERIF);
      ledge(c, pal, 48, 92, 204);
      // the lamplit bow window: a globe, a clock face and a ship in a bottle
      c.beginPath(); c.moveTo(54, 180); c.lineTo(54, 124); c.quadraticCurveTo(110, 114, 166, 124); c.lineTo(166, 180); c.closePath(); fill(c, '#c99a2e');
      const glow = c.createRadialGradient(110, 150, 4, 110, 150, 70);
      glow.addColorStop(0, '#fff1c6'); glow.addColorStop(1, '#efcf86');
      c.beginPath(); c.moveTo(58, 178); c.lineTo(58, 127); c.quadraticCurveTo(110, 118, 162, 127); c.lineTo(162, 178); c.closePath(); c.fillStyle = glow; c.fill();
      line(c, '#6b4a32', 2, [[80, 176], [80, 160]]); dot(c, 80, 152, 10, '#5d8fbf'); oval(c, 77, 150, 4, 6, '#7fae74'); c.strokeStyle = '#c99a2e'; c.lineWidth = 1.4; c.beginPath(); c.arc(80, 152, 12, -1.9, 1.2); c.stroke();
      dot(c, 112, 146, 9, '#fbf7ee'); c.strokeStyle = '#6b4a32'; c.lineWidth = 1.6; c.beginPath(); c.arc(112, 146, 9, 0, 7); c.stroke();
      line(c, INK, 1.2, [[112, 146], [112, 140]]); line(c, INK, 1.2, [[112, 146], [116, 148]]); rect(c, 107, 155, 10, 21, '#6b4a32');
      oval(c, 142, 166, 14, 6, 'rgba(200,230,230,0.7)'); poly(c, [[134, 168], [150, 168], [146, 172], [137, 172]], '#8e3b3f'); line(c, '#6b4a32', 1, [[142, 168], [142, 158]]); poly(c, [[142.5, 159], [149, 166], [142.5, 166]], '#fbf7ee');
      c.strokeStyle = 'rgba(201,154,46,0.95)'; c.lineWidth = 1.4; c.beginPath();
      for (const x of [76, 94, 128, 146]) { c.moveTo(x, 122); c.lineTo(x, 178); }
      c.moveTo(58, 144); c.lineTo(162, 144); c.stroke();
      // the green door with a fanlight, a lamp and the key sign
      dot(c, 202, 128, 16, '#c99a2e'); dot(c, 202, 128, 13, '#f3e2b0');
      doorAt(c, 186, 128, 32, 54, '#4e7b5b', false);
      rect(c, 186, 126, 32, 3, '#2f5e4a');
      line(c, '#2f2f33', 2, [[234, 118], [234, 126]]); rrect(c, 229, 126, 10, 13, 2, '#2f2f33'); rect(c, 231, 128, 6, 9, '#fde7a3');
      line(c, '#2f2f33', 2, [[262, 66], [286, 66]]); line(c, '#2f2f33', 1, [[278, 66], [278, 72]]);
      dot(c, 278, 80, 7, '#e9bf4f'); dot(c, 278, 80, 3.4, '#ddd0b8'); rect(c, 276.5, 86, 3, 18, '#e9bf4f'); rect(c, 279, 96, 5, 3, '#e9bf4f'); rect(c, 279, 100, 4, 3, '#e9bf4f');
      cobbles(c, pal, 182, r, '#bdb3a2');
      rect(c, 0, 182, PW, 5, pal.snow ? '#f2f5f8' : '#d6cdbd');
    } },

    stables: { name: 'Foxglove Stables', of: 'Foxglove Stables', draw(c, pal, r) {
      sky(c, pal, r, { sunX: 44, clouds: [[150, 24, 0.9], [244, 38, 0.7]] });
      rect(c, 0, 142, PW, PH - 142, pal.grass);
      tree(c, pal, 274, 148, 112, r);
      // the stable block: oak boards under a long tiled roof, with a little cupola
      rect(c, 26, 84, 212, 66, '#b98d5e');
      c.fillStyle = 'rgba(80,50,25,0.28)'; for (let x = 34; x < 238; x += 8) c.fillRect(x, 84, 0.9, 66);
      rect(c, 26, 146, 212, 4, '#8a6a4a');
      roof(c, pal, [[12, 90], [52, 46], [212, 46], [252, 90]], '#9a5a44', '#7a4434');
      rect(c, 120, 26, 24, 22, '#f6efe3'); rect(c, 126, 31, 12, 13, '#4e7b5b');
      roof(c, pal, [[115, 28], [132, 13], [149, 28]], '#4e7b5b', '#3b6248');
      line(c, '#4b4a52', 1.2, [[132, 13], [132, 4]]); line(c, '#4b4a52', 1.4, [[125, 7], [139, 7]]);
      poly(c, [[139, 7], [135, 4.4], [135, 9.6]], '#4b4a52');
      // three half-doors, the top halves open, and a pony looking out of each end
      const inside = '#3a2a20';
      [[44, 0], [112, 1], [180, 2]].forEach(([x, k]) => {
        rect(c, x - 3, 96, 46, 54, '#f6efe3');
        rect(c, x, 99, 40, 24, inside);
        rect(c, x, 123, 40, 27, '#4e7b5b');
        rect(c, x - 1, 121, 42, 3.4, '#f6efe3');
        c.strokeStyle = '#f6efe3'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x + 1, 126); c.lineTo(x + 39, 148); c.moveTo(x + 39, 126); c.lineTo(x + 1, 148); c.stroke();
        c.strokeStyle = 'rgba(30,50,35,0.35)'; c.lineWidth = 0.8; c.beginPath(); for (let bx = x + 8; bx < x + 40; bx += 8) { c.moveTo(bx, 124); c.lineTo(bx, 150); } c.stroke();
        if (k !== 1) {
          const coat = k ? '#8a5a3a' : '#d9c4a4', mane = k ? '#3f2a1e' : '#f6efe3', hx = x + 20;
          rrect(c, hx - 9, 104, 18, 22, 8, coat);
          poly(c, [[hx - 8, 108], [hx - 7, 99], [hx - 2, 105]], coat); poly(c, [[hx + 8, 108], [hx + 7, 99], [hx + 2, 105]], coat);
          rrect(c, hx - 6.5, 113, 13, 13, 5.5, U.shade(coat, 0.26));
          dot(c, hx - 5.2, 110, 1.3, '#2f241c'); dot(c, hx + 5.2, 110, 1.3, '#2f241c'); dot(c, hx - 2.4, 121, 0.8, '#5a4030'); dot(c, hx + 2.4, 121, 0.8, '#5a4030');
          line(c, mane, 3.4, [[hx - 3, 100], [hx, 106], [hx + 3, 100]]);
        }
      });
      board(c, 72, 84, 28, 9, '#f6efe3', '#4e7b5b', 'NO.1', 5.6);
      board(c, 196, 84, 28, 9, '#f6efe3', '#4e7b5b', 'NO.3', 5.6);
      // foxgloves up the end wall
      if (pal.snow) oval(c, 18, 149, 20, 4, SNOW);
      else for (const [x, h] of [[8, 40], [17, 52], [25, 34]]) {
        line(c, '#5f8f4c', 1.6, [[x, 152], [x, 152 - h]]);
        oval(c, x - 3, 150, 5, 2.4, '#5f8f4c'); oval(c, x + 3, 148, 5, 2.4, '#6f9f58');
        for (let k = 0; k < Math.floor(h / 5); k++) {
          const yy = 150 - h + k * 5 + 2, s = 1.5 + k * 0.28;
          oval(c, x + (k % 2 ? 2 : -2) * (1 + s * 0.3), yy, s * 1.1, s * 0.86, pal.leaves ? '#b98a5a' : ['#d97fb0', '#c565a0', '#e6a0c8'][k % 3]);
        }
      }
      // the yard, the paddock rails and a jump of striped poles
      rect(c, 0, 150, PW, 16, pal.snow ? '#eef2f5' : '#c7b593');
      if (!pal.snow) for (let k = 0; k < 22; k++) oval(c, r() * PW, 152 + r() * 12, 4 + r() * 8, 1.2 + r() * 1.4, 'rgba(120,95,65,0.3)');
      rect(c, 0, 166, PW, PH - 166, pal.grass);
      const rail = pal.snow ? '#e6e0d4' : '#f6efe3';
      for (const y of [172, 182]) { rect(c, 0, y, PW, 3, rail); ledge(c, pal, 0, y, PW); }
      for (let x = 6; x < PW; x += 42) { rect(c, x, 167, 5, 30, rail); rect(c, x + 3.6, 167, 1.4, 30, 'rgba(120,100,70,0.3)'); }
      flowers(c, pal, 0, PW, 198, r, pal.snow ? null : ['#ffffff', '#f7c548']);
      // the jump
      for (const x of [34, 112]) { rect(c, x, 182, 4, 28, '#f6efe3'); rect(c, x - 5, 208, 14, 3, '#d9cdb8'); }
      for (const [y0, a] of [[188, '#c9474f'], [199, '#3d5a86']]) for (let k = 0; k < 9; k++) rect(c, 28 + k * 10, y0, 10.2, 3.4, k % 2 ? '#f6efe3' : a);
      pony(c, 232, 212, 0.92, pal.snow ? '#a8744e' : '#a8744e', '#4a3226', pal.snow ? '#4e7b5b' : null);
    } },

    loft: { name: 'The Painter\'s Loft', of: 'The Painter\'s Loft', draw(c, pal, r) {
      sky(c, pal, r, { sunX: 268, clouds: [[60, 26, 0.9], [176, 18, 0.7]] });
      tree(c, pal, 276, 132, 96, r);
      // the old hay loft: white walls, a slate roof and two skylights
      rect(c, 24, 92, 190, 88, '#f3eee3');
      for (let y = 102; y < 176; y += 12) rect(c, 24, y, 190, 0.8, 'rgba(150,130,100,0.2)');
      roof(c, pal, [[8, 98], [48, 36], [190, 36], [230, 98]], '#6d7686', '#596172');
      for (const [x0, cap] of [[62, 1], [126, 1]]) {
        const a = [x0 + 8, 50], b = [x0 + 44, 50], d = [x0 - 6, 84], e = [x0 + 34, 84];
        poly(c, [a, b, e, d], '#fbf7ee');
        poly(c, [[a[0] + 3, 53], [b[0] - 3, 53], [e[0] - 3, 81], [d[0] + 4, 81]], pal.snow ? '#d7e5ef' : '#a9d9ee');
        line(c, '#fbf7ee', 1.8, [[(a[0] + b[0]) / 2, 53], [(d[0] + e[0]) / 2, 81]]);
        line(c, 'rgba(255,255,255,0.6)', 3, [[a[0] + 12, 56], [d[0] + 12, 78]]);
        if (pal.snow && cap) rrect(c, a[0] - 2, 47, b[0] - a[0] + 4, 4, 2, SNOW);
      }
      // the loft window, the hoist beam and the studio door below
      rect(c, 38, 100, 34, 28, '#3f5fa8');
      windowAt(c, 42, 104, 26, 20, '#fbf7ee', '#a9d3e0', 2, 2);
      // the old hoist from the hay days, now for hauling up paint
      dot(c, 112, 101, 4, '#7a5a3e'); dot(c, 112, 101, 1.6, '#d9c4a4');
      line(c, '#8a7a62', 1.1, [[112, 101], [112, 124]]);
      rrect(c, 106.5, 124, 11, 9, 1.4, '#d9a441'); line(c, '#6b5a3e', 0.9, [[106.5, 124], [112, 119.5], [117.5, 124]]);
      doorAt(c, 40, 138, 26, 42, '#3f5fa8', false, '#cfe7ea');
      board(c, 74, 142, 58, 14, '#d9a441', '#3b352e', 'THE LOFT', 8);
      ledge(c, pal, 74, 142, 58);
      // the outside stairs, up to the door under the eaves
      doorAt(c, 136, 106, 22, 32, '#d9a441', false);
      rect(c, 128, 138, 42, 3.6, '#8a6a4a');
      for (let k = 0; k <= 7; k++) { const x = 170 + k * 6, y = 138 + k * 6; rect(c, x, y, 7, 2.8, '#a8835e'); }
      line(c, '#7a5a3e', 2.2, [[170, 141], [214, 186]]);
      line(c, '#3f5fa8', 1.8, [[130, 122], [170, 122], [212, 166]]);
      for (const [x, y] of [[130, 122], [150, 122], [170, 122], [186, 139], [202, 155]]) line(c, '#3f5fa8', 1.4, [[x, y], [x, y + 17]]);
      ledge(c, pal, 128, 137, 42);
      // the yard wall with a painted sunrise on it
      bricks(c, 216, 124, 84, 56, '#c9a58a');
      rect(c, 222, 130, 78, 44, '#fbf3e0');
      c.save(); c.beginPath(); c.rect(224, 132, 76, 40); c.clip();
      rect(c, 224, 132, 76, 40, '#8fc3e8');
      const rays = ['#f2c84b', '#ee8b2e'];
      for (let k = 0; k < 9; k++) { const a0 = Math.PI + (k / 9) * Math.PI, a1 = a0 + Math.PI / 9; poly(c, [[262, 164], [262 + Math.cos(a0) * 80, 164 + Math.sin(a0) * 80], [262 + Math.cos(a1) * 80, 164 + Math.sin(a1) * 80]], rays[k % 2]); }
      dot(c, 262, 164, 15, '#fbe08f'); dot(c, 262, 164, 10, '#f6c745');
      c.beginPath(); c.moveTo(224, 172); c.quadraticCurveTo(248, 150, 276, 160); c.quadraticCurveTo(290, 164, 300, 158); c.lineTo(300, 172); c.closePath(); fill(c, '#5aa64f');
      c.beginPath(); c.moveTo(224, 166); c.quadraticCurveTo(236, 158, 256, 172); c.closePath(); fill(c, '#3f5fa8');
      c.restore();
      rect(c, 216, 122, 84, 3.6, '#a98a72'); ledge(c, pal, 216, 122, 84);
      // the cobbled yard, an easel and poppies along the wall
      cobbles(c, pal, 180, r, '#cdbfa6');
      rect(c, 0, 180, PW, 4, pal.snow ? '#f2f5f8' : '#ded3bf');
      flowers(c, pal, 216, 300, 184, r, ['#e2574c', '#d9432f', '#e2574c', '#f2b63a']);
      line(c, '#8a6a4a', 2, [[92, 208], [100, 160]]); line(c, '#8a6a4a', 2, [[112, 208], [104, 160]]); line(c, '#7a5a3e', 2, [[102, 158], [102, 206]]);
      rect(c, 86, 196, 30, 2.6, '#8a6a4a');
      rect(c, 86, 164, 30, 32, '#fbf7ee'); rect(c, 88, 166, 26, 28, '#bfe2ef');
      dot(c, 106, 174, 4, '#f2c84b');
      c.beginPath(); c.moveTo(88, 194); c.quadraticCurveTo(100, 178, 114, 186); c.lineTo(114, 194); c.closePath(); fill(c, '#6f9a6a');
      c.strokeStyle = '#3f5fa8'; c.lineWidth = 1; c.strokeRect(86, 164, 30, 32);
      // a paint pot and a brush by the easel
      rrect(c, 124, 198, 12, 11, 1.6, '#3f5fa8'); oval(c, 130, 198, 6, 1.8, '#d9a441');
      line(c, '#c98f55', 1.6, [[130, 198], [139, 184]]);
    } },

    observatory: { name: 'Owl Hill Observatory', of: 'Owl Hill Observatory', draw(c, pal, r) {
      // the night: indigo paling down to the hill, a band of far stars and a great moon
      const low = pal.snow ? '#5f76aa' : pal.leaves ? '#7c5c7e' : '#585a9e';
      const night = c.createLinearGradient(0, 0, 0, 176);
      night.addColorStop(0, '#0e1540'); night.addColorStop(0.5, '#1f2768'); night.addColorStop(1, low);
      c.fillStyle = night; c.fillRect(0, 0, PW, PH);
      c.save(); c.translate(150, 66); c.rotate(-0.5);
      for (let k = 0; k < 130; k++) dot(c, (r() - 0.5) * 390, (r() + r() - 1) * 44, 0.3 + r() * 0.5, `rgba(225,232,255,${(0.2 + r() * 0.35).toFixed(2)})`);
      c.restore();
      for (let k = 0; k < 96; k++) dot(c, r() * PW, r() * 150, 0.4 + r() * 0.7, `rgba(240,242,255,${(0.35 + r() * 0.5).toFixed(2)})`);
      for (const [x, y, s] of [[34, 30, 4], [96, 22, 5], [150, 46, 3.4], [176, 18, 4], [282, 112, 3.6], [84, 66, 3], [268, 20, 3]]) {
        line(c, '#fff6dc', 0.9, [[x - s, y], [x + s, y]]); line(c, '#fff6dc', 0.9, [[x, y - s], [x, y + s]]); dot(c, x, y, 1.2, '#fffbe9');
      }
      const MX = 226, MY = 60, MR = 34;
      const halo = c.createRadialGradient(MX, MY, MR * 0.85, MX, MY, MR * 2.8);
      halo.addColorStop(0, 'rgba(214,214,250,0.5)'); halo.addColorStop(0.4, 'rgba(170,176,240,0.2)'); halo.addColorStop(1, 'rgba(170,176,240,0)');
      c.fillStyle = halo; c.fillRect(0, 0, PW, 170);
      dot(c, MX, MY, MR, '#fdf3cf');
      for (const [x, y, rx, ry] of [[-13, -11, 9, 7], [9, -16, 5, 4], [13, 6, 10, 8], [-6, 13, 7, 5.4], [-21, 5, 4, 3.2], [1, -2, 3.2, 2.6], [20, -8, 3, 2.4]]) oval(c, MX + x, MY + y, rx, ry, '#efe1b4');
      for (const [x, y, w] of [[188, 74, 44], [262, 86, 34]]) { oval(c, x, y, w, 3, 'rgba(52,62,126,0.6)'); oval(c, x + 8, y - 2.4, w * 0.6, 2.4, 'rgba(52,62,126,0.45)'); }
      // the far hills, then Owl Hill with the moonlight along its slope
      const far = pal.snow ? '#aabbd8' : pal.leaves ? '#4d4569' : '#2f3a7a';
      const hill = pal.snow ? '#dbe4f2' : pal.leaves ? '#6c5b45' : '#3a6a60', lit = pal.snow ? '#f0f4fb' : pal.leaves ? '#85704f' : '#5a8f78';
      c.beginPath(); c.moveTo(0, 148); c.bezierCurveTo(60, 126, 120, 150, 170, 144); c.bezierCurveTo(220, 138, 262, 124, PW, 138); c.lineTo(PW, PH); c.lineTo(0, PH); c.closePath(); fill(c, far);
      const DX = 128, DY = 106; // the middle of the dome's rim
      // the oak and its owl
      tree(c, pal.canopy ? { ...pal, canopy: pal.canopy.map((k) => U.mix(k, '#18204e', 0.58)) } : pal, 34, 172, 136, r);
      if (pal.canopy) line(c, '#4b3d44', 13, [[34, 172], [34, 120]]);
      c.beginPath(); c.moveTo(0, 178); c.bezierCurveTo(30, 172, 58, 152, 100, 150); c.lineTo(190, 150); c.bezierCurveTo(232, 152, 268, 176, PW, 188); c.lineTo(PW, PH); c.lineTo(0, PH); c.closePath(); fill(c, hill);
      c.beginPath(); c.moveTo(190, 150); c.bezierCurveTo(232, 152, 268, 176, PW, 188); c.lineTo(PW, 196); c.bezierCurveTo(262, 182, 226, 162, 182, 158); c.closePath(); fill(c, lit);
      const bough = pal.canopy ? '#332a3c' : '#7a5638';
      line(c, bough, 3, [[34, 112], [58, 104], [78, 106]]); line(c, bough, 1.8, [[62, 104], [72, 96]]);
      if (pal.snow) line(c, SNOW, 1.6, [[42, 107], [58, 102], [76, 104]]);
      const OW = '#c9b08a', OD = '#8a7154', OX = 66, OY = 92;
      oval(c, OX, OY, 8, 10.5, OD); oval(c, OX, OY + 2, 5.4, 7.4, OW);
      for (const s of [-1, 1]) { poly(c, [[OX + s * 7, OY - 8], [OX + s * 8, OY - 14], [OX + s * 2, OY - 10]], OD); dot(c, OX + s * 3.4, OY - 5, 3.1, '#fdf3cf'); dot(c, OX + s * 3.4, OY - 5, 1.5, '#1f1a22'); }
      poly(c, [[OX - 1.4, OY - 3], [OX + 1.4, OY - 3], [OX, OY - 0.4]], '#e0a43a');
      // the map room beside the tower, its lamps lit
      const warm = (x, y, rad, a) => { const q = c.createRadialGradient(x, y, 1, x, y, rad); q.addColorStop(0, `rgba(255,214,130,${a})`); q.addColorStop(1, 'rgba(255,214,130,0)'); c.fillStyle = q; c.fillRect(x - rad, y - rad, rad * 2, rad * 2); };
      const stone = c.createLinearGradient(DX - 42, 0, 236, 0);
      stone.addColorStop(0, '#62648a'); stone.addColorStop(0.5, '#9496ae'); stone.addColorStop(1, '#c6c6d4');
      c.fillStyle = stone; c.fillRect(168, 118, 64, 42);
      roof(c, pal, [[160, 120], [176, 96], [226, 96], [240, 120]], '#3f4668', '#2f3454');
      windowAt(c, 180, 126, 16, 20, '#e6e2d6', '#ffd98a'); windowAt(c, 206, 126, 16, 20, '#e6e2d6', '#ffd98a');
      ledge(c, pal, 176, 148, 24); ledge(c, pal, 202, 148, 24);
      warm(188, 136, 26, 0.34); warm(214, 136, 26, 0.34);
      // the round stone drum
      c.beginPath(); c.moveTo(DX - 41, DY); c.lineTo(DX - 41, DY + 46); c.quadraticCurveTo(DX, DY + 56, DX + 41, DY + 46); c.lineTo(DX + 41, DY); c.closePath(); c.fillStyle = stone; c.fill();
      c.strokeStyle = 'rgba(40,40,70,0.25)'; c.lineWidth = 0.7; c.beginPath();
      for (let y = DY + 9, row = 0; y < DY + 46; y += 9, row++) {
        c.moveTo(DX - 41, y); c.quadraticCurveTo(DX, y + 6, DX + 41, y);
        for (let x = DX - 36 + (row % 2) * 7; x < DX + 41; x += 14) { const q = 1 - Math.pow((x - DX) / 41, 2); c.moveTo(x, y + 3 * q); c.lineTo(x, y + 9 + 3 * q); }
      }
      c.stroke();
      doorAt(c, DX - 9, DY + 19, 18, 32, '#35508a', true, '#ffd98a');
      windowAt(c, DX + 20, DY + 12, 11, 15, '#e6e2d6', '#ffd98a', 1, 2, false);
      warm(DX + 25.5, DY + 19, 20, 0.3); warm(DX, DY + 26, 24, 0.26);
      // the lantern by the door
      line(c, '#2f2f3a', 1.6, [[DX - 18, DY + 30], [DX - 18, DY + 24], [DX - 22, DY + 24]]); rrect(c, DX - 25, DY + 24, 7, 9, 1.6, '#2f2f3a'); rect(c, DX - 23.6, DY + 25.6, 4.2, 5.8, '#ffe2a0');
      warm(DX - 21.5, DY + 28, 15, 0.5);
      // the copper dome, bright on the moon's side, with its shutter open
      const copper = c.createLinearGradient(DX - 46, 0, DX + 46, 0);
      copper.addColorStop(0, '#74401f'); copper.addColorStop(0.5, '#b96c36'); copper.addColorStop(0.86, '#f0b47c'); copper.addColorStop(1, '#d08a54');
      c.beginPath(); c.moveTo(DX - 46, DY); c.bezierCurveTo(DX - 46, DY - 62, DX + 46, DY - 62, DX + 46, DY); c.closePath(); c.fillStyle = copper; c.fill();
      c.save(); c.clip();
      c.strokeStyle = 'rgba(80,40,18,0.42)'; c.lineWidth = 1; c.beginPath();
      for (const q of [-38, -24, -9, 9, 24, 38]) { c.moveTo(DX + q, DY); c.quadraticCurveTo(DX + q * 0.84, DY - 34, DX, DY - 47); }
      for (const y of [12, 24, 35]) { c.moveTo(DX - 50, DY - y); c.quadraticCurveTo(DX, DY - y + 3, DX + 50, DY - y); }
      c.stroke();
      if (pal.snow) { c.beginPath(); c.moveTo(DX - 50, DY - 48); c.lineTo(DX + 50, DY - 48); c.lineTo(DX + 50, DY - 22); for (let x = DX + 50; x > DX - 50; x -= 12) c.quadraticCurveTo(x - 6, DY - 16, x - 12, DY - 24); c.closePath(); fill(c, SNOW); }
      poly(c, [[DX + 3, DY], [DX + 24, DY], [DX + 7, DY - 46], [DX - 2, DY - 46]], '#141a48');
      c.restore();
      rrect(c, DX - 48, DY - 3, 96, 6.5, 2.5, '#6f4a2e'); rect(c, DX - 48, DY - 3, 96, 1.4, '#c9935a'); ledge(c, pal, DX - 48, DY - 2, 96);
      line(c, '#8a5a30', 2, [[DX, DY - 46], [DX, DY - 53]]); dot(c, DX, DY - 54, 2.4, '#e6b35a');
      // the brass telescope, looking out at the moon
      const TX = DX + 12, TY = DY - 19;
      line(c, '#8f6a2c', 6.4, [[TX - 5, TY + 4], [TX + 38, TY - 32]]);
      line(c, '#e0bc62', 3.6, [[TX - 5, TY + 2.6], [TX + 38, TY - 33.4]]);
      line(c, '#8f6a2c', 8.6, [[TX + 28, TY - 24], [TX + 44, TY - 37]]);
      line(c, '#f0d488', 3.4, [[TX + 28, TY - 25.6], [TX + 44, TY - 38.6]]);
      dot(c, TX + 46, TY - 39, 3.2, '#fdf3cf');
      // the path up the hill, wild thyme on the slope and the stone bench
      c.beginPath(); c.moveTo(DX - 7, DY + 51); c.bezierCurveTo(DX - 30, 172, DX + 34, 188, DX - 40, PH); c.lineTo(DX + 10, PH); c.bezierCurveTo(DX + 56, 188, DX - 4, 172, DX + 7, DY + 51); c.closePath(); fill(c, pal.snow ? '#f6f9fc' : pal.leaves ? '#a89a80' : '#b4ad98');
      if (!pal.snow) for (let k = 0; k < 14; k++) oval(c, DX - 22 + r() * 40, 164 + r() * 50, 2 + r() * 2, 1 + r() * 0.8, 'rgba(70,70,90,0.22)');
      const thyme = ['#b49be0', '#9b7fd1', '#c9b6ea'];
      flowers(c, pal, 8, 92, 190, r, pal.leaves ? ['#b98a6a', '#a07858', '#c9a06a'] : thyme); flowers(c, pal, 168, 292, 198, r, pal.leaves ? ['#b98a6a', '#a07858', '#c9a06a'] : thyme);
      rect(c, 240, 171, 34, 4, '#a9a9bc'); rect(c, 244, 175, 4, 7, '#7c7c94'); rect(c, 266, 175, 4, 7, '#7c7c94'); ledge(c, pal, 240, 171, 34);
    } },

    lido: { name: 'Sunnybank Lido', of: 'Sunnybank Lido', draw(c, pal, r) {
      const CREAM = '#fbf3e2', SHADE = '#e4d7bd', CORAL = '#e4705f', BLUE = '#8fc7d8', STEEL = '#c9d4da';
      const open = !pal.snow && !pal.leaves;
      sky(c, pal, r, { hills: false, horizon: 130, sunX: 262, clouds: [[58, 30, 0.9], [176, 20, 0.7]] });
      // the hedge behind, and the sun terrace all round the pool
      c.beginPath(); c.moveTo(0, 118); for (let x = 0; x <= PW; x += 18) c.quadraticCurveTo(x + 9, 104 + (x % 36 ? 3 : -2), x + 18, 118); c.lineTo(PW, 130); c.lineTo(0, 130); c.closePath(); fill(c, pal.snow ? '#e4ecf2' : pal.canopy[1]);
      rect(c, 0, 124, PW, PH - 124, pal.snow ? '#eef2f5' : '#f2e6cf');
      c.strokeStyle = pal.snow ? 'rgba(150,170,185,0.3)' : 'rgba(170,140,100,0.28)'; c.lineWidth = 0.7; c.beginPath();
      for (let k = -5; k <= 5; k++) { c.moveTo(150 + k * 34, 124); c.lineTo(150 + k * 96, PH); }
      for (const y of [136, 152, 172, 197]) { c.moveTo(0, y); c.lineTo(PW, y); }
      c.stroke();
      // the changing huts along the left, coral and cream
      for (let k = 0; k < 4; k++) {
        const x = 6 + k * 15.4;
        rect(c, x, 96, 14.4, 30, k % 2 ? CREAM : CORAL); rect(c, x + 2.4, 101, 9.6, 24, k % 2 ? '#f0e4cb' : '#d65f4f'); dot(c, x + 10, 114, 0.9, '#e9c35a');
      }
      rect(c, 4, 92, 62, 5, BLUE); ledge(c, pal, 4, 92, 62);
      // the art deco pavilion: curved wings, a stepped tower and a ship's rail
      const wing = (x, w, round) => { rrect(c, x, 74, w, 52, round, CREAM); };
      wing(64, 172, [13, 13, 0, 0]);
      rect(c, 64, 112, 172, 14, SHADE);
      for (const y of [84, 88, 92]) { rect(c, 66, y, 54, 1.3, CORAL); rect(c, 180, y, 54, 1.3, CORAL); }
      for (const x of [76, 94, 206, 224]) { dot(c, x, 103, 5, '#fffaf0'); dot(c, x, 103, 3.5, pal.snow ? '#c3dbe6' : '#8fcfe2'); }
      line(c, STEEL, 0.9, [[68, 66], [120, 66]]); line(c, STEEL, 0.9, [[180, 66], [232, 66]]);
      for (let x = 70; x <= 118; x += 12) line(c, STEEL, 0.9, [[x, 66], [x, 74]]);
      for (let x = 182; x <= 230; x += 12) line(c, STEEL, 0.9, [[x, 66], [x, 74]]);
      ledge(c, pal, 64, 74, 56); ledge(c, pal, 180, 74, 56);
      rrect(c, 120, 52, 60, 74, [5, 5, 0, 0], CREAM); rrect(c, 130, 38, 40, 18, [5, 5, 0, 0], CREAM); rrect(c, 140, 26, 20, 16, [4, 4, 0, 0], CREAM);
      rect(c, 120, 52, 8, 74, 'rgba(190,170,140,0.28)');
      for (const x of [136, 145, 154, 163]) rect(c, x, 40, 2, 13, BLUE);
      ledge(c, pal, 120, 52, 60); ledge(c, pal, 130, 38, 40); ledge(c, pal, 140, 26, 20);
      line(c, '#8a8f98', 1, [[150, 26], [150, 8]]); poly(c, [[150, 8], [162, 11.5], [150, 15]], CORAL);
      word(c, 'LIDO', 150, 66, 12.5, CORAL, 900, SERIF);
      rect(c, 128, 73, 44, 1.4, BLUE);
      // a sunburst over the doors
      for (let k = 0; k < 9; k++) { const a = Math.PI + ((k + 0.5) / 9) * Math.PI, a1 = a - 0.14, a2 = a + 0.14; poly(c, [[150, 106], [150 + Math.cos(a1) * 24, 106 + Math.sin(a1) * 24], [150 + Math.cos(a2) * 24, 106 + Math.sin(a2) * 24]], k % 2 ? '#f2c84b' : CORAL); }
      rrect(c, 136, 104, 28, 22, [3, 3, 0, 0], BLUE); rect(c, 149.4, 104, 1.2, 22, CREAM); ledge(c, pal, 134, 104, 32);
      // the pool in perspective: a cream coping, then water or, in winter, a drained rimed basin
      const FAR = 128, NEAR = 206, fx0 = 84, fx1 = 216, nx0 = 34, nx1 = 266;
      const xAt = (a, t) => U.lerp(fx0 + (fx1 - fx0) * a, nx0 + (nx1 - nx0) * a, t), yAt = (t) => FAR + (NEAR - FAR) * t * (0.55 + 0.45 * t);
      poly(c, [[fx0 - 5, FAR - 3], [fx1 + 5, FAR - 3], [nx1 + 9, NEAR + 4], [nx0 - 9, NEAR + 4]], pal.snow ? SNOW : CREAM);
      if (pal.snow) {
        const ix0 = 97, ix1 = 203, iy = 147, gx0 = 56, gx1 = 244;
        poly(c, [[fx0, FAR], [fx1, FAR], [ix1, iy], [ix0, iy]], '#dfeaf0');
        poly(c, [[fx0, FAR], [ix0, iy], [gx0, NEAR], [nx0, NEAR]], '#c8dae4');
        poly(c, [[fx1, FAR], [nx1, NEAR], [gx1, NEAR], [ix1, iy]], '#e6f0f4');
        poly(c, [[ix0, iy], [ix1, iy], [gx1, NEAR], [gx0, NEAR]], '#d6e4eb');
        c.strokeStyle = 'rgba(120,155,175,0.4)'; c.lineWidth = 0.7; c.beginPath();
        for (let k = 0; k <= 8; k++) { const a = k / 8; c.moveTo(fx0 + (fx1 - fx0) * a, FAR); c.lineTo(ix0 + (ix1 - ix0) * a, iy); c.lineTo(gx0 + (gx1 - gx0) * a, NEAR); }
        for (const q of [0.33, 0.66]) { c.moveTo(U.lerp(fx0, ix0, q), U.lerp(FAR, iy, q)); c.lineTo(U.lerp(fx1, ix1, q), U.lerp(FAR, iy, q)); }
        for (const q of [0.14, 0.34, 0.6]) { c.moveTo(U.lerp(ix0, gx0, q), U.lerp(iy, NEAR, q)); c.lineTo(U.lerp(ix1, gx1, q), U.lerp(iy, NEAR, q)); }
        for (const q of [0.25, 0.5, 0.75]) { c.moveTo(U.lerp(fx0, nx0, q), U.lerp(FAR, NEAR, q)); c.lineTo(U.lerp(ix0, gx0, q), U.lerp(iy, NEAR, q)); c.moveTo(U.lerp(fx1, nx1, q), U.lerp(FAR, NEAR, q)); c.lineTo(U.lerp(ix1, gx1, q), U.lerp(iy, NEAR, q)); }
        c.stroke();
        // rime on the tiles, drifts against the walls and a skin of ice in the deep end
        for (let k = 0; k < 40; k++) { const q = r(), x = U.lerp(ix0, gx0, q) + (U.lerp(ix1, gx1, q) - U.lerp(ix0, gx0, q)) * r(), y = U.lerp(iy, NEAR, q); oval(c, x, y, 4 + r() * 13, 1 + r() * 2.6, 'rgba(255,255,255,0.45)'); }
        const drift = (x0, y0, x1, y1, w, dir) => {
          c.beginPath(); c.moveTo(x0, y0);
          for (let q = 0; q <= 1.001; q += 0.1) c.lineTo(U.lerp(x0, x1, q) + dir * (2 + w * q + 2.4 * Math.sin(q * 15)) * (y0 === y1 ? 0 : 1), U.lerp(y0, y1, q) + (y0 === y1 ? 3 + 1.4 * Math.sin(q * 19) : 0));
          c.lineTo(x1, y1); c.closePath(); fill(c, SNOW);
        };
        drift(ix0, iy, gx0, NEAR, 20, 1); drift(ix1, iy, gx1, NEAR, 20, -1); drift(ix0, iy, ix1, iy, 0, 1);
        oval(c, 150, 196, 72, 9, '#b4d3e4'); oval(c, 150, 195, 66, 7, '#c7e0ec');
        line(c, 'rgba(255,255,255,0.8)', 1, [[108, 192], [134, 197]]); line(c, 'rgba(255,255,255,0.8)', 1, [[150, 191], [190, 196]]);
      } else {
        const w = c.createLinearGradient(0, FAR, 0, NEAR);
        w.addColorStop(0, pal.leaves ? '#a9cfd2' : '#c4eef1'); w.addColorStop(1, pal.leaves ? '#5f9fb2' : '#5fc0dc');
        c.beginPath(); c.moveTo(fx0, FAR); c.lineTo(fx1, FAR); c.lineTo(nx1, NEAR); c.lineTo(nx0, NEAR); c.closePath(); c.fillStyle = w; c.fill();
        // the tiles showing through and the pale ripples on top
        c.strokeStyle = 'rgba(40,110,140,0.14)'; c.lineWidth = 1; c.beginPath();
        for (let k = 1; k < 8; k++) { c.moveTo(xAt(k / 8, 0), FAR); c.lineTo(xAt(k / 8, 1), NEAR); }
        for (const t of [0.2, 0.42, 0.62, 0.82]) { c.moveTo(xAt(0, t), yAt(t)); c.lineTo(xAt(1, t), yAt(t)); }
        c.stroke();
        for (let k = 0; k < 34; k++) { const t = r(), a = 0.04 + r() * 0.9, x = xAt(a, t), y = yAt(t), s = 3 + t * 9; c.strokeStyle = `rgba(255,255,255,${(0.35 + r() * 0.4).toFixed(2)})`; c.lineWidth = 0.6 + t * 0.8; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + s / 2, y - 1, x + s, y); c.stroke(); }
        // two lane ropes of coral and cream floats
        for (const a of [0.34, 0.67]) for (let k = 0; k <= 16; k++) { const t = k / 16; dot(c, xAt(a, t), yAt(t), 0.8 + t * 1.3, k % 2 ? CREAM : CORAL); }
        if (open) {
          // a flamingo float, drifting
          const fx = 112, fy = 172;
          oval(c, fx, fy + 4, 16, 4.6, 'rgba(30,90,120,0.25)'); c.lineWidth = 6; c.strokeStyle = '#f49aa8'; c.beginPath(); c.ellipse(fx, fy, 14, 5, 0, 0, 7); c.stroke();
          c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(fx, fy - 1, 14, 5, 0, 3.4, 5.2); c.stroke();
          line(c, '#f49aa8', 4, [[fx - 12, fy - 3], [fx - 15, fy - 14], [fx - 10, fy - 21]]); dot(c, fx - 9, fy - 22, 3.4, '#f49aa8'); poly(c, [[fx - 6.4, fy - 23.4], [fx - 1.6, fy - 20.6], [fx - 6.4, fy - 19.8]], '#3b352e'); dot(c, fx - 9.6, fy - 23, 0.8, '#3b352e');
        } else if (pal.leaves) {
          // fallen leaves floating
          for (let k = 0; k < 16; k++) { const t = r(), a = 0.06 + r() * 0.88, x = xAt(a, t), y = yAt(t); c.save(); c.translate(x, y); c.rotate(r() * 3); oval(c, 0, 0, 2 + t * 2, 1 + t, ['#d9822b', '#c9592f', '#e6ad3c'][k % 3]); c.restore(); }
        }
      }
      // a little fountain either side of the doors
      for (const JX of [108, 192]) {
        rrect(c, JX - 13, 120.5, 26, 5.5, 2, '#fffaf0'); rect(c, JX - 2.4, 112, 4.8, 9, CREAM); oval(c, JX, 112, 8, 2.2, BLUE); ledge(c, pal, JX - 13, 120.5, 26);
        if (open) { c.strokeStyle = '#57aecb'; c.lineWidth = 1.1; c.lineCap = 'round'; c.beginPath(); for (const s of [-1, 1]) { c.moveTo(JX, 110); c.quadraticCurveTo(JX + s * 3, 98, JX + s * 11, 119); } c.moveTo(JX, 110); c.lineTo(JX, 100); c.stroke(); }
      }
      // the diving board, high over the water on its pale blue tower
      const TX = 256, TB = 146, TT = 64;
      if (!pal.snow) poly(c, [[TX - 18, 146], [TX - 4, 146], [TX - 58, 156], [TX - 70, 155]], 'rgba(30,90,120,0.2)');
      oval(c, TX + 1, TB, 16, 2.4, 'rgba(60,40,20,0.16)');
      line(c, '#9fb0b9', 1.2, [[TX + 16, TB], [TX + 16, TT - 14], [TX - 6, TT - 14], [TX - 6, TT - 3]]);
      for (let y = TB - 8; y > TT; y -= 7) line(c, '#9fb0b9', 1.2, [[TX + 9, y], [TX + 16, y]]);
      for (const x of [TX - 9, TX + 9]) { rect(c, x - 2.8, TT, 5.6, TB - TT, '#7fbcd2'); rect(c, x + 0.8, TT, 2, TB - TT, '#5f9fb8'); }
      rect(c, TX - 9, TT + 30, 18, 3, '#7fbcd2'); rect(c, TX - 9, TT + 56, 18, 3, '#7fbcd2');
      rect(c, TX - 13, TT - 3, 30, 4.6, CREAM); rect(c, TX - 13, TT + 1, 30, 1.4, SHADE);
      poly(c, [[TX + 4, TT - 3], [TX - 54, TT + 7], [TX - 54, TT + 10.4], [TX + 4, TT + 0.4]], CORAL);
      poly(c, [[TX - 8, TT - 3], [TX + 4, TT - 3], [TX - 54, TT + 7], [TX - 66, TT + 6]], pal.snow ? SNOW : '#fff6e6');
      poly(c, [[TX - 66, TT + 6], [TX - 54, TT + 7], [TX - 54, TT + 10.4], [TX - 66, TT + 9.4]], '#c9503f');
      ledge(c, pal, TX - 13, TT - 3, 30);
      // a palm in a pot, wrapped up against the frost in winter
      const PM = 283, GREENS = ['#5f9a4c', '#72ad5c', '#4f8a3c'], crown = (dx, dy) => {
        const x0 = PM - 1, y0 = 136, mx = x0 + dx * 0.55, my = y0 + dy - 7, ex = x0 + dx, ey = y0 + dy + 5, s = dx > 0 ? 1 : -1;
        for (let k = 2; k <= 9; k++) {
          const t = k / 9, a = (1 - t) * (1 - t), b = 2 * t * (1 - t), d = t * t, x = a * x0 + b * mx + d * ex, y = a * y0 + b * my + d * ey, l = 8.5 * (1.15 - t);
          line(c, GREENS[k % 2], 1.7, [[x, y], [x + s * 2, y + l]]); line(c, GREENS[(k + 1) % 2], 1.7, [[x, y], [x + s * 3.4, y - l * 0.45]]);
        }
        c.strokeStyle = GREENS[2]; c.lineWidth = 1.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(mx, my, ex, ey); c.stroke();
      };
      if (pal.snow) { poly(c, [[PM - 7, 164], [PM - 3, 134], [PM + 3, 134], [PM + 7, 164]], '#d9c8a6'); line(c, '#b19a72', 1, [[PM - 5, 144], [PM + 5, 146]]); line(c, '#b19a72', 1, [[PM - 6, 156], [PM + 6, 158]]); oval(c, PM, 134, 6, 3, SNOW); }
      else {
        line(c, '#8a6a4a', 3, [[PM, 166], [PM - 1, 136]]);
        for (const [dx, dy] of [[-26, 4], [-22, -10], [-8, -15], [8, -15], [22, -10], [24, 4]]) crown(dx, dy);
      }
      rrect(c, PM - 9, 166, 18, 15, [2, 2, 6, 6], '#d98a63'); rect(c, PM - 10.5, 163.5, 21, 4, '#e6a27c'); ledge(c, pal, PM - 10, 164, 20);
      // the deck chairs and a parasol, out for the summer and put away after it
      const P = 34, PY = 158, chair = (x, y) => {
        const sling = [[x, y - 3], [x + 10, y - 3], [x + 23, y - 21], [x + 13, y - 21]];
        oval(c, x + 9, y + 1, 15, 2, 'rgba(60,40,20,0.16)');
        line(c, '#a98e66', 1.5, [[x + 15, y], [x + 1, y - 17]]);
        poly(c, sling, CREAM);
        for (const k of [0, 2]) poly(c, [[x + k * 2.5, y - 3], [x + (k + 1) * 2.5, y - 3], [x + 13 + (k + 1) * 2.5, y - 21], [x + 13 + k * 2.5, y - 21]], CORAL);
        line(c, '#a98e66', 1.5, [[x - 2, y], [x + 14, y - 23]]); line(c, '#a98e66', 1.5, [[x + 9, y], [x + 24, y - 23]]);
      };
      rect(c, P - 1, open ? 120 : 128, 2, PY - (open ? 120 : 128), '#a98e66');
      if (open) {
        oval(c, P, PY, 15, 2.6, 'rgba(60,40,20,0.2)');
        for (let k = 0; k < 6; k++) { const a = -30 + k * 10; c.beginPath(); c.moveTo(P, 108); c.quadraticCurveTo(P + a * 0.6, 110, P + a, 128); c.lineTo(P + a + 10, 128); c.quadraticCurveTo(P + (a + 10) * 0.6, 110, P, 108); fill(c, k % 2 ? CREAM : CORAL); }
        chair(6, 188); chair(268, 208);
      } else { poly(c, [[P - 4, 122], [P + 4, 122], [P + 2, 152], [P - 2, 152]], CORAL); poly(c, [[P - 1.6, 122], [P + 1.6, 122], [P + 0.8, 152], [P - 0.8, 152]], CREAM); if (pal.snow) oval(c, P, 122, 5, 2, SNOW); }
    } },
  };
  const WHERE = Object.keys(MOTIFS);

  // each postcard is painted once and kept
  const ARTS = new Map();
  function artOf(where, season) {
    const key = where + '|' + season;
    if (ARTS.has(key)) return ARTS.get(key);
    const cv = U.canvas(PW * RES, PH * RES), c = cv.getContext('2d');
    c.scale(RES, RES);
    let h = 7; for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) % 99991;
    const pal = SEASONS[season], r = U.rng(h);
    c.save(); MOTIFS[where].draw(c, pal, r); c.restore();
    weather(c, pal, r);
    caption(c, MOTIFS[where].name);
    // a postcard's white edge
    c.strokeStyle = '#fffaf1'; c.lineWidth = 8; c.strokeRect(0, 0, PW, PH);
    c.strokeStyle = 'rgba(160,140,110,0.35)'; c.lineWidth = 0.8; c.strokeRect(4.4, 4.4, PW - 8.8, PH - 8.8);
    while (ARTS.size >= 4) ARTS.delete(ARTS.keys().next().value);
    ARTS.set(key, cv);
    return cv;
  }

  // ---------------------------------------------------------------- CUTS
  // one knob, as cubic curves in units of the knob size: u along the cut
  // from its middle, v away from the piece the knob belongs to
  const KNOB = [
    [-0.16, 0],
    [[-0.10, 0], [-0.07, 0.05], [-0.11, 0.11]],
    [[-0.17, 0.22], [-0.10, 0.31], [0, 0.31]],
    [[0.10, 0.31], [0.17, 0.22], [0.11, 0.11]],
    [[0.07, 0.05], [0.10, 0], [0.16, 0]],
  ];
  // the line between two neighbouring pieces, as points from a to b; across
  // = it runs left to right (between two rows), else top to bottom
  function cut(r, ax, ay, bx, by, across) {
    const side = r() < 0.5 ? 1 : -1, k = (0.94 + r() * 0.12) * T, mid = 0.5 + (r() - 0.5) * 0.12;
    const mx = ax + (bx - ax) * mid, my = ay + (by - ay) * mid;
    const at = (u, v) => (across ? [mx + u * k, my + v * k * side] : [mx + v * k * side, my + u * k]);
    const pts = [[ax, ay], at(KNOB[0][0], KNOB[0][1])];
    let p = KNOB[0];
    for (const [c1, c2, q] of KNOB.slice(1)) {
      for (let s = 1; s <= 8; s++) {
        const t = s / 8, m = 1 - t, a = m * m * m, b = 3 * m * m * t, d = 3 * m * t * t, e = t * t * t;
        pts.push(at(a * p[0] + b * c1[0] + d * c2[0] + e * q[0], a * p[1] + b * c1[1] + d * c2[1] + e * q[1]));
      }
      p = q;
    }
    pts.push([bx, by]);
    return pts;
  }

  const TABLES = [
    { top: '#c99e69', line: 'rgba(110,70,35,0.16)', wood: true },
    { top: '#a87650', line: 'rgba(70,40,20,0.2)', wood: true },
    { top: '#5f8a6a', line: 'rgba(25,55,35,0.2)' },
    { top: '#56708f', line: 'rgba(25,40,60,0.2)' },
  ];
  const LIDS = ['#d98b63', '#8fbfe6', '#9cc5a1', '#bba9df', '#efb4ae'];

  // --------------------------------------------------------------- SCENE
  function jigsaw(S) {
    const r = S.r, o = S.opts || {};
    const where = MOTIFS[o.where] ? o.where : WHERE[(r() * WHERE.length) | 0];
    const season = SEASONS[o.season] && o.season !== 'summer' ? o.season : 'summer';
    const M = MOTIFS[where], art = artOf(where, season);
    const table = TABLES[(r() * TABLES.length) | 0], lidCol = LIDS[(r() * LIDS.length) | 0];
    // every inner cut gets its knob one way or the other
    const across = [], down = [];
    for (let i = 0; i < N - 1; i++) { across.push([]); for (let j = 0; j < N; j++) across[i].push(cut(r, j * CW, (i + 1) * CH, (j + 1) * CW, (i + 1) * CH, true)); }
    for (let i = 0; i < N; i++) { down.push([]); for (let j = 0; j < N - 1; j++) down[i].push(cut(r, (j + 1) * CW, i * CH, (j + 1) * CW, (i + 1) * CH, false)); }
    function outline(i, j) {
      const x0 = j * CW, y0 = i * CH, x1 = x0 + CW, y1 = y0 + CH;
      const top = i === 0 ? [[x0, y0], [x1, y0]] : across[i - 1][j];
      const right = j === N - 1 ? [[x1, y0], [x1, y1]] : down[i][j];
      const bottom = i === N - 1 ? [[x1, y1], [x0, y1]] : across[i][j].slice().reverse();
      const left = j === 0 ? [[x0, y1], [x0, y0]] : down[i][j - 1].slice().reverse();
      const pts = top.concat(right.slice(1), bottom.slice(1), left.slice(1, -1)), p = new Path2D();
      pts.forEach(([x, y], n) => (n ? p.lineTo(x, y) : p.moveTo(x, y)));
      p.closePath();
      return p;
    }
    // each piece is painted once, sharp, with a soft bevel round its edge
    function sprite(i, j, path) {
      const x0 = j * CW, y0 = i * CH, w = CW + 2 * E, h = CH + 2 * E;
      const body = U.canvas(w * RES, h * RES), b = body.getContext('2d');
      b.scale(RES, RES); b.translate(E - x0, E - y0);
      b.save(); b.clip(path);
      b.drawImage(art, 0, 0, PW, PH);
      b.lineWidth = 2.6;
      b.translate(1, 1); b.strokeStyle = 'rgba(255,252,240,0.55)'; b.stroke(path);
      b.translate(-2, -2); b.strokeStyle = 'rgba(40,28,16,0.3)'; b.stroke(path);
      b.restore();
      b.strokeStyle = 'rgba(60,44,28,0.5)'; b.lineWidth = 0.9; b.stroke(path);
      const shade = U.canvas(w, h), s = shade.getContext('2d');
      s.translate(E - x0, E - y0); s.fillStyle = '#2b2118'; s.fill(path);
      return { body, shade, w, h };
    }
    // where each piece waits in the lid: the nine spots shuffled, a little askew
    const spots = PZ.shuffle(r, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const pieces = [];
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const k = i * N + j, path = outline(i, j), spot = spots[k];
        const hx = HOME_X[spot % 3] + (r() - 0.5) * 14, hy = HOME_Y[(spot / 3) | 0] + (r() - 0.5) * 10;
        pieces.push({ k, i, j, path, g: sprite(i, j, path), tx: PX + j * CW + CW / 2, ty: PY + i * CH + CH / 2, hx, hy, x: hx, y: hy, s: SK, state: 'wait', land: 1 });
      }
    }
    const order = pieces.slice();   // drawing order in the lid: the last one picked up on top
    const hand = { x: 0, y: 0 };
    let held = null, placed = 0, doneT = 0, fx = null, hint = null, hintT = 0;
    const ALL = N * N;

    function place(p, pay) {
      if (p.state === 'placed') return;
      p.state = 'placed'; placed++;
      if (hint === p) hintT = 0;
      if (pay) {
        p.land = 0;
        fx.sound('drop'); fx.good(p.tx, p.ty);
        if (placed === ALL) fx.sound('chime');
      } else Object.assign(p, { x: p.tx, y: p.ty, s: 1, land: 1 });
    }
    // a piece at x, y (its middle), drawn at scale s; lift raises its shadow
    function drawPiece(c, p, x, y, s, lift) {
      const g = p.g, ax = E + CW / 2, ay = E + CH / 2;
      c.save(); c.globalAlpha = lift < 0 ? 0.14 : 0.22 + lift * 0.03;
      const off = lift < 0 ? 0.6 : 1.5 + lift * 2.2;
      c.drawImage(g.shade, x - ax * s + off, y - ay * s + off * 1.5, g.w * s, g.h * s);
      c.restore();
      c.drawImage(g.body, x - ax * s, y - ay * s, g.w * s, g.h * s);
    }

    // ------------------------------------------------------------ the table
    function tableTop(c) {
      const { x0, y0, x1, y1 } = S.bleed, rr = U.rng(4049);
      c.fillStyle = table.top; c.fillRect(x0, y0, x1 - x0, y1 - y0);
      c.strokeStyle = table.line;
      if (table.wood) {
        c.lineWidth = 1.4;
        for (let y = Math.floor(y0 / 46) * 46; y < y1; y += 46) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); }
        c.lineWidth = 0.7;
        for (let k = 0; k < 90; k++) { const x = x0 + rr() * (x1 - x0), y = y0 + rr() * (y1 - y0), l = 20 + rr() * 70; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + l * 0.3, y - 2, x + l * 0.6, y + 2, x + l, y); c.stroke(); }
      } else {
        c.fillStyle = table.line;
        for (let k = 0; k < 900; k++) c.fillRect(x0 + rr() * (x1 - x0), y0 + rr() * (y1 - y0), 1, 1);
      }
      // warm light from a lamp over the table
      const g = c.createRadialGradient(180, 150, 20, 180, 150, 420);
      g.addColorStop(0, 'rgba(255,238,196,0.3)'); g.addColorStop(1, 'rgba(255,238,196,0)');
      c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    }
    function card(c) {
      c.fillStyle = 'rgba(40,40,30,0.16)'; PZ.rr(c, 42, 13, 276, 44, 13); c.fill();
      c.fillStyle = PAPER; PZ.rr(c, 42, 9, 276, 44, 13); c.fill();
      c.strokeStyle = '#e5d9c6'; c.lineWidth = 1.2; c.stroke();
      PZ.text(c, 'Every piece to its place', 180, 25.5, { size: 16 });
      PZ.text(c, `A ${season === 'summer' ? '' : season + ' '}postcard of ${M.of}`, 180, 43, { size: 13, color: INK2, weight: 700, maxW: 260 });
    }
    // the board, with a pale print of the picture to work on
    function boardMat(c) {
      PZ.shadow(c, 180, PY + PH + 14, 160, 6, 0.16);
      c.fillStyle = 'rgba(40,30,20,0.18)'; PZ.rr(c, PX - 9, PY - 7, PW + 20, PH + 20, 6); c.fill();
      c.fillStyle = '#f3ead9'; PZ.rr(c, PX - 10, PY - 10, PW + 20, PH + 20, 6); c.fill();
      c.save(); c.globalAlpha = 0.3; c.drawImage(art, PX, PY, PW, PH); c.restore();
      c.fillStyle = 'rgba(243,234,217,0.35)'; c.fillRect(PX, PY, PW, PH);
      c.save(); c.translate(PX, PY); c.strokeStyle = 'rgba(80,60,40,0.16)'; c.lineWidth = 1;
      for (const p of pieces) c.stroke(p.path);
      c.restore();
    }
    // the open box lid the pieces wait in
    function lid(c) {
      const { x, y, w, h } = LID, rim = lidCol, inner = U.mix(lidCol, '#3b2a1a', 0.12);
      c.fillStyle = 'rgba(40,30,20,0.22)'; PZ.rr(c, x + 2, y + 5, w, h, 9); c.fill();
      c.fillStyle = rim; PZ.rr(c, x, y, w, h, 9); c.fill();
      c.fillStyle = U.mix(rim, '#fffaf1', 0.3); PZ.rr(c, x, y, w, 3, 2); c.fill();
      c.fillStyle = inner; PZ.rr(c, x + 9, y + 9, w - 18, h - 18, 5); c.fill();
      c.fillStyle = 'rgba(40,30,20,0.12)'; c.fillRect(x + 9, y + 9, w - 18, 5);
      // a little picture of the postcard on the rim, as on every jigsaw box
      c.save(); c.translate(x + w - 64, y + h - 7); c.rotate(-0.02);
      c.fillStyle = PAPER; PZ.rr(c, -2, -8, 58, 14, 3); c.fill();
      c.drawImage(art, 0, -6, 13.3, 10);
      PZ.text(c, '9 pieces', 33, -0.5, { size: 8.5, color: INK2, weight: 800 });
      c.restore();
    }

    const sc = {
      puzzle: true, indoor: true, steps: ALL,
      crop: { x: 15, y: 58, w: 330, h: 330 },
      decor(c) { tableTop(c); card(c); boardMat(c); lid(c); },
      draw(c, t, still) {
        // the hint: the place the piece goes glows
        if (!still && hint && hintT > 0 && hint.state !== 'placed') {
          const k = 0.5 + 0.5 * Math.sin(t * 5);
          c.save(); c.globalAlpha = Math.min(1, hintT / 0.4); c.translate(PX, PY);
          c.strokeStyle = `rgba(255,214,90,${0.6 + 0.4 * k})`; c.lineWidth = 3 + 2 * k; c.stroke(hint.path);
          c.fillStyle = 'rgba(255,230,150,0.18)'; c.fill(hint.path);
          c.restore();
        }
        for (const p of pieces) {
          if (p.state !== 'placed') continue;
          if (still) drawPiece(c, p, p.tx, p.ty, 1, -1);
          else drawPiece(c, p, p.x, p.y, p.s * (1 + 0.05 * Math.sin(p.land * Math.PI)), p.land < 1 ? 0 : -1);
        }
        // all in: the joins soften and the postcard is whole again
        if (placed === ALL) {
          c.save(); c.globalAlpha = still ? 0.72 : Math.min(0.72, doneT / 1.6); c.drawImage(art, PX, PY, PW, PH); c.restore();
        }
        for (const p of order) {
          if (p.state === 'placed' || (p.state === 'held' && !still)) continue;
          if (still) { drawPiece(c, p, p.hx, p.hy, SK, 0); continue; }
          const up = hint === p && hintT > 0 ? Math.min(1, hintT / 0.4) * (0.6 + 0.4 * Math.sin(t * 4)) : 0;
          if (up) PZ.glow(c, p.x, p.y - up * 7, 44, t);
          drawPiece(c, p, p.x, p.y - up * 7, p.s * (1 + up * 0.08), up * 2);
        }
        if (held && !still) drawPiece(c, held, held.x, held.y, held.s, 3);
      },
      step(dt) {
        hintT -= dt;
        if (placed === ALL) doneT += dt;
        for (const p of pieces) {
          let tx = p.hx, ty = p.hy, ts = SK, sp = 12;
          if (p.state === 'held') { tx = hand.x; ty = hand.y; ts = 1; sp = 22; }
          else if (p.state === 'placed') { tx = p.tx; ty = p.ty; ts = 1; sp = 18; }
          p.x = PZ.approach(p.x, tx, dt, sp); p.y = PZ.approach(p.y, ty, dt, sp); p.s = PZ.approach(p.s, ts, dt, 14);
          if (p.land < 1) p.land = Math.min(1, p.land + dt / 0.3);
        }
      },
      down(x, y) {
        if (held) return;
        let best = null, bd = 1e9;
        for (const p of pieces) {
          if (p.state !== 'wait') continue;
          if (Math.abs(x - p.x) > (CW / 2) * p.s + 10 || Math.abs(y - p.y) > (CH / 2) * p.s + 10) continue;
          const d = PZ.dist(x, y, p.x, p.y);
          if (d < bd) { bd = d; best = p; }
        }
        if (!best) return;
        held = best; best.state = 'held'; hand.x = x; hand.y = y - PZ.LIFT;
        order.splice(order.indexOf(best), 1); order.push(best);
        fx.sound('pick');
      },
      move(x, y) { if (held) { hand.x = x; hand.y = y - PZ.LIFT; } },
      up(x, y) {
        if (!held) return;
        const p = held; held = null;
        const dx = x, dy = y - PZ.LIFT; // judged where it is drawn
        if (PZ.dist(dx, dy, p.tx, p.ty) <= SNAP) { place(p, true); return; }
        // anywhere else it glides back to its spot in the lid
        p.state = 'wait';
        fx.sound(dy > LID.y - 10 ? 'drop' : 'nope');
      },
      cancel() { if (held) { held.state = 'wait'; held = null; } },
      progress: () => placed / ALL,
      solved: () => placed === ALL,
      // one piece lifts a little in the lid and its place glows
      hint() {
        if (placed === ALL) return;
        hint = HINT_ORDER.map((k) => pieces[k]).find((p) => p.state === 'wait') || null;
        hintT = 3.5;
      },
      save: () => ({ placed: pieces.map((p) => p.state === 'placed') }),
      load(s) {
        if (!s || !Array.isArray(s.placed) || s.placed.length !== ALL) return;
        s.placed.forEach((v, k) => { if (v === true) place(pieces[k], false); });
      },
      solveAll() { pieces.forEach((p) => place(p, false)); },
      // finger positions: pick a piece up in the lid, let go PZ.LIFT below its place
      debugPlan: () => pieces.filter((p) => p.state === 'wait').map((p) => ({ drag: [p.hx, p.hy, p.tx, p.ty + PZ.LIFT] })),
    };
    Object.defineProperty(sc, 'fx', { get: () => fx, set: (v) => { fx = v; } });
    return sc;
  }

  Object.assign(SCENES.KINDS, { jigsaw });
})();
