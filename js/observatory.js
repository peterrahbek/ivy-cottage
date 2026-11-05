'use strict';
// Owl Hill Observatory, drawn as SVG the same way as the cottage (house.js) and
// the painter's loft (loft.js). A little Victorian observatory alone on a hill
// under a big sky: a round stone drum under a copper dome, a brass telescope
// looking out of the open slit, a low map room with star charts on its wall and
// a jigsaw on its table, wooden steps up to a gallery round the dome, a stone
// bench under the old oak, wild thyme on the slope and a path winding up the
// hill. The copper starts green and tarnished and ends warm, with a little
// verdigris left in the seams. Each restorable part has a tired look and a
// restored look; the door and the sign take the colours chosen while painting.
// The evening is this place's signature: many stars over the dome, the moon at
// the end of the telescope, and warm light in the slit, the map room and the
// lantern.
// Every id carries an 'o' prefix (plus opts.uid when given) so this picture can
// share a page with the others.

const OBSERVATORY = (() => {
  const VB = { w: 400, h: 540 };
  const FONT = "ui-rounded,'SF Pro Rounded',system-ui,sans-serif";
  const SERIF = "Georgia,'Times New Roman',serif";

  // set at the start of every render: the season, which parts have a seasonal
  // job waiting (part -> 'grow' | 'leaves' | 'snow' | 'frost'), the id suffix,
  // whether the place is still for sale, how far along it is, and the colours
  // worked out from all that
  let SEASON = 'spring', PEND = {}, UID = '', FORSALE = false, PCT = 0, K = {}, NIGHT = false;
  const id = (n) => `o${n}${UID}`;
  const url = (n) => `url(#${id(n)})`;
  const pend = (st, p) => (st[p] ? PEND[p] : undefined);
  const f1 = (v) => +(+v).toFixed(1);
  const SNOW = '#f4f8fb';
  const FADE = '#cfc6b6';
  const winter = () => SEASON === 'winter';
  const dot = (x, y, r, col, op = 1) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const oval = (x, y, rx, ry, col, op = 1) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const box = (x, y, w, h, col, more = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${col}"${more}/>`;
  const shadow = (x, y, rx, ry = 2.4) => oval(x, y, rx, ry, '#00000022');
  const line = (d, col, w = 1, op = 1) => `<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const text = (x, y, s, size, col, more = '') => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="middle" font-family="${FONT}" font-size="${size}" font-weight="900" fill="${col}"${more}>${s}</text>`;
  const LEAFC = ['#d9822b', '#c4462f', '#e9b23c', '#9c5a2a'];
  // many small marks of one colour as a single path, which keeps the picture
  // small: specks are round-capped strokes of one size, ovals are pairs of arcs
  const specks = (list, col, size, op = 1) => (list.length ? `<path d="${list.map(([x, y]) => `M${f1(x)} ${f1(y)}h.01`).join('')}" stroke="${col}" stroke-width="${size}" stroke-linecap="round"${op < 1 ? ` opacity="${op}"` : ''}/>` : '');
  const grit = (list, col, size, op = 1) => (list.length ? `<path d="${list.map(([x, y]) => `M${Math.round(x)} ${Math.round(y)}h.01`).join('')}" stroke="${col}" stroke-width="${size}" stroke-linecap="round"${op < 1 ? ` opacity="${op}"` : ''}/>` : '');
  const ovals = (list, col, op = 1) => (list.length ? `<path d="${list.map(([x, y, rx, ry = rx]) => `M${f1(x - rx)} ${f1(y)}a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(rx * 2)} 0a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(-rx * 2)} 0`).join('')}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>` : '');

  const SKY = {
    spring: ['#a9c8ea', '#dbe6f2', '#f8efe0'], summer: ['#8fbfe8', '#d6e9f4', '#fbf0d8'],
    autumn: ['#b4b4dc', '#ecd8cb', '#f6e0c0'], winter: ['#aebcdc', '#dbe3ef', '#f2f1f3'],
  };
  // far ridges, the fields before them, and the hill itself from crown to foot
  const FAR = {
    spring: ['#b7c4e6', '#a3c0ba', '#a9c994'], summer: ['#a9bbe4', '#92b6a8', '#93bb7e'],
    autumn: ['#c2b8da', '#c2ae92', '#cda96c'], winter: ['#c6d0e6', '#d6dfec', '#e4ebf2'],
  };
  const HILL = {
    spring: ['#c8dfa6', '#acd08a', '#8fbb70'], summer: ['#bcd98e', '#98c272', '#7cab5a'],
    autumn: ['#dfc888', '#cdaa64', '#b08e4e'], winter: ['#f0f4f9', '#e3ebf3', '#d3deeb'],
  };
  const OAK = {
    spring: ['#a7cf7c', '#bcdc8e', '#8fbd68'], summer: ['#4f8d46', '#62a052', '#3e7a3c'],
    autumn: ['#c9762a', '#d98c32', '#ad5c2a'], winter: null,
  };
  const PEBBLE = { spring: ['#e0d4bc', '#cfc2a8'], summer: ['#e6dac0', '#d6c9ac'], autumn: ['#d2c4a8', '#c0b296'], winter: ['#dfe4ea', '#cfd6de'] };

  // ---------------------------------------------------------------- shapes
  const rad = (d) => (d * Math.PI) / 180;
  // the middle of the drum and the dome
  const CX = 176;
  const DRUM = { r: 72, y0: 232, y1: 358 };
  const DOME = { rx: 80, ry: 86, y: 232, t: 0.072 };
  // eye level is about the middle of the door: courses above it curve up, those
  // below it curve down, which is most of what makes the drum look round
  const sag = (y) => (300 - y) * 0.09;
  const arcY = (y, x, r = DRUM.r) => { const t = (x - CX + r) / (2 * r); return y - 4 * sag(y) * t * (1 - t); };
  const arc = (y, r = DRUM.r) => `M${CX - r} ${f1(y)} Q${CX} ${f1(y - 2 * sag(y))} ${CX + r} ${f1(y)}`;
  const band = (y0, y1, r = DRUM.r) => `M${CX - r} ${f1(y0)} Q${CX} ${f1(y0 - 2 * sag(y0))} ${CX + r} ${f1(y0)} V${f1(y1)} Q${CX} ${f1(y1 - 2 * sag(y1))} ${CX - r} ${f1(y1)}Z`;
  // a point on the dome: th up from the base, ph round from the front
  const domePt = (th, ph) => {
    const a = rad(th), b = rad(ph);
    return [CX + DOME.rx * Math.cos(a) * Math.sin(b), DOME.y - DOME.ry * Math.sin(a) - DOME.t * DOME.ry * Math.cos(a) * Math.cos(b)];
  };
  const poly = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`).join('');
  // a smooth line through a few points
  const curve = (pts) => {
    let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
    for (let i = 1; i < pts.length - 1; i++) d += `Q${f1(pts[i][0])} ${f1(pts[i][1])} ${f1((pts[i][0] + pts[i + 1][0]) / 2)} ${f1((pts[i][1] + pts[i + 1][1]) / 2)}`;
    const z = pts[pts.length - 1];
    return `${d}L${f1(z[0])} ${f1(z[1])}`;
  };
  const steps = (a, z, n) => Array.from({ length: n + 1 }, (_, i) => a + ((z - a) * i) / n);
  const meridian = (ph, a = 1, z = 88) => curve(steps(a, z, 6).map((th) => domePt(th, ph)));
  const ringD = (th, a = -90, z = 90) => curve(steps(a, z, 8).map((ph) => domePt(th, ph)));
  const DOME_D = `M${CX - DOME.rx} ${DOME.y} A${DOME.rx} ${DOME.ry} 0 0 1 ${CX + DOME.rx} ${DOME.y} Q${CX} ${f1(DOME.y - 2 * DOME.t * DOME.ry)} ${CX - DOME.rx} ${DOME.y}Z`;
  // the open slit: a wedge between two meridians, rounded off near the top
  const SLIT = { a: 24, b: 54, th0: 7, th1: 74 };
  const SLIT_D = (() => {
    const up = steps(SLIT.th0, SLIT.th1, 9).map((th) => domePt(th, SLIT.a)), down = steps(SLIT.th1, SLIT.th0, 9).map((th) => domePt(th, SLIT.b));
    const [tx, ty] = domePt(SLIT.th1 + 5, (SLIT.a + SLIT.b) / 2);
    return `${poly(up)} Q${f1(tx)} ${f1(ty - 1)} ${f1(down[0][0])} ${f1(down[0][1])} ${poly(down.slice(1)).replace('M', 'L')}Z`;
  })();
  // the telescope: its foot in the slit, tilted up towards the moon. Everything
  // on it is drawn along x in a turned frame
  const SCOPE = { x: 217, y: 193, a: -48, len: 112 };
  const SCOPE_T = `translate(${SCOPE.x} ${SCOPE.y}) rotate(${SCOPE.a})`;
  const scopeTip = [SCOPE.x + SCOPE.len * Math.cos(rad(SCOPE.a)), SCOPE.y + SCOPE.len * Math.sin(rad(SCOPE.a))];
  // the hill: its crown, and the hilltop that takes the mower
  const CROWN = 'M-6 404 C40 390 84 358 176 348 C262 340 330 358 406 404';
  const HILL_D = `${CROWN} V545 H-6Z`;
  const TOP_D = `${CROWN} V456 C330 442 250 466 180 450 C110 438 50 456 -6 450Z`;
  // the wing that holds the map room, its window and what stands behind it
  const WING = { x0: 248, x1: 356, y0: 276, y1: 376 };
  const WIN = { x0: 258, x1: 348, y0: 284, y1: 346 };
  const BARX = [288, 318], BARY = 314;
  const ROOF_D = 'M244 252 H334 L366 280 H244Z';
  // the arched door, and the sign that hangs from the gallery above it
  const DOOR = { x0: 159, x1: 193, y0: 286, y1: 352, ay: 303 };
  const DOOR_D = `M${DOOR.x0} ${DOOR.y1} V${DOOR.ay} A17 17 0 0 1 ${DOOR.x1} ${DOOR.ay} V${DOOR.y1}Z`;
  const SIGNB = { x: 128, y: 251, w: 96, h: 27 };
  // the gallery round the foot of the dome, and the two flights of steps to it
  const GAL = { r: 90, y: 241 };
  const FLIGHT_UP = Array.from({ length: 6 }, (_, i) => ({ x: 76 - i * 6.8, y: 248 + i * 8.9 }));
  const FLIGHT_LOW = Array.from({ length: 6 }, (_, i) => ({ x: 48 + i * 7.6, y: 306 + i * 9.2 }));
  const LAND = { x0: 33, x1: 66, y: 296 };
  // the path up the hill: [x, y, half width], from the door down to the foot,
  // read with a Catmull-Rom curve so it can be followed at any point
  const WAY = [[176, 370, 7], [194, 386, 9], [236, 408, 11.5], [262, 438, 14.5], [232, 472, 19], [166, 504, 25], [112, 552, 34]];
  function wayAt(t) {
    const n = WAY.length - 1, f = U.clamp(t, 0, 0.9999) * n, i = f | 0, u = f - i;
    const p = (k) => WAY[U.clamp(k, 0, n)];
    const cr = (a, b, c, d) => 0.5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (3 * b - a - 3 * c + d) * u * u * u);
    return [0, 1, 2].map((k) => cr(p(i - 1)[k], p(i)[k], p(i + 1)[k], p(i + 2)[k]));
  }
  // the two edges of the path; where it runs sideways it looks thinner
  function wayEdge(t, side) {
    const [x, y, w] = wayAt(t), [x1, y1] = wayAt(Math.max(0, t - 0.012)), [x2, y2] = wayAt(Math.min(1, t + 0.012));
    const dx = x2 - x1, dy = y2 - y1, m = Math.hypot(dx, dy) || 1;
    return [x - (dy / m) * w * side, y + (dx / m) * w * 0.5 * side];
  }
  const WAY_D = (() => {
    const ts = steps(0, 1, 40);
    return `${poly(ts.map((t) => wayEdge(t, 1)))} ${poly(ts.slice().reverse().map((t) => wayEdge(t, -1))).replace('M', 'L')}Z`;
  })();
  // the old oak's crown, as blobs: x, y, r
  const CROWN_OAK = [[34, 226, 50], [-6, 246, 34], [84, 234, 36], [58, 186, 34], [8, 186, 32], [106, 262, 20], [34, 172, 26]];
  // the owl the stars make: joined on the board, and faint in the sky at night.
  // lines join points by number; the last two points are its eyes
  const OWL_PTS = [[24, 6], [50, 24], [76, 6], [86, 32], [66, 52], [50, 44], [34, 52], [14, 32], [90, 68], [62, 97], [38, 97], [10, 68], [36, 31], [64, 31]];
  const OWL_LINES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], [3, 8], [8, 9], [9, 10], [10, 11], [11, 7]];

  // little css of our own: grass and flowers in the breeze, a hopping bird,
  // butterflies, the anemometer, the vane, the hare's ears, fireflies and a
  // falling star now and then
  function style() {
    return `<style>@media (prefers-reduced-motion: no-preference){
      #scene .oh-sway{animation:ohsway 4.6s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}
      #scene .oh-sway:nth-of-type(2n){animation-delay:-2.1s}
      @keyframes ohsway{from{transform:rotate(-1.8deg)}to{transform:rotate(2.2deg)}}
      #scene .oh-hop{animation:ohhop 5.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes ohhop{0%,80%,100%{transform:translateY(0)}86%{transform:translateY(-3px)}92%{transform:translateY(0)}}
      #scene .oh-flit{animation:ohflit 5s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
      @keyframes ohflit{0%{transform:translate(0,0)}35%{transform:translate(6px,-5px)}70%{transform:translate(-4px,-8px)}100%{transform:translate(3px,2px)}}
      #scene .oh-wing{animation:ohwing .32s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
      @keyframes ohwing{to{transform:scaleX(.3)}}
      #scene .oh-spin{animation:ohspin 8s linear infinite;transform-box:fill-box;transform-origin:center}
      @keyframes ohspin{to{transform:rotate(360deg)}}
      #scene .oh-vane{animation:ohvane 13s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 50%}
      @keyframes ohvane{from{transform:scaleX(1)}45%{transform:scaleX(1)}55%{transform:scaleX(-1)}to{transform:scaleX(-1)}}
      #scene .oh-ears{animation:ohears 12s ease-in-out infinite;transform-box:fill-box;transform-origin:20% 100%}
      @keyframes ohears{0%,52%,100%{transform:rotate(-62deg)}60%,86%{transform:none}}
      #scene .oh-sniff{animation:ohsniff 12s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}
      @keyframes ohsniff{0%,52%,100%{transform:translateY(1.4px)}60%,86%{transform:none}}
      #scene .oh-fly{animation:ohfly 7s ease-in-out infinite alternate}
      #scene .oh-fly:nth-of-type(2n){animation-duration:9.5s;animation-delay:-3s}
      #scene .oh-fly:nth-of-type(3n){animation-duration:11s;animation-delay:-6s}
      @keyframes ohfly{0%{transform:translate(0,0);opacity:.2}40%{transform:translate(7px,-6px);opacity:1}70%{transform:translate(-4px,-11px);opacity:.5}100%{transform:translate(5px,3px);opacity:.9}}
      #scene .oh-fall{animation:ohfall 26s linear infinite}
      @keyframes ohfall{0%,91%{transform:translate(0,0);opacity:0}92%{opacity:1}96%{transform:translate(-92px,40px);opacity:0}100%{transform:translate(-92px,40px);opacity:0}}
    }</style>`;
  }

  function palette(C) {
    const k = (1 - PCT) * 0.35;
    K = {
      C,
      stone: U.mix('#e6dfd0', '#aeaa9e', k),
      deep: U.mix('#c9bfae', '#8f8c82', k),
      trim: U.mix('#3b4486', '#7c7f90', k * 1.5),
      sash: U.mix('#f7f2e6', '#b4b0a4', k * 1.4),
      timber: U.mix('#a9794a', '#7f7668', k * 1.4),
      slate: U.mix('#515c96', '#71757f', k * 1.3),
    };
  }

  function defs(st) {
    const pb = PEBBLE[SEASON], h = HILL[SEASON];
    const ashlar = (base, old) => `<rect width="42" height="22" fill="${base}"/>
        <rect x="1" y="1" width="19" height="9.4" fill="${U.shade(base, 0.07)}"/><rect x="21.6" y="1" width="19" height="9.4" fill="${U.shade(base, -0.04)}"/>
        <rect x="-10" y="12" width="19" height="9.4" fill="${U.shade(base, -0.02)}"/><rect x="10.6" y="12" width="19" height="9.4" fill="${U.shade(base, 0.05)}"/><rect x="31.2" y="12" width="19" height="9.4" fill="${U.shade(base, -0.05)}"/>
        <path d="M0 0.3 H42 M0 11.3 H42 M20.6 0.3 V11.3 M9.8 11.3 V22 M30.3 11.3 V22" stroke="${U.shade(base, -0.24)}" stroke-width="0.7" opacity="0.7"/>
        ${old ? '<circle cx="6" cy="10" r="2.2" fill="#6f8a3e" opacity="0.55"/><circle cx="33" cy="20" r="1.8" fill="#748f42" opacity="0.45"/>' : ''}`;
    const slate = (base, moss) => `<rect width="16" height="12" fill="${U.shade(base, -0.24)}"/>
        <rect x="0.4" y="0.4" width="7.2" height="5.2" rx="0.6" fill="${base}"/><rect x="8.4" y="0.4" width="7.2" height="5.2" rx="0.6" fill="${U.shade(base, 0.08)}"/>
        <rect x="-3.6" y="6.4" width="7.2" height="5.2" rx="0.6" fill="${U.shade(base, 0.04)}"/><rect x="4.4" y="6.4" width="7.2" height="5.2" rx="0.6" fill="${U.shade(base, -0.06)}"/><rect x="12.4" y="6.4" width="7.2" height="5.2" rx="0.6" fill="${U.shade(base, 0.04)}"/>
        ${moss ? '<circle cx="4" cy="5" r="2.4" fill="#6f8a3e" opacity="0.7"/><circle cx="12" cy="10" r="1.8" fill="#748f42" opacity="0.6"/>' : ''}`;
    // two small tiles of stars: dust all over the sky, and a thicker one for the milky way
    const tile = (seed, n, w, ht) => { const r = U.rng(seed), a = [], b = []; for (let i = 0; i < n; i++) (i % 3 ? a : b).push([r() * w, r() * ht]); return specks(a, '#fff', 0.8, 0.6) + specks(b, '#fff', 1.3, 0.85); };
    return `
    <defs>
      ${NIGHT ? `<linearGradient id="${id('Dusk')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#101850"/><stop offset="0.42" stop-color="#2a3796"/><stop offset="0.68" stop-color="#5a62bc"/><stop offset="0.86" stop-color="#b48fd2"/><stop offset="1" stop-color="#f4b8d6"/>
      </linearGradient>
      <linearGradient id="${id('SlitGlow')}" x1="0.7" y1="1" x2="0.3" y2="0">
        <stop offset="0" stop-color="#ffe9b0"/><stop offset="0.45" stop-color="#ffc471"/><stop offset="1" stop-color="#e58f56"/>
      </linearGradient>
      <radialGradient id="${id('Halo')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#fff6d8" stop-opacity="0.5"/><stop offset="0.4" stop-color="#cfd6ff" stop-opacity="0.16"/><stop offset="1" stop-color="#cfd6ff" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="${id('Milky')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#fff" stop-opacity="0.42"/><stop offset="0.55" stop-color="#dfe2ff" stop-opacity="0.16"/><stop offset="1" stop-color="#dfe2ff" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="${id('Mist')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#d9c6f2" stop-opacity="0.75"/><stop offset="1" stop-color="#d9c6f2" stop-opacity="0"/>
      </radialGradient>` : `<linearGradient id="${id('Sky' + SEASON)}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${SKY[SEASON][0]}"/><stop offset="0.72" stop-color="${SKY[SEASON][1]}"/><stop offset="1" stop-color="${SKY[SEASON][2]}"/>
      </linearGradient>
      <radialGradient id="${id('Sun')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#fff6cf"/><stop offset="0.45" stop-color="#fde7a3"/><stop offset="1" stop-color="#fde7a3" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="${id('Soft')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#fff8dc" stop-opacity="0.5"/><stop offset="1" stop-color="#fff8dc" stop-opacity="0"/>
      </radialGradient>`}
      <radialGradient id="${id('Glow')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#ffe2a0" stop-opacity="0.6"/><stop offset="0.45" stop-color="#ffd98a" stop-opacity="0.22"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${id('Hill' + SEASON)}" gradientUnits="userSpaceOnUse" x1="0" y1="344" x2="0" y2="545">
        <stop offset="0" stop-color="${h[0]}"/><stop offset="0.45" stop-color="${h[1]}"/><stop offset="1" stop-color="${h[2]}"/>
      </linearGradient>
      ${st.dome ? `<radialGradient id="${id('Copper')}" cx="0.34" cy="0.3" r="0.82">
        <stop offset="0" stop-color="#f6bd8a"/><stop offset="0.36" stop-color="#d98a50"/><stop offset="0.74" stop-color="#ae5f33"/><stop offset="1" stop-color="#7c4026"/>
      </radialGradient>` : `<radialGradient id="${id('Verdi')}" cx="0.34" cy="0.3" r="0.82">
        <stop offset="0" stop-color="#a9d6c3"/><stop offset="0.42" stop-color="#74b29f"/><stop offset="0.78" stop-color="#4f8983"/><stop offset="1" stop-color="#3a6467"/>
      </radialGradient>`}
      <linearGradient id="${id('Brass')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8f6d26"/><stop offset="0.2" stop-color="#f6dc84"/><stop offset="0.42" stop-color="#dcb044"/><stop offset="0.8" stop-color="#a97b29"/><stop offset="1" stop-color="#6e4e1c"/>
      </linearGradient>
      ${st.telescope ? '' : `<linearGradient id="${id('BrassOld')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#55523c"/><stop offset="0.2" stop-color="#93906a"/><stop offset="0.45" stop-color="#77755a"/><stop offset="0.8" stop-color="#5a5842"/><stop offset="1" stop-color="#3e3d30"/>
      </linearGradient>`}
      <linearGradient id="${id('Round')}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#3a3f70" stop-opacity="0.22"/><stop offset="0.14" stop-color="#fff" stop-opacity="0.26"/><stop offset="0.36" stop-color="#fff" stop-opacity="0"/><stop offset="0.62" stop-color="#2a2f60" stop-opacity="0"/><stop offset="1" stop-color="#2a2f60" stop-opacity="0.52"/>
      </linearGradient>
      <linearGradient id="${id('Grime')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a7ab98"/><stop offset="0.7" stop-color="#8f9478"/><stop offset="1" stop-color="#7a7f60"/></linearGradient>
      <linearGradient id="${id('Dusty')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9b19f"/><stop offset="1" stop-color="#d7c39a"/></linearGradient>
      <linearGradient id="${id('Frost')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f9fc"/><stop offset="1" stop-color="#cadbe8"/></linearGradient>
      <linearGradient id="${id('Shade')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.3"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
      <radialGradient id="${id('Lens')}" cx="0.42" cy="0.4" r="0.66">
        <stop offset="0" stop-color="#cfe6f6"/><stop offset="0.42" stop-color="#6d93d0"/><stop offset="0.8" stop-color="#3a4a9c"/><stop offset="1" stop-color="#242c6a"/>
      </radialGradient>
      ${PCT > 0.4 ? `<pattern id="${id('Ashlar')}" width="42" height="22" patternUnits="userSpaceOnUse">${ashlar(K.stone, false)}</pattern>` : `<pattern id="${id('AshlarOld')}" width="42" height="22" patternUnits="userSpaceOnUse">${ashlar(U.mix(K.stone, '#9c9a8c', 0.3), true)}</pattern>`}
      ${PCT > 0.35 ? `<pattern id="${id('Slate')}" width="16" height="12" patternUnits="userSpaceOnUse">${slate(K.slate, false)}</pattern>` : `<pattern id="${id('SlateOld')}" width="16" height="12" patternUnits="userSpaceOnUse">${slate(U.mix(K.slate, '#77786f', 0.4), true)}</pattern>`}
      ${NIGHT ? `<pattern id="${id('Dust')}" width="170" height="120" patternUnits="userSpaceOnUse">${tile(419, 34, 170, 120)}</pattern>
      <pattern id="${id('Dust2')}" width="90" height="70" patternUnits="userSpaceOnUse">${tile(421, 40, 90, 70)}</pattern>` : ''}
      <pattern id="${id('Pebble' + SEASON)}" width="22" height="16" patternUnits="userSpaceOnUse">
        <rect width="22" height="16" fill="${pb[0]}"/><ellipse cx="5" cy="4" rx="3" ry="1.5" fill="${pb[1]}"/><ellipse cx="15" cy="3" rx="2" ry="1.1" fill="${U.shade(pb[0], 0.14)}"/><ellipse cx="11" cy="10" rx="3.4" ry="1.6" fill="${pb[1]}" opacity="0.7"/><ellipse cx="19" cy="12" rx="2.4" ry="1.2" fill="${U.shade(pb[1], -0.08)}" opacity="0.6"/><ellipse cx="3" cy="13" rx="1.8" ry="1" fill="${U.shade(pb[0], 0.12)}"/>
      </pattern>
      <pattern id="${id('Moss')}" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="#8d9466"/>
        <circle cx="4" cy="5" r="3" fill="#6f8a3e"/><circle cx="12" cy="11" r="3.5" fill="#748f42"/><circle cx="11" cy="3" r="1.5" fill="#a5a86c"/>
      </pattern>
      ${winter() || Object.values(PEND).includes('snow') ? `<pattern id="${id('Snow')}" width="30" height="24" patternUnits="userSpaceOnUse">
        <rect width="30" height="24" fill="#f3f7fb"/><ellipse cx="8" cy="8" rx="7" ry="3" fill="#e2ebf3"/><ellipse cx="22" cy="18" rx="8" ry="3" fill="#e6eef5"/>
        <circle cx="16" cy="5" r="0.9" fill="#fff"/><circle cx="4" cy="19" r="0.8" fill="#c9d8e6"/>
      </pattern>` : ''}
      ${Object.values(PEND).includes('leaves') ? `<pattern id="${id('Leaves')}" width="34" height="28" patternUnits="userSpaceOnUse">
        <ellipse cx="6" cy="6" rx="4" ry="2" fill="#d9822b" transform="rotate(30 6 6)"/><ellipse cx="22" cy="10" rx="4.5" ry="2.2" fill="#c4462f" transform="rotate(-20 22 10)"/>
        <ellipse cx="14" cy="21" rx="4" ry="2" fill="#e9b23c" transform="rotate(70 14 21)"/><ellipse cx="29" cy="24" rx="3.6" ry="1.8" fill="#9c5a2a"/>
        <ellipse cx="3" cy="17" rx="3.4" ry="1.7" fill="#e06c3c" transform="rotate(-50 3 17)"/>
      </pattern>` : ''}
      <clipPath id="${id('Dome')}"><path d="${DOME_D}"/></clipPath>
      <clipPath id="${id('Drum')}"><path d="${band(DRUM.y0, DRUM.y1)}"/></clipPath>
      <clipPath id="${id('Win')}"><rect x="${WIN.x0}" y="${WIN.y0}" width="${WIN.x1 - WIN.x0}" height="${WIN.y1 - WIN.y0}"/></clipPath>
      <clipPath id="${id('Way')}"><path d="${WAY_D}"/></clipPath>
      <clipPath id="${id('Top')}"><path d="${TOP_D}"/></clipPath>
    </defs>`;
  }

  // ---------------------------------------------------------- sky and hills
  function sky() {
    const cl = SEASON === 'autumn' ? '#fbf1e6' : '#ffffff';
    if (NIGHT) {
      // the sky of the evening is dimmed with everything else, so it is painted
      // brighter here. Dust and the milky way go behind the dome; the bright
      // stars and the moon are in night()
      return `<rect y="-4" width="400" height="374" fill="${url('Dusk')}"/><rect y="-4" width="400" height="352" fill="${url('Dust')}"/>
      <ellipse cx="256" cy="74" rx="250" ry="50" transform="rotate(40 256 74)" fill="${url('Milky')}"/><ellipse cx="256" cy="74" rx="240" ry="34" transform="rotate(40 256 74)" fill="${url('Dust2')}"/>`;
    }
    return `<rect y="-4" width="400" height="430" fill="${url('Sky' + SEASON)}"/>
    <circle cx="66" cy="62" r="50" fill="${url('Sun')}"/><circle cx="66" cy="62" r="17" fill="#fff3c4"/>
    <g class="cloud c1" fill="${cl}" opacity="0.92"><ellipse cx="172" cy="76" rx="25" ry="10"/><ellipse cx="191" cy="69" rx="17" ry="12"/><ellipse cx="209" cy="77" rx="19" ry="8"/></g>
    <g class="cloud c2" fill="${cl}" opacity="0.8"><ellipse cx="326" cy="158" rx="19" ry="7"/><ellipse cx="341" cy="153" rx="13" ry="9"/><ellipse cx="355" cy="159" rx="14" ry="6"/></g>`;
  }
  // the country far below the hill: pale ridges, fields and hedges, a few
  // trees, a little village with a spire on the right
  function far() {
    const f = FAR[SEASON], w = winter(), hedge = w ? '#c3ccd8' : SEASON === 'autumn' ? '#a8834e' : '#6f9a6a';
    let s = `<path d="M-6 318 Q40 296 96 312 T210 306 T330 304 T406 292 V420 H-6Z" fill="${f[0]}"/>
      <path d="M-6 342 Q60 322 130 338 T260 332 T406 326 V440 H-6Z" fill="${f[1]}"/><path d="M-6 368 Q70 348 150 362 T300 356 T406 350 V450 H-6Z" fill="${f[2]}"/>`;
    for (const [x0, x1, y, dy] of [[-4, 40, 356, 0.12], [60, 104, 348, -0.05], [358, 408, 358, -0.08]]) for (let x = x0; x < x1; x += 8) s += oval(x, y + (x - x0) * dy, 5.4, 3, hedge);
    for (const [x, y, r] of [[12, 339, 7], [24, 336, 9], [88, 332, 8], [388, 338, 7]]) s += `${box(x - 0.8, y, 1.6, 8, w ? '#a9b2bd' : '#7c7264')}${oval(x, y - 2, r * 0.8, r, w ? '#cdd6e0' : SEASON === 'autumn' ? '#c9964a' : '#7f9f8a')}`;
    // the village
    const wall = w ? '#dfe5ec' : '#e3dccb', tile = w ? '#eef2f6' : '#a58c86';
    for (const [x, y, ww, h] of [[364, 343, 9, 6], [375, 345, 11, 6], [390, 342, 10, 7], [356, 347, 7, 5]]) s += `${box(x, y, ww, h, wall)}<path d="M${x - 1} ${y} L${x + ww / 2} ${y - 4.4} L${x + ww + 1} ${y}Z" fill="${tile}"/>`;
    s += `${box(384.6, 329, 3.8, 15, wall)}<path d="M383.6 329.4 L386.5 318 L389.4 329.4Z" fill="${w ? '#d7dfe8' : '#8d8f9e'}"/>`;
    // sheep on the far fields, in the warm half of the year
    if (!w) for (const [x, y] of [[66, 342], [74, 344], [80, 340], [372, 356]]) s += `${oval(x, y, 2, 1.3, '#f6f2ea')}${dot(x + 1.8, y - 0.4, 0.7, '#6a6058')}`;
    // in the evening a mist lies in the valley either side of the hill
    if (NIGHT) s += `<ellipse cx="4" cy="338" rx="130" ry="34" fill="${url('Mist')}"/><ellipse cx="396" cy="332" rx="120" ry="36" fill="${url('Mist')}"/>`;
    return s;
  }
  // the hill itself, with the soft light on its shoulder
  function hill() {
    let s = `<path d="${HILL_D}" fill="${url('Hill' + SEASON)}"/>`;
    s += `<path d="M406 446 Q330 470 292 545 H406Z" fill="#2a3a6a" opacity="0.06"/><path d="M-6 500 Q60 494 120 545 H-6Z" fill="#2a3a6a" opacity="0.05"/>`;
    return s;
  }
  // a tuft of grass; tall ones have seed heads
  const tuftD = (x, y, h = 5) => `M${f1(x)} ${f1(y)}q-1.4 ${f1(-h * 0.5)} -3 ${f1(-h * 0.8)}M${f1(x)} ${f1(y)}q0 ${f1(-h * 0.6)} 0.6 ${f1(-h)}M${f1(x)} ${f1(y)}q1.6 ${f1(-h * 0.5)} 3.4 ${f1(-h * 0.7)}`;
  const tuft = (x, y, h = 5, col = '#5f8a3a', w = 1) => line(tuftD(x, y, h), col, w);
  // what grows on the foot of the slope: nobody's job
  function slope() {
    const r = U.rng(431), w = winter(), au = SEASON === 'autumn';
    let d = '';
    for (let i = 0; i < 26; i++) {
      const x = r() * 400, y = 458 + r() * 82, [px, py, pw] = wayAt(U.clamp((y - 370) / 182, 0, 1));
      if (Math.abs(x - px) < pw + 10 && Math.abs(y - py) < 40) continue;
      d += tuftD(x, y, 4 + r() * 4);
    }
    let s = line(d, w ? '#b9c4b4' : au ? '#a89050' : '#6f9a4a', 0.9);
    if (SEASON === 'spring' || SEASON === 'summer') {
      const pts = [];
      for (let i = 0; i < 14; i++) { const x = r() * 200, y = 462 + r() * 76; if (!(Math.abs(x - 150) < 60 && y > 500)) pts.push([x, y]); }
      s += specks(pts, '#fffaf0', 2.8) + specks(pts, '#e9bf4f', 1);
    }
    if (w) s += `${line('M-6 470 Q90 452 180 476', '#fff', 2.4, 0.5)}${line('M210 520 Q300 490 406 506', '#fff', 2.4, 0.5)}`;
    return s;
  }
  // the hilltop grass: long and gone to straw at first, then mown in stripes
  function grassBack(st) {
    const p = pend(st, 'grass'), ok = st.grass, h = HILL[SEASON], w = winter();
    const straw = w ? '#e9eef2' : U.mix(h[1], '#c4b27a', 0.6);
    let s = `<g data-part="grass"><path d="${TOP_D}" fill="${ok ? url('Hill' + SEASON) : straw}"/>`;
    const r = U.rng(433);
    if (ok) {
      if (!w) {
        s += `<g clip-path="${url('Top')}">`;
        for (let i = 0; i < 6; i++) s += line(`M-6 ${424 + i * 14 - 62} C70 ${404 + i * 15 - 62} 120 ${376 + i * 15} 200 ${372 + i * 15} S340 ${378 + i * 15} 406 ${414 + i * 13}`, i % 2 ? '#ffffff' : U.shade(h[2], -0.1), 8, i % 2 ? 0.1 : 0.1);
        s += '</g>';
        if (p === 'grow') for (let i = 0; i < 12; i++) s += oval(r() * 400, 376 + r() * 66, 8 + r() * 12, 2.4 + r() * 2, U.shade(h[1], -0.16), 0.5);
      }
    } else {
      const edge = [];
      for (let x = -6; x < 410; x += 26) edge.push([x + r() * 10, 449 + Math.sin(x * 0.03) * 7, 20 + r() * 14, 7 + r() * 5]);
      s += ovals(edge, straw);
      if (!w) {
        const rough = [[], [], []];
        for (let i = 0; i < 18; i++) rough[i % 3].push([r() * 400, 380 + r() * 70, 12 + r() * 22, 3 + r() * 4]);
        s += ovals(rough[0], '#a9b56a', 0.55) + ovals(rough[1], '#c9b878', 0.55) + ovals(rough[2], '#98a860', 0.55);
      }
    }
    if (p === 'leaves') s += `<path d="${TOP_D}" fill="${url('Leaves')}" opacity="0.92"/>`;
    return s + '</g>';
  }
  // the long stalks stand in front of the terrace wall, so they are drawn later
  function grassFront(st) {
    const p = pend(st, 'grass'), ok = st.grass, w = winter();
    const r = U.rng(437);
    const inWay = (x, y) => { for (let t = 0; t < 0.62; t += 0.05) { const [px, py, pw] = wayAt(t); if (Math.abs(x - px) < pw + 3 && Math.abs(y - py) < 9) return true; } return false; };
    let s = '<g data-part="grass">';
    if (!ok) {
      const cols = w ? ['#b9bfae', '#a9ae9c', '#c4c8b8', '#c4c8b8'] : ['#7f9a4a', '#98a65a', '#b0a862', '#6f8a3e'];
      const d = ['', '', '', ''], heads = [];
      let stalks = '';
      for (let i = 0; i < 58; i++) {
        const x = r() * 400, y = 374 + r() * 80;
        if (y < 376 && x > 96 && x < 364) continue;
        if (inWay(x, y)) continue;
        d[(r() * 4) | 0] += tuftD(x, y, 9 + r() * 9);
        if (i % 4 === 0) { stalks += `M${f1(x)} ${f1(y)}q2 -9 1 -21`; heads.push([x + 1, y - 22, 1.3, 3]); }
      }
      d.forEach((q, i) => { s += line(q, cols[i], 1.1); });
      s += line(stalks, cols[2], 0.8) + ovals(heads, '#c9b878');
      // thistles, and a dandelion gone to seed
      if (!w) {
        s += line([[112, 398], [300, 416], [212, 442]].map(([x, y]) => `M${x} ${y}q1 -12 0 -24M${x} ${y - 10}l-6 -3M${x} ${y - 15}l6 -3`).join(''), '#6f7f4a', 1.3);
        s += ovals([[112, 373, 3, 2.6], [300, 391, 3, 2.6], [212, 417, 3, 2.6]], '#7f8a58');
        s += line([[112, 398], [300, 416], [212, 442]].map(([x, y]) => `M${x - 2.4} ${y - 27}l-1 -3M${x} ${y - 28}v-3.6M${x + 2.4} ${y - 27}l1 -3`).join(''), '#a56aa8', 1.2);
        s += line([[80, 416], [150, 436], [336, 444]].map(([x, y]) => `M${x} ${y}q-1 -7 0 -13`).join(''), '#7f9a4a', 0.8);
        s += ovals([[80, 401, 3], [150, 421, 3], [336, 429, 3]], '#fff', 0.8);
      }
    } else if (p === 'grow') {
      let d = '';
      for (let i = 0; i < 16; i++) { const x = r() * 400, y = 378 + r() * 72; if (!inWay(x, y)) d += tuftD(x, y, 7 + r() * 5); }
      s += line(d, '#6f8a3e', 1);
    } else if (!w && SEASON !== 'autumn') {
      // a mown hill keeps a few daisies and buttercups
      const pts = [];
      for (let i = 0; i < 12; i++) { const x = r() * 400, y = 380 + r() * 66; if (!inWay(x, y)) pts.push([x, y]); }
      s += specks(pts.filter((_, i) => i % 3), '#fffaf0', 2.4) + specks(pts.filter((_, i) => !(i % 3)), '#f2d24a', 2.4);
    }
    return s + '</g>';
  }

  // ---------------------------------------------------------------- the oak
  function oak() {
    const T = OAK[SEASON], bark = '#6e5644', dk = '#4e3d32', lt = '#8d745e';
    const limbs = [['M24 322 Q6 292 -14 262', 10], ['M27 320 Q36 276 30 230', 12], ['M29 322 Q60 294 106 270', 9], ['M31 262 Q50 244 76 228', 5], ['M30 240 Q18 214 -2 198', 5], ['M31 236 Q40 206 60 180', 5], ['M-4 276 Q-12 254 -6 232', 4], ['M72 284 Q88 262 102 240', 4]];
    let s = `<path d="M-2 408 Q12 400 15 380 L37 380 Q40 398 56 408 Q36 400 26 402 Q14 400 -2 408Z" fill="${bark}"/>${line('M26 396 Q32 356 26 312', bark, 21)}`;
    for (const [d, w] of limbs) s += line(d, bark, w);
    s += `${line('M18 392 Q22 354 17 318', lt, 1.6, 0.8)}${line('M30 392 Q36 356 30 322', dk, 1.4, 0.7)}${line('M24 384 q2 -10 0 -20 M34 372 q1 -8 -1 -14', dk, 0.9, 0.6)}${oval(25, 348, 3.4, 5, dk, 0.5)}`;
    if (!T) {
      // bare in the winter, with snow along the tops of the boughs
      for (const d of ['M-14 262 q-8 -8 -16 -8', 'M-6 232 q2 -10 -4 -18', 'M30 230 q-2 -14 6 -26', 'M60 180 q8 -6 12 -16', 'M60 180 q-6 -8 -4 -18', 'M76 228 q10 -2 18 -10', 'M102 240 q8 -6 10 -14', 'M106 270 q8 -2 14 -8', 'M-2 198 q-8 -4 -12 -12', 'M44 222 q-2 -10 2 -16', 'M16 216 q-8 -6 -8 -14']) s += line(d, bark, 2);
      for (const d of ['M36 204 q-1 -10 3 -18', 'M72 164 q-2 -8 2 -14', 'M94 218 q6 0 10 -6', 'M8 202 q-6 -2 -8 -8']) s += line(d, bark, 1.2);
      s += `<g transform="translate(-0.8 -1.8)">${limbs.map(([d, w]) => line(d, SNOW, Math.max(1.4, w * 0.26))).join('')}</g>`;
      return s;
    }
    const r = U.rng(439);
    const lit = U.shade(T[1], SEASON === 'autumn' ? 0.2 : 0.16), deep = U.shade(T[2], -0.14);
    const lobes = (k, n) => { const out = []; for (const [x, y, rr] of CROWN_OAK) for (let i = 0; i < n; i++) { const a = (i / n) * 6.28 + r(); out.push([x + Math.cos(a) * rr * (0.9 + r() * 0.16), y + Math.sin(a) * rr * (0.86 + r() * 0.16)]); } return out; };
    const inside = (dx, dy, n) => { const out = []; for (let i = 0; i < n; i++) { const [x, y, rr] = U.pick(r, CROWN_OAK), a = r() * 6.28, d = Math.sqrt(r()) * rr * 0.92; out.push([x + dx * rr + Math.cos(a) * d * 0.8, y + dy * rr + Math.sin(a) * d * 0.8]); } return out; };
    // dark underneath, the mass of the crown with a lumpy edge, then clumps of
    // leaves catching the light from the left and shade on the far side
    s += ovals(CROWN_OAK.map(([x, y, rr]) => [x + 3, y + 9, rr]), deep);
    s += ovals(CROWN_OAK, T[0]) + grit(lobes(1, 9), T[0], 17) + grit(lobes(1, 7), T[2], 11);
    s += grit(inside(0.16, 0.2, 30), T[2], 10, 0.7) + grit(inside(-0.16, -0.18, 38), T[1], 9, 0.75) + grit(inside(-0.24, -0.26, 34), lit, 4.6, 0.6);
    s += grit(inside(0.1, 0.1, 70), deep, 2.6, 0.55) + grit(inside(-0.1, -0.12, 70), lit, 2.6, 0.75);
    if (SEASON === 'autumn') {
      s += ovals([[20, 268, 1.5, 2], [60, 248, 1.5, 2], [96, 262, 1.5, 2], [40, 204, 1.5, 2], [-2, 228, 1.5, 2]], '#8a6a3a');
      for (let i = 0; i < 12; i++) { const x = 4 + r() * 90, y = 392 + r() * 18; s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="2.6" ry="1.3" fill="${U.pick(r, LEAFC)}" transform="rotate(${Math.round(r() * 180)} ${f1(x)} ${f1(y)})" opacity="0.9"/>`; }
    }
    return s;
  }

  // ---------------------------------------------------------------- the dome
  const SEAMS = [-75, -60, -45, -30, -15, 0, 15, 66, 80];
  const RINGS = [24, 46, 66];
  function domeSnow() {
    const edge = steps(90, -90, 12).map((ph, i) => domePt(45 + (i % 2 ? 8 : -5), ph));
    const [lx, ly] = edge[12], [rx0, ry0] = edge[0], d = curve(edge);
    let s = `${line(d, '#a9bdd6', 2.4, 0.5)}<path d="M${f1(lx)} ${f1(ly)} A${DOME.rx} ${DOME.ry} 0 0 1 ${f1(rx0)} ${f1(ry0)} ${d.replace('M', 'L')}Z" fill="${url('Snow')}"/>`;
    s += line(meridian(-30, 30, 42) + meridian(-60, 28, 40) + meridian(0, 32, 42), SNOW, 2.8);
    return s + line(ringD(9, -84, 84), SNOW, 2.8);
  }
  function dome(st) {
    const p = pend(st, 'dome'), ok = st.dome, r = U.rng(443);
    let s = `<g data-part="dome"><path d="${DOME_D}" fill="${url(ok ? 'Copper' : 'Verdi')}"/><g clip-path="${url('Dome')}">`;
    // the sheets of copper, a few a little lighter or darker than the next
    const ph = [-90, -75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75, 90], th = [0, 24, 46, 66, 90];
    let hi = '', lo = '';
    ph.slice(0, -1).forEach((a, i) => th.slice(0, -1).forEach((t, j) => {
      const q = `${poly([domePt(t, a), domePt(t, ph[i + 1]), domePt(th[j + 1], ph[i + 1]), domePt(th[j + 1], a)])}Z`;
      if ((i + j * 2) % 3 === 0) hi += q; else if ((i + j * 2) % 3 === 1) lo += q;
    }));
    s += `<path d="${hi}" fill="#fff" opacity="${ok ? 0.1 : 0.08}"/><path d="${lo}" fill="#2a1408" opacity="0.09"/>`;
    if (!ok) {
      // tarnished and streaked: brown where the old copper shows, pale runs down the seams
      const stain = [[], [], []];
      for (let i = 0; i < 18; i++) { const [x, y] = domePt(6 + r() * 76, -84 + r() * 168); stain[i % 3].push([x, y, 5 + r() * 11, 3 + r() * 6]); }
      s += ovals(stain[0], '#6a5238', 0.42) + ovals(stain[1], '#7a5a3a', 0.4) + ovals(stain[2], '#2f4a4a', 0.4);
      let runs = '';
      for (let i = 0; i < 12; i++) { const a = -80 + r() * 160, t = 18 + r() * 44; runs += poly(steps(t - 16 - r() * 8, t, 2).map((q) => domePt(q, a))); }
      s += line(runs, '#cfeadb', 1.6, 0.34);
    } else if (p === 'grow') {
      // green creeping back, out from the seams
      const creep = [[], []];
      for (let i = 0; i < 22; i++) { const [x, y] = domePt(4 + r() * 46, U.pick(r, SEAMS) + (r() - 0.5) * 10); creep[i % 2].push([x, y, 4 + r() * 8, 2.4 + r() * 4]); }
      s += ovals(creep[0], '#7fbfa4', 0.72) + ovals(creep[1], '#6fae9c', 0.66);
    }
    // the seams: dark at first, then a thread of verdigris along the bright copper
    const seam = ok ? '#8ed2b6' : '#2c5152', edge = ok ? '#6e3a20' : '#8fc4b0', all = SEAMS.map((a) => meridian(a)).concat(RINGS.map((t) => ringD(t))).join('');
    s += `${line(all, edge, 2, ok ? 0.5 : 0.28)}${line(all, seam, 1.15, ok ? 0.9 : 0.8)}`;
    if (ok) {
      const nails = [];
      for (const a of SEAMS.slice(1, 7)) for (const t of RINGS) nails.push(domePt(t, a));
      s += specks(nails, '#a5dcc4', 3, 0.85) + specks(nails, '#fff', 1, 0.5);
    }
    // a bright stroke on the sunny side
    s += line(meridian(-58, 20, 76), '#fff', ok ? 5 : 3, ok ? 0.18 : 0.1);
    if (winter()) s += domeSnow();
    s += '</g>';
    s += slit(st);
    // the pointed cap and the ball on top
    const [tx, ty] = domePt(90, 0), cap = ok ? '#d9a04a' : '#5f8a7c', capD = U.shade(cap, -0.3);
    s += `<path d="M${tx - 11} ${f1(ty + 3)} Q${tx} ${f1(ty - 5)} ${tx + 11} ${f1(ty + 3)} Q${tx} ${f1(ty + 7)} ${tx - 11} ${f1(ty + 3)}Z" fill="${capD}"/>${line(`M${tx} ${f1(ty - 1)} V${f1(ty - 14)}`, capD, 2.4)}${dot(tx, ty - 15, 3.4, cap)}${dot(tx - 1, ty - 16, 1, '#fff', ok ? 0.7 : 0.25)}`;
    if (winter()) s += `${oval(tx, ty + 1, 11, 2.6, SNOW)}${oval(tx, ty - 17.4, 3.2, 1.2, SNOW)}`;
    return s + '</g>';
  }
  // the open slit, dark by day, with the ribs of the dome showing inside
  function slit(st) {
    const ok = st.dome, rim = ok ? '#e6ac74' : '#8cc0ac', dk = ok ? '#7a4426' : '#2f5152';
    let s = `<path d="${SLIT_D}" fill="#141a44"/>`;
    s += line(ringD(26, 20, 60) + ringD(46, 20, 60), '#2c3568', 1.2, 0.9);
    const L = meridian(SLIT.a, SLIT.th0, SLIT.th1), R = meridian(SLIT.b, SLIT.th0, SLIT.th1);
    s += `${line(L, dk, 4)}${line(L, rim, 2.2)}${line(R, dk, 4)}${line(R, rim, 2.2)}`;
    s += line(poly(steps(SLIT.a, SLIT.b, 4).map((a) => domePt(SLIT.th0, a))), rim, 3);
    if (winter()) s += `${line(R, SNOW, 1.4, 0.9)}${line(poly(steps(SLIT.a, SLIT.b, 4).map((a) => domePt(SLIT.th0 + 1, a))), SNOW, 1.8)}`;
    return s;
  }
  // the brass tube, reaching out of the slit towards the moon
  function telescope(st) {
    const p = pend(st, 'telescope'), ok = st.telescope, r = U.rng(449);
    const fill = url(ok ? 'Brass' : 'BrassOld'), band0 = ok ? '#7e5a20' : '#3e3d30', band1 = ok ? '#f0d27a' : '#7f7d60';
    let s = `<g data-part="telescope"><g transform="${SCOPE_T}">${box(-12, -18, 124, 34, '#000', ' fill-opacity="0"')}`;
    // into the dark of the slit, and the little finder scope along the top
    s += `${box(-20, -6, 22, 12, fill)}${box(36, -14.6, 44, 4.4, fill, ' rx="1.2"')}${box(44, -11, 2.4, 3, band0)}${box(70, -11, 2.4, 3, band0)}${box(78, -15.6, 3, 6.4, band0, ' rx="0.8"')}`;
    s += box(0, -8.6, 88, 17.2, fill);
    for (const [x, w] of [[3, 3.4], [30, 2.2], [58, 2.2], [84, 4]]) s += `${box(x, -9.8, w, 19.6, fill, ' rx="0.8"')}${box(x, -9.8, 0.7, 19.6, band1, ' opacity="0.8"')}${box(x + w - 0.7, -9.8, 0.7, 19.6, band0, ' opacity="0.8"')}`;
    s += `<path d="M88 -8.6 L92 -11.6 H${SCOPE.len} V11.6 H92 L88 8.6Z" fill="${fill}"/>${box(100, -11.6, 1.2, 23.2, band0, ' opacity="0.7"')}`;
    if (!ok) {
      for (let i = 0; i < 9; i++) s += oval(6 + r() * 96, -7 + r() * 14, 3 + r() * 6, 1.4 + r() * 2.4, U.pick(r, ['#6fae9c', '#4f8983', '#7a5a3a']), 0.6);
      s += line('M48 -8 q4 3 2 6', '#2f2e24', 0.9, 0.8);
    } else if (p) {
      // fingerprints and a dull bloom on the brass
      s += box(0, -8.6, 112, 17.2, FADE, ' opacity="0.3"');
      for (const [x, y] of [[20, 2], [40, -4], [46, 3], [70, -2], [94, 4]]) s += `${oval(x, y, 3.2, 2.4, '#8a7a50', 0.42)}${line(`M${x - 2} ${y} q2 -2 4 0 M${x - 1.4} ${y + 1} q1.4 -1.2 2.8 0`, '#6e6040', 0.4, 0.7)}`;
    } else s += `${box(8, -5.6, 76, 1.4, '#fff', ' opacity="0.6" rx="0.7"')}${box(92, -8, 18, 1.4, '#fff', ' opacity="0.5" rx="0.7"')}`;
    if (winter()) s += `${box(-2, -10.4, 88, 2, SNOW, ' rx="1"')}${box(90, -12.8, 22, 2, SNOW, ' rx="1"')}`;
    return s + '</g></g>';
  }
  // the glass at the far end of the tube
  function lens(st) {
    const p = pend(st, 'lens'), ok = st.lens, rim = ok ? '#f0d27a' : '#6f6e54', dk = ok ? '#8f6d26' : '#3e3d30';
    let s = `<g data-part="lens"><g transform="${SCOPE_T} translate(${SCOPE.len} 0)">${box(-16, -20, 36, 40, '#000', ' fill-opacity="0"')}`;
    s += `${oval(0, 0, 6.4, 12.4, dk)}${oval(0.4, 0, 5.6, 11.6, rim)}${oval(0.8, 0, 4.6, 10.2, ok ? url('Lens') : url('Grime'))}`;
    if (ok) {
      s += `${line('M-1.4 -6 Q-2.6 0 -1.2 5.4', '#fff', 1.3, 0.85)}${dot(2.2, -4.6, 1.1, '#fff', 0.9)}`;
      if (p) s += `${oval(0.8, 0, 4.6, 10.2, url('Dusty'), 0.72)}${dot(-0.6, 3, 0.8, '#8a8270', 0.7)}${dot(2.4, -3, 0.7, '#8a8270', 0.7)}`;
    } else {
      s += `${oval(1.8, 3.6, 2.4, 3.6, '#6f8a3e', 0.55)}${line('M-2 -8 l3 5 l-2 4 l4 7', '#eef0e8', 0.6, 0.9)}${line('M-3 -3 q4 -2 7 -7 M-3 -3 q3 3 7 10', '#eef0e8', 0.35, 0.8)}`;
    }
    return s + '</g></g>';
  }

  // ------------------------------------------------------------ the building
  function chimney() {
    let s = `${box(310, 224, 18, 34, url(PCT > 0.4 ? 'Ashlar' : 'AshlarOld'))}${box(307.6, 220, 22.8, 5, K.stone, ' rx="1"')}${box(313, 210, 5, 11, '#a8604a')}${box(321, 212, 5, 9, '#9a5844')}`;
    if (winter()) s += box(307.6, 218.4, 22.8, 2.6, SNOW, ' rx="1.3"');
    if (PCT > 0.5) s += '<g class="smoke" fill="#ffffff"><circle cx="317" cy="204" r="4" opacity="0.7"/><circle cx="321" cy="194" r="5.6" opacity="0.5"/><circle cx="318" cy="180" r="7" opacity="0.3"/></g>';
    return s;
  }
  // the long low wing: stone walls under an indigo slate roof
  function wing() {
    const { x0, x1, y0, y1 } = WING, old = PCT <= 0.4;
    let s = box(x0 - 8, y0, x1 - x0 + 8, y1 - y0, url(old ? 'AshlarOld' : 'Ashlar'));
    s += box(x0 - 8, y0, x1 - x0 + 8, 12, url('Shade'), ' opacity="0.55"');
    for (let y = y0 + 6, i = 0; y < y1 - 6; y += 11, i++) s += box(x1 - (i % 2 ? 11 : 15), y, i % 2 ? 11 : 15, 10.4, U.shade(K.stone, i % 2 ? 0.05 : -0.03), ' rx="0.6"');
    s += `<path d="${ROOF_D}" fill="${url(PCT > 0.35 ? 'Slate' : 'SlateOld')}"/>`;
    if (PCT < 0.4) s += `<path d="M284 262 l13 -1 l3 9 l-14 1Z" fill="#3a3a48" opacity="0.7"/><path d="M332 268 l9 0 l3 7 l-11 0Z" fill="#3a3a48" opacity="0.65"/>`;
    const lead = PCT > 0.4 ? '#8c93b4' : '#6e7078';
    s += `${line('M244 252 H334', lead, 2.4)}${line('M334 252 L366 280', lead, 2.2)}`;
    s += `${box(240, 279, 128, 3.2, U.shade(K.trim, -0.1), ' rx="1"')}${box(240, 279, 128, 0.9, '#fff', ' opacity="0.25"')}`;
    if (winter()) s += `<path d="${ROOF_D}" fill="${url('Snow')}" opacity="0.92"/>${box(240, 277.6, 128, 2.6, SNOW, ' rx="1.3"')}${line('M244 251 H334 L366 279', SNOW, 3)}`;
    return s;
  }
  // the charts on the map-room wall, one to each top pane
  function charts(st) {
    const p = pend(st, 'charts'), ok = st.charts;
    const paper = ok ? '#f6efdd' : '#b7a98c', ink = ok ? '#2c3678' : '#74705e', navy = ok ? '#222c6e' : '#62625e', star = ok ? '#fff6d8' : '#c9c1ab';
    let s = `<g data-part="charts">${box(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, BARY - WIN.y0, '#000', ' fill-opacity="0"')}`;
    const r = U.rng(457);
    // a round chart of the sky on its square sheet
    const cx = 273, cy = 299;
    let a = `${box(cx - 12.6, cy - 12.6, 25.2, 25.2, paper)}${dot(cx, cy, 11, navy)}<circle cx="${cx}" cy="${cy}" r="8" fill="none" stroke="${star}" stroke-width="0.35" opacity="0.7"/><circle cx="${cx}" cy="${cy}" r="4.6" fill="none" stroke="${star}" stroke-width="0.35" opacity="0.7"/>${line(`M${cx - 11} ${cy} H${cx + 11} M${cx} ${cy - 11} V${cy + 11}`, star, 0.3, 0.6)}`;
    a += specks(Array.from({ length: 16 }, () => { const t = r() * 6.28, d = 1.4 + r() * 8.6; return [cx + Math.cos(t) * d, cy + Math.sin(t) * d]; }), star, 1);
    a += dot(cx, cy - 12.6, 0.9, '#c9474f');
    s += ok ? a : `<g transform="rotate(-5 ${cx} ${cy - 12})">${a}</g>`;
    // the phases of the moon
    let b = box(291.6, 288, 23, 23, paper);
    [[297, 294], [303, 294], [309, 294], [297, 304], [303, 304], [309, 304]].forEach(([x, y], i) => {
      b += `${dot(x, y, 2.3, navy)}`;
      if (i !== 2) b += `<path d="M${x} ${y - 2.3} A2.3 2.3 0 0 ${i < 2 || i === 5 ? 1 : 0} ${x} ${y + 2.3} A${[1.6, 0.4, 0, 0.6, 1.8, 1.2][i]} 2.3 0 0 ${i < 2 ? 0 : i === 5 ? 1 : 1} ${x} ${y - 2.3}Z" fill="${star}"/>`;
      else b += dot(x, y, 2, star);
    });
    b += line('M294 299 H312 M294 309 H312', ink, 0.3, 0.6) + dot(303, 288, 0.9, '#c9474f');
    s += ok ? b : `<g transform="rotate(4 303 288)">${b}</g>`;
    // a long sheet of the constellations
    let c = `${box(322, 287, 22, 25, navy)}<rect x="323.4" y="288.4" width="19.2" height="22.2" fill="none" stroke="${star}" stroke-width="0.35" opacity="0.8"/>`;
    c += line('M326 306 L330 298 L336 301 L340 293 M330 298 L333 292 M336 301 L339 307', star, 0.45, 0.85);
    for (const [x, y] of [[326, 306], [330, 298], [336, 301], [340, 293], [333, 292], [339, 307]]) c += dot(x, y, 0.8, star);
    s += ok ? c : `<g transform="rotate(7 343 288)">${c}</g>`;
    if (!ok) {
      s += `<path d="M285.6 311.6 l-6 0.6 l1.6 -5Z" fill="#d6cbb0"/>${line('M258 286 q10 5 18 -2 M258 286 l14 14 M258 296 l14 -11', '#eef0e8', 0.4, 0.8)}${line('M346 286 q-8 5 -18 0 M346 286 l-14 12', '#eef0e8', 0.4, 0.75)}`;
      s += box(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, BARY - WIN.y0, url('Dusty'), ' opacity="0.42"');
    } else if (p) s += box(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, BARY - WIN.y0, url('Dusty'), ' opacity="0.4"');
    return s + '</g>';
  }
  // the jigsaw of the night sky, propped on the table under the window
  function jigsaw(st) {
    const p = pend(st, 'jigsaw'), ok = st.jigsaw, clean = ok && !p;
    const wood = ok ? '#c29a62' : '#8a7d6a', dk = U.shade(wood, -0.3);
    const B = { x: 298, y: 317, w: 42, h: 22 };
    let s = `<g data-part="jigsaw">${box(290, BARY + 1, 58, 31, '#000', ' fill-opacity="0"')}`;
    s += `${line(`M${B.x + 8} ${B.y + B.h} l-4 7 M${B.x + B.w - 8} ${B.y + B.h} l4 7`, dk, 2)}`;
    s += `${box(B.x - 1.6, B.y - 1.6, B.w + 3.2, B.h + 3.2, dk, ' rx="0.8"')}${box(B.x, B.y, B.w, B.h, ok ? '#18205a' : '#7a7468')}`;
    if (ok) {
      // the picture itself: a moon and stars over a dark hill
      s += `${dot(B.x + 31, B.y + 6, 3.4, '#f6e9b8')}${dot(B.x + 32.4, B.y + 5.2, 3, '#18205a')}`;
      s += specks([[5, 4], [11, 9], [16, 3], [22, 7], [8, 13], [26, 12], [36, 13], [19, 12]].map(([x, y]) => [B.x + x, B.y + y]), '#fff', 1.2);
      s += `<path d="M${B.x} ${B.y + B.h} V${B.y + 16} Q${B.x + 14} ${B.y + 12} ${B.x + 26} ${B.y + 16} T${B.x + B.w} ${B.y + 15} V${B.y + B.h}Z" fill="#c9804a"/>`;
      if (p) {
        // a new one, not finished: holes where the pieces are still to come
        for (const [i, j] of [[3, 0], [4, 0], [5, 1], [0, 2], [1, 2], [5, 2]]) s += box(B.x + i * 7, B.y + j * 7.34, 7, 7.34, '#7a7468');
      }
    } else {
      // only a few pieces found their place; the rest lie about
      for (const [i, j, c] of [[0, 2, '#c9804a'], [1, 2, '#c9804a'], [4, 0, '#1c2560'], [5, 0, '#2a3580']]) s += box(B.x + i * 7, B.y + j * 7.34, 7, 7.34, c);
    }
    // the lines between the pieces, each with a little knob
    let d = '';
    for (let i = 1; i < 6; i++) { const x = B.x + i * 7; d += `M${x} ${B.y}v3q1.3 .3 0 1.4v3q-1.3 .3 0 1.4v3q1.3 .3 0 1.4V${B.y + B.h}`; }
    for (let j = 1; j < 3; j++) { const y = B.y + j * 7.34; d += `M${B.x} ${f1(y)}h3q.3 1.3 1.4 0h6q.3 -1.3 1.4 0h6q.3 1.3 1.4 0h6q.3 -1.3 1.4 0h6q.3 1.3 1.4 0H${B.x + B.w}`; }
    s += line(d, ok ? '#000' : '#5a554c', 0.3, ok ? 0.5 : 0.6);
    // the table
    s += `${box(293, 342, 2.8, 5, dk)}${box(342, 342, 2.8, 5, dk)}${box(290, 339, 58, 3.4, wood, ' rx="0.8"')}${box(290, 339, 58, 0.8, '#fff', ' opacity="0.22"')}`;
    if (!ok) {
      s += `${box(322, 335, 14, 4.4, '#7c6f5c', ' rx="0.5"')}${box(322, 335, 14, 1.2, '#958873')}`;
      for (const [x, y, c, a] of [[300, 337.4, '#2a3580', 20], [308, 338, '#c9804a', -30], [314, 337.2, '#1c2560', 50], [344, 337.6, '#2a3580', 15]]) s += `<g transform="rotate(${a} ${x} ${y})">${box(x - 2, y - 1.4, 4, 2.8, c, ' rx="0.5"')}</g>`;
      s += box(290, BARY + 1, 58, 31, url('Dusty'), ' opacity="0.4"');
    } else if (p) {
      for (const [x, y, c, a] of [[300, 337.8, '#2a3580', 20], [344, 337.6, '#c9804a', -25], [334, 338, '#1c2560', 45]]) s += `<g transform="rotate(${a} ${x} ${y})">${box(x - 2, y - 1.4, 4, 2.8, c, ' rx="0.5"')}</g>`;
    }
    if (clean) s += dot(339, 337.4, 1.6, '#f0d27a');
    return s + '</g>';
  }
  function roomInside(st) {
    const dusty = PCT < 0.4, { x0, x1, y0, y1 } = WIN, w = x1 - x0;
    let s = box(x0, y0, w, y1 - y0, dusty ? '#6d7088' : '#333d80');
    if (!dusty) { const r = U.rng(461); s += grit(Array.from({ length: 24 }, () => [x0 + r() * w, y0 + r() * 40]), '#d9b45a', 0.9, 0.55); }
    // the panelling and the boards of the floor
    s += `${box(x0, 326, w, 16, dusty ? '#6e6052' : '#7e5a3e')}${box(x0, 342, w, 4, dusty ? '#5a4e42' : '#5e4230')}${box(x0, 326, w, 1, '#fff', ' opacity="0.16"')}`;
    for (let x = x0 + 9; x < x1; x += 15) s += `<rect x="${x}" y="329" width="10" height="10" fill="none" stroke="${dusty ? '#5a4e42' : '#5e4230'}" stroke-width="0.6"/>`;
    // a globe of the heavens on its stand, in the lower left pane
    const gx = 273, gy = 327, brass = dusty ? '#7f7d60' : '#d9ac3f';
    s += `${line(`M${gx} ${gy + 9} V344 M${gx - 6} 345 H${gx + 6}`, dusty ? '#5a4e42' : '#6e4e2c', 1.8)}`;
    s += `${dot(gx, gy, 8.6, dusty ? '#73737a' : '#26327e')}${dot(gx - 2.4, gy - 2.8, 3.2, '#fff', 0.14)}`;
    s += specks([[-4, -3], [2, -5], [5, 0], [-2, 3], [3, 4], [-6, 2], [0, -1]].map(([x, y]) => [gx + x, gy + y]), dusty ? '#bdb9a8' : '#fff6d8', 1);
    s += `<ellipse cx="${gx}" cy="${gy}" rx="10" ry="11" fill="none" stroke="${brass}" stroke-width="0.9"/>${line(`M${gx - 8.6} ${gy + 1.6} Q${gx} ${gy + 5} ${gx + 8.6} ${gy + 1.6}`, brass, 0.6, 0.9)}`;
    s += charts(st) + jigsaw(st);
    s += box(x0, y0, w, 12, url('Shade'), ' pointer-events="none" opacity="0.7"');
    return s;
  }
  // the glass, its bars and the deep sill under them
  function windowGlass(st) {
    const p = pend(st, 'window'), ok = st.window, { x0, x1, y0, y1 } = WIN, w = x1 - x0, h = y1 - y0;
    let s = '<g pointer-events="none">';
    if (!ok) {
      s += box(x0, y0, w, h, url('Grime'), ' opacity="0.6"');
      s += `<path d="M262 342 q18 -20 36 -5 M304 340 q20 -22 40 -6 M266 304 q14 -10 26 -2" stroke="#dfe3d4" stroke-width="6" fill="none" opacity="0.2" stroke-linecap="round"/>`;
      s += line('M338 286 l-6 11 l5 5 l-8 12', '#eef0e8', 0.8, 0.9);
      for (const [x, y] of [[276, 322], [304, 292], [336, 330], [266, 296], [316, 322]]) s += dot(x, y, 1.4, '#6b6a5a', 0.5);
    } else if (p === 'frost') {
      s += box(x0, y0, w, h, url('Frost'), ' opacity="0.84"') + line('M262 345 q6 -12 3 -22 M265 336 l5 -3 M344 345 q-8 -10 -5 -22 M340 333 l-5 -2 M300 346 q3 -8 11 -10 M322 296 q-6 8 -2 14', '#fff', 1.2);
    } else if (p === 'grow') {
      s += box(x0, y0, w, h, url('Dusty'), ' opacity="0.4"');
      for (const [x, y] of [[270, 292], [282, 310], [296, 300], [309, 322], [326, 296], [338, 318], [268, 334], [330, 338], [300, 286]]) s += oval(x, y, 1.1, 1.8, '#f2eedd', 0.7);
    } else s += `<path d="M262 346 L290 284 H302 L274 346Z M322 346 L344 284 H348 V296 L332 346Z" fill="#fff" opacity="0.13"/>`;
    s += '</g>';
    const fr = ok ? K.sash : U.mix(K.sash, '#8a877c', 0.55);
    s += `<g data-part="window"><rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="${fr}" stroke-width="3.2"/>`;
    s += `${box(x0, BARY, BARX[0] - x0, y1 - BARY, '#000', ' fill-opacity="0"')}<path d="M${BARX[0]} ${y0} V${y1} M${BARX[1]} ${y0} V${y1} M${x0} ${BARY} H${x1}" stroke="${fr}" stroke-width="1.8"/>`;
    if (!ok) s += `<path d="M340 286 l7 -1 l1 9 l-5 2Z" fill="#6a6a5e" opacity="0.8"/>`;
    s += `${box(x0 - 5, y0 - 5, w + 10, 4.4, K.sash, ' rx="1"')}${box(x0 - 6, y1 + 1, w + 12, 4.2, K.stone, ' rx="1"')}${box(x0 - 6, y1 + 5, w + 12, 1.4, '#000', ' opacity="0.14"')}`;
    if (winter() || p === 'snow') s += `${box(x0 - 6, y1 - 0.4, w + 12, 2.2, SNOW, ' rx="1.1"')}${box(x0 - 5, y0 - 6.4, w + 10, 2, SNOW, ' rx="1"')}`;
    return s + '</g>';
  }
  // the round wall: every course and joint is worked out so the stones narrow
  // towards the edges, and the shade from left to right does the rest
  function drum() {
    const old = PCT <= 0.4, base = old ? U.mix(K.stone, '#9c9a8c', 0.3) : K.stone, r = U.rng(463);
    let s = `<path d="${band(DRUM.y0, DRUM.y1)}" fill="${base}"/><g clip-path="${url('Drum')}">`;
    let lines = '', hi = '', lo = '';
    for (let y = 226, n = 0; y < DRUM.y1; y += 11, n++) {
      lines += arc(y);
      for (let a = -84 + (n % 2) * 8; a < 90; a += 16) {
        const x0 = CX + DRUM.r * Math.sin(rad(a)), x1 = CX + DRUM.r * Math.sin(rad(a + 16));
        lines += `M${f1(x0)} ${f1(arcY(y, x0))}V${f1(arcY(y + 11, x0))}`;
        const pick = r();
        if (pick < 0.42) {
          const q = `M${f1(x0)} ${f1(arcY(y, x0))}L${f1(x1)} ${f1(arcY(y, x1))}V${f1(arcY(y + 11, x1))}L${f1(x0)} ${f1(arcY(y + 11, x0))}Z`;
          if (pick < 0.21) hi += q; else lo += q;
        }
      }
    }
    s += `<path d="${hi}" fill="#fff" opacity="0.16"/><path d="${lo}" fill="#6a6258" opacity="0.13"/><path d="${lines}" fill="none" stroke="${U.shade(base, -0.28)}" stroke-width="0.7" opacity="0.72"/>`;
    if (PCT < 0.6) {
      // green runs from the dome, and damp at the foot of the wall
      const op = U.clamp((0.6 - PCT) * 1.5, 0, 0.8);
      for (let i = 0; i < 11; i++) { const x = CX - 66 + r() * 132; s += line(`M${f1(x)} 240 q${f1((r() - 0.5) * 4)} ${f1(14 + r() * 20)} 0 ${f1(26 + r() * 34)}`, '#6fae9c', 2 + r() * 2.6, +op.toFixed(2)); }
      for (let i = 0; i < 9; i++) s += oval(CX - 70 + r() * 140, 344 + r() * 12, 6 + r() * 9, 2.4 + r() * 3, '#6f8a3e', +op.toFixed(2));
      s += line('M226 268 l-5 13 l6 9 l-4 15', '#7d7468', 0.8, +op.toFixed(2));
    }
    s += `${box(CX - DRUM.r, 222, DRUM.r * 2, 142, url('Round'))}${box(CX - DRUM.r, 226, DRUM.r * 2, 34, url('Shade'), ' opacity="0.5"')}</g>`;
    // a narrow arched window in the round wall
    const dark = PCT < 0.4 ? '#4e5058' : '#232b62', sill = K.stone;
    s += `<path d="M118 334 V306 Q118 292 127 287 Q136 292 136 306 V334Z" fill="${U.shade(sill, -0.06)}"/><path d="M121.4 332 V307 Q121.4 296 127 292 Q132.6 296 132.6 307 V332Z" fill="${dark}"/>`;
    s += `${line('M127 293 V332 M121.4 304 H132.6 M121.4 318 H132.6', U.shade(sill, -0.28), 0.8)}${box(116.4, 334, 21.2, 2.6, K.stone, ' rx="0.8"')}${box(116.4, 336.4, 21.2, 0.9, '#000', ' opacity="0.14"')}`;
    return s;
  }
  // the moulded stone band that carries the dome
  function cornice() {
    let s = `<path d="${band(229, 236.4, 82)}" fill="${K.stone}"/><path d="${band(229, 236.4, 82)}" fill="${url('Round')}"/>`;
    s += `${line(arc(229, 82), '#fff', 0.8, 0.5)}${line(arc(233, 82), U.shade(K.stone, -0.26), 0.6, 0.8)}`;
    for (let a = -78; a <= 78; a += 8.6) { const x = CX + 78 * Math.sin(rad(a)), y = arcY(236.4, x, 82); s += box(x - 1.3, y - 0.2, 2.6, 3.2, U.shade(K.stone, -0.16)); }
    if (winter()) s += line(arc(228.4, 82), SNOW, 3.2);
    return s;
  }
  // the gallery round the foot of the dome and the two flights of steps up to it
  function stairs(st) {
    const p = pend(st, 'steps'), ok = st.steps, r = GAL.r, y = GAL.y;
    const wood = ok ? '#cda368' : '#8f8170', dk = U.shade(wood, -0.32), rail = ok ? K.trim : '#7d7a72';
    const at = (a) => { const x = CX + r * Math.sin(rad(a)); return [x, arcY(y, x, r)]; };
    let s = `<g data-part="steps">${box(32, 240, 70, 112, '#000', ' fill-opacity="0"')}`;
    // brackets under the floor
    for (const a of [-62, -38, -14, 14, 38, 62]) { const [x, yy] = at(a), dir = a < 0 ? 1 : -1; s += line(`M${f1(x)} ${f1(yy + 3)} q0 9 ${dir * 7} 12`, dk, 1.8); }
    // the rail goes behind the floor line, posts and thin bars in front of the dome
    let bars = '';
    for (let a = -84; a <= 84; a += 7) { const [x, yy] = at(a); if (!ok && (a > 6 && a < 44 || a % 3 === 0)) continue; bars += `M${f1(x)} ${f1(yy)}V${f1(yy - 20)}`; }
    s += line(bars, rail, 0.8, 0.9);
    if (ok) {
      for (const a of [-84, -56, -28, 0, 28, 56, 84]) { const [x, yy] = at(a); s += line(`M${f1(x)} ${f1(yy + 1)} V${f1(yy - 21)}`, rail, 2); }
      s += `${line(`M${CX - r} ${y - 21} Q${CX} ${f1(y - 21 - 2 * sag(y))} ${CX + r} ${y - 21}`, rail, 2.6)}${line(`M${CX - r} ${y - 21.8} Q${CX} ${f1(y - 21.8 - 2 * sag(y))} ${CX + r} ${y - 21.8}`, '#fff', 0.5, 0.3)}`;
    } else {
      for (const a of [-84, -28, 56]) { const [x, yy] = at(a); s += line(`M${f1(x)} ${f1(yy + 1)} L${f1(x + (a === 56 ? 4 : 0))} ${f1(yy - 19)}`, rail, 2); }
      const [ax, ay] = at(-84), [bx, by] = at(-34), [cx, cy] = at(40), [dx, dy] = at(84);
      s += `${line(`M${f1(ax)} ${f1(ay - 21)} Q${f1((ax + bx) / 2)} ${f1(ay - 28)} ${f1(bx)} ${f1(by - 19)}`, rail, 2.2)}${line(`M${f1(cx)} ${f1(cy - 15)} L${f1(dx)} ${f1(dy - 21)}`, rail, 2.2)}`;
    }
    s += `<path d="${band(y, y + 4.6, r)}" fill="${wood}"/>${line(arc(y, r), '#fff', 0.7, 0.3)}${line(arc(y + 4.6, r), dk, 1.2)}`;
    if (!ok) { const [x, yy] = at(18); s += `<path d="M${f1(x)} ${f1(yy - 1)} h20 l1 7 l-6 -2 l-7 3 l-8 -2Z" fill="#3a342c" opacity="0.85"/>`; }
    // the landing halfway and the posts under it
    s += `${box(36, LAND.y + 3, 4, 88, dk)}${box(60, LAND.y + 3, 4, 78, dk)}${line(`M40 ${LAND.y + 8} L60 ${LAND.y + 48} M60 ${LAND.y + 8} L40 ${LAND.y + 48}`, dk, 2, ok ? 1 : 0.4)}`;
    const flight = (list, sign) => {
      const a = list[0], z = list[list.length - 1];
      let g = line(`M${f1(a.x + 7.5)} ${f1(a.y + 1)} L${f1(z.x + 7.5)} ${f1(z.y + 1)}`, dk, 4.6);
      list.forEach((q, i) => {
        if (!ok && i % 3 === 1) return; // gaps where the rotten treads have gone
        const tilt = !ok && i % 3 === 2 ? ` transform="rotate(${sign * 7} ${f1(q.x + 7)} ${f1(q.y)})"` : '';
        g += `<g${tilt}>${box(q.x, q.y - 1.4, 15.4, 3.6, i % 2 ? wood : U.shade(wood, 0.06), ' rx="0.6"')}${box(q.x, q.y + 1.8, 15.4, 0.9, dk)}</g>`;
      });
      return g;
    };
    s += flight(FLIGHT_LOW, 1) + flight(FLIGHT_UP, -1);
    s += `${box(LAND.x0, LAND.y, LAND.x1 - LAND.x0, 4.6, wood, ' rx="0.8"')}${box(LAND.x0, LAND.y, LAND.x1 - LAND.x0, 1, '#fff', ' opacity="0.22"')}${box(LAND.x0, LAND.y + 4, LAND.x1 - LAND.x0, 1.4, dk)}`;
    if (!ok) s += `<path d="M46 ${LAND.y} h11 v5 l-4 -1 l-3 2 l-4 -2Z" fill="#3a342c" opacity="0.8"/>`;
    // the handrails: up from the foot to the landing and on up to the gallery
    const up = (q) => [q.x + 7.5, q.y - 19], A0 = up(FLIGHT_UP[0]), A1 = up(FLIGHT_UP[5]), B0 = up(FLIGHT_LOW[0]), B1 = up(FLIGHT_LOW[5]);
    if (ok) {
      for (const q of [FLIGHT_UP[0], FLIGHT_UP[3], FLIGHT_LOW[2], FLIGHT_LOW[5]]) s += line(`M${f1(q.x + 7.5)} ${f1(q.y - 19)} V${f1(q.y)}`, rail, 1.7);
      s += line(`M${LAND.x0 + 2} ${LAND.y - 20} V${LAND.y} M${LAND.x1 - 12} ${LAND.y - 20} V${LAND.y}`, rail, 1.7);
      s += `${line(`M${at(-84)[0].toFixed(1)} ${f1(at(-84)[1] - 21)} L${f1(A0[0])} ${f1(A0[1])} L${f1(A1[0])} ${f1(A1[1])} L${LAND.x0 + 2} ${LAND.y - 20}`, rail, 2.4)}`;
      s += `${line(`M${LAND.x0 + 2} ${LAND.y - 20} L${f1(B0[0])} ${f1(B0[1])} L${f1(B1[0])} ${f1(B1[1])}`, rail, 2.4)}`;
    } else {
      s += `${line(`M${f1(A0[0])} ${f1(A0[1])} V${f1(A0[1] + 19)}`, rail, 1.7)}${line(`M${f1(A0[0])} ${f1(A0[1])} L${f1(A0[0] - 16)} ${f1(A0[1] + 24)}`, rail, 2.2)}`;
      s += `${line(`M${f1(B1[0])} ${f1(B1[1])} V${f1(B1[1] + 19)}`, rail, 1.7)}${line(`M${f1(B1[0])} ${f1(B1[1])} L${f1(B1[0] - 14)} ${f1(B1[1] + 4)}`, rail, 2.2)}`;
    }
    const all = FLIGHT_UP.concat(FLIGHT_LOW);
    if (p === 'leaves') {
      all.forEach((q, i) => { if (i % 2 === 0) s += oval(q.x + 7, q.y - 2, 3.8, 1.5, LEAFC[i % 3]); });
      for (const a of [-60, -30, 12, 44, 70]) { const [x, yy] = at(a); s += oval(x, yy + 0.6, 3.6, 1.4, LEAFC[Math.abs(a) % 3]); }
      s += oval(44, LAND.y, 3.8, 1.5, LEAFC[1]) + oval(58, LAND.y, 3.8, 1.5, LEAFC[2]);
    } else if (p === 'grow') {
      for (const i of [1, 4, 7, 10]) s += box(all[i].x, all[i].y - 1.4, 15.4, 3.6, FADE, ' opacity="0.6"');
    }
    if (p === 'snow') {
      // deep on every tread, the landing and the gallery floor
      s += `${line(arc(y - 1.4, r), SNOW, 4.2)}${line(`M${CX - r} ${y - 22} Q${CX} ${f1(y - 22 - 2 * sag(y))} ${CX + r} ${y - 22}`, SNOW, 1.8)}`;
      s += ovals(all.map((q) => [q.x + 7.7, q.y - 2, 9.4, 3.2]).concat([[(LAND.x0 + LAND.x1) / 2, LAND.y - 0.6, 17.6, 3.4]]), SNOW);
    } else if (winter()) {
      // swept, with a little left at the ends of the treads
      s += line(arc(y - 0.8, r), SNOW, 1.4, 0.9);
      s += ovals(all.flatMap((q) => [[q.x + 1.6, q.y - 1.8, 1.8, 0.9], [q.x + 13.8, q.y - 1.8, 1.8, 0.9]]), SNOW);
    }
    return s + '</g>';
  }
  // a five-pointed star for the sign
  const star5 = (x, y, r, col) => `<path d="${poly(Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, d = i % 2 ? r * 0.42 : r; return [x + Math.cos(a) * d, y + Math.sin(a) * d]; }))}Z" fill="${col}"/>`;
  function sign(st, C) {
    const p = pend(st, 'sign'), ok = st.sign;
    const col = ok ? C.obsSign : U.mix(C.obsSign, '#a59e90', 0.62), tx = ok ? '#fffaf0' : '#d9d2c4';
    const { x, y, w, h } = SIGNB;
    let s = `<g data-part="sign">${line(`M${x + 12} ${y - 7} V${y + 1} M${x + w - 12} ${y - 7} V${y + 1}`, '#4a4a50', 1)}`;
    s += `${box(x + 1.4, y + 1.8, w, h, '#000', ' opacity="0.14" rx="1.6"')}${box(x, y, w, h, col, ' rx="1.6"')}${box(x, y, w, 1.4, '#fff', ' opacity="0.2" rx="0.7"')}<rect x="${x + 2.4}" y="${y + 2.4}" width="${w - 4.8}" height="${h - 4.8}" rx="1" fill="none" stroke="${tx}" stroke-width="0.6" opacity="0.75"/>`;
    s += star5(x + 12, y + 13.4, 5.4, ok ? '#fff3c4' : '#d9d2c4');
    s += `<text x="${x + 53}" y="${y + 14.4}" text-anchor="middle" font-family="${SERIF}" font-size="10.4" font-weight="700" letter-spacing="0.6" fill="${tx}"${ok ? '' : ' opacity="0.6"'}>${ok ? 'OWL HILL' : 'OWL H LL'}</text>`;
    s += `<text x="${x + 53}" y="${y + 22}" text-anchor="middle" font-family="${FONT}" font-size="4.8" font-weight="900" letter-spacing="1" fill="${tx}"${ok ? '' : ' opacity="0.45"'}>· OBSERVATORY ·</text>`;
    if (!ok) s += `${oval(x + 26, y + 8, 6, 2.4, '#b5a68a', 0.85)}${oval(x + 72, y + 20, 7, 2.2, '#b5a68a', 0.8)}${line(`M${x + 58} ${y} l-3 10 l2 9`, '#5a4a3a', 0.8)}`;
    if (p === 'grow') s += box(x, y, w, h, FADE, ' opacity="0.5" rx="1.6"');
    else if (p === 'frost') s += box(x, y, w, h, url('Frost'), ' opacity="0.5" rx="1.6"');
    else if (p === 'leaves') s += oval(x + 14, y + 1, 3.4, 1.5, '#d9822b') + oval(x + 60, y + 0.6, 3, 1.4, '#c4462f');
    if (winter() || p === 'snow') s += box(x - 1, y - 1.6, w + 2, 2.4, SNOW, ' rx="1.2"');
    return s + '</g>';
  }
  // the arched door, with a fan of glass over it
  function door(st, C) {
    const p = pend(st, 'door'), ok = st.door;
    const col = ok ? C.obsDoor : U.mix(C.obsDoor, '#a59e90', 0.62), dk = U.shade(col, -0.28);
    const brass = ok ? '#d9a93a' : '#8a8576', { x0, x1, y0, y1, ay } = DOOR, cx = (x0 + x1) / 2, r = 17;
    let s = '<g data-part="door">';
    // the stone arch round it
    s += `<path d="M${x0 - 6} ${y1} V${ay} A23 23 0 0 1 ${x1 + 6} ${ay} V${y1}Z" fill="${U.shade(K.stone, 0.12)}"/>`;
    for (let i = 0; i <= 8; i++) { const a = Math.PI + (i * Math.PI) / 8; s += line(`M${f1(cx + Math.cos(a) * r)} ${f1(ay + Math.sin(a) * r)} L${f1(cx + Math.cos(a) * 23)} ${f1(ay + Math.sin(a) * 23)}`, U.shade(K.stone, -0.22), 0.7); }
    for (const yy of [ay + 12, ay + 24, ay + 36]) s += line(`M${x0 - 6} ${yy} h6 M${x1} ${yy} h6`, U.shade(K.stone, -0.22), 0.7);
    s += `<path d="${DOOR_D}" fill="${col}"/>`;
    // the planks and the iron straps
    for (const x of [x0 + 7, x0 + 14, x0 + 21, x0 + 28]) s += line(`M${x} ${ay} V${y1}`, dk, 0.7, 0.75);
    s += `${box(x0, ay + 12, 24, 2, '#3d3d42')}${box(x0, ay + 34, 24, 2, '#3d3d42')}${dot(x0 + 24.6, ay + 13, 1.6, '#3d3d42')}${dot(x0 + 24.6, ay + 35, 1.6, '#3d3d42')}`;
    // the fan of glass
    s += `<path d="M${x0} ${ay} A17 17 0 0 1 ${x1} ${ay}Z" fill="${ok ? '#2b3578' : '#5a5046'}"/>`;
    if (ok) s += `${star5(cx, ay - 8, 4.4, '#f6e9b8')}${dot(cx - 9, ay - 5, 0.7, '#fff')}${dot(cx + 9, ay - 6, 0.7, '#fff')}`;
    else s += `<path d="M${x0} ${ay} A17 17 0 0 1 ${x1} ${ay}Z" fill="${url('Grime')}" opacity="0.65"/>`;
    if (p === 'frost') s += `<path d="M${x0} ${ay} A17 17 0 0 1 ${x1} ${ay}Z" fill="${url('Frost')}" opacity="0.85"/>`;
    s += `${line(`M${x0} ${ay} H${x1} M${cx} ${ay} V${ay - r} M${cx} ${ay} L${f1(cx - 12)} ${f1(ay - 12)} M${cx} ${ay} L${f1(cx + 12)} ${f1(ay - 12)}`, dk, 1)}`;
    // the ring and the keyhole
    s += `<circle cx="${x1 - 6.6}" cy="${ay + 24}" r="2.8" fill="none" stroke="${brass}" stroke-width="1.2"/>${dot(x1 - 6.6, ay + 21, 1, brass)}${box(x1 - 7.8, ay + 31, 2.4, 4, brass, ' rx="0.6"')}`;
    if (!ok) s += `${oval(x0 + 9, ay + 24, 3, 4.6, '#d8cfbf', 0.75)}${oval(x0 + 24, ay + 42, 3.4, 2.4, '#d8cfbf', 0.7)}${line(`M${x1} ${ay} l-8 7 M${x1} ${ay} l-3 10`, '#e8e4da', 0.5, 0.8)}`;
    if (p === 'grow') s += `<path d="${DOOR_D}" fill="${FADE}" opacity="0.5"/>`;
    else if (p === 'leaves') s += oval(x0 + 8, y1 - 1, 3.4, 1.5, '#d9822b') + oval(x1 - 6, y1 - 1, 3, 1.4, '#c4462f');
    return s + '</g>';
  }
  // the lantern on its iron bracket beside the door
  function lantern(st) {
    const p = pend(st, 'lantern'), ok = st.lantern, iron = ok ? '#2a2e3c' : '#6a5242', x = 214, y = 306;
    let s = `<g data-part="lantern">${box(x - 13, y - 14, 26, 38, '#000', ' fill-opacity="0"')}`;
    s += `${line(`M${x - 11} ${y - 8} H${x} V${y - 5}`, iron, 1.6)}${line(`M${x - 11} ${y - 1} Q${x - 5} ${y - 2} ${x - 3} ${y - 8}`, iron, 1)}`;
    const tilt = ok ? '' : ` transform="rotate(5 ${x} ${y - 5})"`;
    s += `<g${tilt}><path d="M${x - 5} ${y + 13} L${x - 6.6} ${y} H${x + 6.6} L${x + 5} ${y + 13}Z" fill="${ok ? '#fff1c9' : url('Grime')}" stroke="${iron}" stroke-width="1.1"/>`;
    if (ok) s += `${box(x - 1.3, y + 6, 2.6, 6, '#fbf7ea')}<path d="M${x} ${y + 2} q2 3 0 4.2 q-2 -1.2 0 -4.2Z" fill="#f2a53c"/>`;
    s += `${line(`M${x - 2} ${y} L${x - 1.6} ${y + 13} M${x + 2} ${y} L${x + 1.6} ${y + 13}`, iron, 0.5)}`;
    s += `<path d="M${x - 8} ${y} L${x} ${y - 6} L${x + 8} ${y}Z" fill="${iron}"/>${dot(x, y - 6.4, 1.3, iron)}${box(x - 6, y + 13, 12, 2, iron, ' rx="0.8"')}`;
    if (!ok) s += `${line(`M${x + 3} ${y + 1} l-3 5 l3 3 l-2 3`, '#eef0e8', 0.6, 0.85)}${oval(x + 6, y - 2, 2.4, 1.2, '#a8603a', 0.8)}${oval(x - 5, y + 12, 2.4, 1, '#a8603a', 0.8)}`;
    if (p) {
      // moths round the glass, and a dull film on it
      s += `<path d="M${x - 5} ${y + 13} L${x - 6.6} ${y} H${x + 6.6} L${x + 5} ${y + 13}Z" fill="${url('Dusty')}" opacity="0.55"/>`;
      for (const [mx, my] of [[-11, 2], [10, 7], [-8, 15], [11, -3]]) s += `<path d="M${x + mx} ${y + my} q-3 -2.4 -4 0 q2 2 4 0 q3 -2.4 4 0 q-2 2 -4 0Z" fill="#c9bfa8"/>`;
    }
    s += '</g>';
    if (winter()) s += line(`M${x - 7.6} ${y - 0.6} L${x} ${y - 6.4} L${x + 7.6} ${y - 0.6}`, SNOW, 1.5);
    return s + '</g>';
  }
  // the paved terrace along the front, its low wall, and the two steps to the door
  function terrace() {
    const old = PCT <= 0.4, top = U.mix(K.deep, '#fff', old ? 0 : 0.2), r = U.rng(467);
    let s = `<path d="M90 362 H366 L382 396 Q330 374 262 372 Q170 370 104 374 Q92 374 84 370Z" fill="${url(old ? 'AshlarOld' : 'Ashlar')}"/>`;
    s += `<path d="M90 362 H366 L382 396 Q330 374 262 372 Q170 370 104 374 Q92 374 84 370Z" fill="#2a2f60" opacity="0.14"/>`;
    s += `<path d="M84 352 H364 L368 362 H80Z" fill="${top}"/>`;
    let d = '';
    for (let x = 96; x < 364; x += 22) d += `M${x} 352 L${x - 2 - (x - 220) * 0.012} 362`;
    s += line(`${d}M82 357 H366`, U.shade(top, -0.24), 0.7, 0.7);
    s += `${box(80, 361.4, 288, 1.6, U.shade(top, -0.3))}${box(84, 352, 280, 1, '#000', ' opacity="0.12"')}`;
    // shadow from the walls on the flags
    s += box(84, 352, 280, 3, '#1a1f4a', ' opacity="0.16"');
    if (PCT < 0.5) for (let i = 0; i < 12; i++) s += tuft(90 + r() * 270, 352 + r() * 9, 3 + r() * 3, '#6f8a3e', 0.8);
    // the steps down to the path
    const st0 = U.shade(top, 0.08);
    s += `${box(150, 362, 52, 5, st0, ' rx="0.8"')}${box(150, 366.4, 52, 1.4, U.shade(top, -0.34))}${box(146, 367.6, 60, 5, st0, ' rx="0.8"')}${box(146, 372, 60, 1.6, U.shade(top, -0.34))}`;
    if (winter()) s += `<path d="M84 352 H364 L368 361 H80Z" fill="${url('Snow')}" opacity="0.9"/>${box(148, 362, 56, 2.2, SNOW, ' rx="1"')}${box(145, 367.8, 62, 2.2, SNOW, ' rx="1"')}`;
    return s;
  }
  // the path winding up the hill: pale gravel between its edging stones once it
  // is cleared, moss and weeds before that
  function pathUp(st) {
    const p = pend(st, 'path'), ok = st.path, r = U.rng(479);
    let s = `<g data-part="path"><path d="${WAY_D}" fill="${url('Pebble' + SEASON)}"/>`;
    if (!ok) s += `<path d="${WAY_D}" fill="${url('Moss')}" opacity="0.72"/>`;
    // the edging stones, smaller towards the top of the hill
    const stone = ok ? '#b9ae9a' : '#8d8a74', kerb = [[], []];
    for (let i = 1; i < 34; i++) {
      const t = i / 34, w = wayAt(t)[2];
      for (const side of [1, -1]) {
        if (!ok && (i + side) % 3 === 0) continue;
        const [x, y] = wayEdge(t, side), j = ok ? 0 : (r() - 0.5) * 3;
        kerb[i % 2].push([x + j, y + j * 0.5, w * 0.22 + 0.6, w * 0.13 + 0.5]);
      }
    }
    s += ovals(kerb[0], U.shade(stone, 0.1)) + ovals(kerb[1], stone);
    if (!ok) {
      const d = ['', '', ''];
      for (let i = 0; i < 24; i++) { const t = 0.04 + r() * 0.94, [x, y, w] = wayAt(t), k = (r() - 0.5) * w * 1.6; d[i % 3] += tuftD(x + k, y + (r() - 0.5) * 4, 5 + w * 0.34); }
      s += line(d[0], '#6f8a3e', 1) + line(d[1], '#8a9a56', 1) + line(d[2], '#5f8a3a', 1);
    } else if (p === 'grow') {
      const moss = [];
      for (let i = 0; i < 12; i++) { const [x, y, w] = wayAt(0.05 + r() * 0.92); moss.push([x + (r() - 0.5) * w, y, w * 0.5, w * 0.2]); }
      s += `<g clip-path="${url('Way')}">${ovals(moss, '#6f8a3e', 0.6)}</g>`;
      let d = '';
      for (let i = 0; i < 9; i++) { const [x, y, w] = wayAt(0.08 + r() * 0.9); d += tuftD(x + (r() - 0.5) * w, y, 4 + w * 0.2); }
      s += line(d, '#6f8a3e', 1);
    }
    if (p === 'leaves') s += `<path d="${WAY_D}" fill="${url('Leaves')}"/>`;
    else if (p === 'snow') s += `<path d="${WAY_D}" fill="${url('Snow')}" opacity="0.95"/>`;
    else if (p === 'frost') s += `<path d="${WAY_D}" fill="${url('Frost')}" opacity="0.55"/>`;
    else if (winter()) {
      // cleared, with the snow banked along it and a line of footprints
      s += `<path d="${WAY_D}" fill="${url('Snow')}" opacity="0.55"/>`;
      const prints = [];
      for (let i = 2; i < 18; i++) { const [x, y, w] = wayAt(i / 18); prints.push([x + (i % 2 ? 1 : -1) * w * 0.28, y, 0.8 + w * 0.08, 0.5 + w * 0.05]); }
      s += ovals(prints, '#a7b0b9', 0.5);
    }
    return s + '</g>';
  }

  // ----------------------------------------------------------------- the hill
  // wild thyme in low cushions down the bank on the right of the path
  const CUSHIONS = [[322, 454, 14], [352, 451, 16], [386, 455, 15], [286, 477, 17], [322, 475, 19], [358, 476, 20], [396, 479, 17], [246, 505, 20], [288, 503, 23], [334, 502, 24], [380, 505, 23], [216, 535, 23], [262, 533, 26], [314, 533, 27], [366, 535, 29], [406, 531, 17]];
  function thyme(st) {
    const p = pend(st, 'thyme'), ok = st.thyme, w = winter(), r = U.rng(487);
    let s = '<g data-part="thyme"><path d="M300 446 Q340 436 406 444 V545 H194 Q210 516 246 494 Q280 472 300 446Z" fill="#000" fill-opacity="0"/>';
    if (!ok) {
      // bare stony ground with a few dry sticks of last year's growth
      s += ovals([[352, 470, 54, 20], [320, 506, 74, 26], [270, 528, 62, 18], [372, 526, 40, 20], [392, 486, 26, 16]], w ? '#e2e6e6' : '#a89a7c', 0.8);
      const pebbles = [[], [], []];
      for (let i = 0; i < 14; i++) pebbles[i % 3].push([230 + r() * 170, 462 + r() * 76, 2 + r() * 3.6, 1.2 + r() * 1.8]);
      s += ovals(pebbles[0], '#b9b09c') + ovals(pebbles[1], '#9c9484') + ovals(pebbles[2], '#c9c0ac');
      let sticks = '';
      for (const [x, y] of [[300, 490], [352, 512], [386, 472], [262, 520], [338, 464]]) sticks += `M${x} ${y}l-5 -8M${x} ${y}l1 -10M${x} ${y}l6 -7M${x - 3} ${y - 5}l-3 -1M${x + 3} ${y - 4}l3 -2`;
      return s + line(sticks, '#8a7a62', 0.9) + '</g>';
    }
    const green = w ? '#7f9a8c' : SEASON === 'autumn' ? '#8a9a60' : SEASON === 'spring' ? '#8fb07a' : '#7b9e70';
    const here = [], young = [];
    CUSHIONS.forEach(([x, y, rx], i) => { (p === 'grow' && i % 2 ? young : here).push([x + (r() - 0.5) * 4, y + (r() - 0.5) * 3, rx * (0.92 + r() * 0.16)]); });
    // the low green carpet they all grow out of
    s += ovals(here.map(([x, y, rx]) => [x, y + 1, rx * 1.34, rx * 0.74]), w ? '#d4dee6' : U.shade(green, -0.1), w ? 0.8 : 0.6);
    s += ovals(young.map(([x, y, rx]) => [x, y + 3, rx * 0.5, rx * 0.17]), '#a8987a', 0.7);
    if (young.length) s += line(young.map(([x, y]) => tuftD(x, y + 3, 6)).join(''), '#7fa85a', 1);
    if (w) {
      // soft humps of snow with the dark sprigs showing round the foot
      s += ovals(here.map(([x, y, rx]) => [x + 2, y + rx * 0.3, rx, rx * 0.4]), '#b4c2d2', 0.5);
      const rim = [];
      for (const [x, y, rx] of here) for (let k = 0; k < 6; k++) { const a = 0.26 + (k / 5) * 2.6 + r() * 0.2; rim.push([x + Math.cos(a) * rx * 0.94, y + Math.sin(a) * rx * 0.44]); }
      s += ovals(here.map(([x, y, rx]) => [x, y, rx, rx * 0.5]), green) + specks(rim, '#5f7a6c', 2.2);
      s += ovals(here.map(([x, y, rx]) => [x - 0.6, y - rx * 0.1, rx * 0.97, rx * 0.46]), SNOW) + ovals(here.map(([x, y, rx]) => [x - rx * 0.2, y - rx * 0.2, rx * 0.5, rx * 0.2]), '#fff');
      return s + '</g>';
    }
    s += ovals(here.map(([x, y, rx]) => [x + 1, y + rx * 0.14, rx, rx * 0.5]), U.shade(green, -0.24));
    s += ovals(here.map(([x, y, rx]) => [x, y, rx, rx * 0.5]), green);
    s += ovals(here.map(([x, y, rx]) => [x - rx * 0.24, y - rx * 0.16, rx * 0.56, rx * 0.25]), U.shade(green, 0.14), 0.7);
    if (SEASON === 'summer') s += ovals(here.map(([x, y, rx]) => [x + rx * 0.06, y - rx * 0.04, rx * 0.8, rx * 0.34]), '#c58ad0', 0.42);
    // sprigs all over, and the flowers of the season
    const leaf = [], dark = [], flowers = [[], [], []];
    const bloom = SEASON === 'summer' ? ['#c58ad0', '#a862b8', '#e4b0dc'] : SEASON === 'spring' ? ['#e0b8dc', '#cfe0b0', '#d9a8d8'] : ['#a88a6a', '#b89a8a', '#8a7a5a'];
    const per = SEASON === 'summer' ? 0.8 : 0.24;
    for (const [x, y, rx] of here) {
      const spot = () => { const a = r() * 6.28, d = Math.sqrt(r()); return [x + Math.cos(a) * d * rx * 0.9, y + Math.sin(a) * d * rx * 0.43]; };
      for (let k = 0; k < rx * 0.5; k++) (k % 3 ? leaf : dark).push(spot());
      for (let k = 0; k < rx * per; k++) flowers[k % 3].push(spot());
    }
    s += grit(leaf, U.shade(green, 0.26), 1.7, 0.8) + grit(dark, U.shade(green, -0.2), 1.7, 0.7);
    flowers.forEach((c, i) => { s += grit(c, bloom[i], 2.3); });
    return s + '</g>';
  }
  // the stone bench under the oak
  function bench(st) {
    const p = pend(st, 'bench'), ok = st.bench, x = 32, y = 404, w = 62, c = '#d6cfc0', dk = U.shade(c, -0.26), lt = U.shade(c, 0.34);
    let s = `<g data-part="bench">${box(x - 6, y - 12, w + 12, 40, '#000', ' fill-opacity="0"')}`;
    if (!ok) {
      const c2 = '#a9a698', d2 = U.shade(c2, -0.26), l2 = U.shade(c2, 0.2);
      // one leg still standing, the slab broken in two and the other leg down
      s += `${shadow(x + w / 2, y + 22, 40, 3.4)}<path d="M${x + 6} ${y + 6} h12 l2 16 h-16Z" fill="${c2}"/><path d="M${x + 16} ${y + 6} h2 l2 16 h-2Z" fill="${d2}"/>`;
      s += `<g transform="rotate(9 ${x + 2} ${y + 4})"><path d="M${x} ${y} H${x + 30} l-3 2 l3 2 l-2 4 H${x}Z" fill="${c2}"/><path d="M${x} ${y} H${x + 30} l-1 -2.4 H${x + 3}Z" fill="${l2}"/></g>`;
      s += `<g transform="rotate(-17 ${x + 58} ${y + 18})"><path d="M${x + 32} ${y + 10} H${x + 62} V${y + 18} H${x + 33} l2 -4Z" fill="${c2}"/><path d="M${x + 33} ${y + 10} H${x + 62} l-2 -2.4 H${x + 35}Z" fill="${l2}"/></g>`;
      s += `<g transform="rotate(68 ${x + 50} ${y + 20})">${box(x + 44, y + 12, 11, 16, d2, ' rx="1"')}</g>`;
      for (const [xx, yy, rx] of [[x + 26, y + 21, 3.4], [x + 36, y + 24, 2.6], [x + 4, y + 23, 3], [x + 68, y + 22, 2.6]]) s += oval(xx, yy, rx, rx * 0.6, c2);
      s += `${oval(x + 10, y + 12, 5, 3.4, '#6f8a3e', 0.75)}${oval(x + 50, y + 14, 6, 2.4, '#748f42', 0.65)}${oval(x + 16, y + 4, 4, 1.8, '#a5a86c', 0.7)}`;
      if (winter()) s += `${oval(x + 16, y + 0.4, 15, 1.6, SNOW)}${oval(x + 48, y + 8, 14, 1.4, SNOW)}`;
      return s + '</g>';
    }
    s += shadow(x + w / 2, y + 22, w / 2 + 8, 3.2);
    for (const lx of [x + 6, x + w - 18]) s += `<path d="M${lx} ${y + 6} h12 l2 16 h-16Z" fill="${c}"/><path d="M${lx + 9} ${y + 6} h3 l2 16 h-3Z" fill="${dk}" opacity="0.7"/>${star5(lx + 5.6, y + 14, 2.6, dk)}`;
    s += `<path d="M${x + 3} ${y - 2.6} H${x + w - 3} L${x + w} ${y + 0.4} H${x}Z" fill="${lt}"/>${box(x, y + 0.4, w, 6, c, ' rx="0.8"')}${box(x, y + 5.6, w, 1, dk)}`;
    if (p === 'grow') s += `${oval(x + 8, y + 6, 6, 2.4, '#6f8a3e', 0.8)}${oval(x + w - 12, y + 20, 7, 2.4, '#748f42', 0.75)}${line(`M${x + 34} ${y + 0.4} l-2 3 l2 3`, dk, 0.7)}${oval(x + 70, y + 22, 3, 1.8, c)}`;
    else if (p === 'leaves') s += oval(x + 14, y - 1, 3.4, 1.5, '#d9822b') + oval(x + 40, y - 1.4, 3.2, 1.4, '#c4462f');
    if (winter() || p === 'snow') s += `<path d="M${x + 2} ${y - 2.6} Q${x + w / 2} ${y - 6.6} ${x + w - 2} ${y - 2.6} L${x + w} ${y + 0.8} H${x}Z" fill="${SNOW}"/>`;
    return s + '</g>';
  }
  // the owl of the stars, ten stars and two for its eyes
  function owlLines(x, y, k) { return OWL_LINES.map(([a, b]) => `M${f1(x + OWL_PTS[a][0] * k)} ${f1(y + OWL_PTS[a][1] * k)}L${f1(x + OWL_PTS[b][0] * k)} ${f1(y + OWL_PTS[b][1] * k)}`).join(''); }
  // a little board on an easel: the figure in chalk, joined star to star
  function starBoard(st) {
    const p = pend(st, 'stars'), ok = st.stars, clean = ok && !p;
    const x = 306, y = 380, w = 46, h = 38, fr = ok ? '#a9794a' : '#7f7668', dk = U.shade(fr, -0.3), slate = ok ? '#1e2860' : '#5a5e66';
    let s = `<g data-part="stars">${box(x - 8, y - 12, w + 16, h + 40, '#000', ' fill-opacity="0"')}${shadow(x + w / 2, y + h + 21, 28, 2.6)}`;
    s += `${line(`M${x + w / 2} ${y - 7} L${x + w / 2 + 4} ${y + h + 18}`, dk, 2.4)}`;
    s += `${line(`M${x + w / 2 - 3} ${y - 9} L${x - 5} ${y + h + 20} M${x + w / 2 + 3} ${y - 9} L${x + w + 5} ${y + h + 20}`, fr, 3)}`;
    const tilt = ok ? '' : ` transform="rotate(-4 ${x + w / 2} ${y + h})"`;
    s += `<g${tilt}>${box(x - 2, y - 2, w + 4, h + 4, dk, ' rx="1"')}${box(x, y, w, h, slate)}`;
    const k = 0.37, ox = x + 4, oy = y + 1.4, chalk = ok ? '#f4f0e0' : '#c9c8bc';
    if (clean) s += line(owlLines(ox, oy, k), chalk, 0.8, 0.85);
    if (ok) {
      OWL_PTS.forEach(([px, py]) => { s += star5(ox + px * k, oy + py * k, 1.9, '#fff3c4'); });
      if (p) s += dot(x + w - 5, y + h - 4, 1.2, chalk);
    } else {
      // an old scuffed slate with only a few stars left on it
      s += `${oval(x + 16, y + 12, 13, 6, '#b5b3a8', 0.6)}${oval(x + 30, y + 26, 12, 5, '#b5b3a8', 0.55)}`;
      for (const i of [0, 3, 6, 8]) s += star5(ox + OWL_PTS[i][0] * k, oy + OWL_PTS[i][1] * k, 1.6, chalk);
    }
    s += `</g>${box(x - 7, y + h + 1.6, w + 14, 3, fr, ' rx="0.8"')}${box(x + 6, y + h, 7, 1.8, '#f4f0e0', ' rx="0.9"')}`;
    if (winter() || p === 'snow') s += `${box(x - 2.4, y - 3.6, w + 4.8, 2.4, SNOW, ' rx="1.2"')}${box(x - 7, y + h, w + 14, 2, SNOW, ' rx="1"')}`;
    return s + '</g>';
  }
  // mess left lying about while the hill is shut up
  function clutter() {
    if (PCT >= 0.5) return '';
    return `<g opacity="${f1(1 - PCT * 1.6)}">
      <g transform="rotate(-6 148 470)">${box(122, 456, 46, 19, '#c9b06a')}${line('M122 462 H168 M122 469 H168 M136 456 V475 M153 456 V475', '#a8894a', 1)}${line('M124 456 l3 -3 M140 456 l4 -4 M160 456 l3 -3', '#c9b06a', 1.2)}</g>
      <g transform="rotate(12 72 500)">${line('M36 520 L112 488 M42 528 L118 496', '#8a7a5a', 2.6)}${[0, 1, 2, 3, 4, 5].map((i) => line(`M${44 + i * 11.6} ${f1(517 - i * 4.9)} l6 7.4`, '#8a7a5a', 2)).join('')}</g>
      ${oval(100, 440, 11, 6.4, '#5f8a7c')}${oval(100, 436, 7.6, 3, '#7fae9c')}
      <g transform="rotate(-14 372 424)">${box(350, 418, 44, 3, '#8a7a5a')}${box(354, 424, 42, 3, '#7a6a4e')}</g>
      ${box(116, 382, 9, 11, '#8a8f90', ' rx="1"')}${oval(120.5, 382, 4.5, 1.3, '#a6aaab')}${line('M118 384 q-1 4 0 8', '#6fae9c', 1.2, 0.8)}</g>`;
  }
  function saleSign() {
    if (!(FORSALE || PCT < 0.15)) return '';
    return `<g transform="translate(-152 -30)"><rect x="338.5" y="484" width="3" height="26" fill="#8a6142"/><g transform="rotate(4 340 480)">
      <rect x="316" y="470" width="48" height="21" rx="2" fill="#f6efe0" stroke="#7d6e58" stroke-width="1.2"/>
      <text x="340" y="483.6" text-anchor="middle" font-family="${FONT}" font-size="8.4" font-weight="900" fill="#3d5a86">FOR SALE</text>
      ${FORSALE ? '' : `<g transform="rotate(-10 340 488)"><rect x="313" y="484" width="54" height="10" fill="#d9534f"/><text x="340" y="492" text-anchor="middle" font-family="${FONT}" font-size="8" font-weight="900" fill="#fff">SOLD</text></g>`}</g></g>`;
  }

  // ------------------------------------------------------------ decorations
  // Bought in the shed; each one is a small drawing at a fixed spot.
  // The fairy lights hang in a ring round the foot of the dome and run up two seams
  const BULBS = (() => {
    const out = [];
    for (let ph = -84; ph <= 84; ph += 9) if (ph < 20 || ph > 58) out.push(domePt(13 + (Math.abs(ph) % 2 ? -1.6 : 0), ph));
    for (const ph of [-45, 0]) for (let th = 26; th <= 80; th += 12) out.push(domePt(th, ph));
    return out;
  })();
  const LAMP = { x: 124, y: 474, r: 9.5 };          // the moon lamp: its foot and the size of the globe
  const FLOWER = [[368, 498, 7], [384, 508, 6], [356, 512, 5.4]]; // the moonflowers
  const petals = ([x, y, r]) => [0, 1, 2, 3, 4].map((k) => { const a = (k / 5) * 6.28 - 1.57; return [x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, r * 0.62]; });
  const OWL = { x: 62, y: 228 };
  const DECOR = {
    // a tartan blanket on the grass, with a flask and a star book
    'oh-blanket': () => {
      let t = `${box(0, 0, 76, 54, '#39437e')}`;
      for (const x of [8, 30, 52]) t += box(x, 0, 10, 54, '#c9804a', ' opacity="0.75"');
      for (const y of [6, 24, 42]) t += box(0, y, 76, 8, '#c9804a', ' opacity="0.55"');
      for (const x of [13, 35, 57]) t += box(x, 0, 1, 54, '#f6efdd', ' opacity="0.7"');
      for (const y of [9.6, 27.6, 45.6]) t += box(0, y, 76, 1, '#f6efdd', ' opacity="0.7"');
      return `<g>${shadow(56, 470, 44, 3)}<g transform="translate(26 444) skewX(-14) scale(1 0.42)"><g transform="translate(6 0)">${t}</g></g>
        ${box(78, 448, 5.4, 11, '#c9804a', ' rx="1.4"')}${box(78.6, 445.6, 4.2, 2.8, '#7e5a3e', ' rx="0.8"')}
        <g transform="rotate(-8 46 454)">${box(36, 451, 15, 5, '#f6efdd', ' rx="0.5"')}${box(36, 450.6, 15, 1.4, '#2c3678')}${dot(43, 453.6, 0.7, '#c9804a')}</g></g>`;
    },
    // a patch of wildflowers low on the slope
    'oh-flowers': () => {
      const r = U.rng(491), cols = ['#5b78d8', '#e2574c', '#f2d24a', '#fffaf0', '#c98ac8'];
      let s = '';
      for (let c = 0; c < 3; c++) {
        let stems = '';
        const petals = cols.map(() => []), hearts = [];
        for (let i = 0; i < 8; i++) {
          const x = 10 + r() * 66, y = 508 + r() * 26, h = 12 + r() * 12, p = petals[(r() * 5) | 0];
          stems += `M${f1(x)} ${f1(y)}q1.4 ${f1(-h / 2)} 0 ${f1(-h)}`;
          for (let k = 0; k < 5; k++) { const a = (k / 5) * 6.28; p.push([x + Math.cos(a) * 1.8, y - h + Math.sin(a) * 1.8]); }
          hearts.push([x, y - h]);
        }
        s += `<g class="oh-sway">${line(stems, '#5f8a3a', 0.9)}${petals.map((p, i) => specks(p, cols[i], 2.5)).join('')}${specks(hearts, '#e9bf4f', 1.7)}</g>`;
      }
      return `<g>${s}</g>`;
    },
    // a stone owl on a block by the door
    'oh-stoneowl': () => {
      const x = 136, y = 356, c = '#b9b4a6', dk = U.shade(c, -0.24), lt = U.shade(c, 0.3);
      return `<g>${shadow(x, y + 1, 11, 1.8)}${box(x - 8, y - 6, 16, 6.4, U.shade(c, -0.1), ' rx="0.8"')}<path d="M${x - 8} ${y - 6} Q${x - 10} ${y - 20} ${x - 7.6} ${y - 27} l3 3 Q${x} ${y - 26} ${x + 4.6} ${y - 24} l3 -3 Q${x + 10} ${y - 20} ${x + 8} ${y - 6}Z" fill="${c}"/>${line(`M${x - 8} ${y - 10} q-1 -8 2 -12`, lt, 1, 0.8)}${dot(x - 3.6, y - 19.4, 3.3, lt)}${dot(x + 3.6, y - 19.4, 3.3, lt)}${dot(x - 3.6, y - 19.4, 1.4, dk)}${dot(x + 3.6, y - 19.4, 1.4, dk)}<path d="M${x - 1.2} ${y - 18} L${x} ${y - 14.6} L${x + 1.2} ${y - 18}Z" fill="${dk}"/>${line(`M${x - 4} ${y - 11} q1.4 1.4 2.8 0 M${x + 1.2} ${y - 11} q1.4 1.4 2.8 0 M${x - 1.4} ${y - 8.4} q1.4 1.4 2.8 0`, dk, 0.6)}</g>`;
    },
    // a brass sundial on its pedestal
    'oh-sundial': () => {
      const x = 140, y = 420, c = '#d6cfc0', dk = U.shade(c, -0.26);
      return `<g>${shadow(x + 2, y + 1, 13, 2)}${box(x - 8.6, y - 3.6, 17.2, 3.6, c, ' rx="0.8"')}<path d="M${x - 4.4} ${y - 3.6} Q${x - 3} ${y - 12} ${x - 5} ${y - 22} H${x + 5} Q${x + 3} ${y - 12} ${x + 4.4} ${y - 3.6}Z" fill="${c}"/><path d="M${x + 1} ${y - 3.6} Q${x + 1.6} ${y - 12} ${x + 1} ${y - 22} H${x + 5} Q${x + 3} ${y - 12} ${x + 4.4} ${y - 3.6}Z" fill="${dk}" opacity="0.6"/>${oval(x, y - 23, 10.4, 3.6, '#a87b2c')}${oval(x, y - 24, 10.4, 3.6, '#e2bb52')}<ellipse cx="${x}" cy="${y - 24}" rx="7.6" ry="2.5" fill="none" stroke="#a87b2c" stroke-width="0.4"/><path d="M${x - 4} ${y - 24} L${x + 3} ${y - 29.6} V${y - 24}Z" fill="#a87b2c"/>${line(`M${x} ${y - 24} l7 1.2`, '#7e5a20', 0.7, 0.7)}</g>`;
    },
    // a spyglass on three legs on the terrace
    'oh-spyglass': () => {
      const x = 240, y = 356;
      return `<g>${shadow(x, y, 12, 1.6)}${line(`M${x} ${y - 24} L${x - 10} ${y} M${x} ${y - 24} L${x + 10} ${y} M${x} ${y - 24} L${x + 1} ${y - 1}`, '#7e5a3e', 1.7)}<g transform="translate(${x} ${y - 26}) rotate(-30)">${box(-15, -2.4, 13, 4.8, url('Brass'))}${box(-2, -3.2, 11, 6.4, url('Brass'))}${box(9, -4.2, 9, 8.4, url('Brass'), ' rx="0.8"')}${box(8.4, -4.6, 1.6, 9.2, '#7e5a20')}${box(-16, -3, 1.6, 6, '#7e5a20')}</g>${dot(x, y - 25, 1.9, '#5a4a3a')}</g>`;
    },
    // a lamp like a little moon, on an iron post beside the path
    'oh-moonlamp': () => {
      const { x, y, r } = LAMP, top = y - 44;
      return `<g>${shadow(x, y + 1, 9, 1.6)}${line(`M${x} ${y} V${top + r}`, '#2f3442', 2.2)}${line(`M${x - 5} ${y} H${x + 5}`, '#2f3442', 2.6)}${line(`M${x - 3.6} ${top + r + 2} H${x + 3.6}`, '#2f3442', 1.6)}${dot(x, top, r, '#f6efd6')}${dot(x - 3, top - 3, 2.2, '#dcd2b0')}${dot(x + 3.4, top + 1.6, 1.6, '#dcd2b0')}${dot(x - 1.4, top + 4.6, 1.2, '#dcd2b0')}${dot(x + 3.6, top - 4.4, 1, '#dcd2b0')}<path d="M${x - 3.4} ${top - r + 0.8} q3.4 -2.4 6.8 0Z" fill="#2f3442"/></g>`;
    },
    // a tawny owl on a bough of the oak
    'oh-owl': () => {
      const { x, y } = OWL, c = '#8f6e4c', lt = '#d9c29a', dk = '#5a4430';
      let s = `${line(`M${x - 22} ${y + 13} Q${x} ${y + 3} ${x + 20} ${y - 4}`, '#6e5644', 4.4)}${line(`M${x + 8} ${y + 1} q5 -6 12 -8`, '#6e5644', 2)}`;
      s += `<path d="M${x - 8} ${y + 4} Q${x - 11} ${y - 8} ${x - 8} ${y - 15} Q${x - 7} ${y - 23} ${x} ${y - 23} Q${x + 7} ${y - 23} ${x + 8} ${y - 15} Q${x + 11} ${y - 8} ${x + 8} ${y + 4} Q${x} ${y + 7} ${x - 8} ${y + 4}Z" fill="${c}"/>`;
      s += `<path d="M${x - 4.6} ${y + 3} Q${x - 6} ${y - 6} ${x} ${y - 8} Q${x + 6} ${y - 6} ${x + 4.6} ${y + 3}Z" fill="${lt}"/>`;
      for (const [dx, dy] of [[-2.4, -4], [1, -3], [2.8, -5.6], [-1, 0], [2.4, 0.4], [-2.8, 0.6]]) s += `<path d="M${x + dx - 1} ${y + dy} q1 1.4 2 0" stroke="${dk}" stroke-width="0.6" fill="none"/>`;
      s += `${dot(x - 3.6, y - 15, 4.4, lt)}${dot(x + 3.6, y - 15, 4.4, lt)}${dot(x - 3.4, y - 15, 2.5, '#2a2018')}${dot(x + 3.4, y - 15, 2.5, '#2a2018')}${dot(x - 2.8, y - 15.8, 0.7, '#fff')}${dot(x + 4, y - 15.8, 0.7, '#fff')}<path d="M${x - 1.3} ${y - 13.6} L${x} ${y - 10.4} L${x + 1.3} ${y - 13.6}Z" fill="#d9a23c"/>`;
      s += `${line(`M${x - 8} ${y - 6} q-2 5 -0.6 10 M${x + 8} ${y - 6} q2 5 0.6 10`, dk, 1.1, 0.8)}${line(`M${x - 4} ${y + 5.4} l-1 1.6 M${x - 2.4} ${y + 5.8} l0 1.8 M${x + 2.4} ${y + 5.8} l0 1.8 M${x + 4} ${y + 5.4} l1 1.6`, '#d9a23c', 1)}`;
      return `<g>${s}</g>`;
    },
    // a white louvred box on legs, a rain gauge and a little anemometer
    'oh-weather': () => {
      const x = 380, y = 434;
      let s = `${shadow(x, y + 1, 14, 2)}${line(`M${x - 8} ${y} V${y - 17} M${x + 8} ${y} V${y - 17}`, '#efe9dc', 1.8)}${line(`M${x - 8} ${y - 8} H${x + 8}`, '#d9d2c2', 1)}`;
      s += `${box(x - 11, y - 34, 22, 18, '#f7f2e6', ' rx="0.8"')}<path d="M${x - 13} ${y - 34} L${x} ${y - 39} L${x + 13} ${y - 34}Z" fill="#ece5d6"/>`;
      for (let k = 1; k < 6; k++) s += line(`M${x - 9.6} ${y - 34 + k * 3} H${x + 9.6}`, '#b9b2a2', 0.6);
      s += `${box(x - 18, y - 12, 5, 12, '#a6b4bd', ' rx="1"')}${box(x - 18, y - 6, 5, 6, '#6d93d0', ' rx="1" opacity="0.6"')}`;
      s += line(`M${x} ${y - 39} V${y - 50}`, '#6b6b70', 1);
      s += `<g class="oh-spin">${box(x - 8, y - 58, 16, 16, '#000', ' fill-opacity="0"')}${[0, 120, 240].map((a, i) => `<g transform="rotate(${a} ${x} ${y - 50})">${line(`M${x} ${y - 50} V${y - 57}`, '#8a8f90', 0.8)}<path d="M${x - 2.6} ${y - 57} a2.6 2.6 0 0 0 5.2 0Z" fill="${['#c9804a', '#39437e', '#c9804a'][i]}"/></g>`).join('')}</g>${dot(x, y - 50, 1.1, '#3d3d42')}`;
      return `<g>${s}</g>`;
    },
    // fairy lights round the dome, on the winter job or bought in the shed
    'oh-lights': () => {
      const ring = BULBS.slice(0, BULBS.length - 10);
      return `<g>${line(poly(ring.filter((p) => p[0] < 208)), '#3d3d42', 0.5, 0.7)}${line(poly(ring.filter((p) => p[0] > 208)), '#3d3d42', 0.5, 0.7)}${[-45, 0].map((ph) => line(meridian(ph, 24, 84), '#3d3d42', 0.5, 0.7)).join('')}${BULBS.map(([x, y], i) => `<circle class="bulb" cx="${f1(x)}" cy="${f1(y)}" r="1.6" fill="${BULB_COLS[i % 4]}"/>`).join('')}</g>`;
    },
    // a bench made of one great dark stone fallen from the sky
    'oh-meteor': () => {
      const x = 176, y = 466, c = '#505468', dk = '#2f3344', lt = '#868ca2';
      let s = `${shadow(x, y + 1, 34, 3.4)}<path d="M${x - 26} ${y + 1} L${x - 31} ${y - 8} L${x - 25} ${y - 19} L${x - 11} ${y - 23} L${x + 11} ${y - 24} L${x + 25} ${y - 20} L${x + 32} ${y - 10} L${x + 27} ${y + 1} Q${x} ${y + 5} ${x - 26} ${y + 1}Z" fill="${c}"/>`;
      s += `<path d="M${x - 25} ${y - 19} L${x - 11} ${y - 23} L${x + 11} ${y - 24} L${x + 25} ${y - 20} L${x + 19} ${y - 14.6} L${x - 18} ${y - 14}Z" fill="${lt}"/>`;
      s += line(`M${x - 18} ${y - 14} L${x - 31} ${y - 8} M${x + 19} ${y - 14.6} L${x + 32} ${y - 10} M${x - 18} ${y - 14} L${x - 20} ${y} M${x + 19} ${y - 14.6} L${x + 16} ${y + 1}`, dk, 0.8, 0.8);
      s += ovals([[x - 24, y - 7, 2.6, 2], [x - 8, y - 8, 2.2, 1.7], [x + 2, y - 3, 1.6, 1.2], [x + 9, y - 9, 2.4, 1.8], [x + 24, y - 6, 2.4, 2], [x - 12, y - 2, 1.4, 1]], dk);
      s += specks([[x - 14, y - 19], [x + 6, y - 21], [x + 15, y - 18], [x - 3, y - 17]], '#f6efdd', 1.2);
      return `<g>${s}</g>`;
    },
    // moonflowers open among the thyme, white and wide
    'oh-moonflower': () => {
      let s = `${line('M372 530 Q362 516 368 498 M370 520 Q378 516 384 508 M366 516 Q358 518 356 512', '#4f7a54', 1.4)}<path d="${[[360, 522], [378, 524], [372, 512]].map(([x, y]) => `M${x} ${y}q-6 -5 -8 2q4 5 8 -2Z`).join('')}" fill="#5a8a5c"/>`;
      s += ovals(FLOWER.flatMap(petals), '#fbf8ee') + ovals(FLOWER.map(([x, y, r]) => [x, y, r * 0.42]), '#f2eccb') + specks(FLOWER.map(([x, y]) => [x, y]), '#d9c86a', 2);
      return `<g>${s}</g>`;
    },
    // a copper arrow on the very top of the dome
    'oh-vane': () => {
      const [tx, ty] = domePt(90, 0), y = ty - 31;
      return `<g>${line(`M${tx} ${ty - 16} V${y - 8}`, '#7c4026', 1.4)}${line(`M${tx - 8} ${y + 8} H${tx + 8} M${tx} ${y + 3} V${y + 13}`, '#7c4026', 0.8)}${text(tx - 11, y + 9.6, 'W', 4, '#7c4026')}${text(tx + 11, y + 9.6, 'E', 4, '#7c4026')}<g class="oh-vane">${box(tx - 20, y - 6, 40, 12, '#000', ' fill-opacity="0"')}${line(`M${tx - 15} ${y} H${tx + 11}`, '#c9804a', 1.6)}<path d="M${tx + 18} ${y} L${tx + 9} ${y - 4} L${tx + 11} ${y} L${tx + 9} ${y + 4}Z" fill="#d98a50"/><path d="M${tx - 18} ${y - 4} L${tx - 11} ${y - 4} L${tx - 8} ${y} L${tx - 11} ${y + 4} L${tx - 18} ${y + 4} L${tx - 15} ${y}Z" fill="#d98a50"/><path d="M${tx - 2} ${y - 6} a3.4 3.4 0 1 0 3.4 5 a2.8 2.8 0 1 1 -3.4 -5Z" fill="#8ed2b6"/></g>${dot(tx, y - 8.6, 1.6, '#d9a04a')}</g>`;
    },
  };
  const BULB_COLS = ['#ffe9b0', '#ffd98a', '#fff3c4', '#ffe2a0'];
  function decorations(owned) {
    let s = '';
    for (const k of Object.keys(DECOR)) if (owned[k]) s += DECOR[k]();
    return s;
  }

  function butterfly(x, y, col) {
    return `<g transform="translate(${f1(x)} ${f1(y)})"><g class="oh-flit"><g class="oh-wing"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="${col}"/></g>${line('M0 -2 V2', '#3d3d42', 0.8)}</g></g>`;
  }
  const bee = (x, y) => `<g transform="translate(${f1(x)} ${f1(y)})"><g class="oh-flit">${oval(0, 0, 1.7, 1.1, '#e9b23c')}${line('M-0.4 -1 V1 M0.6 -1 V1', '#2f2a2a', 0.5)}${oval(0, -1.2, 1.3, 0.8, '#fff', 0.7)}</g></g>`;
  function life(st) {
    let s = '';
    if (PCT > 0.3 && !NIGHT) s += '<g class="bird"><path d="M262 40 q4 -4 8 0 q4 -4 8 0 M286 54 q3 -3 6 0 q3 -3 6 0" stroke="#4a4a50" stroke-width="1.5" fill="none"/></g>';
    if (PCT > 0.6 && !NIGHT && st.thyme && (SEASON === 'summer' || SEASON === 'spring')) s += `<g pointer-events="none">${butterfly(300, 446, '#c5a6e8')}${butterfly(354, 478, '#fbd85c')}${SEASON === 'summer' ? bee(330, 462) + bee(280, 492) + bee(372, 494) : ''}</g>`;
    // a robin on the bench in the winter, a sparrow the rest of the year
    if (PCT > 0.6 && st.bench && !NIGHT) {
      const x = 74, y = 399, w = winter(), c = w ? '#7a6a5a' : '#8a6a52';
      s += `<g class="oh-hop">${oval(x, y, 4.2, 2.8, c)}${dot(x + 3.2, y - 2.4, 2, c)}${dot(x + 3.8, y - 2.8, 0.5, '#222')}${w ? `${oval(x + 2.4, y - 0.6, 2.2, 1.8, '#d9622f')}` : ''}<path d="M${x + 5} ${y - 2.2} l1.6 0.4 l-1.6 0.4Z" fill="#c9a06a"/>${line(`M${x - 1} ${y + 2.6} v1.8 M${x + 1} ${y + 2.6} v1.8`, '#6b4a32', 0.5)}</g>`;
    }
    return s;
  }
  // nothing to do here this season: a hare in the grass lifts its ears
  function hare() {
    const x = 150, y = 496, c = '#a98a62', dk = '#7f6444', lt = '#d9c7a4', g = winter() ? '#b9c4b4' : SEASON === 'autumn' ? '#a89050' : '#6f9a4a';
    const ears = `<g class="oh-ears"><path d="M${x + 8.4} ${y - 15.6} q-3 -9 0 -15 q3.4 6 2.4 15Z" fill="${c}"/><path d="M${x + 11.4} ${y - 15.4} q-1 -10 3 -14.6 q2.4 7 -0.2 14.8Z" fill="${dk}"/><path d="M${x + 9.2} ${y - 17} q-1.6 -6 -0.2 -10.4 q1.6 4.6 1 10.4Z" fill="#e0b9a0"/></g>`;
    return `<g class="rest">${shadow(x, y + 0.6, 17, 2.2)}<path d="M${x - 15} ${y} Q${x - 18} ${y - 9} ${x - 7} ${y - 13} Q${x + 3} ${y - 16} ${x + 7} ${y - 11} L${x + 8} ${y} Z" fill="${c}"/>${dot(x - 15, y - 7, 3, '#f4efe2')}<g class="oh-sniff">${ears}<path d="M${x + 3} ${y - 11} Q${x + 3} ${y - 18} ${x + 10} ${y - 17.4} Q${x + 16.4} ${y - 16.6} ${x + 16} ${y - 12} Q${x + 15} ${y - 8.6} ${x + 8} ${y - 8.4}Z" fill="${c}"/>${dot(x + 10.4, y - 14, 1, '#2a2018')}${dot(x + 10.7, y - 14.4, 0.3, '#fff')}${dot(x + 15.6, y - 12, 0.8, '#7a5a4a')}</g>${oval(x - 4, y - 7, 7, 4.4, lt, 0.32)}<path d="M${x - 11} ${y} Q${x - 9} ${y - 7} ${x - 2} ${y - 5.6} Q${x + 1} ${y - 3.4} ${x - 1} ${y}Z" fill="${dk}" opacity="0.4"/>${box(x + 5, y - 1.6, 8, 1.8, c, ' rx="0.9"')}${tuft(x - 12, y + 3, 9, g, 1.1)}${tuft(x + 2, y + 3.4, 10, g, 1.1)}${tuft(x + 15, y + 3, 8, g, 1.1)}</g>`;
  }
  function weather() {
    let s = '';
    if (winter()) {
      for (let i = 0; i < 26; i++) s += `<circle class="flake" cx="${(i * 61) % 400}" cy="-10" r="${1.5 + (i % 3) * 0.7}" fill="#fff" style="animation-delay:-${((i * 0.83) % 9).toFixed(2)}s;animation-duration:${7 + (i % 5)}s"/>`;
    } else if (SEASON === 'autumn') {
      const cols = ['#d9822b', '#c4462f', '#e9b23c'];
      for (let i = 0; i < 7; i++) s += `<ellipse class="fleaf" cx="${(i * 67 + 20) % 400}" cy="-10" rx="4" ry="2" fill="${cols[i % 3]}" style="animation-delay:-${((i * 1.3) % 10).toFixed(1)}s;animation-duration:${9 + (i % 4)}s"/>`;
    } else if (SEASON === 'spring') {
      for (let i = 0; i < 8; i++) s += `<ellipse class="fleaf" cx="${(i * 53 + 10) % 400}" cy="-10" rx="2.6" ry="1.6" fill="#fbf2f4" style="animation-delay:-${((i * 1.7) % 11).toFixed(1)}s;animation-duration:${11 + (i % 3)}s"/>`;
    }
    return `<g class="weather" pointer-events="none">${s}</g>`;
  }

  // evening, this hill's best hour: everything darkens but the lit glass, then
  // the moon at the end of the telescope, many stars and the owl of the stars
  const MOON = { x: 332, y: 66, r: 21 };
  // no star may fall in front of the dome, the oak, the telescope or the roofs
  function openSky(x, y) {
    if (y > 306 || (x > 236 && y > 204) || Math.hypot(x - MOON.x, y - MOON.y) < MOON.r + 14) return false;
    if (((x - CX) / (DOME.rx + 7)) ** 2 + ((y - DOME.y) / (DOME.ry + 7)) ** 2 < 1 || (Math.abs(x - CX) < 22 && y < 150 && y > 92)) return false;
    for (const [bx, by, r] of CROWN_OAK) if (Math.hypot(x - bx, y - by) < r * 1.36 + 3) return false;
    // the distance from the line of the telescope
    const dx = x - SCOPE.x, dy = y - SCOPE.y, ca = Math.cos(rad(SCOPE.a)), sa = Math.sin(rad(SCOPE.a)), along = dx * ca + dy * sa, off = -dx * sa + dy * ca;
    return !(along > -10 && along < SCOPE.len + 12 && Math.abs(off) < 20);
  }
  function stars() {
    const r = U.rng(499), still = [[], []];
    let s = '';
    for (let n = 0, tries = 0; n < 92 && tries < 600; tries++) {
      const x = r() * 400, y = 3 + Math.pow(r(), 1.5) * 300, t = r();
      if (!openSky(x, y)) continue;
      n++;
      if (n % 13 === 0) s += `<path d="M${f1(x)} ${f1(y - 4)}L${f1(x + 0.8)} ${f1(y - 0.8)}L${f1(x + 4)} ${f1(y)}L${f1(x + 0.8)} ${f1(y + 0.8)}L${f1(x)} ${f1(y + 4)}L${f1(x - 0.8)} ${f1(y + 0.8)}L${f1(x - 4)} ${f1(y)}L${f1(x - 0.8)} ${f1(y - 0.8)}Z" fill="#fff"/>`;
      else if (n % 4 === 0) s += `<circle class="star" cx="${f1(x)}" cy="${f1(y)}" r="${f1(0.7 + t * 0.7)}" fill="#fff" style="animation-delay:-${(t * 4).toFixed(1)}s"/>`;
      else still[n % 2].push([x, y]);
    }
    return grit(still[0], '#fff', 1.5) + grit(still[1], '#dfe6ff', 2.1) + s;
  }
  // the owl of the stars over the top left of the hill: its stars are always
  // there, and the job joins them
  function skyOwl(joined) {
    const x = 34, y = 22, k = 0.92;
    let s = joined ? line(owlLines(x, y, k), '#cfd8ff', 0.9, 0.42) : '';
    const pts = OWL_PTS.map(([px, py]) => [x + px * k, y + py * k]);
    return s + specks(pts, '#dfe6ff', 9.2, 0.16) + specks(pts, '#fff', 3.3);
  }
  function moon() {
    const { x, y, r } = MOON;
    let s = `<circle cx="${x}" cy="${y}" r="${r * 3.8}" fill="${url('Halo')}"/>${dot(x, y, r, '#fff6d8')}`;
    for (const [dx, dy, c] of [[-7, -6, 4], [5, -9, 2.6], [8, 4, 4.6], [-3, 8, 3], [-11, 5, 2], [12, -3, 1.6], [1, 1, 1.6]]) s += `${dot(x + dx, y + dy, c, '#e8dcb4', 0.8)}${dot(x + dx + 0.5, y + dy + 0.5, c * 0.7, '#f2e8c6', 0.8)}`;
    s += `<path d="M${x} ${y - r} A${r} ${r} 0 0 0 ${x} ${y + r} A${r * 0.62} ${r} 0 0 1 ${x} ${y - r}Z" fill="#141c58" opacity="0.86"/>`;
    return s;
  }
  // a thin warm edge along the far side of the slit, lit from inside
  const slitRim = (ph) => `${poly(steps(SLIT.th0, SLIT.th1, 9).map((th) => domePt(th, ph)))} ${poly(steps(SLIT.th1, SLIT.th0, 9).map((th) => domePt(th, ph + 2.4))).replace('M', 'L')}Z`;
  const scopePt = (x, y) => { const a = rad(SCOPE.a), c = Math.cos(a), n = Math.sin(a); return [SCOPE.x + x * c - y * n, SCOPE.y + x * n + y * c]; };
  function night(st, decor) {
    const room = st.window, lamp = st.lantern, slitOn = st.telescope, fan = st.door;
    const { x0, x1, y0, y1 } = WIN;
    const LAMPG = 'M209 319 L207.4 306 H220.6 L219 319Z', FAN = `M${DOOR.x0} ${DOOR.ay} A17 17 0 0 1 ${DOOR.x1} ${DOOR.ay}Z`, LANCET = 'M121.4 332 V307 Q121.4 296 127 292 Q132.6 296 132.6 307 V332Z';
    let holes = '';
    if (room) for (const [a, b] of [[x0 + 1.6, BARX[0] - 0.9], [BARX[0] + 0.9, BARX[1] - 0.9], [BARX[1] + 0.9, x1 - 1.6]]) for (const [c, d] of [[y0 + 1.6, BARY - 0.9], [BARY + 0.9, y1 - 1.6]]) holes += `<rect x="${a}" y="${c}" width="${f1(b - a)}" height="${f1(d - c)}"/>`;
    const all = 'y="-4" width="400" height="548"';
    let s = `<mask id="${id('Dark')}"><rect ${all} fill="#fff"/><g fill="#6a6a6a">${holes}</g></mask>
      <rect ${all} fill="#1b2350" opacity="0.6" style="mix-blend-mode:multiply" mask="url(#${id('Dark')})"/>
      <rect ${all} fill="#1f2a66" opacity="0.24" mask="url(#${id('Dark')})"/>`;
    const glow = (x, y, rx, ry = rx) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${ry}" fill="${url('Glow')}"/>`;
    s += stars() + skyOwl(st.stars && !PEND.stars) + moon();
    // a falling star now and then
    s += `<path class="oh-fall" d="M246 34 l-22 9.4" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity="0"/>`;
    // the moon on the dome, the roof and the crown of the hill
    s += `${line(poly(steps(8, 84, 10).map((t) => domePt(t, 84))), '#dfe6ff', 1.6, 0.42)}${line(poly(steps(50, 86, 6).map((t) => domePt(t, 30))), '#dfe6ff', 1.2, 0.2)}${line('M334 252 L366 280', '#dfe6ff', 1.2, 0.3)}<path d="${WAY_D}" fill="#b8c2f0" opacity="0.12"/>`;
    // a glint in the lens
    if (st.lens) { const [lx, ly] = scopePt(SCOPE.len + 1, -4); s += `<path d="M${f1(lx)} ${f1(ly - 5)}L${f1(lx + 0.8)} ${f1(ly - 0.8)}L${f1(lx + 5)} ${f1(ly)}L${f1(lx + 0.8)} ${f1(ly + 0.8)}L${f1(lx)} ${f1(ly + 5)}L${f1(lx - 0.8)} ${f1(ly + 0.8)}L${f1(lx - 5)} ${f1(ly)}L${f1(lx - 0.8)} ${f1(ly - 0.8)}Z" fill="#fff"/>`; }
    // a few windows far away in the village
    s += ovals([[366, 346, 0.8], [370, 345, 0.8], [378, 348, 0.8], [393, 346, 0.8], [359, 349, 0.8], [397, 345, 0.8]], '#ffd98a');
    if (slitOn) {
      // warm light in the slit, behind the black shape of the telescope
      const a = scopePt(-24, -13), b = scopePt(40, -13), c = scopePt(40, 13), d = scopePt(-24, 13);
      s += `<mask id="${id('Tube')}"><rect width="400" height="300" fill="#fff"/><path d="${poly([a, b, c, d])}Z" fill="#000"/></mask>`;
      s += `<path d="${SLIT_D}" fill="${url('SlitGlow')}" mask="url(#${id('Tube')})"/>${line(ringD(26, 24, 54) + ringD(46, 24, 54), '#8a4a2a', 1.1, 0.55)}`;
      s += `<path d="${slitRim(SLIT.b + 0.6)}" fill="#ffd98a" opacity="0.8"/><path d="${slitRim(SLIT.a - 3)}" fill="#ffd98a" opacity="0.5"/>`;
      const [gx, gy] = domePt(40, 39);
      s += `<path d="${poly([scopePt(2, 6), scopePt(30, 6), scopePt(30, 8.4), scopePt(2, 8.4)])}Z" fill="#ffe2a0" opacity="0.7"/>${glow(gx, gy, 58, 66)}`;
      s += `<path d="${LANCET}" fill="#ffd98a" opacity="0.72"/>${glow(127, 312, 18, 28)}`;
    }
    if (room) s += `${box(x0, y0, x1 - x0, y1 - y0, '#ffd98a', ' opacity="0.3"')}${glow(303, 315, 96, 56)}${glow(303, 366, 76, 11)}`;
    if (fan) s += `<path d="${FAN}" fill="#ffd98a" opacity="0.62"/>${glow(176, 296, 26, 18)}`;
    if (lamp) s += `<path d="${LAMPG}" fill="#ffe9b0" opacity="0.92"/>${glow(214, 312, 30, 30)}${glow(196, 358, 46, 7)}${glow(176, 382, 40, 14)}`;
    if (decor['oh-moonlamp']) {
      const { x, y, r } = LAMP, top = y - 44;
      s += `${dot(x, top, r, '#ffefb0')}${dot(x - 3, top - 3, 2.2, '#f2dc9a')}${dot(x + 3.4, top + 1.6, 1.6, '#f2dc9a')}${glow(x, top, 46, 46)}${glow(x, y + 2, 34, 8)}`;
    }
    if (decor['oh-moonflower']) s += ovals(FLOWER.flatMap(petals), '#fff3c4', 0.8) + FLOWER.map(([x, y, r]) => glow(x, y, f1(r * 3.4))).join('');
    if (decor['oh-lights']) s += BULBS.map(([x, y], i) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.8" fill="${BULB_COLS[i % 4]}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="4.8" fill="${BULB_COLS[i % 4]}" opacity="0.2"/>`).join('');
    if (decor['oh-owl']) { const { x, y } = OWL; s += dot(x - 3.4, y - 15, 1.5, '#ffe2a0') + dot(x + 3.4, y - 15, 1.5, '#ffe2a0'); }
    // fireflies over the thyme on a summer evening
    if (SEASON === 'summer' && st.thyme) for (const [x, y] of [[296, 458], [338, 484], [372, 452], [262, 498], [316, 516], [388, 500]]) s += `<g class="oh-fly">${dot(x, y, 1.2, '#fff3c4')}${dot(x, y, 4.4, '#fff3c4', 0.2)}</g>`;
    return `<g class="night" pointer-events="none">${s}</g>`;
  }

  const SPOTS = {
    path: [232, 468], grass: [120, 424], dome: [156, 190], lens: [Math.round(scopeTip[0]), Math.round(scopeTip[1])], telescope: [262, 146], window: [303, 315], charts: [303, 300], door: [176, 322],
    sign: [176, 264], lantern: [214, 314], bench: [62, 410], steps: [60, 300], thyme: [330, 492], stars: [329, 398], jigsaw: [318, 328],
  };
  const PARTS = ['path', 'grass', 'dome', 'lens', 'telescope', 'window', 'charts', 'door', 'sign', 'lantern', 'bench', 'steps', 'thyme', 'stars', 'jigsaw'];
  function sparkles(part) {
    if (!part) return '';
    const spot = SPOTS[part] || [200, 330];
    let s = '';
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2, d = 18 + (i % 3) * 10;
      const x = spot[0] + Math.cos(a) * d, y = spot[1] + Math.sin(a) * d * 0.7;
      s += `<path class="spark" style="animation-delay:${(i * 0.09).toFixed(2)}s" d="M${f1(x)} ${f1(y - 6)} L${f1(x + 1.5)} ${f1(y - 1.5)} L${f1(x + 6)} ${f1(y)} L${f1(x + 1.5)} ${f1(y + 1.5)} L${f1(x)} ${f1(y + 6)} L${f1(x - 1.5)} ${f1(y + 1.5)} L${f1(x - 6)} ${f1(y)} L${f1(x - 1.5)} ${f1(y - 1.5)}Z" fill="#fff7cc"/>`;
    }
    return `<g class="sparkles" pointer-events="none">${s}</g>`;
  }

  // st: map of restored part -> true; cols: chosen paint colours (obsDoor,
  // obsSign); opts as for LOFT.render: season, pending, uid, forSale, pct, night,
  // decor, resting, fresh
  function render(st = {}, cols = {}, opts = {}) {
    SEASON = SKY[opts.season] ? opts.season : 'spring'; PEND = opts.pending || {}; UID = opts.uid ? String(opts.uid).replace(/[^\w-]/g, '') : ''; FORSALE = !!opts.forSale;
    PCT = U.clamp(opts.pct || 0, 0, 1); NIGHT = !!opts.night;
    const decor = opts.decor || {};
    palette({ obsDoor: cols.obsDoor || '#3d5a86', obsSign: cols.obsSign || '#d98b63' });
    const C = K.C;
    return `<svg viewBox="0 0 ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" class="house observatory">
      ${style()}${defs(st)}${sky()}${far()}${hill()}${grassBack(st)}${NIGHT ? '' : oval(92, 436, 210, 92, url('Soft'))}${slope()}${oak()}${chimney()}${wing()}
      <g clip-path="${url('Win')}">${roomInside(st)}</g>${windowGlass(st)}${drum()}${dome(st)}${telescope(st)}${lens(st)}${cornice()}${stairs(st)}${sign(st, C)}${door(st, C)}${lantern(st)}
      ${pathUp(st)}${terrace()}${grassFront(st)}${thyme(st)}${bench(st)}${starBoard(st)}${clutter()}${saleSign()}
      ${decorations(decor)}${life(st)}${opts.resting ? hare() : ''}${weather()}${opts.night ? night(st, decor) : ''}${sparkles(opts.fresh)}
    </svg>`;
  }

  return { render, DECOR, PARTS };
})();
