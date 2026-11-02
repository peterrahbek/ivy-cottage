'use strict';
// Who sleeps where? Bedtime in the kennel barn at Bluebell Rescue: four beds,
// each with something of its own (the window with the moon, the basket, the
// stove...), four animals waiting on the rug and a few clue cards pinned up
// on the wall. Drag everyone to a bed; a card gets a tick once it holds for
// the animals it talks about. Nothing is ever wrong, it just is not ticked
// yet. When every card holds, they curl up one by one and fall asleep.

(() => {
  const DARK = '#3b302b';
  const dot = (c, x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill(); };
  const oval = (c, x, y, rx, ry, rot, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, 7); c.fill(); };
  function heart(c, x, y, s, col) {
    c.fillStyle = col; c.beginPath(); c.moveTo(x, y + s * 0.9);
    c.bezierCurveTo(x - s * 1.6, y - s * 0.1, x - s * 0.7, y - s * 1.3, x, y - s * 0.4);
    c.bezierCurveTo(x + s * 0.7, y - s * 1.3, x + s * 1.6, y - s * 0.1, x, y + s * 0.9);
    c.fill();
  }
  function star(c, x, y, s, col) {
    c.fillStyle = col; c.beginPath();
    c.moveTo(x, y - s * 2); c.lineTo(x + s * 0.45, y - s * 0.45); c.lineTo(x + s * 2, y); c.lineTo(x + s * 0.45, y + s * 0.45);
    c.lineTo(x, y + s * 2); c.lineTo(x - s * 0.45, y + s * 0.45); c.lineTo(x - s * 2, y); c.lineTo(x - s * 0.45, y - s * 0.45); c.closePath(); c.fill();
  }

  // ---------------------------------------------------------------- ANIMALS
  // Each is drawn around its middle, feet near y +26. lie goes from 0
  // (sitting up, waiting) to 1 (lying down in a bed); closed eyes are sleepy.
  function eyes(c, x, y, gap, closed, col = DARK) {
    if (closed) {
      c.strokeStyle = col; c.lineWidth = 1.6; c.lineCap = 'round';
      c.beginPath(); c.arc(x - gap, y - 1.5, 2.6, 0.3, Math.PI - 0.3); c.stroke();
      c.beginPath(); c.arc(x + gap, y - 1.5, 2.6, 0.3, Math.PI - 0.3); c.stroke();
      return;
    }
    dot(c, x - gap, y, 2.5, col); dot(c, x + gap, y, 2.5, col);
    dot(c, x - gap + 0.8, y - 0.8, 0.9, '#ffffff'); dot(c, x + gap + 0.8, y - 0.8, 0.9, '#ffffff');
  }
  const blush = (c, x, y, gap) => { dot(c, x - gap, y, 3, 'rgba(239,138,166,0.32)'); dot(c, x + gap, y, 3, 'rgba(239,138,166,0.32)'); };

  function drawDog(c, L, closed, k) {
    c.strokeStyle = k.fur; c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(18 + 6 * L, 14 + 6 * L); c.quadraticCurveTo(32, 12 + 10 * L, 28 + 4 * L, -6 + 32 * L); c.stroke();
    const bx = 2 * L, by = 8 + 8 * L;
    oval(c, bx, by, 22 + 9 * L, 20 - 6 * L, 0, k.fur);
    oval(c, bx - 4 * L, by - 2 + 2 * L, 10 + 4 * L, 12 - 5 * L, 0, k.light);
    oval(c, -8 - 8 * L, 26, 6, 4, 0, k.light); oval(c, 8 - 16 * L, 27 - L, 6, 4, 0, k.light);
    const hx = -10 * L, hy = -16 + 16 * L;
    dot(c, hx, hy, 16, k.fur);
    if (k.patch) oval(c, hx + 6, hy - 4, 6, 5.5, 0.3, k.patch);
    oval(c, hx - 14, hy + 1, 6.5, 12, 0.28, k.ear); oval(c, hx + 14, hy + 1, 6.5, 12, -0.28, k.ear);
    oval(c, hx, hy + 6, 8.5, 6.5, 0, k.light);
    oval(c, hx, hy + 3, 3.4, 2.5, 0, DARK);
    if (k.collar) {
      c.strokeStyle = k.collar; c.lineWidth = 3.5; c.beginPath(); c.arc(hx, hy, 15, 0.3 * Math.PI, 0.7 * Math.PI); c.stroke();
      dot(c, hx, hy + 17, 2.6, '#f2d88a');
    }
    eyes(c, hx, hy - 4, 6, closed); blush(c, hx, hy + 3, 10);
  }

  function drawCat(c, L, closed) {
    const fur = '#e7a978', stripe = '#c9814f', light = '#fbe8d3';
    c.strokeStyle = fur; c.lineWidth = 6.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(16 + 10 * L, 18 + 2 * L); c.quadraticCurveTo(36 + 6 * L, 14 + 16 * L, 30 - 6 * L, -8 + 38 * L); c.stroke();
    const bx = 4 * L, by = 10 + 7 * L;
    oval(c, bx, by, 18 + 12 * L, 18 - 5 * L, 0, fur);
    c.strokeStyle = stripe; c.lineWidth = 2.4;
    for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(bx + 4 + i * 6 + 6 * L, by - 2, 7, -2.2, -1.2); c.stroke(); }
    oval(c, bx - 4 * L - 1, by - 1 + 2 * L, 8 + 2 * L, 10 - 4 * L, 0, light);
    oval(c, -7 - 8 * L, 27, 5.5, 3.6, 0, light); oval(c, 7 - 16 * L, 27.5 - L, 5.5, 3.6, 0, light);
    const hx = -10 * L, hy = -14 + 15 * L;
    for (const sd of [-1, 1]) {
      c.fillStyle = fur; c.beginPath(); c.moveTo(hx + sd * 14, hy - 3); c.lineTo(hx + sd * 12, hy - 21); c.lineTo(hx + sd * 2, hy - 12); c.closePath(); c.fill();
      c.fillStyle = '#f2b5b5'; c.beginPath(); c.moveTo(hx + sd * 11.5, hy - 6); c.lineTo(hx + sd * 11, hy - 16); c.lineTo(hx + sd * 5, hy - 11); c.closePath(); c.fill();
    }
    dot(c, hx, hy, 15, fur);
    c.strokeStyle = stripe; c.lineWidth = 2; c.lineCap = 'round';
    for (const dx of [-4, 0, 4]) { c.beginPath(); c.moveTo(hx + dx, hy - 14); c.lineTo(hx + dx * 0.8, hy - 9); c.stroke(); }
    oval(c, hx - 3, hy + 5, 4, 3.4, 0, light); oval(c, hx + 3, hy + 5, 4, 3.4, 0, light);
    c.fillStyle = '#e98a9a'; c.beginPath(); c.moveTo(hx - 2.4, hy + 1.5); c.lineTo(hx + 2.4, hy + 1.5); c.lineTo(hx, hy + 4); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(107,97,87,0.55)'; c.lineWidth = 0.8;
    for (const sd of [-1, 1]) for (const dy of [-1.5, 1.5]) { c.beginPath(); c.moveTo(hx + sd * 7, hy + 5); c.lineTo(hx + sd * 18, hy + 5 + dy * 2); c.stroke(); }
    eyes(c, hx, hy - 2, 6, closed, closed ? DARK : '#5d7a45');
  }

  function drawRabbit(c, L, closed) {
    const fur = '#d5cabc', light = '#f5eee3';
    const bx = 3 * L, by = 10 + 7 * L;
    dot(c, bx + 18 + 8 * L, by + 6 - 2 * L, 6, '#fffaf1');
    oval(c, bx, by, 19 + 9 * L, 18 - 4 * L, 0, fur);
    oval(c, bx - 2 * L, by + 2, 9, 10 - 3 * L, 0, light);
    oval(c, -8 - 6 * L, 27, 7, 3.8, 0, light); oval(c, 8 - 14 * L, 27.5 - L, 7, 3.8, 0, light);
    const hx = -8 * L, hy = -10 + 13 * L;
    for (const sd of [-1, 1]) {
      c.save(); c.translate(hx + sd * 5, hy - 9); c.rotate(sd * 0.2 + L * (sd < 0 ? 1.0 : 1.35));
      oval(c, 0, -12, 5, 13, 0, fur); oval(c, 0, -11, 2.4, 9, 0, '#f2b5b5');
      c.restore();
    }
    dot(c, hx, hy, 13.5, fur);
    eyes(c, hx, hy - 2, 5, closed); blush(c, hx, hy + 4, 8);
    oval(c, hx, hy + 4, 2.4, 1.7, 0, '#e98a9a');
  }

  function drawHedgehog(c, L, closed) {
    const spike = '#8a6a50', deep = '#6d523d', face = '#f1dcc0';
    const cx = 2 * L, cy = 8 + 7 * L, rx = 26 + 6 * L, ry = 21 - 5 * L;
    c.fillStyle = deep; c.beginPath();
    for (let i = 0; i <= 22; i++) {
      const a = Math.PI * (0.92 + (1.16 * i) / 22), m = i % 2 ? 1.24 : 1;
      c.lineTo(cx + Math.cos(a) * rx * m, cy + Math.sin(a) * ry * m);
    }
    c.ellipse(cx, cy, rx, ry, 0, 0.08 * Math.PI, 0.92 * Math.PI); c.closePath(); c.fill();
    oval(c, cx, cy, rx * 0.92, ry * 0.9, 0, spike);
    c.strokeStyle = deep; c.lineWidth = 1.4; c.lineCap = 'round';
    for (let i = 0; i < 7; i++) { const a = Math.PI * (1.12 + i * 0.12); const x = cx + Math.cos(a) * rx * 0.62, y = cy + Math.sin(a) * ry * 0.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 6, y + Math.sin(a) * 6); c.stroke(); }
    oval(c, -8, 26, 5, 3.4, 0, deep); oval(c, 8, 26, 5, 3.4, 0, deep);
    const hx = -6 * L, hy = 8 + 7 * L;
    dot(c, hx - 11, hy - 8, 4.2, face); dot(c, hx + 11, hy - 8, 4.2, face);
    dot(c, hx - 11, hy - 8, 2, '#d9a891'); dot(c, hx + 11, hy - 8, 2, '#d9a891');
    oval(c, hx, hy + 1, 14, 12, 0, face);
    oval(c, hx, hy + 6, 7, 5, 0, '#fbeedd');
    oval(c, hx, hy + 6, 3.2, 2.6, 0, DARK);
    eyes(c, hx, hy - 3, 5.5, closed); blush(c, hx, hy + 3, 9);
  }

  const ANIMALS = {
    dog: { s: 1.15, draw: (c, L, z) => drawDog(c, L, z, { fur: '#c98f52', light: '#f1d9b0', ear: '#8f5f36' }) },
    puppy: { s: 0.82, draw: (c, L, z) => drawDog(c, L, z, { fur: '#f3e7d3', light: '#fffaf1', ear: '#a8754a', patch: '#c08a5a', collar: '#d98b63' }) },
    cat: { s: 1, draw: drawCat },
    rabbit: { s: 1, draw: drawRabbit },
    hedgehog: { s: 0.95, draw: drawHedgehog },
  };
  // sitting up and lying down are painted once into little pictures, so a
  // frame only stamps them; the in-between, while one settles, is drawn live
  const SPR = {}, SPX = 4, BOX = { x: -58, y: -54, w: 124, h: 96 };
  function sprite(kind, L, closed) {
    const key = kind + L + closed;
    if (!SPR[key]) {
      const k = ANIMALS[kind].s * SPX, cv = U.canvas(Math.ceil(BOX.w * k), Math.ceil(BOX.h * k)), x = cv.getContext('2d');
      x.setTransform(k, 0, 0, k, -BOX.x * k, -BOX.y * k);
      ANIMALS[kind].draw(x, L, closed);
      SPR[key] = cv;
    }
    return SPR[key];
  }
  function animal(c, kind, x, y, s, L, closed) {
    const A = ANIMALS[kind], k = A.s * s;
    if (L < 0.01 || L > 0.99) { c.drawImage(sprite(kind, L > 0.5 ? 1 : 0, closed), x + BOX.x * k, y + BOX.y * k, BOX.w * k, BOX.h * k); return; }
    c.save(); c.translate(x, y); c.scale(k, k); A.draw(c, L, closed); c.restore();
  }
  // on a clue card they are nearer one size, so each is easy to make out
  const mini = (c, kind, x, y) => animal(c, kind, x, y, 0.54 / Math.pow(ANIMALS[kind].s, 0.25), 0, false);

  // ---------------------------------------------------------------- BEDS
  // What makes each bed its own: something on the wall above it, or the bed
  // itself. say is the clue card's words before the little picture.
  const FLOOR = 312, BY = 350;
  const CUSHIONS = ['#efb4ae', '#f2d88a', '#bfd5ae', '#cfc2ea'];
  function cushion(c, x, y, col) {
    PZ.shadow(c, x, y + 14, 44, 9, 0.2);
    oval(c, x, y, 41, 19, 0, U.shade(col, -0.12));
    oval(c, x, y - 2, 37, 15.5, 0, col);
    oval(c, x, y - 1, 28, 10, 0, U.shade(col, 0.25));
  }
  const FEATURES = {
    window: {
      say: 'by the',
      wall(c, x) {
        c.fillStyle = 'rgba(60,40,20,0.2)'; c.beginPath(); c.roundRect(x - 31, 180, 66, 98, [33, 33, 6, 6]); c.fill();
        c.fillStyle = '#b98f5a'; c.beginPath(); c.roundRect(x - 33, 176, 66, 98, [33, 33, 6, 6]); c.fill();
        const g = c.createLinearGradient(0, 184, 0, 266);
        g.addColorStop(0, '#7f8fd0'); g.addColorStop(0.6, '#a9a3dc'); g.addColorStop(1, '#e3bfd0');
        c.fillStyle = g; c.beginPath(); c.roundRect(x - 26, 183, 52, 84, [26, 26, 3, 3]); c.fill();
        dot(c, x + 8, 205, 10, '#f6e3a0'); dot(c, x + 13, 201, 9, '#8e97d4');
        star(c, x - 12, 200, 1.4, '#fff4cf'); star(c, x - 4, 228, 1, '#fff4cf'); star(c, x + 14, 240, 1.2, '#fff4cf');
        c.fillStyle = '#b98f5a'; c.fillRect(x - 2, 183, 4, 84); c.fillRect(x - 26, 224, 52, 4);
        c.fillStyle = '#a07a4a'; c.beginPath(); c.roundRect(x - 37, 268, 74, 8, 3); c.fill();
        c.fillStyle = '#efb4ae';
        for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(x + sd * 36, 178); c.quadraticCurveTo(x + sd * 22, 220, x + sd * 34, 266); c.lineTo(x + sd * 40, 266); c.lineTo(x + sd * 40, 178); c.closePath(); c.fill(); }
      },
      icon(c, x, y) {
        c.fillStyle = '#b98f5a'; c.beginPath(); c.roundRect(x - 11, y - 14, 22, 28, [11, 11, 2, 2]); c.fill();
        c.fillStyle = '#8f97d6'; c.beginPath(); c.roundRect(x - 8, y - 11, 16, 22, [8, 8, 1, 1]); c.fill();
        dot(c, x + 2, y - 4, 4, '#f6e3a0'); dot(c, x + 4.5, y - 5.5, 3.6, '#8f97d6');
      },
    },
    shelf: {
      say: 'under the',
      wall(c, x) {
        c.fillStyle = '#9c7448';
        for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(x + sd * 24, 242); c.lineTo(x + sd * 24, 258); c.lineTo(x + sd * 14, 242); c.closePath(); c.fill(); }
        c.fillStyle = 'rgba(60,40,20,0.2)'; c.fillRect(x - 36, 244, 72, 5);
        c.fillStyle = '#b98f5a'; c.beginPath(); c.roundRect(x - 37, 236, 74, 8, 2); c.fill();
        c.fillStyle = '#a6d3d4'; c.beginPath(); c.roundRect(x - 31, 212, 16, 24, 4); c.fill(); c.fillStyle = '#d98b63'; c.fillRect(x - 32, 208, 18, 6);
        c.fillStyle = '#f2d88a'; c.beginPath(); c.roundRect(x - 11, 218, 14, 18, 4); c.fill(); c.fillStyle = '#efb4ae'; c.fillRect(x - 12, 214, 16, 5);
        c.fillStyle = '#6f9a6a'; c.fillRect(x + 8, 214, 8, 22); c.fillStyle = '#bba9df'; c.fillRect(x + 17, 218, 7, 18);
        c.fillStyle = '#efb4ae'; c.save(); c.translate(x + 28, 236); c.rotate(-0.25); c.fillRect(-4, -20, 7, 20); c.restore();
      },
      icon(c, x, y) {
        c.fillStyle = '#b98f5a'; c.fillRect(x - 13, y + 5, 26, 5);
        c.fillStyle = '#a6d3d4'; c.beginPath(); c.roundRect(x - 10, y - 9, 8, 14, 2); c.fill();
        c.fillStyle = '#f2d88a'; c.beginPath(); c.roundRect(x, y - 5, 8, 10, 2); c.fill();
        c.fillStyle = '#6f9a6a'; c.fillRect(x + 9, y - 8, 4, 13);
      },
    },
    stove: {
      say: 'by the',
      wall(c, x) {
        const g = c.createRadialGradient(x, 266, 6, x, 266, 70);
        g.addColorStop(0, 'rgba(255,196,120,0.55)'); g.addColorStop(1, 'rgba(255,196,120,0)');
        c.fillStyle = g; c.fillRect(x - 70, 196, 140, 140);
        c.fillStyle = '#6b6157'; c.fillRect(x - 5, 150, 10, 90);
        c.fillStyle = '#5a5049'; c.fillRect(x - 7, 226, 14, 8);
        c.fillStyle = '#5a5049'; c.fillRect(x - 17, 296, 5, 16); c.fillRect(x + 12, 296, 5, 16);
        oval(c, x, 268, 23, 30, 0, '#6b6157');
        oval(c, x - 6, 258, 7, 14, 0.2, 'rgba(255,255,255,0.12)');
        c.fillStyle = '#5a5049'; c.beginPath(); c.roundRect(x - 26, 236, 52, 7, 3); c.fill();
        c.fillStyle = '#f2b05a'; c.beginPath(); c.roundRect(x - 11, 264, 22, 18, [9, 9, 3, 3]); c.fill();
        c.fillStyle = '#f7d27a'; c.beginPath(); c.moveTo(x - 6, 282); c.quadraticCurveTo(x - 4, 270, x, 268); c.quadraticCurveTo(x + 5, 274, x + 6, 282); c.closePath(); c.fill();
      },
      icon(c, x, y) {
        c.fillStyle = '#6b6157'; c.fillRect(x - 2.5, y - 15, 5, 8);
        oval(c, x, y + 2, 10, 12, 0, '#6b6157');
        c.fillStyle = '#f2b05a'; c.beginPath(); c.roundRect(x - 5, y + 1, 10, 8, [4, 4, 1, 1]); c.fill();
      },
    },
    plant: {
      say: 'under the',
      wall(c, x) {
        c.strokeStyle = '#a07a4a'; c.lineWidth = 1.4;
        c.beginPath(); c.moveTo(x, 170); c.lineTo(x - 16, 206); c.moveTo(x, 170); c.lineTo(x + 16, 206); c.stroke();
        c.strokeStyle = '#6f9a6a'; c.lineWidth = 2.2; c.lineCap = 'round';
        for (const [sx, ex, ey] of [[-12, -24, 266], [-4, -10, 286], [6, 8, 272], [12, 24, 258]]) {
          c.beginPath(); c.moveTo(x + sx, 214); c.quadraticCurveTo(x + sx * 1.6, 240, x + ex, ey); c.stroke();
          for (let k = 0.3; k < 1; k += 0.22) {
            const lx = x + sx + (ex - sx) * k, ly = 214 + (ey - 214) * k;
            oval(c, lx + (k * 10 % 2 > 1 ? 4 : -4), ly, 4.5, 2.6, k * 3, k > 0.6 ? '#8fb486' : '#6f9a6a');
          }
        }
        c.fillStyle = '#d98b63'; c.beginPath(); c.moveTo(x - 18, 204); c.lineTo(x + 18, 204); c.lineTo(x + 13, 222); c.lineTo(x - 13, 222); c.closePath(); c.fill();
        c.fillStyle = '#c4774f'; c.fillRect(x - 19, 202, 38, 5);
        for (const [lx, ly, a] of [[-10, 199, -0.6], [0, 196, 0], [10, 199, 0.6]]) oval(c, x + lx, ly, 5, 9, a, '#6f9a6a');
      },
      icon(c, x, y) {
        c.strokeStyle = '#a07a4a'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y - 15); c.lineTo(x - 7, y - 4); c.moveTo(x, y - 15); c.lineTo(x + 7, y - 4); c.stroke();
        for (const [lx, a] of [[-5, -0.6], [0, 0], [5, 0.6]]) oval(c, x + lx, y - 6, 3, 5, a, '#6f9a6a');
        c.fillStyle = '#d98b63'; c.beginPath(); c.moveTo(x - 8, y - 4); c.lineTo(x + 8, y - 4); c.lineTo(x + 6, y + 5); c.lineTo(x - 6, y + 5); c.closePath(); c.fill();
        c.strokeStyle = '#6f9a6a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x - 6, y + 3); c.quadraticCurveTo(x - 10, y + 10, x - 8, y + 15); c.moveTo(x + 5, y + 3); c.quadraticCurveTo(x + 9, y + 9, x + 7, y + 13); c.stroke();
      },
    },
    basket: {
      say: 'in the',
      bed(c, x, y) {
        PZ.shadow(c, x, y + 16, 47, 9, 0.22);
        oval(c, x, y, 44, 22, 0, '#b98f5a');
        oval(c, x, y - 3, 36, 14, 0, '#8f6a3e');
        oval(c, x, y - 1, 31, 10, 0, '#f6efe3');
        oval(c, x, y - 2, 22, 6, 0, '#fffaf1');
      },
      // the front of the basket goes over whoever sleeps in it
      front(c, x, y) {
        c.fillStyle = '#b98f5a'; c.beginPath();
        c.ellipse(x, y, 44, 22, 0, 0, Math.PI); c.ellipse(x, y - 3, 36, 14, 0, Math.PI, 0, true); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(110,75,40,0.45)'; c.lineWidth = 1.3;
        for (let i = -4; i <= 4; i++) { const px = x + i * 8.5, k = Math.sqrt(Math.max(0, 1 - (i * 8.5 / 40) ** 2)); c.beginPath(); c.moveTo(px, y - 3 + 13 * k); c.lineTo(px, y + 20 * k); c.stroke(); }
        c.strokeStyle = 'rgba(255,240,210,0.35)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(x, y + 1, 41, 18, 0, 0.15, Math.PI - 0.15); c.stroke();
      },
      icon(c, x, y) {
        oval(c, x, y + 2, 14, 8, 0, '#b98f5a'); oval(c, x, y, 10.5, 4.6, 0, '#8f6a3e');
        c.fillStyle = '#b98f5a'; c.beginPath(); c.ellipse(x, y + 2, 14, 8, 0, 0, Math.PI); c.ellipse(x, y, 10.5, 4.6, 0, Math.PI, 0, true); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(110,75,40,0.5)'; c.lineWidth = 1; for (const dx of [-7, 0, 7]) { c.beginPath(); c.moveTo(x + dx, y + 4); c.lineTo(x + dx, y + 9); c.stroke(); }
      },
    },
    blanket: {
      say: 'on the',
      bed(c, x, y) {
        cushion(c, x, y, '#f3e9d8');
        c.save(); c.beginPath(); c.ellipse(x, y - 2, 37, 15.5, 0, 0, 7); c.clip();
        c.fillStyle = '#8fbfe6'; c.beginPath(); c.moveTo(x - 40, y - 6); c.quadraticCurveTo(x - 4, y - 14, x + 40, y - 12); c.lineTo(x + 40, y + 20); c.lineTo(x - 40, y + 20); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(255,250,241,0.6)'; c.lineWidth = 2;
        for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(x + i * 11, y - 16); c.lineTo(x + i * 11 + 4, y + 20); c.stroke(); }
        for (const dy of [0, 8]) { c.beginPath(); c.moveTo(x - 40, y + dy - 3); c.lineTo(x + 40, y + dy - 5); c.stroke(); }
        c.restore();
        c.strokeStyle = '#6fa3cf'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(x, y - 2, 37, 15.5, 0, 0.1, Math.PI - 0.1); c.stroke();
      },
      icon(c, x, y) {
        c.save(); c.translate(x, y); c.rotate(-0.12);
        c.fillStyle = '#8fbfe6'; c.beginPath(); c.roundRect(-12, -10, 24, 20, 3); c.fill();
        c.strokeStyle = 'rgba(255,250,241,0.85)'; c.lineWidth = 1.6;
        for (const d of [-5, 3]) { c.beginPath(); c.moveTo(d, -10); c.lineTo(d, 10); c.moveTo(-12, d); c.lineTo(12, d); c.stroke(); }
        c.restore();
      },
    },
  };
  const FEATURE_IDS = Object.keys(FEATURES);

  // ---------------------------------------------------------------- CLUES
  // A clue is { t, a, b } (two animals) or { t, a, j } (an animal and a bed).
  // p[animal] is a bed from 0 (left) to 3, or -1 while still waiting.
  const PAIR = { next: 'next to', notNext: 'not next to', left: 'just left of' };
  function holds(cl, p) {
    const pa = p[cl.a], pb = cl.b === undefined ? 0 : p[cl.b];
    if (cl.t === 'bed') return pa === cl.j;
    if (cl.t === 'notBed') return pa !== cl.j;
    if (cl.t === 'next') return Math.abs(pa - pb) === 1;
    if (cl.t === 'notNext') return Math.abs(pa - pb) !== 1;
    return pb - pa === 1; // left: in the bed right next to it, on the left
  }
  // only judged once everyone it talks about is in a bed
  const judged = (cl, p) => p[cl.a] >= 0 && (cl.b === undefined || p[cl.b] >= 0);
  const ticked = (cl, p) => judged(cl, p) && holds(cl, p);
  function perms(n) {
    const out = [];
    const go = (a, used) => { if (a.length === n) { out.push(a.slice()); return; } for (let i = 0; i < n; i++) if (!used[i]) { used[i] = true; a.push(i); go(a, used); a.pop(); used[i] = false; } };
    go([], []);
    return out;
  }
  const ALL = perms(4);

  // A random answer, then clues true for it until only the answer fits.
  // Each clue is a random one from the stronger half of those that still
  // rule something out, so the notes differ from game to game; then any
  // note the others make unneeded comes down again, so every note matters.
  // Three or four notes (two rows of cards), at least one about two animals.
  function makePuzzle(r) {
    for (let tries = 0; ; tries++) {
      const kinds = PZ.shuffle(r, Object.keys(ANIMALS)).slice(0, 4);
      const feats = PZ.shuffle(r, FEATURE_IDS.slice()).slice(0, 4);
      const sol = PZ.shuffle(r, [0, 1, 2, 3]);
      const cands = [];
      for (let a = 0; a < 4; a++) {
        for (let j = 0; j < 4; j++) cands.push({ t: sol[a] === j ? 'bed' : 'notBed', a, j });
        for (let b = 0; b < 4; b++) {
          if (b === a) continue;
          if (sol[b] - sol[a] === 1) cands.push({ t: 'left', a, b });
          if (a < b) cands.push({ t: Math.abs(sol[a] - sol[b]) === 1 ? 'next' : 'notNext', a, b });
        }
      }
      PZ.shuffle(r, cands);
      const maxBed = tries > 20 || r() < 0.5 ? 2 : 1;
      let left = ALL, beds = 0;
      const clues = [];
      while (left.length > 1 && clues.length < 6) {
        const opts = [];
        for (const cl of cands) {
          if (clues.includes(cl) || (cl.t === 'bed' && beds >= maxBed)) continue;
          const out = left.filter((p) => !holds(cl, p)).length;
          if (out > 0) opts.push({ cl, out });
        }
        if (!opts.length) break;
        opts.sort((x, y) => y.out - x.out);
        const pick = opts[(r() * Math.ceil(opts.length / 2)) | 0].cl;
        clues.push(pick); if (pick.t === 'bed') beds++;
        left = left.filter((p) => holds(pick, p));
      }
      if (left.length !== 1) continue;
      for (let i = clues.length - 1; i >= 0; i--) {
        const rest = clues.filter((_, k) => k !== i);
        if (ALL.filter((p) => rest.every((cl) => holds(cl, p))).length === 1) clues.splice(i, 1);
      }
      if (clues.length >= 3 && clues.length <= 4 && clues.some((cl) => cl.b !== undefined)) return { kinds, feats, sol, clues: PZ.shuffle(r, clues) };
    }
  }

  // ---------------------------------------------------------------- SCENE
  const BX = [50, 136.7, 223.3, 310], HOME_Y = 462, BED_Y = BY - 18;
  const HOME_X = [50, 136.7, 223.3, 310];
  const HIT = 38;

  function beds(S) {
    const r = S.r;
    const P = makePuzzle(r);
    const n = 4, sol = P.sol, clues = P.clues;
    const cushions = PZ.shuffle(r, CUSHIONS.slice());
    const where = [-1, -1, -1, -1];
    const pets = P.kinds.map((kind, i) => ({ i, kind, x: HOME_X[i], y: HOME_Y, tx: HOME_X[i], ty: HOME_Y, lie: 0, sleep: -1 }));
    // the clue cards: two to a row, an odd last one in the middle
    const CW = 162, CH = 44, rows = Math.ceil(clues.length / 2), top = Math.max(12, 88 - (rows * 50 - 6) / 2);
    const cards = clues.map((cl, k) => {
      const row = (k / 2) | 0, alone = k === clues.length - 1 && clues.length % 2 === 1;
      const x = alone ? 180 - CW / 2 : k % 2 ? 186 : 12;
      return { cl, x, y: top + row * 50, tick: 0 };
    });
    let held = null, from = -1, gdx = 0, gdy = 0, hint = -1, hintT = 0, fx = null, solved = false, payQ = [], payT = 0;

    const occupant = (j) => where.indexOf(j);
    const placed = () => where.every((w) => w >= 0);
    function home(p, snap) {
      const w = where[p.i];
      p.tx = w >= 0 ? BX[w] : HOME_X[p.i]; p.ty = w >= 0 ? BED_Y : HOME_Y;
      if (snap) { p.x = p.tx; p.y = p.ty; p.lie = w >= 0 ? 1 : 0; }
    }
    function check(quiet) {
      if (solved || !placed() || !clues.every((cl) => holds(cl, where))) return;
      solved = true; hint = -1;
      // they settle down one at a time, left to right
      payQ = pets.slice().sort((a, b) => where[a.i] - where[b.i]);
      if (quiet) { for (const p of payQ) p.sleep = 9; payQ = []; return; }
      payT = 0; pay();
    }
    function pay() {
      const p = payQ.shift(); if (!p) return;
      p.sleep = 0; fx.good(BX[where[p.i]], BED_Y - 6);
      if (!payQ.length) fx.sound('happy');
    }

    function drawPet(c, p, t, still, lifted) {
      const sleepy = where[p.i] >= 0 && p !== held;
      const k = lifted ? 1.08 : 1;
      if (lifted) PZ.shadow(c, p.x + 4, p.y + 34, 26, 6, 0.14);
      else if (where[p.i] < 0 || p.lie < 0.9) PZ.shadow(c, p.x, p.y + 28, 26, 6, 0.16);
      animal(c, p.kind, p.x, p.y, k, p.lie, sleepy);
    }
    // a little drawn "z" (paths are lighter than text every frame)
    function zee(c, x, y, s, a) {
      c.strokeStyle = `rgba(107,97,87,${a.toFixed(2)})`; c.lineWidth = 2.2; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(x - s, y - s); c.lineTo(x + s, y - s); c.lineTo(x - s, y + s); c.lineTo(x + s, y + s); c.stroke();
    }
    function zzz(c, p, t, still) {
      const x = p.x + 22, y = p.y - 26;
      if (still) { zee(c, x, y, 3.5, 0.75); zee(c, x + 10, y - 13, 5, 0.75); return; }
      for (let k = 0; k < 2; k++) {
        const ph = (t * 0.45 + k * 0.5 + p.i * 0.23) % 1;
        zee(c, x + ph * 12, y - ph * 26, 3.5 + ph * 2.5, Math.sin(ph * Math.PI) * 0.8);
      }
      if (p.sleep < 1.4) { const k = p.sleep / 1.4; heart(c, p.x - 6, p.y - 30 - k * 22, 7 + k * 2, `rgba(233,128,140,${(1 - k).toFixed(2)})`); }
    }
    function tick(c, x, y, k) {
      const rad = 10 * (k >= 1 ? 1 : U.easeBack(k));
      dot(c, x, y, rad, '#6f9a6a');
      c.strokeStyle = '#fffaf1'; c.lineWidth = 2.4; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(x - rad * 0.42, y + rad * 0.02); c.lineTo(x - rad * 0.1, y + rad * 0.34); c.lineTo(x + rad * 0.45, y - rad * 0.3); c.stroke();
    }

    const sc = {
      puzzle: true, indoor: true, steps: n,
      crop: { x: 0, y: 150, w: 360, h: 360 },
      decor(c) {
        const b = S.bleed, dr = U.rng(41);
        // the barn wall: painted boards, a little dusky at the top
        c.fillStyle = '#a9bf98'; c.fillRect(b.x0, b.y0, b.x1 - b.x0, FLOOR - b.y0);
        for (let x = Math.floor(b.x0 / 30) * 30; x < b.x1; x += 30) {
          c.fillStyle = `rgba(${dr() < 0.5 ? '255,250,230' : '60,80,50'},${(0.04 + dr() * 0.06).toFixed(3)})`; c.fillRect(x, b.y0, 30, FLOOR - b.y0);
          c.fillStyle = 'rgba(50,70,45,0.22)'; c.fillRect(x, b.y0, 1.5, FLOOR - b.y0);
        }
        const dusk = c.createLinearGradient(0, b.y0, 0, FLOOR);
        dusk.addColorStop(0, 'rgba(120,110,170,0.22)'); dusk.addColorStop(1, 'rgba(120,110,170,0)');
        c.fillStyle = dusk; c.fillRect(b.x0, b.y0, b.x1 - b.x0, FLOOR - b.y0);
        // the floor: warm boards
        c.fillStyle = '#d2ac78'; c.fillRect(b.x0, FLOOR, b.x1 - b.x0, b.y1 - FLOOR);
        for (let y = FLOOR, row = 0; y < b.y1; y += 22, row++) {
          c.fillStyle = 'rgba(90,60,30,0.22)'; c.fillRect(b.x0, y, b.x1 - b.x0, 1.5);
          for (let x = b.x0 + ((row * 71) % 120); x < b.x1; x += 120 + (row % 3) * 20) c.fillRect(x, y, 1.5, 22);
          c.fillStyle = `rgba(255,240,210,${(0.05 + dr() * 0.08).toFixed(3)})`; c.fillRect(b.x0, y + 1.5, b.x1 - b.x0, 20);
        }
        c.fillStyle = '#9c7448'; c.fillRect(b.x0, FLOOR - 6, b.x1 - b.x0, 8);
        c.fillStyle = 'rgba(60,40,20,0.18)'; c.fillRect(b.x0, FLOOR + 2, b.x1 - b.x0, 4);
        // the beam, with a string of little lights
        c.fillStyle = '#9c7448'; c.fillRect(b.x0, 158, b.x1 - b.x0, 12);
        c.fillStyle = 'rgba(60,40,20,0.22)'; c.fillRect(b.x0, 170, b.x1 - b.x0, 4);
        c.strokeStyle = 'rgba(80,60,40,0.55)'; c.lineWidth = 1; c.beginPath();
        for (let x = b.x0; x <= b.x1; x += 4) c.lineTo(x, 172 + 5 * Math.abs(Math.sin((x / 45) * Math.PI)));
        c.stroke();
        for (let x = 22.5; x < 360; x += 45) {
          const g = c.createRadialGradient(x, 178, 1, x, 178, 16);
          g.addColorStop(0, 'rgba(255,220,140,0.6)'); g.addColorStop(1, 'rgba(255,220,140,0)');
          c.fillStyle = g; c.fillRect(x - 16, 162, 32, 32);
          oval(c, x, 179, 2.6, 3.6, 0, '#f6dc8f');
        }
        // what makes each bed its own, then the beds
        P.feats.forEach((f, j) => { if (FEATURES[f].wall) FEATURES[f].wall(c, BX[j]); });
        P.feats.forEach((f, j) => { if (FEATURES[f].bed) FEATURES[f].bed(c, BX[j], BY); else cushion(c, BX[j], BY, cushions[j]); });
        // the rug where they wait
        c.fillStyle = 'rgba(60,40,20,0.16)'; c.beginPath(); c.roundRect(14, 416, 336, 96, 22); c.fill();
        c.fillStyle = '#e8b9a0'; c.beginPath(); c.roundRect(12, 412, 336, 96, 22); c.fill();
        c.strokeStyle = '#fffaf1'; c.lineWidth = 2.5; c.setLineDash([7, 6]);
        c.beginPath(); c.roundRect(20, 420, 320, 80, 16); c.stroke(); c.setLineDash([]);
        // what to do, then the clue cards, pinned up
        if (top >= 30) PZ.text(c, 'Tuck everyone in so every note gets a tick', 180, top - 17, { size: 13, color: '#4f5a46', weight: 700, maxW: 336 });
        for (const cd of cards) {
          const { cl, x, y } = cd, cy = y + CH / 2;
          c.fillStyle = 'rgba(50,40,30,0.2)'; c.beginPath(); c.roundRect(x + 1.5, y + 3, CW, CH, 10); c.fill();
          c.fillStyle = PZ.PAPER; c.beginPath(); c.roundRect(x, y, CW, CH, 10); c.fill();
          c.strokeStyle = '#e5d9c6'; c.lineWidth = 1.5; c.stroke();
          mini(c, P.kinds[cl.a], x + 22, cy + 2);
          let words;
          if (cl.b !== undefined) { words = PAIR[cl.t]; mini(c, P.kinds[cl.b], x + CW - 22, cy + 2); }
          else {
            const F = FEATURES[P.feats[cl.j]];
            words = (cl.t === 'notBed' ? 'not ' : '') + F.say;
            c.save(); c.translate(x + CW - 24, cy); c.scale(1.2, 1.2); F.icon(c, 0, 0); c.restore();
            if (cl.t === 'notBed') {
              c.strokeStyle = 'rgba(217,139,99,0.9)'; c.lineWidth = 3; c.lineCap = 'round';
              c.beginPath(); c.moveTo(x + CW - 36, cy - 12); c.lineTo(x + CW - 12, cy + 12); c.moveTo(x + CW - 12, cy - 12); c.lineTo(x + CW - 36, cy + 12); c.stroke();
            }
          }
          PZ.text(c, words, x + CW / 2, cy + 1, { size: 13, color: PZ.INK2, maxW: CW - 84 });
          dot(c, x + CW / 2, y + 4, 3.6, '#d98b63'); dot(c, x + CW / 2 - 1, y + 3, 1.2, 'rgba(255,255,255,0.7)');
          c.strokeStyle = 'rgba(107,97,87,0.28)'; c.lineWidth = 1.5; c.setLineDash([3, 3]);
          c.beginPath(); c.arc(x + CW - 8, y + 4, 9, 0, 7); c.stroke(); c.setLineDash([]);
        }
      },
      draw(c, t, still) {
        if (hint >= 0 && hintT > 0 && !still) {
          const p = pets[hint];
          PZ.glow(c, p.x, p.y, 34, t); PZ.glow(c, BX[sol[hint]], BY - 6, 44, t);
        }
        // the stove's fire flickers a little
        const sj = P.feats.indexOf('stove');
        if (sj >= 0 && !still) { c.fillStyle = `rgba(255,214,120,${(0.25 + 0.2 * Math.sin(t * 7) * Math.sin(t * 3.1)).toFixed(3)})`; c.beginPath(); c.roundRect(BX[sj] - 11, 264, 22, 18, [9, 9, 3, 3]); c.fill(); }
        const bj = P.feats.indexOf('basket');
        for (const p of pets) if (where[p.i] >= 0 && p !== held) drawPet(c, p, t, still, false);
        if (bj >= 0) FEATURES.basket.front(c, BX[bj], BY);
        for (const p of pets) if (where[p.i] < 0 && p !== held) drawPet(c, p, t, still, false);
        if (!still && where.some((w) => w < 0)) PZ.text(c, 'Waiting for a bed', 180, 528, { size: 13, color: PZ.INK2 });
        for (const cd of cards) if (cd.tick > 0.02) tick(c, cd.x + CW - 8, cd.y + 4, cd.tick);
        if (solved) for (const p of pets) if (p.sleep >= 0) zzz(c, p, t, still);
        if (held && !still) drawPet(c, held, t, still, true);
      },
      step(dt) {
        hintT -= dt;
        for (const p of pets) {
          p.x = PZ.approach(p.x, p.tx, dt); p.y = PZ.approach(p.y, p.ty, dt);
          p.lie = PZ.approach(p.lie, where[p.i] >= 0 && p !== held ? 1 : 0, dt, 8);
          if (p.sleep >= 0) p.sleep += dt;
        }
        for (const cd of cards) cd.tick = PZ.approach(cd.tick, ticked(cd.cl, where) ? 1 : 0, dt, 9);
        if (payQ.length) { payT += dt; if (payT > 0.08) { payT = 0; pay(); } }
      },
      down(x, y) {
        if (held || solved) return;
        const d = (p) => Math.min(PZ.dist(p.x, p.y, x, y), PZ.dist(p.tx, p.ty, x, y));
        const p = pets.filter((q) => d(q) < HIT).sort((a, b) => d(a) - d(b))[0];
        if (!p) return;
        held = p; from = where[p.i]; gdx = p.x - x; gdy = p.y - y;
        p.tx = x + gdx; p.ty = y + gdy - PZ.LIFT;
        fx.sound('pick');
      },
      move(x, y) { if (held) { held.tx = x + gdx; held.ty = y + gdy - PZ.LIFT; } },
      up(x, y) {
        if (!held) return;
        const p = held; held = null;
        const dx = x + gdx, dy = y + gdy - PZ.LIFT; // judged where it is drawn
        let j = -1;
        if (dy > 250 && dy < 398) BX.forEach((bx, k) => { if (Math.abs(dx - bx) < 44 && (j < 0 || Math.abs(dx - bx) < Math.abs(dx - BX[j]))) j = k; });
        if (j >= 0) {
          const q = occupant(j);
          if (q >= 0 && q !== p.i) { where[q] = from; home(pets[q]); } // swap: the one in the bed goes where this one came from
          where[p.i] = j; home(p); fx.sound('drop'); check();
          if (hint >= 0 && where[hint] === sol[hint]) hintT = 0; // the hint stays until it has been followed
        } else if (dy >= 398) {
          where[p.i] = -1; home(p); fx.sound('drop');
        } else { home(p); fx.sound('nope'); } // nowhere in particular: back where it was
      },
      cancel() { if (held) { const p = held; held = null; home(p); } },
      progress() {
        if (solved) return 1;
        const ok = clues.filter((cl) => ticked(cl, where)).length + (placed() ? 1 : 0);
        return Math.min(0.95, ok / (clues.length + 1));
      },
      solved: () => solved,
      hint() {
        if (solved) return;
        const wrong = pets.filter((p) => where[p.i] >= 0 && where[p.i] !== sol[p.i]);
        const p = wrong[0] || pets.find((q) => where[q.i] !== sol[q.i]);
        if (p) { hint = p.i; hintT = 3.5; }
      },
      save: () => ({ where: where.slice() }),
      load(s) {
        if (!s || !Array.isArray(s.where) || s.where.length !== n) return;
        const seen = new Set();
        for (const w of s.where) { if (!Number.isInteger(w) || w < -1 || w > 3 || (w >= 0 && seen.has(w))) return; if (w >= 0) seen.add(w); }
        s.where.forEach((w, i) => { where[i] = w; });
        pets.forEach((p) => home(p, true));
        check(true);
      },
      solveAll() { sol.forEach((j, i) => { where[i] = j; }); pets.forEach((p) => home(p, true)); check(true); },
      // finger positions, playing the swaps through: the ones the bed clues
      // talk about go first, so the cards start ticking early
      debugPlan() {
        if (solved) return [];
        const w = where.slice(), plan = [];
        const firsts = clues.filter((cl) => cl.b === undefined).map((cl) => cl.a);
        const order = [...new Set(firsts.concat(clues.flatMap((cl) => (cl.b === undefined ? [] : [cl.a, cl.b]))).concat([0, 1, 2, 3]))];
        for (const i of order) {
          if (w[i] === sol[i]) continue;
          const f = w[i], sx = f >= 0 ? BX[f] : HOME_X[i], sy = f >= 0 ? BED_Y : HOME_Y;
          plan.push({ drag: [sx, sy, BX[sol[i]], BED_Y + PZ.LIFT] });
          const q = w.indexOf(sol[i]);
          if (q >= 0) w[q] = f;
          w[i] = sol[i];
        }
        return plan;
      },
    };
    Object.defineProperty(sc, 'fx', { get: () => fx, set: (v) => { fx = v; } });
    return sc;
  }

  Object.assign(SCENES.KINDS, { beds });
})();
