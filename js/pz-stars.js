'use strict';
// Join the stars: a quiet thinking job under a night sky. Eight to twelve
// numbered stars make a figure (a swan, a kite, a teapot, a hare, a boat, a
// cat, a fish). A thread runs from the star you have reached to your finger,
// wherever it touches; reach the next star and the thread locks with a soft
// note, and the same stroke can carry on to the one after. Let go anywhere else
// and the thread simply fades. When the figure is whole it lights up and gets
// its name.
// Stitch the tear is the same job with a needle (a making job, by c.family):
// numbered holes zigzag along a tear in a blanket, the needle is the finger,
// every right move becomes a stitch across the tear and the tear closes behind
// it. When it is mended a little patch with an embroidered motif is sewn on.
// opts.what: undefined (the stars) or 'stitch'.
// opts.where: for the stars undefined (a hill), 'cove' or 'canal' (what is on the
// skyline); for the stitching undefined (a patchwork quilt on the table in the
// back room) or 'rescue' (a dog's blanket in its basket).
// opts.key: 'letters' for A to L instead of 1 to 12.
//   node test/run.mjs puzzle js/pz-stars.js stars --seeds 30 [--opts '{"what":"stitch"}']

(() => {
  const W = 360, TAU = Math.PI * 2;
  const REACH = 26;     // the finger locks the next star from this far away
  const LETTERS = 'ABCDEFGHIJKL';
  const HALF = 30;      // how far a hole sits from the middle of the tear
  const TEAR = 12;      // half the width of the tear, at its widest

  // The figures, in board units (x 30..330, y 60..436). pts are the stars in
  // order; close are lines between stars and more are lines between free points,
  // both drawn only once the figure is whole; dots are little stars for eyes.
  const BOW = (x, y) => [[x - 9, y - 6], [x + 9, y + 6], [x + 9, y - 6], [x - 9, y + 6], [x - 9, y - 6]];
  const FIGURES = [
    { name: 'The Swan', pts: [[64, 132], [110, 94], [154, 128], [136, 186], [98, 238], [104, 306], [176, 346], [256, 330], [322, 256], [262, 262], [204, 222], [150, 262]],
      close: [[11, 4]], more: [[[92, 384], [130, 372], [168, 384]], [[190, 388], [232, 376], [274, 388]]], dots: [[108, 116]] },
    { name: 'The Kite', pts: [[84, 170], [190, 62], [286, 170], [190, 306], [146, 346], [198, 372], [150, 404], [212, 430], [270, 416]],
      close: [[3, 0]], more: [[[84, 170], [286, 170]], [[190, 62], [190, 306]], BOW(172, 359), BOW(174, 388), BOW(181, 417)], dots: [] },
    { name: 'The Teapot', pts: [[40, 150], [104, 196], [140, 156], [186, 118], [232, 156], [270, 204], [326, 206], [322, 274], [268, 300], [226, 344], [134, 344], [96, 272]],
      close: [[11, 0], [11, 1], [2, 4], [5, 8]], more: [[[58, 124], [44, 102], [62, 84]], [[92, 250], [180, 268], [270, 246]]], dots: [] },
    { name: 'The Hare', pts: [[286, 190], [244, 150], [250, 70], [194, 146], [176, 74], [150, 186], [110, 216], [84, 300], [44, 336], [130, 356], [226, 356], [236, 254]],
      close: [[11, 0]], more: [[[150, 356], [176, 300], [150, 262]]], dots: [[244, 180]] },
    { name: 'The Boat', pts: [[38, 296], [96, 356], [250, 356], [322, 296], [190, 296], [190, 240], [300, 240], [190, 60], [80, 240]],
      close: [[8, 5], [0, 4], [7, 5]], more: [[[52, 388], [94, 376], [136, 388]], [[204, 392], [246, 380], [288, 392]]], dots: [] },
    { name: 'The Cat', pts: [[316, 270], [312, 340], [238, 372], [256, 292], [212, 210], [210, 98], [168, 132], [126, 98], [124, 210], [84, 292], [104, 372]],
      close: [[10, 2]], more: [[[108, 170], [136, 176]], [[110, 186], [136, 184]], [[228, 170], [200, 176]], [[226, 186], [200, 184]]], dots: [[148, 158], [188, 158]] },
    { name: 'The Fish', pts: [[52, 250], [150, 176], [236, 214], [312, 160], [282, 250], [312, 340], [236, 286], [150, 324]],
      close: [[7, 0], [2, 6]], more: [[[122, 214], [134, 250], [122, 286]]], dots: [[92, 238]] },
  ];

  const segDist = (px, py, ax, ay, bx, by) => {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    const t = l2 ? U.clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1) : 0;
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  };
  const seg = (c, ax, ay, bx, by) => { c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); };
  const dot = (c, x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, TAU); c.fill(); };

  // a soft warm halo, drawn from one prepared sprite so a frame stays cheap
  let glowCv = null;
  function halo(c, x, y, rad, a) {
    if (a <= 0.005) return;
    if (!glowCv) {
      glowCv = U.canvas(128, 128);
      const g = glowCv.getContext('2d'), q = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      q.addColorStop(0, 'rgba(255,238,180,0.95)'); q.addColorStop(0.3, 'rgba(255,226,150,0.38)'); q.addColorStop(1, 'rgba(255,226,150,0)');
      g.fillStyle = q; g.fillRect(0, 0, 128, 128);
    }
    c.save(); c.globalAlpha = Math.min(1, a); c.drawImage(glowCv, x - rad, y - rad, rad * 2, rad * 2); c.restore();
  }
  function starPath(c, x, y, rad) {
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, d = i % 2 ? rad * 0.46 : rad;
      if (i) c.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); else c.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
    }
    c.closePath();
  }
  function star(c, x, y, rad, col) {
    c.lineJoin = 'round'; c.strokeStyle = col; c.lineWidth = rad * 0.36; c.fillStyle = col;
    starPath(c, x, y, rad); c.stroke(); c.fill();
  }
  // the thread of light between two stars
  function strand(c, ax, ay, bx, by, a) {
    c.lineCap = 'round';
    c.strokeStyle = `rgba(255,224,150,${(0.16 * a).toFixed(3)})`; c.lineWidth = 7; seg(c, ax, ay, bx, by);
    c.strokeStyle = `rgba(255,236,190,${(0.9 * a).toFixed(3)})`; c.lineWidth = 1.9; seg(c, ax, ay, bx, by);
  }
  // text that reads on anything: a dark edge round it
  function inked(c, s, x, y, size, col, a = 1) {
    c.save(); c.globalAlpha = a; c.font = PZ.font(size, 900); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    c.strokeStyle = 'rgba(12,16,50,0.82)'; c.lineWidth = 3.6; c.strokeText(s, x, y);
    c.fillStyle = col; c.fillText(s, x, y); c.restore();
  }
  // a little rounded tag along the bottom of the board
  function pill(c, s, y, size, bg, edge, ink, a = 1) {
    c.save(); c.globalAlpha = a; c.font = PZ.font(size, 800);
    const w = c.measureText(s).width + 32, h = size + 17, x = W / 2 - w / 2;
    c.fillStyle = bg; PZ.rr(c, x, y - h / 2, w, h, h / 2); c.fill();
    c.strokeStyle = edge; c.lineWidth = 1.2; c.stroke();
    PZ.text(c, s, W / 2, y + 0.5, { size, color: ink });
    c.restore();
  }

  function stars(S) {
    const r = S.r, o = S.opts || {}, stitch = o.what === 'stitch', letters = o.key === 'letters';
    const where = o.where, deco = (r() * 1e9) | 0;
    const name = (i) => (letters ? LETTERS[i] : String(i + 1));
    let n = 0, held = null, fade = null, hintT = 0, shine = 0, fx = null;

    const view = stitch ? tearView() : skyView();
    const P = view.P, steps = P.length - 1;
    const pop = new Array(P.length).fill(1);
    const solved = () => n >= steps;

    // ---------------------------------------------------------- the night sky
    function skyView() {
      const F = FIGURES[(r() * FIGURES.length) | 0];
      const flip = r() < 0.5, k = 0.94 + r() * 0.06, turn = (r() - 0.5) * 0.09, cx = 180, cy = 248, ca = Math.cos(turn), sa = Math.sin(turn);
      const tf = ([x, y]) => { const u = (flip ? W - x : x) - cx, v = y - cy; return [cx + (u * ca - v * sa) * k, cy + (u * sa + v * ca) * k]; };
      const base = F.pts.map(tf), xs = base.map((p) => p[0]), ys = base.map((p) => p[1]);
      // a little shift, never off the sky
      const dx = U.clamp((r() - 0.5) * 22, 30 - Math.min(...xs), 330 - Math.max(...xs)), dy = U.clamp((r() - 0.5) * 18, 62 - Math.min(...ys), 434 - Math.max(...ys));
      const at = (p) => { const [x, y] = tf(p); return [x + dx, y + dy]; };
      const pts = base.map(([x, y]) => ({ x: x + dx, y: y + dy }));
      const lines = pts.slice(1).map((p, i) => [pts[i], p]).concat(F.close.map(([a, b]) => [pts[a], pts[b]]));
      // each number sits where it is furthest from everything else
      const spots = [];
      pts.forEach((p) => {
        let best = null, score = -1e9;
        for (let q = 0; q < 16; q++) {
          const a = (q / 16) * TAU, x = p.x + Math.cos(a) * 19, y = p.y + Math.sin(a) * 19;
          let s = Math.min(x - 13, W - 13 - x, y - 42, 448 - y);
          for (const e of pts) if (e !== p) s = Math.min(s, PZ.dist(x, y, e.x, e.y) - 11);
          for (const [e, f] of lines) s = Math.min(s, segDist(x, y, e.x, e.y, f.x, f.y) + (e === p || f === p ? 2 : 0));
          for (const e of spots) s = Math.min(s, PZ.dist(x, y, e.x, e.y) - 14);
          if (s > score) { score = s; best = { x, y }; }
        }
        spots.push(best);
      });
      // a few stars that twinkle slowly, anywhere there is room
      const tw = [];
      for (let i = 0; i < 18; i++) {
        const x = 14 + r() * 332, y = 44 + r() * 400, ph = r() * TAU, sp = 0.5 + r() * 0.5, a = 0.25 + r() * 0.3, s = 0.8 + r() * 0.8;
        if (pts.every((p) => PZ.dist(x, y, p.x, p.y) > 30)) tw.push({ x, y, ph, sp, a, s });
      }
      const mid = { x: pts.reduce((a, p) => a + p.x, 0) / pts.length, y: pts.reduce((a, p) => a + p.y, 0) / pts.length };

      function sky(c) {
        const { x0, y0, x1, y1 } = S.bleed, rr = U.rng(deco);
        const g = c.createLinearGradient(0, Math.min(y0, -20), 0, 480);
        g.addColorStop(0, '#10163e'); g.addColorStop(0.42, '#1b2359'); g.addColorStop(0.78, '#343b7c'); g.addColorStop(1, '#6a5c97');
        c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
        // a faint band of far-off stars across the sky
        const hz = U.canvas(96, 150), hx = hz.getContext('2d');
        hx.scale(0.2, 0.2); hx.translate(240, 375); hx.rotate(-0.6);
        for (let i = 0; i < 12; i++) {
          const x = (rr() - 0.5) * 760, y = (rr() - 0.5) * 60, rad = 90 + rr() * 90;
          hx.save(); hx.translate(x, y); hx.scale(1, 0.46 + rr() * 0.2);
          const q = hx.createRadialGradient(0, 0, 0, 0, 0, rad); q.addColorStop(0, 'rgba(185,195,245,0.13)'); q.addColorStop(1, 'rgba(185,195,245,0)');
          hx.fillStyle = q; hx.beginPath(); hx.arc(0, 0, rad, 0, TAU); hx.fill(); hx.restore();
        }
        c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; c.drawImage(hz, -60, -125, 480, 750); c.restore();
        c.save(); c.translate(180, 250); c.rotate(-0.6);
        for (let i = 0; i < 90; i++) dot(c, (rr() - 0.5) * 560, (rr() + rr() - 1) * 66, 0.4 + rr() * 0.5, `rgba(230,235,255,${(0.2 + rr() * 0.35).toFixed(2)})`);
        c.restore();
        for (let i = 0; i < 80; i++) dot(c, x0 + rr() * (x1 - x0), y0 + rr() * (470 - y0), 0.4 + rr() * 0.7, `rgba(235,238,255,${(0.2 + rr() * 0.4).toFixed(2)})`);
        // the moon, a thin slice of it, out of the way
        const mx = 324, my = 30;
        halo(c, mx, my, 44, 0.4);
        c.fillStyle = '#fff3cf'; c.beginPath(); c.arc(mx, my, 13, 0, TAU); c.fill();
        const q = c.createLinearGradient(0, my - 16, 0, my + 16); q.addColorStop(0, '#141b47'); q.addColorStop(1, '#172052');
        c.fillStyle = q; c.beginPath(); c.arc(mx - 6, my - 3, 11.4, 0, TAU); c.fill();
      }
      function hill(c) {
        const { x0, x1, y1 } = S.bleed;
        c.fillStyle = '#2e3370'; c.beginPath(); c.moveTo(x0, 476); c.quadraticCurveTo(70, 450, 150, 470); c.quadraticCurveTo(240, 492, x1, 456); c.lineTo(x1, y1); c.lineTo(x0, y1); c.closePath(); c.fill();
        // a cottage on the far hill, with a light on
        const hx = 86, hy = 460;
        c.fillStyle = '#1d2152'; c.fillRect(hx - 16, hy - 12, 32, 16); c.beginPath(); c.moveTo(hx - 21, hy - 11); c.lineTo(hx, hy - 27); c.lineTo(hx + 21, hy - 11); c.closePath(); c.fill();
        c.fillRect(hx + 7, hy - 28, 5, 12);
        c.fillStyle = '#ffd98a'; c.fillRect(hx - 10, hy - 7, 6, 6); c.fillRect(hx + 4, hy - 7, 6, 6);
        halo(c, hx, hy - 4, 24, 0.3);
        c.fillStyle = '#1b1f4f'; c.beginPath(); c.moveTo(x0, 520); c.quadraticCurveTo(110, 474, 214, 506); c.quadraticCurveTo(290, 530, x1, 492); c.lineTo(x1, y1); c.lineTo(x0, y1); c.closePath(); c.fill();
        // an old tree on the near hill
        const tx = 0, ty = 0;
        c.save(); c.translate(298, 520); c.scale(0.8, 0.8);
        c.strokeStyle = '#12153b'; c.lineCap = 'round'; c.lineWidth = 8; c.beginPath(); c.moveTo(tx, ty + 8); c.quadraticCurveTo(tx - 2, ty - 26, tx + 6, ty - 46); c.stroke();
        c.lineWidth = 4; c.beginPath(); c.moveTo(tx, ty - 22); c.quadraticCurveTo(tx - 18, ty - 34, tx - 30, ty - 40); c.moveTo(tx + 3, ty - 30); c.quadraticCurveTo(tx + 20, ty - 40, tx + 30, ty - 50); c.stroke();
        c.fillStyle = '#12153b';
        for (const [a, b, q] of [[-30, -52, 19], [-8, -66, 24], [18, -60, 21], [34, -46, 15], [-16, -44, 16]]) { c.beginPath(); c.arc(tx + a, ty + b, q, 0, TAU); c.fill(); }
        c.restore();
        // the fence along the top of the near hill
        c.strokeStyle = '#12153b'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(x0, 513); c.quadraticCurveTo(60, 494, 150, 490); c.stroke();
        for (let x = 16; x < 150; x += 26) { const y = 514 - (x / 150) * 26; c.beginPath(); c.moveTo(x, y - 10); c.lineTo(x, y + 10); c.stroke(); }
      }
      function cove(c) {
        const { x0, x1, y1 } = S.bleed;
        const g = c.createLinearGradient(0, 464, 0, 560); g.addColorStop(0, '#3a4286'); g.addColorStop(0.45, '#232a66'); g.addColorStop(1, '#151a4a');
        c.fillStyle = g; c.fillRect(x0, 464, x1 - x0, y1 - 464);
        // the moon's path on the water
        const rr = U.rng(deco + 7);
        for (let i = 0; i < 30; i++) { const y = 468 + rr() * 74, w = 8 + rr() * 26, x = 150 + (rr() - 0.5) * (30 + (y - 464) * 0.9); c.fillStyle = `rgba(255,240,200,${(0.1 + rr() * 0.22).toFixed(2)})`; c.fillRect(x - w / 2, y, w, 1.5); }
        // the rocks and the lighthouse
        const lx = 290;
        c.save(); c.translate(0, 14);
        c.fillStyle = '#1a1f52'; c.beginPath(); c.moveTo(lx - 15, 500); c.lineTo(lx - 9, 446); c.lineTo(lx + 9, 446); c.lineTo(lx + 15, 500); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.09)'; c.beginPath(); c.moveTo(lx - 13, 484); c.lineTo(lx - 11.6, 468); c.lineTo(lx + 11.6, 468); c.lineTo(lx + 13, 484); c.closePath(); c.fill();
        c.fillStyle = '#12163f'; c.fillRect(lx - 12, 442, 24, 4.4);
        c.fillStyle = '#ffe2a0'; c.fillRect(lx - 6, 431, 12, 11);
        c.fillStyle = '#12163f'; c.fillRect(lx - 7.4, 431, 1.6, 11); c.fillRect(lx + 5.8, 431, 1.6, 11); c.beginPath(); c.moveTo(lx - 9, 431); c.lineTo(lx, 421); c.lineTo(lx + 9, 431); c.closePath(); c.fill();
        halo(c, lx, 437, 40, 0.5);
        c.restore();
        c.fillStyle = '#12163f'; c.beginPath(); c.moveTo(214, 524); c.quadraticCurveTo(238, 496, 268, 498); c.quadraticCurveTo(292, 486, 318, 496); c.quadraticCurveTo(x1 - 10, 500, x1, 496); c.lineTo(x1, 540); c.lineTo(214, 540); c.closePath(); c.fill();
        // the sand, and a beach hut with its door shut for the night
        c.fillStyle = '#1b1f4f'; c.beginPath(); c.moveTo(x0, 524); c.quadraticCurveTo(90, 516, 180, 538); c.quadraticCurveTo(260, 552, x1, 536); c.lineTo(x1, y1); c.lineTo(x0, y1); c.closePath(); c.fill();
        const bx = 62, by = 526;
        c.fillStyle = '#141840'; c.fillRect(bx - 17, by - 28, 34, 30); c.beginPath(); c.moveTo(bx - 21, by - 27); c.lineTo(bx, by - 42); c.lineTo(bx + 21, by - 27); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.08)'; for (let i = 0; i < 3; i++) c.fillRect(bx - 15 + i * 11, by - 27, 4, 27);
        c.fillStyle = '#ffd98a'; c.fillRect(bx - 3.5, by - 21, 7, 7); halo(c, bx, by - 17, 20, 0.28);
      }
      function canal(c) {
        const { x0, x1, y1 } = S.bleed;
        // the far bank and a humpback bridge
        c.fillStyle = '#2b3069'; c.beginPath(); c.moveTo(x0, 474); c.quadraticCurveTo(120, 456, x1, 468); c.lineTo(x1, 520); c.lineTo(x0, 520); c.closePath(); c.fill();
        c.fillStyle = '#1e2257'; c.beginPath(); c.moveTo(196, 494); c.quadraticCurveTo(262, 438, 342, 492); c.lineTo(342, 512); c.lineTo(196, 512); c.closePath(); c.fill();
        c.fillStyle = '#39417f'; c.beginPath(); c.moveTo(232, 512); c.quadraticCurveTo(268, 466, 306, 512); c.closePath(); c.fill();
        // the water
        const g = c.createLinearGradient(0, 500, 0, 590); g.addColorStop(0, '#39417f'); g.addColorStop(1, '#171c4e');
        c.fillStyle = g; c.fillRect(x0, 506, x1 - x0, y1 - 506);
        const rr = U.rng(deco + 11);
        for (let i = 0; i < 26; i++) { const y = 512 + rr() * 76, w = 10 + rr() * 34; c.fillStyle = `rgba(230,225,255,${(0.05 + rr() * 0.12).toFixed(2)})`; c.fillRect(x0 + rr() * (x1 - x0), y, w, 1.3); }
        // the lock gate with its long balance beam
        c.fillStyle = '#12163f'; c.fillRect(20, 460, 62, 52);
        c.fillStyle = '#1c2155'; for (let i = 0; i < 3; i++) c.fillRect(24, 468 + i * 13, 54, 3);
        c.strokeStyle = '#12163f'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, 450); c.lineTo(112, 462); c.stroke();
        c.strokeStyle = '#e8e4f4'; c.lineWidth = 7; c.lineCap = 'butt'; c.beginPath(); c.moveTo(100, 460.8); c.lineTo(114, 462.2); c.stroke();
        // the narrowboat, tied up for the night, its portholes lit
        const by = 528;
        c.fillStyle = '#12163f'; c.beginPath(); c.moveTo(96, by - 12); c.lineTo(322, by - 12); c.quadraticCurveTo(344, by - 12, 352, by - 26); c.lineTo(354, by - 12); c.quadraticCurveTo(350, by + 4, 332, by + 4); c.lineTo(108, by + 4); c.closePath(); c.fill();
        c.fillStyle = '#1d2256'; PZ.rr(c, 128, by - 33, 178, 22, 4); c.fill();
        c.fillStyle = '#12163f'; c.fillRect(146, by - 45, 7, 13);
        c.strokeStyle = '#12163f'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(102, by - 12); c.lineTo(84, by - 30); c.stroke();
        for (const x of [160, 200, 240, 280]) {
          dot(c, x, by - 22, 4.2, '#ffd98a'); halo(c, x, by - 22, 15, 0.3);
          for (let j = 0; j < 3; j++) { c.fillStyle = `rgba(255,217,138,${(0.34 - j * 0.09).toFixed(2)})`; c.fillRect(x - 5 + j, by + 9 + j * 6, 10 - j * 2, 1.6); }
        }
      }
      return {
        P: pts, crop: { x: 0, y: U.clamp(mid.y - 180, 40, 100), w: 360, h: 360 }, title: F.name,
        decor(c) {
          sky(c);
          if (where === 'cove') cove(c); else if (where === 'canal') canal(c); else hill(c);
          PZ.text(c, letters ? 'Join the stars from A onwards' : 'Join the stars in order', W / 2, 22, { size: 13, color: '#dfe3f6', maxW: 300 });
        },
        draw(c, t, still) {
          for (const s of tw) dot(c, s.x, s.y, s.s, `rgba(240,242,255,${(still ? s.a : s.a * (0.55 + 0.45 * Math.sin(t * s.sp + s.ph))).toFixed(3)})`);
          const whole = solved(), k = whole ? (still ? 1 : U.smooth(0, 1.3, shine)) : 0;
          if (k > 0) halo(c, mid.x, mid.y, 215, 0.22 * k);
          for (let i = 0; i < n; i++) strand(c, P[i].x, P[i].y, P[i + 1].x, P[i + 1].y, 1);
          if (k > 0) {
            for (const [a, b] of F.close) strand(c, P[a].x, P[a].y, P[b].x, P[b].y, k * 0.8);
            for (const line of F.more) {
              c.strokeStyle = `rgba(255,236,190,${(0.6 * k).toFixed(3)})`; c.lineWidth = 1.4; c.lineCap = 'round'; c.lineJoin = 'round';
              const ps = line.map(at);
              c.beginPath(); c.moveTo(ps[0][0], ps[0][1]);
              if (ps.length === 3) c.quadraticCurveTo(ps[1][0], ps[1][1], ps[2][0], ps[2][1]); else for (const q of ps.slice(1)) c.lineTo(q[0], q[1]);
              c.stroke();
            }
            for (const p of F.dots) { const [x, y] = at(p); dot(c, x, y, 2.6, `rgba(255,240,200,${k.toFixed(3)})`); }
          }
          if (fade) strand(c, fade.ax, fade.ay, fade.bx, fade.by, fade.a * 0.8);
          if (held && !still && !whole) { strand(c, P[n].x, P[n].y, held.x, held.y, 1); halo(c, held.x, held.y, 14, 0.7); }
          // the stars themselves
          P.forEach((p, i) => {
            const on = i <= n, next = i === n + 1, q = still ? 1 : pop[i];
            if (on) {
              const b = 1 + (q < 1 ? 0.5 * Math.sin(q * Math.PI) : 0) + (whole && !still ? 0.1 * Math.sin(t * 1.4 + i) * k : 0);
              halo(c, p.x, p.y, 21 * b, 0.55 + 0.25 * k);
              star(c, p.x, p.y, 8.6 * b, '#ffdf8c');
            } else if (next) {
              const b = still ? 0.5 : 0.5 + 0.5 * Math.sin(t * 2.2);
              halo(c, p.x, p.y, 18 + 5 * b, 0.34 + 0.18 * b);
              c.strokeStyle = `rgba(255,240,200,${(0.42 + 0.3 * b).toFixed(3)})`; c.lineWidth = 1.6; c.beginPath(); c.arc(p.x, p.y, 14 + 2.4 * b, 0, TAU); c.stroke();
              star(c, p.x, p.y, 8.4 + 1.2 * b, '#fff6dc');
            } else {
              halo(c, p.x, p.y, 13, 0.14);
              star(c, p.x, p.y, 7, '#dbe2fb');
            }
          });
          P.forEach((p, i) => {
            const l = spots[i];
            if (i <= n) { if (k < 1) inked(c, name(i), l.x, l.y, 13.5, '#f1ddb0', 0.62 * (1 - k)); } else inked(c, name(i), l.x, l.y, i === n + 1 ? 17 : 15, i === n + 1 ? '#fff0c4' : '#e6eafb');
          });
          if (!still && hintT > 0 && !whole) PZ.glow(c, P[n + 1].x, P[n + 1].y, 20, t);
          if (whole) pill(c, F.name, 563, 17, 'rgba(14,18,54,0.72)', 'rgba(255,232,180,0.5)', '#fff0c4', still ? 1 : U.smooth(0.3, 1.3, shine));
          else pill(c, `Next star: ${name(n + 1)}`, 563, 14, 'rgba(14,18,54,0.66)', 'rgba(255,232,180,0.3)', '#f4ecd8');
        },
      };
    }

    // -------------------------------------------------------- the torn blanket
    function tearView() {
      const m = 8 + ((r() * 5) | 0), rescue = where === 'rescue';
      const amp = 12 + r() * 12, ph = r() * TAU, dir = r() < 0.5 ? 1 : -1, y0 = rescue ? 74 : 78, y1 = rescue ? 414 : 422, first = r() < 0.5 ? 1 : -1;
      const at = (u) => [180 + dir * amp * Math.sin(u * 4.6 + ph), y0 + (y1 - y0) * u];
      const nrm = (u) => { const [ax, ay] = at(u - 0.01), [bx, by] = at(u + 0.01), d = Math.hypot(bx - ax, by - ay); return [(by - ay) / d, -(bx - ax) / d]; };
      const pts = [];
      for (let k = 0; k < m; k++) {
        const u = 0.07 + (0.86 * k) / (m - 1), [x, y] = at(u), [nx, ny] = nrm(u), s = (k % 2 ? 1 : -1) * first;
        pts.push({ x: x + nx * HALF * s, y: y + ny * HALF * s, u, s, nx, ny, mx: x, my: y });
      }
      const tie = new Array(m - 1).fill(0);   // how far each stitch has pulled the tear shut, 0..1
      const wob = [r() * TAU, r() * TAU, 3 + r() * 2];
      const open = (u) => TEAR * Math.pow(Math.sin(Math.PI * U.clamp(u, 0, 1)), 0.55) * (0.86 + 0.14 * Math.sin(u * 19 + wob[0]) * Math.sin(u * 7 + wob[1]));
      const shut = (k) => Math.max(tie[k - 1] || 0, tie[k] || 0);
      const closed = (u) => {
        if (u <= pts[0].u) return shut(0);
        if (u >= pts[m - 1].u) return shut(m - 1);
        const k = Math.min(m - 2, Math.floor(((u - pts[0].u) / (pts[m - 1].u - pts[0].u)) * (m - 1)));
        return U.lerp(shut(k), shut(k + 1), U.smooth(0, 1, (u - pts[k].u) / (pts[k + 1].u - pts[k].u)));
      };
      const samples = [];
      for (let i = 0; i <= 56; i++) { const u = i / 56, [x, y] = at(u), [nx, ny] = nrm(u); samples.push({ u, x, y, nx, ny }); }
      // loose threads along both edges of the tear
      const frays = [];
      for (let i = 0; i < 64; i++) frays.push({ u: 0.05 + r() * 0.9, s: r() < 0.5 ? 1 : -1, len: 3 + r() * 5, tilt: (r() - 0.5) * 1.4, col: r() < 0.5 ? 'rgba(255,250,238,0.85)' : 'rgba(205,190,170,0.85)' });
      const thread = rescue ? '#f2c84b' : '#c9474f', motif = rescue ? 'paw' : r() < 0.5 ? 'heart' : 'flower', spot = at(0.5), turn = (r() - 0.5) * 0.26;

      // ----------------------------------------------- what the blanket lies on
      function patchwork(c, x, y, w, h, col, kind) {
        c.fillStyle = col; c.fillRect(x, y, w, h);
        c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
        const ink = U.rgba(U.shade(col, -0.2), 0.5), lite = U.rgba(U.shade(col, 0.55), 0.8);
        if (kind === 1) { for (let j = 0; j * 13 < h + 13; j++) for (let i = 0; i * 13 < w + 13; i++) dot(c, x + i * 13 + (j % 2 ? 6.5 : 0), y + j * 13, 1.8, lite); }
        else if (kind === 2) { c.fillStyle = ink; for (let i = 0; i * 11 < w; i++) c.fillRect(x + i * 11 + 2, y, 3.4, h); }
        else if (kind === 3) { c.fillStyle = ink; for (let i = 0; i * 14 < w; i += 2) c.fillRect(x + i * 14, y, 14, h); for (let j = 0; j * 14 < h; j += 2) c.fillRect(x, y + j * 14, w, 14); }
        else if (kind === 4) {
          for (let j = 0; j * 20 < h + 10; j++) for (let i = 0; i * 20 < w + 10; i++) {
            const px = x + 6 + i * 20 + (j % 2 ? 10 : 0), py = y + 8 + j * 20;
            for (let q = 0; q < 5; q++) { const a = (q / 5) * TAU; dot(c, px + Math.cos(a) * 2.8, py + Math.sin(a) * 2.8, 1.7, lite); }
            dot(c, px, py, 1.3, ink);
          }
        }
        c.restore();
      }
      function quilt(c) {
        const { x0, y0, x1, y1 } = S.bleed, rr = U.rng(deco);
        // the back room: striped paper in dusty rose above a wooden table
        c.fillStyle = '#f0d6d0'; c.fillRect(x0, y0, x1 - x0, 46 - y0);
        c.fillStyle = 'rgba(205,140,140,0.2)'; for (let x = Math.floor(x0 / 18) * 18; x < x1; x += 18) c.fillRect(x, y0, 7, 46 - y0);
        c.fillStyle = '#c99e6c'; c.fillRect(x0, 40, x1 - x0, y1 - 40);
        c.fillStyle = 'rgba(90,55,25,0.13)'; for (let y = 108; y < y1; y += 66) c.fillRect(x0, y, x1 - x0, 1.6);
        c.strokeStyle = 'rgba(110,70,35,0.15)'; c.lineWidth = 0.9;
        for (let i = 0; i < 90; i++) { const x = x0 + rr() * (x1 - x0), y = 44 + rr() * (y1 - 44), l = 20 + rr() * 60; c.beginPath(); c.moveTo(x, y); c.lineTo(x + l, y + (rr() - 0.5) * 2); c.stroke(); }
        c.fillStyle = 'rgba(60,40,20,0.22)'; c.fillRect(x0, 40, x1 - x0, 6);
        // the quilt, a little askew
        const qx = 14, qy = 50, qw = 332, qh = 398, cols = 5, rows = 6, pw = qw / cols, ph2 = qh / rows;
        c.fillStyle = 'rgba(60,40,20,0.25)'; PZ.rr(c, qx + 3, qy + 5, qw, qh, 10); c.fill();
        const tints = ['#efb4ae', '#c6dcb4', '#f2d88a', '#a6d3d4', '#d9cdea', '#f4ecdc'];
        c.save(); PZ.rr(c, qx, qy, qw, qh, 10); c.clip();
        let lastCol = -1;
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
          let col = (rr() * tints.length) | 0; if (col === lastCol) col = (col + 1) % tints.length; lastCol = col;
          patchwork(c, qx + i * pw, qy + j * ph2, pw + 0.6, ph2 + 0.6, tints[col], (rr() * 5) | 0);
        }
        // pale wash so the numbers and the stitches come first
        c.fillStyle = 'rgba(255,248,236,0.26)'; c.fillRect(qx, qy, qw, qh);
        c.strokeStyle = 'rgba(255,255,255,0.72)'; c.lineWidth = 1.2; c.setLineDash([5, 4]);
        for (let i = 1; i < cols; i++) seg(c, qx + i * pw, qy, qx + i * pw, qy + qh);
        for (let j = 1; j < rows; j++) seg(c, qx, qy + j * ph2, qx + qw, qy + j * ph2);
        c.setLineDash([]);
        c.restore();
        c.strokeStyle = '#d9a3a6'; c.lineWidth = 6; PZ.rr(c, qx + 2, qy + 2, qw - 4, qh - 4, 9); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 1; c.setLineDash([3.4, 3]); PZ.rr(c, qx + 2, qy + 2, qw - 4, qh - 4, 9); c.stroke(); c.setLineDash([]);
        sewingThings(c);
      }
      // a reel of thread, a thimble and a pair of little scissors on the table
      function sewingThings(c) {
        const rx = 64, ry = 500;
        PZ.shadow(c, rx + 5, ry + 25, 32, 7, 0.22);
        c.fillStyle = '#ecd2a6'; PZ.rr(c, rx - 26, ry - 28, 52, 8, 3); c.fill(); PZ.rr(c, rx - 26, ry + 18, 52, 8, 3); c.fill();
        c.fillStyle = '#c29a62'; c.fillRect(rx - 25, ry - 22, 50, 2); c.fillRect(rx - 25, ry + 24, 50, 2);
        c.fillStyle = thread; c.fillRect(rx - 21, ry - 20, 42, 38);
        c.strokeStyle = U.rgba(U.shade(thread, -0.3), 0.5); c.lineWidth = 1;
        for (let y = ry - 18; y < ry + 18; y += 3) seg(c, rx - 21, y, rx + 21, y + 1.4);
        c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(rx - 15, ry - 20, 7, 38);
        // the thimble
        const hx = 136, hy = 524;
        PZ.shadow(c, hx + 3, hy + 3, 15, 4, 0.22);
        const g = c.createLinearGradient(hx - 13, 0, hx + 13, 0); g.addColorStop(0, '#d8dde2'); g.addColorStop(0.45, '#f6f8fa'); g.addColorStop(1, '#a4acb4');
        c.fillStyle = g; c.beginPath(); c.moveTo(hx - 12, hy); c.lineTo(hx - 9, hy - 22); c.quadraticCurveTo(hx, hy - 30, hx + 9, hy - 22); c.lineTo(hx + 12, hy); c.closePath(); c.fill();
        c.fillStyle = 'rgba(90,100,110,0.3)'; for (let j = 0; j < 3; j++) for (let i = -2; i <= 2; i++) dot(c, hx + i * (4.4 - j * 0.5), hy - 8 - j * 5.6, 0.9, 'rgba(90,100,110,0.45)');
        c.fillStyle = '#b6bec6'; c.fillRect(hx - 12.5, hy - 3, 25, 3);
        // the scissors
        c.save(); c.translate(294, 512); c.rotate(-0.5);
        const bows = (dx, dy, col, steel) => {
          c.lineCap = 'round'; c.strokeStyle = steel; c.lineWidth = 4.4;
          seg(c, -9 + dx, 12 + dy, 16 + dx, -26 + dy); seg(c, 9 + dx, 12 + dy, -16 + dx, -26 + dy);
          c.strokeStyle = col; c.lineWidth = 4.2;
          c.beginPath(); c.ellipse(-13 + dx, 21 + dy, 8, 10.4, 0.3, 0, TAU); c.stroke(); c.beginPath(); c.ellipse(13 + dx, 21 + dy, 8, 10.4, -0.3, 0, TAU); c.stroke();
        };
        bows(2.4, 3, 'rgba(60,40,20,0.2)', 'rgba(60,40,20,0.2)');
        bows(0, 0, '#c99a2e', '#8d97a1');
        dot(c, 0, -1, 2.4, '#5d6670');
        c.restore();
      }
      // the rescue: a dog's blanket in a wicker basket, the dog asleep beside it
      function basket(c) {
        const { x0, y0, x1, y1 } = S.bleed, rr = U.rng(deco);
        c.fillStyle = '#b9cdb0'; c.fillRect(x0, y0, x1 - x0, 46 - y0);
        c.fillStyle = 'rgba(60,80,50,0.2)'; for (let x = Math.floor(x0 / 26) * 26; x < x1; x += 26) c.fillRect(x, y0, 1.4, 46 - y0);
        // the flagstones of the farmhouse kitchen
        c.fillStyle = '#c9b89e'; c.fillRect(x0, 40, x1 - x0, y1 - 40);
        c.strokeStyle = 'rgba(100,80,60,0.28)'; c.lineWidth = 1.4;
        for (let j = 0; 40 + j * 54 < y1; j++) { const y = 40 + j * 54; seg(c, x0, y, x1, y); for (let x = Math.floor(x0 / 76) * 76 + (j % 2 ? 38 : 0); x < x1; x += 76) seg(c, x, y, x, y + 54); }
        for (let i = 0; i < 26; i++) { c.fillStyle = 'rgba(120,100,70,0.05)'; c.beginPath(); c.ellipse(x0 + rr() * (x1 - x0), 44 + rr() * (y1 - 44), 12 + rr() * 26, 6 + rr() * 12, rr() * 3, 0, TAU); c.fill(); }
        c.fillStyle = 'rgba(60,40,20,0.2)'; c.fillRect(x0, 40, x1 - x0, 6);
        // the basket
        const bx = 8, by = 48, bw = 344, bh = 392;
        c.fillStyle = 'rgba(60,40,20,0.28)'; PZ.rr(c, bx + 3, by + 6, bw, bh, 44); c.fill();
        c.fillStyle = '#c9a06a'; PZ.rr(c, bx, by, bw, bh, 44); c.fill();
        c.save(); PZ.rr(c, bx, by, bw, bh, 44); c.clip();
        c.strokeStyle = 'rgba(110,75,40,0.5)'; c.lineWidth = 2.2;
        for (let i = 0; i < 112; i++) {
          const q = i / 112, per = 2 * (bw + bh), d = q * per;
          let x, y, a;
          if (d < bw) { x = bx + d; y = by + 9; a = 0; } else if (d < bw + bh) { x = bx + bw - 9; y = by + d - bw; a = 1; } else if (d < 2 * bw + bh) { x = bx + bw - (d - bw - bh); y = by + bh - 9; a = 0; } else { x = bx + 9; y = by + bh - (d - 2 * bw - bh); a = 1; }
          if (x < bx + 12 && y < by + 12 || x > bx + bw - 12 && y < by + 12 || x < bx + 12 && y > by + bh - 12 || x > bx + bw - 12 && y > by + bh - 12) continue;
          if (a) seg(c, x - 6, y + (i % 2 ? -2 : 2), x + 6, y + (i % 2 ? 2 : -2)); else seg(c, x + (i % 2 ? -2 : 2), y - 6, x + (i % 2 ? 2 : -2), y + 6);
        }
        c.restore();
        c.strokeStyle = '#a97c49'; c.lineWidth = 2.4; PZ.rr(c, bx + 16, by + 16, bw - 32, bh - 32, 30); c.stroke();
        // the tartan blanket, with paw prints woven in
        const qx = bx + 20, qy = by + 20, qw = bw - 40, qh = bh - 40;
        c.save(); PZ.rr(c, qx, qy, qw, qh, 26); c.clip();
        c.fillStyle = '#8fc0b6'; c.fillRect(qx, qy, qw, qh);
        c.fillStyle = 'rgba(62,112,110,0.32)'; for (let x = qx - 10; x < qx + qw; x += 84) c.fillRect(x, qy, 40, qh); for (let y = qy - 10; y < qy + qh; y += 84) c.fillRect(qx, y, qw, 40);
        c.fillStyle = 'rgba(255,250,235,0.32)'; for (let x = qx + 54; x < qx + qw; x += 84) c.fillRect(x, qy, 4, qh); for (let y = qy + 54; y < qy + qh; y += 84) c.fillRect(qx, y, qw, 4);
        c.fillStyle = 'rgba(190,96,62,0.3)'; for (let x = qx + 12; x < qx + qw; x += 84) c.fillRect(x, qy, 2.4, qh); for (let y = qy + 12; y < qy + qh; y += 84) c.fillRect(qx, y, qw, 2.4);
        c.fillStyle = 'rgba(255,250,235,0.26)'; c.fillRect(qx, qy, qw, qh);
        for (const [px, py] of [[62, 104], [302, 92], [70, 214], [298, 200], [58, 330], [304, 316], [128, 386], [240, 382], [120, 70], [238, 72]]) pawPrint(c, px, py, 8.4, 'rgba(60,110,106,0.34)');
        c.restore();
        c.strokeStyle = 'rgba(70,110,104,0.4)'; c.lineWidth = 2; PZ.rr(c, qx + 1, qy + 1, qw - 2, qh - 2, 25); c.stroke();
        sleepingDog(c);
      }
      function pawPrint(c, x, y, s, col) {
        c.fillStyle = col;
        c.beginPath(); c.ellipse(x, y + s * 0.3, s * 0.72, s * 0.56, 0, 0, TAU); c.fill();
        for (const [dx, dy, q] of [[-0.74, -0.34, 0.27], [-0.27, -0.8, 0.29], [0.27, -0.8, 0.29], [0.74, -0.34, 0.27]]) { c.beginPath(); c.ellipse(x + dx * s, y + dy * s, s * q, s * q * 1.25, dx * 0.5, 0, TAU); c.fill(); }
      }
      // waiting for nothing at all
      function sleepingDog(c) {
        const x = 252, y = 530, fur = '#c9a27a', dk = '#a37c56', lt = '#e6cba8';
        c.fillStyle = 'rgba(60,40,20,0.2)'; c.beginPath(); c.ellipse(x + 4, y + 30, 74, 11, 0, 0, TAU); c.fill();
        c.fillStyle = fur; c.beginPath(); c.ellipse(x + 8, y + 6, 58, 25, 0, 0, TAU); c.fill();
        c.fillStyle = lt; c.beginPath(); c.ellipse(x + 8, y + 15, 42, 13, 0, 0, TAU); c.fill();
        c.strokeStyle = fur; c.lineWidth = 11; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 62, y + 18); c.quadraticCurveTo(x + 76, y + 28, x + 50, y + 30); c.stroke();
        c.fillStyle = fur; c.beginPath(); c.ellipse(x - 46, y + 8, 24, 21, -0.2, 0, TAU); c.fill();
        c.fillStyle = dk; c.beginPath(); c.ellipse(x - 58, y - 2, 11, 19, 0.55, 0, TAU); c.fill(); c.beginPath(); c.ellipse(x - 28, y - 7, 9, 16, -0.7, 0, TAU); c.fill();
        c.fillStyle = lt; c.beginPath(); c.ellipse(x - 58, y + 19, 16, 10, 0.1, 0, TAU); c.fill();
        dot(c, x - 70, y + 15, 3.6, '#4a3528');
        c.strokeStyle = '#4a3528'; c.lineWidth = 1.5; c.lineCap = 'round';
        c.beginPath(); c.moveTo(x - 60, y + 1); c.quadraticCurveTo(x - 56, y + 4, x - 52, y + 1); c.moveTo(x - 44, y - 2); c.quadraticCurveTo(x - 40, y + 1, x - 36, y - 2); c.stroke();
        c.strokeStyle = 'rgba(120,110,150,0.65)'; c.lineWidth = 1.6; c.lineJoin = 'round';
        c.beginPath(); c.moveTo(x + 4, y - 34); c.lineTo(x + 10, y - 34); c.lineTo(x + 4, y - 27); c.lineTo(x + 10, y - 27); c.stroke();
        c.beginPath(); c.moveTo(x + 18, y - 49); c.lineTo(x + 23, y - 49); c.lineTo(x + 18, y - 43); c.lineTo(x + 23, y - 43); c.stroke();
        // a chewed ball
        const bx = 78, by = 534;
        c.fillStyle = 'rgba(60,40,20,0.2)'; c.beginPath(); c.ellipse(bx + 3, by + 15, 19, 5, 0, 0, TAU); c.fill();
        dot(c, bx, by, 17, '#e2574c'); c.strokeStyle = '#fff3cf'; c.lineWidth = 3; c.beginPath(); c.arc(bx, by, 17, 0.4, 1.9); c.stroke(); c.beginPath(); c.arc(bx, by, 17, 3.4, 5); c.stroke();
        dot(c, bx - 5, by - 6, 3.4, 'rgba(255,255,255,0.45)');
      }

      // ------------------------------------------------------- the needlework
      // the tear itself, narrower wherever the stitches have pulled it shut
      function edge(c, k, sign) {
        for (let i = 0; i < samples.length; i++) {
          const j = sign > 0 ? i : samples.length - 1 - i, s = samples[j], w = open(s.u) * (1 - 0.9 * closed(s.u)) * k;
          const x = s.x + s.nx * w * sign, y = s.y + s.ny * w * sign;
          if (i === 0 && sign > 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
      }
      function tear(c) {
        c.beginPath(); edge(c, 1, 1); edge(c, 1, -1); c.closePath();
        c.fillStyle = 'rgba(50,34,28,0.2)'; c.save(); c.translate(0.8, 1.4); c.fill(); c.restore();
        c.fillStyle = '#6b5344'; c.fill();
        c.beginPath(); edge(c, 0.7, 1); edge(c, 0.7, -1); c.closePath();
        c.fillStyle = '#efe6d4'; c.fill();
        c.beginPath(); edge(c, 1, 1); edge(c, 1, -1); c.closePath();
        c.strokeStyle = 'rgba(70,48,36,0.55)'; c.lineWidth = 1; c.lineJoin = 'round'; c.stroke();
        // loose threads, only where the tear is still open
        c.lineWidth = 1; c.lineCap = 'round';
        for (const f of frays) {
          const w = open(f.u) * (1 - 0.9 * closed(f.u));
          if (w < 3) continue;
          const [x, y] = at(f.u), [nx, ny] = nrm(f.u), ex = x + nx * w * f.s, ey = y + ny * w * f.s;
          c.strokeStyle = f.col;
          c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex - nx * f.s * f.len + ny * f.tilt * f.len, ey - ny * f.s * f.len - nx * f.tilt * f.len); c.stroke();
        }
      }
      // a hole, pulled in towards the tear once its stitch is done
      const holeAt = (i) => { const p = pts[i], k = 7 * shut(i); return [p.x - p.nx * p.s * k, p.y - p.ny * p.s * k]; };
      function stitchLine(c, ax, ay, bx, by, wid, a = 1) {
        c.lineCap = 'round';
        c.strokeStyle = `rgba(50,30,24,${(0.26 * a).toFixed(3)})`; c.lineWidth = wid + 1.4; seg(c, ax + 0.8, ay + 1.5, bx + 0.8, by + 1.5);
        c.strokeStyle = U.rgba(thread, a); c.lineWidth = wid; seg(c, ax, ay, bx, by);
        c.strokeStyle = `rgba(255,255,255,${(0.34 * a).toFixed(3)})`; c.lineWidth = wid * 0.32; seg(c, ax - 0.5, ay - 0.5, bx - 0.5, by - 0.5);
      }
      function hole(c, x, y) {
        dot(c, x, y, 6.2, 'rgba(255,250,238,0.75)'); dot(c, x, y, 4.2, '#4b3a30');
        c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 0.8; c.beginPath(); c.arc(x, y, 4.4, 3.4, 5.4); c.stroke();
      }
      // the needle, its tip at x, y and its eye up and to the right
      function needle(c, x, y, ang) {
        const L = 54;
        c.save(); c.translate(x, y); c.rotate(ang);
        c.fillStyle = 'rgba(50,30,24,0.22)'; c.save(); c.translate(1.4, 2.6); c.beginPath(); c.moveTo(0, 0); c.lineTo(L, -2); c.lineTo(L, 2); c.closePath(); c.fill(); c.restore();
        const g = c.createLinearGradient(0, -2, 0, 2); g.addColorStop(0, '#f6f8fa'); g.addColorStop(0.5, '#c5ccd3'); g.addColorStop(1, '#8c959e');
        c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.lineTo(L - 2, -2.1); c.quadraticCurveTo(L + 2.4, 0, L - 2, 2.1); c.closePath(); c.fill();
        c.fillStyle = '#3f4a52'; c.beginPath(); c.ellipse(L - 5.4, 0, 3, 0.9, 0, 0, TAU); c.fill();
        c.restore();
        return [x + Math.cos(ang) * (L - 5.4), y + Math.sin(ang) * (L - 5.4)];
      }
      function loose(c, ax, ay, bx, by) {
        // the thread hangs in a soft curve from the hole to the eye of the needle
        const mx = (ax + bx) / 2, my = (ay + by) / 2 + Math.min(16, PZ.dist(ax, ay, bx, by) * 0.14);
        c.lineCap = 'round';
        c.strokeStyle = 'rgba(50,30,24,0.22)'; c.lineWidth = 3.2; c.beginPath(); c.moveTo(ax + 0.8, ay + 1.5); c.quadraticCurveTo(mx + 0.8, my + 1.5, bx + 0.8, by + 1.5); c.stroke();
        c.strokeStyle = thread; c.lineWidth = 2.4; c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo(mx, my, bx, by); c.stroke();
      }
      // the mended patch, with its little embroidery
      function patch(c, k) {
        const s = 92, x = spot[0], y = spot[1];
        c.save(); c.translate(x, y); c.rotate(turn); c.scale(k, k);
        c.fillStyle = 'rgba(50,30,24,0.24)'; PZ.rr(c, -s / 2 + 2, -s / 2 + 4, s, s, 12); c.fill();
        c.fillStyle = rescue ? '#f6e6c8' : '#f8efe0'; PZ.rr(c, -s / 2, -s / 2, s, s, 12); c.fill();
        c.strokeStyle = 'rgba(150,120,90,0.12)'; c.lineWidth = 0.8;
        for (let i = -44; i <= 44; i += 3.2) { seg(c, i, -s / 2 + 3, i, s / 2 - 3); seg(c, -s / 2 + 3, i, s / 2 - 3, i); }
        // blanket stitch all the way round
        c.strokeStyle = thread; c.lineWidth = 2.2; c.lineCap = 'round';
        const e = s / 2 - 2.5, inner = e - 8;
        for (let i = 0; i < 9; i++) {
          const q = -e + 7 + (i * (2 * e - 14)) / 8;
          seg(c, q, -e, q, -inner); seg(c, q, e, q, inner); seg(c, -e, q, -inner, q); seg(c, e, q, inner, q);
        }
        c.lineWidth = 1.4; c.strokeStyle = U.rgba(thread, 0.85); PZ.rr(c, -e, -e, 2 * e, 2 * e, 10); c.stroke();
        c.save(); c.scale(1.04, 1.04);
        if (motif === 'heart') embroider(c, heart, '#e2574c', 0.6);
        else if (motif === 'flower') flower(c);
        else embroider(c, paw, '#a0683f', 0.9);
        c.restore();
        c.restore();
      }
      function heart(c) {
        c.beginPath(); c.moveTo(0, 25); c.bezierCurveTo(-38, 2, -22, -26, 0, -9); c.bezierCurveTo(22, -26, 38, 2, 0, 25); c.closePath();
      }
      function paw(c) {
        c.beginPath(); c.ellipse(0, 10, 15, 12, 0, 0, TAU);
        for (const [dx, dy] of [[-16, -5], [-6, -15], [6, -15], [16, -5]]) { c.moveTo(dx + 6, dy); c.ellipse(dx, dy, 5.8, 7.4, dx * 0.03, 0, TAU); }
      }
      // satin stitch: the shape filled with close, slanting threads
      function embroider(c, shape, col, slant) {
        c.save(); shape(c); c.clip();
        c.fillStyle = col; c.fillRect(-34, -34, 68, 68);
        c.lineWidth = 1; c.strokeStyle = U.rgba(U.shade(col, 0.32), 0.55);
        for (let i = -60; i < 60; i += 2.6) seg(c, i, -34, i + slant * 68, 34);
        c.restore();
        shape(c); c.strokeStyle = U.shade(col, -0.24); c.lineWidth = 1.1; c.stroke();
      }
      function flower(c) {
        for (let q = 0; q < 5; q++) {
          c.save(); c.rotate((q / 5) * TAU);
          embroider(c, (x) => { x.beginPath(); x.ellipse(0, -14, 8.6, 12, 0, 0, TAU); }, q % 2 ? '#ee8db0' : '#e2768b', 0.2);
          c.restore();
        }
        embroider(c, (x) => { x.beginPath(); x.arc(0, 0, 6.6, 0, TAU); }, '#f2c84b', 0.7);
      }
      function tagged(c, i, x, y, size, a, fill, ring) {
        c.save(); c.globalAlpha = a;
        dot(c, x, y, size * 0.85, fill);
        c.strokeStyle = ring; c.lineWidth = 1.3; c.beginPath(); c.arc(x, y, size * 0.85, 0, TAU); c.stroke();
        PZ.text(c, name(i), x, y + 0.5, { size, weight: 900, color: PZ.INK });
        c.restore();
      }
      return {
        P: pts, crop: { x: 0, y: 56, w: 360, h: 360 },
        decor(c) {
          if (rescue) basket(c); else quilt(c);
          PZ.text(c, letters ? 'Stitch from hole to hole, from A onwards' : 'Stitch from hole to hole, in order', W / 2, 22, { size: 13, color: PZ.INK2, maxW: 330 });
        },
        draw(c, t, still) {
          const whole = solved(), lab = whole ? (still ? 0 : 1 - U.smooth(0, 0.6, shine)) : 1;
          if (still) for (let k = 0; k < m - 1; k++) tie[k] = k < n ? 1 : 0;
          tear(c);
          for (let i = 0; i < m; i++) { const [x, y] = holeAt(i); hole(c, x, y); }
          for (let i = 0; i < n; i++) { const [ax, ay] = holeAt(i), [bx, by] = holeAt(i + 1); stitchLine(c, ax, ay, bx, by, 3); }
          const [hx, hy] = holeAt(Math.min(n, m - 1));
          if (fade) { c.save(); c.globalAlpha = Math.max(0, fade.a); loose(c, fade.ax, fade.ay, fade.bx, fade.by); c.restore(); }
          for (let i = 0; i < m; i++) {
            const p = pts[i], on = i <= n, next = i === n + 1, lx = p.x + p.nx * p.s * 19, ly = p.y + p.ny * p.s * 19;
            if (next) {
              const b = still ? 0.5 : 0.5 + 0.5 * Math.sin(t * 2.2);
              c.strokeStyle = U.rgba(rescue ? '#fff3cf' : '#b58a2e', 0.62 + 0.3 * b); c.lineWidth = 2; c.beginPath(); c.arc(p.x, p.y, 10 + 2.4 * b, 0, TAU); c.stroke();
              tagged(c, i, lx, ly, 13.5, lab, '#fff3c4', '#b58a2e');
            } else tagged(c, i, lx, ly, on ? 11 : 12.5, lab * (on ? 0.56 : 0.95), '#fffaf1', 'rgba(107,97,87,0.5)');
          }
          if (!still && hintT > 0 && !whole) PZ.glow(c, pts[n + 1].x, pts[n + 1].y, 15, t);
          if (!whole) {
            if (held && !still) {
              const eye = needle(c, held.x, held.y, -1.05);
              loose(c, hx, hy, eye[0], eye[1]);
            } else {
              const p = pts[n], ang = p.s > 0 ? -0.9 : -2.24, eye = [hx + Math.cos(ang) * 48.6, hy + Math.sin(ang) * 48.6];
              loose(c, hx, hy, eye[0], eye[1]);
              needle(c, hx, hy, ang);
            }
          }
          if (whole) {
            const k = still ? 1 : U.easeBack(U.clamp((shine - 0.25) / 0.6, 0, 1));
            if (k > 0.01) patch(c, k);
            pill(c, 'Good as new', 473, 16, 'rgba(255,250,241,0.94)', 'rgba(107,97,87,0.4)', PZ.INK, still ? 1 : U.smooth(0.5, 1.2, shine));
          } else pill(c, `Next hole: ${name(n + 1)}`, 473, 14, 'rgba(255,250,241,0.92)', 'rgba(107,97,87,0.35)', PZ.INK);
        },
        step(dt) { for (let k = 0; k < m - 1; k++) tie[k] = k < n ? PZ.approach(tie[k], 1, dt, 6) : 0; },
        settle() { for (let k = 0; k < m - 1; k++) tie[k] = k < n ? 1 : 0; },
      };
    }

    // ------------------------------------------------- the finger and the thread
    // walk along a stroke and lock every next star it touches, in order
    function reach(ax, ay, bx, by) {
      while (n < steps) {
        const q = P[n + 1];
        if (segDist(q.x, q.y, ax, ay, bx, by) > REACH) break;
        n++; pop[n] = 0; hintT = 0;
        fx.sound(n >= steps ? 'chime' : 'clink');
        fx.good(q.x, q.y);
      }
    }
    function loosen() {
      if (held && !solved()) fade = { ax: P[n].x, ay: P[n].y, bx: held.x, by: held.y, a: 1 };
      held = null;
    }

    const sc = {
      puzzle: true, indoor: true, steps,
      crop: view.crop,
      decor(c) { view.decor(c); },
      draw(c, t, still) { view.draw(c, t, still); },
      step(dt) {
        hintT -= dt;
        for (let i = 0; i < pop.length; i++) if (pop[i] < 1) pop[i] = Math.min(1, pop[i] + dt / 0.42);
        if (fade) { fade.a -= dt / 0.4; if (fade.a <= 0) fade = null; }
        if (solved()) shine += dt;
        if (view.step) view.step(dt);
      },
      down(x, y) {
        if (solved() || held) return;
        fade = null; held = { x, y };
        reach(x, y, x, y);
      },
      move(x, y) {
        if (!held) return;
        const ax = held.x, ay = held.y;
        held.x = x; held.y = y;
        reach(ax, ay, x, y);
      },
      up(x, y) {
        if (!held) return;
        reach(held.x, held.y, x, y);
        held.x = x; held.y = y;
        loosen();
      },
      cancel() { loosen(); },
      progress: () => n / steps,
      solved,
      hint() { if (!solved()) hintT = 3.5; },
      save: () => ({ n }),
      load(st) {
        if (!st || typeof st !== 'object') return;
        const k = Math.round(+st.n);
        if (!(k >= 0 && k <= steps)) return;
        n = k; pop.fill(1); if (view.settle) view.settle();
      },
      solveAll() { n = steps; pop.fill(1); if (view.settle) view.settle(); },
      // finger positions: one stroke from each star to the next
      debugPlan() {
        const plan = [];
        for (let i = n; i < steps; i++) plan.push({ drag: [P[i].x, P[i].y, P[i + 1].x, P[i + 1].y] });
        return plan;
      },
      // for the tests: where everything is
      debugLayout: () => ({ stars: P.map((p) => [p.x, p.y]), steps, title: view.title || 'stitch' }),
    };
    Object.defineProperty(sc, 'fx', { get: () => fx, set: (v) => { fx = v; } });
    return sc;
  }

  Object.assign(SCENES.KINDS, { stars });
})();
