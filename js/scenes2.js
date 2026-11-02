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

  // ------------------------------------------------------------------ FENCE
  function fence(S) {
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
    const panes = [[gx0, gy0, mx - m / 2, my - m / 2], [mx + m / 2, gy0, gx1, my - m / 2], [gx0, my + m / 2, mx - m / 2, gy1], [mx + m / 2, my + m / 2, gx1, gy1]];
    const region = new Path2D();
    for (const [a, b, c2, d] of panes) region.rect(a, b, c2 - a, d - b);
    const room = ROOM[opts.room] || ROOM.living;
    return {
      family: 'wash', particle: 'suds', region,
      tough(x, y) {
        for (const [a, b, c2, d] of panes) if (x >= a && x <= c2 && y >= b && y <= d) return Math.min(x - a, c2 - x, y - b, d - y) < 14 ? 1.4 : 1;
        return 1;
      },
      decor(c) {
        if (opts.wallColor) {
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
        const frame = '#f1ebdd', dk = '#cfc6b3';
        c.fillStyle = frame;
        c.beginPath(); c.rect(fx0, fy0, fx1 - fx0, fy1 - fy0); c.rect(gx1, gy0, gx0 - gx1, gy1 - gy0); c.fill('evenodd');
        c.fillRect(mx - m / 2, gy0, m, gy1 - gy0); c.fillRect(gx0, my - m / 2, gx1 - gx0, m);
        c.fillStyle = 'rgba(0,0,0,0.1)'; c.fillRect(gx0, gy0, gx1 - gx0, 4); c.fillRect(gx0, gy0, 4, gy1 - gy0);
        c.strokeStyle = dk; c.lineWidth = 1.2; c.strokeRect(fx0 + 0.5, fy0 + 0.5, fx1 - fx0 - 1, fy1 - fy0 - 1);
        // chips in the old paint
        for (let i = 0; i < (opts.wallColor ? 0 : 26); i++) {
          const side = r() * 4 | 0;
          const x = side < 2 ? fx0 + r() * (fx1 - fx0) : (side === 2 ? fx0 + r() * t : fx1 - r() * t);
          const y = side < 2 ? (side === 0 ? fy0 + r() * t : fy1 - r() * t) : fy0 + r() * (fy1 - fy0);
          c.fillStyle = '#b8a58a'; c.beginPath(); c.ellipse(x, y, 1.5 + r() * 3, 1 + r() * 2, r() * 3, 0, 7); c.fill();
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

  // ------------------------------------------------------------------- DOOR
  function door(S) {
    const { r, nz, opts, bleed } = S;
    const x0 = 80, x1 = 280, yTop = 150, y1 = 540, cx = 180, R = 100;
    const fan = 66;
    // the café door has a big glass pane and a push handle instead
    const cafe = !!opts.cafe, glass = [104, 186, 152, 140], bar = [234, 350, 10, 84];
    const region = new Path2D();
    region.moveTo(x0, y1); region.lineTo(x0, yTop); region.arc(cx, yTop, R, Math.PI, 0); region.lineTo(x1, y1); region.closePath();
    // fanlight, knob and letterbox are holes
    region.moveTo(cx - fan, yTop); region.arc(cx, yTop, fan, Math.PI, 0); region.closePath();
    if (cafe) { region.rect(...glass); region.rect(...bar); }
    else { region.moveTo(252, 360); region.arc(244, 360, 8, 0, Math.PI * 2); region.rect(150, 300, 60, 14); }
    const panels = cafe ? [[100, 350, 64, 160], [196, 350, 64, 160]] : [[100, 190, 64, 120], [196, 190, 64, 120], [100, 340, 64, 170], [196, 340, 64, 170]];
    return {
      family: 'paint', particle: 'paint', region,
      tough: (x, y) => (y > 480 ? 1.35 : 1),
      decor(c) {
        // stone surround and a brick doorstep
        if (opts.wallColor) paintedPlaster(c, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1, opts.wallColor);
        else oldPlaster(c, r, nz, bleed.x0, bleed.y0, bleed.x1, bleed.y1, ['#c4b79d', '#d1c5ad', '#dcd2be', '#e2d9c7']);
        c.fillStyle = '#efe7d8';
        c.beginPath(); c.moveTo(x0 - 22, y1); c.lineTo(x0 - 22, yTop); c.arc(cx, yTop, R + 22, Math.PI, 0); c.lineTo(x1 + 22, y1); c.closePath(); c.fill();
        c.fillStyle = '#5b4a3a';
        c.beginPath(); c.moveTo(x0 - 4, y1); c.lineTo(x0 - 4, yTop); c.arc(cx, yTop, R + 4, Math.PI, 0); c.lineTo(x1 + 4, y1); c.closePath(); c.fill();
        // fanlight glass with a sunburst
        const g = c.createLinearGradient(0, yTop - fan, 0, yTop);
        g.addColorStop(0, '#ffe2a6'); g.addColorStop(1, '#f2b46a');
        c.fillStyle = g; c.beginPath(); c.moveTo(cx - fan, yTop); c.arc(cx, yTop, fan, Math.PI, 0); c.closePath(); c.fill();
        c.strokeStyle = '#efe7d8'; c.lineWidth = 3;
        for (let k = 0; k <= 6; k++) { const a = Math.PI + (k / 6) * Math.PI; c.beginPath(); c.moveTo(cx, yTop); c.lineTo(cx + Math.cos(a) * fan, yTop + Math.sin(a) * fan); c.stroke(); }
        c.beginPath(); c.arc(cx, yTop, 16, Math.PI, 0); c.stroke();
        // step
        c.fillStyle = '#b28b6d'; c.fillRect(bleed.x0, y1, bleed.x1 - bleed.x0, bleed.y1 - y1);
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
  Object.assign(SCENES, { paintStamp, peelingPaint, grime, weatheredWood });
})();
