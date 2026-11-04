'use strict';
// Kingfisher Lock, drawn as SVG the same way as the cottage (house.js), the
// café, the cove, the rescue and the glasshouse. An old canal lock: a
// humpback bridge at the back, the lock with its heavy wooden gates and
// black-and-white balance beams, a lock-keeper's cottage behind a picket
// fence, a basin below the lock with a little rowing boat, and a long
// narrowboat moored along the towpath in front. Each restorable part has a
// tired look and a restored look; the narrowboat, the fence, the cottage
// door, the rowing boat and the lock sign take the colours chosen while
// painting. Every id carries a 'k' prefix (plus opts.uid when given) so this
// picture can share a page with the others.

const CANAL = (() => {
  const VB = { w: 400, h: 540 };
  const FONT = "ui-rounded,'SF Pro Rounded',system-ui,sans-serif";

  // set at the start of every render: the season, which parts have a
  // seasonal job waiting (part -> 'grow' | 'leaves' | 'snow' | 'frost'), the
  // id suffix, whether the lock is still for sale, how far along it is and
  // the colours worked out from all that
  let SEASON = 'spring', PEND = {}, UID = '', FORSALE = false, PCT = 0, K = {};
  const id = (n) => `k${n}${UID}`;
  const url = (n) => `url(#${id(n)})`;
  const pend = (st, p) => (st[p] ? PEND[p] : undefined);
  const f1 = (v) => (+v).toFixed(1);
  const SNOW = '#f4f8fb';
  const FADE = '#cfc6b6';
  const winter = () => SEASON === 'winter';
  const dot = (x, y, r, col, op = 1) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const oval = (x, y, rx, ry, col, op = 1) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const shadow = (x, y, rx, ry = 2.4) => oval(x, y, rx, ry, '#00000022');
  const line = (d, col, w = 1, op = 1) => `<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const box = (x, y, w, h, col, more = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${col}"${more}/>`;
  // dark or light writing, whichever reads on a painted colour
  const ink = (c) => (U.lum(c) > 0.62 ? '#3b352e' : '#fbf6ea');

  const SKY = {
    spring: ['#bfe2ef', '#e9f1e6', '#f6eedd'], summer: ['#9fd6f0', '#e3f3ea', '#fbf1d8'],
    autumn: ['#f0cfae', '#f6e2c6', '#f3e6d2'], winter: ['#c4d2e0', '#e3eaf1', '#f3f6f9'],
  };
  const HILLS = { spring: ['#b6d2ad', '#9fc392'], summer: ['#a9cf98', '#8fc27b'], autumn: ['#d4c08e', '#c6aa6c'], winter: ['#e6edf2', '#dbe4ea'] };
  const GRASS = {
    spring: ['#8fbf6a', '#79ad57', '#a6cf7f'], summer: ['#86bb5e', '#70a64c', '#9fcb72'],
    autumn: ['#bdb06c', '#a59858', '#cfc282'], winter: ['#e9eff4', '#d9e3ea', '#f5f8fb'],
  };
  const CANOPY = { spring: ['#6f9d5c', '#7aa866'], summer: ['#5f9a4c', '#6aa858'], autumn: ['#d9822b', '#c9692f'], winter: null };
  const TALL = { spring: ['#6a9846', '#4f8034', '#88b35c'], summer: ['#5f9440', '#47782e', '#7fae52'], autumn: ['#a5975a', '#857842', '#c2b274'], winter: ['#b9bca6', '#9a9c86', '#d9dccb'] };
  // the canal through the year: deep, middle and light (where it mirrors the sky)
  const WATER = {
    spring: ['#4f8c8e', '#73aaa6', '#a7d0c6'], summer: ['#3f8590', '#62a8aa', '#9dd3c8'],
    autumn: ['#4f7470', '#6b8f88', '#a3bdb2'], winter: ['#6b7f88', '#8a9ea6', '#bccbd1'],
  };
  // the weeping willow's strands through the year
  const WILLOW = { spring: ['#a9cf6a', '#8fbf5a', '#c3dd86'], summer: ['#7fb24c', '#6aa040', '#94c15e'], autumn: ['#d8b844', '#c99a32', '#e6cc6a'], winter: null };

  // ---------------------------------------------------------------- shapes
  // the humpback bridge: the parapet rises over the arch
  const BRIDGE_D = 'M112 224 Q200 168 288 224 L288 239 L230 239 A30 30 0 0 0 170 239 L112 239Z';
  const ARCH_D = 'M170 239 A30 30 0 0 1 230 239Z';
  // the water: the canal above the lock, the lock chamber and the basin below
  const UPPER_D = 'M168 238 H232 V258 H168Z';
  const CHAMBER_D = 'M168 258 H232 V292 H168Z';
  const BASIN_D = 'M0 301 H400 V426 H0Z';
  // the grass bank to the right of the lock
  const BANK_D = 'M243 301 V243 H312 Q350 224 400 222 V301Z';
  // the narrowboat, side on, its bow to the right
  const HULL_D = 'M12 394 Q20 401 42 401 L292 401 Q314 401 331 389 L334 392 Q330 412 314 425 L26 425 Q14 414 12 394Z';
  const CABIN = { x0: 42, x1: 240, y0: 362, y1: 401 };
  const PORTS = [112, 140, 168, 196, 224];
  const PORT_Y = 389;
  // the lock-keeper's cottage
  const COT = { x0: 20, x1: 118, y0: 228, y1: 272 };
  const WIN = { x: 66, y: 238, w: 38, h: 22 };
  const DOOR = { x: 34, y: 240, w: 18, h: 32 };
  // the towpath between the boat and the verge
  const TOW_D = 'M0 425 H400 V478 H0Z';

  // little css of our own: bobbing boats, gliding swans, a swaying willow
  function style() {
    return `<style>@media (prefers-reduced-motion: no-preference){
      #scene .kc-bob{animation:kcbob 3.2s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
      @keyframes kcbob{from{transform:translateY(-.5px) rotate(-1deg)}to{transform:translateY(.6px) rotate(1deg)}}
      #scene .kc-glide{animation:kcglide 18s ease-in-out infinite alternate}
      @keyframes kcglide{from{transform:translateX(-6px)}to{transform:translateX(12px)}}
      #scene .kc-sway{animation:kcsway 5s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 0%}
      @keyframes kcsway{from{transform:skewX(-2deg)}to{transform:skewX(2.5deg)}}
      #scene .kc-ripple{animation:kcripple 3.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
      @keyframes kcripple{0%,100%{opacity:.15;transform:scaleX(.8)}50%{opacity:.7;transform:scaleX(1.12)}}
      #scene .kc-spout{animation:kcspout 1.1s linear infinite;transform-box:fill-box}
      @keyframes kcspout{0%{opacity:0;transform:translateY(-2px)}30%{opacity:.95}100%{opacity:0;transform:translateY(7px)}}
      #scene .kc-dart{animation:kcdart 7s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
      @keyframes kcdart{0%,100%{transform:translate(0,0)}25%{transform:translate(14px,-4px)}50%{transform:translate(22px,2px)}75%{transform:translate(8px,-6px)}}
      #scene .kc-wing{animation:kcwing .16s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
      @keyframes kcwing{to{transform:scaleY(.3)}}
      #scene .kc-tail{animation:kctail 5s ease-in-out infinite;transform-box:fill-box;transform-origin:0% 50%}
      @keyframes kctail{0%,80%,100%{transform:rotate(0)}88%{transform:rotate(12deg)}94%{transform:rotate(-5deg)}}
      #scene .kc-flag{animation:kcflag 3s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 0%}
      @keyframes kcflag{from{transform:skewX(-5deg)}to{transform:skewX(6deg)}}
    }</style>`;
  }

  function palette(C) {
    const k = (1 - PCT) * 0.35;
    K = {
      C,
      grass: GRASS[SEASON].map((c) => (winter() ? c : U.mix(c, '#a3a07c', k))),
      brick: U.mix('#b8664a', '#9a8a7c', k * 1.2),
      stone: U.mix('#e2d6bf', '#b3aa9a', k),
      wash: U.mix('#f4efe4', '#bdb6a6', k * 1.3),
      water: WATER[SEASON].map((c) => U.mix(c, '#7d8a6a', k * 0.8)),
    };
  }

  function defs(st) {
    const g = K.grass, T = TALL[SEASON], b = K.brick, ob = U.mix(b, '#8a8476', 0.45), W = K.water;
    const dand = winter() ? '<ellipse cx="12" cy="10" rx="6" ry="2" fill="#fff" opacity="0.85"/><ellipse cx="34" cy="28" rx="7" ry="2.2" fill="#fff" opacity="0.75"/>'
      : SEASON === 'autumn' ? '<circle cx="8" cy="9" r="1.8" fill="#ece6d4"/><circle cx="31" cy="27" r="1.6" fill="#ece6d4"/>'
        : '<circle cx="8" cy="9" r="1.8" fill="#f3cf3a"/><circle cx="31" cy="27" r="1.6" fill="#f3cf3a"/><circle cx="22" cy="6" r="1.4" fill="#fff"/>';
    const brick = (base, moss) => `<rect width="24" height="12" fill="${base}"/>
        <rect x="0.8" y="0.9" width="10.6" height="4.6" fill="${U.shade(base, 0.08)}"/><rect x="12.8" y="0.9" width="10.4" height="4.6" fill="${U.shade(base, -0.04)}"/>
        <rect x="6.8" y="6.9" width="10.4" height="4.6" fill="${U.shade(base, 0.03)}"/><rect x="18.8" y="6.9" width="5" height="4.6" fill="${U.shade(base, -0.08)}"/><rect x="0" y="6.9" width="5.2" height="4.6" fill="${U.shade(base, -0.08)}"/>
        <path d="M0 0.4 H24 M0 6.4 H24 M12 0.4 V6.4 M6 6.4 V12 M18 6.4 V12" stroke="${moss ? '#a39a86' : '#ead9c0'}" stroke-width="0.8" opacity="0.75"/>
        ${moss ? '<circle cx="4" cy="6" r="1.6" fill="#6f8a3e" opacity="0.6"/><circle cx="19" cy="11.6" r="1.4" fill="#748f42" opacity="0.5"/>' : ''}`;
    const flag = (cols, gap) => `<rect width="44" height="24" fill="${gap}"/>
        <rect x="0.8" y="0.8" width="19" height="10.4" rx="1.2" fill="${cols[0]}"/><rect x="20.8" y="0.8" width="22.4" height="10.4" rx="1.2" fill="${cols[1]}"/>
        <rect x="0.8" y="12.8" width="12.4" height="10.4" rx="1.2" fill="${cols[2]}"/><rect x="14" y="12.8" width="17" height="10.4" rx="1.2" fill="${cols[0]}"/><rect x="31.8" y="12.8" width="11.4" height="10.4" rx="1.2" fill="${cols[1]}"/>
        <path d="M2 2 h8 M23 2 h10 M3 14 h5 M16 14 h7 M34 14 h5" stroke="#fff" stroke-width="0.7" opacity="0.25"/>`;
    return `
    <defs>
      <linearGradient id="${id('Sky')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${SKY[SEASON][0]}"/><stop offset="0.75" stop-color="${SKY[SEASON][1]}"/><stop offset="1" stop-color="${SKY[SEASON][2]}"/>
      </linearGradient>
      <radialGradient id="${id('Sun')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#fff6cf"/><stop offset="0.45" stop-color="#fde7a3"/><stop offset="1" stop-color="#fde7a3" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${id('Water')}" x1="0" y1="226" x2="0" y2="426" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="${W[2]}"/><stop offset="0.42" stop-color="${W[1]}"/><stop offset="1" stop-color="${W[0]}"/>
      </linearGradient>
      <linearGradient id="${id('Under')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f2826"/><stop offset="1" stop-color="#3b4a47"/></linearGradient>
      <pattern id="${id('Weed')}" width="14" height="11" patternUnits="userSpaceOnUse">
        <rect width="14" height="11" fill="${winter() ? '#5d7068' : '#3f6b58'}"/>
        <circle cx="2" cy="2" r="1.6" fill="#9cc456"/><circle cx="6.5" cy="3.6" r="1.8" fill="#8fb84c"/><circle cx="11" cy="1.6" r="1.3" fill="#a8cc5e"/>
        <circle cx="3.6" cy="7.4" r="1.5" fill="#94bd52"/><circle cx="9" cy="8" r="1.9" fill="#9fc65a"/><circle cx="12.8" cy="5.6" r="1.1" fill="#b2d36a"/>
        <circle cx="6.4" cy="10" r="1" fill="#88b048"/><circle cx="0.6" cy="5.2" r="1" fill="#a3c95c"/>
      </pattern>
      <pattern id="${id('Tall')}" width="14" height="12" patternUnits="userSpaceOnUse">
        <rect width="14" height="12" fill="${T[0]}"/>
        <path d="M2 12 Q3 6 1 2 M5 12 Q6 7 7 3 M9 12 Q8 6 10 1 M12 12 Q13 8 12 4" stroke="${T[1]}" stroke-width="1.2" fill="none"/>
        <path d="M3.5 12 Q5 8 4 5 M10.5 12 Q11 9 13 6" stroke="${T[2]}" stroke-width="1" fill="none"/>
      </pattern>
      <pattern id="${id('Dand')}" width="46" height="38" patternUnits="userSpaceOnUse">${dand}</pattern>
      <pattern id="${id('Mow')}" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(-6)">
        <rect width="18" height="18" fill="${g[0]}"/><rect width="9" height="18" fill="${g[2]}" opacity="0.55"/>
      </pattern>
      <pattern id="${id('Moss')}" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="#8d9466"/>
        <circle cx="4" cy="5" r="3" fill="#6f8a3e"/><circle cx="12" cy="11" r="3.5" fill="#748f42"/><circle cx="11" cy="3" r="1.5" fill="#a5a86c"/>
      </pattern>
      <pattern id="${id('Snow')}" width="30" height="24" patternUnits="userSpaceOnUse">
        <rect width="30" height="24" fill="#f3f7fb"/><ellipse cx="8" cy="8" rx="7" ry="3" fill="#e2ebf3"/><ellipse cx="22" cy="18" rx="8" ry="3" fill="#e6eef5"/>
        <circle cx="16" cy="5" r="0.9" fill="#fff"/><circle cx="4" cy="19" r="0.8" fill="#c9d8e6"/>
      </pattern>
      <pattern id="${id('Leaves')}" width="34" height="28" patternUnits="userSpaceOnUse">
        <ellipse cx="6" cy="6" rx="4" ry="2" fill="#d9822b" transform="rotate(30 6 6)"/><ellipse cx="22" cy="10" rx="4.5" ry="2.2" fill="#c4462f" transform="rotate(-20 22 10)"/>
        <ellipse cx="14" cy="21" rx="4" ry="2" fill="#e9b23c" transform="rotate(70 14 21)"/><ellipse cx="29" cy="24" rx="3.6" ry="1.8" fill="#9c5a2a"/>
        <ellipse cx="3" cy="17" rx="3.4" ry="1.7" fill="#e06c3c" transform="rotate(-50 3 17)"/>
      </pattern>
      <pattern id="${id('Brick')}" width="24" height="12" patternUnits="userSpaceOnUse">${brick(b, false)}</pattern>
      <pattern id="${id('BrickOld')}" width="24" height="12" patternUnits="userSpaceOnUse">${brick(ob, true)}</pattern>
      <pattern id="${id('Flag')}" width="44" height="24" patternUnits="userSpaceOnUse" patternTransform="scale(1 0.6)">${flag(winter() ? ['#e3e1dc', '#d9d6cf', '#e8e6e1'] : ['#d8cfbd', '#cfc5b2', '#dcd3c2'], winter() ? '#c9c6bf' : '#b9ae9b')}</pattern>
      <pattern id="${id('FlagOld')}" width="44" height="24" patternUnits="userSpaceOnUse" patternTransform="scale(1 0.6)">${flag(['#a9a58c', '#9c9a80', '#b1ab92'], '#6f7a4a')}</pattern>
      <pattern id="${id('Slate')}" width="10" height="7" patternUnits="userSpaceOnUse">
        <rect width="10" height="7" fill="#5f6870"/><path d="M0 6.6 H10 M5 0 V6.6" stroke="#4a5259" stroke-width="0.7"/><rect x="0.6" y="0.6" width="3.6" height="1.2" fill="#fff" opacity="0.1"/>
      </pattern>
      <pattern id="${id('SlateOld')}" width="10" height="7" patternUnits="userSpaceOnUse">
        <rect width="10" height="7" fill="#6d7068"/><path d="M0 6.6 H10 M5 0 V6.6" stroke="#55584f" stroke-width="0.7"/><circle cx="3" cy="3" r="1.4" fill="#7a8a4a" opacity="0.6"/>
      </pattern>
      <linearGradient id="${id('Grime')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#858e74"/><stop offset="0.7" stop-color="#69764f"/><stop offset="1" stop-color="#4f5c36"/></linearGradient>
      <linearGradient id="${id('Dusty')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9b19f"/><stop offset="1" stop-color="#d7c39a"/></linearGradient>
      <linearGradient id="${id('Frost')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f9fc"/><stop offset="1" stop-color="#cadbe8"/></linearGradient>
      <linearGradient id="${id('Glass')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3f2f6"/><stop offset="1" stop-color="#a9cbd8"/></linearGradient>
      <linearGradient id="${id('Hull')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a393e"/><stop offset="1" stop-color="#1f1e22"/></linearGradient>
      <radialGradient id="${id('Glow')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#ffe2a0" stop-opacity="0.6"/><stop offset="0.45" stop-color="#ffd98a" stop-opacity="0.22"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/>
      </radialGradient>
      <clipPath id="${id('BasinClip')}"><path d="${BASIN_D}"/></clipPath>
    </defs>`;
  }

  // --------------------------------------------------------- sky and hills
  function sky() {
    const cl = SEASON === 'autumn' ? '#fbf1e6' : '#ffffff';
    return `<rect width="400" height="270" fill="${url('Sky')}"/>
    <circle cx="338" cy="58" r="46" fill="${url('Sun')}"/><circle cx="338" cy="58" r="17" fill="#fff3c4"/>
    <g class="cloud c1" fill="${cl}" opacity="0.92"><ellipse cx="64" cy="62" rx="25" ry="10"/><ellipse cx="83" cy="55" rx="17" ry="12"/><ellipse cx="101" cy="63" rx="19" ry="8"/></g>
    <g class="cloud c2" fill="${cl}" opacity="0.8"><ellipse cx="218" cy="98" rx="19" ry="7"/><ellipse cx="233" cy="93" rx="13" ry="9"/><ellipse cx="247" cy="99" rx="14" ry="6"/></g>`;
  }
  function bgTree(x, y, r, which) {
    if (!CANOPY[SEASON]) {
      return `<g stroke="#7a6252" stroke-linecap="round" fill="none"><path d="M${x} ${f1(y + r * 0.9)} V${f1(y - r * 0.4)}" stroke-width="2.6"/>
        <path d="M${x} ${y} l${f1(-r * 0.4)} ${f1(-r * 0.4)} M${x} ${f1(y - r * 0.15)} l${f1(r * 0.45)} ${f1(-r * 0.35)}" stroke-width="1.4"/></g>`;
    }
    const col = CANOPY[SEASON][which];
    return `<g><rect x="${x - 2}" y="${y}" width="4" height="${f1(r * 0.9)}" fill="#6b5240"/>${dot(x, y - r * 0.15, r * 0.62, col)}${dot(x - r * 0.35, y + r * 0.1, r * 0.45, col)}${dot(x + r * 0.35, y + r * 0.08, r * 0.48, U.shade(col, -0.1))}${dot(x - r * 0.15, y - r * 0.35, r * 0.3, U.shade(col, 0.15))}</g>`;
  }
  // a windmill on the far hill
  function windmill(x, y) {
    const c = winter() ? '#dfe4e8' : '#d6cdbd';
    return `<path d="M${x - 6} ${y} L${x - 4} ${y - 20} H${x + 4} L${x + 6} ${y}Z" fill="${c}"/><path d="M${x - 4.8} ${y - 20} Q${x} ${y - 27} ${x + 4.8} ${y - 20}Z" fill="#a39c90"/>
      ${box(x - 1.4, y - 7, 2.8, 4, '#8a8478')}<g stroke="#a39c90" stroke-width="1.7" stroke-linecap="round"><path d="M${x} ${y - 21} l-11 -8 M${x} ${y - 21} l11 8 M${x} ${y - 21} l8 -11 M${x} ${y - 21} l-8 11"/></g>${dot(x, y - 21, 1.4, '#8a8478')}`;
  }
  // beyond the canal: hills, a windmill and trees along the hedgerows
  function far() {
    const H = HILLS[SEASON];
    let s = `<path d="M0 178 Q70 152 150 166 T300 150 T400 162 V214 H0Z" fill="${H[0]}"/>`;
    s += windmill(318, 151);
    s += bgTree(140, 192, 15, 0) + bgTree(164, 186, 11, 1) + bgTree(238, 184, 12, 0) + bgTree(264, 190, 15, 1) + bgTree(352, 184, 16, 0);
    s += `<path d="M-10 206 C60 192 140 188 210 196 C280 202 340 190 410 198 V216 H-10Z" fill="${H[1]}"/>`;
    return s;
  }
  function ground() {
    const g = K.grass, r = U.rng(41);
    let s = `<rect x="0" y="210" width="400" height="330" fill="${g[0]}"/>`;
    for (let i = 0; i < 22; i++) s += oval(r() * 400, 226 + r() * 300, 10 + r() * 22, 3 + r() * 4, r() < 0.5 ? g[1] : g[2], 0.5);
    return s;
  }

  // ------------------------------------------------------------ the bridge
  // a point along the top of the parapet, t from 0 (left) to 1 (right)
  const bq = (t) => [112 + 176 * t, 224 - 112 * t * (1 - t)];
  function bridge(st) {
    const p = pend(st, 'bridge'), ok = st.bridge;
    const face = ok ? url('Brick') : url('BrickOld'), stone = ok ? K.stone : '#aaa190';
    let s = '<g data-part="bridge">';
    // the wing walls down to the banks, and the end piers
    s += `<path d="M112 224 L90 236 V241 H112Z M288 224 L310 236 V241 H288Z" fill="${face}"/>`;
    s += `<path d="${ARCH_D}" fill="${url('Under')}"/>${oval(200, 236, 22, 3, K.water[2], 0.55)}`;
    s += `<path d="${BRIDGE_D}" fill="${face}"/>`;
    // the stone ring round the arch and its keystone
    s += `<path d="M166 239 A34 34 0 0 1 234 239" stroke="${stone}" stroke-width="5" fill="none" stroke-dasharray="5.2 1.1"/>${box(196, 201, 8, 9, stone, ' rx="1"')}`;
    // coping stones along the top of the parapet, one of them fallen
    for (let i = 0; i < 14; i++) {
      if (!ok && i === 9) continue;
      const [x0, y0] = bq(i / 14), [x1, y1] = bq((i + 1) / 14), len = Math.hypot(x1 - x0, y1 - y0);
      const a = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
      s += `<g transform="translate(${f1(x0)} ${f1(y0)}) rotate(${f1(a)})"><rect x="-0.4" y="-4.2" width="${f1(len + 0.8)}" height="5.2" rx="1.2" fill="${stone}"/><path d="M1 -3 H${f1(len - 1)}" stroke="#fff" stroke-width="0.7" opacity="0.35"/></g>`;
    }
    s += `${box(105, 212, 9, 29, stone)}${box(103.6, 209, 11.8, 4, U.shade(stone, -0.08), ' rx="1"')}${box(286, 212, 9, 29, stone)}${box(284.6, 209, 11.8, 4, U.shade(stone, -0.08), ' rx="1"')}`;
    if (!ok) {
      for (const [x, y] of [[124, 226], [140, 216], [156, 229], [182, 200], [246, 214], [262, 228], [272, 218], [226, 204]]) s += `<rect x="${x}" y="${y}" width="10.4" height="4.6" fill="#4d3a30"/><rect x="${x}" y="${y}" width="10.4" height="1.2" fill="#000" opacity="0.25"/>`;
      s += line('M150 208 l-4 9 l3 7 l-5 8 M258 206 l3 8 l-4 6 l2 7', '#5a4a40', 0.9, 0.8);
      const r = U.rng(23);
      for (const [x0, x1] of [[100, 140], [262, 300]]) {
        for (let i = 0; i < 16; i++) s += oval(x0 + r() * (x1 - x0), 206 + r() * 32, 2.6, 1.7, U.pick(r, ['#3f6b34', '#4f7f3c', '#5d8a44']));
      }
      // the fallen coping stone, lying at the foot of the bridge
      s += `<g transform="rotate(14 246 242)">${box(236, 238, 20, 5, '#aaa190', ' rx="1.2"')}</g>`;
    }
    if (p === 'grow') s += `<path d="${BRIDGE_D}" fill="#6f8a3e" opacity="0.2"/>${line('M118 222 q6 6 4 16 M282 222 q-5 6 -3 15 M140 212 q3 8 1 14', '#4f6b34', 1.2)}`;
    else if (p === 'frost') s += `<path d="${BRIDGE_D}" fill="${url('Frost')}" opacity="0.45"/>`;
    else if (p === 'leaves') s += [[0.12, '#d9822b'], [0.3, '#c4462f'], [0.46, '#e9b23c'], [0.66, '#d9822b'], [0.84, '#9c5a2a']].map(([t, c]) => { const [x, y] = bq(t); return oval(x, y - 4.6, 3, 1.4, c); }).join('');
    if (winter() || p === 'snow') s += `<path d="M106 223 Q200 163 294 223" stroke="${SNOW}" stroke-width="3.4" fill="none" stroke-linecap="round"/>${box(103.6, 207.4, 11.8, 2.4, SNOW, ' rx="1.2"')}${box(284.6, 207.4, 11.8, 2.4, SNOW, ' rx="1.2"')}`;
    return s + '</g>';
  }

  // -------------------------------------------------------- the grass bank
  function weed(x, base, h, r) {
    const dead = winter() || SEASON === 'autumn';
    const c = dead ? U.pick(r, ['#8a7a5a', '#9a8a64', '#75684c']) : U.pick(r, ['#5f8a3a', '#7a9a44', '#4d7a32']);
    const k = r();
    if (k < 0.4) return line(`M${f1(x)} ${f1(base)} l-3 ${f1(-h * 0.7)} M${f1(x)} ${f1(base)} l1 ${f1(-h)} M${f1(x)} ${f1(base)} l3.4 ${f1(-h * 0.6)}`, c, 1.2);
    if (k < 0.7) return oval(x - 2.4, base - h * 0.3, 1.8, h * 0.35, c) + oval(x + 2.2, base - h * 0.25, 1.6, h * 0.3, U.shade(c, -0.1)) + line(`M${f1(x)} ${f1(base)} V${f1(base - h)}`, c, 0.9);
    // a thistle
    return line(`M${f1(x)} ${f1(base)} V${f1(base - h)}`, c, 1) + oval(x - 2, base - h * 0.5, 2.4, 1, c) + dot(x, base - h - 1.6, 2, dead ? '#a89a7a' : '#9b6fc4') + `<path d="M${f1(x - 2)} ${f1(base - h)} h4 l-2 2.4Z" fill="${c}"/>`;
  }
  function bloom(x, y, r, col, eye = '#f2c230', n = 5) {
    let s = '';
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 - Math.PI / 2; s += dot(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.5, col); }
    return s + dot(x, y, r * 0.36, eye);
  }
  function bank(st) {
    const p = pend(st, 'bank'), ok = st.bank && p !== 'grow';
    let s = '<g data-part="bank">';
    if (!st.bank) {
      s += `<path d="${BANK_D}" fill="${url('Tall')}"/><path d="${BANK_D}" fill="${url('Dand')}"/>`;
      const r = U.rng(53);
      for (let i = 0; i < 14; i++) s += weed(250 + r() * 140, 252 + r() * 46, 9 + r() * 8, r);
      if (winter()) s += `<path d="${BANK_D}" fill="${url('Snow')}" opacity="0.55"/>`;
    } else if (winter() || p === 'snow') s += `<path d="${BANK_D}" fill="${url('Snow')}"/>`;
    else {
      s += `<path d="${BANK_D}" fill="${url('Mow')}"/>`;
      if (p === 'grow') s += `<path d="${BANK_D}" fill="${url('Tall')}" opacity="0.6"/><path d="${BANK_D}" fill="${url('Dand')}" opacity="0.8"/>`;
      if (p === 'leaves') s += `<path d="${BANK_D}" fill="${url('Leaves')}"/>`;
      else if (SEASON === 'autumn') s += `<path d="${BANK_D}" fill="${url('Leaves')}" opacity="0.3"/>`;
      else if (ok) { const r = U.rng(61); for (let i = 0; i < 12; i++) s += bloom(250 + r() * 140, 250 + r() * 44, 1.6, '#ffffff', '#f2c230', 6); }
    }
    return s + '</g>';
  }

  // ------------------------------------------------------------- the water
  function water(st) {
    const p = pend(st, 'weed'), ok = st.weed && p !== 'grow', W = K.water;
    const ice = st.weed && (winter() || p === 'snow' || p === 'frost');
    let s = '<g data-part="weed">';
    s += `<path d="${UPPER_D}" fill="${url('Water')}"/><path d="${CHAMBER_D}" fill="${url('Water')}"/><path d="${CHAMBER_D}" fill="#000" opacity="0.1"/><path d="${BASIN_D}" fill="${url('Water')}"/>`;
    // the far bank, the cottage and the lock, mirrored in the still water
    s += `<g clip-path="${url('BasinClip')}">${box(20, 302, 98, 12, K.wash, ' opacity="0.22"')}${box(168, 302, 64, 14, '#3b2f26', ' opacity="0.22"')}${oval(380, 312, 30, 12, CANOPY[SEASON] ? CANOPY[SEASON][0] : '#9a8a6a', 0.25)}${box(0, 301, 400, 2.4, '#000', ' opacity="0.12"')}</g>`;
    if (!st.weed) {
      // a green carpet of duckweed, with only a few dark gaps
      s += `<path d="${UPPER_D}" fill="${url('Weed')}"/><path d="${CHAMBER_D}" fill="${url('Weed')}" opacity="0.9"/><path d="${BASIN_D}" fill="${url('Weed')}"/>`;
      for (const [x, y, rx, ry] of [[90, 330, 20, 5], [210, 342, 16, 4], [292, 318, 10, 3], [36, 346, 12, 3.4], [150, 316, 9, 2.6]]) s += oval(x, y, rx, ry, W[0], 0.85);
      s += line('M120 334 l12 -2 M250 326 l9 3 M60 316 l8 -1', '#6b5a3a', 1.2);
    } else if (p === 'grow') {
      // the duckweed creeping back along the edges
      for (const [x, y, rx, ry] of [[40, 306, 38, 4], [130, 307, 28, 3.4], [270, 306, 30, 3.6], [370, 307, 26, 3.6], [200, 262, 26, 3], [60, 352, 40, 5]]) s += oval(x, y, rx, ry, url('Weed'));
    }
    if (ok && !ice) {
      s += `<g pointer-events="none">${[[70, 322, 16], [180, 340, 12], [300, 350, 14], [120, 350, 10], [200, 248, 10]].map(([x, y, w], i) => `<path class="kc-ripple" style="animation-delay:-${(i * 0.9).toFixed(1)}s" d="M${x - w} ${y} q${w} -2.4 ${w * 2} 0" stroke="#fff" stroke-width="1" fill="none" opacity="0.5"/>`).join('')}</g>`;
      // lily pads by the far bank
      if (SEASON === 'spring' || SEASON === 'summer') {
        for (const [x, y, k] of [[22, 318, 6], [40, 326, 5], [12, 334, 4.6], [62, 314, 4]]) s += oval(x, y, k, k * 0.42, '#5fae5a') + line(`M${f1(x)} ${f1(y)} l${f1(k * 0.9)} ${f1(-k * 0.2)}`, '#3f8a44', 0.7);
        if (SEASON === 'summer') s += bloom(40, 323, 2.6, '#f7b6c8', '#f2c230', 6);
      }
    }
    if (ice) {
      s += `<path d="${BASIN_D}" fill="${url('Frost')}" opacity="${p === 'snow' || p === 'frost' ? 0.6 : 0.32}"/><path d="${UPPER_D}" fill="${url('Frost')}" opacity="0.5"/>`;
      s += `${box(0, 301, 168, 5, '#f4f9fc', ' opacity="0.85"')}${box(232, 301, 168, 5, '#f4f9fc', ' opacity="0.85"')}${line('M30 324 l20 -4 M110 340 l26 -5 M250 330 l18 4 M330 316 l24 -3', '#fff', 1.4, 0.8)}`;
    }
    if (p === 'leaves') s += `<path d="M0 302 H400 V360 H0Z" fill="${url('Leaves')}" opacity="0.75"/><path d="${UPPER_D}" fill="${url('Leaves')}" opacity="0.7"/>`;
    return s + '</g>';
  }

  // -------------------------------------------------------------- the lock
  // stone copings along both walls of the lock and the edges of the basin,
  // and a mooring post on the far bank for the little rowing boat
  function lockside() {
    const c = K.stone, dk = U.shade(c, -0.12);
    let s = `<path d="M156 238 H168 V303 H156Z M232 238 H244 V303 H232Z" fill="${c}"/>`;
    for (let y = 246; y < 302; y += 8) s += line(`M156 ${y} H168 M232 ${y} H244`, dk, 0.7);
    s += line('M167.4 239 V302 M232.6 239 V302', '#000', 1, 0.15);
    s += `${box(0, 296, 157, 6, c)}${box(243, 296, 157, 6, c)}${box(0, 301, 400, 1.6, '#000', ' opacity="0.1"')}`;
    for (let x = 14; x < 400; x += 22) if (x < 150 || x > 250) s += line(`M${x} 296 V302`, dk, 0.6);
    // bollards beside the lock, and the mooring post for the rowing boat
    s += `${box(146, 287, 5, 8, '#2f2e33', ' rx="2"')}${box(249, 287, 5, 8, '#2f2e33', ' rx="2"')}${box(361, 288, 6, 14, '#6b5240', ' rx="1"')}${box(360, 286.6, 8, 2.6, '#5a4434', ' rx="1"')}`;
    if (winter()) s += `${box(0, 295, 157, 2, SNOW)}${box(243, 295, 157, 2, SNOW)}${box(156, 237, 12, 2, SNOW)}${box(232, 237, 12, 2, SNOW)}`;
    return s;
  }
  // a balance beam: black, with white at the end so no one walks into it
  function beam(x0, y0, x1, y1, ok, w = 5.4) {
    const len = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / len, uy = (y1 - y0) / len, tip = 9;
    let s = line(`M${f1(x0)} ${f1(y0)} L${f1(x1)} ${f1(y1)}`, ok ? '#26252a' : '#7a756c', w);
    s += line(`M${f1(x1 - ux * tip)} ${f1(y1 - uy * tip)} L${f1(x1)} ${f1(y1)}`, ok ? '#f6f2ea' : '#c9c3b6', w);
    if (ok) s += line(`M${f1(x0 + ux * 4)} ${f1(y0 + uy * 4)} L${f1(x0 + ux * 8)} ${f1(y0 + uy * 8)}`, '#f6f2ea', w);
    else s += [0.3, 0.55, 0.75].map((t) => dot(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, w * 0.3, '#b9b3a6')).join('');
    return s;
  }
  // one leaf of the bottom gates, its heel at hx, meeting the other at 200
  function leaf(hx, ok, wood, broken) {
    const dir = hx < 200 ? 1 : -1, top = (x) => 279 - (Math.abs(x - hx) / 32) * 3;
    const dk = U.shade(wood, -0.28), lt = U.shade(wood, 0.16);
    let s = `<path d="M${hx} 279 L200 276 V307 H${hx}Z" fill="${wood}"/>`;
    let planks = '';
    for (let k = 1; k < 5; k++) { const x = hx + dir * k * 6.4; planks += `M${f1(x)} ${f1(top(x) + 1)} V307 `; }
    s += `<path d="${planks}" stroke="${dk}" stroke-width="0.7"/><path d="M${hx} 289 L200 287 M${hx} 298 L200 296.6" stroke="${dk}" stroke-width="1.6"/>`;
    // the walkway along the top, a handrail and the paddle gear
    s += `<path d="M${hx} 279 L200 276" stroke="${lt}" stroke-width="3"/>`;
    const px = hx + dir * 16;
    s += `${box(px - 1.8, top(px) - 10, 3.6, 10, ok ? '#3d3d42' : '#7a6a5a')}${box(px - 3, top(px) - 12, 6, 2.6, ok ? '#2f2f33' : '#6d5a4a', ' rx="1"')}`;
    const rail = (x) => `M${f1(x)} ${f1(top(x) - 1)} V${f1(top(x) - 8)} `;
    s += `<path d="${rail(hx + dir * 3)}${rail(hx + dir * 28)}" stroke="${ok ? '#f6f2ea' : '#a39c90'}" stroke-width="1"/>`;
    s += line(`M${f1(hx + dir * 3)} ${f1(top(hx + dir * 3) - 8)} L${f1(hx + dir * (broken ? 18 : 28))} ${f1(top(hx + dir * (broken ? 18 : 28)) - 8)}`, ok ? '#f6f2ea' : '#a39c90', 1.2);
    if (!ok) s += `<path d="M${hx} 300 L200 299 V307 H${hx}Z" fill="#5f7a3a" opacity="0.55"/>`;
    return s;
  }
  function gates(st) {
    const p = pend(st, 'gates'), ok = st.gates;
    const wood = ok ? '#6e4f36' : '#8f877a', lt = U.shade(wood, 0.16);
    let s = '<g data-part="gates">';
    // the top gates, low and mostly under water, with short beams
    s += `<path d="M168 251 L200 248.6 L232 251 V259 H168Z" fill="${wood}"/><path d="M168 251 L200 248.6 L232 251" stroke="${lt}" stroke-width="1.6" fill="none"/><path d="M200 248.6 V259" stroke="${U.shade(wood, -0.3)}" stroke-width="1"/>`;
    s += beam(168, 251.6, 136, 254, ok, 4) + beam(232, 251.6, 264, 254, ok, 4);
    // the bottom gates, one of them sagging on its hinge until it is mended
    s += `<g${ok ? '' : ' transform="rotate(3.4 168 279)"'}>${leaf(168, ok, wood, !ok)}</g>${leaf(232, ok, wood, false)}`;
    s += `<path d="M200 276 V307" stroke="${U.shade(wood, -0.35)}" stroke-width="1.4"/>`;
    s += beam(170, 278, 120, 283, ok) + beam(230, 278, 280, 283, ok);
    if (!ok) {
      // a plank missing, and the water spurting through
      s += `${box(214, 288, 6, 19, '#2b2622')}<g pointer-events="none">${[0, 0.35, 0.7].map((d, i) => `<circle class="kc-spout" style="animation-delay:-${d}s" cx="${217 + (i - 1) * 1.4}" cy="${300 + i * 2}" r="1.3" fill="#e8f6fb"/>`).join('')}</g>`;
      s += line('M214 296 q3 4 3 11 M220 294 q2 6 1 13', '#e8f6fb', 1, 0.8) + line('M200 278 l-3 6', '#2b2622', 1.4);
    } else {
      // a little water trickling past the paddles
      s += `<g pointer-events="none">${oval(200, 307, 28, 1.8, '#f4fbfd', 0.55)}${[184, 216].map((x, i) => `<circle class="kc-spout" style="animation-delay:-${(i * 0.5).toFixed(1)}s" cx="${x}" cy="306" r="1.1" fill="#f4fbfd"/>`).join('')}</g>`;
    }
    if (p === 'grow') s += `<path d="M168 279 L200 276 L232 279 V307 H168Z" fill="${FADE}" opacity="0.45"/>`;
    else if (p === 'frost') s += `<path d="M168 279 L200 276 L232 279 V307 H168Z" fill="${url('Frost')}" opacity="0.5"/>`;
    else if (p === 'leaves') s += oval(178, 277, 3, 1.4, '#d9822b') + oval(192, 275.6, 2.8, 1.3, '#c4462f') + oval(222, 276.6, 3, 1.4, '#e9b23c') + oval(140, 280, 2.6, 1.2, '#d9822b');
    if (winter() || p === 'snow') s += `${line('M168 278 L200 275 L232 278', SNOW, 2.4)}${line('M168 250 L200 247.6 L232 250', SNOW, 1.6)}${line('M150 280.4 L124 282.6 M250 280.4 L276 282.6', SNOW, 1.6)}`;
    return s + '</g>';
  }

  // ------------------------------------------------ the lock-keeper's cottage
  function cottage() {
    const roof = PCT > 0.35 ? url('Slate') : url('SlateOld');
    let s = shadow(69, 273, 56, 3);
    s += `${box(93, 186, 11, 20, url('Brick'))}${box(91.6, 184, 13.8, 3.4, K.stone, ' rx="1"')}${box(95, 179, 3.4, 5.4, '#b5694a')}${box(99.6, 180.4, 3, 4, '#a8604a')}`;
    s += `<path d="M12 230 L30 202 H108 L126 230Z" fill="${roof}"/><path d="M30 202 H108" stroke="#4a5259" stroke-width="2.4" stroke-linecap="round"/><path d="M12 230 H126" stroke="#3f464d" stroke-width="1.6"/>`;
    s += `${box(20, 230, 98, 42, K.wash)}${box(20, 230, 98, 3, '#000', ' opacity="0.12"')}${box(20, 270, 98, 2, '#000', ' opacity="0.08"')}`;
    // the little hood over the door
    s += `<path d="M30 239 L43 232.6 L56 239Z" fill="#5f6870"/><path d="M31 239 H55" stroke="#4a5259" stroke-width="1.2"/>`;
    if (winter()) s += `<path d="M14 228 L31 202.6 H107 L124 228 Q96 222 69 226 Q42 222 14 228Z" fill="${SNOW}" opacity="0.92"/>${line('M31 238 L43 232 L55 238', SNOW, 1.8)}${box(91.6, 182.6, 13.8, 2, SNOW, ' rx="1"')}`;
    if (PCT < 0.4) s += line('M24 250 l6 6 l-2 6 M110 236 l-4 8 l2 5', '#9a9284', 0.8) + `<g transform="rotate(22 66 214)">${box(61, 212, 9, 5, '#5f6870')}</g>`;
    // a climbing rose round the door once the place is cared for
    if (PCT > 0.55) {
      const leaf = winter() ? '#7a6a52' : SEASON === 'autumn' ? '#8a7a3c' : '#4f8a3c', r = U.rng(17);
      for (let i = 0; i < 18; i++) {
        const t = i / 17, x = t < 0.5 ? 28 - Math.sin(t * Math.PI) * 2 : 58 + Math.sin(t * Math.PI) * 2, y = 270 - (t < 0.5 ? t : 1 - t) * 2 * 34;
        s += oval(x + (r() - 0.5) * 3, y, 2.4, 1.6, leaf);
        if ((SEASON === 'summer' || SEASON === 'spring') && i % 3 === 0) s += dot(x + (r() - 0.5) * 2, y - 1, 1.6, SEASON === 'summer' ? '#e0607e' : '#f5b3c4');
      }
    }
    return s;
  }
  function door(st, C) {
    const p = pend(st, 'door'), ok = st.door;
    const c = ok ? C.lockDoor : U.mix(C.lockDoor, '#a59e90', 0.62), dk = U.shade(c, -0.25);
    const { x, y, w, h } = DOOR;
    let s = `<g data-part="door">${box(x - 2, y - 2, w + 4, h + 2, ok ? '#f6efe0' : '#c9c1b2')}${box(x, y, w, h, c)}`;
    for (const [px, py] of [[x + 2.4, y + 3], [x + 10, y + 3], [x + 2.4, y + 17], [x + 10, y + 17]]) s += `<rect x="${f1(px)}" y="${f1(py)}" width="5.6" height="11.6" rx="0.6" fill="none" stroke="${dk}" stroke-width="1"/>`;
    s += dot(x + w - 3.2, y + 17.4, 1.2, ok ? '#e9c35a' : '#77705f');
    if (ok) s += `<circle cx="${x + w / 2}" cy="${y + 11}" r="1.9" fill="none" stroke="#e9c35a" stroke-width="0.9"/>${dot(x + w / 2, y + 9, 0.8, '#e9c35a')}`;
    else s += `${oval(x + 5, y + 9, 3, 2, '#d8cfbf', 0.75)}${oval(x + 13, y + 24, 2.6, 1.6, '#d8cfbf', 0.7)}${oval(x + 6, y + 28, 3, 1.2, '#d8cfbf', 0.6)}${line(`M${x + 12} ${y} l-2 9 l2 5`, '#3a302a', 0.8)}`;
    if (p === 'grow') s += box(x, y, w, h, FADE, ' opacity="0.5"');
    s += box(x - 4, y + h, w + 8, 3.4, K.stone, ' rx="1"');
    if (winter() || p === 'snow') s += box(x - 4, y + h - 1, w + 8, 2, SNOW, ' rx="1"');
    return s + '</g>';
  }
  function cottageWindow(st) {
    const p = pend(st, 'window'), ok = st.window;
    const { x, y, w, h } = WIN, frame = ok ? '#fbf7ee' : '#b8b1a2';
    let s = `<g data-part="window">${box(x - 2, y - 2, w + 4, h + 4, frame)}${box(x, y, w, h, ok ? url('Glass') : url('Grime'))}`;
    if (ok) {
      s += `<path d="M${x} ${y} h7 q-3 ${h / 2} 0 ${h} h-7Z M${x + w} ${y} h-7 q3 ${h / 2} 0 ${h} h7Z" fill="#e7a29b"/>`;
      s += [[x + 2, y + 4], [x + 4, y + 10], [x + 2, y + 16], [x + w - 3, y + 4], [x + w - 5, y + 10], [x + w - 3, y + 16]].map(([a, b]) => dot(a, b, 0.8, '#fff', 0.8)).join('');
      s += `<path d="M${x + 15} ${y + h} h8 l-1 -4 h-6Z" fill="#c9764a"/>${dot(x + 19, y + h - 6, 3, '#5d9644')}${dot(x + 18, y + h - 8, 1.2, '#ef8aa6')}`;
      s += `<path d="M${x + 10} ${y + 3} l8 -1 M${x + 24} ${y + 3} l5 -0.6" stroke="#fff" stroke-width="1.2" opacity="0.6"/>`;
    } else {
      s += `<path d="M${x + w - 12} ${y} l12 0 l0 9Z" fill="#fff" opacity="0.18"/>${line(`M${x + 6} ${y} l4 7 l-3 6 l5 9`, '#e6ece0', 0.6)}${line(`M${x} ${y} l6 0 M${x} ${y} l4 4 M${x} ${y} l0 6`, '#e1ddd5', 0.4)}`;
    }
    s += `<path d="M${f1(x + w / 3)} ${y} V${y + h} M${f1(x + (2 * w) / 3)} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}" stroke="${frame}" stroke-width="1.4"/>`;
    s += box(x - 3, y + h + 1, w + 6, 3, frame, ' rx="1"');
    if (ok) {
      // a window box with whatever is in flower
      s += box(x - 1, y + h + 4, w + 2, 6, '#a8743c', ' rx="1"');
      const cols = { spring: ['#f2d84a', '#ffffff', '#e2574c'], summer: ['#e2574c', '#ef8aa6', '#ffffff'], autumn: ['#e9962c', '#9a2f4a', '#d9822b'], winter: null }[SEASON];
      for (let i = 0; i < 7; i++) {
        const bx = x + 2 + i * 5.6;
        s += dot(bx, y + h + 3.4, 2.6, i % 2 ? '#5d9644' : '#4f8a3c');
        if (cols) s += dot(bx + 0.6, y + h + 1.6, 1.3, cols[i % 3]);
        else s += dot(bx + 0.6, y + h + 2, 0.9, '#d9483b');
      }
    }
    if (p === 'frost') s += `${box(x, y, w, h, url('Frost'), ' opacity="0.88"')}${line(`M${x + 2} ${y + 18} q6 -3 9 -10 M${x + w - 2} ${y + 4} q-7 2 -9 9`, '#fff', 1.2)}`;
    else if (p === 'grow') s += box(x, y, w, h, url('Dusty'), ' opacity="0.55"');
    if (winter() || p === 'snow') s += box(x - 3, y + h + (ok ? 2.6 : 0), w + 6, 2, SNOW, ' rx="1"');
    return s + '</g>';
  }
  // the cottage garden between the wall and the fence, and the path to the gate
  function garden() {
    const r = U.rng(29);
    let s = `<path d="M38 275 H50 L52 296 H36Z" fill="${PCT > 0.4 ? '#d9ccb2' : '#b9ae96'}"/>`;
    const cols = { spring: ['#f2d84a', '#ffffff', '#a98bd6'], summer: ['#e2574c', '#ef8aa6', '#9b7fd1'], autumn: ['#e9962c', '#c9586e', '#d8b844'], winter: null }[SEASON];
    for (let x = 8; x < 110; x += 4.6) {
      if (x > 33 && x < 55) continue;
      const y = 276 + r() * 5;
      if (PCT > 0.5 && cols) s += line(`M${f1(x)} ${f1(y + 2)} V${f1(y - 3)}`, '#5f8a3a', 0.8) + dot(x, y - 3.6, 1.6, U.pick(r, cols));
      else if (PCT > 0.5) s += dot(x, y, 1.8, '#3f6b4a');
      else s += weed(x, y + 3, 6, r);
    }
    return s;
  }
  function fence(st, C) {
    const p = pend(st, 'fence'), ok = st.fence;
    const c = ok ? C.lockFence : U.mix(C.lockFence, '#a59e90', 0.55), dk = U.shade(c, -0.3);
    const r = U.rng(37);
    let s = `<g data-part="fence">${shadow(60, 298, 56, 1.6)}`;
    const rails = ok ? 'M6 286 H34 M54 286 H112 M6 293 H34 M54 293 H112' : 'M6 286 H34 M54 286 H80 M88 287.4 L112 285 M6 293 H34 M54 293 H112';
    s += `<path d="${rails}" stroke="${dk}" stroke-width="2.6"/><path d="${rails}" stroke="${c}" stroke-width="1.6"/>`;
    const picket = (x, tilt) => `<path${tilt ? ` transform="rotate(${tilt} ${f1(x)} 297)"` : ''} d="M${f1(x - 1.4)} 297 V284.4 L${f1(x)} 282 L${f1(x + 1.4)} 284.4 V297Z" fill="${c}" stroke="${dk}" stroke-width="0.5"/>`;
    for (let x = 8; x < 113; x += 6) {
      if (x > 33 && x < 55) continue;
      const k = r();
      if (!ok && k < 0.16) continue;
      s += picket(x, !ok && k > 0.8 ? (k > 0.9 ? 9 : -7) : 0);
    }
    // the gate, standing a little open
    s += `<g transform="translate(36 0) skewY(${ok ? -6 : -14})"><path d="M0 285 H14 M0 293 H14" stroke="${c}" stroke-width="1.8"/>${[1.6, 7, 12.4].map((x) => `<path d="M${x - 1.3} 297 V284.6 L${x} 282.4 L${x + 1.3} 284.6 V297Z" fill="${c}" stroke="${dk}" stroke-width="0.5"/>`).join('')}</g>`;
    if (!ok) s += `${oval(20, 289, 3, 1.4, '#d8cfbf', 0.7)}${oval(70, 291, 2.6, 1.2, '#d8cfbf', 0.7)}<g transform="rotate(80 96 297)">${picket(96, 0)}</g>`;
    if (p === 'grow') s += box(6, 282, 106, 15, FADE, ' opacity="0.42"');
    if (winter() || p === 'snow') {
      let caps = '';
      for (let x = 8; x < 113; x += 6) if (x < 33 || x > 55) caps += `M${x - 1.6} 283.4 L${x} 281.4 L${x + 1.6} 283.4 `;
      s += `<path d="${caps}" stroke="${SNOW}" stroke-width="1.6" fill="none" stroke-linecap="round"/>${line('M6 285 H34 M54 285 H112', SNOW, 1.2)}`;
    }
    return s + '</g>';
  }

  // --------------------------------------------------------------- the sign
  function sign(st, C) {
    const p = pend(st, 'sign'), ok = st.sign;
    const c = ok ? C.lockSign : U.mix(C.lockSign, '#a59e90', 0.6), tx = ok ? ink(c) : '#efe9dc';
    const x = 290, y = 248, w = 68, h = 27;
    let s = `<g data-part="sign">${shadow(324, 299, 30, 2)}${box(299, 268, 3.4, 31, '#5a4a3a')}${box(346, 268, 3.4, 31, '#5a4a3a')}`;
    s += `<g${ok ? '' : ' transform="rotate(-5 300 275)"'}><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${c}" stroke="${ok ? U.shade(c, -0.3) : '#8a8070'}" stroke-width="1.2"/>`;
    if (ok) s += `<rect x="${x + 2.6}" y="${y + 2.6}" width="${w - 5.2}" height="${h - 5.2}" rx="2" fill="none" stroke="${tx}" stroke-width="0.7" opacity="0.8"/>`;
    s += `<text x="324" y="${y + 12.4}" text-anchor="middle" font-family="${FONT}" font-size="8" font-weight="900" letter-spacing="0.3" fill="${tx}"${ok ? '' : ' opacity="0.42"'}>KINGFISHER</text>
      <text x="324" y="${y + 21.2}" text-anchor="middle" font-family="${FONT}" font-size="6.2" font-weight="800" letter-spacing="0.6" fill="${tx}"${ok ? '' : ' opacity="0.42"'}>LOCK No 7</text>`;
    if (!ok) s += `${oval(306, 256, 4, 2.6, '#9aa36a', 0.8)}${oval(338, 268, 5, 2.2, '#9aa36a', 0.7)}${oval(330, 257, 3, 2, U.mix(C.lockSign, '#a59e90', 0.75), 0.9)}${line(`M${x + 44} ${y} l-3 8 l2 6`, '#5a4a3a', 0.8)}`;
    if (p === 'grow') s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${FADE}" opacity="0.5"/>`;
    else if (p === 'frost') s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${url('Frost')}" opacity="0.5"/>`;
    else if (p === 'leaves') s += oval(x + 8, y + 22, 3.4, 1.6, '#d9822b') + oval(x + 58, y + 6, 3, 1.4, '#c4462f');
    if (winter() || p === 'snow') s += `<rect x="${x - 1}" y="${y - 1.6}" width="${w + 2}" height="2.6" rx="1.3" fill="${SNOW}"/>`;
    return s + '</g></g>';
  }

  // ------------------------------------------------- the willow and the boat
  function willow() {
    const W = WILLOW[SEASON], r = U.rng(73);
    let s = shadow(380, 301, 26, 3);
    s += `<path d="M373 301 Q375 270 376 232 L386 232 Q385 270 389 301Z" fill="#7a6252"/><path d="M379 296 q-1 -14 1 -26" stroke="#5f4532" stroke-width="0.8" fill="none"/>`;
    if (!W) {
      let twigs = '';
      for (let i = -5; i <= 5; i++) twigs += `M381 228 Q${381 + i * 6} 206 ${381 + i * 9} 226 T${381 + i * 11} ${280 + (i % 3) * 6} `;
      return s + `<path d="${twigs}" stroke="#9a8a6a" stroke-width="0.8" fill="none"/>${line('M366 214 q15 -10 30 0', SNOW, 1.6)}`;
    }
    s += `${dot(381, 218, 22, W[1])}${dot(366, 226, 15, W[0])}${dot(396, 224, 16, W[0])}${dot(380, 206, 13, W[2])}`;
    let strands = '';
    for (let i = 0; i < 24; i++) {
      const x = 348 + i * 2.7 + (r() - 0.5) * 2, y0 = 214 + Math.abs(i - 12) * 0.8, y1 = 266 + r() * 26;
      strands += line(`M${f1(x)} ${f1(y0)} Q${f1(x + 2)} ${f1((y0 + y1) / 2)} ${f1(x - 1)} ${f1(y1)}`, W[i % 3], 2.2);
    }
    return s + `<g class="kc-sway">${strands}</g>`;
  }
  function dinghy(st, C) {
    const p = pend(st, 'dinghy'), ok = st.dinghy;
    const hull = ok ? C.dinghy : U.mix(C.dinghy, '#a59e90', 0.62), x = 350, y = 330;
    let s = `<g data-part="dinghy">${line(`M${x + 29} ${y - 6} Q${x + 30} ${y - 16} 364 295`, '#c9b48a', 1)}${oval(x, y + 8, 36, 3, '#fff', 0.2)}`;
    s += `<g transform="translate(${x} ${y})${ok ? '' : ' rotate(4)'}"><g${ok ? ' class="kc-bob"' : ''}>`;
    s += `<path d="M-34 -9 Q-2 -3 31 -6 L29 -10.5 Q0 -7.5 -31 -13.5Z" fill="${ok ? '#d6ad78' : '#a08a6a'}"/>`;
    if (ok) s += `<path d="M-12 -5 l2 -6 M10 -4.6 l1 -5.6" stroke="#8a5a3c" stroke-width="2.4"/><path d="M-8 -9 L24 -17" stroke="#d9b07a" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="27" cy="-17.8" rx="4" ry="1.6" fill="#d9b07a" transform="rotate(-14 27 -17.8)"/>`;
    else s += `${oval(-2, -8.6, 22, 1.8, '#7f9a8a', 0.9)}${oval(-10, -9, 2.4, 1, '#c4462f')}${oval(8, -8.4, 2.2, 0.9, '#9c5a2a')}`;
    s += `<path d="M-34 -9 Q-28 5 -12 8 L20 8 Q29 6 31 -6 Q-2 -3 -34 -9Z" fill="${hull}"/>
      <path d="M-30 1 Q0 5 28 2" stroke="${U.shade(hull, -0.22)}" stroke-width="0.7" fill="none"/>
      <path d="M-33 -6.6 Q-2 -0.6 30.5 -3.6" stroke="${ok ? '#fbf7ee' : U.shade(hull, 0.18)}" stroke-width="${ok ? 2.4 : 1}" fill="none"/>
      <path d="M-34 -9 Q-2 -3 31 -6" stroke="${U.shade(hull, -0.35)}" stroke-width="1.4" fill="none"/>`;
    if (!ok) s += `${[[-20, -1], [-6, 2], [8, 0], [18, -2]].map(([a, b]) => oval(a, b, 3, 1.6, '#cfc6b6', 0.8)).join('')}<path d="M-28 4 Q0 9 24 5" stroke="#6f8a3e" stroke-width="2" fill="none" opacity="0.7"/>`;
    if (p === 'grow') s += `<path d="M-34 -9 Q-28 5 -12 8 L20 8 Q29 6 31 -6 Q-2 -3 -34 -9Z" fill="${FADE}" opacity="0.5"/>`;
    else if (p === 'frost') s += `<path d="M-34 -9 Q-28 5 -12 8 L20 8 Q29 6 31 -6 Q-2 -3 -34 -9Z" fill="${url('Frost')}" opacity="0.5"/>`;
    if (winter() || p === 'snow') s += `<path d="M-31 -12.4 Q0 -8.6 29 -9.6 L30 -7 Q0 -5 -32 -10Z" fill="${SNOW}"/>`;
    if (p === 'leaves') s += oval(-8, -9, 3.6, 1.6, '#d9822b') + oval(8, -9.6, 3.2, 1.5, '#c4462f') + oval(18, -9, 2.6, 1.2, '#e9b23c');
    // the bottom of the boat under the water
    s += `<path d="M-31 3 Q0 9 27 3 V10 H-31Z" fill="${K.water[1]}" opacity="0.5"/>`;
    return s + '</g></g></g>';
  }

  // ------------------------------------------------------- the narrowboat
  // roses and castles, the old canal painting, on a panel by the stern
  function castlePanel(x, y) {
    let s = `<rect x="${x}" y="${y}" width="44" height="28" rx="3" fill="#2b2a2e"/><rect x="${x + 1.6}" y="${y + 1.6}" width="40.8" height="24.8" rx="2" fill="none" stroke="#e9c35a" stroke-width="0.8"/>`;
    s += `${box(x + 3, y + 3, 38, 15, '#9fd0e6')}<path d="M${x + 3} ${y + 17} Q${x + 14} ${y + 11} ${x + 26} ${y + 15} T${x + 41} ${y + 14} V${y + 19} H${x + 3}Z" fill="#6aa04c"/>${box(x + 3, y + 18.6, 38, 2.6, '#5fa0c8')}`;
    const cx = x + 22, cy = y + 17;
    s += `${box(cx - 7, cy - 8, 14, 8, '#f6efe0')}${box(cx - 10, cy - 11, 5, 11, '#fbf7ee')}${box(cx + 5, cy - 10, 5, 10, '#fbf7ee')}
      <path d="M${cx - 10.6} ${cy - 11} L${cx - 7.5} ${cy - 14.6} L${cx - 4.4} ${cy - 11}Z M${cx + 4.4} ${cy - 10} L${cx + 7.5} ${cy - 13.6} L${cx + 10.6} ${cy - 10}Z" fill="#d9483b"/>
      <rect x="${cx - 1.6}" y="${cy - 4}" width="3.2" height="4" rx="1.6" fill="#3d3d42"/><path d="M${cx - 7.5} ${cy - 14.6} v-2.6 l2.6 0.9Z" fill="#d9483b"/>`;
    for (const [dx, col] of [[6, '#d9483b'], [13, '#f2c230'], [20, '#ef8aa6'], [27, '#d9483b'], [34, '#f6efe0'], [39, '#f2c230']]) {
      s += oval(x + dx - 2.4, y + 24.4, 2.4, 1.1, '#4f8a3c') + dot(x + dx, y + 23.2, 2.3, col) + `<path d="M${f1(x + dx - 1.2)} ${f1(y + 23.2)} q1.2 -1.4 2.4 0" stroke="${U.shade(col, -0.3)}" stroke-width="0.6" fill="none"/>`;
    }
    return s;
  }
  const CABIN_D = `M${CABIN.x0} ${CABIN.y1} V${CABIN.y0 + 3} Q${CABIN.x0} ${CABIN.y0} ${CABIN.x0 + 3} ${CABIN.y0} H${CABIN.x1 - 3} Q${CABIN.x1} ${CABIN.y0} ${CABIN.x1} ${CABIN.y0 + 3} V${CABIN.y1}Z`;
  function boat(st, C) {
    const p = pend(st, 'boat'), ok = st.boat;
    const c = ok ? C.narrowboat : U.mix(C.narrowboat, '#a59e90', 0.62), tx = ink(c), { x0, x1, y0, y1 } = CABIN;
    let s = `<g data-part="boat"><path d="${HULL_D}" fill="${ok ? url('Hull') : '#57534f'}"/>`;
    // a band of the boat's colour along the top of the hull, and the rubbing strake
    s += `<path d="M14 397 Q22 403 42 403 L292 403 Q312 403 330 391.6" stroke="${ok ? U.shade(c, -0.12) : '#7a756c'}" stroke-width="2.4" fill="none"/><path d="M22 414 H312" stroke="#fff" stroke-width="0.8" opacity="0.14"/>`;
    if (!ok) s += `${oval(64, 411, 9, 3, '#8a5a3a', 0.55)}${oval(188, 413, 12, 3.4, '#8a5a3a', 0.5)}${oval(272, 410, 7, 2.6, '#8a5a3a', 0.55)}`;
    s += `<path d="${CABIN_D}" fill="${c}"/>`;
    if (ok) {
      s += `<rect x="${x0 + 3}" y="${y0 + 3}" width="${x1 - x0 - 6}" height="${y1 - y0 - 6}" rx="2" fill="none" stroke="${tx}" stroke-width="0.9" opacity="0.85"/>`;
      s += castlePanel(x0 + 6, y0 + 5);
      s += `<text x="${(x0 + 56 + x1) / 2}" y="${y0 + 10.8}" text-anchor="middle" font-family="${FONT}" font-size="7" font-weight="900" letter-spacing="1.4" fill="${tx}">KINGFISHER</text>`;
      s += `<path d="M${x0 + 4} ${y0 + 1.6} H${x1 - 4}" stroke="#fff" stroke-width="1" opacity="0.25"/>`;
    } else {
      // faded and peeling, rust running from under the portholes, the old name a ghost
      const r = U.rng(47);
      for (let i = 0; i < 14; i++) s += oval(x0 + 6 + r() * (x1 - x0 - 12), y0 + 4 + r() * (y1 - y0 - 8), 2 + r() * 4, 1.2 + r() * 2, r() < 0.6 ? '#d8cfbf' : '#c49a7a', 0.75);
      s += PORTS.map((x) => line(`M${x} ${PORT_Y + 7} q-0.6 4 0.4 8`, '#8a5a3a', 1.1, 0.6)).join('');
      s += `<text x="${(x0 + 56 + x1) / 2}" y="${y0 + 10.8}" text-anchor="middle" font-family="${FONT}" font-size="7" font-weight="900" letter-spacing="1.4" fill="#efe9dc" opacity="0.28">KINGFISHER</text>`;
    }
    if (p === 'grow') s += `<path d="${CABIN_D}" fill="${FADE}" opacity="0.5"/>`;
    else if (p === 'frost') s += `<path d="${CABIN_D}" fill="${url('Frost')}" opacity="0.45"/>`;
    else if (p === 'leaves') s += oval(x0 + 70, y1 - 2, 3.4, 1.4, '#d9822b') + oval(x0 + 150, y1 - 1.6, 3, 1.3, '#c4462f');
    // rope fenders hanging over the side
    for (const x of [92, 236]) s += `${line(`M${x} 401 V405`, '#a8946a', 1)}${oval(x, 410, 3.2, 5.4, '#c9b48a')}${line(`M${x - 3} 408 h6 M${x - 3} 412 h6`, '#a8946a', 0.6)}`;
    return s + '</g>';
  }
  function portholes(st) {
    const p = pend(st, 'portholes'), ok = st.portholes, y = PORT_Y;
    let s = '<g data-part="portholes">';
    PORTS.forEach((x, i) => {
      s += dot(x, y, 7.6, ok ? '#d9b04a' : '#8a7f6a') + dot(x, y, 6, ok ? '#b8902f' : '#6f665a') + dot(x, y, 5.2, ok ? url('Glass') : url('Grime'));
      if (ok) {
        s += `<path d="M${f1(x - 5.2)} ${f1(y - 0.6)} Q${x} ${f1(y - 6.8)} ${f1(x + 5.2)} ${f1(y - 0.6)} Q${x} ${f1(y - 3.2)} ${f1(x - 5.2)} ${f1(y - 0.6)}Z" fill="#fbf3f0" opacity="0.9"/>`;
        s += line(`M${f1(x - 2.6)} ${f1(y + 2.8)} l3 -3`, '#fff', 1, 0.75) + dot(x - 4.6, y - 4.6, 1, '#fff6d8', 0.9);
      } else {
        s += dot(x - 1.6, y + 1.4, 1, '#4f5e38', 0.7) + dot(x + 2, y - 1, 0.8, '#4f5e38', 0.6);
        if (i === 2) s += line(`M${x - 4} ${y - 2} l3 2 l2 -2 l3 3`, '#e6ece0', 0.6);
      }
      if (p === 'frost') s += dot(x, y, 5.2, url('Frost'), 0.92) + line(`M${f1(x - 3)} ${f1(y + 2)} q2 -1 2.6 -4`, '#fff', 0.8);
      else if (p === 'grow') s += dot(x, y, 5.2, url('Dusty'), 0.6);
      if (winter() || p === 'snow') s += `<path d="M${f1(x - 6)} ${f1(y - 5.6)} Q${x} ${f1(y - 9.8)} ${f1(x + 6)} ${f1(y - 5.6)}" stroke="${SNOW}" stroke-width="1.4" fill="none"/>`;
    });
    return s + '</g>';
  }
  const crate = (x, y, w, h, col) => `${box(x, y, w, h, col, ' rx="0.8"')}<path d="M${x} ${f1(y + h / 2)} H${x + w} M${f1(x + w / 3)} ${y} V${y + h} M${f1(x + (2 * w) / 3)} ${y} V${y + h}" stroke="${U.shade(col, -0.25)}" stroke-width="0.7"/>${box(x, y, w, 1, '#fff', ' opacity="0.2"')}`;
  function hold(st) {
    const p = pend(st, 'hold'), ok = st.hold;
    let s = `<g data-part="hold"><path d="M240 401 V368 H296 V401Z" fill="#3a3530"/>`;
    if (ok) {
      s += crate(242, 386, 17, 15, '#c9924f') + crate(260, 386, 17, 15, '#b77b48') + crate(278, 386, 16, 15, '#c9924f');
      s += crate(246, 372, 15, 14, '#b77b48') + crate(263, 372, 15, 14, '#d19a5a') + crate(280, 376, 13, 10, '#a8743c');
      if (p !== 'grow') s += [[250, 372, '#d9483b'], [255, 371.4, '#e2574c'], [252, 370.4, '#b9cf5a'], [267, 371.6, '#f2d84a'], [272, 372, '#ef8aa6'], [269, 370.4, '#ffffff']].map(([a, b, cc]) => dot(a, b, 1.8, cc)).join('');
      s += `<rect x="240" y="363.4" width="57" height="5.4" rx="2.7" fill="#3f6b4a"/><path d="M244 366 H293" stroke="#2f5238" stroke-width="0.7"/>${line('M252 368.8 v3 M270 368.8 v3 M288 368.8 v6', '#e9dcc0', 0.8)}`;
    } else {
      s += `<path d="M240 364 L296 360 L293 377 Q281 386 271 375 Q262 392 252 380 Q246 388 241 382Z" fill="#5f6a5a"/>${line('M271 375 l-2 9 M252 380 l1 8 M284 382 l3 7', '#4a5244', 1)}`;
      s += `<g transform="rotate(-18 270 398)">${box(262, 390, 16, 12, '#8a7a62')}<path d="M262 396 H278 M267 390 V402" stroke="#6b5a44" stroke-width="0.7"/></g>`;
      s += `<ellipse cx="286" cy="397" rx="7" ry="3" fill="none" stroke="#2f2e33" stroke-width="2.4"/>${line('M244 393 q6 -4 10 0 q4 4 9 0', '#c9b48a', 1)}`;
    }
    // the top plank, and the cratch board at the front of the hold
    s += `<path d="M240 362 L298 351" stroke="${ok ? '#b77b48' : '#8a8172'}" stroke-width="2.4" stroke-linecap="round"/><path d="M293 401 L298 349 L305 401Z" fill="${ok ? '#2b2a2e' : '#6d6a62'}"/>`;
    if (ok) s += `<path d="M298.6 358 l2.4 8 l-2.4 8 l-2.4 -8Z M299.4 378 l2.6 8 l-2.6 8 l-2.6 -8Z" fill="#d9483b"/>${dot(298.8, 366, 1, '#f2c230')}${dot(299.6, 386, 1, '#f2c230')}`;
    if (p === 'grow') s += `<path d="M240 401 V363 H296 V401Z" fill="${FADE}" opacity="0.4"/>`;
    else if (p === 'frost') s += `<path d="M240 401 V363 H296 V401Z" fill="${url('Frost')}" opacity="0.45"/>`;
    else if (p === 'leaves') s += oval(252, 364, 3.4, 1.4, '#d9822b') + oval(276, 364.6, 3, 1.3, '#c4462f') + oval(266, 371, 2.6, 1.2, '#e9b23c');
    if (winter() || p === 'snow') s += `${box(240, 362, 57, 2.6, SNOW, ' rx="1.3"')}${line('M246 372 h15 M263 372 h15', SNOW, 1.4)}`;
    return s + '</g>';
  }
  // terracotta pots with whatever is in flower, along the cabin roof
  const ROOF_FLOWERS = { spring: ['#f2d84a', '#ffffff', '#e2574c'], summer: ['#d9483b', '#ef8aa6', '#ffffff'], autumn: ['#e9962c', '#9a2f4a', '#d9822b'], winter: ['#3f6b4a', '#d9483b', '#3f6b4a'] };
  function pot(x, base, w, i, ok) {
    const h = w * 1.25, col = ROOF_FLOWERS[SEASON][i % 3];
    let s = `${shadow(x, base, w + 1, 1.2)}<path d="M${f1(x - w)} ${f1(base - h)} h${f1(w * 2)} l${f1(-w * 0.25)} ${f1(h)} h${f1(-w * 1.5)}Z" fill="#c9764a"/>${box(x - w - 0.8, base - h - 1.8, w * 2 + 1.6, 2.4, '#d98b63', ' rx="1"')}`;
    if (!ok) return s + dot(x, base - h - 2.4, w * 0.6, '#9a9a5a') + line(`M${f1(x)} ${f1(base - h - 2)} l-2 -4 M${f1(x)} ${f1(base - h - 2)} l2 -3`, '#8a7a5a', 0.8);
    s += dot(x, base - h - 3, w * 0.75, '#4f8a3c') + dot(x - w * 0.4, base - h - 4, w * 0.45, '#5d9644');
    if (SEASON === 'winter') return s + dot(x + 1, base - h - 4.6, 1.2, '#d9483b') + dot(x - 1.4, base - h - 3.6, 1, '#d9483b');
    return s + [[-3, -6], [2.4, -7.4], [0, -9], [3.6, -4], [-4, -3]].map(([dx, dy]) => dot(x + (dx * w) / 8, base - h + (dy * w) / 8 - 2, (1.6 * w) / 8 + 0.4, col)).join('');
  }
  function roof(st) {
    const p = pend(st, 'roof'), ok = st.roof && p !== 'grow', { x0, x1, y0 } = CABIN;
    let s = `<g data-part="roof"><path d="M${x0} ${y0} L${x0 + 2} ${y0 - 6} H${x1 - 2} L${x1} ${y0}Z" fill="${st.roof ? '#9a5a44' : '#7d6a5a'}"/><path d="M${x0 + 2} ${y0 - 6} H${x1 - 2}" stroke="#fff" stroke-width="0.8" opacity="0.22"/>`;
    if (!st.roof) {
      s += `${oval(110, 359, 9, 1.8, '#8a5a3a', 0.6)}${oval(196, 358.6, 12, 1.8, '#8a5a3a', 0.5)}`;
      s += `<g transform="rotate(-80 120 356)"><path d="M114 350 h12 l-1.6 10 h-8.8Z" fill="#7d8792"/></g>${line('M114 350 q-4 -3 -2 -6', '#5f6870', 0.8)}`;
      s += `<path d="M156 357 l3 -6 l4 2 l2 -4 l3 8Z" fill="#b5694a"/>${oval(206, 353, 12, 4.4, '#6d7468')}${line('M198 352 q8 -3 16 1 M200 355 q6 2 12 0', '#5a6058', 0.8)}`;
      s += line('M140 356 l-2 -6 M140 356 l1 -7 M140 356 l3 -5', '#6f8a3e', 1);
    } else {
      // the boat pole and the gangplank, and pots and a long trough of flowers
      s += line('M100 353.4 L234 351.6', '#b77b48', 1.6) + line('M104 355.4 L228 354.4', '#a8743c', 2.2);
      s += pot(108, 356, 5.4, 0, ok) + pot(121, 356, 4.4, 1, ok) + pot(133, 356, 5, 2, ok);
      s += `<path d="M178 356 h38 l-1.4 -7 h-35.2Z" fill="#3f6b8a"/>${box(177, 347.6, 40, 2, '#2f5a78', ' rx="1"')}`;
      for (let i = 0; i < 7; i++) {
        const x = 182 + i * 5.2;
        s += dot(x, 346, 2.6, i % 2 ? '#5d9644' : '#4f8a3c');
        if (ok) s += dot(x + 0.6, 344.4, 1.3, ROOF_FLOWERS[SEASON][i % 3]);
        else s += dot(x + 0.4, 344.8, 1, '#a89a6a');
      }
      s += `<ellipse cx="228" cy="353.6" rx="5" ry="2" fill="none" stroke="#c9b48a" stroke-width="1.6"/><ellipse cx="228" cy="352.4" rx="3" ry="1.2" fill="none" stroke="#c9b48a" stroke-width="1.2"/>`;
    }
    if (p === 'leaves') s += oval(114, 355, 3, 1.4, '#d9822b') + oval(160, 355.4, 3.2, 1.4, '#c4462f') + oval(200, 355, 2.8, 1.3, '#e9b23c') + oval(150, 355.8, 2.6, 1.2, '#9c5a2a');
    if (winter() || p === 'snow') s += `<path d="M${x0 + 1} ${y0 - 4.4} Q${x0 + 3} ${y0 - 8} ${x0 + 8} ${y0 - 7} H${x1 - 8} Q${x1 - 3} ${y0 - 8} ${x1 - 1} ${y0 - 4.4} L${x1 - 2} ${y0 - 5} H${x0 + 2}Z" fill="${SNOW}"/>${st.roof ? oval(121, 347, 14, 1.8, SNOW) + oval(197, 344.6, 20, 1.8, SNOW) : ''}`;
    return s + '</g>';
  }
  // the chimney, the tiller at the stern and a fender on the bow
  function boatBits(st) {
    let s = `${box(63, 334, 7, 22, '#2b2a2e')}${box(62, 333, 9, 2.6, '#1f1e22', ' rx="1"')}${box(63, 340, 7, 1.6, st.boat ? '#e9c35a' : '#8a7f6a')}${box(63, 349, 7, 1.6, st.boat ? '#e9c35a' : '#8a7f6a')}`;
    if (winter()) s += box(62, 331.6, 9, 1.8, SNOW, ' rx="0.9"');
    if (st.boat && st.roof) s += '<g class="smoke" fill="#ffffff"><circle cx="67" cy="322" r="3.4" opacity="0.7"/><circle cx="70" cy="312" r="4.6" opacity="0.5"/><circle cx="68" cy="299" r="6" opacity="0.3"/></g>';
    s += `<path d="M15 396 Q9 386 13 376 Q16 369 24 369" stroke="#2b2a2e" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M23 369 L38 367.6" stroke="#7a5a42" stroke-width="2.6" stroke-linecap="round"/>${dot(39, 367.4, 1.8, st.boat ? '#e9c35a' : '#8a7f6a')}`;
    s += `${oval(334.4, 408, 3.8, 6.6, '#c9b48a')}${line('M331 404 h7 M331 408 h7 M331 412 h7', '#a8946a', 0.6)}${oval(10, 404, 3, 5, '#c9b48a')}`;
    return s;
  }

  // ------------------------------------------------------------ the towpath
  function towpath(st) {
    const p = pend(st, 'towpath'), ok = st.towpath && p !== 'grow';
    let s = `<g data-part="towpath"><path d="${TOW_D}" fill="${st.towpath ? url('Flag') : url('FlagOld')}"/>`;
    const tufts = (n, seed) => {
      const r = U.rng(seed);
      let t = '';
      for (let i = 0; i < n; i++) { const x = r() * 400, y = 432 + r() * 44; t += line(`M${f1(x)} ${f1(y)} l-2 -5 M${f1(x)} ${f1(y)} l0.6 -6 M${f1(x)} ${f1(y)} l3 -4`, '#5f7a34', 1.2); }
      return t;
    };
    if (!st.towpath) {
      s += `<path d="${TOW_D}" fill="${url('Moss')}" opacity="0.45"/>${tufts(22, 83)}${oval(150, 452, 14, 3.4, '#7d8a8a', 0.7)}${oval(300, 468, 10, 2.6, '#7d8a8a', 0.7)}`;
      s += line('M80 436 l6 6 l-2 8 M220 446 l-5 7 l3 9 M352 440 l4 9', '#5a5446', 0.9, 0.8);
    } else if (p === 'grow') s += `<path d="${TOW_D}" fill="${url('Moss')}" opacity="0.3"/>${tufts(8, 89)}`;
    if (p === 'leaves') s += `<path d="${TOW_D}" fill="${url('Leaves')}"/>`;
    else if (p === 'snow') s += `<path d="${TOW_D}" fill="${url('Snow')}" opacity="0.95"/>`;
    else if (p === 'frost') s += `<path d="${TOW_D}" fill="${url('Frost')}" opacity="0.5"/>`;
    else if (winter() && st.towpath) s += `<path d="M0 466 Q100 460 200 466 T400 464 V478 H0Z" fill="${SNOW}" opacity="0.9"/>`;
    // the coping stones along the water's edge
    s += box(0, 421, 400, 7, ok ? K.stone : '#a9a38c') + box(0, 421, 400, 1.2, '#fff', ' opacity="0.3"') + box(0, 427, 400, 1.4, '#000', ' opacity="0.1"');
    let joints = '';
    for (let x = 18; x < 400; x += 26) joints += `M${x} 421.6 V427.6 `;
    s += `<path d="${joints}" stroke="${U.shade(K.stone, -0.18)}" stroke-width="0.7"/>`;
    if (winter()) s += box(0, 420, 400, 2.2, SNOW);
    return s + '</g>';
  }
  // the mooring ropes, a ring by the stern and a bollard by the bow
  function ropes() {
    return `${line('M17 398 Q24 420 38 430', '#c9b48a', 1.2)}<circle cx="38" cy="432" r="2.6" fill="none" stroke="#3d3d42" stroke-width="1.2"/>
      ${line('M327 394 Q342 420 352 428', '#c9b48a', 1.2)}${box(348, 426, 8, 9, '#2f2e33', ' rx="2"')}${box(346.6, 425, 10.8, 2.6, '#1f1e22', ' rx="1.3"')}${winter() ? box(346.6, 423.6, 10.8, 1.8, SNOW, ' rx="0.9"') : ''}`;
  }
  // the grass verge along the front, with wildflowers in season
  function verge() {
    const g = K.grass, r = U.rng(91);
    let s = `${box(0, 478, 400, 62, g[0])}${box(0, 478, 400, 3, '#000', ' opacity="0.08"')}`;
    const cols = { spring: ['#f2d84a', '#ffffff', '#f7c3d6'], summer: ['#ffffff', '#9b7fd1', '#f2c230', '#e2574c'], autumn: ['#e9962c', '#d8c27a'], winter: null }[SEASON];
    for (let i = 0; i < 46; i++) {
      const x = r() * 400, y = 486 + r() * 52;
      s += line(`M${f1(x)} ${f1(y)} l-2 -5 M${f1(x)} ${f1(y)} l0.6 -6 M${f1(x)} ${f1(y)} l2.6 -4`, i % 2 ? g[1] : U.shade(g[1], -0.1), 1);
      if (cols && PCT > 0.3 && i % 3 === 0) s += dot(x + 0.6, y - 6.6, 1.6, U.pick(r, cols)) + dot(x + 0.6, y - 6.6, 0.6, '#f2c230');
    }
    return s;
  }
  // ------------------------------------------------------------- the litter
  const LITTER = [
    () => `<g transform="rotate(-20 56 446)"><path d="M50 441 h12 l-1 9 h-10Z" fill="#d9483b"/>${box(51, 444, 10, 3, '#f2c230')}</g>`,
    () => `<g transform="rotate(70 104 462)">${box(100, 456, 7, 12, '#b8c0c8', ' rx="1.4"')}${box(100, 459, 7, 5, '#3f7ac9')}</g>`,
    () => `<g transform="rotate(-62 178 446)">${box(175, 438, 6, 13, '#bfe6f2', ' rx="2" opacity="0.9"')}${box(176.4, 435, 3.2, 3.4, '#3f7ac9')}</g>`,
    () => `<g><ellipse cx="246" cy="486" rx="10" ry="4" fill="none" stroke="#2b2a2e" stroke-width="3.6"/><ellipse cx="246" cy="485" rx="5" ry="1.6" fill="#3d3a36"/></g>`,
    () => `<g transform="rotate(78 300 452)"><path d="M294 458 L300 440 L306 458Z" fill="#e9762c"/>${box(296.6, 448, 6.8, 2.6, '#fff')}${box(292, 457.4, 16, 2.6, '#2b2a2e')}</g>`,
    () => `<g><path d="M372 504 q-6 -8 2 -12 q4 -6 10 -1 q8 2 4 10 q-4 6 -16 3Z" fill="#f4f6f8"/><path d="M376 496 q4 3 8 0" stroke="#3f7ac9" stroke-width="1.4" fill="none"/></g>`,
    () => `<g transform="rotate(-80 108 330)">${box(105, 323, 6, 13, '#cfe8e0', ' rx="2" opacity="0.9"')}${box(106.4, 320, 3.2, 3.4, '#4f8a3c')}</g>${oval(108, 333, 9, 1.6, '#fff', 0.35)}`,
  ];
  function litter(st) {
    const p = pend(st, 'litter');
    let s = '<g data-part="litter">';
    if (!st.litter) s += LITTER.map((f) => f()).join('');
    else if (p === 'grow') s += LITTER[0]() + LITTER[2]() + LITTER[5]();
    if (st.litter) s += `${shadow(366, 496, 8, 1.6)}${box(360, 480, 12, 16, '#3f6b4a', ' rx="1.6"')}${box(359, 478, 14, 3.2, '#2f5238', ' rx="1.4"')}${box(363, 486, 6, 4, '#e9e3d6', ' rx="0.6"')}`;
    if (winter() && st.litter) s += box(359, 476.6, 14, 2, SNOW, ' rx="1"');
    return s + '</g>';
  }
  // nettles and brambles while the place is neglected, an old pallet by the cottage
  function clutter() {
    if (PCT >= 0.5) return '';
    let s = '';
    const r = U.rng(97);
    for (const [x, y] of [[12, 500], [132, 520], [270, 530], [390, 512], [126, 290], [300, 240]]) for (let k = 0; k < 3; k++) s += weed(x + k * 4, y, 10, r);
    s += `<g transform="rotate(-12 122 270)">${box(116, 250, 4, 22, '#9a8a6a')}${box(116, 252, 14, 3, '#9a8a6a')}${box(116, 262, 14, 3, '#9a8a6a')}${box(126, 250, 4, 22, '#8a7a5a')}</g>`;
    return `<g opacity="${f1(1 - PCT * 1.6)}">${s}</g>`;
  }
  function saleSign() {
    if (!(FORSALE || PCT < 0.15)) return '';
    return `<g><rect x="350.5" y="508" width="3" height="26" fill="#8a6142"/><g transform="rotate(4 352 504)">
      <rect x="328" y="494" width="48" height="21" rx="2" fill="#f6efe0" stroke="#7d6e58" stroke-width="1.2"/>
      <text x="352" y="507.6" text-anchor="middle" font-family="${FONT}" font-size="8.4" font-weight="900" fill="#3d5a86">FOR SALE</text>
      ${FORSALE ? '' : `<g transform="rotate(-10 352 512)"><rect x="325" y="508" width="54" height="10" fill="#d9534f"/><text x="352" y="516" text-anchor="middle" font-family="${FONT}" font-size="8" font-weight="900" fill="#fff">SOLD</text></g>`}</g></g>`;
  }

  // ------------------------------------------------------------ decorations
  // Bought in the shed; each one is a small drawing at a fixed spot.
  function duck(x, y, mallard, flip) {
    return `<g transform="translate(${f1(x)} ${f1(y)})${flip ? ' scale(-1 1)' : ''}"><g class="kc-bob">${oval(0, 0, 5.6, 2.8, mallard ? '#8a7a64' : '#fbfbf8')}
      <path d="M-5 -1 q-3 -1 -3.6 1.4 q2 0.6 3.6 0Z" fill="${mallard ? '#6d5f4e' : '#e3dfd6'}"/>${dot(4, -3, 2.4, mallard ? '#2f7a4f' : '#fbfbf8')}
      <path d="M6 -3.2 l3 0.6 l-3 0.9Z" fill="#f2a33a"/>${dot(4.7, -3.7, 0.5, '#222')}${mallard ? '<path d="M2.4 -1.2 h3" stroke="#fff" stroke-width="0.7"/>' : ''}</g></g>`;
  }
  function swan(x, y, flip) {
    return `<g transform="translate(${f1(x)} ${f1(y)})${flip ? ' scale(-1 1)' : ''}">${oval(0, 3.4, 11, 1.6, '#fff', 0.3)}<path d="M-10 0 Q-8 -7 2 -6 Q8 -5 9 0 Q0 3 -10 0Z" fill="#fbfbf8"/><path d="M-9 -3 q4 -6 9 -3" stroke="#e8e6e0" stroke-width="1" fill="none"/>
      <path d="M6 -4 Q9 -12 6 -16 Q4 -19 7 -20" stroke="#fbfbf8" stroke-width="2.4" fill="none" stroke-linecap="round"/>${dot(7.6, -20, 1.8, '#fbfbf8')}<path d="M9 -20.4 l3.4 1 l-3.4 0.8Z" fill="#e9762c"/>${dot(8, -20.8, 0.5, '#222')}</g>`;
  }
  function buckby(x, base, col) {
    return `${box(x - 4.5, base - 11, 9, 11, col, ' rx="1"')}${box(x - 5, base - 12.4, 10, 2, U.shade(col, -0.2), ' rx="1"')}<path d="M${x - 3} ${base - 12.4} q3 -5 6 0" stroke="#3d3d42" stroke-width="0.8" fill="none"/>
      ${dot(x, base - 5.6, 2, '#d9483b')}${dot(x - 2.2, base - 4, 0.9, '#4f8a3c')}${dot(x + 2.2, base - 4, 0.9, '#4f8a3c')}${box(x - 4.5, base - 9.6, 9, 0.8, '#e9c35a')}${box(x - 4.5, base - 2.2, 9, 0.8, '#e9c35a')}`;
  }
  // bunting on a string that sags between two points
  function bunting(a, b, sag, n) {
    const cols = ['#d9483b', '#f2c230', '#3f7ac9', '#ffffff', '#4f8a3c', '#ef8aa6'];
    const at = (t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + sag * 4 * t * (1 - t)];
    let s = `<path d="M${a[0]} ${a[1]} Q${f1((a[0] + b[0]) / 2)} ${f1((a[1] + b[1]) / 2 + sag * 2)} ${b[0]} ${b[1]}" stroke="#6b6157" stroke-width="0.6" fill="none"/>`;
    for (let i = 1; i < n; i++) {
      const [x, y] = at(i / n);
      s += `<path class="kc-flag" d="M${f1(x - 2.6)} ${f1(y)} h5.2 l-2.6 5.4Z" fill="${cols[i % cols.length]}"/>`;
    }
    return s;
  }
  // fairy lights along the edge of the boat's roof and up the cratch
  const BULBS = (() => {
    const out = [];
    for (let x = 46; x <= 236; x += 8) out.push([x, 358 + ((x / 8) % 2) * 1.4]);
    for (let t = 0.15; t < 1; t += 0.2) out.push([240 + 58 * t, 362 - 11 * t + 1.4]);
    return out;
  })();
  const BULB_COLS = ['#ffe08a', '#ffb3c1', '#b3e5ff', '#c8f2b0'];
  function lantern(x, y) {
    return `${box(x - 0.8, y - 4, 1.6, 6, '#2f2f33')}${box(x - 3, y - 12, 6, 8, '#2f2f33', ' rx="1"')}${box(x - 2, y - 11, 4, 6, '#fde7a3')}<path d="M${x - 3.6} ${y - 12} L${x} ${y - 15.4} L${x + 3.6} ${y - 12}Z" fill="#2f2f33"/>`;
  }
  const DECOR = {
    'k-bench': () => `<g>${shadow(211, 512, 22, 2.2)}${box(190, 492, 42, 3.6, '#a77b56', ' rx="1.4"')}${box(190, 498, 42, 3.6, '#a77b56', ' rx="1.4"')}${box(190, 503, 42, 3.6, '#8a6142', ' rx="1.4"')}
      ${box(192, 506, 2.6, 7, '#3d3d42')}${box(227.4, 506, 2.6, 7, '#3d3d42')}${winter() ? box(190, 501.4, 42, 2, SNOW, ' rx="1"') : ''}</g>`,
    'k-cans': () => `<g>${buckby(153, 357, '#2f6b4f')}${buckby(166, 357, '#2f4f7a')}${winter() ? oval(159.5, 344.6, 12, 1.4, SNOW) : ''}</g>`,
    'k-bunting': () => `<g>${box(28, 336, 1.6, 33, '#7a5a42')}${bunting([29, 337], [66, 333], 4, 6)}${bunting([70, 333], [298, 349], 9, 26)}</g>`,
    'k-heron': () => `<g>${oval(298, 343, 10, 1.6, '#fff', 0.35)}<path d="M296 343 L297 330 M301 343 L300 330" stroke="#8a8478" stroke-width="0.9"/>${oval(300, 324, 8, 5.4, '#a9b0b6')}
      <path d="M293 322 q-4 4 -7 9 q5 -1 9 -5Z" fill="#7d858c"/><path d="M304 321 q5 -4 3 -10 q-2 -5 2 -9" stroke="#c3c9ce" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      ${dot(309, 301.4, 2.6, '#e8ecef')}<path d="M311 301 l8 1.6 l-8 1Z" fill="#e9b23c"/>${dot(309.6, 300.6, 0.6, '#222')}<path d="M307 299.4 q-5 -1 -8 1" stroke="#2f2f33" stroke-width="1" fill="none"/></g>`,
    'k-bike': () => `<g>${[[70, 291], [92, 291]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="none" stroke="#3d3d42" stroke-width="1.2"/>${dot(x, y, 0.9, '#9aa3ad')}`).join('')}
      <path d="M70 291 L77 282 L89 282 L92 291 M77 282 L81 291 L89 282 M88 279 L89 282 M75 280 h5" stroke="#3f7a8a" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <path d="M90 278 h7 l-1 5 h-5Z" fill="#c9924f"/>${winter() ? oval(93.4, 277.6, 4, 1.2, SNOW) : dot(92, 277, 1.6, '#e2574c') + dot(95, 277.4, 1.4, '#f2d84a')}</g>`,
    'k-lanterns': () => {
      const [ax, ay] = bq(0.22), [bx, by] = bq(0.78);
      return `<g>${lantern(ax, ay - 4)}${lantern(bx, by - 4)}</g>`;
    },
    'k-swans': () => `<g class="kc-glide">${swan(34, 326, false)}${swan(62, 330, true)}</g>`,
    'k-milepost': () => `<g>${shadow(24, 512, 7, 1.4)}<path d="M18 512 V494 Q24 488 30 494 V512Z" fill="#f6f2ea"/><path d="M19.6 496 L24 492 L28.4 496 V504 H19.6Z" fill="#2f2f33"/>
      <text x="24" y="501.6" text-anchor="middle" font-family="${FONT}" font-size="5.6" font-weight="900" fill="#f6f2ea">7</text>${winter() ? '<path d="M18 494 Q24 487 30 494" stroke="#f4f8fb" stroke-width="1.6" fill="none"/>' : ''}</g>`,
    'k-canoe': () => `<g>${shadow(342, 530, 40, 1.8)}<path d="M302 524 Q342 534 382 524 Q376 529 342 531 Q308 529 302 524Z" fill="#9a2f2f"/><path d="M302 524 Q342 518 382 524 Q342 534 302 524Z" fill="#c9474f"/>
      <path d="M306 524.4 Q342 520 378 524.4" stroke="#e9c35a" stroke-width="0.8" fill="none"/><path d="M320 530 L356 516" stroke="#a8743c" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="358" cy="515" rx="4" ry="1.6" fill="#a8743c" transform="rotate(-22 358 515)"/>
      ${winter() ? '<path d="M306 523 Q342 518 378 523" stroke="#f4f8fb" stroke-width="1.6" fill="none"/>' : ''}</g>`,
    'k-lights': () => `<g>${line(`M46 357.6 ${BULBS.map(([x, y]) => `L${f1(x)} ${f1(y - 0.6)}`).join(' ')}`, '#3d3d42', 0.5)}${BULBS.map(([x, y], i) => `<circle class="bulb" cx="${f1(x)}" cy="${f1(y)}" r="1.6" fill="${BULB_COLS[i % 4]}"/>`).join('')}</g>`,
    'k-dog': () => `<g>${oval(91, 354, 11, 4.4, '#c9a27a')}${oval(86, 352, 6, 4, '#e9dcc0')}${dot(100, 349.6, 3.6, '#c9a27a')}<path d="M98 346.6 q-1.6 -3 1 -4 l1.6 3Z" fill="#8a6a4a"/>
      ${dot(101.4, 349, 0.6, '#222')}${dot(103.4, 350.6, 0.8, '#3d3d42')}<g class="kc-tail"><path d="M80 354 q-5 -1 -7 -5" stroke="#c9a27a" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>${box(96.6, 352, 5, 1.2, '#d9483b')}</g>`,
    'k-kingfisher': () => `<g><g class="kc-bob">${oval(364, 280, 3.4, 4.4, '#e9762c')}<path d="M361 278 q3 -6 7 -1 l-1 6 q-3 1 -6 -5Z" fill="#2f8ac9"/>${dot(364.6, 275, 2.6, '#2f8ac9')}
      <path d="M366.6 274.6 l7 1.2 l-7 1Z" fill="#2b2a2e"/>${dot(365.4, 274.4, 0.6, '#fff')}${oval(363.6, 276.4, 1, 0.6, '#fff')}<path d="M362.4 284 l-2 4" stroke="#2f6aa0" stroke-width="1.6" stroke-linecap="round"/></g></g>`,
  };
  function decorations(owned) {
    let s = '';
    for (const k of Object.keys(DECOR)) if (owned[k]) s += DECOR[k]();
    return s;
  }

  function life(st) {
    let s = '';
    if (PCT > 0.3) s += '<g class="bird"><path d="M150 112 q4 -4 8 0 q4 -4 8 0 M174 124 q3 -3 6 0 q3 -3 6 0" stroke="#4a4a50" stroke-width="1.5" fill="none"/></g>';
    // ducks on the basin, more of them once the water is clear
    if (!winter() || st.weed) s += st.weed ? duck(228, 330, true, false) + duck(250, 336, false, true) + (PCT > 0.7 ? duck(150, 338, true, true) : '') : duck(236, 332, true, false);
    if (PCT > 0.5 && SEASON === 'summer') s += `<g class="kc-dart" pointer-events="none"><path d="M140 316 h12" stroke="#2f6ab0" stroke-width="1.4" stroke-linecap="round"/><g class="kc-wing">${oval(145, 314, 3, 1.2, '#cfe8f4', 0.85)}${oval(145, 318, 3, 1.2, '#cfe8f4', 0.85)}</g></g>`;
    if (PCT > 0.6 && !winter()) s += '<g class="bfly b1"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="#f2a7b8"/></g>';
    if (PCT > 0.8 && SEASON === 'summer') s += '<g class="bfly b2"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="#fbd85c"/></g>';
    return s;
  }

  function weather() {
    let s = '';
    if (winter()) {
      for (let i = 0; i < 26; i++) s += `<circle class="flake" cx="${(i * 61) % 400}" cy="-10" r="${1.5 + (i % 3) * 0.7}" fill="#fff" style="animation-delay:-${((i * 0.83) % 9).toFixed(2)}s;animation-duration:${7 + (i % 5)}s"/>`;
    } else if (SEASON === 'autumn') {
      const cols = ['#d9822b', '#c4462f', '#e9b23c'];
      for (let i = 0; i < 7; i++) s += `<ellipse class="fleaf" cx="${(i * 67 + 20) % 400}" cy="-10" rx="4" ry="2" fill="${cols[i % 3]}" style="animation-delay:-${((i * 1.3) % 10).toFixed(1)}s;animation-duration:${9 + (i % 4)}s"/>`;
    } else if (SEASON === 'spring') {
      for (let i = 0; i < 8; i++) s += `<ellipse class="fleaf" cx="${(i * 53 + 10) % 400}" cy="-10" rx="2.6" ry="1.6" fill="#f7c3d6" style="animation-delay:-${((i * 1.7) % 11).toFixed(1)}s;animation-duration:${11 + (i % 3)}s"/>`;
    }
    return `<g class="weather" pointer-events="none">${s}</g>`;
  }

  // evening: darken everything except the cottage window and the portholes
  function night(st, decor) {
    const winLit = st.window && !PEND.window, portLit = st.portholes && !PEND.portholes;
    let holes = '';
    if (winLit) holes += `<rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}"/>`;
    if (portLit) holes += PORTS.map((x) => `<circle cx="${x}" cy="${PORT_Y}" r="5.2"/>`).join('');
    let s = `<mask id="${id('Dark')}"><rect width="400" height="540" fill="#fff"/><g fill="#000">${holes}</g></mask>
      <rect width="400" height="540" fill="#1b2350" opacity="0.55" style="mix-blend-mode:multiply" mask="url(#${id('Dark')})"/>
      <rect width="400" height="540" fill="#24306a" opacity="0.18" mask="url(#${id('Dark')})"/>`;
    for (let i = 0; i < 30; i++) s += `<circle class="star" cx="${(i * 97) % 400}" cy="${8 + ((i * 53) % 140)}" r="${f1(0.6 + (i % 3) * 0.4)}" fill="#fff" style="animation-delay:-${((i * 0.7) % 4).toFixed(1)}s"/>`;
    s += `<mask id="${id('Moon')}"><rect width="400" height="200" fill="#fff"/><circle cx="345" cy="50" r="14" fill="#000"/></mask><circle cx="338" cy="56" r="16" fill="#fff6d8" mask="url(#${id('Moon')})"/><circle cx="338" cy="56" r="30" fill="#fff6d8" opacity="0.08"/>`;
    const glow = (x, y, rx, ry = rx) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${ry}" fill="${url('Glow')}"/>`;
    if (winLit) s += `<rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" fill="#ffd98a" opacity="0.35"/>${glow(85, 249, 40, 26)}${glow(85, 310, 22, 4)}`;
    if (portLit) s += PORTS.map((x) => `${dot(x, PORT_Y, 5.2, '#ffd98a', 0.4)}${glow(x, PORT_Y, 14, 11)}`).join('');
    if (decor['k-lanterns']) s += [bq(0.22), bq(0.78)].map(([x, y]) => `${box(x - 2, y - 15, 4, 6, '#ffe2a0')}${glow(x, y - 12, 18)}${glow(x, 236, 8, 3)}`).join('');
    if (decor['k-lights']) s += BULBS.map(([x, y], i) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.8" fill="${BULB_COLS[i % 4]}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="5.6" fill="${BULB_COLS[i % 4]}" opacity="0.22"/>`).join('');
    return `<g class="night" pointer-events="none">${s}</g>`;
  }

  const SPOTS = {
    towpath: [200, 450], weed: [120, 328], litter: [250, 462], bank: [330, 268], portholes: [168, 389], boat: [140, 382],
    gates: [200, 290], hold: [268, 384], roof: [160, 350], fence: [60, 289], door: [43, 256], window: [85, 249],
    bridge: [200, 204], dinghy: [350, 328], sign: [324, 262],
  };
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

  // st: map of restored part -> true; cols: chosen paint colours (narrowboat,
  // lockFence, lockDoor, dinghy, lockSign); opts as for GLASSHOUSE.render
  function render(st, cols = {}, opts = {}) {
    SEASON = opts.season || 'spring'; PEND = opts.pending || {}; UID = opts.uid ? String(opts.uid).replace(/[^\w-]/g, '') : ''; FORSALE = !!opts.forSale;
    PCT = U.clamp(opts.pct || 0, 0, 1);
    const decor = opts.decor || {};
    palette({ narrowboat: cols.narrowboat || '#4e7b5b', lockFence: cols.lockFence || '#f4ecdc', lockDoor: cols.lockDoor || '#c9474f', dinghy: cols.dinghy || '#8fbfe6', lockSign: cols.lockSign || '#3d5a86' });
    const C = K.C;
    return `<svg viewBox="0 0 ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" class="house canal">
      ${style()}${defs(st)}${sky()}${far()}${ground()}${bridge(st)}${bank(st)}${water(st)}${lockside()}${gates(st)}
      ${cottage()}${door(st, C)}${cottageWindow(st)}${garden()}${fence(st, C)}${willow()}${sign(st, C)}${dinghy(st, C)}
      ${boat(st, C)}${portholes(st)}${hold(st)}${roof(st)}${boatBits(st)}${towpath(st)}${ropes()}${verge()}${litter(st)}${clutter()}${saleSign()}
      ${decorations(decor)}${life(st)}${opts.resting ? `<g class="rest"><g class="rest-glide">${duck(112, 334, true, false)}${duck(92, 339, false, false)}</g></g>` : ''}${weather()}${opts.night ? night(st, decor) : ''}${sparkles(opts.fresh)}
    </svg>`;
  }

  return { render, DECOR, PARTS: Object.keys(SPOTS) };
})();
