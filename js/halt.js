'use strict';
// Halfpenny Halt, drawn as SVG the same way as the cottage (house.js), the
// café, the cove, the rescue, the glasshouse, the canal and the bookshop. A
// little country station where no train has stopped for years: a wooden
// station house with a canopy over the platform, a clock in the gable, the
// waiting room, the ticket office, a lost-property hatch and a trolley for
// the parcels; a signal box up the lane, a level-crossing gate, and the rails
// running off into the fields. Each restorable part has a tired look and a
// restored look; the sign, the ticket-office door and the crossing gate take
// the colours chosen while painting. Every id carries a 't' prefix (plus
// opts.uid when given) so this picture can share a page with the others.

const HALT = (() => {
  const VB = { w: 400, h: 540 };
  const FONT = "ui-rounded,'SF Pro Rounded',system-ui,sans-serif";

  // set at the start of every render: the season, which parts have a
  // seasonal job waiting (part -> 'grow' | 'leaves' | 'snow' | 'frost'), the
  // id suffix, whether the halt is still for sale, how far along it is and
  // the colours worked out from all that
  let SEASON = 'spring', PEND = {}, UID = '', FORSALE = false, PCT = 0, K = {}, NIGHT = false;
  const id = (n) => `t${n}${UID}`;
  const url = (n) => `url(#${id(n)})`;
  const pend = (st, p) => (st[p] ? PEND[p] : undefined);
  const f1 = (v) => (+v).toFixed(1);
  const SNOW = '#f4f8fb';
  const FADE = '#cfc6b6';
  const WINE = '#8e2f3a';
  const winter = () => SEASON === 'winter';
  const dot = (x, y, r, col, op = 1) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const oval = (x, y, rx, ry, col, op = 1) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const box = (x, y, w, h, col, more = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${col}"${more}/>`;
  const shadow = (x, y, rx, ry = 2.4) => oval(x, y, rx, ry, '#00000022');
  const line = (d, col, w = 1, op = 1) => `<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const text = (x, y, s, size, col, more = '') => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="middle" font-family="${FONT}" font-size="${size}" font-weight="900" fill="${col}"${more}>${s}</text>`;
  // a frame round a window, leaving what is inside it showing
  const ring = (x, y, w, h, t, col) => `<path d="M${f1(x - t)} ${f1(y - t)} h${f1(w + 2 * t)} v${f1(h + 2 * t)} h${f1(-w - 2 * t)}Z M${x} ${y} v${h} h${w} v${-h}Z" fill="${col}" fill-rule="evenodd"/>`;
  // dark or light writing, whichever reads on a painted colour
  const ink = (c) => (U.lum(c) > 0.62 ? '#3b352e' : '#fbf6ea');

  const SKY = {
    spring: ['#bfe2ef', '#e9f1e6', '#f6eedd'], summer: ['#9fd6f0', '#e3f3ea', '#fbf1d8'],
    autumn: ['#f0cfae', '#f6e2c6', '#f3e6d2'], winter: ['#c4d2e0', '#e3eaf1', '#f3f6f9'],
  };
  const HILLS = { spring: ['#b6d2ad', '#9fc392', '#cfe0b4'], summer: ['#a9cf98', '#8fc27b', '#d9d08a'], autumn: ['#d4c08e', '#c6aa6c', '#dcb877'], winter: ['#e6edf2', '#dbe4ea', '#eef2f5'] };
  const GRASS = {
    spring: ['#8fbf6a', '#79ad57', '#a6cf7f'], summer: ['#86bb5e', '#70a64c', '#9fcb72'],
    autumn: ['#bdb06c', '#a59858', '#cfc282'], winter: ['#e9eff4', '#d9e3ea', '#f5f8fb'],
  };
  const CANOPY = { spring: ['#6f9d5c', '#7aa866'], summer: ['#5f9a4c', '#6aa858'], autumn: ['#d9822b', '#c9692f'], winter: null };
  // what flowers in the hanging baskets and along the verge
  const FLOWERS = { spring: ['#f2d84a', '#ffffff', '#ef8aa6', '#a98bd6'], summer: ['#e2574c', '#ef8aa6', '#ffffff', '#9b7fd1'], autumn: ['#e9962c', '#c9586e', '#d8b844', '#9a2f4a'], winter: ['#d9483b', '#f6f2ea', '#d9483b', '#3f6b4a'] };

  // ---------------------------------------------------------------- shapes
  // the station house: the wall, the roof and the gable with its clock
  const WALL = { x0: 46, x1: 262, y0: 222, y1: 334 };
  const ROOF_D = 'M36 224 L66 184 H242 L272 224Z';
  const GABLE_D = 'M114 226 L150 158 L186 226Z';
  const CLOCK = { x: 150, y: 203, r: 12 };
  const SIGN = { x: 82, y: 225, w: 136, h: 22 };
  // the canopy over the platform and its iron columns
  const CAN = { x0: 38, x1: 270, y0: 248, y1: 262 };
  const COLS = [52, 148, 264];
  // under the canopy: the waiting-room window and doorway, the ticket-office
  // door, the office window with its shelves, and the lost-property hatch
  const WIN = { x: 62, y: 272, w: 46, h: 46 };
  const WAY = { x: 116, y: 280, w: 24, h: 54 };
  const DOOR = { x: 158, y: 280, w: 24, h: 54 };
  const OFF = { x: 190, y: 274, w: 32, h: 40 };
  const LOST = { x: 230, y: 280, w: 28, h: 40 };
  // the platform: its top, the white edge and the brick face over the line
  const PLAT_D = 'M14 334 H280 L288 382 H14Z';
  const FACE_D = 'M14 382 H288 L298 404 H14Z';
  // the lane up past the signal box, over the line at the crossing
  const LANE_D = 'M298 226 H312 L340 540 H262Z';
  const laneAt = (y) => { const t = (y - 226) / 314; return [298 - 36 * t, 312 + 28 * t]; };
  // the line: ballast, sleepers and two rails
  const TRACK = { y0: 404, y1: 462, r0: 416, r1: 450 };
  // the signal box up on the bank beyond the lane
  const BOX = { x0: 326, x1: 370, y0: 212, y1: 278 };
  const BOXWIN = { x: 330, y: 220, w: 36, h: 18 };

  // little css of our own: swinging baskets, a breathing cat, a flapping flag
  function style() {
    return `<style>@media (prefers-reduced-motion: no-preference){
      #scene .ht-swing{animation:htswing 5.2s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 0%}
      @keyframes htswing{from{transform:rotate(-1.8deg)}to{transform:rotate(1.8deg)}}
      #scene .ht-breathe{animation:htbreathe 3.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes htbreathe{50%{transform:scaleY(1.07)}}
      #scene .ht-flag{animation:htflag 3s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 0%}
      @keyframes htflag{from{transform:skewX(-5deg)}to{transform:skewX(6deg)}}
      #scene .ht-hop{animation:hthop 5.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes hthop{0%,80%,100%{transform:translateY(0)}86%{transform:translateY(-3px)}92%{transform:translateY(0)}}
      #scene .ht-steam path{animation:htsteam 3.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      #scene .ht-steam path:nth-child(2){animation-delay:1.7s}
      @keyframes htsteam{0%{opacity:0;transform:translateY(3px) scaleY(.6)}40%{opacity:.8}100%{opacity:0;transform:translateY(-6px) scaleY(1.1)}}
      #scene .ht-wire{animation:htwire 7s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 0%}
      @keyframes htwire{from{transform:translateY(-0.4px)}to{transform:translateY(0.6px)}}
    }</style>`;
  }

  function palette(C) {
    const k = (1 - PCT) * 0.35;
    K = {
      C,
      grass: GRASS[SEASON].map((c) => (winter() ? c : U.mix(c, '#a3a07c', k))),
      board: U.mix('#f2e8d2', '#bdb3a2', k * 1.4),
      trim: U.mix(WINE, '#8a7a72', k * 1.4),
      iron: U.mix('#2f4f43', '#6f7470', k * 1.3),
      stone: U.mix('#e2d6bf', '#b3aa9a', k),
      brick: U.mix('#b8664a', '#9a8a7c', k * 1.2),
      sash: U.mix('#fbf7ee', '#b8b1a2', k * 1.4),
    };
  }

  function defs() {
    const g = K.grass, b = K.brick, ob = U.mix(b, '#8a8476', 0.45), bd = K.board;
    const dand = winter() ? '<ellipse cx="12" cy="10" rx="6" ry="2" fill="#fff" opacity="0.85"/><ellipse cx="34" cy="28" rx="7" ry="2.2" fill="#fff" opacity="0.75"/>'
      : SEASON === 'autumn' ? '<circle cx="8" cy="9" r="1.8" fill="#ece6d4"/><circle cx="31" cy="27" r="1.6" fill="#ece6d4"/>'
        : '<circle cx="8" cy="9" r="1.8" fill="#f3cf3a"/><circle cx="31" cy="27" r="1.6" fill="#f3cf3a"/><circle cx="22" cy="6" r="1.4" fill="#fff"/>';
    const brick = (base, moss) => `<rect width="24" height="12" fill="${base}"/>
        <rect x="0.8" y="0.9" width="10.6" height="4.6" fill="${U.shade(base, 0.08)}"/><rect x="12.8" y="0.9" width="10.4" height="4.6" fill="${U.shade(base, -0.04)}"/>
        <rect x="6.8" y="6.9" width="10.4" height="4.6" fill="${U.shade(base, 0.03)}"/><rect x="18.8" y="6.9" width="5" height="4.6" fill="${U.shade(base, -0.08)}"/><rect x="0" y="6.9" width="5.2" height="4.6" fill="${U.shade(base, -0.08)}"/>
        <path d="M0 0.4 H24 M0 6.4 H24 M12 0.4 V6.4 M6 6.4 V12 M18 6.4 V12" stroke="${moss ? '#a39a86' : '#ead9c0'}" stroke-width="0.8" opacity="0.75"/>
        ${moss ? '<circle cx="4" cy="6" r="1.6" fill="#6f8a3e" opacity="0.6"/><circle cx="19" cy="11.6" r="1.4" fill="#748f42" opacity="0.5"/>' : ''}`;
    const flag = (cols, gap) => `<rect width="40" height="22" fill="${gap}"/>
        <rect x="0.8" y="0.8" width="18" height="9.6" rx="1.2" fill="${cols[0]}"/><rect x="19.6" y="0.8" width="19.6" height="9.6" rx="1.2" fill="${cols[1]}"/>
        <rect x="0.8" y="11.6" width="11" height="9.6" rx="1.2" fill="${cols[2]}"/><rect x="12.6" y="11.6" width="16" height="9.6" rx="1.2" fill="${cols[0]}"/><rect x="29.4" y="11.6" width="9.8" height="9.6" rx="1.2" fill="${cols[1]}"/>`;
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
      <linearGradient id="${id('Grime')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#858e74"/><stop offset="0.7" stop-color="#69764f"/><stop offset="1" stop-color="#4f5c36"/></linearGradient>
      <linearGradient id="${id('Dusty')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9b19f"/><stop offset="1" stop-color="#d7c39a"/></linearGradient>
      <linearGradient id="${id('Frost')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f9fc"/><stop offset="1" stop-color="#cadbe8"/></linearGradient>
      <linearGradient id="${id('Glass')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3f2f6"/><stop offset="1" stop-color="#a9cbd8"/></linearGradient>
      <linearGradient id="${id('Shade')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2a1a" stop-opacity="0.32"/><stop offset="1" stop-color="#3b2a1a" stop-opacity="0"/></linearGradient>
      <linearGradient id="${id('Rail')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9c4bd"/><stop offset="0.5" stop-color="#8d8378"/><stop offset="1" stop-color="#6b5a4c"/></linearGradient>
      <pattern id="${id('Boards')}" width="30" height="7" patternUnits="userSpaceOnUse">
        <rect width="30" height="7" fill="${bd}"/><rect y="5.8" width="30" height="1.2" fill="${U.shade(bd, -0.14)}"/><rect width="30" height="1" fill="#fff" opacity="0.35"/>
      </pattern>
      <pattern id="${id('BoardsOld')}" width="30" height="7" patternUnits="userSpaceOnUse">
        <rect width="30" height="7" fill="${U.mix(bd, '#a89f8e', 0.35)}"/><rect y="5.8" width="30" height="1.2" fill="#8a8172"/>
        <ellipse cx="8" cy="3" rx="4" ry="1.4" fill="#d8cfbf" opacity="0.8"/><ellipse cx="22" cy="4" rx="2.6" ry="1" fill="#9a8a72" opacity="0.5"/>
      </pattern>
      <pattern id="${id('Tall')}" width="14" height="12" patternUnits="userSpaceOnUse">
        <rect width="14" height="12" fill="${winter() ? '#b9bca6' : SEASON === 'autumn' ? '#a5975a' : '#6a9846'}"/>
        <path d="M2 12 Q3 6 1 2 M5 12 Q6 7 7 3 M9 12 Q8 6 10 1 M12 12 Q13 8 12 4" stroke="${winter() ? '#9a9c86' : SEASON === 'autumn' ? '#857842' : '#4f8034'}" stroke-width="1.2" fill="none"/>
      </pattern>
      <pattern id="${id('Dand')}" width="46" height="38" patternUnits="userSpaceOnUse">${dand}</pattern>
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
      <pattern id="${id('Flag')}" width="40" height="22" patternUnits="userSpaceOnUse" patternTransform="scale(1 0.62)">${flag(winter() ? ['#e3e1dc', '#d9d6cf', '#e8e6e1'] : ['#d8cfbd', '#cfc5b2', '#dcd3c2'], winter() ? '#c9c6bf' : '#b9ae9b')}</pattern>
      <pattern id="${id('FlagOld')}" width="40" height="22" patternUnits="userSpaceOnUse" patternTransform="scale(1 0.62)">${flag(['#a9a58c', '#9c9a80', '#b1ab92'], '#6f7a4a')}</pattern>
      <pattern id="${id('Slate')}" width="10" height="7" patternUnits="userSpaceOnUse">
        <rect width="10" height="7" fill="#5f6870"/><path d="M0 6.6 H10 M5 0 V6.6" stroke="#4a5259" stroke-width="0.7"/><rect x="0.6" y="0.6" width="3.6" height="1.2" fill="#fff" opacity="0.1"/>
      </pattern>
      <pattern id="${id('SlateOld')}" width="10" height="7" patternUnits="userSpaceOnUse">
        <rect width="10" height="7" fill="#6d7068"/><path d="M0 6.6 H10 M5 0 V6.6" stroke="#55584f" stroke-width="0.7"/><circle cx="3" cy="3" r="1.4" fill="#7a8a4a" opacity="0.6"/>
      </pattern>
      <pattern id="${id('Ballast')}" width="18" height="12" patternUnits="userSpaceOnUse">
        <rect width="18" height="12" fill="${winter() ? '#b9b6b0' : '#9a9184'}"/>
        <circle cx="3" cy="3" r="1.6" fill="#b5ab9c"/><circle cx="9" cy="7" r="1.8" fill="#857b6e"/><circle cx="14" cy="3" r="1.4" fill="#c2b9aa"/>
        <circle cx="5" cy="9.6" r="1.3" fill="#7a7064"/><circle cx="15" cy="10" r="1.5" fill="#aca290"/><circle cx="11" cy="1" r="0.9" fill="#6f665a"/>
      </pattern>
      <pattern id="${id('Tiles')}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="scale(1 0.55)">
        <rect width="8" height="8" fill="#f1e6cf"/><rect width="4" height="4" fill="#a8434a"/><rect x="4" y="4" width="4" height="4" fill="#a8434a"/>
      </pattern>
      <pattern id="${id('TilesOld')}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="scale(1 0.55)">
        <rect width="8" height="8" fill="#bcb3a2"/><rect width="4" height="4" fill="#8a6a62"/><rect x="4" y="4" width="4" height="4" fill="#8a6a62"/>
      </pattern>
      <clipPath id="${id('WinClip')}"><rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}"/></clipPath>
      <clipPath id="${id('WayClip')}"><path d="M${WAY.x} ${WAY.y + WAY.h} V${WAY.y + 8} Q${WAY.x} ${WAY.y} ${WAY.x + WAY.w / 2} ${WAY.y} Q${WAY.x + WAY.w} ${WAY.y} ${WAY.x + WAY.w} ${WAY.y + 8} V${WAY.y + WAY.h}Z"/></clipPath>
      <clipPath id="${id('OffClip')}"><rect x="${OFF.x}" y="${OFF.y}" width="${OFF.w}" height="${OFF.h}"/></clipPath>
      <clipPath id="${id('LostClip')}"><rect x="${LOST.x}" y="${LOST.y}" width="${LOST.w}" height="${LOST.h}"/></clipPath>
    </defs>`;
  }

  // --------------------------------------------------------- sky and hills
  function sky() {
    const cl = SEASON === 'autumn' ? '#fbf1e6' : '#ffffff';
    return `<rect width="400" height="260" fill="${url('Sky')}"/>
    ${NIGHT ? '' : `<circle cx="62" cy="58" r="44" fill="${url('Sun')}"/><circle cx="62" cy="58" r="16" fill="#fff3c4"/>`}
    <g class="cloud c1" fill="${cl}" opacity="0.92"><ellipse cx="282" cy="56" rx="25" ry="10"/><ellipse cx="301" cy="49" rx="17" ry="12"/><ellipse cx="319" cy="57" rx="19" ry="8"/></g>
    <g class="cloud c2" fill="${cl}" opacity="0.8"><ellipse cx="166" cy="96" rx="19" ry="7"/><ellipse cx="181" cy="91" rx="13" ry="9"/><ellipse cx="195" cy="97" rx="14" ry="6"/></g>`;
  }
  function bgTree(x, y, r, which) {
    if (!CANOPY[SEASON]) {
      return `<g stroke="#7a6252" stroke-linecap="round" fill="none"><path d="M${x} ${f1(y + r * 0.9)} V${f1(y - r * 0.4)}" stroke-width="2.6"/>
        <path d="M${x} ${y} l${f1(-r * 0.4)} ${f1(-r * 0.4)} M${x} ${f1(y - r * 0.15)} l${f1(r * 0.45)} ${f1(-r * 0.35)}" stroke-width="1.4"/></g>`;
    }
    const col = CANOPY[SEASON][which];
    return `<g><rect x="${x - 2}" y="${y}" width="4" height="${f1(r * 0.9)}" fill="#6b5240"/>${dot(x, y - r * 0.15, r * 0.62, col)}${dot(x - r * 0.35, y + r * 0.1, r * 0.45, col)}${dot(x + r * 0.35, y + r * 0.08, r * 0.48, U.shade(col, -0.1))}${dot(x - r * 0.15, y - r * 0.35, r * 0.3, U.shade(col, 0.15))}</g>`;
  }
  // a village church far off, so there is somewhere the line once went
  function church(x, y) {
    const c = winter() ? '#dfe3e6' : '#d6ccba', r = winter() ? '#c9d2da' : '#8a8a8e';
    return `${box(x - 12, y - 10, 18, 10, c)}<path d="M${x - 13} ${y - 10} L${x - 3} ${y - 16} L${x + 7} ${y - 10}Z" fill="${r}"/>
      ${box(x + 6, y - 20, 7, 20, c)}<path d="M${x + 5} ${y - 20} L${x + 9.5} ${y - 32} L${x + 14} ${y - 20}Z" fill="${r}"/>${box(x + 8.4, y - 15, 2.2, 3, '#7a6a5a')}`;
  }
  // fields and hedgerows beyond the line, a church and a row of telegraph poles
  function far() {
    const H = HILLS[SEASON];
    let s = `<path d="M0 182 Q80 156 170 170 T330 152 T400 166 V226 H0Z" fill="${H[0]}"/>`;
    s += church(270, 172);
    s += bgTree(36, 196, 14, 0) + bgTree(60, 190, 11, 1) + bgTree(132, 192, 12, 0) + bgTree(388, 186, 15, 1) + bgTree(252, 188, 10, 1);
    s += `<path d="M-10 210 C60 196 140 194 210 202 C280 208 340 196 410 204 V230 H-10Z" fill="${H[1]}"/>`;
    // a strip field of corn (or stubble, or snow) on the far slope
    s += `<path d="M170 204 C220 200 270 198 300 204 L298 214 C266 210 220 210 172 214Z" fill="${H[2]}" opacity="0.85"/>`;
    // telegraph poles stepping off along the line into the distance
    let wire = '';
    [[14, 236, 34], [92, 226, 26], [376, 232, 30]].forEach(([x, y, h]) => {
      s += `${box(x - 1, y - h, 2, h, '#7a6252')}${box(x - 5, y - h + 2, 10, 1.4, '#6b5240')}${dot(x - 4, y - h + 1.4, 0.8, '#e9e3d6')}${dot(x + 4, y - h + 1.4, 0.8, '#e9e3d6')}`;
    });
    wire = 'M10 204 Q52 206 88 202 M18 204 Q56 206 96 202';
    s += line(wire, '#6b6157', 0.4, 0.6);
    return s;
  }
  function ground() {
    const g = K.grass, r = U.rng(41);
    let s = `<rect x="0" y="222" width="400" height="318" fill="${g[0]}"/>`;
    for (let i = 0; i < 18; i++) s += oval(r() * 400, 236 + r() * 300, 10 + r() * 22, 3 + r() * 4, r() < 0.5 ? g[1] : g[2], 0.5);
    return s;
  }

  // ---------------------------------------------------------------- the lane
  function lane() {
    const worn = winter() ? '#e8edf1' : '#cdbf9f', edge = winter() ? '#d8e0e6' : '#b5a684';
    let s = `<path d="${LANE_D}" fill="${worn}"/><path d="M298 226 L262 540 M312 226 L340 540" stroke="${edge}" stroke-width="2"/>`;
    // a grassy strip up the middle, as on lanes few people drive
    s += `<path d="M304 240 L306 240 L302 400 L296 400Z" fill="${K.grass[1]}" opacity="${winter() ? 0.3 : 0.55}"/><path d="M300 466 L304 466 L302 540 L294 540Z" fill="${K.grass[1]}" opacity="${winter() ? 0.3 : 0.55}"/>`;
    if (winter()) s += line('M300 250 L286 540 M309 250 L318 540', '#c3ccd4', 2.2, 0.6);
    return s;
  }

  // ---------------------------------------------------------- the signal box
  function signalBox(st) {
    const p = pend(st, 'box'), ok = st.box, { x0, x1, y0, y1 } = BOX;
    let s = shadow((x0 + x1) / 2, y1 + 1, 28, 2.4);
    // brick base, timber cabin above, a hipped roof and a little chimney
    s += `${box(x0 + 3, 240, x1 - x0 - 6, y1 - 240, ok ? url('Brick') : url('BrickOld'))}${box(x0 + 3, 240, x1 - x0 - 6, 2, '#000', ' opacity="0.12"')}`;
    s += `${box(x0 + 6, 256, 9, 22, '#3b2f26')}${box(x0 + 5, 254.6, 11, 2, K.stone)}`;
    s += `<path d="M${x0} 212 H${x1} V240 H${x0}Z" fill="${url(PCT > 0.3 ? 'Boards' : 'BoardsOld')}"/>`;
    s += `<path d="M${x0 - 4} 212 L${x0 + 8} 200 H${x1 - 8} L${x1 + 4} 212Z" fill="${url(PCT > 0.35 ? 'Slate' : 'SlateOld')}"/>${line(`M${x0 - 4} 212 H${x1 + 4}`, '#3f464d', 1.4)}`;
    s += `${box(x1 - 14, 192, 5, 9, '#9a5a44')}${box(x1 - 15, 190.6, 7, 2, '#7d4a3a')}`;
    // the steps up the side, with a hand rail
    s += `<path d="M${x0 - 14} ${y1} L${x0} 240 H${x0 + 3} L${x0 - 11} ${y1}Z" fill="#6b5240"/>`;
    for (let k = 1; k < 7; k++) s += line(`M${f1(x0 - 14 + k * 2.3)} ${f1(y1 - k * 5.4)} h3`, '#8a6a4a', 1);
    s += line(`M${x0 - 16} ${y1 - 10} L${x0 - 2} 230 V240`, K.trim, 1);
    // the name on the box
    s += `${box(x0 + 8, 241.6, x1 - x0 - 16, 6, ok ? K.sash : '#c9c1b2', ' rx="1"')}${text((x0 + x1) / 2, 246.6, 'HALFPENNY', 4.4, ok ? WINE : '#8a8070', ' letter-spacing="0.6"')}`;
    // the windows all round the cabin: the part to wash
    const { x, y, w, h } = BOXWIN;
    s += `<g data-part="box">${box(x - 1.6, y - 1.6, w + 3.2, h + 3.2, ok ? K.sash : '#b8b1a2')}${box(x, y, w, h, ok ? url('Glass') : url('Grime'))}`;
    if (ok) {
      // the levers inside, in a neat row
      for (let k = 0; k < 7; k++) s += line(`M${x + 4 + k * 4.6} ${y + h} l${k % 2 ? 1 : -1} -9`, ['#d9483b', '#3d3d42', '#f2c230', '#3d3d42', '#d9483b', '#3f6b8a', '#3d3d42'][k], 1.4);
      s += `<path d="M${x + 6} ${y + 2} l6 -0.6 M${x + 22} ${y + 2} l5 -0.4" stroke="#fff" stroke-width="1.1" opacity="0.6"/>`;
    } else {
      s += `<path d="M${x + w - 10} ${y} l10 0 l0 8Z" fill="#fff" opacity="0.18"/>${line(`M${x + 8} ${y} l3 6 l-2 5`, '#e6ece0', 0.6)}${dot(x + 26, y + 11, 1.4, '#4f5e38', 0.6)}`;
    }
    s += `<path d="M${x + w / 4} ${y} V${y + h} M${x + w / 2} ${y} V${y + h} M${x + (3 * w) / 4} ${y} V${y + h}" stroke="${ok ? K.sash : '#b8b1a2'}" stroke-width="1.2"/>`;
    if (p === 'frost') s += `${box(x, y, w, h, url('Frost'), ' opacity="0.86"')}${line(`M${x + 2} ${y + 14} q6 -3 8 -10 M${x + w - 2} ${y + 3} q-7 2 -8 8`, '#fff', 1)}`;
    else if (p === 'grow') s += box(x, y, w, h, url('Dusty'), ' opacity="0.6"');
    s += '</g>';
    s += box(x0 - 1, 238, x1 - x0 + 2, 2.4, K.trim, ' rx="1"');
    if (winter() || p === 'snow') s += `<path d="M${x0 - 3} 211 L${x0 + 8} 200.4 H${x1 - 8} L${x1 + 3} 211 Q${(x0 + x1) / 2} 207 ${x0 - 3} 211Z" fill="${SNOW}"/>${box(x1 - 15, 189.6, 7, 1.6, SNOW, ' rx="0.8"')}`;
    if (PCT > 0.6 && !winter()) s += '<g class="smoke" fill="#ffffff"><circle cx="358" cy="182" r="2.6" opacity="0.6"/><circle cx="361" cy="172" r="3.6" opacity="0.45"/><circle cx="359" cy="160" r="4.6" opacity="0.28"/></g>';
    return s;
  }
  // a semaphore signal beside the line, its arm long since left lowered
  function semaphore() {
    const x = 380, ok = PCT > 0.5;
    let s = `${shadow(x, 404, 6, 1.4)}${box(x - 1.4, 300, 2.8, 104, '#d9d3c6')}${box(x - 3, 400, 6, 4, '#6b6157')}`;
    s += `<g transform="rotate(${ok ? -36 : -8} ${x} 306)">${box(x - 26, 303, 26, 6, ok ? '#d9483b' : '#a8645a', ' rx="1"')}${box(x - 20, 304.6, 3, 2.8, '#fbf6ea')}</g>${dot(x, 306, 2, '#3d3d42')}`;
    s += `${dot(x + 4, 318, 2.6, '#3d3d42')}${dot(x + 4, 318, 1.6, ok ? '#7fcf8a' : '#5a6a5a')}<path d="M${x - 3} 296 h6 l-3 -4Z" fill="#3d3d42"/>`;
    if (winter()) s += box(x - 3, 294.6, 6, 1.6, SNOW, ' rx="0.8"');
    return s;
  }

  // ----------------------------------------------------- the station house
  function house() {
    const roof = PCT > 0.35 ? url('Slate') : url('SlateOld');
    let s = shadow(154, 335, 112, 3);
    // the chimney
    s += `${box(220, 168, 13, 22, url('Brick'))}${box(218.6, 166, 15.8, 3.4, K.stone, ' rx="1"')}${box(222, 160, 3.6, 6, '#b5694a')}${box(227, 161.4, 3.2, 4.6, '#a8604a')}`;
    if (PCT > 0.5) s += '<g class="smoke" fill="#ffffff"><circle cx="225" cy="150" r="3.4" opacity="0.7"/><circle cx="228" cy="139" r="4.6" opacity="0.5"/><circle cx="226" cy="125" r="6" opacity="0.3"/></g>';
    s += `<path d="${ROOF_D}" fill="${roof}"/><path d="M66 184 H242" stroke="#4a5259" stroke-width="2.4" stroke-linecap="round"/>`;
    if (winter()) s += `<path d="M38 222 L67 185 H241 L270 222 Q240 214 210 218 Q180 212 154 218 Q120 212 90 218 Q60 214 38 222Z" fill="${SNOW}" opacity="0.92"/>${box(218.6, 164.6, 15.8, 2, SNOW, ' rx="1"')}`;
    // the wall: cream weatherboarding, wine-red corner boards
    s += `${box(WALL.x0, WALL.y0, WALL.x1 - WALL.x0, WALL.y1 - WALL.y0, url(PCT > 0.3 ? 'Boards' : 'BoardsOld'))}${box(WALL.x0, WALL.y0, WALL.x1 - WALL.x0, 3, '#000', ' opacity="0.12"')}`;
    s += `${box(WALL.x0, WALL.y0, 4, WALL.y1 - WALL.y0, K.trim)}${box(WALL.x1 - 4, WALL.y0, 4, WALL.y1 - WALL.y0, K.trim)}`;
    // the gable over the middle, where the clock lives
    s += `<path d="${GABLE_D}" fill="${url(PCT > 0.3 ? 'Boards' : 'BoardsOld')}"/><path d="M110 228 L150 154 L190 228" stroke="${K.trim}" stroke-width="3.4" fill="none" stroke-linejoin="round"/>`;
    s += `<path d="M150 154 v-6" stroke="${K.trim}" stroke-width="1.6"/>${dot(150, 147, 1.6, K.trim)}`;
    s += `<path d="M36 224 H272" stroke="#3f464d" stroke-width="1.6"/>`;
    if (winter()) s += `<path d="M110 226.4 L150 152.6 L190 226.4" stroke="${SNOW}" stroke-width="1.6" fill="none"/>`;
    if (PCT < 0.4) s += line('M60 236 l6 6 l-2 6 M246 230 l-4 8 l2 5', '#9a9284', 0.8) + `<g transform="rotate(22 98 200)">${box(93, 198, 9, 5, '#5f6870')}</g>`;
    return s;
  }
  // the canopy over the platform: a board with a fretted edge, on iron columns
  function canopy() {
    const { x0, x1, y0, y1 } = CAN, c1 = K.trim, c2 = K.board;
    let s = `<path d="M${x0 - 4} ${y0 - 3} H${x1 + 4} L${x1} ${y0} H${x0}Z" fill="#5f6870"/>${box(x0, y0, x1 - x0, y1 - y0 - 5, c2)}`;
    // the fretted valance, cream and wine in turn, with one board hanging loose until the place is cared for
    let teeth = '';
    for (let x = x0, i = 0; x < x1; x += 6, i++) {
      if (PCT < 0.4 && (i === 9 || i === 27)) continue;
      teeth += `<path d="M${x} ${y1 - 5} h6 v3 l-3 3.4 l-3 -3.4Z" fill="${i % 2 ? c1 : c2}"/>`;
    }
    s += teeth + box(x0, y1 - 5.6, x1 - x0, 1.2, U.shade(c1, -0.1));
    s += line(`M${x0} ${y0 + 3} H${x1}`, c1, 1.2, 0.8);
    if (PCT < 0.4) s += `<g transform="rotate(30 ${x0 + 57} ${y1 - 5})"><path d="M${x0 + 54} ${y1 - 5} h6 v3 l-3 3.4 l-3 -3.4Z" fill="${c1}"/></g>`;
    if (winter()) s += `<path d="M${x0 - 4} ${y0 - 4.4} H${x1 + 4} L${x1 + 2} ${y0 - 1.6} H${x0 - 2}Z" fill="${SNOW}"/>`;
    // the shade it throws on the wall
    s += box(WALL.x0, y1, WALL.x1 - WALL.x0, 18, url('Shade'), ' pointer-events="none"');
    return s;
  }
  // the iron columns holding the canopy up, drawn after the windows
  function columns() {
    let s = '';
    for (const x of COLS) {
      s += `${box(x - 1.6, CAN.y1, 3.2, 334 - CAN.y1, K.iron)}${box(x - 3, 330, 6, 4, K.iron, ' rx="1"')}${box(x - 2.6, CAN.y1, 5.2, 2.4, K.iron)}`;
      s += `<path d="M${x - 1.6} ${CAN.y1 + 10} Q${x - 1.6} ${CAN.y1 + 2} ${x - 10} ${CAN.y1 + 1.6} M${x + 1.6} ${CAN.y1 + 10} Q${x + 1.6} ${CAN.y1 + 2} ${x + 10} ${CAN.y1 + 1.6}" stroke="${K.iron}" stroke-width="1.2" fill="none"/>`;
      s += box(x - 0.6, CAN.y1 + 4, 1, 330 - CAN.y1 - 4, '#fff', ' opacity="0.12"');
    }
    return s;
  }

  // ------------------------------------------------------------- the clock
  function clock(st) {
    const p = pend(st, 'clock'), ok = st.clock, { x, y, r } = CLOCK;
    let s = `<g data-part="clock">${dot(x, y, r + 2.6, ok ? K.trim : '#8a7a72')}${dot(x, y, r + 1.2, ok ? '#e2c27a' : '#a59e90')}${dot(x, y, r, ok ? '#fffaf0' : url('Grime'))}`;
    let ticks = '';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, r0 = i % 3 ? r - 2.4 : r - 3.6;
      ticks += `M${f1(x + Math.sin(a) * r0)} ${f1(y - Math.cos(a) * r0)} L${f1(x + Math.sin(a) * (r - 1))} ${f1(y - Math.cos(a) * (r - 1))} `;
    }
    s += `<path d="${ticks}" stroke="${ok ? '#3b352e' : '#5a5446'}" stroke-width="${ok ? 0.9 : 0.7}" opacity="${ok ? 1 : 0.6}"/>`;
    if (ok) {
      // the hands at a quiet twenty to nine, and they stay there
      s += `${line(`M${x} ${y} L${f1(x - 5.2)} ${f1(y - 2.4)}`, '#3b352e', 1.5)}${line(`M${x} ${y} L${f1(x - 6.4)} ${f1(y - 6.8)}`, '#3b352e', 1)}${dot(x, y, 1.1, WINE)}`;
      s += `<path d="M${x - 7} ${y - 6} a10 10 0 0 1 7 -4" stroke="#fff" stroke-width="1.6" fill="none" opacity="0.7"/>`;
    } else {
      // stopped long ago, with a crack across the glass and only one hand
      s += `${line(`M${x} ${y} L${f1(x + 2)} ${f1(y + 7)}`, '#3b352e', 1.1)}${dot(x, y, 1, '#3b352e')}${line(`M${x - 9} ${y - 4} l5 3 l3 -2 l6 5 l4 -1`, '#e6ece0', 0.6)}`;
    }
    if (p === 'frost') s += `${dot(x, y, r, url('Frost'), 0.88)}${line(`M${x - 6} ${y + 5} q3 -2 4 -7`, '#fff', 0.9)}`;
    else if (p === 'grow') s += dot(x, y, r, url('Dusty'), 0.55);
    if (winter() || p === 'snow') s += `<path d="M${x - r - 2} ${y - 3} A${r + 2.6} ${r + 2.6} 0 0 1 ${x + r + 2} ${y - 3}" stroke="${SNOW}" stroke-width="1.8" fill="none"/>`;
    return s + '</g>';
  }

  // ------------------------------------------------------------- the sign
  function sign(st, C) {
    const p = pend(st, 'sign'), ok = st.sign;
    const c = ok ? C.haltSign : U.mix(C.haltSign, '#a59e90', 0.6), tx = ok ? ink(c) : '#efe9dc';
    const { x, y, w, h } = SIGN;
    let s = `<g data-part="sign"><g${ok ? '' : ' transform="rotate(-2.4 150 236)"'}><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${c}" stroke="${ok ? U.shade(c, -0.3) : '#8a8070'}" stroke-width="1.2"/>`;
    if (ok) s += `<rect x="${x + 2.6}" y="${y + 2.6}" width="${w - 5.2}" height="${h - 5.2}" rx="2" fill="none" stroke="${tx}" stroke-width="0.7" opacity="0.8"/>`;
    s += text(150, y + 11.6, 'HALFPENNY HALT', 10, tx, ` letter-spacing="0.8"${ok ? '' : ' opacity="0.4"'}`);
    s += text(150, y + 18.6, '· PLATFORM 1 ·', 5, tx, ` letter-spacing="0.8"${ok ? '' : ' opacity="0.4"'}`);
    if (!ok) s += `${oval(x + 14, y + 6, 5, 2.6, '#9aa36a', 0.8)}${oval(x + 118, y + 16, 6, 2.2, '#9aa36a', 0.7)}${oval(x + 96, y + 6, 4, 2.4, U.mix(C.haltSign, '#a59e90', 0.75), 0.9)}${line(`M${x + 60} ${y} l-3 8 l2 6`, '#5a4a3a', 0.8)}`;
    if (p === 'grow') s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${FADE}" opacity="0.5"/>`;
    else if (p === 'frost') s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${url('Frost')}" opacity="0.5"/>`;
    else if (p === 'leaves') s += oval(x + 10, y + 19, 3.4, 1.6, '#d9822b') + oval(x + 124, y + 4, 3, 1.4, '#c4462f') + oval(x + 70, y + 20, 2.8, 1.3, '#e9b23c');
    if (winter() || p === 'snow') s += `<rect x="${x - 1}" y="${y - 1.6}" width="${w + 2}" height="2.6" rx="1.3" fill="${SNOW}"/>`;
    return s + '</g></g>';
  }

  // ------------------------------------------------------ the waiting room
  // what you see through the window and the open doorway: a tiled floor, a
  // wooden bench along the back wall, a little stove and the old timetable
  function waitingInside(st) {
    const ok = st.floor;
    let s = `${box(56, 268, 92, 66, ok ? '#e9dcc0' : '#b9ad96')}${box(56, 268, 92, 24, ok ? '#dccbaa' : '#a89c86')}${box(56, 291, 92, 1.6, ok ? WINE : '#7d6a62')}`;
    // the timetable on the wall
    s += `${box(70, 274, 14, 12, ok ? '#fffaf0' : '#cfc6b6')}${line('M72 277 h10 M72 279.6 h8 M72 282.2 h10', ok ? '#8a8070' : '#9a9080', 0.6)}`;
    // the bench along the back wall
    s += `${box(62, 302, 40, 3, ok ? '#a8743c' : '#7d6e5e')}${box(64, 305, 2.4, 7, '#5a4434')}${box(97, 305, 2.4, 7, '#5a4434')}${box(62, 294, 40, 2.4, ok ? '#b98a52' : '#8a7a62')}`;
    // the little stove with its pipe, glowing once the place is lived in
    s += `${box(124, 300, 12, 15, '#3d3d42', ' rx="2"')}${box(128.6, 270, 3, 30, '#3d3d42')}${box(126.6, 304, 7, 5, ok ? '#e9962c' : '#4a4a4e', ' rx="1"')}`;
    return s;
  }
  function floor(st) {
    const p = pend(st, 'floor'), ok = st.floor && p !== 'grow';
    const tiles = st.floor ? url('Tiles') : url('TilesOld');
    let s = `<g data-part="floor"><g clip-path="${url('WinClip')}"><path d="M56 311 H112 V320 H56Z" fill="${tiles}"/>${box(56, 311, 56, 1.6, '#000', ' opacity="0.14"')}</g>`;
    s += `<g clip-path="${url('WayClip')}"><path d="M112 314 H146 V334 H112Z" fill="${tiles}"/>${box(112, 314, 34, 1.6, '#000', ' opacity="0.14"')}</g>`;
    if (!st.floor) {
      // dust, dead leaves blown in and a timetable that fell off the wall
      s += `<g clip-path="${url('WayClip')}">${oval(126, 324, 10, 3, '#a89f86', 0.85)}${oval(120, 316, 4, 1.4, '#9c5a2a')}${oval(132, 330, 3.6, 1.3, '#c4462f')}<g transform="rotate(-14 128 320)">${box(122, 316, 12, 8, '#d9cfb4')}</g></g>`;
      s += `<g clip-path="${url('WinClip')}">${oval(76, 314, 12, 2.6, '#a89f86', 0.8)}${oval(96, 313, 3.4, 1.2, '#9c5a2a')}</g>`;
    } else if (p === 'grow') {
      s += `<g clip-path="${url('WayClip')}">${[[120, 330], [126, 322], [131, 315]].map(([a, b]) => oval(a, b, 2, 1, '#7d6a52', 0.7)).join('')}${oval(128, 326, 8, 2.4, '#a89f86', 0.55)}</g>`;
    } else if (ok) {
      // a rag mat inside the door and a gleam on the tiles
      s += `<g clip-path="${url('WayClip')}">${oval(128, 328, 9, 3, '#3f7a8a', 0.9)}${oval(128, 328, 6, 1.8, '#f2d88a', 0.8)}${line('M116 314 l8 -2', '#fff', 0.8, 0.5)}</g>`;
    }
    return s + '</g>';
  }
  function waitingWindow(st) {
    const p = pend(st, 'window'), ok = st.window;
    const { x, y, w, h } = WIN, frame = ok ? K.sash : '#b8b1a2';
    let s = `<g data-part="window">${ring(x, y, w, h, 2.4, frame)}`;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${ok ? url('Glass') : url('Grime')}" opacity="${ok ? 0.28 : 0.8}"/>`;
    if (ok) {
      s += `<path d="M${x} ${y} h8 q-3 ${h / 2} 0 ${h} h-8Z M${x + w} ${y} h-8 q3 ${h / 2} 0 ${h} h8Z" fill="#c9586e" opacity="0.92"/>`;
      s += `<path d="M${x + 12} ${y + 4} l9 -1 M${x + 28} ${y + 4} l6 -0.6" stroke="#fff" stroke-width="1.2" opacity="0.6"/>`;
    } else {
      s += `<path d="M${x + w - 14} ${y} l14 0 l0 10Z" fill="#fff" opacity="0.16"/>${line(`M${x + 8} ${y} l4 8 l-3 6 l5 10`, '#e6ece0', 0.6)}${line(`M${x} ${y} l7 0 M${x} ${y} l5 5 M${x} ${y} l0 7`, '#e1ddd5', 0.4)}`;
      s += `${dot(x + 30, y + 30, 1.4, '#4f5e38', 0.6)}${dot(x + 12, y + 36, 1.2, '#4f5e38', 0.6)}`;
    }
    s += `<path d="M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}" stroke="${frame}" stroke-width="1.6"/>`;
    s += box(x - 4, y + h + 2, w + 8, 3.4, frame, ' rx="1"');
    if (p === 'frost') s += `${box(x, y, w, h, url('Frost'), ' opacity="0.86"')}${line(`M${x + 2} ${y + 30} q7 -4 10 -12 M${x + w - 2} ${y + 4} q-8 2 -10 10`, '#fff', 1.2)}`;
    else if (p === 'grow') s += box(x, y, w, h, url('Dusty'), ' opacity="0.55"');
    if (winter() || p === 'snow') s += box(x - 4, y + h + 1, w + 8, 2, SNOW, ' rx="1"');
    return s + '</g>';
  }
  // the waiting room seen through the window and through the open doorway
  function insides(st) {
    return `<g clip-path="${url('WinClip')}">${waitingInside(st)}</g><g clip-path="${url('WayClip')}">${waitingInside(st)}</g>`;
  }
  // the open doorway into the waiting room
  function doorway() {
    const { x, y, w, h } = WAY;
    let s = `<path d="M${x - 2} ${y + h} V${y + 8} Q${x - 2} ${y - 2.4} ${x + w / 2} ${y - 2.4} Q${x + w + 2} ${y - 2.4} ${x + w + 2} ${y + 8} V${y + h}" stroke="${K.trim}" stroke-width="2.4" fill="none"/>`;
    // the door itself, folded back against the wall
    s += `<path d="M${x + w + 2} ${y + 6} l4 2 V${y + h - 1} l-4 1Z" fill="${U.mix(WINE, '#7d6a62', PCT > 0.5 ? 0 : 0.5)}"/>`;
    s += text(x + w / 2, y - 5, 'WAITING ROOM', 3.4, K.trim, ' letter-spacing="0.3"');
    return s;
  }

  // ---------------------------------------------------- the ticket office
  function door(st, C) {
    const p = pend(st, 'door'), ok = st.door;
    const c = ok ? C.haltDoor : U.mix(C.haltDoor, '#a59e90', 0.62), dk = U.shade(c, -0.25);
    const { x, y, w, h } = DOOR;
    let s = `<g data-part="door">${box(x - 2.4, y - 2.4, w + 4.8, h + 2.4, ok ? K.sash : '#c9c1b2')}${box(x, y, w, h, c)}`;
    // a little window in the top, then two panels
    s += `${box(x + 3, y + 3, w - 6, 13, ok ? url('Glass') : url('Grime'))}<path d="M${x + w / 2} ${y + 3} V${y + 16}" stroke="${dk}" stroke-width="0.8"/>`;
    for (const [px, py] of [[x + 3, y + 20], [x + 3, y + 36]]) s += `<rect x="${px}" y="${py}" width="${w - 6}" height="13" rx="0.6" fill="none" stroke="${dk}" stroke-width="1"/>`;
    s += dot(x + w - 3.6, y + 31, 1.3, ok ? '#e9c35a' : '#77705f');
    s += text(x + w / 2, y - 4.6, 'TICKETS', 3.6, K.trim, ' letter-spacing="0.4"');
    if (ok) s += `${box(x + 5, y + 8.4, w - 10, 4, '#fffaf0', ' rx="0.6"')}${text(x + w / 2, y + 11.6, 'OPEN', 3, WINE)}`;
    else s += `${oval(x + 6, y + 24, 3, 2, '#d8cfbf', 0.75)}${oval(x + 16, y + 42, 2.6, 1.6, '#d8cfbf', 0.7)}${oval(x + 7, y + 47, 3, 1.2, '#d8cfbf', 0.6)}${line(`M${x + 14} ${y + 16} l-2 9 l2 5`, '#3a302a', 0.8)}`;
    if (p === 'grow') s += box(x, y, w, h, FADE, ' opacity="0.5"');
    else if (p === 'frost') s += box(x + 3, y + 3, w - 6, 13, url('Frost'), ' opacity="0.8"');
    if (winter() || p === 'snow') s += box(x - 3, y - 3.6, w + 6, 1.8, SNOW, ' rx="0.9"');
    return s + '</g>';
  }
  // the office window, and the shelves inside it where things are kept for the trains
  function shelves(st) {
    const p = pend(st, 'shelves'), ok = st.shelves && p !== 'grow';
    const { x, y, w, h } = OFF;
    let s = `<g data-part="shelves">${box(x - 2.4, y - 2.4, w + 4.8, h + 4.8, K.sash)}<g clip-path="${url('OffClip')}">${box(x, y, w, h, st.shelves ? '#7a5a40' : '#5f5046')}`;
    const rows = [y + 11, y + 22, y + 33];
    for (const ry of rows) s += box(x, ry, w, 2, st.shelves ? '#c9924f' : '#8a7a62');
    const SPINE = ['#c9474f', '#3d5a86', '#e9962c', '#4e7b5b', '#f2c230', '#8e2f3a'];
    if (ok) {
      // ledgers, parcels and jars, every row full and in order
      for (let i = 0; i < 6; i++) s += box(x + 2 + i * 4.8, rows[0] - 8 + (i % 2), 4, 8 - (i % 2), SPINE[i]);
      for (let i = 0; i < 3; i++) s += `${box(x + 2 + i * 9.6, rows[1] - 7.4, 8.6, 7.4, '#c99e69', ' rx="0.6"')}${line(`M${f1(x + 6.3 + i * 9.6)} ${f1(rows[1] - 7.4)} v7.4 M${f1(x + 2 + i * 9.6)} ${f1(rows[1] - 3.7)} h8.6`, '#8a5a3a', 0.6)}`;
      for (let i = 0; i < 4; i++) s += `${box(x + 2.4 + i * 7.2, rows[2] - 8, 5.6, 8, '#d8e6e2', ' rx="1"')}${box(x + 2.4 + i * 7.2, rows[2] - 9.4, 5.6, 1.6, ['#d9483b', '#f2c230', '#3f7ac9', '#4f8a3c'][i])}`;
    } else {
      // gaps, things on their sides and dust
      for (const [i, tilt] of [[0, 0], [1, 0], [3, 24], [5, 0]]) s += `<g transform="rotate(${tilt} ${f1(x + 4 + i * 4.8)} ${rows[0]})">${box(x + 2 + i * 4.8, rows[0] - 8, 4, 8, U.mix(SPINE[i], '#8a8070', 0.5))}</g>`;
      s += `<g transform="rotate(-12 ${x + 10} ${rows[1]})">${box(x + 4, rows[1] - 7, 9, 7, '#a08a6a')}</g>${box(x + 22, rows[1] - 5, 8, 5, '#a08a6a')}`;
      s += `${box(x + 3, rows[2] - 8, 5.6, 8, '#b9c4c0', ' rx="1"')}<g transform="rotate(80 ${x + 20} ${rows[2] - 2})">${box(x + 17, rows[2] - 4, 5.6, 8, '#b9c4c0', ' rx="1"')}</g>`;
      s += box(x, y, w, h, url('Dusty'), ' opacity="0.35"') + line(`M${x + 2} ${y + 2} l5 5 M${x + w - 2} ${y + 2} l-6 4`, '#e1ddd5', 0.4);
    }
    if (p === 'grow') s += box(x, y, w, h, url('Dusty'), ' opacity="0.4"') + `<g transform="rotate(30 ${x + 14} ${rows[0]})">${box(x + 12, rows[0] - 8, 4, 8, '#c9474f')}</g>`;
    s += `</g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${url('Glass')}" opacity="0.2"/><path d="M${x + w / 2} ${y} V${y + h}" stroke="${K.sash}" stroke-width="1.4"/>`;
    s += box(x - 4, y + h + 2, w + 8, 3, K.sash, ' rx="1"');
    if (winter() || p === 'snow') s += box(x - 4, y + h + 1, w + 8, 2, SNOW, ' rx="1"');
    return s + '</g>';
  }
  // umbrellas, a hat, a suitcase and a teddy, left on the trains years ago
  function umbrella(x, y, col, open) {
    if (open) return `<path d="M${x - 7} ${y} Q${x} ${y - 9} ${x + 7} ${y}Z" fill="${col}"/>${line(`M${x} ${y} v6 q0 2 -2 2`, '#3d3d42', 0.9)}`;
    return `<path d="M${x - 1.6} ${y} L${x} ${y - 14} L${x + 1.6} ${y}Z" fill="${col}"/>${line(`M${x} ${y} v3 q0 2 -2 2`, '#3d3d42', 0.9)}`;
  }
  function lost(st) {
    const p = pend(st, 'lost'), ok = st.lost && p !== 'grow';
    const { x, y, w, h } = LOST;
    let s = `<g data-part="lost">${box(x - 2.4, y - 9, w + 4.8, h + 11.4, K.trim, ' rx="1"')}`;
    s += text(x + w / 2, y - 3.2, 'LOST PROPERTY', 3.3, '#fbf6ea', ' letter-spacing="0.2"');
    s += `<g clip-path="${url('LostClip')}">${box(x, y, w, h, st.lost ? '#6b4a32' : '#4f4238')}`;
    const shelf = y + 18;
    s += box(x, shelf, w, 1.6, st.lost ? '#c9924f' : '#8a7a62');
    if (ok) {
      // everything on its shelf with a label, and a few already gone home
      s += `${umbrella(x + 5, shelf, '#d9483b', false)}${umbrella(x + 9, shelf, '#3d5a86', false)}`;
      s += `<path d="M${x + 15} ${shelf} q0 -6 5 -6 q5 0 5 6Z" fill="#3d3d42"/>${box(x + 13.4, shelf - 1.4, 13.2, 1.6, '#3d3d42', ' rx="0.6"')}${box(x + 16, shelf - 4, 8, 1.2, '#d9483b')}`;
      s += `${box(x + 3, y + 30, 12, 9, '#a8743c', ' rx="1"')}${box(x + 7, y + 28.4, 4, 1.8, '#6b4a32')}${box(x + 16, y + 31, 9, 8, '#e09a52', ' rx="3"')}${dot(x + 20.5, y + 30.4, 3, '#e09a52')}${dot(x + 19.4, y + 30, 0.5, '#3d3d42')}${dot(x + 21.6, y + 30, 0.5, '#3d3d42')}`;
      for (const [tx, ty] of [[x + 6, shelf - 6], [x + 21, shelf - 2], [x + 9, y + 33], [x + 22, y + 35]]) s += `${line(`M${tx} ${ty} l1.6 2.6`, '#c9b48a', 0.5)}${box(tx + 1, ty + 2.4, 3, 2, '#fffaf0', ' rx="0.4"')}`;
    } else {
      // a heap of things spilling over the counter, all in a muddle
      s += `<g transform="rotate(-30 ${x + 8} ${shelf})">${umbrella(x + 8, shelf, '#a8645a', false)}</g>${umbrella(x + 18, shelf + 3, '#6a7a8a', true)}`;
      s += `<g transform="rotate(14 ${x + 14} ${y + 34})">${box(x + 6, y + 29, 14, 9, '#8a6a4a', ' rx="1"')}</g><path d="M${x + 18} ${y + 38} q0 -6 6 -6 q4 0 4 6Z" fill="#5a5450"/>`;
      s += `${oval(x + 12, y + 26, 6, 2.4, '#b8aa8a', 0.9)}${line(`M${x + 4} ${y + 22} q6 4 12 0 q4 -3 10 1`, '#c9586e', 1.2, 0.8)}`;
    }
    s += `</g><path d="M${x} ${y} H${x + w}" stroke="#000" stroke-width="1" opacity="0.2"/>`;
    // the half-door counter at the front of the hatch
    s += `${box(x - 2.4, y + h - 2, w + 4.8, 3.4, K.board)}${box(x - 2.4, y + h + 1.4, w + 4.8, 334 - y - h - 1.4, url('Boards'))}`;
    if (ok) s += `${dot(x + w - 5, y + h - 4, 2.2, '#e2c27a')}${box(x + w - 6.6, y + h - 3, 3.2, 1, '#b8902f')}`;
    else s += `<g transform="rotate(-24 ${x + 6} ${y + h})">${umbrella(x + 6, y + h + 2, '#4e7b5b', false)}</g>${oval(x + 22, y + h + 4, 5, 2.4, '#b8aa8a', 0.9)}`;
    if (p === 'grow') s += `${box(x, y, w, h, url('Dusty'), ' opacity="0.3"')}<g transform="rotate(-30 ${x + 10} ${y + h})">${umbrella(x + 10, y + h, '#a8645a', false)}</g>`;
    if (winter() || p === 'snow') s += box(x - 2.4, y + h - 3.4, w + 4.8, 1.8, SNOW, ' rx="0.9"');
    return s + '</g>';
  }

  // ------------------------------------------------------ hanging baskets
  function basket(x, y, ok, i) {
    let s = line(`M${x - 6} ${y} L${x} ${CAN.y1} L${x + 6} ${y}`, '#3d3d42', 0.6);
    if (!ok) {
      s += `<path d="M${x - 7} ${y} Q${x} ${y + 9} ${x + 7} ${y}Z" fill="none" stroke="#5a5450" stroke-width="0.9"/>${oval(x, y + 1.4, 6, 1.6, '#7d6a52')}`;
      return s + line(`M${x - 2} ${y} l-2 -5 M${x + 1} ${y} l1 -6 M${x + 3} ${y} l3 -3`, '#8a7a5a', 0.8);
    }
    const F = FLOWERS[SEASON], r = U.rng(310 + i * 7);
    s += `<path d="M${x - 8} ${y} Q${x} ${y + 10} ${x + 8} ${y}Z" fill="#7a5a3a"/>${line(`M${x - 7} ${y + 2.4} Q${x} ${y + 9} ${x + 7} ${y + 2.4}`, '#5a4434', 0.6)}`;
    s += dot(x - 4, y - 1, 4, '#4f8a3c') + dot(x + 3.6, y - 1.4, 4.2, '#5d9644') + dot(x, y - 3.6, 3.6, '#4f8a3c');
    // trailing stems over the edge
    s += line(`M${x - 7} ${y + 1} q-3 5 -1 10 M${x + 7} ${y + 1} q3 6 0 11 M${x - 2} ${y + 6} q-1 4 1 8`, '#5d9644', 1);
    for (let k = 0; k < 9; k++) s += dot(x - 7 + r() * 14, y - 5 + r() * 7, 1.5, F[k % F.length]);
    for (const [dx, dy] of [[-8, 11], [7, 12], [-1, 14]]) s += dot(x + dx, y + dy, 1.3, F[(dx + 9) % F.length]);
    return s;
  }
  function baskets(st) {
    const p = pend(st, 'baskets'), ok = st.baskets && p !== 'grow';
    let s = '<g data-part="baskets">';
    [[106, 274], [186, 272]].forEach(([x, y], i) => { s += `<g class="ht-swing">${basket(x, y, ok, i)}</g>`; });
    // the empty bracket hooks show which baskets are missing
    if (!st.baskets) s += line('M106 262 v3 M186 262 v3', '#3d3d42', 0.8);
    if (winter() && st.baskets) s += oval(106, 270, 7, 1.4, SNOW) + oval(186, 268, 7, 1.4, SNOW);
    return s + '</g>';
  }

  // ------------------------------------------------------------ the platform
  function platform(st) {
    const p = pend(st, 'platform'), ok = st.platform && p !== 'grow';
    let s = `<g data-part="platform"><path d="${PLAT_D}" fill="${st.platform ? url('Flag') : url('FlagOld')}"/>${box(14, 334, 266, 2.4, '#000', ' opacity="0.1"')}`;
    const tufts = (n, seed) => {
      const r = U.rng(seed);
      let t = '';
      for (let i = 0; i < n; i++) { const x = 20 + r() * 256, y = 340 + r() * 36; t += line(`M${f1(x)} ${f1(y)} l-2 -4 M${f1(x)} ${f1(y)} l0.6 -5 M${f1(x)} ${f1(y)} l3 -3.4`, '#5f7a34', 1.1); }
      return t;
    };
    if (!st.platform) {
      s += `<path d="${PLAT_D}" fill="${url('Moss')}" opacity="0.45"/>${tufts(24, 83)}${oval(150, 360, 16, 3.4, '#7d8a8a', 0.7)}${oval(240, 372, 10, 2.4, '#7d8a8a', 0.7)}`;
      s += line('M60 346 l6 6 l-2 8 M196 352 l-5 7 l3 9', '#5a5446', 0.9, 0.8);
    } else if (p === 'grow') s += `<path d="${PLAT_D}" fill="${url('Moss')}" opacity="0.28"/>${tufts(9, 89)}`;
    if (p === 'leaves') s += `<path d="${PLAT_D}" fill="${url('Leaves')}"/>`;
    else if (p === 'snow') s += `<path d="${PLAT_D}" fill="${url('Snow')}" opacity="0.95"/>`;
    else if (p === 'frost') s += `<path d="${PLAT_D}" fill="${url('Frost')}" opacity="0.5"/>`;
    else if (winter() && st.platform) s += `<path d="M14 362 Q90 356 150 362 T284 360 L288 382 H14Z" fill="${SNOW}" opacity="0.85"/>`;
    // the white edge along the platform, bright once it is painted again
    s += `<path d="M14 376 H287 L288 382 H14Z" fill="${ok ? '#fbf8f0' : '#b9b4a6'}"/>${box(14, 382, 274, 1.4, '#000', ' opacity="0.16"')}`;
    if (!ok) s += line('M40 378 h20 M120 379 h14 M220 378 h26', '#8a8476', 1.2, 0.7);
    return s + '</g>';
  }
  // the brick face of the platform over the line, and its ramp at the end
  function platformFace() {
    let s = `<path d="${FACE_D}" fill="${PCT > 0.4 ? url('Brick') : url('BrickOld')}"/>${box(14, 400, 284, 4, '#000', ' opacity="0.14"')}`;
    s += `<path d="M280 334 L310 404 H298 L288 382Z" fill="${K.stone}"/><path d="M288 382 L298 404" stroke="#000" stroke-width="0.8" opacity="0.2"/>`;
    if (winter()) s += box(14, 381.4, 274, 1.6, SNOW);
    return s;
  }

  // ------------------------------------------------------------- the bench
  function bench(st) {
    const p = pend(st, 'bench'), ok = st.bench;
    let s = `<g data-part="bench">${shadow(88, 372, 26, 2.2)}`;
    if (ok) {
      const wood = '#a77b56', iron = K.iron;
      s += `${box(64, 342, 48, 3.6, wood, ' rx="1.4"')}${box(64, 347, 48, 3.6, wood, ' rx="1.4"')}${box(62, 355, 52, 4, U.shade(wood, -0.1), ' rx="1.4"')}`;
      s += `<path d="M66 340 V370 M110 340 V370 M66 359 l-3 11 M110 359 l3 11" stroke="${iron}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M64 359 q-4 -4 0 -8 M112 359 q4 -4 0 -8" stroke="${iron}" stroke-width="1.6" fill="none"/>`;
      if (p === 'leaves') s += oval(76, 354, 3.2, 1.4, '#d9822b') + oval(96, 354.6, 3, 1.3, '#c4462f') + oval(104, 343, 2.6, 1.2, '#e9b23c');
      else if (p === 'grow') s += box(62, 342, 52, 17, FADE, ' opacity="0.45"');
      else if (p === 'frost') s += box(62, 342, 52, 17, url('Frost'), ' opacity="0.5"');
      if (winter() || p === 'snow') s += `${box(62, 353.6, 52, 2.2, SNOW, ' rx="1"')}${box(64, 340.6, 48, 1.8, SNOW, ' rx="0.9"')}`;
    } else {
      // only the iron ends are left, and a plank on the ground
      s += `<path d="M66 352 V370 M110 352 V370 M66 359 l-3 11 M110 359 l3 11" stroke="#6f6a62" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
      s += `<g transform="rotate(8 90 368)">${box(70, 366, 40, 3.4, '#8a8172', ' rx="1"')}</g>${box(64, 355, 18, 3.6, '#8a8172', ' rx="1"')}`;
      s += line('M90 352 l2 -6 M92 353 l4 -4', '#6f8a3e', 1);
    }
    return s + '</g>';
  }

  // --------------------------------------------------------- the parcels
  function parcel(x, y, w, h, col, stamped) {
    let s = `${box(x, y, w, h, col, ' rx="0.8"')}${line(`M${f1(x + w / 2)} ${y} V${y + h} M${x} ${f1(y + h / 2)} H${x + w}`, '#e9dcc0', 0.8)}`;
    if (stamped) s += `${box(x + w - 5, y + 1.2, 3.8, 3.4, '#d9483b', ' rx="0.3"')}${box(x + w - 4.4, y + 1.8, 2.6, 2.2, '#fbf6ea', ' opacity="0.5"')}${box(x + 2, y + h - 4, 6, 1, '#3b352e', ' opacity="0.5"')}`;
    return s;
  }
  function parcels(st) {
    const p = pend(st, 'parcels'), ok = st.parcels && p !== 'grow';
    let s = `<g data-part="parcels">${shadow(218, 373, 28, 2)}`;
    // the old wooden trolley with its big iron wheels
    const tr = st.parcels ? '#8a5a3a' : '#7d6e5e';
    s += `${box(194, 356, 50, 5, tr, ' rx="1"')}${box(194, 352, 3, 6, tr)}${line('M244 356 l8 -14', st.parcels ? '#3d3d42' : '#6f6a62', 1.6)}`;
    s += `${dot(204, 364, 6, '#3d3d42')}${dot(204, 364, 3, st.parcels ? '#c9924f' : '#8a7a62')}${dot(234, 364, 6, '#3d3d42')}${dot(234, 364, 3, st.parcels ? '#c9924f' : '#8a7a62')}`;
    if (ok) {
      s += parcel(197, 344, 16, 12, '#c99e69', true) + parcel(214, 346, 12, 10, '#b98a52', true) + parcel(227, 342, 15, 14, '#d4ad74', true);
      s += parcel(200, 334, 12, 10, '#d4ad74', true) + parcel(213, 336, 14, 10, '#c99e69', true) + parcel(229, 333, 10, 9, '#b98a52', true);
      s += `${parcel(206, 325, 14, 9, '#c99e69', true)}${line('M203 326 q-2 -4 2 -6', '#c9b48a', 0.6)}`;
    } else {
      // parcels tumbled off the trolley, unstamped, string undone
      s += `<g transform="rotate(-80 236 358)">${box(236, 344, 6, 24, tr)}</g>`;
      s += `<g transform="rotate(-14 204 350)">${parcel(197, 344, 15, 11, '#b8a07a', false)}</g>${parcel(176, 362, 14, 10, '#b8a07a', false)}<g transform="rotate(22 252 368)">${parcel(246, 362, 12, 9, '#a8916a', false)}</g>`;
      s += line('M188 372 q8 -3 14 1 q6 3 10 -1', '#c9b48a', 0.8);
    }
    if (p === 'grow') s += `<g transform="rotate(18 182 366)">${parcel(176, 360, 13, 10, '#b8a07a', false)}</g>${parcel(214, 346, 12, 10, '#b98a52', true)}${parcel(199, 344, 14, 12, '#c99e69', true)}`;
    if (winter() && st.parcels && p !== 'grow') s += box(206, 324, 14, 1.8, SNOW, ' rx="0.9"');
    return s + '</g>';
  }

  // ------------------------------------------------------------- the lamps
  function lamp(x, ok, lean) {
    const iron = ok ? K.iron : '#6f6a62';
    let s = `<g${lean ? ` transform="rotate(${lean} ${x} 378)"` : ''}>${shadow(x, 378, 6, 1.2)}${box(x - 3, 370, 6, 8, iron, ' rx="1"')}${box(x - 1.3, 302, 2.6, 70, iron)}`;
    s += `${box(x - 6, 304, 12, 1.4, iron)}${dot(x - 6, 304.6, 1, iron)}${dot(x + 6, 304.6, 1, iron)}`;
    // the lantern: a glass box with a cap and a finial
    s += `<path d="M${x - 5} 300 L${x - 6.4} 286 H${x + 6.4} L${x + 5} 300Z" fill="${ok ? '#fff6d8' : url('Grime')}" stroke="${iron}" stroke-width="1.2"/>`;
    s += `<path d="M${x} 286 V300 M${x - 5.6} 293 H${x + 5.6}" stroke="${iron}" stroke-width="0.6"/><path d="M${x - 8} 286 L${x} 279 L${x + 8} 286Z" fill="${iron}"/>${dot(x, 277.6, 1.4, ok ? '#e2c27a' : iron)}`;
    if (!ok) s += `<path d="M${x + 1} 287 l4 0 l-2 6Z" fill="#3b352e" opacity="0.7"/>${line(`M${x - 4} 290 l3 3`, '#e6ece0', 0.5)}`;
    return s + '</g>';
  }
  function lamps(st) {
    const p = pend(st, 'lamps'), ok = st.lamps;
    let s = `<g data-part="lamps">${lamp(32, ok, ok ? 0 : -3)}${lamp(274, ok, ok ? 0 : 4)}`;
    if (p === 'grow') s += `${line('M26 288 l12 10 M268 288 l12 10 M26 298 l12 -10', '#e1ddd5', 0.5, 0.9)}${oval(32, 292, 6, 6, FADE, 0.5)}${oval(274, 292, 6, 6, FADE, 0.5)}`;
    else if (p === 'frost') s += oval(32, 293, 5.6, 6.6, url('Frost'), 0.8) + oval(274, 293, 5.6, 6.6, url('Frost'), 0.8);
    if (winter() || p === 'snow') s += `<path d="M23.6 285.4 L32 278.4 L40.4 285.4" stroke="${SNOW}" stroke-width="1.8" fill="none"/><path d="M265.6 285.4 L274 278.4 L282.4 285.4" stroke="${SNOW}" stroke-width="1.8" fill="none"/>`;
    return s + '</g>';
  }

  // ---------------------------------------------------------- the crossing
  function gate(st, C) {
    const p = pend(st, 'gate'), ok = st.gate;
    const c = ok ? C.haltGate : U.mix(C.haltGate, '#a59e90', 0.55), dk = U.shade(c, -0.3);
    const red = ok ? '#c9474f' : '#a8645a';
    let s = `<g data-part="gate">${shadow(304, 402, 30, 1.8)}`;
    // the two posts, with a lamp on the far one
    s += `${box(278, 356, 5, 46, ok ? '#fbf8f0' : '#b9b4a6')}${box(277, 354, 7, 3, '#3d3d42')}${box(326, 360, 5, 42, ok ? '#fbf8f0' : '#b9b4a6')}${box(325, 358, 7, 3, '#3d3d42')}`;
    s += `${box(326, 348, 5, 8, '#3d3d42', ' rx="1"')}${dot(328.5, 352, 1.6, ok ? '#e9574c' : '#6a5a5a')}`;
    // the gate itself: five bars, a diagonal brace and a red disc in the middle
    const g = `<path d="M283 368 H326 M283 376 H326 M283 384 H326 M283 392 H326 M283 398 H326" stroke="${dk}" stroke-width="3"/>
      <path d="M283 368 H326 M283 376 H326 M283 384 H326 M283 392 H326 M283 398 H326" stroke="${c}" stroke-width="2"/>
      <path d="M284 398 L325 368" stroke="${c}" stroke-width="2.2"/>${box(283, 366, 3, 33, c)}${box(323, 366, 3, 33, c)}
      ${dot(304.5, 382, 7.4, '#fbf8f0')}${dot(304.5, 382, 6.2, red)}${box(299.4, 380.8, 10.2, 2.4, '#fbf8f0', ' opacity="0.9"')}
      ${box(288, 366.6, 5, 2.6, red)}${box(298, 366.6, 5, 2.6, red)}${box(308, 366.6, 5, 2.6, red)}${box(318, 366.6, 5, 2.6, red)}`;
    s += ok ? g : `<g transform="rotate(4 283 398)">${g}</g>${oval(296, 390, 3, 1.4, '#d8cfbf', 0.7)}${oval(316, 372, 2.6, 1.2, '#d8cfbf', 0.7)}${line('M288 402 q2 -8 0 -14 M320 402 q-2 -6 1 -10', '#6f8a3e', 1.2)}`;
    if (p === 'grow') s += box(283, 366, 43, 33, FADE, ' opacity="0.42"');
    else if (p === 'frost') s += box(283, 366, 43, 33, url('Frost'), ' opacity="0.42"');
    if (winter() || p === 'snow') s += `${line('M283 367 H326', SNOW, 1.6)}${box(277, 352.6, 7, 1.8, SNOW, ' rx="0.9"')}${box(325, 346.6, 7, 1.8, SNOW, ' rx="0.9"')}`;
    return s + '</g>';
  }

  // -------------------------------------------------------------- the line
  // where the lane goes over the rails, planks lie between them
  const LITTER = [
    () => `<g transform="rotate(-20 58 424)"><path d="M52 419 h12 l-1 9 h-10Z" fill="#d9483b"/>${box(53, 422, 10, 3, '#f2c230')}</g>`,
    () => `<g transform="rotate(70 122 440)">${box(118, 434, 7, 12, '#b8c0c8', ' rx="1.4"')}${box(118, 437, 7, 5, '#3f7ac9')}</g>`,
    () => `<g transform="rotate(-62 186 430)">${box(183, 422, 6, 13, '#bfe6f2', ' rx="2" opacity="0.9"')}${box(184.4, 419, 3.2, 3.4, '#3f7ac9')}</g>`,
    () => `<g><path d="M240 446 q-6 -8 2 -12 q4 -6 10 -1 q8 2 4 10 q-4 6 -16 3Z" fill="#f4f6f8"/><path d="M244 438 q4 3 8 0" stroke="#3f7ac9" stroke-width="1.4" fill="none"/></g>`,
    () => `<g transform="rotate(-8 92 490)">${box(84, 486, 16, 9, '#f6efe0')}${line('M86 489 h12 M86 492 h8', '#9a9080', 0.7)}</g>`,
    () => `<g transform="rotate(78 352 438)"><path d="M346 444 L352 426 L358 444Z" fill="#e9762c"/>${box(348.6, 434, 6.8, 2.6, '#fff')}${box(344, 443.4, 16, 2.6, '#2b2a2e')}</g>`,
    () => `<g transform="rotate(-80 210 500)">${box(207, 493, 6, 13, '#cfe8e0', ' rx="2" opacity="0.9"')}${box(208.4, 490, 3.2, 3.4, '#4f8a3c')}</g>`,
  ];
  function track(st) {
    const p = pend(st, 'line'), { y0, y1, r0, r1 } = TRACK;
    let s = `<g data-part="line"><path d="M0 ${y0} H400 V${y1} H0Z" fill="${url('Ballast')}"/>${box(0, y0, 400, 3, '#000', ' opacity="0.12"')}`;
    if (!st.line) s += `<path d="M0 ${y0} H400 V${y1} H0Z" fill="${url('Moss')}" opacity="0.22"/>`;
    // the sleepers
    let sl = '';
    for (let x = 4; x < 400; x += 15) sl += `M${x} ${y0 + 6} L${x + 3} ${y1 - 5} `;
    s += `<path d="${sl}" stroke="${winter() ? '#8a7f74' : '#6b5440'}" stroke-width="6.4"/><path d="${sl}" stroke="#000" stroke-width="6.4" opacity="0.1" transform="translate(1 1)"/>`;
    // the planks of the crossing under the lane
    const [la] = laneAt(y0), [lb] = laneAt(y1);
    s += `<path d="M${f1(la)} ${y0 + 2} H${f1(laneAt(y0)[1])} L${f1(laneAt(y1)[1])} ${y1 - 2} H${f1(lb)}Z" fill="${winter() ? '#d6dbe0' : '#a8875a'}"/>`;
    for (let y = y0 + 6; y < y1 - 2; y += 7) s += line(`M${f1(laneAt(y)[0])} ${y} H${f1(laneAt(y)[1])}`, '#6b5440', 0.7, 0.6);
    // two rails, rusty along the top: no wheels have polished them in years
    for (const ry of [r0, r1]) s += `${box(0, ry - 2.6, 400, 5.2, url('Rail'))}${box(0, ry - 2.6, 400, 1.4, PCT > 0.6 ? '#c7beb2' : '#a8735a', ' opacity="0.9"')}`;
    if (!st.line) {
      // weeds through the ballast and litter thrown from the lane
      const r = U.rng(67);
      for (let i = 0; i < 16; i++) { const x = r() * 400, y = y0 + 8 + r() * 46; s += line(`M${f1(x)} ${f1(y)} l-2 -5 M${f1(x)} ${f1(y)} l0.6 -6 M${f1(x)} ${f1(y)} l3 -4`, '#5f7a34', 1.2); }
      s += LITTER.map((f) => f()).join('');
    } else if (p === 'grow') s += LITTER[0]() + LITTER[3]() + LITTER[6]();
    else {
      // a few wildflowers in the ballast, and a bin by the lane
      const F = FLOWERS[SEASON];
      if (!winter()) { const r = U.rng(71); for (let i = 0; i < 10; i++) s += dot(r() * 260, y0 + 6 + r() * 50, 1.3, F[i % F.length]); }
    }
    if (st.line) s += `${shadow(250, 470, 7, 1.4)}${box(244, 454, 12, 16, '#3f6b4a', ' rx="1.6"')}${box(243, 452, 14, 3.2, '#2f5238', ' rx="1.4"')}${box(247, 460, 6, 4, '#e9e3d6', ' rx="0.6"')}`;
    if (p === 'leaves') s += `<path d="M0 ${y0} H400 V${y0 + 20} H0Z" fill="${url('Leaves')}" opacity="0.8"/>`;
    if (winter() || p === 'snow') s += `<path d="M0 ${y0 + 2} H400 V${y1} H0Z" fill="${url('Snow')}" opacity="0.6"/>${box(0, r0 - 3.6, 400, 1.6, SNOW)}${box(0, r1 - 3.6, 400, 1.6, SNOW)}${st.line ? box(243, 450.6, 14, 1.8, SNOW, ' rx="0.9"') : ''}`;
    return s + '</g>';
  }

  // a low wooden fence along the line, with a gap where the lane comes through
  function lineFence() {
    const c = PCT > 0.4 ? '#a8875a' : '#8a7f6e', dk = U.shade(c, -0.25);
    let s = '';
    const posts = [];
    for (let x = 6; x < 400; x += 24) if (x < 250 || x > 350) posts.push(x);
    s += `<path d="M0 470 H254 M346 470 H400 M0 477 H254 M346 477 H400" stroke="${dk}" stroke-width="2.2"/><path d="M0 469.6 H254 M346 469.6 H400 M0 476.6 H254 M346 476.6 H400" stroke="${c}" stroke-width="1.4"/>`;
    for (const x of posts) s += `${box(x - 1.6, 465, 3.2, 17, c)}${box(x - 1.6, 465, 3.2, 1.2, '#fff', ' opacity="0.2"')}${box(x - 1.6, 480, 3.2, 2, dk)}`;
    if (PCT < 0.4) s += `<g transform="rotate(12 126 476)">${box(110, 475, 32, 2, c)}</g>`;
    if (winter()) s += line('M0 468.4 H254 M346 468.4 H400', SNOW, 1.4) + posts.map((x) => box(x - 1.8, 463.6, 3.6, 1.6, SNOW, ' rx="0.8"')).join('');
    return s;
  }
  // the grass verge along the front, with wildflowers in season
  function verge() {
    const g = K.grass, r = U.rng(91);
    let s = `<path d="M0 462 H400 V540 H0Z" fill="${g[0]}"/>${box(0, 462, 400, 3, '#000', ' opacity="0.08"')}${lane2()}`;
    const cols = FLOWERS[SEASON];
    for (let i = 0; i < 44; i++) {
      const x = r() * 400, y = 470 + r() * 68;
      if (x > 256 && x < 344) continue;
      s += line(`M${f1(x)} ${f1(y)} l-2 -5 M${f1(x)} ${f1(y)} l0.6 -6 M${f1(x)} ${f1(y)} l2.6 -4`, i % 2 ? g[1] : U.shade(g[1], -0.1), 1);
      if (!winter() && PCT > 0.3 && i % 3 === 0) s += dot(x + 0.6, y - 6.6, 1.6, U.pick(r, cols)) + dot(x + 0.6, y - 6.6, 0.6, '#f2c230');
    }
    if (winter()) s += `<path d="M0 470 Q80 464 160 472 T300 468 T400 470 V540 H0Z" fill="${SNOW}" opacity="0.72"/>`;
    return s;
  }
  // the near end of the lane, over the verge
  function lane2() {
    const [a] = laneAt(462), [, b] = laneAt(462);
    return `<path d="M${f1(a)} 462 H${f1(b)} L340 540 H262Z" fill="${winter() ? '#e8edf1' : '#cdbf9f'}"/><path d="M${f1(a)} 462 L262 540 M${f1(b)} 462 L340 540" stroke="${winter() ? '#d8e0e6' : '#b5a684'}" stroke-width="2"/>
      <path d="M300 466 L304 466 L302 540 L294 540Z" fill="${K.grass[1]}" opacity="${winter() ? 0.3 : 0.55}"/>`;
  }
  // brambles and nettles while the halt is forgotten, a broken barrow by the lane
  function clutter() {
    if (PCT >= 0.5) return '';
    let s = '';
    const r = U.rng(97);
    const weed = (x, y) => line(`M${x} ${y} l-3 -8 M${x} ${y} l1 -10 M${x} ${y} l4 -7`, U.pick(r, ['#5f8a3a', '#7a9a44', '#4d7a32']), 1.2);
    for (const [x, y] of [[20, 500], [126, 522], [370, 496], [356, 528], [40, 336], [250, 334]]) for (let k = 0; k < 3; k++) s += weed(x + k * 4, y);
    s += `<g transform="rotate(-12 360 470)">${box(346, 462, 26, 8, '#8a7a62')}${dot(352, 472, 4, '#5a5450')}</g>`;
    return `<g opacity="${f1(1 - PCT * 1.6)}">${s}</g>`;
  }
  function saleSign() {
    if (!(FORSALE || PCT < 0.15)) return '';
    return `<g><rect x="98.5" y="506" width="3" height="28" fill="#8a6142"/><g transform="rotate(-4 100 502)">
      <rect x="76" y="492" width="48" height="21" rx="2" fill="#f6efe0" stroke="#7d6e58" stroke-width="1.2"/>
      <text x="100" y="505.6" text-anchor="middle" font-family="${FONT}" font-size="8.4" font-weight="900" fill="#3d5a86">FOR SALE</text>
      ${FORSALE ? '' : `<g transform="rotate(-10 100 510)"><rect x="73" y="506" width="54" height="10" fill="#d9534f"/><text x="100" y="514" text-anchor="middle" font-family="${FONT}" font-size="8" font-weight="900" fill="#fff">SOLD</text></g>`}</g></g>`;
  }

  // -------------------------------------------------------- the station cat
  // asleep on the platform once the place is cared for (in her basket if there is one)
  function cat(decor) {
    if (PCT < 0.6) return '';
    const [x, y] = decor['h-cat'] ? [142, 360] : [144, 344];
    const fur = '#4a4648', lt = '#f2ece2';
    return `<g>${shadow(x, y + 4, 12, 1.6)}<g class="ht-breathe">${oval(x, y, 10, 5.4, fur)}${oval(x - 2, y + 2, 5, 2.4, lt)}</g>
      <path d="M${x + 9} ${y + 2} q5 3 0 5 q-8 2 -16 0" stroke="${fur}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      ${dot(x - 9, y + 1, 4.4, fur)}<path d="M${x - 12.4} ${y - 2} l-0.4 -4 l3 2Z M${x - 7.6} ${y - 2.6} l1.2 -3.8 l1.6 3.4Z" fill="${fur}"/>${oval(x - 9.4, y + 3, 2.4, 1.4, lt)}
      ${line(`M${x - 11.4} ${y + 0.6} q1 0.8 2 0 M${x - 8} ${y + 0.6} q1 0.8 2 0`, '#d9d0c0', 0.6)}
      <path d="M${x - 2} ${y - 10} h3 l-3 3.6 h3 M${x + 3} ${y - 16} h2.4 l-2.4 3 h2.4" stroke="#8a83a8" stroke-width="0.9" fill="none" stroke-linecap="round" opacity="0.7"/></g>`;
  }

  // ------------------------------------------------------------ decorations
  // Bought in the shed; each one is a small drawing at a fixed spot.
  function bunting(a, b, sag, n) {
    const cols = [WINE, '#f6efe0', '#f2c230', '#3f7ac9', '#4f8a3c', '#ef8aa6'];
    const at = (t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + sag * 4 * t * (1 - t)];
    let s = `<path d="M${a[0]} ${a[1]} Q${f1((a[0] + b[0]) / 2)} ${f1((a[1] + b[1]) / 2 + sag * 2)} ${b[0]} ${b[1]}" stroke="#6b6157" stroke-width="0.6" fill="none"/>`;
    for (let i = 1; i < n; i++) {
      const [x, y] = at(i / n);
      s += `<path class="ht-flag" d="M${f1(x - 2.6)} ${f1(y)} h5.2 l-2.6 5.4Z" fill="${cols[i % cols.length]}"/>`;
    }
    return s;
  }
  // little lamps on a string along the edge of the canopy
  const BULBS = (() => { const out = []; for (let x = 42; x <= 266; x += 9) out.push([x, 266 + Math.abs(Math.sin(((x - 42) / 56) * Math.PI)) * 3]); return out; })();
  const BULB_COLS = ['#ffe08a', '#ffb3c1', '#b3e5ff', '#c8f2b0'];
  const DECOR = {
    'h-cat': () => `<g>${shadow(142, 368, 15, 1.6)}<path d="M128 358 Q142 372 156 358 V362 Q142 374 128 362Z" fill="#c9924f"/>${oval(142, 359, 14, 3.4, '#a8434a')}
      ${line('M131 363 l2 3 M138 365 l1 3 M146 365 l-1 3 M153 363 l-2 3', '#a8743c', 0.8)}<path d="M128 358 Q142 371 156 358" stroke="#a8743c" stroke-width="1.2" fill="none"/></g>`,
    'h-churns': () => {
      const churn = (x, b, k) => `${shadow(x, b, 6 * k, 1.2)}<path d="M${f1(x - 5 * k)} ${b} V${f1(b - 13 * k)} Q${x} ${f1(b - 16 * k)} ${f1(x + 5 * k)} ${f1(b - 13 * k)} V${b}Z" fill="#c9cdd2"/>
        ${box(x - 2.6 * k, b - 19 * k, 5.2 * k, 4 * k, '#b5bac0')}${box(x - 3.4 * k, b - 20 * k, 6.8 * k, 1.6 * k, '#9aa0a6', ' rx="0.6"')}${box(x - 5 * k, b - 6 * k, 10 * k, 1.2 * k, '#9aa0a6')}${line(`M${f1(x - 4.6 * k)} ${f1(b - 9 * k)} V${f1(b - 2 * k)}`, '#fff', 0.8, 0.5)}`;
      return `<g>${churn(256, 372, 1)}${churn(266, 374, 0.85)}${winter() ? box(252, 351.4, 8, 1.4, SNOW) : ''}</g>`;
    },
    'h-trunk': () => `<g transform="translate(48 0)">${shadow(126, 374, 13, 1.6)}${box(114, 360, 24, 14, '#6b4a32', ' rx="1.6"')}<path d="M114 362 Q126 356 138 362" fill="#7d5a3e"/>
      ${box(118, 360, 2.4, 14, '#c9a06a')}${box(132, 360, 2.4, 14, '#c9a06a')}${box(124, 364, 4, 3, '#e2c27a', ' rx="0.6"')}${box(116, 367, 7, 4, '#f6efe0', ' rx="0.4"')}${dot(129, 369, 2, '#d9483b')}${winter() ? box(114, 358.4, 24, 1.8, SNOW, ' rx="0.9"') : ''}</g>`,
    'h-postbox': () => `<g>${shadow(22, 378, 6, 1.4)}${box(17, 352, 10, 26, '#c9302c', ' rx="1"')}<path d="M16 352 Q22 345 28 352Z" fill="#a8241f"/>${box(19, 358, 6, 1.6, '#3b2a1a')}
      ${box(18.6, 364, 6.8, 5, '#f2c230', ' rx="0.4"')}${box(16, 374, 12, 3, '#a8241f')}${winter() ? '<path d="M16 351 Q22 344 28 351" stroke="#f4f8fb" stroke-width="1.6" fill="none"/>' : ''}</g>`,
    'h-bike': () => `<g>${[[344, 470], [366, 470]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6.4" fill="none" stroke="#3d3d42" stroke-width="1.2"/>${dot(x, y, 0.9, '#9aa3ad')}`).join('')}
      <path d="M344 470 L351 461 L363 461 L366 470 M351 461 L355 470 L363 461 M362 458 L363 461 M349 459 h5" stroke="${WINE}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <path d="M364 457 h7 l-1 5 h-5Z" fill="#c9924f"/>${winter() ? oval(367.4, 456.6, 4, 1.2, SNOW) : dot(366, 456, 1.6, '#e2574c') + dot(369, 456.4, 1.4, '#f2d84a')}</g>`,
    'h-cart': () => {
      const F = FLOWERS[SEASON];
      let s = `<g>${shadow(220, 528, 22, 1.8)}${box(200, 508, 40, 14, '#8a5a3a', ' rx="1.2"')}${box(200, 508, 40, 2, '#fff', ' opacity="0.2"')}${line('M240 514 l14 -6', '#6b4a32', 1.8)}`;
      s += `${dot(210, 526, 5, '#3d3d42')}${dot(210, 526, 2, '#c9924f')}${dot(232, 526, 5, '#3d3d42')}${dot(232, 526, 2, '#c9924f')}`;
      for (let i = 0; i < 9; i++) s += dot(203 + i * 4.2, 506 - (i % 2) * 2, 3, '#4f8a3c');
      if (!winter()) for (let i = 0; i < 9; i++) s += dot(204 + i * 4.2, 503 - (i % 3), 1.6, F[i % F.length]);
      else s += oval(220, 503, 20, 2.2, SNOW);
      return s + '</g>';
    },
    'h-poster': () => `<g>${box(344, 252, 20, 22, '#f6efe0')}${box(345.6, 253.6, 16.8, 12, '#8fbfe6')}<path d="M345.6 262 Q354 256 362.4 262 V265.6 H345.6Z" fill="#6aa04c"/>${dot(358, 258, 2, '#f2c230')}
      ${text(354, 270.6, 'BY THE SEA', 2.8, WINE)}${box(344, 252, 20, 22, 'none', ' stroke="#c9b48a" stroke-width="0.6"')}</g>`,
    'h-bunting': () => `<g>${bunting([38, 249], [148, 251], 5, 12)}${bunting([152, 251], [270, 249], 5, 12)}</g>`,
    'h-bell': () => `<g>${box(43, 286, 6, 2, '#3d3d42')}${line('M44 286 Q44 280 50 280 H54', '#3d3d42', 1.4)}<g class="ht-swing"><path d="M48 282 q0 -2 3 -2 h2 q3 0 3 2 l2 10 h-12Z" fill="#e2c27a"/>${box(46, 291, 12, 1.6, '#c99a2e', ' rx="0.8"')}${dot(52, 294, 1.4, '#b8902f')}</g>${line('M56 285 q6 8 2 26', '#c9b48a', 0.6)}</g>`,
    'h-vane': () => `<g>${line('M150 146 V130', '#3d3d42', 1)}${line('M144 138 H156', '#3d3d42', 0.7)}${text(142, 139.6, 'W', 3, '#3d3d42')}${text(158, 139.6, 'E', 3, '#3d3d42')}
      <g class="ht-swing"><path d="M141 129 q4 -5 9 -2 q3 -4 6 0 l-2 2 l3 2 h-14Z" fill="#3d3d42"/><path d="M155 127 l2 -2 l0 3Z" fill="#3d3d42"/></g></g>`,
    'h-lights': () => `<g class="ht-wire">${line(`M${BULBS[0][0]} ${BULBS[0][1] - 1} ${BULBS.map(([x, y]) => `L${f1(x)} ${f1(y - 0.6)}`).join(' ')}`, '#3d3d42', 0.5)}${BULBS.map(([x, y], i) => `<circle class="bulb" cx="${f1(x)}" cy="${f1(y)}" r="1.6" fill="${BULB_COLS[i % 4]}"/>`).join('')}</g>`,
    'h-tea': () => `<g>${shadow(166, 526, 26, 2)}${box(144, 492, 44, 34, '#4e7b5b', ' rx="1"')}<path d="M140 492 H192 L188 484 H144Z" fill="#3f6b4a"/>
      ${[0, 1, 2, 3, 4].map((k) => `<path d="M${144 + k * 9} 492 h9 v5 q-4.5 3 -9 0Z" fill="${k % 2 ? '#f6efe0' : WINE}"/>`).join('')}
      ${box(150, 499, 32, 14, '#3b2f26')}${box(148, 512, 36, 3, '#c9924f')}<path d="M156 512 v-5 q0 -2 2 -2 h6 q2 0 2 2 v5Z" fill="#f6efe0"/><path d="M166 507 q3 0 3 2.4 q0 2 -3 2" stroke="#f6efe0" stroke-width="1" fill="none"/>
      ${dot(161, 504.6, 1, '#c9474f')}${box(170, 509, 5, 3, '#fffaf0')}${box(176, 509, 5, 3, '#fffaf0')}
      <g class="ht-steam"><path d="M160 503 q-2 -4 0 -7 q2 -3 0 -6" stroke="#fffaf0" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.75"/><path d="M164 503 q-2 -4 0 -7 q2 -3 0 -6" stroke="#fffaf0" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.75"/></g>
      ${text(166, 523, 'TEA', 6, '#f6efe0', ' letter-spacing="1"')}${winter() ? '<path d="M140 491 H192 L188 483.4 H144Z" fill="#f4f8fb"/>' : ''}</g>`,
  };
  // the things that stand on the platform are drawn with it, the rest on top
  const ONPLAT = new Set(['h-cat', 'h-churns', 'h-trunk', 'h-postbox']);
  function decorations(owned, on) {
    let s = '';
    for (const k of Object.keys(DECOR)) if (owned[k] && ONPLAT.has(k) === on) s += DECOR[k]();
    return s;
  }

  function life(st) {
    let s = '';
    if (PCT > 0.3) s += '<g class="bird"><path d="M100 104 q4 -4 8 0 q4 -4 8 0 M124 116 q3 -3 6 0 q3 -3 6 0" stroke="#4a4a50" stroke-width="1.5" fill="none"/></g>';
    // a robin on the gate post, and swallows on the wire in summer
    if (PCT > 0.5) s += `<g class="ht-hop">${oval(280.6, 350, 3.4, 2.8, '#8a6a4a')}${oval(282.4, 351, 2, 1.6, '#e2674c')}${dot(282.8, 347.6, 1.9, '#8a6a4a')}<path d="M284.4 347.6 l1.6 0.4 l-1.6 0.4Z" fill="#3d3d42"/>${dot(283.2, 347.2, 0.4, '#222')}</g>`;
    if (PCT > 0.6 && !winter()) s += '<g class="bfly b1"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="#f2a7b8"/></g>';
    if (PCT > 0.8 && SEASON === 'summer') s += '<g class="bfly b2"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="#fbd85c"/></g>';
    if (PCT > 0.7 && SEASON === 'summer') s += [[46, 204], [56, 205], [70, 204]].map(([x, y]) => `<path d="M${x - 3} ${y - 1} q1.6 -1.6 3 0 q1.4 -1.6 3 0" stroke="#2f2f3a" stroke-width="1" fill="none"/>`).join('');
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

  // evening: darken everything except the lit windows, the signal box and the lamps
  function night(st, decor) {
    const win = st.window && !PEND.window, way = st.floor && !PEND.floor, off = st.shelves && !PEND.shelves, hatch = st.lost && !PEND.lost;
    const box2 = st.box && !PEND.box, lit = st.lamps && !PEND.lamps;
    const rect = (w) => `<rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}"/>`;
    let holes = '';
    if (win) holes += rect(WIN);
    if (way) holes += rect(WAY);
    if (off) holes += rect(OFF);
    if (hatch) holes += rect(LOST);
    if (box2) holes += rect(BOXWIN);
    if (lit) holes += '<path d="M27 300 L25.6 286 H38.4 L37 300Z M269 300 L267.6 286 H280.4 L279 300Z"/>';
    let s = `<mask id="${id('Dark')}"><rect width="400" height="540" fill="#fff"/><g fill="#000">${holes}</g></mask>
      <rect width="400" height="540" fill="#1b2350" opacity="0.55" style="mix-blend-mode:multiply" mask="url(#${id('Dark')})"/>
      <rect width="400" height="540" fill="#24306a" opacity="0.18" mask="url(#${id('Dark')})"/>`;
    for (let i = 0; i < 30; i++) s += `<circle class="star" cx="${(i * 97) % 400}" cy="${8 + ((i * 53) % 140)}" r="${f1(0.6 + (i % 3) * 0.4)}" fill="#fff" style="animation-delay:-${((i * 0.7) % 4).toFixed(1)}s"/>`;
    s += `<mask id="${id('Moon')}"><rect width="400" height="200" fill="#fff"/><circle cx="69" cy="52" r="14" fill="#000"/></mask><circle cx="62" cy="58" r="16" fill="#fff6d8" mask="url(#${id('Moon')})"/><circle cx="62" cy="58" r="30" fill="#fff6d8" opacity="0.08"/>`;
    const glow = (x, y, rx, ry = rx) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${ry}" fill="${url('Glow')}"/>`;
    const warm = (w, op) => `<rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" fill="${url('Glow')}" opacity="${op}"/>`;
    if (win) s += `${warm(WIN, 0.9)}${glow(WIN.x + WIN.w / 2, WIN.y + WIN.h / 2, 40, 30)}`;
    if (way) s += `${warm(WAY, 0.9)}${glow(WAY.x + WAY.w / 2, 336, 22, 5)}${glow(WAY.x + WAY.w / 2, WAY.y + 24, 20, 26)}`;
    if (off) s += `${warm(OFF, 0.8)}${glow(OFF.x + OFF.w / 2, OFF.y + OFF.h / 2, 26, 24)}`;
    if (hatch) s += `${warm(LOST, 0.8)}${glow(LOST.x + LOST.w / 2, LOST.y + LOST.h / 2, 24, 24)}`;
    if (box2) s += `${warm(BOXWIN, 1)}${glow(BOXWIN.x + BOXWIN.w / 2, BOXWIN.y + BOXWIN.h / 2, 30, 18)}`;
    // the platform lamps come on, with a pool of light on the flags under each
    if (lit) for (const x of [32, 274]) s += `<ellipse cx="${x}" cy="293" rx="5.6" ry="7" fill="${url('Glow')}"/>${glow(x, 293, 26)}${glow(x, 376, 30, 6)}`;
    if (decor['h-lights']) s += BULBS.map(([x, y], i) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.8" fill="${BULB_COLS[i % 4]}"/><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="6" ry="6" fill="${url('Glow')}"/>`).join('');
    if (decor['h-tea']) s += `${glow(166, 506, 24, 14)}`;
    if (st.gate && !PEND.gate) s += `<ellipse cx="328.5" cy="352" rx="2" ry="2" fill="${url('Glow')}"/>${glow(328.5, 352, 9)}`;
    return `<g class="night" pointer-events="none">${s}</g>`;
  }

  const SPOTS = {
    platform: [150, 358], floor: [128, 320], window: [85, 295], box: [348, 229], clock: [150, 203], lamps: [32, 293], sign: [150, 236], door: [170, 306],
    gate: [304, 382], bench: [88, 354], baskets: [146, 278], line: [200, 432], lost: [244, 300], parcels: [218, 344], shelves: [206, 294],
  };
  const PARTS = ['platform', 'floor', 'window', 'box', 'clock', 'lamps', 'sign', 'door', 'gate', 'bench', 'baskets', 'line', 'lost', 'parcels', 'shelves'];
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

  // st: map of restored part -> true; cols: chosen paint colours (haltSign,
  // haltDoor, haltGate); opts as for CANAL.render
  function render(st = {}, cols = {}, opts = {}) {
    SEASON = SKY[opts.season] ? opts.season : 'spring'; PEND = opts.pending || {}; UID = opts.uid ? String(opts.uid).replace(/[^\w-]/g, '') : ''; FORSALE = !!opts.forSale;
    PCT = U.clamp(opts.pct || 0, 0, 1); NIGHT = !!opts.night;
    const decor = opts.decor || {};
    palette({ haltSign: cols.haltSign || '#c9474f', haltDoor: cols.haltDoor || '#4e7b5b', haltGate: cols.haltGate || '#f4ecdc' });
    const C = K.C;
    return `<svg viewBox="0 0 ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" class="house halt">
      ${style()}${defs()}${sky()}${far()}${ground()}${lane()}${signalBox(st)}${semaphore()}
      ${house()}${clock(st)}${sign(st, C)}${insides(st)}${floor(st)}${waitingWindow(st)}${doorway()}${door(st, C)}${shelves(st)}${lost(st)}
      ${canopy()}${columns()}${baskets(st)}
      ${platform(st)}${bench(st)}${decorations(decor, true)}${cat(decor)}${parcels(st)}${lamps(st)}${platformFace()}${gate(st, C)}
      ${track(st)}${verge()}${lineFence()}${clutter()}${saleSign()}
      ${decorations(decor, false)}${life(st)}${weather()}${opts.night ? night(st, decor) : ''}${sparkles(opts.fresh)}
    </svg>`;
  }

  return { render, DECOR, PARTS };
})();
