'use strict';
// Jobs that are more than wiping, for the café and the animal rescue: cups
// to pour, napkin holders to fill, terrace tables to put out, a seal pup and
// the kennel dogs to feed, an overgrown dog walk, a matted cat to brush and
// fresh straw for the rabbits. Most are made of pieces like the drinks
// fridge; the seal's fish are picked up and fly off like beach litter.

(() => {
  const { W, H, field, ramp, softShadow, nearRegion, inside, mowedLawn, grassGrain, shrub, flowerClump, strokesByColour } = SCENES;
  const dot = (c, x, y, rad, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill(); };
  const rect = (c, x, y, w, h, rad) => { c.beginPath(); c.roundRect(x, y, w, h, rad); };
  const circle = (p, x, y, rad) => { p.moveTo(x + rad, y); p.arc(x, y, rad, 0, Math.PI * 2); };
  // a piece popping in: a little overshoot, then it settles
  const pop = (k) => (k >= 1 ? 1 : Math.max(0, U.easeBack(Math.min(1, k))));
  const FONT = 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif';

  // warm boards running across, with seams, board ends and a little grain
  function boards(c, r, nz, x0, y0, x1, y1, h, cols) {
    const g = ramp(cols);
    field(c, x0, y0, x1, y1, 2, (x, y) => g(U.clamp(nz.fbm(x * 0.006 + Math.floor(y / h) * 3.7, y * 0.06, 4) * 0.9 + nz.n2(x * 0.05, y * 0.4) * 0.1, 0, 1)));
    for (let row = Math.floor(y0 / h); row * h < y1; row++) {
      const y = row * h;
      c.fillStyle = 'rgba(60,35,15,0.35)'; c.fillRect(x0, y, x1 - x0, 1.5);
      c.fillStyle = 'rgba(255,240,210,0.14)'; c.fillRect(x0, y + 1.5, x1 - x0, 1);
      for (let x = x0 + (((row * 83) % 150) + 150) % 150; x < x1; x += 150 + (((row % 3) + 3) % 3) * 26) { c.fillStyle = 'rgba(60,35,15,0.3)'; c.fillRect(x, y, 1.4, h); }
    }
    c.strokeStyle = 'rgba(70,40,18,0.16)'; c.lineWidth = 0.8;
    const n = ((x1 - x0) * (y1 - y0)) / 700;
    for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), l = 16 + r() * 50; c.beginPath(); c.moveTo(x, y); c.lineTo(x + l, y + (r() - 0.5) * 1.2); c.stroke(); }
  }
  function heart(c, x, y, s, col) {
    c.fillStyle = col; c.beginPath(); c.moveTo(x, y + s * 0.9);
    c.bezierCurveTo(x - s * 1.6, y - s * 0.1, x - s * 0.7, y - s * 1.3, x, y - s * 0.4);
    c.bezierCurveTo(x + s * 0.7, y - s * 1.3, x + s * 1.6, y - s * 0.1, x, y + s * 0.9);
    c.fill();
  }
  function twinkle(c, x, y, s, col) {
    c.fillStyle = col; c.beginPath();
    c.moveTo(x, y - s * 2); c.lineTo(x + s * 0.45, y - s * 0.45); c.lineTo(x + s * 2, y); c.lineTo(x + s * 0.45, y + s * 0.45);
    c.lineTo(x, y + s * 2); c.lineTo(x - s * 0.45, y + s * 0.45); c.lineTo(x - s * 2, y); c.lineTo(x - s * 0.45, y - s * 0.45); c.closePath(); c.fill();
  }
  // a little paw print, toes pointing along a
  function paw(c, x, y, a, s, col) {
    c.save(); c.translate(x, y); c.rotate(a + Math.PI / 2); c.fillStyle = col;
    c.beginPath(); c.ellipse(0, s * 0.35, s * 0.62, s * 0.5, 0, 0, 7); c.fill();
    for (const [dx, dy] of [[-0.62, -0.25], [-0.22, -0.62], [0.22, -0.62], [0.62, -0.25]]) { c.beginPath(); c.ellipse(dx * s, dy * s, s * 0.22, s * 0.27, 0, 0, 7); c.fill(); }
    c.restore();
  }

  // ---------------------------------------------------------------- COFFEE
  // Cups on saucers along the café counter, seen from above, under the edge
  // of the espresso machine. Pouring fills a cup with dark coffee; a full
  // cup gets its milk and a bit of latte art, and steams a little.
  const DRINKS = {
    coffee: { pour: ['#3b2213', '#583219', '#9c6a3c'], full: ['#b88656', '#93603a', '#c99766'] },
    cocoa: { pour: ['#3e2216', '#5a3322', '#7a4a33'], full: ['#7a4a35', '#5e3626', '#8c5a42'] },
    iced: { pour: ['#5b3a22', '#7a4f2e', '#a0703f'], full: ['#d3a57a', '#b8865a', '#e2c19e'] },
    tea: { pour: ['#6b3410', '#8a4a1a', '#b06a2a'], full: ['#cf9450', '#ad6c30', '#dfa866'] },
  };
  function drinkDisc(c, x, y, R, cols) {
    const g = c.createRadialGradient(x - R * 0.25, y - R * 0.25, 1, x, y, R);
    g.addColorStop(0, cols[0]); g.addColorStop(0.72, cols[1]); g.addColorStop(1, cols[2]);
    c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, 7); c.fill();
  }
  function latteArt(c, kind, R) {
    c.fillStyle = '#f7ecdc'; c.strokeStyle = '#f7ecdc'; c.lineCap = 'round';
    if (kind === 0) { // a heart
      c.beginPath(); c.moveTo(0, R * 0.5);
      c.bezierCurveTo(-R * 0.9, -R * 0.05, -R * 0.42, -R * 0.72, 0, -R * 0.26);
      c.bezierCurveTo(R * 0.42, -R * 0.72, R * 0.9, -R * 0.05, 0, R * 0.5);
      c.fill();
    } else if (kind === 1) { // a leaf: the rosetta
      for (let i = 0; i < 6; i++) { const y = -R * 0.52 + i * R * 0.19, w = R * (0.2 + i * 0.085); c.beginPath(); c.ellipse(0, y, w, R * 0.075, 0, 0, 7); c.fill(); }
      c.lineWidth = R * 0.07; c.beginPath(); c.moveTo(0, -R * 0.66); c.lineTo(0, R * 0.62); c.stroke();
    } else { // a tulip of three stacked hearts
      for (let i = 0; i < 3; i++) { const s = R * (0.34 - i * 0.05), y = R * (0.3 - i * 0.3); c.beginPath(); c.ellipse(0, y, s * 1.35, s, 0, Math.PI, 0); c.fill(); }
      c.lineWidth = R * 0.08; c.beginPath(); c.moveTo(0, R * 0.32); c.lineTo(0, R * 0.62); c.stroke();
    }
  }
  function drawCup(c, u, k) {
    const R = u.r, s = pop(k);
    c.save(); c.translate(u.x, u.y);
    c.save(); c.beginPath(); c.arc(0, 0, R, 0, 7); c.clip();
    drinkDisc(c, 0, 0, R, DRINKS[u.drink].full);
    // a ring of milk spreading out as it settles
    if (k < 1) { c.strokeStyle = `rgba(255,248,235,${0.7 * (1 - k)})`; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, R * (0.3 + 0.7 * Math.max(0, k)), 0, 7); c.stroke(); }
    c.rotate(u.rot); c.scale(s, s);
    const rr = U.rng(u.seed);
    if (u.drink === 'coffee') latteArt(c, u.art, R);
    else if (u.drink === 'cocoa') {
      // whipped cream, marshmallows and a dusting of cocoa
      for (let i = 0; i < 7; i++) { const a = (i / 7) * 6.283; dot(c, Math.cos(a) * R * 0.3, Math.sin(a) * R * 0.3, R * 0.3, '#f6efe3'); }
      dot(c, 0, 0, R * 0.32, '#ffffff'); dot(c, -R * 0.08, -R * 0.1, R * 0.14, '#fffdf8');
      for (let i = 0; i < 5; i++) {
        const a = rr() * 6.283, d = R * (0.5 + rr() * 0.28);
        c.save(); c.translate(Math.cos(a) * d, Math.sin(a) * d); c.rotate(rr() * 3);
        c.fillStyle = rr() < 0.5 ? '#f7c6d4' : '#fffaf2'; rect(c, -3.4, -3.4, 6.8, 6.8, 2.2); c.fill(); c.restore();
      }
      for (let i = 0; i < 16; i++) dot(c, (rr() - 0.5) * R * 0.9, (rr() - 0.5) * R * 0.9, 0.7, 'rgba(90,50,30,0.6)');
    } else if (u.drink === 'tea') {
      // amber tea with a curl of milk turning in it
      c.strokeStyle = 'rgba(255,246,232,0.72)'; c.lineWidth = 2.2; c.lineCap = 'round';
      c.beginPath();
      for (let k = 0; k <= 40; k++) { const a = k * 0.3, d = R * (0.08 + k * 0.014); if (k) c.lineTo(Math.cos(a) * d, Math.sin(a) * d); else c.moveTo(Math.cos(a) * d, Math.sin(a) * d); }
      c.stroke();
      c.fillStyle = 'rgba(255,250,240,0.5)'; c.beginPath(); c.ellipse(-R * 0.35, -R * 0.42, R * 0.18, R * 0.07, -0.5, 0, 7); c.fill();
    } else {
      // iced coffee: a swirl of milk and a few ice cubes
      c.strokeStyle = 'rgba(255,245,230,0.75)'; c.lineWidth = 2.4; c.beginPath(); c.arc(0, 0, R * 0.42, 0.4, 4.6); c.stroke();
      for (let i = 0; i < 4; i++) {
        const a = i * 1.57 + rr() * 0.6, d = R * 0.46;
        c.save(); c.translate(Math.cos(a) * d, Math.sin(a) * d); c.rotate(rr() * 1.5);
        c.fillStyle = 'rgba(232,245,252,0.78)'; rect(c, -6, -6, 12, 12, 3); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.9)'; rect(c, -4.4, -4.4, 5, 3, 1.5); c.fill(); c.restore();
      }
    }
    c.restore();
    if (u.drink === 'iced') {
      // a striped paper straw leaning out of the glass
      c.scale(s, s); c.rotate(-0.75);
      c.fillStyle = '#ffffff'; rect(c, -2.6, -R * 1.55, 5.2, R * 1.55, 2); c.fill();
      c.fillStyle = '#e2574c'; for (let y = -R * 1.55 + 2; y < -3; y += 7) c.fillRect(-2.6, y, 5.2, 3);
    }
    c.restore();
  }
  function coffee(S) {
    const { r, nz, opts, bleed } = S;
    const drink = DRINKS[opts.drink] ? opts.drink : 'coffee', iced = drink === 'iced';
    const R = 23, units = [], region = new Path2D();
    for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
      const x = 72 + i * 108 + (j % 2 ? 8 : -8), y = 226 + j * 112;
      units.push({ shape: 'circle', x, y, r: R, drink, art: (r() * 3) | 0, rot: (r() - 0.5) * 0.7, seed: (r() * 1e9) | 0, ring: r() < 0.5 });
      circle(region, x, y, R);
    }
    return {
      family: 'brew', particle: 'dust', region, depth: false, indoor: true,
      unitKind: 'clink', unitParticle: 'shine', unitThreshold: 0.4, unitDur: 0.45,
      units: opts.dirt ? [] : units, drawUnit: drawCup,
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        boards(c, r, nz, x0, y0, x1, y1, 34, ['#8a5a36', '#9c6a40', '#ad7a4c', '#bb8858']);
        // the espresso machine along the top: steel, a drip tray, two group heads
        const mg = c.createLinearGradient(0, y0, 0, 150);
        mg.addColorStop(0, '#9aa2aa'); mg.addColorStop(0.75, '#dde2e6'); mg.addColorStop(1, '#b4bbc2');
        c.fillStyle = mg; c.fillRect(x0, y0, x1 - x0, 150 - y0);
        c.fillStyle = 'rgba(40,40,45,0.28)'; c.fillRect(x0, 150, x1 - x0, 7);
        c.fillStyle = '#5b6168'; rect(c, 40, 116, 280, 28, 6); c.fill();
        c.fillStyle = '#353a40'; for (let x = 48; x < 314; x += 9) c.fillRect(x, 121, 4, 18);
        for (const gx of [116, 244]) {
          dot(c, gx, 92, 20, '#4a4f55'); dot(c, gx, 92, 15, '#2c3035'); dot(c, gx - 5, 87, 5, 'rgba(255,255,255,0.22)');
          c.fillStyle = '#1f1d1c'; rect(c, gx - 6, 100, 12, 34, 6); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.18)'; rect(c, gx - 4, 104, 3, 26, 1.5); c.fill();
        }
        dot(c, 180, 90, 5.5, '#e2574c'); dot(c, 179, 89, 2.2, '#ffb3a8');
        c.strokeStyle = '#c9ced4'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(304, 70); c.lineTo(322, 126); c.stroke();
        c.strokeStyle = '#8f969e'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(305, 72); c.lineTo(321, 122); c.stroke();
        // saucers (or cork coasters under the glasses), with a spoon beside each
        for (const u of units) {
          const sp = new Path2D(); sp.arc(u.x, u.y, iced ? 33 : 38, 0, 7);
          softShadow(c, sp, 8, 0.35, 2, 4);
          if (iced) {
            dot(c, u.x, u.y, 33, '#c79c6a');
            for (let i = 0; i < 40; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * 30; dot(c, u.x + Math.cos(a) * d, u.y + Math.sin(a) * d, 0.9, 'rgba(110,70,35,0.35)'); }
          } else {
            dot(c, u.x, u.y, 38, '#e6e0d5'); dot(c, u.x, u.y, 36, '#fbf9f4');
            c.strokeStyle = 'rgba(190,180,165,0.6)'; c.lineWidth = 1.2; c.beginPath(); c.arc(u.x, u.y, 30, 0, 7); c.stroke();
          }
          c.save(); c.translate(u.x - 4, u.y + (iced ? 30 : 33)); c.rotate(-0.15);
          c.fillStyle = '#c3c9cf'; rect(c, -16, -1.6, 22, 3.2, 1.6); c.fill();
          c.beginPath(); c.ellipse(10, 0, 6, 4, 0, 0, 7); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.ellipse(9, -1, 3, 1.4, 0, 0, 7); c.fill();
          c.restore();
        }
        // a sugar bowl, a milk jug and a croissant waiting at the end of the counter
        dot(c, 62, 548, 20, 'rgba(40,25,10,0.25)'); dot(c, 60, 545, 19, '#f4ecdc'); dot(c, 60, 545, 14, '#ffffff');
        for (let i = 0; i < 6; i++) { c.fillStyle = '#fbfaf6'; rect(c, 50 + (i % 3) * 7, 538 + Math.floor(i / 3) * 8, 6, 6, 1); c.fill(); }
        dot(c, 142, 552, 15, 'rgba(40,25,10,0.25)'); dot(c, 140, 549, 14, '#c3c9cf'); dot(c, 140, 549, 10, '#fffdf6');
        c.fillStyle = '#c3c9cf'; c.beginPath(); c.moveTo(126, 545); c.lineTo(118, 549); c.lineTo(126, 553); c.fill();
        dot(c, 262, 550, 30, 'rgba(40,25,10,0.22)'); dot(c, 260, 547, 29, '#e6e0d5'); dot(c, 260, 547, 26, '#fbf9f4');
        c.save(); c.translate(260, 547); c.rotate(-0.3);
        for (let i = -2; i <= 2; i++) { c.fillStyle = i % 2 ? '#d99a4e' : '#c9843a'; c.beginPath(); c.ellipse(i * 7, 0, 6, 11 - Math.abs(i) * 2.2, 0, 0, 7); c.fill(); }
        c.fillStyle = 'rgba(255,240,200,0.4)'; c.beginPath(); c.ellipse(-2, -4, 10, 2.5, 0, 0, 7); c.fill();
        c.restore();
        // a scatter of coffee beans
        for (let i = 0, n = 0; i < 200 && n < 22; i++) {
          const x = 20 + r() * 320, y = 168 + r() * 340;
          if (units.some((u) => Math.hypot(u.x - x, u.y - y) < 46)) continue;
          n++;
          c.save(); c.translate(x, y); c.rotate(r() * 3);
          c.fillStyle = '#4a2a16'; c.beginPath(); c.ellipse(0, 0, 4.2, 3, 0, 0, 7); c.fill();
          c.strokeStyle = '#2a170c'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(-3, 0); c.quadraticCurveTo(0, 1.2, 3, 0); c.stroke();
          c.restore();
        }
      },
      clean(c) {
        for (const u of units) drinkDisc(c, u.x, u.y, R, DRINKS[drink].pour);
        if (opts.dirt) for (const u of units) drawCup(c, u, 1);
      },
      dirt(c) {
        // clean, empty cups (or glasses) waiting for something to drink
        for (const u of units) {
          const g = c.createRadialGradient(u.x - R * 0.3, u.y - R * 0.35, 2, u.x, u.y, R + 1);
          if (iced) { g.addColorStop(0, '#f4f9fb'); g.addColorStop(0.8, '#d5e2e8'); g.addColorStop(1, '#b9cbd4'); }
          else { g.addColorStop(0, '#ffffff'); g.addColorStop(0.75, '#f1ede6'); g.addColorStop(1, '#d9d2c6'); }
          c.fillStyle = g; c.beginPath(); c.arc(u.x, u.y, R + 1, 0, 7); c.fill();
          if (iced) { c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 2; c.beginPath(); c.arc(u.x, u.y, R * 0.7, 3.6, 4.6); c.stroke(); }
          else if (u.ring) { c.strokeStyle = 'rgba(150,105,60,0.2)'; c.lineWidth = 1.6; c.beginPath(); c.arc(u.x + 1, u.y + 2, R * 0.62, 0, 7); c.stroke(); }
        }
      },
      top(c) {
        for (const u of units) {
          if (iced) {
            c.strokeStyle = 'rgba(220,236,243,0.95)'; c.lineWidth = 3.5; c.beginPath(); c.arc(u.x, u.y, R + 1.5, 0, 7); c.stroke();
            c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 1.5; c.beginPath(); c.arc(u.x, u.y, R + 1.5, 3.4, 4.4); c.stroke();
            continue;
          }
          // the handle, then the rim
          c.lineCap = 'round';
          c.strokeStyle = '#ddd6ca'; c.lineWidth = 6.5; c.beginPath(); c.moveTo(u.x + R + 2, u.y - 7); c.quadraticCurveTo(u.x + R + 18, u.y, u.x + R + 2, u.y + 7); c.stroke();
          c.strokeStyle = '#fdfcf9'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(u.x + R + 2, u.y - 7); c.quadraticCurveTo(u.x + R + 18, u.y, u.x + R + 2, u.y + 7); c.stroke();
          c.strokeStyle = '#d6cfc2'; c.lineWidth = 6.5; c.beginPath(); c.arc(u.x, u.y, R + 3, 0, 7); c.stroke();
          c.strokeStyle = '#fefdfb'; c.lineWidth = 4; c.beginPath(); c.arc(u.x, u.y, R + 2.5, 0, 7); c.stroke();
        }
      },
      liveTop(c, t) {
        if (iced) return;
        // a curl or two of steam over every full cup
        c.lineCap = 'round'; c.lineWidth = 2.4; c.strokeStyle = '#ffffff';
        for (const u of units) {
          if (!u.done) continue;
          for (let i = 0; i < 2; i++) {
            const life = (t * 0.35 + i * 0.5 + (u.seed % 97) / 97) % 1;
            const x = u.x - 6 + i * 12 + Math.sin(life * 5 + i) * 2, y = u.y - 8 - life * 30;
            c.globalAlpha = Math.sin(life * Math.PI) * 0.5;
            c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x - 6, y - 6, x + 6, y - 11, x, y - 17); c.stroke();
          }
        }
        c.globalAlpha = 1;
      },
    };
  }

  // ----------------------------------------------------------------- SERVE
  // Two café jobs: filling the napkin holders on the tables inside, and
  // putting the tables and chairs back out on the terrace, where chalk marks
  // show where each one goes.
  const STRIPE = ['#e2574c', '#3d86c6', '#4f9d7a', '#f2b531', '#ef8aa6', '#7a64b8'];
  function drawNapkins(c, u, k) {
    const s = pop(k), cx = u.x + u.w / 2, cy = u.y + u.h - 3;
    c.save(); c.translate(cx, cy); c.scale(s, s);
    for (let i = 0; i < 5; i++) {
      c.save(); c.rotate(-0.62 + i * 0.31);
      c.fillStyle = 'rgba(60,45,30,0.16)'; rect(c, -9.5, -31, 22, 27, 3); c.fill();
      c.fillStyle = '#fdfcf8'; rect(c, -11, -33, 22, 27, 3); c.fill();
      c.strokeStyle = 'rgba(175,165,150,0.7)'; c.lineWidth = 0.8; rect(c, -11, -33, 22, 27, 3); c.stroke();
      c.fillStyle = u.col; c.fillRect(-11, -29, 22, 3);
      c.restore();
    }
    c.restore();
  }
  function napkins(S) {
    const { r, nz, opts, bleed } = S;
    const tables = [], units = [], region = new Path2D();
    for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) tables.push({ x: 94 + i * 172 + (j % 2 ? 6 : -6), y: 214 + j * 134, rot: (r() - 0.5) * 0.5 });
    tables.forEach((t, i) => {
      const u = { shape: 'rect', x: t.x - 20, y: t.y - 4, w: 40, h: 24, col: STRIPE[i % STRIPE.length], seed: (r() * 1e9) | 0 };
      units.push(u); region.rect(u.x, u.y, u.w, u.h);
    });
    return {
      family: 'arrange', particle: 'shine', region, depth: false, indoor: true,
      unitKind: 'clink', unitParticle: 'shine', unitThreshold: 0.4, unitDur: 0.4,
      units: opts.dirt ? [] : units, drawUnit: drawNapkins,
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        // a checked café floor
        for (let y = Math.floor(y0 / 30) * 30; y < y1; y += 30) for (let x = Math.floor(x0 / 30) * 30; x < x1; x += 30) {
          c.fillStyle = (Math.floor(x / 30) + Math.floor(y / 30)) % 2 !== 0 ? '#a9c3a6' : '#efe6d2'; c.fillRect(x, y, 30, 30);
        }
        field(c, x0, y0, x1, y1, 4, (x, y) => [60, 50, 40, 10 + nz.fbm(x * 0.02, y * 0.02, 3) * 26]);
        for (const t of tables) {
          // two bentwood chairs, backs away from the table
          for (const a of [t.rot - 2.2, t.rot + 0.9]) {
            const cx = t.x + Math.cos(a) * 66, cy = t.y + Math.sin(a) * 66;
            dot(c, cx + 2, cy + 4, 20, 'rgba(40,30,20,0.18)');
            dot(c, cx, cy, 19, '#7a4f2e'); dot(c, cx, cy, 15, '#a06a3e');
            c.strokeStyle = '#5e3b22'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.arc(cx, cy, 19, a - 1.1, a + 1.1); c.stroke();
          }
          // a round marble table top
          const tp = new Path2D(); tp.arc(t.x, t.y, 58, 0, 7);
          softShadow(c, tp, 10, 0.4, 3, 6);
          const g = c.createRadialGradient(t.x - 18, t.y - 22, 4, t.x, t.y, 58);
          g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#e4e0d8');
          c.fillStyle = g; c.fill(tp);
          c.save(); c.clip(tp);
          c.strokeStyle = 'rgba(160,150,140,0.35)'; c.lineWidth = 0.8;
          for (let i = 0; i < 4; i++) { let x = t.x + (r() - 0.5) * 80, y = t.y + (r() - 0.5) * 80; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 24; y += (r() - 0.5) * 24; c.lineTo(x, y); } c.stroke(); }
          c.restore();
          c.strokeStyle = '#c9c2b4'; c.lineWidth = 2; c.stroke(tp);
          // the steel napkin holder, a little vase and a sugar pot
          c.fillStyle = '#8f979f'; rect(c, t.x - 24, t.y - 8, 48, 32, 6); c.fill();
          c.fillStyle = '#c3c9cf'; rect(c, t.x - 23, t.y - 7, 46, 29, 5); c.fill();
          dot(c, t.x - 30, t.y - 28, 8, '#9fc6c9'); dot(c, t.x - 30, t.y - 28, 5.5, '#e2574c'); dot(c, t.x - 30, t.y - 28, 2, '#f2c230');
          dot(c, t.x + 31, t.y - 26, 9, '#e8e0d2'); dot(c, t.x + 31, t.y - 26, 7, '#ffffff'); dot(c, t.x + 31, t.y - 26, 2.5, '#d8cbb4');
        }
      },
      clean(c) {
        // one lonely napkin showing at the bottom of each holder
        for (const u of units) {
          c.fillStyle = '#fdfcf8'; rect(c, u.x + 4, u.y + 4, u.w - 8, u.h - 7, 3); c.fill();
          c.strokeStyle = 'rgba(180,170,155,0.55)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(u.x + 6, u.y + u.h / 2); c.lineTo(u.x + u.w - 6, u.y + u.h / 2); c.stroke();
        }
        if (opts.dirt) for (const u of units) drawNapkins(c, u, 1);
      },
      dirt(c) {
        for (const u of units) {
          const g = c.createLinearGradient(0, u.y, 0, u.y + u.h);
          g.addColorStop(0, '#7d858d'); g.addColorStop(1, '#aab2b9');
          c.fillStyle = g; c.fillRect(u.x, u.y, u.w, u.h);
          c.fillStyle = 'rgba(30,35,40,0.35)'; c.fillRect(u.x, u.y, u.w, 4);
          for (let i = 0; i < 6; i++) dot(c, u.x + 4 + r() * (u.w - 8), u.y + 7 + r() * (u.h - 11), 0.9, 'rgba(120,90,50,0.6)');
        }
      },
    };
  }

  const CHAIR_COLS = ['#7fa88a', '#f2c230', '#e98a6e', '#8fbfe6', '#c9474f', '#bba9df'];
  function drawFurniture(c, u, k) {
    const e = pop(k), drop = (1 - e) * 18, sq = k >= 1 ? 1 : 1 + Math.sin(Math.min(1, k) * Math.PI) * 0.1;
    c.save();
    c.globalAlpha = Math.min(1, k * 4);
    // the shadow stays on the ground while the piece drops into place
    c.fillStyle = 'rgba(40,30,20,0.24)';
    if (u.kind === 'table') { c.beginPath(); c.arc(u.cx + 3, u.cy + 5, 33 * (0.8 + 0.2 * e), 0, 7); c.fill(); }
    else { rect(c, u.cx - 10, u.cy - 9, 24, 24, 6); c.fill(); }
    c.translate(u.cx, u.cy - drop); c.scale(sq, 1 / sq);
    if (u.kind === 'table') {
      dot(c, 0, 0, 33, '#4f6b5c'); dot(c, 0, 0, 30, u.col);
      c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 1.4; c.beginPath(); c.arc(0, 0, 24, 3.6, 5.2); c.stroke();
      // a jam jar of flowers in the middle
      dot(c, 0, 0, 7.5, 'rgba(200,230,240,0.9)');
      for (let i = 0; i < 5; i++) { const a = i * 1.26 + 0.3; dot(c, Math.cos(a) * 5, Math.sin(a) * 5, 3.2, u.flower); }
      dot(c, 0, 0, 2.6, '#f2c230');
    } else {
      c.rotate(u.a);
      c.fillStyle = U.shade(u.col, -0.25); rect(c, -12, -12, 24, 24, 6); c.fill();
      c.fillStyle = u.col; rect(c, -11, -11, 22, 21, 5); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.25)'; for (let i = -1; i <= 1; i++) c.fillRect(-8, i * 6 - 1, 16, 2);
      // the backrest, on the side away from the table
      c.fillStyle = U.shade(u.col, -0.35); rect(c, 9, -13, 6, 26, 3); c.fill();
    }
    c.restore();
  }
  function terrace(S) {
    const { r, nz, opts, bleed } = S;
    const units = [], region = new Path2D(), P = Math.PI;
    const layout = [[118, 232, [P, 0, -P / 2]], [248, 346, [P, 0, -P / 2, P / 2]], [116, 462, [P, 0, P / 2]]];
    for (const [tx, ty, seats] of layout) {
      units.push({ shape: 'circle', x: tx, y: ty, r: 34, cx: tx, cy: ty, kind: 'table', col: U.pick(r, ['#f4ecdc', '#9cc5a1', '#a6d3d4', '#efb4ae']), flower: U.pick(r, ['#e2574c', '#ef8aa6', '#f2c230', '#b48fd8']), seed: (r() * 1e9) | 0 });
      circle(region, tx, ty, 34);
      for (const a of seats) {
        const cx = tx + Math.cos(a) * 56, cy = ty + Math.sin(a) * 56;
        units.push({ shape: 'rect', x: cx - 14, y: cy - 14, w: 28, h: 28, cx, cy, kind: 'chair', a, col: U.pick(r, CHAIR_COLS), seed: (r() * 1e9) | 0 });
        region.rect(cx - 14, cy - 14, 28, 28);
      }
    }
    return {
      family: 'arrange', particle: 'dust', region, depth: false,
      unitKind: 'build', unitParticle: 'dust', unitThreshold: 0.4, unitDur: 0.42,
      units: opts.dirt ? [] : units, drawUnit: drawFurniture,
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        // big sandstone flags in staggered rows
        c.fillStyle = '#9d907c'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
        for (let y = 92, row = 0; y < y1; row++) {
          const h = 52 + r() * 14;
          for (let x = x0 - (row % 2 ? 34 : 0); x < x1;) {
            const w = 62 + r() * 30, col = U.pick(r, ['#d9cbb3', '#cfc0a6', '#e2d6c0', '#d4c3a8']);
            c.fillStyle = U.shade(col, -0.2); rect(c, x + 2.5, y + 4, w - 5, h - 5, 5); c.fill();
            c.fillStyle = col; rect(c, x + 2.5, y + 2.5, w - 5, h - 6, 5); c.fill();
            const g = c.createLinearGradient(x, y, x + w, y + h);
            g.addColorStop(0, 'rgba(255,255,255,0.25)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.06)');
            c.fillStyle = g; rect(c, x + 2.5, y + 2.5, w - 5, h - 6, 5); c.fill();
            x += w;
          }
          y += h;
        }
        for (let i = 0; i < 1600; i++) { c.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.12)'; c.fillRect(x0 + r() * (x1 - x0), 92 + r() * (y1 - 92), 1 + r(), 1 + r()); }
        // the café front at the top: green panels, a lit window and the door
        c.fillStyle = '#2f4f45'; c.fillRect(x0, y0, x1 - x0, 92 - y0);
        c.fillStyle = '#f6dca0'; c.fillRect(26, 20, 150, 60);
        c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.moveTo(40, 20); c.lineTo(70, 20); c.lineTo(46, 80); c.lineTo(26, 80); c.lineTo(26, 46); c.closePath(); c.fill();
        c.fillStyle = '#2f4f45'; c.fillRect(98, 20, 6, 60);
        c.fillStyle = '#3e6457'; c.fillRect(222, 8, 64, 84);
        c.fillStyle = '#f6dca0'; c.fillRect(232, 18, 44, 34);
        dot(c, 278, 60, 3, '#e2b850');
        c.fillStyle = '#c9c1b2'; c.fillRect(212, 86, 84, 10); c.fillStyle = '#a99f8f'; c.fillRect(212, 94, 84, 3);
        // pots of flowers in the corners
        for (const [px, py] of [[30, 126], [330, 126], [334, 540]]) {
          dot(c, px + 2, py + 4, 20, 'rgba(40,30,20,0.25)'); dot(c, px, py, 19, '#c9744a'); dot(c, px, py, 15, '#5a3d28');
          shrub(c, r, px, py - 2, 22, '#4f8a3c');
          for (let i = 0; i < 6; i++) dot(c, px + (r() - 0.5) * 22, py - 2 + (r() - 0.5) * 18, 3, U.pick(r, ['#e2574c', '#ef8aa6', '#f2c230']));
        }
      },
      clean() {},
      dirt(c) {
        // chalk marks where everything goes
        c.lineCap = 'round';
        for (const u of units) {
          c.strokeStyle = 'rgba(255,255,255,0.88)'; c.lineWidth = 2.2; c.setLineDash([6, 5]);
          c.beginPath();
          if (u.kind === 'table') c.arc(u.cx, u.cy, 30, 0, 7); else c.roundRect(u.x + 3.5, u.y + 3.5, u.w - 7, u.h - 7, 5);
          c.stroke(); c.setLineDash([]);
          const s = u.kind === 'table' ? 8 : 5;
          c.lineWidth = 1.8; c.strokeStyle = 'rgba(255,255,255,0.75)';
          c.beginPath(); c.moveTo(u.cx - s, u.cy - s); c.lineTo(u.cx + s, u.cy + s); c.moveTo(u.cx + s, u.cy - s); c.lineTo(u.cx - s, u.cy + s); c.stroke();
          c.fillStyle = 'rgba(255,255,255,0.14)'; c.beginPath(); c.ellipse(u.cx + (r() - 0.5) * 10, u.cy + (r() - 0.5) * 10, s * 2.4, s * 1.4, r() * 3, 0, 7); c.fill();
        }
      },
    };
  }
  const serve = (S) => (S.opts.what === 'tables' ? terrace(S) : napkins(S));

  // ------------------------------------------------------------------ SEAL
  // A seal pup on a rock, on the beach or in the rescue's pool, and fish on a
  // wet tray. Every fish you pick up flies to the seal, who claps for it.
  function drawFish(c, u) {
    const s = u.s;
    c.save(); c.translate(u.x, u.y); c.rotate(u.rot);
    c.fillStyle = 'rgba(30,50,70,0.22)'; c.beginPath(); c.ellipse(2, 3, s * 1.2, s * 0.46, 0, 0, 7); c.fill();
    c.fillStyle = '#6f8aa6'; c.beginPath(); c.moveTo(-s * 0.95, 0); c.lineTo(-s * 1.55, -s * 0.48); c.lineTo(-s * 1.4, 0); c.lineTo(-s * 1.55, s * 0.48); c.closePath(); c.fill();
    const g = c.createLinearGradient(0, -s * 0.45, 0, s * 0.45);
    g.addColorStop(0, '#56718f'); g.addColorStop(0.5, '#a9bccd'); g.addColorStop(1, '#e6edf2');
    c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, s * 1.15, s * 0.45, 0, 0, 7); c.fill();
    c.strokeStyle = 'rgba(60,85,110,0.35)'; c.lineWidth = 0.8;
    for (let i = -2; i <= 1; i++) { c.beginPath(); c.arc(i * s * 0.28, 0, s * 0.28, -0.9, 0.9); c.stroke(); }
    c.fillStyle = '#7b96b0'; c.beginPath(); c.moveTo(-s * 0.15, -s * 0.38); c.lineTo(s * 0.2, -s * 0.66); c.lineTo(s * 0.32, -s * 0.36); c.closePath(); c.fill();
    dot(c, s * 0.74, -s * 0.08, s * 0.12, '#1f2a33'); dot(c, s * 0.71, -s * 0.11, s * 0.045, '#ffffff');
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.ellipse(s * 0.05, -s * 0.2, s * 0.5, s * 0.07, 0, 0, 7); c.fill();
    c.restore();
  }
  // the seal, lying along a rock with its head up. clap = seconds into a
  // clap (or -1), gulp = the mouth is open for a fish. A still copy sits in
  // the top layer (so it shows in thumbnails and pictures) and the live one
  // is drawn exactly over it, blinking and clapping
  function drawSeal(c, x, y, t, clap, gulp, shadow) {
    const blink = t % 3.7 < 0.14;
    c.save(); c.translate(x, y);
    if (shadow) { c.fillStyle = 'rgba(30,40,50,0.22)'; c.beginPath(); c.ellipse(6, 30, 70, 11, 0, 0, 7); c.fill(); }
    // hind flippers, fanned out behind
    c.fillStyle = '#6e7c89';
    c.save(); c.translate(62, 14); c.rotate(0.25);
    c.beginPath(); c.ellipse(11, -6, 15, 6, -0.45, 0, 7); c.fill(); c.beginPath(); c.ellipse(11, 7, 15, 6, 0.45, 0, 7); c.fill();
    c.restore();
    // a plump body with a pale belly and a few spots
    const g = c.createLinearGradient(0, -24, 0, 32);
    g.addColorStop(0, '#7b8996'); g.addColorStop(0.6, '#a5b1bc'); g.addColorStop(1, '#d3dae0');
    c.fillStyle = g; c.beginPath(); c.ellipse(10, 8, 62, 25, 0.04, 0, 7); c.fill();
    for (const [sx, sy, sr] of [[22, -4, 4], [38, 4, 3], [6, -8, 3], [48, -6, 2.5], [28, 10, 2]]) dot(c, sx, sy, sr, 'rgba(80,92,104,0.45)');
    // the neck and head, lifted up to look at you
    const hx = -42, hy = -22;
    c.fillStyle = '#98a5b1'; c.beginPath(); c.ellipse(-30, -3, 19, 21, 0.5, 0, 7); c.fill();
    const hg = c.createRadialGradient(hx - 7, hy - 9, 2, hx, hy, 26);
    hg.addColorStop(0, '#bcc6cf'); hg.addColorStop(1, '#8794a1');
    c.fillStyle = hg; c.beginPath(); c.arc(hx, hy, 25, 0, 7); c.fill();
    // eyes, big and dark, blinking now and then
    for (const ex of [-9, 9]) {
      if (blink) { c.strokeStyle = '#1f2428'; c.lineWidth = 2; c.beginPath(); c.moveTo(hx + ex - 4.5, hy - 4); c.lineTo(hx + ex + 4.5, hy - 4); c.stroke(); }
      else { dot(c, hx + ex, hy - 4, 5.6, '#1f2428'); dot(c, hx + ex - 1.6, hy - 6, 1.8, '#ffffff'); dot(c, hx + ex + 1.5, hy - 2.6, 0.8, '#ffffff'); }
    }
    // whisker pads, nose and mouth
    dot(c, hx - 5, hy + 8, 6.6, '#ccd4db'); dot(c, hx + 5, hy + 8, 6.6, '#ccd4db');
    for (const [wx, wy] of [[-8, 7], [-5, 10], [-9, 11], [5, 10], [8, 7], [9, 11]]) dot(c, hx + wx, hy + wy, 0.8, '#6e7c89');
    c.fillStyle = '#2b2f33'; c.beginPath(); c.ellipse(hx, hy + 3, 4.2, 2.8, 0, 0, 7); c.fill();
    if (gulp) { c.fillStyle = '#5a3a3f'; c.beginPath(); c.ellipse(hx, hy + 14, 4.5, 3.4, 0, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 0.8;
    for (const sgn of [-1, 1]) for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(hx + sgn * 9, hy + 7 + k * 2.5); c.lineTo(hx + sgn * 24, hy + 3 + k * 4.5); c.stroke(); }
    // front flippers: resting, or clapping when a fish arrives
    const swing = clap >= 0 ? Math.sin(clap * 24) * 0.45 : 0;
    c.fillStyle = '#7d8a97';
    c.save(); c.translate(-28, 12); c.rotate(clap >= 0 ? -1.5 + swing : 0.55); c.beginPath(); c.ellipse(0, 10, 6, 14, 0, 0, 7); c.fill(); c.restore();
    c.save(); c.translate(-12, 16); c.rotate(clap >= 0 ? -1.75 - swing : 0.35); c.beginPath(); c.ellipse(0, 10, 6, 13, 0, 0, 7); c.fill(); c.restore();
    c.restore();
  }
  function sandField(c, nz, x0, y0, x1, y1, tone = 0) {
    field(c, x0, y0, x1, y1, 3, (x, y) => { const v = nz.fbm(x * 0.03, y * 0.03, 4); return [228 + v * 18 - tone, 208 + v * 16 - tone, 160 + v * 14 - tone]; });
  }
  function rock(c, r, x, y, rx, ry) {
    const p = new Path2D(); SCENES.blob(p, x, y, rx, ry, r, 0.08, 14);
    softShadow(c, p, 8, 0.35, 3, 5);
    const g = c.createLinearGradient(0, y - ry, 0, y + ry);
    g.addColorStop(0, '#a7a49c'); g.addColorStop(1, '#6f6c66');
    c.fillStyle = g; c.fill(p);
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.ellipse(x - rx * 0.25, y - ry * 0.4, rx * 0.5, ry * 0.3, 0, 0, 7); c.fill();
    for (let i = 0; i < 14; i++) dot(c, x + (r() - 0.5) * rx * 1.4, y + (r() - 0.5) * ry, 1 + r() * 2, 'rgba(60,58,52,0.3)');
  }
  function seal(S) {
    const { r, nz, opts, bleed } = S;
    const pool = opts.where === 'pool';
    const at = pool ? { x: 206, y: 262 } : { x: 236, y: 296 };
    const target = { x: at.x - 42, y: at.y - 8 };
    const tray = { x: 36, y: pool ? 424 : 412, w: 288, h: pool ? 126 : 124 };
    const units = [], region = new Path2D();
    for (let tries = 0; units.length < 7 && tries < 800; tries++) {
      const x = tray.x + 32 + r() * (tray.w - 64), y = tray.y + 26 + r() * (tray.h - 48);
      if (units.some((u) => Math.hypot(u.x - x, u.y - y) < 47)) continue;
      const s = 14 + r() * 3;
      units.push({ shape: 'circle', x, y, r: s * 1.3, s, rot: (r() - 0.5) * 1.2 + (r() < 0.5 ? Math.PI : 0), seed: (r() * 1e9) | 0, spin: (r() - 0.5) * 6 });
      circle(region, x, y, s * 1.3);
    }
    let fed = -1, clapAt = -10;
    return {
      family: 'feed', particle: 'water', region, depth: false,
      unitMode: 'collect', unitKind: 'collect', unitParticle: 'water', unitThreshold: 0.4, unitDur: 0.75, unitTarget: target,
      units, drawUnit: drawFish,
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        if (pool) {
          // pale paving round the rescue's seal pool, a low fence behind it
          c.fillStyle = '#b9b2a4'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
          for (let y = Math.floor(y0 / 40) * 40; y < y1; y += 40) for (let x = Math.floor(x0 / 40) * 40; x < x1; x += 40) {
            c.fillStyle = U.pick(r, ['#ddd6c8', '#d4ccbc', '#e4ddd0']); rect(c, x + 1.5, y + 1.5, 37, 37, 4); c.fill();
          }
          c.fillStyle = '#a2734a';
          for (let x = x0 + 6; x < x1; x += 24) { rect(c, x, 70, 9, 54, 3); c.fill(); }
          c.fillRect(x0, 84, x1 - x0, 7); c.fillRect(x0, 108, x1 - x0, 7);
          const pp = new Path2D(); pp.arc(180, 268, 138, 0, 7);
          softShadow(c, pp, 10, 0.35, 2, 5);
          for (let i = 0; i < 48; i++) {
            const a0 = (i / 48) * 6.283, a1 = ((i + 1) / 48) * 6.283;
            c.fillStyle = i % 2 ? '#ffffff' : '#5aa9d6'; c.beginPath(); c.arc(180, 268, 138, a0, a1); c.arc(180, 268, 125, a1, a0, true); c.closePath(); c.fill();
          }
          const wg = c.createRadialGradient(150, 230, 10, 180, 268, 126);
          wg.addColorStop(0, '#8fd3ea'); wg.addColorStop(1, '#3b8fbf');
          c.fillStyle = wg; c.beginPath(); c.arc(180, 268, 125, 0, 7); c.fill();
          c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1.4;
          for (let i = 0; i < 16; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * 100; const x = 180 + Math.cos(a) * d, y = 268 + Math.sin(a) * d; c.beginPath(); c.moveTo(x - 9, y); c.quadraticCurveTo(x, y - 4, x + 9, y); c.stroke(); }
          rock(c, r, at.x + 10, at.y + 22, 82, 30);
          // a bucket by the pool
          dot(c, 318, 404, 17, '#3d86c6'); dot(c, 318, 404, 13, '#2c6a9e');
          c.strokeStyle = '#9aa3ad'; c.lineWidth = 2; c.beginPath(); c.arc(318, 404, 19, -2.6, -0.5); c.stroke();
        } else {
          // the cove: sky, sea with a line of foam, sand and a big flat rock
          const g = c.createLinearGradient(0, y0, 0, 150);
          g.addColorStop(0, '#9fd6f0'); g.addColorStop(1, '#e3f3ea');
          c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, 150 - y0);
          const sea = c.createLinearGradient(0, 150, 0, 228);
          sea.addColorStop(0, '#3a88ac'); sea.addColorStop(1, '#7cc3d4');
          c.fillStyle = sea; c.fillRect(x0, 150, x1 - x0, 78);
          c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2;
          for (let i = 0; i < 9; i++) { const x = x0 + r() * (x1 - x0), y = 158 + r() * 60; c.beginPath(); c.moveTo(x - 14, y); c.quadraticCurveTo(x, y - 4, x + 14, y); c.stroke(); }
          sandField(c, nz, x0, 224, x1, y1);
          c.fillStyle = 'rgba(255,255,255,0.8)'; c.beginPath(); c.moveTo(x0, 224); for (let x = x0; x <= x1; x += 10) c.lineTo(x, 222 + Math.sin(x * 0.07) * 4); c.lineTo(x1, 232); c.lineTo(x0, 232); c.fill();
          rock(c, r, at.x + 10, at.y + 22, 92, 36);
          rock(c, r, 60, 300, 34, 20);
          for (let i = 0; i < 18; i++) { c.strokeStyle = U.pick(r, ['#5d7a3a', '#6e6a2e', '#4f6b3a']); c.lineWidth = 1.6; const x = 30 + r() * 300, y = 250 + r() * 140; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 4, y - 5, x + 9, y - 2); c.stroke(); }
        }
        // the wet wooden tray the fish lie on
        const tp = new Path2D(); tp.roundRect(tray.x, tray.y, tray.w, tray.h, 10);
        softShadow(c, tp, 10, 0.4, 3, 6);
        c.fillStyle = '#6b4a30'; c.fill(tp);
        c.save(); c.clip(tp);
        for (let y = tray.y + 8; y < tray.y + tray.h - 6; y += 22) {
          c.fillStyle = U.pick(r, ['#9a7452', '#8f6a48', '#a47c58']); rect(c, tray.x + 8, y, tray.w - 16, 19, 3); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.1)'; c.fillRect(tray.x + 10, y + 2, tray.w - 20, 2);
        }
        c.restore();
      },
      clean() {},
      top(c) { drawSeal(c, at.x, at.y, 1, -1, false, true); },
      dirt(c) {
        // each fish lies in a little wet patch
        for (const u of units) {
          const g = c.createRadialGradient(u.x, u.y, 2, u.x, u.y, u.r + 2);
          g.addColorStop(0, 'rgba(40,62,84,0.45)'); g.addColorStop(1, 'rgba(40,62,84,0.14)');
          c.fillStyle = g; c.beginPath(); c.arc(u.x, u.y, u.r + 2, 0, 7); c.fill();
          for (let i = 0; i < 5; i++) dot(c, u.x + (r() - 0.5) * u.r * 1.6, u.y + (r() - 0.5) * u.r * 1.6, 1 + r() * 1.5, 'rgba(255,255,255,0.55)');
        }
      },
      liveTop(c, t) {
        const n = units.reduce((a, u) => a + (u.done ? 1 : 0), 0);
        if (fed < 0) fed = n;
        else if (n > fed) { fed = n; clapAt = t + 0.7; }
        const since = t - clapAt;
        if (pool) {
          // slow rings on the water round the rock
          c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 1.2;
          for (let i = 0; i < 2; i++) {
            const life = (t * 0.25 + i * 0.5) % 1;
            c.globalAlpha = 1 - life;
            c.beginPath(); c.ellipse(at.x + 10, at.y + 26, 86 + life * 30, 32 + life * 12, 0, 0, 7); c.stroke();
          }
          c.globalAlpha = 1;
        }
        drawSeal(c, at.x, at.y, t, since >= 0 && since < 0.8 ? since : -1, since > -0.3 && since < 0.15, false);
      },
    };
  }

  // ----------------------------------------------------------------- BOWLS
  // Breakfast (or fresh water) in the kennels: a bowl on a mat for every dog,
  // its name painted underneath, and the dogs watching from their kennels.
  const NAMES = ['Biscuit', 'Pepper', 'Mabel', 'Otto', 'Rosie', 'Bruno', 'Luna', 'Teddy'];
  const PUPS = [['#e2b36a', '#c48c48'], ['#f4efe6', '#3b3533'], ['#a8754a', '#875a35'], ['#5b4a42', '#3b3533'], ['#d9a066', '#f4efe6'], ['#8d8f96', '#5d5f66']];
  function pupFace(c, x, y, cols) {
    const [fur, ear] = cols;
    c.fillStyle = ear; c.beginPath(); c.ellipse(x - 14, y - 3, 7, 12, 0.4, 0, 7); c.fill(); c.beginPath(); c.ellipse(x + 14, y - 3, 7, 12, -0.4, 0, 7); c.fill();
    dot(c, x, y, 15, fur);
    dot(c, x, y + 6, 8, U.shade(fur, 0.35));
    dot(c, x - 6, y - 3, 2.5, '#2b2422'); dot(c, x + 6, y - 3, 2.5, '#2b2422');
    dot(c, x - 5.3, y - 3.8, 0.9, '#ffffff'); dot(c, x + 6.7, y - 3.8, 0.9, '#ffffff');
    c.fillStyle = '#2b2422'; c.beginPath(); c.ellipse(x, y + 3.5, 3.4, 2.4, 0, 0, 7); c.fill();
    c.fillStyle = '#ef8aa6'; c.beginPath(); c.ellipse(x, y + 9.5, 2.6, 3.6, 0, 0, Math.PI); c.fill();
  }
  function kibble(c, rr, x, y, R, n, heap) {
    for (let i = 0; i < n; i++) {
      const a = rr() * 6.283, d = Math.sqrt(rr()) * R * 0.9;
      const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d - (heap ? (1 - d / R) * 4 : 0);
      c.fillStyle = U.pick(rr, ['#9c6332', '#b5793f', '#8a5228', '#c98d4e', '#7a4a24']);
      c.beginPath(); c.ellipse(px, py, 2.8, 2.2, rr() * 3, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,230,190,0.35)'; c.beginPath(); c.arc(px - 0.8, py - 0.8, 0.8, 0, 7); c.fill();
    }
  }
  function waterIn(c, x, y, R, bright) {
    const g = c.createRadialGradient(x - R * 0.3, y - R * 0.3, 2, x, y, R);
    g.addColorStop(0, bright ? '#cdeefa' : '#a9dcef'); g.addColorStop(0.6, bright ? '#79c2e3' : '#6bb2d6'); g.addColorStop(1, '#3f8fbd');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, 7); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 1.6;
    c.beginPath(); c.arc(x, y, R * 0.55, 3.5, 4.6); c.stroke();
    c.beginPath(); c.arc(x, y, R * 0.8, 0.2, 0.9); c.stroke();
  }
  function drawBowl(c, u, k) {
    const s = pop(k), R = u.r;
    c.save(); c.beginPath(); c.arc(u.x, u.y, R, 0, 7); c.clip();
    c.translate(u.x, u.y); c.scale(s, s); c.translate(-u.x, -u.y);
    if (u.water) { waterIn(c, u.x, u.y, R, true); dot(c, u.x - R * 0.35, u.y - R * 0.4, 2.4, 'rgba(255,255,255,0.95)'); }
    else {
      const g = c.createRadialGradient(u.x, u.y - 3, 2, u.x, u.y, R);
      g.addColorStop(0, '#b07a44'); g.addColorStop(1, '#7c4f2a');
      c.fillStyle = g; c.beginPath(); c.arc(u.x, u.y, R, 0, 7); c.fill();
      kibble(c, U.rng(u.seed), u.x, u.y, R, 80, true);
    }
    c.restore();
    if (k < 1 && u.water) { c.strokeStyle = `rgba(255,255,255,${0.8 * (1 - k)})`; c.lineWidth = 1.6; c.beginPath(); c.arc(u.x, u.y, R * (0.2 + 0.8 * Math.max(0, k)), 0, 7); c.stroke(); }
  }
  function bowls(S) {
    const { r, nz, opts, bleed } = S;
    const water = opts.food === 'water', R = 23;
    const first = (r() * NAMES.length) | 0;
    const units = [], region = new Path2D();
    for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) {
      const x = 54 + i * 84, y = 292 + j * 150 + (i % 2) * 12;
      units.push({ shape: 'circle', x, y, r: R, water, name: NAMES[(first + j * 4 + i) % NAMES.length], seed: (r() * 1e9) | 0, mat: U.pick(r, ['#e98a6e', '#8fbfe6', '#9cc5a1', '#f2c230', '#ef8aa6', '#bba9df']) });
      circle(region, x, y, R);
    }
    return {
      family: 'feed', particle: water ? 'water' : 'chips', region, depth: false, indoor: true,
      unitKind: 'clink', unitParticle: water ? 'water' : 'chips', unitThreshold: 0.4, unitDur: 0.45,
      units: opts.dirt ? [] : units, drawUnit: drawBowl,
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        // warm tiles on the kennel floor
        field(c, x0, 200, x1, y1, 3, (x, y) => { const v = nz.fbm(x * 0.02, y * 0.02, 3); return [222 + v * 16, 204 + v * 14, 176 + v * 12]; });
        c.strokeStyle = 'rgba(150,120,90,0.35)'; c.lineWidth = 1.5;
        for (let x = Math.floor(x0 / 48) * 48; x < x1; x += 48) { c.beginPath(); c.moveTo(x, 200); c.lineTo(x, y1); c.stroke(); }
        for (let y = 200; y < y1; y += 48) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); }
        // the kennel fronts along the top, a dog looking out of each
        c.fillStyle = '#7fa88a'; c.fillRect(x0, y0, x1 - x0, 200 - y0);
        c.fillStyle = 'rgba(40,70,50,0.22)'; for (let x = Math.floor(x0 / 18) * 18; x < x1; x += 18) c.fillRect(x, y0, 1.5, 200 - y0);
        c.fillStyle = 'rgba(30,20,10,0.3)'; c.fillRect(x0, 200, x1 - x0, 8);
        c.fillStyle = '#5d8a6c'; c.fillRect(x0, 192, x1 - x0, 9);
        for (let i = 0; i < 4; i++) {
          const kx = 54 + i * 84;
          c.fillStyle = '#efe6d2'; c.beginPath(); c.moveTo(kx - 34, 193); c.lineTo(kx - 34, 128); c.arc(kx, 128, 34, Math.PI, 0); c.lineTo(kx + 34, 193); c.closePath(); c.fill();
          c.fillStyle = '#3a2a22'; c.beginPath(); c.moveTo(kx - 27, 193); c.lineTo(kx - 27, 130); c.arc(kx, 130, 27, Math.PI, 0); c.lineTo(kx + 27, 193); c.closePath(); c.fill();
          pupFace(c, kx, 176, PUPS[(first + i) % PUPS.length]);
        }
        // a sack of kibble, or a watering hose, by the wall
        if (water) {
          c.strokeStyle = '#3f9b5a'; c.lineWidth = 5; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(320, 230, 22 - i * 6, 12 - i * 3, 0, 0, 7); c.stroke(); }
        } else {
          c.fillStyle = 'rgba(40,30,20,0.2)'; rect(c, 286, 216, 60, 40, 8); c.fill();
          c.fillStyle = '#c9a46a'; rect(c, 282, 210, 60, 40, 8); c.fill();
          c.fillStyle = '#e2574c'; rect(c, 292, 222, 40, 16, 3); c.fill();
          c.fillStyle = '#ffffff'; c.font = `800 9px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('KIBBLE', 312, 230.5);
        }
        // a mat under every bowl with the dog's name on it, and the bowl itself
        for (const u of units) {
          c.fillStyle = 'rgba(40,30,20,0.15)'; rect(c, u.x - 35, u.y - 33, 74, 92, 14); c.fill();
          c.fillStyle = u.mat; rect(c, u.x - 37, u.y - 36, 74, 92, 14); c.fill();
          c.fillStyle = 'rgba(255,255,255,0.22)'; rect(c, u.x - 33, u.y - 32, 66, 84, 11); c.fill();
          c.fillStyle = '#3a2a22'; c.font = `800 12px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
          c.fillText(u.name, u.x, u.y + 43);
          const bp = new Path2D(); bp.arc(u.x, u.y, R + 8, 0, 7);
          softShadow(c, bp, 6, 0.35, 1, 3);
          dot(c, u.x, u.y, R + 8, '#9aa3ab');
        }
      },
      clean(c) {
        for (const u of units) {
          if (water) waterIn(c, u.x, u.y, R, false);
          else { c.fillStyle = '#8a5a32'; c.beginPath(); c.arc(u.x, u.y, R, 0, 7); c.fill(); kibble(c, r, u.x, u.y, R, 46, false); }
        }
        if (opts.dirt) for (const u of units) drawBowl(c, u, 1);
      },
      dirt(c) {
        // empty steel bowls: a few crumbs, or the dusty ring of dried-up water
        for (const u of units) {
          const g = c.createRadialGradient(u.x - 6, u.y - 8, 2, u.x, u.y, R + 1);
          g.addColorStop(0, '#f2f5f7'); g.addColorStop(0.7, '#c9d0d6'); g.addColorStop(1, '#a3acb4');
          c.fillStyle = g; c.beginPath(); c.arc(u.x, u.y, R + 1, 0, 7); c.fill();
          if (water) {
            c.strokeStyle = 'rgba(190,170,130,0.45)'; c.lineWidth = 2.2; c.beginPath(); c.arc(u.x, u.y, R * 0.72, 0, 7); c.stroke();
            for (let i = 0; i < 10; i++) dot(c, u.x + (r() - 0.5) * R * 1.4, u.y + (r() - 0.5) * R * 1.4, 0.8, 'rgba(150,130,100,0.5)');
          } else for (let i = 0; i < 7; i++) dot(c, u.x + (r() - 0.5) * R * 1.3, u.y + (r() - 0.5) * R * 1.3, 1.1, 'rgba(140,90,45,0.7)');
        }
      },
      top(c) {
        for (const u of units) {
          c.strokeStyle = '#b9c1c8'; c.lineWidth = 7; c.beginPath(); c.arc(u.x, u.y, R + 3.5, 0, 7); c.stroke();
          c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 2; c.beginPath(); c.arc(u.x, u.y, R + 3, 3.3, 4.9); c.stroke();
          c.strokeStyle = 'rgba(60,70,80,0.3)'; c.lineWidth = 1.2; c.beginPath(); c.arc(u.x, u.y, R + 0.6, 0, 7); c.stroke();
        }
      },
      liveTop(c, t) {
        // a little heart over every dog's full bowl, or a glint on the water
        for (const u of units) {
          if (!u.done) continue;
          const life = (t * 0.45 + (u.seed % 100) / 100) % 1;
          c.globalAlpha = Math.sin(life * Math.PI) * 0.9;
          if (water) twinkle(c, u.x + 9, u.y - 9, 1.6 + Math.sin(life * Math.PI) * 1.2, '#ffffff');
          else heart(c, u.x + 12, u.y - 22 - life * 26, 4.5 + life * 2, '#ef8aa6');
        }
        c.globalAlpha = 1;
      },
    };
  }

  // ------------------------------------------------------------------ WALK
  // A meadow seen from above with a winding path, gone wild. Walking the
  // dogs along it treads it back into a path, with paw prints all the way.
  function walk(S) {
    const { r, nz, bleed } = S;
    const half = 22, cx = (y) => 180 + 104 * Math.sin(y * 0.0135 + 0.5);
    const pts = [];
    for (let y = -24; y <= 624; y += 6) pts.push([cx(y), y]);
    const L = [], R = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
      L.push([pts[i][0] + nx * half, pts[i][1] + ny * half]); R.push([pts[i][0] - nx * half, pts[i][1] - ny * half]);
    }
    const region = new Path2D();
    region.moveTo(L[0][0], L[0][1]);
    for (const p of L) region.lineTo(p[0], p[1]);
    for (let i = R.length - 1; i >= 0; i--) region.lineTo(R[i][0], R[i][1]);
    region.closePath();
    // a random point on the path itself
    const onPath = (spread = 1) => {
      const i = (r() * (L.length - 1)) | 0, f = r(), t = 0.5 + (r() - 0.5) * spread;
      const lx = U.lerp(L[i][0], L[i + 1][0], f), ly = U.lerp(L[i][1], L[i + 1][1], f), rx = U.lerp(R[i][0], R[i + 1][0], f), ry = U.lerp(R[i][1], R[i + 1][1], f);
      return [U.lerp(lx, rx, t), U.lerp(ly, ry, t)];
    };
    const free = (x, y, m) => !nearRegion(region, x, y, m);
    let last = null, acc = 0, side = 1;
    return {
      family: 'walk', particle: 'grass', region, depth: true,
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        mowedLawn(c, nz, x0, y0, x1, y1, false);
        grassGrain(c, r, x0, y0, x1, y1, 6, 0.2);
        // a soft verge along both sides of the path
        c.save(); c.strokeStyle = 'rgba(55,85,35,0.32)'; c.lineWidth = 12; c.lineJoin = 'round'; c.stroke(region); c.restore();
        const taken = [];
        const spot = (m, tries = 300, x0r = 30, x1r = 330, y0r = 90, y1r = 560) => {
          for (let i = 0; i < tries; i++) {
            const x = x0r + r() * (x1r - x0r), y = y0r + r() * (y1r - y0r);
            if (!free(x, y, m) || taken.some((t) => Math.hypot(t[0] - x, t[1] - y) < t[2] + m)) continue;
            taken.push([x, y, m]); return [x, y];
          }
          return null;
        };
        // a pond with reeds and a duck
        const pd = spot(64, 400, 60, 300, 120, 520);
        if (pd) {
          const [px, py] = pd;
          c.fillStyle = 'rgba(40,70,30,0.3)'; c.beginPath(); c.ellipse(px + 2, py + 4, 52, 35, 0, 0, 7); c.fill();
          const g = c.createRadialGradient(px - 14, py - 10, 4, px, py, 50);
          g.addColorStop(0, '#9fd3e6'); g.addColorStop(1, '#4f9bbf');
          c.fillStyle = g; c.beginPath(); c.ellipse(px, py, 50, 33, 0, 0, 7); c.fill();
          c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(px - 8, py - 6, 22, 9, 0, 3.4, 5.4); c.stroke();
          for (let i = 0; i < 3; i++) { const a = 0.6 + i * 0.9; c.fillStyle = '#5c9a4a'; c.beginPath(); c.moveTo(px + Math.cos(a) * 30, py + Math.sin(a) * 20); c.arc(px + Math.cos(a) * 30, py + Math.sin(a) * 20, 7, 0.3, 5.9); c.closePath(); c.fill(); }
          c.strokeStyle = '#6b8f3a'; c.lineWidth = 2; c.lineCap = 'round';
          for (let i = 0; i < 9; i++) { const a = 3.6 + i * 0.12, x = px + Math.cos(a) * 48, y = py + Math.sin(a) * 31; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 3 + r() * 6, y - 12 - r() * 8); c.stroke(); }
          // the duck
          const dx = px + 10, dy = py + 6;
          c.fillStyle = '#f7f3ea'; c.beginPath(); c.ellipse(dx, dy, 9, 6, 0, 0, 7); c.fill();
          dot(c, dx + 8, dy - 2, 4.5, '#3f7a4a'); c.fillStyle = '#f2b531'; c.beginPath(); c.ellipse(dx + 13, dy - 2, 3, 1.6, 0, 0, 7); c.fill();
        }
        // trees, with their shadows on the grass
        for (let i = 0; i < 6; i++) {
          const s = 34 + r() * 16, p = spot(s * 0.8 + 8, 200, 10, 350, 70, 590);
          if (!p) continue;
          c.fillStyle = 'rgba(30,50,20,0.25)'; c.beginPath(); c.ellipse(p[0] + 14, p[1] + 12, s * 0.95, s * 0.8, 0, 0, 7); c.fill();
          shrub(c, r, p[0], p[1], s, U.pick(r, ['#4f8a3c', '#5d9644', '#467e37', '#6b8f3a']));
        }
        // a bench beside the path, facing it
        for (let tries = 0; tries < 60; tries++) {
          const i = 25 + ((r() * (pts.length - 50)) | 0), side = r() < 0.5 ? 1 : -1;
          const a = pts[i - 1], b = pts[i + 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
          const bx = pts[i][0] - Math.sin(ang) * (half + 24) * side, by = pts[i][1] + Math.cos(ang) * (half + 24) * side;
          if (bx < 30 || bx > 330 || by < 100 || by > 540 || !free(bx, by, 14) || taken.some((t) => Math.hypot(t[0] - bx, t[1] - by) < t[2] + 18)) continue;
          taken.push([bx, by, 18]);
          c.save(); c.translate(bx, by); c.rotate(ang);
          c.fillStyle = 'rgba(40,30,20,0.25)'; rect(c, -20, -6, 44, 18, 3); c.fill();
          c.fillStyle = '#8a5a35'; rect(c, -22, -9, 44, 18, 3); c.fill();
          c.fillStyle = '#b07a48'; for (let k = 0; k < 3; k++) { rect(c, -21, -8 + k * 6, 42, 4.5, 1.5); c.fill(); }
          c.fillStyle = '#6b4a2c'; c.fillRect(-22, side * 7 - 2, 44, 4);
          c.restore();
          break;
        }
        // clumps of flowers in the grass
        for (let i = 0; i < 16; i++) { const p = spot(14, 60); if (p) flowerClump(c, r, p[0], p[1], U.pick(r, ['#e98aa2', '#f2c230', '#b48fd8', '#ffffff', '#f08a5d'])); }
      },
      clean(c) {
        // trodden earth with little stones
        const g = ramp(['#9c7c55', '#ad8d64', '#bf9f74', '#cdb084']);
        field(c, 0, 0, W, H, 3, (x, y) => g(nz.fbm(x * 0.04, y * 0.04, 4) * 0.8 + nz.n2(x * 0.3, y * 0.3) * 0.2));
        for (let i = 0; i < 320; i++) { const p = onPath(0.95); dot(c, p[0], p[1], 0.8 + r() * 1.5, U.pick(r, ['#e2d3b8', '#d6c4a4', '#cbb994', '#efe3cc'])); }
        c.save(); c.strokeStyle = 'rgba(80,60,35,0.3)'; c.lineWidth = 5; c.stroke(region); c.restore();
      },
      dirt(c) {
        // overgrown: long grass, buttercups and daisies over pale earth
        const base = ramp(['#a8925f', '#b9a26f', '#c7b280']);
        field(c, 0, 0, W, H, 3, (x, y) => base(nz.fbm(x * 0.03 + 5, y * 0.03, 3)));
        const cols = ['#4d8a34', '#62a042', '#7bb553', '#94c562', '#a8c463', '#6f9a3c'], items = [];
        for (let i = 0; i < 6200; i++) {
          const [x, y] = onPath(1.15), l = 6 + r() * 9, lean = (r() - 0.5) * 8;
          items.push({ x0: x, y0: y, cx: x + lean * 0.3, cy: y - l * 0.6, x1: x + lean, y1: y - l, col: U.pick(r, cols), w: 1.2 + r() * 0.6 });
        }
        strokesByColour(c, items, 1.4);
        for (let i = 0; i < 140; i++) {
          const [x, y] = onPath(1);
          if (r() < 0.65) { dot(c, x, y, 2.7, '#f2c230'); dot(c, x - 0.5, y - 0.5, 1.4, '#fbe27a'); }
          else {
            c.fillStyle = '#ffffff';
            for (let k = 0; k < 7; k++) { const a = (k / 7) * 6.283; c.beginPath(); c.ellipse(x + Math.cos(a) * 2.2, y + Math.sin(a) * 2.2, 1.6, 0.9, a, 0, 7); c.fill(); }
            dot(c, x, y, 1.3, '#f2c230');
          }
        }
      },
      // paw prints along the way, a line for every dog on the lead
      stamp(c, x, y, a, t, paint, isHelper) {
        if (isHelper) return;
        if (last) { const d = Math.hypot(x - last.x, y - last.y); acc = d > 40 ? 0 : acc + d; }
        last = { x, y };
        if (acc < 13) return;
        acc = 0; side = -side;
        const reach = t.shape === 'rect' ? t.w / 2 : t.r;
        const lanes = Math.max(1, Math.min(4, Math.round(reach / 8))), span = reach * 1.1;
        const nx = -Math.sin(a), ny = Math.cos(a);
        for (let i = 0; i < lanes; i++) {
          const o = (lanes === 1 ? 0 : -span / 2 + (span * i) / (lanes - 1)) + side * 3.5;
          paw(c, x + nx * o, y + ny * o, a, 4.2, 'rgba(92,62,32,0.62)');
        }
      },
    };
  }

  // ------------------------------------------------------------------- CAT
  // A big fluffy cat asleep in a basket, all matted, with burrs and bits of
  // leaf in its fur. Brushing makes it sleek and glossy again.
  const CATS = [
    { fur: '#e39a52', light: '#f8c88e', dark: '#b8692e', stripes: true },
    { fur: '#9ba5af', light: '#cdd4da', dark: '#6c7782', stripes: true },
    { fur: '#2e2b2d', light: '#5a555c', dark: '#1a181a', bib: '#f7f3ec' },
    { fur: '#f7f1e7', light: '#ffffff', dark: '#ddd3c4', patches: ['#e39a52', '#3a3335'] },
  ];
  // make a polygon wind the same way as canvas arcs, so 'nonzero' adds shapes up
  function clockwise(pts) {
    let a = 0;
    for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; }
    return a < 0 ? pts.slice().reverse() : pts;
  }
  function poly(p, pts) { p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); }
  function burr(c, x, y, s) {
    c.strokeStyle = '#5d7a2e'; c.lineWidth = 1;
    for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; c.beginPath(); c.moveTo(x + Math.cos(a) * s * 0.6, y + Math.sin(a) * s * 0.6); c.lineTo(x + Math.cos(a) * s * 1.4, y + Math.sin(a) * s * 1.4); c.stroke(); }
    dot(c, x, y, s, '#6f8f37'); dot(c, x - s * 0.3, y - s * 0.3, s * 0.4, '#9cb85a');
  }
  function cat(S) {
    const { r, nz, bleed } = S;
    const coat = CATS[(r() * CATS.length) | 0];
    const dark = U.lum(coat.fur) < 0.3;
    const body = { x: 204, y: 314, rx: 110, ry: 84 }, head = { x: 112, y: 396, r: 52 };
    const ears = [-2.15, -0.95].map((a) => clockwise([
      [head.x + Math.cos(a - 0.36) * head.r * 0.92, head.y + Math.sin(a - 0.36) * head.r * 0.92],
      [head.x + Math.cos(a) * head.r * 1.48, head.y + Math.sin(a) * head.r * 1.48],
      [head.x + Math.cos(a + 0.36) * head.r * 0.92, head.y + Math.sin(a + 0.36) * head.r * 0.92],
    ]));
    // the tail curls round the front of the body and ends by the face
    const t0 = 0.3, t1 = 2.05, tw = (th) => U.lerp(34, 20, (th - t0) / (t1 - t0));
    const tailAt = (th, off) => [body.x + (body.rx + 4 + off) * Math.cos(th), body.y + (body.ry + 8 + off) * Math.sin(th)];
    const outer = [], inner = [];
    for (let i = 0; i <= 24; i++) { const th = U.lerp(t0, t1, i / 24); outer.push(tailAt(th, tw(th) / 2)); inner.push(tailAt(th, -tw(th) / 2)); }
    const tail = clockwise(outer.concat(inner.reverse())), tip = tailAt(t1, 0);
    const region = new Path2D();
    region.ellipse(body.x, body.y, body.rx, body.ry, 0, 0, Math.PI * 2);
    region.moveTo(head.x + head.r, head.y); region.arc(head.x, head.y, head.r, 0, Math.PI * 2);
    for (const e of ears) poly(region, e);
    poly(region, tail);
    region.moveTo(tip[0] + tw(t1) / 2, tip[1]); region.arc(tip[0], tip[1], tw(t1) / 2, 0, Math.PI * 2);
    const hit = U.canvas(1, 1).getContext('2d');
    const inCat = (x, y) => hit.isPointInPath(region, x, y, 'nonzero');
    const fur = [];
    for (let i = 0; i < 2400 && fur.length < 1300; i++) {
      const x = 40 + r() * 300, y = 210 + r() * 260;
      if (!inCat(x, y)) continue;
      const onHead = Math.hypot(x - head.x, y - head.y) < head.r + 2;
      const a = onHead ? Math.atan2(y - head.y, x - head.x) + (r() - 0.5) * 0.5 : Math.atan2(y - body.y, x - body.x) + Math.PI / 2 + (r() - 0.5) * 0.6;
      fur.push({ x, y, a, l: 5 + r() * 5, c: r() < 0.5 ? coat.dark : coat.light });
    }
    return {
      family: 'brush', particle: 'dust', region, depth: true, fillRule: 'nonzero', indoor: true,
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        boards(c, r, nz, x0, y0, x1, y1, 30, ['#b98a5e', '#c69868', '#d2a676', '#dcb382']);
        // a round rag rug, the wicker basket and a cushion with spots
        const rings = ['#c9b8e0', '#efb4ae', '#a6d3d4', '#f2d88a', '#c9b8e0', '#efb4ae'];
        rings.forEach((col, k) => dot(c, 186, 336, 216 - k * 10, col));
        c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 1;
        for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(186, 336, 211 - k * 10, 0, 7); c.stroke(); }
        const bp = new Path2D(); bp.arc(186, 334, 172, 0, 7);
        softShadow(c, bp, 14, 0.45, 3, 8);
        dot(c, 186, 334, 172, '#a77b4f');
        for (const [rad, off] of [[155, 0], [163, 0.045], [170, 0]]) {
          for (let i = 0; i < 72; i++) { const a = (i / 72) * 6.283 + off; c.strokeStyle = i % 2 ? '#c99a62' : '#8a613b'; c.lineWidth = 6; c.beginPath(); c.arc(186, 334, rad, a, a + 0.07); c.stroke(); }
        }
        dot(c, 186, 334, 150, '#bcd0e6');
        for (let y = 196; y < 480; y += 22) for (let x = 48 + ((y / 22) % 2) * 11; x < 330; x += 22) if (Math.hypot(x - 186, y - 334) < 140) dot(c, x, y, 3, 'rgba(255,255,255,0.75)');
        const cg = c.createRadialGradient(186, 334, 100, 186, 334, 150);
        cg.addColorStop(0, 'rgba(60,70,100,0)'); cg.addColorStop(1, 'rgba(60,70,100,0.25)');
        c.fillStyle = cg; c.beginPath(); c.arc(186, 334, 150, 0, 7); c.fill();
        // a ball of wool, and its loose end wandering off
        c.strokeStyle = '#ef8aa6'; c.lineWidth = 2; c.beginPath(); c.moveTo(310, 540); c.bezierCurveTo(280, 570, 250, 520, 220, 560); c.stroke();
        dot(c, 318, 532, 17, '#ef8aa6'); c.strokeStyle = '#d96a8a'; c.lineWidth = 1.4;
        for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(318 + (i - 1.5) * 3, 532, 14 - i * 2, -1.2 + i * 0.3, 1.6 + i * 0.3); c.stroke(); }
      },
      clean(c) {
        const g = c.createRadialGradient(150, 260, 20, 190, 340, 240);
        g.addColorStop(0, coat.light); g.addColorStop(0.5, coat.fur); g.addColorStop(1, coat.dark);
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        c.lineCap = 'round';
        if (coat.stripes) {
          // tabby stripes across the back and rings round the tail, an M on the forehead
          c.strokeStyle = U.rgba(coat.dark, 0.5);
          for (let a = -Math.PI; a < Math.PI; a += 0.34) {
            const ex = body.x + Math.cos(a) * body.rx, ey = body.y + Math.sin(a) * body.ry;
            c.lineWidth = 7 + r() * 4; c.beginPath(); c.moveTo(body.x + Math.cos(a) * 40, body.y + Math.sin(a) * 30); c.quadraticCurveTo(body.x + Math.cos(a + 0.12) * body.rx * 0.7, body.y + Math.sin(a + 0.12) * body.ry * 0.7, ex, ey); c.stroke();
          }
          for (let th = t0 + 0.12; th < t1; th += 0.2) { const p0 = tailAt(th, -tw(th) / 2), p1 = tailAt(th, tw(th) / 2); c.lineWidth = 6; c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke(); }
          c.lineWidth = 4;
          for (const dx of [-12, 0, 12]) { c.beginPath(); c.moveTo(head.x + dx, head.y - 44); c.lineTo(head.x + dx * 0.8, head.y - 24); c.stroke(); }
        }
        if (coat.patches) {
          coat.patches.forEach((col, i) => {
            for (let k = 0; k < 3; k++) {
              const p = new Path2D(); SCENES.blob(p, 120 + r() * 200, 250 + r() * 160, 26 + r() * 24, 20 + r() * 18, r, 0.25, 12);
              c.fillStyle = col; c.fill(p);
            }
            if (i === 0) { c.fillStyle = col; c.beginPath(); c.arc(head.x - 22, head.y - 22, 26, 0, 7); c.fill(); }
          });
        }
        if (coat.bib) {
          // a white chin and chest, and a white tip to the tail
          c.fillStyle = coat.bib; c.beginPath(); c.ellipse(head.x + 2, head.y + 22, 30, 26, 0, 0, 7); c.fill();
          c.beginPath(); c.arc(tip[0], tip[1], 16, 0, 7); c.fill();
        }
        for (const f of fur) { c.strokeStyle = f.c; c.lineWidth = 1.3; c.beginPath(); c.moveTo(f.x, f.y); c.quadraticCurveTo(f.x + Math.cos(f.a + 0.5) * f.l * 0.5, f.y + Math.sin(f.a + 0.5) * f.l * 0.5, f.x + Math.cos(f.a) * f.l, f.y + Math.sin(f.a) * f.l); c.stroke(); }
        // the gloss of a well-brushed coat
        c.fillStyle = 'rgba(255,255,255,0.2)'; c.beginPath(); c.ellipse(200, 268, 78, 22, -0.15, 0, 7); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.14)'; c.beginPath(); c.ellipse(100, 370, 22, 12, -0.6, 0, 7); c.fill();
      },
      dirt(c) {
        const g = ramp([U.shade(coat.dark, -0.15), U.mix(coat.fur, '#7a6a58', 0.45), U.mix(coat.fur, '#8a7a66', 0.3)]);
        field(c, 0, 0, W, H, 3, (x, y) => [...g(nz.fbm(x * 0.035, y * 0.035, 4)), 205 + nz.n2(x * 0.09, y * 0.09) * 50]);
        // matted clumps and tangles
        for (let i = 0; i < 90; i++) {
          const x = 50 + r() * 290, y = 220 + r() * 240;
          c.fillStyle = U.rgba(U.shade(coat.dark, -0.3), 0.45); c.beginPath(); c.ellipse(x, y, 7 + r() * 12, 5 + r() * 8, r() * 3, 0, 7); c.fill();
        }
        c.strokeStyle = U.rgba(U.shade(coat.dark, -0.35), 0.6); c.lineWidth = 1;
        for (let i = 0; i < 90; i++) {
          let x = 50 + r() * 290, y = 220 + r() * 240;
          c.beginPath(); c.moveTo(x, y);
          for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 12; y += (r() - 0.5) * 12; c.lineTo(x, y); }
          c.stroke();
        }
        // fluff, burrs and bits of leaf
        for (let i = 0; i < 30; i++) {
          const x = 60 + r() * 270, y = 230 + r() * 220;
          for (let k = 0; k < 5; k++) dot(c, x + (r() - 0.5) * 12, y + (r() - 0.5) * 9, 3 + r() * 3, `rgba(${dark ? '200,195,190' : '235,230,222'},0.7)`);
        }
        for (let i = 0; i < 22; i++) burr(c, 60 + r() * 270, 230 + r() * 220, 3.2 + r() * 1.5);
        for (let i = 0; i < 16; i++) { c.save(); c.translate(60 + r() * 270, 230 + r() * 220); c.rotate(r() * 6.28); c.fillStyle = U.pick(r, ['#c4762f', '#9c5a2a', '#d9a23c', '#7d8a3a']); c.beginPath(); c.ellipse(0, 0, 6, 3, 0, 0, 7); c.fill(); c.restore(); }
      },
      top(c) {
        const ink = dark ? '#e9dfd0' : '#3a2a22';
        // pink inside the ears
        for (const e of ears) {
          const mx = (e[0][0] + e[1][0] + e[2][0]) / 3, my = (e[0][1] + e[1][1] + e[2][1]) / 3;
          c.fillStyle = '#f2b0b5'; c.beginPath();
          e.forEach(([x, y], i) => { const px = mx + (x - mx) * 0.55, py = my + (y - my) * 0.55 + 3; if (i) c.lineTo(px, py); else c.moveTo(px, py); });
          c.closePath(); c.fill();
        }
        // a soft line where the tail lies along the body
        c.strokeStyle = 'rgba(40,25,15,0.18)'; c.lineWidth = 3; c.lineCap = 'round';
        c.beginPath(); inner.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
        c.beginPath(); c.arc(head.x, head.y, head.r - 1, -1.2, 0.5); c.stroke();
        // sleeping eyes, a pink nose, a little mouth, whiskers and rosy cheeks
        const { x: hx, y: hy } = head;
        dot(c, hx - 30, hy + 14, 7, 'rgba(239,138,166,0.32)'); dot(c, hx + 30, hy + 14, 7, 'rgba(239,138,166,0.32)');
        c.strokeStyle = ink; c.lineWidth = 3.4;
        for (const ex of [-19, 19]) { c.beginPath(); c.arc(hx + ex, hy - 6, 9, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke(); }
        c.fillStyle = '#e98a9a'; c.beginPath(); c.moveTo(hx - 5.5, hy + 7); c.lineTo(hx + 5.5, hy + 7); c.lineTo(hx, hy + 13); c.closePath(); c.fill();
        c.lineWidth = 1.8; c.beginPath(); c.arc(hx - 4, hy + 14, 4, 0.1, Math.PI - 0.1); c.stroke(); c.beginPath(); c.arc(hx + 4, hy + 14, 4, 0.1, Math.PI - 0.1); c.stroke();
        c.strokeStyle = dark ? 'rgba(255,255,255,0.85)' : 'rgba(90,70,60,0.6)'; c.lineWidth = 1;
        for (const sgn of [-1, 1]) for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(hx + sgn * 15, hy + 10 + k * 3.5); c.lineTo(hx + sgn * 46, hy + 4 + k * 7); c.stroke(); }
      },
      liveTop(c, t) {
        // z z z, drifting up from a very sound sleep
        c.fillStyle = 'rgba(80,100,150,0.8)'; c.textAlign = 'center'; c.textBaseline = 'middle';
        for (let i = 0; i < 3; i++) {
          const life = (t * 0.28 + i / 3) % 1;
          c.globalAlpha = Math.sin(life * Math.PI);
          c.font = `800 ${10 + life * 9}px ${FONT}`;
          c.fillText('z', head.x - 34 - life * 26 + Math.sin(life * 6 + i) * 4, head.y - 74 - life * 52);
        }
        c.globalAlpha = 1;
      },
    };
  }

  // ----------------------------------------------------------------- HUTCH
  // Inside the rabbits' pen: out with the old flattened straw, in with
  // fresh golden straw, while three rabbits watch from their corners.
  function straw(c, r, x0, y0, x1, y1, n, cols, flat) {
    const items = [];
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), l = 6 + r() * 11;
      const a = flat ? (r() - 0.5) * 0.9 + (r() < 0.5 ? 0 : Math.PI) : r() * Math.PI * 2;
      items.push({ x0: x, y0: y, cx: x + Math.cos(a + 0.3) * l * 0.5, cy: y + Math.sin(a + 0.3) * l * 0.5, x1: x + Math.cos(a) * l, y1: y + Math.sin(a) * l, col: U.pick(r, cols), w: 1.2 + r() * 0.7 });
    }
    strokesByColour(c, items, 1.4);
  }
  // still = the copy in the top layer; the live one twitches its nose and blinks
  function drawRabbit(c, b, t, i, still) {
    const twitch = !still && Math.sin(t * 24 + i) > 0 && (t + i * 1.3) % 3 < 1.2 ? 0.8 : 0;
    const blink = !still && (t + i * 1.7) % 4.1 < 0.13;
    c.save(); c.translate(b.x, b.y); c.scale(b.s, b.s);
    if (!b.peek) {
      if (still) { c.fillStyle = 'rgba(60,45,25,0.25)'; c.beginPath(); c.ellipse(3, 22, 22, 8, 0, 0, 7); c.fill(); }
      dot(c, 0, 6, 19, b.col);
      if (b.patch) { c.fillStyle = b.patch; c.beginPath(); c.ellipse(7, 10, 9, 7, 0.4, 0, 7); c.fill(); }
      c.fillStyle = U.shade(b.col, -0.12); c.beginPath(); c.ellipse(-8, 22, 6, 4, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(8, 22, 6, 4, 0, 0, 7); c.fill();
    }
    for (const [ex, rot] of [[-5, -0.2], [5, 0.2]]) {
      c.save(); c.translate(ex, -20); c.rotate(rot);
      c.fillStyle = b.col; c.beginPath(); c.ellipse(0, -11, 4.6, 12, 0, 0, 7); c.fill();
      c.fillStyle = '#f2b5b5'; c.beginPath(); c.ellipse(0, -10, 2.2, 8, 0, 0, 7); c.fill();
      c.restore();
    }
    dot(c, 0, -13, 13, b.col);
    if (b.patch) { c.fillStyle = b.patch; c.beginPath(); c.ellipse(-5, -17, 5, 4, 0, 0, 7); c.fill(); }
    if (blink) { c.strokeStyle = '#2b2422'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-7, -15); c.lineTo(-3, -15); c.moveTo(3, -15); c.lineTo(7, -15); c.stroke(); }
    else { dot(c, -5, -15, 2.2, '#2b2422'); dot(c, 5, -15, 2.2, '#2b2422'); dot(c, -4.4, -15.7, 0.8, '#ffffff'); dot(c, 5.6, -15.7, 0.8, '#ffffff'); }
    dot(c, -8, -9, 3, 'rgba(239,138,166,0.3)'); dot(c, 8, -9, 3, 'rgba(239,138,166,0.3)');
    c.fillStyle = '#e98a9a'; c.beginPath(); c.ellipse(0, -9 - twitch, 2.2, 1.6, 0, 0, 7); c.fill();
    c.restore();
  }
  function hutch(S) {
    const { r, nz, bleed } = S;
    const fx0 = 40, fy0 = 112, fx1 = 320, fy1 = 540;
    const box = { x: 46, y: 118, w: 92, h: 72 }, dish = { x: 252, y: 494, r: 22 };
    const buns = [
      { x: 286, y: 184, col: '#b9a189', s: 1 },
      { x: 88, y: 486, col: '#f7f3ec', patch: '#8a6a4a', s: 1.05 },
      { x: 92, y: 182, col: '#6e5a48', s: 0.62, peek: true },
    ];
    function freshStraw(c) {
      const g = ramp(['#d9b54e', '#e6c463', '#f0d47a', '#f6e29b']);
      field(c, fx0, fy0, fx1, fy1, 3, (x, y) => g(nz.fbm(x * 0.04 + 3, y * 0.04, 4)));
      c.save(); c.beginPath(); c.rect(fx0, fy0, fx1 - fx0, fy1 - fy0); c.clip();
      straw(c, r, fx0, fy0, fx1, fy1, 2800, ['#f5dc7a', '#e8c35a', '#d9ae45', '#fbe9a6', '#c99a3a'], false);
      c.restore();
    }
    const bunnies = (c, t, still) => buns.forEach((b, i) => {
      if (!b.peek) return drawRabbit(c, b, t, i, still);
      // the third one peeks out of the hide box door
      const dx = box.x + box.w / 2, dy = box.y + box.h;
      c.save(); c.beginPath(); c.moveTo(dx - 15, dy); c.lineTo(dx - 15, dy - 12); c.arc(dx, dy - 12, 15, Math.PI, 0); c.lineTo(dx + 15, dy); c.closePath(); c.clip();
      drawRabbit(c, b, t, i, still);
      c.restore();
    });
    const region = new Path2D();
    region.rect(fx0, fy0, fx1 - fx0, fy1 - fy0);
    region.rect(box.x, box.y, box.w, box.h);
    circle(region, buns[0].x, buns[0].y, 30); circle(region, buns[1].x, buns[1].y, 32); circle(region, dish.x, dish.y, dish.r + 4);
    return {
      family: 'muck', particle: 'chips', region, depth: true, indoor: true,
      decor(c) {
        const { x0, y0, x1, y1 } = bleed;
        // the barn floor round the pen, then the pen's wooden walls
        boards(c, r, nz, x0, y0, x1, y1, 36, ['#8d6a4a', '#9a7754', '#a6835e', '#b18f69']);
        const wall = new Path2D(); wall.rect(fx0 - 18, fy0 - 18, fx1 - fx0 + 36, fy1 - fy0 + 36);
        softShadow(c, wall, 12, 0.45, 3, 7);
        c.fillStyle = '#c9a06a'; c.fill(wall);
        c.fillStyle = 'rgba(90,60,30,0.35)';
        for (let x = fx0 - 18; x < fx1 + 18; x += 26) { c.fillRect(x, fy0 - 18, 1.5, 18); c.fillRect(x, fy1, 1.5, 18); }
        for (let y = fy0 - 18; y < fy1 + 18; y += 26) { c.fillRect(fx0 - 18, y, 18, 1.5); c.fillRect(fx1, y, 18, 1.5); }
        c.fillStyle = 'rgba(255,240,210,0.25)'; c.fillRect(fx0 - 18, fy0 - 18, fx1 - fx0 + 36, 3);
        // the rabbits' own corners stay fresh and cosy
        freshStraw(c);
        // a hay rack on the left wall
        c.fillStyle = '#7a5a3a'; c.fillRect(fx0 - 16, 300, 14, 90);
        straw(c, r, fx0 - 22, 300, fx0 - 2, 390, 90, ['#e8c35a', '#d9ae45', '#c9a24a', '#a8c463'], false);
      },
      clean: freshStraw,
      dirt(c) {
        const g = ramp(['#7d705c', '#928469', '#a69678', '#b5a585']);
        field(c, fx0 - 4, fy0 - 4, fx1 + 4, fy1 + 4, 3, (x, y) => [...g(nz.fbm(x * 0.03, y * 0.03, 4)), 238]);
        straw(c, r, fx0, fy0, fx1, fy1, 1900, ['#8f8068', '#a3937a', '#7a6c58', '#b3a386', '#6f624f'], true);
        for (let i = 0; i < 16; i++) { c.fillStyle = 'rgba(70,60,45,0.3)'; c.beginPath(); c.ellipse(fx0 + r() * (fx1 - fx0), fy0 + r() * (fy1 - fy0), 10 + r() * 16, 6 + r() * 9, r() * 3, 0, 7); c.fill(); }
        // nibbled carrot tops
        for (let i = 0; i < 14; i++) {
          const x = fx0 + 16 + r() * (fx1 - fx0 - 32), y = fy0 + 16 + r() * (fy1 - fy0 - 32), a = r() * 6.28;
          c.save(); c.translate(x, y); c.rotate(a);
          c.fillStyle = '#e8873a'; rect(c, -4, -3, 9, 6, 3); c.fill();
          for (let k = -1; k <= 1; k++) { c.fillStyle = U.pick(r, ['#5c9a3a', '#7bb553', '#4f8a34']); c.beginPath(); c.ellipse(-9, k * 3.5, 6, 2.2, k * 0.4, 0, 7); c.fill(); }
          c.restore();
        }
      },
      top(c) {
        // shade along the inside of the walls
        const sh = (x, y, w, h, gx0, gy0, gx1, gy1) => { const g = c.createLinearGradient(gx0, gy0, gx1, gy1); g.addColorStop(0, 'rgba(40,25,10,0.3)'); g.addColorStop(1, 'rgba(40,25,10,0)'); c.fillStyle = g; c.fillRect(x, y, w, h); };
        sh(fx0, fy0, fx1 - fx0, 14, 0, fy0, 0, fy0 + 14); sh(fx0, fy0, 12, fy1 - fy0, fx0, 0, fx0 + 12, 0);
        sh(fx1 - 8, fy0, 8, fy1 - fy0, fx1, 0, fx1 - 8, 0);
        // the hide box: a plank roof and a front with a round door
        const bp = new Path2D(); bp.rect(box.x, box.y, box.w, box.h);
        softShadow(c, bp, 8, 0.4, 3, 5);
        c.fillStyle = '#b8895a'; rect(c, box.x, box.y, box.w, box.h - 26, 4); c.fill();
        c.fillStyle = 'rgba(90,60,30,0.35)'; for (let x = box.x + 18; x < box.x + box.w; x += 18) c.fillRect(x, box.y, 1.5, box.h - 26);
        c.fillStyle = '#93693f'; c.fillRect(box.x, box.y + box.h - 26, box.w, 26);
        c.fillStyle = '#3a2618'; c.beginPath(); c.moveTo(box.x + box.w / 2 - 15, box.y + box.h); c.lineTo(box.x + box.w / 2 - 15, box.y + box.h - 12); c.arc(box.x + box.w / 2, box.y + box.h - 12, 15, Math.PI, 0); c.lineTo(box.x + box.w / 2 + 15, box.y + box.h); c.closePath(); c.fill();
        // a water bottle on the top wall, the spout over the grey rabbit
        c.fillStyle = 'rgba(200,230,245,0.85)'; rect(c, 278, 96, 16, 46, 5); c.fill();
        c.fillStyle = 'rgba(80,160,210,0.7)'; rect(c, 280, 112, 12, 28, 4); c.fill();
        c.fillStyle = '#e2574c'; rect(c, 277, 92, 18, 6, 2); c.fill();
        c.strokeStyle = '#9aa3ad'; c.lineWidth = 3; c.beginPath(); c.moveTo(286, 142); c.lineTo(286, 156); c.stroke();
        // a dish of pellets with a carrot
        dot(c, dish.x + 2, dish.y + 3, dish.r + 2, 'rgba(40,30,20,0.25)');
        dot(c, dish.x, dish.y, dish.r, '#e98a6e'); dot(c, dish.x, dish.y, dish.r - 5, '#f4ecdc');
        for (let i = 0; i < 26; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * (dish.r - 8); dot(c, dish.x + Math.cos(a) * d, dish.y + Math.sin(a) * d, 2, U.pick(r, ['#8a9a4a', '#a3a35a', '#7a7a3a'])); }
        c.save(); c.translate(dish.x + 4, dish.y - 2); c.rotate(-0.5);
        c.fillStyle = '#e8873a'; c.beginPath(); c.moveTo(-12, -3.5); c.lineTo(10, 0); c.lineTo(-12, 3.5); c.closePath(); c.fill();
        c.fillStyle = '#5c9a3a'; c.beginPath(); c.ellipse(-16, -2, 5, 2, -0.4, 0, 7); c.fill(); c.beginPath(); c.ellipse(-16, 2, 5, 2, 0.4, 0, 7); c.fill();
        c.restore();
        bunnies(c, 0, true);
      },
      liveTop(c, t) { bunnies(c, t, false); },
    };
  }

  Object.assign(SCENES.KINDS, { coffee, serve, seal, bowls, walk, cat, hutch });
})();
