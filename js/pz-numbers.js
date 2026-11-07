'use strict';
// Paint by numbers: a making job at The Painter's Loft (and in the puzzle room,
// at the cottage and at the café). A picture from js/paintings.js is divided
// into eight to twelve spaces, each with a small number, and the jars below
// have the same numbers on their labels. Tap a jar, then tap the spaces with
// its number, or draw through several in one stroke: the paint spreads softly
// out from the finger. A space only takes its own colour; any other simply
// stays as it is. The numbers go as the paint comes, and nothing is left of
// the lines when the picture is finished.
// opts.what: undefined (paper on the table in the puzzle room), 'canvas' (on an
// easel in the studio), 'mural' (the long wall in the yard, twelve spaces),
// 'backdrop' (the cloth at the back of the theatre's stage, the same wide pictures),
// 'picture' (in a frame on the cottage table) or 'chalkboard' (the café's board,
// with sticks of chalk for jars). opts.key 'letters': A, B, C instead of 1, 2, 3.
// keep() says which picture came out and in which colours, for the place's wall.
//   node test/run.mjs puzzle js/pz-numbers.js numbers --seeds 30 [--opts '{"what":"mural"}']

(() => {
  const W = 360, TAU = Math.PI * 2, LETTERS = 'ABCDEFGHIJKL';
  const JAR = { w: 54, h: 76 };
  const REACH = 13;       // a finger is wide: a space this near the touch still counts
  const CHALK = '#f1eee2', BOARD = '#2f3a38';
  const NEARBY = Array.from({ length: 8 }, (_, i) => [Math.cos((i * TAU) / 8), Math.sin((i * TAU) / 8)]);

  // where the picture is and where the jars stand, wherever it is being painted
  const WHERE = {
    paper: { pic: { x: 20, y: 58, w: 320, h: 320 }, jarY: 446, crop: { x: 8, y: 46, w: 344, h: 344 } },
    picture: { pic: { x: 28, y: 64, w: 304, h: 304 }, jarY: 446, crop: { x: 8, y: 44, w: 344, h: 344 } },
    canvas: { pic: { x: 24, y: 56, w: 312, h: 312 }, jarY: 446, crop: { x: 8, y: 44, w: 344, h: 344 } },
    mural: { pic: { x: 6, y: 84, w: 348, h: 204.7 }, jarY: 406, crop: { x: 0, y: 26, w: 360, h: 360 } },
    backdrop: { pic: { x: 6, y: 84, w: 348, h: 204.7 }, jarY: 406, crop: { x: 0, y: 26, w: 360, h: 360 } },
    chalkboard: { pic: { x: 26, y: 62, w: 308, h: 308 }, jarY: 446, crop: { x: 8, y: 44, w: 344, h: 344 } },
  };

  function inside(pts, x, y) {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[j];
      if ((ay > y) !== (by > y) && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) c = !c;
    }
    return c;
  }

  function numbers(S) {
    const r = S.r, o = S.opts || {};
    const what = WHERE[o.what] ? o.what : 'paper', V = WHERE[what], chalk = what === 'chalkboard', jarY = V.jarY;
    const wide = what === 'mural' || what === 'backdrop';
    const word = o.key === 'letters' ? 'letter' : 'number', holder = chalk ? 'chalk' : wide ? 'tin' : 'jar';
    const m = U.pick(r, wide ? PAINTINGS.MURAL : PAINTINGS.CANVAS), M = PAINTINGS.MOTIFS[m];
    const p = (r() * M.pals.length) | 0, pal = M.pals[p];
    const Pic = V.pic, sx = Pic.w / M.w, sy = Pic.h / M.h, unit = Math.min(sx, sy);
    const at = ([x, y]) => [Pic.x + x * sx, Pic.y + y * sy];
    const tone = (c) => (chalk ? U.mix(c, '#ffffff', 0.16) : c);
    const line = chalk ? 'rgba(241,238,226,0.82)' : 'rgba(92,80,66,0.6)';
    const printed = chalk ? CHALK : PZ.INK;

    // each colour gets its number afresh, so the same picture is not the same job
    const kinds = PZ.shuffle(r, [...new Set(M.cells.map((q) => q.k))]);
    const gap = Math.min(70, 332 / kinds.length);
    const jars = kinds.map((k, i) => ({
      k, col: tone(pal[k]), x: 180 + (i - (kinds.length - 1) / 2) * gap, label: o.key === 'letters' ? LETTERS[i] : String(i + 1),
      total: 0, left: 0, lift: 0, level: 1,
    }));
    const marks = U.rng(((r() * 1e9) | 0) + 7);
    const spots = PAINTINGS.spots(m);
    const cells = M.cells.map((q, i) => {
      const pts = q.pts.map(at), j = kinds.indexOf(q.k), J = jars[j], [cx, cy] = at([spots[i].x, spots[i].y]);
      J.total++; J.left++;
      const xs = pts.map((a) => a[0]), ys = pts.map((a) => a[1]);
      const box = { x: Math.min(...xs) - 1, y: Math.min(...ys) - 1, w: Math.max(...xs) - Math.min(...xs) + 2, h: Math.max(...ys) - Math.min(...ys) + 2 };
      const path = new Path2D();
      pts.forEach(([x, y], n) => (n ? path.lineTo(x, y) : path.moveTo(x, y)));
      path.closePath();
      // a few lighter and darker strokes of the brush in every space
      const n = Math.max(3, Math.min(9, Math.ceil((box.w * box.h) / 2600))), strokes = [];
      for (let s = 0; s < n; s++) {
        const a = -0.5 + (marks() - 0.5) * 0.5, l = 30 + marks() * 50, x = box.x + marks() * box.w, y = box.y + marks() * box.h;
        strokes.push({ x0: x - Math.cos(a) * l, y0: y - Math.sin(a) * l, x1: x + Math.cos(a) * l, y1: y + Math.sin(a) * l, w: 7 + marks() * 13, col: U.rgba(U.shade(J.col, marks() < 0.5 ? 0.3 : -0.14), chalk ? 0.2 : 0.17) });
      }
      return { pts, j, col: J.col, path, box, strokes, cx, cy, rad: spots[i].r * unit, done: false, f: 0, ox: cx, oy: cy, reach: 40, wig: 0 };
    });
    const steps = cells.length;
    const weave = what === 'canvas' ? weavePattern() : null;

    let sel = 0, painted = 0, stroke = null, hintT = 0, shine = 0, brushX = jars[0].x, fx = null;
    jars[0].lift = 1;
    const solved = () => painted >= steps;
    const firstLeft = () => jars.findIndex((J) => J.left > 0);
    // the spaces of the chosen jar first, then the other jars in turn
    const jarOrder = () => [sel].concat(jars.map((_, i) => i).filter((i) => i !== sel));
    const nextJar = () => jarOrder().find((i) => jars[i].left > 0);

    // ------------------------------------------------------------ the rooms
    function weavePattern() {
      const cv = U.canvas(6, 6), x = cv.getContext('2d');
      x.fillStyle = 'rgba(120,105,85,0.5)'; x.fillRect(0, 0, 6, 1); x.fillRect(0, 3, 6, 1); x.fillRect(0, 0, 1, 6); x.fillRect(3, 0, 1, 6);
      return cv;
    }
    function title(c, color) {
      const name = chalk ? `Tap a chalk, then the spaces with its ${word}` : `Tap a ${holder}, then the spaces with its ${word}`;
      PZ.text(c, name, W / 2, 22, { size: 13, color: color || PZ.INK2, maxW: 340 });
    }
    function planks(c, y0, base, pitch) {
      const { x0, x1, y1 } = S.bleed, rr = U.rng(4517);
      c.fillStyle = base; c.fillRect(x0, y0, x1 - x0, y1 - y0);
      c.fillStyle = 'rgba(90,55,25,0.13)'; for (let y = y0 + pitch; y < y1; y += pitch) c.fillRect(x0, y, x1 - x0, 1.6);
      c.strokeStyle = 'rgba(110,70,35,0.14)'; c.lineWidth = 0.9;
      for (let i = 0; i < 70; i++) { const x = x0 + rr() * (x1 - x0), y = y0 + 4 + rr() * (y1 - y0 - 4), l = 20 + rr() * 60; c.beginPath(); c.moveTo(x, y); c.lineTo(x + l, y + (rr() - 0.5) * 2); c.stroke(); }
    }
    function sheet(c, pad, col, rad = 3) {
      const x = Pic.x - pad, y = Pic.y - pad, w = Pic.w + pad * 2, h = Pic.h + pad * 2;
      c.fillStyle = 'rgba(60,40,20,0.22)'; PZ.rr(c, x + 3, y + 5, w, h, rad); c.fill();
      c.fillStyle = col; PZ.rr(c, x, y, w, h, rad); c.fill();
    }
    function shelf(c, y, col, tin) {
      c.fillStyle = 'rgba(60,40,20,0.22)'; PZ.rr(c, 13, y + 6, 338, 18, 5); c.fill();
      c.fillStyle = col; PZ.rr(c, 10, y, 340, 16, 5); c.fill();
      c.fillStyle = 'rgba(255,235,200,0.3)'; PZ.rr(c, 14, y + 1, 332, 3, 2); c.fill();
      if (tin) for (const x of [46, 314]) { c.fillStyle = '#b4604a'; PZ.rr(c, x - 24, y + 15, 48, 16, 2); c.fill(); c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(x - 24, y + 15, 48, 2); c.fillStyle = 'rgba(70,35,25,0.3)'; c.fillRect(x - 1, y + 15, 2, 16); }
    }
    const rooms = {
      // the puzzle room: paper taped to the table
      paper(c) {
        const { x0, y0, x1 } = S.bleed;
        c.fillStyle = '#efe4cf'; c.fillRect(x0, y0, x1 - x0, 46 - y0);
        c.fillStyle = 'rgba(180,155,115,0.14)'; for (let x = Math.floor(x0 / 26) * 26; x < x1; x += 26) c.fillRect(x, y0, 1.6, 46 - y0);
        title(c);
        planks(c, 40, '#d6b07e', 64);
        c.fillStyle = 'rgba(60,40,20,0.2)'; c.fillRect(x0, 40, x1 - x0, 5);
        sheet(c, 10, '#fffdf6');
        const tape = ['#a6d3d4', '#efb4ae', '#f2d88a', '#bba9df'];
        [[Pic.x - 8, Pic.y - 8, -0.7], [Pic.x + Pic.w + 8, Pic.y - 8, 0.7], [Pic.x - 8, Pic.y + Pic.h + 8, 0.7], [Pic.x + Pic.w + 8, Pic.y + Pic.h + 8, -0.7]].forEach(([x, y, a], i) => {
          c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = U.rgba(tape[i], 0.85); c.fillRect(-20, -7, 40, 14); c.restore();
        });
        shelf(c, jarY + JAR.h, '#b98f5a');
      },
      // the cottage: a frame on a gingham cloth, a sprigged wallpaper behind
      picture(c) {
        const { x0, y0, x1, y1 } = S.bleed;
        c.fillStyle = '#efe6cf'; c.fillRect(x0, y0, x1 - x0, 46 - y0);
        for (let y = -40; y < 46; y += 22) for (let x = Math.floor(x0 / 30) * 30; x < x1; x += 30) { const dx = x + ((y + 40) % 44 ? 15 : 0); c.fillStyle = 'rgba(111,154,106,0.3)'; c.beginPath(); c.ellipse(dx, y, 2.2, 4, 0.5, 0, TAU); c.fill(); c.fillStyle = 'rgba(217,139,99,0.34)'; c.beginPath(); c.arc(dx + 3, y - 3, 1.5, 0, TAU); c.fill(); }
        c.fillStyle = 'rgba(239,230,207,0.9)'; c.fillRect(x0, 10, x1 - x0, 24);
        title(c);
        c.fillStyle = '#fbf6ec'; c.fillRect(x0, 40, x1 - x0, y1 - 40);
        c.fillStyle = 'rgba(201,71,79,0.2)';
        for (let x = Math.floor(x0 / 28) * 28; x < x1; x += 28) c.fillRect(x, 40, 14, y1 - 40);
        for (let y = 40; y < y1; y += 28) c.fillRect(x0, y, x1 - x0, 14);
        c.fillStyle = 'rgba(60,40,20,0.2)'; c.fillRect(x0, 40, x1 - x0, 5);
        sheet(c, 20, '#b98a5a', 4);
        c.strokeStyle = 'rgba(255,235,200,0.4)'; c.lineWidth = 1.4; PZ.rr(c, Pic.x - 17, Pic.y - 17, Pic.w + 34, Pic.h + 34, 3); c.stroke();
        c.fillStyle = '#fffdf6'; c.fillRect(Pic.x - 9, Pic.y - 9, Pic.w + 18, Pic.h + 18);
        c.strokeStyle = 'rgba(90,60,30,0.3)'; c.lineWidth = 1; c.strokeRect(Pic.x - 9, Pic.y - 9, Pic.w + 18, Pic.h + 18);
        shelf(c, jarY + JAR.h, '#c99e6c');
      },
      // the studio: whitewashed boards, light from above and the easel
      canvas(c) {
        const { x0, y0, x1, y1 } = S.bleed;
        c.fillStyle = '#f2eee4'; c.fillRect(x0, y0, x1 - x0, 400 - y0);
        c.fillStyle = 'rgba(170,155,130,0.2)'; for (let x = Math.floor(x0 / 40) * 40; x < x1; x += 40) c.fillRect(x, y0, 1.4, 400 - y0);
        const g = c.createLinearGradient(40, 0, 300, 400); g.addColorStop(0, 'rgba(255,246,214,0.75)'); g.addColorStop(1, 'rgba(255,246,214,0)');
        c.fillStyle = g; c.beginPath(); c.moveTo(30, y0); c.lineTo(250, y0); c.lineTo(420, 400); c.lineTo(120, 400); c.closePath(); c.fill();
        title(c);
        planks(c, 400, '#c9a679', 40);
        c.fillStyle = 'rgba(60,40,20,0.16)'; c.fillRect(x0, 400, x1 - x0, 5);
        const dabs = U.rng(811), cols = ['#3d6fb8', '#d98b63', '#e9bf4f', '#6f9a6a', '#c9474f'];
        for (let i = 0; i < 22; i++) { c.fillStyle = U.rgba(cols[i % 5], 0.5); c.beginPath(); c.ellipse(x0 + dabs() * (x1 - x0), 410 + dabs() * 180, 1.6 + dabs() * 5, 1.2 + dabs() * 3, dabs() * 3, 0, TAU); c.fill(); }
        // the easel
        c.lineCap = 'round'; c.strokeStyle = '#a97a4a'; c.lineWidth = 11;
        c.beginPath(); c.moveTo(70, 44); c.lineTo(36, 440); c.moveTo(290, 44); c.lineTo(324, 440); c.stroke();
        c.strokeStyle = 'rgba(255,225,180,0.35)'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(68, 44); c.lineTo(34, 440); c.moveTo(288, 44); c.lineTo(322, 440); c.stroke();
        c.fillStyle = '#a97a4a'; PZ.rr(c, 180 - 7, 30, 14, 30, 3); c.fill();
        // the canvas on its ledge
        sheet(c, 6, '#e9e2d2', 2);
        c.fillStyle = '#fbf9f2'; c.fillRect(Pic.x, Pic.y, Pic.w, Pic.h);
        c.fillStyle = 'rgba(60,40,20,0.18)'; PZ.rr(c, 16, Pic.y + Pic.h + 8, 332, 18, 3); c.fill();
        c.fillStyle = '#b98a5a'; PZ.rr(c, 12, Pic.y + Pic.h + 4, 336, 15, 3); c.fill();
        c.fillStyle = 'rgba(255,235,200,0.3)'; c.fillRect(16, Pic.y + Pic.h + 5, 328, 2.5);
        shelf(c, jarY + JAR.h, '#a97a4a');
      },
      // the yard: a long whitewashed wall, cobbles and poppies at its foot
      mural(c) {
        const { x0, y0, x1, y1 } = S.bleed, top = 58, foot = 316;
        const sky = c.createLinearGradient(0, y0, 0, top); sky.addColorStop(0, '#bfe0ef'); sky.addColorStop(1, '#e4f1ee');
        c.fillStyle = sky; c.fillRect(x0, y0, x1 - x0, top - y0 + 2);
        title(c);
        c.fillStyle = '#efe7d6'; c.fillRect(x0, top, x1 - x0, foot - top);
        c.strokeStyle = 'rgba(165,140,110,0.22)'; c.lineWidth = 1;
        for (let y = top + 12, row = 0; y < foot; y += 13, row++) {
          c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
          for (let x = Math.floor(x0 / 34) * 34 + (row % 2 ? 17 : 0); x < x1; x += 34) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 13); c.stroke(); }
        }
        c.fillStyle = '#c9b89b'; c.fillRect(x0, top - 6, x1 - x0, 9);
        c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(x0, top - 6, x1 - x0, 2);
        c.fillStyle = 'rgba(60,40,20,0.14)'; c.fillRect(x0, top + 3, x1 - x0, 3);
        c.fillStyle = 'rgba(60,40,20,0.16)'; c.fillRect(Pic.x - 3, Pic.y - 2, Pic.w + 8, Pic.h + 8);
        c.fillStyle = '#fbf8f0'; c.fillRect(Pic.x - 3, Pic.y - 3, Pic.w + 6, Pic.h + 6);
        // cobbles
        c.fillStyle = '#b7ad9c'; c.fillRect(x0, foot, x1 - x0, y1 - foot);
        const cob = U.rng(631);
        for (let y = foot + 7; y < y1 + 10; y += 15) for (let x = Math.floor(x0 / 24) * 24 + ((y | 0) % 2 ? 12 : 0); x < x1 + 12; x += 24) {
          const v = cob();
          c.fillStyle = `rgba(${(198 + v * 30) | 0},${(190 + v * 28) | 0},${(174 + v * 26) | 0},0.92)`;
          c.beginPath(); c.ellipse(x + (cob() - 0.5) * 3, y + (cob() - 0.5) * 2, 10.5, 6, 0, 0, TAU); c.fill();
        }
        c.fillStyle = 'rgba(60,40,20,0.2)'; c.fillRect(x0, foot, x1 - x0, 4);
        // poppies along the wall
        const pop = U.rng(977);
        for (let i = 0; i < 16; i++) {
          const x = x0 + ((i + 0.5) / 16) * (x1 - x0) + (pop() - 0.5) * 12, h = 12 + pop() * 13;
          c.strokeStyle = '#6f9a6a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, foot + 4); c.quadraticCurveTo(x + 2, foot - h / 2, x + (pop() - 0.5) * 6, foot - h); c.stroke();
          if (i % 2 === 0) { c.fillStyle = '#d9483f'; c.beginPath(); c.arc(x, foot - h, 4.4, 0, TAU); c.fill(); c.fillStyle = '#3b2a22'; c.beginPath(); c.arc(x, foot - h, 1.3, 0, TAU); c.fill(); }
        }
        shelf(c, jarY + JAR.h, '#c4a06f', true);
      },
      // the theatre: the cloth hung at the back of the stage under a red pelmet
      backdrop(c) {
        const { x0, y0, x1, y1 } = S.bleed, foot = 316;
        c.fillStyle = '#1f2a4a'; c.fillRect(x0, y0, x1 - x0, foot - y0);
        c.fillStyle = 'rgba(255,255,255,0.03)'; for (let x = Math.floor(x0 / 30) * 30; x < x1; x += 30) c.fillRect(x, y0, 14, foot - y0);
        title(c, '#eadfc6');
        c.fillStyle = 'rgba(0,0,0,0.34)'; c.fillRect(Pic.x - 3, Pic.y - 2, Pic.w + 8, Pic.h + 9);
        c.fillStyle = '#fbf8f0'; c.fillRect(Pic.x - 3, Pic.y - 3, Pic.w + 6, Pic.h + 6);
        // the batten and the pelmet with its gold fringe
        c.fillStyle = '#5c3f2a'; c.fillRect(x0, Pic.y - 9, x1 - x0, 6);
        c.fillStyle = '#8c2f39'; c.fillRect(x0, 38, x1 - x0, 30);
        for (let x = Math.floor(x0 / 40) * 40; x < x1; x += 40) { c.fillStyle = '#8c2f39'; c.beginPath(); c.arc(x + 20, 67, 20, 0, Math.PI); c.fill(); c.strokeStyle = '#d8ae4e'; c.lineWidth = 2.2; c.beginPath(); c.arc(x + 20, 67, 20, 0, Math.PI); c.stroke(); c.fillStyle = 'rgba(30,8,14,0.2)'; c.fillRect(x + 8, 38, 8, 30); }
        c.fillStyle = 'rgba(255,220,150,0.32)'; c.fillRect(x0, 38, x1 - x0, 2);
        // the stage boards and a row of footlights
        planks(c, foot, '#a97f4f', 26);
        c.fillStyle = 'rgba(60,40,20,0.3)'; c.fillRect(x0, foot, x1 - x0, 5);
        for (let x = Math.floor(x0 / 44) * 44 + 22; x < x1; x += 44) { const g = c.createRadialGradient(x, foot + 2, 1, x, foot + 2, 16); g.addColorStop(0, 'rgba(255,226,150,0.9)'); g.addColorStop(1, 'rgba(255,226,150,0)'); c.fillStyle = g; c.fillRect(x - 16, foot - 14, 32, 30); }
        shelf(c, jarY + JAR.h, '#c4a06f', true);
      },
      // the café: the slate board on its wall, sticks of chalk in a box on the counter
      chalkboard(c) {
        const { x0, y0, x1 } = S.bleed;
        c.fillStyle = '#e9dcc3'; c.fillRect(x0, y0, x1 - x0, 410 - y0);
        c.fillStyle = 'rgba(190,160,120,0.18)'; for (let x = Math.floor(x0 / 22) * 22; x < x1; x += 22) c.fillRect(x, y0, 1.2, 410 - y0);
        title(c);
        planks(c, 410, '#b98a5a', 46);
        c.fillStyle = 'rgba(60,40,20,0.2)'; c.fillRect(x0, 410, x1 - x0, 5);
        sheet(c, 18, '#8a6238', 4);
        c.strokeStyle = 'rgba(255,225,180,0.35)'; c.lineWidth = 1.6; PZ.rr(c, Pic.x - 15, Pic.y - 15, Pic.w + 30, Pic.h + 30, 3); c.stroke();
        c.fillStyle = BOARD; c.fillRect(Pic.x - 8, Pic.y - 8, Pic.w + 16, Pic.h + 16);
        const sm = U.rng(5011);
        for (let i = 0; i < 26; i++) { c.fillStyle = `rgba(255,255,255,${(0.006 + sm() * 0.016).toFixed(3)})`; c.beginPath(); c.ellipse(Pic.x + sm() * Pic.w, Pic.y + sm() * Pic.h, 18 + sm() * 44, 8 + sm() * 20, sm() * 3, 0, TAU); c.fill(); }
        // the box of chalk
        c.fillStyle = 'rgba(60,40,20,0.24)'; PZ.rr(c, 15, jarY + 44, 334, 50, 6); c.fill();
      },
    };

    // ----------------------------------------------------- the jars and things
    function labelDisc(c, J, x, y) {
      c.fillStyle = PZ.PAPER; c.beginPath(); c.arc(x, y, 17, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(90,70,50,0.45)'; c.lineWidth = 1.2; c.stroke();
      PZ.text(c, J.label, x, y + 1, { size: 25, weight: 900, color: PZ.INK });
    }
    function tick(c, x, y) {
      c.fillStyle = '#6f9a6a'; c.beginPath(); c.arc(x, y, 9, 0, TAU); c.fill();
      c.strokeStyle = '#fffaf1'; c.lineWidth = 2.6; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x - 1, y + 3.4); c.lineTo(x + 4.4, y - 3.6); c.stroke();
    }
    // a glass jar, the paint going down as it is used
    function jarGlass(c, J, y) {
      const { w, h } = JAR, x = J.x - w / 2;
      c.fillStyle = 'rgba(255,255,255,0.5)'; PZ.rr(c, x, y, w, h, 11); c.fill();
      c.save(); PZ.rr(c, x + 3, y + 3, w - 6, h - 6, 8); c.clip();
      const top = y + 3 + (h - 6) * (1 - (0.3 + 0.6 * J.level));
      c.fillStyle = J.col; c.fillRect(x, top, w, h);
      c.fillStyle = 'rgba(255,255,255,0.24)'; c.beginPath(); c.ellipse(J.x, top, w / 2, 3.4, 0, 0, TAU); c.fill();
      c.restore();
      c.strokeStyle = 'rgba(90,75,60,0.5)'; c.lineWidth = 1.5; PZ.rr(c, x, y, w, h, 11); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.75)'; PZ.rr(c, x + 4, y - 5, w - 8, 9, 3); c.fill();
      c.strokeStyle = 'rgba(90,75,60,0.4)'; c.lineWidth = 1; c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.5)'; PZ.rr(c, x + 6, y + 10, 4, h - 22, 2); c.fill();
      labelDisc(c, J, J.x, y + 44);
      if (!J.left) tick(c, J.x + w / 2 - 6, y + 6);
    }
    // a big tin with its lid off, a band of the colour round it
    function tin(c, J, y) {
      const { w, h } = JAR, x = J.x - w / 2;
      const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#aeb4b9'); g.addColorStop(0.45, '#eef0f1'); g.addColorStop(1, '#a3a9ae');
      c.fillStyle = g; PZ.rr(c, x, y + 8, w, h - 8, 5); c.fill();
      c.fillStyle = J.col; c.fillRect(x, y + 20, w, 46);
      c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(x + 6, y + 20, 8, 46);
      c.strokeStyle = 'rgba(90,75,60,0.5)'; c.lineWidth = 1.4; PZ.rr(c, x, y + 8, w, h - 8, 5); c.stroke();
      c.fillStyle = '#8f969c'; c.beginPath(); c.ellipse(J.x, y + 8, w / 2, 7, 0, 0, TAU); c.fill();
      c.fillStyle = J.col; c.beginPath(); c.ellipse(J.x, y + 8, w / 2 - 3, 5, 0, 0, TAU); c.fill();
      c.fillStyle = J.col; PZ.rr(c, x + 34, y + 8, 7, 18, 3.5); c.fill();
      labelDisc(c, J, J.x, y + 44);
      if (!J.left) tick(c, J.x + w / 2 - 6, y + 6);
    }
    function chalkStick(c, J, y) {
      const x = J.x - 21, h = JAR.h + 4;
      c.fillStyle = J.col; PZ.rr(c, x, y, 42, h, 13); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.3)'; PZ.rr(c, x + 5, y + 7, 5, h - 24, 2.5); c.fill();
      c.strokeStyle = 'rgba(40,30,20,0.3)'; c.lineWidth = 1.2; PZ.rr(c, x, y, 42, h, 13); c.stroke();
      labelDisc(c, J, J.x, y + 30);
      if (!J.left) tick(c, J.x + 19, y + 5);
    }
    function brush(c, x, y) {
      c.save(); c.translate(x + 4, y + 10); c.rotate(0.22);
      c.fillStyle = 'rgba(60,40,20,0.14)'; PZ.rr(c, -1, -64, 7, 62, 3); c.fill();
      c.fillStyle = '#c99a5a'; PZ.rr(c, -3.4, -66, 6.8, 64, 3.4); c.fill();
      c.fillStyle = 'rgba(255,235,200,0.5)'; c.fillRect(-2.2, -62, 1.4, 54);
      c.restore();
    }
    function chalkBox(c) {
      c.fillStyle = '#a97a4a'; PZ.rr(c, 12, jarY + 46, 336, 44, 6); c.fill();
      c.fillStyle = 'rgba(255,235,200,0.3)'; c.fillRect(16, jarY + 47, 328, 3);
      c.fillStyle = 'rgba(60,35,15,0.22)'; for (const x of [70, 180, 290]) c.fillRect(x, jarY + 50, 1.6, 38);
    }

    // ------------------------------------------------------------ the picture
    function paintCell(c, q, k) {
      c.save();
      if (k >= 1) { c.strokeStyle = q.col; c.lineWidth = 1.1; c.lineJoin = 'round'; c.stroke(q.path); }
      c.clip(q.path);
      if (k < 1) { c.beginPath(); c.arc(q.ox, q.oy, Math.max(2, q.reach * U.easeOut(k)), 0, TAU); c.clip(); }
      c.fillStyle = q.col; c.fillRect(q.box.x, q.box.y, q.box.w, q.box.h);
      c.lineCap = 'round';
      for (const s of q.strokes) { c.strokeStyle = s.col; c.lineWidth = s.w; c.beginPath(); c.moveTo(s.x0, s.y0); c.lineTo(s.x1, s.y1); c.stroke(); }
      if (chalk) { c.strokeStyle = 'rgba(47,58,56,0.16)'; c.lineWidth = 1.1; c.beginPath(); for (let d = -Pic.h; d < Pic.w; d += 6) { c.moveTo(Pic.x + d, Pic.y); c.lineTo(Pic.x + d + Pic.h, Pic.y + Pic.h); } c.stroke(); }
      c.restore();
    }
    function ink(c) {
      const I = M.ink || {}, sc = Pic.w / M.w;
      c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
      c.strokeStyle = printed; c.globalAlpha = 0.62; c.lineWidth = Math.max(1, 0.62 * sc);
      for (const l of I.lines || []) { c.beginPath(); l.forEach((a, i) => { const [x, y] = at(a); if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke(); }
      c.globalAlpha = 1; c.fillStyle = printed;
      for (const [x, y, rad] of I.dots || []) { const [px, py] = at([x, y]); c.beginPath(); c.arc(px, py, rad * unit, 0, TAU); c.fill(); }
      c.restore();
    }
    function tag(c, q, f, still, t) {
      if (f >= 1) return;
      const fs = U.clamp(q.rad * 0.7, 15, 24), J = jars[q.j], x = q.cx + (still ? 0 : Math.sin(q.wig * 42) * q.wig * 12), y = q.cy;
      c.save(); c.globalAlpha = 1 - U.smooth(0, 0.8, f);
      // the spaces of the chosen jar wear a little dot of its colour
      if (q.j === sel && !still) {
        c.fillStyle = U.rgba(J.col, chalk ? 0.75 : 0.6); c.beginPath(); c.arc(x, y, fs * 0.82, 0, TAU); c.fill();
        c.strokeStyle = chalk ? 'rgba(241,238,226,0.8)' : U.rgba(U.shade(J.col, -0.3), 0.9); c.lineWidth = 1.8; c.stroke();
      }
      PZ.text(c, J.label, x, y + 0.6, { size: fs, weight: 900, color: chalk && !(q.j === sel && !still) ? CHALK : PZ.INK });
      c.restore();
    }

    function cellAt(x, y) {
      for (let i = 0; i < steps; i++) if (x >= cells[i].box.x && x <= cells[i].box.x + cells[i].box.w && y >= cells[i].box.y && y <= cells[i].box.y + cells[i].box.h && inside(cells[i].pts, x, y)) return i;
      return -1;
    }
    const jarAt = (x, y) => (y < jarY - 26 || y > jarY + JAR.h + 26 ? -1 : jars.findIndex((J) => Math.abs(x - J.x) <= gap / 2));
    const takes = (i) => i >= 0 && !cells[i].done && cells[i].j === sel;
    function paint(i, x, y) {
      const q = cells[i], J = jars[q.j];
      q.done = true; q.f = 0; q.ox = x; q.oy = y;
      q.reach = Math.max(...q.pts.map(([a, b]) => PZ.dist(a, b, x, y))) + 3;
      painted++; J.left--; hintT = 0;
      fx.sound(painted >= steps ? 'chime' : J.left ? 'pour' : 'happy');
      fx.good(q.cx, q.cy);
    }
    // a touch of the brush: tap is the first touch of a stroke, the only one that
    // says 'nope' when the space under it does not take this colour
    function dab(x, y, tap) {
      let i = cellAt(x, y);
      if (!takes(i)) {
        const near = NEARBY.map(([a, b]) => cellAt(x + a * REACH, y + b * REACH)).find(takes);
        if (near !== undefined) i = near;
      }
      if (takes(i)) { paint(i, x, y); return; }
      if (tap && i >= 0 && !cells[i].done) { cells[i].wig = 0.42; fx.sound('nope'); }
    }

    const sc = {
      puzzle: true, indoor: true, steps,
      crop: V.crop,
      decor(c) { rooms[what](c); },
      draw(c, t, still) {
        for (const q of cells) if (q.done) paintCell(c, q, still ? 1 : q.f);
        if (weave) {
          c.save(); c.globalAlpha = 0.09; c.fillStyle = c.createPattern(weave, 'repeat');
          c.translate(Pic.x, Pic.y); c.fillRect(0, 0, Pic.w, Pic.h); c.restore();
        }
        c.lineJoin = 'round';
        for (const q of cells) {
          const f = q.done ? (still ? 1 : q.f) : 0;
          if (f >= 1) continue;
          c.strokeStyle = line; c.lineWidth = 1.3; c.globalAlpha = 1 - f; c.stroke(q.path); c.globalAlpha = 1;
        }
        ink(c);
        for (const q of cells) tag(c, q, q.done ? (still ? 1 : q.f) : 0, still, t);
        if (!still && hintT > 0 && !solved()) {
          const i = nextJar();
          if (jars[sel].left) {
            const q = cells.find((a) => a.j === sel && !a.done);
            c.save(); c.globalAlpha = 0.34 + 0.2 * Math.sin(t * 4); c.fillStyle = q.col; c.fill(q.path); c.restore();
            PZ.glow(c, q.cx, q.cy, Math.min(30, Math.max(18, q.rad)), t);
          } else PZ.glow(c, jars[i].x, jarY + 40 - jars[i].lift * 12, 42, t);
        }
        if (chalk) chalkBox(c);
        if (!chalk) brush(c, brushX, jarY - jars[sel].lift * 12);
        jars.forEach((J) => {
          const y = jarY - J.lift * (chalk ? 22 : 12);
          if (!chalk) PZ.shadow(c, J.x, jarY + JAR.h + 2, 25, 4, 0.2);
          if (chalk) chalkStick(c, J, y); else if (wide) tin(c, J, y); else jarGlass(c, J, y);
        });
        if (chalk) {
          c.fillStyle = '#b98a5a'; PZ.rr(c, 12, jarY + 62, 336, 28, 6); c.fill();
          c.fillStyle = 'rgba(255,235,200,0.3)'; c.fillRect(16, jarY + 63, 328, 3);
        }
        if (solved()) {
          // finished: a soft light passes over the wet paint, and it gets its name
          if (!still && shine < 1.7) {
            const u = shine / 1.7, x = Pic.x - 90 + (Pic.w + 180) * u, g = c.createLinearGradient(x - 70, 0, x + 70, 0);
            g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.34)'); g.addColorStop(1, 'rgba(255,255,255,0)');
            c.fillStyle = g; c.fillRect(Pic.x, Pic.y, Pic.w, Pic.h);
          }
          const a = still ? 1 : U.smooth(0.2, 1, shine);
          c.save(); c.globalAlpha = a;
          c.font = PZ.font(14); const tw = c.measureText(M.name).width + 26, ny = Pic.y + Pic.h - 12;
          c.fillStyle = 'rgba(60,40,20,0.2)'; PZ.rr(c, 180 - tw / 2 + 1.5, ny - 11, tw, 26, 5); c.fill();
          c.fillStyle = PZ.PAPER; PZ.rr(c, 180 - tw / 2, ny - 13, tw, 26, 5); c.fill();
          PZ.text(c, M.name, 180, ny, { size: 14 });
          c.restore();
        }
      },
      step(dt) {
        hintT -= dt;
        if (solved()) shine += dt;
        for (const q of cells) {
          if (q.done && q.f < 1) q.f = Math.min(1, q.f + dt / 0.42);
          if (q.wig > 0) q.wig = Math.max(0, q.wig - dt);
        }
        jars.forEach((J, i) => { J.lift = PZ.approach(J.lift, i === sel ? 1 : 0, dt, 12); J.level = PZ.approach(J.level, J.left / J.total, dt, 7); });
        brushX = PZ.approach(brushX, jars[sel].x, dt, 12);
      },
      down(x, y) {
        if (solved()) return;
        const j = jarAt(x, y);
        if (j >= 0) { if (j !== sel) { sel = j; hintT = 0; } fx.sound('pick'); return; }
        if (x < Pic.x - 16 || x > Pic.x + Pic.w + 16 || y < Pic.y - 16 || y > Pic.y + Pic.h + 16) return;
        stroke = { x, y };
        dab(U.clamp(x, Pic.x + 1, Pic.x + Pic.w - 1), U.clamp(y, Pic.y + 1, Pic.y + Pic.h - 1), true);
      },
      // a quick stroke is followed in small steps, so it cannot jump over a space
      move(x, y) {
        if (!stroke) return;
        const d = PZ.dist(stroke.x, stroke.y, x, y), n = Math.ceil(d / 7);
        for (let i = 1; i <= n; i++) dab(stroke.x + ((x - stroke.x) * i) / n, stroke.y + ((y - stroke.y) * i) / n, false);
        stroke.x = x; stroke.y = y;
      },
      up() { stroke = null; },
      cancel() { stroke = null; },
      progress: () => painted / steps,
      solved,
      hint() { if (!solved()) hintT = 3.5; },
      save: () => ({ d: cells.map((q) => (q.done ? 1 : 0)).join(''), j: sel }),
      load(st) {
        if (!st || typeof st.d !== 'string' || st.d.length !== steps || /[^01]/.test(st.d)) return;
        painted = 0;
        jars.forEach((J) => { J.left = J.total; });
        cells.forEach((q, i) => { q.done = st.d[i] === '1'; q.f = q.done ? 1 : 0; if (q.done) { painted++; jars[q.j].left--; } });
        const j = Math.round(+st.j);
        sel = j >= 0 && j < jars.length ? j : Math.max(0, firstLeft());
        jars.forEach((J, i) => { J.lift = i === sel ? 1 : 0; J.level = J.left / J.total; });
        brushX = jars[sel].x;
      },
      solveAll() {
        for (const q of cells) { q.done = true; q.f = 1; }
        painted = steps;
        jars.forEach((J) => { J.left = 0; J.level = 0; });
      },
      // the chosen jar's spaces first; a tap on the next jar whenever it runs out
      debugPlan() {
        const plan = [];
        let now = sel;
        for (const i of jarOrder()) {
          const todo = cells.filter((q) => q.j === i && !q.done);
          if (!todo.length) continue;
          if (i !== now) { plan.push({ tap: [jars[i].x, jarY + 40] }); now = i; }
          for (const q of todo) plan.push({ tap: [q.cx, q.cy] });
        }
        return plan;
      },
      // what the place's picture keeps of it (main.js puts it in S.painted)
      keep: () => ({ m, p }),
      // for the tests
      debugPicture: () => ({ m, p, spaces: steps, jars: jars.map((J) => ({ label: J.label, k: J.k, spaces: J.total })), sel }),
      debugSpaces: () => cells.map((q) => ({ x: q.cx, y: q.cy, jar: q.j, done: q.done })),
      debugJar: (i) => [jars[i].x, jarY + 40],
    };
    Object.defineProperty(sc, 'fx', { get: () => fx, set: (v) => { fx = v; } });
    return sc;
  }

  Object.assign(SCENES.KINDS, { numbers });
})();
