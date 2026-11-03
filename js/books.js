'use strict';
// The bookshop overview, drawn as SVG the same way as the cottage (house.js),
// the café, the cove, the rescue and the glasshouse. An old bookshop on a
// cobbled lane: the shelves, the counter and the shop cat are seen through
// the big shop window under a striped awning, a sign hangs from the corner,
// upstairs a reading room has a nook for tea and two reading tables, the
// stockroom hides behind the round window in the gable, and at the side a
// little courtyard has hollyhocks against the wall and a bench. Each
// restorable part has a tired look and a restored look; the sign and the
// door take the colours chosen while painting. Every id carries a 'b' prefix
// (plus opts.uid when given) so this picture can share a page with the others.

const BOOKS = (() => {
  const VB = { w: 400, h: 540 };
  const FONT = "ui-rounded,'SF Pro Rounded',system-ui,sans-serif";
  const SERIF = "Georgia,'Times New Roman',serif";

  // set at the start of every render: the season, which parts have a
  // seasonal job waiting (part -> 'grow' | 'leaves' | 'snow' | 'frost'), the
  // id suffix, whether the shop is still for sale, how far along it is and
  // the colours worked out from all that
  let SEASON = 'spring', PEND = {}, UID = '', FORSALE = false, PCT = 0, K = {};
  const id = (n) => `b${n}${UID}`;
  const url = (n) => `url(#${id(n)})`;
  const pend = (st, p) => (st[p] ? PEND[p] : undefined);
  const f1 = (v) => (+v).toFixed(1);
  const SNOW = '#f4f8fb';
  const FADE = '#cfc6b6';
  const winter = () => SEASON === 'winter';
  const dot = (x, y, r, col, op = 1) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const oval = (x, y, rx, ry, col, op = 1) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const box = (x, y, w, h, col, op = 1) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
  const shadow = (x, y, rx, ry = 2.4) => oval(x, y, rx, ry, '#00000022');
  const line = (d, col, w = 1, op = 1) => `<path d="${d}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` opacity="${op}"` : ''}/>`;

  const SKY = {
    spring: ['#bfe2ef', '#e9f1e6', '#f6eedd'], summer: ['#9fd6f0', '#e3f3ea', '#fbf1d8'],
    autumn: ['#f0cfae', '#f6e2c6', '#f3e6d2'], winter: ['#c4d2e0', '#e3eaf1', '#f3f6f9'],
  };
  // the cherry tree over the courtyard wall
  const TREE = {
    spring: ['#f7c3d6', '#fbdbe6', '#93c26c'], summer: ['#5f9a4c', '#6aa858', '#4f8a3c'],
    autumn: ['#d9822b', '#c9692f', '#e9b23c'], winter: null,
  };
  const COBBLE = { spring: ['#c2b8a8', '#b3a998'], summer: ['#c9bea9', '#b9ad98'], autumn: ['#b3a898', '#a39886'], winter: ['#d4d9de', '#c4cbd2'] };
  // the books on the shelves, in rainbow order once they are sorted
  const SPINES = ['#c9474f', '#d9614f', '#e9962c', '#f2c230', '#7fae52', '#4e7b5b', '#3f9a9a', '#3d5a86', '#5d7fd8', '#7a5aa8', '#a8448a'];

  // ---------------------------------------------------------------- shapes
  // the shop window, the two windows upstairs and the round one in the gable
  const SHOP = { x0: 56, x1: 208, y0: 306, y1: 404 };
  const UPL = { x0: 64, x1: 156, y0: 200, y1: 258 };
  const UPR = { x0: 180, x1: 272, y0: 200, y1: 258 };
  const ROUND = { x: 168, y: 162, r: 16 };
  const DOORG = { x0: 236, x1: 268, y0: 328, y1: 356 };
  const ROOF_D = 'M34 194 L78 148 H258 L302 194Z';
  const GABLE_D = 'M124 196 L168 128 L212 196Z';

  // little css of our own: steam from the teapot, a sleeping cat, a swinging
  // sign, swaying hollyhocks, a robin, butterflies and the brass till's glint
  function style() {
    return `<style>@media (prefers-reduced-motion: no-preference){
      #scene .bk-steam path{animation:bksteam 3.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      #scene .bk-steam path:nth-child(2){animation-delay:1.7s}
      @keyframes bksteam{0%{opacity:0;transform:translateY(3px) scaleY(.6)}40%{opacity:.8}100%{opacity:0;transform:translateY(-6px) scaleY(1.1)}}
      #scene .bk-breathe{animation:bkbreathe 3.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes bkbreathe{50%{transform:scaleY(1.06)}}
      #scene .bk-tail{animation:bktail 3s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:100% 0%}
      @keyframes bktail{to{transform:rotate(8deg)}}
      #scene .bk-swing{animation:bkswing 5.2s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 0%}
      @keyframes bkswing{from{transform:rotate(-1.6deg)}to{transform:rotate(1.6deg)}}
      #scene .bk-sway{animation:bksway 4.4s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}
      @keyframes bksway{from{transform:rotate(-1.6deg)}to{transform:rotate(2deg)}}
      #scene .bk-hop{animation:bkhop 5.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes bkhop{0%,80%,100%{transform:translateY(0)}86%{transform:translateY(-3px)}92%{transform:translateY(0)}}
      #scene .bk-flit{animation:bkflit 5s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
      @keyframes bkflit{0%{transform:translate(0,0)}35%{transform:translate(6px,-5px)}70%{transform:translate(-4px,-8px)}100%{transform:translate(3px,2px)}}
      #scene .bk-wing{animation:bkwing .32s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
      @keyframes bkwing{to{transform:scaleX(.3)}}
      #scene .bk-glint{animation:bkglint 2.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
      @keyframes bkglint{0%,100%{opacity:.15;transform:scale(.5)}50%{opacity:1;transform:scale(1.1)}}
      #scene .bk-yarn{animation:bkyarn 2.2s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
      @keyframes bkyarn{to{transform:translateX(2px) rotate(40deg)}}
    }</style>`;
  }

  function palette(C) {
    const k = (1 - PCT) * 0.35;
    K = {
      C,
      render: U.mix('#f1d9c9', '#bdb3a6', k * 1.3),
      front: U.mix('#2f4f43', '#7d8079', k * 1.3),
      gold: U.mix('#e2c27a', '#a59e90', k * 1.4),
      stone: U.mix('#e2d6bf', '#b3aa9a', k),
      sash: U.mix('#fbf7ee', '#b8b1a2', k * 1.4),
    };
  }

  function defs() {
    const cb = COBBLE[SEASON], k = (1 - PCT) * 0.35;
    const brick = (base, moss) => `<rect width="24" height="12" fill="${base}"/>
        <rect x="0.8" y="0.9" width="10.6" height="4.6" fill="${U.shade(base, 0.08)}"/><rect x="12.8" y="0.9" width="10.4" height="4.6" fill="${U.shade(base, -0.04)}"/>
        <rect x="6.8" y="6.9" width="10.4" height="4.6" fill="${U.shade(base, 0.03)}"/><rect x="18.8" y="6.9" width="5" height="4.6" fill="${U.shade(base, -0.08)}"/><rect x="0" y="6.9" width="5.2" height="4.6" fill="${U.shade(base, -0.08)}"/>
        <path d="M0 0.4 H24 M0 6.4 H24 M12 0.4 V6.4 M6 6.4 V12 M18 6.4 V12" stroke="${moss ? '#a39a86' : '#ead9c0'}" stroke-width="0.8" opacity="0.75"/>
        ${moss ? '<circle cx="4" cy="6" r="1.6" fill="#6f8a3e" opacity="0.6"/><circle cx="19" cy="11.6" r="1.4" fill="#748f42" opacity="0.5"/>' : ''}`;
    const b = U.mix('#bf6a4c', '#9a8a7c', k * 1.2), ob = U.mix(b, '#8a8476', 0.45);
    const slate = U.mix('#5f6670', '#7d7f80', k);
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
      <linearGradient id="${id('Grime')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a7ab98"/><stop offset="0.7" stop-color="#8f9478"/><stop offset="1" stop-color="#7a7f60"/></linearGradient>
      <linearGradient id="${id('Dusty')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9b19f"/><stop offset="1" stop-color="#d7c39a"/></linearGradient>
      <linearGradient id="${id('Frost')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f9fc"/><stop offset="1" stop-color="#cadbe8"/></linearGradient>
      <linearGradient id="${id('Shade')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.3"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
      <pattern id="${id('Slate')}" width="12" height="8" patternUnits="userSpaceOnUse">
        <rect width="12" height="8" fill="${slate}"/><path d="M0 7.6 H12 M6 0 V7.6" stroke="${U.shade(slate, -0.25)}" stroke-width="0.7"/><rect x="0.6" y="0.6" width="4.4" height="1.2" fill="#fff" opacity="0.1"/>
        ${PCT < 0.5 ? '<circle cx="3" cy="6" r="1.3" fill="#7d8a4a" opacity="0.7"/>' : ''}
      </pattern>
      <pattern id="${id('Brick')}" width="24" height="12" patternUnits="userSpaceOnUse">${brick(b, false)}</pattern>
      <pattern id="${id('BrickOld')}" width="24" height="12" patternUnits="userSpaceOnUse">${brick(ob, true)}</pattern>
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
      <pattern id="${id('Cobble')}" width="24" height="16" patternUnits="userSpaceOnUse">
        <rect width="24" height="16" fill="${U.shade(cb[1], -0.08)}"/>
        <rect x="1" y="1" width="10" height="6.4" rx="3" fill="${cb[0]}"/><rect x="13" y="1" width="10" height="6.4" rx="3" fill="${cb[1]}"/>
        <rect x="-5" y="9" width="10" height="6.4" rx="3" fill="${cb[1]}"/><rect x="7" y="9" width="10" height="6.4" rx="3" fill="${U.shade(cb[0], 0.04)}"/><rect x="19" y="9" width="10" height="6.4" rx="3" fill="${cb[1]}"/>
        <rect x="2.6" y="1.8" width="4.6" height="1.2" rx="0.6" fill="#fff" opacity="0.16"/><rect x="8.6" y="9.8" width="4.6" height="1.2" rx="0.6" fill="#fff" opacity="0.16"/>
      </pattern>
      <pattern id="${id('Paving')}" width="28" height="12" patternUnits="userSpaceOnUse">
        <rect width="28" height="12" fill="${winter() ? '#dfe5ea' : U.mix('#d6cdbb', '#b8b0a2', k)}"/><path d="M0 0.4 H28 M14 0 V12" stroke="#000" stroke-width="0.7" opacity="0.12"/>
      </pattern>
      <pattern id="${id('Flags')}" width="38" height="26" patternUnits="userSpaceOnUse">
        <rect width="38" height="26" fill="#d9cfbc"/>
        <path d="M0 0.5 H38 M0 13 H20 M20 0 V26 M20 9 H38 M9 13 V26 M30 9 V26" stroke="#a89e8a" stroke-width="0.9"/>
        <rect x="2" y="2" width="8" height="2" rx="1" fill="#fff" opacity="0.2"/><rect x="23" y="12" width="6" height="1.6" rx="0.8" fill="#fff" opacity="0.2"/>
      </pattern>
      <pattern id="${id('Paper')}" width="8" height="10" patternUnits="userSpaceOnUse">
        <rect width="8" height="10" fill="#efe0bf"/><rect width="3" height="10" fill="#e6d3a9"/><circle cx="5.6" cy="5" r="0.7" fill="#c98f73" opacity="0.6"/>
      </pattern>
      <pattern id="${id('Panel')}" width="10" height="20" patternUnits="userSpaceOnUse">
        <rect width="10" height="20" fill="#8a5a3c"/><path d="M0.4 0 V20" stroke="#6b4430" stroke-width="0.8"/><rect x="2" y="2" width="6" height="16" rx="1" fill="#946446"/>
      </pattern>
      <clipPath id="${id('Shop')}"><rect x="${SHOP.x0}" y="${SHOP.y0}" width="${SHOP.x1 - SHOP.x0}" height="${SHOP.y1 - SHOP.y0}"/></clipPath>
      <clipPath id="${id('UpL')}"><rect x="${UPL.x0}" y="${UPL.y0}" width="${UPL.x1 - UPL.x0}" height="${UPL.y1 - UPL.y0}"/></clipPath>
      <clipPath id="${id('UpR')}"><rect x="${UPR.x0}" y="${UPR.y0}" width="${UPR.x1 - UPR.x0}" height="${UPR.y1 - UPR.y0}"/></clipPath>
      <clipPath id="${id('Round')}"><circle cx="${ROUND.x}" cy="${ROUND.y}" r="${ROUND.r}"/></clipPath>
    </defs>`;
  }

  // --------------------------------------------------------- sky and town
  function sky() {
    const cl = SEASON === 'autumn' ? '#fbf1e6' : '#ffffff';
    return `<rect width="400" height="300" fill="${url('Sky')}"/>
    <circle cx="350" cy="56" r="46" fill="${url('Sun')}"/><circle cx="350" cy="56" r="17" fill="#fff3c4"/>
    <g class="cloud c1" fill="${cl}" opacity="0.92"><ellipse cx="58" cy="66" rx="25" ry="10"/><ellipse cx="77" cy="59" rx="17" ry="12"/><ellipse cx="95" cy="67" rx="19" ry="8"/></g>
    <g class="cloud c2" fill="${cl}" opacity="0.8"><ellipse cx="236" cy="96" rx="19" ry="7"/><ellipse cx="251" cy="91" rx="13" ry="9"/><ellipse cx="265" cy="97" rx="14" ry="6"/></g>`;
  }
  // the rest of the town behind the courtyard: a church spire, roofs and chimneys
  function far() {
    const hz = winter() ? '#dfe6ec' : SEASON === 'autumn' ? '#e6d2bc' : '#d6dfe2';
    let s = `<path d="M312 214 L318 148 L324 214Z" fill="${U.mix(hz, '#8a8f99', 0.35)}"/><rect x="310" y="208" width="16" height="30" fill="${U.mix(hz, '#8a8f99', 0.25)}"/>`;
    s += `<path d="M296 236 L330 206 L362 236Z" fill="${U.mix('#9a7f72', hz, 0.35)}"/><rect x="298" y="236" width="62" height="40" fill="${U.mix('#d9c3ae', hz, 0.3)}"/>`;
    s += `<rect x="304" y="246" width="9" height="11" fill="#9fb8c4"/><rect x="342" y="246" width="9" height="11" fill="#9fb8c4"/><rect x="342" y="194" width="7" height="18" fill="#a8705a"/>`;
    s += `<path d="M352 244 L382 218 L410 244Z" fill="${U.mix('#7f6a64', hz, 0.3)}"/><rect x="354" y="244" width="54" height="34" fill="${U.mix('#cdb7a0', hz, 0.3)}"/><rect x="384" y="206" width="6" height="16" fill="#9a6a52"/>`;
    if (winter()) s += line('M298 235 L330 207 L361 235 M353 243 L382 219 L409 243', SNOW, 3);
    return s;
  }
  // the house next door, on the left
  function neighbour() {
    const wall = winter() ? '#dccdb6' : '#d9c3a2';
    let s = `<path d="M-6 192 L22 172 H46 V196 H-6Z" fill="#7d6a62"/><rect x="-6" y="190" width="50" height="232" fill="${wall}"/>
      <rect x="-6" y="190" width="50" height="3" fill="#000" opacity="0.1"/>
      <rect x="6" y="212" width="26" height="38" fill="#f3ead7"/><rect x="9" y="215" width="20" height="32" fill="#9fc2d0"/><path d="M19 215 V247 M9 231 H29" stroke="#f3ead7" stroke-width="1.6"/>
      <rect x="4" y="249" width="30" height="3" fill="#e2d6bf"/>
      <rect x="6" y="342" width="26" height="80" fill="#e2d6bf"/><rect x="9" y="346" width="20" height="74" fill="#4e6b5b"/><rect x="11" y="350" width="16" height="30" rx="1" fill="#5d7b6a"/>
      ${dot(25, 386, 1.4, '#d9b45a')}<rect x="38" y="190" width="3" height="232" fill="#6b6b70"/>`;
    if (winter()) s += `<path d="M-6 191 L22 171 H46" stroke="${SNOW}" stroke-width="3.4" fill="none"/><rect x="4" y="247.6" width="30" height="2" rx="1" fill="${SNOW}"/>`;
    return s;
  }
  // a cherry tree in the garden behind, leaning over the courtyard wall
  function tree() {
    let s = line('M366 272 V236 M366 248 l-14 -14 M366 242 l16 -16 M366 236 l-4 -14', '#6b5240', 3.2);
    const T = TREE[SEASON];
    if (!T) return s + line('M352 234 l-6 -6 M382 226 l6 -4 M362 222 l-3 -6', '#6b5240', 1.4) + line('M352 233 l-6 -6 M366 247 l-13 -13 M367 241 l15 -15', SNOW, 1.2);
    const r = U.rng(53);
    for (const [x, y, rr] of [[366, 220, 22], [346, 232, 16], [388, 228, 17], [358, 210, 14], [378, 212, 13]]) s += dot(x, y, rr, T[0]);
    for (let i = 0; i < 26; i++) s += dot(344 + r() * 46, 200 + r() * 40, 2 + r() * 2.6, U.pick(r, T));
    if (SEASON === 'summer') for (const [x, y] of [[350, 236], [372, 230], [384, 240], [360, 222]]) s += dot(x, y, 1.6, '#c9302c') + dot(x + 2.4, y + 0.6, 1.5, '#d9483b');
    return s;
  }

  // -------------------------------------------------------- the courtyard
  function courtWall() {
    const ok = PCT >= 0.5;
    let s = `<rect x="292" y="270" width="112" height="100" fill="${ok ? url('Brick') : url('BrickOld')}"/>`;
    for (let x = 290, i = 0; x < 404; x += 22, i++) s += `<rect x="${x}" y="265" width="21.4" height="7" rx="1.4" fill="${K.stone}"/>`;
    s += '<rect x="292" y="271" width="112" height="2.4" fill="#000" opacity="0.1"/>';
    if (!ok) {
      const r = U.rng(61);
      for (let i = 0; i < 8; i++) {
        const x = 300 + r() * 96, len = 12 + r() * 22;
        s += line(`M${f1(x)} 266 q${f1((r() - 0.5) * 8)} ${f1(len * 0.5)} ${f1((r() - 0.5) * 6)} ${f1(len)}`, '#4f6b34', 1);
        for (let k = 0; k < 4; k++) s += oval(x + (r() - 0.5) * 8, 268 + r() * len, 2.4, 1.6, U.pick(r, ['#3f6b34', '#4f7f3c', '#5d8a44']));
      }
    }
    if (winter()) s += `<path d="M290 266 Q312 260 334 265 Q356 260 378 265 Q392 261 404 264 V268 H290Z" fill="${SNOW}"/>`;
    return s;
  }
  // a little flower: round petals around an eye
  function bloom(x, y, r, col, eye = '#f2c230', n = 5) {
    let s = '';
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 - Math.PI / 2; s += dot(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.5, col); }
    return s + dot(x, y, r * 0.36, eye);
  }
  // nettles, docks and dead stalks, in the colours of the season
  function weed(x, base, h, r) {
    const dead = winter() || SEASON === 'autumn';
    const c = dead ? U.pick(r, ['#8a7a5a', '#9a8a64', '#75684c']) : U.pick(r, ['#5f8a3a', '#7a9a44', '#4d7a32']);
    const k = r();
    if (k < 0.4) return line(`M${f1(x)} ${f1(base)} l-3 ${f1(-h * 0.7)} M${f1(x)} ${f1(base)} l1 ${f1(-h)} M${f1(x)} ${f1(base)} l3.4 ${f1(-h * 0.6)}`, c, 1.2);
    if (k < 0.7) return oval(x - 2.4, base - h * 0.3, 1.8, h * 0.35, c) + oval(x + 2.2, base - h * 0.25, 1.6, h * 0.3, U.shade(c, -0.1)) + line(`M${f1(x)} ${f1(base)} V${f1(base - h)}`, c, 0.9);
    return line(`M${f1(x)} ${f1(base)} q${f1(-h * 0.4)} ${f1(-h)} ${f1(-h * 0.9)} ${f1(-h * 0.5)} M${f1(x)} ${f1(base)} q${f1(h * 0.5)} ${f1(-h * 0.9)} ${f1(h)} ${f1(-h * 0.4)}`, dead ? '#7a5a4a' : '#6a4a3a', 1);
  }
  // one hollyhock: a tall stem with round flowers up it, buds at the top
  const HOLLY = ['#ef8aa6', '#fbf3f5', '#9a2f4a', '#f6e7a1', '#f2a07a', '#c9586e'];
  function hollyhock(x, base, h, col, k) {
    let s = oval(x - 4, base - 3, 4.6, 3, '#4f8a3c') + oval(x + 4, base - 2, 4.2, 2.8, '#5d9644');
    if (SEASON === 'spring') return s + line(`M${f1(x)} ${f1(base)} V${f1(base - h * 0.32)}`, '#5f8a3a', 1.2) + dot(x, base - h * 0.32, 1.4, '#7fae52') + dot(x + 0.6, base - h * 0.26, 1.2, '#7fae52');
    if (winter()) return line(`M${f1(x)} ${f1(base)} V${f1(base - h * 0.4)}`, '#8a7458', 1.4) + oval(x, base - h * 0.4 - 0.8, 1.8, 1, SNOW);
    s += line(`M${f1(x)} ${f1(base)} V${f1(base - h)}`, SEASON === 'autumn' ? '#7a8a44' : '#5f8a3a', 1.3);
    const n = 7;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), y = base - h * (0.3 + 0.7 * t), side = i % 2 ? 1.6 : -1.6;
      if (t > 0.86) { s += dot(x + side * 0.4, y, 1.3, '#7fae52'); continue; }
      if (SEASON === 'autumn' && t < 0.6) { s += dot(x + side, y, 1.8, '#8a6a42') + dot(x + side, y, 0.8, '#6b4a2a'); continue; }
      const rr = 3.4 - t * 1.4;
      s += dot(x + side, y, rr, col) + dot(x + side, y, rr * 0.36, U.shade(col, k ? -0.35 : -0.25));
      if (i % 3 === 0) s += oval(x - side * 1.8, y + 2.4, 2.4, 1.3, '#5d9644');
    }
    return s;
  }
  function bed(st) {
    const p = pend(st, 'bed'), ok = st.bed && p !== 'grow', some = st.bed && p === 'grow';
    const d = 'M294 352 H404 V372 Q350 376 294 370Z';
    let s = `<g data-part="bed"><path d="${d}" fill="${st.bed ? '#6b4a34' : '#9a8466'}"/>`;
    const r = U.rng(71);
    let i = 0;
    for (let x = 300; x < 400; x += 9.6 + r() * 3, i++) {
      const h = 62 + r() * 26, base = 364 + (r() - 0.5) * 3;
      if (ok || (some && i % 2 === 0)) s += `<g class="bk-sway" style="animation-delay:-${f1(i * 0.7)}s">${hollyhock(x, base, h, HOLLY[(i * 5 + 2) % HOLLY.length], i % 2)}</g>`;
      else {
        s += weed(x, base, 10 + r() * 8, r) + weed(x + 4, base + 1, 8 + r() * 6, r);
        if (!st.bed && i % 3 === 0) s += `<g transform="rotate(${i % 2 ? 14 : -18} ${f1(x)} ${f1(base)})">${line(`M${f1(x)} ${f1(base)} V${f1(base - h * 0.6)}`, '#8a7458', 1.2)}${dot(x, base - h * 0.6, 1.6, '#7a6650')}</g>`;
      }
    }
    if (ok && SEASON === 'spring') for (let k = 0; k < 9; k++) s += dot(298 + k * 11.6, 366 + (k % 2) * 2, 1.2, '#7fa7e6') + dot(300 + k * 11.6, 365 + (k % 2) * 2, 1, '#9cbcf0');
    if (p === 'leaves') s += `<path d="${d}" fill="${url('Leaves')}" opacity="0.9"/>`;
    else if (winter() || p === 'snow') s += `<path d="${d}" fill="${url('Snow')}" opacity="0.9"/>`;
    else if (p === 'frost') s += `<path d="${d}" fill="${url('Frost')}" opacity="0.5"/>`;
    s += line('M294 370 Q350 376 404 372', st.bed ? '#d3c8b2' : '#9a917f', 2.4);
    return s + '</g>';
  }
  function yard(st) {
    const p = pend(st, 'yard'), ok = st.yard;
    const d = 'M292 372 Q350 378 404 374 V420 H292Z';
    let s = `<g data-part="yard"><path d="${d}" fill="${url('Flags')}"/>`;
    if (!ok) {
      s += `<path d="${d}" fill="${url('Moss')}" opacity="0.62"/>`;
      const r = U.rng(83);
      for (let i = 0; i < 12; i++) { const x = 296 + r() * 104, y = 380 + r() * 38; s += line(`M${f1(x)} ${f1(y)} l-2 -4 M${f1(x)} ${f1(y)} l0.6 -5 M${f1(x)} ${f1(y)} l2.4 -3.4`, '#5f8a3a', 1); }
      s += `<path d="M300 414 l6 -7 l5 3 l-2 5Z M312 416 l4 -5 l6 2 l-1 4Z" fill="#b5694a"/>`;
    } else if (p === 'grow') {
      for (const [x, y, rx] of [[306, 392, 8], [372, 410, 10], [342, 382, 6], [392, 396, 7]]) s += oval(x, y, rx, rx * 0.4, '#6f8a3e', 0.55);
      for (const [x, y] of [[318, 404], [356, 414], [384, 388]]) s += line(`M${x} ${y} l-2 -4 M${x} ${y} l0.6 -5 M${x} ${y} l2.4 -3.4`, '#5f8a3a', 1);
    }
    if (p === 'leaves') s += `<path d="${d}" fill="${url('Leaves')}"/>`;
    else if (p === 'snow') s += `<path d="${d}" fill="${url('Snow')}" opacity="0.92"/>`;
    else if (p === 'frost') s += `<path d="${d}" fill="${url('Frost')}" opacity="0.55"/>`;
    else if (winter()) s += `<path d="M292 372 Q350 378 404 374 V384 Q350 388 292 382Z" fill="${SNOW}" opacity="0.85"/>`;
    return s + '</g>';
  }
  function bench(st) {
    const p = pend(st, 'bench'), ok = st.bench;
    const wood = ok ? (p === 'grow' ? U.mix('#a77b56', FADE, 0.5) : '#a77b56') : '#8f7a66', dk = U.shade(wood, -0.25);
    let s = `<g data-part="bench">${shadow(355, 416, 32, 2.6)}`;
    if (ok) {
      s += `<rect x="330" y="380" width="50" height="4" rx="1.4" fill="${wood}"/><rect x="330" y="386.4" width="50" height="4" rx="1.4" fill="${wood}"/>
        <rect x="326" y="395" width="58" height="4" rx="1.4" fill="${wood}"/><rect x="326" y="400" width="58" height="3.4" rx="1.4" fill="${dk}"/>
        <path d="M330 378 V416 M380 378 V416" stroke="#3d3d42" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M330 396 q-6 0 -6 -5 q0 -4 4 -4 M380 396 q6 0 6 -5 q0 -4 -4 -4" stroke="#3d3d42" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <path d="M331 381 H379 M327 396 H383" stroke="#fff" stroke-width="0.6" opacity="0.3"/>`;
      if (p === 'leaves') s += oval(338, 394, 3, 1.4, '#d9822b') + oval(356, 393.6, 3.2, 1.5, '#c4462f') + oval(372, 394.4, 2.8, 1.3, '#e9b23c');
      if (p === 'frost') s += `<rect x="326" y="380" width="58" height="23" fill="${url('Frost')}" opacity="0.55"/>`;
      if (winter() || p === 'snow') s += `<rect x="325" y="393" width="60" height="2.6" rx="1.3" fill="${SNOW}"/><rect x="329" y="378.4" width="52" height="2.2" rx="1.1" fill="${SNOW}"/>`;
    } else {
      // collapsed: one end gone, the seat down on the flags, a plank lying loose
      s += `<g transform="rotate(12 380 412)"><rect x="326" y="400" width="58" height="4" rx="1.4" fill="${wood}"/></g><path d="M330 384 V416" stroke="#5a5a5e" stroke-width="2.4" stroke-linecap="round"/>
        <g transform="rotate(-6 344 416)"><rect x="332" y="412" width="40" height="3.4" rx="1.2" fill="${dk}"/></g>
        <path d="M376 414 l10 -3 M384 416 l6 -5" stroke="#5a5a5e" stroke-width="1.8" stroke-linecap="round"/>${oval(352, 405, 4, 1.6, '#6f8a3e', 0.6)}`;
    }
    return s + '</g>';
  }

  // ---------------------------------------------------------- the building
  // the chimney, the slate roof and the gable with its round window
  function roof(st) {
    let s = `<rect x="236" y="120" width="16" height="44" fill="${url('Brick')}"/><rect x="233" y="116" width="22" height="5" rx="1" fill="#8a7a6a"/>
      <rect x="238" y="106" width="6" height="11" fill="#b5694a"/><rect x="246" y="108" width="6" height="9" fill="#a8604a"/>`;
    if (winter()) s += '<rect x="233" y="114" width="22" height="3" rx="1.4" fill="#f4f8fb"/>';
    if (st.tea && PCT > 0.5) s += '<g class="smoke" fill="#ffffff"><circle cx="241" cy="100" r="4" opacity="0.7"/><circle cx="245" cy="90" r="5.6" opacity="0.5"/><circle cx="242" cy="76" r="7" opacity="0.3"/></g>';
    s += `<path d="${ROOF_D}" fill="${url('Slate')}"/><path d="M78 148 H258" stroke="#a8604a" stroke-width="3.4" stroke-linecap="round"/>`;
    if (winter()) s += `<path d="${ROOF_D}" fill="${url('Snow')}" opacity="0.88"/><path d="M76 147 H260" stroke="${SNOW}" stroke-width="3.6" stroke-linecap="round"/>`;
    s += `<rect x="30" y="192" width="276" height="5" rx="1.4" fill="${U.shade(K.front, -0.15)}"/>`;
    // the gable in front, with fretwork bargeboards and a finial
    s += `<path d="${GABLE_D}" fill="${K.render}"/><path d="M124 196 L168 128 L212 196" stroke="${K.front}" stroke-width="4" fill="none" stroke-linejoin="round"/>`;
    for (let t = 0.12; t < 0.95; t += 0.14) for (const side of [-1, 1]) s += dot(168 + side * 44 * t, 128 + 68 * t + 3.2, 1.1, K.front);
    s += `<path d="M168 128 V118" stroke="${K.front}" stroke-width="1.8"/>${dot(168, 116, 2.2, K.gold)}`;
    if (winter()) s += line('M126 193 L168 130 L210 193', SNOW, 2.6);
    return s;
  }
  function attic(st) {
    const p = pend(st, 'attic'), ok = st.attic, { x, y, r } = ROUND;
    let s = `<g data-part="attic"><circle cx="${x}" cy="${y}" r="${r + 3.6}" fill="${K.stone}"/><circle cx="${x}" cy="${y}" r="${r + 3.6}" fill="none" stroke="#000" stroke-width="0.8" opacity="0.15"/>`;
    s += `<g clip-path="${url('Round')}">${box(x - r, y - r, r * 2, r * 2, ok ? '#7a5038' : '#4a4038')}`;
    if (ok) {
      // the stockroom, tidy: boxes stacked square, books in piles, a lamp on
      s += oval(x + 8, y - 10, 12, 8, '#ffd98a', 0.35);
      s += box(x - 15, y + 2, 13, 11, '#c9a06a') + box(x - 13, y - 8, 11, 10, '#d4ad74') + box(x - 1, y + 4, 12, 9, '#b98f5a');
      s += box(x - 11, y - 4, 5, 2, '#f6efe0') + box(x - 12, y + 6, 5, 2, '#f6efe0') + box(x + 3, y + 7, 5, 2, '#f6efe0');
      ['#c9474f', '#3d5a86', '#f2c230', '#4e7b5b', '#a8448a'].forEach((c, i) => { s += box(x + 2, y - 8 + i * 2.4 - 2, 12 - (i % 2) * 2, 2.2, c); });
      s += line(`M${x + 10} ${y - 16} V${y - 12}`, '#3d3d42', 0.6) + `<path d="M${x + 7} ${y - 12} h6 l-1.4 3 h-3.2Z" fill="#e9c35a"/>`;
    } else {
      // dark, full of boxes tipped over and cobwebs
      s += `<g transform="rotate(-14 ${x - 6} ${y + 6})">${box(x - 16, y, 14, 11, '#8a7458')}</g><g transform="rotate(22 ${x + 6} ${y + 4})">${box(x - 2, y - 2, 12, 10, '#7a6650')}</g>`;
      s += box(x - 10, y - 12, 9, 8, '#6b5a48') + line(`M${x + 4} ${y - 10} l8 6 M${x + 4} ${y - 4} l8 -6`, '#5a4a3a', 1.2);
    }
    s += '</g>';
    if (!ok) {
      s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${url('Grime')}" opacity="0.72"/>`;
      s += line(`M${x - r} ${y - r * 0.2} q${r * 0.5} ${r * 0.3} ${r} ${-r * 0.7} M${x - r * 0.7} ${y - r * 0.7} l${r * 0.6} ${r * 0.6} M${x - r} ${y + r * 0.1} l${r * 0.8} ${-r * 0.5}`, '#eef0e8', 0.5, 0.8);
    } else if (p === 'frost') s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${url('Frost')}" opacity="0.88"/>${line(`M${x - 12} ${y + 8} q6 -4 8 -12 M${x + 4} ${y + 12} q4 -8 10 -8`, '#fff', 1.2)}`;
    else if (p === 'grow') s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${url('Dusty')}" opacity="0.55"/>`;
    else s += `<path d="M${x - 11} ${y - 6} A12 12 0 0 1 ${x - 2} ${y - 13}" stroke="#fff" stroke-width="2.4" fill="none" opacity="0.4" stroke-linecap="round"/>`;
    if (p === 'leaves') s += oval(x - 6, y + 8, 3.2, 1.6, '#d9822b') + oval(x + 7, y - 4, 2.8, 1.4, '#c4462f');
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${K.sash}" stroke-width="2.4"/><path d="M${x} ${y - r} V${y + r} M${x - r} ${y} H${x + r}" stroke="${K.sash}" stroke-width="1.4"/>`;
    if (winter() || p === 'snow') s += `<path d="M${x - r - 3} ${y + 6} A${r + 3} ${r + 3} 0 0 0 ${x + r + 3} ${y + 6}" stroke="${SNOW}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    return s + '</g>';
  }
  // the painted render upstairs, the shop front's woodwork and the fascia
  function walls() {
    let s = `<rect x="40" y="190" width="256" height="96" fill="${K.render}"/><rect x="40" y="190" width="256" height="6" fill="#000" opacity="0.08"/>`;
    if (PCT < 0.5) s += line('M58 268 l6 -8 l-2 -6 l5 -8 M276 210 l-4 9 l3 5 M170 270 l3 -6', '#a3988a', 0.8, 0.8) + oval(286, 236, 8, 14, '#b3a796', 0.35);
    s += `<rect x="36" y="280" width="264" height="6" fill="${K.stone}"/><rect x="36" y="285" width="264" height="1.6" fill="#000" opacity="0.12"/>`;
    // the fascia, with the shop's name in gold
    s += `<rect x="36" y="286" width="264" height="17" fill="${K.front}"/><rect x="36" y="286" width="264" height="1.6" fill="#fff" opacity="0.18"/><rect x="40" y="289" width="256" height="11" rx="1" fill="none" stroke="${K.gold}" stroke-width="0.7" opacity="0.7"/>`;
    const name = PCT < 0.45 ? 'HOLLYH  CK BOOKS' : 'HOLLYHOCK BOOKS';
    s += `<text x="168" y="298.4" text-anchor="middle" font-family="${SERIF}" font-size="10.4" font-weight="700" letter-spacing="1.4" fill="${K.gold}"${PCT < 0.45 ? ' opacity="0.7"' : ''}>${name}</text>`;
    // pilasters with their scrolled brackets, and the pier between window and door
    for (const [x, w] of [[40, 12], [284, 12], [212, 10]]) s += box(x, 303, w, 117, K.front) + box(x + 1.6, 303, 1.4, 117, '#fff', 0.12);
    for (const x of [36, 292]) s += `<path d="M${x} 286 h8 v14 q-4 4 -8 0Z" fill="${U.shade(K.front, -0.2)}"/>${dot(x + 4, 297, 1.8, K.gold)}`;
    // the stall riser under the window, in panels
    s += box(52, 408, 160, 12, K.front) + box(58, 410.4, 70, 7.4, U.shade(K.front, 0.12)) + box(134, 410.4, 72, 7.4, U.shade(K.front, 0.12));
    s += `<rect x="48" y="403" width="168" height="5" rx="1" fill="${K.stone}"/>`;
    if (winter()) s += `<rect x="48" y="401.6" width="168" height="2.4" rx="1.2" fill="${SNOW}"/>`;
    // the doorway: a deep recess with a fanlight
    s += box(222, 303, 62, 117, U.shade(K.front, -0.32)) + box(226, 306, 54, 13, '#2f3a3a');
    for (let i = 0; i < 7; i++) {
      const a = Math.PI + ((i + 0.5) / 7) * Math.PI, t = Math.min(-12 / Math.sin(a), 27 / Math.max(0.01, Math.abs(Math.cos(a))));
      s += line(`M253 318 L${f1(253 + Math.cos(a) * t)} ${f1(318 + Math.sin(a) * t)}`, K.sash, 0.8);
    }
    s += `<rect x="226" y="317" width="54" height="2.4" fill="${K.sash}"/><rect x="224" y="305" width="58" height="2" fill="${K.sash}" opacity="0.8"/>`;
    return s;
  }

  // -------------------------------------------------------------- upstairs
  // an armchair, used in the nook (red) and as the second chair (green)
  function armchair(x, col, dusty) {
    const c = dusty ? U.mix(col, '#9a9284', 0.55) : col, dk = U.shade(c, -0.22);
    return `${shadow(x + 15, 254, 17, 1.6)}<rect x="${x + 3}" y="221" width="24" height="26" rx="7" fill="${dk}"/><rect x="${x + 5}" y="224" width="20" height="18" rx="5" fill="${c}"/>
      <rect x="${x}" y="238" width="30" height="12" rx="3" fill="${c}"/><rect x="${x - 2}" y="234" width="7" height="16" rx="3" fill="${dk}"/><rect x="${x + 25}" y="234" width="7" height="16" rx="3" fill="${dk}"/>
      <path d="M${x + 2} 250 v4 M${x + 28} 250 v4" stroke="#4a3426" stroke-width="1.6"/>`;
  }
  // the nook: wallpaper, the old armchair and the tea table
  function nook(st, decor) {
    const p = pend(st, 'tea'), ok = st.tea && !p, dusty = PCT < 0.4;
    let s = `<rect x="${UPL.x0}" y="${UPL.y0}" width="92" height="48" fill="${url('Paper')}"/>`;
    if (PCT < 0.5) s += box(UPL.x0, UPL.y0, 92, 48, '#8a7c66', 0.35) + oval(144, 214, 9, 12, '#a3946e', 0.4);
    s += box(UPL.x0, 246, 92, 12, PCT < 0.5 ? '#6f5e52' : '#8a3f3f') + box(UPL.x0, 246, 92, 1.4, '#000', 0.15);
    s += `<rect x="120" y="207" width="16" height="12" fill="#c9a06a"/><rect x="122" y="209" width="12" height="8" fill="${dusty ? '#9a9a88' : '#9fc2a8'}"/><path d="M122 215 l4 -3 l3 2 l5 -3 V217 H122Z" fill="${dusty ? '#7a7a6a' : '#5f9a6a'}"/>`;
    if (decor['b-lamp']) s += DECOR['b-lamp']();
    s += armchair(68, '#9a3f3f', dusty);
    if (decor['b-cushions']) s += `${oval(77, 237, 5, 4, '#e9b23c')}${oval(87, 237.6, 5, 4, '#3f9a9a')}${dot(77, 237, 1, '#c9902c')}${dot(87, 237.6, 1, '#2f7a7a')}`;
    // the tea table
    s += `<g data-part="tea">${shadow(122, 255, 12, 1.4)}<path d="M122 244 V254 M117 255 H127" stroke="#5a3a2a" stroke-width="1.6"/>`;
    if (st.tea) {
      s += `<path d="M110 241 H134 L136 249 Q122 252 108 249Z" fill="${p ? '#e6dccb' : '#f6efe0'}"/><path d="M110 241 H134" stroke="#c9586e" stroke-width="1"/>`;
      s += oval(118, 237, 6, 4.6, '#5f86b8') + `<path d="M124 236 q4 -1 5 -4" stroke="#5f86b8" stroke-width="1.6" fill="none"/><path d="M112.4 235 q-3 0 -3 2.6 q0 2.6 3 2.4" stroke="#5f86b8" stroke-width="1.2" fill="none"/>`;
      s += oval(118, 232.8, 3.4, 1.2, '#4f76a8') + dot(118, 231.4, 1, '#f6efe0') + box(115, 236.6, 6, 1.2, '#f6efe0', 0.6);
      s += oval(129, 240.4, 3, 0.9, '#f6efe0') + `<path d="M127 238 h4 l-0.6 2.4 h-2.8Z" fill="#f6efe0"/>` + oval(111, 240.6, 2.6, 0.8, '#f6efe0');
      if (ok) s += `<g class="bk-steam" fill="none" stroke="#fff" stroke-width="1" opacity="0.85"><path d="M129 236 q-1.4 -2.4 0 -4.4"/><path d="M130 236 q1.4 -2.6 0 -4.8"/></g>` + oval(129, 238.2, 1.4, 0.5, '#8a5a2a') + dot(113, 239.6, 1, '#c9924f') + dot(110.6, 240, 0.9, '#d9a35a');
    } else {
      s += `<path d="M110 242 H134 L133 247 H111Z" fill="#8a7a66"/>` + oval(117, 238, 5.4, 4, '#7a5a3a') + `<path d="M122 237 q3 -1 4 -3" stroke="#7a5a3a" stroke-width="1.4" fill="none"/>`;
      s += `<g transform="rotate(80 129 240)"><path d="M127 238 h4 l-0.6 2.4 h-2.8Z" fill="#cfc6b6"/></g>` + line('M110 244 l-6 8 M134 244 l6 8 M108 252 q14 -4 28 0', '#d8d2c4', 0.5, 0.8);
    }
    s += '</g>';
    if (decor['b-armchair']) s += `${armchair(134, '#4e7b5b', false)}${decor['b-cushions'] ? oval(149, 237.6, 5, 4, '#ef8aa6') : ''}`;
    return s;
  }
  // a banker's lamp with a green shade
  const deskLamp = (x, y, lit) => `${line(`M${x} ${y} V${y - 6}`, '#c9a03a', 1)}<path d="M${x - 5} ${y - 6} h10 l-2 -3.4 h-6Z" fill="#2f7a4a"/>${lit ? oval(x, y - 5, 4, 1, '#fff6c4', 0.8) : ''}<rect x="${x - 2.4}" y="${y - 0.6}" width="4.8" height="1.4" rx="0.6" fill="#c9a03a"/>`;
  // the reading room: two round tables with lamps and books
  function reading(st, decor) {
    const p = pend(st, 'tables'), ok = st.tables && !p;
    let s = `<rect x="${UPR.x0}" y="${UPR.y0}" width="92" height="30" fill="${PCT < 0.5 ? '#b9b8a4' : '#d9e2cf'}"/><rect x="${UPR.x0}" y="230" width="92" height="16" fill="${url('Panel')}"/>`;
    if (PCT < 0.5) s += box(UPR.x0, 230, 92, 16, '#6f6a5e', 0.35);
    s += box(UPR.x0, 246, 92, 12, PCT < 0.5 ? '#6f5e52' : '#7a5a3c') + box(UPR.x0, 246, 92, 1.4, '#000', 0.15);
    // a map and a clock on the wall
    s += `<rect x="190" y="206" width="22" height="15" fill="#c9a06a"/><rect x="192" y="208" width="18" height="11" fill="#efe3c4"/><path d="M194 216 q4 -6 8 -2 q3 2 6 -3" stroke="#7fae8a" stroke-width="1.6" fill="none"/>`;
    s += `${dot(244, 212, 6, '#8a5a3c')}${dot(244, 212, 4.6, '#f6efe0')}${line('M244 212 V209 M244 212 h2.4', '#3d3d42', 0.7)}`;
    if (decor['b-piano']) s += DECOR['b-piano']();
    s += '<g data-part="tables">';
    for (const [k, x] of [[0, 199], [1, 233]]) {
      s += `${shadow(x, 256, 12, 1.4)}<path d="M${x} 244 V255 M${x - 5} 256 H${x + 5}" stroke="#5a3a2a" stroke-width="1.6"/>`;
      // bentwood chairs: tipped over before
      const cx = x + (k ? 13 : -13);
      if (st.tables) s += `<path d="M${cx} 256 V238 q0 -4 ${k ? 3 : -3} -4" stroke="#6b4430" stroke-width="1.4" fill="none"/><path d="M${cx - 4} 246 H${cx + 4} M${cx - 3} 246 l-1 10 M${cx + 3} 246 l1 10" stroke="#6b4430" stroke-width="1.2"/>`;
      else if (k) s += `<g transform="rotate(84 ${cx} 255)"><path d="M${cx} 256 V240 M${cx - 4} 248 H${cx + 4}" stroke="#6b4430" stroke-width="1.2"/></g>`;
      s += `<ellipse cx="${x}" cy="242.6" rx="12.6" ry="3.2" fill="${st.tables ? '#9a6a46' : '#7a6a58'}"/><ellipse cx="${x}" cy="242" rx="12" ry="2.6" fill="${st.tables ? '#b07d54' : '#8a7a66'}"/>`;
      if (st.tables) {
        s += deskLamp(x - 6, 241.6, ok) + `<path d="M${x - 1} 241.4 l5 -1.6 l5 1.6 l-5 1.2Z" fill="#f6efe0"/><path d="M${x + 4} 239.8 V241.6" stroke="#cfc6b6" stroke-width="0.5"/>`;
        if (!ok) s += `<ellipse cx="${x + 5}" cy="242.2" rx="2.6" ry="0.8" fill="none" stroke="#8a5a2a" stroke-width="0.6"/>` + dot(x - 2, 242.6, 0.5, '#c9a06a') + dot(x + 1, 243, 0.5, '#c9a06a');
      } else {
        s += `<ellipse cx="${x - 4}" cy="242.2" rx="3" ry="0.9" fill="none" stroke="#5a3a24" stroke-width="0.7"/><ellipse cx="${x + 5}" cy="242.6" rx="2.6" ry="0.8" fill="none" stroke="#5a3a24" stroke-width="0.7"/>`;
        s += k ? `<rect x="${x - 6}" y="234" width="11" height="8" fill="#a8875a"/><path d="M${x - 6} 234 l3 -2 h11 l-3 2" fill="#b8956a"/>` : `<g transform="rotate(-70 ${x + 2} 241)">${deskLamp(x + 2, 241, false)}</g>${box(x - 9, 238.6, 9, 3, '#d8d2c4')}`;
      }
    }
    if (!st.tables) s += line('M182 204 l10 8 M182 212 l6 -8 M270 204 l-8 7', '#e8e4da', 0.5, 0.8);
    return s + '</g>';
  }
  // the sash windows upstairs, with their sills and window boxes
  function sash(w) {
    const mx = (w.x0 + w.x1) / 2;
    return `<rect x="${w.x0 - 4}" y="${w.y0 - 6}" width="${w.x1 - w.x0 + 8}" height="6" fill="${K.stone}"/>
      <path d="M${w.x0 + 6} ${w.y1 - 4} L${w.x0 + 30} ${w.y0 + 6} M${w.x0 + 40} ${w.y1 - 4} L${w.x0 + 56} ${w.y0 + 22}" stroke="#fff" stroke-width="5" opacity="0.08"/>
      <rect x="${w.x0}" y="${w.y0}" width="${w.x1 - w.x0}" height="${w.y1 - w.y0}" fill="none" stroke="${K.sash}" stroke-width="3"/>
      <path d="M${w.x0} 228 H${w.x1}" stroke="${K.sash}" stroke-width="2.6"/><path d="M${mx} ${w.y0} V${w.y1}" stroke="${K.sash}" stroke-width="1.4"/>
      <rect x="${w.x0 - 5}" y="${w.y1}" width="${w.x1 - w.x0 + 10}" height="4" rx="1" fill="${K.stone}"/>${winter() ? `<rect x="${w.x0 - 5}" y="${w.y1 - 1.6}" width="${w.x1 - w.x0 + 10}" height="2.2" rx="1.1" fill="${SNOW}"/>` : ''}`;
  }
  function upstairs(st, decor) {
    return `<g clip-path="${url('UpL')}">${nook(st, decor)}</g><g clip-path="${url('UpR')}">${reading(st, decor)}</g>${sash(UPL)}${sash(UPR)}`;
  }
  // window boxes under the two windows upstairs
  const BOX_FLOWERS = {
    spring: [['pansy', '#7a5aa8'], ['tulip', '#e2574c'], ['pansy', '#f2c230'], ['tulip', '#f2c230']],
    summer: [['gera', '#d9483b'], ['gera', '#ef8aa6'], ['gera', '#d9483b'], ['gera', '#ffffff']],
    autumn: [['heather', '#c48ad9'], ['cycla', '#c9306a'], ['heather', '#e07aa6'], ['viola', '#e9962c']],
    winter: [['ever', '#3f6b4a'], ['berry', '#c9302c'], ['ever', '#4f7a54'], ['berry', '#d9483b']],
  };
  function flower(kind, x, y, col) {
    switch (kind) {
      case 'pansy': return oval(x, y + 2, 3.4, 1.6, '#5d9644') + bloom(x, y - 1, 2.6, col, '#f2e27a', 5);
      case 'tulip': return line(`M${x} ${y + 3} V${y - 4}`, '#5f8a3a', 0.9) + `<path d="M${f1(x - 2)} ${f1(y - 4)} q0 3 2 3.2 q2 -0.2 2 -3.2 l-1 1 l-1 -1.6 l-1 1.6Z" fill="${col}"/>`;
      case 'gera': return dot(x, y + 1, 3.4, '#4f8a3c') + [[-1.6, -2], [1.4, -2.6], [0, -4], [2, -1], [-2, -0.6]].map(([dx, dy]) => dot(x + dx, y + dy, 1.2, col)).join('');
      case 'heather': return [-2, 0, 2].map((dx) => line(`M${x + dx} ${y + 3} V${y - 3 - Math.abs(dx)}`, col, 1.6)).join('') + oval(x, y + 2.6, 3.6, 1.4, '#5d8a44');
      case 'cycla': return oval(x, y + 2.4, 3.6, 1.6, '#3f6b4a') + `<path d="M${x - 1} ${y} l-1.4 -4 l1.4 1 M${x + 1.4} ${y} l1 -4.4 l-1.6 1.2" stroke="${col}" stroke-width="1.6" fill="none"/>`;
      case 'viola': return oval(x, y + 2, 3, 1.4, '#5d9644') + bloom(x, y - 0.4, 2.2, col, '#5a3a8a', 5);
      case 'ever': return dot(x, y + 1, 3.6, col) + dot(x - 1.4, y - 1, 2.2, U.shade(col, 0.15)) + (winter() ? oval(x, y - 2.6, 3, 1, SNOW) : '');
      case 'berry': return dot(x, y + 1.4, 3, '#3f6b4a') + dot(x - 1, y - 0.6, 1, col) + dot(x + 1.2, y, 1, col) + dot(x, y - 1.6, 0.9, col);
      default: return '';
    }
  }
  function boxes(st) {
    const p = pend(st, 'boxes'), ok = st.boxes && p !== 'grow', some = st.boxes && p === 'grow';
    let s = '<g data-part="boxes">';
    for (const w of [UPL, UPR]) {
      const x0 = w.x0 - 2, x1 = w.x1 + 2, y = w.y1 + 4;
      s += box(x0, y, x1 - x0, 9, st.boxes ? '#8a5a3c' : '#7a6a5a') + box(x0, y, x1 - x0, 1.6, '#fff', 0.15) + box(x0 + 2, y - 1.6, x1 - x0 - 4, 2, st.boxes ? '#5a3a2a' : '#6a5a48');
      if (!st.boxes) {
        const r = U.rng(w.x0);
        for (let x = x0 + 5; x < x1 - 3; x += 7 + r() * 4) s += line(`M${f1(x)} ${y - 1} l${f1((r() - 0.5) * 5)} -${f1(4 + r() * 4)}`, '#8a7a5a', 0.9);
        s += line(`M${x0 + 30} ${y + 2} l4 6 l-2 4`, '#4a3a2e', 0.8);
      } else {
        const set = BOX_FLOWERS[SEASON];
        let i = 0;
        for (let x = x0 + 5; x < x1 - 3; x += 7.4, i++) {
          const [kind, col] = set[i % set.length];
          s += ok || i % 2 ? flower(kind, x, y - 4, ok ? col : U.mix(col, '#a59e90', 0.6)) : line(`M${f1(x)} ${y - 1} l1 -6`, '#8a7a5a', 0.9);
        }
        if (ok && SEASON === 'summer') for (let x = x0 + 8; x < x1 - 4; x += 14) s += line(`M${x} ${y + 1} q-2 5 1 9`, '#5d9644', 1) + dot(x + 1, y + 10, 1, '#9cbcf0');
        if (winter() || p === 'snow') s += box(x0 - 1, y - 2.6, x1 - x0 + 2, 2.4, SNOW);
        else if (p === 'frost') s += box(x0, y - 9, x1 - x0, 9, url('Frost'), 0.6);
        if (p === 'leaves') s += oval(x0 + 14, y - 1, 3.2, 1.5, '#d9822b') + oval(x0 + 46, y - 1.6, 3, 1.4, '#c4462f') + oval(x1 - 18, y - 1, 3.2, 1.5, '#e9b23c');
      }
    }
    return s + '</g>';
  }

  // --------------------------------------------------- the shop, inside
  // three bays of shelves on the back wall, three rows each
  const BAYS = [[58, 104], [108, 156], [160, 206]];
  const ROWS = [324, 342, 360];
  function shelves(st) {
    // inside, any job waiting means messy again
    const p = pend(st, 'shelves'), ok = st.shelves && !p, some = st.shelves && !!p;
    let s = `<g data-part="shelves">${box(56, 306, 152, 64, st.shelves ? '#5a3a28' : '#463a30')}`;
    const r = U.rng(97);
    BAYS.forEach(([x0, x1], b) => {
      ROWS.forEach((by, row) => {
        const sag = !st.shelves && b === 1 && row === 1;
        let x = x0 + 1;
        while (x < x1 - 3) {
          const w = 2.8 + r() * 2.6, h = 10.5 + r() * 4.4;
          if (x + w > x1 - 1) break;
          if (ok || some) {
            const k = (x - 58) / 150, c = SPINES[Math.min(SPINES.length - 1, Math.floor(k * SPINES.length))];
            const col = U.shade(c, (r() - 0.5) * 0.16);
            s += box(x, by - h, w, h, col) + box(x + 0.5, by - h + 2, w - 1, 0.8, '#fff', 0.35) + box(x + 0.5, by - 3.4, w - 1, 0.8, '#fff', 0.25);
          } else if (!sag && r() < 0.62) {
            const col = U.mix(U.pick(r, SPINES), '#8a8478', 0.42), lean = r() < 0.3 ? (r() < 0.5 ? -14 : 12) : 0;
            s += lean ? `<g transform="rotate(${lean} ${f1(x + w / 2)} ${by})">${box(x, by - h, w, h, col)}</g>` : box(x, by - h, w, h, col);
          } else if (r() < 0.4 && !sag) {
            // a heap lying flat
            for (let k = 0; k < 3; k++) s += box(x - 2, by - 3 * (k + 1), 12 - k * 1.4, 2.8, U.mix(U.pick(r, SPINES), '#8a8478', 0.4));
            x += 9;
          }
          x += w + (ok || some ? 0.25 : 0.9 + r() * 2);
        }
      });
      if (!st.shelves) s += line(`M${x0 + 2} 308 q6 4 12 0 M${x0 + 2} 308 l7 9`, '#e8e4da', 0.5, 0.75);
    });
    // a few out of place again
    if (some) for (const [x, y] of [[66, 337], [124, 319], [176, 355], [190, 337]]) s += box(x, y, 12, 2.6, U.pick(r, SPINES)) + box(x + 1, y - 2.4, 10, 2.4, U.pick(r, SPINES));
    // the boards and the uprights
    for (const by of ROWS) {
      for (const [x0, x1] of BAYS) {
        const sag = !st.shelves && x0 === 108 && by === 342;
        s += sag ? `<path d="M${x0} ${by} L${x1} ${by + 6} V${by + 8.4} L${x0} ${by + 2.4}Z" fill="#6b4a32"/>` : box(x0, by, x1 - x0, 2.4, st.shelves ? '#8a5a3a' : '#6b5a48');
      }
    }
    for (const x of [56, 104, 156, 206]) s += box(x, 306, 2.4, 64, st.shelves ? '#7a4a30' : '#5a4a3c');
    s += box(56, 362, 152, 8, st.shelves ? '#6b4430' : '#54463a');
    return s + '</g>';
  }
  function floorIn(st) {
    const p = pend(st, 'floor'), ok = st.floor && p !== 'grow';
    let s = `<g data-part="floor">${box(56, 370, 152, 22, st.floor ? '#c08a56' : '#9a8d7a')}`;
    for (let i = -7; i <= 7; i++) s += line(`M${f1(132 + i * 9)} 370 L${f1(132 + i * 15)} 392`, st.floor ? '#9a6a3c' : '#7d7266', 0.7, 0.8);
    s += line('M56 378 H208 M56 386 H208', st.floor ? '#a8743c' : '#857a6c', 0.5, 0.5);
    if (st.floor) {
      s += `<rect x="98" y="374" width="64" height="15" rx="2" fill="#b5483f"/><rect x="101" y="376.4" width="58" height="10.2" rx="1.4" fill="none" stroke="#f2d8a6" stroke-width="1"/>`;
      for (let x = 108; x < 156; x += 8) s += `<path d="M${x} 381.5 l3 -2.6 l3 2.6 l-3 2.6Z" fill="#f2d8a6" opacity="0.8"/>`;
      if (ok) s += line('M64 373 L80 390 M176 372 L190 390', '#fff', 1.6, 0.2);
    }
    if (!st.floor) {
      s += box(56, 370, 152, 22, url('Dusty'), 0.55);
      for (const [x, y, k] of [[70, 382, 5], [94, 388, 4], [150, 378, 6], [186, 386, 4.4]]) s += oval(x, y, k, k * 0.55, '#c9c3b6') + oval(x - 1, y - 0.6, k * 0.6, k * 0.3, '#ddd8cc');
      s += `<g transform="rotate(-12 120 380)">${box(114, 377, 9, 6, '#f2ede2')}</g><g transform="rotate(20 168 384)">${box(163, 381, 8, 5, '#e8e2d4')}</g><g transform="rotate(8 134 388)">${box(128, 385.6, 12, 4, '#7a5aa8')}</g>`;
    } else if (p === 'grow') s += box(56, 370, 152, 22, url('Dusty'), 0.32) + oval(84, 384, 4, 2.2, '#c9c3b6') + oval(170, 380, 5, 2.6, '#c9c3b6');
    if (p === 'leaves') s += oval(192, 384, 3, 1.4, '#d9822b') + oval(200, 388, 2.6, 1.3, '#c4462f') + oval(184, 389, 2.8, 1.3, '#e9b23c');
    if (p === 'snow' || p === 'frost') for (const [x, y] of [[198, 388], [186, 384], [172, 389], [160, 385]]) s += oval(x, y, 2.6, 1.3, '#7a6a58', 0.45);
    return s + '</g>';
  }
  function counter(st, decor) {
    const p = pend(st, 'counter'), ok = st.counter && !p;
    const wood = st.counter ? '#7a4a2e' : '#857464', top = st.counter ? '#9a6440' : '#8f8070';
    let s = `<g data-part="counter">${shadow(188, 390, 24, 2)}${box(166, 352, 42, 37, wood)}${box(170, 356, 15, 29, U.shade(wood, 0.1))}${box(189, 356, 15, 29, U.shade(wood, 0.1))}${box(162, 347, 48, 5.6, top)}`;
    const brass = st.counter ? '#d9a93a' : '#8f8f72', bdk = U.shade(brass, -0.25);
    s += `<path d="M182 347 V338 q0 -5 5 -5 h10 q5 0 5 5 V347Z" fill="${brass}"/><rect x="181" y="343" width="22" height="4" fill="${bdk}"/>`;
    for (let i = 0; i < 4; i++) s += dot(186 + i * 4, 338, 1, i % 2 ? '#f6efe0' : U.shade(brass, 0.3)) + dot(186 + i * 4, 340.8, 1, U.shade(brass, 0.3));
    s += `<rect x="188" y="329" width="8" height="5" rx="1" fill="${bdk}"/>`;
    if (st.counter) {
      s += `${oval(206, 346.4, 2.4, 0.8, '#3d3d42')}<path d="M204 346 q2 -4 4 0Z" fill="#d9a93a"/>${dot(206, 342.4, 0.7, '#d9a93a')}`;
      s += `${box(170, 343, 9, 4, '#c9a06a')}${box(171, 341.6, 9, 1.6, '#d4ad74')}`;
      if (ok) s += `<path class="bk-glint" d="M199 334 l1 2.4 l2.4 1 l-2.4 1 l-1 2.4 l-1 -2.4 l-2.4 -1 l2.4 -1Z" fill="#fff8d0"/>${line('M163 348.4 H209', '#fff', 0.8, 0.35)}`;
      else s += `<path d="M162 347 H210 V352.6 H162Z M166 352 H208 V389 H166Z" fill="${FADE}" opacity="0.45"/>`;
    } else {
      s += `<g transform="rotate(-8 172 344)">${box(166, 341, 12, 6, '#efe9dc')}</g><g transform="rotate(6 172 340)">${box(167, 338, 10, 4, '#e2dccf')}</g>`;
      s += line('M208 352 l-8 6 M208 352 l-3 9 M208 358 l-6 2', '#e8e4da', 0.5, 0.8);
    }
    return s + '</g>';
  }
  // the shop cat in its basket, at the front of the window
  function cat(st) {
    const p = pend(st, 'cat'), ok = st.cat && !p;
    let s = `<g data-part="cat">${shadow(77, 404, 19, 1.6)}<path d="M59 396 Q77 390 95 396 V398 H59Z" fill="#8a5a2e"/>`;
    if (st.cat) {
      s += oval(77, 396, 16, 3.4, '#c9474f') + line('M64 395 h26 M70 393 v5 M80 393 v5', '#f6efe0', 0.6, 0.6);
      const fur = '#e09a52', dk = '#c06f2e';
      s += `<g class="bk-breathe">${oval(79, 391, 12.6, 6.4, fur)}${line('M74 386 q2 4 0 8 M80 385.4 q2 4 0 9 M86 386 q2 4 0 7', dk, 1.2)}</g>`;
      s += `<path class="bk-tail" d="M91 393 q6 3 1 6 q-8 3 -20 1" stroke="${fur}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
      s += `${dot(67.6, 391, 5.4, fur)}<path d="M63.6 387.6 l-0.6 -5 l3.6 2.6Z M70 386.4 l1.6 -4.6 l1.6 4.4Z" fill="${fur}"/><path d="M64.2 386.6 l-0.2 -2.6 l1.6 1.4Z" fill="#f2a7b8"/>`;
      s += p ? `${dot(65.6, 390, 0.9, '#3d3d42')}${dot(69.6, 390, 0.9, '#3d3d42')}${line('M71 384 l1 -2 l1 2 l1 -2 M86 385 l1 -2 l1 2 l1 -2 M78 384.6 l1 -2 l1 2', dk, 0.8)}`
        : `${line('M64.4 390.4 q1.2 1 2.4 0 M68.4 390.4 q1.2 1 2.4 0', '#5a3a2a', 0.7)}${dot(67.6, 392.6, 0.7, '#e2785a')}`;
    } else {
      // scruffy and wide awake, sitting up in a frayed basket
      const fur = '#b88a62';
      s += line('M60 396 l-3 -5 M94 396 l3 -6 M88 394 l2 -4', '#8a5a2e', 0.8);
      s += `${oval(77, 389, 7.4, 8.6, fur)}${dot(77, 377.6, 5.6, fur)}<path d="M72.4 374 l-0.6 -5.4 l3.6 3Z M81.6 374 l0.6 -5.4 l-3.6 3Z" fill="${fur}"/>`;
      let tuft = '';
      for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, x = 77 + Math.cos(a) * 8, y = 388 + Math.sin(a) * 9.4; tuft += `M${f1(x)} ${f1(y)} l${f1(Math.cos(a + 0.5) * 3)} ${f1(Math.sin(a + 0.5) * 3)} `; }
      s += `<path d="${tuft}" stroke="${fur}" stroke-width="1.4" fill="none" stroke-linecap="round"/>${line('M71 375 l-2 -2 M83 375 l2 -2 M77 372 l0 -2.4', fur, 1.2)}`;
      s += `${dot(75, 377.4, 1.3, '#e9d24a')}${dot(79.4, 377.4, 1.3, '#e9d24a')}${box(74.7, 376.4, 0.6, 2, '#222')}${box(79.1, 376.4, 0.6, 2, '#222')}${dot(73, 392, 1.1, '#7a5a2a')}${dot(81, 386, 1, '#7a5a2a')}`;
      s += line('M84 395 q6 2 8 -4', fur, 2.6);
    }
    s += `<path d="M58 397 Q77 410 96 397 V398 Q77 406 58 398Z" fill="${st.cat ? '#c9924f' : '#a8876a'}"/><path d="M59 396 Q77 409 95 396" stroke="${st.cat ? '#a8743c' : '#8a6e58'}" stroke-width="1.4" fill="none"/>`;
    s += line('M66 400 l2 3 M72 401.6 l1.4 3 M80 401.6 l-1 3 M88 400 l-2 3', st.cat ? '#a8743c' : '#8a6e58', 0.8);
    return s + '</g>';
  }
  // the display in the front of the window: books stood up on little easels
  function display(st, decor) {
    const ok = st.window;
    let s = `<g data-part="window">${box(56, 396, 152, 8, ok ? '#a8743c' : '#7d6e5e')}${box(56, 396, 152, 1.4, '#fff', 0.15)}`;
    if (ok) {
      [[114, '#3d5a86', '#f2c230'], [130, '#c9474f', '#f6efe0'], [146, '#4e7b5b', '#f2d8a6'], [162, '#e9962c', '#3d3d42']].forEach(([x, c, t], i) => {
        const y = 381 + (i % 2) * 2;
        s += line(`M${x + 1} ${y + 13} l4 -12 M${x + 9} ${y + 13} l-4 -12`, '#6b4a32', 0.8);
        s += `<g transform="rotate(${i % 2 ? 4 : -4} ${x + 5} ${y + 13})">${box(x, y, 10, 13.4, c)}${box(x + 2, y + 2.4, 6, 1.4, t)}${box(x + 2, y + 5, 4, 0.9, t, 0.7)}${dot(x + 5, y + 9.4, 1.8, t, 0.8)}</g>`;
      });
      if (!decor['b-kitten']) s += `${box(98, 391, 12, 2.6, '#a8448a')}${box(99, 388.4, 10, 2.6, '#3f9a9a')}${box(97.6, 385.8, 12, 2.6, '#f2c230')}`;
      s += `<g transform="rotate(-6 186 390)">${box(178, 384, 16, 11, '#f6efe0')}<text x="186" y="392" text-anchor="middle" font-family="${FONT}" font-size="5.6" font-weight="900" fill="#c9474f">NEW</text></g>`;
    } else {
      s += `<g transform="rotate(64 130 395)">${line('M126 395 l4 -12 M134 395 l-4 -12', '#6b5a48', 0.8)}</g>${box(140, 392.4, 15, 3.4, '#cfc6b6')}${box(108, 393, 10, 3, '#b5ad9c')}`;
      s += `<g transform="rotate(8 186 390)">${box(176, 383, 20, 10, '#d9cfb4')}<text x="186" y="390.4" text-anchor="middle" font-family="${FONT}" font-size="4.6" font-weight="900" fill="#9a6a5a">CLOSED</text></g>`;
    }
    return s + '</g>';
  }
  function shopInside(st, decor) {
    let s = `<rect x="${SHOP.x0}" y="${SHOP.y0}" width="152" height="98" fill="${st.shelves ? '#5a3a28' : '#463a30'}"/>`;
    s += shelves(st) + floorIn(st);
    if (decor['b-clock']) s += DECOR['b-clock']();
    if (decor['b-ladder']) s += DECOR['b-ladder']();
    s += counter(st, decor) + display(st, decor) + cat(st);
    if (decor['b-globe']) s += DECOR['b-globe']();
    if (decor['b-kitten']) s += DECOR['b-kitten']();
    // the light of the shop, warmer once it is clean
    s += `<rect x="${SHOP.x0}" y="${SHOP.y0}" width="152" height="40" fill="${url('Shade')}" pointer-events="none"/>`;
    if (decor['b-lights']) s += lightsInside();
    return s;
  }
  // fairy lights across the top of the shop window
  const BULBS = (() => { const out = []; for (let x = 60; x <= 204; x += 8) out.push([x, 327 + Math.sin((x - 60) / 24 * Math.PI) * 3.4]); return out; })();
  const BULB_COLS = ['#ffe08a', '#ffb3c1', '#b3e5ff', '#c8f2b0'];
  function lightsInside() {
    return `<g pointer-events="none">${line(`M58 325 ${BULBS.map(([x, y]) => `L${x} ${f1(y - 1.6)}`).join(' ')} L206 325`, '#3d3d42', 0.5)}${BULBS.map(([x, y], i) => `<circle class="bulb" cx="${x}" cy="${f1(y)}" r="1.7" fill="${BULB_COLS[i % 4]}"/>`).join('')}</g>`;
  }

  // --------------------------------------------------- the shop, outside
  // the glass of the shop window and its frame
  function glass(st) {
    const p = pend(st, 'window'), ok = st.window, { x0, x1, y0, y1 } = SHOP, w = x1 - x0, h = y1 - y0;
    let s = '<g pointer-events="none">';
    if (!ok) {
      s += box(x0, y0, w, h, url('Grime'), 0.55);
      s += `<path d="M66 400 q20 -26 44 -6 M120 396 q24 -30 52 -8" stroke="#dfe3d4" stroke-width="7" fill="none" opacity="0.22" stroke-linecap="round"/>`;
      s += line('M170 312 l-8 14 l6 6 l-10 16', '#eef0e8', 0.8, 0.9) + line('M58 308 q10 6 20 0 M58 308 l14 16 M58 318 l16 -8', '#eef0e8', 0.5, 0.85);
      for (const [x, y] of [[90, 336], [140, 352], [196, 330], [72, 364], [118, 318]]) s += dot(x, y, 1.6, '#6b6a5a', 0.5);
    } else if (p === 'frost') {
      s += box(x0, y0, w, h, url('Frost'), 0.84) + line('M60 400 q8 -14 4 -26 M64 392 l6 -4 M200 400 q-10 -12 -6 -26 M196 388 l-6 -3 M110 402 q4 -10 14 -12', '#fff', 1.3);
    } else if (p === 'grow') s += box(x0, y0, w, h, url('Dusty'), 0.42);
    else s += `<path d="M64 404 L100 306 H116 L80 404Z M150 404 L178 306 H186 L158 404Z" fill="#fff" opacity="0.12"/>`;
    if (p === 'leaves') s += oval(62, 398, 3.4, 1.6, '#d9822b') + oval(70, 401, 3, 1.4, '#c4462f') + oval(200, 399, 3.2, 1.5, '#e9b23c');
    if (p === 'snow') s += `<path d="M56 404 Q60 392 72 396 Q80 400 88 404Z M208 404 Q204 394 194 397 Q186 401 182 404Z" fill="${SNOW}"/>`;
    s += '</g>';
    const fr = ok ? K.front : U.mix(K.front, '#8a877c', 0.4);
    s += `<g data-part="window"><path d="M${x0} ${y0} H${x1} V${y1} H${x0}Z" stroke="${fr}" stroke-width="4" fill="none"/><path d="M106 ${y0} V${y1} M158 ${y0} V${y1}" stroke="${fr}" stroke-width="2.4"/>`;
    if (!ok) s += `<path d="M106 330 l-3 10" stroke="${fr}" stroke-width="1"/>`;
    return s + '</g>';
  }
  function awning(st) {
    const p = pend(st, 'awning'), ok = st.awning;
    const A = ok ? '#2f6f6a' : '#8f948a', B = ok ? '#f3ead7' : '#cdc3b1';
    const N = 10, tx0 = 52, tx1 = 212, bx0 = 46, bx1 = 218, ty = 303;
    const by = (i) => (ok ? 316 : 316 + (i / N) * 6);
    let s = `<g data-part="awning">${line('M50 332 L46 316 M214 332 L218 316', '#3d3d42', 1)}`;
    for (let i = 0; i < N; i++) {
      const t0 = tx0 + ((tx1 - tx0) * i) / N, t1 = tx0 + ((tx1 - tx0) * (i + 1)) / N;
      const b0 = bx0 + ((bx1 - bx0) * i) / N, b1 = bx0 + ((bx1 - bx0) * (i + 1)) / N;
      const col = i % 2 ? B : A, ym = (by(i) + by(i + 1)) / 2;
      s += `<path d="M${f1(t0)} ${ty} L${f1(t1)} ${ty} L${f1(b1)} ${f1(by(i + 1))} L${f1(b0)} ${f1(by(i))}Z" fill="${col}"/>
        <path d="M${f1(b0)} ${f1(by(i))} L${f1(b1)} ${f1(by(i + 1))} Q${f1((b0 + b1) / 2)} ${f1(ym + 10)} ${f1(b0)} ${f1(by(i))}Z" fill="${col}"/>`;
    }
    s += `<path d="M${tx0} ${ty} H${tx1} L${tx1 + 0.6} ${ty + 3.4} H${tx0 - 0.6}Z" fill="#000" opacity="0.14"/>
      <path d="M${bx0} ${f1(by(0))} L${bx1} ${f1(by(N))}" stroke="${ok ? U.shade(A, -0.25) : '#857a6d'}" stroke-width="1"/>`;
    if (!ok) {
      s += `<path d="M150 307 l9 2 l-4 9 l-6 -5Z" fill="#4a4036" opacity="0.75"/><path d="M182 ${f1(by(8) - 1)} l9 1 l-3 13 l-5 -2Z" fill="${B}" stroke="#857a6d" stroke-width="0.6"/>`;
      s += oval(86, 310, 7, 3, '#7a6a52', 0.35) + oval(122, 312, 5, 2.4, '#7a6a52', 0.3);
    }
    if (p === 'grow') s += `<path d="M${tx0} ${ty} H${tx1} L${bx1} ${by(N) + 8} H${bx0}Z" fill="${FADE}" opacity="0.5"/>`;
    if (p === 'leaves') s += `<path d="M${tx0} ${ty} H${tx1} L${bx1} ${by(N)} H${bx0}Z" fill="${url('Leaves')}"/>`;
    if (p === 'snow' || p === 'frost') s += `<path d="M${tx0 - 1} ${ty - 1} H${tx1 + 1} L${bx1 + 1} ${by(N)} Q170 ${by(N) - 5} 130 ${by(N) - 2} T${bx0 - 1} ${by(0)}Z" fill="${SNOW}"/>`;
    else if (winter()) s += `<path d="M${tx0 - 1} ${ty - 1} H${tx1 + 1} L${tx1 + 2} ${ty + 4} Q170 ${ty + 7} 130 ${ty + 4} T${tx0 - 2} ${ty + 4}Z" fill="${SNOW}"/>`;
    return s + '</g>';
  }
  function door(st, C) {
    const p = pend(st, 'door'), ok = st.door;
    const col = ok ? C.bookDoor : U.mix(C.bookDoor, '#a59e90', 0.62), dk = U.shade(col, -0.28);
    const brass = ok ? '#d9a93a' : '#8a8576', { x0, x1, y0, y1 } = DOORG;
    let s = `<g data-part="door">${box(232, 320, 42, 96, col)}${box(232, 320, 42, 1.6, '#fff', 0.2)}`;
    s += box(x0, y0, x1 - x0, y1 - y0, ok ? '#c9a06a' : '#6a5e52');
    // a glimpse of the shop through the glass: shelves and a warm light
    s += box(x0, y0 + 2, x1 - x0, 4, ok ? '#8a5a3c' : '#5a4a3c') + box(x0, y0 + 14, x1 - x0, 2, ok ? '#8a5a3c' : '#5a4a3c');
    for (let x = x0 + 1; x < x1 - 2; x += 3.4) s += box(x, y0 + 6.4, 2.4, 7.4, ok ? SPINES[Math.round(x) % SPINES.length] : '#7a7066');
    if (!ok) s += box(x0, y0, x1 - x0, y1 - y0, url('Grime'), 0.6);
    else if (p === 'frost') s += box(x0, y0, x1 - x0, y1 - y0, url('Frost'), 0.85);
    s += `<path d="M${(x0 + x1) / 2} ${y0} V${y1} M${x0} ${(y0 + y1) / 2} H${x1}" stroke="${dk}" stroke-width="1.2"/><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="none" stroke="${dk}" stroke-width="1.6"/>`;
    // the card on its string: OPEN or CLOSED
    s += line(`M246 ${y0 + 1} L252 ${y0 + 9} L258 ${y0 + 1}`, '#5a4a3a', 0.5);
    s += ok ? `${box(244, y0 + 9, 16, 7, '#f6efe0')}<text x="252" y="${y0 + 14.4}" text-anchor="middle" font-family="${FONT}" font-size="4.8" font-weight="900" fill="#2f7a4a">OPEN</text>`
      : `<g transform="rotate(-10 252 ${y0 + 12})">${box(243, y0 + 9, 18, 7, '#d9cfb4')}<text x="252" y="${y0 + 14.2}" text-anchor="middle" font-family="${FONT}" font-size="4.2" font-weight="900" fill="#a8443f">CLOSED</text></g>`;
    // panels, the letterbox, the knob and a kick plate
    s += `<rect x="237" y="362" width="14" height="40" rx="1" fill="none" stroke="${dk}" stroke-width="1.2"/><rect x="255" y="362" width="14" height="40" rx="1" fill="none" stroke="${dk}" stroke-width="1.2"/>`;
    s += box(245, 380, 16, 3.4, brass) + dot(268, 372, 2.2, brass) + dot(267.4, 371.4, 0.7, '#fff', ok ? 0.8 : 0.2);
    if (ok) s += box(234, 405, 38, 8, '#c9a03a') + box(234, 405, 38, 1.2, '#fff', 0.35);
    else {
      s += oval(240, 344, 3.4, 5, '#d8cfbf', 0.75) + oval(262, 396, 4, 2.6, '#d8cfbf', 0.7) + oval(250, 410, 6, 2, '#d8cfbf', 0.6);
      s += line('M274 320 l-8 7 M274 320 l-3 10 M274 326 l-7 3', '#e8e4da', 0.5, 0.8);
    }
    if (p === 'grow') s += box(232, 320, 42, 96, FADE, 0.5);
    s += `<rect x="226" y="416" width="54" height="6" rx="1.4" fill="${K.stone}"/><rect x="226" y="420" width="54" height="2" fill="#000" opacity="0.08"/>`;
    if (winter() || p === 'snow') s += `<rect x="226" y="414.4" width="54" height="2.6" rx="1.3" fill="${SNOW}"/>`;
    if (p === 'leaves') s += oval(236, 416, 3, 1.4, '#d9822b') + oval(262, 417, 3.4, 1.5, '#c4462f') + oval(250, 415.6, 2.6, 1.2, '#e9b23c');
    return s + '</g>';
  }
  // the sign hanging from the corner of the house, on a curly iron bracket
  function sign(st, C) {
    const p = pend(st, 'sign'), ok = st.sign;
    const col = ok ? C.bookSign : U.mix(C.bookSign, '#a59e90', 0.66);
    let s = `<g data-part="sign"><path d="M296 206 H340 M296 218 Q318 216 330 206" stroke="#3d3d42" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M310 214 q-4 -4 0 -6 q4 1 2 4" stroke="#3d3d42" stroke-width="1.2" fill="none"/>${dot(340, 206, 1.8, '#3d3d42')}`;
    const board = (fade) => {
      let b = `<rect x="302" y="218" width="40" height="30" rx="2.4" fill="${col}"/><rect x="304.6" y="220.6" width="34.8" height="24.8" rx="1.4" fill="none" stroke="${ok ? '#e2c27a' : '#c9c1b0'}" stroke-width="0.8"/>`;
      b += `<path d="M322 230 q-6 -3 -11 -1 v6 q5 -2 11 1Z M322 230 q6 -3 11 -1 v6 q-5 -2 -11 1Z" fill="${ok ? '#f6efe0' : '#d9d2c4'}"/>${line('M322 230 V236', ok ? col : '#a59e90', 0.6)}`;
      b += `<text x="322" y="244" text-anchor="middle" font-family="${SERIF}" font-size="8.4" font-weight="700" letter-spacing="0.8" fill="${ok ? '#f6efe0' : '#d9d2c4'}"${fade ? ' opacity="0.55"' : ''}>${fade ? 'BO  KS' : 'BOOKS'}</text>`;
      return b;
    };
    if (ok) {
      s += `<g class="bk-swing">${line('M308 207 V219 M336 207 V219', '#5a5a5e', 0.8)}${board(false)}`;
      if (p === 'grow') s += `<rect x="302" y="218" width="40" height="30" rx="2.4" fill="${FADE}" opacity="0.5"/>`;
      else if (p === 'frost') s += `<rect x="302" y="218" width="40" height="30" rx="2.4" fill="${url('Frost')}" opacity="0.5"/>`;
      if (winter() || p === 'snow') s += `<rect x="301" y="216.4" width="42" height="3" rx="1.5" fill="${SNOW}"/>`;
      if (p === 'leaves') s += oval(312, 218, 3, 1.4, '#d9822b') + oval(330, 217.6, 2.6, 1.3, '#c4462f');
      s += '</g>';
    } else {
      // hanging by one chain, crooked, the paint gone
      s += `${line('M308 207 V219', '#5a5a5e', 0.8)}<g transform="rotate(16 308 219)">${board(true)}${oval(332, 226, 4, 2.6, '#cfc6b6', 0.8)}${oval(310, 242, 5, 2, '#cfc6b6', 0.7)}${line('M318 220 l3 8 l-2 6', '#6a645a', 0.6)}</g>`;
      if (winter()) s += line('M296 205 H340', SNOW, 1.6);
    }
    return s + '</g>';
  }

  // ------------------------------------------------------------- the lane
  function lane() {
    let s = `<rect x="0" y="420" width="400" height="120" fill="${url('Cobble')}"/>
      <rect x="0" y="420" width="400" height="24" fill="${url('Paving')}"/><rect x="0" y="443" width="400" height="4.6" fill="${K.stone}"/><rect x="0" y="447.6" width="400" height="3" fill="#000" opacity="0.14"/>`;
    // a channel of flat setts along the kerb, and the lane worn smoother down the middle
    s += '<rect x="0" y="450" width="400" height="9" fill="#a39a8a" opacity="0.55"/>';
    for (let x = 0; x < 400; x += 12) s += `<rect x="${x + 0.6}" y="451" width="10.8" height="7" rx="1.4" fill="#d6cdbb" opacity="0.45"/>`;
    s += `<path d="M0 500 Q100 490 200 496 T400 494 V516 Q300 520 200 514 T0 520Z" fill="#fff" opacity="${winter() ? 0 : 0.07}"/>`;
    for (const [x, y, rx] of [[64, 480, 26], [180, 520, 34], [300, 470, 22], [360, 528, 26]]) s += oval(x, y, rx, rx * 0.3, '#000', 0.05);
    if (winter()) {
      s += `<rect x="0" y="420" width="400" height="24" fill="${url('Snow')}" opacity="0.8"/><rect x="0" y="449" width="400" height="91" fill="${url('Snow')}" opacity="0.62"/>`;
      s += `<path d="M0 450 Q60 446 120 452 T240 450 T400 452 V460 Q300 457 200 461 T0 459Z" fill="${SNOW}"/>`;
      s += line('M0 492 Q120 486 220 494 T400 490 M0 506 Q120 500 220 508 T400 504', '#a7b0b9', 3.4, 0.45);
    } else if (SEASON === 'autumn') {
      for (const [x, y, rx] of [[110, 492, 22], [286, 516, 26], [210, 470, 14]]) s += oval(x, y, rx, rx * 0.22, '#b9d2dc', 0.7) + oval(x - rx * 0.3, y - 0.6, rx * 0.4, rx * 0.06, '#fff', 0.5);
      const r = U.rng(113);
      for (let i = 0; i < 16; i++) {
        const x = r() * 400, y = 424 + r() * 112;
        s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="3" ry="1.5" fill="${U.pick(r, ['#d9822b', '#c4462f', '#e9b23c', '#9c5a2a'])}" transform="rotate(${Math.round(r() * 180)} ${f1(x)} ${f1(y)})" opacity="0.9"/>`;
      }
    } else if (SEASON === 'spring') {
      const r = U.rng(117);
      for (let i = 0; i < 14; i++) s += oval(300 + r() * 100 - r() * 140, 426 + r() * 100, 1.8, 1.1, '#f7c3d6', 0.9);
    }
    return s;
  }
  // a street lamp at the left, lit after dark
  function lamppost() {
    let s = `${shadow(24, 444, 8, 1.6)}<rect x="19" y="432" width="10" height="11" rx="1.4" fill="#3d3d42"/><path d="M24 432 V338" stroke="#3d3d42" stroke-width="3"/>
      <path d="M17 344 H31" stroke="#3d3d42" stroke-width="1.6"/><path d="M17 337 L19 321 H29 L31 337Z" fill="#f3ead2" stroke="#3d3d42" stroke-width="1.4"/>
      <path d="M24 321 V337 M18 329 H30" stroke="#3d3d42" stroke-width="0.8"/><path d="M15 322 L24 313 L33 322Z" fill="#3d3d42"/>${dot(24, 311.6, 1.6, '#3d3d42')}`;
    if (winter()) s += `<path d="M15 321 L24 312 L33 321" stroke="${SNOW}" stroke-width="2" fill="none"/>`;
    return s;
  }
  // a little cart of second-hand books outside, once the shop opens again
  function bookCart() {
    if (PCT < 0.5) return '';
    let s = `${shadow(80, 443, 26, 1.8)}<path d="M58 424 V442 M102 424 V442" stroke="#6b4a32" stroke-width="2"/>${dot(80, 437, 5, '#6b4a32')}${dot(80, 437, 2, '#c9a06a')}`;
    s += `<rect x="54" y="410" width="52" height="16" rx="1.4" fill="#9a6a46"/><rect x="54" y="410" width="52" height="2" fill="#fff" opacity="0.2"/>`;
    for (let x = 57, i = 0; x < 102; x += 3.6, i++) s += box(x, 404 + (i % 3), 3, 7 - (i % 3), SPINES[(i * 3) % SPINES.length]);
    s += `<rect x="70" y="414" width="20" height="9" rx="1" fill="#2f3a3a"/><text x="80" y="420.8" text-anchor="middle" font-family="${FONT}" font-size="5.6" font-weight="900" fill="#f6efe0">£1</text>`;
    if (winter()) s += box(54, 403, 52, 2.2, SNOW);
    return s;
  }
  // mess left lying about while the shop is closed up
  function clutter() {
    if (PCT >= 0.5) return '';
    return `<g opacity="${f1(1 - PCT * 1.6)}"><g transform="rotate(-6 80 430)"><rect x="62" y="418" width="30" height="16" fill="#a8875a"/><path d="M62 424 H92 M70 418 V434 M84 418 V434" stroke="#8a6a42" stroke-width="1"/></g>
      <g transform="rotate(14 130 436)">${box(124, 432, 10, 7, '#efe9dc')}</g><g transform="rotate(-20 170 428)">${box(166, 424, 8, 6, '#e2dccf')}</g>
      ${[[200, 470], [116, 500], [300, 486], [60, 512], [250, 524]].map(([x, y]) => line(`M${x} ${y} l-2 -5 M${x} ${y} l0.6 -6 M${x} ${y} l2.6 -4`, '#5f8a3a', 1)).join('')}
      ${oval(350, 448, 9, 6, '#3d3d42')}${oval(350, 444, 6, 2.4, '#5a5a5e')}</g>`;
  }
  function saleSign() {
    if (!(FORSALE || PCT < 0.15)) return '';
    return `<g><rect x="348.5" y="508" width="3" height="26" fill="#8a6142"/><g transform="rotate(4 350 504)">
      <rect x="326" y="494" width="48" height="21" rx="2" fill="#f6efe0" stroke="#7d6e58" stroke-width="1.2"/>
      <text x="350" y="507.6" text-anchor="middle" font-family="${FONT}" font-size="8.4" font-weight="900" fill="#3d5a86">FOR SALE</text>
      ${FORSALE ? '' : `<g transform="rotate(-10 350 512)"><rect x="323" y="508" width="54" height="10" fill="#d9534f"/><text x="350" y="516" text-anchor="middle" font-family="${FONT}" font-size="8" font-weight="900" fill="#fff">SOLD</text></g>`}</g></g>`;
  }

  // ------------------------------------------------------------ decorations
  // Bought in the shed; each one is a small drawing at a fixed spot. The
  // ones inside are drawn with the room they stand in, behind the glass.
  const INSIDE = new Set(['b-lamp', 'b-cushions', 'b-armchair', 'b-piano', 'b-clock', 'b-ladder', 'b-kitten', 'b-globe', 'b-lights']);
  const DECOR = {
    'b-fern': () => {
      let s = `${shadow(291, 421, 10, 1.6)}<path d="M283 406 h16 l-2 14 h-12Z" fill="#c9764a"/><rect x="282" y="404" width="18" height="3.4" rx="1" fill="#d98b63"/>`;
      const leaf = winter() ? '#3f6b4a' : '#4f8a3c';
      for (const [dx, h, bend] of [[-1, 26, -14], [2, 30, 10], [0, 22, -6], [4, 20, 16], [-3, 18, -18]]) {
        const ex = 291 + dx + bend, ey = 404 - h;
        s += line(`M${291 + dx} 404 Q${291 + dx + bend * 0.2} ${ey} ${ex} ${ey + 8}`, leaf, 1.2);
        for (let t = 0.25; t < 1; t += 0.15) { const x = 291 + dx + (ex - 291 - dx) * t * t, y = 404 - h * (1 - (1 - t) * (1 - t)) + 8 * t * t; s += oval(x - 2, y, 2.2, 0.9, leaf) + oval(x + 2, y, 2.2, 0.9, leaf); }
      }
      return `<g>${s}${winter() ? oval(291, 386, 8, 2, SNOW, 0.8) : ''}</g>`;
    },
    'b-lamp': () => `<g>${oval(104, 255, 5, 1.2, '#3d3d42')}${line('M104 255 V214', '#c9a03a', 1.2)}<path d="M97 216 L100 206 H108 L111 216Z" fill="#f2d8a6"/>${line('M97 216 H111', '#c9924f', 1)}${[98, 101, 104, 107, 110].map((x) => line(`M${x} 216 v1.6`, '#c9924f', 0.6)).join('')}</g>`,
    'b-cushions': () => `${oval(77, 237, 5, 4, '#e9b23c')}${oval(87, 237.6, 5, 4, '#3f9a9a')}`,
    'b-globe': () => `<g>${shadow(200, 397, 6, 1)}<path d="M196 397 h8 l-2 -3 h-4Z" fill="#8a5a3c"/>${line('M200 394 V391', '#c9a03a', 1)}${dot(200, 386, 5, '#5f9fd0')}
      <path d="M197 383 q2 -1 3 1 q-1 2 -3 1Z M201 386 q2 0 2.4 2 q-1.6 1.4 -3 0Z M196.6 388 q1 -1 2 0 l-1 1.6Z" fill="#7fae52"/><path d="M194 381 A7 7 0 0 1 206 391" stroke="#c9a03a" stroke-width="0.9" fill="none"/></g>`,
    'b-bike': () => `<g>${shadow(146, 444, 30, 1.8)}<circle cx="126" cy="434" r="9" fill="none" stroke="#3d3d42" stroke-width="1.8"/><circle cx="166" cy="434" r="9" fill="none" stroke="#3d3d42" stroke-width="1.8"/>
      ${dot(126, 434, 1.2, '#9aa3ad')}${dot(166, 434, 1.2, '#9aa3ad')}<path d="M126 434 L140 418 H158 L166 434 M140 418 L146 434 L158 418 M146 434 H136" stroke="#6fb7a8" stroke-width="2" fill="none" stroke-linejoin="round"/>
      <path d="M138 414 h6 M158 418 l2 -6 h5" stroke="#3d3d42" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M161 413 h12 l-2 7 h-9Z" fill="#c9924f"/>
      ${box(163, 409, 2.6, 5, '#c9474f')}${box(166, 408, 2.6, 6, '#3d5a86')}${box(169, 410, 2.4, 4, '#f2c230')}</g>`,
    'b-lights': () => lightsInside(),
    'b-ladder': () => `<g><path d="M58 309.4 H206" stroke="#c9a03a" stroke-width="1.4"/><path d="M66 372 L80 310 M76 372 L90 310" stroke="#a8743c" stroke-width="2"/>
      ${[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((t) => line(`M${f1(66 + 14 * t)} ${f1(372 - 62 * t)} H${f1(76 + 14 * t)}`, '#8a5a3a', 1.4)).join('')}${dot(85, 310, 1.6, '#c9a03a')}</g>`,
    'b-armchair': () => armchair(134, '#4e7b5b', false),
    'b-clock': () => `<g>${shadow(149, 372, 9, 1.4)}<rect x="142" y="322" width="14" height="50" rx="1.4" fill="#6b3f26"/><path d="M141 324 q8 -10 16 0Z" fill="#7a4a2e"/>
      ${dot(149, 331, 5, '#f6efe0')}<circle cx="149" cy="331" r="5" fill="none" stroke="#c9a03a" stroke-width="1"/>${line('M149 331 V328 M149 331 l2 1.4', '#3d3d42', 0.7)}
      <rect x="145" y="342" width="8" height="20" rx="4" fill="#4a2e1c"/>${dot(149, 358, 2.4, '#d9a93a')}${line('M149 344 V356', '#c9a03a', 0.6)}</g>`,
    'b-trolley': () => `<g>${shadow(312, 417, 15, 1.6)}<path d="M300 392 V414 M324 392 V414" stroke="#6b4a32" stroke-width="1.6"/>${dot(301, 415, 1.8, '#3d3d42')}${dot(323, 415, 1.8, '#3d3d42')}
      <rect x="298" y="390" width="28" height="3" rx="1" fill="#a77b56"/><rect x="298" y="404" width="28" height="3" rx="1" fill="#a77b56"/>
      ${line('M312 390 V378', '#c9a03a', 0.9)}${oval(312, 384, 7, 1.2, '#f6efe0')}${oval(312, 378, 5, 1, '#f6efe0')}
      ${dot(308, 382.4, 2, '#f2a7b8')}${dot(313, 382, 2, '#f6e7a1')}${dot(316.6, 382.6, 1.8, '#f2a7b8')}${dot(310.6, 376.6, 1.6, '#c9474f')}${dot(313.6, 376.4, 1.6, '#f6efe0')}
      ${oval(318, 401, 4.4, 3.2, '#5f86b8')}<path d="M322 400 q3 -1 3 -4" stroke="#5f86b8" stroke-width="1.2" fill="none"/>${dot(304, 402, 2, '#f6efe0')}
      ${winter() ? box(297, 388.6, 30, 1.6, SNOW) : ''}</g>`,
    'b-kitten': () => `<g>${oval(103, 394, 5, 4.2, '#9aa3ad')}${dot(99.4, 389, 3.4, '#9aa3ad')}<path d="M96.8 387 l-0.4 -3.4 l2.4 1.8Z M101.6 386.6 l0.6 -3.4 l-2.6 2Z" fill="#9aa3ad"/>
      ${dot(98.4, 388.6, 0.7, '#3d3d42')}${dot(100.8, 388.6, 0.7, '#3d3d42')}${line('M106 396 q4 1 3 -4', '#9aa3ad', 1.6)}${line('M96 392 l-3 3', '#9aa3ad', 1.4)}
      <g class="bk-yarn">${dot(91, 398, 2.6, '#c9474f')}${line('M89 397 q2 -2 4 0 M89.6 399 q2 -1.6 3.6 0.4', '#a8343c', 0.5)}</g>${line('M93 399 q8 4 14 -1', '#c9474f', 0.5)}</g>`,
    'b-piano': () => `<g>${shadow(262, 257, 14, 1.4)}<rect x="250" y="220" width="28" height="36" rx="1.4" fill="#3a2a22"/><rect x="250" y="220" width="28" height="2.4" fill="#5a4034"/>
      <rect x="252" y="236" width="26" height="3.4" fill="#f6efe0"/>${[254, 257, 261, 264, 267, 271, 274].map((x) => box(x, 236, 1.4, 2, '#222')).join('')}
      <rect x="254" y="225" width="12" height="9" fill="#f6efe0"/>${line('M256 228 H264 M256 230.6 H264', '#7a6a5a', 0.5)}${dot(253, 223, 1.2, '#c9a03a')}</g>`,
  };
  function decorations(owned) {
    let s = '';
    for (const k of Object.keys(DECOR)) if (owned[k] && !INSIDE.has(k)) s += DECOR[k]();
    return s;
  }

  function butterfly(x, y, col) {
    return `<g transform="translate(${f1(x)} ${f1(y)})"><g class="bk-flit"><g class="bk-wing"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="${col}"/></g>${line('M0 -2 V2', '#3d3d42', 0.8)}</g></g>`;
  }
  function life(st) {
    let s = '';
    if (PCT > 0.3) s += '<g class="bird"><path d="M150 102 q4 -4 8 0 q4 -4 8 0 M174 114 q3 -3 6 0 q3 -3 6 0" stroke="#4a4a50" stroke-width="1.5" fill="none"/></g>';
    if (PCT > 0.5 && !winter() && st.bed && SEASON !== 'spring') s += `<g pointer-events="none">${[[318, 300], [356, 292], [384, 310]].map(([x, y]) => `<circle class="bee" cx="${x}" cy="${y}" r="1.6" fill="#3d3d42"/>`).join('')}</g>`;
    if (PCT > 0.6 && (SEASON === 'summer' || SEASON === 'spring') && st.bed) s += `<g pointer-events="none">${butterfly(334, 296, '#f2a7b8')}${butterfly(372, 316, '#fbd85c')}</g>`;
    // a pigeon on the pavement, and a robin on the bench in winter
    if (PCT > 0.6 && !winter()) s += `<g class="bk-hop">${oval(200, 438, 4.4, 3, '#8a8f99')}${dot(203.4, 435, 2, '#7a7f8a')}${dot(204, 434.6, 0.5, '#222')}<path d="M205.2 435.2 l1.6 0.4 l-1.6 0.4Z" fill="#c9a06a"/>${oval(201, 437, 2, 1, '#6fa08a', 0.7)}${line('M199 441 v2.4 M201 441 v2.4', '#c9586e', 0.6)}</g>`;
    if (st.bench && (winter() || PCT > 0.85)) s += `<g class="bk-hop">${oval(370, 376, 4, 3.2, '#8a6a52')}${oval(371.4, 377, 2.4, 2.2, '#e2683a')}${dot(372.6, 373.4, 2, '#8a6a52')}${dot(373.2, 373, 0.5, '#222')}<path d="M374.4 373.6 l1.6 0.4 l-1.6 0.4Z" fill="#5a4a3a"/></g>`;
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

  // evening: darken everything except the lit windows and the street lamp
  function night(st, decor) {
    const shop = st.window && !PEND.window, nook = st.tea && !PEND.tea, room = st.tables && !PEND.tables, up = st.attic && !PEND.attic, door = st.door;
    const rect = (w) => `<rect x="${w.x0}" y="${w.y0}" width="${w.x1 - w.x0}" height="${w.y1 - w.y0}"/>`;
    let holes = '<path d="M17 337 L19 321 H29 L31 337Z"/>';
    if (shop) holes += rect(SHOP);
    if (nook) holes += rect(UPL);
    if (room) holes += rect(UPR);
    if (up) holes += `<circle cx="${ROUND.x}" cy="${ROUND.y}" r="${ROUND.r}"/>`;
    if (door) holes += rect(DOORG) + '<rect x="226" y="306" width="54" height="13"/>';
    let s = `<mask id="${id('Dark')}"><rect width="400" height="540" fill="#fff"/><g fill="#000">${holes}</g></mask>
      <rect width="400" height="540" fill="#1b2350" opacity="0.55" style="mix-blend-mode:multiply" mask="url(#${id('Dark')})"/>
      <rect width="400" height="540" fill="#24306a" opacity="0.18" mask="url(#${id('Dark')})"/>`;
    for (let i = 0; i < 30; i++) s += `<circle class="star" cx="${(i * 97) % 400}" cy="${8 + ((i * 53) % 130)}" r="${f1(0.6 + (i % 3) * 0.4)}" fill="#fff" style="animation-delay:-${((i * 0.7) % 4).toFixed(1)}s"/>`;
    s += `<mask id="${id('Moon')}"><rect width="400" height="200" fill="#fff"/><circle cx="345" cy="50" r="14" fill="#000"/></mask><circle cx="338" cy="56" r="16" fill="#fff6d8" mask="url(#${id('Moon')})"/><circle cx="338" cy="56" r="30" fill="#fff6d8" opacity="0.08"/>`;
    const glow = (x, y, rx, ry = rx) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${ry}" fill="${url('Glow')}"/>`;
    s += `<path d="M17 337 L19 321 H29 L31 337Z" fill="#ffe9a8" opacity="0.7"/>${glow(24, 330, 30, 26)}${glow(24, 446, 40, 9)}`;
    if (shop) s += `${box(SHOP.x0, SHOP.y0, 152, 98, '#ffd98a', 0.22)}${glow(132, 360, 100, 60)}${glow(132, 438, 90, 10)}`;
    if (nook) s += `${box(UPL.x0, UPL.y0, 92, 58, '#ffd98a', 0.2)}${glow(110, 230, 56, 34)}`;
    if (room) s += `${box(UPR.x0, UPR.y0, 92, 58, '#ffd98a', 0.18)}${glow(226, 230, 56, 34)}${glow(193, 236, 10, 8)}${glow(227, 236, 10, 8)}`;
    if (up) s += `<circle cx="${ROUND.x}" cy="${ROUND.y}" r="${ROUND.r}" fill="#ffd98a" opacity="0.25"/>${glow(ROUND.x, ROUND.y, 28)}`;
    if (door) s += `${box(DOORG.x0, DOORG.y0, 32, 28, '#ffd98a', 0.25)}${glow(252, 340, 26, 22)}`;
    if (decor['b-lamp']) s += glow(104, 212, 22, 18);
    if (decor['b-lights']) s += BULBS.map(([x, y], i) => `<circle cx="${x}" cy="${f1(y)}" r="1.9" fill="${BULB_COLS[i % 4]}"/><circle cx="${x}" cy="${f1(y)}" r="6" fill="${BULB_COLS[i % 4]}" opacity="0.22"/>`).join('');
    return `<g class="night" pointer-events="none">${s}</g>`;
  }

  const SPOTS = {
    floor: [130, 382], window: [132, 352], awning: [132, 310], shelves: [132, 336], counter: [188, 362], sign: [322, 233], door: [253, 368], boxes: [168, 266],
    cat: [77, 390], tea: [122, 240], tables: [216, 242], attic: [168, 162], yard: [346, 400], bed: [348, 326], bench: [355, 396],
  };
  const PARTS = ['floor', 'window', 'awning', 'shelves', 'counter', 'sign', 'door', 'boxes', 'cat', 'tea', 'tables', 'attic', 'yard', 'bed', 'bench'];
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

  // st: map of restored part -> true; cols: chosen paint colours (bookSign,
  // bookDoor); opts as for GLASSHOUSE.render
  function render(st, cols = {}, opts = {}) {
    SEASON = opts.season || 'spring'; PEND = opts.pending || {}; UID = opts.uid ? String(opts.uid).replace(/[^\w-]/g, '') : ''; FORSALE = !!opts.forSale;
    PCT = U.clamp(opts.pct || 0, 0, 1);
    const decor = opts.decor || {};
    palette({ bookSign: cols.bookSign || '#4e7b5b', bookDoor: cols.bookDoor || '#3d5a86' });
    const C = K.C;
    return `<svg viewBox="0 0 ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" class="house books">
      ${style()}${defs()}${sky()}${far()}${tree()}${courtWall()}${neighbour()}${lane()}
      ${walls()}${roof(st)}${attic(st)}${upstairs(st, decor)}${boxes(st)}
      <g clip-path="${url('Shop')}">${shopInside(st, decor)}</g>${glass(st)}${awning(st)}${door(st, C)}
      ${bed(st)}${yard(st)}${bench(st)}${sign(st, C)}${lamppost()}${bookCart()}${clutter()}${saleSign()}
      ${decorations(decor)}${life(st)}${weather()}${opts.night ? night(st, decor) : ''}${sparkles(opts.fresh)}
    </svg>`;
  }

  return { render, DECOR, PARTS };
})();
