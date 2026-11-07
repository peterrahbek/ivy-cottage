'use strict';
// What's missing: a thinking job for looking closely. A cosy, cluttered
// corner (the lost-property shelves at the station, the cottage attic, the
// café store room, the bookshop stockroom, the rescue barn or the curiosity
// shop's cabinet) with twelve little things tucked in among the clutter. The
// list pinned below shows five of them, each as a little picture with its
// name. Tap one of them in the picture and it is ticked off the list; a tap
// anywhere else only stirs up a little puff of dust. Every thing has a shape
// of its own, so colour is never the only clue, and the list always shows
// exactly what to look for.
//   node test/run.mjs puzzle js/pz-seek.js seek --seeds 30 [--opts '{"where":"attic"}']

(() => {
  const TOP = 34, BOT = 446;                  // the cluttered corner
  const CELLS = [46, 113, 180, 247, 314];     // the five places on the list
  const LIST_Y = 456, PIC_Y = 502;
  const ASK = 5, HIT = 26, RING = 23;
  const INKL = 'rgba(59,53,46,0.55)';
  const TAU = Math.PI * 2;

  // ------------------------------------------------------------ drawing kit
  const p2 = (f) => { const p = new Path2D(); f(p); return p; };
  // an ellipse as its own closed shape (ccw for a hole cut out of another)
  function E(p, x, y, rx, ry, rot = 0, ccw = false) {
    p.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot));
    p.ellipse(x, y, rx, ry, rot, 0, TAU, ccw);
    p.closePath();
  }
  function fs(c, p, fill, lw = 1.2) {
    c.fillStyle = fill; c.fill(p);
    if (lw) { c.strokeStyle = INKL; c.lineWidth = lw; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(p); }
  }
  function shine(c, x, y, rx, ry, a = 0.45, rot = -0.5) {
    c.fillStyle = `rgba(255,255,255,${a})`; c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU); c.fill();
  }
  function ln(c, pts, col, w = 1.4) {
    c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    c.stroke();
  }
  // a stroke with an ink edge: drawn wide in ink, then narrower in colour
  function rope(c, build, col, w) {
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); build(c);
    c.strokeStyle = INKL; c.lineWidth = w + 2; c.stroke();
    c.strokeStyle = col; c.lineWidth = w; c.stroke();
  }
  // a small seeded random of our own, for the grain and straw that never change
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function wood(c, r, x, y, w, h, col, grain = 'rgba(110,70,35,0.18)') {
    c.fillStyle = col; c.fillRect(x, y, w, h);
    c.strokeStyle = grain; c.lineWidth = 0.8;
    for (let i = 0; i < (w * h) / 260; i++) {
      const gx = x + r() * w, gy = y + 2 + r() * Math.max(1, h - 4), l = 10 + r() * 40;
      c.beginPath(); c.moveTo(gx, gy); c.lineTo(Math.min(x + w, gx + l), gy + (r() - 0.5) * 0.8); c.stroke();
    }
  }

  // ------------------------------------------------------------ the things
  // Each is drawn around 0, 0 inside about 34 x 34 units, resting on y = 15.
  function glove(c, col, cuff, deep) {
    const g = p2((p) => {
      p.roundRect(-9, -3, 18, 15, 4);
      for (const [x, h] of [[-8.8, 13], [-4.4, 16.5], [0, 17], [4.4, 14.5]]) p.roundRect(x, 1 - h, 4.4, h, 2.2);
      E(p, -10.5, 4, 3.4, 6.5, -0.6);
    });
    fs(c, g, col);
    c.strokeStyle = deep; c.lineWidth = 0.9;
    for (const x of [-4.4, 0, 4.4]) { c.beginPath(); c.moveTo(x, -3); c.lineTo(x, 2); c.stroke(); }
    fs(c, p2((p) => p.roundRect(-10, 9, 20, 6, 2)), cuff);
    c.strokeStyle = 'rgba(59,53,46,0.25)'; c.lineWidth = 0.8;
    for (let x = -7; x <= 7; x += 3.5) { c.beginPath(); c.moveTo(x, 10); c.lineTo(x, 14); c.stroke(); }
    shine(c, -3, 2, 3, 1.6, 0.3);
  }
  function feather(c, col, nib) {
    c.save(); c.rotate(0.5);
    const v = p2((p) => { p.moveTo(0, -18); p.bezierCurveTo(8.5, -10, 7, 6, 1, 11); p.lineTo(-1, 11); p.bezierCurveTo(-7.5, 4, -7.5, -10, 0, -18); p.closePath(); });
    fs(c, v, col);
    c.save(); c.clip(v);
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1;
    for (const [y, s] of [[-9, 1], [-3, -1], [3, 1], [-6, -1]]) { c.beginPath(); c.moveTo(0, y); c.lineTo(9 * s, y - 4); c.stroke(); }
    c.restore();
    ln(c, [0, -16, 0, 15], nib ? '#efe6d6' : '#fffaf1', 1.6);
    if (nib) fs(c, p2((p) => { p.moveTo(-1.8, 13); p.lineTo(0, 19.5); p.lineTo(1.8, 13); p.closePath(); }), '#3b352e', 0.8);
    c.restore();
  }

  const ITEMS = {
    key: { name: 'Key', draw(c) {
      c.save(); c.translate(1, 5); c.rotate(-0.42);
      fs(c, p2((p) => { E(p, -9, 0, 7.5, 7.5); E(p, -9, 0, 3.2, 3.2, 0, true); p.rect(-1.8, -2.2, 17.5, 4.4); p.rect(9, 2, 3, 5); p.rect(13, 2, 2.6, 3.6); }), '#d9ad45');
      ln(c, [0, -1, 13, -1], 'rgba(255,245,200,0.7)', 1);
      c.restore();
    } },
    teacup: { name: 'Teacup', draw(c) {
      fs(c, p2((p) => E(p, 0, 12, 16, 3.8)), '#f8dcd8');
      rope(c, (x) => { x.moveTo(10, -1); x.bezierCurveTo(19, -3, 18, 8, 8, 6); }, '#efb4ae', 3.2);
      const body = p2((p) => { p.moveTo(-12, -5); p.bezierCurveTo(-12, 6, -7, 11, 0, 11); p.bezierCurveTo(7, 11, 12, 6, 12, -5); p.closePath(); });
      fs(c, body, '#efb4ae');
      c.save(); c.clip(body); c.fillStyle = '#c4625a';
      for (const [x, y] of [[-7, 0], [0, 2], [7, 0], [-3.5, 6], [3.5, 6]]) { c.beginPath(); c.arc(x, y, 1.5, 0, TAU); c.fill(); }
      c.restore();
      fs(c, p2((p) => E(p, 0, -5, 12, 3)), '#fbeee9');
      c.fillStyle = '#b5764a'; c.beginPath(); c.ellipse(0, -4.6, 9.4, 1.9, 0, 0, TAU); c.fill();
    } },
    watch: { name: 'Watch', draw(c) {
      c.strokeStyle = '#b48a2c'; c.lineWidth = 1.4; c.setLineDash([2.2, 1.6]);
      c.beginPath(); c.moveTo(1, -16); c.bezierCurveTo(10, -21, 19, -9, 15, 7); c.stroke(); c.setLineDash([]);
      fs(c, p2((p) => { E(p, 0, -16, 3.2, 3.2); E(p, 0, -16, 1.5, 1.5, 0, true); }), '#d9ad45', 1);
      fs(c, p2((p) => p.rect(-2.4, -14, 4.8, 4)), '#c49a35', 1);
      fs(c, p2((p) => E(p, 0, 2, 12.5, 12.5)), '#d9ad45');
      fs(c, p2((p) => E(p, 0, 2, 9.6, 9.6)), '#fffaf1', 0.8);
      c.fillStyle = '#6b6157';
      for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; c.beginPath(); c.arc(Math.cos(a) * 7.6, 2 + Math.sin(a) * 7.6, i % 3 ? 0.5 : 0.95, 0, TAU); c.fill(); }
      ln(c, [0, 2, 0, -3.6], '#3b352e', 1.4); ln(c, [0, 2, 4.6, 4], '#3b352e', 1.1);
      shine(c, -5, -3, 3, 1.6, 0.6);
    } },
    glove: { name: 'Glove', draw(c) { glove(c, '#c9474f', '#f6efe3', 'rgba(110,30,40,0.45)'); } },
    workglove: { name: 'Glove', draw(c) { glove(c, '#9c5f36', '#5f3a22', 'rgba(60,35,15,0.5)'); } },
    mitt: { name: 'Oven glove', draw(c) {
      const m = p2((p) => { p.roundRect(-8, -15, 17, 26, 8.5); E(p, -9, -1, 4, 6.8, -0.5); });
      fs(c, m, '#efb4ae');
      c.save(); c.clip(m); c.fillStyle = 'rgba(255,250,241,0.6)';
      for (let y = -16; y < 12; y += 6) for (let x = -14; x < 10; x += 6) if (((x + y) / 6) % 2 === 0) c.fillRect(x, y, 3, 3);
      c.restore();
      fs(c, p2((p) => p.roundRect(-9, 9, 19, 6, 2)), '#c9474f');
      c.strokeStyle = '#c9474f'; c.lineWidth = 1.6; c.beginPath(); c.arc(0, 17, 2.6, 0, Math.PI); c.stroke();
    } },
    lantern: { name: 'Lantern', draw(c) {
      c.strokeStyle = '#3f4a44'; c.lineWidth = 1.8; c.beginPath(); c.arc(0, -13, 5, Math.PI, 0); c.stroke();
      c.fillStyle = 'rgba(255,214,110,0.3)'; c.beginPath(); c.arc(0, 1, 13, 0, TAU); c.fill();
      fs(c, p2((p) => p.rect(-8, -7, 16, 16)), '#ffe9a8');
      fs(c, p2((p) => { p.moveTo(0, -3); p.quadraticCurveTo(3.4, 2, 0, 5); p.quadraticCurveTo(-3.4, 2, 0, -3); p.closePath(); }), '#f6a83d', 0);
      c.fillStyle = '#3f5a4c'; c.fillRect(-8.6, -7, 2, 16); c.fillRect(6.6, -7, 2, 16); c.fillRect(-0.8, -7, 1.6, 16);
      fs(c, p2((p) => { p.moveTo(-6.5, -13); p.lineTo(6.5, -13); p.lineTo(10, -7); p.lineTo(-10, -7); p.closePath(); }), '#3f5a4c');
      fs(c, p2((p) => p.roundRect(-10, 9, 20, 5.5, 1.5)), '#3f5a4c');
    } },
    train: { name: 'Toy train', draw(c) {
      fs(c, p2((p) => p.rect(-12, -14, 5, 8)), '#3b352e', 0.8);
      fs(c, p2((p) => p.roundRect(-13.5, -16, 8, 3, 1)), '#3b352e', 0.8);
      fs(c, p2((p) => p.roundRect(-15, -6, 20, 12, 4)), '#5d7fd8');
      fs(c, p2((p) => E(p, -4, -7, 3.4, 2.6)), '#f2d88a', 0.8);
      fs(c, p2((p) => p.rect(3, -14, 12, 20)), '#c9474f');
      fs(c, p2((p) => p.rect(6, -11, 6, 6)), '#fffaf1', 0.8);
      fs(c, p2((p) => p.roundRect(1.5, -17, 15, 3.4, 1.2)), '#3b352e', 0.8);
      fs(c, p2((p) => p.rect(-17.5, 2, 3, 3)), '#3b352e', 0.6);
      for (const x of [-10, -1, 9.5]) { fs(c, p2((p) => E(p, x, 10.5, 4.3, 4.3)), '#3b352e', 0.8); c.fillStyle = '#f2d88a'; c.beginPath(); c.arc(x, 10.5, 1.4, 0, TAU); c.fill(); }
      shine(c, -9, -3, 4, 1.4, 0.4, 0);
    } },
    feather: { name: 'Feather', draw(c) { feather(c, '#6fb3b3', false); } },
    quill: { name: 'Quill', draw(c) { feather(c, '#f6efe3', true); } },
    glasses: { name: 'Glasses', draw(c) {
      ln(c, [-15.5, 3, -11, -9], '#5a4632', 2); ln(c, [15.5, 3, 11, -9], '#5a4632', 2);
      for (const x of [-8.5, 8.5]) {
        c.fillStyle = 'rgba(190,225,240,0.6)'; c.beginPath(); c.arc(x, 5, 7, 0, TAU); c.fill();
        c.strokeStyle = '#5a4632'; c.lineWidth = 2.6; c.stroke();
        c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 1.2; c.beginPath(); c.arc(x, 5, 4.4, 3.6, 4.6); c.stroke();
      }
      c.strokeStyle = '#5a4632'; c.lineWidth = 2; c.beginPath(); c.moveTo(-2, 4); c.quadraticCurveTo(0, 0, 2, 4); c.stroke();
    } },
    wool: { name: 'Wool', draw(c) {
      ln(c, [-14, -15, 6, 8], '#b98f5a', 2); ln(c, [14, -15, -5, 8], '#b98f5a', 2);
      c.fillStyle = '#d98b63'; c.beginPath(); c.arc(-14, -15, 2.2, 0, TAU); c.arc(14, -15, 2.2, 0, TAU); c.fill();
      const b = p2((p) => E(p, 0, 3, 12, 12));
      fs(c, b, '#bba9df');
      c.save(); c.clip(b); c.strokeStyle = '#8f7cc0'; c.lineWidth = 1.1;
      for (const [x0, y0, cx, cy, x1, y1] of [[-12, -2, 0, -10, 12, 2], [-12, 4, 0, -4, 12, 8], [-10, 11, 0, 4, 11, 13], [-5, -9, -12, 4, -4, 15], [4, -9, -3, 4, 6, 15]]) { c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(cx, cy, x1, y1); c.stroke(); }
      c.restore();
      c.strokeStyle = '#bba9df'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(10, 10); c.quadraticCurveTo(16, 9, 17, 15); c.stroke();
    } },
    ticket: { name: 'Ticket', draw(c) {
      c.save(); c.translate(0, 5); c.rotate(-0.18);
      const t = p2((p) => { p.moveTo(-15, -9); p.lineTo(15, -9); p.lineTo(15, -3); p.arc(15, 0, 3, -Math.PI / 2, Math.PI / 2, true); p.lineTo(15, 9); p.lineTo(-15, 9); p.lineTo(-15, 3); p.arc(-15, 0, 3, Math.PI / 2, -Math.PI / 2, true); p.closePath(); });
      fs(c, t, '#f4c27a');
      c.strokeStyle = 'rgba(142,59,70,0.6)'; c.lineWidth = 1; c.setLineDash([1.6, 1.6]); c.beginPath(); c.moveTo(6, -8); c.lineTo(6, 8); c.stroke(); c.setLineDash([]);
      PZ.text(c, '1', -4, 0.8, { size: 12, weight: 900, color: '#8e3b46' });
      ln(c, [-12, -5, -8, -5], 'rgba(142,59,70,0.5)', 1); ln(c, [-12, 5, -8, 5], 'rgba(142,59,70,0.5)', 1);
      c.fillStyle = '#8e3b46'; c.beginPath(); c.arc(10.5, 0, 2, 0, TAU); c.fill();
      c.restore();
    } },
    bell: { name: 'Bell', draw(c) {
      fs(c, p2((p) => p.roundRect(-2.6, -18, 5.2, 11, 2.4)), '#8a5a3a');
      fs(c, p2((p) => E(p, 0, -18, 3.4, 2.6)), '#a8784a', 0.8);
      fs(c, p2((p) => { p.moveTo(-5, -7); p.bezierCurveTo(-7, 2, -12, 6, -13, 10); p.lineTo(13, 10); p.bezierCurveTo(12, 6, 7, 2, 5, -7); p.closePath(); }), '#e0b54a');
      fs(c, p2((p) => p.roundRect(-5, -9, 10, 3, 1)), '#c49a35', 0.8);
      fs(c, p2((p) => E(p, 0, 10, 13, 2.6)), '#c49a35', 0.8);
      fs(c, p2((p) => E(p, 0, 13, 2.6, 2.4)), '#8d7a4a', 0.8);
      shine(c, -4.4, 0, 1.6, 5, 0.5, 0.3);
    } },
    compass: { name: 'Compass', draw(c) {
      fs(c, p2((p) => { E(p, 0, -15, 3.2, 3.2); E(p, 0, -15, 1.5, 1.5, 0, true); }), '#c49a35', 1);
      fs(c, p2((p) => E(p, 0, 2, 12.5, 12.5)), '#c49a35');
      fs(c, p2((p) => E(p, 0, 2, 10, 10)), '#fbf3e2', 0.8);
      c.strokeStyle = 'rgba(107,97,87,0.6)'; c.lineWidth = 1;
      for (let i = 0; i < 4; i++) { const a = (i / 4) * TAU; c.beginPath(); c.moveTo(Math.cos(a) * 7, 2 + Math.sin(a) * 7); c.lineTo(Math.cos(a) * 9.4, 2 + Math.sin(a) * 9.4); c.stroke(); }
      c.save(); c.translate(0, 2); c.rotate(0.55);
      fs(c, p2((p) => { p.moveTo(0, -8); p.lineTo(2.6, 0); p.lineTo(-2.6, 0); p.closePath(); }), '#d9534f', 0.7);
      fs(c, p2((p) => { p.moveTo(0, 8); p.lineTo(2.6, 0); p.lineTo(-2.6, 0); p.closePath(); }), '#fffaf1', 0.7);
      c.restore();
      c.fillStyle = '#6b6157'; c.beginPath(); c.arc(0, 2, 1.2, 0, TAU); c.fill();
    } },
    umbrella: { name: 'Umbrella', draw(c) {
      c.save(); c.translate(1, 0); c.rotate(0.6);
      ln(c, [0, -20, 0, -23], '#6b6157', 1.6);
      fs(c, p2((p) => { p.moveTo(0, -20); p.quadraticCurveTo(7.5, -4, 5.5, 7); p.lineTo(-5.5, 7); p.quadraticCurveTo(-7.5, -4, 0, -20); p.closePath(); }), '#3d5a86');
      ln(c, [0, -18, 2.6, 6], 'rgba(255,255,255,0.35)', 1); ln(c, [0, -18, -2.6, 6], 'rgba(255,255,255,0.35)', 1);
      fs(c, p2((p) => p.rect(-4.6, -3, 9.2, 2.8)), '#c9474f', 0.8);
      ln(c, [0, 7, 0, 13], '#6b6157', 1.8);
      c.strokeStyle = '#8a5a3a'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.arc(-3.6, 13, 3.6, 0, Math.PI); c.stroke();
      c.restore();
    } },
    hat: { name: 'Hat', draw(c) {
      fs(c, p2((p) => E(p, 0, 10, 17, 4.8)), '#4b4a52');
      const cr = p2((p) => { p.moveTo(-11, 10); p.bezierCurveTo(-12, -6, -7, -13, 0, -13); p.bezierCurveTo(7, -13, 12, -6, 11, 10); p.closePath(); });
      fs(c, cr, '#4b4a52');
      c.save(); c.clip(cr); c.fillStyle = '#c9474f'; c.fillRect(-13, 3, 26, 4.6); c.restore();
      c.strokeStyle = INKL; c.lineWidth = 1.2; c.beginPath(); c.ellipse(0, 10, 17, 4.8, 0, 0.1, Math.PI - 0.1); c.stroke();
      shine(c, -5, -5, 2.4, 5, 0.25, 0.3);
    } },
    scarf: { name: 'Scarf', draw(c) {
      const tails = p2((p) => { p.moveTo(-6, -6); p.lineTo(0, -5); p.lineTo(-5, 13); p.lineTo(-12, 12); p.closePath(); p.moveTo(1, -5); p.lineTo(7, -6); p.lineTo(12, 12); p.lineTo(5, 13); p.closePath(); });
      fs(c, tails, '#a6d3d4');
      c.save(); c.clip(tails); c.fillStyle = '#3d5a86'; c.fillRect(-14, 1, 28, 2.6); c.fillRect(-14, 7, 28, 2.6); c.restore();
      fs(c, p2((p) => { E(p, 0, -9, 10, 7); E(p, 0, -9, 5.2, 3, 0, true); }), '#a6d3d4');
      c.save(); c.clip(p2((p) => { E(p, 0, -9, 10, 7); E(p, 0, -9, 5.2, 3, 0, true); })); c.fillStyle = '#3d5a86'; c.fillRect(-11, -11, 22, 2.4); c.restore();
      c.strokeStyle = '#3d5a86'; c.lineWidth = 1.1;
      for (const [x, y, dx] of [[-11, 12, 0], [-8.5, 12.5, 0], [-6, 13, 0], [6, 13, 0], [8.5, 12.5, 0], [11, 12, 0]]) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + dx, y + 3.4); c.stroke(); }
    } },
    teddy: { name: 'Teddy', draw(c) {
      const fur = '#c08a52', lt = '#ecc996';
      for (const s of [-1, 1]) { fs(c, p2((p) => E(p, 6.5 * s, -15, 3.6, 3.6)), fur, 1); c.fillStyle = lt; c.beginPath(); c.arc(6.5 * s, -15, 1.8, 0, TAU); c.fill(); }
      fs(c, p2((p) => E(p, 0, 6, 10, 9)), fur);
      fs(c, p2((p) => { E(p, -9.5, 3, 3.4, 5.8, 0.5); E(p, 9.5, 3, 3.4, 5.8, -0.5); }), fur);
      fs(c, p2((p) => { E(p, -6, 13, 4.6, 3.4); E(p, 6, 13, 4.6, 3.4); }), fur);
      c.fillStyle = lt; c.beginPath(); c.ellipse(0, 7, 5, 5, 0, 0, TAU); c.fill();
      c.beginPath(); c.ellipse(-6, 13.4, 2.4, 1.8, 0, 0, TAU); c.ellipse(6, 13.4, 2.4, 1.8, 0, 0, TAU); c.fill();
      fs(c, p2((p) => E(p, 0, -8, 8.6, 7.6)), fur);
      fs(c, p2((p) => E(p, 0, -4.8, 4.2, 3.1)), lt, 0.8);
      c.fillStyle = '#3b352e';
      c.beginPath(); c.ellipse(0, -6, 1.7, 1.2, 0, 0, TAU); c.fill();
      c.beginPath(); c.arc(-3.2, -9.6, 1.1, 0, TAU); c.arc(3.2, -9.6, 1.1, 0, TAU); c.fill();
    } },
    book: { name: 'Book', draw(c) {
      c.save(); c.translate(0, 1); c.rotate(-0.12);
      fs(c, p2((p) => p.rect(-8, -13, 17, 26)), '#fbf3e2', 1);
      c.strokeStyle = 'rgba(150,130,100,0.5)'; c.lineWidth = 0.6; for (let y = -10; y < 12; y += 2.4) { c.beginPath(); c.moveTo(7, y); c.lineTo(9, y); c.stroke(); }
      fs(c, p2((p) => p.rect(-10, -14, 17, 28)), '#c9474f');
      c.fillStyle = '#972f37'; c.fillRect(-10, -14, 4, 28);
      c.fillStyle = '#f2d88a'; c.fillRect(-10, -10, 4, 1.6); c.fillRect(-10, 8, 4, 1.6);
      fs(c, p2((p) => p.rect(-3, -8, 8, 6)), '#f2d88a', 0.8);
      c.restore();
    } },
    top: { name: 'Spinning top', draw(c) {
      fs(c, p2((p) => p.rect(-2, -17, 4, 10)), '#8a5a3a', 0.9);
      fs(c, p2((p) => E(p, 0, -17, 3, 2.4)), '#a8784a', 0.8);
      const b = p2((p) => { p.moveTo(0, 15); p.lineTo(-13, 0); p.quadraticCurveTo(-13, -8, 0, -8); p.quadraticCurveTo(13, -8, 13, 0); p.closePath(); });
      fs(c, b, '#e2574c');
      c.save(); c.clip(b); c.fillStyle = '#f2d88a'; c.fillRect(-14, -3, 28, 4.4); c.fillStyle = '#5d7fd8'; c.fillRect(-14, 4, 28, 3); c.restore();
      c.strokeStyle = INKL; c.lineWidth = 1.2; c.stroke(b);
      shine(c, -6, -4, 2.6, 1.4, 0.5, 0);
    } },
    candle: { name: 'Candle', draw(c) {
      c.fillStyle = 'rgba(255,214,110,0.28)'; c.beginPath(); c.arc(0, -14, 8, 0, TAU); c.fill();
      c.strokeStyle = '#c49a35'; c.lineWidth = 2; c.beginPath(); c.arc(13, 10, 3, -1.4, 1.6); c.stroke();
      fs(c, p2((p) => E(p, 0, 12.5, 12.5, 3.8)), '#d9ad45');
      fs(c, p2((p) => { p.moveTo(-4.5, -8); p.lineTo(4.5, -8); p.lineTo(4.5, 12); p.lineTo(-4.5, 12); p.closePath(); }), '#fbf3e2');
      fs(c, p2((p) => { p.moveTo(-4.5, -8); p.lineTo(-1, -8); p.quadraticCurveTo(-1.6, -2, -3, -1); p.quadraticCurveTo(-4.4, -1, -4.5, -4); p.closePath(); }), '#f3e6cc', 0.6);
      ln(c, [0, -8, 0, -11], '#3b352e', 1);
      fs(c, p2((p) => { p.moveTo(0, -19); p.quadraticCurveTo(4.4, -13, 0, -10); p.quadraticCurveTo(-4.4, -13, 0, -19); p.closePath(); }), '#f6b13d', 0.6);
      c.fillStyle = '#fff3b0'; c.beginPath(); c.ellipse(0, -12.6, 1.5, 2.4, 0, 0, TAU); c.fill();
    } },
    boat: { name: 'Toy boat', draw(c) {
      ln(c, [0, 4, 0, -18], '#8a5a3a', 1.6);
      fs(c, p2((p) => { p.moveTo(1.5, -17); p.lineTo(13, 1); p.lineTo(1.5, 1); p.closePath(); }), '#fffaf1');
      fs(c, p2((p) => { p.moveTo(-1.5, -14); p.lineTo(-11, 1); p.lineTo(-1.5, 1); p.closePath(); }), '#f2d88a');
      fs(c, p2((p) => { p.moveTo(0, -18); p.lineTo(5, -16.5); p.lineTo(0, -15); p.closePath(); }), '#d9534f', 0.6);
      fs(c, p2((p) => { p.moveTo(-16, 3); p.lineTo(16, 3); p.lineTo(11, 13); p.lineTo(-11, 13); p.closePath(); }), '#c9474f');
      c.fillStyle = '#fffaf1'; c.fillRect(-14, 6, 27, 1.8);
    } },
    frame: { name: 'Picture', draw(c) {
      c.save(); c.translate(0, 1); c.rotate(-0.08);
      fs(c, p2((p) => p.rect(-14, -15, 28, 28)), '#c49a35');
      const inner = p2((p) => p.rect(-10, -11, 20, 20));
      fs(c, inner, '#bfe2ef', 0.8);
      c.save(); c.clip(inner);
      c.fillStyle = '#f2d88a'; c.beginPath(); c.arc(4, -5, 3, 0, TAU); c.fill();
      c.fillStyle = '#8dbb80'; c.beginPath(); c.moveTo(-11, 4); c.quadraticCurveTo(-3, -3, 4, 3); c.quadraticCurveTo(8, 0, 11, 2); c.lineTo(11, 10); c.lineTo(-11, 10); c.fill();
      c.fillStyle = '#6f9a6a'; c.beginPath(); c.moveTo(-11, 7); c.quadraticCurveTo(0, 2, 11, 8); c.lineTo(11, 10); c.lineTo(-11, 10); c.fill();
      c.restore();
      c.strokeStyle = 'rgba(255,240,200,0.6)'; c.lineWidth = 1; c.strokeRect(-12.5, -13.5, 25, 25);
      c.restore();
    } },
    teapot: { name: 'Teapot', draw(c) {
      fs(c, p2((p) => { p.moveTo(-9, 3); p.quadraticCurveTo(-16, 1, -17, -8); p.lineTo(-13.6, -8.4); p.quadraticCurveTo(-13, -2, -8, -2); p.closePath(); }), '#8fbfe6');
      rope(c, (x) => { x.moveTo(9, -5); x.bezierCurveTo(19, -6, 19, 9, 9, 7); }, '#8fbfe6', 2.8);
      fs(c, p2((p) => p.roundRect(-6, 10, 12, 3.4, 1)), '#7aaed8', 0.8);
      fs(c, p2((p) => E(p, 0, 2, 12, 10.5)), '#8fbfe6');
      c.fillStyle = '#fffaf1';
      for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; c.beginPath(); c.arc(Math.cos(a) * 3, 3 + Math.sin(a) * 3, 2.2, 0, TAU); c.fill(); }
      c.fillStyle = '#f2d88a'; c.beginPath(); c.arc(0, 3, 1.6, 0, TAU); c.fill();
      fs(c, p2((p) => E(p, 0, -8, 7.4, 2.6)), '#a6cdea', 0.9);
      fs(c, p2((p) => E(p, 0, -11.4, 2.6, 2.2)), '#a6cdea', 0.9);
      shine(c, -6, -2, 2.4, 4, 0.4, 0.4);
    } },
    whisk: { name: 'Whisk', draw(c) {
      c.save(); c.translate(0, 1); c.rotate(-0.7);
      c.strokeStyle = '#8f99a3'; c.lineWidth = 1.4;
      for (const rx of [7, 4.4, 1.6]) { c.beginPath(); c.ellipse(0, -7, rx, 11, 0, 0, TAU); c.stroke(); }
      fs(c, p2((p) => p.roundRect(-3, 2, 6, 4, 1)), '#c0c7cd', 0.8);
      fs(c, p2((p) => p.roundRect(-2.6, 6, 5.2, 13, 2.6)), '#8a5a3a', 1);
      c.restore();
    } },
    rollingpin: { name: 'Rolling pin', draw(c) {
      c.save(); c.translate(0, 4); c.rotate(-0.35);
      fs(c, p2((p) => { p.roundRect(-19, -2.6, 9, 5.2, 2.6); p.roundRect(10, -2.6, 9, 5.2, 2.6); }), '#c08a52', 1);
      fs(c, p2((p) => p.roundRect(-11, -5.5, 22, 11, 4)), '#ecc996');
      ln(c, [-7, -2, 6, -2], 'rgba(160,110,60,0.4)', 0.8); ln(c, [-5, 2, 8, 2], 'rgba(160,110,60,0.4)', 0.8);
      shine(c, -2, -3.6, 6, 1, 0.5, 0);
      c.restore();
    } },
    lemon: { name: 'Lemon', draw(c) {
      fs(c, p2((p) => E(p, 5, -7, 5.4, 2.4, -0.4)), '#6f9a6a', 1);
      fs(c, p2((p) => { p.moveTo(-15, 3); p.bezierCurveTo(-11, -9, 11, -9, 15, 3); p.bezierCurveTo(11, 14, -11, 14, -15, 3); p.closePath(); }), '#f2d24a');
      c.fillStyle = 'rgba(180,140,20,0.35)';
      for (const [x, y] of [[-6, 4], [2, 7], [7, 1], [-2, -1], [-9, 0], [5, 6]]) { c.beginPath(); c.arc(x, y, 0.7, 0, TAU); c.fill(); }
      shine(c, -5, -1.5, 4, 1.8, 0.55, -0.2);
    } },
    apple: { name: 'Apple', draw(c) {
      fs(c, p2((p) => { p.moveTo(0, -6); p.bezierCurveTo(6, -12, 14, -6, 12, 4); p.bezierCurveTo(10, 13, 4, 14, 0, 12.5); p.bezierCurveTo(-4, 14, -10, 13, -12, 4); p.bezierCurveTo(-14, -6, -6, -12, 0, -6); p.closePath(); }), '#d9534f');
      ln(c, [0, -6, 1.6, -13], '#6b4a32', 2);
      fs(c, p2((p) => E(p, 6, -12, 4.6, 2.2, -0.45)), '#6f9a6a', 1);
      shine(c, -6, -1, 2.4, 4, 0.45, 0.3);
    } },
    honey: { name: 'Honey', draw(c) {
      fs(c, p2((p) => p.roundRect(-11, -8, 22, 21, 5)), '#e9b23c');
      c.fillStyle = 'rgba(160,90,10,0.25)'; c.fillRect(-10, 6, 20, 6);
      const cloth = p2((p) => { p.moveTo(-14, -8); p.quadraticCurveTo(-10, -15, 0, -14); p.quadraticCurveTo(10, -15, 14, -8); p.quadraticCurveTo(12, -4, 9, -6); p.quadraticCurveTo(4, -4, 0, -6); p.quadraticCurveTo(-4, -4, -9, -6); p.quadraticCurveTo(-12, -4, -14, -8); p.closePath(); });
      fs(c, cloth, '#fffaf1');
      c.save(); c.clip(cloth); c.fillStyle = '#e2574c';
      for (let y = -16; y < -3; y += 4) for (let x = -14; x < 14; x += 4) if (((x + 14) / 4 + (y + 16) / 4) % 2 === 0) c.fillRect(x, y, 2, 2);
      c.restore();
      ln(c, [-11, -7, 11, -7], '#c9474f', 1.4);
      fs(c, p2((p) => E(p, 0, 3, 6.4, 4.8)), '#fffaf1', 0.8);
      c.fillStyle = '#f2c94c'; c.beginPath(); c.ellipse(0, 3.4, 3, 2, 0, 0, TAU); c.fill();
      c.fillStyle = '#3b352e'; c.fillRect(-1, 1.6, 1, 3.6); c.fillRect(1, 1.6, 0.9, 3.6);
      c.fillStyle = 'rgba(190,225,240,0.9)'; c.beginPath(); c.ellipse(-1.2, 0.6, 1.6, 1, -0.5, 0, TAU); c.ellipse(1.6, 0.6, 1.6, 1, 0.5, 0, TAU); c.fill();
    } },
    cupcake: { name: 'Cupcake', draw(c) {
      fs(c, p2((p) => { p.moveTo(-10, 1); p.lineTo(10, 1); p.lineTo(7.5, 14); p.lineTo(-7.5, 14); p.closePath(); }), '#efb4ae');
      c.strokeStyle = 'rgba(196,98,90,0.6)'; c.lineWidth = 0.9; for (let x = -6; x <= 6; x += 3) { c.beginPath(); c.moveTo(x * 1.25, 2); c.lineTo(x, 13.5); c.stroke(); }
      fs(c, p2((p) => E(p, 0, -1, 11.5, 4.8)), '#fbe3ea');
      fs(c, p2((p) => E(p, 0, -6, 8.6, 4)), '#fbe3ea');
      fs(c, p2((p) => E(p, 0, -10.4, 5, 3.4)), '#fbe3ea');
      for (const [x, y, col] of [[-5, -2, '#5d7fd8'], [4, -3, '#f2d88a'], [-1, -7, '#6f9a6a'], [6, -7, '#c9474f'], [-7, -6, '#f2d88a']]) { c.fillStyle = col; c.fillRect(x, y, 2.2, 1); }
      ln(c, [1, -17, 3, -21], '#6b4a32', 1);
      fs(c, p2((p) => E(p, 1, -15.4, 3.2, 3.2)), '#c9474f', 1);
    } },
    milk: { name: 'Milk', draw(c) {
      fs(c, p2((p) => { p.moveTo(-4, -15); p.lineTo(4, -15); p.lineTo(4, -11); p.bezierCurveTo(4, -8, 9, -6, 9, -1); p.lineTo(9, 12); p.quadraticCurveTo(9, 14.5, 6.5, 14.5); p.lineTo(-6.5, 14.5); p.quadraticCurveTo(-9, 14.5, -9, 12); p.lineTo(-9, -1); p.bezierCurveTo(-9, -6, -4, -8, -4, -11); p.closePath(); }), '#fcfbf5', 1.4);
      fs(c, p2((p) => p.roundRect(-4.8, -18, 9.6, 4, 1.4)), '#3d5a86', 1);
      fs(c, p2((p) => p.rect(-9, 1, 18, 7)), '#a6d3d4', 0.8);
      c.fillStyle = '#3d5a86'; c.beginPath(); c.arc(0, 4.5, 2, 0, TAU); c.fill();
      shine(c, -5.4, -1, 1.2, 5, 0.9, 0);
    } },
    spoon: { name: 'Spoon', draw(c) {
      c.save(); c.translate(0, 0); c.rotate(0.75);
      fs(c, p2((p) => p.roundRect(-1.9, -2, 3.8, 20, 1.9)), '#c99a5a', 1);
      fs(c, p2((p) => E(p, 0, -8, 5.8, 8.2)), '#d8ac6c');
      c.fillStyle = 'rgba(120,80,40,0.25)'; c.beginPath(); c.ellipse(0, -8.6, 3.6, 5.6, 0, 0, TAU); c.fill();
      c.restore();
    } },
    egg: { name: 'Egg', draw(c) {
      fs(c, p2((p) => { p.moveTo(0, -13); p.bezierCurveTo(8, -13, 10, 1, 9, 5); p.bezierCurveTo(8, 12, 3, 14, 0, 14); p.bezierCurveTo(-3, 14, -8, 12, -9, 5); p.bezierCurveTo(-10, 1, -8, -13, 0, -13); p.closePath(); }), '#f1d6b0');
      c.fillStyle = 'rgba(140,90,50,0.45)';
      for (const [x, y] of [[3, -4], [-3, 2], [5, 5], [-5, -5], [1, 9], [-1, -9]]) { c.beginPath(); c.arc(x, y, 0.7, 0, TAU); c.fill(); }
      shine(c, -4, -5, 2, 4, 0.5, 0.3);
    } },
    inkpot: { name: 'Ink pot', draw(c) {
      fs(c, p2((p) => { p.moveTo(-10, 13); p.lineTo(-10, 0); p.quadraticCurveTo(-10, -5, -5, -6); p.lineTo(-4, -10); p.lineTo(4, -10); p.lineTo(5, -6); p.quadraticCurveTo(10, -5, 10, 0); p.lineTo(10, 13); p.closePath(); }), '#2f3f6b');
      fs(c, p2((p) => p.rect(-7, 1, 14, 7)), '#fbf3e2', 0.8);
      ln(c, [-4, 4.5, 4, 4.5], '#6b6157', 1);
      fs(c, p2((p) => p.roundRect(-5.4, -14, 10.8, 4.6, 1.4)), '#3b352e', 1);
      shine(c, -7, -2, 1.2, 4, 0.5, 0);
    } },
    magnifier: { name: 'Magnifier', draw(c) {
      c.lineCap = 'round';
      c.strokeStyle = INKL; c.lineWidth = 7; c.beginPath(); c.moveTo(4, 4); c.lineTo(14, 14); c.stroke();
      c.strokeStyle = '#5a3d2a'; c.lineWidth = 5; c.stroke();
      fs(c, p2((p) => { E(p, -3, -3, 10.5, 10.5); E(p, -3, -3, 7.8, 7.8, 0, true); }), '#c49a35');
      c.fillStyle = 'rgba(190,225,240,0.65)'; c.beginPath(); c.arc(-3, -3, 7.8, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 1.4; c.beginPath(); c.arc(-3, -3, 5, 3.5, 4.5); c.stroke();
    } },
    globe: { name: 'Globe', draw(c) {
      fs(c, p2((p) => E(p, 0, 13.5, 8, 2.6)), '#8a5a3a', 1);
      c.fillStyle = '#8a5a3a'; c.fillRect(-1.4, 8, 2.8, 5.5);
      const s = p2((p) => E(p, 0, -3, 11, 11));
      fs(c, s, '#6aa6d6');
      c.save(); c.clip(s); c.fillStyle = '#8dbb80';
      c.beginPath(); c.ellipse(-4, -7, 5, 3.4, 0.4, 0, TAU); c.ellipse(4, 2, 4, 5, -0.3, 0, TAU); c.ellipse(-7, 4, 2.4, 2, 0, 0, TAU); c.fill();
      c.restore();
      c.strokeStyle = '#c49a35'; c.lineWidth = 2; c.beginPath(); c.arc(0, -3, 13.6, -1.3, 1.9); c.stroke();
      shine(c, -4.4, -8, 3, 1.8, 0.5);
    } },
    pencil: { name: 'Pencil', draw(c) {
      c.save(); c.translate(0, 1); c.rotate(-0.75);
      fs(c, p2((p) => { p.moveTo(-3.2, -12); p.lineTo(3.2, -12); p.lineTo(0, -19.5); p.closePath(); }), '#f1dcb4', 0.9);
      c.fillStyle = '#3b352e'; c.beginPath(); c.moveTo(-1.2, -16.6); c.lineTo(1.2, -16.6); c.lineTo(0, -19.5); c.fill();
      fs(c, p2((p) => p.rect(-3.2, -12, 6.4, 22)), '#f2c94c');
      ln(c, [-1, -11, -1, 9], 'rgba(160,110,20,0.4)', 0.8); ln(c, [1.2, -11, 1.2, 9], 'rgba(255,255,255,0.4)', 0.8);
      fs(c, p2((p) => p.rect(-3.2, 10, 6.4, 3.4)), '#c0c7cd', 0.9);
      fs(c, p2((p) => p.roundRect(-3.2, 13.4, 6.4, 4.4, 1.6)), '#efb4ae', 0.9);
      c.restore();
    } },
    scissors: { name: 'Scissors', draw(c) {
      c.save(); c.translate(0, 2);
      fs(c, p2((p) => { p.moveTo(-2, 1); p.lineTo(-7.5, -17); p.lineTo(-3.6, -16); p.lineTo(2.4, 1); p.closePath(); }), '#c9d0d6', 1);
      fs(c, p2((p) => { p.moveTo(2, 1); p.lineTo(7.5, -17); p.lineTo(3.6, -16); p.lineTo(-2.4, 1); p.closePath(); }), '#dde3e8', 1);
      ln(c, [0, 1, -5, 7], '#e2574c', 2.4); ln(c, [0, 1, 5, 7], '#e2574c', 2.4);
      fs(c, p2((p) => { E(p, -6.5, 9.5, 4.8, 4.4); E(p, -6.5, 9.5, 2.6, 2.4, 0, true); E(p, 6.5, 9.5, 4.8, 4.4); E(p, 6.5, 9.5, 2.6, 2.4, 0, true); }), '#e2574c', 1);
      c.fillStyle = '#6b6157'; c.beginPath(); c.arc(0, 0.5, 1.3, 0, TAU); c.fill();
      c.restore();
    } },
    hourglass: { name: 'Hourglass', draw(c) {
      const g = p2((p) => { p.moveTo(-7, -13); p.bezierCurveTo(-7, -4, -1.4, -2, -1.4, 0); p.bezierCurveTo(-1.4, 2, -7, 4, -7, 12); p.lineTo(7, 12); p.bezierCurveTo(7, 4, 1.4, 2, 1.4, 0); p.bezierCurveTo(1.4, -2, 7, -4, 7, -13); p.closePath(); });
      fs(c, g, 'rgba(225,238,242,0.85)', 1);
      c.save(); c.clip(g); c.fillStyle = '#e9c77a';
      c.beginPath(); c.moveTo(-7, 12); c.quadraticCurveTo(0, 3, 7, 12); c.fill();
      c.fillRect(-7, -8, 14, 6.4);
      c.restore();
      ln(c, [0, 0, 0, 9], '#e9c77a', 0.9);
      c.fillStyle = '#a8784a'; c.fillRect(-10, -13, 2, 25); c.fillRect(8, -13, 2, 25);
      fs(c, p2((p) => { p.roundRect(-11.5, -17, 23, 4.4, 1.6); p.roundRect(-11.5, 11.6, 23, 4.4, 1.6); }), '#8a5a3a', 1);
    } },
    envelope: { name: 'Letter', draw(c) {
      c.save(); c.translate(0, 4); c.rotate(-0.1);
      fs(c, p2((p) => p.rect(-15, -10, 30, 20)), '#fbf3e2');
      ln(c, [-15, -10, 0, 2, 15, -10], 'rgba(107,97,87,0.6)', 1);
      ln(c, [-15, 10, -4, 1], 'rgba(107,97,87,0.3)', 0.8); ln(c, [15, 10, 4, 1], 'rgba(107,97,87,0.3)', 0.8);
      fs(c, p2((p) => E(p, 0, 1.5, 3.8, 3.8)), '#c9474f', 0.8);
      fs(c, p2((p) => p.rect(8, -8, 5, 6)), '#8fbfe6', 0.6);
      c.restore();
    } },
    horseshoe: { name: 'Horseshoe', draw(c) {
      const shoe = (x) => { x.moveTo(-10, -12); x.lineTo(-10, 2); x.arc(0, 2, 10, Math.PI, 0, true); x.lineTo(10, -12); };
      rope(c, shoe, '#9a9da2', 6.4);
      c.fillStyle = '#5c5f64';
      for (const [x, y] of [[-10, -6], [-10, 1], [-7, 8.5], [10, -6], [10, 1], [7, 8.5]]) { c.beginPath(); c.arc(x, y, 0.95, 0, TAU); c.fill(); }
      ln(c, [-11.5, -10, -11.5, 0], 'rgba(255,255,255,0.5)', 0.9);
    } },
    carrot: { name: 'Carrot', draw(c) {
      c.save(); c.translate(0, 1); c.rotate(0.55);
      fs(c, p2((p) => { E(p, -3.4, -14, 2, 5.6, -0.4); E(p, 0, -16, 2, 6.2); E(p, 3.4, -14, 2, 5.6, 0.4); }), '#6f9a6a', 1);
      fs(c, p2((p) => { p.moveTo(-5.5, -9); p.quadraticCurveTo(0, -11.5, 5.5, -9); p.lineTo(0.9, 15); p.quadraticCurveTo(0, 16.4, -0.9, 15); p.closePath(); }), '#e9893a');
      for (const y of [-4, 1, 6]) ln(c, [-3, y, -0.6, y + 0.6], 'rgba(150,70,20,0.5)', 0.9);
      ln(c, [3, -1, 1, -0.4], 'rgba(150,70,20,0.5)', 0.9);
      c.restore();
    } },
    ball: { name: 'Ball', draw(c) {
      const b = p2((p) => E(p, 0, 5, 10, 10));
      fs(c, b, '#d6e04a');
      c.save(); c.clip(b); c.strokeStyle = '#fffaf1'; c.lineWidth = 1.6;
      c.beginPath(); c.arc(-12.5, 5, 9, -0.9, 0.9); c.stroke(); c.beginPath(); c.arc(12.5, 5, 9, Math.PI - 0.9, Math.PI + 0.9); c.stroke();
      c.restore();
      shine(c, -3.6, 0.4, 2.6, 1.6, 0.4);
    } },
    bone: { name: 'Bone', draw(c) {
      c.save(); c.translate(0, 4); c.rotate(-0.3);
      fs(c, p2((p) => { p.rect(-11, -3.4, 22, 6.8); E(p, -12, -3.6, 4.2, 4.2); E(p, -12, 3.6, 4.2, 4.2); E(p, 12, -3.6, 4.2, 4.2); E(p, 12, 3.6, 4.2, 4.2); }), '#f6efe3', 1.3);
      c.restore();
    } },
    can: { name: 'Watering can', draw(c) {
      fs(c, p2((p) => { p.moveTo(6, 3); p.lineTo(16, -9); p.lineTo(18.4, -7.4); p.lineTo(8, 8); p.closePath(); }), '#6f9a6a', 1);
      fs(c, p2((p) => E(p, 17.4, -9.4, 2.4, 3.6, 0.7)), '#5c8458', 0.9);
      rope(c, (x) => { x.moveTo(-8, -6); x.bezierCurveTo(-8, -18, 5, -18, 5, -7); }, '#6f9a6a', 2.4);
      fs(c, p2((p) => p.roundRect(-12, -7, 19, 21, 3)), '#6f9a6a');
      c.fillStyle = 'rgba(40,70,40,0.25)'; c.fillRect(-12, -3, 19, 2.4);
      shine(c, -8, 3, 1.4, 6, 0.4, 0);
    } },
    brush: { name: 'Brush', draw(c) {
      c.strokeStyle = '#7a4f2e'; c.lineWidth = 2.4; c.beginPath(); c.roundRect(-8, -12, 16, 9, 3.4); c.stroke();
      fs(c, p2((p) => p.rect(-13, 3, 26, 9)), '#d8c29a', 1);
      c.strokeStyle = 'rgba(110,80,40,0.5)'; c.lineWidth = 0.8; for (let x = -11; x <= 11; x += 2.2) { c.beginPath(); c.moveTo(x, 4); c.lineTo(x + 0.3, 12); c.stroke(); }
      fs(c, p2((p) => p.roundRect(-14.5, -5, 29, 9, 4.5)), '#a8784a');
      shine(c, -6, -3, 6, 1, 0.35, 0);
    } },
    boot: { name: 'Welly', draw(c) {
      fs(c, p2((p) => { p.moveTo(-8, -14); p.lineTo(5, -14); p.lineTo(5, 3); p.quadraticCurveTo(15, 3, 16, 10); p.lineTo(16, 13); p.lineTo(-8, 13); p.closePath(); }), '#4e7b5b');
      fs(c, p2((p) => p.roundRect(-9, 11, 26, 3.6, 1.2)), '#2f4a38', 0.9);
      fs(c, p2((p) => p.roundRect(-9, -16, 15, 4.4, 1.4)), '#6f9a6a', 0.9);
      shine(c, -4, -3, 1.4, 6, 0.3, 0);
    } },
    // the curiosity shop's own: a ship in a bottle, a telescope, a shell, dice and a mask
    ship: { name: 'Ship in a bottle', draw(c) {
      fs(c, p2((p) => { p.moveTo(-14, 15); p.lineTo(-11, 9); p.lineTo(-6, 9); p.lineTo(-3, 15); p.closePath(); p.moveTo(3, 15); p.lineTo(6, 9); p.lineTo(11, 9); p.lineTo(14, 15); p.closePath(); }), '#8a5a3a', 1);
      const b = p2((p) => { p.moveTo(-15, -6); p.lineTo(4, -6); p.quadraticCurveTo(10, -6, 11, -1); p.lineTo(15, -0.5); p.lineTo(15, 5.5); p.lineTo(11, 6); p.quadraticCurveTo(10, 11, 4, 11); p.lineTo(-15, 11); p.quadraticCurveTo(-19, 11, -19, 2.5); p.quadraticCurveTo(-19, -6, -15, -6); p.closePath(); });
      c.fillStyle = 'rgba(205,232,236,0.55)'; c.fill(b);
      c.save(); c.clip(b);
      c.fillStyle = '#5f9ab8'; c.beginPath(); c.moveTo(-20, 7); c.quadraticCurveTo(-12, 4, -4, 7); c.quadraticCurveTo(4, 10, 12, 6); c.lineTo(12, 12); c.lineTo(-20, 12); c.closePath(); c.fill();
      c.fillStyle = '#8a4f2e'; c.beginPath(); c.moveTo(-13, 4); c.lineTo(5, 4); c.lineTo(2, 8); c.lineTo(-10, 8); c.closePath(); c.fill();
      ln(c, [-7, 4, -7, -4.5], '#5a3a22', 1); ln(c, [-1, 4, -1, -2.5], '#5a3a22', 1);
      c.fillStyle = '#fffaf1'; c.beginPath(); c.moveTo(-6.4, -4); c.lineTo(-2.6, 2.4); c.lineTo(-6.4, 2.4); c.closePath(); c.moveTo(-0.4, -2); c.lineTo(3.4, 2.4); c.lineTo(-0.4, 2.4); c.closePath(); c.moveTo(-7.6, -3); c.lineTo(-11.4, 2.4); c.lineTo(-7.6, 2.4); c.closePath(); c.fill();
      c.fillStyle = '#c9474f'; c.fillRect(-7, -5.6, 3, 1.6);
      c.restore();
      c.strokeStyle = INKL; c.lineWidth = 1.2; c.lineJoin = 'round'; c.stroke(b);
      fs(c, p2((p) => p.roundRect(14.5, -0.6, 5, 6.2, 1.4)), '#c99a5a', 0.9);
      shine(c, -8, -3.4, 7, 1.1, 0.75, 0);
    } },
    spyglass: { name: 'Telescope', draw(c) {
      ln(c, [0, 3, -9, 15], '#6b4a32', 1.8); ln(c, [0, 3, 9, 15], '#6b4a32', 1.8); ln(c, [0, 3, 1.5, 15], '#6b4a32', 1.8);
      c.save(); c.translate(0, -2); c.rotate(-0.36);
      fs(c, p2((p) => p.rect(-18, -2.6, 9, 5.2)), '#b8902f', 1);
      fs(c, p2((p) => p.rect(-9.5, -3.6, 11, 7.2)), '#d9ad45', 1);
      fs(c, p2((p) => p.rect(1, -5, 15, 10)), '#c49a35', 1);
      c.fillStyle = '#8a6a2a'; c.fillRect(-10, -3.6, 1.6, 7.2); c.fillRect(0.6, -5, 1.8, 10); c.fillRect(13.5, -5, 1.6, 10);
      fs(c, p2((p) => E(p, 16.6, 0, 1.8, 5)), '#bfe2ef', 0.9);
      shine(c, 6, -3, 5, 0.9, 0.55, 0);
      c.restore();
      fs(c, p2((p) => E(p, 0, 2.4, 2.2, 2.2)), '#8a6a2a', 0.8);
    } },
    shell: { name: 'Shell', draw(c) {
      const s = p2((p) => { p.moveTo(0, 11); p.lineTo(-14, -1); p.quadraticCurveTo(-14, -14, 0, -15); p.quadraticCurveTo(14, -14, 14, -1); p.closePath(); });
      fs(c, s, '#f6c9b0');
      c.save(); c.clip(s); c.strokeStyle = '#e09a82'; c.lineWidth = 1.4;
      for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(0, 11); c.lineTo(k * 4.6, -16); c.stroke(); }
      c.restore();
      c.strokeStyle = INKL; c.lineWidth = 1.2; c.stroke(s);
      fs(c, p2((p) => { p.moveTo(-6, 9); p.lineTo(6, 9); p.lineTo(4.4, 15); p.lineTo(-4.4, 15); p.closePath(); }), '#eab49a', 1);
      shine(c, -5, -8, 3, 1.4, 0.55, -0.4);
    } },
    dice: { name: 'Dice', draw(c) {
      const die = (x, y, s, rot, pips) => {
        c.save(); c.translate(x, y); c.rotate(rot);
        fs(c, p2((p) => p.roundRect(-s / 2 + 2.6, -s / 2 + 2.6, s, s, 3.4)), '#d9cfc0', 1);
        fs(c, p2((p) => p.roundRect(-s / 2, -s / 2, s, s, 3.4)), '#fffdf7', 1.2);
        c.fillStyle = '#3b352e';
        for (const [i, j] of pips) { c.beginPath(); c.arc(i * s * 0.27, j * s * 0.27, s * 0.09, 0, TAU); c.fill(); }
        c.restore();
      };
      die(-6, 2, 17, -0.22, [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]]);
      die(8, 6.5, 15, 0.3, [[-1, -1], [0, 0], [1, 1]]);
    } },
    mask: { name: 'Mask', draw(c) {
      ln(c, [8, 3, 13, 15], '#c49a35', 2.2);
      const m = p2((p) => {
        p.moveTo(-17, -7); p.quadraticCurveTo(-9, -12, 0, -6); p.quadraticCurveTo(9, -12, 17, -7);
        p.quadraticCurveTo(17, 4, 8, 5); p.quadraticCurveTo(2, 5, 0, 1); p.quadraticCurveTo(-2, 5, -8, 5); p.quadraticCurveTo(-17, 4, -17, -7); p.closePath();
        E(p, -7.5, -2.5, 4.4, 2.8, 0.15, true); E(p, 7.5, -2.5, 4.4, 2.8, -0.15, true);
      });
      fs(c, m, '#7a63b3');
      c.strokeStyle = '#e2c25a'; c.lineWidth = 1.2; c.stroke(m);
      fs(c, p2((p) => { p.moveTo(-15, -8); p.quadraticCurveTo(-22, -16, -17, -22); p.quadraticCurveTo(-13, -15, -12, -9); p.closePath(); }), '#e98aa6', 0.9);
      c.fillStyle = '#e2c25a'; for (const x of [-12, 0, 12]) { c.beginPath(); c.arc(x, x ? -7.6 : -5, 1.2, 0, TAU); c.fill(); }
    } },
  };

  // ------------------------------------------------------------ the clutter
  // Bigger things standing at x on a surface at y, about 54 wide at most.
  const CLUTTER = {
    parcel(c, x, y, r) {
      const w = 40 + r() * 12, h = 24 + r() * 16, col = r() < 0.5 ? '#c99f6e' : '#b98d5e';
      fs(c, p2((p) => p.rect(x - w / 2, y - h, w, h)), col);
      ln(c, [x - w / 2, y - h * 0.5, x + w / 2, y - h * 0.5], '#f3ead9', 1.4);
      ln(c, [x + w * 0.1, y - h, x + w * 0.1, y], '#f3ead9', 1.4);
      fs(c, p2((p) => p.rect(x - w / 2 + 4, y - h + 4, 12, 7)), '#fbf3e2', 0.6);
      c.strokeStyle = '#f3ead9'; c.lineWidth = 1.3; c.beginPath(); c.ellipse(x + w * 0.1 - 3, y - h - 2, 3, 2, 0.4, 0, TAU); c.ellipse(x + w * 0.1 + 3, y - h - 2, 3, 2, -0.4, 0, TAU); c.stroke();
    },
    suitcase(c, x, y, r) {
      const w = 48, h = 32, col = r() < 0.5 ? '#8a5a3a' : '#6f7f5a';
      c.strokeStyle = '#3b2a1a'; c.lineWidth = 2.4; c.beginPath(); c.roundRect(x - 7, y - h - 6, 14, 8, 3); c.stroke();
      fs(c, p2((p) => p.roundRect(x - w / 2, y - h, w, h, 5)), col);
      c.fillStyle = 'rgba(40,25,15,0.35)'; c.fillRect(x - 14, y - h, 4, h); c.fillRect(x + 10, y - h, 4, h);
      c.fillStyle = '#d9ad45'; for (const [dx, dy] of [[-w / 2 + 3, -h + 3], [w / 2 - 6, -h + 3], [-w / 2 + 3, -6], [w / 2 - 6, -6]]) c.fillRect(x + dx, y + dy, 3, 3);
    },
    hatbox(c, x, y, r) {
      const col = r() < 0.5 ? '#efb4ae' : '#a6d3d4', deep = col === '#efb4ae' ? '#e39a92' : '#86bcbd';
      const body = p2((p) => { p.moveTo(x - 22, y - 26); p.lineTo(x - 22, y - 2); p.ellipse(x, y - 2, 22, 5, 0, Math.PI, 0, true); p.lineTo(x + 22, y - 26); p.closePath(); });
      fs(c, body, col);
      c.save(); c.clip(body); c.fillStyle = deep; for (let k = -18; k < 22; k += 9) c.fillRect(x + k, y - 30, 4, 32); c.restore();
      fs(c, p2((p) => E(p, x, y - 27, 23.5, 6)), '#fbf3e2');
      fs(c, p2((p) => p.rect(x - 23.5, y - 27, 47, 5)), '#fbf3e2', 0.8);
      ln(c, [x, y - 33, x, y - 1], '#c9474f', 1.6);
    },
    papers(c, x, y, r) {
      for (let i = 0; i < 4; i++) {
        const dx = (r() - 0.5) * 6, yy = y - 5 - i * 5;
        fs(c, p2((p) => p.rect(x - 23 + dx, yy, 46, 5)), i % 2 ? '#efe9dc' : '#e4dccb', 0.8);
      }
      ln(c, [x - 16, y - 21, x + 10, y - 21], 'rgba(59,53,46,0.35)', 0.8);
    },
    basket(c, x, y) {
      c.strokeStyle = '#a07a46'; c.lineWidth = 2.6; c.beginPath(); c.ellipse(x, y - 22, 17, 13, 0, Math.PI, 0); c.stroke();
      const b = p2((p) => { p.moveTo(x - 22, y - 22); p.lineTo(x + 22, y - 22); p.lineTo(x + 17, y); p.lineTo(x - 17, y); p.closePath(); });
      fs(c, b, '#c99e69');
      c.save(); c.clip(b); c.strokeStyle = 'rgba(120,80,40,0.45)'; c.lineWidth = 1;
      for (let yy = y - 18; yy < y; yy += 4.5) { c.beginPath(); c.moveTo(x - 24, yy); c.lineTo(x + 24, yy); c.stroke(); }
      for (let xx = x - 20; xx < x + 22; xx += 6) { c.beginPath(); c.moveTo(xx, y - 22); c.lineTo(xx + 1, y); c.stroke(); }
      c.restore();
    },
    box(c, x, y, r) {
      const w = 42 + r() * 12, h = 30 + r() * 18;
      fs(c, p2((p) => p.rect(x - w / 2, y - h, w, h)), '#d2a874');
      if (r() < 0.5) {
        fs(c, p2((p) => { p.moveTo(x - w / 2, y - h); p.lineTo(x - w / 2 - 7, y - h - 9); p.lineTo(x - 3, y - h - 9); p.lineTo(x, y - h); p.closePath(); }), '#c69a62', 1);
        fs(c, p2((p) => { p.moveTo(x + w / 2, y - h); p.lineTo(x + w / 2 + 5, y - h - 10); p.lineTo(x + 4, y - h - 10); p.lineTo(x, y - h); p.closePath(); }), '#dcb684', 1);
      } else c.fillStyle = '#ead1a0', c.fillRect(x - 4, y - h, 8, h * 0.45);
      ln(c, [x - w / 2 + 5, y - 8, x - w / 2 + 16, y - 8], 'rgba(59,53,46,0.35)', 1);
    },
    books(c, x, y, r) {
      const cols = ['#c9474f', '#3d5a86', '#4e7b5b', '#d4873a', '#7a63b3', '#2e8587'];
      let yy = y;
      const n = 3 + Math.floor(r() * 2);
      for (let i = 0; i < n; i++) {
        const w = 34 + r() * 14, h = 6 + r() * 3, dx = (r() - 0.5) * 8, col = cols[Math.floor(r() * cols.length)];
        fs(c, p2((p) => p.rect(x - w / 2 + dx, yy - h, w, h)), col, 0.9);
        c.fillStyle = '#fbf3e2'; c.fillRect(x + w / 2 + dx - 3, yy - h + 1.4, 2, h - 2.8);
        yy -= h;
      }
    },
    lampshade(c, x, y) {
      fs(c, p2((p) => E(p, x, y - 2, 10, 3)), '#8a5a3a', 0.8);
      ln(c, [x, y - 3, x, y - 26], '#8a5a3a', 2);
      fs(c, p2((p) => { p.moveTo(x - 9, y - 46); p.lineTo(x + 9, y - 46); p.lineTo(x + 17, y - 24); p.lineTo(x - 17, y - 24); p.closePath(); }), '#f2d88a');
      c.fillStyle = '#d98b63'; for (let k = -15; k <= 15; k += 3.75) { c.beginPath(); c.arc(x + k, y - 22, 1.2, 0, TAU); c.fill(); }
    },
    sheet(c, x, y) {
      fs(c, p2((p) => { p.moveTo(x - 26, y); p.quadraticCurveTo(x - 26, y - 40, x - 6, y - 44); p.quadraticCurveTo(x + 22, y - 46, x + 25, y - 18); p.quadraticCurveTo(x + 27, y - 4, x + 26, y); p.closePath(); }), '#ebe6dc');
      ln(c, [x - 12, y - 4, x - 8, y - 30], 'rgba(150,140,120,0.4)', 1.2); ln(c, [x + 8, y - 3, x + 12, y - 26], 'rgba(150,140,120,0.4)', 1.2);
    },
    trunk(c, x, y) {
      fs(c, p2((p) => { p.moveTo(x - 25, y); p.lineTo(x - 25, y - 22); p.quadraticCurveTo(x, y - 40, x + 25, y - 22); p.lineTo(x + 25, y); p.closePath(); }), '#7a4f2e');
      ln(c, [x - 25, y - 22, x + 25, y - 22], '#5a3a22', 1.6);
      c.fillStyle = '#c49a35'; c.fillRect(x - 17, y - 31, 4, 31); c.fillRect(x + 13, y - 31, 4, 31);
      fs(c, p2((p) => p.rect(x - 3, y - 24, 6, 6)), '#d9ad45', 0.8);
    },
    rug(c, x, y, r) {
      const col = r() < 0.5 ? '#c4704b' : '#5f8fbf';
      fs(c, p2((p) => p.roundRect(x - 26, y - 14, 46, 14, 7)), col);
      c.fillStyle = 'rgba(255,250,241,0.5)'; c.fillRect(x - 14, y - 14, 3, 14); c.fillRect(x + 2, y - 14, 3, 14);
      fs(c, p2((p) => { E(p, x + 20, y - 7, 5.5, 7); }), col, 1);
      c.strokeStyle = 'rgba(59,53,46,0.45)'; c.lineWidth = 0.9; c.beginPath(); c.arc(x + 20, y - 7, 3, 0, 5); c.stroke();
    },
    sack(c, x, y, r, label) {
      const s = p2((p) => { p.moveTo(x - 22, y); p.quadraticCurveTo(x - 25, y - 26, x - 12, y - 40); p.lineTo(x + 12, y - 40); p.quadraticCurveTo(x + 25, y - 26, x + 22, y); p.closePath(); });
      fs(c, s, '#d9c49a');
      c.save(); c.clip(s); c.strokeStyle = 'rgba(140,110,60,0.25)'; c.lineWidth = 0.8;
      for (let k = -24; k < 26; k += 3) { c.beginPath(); c.moveTo(x + k, y - 42); c.lineTo(x + k, y); c.stroke(); }
      c.restore();
      fs(c, p2((p) => { p.moveTo(x - 9, y - 40); p.lineTo(x - 12, y - 48); p.lineTo(x + 12, y - 48); p.lineTo(x + 9, y - 40); p.closePath(); }), '#d9c49a', 1);
      ln(c, [x - 10, y - 41, x + 10, y - 41], '#8a5a3a', 2);
      PZ.text(c, label || ['FLOUR', 'OATS', 'SUGAR'][Math.floor(r() * 3)], x, y - 17, { size: 8.5, weight: 900, color: 'rgba(110,70,35,0.75)' });
    },
    jar(c, x, y, r) {
      const fill = ['#c4704b', '#e9c77a', '#6f9a6a', '#8a5a3a'][Math.floor(r() * 4)];
      const j = p2((p) => p.roundRect(x - 9, y - 34, 18, 34, 4));
      fs(c, j, 'rgba(225,238,242,0.8)');
      c.save(); c.clip(j); c.fillStyle = fill; c.fillRect(x - 10, y - 22, 20, 22);
      c.fillStyle = 'rgba(255,255,255,0.3)'; for (let k = 0; k < 10; k++) { c.beginPath(); c.arc(x - 6 + (k % 4) * 4, y - 19 + Math.floor(k / 4) * 6, 1.2, 0, TAU); c.fill(); }
      c.restore();
      c.strokeStyle = INKL; c.lineWidth = 1.2; c.stroke(j);
      fs(c, p2((p) => p.roundRect(x - 10, y - 39, 20, 6, 2)), '#b98f5a', 1);
    },
    tins(c, x, y, r) {
      for (const [dx, h, col] of [[-12, 22, '#5f8fbf'], [10, 26, r() < 0.5 ? '#e2574c' : '#6f9a6a']]) {
        fs(c, p2((p) => p.rect(x + dx - 10, y - h, 20, h)), '#c0c7cd', 1);
        c.fillStyle = col; c.fillRect(x + dx - 10, y - h + 5, 20, h - 10);
        fs(c, p2((p) => E(p, x + dx, y - h, 10, 2.6)), '#dde3e8', 0.8);
      }
    },
    crate(c, x, y, r, w = 50, h = 30) {
      fs(c, p2((p) => p.rect(x - w / 2, y - h, w, h)), '#b98f5a');
      c.fillStyle = 'rgba(80,50,20,0.35)'; for (let yy = y - h + h / 3; yy < y; yy += h / 3) c.fillRect(x - w / 2, yy - 1, w, 2);
      c.fillStyle = '#a47a49'; c.fillRect(x - w / 2, y - h, 4, h); c.fillRect(x + w / 2 - 4, y - h, 4, h);
    },
    bucket(c, x, y, r) {
      c.strokeStyle = '#6b6157'; c.lineWidth = 1.6; c.beginPath(); c.ellipse(x, y - 30, 15, 12, 0, Math.PI, 0); c.stroke();
      const b = p2((p) => { p.moveTo(x - 16, y - 30); p.lineTo(x + 16, y - 30); p.lineTo(x + 12, y); p.lineTo(x - 12, y); p.closePath(); });
      fs(c, b, r() < 0.5 ? '#a9b0b6' : '#8fa9c0');
      c.fillStyle = 'rgba(59,53,46,0.2)'; c.fillRect(x - 15, y - 24, 30, 2); c.fillRect(x - 13, y - 8, 26, 2);
      fs(c, p2((p) => E(p, x, y - 30, 16, 3.4)), '#c9cfd4', 1);
    },
    coil(c, x, y) {
      for (let i = 0; i < 4; i++) {
        c.strokeStyle = INKL; c.lineWidth = 4.4; c.beginPath(); c.ellipse(x, y - 5 - i * 3.4, 20 - i * 1.6, 5, 0, 0, TAU); c.stroke();
        c.strokeStyle = '#c99e69'; c.lineWidth = 2.6; c.stroke();
      }
    },
    straw(c, x, y, r) {
      c.strokeStyle = '#d9b75a'; c.lineWidth = 1.2;
      for (let i = 0; i < 26; i++) { const a = -Math.PI / 2 + (r() - 0.5) * 2.2, l = 8 + r() * 14, sx = x + (r() - 0.5) * 34; c.beginPath(); c.moveTo(sx, y); c.lineTo(sx + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
    },
    stack(c, x, y, r) { // a standing pile of books, spines out
      const cols = ['#c9474f', '#3d5a86', '#4e7b5b', '#d4873a', '#7a63b3', '#2e8587'];
      let xx = x - 22;
      while (xx < x + 18) {
        const w = 6 + r() * 4, h = 26 + r() * 14;
        fs(c, p2((p) => p.rect(xx, y - h, w, h)), cols[Math.floor(r() * cols.length)], 0.8);
        c.fillStyle = 'rgba(255,240,200,0.6)'; c.fillRect(xx + 1.4, y - h + 5, w - 2.8, 1.4);
        xx += w + 0.6;
      }
    },
    vase(c, x, y, r) { // a tall vase, blue and white or a deep red glaze
      const blue = r() < 0.5, col = blue ? '#f4f1ea' : '#8e3b46', deep = blue ? '#3d5a86' : '#c9a14a';
      const v = p2((p) => { p.moveTo(x - 7, y - 44); p.lineTo(x + 7, y - 44); p.quadraticCurveTo(x + 5, y - 36, x + 13, y - 26); p.quadraticCurveTo(x + 20, y - 12, x + 10, y); p.lineTo(x - 10, y); p.quadraticCurveTo(x - 20, y - 12, x - 13, y - 26); p.quadraticCurveTo(x - 5, y - 36, x - 7, y - 44); p.closePath(); });
      fs(c, v, col);
      c.save(); c.clip(v); c.fillStyle = deep;
      c.fillRect(x - 20, y - 30, 40, 3); c.fillRect(x - 20, y - 8, 40, 2.4);
      for (const dx of [-8, 0, 8]) { c.beginPath(); c.arc(x + dx, y - 18, 3, 0, TAU); c.fill(); }
      c.restore();
      fs(c, p2((p) => E(p, x, y - 44, 8, 2.4)), blue ? '#e6e1d6' : '#a8475a', 1);
      shine(c, x - 8, y - 22, 1.6, 7, 0.4, 0.2);
    },
    birdcage(c, x, y) { // an old brass birdcage, empty and open
      fs(c, p2((p) => E(p, x, y - 3, 19, 4.4)), '#b8902f', 1);
      c.strokeStyle = '#c49a35'; c.lineWidth = 1.4;
      for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(x + k * 5.6, y - 5); c.lineTo(x + k * 5.6, y - 30); c.quadraticCurveTo(x + k * 3, y - 46, x, y - 48); c.stroke(); }
      c.strokeStyle = '#b8902f'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y - 30, 17, 3.6, 0, 0, TAU); c.stroke();
      ln(c, [x - 6, y - 18, x + 6, y - 18], '#8a5a3a', 2);
      c.strokeStyle = '#c49a35'; c.lineWidth = 2; c.beginPath(); c.arc(x, y - 52, 4, 0, TAU); c.stroke();
    },
    bust(c, x, y) { // a plaster bust on a little plinth
      fs(c, p2((p) => p.rect(x - 13, y - 10, 26, 10)), '#d9cfc0', 1);
      fs(c, p2((p) => { p.moveTo(x - 17, y - 10); p.quadraticCurveTo(x - 17, y - 26, x - 5, y - 28); p.lineTo(x + 5, y - 28); p.quadraticCurveTo(x + 17, y - 26, x + 17, y - 10); p.closePath(); }), '#efe6d6');
      fs(c, p2((p) => p.rect(x - 4, y - 32, 8, 6)), '#efe6d6', 0.8);
      fs(c, p2((p) => E(p, x, y - 40, 8.4, 10)), '#efe6d6');
      fs(c, p2((p) => { p.moveTo(x - 8.6, y - 42); p.quadraticCurveTo(x - 9, y - 52, x, y - 51); p.quadraticCurveTo(x + 9, y - 52, x + 8.6, y - 42); p.quadraticCurveTo(x + 2, y - 46, x - 8.6, y - 42); p.closePath(); }), '#e2d7c4', 0.8);
      ln(c, [x + 8, y - 40, x + 10, y - 37, x + 8, y - 36], INKL, 1);
    },
  };
  // little things tucked between the spots, behind the things
  const FILL = {
    tag(c, x, y) { fs(c, p2((p) => { p.moveTo(x - 7, y - 14); p.lineTo(x + 5, y - 14); p.lineTo(x + 9, y - 9); p.lineTo(x + 5, y - 4); p.lineTo(x - 7, y - 4); p.closePath(); }), '#f3ead9', 0.8); c.fillStyle = '#c9474f'; c.beginPath(); c.arc(x + 4, y - 9, 1.2, 0, TAU); c.fill(); },
    mini(c, x, y, r) { const w = 18 + r() * 6, h = 10 + r() * 8; fs(c, p2((p) => p.rect(x - w / 2, y - h, w, h)), r() < 0.5 ? '#c99f6e' : '#d2a874', 0.9); ln(c, [x, y - h, x, y], '#f3ead9', 1); },
    flat(c, x, y, r) { for (let i = 0; i < 3; i++) fs(c, p2((p) => p.rect(x - 11 + (r() - 0.5) * 3, y - 4 - i * 4, 22, 4)), ['#c9474f', '#3d5a86', '#4e7b5b', '#d4873a'][Math.floor(r() * 4)], 0.7); },
    pot(c, x, y, r) { fs(c, p2((p) => p.roundRect(x - 6, y - 15, 12, 15, 3)), 'rgba(225,238,242,0.85)', 0.9); c.fillStyle = r() < 0.5 ? '#c4704b' : '#e9c77a'; c.fillRect(x - 5, y - 9, 10, 8); fs(c, p2((p) => p.rect(x - 7, y - 18, 14, 3.4)), '#b98f5a', 0.7); },
    tuft(c, x, y, r) { CLUTTER.straw(c, x, y, r); },
    spines(c, x, y, r) { for (let k = -2; k <= 1; k++) fs(c, p2((p) => p.rect(x + k * 6, y - 24 - (k & 1) * 3, 5.4, 24 + (k & 1) * 3)), ['#c9474f', '#3d5a86', '#4e7b5b', '#d4873a', '#7a63b3'][Math.floor(r() * 5)], 0.6); },
    coins(c, x, y, r) { const n = 2 + Math.floor(r() * 3); for (let i = 0; i < n; i++) fs(c, p2((p) => E(p, x + (r() - 0.5) * 3, y - 2 - i * 3, 7, 2.4)), i % 2 ? '#d9ad45' : '#c49a35', 0.8); },
  };

  // ------------------------------------------------------------ the corners
  const xs5 = [44, 112, 180, 248, 316];
  const row = (y, xs) => xs.map((x) => ({ x, y }));

  function planks(c, x0, y0, x1, y1, base, step, rr) {
    c.fillStyle = base; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    for (let x = Math.floor(x0 / step) * step; x < x1; x += step) {
      c.fillStyle = 'rgba(110,70,35,0.2)'; c.fillRect(x, y0, 1.4, y1 - y0);
      c.fillStyle = 'rgba(255,250,235,0.35)'; c.fillRect(x + 1.4, y0, 1, y1 - y0);
      if (rr() < 0.5) { c.fillStyle = 'rgba(110,70,35,0.08)'; c.fillRect(x + 2.4, y0, step - 2.4, y1 - y0); }
    }
  }
  function floorboards(c, x0, y0, x1, y1, base, rr) {
    wood(c, rr, x0, y0, x1 - x0, y1 - y0, base);
    for (let y = y0 + 12; y < y1; y += 13) { c.fillStyle = 'rgba(90,55,25,0.25)'; c.fillRect(x0, y, x1 - x0, 1.2); }
    for (let y = y0, k = 0; y < y1; y += 13, k++) { const x = x0 + ((k * 97) % 140) + 30; c.fillStyle = 'rgba(90,55,25,0.25)'; for (let xx = x; xx < x1; xx += 170) c.fillRect(xx, y, 1.2, 12); }
  }
  function shelf(c, rr, x0, x1, y, col = '#c79a63') {
    c.fillStyle = 'rgba(90,60,30,0.16)'; c.fillRect(x0, y + 8, x1 - x0, 7);
    wood(c, rr, x0, y - 2, x1 - x0, 10, col);
    c.fillStyle = 'rgba(255,240,210,0.45)'; c.fillRect(x0, y - 2, x1 - x0, 1.2);
    c.fillStyle = 'rgba(80,50,20,0.3)'; c.fillRect(x0, y + 7, x1 - x0, 1.2);
  }
  function bracket(c, x, y, col) {
    c.strokeStyle = col; c.lineWidth = 2.4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y + 8); c.lineTo(x, y + 28); c.moveTo(x, y + 26); c.quadraticCurveTo(x + 4, y + 12, x + 15, y + 9); c.stroke();
  }

  // the back rows: more of the same clutter further back, drawn faded so the
  // things in front stay easy to make out
  const MUTED = ['#c99f6e', '#b98d5e', '#d2a874', '#c4a47c'];
  const SPINES = ['#c9474f', '#3d5a86', '#4e7b5b', '#d4873a', '#7a63b3', '#2e8587', '#b5a184'];
  function backParcels(c, rr, y, x0 = 16, x1 = 344) {
    for (let x = x0 + rr() * 12; x < x1 - 18;) {
      const w = 26 + rr() * 18, h = 30 + rr() * 26;
      if (rr() < 0.75) {
        fs(c, p2((p) => p.rect(x, y - h, w, h)), MUTED[Math.floor(rr() * MUTED.length)], 0.9);
        if (rr() < 0.6) ln(c, [x + w / 2, y - h, x + w / 2, y], '#f3ead9', 1.2);
        if (rr() < 0.5) { const h2 = 12 + rr() * 12; fs(c, p2((p) => p.rect(x + 4, y - h - h2, w - 8, h2)), MUTED[Math.floor(rr() * MUTED.length)], 0.9); }
      }
      x += w + 4 + rr() * 16;
    }
  }
  function backSpines(c, rr, y, x0 = 12, x1 = 348) {
    for (let x = x0; x < x1 - 4;) {
      if (rr() < 0.08) { x += 14 + rr() * 16; continue; }
      const w = 6 + rr() * 5, h = 30 + rr() * 22, lean = rr() < 0.06;
      c.save(); if (lean) { c.translate(x, y); c.rotate(-0.25); c.translate(-x, -y); }
      fs(c, p2((p) => p.rect(x, y - h, w, h)), SPINES[Math.floor(rr() * SPINES.length)], 0.7);
      c.fillStyle = 'rgba(255,240,200,0.55)'; c.fillRect(x + 1.2, y - h + 5, w - 2.4, 1.2); c.fillRect(x + 1.2, y - 8, w - 2.4, 1.2);
      c.restore();
      x += w + (lean ? 6 : 0.4);
    }
  }
  // bottles, little boxes and vases at the back of the cabinet's shelves
  function backCurios(c, rr, y) {
    const cols = ['#6f9a6a', '#8fbfe6', '#c4704b', '#bba9df', '#d2a874', '#a6d3d4'];
    for (let x = 22 + rr() * 8; x < 338;) {
      const k = rr(), col = cols[Math.floor(rr() * cols.length)];
      if (k < 0.4) {
        const h = 22 + rr() * 14;
        fs(c, p2((p) => { p.moveTo(x - 7, y); p.lineTo(x - 7, y - h + 10); p.quadraticCurveTo(x - 7, y - h + 4, x - 2.4, y - h + 3); p.lineTo(x - 2.4, y - h); p.lineTo(x + 2.4, y - h); p.lineTo(x + 2.4, y - h + 3); p.quadraticCurveTo(x + 7, y - h + 4, x + 7, y - h + 10); p.lineTo(x + 7, y); p.closePath(); }), col, 0.8);
        x += 20 + rr() * 8;
      } else if (k < 0.7) {
        const w = 22 + rr() * 12, h = 12 + rr() * 10;
        fs(c, p2((p) => p.rect(x - w / 2, y - h, w, h)), MUTED[Math.floor(rr() * MUTED.length)], 0.8);
        c.fillStyle = 'rgba(201,161,74,0.8)'; c.fillRect(x - 2, y - h / 2 - 1.5, 4, 3);
        x += w + 6 + rr() * 8;
      } else {
        fs(c, p2((p) => { p.moveTo(x - 5, y - 26); p.lineTo(x + 5, y - 26); p.quadraticCurveTo(x + 13, y - 14, x + 7, y); p.lineTo(x - 7, y); p.quadraticCurveTo(x - 13, y - 14, x - 5, y - 26); p.closePath(); }), col, 0.8);
        x += 24 + rr() * 8;
      }
    }
  }
  function backJars(c, rr, y) {
    for (let x = 22 + rr() * 10; x < 340;) {
      const k = rr();
      if (k < 0.5) CLUTTER.jar(c, x, y, rr); else if (k < 0.8) CLUTTER.tins(c, x + 10, y, rr);
      x += k < 0.5 ? 26 + rr() * 10 : 50 + rr() * 10;
    }
  }

  const VARIANTS = {
    // the lost-property shelves at the station
    halt: {
      items: ['umbrella', 'hat', 'glove', 'glasses', 'ticket', 'watch', 'key', 'train', 'scarf', 'lantern', 'bell', 'teddy', 'book'],
      spots: [...row(148, xs5), ...row(252, xs5), ...row(356, xs5), ...row(438, [70, 180, 290])],
      clutter: ['parcel', 'suitcase', 'hatbox', 'papers', 'basket', 'parcel'],
      fill: ['mini'],
      back(c, b, rr) {
        planks(c, b.x0, b.y0, b.x1, 392, '#efe1c6', 18, rr);
        c.fillStyle = '#8e3b46'; c.fillRect(b.x0, 378, b.x1 - b.x0, 14); c.fillStyle = '#a84d58'; c.fillRect(b.x0, 378, b.x1 - b.x0, 2);
        floorboards(c, b.x0, 392, b.x1, BOT, '#b98f5a', rr);
        // the sign over the shelves
        c.fillStyle = 'rgba(60,30,30,0.2)'; PZ.rr(c, 98, 47, 168, 30, 5); c.fill();
        c.fillStyle = '#8e3b46'; PZ.rr(c, 96, 44, 168, 30, 5); c.fill();
        c.strokeStyle = 'rgba(246,239,227,0.7)'; c.lineWidth = 1.2; PZ.rr(c, 100, 48, 160, 22, 3); c.stroke();
        PZ.text(c, 'LOST PROPERTY', 180, 59.5, { size: 13.5, weight: 900, color: '#f6efe3' });
        for (const y of [148, 252, 356]) { shelf(c, rr, 12, 348, y); for (const x of [26, 180, 334]) bracket(c, x, y, '#5a3a3f'); }
      },
      backRow(c, rr) { for (const y of [148, 252, 356]) backParcels(c, rr, y - 2); },
    },
    // the cottage attic, under the roof
    attic: {
      items: ['teddy', 'top', 'lantern', 'candle', 'key', 'feather', 'glasses', 'compass', 'wool', 'frame', 'boat', 'bell', 'train'],
      spots: [...row(204, xs5), ...row(350, xs5), ...row(436, xs5)],
      clutter: ['box', 'books', 'lampshade', 'sheet', 'trunk', 'rug', 'box'],
      fill: ['mini', 'flat', 'flat'],
      back(c, b, rr) {
        c.fillStyle = '#ecdfc7'; c.fillRect(b.x0, b.y0, b.x1 - b.x0, 304 - b.y0);
        // the round window and the light falling in
        c.fillStyle = 'rgba(255,245,210,0.22)'; c.beginPath(); c.moveTo(156, 100); c.lineTo(204, 100); c.lineTo(280, 304); c.lineTo(110, 304); c.closePath(); c.fill();
        c.fillStyle = '#c9a272'; c.beginPath(); c.arc(180, 96, 30, 0, TAU); c.fill();
        c.fillStyle = '#bfe2ef'; c.beginPath(); c.arc(180, 96, 25, 0, TAU); c.fill();
        c.fillStyle = '#fff'; c.globalAlpha = 0.8; c.beginPath(); c.ellipse(170, 90, 9, 4, 0, 0, TAU); c.ellipse(178, 87, 6, 4, 0, 0, TAU); c.fill(); c.globalAlpha = 1;
        c.fillStyle = '#8dbb80'; c.beginPath(); c.arc(196, 112, 10, 0, TAU); c.fill();
        c.fillStyle = '#c9a272'; c.fillRect(178.5, 70, 3, 52); c.fillRect(154, 94.5, 52, 3);
        // the sloping roof boards
        c.fillStyle = '#b48a5a'; c.beginPath(); c.moveTo(b.x0, b.y0); c.lineTo(b.x1, b.y0); c.lineTo(b.x1, 160); c.lineTo(180, 26); c.lineTo(b.x0, 160); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(90,55,25,0.35)'; c.lineWidth = 1;
        for (let k = 1; k < 9; k++) { c.beginPath(); c.moveTo(b.x0, 160 - k * 18); c.lineTo(180, 26 - k * 18); c.lineTo(b.x1, 160 - k * 18); c.stroke(); }
        c.strokeStyle = '#7a5232'; c.lineWidth = 9; c.lineCap = 'butt'; c.beginPath(); c.moveTo(b.x0, 164); c.lineTo(180, 30); c.lineTo(b.x1, 164); c.stroke();
        c.fillStyle = '#7a5232'; c.fillRect(b.x0, 160, 12 - b.x0, 144); c.fillRect(348, 160, b.x1 - 348, 144);
        // the long shelf under the window, the skirting and the floor
        shelf(c, rr, 10, 350, 204, '#b98f5a');
        for (const x of [24, 336]) bracket(c, x, 204, '#6b4a32');
        c.fillStyle = '#c9a272'; c.fillRect(b.x0, 296, b.x1 - b.x0, 8);
        floorboards(c, b.x0, 304, b.x1, BOT, '#c69c66', rr);
        c.fillStyle = 'rgba(255,245,210,0.18)'; c.beginPath(); c.moveTo(110, 304); c.lineTo(280, 304); c.lineTo(300, 360); c.lineTo(90, 360); c.closePath(); c.fill();
      },
      backRow(c, rr) {
        for (let x = 36 + rr() * 10; x < 326;) { if (rr() < 0.7) CLUTTER.books(c, x, 202, rr); x += 44 + rr() * 26; }
        backParcels(c, rr, 334, 12, 348);
      },
    },
    // the café's store room: shelves of jars and tins, crates and sacks
    store: {
      items: ['teacup', 'teapot', 'whisk', 'rollingpin', 'lemon', 'apple', 'honey', 'cupcake', 'milk', 'spoon', 'egg', 'mitt', 'candle'],
      spots: [...row(150, xs5), ...row(256, xs5), ...row(354, [70, 180, 290]), ...row(438, [125, 235])],
      clutter: ['jar', 'tins', 'sack', 'jar', 'box', 'tins'],
      fill: ['pot', 'pot', 'mini'],
      back(c, b, rr) {
        c.fillStyle = '#efe6d6'; c.fillRect(b.x0, b.y0, b.x1 - b.x0, 366 - b.y0);
        c.strokeStyle = 'rgba(160,130,95,0.22)'; c.lineWidth = 1;
        for (let y = 40, k = 0; y < 366; y += 16, k++) {
          c.beginPath(); c.moveTo(b.x0, y); c.lineTo(b.x1, y); c.stroke();
          for (let x = (k % 2 ? 0 : 22) + Math.floor(b.x0 / 44) * 44; x < b.x1; x += 44) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 16); c.stroke(); }
        }
        // the shelving: two uprights, a top board and two shelves
        c.fillStyle = '#a8784a'; c.fillRect(8, 84, 10, 282); c.fillRect(342, 84, 10, 282);
        wood(c, rr, 4, 78, 352, 12, '#b98f5a');
        PZ.text(c, 'STORE ROOM', 180, 62, { size: 13, weight: 900, color: 'rgba(110,80,50,0.6)' });
        for (const y of [150, 256]) shelf(c, rr, 8, 352, y);
        // stone flags on the floor, and the crates
        c.fillStyle = '#d4c8b2'; c.fillRect(b.x0, 366, b.x1 - b.x0, BOT - 366);
        c.strokeStyle = 'rgba(120,105,80,0.35)'; c.lineWidth = 1.2;
        for (const y of [384, 410, 436]) { c.beginPath(); c.moveTo(b.x0, y); c.lineTo(b.x1, y); c.stroke(); }
        for (let x = -20; x < b.x1; x += 58) { c.beginPath(); c.moveTo(x, 366); c.lineTo(x + 8, BOT); c.stroke(); }
        for (const x of [70, 180, 290]) CLUTTER.crate(c, x, 438, rr, 56, 84);
      },
      backRow(c, rr) { for (const y of [150, 256]) backJars(c, rr, y - 2); },
    },
    // the bookshop stockroom: shelves, piles of books and boxes
    stockroom: {
      items: ['glasses', 'quill', 'inkpot', 'magnifier', 'key', 'teacup', 'candle', 'globe', 'pencil', 'scissors', 'hourglass', 'envelope', 'watch'],
      spots: [...row(150, xs5), ...row(256, xs5), { x: 60, y: 0 }, { x: 150, y: 0 }, { x: 240, y: 0 }, { x: 314, y: 0 }, ...row(438, [105, 195])],
      piles: [10, 11, 12, 13],                // indexes of the spots that sit on a pile of books
      clutter: ['box', 'books', 'stack', 'papers', 'box', 'stack'],
      fill: ['spines', 'spines', 'flat'],
      back(c, b, rr, sc) {
        c.fillStyle = '#e3e8d6'; c.fillRect(b.x0, b.y0, b.x1 - b.x0, 330 - b.y0);
        c.fillStyle = 'rgba(111,154,106,0.14)'; for (let x = Math.floor(b.x0 / 30) * 30; x < b.x1; x += 30) c.fillRect(x, b.y0, 12, 330 - b.y0);
        c.fillStyle = '#6b4a32'; c.fillRect(8, 74, 10, 256); c.fillRect(342, 74, 10, 256);
        wood(c, rr, 4, 68, 352, 12, '#8a6a4a');
        PZ.text(c, 'STOCKROOM', 180, 52, { size: 13, weight: 900, color: 'rgba(80,95,70,0.6)' });
        for (const y of [150, 256]) shelf(c, rr, 8, 352, y, '#a47a49');
        floorboards(c, b.x0, 330, b.x1, BOT, '#b98f5a', rr);
        // the piles of books on the floor, each its own height
        const cols = ['#c9474f', '#3d5a86', '#4e7b5b', '#d4873a', '#7a63b3', '#2e8587', '#b5a184'];
        for (const i of this.piles) {
          const s = sc.spots[i];
          let y = 438;
          while (y > s.y + 1) {
            const h = Math.min(y - s.y, 7 + rr() * 4), w = 46 + rr() * 8, dx = (rr() - 0.5) * 6;
            fs(c, p2((p) => p.rect(s.x - w / 2 + dx, y - h, w, h)), cols[Math.floor(rr() * cols.length)], 0.8);
            c.fillStyle = '#fbf3e2'; c.fillRect(s.x + w / 2 + dx - 3.5, y - h + 1.2, 2.4, Math.max(0.5, h - 2.4));
            y -= h;
          }
        }
      },
      backRow(c, rr) { for (const y of [150, 256]) backSpines(c, rr, y - 2); },
    },
    // the rescue's barn: a beam, hay bales and straw on the floor
    barn: {
      items: ['horseshoe', 'carrot', 'apple', 'egg', 'ball', 'bone', 'can', 'lantern', 'brush', 'bell', 'feather', 'workglove', 'boot'],
      spots: [...row(150, xs5), ...row(300, [50, 115, 180, 245, 310]), ...row(436, xs5)],
      clutter: ['bucket', 'sack', 'crate', 'coil', 'straw', 'bucket'],
      fill: ['tuft', 'tuft'],
      back(c, b, rr) {
        planks(c, b.x0, b.y0, b.x1, 380, '#b07d4f', 22, rr);
        c.fillStyle = 'rgba(255,240,200,0.18)'; for (const x of [62, 214, 302]) c.fillRect(x, b.y0, 2, 380 - b.y0);
        // the beam
        c.fillStyle = 'rgba(60,35,15,0.25)'; c.fillRect(b.x0, 160, b.x1 - b.x0, 8);
        wood(c, rr, b.x0, 148, b.x1 - b.x0, 13, '#7a5232', 'rgba(40,25,10,0.3)');
        c.fillStyle = 'rgba(255,230,190,0.3)'; c.fillRect(b.x0, 148, b.x1 - b.x0, 1.4);
        // a saddle on its peg and a horseshoe nailed up for luck
        // the saddle rack: a short pole out from the wall, with the saddle over it
        fs(c, p2((p) => p.rect(66, 212, 70, 7)), '#6b4a32', 1);
        fs(c, p2((p) => { p.moveTo(70, 214); p.quadraticCurveTo(70, 200, 79, 197); p.quadraticCurveTo(84, 206, 100, 208); p.quadraticCurveTo(116, 208, 124, 194); p.quadraticCurveTo(134, 198, 132, 214); p.closePath(); }), '#8a4f2e');
        fs(c, p2((p) => { p.moveTo(80, 212); p.quadraticCurveTo(78, 232, 86, 246); p.lineTo(116, 246); p.quadraticCurveTo(124, 232, 122, 212); p.closePath(); }), '#a0603a');
        ln(c, [84, 214, 118, 214], 'rgba(255,220,180,0.4)', 1.2);
        ln(c, [101, 246, 101, 264], '#5a3420', 2.2);
        c.strokeStyle = '#9a9da2'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(94, 276); c.lineTo(96, 266); c.quadraticCurveTo(101, 260, 106, 266); c.lineTo(108, 276); c.closePath(); c.stroke();
        ln(c, [280, 182, 288, 278], '#8a6a4a', 3); ln(c, [277, 186, 283, 168, 280, 186, 288, 170, 284, 186, 293, 172], '#8d8f93', 1.6);
        // the straw floor and the bales
        c.fillStyle = '#e2c47a'; c.fillRect(b.x0, 380, b.x1 - b.x0, BOT - 380);
        c.strokeStyle = 'rgba(170,130,50,0.45)'; c.lineWidth = 1;
        for (let i = 0; i < 160; i++) { const x = b.x0 + rr() * (b.x1 - b.x0), y = 382 + rr() * (BOT - 384), a = rr() * Math.PI; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 7, y + Math.sin(a) * 2); c.stroke(); }
        for (const [x0, x1] of [[16, 116], [116, 244], [244, 344]]) {
          fs(c, p2((p) => p.roundRect(x0, 300, x1 - x0, 82, 5)), '#e6c46a');
          c.strokeStyle = 'rgba(160,120,40,0.45)'; c.lineWidth = 1;
          for (let i = 0; i < 70; i++) { const x = x0 + 4 + rr() * (x1 - x0 - 8), y = 304 + rr() * 74; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (rr() - 0.5) * 10, y + 3 + rr() * 4); c.stroke(); }
          for (const k of [0.3, 0.7]) ln(c, [x0 + (x1 - x0) * k, 300, x0 + (x1 - x0) * k, 382], '#a8784a', 1.6);
          c.fillStyle = 'rgba(255,245,200,0.35)'; c.fillRect(x0 + 3, 301, x1 - x0 - 6, 2);
        }
      },
    },
    // the curiosity shop: a tall glass-fronted cabinet against a deep green
    // wall, a clock and an old map above it and a rug on the floor
    // the portrait gallery at the manor: little things tucked into the frames
    manor: {
      items: ['key', 'compass', 'quill', 'feather', 'glasses', 'bell', 'candle', 'hourglass', 'watch', 'inkpot', 'magnifier', 'teacup', 'envelope', 'ship', 'spyglass'],
      spots: [...row(156, xs5), ...row(252, xs5), ...row(348, xs5), ...row(438, [70, 180, 290])],
      clutter: ['vase', 'stack', 'vase'],
      fill: ['mini'],
      back(c, b, rr) {
        c.fillStyle = '#34503f'; c.fillRect(b.x0, b.y0, b.x1 - b.x0, 392 - b.y0);
        for (let y = 40, k = 0; y < 392; y += 30, k++) for (let x = Math.floor(b.x0 / 30) * 30 + (k % 2 ? 21 : 6); x < b.x1; x += 30) { c.fillStyle = 'rgba(214,180,90,0.16)'; c.beginPath(); c.arc(x, y, 1.6, 0, TAU); c.arc(x - 3, y + 3.4, 1.1, 0, TAU); c.arc(x + 3, y + 3.4, 1.1, 0, TAU); c.fill(); }
        c.fillStyle = 'rgba(15,25,15,0.3)'; PZ.rr(c, 90, 45, 180, 28, 5); c.fill();
        c.fillStyle = '#c9a14a'; PZ.rr(c, 88, 42, 180, 28, 5); c.fill();
        c.strokeStyle = 'rgba(110,80,20,0.6)'; c.lineWidth = 1.2; PZ.rr(c, 92, 46, 172, 20, 3); c.stroke();
        PZ.text(c, 'THE LONG GALLERY', 178, 56.5, { size: 13.5, weight: 900, color: '#4a3510' });
        // a gilt frame round every spot, a dim sitter inside, a picture rail under each row
        const coats = ['#6e2630', '#2b3a66', '#4e6b4a', '#5a4a6e', '#7a5a3a'], skins = ['#d9b896', '#c9a07c', '#e4c6a8'];
        for (const y of [156, 252, 348]) {
          for (const x of xs5) {
            const fx = x - 30, fy = y - 88, fw = 60, fh = 84;
            c.fillStyle = 'rgba(10,20,10,0.32)'; c.fillRect(fx + 3, fy + 4, fw, fh);
            c.fillStyle = '#c49a35'; c.fillRect(fx, fy, fw, fh);
            c.fillStyle = 'rgba(255,240,190,0.5)'; c.fillRect(fx, fy, fw, 1.6);
            c.fillStyle = '#ead7a4'; c.fillRect(fx + 5, fy + 5, fw - 10, fh - 10);
            c.fillStyle = U.mix('#2d2a26', U.pick(rr, ['#4a3a2a', '#2f3d36', '#3a3448']), 0.6); c.fillRect(fx + 7, fy + 7, fw - 14, fh - 14);
            c.save(); c.beginPath(); c.rect(fx + 7, fy + 7, fw - 14, fh - 14); c.clip();
            const k = (rr() * 5) | 0, sk = skins[(rr() * 3) | 0];
            c.fillStyle = U.mix(coats[k], '#22201c', 0.3); c.beginPath(); c.ellipse(x, fy + fh - 4, 24, 26, 0, 0, TAU); c.fill();
            c.fillStyle = U.mix(sk, '#22201c', 0.28); c.beginPath(); c.arc(x, fy + 32, 11, 0, TAU); c.fill();
            c.fillStyle = 'rgba(40,30,25,0.8)'; c.beginPath(); c.arc(x, fy + 28, 12, Math.PI, 0); c.fill();
            c.restore();
          }
          shelf(c, rr, 8, 352, y, '#6b3f28');
        }
        c.fillStyle = '#6b3f28'; c.fillRect(b.x0, 380, b.x1 - b.x0, 12); c.fillStyle = 'rgba(255,230,190,0.25)'; c.fillRect(b.x0, 380, b.x1 - b.x0, 1.4);
        floorboards(c, b.x0, 392, b.x1, BOT, '#a97f4f', rr);
        c.fillStyle = 'rgba(140,40,50,0.86)'; c.fillRect(30, 400, 300, BOT - 412); c.strokeStyle = '#d8ae4e'; c.lineWidth = 2; c.strokeRect(38, 408, 284, BOT - 428);
      },
    },
    curio: {
      items: ['key', 'compass', 'quill', 'magnifier', 'hourglass', 'candle', 'inkpot', 'glasses', 'bell', 'teacup', 'ship', 'spyglass', 'shell', 'dice', 'mask'],
      spots: [...row(156, xs5), ...row(252, xs5), ...row(348, xs5), ...row(438, [70, 180, 290])],
      clutter: ['vase', 'birdcage', 'bust', 'stack', 'vase', 'trunk'],
      fill: ['coins', 'flat', 'mini'],
      back(c, b, rr) {
        c.fillStyle = '#34503f'; c.fillRect(b.x0, b.y0, b.x1 - b.x0, 392 - b.y0);
        for (let x = Math.floor(b.x0 / 30) * 30; x < b.x1; x += 30) { c.fillStyle = 'rgba(255,240,200,0.05)'; c.fillRect(x, b.y0, 13, 392 - b.y0); }
        for (let y = 40, k = 0; y < 80; y += 30, k++) for (let x = Math.floor(b.x0 / 30) * 30 + (k % 2 ? 21 : 6); x < b.x1; x += 30) {
          c.fillStyle = 'rgba(214,180,90,0.3)'; c.beginPath(); c.arc(x, y, 1.6, 0, TAU); c.arc(x - 3, y + 3.4, 1.1, 0, TAU); c.arc(x + 3, y + 3.4, 1.1, 0, TAU); c.fill();
        }
        // the shop's name on a brass plate
        c.fillStyle = 'rgba(15,25,15,0.3)'; PZ.rr(c, 98, 45, 164, 28, 5); c.fill();
        c.fillStyle = '#c9a14a'; PZ.rr(c, 96, 42, 164, 28, 5); c.fill();
        c.strokeStyle = 'rgba(110,80,20,0.6)'; c.lineWidth = 1.2; PZ.rr(c, 100, 46, 156, 20, 3); c.stroke();
        PZ.text(c, 'CURIOSITIES', 178, 56.5, { size: 13.5, weight: 900, color: '#4a3510' });
        // a little wall clock on the left and an old map on the right
        fs(c, p2((p) => E(p, 46, 56, 15, 15)), '#c49a35'); fs(c, p2((p) => E(p, 46, 56, 11.5, 11.5)), '#fbf3e2', 0.8);
        c.fillStyle = '#6b6157'; for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; c.beginPath(); c.arc(46 + Math.cos(a) * 9, 56 + Math.sin(a) * 9, i % 3 ? 0.5 : 1, 0, TAU); c.fill(); }
        ln(c, [46, 56, 46, 49], '#3b352e', 1.4); ln(c, [46, 56, 51, 58], '#3b352e', 1.1);
        fs(c, p2((p) => p.rect(288, 40, 52, 32)), '#8a5a3a'); fs(c, p2((p) => p.rect(291.5, 43.5, 45, 25)), '#efe1c4', 0.6);
        c.fillStyle = 'rgba(111,154,106,0.55)'; c.beginPath(); c.moveTo(294, 66); c.quadraticCurveTo(300, 50, 312, 52); c.quadraticCurveTo(322, 60, 330, 48); c.lineTo(334, 66); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(201,71,79,0.8)'; c.lineWidth = 1; c.setLineDash([2, 2]); c.beginPath(); c.moveTo(298, 62); c.quadraticCurveTo(312, 58, 324, 54); c.stroke(); c.setLineDash([]);
        ln(c, [322, 51, 326, 55], '#c9474f', 1.3); ln(c, [326, 51, 322, 55], '#c9474f', 1.3);
        // the cabinet: a cornice, two sides, a pale lining behind the shelves
        wood(c, rr, b.x0, 78, b.x1 - b.x0, 18, '#6b3f28', 'rgba(30,15,5,0.28)');
        c.fillStyle = 'rgba(255,230,190,0.3)'; c.fillRect(b.x0, 78, b.x1 - b.x0, 1.4); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(b.x0, 94, b.x1 - b.x0, 2);
        planks(c, 14, 96, 346, 356, '#ece2c8', 22, rr);
        c.fillStyle = 'rgba(120,90,50,0.12)'; c.fillRect(14, 96, 332, 8);
        wood(c, rr, b.x0, 96, 14 - b.x0, 292, '#6b3f28', 'rgba(30,15,5,0.28)'); wood(c, rr, 346, 96, b.x1 - 346, 292, '#6b3f28', 'rgba(30,15,5,0.28)');
        c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(10, 96, 2, 260); c.fillRect(348, 96, 2, 260);
        for (const y of [156, 252, 348]) shelf(c, rr, 14, 346, y, '#8a5a3a');
        // little drawers in the cabinet's foot, each with a brass knob
        wood(c, rr, b.x0, 356, b.x1 - b.x0, 32, '#6b3f28', 'rgba(30,15,5,0.28)');
        for (let k = 0; k < 6; k++) {
          const x0 = 16 + k * 55;
          c.strokeStyle = 'rgba(20,10,5,0.4)'; c.lineWidth = 1.2; c.strokeRect(x0, 361, 50, 22);
          c.fillStyle = '#c9a14a'; c.beginPath(); c.arc(x0 + 25, 372, 2.6, 0, TAU); c.fill();
        }
        // the floor, and a rug with a cream middle so small things show
        floorboards(c, b.x0, 388, b.x1, BOT, '#b98f5a', rr);
        fs(c, p2((p) => p.roundRect(14, 404, 332, 50, 4)), '#8e3b46', 0);
        fs(c, p2((p) => p.roundRect(22, 410, 316, 40, 3)), '#efe1c4', 0);
        c.strokeStyle = 'rgba(201,161,74,0.7)'; c.lineWidth = 1.4; c.strokeRect(26, 414, 308, 32);
        c.fillStyle = 'rgba(142,59,70,0.35)'; for (let x = 34; x < 330; x += 16) { c.beginPath(); c.moveTo(x, 430); c.lineTo(x + 5, 425); c.lineTo(x + 10, 430); c.lineTo(x + 5, 435); c.closePath(); c.fill(); }
      },
      backRow(c, rr) { for (const y of [156, 252, 348]) backCurios(c, rr, y - 2); },
    },
  };

  // ------------------------------------------------------------ the puzzle
  function seek(S) {
    const r = S.r, where = VARIANTS[S.opts && S.opts.where] ? S.opts.where : 'halt', V = VARIANTS[where];
    const sc0 = { spots: V.spots.map((s) => ({ x: s.x, y: s.y })) };
    // the piles of books come out a different height every time
    if (V.piles) for (const i of V.piles) sc0.spots[i].y = 340 + Math.round(r() * 30);
    // twelve things on twelve of the spots, the rest of the spots get clutter
    const ids = PZ.shuffle(r, V.items.slice()).slice(0, 12);
    const spotOrder = PZ.shuffle(r, sc0.spots.map((_, i) => i));
    const things = ids.map((id, k) => { const s = sc0.spots[spotOrder[k]]; return { id, x: s.x + Math.round((r() - 0.5) * 10), y: s.y - 16, foot: s.y }; });
    const rest = spotOrder.slice(12).map((i) => ({ s: sc0.spots[i], kind: V.clutter[Math.floor(r() * V.clutter.length)] }));
    // little bits tucked between neighbouring spots, here and there
    const bits = [];
    const bySurface = {};
    for (const s of sc0.spots) (bySurface[s.y] = bySurface[s.y] || []).push(s.x);
    for (const [y, xs] of Object.entries(bySurface)) {
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i++) if (xs[i + 1] - xs[i] < 120 && r() < 0.55) bits.push({ x: (xs[i] + xs[i + 1]) / 2 + (r() - 0.5) * 4, y: +y, kind: V.fill[Math.floor(r() * V.fill.length)] });
    }
    // five of the twelve are on the list
    const asked = PZ.shuffle(r, things.slice()).slice(0, ASK).map((t, i) => ({ t, i, found: false, at: 0, cell: CELLS[i] }));
    const seedDecor = Math.floor(r() * 1e9);
    let fx = null, hint = null, hintT = 0, clock = 0;
    const puffs = [];

    function drawThing(c, t, s = 1, x = t.x, y = t.y, sh = true) {
      if (sh) PZ.shadow(c, x, y + 15.5 * s, 14 * s, 3 * s, 0.16);
      c.save(); c.translate(x, y); c.scale(s, s);
      ITEMS[t.id].draw(c);
      c.restore();
    }
    // a name on one line, or two when it does not fit
    function name(c, s, x, y) {
      c.font = PZ.font(13, 800);
      if (c.measureText(s).width <= 62 || !s.includes(' ')) { PZ.text(c, s, x, y, { size: 13, maxW: 64 }); return; }
      const [a, ...b] = s.split(' ');
      PZ.text(c, a, x, y - 7.5, { size: 13, maxW: 64 }); PZ.text(c, b.join(' '), x, y + 7.5, { size: 13, maxW: 64 });
    }
    function find(a, quiet) {
      a.found = true; a.at = quiet ? -9 : clock;
      if (hint === a) hint = null;
    }

    const sc = {
      puzzle: true, indoor: true, steps: ASK,
      crop: { x: 0, y: 86, w: 360, h: 360 },
      decor(c) {
        const b = S.bleed, rr = rng(seedDecor);
        V.back(c, b, rr, sc0);
        if (V.backRow) {
          // painted on a layer of its own and laid on faded, so it sits further back
          const k = 3, lay = U.canvas(360 * k, (BOT - TOP) * k), lx = lay.getContext('2d');
          lx.setTransform(k, 0, 0, k, 0, -TOP * k);
          V.backRow(lx, rr);
          c.save(); c.globalAlpha = 0.62; c.drawImage(lay, 0, TOP, 360, BOT - TOP); c.restore();
        }
        // the counter under the list
        wood(c, rr, b.x0, BOT, b.x1 - b.x0, b.y1 - BOT, '#c9a372');
        c.fillStyle = 'rgba(60,40,20,0.22)'; c.fillRect(b.x0, BOT, b.x1 - b.x0, 4);
        // above the corner: what to do
        c.fillStyle = 'rgba(255,250,241,0.85)'; c.fillRect(b.x0, b.y0, b.x1 - b.x0, TOP - b.y0);
        c.fillStyle = 'rgba(120,90,60,0.25)'; c.fillRect(b.x0, TOP - 1.5, b.x1 - b.x0, 1.5);
        PZ.text(c, 'Find the five things on the list', 180, TOP / 2, { size: 13, color: PZ.INK2, maxW: 340 });
        // the clutter, then the little bits, then the things themselves
        for (const k of bits) FILL[k.kind](c, k.x, k.y, rr);
        for (const k of rest) CLUTTER[k.kind](c, k.s.x, k.s.y, rr);
        for (const t of things) drawThing(c, t);
        // the list, pinned on its paper
        c.fillStyle = 'rgba(60,40,20,0.2)'; PZ.rr(c, 15, LIST_Y + 3, 334, 132, 10); c.fill();
        c.fillStyle = PZ.PAPER; PZ.rr(c, 12, LIST_Y, 336, 132, 10); c.fill();
        c.fillStyle = 'rgba(242,216,138,0.85)'; c.save(); c.translate(180, LIST_Y); c.rotate(-0.04); c.fillRect(-26, -7, 52, 14); c.restore();
        c.strokeStyle = 'rgba(201,71,79,0.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(12, LIST_Y + 22); c.lineTo(348, LIST_Y + 22); c.stroke();
        for (const a of asked) {
          c.fillStyle = 'rgba(232,220,198,0.55)'; PZ.rr(c, a.cell - 30, LIST_Y + 26, 60, 50, 8); c.fill();
          drawThing(c, a.t, 1.2, a.cell, PIC_Y, false);
          name(c, ITEMS[a.t.id].name, a.cell, LIST_Y + 102);
          // an empty box to tick
          c.strokeStyle = 'rgba(107,97,87,0.55)'; c.lineWidth = 1.4; PZ.rr(c, a.cell + 17, LIST_Y + 6, 12, 12, 3); c.stroke();
        }
      },
      draw(c, t, still) {
        // a puff of dust where a tap found nothing
        if (!still) for (const p of puffs) {
          const k = p.t / 0.7, a = 0.45 * (1 - k);
          for (let i = 0; i < 6; i++) {
            const ang = (i / 6) * TAU + p.spin, d = 4 + k * 16;
            c.fillStyle = `rgba(200,185,160,${a.toFixed(3)})`; c.beginPath(); c.arc(p.x + Math.cos(ang) * d, p.y + Math.sin(ang) * d * 0.7 - k * 6, 3 + k * 4, 0, TAU); c.fill();
          }
        }
        for (const a of asked) {
          if (!a.found) continue;
          const k = still ? 1 : Math.min(1, (t - a.at) / 0.4);
          const { x, y } = a.t;
          // a soft pencil ring round it in the picture
          c.save(); c.lineCap = 'round';
          c.strokeStyle = 'rgba(111,154,106,0.9)'; c.lineWidth = 2.6;
          c.beginPath(); c.ellipse(x, y, RING, RING - 2, -0.2, -1.2, -1.2 + TAU * k * 1.04); c.stroke();
          c.strokeStyle = 'rgba(111,154,106,0.4)'; c.lineWidth = 1.4;
          c.beginPath(); c.ellipse(x + 1, y - 1, RING + 2, RING - 1, -0.1, -1, -1 + TAU * k); c.stroke();
          c.restore();
          // and a tick on the list
          const s = still ? 1 : Math.min(1, 0.6 + k * 0.5);
          c.save(); c.translate(a.cell + 23, LIST_Y + 12); c.scale(s, s);
          c.fillStyle = '#6f9a6a'; PZ.rr(c, -8, -8, 16, 16, 4); c.fill();
          c.strokeStyle = '#fffaf1'; c.lineWidth = 2.4; c.lineJoin = 'round'; c.lineCap = 'round';
          c.beginPath(); c.moveTo(-4, 0); c.lineTo(-1, 3.4); c.lineTo(4.4, -3.6); c.stroke();
          c.restore();
          c.fillStyle = 'rgba(111,154,106,0.14)'; PZ.rr(c, a.cell - 30, LIST_Y + 26, 60, 50, 8); c.fill();
        }
        if (hint && hintT > 0 && !still) {
          PZ.glow(c, hint.t.x, hint.t.y, RING, t);
          PZ.glow(c, hint.cell, PIC_Y, 28, t);
        }
      },
      step(dt) {
        clock += dt; hintT -= dt;
        for (let i = puffs.length - 1; i >= 0; i--) { puffs[i].t += dt; if (puffs[i].t > 0.7) puffs.splice(i, 1); }
      },
      down(x, y) {
        if (y < TOP || y > BOT) return; // the list and the words above are only to read
        let best = null, bd = HIT;
        for (const a of asked) { const d = PZ.dist(a.t.x, a.t.y, x, y); if (!a.found && d < bd) { best = a; bd = d; } }
        if (best) { find(best); fx.sound('happy'); fx.good(best.t.x, best.t.y); return; }
        if (puffs.length < 8) puffs.push({ x, y, t: 0, spin: (x * 0.37 + y * 0.11) % TAU });
      },
      move() {},
      up() {},
      cancel() {},
      progress: () => asked.filter((a) => a.found).length / ASK,
      solved: () => asked.every((a) => a.found),
      hint() { hint = asked.find((a) => !a.found) || null; hintT = 3.5; },
      save: () => ({ found: asked.reduce((m, a) => m | (a.found ? 1 << a.i : 0), 0) }),
      load(s) { if (s && Number.isInteger(s.found)) for (const a of asked) if (s.found & (1 << a.i)) find(a, true); },
      solveAll() { for (const a of asked) if (!a.found) find(a, true); },
      debugPlan: () => asked.filter((a) => !a.found).map((a) => ({ tap: [a.t.x, a.t.y] })),
    };
    Object.defineProperty(sc, 'fx', { get: () => fx, set: (v) => { fx = v; } });
    return sc;
  }

  Object.assign(SCENES.KINDS, { seek });
})();
