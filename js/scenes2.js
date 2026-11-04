'use strict';
// Scenes on the cottage itself: the picket fence, windows, front door and
// walls. Painting scenes take the chosen colour as the clean layer and paint
// it in as the tool passes; washing reveals the room behind the glass.

(() => {
  const { W, H, field, ramp, rrPath, inside, softShadow, shrub, flowerClump, mowedLawn, grassGrain } = SCENES;

  // ------------------------------------------------------------ shared bits
  function paintStamp(c, x, y, a, tier, paint) {
    c.fillStyle = paint;
    if (tier.shape === 'rect') { c.save(); c.translate(x, y); c.rotate(a); c.fillRect(-tier.h / 2 - 1, -tier.w / 2, tier.h + 2, tier.w); c.restore(); }
    else { c.beginPath(); c.arc(x, y, tier.r, 0, 7); c.fill(); }
  }

  function oldPlaster(c, r, nz, x0, y0, x1, y1, base = ['#b9ad96', '#c9bea8', '#d6ccb7', '#ddd4c2']) {
    const g = ramp(base);
    field(c, x0, y0, x1, y1, 2, (x, y) => g(nz.fbm(x * 0.02, y * 0.02, 5) * 0.8 + nz.n2(x * 0.3, y * 0.3) * 0.2));
    // water stains running down
    for (let i = 0; i < 9; i++) {
      const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0) * 0.6, w = 12 + r() * 30, h = 60 + r() * 160;
      const gr = c.createLinearGradient(0, y, 0, y + h);
      gr.addColorStop(0, 'rgba(90,75,50,0.0)'); gr.addColorStop(0.3, 'rgba(90,75,50,0.16)'); gr.addColorStop(1, 'rgba(90,75,50,0)');
      c.fillStyle = gr; c.beginPath(); c.ellipse(x, y + h / 2, w / 2, h / 2, 0, 0, 7); c.fill();
    }
    // cracks
    c.strokeStyle = 'rgba(70,58,44,0.55)'; c.lineWidth = 0.9;
    for (let i = 0; i < 7; i++) {
      let x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0);
      c.beginPath(); c.moveTo(x, y);
      for (let k = 0; k < 7; k++) { x += (r() - 0.5) * 14; y += 4 + r() * 10; c.lineTo(x, y); }
      c.stroke();
    }
    // flaked patches showing brick
    for (let i = 0; i < 4; i++) {
      const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), w = 26 + r() * 36, h = 16 + r() * 22;
      c.save(); c.beginPath(); c.ellipse(x, y, w / 2, h / 2, (r() - 0.5) * 0.6, 0, 7); c.clip();
      c.fillStyle = '#b7836a'; c.fillRect(x - w, y - h, w * 2, h * 2);
      c.strokeStyle = '#d9cbb3'; c.lineWidth = 1.6;
      for (let yy = y - h; yy < y + h; yy += 8) {
        c.beginPath(); c.moveTo(x - w, yy); c.lineTo(x + w, yy); c.stroke();
        for (let xx = x - w + ((yy / 8) % 2) * 9; xx < x + w; xx += 18) { c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx, yy + 8); c.stroke(); }
      }
      c.restore();
      c.strokeStyle = 'rgba(120,105,85,0.6)'; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y, w / 2, h / 2, 0, 0, 7); c.stroke();
    }
    // speckle
    for (let i = 0; i < 1500; i++) { c.fillStyle = r() < 0.6 ? 'rgba(60,50,40,0.12)' : 'rgba(255,255,255,0.15)'; c.fillRect(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 1 + r(), 1 + r()); }
  }

  // the cottage wall once it has been painted: the chosen colour, softly textured
  function paintedPlaster(c, nz, x0, y0, x1, y1, col) {
    c.fillStyle = col; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    field(c, x0, y0, x1, y1, 3, (x, y) => { const v = nz.fbm(x * 0.05 + 30, y * 0.05, 3); return v > 0.5 ? [255, 255, 255, (v - 0.5) * 80] : [0, 0, 0, (0.5 - v) * 45]; });
  }

  function ivySprig(c, r, x, y, len, dir = 1) {
    c.strokeStyle = '#5b4a33'; c.lineWidth = 1.4;
    let px = x, py = y;
    const pts = [];
    c.beginPath(); c.moveTo(px, py);
    for (let k = 0; k < len; k++) { px += (r() - 0.5) * 10 + dir * 2; py -= 6 + r() * 6; c.lineTo(px, py); pts.push([px, py]); }
    c.stroke();
    for (const [lx, ly] of pts) {
      for (let s = -1; s <= 1; s += 2) {
        const col = U.pick(r, ['#3f7531', '#4f8a3c', '#5d9644', '#6aa04c']);
        const ax = lx + s * (4 + r() * 3), ay = ly + (r() - 0.5) * 4;
        c.fillStyle = col; c.save(); c.translate(ax, ay); c.rotate(r() * 6.28);
        c.beginPath(); c.moveTo(0, -6); c.lineTo(4, -1); c.lineTo(5, 4); c.lineTo(0, 2.5); c.lineTo(-5, 4); c.lineTo(-4, -1); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(0, -4); c.lineTo(0, 2); c.stroke();
        c.restore();
      }
    }
  }

  function weatheredWood(c, r, nz, x0, y0, x1, y1) {
    const g = ramp(['#7c7468', '#8f877a', '#a39b8d', '#b4ac9e']);
    field(c, x0, y0, x1, y1, 1.5, (x, y) => g(nz.fbm(x * 0.09, y * 0.008, 4) * 0.85 + nz.n2(x * 0.7, y * 0.05) * 0.15));
    c.lineWidth = 0.8;
    for (let i = 0; i < 220; i++) {
      const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), l = 20 + r() * 70;
      c.strokeStyle = r() < 0.7 ? 'rgba(60,52,42,0.35)' : 'rgba(255,255,255,0.18)';
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (r() - 0.5) * 4, y + l / 2, x + (r() - 0.5) * 3, y + l); c.stroke();
    }
  }
  function peelingPaint(c, r, x0, y0, x1, y1, n, col = '#e9e4d6') {
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), s = 4 + r() * 12;
      c.fillStyle = col; c.strokeStyle = 'rgba(70,60,45,0.45)'; c.lineWidth = 0.7;
      c.beginPath();
      for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.283, rr = s * (0.5 + r() * 0.6); c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 1.5); }
      c.closePath(); c.fill(); c.stroke();
    }
  }
  function grime(c, r, x0, y0, x1, y1, n) {
    for (let i = 0; i < n; i++) {
      c.fillStyle = `rgba(80,65,45,${0.08 + r() * 0.14})`;
      c.beginPath(); c.ellipse(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 8 + r() * 26, 5 + r() * 14, r() * 3, 0, 7); c.fill();
    }
  }
  // an old barn wall of soft red bricks in lime mortar
  function barnBricks(c, r, nz, x0, y0, x1, y1) {
    c.fillStyle = '#d8ccb6'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    for (let y = Math.floor(y0 / 14) * 14, row = 0; y < y1; y += 14, row++) {
      for (let x = Math.floor(x0 / 32) * 32 - (row % 2) * 16; x < x1; x += 32) {
        c.fillStyle = U.shade(U.pick(r, ['#b5603f', '#a8573a', '#bf6c48', '#9e5236', '#c47a52']), (nz.n2(x * 0.03, y * 0.03) - 0.5) * 0.3);
        c.fillRect(x + 1.5, y + 1.5, 29, 11);
        c.fillStyle = 'rgba(255,225,190,0.12)'; c.fillRect(x + 1.5, y + 1.5, 29, 2);
      }
    }
    field(c, x0, y0, x1, y1, 4, (x, y) => [80, 70, 55, Math.max(0, nz.fbm(x * 0.015 + 40, y * 0.015, 3) - 0.45) * 160]);
  }
  // the loft's limewashed boards, running up and down, a little uneven
  function limewash(c, r, nz, x0, y0, x1, y1) {
    const g = ramp(['#e4dfd1', '#ece8dc', '#f5f2e9']);
    field(c, x0, y0, x1, y1, 2, (x, y) => g(nz.fbm(x * 0.05, y * 0.012, 3)));
    for (let x = Math.floor(x0 / 30) * 30; x < x1; x += 30) {
      const sg = c.createLinearGradient(x, 0, x + 7, 0); sg.addColorStop(0, 'rgba(90,80,60,0.32)'); sg.addColorStop(1, 'rgba(90,80,60,0)');
      c.fillStyle = sg; c.fillRect(x, y0, 7, y1 - y0);
      c.fillStyle = 'rgba(255,255,255,0.55)'; c.fillRect(x + 28, y0, 1.5, y1 - y0);
    }
    for (let i = 0; i < 90; i++) { c.fillStyle = 'rgba(120,105,80,0.1)'; c.fillRect(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 1, 10 + r() * 30); }
  }
  // blue-grey slates in overlapping rows, for the roof round a skylight
  function slates(c, r, nz, x0, y0, x1, y1) {
    c.fillStyle = '#3e454e'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    for (let y = Math.floor(y0 / 30) * 30, row = 0; y < y1; y += 30, row++) {
      for (let x = Math.floor(x0 / 44) * 44 - (row % 2) * 22 - 22; x < x1; x += 44) {
        const tone = (nz.n2(x * 0.02 + 9, y * 0.03) - 0.5) * 0.24 + (r() - 0.5) * 0.08;
        c.fillStyle = U.shade(U.pick(r, ['#67717c', '#5e6873', '#717b86', '#59636e']), tone);
        c.fillRect(x + 1, y + 1, 42, 34);
        c.fillStyle = 'rgba(255,255,255,0.1)'; c.fillRect(x + 1, y + 1, 1.4, 34);
        c.fillStyle = 'rgba(16,20,26,0.28)'; c.fillRect(x + 1, y + 27, 42, 3);
        if (r() < 0.14) { c.fillStyle = U.pick(r, ['#7f9a57', '#6d8a4c']); c.beginPath(); c.ellipse(x + 8 + r() * 28, y + 30, 5 + r() * 6, 2.4, 0, 0, 7); c.fill(); }
      }
    }
    c.fillStyle = 'rgba(214,226,235,0.05)'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  }
  // cream weatherboards, each board throwing a little shadow on the next
  function weatherboards(c, r, nz, x0, y0, x1, y1) {
    const g = ramp(['#ddd0b4', '#e6dbc2', '#efe6d2']);
    field(c, x0, y0, x1, y1, 2, (x, y) => g(nz.fbm(x * 0.01, y * 0.05, 3)));
    for (let y = Math.floor(y0 / 22) * 22; y < y1; y += 22) {
      const sg = c.createLinearGradient(0, y, 0, y + 6); sg.addColorStop(0, 'rgba(70,50,30,0.35)'); sg.addColorStop(1, 'rgba(70,50,30,0)');
      c.fillStyle = sg; c.fillRect(x0, y, x1 - x0, 6);
      c.fillStyle = 'rgba(255,255,250,0.35)'; c.fillRect(x0, y + 20, x1 - x0, 1.5);
    }
    for (let i = 0; i < 120; i++) { c.fillStyle = 'rgba(120,95,60,0.12)'; c.fillRect(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 10 + r() * 30, 1); }
    // a wine-red corner post either side
    c.fillStyle = '#8e3b3f'; c.fillRect(x0, y0, 10 - x0, y1 - y0); c.fillRect(350, y0, x1 - 350, y1 - y0);
  }

  // oak boards standing side by side, dark with age, nailed to the stable's frame
  function oakBoards(c, r, nz, x0, y0, x1, y1, w = 34) {
    const g = ramp(['#5a3f28', '#694a2f', '#775638', '#856342']);
    field(c, x0, y0, x1, y1, 2, (x, y) => g(U.clamp(nz.fbm(Math.floor(x / w) * 3.7 + x * 0.05, y * 0.008, 4) * 0.95 + nz.n2(x * 0.5, y * 0.03) * 0.1, 0, 1)));
    for (let x = Math.floor(x0 / w) * w; x < x1; x += w) {
      c.fillStyle = 'rgba(25,14,6,0.5)'; c.fillRect(x, y0, 2, y1 - y0);
      c.fillStyle = 'rgba(255,225,180,0.1)'; c.fillRect(x + 2, y0, 1.4, y1 - y0);
    }
    c.lineWidth = 0.8;
    for (let i = 0; i < ((x1 - x0) * (y1 - y0)) / 2200; i++) {
      const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), l = 16 + r() * 50;
      c.strokeStyle = r() < 0.7 ? 'rgba(30,18,8,0.28)' : 'rgba(255,225,180,0.09)';
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (r() - 0.5) * 3, y + l / 2, x + (r() - 0.5) * 3, y + l); c.stroke();
    }
  }
  // a saddle on its rack, side on: the flap, the seat, a stirrup run up its leather
  function tackSaddle(c, x, y, s, col) {
    const dk = U.shade(col, -0.3), lt = U.shade(col, 0.22);
    c.save(); c.translate(x, y); c.scale(s, s); c.lineCap = 'round'; c.lineJoin = 'round';
    c.fillStyle = U.shade(col, -0.14); c.beginPath(); c.moveTo(-25, 0); c.quadraticCurveTo(-33, 28, -15, 48); c.lineTo(16, 50); c.quadraticCurveTo(29, 30, 27, 2); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,235,200,0.35)'; c.lineWidth = 0.9; c.setLineDash([2.4, 2]);
    c.beginPath(); c.moveTo(-23, 6); c.quadraticCurveTo(-29, 28, -13, 45); c.lineTo(14, 47); c.quadraticCurveTo(25, 30, 23, 6); c.stroke(); c.setLineDash([]);
    c.fillStyle = col; c.beginPath(); c.moveTo(-40, -13); c.quadraticCurveTo(-36, -22, -27, -17); c.quadraticCurveTo(-6, 4, 14, 0); c.quadraticCurveTo(31, -4, 40, -24);
    c.quadraticCurveTo(47, -12, 38, -1); c.quadraticCurveTo(10, 17, -14, 13); c.quadraticCurveTo(-36, 7, -40, -13); c.closePath(); c.fill();
    c.strokeStyle = lt; c.lineWidth = 2.2; c.beginPath(); c.moveTo(-26, -13); c.quadraticCurveTo(-6, 7, 15, 3); c.quadraticCurveTo(30, -1, 37, -14); c.stroke();
    c.strokeStyle = dk; c.lineWidth = 3; c.beginPath(); c.moveTo(-2, 7); c.lineTo(-2, 38); c.stroke();
    c.strokeStyle = '#c3c9cf'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(-10, 54); c.lineTo(6, 54); c.moveTo(-10, 54); c.quadraticCurveTo(-11, 38, -2, 38); c.quadraticCurveTo(7, 38, 6, 54); c.stroke();
    c.restore();
  }
  // a bridle on a round holder, the reins looped beneath it
  function tackBridle(c, x, y, s, col) {
    c.save(); c.translate(x, y); c.scale(s, s); c.lineCap = 'round';
    c.fillStyle = '#6b4a32'; c.beginPath(); c.ellipse(0, 0, 13, 6.4, 0, 0, 7); c.fill();
    c.fillStyle = '#8a6242'; c.beginPath(); c.ellipse(0, -1.4, 12, 4.6, 0, 0, 7); c.fill();
    c.strokeStyle = col; c.lineWidth = 2.8;
    c.beginPath(); c.moveTo(-12, 1); c.quadraticCurveTo(-13, 30, -10, 56); c.moveTo(12, 1); c.quadraticCurveTo(13, 30, 10, 56); c.stroke();
    c.beginPath(); c.moveTo(-12, 40); c.quadraticCurveTo(0, 46, 12, 40); c.stroke();
    // the reins, a long loop hanging below the bit
    c.lineWidth = 2.2; c.beginPath(); c.moveTo(-10, 60); c.bezierCurveTo(-24, 118, 14, 128, 10, 60); c.stroke();
    // the browband with its bright stripe
    c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.moveTo(-13, 11); c.quadraticCurveTo(0, 17, 13, 11); c.stroke();
    c.strokeStyle = '#efb4ae'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-12, 11); c.quadraticCurveTo(0, 17, 12, 11); c.stroke();
    c.strokeStyle = '#c3c9cf'; c.lineWidth = 2.2; c.beginPath(); c.arc(-10, 59, 3.8, 0, 7); c.moveTo(13.8, 59); c.arc(10, 59, 3.8, 0, 7); c.moveTo(-6.4, 59); c.lineTo(6.4, 59); c.stroke();
    c.restore();
  }
  // a rosette with its two tails
  function tackRosette(c, x, y, s, col) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = U.shade(col, -0.12);
    for (const a of [-0.25, 0.25]) { c.save(); c.rotate(a); c.beginPath(); c.moveTo(-4.5, 4); c.lineTo(-4.5, 30); c.lineTo(0, 26); c.lineTo(4.5, 30); c.lineTo(4.5, 4); c.closePath(); c.fill(); c.restore(); }
    for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; c.fillStyle = k % 2 ? col : U.shade(col, 0.2); c.beginPath(); c.ellipse(Math.cos(a) * 9, Math.sin(a) * 9, 4.4, 2.8, a, 0, 7); c.fill(); }
    c.fillStyle = '#f4ecdc'; c.beginPath(); c.arc(0, 0, 6.4, 0, 7); c.fill();
    c.fillStyle = U.shade(col, -0.2); c.beginPath(); c.arc(0, 0, 3, 0, 7); c.fill();
    c.restore();
  }

  // ------------------------------------------------------------ CROSSING GATE
  // The level-crossing gate at the station: palings between rails in the
  // player's colour, with fixed red bands and the red target disc in the
  // middle, hung between banded posts over the line.
  function crossingGate(S) {
    const { r, nz, bleed } = S;
    const gx0 = 22, gx1 = 338, top0 = 190, top1 = 214, mid0 = 314, mid1 = 332, bot0 = 430, bot1 = 452;
    const board = [150, 210], disc = { x: 180, y: 323, r: 26 };
    const bands = [[70, 94], [120, 144], [216, 240], [266, 290]];
    const gaps = [];
    for (const [a, b] of [[44, board[0]], [board[1], 316]]) {
      const n = 4, pw = 16, g = (b - a - n * pw) / (n + 1);
      for (let k = 0; k <= n; k++) { const x = a + k * (pw + g); gaps.push([x, top1, g, mid0 - top1], [x, mid1, g, bot0 - mid1]); }
    }
    const region = new Path2D();
    region.rect(gx0, top0, gx1 - gx0, bot1 - top0);
    for (const [x, y, w, h] of gaps) region.rect(x, y, w, h);
    for (const [a, b] of bands) region.rect(a, top0 + 2, b - a, top1 - top0 - 4);
    region.moveTo(disc.x + disc.r, disc.y); region.arc(disc.x, disc.y, disc.r, 0, Math.PI * 2);
    const postBands = (c, x, w) => {
      c.fillStyle = '#f4f1ea'; c.fillRect(x, 120, w, 400);
      c.fillStyle = '#c9474f'; for (let y = 120; y < 520; y += 56) c.fillRect(x, y, w, 28);
      c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(x + w - 4, 120, 4, 400);
      c.fillStyle = '#4b4a52'; c.beginPath(); c.moveTo(x - 3, 120); c.lineTo(x + w / 2, 104); c.lineTo(x + w + 3, 120); c.closePath(); c.fill();
    };
    return {
      family: 'paint', particle: 'paint', region,
      tough: (x, y) => (y > 410 ? 1.35 : 1),
      decor(c) {
        const sky = c.createLinearGradient(0, bleed.y0, 0, 300); sky.addColorStop(0, '#cfe8f1'); sky.addColorStop(1, '#eef4e8');
        c.fillStyle = sky; c.fillRect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, 320 - bleed.y0);
        // fields and a hedge beyond the line, a signal on the right
        c.fillStyle = '#b8d89a'; c.beginPath(); c.moveTo(bleed.x0, 262); c.quadraticCurveTo(120, 236, bleed.x1, 254); c.lineTo(bleed.x1, 470); c.lineTo(bleed.x0, 470); c.fill();
        for (let i = 0; i < 110; i++) { c.fillStyle = U.pick(r, ['#5d9644', '#4f8a3c', '#6aa04c', '#477d38']); c.beginPath(); c.arc(bleed.x0 + r() * (bleed.x1 - bleed.x0), 258 + r() * 70, 10 + r() * 14, 0, 7); c.fill(); }
        for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(255,255,220,0.14)'; c.beginPath(); c.arc(bleed.x0 + r() * (bleed.x1 - bleed.x0), 250 + r() * 60, 4 + r() * 6, 0, 7); c.fill(); }
        c.fillStyle = '#4b4a52'; c.fillRect(300, 150, 5, 160);
        c.fillStyle = '#c9474f'; c.fillRect(302, 158, 34, 10); c.fillStyle = '#f4f1ea'; c.fillRect(326, 158, 4, 10);
        // ballast and the rails running across the front
        const g = ramp(['#8d857a', '#a39a8c', '#b5ad9f']);
        field(c, bleed.x0, 452, bleed.x1, bleed.y1, 2, (x, y) => g(nz.fbm(x * 0.12, y * 0.12, 3)));
        for (let i = 0; i < 500; i++) { c.fillStyle = r() < 0.5 ? 'rgba(60,55,50,0.35)' : 'rgba(255,255,250,0.3)'; c.beginPath(); c.arc(bleed.x0 + r() * (bleed.x1 - bleed.x0), 452 + r() * (bleed.y1 - 452), 1 + r() * 2.5, 0, 7); c.fill(); }
        for (let x = Math.floor(bleed.x0 / 34) * 34; x < bleed.x1; x += 34) { c.fillStyle = '#6b4a32'; c.fillRect(x, 496, 20, 56); c.fillStyle = 'rgba(255,220,180,0.12)'; c.fillRect(x, 496, 20, 3); }
        for (const y of [504, 536]) { c.fillStyle = '#7d8590'; c.fillRect(bleed.x0, y, bleed.x1 - bleed.x0, 7); c.fillStyle = '#c9cfd4'; c.fillRect(bleed.x0, y, bleed.x1 - bleed.x0, 2); }
        // the banded posts the gate hangs between
        postBands(c, 2, 20); postBands(c, 338, 20);
        softShadow(c, region, 6, 0.35, 3, 4);
      },
      clean(c, paint) { c.fillStyle = paint; c.fillRect(0, 0, W, H); },
      cleanOver(c) {
        for (let i = 0; i < 200; i++) {
          const x = gx0 + r() * (gx1 - gx0), y = top0 + r() * (bot1 - top0), l = 14 + r() * 40;
          c.strokeStyle = r() < 0.7 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.1)'; c.lineWidth = 0.8;
          c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 2, y + l); c.stroke();
        }
        for (const [x, y, w, h] of gaps) {
          c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(x + w, y, 3, h);
          c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(x - 2.5, y, 2.5, h);
        }
        for (const [y0, y1] of [[top0, top1], [mid0, mid1], [bot0, bot1]]) {
          c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(gx0, y0, gx1 - gx0, 2.5);
          c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(gx0, y1 - 3, gx1 - gx0, 3);
        }
        c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(board[0], top1, 2, bot0 - top1); c.fillRect(board[1] - 2, top1, 2, bot0 - top1);
        c.fillStyle = 'rgba(60,60,70,0.5)';
        for (const x of [gx0 + 11, gx1 - 11]) for (const y of [top0 + 12, mid0 + 9, bot0 + 11]) { c.beginPath(); c.arc(x, y, 1.8, 0, 7); c.fill(); }
      },
      dirt(c) {
        weatheredWood(c, r, nz, gx0 - 2, top0 - 2, gx1 + 2, bot1 + 2);
        peelingPaint(c, r, gx0, top0, gx1, bot1, 60);
        const gr = c.createLinearGradient(0, 360, 0, bot1);
        gr.addColorStop(0, 'rgba(90,120,50,0)'); gr.addColorStop(1, 'rgba(90,120,50,0.55)');
        c.fillStyle = gr; c.fillRect(gx0, 360, gx1 - gx0, bot1 - 360);
        grime(c, r, gx0, 380, gx1, bot1, 26);
        // soot from the old engines along the top rail
        c.fillStyle = 'rgba(40,36,34,0.25)'; c.fillRect(gx0, top0, gx1 - gx0, 10);
        for (const [x, y, w, h] of gaps) { c.fillStyle = 'rgba(40,32,24,0.35)'; c.fillRect(x + w, y, 3, h); }
      },
      top(c) {
        // the fixed red bands and the target disc, the lamp on top, the hinges
        for (const [a, b] of bands) {
          c.fillStyle = '#c9474f'; c.fillRect(a, top0 + 2, b - a, top1 - top0 - 4);
          c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(a, top0 + 2, b - a, 2);
          c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(a, top1 - 4, b - a, 2);
        }
        c.fillStyle = '#3a2814'; c.beginPath(); c.arc(disc.x, disc.y, disc.r, 0, 7); c.fill();
        c.fillStyle = '#c9474f'; c.beginPath(); c.arc(disc.x, disc.y, disc.r - 3, 0, 7); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.2)'; c.beginPath(); c.ellipse(disc.x - 8, disc.y - 9, 9, 5, -0.6, 0, 7); c.fill();
        c.fillStyle = '#3a2814'; c.beginPath(); c.arc(disc.x, disc.y, 3, 0, 7); c.fill();
        c.fillStyle = '#2f2c2a'; c.fillRect(176, 166, 8, 24);
        c.fillStyle = '#2f2c2a'; c.beginPath(); c.roundRect(166, 140, 28, 30, 4); c.fill();
        c.fillStyle = '#e2574c'; c.beginPath(); c.arc(180, 155, 8, 0, 7); c.fill();
        c.fillStyle = '#ffd2c4'; c.beginPath(); c.arc(178, 153, 2.6, 0, 7); c.fill();
        c.fillStyle = '#2f2c2a'; c.beginPath(); c.moveTo(162, 142); c.lineTo(180, 130); c.lineTo(198, 142); c.closePath(); c.fill();
        for (const y of [top0 + 6, bot0 + 6]) {
          c.fillStyle = '#2f2c2a'; c.fillRect(14, y, 46, 10);
          c.beginPath(); c.arc(60, y + 5, 6, 0, 7); c.fill();
          c.fillStyle = '#56504a'; for (const bx of [32, 50]) { c.beginPath(); c.arc(bx, y + 5, 1.8, 0, 7); c.fill(); }
        }
      },
      stamp: paintStamp,
    };
  }

  // ------------------------------------------------------------------ FENCE
  function fence(S) {
    if (S.opts.what === 'gate') return crossingGate(S);
    const { r, nz, opts, bleed } = S;
    const pick = { w: 30, gap: 12, top: 110, bot: 520 };
    const xs = [];
    for (let x = 12; x + pick.w <= W; x += pick.w + pick.gap) xs.push(x);
    const rails = [[196, 26], [416, 26]];
    const region = new Path2D();
    for (const x of xs) {
      region.moveTo(x, pick.bot); region.lineTo(x, pick.top + 26); region.lineTo(x + pick.w / 2, pick.top); region.lineTo(x + pick.w, pick.top + 26); region.lineTo(x + pick.w, pick.bot); region.closePath();
    }
    // rails only where they show between pickets (no overlap, evenodd safe)
    for (const [y, h] of rails) {
      for (let i = 0; i <= xs.length; i++) {
        const a = i === 0 ? 0 : xs[i - 1] + pick.w, b = i === xs.length ? W : xs[i];
        if (b - a > 1) region.rect(a, y, b - a, h);
      }
    }
    return {
      family: 'paint', particle: 'paint', region,
      tough: (x, y) => (y > 470 ? 1.35 : 1),
      decor(c) {
        const sky = c.createLinearGradient(0, bleed.y0, 0, 120);
        sky.addColorStop(0, '#cfe8f1'); sky.addColorStop(1, '#eef4e8');
        c.fillStyle = sky; c.fillRect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, 140 - bleed.y0);
        // hedge
        c.fillStyle = '#3f6e35'; c.fillRect(bleed.x0, 120, bleed.x1 - bleed.x0, 360);
        for (let i = 0; i < 260; i++) {
          const x = bleed.x0 + r() * (bleed.x1 - bleed.x0), y = 90 + r() * 380;
          c.fillStyle = U.pick(r, ['#3a6a31', '#467a3a', '#518644', '#5c9150', '#36612e']);
          c.beginPath(); c.arc(x, y, 8 + r() * 14, 0, 7); c.fill();
        }
        for (let i = 0; i < 90; i++) { c.fillStyle = 'rgba(255,255,220,0.12)'; c.beginPath(); c.arc(bleed.x0 + r() * (bleed.x1 - bleed.x0), 90 + r() * 300, 4 + r() * 6, 0, 7); c.fill(); }
        // lawn in front
        mowedLawn(c, nz, bleed.x0, 470, bleed.x1, bleed.y1, true);
        grassGrain(c, r, bleed.x0, 470, bleed.x1, bleed.y1, 5, 0.2);
        for (let i = 0; i < 9; i++) flowerClump(c, r, 10 + r() * 340, 470 + r() * 20, U.pick(r, ['#e98aa2', '#f2c230', '#b48fd8', '#ffffff']));
        softShadow(c, region, 6, 0.35, 3, 4);
      },
      clean(c, paint) { c.fillStyle = paint; c.fillRect(0, 0, W, H); },
      cleanOver(c) {
        // grain and plank edges so the paint reads as wood
        for (let i = 0; i < 260; i++) {
          const x = r() * W, y = 100 + r() * 430, l = 20 + r() * 60;
          c.strokeStyle = r() < 0.7 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.1)'; c.lineWidth = 0.8;
          c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 2, y + l); c.stroke();
        }
        for (const x of xs) {
          c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(x, pick.top + 20, 3, pick.bot - pick.top);
          c.fillStyle = 'rgba(0,0,0,0.13)'; c.fillRect(x + pick.w - 4, pick.top + 20, 4, pick.bot - pick.top);
          c.fillStyle = 'rgba(0,0,0,0.08)';
          c.beginPath(); c.moveTo(x + pick.w / 2, pick.top); c.lineTo(x + pick.w, pick.top + 26); c.lineTo(x + pick.w / 2, pick.top + 26); c.closePath(); c.fill();
          for (const [y, h] of rails) {
            c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x, y + h, pick.w, 5);
            c.fillStyle = 'rgba(60,60,70,0.55)'; c.beginPath(); c.arc(x + 8, y + h / 2, 1.6, 0, 7); c.arc(x + pick.w - 8, y + h / 2, 1.6, 0, 7); c.fill();
          }
        }
        for (const [y, h] of rails) { c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(0, y, W, 2.5); c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(0, y + h - 3, W, 3); }
      },
      dirt(c) {
        weatheredWood(c, r, nz, 0, 90, W, 540);
        peelingPaint(c, r, 0, 100, W, 520, 70);
        // green algae towards the ground
        const gr = c.createLinearGradient(0, 400, 0, 525);
        gr.addColorStop(0, 'rgba(90,120,50,0)'); gr.addColorStop(1, 'rgba(90,120,50,0.6)');
        c.fillStyle = gr; c.fillRect(0, 400, W, 130);
        grime(c, r, 0, 420, W, 525, 30);
        for (const x of xs) { c.fillStyle = 'rgba(40,32,24,0.35)'; c.fillRect(x + pick.w - 3, pick.top + 20, 3, pick.bot - pick.top); }
        for (let i = 0; i < 12; i++) { // knots
          const x = U.pick(r, xs) + 8 + r() * 14, y = 150 + r() * 350;
          c.fillStyle = '#5e5446'; c.beginPath(); c.ellipse(x, y, 3, 5, 0, 0, 7); c.fill();
          c.strokeStyle = 'rgba(60,52,42,0.5)'; c.beginPath(); c.ellipse(x, y, 5, 9, 0, 0, 7); c.stroke();
        }
      },
      top(c) {
        // grass tufts in front of the picket feet
        const items = [];
        for (let i = 0; i < 420; i++) {
          const x = r() * W, y = 512 + r() * 16, l = 6 + r() * 10, lean = (r() - 0.5) * 8;
          items.push({ x0: x, y0: y, cx: x + lean * 0.3, cy: y - l * 0.6, x1: x + lean, y1: y - l, col: U.pick(r, ['#5f9e43', '#74b252', '#86c262', '#4d8a34']), w: 1.4 });
        }
        SCENES.strokesByColour(c, items, 1.4);
      },
      stamp: paintStamp,
    };
  }

  // ----------------------------------------------------------------- WINDOW
  const ROOM = {
    kitchen(c, r, x0, y0, x1, y1) {
      const w = x1 - x0;
      c.fillStyle = '#eaf3ec'; c.fillRect(x0, y0, w, y1 - y0);
      c.strokeStyle = '#cfe0d4'; c.lineWidth = 1.2;
      for (let y = y0; y < 400; y += 14) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); for (let x = x0 + ((y / 14) % 2) * 14; x < x1; x += 28) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 14); c.stroke(); } }
      // shelf with jars
      c.fillStyle = '#b98654'; c.fillRect(x0 + 10, 210, w - 20, 8);
      const jc = ['#e98a7c', '#f2c230', '#8fbfe6', '#9cc5a1', '#bba9df'];
      for (let x = x0 + 22; x < x1 - 30; x += 30) {
        const h = 22 + r() * 18;
        c.fillStyle = 'rgba(255,255,255,0.65)'; c.fillRect(x, 210 - h, 20, h);
        c.fillStyle = U.pick(r, ['#e7c27a', '#c98e5a', '#f2e3b6', '#8e5a3c']); c.fillRect(x + 2, 210 - h * 0.7, 16, h * 0.7 - 1);
        c.fillStyle = U.pick(r, jc); c.fillRect(x - 1, 210 - h - 5, 22, 6);
      }
      // counter and cupboards
      c.fillStyle = '#c59a6b'; c.fillRect(x0, 400, w, 14);
      c.fillStyle = '#9cc5a1'; c.fillRect(x0, 414, w, y1 - 414);
      c.strokeStyle = '#7fa886'; c.lineWidth = 2;
      for (let x = x0 + 6; x < x1 - 30; x += 66) { c.strokeRect(x, 424, 58, 80); c.fillStyle = '#d9b35a'; c.fillRect(x + 25, 440, 8, 3); }
      // kettle and a pot of basil
      c.fillStyle = '#d9534f'; c.beginPath(); c.ellipse(x0 + 70, 384, 26, 20, 0, Math.PI, 0); c.fill(); c.fillRect(x0 + 44, 382, 52, 18);
      c.strokeStyle = '#3d3d42'; c.lineWidth = 3; c.beginPath(); c.arc(x0 + 70, 368, 14, Math.PI, 0); c.stroke();
      c.fillStyle = '#c8763f'; c.fillRect(x1 - 80, 370, 30, 30);
      for (let i = 0; i < 9; i++) { c.fillStyle = U.pick(r, ['#4f8a3a', '#62a042', '#7bb553']); c.beginPath(); c.ellipse(x1 - 65 + (r() - 0.5) * 30, 360 - r() * 24, 7, 4, r() * 3, 0, 7); c.fill(); }
      // pendant lamp
      c.strokeStyle = '#3d3d42'; c.lineWidth = 1.5; c.beginPath(); c.moveTo((x0 + x1) / 2, y0); c.lineTo((x0 + x1) / 2, 110); c.stroke();
      c.fillStyle = '#2f4f45'; c.beginPath(); c.moveTo((x0 + x1) / 2 - 22, 136); c.lineTo((x0 + x1) / 2 + 22, 136); c.lineTo((x0 + x1) / 2 + 8, 110); c.lineTo((x0 + x1) / 2 - 8, 110); c.closePath(); c.fill();
      glow(c, (x0 + x1) / 2, 140, 170, 'rgba(255,214,140,0.45)');
    },
    living(c, r, x0, y0, x1, y1) {
      const w = x1 - x0;
      c.fillStyle = '#f3e7d3'; c.fillRect(x0, y0, w, y1 - y0);
      c.fillStyle = 'rgba(200,150,120,0.25)';
      for (let y = y0 + 10; y < y1; y += 26) for (let x = x0 + ((y / 26) % 2) * 13; x < x1; x += 26) { c.beginPath(); c.arc(x, y, 2.4, 0, 7); c.fill(); }
      // picture
      c.fillStyle = '#8a6142'; c.fillRect(x0 + 40, 150, 96, 72);
      const sk = c.createLinearGradient(0, 156, 0, 216); sk.addColorStop(0, '#f7c98c'); sk.addColorStop(1, '#e58f73');
      c.fillStyle = sk; c.fillRect(x0 + 46, 156, 84, 60);
      c.fillStyle = '#7a5aa0'; c.beginPath(); c.moveTo(x0 + 46, 216); c.lineTo(x0 + 80, 186); c.lineTo(x0 + 104, 204); c.lineTo(x0 + 130, 190); c.lineTo(x0 + 130, 216); c.fill();
      // bookshelf
      c.fillStyle = '#9a6b45'; c.fillRect(x1 - 70, 130, 64, 260);
      for (let sy = 150; sy < 380; sy += 58) {
        let bx = x1 - 66;
        while (bx < x1 - 12) { const bw = 6 + r() * 7, bh = 30 + r() * 18; c.fillStyle = U.pick(r, ['#c9474f', '#3d5a86', '#f2d88a', '#4e7b5b', '#efb4ae', '#bba9df']); c.fillRect(bx, sy + 48 - bh, bw - 1, bh); bx += bw; }
        c.fillStyle = '#7d5434'; c.fillRect(x1 - 70, sy + 48, 64, 6);
      }
      // sofa with a cat
      c.fillStyle = '#7d9fc6'; c.beginPath(); c.roundRect(x0 + 6, 330, w - 90, 90, 18); c.fill();
      c.fillStyle = '#6b8db4'; c.beginPath(); c.roundRect(x0 + 6, 390, w - 90, 60, 12); c.fill();
      c.fillStyle = '#efb4ae'; c.beginPath(); c.roundRect(x0 + 24, 352, 46, 40, 10); c.fill();
      c.fillStyle = '#f2d88a'; c.beginPath(); c.roundRect(x0 + 120, 356, 42, 36, 10); c.fill();
      c.fillStyle = '#e0a86a'; c.beginPath(); c.ellipse(x0 + 98, 384, 26, 14, 0, 0, 7); c.fill();
      c.beginPath(); c.arc(x0 + 120, 378, 11, 0, 7); c.fill();
      c.beginPath(); c.moveTo(x0 + 112, 370); c.lineTo(x0 + 114, 360); c.lineTo(x0 + 119, 368); c.fill();
      c.beginPath(); c.moveTo(x0 + 122, 368); c.lineTo(x0 + 128, 360); c.lineTo(x0 + 129, 371); c.fill();
      c.strokeStyle = '#8a5a3c'; c.lineWidth = 1.2; c.beginPath(); c.arc(x0 + 117, 379, 2.5, 0.2, 2.9); c.stroke(); c.beginPath(); c.arc(x0 + 124, 379, 2.5, 0.2, 2.9); c.stroke();
      c.strokeStyle = '#c98a50'; c.lineWidth = 2; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(x0 + 92 + k * 9, 384, 8, 3.6, 5.2); c.stroke(); }
      // floor lamp
      c.strokeStyle = '#3d3d42'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0 + 20, 470); c.lineTo(x0 + 20, 250); c.stroke();
      c.fillStyle = '#f7e1a8'; c.beginPath(); c.moveTo(x0 + 2, 270); c.lineTo(x0 + 38, 270); c.lineTo(x0 + 30, 236); c.lineTo(x0 + 10, 236); c.fill();
      glow(c, x0 + 20, 262, 150, 'rgba(255,214,140,0.5)');
      c.fillStyle = '#b98654'; c.fillRect(x0, 450, w, y1 - 450);
    },
    bedroom(c, r, x0, y0, x1, y1) {
      const w = x1 - x0;
      c.fillStyle = '#e8def0'; c.fillRect(x0, y0, w, y1 - y0);
      c.strokeStyle = 'rgba(160,130,190,0.25)'; c.lineWidth = 6;
      for (let x = x0 + 10; x < x1; x += 30) { c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y1); c.stroke(); }
      // fairy lights
      c.strokeStyle = '#6b5a4a'; c.lineWidth = 1; c.beginPath();
      for (let x = x0; x <= x1; x += 4) c.lineTo(x, 130 + Math.sin((x - x0) / w * Math.PI * 3) * 18);
      c.stroke();
      for (let x = x0 + 10; x < x1; x += 22) { const y = 136 + Math.sin((x - x0) / w * Math.PI * 3) * 18; glow(c, x, y, 16, 'rgba(255,220,140,0.7)'); c.fillStyle = '#fff1c4'; c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill(); }
      // poster and plant
      c.fillStyle = '#ffffff'; c.fillRect(x1 - 110, 180, 70, 90);
      c.fillStyle = '#f2d88a'; c.beginPath(); c.arc(x1 - 75, 214, 18, 0, 7); c.fill();
      c.fillStyle = '#9cc5a1'; c.fillRect(x1 - 104, 238, 58, 26);
      c.fillStyle = '#d98b63'; c.fillRect(x0 + 18, 300, 34, 40);
      for (let i = 0; i < 12; i++) { c.fillStyle = U.pick(r, ['#4f8a3a', '#62a042', '#7bb553']); c.beginPath(); c.ellipse(x0 + 35 + (r() - 0.5) * 44, 290 - r() * 50, 10, 5, r() * 3, 0, 7); c.fill(); }
      // bed with a patchwork quilt
      c.fillStyle = '#a77b56'; c.beginPath(); c.roundRect(x0 + 60, 290, w - 70, 80, 14); c.fill();
      c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(x0 + 80, 336, 70, 30, 10); c.fill(); c.beginPath(); c.roundRect(x0 + 160, 336, 70, 30, 10); c.fill();
      const qc = ['#efb4ae', '#bba9df', '#f2d88a', '#a6d3d4', '#f4ecdc'];
      for (let y = 370; y < y1; y += 24) for (let x = x0 + 60; x < x1 - 10; x += 24) { c.fillStyle = U.pick(r, qc); c.fillRect(x, y, 23, 23); }
      glow(c, x0 + 40, 360, 120, 'rgba(255,214,140,0.35)');
    },
    cafe(c, r, x0, y0, x1, y1) {
      const w = x1 - x0;
      c.fillStyle = '#2f5547'; c.fillRect(x0, y0, w, y1 - y0);
      for (let i = 0; i < 500; i++) { c.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.05)'; c.fillRect(x0 + r() * w, y0 + r() * (y1 - y0), 2, 2); }
      // chalkboard menu
      c.fillStyle = '#8a5a3c'; c.fillRect(x0 + 10, 150, 112, 134);
      c.fillStyle = '#262e2a'; c.fillRect(x0 + 16, 156, 100, 122);
      c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(x0 + 20, 164, 60, 30);
      c.fillStyle = 'rgba(255,255,255,0.88)'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
      c.font = '700 17px "Chalkboard SE", "Comic Sans MS", cursive'; c.fillText('Menu', x0 + 66, 180);
      c.font = '400 11px "Chalkboard SE", "Comic Sans MS", cursive'; c.textAlign = 'left';
      [['Coffee', '3'], ['Cocoa', '3'], ['Cake', '4'], ['Scones', '2']].forEach(([a, b], i) => { c.fillText(a, x0 + 26, 204 + i * 18); c.fillText(b, x0 + 98, 204 + i * 18); });
      c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0 + 40, 186); c.lineTo(x0 + 92, 186); c.stroke();
      // shelves of cups and jars, with a trailing plant
      for (const sy of [176, 238]) {
        c.fillStyle = '#7a5236'; c.fillRect(x1 - 122, sy, 116, 6);
        for (let x = x1 - 112; x < x1 - 14; x += 20) {
          if (r() < 0.5) { c.fillStyle = U.pick(r, ['#f7f3ea', '#efb4ae', '#a6d3d4', '#f2d88a']); c.beginPath(); c.moveTo(x - 7, sy - 15); c.lineTo(x + 7, sy - 15); c.lineTo(x + 5, sy); c.lineTo(x - 5, sy); c.closePath(); c.fill(); }
          else { c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(x - 7, sy - 24, 14, 24); c.fillStyle = U.pick(r, ['#6b4022', '#c98e5a', '#e7c27a']); c.fillRect(x - 6, sy - 16, 12, 15); }
        }
      }
      for (let i = 0; i < 14; i++) { const x = x1 - 28 + (r() - 0.5) * 16, y = 182 + i * 7; c.fillStyle = U.pick(r, ['#4f8a3a', '#62a042', '#7bb553']); c.beginPath(); c.ellipse(x, y, 6, 3.5, r() * 3, 0, 7); c.fill(); }
      // string lights and two brass pendant lamps
      c.strokeStyle = '#3b3226'; c.lineWidth = 1; c.beginPath();
      for (let x = x0; x <= x1; x += 4) c.lineTo(x, 104 + Math.sin(((x - x0) / w) * Math.PI) * 16);
      c.stroke();
      for (let x = x0 + 12; x < x1; x += 22) { const y = 108 + Math.sin(((x - x0) / w) * Math.PI) * 16; glow(c, x, y, 14, 'rgba(255,220,140,0.7)'); c.fillStyle = '#fff1c4'; c.beginPath(); c.arc(x, y, 2.6, 0, 7); c.fill(); }
      for (const lx of [x0 + 74, x1 - 70]) {
        c.strokeStyle = '#1e1e1e'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(lx, y0); c.lineTo(lx, 132); c.stroke();
        c.fillStyle = '#c9a24a'; c.beginPath(); c.ellipse(lx, 146, 20, 15, 0, Math.PI, 0); c.fill();
        c.fillStyle = '#fff3c8'; c.beginPath(); c.ellipse(lx, 146, 13, 4, 0, 0, Math.PI); c.fill();
        glow(c, lx, 156, 130, 'rgba(255,206,130,0.42)');
      }
      // the counter: marble top, wooden front
      c.fillStyle = '#7a5236'; c.fillRect(x0, 388, w, y1 - 388);
      c.strokeStyle = 'rgba(40,24,14,0.4)'; c.lineWidth = 1.5;
      for (let x = x0 + 8; x < x1; x += 16) { c.beginPath(); c.moveTo(x, 392); c.lineTo(x, y1); c.stroke(); }
      c.fillStyle = '#ece6da'; c.fillRect(x0, 378, w, 12);
      c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x0, 390, w, 4);
      // cakes under glass domes, croissants, a little espresso machine
      const dome = (x, cake) => {
        c.fillStyle = '#d9cbb0'; c.fillRect(x - 22, 374, 44, 4); c.fillRect(x - 2, 362, 4, 12);
        c.fillStyle = '#efe6d6'; c.fillRect(x - 24, 358, 48, 4);
        cake(x);
        c.fillStyle = 'rgba(220,240,255,0.16)'; c.beginPath(); c.arc(x, 358, 30, Math.PI, 0); c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1.4; c.beginPath(); c.arc(x, 358, 30, Math.PI, 0); c.stroke();
        c.beginPath(); c.arc(x, 358, 24, Math.PI * 1.15, Math.PI * 1.4); c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.8)'; c.beginPath(); c.arc(x, 326, 3, 0, 7); c.fill();
      };
      dome(x0 + 40, (x) => {
        c.fillStyle = '#efb4ae'; c.fillRect(x - 18, 334, 36, 24);
        c.fillStyle = '#fff3ea'; c.fillRect(x - 18, 344, 36, 3); c.fillRect(x - 18, 332, 36, 4);
        c.fillStyle = '#c9474f'; for (const dx of [-12, -4, 4, 12]) { c.beginPath(); c.arc(x + dx, 330, 2.6, 0, 7); c.fill(); }
      });
      dome(x0 + 108, (x) => {
        c.fillStyle = '#e0b060'; c.beginPath(); c.moveTo(x - 20, 358); c.lineTo(x + 20, 358); c.lineTo(x + 17, 346); c.lineTo(x - 17, 346); c.closePath(); c.fill();
        c.fillStyle = '#f7d94a'; c.beginPath(); c.ellipse(x, 346, 17, 4, 0, 0, 7); c.fill();
        c.strokeStyle = '#fff8e0'; c.lineWidth = 1.4; c.beginPath(); c.arc(x - 6, 346, 3, 0, 7); c.arc(x + 6, 346, 3, 0, 7); c.stroke();
      });
      for (let k = 0; k < 4; k++) {
        const x = x1 - 132 + k * 13 + (k % 2) * 3, y = 372 - (k % 2) * 6;
        c.fillStyle = '#d99a4e'; c.beginPath(); c.ellipse(x, y, 10, 6, (k % 2 ? 0.3 : -0.3), Math.PI, 0); c.fill();
        c.strokeStyle = '#b8742f'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 4, y - 5); c.lineTo(x - 2, y); c.moveTo(x + 3, y - 5); c.lineTo(x + 2, y); c.stroke();
      }
      c.fillStyle = '#9aa3ad'; c.fillRect(x1 - 66, 336, 46, 42);
      c.fillStyle = '#d9e0e6'; c.fillRect(x1 - 58, 336, 10, 42);
      c.fillStyle = '#c87a45'; c.beginPath(); c.ellipse(x1 - 43, 336, 19, 15, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#26221f'; c.fillRect(x1 - 54, 360, 20, 4);
      c.fillStyle = '#f9f6ef'; c.fillRect(x1 - 50, 368, 9, 9);
      // a big leafy plant in the corner
      c.fillStyle = '#c8763f'; c.beginPath(); c.moveTo(x0 + 8, 450); c.lineTo(x0 + 52, 450); c.lineTo(x0 + 46, y1); c.lineTo(x0 + 14, y1); c.closePath(); c.fill();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (r() - 0.5) * 2.4, len = 40 + r() * 40;
        c.save(); c.translate(x0 + 30, 452); c.rotate(a);
        c.fillStyle = U.pick(r, ['#3f7a3a', '#4f8a3c', '#5d9644']);
        c.beginPath(); c.ellipse(len * 0.6, 0, len * 0.45, 12 + r() * 6, 0, 0, 7); c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(len * 0.2, 0); c.lineTo(len, 0); c.stroke();
        c.restore();
      }
      glow(c, (x0 + x1) / 2, 300, 200, 'rgba(255,200,120,0.12)');
    },
    // inside a beach hut: painted boards, bunting, a deckchair, towels on
    // hooks, a kettle on a little stove and a shelf of beach finds
    hut(c, r, x0, y0, x1, y1) {
      const w = x1 - x0;
      c.fillStyle = '#dcefee'; c.fillRect(x0, y0, w, y1 - y0);
      for (let x = x0 + 22; x < x1; x += 22) { c.fillStyle = 'rgba(80,120,120,0.2)'; c.fillRect(x, y0, 1.5, y1 - y0); c.fillStyle = 'rgba(255,255,255,0.55)'; c.fillRect(x + 1.5, y0, 1, y1 - y0); }
      // floorboards
      c.fillStyle = '#c9a77a'; c.fillRect(x0, 452, w, y1 - 452);
      c.fillStyle = 'rgba(90,60,30,0.3)'; for (let y = 462; y < y1; y += 12) c.fillRect(x0, y, w, 1.5);
      c.fillStyle = 'rgba(60,40,20,0.25)'; c.fillRect(x0, 452, w, 5);
      // bunting across the top
      c.strokeStyle = '#7a6a58'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(x0, 104); c.quadraticCurveTo((x0 + x1) / 2, 132, x1, 104); c.stroke();
      const bc = ['#e2574c', '#f2c230', '#3d86c6', '#5cae5a', '#ef8aa6', '#f7f3ea'];
      for (let i = 0; i < 12; i++) {
        const t = (i + 0.5) / 12, x = x0 + w * t, y = 104 + 4 * 28 * t * (1 - t) * 0.5 + 1;
        c.fillStyle = bc[i % bc.length]; c.beginPath(); c.moveTo(x - 9, y); c.lineTo(x + 9, y); c.lineTo(x, y + 18); c.closePath(); c.fill();
      }
      // a shelf of shells and a jar of sea glass
      c.fillStyle = '#a77b56'; c.fillRect(x0 + 6, 206, 114, 7);
      c.fillStyle = 'rgba(40,30,20,0.2)'; c.fillRect(x0 + 6, 213, 114, 4);
      c.fillStyle = '#f2cfc1'; c.beginPath(); c.moveTo(x0 + 24, 206); c.arc(x0 + 24, 206, 13, Math.PI, 0); c.closePath(); c.fill();
      c.strokeStyle = '#d4a090'; c.lineWidth = 0.8; for (let k = 1; k < 6; k++) { const a = Math.PI + (k / 6) * Math.PI; c.beginPath(); c.moveTo(x0 + 24, 206); c.lineTo(x0 + 24 + Math.cos(a) * 13, 206 + Math.sin(a) * 13); c.stroke(); }
      c.fillStyle = '#efe0c8'; c.beginPath(); c.ellipse(x0 + 52, 194, 7, 12, 0.3, 0, 7); c.fill();
      c.strokeStyle = '#c8b090'; c.beginPath(); c.ellipse(x0 + 52, 196, 5, 3, 0.3, 0, Math.PI); c.stroke();
      c.fillStyle = '#ee8a4f'; c.beginPath();
      for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k / 10) * 6.283, rr = k % 2 ? 4 : 10; c.lineTo(x0 + 76 + Math.cos(a) * rr, 196 + Math.sin(a) * rr); }
      c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x0 + 92, 172, 24, 34);
      for (let k = 0; k < 14; k++) { c.fillStyle = U.pick(r, ['#7fc8b0', '#9fd0ea', '#bfe6d0', '#5ea88e', '#ffffff']); c.beginPath(); c.arc(x0 + 96 + r() * 16, 186 + r() * 18, 3, 0, 7); c.fill(); }
      c.fillStyle = '#c9a06a'; c.fillRect(x0 + 94, 166, 20, 7);
      // a little picture of the sea
      c.fillStyle = '#f7f3ea'; c.fillRect(x1 - 108, 150, 90, 72);
      const sg = c.createLinearGradient(0, 158, 0, 214); sg.addColorStop(0, '#9fd0ea'); sg.addColorStop(0.55, '#e9f4f2'); sg.addColorStop(0.56, '#3d8fae'); sg.addColorStop(1, '#2f7390');
      c.fillStyle = sg; c.fillRect(x1 - 100, 158, 74, 56);
      c.fillStyle = '#f7f3ea'; c.beginPath(); c.moveTo(x1 - 64, 186); c.lineTo(x1 - 64, 168); c.lineTo(x1 - 54, 186); c.closePath(); c.fill();
      c.fillStyle = '#c9474f'; c.fillRect(x1 - 70, 186, 20, 4);
      // towels on hooks
      for (const [x, a, b] of [[x1 - 96, '#ef8aa6', '#f7f3ea'], [x1 - 56, '#f2c230', '#3d86c6']]) {
        c.fillStyle = '#8a8f96'; c.beginPath(); c.arc(x + 15, 314, 3, 0, 7); c.fill();
        c.fillStyle = a; c.beginPath(); c.moveTo(x + 2, 318); c.lineTo(x + 28, 318); c.lineTo(x + 30, 382); c.lineTo(x, 382); c.closePath(); c.fill();
        c.fillStyle = b; for (let y = 328; y < 380; y += 14) c.fillRect(x + 1, y, 29, 5);
        c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x + 22, 318, 6, 64);
      }
      // a kettle on a camping stove, on a little table
      c.fillStyle = '#a77b56'; c.fillRect(x1 - 110, 400, 96, 8);
      c.fillStyle = '#8a6142'; c.fillRect(x1 - 104, 408, 6, 44); c.fillRect(x1 - 26, 408, 6, 44);
      c.fillStyle = '#6b7178'; c.fillRect(x1 - 84, 386, 46, 14);
      c.fillStyle = '#3d4148'; c.fillRect(x1 - 80, 383, 38, 4);
      c.fillStyle = '#3f9b8b'; c.beginPath(); c.ellipse(x1 - 61, 370, 20, 15, 0, Math.PI, 0); c.fill(); c.fillRect(x1 - 81, 369, 40, 15);
      c.strokeStyle = '#3f9b8b'; c.lineWidth = 4; c.beginPath(); c.moveTo(x1 - 80, 376); c.lineTo(x1 - 92, 362); c.stroke();
      c.strokeStyle = '#2b2b30'; c.lineWidth = 2.5; c.beginPath(); c.arc(x1 - 61, 358, 13, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
      c.fillStyle = '#2b2b30'; c.beginPath(); c.arc(x1 - 61, 354, 3, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(x1 - 76, 362, 6, 18);
      for (let k = 0; k < 4; k++) { c.fillStyle = `rgba(255,255,255,${0.5 - k * 0.1})`; c.beginPath(); c.arc(x1 - 95 - k * 3, 350 - k * 12, 4 + k * 2, 0, 7); c.fill(); }
      // a striped deckchair
      c.strokeStyle = '#8a6142'; c.lineWidth = 4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x0 + 22, 470); c.lineTo(x0 + 40, 342); c.moveTo(x0 + 108, 470); c.lineTo(x0 + 92, 342); c.moveTo(x0 + 38, 344); c.lineTo(x0 + 94, 344); c.moveTo(x0 + 26, 446); c.lineTo(x0 + 104, 446); c.stroke();
      c.save(); c.beginPath(); c.moveTo(x0 + 42, 348); c.lineTo(x0 + 90, 348); c.lineTo(x0 + 98, 420); c.quadraticCurveTo(x0 + 66, 444, x0 + 34, 420); c.closePath(); c.clip();
      for (let k = 0; k < 7; k++) { c.fillStyle = ['#e2574c', '#f7f3ea', '#3d86c6'][k % 3]; c.fillRect(x0 + 34 + k * 9.5, 340, 9.5, 110); }
      c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(x0 + 30, 404, 80, 40);
      c.restore();
      glow(c, (x0 + x1) / 2, 260, 220, 'rgba(255,236,200,0.14)');
    },
    // the animal rescue's office: photos of pets that found a home pinned to
    // a corkboard, a desk with a lamp and a mug, a dog asleep in its bed
    office(c, r, x0, y0, x1, y1) {
      const w = x1 - x0;
      c.fillStyle = '#f1ead8'; c.fillRect(x0, y0, w, 300 - y0);
      c.fillStyle = 'rgba(200,170,120,0.18)'; for (let x = x0 + 8; x < x1; x += 20) c.fillRect(x, y0, 6, 300 - y0);
      c.fillStyle = '#a9c3a6'; c.fillRect(x0, 300, w, 452 - 300);
      c.fillStyle = 'rgba(60,90,60,0.15)'; for (let x = x0 + 22; x < x1; x += 44) c.fillRect(x, 304, 2, 148);
      c.fillStyle = '#7d9c7a'; c.fillRect(x0, 296, w, 8);
      c.fillStyle = '#b98654'; c.fillRect(x0, 452, w, y1 - 452);
      c.fillStyle = 'rgba(90,60,30,0.3)'; for (let y = 464; y < y1; y += 14) c.fillRect(x0, y, w, 1.5);
      // the corkboard of happy endings
      c.fillStyle = '#8a5a3c'; c.fillRect(x0 + 12, 110, 110, 116);
      c.fillStyle = '#c99a62'; c.fillRect(x0 + 17, 115, 100, 106);
      for (let i = 0; i < 160; i++) { c.fillStyle = r() < 0.5 ? 'rgba(120,80,40,0.3)' : 'rgba(255,230,190,0.3)'; c.fillRect(x0 + 17 + r() * 100, 115 + r() * 106, 1.4, 1.4); }
      const bg = ['#a6d3d4', '#f2d88a', '#efb4ae', '#bba9df', '#9cc5a1', '#f4c9a8'];
      const fur = ['#e2b36a', '#3b3533', '#a8754a', '#f4efe6', '#9ba5af', '#e39a52'];
      for (let i = 0; i < 6; i++) {
        const px = x0 + 34 + (i % 3) * 32, py = 140 + Math.floor(i / 3) * 50;
        c.save(); c.translate(px, py); c.rotate((r() - 0.5) * 0.3);
        c.fillStyle = 'rgba(40,30,20,0.25)'; c.fillRect(-11, -12, 25, 30);
        c.fillStyle = '#ffffff'; c.fillRect(-13, -14, 25, 30);
        c.fillStyle = bg[i]; c.fillRect(-10, -11, 19, 18);
        const cat = i % 2 === 1;
        c.fillStyle = fur[i];
        if (cat) { c.beginPath(); c.moveTo(-6, -4); c.lineTo(-5, -10); c.lineTo(-2, -6); c.closePath(); c.fill(); c.beginPath(); c.moveTo(5, -4); c.lineTo(4, -10); c.lineTo(1, -6); c.closePath(); c.fill(); }
        else { c.beginPath(); c.ellipse(-6, -2, 2.5, 4.5, 0.4, 0, 7); c.fill(); c.beginPath(); c.ellipse(5, -2, 2.5, 4.5, -0.4, 0, 7); c.fill(); }
        c.beginPath(); c.arc(-0.5, -1, 5.5, 0, 7); c.fill();
        c.fillStyle = '#2b2422'; c.fillRect(-3, -2.5, 1.4, 1.4); c.fillRect(1, -2.5, 1.4, 1.4); c.fillRect(-1.2, 0.5, 1.6, 1.2);
        c.fillStyle = U.pick(r, ['#e2574c', '#3d86c6', '#f2c230']); c.beginPath(); c.arc(-0.5, -13, 2.2, 0, 7); c.fill();
        c.restore();
      }
      // a note with a heart on it
      c.fillStyle = '#fff6b8'; c.fillRect(x0 + 84, 192, 26, 24);
      c.fillStyle = '#e2574c'; c.beginPath(); c.moveTo(x0 + 97, 210); c.bezierCurveTo(x0 + 86, 202, x0 + 92, 194, x0 + 97, 200); c.bezierCurveTo(x0 + 102, 194, x0 + 108, 202, x0 + 97, 210); c.fill();
      // a clock, and leads hanging on hooks
      c.fillStyle = '#f7f3ea'; c.beginPath(); c.arc(x1 - 92, 150, 22, 0, 7); c.fill();
      c.strokeStyle = '#4b4a52'; c.lineWidth = 3; c.beginPath(); c.arc(x1 - 92, 150, 22, 0, 7); c.stroke();
      c.lineWidth = 2; c.beginPath(); c.moveTo(x1 - 92, 150); c.lineTo(x1 - 92, 136); c.moveTo(x1 - 92, 150); c.lineTo(x1 - 82, 154); c.stroke();
      c.fillStyle = '#7d5434'; c.fillRect(x1 - 58, 122, 46, 6);
      ['#e2574c', '#3d86c6', '#4f9d7a'].forEach((col, i) => {
        const hx = x1 - 52 + i * 15;
        c.strokeStyle = col; c.lineWidth = 3; c.lineCap = 'round';
        c.beginPath(); c.moveTo(hx, 128); c.quadraticCurveTo(hx - 6, 190, hx + 2, 236); c.stroke();
        c.beginPath(); c.ellipse(hx + 2, 244, 4, 8, 0, 0, 7); c.stroke();
      });
      // the desk, with a lamp, a mug of tea, a pile of folders and a pot plant
      c.fillStyle = '#8a5a3c'; c.fillRect(x0 + 132, 372, w - 132, 12);
      c.fillStyle = '#a77b56'; c.fillRect(x0 + 132, 368, w - 132, 8);
      c.fillStyle = '#7d5434'; c.fillRect(x0 + 140, 384, 8, 68); c.fillRect(x1 - 14, 384, 8, 68);
      c.fillStyle = '#3d5a86'; c.fillRect(x0 + 150, 348, 50, 10); c.fillStyle = '#f2d88a'; c.fillRect(x0 + 154, 338, 46, 10); c.fillStyle = '#e98a6e'; c.fillRect(x0 + 148, 328, 48, 10);
      c.strokeStyle = '#4b4a52'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0 + 222, 368); c.lineTo(x0 + 222, 330); c.lineTo(x0 + 236, 318); c.stroke();
      c.fillStyle = '#4e7b5b'; c.beginPath(); c.moveTo(x0 + 226, 312); c.lineTo(x0 + 252, 312); c.lineTo(x0 + 246, 296); c.lineTo(x0 + 232, 296); c.closePath(); c.fill();
      glow(c, x0 + 239, 318, 90, 'rgba(255,214,140,0.5)');
      c.fillStyle = '#ffffff'; c.fillRect(x1 - 36, 348, 16, 20);
      c.strokeStyle = '#ffffff'; c.lineWidth = 2.5; c.beginPath(); c.arc(x1 - 19, 358, 5, -1.2, 1.2); c.stroke();
      c.fillStyle = '#c9474f'; c.fillRect(x1 - 33, 354, 10, 3);
      for (let k = 0; k < 3; k++) { c.fillStyle = `rgba(255,255,255,${0.5 - k * 0.14})`; c.beginPath(); c.arc(x1 - 28 + k * 2, 338 - k * 10, 3 + k, 0, 7); c.fill(); }
      c.fillStyle = '#d98b63'; c.fillRect(x0 + 262, 346, 16, 22);
      for (let i = 0; i < 9; i++) { c.fillStyle = U.pick(r, ['#4f8a3a', '#62a042', '#7bb553']); c.beginPath(); c.ellipse(x0 + 270 + (r() - 0.5) * 22, 338 - r() * 22, 7, 3.5, r() * 3, 0, 7); c.fill(); }
      // a dog bed on the floor with a sleeping dog curled up in it
      c.fillStyle = 'rgba(40,30,20,0.2)'; c.beginPath(); c.ellipse(x0 + 72, 470, 60, 16, 0, 0, 7); c.fill();
      c.fillStyle = '#c9474f'; c.beginPath(); c.ellipse(x0 + 70, 456, 58, 24, 0, 0, 7); c.fill();
      c.fillStyle = '#f2d88a'; c.beginPath(); c.ellipse(x0 + 70, 452, 44, 15, 0, 0, 7); c.fill();
      c.fillStyle = '#e2b36a'; c.beginPath(); c.ellipse(x0 + 74, 444, 32, 13, 0, 0, 7); c.fill();
      c.beginPath(); c.arc(x0 + 46, 441, 11, 0, 7); c.fill();
      c.fillStyle = '#c48c48'; c.beginPath(); c.ellipse(x0 + 40, 437, 5, 9, 0.6, 0, 7); c.fill();
      c.strokeStyle = '#2b2422'; c.lineWidth = 1.4; c.beginPath(); c.arc(x0 + 49, 440, 2.5, 0.2, 2.9); c.stroke();
      c.fillStyle = '#2b2422'; c.beginPath(); c.arc(x0 + 37, 444, 2, 0, 7); c.fill();
      c.strokeStyle = '#c48c48'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0 + 104, 446); c.quadraticCurveTo(x0 + 112, 432, x0 + 98, 430); c.stroke();
      c.fillStyle = 'rgba(80,100,150,0.7)'; c.font = '800 10px ui-rounded, system-ui, sans-serif'; c.textAlign = 'center'; c.fillText('z', x0 + 56, 420); c.font = '800 13px ui-rounded, system-ui, sans-serif'; c.fillText('z', x0 + 66, 406);
      glow(c, (x0 + x1) / 2, 300, 200, 'rgba(255,230,190,0.12)');
    },
    // inside the old glasshouse: light through the far glass, slatted benches
    // of pots and seedlings, a tomato vine up a cane, a hanging basket
    glasshouse(c, r, x0, y0, x1, y1) {
      const w = x1 - x0;
      const sky = c.createLinearGradient(0, y0, 0, y1);
      sky.addColorStop(0, '#e4f2ec'); sky.addColorStop(0.6, '#d5ead9'); sky.addColorStop(1, '#c4dcc0');
      c.fillStyle = sky; c.fillRect(x0, y0, w, y1 - y0);
      // the far side of the glasshouse: white glazing bars and green beyond
      for (let i = 0; i < 9; i++) { c.fillStyle = U.pick(r, ['#9cc58a', '#8dba7c', '#a9cf96']); c.beginPath(); c.ellipse(x0 + r() * w, 300 + r() * 40, 30 + r() * 30, 18 + r() * 12, 0, 0, 7); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,0.55)';
      for (let x = x0 + 18; x < x1; x += 44) c.fillRect(x, y0, 3, 330 - y0);
      c.fillRect(x0, 150, w, 3); c.fillRect(x0, 240, w, 3);
      // a tomato vine climbing a cane on the left
      c.strokeStyle = '#b98654'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x0 + 26, 420); c.lineTo(x0 + 30, 170); c.stroke();
      for (let y = 190; y < 410; y += 22) {
        const s = y % 44 ? 1 : -1;
        c.fillStyle = U.pick(r, ['#4f8a3a', '#62a042', '#5b9640']); c.beginPath(); c.ellipse(x0 + 28 + s * 12, y, 11, 5, s * 0.5, 0, 7); c.fill();
        if (r() < 0.55) { c.fillStyle = U.pick(r, ['#e2483a', '#e86a3a', '#d93b30']); c.beginPath(); c.arc(x0 + 28 - s * 9, y + 8, 5, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); c.arc(x0 + 26 - s * 9, y + 6, 1.4, 0, 7); c.fill(); }
      }
      // slatted benches with pots on them
      const pot = (x, y, s) => {
        c.fillStyle = '#b8653f'; c.beginPath(); c.moveTo(x - s, y - s * 1.1); c.lineTo(x + s, y - s * 1.1); c.lineTo(x + s * 0.75, y); c.lineTo(x - s * 0.75, y); c.closePath(); c.fill();
        c.fillStyle = '#cf7b52'; c.fillRect(x - s * 1.08, y - s * 1.3, s * 2.16, s * 0.34);
        const kind = (r() * 3) | 0;
        for (let k = 0; k < 6; k++) { c.fillStyle = U.pick(r, ['#4f8a3a', '#62a042', '#7bb553']); c.beginPath(); c.ellipse(x + (r() - 0.5) * s * 1.6, y - s * 1.5 - r() * s * 1.1, s * 0.5, s * 0.26, r() * 3, 0, 7); c.fill(); }
        if (kind === 0) for (let k = 0; k < 3; k++) { c.fillStyle = U.pick(r, ['#e0485a', '#f06a7e', '#f29ab0']); c.beginPath(); c.arc(x + (r() - 0.5) * s * 1.4, y - s * 2.2 - r() * s * 0.6, s * 0.3, 0, 7); c.fill(); }
        if (kind === 1) for (let k = 0; k < 2; k++) { c.fillStyle = '#f7f3ea'; c.beginPath(); c.arc(x + (k - 0.5) * s * 0.9, y - s * 2.3, s * 0.28, 0, 7); c.fill(); c.fillStyle = '#f2c230'; c.beginPath(); c.arc(x + (k - 0.5) * s * 0.9, y - s * 2.3, s * 0.1, 0, 7); c.fill(); }
      };
      for (const [by, n] of [[330, 6], [452, 5]]) {
        c.fillStyle = '#8a5a3c'; c.fillRect(x0 + 50, by, w - 56, 6); c.fillRect(x0 + 50, by + 8, w - 56, 6);
        c.fillStyle = '#6b4a32'; c.fillRect(x0 + 58, by + 14, 6, y1 - by); c.fillRect(x1 - 18, by + 14, 6, y1 - by);
        for (let i = 0; i < n; i++) pot(x0 + 78 + i * ((w - 96) / n) + r() * 6, by, 10 + r() * 4);
      }
      // a hanging basket of trailing flowers
      c.strokeStyle = '#6b6258'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x1 - 70, y0); c.lineTo(x1 - 84, 170); c.moveTo(x1 - 70, y0); c.lineTo(x1 - 56, 170); c.stroke();
      c.fillStyle = '#7a5a3a'; c.beginPath(); c.ellipse(x1 - 70, 174, 22, 10, 0, 0, Math.PI); c.fill();
      for (let k = 0; k < 14; k++) { c.fillStyle = U.pick(r, ['#4f8a3a', '#62a042']); c.beginPath(); c.ellipse(x1 - 70 + (r() - 0.5) * 44, 172 + r() * 26, 5, 2.6, r() * 3, 0, 7); c.fill(); }
      for (let k = 0; k < 9; k++) { c.fillStyle = U.pick(r, ['#bba9df', '#e98aa2', '#ffffff']); c.beginPath(); c.arc(x1 - 70 + (r() - 0.5) * 40, 168 + r() * 26, 2.8, 0, 7); c.fill(); }
      // a watering can on the brick floor
      c.fillStyle = '#b9c0c4'; c.fillRect(x0 + 90, y1 - 34, 34, 26);
      c.strokeStyle = '#b9c0c4'; c.lineWidth = 4; c.beginPath(); c.moveTo(x0 + 122, y1 - 26); c.lineTo(x0 + 146, y1 - 46); c.stroke();
      c.beginPath(); c.arc(x0 + 107, y1 - 36, 11, Math.PI, 0); c.stroke();
      glow(c, (x0 + x1) / 2, 200, 220, 'rgba(255,250,220,0.18)');
    },
    bookshop(c, r, x0, y0, x1, y1) {
      const w = x1 - x0;
      const spine = ['#c9474f', '#3d5a86', '#f2d88a', '#4e7b5b', '#efb4ae', '#bba9df', '#d98b63', '#2f4a3e', '#f4ecdc'];
      // shelves of books right up to the ceiling
      c.fillStyle = '#5b3a26'; c.fillRect(x0, y0, w, y1 - y0);
      for (let sy = y0 + 50; sy < 380; sy += 64) {
        let bx = x0 + 4;
        while (bx < x1 - 8) {
          const bw = 7 + r() * 9, bh = 34 + r() * 20;
          if (r() < 0.07) { bx += 9; continue; }
          c.fillStyle = U.pick(r, spine); c.fillRect(bx, sy - bh, bw - 1.5, bh);
          c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(bx + 1, sy - bh + 6, bw - 3.5, 2); c.fillRect(bx + 1, sy - 10, bw - 3.5, 2);
          bx += bw;
        }
        c.fillStyle = '#3e2718'; c.fillRect(x0, sy, w, 8);
        c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x0, sy, w, 2);
      }
      glow(c, (x0 + x1) / 2, y0 + 80, 220, 'rgba(255,214,140,0.35)');
      // the window display: two steps of books standing face out, and a stack
      c.fillStyle = '#8a5a3c'; c.fillRect(x0, 404, w, 12); c.fillRect(x0, 456, w, y1 - 456);
      c.fillStyle = '#a7774f'; c.fillRect(x0, 404, w, 3); c.fillRect(x0, 456, w, 3);
      const cover = (x, y, bw, bh, col) => {
        c.fillStyle = 'rgba(30,20,10,0.3)'; c.fillRect(x + 3, y + 3, bw, bh);
        c.fillStyle = col; c.fillRect(x, y, bw, bh);
        c.fillStyle = 'rgba(255,255,255,0.75)'; c.fillRect(x + 5, y + 8, bw - 10, 5); c.fillRect(x + 8, y + 16, bw - 16, 3);
        c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.arc(x + bw / 2, y + bh * 0.62, bw * 0.22, 0, 7); c.fill();
      };
      for (let x = x0 + 12; x < x1 - 48; x += 64) cover(x, 346 - r() * 8, 40, 58, U.pick(r, spine.slice(0, 7)));
      for (let x = x0 + 44; x < x1 - 80; x += 72) cover(x, 404, 36, 52, U.pick(r, spine.slice(0, 7)));
      for (let k = 0; k < 5; k++) { c.fillStyle = U.pick(r, spine); c.fillRect(x1 - 70 + (r() - 0.5) * 6, 446 - k * 10, 54, 9); c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(x1 - 66, 449 - k * 10, 46, 1.5); }
      // a little OPEN card hanging in the glass
      const ox = x0 + w * 0.25;
      c.strokeStyle = '#3b3226'; c.lineWidth = 1; c.beginPath(); c.moveTo(ox - 14, y0); c.lineTo(ox - 22, 124); c.moveTo(ox + 14, y0); c.lineTo(ox + 22, 124); c.stroke();
      c.fillStyle = '#fffaf0'; c.fillRect(ox - 30, 124, 60, 28);
      c.strokeStyle = '#c9474f'; c.lineWidth = 1.5; c.strokeRect(ox - 27, 127, 54, 22);
      c.fillStyle = '#c9474f'; c.font = '800 14px ui-rounded, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('OPEN', ox, 139);
    },
    // the pottery workshop: lime-washed walls, shelves of pots drying and
    // glazed, the wheel with a pot on it, a bag of clay and the tools on hooks
    pottery(c, r, x0, y0, x1, y1) {
      const w = x1 - x0;
      c.fillStyle = '#f1e6d2'; c.fillRect(x0, y0, w, y1 - y0);
      for (let i = 0; i < 26; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '190,160,120' : '255,255,245'},${(0.08 + r() * 0.1).toFixed(2)})`; c.beginPath(); c.ellipse(x0 + r() * w, y0 + r() * (y1 - y0), 14 + r() * 30, 8 + r() * 16, r() * 3, 0, 7); c.fill(); }
      // the brick plinth and terracotta tiles on the floor
      c.fillStyle = '#c47a52'; c.fillRect(x0, 448, w, y1 - 448);
      for (let y = 448, row = 0; y < y1; y += 14, row++) for (let x = x0 - (row % 2) * 16; x < x1; x += 32) { c.fillStyle = U.pick(r, ['#c67b50', '#b9704a', '#d08a5e', '#bd6f45']); c.fillRect(x + 1, y + 1, 30, 12); }
      c.fillStyle = 'rgba(70,40,20,0.25)'; c.fillRect(x0, 448, w, 4);
      // a pendant lamp
      const lx = x0 + w * 0.26;
      c.strokeStyle = '#3d3d42'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(lx, y0); c.lineTo(lx, 118); c.stroke();
      c.fillStyle = '#d98b63'; c.beginPath(); c.moveTo(lx - 20, 140); c.lineTo(lx + 20, 140); c.lineTo(lx + 7, 118); c.lineTo(lx - 7, 118); c.closePath(); c.fill();
      c.fillStyle = '#fff1c4'; c.beginPath(); c.ellipse(lx, 140, 13, 3.5, 0, 0, Math.PI); c.fill();
      glow(c, lx, 150, 170, 'rgba(255,214,140,0.42)');
      // shelves of pots: bisque on the top shelf, glazed below
      const pot = (x, y, s, col, kind) => {
        c.fillStyle = 'rgba(60,35,20,0.18)'; c.beginPath(); c.ellipse(x + 2, y, s * 0.9, s * 0.18, 0, 0, 7); c.fill();
        c.fillStyle = col; c.beginPath();
        if (kind === 0) { c.moveTo(x - s * 0.9, y - s * 1.0); c.quadraticCurveTo(x - s * 0.95, y, x, y); c.quadraticCurveTo(x + s * 0.95, y, x + s * 0.9, y - s * 1.0); c.closePath(); } // a bowl
        else if (kind === 1) { c.moveTo(x - s * 0.35, y - s * 2.2); c.lineTo(x + s * 0.35, y - s * 2.2); c.quadraticCurveTo(x + s * 0.2, y - s * 1.6, x + s * 0.75, y - s * 0.9); c.quadraticCurveTo(x + s * 0.9, y, x, y); c.quadraticCurveTo(x - s * 0.9, y, x - s * 0.75, y - s * 0.9); c.quadraticCurveTo(x - s * 0.2, y - s * 1.6, x - s * 0.35, y - s * 2.2); c.closePath(); } // a vase
        else { c.rect(x - s * 0.6, y - s * 1.5, s * 1.2, s * 1.5); c.moveTo(x + s * 0.6, y - s * 1.2); c.arc(x + s * 0.6, y - s * 0.8, s * 0.36, -1.4, 1.4); } // a mug
        c.fill();
        c.fillStyle = 'rgba(255,255,255,0.28)'; c.fillRect(x - s * 0.5, y - s * (kind === 1 ? 1.5 : kind === 2 ? 1.3 : 0.8), s * 0.18, s * 0.5);
        if (col !== '#e8b48a' && r() < 0.6) { c.fillStyle = 'rgba(255,255,255,0.5)'; for (let k = -1; k <= 1; k++) c.fillRect(x + k * s * 0.35 - 1, y - s * 0.5, 2, 2); }
      };
      for (const [sy, cols] of [[176, ['#e8b48a']], [252, ['#9cc5a1', '#f4ecdc', '#8fbfe6', '#d98b63', '#3d5a86']]]) {
        for (const [sx0, sx1] of [[x0 + 6, x0 + 116], [x1 - 116, x1 - 6]]) {
          c.fillStyle = '#9a6b45'; c.fillRect(sx0, sy, sx1 - sx0, 7);
          c.fillStyle = 'rgba(40,25,15,0.2)'; c.fillRect(sx0, sy + 7, sx1 - sx0, 5);
          c.fillStyle = '#7d5434'; c.fillRect(sx0 + 8, sy + 7, 4, 12); c.fillRect(sx1 - 12, sy + 7, 4, 12);
          for (let x = sx0 + 14; x < sx1 - 10; x += 24) pot(x, sy, 8 + r() * 4, U.pick(r, cols), (r() * 3) | 0);
        }
      }
      // tools on hooks: a wire, a rib, a sponge
      c.fillStyle = '#7d5434'; c.fillRect(x1 - 92, 318, 80, 6);
      c.strokeStyle = '#8a8f96'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x1 - 80, 324); c.quadraticCurveTo(x1 - 84, 352, x1 - 76, 360); c.stroke();
      c.fillStyle = '#b98654'; c.fillRect(x1 - 82, 358, 8, 5);
      c.fillStyle = '#c9a77a'; c.beginPath(); c.ellipse(x1 - 54, 342, 9, 14, 0.2, 0, 7); c.fill();
      c.fillStyle = '#f2d88a'; c.beginPath(); c.roundRect(x1 - 36, 330, 18, 14, 5); c.fill();
      // the wheel, with a pot rising on it
      const wx = x0 + 62, wy = 420;
      c.fillStyle = 'rgba(40,25,15,0.25)'; c.beginPath(); c.ellipse(wx + 4, 452, 74, 10, 0, 0, 7); c.fill();
      c.fillStyle = '#6f8f6a'; c.beginPath(); c.moveTo(wx - 44, wy + 10); c.lineTo(wx + 44, wy + 10); c.lineTo(wx + 36, 450); c.lineTo(wx - 36, 450); c.closePath(); c.fill();
      c.fillStyle = '#b9c0c4'; c.beginPath(); c.ellipse(wx, wy + 8, 66, 16, 0, 0, 7); c.fill();
      c.fillStyle = '#d5dbde'; c.beginPath(); c.ellipse(wx, wy + 4, 62, 13, 0, 0, 7); c.fill();
      c.fillStyle = '#9aa3ad'; c.beginPath(); c.ellipse(wx, wy + 2, 38, 8, 0, 0, 7); c.fill();
      c.fillStyle = '#b9805e'; c.beginPath(); c.moveTo(wx - 22, wy + 2); c.quadraticCurveTo(wx - 30, wy - 26, wx - 14, wy - 46); c.lineTo(wx + 14, wy - 46); c.quadraticCurveTo(wx + 30, wy - 26, wx + 22, wy + 2); c.closePath(); c.fill();
      c.fillStyle = '#9c6a4c'; c.beginPath(); c.ellipse(wx, wy - 46, 14, 4, 0, 0, 7); c.fill();
      c.strokeStyle = 'rgba(255,230,210,0.35)'; c.lineWidth = 1; for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(wx, wy - 8 - k * 9, 22 - k * 2, 3, 0, 0, Math.PI); c.stroke(); }
      // a stool, a bag of clay and a bucket
      c.fillStyle = '#8a5a3c'; c.fillRect(x0 + 150, 404, 6, 46); c.fillRect(x0 + 178, 404, 6, 46);
      c.fillStyle = '#a77b56'; c.beginPath(); c.ellipse(x0 + 167, 402, 24, 7, 0, 0, 7); c.fill();
      c.fillStyle = '#7d8a6e'; c.beginPath(); c.moveTo(x1 - 70, 450); c.lineTo(x1 - 64, 398); c.quadraticCurveTo(x1 - 50, 388, x1 - 36, 398); c.lineTo(x1 - 30, 450); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x1 - 60, 416, 20, 12);
      c.fillStyle = '#c9cfd3'; c.beginPath(); c.moveTo(x1 - 26, 422); c.lineTo(x1 + 2, 422); c.lineTo(x1 - 2, 450); c.lineTo(x1 - 22, 450); c.closePath(); c.fill();
      glow(c, (x0 + x1) / 2, 320, 210, 'rgba(255,236,200,0.12)');
    },
    // a station waiting room: cream walls over a wine-red dado, a timetable,
    // a poster of the seaside, a long bench and a stove glowing in the corner
    waiting(c, r, x0, y0, x1, y1) {
      const w = x1 - x0;
      c.fillStyle = '#efe4cc'; c.fillRect(x0, y0, w, y1 - y0);
      for (let x = x0 + 18; x < x1; x += 36) { c.fillStyle = 'rgba(190,160,110,0.12)'; c.fillRect(x, y0, 14, 360 - y0); }
      c.fillStyle = '#8e3b3f'; c.fillRect(x0, 360, w, y1 - 360);
      for (let x = x0 + 4; x < x1; x += 22) { c.fillStyle = 'rgba(40,10,12,0.3)'; c.fillRect(x, 368, 2, y1 - 368); c.fillStyle = 'rgba(255,220,220,0.1)'; c.fillRect(x + 2, 368, 1.5, y1 - 368); }
      c.fillStyle = '#6b2a2e'; c.fillRect(x0, 356, w, 10); c.fillStyle = 'rgba(255,230,210,0.25)'; c.fillRect(x0, 356, w, 2);
      c.fillStyle = '#9a6b45'; c.fillRect(x0, 474, w, y1 - 474);
      c.fillStyle = 'rgba(70,40,20,0.35)'; for (let y = 484; y < y1; y += 11) c.fillRect(x0, y, w, 1.4);
      // a gas lamp
      const lx = x0 + w * 0.6;
      c.strokeStyle = '#2b2b30'; c.lineWidth = 2; c.beginPath(); c.moveTo(lx, y0); c.lineTo(lx, 112); c.stroke();
      c.fillStyle = '#fff3c8'; c.beginPath(); c.ellipse(lx, 126, 11, 15, 0, 0, 7); c.fill();
      c.strokeStyle = '#2b2b30'; c.lineWidth = 1.4; c.beginPath(); c.ellipse(lx, 126, 11, 15, 0, 0, 7); c.stroke();
      c.fillStyle = '#2b2b30'; c.fillRect(lx - 9, 108, 18, 5);
      glow(c, lx, 130, 170, 'rgba(255,214,140,0.45)');
      // the timetable board
      c.fillStyle = '#5b3a26'; c.fillRect(x0 + 10, 170, 106, 128);
      c.fillStyle = '#26302c'; c.fillRect(x0 + 16, 176, 94, 116);
      c.fillStyle = '#f4ecdc'; c.font = '800 10px ui-rounded, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TRAINS', x0 + 63, 188);
      c.fillStyle = 'rgba(244,236,220,0.75)';
      for (let k = 0; k < 7; k++) { const y = 202 + k * 12; c.fillRect(x0 + 22, y, 16, 3); c.fillRect(x0 + 44, y, 30 + r() * 26, 3); }
      c.fillStyle = '#e9bf4f'; c.fillRect(x0 + 22, 286, 60, 2);
      // a poster of the seaside
      c.fillStyle = '#f7f3ea'; c.fillRect(x1 - 104, 166, 84, 112);
      const pg = c.createLinearGradient(0, 172, 0, 244); pg.addColorStop(0, '#f2c27a'); pg.addColorStop(0.6, '#f7e0b0'); pg.addColorStop(0.61, '#3d8fae'); pg.addColorStop(1, '#2f7390');
      c.fillStyle = pg; c.fillRect(x1 - 98, 172, 72, 72);
      c.fillStyle = '#f7f3ea'; c.beginPath(); c.arc(x1 - 62, 200, 12, 0, 7); c.fill();
      c.fillStyle = '#e8d6a8'; c.beginPath(); c.moveTo(x1 - 98, 244); c.quadraticCurveTo(x1 - 70, 232, x1 - 26, 244); c.closePath(); c.fill();
      c.fillStyle = '#c9474f'; c.fillRect(x1 - 98, 250, 72, 18);
      c.fillStyle = '#f7f3ea'; c.fillRect(x1 - 90, 256, 56, 5);
      // the bench with a suitcase and an umbrella
      c.fillStyle = 'rgba(40,20,10,0.25)'; c.fillRect(x0 + 10, 470, 170, 6);
      c.fillStyle = '#7d5434'; c.fillRect(x0 + 18, 420, 8, 52); c.fillRect(x0 + 160, 420, 8, 52);
      for (const y of [384, 398]) { c.fillStyle = '#a77b56'; c.fillRect(x0 + 8, y, 172, 9); }
      c.fillStyle = '#a77b56'; c.fillRect(x0 + 6, 416, 176, 10); c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(x0 + 6, 416, 176, 2);
      c.fillStyle = '#3d5a86'; c.beginPath(); c.roundRect(x0 + 40, 384, 58, 34, 4); c.fill();
      c.fillStyle = '#c9a24a'; c.fillRect(x0 + 52, 384, 4, 34); c.fillRect(x0 + 82, 384, 4, 34);
      c.strokeStyle = '#2b3550'; c.lineWidth = 2.5; c.beginPath(); c.arc(x0 + 69, 384, 9, Math.PI, 0); c.stroke();
      c.strokeStyle = '#2b2b30'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0 + 136, 470); c.lineTo(x0 + 150, 388); c.stroke();
      c.fillStyle = '#4e7b5b'; c.beginPath(); c.moveTo(x0 + 150, 388); c.lineTo(x0 + 130, 460); c.lineTo(x0 + 146, 462); c.closePath(); c.fill();
      c.strokeStyle = '#2b2b30'; c.beginPath(); c.arc(x0 + 154, 386, 5, Math.PI, 0); c.stroke();
      // a black stove with a warm little window, its pipe going up
      const sx = x1 - 52;
      c.fillStyle = '#2b2b30'; c.fillRect(sx - 4, y0, 8, 380 - y0);
      c.fillStyle = '#34343a'; c.beginPath(); c.ellipse(sx, 420, 30, 44, 0, 0, 7); c.fill();
      c.fillStyle = '#26262b'; c.fillRect(sx - 36, 376, 72, 10); c.fillRect(sx - 30, 460, 60, 12);
      c.fillStyle = '#ffb35a'; c.beginPath(); c.roundRect(sx - 12, 408, 24, 18, 4); c.fill();
      c.fillStyle = '#ffe2a0'; c.fillRect(sx - 8, 414, 16, 6);
      glow(c, sx, 418, 80, 'rgba(255,170,90,0.4)');
      c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(sx - 20, 390, 5, 50);
      glow(c, (x0 + x1) / 2, 300, 220, 'rgba(255,236,200,0.1)');
    },
    // inside the signal box: windows all round onto the fields, the track
    // diagram, a shelf of block instruments with the brass bell, and the
    // row of levers in their frame
    signalbox(c, r, x0, y0, x1, y1) {
      const w = x1 - x0;
      // the far windows: sky, a hedge, a field
      const sky = c.createLinearGradient(0, y0, 0, 300); sky.addColorStop(0, '#bfe2ef'); sky.addColorStop(1, '#eef4e6');
      c.fillStyle = sky; c.fillRect(x0, y0, w, 300 - y0);
      c.fillStyle = '#a9cf8f'; c.beginPath(); c.moveTo(x0, 258); c.quadraticCurveTo(x0 + w * 0.4, 236, x1, 252); c.lineTo(x1, 300); c.lineTo(x0, 300); c.fill();
      for (let i = 0; i < 14; i++) { c.fillStyle = U.pick(r, ['#5d9644', '#4f8a3c', '#6aa04c']); c.beginPath(); c.arc(x0 + r() * w, 252 + r() * 10, 6 + r() * 8, 0, 7); c.fill(); }
      c.fillStyle = '#efe6d2';
      for (let x = x0 + 40; x < x1; x += 44) c.fillRect(x - 2, y0, 4, 300 - y0);
      c.fillRect(x0, 190, w, 4);
      // the track diagram, hung across the windows
      c.strokeStyle = '#3d3d42'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0 + 40, y0); c.lineTo(x0 + 50, 120); c.moveTo(x1 - 40, y0); c.lineTo(x1 - 50, 120); c.stroke();
      c.fillStyle = '#5b3a26'; c.fillRect(x0 + 20, 120, w - 40, 54);
      c.fillStyle = '#f4ecdc'; c.fillRect(x0 + 24, 124, w - 48, 46);
      c.strokeStyle = '#26262b'; c.lineWidth = 2.4;
      c.beginPath(); c.moveTo(x0 + 30, 142); c.lineTo(x1 - 30, 142); c.moveTo(x0 + 30, 156); c.lineTo(x1 - 30, 156); c.moveTo(x0 + 90, 142); c.lineTo(x0 + 120, 156); c.moveTo(x1 - 120, 156); c.lineTo(x1 - 90, 142); c.stroke();
      for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? '#c9474f' : '#4e7b5b'; c.beginPath(); c.arc(x0 + 46 + k * 38, 135, 3, 0, 7); c.fill(); }
      // the instrument shelf under the windows, with the brass bell
      c.fillStyle = '#7d5434'; c.fillRect(x0, 300, w, 12); c.fillStyle = 'rgba(255,230,190,0.2)'; c.fillRect(x0, 300, w, 2);
      c.fillStyle = '#c9b48f'; c.fillRect(x0, 312, w, 108);
      for (const bx of [x0 + 14, x0 + 98, x1 - 44]) {
        c.fillStyle = '#6b452c'; c.beginPath(); c.roundRect(bx, 250, 44, 50, 5); c.fill();
        c.fillStyle = '#f7f3ea'; c.beginPath(); c.arc(bx + 22, 270, 12, 0, 7); c.fill();
        c.strokeStyle = '#26262b'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(bx + 22, 270); c.lineTo(bx + 22 + (r() - 0.5) * 16, 261); c.stroke();
        c.fillStyle = '#c9a24a'; c.fillRect(bx + 14, 288, 16, 6);
      }
      const bellX = x0 + 202;
      c.fillStyle = '#6b452c'; c.fillRect(bellX - 22, 288, 44, 12);
      c.fillStyle = '#c9952a'; c.beginPath(); c.moveTo(bellX - 20, 288); c.quadraticCurveTo(bellX - 20, 254, bellX, 252); c.quadraticCurveTo(bellX + 20, 254, bellX + 20, 288); c.closePath(); c.fill();
      c.fillStyle = '#f2d88a'; c.beginPath(); c.ellipse(bellX - 8, 268, 3.5, 10, 0.2, 0, 7); c.fill();
      c.fillStyle = '#8a6a26'; c.beginPath(); c.arc(bellX, 250, 4, 0, 7); c.fill();
      // the floor and the lever frame
      c.fillStyle = '#7a5a3e'; c.fillRect(x0, 420, w, y1 - 420);
      c.fillStyle = 'rgba(255,230,190,0.12)'; for (let x = x0; x < x1; x += 30) c.fillRect(x, 420, 14, y1 - 420);
      c.fillStyle = '#3a3a40'; c.fillRect(x0, 470, w, 16);
      c.fillStyle = '#26262b'; c.fillRect(x0 + 8, 474, w - 16, 5);
      const cols = ['#c9474f', '#c9474f', '#e9bf4f', '#c9474f', '#3d5a86', '#26262b', '#c9474f', '#e9bf4f', '#c9474f', '#3d5a86', '#c9474f'];
      cols.forEach((col, i) => {
        const x = x0 + 18 + i * ((w - 36) / (cols.length - 1)), pulled = i === 3 || i === 7, tx = x + (pulled ? -26 : 6), ty = 352;
        c.strokeStyle = col; c.lineWidth = 7; c.lineCap = 'butt'; c.beginPath(); c.moveTo(x, 476); c.lineTo(tx, ty + 18); c.stroke();
        if (col === '#26262b') { c.strokeStyle = '#f4ecdc'; c.lineWidth = 7; c.setLineDash([6, 6]); c.beginPath(); c.moveTo(x, 476); c.lineTo(tx, ty + 18); c.stroke(); c.setLineDash([]); }
        c.strokeStyle = '#dfe5ea'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(tx + (x - tx) * 0.02, ty + 18); c.lineTo(tx - (x - tx) * 0.12, ty); c.stroke();
        c.fillStyle = '#f7f3ea'; c.fillRect(x - 6, 456, 12, 8);
      });
      glow(c, (x0 + x1) / 2, 200, 220, 'rgba(255,250,225,0.16)');
    },
    // a haberdashery behind a bow window: bead garlands in the glass, a rack
    // of ribbon reels, jars of buttons, cubbies of wool, a dress form with a
    // tape measure round its neck, and bolts of cloth on the display step
    haberdashery(c, r, x0, y0, x1, y1) {
      const w = x1 - x0;
      c.fillStyle = '#f3ddd6'; c.fillRect(x0, y0, w, y1 - y0);
      for (let x = x0 + 6; x < x1; x += 18) { c.fillStyle = 'rgba(214,160,150,0.22)'; c.fillRect(x, y0, 7, y1 - y0); }
      glow(c, x0 + w * 0.5, y0 + 60, 230, 'rgba(255,226,170,0.32)');
      const RIB = ['#e2574c', '#efb4ae', '#5f9e9b', '#f2d88a', '#bba9df', '#3d5a86', '#9cc5a1', '#d98b63', '#f4ecdc'];
      // the ribbon rack: three dowels of reels, one ribbon looping down
      c.fillStyle = '#c99e69'; c.fillRect(x0 + 6, y0 + 50, 118, 168);
      c.fillStyle = 'rgba(80,50,25,0.25)'; c.fillRect(x0 + 6, y0 + 214, 118, 4);
      let k = 0;
      for (const ry of [y0 + 78, y0 + 130, y0 + 182]) {
        c.fillStyle = '#8a6142'; c.fillRect(x0 + 6, ry - 1.5, 118, 3);
        for (let x = x0 + 18; x < x0 + 120; x += 21) {
          const col = RIB[k++ % RIB.length];
          c.fillStyle = 'rgba(60,35,20,0.2)'; c.fillRect(x - 6, ry - 9, 15, 24);
          c.fillStyle = col; c.fillRect(x - 8, ry - 11, 16, 22);
          c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(x - 8, ry - 9, 16, 3);
          c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x - 8, ry + 7, 16, 4);
          for (const fx of [x - 9, x + 9]) { c.fillStyle = '#e3c79a'; c.beginPath(); c.ellipse(fx, ry, 2.6, 13, 0, 0, 7); c.fill(); c.fillStyle = '#b8935f'; c.beginPath(); c.ellipse(fx, ry, 1, 3, 0, 0, 7); c.fill(); }
        }
      }
      c.strokeStyle = '#e2574c'; c.lineWidth = 5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x0 + 60, y0 + 193); c.bezierCurveTo(x0 + 56, y0 + 250, x0 + 98, y0 + 262, x0 + 84, y0 + 226); c.stroke();
      // jars of buttons on two shelves
      for (const sy of [y0 + 104, y0 + 186]) {
        c.fillStyle = '#9a6b45'; c.fillRect(x0 + 140, sy, w - 146, 7);
        c.fillStyle = 'rgba(40,25,15,0.2)'; c.fillRect(x0 + 140, sy + 7, w - 146, 5);
        for (let x = x0 + 158; x < x1 - 16; x += 37) {
          c.fillStyle = 'rgba(220,235,240,0.55)'; c.beginPath(); c.roundRect(x - 14, sy - 46, 28, 46, 6); c.fill();
          for (let b = 0; b < 9; b++) {
            const bx = x - 9 + (b % 3) * 9 + (r() - 0.5) * 3, by = sy - 8 - Math.floor(b / 3) * 9 + (r() - 0.5) * 2, bc = U.pick(r, RIB);
            c.fillStyle = bc; c.beginPath(); c.arc(bx, by, 4.2, 0, 7); c.fill();
            c.fillStyle = U.shade(bc, -0.35); for (const [hx, hy] of [[-1.2, -1.2], [1.2, 1.2], [1.2, -1.2], [-1.2, 1.2]].slice(0, b % 2 ? 2 : 4)) { c.beginPath(); c.arc(bx + hx, by + hy, 0.7, 0, 7); c.fill(); }
          }
          c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(x - 11, sy - 42, 3, 36);
          c.fillStyle = '#c9a24a'; c.fillRect(x - 15, sy - 52, 30, 7); c.fillStyle = '#f2d88a'; c.fillRect(x - 15, sy - 52, 30, 2);
        }
      }
      // cubbies of wool
      c.fillStyle = '#b98f5a'; c.fillRect(x0 + 8, y0 + 232, 116, 112);
      for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) {
        const cx = x0 + 14 + i * 36, cy = y0 + 238 + j * 52;
        c.fillStyle = '#6b4a32'; c.fillRect(cx, cy, 32, 46);
        const col = U.pick(r, RIB);
        for (const [bx, by, br] of [[cx + 10, cy + 34, 9], [cx + 23, cy + 35, 8.5], [cx + 16, cy + 20, 8.5]]) {
          c.fillStyle = col; c.beginPath(); c.arc(bx, by, br, 0, 7); c.fill();
          c.strokeStyle = U.shade(col, -0.25); c.lineWidth = 0.9;
          for (let l = -1; l <= 1; l++) { c.beginPath(); c.arc(bx + l * 2, by, br * 0.7, 3.6, 5.6); c.stroke(); }
        }
      }
      // the dress form, a rose bodice pinned on, the tape measure round its neck
      const fx = x0 + 196, fy = y0 + 236;
      c.fillStyle = '#5b3a26'; c.fillRect(fx - 3, fy + 128, 6, 72);
      c.strokeStyle = '#5b3a26'; c.lineWidth = 5; c.beginPath(); c.moveTo(fx, y1 - 70); c.lineTo(fx - 30, y1 - 58); c.moveTo(fx, y1 - 70); c.lineTo(fx + 30, y1 - 58); c.stroke();
      c.fillStyle = '#e8dcc6'; c.beginPath();
      c.moveTo(fx - 12, fy); c.quadraticCurveTo(fx - 44, fy + 6, fx - 42, fy + 40); c.quadraticCurveTo(fx - 26, fy + 74, fx - 38, fy + 128);
      c.lineTo(fx + 38, fy + 128); c.quadraticCurveTo(fx + 26, fy + 74, fx + 42, fy + 40); c.quadraticCurveTo(fx + 44, fy + 6, fx + 12, fy); c.closePath(); c.fill();
      c.fillStyle = '#c9b89c'; c.beginPath(); c.ellipse(fx, fy - 4, 12, 6, 0, 0, 7); c.fill();
      c.fillStyle = '#e9a39b'; c.beginPath();
      c.moveTo(fx - 34, fy + 18); c.quadraticCurveTo(fx, fy + 30, fx + 34, fy + 18); c.lineTo(fx + 36, fy + 72); c.quadraticCurveTo(fx, fy + 82, fx - 36, fy + 72); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(150,70,70,0.35)'; c.lineWidth = 1; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(fx, fy + 28); c.lineTo(fx, fy + 78); c.stroke(); c.setLineDash([]);
      for (let p = 0; p < 6; p++) { c.fillStyle = U.pick(r, ['#3d5a86', '#f2d88a', '#e2574c']); c.beginPath(); c.arc(fx - 30 + p * 12, fy + 74 - (p % 2) * 3, 1.6, 0, 7); c.fill(); }
      c.strokeStyle = '#f2d88a'; c.lineWidth = 6; c.beginPath(); c.moveTo(fx - 22, fy + 60); c.quadraticCurveTo(fx - 14, fy + 4, fx, fy + 2); c.quadraticCurveTo(fx + 16, fy + 4, fx + 20, fy + 70); c.stroke();
      c.strokeStyle = '#6b6157'; c.lineWidth = 1; for (let t = 0; t < 12; t++) { const yy = fy + 12 + t * 4.6; c.beginPath(); c.moveTo(fx - 20 + t * 0.2, yy); c.lineTo(fx - 16 + t * 0.2, yy); c.stroke(); }
      // the display step: teal felt, bolts of cloth, a tomato pincushion, scissors and spools
      c.fillStyle = '#4b8682'; c.fillRect(x0, y1 - 62, w, 62);
      c.fillStyle = '#6aa7a3'; c.fillRect(x0, y1 - 62, w, 8);
      const bolt = (x, y, bw, col, dots) => {
        c.fillStyle = 'rgba(30,40,40,0.25)'; c.fillRect(x + 3, y + 4, bw, 20);
        c.fillStyle = col; c.fillRect(x, y, bw, 20);
        c.fillStyle = dots; if (col === '#f4ecdc') for (let gx = x + 3; gx < x + bw; gx += 7) for (let gy = y + 3; gy < y + 20; gy += 7) c.fillRect(gx, gy, 3.5, 3.5);
        else for (let gx = x + 4; gx < x + bw; gx += 8) for (let gy = y + 4; gy < y + 20; gy += 8) { c.beginPath(); c.arc(gx, gy, 1.6, 0, 7); c.fill(); }
        c.fillStyle = U.shade(col, -0.2); c.beginPath(); c.ellipse(x + bw, y + 10, 4, 10, 0, 0, 7); c.fill();
      };
      bolt(x0 + 12, y1 - 54, 74, '#3d5a86', '#f4ecdc'); bolt(x0 + 20, y1 - 32, 70, '#f4ecdc', 'rgba(226,87,76,0.6)');
      c.fillStyle = '#e2574c'; c.beginPath(); c.ellipse(x0 + 128, y1 - 30, 16, 12, 0, 0, 7); c.fill();
      c.strokeStyle = 'rgba(120,30,30,0.5)'; c.lineWidth = 1; for (const a of [-0.8, 0, 0.8]) { c.beginPath(); c.moveTo(x0 + 128, y1 - 42); c.quadraticCurveTo(x0 + 128 + a * 14, y1 - 30, x0 + 128, y1 - 18); c.stroke(); }
      c.fillStyle = '#4f8a3a'; c.beginPath(); c.moveTo(x0 + 122, y1 - 42); c.lineTo(x0 + 128, y1 - 48); c.lineTo(x0 + 134, y1 - 42); c.closePath(); c.fill();
      for (const [px, py] of [[118, -40], [134, -38], [126, -44], [140, -32]]) { c.strokeStyle = '#b9c0c4'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0 + px, y1 + py); c.lineTo(x0 + px + 2, y1 + py - 8); c.stroke(); c.fillStyle = U.pick(r, ['#3d5a86', '#f2d88a', '#f4ecdc']); c.beginPath(); c.arc(x0 + px + 2, y1 + py - 8, 1.8, 0, 7); c.fill(); }
      c.strokeStyle = '#a9b1b7'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0 + 160, y1 - 14); c.lineTo(x0 + 196, y1 - 36); c.moveTo(x0 + 160, y1 - 30); c.lineTo(x0 + 196, y1 - 12); c.stroke();
      c.strokeStyle = '#c9a24a'; c.lineWidth = 2.4; c.beginPath(); c.arc(x0 + 154, y1 - 12, 5, 0, 7); c.arc(x0 + 154, y1 - 32, 5, 0, 7); c.stroke();
      for (let s = 0; s < 4; s++) {
        const sx = x1 - 84 + s * 18, col = RIB[(s * 2 + 1) % RIB.length];
        c.fillStyle = '#e3c79a'; c.fillRect(sx - 7, y1 - 44, 14, 3); c.fillRect(sx - 7, y1 - 22, 14, 3);
        c.fillStyle = col; c.fillRect(sx - 5.5, y1 - 41, 11, 19);
        c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(sx - 4, y1 - 40, 2, 17);
      }
      // bead garlands hanging in swags across the top of the glass
      for (const [sy, sag] of [[y0 + 6, 26], [y0 + 4, 42]]) {
        for (let i = 0; i <= 30; i++) {
          const t = i / 30, x = x0 + 4 + (w - 8) * t, y = sy + Math.sin(t * Math.PI * 2) ** 2 * sag;
          c.fillStyle = RIB[(i + (sag > 30 ? 3 : 0)) % RIB.length]; c.beginPath(); c.arc(x, y, i % 3 ? 3 : 4.2, 0, 7); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.arc(x - 1, y - 1, 1, 0, 7); c.fill();
        }
      }
      glow(c, x0 + w * 0.5, y1 - 130, 200, 'rgba(255,236,200,0.12)');
    },
    // a curiosity shop behind old, faintly green glass with seeds of air in
    // it: a framed map, a ship in a bottle, books and a brass telescope, a
    // mantel clock, a candle, and treasures on a velvet cloth in the window
    curio(c, r, x0, y0, x1, y1) {
      const w = x1 - x0;
      c.fillStyle = '#2f4a3e'; c.fillRect(x0, y0, w, y1 - y0);
      for (let i = 0; i < 18; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '20,35,28' : '80,110,90'},${(0.06 + r() * 0.08).toFixed(2)})`; c.beginPath(); c.ellipse(x0 + r() * w, y0 + r() * (y1 - y0), 20 + r() * 40, 12 + r() * 24, r() * 3, 0, 7); c.fill(); }
      c.fillStyle = '#22362d'; c.fillRect(x0, y0 + 316, w, y1 - y0 - 316);
      c.fillStyle = '#7d5a2e'; c.fillRect(x0, y0 + 312, w, 6); c.fillStyle = 'rgba(255,220,150,0.25)'; c.fillRect(x0, y0 + 312, w, 2);
      for (let x = x0 + 10; x < x1; x += 44) { c.strokeStyle = 'rgba(10,20,15,0.4)'; c.lineWidth = 1.4; c.strokeRect(x, y0 + 330, 34, 40); }
      // a brass pendant lamp
      const lx = x0 + w * 0.3;
      c.strokeStyle = '#1d1d22'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(lx, y0); c.lineTo(lx, y0 + 18); c.stroke();
      c.fillStyle = '#c9a24a'; c.beginPath(); c.moveTo(lx - 18, y0 + 38); c.lineTo(lx + 18, y0 + 38); c.lineTo(lx + 6, y0 + 18); c.lineTo(lx - 6, y0 + 18); c.closePath(); c.fill();
      c.fillStyle = '#fff1c4'; c.beginPath(); c.ellipse(lx, y0 + 38, 12, 3.4, 0, 0, Math.PI); c.fill();
      glow(c, lx, y0 + 50, 190, 'rgba(255,206,130,0.42)');
      // an old map in a gilt frame, with a compass rose
      const my = y0 + 46;
      c.fillStyle = '#b8913d'; c.fillRect(x0 + 10, my, 112, 88);
      c.fillStyle = '#e9d9b0'; c.fillRect(x0 + 16, my + 6, 100, 76);
      c.fillStyle = 'rgba(160,120,60,0.25)'; c.fillRect(x0 + 16, my + 6, 100, 76);
      c.fillStyle = '#9cb38a';
      c.beginPath(); c.moveTo(x0 + 26, my + 22); c.quadraticCurveTo(x0 + 48, my + 12, x0 + 58, my + 28); c.quadraticCurveTo(x0 + 50, my + 54, x0 + 32, my + 50); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(x0 + 70, my + 42); c.quadraticCurveTo(x0 + 96, my + 30, x0 + 104, my + 54); c.quadraticCurveTo(x0 + 86, my + 74, x0 + 72, my + 62); c.closePath(); c.fill();
      c.strokeStyle = '#7d2a34'; c.lineWidth = 1; c.setLineDash([2, 2]); c.beginPath(); c.moveTo(x0 + 44, my + 36); c.quadraticCurveTo(x0 + 66, my + 22, x0 + 86, my + 48); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#7d2a34'; c.beginPath(); c.moveTo(x0 + 98, my + 14); c.lineTo(x0 + 101, my + 22); c.lineTo(x0 + 98, my + 30); c.lineTo(x0 + 95, my + 22); c.closePath(); c.fill();
      // a shelf with a ship in a bottle
      const sy = y0 + 186;
      c.fillStyle = '#5a3a26'; c.fillRect(x0 + 6, sy, 124, 8); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x0 + 6, sy + 8, 124, 5);
      c.fillStyle = '#6b452c'; c.fillRect(x0 + 34, sy - 8, 10, 8); c.fillRect(x0 + 96, sy - 8, 10, 8);
      c.fillStyle = 'rgba(200,230,215,0.35)'; c.beginPath(); c.roundRect(x0 + 18, sy - 38, 96, 32, 14); c.fill();
      c.fillStyle = 'rgba(200,230,215,0.35)'; c.fillRect(x0 + 112, sy - 28, 14, 12); c.fillStyle = '#8a6142'; c.fillRect(x0 + 124, sy - 29, 6, 14);
      c.fillStyle = '#7a4a2a'; c.beginPath(); c.moveTo(x0 + 40, sy - 16); c.lineTo(x0 + 94, sy - 16); c.lineTo(x0 + 88, sy - 9); c.lineTo(x0 + 46, sy - 9); c.closePath(); c.fill();
      c.fillStyle = '#f4ecdc';
      for (const [mx2, h] of [[54, 18], [68, 22], [82, 16]]) { c.fillRect(x0 + mx2, sy - 16 - h, 1.2, h); c.beginPath(); c.moveTo(x0 + mx2 + 1, sy - 16 - h); c.quadraticCurveTo(x0 + mx2 + 9, sy - 16 - h * 0.6, x0 + mx2 + 1, sy - 18 - h * 0.2); c.closePath(); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x0 + 26, sy - 34, 50, 2.4);
      // a brass diving helmet on its stand
      const hx = x0 + 64, hy = y0 + 270;
      c.fillStyle = '#6b452c'; c.fillRect(hx - 30, hy + 40, 60, 10); c.fillRect(hx - 6, hy + 30, 12, 12);
      c.fillStyle = '#9a7a2e'; c.beginPath(); c.ellipse(hx, hy + 30, 34, 9, 0, 0, 7); c.fill();
      c.fillStyle = '#c9a24a'; c.beginPath(); c.arc(hx, hy, 32, 0, 7); c.fill();
      c.fillStyle = '#e0bd62'; c.beginPath(); c.arc(hx - 8, hy - 10, 16, 0, 7); c.fill();
      for (const [px, py, pr] of [[hx, hy + 2, 13], [hx - 24, hy + 4, 7], [hx + 24, hy + 4, 7]]) {
        c.fillStyle = '#8a6a26'; c.beginPath(); c.arc(px, py, pr + 3, 0, 7); c.fill();
        c.fillStyle = '#28493c'; c.beginPath(); c.arc(px, py, pr, 0, 7); c.fill();
        c.fillStyle = 'rgba(200,235,225,0.45)'; c.beginPath(); c.arc(px - pr * 0.3, py - pr * 0.3, pr * 0.4, 0, 7); c.fill();
      }
      c.strokeStyle = '#8a6a26'; c.lineWidth = 1.4; for (const a of [0.8, 1.6, 2.4]) { c.beginPath(); c.moveTo(hx + Math.cos(a) * 13, hy + 2 + Math.sin(a) * 13); c.lineTo(hx + Math.cos(a) * 16, hy + 2 + Math.sin(a) * 16); c.stroke(); }
      // books and a brass telescope on the right
      c.fillStyle = '#5a3a26'; c.fillRect(x0 + 138, y0 + 136, w - 142, 8); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x0 + 138, y0 + 144, w - 142, 5);
      let bx = x0 + 142;
      while (bx < x0 + 220) {
        const bw = 8 + r() * 7, bh = 36 + r() * 16, col = U.pick(r, ['#7d2a34', '#2f5546', '#6b452c', '#3d5a86', '#8a6a26']);
        c.fillStyle = col; c.fillRect(bx, y0 + 136 - bh, bw - 1.4, bh);
        c.fillStyle = '#c9a24a'; c.fillRect(bx + 1, y0 + 136 - bh + 6, bw - 3.4, 2); c.fillRect(bx + 1, y0 + 128, bw - 3.4, 2);
        bx += bw;
      }
      c.save(); c.translate(x0 + 252, y0 + 104); c.rotate(-0.35);
      c.fillStyle = '#b8913d'; c.fillRect(-36, -6, 72, 12); c.fillStyle = '#d8b25a'; c.fillRect(-36, -6, 72, 3);
      c.fillStyle = '#9a7a2e'; c.fillRect(-42, -8, 8, 16); c.fillRect(30, -5, 14, 10);
      c.fillStyle = '#c9e2ea'; c.beginPath(); c.ellipse(-42, 0, 3, 8, 0, 0, 7); c.fill();
      c.restore();
      c.strokeStyle = '#6b452c'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0 + 252, y0 + 108); c.lineTo(x0 + 236, y0 + 136); c.moveTo(x0 + 252, y0 + 108); c.lineTo(x0 + 268, y0 + 136); c.stroke();
      // the mantel clock on the second shelf, and a candle
      const shy = y0 + 292;
      c.fillStyle = '#5a3a26'; c.fillRect(x0 + 138, shy, w - 142, 8); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x0 + 138, shy + 8, w - 142, 5);
      const ccx = x0 + 204, ccy = shy - 40;
      c.fillStyle = '#6b3a24'; c.beginPath(); c.moveTo(ccx - 36, shy); c.lineTo(ccx - 36, ccy); c.quadraticCurveTo(ccx, ccy - 44, ccx + 36, ccy); c.lineTo(ccx + 36, shy); c.closePath(); c.fill();
      c.fillStyle = '#c9a24a'; c.beginPath(); c.arc(ccx, ccy + 4, 21, 0, 7); c.fill();
      c.fillStyle = '#f7f1e2'; c.beginPath(); c.arc(ccx, ccy + 4, 17, 0, 7); c.fill();
      c.strokeStyle = '#3a2814'; c.lineWidth = 1.2;
      for (let t = 0; t < 12; t++) { const a = (t / 12) * 6.283; c.beginPath(); c.moveTo(ccx + Math.cos(a) * 13, ccy + 4 + Math.sin(a) * 13); c.lineTo(ccx + Math.cos(a) * 15.5, ccy + 4 + Math.sin(a) * 15.5); c.stroke(); }
      c.lineWidth = 1.8; c.beginPath(); c.moveTo(ccx, ccy + 4); c.lineTo(ccx + 7, ccy - 4); c.moveTo(ccx, ccy + 4); c.lineTo(ccx - 2, ccy - 9); c.stroke();
      const kx = x1 - 24;
      c.fillStyle = '#c9a24a'; c.fillRect(kx - 9, shy - 6, 18, 6); c.fillRect(kx - 3, shy - 28, 6, 22);
      c.fillStyle = '#f4ecdc'; c.fillRect(kx - 4, shy - 54, 8, 26);
      c.fillStyle = '#ffd36a'; c.beginPath(); c.ellipse(kx, shy - 60, 3.4, 6.5, 0, 0, 7); c.fill();
      glow(c, kx, shy - 58, 70, 'rgba(255,200,110,0.5)');
      // the window display: an oxblood velvet cloth, a key, a pocket watch, a magnifier, a small globe
      c.fillStyle = '#5e1f27'; c.fillRect(x0, y1 - 66, w, 66);
      c.fillStyle = '#7d2a34'; c.beginPath(); c.moveTo(x0, y1 - 66); for (let x = x0; x <= x1; x += 22) c.quadraticCurveTo(x + 11, y1 - 58, x + 22, y1 - 66); c.lineTo(x1, y1); c.lineTo(x0, y1); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,200,200,0.12)'; c.lineWidth = 2; for (let x = x0 + 14; x < x1; x += 22) { c.beginPath(); c.moveTo(x, y1 - 56); c.lineTo(x + 4, y1); c.stroke(); }
      c.save(); c.translate(x0 + 52, y1 - 30); c.rotate(-0.2);
      c.strokeStyle = '#d8b25a'; c.lineWidth = 3.4; c.beginPath(); c.arc(-14, 0, 8, 0, 7); c.stroke();
      c.fillStyle = '#d8b25a'; c.fillRect(-6, -2, 34, 4); c.fillRect(20, 2, 4, 8); c.fillRect(26, 2, 3, 6);
      c.restore();
      c.strokeStyle = '#d8b25a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x0 + 112, y1 - 40); c.quadraticCurveTo(x0 + 130, y1 - 8, x0 + 150, y1 - 30); c.stroke();
      c.fillStyle = '#c9a24a'; c.beginPath(); c.arc(x0 + 112, y1 - 30, 12, 0, 7); c.fill();
      c.fillStyle = '#f7f1e2'; c.beginPath(); c.arc(x0 + 112, y1 - 30, 9, 0, 7); c.fill();
      c.strokeStyle = '#3a2814'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0 + 112, y1 - 30); c.lineTo(x0 + 116, y1 - 35); c.moveTo(x0 + 112, y1 - 30); c.lineTo(x0 + 112, y1 - 37); c.stroke();
      c.strokeStyle = '#6b452c'; c.lineWidth = 4; c.beginPath(); c.moveTo(x0 + 178, y1 - 16); c.lineTo(x0 + 196, y1 - 30); c.stroke();
      c.strokeStyle = '#c9a24a'; c.lineWidth = 3; c.beginPath(); c.arc(x0 + 206, y1 - 38, 12, 0, 7); c.stroke();
      c.fillStyle = 'rgba(210,235,245,0.4)'; c.beginPath(); c.arc(x0 + 206, y1 - 38, 10.5, 0, 7); c.fill();
      const gx = x1 - 38, gy = y1 - 58;
      c.fillStyle = '#6b452c'; c.fillRect(gx - 3, gy + 18, 6, 22); c.fillRect(gx - 13, gy + 38, 26, 5);
      c.strokeStyle = '#c9a24a'; c.lineWidth = 2; c.beginPath(); c.arc(gx, gy, 22, -2.2, 1.0); c.stroke();
      c.fillStyle = '#8fbfe6'; c.beginPath(); c.arc(gx, gy, 18, 0, 7); c.fill();
      c.fillStyle = '#c9b48f'; c.beginPath(); c.moveTo(gx - 12, gy - 9); c.quadraticCurveTo(gx - 1, gy - 15, gx + 3, gy - 4); c.quadraticCurveTo(gx - 4, gy + 7, gx - 11, gy + 3); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(gx + 4, gy + 4); c.quadraticCurveTo(gx + 13, gy + 1, gx + 15, gy + 9); c.quadraticCurveTo(gx + 8, gy + 15, gx + 5, gy + 11); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.ellipse(gx - 6, gy - 7, 5.5, 3.4, -0.6, 0, 7); c.fill();
      // old glass: a faint green cast and seeds of air
      c.fillStyle = 'rgba(190,210,150,0.07)'; c.fillRect(x0, y0, w, y1 - y0);
      for (let i = 0; i < 46; i++) {
        const bx2 = x0 + r() * w, by2 = y0 + r() * (y1 - y0), br = 0.8 + r() * 2.2;
        c.strokeStyle = 'rgba(255,255,255,0.32)'; c.lineWidth = 0.7; c.beginPath(); c.ellipse(bx2, by2, br * 1.6, br, 0, 0, 7); c.stroke();
      }
    },
    // the studio from the skylight, looking down into it: a white wall of
    // pinned sketches under a shelf of tins, pale boards, a spattered cloth with
    // the big easel on it, a table of jars and tubes, a stool with a rag, the
    // studio cat asleep, and the sun falling through in a long bright slant
    studio(c, r, x0, y0, x1, y1) {
      const w = x1 - x0, wy = 216, cx = (x0 + x1) / 2;
      c.fillStyle = '#f4f0e6'; c.fillRect(x0, y0, w, wy - y0);
      for (let x = x0 + 14; x < x1; x += 30) { c.fillStyle = 'rgba(150,135,110,0.16)'; c.fillRect(x, y0, 1.4, wy - y0); }
      // the shelf of tins
      c.fillStyle = '#a77b56'; c.fillRect(x0, 124, w, 6); c.fillStyle = 'rgba(60,40,20,0.2)'; c.fillRect(x0, 130, w, 3);
      for (let x = x0 + 14; x < x1 - 20;) {
        const tw = 16 + r() * 10, th = 16 + r() * 12, col = U.pick(r, ['#2f5fa8', '#d9a53c', '#e2574c', '#f7f3ea', '#3f8f8a', '#c9744a']);
        c.fillStyle = col; c.fillRect(x, 124 - th, tw, th);
        c.fillStyle = 'rgba(255,255,255,0.28)'; c.fillRect(x + 2, 124 - th, 3, th);
        c.fillStyle = '#b9c0c4'; c.fillRect(x - 1, 124 - th - 3, tw + 2, 3);
        x += tw + 7 + r() * 8;
      }
      // sketches pinned to the wall
      for (const [sx, sy, sw, sh, a, k] of [[x0 + 30, 170, 40, 52, -0.05, 0], [x0 + 82, 164, 48, 38, 0.04, 1], [x0 + 144, 170, 36, 46, -0.03, 2], [x0 + 196, 166, 46, 40, 0.05, 3]]) {
        c.save(); c.translate(sx, sy); c.rotate(a);
        c.fillStyle = 'rgba(70,55,35,0.16)'; c.fillRect(-sw / 2 + 2, -sh / 2 + 3, sw, sh);
        c.fillStyle = '#fffaf0'; c.fillRect(-sw / 2, -sh / 2, sw, sh);
        c.strokeStyle = '#6b6157'; c.fillStyle = ['#2f5fa8', '#d9a53c', '#e2574c', '#3f8f8a'][k]; c.lineWidth = 1;
        if (k === 0) { c.beginPath(); c.arc(0, -4, 10, 0, 7); c.fill(); c.beginPath(); c.moveTo(-14, 16); c.quadraticCurveTo(0, 2, 14, 16); c.stroke(); }
        else if (k === 1) { c.beginPath(); c.moveTo(-18, 10); c.quadraticCurveTo(-4, -12, 18, 10); c.closePath(); c.fill(); c.beginPath(); c.arc(10, -8, 4, 0, 7); c.stroke(); }
        else if (k === 2) { for (const [fx, fy] of [[-6, -8], [6, -2], [-3, 10]]) { c.beginPath(); c.arc(fx, fy, 5, 0, 7); c.fill(); } c.beginPath(); c.moveTo(-6, -3); c.lineTo(-4, 18); c.moveTo(6, 3); c.lineTo(4, 18); c.stroke(); }
        else { c.fillRect(-16, 2, 32, 8); c.beginPath(); c.moveTo(-8, 2); c.lineTo(0, -12); c.lineTo(8, 2); c.closePath(); c.stroke(); }
        c.fillStyle = '#c9474f'; c.beginPath(); c.arc(0, -sh / 2 + 3, 2, 0, 7); c.fill();
        c.restore();
      }
      // pale boards running away from you
      c.fillStyle = '#c4ad86'; c.fillRect(x0, wy, w, y1 - wy);
      for (let k = -9; k <= 9; k++) {
        const t0 = cx + k * 26, t1 = cx + (k + 1) * 26, b0 = cx + k * 62, b1 = cx + (k + 1) * 62;
        c.fillStyle = U.shade('#d3bd96', (((k + 20) * 7) % 5) * 0.022 - 0.05);
        c.beginPath(); c.moveTo(t0 + 0.6, wy); c.lineTo(t1, wy); c.lineTo(b1, y1); c.lineTo(b0 + 1.4, y1); c.closePath(); c.fill();
      }
      c.fillStyle = '#cdbd9f'; c.fillRect(x0, wy - 7, w, 8); c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(x0, wy - 7, w, 1.5);
      // the old cloth under the easel, freckled with paint
      c.fillStyle = 'rgba(60,45,30,0.14)'; c.beginPath(); c.moveTo(x0 + 8, 312); c.lineTo(x0 + 186, 304); c.lineTo(x0 + 232, 468); c.lineTo(x0 - 18, 478); c.closePath(); c.fill();
      c.fillStyle = '#e8e0cf'; c.beginPath(); c.moveTo(x0 + 6, 306); c.lineTo(x0 + 184, 298); c.lineTo(x0 + 228, 462); c.lineTo(x0 - 20, 472); c.closePath(); c.fill();
      for (let i = 0; i < 46; i++) { c.fillStyle = U.pick(r, ['#2f5fa8', '#d9a53c', '#e2574c', '#3f8f8a', '#2f5fa8']); c.beginPath(); c.ellipse(x0 + 8 + r() * 200, 316 + r() * 146, 1 + r() * 3.4, 0.8 + r() * 2.2, r() * 3, 0, 7); c.fill(); }
      // the big easel, a painting of the hills on it
      const ex = x0 + 104;
      c.strokeStyle = '#9a6b45'; c.lineWidth = 7; c.lineCap = 'round';
      c.beginPath(); c.moveTo(ex - 8, 232); c.lineTo(ex - 62, 430); c.moveTo(ex + 8, 232); c.lineTo(ex + 62, 430); c.stroke();
      c.strokeStyle = '#7d5434'; c.lineWidth = 8; c.beginPath(); c.moveTo(ex, 226); c.lineTo(ex, 410); c.stroke();
      c.fillStyle = 'rgba(40,25,10,0.28)'; c.fillRect(ex - 72, 242, 150, 116);
      const pic = c.createLinearGradient(0, 238, 0, 352); pic.addColorStop(0, '#2f5fa8'); pic.addColorStop(0.62, '#8fb6dd'); pic.addColorStop(0.63, '#e0b34f'); pic.addColorStop(1, '#c9863a');
      c.fillStyle = pic; c.fillRect(ex - 76, 238, 150, 116);
      c.fillStyle = '#f7f1e2'; c.beginPath(); c.arc(ex + 34, 268, 15, 0, 7); c.fill();
      c.fillStyle = '#d9a53c'; c.beginPath(); c.moveTo(ex - 76, 320); c.quadraticCurveTo(ex - 30, 288, ex + 10, 316); c.quadraticCurveTo(ex + 44, 296, ex + 74, 312); c.lineTo(ex + 74, 354); c.lineTo(ex - 76, 354); c.closePath(); c.fill();
      c.fillStyle = '#b5713a'; c.beginPath(); c.moveTo(ex - 76, 342); c.quadraticCurveTo(ex - 6, 318, ex + 74, 340); c.lineTo(ex + 74, 354); c.lineTo(ex - 76, 354); c.closePath(); c.fill();
      c.strokeStyle = '#f4efe2'; c.lineWidth = 3; c.strokeRect(ex - 76, 238, 150, 116);
      c.fillStyle = '#8a5f3c'; c.fillRect(ex - 84, 354, 168, 8); c.fillStyle = 'rgba(255,230,190,0.3)'; c.fillRect(ex - 84, 354, 168, 2);
      // the table of jars and tubes, running off to the right
      c.fillStyle = 'rgba(60,40,20,0.2)'; c.beginPath(); c.moveTo(x1 - 74, 322); c.lineTo(x1, 322); c.lineTo(x1, 448); c.lineTo(x1 - 102, 448); c.closePath(); c.fill();
      c.fillStyle = '#c99e6c'; c.beginPath(); c.moveTo(x1 - 70, 310); c.lineTo(x1, 310); c.lineTo(x1, 432); c.lineTo(x1 - 98, 432); c.closePath(); c.fill();
      c.fillStyle = '#9a6b45'; c.beginPath(); c.moveTo(x1 - 98, 432); c.lineTo(x1, 432); c.lineTo(x1, 442); c.lineTo(x1 - 98, 442); c.closePath(); c.fill();
      for (const [jx, jy, col] of [[x1 - 40, 346, '#2f5fa8'], [x1 - 20, 368, '#d9a53c']]) {
        for (let k = -1; k <= 1; k++) { c.strokeStyle = U.pick(r, ['#8a5f3c', '#c9474f', '#3f8f8a']); c.lineWidth = 2.4; c.beginPath(); c.moveTo(jx + k * 3, jy); c.lineTo(jx + k * 8, jy - 38); c.stroke(); c.fillStyle = '#6b4a32'; c.beginPath(); c.arc(jx + k * 8, jy - 40, 2.4, 0, 7); c.fill(); }
        c.fillStyle = 'rgba(200,225,235,0.75)'; c.beginPath(); c.roundRect(jx - 10, jy - 8, 20, 26, 4); c.fill();
        c.fillStyle = col; c.globalAlpha = 0.45; c.fillRect(jx - 8, jy + 4, 16, 12); c.globalAlpha = 1;
      }
      // a palette with its dabs, and a tube of cobalt
      c.fillStyle = '#d9b488'; c.beginPath(); c.ellipse(x1 - 56, 404, 30, 17, -0.1, 0, 7); c.fill();
      c.fillStyle = '#c99e6c'; c.beginPath(); c.ellipse(x1 - 74, 408, 5, 3.4, 0, 0, 7); c.fill();
      for (const [dx, dy, col] of [[-12, -8, '#e2574c'], [2, -11, '#d9a53c'], [15, -7, '#2f5fa8'], [22, 2, '#f7f3ea'], [14, 8, '#3f8f8a']]) { c.fillStyle = col; c.beginPath(); c.arc(x1 - 56 + dx, 404 + dy, 3.6, 0, 7); c.fill(); }
      c.fillStyle = '#2f5fa8'; c.beginPath(); c.roundRect(x1 - 30, 418, 24, 8, 2); c.fill(); c.fillStyle = '#d5dbde'; c.fillRect(x1 - 10, 419, 8, 6);
      // a stool with a rag on it, and the studio cat asleep on the cloth
      c.fillStyle = 'rgba(60,40,20,0.2)'; c.beginPath(); c.ellipse(x0 + 34, 476, 34, 9, 0, 0, 7); c.fill();
      c.strokeStyle = '#7d5434'; c.lineWidth = 5; c.beginPath(); c.moveTo(x0 + 14, 450); c.lineTo(x0 + 6, 476); c.moveTo(x0 + 54, 450); c.lineTo(x0 + 62, 476); c.moveTo(x0 + 34, 450); c.lineTo(x0 + 34, 484); c.stroke();
      c.fillStyle = '#a77b56'; c.beginPath(); c.ellipse(x0 + 34, 446, 28, 8, 0, 0, 7); c.fill();
      c.fillStyle = '#efe6d4'; c.beginPath(); c.moveTo(x0 + 16, 444); c.quadraticCurveTo(x0 + 34, 434, x0 + 48, 446); c.quadraticCurveTo(x0 + 30, 452, x0 + 16, 444); c.fill();
      c.fillStyle = 'rgba(60,40,20,0.2)'; c.beginPath(); c.ellipse(x0 + 166, 452, 30, 7, 0, 0, 7); c.fill();
      c.fillStyle = '#f5f1e8'; c.beginPath(); c.ellipse(x0 + 164, 442, 27, 13, 0, 0, 7); c.fill();
      c.fillStyle = '#4b4a52'; c.beginPath(); c.ellipse(x0 + 172, 438, 12, 8, 0.3, 0, 7); c.fill();
      c.fillStyle = '#f5f1e8'; c.beginPath(); c.arc(x0 + 142, 440, 10, 0, 7); c.fill();
      c.beginPath(); c.moveTo(x0 + 135, 434); c.lineTo(x0 + 134, 424); c.lineTo(x0 + 142, 431); c.closePath(); c.fill(); c.beginPath(); c.moveTo(x0 + 145, 431); c.lineTo(x0 + 151, 425); c.lineTo(x0 + 151, 436); c.closePath(); c.fill();
      c.strokeStyle = '#6b6157'; c.lineWidth = 1; for (const ex2 of [-4, 4]) { c.beginPath(); c.arc(x0 + 142 + ex2, 440, 2, 0.3, 2.8); c.stroke(); }
      // the sun through the glass
      c.fillStyle = 'rgba(255,240,196,0.1)'; c.beginPath(); c.moveTo(x0 + 34, 216); c.lineTo(x0 + 168, 216); c.lineTo(x0 + 262, y1); c.lineTo(x0 + 78, y1); c.closePath(); c.fill();
    },
    // the loft through its window: old rafters over white boards, a long shelf
    // of tins and jars, two easels with paintings on the go, rolled canvases in
    // the corner, a stool and a pail of brushes on the spattered boards
    loft(c, r, x0, y0, x1, y1) {
      const w = x1 - x0, fy = 426;
      c.fillStyle = '#f3efe5'; c.fillRect(x0, y0, w, fy - y0);
      for (let x = x0 + 8; x < x1; x += 26) { c.fillStyle = 'rgba(150,135,110,0.16)'; c.fillRect(x, y0, 1.4, fy - y0); }
      // the rafters of the old hay loft and the tie beam
      c.fillStyle = '#6e4a30';
      c.beginPath(); c.moveTo(x0 - 4, 200); c.lineTo(180, y0 - 40); c.lineTo(x1 + 4, 200); c.lineTo(x1 + 4, 222); c.lineTo(180, y0 - 14); c.lineTo(x0 - 4, 222); c.closePath(); c.fill();
      c.fillStyle = '#7d5638'; c.fillRect(170, y0, 20, 92);
      c.fillStyle = '#5e3e28'; c.fillRect(x0, 150, w, 20); c.fillStyle = 'rgba(255,220,180,0.2)'; c.fillRect(x0, 150, w, 2.5); c.fillStyle = 'rgba(30,18,10,0.24)'; c.fillRect(x0, 170, w, 5);
      // a string of drying sketches along the beam
      c.strokeStyle = '#8a7a62'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(x0, 186); c.quadraticCurveTo(180, 198, x1, 186); c.stroke();
      for (let k = 0; k < 6; k++) {
        const sx = x0 + 28 + k * 44, sy = 188 + Math.sin((k + 0.5) * 0.52) * 7;
        c.fillStyle = '#fffaf0'; c.fillRect(sx - 12, sy, 24, 28);
        c.fillStyle = U.pick(r, ['#2f5fa8', '#d9a53c', '#e2574c', '#3f8f8a']); c.beginPath(); c.arc(sx, sy + 13, 6, 0, 7); c.fill();
        c.fillStyle = '#c9a24a'; c.fillRect(sx - 1.5, sy - 3, 3, 6);
      }
      // the long shelf of tins and jars
      c.fillStyle = '#a77b56'; c.fillRect(x0, 262, w, 7); c.fillStyle = 'rgba(60,40,20,0.2)'; c.fillRect(x0, 269, w, 3);
      for (let x = x0 + 8; x < x1 - 14;) {
        const tw = 16 + r() * 12, th = 18 + r() * 16, jar = r() < 0.4, col = U.pick(r, ['#2f5fa8', '#d9a53c', '#e2574c', '#f7f3ea', '#3f8f8a', '#c9744a']);
        if (jar) {
          for (let k = -1; k <= 1; k++) { c.strokeStyle = '#8a5f3c'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + tw / 2 + k * 2, 262 - th); c.lineTo(x + tw / 2 + k * 6, 262 - th - 18); c.stroke(); }
          c.fillStyle = 'rgba(205,228,235,0.85)'; c.beginPath(); c.roundRect(x, 262 - th, tw, th, 3); c.fill();
        } else {
          c.fillStyle = col; c.fillRect(x, 262 - th, tw, th);
          c.fillStyle = 'rgba(255,255,255,0.28)'; c.fillRect(x + 2, 262 - th, 3, th);
          c.fillStyle = '#b9c0c4'; c.fillRect(x - 1, 262 - th - 3, tw + 2, 3);
          c.fillStyle = col === '#f7f3ea' ? '#d9c9ac' : 'rgba(255,255,255,0.5)'; c.fillRect(x + 3, 262 - th * 0.62, tw - 6, th * 0.3);
        }
        x += tw + 6 + r() * 8;
      }
      // the boards
      c.fillStyle = '#c9b48f'; c.fillRect(x0, fy, w, y1 - fy);
      for (let y = fy + 6, k = 0; y < y1; y += 10 + k * 2, k++) { c.fillStyle = 'rgba(90,65,40,0.3)'; c.fillRect(x0, y, w, 1.4); }
      for (let i = 0; i < 40; i++) { c.fillStyle = U.pick(r, ['#2f5fa8', '#d9a53c', '#e2574c', '#f7f3ea']); c.beginPath(); c.ellipse(x0 + r() * w, fy + 6 + r() * (y1 - fy - 8), 1 + r() * 3, 0.7 + r() * 1.4, 0, 0, 7); c.fill(); }
      c.fillStyle = '#ddd5c4'; c.fillRect(x0, fy - 8, w, 8);
      // the tall easel with poppies in a field, the short one with a boat at sea
      const easel = (ex, top, foot, cw, ch, paint) => {
        c.strokeStyle = '#9a6b45'; c.lineWidth = 6; c.lineCap = 'round';
        c.beginPath(); c.moveTo(ex - 5, top + 6); c.lineTo(ex - cw * 0.46, foot); c.moveTo(ex + 5, top + 6); c.lineTo(ex + cw * 0.46, foot); c.stroke();
        c.strokeStyle = '#7d5434'; c.lineWidth = 7; c.beginPath(); c.moveTo(ex, top); c.lineTo(ex, foot - 12); c.stroke();
        const y = top + 14;
        c.fillStyle = 'rgba(40,25,10,0.22)'; c.fillRect(ex - cw / 2 + 4, y + 4, cw, ch);
        paint(ex - cw / 2, y, cw, ch);
        c.strokeStyle = '#f4efe2'; c.lineWidth = 2.5; c.strokeRect(ex - cw / 2, y, cw, ch);
        c.fillStyle = '#8a5f3c'; c.fillRect(ex - cw / 2 - 6, y + ch, cw + 12, 7); c.fillStyle = 'rgba(255,230,190,0.3)'; c.fillRect(ex - cw / 2 - 6, y + ch, cw + 12, 2);
      };
      easel(x0 + 82, 284, 464, 124, 112, (x, y, cw, ch) => {
        const g = c.createLinearGradient(0, y, 0, y + ch); g.addColorStop(0, '#f0d9a6'); g.addColorStop(0.45, '#f7ecd2'); g.addColorStop(0.46, '#7aa25a'); g.addColorStop(1, '#4f7f3f');
        c.fillStyle = g; c.fillRect(x, y, cw, ch);
        for (let k = 0; k < 34; k++) {
          const py = y + ch * 0.5 + r() * ch * 0.48, s = 1.6 + ((py - y) / ch) * 3.4;
          c.fillStyle = U.pick(r, ['#e2392f', '#ef5a48', '#d3362a']); c.beginPath(); c.arc(x + 4 + r() * (cw - 8), py, s, 0, 7); c.fill();
        }
      });
      easel(x1 - 56, 336, 472, 84, 62, (x, y, cw, ch) => {
        c.fillStyle = '#2f5fa8'; c.fillRect(x, y, cw, ch);
        c.fillStyle = '#8fb6dd'; c.fillRect(x, y, cw, ch * 0.5);
        c.fillStyle = '#f7f1e2'; c.beginPath(); c.moveTo(x + cw * 0.52, y + 6); c.lineTo(x + cw * 0.52, y + ch * 0.62); c.lineTo(x + cw * 0.78, y + ch * 0.62); c.closePath(); c.fill();
        c.fillStyle = '#d9a53c'; c.beginPath(); c.moveTo(x + cw * 0.26, y + ch * 0.66); c.lineTo(x + cw * 0.82, y + ch * 0.66); c.lineTo(x + cw * 0.72, y + ch * 0.82); c.lineTo(x + cw * 0.34, y + ch * 0.82); c.closePath(); c.fill();
      });
      // rolled canvases in the corner, and a stool with a pail of brushes
      for (const [rx, h, col] of [[x1 - 16, 150, '#ece4d2'], [x1 - 30, 128, '#e0d6c0'], [x1 - 8, 118, '#f2ecdf']]) {
        c.fillStyle = col; c.beginPath(); c.roundRect(rx - 8, 470 - h, 16, h, 7); c.fill();
        c.fillStyle = 'rgba(90,70,45,0.2)'; c.fillRect(rx + 3, 474 - h, 4, h - 8);
        c.fillStyle = '#b8a888'; c.beginPath(); c.ellipse(rx, 473 - h, 7, 2.6, 0, 0, 7); c.fill();
      }
      c.fillStyle = 'rgba(60,40,20,0.2)'; c.beginPath(); c.ellipse(180, 490, 28, 7, 0, 0, 7); c.fill();
      c.fillStyle = '#b9c0c4'; c.beginPath(); c.moveTo(162, 454); c.lineTo(198, 454); c.lineTo(194, 488); c.lineTo(166, 488); c.closePath(); c.fill();
      c.fillStyle = '#d5dbde'; c.beginPath(); c.ellipse(180, 454, 18, 4, 0, 0, 7); c.fill();
      for (let k = -2; k <= 2; k++) { c.strokeStyle = U.pick(r, ['#8a5f3c', '#c9474f', '#2f5fa8', '#3f8f8a']); c.lineWidth = 2.4; c.beginPath(); c.moveTo(180 + k * 3, 454); c.lineTo(180 + k * 9, 420); c.stroke(); c.fillStyle = '#d5dbde'; c.fillRect(178 + k * 9, 415, 4, 6); c.fillStyle = '#6b4a32'; c.beginPath(); c.ellipse(180 + k * 9, 411, 2.6, 5, 0, 0, 7); c.fill(); }
      glow(c, 180, 300, 220, 'rgba(255,240,200,0.12)');
    },
  };
  // shop windows sit in a painted timber shopfront: its colours, and the frame's
  // the tack room at the stables: pine boards, two saddles on their racks,
  // bridles on round holders, a row of rosettes, a shelf of tins and a trunk
  ROOM.tack = (c, r, x0, y0, x1, y1) => {
    const w = x1 - x0, fy = 440;
    c.fillStyle = '#dcbd8c'; c.fillRect(x0, y0, w, fy - y0);
    for (let x = x0 + 8; x < x1; x += 27) { c.fillStyle = 'rgba(110,70,30,0.24)'; c.fillRect(x, y0, 1.6, fy - y0); c.fillStyle = 'rgba(255,240,210,0.22)'; c.fillRect(x + 1.6, y0, 1.2, fy - y0); }
    for (let i = 0; i < 40; i++) { c.strokeStyle = 'rgba(120,80,40,0.14)'; c.lineWidth = 0.8; const x = x0 + r() * w, y = y0 + r() * (fy - y0); c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 2, y + 20 + r() * 40); c.stroke(); }
    // the brick floor
    c.fillStyle = '#7c4c38'; c.fillRect(x0, fy, w, y1 - fy);
    for (let y = fy + 1, row = 0; y < y1; y += 13, row++) for (let x = x0 - (row % 2) * 16; x < x1; x += 32) { c.fillStyle = U.pick(r, ['#a4644a', '#ad6e52', '#98593f']); c.fillRect(x + 1, y + 1, 30, 11); }
    // the shelf of tins and bottles
    const sy = 150;
    for (const [x, tw, th, col] of [[x0 + 18, 30, 34, '#4e7b5b'], [x0 + 54, 22, 26, '#c9474f'], [x0 + 82, 26, 30, '#e8c35a'], [x1 - 92, 24, 40, '#7a4a2a'], [x1 - 62, 34, 24, '#3d5a86']]) {
      c.fillStyle = col; c.fillRect(x, sy - th, tw, th); c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(x + 3, sy - th, 4, th);
      c.fillStyle = '#f4ecdc'; c.fillRect(x + 4, sy - th * 0.65, tw - 8, th * 0.32);
      c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x, sy - th, tw, 3);
    }
    c.fillStyle = '#8a6242'; c.fillRect(x0, sy, w, 8); c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(x0, sy + 8, w, 5);
    // two saddles on their racks, their cloths folded under them
    for (const [x, y, col, cloth] of [[x0 + 66, 222, '#8a4f2a', '#4e7b5b'], [x1 - 66, 222, '#5e3a24', '#c9474f']]) {
      c.fillStyle = '#6b4a32'; c.fillRect(x - 10, y - 2, 20, 8);
      c.fillStyle = cloth; c.beginPath(); c.moveTo(x - 44, y - 12); c.quadraticCurveTo(x, y + 12, x + 44, y - 16); c.lineTo(x + 34, y + 56); c.lineTo(x - 34, y + 56); c.closePath(); c.fill();
      c.strokeStyle = '#f4ecdc'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x - 36, y + 50); c.lineTo(x + 28, y + 50); c.stroke();
      tackSaddle(c, x, y - 2, 1, col);
    }
    // bridles on their holders and a row of rosettes
    const row = 318;
    for (const [x, col] of [[x0 + 40, '#5e3a24'], [x0 + 104, '#7a4a2a'], [x1 - 104, '#3b2a20']]) tackBridle(c, x, row, 0.95, col);
    tackRosette(c, x1 - 58, row + 8, 1.05, '#c9474f'); tackRosette(c, x1 - 26, row + 34, 0.9, '#3d5a86'); tackRosette(c, x1 - 62, row + 66, 0.9, '#e8c35a');
    // the trunk on the floor
    c.fillStyle = 'rgba(30,15,5,0.3)'; c.beginPath(); c.ellipse(x0 + 132, 476, 96, 8, 0, 0, 7); c.fill();
    c.fillStyle = '#4e7b5b'; c.beginPath(); c.roundRect(x0 + 46, 412, 172, 62, 5); c.fill();
    c.fillStyle = '#3f6a4c'; c.fillRect(x0 + 46, 428, 172, 5);
    c.fillStyle = '#c9a24a'; c.fillRect(x0 + 70, 412, 7, 62); c.fillRect(x0 + 187, 412, 7, 62); c.beginPath(); c.roundRect(x0 + 124, 424, 16, 16, 3); c.fill();
    glow(c, x0 + w * 0.42, 150, 240, 'rgba(255,226,170,0.22)');
  };

  const SHOPFRONT = {
    haberdashery: { body: '#e2b4ad', trim: '#5f9e9b', panel: '#d59f97', frame: '#6aa7a3', dk: '#4b8682' },
    curio: { body: '#2f5546', trim: '#c9a24a', panel: '#28493c', frame: '#2a4a3d', dk: '#1c3329' },
  };
  function glow(c, x, y, rad, col) {
    const g = c.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,214,140,0)');
    c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }

  function windowScene(S) {
    const { r, nz, opts, bleed } = S;
    const fx0 = 30, fy0 = 70, fx1 = 330, fy1 = 520, t = 18, m = 12;
    const gx0 = fx0 + t, gy0 = fy0 + t, gx1 = fx1 - t, gy1 = fy1 - t;
    const mx = (gx0 + gx1) / 2, my = (gy0 + gy1) / 2;
    // a signal box has nine small panes instead of four big ones
    const grid = opts.room === 'signalbox' ? 3 : 2, gm = grid === 3 ? 8 : m;
    const panes = [];
    if (grid === 2) panes.push([gx0, gy0, mx - m / 2, my - m / 2], [mx + m / 2, gy0, gx1, my - m / 2], [gx0, my + m / 2, mx - m / 2, gy1], [mx + m / 2, my + m / 2, gx1, gy1]);
    else {
      const pw = (gx1 - gx0 - gm * 2) / 3, ph = (gy1 - gy0 - gm * 2) / 3;
      for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) { const a = gx0 + i * (pw + gm), b = gy0 + j * (ph + gm); panes.push([a, b, a + pw, b + ph]); }
    }
    const region = new Path2D();
    for (const [a, b, c2, d] of panes) region.rect(a, b, c2 - a, d - b);
    const room = ROOM[opts.room] || ROOM.living;
    // a glasshouse is glass all round, on a low brick wall, not a window in plaster
    const gh = opts.room === 'glasshouse';
    // the pottery is an old brick barn; the station is cream weatherboarding;
    // the shops have painted timber shopfronts
    const wallKind = opts.room === 'pottery' ? 'brick' : opts.room === 'waiting' || opts.room === 'signalbox' ? 'boards' : opts.room === 'tack' ? 'oak' : opts.room === 'studio' ? 'slates' : opts.room === 'loft' ? 'lime' : SHOPFRONT[opts.room] ? 'shop' : '';
    const sf = SHOPFRONT[opts.room];
    return {
      family: 'wash', particle: 'suds', region,
      tough(x, y) {
        for (const [a, b, c2, d] of panes) if (x >= a && x <= c2 && y >= b && y <= d) return Math.min(x - a, c2 - x, y - b, d - y) < 14 ? 1.4 : 1;
        return 1;
      },
      decor(c) {
        if (gh) {
          const { x0, y0, x1, y1 } = bleed;
          const g = c.createLinearGradient(0, y0, 0, y1);
          g.addColorStop(0, '#cfe3dc'); g.addColorStop(1, '#b9d2c2');
          c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
          // the neighbouring panes, some a little green with age, in white bars
          for (let x = fx0 - 66, i = 0; x > x0 - 64; x -= 64, i++) for (let y = fy0 - 46, j = 0; y > y0 - 90; y -= 90, j++) { c.fillStyle = `rgba(120,150,110,${(0.08 + r() * 0.16).toFixed(2)})`; c.fillRect(x, y, 64, 90); }
          for (let x = fx1 + 6, i = 0; x < x1; x += 64, i++) for (let y = fy0 - 46, j = 0; y > y0 - 90; y -= 90, j++) { c.fillStyle = `rgba(120,150,110,${(0.08 + r() * 0.16).toFixed(2)})`; c.fillRect(x, y, 64, 90); }
          for (let x = fx0, i = 0; x < fx1; x += 75, i++) for (let y = fy0 - 46; y > y0 - 90; y -= 90) { c.fillStyle = `rgba(120,150,110,${(0.08 + r() * 0.16).toFixed(2)})`; c.fillRect(x, y, 75, 90); }
          c.fillStyle = '#e9e4d6';
          for (let x = fx0 - 70; x > x0 - 12; x -= 64) c.fillRect(x, y0, 8, fy1 - y0);
          for (let x = fx1 + 2; x < x1; x += 64) c.fillRect(x, y0, 8, fy1 - y0);
          for (let x = fx0 + 75; x < fx1; x += 75) c.fillRect(x - 3, y0, 6, fy0 - 46 - y0);
          for (let y = fy0 - 50; y > y0 - 10; y -= 90) c.fillRect(x0, y, x1 - x0, 8);
          c.fillStyle = 'rgba(255,255,255,0.18)';
          for (let x = fx1 + 20; x < x1; x += 64) { c.beginPath(); c.moveTo(x, fy1); c.lineTo(x + 16, fy1); c.lineTo(x + 40, y0); c.lineTo(x + 24, y0); c.closePath(); c.fill(); }
          // the low brick wall the glass stands on
          for (let y = fy1 + 14, row = 0; y < y1; y += 13, row++) for (let x = x0 - (row % 2) * 15; x < x1; x += 30) {
            c.fillStyle = U.pick(r, ['#b5603f', '#a8573a', '#bf6c48', '#9e5236']); c.fillRect(x + 1, y + 1, 28, 11);
          }
          const fr = new Path2D(); fr.rect(fx0 - 6, fy0 - 6, fx1 - fx0 + 12, fy1 - fy0 + 12);
          softShadow(c, fr, 10, 0.25, 0, 4);
          return;
        }
        if (wallKind === 'brick') {
          barnBricks(c, r, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1);
          ivySprig(c, r, bleed.x0 + 8, bleed.y1 - 10, 14, 1);
        } else if (wallKind === 'boards') {
          weatherboards(c, r, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1);
        } else if (wallKind === 'oak') {
          oakBoards(c, r, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1);
          ivySprig(c, r, bleed.x0 + 8, bleed.y1 - 10, 14, 1);
        } else if (wallKind === 'slates') {
          slates(c, r, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1);
        } else if (wallKind === 'lime') {
          limewash(c, r, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1);
          ivySprig(c, r, bleed.x1 - 6, bleed.y1 - 30, 10, -1);
        } else if (wallKind === 'shop') {
          // fluted pilasters either side, the fascia above and panelled stall risers below
          const { x0, y0, x1, y1 } = bleed;
          c.fillStyle = sf.body; c.fillRect(x0, y0, x1 - x0, y1 - y0);
          c.fillStyle = sf.panel; c.fillRect(x0, y0, x1 - x0, fy0 - 24 - y0);
          c.fillStyle = sf.trim; c.fillRect(x0, fy0 - 26, x1 - x0, 5); c.fillRect(x0, fy0 - 16, x1 - x0, 3);
          for (const [a, b] of [[x0, fx0 - 9], [fx1 + 9, x1]]) {
            c.fillStyle = sf.panel; c.fillRect(a, y0, b - a, y1 - y0);
            for (let x = a + 5; x < b - 4; x += 7) { c.fillStyle = 'rgba(0,0,0,0.13)'; c.fillRect(x, y0, 2, y1 - y0); c.fillStyle = 'rgba(255,255,255,0.1)'; c.fillRect(x + 2, y0, 1.2, y1 - y0); }
            c.fillStyle = sf.trim; c.fillRect(a, y0, 2.5, y1 - y0); c.fillRect(b - 2.5, y0, 2.5, y1 - y0);
          }
          const ry = fy1 + 56;
          for (const [a, b] of [[fx0 + 2, 176], [184, fx1 - 2]]) {
            c.fillStyle = sf.panel; c.fillRect(a, ry, b - a, y1 - ry + 10);
            c.strokeStyle = sf.trim; c.lineWidth = 2.5; c.strokeRect(a + 6, ry + 6, b - a - 12, y1 - ry);
          }
          for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},${(0.04 + r() * 0.05).toFixed(2)})`; c.beginPath(); c.ellipse(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 4 + r() * 10, 2 + r() * 5, r() * 3, 0, 7); c.fill(); }
        } else if (opts.wallColor) {
          paintedPlaster(c, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1, opts.wallColor);
          ivySprig(c, r, bleed.x0 + 8, bleed.y1 - 10, 12, 1);
        } else {
          oldPlaster(c, r, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1);
          ivySprig(c, r, bleed.x0 + 8, bleed.y1 - 10, 22, 1);
          ivySprig(c, r, bleed.x1 - 6, bleed.y1 - 30, 16, -1);
        }
        const fr = new Path2D(); fr.rect(fx0 - 6, fy0 - 6, fx1 - fx0 + 12, fy1 - fy0 + 30);
        softShadow(c, fr, 14, 0.4, 0, 6);
      },
      clean(c) {
        room(c, r, gx0, gy0, gx1, gy1);
        c.fillStyle = 'rgba(190,225,245,0.12)'; c.fillRect(gx0, gy0, gx1 - gx0, gy1 - gy0);
      },
      cleanOver(c) {
        c.save();
        c.globalCompositeOperation = 'lighter';
        for (const [o, wdt, a] of [[-60, 46, 0.16], [10, 16, 0.12], [120, 60, 0.1]]) {
          c.fillStyle = `rgba(255,255,255,${a})`;
          c.beginPath(); c.moveTo(gx0 + o + 160, gy0); c.lineTo(gx0 + o + 160 + wdt, gy0); c.lineTo(gx0 + o - 80 + wdt, gy1); c.lineTo(gx0 + o - 80, gy1); c.closePath(); c.fill();
        }
        c.restore();
      },
      dirt(c) {
        const g = ramp(['#8a8170', '#9d9482', '#aaa18e', '#b8af9b']);
        field(c, gx0, gy0, gx1, gy1, 2, (x, y) => {
          const v = nz.fbm(x * 0.025, y * 0.025, 5);
          return [...g(v), 250 - v * 22];
        });
        // dried rain streaks
        for (let i = 0; i < 70; i++) {
          const x = gx0 + r() * (gx1 - gx0), y = gy0 + r() * (gy1 - gy0) * 0.7, l = 30 + r() * 120;
          c.strokeStyle = `rgba(230,225,210,${0.15 + r() * 0.25})`; c.lineWidth = 1 + r() * 1.5;
          c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (r() - 0.5) * 6, y + l / 2, x + (r() - 0.5) * 4, y + l); c.stroke();
        }
        // water spots
        for (let i = 0; i < 90; i++) {
          const x = gx0 + r() * (gx1 - gx0), y = gy0 + r() * (gy1 - gy0), s = 2 + r() * 6;
          c.strokeStyle = 'rgba(240,235,220,0.45)'; c.lineWidth = 0.8; c.beginPath(); c.arc(x, y, s, 0, 7); c.stroke();
        }
        grime(c, r, gx0, gy0, gx1, gy1, 14);
        // a pollen dusting and a few leaves
        for (let i = 0; i < 900; i++) { c.fillStyle = r() < 0.5 ? 'rgba(90,75,50,0.35)' : 'rgba(230,210,140,0.35)'; c.fillRect(gx0 + r() * (gx1 - gx0), gy0 + r() * (gy1 - gy0), 1.2, 1.2); }
        for (let i = 0; i < 7; i++) {
          c.fillStyle = U.pick(r, ['#b5762f', '#8c5a2b', '#9a8a3a']);
          c.save(); c.translate(gx0 + r() * (gx1 - gx0), gy0 + r() * (gy1 - gy0)); c.rotate(r() * 6.28);
          c.beginPath(); c.ellipse(0, 0, 8, 4, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(60,40,20,0.5)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-8, 0); c.lineTo(8, 0); c.stroke(); c.restore();
        }
        // cobweb in the top corner
        const cx = gx1 - 2, cy = gy0 + 2;
        c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 0.7;
        for (let k = 0; k < 7; k++) { const a = Math.PI / 2 + (k / 6) * (Math.PI / 2); c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * 70, cy + Math.sin(a) * 70); c.stroke(); }
        for (let ring = 12; ring < 70; ring += 11) { c.beginPath(); for (let k = 0; k <= 6; k++) { const a = Math.PI / 2 + (k / 6) * (Math.PI / 2); const rr = ring + (k % 2) * 2; c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } c.stroke(); }
      },
      top(c) {
        const frame = wallKind === 'boards' ? '#8e3b3f' : wallKind === 'brick' ? '#a9c2a4' : wallKind === 'shop' ? sf.frame : wallKind === 'lime' ? '#3f6fb0' : wallKind === 'slates' ? '#4a525c' : '#f1ebdd', dk = wallKind === 'boards' ? '#6b2a2e' : wallKind === 'brick' ? '#86a283' : wallKind === 'shop' ? sf.dk : wallKind === 'lime' ? '#2e5288' : wallKind === 'slates' ? '#333a42' : '#cfc6b3';
        c.fillStyle = frame;
        c.beginPath(); c.rect(fx0, fy0, fx1 - fx0, fy1 - fy0); c.rect(gx1, gy0, gx0 - gx1, gy1 - gy0); c.fill('evenodd');
        if (grid === 2) { c.fillRect(mx - m / 2, gy0, m, gy1 - gy0); c.fillRect(gx0, my - m / 2, gx1 - gx0, m); }
        else for (let k = 0; k < 2; k++) { c.fillRect(panes[k][2], gy0, gm, gy1 - gy0); c.fillRect(gx0, panes[k * 3][3], gx1 - gx0, gm); }
        c.fillStyle = 'rgba(0,0,0,0.1)'; c.fillRect(gx0, gy0, gx1 - gx0, 4); c.fillRect(gx0, gy0, 4, gy1 - gy0);
        c.strokeStyle = dk; c.lineWidth = 1.2; c.strokeRect(fx0 + 0.5, fy0 + 0.5, fx1 - fx0 - 1, fy1 - fy0 - 1);
        // chips in the old paint
        for (let i = 0; i < (opts.wallColor || wallKind === 'slates' ? 0 : 26); i++) {
          const side = r() * 4 | 0;
          const x = side < 2 ? fx0 + r() * (fx1 - fx0) : (side === 2 ? fx0 + r() * t : fx1 - r() * t);
          const y = side < 2 ? (side === 0 ? fy0 + r() * t : fy1 - r() * t) : fy0 + r() * (fy1 - fy0);
          c.fillStyle = '#b8a58a'; c.beginPath(); c.ellipse(x, y, 1.5 + r() * 3, 1 + r() * 2, r() * 3, 0, 7); c.fill();
        }
        if (gh) {
          // stone coping on the brick wall instead of a sill and flower box
          c.fillStyle = '#d9d3c5'; c.fillRect(bleed.x0, fy1, bleed.x1 - bleed.x0, 14);
          c.fillStyle = '#bfb8a8'; c.fillRect(bleed.x0, fy1 + 12, bleed.x1 - bleed.x0, 3);
          return;
        }
        if (wallKind === 'slates') {
          // lead flashing dressed over the slates, and a brass stay at the foot of the frame
          c.fillStyle = '#7f8993'; c.fillRect(fx0 - 16, fy0 - 16, fx1 - fx0 + 32, 16);
          c.fillRect(fx0 - 16, fy0, 16, fy1 - fy0); c.fillRect(fx1, fy0, 16, fy1 - fy0);
          c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(fx0 - 16, fy0 - 16, fx1 - fx0 + 32, 2);
          c.fillStyle = '#7f8993'; c.beginPath(); c.moveTo(fx0 - 16, fy1); c.lineTo(fx1 + 16, fy1);
          for (let x = fx1 + 16; x > fx0 - 16; x -= 28) c.quadraticCurveTo(x - 14, fy1 + 36, x - 28, fy1 + 26);
          c.closePath(); c.fill();
          c.fillStyle = 'rgba(16,20,26,0.26)'; c.fillRect(fx0 - 16, fy1, fx1 - fx0 + 32, 4);
          c.fillStyle = '#c9a24a'; c.beginPath(); c.roundRect(164, fy1 - 14, 32, 8, 3); c.fill();
          c.fillStyle = '#f2d88a'; c.fillRect(170, fy1 - 13, 20, 2);
          return;
        }
        // sill with a flower box
        c.fillStyle = '#e4dccb'; c.fillRect(fx0 - 14, fy1, fx1 - fx0 + 28, 14);
        c.fillStyle = '#cfc6b3'; c.fillRect(fx0 - 14, fy1 + 12, fx1 - fx0 + 28, 4);
        c.fillStyle = '#8a5a3c'; c.fillRect(fx0 + 6, fy1 + 16, fx1 - fx0 - 12, 34);
        c.fillStyle = '#7a4e33'; c.fillRect(fx0 + 6, fy1 + 16, fx1 - fx0 - 12, 5);
        for (let i = 0; i < 16; i++) {
          const x = fx0 + 18 + i * ((fx1 - fx0 - 36) / 15);
          c.fillStyle = '#4f8a3a'; c.beginPath(); c.ellipse(x, fy1 + 10, 9, 6, r(), 0, 7); c.fill();
          c.fillStyle = U.pick(r, ['#e0485a', '#f06a7e', '#d93b4f']); c.beginPath(); c.arc(x + (r() - 0.5) * 6, fy1 + 2 - r() * 8, 4.5, 0, 7); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); c.arc(x - 1, fy1 - 2, 1.5, 0, 7); c.fill();
        }
      },
    };
  }

  // -------------------------------------------------------------- BARN DOOR
  // The pottery's wide double door of planks, in the player's colour, with
  // ledges and braces, black strap hinges and a latch, set in the old barn.
  function barnDoor(S) {
    const { r, nz, bleed } = S;
    const x0 = 52, x1 = 308, y0 = 128, y1 = 540, cx = 180;
    const ledges = [[180, 206], [452, 478]];
    const straps = [[x0, 187, 100], [x1 - 100, 187, 100], [x0, 459, 100], [x1 - 100, 459, 100]];
    const latch = [cx - 16, 324, 32, 10];
    const region = new Path2D();
    region.rect(x0, y0, x1 - x0, y1 - y0);
    for (const [x, y, w] of straps) region.rect(x, y, w, 12);
    region.rect(...latch);
    // a diagonal brace in each leaf, from the low ledge up to the high one
    const braces = [[x0 + 10, ledges[1][0], cx - 10, ledges[0][1]], [x1 - 10, ledges[1][0], cx + 10, ledges[0][1]]];
    const lavender = (c, x, y) => {
      for (let i = 0; i < 16; i++) {
        const a = -Math.PI / 2 + (r() - 0.5) * 1.3, len = 26 + r() * 24, ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
        c.strokeStyle = '#7d9a6a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x, y); c.lineTo(ex, ey); c.stroke();
        for (let k = 0; k < 5; k++) { c.fillStyle = U.pick(r, ['#9a7fc8', '#8a6fbd', '#b39ad8']); c.beginPath(); c.ellipse(ex - Math.cos(a) * k * 3, ey - Math.sin(a) * k * 3, 2.2, 3, a, 0, 7); c.fill(); }
      }
    };
    return {
      family: 'paint', particle: 'paint', region,
      tough: (x, y) => (y > 490 ? 1.35 : 1),
      decor(c) {
        barnBricks(c, r, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1);
        // an oak lintel and the dark opening behind the door
        c.fillStyle = '#3b2a1e'; c.fillRect(x0 - 6, y0 - 6, x1 - x0 + 12, y1 - y0 + 6);
        c.fillStyle = '#6b4a32'; c.fillRect(x0 - 26, y0 - 34, x1 - x0 + 52, 28);
        c.fillStyle = 'rgba(255,220,180,0.15)'; c.fillRect(x0 - 26, y0 - 34, x1 - x0 + 52, 3);
        c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x0 - 26, y0 - 9, x1 - x0 + 52, 3);
        for (let i = 0; i < 30; i++) { c.strokeStyle = 'rgba(40,25,15,0.35)'; c.lineWidth = 0.8; const yy = y0 - 32 + r() * 24, xx = x0 - 24 + r() * (x1 - x0 + 40); c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx + 20 + r() * 40, yy + (r() - 0.5) * 2); c.stroke(); }
        // the cobbled yard in front, and lavender in old pots either side
        c.fillStyle = '#8f8576'; c.fillRect(bleed.x0, y1, bleed.x1 - bleed.x0, bleed.y1 - y1);
        for (let y = y1 + 2; y < bleed.y1; y += 12) for (let x = bleed.x0 - (y % 24 ? 8 : 0); x < bleed.x1; x += 16) { c.fillStyle = U.pick(r, ['#a49a8a', '#b3a998', '#978d7e', '#bdb3a2']); c.beginPath(); c.ellipse(x + 8, y + 5, 7, 5, 0, 0, 7); c.fill(); }
        for (const px of [22, 338]) {
          lavender(c, px, 492);
          c.fillStyle = '#c8763f'; c.beginPath(); c.moveTo(px - 20, 490); c.lineTo(px + 20, 490); c.lineTo(px + 15, 540); c.lineTo(px - 15, 540); c.closePath(); c.fill();
          c.fillStyle = '#b5652f'; c.fillRect(px - 22, 486, 44, 9);
        }
        const fr = new Path2D(); fr.rect(x0 - 6, y0 - 34, x1 - x0 + 12, y1 - y0 + 34);
        softShadow(c, fr, 12, 0.35, 0, 6);
      },
      clean(c, paint) { c.fillStyle = paint; c.fillRect(0, 0, W, H); },
      cleanOver(c) {
        // planks, the centre seam, then the ledges and braces standing proud
        for (let x = x0 + 32; x < x1; x += 32) {
          if (Math.abs(x - cx) < 2) continue;
          c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(x - 1, y0, 2, y1 - y0);
          c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x + 1, y0, 1.5, y1 - y0);
        }
        c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(cx - 1.5, y0, 3, y1 - y0);
        for (let i = 0; i < 180; i++) { c.strokeStyle = 'rgba(0,0,0,0.05)'; c.lineWidth = 0.8; const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0); c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 20 + r() * 50); c.stroke(); }
        for (const [a, b] of ledges) {
          c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x0, b, x1 - x0, 4);
          c.fillStyle = 'rgba(255,255,255,0.16)'; c.fillRect(x0, a, x1 - x0, 2.5);
        }
        for (const [ax, ay, bx, by] of braces) {
          c.save(); c.lineCap = 'butt';
          c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 24; c.beginPath(); c.moveTo(ax, ay + 3); c.lineTo(bx, by + 3); c.stroke();
          c.strokeStyle = 'rgba(255,255,255,0.1)'; c.lineWidth = 22; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
          c.restore();
        }
      },
      dirt(c) {
        weatheredWood(c, r, nz, x0 - 2, y0 - 2, x1 + 2, y1 + 2);
        peelingPaint(c, r, x0, y0, x1, y1, 50, '#a3b7b1');
        for (const [a, b] of ledges) { c.fillStyle = 'rgba(40,32,24,0.4)'; c.fillRect(x0, b, x1 - x0, 4); c.fillStyle = 'rgba(255,255,255,0.1)'; c.fillRect(x0, a, x1 - x0, 2); }
        for (const [ax, ay, bx, by] of braces) { c.save(); c.strokeStyle = 'rgba(40,32,24,0.3)'; c.lineWidth = 24; c.beginPath(); c.moveTo(ax, ay + 3); c.lineTo(bx, by + 3); c.stroke(); c.restore(); }
        c.fillStyle = 'rgba(40,32,24,0.5)'; c.fillRect(cx - 1.5, y0, 3, y1 - y0);
        const gr = c.createLinearGradient(0, 440, 0, y1); gr.addColorStop(0, 'rgba(90,120,50,0)'); gr.addColorStop(1, 'rgba(90,120,50,0.55)');
        c.fillStyle = gr; c.fillRect(x0, 440, x1 - x0, y1 - 440);
        grime(c, r, x0, 470, x1, y1, 26);
        // clay smudges where hands have pushed it open for years
        for (let i = 0; i < 14; i++) { c.fillStyle = `rgba(150,110,80,${0.2 + r() * 0.25})`; c.beginPath(); c.ellipse(cx + (r() - 0.5) * 70, 300 + r() * 80, 4 + r() * 6, 3 + r() * 4, r() * 3, 0, 7); c.fill(); }
      },
      top(c) {
        for (const [x, y, w] of straps) {
          const left = x === x0, tip = left ? x + w : x;
          c.fillStyle = '#2f2c2a'; c.fillRect(x, y, w, 12);
          c.beginPath(); c.moveTo(tip, y - 3); c.lineTo(tip + (left ? 14 : -14), y + 6); c.lineTo(tip, y + 15); c.closePath(); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(x, y + 1, w, 2);
          for (let k = 0; k < 4; k++) { c.fillStyle = '#56504a'; c.beginPath(); c.arc(x + 12 + k * 26, y + 6, 2.2, 0, 7); c.fill(); }
        }
        const [lx, ly, lw, lh] = latch;
        c.fillStyle = '#2f2c2a'; c.beginPath(); c.roundRect(lx, ly, lw, lh, 3); c.fill();
        c.fillStyle = '#2f2c2a'; c.fillRect(lx - 6, ly - 4, 6, 18); c.fillRect(lx + lw, ly - 4, 6, 18);
        c.strokeStyle = '#2f2c2a'; c.lineWidth = 4; c.beginPath(); c.arc(cx + 34, ly + 30, 11, 0, 7); c.stroke();
        c.fillStyle = '#2f2c2a'; c.beginPath(); c.arc(cx + 34, ly + 17, 4, 0, 7); c.fill();
        // a horseshoe over the door, for luck
        c.strokeStyle = '#6b6f75'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.arc(cx, y0 - 20, 11, Math.PI * 1.05, Math.PI * 1.95, true); c.stroke();
        c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x0, y1 - 6, x1 - x0, 6);
      },
      stamp: paintStamp,
    };
  }

  // ------------------------------------------------------------------- DOOR
  function door(S) {
    if (S.opts.what === 'barn') return barnDoor(S);
    const { r, nz, opts, bleed } = S;
    const x0 = 80, x1 = 280, yTop = 150, y1 = 540, cx = 180, R = 100;
    const fan = 66;
    // the café door has a big glass pane and a push handle instead; the door
    // in the garden wall is planked, with iron straps and a ring, set in brick
    const cafe = !!opts.cafe, garden = !!opts.garden, glass = [104, 186, 152, 140], bar = [234, 350, 10, 84];
    const region = new Path2D();
    region.moveTo(x0, y1); region.lineTo(x0, yTop); region.arc(cx, yTop, R, Math.PI, 0); region.lineTo(x1, y1); region.closePath();
    // fanlight, knob and letterbox are holes
    if (!garden) { region.moveTo(cx - fan, yTop); region.arc(cx, yTop, fan, Math.PI, 0); region.closePath(); }
    if (cafe) { region.rect(...glass); region.rect(...bar); }
    else if (garden) { region.moveTo(256, 352); region.arc(244, 352, 12, 0, Math.PI * 2); }
    else { region.moveTo(252, 360); region.arc(244, 360, 8, 0, Math.PI * 2); region.rect(150, 300, 60, 14); }
    const panels = garden ? [] : cafe ? [[100, 350, 64, 160], [196, 350, 64, 160]] : [[100, 190, 64, 120], [196, 190, 64, 120], [100, 340, 64, 170], [196, 340, 64, 170]];
    return {
      family: 'paint', particle: 'paint', region,
      tough: (x, y) => (y > 480 ? 1.35 : 1),
      decor(c) {
        // stone surround and a brick doorstep
        if (garden) {
          // the old brick garden wall, ivy spilling over the top
          for (let y = bleed.y0, row = 0; y < y1; y += 13, row++) for (let x = bleed.x0 - (row % 2) * 15; x < bleed.x1; x += 30) {
            c.fillStyle = U.pick(r, ['#b5603f', '#a8573a', '#bf6c48', '#9e5236', '#b86a4a']); c.fillRect(x + 1, y + 1, 28, 11);
          }
          ivySprig(c, r, bleed.x0 + 10, 80, 26, 1); ivySprig(c, r, bleed.x1 - 8, 60, 22, -1);
        } else if (opts.wallColor) paintedPlaster(c, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1, opts.wallColor);
        else oldPlaster(c, r, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1, ['#c4b79d', '#d1c5ad', '#dcd2be', '#e2d9c7']);
        c.fillStyle = garden ? '#d6cfbf' : '#efe7d8';
        c.beginPath(); c.moveTo(x0 - 22, y1); c.lineTo(x0 - 22, yTop); c.arc(cx, yTop, R + 22, Math.PI, 0); c.lineTo(x1 + 22, y1); c.closePath(); c.fill();
        c.fillStyle = '#5b4a3a';
        c.beginPath(); c.moveTo(x0 - 4, y1); c.lineTo(x0 - 4, yTop); c.arc(cx, yTop, R + 4, Math.PI, 0); c.lineTo(x1 + 4, y1); c.closePath(); c.fill();
        // fanlight glass with a sunburst
        const g = c.createLinearGradient(0, yTop - fan, 0, yTop);
        if (garden) c.globalAlpha = 0; // no fanlight in a garden door
        g.addColorStop(0, '#ffe2a6'); g.addColorStop(1, '#f2b46a');
        c.fillStyle = g; c.beginPath(); c.moveTo(cx - fan, yTop); c.arc(cx, yTop, fan, Math.PI, 0); c.closePath(); c.fill();
        c.strokeStyle = '#efe7d8'; c.lineWidth = 3;
        for (let k = 0; k <= 6; k++) { const a = Math.PI + (k / 6) * Math.PI; c.beginPath(); c.moveTo(cx, yTop); c.lineTo(cx + Math.cos(a) * fan, yTop + Math.sin(a) * fan); c.stroke(); }
        c.beginPath(); c.arc(cx, yTop, 16, Math.PI, 0); c.stroke();
        c.globalAlpha = 1;
        // step
        c.fillStyle = garden ? '#8a9a6a' : '#b28b6d'; c.fillRect(bleed.x0, y1, bleed.x1 - bleed.x0, bleed.y1 - y1);
        c.fillStyle = '#c9a587'; c.fillRect(x0 - 40, y1, x1 - x0 + 80, 18);
        c.fillStyle = '#9c765a'; c.fillRect(x0 - 40, y1 + 18, x1 - x0 + 80, 5);
        // pots
        for (const px of [x0 - 52, x1 + 52]) {
          c.fillStyle = '#c8763f'; c.beginPath(); c.moveTo(px - 22, 470); c.lineTo(px + 22, 470); c.lineTo(px + 16, 538); c.lineTo(px - 16, 538); c.closePath(); c.fill();
          c.fillStyle = '#b5652f'; c.fillRect(px - 24, 466, 48, 10);
          shrub(c, r, px, 440, 34, '#4f8a3c');
          for (let i = 0; i < 7; i++) { c.fillStyle = U.pick(r, ['#f7b6c8', '#ffffff', '#efb4ae']); c.beginPath(); c.arc(px + (r() - 0.5) * 40, 430 + (r() - 0.5) * 30, 3, 0, 7); c.fill(); }
        }
        if (cafe) {
          // through the glass: warm light and an OPEN sign on a string
          const [gx, gy, gw, gh] = glass, mx = gx + gw / 2;
          const g = c.createLinearGradient(0, gy, 0, gy + gh); g.addColorStop(0, '#34493f'); g.addColorStop(1, '#5d4a3a');
          c.fillStyle = g; c.fillRect(gx, gy, gw, gh);
          glow(c, gx + 40, gy + 26, 80, 'rgba(255,206,130,0.6)');
          c.fillStyle = '#c9a24a'; c.beginPath(); c.ellipse(gx + 40, gy + 22, 14, 10, 0, Math.PI, 0); c.fill();
          c.fillStyle = '#7a5236'; c.fillRect(gx, gy + 104, gw, gh - 104); c.fillStyle = '#ece6da'; c.fillRect(gx, gy + 100, gw, 6);
          c.strokeStyle = '#3d3d42'; c.lineWidth = 1; c.beginPath(); c.moveTo(mx - 26, gy); c.lineTo(mx, gy + 40); c.lineTo(mx + 26, gy); c.stroke();
          c.fillStyle = '#f4ecdc'; c.beginPath(); c.roundRect(mx - 34, gy + 40, 68, 26, 4); c.fill();
          c.fillStyle = '#c9474f'; c.font = 'bold 15px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('OPEN', mx, gy + 54);
        }
      },
      clean(c, paint) { c.fillStyle = paint; c.fillRect(0, 0, W, H); },
      cleanOver(c) {
        if (garden) for (let x = x0 + 25; x < x1; x += 25) { c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x - 1, 40, 2, 500); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x + 1, 40, 1.5, 500); }
        for (const [x, y, w, h] of panels) {
          c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(x, y, w, 4); c.fillRect(x, y, 4, h);
          c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(x, y + h - 4, w, 4); c.fillRect(x + w - 4, y, 4, h);
          c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(x + 10, y + 10, w - 20, h - 20);
          c.fillStyle = 'rgba(0,0,0,0.06)'; c.fillRect(x + 10, y + 10, w - 20, 2);
        }
        for (let i = 0; i < 160; i++) { c.strokeStyle = 'rgba(0,0,0,0.05)'; c.lineWidth = 0.8; const x = x0 + r() * (x1 - x0), y = 60 + r() * 470; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 20 + r() * 50); c.stroke(); }
      },
      dirt(c) {
        const g = ramp(['#7f8c86', '#8f9b94', '#9ea8a0', '#aab1a6']);
        field(c, 60, 40, 300, 545, 1.5, (x, y) => g(nz.fbm(x * 0.06, y * 0.012, 4)));
        // crackle in the old paint
        c.strokeStyle = 'rgba(60,55,45,0.5)'; c.lineWidth = 0.7;
        for (let i = 0; i < 140; i++) {
          let x = 70 + r() * 220, y = 50 + r() * 490; c.beginPath(); c.moveTo(x, y);
          for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 16; y += (r() - 0.5) * 16; c.lineTo(x, y); }
          c.stroke();
        }
        peelingPaint(c, r, 80, 60, 280, 530, 40, '#a77b56');
        for (const [x, y, w, h] of panels) { c.strokeStyle = 'rgba(50,45,38,0.45)'; c.lineWidth = 2; c.strokeRect(x, y, w, h); }
        grime(c, r, 80, 440, 280, 540, 26);
        c.fillStyle = 'rgba(80,65,45,0.35)'; c.fillRect(80, 520, 200, 20);
      },
      top(c) {
        if (cafe) {
          const [gx, gy, gw, gh] = glass;
          c.strokeStyle = 'rgba(40,30,20,0.5)'; c.lineWidth = 3; c.strokeRect(gx - 1.5, gy - 1.5, gw + 3, gh + 3);
          c.fillStyle = 'rgba(255,255,255,0.13)'; c.beginPath(); c.moveTo(gx + 20, gy + gh); c.lineTo(gx + 50, gy + gh); c.lineTo(gx + 104, gy); c.lineTo(gx + 74, gy); c.closePath(); c.fill();
          c.fillStyle = '#e2b850'; c.font = 'italic bold 20px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Café', gx + gw / 2, gy + gh - 18);
          const [hx, hy, hw, hh] = bar;
          c.fillStyle = '#8a6a26'; c.fillRect(hx - 3, hy + 6, hw + 6, 5); c.fillRect(hx - 3, hy + hh - 11, hw + 6, 5);
          c.fillStyle = '#c9a24a'; c.beginPath(); c.roundRect(hx, hy, hw, hh, 5); c.fill();
          c.fillStyle = '#f2d88a'; c.fillRect(hx + 2, hy + 6, 3, hh - 12);
          return;
        }
        if (garden) {
          // black iron straps, a ring to pull and a big keyhole
          for (const y of [196, 470]) {
            c.fillStyle = '#2f2c2a'; c.fillRect(x0 - 2, y, 150, 12); c.beginPath(); c.arc(x0 + 148, y + 6, 8, 0, 7); c.fill();
            c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(x0 - 2, y + 1, 150, 2);
            for (const bx of [x0 + 20, x0 + 70, x0 + 120]) { c.fillStyle = '#56504a'; c.beginPath(); c.arc(bx, y + 6, 2.4, 0, 7); c.fill(); }
          }
          c.strokeStyle = '#2f2c2a'; c.lineWidth = 4; c.beginPath(); c.arc(244, 352, 12, 0, 7); c.stroke();
          c.fillStyle = '#2f2c2a'; c.beginPath(); c.arc(244, 338, 5, 0, 7); c.fill();
          c.fillStyle = '#2f2c2a'; c.beginPath(); c.arc(214, 400, 5, 0, 7); c.fill(); c.fillRect(212, 400, 4, 12);
          return;
        }
        c.fillStyle = '#d9b35a'; c.beginPath(); c.arc(244, 360, 8, 0, 7); c.fill();
        c.fillStyle = '#f2d88a'; c.beginPath(); c.arc(242, 358, 4, 0, 7); c.fill();
        c.fillStyle = '#c9a24a'; c.beginPath(); c.roundRect(150, 300, 60, 14, 3); c.fill();
        c.fillStyle = '#7d5f22'; c.fillRect(156, 305, 48, 4);
        c.fillStyle = '#d9b35a'; c.font = '900 30px ui-rounded, system-ui, sans-serif'; c.textAlign = 'center'; c.fillText('7', cx, 270);
      },
      stamp: paintStamp,
    };
  }

  // ------------------------------------------------------------------- WALL
  function wall(S) {
    const { r, nz, bleed } = S;
    const win = [110, 160, 250, 330]; // x0,y0,x1,y1 of the window opening incl. frame
    const region = new Path2D();
    region.rect(0, 30, W, 520);
    region.rect(win[0] - 10, win[1] - 10, win[2] - win[0] + 20, win[3] - win[1] + 34);
    return {
      family: 'paint', particle: 'paint', region,
      tough: (x, y) => (x < 40 || x > 320 ? 1.4 : y > 500 ? 1.3 : 1),
      decor(c) {
        // eaves above and a flower bed below
        c.fillStyle = '#8e5744'; c.fillRect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, 30 - bleed.y0);
        c.fillStyle = '#c96f4f';
        for (let x = bleed.x0; x < bleed.x1; x += 14) { c.beginPath(); c.arc(x + 7, 22, 7, 0, Math.PI); c.fill(); }
        c.fillStyle = '#6b4a33'; c.fillRect(bleed.x0, 550, bleed.x1 - bleed.x0, bleed.y1 - 550);
        for (let i = 0; i < 14; i++) flowerClump(c, r, 10 + i * 26 + r() * 10, 562 + r() * 20, U.pick(r, ['#ef8aa6', '#f7c548', '#ffffff', '#bba9df']));
      },
      clean(c, paint) { c.fillStyle = paint; c.fillRect(0, 0, W, H); },
      cleanOver(c) {
        field(c, 0, 30, W, 550, 3, (x, y) => { const v = nz.fbm(x * 0.05 + 30, y * 0.05, 3); return v > 0.5 ? [255, 255, 255, (v - 0.5) * 90] : [0, 0, 0, (0.5 - v) * 50]; });
        const g = c.createLinearGradient(0, 30, 0, 70); g.addColorStop(0, 'rgba(0,0,0,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g; c.fillRect(0, 30, W, 40);
      },
      dirt(c) {
        oldPlaster(c, r, nz, 0, 30, W, 550);
        // ivy creeping in from both sides
        for (let i = 0; i < 5; i++) ivySprig(c, r, 6 + r() * 30, 550, 26 + (r() * 14 | 0), 1);
        for (let i = 0; i < 5; i++) ivySprig(c, r, W - 6 - r() * 30, 550, 24 + (r() * 14 | 0), -1);
        const gr = c.createLinearGradient(0, 470, 0, 550); gr.addColorStop(0, 'rgba(80,100,50,0)'); gr.addColorStop(1, 'rgba(80,100,50,0.45)');
        c.fillStyle = gr; c.fillRect(0, 470, W, 80);
        // a dirty streak under the sill
        const sg = c.createLinearGradient(0, win[3] + 24, 0, win[3] + 180); sg.addColorStop(0, 'rgba(70,60,45,0.4)'); sg.addColorStop(1, 'rgba(70,60,45,0)');
        c.fillStyle = sg; c.fillRect(win[0], win[3] + 24, win[2] - win[0], 160);
      },
      top(c) {
        const [a, b, c2, d] = win;
        c.fillStyle = '#f1ebdd'; c.fillRect(a - 10, b - 10, c2 - a + 20, d - b + 20);
        const g = c.createLinearGradient(0, b, 0, d); g.addColorStop(0, '#ffe4a8'); g.addColorStop(1, '#f0a95f');
        c.fillStyle = g; c.fillRect(a, b, c2 - a, d - b);
        c.fillStyle = '#efb4ae'; c.beginPath(); c.moveTo(a, b); c.lineTo(a + 34, b); c.quadraticCurveTo(a + 20, (b + d) / 2, a + 30, d); c.lineTo(a, d); c.fill();
        c.beginPath(); c.moveTo(c2, b); c.lineTo(c2 - 34, b); c.quadraticCurveTo(c2 - 20, (b + d) / 2, c2 - 30, d); c.lineTo(c2, d); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.moveTo(a + 60, b); c.lineTo(a + 90, b); c.lineTo(a + 40, d); c.lineTo(a + 10, d); c.fill();
        c.fillStyle = '#f1ebdd'; c.fillRect((a + c2) / 2 - 4, b, 8, d - b); c.fillRect(a, (b + d) / 2 - 4, c2 - a, 8);
        c.fillStyle = '#e4dccb'; c.fillRect(a - 18, d + 10, c2 - a + 36, 12);
        c.fillStyle = '#cfc6b3'; c.fillRect(a - 18, d + 20, c2 - a + 36, 4);
        // wall lantern
        c.fillStyle = '#3d3d42'; c.fillRect(300, 210, 6, 30); c.fillRect(290, 200, 26, 6);
        c.fillStyle = '#ffe9b0'; c.beginPath(); c.roundRect(292, 206, 22, 30, 4); c.fill();
        c.strokeStyle = '#3d3d42'; c.lineWidth = 2; c.beginPath(); c.roundRect(292, 206, 22, 30, 4); c.stroke();
      },
      stamp: paintStamp,
    };
  }

  Object.assign(SCENES.KINDS, { fence, window: windowScene, door, wall });
  // painters the café scenes reuse
  Object.assign(SCENES, { paintStamp, peelingPaint, grime, weatheredWood, barnBricks, weatherboards, limewash, slates, oakBoards, tackSaddle, tackBridle, tackRosette });
})();
