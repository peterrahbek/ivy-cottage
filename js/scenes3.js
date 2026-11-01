'use strict';
// More scenes: flower beds to weed, the pond, the mossy roof, the shutters
// and the dusty attic (floor and round window).

(() => {
  const { W, H, field, ramp, rrPath, blob, inside, softShadow, shrub, flowerClump, mowedLawn, grassGrain, strokesByColour } = SCENES;

  function paintStamp(c, x, y, a, tier, paint) {
    c.fillStyle = paint;
    if (tier.shape === 'rect') { c.save(); c.translate(x, y); c.rotate(a); c.fillRect(-tier.h / 2 - 1, -tier.w / 2, tier.h + 2, tier.w); c.restore(); }
    else { c.beginPath(); c.arc(x, y, tier.r, 0, 7); c.fill(); }
  }
  function lawnAround(c, r, nz, bleed) {
    mowedLawn(c, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1, true);
    grassGrain(c, r, bleed.x0, bleed.y0, bleed.x1, bleed.y1, 5, 0.22);
  }
  function soil(c, nz, x0, y0, x1, y1) {
    const g = ramp(['#3e2a1e', '#4d3424', '#5e412c', '#6b4a33']);
    field(c, x0, y0, x1, y1, 2, (x, y) => g(nz.fbm(x * 0.07, y * 0.07, 4) * 0.8 + nz.n2(x * 0.5, y * 0.5) * 0.2));
  }

  // ------------------------------------------------------------- FLOWER BED
  function bed(S) {
    const { r, nz, opts, bleed } = S;
    const region = new Path2D();
    blob(region, 180, 300, 148, 236, r, 0.07, 18);
    const roses = opts.flower !== 'tulip';
    const plants = [];
    for (let y = 100; y < 520; y += 46) for (let x = 50 + ((y / 46) % 2) * 23; x < 320; x += 46) {
      const px = x + (r() - 0.5) * 10, py = y + (r() - 0.5) * 10;
      if (inside(region, px, py)) plants.push([px, py]);
    }
    const cols = roses ? ['#e0607e', '#ef8aa6', '#f5b3c4', '#c9474f', '#fbd2dc'] : ['#f7c548', '#f08a4b', '#e0485a', '#ffffff', '#f2a7b8'];
    const bigWeeds = [];
    for (let i = 0; i < 14; i++) { const x = 40 + r() * 280, y = 80 + r() * 440; if (inside(region, x, y)) bigWeeds.push([x, y, 16 + r() * 10]); }
    return {
      family: 'weed', particle: 'weed', region, depth: true,
      tough(x, y) { for (const [wx, wy, s] of bigWeeds) if (Math.hypot(x - wx, y - wy) < s * 0.6) return 1.6; return 1; },
      decor(c) {
        lawnAround(c, r, nz, bleed);
        softShadow(c, region, 6, 0.3);
        // brick edging
        c.save(); c.strokeStyle = '#a5523d'; c.lineWidth = 11; c.setLineDash([12, 3]); c.stroke(region); c.restore();
        c.save(); c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 3; c.setLineDash([12, 3]); c.stroke(region); c.restore();
      },
      clean(c) {
        soil(c, nz, 0, 0, W, H);
        for (let i = 0; i < 900; i++) { c.fillStyle = r() < 0.5 ? 'rgba(255,230,200,0.08)' : 'rgba(0,0,0,0.18)'; c.fillRect(r() * W, r() * H, 1.5, 1.5); }
        for (const [x, y] of plants) {
          // leaves
          for (let k = 0; k < 6; k++) {
            const a = (k / 6) * 6.283 + r();
            c.fillStyle = U.pick(r, ['#3f7a2f', '#4f8a3a', '#5d9a44']);
            c.save(); c.translate(x + Math.cos(a) * 9, y + Math.sin(a) * 7); c.rotate(a);
            c.beginPath(); c.ellipse(0, 0, roses ? 7 : 10, roses ? 4.5 : 3.5, 0, 0, 7); c.fill(); c.restore();
          }
          const col = U.pick(r, cols);
          if (roses) {
            c.fillStyle = U.shade(col, -0.2); c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill();
            c.fillStyle = col; c.beginPath(); c.arc(x - 0.5, y - 0.5, 7.5, 0, 7); c.fill();
            c.strokeStyle = U.shade(col, -0.25); c.lineWidth = 1.2;
            c.beginPath(); c.arc(x, y, 4.5, 0.5, 5.2); c.stroke(); c.beginPath(); c.arc(x + 0.5, y, 2, 2, 7); c.stroke();
          } else {
            c.fillStyle = U.shade(col, -0.15);
            c.beginPath(); c.moveTo(x - 7, y - 4); c.lineTo(x - 7, y + 4); c.quadraticCurveTo(x, y + 11, x + 7, y + 4); c.lineTo(x + 7, y - 4); c.lineTo(x + 3.5, y); c.lineTo(x, y - 6); c.lineTo(x - 3.5, y); c.closePath(); c.fill();
            c.fillStyle = 'rgba(255,255,255,0.3)'; c.beginPath(); c.ellipse(x - 2.5, y + 1, 1.6, 4, 0, 0, 7); c.fill();
          }
        }
      },
      dirt(c) {
        const g = ramp(['#2f5a24', '#3d6e2c', '#4d8034', '#5f8f3c']);
        field(c, 0, 0, W, H, 3, (x, y) => g(nz.fbm(x * 0.04, y * 0.04, 4)));
        const items = [];
        for (let i = 0; i < 2600; i++) {
          const x = r() * W, y = r() * H, l = 8 + r() * 16, lean = (r() - 0.5) * 12;
          items.push({ x0: x, y0: y, cx: x + lean * 0.3, cy: y - l * 0.6, x1: x + lean, y1: y - l, col: U.pick(r, ['#3b7229', '#4d8a34', '#62a042', '#7bb553', '#8aa84a']), w: 1.6 });
        }
        strokesByColour(c, items, 1.6);
        // dandelion rosettes and thistles
        for (const [x, y, s] of bigWeeds) {
          for (let k = 0; k < 9; k++) {
            const a = (k / 9) * 6.283;
            c.fillStyle = U.pick(r, ['#4f8a3a', '#5d9a44', '#6aa04c']);
            c.save(); c.translate(x, y); c.rotate(a);
            c.beginPath(); c.moveTo(0, 0);
            for (let j = 1; j <= 4; j++) { c.lineTo(s * j / 4, (j % 2 ? -4 : -1.5)); }
            c.lineTo(s, 0); for (let j = 4; j >= 1; j--) c.lineTo(s * j / 4, (j % 2 ? 4 : 1.5));
            c.closePath(); c.fill(); c.restore();
          }
          c.fillStyle = r() < 0.6 ? '#f3cf3a' : '#b48fd8'; c.beginPath(); c.arc(x, y, 4.5, 0, 7); c.fill();
        }
        // clover patches
        for (let i = 0; i < 40; i++) {
          const x = r() * W, y = r() * H;
          for (let k = 0; k < 3; k++) { c.fillStyle = '#6fae55'; c.beginPath(); c.arc(x + Math.cos(k * 2.1) * 3, y + Math.sin(k * 2.1) * 3, 3, 0, 7); c.fill(); }
        }
      },
      stamp(c, x, y, a, t, paint, isHelper) {
        // a few soil crumbs where weeds come out
        if (Math.random() < 0.15) { c.fillStyle = 'rgba(30,20,12,0.25)'; c.beginPath(); c.arc(x + (Math.random() - 0.5) * 10, y + (Math.random() - 0.5) * 10, 1.2, 0, 7); c.fill(); }
      },
    };
  }

  // ------------------------------------------------------------------- POND
  function pond(S) {
    const { r, nz, bleed } = S;
    const region = new Path2D();
    blob(region, 180, 300, 150, 230, r, 0.1, 16);
    const pads = [];
    for (let i = 0; i < 7; i++) { const x = 60 + r() * 240, y = 100 + r() * 400; if (inside(region, x, y)) pads.push([x, y, 14 + r() * 10, r() * 6.28, r() < 0.4]); }
    const fish = [
      { col: '#f08a3c', spot: '#ffffff', ph: 0, sp: 0.23, rx: 90, ry: 150 },
      { col: '#ffffff', spot: '#e0485a', ph: 2, sp: 0.18, rx: 70, ry: 120 },
      { col: '#f2c230', spot: '#f08a3c', ph: 4, sp: 0.2, rx: 110, ry: 170 },
      { col: '#e0485a', spot: '#ffffff', ph: 1, sp: 0.15, rx: 60, ry: 90 },
    ];
    return {
      family: 'skim', particle: 'water', region, depth: true,
      tough: (x, y) => (nz.n2(x * 0.03, y * 0.03) > 0.7 ? 1.5 : 1),
      decor(c) {
        lawnAround(c, r, nz, bleed);
        softShadow(c, region, 10, 0.4);
      },
      clean(c) {
        const g = c.createRadialGradient(180, 300, 20, 180, 300, 260);
        g.addColorStop(0, '#2f7f95'); g.addColorStop(0.6, '#3f97a8'); g.addColorStop(1, '#6cbcc4');
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(${200 + r() * 40},${190 + r() * 30},${160 + r() * 30},0.22)`; c.beginPath(); c.ellipse(r() * W, r() * H, 3 + r() * 5, 2 + r() * 3, r() * 3, 0, 7); c.fill(); }
        c.strokeStyle = 'rgba(255,255,255,0.08)'; c.lineWidth = 1.5;
        for (let i = 0; i < 40; i++) { const x = r() * W, y = r() * H; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + 20, y - 10, x + 30, y + 10, x + 50, y); c.stroke(); }
      },
      live(c, t) {
        for (const f of fish) {
          const a = t * f.sp + f.ph;
          const x = 180 + Math.sin(a) * f.rx, y = 300 + Math.sin(a * 2 + f.ph) * f.ry * 0.5 + Math.cos(a * 0.7) * f.ry * 0.5;
          const dx = Math.cos(a) * f.rx, dy = Math.cos(a * 2 + f.ph) * f.ry - Math.sin(a * 0.7) * f.ry * 0.35;
          const ang = Math.atan2(dy, dx);
          c.save(); c.translate(x, y); c.rotate(ang);
          c.fillStyle = 'rgba(0,30,40,0.18)'; c.beginPath(); c.ellipse(4, 6, 15, 6, 0, 0, 7); c.fill();
          const wig = Math.sin(t * 8 + f.ph) * 0.35;
          c.fillStyle = f.col;
          c.save(); c.translate(-12, 0); c.rotate(wig); c.beginPath(); c.moveTo(0, 0); c.lineTo(-10, -6); c.lineTo(-8, 0); c.lineTo(-10, 6); c.closePath(); c.fill(); c.restore();
          c.beginPath(); c.ellipse(0, 0, 15, 6, 0, 0, 7); c.fill();
          c.fillStyle = f.spot; c.beginPath(); c.ellipse(-2, -1, 5, 3, 0.3, 0, 7); c.fill(); c.beginPath(); c.ellipse(8, 1, 3, 2, 0, 0, 7); c.fill();
          c.fillStyle = f.col; c.beginPath(); c.ellipse(2, -6, 4, 2, -0.5, 0, 7); c.fill(); c.beginPath(); c.ellipse(2, 6, 4, 2, 0.5, 0, 7); c.fill();
          c.fillStyle = '#222'; c.beginPath(); c.arc(11, -2, 1, 0, 7); c.arc(11, 2, 1, 0, 7); c.fill();
          c.restore();
        }
        // lily pads float above the fish
        for (const [x, y, s, rot, flower] of pads) {
          const bob = Math.sin(t * 0.8 + x) * 0.05;
          c.save(); c.translate(x, y); c.rotate(rot + bob);
          c.fillStyle = 'rgba(0,30,20,0.2)'; c.beginPath(); c.arc(2, 3, s, 0.25, 6.0); c.lineTo(2, 3); c.fill();
          c.fillStyle = '#5fae5a'; c.beginPath(); c.arc(0, 0, s, 0.25, 6.0); c.lineTo(0, 0); c.closePath(); c.fill();
          c.strokeStyle = '#4c9447'; c.lineWidth = 1; for (let k = 0; k < 5; k++) { const aa = 0.6 + k * 1.1; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(aa) * s * 0.9, Math.sin(aa) * s * 0.9); c.stroke(); }
          if (flower) { for (let k = 0; k < 8; k++) { const aa = (k / 8) * 6.283; c.fillStyle = k % 2 ? '#f7b6c8' : '#fbd2dc'; c.beginPath(); c.ellipse(Math.cos(aa) * 4, Math.sin(aa) * 4, 4.5, 2.2, aa, 0, 7); c.fill(); } c.fillStyle = '#f2c230'; c.beginPath(); c.arc(0, 0, 2.2, 0, 7); c.fill(); }
          c.restore();
        }
        // surface glints
        c.fillStyle = 'rgba(255,255,255,0.18)';
        for (let i = 0; i < 6; i++) { const gx = 60 + ((i * 53 + t * 9) % 240), gy = 120 + ((i * 97) % 360); c.beginPath(); c.ellipse(gx, gy, 10, 1.5, 0, 0, 7); c.fill(); }
      },
      dirt(c) {
        const g = ramp(['#4c6a24', '#5d7d2c', '#728f35', '#8aa244', '#9fae55']);
        field(c, 0, 0, W, H, 2, (x, y) => { const v = nz.fbm(x * 0.03, y * 0.03, 5); return [...g(v), 235]; });
        for (let i = 0; i < 2200; i++) { c.fillStyle = U.pick(r, ['#7cbf45', '#8fd04f', '#6aa83c', '#a3d65f']); c.beginPath(); c.arc(r() * W, r() * H, 1.4 + r() * 1.6, 0, 7); c.fill(); }
        c.strokeStyle = 'rgba(60,90,30,0.6)'; c.lineWidth = 1.2;
        for (let i = 0; i < 60; i++) { let x = r() * W, y = r() * H; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 30; y += (r() - 0.5) * 30; c.lineTo(x, y); } c.stroke(); }
        for (let i = 0; i < 14; i++) {
          c.fillStyle = U.pick(r, ['#b5762f', '#8c5a2b', '#c9a24a']);
          c.save(); c.translate(r() * W, r() * H); c.rotate(r() * 6.28); c.beginPath(); c.ellipse(0, 0, 9, 4.5, 0, 0, 7); c.fill(); c.restore();
        }
        for (let i = 0; i < 40; i++) { c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 0.8; c.beginPath(); c.arc(r() * W, r() * H, 1.5 + r() * 3, 0, 7); c.stroke(); }
      },
      top(c) {
        // stones round the edge, reeds and a frog
        const pts = [];
        const len = 70;
        for (let i = 0; i < len; i++) {
          const a = (i / len) * 6.283;
          let rr = 1.02, x, y;
          for (let k = 0; k < 30; k++) { x = 180 + Math.cos(a) * 150 * rr; y = 300 + Math.sin(a) * 230 * rr; if (!inside(region, x, y)) break; rr += 0.02; }
          pts.push([x, y]);
        }
        for (const [x, y] of pts) {
          const s = 9 + r() * 6, col = U.pick(r, ['#bdb3a3', '#cfc6b8', '#a99f90', '#d8d0c2']);
          c.fillStyle = 'rgba(30,25,20,0.3)'; c.beginPath(); c.ellipse(x + 1, y + 2.5, s, s * 0.75, 0, 0, 7); c.fill();
          c.fillStyle = col; c.beginPath(); c.ellipse(x, y, s, s * 0.75, r(), 0, 7); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.ellipse(x - s * 0.25, y - s * 0.25, s * 0.45, s * 0.3, 0, 0, 7); c.fill();
        }
        const reeds = (x0, y0) => {
          for (let k = 0; k < 9; k++) {
            const x = x0 + (r() - 0.5) * 30, h = 50 + r() * 50;
            c.strokeStyle = U.pick(r, ['#4f8a3a', '#62a042', '#3f7531']); c.lineWidth = 2.2;
            c.beginPath(); c.moveTo(x, y0); c.quadraticCurveTo(x + (r() - 0.5) * 10, y0 - h / 2, x + (r() - 0.5) * 14, y0 - h); c.stroke();
            if (k % 3 === 0) { c.fillStyle = '#7a4e33'; c.beginPath(); c.roundRect(x - 3, y0 - h * 0.7, 6, 18, 3); c.fill(); }
          }
        };
        reeds(pts[18][0], pts[18][1]); reeds(pts[44][0], pts[44][1] + 6);
        const [fx, fy] = pts[58];
        c.fillStyle = '#6aa84c'; c.beginPath(); c.ellipse(fx, fy - 5, 9, 7, 0, 0, 7); c.fill();
        c.beginPath(); c.arc(fx - 4, fy - 11, 3.4, 0, 7); c.arc(fx + 4, fy - 11, 3.4, 0, 7); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(fx - 4, fy - 11.5, 2, 0, 7); c.arc(fx + 4, fy - 11.5, 2, 0, 7); c.fill();
        c.fillStyle = '#222'; c.beginPath(); c.arc(fx - 4, fy - 11, 1, 0, 7); c.arc(fx + 4, fy - 11, 1, 0, 7); c.fill();
      },
    };
  }

  // ------------------------------------------------------------------- ROOF
  function roof(S) {
    const { r, nz, opts, bleed } = S;
    const left = opts.side !== 'right';
    const region = new Path2D();
    // slope seen face on: a big panel of tiles, chimney cut out on one side
    region.rect(0, 70, W, 470);
    const chim = left ? null : [220, 70, 80, 150];
    const skylight = left ? [70, 230, 110, 130] : null;
    if (chim) region.rect(chim[0], chim[1], chim[2], chim[3]);
    if (skylight) region.rect(skylight[0], skylight[1], skylight[2], skylight[3]);
    return {
      family: 'scrub', particle: 'moss', region, depth: true,
      tough: (x, y) => (nz.fbm(x * 0.025 + 7, y * 0.025, 3) > 0.58 ? 1.6 : 1),
      decor(c) {
        const g = c.createLinearGradient(0, bleed.y0, 0, 80);
        g.addColorStop(0, '#bfe2ef'); g.addColorStop(1, '#e9f1e6');
        c.fillStyle = g; c.fillRect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, 80 - bleed.y0);
        c.fillStyle = '#fff'; c.globalAlpha = 0.85;
        c.beginPath(); c.ellipse(60, 30, 30, 10, 0, 0, 7); c.ellipse(85, 24, 20, 12, 0, 0, 7); c.fill(); c.globalAlpha = 1;
        c.fillStyle = '#8e4430'; c.fillRect(bleed.x0, 58, bleed.x1 - bleed.x0, 16);
        c.fillStyle = '#a9553a'; for (let x = bleed.x0; x < bleed.x1; x += 24) { c.beginPath(); c.ellipse(x + 12, 60, 13, 7, 0, Math.PI, 0); c.fill(); }
        // gutter and the garden far below
        c.fillStyle = '#86a865'; c.fillRect(bleed.x0, 556, bleed.x1 - bleed.x0, bleed.y1 - 556);
        c.fillStyle = '#9aa3ad'; c.fillRect(bleed.x0, 538, bleed.x1 - bleed.x0, 18);
        c.fillStyle = '#c6ccd3'; c.fillRect(bleed.x0, 538, bleed.x1 - bleed.x0, 5);
      },
      clean(c) {
        c.fillStyle = '#9e4f36'; c.fillRect(0, 0, W, H);
        const rowH = 26, tw = 30;
        for (let row = 0, y = 64; y < 560; row++, y += rowH) {
          for (let x = -tw + (row % 2) * (tw / 2); x < W + tw; x += tw) {
            const col = U.pick(r, ['#c96f4f', '#d17a58', '#bf6646', '#cf7352', '#c46a4a']);
            c.fillStyle = 'rgba(60,20,10,0.35)'; c.beginPath(); c.roundRect(x + 1, y + 4, tw - 2, rowH + 4, [0, 0, 10, 10]); c.fill();
            c.fillStyle = col; c.beginPath(); c.roundRect(x + 1, y, tw - 2, rowH + 3, [0, 0, 10, 10]); c.fill();
            const g = c.createLinearGradient(x, y, x + tw, y);
            g.addColorStop(0, 'rgba(255,255,255,0.18)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.12)');
            c.fillStyle = g; c.beginPath(); c.roundRect(x + 1, y, tw - 2, rowH + 3, [0, 0, 10, 10]); c.fill();
          }
        }
      },
      dirt(c) {
        const g = ramp(['#4a5a28', '#5b6d2e', '#6d8236', '#7d8f40', '#8a8a52']);
        field(c, 0, 60, W, 545, 2, (x, y) => g(nz.fbm(x * 0.04, y * 0.04, 5)));
        // moss cushions, bigger where the dirt is tough
        for (let i = 0; i < 360; i++) {
          const x = r() * W, y = 70 + r() * 470;
          const big = nz.fbm(x * 0.025 + 7, y * 0.025, 3) > 0.58;
          const s = big ? 8 + r() * 9 : 4 + r() * 5;
          const base = U.pick(r, big ? ['#5f8a2e', '#6f9a36', '#7fa83e'] : ['#5c7a2e', '#6f9037', '#4b6626', '#86a646']);
          c.fillStyle = 'rgba(20,30,10,0.22)'; c.beginPath(); c.ellipse(x + s * 0.15, y + s * 0.35, s, s * 0.75, 0, 0, 7); c.fill();
          for (let k = 0; k < 10; k++) {
            const a = r() * 6.283, d = r() * s * 0.6;
            c.fillStyle = U.shade(base, (r() - 0.45) * 0.3);
            c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, s * (0.22 + r() * 0.22), 0, 7); c.fill();
          }
          c.fillStyle = 'rgba(230,245,170,0.35)';
          for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(x - s * 0.3 + r() * s * 0.4, y - s * 0.35 + r() * s * 0.3, 0.9, 0, 7); c.fill(); }
        }
        for (let i = 0; i < 60; i++) {
          const x = r() * W, y = 70 + r() * 470, s = 3 + r() * 6;
          c.fillStyle = 'rgba(215,215,160,0.8)'; c.beginPath(); c.arc(x, y, s, 0, 7); c.fill();
        }
        for (let i = 0; i < 20; i++) {
          c.fillStyle = U.pick(r, ['#b5762f', '#8c5a2b', '#c9a24a']);
          c.save(); c.translate(r() * W, 70 + r() * 470); c.rotate(r() * 6.28); c.beginPath(); c.ellipse(0, 0, 7, 3.5, 0, 0, 7); c.fill(); c.restore();
        }
      },
      top(c) {
        if (chim) {
          const [x, y, w, h] = chim;
          c.fillStyle = 'rgba(40,20,10,0.25)'; c.fillRect(x - 4, y + h - 4, w + 12, 14);
          c.fillStyle = '#b0715a'; c.fillRect(x, bleed.y0, w, y + h - bleed.y0);
          c.strokeStyle = '#9a604b'; c.lineWidth = 1.5;
          for (let yy = bleed.y0 + 6; yy < y + h; yy += 14) { c.beginPath(); c.moveTo(x, yy); c.lineTo(x + w, yy); c.stroke(); for (let xx = x + ((yy / 14 | 0) % 2) * 10; xx < x + w; xx += 20) { c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx, yy + 14); c.stroke(); } }
          c.fillStyle = '#d7d0c2'; c.fillRect(x - 8, y + h - 8, w + 16, 10);
        }
        if (skylight) {
          const [x, y, w, h] = skylight;
          c.fillStyle = '#5b4a3a'; c.beginPath(); c.roundRect(x - 6, y - 6, w + 12, h + 12, 4); c.fill();
          const g = c.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#d6eef7'); g.addColorStop(1, '#8fbfe6');
          c.fillStyle = g; c.fillRect(x, y, w, h);
          c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); c.moveTo(x + 20, y); c.lineTo(x + 50, y); c.lineTo(x + 10, y + h); c.lineTo(x, y + h); c.lineTo(x, y + 30); c.fill();
        }
      },
    };
  }

  // --------------------------------------------------------------- SHUTTERS
  function shutters(S) {
    const { r, nz, bleed } = S;
    const sh = [[22, 70, 130, 470], [208, 70, 130, 470]];
    const region = new Path2D();
    for (const [x, y, w, h] of sh) region.rect(x, y, w, h);
    return {
      family: 'paint', particle: 'paint', region,
      decor(c) {
        const g = ramp(['#d9cfbb', '#e2d9c6', '#ebe3d3']);
        field(c, bleed.x0, bleed.y0, bleed.x1, bleed.y1, 3, (x, y) => g(nz.fbm(x * 0.03, y * 0.03, 3)));
        // the window between them
        c.fillStyle = '#f1ebdd'; c.fillRect(150, 60, 60, 490);
        const gg = c.createLinearGradient(0, 70, 0, 540); gg.addColorStop(0, '#ffe4a8'); gg.addColorStop(1, '#f0a95f');
        c.fillStyle = gg; c.fillRect(158, 70, 44, 470);
        c.fillStyle = '#f1ebdd'; c.fillRect(150, 300, 60, 8);
        c.fillStyle = '#e4dccb'; c.fillRect(0, 548, W, 14);
        for (const [x, y, w, h] of sh) { const p = new Path2D(); p.rect(x, y, w, h); softShadow(c, p, 8, 0.35, 3, 4); }
      },
      clean(c, paint) { c.fillStyle = paint; c.fillRect(0, 0, W, H); },
      cleanOver(c) {
        for (const [x, y, w, h] of sh) {
          c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x, y, w, 10); c.fillRect(x, y + h - 10, w, 10); c.fillRect(x, y, 10, h); c.fillRect(x + w - 10, y, 10, h);
          c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(x + 10, y + 10, w - 20, 3);
          for (let yy = y + 18; yy < y + h - 14; yy += 14) {
            c.fillStyle = 'rgba(0,0,0,0.16)'; c.fillRect(x + 12, yy + 8, w - 24, 5);
            c.fillStyle = 'rgba(255,255,255,0.16)'; c.fillRect(x + 12, yy, w - 24, 3);
          }
          c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(x + 12, y + h / 2 - 4, w - 24, 8);
        }
      },
      dirt(c) {
        const g = ramp(['#7c7468', '#8f877a', '#a39b8d', '#b4ac9e']);
        field(c, 0, 60, W, 545, 1.5, (x, y) => g(nz.fbm(x * 0.012, y * 0.08, 4)));
        for (const [x, y, w, h] of sh) for (let yy = y + 18; yy < y + h - 14; yy += 14) { c.fillStyle = 'rgba(40,32,24,0.3)'; c.fillRect(x + 12, yy + 8, w - 24, 5); }
        for (let i = 0; i < 60; i++) {
          const x = r() * W, y = 70 + r() * 470, s = 4 + r() * 10;
          c.fillStyle = '#6f9a8a'; c.strokeStyle = 'rgba(50,45,38,0.45)'; c.lineWidth = 0.7;
          c.beginPath(); for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.283, rr = s * (0.5 + r() * 0.6); c.lineTo(x + Math.cos(a) * rr * 1.4, y + Math.sin(a) * rr); } c.closePath(); c.fill(); c.stroke();
        }
        c.fillStyle = 'rgba(70,60,45,0.25)';
        for (let i = 0; i < 18; i++) { c.beginPath(); c.ellipse(r() * W, 380 + r() * 160, 14 + r() * 20, 6 + r() * 10, 0, 0, 7); c.fill(); }
      },
      top(c) {
        for (const [x, y, w, h] of sh) {
          c.fillStyle = '#3d3d42';
          c.fillRect(x + (x < 180 ? w - 4 : -6), y + 40, 10, 8); c.fillRect(x + (x < 180 ? w - 4 : -6), y + h - 48, 10, 8);
        }
      },
      stamp: paintStamp,
    };
  }

  // ------------------------------------------------------------ ATTIC FLOOR
  function attic(S) {
    const { r, nz, bleed } = S;
    const region = new Path2D();
    region.rect(0, 150, W, 420);
    return {
      family: 'dust', particle: 'dust', region,
      tough: (x, y) => (x < 30 || x > 330 || y > 540 ? 1.5 : 1),
      decor(c) {
        // sloped ceiling and beams
        c.fillStyle = '#6b4a33'; c.fillRect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, 160 - bleed.y0);
        c.fillStyle = '#7d5a3e';
        for (let x = bleed.x0 - 40; x < bleed.x1; x += 70) { c.beginPath(); c.moveTo(x, bleed.y0); c.lineTo(x + 34, bleed.y0); c.lineTo(x + 60, 160); c.lineTo(x + 26, 160); c.closePath(); c.fill(); }
        c.fillStyle = '#5b3d29'; c.fillRect(bleed.x0, 140, bleed.x1 - bleed.x0, 20);
        // round window
        c.fillStyle = '#efe6d4'; c.beginPath(); c.arc(180, 70, 46, 0, 7); c.fill();
        const g = c.createRadialGradient(180, 70, 4, 180, 70, 40); g.addColorStop(0, '#fff6d8'); g.addColorStop(1, '#bfe2ef');
        c.fillStyle = g; c.beginPath(); c.arc(180, 70, 38, 0, 7); c.fill();
        c.strokeStyle = '#efe6d4'; c.lineWidth = 5; c.beginPath(); c.moveTo(142, 70); c.lineTo(218, 70); c.moveTo(180, 32); c.lineTo(180, 108); c.stroke();
        c.fillStyle = '#5a4030'; c.fillRect(bleed.x0, 570, bleed.x1 - bleed.x0, bleed.y1 - 570);
      },
      clean(c) {
        const pw = 40;
        for (let x = 0; x < W; x += pw) {
          const base = U.pick(r, ['#b98654', '#c6935f', '#ad7b4b', '#c08b58']);
          c.fillStyle = base; c.fillRect(x, 150, pw, 420);
          for (let k = 0; k < 14; k++) { c.strokeStyle = 'rgba(90,55,30,0.18)'; c.lineWidth = 0.8; const gx = x + 3 + r() * (pw - 6); c.beginPath(); c.moveTo(gx, 150); c.bezierCurveTo(gx + 3, 250, gx - 3, 400, gx + 1, 570); c.stroke(); }
          c.fillStyle = 'rgba(60,35,20,0.45)'; c.fillRect(x + pw - 2, 150, 2, 420);
          let y = 150 + r() * 200;
          c.fillStyle = 'rgba(60,35,20,0.45)'; c.fillRect(x, y, pw, 2);
          c.fillStyle = '#5a4030'; c.beginPath(); c.arc(x + 6, y + 8, 1.6, 0, 7); c.arc(x + pw - 8, y + 8, 1.6, 0, 7); c.fill();
        }
        // a round braided rug
        for (let k = 9; k >= 0; k--) { c.fillStyle = ['#c9474f', '#f2d88a', '#3d5a86', '#efb4ae', '#9cc5a1'][k % 5]; c.beginPath(); c.ellipse(180, 380, 40 + k * 9, 26 + k * 6, 0, 0, 7); c.fill(); }
        // an old trunk and a rocking horse
        c.fillStyle = 'rgba(40,25,15,0.3)'; c.beginPath(); c.roundRect(30, 236, 110, 70, 8); c.fill();
        c.fillStyle = '#4e7b8a'; c.beginPath(); c.roundRect(24, 220, 110, 74, 8); c.fill();
        c.fillStyle = '#3d6372'; c.fillRect(24, 244, 110, 6);
        c.fillStyle = '#c9a24a'; c.fillRect(44, 220, 8, 74); c.fillRect(106, 220, 8, 74); c.beginPath(); c.roundRect(72, 246, 14, 16, 3); c.fill();
        c.fillStyle = '#8a5a3c'; c.beginPath(); c.ellipse(268, 300, 50, 10, 0, 0, Math.PI); c.fill();
        c.fillStyle = '#f2ead8'; c.beginPath(); c.ellipse(268, 262, 32, 16, 0, 0, 7); c.fill();
        c.beginPath(); c.ellipse(298, 240, 12, 16, -0.4, 0, 7); c.fill();
        c.fillStyle = '#c9474f'; c.fillRect(256, 250, 20, 8);
        c.strokeStyle = '#8a5a3c'; c.lineWidth = 4; c.beginPath(); c.moveTo(250, 274); c.lineTo(242, 298); c.moveTo(286, 274); c.lineTo(294, 298); c.stroke();
        c.fillStyle = '#6b4a33'; c.beginPath(); c.moveTo(300, 226); c.quadraticCurveTo(312, 236, 306, 252); c.lineTo(296, 238); c.fill();
        // a box of photos and a teddy
        c.fillStyle = '#d9b98a'; c.fillRect(60, 470, 80, 56); c.fillStyle = '#c9a676'; c.fillRect(60, 470, 80, 10);
        c.fillStyle = '#fff'; c.save(); c.translate(100, 470); c.rotate(-0.2); c.fillRect(-14, -16, 28, 20); c.restore();
        c.fillStyle = '#b07a4a'; c.beginPath(); c.arc(280, 488, 22, 0, 7); c.arc(280, 456, 15, 0, 7); c.arc(268, 444, 6, 0, 7); c.arc(292, 444, 6, 0, 7); c.fill();
        c.fillStyle = '#222'; c.beginPath(); c.arc(275, 454, 1.8, 0, 7); c.arc(285, 454, 1.8, 0, 7); c.fill();
      },
      liveTop(c, t) {
        // a beam of light from the round window, dust motes drifting in it
        c.save();
        c.globalCompositeOperation = 'lighter';
        const g = c.createLinearGradient(180, 70, 220, 470);
        g.addColorStop(0, 'rgba(255,240,200,0.22)'); g.addColorStop(1, 'rgba(255,240,200,0)');
        c.fillStyle = g; c.beginPath(); c.moveTo(150, 80); c.lineTo(210, 80); c.lineTo(330, 520); c.lineTo(170, 520); c.closePath(); c.fill();
        for (let i = 0; i < 26; i++) {
          const ph = i * 1.7, x = 175 + ((i * 37) % 120) + Math.sin(t * 0.3 + ph) * 12 + ((t * 4 + i * 13) % 60);
          const y = 120 + ((i * 59 + t * 6) % 380);
          c.fillStyle = `rgba(255,248,220,${0.25 + 0.25 * Math.sin(t + ph)})`; c.beginPath(); c.arc(x, y, 1.2, 0, 7); c.fill();
        }
        c.restore();
      },
      dirt(c) {
        const g = ramp(['#9d958a', '#aea79c', '#bfb9ae', '#cbc5ba']);
        field(c, 0, 150, W, 570, 2, (x, y) => { const v = nz.fbm(x * 0.03, y * 0.03, 5); return [...g(v), 252]; });
        // dust bunnies
        for (let i = 0; i < 26; i++) {
          const x = r() * W, y = 160 + r() * 400, s = 6 + r() * 10;
          for (let k = 0; k < 10; k++) { c.fillStyle = `rgba(${150 + r() * 40},${145 + r() * 40},${140 + r() * 40},0.7)`; c.beginPath(); c.arc(x + (r() - 0.5) * s, y + (r() - 0.5) * s * 0.7, s * 0.4, 0, 7); c.fill(); }
        }
        // cat paw prints across the dust
        c.fillStyle = 'rgba(120,100,80,0.35)';
        for (let i = 0; i < 12; i++) {
          const x = 40 + i * 26 + (i % 2) * 8, y = 520 - i * 30 - (i % 2) * 10;
          c.beginPath(); c.ellipse(x, y, 4, 3.4, 0, 0, 7); c.fill();
          for (let k = -1; k <= 1; k++) { c.beginPath(); c.arc(x + k * 3.4, y - 4.5 - Math.abs(k) * -1, 1.4, 0, 7); c.fill(); }
        }
        // cobwebs in the corners
        for (const [cx, cy, a0] of [[0, 150, 0], [W, 150, Math.PI / 2]]) {
          c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 0.7;
          for (let k = 0; k < 6; k++) { const a = a0 + (k / 5) * (Math.PI / 2); c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * 80, cy + Math.sin(a) * 80); c.stroke(); }
          for (let ring = 14; ring < 80; ring += 13) { c.beginPath(); for (let k = 0; k <= 5; k++) { const a = a0 + (k / 5) * (Math.PI / 2); c.lineTo(cx + Math.cos(a) * ring, cy + Math.sin(a) * ring); } c.stroke(); }
        }
      },
    };
  }

  // ----------------------------------------------------- ATTIC ROUND WINDOW
  // From inside, looking out over the garden.
  function roundWindow(S) {
    const { r, nz, bleed } = S;
    const cx = 180, cy = 300, R = 160, bar = 12;
    const region = new Path2D();
    region.moveTo(cx + R, cy); region.arc(cx, cy, R, 0, Math.PI * 2);
    region.rect(cx - bar / 2, cy - R + 2, bar, R * 2 - 4); region.rect(cx - R + 2, cy - bar / 2, R - bar / 2 - 2, bar); region.rect(cx + bar / 2, cy - bar / 2, R - bar / 2 - 2, bar);
    return {
      family: 'wash', particle: 'suds', region,
      tough: (x, y) => (Math.hypot(x - cx, y - cy) > R - 16 ? 1.4 : 1),
      decor(c) {
        const g = ramp(['#7d5a3e', '#8a6446', '#96704f']);
        field(c, bleed.x0, bleed.y0, bleed.x1, bleed.y1, 3, (x, y) => g(nz.fbm(x * 0.01, y * 0.05, 3)));
        c.strokeStyle = 'rgba(60,35,20,0.4)'; c.lineWidth = 2;
        for (let y = bleed.y0; y < bleed.y1; y += 28) { c.beginPath(); c.moveTo(bleed.x0, y); c.lineTo(bleed.x1, y); c.stroke(); }
        const p = new Path2D(); p.arc(cx, cy, R + 22, 0, 7); softShadow(c, p, 16, 0.5);
      },
      clean(c) {
        const sky = c.createLinearGradient(0, cy - R, 0, cy + R);
        sky.addColorStop(0, '#9fd3ea'); sky.addColorStop(0.55, '#e3f1ea'); sky.addColorStop(1, '#f6ead2');
        c.fillStyle = sky; c.fillRect(0, 0, W, H);
        c.fillStyle = '#fff3c4'; c.beginPath(); c.arc(250, 200, 22, 0, 7); c.fill();
        c.fillStyle = '#ffffff'; c.globalAlpha = 0.9; c.beginPath(); c.ellipse(110, 210, 34, 12, 0, 0, 7); c.ellipse(134, 202, 22, 14, 0, 0, 7); c.fill(); c.globalAlpha = 1;
        c.fillStyle = '#b6d2ad'; c.beginPath(); c.moveTo(0, 330); c.quadraticCurveTo(120, 290, 220, 318); c.quadraticCurveTo(300, 300, 360, 320); c.lineTo(360, 600); c.lineTo(0, 600); c.fill();
        c.fillStyle = '#93c46c'; c.beginPath(); c.moveTo(0, 370); c.quadraticCurveTo(160, 340, 360, 365); c.lineTo(360, 600); c.lineTo(0, 600); c.fill();
        for (let x = 0; x < W; x += 28) { c.fillStyle = (x / 28) % 2 ? '#8cc566' : '#9fd276'; c.fillRect(x, 400, 28, 200); }
        c.fillStyle = '#ddd3c0'; c.beginPath(); c.moveTo(165, 400); c.lineTo(195, 400); c.lineTo(230, 600); c.lineTo(130, 600); c.fill();
        c.fillStyle = '#f4ecdc'; for (let x = 0; x < W; x += 12) if (x < 120 || x > 240) c.fillRect(x, 440, 7, 26);
        c.fillStyle = '#4f803c'; c.beginPath(); c.arc(60, 330, 40, 0, 7); c.arc(30, 350, 28, 0, 7); c.fill();
        c.fillStyle = '#3f8ea6'; c.beginPath(); c.ellipse(285, 420, 34, 12, 0, 0, 7); c.fill();
        c.strokeStyle = '#4a4a50'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(100, 250); c.quadraticCurveTo(105, 245, 110, 250); c.quadraticCurveTo(115, 245, 120, 250); c.stroke();
      },
      cleanOver(c) {
        c.save(); c.globalCompositeOperation = 'lighter';
        c.fillStyle = 'rgba(255,255,255,0.13)'; c.beginPath(); c.moveTo(cx - 40, cy - R); c.lineTo(cx + 10, cy - R); c.lineTo(cx - 120, cy + R); c.lineTo(cx - 170, cy + R); c.fill();
        c.restore();
      },
      dirt(c) {
        const g = ramp(['#8a8170', '#9d9482', '#aaa18e', '#b8af9b']);
        field(c, cx - R, cy - R, cx + R, cy + R, 2, (x, y) => [...g(nz.fbm(x * 0.025, y * 0.025, 5)), 248]);
        for (let i = 0; i < 70; i++) { const a = r() * 6.283, d = r() * R; c.strokeStyle = 'rgba(240,235,220,0.45)'; c.lineWidth = 0.8; c.beginPath(); c.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2 + r() * 5, 0, 7); c.stroke(); }
        for (let i = 0; i < 800; i++) { c.fillStyle = 'rgba(90,75,50,0.3)'; c.fillRect(cx - R + r() * R * 2, cy - R + r() * R * 2, 1.2, 1.2); }
        c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 0.7;
        for (let k = 0; k < 9; k++) { const a = (k / 9) * 6.283; c.beginPath(); c.moveTo(cx + 70, cy + 60); c.lineTo(cx + 70 + Math.cos(a) * 60, cy + 60 + Math.sin(a) * 60); c.stroke(); }
        for (let ring = 10; ring < 60; ring += 10) { c.beginPath(); c.arc(cx + 70, cy + 60, ring, 0, 7); c.stroke(); }
      },
      top(c) {
        c.lineWidth = 22; c.strokeStyle = '#efe6d4'; c.beginPath(); c.arc(cx, cy, R + 11, 0, 7); c.stroke();
        c.lineWidth = 2; c.strokeStyle = '#cfc4ad'; c.beginPath(); c.arc(cx, cy, R + 22, 0, 7); c.stroke(); c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke();
        c.fillStyle = '#efe6d4'; c.fillRect(cx - bar / 2, cy - R, bar, R * 2); c.fillRect(cx - R, cy - bar / 2, R * 2, bar);
        c.fillStyle = '#d9b35a'; c.beginPath(); c.arc(cx + R - 20, cy + 20, 5, 0, 7); c.fill();
      },
    };
  }

  Object.assign(SCENES.KINDS, { bed, pond, roof, shutters, attic, roundWindow });
})();
