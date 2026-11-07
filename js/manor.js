'use strict';
// Wisteria Manor, drawn as SVG the same way as the cottage (house.js), the lido
// and the observatory, and seen as an old estate engraving sees a great house:
// from the iron gate at the foot of the hill and a little above, so the grounds
// lie open like a map. At the top the long stone front under its slate roofs,
// with the clock tower over the door and wisteria trained along the stone. Below
// it the terrace and the fountain in its ring of gravel, the maze on the left,
// the walled kitchen garden and the orchard on the right, the great lawn with
// its topiary rolling down to the lake and the boathouse, and the drive sweeping
// round them to the gate. The rooms show through the windows: the ballroom and
// its chandelier on the left, the library on the right, the portraits upstairs
// and the study in its bay. Each restorable part has a tired look and a restored
// look; the door, the gate and the boathouse take the colours chosen while
// painting. In the evening all the tall windows and the clock tower glow.
// Every id carries an 'm' prefix (plus opts.uid when given) so this picture can
// share a page with the others.

const MANOR = (() => {
  const VB = { w: 400, h: 540 };
  const FONT = "ui-rounded,'SF Pro Rounded',system-ui,sans-serif";

  // set at the start of every render: the season, which parts have a seasonal
  // job waiting (part -> 'grow' | 'leaves' | 'snow' | 'frost'), the id suffix,
  // whether the manor is still for sale, how far along it is and the colours
  // worked out from all that
  let SEASON = 'spring', PEND = {}, UID = '', FORSALE = false, PCT = 0, K = {}, NIGHT = false, STAMP = '', OWNED = {};
  // what the defs hold changes with the season, so their ids do too
  const id = (n) => `m${n}${UID}${STAMP}`;
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
  // many small marks of one colour as a single path, which keeps the picture
  // small: specks are round-capped strokes of one size, ovals are pairs of arcs
  const specks = (list, col, size, op = 1) => (list.length ? `<path d="${list.map(([x, y]) => `M${f1(x)} ${f1(y)}h.01`).join('')}" stroke="${col}" stroke-width="${size}" stroke-linecap="round"${op < 1 ? ` opacity="${op}"` : ''}/>` : '');
  const ovals = (list, col, op = 1) => (list.length ? `<path d="${list.map(([x, y, rx, ry = rx]) => `M${f1(x - rx)} ${f1(y)}a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(rx * 2)} 0a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(-rx * 2)} 0`).join('')}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>` : '');
  // the ground rises to the house, so what stands further up is drawn smaller
  const scaleAt = (y) => (y - 40) / 480;
  // a curve through the given points, sampled into short straight pieces
  function curve(pts, n = 8) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[Math.max(i - 1, 0)], b = pts[i], c = pts[i + 1], d = pts[Math.min(i + 2, pts.length - 1)];
      for (let j = 0; j < n; j++) {
        const t = j / n, t2 = t * t, t3 = t2 * t;
        out.push(b.map((_, k) => 0.5 * (2 * b[k] + (c[k] - a[k]) * t + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * t2 + (3 * b[k] - a[k] - 3 * c[k] + d[k]) * t3)));
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  // how far a row at v (0 far, 1 near) lies along a strip that widens by w towards us
  const persp = (v, w) => { const z = w + (1 - w) * v; return (1 / z - 1 / w) / (1 - 1 / w); };

  const SKY = {
    spring: ['#b3dbf3', '#e2f0ee', '#fbefdc'], summer: ['#93cff3', '#dbf0f1', '#fdf0d4'],
    autumn: ['#c5c4e6', '#f1dcc9', '#f9e3bf'], winter: ['#b9c9e3', '#dfe7f1', '#f4f3f4'],
  };
  // the far ridges and the hill itself from the terrace down to the gate
  const RIDGE = { spring: ['#c3d3e6', '#b4d0b0'], summer: ['#b7cbe6', '#a4c8a0'], autumn: ['#cfc4dc', '#cdb48e'], winter: ['#ced7e8', '#dee5ef'] };
  const HILL = {
    spring: ['#bddb96', '#a5cf80', '#8fc06c'], summer: ['#afd488', '#96c571', '#7fb65c'],
    autumn: ['#d5c882', '#c3b268', '#ad9c56'], winter: ['#f0f4f9', '#e6edf4', '#d9e2ec'],
  };
  // hedges and leaves: dark, middle and light
  const GREEN = {
    spring: ['#4f8452', '#6da064', '#9ac27e'], summer: ['#3f7a48', '#5a9456', '#86b66c'],
    autumn: ['#7c6a34', '#a3853c', '#c9a44e'], winter: ['#6f8a72', '#90a890', '#c6d4cc'],
  };
  const LILAC = ['#f1e6f8', '#d8c3ef', '#b89ae2', '#9674d2', '#7554b8'];

  // ---------------------------------------------------------------- the front
  // the walls: from the outer corners to the foot, the string course between
  // the storeys and the cornice along the top
  const WALL = { l: 34, r: 366, foot: 274, string: 206, top: 150 };
  // the centres of the tall windows on the left; the right side mirrors them
  const TALLX = [61, 110, 146];
  const mir = (x) => 400 - x;
  const TALL = { w: 26, top: 214, spring: 227, foot: 266 };
  const UPPER = { w: 22, top: 163, foot: 197 };
  const tallD = (cx) => `M${cx - 13} ${TALL.foot}V${TALL.spring}A13 13 0 0 1 ${cx + 13} ${TALL.spring}V${TALL.foot}Z`;
  const upperD = (cx) => `M${cx - 11} ${UPPER.foot}V${UPPER.top}H${cx + 11}V${UPPER.foot}Z`;
  const CLOCK = { x: 200, y: 106, r: 19 };
  const STUDY = { cx: 339, x0: 323, x1: 355, y0: 162, y1: 197 };

  // little css of our own: water, flowers, flag and the small creatures
  function style() {
    return `<style>@media (prefers-reduced-motion: no-preference){
      #scene .wm-glint{animation:wmglint 3.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
      #scene .wm-glint:nth-of-type(2n){animation-delay:-1.4s}
      #scene .wm-glint:nth-of-type(3n){animation-delay:-2.7s}
      @keyframes wmglint{0%,100%{opacity:.1;transform:scale(.5)}50%{opacity:1;transform:scale(1)}}
      #scene .wm-ripple{animation:wmripple 9s ease-in-out infinite alternate}
      #scene .wm-ripple.b{animation-duration:12s;animation-delay:-4s}
      @keyframes wmripple{from{transform:translateX(-6px)}to{transform:translateX(6px)}}
      #scene .wm-ring{animation:wmring 5s ease-out infinite;transform-box:fill-box;transform-origin:center}
      #scene .wm-ring.b{animation-delay:-2.5s}
      @keyframes wmring{0%{opacity:.8;transform:scale(.8)}100%{opacity:0;transform:scale(1.25)}}
      #scene .wm-drop{animation:wmdrop 1.5s ease-in infinite}
      #scene .wm-drop:nth-of-type(2n){animation-delay:-.5s}
      #scene .wm-drop:nth-of-type(3n){animation-delay:-1s}
      @keyframes wmdrop{0%{opacity:0;transform:translateY(-2px)}25%{opacity:.95}100%{opacity:0;transform:translateY(7px)}}
      #scene .wm-sway{animation:wmsway 5.6s ease-in-out infinite alternate}
      #scene .wm-sway.b{animation-duration:7s;animation-delay:-2.4s}
      #scene .wm-sway.c{animation-duration:6.2s;animation-delay:-4.2s}
      @keyframes wmsway{from{transform:translateX(-.5px)}to{transform:translateX(.7px)}}
      #scene .wm-waltz{animation:wmwaltz 7s ease-in-out infinite alternate}
      @keyframes wmwaltz{from{transform:translateX(-3px)}to{transform:translateX(3px)}}
      #scene .wm-flag{animation:wmflag 3.2s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:0% 50%}
      @keyframes wmflag{from{transform:skewY(-5deg)}to{transform:skewY(6deg)}}
      #scene .wm-bob{animation:wmbob 4.6s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}
      @keyframes wmbob{from{transform:translateY(-.6px) rotate(-1deg)}to{transform:translateY(.7px) rotate(1deg)}}
      #scene .wm-swing{animation:wmswing 3.6s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 0%}
      @keyframes wmswing{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}
      #scene .wm-hop{animation:wmhop 5.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes wmhop{0%,80%,100%{transform:translateY(0)}86%{transform:translateY(-3px)}92%{transform:translateY(0)}}
      #scene .wm-breathe{animation:wmbreathe 3.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes wmbreathe{50%{transform:scaleY(1.06)}}
      #scene .wm-nod{animation:wmnod 7s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}
      @keyframes wmnod{0%,60%,100%{transform:rotate(0)}68%,84%{transform:rotate(9deg)}}
      #scene .wm-fan{animation:wmfan 9s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}
      @keyframes wmfan{0%,100%{transform:scale(.97)}50%{transform:scale(1.03)}}
      #scene .wm-fly{animation:wmfly 3.4s ease-in-out infinite alternate}
      #scene .wm-fly:nth-of-type(2n){animation-delay:-1.3s}
      #scene .wm-fly:nth-of-type(3n){animation-delay:-2.4s}
      @keyframes wmfly{from{opacity:.15;transform:translate(-2px,1px)}to{opacity:1;transform:translate(2px,-2px)}}
    }</style>`;
  }

  function palette(C) {
    const k = (1 - PCT) * 0.35;
    K = {
      C,
      stone: U.mix('#ecd6a8', '#b5ad9c', k * 1.3),
      trim: U.mix('#f8eeda', '#c4bcac', k * 1.3),
      slate: U.mix('#6d7d92', '#7f8486', k * 1.4),
      lead: U.mix('#8f9fae', '#878a84', k * 1.4),
      brick: U.mix('#b9674a', '#9a8274', k * 1.2),
      gold: U.mix('#dcae45', '#9a8a5e', k * 1.5),
      iron: '#3a3f42',
    };
  }

  function defs() {
    const G = HILL[SEASON];
    const gravel = (base, a, b) => `<rect width="22" height="16" fill="${base}"/><circle cx="4" cy="3" r="0.7" fill="${a}"/><circle cx="13" cy="6" r="0.8" fill="${b}"/><circle cx="19" cy="2" r="0.6" fill="${a}"/><circle cx="8" cy="11" r="0.7" fill="${b}"/><circle cx="17" cy="13" r="0.8" fill="${a}"/><circle cx="2" cy="14" r="0.6" fill="${b}"/>`;
    return `
    <defs>
      <linearGradient id="${id('Sky')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${SKY[SEASON][0]}"/><stop offset="0.7" stop-color="${SKY[SEASON][1]}"/><stop offset="1" stop-color="${SKY[SEASON][2]}"/>
      </linearGradient>
      <radialGradient id="${id('Sun')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#fff6cf"/><stop offset="0.45" stop-color="#fde7a3"/><stop offset="1" stop-color="#fde7a3" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="${id('Glow')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#ffe2a0" stop-opacity="0.62"/><stop offset="0.45" stop-color="#ffd98a" stop-opacity="0.24"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${id('GlowRoom')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf70"/><stop offset="1" stop-color="#ffa93e"/></linearGradient>
      ${WARM.map((c, i) => `<linearGradient id="${id(`GlowBulb${i}`)}"><stop stop-color="${c}"/></linearGradient>`).join('')}
      <linearGradient id="${id('Hill')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${G[0]}"/><stop offset="0.5" stop-color="${G[1]}"/><stop offset="1" stop-color="${G[2]}"/>
      </linearGradient>
      <linearGradient id="${id('Wall')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${U.shade(K.stone, 0.26)}"/><stop offset="0.55" stop-color="${K.stone}"/><stop offset="1" stop-color="${U.shade(K.stone, -0.08)}"/>
      </linearGradient>
      <linearGradient id="${id('Bay')}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${U.shade(K.stone, -0.1)}"/><stop offset="0.14" stop-color="${U.shade(K.stone, 0.22)}"/><stop offset="0.86" stop-color="${U.shade(K.stone, 0.22)}"/><stop offset="1" stop-color="${U.shade(K.stone, -0.14)}"/>
      </linearGradient>
      <linearGradient id="${id('Roof')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${U.shade(K.slate, 0.22)}"/><stop offset="1" stop-color="${U.shade(K.slate, -0.12)}"/>
      </linearGradient>
      <linearGradient id="${id('Grime')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a7ab98"/><stop offset="0.7" stop-color="#8f9478"/><stop offset="1" stop-color="#7a7f60"/></linearGradient>
      <linearGradient id="${id('Dusty')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9b19f"/><stop offset="1" stop-color="#d7c39a"/></linearGradient>
      <linearGradient id="${id('Frost')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f9fc"/><stop offset="1" stop-color="#cadbe8"/></linearGradient>
      <linearGradient id="${id('Shade')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.3"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
      <linearGradient id="${id('Glass')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3f2f6"/><stop offset="1" stop-color="#a9cbd8"/></linearGradient>
      <linearGradient id="${id('Parquet')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9783c"/><stop offset="0.5" stop-color="#e2ac62"/><stop offset="1" stop-color="#c88a48"/></linearGradient>
      <linearGradient id="${id('Lake')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${winter() ? '#cfe0ec' : SEASON === 'autumn' ? '#7aa7bb' : '#5fb0d2'}"/><stop offset="0.55" stop-color="${winter() ? '#dfeaf2' : SEASON === 'autumn' ? '#a6c6cf' : '#93d2e4'}"/><stop offset="1" stop-color="${winter() ? '#eaf1f6' : SEASON === 'autumn' ? '#c8dad8' : '#c4e8ec'}"/>
      </linearGradient>
      <linearGradient id="${id('Murk')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f7a4a"/><stop offset="1" stop-color="#8b9c62"/></linearGradient>
      <pattern id="${id('Gravel')}" width="22" height="16" patternUnits="userSpaceOnUse">${gravel(winter() ? '#e4e6e6' : '#ecdcbc', '#d4bf96', '#c9b48c')}</pattern>
      <pattern id="${id('GravelOld')}" width="22" height="16" patternUnits="userSpaceOnUse">${gravel('#bdae92', '#a39578', '#8f8368')}</pattern>
      <pattern id="${id('Snow')}" width="30" height="24" patternUnits="userSpaceOnUse">
        <rect width="30" height="24" fill="#f3f7fb"/><ellipse cx="8" cy="8" rx="7" ry="3" fill="#e2ebf3"/><ellipse cx="22" cy="18" rx="8" ry="3" fill="#e6eef5"/>
        <circle cx="16" cy="5" r="0.9" fill="#fff"/><circle cx="4" cy="19" r="0.8" fill="#c9d8e6"/>
      </pattern>
      <pattern id="${id('Leaves')}" width="34" height="28" patternUnits="userSpaceOnUse">
        <ellipse cx="6" cy="6" rx="4" ry="2" fill="#d9822b" transform="rotate(30 6 6)"/><ellipse cx="22" cy="10" rx="4.5" ry="2.2" fill="#c4462f" transform="rotate(-20 22 10)"/>
        <ellipse cx="14" cy="21" rx="4" ry="2" fill="#e9b23c" transform="rotate(70 14 21)"/><ellipse cx="29" cy="24" rx="3.6" ry="1.8" fill="#9c5a2a"/>
        <ellipse cx="3" cy="17" rx="3.4" ry="1.7" fill="#e06c3c" transform="rotate(-50 3 17)"/>
      </pattern>
      <clipPath id="${id('Left')}"><path d="${TALLX.map(tallD).join('')}"/></clipPath>
      <clipPath id="${id('Right')}"><path d="${TALLX.map((x) => tallD(mir(x))).join('')}"/></clipPath>
      <clipPath id="${id('Upper')}"><path d="${TALLX.map(upperD).join('')}"/></clipPath>
      <clipPath id="${id('Pond')}"><path d="${LAKE_D}"/></clipPath>
      <clipPath id="${id('Basin')}"><ellipse cx="${FOUNT.x}" cy="${FOUNT.y}" rx="${FOUNT.rx - 3}" ry="${FOUNT.ry - 2}"/></clipPath>
      <clipPath id="${id('LawnEdge')}"><path d="${LAWN_D}"/></clipPath>
    </defs>`;
  }

  // ------------------------------------------------------- sky and the hill
  function sky() {
    const cl = SEASON === 'autumn' ? '#fbf1e6' : '#ffffff';
    return `<rect y="-4" width="400" height="300" fill="${url('Sky')}"/>
    ${NIGHT ? '' : `<circle cx="340" cy="56" r="44" fill="${url('Sun')}"/><circle cx="340" cy="56" r="16" fill="#fff3c4"/>`}
    <g class="cloud c1" fill="${cl}" opacity="0.92"><ellipse cx="66" cy="60" rx="26" ry="10"/><ellipse cx="86" cy="53" rx="17" ry="12"/><ellipse cx="104" cy="61" rx="19" ry="8"/></g>
    <g class="cloud c2" fill="${cl}" opacity="0.8"><ellipse cx="282" cy="30" rx="18" ry="6.5"/><ellipse cx="296" cy="25" rx="12" ry="8"/><ellipse cx="309" cy="31" rx="13" ry="5.5"/></g>`;
  }
  // the ridges beyond the hill, and the old trees that stand behind the house
  function far() {
    const r = RIDGE[SEASON], G = GREEN[SEASON], w = winter();
    let s = `<path d="M-6 150 Q60 126 130 138 T270 128 T406 142 V300 H-6Z" fill="${r[0]}"/><path d="M-6 186 Q80 160 190 174 T406 166 V300 H-6Z" fill="${r[1]}"/>`;
    // a cedar with its flat layers on the left
    const ced = w ? '#7f9490' : '#3f6f58', cd = U.shade(ced, -0.16), cl = U.shade(ced, 0.2);
    s += `${box(10, 170, 7, 100, '#6a5444')}`;
    for (const [x, y, rx, ry] of [[13, 118, 15, 8], [11, 136, 25, 9], [15, 156, 34, 10], [9, 178, 42, 11], [14, 202, 46, 12]]) s += oval(x, y + 2, rx, ry, cd) + oval(x, y, rx - 1, ry - 2, ced) + oval(x - rx * 0.22, y - 2.4, rx * 0.6, ry * 0.42, cl, 0.8);
    if (w) for (const [x, y, rx] of [[13, 113, 12], [11, 131, 20], [15, 151, 28], [9, 172, 34], [14, 196, 38]]) s += oval(x, y, rx, 3, SNOW, 0.95);
    // a great beech on the right, bare in winter
    const b = w ? '#a0a9b2' : SEASON === 'autumn' ? '#d6923a' : '#68995a', bd = U.shade(b, -0.14), bl = U.shade(b, 0.2);
    if (w) s += line('M388 270 V170 M388 214 L366 168 M388 196 L412 150 M388 176 L374 132 M380 150 L392 116 M372 170 L352 146', '#7b7570', 3.4, 0.9);
    else {
      s += box(384, 190, 8, 80, '#6f5a48');
      for (const [x, y, rx, ry] of [[390, 126, 30, 26], [362, 156, 26, 24], [404, 164, 28, 30], [376, 198, 34, 26], [410, 216, 24, 24]]) s += oval(x, y + 3, rx, ry, bd) + oval(x, y, rx - 1, ry - 2, b) + oval(x - rx * 0.26, y - ry * 0.3, rx * 0.52, ry * 0.46, bl, 0.75);
    }
    // soft crowns behind the roof
    const t = w ? '#c5cedb' : SEASON === 'autumn' ? '#d2ac6e' : '#90b48a';
    s += ovals([[120, 104, 26, 15], [94, 118, 22, 15], [152, 100, 22, 13], [252, 100, 24, 13], [284, 106, 24, 15], [312, 118, 22, 15]], t, 0.9);
    return s;
  }
  function ground() {
    let s = `<path d="M-6 268 Q60 256 140 262 H260 Q340 256 406 268 V545 H-6Z" fill="${url('Hill')}"/>`;
    const r = U.rng(911), a = [], b = [];
    for (let i = 0; i < 90; i++) (i % 2 ? a : b).push([r() * 400, 300 + r() * 236]);
    if (!winter()) s += specks(a, U.shade(GREEN[SEASON][1], 0.1), 1.6, 0.5) + specks(b, GREEN[SEASON][2], 1.2, 0.6);
    return s;
  }

  // ---------------------------------------------------------------- the house
  // courses of stone: long thin lines with a block marked here and there
  function courses(x0, x1, y0, y1, seed) {
    const r = U.rng(seed);
    let d = '';
    for (let y = y0; y < y1; y += 7) {
      d += `M${x0} ${y}H${x1}`;
      for (let x = x0 + 6 + r() * 14; x < x1; x += 16 + r() * 22) d += `M${f1(x)} ${y}v7`;
    }
    return line(d, '#7a5a30', 0.4, 0.2);
  }
  const quoins = (x, side) => {
    let s = '';
    for (let y = 150, i = 0; y < 266; y += 9, i++) s += box(side > 0 ? x : x - (i % 2 ? 7 : 10), y, i % 2 ? 7 : 10, 7.6, U.shade(K.stone, 0.3));
    return s;
  };
  const dormer = (x) => `${box(x - 8, 128, 16, 16, K.trim)}${shape(`M${x - 11} 129 L${x} 118 L${x + 11} 129Z`, K.slate)}${line(`M${x - 11} 129 L${x} 118 L${x + 11} 129`, K.trim, 1.2)}${box(x - 5, 131, 10, 11, PCT < 0.4 ? url('Grime') : url('Glass'))}${line(`M${x} 131 V142 M${x - 5} 136.5 H${x + 5}`, '#fff8ea', 0.6)}${winter() ? shape(`M${x - 12} 129 L${x} 117 L${x + 12} 129 Q${x} 123 ${x - 12} 129Z`, SNOW) : ''}`;
  function roofs() {
    const w = winter(), old = PCT < 0.4;
    const stack = (x) => `${box(x - 11, 84, 22, 32, url('Wall'))}${box(x - 13, 82, 26, 4, K.trim, ' rx="1"')}${box(x - 13, 94, 26, 1.6, K.trim)}${box(x - 8, 73, 5.4, 9, K.brick)}${box(x + 2.6, 73, 5.4, 9, K.brick)}${box(x - 8, 73, 5.4, 1.6, '#000', ' opacity="0.2"')}${box(x + 2.6, 73, 5.4, 1.6, '#000', ' opacity="0.2"')}${w ? box(x - 13, 80.4, 26, 2.2, SNOW, ' rx="1"') : ''}`;
    let s = '';
    if (PCT > 0.6) s += '<g class="smoke" fill="#ffffff"><circle cx="124" cy="64" r="5" opacity="0.7"/><circle cx="128" cy="52" r="7" opacity="0.5"/><circle cx="124" cy="38" r="9" opacity="0.3"/></g>';
    s += stack(118) + stack(282);
    s += shape('M84 152 L110 110 H290 L316 152Z', url('Roof'));
    let d = '';
    for (let y = 116; y < 150; y += 6) { const t = (y - 110) / 42; d += `M${f1(110 - 26 * t)} ${y}H${f1(290 + 26 * t)}`; }
    s += line(d, '#000', 0.5, 0.15);
    if (old) s += `${shape('M122 124 l10 -1 l3 7 l-10 2Z M258 132 l12 -2 l2 6 l-11 2Z', '#3f4852', ' opacity="0.7"')}${ovals([[150, 138, 9, 2.4], [240, 120, 8, 2], [286, 142, 7, 2.2]], '#7f8f4e', 0.7)}`;
    s += dormer(146) + dormer(254) + dormer(104) + dormer(296);
    if (w) s += shape('M84 152 L110 110 H290 L316 152 Q296 141 270 146 Q230 132 200 140 Q160 130 130 146 Q104 140 84 152Z', SNOW, ' opacity="0.96"');
    // the steep caps of the two pavilions
    for (const x of [61, mir(61)]) {
      const cap = `M${x - 34} 146 Q${x - 22} 126 ${x - 13} 106 Q${x} 92 ${x + 13} 106 Q${x + 22} 126 ${x + 34} 146Z`;
      s += shape(cap, url('Roof'));
      s += line(`M${x - 17} 120 H${x + 17} M${x - 24} 132 H${x + 24} M${x - 10} 110 H${x + 10} M${x} 98 V146 M${x - 15} 146 Q${x - 11} 118 ${x - 5} 100 M${x + 15} 146 Q${x + 11} 118 ${x + 5} 100`, '#000', 0.5, 0.15);
      s += `${line(`M${x} 100 V84`, K.lead, 1.4)}${dot(x, 90, 2.4, K.gold)}${dot(x, 83, 1.5, K.gold)}`;
      if (w) s += shape(`M${x - 35} 146 Q${x - 22} 126 ${x - 13} 106 Q${x} 92 ${x + 13} 106 Q${x + 22} 126 ${x + 35} 146 Q${x + 18} 134 ${x + 6} 138 Q${x - 8} 128 ${x - 18} 138 Q${x - 26} 136 ${x - 35} 146Z`, SNOW, ' opacity="0.96"');
    }
    return s;
  }
  // the tower over the door: a square shaft, a cornice, an open lantern with
  // its bell and a little lead dome with a vane on top
  function tower() {
    const w = winter();
    let s = `${box(176, 70, 48, 86, url('Bay'))}${courses(177, 223, 76, 150, 41)}`;
    s += `${box(170, 69, 60, 5, K.trim, ' rx="1"')}${box(173, 74, 54, 2, '#000', ' opacity="0.14"')}`;
    // the lantern
    s += `${box(184, 46, 32, 24, K.trim)}${box(187, 49, 7, 21, '#46506a', ' rx="3"')}${box(196.5, 49, 7, 21, '#46506a', ' rx="3"')}${box(206, 49, 7, 21, '#46506a', ' rx="3"')}`;
    s += `${shape('M197 60 Q200 54 203 60 L204 65 H196Z', K.gold)}${dot(200, 66, 1, K.gold)}`;
    s += `${box(181, 43, 38, 4, K.trim, ' rx="1"')}${shape('M183 43 Q185 27 200 22 Q215 27 217 43Z', K.lead)}${shape('M200 22 Q215 27 217 43 H204 Q205 30 200 22Z', '#000', ' opacity="0.12"')}`;
    s += `${line('M200 22 V8', K.iron, 1.2)}${dot(200, 20, 1.8, K.gold)}${line('M193 12 H207', K.iron, 1)}${shape('M207 12 l-4 -2.6 v5.2Z', K.iron)}${shape('M193 12 l-3 -2 v4Z', K.iron)}`;
    if (w) s += `${shape('M184 42 Q187 29 200 23 Q213 29 216 42 Q200 34 184 42Z', SNOW)}${box(169.4, 67.6, 61, 2.6, SNOW, ' rx="1.2"')}${box(180.6, 42, 38.8, 2.2, SNOW, ' rx="1"')}`;
    return s;
  }
  function clock(st) {
    const p = pend(st, 'clock'), ok = st.clock, { x, y, r } = CLOCK;
    let s = `<g data-part="clock">${box(176, 42, 48, 106, '#000', ' fill-opacity="0"')}`;
    s += `${dot(x, y, r + 3.4, ok ? K.gold : '#8f8568')}${dot(x, y, r + 1.6, ok ? '#3d4c63' : '#6d675a')}${dot(x, y, r, ok ? '#fdfaf0' : '#b9ae92')}`;
    let d = '';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, c = Math.cos(a), n = Math.sin(a), l = i % 3 ? 2.6 : 4.4;
      if (ok || i % 5) d += `M${f1(x + c * (r - 1.6))} ${f1(y + n * (r - 1.6))}L${f1(x + c * (r - 1.6 - l))} ${f1(y + n * (r - 1.6 - l))}`;
    }
    s += line(d, ok ? '#2f3a4e' : '#6d675a', 1);
    const hand = (deg, len, w, col) => line(`M${x} ${y}L${f1(x + Math.sin((deg * Math.PI) / 180) * len)} ${f1(y - Math.cos((deg * Math.PI) / 180) * len)}`, col, w);
    if (ok) s += `${hand(305, 10, 2.2, '#2f3a4e')}${hand(60, 14.5, 1.5, '#2f3a4e')}${dot(x, y, 1.8, K.gold)}`;
    else {
      // stopped long ago, one hand fallen, the glass cracked and stained
      s += `${hand(186, 13, 1.5, '#5a5448')}${hand(172, 9, 2, '#5a5448')}${dot(x, y, 1.6, '#5a5448')}`;
      s += `${line(`M${x - 13} ${y - 11} l9 7 l-3 8 l10 6 M${x + 12} ${y - 14} l-7 10`, '#5a5448', 0.6, 0.8)}${oval(x + 8, y + 10, 8, 4.4, '#7d8650', 0.5)}${oval(x - 9, y - 5, 6, 3, '#8b7a54', 0.5)}`;
    }
    if (ok && p === 'grow') s += `${dot(x, y, r, url('Dusty'))}`.replace('/>', ' opacity="0.55"/>');
    if (ok && p !== 'grow') s += shape(`M${x - 12} ${y - 10} Q${x - 4} ${y - 17} ${x + 6} ${y - 16} Q${x - 4} ${y - 12} ${x - 8} ${y - 3}Z`, '#fff', ' opacity="0.5"');
    return s + '</g>';
  }

  function walls() {
    const old = PCT < 0.4;
    let s = `${box(92, 150, 216, 124, url('Wall'))}${courses(92, 308, 154, 268, 17)}`;
    // the parapet with its balusters along the range
    for (const [a, b] of [[92, 168], [232, 308]]) {
      let d = '';
      for (let x = a + 4; x < b - 1; x += 5.2) d += `M${f1(x)} 142V148`;
      s += `${line(d, K.trim, 2)}${box(a, 139, b - a, 3, K.trim)}`;
      if (old) s += box(a + 26, 138, 12, 11, '#6d7d92', ' opacity="0.9"');
    }
    for (const x of [96, 164, 236, 304]) s += `${box(x - 3, 134, 6, 5, K.trim)}${shape(`M${x - 3} 134 Q${x - 5} 128 ${x} 125 Q${x + 5} 128 ${x + 3} 134Z`, K.trim)}${winter() ? oval(x, 125.4, 3.6, 1.8, SNOW) : ''}`;
    if (winter()) s += box(91, 137.4, 78, 2.2, SNOW, ' rx="1"') + box(231, 137.4, 78, 2.2, SNOW, ' rx="1"');
    // the middle bay runs up into the tower
    s += `${box(168, 146, 64, 128, url('Bay'))}${courses(169, 231, 152, 268, 23)}`;
    // the pavilions at the ends stand a little forward of the range
    for (const x0 of [WALL.l, mir(WALL.l) - 58]) {
      s += `${box(x0, 144, 58, 130, url('Bay'))}${courses(x0 + 1, x0 + 57, 150, 268, 29 + x0)}${quoins(x0, 1)}${quoins(x0 + 58, -1)}${box(x0 - 4, 142, 66, 5, K.trim, ' rx="1"')}${box(x0 - 2, 147, 62, 2, '#000', ' opacity="0.12"')}`;
    }
    // cornice, string course and plinth
    s += `${box(92, 148, 76, 4, K.trim)}${box(232, 148, 76, 4, K.trim)}${box(92, 152, 216, 2, '#000', ' opacity="0.1"')}`;
    s += `${box(30, 205, 340, 4, K.trim, ' rx="1"')}${box(30, 209, 340, 1.6, '#000', ' opacity="0.1"')}`;
    s += `${box(30, 268, 340, 7, U.shade(K.stone, -0.14))}${box(30, 267, 340, 1.4, K.trim)}`;
    if (old) {
      const r = U.rng(233);
      for (let i = 0; i < 14; i++) s += oval(44 + r() * 312, 156 + r() * 110, 6 + r() * 12, 2.4 + r() * 5, '#a39a84', 0.42);
      s += `${line('M100 158 l5 13 l-4 9 l6 12', '#7d6a5e', 0.8, 0.7)}${line('M304 212 l-6 11 l5 8 l-3 12', '#7d6a5e', 0.8, 0.7)}${line('M180 150 l4 12 l-5 8', '#7d6a5e', 0.7, 0.6)}`;
      s += ovals([[60, 268, 16, 4], [300, 270, 14, 3.4], [150, 270, 10, 3]], '#6f8a3e', 0.55);
    }
    return s;
  }

  // ------------------------------------------- the rooms behind the windows
  function ballroom(st) {
    const p = pend(st, 'ballroom'), ok = st.ballroom, shine = ok && p !== 'grow', x0 = 44, x1 = 162;
    let s = `<g data-part="ballroom"><g clip-path="${url('Left')}">${box(x0, 212, x1 - x0, 44, ok ? '#9cc4bf' : '#a8a292')}${box(x0, 212, x1 - x0, 5, '#000', ' opacity="0.1"')}`;
    for (const cx of TALLX) s += `<rect x="${cx - 9}" y="219" width="18" height="31" rx="1" fill="none" stroke="${ok ? '#f0cf74' : '#8f8a78'}" stroke-width="0.9"/>`;
    s += box(x0, 254, x1 - x0, 14, shine ? url('Parquet') : ok ? '#b89a72' : '#86806f');
    if (shine) {
      let d = '';
      for (let x = x0; x < x1; x += 5) d += `M${x} 268L${x + 3} 254M${x + 3} 268L${x} 254`;
      s += line(d, '#8f5a2c', 0.4, 0.55);
      for (const cx of TALLX) s += oval(cx, 260, 10, 3, '#fff3cf', 0.7);
      // gilt chairs along the wall
      for (const x of [52, 70, 136, 156]) s += `${line(`M${x} 247 V256 H${x + 4} V260 M${x} 256 V260`, '#c9962e', 0.9)}${box(x - 0.4, 254, 5, 1.6, '#c9474f')}`;
    } else {
      // dust sheets over the furniture
      const sh = ok ? '#d9d2c2' : '#bcb6a6';
      s += `${shape('M49 266 Q49 245 58 244 Q69 244 73 266Z', sh)}${shape('M98 266 Q100 250 110 250 Q120 250 124 266Z', sh)}${shape('M134 266 Q136 244 146 243 Q156 244 160 266Z', sh)}`;
      s += line('M56 248 q2 8 0 16 M112 253 q-2 6 0 12 M146 247 q3 9 0 18', '#8f8a78', 0.6, 0.7);
    }
    return s + '</g></g>';
  }
  function chandelier(st) {
    const p = pend(st, 'chandelier'), ok = st.chandelier, x = TALLX[1], y = 232, bright = ok && p !== 'grow';
    let s = `<g data-part="chandelier"><g clip-path="${url('Left')}">${box(x - 13, 214, 26, 36, '#000', ' fill-opacity="0"')}${line(`M${x} 212 V${y - 7}`, ok ? K.gold : '#7a7466', 1)}`;
    if (ok) {
      const g = bright ? '#f2c24e' : '#a39a78', c = bright ? '#ffffff' : '#c9c4b6';
      s += `${line(`M${x - 11} ${y + 1} Q${x} ${y + 8} ${x + 11} ${y + 1} M${x - 7} ${y - 5} Q${x} ${y} ${x + 7} ${y - 5} M${x} ${y - 7} V${y + 8}`, g, 1.1)}`;
      s += specks([[x - 11, y + 3.6], [x - 7.6, y + 6.4], [x - 3.4, y + 8], [x + 3.4, y + 8], [x + 7.6, y + 6.4], [x + 11, y + 3.6], [x - 6, y - 2], [x + 6, y - 2], [x - 2.6, y + 1], [x + 2.6, y + 1], [x, y + 11]], c, 2.4);
      s += specks([[x - 11, y - 1.6], [x + 11, y - 1.6], [x - 7, y - 7.6], [x + 7, y - 7.6], [x, y - 9.4]], bright ? '#ffe08a' : '#b5ad90', 2.2);
      if (bright) s += `<path class="wm-glint" d="M${x + 4} ${y + 1}l.6 2 2 .6 -2 .6 -.6 2 -.6 -2 -2 -.6 2 -.6Z" fill="#fff"/><path class="wm-glint" d="M${x - 8} ${y + 2}l.5 1.6 1.6 .5 -1.6 .5 -.5 1.6 -.5 -1.6 -1.6 -.5 1.6 -.5Z" fill="#fff"/>`;
    } else {
      // tied up in a bag against the dust
      s += `${shape(`M${x} ${y - 9} Q${x - 13} ${y} ${x - 10} ${y + 10} Q${x} ${y + 17} ${x + 10} ${y + 10} Q${x + 13} ${y} ${x} ${y - 9}Z`, '#9c9686')}${line(`M${x - 4} ${y - 5} Q${x} ${y - 3} ${x + 4} ${y - 5} M${x - 5} ${y + 2} q1 6 0 11 M${x + 4} ${y + 1} q2 6 0 12`, '#6d675a', 0.6)}`;
    }
    return s + '</g></g>';
  }
  function library(st) {
    const p = pend(st, 'library'), ok = st.library, tidy = ok && p !== 'grow', x0 = 238, x1 = 356;
    const r = U.rng(733), cols = ['#a33d3d', '#2f6b57', '#2f4f7a', '#d0a23c', '#6b3f7a', '#c9743a'], runs = cols.map(() => []);
    let s = `<g data-part="library"><g clip-path="${url('Right')}">${box(x0, 212, x1 - x0, 56, ok ? '#6d4228' : '#6a6154')}`;
    for (const y of [226, 238, 250, 262]) {
      let x = x0 + 1, c = 0, left = 0;
      while (x < x1) {
        if (left-- <= 0) { c = Math.floor(r() * 6); left = 5 + Math.floor(r() * 7); }
        if (tidy || (ok ? r() > 0.3 : r() > 0.72)) runs[c].push(`M${f1(x)} ${y}v${f1(-(tidy ? 8 + (c % 3) * 0.8 : 5 + r() * 4))}`);
        x += 2.4;
      }
    }
    runs.forEach((d, i) => { if (d.length) s += `<path d="${d.join('')}" stroke="${ok ? cols[i] : U.mix(cols[i], '#8f8a78', 0.6)}" stroke-width="2"/>`; });
    for (const y of [226, 238, 250, 262]) s += `${box(x0, y, x1 - x0, 1.8, ok ? '#a4703e' : '#7d7264')}${box(x0, y + 1.8, x1 - x0, 1.4, '#000', ' opacity="0.22"')}`;
    if (tidy) s += `${line('M272 214 L280 267 M278 214 L286 267', '#d0a23c', 0.9)}${line('M273 224 h6 M274.6 235 h6 M276.2 246 h6 M277.8 257 h6', '#d0a23c', 0.8)}`;
    else if (!ok) s += `${line('M246 224 l4 -8 M256 261 l5 -7 M296 248 l-5 -7', '#8f8a78', 2)}${ovals([[250, 265, 9, 3], [292, 266, 10, 3], [338, 265, 8, 3]], '#8d8676')}`;
    else s += `${line('M246 224 l4 -8 M332 249 l-4 -7', '#a33d3d', 2)}${box(x0, 212, x1 - x0, 56, '#d7c39a', ' opacity="0.28"')}`;
    return s + '</g></g>';
  }
  // the glass of a row of tall windows, over whatever room is behind it
  function tallGlass(xs, part, st) {
    const p = pend(st, part), ok = st[part];
    let s = `<g data-part="${part}">`;
    for (const cx of xs) {
      const d = tallD(cx), a = cx - 13, b = cx + 13;
      if (!ok) s += `${shape(d, url('Grime'), ' opacity="0.72"')}${line(`M${a + 4} 232 l6 9 l-3 8 M${b - 5} 250 l-5 -6`, '#eef0e8', 0.5, 0.8)}${line(`M${a + 1} 228 q6 6 12 0 M${a + 2} 230 l9 8`, '#eef0e8', 0.35, 0.8)}`;
      else if (p === 'frost') s += `${shape(d, url('Frost'), ' opacity="0.86"')}${line(`M${a + 2} 264 q5 -12 2 -24 M${a + 4} 252 l5 -4 M${a + 3} 244 l4 -4 M${b - 2} 264 q-6 -10 -3 -22 M${b - 4} 252 l-5 -3 M${b - 3} 244 l-4 -3`, '#fff', 0.9)}`;
      else if (p === 'grow') {
        s += shape(d, url('Dusty'), ' opacity="0.56"');
        for (let i = 0; i < 4; i++) s += oval(a + 6 + i * 5, 234 + ((i * 11) % 24), 3.6, 2.2, '#fff8e8', 0.4);
      } else s += `<g pointer-events="none">${shape(`M${a + 2} ${TALL.foot} L${a + 18} ${TALL.top + 4} H${a + 25} L${a + 8} ${TALL.foot}Z`, '#fff', ' opacity="0.13"')}</g>`;
      const bar = ok ? '#fff8ea' : '#6f6a5c';
      s += line(`M${cx} ${TALL.top} V${TALL.foot} M${a} ${TALL.spring} H${b} M${a} 240 H${b} M${a} 253 H${b}`, bar, 0.8);
      s += `<path d="${d}" fill="none" stroke="${K.trim}" stroke-width="2.8"/>${shape(`M${cx - 3.4} 211.4 h6.8 l-1 6 h-4.8Z`, K.trim)}${box(a - 3, 266, 32, 2.6, K.trim, ' rx="0.8"')}`;
      if (winter()) s += box(a - 3, 264.8, 32, 1.8, SNOW, ' rx="0.8"');
    }
    return s + '</g>';
  }
  function portraits(st) {
    const p = pend(st, 'portraits'), ok = st.portraits;
    let s = `<g data-part="portraits"><g clip-path="${url('Upper')}">${box(46, 160, 120, 40, ok ? '#8e3f48' : '#80786c')}`;
    TALLX.forEach((cx, i) => {
      const tilt = ok && p !== 'grow' ? 0 : [-10, 7, -6][i], y = 172, g = ok ? K.gold : '#8a7a58', bg = ok ? ['#3f4a3a', '#4a3a30', '#2f3f4f'][i] : '#5f5a4e';
      s += `<g transform="rotate(${tilt} ${cx} ${y})">${box(cx - 8, y - 6, 16, 21, g, ' rx="0.8"')}${box(cx - 6.4, y - 4.4, 12.8, 17.8, bg)}`;
      if (ok) s += `${shape(`M${cx - 6} ${y + 13.4} Q${cx - 5} ${y + 5} ${cx} ${y + 5} Q${cx + 5} ${y + 5} ${cx + 6} ${y + 13.4}Z`, ['#7a3440', '#2f4f7a', '#5a4a2a'][i])}${dot(cx, y + 1.6, 3.2, '#e8c4a0')}${shape(`M${cx - 3.6} ${y + 1.4} Q${cx} ${y - 4.6} ${cx + 3.6} ${y + 1.4} Q${cx} ${y - 1.4} ${cx - 3.6} ${y + 1.4}Z`, ['#3a2a20', '#b5874a', '#8a8a8a'][i])}`;
      s += '</g>';
      if (!ok && i === 1) s += `${shape(`M${cx - 9} 163 H${cx + 9} L${cx + 7} 192 Q${cx} 196 ${cx - 7} 192Z`, '#b5ae9e')}${line(`M${cx - 3} 165 q1 12 -1 25 M${cx + 3} 165 q-1 12 1 25`, '#8f8a78', 0.6)}`;
    });
    s += '</g>';
    for (const cx of TALLX) {
      const a = cx - 11, b = cx + 11;
      if (!ok) s += shape(upperD(cx), url('Grime'), ' opacity="0.62"');
      else if (p === 'grow') s += shape(upperD(cx), url('Dusty'), ' opacity="0.42"');
      else s += shape(`M${a + 2} ${UPPER.foot} L${a + 13} ${UPPER.top} H${a + 18} L${a + 7} ${UPPER.foot}Z`, '#fff', ' opacity="0.16"');
      s += `${line(`M${cx} ${UPPER.top} V${UPPER.foot} M${a} 174 H${b} M${a} 186 H${b}`, ok ? '#fff8ea' : '#6f6a5c', 0.7)}${upperFrame(cx)}`;
    }
    return s + '</g>';
  }
  const upperFrame = (cx) => `<path d="${upperD(cx)}" fill="none" stroke="${K.trim}" stroke-width="2.4"/>${shape(`M${cx - 15} 161 L${cx} 154.6 L${cx + 15} 161Z`, K.trim)}${box(cx - 14, 197, 28, 2.2, K.trim, ' rx="0.8"')}${winter() ? shape(`M${cx - 15.6} 161 L${cx} 153.6 L${cx + 15.6} 161 Q${cx} 156 ${cx - 15.6} 161Z`, SNOW) : ''}`;
  // the two bedrooms on the right, the arched window over the door
  function plainUpper(cx) {
    const old = PCT < 0.4;
    return `${shape(upperD(cx), old ? url('Grime') : url('Glass'))}${old ? '' : `${shape(`M${cx - 11} ${UPPER.top} q6 12 2 30 h-2Z M${cx + 11} ${UPPER.top} q-6 12 -2 30 h2Z`, '#f3e4cf')}`}${line(`M${cx} ${UPPER.top} V${UPPER.foot} M${cx - 11} 174 H${cx + 11} M${cx - 11} 186 H${cx + 11}`, old ? '#6f6a5c' : '#fff8ea', 0.7)}${upperFrame(cx)}`;
  }
  const HALL = 'M187 183 V164 A13 13 0 0 1 213 164 V183Z';
  function hallWindow() {
    const old = PCT < 0.4;
    return `${shape(HALL, old ? url('Grime') : url('Glass'))}${line('M200 151 V183 M187 164 H213 M187 174 H213', old ? '#6f6a5c' : '#fff8ea', 0.8)}<path d="${HALL}" fill="none" stroke="${K.trim}" stroke-width="2.6"/>`;
  }
  // the study looks out of a stone bay on the right-hand pavilion; while it is
  // locked its shutters are barred, afterwards the green room shows
  function study(st) {
    const p = pend(st, 'study'), ok = st.study, { cx, x0, x1, y0, y1 } = STUDY, w = x1 - x0, h = y1 - y0;
    let s = `<g data-part="study">${shape(`M${x0 - 5} ${y1 + 4} H${x1 + 5} L${cx + 7} ${y1 + 16} H${cx - 7}Z`, U.shade(K.stone, -0.08))}${box(x0 - 5, y0 - 3, w + 10, h + 7, K.trim, ' rx="1"')}`;
    s += `${shape(`M${x0 - 7} ${y0 - 2} Q${cx} ${y0 - 20} ${x1 + 7} ${y0 - 2}Z`, K.lead)}${box(x0 - 7, y0 - 3, w + 14, 2.2, K.trim, ' rx="1"')}`;
    s += box(x0, y0, w, h, ok ? '#2f5a4a' : '#55514a');
    if (ok) {
      // shelves, a globe, a lamp with a green shade on the desk
      s += `${box(x0, y0 + 7, w, 1.2, '#a4703e')}${box(x0, y0 + 16, w, 1.2, '#a4703e')}`;
      s += line(`M${x0 + 2} ${y0 + 7} v-5 M${x0 + 4.6} ${y0 + 7} v-5 M${x0 + 7} ${y0 + 7} v-4 M${x0 + 12} ${y0 + 7} v-5 M${x1 - 3} ${y0 + 16} v-6 M${x1 - 6} ${y0 + 16} v-5 M${x1 - 9} ${y0 + 16} v-6`, '#d0a23c', 1.6);
      s += `${dot(x0 + 8, y0 + 12, 3.4, '#3f8fae')}${oval(x0 + 7, y0 + 12, 1.6, 2.2, '#7cb36a')}${box(x0 + 7, y0 + 15, 2, 1.2, '#a4703e')}`;
      s += `${box(x0, y1 - 8, w, 8, '#6d4228')}${box(x0, y1 - 8.6, w, 1.4, '#a4703e')}${box(cx + 2.4, y1 - 16, 1.2, 8, '#d0a23c')}${shape(`M${cx - 1.6} ${y1 - 15} L${cx + 1} ${y1 - 19} H${cx + 5} L${cx + 7.6} ${y1 - 15}Z`, '#2f8f5a')}${box(x0 + 3, y1 - 10, 9, 1.6, '#f4efe2')}`;
      if (p === 'grow') s += box(x0, y0, w, h, '#d7c39a', ' opacity="0.4"');
      s += line(`M${x0 + w / 3} ${y0} V${y1} M${x0 + (2 * w) / 3} ${y0} V${y1} M${x0} ${y0 + 12} H${x1}`, '#fff8ea', 0.8);
      s += shape(`M${x0 + 2} ${y1} L${x0 + 12} ${y0} H${x0 + 16} L${x0 + 6} ${y1}Z`, '#fff', ' opacity="0.14"');
    } else {
      // barred shutters and a padlock
      const col = '#7d7468';
      s += box(x0, y0, w, h, col);
      let d = `M${cx} ${y0} V${y1}`;
      for (let y = y0 + 3; y < y1; y += 3.4) d += `M${x0 + 1} ${y}H${cx - 1.4}M${cx + 1.4} ${y}H${x1 - 1}`;
      s += `${line(d, '#5a5448', 0.7)}${box(x0 - 2, y0 + h / 2 - 1.8, w + 4, 3.6, '#4a4640', ' rx="0.8"')}${box(cx - 3.4, y0 + h / 2 - 0.4, 6.8, 6, K.gold, ' rx="1"')}<path d="M${cx - 2} ${y0 + h / 2} v-2.2 a2 2 0 0 1 4 0 v2.2" fill="none" stroke="#6b6658" stroke-width="1"/>${dot(cx, y0 + h / 2 + 2.4, 0.8, '#4a4640')}`;
    }
    return s + `${winter() ? shape(`M${x0 - 8} ${y0 - 2} Q${cx} ${y0 - 22} ${x1 + 8} ${y0 - 2} Q${cx} ${y0 - 11} ${x0 - 8} ${y0 - 2}Z`, SNOW) : ''}</g>`;
  }

  // ----------------------------------------------- the door and the portico
  function door(st, C) {
    const p = pend(st, 'door'), ok = st.door, x0 = 184, x1 = 216, cx = 200, ay = 232, foot = 268;
    const col = ok ? C.manorDoor : U.mix(C.manorDoor, '#a59e90', 0.62), dk = U.shade(col, -0.24), lt = U.shade(col, 0.2);
    let s = `<g data-part="door">${box(x0 - 3, ay - 18, x1 - x0 + 6, foot - ay + 18, K.trim)}`;
    s += shape(`M${x0} ${ay} A16 16 0 0 1 ${x1} ${ay}Z`, ok ? '#ffe9b4' : '#8f8a78');
    s += line(`M${x0} ${ay} A16 16 0 0 1 ${x1} ${ay} M${cx} ${ay} V${ay - 16} M${cx} ${ay} L${cx - 11} ${ay - 11} M${cx} ${ay} L${cx + 11} ${ay - 11}`, K.trim, 1);
    s += box(x0, ay, x1 - x0, foot - ay, col);
    for (const x of [x0 + 2, cx + 2]) s += `<rect x="${x}" y="${ay + 3}" width="12" height="13" rx="0.6" fill="${lt}" stroke="${dk}" stroke-width="0.7"/><rect x="${x}" y="${ay + 19}" width="12" height="15" rx="0.6" fill="${lt}" stroke="${dk}" stroke-width="0.7"/>`;
    s += `${line(`M${cx} ${ay} V${foot}`, dk, 1)}${dot(cx - 2, ay + 17, 1.1, ok ? '#e8c24e' : '#6d675a')}${dot(cx + 2, ay + 17, 1.1, ok ? '#e8c24e' : '#6d675a')}`;
    if (ok) s += `${box(x0 + 1, ay + 1, 2, foot - ay - 1, '#fff', ' opacity="0.08"')}`;
    else s += `<g transform="rotate(-7 200 246)">${box(180, 243, 40, 5.4, '#a58a64')}${line('M183 244 v3 M217 244 v3', '#5a4a3a', 0.8)}</g><g transform="rotate(6 200 256)">${box(180, 254, 40, 5.4, '#b09672')}${line('M183 255 v3 M217 255 v3', '#5a4a3a', 0.8)}</g>${line('M188 234 l3 9 M208 236 l-2 12 M194 262 l2 -7', dk, 1.2, 0.7)}`;
    if (p === 'grow') s += box(x0, ay, x1 - x0, foot - ay, FADE, ' opacity="0.5"');
    else if (p === 'snow' || (ok && winter())) s += `<circle cx="${cx}" cy="${ay + 13}" r="5.6" fill="none" stroke="#3f7a48" stroke-width="3"/>${dot(cx, ay + 18.4, 1.3, '#c9474f')}${dot(cx - 2, ay + 8.4, 0.9, '#c9474f')}${dot(cx + 3.6, ay + 9.6, 0.9, '#c9474f')}`;
    return s + '</g>';
  }
  function portico() {
    let s = '';
    for (const x of [172, 179.6, 220.4, 228]) s += `${box(x - 2.6, 213, 5.2, 53, K.trim)}${box(x + 0.8, 213, 1.8, 53, '#000', ' opacity="0.09"')}${box(x - 3.6, 212, 7.2, 2.4, K.trim, ' rx="0.8"')}${box(x - 3.6, 264, 7.2, 3, K.trim, ' rx="0.8"')}`;
    s += `${box(165, 204, 70, 9, K.trim)}${box(165, 209.6, 70, 0.9, '#000', ' opacity="0.12"')}${box(166, 213, 68, 2, '#000', ' opacity="0.16"')}`;
    s += shape('M160 204 L200 184 L240 204Z', K.trim) + shape('M170 202 L200 188 L230 202Z', U.shade(K.stone, 0.12));
    s += `<circle cx="200" cy="197" r="3.6" fill="none" stroke="${K.gold}" stroke-width="1"/>${line('M160 204 L200 184 L240 204', U.shade(K.trim, -0.12), 1)}`;
    if (winter()) s += shape('M159 204 L200 183 L241 204 Q200 190 159 204Z', SNOW);
    return s;
  }
  // the steps down from the door, and the terrace with its stone balustrade
  function terrace() {
    const pave = U.mix(winter() ? '#eef2f6' : '#e6d9bd', '#b3aa9a', (1 - PCT) * 0.5);
    let s = `${box(-6, 274, 412, 20, pave)}${line('M-6 280 H406 M-6 287 H406', '#000', 0.4, 0.1)}${box(-6, 274, 412, 1.6, '#000', ' opacity="0.12"')}`;
    const treads = [[178, 222, 268], [172, 228, 273], [166, 234, 278], [160, 240, 283], [154, 246, 288]];
    for (const [a, b, y] of treads) s += `${box(a, y, b - a, 3.4, winter() ? SNOW : U.shade(K.trim, -0.02), ' rx="0.6"')}${box(a, y + 3.4, b - a, 2, U.shade(K.stone, -0.2))}`;
    for (const [a, b] of [[24, 148], [252, 376]]) {
      let d = '';
      for (let x = a + 4; x < b - 1; x += 5) d += `M${x} 288V295`;
      s += `${shadow((a + b) / 2, 299, (b - a) / 2 + 2, 2)}${box(a, 296, b - a, 3, U.shade(K.stone, -0.06))}${line(d, K.trim, 2)}${box(a, 285, b - a, 3.2, K.trim, ' rx="0.8"')}`;
      if (winter()) s += box(a, 283.8, b - a, 2.2, SNOW, ' rx="1"');
    }
    for (const x of [148, 252]) s += `${box(x - 6, 279, 12, 20, K.trim)}${box(x - 7.4, 277, 14.8, 3, U.shade(K.trim, 0.2), ' rx="0.8"')}${box(x + 2, 280, 4, 19, '#000', ' opacity="0.08"')}`;
    return s;
  }

  // ------------------------------------------------------------ the wisteria
  // Two old trunks either side of the portico climb to the string course and are
  // trained out along the stone to both ends, with a second tier under the
  // cornice and a swag across the porch. Once pruned it follows the year: long
  // racemes in spring, green in summer, gold in autumn, bare stems in winter.
  const flip = (pts) => pts.map(([x, y]) => [400 - x, y]);
  const VINES = (() => {
    const trunk = [[161, 274], [157, 256], [165, 238], [160, 222], [164, 207]];
    const low = [[164, 207], [141, 203], [118, 207], [94, 203], [70, 207], [38, 204]];
    const up = [[129, 206], [126, 186], [130, 170], [128, 156]];
    const top = [[166, 156], [128, 156], [92, 153], [62, 156], [38, 153]];
    const side = [[164, 207], [167, 190], [165, 170], [168, 156]];
    return [
      { w: 3.8, pts: trunk }, { w: 3.8, pts: flip(trunk) }, { w: 2.2, pts: low }, { w: 2.2, pts: flip(low).slice(0, 5) }, { w: 1.6, pts: up }, { w: 1.6, pts: flip(up) },
      { w: 1.6, pts: top }, { w: 1.6, pts: flip(top).slice(0, 3) }, { w: 1.6, pts: side }, { w: 1.6, pts: flip(side) }, { w: 1.6, pts: [[165, 206], [182, 212], [200, 214], [218, 212], [235, 206]] },
    ].map((v) => { const c = curve(v.pts, 6); return { w: v.w, pts: c, d: `M${c.map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L')}` }; });
  })();
  // where the racemes hang: long between the windows, short over them
  const RACEMES = (() => {
    const r = U.rng(2204), out = [];
    const clear = (x, xs, half) => xs.every((c) => Math.abs(x - c) > half);
    const low = TALLX.concat(TALLX.map(mir));
    const row = (x0, x1, y, xs, half, shortLen, longLen) => {
      for (let x = x0; x < x1; x += 5.6 + r() * 2.6) out.push([x, y + Math.sin(x * 0.09) * 2.2, (clear(x, xs, half) ? longLen : shortLen) * (0.8 + r() * 0.4)]);
    };
    row(38, 162, 206, low, 13, 11, 27);
    row(238, 330, 206, low, 13, 11, 27);
    row(334, 362, 214, low, 13, 7, 9);
    row(40, 166, 157, TALLX, 13, 6, 19);
    row(234, 318, 157, TALLX.map(mir), 13, 6, 19);
    for (const x of [172, 180, 188, 212, 220, 228]) out.push([x, 212 - Math.abs(x - 200) * 0.14, 8 + r() * 5]);
    return out;
  })();
  // the flowers of all the racemes as specks, sorted into three depths of colour
  // and three groups that stir in the air at different times
  const FLOWERS = (() => {
    const r = U.rng(3307), bands = [0, 1, 2].map(() => [[], [], []]);
    RACEMES.forEach(([x, y, len], i) => {
      const n = Math.max(3, Math.round(len / 2.3));
      for (let k = 0; k < n; k++) {
        const t = k / n, half = 2.5 * (1 - t) ** 0.8 + 0.3, py = y + t * len, side = k % 2 ? 1 : -1;
        const band = t < 0.34 ? 0 : t < 0.7 ? 1 : 2;
        bands[i % 3][band].push([x + side * half * (0.6 + r() * 0.4), py]);
        if (t < 0.72) bands[i % 3][band].push([x - side * half * 0.5, py + 1.1]);
      }
    });
    return bands;
  })();
  const LEAFY = (() => {
    const r = U.rng(4411), out = [[], [], []];
    for (const v of VINES.slice(2)) for (const [x, y] of v.pts) for (let i = 0; i < 3; i++) out[i].push([x + (r() - 0.5) * 9, y + (r() - 0.3) * 8]);
    return out;
  })();
  function wisteria(st) {
    const p = pend(st, 'wisteria'), ok = st.wisteria, G = GREEN[SEASON], w = winter();
    const hit = (x, y, a, b) => box(x, y, a, b, '#000', ' fill-opacity="0"');
    let s = `<g data-part="wisteria">${hit(34, 198, 130, 14)}${hit(236, 198, 130, 14)}${hit(34, 150, 132, 8)}`;
    const wood = ok ? '#7a6250' : '#6a5a4c';
    s += VINES.map((v) => line(v.d, U.shade(wood, -0.18), v.w + 0.8) + line(v.d, wood, v.w)).join('');
    if (!ok || p === 'grow') {
      // unpruned: a tangle of old stems and long whips across the stone
      const r = U.rng(ok ? 61 : 57), n = ok ? 18 : 46;
      let d = '';
      for (let i = 0; i < n; i++) {
        const left = i % 2, x = (left ? 40 : 240) + r() * 120, y = (r() < 0.6 ? 206 : 156) + r() * 8;
        d += `M${f1(x)} ${f1(y)}q${f1((r() - 0.5) * 26)} ${f1(10 + r() * 16)} ${f1((r() - 0.5) * 30)} ${f1(18 + r() * 26)}`;
      }
      s += line(d, ok ? G[1] : '#7d6650', ok ? 0.8 : 1);
      if (!ok) {
        const q = [];
        for (let i = 0; i < 90; i++) { const v = VINES[2 + (i % 8)], [x, y] = v.pts[Math.floor(r() * v.pts.length)]; q.push([x + (r() - 0.5) * 14, y + r() * 16 - 3]); }
        s += `${specks(q.filter((_, i) => i % 3), '#8f8056', 3.4)}${specks(q.filter((_, i) => !(i % 3)), '#6f7a4c', 3)}`;
      } else if (SEASON === 'spring') s += specks(LEAFY[0].slice(0, 60), '#8fbb6a', 2) + specks(LEAFY[1].filter((_, i) => i % 5 === 0), LILAC[3], 2.4);
      else s += specks(LEAFY[0], G[1], 3) + specks(LEAFY[1], G[2], 2.6);
    } else if (SEASON === 'spring') {
      s += specks(LEAFY[2].filter((_, i) => i % 3 === 0), '#a7cc82', 2.2);
      const cls = ['', ' b', ' c'];
      FLOWERS.forEach((g, i) => { s += `<g class="wm-sway${cls[i]}">${specks(g[0], LILAC[2], 3.3)}${specks(g[1], LILAC[3], 3)}${specks(g[2], LILAC[4], 2.3)}${specks(g[0].filter((_, k) => k % 3 === 0), LILAC[0], 1.5)}${specks(g[1].filter((_, k) => k % 3 === 0), LILAC[1], 1.3)}</g>`; });
    } else if (SEASON === 'summer') {
      s += specks(LEAFY[0], G[0], 3.4) + specks(LEAFY[1], G[1], 3) + specks(LEAFY[2], G[2], 2.2);
      s += specks(LEAFY[1].filter((_, i) => i % 11 === 0), LILAC[2], 2);
    } else if (SEASON === 'autumn') {
      s += specks(LEAFY[0], '#b58f34', 3.2) + specks(LEAFY[1], '#d9b048', 2.8) + specks(LEAFY[2], '#ecd06c', 2);
    } else s += VINES.slice(2).map((v) => line(v.d, SNOW, 0.9, 0.9)).join('');
    return s + '</g>';
  }

  function house(st, C) {
    return `${roofs()}${tower()}${clock(st)}${walls()}${ballroom(st)}${chandelier(st)}${tallGlass(TALLX, 'winLeft', st)}${library(st)}${tallGlass(TALLX.map(mir), 'winRight', st)}
      ${portraits(st)}${plainUpper(mir(TALLX[2]))}${plainUpper(mir(TALLX[1]))}${study(st)}${hallWindow()}${door(st, C)}${portico()}${wisteria(st)}${terrace()}`;
  }

  // the shapes the grounds are laid out on: the lake, the lawn and the fountain's basin
  const LAKE_D = 'M-8 448 Q30 434 92 438 Q150 440 198 458 Q236 474 226 492 Q212 514 140 516 Q60 518 -8 510Z';
  const LAWN_D = 'M128 352 H272 L300 476 L250 524 H-6 V394 H118 Z';
  const FOUNT = { x: 200, y: 338, rx: 46, ry: 14 };
  const tuftsAt = (list) => list.map(([x, y]) => `M${f1(x)} ${f1(y)}l-2 -4M${f1(x)} ${f1(y)}l.6 -5M${f1(x)} ${f1(y)}l2.4 -3.4`).join('');
  const drifts = (x0, x1, y0, y1, n, seed) => {
    const r = U.rng(seed), l = [];
    for (let i = 0; i < n; i++) l.push([x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 10 + r() * 16, 2 + r() * 2]);
    return ovals(l, '#dfe8f1');
  };
  // ---------------------------------------------------------------- the lawn
  // The great lawn rolls down from the fountain to the lake. Mown, it carries
  // long stripes that run away towards the house.
  function lawn(st) {
    const p = pend(st, 'lawn'), ok = st.lawn, base = HILL[SEASON][1], r = U.rng(521);
    const col = ok ? U.shade(base, SEASON === 'autumn' ? -0.02 : 0.08) : U.mix(base, '#b7ac6a', 0.5);
    let s = `<g data-part="lawn">${shape(LAWN_D, col)}`;
    if (ok && p !== 'snow') {
      let d = '';
      for (let i = -8; i <= 8; i += 2) d += poly([[200, 40], [200 + i * 48, 560], [200 + (i + 1) * 48, 560]]);
      s += `<g clip-path="${url('LawnEdge')}">${shape(d, U.shade(col, winter() ? -0.02 : -0.1), p === 'grow' ? ' opacity="0.5"' : '')}</g>`;
    }
    if (!ok || p === 'grow') {
      const n = ok ? 26 : 70, t = [], y = [], w = [];
      for (let i = 0; i < n; i++) t.push([20 + r() * 270, 396 + r() * 124]);
      for (let i = 0; i < n / 2; i++) (i % 2 ? y : w).push([40 + r() * 240, 400 + r() * 110]);
      s += `${line(tuftsAt(t), ok ? U.shade(col, -0.2) : '#8a8a4a', 0.9)}${specks(y, '#f2cf4a', 2.4)}${specks(w, '#fbfbf2', 2)}`;
      if (!ok) s += ovals([[176, 410, 7, 3], [232, 470, 8, 3.4], [116, 470, 6, 2.6], [216, 392, 5, 2.2]], '#7d6548');
    }
    if (p === 'leaves') s += shape(LAWN_D, url('Leaves'));
    else if (p === 'snow') s += `${shape(LAWN_D, SNOW, ' opacity="0.96"')}${drifts(30, 290, 380, 510, 12, 77)}`;
    else if (winter()) s += `${shape(LAWN_D, SNOW, ' opacity="0.74"')}${drifts(30, 290, 380, 510, 7, 78)}${line('M214 372 Q226 410 206 440 T170 470', '#a7b0b9', 1.8, 0.26)}`;
    else if (SEASON === 'autumn' && ok) { for (let i = 0; i < 12; i++) s += leaf(30 + r() * 250, 390 + r() * 120, r() * 180, U.pick(r, FALL), 2.6); }
    else if (SEASON === 'spring' && ok) {
      const d = DRIVE_C.filter((_, i) => i > 2 && i < 26).flatMap(([x, y, w], i) => [[x - w / 2 - 4 - (i % 3) * 1.6, y + (i % 2)], [x - w / 2 - 9 - (i % 2) * 2, y + 2]]);
      s += `${specks([[120, 420], [150, 468], [242, 398], [226, 436], [186, 404], [96, 488], [60, 416]], '#fbfbf2', 1.8)}${specks(d.map(([x, y]) => [x, y + 1.6]), '#6f9a4a', 1.6)}${specks(d, '#f6cf3e', 2.2)}${specks(d, '#e9962e', 0.8)}`;
    }
    return s + '</g>';
  }
  // ---------------------------------------------------------- the gravel drive
  // from the ring round the fountain down to the gate: x, y and width
  const DRIVE = [[252, 346, 18], [274, 382, 24], [288, 422, 32], [280, 462, 42], [258, 502, 54], [238, 548, 74]];
  const DRIVE_C = curve(DRIVE, 6);
  const DRIVE_D = poly(DRIVE_C.map(([x, y, w]) => [x - w / 2, y]).concat(DRIVE_C.slice().reverse().map(([x, y, w]) => [x + w / 2, y])));
  const RING = { x: 200, y: 338, rx: 104, ry: 33 };
  const driveLine = (k) => `M${DRIVE_C.map(([x, y, w]) => `${f1(x + (w / 2) * k)} ${f1(y)}`).join('L')}`;
  function drive(st) {
    const p = pend(st, 'drive'), ok = st.drive, { x, y, rx, ry } = RING, r = U.rng(611);
    const ring = `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"`, kerb = ok ? '#c9b48c' : '#8f866c';
    const edge = (more) => `${ring}${more}/><path d="${DRIVE_D}"${more}/>`;
    let s = `<g data-part="drive">${edge(` fill="${kerb}" stroke="${kerb}" stroke-width="3.4"`)}${edge(` fill="${ok ? url('Gravel') : url('GravelOld')}"`)}`;
    if (ok && p !== 'snow' && p !== 'grow') {
      // raked in long lines
      let d = '';
      for (const k of [0.62, 0.74, 0.86]) d += `M${x - rx * k} ${y}a${f1(rx * k)} ${f1(ry * k)} 0 1 0 ${f1(rx * k * 2)} 0a${f1(rx * k)} ${f1(ry * k)} 0 1 0 ${f1(-rx * k * 2)} 0`;
      for (const k of [-0.7, -0.35, 0, 0.35, 0.7]) d += driveLine(k);
      s += line(d, '#b89f70', 0.6, 0.55);
    }
    if (!ok || p === 'grow') {
      const t = [];
      for (let i = 0; i < (ok ? 12 : 34); i++) { const c = DRIVE_C[Math.floor(r() * DRIVE_C.length)]; t.push([c[0] + (r() - 0.5) * c[2] * 0.9, c[1] + r() * 4]); }
      for (let i = 0; i < (ok ? 6 : 16); i++) { const a = r() * Math.PI * 2; t.push([x + Math.cos(a) * rx * (0.6 + r() * 0.36), y + Math.sin(a) * ry * (0.6 + r() * 0.36)]); }
      s += line(tuftsAt(t), ok ? '#7f9a4e' : '#6f8a3e', 1);
      if (!ok) s += `${ovals([[284, 430, 11, 3.4], [262, 486, 15, 4], [128, 340, 12, 3.4], [270, 328, 10, 3], [244, 524, 16, 4]], '#8f8f88', 0.75)}${ovals([[282, 429, 6, 1.4], [259, 485, 8, 1.6], [126, 339, 6, 1.4]], '#c9d6dc', 0.7)}${line(driveLine(-0.34) + driveLine(0.32), '#8a7a5c', 1.2, 0.5)}`;
    }
    if (p === 'leaves') s += edge(` fill="${url('Leaves')}"`);
    else if (p === 'snow') s += `${edge(` fill="${SNOW}"`)}${drifts(120, 290, 320, 360, 5, 79)}${drifts(262, 300, 400, 500, 4, 80)}`;
    else if (winter()) s += `${line(driveLine(-0.98) + driveLine(0.98), SNOW, 3)}<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="none" stroke="${SNOW}" stroke-width="3"/>`;
    else if (SEASON === 'autumn') for (let i = 0; i < 10; i++) { const c = DRIVE_C[Math.floor(r() * DRIVE_C.length)]; s += leaf(c[0] + (r() - 0.5) * c[2], c[1], r() * 180, U.pick(r, FALL), 2.8); }
    return s + '</g>';
  }

  // ---------------------------------------------------------------- the maze
  // A real maze, grown once from a fixed seed: every cell can be reached and
  // there is one way in from the near side. Seen from the gate the far end looks
  // narrower. Overgrown, the hedges swell until the paths close up.
  const MZ = { w: 7, h: 6, fl: [68, 310], fr: [136, 310], nr: [114, 392], nl: [24, 392], widen: 1.32 };
  const mzP = (u, v) => {
    const t = persp(v, MZ.widen), a = U.lerp(MZ.fl[0], MZ.nl[0], t), b = U.lerp(MZ.fr[0], MZ.nr[0], t);
    return [U.lerp(a, b, u), U.lerp(MZ.fl[1], MZ.nl[1], t)];
  };
  const MAZE_WALLS = (() => {
    const { w, h } = MZ, r = U.rng(1920), seen = new Set(), openE = new Set(), openS = new Set(), key = (i, j) => `${i},${j}`;
    const stack = [[3, 3]];
    seen.add(key(3, 3));
    while (stack.length) {
      const [i, j] = stack[stack.length - 1];
      const next = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => [i + a, j + b]).filter(([a, b]) => a >= 0 && b >= 0 && a < w && b < h && !seen.has(key(a, b)));
      if (!next.length) { stack.pop(); continue; }
      const [a, b] = next[Math.floor(r() * next.length)];
      if (a !== i) openE.add(key(Math.min(a, i), j)); else openS.add(key(i, Math.min(b, j)));
      seen.add(key(a, b)); stack.push([a, b]);
    }
    const seg = (a, b, c, d) => `M${mzP(a / w, b / h).map(f1).join(' ')}L${mzP(c / w, d / h).map(f1).join(' ')}`;
    let d = '';
    for (let i = 0; i < w; i++) {
      d += seg(i, 0, i + 1, 0);
      if (i !== 3) d += seg(i, h, i + 1, h);
      for (let j = 0; j < h - 1; j++) if (!openS.has(key(i, j))) d += seg(i, j + 1, i + 1, j + 1);
    }
    for (let j = 0; j < h; j++) {
      d += seg(0, j, 0, j + 1) + seg(w, j, w, j + 1);
      for (let i = 0; i < w - 1; i++) if (!openE.has(key(i, j))) d += seg(i + 1, j, i + 1, j + 1);
    }
    return d;
  })();
  function maze(st) {
    const p = pend(st, 'maze'), ok = st.maze, G = GREEN[SEASON], r = U.rng(733), w = winter();
    const dark = ok ? G[0] : U.mix(G[0], '#70704a', 0.4), mid = ok ? G[1] : U.mix(G[1], '#8a8a58', 0.4), top = ok ? G[2] : U.mix(G[2], '#a09a68', 0.5);
    const base = poly([mzP(0, 0), mzP(1, 0), mzP(1, 1), mzP(0, 1)]);
    let s = `<g data-part="maze">${shape(base, '#00000018', ' transform="translate(3 3)"')}${shape(base, w ? '#e8edf2' : ok ? '#e2d3ae' : '#b5ab86')}`;
    s += `<g transform="translate(0 1.4)">${line(MAZE_WALLS, U.shade(dark, -0.16), 4.2)}</g>${line(MAZE_WALLS, dark, 3.8)}<g transform="translate(0 -1)">${line(MAZE_WALLS, w ? SNOW : mid, 3)}</g><g transform="translate(-.4 -1.5)">${line(MAZE_WALLS, w ? '#ffffff' : top, 1.2, 0.9)}</g>`;
    if (!ok || p === 'grow') {
      // shaggy growth closing up the paths
      const a = [], b = [], n = ok ? 18 : 90;
      for (let i = 0; i < n; i++) { const q = mzP(r(), r()); (i % 3 ? a : b).push([q[0], q[1] - 1, ok ? 1.8 : 2.6 + r() * 3.2, ok ? 1.4 : 2 + r() * 2]); }
      s += ovals(a, mid) + ovals(b, top, 0.9);
    }
    const [cx, cy] = mzP(3.5 / 7, 3.5 / 6);
    if (ok) s += `<g pointer-events="none">${oval(cx, cy + 1, 8, 2.6, '#00000022')}${box(cx - 5.4, cy - 7, 1.6, 7, K.trim)}${box(cx + 3.8, cy - 7, 1.6, 7, K.trim)}${box(cx - 0.8, cy - 7, 1.6, 7, K.trim)}${shape(`M${cx - 7} ${cy - 7} Q${cx} ${cy - 17} ${cx + 7} ${cy - 7}Z`, winter() ? SNOW : K.gold)}${dot(cx, cy - 13.4, 1.1, K.gold)}${box(cx - 6.6, cy - 0.8, 13.2, 1.6, K.trim)}</g>`;
    const [gx, gy] = mzP(3.5 / 7, 1);
    s += `${box(gx - 9.4, gy - 8, 3, 9, K.trim)}${box(gx + 6.4, gy - 8, 3, 9, K.trim)}${dot(gx - 7.9, gy - 9.4, 2, K.trim)}${dot(gx + 7.9, gy - 9.4, 2, K.trim)}`;
    return s + '</g>';
  }

  // ------------------------------------------------------- the kitchen garden
  // A walled garden on the right of the fountain, with six beds and a cross of
  // paths. What grows in it follows the year; with a sowing or a planting job
  // waiting the beds lie raked and bare.
  const KG = { fl: [286, 314], fr: [372, 314], nr: [400, 364], nl: [302, 364], widen: 1.16 };
  const kgP = (u, v) => {
    const t = persp(v, KG.widen), a = U.lerp(KG.fl[0], KG.nl[0], t), b = U.lerp(KG.fr[0], KG.nr[0], t);
    return [U.lerp(a, b, u), U.lerp(KG.fl[1], KG.nl[1], t)];
  };
  const BEDS = (() => {
    const out = [];
    for (const [v0, v1] of [[0.06, 0.3], [0.38, 0.62], [0.7, 0.94]]) for (const [u0, u1] of [[0.05, 0.46], [0.54, 0.95]]) out.push({ u0, u1, v0, v1 });
    return out;
  })();
  const inBed = (b, a, c) => kgP(U.lerp(b.u0, b.u1, a), U.lerp(b.v0, b.v1, c));
  const pumpkin = (x, y, k) => `${oval(x, y, 3.6 * k, 2.8 * k, '#e08a2e')}${line(`M${f1(x - 1.4 * k)} ${f1(y - 2.4 * k)}q-1 ${f1(2.4 * k)} 0 ${f1(4.8 * k)}M${f1(x + 1.4 * k)} ${f1(y - 2.4 * k)}q1 ${f1(2.4 * k)} 0 ${f1(4.8 * k)}`, '#b9651e', 0.5)}${box(x - 0.5, y - 3.8 * k, 1, 1.4, '#5f7a3a')}`;
  function garden(st) {
    const p = pend(st, 'garden'), ok = st.garden, w = winter(), r = U.rng(823), G = GREEN[SEASON];
    const ground = poly([kgP(0, 0), kgP(1, 0), kgP(1, 1), kgP(0, 1)]);
    let s = `<g data-part="garden">${shape(ground, w ? '#eef2f6' : ok ? '#e3d3ae' : '#b9ad8a')}`;
    // the old brick wall along the back and down the left side
    const bk = K.brick, top = U.shade(K.trim, -0.04);
    s += `${shape(poly([[284, 300], [374, 300], [374, 314], [284, 314]]), bk)}${line('M284 304.6 H374 M284 309 H374', '#00000030', 0.5)}${box(282, 298, 94, 2.8, top, ' rx="0.8"')}`;
    s += `${shape(poly([[284, 300], [302, 352], [302, 366], [284, 314]]), U.shade(bk, -0.14))}${line('M284 300 L302 352', top, 2.4)}`;
    if (w) s += `${box(281.6, 296.6, 94.8, 2.4, SNOW, ' rx="1"')}${line('M284 298.8 L302 351', SNOW, 2.4)}`;
    const bare = ok && p === 'grow';
    for (const b of BEDS) {
      s += shape(poly([inBed(b, 0, 0), inBed(b, 1, 0), inBed(b, 1, 1), inBed(b, 0, 1)]), w ? SNOW : ok ? '#8a6240' : '#a08c68');
      if (ok && !w) { let d = ''; for (const c of [0.25, 0.5, 0.75]) d += `M${inBed(b, 0.04, c).map(f1).join(' ')}L${inBed(b, 0.96, c).map(f1).join(' ')}`; s += line(d, '#6f4c30', 0.5, bare ? 0.9 : 0.5); }
    }
    if (!ok) {
      // run to seed: weeds, thistles and an old cold frame
      const t = [], th = [];
      for (let i = 0; i < 44; i++) t.push(kgP(r(), r()));
      for (let i = 0; i < 9; i++) th.push(kgP(r(), r()));
      s += `${line(tuftsAt(t), '#7a8a48', 1)}${specks(th, '#a585b5', 2.4)}${specks(t.filter((_, i) => i % 5 === 0).map(([x, y]) => [x, y - 3]), '#8f9a58', 3.4)}`;
    } else if (bare) {
      // raked and ready, with a row marker on each bed
      for (const b of BEDS) { const [x, y] = inBed(b, 0.08, 0.5); s += `${line(`M${f1(x)} ${f1(y)} v-4`, '#a58a64', 0.8)}${box(x - 1.6, y - 6, 3.2, 2.4, '#f4efe2')}`; }
      const [x, y] = kgP(0.5, 0.82);
      s += `${line(`M${f1(x)} ${f1(y)} l3 -12`, '#8a6240', 1.2)}${shape(`M${f1(x - 2)} ${f1(y)} h4 l-1 5 h-2Z`, '#7f8a92')}`;
    } else if (SEASON === 'spring') {
      const a = [];
      BEDS.forEach((b) => { for (const c of [0.25, 0.5, 0.75]) for (let i = 0; i < 7; i++) a.push(inBed(b, 0.1 + i * 0.13, c)); });
      s += specks(a, '#9ccb6a', 2) + specks(a.filter((_, i) => i % 3 === 0).map(([x, y]) => [x + 0.8, y - 0.8]), '#c6e39a', 1.2);
    } else if (SEASON === 'summer') {
      // lettuces, carrot tops and two wigwams of beans
      const a = [], b = [], c = [];
      BEDS.forEach((bd, i) => { if (i === 1 || i === 4) return; for (const v of [0.3, 0.7]) for (let k = 0; k < 5; k++) (i % 2 ? b : a).push(inBed(bd, 0.12 + k * 0.19, v)); });
      s += `${ovals(a.map(([x, y]) => [x, y, 2.8, 2]), '#7fb65c')}${ovals(a.map(([x, y]) => [x, y - 0.4, 1.4, 1]), '#b4dc88')}${specks(b, '#5f9a48', 3)}`;
      for (const i of [1, 4]) for (const u of [0.25, 0.75]) { const [x, y] = inBed(BEDS[i], u, 0.8); s += `${line(`M${f1(x - 4)} ${f1(y)} L${f1(x)} ${f1(y - 14)} L${f1(x + 4)} ${f1(y)} M${f1(x)} ${f1(y - 14)} V${f1(y)}`, '#a58a64', 0.7)}`; for (let k = 0; k < 9; k++) c.push([x + (r() - 0.5) * 8 * (k / 9 + 0.3), y - k * 1.5]); }
      s += `${specks(c, '#4f8a4a', 3)}${specks(c.filter((_, i) => i % 3 === 0), '#e5675a', 1.2)}`;
    } else if (SEASON === 'autumn') {
      BEDS.forEach((bd, i) => {
        if (i % 2 === 0) for (const [a, c] of [[0.2, 0.3], [0.55, 0.6], [0.85, 0.25], [0.3, 0.8]]) { const [x, y] = inBed(bd, a, c); s += pumpkin(x, y, 1 + (i % 3) * 0.14); }
        else { const l = []; for (const c of [0.3, 0.7]) for (let k = 0; k < 5; k++) l.push(inBed(bd, 0.12 + k * 0.19, c)); s += `${ovals(l.map(([x, y]) => [x, y, 2.6, 2]), '#6f9a7a')}${ovals(l.map(([x, y]) => [x, y - 0.4, 1.2, 0.9]), '#a6c6a0')}`; }
      });
    } else {
      // glass cloches under the snow
      BEDS.forEach((b, i) => { if (i % 2) return; const [x, y] = inBed(b, 0.5, 0.6); s += `${shape(`M${f1(x - 6)} ${f1(y)} Q${f1(x)} ${f1(y - 11)} ${f1(x + 6)} ${f1(y)}Z`, '#cfe6ee', ' opacity="0.8"')}${line(`M${f1(x - 6)} ${f1(y)} Q${f1(x)} ${f1(y - 11)} ${f1(x + 6)} ${f1(y)}`, '#fff', 0.6)}`; });
    }
    // a low clipped hedge along the near side, with a way in on the left
    const [hx, hy] = kgP(0.2, 1);
    s += `${line(`M${f1(hx + 7)} ${f1(hy)} L400 ${hy}`, U.shade(G[0], -0.1), 5)}<g transform="translate(0 -1.2)">${line(`M${f1(hx + 7)} ${f1(hy)} L400 ${hy}`, w ? SNOW : ok ? G[1] : '#8a8a58', 4)}</g>`;
    return s + '</g>';
  }

  // -------------------------------------------------------------- the orchard
  const TREES = [[330, 394, 0.86], [372, 390, 0.84], [318, 424, 0.82], [356, 428, 0.92], [396, 426, 0.92]];
  function appleTree(x, y, k, i, ok) {
    const G = GREEN[SEASON], w = winter(), sp = SEASON === 'spring', au = SEASON === 'autumn', r = U.rng(90 + i);
    const crowns = [[0, -30, 19, 15], [-12, -24, 13, 11], [12, -24, 13, 11], [0, -20, 15, 10]];
    const bark = '#6f5a48';
    let s = `<g transform="translate(${x} ${y}) scale(${k})">${oval(2, 1, 16, 3.4, '#00000022')}${line('M0 0 Q-2 -8 0 -16', bark, 4)}`;
    if (w) {
      s += line('M0 -14 Q-10 -22 -16 -32 M-8 -22 L-6 -36 M0 -15 Q2 -28 0 -44 M1 -26 L10 -38 M0 -14 Q10 -18 18 -30', bark, 1.6);
      s += line('M-16 -32 l-3 -4 M-6 -36 l3 -4 M10 -38 l3 -4 M18 -30 l2 -4', bark, 0.9);
      s += line('M-14 -33 L-8 -23 M-5 -37 L-6 -28 M1 -44 L1 -32 M11 -38 L5 -32 M17 -31 L10 -22', SNOW, 1, 0.9);
      return s + '</g>';
    }
    const base = sp ? '#f6dfe6' : au ? '#b5ae56' : G[1], dk = sp ? '#e6c0cf' : au ? '#8f8a40' : G[0], lt = sp ? '#fff5f4' : au ? '#d9c766' : G[2];
    s += line('M0 -14 Q-6 -18 -10 -24 M0 -15 Q6 -18 9 -24', bark, 1.8);
    s += ovals(crowns.map(([a, b, c, d]) => [a, b + 2, c, d]), ok ? dk : U.mix(dk, '#8a8058', 0.4));
    s += ovals(crowns.map(([a, b, c, d]) => [a, b, c - 1, d - 1]), ok ? base : U.mix(base, '#9a9060', 0.4));
    s += ovals([[-6, -35, 8, 5], [8, -30, 6, 4], [-14, -27, 5, 3.4]], ok ? lt : U.mix(lt, '#a8a070', 0.4), 0.9);
    if (!sp) {
      const a = [];
      for (let n = 0; n < (au ? 13 : 7); n++) a.push([(r() - 0.5) * 34, -16 - r() * 24]);
      s += specks(a, '#c9382f', 2.6) + specks(a.map(([p, q]) => [p - 0.5, q - 0.5]), '#ef8a78', 0.8);
    } else {
      const a = [];
      for (let n = 0; n < 16; n++) a.push([(r() - 0.5) * 36, -14 - r() * 28]);
      s += specks(a, '#ffffff', 2) + specks(a.filter((_, n) => n % 3 === 0), '#f2a6b8', 1.2);
    }
    if (!ok) s += line('M-16 -28 l-6 -8 M14 -34 l6 -8 M-2 -44 l-2 -6', bark, 1); // unpruned
    return s + '</g>';
  }
  function orchard(st) {
    const p = pend(st, 'orchard'), ok = st.orchard, w = winter(), r = U.rng(907), grass = HILL[SEASON][2];
    const fallen = !ok || p === 'grow';
    let s = `<g data-part="orchard">${shape('M304 372 H406 V462 H312 Q306 420 296 396Z', w ? '#e6edf4' : U.mix(grass, ok ? '#7fb65c' : '#a3a05c', 0.3))}`;
    if (!ok) { const t = []; for (let i = 0; i < 34; i++) t.push([306 + r() * 94, 376 + r() * 84]); s += line(tuftsAt(t), '#8a8a4a', 0.9); }
    TREES.forEach(([x, y, k], i) => { s += appleTree(x, y, k, i, ok); });
    if (fallen && !w) {
      const a = [];
      for (let i = 0; i < (ok ? 16 : 28); i++) a.push([308 + r() * 90, 400 + r() * 62]);
      s += `${specks(a.map(([x, y]) => [x + 0.4, y + 0.8]), '#00000030', 3.6)}${specks(a, '#c9382f', 3.2)}${specks(a.map(([x, y]) => [x - 0.7, y - 0.7]), '#ef9a88', 1)}`;
    } else if (ok && !w) {
      // the windfalls gathered into a basket under the trees
      const x = 340, y = 444;
      s += `${shadow(x, y + 3, 10, 2)}${shape(`M${x - 8} ${y - 5} L${x - 6} ${y + 3} H${x + 6} L${x + 8} ${y - 5}Z`, '#b5864f')}${line(`M${x - 7.4} ${y - 2} H${x + 7.4} M${x - 6.6} ${y + 1} H${x + 6.6}`, '#8a6240', 0.7)}${specks([[x - 5, y - 6], [x - 1.6, y - 6.4], [x + 2, y - 6], [x + 5, y - 5.6], [x, y - 8.4], [x - 3.2, y - 8], [x + 3.2, y - 8]], SEASON === 'spring' ? '#c9b48c' : '#c9382f', 3.2)}<path d="M${x - 7} ${y - 5} Q${x} ${y - 16} ${x + 7} ${y - 5}" fill="none" stroke="#8a6240" stroke-width="1.1"/>`;
    }
    return s + '</g>';
  }

  // ----------------------------------------------------------------- the lake
  const wave = (x, y, n, l, a) => `M${f1(x)} ${f1(y)} q${f1(l / 2)} ${f1(-a)} ${f1(l)} 0${` t${f1(l)} 0`.repeat(n - 1)}`;
  const glint = (x, y, r) => { const a = f1(r * 0.8), b = f1(r * 0.2); return `<path class="wm-glint" d="M${f1(x)} ${f1(y - r)}l${b} ${a}l${a} ${b}l${-a} ${b}l${-b} ${a}l${-b} ${-a}l${-a} ${-b}l${a} ${-b}Z" fill="#fff"/>`; };
  const lily = (x, y, k, flower) => `${shape(`M${x} ${y} l${f1(6 * k)} ${f1(-1.4 * k)} a${f1(6.4 * k)} ${f1(2.6 * k)} 0 1 1 ${f1(-1 * k)} ${f1(2.8 * k)}Z`, '#5f9a6a')}${flower ? `${dot(x + 2, y - 1, 1.8 * k, '#fff4f6')}${dot(x + 2, y - 1, 0.8 * k, '#f2c14e')}` : ''}`;
  function lake(st) {
    const p = pend(st, 'lake'), ok = st.lake, w = winter(), r = U.rng(1009);
    let s = `<g data-part="lake"><path d="${LAKE_D}" fill="none" stroke="${w ? '#d3dde7' : '#6f8a58'}" stroke-width="7"/><path d="${LAKE_D}" fill="${ok ? url('Lake') : url('Murk')}" stroke="${w ? '#eef2f6' : ok ? '#dcc9a2' : '#a39a6a'}" stroke-width="2"/><g clip-path="${url('Pond')}">`;
    if (ok && w) {
      // frozen over: long scratches in the ice and a little blown snow
      s += `${line('M20 482 Q70 470 130 486 T214 478 M40 498 Q90 490 150 500', '#fff', 0.8, 0.9)}${line('M60 466 l18 10 l-6 12 M170 476 l14 8', '#b9cfdf', 0.6)}${ovals([[50, 500, 30, 4], [172, 500, 34, 4], [130, 462, 24, 3]], SNOW, 0.9)}`;
    } else if (ok) {
      // the sky lying on the water, ripples and a few lilies
      s += `${ovals([[130, 470, 44, 5], [160, 490, 30, 3.6], [60, 496, 36, 4]], '#ffffff', 0.34)}`;
      let a = '', b = '';
      for (let i = 0; i < 9; i++) { const y = 456 + i * 6.4, x = -10 + r() * 60; const q = wave(x + (i % 3) * 56, y, 3, 11, 1.4) + wave(x + 120, y + 2, 2, 12, 1.4); if (i % 2) a += q; else b += q; }
      s += `<g class="wm-ripple">${line(a, '#fff', 0.8, 0.5)}</g><g class="wm-ripple b">${line(b, '#3f8fae', 0.7, 0.35)}</g>`;
      for (let i = 0; i < 7; i++) s += glint(30 + r() * 180, 460 + r() * 46, 2.6 + r() * 1.6);
      if (SEASON !== 'autumn') s += `${lily(150, 462, 1.1, true)}${lily(166, 470, 0.9, false)}${lily(178, 464, 0.9, true)}${lily(40, 492, 1.2, false)}${lily(58, 500, 1, true)}`;
    } else {
      // choked with weed and scum
      s += ovals([[70, 462, 36, 8], [160, 482, 44, 10], [40, 500, 34, 7], [120, 506, 30, 5], [206, 480, 18, 8]], '#4f6a3a', 0.7);
      s += ovals([[110, 470, 26, 5], [186, 468, 18, 4], [90, 492, 22, 5]], '#a3ae62', 0.7);
      const q = [];
      for (let i = 0; i < 26; i++) q.push([10 + r() * 210, 448 + r() * 62]);
      s += `${specks(q, '#c1c47a', 2.2)}${lily(150, 466, 1.2, false)}${lily(84, 500, 1.2, false)}${lily(196, 486, 1, false)}`;
      if (w) s += `${shape(LAKE_D, '#e6eef4', ' opacity="0.78"')}${ovals([[60, 480, 40, 5], [160, 496, 40, 5]], SNOW, 0.9)}`;
    }
    if (ok && p === 'grow') { const q = []; for (let i = 0; i < 90; i++) q.push([6 + r() * 215, 446 + r() * 66]); s += `${ovals([[120, 490, 70, 14], [60, 470, 40, 8]], '#8fbb5a', 0.5)}${specks(q, '#8fbb5a', 2.6)}${specks(q.filter((_, i) => i % 2), '#c6dc78', 1.5)}`; }
    else if (p === 'leaves') s += shape(LAKE_D, url('Leaves'), ' opacity="0.9"');
    s += '</g>';
    // reeds and bulrushes where the lake runs out to a point
    const reed = w ? '#b9b2a2' : SEASON === 'autumn' ? '#b5a258' : '#6f9a5a';
    s += line('M214 462 q-3 -10 -1 -18 M219 466 q1 -12 4 -20 M224 470 q3 -9 7 -14 M231 480 q2 -8 7 -12 M204 456 q-1 -8 -4 -14 M232 494 q4 -6 9 -8', reed, 1.2);
    s += `${box(212, 442, 2.4, 7, '#7a5a3c', ' rx="1"')}${box(222, 444, 2.4, 7, '#7a5a3c', ' rx="1"')}${box(236.6, 464, 2.4, 6, '#7a5a3c', ' rx="1"')}`;
    return s + '</g>';
  }
  // the boathouse stands on piles at the head of the lake, gable to the water
  const BOAT = { x: 62, y: 466, w: 60, h: 28 };
  function boathouse(st, C) {
    const p = pend(st, 'boathouse'), ok = st.boathouse, { x, y, w, h } = BOAT, x0 = x - w / 2, x1 = x + w / 2, top = y - h, peak = top - 25;
    const col = ok ? C.manorBoathouse : U.mix(C.manorBoathouse, '#a59e90', 0.62), dk = U.shade(col, -0.24), lt = U.shade(col, 0.16), trim = ok ? '#fbf3e0' : '#b9b19f';
    const roof = U.mix(K.slate, '#6f6a5c', ok ? 0.2 : 0.6), roofD = U.shade(roof, -0.16), back = [11, -30];
    let s = `<g data-part="boathouse">`;
    if (st.lake && !winter()) s += `<g clip-path="${url('Pond')}" pointer-events="none">${shape(poly([[x0, y], [x1, y], [x1, y + h - 4], [x, y + h + 18], [x0, y + h - 4]]), col, ' opacity="0.24"')}</g>`;
    for (const px of [x0 + 3, x + 16, x1 - 3, x - 16]) s += box(px - 1.4, y - 2, 2.8, 8, '#5f4a38');
    // the long side and the roof running back up the bank
    s += shape(poly([[x1, top], [x1 + back[0], top + back[1]], [x1 + back[0], y + back[1]], [x1, y]]), dk);
    let d = '';
    for (let i = 1; i < 5; i++) d += `M${f1(x1 + (back[0] * i) / 5)} ${f1(top + (back[1] * i) / 5)} V${f1(y + (back[1] * i) / 5)}`;
    s += line(d, '#00000030', 0.6);
    s += shape(poly([[x, peak], [x + back[0], peak + back[1]], [x1 + back[0] + 3, top + back[1] + 1], [x1 + 3, top + 1]]), roof);
    d = '';
    for (let i = 1; i < 7; i++) { const t = i / 7; d += `M${f1(U.lerp(x, x1 + 3, t))} ${f1(U.lerp(peak, top + 1, t))} l${back[0]} ${back[1]}`; }
    s += line(d, '#000', 0.5, 0.16);
    // the gable end with its water door
    s += shape(poly([[x0, y], [x0, top], [x, peak], [x1, top], [x1, y]]), col);
    d = '';
    for (let a = x0 + 5; a < x1; a += 5) { const q = peak + (Math.abs(a - x) / (w / 2)) * (top - peak); d += `M${a} ${f1(q)} V${y}`; }
    s += line(d, dk, 0.5, 0.8);
    s += shape(`M${x - 17} ${y} V${y - 15} A17 15 0 0 1 ${x + 17} ${y - 15} V${y}Z`, '#2f3d48');
    s += `<path d="M${x - 17} ${y} V${y - 15} A17 15 0 0 1 ${x + 17} ${y - 15} V${y}" fill="none" stroke="${trim}" stroke-width="1.8"/>`;
    s += `${shape(`M${x - 15} ${y} q15 -6 30 0Z`, ok ? '#5fa0be' : '#5f7a4a', ' opacity="0.8"')}${dot(x, peak + 14, 4.6, trim)}${dot(x, peak + 14, 3.4, ok ? '#a9cbd8' : '#7a7f60')}${line(`M${x - 3.4} ${peak + 14} H${x + 3.4} M${x} ${peak + 10.6} V${peak + 17.4}`, trim, 0.6)}`;
    s += line(`M${x0 - 3} ${top + 2.4} L${x} ${peak - 1} L${x1 + 3} ${top + 2.4}`, ok ? trim : '#8f8a78', 2.4);
    s += line(`M${x0 - 3} ${top + 2.4} L${x} ${peak - 1}`, roofD, 0.6, 0.5);
    if (!ok) {
      // missing boards, a sag in the roof and moss along the slope
      s += `${box(x0 + 4, top + 3, 3.4, 13, '#2f3d48')}${box(x1 - 9, top + 6, 3.4, 16, '#2f3d48')}${shape(`M${x + 20} ${peak + 8} l9 -3 l6 7 l-8 5Z`, '#3f4852')}${ovals([[x + 24, peak - 7, 10, 3], [x + 46, peak + 1, 8, 2.4]], '#7f8f4e', 0.7)}${line(`M${x1 - 6} ${y} l3 -8 M${x0 + 12} ${y - 2} l-2 -8`, '#2f3d48', 1)}`;
    } else if (p === 'grow') s += shape(poly([[x0, y], [x0, top], [x, peak], [x1, top], [x1, y]]), FADE, ' opacity="0.5"');
    if (winter()) s += `${shape(poly([[x, peak - 2], [x + back[0], peak + back[1] - 2], [x1 + back[0] + 4, top + back[1]], [x1 + 4, top]]), SNOW)}${line(`M${x0 - 3} ${top + 1.4} L${x} ${peak - 2}`, SNOW, 2.2)}`;
    return s + '</g>';
  }

  // --------------------------------------------------------------- the topiary
  // Clipped box in four shapes down both sides of the lawn; left to itself each
  // one loses its line and grows into a shaggy lump.
  const CLIPS = [[136, 374, 'cone'], [124, 396, 'ball'], [112, 424, 'twirl'], [128, 448, 'cone'], [240, 374, 'ball'], [254, 396, 'cone'], [260, 424, 'twirl']];
  function bush(x, y, kind, ok, shoots, i) {
    const G = GREEN[SEASON], k = scaleAt(y) * 1.5, r = U.rng(40 + i), w = winter();
    const d = U.shade(G[0], -0.08), m = ok ? G[1] : U.mix(G[1], '#8a8a58', 0.4), l = ok ? G[2] : U.mix(G[2], '#a09a68', 0.5);
    let s = `<g transform="translate(${x} ${y}) scale(${f1(k)})">${oval(2, 0.6, 11, 3, '#00000026')}${oval(0, 0, 9, 3, ok ? '#8a6240' : '#8f8664')}`;
    if (!ok) {
      const a = [];
      for (let n = 0; n < 14; n++) a.push([(r() - 0.5) * 20, -4 - r() * 18, 3 + r() * 3.4, 2.6 + r() * 3]);
      s += ovals(a.map(([p, q, c, e]) => [p, q + 1, c, e]), d) + ovals(a.slice(0, 9).map(([p, q, c, e]) => [p - 0.6, q - 0.8, c - 0.8, e - 0.8]), m) + line(`M-6 -14 l-5 -9 M4 -18 l3 -9 M9 -9 l6 -6 M-10 -6 l-5 -3`, m, 0.9);
      if (w) s += ovals([[-3, -20, 6, 2], [5, -13, 4.6, 1.6], [-7, -10, 4, 1.4]], SNOW);
      return s + '</g>';
    }
    if (kind === 'cone') s += `${box(-1.4, -4, 2.8, 4, '#6f5a48')}${shape('M0 -30 Q-7 -14 -9 -4 Q0 -1 9 -4 Q7 -14 0 -30Z', m)}${shape('M0 -30 Q-3 -14 -9 -4 Q-3 -3 -1 -3 Q1 -16 0 -30Z', l, ' opacity="0.8"')}${shape('M0 -30 Q7 -14 9 -4 Q5 -2 3 -3 Q5 -14 0 -30Z', d, ' opacity="0.7"')}`;
    else if (kind === 'ball') s += `${box(-1.2, -11, 2.4, 11, '#6f5a48')}${dot(0, -17, 10.4, d)}${dot(-0.4, -17.6, 9.8, m)}${dot(-3.4, -20.6, 4.8, l, 0.85)}`;
    else s += `${box(-1.2, -8, 2.4, 8, '#6f5a48')}${oval(0, -6, 9, 4, d)}${oval(-0.4, -7, 8.4, 3.6, m)}${oval(0, -14, 7, 3.4, d)}${oval(-0.4, -15, 6.4, 3, m)}${oval(0, -21, 5, 2.8, d)}${oval(-0.4, -22, 4.4, 2.4, m)}${dot(0, -28, 3, d)}${dot(-0.3, -28.6, 2.6, l)}${oval(-3, -8, 3, 1.4, l, 0.8)}${oval(-2, -16, 2.4, 1.1, l, 0.8)}`;
    if (shoots) s += `${line('M0 -30 l-2 -5 M-8 -6 l-5 -3 M8 -7 l5 -4 M-6 -14 l-5 -3 M6 -16 l5 -4', l, 0.9)}${line(tuftsAt([[-8, 1], [9, 2], [0, 3]]), '#7f9a4e', 0.9)}`;
    if (w) s += kind === 'ball' ? oval(0, -24, 8, 3.4, SNOW) : kind === 'cone' ? shape('M0 -30 Q-3 -20 -4 -14 Q0 -11 4 -14 Q3 -20 0 -30Z', SNOW) : `${oval(0, -9, 7, 1.8, SNOW)}${oval(0, -17, 5.4, 1.5, SNOW)}${oval(0, -24, 3.8, 1.2, SNOW)}${dot(0, -30, 2, SNOW)}`;
    return s + '</g>';
  }
  function topiary(st) {
    const p = pend(st, 'topiary'), ok = st.topiary;
    let s = '<g data-part="topiary">';
    CLIPS.forEach(([x, y, kind], i) => { s += bush(x, y, kind, ok, p === 'grow', i); });
    return s + '</g>';
  }

  // ------------------------------------------------------------- the fountain
  function fountain(st) {
    const p = pend(st, 'fountain'), ok = st.fountain, { x, y, rx, ry } = FOUNT, w = winter(), r = U.rng(1103);
    const stone = ok ? K.trim : U.mix(K.trim, '#8f8a78', 0.4), dk = U.shade(stone, -0.2), run = ok && !w && p !== 'leaves';
    const water = w ? (ok ? '#dfeaf2' : '#c3cfc9') : !ok ? '#6f7f4a' : p === 'grow' ? '#8fb49a' : '#79cfe4';
    let s = `<g data-part="fountain">${oval(x + 3, y + 7, rx + 4, ry + 3, '#00000022')}${oval(x, y + 4, rx + 1, ry + 1, dk)}${oval(x, y, rx + 1, ry + 1, stone)}${oval(x, y, rx - 3, ry - 2, water)}<g clip-path="${url('Basin')}">`;
    if (run) s += `${oval(x - 12, y - 2, 18, 3.4, '#ffffff', 0.3)}<ellipse class="wm-ring" cx="${x}" cy="${y + 1}" rx="24" ry="7" fill="none" stroke="#fff" stroke-width="0.9"/><ellipse class="wm-ring b" cx="${x}" cy="${y + 1}" rx="24" ry="7" fill="none" stroke="#fff" stroke-width="0.9"/>`;
    if (!ok) s += ovals([[x - 22, y + 3, 14, 3.4], [x + 20, y - 3, 12, 3]], '#4f6a3a', 0.7) + specks([[x - 30, y - 2], [x + 8, y + 7], [x + 30, y + 3], [x - 8, y - 7]], '#a3ae62', 2.4);
    if (p === 'leaves') s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${url('Leaves')}"/>`;
    else if (ok && p === 'grow') s += ovals([[x - 24, y + 2, 10, 2.4], [x + 22, y - 2, 9, 2]], '#6f9a5a', 0.6);
    s += '</g>';
    // the stem and two bowls
    s += `${shape(`M${x - 5} ${y + 2} Q${x - 2} ${y - 8} ${x - 2.4} ${y - 18} H${x + 2.4} Q${x + 2} ${y - 8} ${x + 5} ${y + 2}Z`, stone)}${shape(`M${x + 1} ${y + 2} Q${x + 1} ${y - 8} ${x + 1} ${y - 18} H${x + 2.4} Q${x + 2} ${y - 8} ${x + 5} ${y + 2}Z`, dk, ' opacity="0.5"')}${oval(x, y + 2, 8, 2.6, stone)}`;
    const bowl = (b, a, h) => `${shape(`M${x - a} ${b} Q${x - a * 0.5} ${b + h} ${x} ${b + h} Q${x + a * 0.5} ${b + h} ${x + a} ${b}Z`, dk)}${oval(x, b, a, a * 0.28, stone)}${oval(x, b, a - 1.6, a * 0.28 - 1, water)}`;
    s += bowl(y - 19, 18, 7);
    s += `${box(x - 1.6, y - 31, 3.2, 12, stone)}${box(x + 0.4, y - 31, 1.2, 12, dk, ' opacity="0.5"')}`;
    s += bowl(y - 31, 8.6, 4) + shape(`M${x - 2} ${y - 31} Q${x} ${y - 39} ${x + 2} ${y - 31}Z`, stone);
    if (run) {
      // water falling from the bowls and rising from the top
      s += line(`M${x - 17} ${y - 18} Q${x - 22} ${y - 9} ${x - 24} ${y + 1} M${x - 10} ${y - 15} Q${x - 13} ${y - 7} ${x - 15} ${y + 3} M${x + 10} ${y - 15} Q${x + 13} ${y - 7} ${x + 15} ${y + 3} M${x + 17} ${y - 18} Q${x + 22} ${y - 9} ${x + 24} ${y + 1} M${x - 8} ${y - 30} Q${x - 11} ${y - 25} ${x - 12} ${y - 20} M${x + 8} ${y - 30} Q${x + 11} ${y - 25} ${x + 12} ${y - 20}`, '#e8f8fc', 1, 0.85);
      s += line(`M${x} ${y - 37} V${y - 44} M${x} ${y - 39} Q${x - 4} ${y - 45} ${x - 6} ${y - 34} M${x} ${y - 39} Q${x + 4} ${y - 45} ${x + 6} ${y - 34}`, '#ffffff', 1, 0.9);
      for (const [a, b] of [[-22, -8], [-13, -6], [13, -6], [22, -8], [-10, -26], [10, -26], [-5, -38], [5, -38]]) s += `<circle class="wm-drop" cx="${x + a}" cy="${y + b}" r="0.9" fill="#fff"/>`;
    } else if (!ok) s += `${line(`M${x - 4} ${y - 8} l3 6 M${x + 1} ${y - 26} l-2 4`, '#6d675a', 0.7)}${oval(x + 6, y - 17, 7, 1.8, '#7f8f4e', 0.8)}${oval(x - 2, y - 30.4, 4, 1.2, '#7f8f4e', 0.8)}`;
    if (w) s += `${oval(x, y - 20, 16, 3.4, SNOW)}${oval(x, y - 32, 7.4, 1.8, SNOW)}${shape(`M${x - 2} ${y - 33} Q${x} ${y - 40} ${x + 2} ${y - 33}Z`, SNOW)}`;
    return s + '</g>';
  }

  // the old oak in the near corner, whose bough has room for a swing
  const OAK = { x: 356, y: 512 };
  function oak() {
    const { x, y } = OAK, w = winter(), au = SEASON === 'autumn', bark = '#6a5444';
    let s = `${oval(x - 8, y + 2, 56, 7, '#00000022')}${shape(`M${x - 13} ${y} Q${x - 7} ${y - 26} ${x - 7} ${y - 48} H${x + 8} Q${x + 8} ${y - 26} ${x + 16} ${y}Z`, bark)}${line(`M${x - 3} ${y - 4} q2 -20 0 -40 M${x + 5} ${y - 2} q-1 -18 0 -36`, '#4f3d30', 0.8, 0.7)}`;
    s += line(`M${x - 3} ${y - 44} Q${x - 22} ${y - 50} ${x - 40} ${y - 46} M${x} ${y - 46} Q${x + 6} ${y - 62} ${x + 26} ${y - 74} M${x - 2} ${y - 46} Q${x - 10} ${y - 66} ${x - 22} ${y - 82}`, bark, 4);
    if (w) {
      s += line(`M${x - 40} ${y - 46} L${x - 54} ${y - 58} M${x - 26} ${y - 49} L${x - 34} ${y - 66} M${x + 26} ${y - 74} L${x + 40} ${y - 84} M${x + 14} ${y - 66} L${x + 12} ${y - 86} M${x - 22} ${y - 82} L${x - 34} ${y - 94} M${x - 16} ${y - 74} L${x - 4} ${y - 96}`, bark, 1.8);
      s += line(`M${x - 40} ${y - 47} L${x - 54} ${y - 59} M${x + 8} ${y - 62} L${x + 26} ${y - 75} M${x - 22} ${y - 83} L${x - 34} ${y - 95}`, SNOW, 1.2, 0.95);
      return s;
    }
    const G = GREEN[SEASON], c = au ? ['#a8642a', '#d08a34', '#e9b64e'] : [G[0], G[1], G[2]];
    const blobs = [[x - 2, y - 92, 32, 24], [x - 32, y - 76, 26, 20], [x + 30, y - 80, 28, 21], [x, y - 66, 34, 18], [x - 44, y - 58, 16, 11], [x + 42, y - 62, 16, 12]];
    s += ovals(blobs.map(([a, b, e, f]) => [a, b + 3, e, f]), c[0]) + ovals(blobs.map(([a, b, e, f]) => [a, b, e - 2, f - 2]), c[1]);
    s += ovals([[x - 12, y - 102, 16, 9], [x - 40, y - 84, 11, 7], [x + 22, y - 90, 14, 8], [x + 2, y - 74, 12, 5]], c[2], 0.8);
    return s;
  }

  // ----------------------------------------------------- the gate and railings
  function gate(st, C) {
    const p = pend(st, 'gate'), ok = st.gate, w = winter();
    const col = ok ? C.manorGate : U.mix(C.manorGate, '#9a6a44', 0.66), lt = U.shade(col, 0.22), tip = ok ? K.gold : '#8a6a4a', foot = 532, top = 496;
    const pier = (x) => `${box(x - 11, foot - 1, 24, 3, '#00000024')}${box(x - 10, foot - 74, 20, 76, url('Wall'))}${box(x + 4, foot - 74, 6, 76, '#000', ' opacity="0.1"')}${line(`M${x - 10} ${foot - 56} h20 M${x - 10} ${foot - 40} h20 M${x - 10} ${foot - 24} h20 M${x - 10} ${foot - 8} h20`, '#7a5a30', 0.5, 0.35)}${box(x - 12.4, foot - 78, 24.8, 5, K.trim, ' rx="1"')}${box(x - 7, foot - 83, 14, 5, K.trim)}${dot(x, foot - 90, 7.4, K.trim)}${dot(x + 2, foot - 88, 5.4, '#000', 0.08)}${dot(x - 2.4, foot - 92.4, 2.2, '#fff', 0.5)}${w ? `${oval(x, foot - 95.6, 6, 2.4, SNOW)}${box(x - 13, foot - 79.6, 26, 2.2, SNOW, ' rx="1"')}` : ''}`;
    const bars = (a, b, y0, y1, step) => { let d = ''; for (let x = a; x <= b; x += step) d += `M${f1(x)} ${y0}V${y1}`; return d; };
    let s = `<g data-part="gate">${box(186, 446, 120, 88, '#000', ' fill-opacity="0"')}`;
    // the railings on their low wall, along the foot of the picture
    const stone = U.shade(K.stone, -0.04);
    for (const [a, b] of [[-6, 186], [298, 406]]) {
      s += `${line(bars(a + 2, b, top, foot - 6, 7), col, 1.4)}${box(a, top + 3, b - a, 2, col)}${box(a, foot - 10, b - a, 1.6, col)}${specks(Array.from({ length: Math.ceil((b - a) / 7) }, (_, i) => [a + 2 + i * 7, top - 0.6]), tip, 2)}`;
      s += `${box(a, foot - 7, b - a, 15, stone)}${box(a, foot - 8, b - a, 2.6, K.trim)}${box(a, foot + 2, b - a, 8, '#000', ' opacity="0.08"')}`;
      if (w) s += box(a, foot - 9.6, b - a, 2.4, SNOW, ' rx="1"');
      if (!ok) s += `${line(`M${a + 42} ${top + 4} q6 12 2 26 M${a + 100} ${top + 3} q-6 14 -3 27`, col, 1.8)}${ovals([[a + 60, foot - 12, 18, 7], [a + 130, foot - 10, 14, 6]], '#6f8a4a', 0.8)}`;
    }
    // the two leaves: chained shut while rusted, swung open when painted
    const leafAt = (x0, x1, y0, y1) => {
      // x0 at the hinge, x1 at the free end; y0 and y1 are how far the free end rises and drops
      let bar = '', n = 9;
      for (let i = 0; i <= n; i++) { const t = i / n, x = U.lerp(x0, x1, t); bar += `M${f1(x)} ${f1(U.lerp(top + 4, top + 4 + y0, t))}V${f1(U.lerp(foot - 3, foot - 3 + y1, t))}`; }
      const rail = (a, k) => `M${x0} ${a}L${x1} ${f1(a + k)}`;
      return `${line(bar, col, 1.5)}${line(rail(top + 5, y0) + rail(top + 13, y0 * 0.9 + y1 * 0.1) + rail(foot - 4, y1), col, 2)}${line(`M${f1(U.lerp(x0, x1, 0.2))} ${top + 13} q${f1((x1 - x0) * 0.14)} -11 ${f1((x1 - x0) * 0.3)} 0 q${f1((x1 - x0) * 0.16)} 11 ${f1((x1 - x0) * 0.3)} 0`, tip, 1)}`;
    };
    if (ok) s += leafAt(205, 232, -7, -13) + leafAt(287, 260, -7, -13);
    else s += `${leafAt(205, 245, 0, 0)}${leafAt(287, 247, 2, 4)}${line('M240 516 q7 7 13 0 q-7 -5 -13 0', '#6b5f50', 1.6)}${box(243, 517, 7, 6, '#7a6a50', ' rx="1"')}<g transform="rotate(-3 246 504)">${box(232, 498, 28, 12, '#d8cfbf', ' rx="1"')}${text(246, 507, 'NO WAY', 5.4, '#8a4a44')}</g>${ovals([[210, 524, 12, 6], [282, 526, 10, 5]], '#6f8a4a', 0.8)}`;
    s += pier(195) + pier(297);
    // the iron arch between the piers
    const a = `M206 454 Q246 428 286 454`, b = `M206 466 Q246 446 286 466`;
    if (ok || PCT > 0.2) s += line(a + b + 'M226 446 V458 M246 440 V455 M266 446 V458', col, 2);
    else s += line(`${a} M206 466 Q226 456 240 454`, col, 2);
    s += `${line('M232 450 q6 -7 14 -1 q8 -6 14 1', tip, 1)}${dot(246, 435, 2.6, tip)}`;
    if (p === 'grow') s += `${box(186, 454, 18, 76, FADE, ' opacity="0.4"')}${box(288, 454, 18, 76, FADE, ' opacity="0.4"')}${line('M206 454 Q246 428 286 454', FADE, 3, 0.6)}`;
    return s + '</g>';
  }
  function saleSign() {
    if (!(FORSALE || PCT < 0.15)) return '';
    return `<g transform="translate(-198 18)"><rect x="338.5" y="484" width="3" height="26" fill="#8a6142"/><g transform="rotate(4 340 480)">
      <rect x="316" y="470" width="48" height="21" rx="2" fill="#f6efe0" stroke="#7d6e58" stroke-width="1.2"/>
      <text x="340" y="483.6" text-anchor="middle" font-family="${FONT}" font-size="8.4" font-weight="900" fill="#3d5a86">FOR SALE</text>
      ${FORSALE ? '' : `<g transform="rotate(-10 340 488)"><rect x="313" y="484" width="54" height="10" fill="#d9534f"/><text x="340" y="492" text-anchor="middle" font-family="${FONT}" font-size="8" font-weight="900" fill="#fff">SOLD</text></g>`}</g></g>`;
  }

  function grounds(st, C) {
    return `${lawn(st)}${drive(st)}${maze(st)}${garden(st)}${orchard(st)}${lake(st)}${boathouse(st, C)}${topiary(st)}${backDecor(OWNED)}${fountain(st)}${oak()}${gate(st, C)}${saleSign()}`;
  }
  // ------------------------------------------------------------ decorations
  // Bought in the shed; each one is a small drawing at a fixed spot.
  // the fairy lights: swags under the cornice and along the string course
  const BULB_COLS = ['#f2c14e', '#e5675a', '#7cc3cf', '#b89ae2'];
  const WARM = ['#ffe9a8', '#ffb9a0', '#bff0ec', '#e4d0ff'];
  const SWAGS = [[34, 92, 156], [92, 168, 158], [232, 308, 158], [308, 366, 156], [34, 160, 215], [240, 366, 215], [176, 224, 80]];
  const BULBS = (() => {
    const out = [];
    for (const [a, b, y] of SWAGS) {
      const n = Math.round((b - a) / 19);
      for (let i = 0; i < n; i++) {
        const x0 = a + ((b - a) * i) / n, w = (b - a) / n;
        for (let k = 0; k < 4; k++) { const t = k / 4; out.push([x0 + w * t, y + 4 * t * (1 - t) * 6]); }
      }
      out.push([b, y]);
    }
    return out;
  })();
  const SWAG_D = SWAGS.map(([a, b, y]) => {
    const n = Math.round((b - a) / 19), w = (b - a) / n;
    return `M${a} ${y}${` q${f1(w / 2)} 12 ${f1(w)} 0`.repeat(n)}`;
  }).join('');
  // lanterns on posts down both sides of the drive
  const LANTERNS = (() => {
    const out = [];
    for (const i of [6, 11, 15, 19, 23, 27]) {
      const [x, y, w] = DRIVE_C[i];
      out.push([x - w / 2 - 4, y], [x + w / 2 + 4, y]);
    }
    return out;
  })();
  const lantern = (x, y) => {
    const k = scaleAt(y) * 1.2, top = y - 21 * k;
    return `${oval(x + 2, y + 0.6, 4 * k, 1.2, '#00000026')}${line(`M${f1(x)} ${f1(y)} V${f1(top)}`, '#3a3f42', 1.5 * k)}${box(x - 2.4 * k, top - 6 * k, 4.8 * k, 6 * k, '#ffe7a8')}${line(`M${f1(x - 2.8 * k)} ${f1(top)} H${f1(x + 2.8 * k)} M${f1(x - 2.8 * k)} ${f1(top - 6 * k)} L${f1(x)} ${f1(top - 9 * k)} L${f1(x + 2.8 * k)} ${f1(top - 6 * k)}`, '#3a3f42', 1.1 * k)}${winter() ? dot(x, top - 9 * k, 1.6, SNOW) : ''}`;
  };
  const lanternTop = ([x, y]) => [x, y - scaleAt(y) * 1.2 * 24];
  // a seated stone lion on the end of the balustrade
  const lion = (x, y, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)">${oval(0, 0.4, 9, 1.6, '#00000022')}${shape('M-7 0 Q-9 -8 -3 -10 Q2 -11 4 -7 L5 0Z', K.trim)}${shape('M1 0 V-7 H5 V0Z', U.shade(K.trim, -0.08))}${dot(4.6, -11.6, 4.8, U.shade(K.stone, -0.04))}${dot(5.2, -11, 3, K.trim)}${shape('M6.6 -10.4 l2.2 0.6 l-1.8 1.4Z', U.shade(K.stone, -0.3))}${dot(5.6, -12.2, 0.5, '#6d675a')}${line('M-7 -3 Q-11 -5 -10 -10', K.trim, 1.2)}${winter() ? `${oval(4.6, -15.6, 4, 1.4, SNOW)}${oval(-3, -10.4, 5, 1.2, SNOW)}` : ''}</g>`;
  const peacockBody = (tail) => {
    const blue = '#2f6fa8', teal = '#2f8f8a', gold = '#d9b048';
    let s = '';
    if (tail) {
      // the great fan, an eye at the end of every feather
      const eyes = [], rays = [];
      for (let i = 0; i < 13; i++) {
        const a = -Math.PI * (0.06 + (i / 12) * 0.88), R = 25 + (i % 2) * 2.6, c = Math.cos(a), n = Math.sin(a);
        rays.push(`M0 -6L${f1(c * R)} ${f1(n * R - 6)}`);
        eyes.push([c * R, n * R - 6]);
      }
      s += `<g class="wm-fan">${shape('M-26 -6 A26 28 0 0 1 26 -6 L3 -4 H-3Z', teal, ' opacity="0.9"')}${shape('M-19 -6 A19 21 0 0 1 19 -6 L3 -4 H-3Z', '#3f9a6a', ' opacity="0.75"')}${line(rays.join(''), gold, 0.5, 0.8)}${specks(eyes, gold, 4.2)}${specks(eyes, blue, 2.6)}${specks(eyes, '#16334f', 1.1)}</g>`;
    } else s += `${shape('M-3 -4 Q-20 -6 -36 1 Q-20 2 -4 0Z', teal)}${line('M-6 -3 Q-20 -3 -35 1 M-10 -1 L-30 1', gold, 0.5, 0.8)}${specks([[-34, 1], [-27, 0], [-20, -1.4], [-14, -2]], blue, 1.6)}`;
    s += `${line('M-1 0 v3.4 M2 0 v3.4', '#8a7a58', 0.8)}${oval(0, -3.4, 6, 3.8, blue)}${shape('M3 -5 Q6 -10 5.4 -14.4 L8 -14 Q8.6 -8 6.4 -3Z', blue)}${dot(6.8, -15, 2, blue)}${dot(7.4, -15.4, 0.5, '#fff')}${shape('M8.4 -15.6 l2.4 0.6 l-2.4 0.8Z', '#c9a06a')}${line('M6.4 -17 l-1 -3 M7 -17 l0 -3.4 M7.6 -17 l1 -3', '#2f6fa8', 0.4)}${specks([[5.4, -20], [7, -20.4], [8.6, -20]], '#7cc3cf', 0.9)}`;
    return s;
  };
  const DECOR = {
    // a sheepdog stretched out on the bottom step
    'wm-dog': () => {
      const x = 224, y = 294, f = '#f4efe2', d = '#3a3532';
      return `<g>${shadow(x + 2, y + 0.6, 15, 1.8)}<g class="wm-breathe">${shape(`M${x - 13} ${y} Q${x - 15} ${y - 8} ${x - 5} ${y - 9} Q${x + 4} ${y - 10} ${x + 8} ${y - 6} L${x + 12} ${y}Z`, f)}${oval(x - 6, y - 6, 6, 3.2, d)}</g>${dot(x + 9, y - 7, 4.4, f)}${shape(`M${x + 6} ${y - 11} q-3 2 -2 6 l3 -2Z`, d)}${oval(x + 13, y - 5.6, 2, 1.4, f)}${dot(x + 14.4, y - 6, 0.8, '#2a2522')}${dot(x + 10.4, y - 8, 0.6, '#2a2522')}${shape(`M${x + 8} ${y} h7 q1 -2 -1 -2.4 h-6Z`, f)}${line(`M${x - 13} ${y - 2} q-6 -1 -6 -6`, f, 2.2)}</g>`;
    },
    // a cat sitting on the sill of a bedroom window
    'wm-cat': () => {
      const x = 254, y = 196, f = '#e8a35c', d = U.shade(f, -0.22);
      return `<g><path d="M${x + 4} ${y} q7 -1 6 -8" fill="none" stroke="${f}" stroke-width="1.8" stroke-linecap="round"/>${shape(`M${x - 5} ${y} Q${x - 6.4} ${y - 9} ${x} ${y - 10} Q${x + 6.4} ${y - 9} ${x + 5} ${y}Z`, f)}${dot(x, y - 13, 4, f)}${shape(`M${x - 3.8} ${y - 15} l0 -4 l3 2Z M${x + 3.8} ${y - 15} l0 -4 l-3 2Z`, f)}${dot(x - 1.5, y - 13.4, 0.6, '#2a2522')}${dot(x + 1.5, y - 13.4, 0.6, '#2a2522')}${line(`M${x - 1.6} ${y - 7} v-1 M${x + 1.6} ${y - 7} v-1`, d, 0.7)}</g>`;
    },
    // a flagpole on the left pavilion
    'wm-flag': () => {
      const x = 61, y0 = 82, y1 = 46;
      return `<g>${line(`M${x} ${y0} V${y1}`, '#e8e2d6', 1.5)}${dot(x, y1 - 1, 1.5, K.gold)}<g class="wm-flag">${shape(`M${x + 0.6} ${y1 + 1} q11 -3 23 0 l-5 6.4 l5 6.6 q-12 -3 -23 0Z`, LILAC[3])}${shape(`M${x + 0.6} ${y1 + 7} q11 -3 19 0 l-1 0.6 q-9 -2.6 -18 0Z`, LILAC[0])}</g></g>`;
    },
    // a sundial in the middle of the lawn
    'wm-sundial': () => {
      const x = 218, y = 410, k = 0.82, st = K.trim;
      return `<g transform="translate(${x} ${y}) scale(${k})">${shadow(5, 0.8, 15, 2.4)}${box(-12, -3.6, 24, 4, st, ' rx="1"')}${shape('M-5 -4 L-3.4 -22 H3.4 L5 -4Z', st)}${shape('M1 -4 L1 -22 H3.4 L5 -4Z', '#000', ' opacity="0.1"')}${oval(0, -24, 13, 4.6, U.shade(st, -0.16))}${oval(0, -25.2, 13, 4.6, st)}${oval(0, -25.2, 10, 3.4, '#d9b35c', 0.9)}${shape('M-6 -25 L3 -25 L3 -32Z', '#8a6a32')}${winter() ? oval(0, -26.4, 11.6, 3.4, SNOW) : ''}</g>`;
    },
    // a swing on two ropes from the low bough of the oak
    'wm-swing': () => {
      const x = 326, y = 467;
      return `<g><g class="wm-swing">${line(`M${x - 6} ${y} L${x - 7} ${y + 36} M${x + 6} ${y - 1} L${x + 7} ${y + 36}`, '#c9b48c', 1)}${box(x - 10, y + 36, 20, 3, '#a4703e', ' rx="1"')}${box(x - 10, y + 39, 20, 1, '#6f4c30')}${winter() ? box(x - 10, y + 34.6, 20, 2, SNOW, ' rx="1"') : ''}</g></g>`;
    },
    'wm-lanterns': () => `<g>${LANTERNS.map(([x, y]) => lantern(x, y)).join('')}</g>`,
    // a marble figure on a plinth, looking back up at the house
    'wm-statue': () => {
      const x = 200, y = 388, st = '#f2efe8', dk = '#cfc9bc';
      return `<g transform="translate(${x} ${y}) scale(0.84)">${shadow(5, 0.8, 15, 2.4)}${box(-10, -8, 20, 8, K.trim, ' rx="0.8"')}${box(-12, -10, 24, 2.4, K.trim, ' rx="0.8"')}${shape('M-5 -10 Q-7 -22 -3 -30 L3 -30 Q7 -20 6 -10Z', st)}${shape('M2 -10 Q4 -20 3 -30 Q7 -20 6 -10Z', dk)}${line('M-2 -28 q-5 2 -6 9 M3 -29 q4 -5 2 -11', st, 2)}${dot(0, -34, 3.2, st)}${shape('M-3 -35 q3 -3.6 6 0 q-1 -1 -3 -1Z', dk)}${line('M-2 -22 q2 5 0 11 M2 -20 q1 4 0 9', dk, 0.6)}${winter() ? `${oval(0, -37, 3, 1.2, SNOW)}${box(-11, -11.4, 22, 2, SNOW, ' rx="1"')}` : ''}</g>`;
    },
    // fairy lights along the whole front
    'wm-lights': () => `<g>${line(SWAG_D, '#6b5c44', 0.6)}${BULBS.map(([x, y], i) => `<circle class="bulb" cx="${f1(x)}" cy="${f1(y + 1.2)}" r="1.5" fill="${BULB_COLS[i % 4]}"/>`).join('')}</g>`,
    // a rose arch at the way into the kitchen garden
    'wm-rosearch': () => {
      const x = 322, y = 366, w = 11, h = 26, leaf0 = winter() ? '#8a7a68' : GREEN[SEASON][1], r = U.rng(77), a = [], b = [];
      for (let i = 0; i < 44; i++) { const t = (i / 43) * Math.PI, R = 1 + (r() - 0.5) * 0.2; a.push([x - Math.cos(t) * w * R, y - h + 10 - Math.sin(t) * 13 * R + (i % 2 ? 0 : 0)]); }
      for (let i = 0; i < 16; i++) { const k = i % 2 ? -1 : 1; a.push([x + k * w + (r() - 0.5) * 3, y - 2 - (i / 16) * (h - 10)]); }
      for (let i = 0; i < a.length; i += 3) b.push(a[i]);
      const col = SEASON === 'summer' ? '#e5677a' : SEASON === 'spring' ? '#f2a6b8' : SEASON === 'autumn' ? '#c9574a' : null;
      return `<g>${shadow(x, y + 0.6, 15, 1.8)}${line(`M${x - w} ${y} V${y - h + 10} A${w} 13 0 0 1 ${x + w} ${y - h + 10} V${y}`, '#8a7a62', 1.6)}${specks(a, leaf0, winter() ? 1.2 : 3)}${col ? specks(b, col, 2.6) + specks(b, '#fff0ec', 0.8) : line(`M${x - w} ${y - h + 10} A${w} 13 0 0 1 ${x + w} ${y - h + 10}`, SNOW, 1.6)}</g>`;
    },
    // a plank jetty out from the bank
    'wm-jetty': () => {
      let d = '', s = '';
      const n = 12, at = (t, k) => [U.lerp(112, 134, t) + k * U.lerp(6, 9, t), U.lerp(444, 492, t)];
      for (let i = 0; i <= n; i++) { const [a, y] = at(i / n, -1), [b] = at(i / n, 1); d += `M${f1(a)} ${f1(y)}L${f1(b)} ${f1(y)}`; }
      for (const t of [0.5, 1]) for (const k of [-1, 1]) { const [x, y] = at(t, k); s += box(x - 1.2, y - 3, 2.4, 9, '#5f4a38'); }
      return `<g>${s}${shape(poly([at(0, -1), at(0, 1), at(1, 1), at(1, -1)]), winter() ? SNOW : '#b58f64')}${line(d, winter() ? '#c9d6e0' : '#8a6a48', 0.8)}</g>`;
    },
    // a rowing boat, afloat in the warm months and held by the ice in winter
    'wm-rowboat': () => {
      const x = 160, y = 492, w = winter(), hull = '#fbf3e0', band = '#3d5a86';
      return `<g transform="translate(${x} ${y})"><g${w ? '' : ' class="wm-bob"'}>${oval(0, 4, 24, 3, '#0a4f70', 0.2)}${shape('M-23 -3 Q-16 6 0 6 Q16 6 23 -4 Q0 2 -23 -3Z', hull)}${shape('M-23 -3 Q0 -1 23 -4 Q0 2 -23 -3Z', '#7a5a3c')}${line('M-21 -1 Q-14 5 0 5 Q14 5 21 -1', band, 1)}${line('M-6 -1 v2 M7 -1 v2', '#c89b62', 2)}${line('M-10 -4 L12 3', '#c89b62', 1.2)}${w ? shape('M-20 -3 Q0 -6 20 -4 Q0 0 -20 -3Z', SNOW) : ''}</g></g>`;
    },
    // stone lions on the piers at the foot of the steps
    'wm-lions': () => `<g>${lion(148, 277, false)}${lion(252, 277, true)}</g>`,
    // a cherub with a shell on top of the fountain
    'wm-fountainfig': () => {
      const { x, y } = FOUNT, top = y - 35, c = K.trim, d = U.shade(c, -0.14);
      return `<g><g transform="translate(${x} ${top})">${shape('M-3.4 0 Q-4.4 -6 -2 -8 H2 Q4.4 -6 3.4 0Z', c)}${shape('M0.6 0 V-8 H2 Q4.4 -6 3.4 0Z', d)}${dot(0, -10.6, 2.8, c)}${line('M-2.4 -7 Q-6 -9 -5 -13 M2.4 -7 Q6 -9 5 -13', c, 1.4)}${shape('M-7 -13 Q0 -19 7 -13 Q0 -15 -7 -13Z', c)}${winter() ? oval(0, -14.6, 6, 1.6, SNOW) : ''}</g></g>`;
    },
    // a little glasshouse against the back wall of the kitchen garden
    'wm-glasshouse': () => {
      const x0 = 330, x1 = 370, y = 332, h = 13, peak = y - h - 11, cx = (x0 + x1) / 2, fr = '#fbf8ee';
      const front = poly([[x0, y], [x0, y - h], [cx, peak], [x1, y - h], [x1, y]]);
      let d = '';
      for (let x = x0 + 8; x < x1; x += 8) d += `M${x} ${y}V${f1(peak + (Math.abs(x - cx) / 20) * 11)}`;
      return `<g>${shadow(cx + 2, y + 1, 24, 2.4)}${shape(front, url('Glass'), ' opacity="0.86"')}${line(d + `M${x0} ${y - h}H${x1}M${x0} ${y - 5}H${x1}`, fr, 0.8)}${line(`M${x0} ${y} V${y - h} L${cx} ${peak} L${x1} ${y - h} V${y} Z`, fr, 1.4)}${box(x0 - 1, y - 2.4, x1 - x0 + 2, 3, K.brick)}${specks([[x0 + 5, y - 7], [x0 + 12, y - 8], [x1 - 6, y - 7], [cx, y - 8]], '#5f9a48', 4)}${winter() ? shape(`M${x0 - 1} ${y - h} L${cx} ${peak - 1} L${x1 + 1} ${y - h} Q${cx} ${peak + 5} ${x0 - 1} ${y - h}Z`, SNOW) : ''}</g>`;
    },
    // a white summer house with a shingled dome on the shore of the lake
    'wm-gazebo': () => {
      const x = 168, y = 436, k = 0.92, st = '#fbf8ee', sh = '#d9d2c2', roof = K.slate;
      return `<g transform="translate(${x} ${y}) scale(${k})">${oval(3, 1, 26, 4, '#00000024')}${oval(0, 0, 23, 5, sh)}${oval(0, -1.2, 23, 5, st)}${oval(0, -2, 18, 3.4, '#a58a64', 0.5)}${line('M-20 -2 V-30 M-10 -1 V-29 M0 -1 V-28 M10 -1 V-29 M20 -2 V-30', st, 2.6)}${line('M-20 -13 q5 3 10 2 M10 -11 q5 1 10 -2', sh, 1)}${shape('M-24 -30 Q-20 -46 0 -52 Q20 -46 24 -30 Q0 -24 -24 -30Z', roof)}${shape('M0 -52 Q20 -46 24 -30 Q12 -27 4 -27 Q10 -42 0 -52Z', '#000', ' opacity="0.14"')}${line('M-24 -30 Q0 -24 24 -30', st, 2)}${line('M-12 -28 Q-10 -42 0 -52 M12 -28 Q10 -42 0 -52', '#000', 0.5, 0.2)}${dot(0, -54, 2, K.gold)}${winter() ? shape('M-22 -34 Q-18 -46 0 -52 Q18 -46 22 -34 Q0 -40 -22 -34Z', SNOW) : ''}</g>`;
    },
    // the peacock on the lawn, with its tail up
    'wm-peacock': () => `<g transform="translate(208 444) scale(0.8)">${shadow(0, 3.4, 18, 2.4)}${peacockBody(true)}</g>`,
  };
  // some stand behind what comes later in the picture
  const BEHIND = new Set(['wm-gazebo', 'wm-sundial', 'wm-statue', 'wm-peacock', 'wm-glasshouse', 'wm-jetty']);
  function decorations(owned) {
    let s = '';
    for (const k of Object.keys(DECOR)) if (owned[k] && !BEHIND.has(k)) s += DECOR[k]();
    return s;
  }
  function backDecor(owned) {
    let s = '';
    for (const k of BEHIND) if (owned[k]) s += DECOR[k]();
    return s;
  }

  function life(st) {
    let s = '';
    if (PCT > 0.3 && !NIGHT) s += '<g class="bird"><path d="M100 42 q4 -4 8 0 q4 -4 8 0 M126 30 q3 -3 6 0 q3 -3 6 0" stroke="#4a4a50" stroke-width="1.5" fill="none"/></g>';
    // a swan on the lake once it is clean
    if (st.lake && PCT > 0.6 && !winter()) {
      const x = 100, y = 488, c = '#fbfbf6';
      s += `<g pointer-events="none" transform="translate(${x} ${y})"><g class="wm-bob">${oval(0, 3.6, 13, 2, '#0a4f70', 0.2)}${shape('M-11 -1 Q-6 5 3 4.6 Q10 4 11 -2 Q5 0 1 -3 Q-4 -6 -11 -1Z', c)}${shape('M-13 -3 l6 1 l-3 3Z', c)}${line('M9 -1 Q13 -6 9 -9 Q7 -11 8 -13', c, 2)}${dot(8.6, -13.4, 1.9, c)}${shape('M10 -13.8 l3.2 1 l-3 1Z', '#e9823c')}${dot(8.8, -13.8, 0.5, '#2a2522')}</g></g>`;
    }
    // a sparrow on the balustrade; a robin in the cold
    if (PCT > 0.6 && !NIGHT) {
      const x = 92, y = 281, w = winter(), c = '#8a6a52';
      s += `<g class="wm-hop">${oval(x, y, 4.2, 2.8, c)}${w ? oval(x + 2.2, y + 0.6, 2.2, 1.8, '#d9622f') : ''}${dot(x + 3.2, y - 2.4, 2, c)}${dot(x + 3.8, y - 2.8, 0.5, '#222')}<path d="M${x + 5} ${y - 2.2} l1.6 0.4 l-1.6 0.4Z" fill="#c9a06a"/>${line(`M${x - 1} ${y + 2.6} v1.6 M${x + 1} ${y + 2.6} v1.6`, '#6b4a32', 0.5)}</g>`;
    }
    return s;
  }
  // a little life of its own when nothing is left to do this season: a peacock
  // crossing the lawn in the warm months, or a heron standing by the lake
  function heron() {
    const x = 152, y = 458, g = '#9aa9b6', d = '#5f6f7e';
    return `<g class="rest"><g pointer-events="none">${winter() ? oval(x, y + 1, 11, 1.8, '#00000022') : `${oval(x, y + 0.6, 10, 2.2, '#ffffff', 0.5)}${oval(x, y + 0.6, 7, 1.4, '#3f8fae', 0.35)}`}${line(`M${x - 2} ${y} v-14 M${x + 2} ${y} v-14`, '#c9a06a', 0.9)}${shape(`M${x - 12} ${y - 10} Q${x - 4} ${y - 22} ${x + 5} ${y - 22} Q${x + 8} ${y - 17} ${x + 3} ${y - 12} Q${x - 4} ${y - 8} ${x - 12} ${y - 10}Z`, g)}${shape(`M${x - 12} ${y - 10} Q${x - 4} ${y - 18} ${x + 2} ${y - 16} Q${x - 2} ${y - 10} ${x - 12} ${y - 10}Z`, d)}<g class="wm-nod">${line(`M${x + 4} ${y - 20} Q${x + 11} ${y - 25} ${x + 6} ${y - 30} Q${x + 3} ${y - 34} ${x + 7} ${y - 36}`, '#e8ecf0', 2.2)}${dot(x + 8, y - 37, 2.2, '#e8ecf0')}${line(`M${x + 5} ${y - 38.6} l-6 1.4`, '#2f3a48', 1)}${shape(`M${x + 9.6} ${y - 38} l7.4 1.8 l-7.4 1Z`, '#e0b64a')}${dot(x + 8.6, y - 37.6, 0.5, '#2a2522')}</g></g></g>`;
  }
  function rest(st, owned) {
    if ((SEASON === 'spring' || SEASON === 'summer') && !owned['wm-peacock']) {
      return `<g class="rest"><g class="rest-glide"><g pointer-events="none" transform="translate(186 390) scale(0.96)">${shadow(-8, 3.4, 26, 2.2)}${peacockBody(false)}</g></g></g>`;
    }
    return heron();
  }
  function weather() {
    let s = '';
    if (winter()) {
      for (let i = 0; i < 26; i++) s += `<circle class="flake" cx="${(i * 61) % 400}" cy="-10" r="${1.5 + (i % 3) * 0.7}" fill="#fff" style="animation-delay:-${((i * 0.83) % 9).toFixed(2)}s;animation-duration:${7 + (i % 5)}s"/>`;
    } else if (SEASON === 'autumn') {
      const cols = ['#d9822b', '#c4462f', '#e9b23c'];
      for (let i = 0; i < 7; i++) s += `<ellipse class="fleaf" cx="${(i * 67 + 20) % 400}" cy="-10" rx="4" ry="2" fill="${cols[i % 3]}" style="animation-delay:-${((i * 1.3) % 10).toFixed(1)}s;animation-duration:${9 + (i % 4)}s"/>`;
    } else if (SEASON === 'spring') {
      // wisteria petals on the air
      for (let i = 0; i < 8; i++) s += `<ellipse class="fleaf" cx="${(i * 53 + 10) % 400}" cy="-10" rx="2.6" ry="1.6" fill="${i % 2 ? '#e7d8f4' : '#fbf2f4'}" style="animation-delay:-${((i * 1.7) % 11).toFixed(1)}s;animation-duration:${11 + (i % 3)}s"/>`;
    }
    return `<g class="weather" pointer-events="none">${s}</g>`;
  }

  // evening: the whole front goes dark but for the lit rooms; every tall window
  // shines, the clock tower with them, and the lake carries the light back. The
  // goodnight screen puts out whatever is filled with a warm colour or a gradient
  // with Glow in its name, so that is how everything here that shines is filled.
  const MOON = { x: 342, y: 58 };
  const inSky = (x, y) => {
    if (Math.abs(x - 200) < 38 && y > 0) return false;
    if (y > 150 || Math.hypot(x - MOON.x, y - MOON.y) < 30) return false;
    return !((x < 104 || x > 296) && y > 88) && !(x > 96 && x < 304 && y > 70);
  };
  function stars() {
    const r = U.rng(1499), still = [];
    let s = '';
    for (let n = 0, tries = 0; n < 46 && tries < 400; tries++) {
      const x = r() * 400, y = 4 + r() * 120;
      if (!inSky(x, y)) continue;
      n++;
      if (n % 4 === 0) s += `<circle class="star" cx="${f1(x)}" cy="${f1(y)}" r="${f1(0.7 + (n % 3) * 0.3)}" fill="#fff" style="animation-delay:-${((n * 0.7) % 4).toFixed(1)}s"/>`;
      else still.push([x, y]);
    }
    return specks(still, '#fff', 1.6) + s;
  }
  function night(st, decor) {
    const all = 'y="-4" width="400" height="548"', { x: mx, y: my } = MOON;
    const L = st.winLeft, R = st.winRight, gallery = st.portraits, studyOn = st.study, face = st.clock, rooms = PCT > 0.6, door = st.door;
    const leftD = L ? TALLX.map(tallD).join('') : '', rightD = R ? TALLX.map((x) => tallD(mir(x))).join('') : '';
    const galleryD = gallery ? TALLX.map(upperD).join('') : '';
    const bedD = rooms ? [mir(TALLX[2]), mir(TALLX[1])].map(upperD).join('') : '';
    const studyD = studyOn ? `M${STUDY.x0} ${STUDY.y0}H${STUDY.x1}V${STUDY.y1}H${STUDY.x0}Z` : '';
    const hallD = rooms ? HALL : '';
    const fan = door ? `M184 232 A16 16 0 0 1 216 232Z` : '';
    const dial = face ? `<circle cx="${CLOCK.x}" cy="${CLOCK.y}" r="${CLOCK.r}"/>` : '';
    let s = `<mask id="${id('Dark')}"><rect ${all} fill="#fff"/><path d="${LAKE_D}" fill="#c8c8c8"/><g fill="#585858"><path d="${leftD}${rightD}${galleryD}${bedD}${studyD}${hallD}${fan}"/>${dial}</g></mask>
      <rect ${all} fill="#1b2350" opacity="0.58" style="mix-blend-mode:multiply" mask="url(#${id('Dark')})"/>
      <rect ${all} fill="#24306a" opacity="0.2" mask="url(#${id('Dark')})"/>`;
    s += stars();
    s += `<mask id="${id('Moon')}"><rect width="400" height="200" fill="#fff"/><circle cx="${mx + 7}" cy="${my - 6}" r="14" fill="#000"/></mask><circle cx="${mx}" cy="${my}" r="16" fill="#fff6d8" mask="url(#${id('Moon')})"/><circle cx="${mx}" cy="${my}" r="30" fill="#fff6d8" opacity="0.08"/>`;
    const glow = (x, y, rx, ry = rx) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${ry}" fill="${url('Glow')}"/>`;
    // the rooms: a warm wash over the glass and light spilling on the terrace
    const warm = (d, op = 0.34) => (d ? shape(d, url('GlowRoom'), ` opacity="${op}"`) : '');
    s += warm(leftD, 0.34) + warm(rightD, 0.3) + warm(galleryD, 0.28) + warm(bedD, 0.6) + warm(hallD, 0.66) + warm(studyD, 0.24) + warm(fan, 0.66);
    if (L) s += `<g opacity="0.55">${TALLX.map((x) => glow(x, 240, 28, 40)).join('')}</g>${TALLX.map((x) => glow(x, 282, 24, 8)).join('')}`;
    if (R) s += `<g opacity="0.55">${TALLX.map((x) => glow(mir(x), 240, 28, 40)).join('')}</g>${TALLX.map((x) => glow(mir(x), 282, 24, 8)).join('')}`;
    if (st.chandelier && !PEND.chandelier) s += `${glow(TALLX[1], 234, 24, 24)}${ovals([[TALLX[1] - 11, 230.4, 1.1], [TALLX[1] + 11, 230.4, 1.1], [TALLX[1] - 7, 224.4, 1.1], [TALLX[1] + 7, 224.4, 1.1], [TALLX[1], 222.6, 1.1]], '#fff3c4')}`;
    if (st.ballroom && st.chandelier && L) s += `<g class="wm-waltz" opacity="0.8">${dot(143.6, 240, 2, '#5a3f4a')}${dot(148.4, 239, 2.2, '#5a3f4a')}${shape('M141 243 Q146 241 151 243 L150 253 H143Z', '#5a3f4a')}${shape('M143 252 Q138 262 137 266 H149 Q148 258 146 252Z', '#7a3f5a')}${box(148, 252, 3.6, 14, '#5a3f4a')}</g>`;
    if (gallery) s += `<g opacity="0.55">${TALLX.map((x) => glow(x, 180, 20, 24)).join('')}</g>`;
    if (rooms) s += `${glow(254, 180, 20, 24)}${glow(290, 180, 20, 24)}${glow(200, 168, 26, 28)}`;
    if (rooms) s += box(101, 133, 6, 7, '#ffd98a', ' opacity="0.7"') + box(251, 133, 6, 7, '#ffd98a', ' opacity="0.7"');
    if (studyOn) s += glow(STUDY.cx, 180, 30, 28);
    if (door) s += `${glow(200, 232, 32, 30)}${glow(200, 292, 46, 9)}`;
    // the clock tower: the dial shines like a small moon, the lantern above it
    if (face) s += `${dot(CLOCK.x, CLOCK.y, CLOCK.r, '#ffe9b0', 0.36)}${glow(CLOCK.x, CLOCK.y, 56, 56)}`;
    if (PCT > 0.4) s += `${[187, 196.5, 206].map((x) => box(x, 49, 7, 21, '#ffd98a', ' rx="3" opacity="0.82"')).join('')}${glow(200, 58, 34, 26)}`;
    // the light of the house on the fountain, and a lamp over the gate
    if (st.fountain) s += glow(FOUNT.x, FOUNT.y - 12, 62, 34);
    if (st.gate) s += `${dot(246, 438, 2.4, '#ffe9b0')}${glow(246, 440, 26, 26)}`;
    if (st.boathouse) s += `${dot(BOAT.x, BOAT.y - BOAT.h - 11, 3.4, '#ffd98a')}${glow(BOAT.x, BOAT.y - BOAT.h - 11, 18, 18)}`;
    // the lake: the moon's path and the long reflection of the lit front
    if (st.lake) {
      let d = '';
      for (let i = 0; i < 9; i++) { const y = 454 + i * 6.2, w = 8 + i * 2.6; d += `M${f1(150 - w)} ${y}h${f1(w * 2)}`; }
      s += `<g clip-path="${url('Pond')}">${glow(150, 482, 96, 40)}<g class="wm-ripple">${line(d, '#ffe9b0', 1, 0.55)}</g>${winter() ? '' : glint(120, 478, 3) + glint(176, 494, 3)}</g>`;
    }
    if (decor['wm-lanterns']) s += LANTERNS.map((q) => { const [x, y] = lanternTop(q); return `${dot(x, y, 2.2, '#fff3c4')}${glow(x, y, 15)}`; }).join('');
    if (decor['wm-lights']) s += BULBS.map(([x, y], i) => `<circle cx="${f1(x)}" cy="${f1(y + 1.2)}" r="1.8" fill="${url(`GlowBulb${i % 4}`)}"/>`).join('') + BULBS.filter((_, i) => i % 3 === 0).map(([x, y]) => `<circle cx="${f1(x)}" cy="${f1(y + 1.2)}" r="6" fill="${url('Glow')}"/>`).join('');
    if (decor['wm-cat'] && rooms) s += `${dot(252.5, 182.6, 0.8, '#ffe066')}${dot(255.5, 182.6, 0.8, '#ffe066')}`;
    // fireflies over the lawn and the orchard on a summer evening
    if (SEASON === 'summer' && st.lawn) for (const [x, y] of [[150, 400], [226, 418], [120, 436], [318, 470], [262, 380], [186, 372]]) s += `<g class="wm-fly">${dot(x, y, 1.2, '#fff3c4')}${dot(x, y, 4.4, '#fff3c4', 0.2)}</g>`;
    return `<g class="night" pointer-events="none">${s}</g>`;
  }

  const SPOTS = {
    drive: [282, 430], lawn: [190, 424], topiary: [254, 404], fountain: [200, 318], lake: [130, 484], door: [200, 246], winLeft: [104, 240], winRight: [296, 240], ballroom: [104, 258], chandelier: [110, 232],
    clock: [200, 106], wisteria: [104, 206], garden: [342, 338], orchard: [346, 404], gate: [246, 490], boathouse: [62, 442], library: [296, 240], portraits: [104, 180], study: [339, 180], maze: [80, 350],
  };
  const PARTS = ['drive', 'lawn', 'topiary', 'fountain', 'lake', 'door', 'winLeft', 'winRight', 'ballroom', 'chandelier', 'clock', 'wisteria', 'garden', 'orchard', 'gate', 'boathouse', 'library', 'portraits', 'study', 'maze'];
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

  // st: map of restored part -> true; cols: chosen paint colours (manorDoor,
  // manorGate, manorBoathouse); opts as for LIDO.render: season, pending, uid,
  // forSale, pct, night, decor, resting, fresh
  function render(st = {}, cols = {}, opts = {}) {
    SEASON = SKY[opts.season] ? opts.season : 'spring'; PEND = opts.pending || {}; UID = opts.uid ? String(opts.uid).replace(/[^\w-]/g, '') : ''; FORSALE = !!opts.forSale;
    PCT = U.clamp(opts.pct || 0, 0, 1); NIGHT = !!opts.night; STAMP = `${SEASON.slice(0, 2)}${Math.round(PCT * 8)}`;
    const decor = opts.decor || {};
    OWNED = decor;
    palette({ manorDoor: cols.manorDoor || '#3d5a86', manorGate: cols.manorGate || '#2f3d36', manorBoathouse: cols.manorBoathouse || '#4e7b5b' });
    const C = K.C;
    return `<svg viewBox="0 0 ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" class="house manor">
      ${style()}${defs()}${sky()}${far()}${ground()}${house(st, C)}${grounds(st, C)}
      ${decorations(decor)}${life(st)}${opts.resting ? rest(st, decor) : ''}${weather()}${opts.night ? night(st, decor) : ''}${sparkles(opts.fresh)}
    </svg>`;
  }

  return { render, DECOR, PARTS };
})();
