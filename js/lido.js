'use strict';
// Sunnybank Lido, drawn as SVG the same way as the cottage (house.js), the loft
// and the stables, but seen from a little above so the pool fills the middle of
// the picture. An art deco open-air bath: a cream building with round corners
// and long horizontal bands at the back, with the kiosk in it and the sign on
// top, a turnstile gate beside it, a row of changing huts down one side, a
// diving board at the deep end, steps and a starfish mosaic at the shallow end,
// a fountain standing in the pool and the sun terrace in front with its deck
// chairs on their chalk marks. Once its tiles are done the pool follows the
// season (waterLevel below). Each restorable part has a tired look and a
// restored look; the huts, the gate and the sign take the colours chosen while
// painting. Every id carries an 's' prefix (plus opts.uid when given) so this
// picture can share a page with the others.

const LIDO = (() => {
  const VB = { w: 400, h: 540 };
  const FONT = "ui-rounded,'SF Pro Rounded',system-ui,sans-serif";
  const SERIF = "Georgia,'Times New Roman',serif";

  // set at the start of every render: the season, which parts have a seasonal
  // job waiting (part -> 'grow' | 'leaves' | 'snow' | 'frost'), the id suffix,
  // whether the lido is still for sale, how far along it is, how much water is
  // in the pool and the colours worked out from all that
  let SEASON = 'spring', PEND = {}, UID = '', FORSALE = false, PCT = 0, K = {}, NIGHT = false, LEVEL = 'murky', STAMP = '';
  // what the defs hold changes with the season and the pool, so their ids do too
  const id = (n) => `s${n}${UID}${STAMP}`;
  const url = (n) => `url(#${id(n)})`;
  const pend = (st, p) => (st[p] ? PEND[p] : undefined);
  const f1 = (v) => +(+v).toFixed(1);
  const SNOW = '#f4f8fb';
  const FADE = '#cfc6b6';
  const FALL = ['#d9822b', '#c4462f', '#e9b23c', '#9c5a2a'];
  const winter = () => SEASON === 'winter';
  const dot = (x, y, r, col, op = 1) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const oval = (x, y, rx, ry, col, op = 1) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const box = (x, y, w, h, col, more = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${col}"${more}/>`;
  const shadow = (x, y, rx, ry = 2.4) => oval(x, y, rx, ry, '#00000022');
  const line = (d, col, w = 1, op = 1) => `<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const shape = (d, col, more = '') => `<path d="${d}" fill="${col}"${more}/>`;
  const text = (x, y, s, size, col, more = '') => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="middle" font-family="${FONT}" font-size="${size}" font-weight="900" fill="${col}"${more}>${s}</text>`;
  const leaf = (x, y, rot, col, rx = 3.4) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${f1(rx * 0.48)}" fill="${col}" transform="rotate(${Math.round(rot)} ${f1(x)} ${f1(y)})"/>`;
  const poly = (list) => `M${list.map(([x, y]) => `${f1(x)} ${f1(y)}`).join(' L')}Z`;
  // a closed shape with its corners taken off
  function rounded(list, r) {
    let d = '';
    list.forEach((p, i) => {
      const a = list[(i + list.length - 1) % list.length], b = list[(i + 1) % list.length];
      const la = Math.hypot(a[0] - p[0], a[1] - p[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
      const ra = Math.min(r, la / 2), rb = Math.min(r, lb / 2);
      d += `${i ? 'L' : 'M'}${f1(p[0] + ((a[0] - p[0]) * ra) / la)} ${f1(p[1] + ((a[1] - p[1]) * ra) / la)} Q${f1(p[0])} ${f1(p[1])} ${f1(p[0] + ((b[0] - p[0]) * rb) / lb)} ${f1(p[1] + ((b[1] - p[1]) * rb) / lb)} `;
    });
    return d + 'Z';
  }

  const SKY = {
    spring: ['#bfe2ef', '#e9f1e6', '#f6eedd'], summer: ['#9fd6f0', '#e3f3ea', '#fbf1d8'],
    autumn: ['#f0cfae', '#f6e2c6', '#f3e6d2'], winter: ['#c4d2e0', '#e3eaf1', '#f3f6f9'],
  };
  const HILL = {
    spring: ['#bcd9a0', '#a6cc88', '#92bd75'], summer: ['#b0d28a', '#97c074', '#82ae60'],
    autumn: ['#e0c686', '#d2ae6c', '#bd9558'], winter: ['#e8eff4', '#dde6ee', '#d2dde7'],
  };
  // the paving round the pool
  const DECK = { spring: ['#efe4cd', '#ddd0b4'], summer: ['#f6ebd1', '#e4d6b6'], autumn: ['#e7dabf', '#d3c5a6'], winter: ['#e6ebef', '#d3dbe2'] };
  // the tiles of the pool in each state of its water: walls, floor far and near, the lines between them
  const TILE = {
    murky: { wall: '#a3ab8c', side: '#8f9a78', floor0: '#6f7d4c', floor1: '#8f9c6c', joint: '#79845f', mark: '#6d7a58' },
    full: { wall: '#8fd2e0', side: '#86cbdb', floor0: '#8fd8e2', floor1: '#c9f0f0', joint: '#e6f9f9', mark: '#3f9dbb' },
    low: { wall: '#b4dee6', side: '#a4d3dd', floor0: '#9fc9cd', floor1: '#d3ecea', joint: '#eef8f6', mark: '#58a7c0' },
    rimed: { wall: '#d6e7ef', side: '#c5dce6', floor0: '#c9dee8', floor1: '#e8f3f8', joint: '#fbfdff', mark: '#9cc4d6' },
    scrubbed: { wall: '#d2eff3', side: '#c0e6ed', floor0: '#d0eef1', floor1: '#f1fbfa', joint: '#ffffff', mark: '#6fb9cf' },
  };

  // ---------------------------------------------------------------- shapes
  // The inside edge of the pool in the picture: a trapezium, narrower at the
  // far end. Lines on the ground run towards VP, far above the picture.
  const RIM = { fl: [122, 268], fr: [330, 268], nr: [364, 428], nl: [70, 428] };
  const VP = [248, -110];
  // how far the floor drops in the picture at the deep end (far) and the shallow end (near)
  const DEEP = 36, SHALLOW = 10;
  const WIDEN = (RIM.nr[0] - RIM.nl[0]) / (RIM.fr[0] - RIM.fl[0]);
  // v runs from the far end (0) to the near end (1); what is near looks bigger
  const persp = (v) => { const z = WIDEN + (1 - WIDEN) * v; return (1 / z - 1 / WIDEN) / (1 - 1 / WIDEN); };
  // a point at the height of the rim: u across the pool, v towards us, d lower in the picture
  function P(u, v, d = 0) {
    const t = persp(v), xl = U.lerp(RIM.fl[0], RIM.nl[0], t), xr = U.lerp(RIM.fr[0], RIM.nr[0], t);
    return [U.lerp(xl, xr, u), U.lerp(RIM.fl[1], RIM.nl[1], t) + d];
  }
  const depth = (v) => U.lerp(DEEP, SHALLOW, v);
  // a point on the floor of the pool, which slopes up towards us
  const F = (u, v) => P(u, v, depth(v));
  const corners = (o) => [[RIM.fl[0] - o, RIM.fl[1] - o * 0.7], [RIM.fr[0] + o, RIM.fr[1] - o * 0.7], [RIM.nr[0] + o * 1.2, RIM.nr[1] + o], [RIM.nl[0] - o * 1.2, RIM.nl[1] + o]];
  const POOL_D = rounded(corners(0), 12), COPE_D = rounded(corners(9), 19);
  const FLOOR_D = poly([F(0, 0), F(1, 0), F(1, 1.1), F(0, 1.1)]);
  const seg = (a, b) => `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`;
  // the lines between the tiles, on the floor and up the walls
  const FLOOR_JOINTS = (() => {
    let d = '';
    for (let i = 1; i < 14; i++) d += seg(F(i / 14, 0), F(i / 14, 1.1));
    for (let j = 1; j < 16; j++) d += seg(F(0, j / 16), F(1, j / 16));
    return d;
  })();
  const WALL_JOINTS = (() => {
    let d = '';
    for (let i = 1; i < 14; i++) d += seg(P(i / 14, 0), F(i / 14, 0));
    for (const k of [0.3, 0.62]) { d += seg(P(0, 0, DEEP * k), P(1, 0, DEEP * k)); d += seg(P(0, 0, DEEP * k), P(0, 0.7, depth(0.7) * k)); d += seg(P(1, 0, DEEP * k), P(1, 0.7, depth(0.7) * k)); }
    for (let j = 1; j < 12; j++) { d += seg(P(0, j / 12), F(0, j / 12)); d += seg(P(1, j / 12), F(1, j / 12)); }
    return d;
  })();
  // a deep blue line laid in the floor, a little in from the walls
  const FLOOR_BAND = rounded([F(0.07, 0.05), F(0.93, 0.05), F(0.93, 0.96), F(0.07, 0.96)], 10);
  // the low water of autumn: how far down it is, and where it gives out on the slope
  const LOW = { d: 25, v: 0.4 };

  // the sun terrace in front, and the paving elsewhere
  const toVP = (x, y, yEnd) => { const t = (y - yEnd) / (y - VP[1]); return [x + (VP[0] - x) * t, yEnd]; };
  const fan = (xs, y, yEnd) => xs.map((x) => seg([x, y], toVP(x, y, yEnd))).join('');
  const span = (a, b, n) => Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
  const TERR_LINES = [452, 466, 483, 503, 527].map((y) => `M-6 ${y}H406`).join('') + fan(span(-352, 776, 19), 545, 440);
  const DECK_LINES = [256, 262, 276, 292, 312, 336, 366, 402].map((y) => `M-6 ${y}H406`).join('') + fan(span(-470, 1000, 28), 440, 252);

  // the building: its two storeys and the panel with the name on it
  const SIGNB = { x: 156, y: 122, w: 124, h: 36 };
  // the kiosk in the middle of the ground floor: the row of windows, the counter below it
  const SHOP = { x0: 164, x1: 272, y0: 208, y1: 233 };
  const PANES = [[167, 196], [200, 236], [240, 269]];
  // the ribbon of windows upstairs
  const RIBBON = { x0: 166, x1: 270, y0: 168, y1: 186 };
  // the changing huts, from the far end of the row to the near end
  const HUTS = [
    { x: 74, y: 268, w: 27, h: 23, g: 7 }, { x: 60, y: 297, w: 31, h: 27, g: 8 }, { x: 44, y: 334, w: 35, h: 31, g: 9 },
    { x: 25, y: 379, w: 40, h: 35, g: 10 }, { x: 3, y: 434, w: 48, h: 41, g: 12 },
  ];
  // the fountain in the pool: where its foot stands, the top of its drum and the height of its bowls
  const FO = { x: P(0.5, 0.33)[0], floor: F(0.5, 0.33)[1], water: P(0.5, 0.33)[1], top: 303, bowl: 282, cap: 267 };
  // the diving board: the butt of the plank on its pier and the tip out over the deep end
  const PLANK = { a: [380, 277], b: [272, 295], w: [3.4, -6.4] };
  // where each deck chair stands, the way it faces and its stripes
  const CHAIRS = [[108, 490, false, 0], [182, 478, false, 1], [256, 484, false, 2], [142, 527, false, 2], [222, 531, false, 0]];
  // a pot of palm at each end of the terrace, and one by the diving board
  const POTS = [[32, 516, 1.08], [366, 520, 1.1], [384, 430, 0.72]];

  // little css of our own: the water, the fountain, the palms and the bunting
  function style() {
    return `<style>@media (prefers-reduced-motion: no-preference){
      #scene .sb-glint{animation:sbglint 3.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
      #scene .sb-glint:nth-of-type(2n){animation-delay:-1.4s}
      #scene .sb-glint:nth-of-type(3n){animation-delay:-2.7s}
      @keyframes sbglint{0%,100%{opacity:.1;transform:scale(.5)}50%{opacity:1;transform:scale(1)}}
      #scene .sb-ripple{animation:sbripple 8s ease-in-out infinite alternate}
      #scene .sb-ripple.b{animation-duration:11s;animation-delay:-4s}
      @keyframes sbripple{from{transform:translateX(-7px)}to{transform:translateX(7px)}}
      #scene .sb-ring{animation:sbring 5.4s ease-out infinite;transform-box:fill-box;transform-origin:center}
      #scene .sb-ring.b{animation-delay:-2.7s}
      @keyframes sbring{0%{opacity:.75;transform:scale(.86)}100%{opacity:0;transform:scale(1.4)}}
      #scene .sb-drop{animation:sbdrop 1.5s ease-in infinite}
      #scene .sb-drop:nth-of-type(2n){animation-delay:-.5s}
      #scene .sb-drop:nth-of-type(3n){animation-delay:-1s}
      @keyframes sbdrop{0%{opacity:0;transform:translateY(-3px)}25%{opacity:.95}100%{opacity:0;transform:translateY(9px)}}
      #scene .sb-bob{animation:sbbob 4.4s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}
      @keyframes sbbob{from{transform:translateY(-.7px) rotate(-1.6deg)}to{transform:translateY(.9px) rotate(1.6deg)}}
      #scene .sb-sway{animation:sbsway 5.2s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}
      #scene .sb-sway:nth-of-type(2n){animation-delay:-2.3s}
      @keyframes sbsway{from{transform:rotate(-1.2deg)}to{transform:rotate(1.6deg)}}
      #scene .sb-flag{animation:sbflag 3.4s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 0%}
      #scene .sb-flag:nth-of-type(2n){animation-delay:-1.5s}
      @keyframes sbflag{from{transform:skewX(-6deg)}to{transform:skewX(7deg)}}
      #scene .sb-nod{animation:sbnod 6.5s ease-in-out infinite;transform-box:fill-box;transform-origin:30% 90%}
      @keyframes sbnod{0%,62%,100%{transform:rotate(0)}70%{transform:rotate(16deg)}78%{transform:rotate(-5deg)}86%{transform:rotate(12deg)}}
      #scene .sb-breathe{animation:sbbreathe 3.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes sbbreathe{50%{transform:scaleY(1.07)}}
      #scene .sb-hop{animation:sbhop 5.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes sbhop{0%,80%,100%{transform:translateY(0)}86%{transform:translateY(-3px)}92%{transform:translateY(0)}}
      #scene .sb-tube{animation:sbtube 2.6s ease-in-out infinite alternate}
      #scene .sb-tube:nth-of-type(2n){animation-delay:-1.3s}
      @keyframes sbtube{from{opacity:.55}to{opacity:1}}
    }</style>`;
  }

  function palette(C) {
    const k = (1 - PCT) * 0.35;
    K = {
      C,
      cream: U.mix('#f8efdb', '#c9c0ac', k * 1.4),
      band: U.mix('#7cc3cf', '#8f9a98', k * 1.5),
      coral: U.mix('#e5675a', '#a88f84', k * 1.4),
      stone: U.mix('#ece0c7', '#b3aa9a', k),
      chrome: U.mix('#b4c5ce', '#8a7a68', k * 1.6),
      deep: U.mix('#2f6f8f', '#6f7f84', k * 1.4),
      timber: U.mix('#c89b62', '#7a7266', k * 1.4),
    };
  }

  function defs() {
    const T = TILE[LEVEL], k = (1 - PCT) * 0.35, deck = DECK[SEASON][0];
    const terr = (base, old) => `<rect width="46" height="30" fill="${base}"/>
        <circle cx="6" cy="6" r="0.9" fill="#e5675a" opacity="${old ? 0.2 : 0.42}"/><circle cx="19" cy="14" r="1" fill="#7cc3cf" opacity="${old ? 0.2 : 0.5}"/><circle cx="34" cy="5" r="0.8" fill="#b89a6a" opacity="0.5"/>
        <circle cx="41" cy="20" r="1" fill="#e5675a" opacity="${old ? 0.2 : 0.34}"/><circle cx="11" cy="25" r="0.8" fill="#b89a6a" opacity="0.5"/><circle cx="28" cy="25" r="0.9" fill="#7cc3cf" opacity="${old ? 0.2 : 0.42}"/>
        ${old ? '<circle cx="24" cy="9" r="3" fill="#6f8a3e" opacity="0.4"/><circle cx="8" cy="19" r="2.2" fill="#748f42" opacity="0.35"/>' : ''}`;
    const sand = U.mix(deck, '#c9bfa4', k * 1.6);
    return `
    <defs>
      <linearGradient id="${id('Sky')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${SKY[SEASON][0]}"/><stop offset="0.75" stop-color="${SKY[SEASON][1]}"/><stop offset="1" stop-color="${SKY[SEASON][2]}"/>
      </linearGradient>
      <radialGradient id="${id('Sun')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#fff6cf"/><stop offset="0.45" stop-color="#fde7a3"/><stop offset="1" stop-color="#fde7a3" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="${id('Glow')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#ffe2a0" stop-opacity="0.6"/><stop offset="0.45" stop-color="#ffd98a" stop-opacity="0.22"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="${id('FountGlow')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#f4fff2" stop-opacity="0.78"/><stop offset="0.4" stop-color="#b9f3ea" stop-opacity="0.3"/><stop offset="1" stop-color="#b9f3ea" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${id('PoolGlow')}" gradientUnits="userSpaceOnUse" x1="0" y1="268" x2="0" y2="428">
        <stop offset="0" stop-color="#2fb6c6" stop-opacity="0.34"/><stop offset="0.6" stop-color="#5fdcd6" stop-opacity="0.42"/><stop offset="1" stop-color="#9df0e4" stop-opacity="0.5"/>
      </linearGradient>
      <linearGradient id="${id('Water')}" gradientUnits="userSpaceOnUse" x1="0" y1="268" x2="0" y2="428">
        <stop offset="0" stop-color="#1fa9bd" stop-opacity="0.9"/><stop offset="0.5" stop-color="#3dcbd2" stop-opacity="0.76"/><stop offset="1" stop-color="#74e6dc" stop-opacity="0.6"/>
      </linearGradient>
      <linearGradient id="${id('Rest')}" gradientUnits="userSpaceOnUse" x1="0" y1="${268 + LOW.d}" x2="0" y2="350">
        <stop offset="0" stop-color="#4b8f98" stop-opacity="0.95"/><stop offset="1" stop-color="#86b7ae" stop-opacity="0.82"/>
      </linearGradient>
      <linearGradient id="${id('Floor')}" gradientUnits="userSpaceOnUse" x1="0" y1="304" x2="0" y2="438">
        <stop offset="0" stop-color="${T.floor0}"/><stop offset="1" stop-color="${T.floor1}"/>
      </linearGradient>
      <linearGradient id="${id('Wall')}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${U.shade(K.cream, -0.2)}"/><stop offset="0.05" stop-color="${K.cream}"/><stop offset="0.5" stop-color="${U.shade(K.cream, 0.3)}"/><stop offset="0.93" stop-color="${K.cream}"/><stop offset="1" stop-color="${U.shade(K.cream, -0.26)}"/>
      </linearGradient>
      <linearGradient id="${id('Grime')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a7ab98"/><stop offset="0.7" stop-color="#8f9478"/><stop offset="1" stop-color="#7a7f60"/></linearGradient>
      <linearGradient id="${id('Dusty')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9b19f"/><stop offset="1" stop-color="#d7c39a"/></linearGradient>
      <linearGradient id="${id('Frost')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f9fc"/><stop offset="1" stop-color="#cadbe8"/></linearGradient>
      <linearGradient id="${id('Shade')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.3"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
      <linearGradient id="${id('Glass')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3f2f6"/><stop offset="1" stop-color="#a9cbd8"/></linearGradient>
      <pattern id="${id('Terr')}" width="46" height="30" patternUnits="userSpaceOnUse">${terr(sand, false)}</pattern>
      <pattern id="${id('TerrOld')}" width="46" height="30" patternUnits="userSpaceOnUse">${terr(U.mix(sand, '#a39b84', 0.42), true)}</pattern>
      <pattern id="${id('Snow')}" width="30" height="24" patternUnits="userSpaceOnUse">
        <rect width="30" height="24" fill="#f3f7fb"/><ellipse cx="8" cy="8" rx="7" ry="3" fill="#e2ebf3"/><ellipse cx="22" cy="18" rx="8" ry="3" fill="#e6eef5"/>
        <circle cx="16" cy="5" r="0.9" fill="#fff"/><circle cx="4" cy="19" r="0.8" fill="#c9d8e6"/>
      </pattern>
      <pattern id="${id('Leaves')}" width="34" height="28" patternUnits="userSpaceOnUse">
        <ellipse cx="6" cy="6" rx="4" ry="2" fill="#d9822b" transform="rotate(30 6 6)"/><ellipse cx="22" cy="10" rx="4.5" ry="2.2" fill="#c4462f" transform="rotate(-20 22 10)"/>
        <ellipse cx="14" cy="21" rx="4" ry="2" fill="#e9b23c" transform="rotate(70 14 21)"/><ellipse cx="29" cy="24" rx="3.6" ry="1.8" fill="#9c5a2a"/>
        <ellipse cx="3" cy="17" rx="3.4" ry="1.7" fill="#e06c3c" transform="rotate(-50 3 17)"/>
      </pattern>
      <g id="${id('Crown')}">${crown()}</g>
      <clipPath id="${id('Pool')}"><path d="${POOL_D}"/></clipPath>
      <clipPath id="${id('StarEdge')}"><path d="${STAR_D}"/></clipPath>
      <clipPath id="${id('Shop')}"><rect x="${SHOP.x0}" y="${SHOP.y0}" width="${SHOP.x1 - SHOP.x0}" height="${SHOP.y1 - SHOP.y0}"/></clipPath>
    </defs>`;
  }

  // ------------------------------------------------------- sky and the bank
  function sky() {
    const cl = SEASON === 'autumn' ? '#fbf1e6' : '#ffffff';
    return `<rect y="-4" width="400" height="300" fill="${url('Sky')}"/>
    ${NIGHT ? '' : `<circle cx="346" cy="64" r="46" fill="${url('Sun')}"/><circle cx="346" cy="64" r="17" fill="#fff3c4"/>`}
    <g class="cloud c1" fill="${cl}" opacity="0.92"><ellipse cx="62" cy="72" rx="25" ry="10"/><ellipse cx="81" cy="65" rx="17" ry="12"/><ellipse cx="99" cy="73" rx="19" ry="8"/></g>
    <g class="cloud c2" fill="${cl}" opacity="0.8"><ellipse cx="214" cy="56" rx="19" ry="7"/><ellipse cx="229" cy="51" rx="13" ry="9"/><ellipse cx="243" cy="57" rx="14" ry="6"/></g>`;
  }
  // the sunny bank behind the lido, with poplars along it and a hedge at the far end
  function far() {
    const h = HILL[SEASON];
    let s = `<path d="M-6 148 Q60 124 130 138 T270 130 T410 144 V300 H-6Z" fill="${h[0]}"/>
      <path d="M-6 182 Q90 158 210 176 T410 170 V300 H-6Z" fill="${h[1]}"/><path d="M-6 214 Q120 194 240 208 T410 202 V300 H-6Z" fill="${h[2]}"/>`;
    const hedge = winter() ? '#c3ccd4' : SEASON === 'autumn' ? '#a8834e' : '#6f9a5a';
    for (let x = 332; x < 410; x += 9) s += oval(x, 178 - (x - 332) * 0.06, 6, 3.6, hedge);
    const pop = winter() ? '#c9d2da' : SEASON === 'autumn' ? '#d9a24a' : '#7fa86a', pd = U.shade(pop, -0.12);
    for (const [x, b, hh] of [[14, 224, 58], [31, 222, 76], [47, 224, 52], [66, 222, 66], [84, 224, 50], [100, 222, 40], [350, 182, 26], [391, 178, 34]]) {
      s += shape(`M${x} ${b - hh} Q${x - 8} ${b - hh * 0.4} ${x - 3} ${b} H${x + 3} Q${x + 8} ${b - hh * 0.4} ${x} ${b - hh}Z`, pop, ' opacity="0.86"');
      s += shape(`M${x} ${b - hh} Q${x + 8} ${b - hh * 0.4} ${x + 3} ${b} H${x} Z`, pd, ' opacity="0.5"');
    }
    return s;
  }
  // the low wall that shuts the lido off from the bank
  function boundary() {
    const run = (x, w) => `${box(x, 229, w, 26, K.cream)}${box(x, 236, w, 1.5, K.band)}${box(x, 239, w, 1, K.coral, ' opacity="0.7"')}${box(x - 1, 225, w + 2, 5, K.stone, ' rx="1.4"')}${box(x, 230, w, 1.2, '#000', ' opacity="0.1"')}`;
    let s = run(-6, 120) + run(326, 8) + run(386, 22);
    if (winter()) s += box(-6, 223.6, 120, 2.4, SNOW, ' rx="1.2"') + box(385, 223.6, 22, 2.4, SNOW, ' rx="1.2"');
    return s;
  }

  // ------------------------------------------------------------ the building
  // a long line round the building that curves away at both of its round ends
  const bandAt = (y, x0, x1, col, w, op = 1) => line(`M${x0} ${y - 6} Q${x0 + 2} ${y} ${x0 + 13} ${y} H${x1 - 13} Q${x1 - 2} ${y} ${x1} ${y - 6}`, col, w, op);
  // a flat roof with round ends, seen a little from above
  const slab = (x0, x1, y, h, col) => {
    const dk = U.shade(col, -0.18), r = h * 0.7;
    return `${shape(`M${x0} ${y} Q${x0} ${y + h} ${x0 + r * 2} ${y + h} H${x1 - r * 2} Q${x1} ${y + h} ${x1} ${y} V${y + 3.4} Q${x1} ${y + h + 3.4} ${x1 - r * 2} ${y + h + 3.4} H${x0 + r * 2} Q${x0} ${y + h + 3.4} ${x0} ${y + 3.4}Z`, dk)}
      ${shape(`M${x0} ${y} Q${x0} ${y - h} ${x0 + r * 2} ${y - h} H${x1 - r * 2} Q${x1} ${y - h} ${x1} ${y} Q${x1} ${y + h} ${x1 - r * 2} ${y + h} H${x0 + r * 2} Q${x0} ${y + h} ${x0} ${y}Z`, col)}`;
  };
  function building() {
    const wall = url('Wall'), old = PCT < 0.4, frame = old ? '#8f9490' : K.deep;
    // upstairs, set back like the top deck of a ship, with a rail round the roof below
    let s = '';
    for (const [x0, x1] of [[114, 150], [286, 322]]) {
      for (let x = x0; x <= x1; x += 9) s += line(`M${x} 191 V179`, K.chrome, 1);
      s += line(`M${x0} 179 H${x1}`, K.chrome, 1.4) + line(`M${x0} 185 H${x1}`, K.chrome, 0.8);
    }
    if (PCT > 0.45) s += `${line('M218 118 V92', '#8a8f90', 1.2)}${dot(218, 91, 1.4, '#d9a93a')}${shape('M218 93 q7 1.6 14 -0.6 l-3 3.4 l3 3.2 q-7 2 -14 0.4Z', K.coral)}`;
    s += shape('M152 196 V174 Q152 160 165 160 H271 Q284 160 284 174 V196Z', wall);
    s += bandAt(164, 152, 284, K.band, 1.2);
    const { x0, x1, y0, y1 } = RIBBON;
    // a long ribbon of windows upstairs
    s += box(x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4, frame, ' rx="4"');
    s += box(x0, y0, x1 - x0, y1 - y0, PCT < 0.5 ? url('Grime') : url('Glass'), ' rx="3"');
    if (PCT >= 0.5) s += shape(`M${x0 + 14} ${y1} L${x0 + 28} ${y0} H${x0 + 36} L${x0 + 22} ${y1}Z M${x0 + 70} ${y1} L${x0 + 84} ${y0} H${x0 + 88} L${x0 + 74} ${y1}Z`, '#fff', ' opacity="0.3"');
    for (let x = x0 + 17.3; x < x1 - 2; x += 17.3) s += line(`M${f1(x)} ${y0} V${y1}`, frame, 1);
    s += line(`M${x0} ${y0 + 6} H${x1}`, frame, 0.6);
    for (const x of [156, 280]) s += `${dot(x, 178, 5, frame)}${dot(x, 178, 3.8, PCT < 0.5 ? '#8f9478' : '#cfe6ee')}`;
    // the deep roof slab over each storey
    s += slab(146, 290, 160, 4.4, U.shade(K.cream, 0.25));
    s += shape('M110 252 V207 Q110 196 122 196 H314 Q326 196 326 207 V252Z', wall);
    s += box(110, 197, 216, 8, url('Shade'), ' opacity="0.45"');
    s += slab(102, 334, 194, 5.2, U.shade(K.cream, 0.25));
    s += bandAt(214, 110, 326, K.coral, 1.6) + bandAt(218, 110, 326, K.band, 1) + bandAt(221, 110, 326, K.band, 0.6);
    // the plinth along the foot of the wall
    s += bandAt(244, 110, 326, K.band, 1.1);
    s += shape('M110 243 Q112 248 124 248 H312 Q324 248 326 243 V254 H110Z', U.shade(K.band, 0.1));
    if (old) {
      const r = U.rng(233);
      for (let i = 0; i < 11; i++) s += oval(114 + r() * 208, 198 + r() * 50, 6 + r() * 12, 2.4 + r() * 5, '#a39a84', 0.5);
      s += `${line('M128 198 l5 13 l-4 9 l6 12', '#7d6a5e', 0.8, 0.8)}${line('M312 202 l-6 11 l5 8', '#7d6a5e', 0.8, 0.8)}${line('M170 160 l4 12 l-5 8', '#7d6a5e', 0.7, 0.7)}`;
      s += `${oval(146, 242, 12, 4, '#6f8a3e', 0.55)}${oval(300, 246, 9, 3, '#748f42', 0.5)}`;
    }
    if (winter()) s += `${shape('M100 193 Q104 186 120 186.6 H316 Q332 186 336 193 Q218 197 100 193Z', SNOW)}${shape('M144 159 Q148 154 162 154.6 H274 Q288 154 292 159 Q218 163 144 159Z', SNOW)}`;
    return s;
  }
  // a pair of little waves for the sign
  const waveIcon = (x, y, col, op = 1) => line(`M${x - 7} ${y} q1.75 -2.6 3.5 0 t3.5 0 t3.5 0 t3.5 0 M${x - 7} ${y + 3.4} q1.75 -2.6 3.5 0 t3.5 0 t3.5 0 t3.5 0`, col, 1.2, op);
  function sign(st, C) {
    const p = pend(st, 'sign'), ok = st.sign;
    const col = ok ? C.lidoSign : U.mix(C.lidoSign, '#a59e90', 0.62), tx = ok ? '#fffaf0' : '#d9d2c4';
    const { x, y, w, h } = SIGNB, cx = x + w / 2;
    const out = rounded([[x, y + h], [x, y + 9], [x + 24, y + 9], [x + 24, y + 3], [x + 44, y + 3], [x + 44, y - 3], [x + w - 44, y - 3], [x + w - 44, y + 3], [x + w - 24, y + 3], [x + w - 24, y + 9], [x + w, y + 9], [x + w, y + h]], 2.2);
    let s = `<g data-part="sign">${box(x + 28, y + h - 1, 4, 6, K.stone)}${box(x + w - 32, y + h - 1, 4, 6, K.stone)}`;
    s += `<g transform="translate(1.6 2)" opacity="0.16">${shape(out, '#000')}</g>${shape(out, col)}`;
    s += `<path d="${out}" fill="none" stroke="${tx}" stroke-width="0.8" opacity="0.8" transform="translate(${f1(cx * 0.05)} ${f1((y + h / 2) * 0.09)}) scale(0.95 0.91)"/>`;
    s += waveIcon(x + 15, y + 20, tx, ok ? 1 : 0.5) + waveIcon(x + w - 15, y + 20, tx, ok ? 1 : 0.5);
    s += `<text x="${cx + 1.5}" y="${y + 22}" text-anchor="middle" font-family="${SERIF}" font-size="20" font-weight="700" letter-spacing="3.4" fill="${tx}"${ok ? '' : ' opacity="0.6"'}>${ok ? 'LIDO' : 'L DO'}</text>`;
    s += `<text x="${cx}" y="${y + 31}" text-anchor="middle" font-family="${FONT}" font-size="6.2" font-weight="900" letter-spacing="1.3" fill="${tx}"${ok ? '' : ' opacity="0.45"'}>· SUNNYBANK ·</text>`;
    if (!ok) s += `${oval(x + 22, y + 14, 8, 3, '#b5a68a', 0.85)}${oval(x + 96, y + 27, 9, 3, '#b5a68a', 0.8)}${oval(cx + 16, y + 8, 6, 2.2, '#b5a68a', 0.7)}${line(`M${x + 70} ${y - 2} l-3 13 l3 10`, '#5a4a3a', 0.8)}`;
    if (p === 'grow') s += shape(out, FADE, ' opacity="0.5"');
    else if (p === 'frost') s += shape(out, url('Frost'), ' opacity="0.5"');
    if (winter() || p === 'snow') s += `${box(x + 44, y - 4.6, w - 88, 2.4, SNOW, ' rx="1.2"')}${box(x + 24, y + 1.8, 20, 2, SNOW, ' rx="1"')}${box(x + w - 44, y + 1.8, 20, 2, SNOW, ' rx="1"')}${box(x - 0.6, y + 7.6, 24, 2.2, SNOW, ' rx="1.1"')}${box(x + w - 23.4, y + 7.6, 24, 2.2, SNOW, ' rx="1.1"')}`;
    return s + '</g>';
  }

  // the frame of the kiosk: a blue surround set into the cream wall
  function shopfront() {
    const { x0, x1, y0, y1 } = SHOP;
    return `${box(x0 - 7, y0 - 8, x1 - x0 + 14, 60, U.shade(K.band, -0.12), ' rx="5"')}${box(x0 - 5, y0 - 6, x1 - x0 + 10, 56, K.band, ' rx="4"')}${box(x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4, U.shade(K.deep, -0.1), ' rx="2"')}`;
  }
  function windows(st) {
    const p = pend(st, 'windows'), ok = st.windows, { x0, x1, y0, y1 } = SHOP;
    let s = `<g data-part="windows"><g clip-path="${url('Shop')}">${box(x0, y0, x1 - x0, y1 - y0, ok ? '#fbf1dd' : '#a79f8d')}`;
    if (ok) {
      // the shop inside: stripes on the wall, jars, tubs of ice cream, cones and bottles
      for (let x = x0; x < x1; x += 8) s += box(x, y0, 4, 25, '#f6dfca');
      for (const y of [217, 226]) s += box(x0, y, x1 - x0, 1.4, '#c89b62');
      for (const [x, y, c] of [[171, 217, '#e5675a'], [177, 217, '#f2c14e'], [183, 217, '#7cc3cf'], [189, 217, '#efb4ae'], [173, 226, '#7cc3cf'], [180, 226, '#e5675a'], [187, 226, '#f2c14e']]) s += `${box(x - 2, y - 5.4, 4.4, 5.4, c, ' rx="1"')}${box(x - 1.6, y - 6.4, 3.6, 1.2, '#d9c8a6')}`;
      for (const [x, c] of [[206, '#f6c6d0'], [214, '#fdf0c8'], [222, '#bfe8c8'], [230, '#c79a72']]) s += `${oval(x, 214.8, 3.2, 2.2, c)}${box(x - 3.2, 215, 6.4, 2.2, '#e9dcc2')}`;
      for (let i = 0; i < 4; i++) s += shape(`M${204 + i * 8.4} 218.6 l2.4 6.6 l2.4 -6.6Z`, '#dcae72');
      for (const [x, y, c] of [[245, 217, '#5fae6e'], [251, 217, '#e5675a'], [257, 217, '#f2c14e'], [263, 217, '#5fae6e'], [248, 226, '#7cc3cf'], [255, 226, '#e5675a'], [262, 226, '#7cc3cf']]) s += `${box(x - 1.6, y - 6.2, 3.2, 6.2, c, ' rx="1"')}${box(x - 0.7, y - 8, 1.4, 2, c)}`;
    } else {
      for (const y of [217, 226]) s += box(x0, y, x1 - x0, 1.4, '#7d7264');
      for (const [x, y] of [[174, 217], [186, 226], [214, 226], [226, 217], [250, 217], [258, 226]]) s += `${box(x - 2, y - 5, 4.4, 5, '#8f8a78', ' rx="0.8"')}`;
      s += `${line('M201 217 L205 210', '#7d7264', 0.8)}${oval(218, 226, 6, 1.4, '#6f6a58', 0.7)}`;
    }
    s += '</g>';
    for (const [a, b] of PANES) {
      const w = b - a;
      if (!ok) s += box(a, y0, w, y1 - y0, url('Grime'), ' opacity="0.72"');
      else if (p === 'frost') s += box(a, y0, w, y1 - y0, url('Frost'), ' opacity="0.88"') + line(`M${a + 2} ${y1 - 1} q5 -8 2 -16 M${a + 4} ${y1 - 8} l4 -3 M${b - 2} ${y1 - 1} q-6 -7 -3 -15 M${b - 4} ${y1 - 8} l-4 -2`, '#fff', 1);
      else if (p === 'grow') {
        // sun cream smeared on the glass in summer, rain spots in autumn
        s += box(a, y0, w, y1 - y0, url('Dusty'), ' opacity="0.46"');
        if (SEASON === 'autumn') for (let i = 0; i < 9; i++) s += line(`M${f1(a + 2 + i * (w / 9))} ${f1(y0 + 2 + ((i * 7) % 12))} v${2 + i % 3}`, '#eef6fa', 0.9, 0.85);
        else for (let i = 0; i < 3; i++) s += oval(a + 6 + i * (w / 3), y0 + 6 + (i % 2) * 11, 4.4, 2.6, '#fff8e8', 0.42);
      } else s += shape(`M${a + 3} ${y1} L${a + 12} ${y0} H${a + 18} L${a + 9} ${y1}Z`, '#fff', ' opacity="0.26"');
      s += `<rect x="${a}" y="${y0}" width="${w}" height="${y1 - y0}" fill="none" stroke="${ok ? K.deep : '#74776f'}" stroke-width="1.2"/>`;
      s += line(`M${a} 216.5 H${b} M${a} 225 H${b}`, ok ? K.deep : '#74776f', 0.5, 0.8);
    }
    if (!ok) s += `${line('M196 208 l-7 11 l5 5 l-6 8', '#eef0e8', 0.7, 0.9)}${shape('M263 209 l6 -1 l0 8 l-5 1Z', '#5e5e54', ' opacity="0.8"')}${line('M240 209 q7 5 13 0 M240 209 l10 9 M240 216 l10 -7', '#eef0e8', 0.4, 0.8)}`;
    return s + '</g>';
  }
  // the counter and its striped awning
  function kiosk(st) {
    const p = pend(st, 'kiosk'), ok = st.kiosk, { x0, x1 } = SHOP;
    const stripe = ok ? '#e5675a' : U.mix('#e5675a', '#a59e90', 0.66), plain = ok ? '#fff6e6' : '#c9c2b2', top = ok ? U.shade(K.cream, 0.4) : '#b9b19f';
    let s = '<g data-part="kiosk">';
    // the front of the counter: fluted, with a plate saying what it sells
    s += box(x0 - 3, 238, x1 - x0 + 6, 16, ok ? '#a9dbe0' : '#9aa49e');
    for (let x = x0; x <= x1; x += 5.4) s += line(`M${f1(x)} 239 V254`, ok ? '#6fb6c4' : '#7d8880', 0.8, 0.9);
    s += box(x0 - 3, 238, x1 - x0 + 6, 2, '#000', ' opacity="0.12"');
    s += `${box(204, 241.5, 28, 9.4, ok ? '#fff6e6' : '#b9b19f', ' rx="1.6"')}${text(218, 249, ok ? 'ICES' : 'I ES', 7.2, ok ? '#c9474f' : '#7d7264', ' letter-spacing="1.2"')}`;
    // the top of the counter
    s += `${box(x0 - 7, 232.6, x1 - x0 + 14, 3, U.shade(top, 0.3), ' rx="1"')}${box(x0 - 7, 235.2, x1 - x0 + 14, 3.2, top, ' rx="1"')}${box(x0 - 7, 238, x1 - x0 + 14, 1.2, '#000', ' opacity="0.16"')}`;
    if (ok && !p) {
      // cones in a stand, a bell and a stack of paper cups
      s += `${box(182, 227, 10, 6, '#c9a06a', ' rx="1"')}${shape('M184 227 l1.6 -5 h1.2 l1.6 5Z', '#dcae72')}${oval(186.4, 221.6, 2.6, 2, '#f6c6d0')}${dot(252, 230.8, 2.2, '#d9a93a')}${box(249.4, 232, 5.2, 1, '#b5862c')}${box(238, 226, 6, 7, '#fffaf0', ' rx="0.8"')}${box(238, 228, 6, 1.2, '#e5675a')}`;
    } else if (ok) {
      // sticky drips and dust along the counter
      s += box(x0 - 6, 232.8, x1 - x0 + 12, 5.2, FADE, ' opacity="0.55" rx="1"');
      if (SEASON === 'summer') s += `${shape('M180 238 q1 5 2 0Z M214 238 q1.2 7 2.4 0Z M250 238 q1 4 2 0Z', '#d98ba0')}${oval(192, 233.8, 7, 1.2, '#d98ba0', 0.7)}${oval(236, 233.8, 9, 1.2, '#c79a72', 0.7)}`;
      else s += `${line('M170 233 q6 -6 13 -3 M250 233 q7 -5 12 -1', '#eef0e8', 0.5, 0.8)}${oval(226, 234, 12, 1, '#a59e90', 0.7)}`;
    } else {
      s += `${oval(188, 234, 11, 1.4, '#7a7f60', 0.7)}${oval(246, 234, 8, 1.2, '#7a7f60', 0.7)}${shape('M170 232 q5 -5 11 -2 q4 2 3 3Z', '#9a9282')}${line('M172 240 v9 M262 240 v12 M244 240 v6', '#7d6a5e', 1.4, 0.55)}`;
    }
    // the awning
    const n = 14, xa = x0 - 6, xb = x1 + 6, xc = x0 - 13, xd = x1 + 13, y0 = 197.5, y1 = 209.5;
    s += box(xc, y1 + 2, xd - xc, 3.2, '#000', ' opacity="0.13"');
    for (let i = 0; i < n; i++) {
      const a0 = xa + ((xb - xa) * i) / n, a1 = xa + ((xb - xa) * (i + 1)) / n, b0 = xc + ((xd - xc) * i) / n, b1 = xc + ((xd - xc) * (i + 1)) / n;
      if (!ok && (i === 9 || i === 10)) { s += shape(`M${f1(a0)} ${y0} L${f1(a1)} ${y0} L${f1(a1 - 0.6)} ${y0 + 5} L${f1(a0 + 3)} ${y0 + 7}Z`, i % 2 ? plain : stripe); continue; }
      s += shape(`M${f1(a0)} ${y0} L${f1(a1)} ${y0} L${f1(b1)} ${y1} Q${f1((b0 + b1) / 2)} ${y1 + 5} ${f1(b0)} ${y1}Z`, i % 2 ? plain : stripe);
    }
    s += line(`M${xa} ${y0} H${xb}`, ok ? '#c9474f' : '#8f8a78', 1.4);
    if (p === 'grow') s += shape(`M${xa} ${y0} H${xb} L${xd} ${y1 + 2} H${xc}Z`, FADE, ' opacity="0.42"');
    if (winter() || p === 'snow') s += shape(`M${xa - 1} ${y0 + 3} Q${(xa + xb) / 2} ${y0 - 7} ${xb + 1} ${y0 + 3} L${xd - 3} ${y1 - 3} Q${(xa + xb) / 2} ${y1 - 7} ${xc + 3} ${y1 - 3}Z`, SNOW);
    else if (p === 'leaves') s += leaf(190, 204, 20, FALL[0]) + leaf(236, 202, -30, FALL[1]) + leaf(214, 205, 60, FALL[2]);
    return s + '</g>';
  }
  // one bather in the queue, seen from behind
  function bather(x, y, skin, suit, hair, towel) {
    let s = `${shadow(x, y + 0.4, 6.4, 1.4)}${box(x - 3.2, y - 9.6, 2.5, 9.6, skin, ' rx="1"')}${box(x + 0.7, y - 9.6, 2.5, 9.6, skin, ' rx="1"')}${box(x - 3.9, y - 19.6, 7.8, 11.6, suit, ' rx="2.2"')}`;
    s += `${line(`M${x - 4.4} ${y - 18.4} L${x - 5.4} ${y - 10}`, skin, 1.8)}${line(`M${x + 4.4} ${y - 18.4} L${x + 5.4} ${y - 10}`, skin, 1.8)}${dot(x, y - 23, 3.6, skin)}`;
    s += shape(`M${x - 3.8} ${y - 22.6} Q${x - 4} ${y - 27.4} ${x} ${y - 27.2} Q${x + 4} ${y - 27.4} ${x + 3.8} ${y - 22.6} Q${x} ${y - 20.6} ${x - 3.8} ${y - 22.6}Z`, hair);
    if (towel) s += `${shape(`M${x - 2} ${y - 20} L${x + 2.6} ${y - 20} L${x + 2} ${y - 7} L${x - 2.6} ${y - 7}Z`, towel)}${line(`M${x - 2.2} ${y - 15} H${x + 2.4} M${x - 2.4} ${y - 11} H${x + 2.2}`, '#fff', 0.9, 0.8)}`;
    return s;
  }
  // the board by the kiosk: little scoops in rows, a number by each, and a queue when there is one
  function ices(st) {
    const p = pend(st, 'ices'), ok = st.ices, x = 282, y = 222;
    const wood = ok ? '#c89b62' : '#8f8574', slate = ok ? '#2f4a52' : '#6f6f66';
    let s = `<g data-part="ices">${box(x - 8, 214, 40, 48, '#000', ' fill-opacity="0"')}`;
    if (p) s += bather(241, 262, '#e8b890', '#e5675a', '#6b4a32', '') + bather(258, 263, '#c98d62', '#3f9dbb', '#2f2a2a', '#f2c14e') + bather(274, 261, '#f0c8a4', '#f2c14e', '#b5763c', '');
    s += `${shadow(x + 12, 261, 16, 1.6)}${line(`M${x + 3} 240 L${x} 261 M${x + 21} 240 L${x + 24} 261`, U.shade(wood, -0.2), 2)}`;
    s += `${box(x - 1, y - 1, 26, 31, wood, ' rx="1.6"')}${box(x + 1, y + 1, 22, 27, slate, ' rx="0.8"')}`;
    if (ok) {
      const rows = [[['#f6a5b8', '#f6a5b8'], '2'], [['#bfe8c8'], '1'], [['#fdf0c8', '#c79a72', '#f6a5b8'], '3']];
      rows.forEach(([cols, n], i) => {
        const ry = y + 7.4 + i * 8.6;
        cols.forEach((c, j) => { s += dot(x + 5.6 + j * 4.6, ry, 2.1, c) + dot(x + 5 + j * 4.6, ry - 0.7, 0.6, '#fff', 0.7); });
        s += text(x + 19.4, ry + 2.6, n, 7, '#fff8e8');
      });
      // a cone on top of the board
      s += `${shape(`M${x + 8.6} ${y - 1} l3.4 -8 l3.4 8Z`, '#dcae72')}${dot(x + 12, y - 10, 3, '#f6a5b8')}`;
    } else {
      s += `${oval(x + 9, y + 10, 7, 2.6, '#8f8f84', 0.7)}${oval(x + 15, y + 20, 8, 2.2, '#8f8f84', 0.6)}${line(`M${x + 5} ${y + 16} q5 -3 9 0`, '#a8a89a', 0.7)}`;
    }
    if (winter()) s += box(x - 1.6, y - 2.4, 27, 2.6, SNOW, ' rx="1.2"');
    return s + '</g>';
  }

  // ---------------------------------------------------------------- the gate
  // A stepped deco arch, a sunburst over it, and an iron turnstile in the opening
  function gate(st, C) {
    const p = pend(st, 'gate'), ok = st.gate;
    const col = ok ? C.lidoGate : U.mix(C.lidoGate, '#a59e90', 0.62), dk = U.shade(col, -0.26), lt = U.shade(col, 0.4);
    const iron = ok ? '#35596a' : '#6f6a60', cream = ok ? '#fff6e6' : '#c9c2b2', tx = 359;
    let s = `<g data-part="gate">${box(330, 170, 58, 92, '#000', ' fill-opacity="0"')}`;
    // the path out through the gate
    s += shape('M346 256 L372 256 L367 226 H351Z', U.mix(DECK[SEASON][0], '#b9a98c', 0.5));
    for (const x of [332, 372]) {
      s += `${box(x + 1, 258, 14, 2, '#000', ' opacity="0.12"')}${box(x, 206, 14, 52, col)}${box(x + 10.6, 206, 3.4, 52, dk)}${box(x + 2, 198, 10, 8, col)}${box(x + 9.6, 198, 2.4, 8, dk)}${box(x + 4, 190, 6, 8, col)}${box(x + 8.4, 190, 1.6, 8, dk)}${dot(x + 7, 187.6, 2.8, K.coral)}${dot(x + 6.2, 186.8, 0.8, '#fff', 0.6)}`;
      s += `${box(x, 214, 14, 1.8, cream)}${box(x, 219, 14, 1.8, cream)}${box(x, 224, 14, 1.8, cream)}${box(x - 1, 204.6, 16, 2.2, lt, ' rx="1"')}${box(x - 1, 254, 16, 4, dk, ' rx="1"')}`;
    }
    // the sunburst over the opening
    for (let i = 0; i < 9; i++) {
      const a0 = Math.PI + (i / 9) * Math.PI, a1 = Math.PI + ((i + 1) / 9) * Math.PI, cy = 208;
      s += shape(`M${tx} ${cy} L${f1(tx + Math.cos(a0) * 15)} ${f1(cy + Math.sin(a0) * 15)} L${f1(tx + Math.cos(a1) * 15)} ${f1(cy + Math.sin(a1) * 15)}Z`, i % 2 ? cream : col);
    }
    s += `<path d="M344 208 A15 15 0 0 1 374 208" fill="none" stroke="${dk}" stroke-width="1.4"/>${box(344, 208, 30, 7.4, cream)}${box(344, 214.6, 30, 1.2, dk)}${text(tx, 213.8, ok ? 'WAY IN' : 'W Y IN', 5, ok ? K.deep : '#8f8a78', ' letter-spacing="0.5"')}`;
    // the turnstile: a post with a cross of arms at two heights, inside a low rail
    s += `${line(`M346 250 Q${tx} 259 372 250`, iron, 1.2)}${oval(tx, 256.6, 6.6, 2, iron)}${box(tx - 1.7, 220, 3.4, 37, iron, ' rx="1"')}${dot(tx, 220, 2.4, iron)}${dot(tx - 0.6, 219.4, 0.7, '#fff', 0.6)}`;
    [231, 245].forEach((y, i) => {
      const across = `M${tx - 12.6} ${y + 0.8} L${tx + 12.6} ${y - 0.8}`, towards = `M${tx - 5.4} ${y + 5} L${tx + 5.4} ${y - 5}`;
      if (!ok && i) s += line(`M${tx - 1} ${y} q-7 1 -9 9 M${tx} ${y} L${tx + 11} ${y - 1}`, iron, 2.8) + line(`M${tx - 1} ${y} q-7 1 -9 9 M${tx} ${y} L${tx + 11} ${y - 1}`, col, 1.6);
      else s += line(`${across}${towards}`, iron, 3) + line(`${across}${towards}`, col, 1.8) + dot(tx - 12.6, y + 0.8, 1.5, cream) + dot(tx + 12.6, y - 0.8, 1.5, cream) + dot(tx - 5.4, y + 5, 1.5, cream);
    });
    if (ok) s += `${dot(tx, 199.6, 2.2, '#fff6dc')}${line(`M${tx} 197 v-1`, iron, 0.8)}`;
    if (!ok) {
      // shut up: a chain across the opening and a notice on it
      s += `${line('M346 228 Q359 238 372 228', '#6b5f50', 1.2)}<g transform="rotate(-4 359 236)">${box(349, 232, 20, 9, '#d8cfbf', ' rx="1"')}${text(359, 238.8, 'SHUT', 5.4, '#8a4a44')}</g>`;
      s += `${oval(339, 232, 5, 7, '#8f6a4a', 0.55)}${oval(380, 214, 4, 6, '#8f6a4a', 0.5)}${oval(379, 246, 4, 3, '#8f6a4a', 0.5)}`;
    } else if (p === 'grow') s += `${box(332, 190, 14, 68, FADE, ' opacity="0.5"')}${box(372, 190, 14, 68, FADE, ' opacity="0.5"')}${box(344, 192, 30, 24, FADE, ' opacity="0.42"')}`;
    if (winter() || p === 'snow') s += `${dot(339, 185, 2.6, SNOW)}${dot(379, 185, 2.6, SNOW)}${shape('M344 208 A15 15 0 0 1 374 208 Q359 197 344 208Z', SNOW)}${box(333.6, 196.8, 10.8, 2, SNOW, ' rx="1"')}${box(373.6, 196.8, 10.8, 2, SNOW, ' rx="1"')}`;
    return s + '</g>';
  }

  // -------------------------------------------------------------- the ground
  const tuft = (x, y) => line(`M${f1(x)} ${f1(y)} l-2 -4 M${f1(x)} ${f1(y)} l0.6 -5 M${f1(x)} ${f1(y)} l2.4 -3.4`, '#5f8a3a', 1);
  const drifts = (x0, x1, y0, y1, n) => {
    const r = U.rng(x0 + y0);
    let s = '';
    for (let i = 0; i < n; i++) s += oval(U.lerp(x0, x1, r()), U.lerp(y0, y1, r()), 12 + r() * 16, 1.6 + r() * 2.4, r() < 0.5 ? '#fff' : '#dfe8ef', 0.8);
    return s;
  };
  function ground() {
    const c = DECK[SEASON];
    let s = `${box(-6, 252, 412, 200, c[0])}${line(DECK_LINES, c[1], 0.7, 0.9)}${box(-6, 252, 412, 2.4, '#000', ' opacity="0.1"')}`;
    if (PCT < 0.45) {
      const r = U.rng(271);
      for (let i = 0; i < 10; i++) s += oval(r() < 0.5 ? 340 + r() * 60 : 30 + r() * 300, 256 + r() * 10 + (i % 3) * 3, 5 + r() * 9, 1.6 + r() * 2.4, '#7f8f4e', 0.5);
      for (let i = 0; i < 9; i++) s += tuft(346 + r() * 50, 300 + r() * 130);
      for (let i = 0; i < 6; i++) s += tuft(120 + r() * 200, 257 + r() * 8);
    }
    if (winter()) s += box(-6, 252, 412, 200, SNOW, ' opacity="0.72"') + drifts(344, 400, 300, 430, 5) + drifts(120, 330, 254, 266, 3);
    return s;
  }
  // the sun terrace in front of the pool, its pale terrazzo laid out in big squares
  function terrace(st) {
    const p = pend(st, 'terrace'), ok = st.terrace, d = 'M-6 438 H406 V545 H-6Z', r = U.rng(277);
    let s = `<g data-part="terrace"><path d="${d}" fill="${url(ok ? 'Terr' : 'TerrOld')}"/>${line(TERR_LINES, ok ? '#d6c5a2' : '#8f8a70', 0.8, 0.85)}`;
    // a border of coral, cream and blue squares along the pool
    const cols = ok ? ['#e5675a', '#fff6e6', '#7cc3cf'] : ['#a68a7c', '#c9c2b2', '#8f9a8c'];
    const squares = ['', '', ''];
    for (let i = 0; i < 44; i++) {
      const x0 = -44 + i * 16, x1 = x0 + 16;
      squares[i % 2 ? 1 : i % 4 ? 2 : 0] += poly([toVP(x0, 450, 442), toVP(x1, 450, 442), [x1, 450], [x0, 450]]);
    }
    squares.forEach((d, i) => { s += shape(d, cols[i]); });
    s += `${box(-6, 450, 412, 1, '#000', ' opacity="0.14"')}${box(-6, 438, 412, 4, '#000', ' opacity="0.1"')}`;
    if (!ok) {
      for (let i = 0; i < 14; i++) s += oval(r() * 400, 456 + r() * 82, 9 + r() * 22, 3 + r() * 6, U.pick(r, ['#6f8a3e', '#748f42', '#8d9466']), 0.5);
      for (let i = 0; i < 16; i++) s += tuft(r() * 400, 458 + r() * 80);
      s += `${line('M70 468 l18 6 l10 14 l22 4', '#6a6452', 0.9, 0.8)}${line('M268 472 l-12 12 l6 16 l-14 14', '#6a6452', 0.9, 0.8)}${line('M330 456 l8 12 l-4 12', '#6a6452', 0.8, 0.7)}`;
      s += `${shape('M192 492 l26 -2 l6 13 l-30 3Z', '#6e6a58', ' opacity="0.55"')}${shape('M300 516 l22 -2 l6 12 l-26 3Z', '#6e6a58', ' opacity="0.5"')}`;
    } else if (p === 'grow') {
      // sand blown over it in summer, moss in the joints in spring
      if (SEASON === 'summer') for (const [x, y, rx] of [[66, 462, 30], [214, 470, 40], [330, 462, 26], [150, 506, 46], [300, 520, 34]]) s += oval(x, y, rx, rx * 0.2, '#e8d29c', 0.85) + oval(x + rx * 0.3, y - 1.4, rx * 0.5, rx * 0.08, '#f6e7ba', 0.8);
      else {
        for (let i = 0; i < 12; i++) s += oval(r() * 400, 458 + r() * 78, 6 + r() * 12, 2 + r() * 3, U.pick(r, ['#6f8a3e', '#748f42']), 0.6);
        for (let i = 0; i < 8; i++) s += tuft(r() * 400, 460 + r() * 76);
      }
    }
    if (p === 'leaves') s += `<path d="${d}" fill="${url('Leaves')}"/>`;
    else if (p === 'snow') s += `<path d="${d}" fill="${SNOW}" opacity="0.96"/>${drifts(0, 400, 458, 536, 16)}`;
    else if (winter()) s += `<path d="${d}" fill="${SNOW}" opacity="0.7"/>${drifts(0, 400, 462, 536, 7)}${line('M268 545 Q282 502 330 462', '#a7b0b9', 2.6, 0.26)}`;
    else if (SEASON === 'autumn') for (let i = 0; i < 16; i++) s += leaf(r() * 400, 456 + r() * 82, r() * 180, U.pick(r, FALL), 3);
    return s + '</g>';
  }

  // ---------------------------------------------------------------- the pool
  // How much water there is. Until its tiles are done the pool stays empty, green
  // and dirty whatever the season; after that it follows the year: full and
  // shining in summer, let down to a low rest in autumn, drained and rimed in
  // winter, and drained with pale scrubbed tiles in spring.
  function waterLevel(st) {
    if (!st.tiles) return 'murky';
    return { summer: 'full', autumn: 'low', winter: 'rimed', spring: 'scrubbed' }[SEASON];
  }
  // a feather of rime: a rib with little barbs on both sides
  function fern(x, y, a, len, w = 0.7) {
    const cos = Math.cos(a), sin = Math.sin(a);
    let d = `M${f1(x)} ${f1(y)} l${f1(cos * len)} ${f1(sin * len)}`;
    for (let i = 1; i <= 4; i++) {
      const t = (i / 5) * len, b = len * 0.3 * (1 - i / 6), px = x + cos * t, py = y + sin * t;
      for (const k of [-0.7, 0.7]) d += `M${f1(px)} ${f1(py)} l${f1(Math.cos(a + k) * b)} ${f1(Math.sin(a + k) * b)}`;
    }
    return line(d, '#fff', w, 0.9);
  }
  function tiles(st) {
    const w = LEVEL, T = TILE[w], p = pend(st, 'tiles'), r = U.rng(211), murky = w === 'murky';
    const seam = seg(F(0, 0), F(1, 0)) + seg(F(0, 0), F(0, 1.1)) + seg(F(1, 0), F(1, 1.1));
    let s = `<g data-part="tiles" data-water="${w}"><g clip-path="${url('Pool')}">${shape(POOL_D, T.side)}${shape(FLOOR_D, url('Floor'))}`;
    s += shape(poly([P(0, 0), F(0, 0), F(0, 1.1), P(0, 1.1)]), T.side) + shape(poly([P(1, 0), F(1, 0), F(1, 1.1), P(1, 1.1)]), U.shade(T.side, -0.07)) + shape(poly([P(0, 0), P(1, 0), F(1, 0), F(0, 0)]), T.wall);
    s += line(FLOOR_JOINTS, T.joint, 0.55, 0.85) + line(WALL_JOINTS, T.joint, 0.55, 0.85);
    s += `<path d="${FLOOR_BAND}" fill="none" stroke="${T.mark}" stroke-width="2.2" opacity="${murky ? 0.5 : 0.9}"/>`;
    // the frieze of coral and blue along the top of the walls
    const a = murky ? '#7f7a5e' : w === 'rimed' ? '#d9a9a4' : '#e5675a', b = murky ? '#6f7a62' : w === 'rimed' ? '#9cc4d6' : '#2f8fae';
    let fa = '', fb = '';
    for (let i = 0; i < 40; i++) { const x = 116 + i * 5.6; (i % 2 ? (fb += `M${f1(x)} 270.4h3.4v3.4h-3.4Z`) : (fa += `M${f1(x)} 270.4h3.4v3.4h-3.4Z`)); }
    s += shape(fa, a) + shape(fb, b) + line(seg(P(0, 0, 5), P(0, 1.1, 5)), a, 1.4, 0.8) + line(seg(P(1, 0, 5), P(1, 1.1, 5)), b, 1.4, 0.8);
    s += line(seam, '#000', 1.2, 0.14) + box(100, 268, 260, 7, url('Shade'), ' opacity="0.5"');
    const [gx, gy] = F(0.32, 0.12);
    s += `${oval(gx, gy, 9, 2.8, murky ? '#46502f' : '#5f8496')}${line(`M${gx - 6} ${gy - 0.8} h12 M${gx - 7} ${gy + 0.7} h14`, murky ? '#6f7a62' : '#c9dee8', 0.6)}`;
    if (murky) {
      // green slime everywhere, thickest in the deep end, a stagnant puddle and black gaps
      s += shape(poly([F(0, 0), F(1, 0), F(1, 0.55), F(0, 0.55)]), '#5f7440', ' opacity="0.5"');
      for (let i = 0; i < 24; i++) { const [x, y] = F(r(), r()); s += oval(x, y, 8 + r() * 26, 2.6 + r() * 7, U.pick(r, ['#5f7a34', '#748f42', '#4f6a2e', '#8f9a58']), 0.5); }
      for (let i = 0; i < 12; i++) { const c = Math.floor(r() * 14), j = 2 + Math.floor(r() * 13); s += shape(poly([F(c / 14, j / 16), F((c + 1) / 14, j / 16), F((c + 1) / 14, (j + 1) / 16), F(c / 14, (j + 1) / 16)]), '#46502f', ' opacity="0.7"'); }
      for (let i = 0; i < 16; i++) { const x = 126 + r() * 200, h = 8 + r() * 26; s += line(`M${f1(x)} 271 q1 ${f1(h / 2)} 0 ${f1(h)}`, U.pick(r, ['#5f6a40', '#6a6f4a', '#4f5a36']), 1.2 + r() * 1.8, 0.5); }
      const c = F(0.47, 0.1);
      s += `${oval(c[0], c[1], 86, 15, '#46592c', 0.9)}${oval(c[0] - 24, c[1] - 3, 34, 4, '#6f8a4a', 0.65)}${oval(c[0] + 34, c[1] + 4, 20, 3, '#5f7a3a', 0.7)}`;
      s += line('M286 276 l-6 12 l8 8 l-6 14 M150 300 l8 8 l-4 10', '#3f4a2c', 0.9, 0.8);
    } else if (w === 'rimed') {
      // pale rime over the tiles, in feathers up the far wall
      s += shape(POOL_D, url('Frost'), ' opacity="0.42"');
      for (let i = 0; i < 9; i++) s += fern(132 + i * 23 + r() * 8, 300 - r() * 6, -Math.PI / 2 + (r() - 0.5) * 0.7, 16 + r() * 8);
      for (let i = 0; i < 12; i++) { const [x, y] = F(0.08 + r() * 0.84, 0.3 + r() * 0.62); s += fern(x, y, r() * 6.3, 9 + r() * 8, 0.6); }
    } else if (w === 'low') {
      // the old water line, and the slope still damp where the water has gone down
      s += line(`${seg(P(0, 0, 7), P(1, 0, 7))}${seg(P(0, 0, 7), P(0, 1.1, 7))}${seg(P(1, 0, 7), P(1, 1.1, 7))}`, '#7f9a8a', 1.2, 0.5);
      s += shape(poly([P(0, LOW.v, LOW.d), P(1, LOW.v, LOW.d), F(1, LOW.v + 0.12), F(0, LOW.v + 0.12)]), '#7fa7a4', ' opacity="0.3"');
    } else if (w === 'scrubbed' && p === 'grow') {
      // half done: a grey film still on the tiles, with clean arcs and suds where the brush has been
      s += shape(poly([F(0, 0), F(1, 0), F(1, 1.1), F(0, 1.1)]), '#b8bfa8', ' opacity="0.42"') + shape(poly([P(0, 0), P(1, 0), F(1, 0), F(0, 0)]), '#b8bfa8', ' opacity="0.34"');
      for (const [u, v, rx] of [[0.2, 0.2, 34], [0.56, 0.14, 40], [0.82, 0.28, 30], [0.36, 0.4, 42], [0.7, 0.46, 34], [0.5, 0.62, 30]]) {
        const [x, y] = F(u, v);
        s += `${line(`M${f1(x - rx)} ${f1(y + 4)} q${rx} ${f1(-rx * 0.5)} ${rx * 2} 0`, '#f4fbfa', 5, 0.9)}${line(`M${f1(x - rx * 0.8)} ${f1(y + 9)} q${f1(rx * 0.8)} ${f1(-rx * 0.4)} ${f1(rx * 1.6)} 0`, '#f4fbfa', 3.4, 0.7)}`;
        for (let i = 0; i < 5; i++) s += dot(x - rx + r() * rx * 2, y - 2 + r() * 12, 1 + r() * 1.6, '#fff', 0.9);
      }
    }
    return s + '</g></g>';
  }
  // the starfish on the floor at the shallow end, tile by tile
  const STAR = { u: 0.67, v: 0.7, ru: 0.155, rv: 0.2 };
  const starAt = (a, b) => F(STAR.u + a * STAR.ru, STAR.v + b * STAR.rv);
  const STAR_PTS = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.4 : 1; return starAt(Math.cos(a) * r, Math.sin(a) * r); });
  const STAR_D = rounded(STAR_PTS, 4);
  const inStar = ([x, y]) => { let c = false; for (let i = 0, j = 9; i < 10; j = i++) { const [xi, yi] = STAR_PTS[i], [xj, yj] = STAR_PTS[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
  const STAR_COLS = ['#f2c14e', '#fff2dc', '#e5675a', '#ee8a78', '#d44f4f'];
  const TESSERAE = (() => {
    const r = U.rng(241), out = [];
    for (let j = -7; j <= 7; j++) for (let i = -7; i <= 7; i++) {
      const a = i * 0.145, b = j * 0.145, g = 0.06, q = Math.hypot(a, b);
      if (!inStar(starAt(a, b))) continue;
      out.push({ d: poly([starAt(a - g, b - g), starAt(a + g, b - g), starAt(a + g, b + g), starAt(a - g, b + g)]), c: q < 0.26 ? 0 : q > 0.78 ? 1 : r() < 0.5 ? 2 : r() < 0.6 ? 3 : 4 });
    }
    return out;
  })();
  function mosaic(st) {
    const ok = st.mosaic, p = pend(st, 'mosaic'), r = U.rng(243);
    let s = `<g data-part="mosaic"><path d="${STAR_D}" fill="#000" fill-opacity="0"/>`;
    if (!ok) return `${s}<path d="${STAR_D}" fill="none" stroke="${LEVEL === 'murky' ? '#c3c8a4' : '#7ea3b3'}" stroke-width="1" stroke-dasharray="3 2.4" opacity="0.6"/></g>`;
    s += shape(STAR_D, '#fff6e6');
    const paths = STAR_COLS.map(() => '');
    TESSERAE.forEach((t, i) => { if (!(p && (i * 7) % 11 === 3)) paths[t.c] += t.d; });
    s += `<g id="${id('Star')}" clip-path="${url('StarEdge')}">${paths.map((d, i) => shape(d, STAR_COLS[i])).join('')}</g>`;
    s += `<path d="${STAR_D}" fill="none" stroke="${K.deep}" stroke-width="1"/>`;
    // tiles worked loose, lying about on the floor
    if (p) for (let i = 0; i < 9; i++) { const [x, y] = starAt(-1.2 + r() * 2.4, -1.1 + r() * 2.3); s += `<rect x="${f1(x)}" y="${f1(y)}" width="4" height="3" fill="${U.pick(r, STAR_COLS)}" transform="rotate(${Math.round(r() * 90)} ${f1(x)} ${f1(y)})"/>`; }
    // rime over the star in winter
    if (LEVEL === 'rimed') {
      s += shape(STAR_D, url('Frost'), ' opacity="0.56"');
      for (let i = 0; i < 5; i++) { const q = STAR_PTS[i * 2], c = starAt(0, 0); s += fern(c[0], c[1], Math.atan2(q[1] - c[1], q[0] - c[0]), Math.hypot(q[1] - c[1], q[0] - c[0]) * 0.8, 0.8); }
    }
    return s + '</g>';
  }
  // the steps down at the shallow end: quarter rounds in the corner of the pool
  const TREADS = [0.34, 0.27, 0.2, 0.13].map((R, i) => {
    const d = U.lerp(17, 3, i / 3), arc = [];
    for (let k = 0; k <= 10; k++) { const a = (k / 10) * (Math.PI / 2); arc.push(P(Math.cos(a) * R, 1 - Math.sin(a) * R * 1.3, d)); }
    const o = arc.map(([x, y]) => `${f1(x)} ${f1(y)}`).join(' L');
    return { fill: poly(arc.concat([P(0, 1.1, d), P(R, 1.1, d)])), arc: `M${o}` };
  });
  function steps(st) {
    const p = pend(st, 'steps'), ok = st.steps, r = U.rng(251);
    const top = ok ? '#fbf6ea' : '#aeb194', nose = ok ? K.band : '#7e8468';
    let s = `<g data-part="steps"><g clip-path="${url('Pool')}">`;
    TREADS.forEach((t, i) => { s += shape(t.fill, U.mix(top, ok ? '#bfe3ea' : '#8f9a78', 0.5 * (1 - i / 3))) + line(t.arc, nose, 1.9) + `<g transform="translate(0 1.5)">${line(t.arc, '#000', 0.8, 0.12)}</g>`; });
    if (!ok) {
      // the treads cracked and broken away, green in the corners
      const g = (u, v, w, h, d) => { const [x, y] = P(u, v, d); return shape(`M${f1(x)} ${f1(y)} l${w} 2 l-3 ${h} l${-w + 2} -2Z`, '#55604a', ' opacity="0.8"'); };
      s += g(0.2, 0.86, 16, 7, 8) + g(0.05, 0.72, 14, 6, 12) + g(0.27, 0.95, 12, 8, 12);
      for (let i = 0; i < 9; i++) { const [x, y] = P(0.02 + r() * 0.3, 0.72 + r() * 0.27, 8); s += oval(x, y, 5 + r() * 8, 1.6 + r() * 2.2, U.pick(r, ['#6f8a3e', '#5f7a34']), 0.55); }
    } else if (p === 'leaves') {
      for (let i = 0; i < 24; i++) { const a = r() * (Math.PI / 2), R = 0.05 + r() * 0.3; s += leaf(...P(Math.cos(a) * R, 1 - Math.sin(a) * R * 1.3, 8), r() * 180, U.pick(r, FALL), 3.2); }
    } else if (p === 'snow' || LEVEL === 'rimed') {
      TREADS.forEach((t, i) => { s += `<g transform="translate(0 ${p === 'snow' ? 2.4 : 1.4})">${line(t.arc, SNOW, p === 'snow' ? 4.4 : 2.2)}</g>`; });
      if (p === 'snow') s += shape(TREADS[3].fill, url('Snow'));
    }
    return s + '</g></g>';
  }
  // chrome rails either side of the steps
  function stepRails(st) {
    const ok = st.steps, c = ok ? K.chrome : '#8a6a52', a = P(0, 0.56), b = P(0.36, 1);
    let s = '<g data-part="steps">';
    if (ok) {
      s += `${line(`M${f1(a[0] - 6)} ${f1(a[1] + 1)} q2 -16 16 -16 q10 1 11 18`, '#000', 2.4, 0.1)}${line(`M${f1(a[0] - 6)} ${f1(a[1] - 2)} q2 -16 16 -16 q10 1 11 18`, c, 2)}${line(`M${f1(a[0] - 6)} ${f1(a[1] - 2.6)} q2 -16 16 -16`, '#fff', 0.6, 0.7)}`;
      s += `${line(`M${f1(b[0] + 3)} ${f1(b[1] + 7)} q0 -18 -12 -21 q-10 -1 -13 8`, c, 2)}${line(`M${f1(b[0] + 2.4)} ${f1(b[1] + 6)} q0 -17 -11.4 -20.4`, '#fff', 0.6, 0.7)}`;
    } else s += line(`M${f1(a[0] - 6)} ${f1(a[1] - 2)} q2 -12 10 -13 l6 3`, c, 2) + line(`M${f1(b[0] + 3)} ${f1(b[1] + 7)} q0 -10 -5 -14`, c, 2);
    return s + '</g>';
  }
  // what lies over the floor of an empty pool: snow, leaves, a pail and a broom
  function poolOver(st) {
    const p = pend(st, 'tiles'), r = U.rng(257);
    let s = `<g clip-path="${url('Pool')}" pointer-events="none">`;
    if (LEVEL === 'rimed') {
      // a little snow in the bottom of the deep end, a good deal more when there is a job in it
      const to = p === 'snow' ? 0.6 : 0.2, a = F(0, 0), b = F(1, 0), c = F(1, to), e = F(0, to), m = F(0.5, to + 0.13);
      s += shape(`M${f1(a[0])} ${f1(a[1] - (p === 'snow' ? 10 : 4))} L${f1(b[0])} ${f1(b[1] - (p === 'snow' ? 10 : 4))} L${f1(c[0])} ${f1(c[1])} Q${f1(m[0])} ${f1(m[1])} ${f1(e[0])} ${f1(e[1])}Z`, SNOW);
      for (const [u, h] of [[0.16, 7], [0.5, 9], [0.82, 6]]) { const q = F(u, 0.02); s += oval(q[0], q[1] - (p === 'snow' ? 9 : 3), 34, h, SNOW); }
      s += `${oval(...F(0.26, to * 0.5), 30, 2.4, '#dfe8ef', 0.9)}${oval(...F(0.74, to * 0.6), 34, 2.6, '#dfe8ef', 0.9)}`;
      if (p === 'snow') s += `${oval(...F(0.34, 0.34), 26, 7, '#fff')}${oval(...F(0.72, 0.42), 30, 8, '#fff')}${oval(...F(0.5, 0.5), 40, 3, '#dfe8ef', 0.8)}`;
    } else if (LEVEL === 'low') {
      const n = p === 'leaves' ? 56 : 14;
      for (let i = 0; i < n; i++) { const [x, y] = F(r(), LOW.v + 0.02 + r() * 0.62); s += leaf(x, y, r() * 180, U.pick(r, FALL), 3 + r()); }
      if (p === 'leaves') for (const [u, v, rx] of [[0.14, 0.52, 22], [0.62, 0.48, 18], [0.88, 0.62, 16]]) { const [x, y] = F(u, v); s += oval(x, y + 1, rx, rx * 0.3, '#a85f2c', 0.9); for (let i = 0; i < 9; i++) s += leaf(x + (r() - 0.5) * rx * 1.7, y + (r() - 0.5) * rx * 0.46, r() * 180, U.pick(r, FALL), 3.2); }
    } else if (LEVEL === 'scrubbed' && p === 'grow') {
      // the pail and the broom, left where the scrubbing stopped
      const [bx, by] = F(0.42, 0.58);
      s += `${shadow(bx + 1, by + 12, 13, 2)}${shape(`M${f1(bx - 10)} ${f1(by - 4)} H${f1(bx + 10)} L${f1(bx + 8)} ${f1(by + 12)} H${f1(bx - 8)}Z`, '#a6b4bd')}${line(`M${f1(bx - 8)} ${f1(by + 4)} H${f1(bx + 8)}`, '#8a979f', 1)}${oval(bx, by - 4, 10, 2.8, '#8a979f')}${oval(bx, by - 4.4, 8.6, 2, '#fff')}${dot(bx - 3, by - 6, 1.8, '#fff')}${dot(bx + 3, by - 6.6, 1.5, '#fff')}${line(`M${f1(bx - 10)} ${f1(by - 4)} Q${f1(bx)} ${f1(by - 18)} ${f1(bx + 10)} ${f1(by - 4)}`, '#6b6b70', 0.9)}`;
      const h0 = F(0.2, 0.3), h1 = F(0.42, 0.42);
      s += `${line(seg([h0[0], h0[1] + 2], [h1[0], h1[1] + 2]), '#000', 2.4, 0.1)}${line(seg(h0, h1), '#c89b62', 2.2)}<g transform="rotate(${f1((Math.atan2(h1[1] - h0[1], h1[0] - h0[0]) * 180) / Math.PI)} ${f1(h1[0])} ${f1(h1[1])})">${box(h1[0] - 2, h1[1] - 12, 6, 24, '#8a6240', ' rx="1.6"')}${box(h1[0] + 3.6, h1[1] - 11, 5, 22, '#d9c28c', ' rx="0.8"')}${line(`M${f1(h1[0] + 4)} ${f1(h1[1] - 7)} h4 M${f1(h1[0] + 4)} ${f1(h1[1] - 2)} h4 M${f1(h1[0] + 4)} ${f1(h1[1] + 3)} h4 M${f1(h1[0] + 4)} ${f1(h1[1] + 8)} h4`, '#a8905c', 0.6)}</g>`;
    }
    return s + '</g>';
  }
  const CAUSTICS = (() => {
    const r = U.rng(281), nx = 7, ny = 4, G = [];
    for (let j = 0; j <= ny; j++) { G.push([]); for (let i = 0; i <= nx; i++) G[j].push(P((i + (r() - 0.5) * 0.7) / nx, 0.4 + ((j + (r() - 0.5) * 0.7) / ny) * 0.66, 6)); }
    const q = (a, b) => `M${f1(a[0])} ${f1(a[1])} Q${f1((a[0] + b[0]) / 2 + (r() - 0.5) * 12)} ${f1((a[1] + b[1]) / 2 + (r() - 0.5) * 7)} ${f1(b[0])} ${f1(b[1])}`;
    let d = '';
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) d += q(G[j][i], G[j][i + 1]) + q(G[j][i], G[j + 1][i]);
    return d;
  })();
  const wave = (x, y, n, l, a) => `M${f1(x)} ${f1(y)} q${f1(l / 2)} ${f1(-a)} ${f1(l)} 0${` t${f1(l)} 0`.repeat(n - 1)}`;
  const glint = (x, y, r) => { const a = f1(r * 0.8), b = f1(r * 0.2); return `<path class="sb-glint" d="M${f1(x)} ${f1(y - r)}l${b} ${a} ${a} ${b} -${a} ${b} -${b} ${a} -${b} -${a} -${a} -${b} ${a} -${b}Z" fill="#fff"/>`; };
  // the water itself: the full pool shines, the low rest lies dull in the deep end
  function water(st) {
    if (LEVEL === 'low') return lowWater();
    if (LEVEL !== 'full') return '';
    const r = U.rng(263);
    let s = `<g clip-path="${url('Pool')}" pointer-events="none">${shape(POOL_D, url('Water'))}`;
    // the cream building and the bright sky lying on the water at the far end
    s += `${oval(218, 274, 108, 8.6, '#fff6de', 0.55)}${oval(214, 283, 84, 3.6, '#fff6de', 0.26)}${oval(232, 290, 58, 2.4, '#fff6de', 0.2)}`;
    // light playing on the floor of the shallow end, and the star through the water
    s += line(CAUSTICS, '#fff', 1.2, 0.15);
    if (st.mosaic) s += `<use href="#${id('Star')}" opacity="0.62"/><path d="${STAR_D}" fill="none" stroke="${K.deep}" stroke-width="0.8" opacity="0.5"/>`;
    // slow ripples, two lots sliding against each other
    const rows = (seed, n, col, op) => {
      const q = U.rng(seed);
      let d = '';
      for (const [y, l] of [[298, 11], [316, 12], [336, 14], [356, 16], [378, 18], [402, 21], [422, 24]]) for (let i = 0; i < n; i++) d += wave(90 + q() * 200, y + (q() - 0.5) * 7, 2 + Math.floor(q() * 2), l, 1.2 + l * 0.06);
      return line(d, col, 1.1, op);
    };
    s += `<g class="sb-ripple">${rows(265, 2, '#ffffff', 0.5)}</g><g class="sb-ripple b">${rows(267, 1, '#13899f', 0.26)}</g>`;
    s += `<ellipse class="sb-ring" cx="${f1(FO.x)}" cy="${f1(FO.water + 1)}" rx="36" ry="10.6" fill="none" stroke="#fff" stroke-width="1"/><ellipse class="sb-ring b" cx="${f1(FO.x)}" cy="${f1(FO.water + 1)}" rx="36" ry="10.6" fill="none" stroke="#fff" stroke-width="1"/>`;
    for (let i = 0; i < 13; i++) { const [x, y] = P(0.06 + r() * 0.88, 0.04 + r() * 0.9); s += glint(x, y, 2.4 + r() * 2.6); }
    return s + '</g>';
  }
  function lowWater() {
    const d = LOW.d, a = P(0, 0, d), b = P(1, 0, d), c = P(1, LOW.v, d), e = P(0, LOW.v, d), m = P(0.5, LOW.v + 0.05, d), r = U.rng(269);
    const edge = `M${f1(a[0])} ${f1(a[1])} L${f1(b[0])} ${f1(b[1])} L${f1(c[0])} ${f1(c[1])} Q${f1(m[0])} ${f1(m[1] + 12)} ${f1(e[0])} ${f1(e[1])}Z`;
    let s = `<g clip-path="${url('Pool')}" pointer-events="none">${shape(edge, url('Rest'))}`;
    s += `<path d="${edge}" fill="none" stroke="#fff" stroke-width="0.8" opacity="0.28"/>`;
    s += `${oval(170, 302, 44, 2.2, '#fff6de', 0.4)}${oval(276, 310, 38, 2, '#fff6de', 0.3)}`;
    s += `<g class="sb-ripple">${line(wave(130, 318, 3, 15, 1.6) + wave(240, 328, 3, 16, 1.6), '#fff', 0.9, 0.34)}</g>`;
    for (let i = 0; i < 20; i++) { const [x, y] = P(0.04 + r() * 0.92, 0.02 + r() * (LOW.v - 0.04), d); s += leaf(x, y + 2, r() * 180, U.pick(r, FALL), 3); }
    return s + '</g>';
  }
  // the drum of the fountain below the water line, seen through the water
  function fountainFoot() {
    if (LEVEL !== 'full') return '';
    const { x, floor, water: w } = FO;
    return `<g pointer-events="none">${shape(`M${f1(x - 26)} ${f1(w)} V${f1(floor)} A26 7.5 0 0 0 ${f1(x + 26)} ${f1(floor)} V${f1(w)}Z`, '#e9efe4')}</g>`;
  }
  // a tiered deco fountain standing in the pool: a drum, a basin and two bowls
  function fountain(st) {
    const p = pend(st, 'fountain'), ok = st.fountain, { x, floor, water: wl, top, bowl, cap } = FO;
    const c = ok ? U.shade(K.cream, 0.1) : '#b5b49c', dk = U.shade(c, -0.22), lt = U.shade(c, 0.35), blue = ok ? K.band : '#8f9a8c', frozen = winter();
    const live = ok && !p && (SEASON === 'summer' || SEASON === 'spring');
    const pool = !ok ? '#8a8f6c' : frozen ? '#e4f0f6' : p === 'grow' ? (SEASON === 'summer' ? '#93b35c' : '#b4b393') : p === 'leaves' ? '#b89a64' : SEASON === 'autumn' ? '#8fbcb4' : '#7fe0e0';
    const low = LEVEL === 'full' ? wl : floor;
    let s = `<g data-part="fountain">${LEVEL === 'rimed' ? oval(x, floor + 2, 38, 11, SNOW) : ''}`;
    s += `${shape(`M${f1(x - 26)} ${top} V${f1(low)} A26 7.5 0 0 0 ${f1(x + 26)} ${f1(low)} V${top}Z`, ok ? url('Wall') : c)}`;
    if (LEVEL !== 'full') s += shape(`M${f1(x - 26)} ${f1(floor - 6)} A26 7.5 0 0 0 ${f1(x + 26)} ${f1(floor - 6)} V${f1(floor)} A26 7.5 0 0 1 ${f1(x - 26)} ${f1(floor)}Z`, blue, ' opacity="0.8"');
    if (LEVEL !== 'full') s += `${line(`M${f1(x - 26)} ${top + 7} A26 7.5 0 0 0 ${f1(x + 26)} ${top + 7}`, blue, 1.6)}<path d="M${f1(x - 26)} ${top + 11} A26 7.5 0 0 0 ${f1(x + 26)} ${top + 11}" fill="none" stroke="${ok ? K.coral : '#a68a7c'}" stroke-width="2.4" stroke-dasharray="2.6 2"/>`;
    // the basin on top of the drum
    s += `${oval(x, top + 2.4, 30, 9, dk)}${oval(x, top, 30, 9, lt)}${oval(x, top - 0.8, 26, 7, pool)}`;
    if (live) s += `${oval(x - 8, top - 2, 11, 2, '#fff', 0.5)}<ellipse class="sb-ring" cx="${f1(x)}" cy="${top - 0.8}" rx="17" ry="4.4" fill="none" stroke="#fff" stroke-width="0.7"/>`;
    // the stem and the lower bowl
    s += `${shape(`M${f1(x - 6)} ${top - 1} L${f1(x - 3.6)} ${bowl + 2} H${f1(x + 3.6)} L${f1(x + 6)} ${top - 1}Z`, c)}${shape(`M${f1(x + 1.4)} ${top - 1} L${f1(x + 1)} ${bowl + 2} H${f1(x + 3.6)} L${f1(x + 6)} ${top - 1}Z`, dk)}`;
    s += `${oval(x, top - 1, 8.6, 2.6, dk, 0.5)}${shape(`M${f1(x - 16.6)} ${bowl} Q${f1(x - 11)} ${bowl + 12} ${f1(x)} ${bowl + 12} Q${f1(x + 11)} ${bowl + 12} ${f1(x + 16.6)} ${bowl}Z`, c)}${shape(`M${f1(x + 4)} ${bowl} Q${f1(x + 5)} ${bowl + 11} ${f1(x)} ${bowl + 12} Q${f1(x + 11)} ${bowl + 12} ${f1(x + 16.6)} ${bowl}Z`, dk)}`;
    s += `${oval(x, bowl, 16.6, 4.6, lt)}${oval(x, bowl - 0.4, 13.6, 3.3, pool)}`;
    // the upper stem and bowl; broken off while the fountain is tired
    if (ok) {
      s += `${box(x - 2.2, cap, 4.4, bowl - cap - 1, c)}${box(x + 0.4, cap, 1.8, bowl - cap - 1, dk)}`;
      s += `${shape(`M${f1(x - 8.6)} ${cap} Q${f1(x - 5)} ${cap + 7} ${f1(x)} ${cap + 7} Q${f1(x + 5)} ${cap + 7} ${f1(x + 8.6)} ${cap}Z`, c)}${oval(x, cap, 8.6, 2.5, lt)}${oval(x, cap - 0.2, 6.6, 1.7, pool)}${box(x - 1.4, cap - 6, 2.8, 6, c)}${dot(x, cap - 7, 2.8, K.coral)}${dot(x - 0.8, cap - 7.8, 0.8, '#fff', 0.7)}`;
    } else s += `${shape(`M${f1(x - 2.6)} ${bowl - 1} L${f1(x - 2.2)} ${bowl - 9} l1.6 2 l1.4 -3 l1.8 2.6 V${bowl - 1}Z`, c)}${oval(x - 14, bowl + 16, 4, 1.6, c)}`;
    if (live) {
      // water falling from bowl to bowl, and drops running down it
      for (const k of [-1, -0.45, 0.45, 1]) {
        s += line(`M${f1(x + k * 2)} ${cap - 9.4} Q${f1(x + k * 8)} ${cap - 12} ${f1(x + k * 12)} ${bowl - 1}`, '#eafcff', 0.9, 0.85);
        s += line(`M${f1(x + k * 16)} ${bowl + 1} Q${f1(x + k * 21)} ${bowl + 4} ${f1(x + k * 24)} ${top - 1}`, '#eafcff', 1.1, 0.85);
      }
      for (const [k, y] of [[-14, bowl - 8], [13, bowl - 6], [-20, bowl + 8], [21, bowl + 10], [6, bowl - 9], [-7, bowl - 10]]) s += `<circle class="sb-drop" cx="${f1(x + k)}" cy="${y}" r="1" fill="#f2fdff"/>`;
    } else if (!ok) {
      // green stains and a weed in the basin
      s += `${oval(x - 12, top + 10, 11, 4, '#6f8a3e', 0.6)}${oval(x + 13, low - 8, 9, 3.4, '#748f42', 0.55)}${line(`M${f1(x + 8)} ${top - 1} l-2 -7 M${f1(x + 8)} ${top - 1} l2 -8 M${f1(x + 8)} ${top - 1} l4 -5`, '#6f8a3e', 1)}${oval(x - 2, bowl - 0.4, 9, 2, '#6f8a3e', 0.7)}`;
    } else if (p === 'grow') {
      s += `${oval(x - 10, top - 1, 8, 2, '#6f8a3e', 0.65)}${oval(x + 12, top + 0.4, 6, 1.6, '#748f42', 0.6)}${oval(x + 3, bowl - 0.4, 6, 1.6, '#6f8a3e', 0.65)}${oval(x + 16, top + 8, 7, 3, '#748f42', 0.4)}`;
    }
    if (p === 'leaves') {
      const r = U.rng(261);
      for (let i = 0; i < 12; i++) s += leaf(x + (r() - 0.5) * 42, top - 1 + (r() - 0.5) * 10, r() * 180, U.pick(r, FALL), 3);
      for (let i = 0; i < 5; i++) s += leaf(x + (r() - 0.5) * 20, bowl - 0.4 + (r() - 0.5) * 4, r() * 180, U.pick(r, FALL), 2.6);
    } else if (SEASON === 'autumn' && ok) s += leaf(x + 12, top, 30, FALL[0]) + leaf(x - 15, top - 2, -40, FALL[1], 3);
    if (frozen && ok) {
      // icicles from the bowls, and snow in them
      let ice = '';
      for (const k of [-14, -8, -2, 5, 11, 15]) ice += `M${f1(x + k - 1.2)} ${bowl + 2.2} l1.2 ${5 + (Math.abs(k) % 3) * 2} l1.2 ${-5 - (Math.abs(k) % 3) * 2}Z`;
      for (const k of [-24, -16, -7, 8, 17, 24]) ice += `M${f1(x + k - 1.4)} ${top + 5} l1.4 ${6 + (Math.abs(k) % 3) * 2} l1.4 ${-6 - (Math.abs(k) % 3) * 2}Z`;
      s += shape(ice, '#dff1fa') + `${oval(x, top - 1.6, 22, 5, SNOW)}${oval(x, bowl - 1, 12, 2.6, SNOW)}${oval(x, cap - 1, 6, 1.4, SNOW)}${dot(x, cap - 9, 2, SNOW)}`;
    }
    return s + '</g>';
  }
  // the broad cream edge of the pool, with how deep it is cut into it at each end
  const COPE_JOINTS = (() => {
    let d = '';
    for (let i = 1; i < 18; i++) { const a = P(i / 18, 0), b = P(i / 18, 1); d += seg(a, [a[0], a[1] - 6.3]) + seg(b, [b[0] - (VP[0] - b[0]) * 0.018, b[1] + 9]); }
    for (let j = 1; j < 12; j++) { const a = P(0, j / 12), b = P(1, j / 12); d += seg(a, [a[0] - 10, a[1]]) + seg(b, [b[0] + 10, b[1]]); }
    return d;
  })();
  function coping() {
    const c = K.stone, lt = U.shade(c, 0.42);
    let s = `<path d="${COPE_D} ${POOL_D}" fill="${lt}" fill-rule="evenodd"/>${line(COPE_JOINTS, U.shade(c, -0.14), 0.6, 0.8)}<path d="${POOL_D}" fill="none" stroke="${U.shade(c, -0.28)}" stroke-width="1"/><path d="${COPE_D}" fill="none" stroke="${U.shade(c, -0.2)}" stroke-width="0.8"/>`;
    s += `${text(176, 266.4, '9 FT', 4.6, K.deep, ' letter-spacing="0.6"')}${text(RIM.fr[0] - 28, 266.4, '9 FT', 4.6, K.deep, ' letter-spacing="0.6"')}${text(150, 435.6, '3 FT', 5.4, K.deep, ' letter-spacing="0.6"')}${text(292, 435.6, '3 FT', 5.4, K.deep, ' letter-spacing="0.6"')}`;
    if (winter()) s += `<path d="${COPE_D} ${POOL_D}" fill="${url('Snow')}" fill-rule="evenodd" opacity="0.72"/>`;
    return s;
  }
  // the diving board on its stepped pier, reaching out over the deep end
  function board(st) {
    const p = pend(st, 'board'), ok = st.board, c = K.cream, dk = U.shade(c, -0.2), lt = U.shade(c, 0.4), blue = K.band;
    const { a, b, w } = PLANK, tip = ok ? b : [U.lerp(a[0], b[0], 0.58), U.lerp(a[1], b[1], 0.58)];
    const q = (t, k) => [U.lerp(a[0], tip[0], t) + (w[0] * k) / 2, U.lerp(a[1], tip[1], t) + (w[1] * k) / 2];
    const wood = ok ? '#e9cf9c' : '#9a9282', edge = U.shade(wood, -0.26);
    const face = ok ? U.shade(K.band, 0.42) : '#b5b49c', side = U.shade(face, -0.2);
    const block = (x0, x1, y0, y1) => `${shape(poly([[x0, y0], [x1, y0], [x1 + 4, y0 - 6], [x0 + 4, y0 - 6]]), lt)}${box(x0, y0, x1 - x0, y1 - y0, face)}${box(x1 - 6, y0, 6, y1 - y0, side)}${box(x0, y1 - 3.6, x1 - x0, 1.6, c)}${box(x0, y1 - 1.2, x1 - x0, 1.2, K.coral)}`;
    let s = `<g data-part="board">`;
    // where the plank throws its shadow on the water or the tiles
    s += `<g clip-path="${url('Pool')}">${shape(poly([[a[0] - 30, a[1] + 34], [tip[0] - 4, tip[1] + (LEVEL === 'full' ? 22 : 30)], [tip[0] - 4, tip[1] + (LEVEL === 'full' ? 27 : 35)], [a[0] - 30, a[1] + 39]]), '#000', ' opacity="0.12"')}</g>`;
    s += `${shadow(370, 326, 26, 3)}${block(348, 388, 306, 324)}${block(354, 386, 296, 304)}${block(360, 384, 286, 294)}`;
    // the plank
    s += shape(poly([q(0, -1), q(1, -1), [q(1, -1)[0], q(1, -1)[1] + 3], [q(0, -1)[0], q(0, -1)[1] + 3]]), edge) + shape(poly([q(0, -1), q(1, -1), q(1, 1), q(0, 1)]), wood);
    s += line(seg(q(0, -0.34), q(1, -0.34)) + seg(q(0, 0.34), q(1, 0.34)), U.shade(wood, -0.14), 0.5);
    if (ok) {
      s += shape(poly([q(0.9, -1), q(1, -1), q(1, 1), q(0.9, 1)]), K.coral) + box(a[0] - 16, a[1] + 3, 7, 5, K.chrome, ' rx="1.4"');
      s += `${line('M386 300 q-1 -19 -18 -24 h-12', '#000', 2, 0.08)}${line('M386 297 q-1 -19 -18 -24 h-12', K.chrome, 1.8)}${line('M373 303 q-2 -13 -14 -17', K.chrome, 1.6)}`;
      if (p === 'grow') {
        // worn through in the middle, with a new length of board waiting beside the pier
        s += shape(poly([q(0.42, -1), q(0.62, -1), q(0.62, 1), q(0.42, 1)]), '#9a9282') + line(seg(q(0.42, -1), q(0.42, 1)) + seg(q(0.62, -1), q(0.62, 1)), '#6b5c44', 0.7);
        s += `<g transform="rotate(-12 372 340)">${box(344, 337, 42, 4, '#e9cf9c', ' rx="0.8"')}${box(344, 340.4, 42, 1.4, '#c0a26e')}</g>${box(376, 332, 9, 8, '#a6b4bd', ' rx="1"')}`;
      }
    } else {
      // the end has snapped off and the rails are gone but for a stump
      s += shape(`M${f1(tip[0] - 0.4)} ${f1(tip[1] - 3.6)} l-4 2 l3 1.6 l-4 2.2 l5 2.2Z`, wood) + line(`M386 297 q-1 -9 -6 -13`, '#8a6a52', 1.8);
      s += `<g transform="rotate(16 ${f1(tip[0] - 4)} ${f1(tip[1] + 40)})">${box(tip[0] - 22, tip[1] + 36, 34, 4, '#9a9282')}</g>${oval(364, 316, 12, 3.6, '#6f8a3e', 0.5)}${oval(374, 302, 7, 2, '#748f42', 0.5)}`;
    }
    if (winter() || p === 'snow') s += shape(poly([q(0, -0.8), q(ok ? 1 : 0.96, -0.8), q(ok ? 1 : 0.96, 0.6), q(0, 0.6)]), SNOW) + box(348, 300.6, 41, 2, SNOW, ' rx="1"') + box(354, 290.6, 33, 2, SNOW, ' rx="1"') + box(360, 280.6, 28, 2, SNOW, ' rx="1"');
    return s + '</g>';
  }

  // two globe lamps at the far corners of the pool
  const LAMPS = [[112, 226], [344, 224]];
  function lamps() {
    let s = '';
    for (const [x, y] of LAMPS) {
      const foot = x < 200 ? 263 : 277;
      s += `${shadow(x + 1.6, foot + 0.4, 4.6, 1.2)}${box(x - 2.2, foot - 3, 4.4, 3.4, K.stone, ' rx="1"')}${line(`M${x} ${foot - 2} V${y + 3}`, PCT < 0.4 ? '#7d7a72' : K.deep, 1.5)}`;
      if (PCT < 0.4) s += `${line(`M${x - 2.4} ${y + 3.4} h4.8`, '#7d7a72', 1.2)}${shape(`M${x - 2.6} ${y + 3} q0.4 -4 2.6 -3.4 l1 2 l1.6 -1 q0.4 1 0 2.4Z`, '#a8ad9e')}`;
      else s += `${box(x - 2.4, y + 2.6, 4.8, 1.6, K.deep, ' rx="0.8"')}${dot(x, y, 3.4, '#fff8e8')}${dot(x - 1, y - 1, 1, '#fff')}${winter() ? shape(`M${x - 3.6} ${y - 1.4} Q${x} ${y - 6} ${x + 3.6} ${y - 1.4} Q${x} ${y - 3} ${x - 3.6} ${y - 1.4}Z`, SNOW) : ''}`;
    }
    return s;
  }

  // ---------------------------------------------------------------- the huts
  // One hut in the row: a striped front with a door, and the side and the roof
  // running back towards the far end of the pool
  function hut(h, i, st, C, p) {
    const ok = st.huts, col = ok ? C.lidoHuts : U.mix(C.lidoHuts, '#a59e90', 0.62), cream = ok ? '#fff6e6' : '#c9c2b2', dk = U.shade(col, -0.24);
    const { x, y, w, h: ht, g } = h, xr = x + w, top = y - ht, cx = x + w / 2, sx = (VP[0] - xr) * 0.03, sy = (VP[1] - y) * 0.03;
    const roof = ok ? '#6fb1c2' : '#868f8a', roofD = U.shade(roof, -0.16), n = 7;
    const apex = [cx, top - g], el = [x - 1.6, top + 0.8], er = [xr + 1.6, top + 0.8], back = (q) => [q[0] + sx, q[1] + sy];
    let s = shape(poly([[x + 2, y], [xr + 7, y + 1], [xr + 3, y + 3.4], [x + 2, y + 3.4]]), '#000', ' opacity="0.13"');
    // the side, the far slope and the near slope of the roof
    s += shape(poly([[xr, y], [xr, top], back([xr, top]), back([xr, y])]), U.shade(col, -0.2));
    s += line(`M${f1(xr + sx * 0.5)} ${f1(top + sy * 0.5 + 2)} V${f1(y + sy * 0.5)}`, dk, 0.5, 0.6);
    s += shape(poly([el, apex, back(apex), back(el)]), roofD) + shape(poly([apex, er, back(er), back(apex)]), roof);
    s += line(seg(apex, back(apex)), U.shade(roof, 0.3), 0.8);
    // the striped front, and the gable with a little sun on it
    s += box(x, top, w, ht, col) + shape(poly([[x, top], [xr, top], apex]), cream);
    for (let j = 1; j < n; j += 2) s += box(x + (j * w) / n, top, w / n, ht, cream, ok ? '' : ' opacity="0.8"');
    s += `${box(x, y - 2.4, w, 2.4, dk)}${line(`M${f1(el[0])} ${f1(el[1])} L${f1(apex[0])} ${f1(apex[1])} L${f1(er[0])} ${f1(er[1])}`, U.shade(roof, -0.1), 1.6)}${box(x - 0.8, top - 0.6, w + 1.6, 1.6, dk)}`;
    s += shape(`M${f1(cx - g * 0.36)} ${f1(top - 0.8)} a${f1(g * 0.36)} ${f1(g * 0.36)} 0 0 1 ${f1(g * 0.72)} 0Z`, ok ? K.coral : '#a68a7c');
    const dw = w * 0.5, dh = ht * 0.82, dx = cx - dw / 2, dy = y - dh;
    const ajar = !ok && i === 2;
    s += box(dx - 1, dy - 1, dw + 2, dh + 1, ok ? cream : '#b5ae9e');
    if (ajar) s += box(dx, dy, dw, dh, '#4a443c') + shape(poly([[dx, dy], [dx + dw * 0.5, dy + 3], [dx + dw * 0.5, y + 1], [dx, y]]), dk);
    else {
      s += box(dx, dy, dw, dh, ok ? U.shade(col, -0.1) : dk);
      s += `<rect x="${f1(dx + dw * 0.16)}" y="${f1(dy + dh * 0.12)}" width="${f1(dw * 0.68)}" height="${f1(dh * 0.32)}" fill="none" stroke="${U.shade(col, -0.3)}" stroke-width="0.6"/><rect x="${f1(dx + dw * 0.16)}" y="${f1(dy + dh * 0.54)}" width="${f1(dw * 0.68)}" height="${f1(dh * 0.36)}" fill="none" stroke="${U.shade(col, -0.3)}" stroke-width="0.6"/>`;
      s += dot(dx + dw * 0.84, dy + dh * 0.5, 0.9, ok ? '#d9a93a' : '#8a8576');
      s += `${dot(cx, dy + dh * 0.28, w * 0.1, ok ? '#fffaf0' : '#c9c2b2')}${text(cx, dy + dh * 0.28 + w * 0.066, i + 1, f1(w * 0.17), ok ? K.deep : '#7d7264')}`;
    }
    s += box(x + w * 0.18, y, w * 0.64, 2.6, K.stone, ' rx="0.8"');
    if (!ok) {
      s += `${oval(x + w * 0.2, y - ht * 0.6, 3, 4.6, '#d8cfbf', 0.8)}${oval(xr - w * 0.16, y - ht * 0.3, 3.4, 2.6, '#d8cfbf', 0.75)}${oval(cx + 2, top + 2, w * 0.2, 1.6, '#d8cfbf', 0.6)}`;
      if (i % 2) s += shape(poly([[cx + 3, top - g * 0.6], [cx + 10, top - g * 0.2 - 3], back([cx + 10, top - g * 0.2 - 3]), back([cx + 3, top - g * 0.6])]), '#5a5a50', ' opacity="0.7"');
    }
    if (p === 'grow') s += box(x, top, w, ht, FADE, ' opacity="0.46"');
    if (winter() || p === 'snow') {
      const up = (q, k) => [q[0], q[1] - k];
      s += shape(poly([up(apex, 1.2), er, back(er), up(back(apex), 1.2)]), SNOW) + shape(poly([el, up(apex, 1.2), up(back(apex), 1.2), back(el)]), '#e6edf3');
    }
    return s;
  }
  function huts(st, C) {
    const p = pend(st, 'huts');
    return `<g data-part="huts">${HUTS.map((h, i) => hut(h, i, st, C, p)).join('')}</g>`;
  }

  // ------------------------------------------------------------- the terrace
  const STRIPES = [['#e5675a', '#fff6e6'], ['#3f9dbb', '#fff6e6'], ['#f2c14e', '#fff6e6']];
  // a chalk mark on the terrace, where a deck chair goes
  function chalk(x, y, n, op = 0.85) {
    const list = [[x - 25, y + 6], [x + 25, y + 6], [x + 35, y - 12], [x - 15, y - 12]];
    return `<g opacity="${op}"><path d="${poly(list)}" fill="none" stroke="#fffdf6" stroke-width="1.3" stroke-dasharray="7 2.4" stroke-linecap="round"/>${line(`M${x - 24} ${y + 8.4} q24 -1 48 0`, '#fffdf6', 0.5, 0.6)}${text(x - 17, y + 3.6, n, 6, '#fffdf6')}</g>`;
  }
  // one deck chair, seen from the side and a little above: canvas slung between two frames
  function deckChair(x, y, flip, pal, old) {
    const A = [-18, -28], M = [-2, 0], C = [17, -14], D = [10, -10], wood = old ? '#8f8574' : '#c0935a', dk = U.shade(wood, -0.26);
    const at = (q, k) => `${f1(q[0] + D[0] * k)} ${f1(q[1] + D[1] * k)}`;
    const frame = (k, col) => line(`M${at(A, k)} L${at([15, -0.6], k)} M${at(C, k)} L${at([-12, -0.6], k)} M${at([-7, -15], k)} L${at([-21, -0.6], k)}`, col, 1.7);
    const band = (k0, k1, col) => shape(`M${at(A, k0)} Q${at(M, k0)} ${at(C, k0)} L${at(C, k1)} Q${at(M, k1)} ${at(A, k1)}Z`, col);
    let s = `<g transform="translate(${x} ${y})${flip ? ' scale(-1 1)' : ''}">${shape(poly([[-22, 1], [18, 1], [27, -8], [-12, -8]]), '#000', ' opacity="0.1"')}${frame(1, dk)}`;
    for (let i = 0; i < 5; i++) s += band(i / 5, (i + 1) / 5, old ? (i % 2 ? '#c9c2b2' : U.mix(pal[0], '#a59e90', 0.66)) : pal[i % 2]);
    s += `${line(`M${at(A, 0)} L${at(A, 1)} M${at(C, 0)} L${at(C, 1)}`, wood, 2.4)}${frame(0, wood)}`;
    return s + '</g>';
  }
  // the deck chairs folded flat in a stack, for when they are in or waiting to come out
  function chairStack(x, y, leaves) {
    const n = 5, W = 50, wood = '#c0935a', dk = U.shade(wood, -0.24), dx = 13, dy = -13, t = y - n * 3.2;
    let s = shape(poly([[x - W / 2 - 3, y + 3], [x + W / 2 + 5, y + 3], [x + W / 2 + dx + 6, y + dy - 4], [x - W / 2 + dx, y + dy - 4]]), '#000', ` opacity="${winter() ? 0.2 : 0.13}"`);
    for (let i = 0; i < n; i++) s += `${box(x - W / 2, y - (i + 1) * 3.2, W, 3.2, i % 2 ? wood : dk)}${box(x - W / 2 + 4, y - (i + 1) * 3.2 + 0.7, W - 8, 1.7, STRIPES[i % 3][0])}`;
    s += shape(poly([[x + W / 2, y], [x + W / 2, t], [x + W / 2 + dx, t + dy], [x + W / 2 + dx, y + dy]]), dk);
    s += shape(poly([[x - W / 2, t], [x + W / 2, t], [x + W / 2 + dx, t + dy], [x - W / 2 + dx, t + dy]]), wood);
    for (let k = 0; k < 5; k++) {
      const a = 0.08 + k * 0.17, b = a + 0.17, q = (u, v) => [x - W / 2 + 4 + (W - 8) * u + dx * v, t + dy * v];
      s += shape(poly([q(0, a), q(1, a), q(1, b), q(0, b)]), STRIPES[0][k % 2]);
    }
    if (winter()) s += `${shape(rounded([[x - W / 2 + 1, t - 1], [x + W / 2 - 1, t - 1], [x + W / 2 + dx - 2, t + dy + 1], [x - W / 2 + dx + 2, t + dy + 1]], 4), '#fbfdff')}${line(`M${x - W / 2 + 2} ${t - 0.6} H${x + W / 2 - 2}`, '#c9d6e0', 1)}`;
    if (leaves) s += leaf(x - 8, t - 5, 20, FALL[0]) + leaf(x + 14, t - 8, -30, FALL[1]);
    return s;
  }
  function chairs(st) {
    const p = pend(st, 'chairs'), ok = st.chairs;
    // out on their marks in spring and summer; in for the autumn and the winter.
    // A waiting job shows the other way round: still stacked, or still out.
    const out = ok && ((SEASON === 'spring') || (SEASON === 'summer' && !p) || (SEASON === 'autumn' && !!p));
    const snowy = winter() && pend(st, 'terrace') === 'snow';
    let s = `<g data-part="chairs">`;
    if (!snowy) CHAIRS.forEach(([x, y], i) => { s += chalk(x, y, i + 1, !ok ? 0.42 : winter() ? 0.4 : 0.85); });
    if (!ok) {
      // the old ones in a broken heap, their canvas rotted
      s += `<g transform="rotate(-8 92 500)">${deckChair(84, 508, false, STRIPES[0], true)}</g><g transform="rotate(26 112 504)">${deckChair(116, 508, true, STRIPES[1], true)}</g>`;
      s += `${line('M64 510 L102 498 M70 516 L112 512 M122 516 L90 496', '#857a68', 2.2)}${shape('M78 508 q12 -7 24 -1 l-5 8 q-10 -4 -17 0Z', '#b0a998')}`;
    } else if (out) {
      CHAIRS.forEach(([x, y, flip, pal]) => {
        s += deckChair(x, y, flip, STRIPES[pal], false);
        if (p && SEASON === 'autumn') s += leaf(x + 3, y - 12, 20, FALL[0]) + leaf(x - 6, y - 13, -30, FALL[1]) + leaf(x + 10, y - 16, 70, FALL[2]);
      });
    } else s += chairStack(300, 490, SEASON === 'autumn');
    return s + '</g>';
  }
  // one frond of a palm: a rib with leaflets, falling away towards its tip
  function frond(x, y, a, len, col, droop = 0.46) {
    const tx = x + Math.cos(a) * len, ty = y + Math.sin(a) * len + len * droop, cx = x + Math.cos(a) * len * 0.56, cy = y + Math.sin(a) * len * 0.56 - len * 0.08;
    const w = U.clamp(len * 0.05, 1.5, 2.3);
    let d = '';
    for (let i = 1; i <= 10; i++) {
      const t = i / 11, m = 1 - t, px = m * m * x + 2 * m * t * cx + t * t * tx, py = m * m * y + 2 * m * t * cy + t * t * ty;
      const dir = Math.atan2(2 * m * (cy - y) + 2 * t * (ty - cy), 2 * m * (cx - x) + 2 * t * (tx - cx)), l = len * 0.3 * (1 - t * 0.6);
      for (const k of [-0.62, 0.62]) d += `M${f1(px)} ${f1(py)} l${f1(Math.cos(dir + k) * l)} ${f1(Math.sin(dir + k) * l + l * 0.3)}`;
    }
    return line(d, col, w) + line(`M${f1(x)} ${f1(y)} Q${f1(cx)} ${f1(cy)} ${f1(tx)} ${f1(ty)}`, U.shade(col, -0.14), w * 0.8);
  }
  // a whole head of fronds; drawn once in the defs and used by every palm in the picture
  function crown() {
    const cols = winter() ? ['#6f8f78', '#7fa088', '#5f8068'] : SEASON === 'autumn' ? ['#6f9a4a', '#8fa64a', '#a8a84a'] : ['#3f8f5f', '#4fa56d', '#2f7d54'];
    let f = '';
    for (const [a, c, l] of [[-3.1, 2, 40], [-0.05, 2, 40], [-2.7, 0, 42], [-0.45, 0, 42], [-2.25, 1, 40], [-0.9, 1, 40], [-1.85, 0, 34], [-1.3, 1, 34]]) f += frond(0, 0, a, l, cols[c]);
    return f;
  }
  // a ringed trunk, thinner towards the top, bending a little on its way up
  function trunk(x0, y0, x1, y1, bend, w0, w1) {
    const cx = (x0 + x1) / 2 + bend, cy = (y0 + y1) / 2, c = (t) => { const m = 1 - t; return [m * m * x0 + 2 * m * t * cx + t * t * x1, m * m * y0 + 2 * m * t * cy + t * t * y1]; };
    const n = 12, L = [], R = [], D = [];
    let rings = '';
    for (let i = 0; i <= n; i++) {
      const t = i / n, [x, y] = c(t), w = U.lerp(w0, w1, t);
      L.push([x - w, y]); R.unshift([x + w, y]); D.unshift([x + w * 0.2, y]);
      if (i && i < n) rings += `M${f1(x - w)} ${f1(y)} q${f1(w)} ${f1(w * 0.5)} ${f1(w * 2)} 0`;
    }
    return shape(poly(L.concat(R)), '#a58058') + shape(poly(R.concat(D.reverse())), '#8f6c48') + line(rings, '#6f5234', 1, 0.7);
  }
  // a palm in a big coral pot
  function palm(x, y, k, st, p) {
    const ok = st.palms, pot = ok ? '#df6f5a' : '#a08a76', potD = U.shade(pot, -0.2), h = 22 * k, w = 15 * k, top = y - h;
    let s = `${shadow(x + 3, y + 0.6, w * 1.3, 2.8)}${shape(`M${f1(x - w)} ${f1(top)} H${f1(x + w)} L${f1(x + w * 0.72)} ${y} H${f1(x - w * 0.72)}Z`, pot)}${shape(`M${f1(x + w * 0.4)} ${f1(top)} H${f1(x + w)} L${f1(x + w * 0.72)} ${y} H${f1(x + w * 0.3)}Z`, potD)}`;
    s += `${box(x - w * 1.14, top - 3 * k, w * 2.28, 5 * k, ok ? '#ec8772' : '#b09a86', ' rx="1.2"')}${box(x - w * 0.85, top + h * 0.44, w * 1.7, 1.8 * k, ok ? '#fff6e6' : '#c9c2b2')}${box(x - w * 0.8, top + h * 0.58, w * 1.6, 1.2 * k, ok ? '#7cc3cf' : '#a39a8a')}`;
    s += oval(x, top - 2.6 * k, w * 0.95, 2.2 * k, '#6b4e36');
    const head = top - 30 * k, cols = SEASON === 'autumn' ? ['#6f9a4a', '#8fa64a', '#a8a84a'] : ['#3f8f5f', '#4fa56d', '#2f7d54'];
    if (!ok) {
      // dead fronds hanging from a stump, and a crack down the pot
      s += `${line(`M${x} ${f1(top - 2)} V${f1(top - 15 * k)}`, '#7a6248', 4 * k)}`;
      for (const a of [-2.9, -2.2, -1, -0.3]) s += frond(x, top - 15 * k, a, 22 * k, '#9a7f54', 0.9);
      s += `${line(`M${f1(x - w * 0.3)} ${f1(top)} l3 7 l-3 6 l2 7`, '#5e4a3a', 1)}${oval(x - w * 0.9, y + 1, 4, 1.4, pot)}`;
      return s;
    }
    if (p === 'grow' && SEASON !== 'spring') {
      // young palms only just potted up
      for (const [a, c] of [[-2.5, 0], [-1.9, 1], [-1.3, 0], [-0.7, 2]]) s += frond(x, top - 2 * k, a, 17 * k, cols[c], 0.3);
      return s;
    }
    if (winter() || p === 'grow') {
      // wrapped up in fleece for the winter and tied round with twine, until the spring job
      s += `${shape(`M${f1(x - 6 * k)} ${f1(top - 2)} Q${f1(x - 12 * k)} ${f1(head)} ${x} ${f1(head - 24 * k)} Q${f1(x + 12 * k)} ${f1(head)} ${f1(x + 6 * k)} ${f1(top - 2)}Z`, '#e4dccb')}${shape(`M${x} ${f1(head - 24 * k)} Q${f1(x + 12 * k)} ${f1(head)} ${f1(x + 6 * k)} ${f1(top - 2)} H${f1(x + 2 * k)} Q${f1(x + 5 * k)} ${f1(head)} ${x} ${f1(head - 24 * k)}Z`, '#cfc6b2')}`;
      s += line(`M${f1(x - 8.5 * k)} ${f1(head + 12 * k)} q${f1(8.5 * k)} 3 ${f1(17 * k)} 0 M${f1(x - 9.6 * k)} ${f1(head)} q${f1(9.6 * k)} 3 ${f1(19.2 * k)} 0 M${f1(x - 7 * k)} ${f1(head - 11 * k)} q${f1(7 * k)} 3 ${f1(14 * k)} 0`, '#a8895c', 1);
      if (winter()) s += shape(`M${f1(x - 6 * k)} ${f1(head - 14 * k)} Q${x} ${f1(head - 30 * k)} ${f1(x + 6 * k)} ${f1(head - 14 * k)} Q${x} ${f1(head - 10 * k)} ${f1(x - 6 * k)} ${f1(head - 14 * k)}Z`, SNOW);
      return s;
    }
    s += trunk(x, top - 2 * k, x, head, 0, 3.8 * k, 2.8 * k);
    return `${s}<g class="sb-sway">${box(x - 42 * k, head - 40 * k, 84 * k, 66 * k, '#000', ' fill-opacity="0"')}<use href="#${id('Crown')}" transform="translate(${x} ${f1(head)}) scale(${k})"/></g>${dot(x, head, 3 * k, '#6f5438')}`;
  }
  function palms(st) {
    const p = pend(st, 'palms');
    return `<g data-part="palms">${POTS.map(([x, y, k]) => palm(x, y, k, st, p)).join('')}</g>`;
  }
  // bits of rubbish, and the bin they should have gone in
  const can = (x, y, rot, col) => `<g transform="rotate(${rot} ${x} ${y})">${box(x - 4, y - 1.8, 8, 3.6, col, ' rx="0.8"')}${oval(x + 4, y, 0.9, 1.8, '#d3d7da')}${box(x - 4, y - 1.8, 8, 1, '#fff', ' opacity="0.3"')}</g>`;
  const packet = (x, y, rot, col) => `<g transform="rotate(${rot} ${x} ${y})">${shape(`M${x - 5} ${y - 3} l10 -1 l1 6 l-11 1Z`, col)}${line(`M${x - 5} ${y - 3} l10 -1 M${x - 4} ${y + 3} l11 -1`, '#fff', 0.8, 0.7)}${dot(x, y, 1.2, '#fff', 0.8)}</g>`;
  const cup = (x, y, rot) => `<g transform="rotate(${rot} ${x} ${y})">${shape(`M${x - 4} ${y - 2} L${x + 4} ${y - 3} V${y + 3} L${x - 4} ${y + 2}Z`, '#fbf7ee')}${box(x - 2, y - 2.4, 2, 5, '#e5675a')}${oval(x + 4, y, 1, 3, '#d9d2c4')}</g>`;
  const paper = (x, y, rot) => `<g transform="rotate(${rot} ${x} ${y})">${shape(`M${x - 5} ${y - 3} l4 1 l6 -2 l1 6 l-6 2 l-5 -2Z`, '#efe8d8')}${line(`M${x - 3} ${y - 0.6} l6 -1 M${x - 2} ${y + 1.6} l5 -1`, '#b5ab9c', 0.5)}</g>`;
  function litter(st) {
    const p = pend(st, 'litter'), ok = st.litter;
    let s = '<g data-part="litter">';
    const x = 146, y = 264, c = ok ? K.cream : '#a59e8c', dk = U.shade(c, -0.2);
    if (ok) {
      // a smart deco bin at the corner of the pool
      s += `${shadow(x + 2, y + 0.8, 11, 2)}${box(x - 8, y - 22, 16, 22, c, ' rx="2"')}${box(x + 3, y - 22, 5, 22, dk, ' rx="2"')}${box(x - 8, y - 13, 16, 2, K.band)}${box(x - 8, y - 9.6, 16, 1, K.coral)}${box(x - 9.6, y - 25, 19.2, 4, K.band, ' rx="2"')}${oval(x, y - 25, 9.4, 2.4, U.shade(K.band, 0.2))}`;
      if (winter()) s += oval(x, y - 26.4, 9, 2.4, SNOW);
    } else {
      s += `<g transform="rotate(74 ${x} ${y - 4})">${shadow(x, y + 7, 11, 2)}${box(x - 8, y - 22, 16, 22, c, ' rx="2"')}${box(x - 8, y - 13, 16, 2, '#8f9a8c')}${oval(x, y - 22, 8, 2, '#4a443c')}</g><g transform="rotate(30 ${x + 22} ${y - 2})">${oval(x + 22, y - 2, 9.4, 2.6, '#8f9a8c')}</g>`;
    }
    const few = [[118, 446, 0], [206, 448, 1], [262, 458, 2], [146, 462, 3], [356, 352, 4], [170, 262, 2]];
    const lot = few.concat([[304, 450, 0], [176, 444, 3], [232, 464, 1], [84, 450, 2], [354, 300, 3], [360, 380, 1], [288, 264, 2], [122, 262, 4], [100, 462, 1], [302, 472, 3], [226, 438, 4], [160, 266, 0], [358, 416, 3]]);
    const list = ok ? (p ? few : []) : lot;
    list.forEach(([a, b, k], i) => { s += [can(a, b, (i * 53) % 90, '#c9474f'), packet(a, b, (i * 37) % 60 - 30, '#3f9dbb'), cup(a, b, (i * 71) % 180), paper(a, b, (i * 29) % 90), packet(a, b, (i * 19) % 60, '#f2c14e')][k]; });
    if (!ok && LEVEL === 'murky') {
      // a rusty trolley on its side in the deep end
      const [tx, ty] = F(0.72, 0.2);
      s += `<g transform="rotate(-14 ${f1(tx)} ${f1(ty)})" fill="none" stroke="#7a6248" stroke-width="1"><path d="M${f1(tx - 18)} ${f1(ty - 12)} h34 l-5 18 h-24Z M${f1(tx - 12)} ${f1(ty - 12)} l3 18 M${f1(tx - 4)} ${f1(ty - 12)} l1 18 M${f1(tx + 5)} ${f1(ty - 12)} l-1 18 M${f1(tx - 16)} ${f1(ty - 5)} h29 M${f1(tx - 14)} ${f1(ty + 1)} h25"/><path d="M${f1(tx + 16)} ${f1(ty - 12)} l7 -5" stroke-width="1.6"/></g>${dot(tx - 8, ty + 11, 2, '#4a443c')}${dot(tx + 6, ty + 8, 2, '#4a443c')}`;
    }
    return s + '</g>';
  }
  function saleSign() {
    if (!(FORSALE || PCT < 0.15)) return '';
    return `<g transform="translate(-92 26)"><rect x="338.5" y="484" width="3" height="26" fill="#8a6142"/><g transform="rotate(4 340 480)">
      <rect x="316" y="470" width="48" height="21" rx="2" fill="#f6efe0" stroke="#7d6e58" stroke-width="1.2"/>
      <text x="340" y="483.6" text-anchor="middle" font-family="${FONT}" font-size="8.4" font-weight="900" fill="#3d5a86">FOR SALE</text>
      ${FORSALE ? '' : `<g transform="rotate(-10 340 488)"><rect x="313" y="484" width="54" height="10" fill="#d9534f"/><text x="340" y="492" text-anchor="middle" font-family="${FONT}" font-size="8" font-weight="900" fill="#fff">SOLD</text></g>`}</g></g>`;
  }

  // ------------------------------------------------------------ decorations
  // Bought in the shed; each one is a small drawing at a fixed spot.
  // fairy lights swung from post to post along the terrace
  const LIGHT_POSTS = [[52, 452], [150, 452], [250, 452], [348, 452]];
  const BULBS = (() => {
    const out = [];
    LIGHT_POSTS.slice(0, -1).forEach(([x], i) => {
      const x1 = LIGHT_POSTS[i + 1][0];
      for (let k = 0; k < 8; k++) { const t = k / 8; out.push([U.lerp(x, x1, t), 404 + 15 * 4 * t * (1 - t)]); }
    });
    return out;
  })();
  const BULB_COLS = ['#ffe08a', '#ffb3c1', '#b3e5ff', '#c8f2b0'];
  const WARM = ['#ffe9b0', '#ffd98a', '#fff3c4', '#ffe2a0'];
  // one striped parasol: open, or furled up for the winter
  function parasol(x, y, h, col) {
    let s = `${shadow(x + 4, y + 0.6, 7, 1.6)}${line(`M${x} ${y} V${y - h}`, '#c9b78e', 2)}${oval(x, y, 4.4, 1.6, '#8a7a62')}`;
    if (winter()) return `${s}${shape(`M${x - 4} ${y - h + 24} Q${x - 4.6} ${y - h + 8} ${x} ${y - h - 5} Q${x + 4.6} ${y - h + 8} ${x + 4} ${y - h + 24}Z`, col)}${line(`M${x - 4} ${y - h + 18} q4 2 8 0`, '#fff6e6', 1)}${dot(x, y - h - 6, 1.6, SNOW)}`;
    const R = 30, t = y - h, top = t - 11;
    for (let i = 0; i < 8; i++) {
      const a0 = -R + (i * R * 2) / 8, a1 = a0 + (R * 2) / 8, sag = (a) => 3 - (a * a) / 110;
      s += shape(`M${x} ${top} Q${f1(x + a0 * 0.62)} ${f1(t - 9)} ${f1(x + a0)} ${f1(t + sag(a0))} Q${f1(x + (a0 + a1) / 2)} ${f1(t + sag((a0 + a1) / 2) + 3.4)} ${f1(x + a1)} ${f1(t + sag(a1))} Q${f1(x + a1 * 0.62)} ${f1(t - 9)} ${x} ${top}Z`, i % 2 ? '#fff6e6' : col);
    }
    return s + dot(x, top - 1, 1.4, '#d9a93a');
  }
  const DECOR = {
    // bunting swung across the far end of the pool between the two lamps
    'sb-bunting': () => {
      const P0 = [112, 234], P1 = [344, 232], sag = 41, at = (t) => [U.lerp(P0[0], P1[0], t), U.lerp(P0[1], P1[1], t) + sag * 4 * t * (1 - t)];
      let s = line(`M${P0[0]} ${P0[1]} Q${(P0[0] + P1[0]) / 2} ${(P0[1] + P1[1]) / 2 + sag * 2} ${P1[0]} ${P1[1]}`, '#7a6a52', 0.8);
      const cols = ['#e5675a', '#fff6e6', '#3f9dbb', '#f2c14e', '#7cc3cf', '#efb4ae'];
      for (let i = 1; i < 16; i++) { const [x, y] = at(i / 16); s += `<path class="sb-flag" d="M${f1(x - 4.2)} ${f1(y)} H${f1(x + 4.2)} L${f1(x)} ${f1(y + 9.6)}Z" fill="${cols[i % 6]}"/>`; }
      return `<g>${s}</g>`;
    },
    // a flamingo float: on the water when there is any, otherwise left lying in the pool
    'sb-flamingo': () => {
      const wet = LEVEL === 'full' || LEVEL === 'low', x = LEVEL === 'low' ? 300 : 296, y = LEVEL === 'full' ? 350 : LEVEL === 'low' ? 324 : 358;
      const k = LEVEL === 'low' ? 0.82 : 0.92;
      const bird = `${wet ? oval(0, 3, 23, 7, '#0a6f80', 0.2) : oval(1, 4, 22, 5.6, '#000', 0.14)}${oval(0, 0, 21, 8.4, '#ef8aa3')}${oval(0, -1.4, 20, 7, '#f7a8b8')}${oval(-1, -1, 10, 3.4, wet ? '#47c6cf' : U.shade(TILE[LEVEL].floor0, -0.1))}${shape('M-19 -2 l-8 -5 l2 8 l6 2Z', '#ef8aa3')}
        ${line('M13 -3 q9 -7 4 -15 q-4 -6 -11 -4', '#f7a8b8', 4.6)}${dot(6, -22, 3.4, '#f7a8b8')}${shape('M3.4 -23 q-5 0 -6 5 q4 -1 7 -2Z', '#fff6e6')}${shape('M-1.6 -20.6 q-1 1.6 -1 2.6 q3 -0.6 3.2 -1Z', '#2f2a2a')}${dot(6.6, -23, 0.8, '#2f2a2a')}`;
      if (wet) return `<g transform="translate(${x} ${y}) scale(${k})"><g class="sb-bob">${bird}</g></g>`;
      return `<g transform="translate(${x} ${y}) scale(${k}) rotate(-6)">${bird}${winter() ? oval(-1, -3, 16, 4, SNOW) + dot(6, -25, 2, SNOW) : ''}</g>`;
    },
    // a rail of towels by the huts, in the colours of the rainbow
    'sb-towels': () => {
      const x = 54, y = 467, cols = ['#e5675a', '#ef9a4c', '#f2c14e', '#5fae6e', '#3f9dbb', '#a98bd9'];
      let s = `${shadow(x + 24, y + 1, 30, 2)}${line(`M${x} ${y} V${y - 34} M${x + 48} ${y} V${y - 34}`, '#b98a54', 2.4)}${line(`M${x - 4} ${y} h8 M${x + 44} ${y} h8`, '#8a6240', 2)}${line(`M${x} ${y - 33} H${x + 48}`, '#c89b62', 2.2)}`;
      cols.forEach((c, i) => {
        const a = x + 2.6 + i * 7.3, h = 20 + (i % 2) * 3;
        s += `${box(a, y - 33, 6.8, h, c, ' rx="0.8"')}${box(a, y - 33 + h - 5, 6.8, 1.2, '#fff', ' opacity="0.7"')}${box(a, y - 33 + h - 3, 6.8, 0.8, '#fff', ' opacity="0.6"')}${box(a + 4.6, y - 33, 2.2, h, '#000', ' opacity="0.08"')}`;
      });
      return `<g>${s}${winter() ? box(x - 1, y - 35.6, 50, 2.2, SNOW, ' rx="1.1"') : ''}</g>`;
    },
    // two striped parasols, furled in winter
    'sb-parasols': () => `<g>${parasol(146, 490, 60, '#e5675a')}${parasol(310, 500, 60, '#3f9dbb')}</g>`,
    // a cat curled up on a deck chair of its own
    'sb-cat': () => {
      const x = 292, y = 529, fur = '#e8a35c', dk = U.shade(fur, -0.2);
      return `<g>${deckChair(x, y, false, STRIPES[1], false)}<g transform="translate(${x + 3} ${y - 12})"><g class="sb-breathe">${oval(0, -2.6, 12, 6.6, fur)}${line('M-8 -5 q3 2 3 6 M-2 -8 q3 2 3 7 M4 -8 q2 2 2 6', dk, 1.1, 0.7)}${line('M-10 -1 q9 7 21 1', fur, 2.8)}${dot(9.6, -5.8, 4.4, fur)}${shape('M6.2 -8.8 l-0.4 -4 l3.4 2.2Z M10.4 -9.8 l2.6 -3 l1 3.8Z', fur)}${line('M8 -5.4 q1.4 1 2.8 0 M11.4 -5.8 q1 0.8 2 0', '#6b4a32', 0.7)}${winter() ? `${shape('M-12 -3 Q-9 -10 1 -9.6 Q7 -9 5 -1 Q-4 1 -12 -3Z', '#e5675a')}${line('M-9 -7 L3 0 M-3 -9 L5 -3', '#fff6e6', 1.1)}` : ''}</g></g></g>`;
    },
    // a tall palm behind the wall, drawn before the huts
    'sb-palm': () => {
      const x0 = 64, y0 = 252, x1 = 42, y1 = 118;
      const s = trunk(x0, y0, x1, y1, 26, 7, 3.8);
      let f = `<use href="#${id('Crown')}" transform="translate(${x1} ${y1}) scale(1.5)"/>`;
      if (winter()) f += `${line(`M${x1 - 44} ${y1 + 6} Q${x1 - 22} ${y1 - 18} ${x1} ${y1} Q${x1 + 22} ${y1 - 18} ${x1 + 44} ${y1 + 6}`, SNOW, 2.4, 0.9)}`;
      return `<g>${s}<g class="sb-sway">${f}</g>${dot(x1, y1, 3.6, '#6f5438')}</g>`;
    },
    // a sundial on a stone pedestal
    'sb-sundial': () => {
      const x = 78, y = 532;
      return `<g>${shadow(x + 4, y + 0.8, 15, 2.4)}${box(x - 13, y - 4, 26, 4.6, K.stone, ' rx="1"')}${box(x - 10, y - 8, 20, 4.4, U.shade(K.stone, 0.2), ' rx="1"')}${shape(`M${x - 6} ${y - 8} L${x - 4} ${y - 26} H${x + 4} L${x + 6} ${y - 8}Z`, K.stone)}${shape(`M${x + 1} ${y - 8} L${x + 1} ${y - 26} H${x + 4} L${x + 6} ${y - 8}Z`, U.shade(K.stone, -0.16))}${oval(x, y - 28, 15, 5.4, U.shade(K.stone, -0.2))}${oval(x, y - 29.4, 15, 5.4, U.shade(K.stone, 0.35))}${oval(x, y - 29.4, 12, 4, '#d9b35c', 0.9)}${shape(`M${x - 7} ${y - 29} L${x + 3} ${y - 29} L${x + 3} ${y - 37}Z`, '#8a6a32')}${line(`M${x} ${y - 33} L${x} ${y - 25.6} M${x - 11.6} ${y - 29.4} H${x + 11.6} M${x - 8} ${y - 32} L${x + 8} ${y - 27} M${x + 8} ${y - 32} L${x - 8} ${y - 27}`, '#8a6a32', 0.5, 0.7)}${winter() ? oval(x, y - 31, 13, 3.6, SNOW) : ''}</g>`;
    },
    // a lifeguard's chair on the far side of the pool, with a ring on it
    'sb-lifeguard': () => {
      const x = 370, y = 382, c = '#fbf6ea', dk = '#cfc4ac';
      return `<g>${shadow(x, y + 1, 18, 2.6)}${line(`M${x - 13} ${y} L${x - 7} ${y - 40} M${x + 13} ${y} L${x + 7} ${y - 40} M${x + 7} ${y - 8} L${x + 15} ${y - 2}`, dk, 2.6)}${line(`M${x - 12} ${y - 10} H${x + 12} M${x - 10.6} ${y - 20} H${x + 10.6} M${x - 9} ${y - 30} H${x + 9}`, c, 2)}${box(x - 11, y - 43, 22, 4, c, ' rx="1"')}${box(x - 10, y - 62, 20, 19, c, ' rx="2"')}${box(x - 10, y - 56, 20, 5, '#e5675a')}${line(`M${x - 12} ${y - 43} V${y - 52} H${x - 8} M${x + 12} ${y - 43} V${y - 52} H${x + 8}`, dk, 1.6)}<circle cx="${x}" cy="${y - 17}" r="6.6" fill="none" stroke="#e5675a" stroke-width="3.2"/><circle cx="${x}" cy="${y - 17}" r="6.6" fill="none" stroke="#fff" stroke-width="3.2" stroke-dasharray="4 6.4"/>${winter() ? box(x - 11, y - 64, 22, 2.6, SNOW, ' rx="1.2"') : ''}</g>`;
    },
    // fairy lights along the terrace
    'sb-lights': () => `<g>${LIGHT_POSTS.map(([x, y]) => `${shadow(x + 2, y + 0.4, 4, 1.2)}${line(`M${x} ${y} V402`, '#8a7a62', 1.8)}${dot(x, 401, 1.6, '#6b5c44')}`).join('')}${line(LIGHT_POSTS.slice(0, -1).map(([x], i) => `M${x} 404 Q${(x + LIGHT_POSTS[i + 1][0]) / 2} 434 ${LIGHT_POSTS[i + 1][0]} 404`).join(''), '#6b5c44', 0.7)}${BULBS.map(([x, y], i) => `<circle class="bulb" cx="${f1(x)}" cy="${f1(y + 1.6)}" r="1.5" fill="${BULB_COLS[i % 4]}"/>`).join('')}</g>`,
    // little brass lamps round the basin of the fountain, shining at night
    'sb-fountainlight': () => {
      let s = '';
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.3; s += `${dot(FO.x + Math.cos(a) * 28, FO.top + Math.sin(a) * 8.2, 1.5, '#b5862c')}${dot(FO.x + Math.cos(a) * 28, FO.top + Math.sin(a) * 8.2 - 0.3, 0.8, '#ffe9a8')}`; }
      return `<g>${s}</g>`;
    },
    // a fan of a shell laid in small tiles on the wall by the kiosk
    'sb-shells': () => {
      const x = 135, y = 237, rings = [[8, '#efb4ae', '#fff6e6'], [14, '#e5675a', '#ef9a8a'], [20, '#7cc3cf', '#fff6e6'], [25, '#2f8fae', '#e5675a']];
      let s = `${shape(`M${x - 27} ${y} A27 27 0 0 1 ${x + 27} ${y}Z`, '#fff6e6')}`;
      for (const [R, a, b] of rings.slice().reverse()) for (let i = 0; i < 9; i++) {
        const a0 = Math.PI + (i / 9) * Math.PI + 0.02, a1 = Math.PI + ((i + 1) / 9) * Math.PI - 0.02;
        s += shape(`M${x} ${y} L${f1(x + Math.cos(a0) * R)} ${f1(y + Math.sin(a0) * R)} A${R} ${R} 0 0 1 ${f1(x + Math.cos(a1) * R)} ${f1(y + Math.sin(a1) * R)}Z`, i % 2 ? b : a);
      }
      return `<g>${s}${shape(`M${x - 6} ${y} q6 -7 12 0Z`, '#f2c14e')}${box(x - 27, y, 54, 1.8, '#c9a06a', ' rx="0.8"')}</g>`;
    },
    // a jukebox by the kiosk, its coloured tubes coming and going
    'sb-jukebox': () => {
      const x = 323, y = 263, w = 11;
      let s = `${shadow(x, y + 0.6, 13, 1.8)}${shape(`M${x - w} ${y} V${y - 24} A${w} ${w} 0 0 1 ${x + w} ${y - 24} V${y}Z`, '#c9474f')}${shape(`M${x - 8} ${y - 21} V${y - 24} A8 8 0 0 1 ${x + 8} ${y - 24} V${y - 21}Z`, '#fff3c4')}`;
      s += `<g class="sb-tube">${line(`M${x - w + 1.2} ${y - 2} V${y - 24} A${w - 1.2} ${w - 1.2} 0 0 1 ${x + w - 1.2} ${y - 24} V${y - 2}`, '#f2c14e', 1.2)}</g>`;
      for (const [k, c] of [[-5, '#e5675a'], [0, '#7cc3cf'], [5, '#5fae6e']]) s += `<rect class="sb-tube" x="${x + k - 1.8}" y="${y - 20}" width="3.6" height="8" rx="1" fill="${c}"/>`;
      s += `${box(x - 8, y - 10.6, 16, 9, '#7a2f36', ' rx="1"')}${line(`M${x - 6} ${y - 8} h12 M${x - 6} ${y - 6} h12 M${x - 6} ${y - 4} h12`, '#d9a93a', 0.6)}${line(`M${x - 3} ${y - 28} q3 -5 6 0`, '#c9474f', 1.6)}`;
      return `<g>${s}${winter() ? shape(`M${x - 10} ${y - 30} A${w} ${w} 0 0 1 ${x + 10} ${y - 30} Q${x} ${y - 32} ${x - 10} ${y - 30}Z`, SNOW) : ''}</g>`;
    },
  };
  function decorations(owned) {
    let s = '';
    for (const k of Object.keys(DECOR)) if (owned[k] && k !== 'sb-palm') s += DECOR[k]();
    return s;
  }

  function life(st) {
    let s = '';
    if (PCT > 0.3) s += '<g class="bird"><path d="M126 96 q4 -4 8 0 q4 -4 8 0 M152 108 q3 -3 6 0 q3 -3 6 0" stroke="#4a4a50" stroke-width="1.5" fill="none"/></g>';
    // a beach ball out on the water; a sparrow on the wall; a robin on the coping in the cold
    if (PCT > 0.6 && LEVEL === 'full') s += `<g pointer-events="none" transform="translate(156 372)"><g class="sb-bob">${oval(0, 6.4, 8, 2, '#0a6f80', 0.22)}${dot(0, 0, 7, '#fff6e6')}${shape('M0 0 Q-7 -4 -3 -6.4 Q1 -6 0 0Z M0 0 Q7 -3 6 2 Q3 4 0 0Z M0 0 Q-3 7 -6 2.6 Q-6 0 0 0Z', '#e5675a')}${shape('M0 0 Q2 -7 6 -3.6 Q5 -1 0 0Z M0 0 Q4 6 -1 6.8 Q-3 5 0 0Z', '#3f9dbb')}${dot(-2.4, -3, 1.2, '#fff', 0.8)}</g></g>`;
    if (PCT > 0.6 && !winter()) s += `<g class="sb-hop">${oval(78, 223, 4.2, 2.8, '#8a6a52')}${dot(81.2, 220.6, 2, '#7a5a42')}${dot(81.8, 220.2, 0.5, '#222')}<path d="M83 220.8 l1.6 0.4 l-1.6 0.4Z" fill="#c9a06a"/>${line('M77 226 v1.6 M79 226 v1.6', '#6b4a32', 0.5)}</g>`;
    if (winter() && PCT > 0.5) s += `<g class="sb-hop">${oval(236, 435, 4.2, 3, '#8a6a52')}${oval(238.4, 435.8, 2.4, 2, '#d9603c')}${dot(239.4, 432.8, 2, '#8a6a52')}${dot(240, 432.4, 0.5, '#222')}<path d="M241.2 432.8 l1.8 0.5 l-1.8 0.4Z" fill="#3a3a3a"/>${line('M235 438 v1.6 M237 438 v1.6', '#6b4a32', 0.5)}</g>`;
    return s;
  }
  // a little life of its own when nothing is left to do this season: a duck
  // gliding on the water, or a gull on the diving board nodding at the cold
  function rest(st) {
    if (LEVEL === 'full' || LEVEL === 'low') {
      const x = 152, y = LEVEL === 'full' ? 344 : 326, c = SEASON === 'autumn' ? '#9a7a56' : '#f4efe2';
      return `<g class="rest"><g class="rest-glide"><g pointer-events="none">${oval(x, y + 3.4, 15, 2.6, '#0a6f80', 0.2)}${shape(`M${x - 12} ${y - 2} q2 7 12 7 q12 0 12 -6 q-5 2 -8 -1 q-8 -4 -16 0Z`, c)}${shape(`M${x - 13} ${y - 3} l4 -1 l-1 4Z`, c)}${line(`M${x - 6} ${y} q6 3 12 0`, U.shade(c, -0.16), 0.9)}${dot(x + 8, y - 7, 3.8, SEASON === 'autumn' ? '#3f7a58' : c)}${shape(`M${x + 11} ${y - 8.4} l4.4 1 l-4.4 1.4Z`, '#e9a23c')}${dot(x + 9, y - 8, 0.7, '#2f2a2a')}</g></g></g>`;
    }
    const q = st.board ? [PLANK.b[0] + 9, PLANK.b[1] - 4] : [U.lerp(PLANK.a[0], PLANK.b[0], 0.5), U.lerp(PLANK.a[1], PLANK.b[1], 0.5) - 4];
    const [x, y] = q;
    return `<g class="rest"><g pointer-events="none">${line(`M${x - 1} ${y} v-4 M${x + 2} ${y} v-4`, '#e9a23c', 1)}${shape(`M${x - 9} ${y - 7} Q${x - 1} ${y - 13} ${x + 6} ${y - 9} Q${x + 7} ${y - 4} ${x + 1} ${y - 3.6} Q${x - 5} ${y - 3.6} ${x - 9} ${y - 7}Z`, '#fbfbf6')}${shape(`M${x - 12} ${y - 6.4} Q${x - 4} ${y - 12} ${x + 2} ${y - 9.4} Q${x - 2} ${y - 5.6} ${x - 12} ${y - 6.4}Z`, '#a9b4bb')}<g class="sb-nod">${dot(x + 6, y - 12, 3.4, '#fbfbf6')}${shape(`M${x + 9} ${y - 12.6} l4.6 1 l-4.6 1.2Z`, '#e9b23c')}${dot(x + 7, y - 13, 0.7, '#2f2a2a')}</g></g></g>`;
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

  // evening: darken everything except the kiosk and the rooms upstairs; in
  // summer the pool keeps a faint turquoise glow of its own
  function night(st, decor) {
    const shop = st.windows && !PEND.windows, rooms = PCT > 0.6, full = LEVEL === 'full', gateLamp = st.gate;
    const { y0, y1 } = SHOP, R = RIBBON;
    let holes = '';
    if (shop) holes += PANES.map(([a, b]) => `<rect x="${a}" y="${y0}" width="${b - a}" height="${y1 - y0}"/>`).join('');
    if (rooms) holes += `<rect x="${R.x0}" y="${R.y0}" width="${R.x1 - R.x0}" height="${R.y1 - R.y0}" rx="3"/>`;
    const all = `y="-4" width="400" height="548"`;
    let s = `<mask id="${id('Dark')}"><rect ${all} fill="#fff"/>${full ? `<path d="${POOL_D}" fill="#a0a0a0"/>` : ''}<g fill="#000">${holes}</g></mask>
      <rect ${all} fill="#1b2350" opacity="0.55" style="mix-blend-mode:multiply" mask="url(#${id('Dark')})"/>
      <rect ${all} fill="#24306a" opacity="0.18" mask="url(#${id('Dark')})"/>`;
    for (let i = 0; i < 32; i++) s += `<circle class="star" cx="${(i * 97) % 400}" cy="${6 + ((i * 53) % 109)}" r="${f1(0.6 + (i % 3) * 0.4)}" fill="#fff" style="animation-delay:-${((i * 0.7) % 4).toFixed(1)}s"/>`;
    s += `<mask id="${id('Moon')}"><rect width="400" height="200" fill="#fff"/><circle cx="353" cy="58" r="14" fill="#000"/></mask><circle cx="346" cy="64" r="16" fill="#fff6d8" mask="url(#${id('Moon')})"/><circle cx="346" cy="64" r="30" fill="#fff6d8" opacity="0.08"/>`;
    const glow = (x, y, rx, ry = rx, g = 'Glow') => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${ry}" fill="${url(g)}"/>`;
    if (full) s += `${shape(POOL_D, url('PoolGlow'))}<g opacity="0.5">${glow(218, 348, 170, 96, 'FountGlow')}</g>`;
    if (rooms) s += `${box(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0, '#ffe2a0', ' opacity="0.4" rx="3"')}${glow(218, 178, 76, 24)}`;
    if (shop) s += `${PANES.map(([a, b]) => box(a, y0, b - a, y1 - y0, '#ffd98a', ' opacity="0.34"')).join('')}${glow(218, 222, 86, 38)}${glow(218, 256, 100, 11)}`;
    if (gateLamp) s += `${dot(359, 199.6, 2.4, '#ffe9b0')}${glow(359, 202, 26, 24)}`;
    if (PCT >= 0.4) for (const [x, y] of LAMPS) s += `${dot(x, y, 3.2, '#fff3c4')}${glow(x, y, 20)}${glow(x, y + 30, 26, 5)}`;
    if (decor['sb-fountainlight']) {
      s += glow(FO.x, FO.top - 16, 66, 56, 'FountGlow') + glow(FO.x, FO.top + 2, 50, 18, 'FountGlow');
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.3; s += dot(FO.x + Math.cos(a) * 28, FO.top + Math.sin(a) * 8.2 - 0.3, 1.5, '#fff3c4'); }
    }
    if (decor['sb-jukebox']) s += `${box(315, 240, 16, 8, '#ffefb0', ' opacity="0.7" rx="1"')}${glow(323, 247, 24, 22)}`;
    if (decor['sb-lights']) s += BULBS.map(([x, y], i) => `<circle cx="${f1(x)}" cy="${f1(y + 1.6)}" r="1.9" fill="${WARM[i % 4]}"/><circle cx="${f1(x)}" cy="${f1(y + 1.6)}" r="7" fill="${url('Glow')}"/>`).join('');
    return `<g class="night" pointer-events="none">${s}</g>`;
  }

  const SPOTS = {
    tiles: [214, 348], terrace: [200, 500], fountain: [224, 296], huts: [50, 372], gate: [359, 226], sign: [218, 140], kiosk: [218, 238], windows: [218, 220], board: [320, 290], steps: [112, 408],
    mosaic: [262, 392], palms: [356, 462], litter: [206, 446], chairs: [172, 472], ices: [298, 236],
  };
  const PARTS = ['tiles', 'terrace', 'fountain', 'huts', 'gate', 'sign', 'kiosk', 'windows', 'board', 'steps', 'mosaic', 'palms', 'litter', 'chairs', 'ices'];
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

  // st: map of restored part -> true; cols: chosen paint colours (lidoHuts,
  // lidoGate, lidoSign); opts as for CURIO.render, plus resting
  function render(st = {}, cols = {}, opts = {}) {
    SEASON = SKY[opts.season] ? opts.season : 'spring'; PEND = opts.pending || {}; UID = opts.uid ? String(opts.uid).replace(/[^\w-]/g, '') : ''; FORSALE = !!opts.forSale;
    PCT = U.clamp(opts.pct || 0, 0, 1); NIGHT = !!opts.night; LEVEL = waterLevel(st); STAMP = `${SEASON.slice(0, 2)}${LEVEL[0]}${Math.round(PCT * 8)}`;
    const decor = opts.decor || {};
    palette({ lidoHuts: cols.lidoHuts || '#efb4ae', lidoGate: cols.lidoGate || '#a6d3d4', lidoSign: cols.lidoSign || '#c9474f' });
    const C = K.C;
    return `<svg viewBox="0 0 ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" class="house lido">
      ${style()}${defs()}${sky()}${far()}${boundary()}${decor['sb-palm'] ? DECOR['sb-palm']() : ''}${building()}${sign(st, C)}${shopfront()}${windows(st)}${kiosk(st)}${gate(st, C)}
      ${ground()}${terrace(st)}${tiles(st)}${mosaic(st)}${steps(st)}${poolOver(st)}${fountainFoot()}${water(st)}${coping()}${stepRails(st)}${fountain(st)}${board(st)}
      ${lamps()}${ices(st)}${huts(st, C)}${litter(st)}${chairs(st)}${palms(st)}${saleSign()}
      ${decorations(decor)}${life(st)}${opts.resting ? rest(st) : ''}${weather()}${opts.night ? night(st, decor) : ''}${sparkles(opts.fresh)}
    </svg>`;
  }

  return { render, DECOR, PARTS };
})();
