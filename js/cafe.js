'use strict';
// The café overview, drawn as SVG the same way as the cottage (house.js). Each
// restorable part has a tired look and a restored look; the sign, the
// shopfront, the door and the awning take the colours chosen while painting.
// Every id carries a 'c' prefix (plus opts.uid when given) so this picture can
// share a page with the cottage.

const CAFE = (() => {
  const VB = { w: 400, h: 540 };
  const FONT = "ui-rounded,'SF Pro Rounded',system-ui,sans-serif";

  // set at the start of every render: the season, which parts have a
  // seasonal job waiting (part -> 'grow' | 'leaves' | 'snow' | 'frost') and
  // the id suffix
  let SEASON = 'spring', PEND = {}, UID = '', FORSALE = false;
  const id = (n) => `c${n}${UID}`;
  const url = (n) => `url(#${id(n)})`;
  const pend = (st, p) => (st[p] ? PEND[p] : undefined);
  const f1 = (v) => v.toFixed(1);
  const esc = (t) => String(t).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  const SKY = {
    spring: ['#bfe2ef', '#e9f1e6', '#f6eedd'], summer: ['#9fd6f0', '#e3f3ea', '#fbf1d8'],
    autumn: ['#f0cfae', '#f6e2c6', '#f3e6d2'], winter: ['#c4d2e0', '#e3eaf1', '#f3f6f9'],
  };
  const SNOW = '#f4f8fb';
  const VEIL = (d) => `<path d="${d}" fill="#cfc6b6" opacity="0.5"/>`;

  // little css of our own: steam, a breathing dog, a cat's tail, bunting
  function style() {
    return `<style>@media (prefers-reduced-motion: no-preference){
      #scene .cf-steam path{animation:cfsteam 3.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      #scene .cf-steam path:nth-child(2){animation-delay:1.7s}
      @keyframes cfsteam{0%{opacity:0;transform:translateY(3px) scaleY(.6)}40%{opacity:.8}100%{opacity:0;transform:translateY(-6px) scaleY(1.1)}}
      #scene .cf-breathe{animation:cfbreathe 3.2s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes cfbreathe{50%{transform:scaleY(1.07)}}
      #scene .cf-tail{animation:cftail 2.6s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:100% 0%}
      @keyframes cftail{to{transform:rotate(16deg)}}
      #scene .cf-sway{animation:cfsway 3.8s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center top}
      @keyframes cfsway{from{transform:rotate(-4deg)}to{transform:rotate(4deg)}}
    }</style>`;
  }

  function defs() {
    return `
    <defs>
      <linearGradient id="${id('Sky')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${SKY[SEASON][0]}"/><stop offset="0.75" stop-color="${SKY[SEASON][1]}"/><stop offset="1" stop-color="${SKY[SEASON][2]}"/>
      </linearGradient>
      <radialGradient id="${id('Sun')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#fff6cf"/><stop offset="0.45" stop-color="#fde7a3"/><stop offset="1" stop-color="#fde7a3" stop-opacity="0"/>
      </radialGradient>
      <pattern id="${id('Flags')}" width="28" height="20" patternUnits="userSpaceOnUse">
        <rect width="28" height="20" fill="#b4a790"/>
        <rect x="1" y="1" width="15" height="8.5" rx="2" fill="#dbd2c1"/><rect x="17.5" y="1" width="9.5" height="8.5" rx="2" fill="#d0c5b0"/>
        <rect x="1" y="11" width="8" height="8" rx="2" fill="#d5cab6"/><rect x="10.5" y="11" width="16.5" height="8" rx="2" fill="#e2dacb"/>
      </pattern>
      <pattern id="${id('FlagsOld')}" width="28" height="20" patternUnits="userSpaceOnUse">
        <rect width="28" height="20" fill="#6f7a4a"/>
        <rect x="1" y="1" width="15" height="8.5" rx="2" fill="#a29a84"/><rect x="17.5" y="1" width="9.5" height="8.5" rx="2" fill="#968f7a"/>
        <rect x="1" y="11" width="8" height="8" rx="2" fill="#9b947f"/><rect x="10.5" y="11" width="16.5" height="8" rx="2" fill="#a8a08a"/>
        <circle cx="16.6" cy="10" r="2.3" fill="#6f8a3e"/><circle cx="4" cy="10.4" r="1.6" fill="#7d9645"/><circle cx="24" cy="19.5" r="1.8" fill="#6f8a3e"/>
        <path d="M5 3 l3 3 l-1 3" stroke="#6b6352" stroke-width="0.6" fill="none"/>
      </pattern>
      <pattern id="${id('Planks')}" width="44" height="12" patternUnits="userSpaceOnUse">
        <rect width="44" height="12" fill="#c99a62"/>
        <rect y="0" width="44" height="1.2" fill="#dcb07a" opacity="0.7"/><rect y="6.2" width="44" height="1.2" fill="#dcb07a" opacity="0.7"/>
        <rect y="5.3" width="44" height="0.9" fill="#8e6037"/><rect y="11.3" width="44" height="0.9" fill="#8e6037"/>
        <rect x="30" width="0.9" height="5.4" fill="#8e6037"/><rect x="9" y="6" width="0.9" height="5.4" fill="#8e6037"/>
        <path d="M3 2.8 h11 M19 3.6 h8 M14 8.8 h12 M33 9.2 h8" stroke="#b07f4a" stroke-width="0.6"/>
      </pattern>
      <linearGradient id="${id('DeckShade')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3a2614" stop-opacity="0.32"/><stop offset="0.5" stop-color="#3a2614" stop-opacity="0.06"/><stop offset="1" stop-color="#fff" stop-opacity="0.08"/>
      </linearGradient>
      <pattern id="${id('Brick')}" width="16" height="8" patternUnits="userSpaceOnUse">
        <rect width="16" height="8" fill="#e4d8c3"/>
        <rect x="0.6" y="0.5" width="14.8" height="3.1" rx="0.6" fill="#b9573d"/>
        <rect x="-7.4" y="4.4" width="14.8" height="3.1" rx="0.6" fill="#a94e37"/><rect x="8.6" y="4.4" width="14.8" height="3.1" rx="0.6" fill="#c4643f"/>
      </pattern>
      <pattern id="${id('BrickOld')}" width="16" height="8" patternUnits="userSpaceOnUse">
        <rect width="16" height="8" fill="#a99c86"/>
        <rect x="0.6" y="0.5" width="14.8" height="3.1" rx="0.6" fill="#86594a"/>
        <rect x="-7.4" y="4.4" width="14.8" height="3.1" rx="0.6" fill="#7a5244"/><rect x="8.6" y="4.4" width="14.8" height="3.1" rx="0.6" fill="#906252"/>
      </pattern>
      <pattern id="${id('WallTiles')}" width="9" height="9" patternUnits="userSpaceOnUse">
        <rect width="9" height="9" fill="#f6f2e8"/><path d="M4.5 1.2 L7.8 4.5 L4.5 7.8 L1.2 4.5Z" fill="#5f88b9"/><circle cx="4.5" cy="4.5" r="1.1" fill="#f6f2e8"/>
        <path d="M0 0.25 H9 M0.25 0 V9" stroke="#d3cec2" stroke-width="0.5"/>
      </pattern>
      <pattern id="${id('Checker')}" width="10" height="6" patternUnits="userSpaceOnUse">
        <rect width="10" height="6" fill="#efe5cf"/><rect width="5" height="3" fill="#2e6a5a"/><rect x="5" y="3" width="5" height="3" fill="#2e6a5a"/>
      </pattern>
      <pattern id="${id('Boards')}" width="30" height="5" patternUnits="userSpaceOnUse">
        <rect width="30" height="5" fill="#8d7457"/><rect y="4.4" width="30" height="0.6" fill="#6b563f"/><rect x="19" width="0.6" height="4.4" fill="#6b563f"/>
      </pattern>
      <pattern id="${id('Slate')}" width="12" height="8" patternUnits="userSpaceOnUse">
        <rect width="12" height="8" fill="#6d7a89"/><path d="M0 7.6 H12" stroke="#4d5866" stroke-width="0.9"/><path d="M6 0 V7.6" stroke="#56626f" stroke-width="0.7"/>
        <rect x="1" y="1" width="4" height="1.6" rx="0.8" fill="#8594a3"/>
      </pattern>
      <pattern id="${id('Moss')}" width="16" height="16" patternUnits="userSpaceOnUse">
        <circle cx="4" cy="5" r="3" fill="#6f8a3e"/><circle cx="12" cy="11" r="3.5" fill="#748f42"/><circle cx="11" cy="3" r="1.5" fill="#a5a86c"/>
      </pattern>
      <pattern id="${id('Stain')}" width="60" height="50" patternUnits="userSpaceOnUse">
        <ellipse cx="14" cy="18" rx="12" ry="8" fill="#000" opacity="0.08"/><ellipse cx="44" cy="38" rx="10" ry="12" fill="#000" opacity="0.07"/>
        <path d="M34 4 l3 6 l-2 5 l3 7" stroke="#6b5f4d" stroke-width="0.7" fill="none" opacity="0.6"/>
      </pattern>
      <pattern id="${id('Plaster')}" width="30" height="30" patternUnits="userSpaceOnUse">
        <circle cx="5" cy="7" r="1" fill="#fff" opacity="0.2"/><circle cx="20" cy="22" r="1.2" fill="#000" opacity="0.05"/><circle cx="24" cy="6" r="0.8" fill="#000" opacity="0.06"/>
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
      <linearGradient id="${id('Room')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffe4a8"/><stop offset="1" stop-color="#f0a95f"/>
      </linearGradient>
      <linearGradient id="${id('Grime')}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#7f7a69"/><stop offset="1" stop-color="#5f5a4e"/>
      </linearGradient>
      <linearGradient id="${id('Frost')}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f4f9fc"/><stop offset="1" stop-color="#cadbe8"/>
      </linearGradient>
      <linearGradient id="${id('Dusty')}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#b9b19f"/><stop offset="1" stop-color="#d7c39a"/>
      </linearGradient>
      <linearGradient id="${id('Copper')}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#9c5a32"/><stop offset="0.4" stop-color="#eaa96b"/><stop offset="1" stop-color="#93532e"/>
      </linearGradient>
      <linearGradient id="${id('Shade')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2a2018" stop-opacity="0.45"/><stop offset="1" stop-color="#2a2018" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="${id('Glow')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#ffe2a0" stop-opacity="0.6"/><stop offset="0.45" stop-color="#ffd98a" stop-opacity="0.22"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/>
      </radialGradient>
      <clipPath id="${id('Glass')}"><rect x="90" y="279" width="134" height="97"/></clipPath>
    </defs>`;
  }

  // -------------------------------------------------------------- pieces
  function sky() {
    return `
    <rect width="400" height="330" fill="${url('Sky')}"/>
    <circle cx="336" cy="56" r="46" fill="${url('Sun')}"/>
    <circle cx="336" cy="56" r="17" fill="#fff3c4"/>
    <g class="cloud c1" fill="#ffffff" opacity="0.92">
      <ellipse cx="56" cy="70" rx="24" ry="10"/><ellipse cx="74" cy="63" rx="17" ry="12"/><ellipse cx="92" cy="71" rx="18" ry="8"/>
    </g>
    <g class="cloud c2" fill="#ffffff" opacity="0.8">
      <ellipse cx="214" cy="40" rx="19" ry="7"/><ellipse cx="229" cy="35" rx="13" ry="9"/><ellipse cx="243" cy="41" rx="14" ry="6"/>
    </g>`;
  }

  // the neighbours: a stepped gable on the left, a terracotta house right
  function neighbours() {
    const steps = 'M-6 392 V168 H4 V156 H14 V144 H24 V132 H36 V144 H46 V156 H56 V168 H66 V392 Z';
    let s = `<path d="${steps}" fill="#a9b6bf"/><path d="${steps}" fill="${url('Plaster')}"/>
      <path d="M-6 168 H4 V156 H14 V144 H24 V132 H36 V144 H46 V156 H56 V168 H66" stroke="#8796a1" stroke-width="2" fill="none"/>`;
    for (const y of [186, 244, 302]) for (const x of [6, 38]) s += `<rect x="${x - 2}" y="${y - 2}" width="20" height="28" fill="#eef1f2"/><rect x="${x}" y="${y}" width="16" height="24" fill="#8fa8b8"/><path d="M${x + 8} ${y} V${y + 24} M${x} ${y + 11} H${x + 16}" stroke="#eef1f2" stroke-width="1.5"/>`;
    if (SEASON === 'winter') s += `<path d="M-6 168 H4 V165 H-6Z M4 156 H14 V153 H4Z M14 144 H24 V141 H14Z M24 132 H36 V128.5 H24Z M36 144 H46 V141 H36Z M46 156 H56 V153 H46Z M56 168 H66 V165 H56Z" fill="${SNOW}"/>`;
    // right
    s += `<rect x="332" y="204" width="76" height="188" fill="#e2b493"/><rect x="332" y="204" width="76" height="188" fill="${url('Plaster')}"/>
      <path d="M326 206 L344 176 H410 V206 Z" fill="#b4573d"/><path d="M344 176 H410" stroke="#8e4430" stroke-width="3"/>
      <path d="M332 186 H410 M330 196 H410" stroke="#9e4a34" stroke-width="0.8" opacity="0.7"/>`;
    for (const y of [222, 282]) for (const x of [348, 380]) s += `<rect x="${x - 2}" y="${y - 2}" width="20" height="28" fill="#f6ead9"/><rect x="${x}" y="${y}" width="16" height="24" fill="#9db6c2"/><path d="M${x + 8} ${y} V${y + 24} M${x} ${y + 11} H${x + 16}" stroke="#f6ead9" stroke-width="1.5"/>`;
    s += `<rect x="348" y="336" width="20" height="56" fill="#6f8f7c"/><circle cx="364" cy="366" r="1.4" fill="#e9c35a"/>`;
    if (SEASON === 'winter') s += `<path d="M324 207 L343 174 H410 V181 H346 L330 208 Z" fill="${SNOW}"/>`;
    return s;
  }

  function streetLamp() {
    let s = `<rect x="32.5" y="290" width="3" height="110" fill="#3d3d42"/><rect x="29" y="396" width="10" height="5" rx="1.5" fill="#3d3d42"/>
      <path d="M28 290 h12 l-2 -14 h-8 z" fill="#3d3d42"/><path d="M30.5 288 h7 l-1.4 -10 h-4.2 z" fill="#f4e7c2"/>
      <path d="M27 276 h14 l-7 -7 z" fill="#3d3d42"/>`;
    if (SEASON === 'winter') s += `<path d="M26.5 276.5 Q34 268 41.5 276.5 Z" fill="${SNOW}"/>`;
    return s;
  }

  function streetTree() {
    const x = 374;
    let s = `<ellipse cx="${x}" cy="484" rx="15" ry="4" fill="#5e5448"/><path d="M${x - 4} 484 Q${x - 2} 420 ${x - 6} 360 H${x + 6} Q${x + 2} 420 ${x + 4} 484 Z" fill="#6b4a32"/>`;
    if (SEASON === 'winter') {
      return s + `<g stroke="#6b4a32" stroke-linecap="round" fill="none"><path d="M${x} 362 Q${x - 18} 336 ${x - 34} 318 M${x} 362 Q${x + 12} 334 ${x + 30} 312 M${x} 362 Q${x - 2} 330 ${x + 2} 296 M${x - 16} 340 Q${x - 28} 340 ${x - 38} 344" stroke-width="3.5"/></g>
        <g fill="${SNOW}"><ellipse cx="${x - 30}" cy="321" rx="7" ry="2.2"/><ellipse cx="${x + 26}" cy="315" rx="7" ry="2.2"/><ellipse cx="${x + 1}" cy="298" rx="5" ry="2"/></g>`;
    }
    const pal = { spring: ['#7aa866', '#f4c2cf', '#efa9bd'], summer: ['#5f9a4c', '#6aa858', '#4f8a3c'], autumn: ['#d9822b', '#c4462f', '#e9a13c'] }[SEASON];
    s += `<circle cx="${x}" cy="330" r="36" fill="${pal[0]}"/><circle cx="${x - 26}" cy="344" r="22" fill="${pal[1]}"/><circle cx="${x + 22}" cy="346" r="22" fill="${U.shade(pal[0], -0.1)}"/>
      <circle cx="${x - 8}" cy="306" r="20" fill="${pal[2]}"/><circle cx="${x + 14}" cy="318" r="14" fill="${U.shade(pal[1], 0.12)}"/>`;
    if (SEASON === 'spring') for (let i = 0; i < 16; i++) s += `<circle cx="${f1(x + Math.cos(i * 2.39) * (8 + (i % 4) * 7))}" cy="${f1(330 + Math.sin(i * 2.39) * (6 + (i % 3) * 8))}" r="2" fill="#fbe1e8"/>`;
    return s;
  }

  // the paving all along the front: the terrace job
  function terrace(st) {
    const p = pend(st, 'terrace');
    const area = 'M0 392 H400 V530 H0Z';
    let s = `<g data-part="terrace"><path d="${area}" fill="${st.terrace ? url('Flags') : url('FlagsOld')}"/>`;
    if (!st.terrace) {
      const r = U.rng(61);
      for (let i = 0; i < 26; i++) s += tuft(16 + r() * 368, 400 + r() * 128, U.pick(r, ['#5f8a3a', '#7a9a44', '#4d7a32']));
      s += `<path d="M120 500 l8 6 l-3 7 l9 6 M280 486 l-6 8 l4 6" stroke="#5d5545" stroke-width="0.9" fill="none"/>`;
    } else if (p === 'snow' || p === 'frost') s += `<path d="${area}" fill="${url('Snow')}"/>`;
    else if (p === 'leaves') s += `<path d="${area}" fill="${url('Leaves')}"/><path d="${area}" fill="${url('Leaves')}" transform="translate(13 9)"/>`;
    else if (p === 'grow') {
      const r = U.rng(62);
      s += `<path d="${area}" fill="${url('Moss')}" opacity="0.45"/>`;
      for (let i = 0; i < 14; i++) s += tuft(16 + r() * 368, 400 + r() * 128, '#5f8a3a');
    } else if (SEASON === 'autumn') s += `<path d="${area}" fill="${url('Leaves')}" opacity="0.3"/>`;
    if (SEASON === 'winter' && p !== 'snow' && p !== 'frost') s += `<path d="M0 392 H400 V401 Q300 407 200 399 T0 403Z M0 530 V516 Q60 508 130 517 T260 513 T400 519 V530Z" fill="${SNOW}"/>`;
    return s + '</g>';
  }
  function tuft(x, y, col) {
    return `<path d="M${f1(x)} ${f1(y)} l-3 -6 M${f1(x)} ${f1(y)} l0.5 -8 M${f1(x)} ${f1(y)} l3.5 -5.5" stroke="${col}" stroke-width="1.4" stroke-linecap="round"/>`;
  }
  function kerb() {
    return `<rect x="0" y="528" width="400" height="6" fill="#a39a8b"/><path d="M0 528.6 H400" stroke="#c4bcae" stroke-width="1.2"/>
      <path d="M40 528 v6 M110 528 v6 M180 528 v6 M250 528 v6 M320 528 v6 M390 528 v6" stroke="#8a8274" stroke-width="0.8"/>
      <rect x="0" y="534" width="400" height="6" fill="${SEASON === 'winter' ? '#dfe6ec' : '#77736c'}"/>`;
  }

  // ------------------------------------------------------------- the café
  function chimney(st) {
    const smoke = st.counter
      ? `<g class="smoke" fill="#ffffff"><circle cx="272" cy="62" r="5" opacity="0.7"/><circle cx="276" cy="50" r="7" opacity="0.5"/><circle cx="272" cy="36" r="9" opacity="0.3"/></g>` : '';
    return `${smoke}<rect x="262" y="72" width="20" height="50" fill="#a9705a"/><rect x="258" y="68" width="28" height="7" rx="2" fill="#8a5643"/>
      <path d="M262 84 H282 M262 96 H282 M262 108 H282" stroke="#94604c" stroke-width="1"/>
      ${SEASON === 'winter' ? `<path d="M257 69 Q272 61 287 69 Z" fill="${SNOW}"/>` : ''}`;
  }

  function roof(pct) {
    const d = 'M60 152 L98 98 H302 L340 152 Z';
    let s = `<path d="${d}" fill="${url('Slate')}"/>`;
    if (pct < 1) s += `<path d="${d}" fill="${url('Moss')}" opacity="${f1(0.9 * (1 - pct))}"/>`;
    if (SEASON === 'winter') s += `<path d="M58 152 L97 96 H303 L342 152 Q334 145 326 150 Q318 135 306 141 Q296 120 282 126 Q262 112 240 120 Q220 108 200 118 Q180 108 160 120 Q138 112 118 126 Q104 120 94 141 Q82 135 74 150 Z" fill="${SNOW}"/>`;
    s += `<path d="M98 98 H302" stroke="#46505c" stroke-width="4" stroke-linecap="round"/>
      <path d="M60 152 L98 98 M340 152 L302 98" stroke="#55606c" stroke-width="2.5" stroke-linecap="round"/>`;
    // a little dormer
    const lit = pct >= 0.75;
    s += `<path d="M180 124 L200 106 L220 124 Z" fill="#5a6573"/><rect x="185" y="122" width="30" height="26" fill="${lit ? '#efe3c8' : '#b6ab95'}"/>
      <rect x="190" y="127" width="20" height="17" fill="${lit ? url('Room') : url('Grime')}"/><path d="M200 127 V144 M190 135.5 H210" stroke="${lit ? '#fbf7ee' : '#a59e90'}" stroke-width="1.6"/>
      ${SEASON === 'winter' ? `<path d="M178 125 L200 104 L222 125 L216 125 L200 110 L184 125 Z" fill="${SNOW}"/>` : ''}`;
    return s;
  }

  function upperFloor(st, pct) {
    const wallCol = U.mix('#c2b59b', '#f2e1c0', pct);
    let s = `<rect x="62" y="150" width="276" height="9" fill="${U.mix('#a99e88', '#e8d9ba', pct)}"/>`;
    for (let x = 66; x < 334; x += 8) s += `<rect x="${x}" y="159" width="4" height="3" fill="${U.mix('#958a75', '#d6c6a4', pct)}"/>`;
    s += `<rect x="72" y="162" width="256" height="78" fill="${wallCol}"/>
      <rect x="72" y="162" width="256" height="78" fill="${url('Stain')}" opacity="${f1(1 - pct)}"/>
      <rect x="72" y="162" width="256" height="78" fill="${url('Plaster')}" opacity="${f1(pct)}"/>
      <rect x="72" y="159" width="256" height="5" fill="#000" opacity="0.1"/>`;
    // the flat upstairs comes back to life as the café does
    s += upWindow(106, 170, 44, 44, pct < 0.6 ? 'grimy' : 'clean', '#9cc5a1', false);
    s += upWindow(250, 170, 44, 44, pct < 0.3 ? 'boarded' : pct < 0.6 ? 'grimy' : 'clean', '#e9a0a6', true);
    if (pct < 0.15) {
      // the board that was up when the café was bought
      s += `<g transform="rotate(-3 200 190)"><rect x="168" y="176" width="64" height="28" rx="2" fill="#f6efe0" stroke="#7d6e58" stroke-width="1.2"/>
        <text x="200" y="189" text-anchor="middle" font-family="${FONT}" font-size="8.5" font-weight="900" fill="#3d5a86">FOR SALE</text>
        ${FORSALE ? '' : `<g transform="rotate(-10 200 196)"><rect x="166" y="191" width="68" height="10" fill="#d9534f"/><text x="200" y="199" text-anchor="middle" font-family="${FONT}" font-size="8" font-weight="900" fill="#fff">SOLD</text></g>`}</g>`;
    } else {
      s += `<path d="M200 182 V186 q0 4 6 4" stroke="#3d3d42" stroke-width="1.6" fill="none"/><rect x="202" y="189" width="9" height="12" rx="2" fill="#3d3d42"/>
        <rect x="204" y="191" width="5" height="8" fill="${pct >= 0.5 ? '#ffe08a' : '#cfc8b4'}"/><path d="M201 189 h11 l-5.5 -4z" fill="#3d3d42"/>`;
    }
    return s;
  }
  function upWindow(x, y, w, h, look, curtain, sill) {
    const clean = look === 'clean';
    const frame = clean ? '#fbf7ee' : '#b8b1a2';
    let s = `<rect x="${x - 3}" y="${y - 3}" width="${w + 6}" height="${h + 6}" rx="2" fill="${frame}"/>`;
    if (clean) {
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#b9d0d9"/>
        <path d="M${x + 2} ${y + 2} h${w * 0.24} q-2 ${h * 0.5} 2 ${h - 4} h-${w * 0.24 + 2}Z" fill="${curtain}"/>
        <path d="M${x + w - 2} ${y + 2} h-${w * 0.24} q2 ${h * 0.5} -2 ${h - 4} h${w * 0.24 + 2}Z" fill="${curtain}"/>
        <path d="M${x + w * 0.3} ${y + h - 3} l${w * 0.4} -${h * 0.8}" stroke="#fff" stroke-width="${w * 0.08}" opacity="0.3"/>
        <rect x="${x + w * 0.42}" y="${y + h - 9}" width="${w * 0.16}" height="7" rx="1.5" fill="#c8763f"/><circle cx="${x + w * 0.5}" cy="${y + h - 11}" r="4" fill="#5f9e55"/>`;
    } else {
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${url('Grime')}"/>
        <path d="M${x + 4} ${y + 8} q${w * 0.3} 6 ${w * 0.6} -2" stroke="#4e4a40" stroke-width="3" opacity="0.4" fill="none"/>
        <path d="M${x + w - 3} ${y + 3} l-8 0 l8 8 Z" fill="#ffffff" opacity="0.35"/>`;
    }
    s += `<path d="M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}" stroke="${frame}" stroke-width="2.5"/>`;
    if (look === 'boarded') {
      s += `<g transform="rotate(-9 ${x + w / 2} ${y + h / 2})"><rect x="${x - 6}" y="${y + h * 0.28}" width="${w + 12}" height="7" rx="1" fill="#a08868"/><rect x="${x - 6}" y="${y + h * 0.6}" width="${w + 12}" height="7" rx="1" fill="#947c5e"/>
        <circle cx="${x - 2}" cy="${y + h * 0.28 + 3.5}" r="0.9" fill="#4a4a50"/><circle cx="${x + w + 2}" cy="${y + h * 0.6 + 3.5}" r="0.9" fill="#4a4a50"/></g>`;
    }
    if (sill) s += `<rect x="${x - 6}" y="${y + h + 2}" width="${w + 12}" height="4" rx="1.5" fill="${clean ? '#efe6d4' : '#a59e90'}"/>${SEASON === 'winter' ? `<rect x="${x - 6}" y="${y + h}" width="${w + 12}" height="2.5" rx="1.2" fill="${SNOW}"/>` : ''}`;
    return s;
  }

  // herbs in a window box under the left upstairs window
  function herbs(st) {
    const p = pend(st, 'herbs');
    const r = U.rng(31);
    let s = '<g data-part="herbs">';
    if (st.herbs) {
      const greens = p === 'grow' ? ['#8a8a4a', '#9a8a52', '#7d7a44', '#a39457'] : ['#4f8a3a', '#62a042', '#3f7531', '#7cb36a'];
      for (let i = 0; i < 30; i++) {
        const x = 102 + r() * 52, y = 205 + r() * 12;
        s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(2 + r() * 1.6)}" ry="${f1(1.2 + r())}" fill="${U.pick(r, greens)}" transform="rotate(${(r() * 180) | 0} ${f1(x)} ${f1(y)})"/>`;
      }
      if (p !== 'grow') for (let i = 0; i < 8; i++) s += `<circle cx="${f1(104 + r() * 48)}" cy="${f1(203 + r() * 6)}" r="1.5" fill="${U.pick(r, ['#b48fd8', '#ffffff', '#c9a3e6'])}"/>`;
      else s += `<path d="M112 216 q-3 -8 -8 -9 M146 216 q4 -9 9 -8" stroke="#8a7a4a" stroke-width="1.2" fill="none"/>`;
    } else {
      s += `<path d="M114 217 l-2 -9 l-3 -2 M142 217 l3 -7 l-2 -3" stroke="#8a7358" stroke-width="1.2" fill="none"/>`;
    }
    s += `<rect x="100" y="216" width="56" height="10" rx="1.5" fill="${st.herbs ? '#8a5a3c' : '#7d6a58'}"/><rect x="100" y="216" width="56" height="2.5" fill="${st.herbs ? '#a8754e' : '#8f7d6a'}"/>
      <path d="M100 221 H156" stroke="${st.herbs ? '#734a30' : '#6a5a4a'}" stroke-width="0.8"/><path d="M106 226 v4 M150 226 v4" stroke="#3d3d42" stroke-width="1.5"/>`;
    if (p === 'leaves') s += `<rect x="100" y="210" width="56" height="9" fill="${url('Leaves')}"/>`;
    if (p === 'snow' || p === 'frost' || (SEASON === 'winter' && st.herbs)) s += `<path d="M99 217 Q110 ${p === 'snow' ? 205 : 212} 128 211 T157 217 Z" fill="${SNOW}"/>`;
    return s + '</g>';
  }

  // the sign board over the shop, and the pilasters painted to match
  function sign(st, C, text) {
    const p = pend(st, 'sign');
    const col = st.sign ? C.sign : '#8e918f';
    const trim = st.sign ? '#efe3c8' : '#a59e90';
    let s = `<g data-part="sign"><rect x="66" y="240" width="268" height="5" fill="${trim}"/>
      <rect x="72" y="245" width="256" height="26" fill="${col}"/><rect x="66" y="271" width="268" height="4" fill="${trim}"/>`;
    if (st.sign) {
      const t = String(text || 'CAFÉ').slice(0, 16);
      const fs = t.length <= 6 ? 17 : Math.max(10, 17 - (t.length - 6) * 0.8);
      const gold = U.lum(col) > 0.7 ? '#9a6a18' : '#f6dd8a';
      s += `<rect x="76" y="248.5" width="248" height="19" fill="none" stroke="#e8c66a" stroke-width="0.9"/>
        <text x="200" y="264.5" text-anchor="middle" font-family="${FONT}" font-size="${f1(fs)}" font-weight="900" letter-spacing="${t.length <= 6 ? 4 : 1.2}" fill="${gold}" stroke="${U.shade(col, -0.35)}" stroke-width="0.5">${esc(t)}</text>
        ${cup(108, 262, gold)}${cup(292, 262, gold)}`;
      // two little lamps that light the sign at night
      for (const x of [126, 274]) s += `<rect x="${x - 2}" y="238" width="4" height="3" rx="1" fill="#3d3d42"/><path d="M${x} 239 q0 -10 9 -10" stroke="#3d3d42" stroke-width="1.8" fill="none"/>
        <path d="M${x + 4} 226.5 h11 l2.5 6 h-16z" fill="#3d3d42"/><ellipse cx="${x + 9.5}" cy="232.6" rx="6" ry="1.4" fill="#ffe9a8"/>`;
    } else {
      // faded paint, peeling, and the F has slipped
      s += `<path d="M88 247 q8 4 16 0 q-2 8 -10 7z M236 262 q10 -4 18 2 q-6 6 -16 3z M298 249 q8 1 12 6 l-8 2z" fill="#bdb6a7"/>
        <path d="M150 245 l4 9 l-3 6 l5 10" stroke="#5f6261" stroke-width="0.8" fill="none"/>`;
      const letter = (ch, x, y, rot = 0) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="${FONT}" font-size="17" font-weight="900" fill="#d9cfb6" opacity="0.6"${rot ? ` transform="rotate(${rot} ${x} ${y - 12})"` : ''}>${ch}</text>`;
      s += letter('C', 172, 264.5) + letter('A', 189, 264.5) + letter('F', 210, 272, 28) + letter('É', 227, 264.5);
    }
    if (p === 'grow') s += VEIL('M72 245 H328 V271 H72Z');
    if (SEASON === 'winter' || p === 'snow') s += `<rect x="66" y="238" width="268" height="3" rx="1.5" fill="${SNOW}"/>`;
    return s + '</g>';
  }
  function cup(x, y, col) {
    return `<path d="M${x - 5} ${y - 5} h9 v3.5 a4.5 4.5 0 0 1 -9 0z" fill="${col}"/><path d="M${x + 4} ${y - 4} a2.2 2.2 0 0 1 0 4.4" stroke="${col}" stroke-width="1.1" fill="none"/>
      <path d="M${x - 2.5} ${y - 7} q1.4 -2 0 -4 M${x + 0.5} ${y - 7} q1.4 -2 0 -4" stroke="${col}" stroke-width="0.8" fill="none"/>`;
  }

  function shopfront(st, C) {
    const col = st.sign ? U.shade(C.sign, -0.06) : '#8d877b';
    const cap = st.sign ? '#efe3c8' : '#a59e90';
    return `<rect x="72" y="275" width="12" height="117" fill="${col}"/><rect x="230" y="275" width="14" height="117" fill="${col}"/><rect x="304" y="275" width="24" height="117" fill="${col}"/>
      <rect x="70" y="275" width="16" height="4" fill="${cap}"/><rect x="228" y="275" width="18" height="4" fill="${cap}"/><rect x="302" y="275" width="28" height="4" fill="${cap}"/>
      <rect x="84" y="380" width="146" height="12" fill="${col}"/><rect x="88" y="382.5" width="138" height="7" rx="1" fill="none" stroke="${U.shade(col, -0.25)}" stroke-width="1"/>
      <path d="M72 392 H84 M230 392 H244" stroke="${U.shade(col, -0.3)}" stroke-width="1"/>`;
  }

  // what you see through the big window: tiles, counter, tables, floor
  function interior(st, decor) {
    let s = '';
    const pt = pend(st, 'tiles');
    s += `<g data-part="tiles"><rect x="90" y="279" width="134" height="68" fill="${st.tiles ? url('WallTiles') : '#b9a68b'}"/>`;
    if (!st.tiles) {
      s += `<rect x="94" y="326" width="27" height="18" fill="${url('WallTiles')}" opacity="0.55"/><rect x="196" y="318" width="18" height="9" fill="${url('WallTiles')}" opacity="0.5"/>
        <path d="M140 300 l6 10 l-3 8 l5 9 M200 296 l-4 7 l3 5" stroke="#8a7a64" stroke-width="0.8" fill="none"/>`;
    }
    if (pt === 'grow') s += VEIL('M90 279 H224 V347 H90Z');
    s += '</g>';
    // floor
    const pf = pend(st, 'floor');
    s += `<g data-part="floor"><rect x="90" y="347" width="134" height="31" fill="${st.floor ? url('Checker') : url('Boards')}"/>`;
    if (!st.floor) {
      const r = U.rng(71);
      s += `<rect x="90" y="347" width="134" height="31" fill="#d8ccb4" opacity="0.35"/>`;
      for (let i = 0; i < 9; i++) s += `<circle cx="${f1(94 + r() * 126)}" cy="${f1(360 + r() * 14)}" r="${f1(1.6 + r() * 1.6)}" fill="${U.pick(r, ['#f1ede4', '#d9cfb6', '#c9a26a'])}"/>`;
    } else if (pf) s += `<rect x="90" y="347" width="134" height="31" fill="${url('Dusty')}" opacity="0.45"/>`;
    s += '</g>';
    // shelf, cups and pendant lamps come with the counter
    if (st.counter) {
      s += `<rect x="160" y="320" width="62" height="2.5" fill="#8a5a3c"/>`;
      ['#ffffff', '#e9a0a6', '#9cc5a1', '#8fbfe6', '#ffffff', '#f2d88a'].forEach((c, i) => { const x = 164 + i * 9.5; s += `<path d="M${x} 314.5 h5.5 v3 a2.75 2.75 0 0 1 -5.5 0z" fill="${c}"/>`; });
      for (const x of [116, 146]) s += `<path d="M${x} 279 V318" stroke="#3d3d42" stroke-width="0.8"/><path d="M${x - 6} 323 q6 -8 12 0z" fill="#3d5a4a"/><circle cx="${x}" cy="323.5" r="2" fill="#ffe08a"/>`;
    }
    s += counter(st);
    s += insideTables(st);
    if (decor['c-cakes']) s += DECOR['c-cakes']();
    // light: dim and dusty until the counter works again
    if (!st.counter) s += `<rect x="90" y="279" width="134" height="97" fill="#3b3027" opacity="${st.tiles ? 0.16 : 0.3}" pointer-events="none"/>`;
    else s += `<rect x="90" y="279" width="134" height="97" fill="#ffd98a" opacity="0.1" pointer-events="none"/>`;
    return s;
  }
  function counter(st) {
    const p = pend(st, 'counter');
    const ok = st.counter;
    let s = `<g data-part="counter"><rect x="158" y="344" width="66" height="28" fill="${ok ? '#8a5a3c' : '#6f6458'}"/>
      <rect x="162" y="349" width="26" height="19" rx="1" fill="none" stroke="${ok ? '#6e4630' : '#5d5449'}" stroke-width="1"/><rect x="193" y="349" width="26" height="19" rx="1" fill="none" stroke="${ok ? '#6e4630' : '#5d5449'}" stroke-width="1"/>
      <rect x="156" y="341" width="70" height="4" rx="1" fill="${ok ? '#ece6da' : '#8c857a'}"/>`;
    if (ok) {
      s += `<rect x="188" y="327" width="26" height="14" rx="2" fill="${url('Copper')}"/><path d="M191 327 q10 -9 20 0z" fill="${url('Copper')}"/><circle cx="201" cy="319.5" r="1.8" fill="#e9c35a"/>
        <rect x="192" y="335" width="3" height="4" fill="#cfd5dc"/><rect x="207" y="335" width="3" height="4" fill="#cfd5dc"/><circle cx="201" cy="332" r="2.6" fill="#f3e6c8" stroke="#8a5a3c" stroke-width="0.6"/>
        <path d="M166 341 q8 -12 16 0z" fill="#f4e7d0" opacity="0.65"/><rect x="168.5" y="336" width="11" height="5" rx="1" fill="#e98aa6"/><rect x="168.5" y="335" width="11" height="1.6" rx="0.8" fill="#fff"/>
        <path d="M216 338 h5 v2.5 a2.5 2.5 0 0 1 -5 0z" fill="#fff"/><g class="cf-steam" fill="none" stroke="#fff" stroke-width="0.8" opacity="0.85"><path d="M217.5 336 q-1.4 -2.5 0 -5"/><path d="M219.8 336 q1.4 -2.5 0 -5"/></g>`;
    } else {
      s += `<rect x="188" y="327" width="26" height="14" rx="2" fill="#8b8780"/><path d="M191 327 q10 -9 20 0z" fill="#7d7973"/>
        <path d="M188 327 l-8 -9 M214 327 l8 -8 M188 327 l-3 -10 M180 318 q4 4 8 9" stroke="#e1ddd5" stroke-width="0.5" fill="none" opacity="0.9"/>
        <rect x="160" y="338" width="10" height="3" fill="#7a7368"/>`;
    }
    if (p === 'grow') s += VEIL('M156 318 H224 V372 H156Z');
    return s + '</g>';
  }
  // chairs on the tables while the café is closed, set tables once washed
  function insideTables(st) {
    const p = pend(st, 'tables');
    let s = '<g data-part="tables">';
    for (const x of [118, 144]) {
      const top = st.tables ? '#f4efe6' : '#a59b8a', leg = st.tables ? '#3d3d42' : '#5d5650';
      s += `<path d="M${x} 352 V372 M${x - 5} 372 H${x + 5}" stroke="${leg}" stroke-width="1.5"/><ellipse cx="${x}" cy="351" rx="9" ry="2.4" fill="${top}"/>`;
      if (st.tables) {
        s += `<rect x="${x - 1.5}" y="345" width="3" height="5" fill="#9cc5a1"/><circle cx="${x}" cy="344" r="2" fill="${x === 118 ? '#ef8aa6' : '#f7c548'}"/>
          <path d="M${x - 14} 372 V358 M${x - 14} 362 h6 v10" stroke="${leg}" stroke-width="1.2" fill="none"/>`;
      } else {
        // a chair upside down on the table
        s += `<path d="M${x - 6} 349 h12 M${x - 5} 349 V339 M${x + 5} 349 V339 M${x - 6} 349 v-5 h-1" stroke="#6d665e" stroke-width="1.3" fill="none"/>`;
      }
    }
    if (p === 'grow') s += VEIL('M104 340 H156 V374 H104Z');
    return s + '</g>';
  }

  function glass(st) {
    const p = pend(st, 'window');
    // a clean window lets taps through to the counter, tables and tiles
    let s = `<g data-part="window"${st.window && !p ? ' pointer-events="none"' : ''}>`;
    if (!st.window && (st.floor || st.tiles || st.counter || st.tables)) {
      // someone has rubbed a peephole, so work done inside shows through
      s += `<rect x="90" y="279" width="134" height="97" fill="${url('Grime')}" opacity="0.4"/>
        <path d="M90 279 H224 V376 H90Z M111 350 a46 22 0 1 0 92 0 a46 22 0 1 0 -92 0Z" fill-rule="evenodd" fill="${url('Grime')}" opacity="0.5"/>
        <path d="M118 338 q38 -14 78 2 M114 362 q42 16 86 -2" stroke="#4e4a40" stroke-width="2" opacity="0.18" fill="none"/>
        <g transform="rotate(-7 117 344)"><rect x="102" y="300" width="31" height="15" fill="#f1ede4"/><text x="117.5" y="310.5" text-anchor="middle" font-family="${FONT}" font-size="6.4" font-weight="900" fill="#c9474f">CLOSED</text></g>`;
    } else if (!st.window) {
      s += `<rect x="90" y="279" width="134" height="97" fill="${url('Grime')}" opacity="0.72"/>
        <path d="M96 318 q30 10 60 -2 M100 352 q40 8 90 -6 M150 330 q20 8 46 0" stroke="#4e4a40" stroke-width="4" opacity="0.3" fill="none"/>
        <g transform="rotate(-7 117 344)"><rect x="102" y="336" width="31" height="15" fill="#f1ede4"/><text x="117.5" y="346.5" text-anchor="middle" font-family="${FONT}" font-size="6.4" font-weight="900" fill="#c9474f">CLOSED</text></g>
        <path d="M224 318 l-14 0 l14 14Z" fill="#ffffff" opacity="0.3"/>`;
    } else if (p === 'frost' || p === 'snow') {
      s += `<rect x="90" y="279" width="134" height="97" fill="${url('Frost')}" opacity="0.88"/>
        <path d="M90 330 q20 -4 30 -24 M224 352 q-22 4 -34 24 M90 362 q14 0 22 14 M224 300 q-16 2 -24 -16" stroke="#ffffff" stroke-width="1.6" fill="none"/>`;
    } else if (p) {
      s += `<rect x="90" y="279" width="134" height="97" fill="${url('Dusty')}" opacity="0.55"/>`;
      const r = U.rng(81);
      for (let i = 0; i < 14; i++) s += `<circle cx="${f1(94 + r() * 126)}" cy="${f1(312 + r() * 60)}" r="${f1(1 + r() * 1.4)}" fill="#ffffff" opacity="0.5"/>`;
    } else {
      s += `<path d="M104 376 L150 279 H168 L122 376Z" fill="#ffffff" opacity="0.13"/><path d="M180 376 L216 300 H221 L186 376Z" fill="#ffffff" opacity="0.12"/>`;
      if (st.sign) s += `<text x="140" y="337" text-anchor="middle" font-family="${FONT}" font-size="7.5" font-weight="800" font-style="italic" fill="#e8c66a">coffee · cake</text>`;
    }
    return s + '</g>';
  }

  function shopWindow(st, decor) {
    const frame = st.window ? '#f3ead7' : '#a59e90';
    return `<g data-part="window"><rect x="84" y="275" width="146" height="105" fill="${frame}"/></g>
      <g clip-path="${url('Glass')}">${interior(st, decor)}</g>${glass(st)}
      <g data-part="window"><rect x="155.5" y="279" width="3" height="97" fill="${frame}"/><rect x="84" y="376" width="146" height="4" fill="${frame}"/></g>
      <rect x="90" y="300" width="134" height="16" fill="${url('Shade')}" pointer-events="none"/>`;
  }

  function awning(st, C) {
    const p = pend(st, 'awning');
    const ok = st.awning;
    const A = ok ? C.awning : '#a49686', B = ok ? '#f6ecd8' : '#cdc3b1';
    const N = 9, tx0 = 80, tx1 = 234, bx0 = 74, bx1 = 240, ty = 276;
    const by = (i) => (ok ? 300 : 300 + (i / N) * 7);
    let s = '<g data-part="awning">';
    for (let i = 0; i < N; i++) {
      const t0 = tx0 + ((tx1 - tx0) * i) / N, t1 = tx0 + ((tx1 - tx0) * (i + 1)) / N;
      const b0 = bx0 + ((bx1 - bx0) * i) / N, b1 = bx0 + ((bx1 - bx0) * (i + 1)) / N;
      const col = i % 2 ? B : A;
      const ym = (by(i) + by(i + 1)) / 2;
      s += `<path d="M${f1(t0)} ${ty} L${f1(t1)} ${ty} L${f1(b1)} ${f1(by(i + 1))} L${f1(b0)} ${f1(by(i))} Z" fill="${col}"/>
        <path d="M${f1(b0)} ${f1(by(i))} L${f1(b1)} ${f1(by(i + 1))} Q${f1((b0 + b1) / 2)} ${f1(ym + 12)} ${f1(b0)} ${f1(by(i))} Z" fill="${col}"/>`;
    }
    s += `<path d="M${tx0} ${ty} H${tx1} L${tx1 + 0.6} ${ty + 4} H${tx0 - 0.6}Z" fill="#000" opacity="0.14"/>
      <path d="M${bx0} ${f1(by(0))} L${bx1} ${f1(by(N))}" stroke="${ok ? U.shade(A, -0.25) : '#857a6d'}" stroke-width="1"/>`;
    if (!ok) s += `<path d="M168 284 l9 3 l-4 10 l-7 -6z" fill="#4a4036" opacity="0.75"/><path d="M196 ${f1(by(7) - 1)} l10 1 l-3 15 l-6 -2z" fill="${B}" stroke="#857a6d" stroke-width="0.6"/>`;
    if (p === 'grow') s += VEIL(`M${tx0} ${ty} H${tx1} L${bx1} ${by(N) + 9} H${bx0}Z`);
    if (p === 'leaves') s += `<path d="M${tx0} ${ty} H${tx1} L${bx1} ${by(N)} H${bx0}Z" fill="${url('Leaves')}"/>`;
    if (p === 'snow' || p === 'frost') s += `<path d="M${tx0 - 1} ${ty - 1} H${tx1 + 1} L${bx1 + 1} ${by(N)} Q200 ${by(N) - 6} 150 ${by(N) - 2} T${bx0 - 1} ${by(0)}Z" fill="${SNOW}"/>`;
    else if (SEASON === 'winter') s += `<path d="M${tx0 - 1} ${ty - 1} H${tx1 + 1} L${tx1 + 2} ${ty + 5} Q200 ${ty + 8} 150 ${ty + 5} T${tx0 - 2} ${ty + 5}Z" fill="${SNOW}"/>`;
    return s + '</g>';
  }

  function door(st, C) {
    const p = pend(st, 'door');
    const col = st.door ? C.door : '#857b6c', dk = U.shade(col, -0.25);
    const casing = st.door ? '#efe3c8' : '#9c917b';
    let s = `<g data-part="door"><rect x="244" y="275" width="60" height="117" fill="${casing}"/>
      <rect x="250" y="279" width="48" height="11" fill="${st.door ? url('Room') : url('Grime')}"/>
      <path d="M250 284.5 H298 M266 279 V290 M282 279 V290" stroke="${casing}" stroke-width="1.2"/>
      <rect x="250" y="292" width="48" height="96" fill="${col}"/>
      <rect x="257" y="298" width="34" height="40" rx="1.5" fill="${st.door ? url('Room') : url('Grime')}"/>
      <rect x="257" y="346" width="34" height="34" rx="1.5" fill="none" stroke="${dk}" stroke-width="1.5"/>
      <rect x="261" y="350" width="26" height="26" rx="1" fill="none" stroke="${U.shade(col, 0.15)}" stroke-width="0.8"/>
      <circle cx="293" cy="342" r="2.2" fill="${st.door ? '#e9c35a' : '#77705f'}"/>`;
    if (st.door) {
      s += `<rect x="250" y="382" width="48" height="5" fill="#d9b44a"/>
        <path d="M266 304 L274 300 L282 304" stroke="#5b4a3a" stroke-width="0.6" fill="none"/><rect x="263" y="304" width="22" height="8.5" rx="1.2" fill="#fbf7ee" stroke="#5b4a3a" stroke-width="0.5"/>
        <text x="274" y="310.6" text-anchor="middle" font-family="${FONT}" font-size="5.8" font-weight="900" fill="#c9474f">OPEN</text>
        <path d="M262 336 l13 -32" stroke="#ffffff" stroke-width="3" opacity="0.25"/>`;
    } else {
      s += `<path d="M266 302 l6 12 l-4 8 l8 10 M272 314 l10 -4" stroke="#d8d2c4" stroke-width="0.8" fill="none"/>
        <g transform="rotate(-24 274 340)"><rect x="240" y="335" width="68" height="9" rx="1" fill="#a08868"/><circle cx="246" cy="339.5" r="1" fill="#4a4a50"/><circle cx="302" cy="339.5" r="1" fill="#4a4a50"/></g>
        <rect x="262" y="368" width="10" height="7" fill="#f1ede4" transform="rotate(8 267 371)"/><rect x="271" y="370" width="9" height="6" fill="#e9a0a6" transform="rotate(-6 275 373)"/>`;
    }
    if (p === 'grow') s += VEIL('M250 292 H298 V388 H250Z');
    if (p === 'frost' || p === 'snow') s += `<rect x="257" y="298" width="34" height="40" rx="1.5" fill="${url('Frost')}" opacity="0.85"/>`;
    s += '</g>';
    s += `<rect x="240" y="388" width="68" height="8" rx="1.5" fill="#c9c0b1"/><rect x="240" y="388" width="68" height="2" fill="#ddd5c8"/>`;
    if (SEASON === 'winter') s += `<rect x="240" y="386.5" width="68" height="3" rx="1.5" fill="${SNOW}"/>`;
    return s;
  }

  // a flower pot either side of the door
  function pots(st) {
    const p = pend(st, 'pots');
    let s = '<g data-part="pots">';
    for (const [x, seed] of [[254, 51], [294, 52]]) {
      const r = U.rng(seed);
      if (st.pots && p !== 'grow') {
        for (let i = 0; i < 6; i++) s += `<ellipse cx="${f1(x - 6 + r() * 12)}" cy="${f1(374 + r() * 5)}" rx="3.4" ry="2.4" fill="${U.pick(r, ['#4f8a3a', '#62a042', '#3f7531'])}"/>`;
        const cols = x < 270 ? ['#e0485a', '#ef8aa6', '#ffffff'] : ['#f7c548', '#f08a4b', '#ffffff'];
        for (let i = 0; i < 7; i++) s += `<circle cx="${f1(x - 6 + r() * 12)}" cy="${f1(369 + r() * 7)}" r="2" fill="${U.pick(r, cols)}"/>`;
      } else if (st.pots) {
        s += `<path d="M${x} 379 q-2 -9 -8 -8 M${x} 379 q1 -10 7 -9 M${x} 379 q-1 -6 -3 -10" stroke="#8a8a4a" stroke-width="1.4" fill="none"/>`;
      } else {
        s += `<path d="M${x} 379 l-2 -8 l3 -3" stroke="#8a7358" stroke-width="1.2" fill="none"/>`;
      }
      s += `<path d="M${x - 7} 380 h14 l-2 9 h-10z" fill="${st.pots ? '#c8763f' : '#9a7a62'}"/><rect x="${x - 8}" y="378.5" width="16" height="3" rx="1" fill="${st.pots ? '#d98b55' : '#a8896f'}"/>`;
      if (!st.pots && x > 270) s += `<path d="M${x + 2} 381 l-2 3 l2 2 l-1 3" stroke="#6b5444" stroke-width="0.7" fill="none"/>`;
      if (p === 'snow' || p === 'frost' || (SEASON === 'winter' && st.pots)) s += `<ellipse cx="${x}" cy="${p === 'snow' ? 372 : 377}" rx="7.5" ry="${p === 'snow' ? 5 : 2.5}" fill="${SNOW}"/>`;
      if (p === 'leaves') s += `<ellipse cx="${x - 3}" cy="377" rx="3" ry="1.5" fill="#d9822b" transform="rotate(20 ${x - 3} 377)"/><ellipse cx="${x + 3}" cy="378" rx="3" ry="1.5" fill="#c4462f"/>`;
    }
    return s + '</g>';
  }

  // ------------------------------------------------------------ the terrace
  const DECK = 'M62 400 H338 L350 452 H50 Z';
  function deck(st) {
    const p = pend(st, 'deck');
    let s = '<g data-part="deck">';
    if (st.deck) {
      s += `<path d="${DECK}" fill="${url('Planks')}"/><path d="${DECK}" fill="${url('DeckShade')}"/>
        <rect x="50" y="452" width="300" height="7" fill="#9c6c40"/><rect x="50" y="452" width="300" height="1.6" fill="#c08a55"/>`;
      if (p === 'leaves') s += `<path d="${DECK}" fill="${url('Leaves')}"/><path d="${DECK}" fill="${url('Leaves')}" transform="translate(9 5)"/>`;
      else if (p === 'snow' || p === 'frost') s += `<path d="${DECK}" fill="${url('Snow')}"/>`;
      else if (p === 'grow') { const r = U.rng(91); for (let i = 0; i < 16; i++) s += tuft(70 + r() * 260, 408 + r() * 42, U.pick(r, ['#5f8a3a', '#7a9a44'])); }
      else if (SEASON === 'winter') s += `<path d="M50 452 L52.5 441 Q120 446 200 440 T347.5 442 L350 452Z" fill="${SNOW}"/>`;
      else if (SEASON === 'autumn') s += `<path d="${DECK}" fill="${url('Leaves')}" opacity="0.3"/>`;
    } else {
      s += `<path d="${DECK}" fill="#7f6d55"/><path d="${DECK}" fill="${url('DeckShade')}"/>`;
      for (let i = 0; i <= 8; i++) {
        const xt = 66 + (i * 268) / 8, xb = 56 + (i * 288) / 8;
        s += `<path d="M${f1(xt)} 401 L${f1(xb)} 451" stroke="#5e4a36" stroke-width="5"/><path d="M${f1(xt - 1)} 401 L${f1(xb - 1.2)} 451" stroke="#8f7656" stroke-width="1.8"/>`;
      }
      s += `<path d="M57 427 H343" stroke="#5e4a36" stroke-width="3"/><rect x="50" y="452" width="300" height="7" fill="#6b5a44"/>
        <g transform="rotate(-4 300 420)"><rect x="268" y="414" width="64" height="5" rx="1" fill="#c99a62"/><rect x="272" y="409" width="62" height="5" rx="1" fill="#d3a76f"/><rect x="266" y="404" width="60" height="5" rx="1" fill="#c3925a"/></g>`;
      const r = U.rng(92);
      for (let i = 0; i < 12; i++) s += `<ellipse cx="${f1(92 + r() * 80)}" cy="${f1(432 + r() * 14)}" rx="${f1(2 + r() * 3)}" ry="${f1(1.5 + r() * 1.5)}" fill="${U.pick(r, ['#9a9384', '#857e70', '#b0a898'])}"/>`;
    }
    return s + '</g>';
  }

  // bistro tables out on the deck once both are ready; stacked until then
  function terraceTables(st) {
    const p = pend(st, 'tables');
    let s = '<g data-part="tables">';
    if (st.tables && st.deck) {
      for (const x of [128, 214]) s += bistro(x, 424, p);
    } else {
      const c = st.tables ? '#3d3d42' : '#77706a', t = st.tables ? '#f1ece2' : '#a59b8a';
      s += `<ellipse cx="102" cy="402" rx="16" ry="2.4" fill="#00000022"/>
        <ellipse cx="94" cy="388" rx="3" ry="12" fill="${t}" stroke="${c}" stroke-width="0.8" transform="rotate(-12 94 388)"/>
        <ellipse cx="99" cy="389" rx="3" ry="12" fill="${t}" stroke="${c}" stroke-width="0.8" transform="rotate(-8 99 389)"/>`;
      for (let k = 0; k < 3; k++) s += `<path d="M106 ${400 - k * 4} h12 M107 ${400 - k * 4} V${404 - k * 4} M117 ${400 - k * 4} V${404 - k * 4} M118 ${400 - k * 4} V${388 - k * 4}" stroke="${c}" stroke-width="1.3" fill="none"/>`;
      if (!st.tables) s += `<path d="M90 377 l8 4 l-6 5 M98 381 l6 -5" stroke="#e1ddd5" stroke-width="0.5" fill="none"/>`;
    }
    return s + '</g>';
  }
  function bistro(x, y, p) {
    const k = '#3d3d42';
    let s = `<ellipse cx="${x}" cy="${y + 22}" rx="26" ry="3" fill="#00000020"/>`;
    for (const side of [-1, 1]) {
      const cx = x + side * 19;
      s += `<path d="M${cx - 5} ${y + 7} L${cx - 6} ${y + 21} M${cx + 5} ${y + 7} L${cx + 6} ${y + 21}" stroke="${k}" stroke-width="1.3"/>
        <path d="M${cx + side * 6} ${y + 7} V${y - 5} q${-side * 3} -4 ${-side * 6} -1" stroke="${k}" stroke-width="1.6" fill="none"/>
        <ellipse cx="${cx}" cy="${y + 7}" rx="7" ry="2.2" fill="#6d4a32"/>`;
    }
    s += `<path d="M${x} ${y + 2} V${y + 20}" stroke="${k}" stroke-width="2"/><ellipse cx="${x}" cy="${y + 21}" rx="6" ry="1.6" fill="${k}"/>
      <ellipse cx="${x}" cy="${y}" rx="13" ry="3.6" fill="#f1ece2" stroke="#c9c0b0" stroke-width="0.8"/>
      <path d="M${x - 7} ${y - 4.5} h5 v2.5 a2.5 2.5 0 0 1 -5 0z" fill="#ffffff" stroke="#c9c0b0" stroke-width="0.4"/>
      <g class="cf-steam" fill="none" stroke="#ffffff" stroke-width="0.9" opacity="0.85"><path d="M${x - 5.6} ${y - 6} q-1.5 -3 0 -6"/><path d="M${x - 3.2} ${y - 6} q1.5 -3 0 -6"/></g>
      <rect x="${x + 3}" y="${y - 7}" width="3" height="5" rx="0.8" fill="#9cc5a1"/><circle cx="${x + 4.5}" cy="${y - 8.5}" r="2.1" fill="#ef8aa6"/>`;
    if (p === 'grow') s += VEIL(`M${x - 26} ${y - 10} H${x + 26} V${y + 22} H${x - 26}Z`);
    if (p === 'snow' || p === 'frost') s += `<ellipse cx="${x}" cy="${y - 1}" rx="12.5" ry="3.4" fill="${SNOW}"/><ellipse cx="${x - 19}" cy="${y + 6}" rx="6.5" ry="2" fill="${SNOW}"/><ellipse cx="${x + 19}" cy="${y + 6}" rx="6.5" ry="2" fill="${SNOW}"/>`;
    if (p === 'leaves') s += `<ellipse cx="${x + 6}" cy="${y}" rx="3.5" ry="1.6" fill="#d9822b" transform="rotate(25 ${x + 6} ${y})"/><ellipse cx="${x - 2}" cy="${y + 1}" rx="3.2" ry="1.5" fill="#c4462f"/><ellipse cx="${x - 19}" cy="${y + 6}" rx="3" ry="1.4" fill="#e9b23c"/>`;
    return s;
  }

  // planter boxes at either end of the deck
  function planters(st) {
    const p = pend(st, 'planters');
    let s = '<g data-part="planters">';
    for (const [x0, seed] of [[54, 41], [296, 42]]) {
      const r = U.rng(seed), w = 50;
      if (st.planters && p !== 'grow') {
        for (let k = 0; k < 11; k++) s += `<ellipse cx="${f1(x0 + 4 + k * 4.2 + (r() - 0.5) * 3)}" cy="${f1(424 - r() * 6)}" rx="${f1(4 + r() * 2)}" ry="${f1(3.4 + r() * 1.6)}" fill="${U.pick(r, ['#4f8a3a', '#62a042', '#3f7531', '#58964a'])}"/>`;
        for (let k = 0; k < 4; k++) { const x = x0 + 8 + r() * (w - 16); s += `<path d="M${f1(x)} 424 V${f1(410 - r() * 4)}" stroke="#9d86c9" stroke-width="2.2" stroke-linecap="round"/>`; }
        const cols = x0 < 200 ? ['#e0485a', '#ef8aa6', '#ffffff', '#f7c548'] : ['#f7c548', '#f08a4b', '#ffffff', '#bba9df'];
        for (let k = 0; k < 15; k++) s += `<circle cx="${f1(x0 + 4 + r() * (w - 8))}" cy="${f1(414 + r() * 10)}" r="${f1(1.8 + r() * 0.8)}" fill="${U.pick(r, cols)}"/>`;
      } else if (st.planters) {
        for (let k = 0; k < 7; k++) s += `<ellipse cx="${f1(x0 + 5 + k * 6.5)}" cy="${f1(424 - r() * 4)}" rx="4" ry="3" fill="${U.pick(r, ['#8a8a4a', '#9a8a52', '#7d7a44'])}"/>`;
        for (let k = 0; k < 6; k++) s += tuft(x0 + 6 + r() * (w - 12), 426, '#6f8a3e');
      } else {
        s += `<path d="M${x0 + 2} 427 Q${x0 + w / 2} 424 ${x0 + w - 2} 427" stroke="#8a7358" stroke-width="3" fill="none"/><path d="M${x0 + 18} 426 l-2 -10 l-3 -3 M${x0 + 18} 418 l4 -4" stroke="#8a7358" stroke-width="1.2" fill="none"/>`;
      }
      s += `<rect x="${x0}" y="428" width="${w}" height="20" rx="1.5" fill="${st.planters ? '#9a6844' : '#7d6a58'}"/>
        <path d="M${x0} 434.5 H${x0 + w} M${x0} 441 H${x0 + w}" stroke="${st.planters ? '#7c5233' : '#665646'}" stroke-width="0.9"/>
        <rect x="${x0 - 2}" y="426" width="${w + 4}" height="3.5" rx="1" fill="${st.planters ? '#b98458' : '#8f7d6a'}"/>
        <rect x="${x0 + 2}" y="448" width="4" height="3" fill="#5e4a36"/><rect x="${x0 + w - 6}" y="448" width="4" height="3" fill="#5e4a36"/>`;
      if (!st.planters) s += `<rect x="${x0 + 30}" y="435" width="11" height="6" fill="#5e4a36"/>`;
      if (p === 'snow' || p === 'frost' || (SEASON === 'winter' && st.planters)) s += `<path d="M${x0 - 2} 427 Q${x0 + 10} ${p === 'snow' ? 412 : 420} ${x0 + w / 2} ${p === 'snow' ? 414 : 419} T${x0 + w + 2} 427 Z" fill="${SNOW}"/>`;
      if (p === 'leaves') s += `<rect x="${x0}" y="418" width="${w}" height="10" fill="${url('Leaves')}"/>`;
    }
    return s + '</g>';
  }

  // a low brick wall along the front, with a gap to walk through
  function brickWall(st) {
    const p = pend(st, 'brickwall');
    const ok = st.brickwall;
    let s = '<g data-part="brickwall">';
    if (ok) {
      for (const [x0, x1] of [[34, 178], [222, 366]]) {
        s += `<rect x="${x0}" y="458" width="${x1 - x0}" height="24" fill="${url('Brick')}"/>
          <rect x="${x0 - 2}" y="452" width="${x1 - x0 + 4}" height="7" rx="1.5" fill="#d8d0c2"/><rect x="${x0 - 2}" y="452" width="${x1 - x0 + 4}" height="2.4" rx="1" fill="#e9e3d7"/>`;
      }
      for (const x of [176, 214]) s += `<rect x="${x}" y="448" width="10" height="34" fill="${url('Brick')}"/><rect x="${x - 2}" y="444" width="14" height="5" rx="1.5" fill="#d8d0c2"/>`;
    } else {
      // gappy and broken, with loose bricks lying about
      s += `<path d="M34 482 V462 H58 V458 H96 V466 H120 V460 H150 V470 H166 V462 H178 V482Z" fill="${url('BrickOld')}"/>
        <path d="M222 482 V466 H240 V458 H276 V462 H310 V472 H330 V460 H366 V482Z" fill="${url('BrickOld')}"/>
        <rect x="176" y="458" width="10" height="24" fill="${url('BrickOld')}"/><rect x="214" y="452" width="10" height="30" fill="${url('BrickOld')}"/>`;
      for (const [x, y] of [[64.6, 468.5], [104.6, 476.5], [136.6, 464.4], [248.6, 472.5], [296.6, 468.4], [344.6, 476.5]]) s += `<rect x="${x}" y="${y}" width="14.8" height="3.1" fill="#4f4236"/>`;
      const r = U.rng(93);
      for (let i = 0; i < 9; i++) { const x = 40 + r() * 320, y = 484 + r() * 7; s += `<rect x="${f1(x)}" y="${f1(y)}" width="12" height="4" rx="0.6" fill="${U.pick(r, ['#86594a', '#906252', '#7a5244'])}" transform="rotate(${((r() - 0.5) * 50) | 0} ${f1(x + 6)} ${f1(y + 2)})"/>`; }
    }
    if (p === 'grow') {
      const r = U.rng(94);
      for (let i = 0; i < 30; i++) { const x = 36 + r() * 328, y = 456 + r() * 24; if (x > 176 && x < 224) continue; s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="3" ry="2" fill="${U.pick(r, ['#4f8a3c', '#5d9644', '#3f7531'])}" transform="rotate(${(r() * 180) | 0} ${f1(x)} ${f1(y)})"/>`; }
    } else if (p === 'leaves') s += `<path d="M32 449 H180 V456 H32Z M220 449 H368 V456 H220Z" fill="${url('Leaves')}"/><path d="M32 482 H368 V490 H32Z" fill="${url('Leaves')}"/>`;
    if (p === 'snow' || p === 'frost') s += `<path d="M31 454 Q40 444 60 447 T110 446 T180 450 V455 H31Z M219 455 Q230 444 260 447 T320 445 T369 452 V455Z" fill="${SNOW}"/>`;
    else if (SEASON === 'winter' && ok) s += `<rect x="31" y="450" width="150" height="3" rx="1.5" fill="${SNOW}"/><rect x="219" y="450" width="150" height="3" rx="1.5" fill="${SNOW}"/>`;
    return s + '</g>';
  }

  // weeds along the front of a café nobody has looked after
  function weeds(pct) {
    const r = U.rng(97);
    const n = Math.round(16 * (1 - pct));
    let s = '';
    for (let i = 0; i < n; i++) s += tuft(70 + r() * 260, 392 + r() * 6, U.pick(r, ['#5f8a3a', '#7a9a44', '#4d7a32']));
    return s;
  }

  // ------------------------------------------------------------ decorations
  // Bought in the shed; each one is a small drawing at a fixed spot.
  function onCurve(t, a, c, b) { return [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]; }
  const LIGHTS = { a: [48, 334], c: [200, 374], b: [352, 334], n: 13 };
  const DECOR = {
    'c-board': () => `<g><ellipse cx="200" cy="519" rx="14" ry="2.2" fill="#00000022"/><path d="M188 519 L195 486 H205 L212 519" stroke="#8a6142" stroke-width="2.2" fill="none"/>
      <path d="M190.5 515 L196 489 H204 L209.5 515Z" fill="#33403a"/><path d="M196 495 h8 M195 500 h7 M196.5 505 h8" stroke="#f4efe4" stroke-width="0.8" opacity="0.85"/>
      <path d="M197.5 508.5 h5 v2 a2.5 2.5 0 0 1 -5 0z" fill="none" stroke="#f7c6d1" stroke-width="0.7"/></g>`,
    'c-flowers': () => {
      let s = '<g>';
      const fl = [[64, 368, '#f7c548'], [70, 364, '#e0485a'], [76, 369, '#ef8aa6'], [67, 373, '#ffffff'], [73, 372, '#f08a4b']];
      for (const [x, y] of fl) s += `<path d="M70 384 L${x} ${y}" stroke="#4f8a3a" stroke-width="1.2"/>`;
      for (const [x, y, c] of fl) s += `<circle cx="${x}" cy="${y}" r="3" fill="${c}"/><circle cx="${x}" cy="${y}" r="1" fill="#8a5a3c" opacity="0.6"/>`;
      return s + `<path d="M62 384 h16 l-2 14 h-12z" fill="#9aa3ad"/><rect x="61" y="383" width="18" height="2.5" rx="1" fill="#b8c0c8"/></g>`;
    },
    'c-cat': () => `<g><ellipse cx="281" cy="212" rx="7" ry="4.6" fill="#3d3d42"/><circle cx="287.5" cy="207" r="3.9" fill="#3d3d42"/>
      <path d="M285 204.5 l0.6 -3.8 l2.2 2.7 M288.6 203.4 l2.2 -2.9 l0.8 3.8" fill="#3d3d42"/><circle cx="289" cy="206.6" r="0.75" fill="#f2c230"/>
      <path class="cf-tail" d="M274.5 213 q-5 3 -3.5 10" stroke="#3d3d42" stroke-width="2" fill="none" stroke-linecap="round"/></g>`,
    'c-bunting': () => {
      const a = [72, 228], c = [200, 248], b = [328, 228], n = 14, cols = ['#e0485a', '#f7c548', '#8fbfe6', '#9cc5a1', '#ef8aa6'];
      let s = `<path d="M${a[0]} ${a[1]} Q${c[0]} ${c[1]} ${b[0]} ${b[1]}" stroke="#7d7264" stroke-width="0.8" fill="none"/>`;
      for (let i = 0; i < n; i++) {
        const [x0, y0] = onCurve(i / n + 0.012, a, c, b), [x1, y1] = onCurve((i + 1) / n - 0.012, a, c, b);
        s += `<path d="M${f1(x0)} ${f1(y0)} L${f1(x1)} ${f1(y1)} L${f1((x0 + x1) / 2)} ${f1((y0 + y1) / 2 + 8)} Z" fill="${cols[i % cols.length]}"/>`;
      }
      return `<g>${s}</g>`;
    },
    'c-parasol': () => {
      let s = `<g><path d="M214 440 V352" stroke="#7a6a5a" stroke-width="1.6"/><ellipse cx="214" cy="441" rx="5" ry="1.4" fill="#5d5650"/>`;
      const x0 = 178, x1 = 250, n = 6;
      for (let i = 0; i < n; i++) {
        const a = x0 + ((x1 - x0) * i) / n, b = x0 + ((x1 - x0) * (i + 1)) / n;
        s += `<path d="M214 350 L${f1(a)} 372 Q${f1((a + b) / 2)} 377 ${f1(b)} 372 Z" fill="${i % 2 ? '#f6ecd8' : '#5aa6a0'}"/>`;
      }
      return s + '<circle cx="214" cy="349.5" r="1.6" fill="#7a6a5a"/></g>';
    },
    'c-lights': () => {
      const { a, c, b, n } = LIGHTS;
      let s = `<g><path d="M${a[0]} 452 V${a[1] - 4} M${b[0]} 452 V${b[1] - 4}" stroke="#5d5650" stroke-width="2"/>
        <path d="M${a[0]} ${a[1]} Q${c[0]} ${c[1]} ${b[0]} ${b[1]}" stroke="#4a4a50" stroke-width="0.8" fill="none"/>`;
      for (let i = 1; i < n; i++) { const [x, y] = onCurve(i / n, a, c, b); s += `<circle class="bulb" cx="${f1(x)}" cy="${f1(y + 2.4)}" r="2.2" fill="${['#ffe08a', '#ffb3c1', '#b3e5ff', '#c8f2b0'][i % 4]}"/>`; }
      return s + '</g>';
    },
    'c-baskets': () => [[62, 72], [338, 328]].map(([x, wall]) => `<g><path d="M${wall} 282 H${x} V292" stroke="#3d3d42" stroke-width="1.2" fill="none"/>
      <path d="M${x - 9} 296 q9 12 18 0 z" fill="#8a5a3c"/>
      <circle cx="${x - 6}" cy="295" r="3" fill="#4f8a3a"/><circle cx="${x + 5}" cy="295" r="3" fill="#62a042"/><circle cx="${x}" cy="293" r="3" fill="#4f8a3a"/>
      <circle cx="${x - 5}" cy="293" r="1.8" fill="#e0485a"/><circle cx="${x + 2}" cy="291.5" r="1.8" fill="#f7c548"/><circle cx="${x + 6}" cy="295" r="1.8" fill="#ef8aa6"/>
      <path d="M${x - 8} 297 q-2 6 1 10 M${x + 8} 297 q2 5 -1 9" stroke="#4f8a3a" stroke-width="1.2" fill="none"/></g>`).join(''),
    'c-cakes': () => `<g><path d="M99 374 V352 M93 374 h12" stroke="#c9c0b0" stroke-width="1.2"/>
      <ellipse cx="99" cy="364" rx="7" ry="1.6" fill="#f4efe6"/><ellipse cx="99" cy="353" rx="5" ry="1.3" fill="#f4efe6"/>
      <rect x="94" y="358.5" width="10" height="5" rx="1.5" fill="#7a4a32"/><rect x="94" y="358.5" width="10" height="1.6" rx="0.8" fill="#f7c6d1"/><circle cx="99" cy="358" r="1" fill="#e0485a"/>
      <rect x="95.5" y="348.5" width="7" height="4" rx="1.2" fill="#f7c6d1"/><circle cx="99" cy="348.3" r="0.9" fill="#e0485a"/></g>`,
    'c-bike': () => `<g><ellipse cx="54" cy="518" rx="30" ry="2.5" fill="#00000022"/>
      <circle cx="38" cy="507" r="10" fill="none" stroke="#3d3d42" stroke-width="2"/><circle cx="72" cy="507" r="10" fill="none" stroke="#3d3d42" stroke-width="2"/>
      <path d="M38 507 l12 -15 h14 l8 15 M50 492 l-4 15 h-8 M64 492 l-2 -6 h-5 M50 492 l-2 -5 h7" stroke="#d9614f" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M64 486 h-3 M72 507 l-6 -19" stroke="#3d3d42" stroke-width="1.6"/><path d="M66 482 h16 v9 h-16z" fill="#c98a50"/><path d="M66 486 h16" stroke="#a46a38" stroke-width="0.8"/>
      <ellipse cx="70" cy="481" rx="4.5" ry="2.4" fill="#e0b070"/><circle cx="77" cy="480" r="2.2" fill="#ef8aa6"/><circle cx="80" cy="482" r="1.8" fill="#f7c548"/></g>`,
    'c-dog': () => `<g><ellipse cx="274" cy="440" rx="16" ry="2.6" fill="#00000022"/>
      <path d="M261 434 q-7 -1 -5 6" stroke="#c98a50" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <g class="cf-breathe"><ellipse cx="272" cy="433" rx="12" ry="6.5" fill="#c98a50"/><ellipse cx="268" cy="431" rx="6" ry="3" fill="#d99a5e"/></g>
      <ellipse cx="285" cy="436" rx="5.6" ry="4" fill="#d99a5e"/><ellipse cx="283" cy="432.5" rx="2.4" ry="4" fill="#8a5a3c" transform="rotate(32 283 432.5)"/>
      <path d="M285.4 435 q1.5 1 3 0" stroke="#3d3d42" stroke-width="0.7" fill="none"/><circle cx="290.2" cy="436.8" r="0.9" fill="#3d3d42"/>
      <text x="291" y="427" font-family="${FONT}" font-size="6" font-weight="800" fill="#7d7264">z</text><text x="295" y="422" font-family="${FONT}" font-size="4.5" font-weight="800" fill="#7d7264">z</text></g>`,
    'c-icecream': () => {
      let s = `<g><ellipse cx="328" cy="517" rx="30" ry="2.6" fill="#00000022"/><path d="M328 488 V462" stroke="#8a8f96" stroke-width="1.4"/>`;
      const x0 = 306, x1 = 350, n = 5;
      for (let i = 0; i < n; i++) {
        const a = x0 + ((x1 - x0) * i) / n, b = x0 + ((x1 - x0) * (i + 1)) / n;
        s += `<path d="M328 451 L${f1(a)} 466 Q${f1((a + b) / 2)} 470 ${f1(b)} 466 Z" fill="${i % 2 ? '#f6ecd8' : '#ef8aa6'}"/>`;
      }
      return s + `<rect x="304" y="488" width="48" height="20" rx="3" fill="#f6ecd8"/><rect x="304" y="494" width="48" height="5" fill="#ef8aa6"/>
        <path d="M325.5 491 l2.5 9 l2.5 -9z" fill="#e0a86a"/><circle cx="328" cy="490.5" r="2.6" fill="#b3e5ff"/>
        <path d="M352 492 h6 v-5" stroke="#8a8f96" stroke-width="1.6" fill="none"/>
        <circle cx="312" cy="511" r="5" fill="#3d3d42"/><circle cx="312" cy="511" r="2" fill="#b8c0c8"/><circle cx="344" cy="511" r="5" fill="#3d3d42"/><circle cx="344" cy="511" r="2" fill="#b8c0c8"/></g>`;
    },
    'c-scooter': () => `<g><ellipse cx="133" cy="527" rx="26" ry="2.4" fill="#00000022"/>
      <circle cx="116" cy="520" r="6.5" fill="#3d3d42"/><circle cx="116" cy="520" r="2.4" fill="#b8c0c8"/><circle cx="152" cy="520" r="6.5" fill="#3d3d42"/><circle cx="152" cy="520" r="2.4" fill="#b8c0c8"/>
      <path d="M108 517 q0 -15 17 -14 l10 11 h12 l3 -14 l4 0 l-3 18 h-40 z" fill="#8fd1c0"/><path d="M114 503 h14 q2 0 2 2 h-16z" fill="#5b4a3a"/>
      <path d="M150 500 l-2 -8 h-5" stroke="#3d3d42" stroke-width="1.6" fill="none"/><circle cx="153" cy="501" r="2.4" fill="#fff6c8"/></g>`,
  };

  function decorations(owned) {
    let s = '';
    for (const k of Object.keys(DECOR)) if (owned[k] && k !== 'c-cakes') s += DECOR[k]();
    return s;
  }

  function life(st, pct) {
    let s = '';
    if (pct > 0.2) s += `<g class="bfly b1"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="#f2a7b8"/></g>`;
    if (pct > 0.5) s += `<g class="bfly b2"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="#fbd85c"/></g>`;
    if (pct > 0.3) s += `<g class="bird"><path d="M128 66 q4 -4 8 0 q4 -4 8 0 M150 78 q3 -3 6 0 q3 -3 6 0" stroke="#4a4a50" stroke-width="1.5" fill="none"/></g>`;
    if (st.brickwall && SEASON !== 'winter') s += `<g><ellipse cx="346" cy="447" rx="5" ry="3.4" fill="#a0785a"/><circle cx="350" cy="444" r="2.6" fill="#8a6142"/><path d="M352.4 444 l2.4 0.6 l-2.4 0.8z" fill="#e9b23c"/><path d="M341.5 446 l-4 -2" stroke="#8a6142" stroke-width="1.6"/><circle cx="350.6" cy="443.4" r="0.5" fill="#222"/></g>`;
    return s;
  }

  function weather() {
    let s = '';
    if (SEASON === 'winter') {
      for (let i = 0; i < 26; i++) s += `<circle class="flake" cx="${(i * 61) % 400}" cy="-10" r="${1.5 + (i % 3) * 0.7}" fill="#fff" style="animation-delay:-${(i * 0.83) % 9}s;animation-duration:${7 + (i % 5)}s"/>`;
    } else if (SEASON === 'autumn') {
      const cols = ['#d9822b', '#c4462f', '#e9b23c'];
      for (let i = 0; i < 9; i++) s += `<ellipse class="fleaf" cx="${(i * 47 + 20) % 400}" cy="-10" rx="4" ry="2" fill="${cols[i % 3]}" style="animation-delay:-${(i * 1.3) % 10}s;animation-duration:${9 + (i % 4)}s"/>`;
    } else if (SEASON === 'spring') {
      for (let i = 0; i < 8; i++) s += `<ellipse class="fleaf" cx="${(i * 53 + 10) % 400}" cy="-10" rx="2.6" ry="1.6" fill="#f7c6d1" style="animation-delay:-${(i * 1.7) % 11}s;animation-duration:${11 + (i % 3)}s"/>`;
    }
    return `<g class="weather" pointer-events="none">${s}</g>`;
  }

  // evening: darken everything except the lit windows, then let lights glow
  function night(st, decor, pct) {
    const lit = (part) => st[part] && !PEND[part];
    const up = pct >= 0.6;
    let holes = '';
    if (lit('window')) holes += '<rect x="90" y="279" width="134" height="97"/>';
    if (lit('door')) holes += '<rect x="257" y="298" width="34" height="40"/><rect x="250" y="279" width="48" height="11"/>';
    if (up) holes += '<rect x="106" y="170" width="44" height="44"/><rect x="250" y="170" width="44" height="44"/>';
    if (pct >= 0.75) holes += '<rect x="190" y="127" width="20" height="17"/>';
    let s = `<mask id="${id('Dark')}"><rect width="400" height="540" fill="#fff"/><g fill="#000">${holes}</g></mask>
      <rect width="400" height="540" fill="#1b2350" opacity="0.55" style="mix-blend-mode:multiply" mask="url(#${id('Dark')})"/>
      <rect width="400" height="540" fill="#24306a" opacity="0.18" mask="url(#${id('Dark')})"/>`;
    for (let i = 0; i < 30; i++) s += `<circle class="star" cx="${(i * 97) % 400}" cy="${8 + ((i * 53) % 150)}" r="${0.6 + (i % 3) * 0.4}" fill="#fff" style="animation-delay:-${(i * 0.7) % 4}s"/>`;
    s += `<mask id="${id('Moon')}"><rect width="400" height="200" fill="#fff"/><circle cx="343" cy="50" r="14" fill="#000"/></mask><circle cx="336" cy="56" r="16" fill="#fff6d8" mask="url(#${id('Moon')})"/><circle cx="336" cy="56" r="30" fill="#fff6d8" opacity="0.08"/>`;
    const glow = (x, y, rx, ry = rx) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${ry}" fill="${url('Glow')}"/>`;
    if (lit('window')) s += `<rect x="90" y="279" width="134" height="97" fill="#ffcf7a" opacity="0.16"/>${glow(157, 330, 100, 80)}${glow(157, 410, 110, 18)}`;
    if (lit('door')) s += `${glow(274, 318, 34, 40)}${glow(274, 400, 34, 7)}`;
    if (up) for (const x of [106, 250]) s += `<rect x="${x}" y="170" width="44" height="44" fill="#ffd98a" opacity="0.55"/>${glow(x + 22, 192, 46)}`;
    if (pct >= 0.15) s += `<rect x="204" y="191" width="5" height="8" fill="#ffe9a8"/>${pct >= 0.5 ? glow(206.5, 195, 16) : ''}`;
    s += `<path d="M30.5 288 h7 l-1.4 -10 h-4.2 z" fill="#ffe9a8"/>${glow(34, 283, 28)}${glow(34, 400, 34, 7)}`;
    if (st.sign) {
      for (const x of [126, 274]) s += `<path d="M${x + 9.5} 233 L${x - 14} 271 H${x + 33} Z" fill="#ffd98a" opacity="0.2"/>`;
      s += `<rect x="72" y="245" width="256" height="26" fill="#ffd98a" opacity="0.16"/>`;
    }
    if (decor['c-lights']) {
      const { a, c, b, n } = LIGHTS;
      for (let i = 1; i < n; i++) { const [x, y] = onCurve(i / n, a, c, b); s += `${glow(x, y + 2.4, 10)}<circle cx="${f1(x)}" cy="${f1(y + 2.4)}" r="2.6" fill="${['#ffe08a', '#ffb3c1', '#b3e5ff', '#c8f2b0'][i % 4]}"/>`; }
    }
    return `<g class="night" pointer-events="none">${s}</g>`;
  }

  const SPOTS = {
    floor: [124, 364], window: [157, 330], terrace: [200, 505], planters: [79, 424], tables: [171, 422], deck: [200, 430], awning: [157, 288],
    counter: [200, 334], brickwall: [107, 468], herbs: [128, 212], sign: [200, 258], door: [274, 330], tiles: [157, 310], pots: [274, 376],
  };
  function sparkles(part) {
    if (!part) return '';
    const spot = SPOTS[part] || [200, 330];
    let s = '';
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2, d = 18 + (i % 3) * 10;
      const x = f1(spot[0] + Math.cos(a) * d), y = spot[1] + Math.sin(a) * d * 0.7;
      s += `<path class="spark" style="animation-delay:${(i * 0.09).toFixed(2)}s" d="M${x} ${f1(y - 6)} L${f1(+x + 1.5)} ${f1(y - 1.5)} L${f1(+x + 6)} ${f1(y)} L${f1(+x + 1.5)} ${f1(y + 1.5)} L${x} ${f1(y + 6)} L${f1(x - 1.5)} ${f1(y + 1.5)} L${f1(x - 6)} ${f1(y)} L${f1(x - 1.5)} ${f1(y - 1.5)}Z" fill="#fff7cc"/>`;
    }
    return `<g class="sparkles" pointer-events="none">${s}</g>`;
  }

  // st: map of restored part -> true; cols: chosen paint colours (sign,
  // cafeDoor, optional awning); opts as for HOUSE.render plus optional
  // sign (text on the board) and uid (id suffix when several cafés share a page)
  function render(st, cols = {}, opts = {}) {
    SEASON = opts.season || 'spring'; PEND = opts.pending || {}; UID = opts.uid ? String(opts.uid).replace(/[^\w-]/g, '') : ''; FORSALE = !!opts.forSale;
    const pct = U.clamp(opts.pct || 0, 0, 1);
    const decor = opts.decor || {};
    const C = { sign: cols.sign || '#3d5a86', door: cols.cafeDoor || '#c9474f', awning: cols.awning || '#d9614f' };
    return `<svg viewBox="0 0 ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" class="house cafe">
      ${style()}${defs()}${sky()}${neighbours()}${streetTree()}
      ${terrace(st)}${kerb()}${streetLamp()}
      ${chimney(st)}${roof(pct)}${upperFloor(st, pct)}${herbs(st)}${sign(st, C, opts.sign)}
      ${shopfront(st, C)}${shopWindow(st, decor)}${awning(st, C)}${door(st, C)}${pots(st)}${weeds(pct)}
      ${deck(st)}${terraceTables(st)}${planters(st)}${brickWall(st)}
      ${decorations(decor)}${life(st, pct)}${weather()}${opts.night ? night(st, decor, pct) : ''}${sparkles(opts.fresh)}
    </svg>`;
  }

  return { render, DECOR, PARTS: Object.keys(SPOTS) };
})();
