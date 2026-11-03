'use strict';
// Sort the buttons, a job made by hand for Button & Bead. Twelve buttons lie
// scattered on a felt mat on the counter, and four glass jars stand at the
// back, each with a paper tag that shows the button living in it: its
// colour, the shape that goes with that colour (a red button is always a
// heart, a blue one always round ...) and its holes, two or four. Every
// button goes in the jar where all of that matches; any other jar gives a
// little shake and the button hops back. Two of the jars always share a
// colour, so the holes matter as well. With opts.where = 'cottage' it is the
// sewing box in the cottage attic instead, seen from above: four tins in an
// open wicker box, with a card for each.
//   node test/run.mjs puzzle js/pz-buttons.js buttons --seeds 30 [--opts '{"where":"cottage"}']

(() => {
  const W = 360;
  const INK2 = PZ.INK2;
  const dot = (c, x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill(); };

  // six kinds of button: every colour has a shape of its own, so colour is never the only clue
  const KINDS = [
    { id: 'cherry', col: '#e47373', deep: '#a8444b', shape: 'heart' },
    { id: 'sky', col: '#84b7e3', deep: '#41729f', shape: 'round' },
    { id: 'butter', col: '#f3ce5e', deep: '#a8801f', shape: 'flower' },
    { id: 'mint', col: '#8acba6', deep: '#3d8560', shape: 'square' },
    { id: 'lavender', col: '#b9a3e3', deep: '#6e56a7', shape: 'star' },
    { id: 'cocoa', col: '#bb8a62', deep: '#784f30', shape: 'triangle' },
  ];
  // where the holes sit in each shape (its roomiest part), as a share of the size
  const HOLE_Y = { heart: 0.04, round: 0, flower: 0, square: 0, star: 0.04, triangle: 0.16 };
  // the shapes with a right way up only lean a little; the others lie any way round
  const LEAN = { heart: 0.7, star: 0.7, triangle: 0.7 };

  // the shop: the counter's back edge, where the jars stand, the tags
  const WALL = 238, BASE = 294, TAG_Y = -96;
  const JAR_X = [50, 137, 223, 310];
  // the attic: the open sewing box with a card and a tin for each kind
  const TIN_X = [66, 142, 218, 294], CARD_Y = 182, TIN_Y = 272;
  // the loose buttons start on a jittered grid of four by three
  const ROWS = [386, 458, 530], COLX = [56, 136, 216, 296];
  const IN_K = 0.58;                       // how big a button looks once it is in a jar or tin
  const HELD_K = 1.15;                     // and how big while it is held
  // a pile of up to five in a jar (front view) and in a tin (from above)
  const JAR_SLOTS = [[-15, -17], [14, -16], [0, -30], [-14, -43], [14, -44]];
  const TIN_SLOTS = [[-11, -9], [11, -8], [-3, 10], [13, 12], [0, 0]];
  // dropping into a jar: up to its mouth, down inside it, a little bounce
  const FALL_A = 0.16, FALL_B = 0.28, FALL_C = 0.12, FALL_T = FALL_A + FALL_B + FALL_C;
  const HOP_T = 0.45;

  // ------------------------------------------------------------- buttons
  function roundPoly(p, pts, rad) {
    const n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], m0 = mid(pts[n - 1], pts[0]);
    p.moveTo(m0[0], m0[1]);
    for (let i = 0; i < n; i++) { const a = pts[i], m = mid(a, pts[(i + 1) % n]); p.arcTo(a[0], a[1], m[0], m[1], rad); }
    p.closePath();
  }
  // a button's outline round 0, 0, about r from the middle
  const shapes = new Map();
  function shapePath(shape, r) {
    const key = shape + r;
    if (shapes.has(key)) return shapes.get(key);
    const p = new Path2D();
    if (shape === 'round') p.arc(0, 0, r, 0, Math.PI * 2);
    else if (shape === 'flower') {
      for (let i = 0; i <= 96; i++) {
        const a = (i / 96) * Math.PI * 2, d = r * (0.9 + 0.12 * Math.cos(a * 6));
        if (i) p.lineTo(Math.cos(a) * d, Math.sin(a) * d); else p.moveTo(d, 0);
      }
      p.closePath();
    } else if (shape === 'square') p.roundRect(-r * 0.86, -r * 0.86, r * 1.72, r * 1.72, r * 0.34);
    else if (shape === 'heart') {
      const s = r * 1.06, y = -s * 0.06;
      p.moveTo(0, y + s * 0.95);
      p.bezierCurveTo(-s * 1.34, y + s * 0.08, -s * 0.9, y - s * 1.04, 0, y - s * 0.4);
      p.bezierCurveTo(s * 0.9, y - s * 1.04, s * 1.34, y + s * 0.08, 0, y + s * 0.95);
      p.closePath();
    } else if (shape === 'star') {
      // a plump star with soft points, so the holes sit well inside it
      const pts = [];
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, d = i % 2 ? r * 0.68 : r * 1.14; pts.push([Math.cos(a) * d, Math.sin(a) * d]); }
      roundPoly(p, pts, r * 0.18);
    } else {
      const pts = [0, 1, 2].map((i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3; return [Math.cos(a) * r * 1.24, Math.sin(a) * r * 1.24 + r * 0.16]; });
      roundPoly(p, pts, r * 0.34);
    }
    if (shapes.size > 300) shapes.clear();
    shapes.set(key, p);
    return p;
  }
  // one button, its middle at x, y; rad is its size and k how big it is drawn (held, in a jar)
  function drawButton(c, b, x, y, rad, rot, k = 1) {
    const r = Math.round(rad * k * 2) / 2, path = shapePath(b.shape, r);
    c.save(); c.translate(x, y); c.rotate(rot);
    c.fillStyle = b.col; c.fill(path);
    // a soft light from the top left
    const g = c.createRadialGradient(-r * 0.38, -r * 0.46, r * 0.08, 0, 0, r * 1.25);
    g.addColorStop(0, 'rgba(255,255,255,0.5)'); g.addColorStop(0.5, 'rgba(255,255,255,0.04)'); g.addColorStop(1, 'rgba(60,35,20,0.22)');
    c.fillStyle = g; c.fill(path);
    // the raised rim round a shallow dish, then the edge
    c.save(); c.scale(0.72, 0.72);
    c.strokeStyle = U.rgba(b.deep, 0.34); c.lineWidth = Math.max(1, r * 0.09) / 0.72; c.stroke(path);
    c.restore();
    c.strokeStyle = b.deep; c.lineWidth = Math.max(1, r * 0.075); c.stroke(path);
    // the holes: two side by side, or four in a square
    const hy = HOLE_Y[b.shape] * r, d = r * 0.24, hr = Math.max(1.4, r * 0.115);
    const holes = b.holes === 2 ? [[-d, hy], [d, hy]] : [[-d, hy - d], [d, hy - d], [-d, hy + d], [d, hy + d]];
    for (const [hx, hy2] of holes) {
      dot(c, hx + hr * 0.2, hy2 + hr * 0.35, hr, 'rgba(255,255,255,0.42)');
      dot(c, hx, hy2, hr, 'rgba(52,38,30,0.82)');
    }
    c.restore();
  }
  // what a label shows: the button itself, big, and its holes in words
  function labelFace(c, b, y) {
    drawButton(c, b, 0, y, 13, 0);
    PZ.text(c, `${b.holes} holes`, 0, y + 20, { size: 10.5, weight: 800, color: INK2 });
  }
  // a little green tick once a jar has all its buttons
  function tick(c, x, y, k) {
    if (k < 0.02) return;
    const rad = 8 * (k >= 1 ? 1 : U.easeBack(k));
    dot(c, x, y, rad, '#6f9a6a');
    c.strokeStyle = '#fffaf1'; c.lineWidth = 2; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(x - rad * 0.42, y + rad * 0.02); c.lineTo(x - rad * 0.1, y + rad * 0.34); c.lineTo(x + rad * 0.45, y - rad * 0.3); c.stroke();
  }

  // ---------------------------------------------------------------- jars
  // a glass button jar, its foot at 0, 0 (front view)
  const JAR = (() => {
    const p = new Path2D();
    p.moveTo(-25, -146); p.lineTo(-25, -132);
    p.quadraticCurveTo(-37, -128, -37, -110);
    p.lineTo(-37, -11); p.quadraticCurveTo(-37, 0, -26, 0);
    p.lineTo(26, 0); p.quadraticCurveTo(37, 0, 37, -11);
    p.lineTo(37, -110); p.quadraticCurveTo(37, -128, 25, -132);
    p.lineTo(25, -146); p.closePath();
    return p;
  })();
  function jarBack(c) {
    c.fillStyle = 'rgba(214,236,231,0.42)'; c.fill(JAR);
    c.save(); c.clip(JAR);
    c.strokeStyle = 'rgba(110,150,145,0.2)'; c.lineWidth = 10; c.stroke(JAR);
    c.fillStyle = 'rgba(150,185,180,0.28)'; c.beginPath(); c.ellipse(0, -6, 33, 5, 0, 0, 7); c.fill();
    c.restore();
  }
  function jarFront(c) {
    c.save(); c.clip(JAR);
    c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(-40, -150, 80, 152);
    c.fillStyle = 'rgba(255,255,255,0.5)'; PZ.rr(c, -31, -104, 6, 88, 3); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.3)'; PZ.rr(c, -22, -100, 2.4, 60, 1.2); c.fill();
    c.fillStyle = 'rgba(70,110,105,0.1)'; c.fillRect(27, -130, 12, 132);
    c.restore();
    c.strokeStyle = 'rgba(92,128,122,0.62)'; c.lineWidth = 1.6; c.stroke(JAR);
    // the thick glass foot, the lip and the open mouth
    c.fillStyle = 'rgba(225,242,238,0.5)'; c.beginPath(); c.ellipse(0, -3, 30, 3, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(232,245,242,0.88)'; PZ.rr(c, -28, -154, 56, 10, 4); c.fill();
    c.strokeStyle = 'rgba(92,128,122,0.62)'; c.lineWidth = 1.4; c.stroke();
    c.fillStyle = 'rgba(120,155,150,0.45)'; c.beginPath(); c.ellipse(0, -151.5, 22, 3, 0, 0, 7); c.fill();
  }
  // a kraft paper tag on a string round the jar's neck
  function tagShape(c, ox, oy) {
    c.beginPath(); c.moveTo(ox - 22, oy - 17); c.lineTo(ox - 13, oy - 26); c.lineTo(ox + 13, oy - 26); c.lineTo(ox + 22, oy - 17);
    c.lineTo(ox + 22, oy + 23); c.quadraticCurveTo(ox + 22, oy + 26, ox + 19, oy + 26); c.lineTo(ox - 19, oy + 26);
    c.quadraticCurveTo(ox - 22, oy + 26, ox - 22, oy + 23); c.closePath();
  }
  function tagOn(c, j) {
    c.strokeStyle = '#a9805f'; c.lineWidth = 1.3;
    c.beginPath(); c.ellipse(0, -139, 26, 3.2, 0, 0, 7); c.stroke();
    c.beginPath(); c.moveTo(0, -136); c.lineTo(j.tagDx, TAG_Y - 19); c.stroke();
    c.save(); c.translate(j.tagDx, TAG_Y); c.rotate(j.tilt);
    c.fillStyle = 'rgba(60,40,20,0.2)'; tagShape(c, 1.5, 2.5); c.fill();
    c.fillStyle = '#f1e2c2'; tagShape(c, 0, 0); c.fill();
    c.strokeStyle = 'rgba(150,115,70,0.55)'; c.lineWidth = 1; c.stroke();
    dot(c, 0, -19, 4.2, '#e2cc9f'); dot(c, 0, -19, 2.2, 'rgba(90,70,50,0.7)');
    labelFace(c, j.kind, -1);
    tick(c, 16, -20, j.tick);
    c.restore();
  }

  // ---------------------------------------------------------------- tins
  // a round sewing tin seen from above, its middle at 0, 0
  function tinBack(c) {
    PZ.shadow(c, 3, 4, 35, 34, 0.22);
    dot(c, 0, 0, 33, '#c3c9ce');
    c.strokeStyle = '#87909a'; c.lineWidth = 1.4; c.beginPath(); c.arc(0, 0, 33, 0, 7); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 1.2; c.beginPath(); c.arc(0, 0, 30.6, 0, 7); c.stroke();
    const g = c.createRadialGradient(-6, -8, 4, 0, 0, 30);
    g.addColorStop(0, '#cfd5da'); g.addColorStop(1, '#8e98a1');
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, 28.5, 0, 7); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.22)'; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, 17, 0, 7); c.stroke();
    c.strokeStyle = 'rgba(40,50,60,0.18)'; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, 26.5, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
  }
  function tinFront(c) {
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 31.6, Math.PI * 0.15, Math.PI * 0.85); c.stroke();
  }
  function card(c, b, x, y, tilt) {
    c.save(); c.translate(x, y); c.rotate(tilt);
    c.fillStyle = 'rgba(60,40,20,0.2)'; PZ.rr(c, -25, -26, 52, 58, 4); c.fill();
    c.fillStyle = '#fffaf1'; PZ.rr(c, -26, -29, 52, 58, 4); c.fill();
    c.strokeStyle = '#e5d9c6'; c.lineWidth = 1.2; c.stroke();
    labelFace(c, b, -4);
    c.restore();
  }

  // ---------------------------------------------------------------- rooms
  function wood(c, r, x, y, w, h, col, grain = 'rgba(110,70,35,0.16)') {
    c.fillStyle = col; c.fillRect(x, y, w, h);
    c.strokeStyle = grain; c.lineWidth = 0.8;
    for (let i = 0; i < (w * h) / 300; i++) {
      const gx = x + r() * w, gy = y + 2 + r() * (h - 4), l = 12 + r() * 46;
      c.beginPath(); c.moveTo(gx, gy); c.lineTo(Math.min(x + w, gx + l), gy + (r() - 0.5) * 0.8); c.stroke();
    }
  }
  // wicker: short slanting strokes, row by row
  function weave(c, x, y, w, h, rad) {
    c.save(); PZ.rr(c, x, y, w, h, rad); c.clip();
    c.strokeStyle = 'rgba(120,80,40,0.35)'; c.lineWidth = 1.4; c.beginPath();
    for (let yy = y + 3, row = 0; yy < y + h; yy += 6, row++) for (let xx = x + (row % 2) * 5; xx < x + w; xx += 10) { c.moveTo(xx, yy); c.lineTo(xx + 5, yy + 3); }
    c.stroke();
    c.restore();
  }

  // the haberdashery: rose-striped wall, a brass rail of ribbon reels, the counter
  function shopDecor(c, B) {
    const { x0, y0, x1, y1 } = B, rr = U.rng(6203);
    c.fillStyle = '#f2dcd4'; c.fillRect(x0, y0, x1 - x0, WALL - y0);
    c.fillStyle = 'rgba(205,150,140,0.16)';
    for (let x = Math.floor(x0 / 24) * 24; x < x1; x += 24) c.fillRect(x, y0, 9, WALL - y0);
    c.fillStyle = 'rgba(79,150,150,0.32)'; c.beginPath();
    for (let y = Math.floor(y0 / 32) * 32 + 16, row = 0; y < WALL - 12; y += 32, row++) {
      for (let x = Math.floor(x0 / 48) * 48 + (row % 2 ? 40 : 16); x < x1; x += 48) {
        for (const [dx, dy, s] of [[0, 0, 1.3], [-2.6, 2.4, 1.1], [2.6, 2.4, 1.1]]) { c.moveTo(x + dx + s, y + dy); c.arc(x + dx, y + dy, s, 0, 7); }
      }
    }
    c.fill();
    PZ.text(c, 'Each button to its jar: same colour, shape and holes', W / 2, 24, { size: 13, color: INK2, maxW: 336 });
    // ribbon reels threaded on a brass rail, their loose ends hanging down
    const RY = 72;
    c.fillStyle = 'rgba(60,40,20,0.14)'; c.fillRect(24, RY + 3, 312, 3);
    for (const bx of [22, 338]) { dot(c, bx, RY, 5.5, '#a07c34'); dot(c, bx - 1, RY - 1, 2, 'rgba(255,240,200,0.6)'); }
    c.fillStyle = '#c9a24a'; c.fillRect(24, RY - 1.6, 312, 3.2); c.fillStyle = 'rgba(255,245,200,0.6)'; c.fillRect(24, RY - 1.6, 312, 1);
    const RIB = ['#e6a7a0', '#7fb8b4', '#efe2c8', '#b9a6d6', '#e3c46a', '#a5c79a', '#6f8fb6', '#e9b9c9'];
    for (let i = 0; i < 8; i++) {
      const x = 46 + i * 38.3, col = RIB[i], L = 16 + rr() * 16, w = 7, tx = x + 2;
      c.fillStyle = U.shade(col, -0.08);
      c.beginPath(); c.moveTo(tx, RY + 6); c.lineTo(tx + w, RY + 6); c.lineTo(tx + w, RY + L); c.lineTo(tx + w / 2, RY + L - 4); c.lineTo(tx, RY + L); c.closePath(); c.fill();
      dot(c, x, RY, 14, col);
      c.strokeStyle = U.shade(col, -0.14); c.lineWidth = 0.9;
      for (const rad of [11.4, 8.6]) { c.beginPath(); c.arc(x, RY, rad, 0, 7); c.stroke(); }
      c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 1.4; c.beginPath(); c.arc(x, RY, 12.4, Math.PI * 1.1, Math.PI * 1.55); c.stroke();
      dot(c, x, RY, 5.4, '#dcbf8f'); dot(c, x, RY, 2.2, '#9a7a3a');
    }
    // the counter: a moulding against the wall, then its polished top
    wood(c, rr, x0, WALL, x1 - x0, y1 - WALL, '#c9a170');
    c.fillStyle = '#9b7146'; c.fillRect(x0, WALL - 5, x1 - x0, 7);
    c.fillStyle = 'rgba(255,238,205,0.4)'; c.fillRect(x0, WALL - 5, x1 - x0, 1.4);
    c.fillStyle = 'rgba(70,45,20,0.12)'; c.fillRect(x0, WALL + 2, x1 - x0, 10);
    for (const x of JAR_X) PZ.shadow(c, x + 3, BASE + 1, 41, 6.5, 0.2);
    // a felt mat for the loose buttons, with a stitched edge
    c.fillStyle = 'rgba(40,30,20,0.2)'; PZ.rr(c, 16, 337, 332, 238, 14); c.fill();
    c.fillStyle = '#2f6a66'; PZ.rr(c, 14, 333, 332, 238, 14); c.fill();
    for (let i = 0; i < 260; i++) { c.fillStyle = rr() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,30,30,0.08)'; c.fillRect(18 + rr() * 324, 337 + rr() * 230, 1.5, 1.5); }
    c.setLineDash([5, 4]); c.strokeStyle = 'rgba(225,240,232,0.55)'; c.lineWidth = 1.4; PZ.rr(c, 22, 341, 316, 222, 9); c.stroke(); c.setLineDash([]);
    // the brass yard measure set into the front edge
    c.fillStyle = '#b48d3c'; c.fillRect(x0, 584, x1 - x0, 11);
    c.fillStyle = 'rgba(255,240,190,0.55)'; c.fillRect(x0, 584, x1 - x0, 1.4);
    c.strokeStyle = 'rgba(80,55,20,0.6)'; c.lineWidth = 1; c.beginPath();
    for (let x = Math.floor(x0 / 9) * 9; x < x1; x += 9) { c.moveTo(x + 0.5, 585.5); c.lineTo(x + 0.5, 585.5 + (Math.round(x / 9) % 4 === 0 ? 6 : 3)); }
    c.stroke();
  }

  // the cottage attic from above: floorboards, a rag rug and the open sewing box
  function atticDecor(c, B, jars) {
    const { x0, y0, x1, y1 } = B, rr = U.rng(7307);
    const TONES = ['#c6a173', '#bb966a', '#caa87c', '#bf9a6c'];
    for (let x = Math.floor(x0 / 46) * 46; x < x1; x += 46) {
      const k = ((Math.round(x / 46) % 4) + 4) % 4;
      c.fillStyle = TONES[k]; c.fillRect(x, y0, 46, y1 - y0);
      c.fillStyle = 'rgba(80,50,25,0.38)'; c.fillRect(x, y0, 1.6, y1 - y0);
      c.fillRect(x, 110 + ((k * 137) % 330), 46, 1.4);
      c.strokeStyle = 'rgba(110,70,35,0.16)'; c.lineWidth = 0.8; c.beginPath();
      for (let i = 0; i < 14; i++) { const gx = x + 4 + rr() * 38, gy = y0 + rr() * (y1 - y0), l = 30 + rr() * 80; c.moveTo(gx, gy); c.lineTo(gx + (rr() - 0.5), gy + l); }
      c.stroke();
      for (let y = 60; y < y1; y += 150) { dot(c, x + 8, y, 1.6, 'rgba(70,50,35,0.55)'); dot(c, x + 38, y, 1.6, 'rgba(70,50,35,0.55)'); }
    }
    // the light from the round window
    const g = c.createRadialGradient(330, 10, 10, 330, 10, 320);
    g.addColorStop(0, 'rgba(255,240,205,0.38)'); g.addColorStop(1, 'rgba(255,240,205,0)');
    c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    // a braided rag rug, cream in the middle so every button shows on it
    const RCY = 462;
    PZ.shadow(c, 182, RCY + 4, 181, 129, 0.16);
    for (const [d, col] of [[0, '#8dbdb5'], [8, '#f4ead8'], [12, '#e5b1a8'], [18, '#f5ecdb']]) { c.fillStyle = col; c.beginPath(); c.ellipse(180, RCY, 180 - d, 128 - d, 0, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(170,140,110,0.16)'; c.lineWidth = 1.2;
    for (let d = 24; d < 120; d += 9) { c.beginPath(); c.ellipse(180, RCY, 180 - d, 128 - d, 0, 0, 7); c.stroke(); }
    // the note with what to do, taped down
    c.save(); c.translate(180, 23); c.rotate(-0.012);
    c.fillStyle = 'rgba(60,40,20,0.16)'; PZ.rr(c, -150, -12, 302, 28, 5); c.fill();
    c.fillStyle = '#fffaf1'; PZ.rr(c, -151, -14, 302, 28, 5); c.fill();
    c.fillStyle = 'rgba(242,216,138,0.75)'; c.fillRect(-14, -18, 28, 9);
    PZ.text(c, 'Each button to its tin: same colour, shape and holes', 0, 0.5, { size: 12.5, color: INK2, maxW: 290 });
    c.restore();
    // the lid, lying open behind the box: a wicker frame round a quilted lining
    c.fillStyle = 'rgba(60,40,20,0.2)'; PZ.rr(c, 28, 50, 308, 78, 10); c.fill();
    c.fillStyle = '#c99f62'; PZ.rr(c, 26, 46, 308, 78, 10); c.fill();
    weave(c, 26, 46, 308, 78, 10);
    c.fillStyle = '#f2e5d3'; PZ.rr(c, 36, 55, 288, 60, 6); c.fill();
    c.save(); PZ.rr(c, 36, 55, 288, 60, 6); c.clip();
    c.strokeStyle = 'rgba(190,160,130,0.45)'; c.lineWidth = 1; c.setLineDash([3, 3]); c.beginPath();
    for (let k = -80; k < 360; k += 20) { c.moveTo(k, 55); c.lineTo(k + 60, 115); c.moveTo(k + 60, 55); c.lineTo(k, 115); }
    c.stroke(); c.setLineDash([]);
    c.restore();
    sewingThings(c);
    for (const hx of [100, 260]) { c.fillStyle = '#b48d3c'; c.fillRect(hx - 8, 121, 16, 8); c.fillStyle = 'rgba(255,240,200,0.6)'; c.fillRect(hx - 8, 121, 16, 1.5); }
    // the box: a wicker rim round a teal lining with little dots
    c.fillStyle = 'rgba(60,40,20,0.24)'; PZ.rr(c, 17, 132, 332, 212, 12); c.fill();
    c.fillStyle = '#c49a5e'; PZ.rr(c, 14, 127, 332, 211, 12); c.fill();
    weave(c, 14, 127, 332, 211, 12);
    c.fillStyle = '#a7cdc7'; PZ.rr(c, 26, 139, 308, 187, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath();
    for (let y = 147, row = 0; y < 322; y += 15, row++) for (let x = 34 + (row % 2) * 8; x < 330; x += 16) { c.moveTo(x + 1.3, y); c.arc(x, y, 1.3, 0, 7); }
    c.fill();
    c.fillStyle = 'rgba(40,60,60,0.16)'; c.fillRect(26, 139, 308, 7);
    // a card for each tin, tucked behind a ribbon along the back
    for (const j of jars) card(c, j.kind, j.x, CARD_Y, j.tilt);
    c.fillStyle = '#e2a39b'; c.fillRect(26, 147, 308, 10);
    c.fillStyle = 'rgba(150,70,70,0.3)'; c.fillRect(26, 147, 308, 1.2); c.fillRect(26, 155.8, 308, 1.2);
  }
  // on the lining of the lid: a pincushion, two reels of thread, a tape measure and a thimble
  function sewingThings(c) {
    const pin = (x, y, ex, ey, head) => {
      c.strokeStyle = '#a9b0b6'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y); c.lineTo(ex, ey); c.stroke();
      dot(c, ex, ey, 2.6, head);
    };
    PZ.shadow(c, 76, 90, 18, 16, 0.18);
    dot(c, 74, 85, 17, '#d9534f');
    c.strokeStyle = 'rgba(120,30,30,0.4)'; c.lineWidth = 1; c.beginPath();
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; c.moveTo(74, 85); c.quadraticCurveTo(74 + Math.cos(a + 0.4) * 10, 85 + Math.sin(a + 0.4) * 10, 74 + Math.cos(a) * 17, 85 + Math.sin(a) * 17); }
    c.stroke();
    c.fillStyle = '#6f9a6a';
    for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; c.beginPath(); c.ellipse(74 + Math.cos(a) * 3.4, 85 + Math.sin(a) * 3.4, 3.6, 1.6, a, 0, 7); c.fill(); }
    pin(62, 74, 55, 66, '#f2d88a'); pin(86, 74, 93, 66, '#8fbfe6'); pin(87, 96, 95, 103, '#fffaf1'); pin(60, 96, 52, 103, '#bba9df');
    // reels of thread, lying on their sides
    for (const [x, y, col] of [[142, 74, '#e39a9a'], [178, 98, '#6fb0aa']]) {
      c.fillStyle = col; c.fillRect(x - 13, y - 8, 26, 16);
      c.strokeStyle = U.shade(col, -0.18); c.lineWidth = 0.8; c.beginPath();
      for (let yy = y - 6; yy < y + 8; yy += 3) { c.moveTo(x - 13, yy); c.lineTo(x + 13, yy + 1); }
      c.stroke();
      for (const ex of [x - 14, x + 14]) { c.fillStyle = '#d9b98a'; c.beginPath(); c.ellipse(ex, y, 3.6, 10.5, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(110,80,40,0.45)'; c.stroke(); }
    }
    // a tape measure, its tape run out a little way
    c.fillStyle = '#f6e6a0'; c.fillRect(246, 90, 66, 8);
    c.strokeStyle = 'rgba(110,90,40,0.6)'; c.lineWidth = 0.8; c.beginPath();
    for (let x = 250; x < 312; x += 5) { c.moveTo(x, 90); c.lineTo(x, x % 10 < 5 ? 95 : 93); }
    c.stroke();
    dot(c, 238, 86, 15, '#f2c94c'); dot(c, 238, 86, 6, '#d4a72c');
    c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1.4; c.beginPath(); c.arc(238, 86, 12, Math.PI * 1.1, Math.PI * 1.6); c.stroke();
    // a thimble
    dot(c, 302, 70, 7.5, '#c3c9ce');
    for (const [dx, dy] of [[-2.5, -2], [0.5, -3], [3, -1], [-2, 1.5], [1.5, 2]]) dot(c, 302 + dx, 70 + dy, 0.8, 'rgba(70,80,90,0.55)');
    c.strokeStyle = '#8e969d'; c.lineWidth = 1; c.beginPath(); c.arc(302, 70, 7.5, 0, 7); c.stroke();
  }

  // ---------------------------------------------------------------- scene
  function buttons(S) {
    const r = S.r, attic = !!(S.opts && S.opts.where === 'cottage');
    // four kinds of jar: one colour always twice, with two holes and with four
    const cols = PZ.shuffle(r, KINDS.slice());
    const pairs = r() < 0.35 ? [[cols[0], 2], [cols[0], 4], [cols[1], 2], [cols[1], 4]]
      : [[cols[0], 2], [cols[0], 4], [cols[1], r() < 0.5 ? 2 : 4], [cols[2], r() < 0.5 ? 2 : 4]];
    const kinds = PZ.shuffle(r, pairs).map(([k, holes]) => Object.assign({}, k, { holes }));
    // how many each jar takes: two to four, twelve in all
    const counts = [3, 3, 3, 3];
    for (let k = 0; k < 3; k++) { const a = (r() * 4) | 0, b = (r() * 4) | 0; if (a !== b && counts[a] > 2 && counts[b] < 4) { counts[a]--; counts[b]++; } }
    const XS = attic ? TIN_X : JAR_X;
    const jars = kinds.map((kind, i) => ({ i, kind, x: XS[i], want: counts[i], items: [], shakeT: 0, tick: 0, tilt: (r() - 0.5) * 0.12, tagDx: (r() - 0.5) * 6 }));
    // the buttons, one per spot on the grid, the spots shuffled
    const spots = [];
    for (const y of ROWS) for (const x of COLX) spots.push([x + (r() - 0.5) * 18, y + (r() - 0.5) * 14]);
    PZ.shuffle(r, spots);
    const owners = [];
    jars.forEach((j) => { for (let k = 0; k < j.want; k++) owners.push(j); });
    const pieces = owners.map((jar, n) => {
      const [hx, hy] = spots[n], kind = jar.kind;
      const rot = LEAN[kind.shape] ? (r() - 0.5) * LEAN[kind.shape] : r() * Math.PI * 2;
      return { n, jar, kind, rad: 22 + r() * 3, rot, hx, hy, x: hx, y: hy, tx: hx, ty: hy, placed: false, fall: null, hop: null, slot: -1 };
    });
    const order = [];
    let held = null, gdx = 0, gdy = 0, hint = null, hintT = 0, fx = null;

    const slotAt = (j, k) => {
      const s = (attic ? TIN_SLOTS : JAR_SLOTS)[k] || [0, 0];
      return attic ? { x: j.x + s[0], y: TIN_Y + s[1] } : { x: j.x + s[0], y: BASE + s[1] };
    };
    // a jar takes whatever is let go above it, from the top of its tag to its foot
    function zoneOf(x, y) {
      if (attic ? y < 132 || y > 340 : y < 118 || y > 318) return null;
      let best = null, bd = 44;
      for (const j of jars) { const d = Math.abs(x - j.x); if (d < bd) { best = j; bd = d; } }
      return best;
    }
    const target = (j) => ({ x: j.x, y: attic ? TIN_Y : BASE - 66 });
    function settle(p, snap) {
      const j = p.jar;
      p.placed = true; p.slot = j.items.length; j.items.push(p); order.push(p.n);
      const s = slotAt(j, p.slot);
      p.tx = s.x; p.ty = s.y; p.hop = null;
      if (snap) { p.x = s.x; p.y = s.y; p.fall = null; return; }
      p.fall = { t: 0, x0: p.x, y0: p.y, k0: HELD_K, mx: attic ? s.x : j.x, my: attic ? s.y - 6 : BASE - 166 };
    }
    // where a button dropping into its jar is now, and how big
    function fallAt(p) {
      const f = p.fall;
      if (f.t < FALL_A) { const k = U.easeOut(f.t / FALL_A); return { x: U.lerp(f.x0, f.mx, k), y: U.lerp(f.y0, f.my, k), k: U.lerp(f.k0, IN_K * 1.12, k) }; }
      if (f.t < FALL_A + FALL_B) { const k = (f.t - FALL_A) / FALL_B; return { x: U.lerp(f.mx, p.tx, k), y: U.lerp(f.my, p.ty, k * k), k: U.lerp(IN_K * 1.12, IN_K, k) }; }
      const k = Math.min(1, (f.t - FALL_A - FALL_B) / FALL_C);
      return { x: p.tx, y: p.ty - Math.sin(Math.PI * k) * 4, k: IN_K };
    }
    const inside = (p, still) => p.placed && (still || !p.fall || p.fall.t >= FALL_A);

    function drawJar(c, j, still) {
      const wob = j.shakeT > 0 ? Math.sin(j.shakeT * 26) * Math.min(1, j.shakeT * 2.2) : 0;
      const ox = attic ? j.x + wob * 3 : j.x, oy = attic ? TIN_Y : BASE;
      c.save(); c.translate(ox, oy);
      if (!attic) c.rotate(wob * 0.06);
      if (attic) tinBack(c); else jarBack(c);
      c.save();
      if (attic) { c.beginPath(); c.arc(0, 0, 28.5, 0, 7); c.clip(); } else c.clip(JAR);
      for (const p of j.items) {
        if (!inside(p, still)) continue;
        const q = still || !p.fall ? { x: p.tx, y: p.ty, k: IN_K } : fallAt(p);
        drawButton(c, p.kind, q.x - j.x, q.y - oy, p.rad, p.rot, q.k);
      }
      c.restore();
      if (attic) tinFront(c); else { jarFront(c); tagOn(c, j); }
      c.restore();
      if (attic) tick(c, j.x + 21, CARD_Y - 25, j.tick);
    }

    const sc = {
      puzzle: true, indoor: true, steps: pieces.length,
      crop: attic ? { x: 0, y: 118, w: 360, h: 360 } : { x: 0, y: 112, w: 360, h: 360 },
      decor(c) { if (attic) atticDecor(c, S.bleed, jars); else shopDecor(c, S.bleed); },
      draw(c, t, still) {
        if (hint && hintT > 0 && !still && !hint.placed) {
          PZ.glow(c, hint.x, hint.y, hint.rad + 7, t);
          PZ.glow(c, hint.jar.x + (attic ? 0 : hint.jar.tagDx), attic ? CARD_Y : BASE + TAG_Y, 33, t);
        }
        for (const j of jars) drawJar(c, j, still);
        // the loose buttons, a button on its way into a jar, then the one in the hand
        const loose = pieces.filter((p) => !p.placed && (still || p !== held)).sort((a, b) => a.y - b.y);
        for (const p of loose) {
          const x = still ? p.hx : p.x, y = still ? p.hy : p.y;
          PZ.shadow(c, x + 2, y + p.rad * 0.72, p.rad * 0.86, p.rad * 0.3, 0.2);
          drawButton(c, p.kind, x, y, p.rad, p.rot);
        }
        if (!still) {
          for (const p of pieces) if (p.placed && p.fall && p.fall.t < FALL_A) { const q = fallAt(p); drawButton(c, p.kind, q.x, q.y, p.rad, p.rot, q.k); }
          if (held) {
            PZ.shadow(c, held.x + 5, held.y + held.rad * 1.3, held.rad * 0.8, held.rad * 0.26, 0.14);
            drawButton(c, held.kind, held.x, held.y, held.rad, held.rot, HELD_K);
          }
        }
      },
      step(dt) {
        hintT -= dt;
        for (const p of pieces) {
          if (p.fall) { p.fall.t += dt; if (p.fall.t >= FALL_T) { p.fall = null; p.x = p.tx; p.y = p.ty; } continue; }
          if (p.hop) {
            const h = p.hop; h.t += dt;
            const k = Math.min(1, h.t / HOP_T);
            p.x = U.lerp(h.x0, p.hx, k); p.y = U.lerp(h.y0, p.hy, k) - Math.sin(Math.PI * k) * 42;
            if (k >= 1) p.hop = null;
            continue;
          }
          p.x = PZ.approach(p.x, p.tx, dt); p.y = PZ.approach(p.y, p.ty, dt);
        }
        for (const j of jars) {
          if (j.shakeT > 0) j.shakeT = Math.max(0, j.shakeT - dt);
          j.tick = PZ.approach(j.tick, j.items.length >= j.want && j.items.every((p) => !p.fall) ? 1 : 0, dt, 9);
        }
      },
      down(x, y) {
        if (held) return;
        let best = null, bd = Infinity;
        for (const p of pieces) {
          if (p.placed) continue;
          const d = PZ.dist(p.x, p.y, x, y);
          if (d < p.rad + 8 && d < bd) { best = p; bd = d; }
        }
        if (!best) return;
        held = best; best.hop = null; gdx = best.x - x; gdy = best.y - y;
        best.tx = x + gdx; best.ty = y + gdy - PZ.LIFT;
        fx.sound('pick');
      },
      move(x, y) { if (held) { held.tx = x + gdx; held.ty = y + gdy - PZ.LIFT; } },
      up(x, y) {
        if (!held) return;
        const p = held; held = null;
        const dx = x + gdx, dy = y + gdy - PZ.LIFT; // judged where it is drawn
        const j = zoneOf(dx, dy);
        if (j && j === p.jar) {
          settle(p, false);
          const g = target(j);
          fx.sound('drop'); fx.good(g.x, g.y);
          if (hint === p) hintT = 0;
          return;
        }
        p.tx = p.hx; p.ty = p.hy;
        if (j) { j.shakeT = 0.55; p.hop = { t: 0, x0: p.x, y0: p.y }; fx.sound('nope'); return; } // not this jar: a little shake, and it hops home
        fx.sound(dy > (attic ? 340 : 320) ? 'drop' : 'nope'); // set down on the mat again is not a wrong move
      },
      cancel() { if (held) { held.tx = held.hx; held.ty = held.hy; held = null; } },
      progress: () => order.length / pieces.length,
      solved: () => order.length === pieces.length,
      hint() {
        if (order.length === pieces.length) return;
        hint = pieces.find((p) => !p.placed && p !== held) || null; hintT = 3.5;
      },
      save: () => ({ in: order.slice() }),
      load(s) {
        if (!s || !Array.isArray(s.in)) return;
        for (const n of s.in) { const p = pieces[n]; if (Number.isInteger(n) && p && !p.placed) settle(p, true); }
      },
      solveAll() { for (const p of pieces) if (!p.placed) settle(p, true); },
      // finger positions: pick the button up, let go PZ.LIFT below the middle of its jar
      debugPlan: () => pieces.filter((p) => !p.placed).map((p) => { const g = target(p.jar); return { drag: [p.hx, p.hy, g.x, g.y + PZ.LIFT] }; }),
    };
    Object.defineProperty(sc, 'fx', { get: () => fx, set: (v) => { fx = v; } });
    return sc;
  }

  Object.assign(SCENES.KINDS, { buttons });
})();
