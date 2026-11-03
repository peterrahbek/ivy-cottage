'use strict';
// Scene painters. Every chore is a scene kind plus options. A scene returns
// the layers the engine composites, all in board units (360 x 600):
//   region       Path2D (evenodd) of everything that is dirty
//   decor(c)     background, may paint outside the board (bleed)
//   clean(c)     what is revealed under the dirt
//   cleanOver(c) optional static overlay drawn above the clean layer
//   dirt(c)      the mess, clipped to region by the engine
//   top(c)       optional overlay above the dirt (frames, handles)
//   tough(x,y)   optional, how stubborn the dirt is at a point (1 = normal)
//   stamp(...)   optional, paints the clean layer as the tool passes
//   live(c,t)    optional, animated things between clean and dirt (fish)

const SCENES = (() => {
  const W = 360, H = 600;

  // Paint a low-resolution colour field and scale it up smoothly.
  function field(c, x0, y0, x1, y1, step, fn) {
    const w = Math.ceil((x1 - x0) / step), h = Math.ceil((y1 - y0) / step);
    const cv = U.canvas(w, h), cx = cv.getContext('2d');
    const img = cx.createImageData(w, h), d = img.data;
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const o = (j * w + i) * 4;
        const col = fn(x0 + (i + 0.5) * step, y0 + (j + 0.5) * step);
        d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = col.length > 3 ? col[3] : 255;
      }
    }
    cx.putImageData(img, 0, 0);
    c.save();
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.drawImage(cv, x0, y0, w * step, h * step);
    c.restore();
  }

  // Colour ramp from a list of hex stops, t in 0..1 -> [r,g,b]
  function ramp(stops) {
    const rgb = stops.map(U.hex);
    return (t) => {
      t = U.clamp(t, 0, 0.9999) * (rgb.length - 1);
      const i = Math.floor(t), f = t - i, a = rgb[i], b = rgb[i + 1];
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
    };
  }

  function rrPath(p, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r);
    p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath();
  }
  function blob(p, cx, cy, rx, ry, r, wob = 0.12, n = 14) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, k = 1 + (r() - 0.5) * 2 * wob;
      pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      if (i === 0) { const z = pts[n - 1]; p.moveTo((z[0] + a[0]) / 2, (z[1] + a[1]) / 2); }
      p.quadraticCurveTo(a[0], a[1], m[0], m[1]);
    }
    p.closePath();
  }

  // Point-in-region test in board units (needs an untransformed context).
  const hitCx = U.canvas(1, 1).getContext('2d');
  const inside = (path, x, y) => hitCx.isPointInPath(path, x, y, 'evenodd');
  function nearRegion(path, x, y, m) {
    return inside(path, x, y) || inside(path, x + m, y) || inside(path, x - m, y) || inside(path, x, y + m) || inside(path, x, y - m);
  }

  // Many short strokes grouped by colour so they render in a few calls.
  function strokesByColour(c, items, width) {
    const groups = new Map();
    for (const it of items) { if (!groups.has(it.col)) groups.set(it.col, []); groups.get(it.col).push(it); }
    c.lineCap = 'round';
    for (const [col, arr] of groups) {
      c.strokeStyle = col; c.lineWidth = arr[0].w || width;
      c.beginPath();
      for (const b of arr) { c.moveTo(b.x0, b.y0); c.quadraticCurveTo(b.cx, b.cy, b.x1, b.y1); }
      c.stroke();
    }
  }

  // ------------------------------------------------------------------ grass
  const GRASS = { base: '#8cc566', light: '#a6d679', dark: '#77b556' };

  function mowedLawn(c, nz, x0, y0, x1, y1, stripes) {
    const g = ramp(['#5f9e43', '#74b252', '#86c262']);
    field(c, x0, y0, x1, y1, 3, (x, y) => {
      let t = 0.35 + nz.fbm(x * 0.03, y * 0.03, 3) * 0.4;
      if (stripes) t += (Math.floor((x - x0) / 40) % 2 ? 0.18 : -0.12);
      return g(t);
    });
  }
  function grassGrain(c, r, x0, y0, x1, y1, density, alpha) {
    const items = [];
    const n = ((x1 - x0) * (y1 - y0)) / density;
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), l = 2 + r() * 3, lean = (r() - 0.5) * 2;
      items.push({ x0: x, y0: y, cx: x + lean * 0.5, cy: y - l * 0.6, x1: x + lean, y1: y - l, col: r() < 0.5 ? `rgba(30,70,20,${alpha})` : `rgba(220,255,180,${alpha * 0.8})`, w: 0.8 });
    }
    strokesByColour(c, items, 0.8);
  }
  function tallGrass(c, r, nz, region, x0, y0, x1, y1) {
    const base = ramp(['#3f7a2f', '#548f3a', '#6aa448', '#7fae4e']);
    field(c, x0, y0, x1, y1, 3, (x, y) => base(0.2 + nz.fbm(x * 0.02 + 9, y * 0.02, 4) * 0.8));
    const cols = ['#3b7229', '#4d8a34', '#62a042', '#7bb553', '#94c562', '#a8c463', '#b9c96b'];
    const items = [];
    const n = ((x1 - x0) * (y1 - y0)) / 7;
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0);
      const l = 7 + r() * 9, lean = (r() - 0.5) * 9 + (nz.n2(x * 0.02, y * 0.02) - 0.5) * 10;
      const shadeT = U.clamp(nz.fbm(x * 0.02 + 9, y * 0.02, 3) + (r() - 0.5) * 0.5, 0, 0.999);
      items.push({ x0: x, y0: y, cx: x + lean * 0.2, cy: y - l * 0.7, x1: x + lean, y1: y - l, col: cols[(shadeT * cols.length) | 0], w: 1.3 + r() * 0.6, y });
    }
    items.sort((a, b) => a.y - b.y);
    // draw in a few depth bands so nearer blades overlap farther ones
    const bands = 6;
    for (let b = 0; b < bands; b++) {
      const lo = y0 + ((y1 - y0) * b) / bands, hi = y0 + ((y1 - y0) * (b + 1)) / bands;
      strokesByColour(c, items.filter((it) => it.y >= lo && it.y < hi), 1.5);
    }
    // wild flowers
    for (let i = 0; i < n / 260; i++) {
      const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0);
      if (!inside(region, x, y)) continue;
      if (r() < 0.55) { // dandelion
        c.fillStyle = '#e9b81f'; c.beginPath(); c.arc(x, y, 2.8, 0, 7); c.fill();
        c.fillStyle = '#fbe05a'; c.beginPath(); c.arc(x - 0.5, y - 0.5, 1.9, 0, 7); c.fill();
      } else if (r() < 0.6) { // daisy
        c.fillStyle = '#ffffff';
        for (let k = 0; k < 7; k++) { const a = (k / 7) * 6.283; c.beginPath(); c.ellipse(x + Math.cos(a) * 2.2, y + Math.sin(a) * 2.2, 1.6, 0.9, a, 0, 7); c.fill(); }
        c.fillStyle = '#f2c230'; c.beginPath(); c.arc(x, y, 1.3, 0, 7); c.fill();
      } else { // clover
        c.fillStyle = '#d9a6c9'; c.beginPath(); c.arc(x, y, 2.3, 0, 7); c.fill();
        c.fillStyle = '#ecc7df'; c.beginPath(); c.arc(x - 0.6, y - 0.6, 1.3, 0, 7); c.fill();
      }
    }
  }

  function mulch(c, nz, x0, y0, x1, y1) {
    const m = ramp(['#5a3f2c', '#6e4e35', '#86623f', '#9a7650']);
    field(c, x0, y0, x1, y1, 2, (x, y) => m(nz.fbm(x * 0.08, y * 0.08, 3) * 0.7 + nz.n2(x * 0.6, y * 0.6) * 0.3));
  }

  function shrub(c, r, x, y, s, col = '#4f8a3c') {
    for (let i = 0; i < 9; i++) {
      const a = r() * 6.283, d = r() * s * 0.5;
      c.fillStyle = U.shade(col, (r() - 0.6) * 0.35);
      c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.7, s * (0.35 + r() * 0.25), 0, 7); c.fill();
    }
    c.fillStyle = U.rgba('#ffffff', 0.12); c.beginPath(); c.arc(x - s * 0.2, y - s * 0.25, s * 0.3, 0, 7); c.fill();
  }
  function flowerClump(c, r, x, y, col) {
    c.fillStyle = '#4c8a3a';
    for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(x + (r() - 0.5) * 14, y + (r() - 0.5) * 8, 4, 2, r() * 3, 0, 7); c.fill(); }
    for (let i = 0; i < 6; i++) {
      const fx = x + (r() - 0.5) * 16, fy = y + (r() - 0.5) * 10 - 3;
      c.fillStyle = U.shade(col, (r() - 0.5) * 0.3); c.beginPath(); c.arc(fx, fy, 2.6, 0, 7); c.fill();
      c.fillStyle = '#fff6'; c.beginPath(); c.arc(fx - 0.7, fy - 0.7, 1, 0, 7); c.fill();
    }
  }
  // Shadow only: the shape itself is drawn far off-canvas and its shadow is
  // offset back into place (shadow offsets ignore the transform).
  function softShadow(c, path, blur, alpha, dx = 0, dy = 3) {
    const k = c.getTransform().a, FAR = 4000;
    c.save();
    c.shadowColor = `rgba(40,30,20,${alpha})`; c.shadowBlur = blur * k;
    c.shadowOffsetX = (FAR + dx) * k; c.shadowOffsetY = dy * k;
    c.translate(-FAR, 0);
    c.fillStyle = '#000'; c.fill(path, 'evenodd');
    c.restore();
  }

  // ------------------------------------------------------------------- LAWN
  function lawn(S) {
    const { r, nz, opts, bleed } = S;
    const region = new Path2D();
    const holes = [];
    let tree = null, stones = [];
    if (opts.shape === 'patch') {
      blob(region, 180, 300, 118, 128, r, 0.06, 16);
    } else if (opts.shape === 'tree') {
      rrPath(region, 22, 60, 316, 480, 46);
      tree = { x: 112, y: 210, r: 20 };
      holes.push((p) => { p.moveTo(tree.x + tree.r, tree.y); p.arc(tree.x, tree.y, tree.r, 0, Math.PI * 2, true); });
    } else {
      rrPath(region, 22, 50, 316, 500, 30);
      for (let i = 0; i < 6; i++) stones.push({ x: 90 + i * 34 + (r() - 0.5) * 14, y: 520 - i * 82 + (r() - 0.5) * 16, rx: 19 + r() * 4, ry: 13 + r() * 3, rot: (r() - 0.5) * 0.6 });
      stones = stones.filter((s) => s.y > 70);
      for (const s of stones) holes.push((p) => { p.moveTo(s.x + s.rx, s.y); p.ellipse(s.x, s.y, s.rx, s.ry, s.rot, 0, Math.PI * 2, true); });
    }
    for (const h of holes) h(region);

    return {
      family: 'mow', particle: 'grass', region, depth: true,
      decor(c) {
        mulch(c, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1);
        // shrubs and flowers wherever there is no lawn
        const spots = [];
        for (let i = 0; i < 400 && spots.length < 34; i++) {
          const x = bleed.x0 + r() * (bleed.x1 - bleed.x0), y = bleed.y0 + r() * (bleed.y1 - bleed.y0);
          if (nearRegion(region, x, y, 26)) continue;
          if (spots.some((p) => Math.hypot(p[0] - x, p[1] - y) < 34)) continue;
          spots.push([x, y]);
        }
        spots.sort((a, b) => a[1] - b[1]);
        for (const [x, y] of spots) {
          if (r() < 0.55) shrub(c, r, x, y, 24 + r() * 16, U.pick(r, ['#4f8a3c', '#5d9644', '#467e37', '#6b8f3a']));
          else flowerClump(c, r, x, y, U.pick(r, ['#e98aa2', '#f2c230', '#b48fd8', '#ffffff', '#f08a5d']));
        }
        // stone edging
        c.save();
        softShadow(c, region, 10, 0.45);
        c.strokeStyle = '#cfc6b4'; c.lineWidth = 7; c.stroke(region);
        c.strokeStyle = '#e8e0cf'; c.lineWidth = 3; c.stroke(region);
        c.restore();
        for (const s of stones) {
          c.save(); c.translate(s.x, s.y); c.rotate(s.rot);
          c.fillStyle = '#9d968a'; c.beginPath(); c.ellipse(0, 1.5, s.rx, s.ry, 0, 0, 7); c.fill();
          c.fillStyle = '#c9c2b4'; c.beginPath(); c.ellipse(0, 0, s.rx, s.ry, 0, 0, 7); c.fill();
          c.fillStyle = '#ddd6c8'; c.beginPath(); c.ellipse(-s.rx * 0.25, -s.ry * 0.3, s.rx * 0.5, s.ry * 0.4, 0, 0, 7); c.fill();
          c.restore();
        }
      },
      clean(c) {
        c.fillStyle = GRASS.base; c.fillRect(0, 0, W, H);
      },
      cleanOver(c) { grassGrain(c, r, 0, 0, W, H, 3.2, 0.3); },
      dirt(c) { tallGrass(c, r, nz, region, 0, 0, W, H); },
      top(c) {
        if (!tree) return;
        c.fillStyle = 'rgba(30,50,20,0.22)';
        c.beginPath(); c.ellipse(tree.x + 22, tree.y + 18, 92, 70, 0, 0, 7); c.fill();
        c.fillStyle = '#6b4a32'; c.beginPath(); c.arc(tree.x, tree.y, tree.r, 0, 7); c.fill();
        c.fillStyle = '#7d5a3e'; c.beginPath(); c.arc(tree.x - 3, tree.y - 3, tree.r - 5, 0, 7); c.fill();
        c.strokeStyle = '#5f4029'; c.lineWidth = 1;
        for (let i = 1; i < 4; i++) { c.beginPath(); c.arc(tree.x - 3, tree.y - 3, (tree.r - 5) * i / 4, 0, 7); c.stroke(); }
      },
      stamp(c, x, y, a, tier) {
        const t = 0.5 - 0.5 * Math.sin(a);
        c.fillStyle = U.mix(GRASS.dark, GRASS.light, t);
        if (tier.shape === 'rect') {
          c.save(); c.translate(x, y); c.rotate(a); c.fillRect(-tier.h / 2 - 1, -tier.w / 2, tier.h + 2, tier.w); c.restore();
        } else { c.beginPath(); c.arc(x, y, tier.r, 0, 7); c.fill(); }
      },
    };
  }

  // ----------------------------------------------------------------- STONES
  // round the café terrace: cobbles, the café front above, the kerb below
  function terraceSurround(c, r, nz, bleed) {
    c.fillStyle = '#7d776d'; c.fillRect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, bleed.y1 - bleed.y0);
    for (let row = 0, y = bleed.y0; y < bleed.y1; y += 12, row++) {
      for (let x = bleed.x0 - (row % 2 ? 7 : 0); x < bleed.x1; x += 14) {
        c.fillStyle = U.shade(U.pick(r, ['#a49d92', '#9a9489', '#b0a99d', '#928c82']), (nz.n2(x * 0.05, y * 0.05) - 0.5) * 0.2);
        c.beginPath(); c.roundRect(x + 1, y + 1, 12, 10, 3.5); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(x + 3, y + 2, 7, 2);
      }
    }
    // the café front: a green panelled plinth with a stone step at the door
    c.fillStyle = '#2f4f45'; c.fillRect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, 40 - bleed.y0);
    c.fillStyle = '#3e6457';
    for (let x = 8; x < 340; x += 58) c.fillRect(x, bleed.y0, 48, 32 - bleed.y0);
    c.fillStyle = '#1f3630'; c.fillRect(bleed.x0, 34, bleed.x1 - bleed.x0, 6);
    c.fillStyle = '#c9c1b2'; c.fillRect(140, 30, 80, 18); c.fillStyle = '#a99f8f'; c.fillRect(140, 44, 80, 4);
    // the kerb
    c.fillStyle = '#c4beb2'; c.fillRect(bleed.x0, 590, bleed.x1 - bleed.x0, 10);
    c.fillStyle = '#9d978b'; c.fillRect(bleed.x0, 598, bleed.x1 - bleed.x0, 3);
  }

  // round the pottery's cobbled yard: the brick barn above with clay bins
  // against it, a grass verge on the lane below
  function yardSurround(c, r, nz, bleed) {
    c.fillStyle = '#8a7c6b'; c.fillRect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, bleed.y1 - bleed.y0);
    for (let row = 0, y = bleed.y0; y < bleed.y1; y += 13, row++) {
      for (let x = bleed.x0 - (row % 2 ? 8 : 0); x < bleed.x1; x += 16) {
        c.fillStyle = U.shade(U.pick(r, ['#b3a593', '#a69886', '#bfb19e', '#9c8f7f']), (nz.n2(x * 0.05, y * 0.05) - 0.5) * 0.2);
        c.beginPath(); c.roundRect(x + 1, y + 1, 14, 11, 5); c.fill();
      }
    }
    // the barn wall: old red brick on a stone plinth
    c.fillStyle = '#8e4a34'; c.fillRect(bleed.x0, bleed.y0, bleed.x1 - bleed.x0, 62 - bleed.y0);
    for (let row = 0, y = 60; y > bleed.y0 - 10; y -= 9, row++) {
      for (let x = bleed.x0 - (row % 2 ? 11 : 0); x < bleed.x1; x += 22) {
        c.fillStyle = U.shade(U.pick(r, ['#b5623f', '#a85a3c', '#c06b46', '#9e5137', '#b86a4a']), (r() - 0.5) * 0.12);
        c.fillRect(x + 1, y - 8, 20, 7.5);
      }
    }
    c.fillStyle = '#b8ad9c'; c.fillRect(bleed.x0, 60, bleed.x1 - bleed.x0, 12);
    c.fillStyle = '#d2c8b7'; c.fillRect(bleed.x0, 60, bleed.x1 - bleed.x0, 3);
    c.fillStyle = 'rgba(40,25,15,0.25)'; c.fillRect(bleed.x0, 72, bleed.x1 - bleed.x0, 5);
    // clay bins with lids, a sack of clay and a stack of pots against the wall
    const bin = (x, y, rad, lid) => {
      c.fillStyle = 'rgba(40,30,20,0.3)'; c.beginPath(); c.ellipse(x + 3, y + 4, rad, rad * 0.9, 0, 0, 7); c.fill();
      c.fillStyle = '#8f969c'; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill();
      c.fillStyle = lid; c.beginPath(); c.arc(x, y, rad - 3, 0, 7); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y, rad - 6, 3.6, 5.4); c.stroke();
      c.fillStyle = '#5d6469'; c.fillRect(x - 6, y - 2, 12, 4);
    };
    bin(38, 89, 16, '#a7aeb3'); bin(76, 92, 13, '#9aa2a8');
    c.fillStyle = 'rgba(40,30,20,0.3)'; c.beginPath(); c.ellipse(114, 94, 15, 9, 0.2, 0, 7); c.fill();
    c.fillStyle = '#c9b48f'; c.beginPath(); c.ellipse(112, 90, 14, 10, 0.2, 0, 7); c.fill();
    c.fillStyle = '#b39b74'; c.fillRect(104, 82, 6, 4);
    c.fillStyle = '#7a8a9a'; c.font = '700 6px ui-rounded, system-ui, sans-serif'; c.textAlign = 'center'; c.fillText('CLAY', 113, 93);
    for (const [x, y, rad] of [[292, 90, 13], [300, 84, 11], [292, 80, 9]]) {
      c.fillStyle = 'rgba(40,30,20,0.25)'; c.beginPath(); c.arc(x + 2, y + 3, rad, 0, 7); c.fill();
      c.fillStyle = '#c4714a'; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill();
      c.fillStyle = '#7a3f28'; c.beginPath(); c.arc(x, y, rad - 3, 0, 7); c.fill();
    }
    bin(328, 90, 14, '#a7aeb3');
    // the grass verge along the lane
    mowedLawn(c, nz, bleed.x0, 572, bleed.x1, bleed.y1, false);
    grassGrain(c, r, bleed.x0, 572, bleed.x1, bleed.y1, 6, 0.25);
    c.fillStyle = '#c9c0b0'; c.fillRect(bleed.x0, 570, bleed.x1 - bleed.x0, 6);
  }
  // round the station platform: the track on one side, the waiting room on the other
  function platformSurround(c, r, nz, bleed) {
    const ballast = ramp(['#7e7769', '#8f887a', '#a09a8c', '#b2ab9c']);
    field(c, bleed.x0, bleed.y0, 118, bleed.y1, 2, (x, y) => ballast(nz.fbm(x * 0.09, y * 0.09, 3) * 0.6 + nz.n2(x * 0.7, y * 0.7) * 0.4));
    for (let i = 0; i < 900; i++) {
      const x = bleed.x0 + r() * (118 - bleed.x0), y = bleed.y0 + r() * (bleed.y1 - bleed.y0);
      c.fillStyle = U.pick(r, ['rgba(60,55,48,0.35)', 'rgba(230,226,215,0.35)', 'rgba(120,100,80,0.3)']);
      c.beginPath(); c.arc(x, y, 0.8 + r() * 1.6, 0, 7); c.fill();
    }
    // sleepers and the two rails, rusty on the sides and bright on top
    for (let y = bleed.y0 - 20; y < bleed.y1; y += 40) {
      c.fillStyle = 'rgba(30,25,20,0.3)'; c.fillRect(2, y + 3, 102, 16);
      c.fillStyle = U.pick(r, ['#6e5a45', '#7a6550', '#665240']); c.fillRect(0, y, 102, 15);
      c.fillStyle = 'rgba(255,255,255,0.1)'; c.fillRect(0, y + 1, 102, 3);
      c.strokeStyle = 'rgba(40,30,20,0.35)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(6, y + 8); c.lineTo(96, y + 9); c.stroke();
      for (const x of [26, 80]) { c.fillStyle = '#4a4440'; c.fillRect(x - 8, y + 2, 16, 11); }
    }
    for (const x of [26, 80]) {
      c.fillStyle = 'rgba(30,25,20,0.35)'; c.fillRect(x - 3, bleed.y0, 9, bleed.y1 - bleed.y0);
      c.fillStyle = '#7b5a43'; c.fillRect(x - 4, bleed.y0, 8, bleed.y1 - bleed.y0);
      c.fillStyle = '#b9bcc0'; c.fillRect(x - 2.2, bleed.y0, 4.4, bleed.y1 - bleed.y0);
      c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(x - 1, bleed.y0, 1.4, bleed.y1 - bleed.y0);
    }
    // a few weeds in the ballast
    for (let i = 0; i < 14; i++) {
      const x = 4 + r() * 100, y = bleed.y0 + r() * (bleed.y1 - bleed.y0);
      c.strokeStyle = U.pick(r, ['#5c7a2e', '#6f9037', '#86a646']); c.lineWidth = 1.4; c.lineCap = 'round';
      for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (r() - 0.5) * 1.8; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 7, y + Math.sin(a) * 7); c.stroke(); }
    }
    // the face of the platform, in shadow below the coping
    c.fillStyle = '#6d6458'; c.fillRect(104, bleed.y0, 14, bleed.y1 - bleed.y0);
    c.fillStyle = 'rgba(20,15,10,0.35)'; c.fillRect(104, bleed.y0, 5, bleed.y1 - bleed.y0);
    // the waiting room's boarded wall on the far side
    c.fillStyle = '#efe4cc'; c.fillRect(352, bleed.y0, bleed.x1 - 352, bleed.y1 - bleed.y0);
    c.fillStyle = '#7d2a34'; c.fillRect(352, bleed.y0, 6, bleed.y1 - bleed.y0);
    c.fillStyle = 'rgba(80,60,40,0.18)'; for (let y = bleed.y0; y < bleed.y1; y += 18) c.fillRect(358, y, bleed.x1 - 358, 1.5);
  }

  function stonesScene(S) {
    const { r, nz, opts, bleed } = S;
    const region = new Path2D();
    const pavers = [];
    let gapPath = null;
    if (opts.shape === 'yard') {
      // the pottery's yard: rounded cobbles in rows, a drain in the middle
      rrPath(region, 14, 104, 332, 466, 18);
      for (let y = 104, row = 0; y < 570; row++) {
        const h = 24 + r() * 6;
        for (let x = 14 - (row % 2 ? 15 : 0); x < 346;) {
          const w = 27 + r() * 10;
          pavers.push({ x: x + 2, y: y + 2, w: w - 4, h: Math.min(h, 570 - y) - 4 });
          x += w;
        }
        y += h;
      }
    } else if (opts.shape === 'platform') {
      // a station platform: coping stones along the edge, big flags behind
      region.rect(116, -10, 236, 620);
      for (let y = -10; y < 610; y += 58) pavers.push({ x: 117, y: y + 1, w: 28, h: 56 });
      for (let y = -10, row = 0; y < 610; row++) {
        const h = 64 + r() * 18;
        for (let x = 148 - (row % 2 ? 46 : 0); x < 352;) {
          const w = 74 + r() * 34;
          const x0 = Math.max(148, x);
          pavers.push({ x: x0 + 2, y: y + 2, w: Math.min(x + w, 352) - x0 - 4, h: h - 4 });
          x += w;
        }
        y += h;
      }
    } else if (opts.shape === 'stepping') {
      for (let i = 0; i < 7; i++) {
        const x = 180 + Math.sin(i * 0.9) * 80 + (r() - 0.5) * 20, y = 540 - i * 78;
        const s = { x, y, rx: 40 + r() * 8, ry: 30 + r() * 6, rot: (r() - 0.5) * 0.5 };
        pavers.push(s);
        region.moveTo(x + s.rx, y); region.ellipse(x, y, s.rx, s.ry, s.rot, 0, Math.PI * 2);
      }
    } else if (opts.shape === 'terrace') {
      // a café terrace of big flags laid in staggered rows
      rrPath(region, 12, 52, 336, 532, 10);
      for (let y = 52, row = 0; y < 584; row++) {
        const h = 52 + r() * 14;
        for (let x = 12 - (row % 2 ? 34 : 0); x < 348;) {
          const w = 62 + r() * 30;
          pavers.push({ x: x + 2.5, y: y + 2.5, w: w - 5, h: h - 5 });
          x += w;
        }
        y += h;
      }
    } else {
      // a gently winding path of rectangular flags
      const cx = (y) => 180 + Math.sin(y * 0.008 + 0.6) * 46;
      const half = 78;
      region.moveTo(cx(-10) - half, -10);
      for (let y = -10; y <= 610; y += 20) region.lineTo(cx(y) - half, y);
      for (let y = 610; y >= -10; y -= 20) region.lineTo(cx(y) + half, y);
      region.closePath();
      gapPath = new Path2D();
      let y = 600;
      let row = 0;
      while (y > -20) {
        const h = 46 + r() * 22;
        let x = cx(y - h / 2) - half - (row % 2 ? 26 : 0);
        while (x < cx(y - h / 2) + half) {
          const w = 54 + r() * 40;
          pavers.push({ x: x + 2.5, y: y - h + 2.5, w: w - 5, h: h - 5 });
          x += w;
        }
        y -= h; row++;
      }
    }
    const stoneCols = ['#cfc6b8', '#bdb3a3', '#d8d0c2', '#c4b8a5', '#b9b1a6', '#d2c3ad'];
    return {
      family: 'scrub', particle: 'moss', region, depth: true,
      tough(x, y) {
        if (opts.shape === 'stepping') return 1;
        for (const p of pavers) if (x > p.x && x < p.x + p.w && y > p.y && y < p.y + p.h) return 1;
        return 1.5;
      },
      decor(c) {
        if (opts.shape === 'terrace') terraceSurround(c, r, nz, bleed);
        else if (opts.shape === 'yard') yardSurround(c, r, nz, bleed);
        else if (opts.shape === 'platform') platformSurround(c, r, nz, bleed);
        else {
          mowedLawn(c, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1, true);
          grassGrain(c, r, bleed.x0, bleed.y0, bleed.x1, bleed.y1, 6, 0.2);
        }
        softShadow(c, region, 8, 0.35);
      },
      clean(c) {
        c.fillStyle = '#b8a888'; c.fillRect(0, 0, W, H);
        field(c, 0, 0, W, H, 2, (x, y) => { const v = nz.fbm(x * 0.2, y * 0.2, 2); return [150 + v * 40, 138 + v * 36, 110 + v * 30]; });
        if (opts.shape === 'stepping') {
          for (const s of pavers) {
            c.save(); c.translate(s.x, s.y); c.rotate(s.rot);
            const col = U.pick(r, stoneCols);
            c.fillStyle = U.shade(col, -0.25); c.beginPath(); c.ellipse(0, 2, s.rx, s.ry, 0, 0, 7); c.fill();
            c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, s.rx - 1, s.ry - 1, 0, 0, 7); c.fill();
            c.fillStyle = U.shade(col, 0.25); c.beginPath(); c.ellipse(-s.rx * 0.2, -s.ry * 0.25, s.rx * 0.6, s.ry * 0.45, 0, 0, 7); c.fill();
            c.restore();
          }
        } else if (opts.shape === 'yard') {
          // domed cobbles, warm grey with the odd terracotta one
          for (const p of pavers) {
            const col = U.pick(r, ['#b9ab98', '#a89a87', '#c4b7a3', '#9d9283', '#b3a28c', '#cbbca6', '#b88f73']);
            c.fillStyle = U.shade(col, -0.32); c.beginPath(); c.roundRect(p.x, p.y + 1.8, p.w, p.h, 10); c.fill();
            c.fillStyle = col; c.beginPath(); c.roundRect(p.x, p.y, p.w, p.h - 1, 10); c.fill();
            const g = c.createRadialGradient(p.x + p.w * 0.38, p.y + p.h * 0.32, 1, p.x + p.w / 2, p.y + p.h / 2, p.w * 0.7);
            g.addColorStop(0, 'rgba(255,255,255,0.32)'); g.addColorStop(0.6, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.12)');
            c.fillStyle = g; c.beginPath(); c.roundRect(p.x, p.y, p.w, p.h - 1, 10); c.fill();
          }
          // the iron drain in the middle of the yard
          const dx = 232, dy = 338;
          c.fillStyle = 'rgba(40,30,20,0.35)'; c.beginPath(); c.arc(dx + 1.5, dy + 2.5, 25, 0, 7); c.fill();
          c.fillStyle = '#9c9282'; c.beginPath(); c.arc(dx, dy, 25, 0, 7); c.fill();
          c.fillStyle = '#4d4a47'; c.beginPath(); c.arc(dx, dy, 19, 0, 7); c.fill();
          c.fillStyle = '#26221f';
          for (let k = -3; k <= 3; k++) { c.beginPath(); c.roundRect(dx - Math.sqrt(256 - k * k * 20) * 0.95, dy + k * 4.6 - 1.4, Math.sqrt(256 - k * k * 20) * 1.9, 2.8, 1.4); c.fill(); }
          c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 1.2; c.beginPath(); c.arc(dx, dy, 19, 3.5, 5.2); c.stroke();
        } else {
          const cols = opts.shape === 'platform' ? ['#d4cdbf', '#c9c1b2', '#ddd6c9', '#c2baab', '#d8cfbd'] : stoneCols;
          for (const p of pavers) {
            const col = U.pick(r, cols);
            c.fillStyle = U.shade(col, -0.28); c.beginPath(); c.roundRect(p.x, p.y + 1.5, p.w, p.h, 5); c.fill();
            c.fillStyle = col; c.beginPath(); c.roundRect(p.x, p.y, p.w, p.h - 1, 5); c.fill();
            const g = c.createLinearGradient(p.x, p.y, p.x + p.w, p.y + p.h);
            g.addColorStop(0, 'rgba(255,255,255,0.28)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.08)');
            c.fillStyle = g; c.beginPath(); c.roundRect(p.x, p.y, p.w, p.h - 1, 5); c.fill();
          }
          if (opts.shape === 'platform') {
            // the white line along the platform edge, a little worn
            c.fillStyle = '#f6f3ea'; c.fillRect(128, -10, 12, 620);
            for (let i = 0; i < 70; i++) { c.fillStyle = 'rgba(190,180,165,0.5)'; c.fillRect(128 + r() * 10, -10 + r() * 620, 1 + r() * 3, 1 + r() * 2); }
            c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(138.5, -10, 1.5, 620);
          }
        }
        // speckle
        for (let i = 0; i < 2600; i++) {
          c.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.12)';
          c.fillRect(r() * W, r() * H, 1 + r(), 1 + r());
        }
      },
      dirt(c) {
        const moss = ramp(['#3f5626', '#55702f', '#6d8a38', '#86a046', '#8d8a52', '#6f6440']);
        field(c, 0, 0, W, H, 2, (x, y) => {
          const v = nz.fbm(x * 0.035, y * 0.035, 5), m = nz.n2(x * 0.15 + 50, y * 0.15);
          return moss(U.clamp(v * 0.9 + m * 0.25, 0, 1));
        });
        // moss cushions
        for (let i = 0; i < 900; i++) {
          const x = r() * W, y = r() * H, s = 2 + r() * 5;
          c.fillStyle = U.pick(r, ['#5c7a2e', '#6f9037', '#4b6626', '#86a646', '#9bb354']);
          c.beginPath(); c.arc(x, y, s, 0, 7); c.fill();
          c.fillStyle = 'rgba(255,255,230,0.18)'; c.beginPath(); c.arc(x - s * 0.3, y - s * 0.3, s * 0.45, 0, 7); c.fill();
        }
        // lichen rings
        for (let i = 0; i < 70; i++) {
          const x = r() * W, y = r() * H, s = 3 + r() * 7;
          c.fillStyle = 'rgba(205,210,150,0.75)'; c.beginPath(); c.arc(x, y, s, 0, 7); c.fill();
          c.strokeStyle = 'rgba(170,175,110,0.9)'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, s * 0.6, 0, 7); c.stroke();
        }
        // mud and fallen bits
        for (let i = 0; i < 40; i++) {
          c.fillStyle = 'rgba(95,72,45,0.55)'; c.beginPath(); c.ellipse(r() * W, r() * H, 6 + r() * 14, 4 + r() * 7, r() * 3, 0, 7); c.fill();
        }
        for (let i = 0; i < 30; i++) {
          c.fillStyle = U.pick(r, ['#b5762f', '#8c5a2b', '#c9a24a']);
          c.save(); c.translate(r() * W, r() * H); c.rotate(r() * 6.28);
          c.beginPath(); c.ellipse(0, 0, 5, 2.4, 0, 0, 7); c.fill(); c.restore();
        }
        if (opts.shape === 'yard') {
          // clay everywhere: smears, crumbs and a trail of clay boot prints
          for (let i = 0; i < 44; i++) {
            const x = 20 + r() * 320, y = 110 + r() * 450, s = 10 + r() * 18, a = r() * 3;
            c.fillStyle = U.pick(r, ['rgba(168,98,68,0.75)', 'rgba(150,120,100,0.7)', 'rgba(186,120,86,0.7)', 'rgba(130,112,98,0.65)']);
            c.beginPath(); c.ellipse(x, y, s, s * 0.55, a, 0, 7); c.fill();
            c.strokeStyle = 'rgba(205,160,130,0.5)'; c.lineWidth = 1.2;
            c.beginPath(); c.moveTo(x - Math.cos(a) * s * 0.8, y - Math.sin(a) * s * 0.8); c.lineTo(x + Math.cos(a) * s * 0.9, y + Math.sin(a) * s * 0.9); c.stroke();
          }
          for (let i = 0; i < 90; i++) { c.fillStyle = U.pick(r, ['#b0694a', '#c47e5a', '#8f6a54']); c.beginPath(); c.arc(20 + r() * 320, 110 + r() * 450, 1.2 + r() * 2.2, 0, 7); c.fill(); }
          c.fillStyle = 'rgba(140,82,58,0.5)';
          for (let i = 0; i < 9; i++) {
            const x = 70 + i * 26 + (i % 2) * 14, y = 540 - i * 48;
            c.save(); c.translate(x, y); c.rotate(0.45);
            c.beginPath(); c.ellipse(0, -5, 5, 7, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(0, 8, 4, 4.5, 0, 0, 7); c.fill();
            c.restore();
          }
        } else if (opts.shape === 'platform') {
          // old tickets and weeds in the joints
          for (let i = 0; i < 9; i++) {
            c.save(); c.translate(150 + r() * 190, 20 + r() * 560); c.rotate((r() - 0.5) * 1.6);
            c.fillStyle = 'rgba(40,30,20,0.25)'; c.fillRect(-9, -5, 19, 11);
            c.fillStyle = U.pick(r, ['#efe3c4', '#e9d7a6', '#dcc6a0']); c.fillRect(-10, -6, 19, 11);
            c.fillStyle = 'rgba(125,42,52,0.6)'; c.fillRect(-8, -3, 15, 1.4); c.fillRect(-8, 0, 10, 1.2);
            c.restore();
          }
          for (let i = 0; i < 16; i++) {
            const x = 150 + r() * 195, y = r() * 600;
            for (let k = 0; k < 7; k++) {
              const a = r() * 6.28;
              c.fillStyle = U.pick(r, ['#5d8a33', '#6f9a3a', '#86ad48']);
              c.beginPath(); c.ellipse(x + Math.cos(a) * 4, y + Math.sin(a) * 3, 5, 2, a, 0, 7); c.fill();
            }
            if (r() < 0.5) { c.fillStyle = '#efc22a'; c.beginPath(); c.arc(x, y, 2.6, 0, 7); c.fill(); }
          }
        }
      },
    };
  }

  const KINDS = { lawn, stones: stonesScene };

  function build(kind, opts, seed, bleed) {
    const S = { W, H, r: U.rng(seed), nz: U.noise(seed * 7 + 3), opts: opts || {}, bleed };
    const sc = KINDS[kind](S);
    return opts && opts.dirt && SCENES.overlay ? SCENES.overlay(sc, opts.dirt, S) : sc;
  }

  // shared helpers for later scene files
  return { W, H, KINDS, build, inside, nearRegion, field, ramp, rrPath, blob, strokesByColour, grassGrain, tallGrass, mowedLawn, mulch, shrub, flowerClump, softShadow, GRASS };
})();
