'use strict';
// The cove overview, drawn as SVG the same way as the cottage (house.js) and
// the café (cafe.js). Each restorable part has a tired look and a restored
// look; the beach hut, the rowing boat and the lighthouse bands take the
// colours chosen while painting. Every id carries a 'v' prefix (plus opts.uid
// when given) so this picture can share a page with the others.

const COVE = (() => {
  const VB = { w: 400, h: 540 };
  const FONT = "ui-rounded,'SF Pro Rounded',system-ui,sans-serif";

  // set at the start of every render: the season, which parts have a
  // seasonal job waiting (part -> 'grow' | 'leaves' | 'snow' | 'frost'), the
  // id suffix, whether the cove is still for sale, how far along it is and
  // the colours worked out from all that
  let SEASON = 'spring', PEND = {}, UID = '', FORSALE = false, PCT = 0, K = {};
  const id = (n) => `v${n}${UID}`;
  const url = (n) => `url(#${id(n)})`;
  const pend = (st, p) => (st[p] ? PEND[p] : undefined);
  const f1 = (v) => (+v).toFixed(1);
  const SNOW = '#f4f8fb';
  const VEIL = (d) => `<path d="${d}" fill="#cfc6b6" opacity="0.5"/>`;
  const dot = (x, y, r, col, op = 1) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`;

  const SKY = {
    spring: ['#bfe2ef', '#e9f1e6', '#f6eedd'], summer: ['#9fd6f0', '#e3f3ea', '#fbf1d8'],
    autumn: ['#cfcac4', '#e6ddcd', '#f1e4cf'], winter: ['#c4d2e0', '#e3eaf1', '#f3f6f9'],
  };
  const SEA = {
    spring: ['#5f9fbd', '#74bccb', '#a8ddd6'], summer: ['#3f8dbd', '#4fb2c9', '#95ded5'],
    autumn: ['#4d7c90', '#5e95a2', '#8cb9b6'], winter: ['#6e8393', '#889cab', '#b5c6cf'],
  };
  const SAND = { spring: '#ead9ae', summer: '#efdca9', autumn: '#ddc997', winter: '#dcd6c8' };
  const GRASS = {
    spring: ['#7db35b', '#5f9a44', '#9cc66e'], summer: ['#97b05c', '#6f9a44', '#b5c470'],
    autumn: ['#c7ad66', '#a88f4e', '#d9c27c'], winter: ['#aaa58b', '#8d8973', '#c3bfa6'],
  };
  const DRY = ['#c2a868', '#a68d52', '#d3bd80'];
  const HAZE = { spring: '#a9c4b2', summer: '#9fc0a8', autumn: '#b0a690', winter: '#cdd7de' };

  // ---------------------------------------------------------------- shapes
  const SHORE = [[0, 446], [14, 420], [34, 382], [70, 352], [110, 320], [170, 300], [236, 290], [280, 284], [318, 280], [400, 272]];
  const SHORE_D = 'M0 446 C14 420 34 382 70 352 C110 320 170 300 236 290 C280 284 318 280 400 272';
  const SAND_D = `${SHORE_D} V540 H0Z`;
  const ROCKS_D = 'M256 306 C258 280 278 254 302 242 C318 224 350 214 376 218 C394 222 406 232 412 246 V336 C392 344 352 348 320 342 C292 338 264 328 256 306Z';
  const DUNE = [[-4, 474], [40, 452], [82, 452], [122, 466], [150, 476], [172, 472], [200, 462], [238, 450], [282, 452], [322, 466], [352, 476], [382, 472], [404, 462]];
  const DUNE_D = 'M-4 474 C40 452 82 452 122 466 C150 476 172 472 200 462 C238 450 282 452 322 466 C352 476 382 472 404 462 V540 H-4Z';
  const BW = [[244, 548], [276, 506], [176, 484], [198, 438]];
  const JET = { l0: [112, 331], r0: [144, 327], l1: [141, 222], r1: [159, 220] };
  const JET_D = 'M112 331 L144 327 L159 220 L141 222Z';
  const DRIFT_D = 'M204 334 C232 318 290 314 326 326 C352 334 372 352 366 378 C360 404 376 428 338 438 C300 448 262 444 236 430 C214 418 198 398 199 370 C200 352 194 342 204 334Z';
  const HUT_D = 'M54 414 V366 L90 336 L126 366 V414Z';
  const VAN_SIDE = 'M44 466 H134 V518 H40 Q36 518 36 514 V476 Q36 466 44 466Z';
  const VAN_FRONT = 'M134 470 Q134 466 140 466 H162 Q168 466 168 472 V516 Q168 519 165 519 H134Z';
  const VAN_WIN = [[44, 472, 18], [66, 472, 18], [88, 472, 18], [110, 472, 18]];

  function bez(pts, i, t) {
    const p0 = pts[i * 3], p1 = pts[i * 3 + 1], p2 = pts[i * 3 + 2], p3 = pts[i * 3 + 3], m = 1 - t;
    return [0, 1].map((k) => m * m * m * p0[k] + 3 * m * m * t * p1[k] + 3 * m * t * t * p2[k] + t * t * t * p3[k]);
  }
  // a point along a chain of cubic curves, u from 0 to the number of curves
  const along = (pts, u) => { const n = (pts.length - 1) / 3, i = Math.min(n - 1, Math.floor(u)); return bez(pts, i, Math.min(1, u - i)); };
  const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const quad = (a, b, c, d) => `M${f1(a[0])} ${f1(a[1])} L${f1(b[0])} ${f1(b[1])} L${f1(c[0])} ${f1(c[1])} L${f1(d[0])} ${f1(d[1])}Z`;

  // little css of our own: waves, foam, a bobbing boat, the lighthouse beam
  function style() {
    return `<style>@media (prefers-reduced-motion: no-preference){
      #scene .cv-wave{animation:cvwave 7s ease-in-out infinite alternate}
      @keyframes cvwave{to{transform:translateX(-7px)}}
      #scene .cv-foam{animation:cvfoam 4.6s ease-in-out infinite}
      @keyframes cvfoam{50%{transform:translate(2px,3px);opacity:.45}}
      #scene .cv-bob{animation:cvbob 3.6s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center bottom}
      @keyframes cvbob{from{transform:translateY(-1px) rotate(-2deg)}to{transform:translateY(1px) rotate(2deg)}}
      #scene .cv-beam{animation:cvbeam 9s ease-in-out infinite;transform-box:fill-box;transform-origin:100% 50%}
      @keyframes cvbeam{0%,100%{transform:scaleX(1);opacity:.95}25%{opacity:.3}50%{transform:scaleX(-1);opacity:.9}75%{opacity:.3}}
      #scene .cv-kite{animation:cvkite 4s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 40%}
      @keyframes cvkite{from{transform:rotate(-7deg)}to{transform:rotate(6deg) translateY(-3px)}}
      #scene .cv-flame{animation:cvflame .7s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center bottom}
      @keyframes cvflame{to{transform:scale(.86,1.14)}}
      #scene .cv-spout{animation:cvspout 4s ease-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes cvspout{0%,55%{transform:scaleY(0);opacity:0}65%{opacity:.9}100%{transform:scaleY(1);opacity:0}}
      #scene .cv-flag{animation:cvflag 1.4s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:0% 50%}
      @keyframes cvflag{to{transform:scaleX(.8) skewY(6deg)}}
      #scene .cv-sway{animation:cvsway 3.8s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center top}
      @keyframes cvsway{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}
      #scene .cv-breathe{animation:cvbreathe 3.2s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom}
      @keyframes cvbreathe{50%{transform:scaleY(1.06)}}
      #scene .cv-glint{animation:cvglint 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
      @keyframes cvglint{0%,100%{opacity:.2;transform:scale(.5)}50%{opacity:1;transform:scale(1.1)}}
    }</style>`;
  }

  function palette(C) {
    const k = (1 - PCT) * 0.35;
    K = {
      C,
      sea: SEA[SEASON].map((c) => U.mix(c, '#8e9699', k)),
      sand: U.mix(SAND[SEASON], '#bdb6a6', k),
      dune: U.mix(U.shade(SAND[SEASON], 0.08), '#c4bdae', k),
    };
  }

  function defs() {
    const C = K.C;
    return `
    <defs>
      <linearGradient id="${id('Sky')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${SKY[SEASON][0]}"/><stop offset="0.75" stop-color="${SKY[SEASON][1]}"/><stop offset="1" stop-color="${SKY[SEASON][2]}"/>
      </linearGradient>
      <radialGradient id="${id('Sun')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#fff6cf"/><stop offset="0.45" stop-color="#fde7a3"/><stop offset="1" stop-color="#fde7a3" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${id('Sea')}" x1="0" y1="168" x2="0" y2="450" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="${K.sea[0]}"/><stop offset="0.45" stop-color="${K.sea[1]}"/><stop offset="1" stop-color="${K.sea[2]}"/>
      </linearGradient>
      <linearGradient id="${id('Dune')}" x1="0" y1="450" x2="0" y2="540" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="${U.shade(K.dune, 0.06)}"/><stop offset="1" stop-color="${U.shade(K.dune, -0.1)}"/>
      </linearGradient>
      <pattern id="${id('Speck')}" width="26" height="18" patternUnits="userSpaceOnUse">
        <circle cx="4" cy="5" r="0.8" fill="#8a7a5a" opacity="0.35"/><circle cx="17" cy="12" r="0.7" fill="#8a7a5a" opacity="0.3"/>
        <circle cx="11" cy="3" r="0.6" fill="#fff" opacity="0.5"/><circle cx="22" cy="4" r="0.9" fill="#fff" opacity="0.35"/><circle cx="8" cy="14" r="0.6" fill="#6f6048" opacity="0.3"/>
      </pattern>
      <linearGradient id="${id('RakeG')}" x1="186" y1="0" x2="244" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/>
      </linearGradient>
      <mask id="${id('RakeFade')}" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="540"><rect width="400" height="540" fill="${url('RakeG')}"/></mask>
      <pattern id="${id('Boards')}" width="8" height="40" patternUnits="userSpaceOnUse">
        <rect width="8" height="40" fill="${C.hut}"/><rect x="7.2" width="0.8" height="40" fill="${U.shade(C.hut, -0.28)}"/><rect width="1" height="40" fill="#fff" opacity="0.22"/>
      </pattern>
      <pattern id="${id('BoardsOld')}" width="8" height="40" patternUnits="userSpaceOnUse">
        <rect width="8" height="40" fill="#b9b4a8"/><rect x="7.2" width="0.8" height="40" fill="#8c877b"/>
        <path d="M2 4 h3 v4 h-2z M4 22 h2.5 v5 h-3z" fill="#9db4c0" opacity="0.8"/><path d="M1.5 30 v7" stroke="#a29d91" stroke-width="0.6"/>
      </pattern>
      <pattern id="${id('Rock')}" width="34" height="26" patternUnits="userSpaceOnUse">
        <ellipse cx="9" cy="8" rx="7" ry="4" fill="#fff" opacity="0.12"/><ellipse cx="25" cy="19" rx="8" ry="4" fill="#000" opacity="0.08"/>
        <circle cx="27" cy="6" r="1.2" fill="#e8e2d6" opacity="0.5"/><circle cx="6" cy="20" r="1" fill="#d6cbb8" opacity="0.6"/>
        <path d="M14 13 l4 3 l-1 4" stroke="#5f574e" stroke-width="0.6" fill="none" opacity="0.6"/>
      </pattern>
      <pattern id="${id('Snow')}" width="30" height="24" patternUnits="userSpaceOnUse">
        <rect width="30" height="24" fill="#f3f7fb"/><ellipse cx="8" cy="8" rx="7" ry="3" fill="#e2ebf3"/><ellipse cx="22" cy="18" rx="8" ry="3" fill="#e6eef5"/>
        <circle cx="16" cy="5" r="0.9" fill="#fff"/><circle cx="4" cy="19" r="0.8" fill="#c9d8e6"/>
      </pattern>
      <pattern id="${id('Leaves')}" width="34" height="28" patternUnits="userSpaceOnUse">
        <ellipse cx="6" cy="6" rx="4" ry="2" fill="#d9822b" transform="rotate(30 6 6)"/><ellipse cx="22" cy="10" rx="4.5" ry="2.2" fill="#c4462f" transform="rotate(-20 22 10)"/>
        <ellipse cx="14" cy="21" rx="4" ry="2" fill="#e9b23c" transform="rotate(70 14 21)"/><ellipse cx="29" cy="24" rx="3.6" ry="1.8" fill="#9c5a2a"/>
        <path d="M2 16 q3 -3 6 0 t6 0" stroke="#4d5a2a" stroke-width="1.4" fill="none"/>
      </pattern>
      <linearGradient id="${id('Frost')}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f4f9fc"/><stop offset="1" stop-color="#cadbe8"/>
      </linearGradient>
      <linearGradient id="${id('Salt')}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#dcded6"/><stop offset="1" stop-color="#a9aea4"/>
      </linearGradient>
      <linearGradient id="${id('Cyl')}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0.16"/><stop offset="0.32" stop-color="#fff" stop-opacity="0.34"/><stop offset="0.6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#2a2018" stop-opacity="0.28"/>
      </linearGradient>
      <radialGradient id="${id('Glow')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#ffe2a0" stop-opacity="0.6"/><stop offset="0.45" stop-color="#ffd98a" stop-opacity="0.22"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${id('Beam')}" x1="1" y1="0" x2="0" y2="0">
        <stop offset="0" stop-color="#fff4c2" stop-opacity="0.7"/><stop offset="0.6" stop-color="#fff4c2" stop-opacity="0.16"/><stop offset="1" stop-color="#fff4c2" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="${id('Lens')}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#fffbe6"/><stop offset="0.5" stop-color="#ffe08a"/><stop offset="1" stop-color="#e9a83c"/>
      </radialGradient>
      <radialGradient id="${id('Pool')}" cx="0.45" cy="0.4" r="0.6">
        <stop offset="0" stop-color="#b6e8ee"/><stop offset="1" stop-color="#5fb3c9"/>
      </radialGradient>
      <linearGradient id="${id('Chrome')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f4f7fa"/><stop offset="0.5" stop-color="#a9b2bb"/><stop offset="1" stop-color="#e3e8ec"/>
      </linearGradient>
      <linearGradient id="${id('Sheen')}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <clipPath id="${id('SandClip')}"><path d="${SAND_D}"/></clipPath>
      <clipPath id="${id('VanClip')}"><path d="${VAN_SIDE} ${VAN_FRONT}"/></clipPath>
    </defs>`;
  }

  // ---------------------------------------------------------- sky and sea
  function sky() {
    const storm = SEASON === 'autumn';
    const cl = storm ? '#d3d6d8' : '#ffffff';
    let s = `<rect width="400" height="176" fill="${url('Sky')}"/>
    <circle cx="70" cy="62" r="46" fill="${url('Sun')}"/>
    <circle cx="70" cy="62" r="17" fill="#fff3c4"/>
    <g class="cloud c1" fill="${cl}" opacity="0.92">
      <ellipse cx="160" cy="52" rx="24" ry="10"/><ellipse cx="178" cy="45" rx="17" ry="12"/><ellipse cx="196" cy="53" rx="18" ry="8"/>
    </g>
    <g class="cloud c2" fill="${cl}" opacity="0.8">
      <ellipse cx="248" cy="104" rx="19" ry="7"/><ellipse cx="263" cy="99" rx="13" ry="9"/><ellipse cx="277" cy="105" rx="14" ry="6"/>
    </g>`;
    if (storm) {
      s += `<g class="cloud c2" fill="#a4abb2" opacity="0.9"><ellipse cx="96" cy="116" rx="42" ry="12"/><ellipse cx="124" cy="104" rx="28" ry="15"/><ellipse cx="154" cy="116" rx="30" ry="10"/></g>
        <g class="cloud c1" fill="#b8bec3" opacity="0.85"><ellipse cx="270" cy="64" rx="34" ry="10"/><ellipse cx="292" cy="55" rx="22" ry="13"/></g>`;
    }
    return s;
  }

  function sea() {
    let s = `<path d="M-10 172 Q24 148 62 155 Q96 160 130 172 Z" fill="${HAZE[SEASON]}"/>
      <path d="M-10 172 Q24 148 62 155 Q96 160 130 172" stroke="#fff" stroke-width="1" fill="none" opacity="0.3"/>
      ${SEASON === 'winter' ? '<path d="M14 160 Q36 150 58 155 Q46 156 30 161Z" fill="#fff" opacity="0.8"/>' : ''}
      <rect y="168" width="400" height="290" fill="${url('Sea')}"/>
      <path d="M0 168.6 H400" stroke="#ffffff" stroke-width="1" opacity="0.5"/>`;
    const r = U.rng(11);
    let w = '';
    for (let i = 0; i < 30; i++) {
      const y = 176 + Math.pow(r(), 1.3) * 270, x = r() * 400, len = 5 + (y - 170) * 0.07 + r() * 8;
      w += `<path d="M${f1(x)} ${f1(y)} q${f1(len / 2)} ${f1(-1 - len * 0.08)} ${f1(len)} 0" stroke="#ffffff" stroke-width="${f1(0.8 + (y - 170) * 0.004)}" fill="none" opacity="${f1(0.3 + r() * 0.3)}"/>`;
    }
    s += `<g class="cv-wave">${w}</g>`;
    if (SEASON === 'autumn') {
      // whitecaps on a choppy autumn sea
      for (let i = 0; i < 10; i++) { const x = r() * 380, y = 190 + r() * 100; s += `<path d="M${f1(x)} ${f1(y)} l4 -3 l4 3" stroke="#fff" stroke-width="1.2" fill="none" opacity="0.6"/>`; }
    }
    return s;
  }

  // a forlorn cove has rubbish bobbing in the bay
  function flotsam() {
    if (PCT >= 0.5) return '';
    const op = f1(1 - PCT * 1.6);
    return `<g opacity="${op}"><g transform="rotate(-12 54 322)"><rect x="44" y="316" width="20" height="9" fill="#8f8574"/><path d="M44 320.5 H64 M51 316 V325 M58 316 V325" stroke="#6f6658" stroke-width="0.8"/></g>
      <ellipse cx="54" cy="327" rx="14" ry="2" fill="#fff" opacity="0.4"/>
      <rect x="86" y="268" width="22" height="3.6" rx="1" fill="#9a8f7c" transform="rotate(8 97 270)"/>
      <rect x="196" y="236" width="9" height="4" rx="2" fill="#c9474f" opacity="0.8"/></g>`;
  }

  // ----------------------------------------------------------------- sand
  function seaweed(x, y, r, big) {
    const cols = ['#4d5a2a', '#5f6b30', '#3f4a24', '#6e5a2e'];
    const n = big ? 6 : 4, sz = big ? 1 : 0.7;
    let s = `<ellipse cx="${f1(x)}" cy="${f1(y + 1.5)}" rx="${f1(9 * sz)}" ry="${f1(2.6 * sz)}" fill="#3e3a22" opacity="0.35"/>`;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * 3.1 + r() * 0.5, l = (6 + r() * 6) * sz, x2 = x + Math.cos(a) * l * (r() < 0.5 ? 1 : -1), y2 = y - Math.sin(a) * l * 0.5;
      s += `<path d="M${f1(x)} ${f1(y)} Q${f1((x + x2) / 2 + (r() - 0.5) * 6)} ${f1((y + y2) / 2 - 3)} ${f1(x2)} ${f1(y2)}" stroke="${U.pick(r, cols)}" stroke-width="${f1(2.2 * sz + 0.4)}" fill="none" stroke-linecap="round"/>`;
    }
    for (let k = 0; k < 3; k++) s += dot(x + (r() - 0.5) * 12 * sz, y - r() * 3, 1.1 * sz + 0.3, '#7a6a32');
    return s;
  }
  function sand(st) {
    const p = pend(st, 'sand');
    const wet = U.shade(K.sand, -0.13);
    let s = `<g data-part="sand"><path d="${SAND_D}" fill="${K.sand}"/><path d="${SAND_D}" fill="${url('Speck')}"/>
      <g clip-path="${url('SandClip')}"><path d="${SHORE_D}" stroke="${wet}" stroke-width="40" fill="none" opacity="0.28"/><path d="${SHORE_D}" stroke="${wet}" stroke-width="20" fill="none" opacity="0.7"/></g>`;
    const tidy = st.sand && !p;
    if (tidy || (st.sand && SEASON === 'winter' && p !== 'snow')) {
      // raked in long, neat sweeps that follow the water's edge
      s += `<g clip-path="${url('SandClip')}" mask="url(#${id('RakeFade')})" pointer-events="none">`;
      for (let i = 0; i < 12; i++) {
        const dx = i % 2 ? 3 : 0, dy = 24 + i * 9.5;
        s += `<path d="${SHORE_D}" transform="translate(${dx} ${dy})" stroke="${U.shade(K.sand, -0.13)}" stroke-width="1.1" fill="none"/>
          <path d="${SHORE_D}" transform="translate(${dx} ${f1(dy + 1.4)})" stroke="#fff" stroke-width="0.6" fill="none" opacity="0.45"/>`;
      }
      s += '</g>';
    }
    if (!st.sand || p === 'grow') {
      const r = U.rng(st.sand ? 22 : 21);
      const n = st.sand ? 6 : 15;
      for (let i = 0; i < n; i++) {
        const [x, y] = along(SHORE, 0.25 + (i / n) * 2.0 + r() * 0.08);
        if (x > 252) continue;
        s += seaweed(x + (r() - 0.5) * 8, y + 12 + r() * 10, r, r() < 0.5);
      }
      if (!st.sand) for (let i = 0; i < 6; i++) s += seaweed(200 + r() * 150, 360 + r() * 80, r, false);
    }
    if (p === 'leaves') s += `<path d="${DRIFT_D}" fill="${url('Leaves')}" opacity="0.9"/><path d="${DRIFT_D}" fill="${url('Leaves')}" transform="translate(11 7)" opacity="0.6"/>`;
    else if (p === 'snow' || p === 'frost') s += `<path d="${DRIFT_D}" fill="${url('Snow')}" opacity="0.92"/>`;
    if (SEASON === 'winter' && p !== 'snow' && p !== 'frost') {
      const r = U.rng(23);
      for (let i = 0; i < 9; i++) s += `<ellipse cx="${f1(200 + r() * 190)}" cy="${f1(330 + r() * 120)}" rx="${f1(10 + r() * 16)}" ry="${f1(3 + r() * 3)}" fill="${SNOW}" opacity="0.85"/>`;
    }
    if (SEASON === 'autumn') {
      // driftwood the storms brought in
      s += `<path d="M314 386 Q336 380 362 384" stroke="#cfc4b0" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M340 382 l8 -7" stroke="#cfc4b0" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M318 385 Q336 381 360 384" stroke="#a89c86" stroke-width="0.8" fill="none"/>`;
    }
    // the foam where the waves run up the sand
    s += `<g class="cv-foam" pointer-events="none"><path d="${SHORE_D}" stroke="#fff" stroke-width="2.6" fill="none" opacity="0.85" stroke-dasharray="14 6 26 8" transform="translate(0 -2.5)"/>
      <path d="${SHORE_D}" stroke="#fff" stroke-width="1.4" fill="none" opacity="0.55" stroke-dasharray="8 10 20 6" transform="translate(-2 -9)"/></g>`;
    return s + '</g>';
  }

  // --------------------------------------------------------------- rocks
  function rocks() {
    let s = `<path d="${ROCKS_D}" fill="#8b8279"/><path d="${ROCKS_D}" fill="${url('Rock')}"/>`;
    const boulders = [[300, 262, 26, 15], [380, 240, 28, 16], [282, 300, 24, 15], [396, 312, 22, 18], [312, 334, 26, 9], [366, 336, 22, 8], [346, 238, 20, 11]];
    for (const [x, y, rx, ry] of boulders) {
      s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#7a7168"/><ellipse cx="${x - rx * 0.15}" cy="${y - ry * 0.3}" rx="${f1(rx * 0.8)}" ry="${f1(ry * 0.6)}" fill="#a0978c"/>
        <ellipse cx="${x - rx * 0.3}" cy="${y - ry * 0.45}" rx="${f1(rx * 0.35)}" ry="${f1(ry * 0.25)}" fill="#bdb4a8"/>`;
      if (SEASON === 'winter') s += `<ellipse cx="${x - rx * 0.1}" cy="${f1(y - ry * 0.62)}" rx="${f1(rx * 0.7)}" ry="${f1(ry * 0.3)}" fill="${SNOW}"/>`;
    }
    // weed and barnacles where the tide reaches
    s += `<path d="M262 292 Q272 300 270 312 M276 268 q6 6 2 14" stroke="#4d5a2a" stroke-width="2.4" fill="none" opacity="0.7" stroke-linecap="round"/>
      <g class="cv-foam" pointer-events="none"><path d="M260 286 C268 264 284 252 302 242 C318 224 350 214 376 218 C394 222 406 232 412 246" stroke="#fff" stroke-width="2.2" fill="none" opacity="0.8" stroke-dasharray="10 6 18 7" transform="translate(-3 -2)"/></g>`;
    return s;
  }

  function starfish(x, y, R, col) {
    let d = '';
    for (let k = 0; k < 10; k++) {
      const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? R * 0.42 : R;
      d += `${k ? 'L' : 'M'}${f1(x + Math.cos(a) * rr)} ${f1(y + Math.sin(a) * rr)} `;
    }
    return `<path d="${d}Z" fill="${col}" stroke="${U.shade(col, -0.25)}" stroke-width="0.6" stroke-linejoin="round"/>${dot(x, y, R * 0.18, '#ffd9b0')}`;
  }
  function crab(x, y) {
    return `<g><path d="M${x - 5} ${y + 1} l-3 2 M${x - 4} ${y + 2.4} l-2.4 2.6 M${x + 5} ${y + 1} l3 2 M${x + 4} ${y + 2.4} l2.4 2.6" stroke="#b8433f" stroke-width="0.9"/>
      <path d="M${x - 4} ${y - 1} q-3 -3 -5 -4 M${x + 4} ${y - 1} q3 -3 5 -4" stroke="#c94b45" stroke-width="1.1" fill="none"/>
      ${dot(x - 9.4, y - 5.6, 2, '#d9534f')}${dot(x + 9.4, y - 5.6, 2, '#d9534f')}
      <ellipse cx="${x}" cy="${y}" rx="5.2" ry="3.4" fill="#d9534f"/><ellipse cx="${x - 1}" cy="${y - 1}" rx="2.6" ry="1.4" fill="#ec7a6e"/>
      <path d="M${x - 1.6} ${y - 3} v-2.4 M${x + 1.6} ${y - 3} v-2.4" stroke="#b8433f" stroke-width="0.7"/>${dot(x - 1.6, y - 5.6, 0.8, '#222')}${dot(x + 1.6, y - 5.6, 0.8, '#222')}</g>`;
  }
  function rockpool(st) {
    const p = pend(st, 'rockpool');
    let s = `<g data-part="rockpool"><ellipse cx="330" cy="317" rx="34" ry="14" fill="#6d655c"/><ellipse cx="330" cy="315" rx="31.5" ry="11.6" fill="#57514a"/>`;
    if (st.rockpool) {
      s += `<ellipse cx="330" cy="315.5" rx="29.5" ry="10" fill="${url('Pool')}"/>
        ${dot(312, 318, 1.6, '#c9bfae')}${dot(347, 320, 1.4, '#e0d6c4')}${dot(338, 311, 1.2, '#b8ae9d')}
        ${starfish(318, 316, 5.6, '#f08a4b')}${crab(343, 316)}
        <path d="M309 311 q8 -3 16 -2" stroke="#fff" stroke-width="1.4" fill="none" opacity="0.6"/>`;
      if (p === 'grow') s += `<ellipse cx="330" cy="315.5" rx="29.5" ry="10" fill="#7d8450" opacity="0.6"/>`;
      else if (p === 'snow' || p === 'frost') s += `<ellipse cx="330" cy="315.5" rx="29.5" ry="10" fill="${url('Frost')}" opacity="0.88"/><path d="M314 314 l8 3 M334 312 l9 4" stroke="#fff" stroke-width="0.8"/>`;
      else if (p === 'leaves') s += `<ellipse cx="322" cy="314" rx="3.6" ry="1.6" fill="#d9822b" transform="rotate(20 322 314)"/><ellipse cx="338" cy="318" rx="3.4" ry="1.5" fill="#c4462f"/>`;
    } else {
      // murky, scummy and full of rubbish
      s += `<ellipse cx="330" cy="315.5" rx="29.5" ry="10" fill="#6f774a"/>
        <ellipse cx="330" cy="315.5" rx="29.5" ry="10" fill="none" stroke="#56702f" stroke-width="2.2" opacity="0.8"/>
        ${dot(318, 313, 2.2, '#8f9460', 0.9)}${dot(326, 318, 1.6, '#8f9460', 0.9)}${dot(341, 312, 2.6, '#9a9b66', 0.9)}${dot(348, 318, 1.4, '#8f9460', 0.9)}
        <rect x="333" y="314" width="8" height="4" rx="1" fill="#b0b5b9" transform="rotate(-18 337 316)"/>
        <path d="M312 320 q6 -2 10 1" stroke="#9a9b66" stroke-width="1" fill="none"/>`;
    }
    return s + '</g>';
  }

  // ---------------------------------------------------------- lighthouse
  const TW = { yb: 236, yt: 100, xb0: 326, xb1: 370, xt0: 334, xt1: 362 };
  const twx = (y, right) => {
    const t = (TW.yb - y) / (TW.yb - TW.yt);
    return right ? TW.xb1 + (TW.xt1 - TW.xb1) * t : TW.xb0 + (TW.xt0 - TW.xb0) * t;
  };
  const TOWER_D = `M${TW.xb0} ${TW.yb} L${TW.xt0} ${TW.yt} H${TW.xt1} L${TW.xb1} ${TW.yb}Z`;
  function lighthouse(st, C) {
    const p = pend(st, 'lighthouse'), ok = st.lighthouse;
    const band = ok ? C.stripes : U.mix(C.stripes, '#a59e90', 0.62), white = ok ? '#fbf7ee' : '#d2cbbb';
    let s = `<g data-part="lighthouse">
      <path d="M316 250 L321 233 H375 L380 250Z" fill="#8d867a"/><path d="M321 233 H375 L376 238 H320Z" fill="#c2bbad"/>`;
    const N = 5;
    for (let i = 0; i < N; i++) {
      const y0 = TW.yb - ((TW.yb - TW.yt) * i) / N, y1 = TW.yb - ((TW.yb - TW.yt) * (i + 1)) / N;
      s += `<path d="${quad([twx(y0, 0), y0], [twx(y1, 0), y1], [twx(y1, 1), y1], [twx(y0, 1), y0])}" fill="${i % 2 ? white : band}"/>`;
    }
    s += `<path d="${TOWER_D}" fill="${url('Cyl')}"/>`;
    // the door at the foot and two little windows
    s += `<path d="M341 236 V223 a7 7 0 0 1 14 0 V236Z" fill="${ok ? '#4e7b5b' : '#6f6a60'}"/><circle cx="352" cy="230" r="0.9" fill="${ok ? '#e9c35a' : '#8a8478'}"/>
      <rect x="345" y="178" width="6" height="10" rx="3" fill="#3d4a55"/><rect x="345.5" y="138" width="5" height="9" rx="2.5" fill="#3d4a55"/>`;
    if (!ok) {
      // rust has run down from the gallery and the paint has flaked away
      s += `<path d="M338 101 q-1 14 1 30 M350 101 q2 10 0 22 M358 101 q-1 18 2 40" stroke="#9a5a32" stroke-width="2" fill="none" opacity="0.55" stroke-linecap="round"/>
        <path d="M331 196 q5 -3 9 1 q-2 6 -8 5z M356 152 q6 -2 8 3 l-6 3z M335 128 q4 1 5 5 l-5 -1z" fill="#b5ad9d"/>
        <path d="M344 206 l3 5 l-2 4" stroke="#6f6658" stroke-width="0.7" fill="none"/>`;
    } else {
      s += `<path d="M333 108 V228" stroke="#fff" stroke-width="2" opacity="0.18"/>`;
    }
    // the base the lantern stands on, and the gallery floor
    s += `<rect x="333" y="85" width="30" height="10" fill="#4a4a50"/><rect x="326" y="94" width="44" height="6" rx="1" fill="#3d3d42"/>`;
    if (p === 'grow') s += VEIL(TOWER_D);
    if (p === 'snow' || p === 'frost' || SEASON === 'winter') s += `<path d="M316 251 Q320 244 330 245 Q348 241 366 245 Q376 244 380 251Z" fill="${SNOW}"/>`;
    if (p === 'leaves') s += `<path d="M318 248 H378 V251 H318Z" fill="${url('Leaves')}"/>`;
    return s + '</g>';
  }
  // the lamp room on top: the lantern job
  function lantern(st) {
    const p = pend(st, 'lantern'), ok = st.lantern;
    let s = `<g data-part="lantern"><rect x="335" y="68" width="26" height="18" fill="${ok ? '#fff3c4' : '#5d5a50'}"/>`;
    if (ok) {
      s += `<ellipse cx="348" cy="77" rx="7.5" ry="7" fill="${url('Lens')}"/>
        <ellipse cx="348" cy="77" rx="5" ry="4.6" fill="none" stroke="#e9a83c" stroke-width="0.6"/><ellipse cx="348" cy="77" rx="2.6" ry="2.4" fill="none" stroke="#e9a83c" stroke-width="0.6"/>
        <path d="M337 84 l6 -14" stroke="#fff" stroke-width="2" opacity="0.5"/>`;
    } else {
      s += `<ellipse cx="348" cy="77" rx="6" ry="5.6" fill="#8a857a"/><path d="M337 70 l6 10 M353 69 l7 10 M339 84 l12 -2" stroke="#8e8a7c" stroke-width="2" opacity="0.65"/>`;
    }
    s += `<path d="M335 68 H361 M335 86 H361 M341.5 68 V86 M354.5 68 V86" stroke="#3d3d42" stroke-width="1.3" fill="none"/>
      <path d="M332 68 Q348 46 364 68Z" fill="${ok ? '#3d3d42' : '#5a5650'}"/><path d="M336 66 Q348 52 360 66" stroke="#fff" stroke-width="1" fill="none" opacity="0.15"/>
      <circle cx="348" cy="52" r="2.6" fill="#3d3d42"/><path d="M348 49 V41" stroke="#3d3d42" stroke-width="1"/>`;
    if (!ok) s += `<path d="M362 68 l2 -4 l3 1" stroke="#9a5a32" stroke-width="1" fill="none" opacity="0.7"/>`;
    if (p === 'grow') s += `<rect x="335" y="68" width="26" height="18" fill="#6f6a5e" opacity="0.5"/>`;
    if (p === 'frost' || p === 'snow') s += `<rect x="335" y="68" width="26" height="18" fill="${url('Frost')}" opacity="0.85"/>`;
    if (p === 'snow' || p === 'frost' || SEASON === 'winter') s += `<path d="M333 66 Q348 47 363 66 Q356 60 348 61.5 Q340 60 333 66Z" fill="${SNOW}"/>`;
    return s + '</g>';
  }
  // the gallery railing goes in front of the lamp room
  function railing(st) {
    const ok = st.lighthouse;
    let s = `<g data-part="lighthouse"><path d="M328 84 H${ok ? 368 : 352}" stroke="#3d3d42" stroke-width="1.6"/>`;
    for (let x = 330; x <= 366; x += 6) {
      if (!ok && x === 360) { s += `<path d="M${x} 94 l5 -8" stroke="#3d3d42" stroke-width="1"/>`; continue; }
      if (!ok && x === 366) continue;
      s += `<path d="M${x} 84 V94" stroke="#3d3d42" stroke-width="1"/>`;
    }
    if (!ok) s += `<path d="M352 84 q5 3 9 1" stroke="#3d3d42" stroke-width="1.4" fill="none"/>`;
    if (SEASON === 'winter' || PEND.lighthouse === 'snow') s += `<rect x="326" y="92" width="44" height="2.6" rx="1.3" fill="${SNOW}"/>`;
    return s + '</g>';
  }

  // ------------------------------------------------------------- jetty
  function jetty(st) {
    const p = pend(st, 'jetty'), ok = st.jetty;
    const wood = ok ? '#c99a62' : '#8f8a7e', light = ok ? '#dcb07a' : '#a39e92', dark = ok ? '#7e5430' : '#625d54';
    // the whole deck answers a tap, gaps included
    let s = `<g data-part="jetty"><path d="${JET_D}" fill="#000" fill-opacity="0"/>`;
    // posts stand in the water along both sides
    for (const t of [0.28, 0.5, 0.72, 0.95]) {
      for (const side of [0, 1]) {
        if (!ok && t === 0.95 && side === 0) continue;
        const [x, y] = lerp2(side ? JET.r0 : JET.l0, side ? JET.r1 : JET.l1, t);
        const h = 14 * (1 - t * 0.55), w = 3.4 * (1 - t * 0.45);
        const lean = !ok && t === 0.5 && side === 1 ? ` transform="rotate(16 ${f1(x)} ${f1(y)})"` : '';
        s += `<g${lean}><rect x="${f1(x - w / 2)}" y="${f1(y - 3)}" width="${f1(w)}" height="${f1(h)}" fill="${dark}"/>${p === 'grow' ? `<rect x="${f1(x - w / 2)}" y="${f1(y - 3 + h * 0.55)}" width="${f1(w)}" height="${f1(h * 0.45)}" fill="#5d7a3a"/>` : ''}</g>
          <ellipse cx="${f1(x)}" cy="${f1(y - 3 + h)}" rx="${f1(w * 1.5)}" ry="${f1(w * 0.45)}" fill="#ffffff" opacity="0.35"/>`;
      }
    }
    // the deck, plank by plank; an old one has gaps where the sea shows through
    const N = 18;
    const T = (i) => 1 - Math.pow(1 - i / N, 1.35);
    if (ok) s += `<path d="${JET_D}" fill="#6e4a2c"/>`;
    for (let i = 0; i < N; i++) {
      if (!ok && (i === 5 || i === 9 || i === 10 || i === 14)) continue;
      const a = T(i), b = T(i + 1) - (T(i + 1) - T(i)) * (ok ? 0.1 : 0.18);
      s += `<path d="${quad(lerp2(JET.l0, JET.l1, a), lerp2(JET.r0, JET.r1, a), lerp2(JET.r0, JET.r1, b), lerp2(JET.l0, JET.l1, b))}" fill="${i % 3 === 1 ? light : wood}"/>`;
    }
    s += `<path d="M${JET.l0[0]} ${JET.l0[1]} L${JET.l1[0]} ${JET.l1[1]}" stroke="${dark}" stroke-width="1.6"/><path d="M${JET.r0[0]} ${JET.r0[1]} L${JET.r1[0]} ${JET.r1[1]}" stroke="${dark}" stroke-width="2.2"/>`;
    if (ok) {
      // a bollard and a coil of rope at the end
      s += `<rect x="151" y="219" width="3.4" height="5" rx="1" fill="#3d3d42"/><ellipse cx="146" cy="226" rx="3.4" ry="1.4" fill="none" stroke="#d9c49a" stroke-width="1.2"/>`;
    } else {
      // a broken plank sticking up
      const m = lerp2(JET.l0, JET.l1, 0.45);
      s += `<rect x="${f1(m[0] + 2)}" y="${f1(m[1] - 9)}" width="14" height="3.4" rx="0.8" fill="${light}" transform="rotate(-24 ${f1(m[0] + 9)} ${f1(m[1] - 7)})"/>`;
    }
    if (p === 'snow' || p === 'frost') s += `<path d="${JET_D}" fill="${url('Snow')}" opacity="0.92"/>`;
    else if (p === 'leaves') s += `<path d="${JET_D}" fill="${url('Leaves')}"/>`;
    else if (p === 'grow') s += VEIL(JET_D);
    else if (ok && SEASON === 'winter') s += `<path d="M112 331 L141 222 L144 222 L117 330Z" fill="${SNOW}" opacity="0.9"/>`;
    return s + '</g>';
  }

  // -------------------------------------------------------------- boat
  // drawn around its middle; the upturned old hull, or a boat the right way
  // up in bare wood or the chosen colour
  function boatOld() {
    return `<ellipse cx="0" cy="8" rx="37" ry="3.2" fill="#00000026"/>
      <path d="M-44 11 L-16 16" stroke="#8a7a64" stroke-width="2"/><ellipse cx="-47" cy="10" rx="5.4" ry="2.2" fill="#8a7a64" transform="rotate(12 -47 10)"/>
      <path d="M-34 6 Q-30 -8 -14 -11 L20 -11 Q32 -9 34 4Z" fill="#6f7d72"/>
      <path d="M-34 6 Q-30 -8 -14 -11 L20 -11 Q32 -9 34 4" stroke="#56635a" stroke-width="1.2" fill="none"/>
      <path d="M-31 0 Q0 -6 31 -1 M-24 -6 Q0 -10 27 -6" stroke="#5d6b60" stroke-width="0.8" fill="none"/>
      <path d="M-33 5 Q-20 1 -8 4 Q4 7 14 3 Q26 0 33 4Z" fill="#6f8a3e" opacity="0.65"/>
      ${[[-22, -6], [-18, -2], [-6, -8], [2, -4], [10, -9], [16, -5], [24, -2], [-12, 0]].map(([x, y]) => `${dot(x, y, 1.6, '#e6e1d3')}${dot(x, y, 0.6, '#7d7a70')}`).join('')}`;
  }
  function boatInside(look) {
    return `<ellipse cx="0" cy="10" rx="36" ry="3" fill="#00000026"/>
      <path d="M-34 -9 Q-2 -3 31 -6 L29 -10.5 Q0 -7.5 -31 -13.5Z" fill="${look === 'paint' ? '#d6ad78' : '#b0844f'}"/>
      <path d="M-12 -5 l2 -6 M10 -4.6 l1 -5.6" stroke="#8a5a3c" stroke-width="2.4"/>
      <path d="M-8 -9 L24 -17" stroke="#d9b07a" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="27" cy="-17.8" rx="4" ry="1.6" fill="#d9b07a" transform="rotate(-14 27 -17.8)"/>`;
  }
  function boatHull(look, col) {
    const hull = look === 'paint' ? col : '#c99a62';
    return `<path d="M-34 -9 Q-28 5 -12 8 L20 8 Q29 6 31 -6 Q-2 -3 -34 -9Z" fill="${hull}"/>
      <path d="M-30 1 Q0 5 28 2" stroke="${U.shade(hull, -0.22)}" stroke-width="0.7" fill="none"/>
      <path d="M-33 -6.6 Q-2 -0.6 30.5 -3.6" stroke="${look === 'paint' ? '#fbf7ee' : U.shade(hull, 0.18)}" stroke-width="${look === 'paint' ? 2.4 : 1}" fill="none"/>
      <path d="M-34 -9 Q-2 -3 31 -6" stroke="${U.shade(hull, -0.35)}" stroke-width="1.4" fill="none"/>
      ${look === 'paint' ? '<path d="M-24 2 Q-4 5 12 4" stroke="#fff" stroke-width="1.2" fill="none" opacity="0.35"/>' : ''}`;
  }
  function boat(st, C) {
    const look = st.boatPaint ? 'paint' : st.boat ? 'wood' : 'old';
    const pb = pend(st, 'boat'), pp = pend(st, 'boatPaint');
    const afloat = look === 'paint' && st.jetty;
    const [x, y, sc] = afloat ? [180, 228, 0.5] : look === 'old' ? [226, 322, 1] : [226, 306, 1];
    let s = '';
    if (afloat) s += `<ellipse cx="${x}" cy="${y + 5}" rx="22" ry="3" fill="#fff" opacity="0.3"/><path d="M${x - 24} ${y + 7} q6 -2 12 0 M${x + 10} ${y + 8} q6 -2 12 0" stroke="#fff" stroke-width="0.8" fill="none" opacity="0.6"/>`;
    s += `<g transform="translate(${x} ${y}) scale(${sc})"><g${afloat ? ' class="cv-bob"' : ''}>`;
    if (look === 'old') {
      s += `<g data-part="boat">${boatOld()}</g>`;
    } else {
      s += `<g data-part="boat">${boatInside(look)}${look === 'wood' ? boatHull('wood') : ''}</g>`;
      if (look === 'paint') s += `<g data-part="boatPaint">${boatHull('paint', C.boat)}</g>`;
    }
    if (pb === 'grow' || pp === 'grow') s += `<path d="M-34 -9 Q-28 5 -12 8 L20 8 Q29 6 31 -6 Q-2 -3 -34 -9Z" fill="#cfc6b6" opacity="0.5"/>${[[-20, 2], [-8, 4], [6, 3], [18, 1]].map(([a, b]) => dot(a, b, 1.4, '#e6e1d3')).join('')}`;
    if (pb === 'snow' || pb === 'frost' || pp === 'snow' || pp === 'frost' || (SEASON === 'winter' && !afloat)) {
      s += look === 'old' ? `<path d="M-30 -2 Q-26 -10 -14 -12.5 L20 -12.5 Q30 -10 31 -3 Q20 -8 0 -7.6 Q-20 -8 -30 -2Z" fill="${SNOW}"/>` : `<path d="M-31 -12.4 Q0 -8.6 29 -9.6 L30 -7 Q0 -5 -32 -10Z" fill="${SNOW}"/>`;
    }
    if (pb === 'leaves' || pp === 'leaves') s += `<ellipse cx="-8" cy="-8" rx="3.6" ry="1.6" fill="#d9822b" transform="rotate(20 -8 -8)"/><ellipse cx="8" cy="-9" rx="3.2" ry="1.5" fill="#c4462f"/>`;
    s += '</g></g>';
    if (look !== 'paint') {
      // the paint waiting for the boat: the boat-painting job
      const rusty = !st.boat;
      s += `<g data-part="boatPaint"><ellipse cx="238" cy="345" rx="7" ry="1.8" fill="#00000022"/>
        <rect x="232" y="333" width="12" height="11" fill="${rusty ? '#8f8a80' : '#b8c0c8'}"/><ellipse cx="238" cy="333" rx="6" ry="1.8" fill="${rusty ? '#a39e92' : '#d4dadf'}"/>
        <rect x="232" y="336.5" width="12" height="4.6" fill="${rusty ? U.mix(C.boat, '#8f8a80', 0.6) : C.boat}"/>
        ${rusty ? '<path d="M234 338 v5 M241 340 v4" stroke="#9a5a32" stroke-width="0.9" opacity="0.8"/>' : ''}
        <path d="M228 331 l20 -5" stroke="#c98a55" stroke-width="1.6" stroke-linecap="round"/><rect x="246" y="323.5" width="5" height="3.2" rx="0.8" fill="#3d3d42" transform="rotate(-14 248.5 325)"/></g>`;
    }
    return s;
  }

  // --------------------------------------------------------------- hut
  function lifeRing(x, y, col) {
    return `<path d="M${x} ${y - 9} V${y - 6.5}" stroke="#3d3d42" stroke-width="0.8"/><circle cx="${x}" cy="${y}" r="5.6" fill="none" stroke="#fbf7ee" stroke-width="3.2"/>
      <circle cx="${x}" cy="${y}" r="5.6" fill="none" stroke="${col}" stroke-width="3.2" stroke-dasharray="4.4 4.4"/>`;
  }
  function hut(st, C) {
    const p = pend(st, 'hut'), ok = st.hut;
    const trim = ok ? '#fbf7ee' : '#a9a497', post = ok ? '#8a5a3c' : '#6f6a60';
    let s = `<g data-part="hut"><ellipse cx="118" cy="437" rx="78" ry="6" fill="#00000022"/>`;
    for (const x of [58, 74, 106, 122]) s += `<rect x="${x - 2}" y="413" width="4" height="23" fill="${post}"/>`;
    for (const x of [148, 182]) s += `<rect x="${x - 2}" y="418" width="4" height="18" fill="${post}"/>`;
    s += `<path d="${HUT_D}" fill="${ok ? url('Boards') : url('BoardsOld')}"/>
      <rect x="54" y="410" width="72" height="5" fill="${ok ? U.shade(C.hut, -0.3) : '#8c877b'}"/>
      <path d="M55.5 368 V414 M124.5 368 V414" stroke="${trim}" stroke-width="3"/>`;
    // roof: thick boards over the gable, a white trim underneath
    s += `<path d="M43 372 L90 332 L137 372" stroke="${ok ? '#e9e1d0' : '#86817a'}" stroke-width="10" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M48 375.5 L90 340 L132 375.5" stroke="${trim}" stroke-width="2.2" fill="none" stroke-linejoin="round"/>`;
    if (!ok) s += `<path d="M58 360 l7 -6 l3 4z M104 349 l6 4 l-4 4z" fill="#3d3a36"/>`;
    // the door
    s += `<rect x="79" y="377" width="22" height="37" rx="1" fill="${ok ? '#fbf7ee' : '#a8a397'}"/>
      <rect x="82" y="380" width="16" height="13" rx="1" fill="none" stroke="${ok ? U.shade(C.hut, -0.1) : '#8f8a7e'}" stroke-width="1"/>
      <rect x="82" y="396" width="16" height="15" rx="1" fill="none" stroke="${ok ? U.shade(C.hut, -0.1) : '#8f8a7e'}" stroke-width="1"/>
      <circle cx="97" cy="395" r="1.2" fill="${ok ? '#e9c35a' : '#77705f'}"/>`;
    if (ok) {
      s += `${lifeRing(114, 390, C.stripes)}<path d="M90 332 V318" stroke="#3d3d42" stroke-width="1"/><path class="cv-flag" d="M90 318.5 l10 2.6 l-10 2.6z" fill="${C.stripes}"/>
        <rect x="80" y="368" width="20" height="6" rx="1" fill="#fbf7ee"/><path d="M83 371 h14" stroke="${U.shade(C.hut, -0.3)}" stroke-width="1.2" stroke-dasharray="2 1.4"/>`;
    } else {
      // boarded up, with a board hanging loose and a cobweb
      s += `<g transform="rotate(-14 90 391)"><rect x="72" y="388" width="36" height="5" rx="1" fill="#a08868"/><circle cx="75" cy="390.5" r="0.8" fill="#4a4a50"/><circle cx="105" cy="390.5" r="0.8" fill="#4a4a50"/></g>
        <g transform="rotate(9 90 402)"><rect x="73" y="400" width="34" height="5" rx="1" fill="#947c5e"/></g>
        <g transform="rotate(24 116 378)"><rect x="112" y="366" width="7" height="32" fill="#b0ab9f"/><rect x="118" y="366" width="0.8" height="32" fill="#8c877b"/></g>
        <path d="M101 377 l-7 0 M101 377 l-5 5 M101 377 l0 7 M97 377 q1 2 4 2.4 M99 377 q0 3 2 4" stroke="#e1ddd5" stroke-width="0.5" fill="none"/>`;
    }
    // the deck to the right, with steps down to the sand
    const top = ok ? '#d8ab72' : '#9a9387', edge = ok ? '#9c6c40' : '#757066';
    s += `<path d="M126 405 H187 L185 414 H126Z" fill="${top}"/><path d="M126 409.5 H186" stroke="${U.shade(top, -0.18)}" stroke-width="0.6"/>
      <rect x="126" y="414" width="60" height="5" fill="${edge}"/>
      <path d="M185 419 h10 v5 h-10z M189 424 h10 v5 h-10z M193 429 h10 v5 h-10z" fill="${edge}"/>
      <path d="M185 419 h10 M189 424 h10 M193 429 h10" stroke="${top}" stroke-width="1.6"/>`;
    const rail = ok ? '#fbf7ee' : '#a9a497';
    if (ok) s += `<path d="M126 392 H185" stroke="${rail}" stroke-width="2"/><path d="M130 392 V406 M157 392 V406 M184 392 V406" stroke="${rail}" stroke-width="2"/>`;
    else s += `<path d="M126 392 H150" stroke="${rail}" stroke-width="2"/><path d="M130 392 V406 M157 396 V406" stroke="${rail}" stroke-width="2"/><path d="M184 406 l-7 -12" stroke="${rail}" stroke-width="2"/>`;
    if (p === 'grow') s += VEIL(HUT_D);
    if (p === 'snow' || p === 'frost') s += `<path d="M41 371 L90 329 L139 371 L133 372 L90 336 L47 372Z" fill="${SNOW}"/><path d="M126 403.5 H187 V407 H126Z" fill="${SNOW}"/>`;
    else if (SEASON === 'winter') s += `<path d="M42 370 L90 329.5 L138 370 L134 370 L90 333.5 L46 370Z" fill="${SNOW}"/><path d="M126 404 H187 V406 H126Z" fill="${SNOW}"/>`;
    if (p === 'leaves') s += `<path d="M126 404 H187 L185 414 H126Z" fill="${url('Leaves')}"/>`;
    return s + '</g>';
  }
  function hutWindow(st) {
    const p = pend(st, 'hutWindow'), ok = st.hutWindow;
    const frame = ok ? '#fbf7ee' : '#a9a497';
    let s = `<g data-part="hutWindow"><rect x="57" y="377" width="18" height="21" rx="1" fill="${frame}"/>`;
    if (ok) {
      s += `<rect x="59" y="379" width="14" height="17" fill="#bfe0ee"/>
        <path d="M59 379 h4.5 q-1.4 8 0.6 17 h-5.1z M73 379 h-4.5 q1.4 8 -0.6 17 h5.1z" fill="#f4c2c2"/>
        <path d="M59.6 383 h3.6 M59.6 388 h3.4 M69 383 h3.6 M69.2 388 h3.4" stroke="#e98a7c" stroke-width="0.6"/>
        <rect x="63.5" y="392" width="5" height="4" rx="1" fill="#c8763f"/><circle cx="66" cy="391" r="2.4" fill="#5f9e55"/>
        <path d="M61 395 l9 -15" stroke="#fff" stroke-width="2" opacity="0.35"/>`;
      if (p === 'frost' || p === 'snow') s += `<rect x="59" y="379" width="14" height="17" fill="${url('Frost')}" opacity="0.85"/>`;
      else if (p === 'grow') s += `<rect x="59" y="379" width="14" height="17" fill="${url('Salt')}" opacity="0.7"/>`;
    } else {
      s += `<rect x="59" y="379" width="14" height="17" fill="${url('Salt')}"/>
        ${dot(62, 383, 2.2, '#fff', 0.55)}${dot(69, 390, 2.8, '#fff', 0.5)}${dot(64, 393, 1.6, '#fff', 0.6)}
        <path d="M60 381 l5 6 l-2 4 l4 4" stroke="#7d7a70" stroke-width="0.6" fill="none"/>`;
    }
    s += `<path d="M66 379 V396 M59 387.5 H73" stroke="${frame}" stroke-width="1.6"/><rect x="55" y="397.5" width="22" height="2.6" rx="1" fill="${frame}"/>`;
    if (SEASON === 'winter' || p === 'snow') s += `<rect x="55" y="396.4" width="22" height="2" rx="1" fill="${SNOW}"/>`;
    return s + '</g>';
  }
  function scallop(x, y, col, rot = 0) {
    return `<g transform="rotate(${rot} ${x} ${y})"><path d="M${x} ${y + 2} L${x - 3.6} ${y - 1.8} Q${x} ${y - 5.4} ${x + 3.6} ${y - 1.8}Z" fill="${col}"/>
      <path d="M${x} ${y + 2} V${y - 3.6} M${x} ${y + 2} L${x - 2} ${y - 2.8} M${x} ${y + 2} L${x + 2} ${y - 2.8}" stroke="${U.shade(col, -0.2)}" stroke-width="0.4"/></g>`;
  }
  function shells(st) {
    const p = pend(st, 'shells');
    const full = st.shells && p !== 'grow';
    let s = `<g data-part="shells"><rect x="157" y="393" width="12" height="13" rx="3" fill="#dff1f4" opacity="${full ? 0.6 : 0.45}" stroke="#b8d6dc" stroke-width="0.8"/><rect x="158" y="390.5" width="10" height="3" rx="1" fill="#c98a55"/>`;
    if (full) {
      s += `${scallop(160.5, 402, '#f6c6c0')}${scallop(165.5, 403, '#f3e3c8', 20)}${scallop(163, 398.6, '#fbd2a8', -16)}
        ${scallop(136, 409, '#f6c6c0')}${scallop(143, 410, '#fbf0de', 12)}${scallop(150, 409, '#fbd2a8', -8)}
        <path d="M174 410 q4 -5 9 -2 q-3 4 -9 2z" fill="#f3d1b5" stroke="#d9a982" stroke-width="0.5"/>${starfish(178.5, 397, 4.2, '#f08a4b')}`;
    } else if (!st.shells) {
      s += `<rect x="157" y="393" width="12" height="13" rx="3" fill="#cfc6b6" opacity="0.35"/>`;
    }
    if (SEASON === 'winter' || p === 'snow') s += `<ellipse cx="163" cy="390.5" rx="6" ry="1.6" fill="${SNOW}"/>`;
    return s + '</g>';
  }

  // ------------------------------------------------------------ castle
  function castle(st, C) {
    const p = pend(st, 'castle'), ok = st.castle && p !== 'grow';
    const sc = U.shade(K.sand, -0.05), dk = U.shade(K.sand, -0.2);
    let s = `<g data-part="castle"><ellipse cx="276" cy="415" rx="31" ry="5" fill="#00000018"/>`;
    if (ok) {
      s += `<ellipse cx="276" cy="413.5" rx="28" ry="5.6" fill="none" stroke="${U.shade(K.sand, -0.24)}" stroke-width="2.2"/>
        <rect x="258" y="399" width="36" height="13" fill="${sc}"/><path d="M258 399 h36" stroke="${dk}" stroke-width="0.6"/>`;
      for (const [x, top, w] of [[263, 387, 10], [276, 377, 12], [289, 387, 10]]) {
        s += `<path d="M${x - w / 2 - 1} 412 L${x - w / 2} ${top} H${x + w / 2} L${x + w / 2 + 1} 412Z" fill="${sc}"/>
          <path d="M${x - w / 2} ${top + 6} h${w} M${x - w / 2 - 0.4} ${top + 13} h${w + 0.8}" stroke="${dk}" stroke-width="0.6"/>
          <path d="M${x - w / 2} ${top} v-2.6 h2.6 v2.6 M${x - 1.3} ${top} v-2.6 h2.6 v2.6 M${x + w / 2 - 2.6} ${top} v-2.6 h2.6 v2.6" fill="${sc}"/>`;
      }
      s += `<path d="M273 412 v-5 a3 3 0 0 1 6 0 v5Z" fill="${dk}"/>${dot(265, 404, 1.2, '#f6c6c0')}${dot(287, 405, 1.1, '#fbf0de')}${dot(276, 392, 1, '#f6c6c0')}
        <path d="M276 374.4 V362" stroke="#6b4a32" stroke-width="0.9"/><path class="cv-flag" d="M276 362.5 l9 2.6 l-9 2.6z" fill="${C.stripes}"/>
        <path d="M300 411 l2 -9 h7 l2 9z" fill="#e0485a"/><path d="M301 402 q5 -5 10 0" stroke="#b8433f" stroke-width="0.8" fill="none"/>
        <path d="M249 412 l4 -14" stroke="#3d86c6" stroke-width="1.8" stroke-linecap="round"/><path d="M252 400 l3 -8 l3 1.6 l-3 7z" fill="#5aa6dc"/>`;
      if (p === 'snow' || p === 'frost' || SEASON === 'winter') s += `<ellipse cx="263" cy="385.4" rx="5.6" ry="1.6" fill="${SNOW}"/><ellipse cx="276" cy="375.4" rx="6.6" ry="1.8" fill="${SNOW}"/><ellipse cx="289" cy="385.4" rx="5.6" ry="1.6" fill="${SNOW}"/>`;
      if (p === 'leaves') s += `<ellipse cx="268" cy="398" rx="3.6" ry="1.6" fill="#d9822b" transform="rotate(20 268 398)"/><ellipse cx="284" cy="410" rx="3.2" ry="1.5" fill="#c4462f"/>`;
    } else {
      // a slumped heap where the tide got to it, and a squashed bucket
      s += `<path d="M252 413 Q255 400 264 397 Q270 388 279 392 Q290 392 293 401 Q299 406 300 413Z" fill="${sc}"/>
        <path d="M262 405 q6 -3 12 0 M278 399 q5 -2 9 1" stroke="${dk}" stroke-width="0.8" fill="none"/>
        <path d="M304 412 l3 -7 l9 3 l-4 6z" fill="#7d9ab3"/><path d="M304 412 l8 2" stroke="#5d7a93" stroke-width="0.8"/>
        <path d="M246 413 l10 -3" stroke="#8a8f96" stroke-width="1.6"/>`;
      if (p === 'grow') s += `<path d="M266 400 v-7 h6 v7Z" fill="${sc}"/>`;
    }
    return s + '</g>';
  }

  // ----------------------------------------------------- litter, or a bin
  const LITTER = [
    (x = 222, y = 368) => `<g transform="rotate(28 ${x} ${y})"><rect x="${x - 7}" y="${y - 2.6}" width="11" height="5.2" rx="2" fill="#4f8a5a"/><rect x="${x + 3.6}" y="${y - 1.3}" width="4.6" height="2.6" rx="0.8" fill="#4f8a5a"/><rect x="${x - 5}" y="${y - 1.8}" width="6" height="1.2" rx="0.6" fill="#fff" opacity="0.45"/></g>`,
    (x = 240, y = 434) => `<g transform="rotate(-20 ${x} ${y})"><path d="M${x - 8} ${y} q0 -4 5 -4 h7 q4 0 4 4 q0 4 -4 4 h-7 q-5 0 -5 -4z" fill="#ef8aa6"/><path d="M${x - 2} ${y - 3.6} l5 3.6 l-5 3.6" stroke="#e0485a" stroke-width="1.2" fill="none"/></g>`,
    (x = 306, y = 374) => `<g transform="rotate(14 ${x} ${y})"><rect x="${x - 4}" y="${y - 2.4}" width="8" height="4.8" rx="1" fill="#c9474f"/><ellipse cx="${x + 4}" cy="${y}" rx="1.2" ry="2.4" fill="#cfd5dc"/><rect x="${x - 3}" y="${y - 1}" width="5" height="1" fill="#fff" opacity="0.6"/></g>`,
    (x = 214, y = 398) => `<g><path d="M${x - 9} ${y} q5 -6 10 -1 q4 5 9 -2 M${x - 7} ${y + 3} q6 -5 12 1 M${x - 4} ${y - 4} l10 8 M${x + 5} ${y - 5} l-8 9" stroke="#e8743a" stroke-width="0.9" fill="none"/>${dot(x - 8, y - 1, 1.8, '#f7c548')}${dot(x + 8, y + 2, 1.8, '#f7c548')}</g>`,
    (x = 334, y = 428) => `<g><path d="M${x - 7} ${y + 3} q-2 -9 4 -10 q4 -1 7 2 q5 4 2 9 q-6 3 -13 -1z" fill="#f1f1ec" opacity="0.85"/><path d="M${x - 3} ${y - 7} q1 -4 3 0 M${x + 3} ${y - 6} q2 -4 3 1" stroke="#dcdcd6" stroke-width="1" fill="none"/></g>`,
    (x = 356, y = 384) => `<g transform="rotate(-8 ${x} ${y})"><rect x="${x - 10}" y="${y - 7}" width="20" height="12" fill="#a08868"/><path d="M${x - 10} ${y - 3} H${x + 10} M${x - 10} ${y + 1} H${x + 2}" stroke="#7d6a52" stroke-width="1"/><path d="M${x + 2} ${y + 1} l8 3" stroke="#a08868" stroke-width="2.4"/></g>`,
    (x = 298, y = 446) => `<g transform="rotate(-50 ${x} ${y})"><rect x="${x - 7}" y="${y - 2.6}" width="11" height="5.2" rx="2" fill="#8a5a2c"/><rect x="${x + 3.6}" y="${y - 1.3}" width="4.6" height="2.6" rx="0.8" fill="#8a5a2c"/></g>`,
    (x = 170, y = 452) => `<g transform="rotate(-30 ${x} ${y})"><rect x="${x - 4}" y="${y - 2.4}" width="8" height="4.8" rx="1" fill="#3d86c6"/><ellipse cx="${x + 4}" cy="${y}" rx="1.2" ry="2.4" fill="#cfd5dc"/></g>`,
  ];
  function beach(st) {
    const p = pend(st, 'beach');
    let s = '<g data-part="beach">';
    if (!st.beach) for (const f of LITTER) s += f();
    else {
      if (p === 'grow') s += LITTER[0]() + LITTER[1]() + LITTER[2]();
      // a little slatted bin keeps it that way
      s += `<ellipse cx="172" cy="453" rx="9" ry="2" fill="#00000022"/><path d="M164.5 436 h15 l-1.4 16 h-12.2z" fill="#a8754e"/>
        <path d="M168.5 437 v14 M172 437 v14 M175.5 437 v14" stroke="#8a5a3c" stroke-width="0.8"/><rect x="163.5" y="434" width="17" height="3.4" rx="1" fill="#7a4a32"/>
        ${dot(172, 444, 2.2, '#9cc5a1')}`;
      if (SEASON === 'winter') s += `<rect x="163.5" y="432.6" width="17" height="2" rx="1" fill="${SNOW}"/>`;
    }
    return s + '</g>';
  }

  function saleSign() {
    if (!(FORSALE || PCT < 0.15)) return '';
    return `<g><rect x="169.5" y="350" width="3" height="30" fill="#8a6142"/><g transform="rotate(-4 171 347)">
      <rect x="146" y="336" width="50" height="22" rx="2" fill="#f6efe0" stroke="#7d6e58" stroke-width="1.2"/>
      <text x="171" y="350" text-anchor="middle" font-family="${FONT}" font-size="8.5" font-weight="900" fill="#3d5a86">FOR SALE</text>
      ${FORSALE ? '' : `<g transform="rotate(-10 171 355)"><rect x="144" y="351" width="54" height="10" fill="#d9534f"/><text x="171" y="359" text-anchor="middle" font-family="${FONT}" font-size="8" font-weight="900" fill="#fff">SOLD</text></g>`}</g></g>`;
  }

  // -------------------------------------------------------------- dunes
  function tuft(x, y, cols, r, h) {
    let s = '';
    for (let k = 0; k < 6; k++) {
      const lean = (k - 2.5) * 2.2 + (r() - 0.5) * 2, l = h * (0.6 + r() * 0.5);
      s += `<path d="M${f1(x + (k - 2.5) * 0.8)} ${f1(y)} q${f1(lean * 0.3)} ${f1(-l * 0.6)} ${f1(lean)} ${f1(-l)}" stroke="${U.pick(r, cols)}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
    }
    return s;
  }
  function dunes(st) {
    const p = pend(st, 'dunes'), ok = st.dunes;
    const r = U.rng(51);
    let s = `<g data-part="dunes"><path d="${DUNE_D}" fill="${url('Dune')}"/>`;
    // ripples the wind leaves
    for (let i = 0; i < 26; i++) {
      const x = r() * 400, y = 482 + r() * 52;
      s += `<path d="M${f1(x)} ${f1(y)} q7 -3 14 0" stroke="${U.shade(K.dune, -0.14)}" stroke-width="0.8" fill="none" opacity="0.5"/>`;
    }
    if (ok) {
      const cols = p === 'grow' ? DRY : GRASS[SEASON];
      for (let i = 0; i < 34; i++) {
        const [x, y] = along(DUNE, (i / 34) * 4 + r() * 0.08);
        s += tuft(x + (r() - 0.5) * 8, y + 4 + r() * 24, cols, r, 11 + r() * 6);
      }
      const thrift = p === 'grow' ? 0 : { spring: 16, summer: 12, autumn: 4, winter: 0 }[SEASON];
      for (let i = 0; i < thrift; i++) {
        const [x, y] = along(DUNE, 0.2 + r() * 3.6);
        const fx = x + (r() - 0.5) * 10, fy = y + 6 + r() * 20, col = SEASON === 'autumn' ? '#c99a8a' : U.pick(r, ['#f2a7c4', '#ef8fb5', '#f7c3d6']);
        s += `<path d="M${f1(fx)} ${f1(fy + 6)} V${f1(fy)}" stroke="#6f9a44" stroke-width="0.9"/>${dot(fx, fy, 2.6, col)}${dot(fx - 0.6, fy - 0.6, 1, '#fff', 0.6)}`;
      }
    } else {
      // bare sand, an old sand fence fallen over and a few dead stalks
      for (let i = 0; i < 12; i++) {
        const [x, y] = along(DUNE, 0.3 + r() * 3.5);
        s += `<path d="M${f1(x)} ${f1(y + 8)} l${f1((r() - 0.5) * 8)} -8" stroke="#a89470" stroke-width="1" stroke-linecap="round"/>`;
      }
      s += `<g transform="rotate(-10 300 486)">${[0, 1, 2, 3, 4, 5, 6].map((k) => `<rect x="${280 + k * 7}" y="${474 + (k % 2) * 3}" width="3" height="18" fill="#9a8a70"/>`).join('')}<path d="M278 480 H330 M278 488 H330" stroke="#7d6e58" stroke-width="0.8"/></g>`;
    }
    if (p === 'snow' || p === 'frost') s += `<path d="${DUNE_D}" fill="${url('Snow')}" opacity="0.9"/>`;
    else if (SEASON === 'winter') {
      s += `<path d="M-4 474 C40 452 82 452 122 466 C150 476 172 472 200 462 C238 450 282 452 322 466 C352 476 382 472 404 462 V470 C382 480 352 484 322 474 C282 460 238 458 200 470 C172 480 150 484 122 474 C82 460 40 460 -4 482Z" fill="${SNOW}"/>`;
    }
    if (p === 'leaves') s += `<path d="M-4 474 C40 452 82 452 122 466 C150 476 172 472 200 462 C238 450 282 452 322 466 C352 476 382 472 404 462 V492 H-4Z" fill="${url('Leaves')}"/>`;
    return s + '</g>';
  }

  // the car park on the dunes where the camper van stands
  function carPark() {
    let s = `<path d="M14 506 Q20 498 40 498 H176 Q190 498 194 506 L198 536 H10Z" fill="${U.shade(K.dune, -0.04)}"/>
      <path d="M30 520 q40 -4 80 0 q30 3 60 -1 M34 528 q40 -4 80 0 q30 3 60 -1" stroke="${U.shade(K.dune, -0.16)}" stroke-width="1.2" fill="none" opacity="0.6"/>`;
    for (const x of [16, 192]) s += `<rect x="${x - 2.4}" y="496" width="4.8" height="14" rx="1.2" fill="#8a6142"/>${SEASON === 'winter' ? `<ellipse cx="${x}" cy="496" rx="3" ry="1.2" fill="${SNOW}"/>` : ''}`;
    s += `<rect x="191" y="486" width="2" height="10" fill="#7d7264"/><rect x="185" y="476" width="14" height="12" rx="2" fill="#3d6fb6"/>
      <text x="192" y="486" text-anchor="middle" font-family="${FONT}" font-size="9.5" font-weight="900" fill="#fff">P</text>`;
    return s;
  }

  // ----------------------------------------------------------- boardwalk
  function boardwalk(st) {
    const p = pend(st, 'boardwalk'), ok = st.boardwalk;
    const r = U.rng(61);
    let s = `<g data-part="boardwalk"><path d="M244 548 C276 506 176 484 198 438" stroke="#000" stroke-opacity="0" stroke-width="22" fill="none"/>`;
    const N = 24;
    for (let i = 0; i < N; i++) {
      if (!ok && (i === 3 || i === 4 || i === 9 || i === 15 || i === 16 || i === 20)) continue;
      const t0 = i / N, t1 = (i + 0.72) / N;
      const a = bez(BW, 0, t0), b = bez(BW, 0, t1);
      const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
      const w0 = 13 - t0 * 5, w1 = 13 - t1 * 5;
      const d = quad([a[0] + nx * w0, a[1] + ny * w0], [a[0] - nx * w0, a[1] - ny * w0], [b[0] - nx * w1, b[1] - ny * w1], [b[0] + nx * w1, b[1] + ny * w1]);
      const col = ok ? (i % 2 ? '#c99a62' : '#bf8f58') : (i % 2 ? '#9a9182' : '#8f877a');
      const broken = !ok && i % 7 === 2 ? ` transform="rotate(14 ${f1((a[0] + b[0]) / 2)} ${f1((a[1] + b[1]) / 2)})"` : '';
      s += `<path d="${d}" fill="${col}" stroke="${ok ? '#8e6037' : '#6f685c'}" stroke-width="0.6"${broken}/>`;
    }
    if (ok) {
      // little rope posts along both sides
      const posts = [0.12, 0.42, 0.72].map((t) => {
        const a = bez(BW, 0, t), b = bez(BW, 0, t + 0.01), len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const nx = -(b[1] - a[1]) / len, ny = (b[0] - a[0]) / len, w = 16 - t * 6;
        return [[a[0] + nx * w, a[1] + ny * w], [a[0] - nx * w, a[1] - ny * w]];
      });
      for (let side = 0; side < 2; side++) {
        for (let k = 0; k < posts.length; k++) {
          const [x, y] = posts[k][side];
          s += `<rect x="${f1(x - 1.6)}" y="${f1(y - 9)}" width="3.2" height="10" rx="1" fill="#8a6142"/>`;
          if (k) { const [x0, y0] = posts[k - 1][side]; s += `<path d="M${f1(x0)} ${f1(y0 - 8)} Q${f1((x0 + x) / 2)} ${f1((y0 + y) / 2 - 3)} ${f1(x)} ${f1(y - 8)}" stroke="#d9c49a" stroke-width="1.1" fill="none"/>`; }
        }
      }
    } else {
      // sand blown over the boards
      for (let i = 0; i < 5; i++) {
        const [x, y] = bez(BW, 0, 0.1 + r() * 0.8);
        s += `<ellipse cx="${f1(x + (r() - 0.5) * 8)}" cy="${f1(y)}" rx="${f1(8 + r() * 6)}" ry="${f1(3 + r() * 2)}" fill="${K.dune}" opacity="0.92"/>`;
      }
    }
    if (p === 'grow') for (let i = 0; i < 3; i++) { const [x, y] = bez(BW, 0, 0.15 + i * 0.3); s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="10" ry="3.6" fill="${K.dune}" opacity="0.9"/>`; }
    if (p === 'snow' || p === 'frost' || (SEASON === 'winter' && ok)) {
      for (let i = 0; i < 6; i++) { const [x, y] = bez(BW, 0, 0.08 + i * 0.16); s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${p ? 12 : 7}" ry="${p ? 4 : 2.4}" fill="${SNOW}"/>`; }
    }
    if (p === 'leaves') for (let i = 0; i < 9; i++) { const [x, y] = bez(BW, 0, 0.05 + i * 0.1); s += `<ellipse cx="${f1(x + (i % 2 ? 4 : -4))}" cy="${f1(y)}" rx="3.4" ry="1.6" fill="${['#d9822b', '#c4462f', '#e9b23c'][i % 3]}" transform="rotate(${i * 37} ${f1(x)} ${f1(y)})"/>`; }
    return s + '</g>';
  }

  // ---------------------------------------------------------- camper van
  const MINT = '#9fd8c4', CREAM = '#f4ecdc';
  function vanColours(st) {
    if (st.van) return { mint: MINT, cream: CREAM };
    return { mint: U.mix(MINT, '#9a9a8c', 0.45), cream: U.mix(CREAM, '#b5ad9c', 0.45) };
  }
  function van(st) {
    const p = pend(st, 'van');
    const { mint, cream } = vanColours(st);
    const line = '#6f8f86';
    let s = `<g data-part="van"><ellipse cx="102" cy="527" rx="72" ry="5" fill="#00000026"/>
      <g clip-path="${url('VanClip')}"><rect x="34" y="464" width="136" height="57" fill="${mint}"/><rect x="34" y="464" width="100" height="25" fill="${cream}"/>
        <path d="M134 464 H170 V489 L151 504 L134 489Z" fill="${cream}"/></g>
      <path d="${VAN_SIDE}" fill="none" stroke="${line}" stroke-width="1"/><path d="${VAN_FRONT}" fill="none" stroke="${line}" stroke-width="1"/>
      <path d="M134 466 V519" stroke="${U.shade(mint, -0.18)}" stroke-width="1.2"/>
      <path d="M88 470 V516 M122 470 V516" stroke="${U.shade(mint, -0.22)}" stroke-width="0.8"/><rect x="90" y="497" width="5" height="1.6" rx="0.8" fill="#cfd5dc"/>
      ${[0, 1, 2, 3].map((k) => `<path d="M39 ${495 + k * 3} h6" stroke="${U.shade(mint, -0.25)}" stroke-width="1"/>`).join('')}
      <rect x="141" y="470" width="20" height="2" rx="1" fill="${U.shade(cream, -0.08)}"/>
      ${dot(151, 495, 4.4, cream)}<circle cx="151" cy="495" r="4.4" fill="none" stroke="${U.shade(cream, -0.2)}" stroke-width="0.8"/>
      ${dot(139.5, 499, 1.3, '#f2a33a')}${dot(162.5, 499, 1.3, '#f2a33a')}`;
    // wheels with white-wall tyres
    for (const x of [60, 116]) {
      s += `<path d="M${x - 13} 519 a13 13 0 0 1 26 0Z" fill="#3d3d42"/>${dot(x, 519, 11, '#2b2b30')}
        <circle cx="${x}" cy="519" r="7.4" fill="none" stroke="${st.van ? '#f4f1ea' : '#b9b3a6'}" stroke-width="2.6"/>`;
    }
    if (!st.van || p === 'grow') {
      // mud up the sides, dust everywhere, a message written in the dirt
      const r = U.rng(71);
      s += `<path d="M36 500 Q60 506 80 498 Q100 506 130 500 Q150 506 168 500 V519 H36Z" fill="#7a5a3a" opacity="${p === 'grow' ? 0.25 : 0.45}"/>`;
      for (let i = 0; i < (p === 'grow' ? 8 : 20); i++) s += dot(38 + r() * 128, 494 + r() * 24, 1 + r() * 2.2, '#6b4a2e', 0.6);
      s += `<rect x="36" y="466" width="132" height="22" fill="#d8ccb0" opacity="${p === 'grow' ? 0.25 : 0.4}"/>`;
      if (!st.van) s += `<text x="74" y="497" font-family="${FONT}" font-size="5.6" font-weight="800" fill="#efe6d2" opacity="0.85" transform="rotate(-4 74 497)">WASH ME</text>
        <path d="M52 530 q8 -3 16 0" stroke="#2b2b30" stroke-width="3" fill="none"/>`;
    }
    if (p === 'snow' || p === 'frost' || SEASON === 'winter') s += `<path d="M38 467 Q36 461 46 461 H160 Q170 461 168 467 Q150 464 104 465 Q60 464 38 467Z" fill="${SNOW}"/>`;
    if (p === 'leaves') s += `<ellipse cx="70" cy="464" rx="4" ry="1.8" fill="#d9822b" transform="rotate(14 70 464)"/><ellipse cx="104" cy="465" rx="3.6" ry="1.6" fill="#c4462f"/><ellipse cx="146" cy="466" rx="3.4" ry="1.6" fill="#e9b23c"/>`;
    return s + '</g>';
  }
  // what you see through the windows: sandy towels and buckets, or a tidy little home
  function vanInside(st) {
    const p = pend(st, 'vanInside'), tidy = st.vanInside && p !== 'grow';
    let s = '<g data-part="vanInside">';
    for (const [x, y, w] of VAN_WIN) {
      s += `<rect x="${x}" y="${y}" width="${w}" height="14" rx="3" fill="${tidy ? '#f3e3c3' : '#5f554b'}"/>`;
    }
    s += `<rect x="137" y="471" width="12" height="15" rx="3" fill="${tidy ? '#cfe4ec' : '#6f675d'}"/><rect x="153" y="471" width="12" height="15" rx="3" fill="${tidy ? '#cfe4ec' : '#6f675d'}"/>`;
    if (tidy) {
      // curtains tied back, cushions, a plant and a string of lights
      for (const [x, y, w] of VAN_WIN) {
        s += `<path d="M${x + 1} ${y + 1} h4 q-1.6 6 0.8 12 h-4.8z M${x + w - 1} ${y + 1} h-4 q1.6 6 -0.8 12 h4.8z" fill="#e98a7c"/>
          <path d="M${x + 1.4} ${y + 4} h3 M${x + 1.4} ${y + 8} h3 M${x + w - 4.4} ${y + 4} h3 M${x + w - 4.4} ${y + 8} h3" stroke="#fbf7ee" stroke-width="0.6"/>`;
      }
      s += `<rect x="47" y="481" width="12" height="5" rx="2" fill="#8fbfe6"/><rect x="69" y="481" width="12" height="5" rx="2" fill="#f7c548"/>
        <rect x="113" y="481" width="12" height="5" rx="2" fill="#9cc5a1"/><rect x="95" y="482" width="4" height="4" rx="1" fill="#c8763f"/><circle cx="97" cy="480.5" r="2.6" fill="#5f9e55"/>
        <path d="M45 474 Q55 477 63 474 M67 474 Q77 477 85 474 M111 474 Q121 477 129 474" stroke="#3d3d42" stroke-width="0.4" fill="none"/>
        ${[48, 54, 60, 70, 76, 82, 114, 120, 126].map((x, k) => dot(x, 475.6 + (k % 3 === 1 ? 0.6 : 0), 0.9, ['#ffe08a', '#ffb3c1', '#b3e5ff'][k % 3])).join('')}
        <path d="M156 486 a5 5 0 0 1 8 -3" stroke="#3d3d42" stroke-width="1.2" fill="none"/>${dot(142, 484, 1.6, '#5f9e55')}`;
    } else {
      // sand on the seats, a heap of beach towels, a bucket and a flip-flop
      s += `<path d="M44 486 Q52 480 62 486Z" fill="#d8c493"/><path d="M68 486 q4 -9 9 -6 q5 -3 7 6z" fill="#e0485a"/><path d="M70 483 h12 M71 480.5 h9" stroke="#fbf7ee" stroke-width="1"/>
        <path d="M78 486 q3 -6 6 -2 l0 2z" fill="#8fbfe6"/>
        <path d="M92 486 l2 -7 h7 l2 7z" fill="#5aa6dc"/><path d="M93 479 q5 -4 9 0" stroke="#3d86c6" stroke-width="0.8" fill="none"/>
        <path d="M112 484 q0 -3 4 -3 h4 q3 0 3 3 q0 2 -3 2 h-4 q-4 0 -4 -2z" fill="#ef8aa6"/><path d="M118 474 l6 8 M113 476 l10 1" stroke="#c9b48a" stroke-width="1" opacity="0.8"/>`;
    }
    // the glass over it all
    for (const [x, y, w] of VAN_WIN) s += `<path d="M${x + 3} ${y + 13} l${w * 0.5} -12" stroke="#fff" stroke-width="2.4" opacity="0.28" pointer-events="none"/>`;
    s += `<path d="M139 485 l7 -13 M155 485 l7 -13" stroke="#fff" stroke-width="2" opacity="0.3" pointer-events="none"/>`;
    if (!st.van) {
      for (const [x, y, w] of VAN_WIN) s += `<rect x="${x}" y="${y}" width="${w}" height="14" rx="3" fill="#cfc2a4" opacity="0.5"/>`;
      s += `<rect x="137" y="471" width="12" height="15" rx="3" fill="#cfc2a4" opacity="0.5"/><rect x="153" y="471" width="12" height="15" rx="3" fill="#cfc2a4" opacity="0.5"/>`;
    }
    if (p === 'frost' || p === 'snow') {
      for (const [x, y, w] of VAN_WIN) s += `<rect x="${x}" y="${y}" width="${w}" height="14" rx="3" fill="${url('Frost')}" opacity="0.85"/>`;
      s += `<rect x="137" y="471" width="12" height="15" rx="3" fill="${url('Frost')}" opacity="0.85"/><rect x="153" y="471" width="12" height="15" rx="3" fill="${url('Frost')}" opacity="0.85"/>`;
    }
    return s + '</g>';
  }
  // a coat of wax: dull paint until then, a soft sheen after
  function vanWax(st) {
    const p = pend(st, 'vanWax');
    if (!st.vanWax || p === 'grow') {
      return `<g data-part="vanWax"><path d="M36 489 H168 V494 H36Z" fill="#8f8a80" opacity="0.22"/><path d="M134 489 L151 504 L168 489" stroke="#8f8a80" stroke-width="2" fill="none" opacity="0.25"/></g>`;
    }
    return `<g data-part="vanWax"><g clip-path="${url('VanClip')}">
      <rect x="36" y="467" width="132" height="6" fill="${url('Sheen')}" opacity="0.6"/>
      <rect x="36" y="492" width="132" height="5" fill="${url('Sheen')}" opacity="0.45"/>
      <path d="M140 467 l10 0 l-14 52 l-6 0z" fill="#fff" opacity="0.14"/>
      <path d="M40 506 Q100 502 166 506" stroke="#fff" stroke-width="2" fill="none" opacity="0.18"/></g></g>`;
  }
  // the chrome: bumpers, hubcaps, headlight rims and the trim line
  function vanShine(st) {
    const p = pend(st, 'vanShine'), ok = st.vanShine && p !== 'grow';
    const chrome = ok ? url('Chrome') : '#9a978f';
    let s = `<g data-part="vanShine"><path d="M36 488.6 H134 L151 503.4 L168 488.6" stroke="${ok ? '#e9eef2' : '#a8a499'}" stroke-width="1.6" fill="none"/>
      <rect x="130" y="515" width="41" height="5.4" rx="2.4" fill="${chrome}"/><rect x="31" y="511" width="8" height="8" rx="2.4" fill="${chrome}"/>`;
    for (const x of [60, 116]) s += `<circle cx="${x}" cy="519" r="4.6" fill="${chrome}"/>${dot(x - 1, 518, 1.2, ok ? '#fff' : '#b5b0a6')}`;
    for (const x of [139.5, 162.5]) {
      s += `<circle cx="${x}" cy="507" r="4.6" fill="${chrome}"/><circle cx="${x}" cy="507" r="3.2" fill="${ok ? '#fff6d6' : '#c9c3b2'}"/>`;
      if (ok) s += dot(x - 1, 506, 1, '#fff');
    }
    if (!ok) s += `${dot(136, 517, 1.2, '#9a5a32', 0.8)}${dot(160, 518, 1, '#9a5a32', 0.8)}${dot(34, 514, 1, '#9a5a32', 0.8)}`;
    else {
      // gleaming: bright streaks and a few twinkles
      s += `<path d="M132 516.4 H168" stroke="#fff" stroke-width="1" opacity="0.9"/><path d="M48 470 l8 0 l-10 16 l-6 0z M120 470 l5 0 l-8 14 l-4 0z" fill="#fff" opacity="0.4"/>`;
      for (const [x, y, sz, d] of [[146, 470, 4, 0], [162.5, 505, 3.4, 0.8], [58, 517, 3, 1.6], [100, 492, 3.4, 0.4]]) {
        s += `<path class="cv-glint" style="animation-delay:${d}s" d="M${x} ${y - sz} L${x + sz * 0.25} ${y - sz * 0.25} L${x + sz} ${y} L${x + sz * 0.25} ${y + sz * 0.25} L${x} ${y + sz} L${x - sz * 0.25} ${y + sz * 0.25} L${x - sz} ${y} L${x - sz * 0.25} ${y - sz * 0.25}Z" fill="#fff"/>`;
      }
    }
    return s + '</g>';
  }

  // ------------------------------------------------------------ decorations
  // Bought in the shed; each one is a small drawing at a fixed spot.
  function deckchair(x, y, col) {
    return `<g transform="translate(${x} ${y})"><ellipse cx="2" cy="1" rx="16" ry="2.2" fill="#00000022"/>
      <path d="M10 0 L-8 -28 M-12 0 L1 -14 M-3 -8 L12 -8" stroke="#a8754e" stroke-width="2" stroke-linecap="round"/>
      <path d="M-8 -28 Q-5 -7 10 -8" stroke="${col}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M-8 -28 Q-5 -7 10 -8" stroke="#fbf7ee" stroke-width="2" fill="none" stroke-linecap="round"/></g>`;
  }
  function boardwalkSide(t, off) {
    const a = bez(BW, 0, t), b = bez(BW, 0, t + 0.01), len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [a[0] + (-(b[1] - a[1]) / len) * off, a[1] + ((b[0] - a[0]) / len) * off];
  }
  const LANTERNS = [0.2, 0.5, 0.8].map((t) => boardwalkSide(t, -(22 - t * 8)));
  const FIRE = [250, 444];
  const FAR = {
    'v-sailboat': () => `<g transform="translate(250 204)"><g class="cv-bob"><path d="M-12 0 h24 l-4 5 h-16z" fill="#3d5a86"/><path d="M0 -1 V-26" stroke="#5d5650" stroke-width="1"/>
      <path d="M1 -25 L13 -2 H1Z" fill="#fbf7ee"/><path d="M-1 -22 L-10 -2 H-1Z" fill="#f2e6cc"/><path d="M0 -26 l6 2 l-6 2z" fill="#e0485a"/></g>
      <path d="M-16 6 q8 -2 16 0 t16 0" stroke="#fff" stroke-width="0.8" fill="none" opacity="0.6"/></g>`,
    'v-whale': () => `<g transform="translate(96 186)"><path d="M-16 4 Q-10 -6 4 -5 Q14 -4 18 4Z" fill="#3f5566"/><path d="M-6 -2 q6 -2 12 0" stroke="#5f7889" stroke-width="1" fill="none"/>
      <path d="M22 2 q4 -6 9 -7 q-3 4 -1 8 q3 -2 6 -1 q-6 4 -14 0z" fill="#3f5566"/><path d="M-20 5 q18 -3 46 0" stroke="#fff" stroke-width="0.8" fill="none" opacity="0.6"/>
      <g class="cv-spout"><path d="M-4 -6 q-2 -8 -6 -12 M-4 -6 q0 -9 0 -14 M-4 -6 q2 -8 6 -12" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.9"/></g></g>`,
  };
  const DECOR = {
    'v-deckchairs': () => `<g>${deckchair(292, 438, K.C.stripes)}${deckchair(320, 442, '#8fbfe6')}</g>`,
    'v-kite': () => `<g><path d="M246 424 Q236 290 214 116" stroke="#7d7264" stroke-width="0.5" fill="none" opacity="0.45"/><rect x="245" y="420" width="2" height="6" fill="#8a6142"/>
      <g class="cv-kite"><path d="M214 84 L225 99 L214 116 L203 99Z" fill="#ef8aa6"/><path d="M214 84 L225 99 H214Z" fill="#f7c548"/><path d="M203 99 L214 116 V99Z" fill="#8fbfe6"/>
      <path d="M214 84 V116 M203 99 H225" stroke="#7d7264" stroke-width="0.5"/><path d="M214 116 q-5 8 0 14 q5 6 0 13" stroke="#7d7264" stroke-width="0.6" fill="none"/>
      <path d="M210 123 l4 1.4 l-4 1.4z M218 131 l-4 1.4 l4 1.4z M210 139 l4 1.4 l-4 1.4z" fill="#e0485a"/></g></g>`,
    'v-surfboard': () => `<g transform="rotate(-8 44 432)"><rect x="38" y="360" width="12" height="74" rx="6" fill="#5fc0c9"/><rect x="43" y="362" width="2" height="70" fill="#fbf7ee"/>
      <path d="M38.4 404 h11.2" stroke="#f7c548" stroke-width="3"/><path d="M40 366 q4 -4 8 0" stroke="#fff" stroke-width="1" fill="none" opacity="0.5"/></g>`,
    'v-lanterns': () => LANTERNS.map(([x, y]) => `<g><rect x="${f1(x - 1.2)}" y="${f1(y - 20)}" width="2.4" height="20" fill="#5d5650"/><rect x="${f1(x - 3.6)}" y="${f1(y - 29)}" width="7.2" height="9" rx="1.4" fill="#3d3d42"/>
      <rect x="${f1(x - 2.2)}" y="${f1(y - 27.6)}" width="4.4" height="6.4" fill="#ffe08a"/><path d="M${f1(x - 4)} ${f1(y - 29)} l4 -3 l4 3z" fill="#3d3d42"/></g>`).join(''),
    'v-gulls': () => `<g><rect x="191.5" y="276" width="5" height="16" fill="#7a6248"/><rect x="209.5" y="273" width="5" height="16" fill="#7a6248"/>
      <ellipse cx="194" cy="292" rx="5" ry="1.4" fill="#fff" opacity="0.4"/><ellipse cx="212" cy="289" rx="5" ry="1.4" fill="#fff" opacity="0.4"/>
      ${gull(194, 276, false)}${gull(212, 273, true)}</g>`,
    'v-parasol': () => {
      let s = `<g><ellipse cx="318" cy="452" rx="26" ry="3.6" fill="#00000020"/><path d="M308 450 L304 398" stroke="#7a6a5a" stroke-width="1.6"/>`;
      const x0 = 274, x1 = 334, n = 6;
      for (let i = 0; i < n; i++) {
        const a = x0 + ((x1 - x0) * i) / n, b = x0 + ((x1 - x0) * (i + 1)) / n;
        s += `<path d="M304 394 L${f1(a)} ${f1(412 - i * 1.2)} Q${f1((a + b) / 2)} ${f1(417 - i * 1.2)} ${f1(b)} ${f1(412 - (i + 1) * 1.2)}Z" fill="${i % 2 ? '#fbf7ee' : K.C.stripes}"/>`;
      }
      return s + '<circle cx="304" cy="393.5" r="1.6" fill="#7a6a5a"/></g>';
    },
    'v-firepit': () => {
      const [x, y] = FIRE;
      let s = `<g><ellipse cx="${x}" cy="${y + 3}" rx="16" ry="4" fill="#00000022"/>`;
      for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2; s += `<ellipse cx="${f1(x + Math.cos(a) * 12)}" cy="${f1(y + Math.sin(a) * 4)}" rx="3.4" ry="2.4" fill="${k % 2 ? '#9d968a' : '#b0a99c'}"/>`; }
      s += `<path d="M${x - 8} ${y + 1} l16 -4 M${x - 8} ${y - 3} l16 4" stroke="#6b4a32" stroke-width="2.6" stroke-linecap="round"/>
        <g class="cv-flame"><path d="M${x - 6} ${y - 1} Q${x - 7} ${y - 12} ${x} ${y - 20} Q${x + 2} ${y - 10} ${x + 6} ${y - 14} Q${x + 8} ${y - 6} ${x + 6} ${y - 1}Z" fill="#f08a3a"/>
        <path d="M${x - 3} ${y - 1} Q${x - 3} ${y - 9} ${x} ${y - 13} Q${x + 3} ${y - 7} ${x + 3} ${y - 1}Z" fill="#ffd25a"/></g></g>`;
      return s;
    },
    'v-hammock': () => `<g><rect x="301" y="338" width="4" height="34" rx="1" fill="#8a6142"/><rect x="369" y="334" width="4" height="34" rx="1" fill="#8a6142"/>
      <g class="cv-sway"><path d="M303 342 Q337 372 371 338" stroke="#d9c49a" stroke-width="1" fill="none"/>
      <path d="M310 346 Q337 370 364 343 L362 349 Q337 378 312 352Z" fill="${K.C.stripes}"/><path d="M311 349 Q337 374 363 346" stroke="#fbf7ee" stroke-width="2" fill="none"/></g></g>`,
    'v-seal': () => `<g transform="translate(294 256)"><g class="cv-breathe"><path d="M-12 2 Q-16 -6 -8 -8 Q2 -10 10 -4 Q16 0 14 4 Q0 6 -12 2Z" fill="#7d8793"/><ellipse cx="2" cy="-4" rx="7" ry="2.4" fill="#9aa4ae"/></g>
      <circle cx="-11" cy="-6" r="5" fill="#7d8793"/><circle cx="-13" cy="-7" r="0.9" fill="#222"/><circle cx="-15.6" cy="-5" r="1" fill="#3d3d42"/>
      <path d="M-15 -4 l-4 1 M-15 -3.4 l-4 2" stroke="#cfd5dc" stroke-width="0.4"/><path d="M12 3 q5 -1 7 2 q-4 2 -7 0z" fill="#6f7984"/></g>`,
    'v-kiosk': () => `<g><ellipse cx="338" cy="506" rx="26" ry="3" fill="#00000022"/><rect x="318" y="472" width="40" height="33" rx="2" fill="#f6ecd8"/>
      <rect x="322" y="478" width="32" height="12" rx="1.4" fill="#6f4a32"/><rect x="320" y="489" width="36" height="3" fill="#e9ddc6"/>
      ${[0, 1, 2, 3, 4].map((k) => `<path d="M${316 + k * 8.8} 466 h8.8 v5 q-4.4 4 -8.8 0z" fill="${k % 2 ? '#fbf7ee' : '#ef8aa6'}"/>`).join('')}
      <path d="M338 466 V454" stroke="#8a8f96" stroke-width="1.2"/><path d="M333 455 l5 -14 l5 14z" fill="#e0a86a"/>${dot(338, 442, 5, '#b3e5ff')}${dot(336, 440, 1.6, '#fff', 0.7)}
      ${dot(328, 486, 2, '#f7c6d1')}${dot(334, 486, 2, '#b3e5ff')}${dot(340, 486, 2, '#fbe3a0')}</g>`,
    'v-sailboat': FAR['v-sailboat'],
    'v-whale': FAR['v-whale'],
  };
  function gull(x, y, flip) {
    return `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)"><path d="M-1 0 V3.5 M2 0 V3.5" stroke="#e8964a" stroke-width="0.9"/>
      <ellipse cx="0" cy="-3" rx="6" ry="3.6" fill="#fbfbf8"/><path d="M-5 -4 Q-1 -6.5 4 -4.4 Q1 -2 -5 -2.6Z" fill="#a9b4bd"/><path d="M-6 -3.6 l-3.2 -1.2 l1 2.2z" fill="#3d4148"/>
      <circle cx="4.6" cy="-6.6" r="2.7" fill="#fbfbf8"/><path d="M7 -6.8 l3 0.6 l-3 0.9z" fill="#f2c230"/><circle cx="5.4" cy="-7.2" r="0.5" fill="#222"/></g>`;
  }
  function farDecor(owned) {
    let s = '';
    for (const k of Object.keys(FAR)) if (owned[k]) s += FAR[k]();
    return s;
  }
  function decorations(owned) {
    let s = '';
    for (const k of Object.keys(DECOR)) if (owned[k] && !FAR[k]) s += DECOR[k]();
    return s;
  }

  // gulls squabble over a neglected beach; birds and butterflies when it is loved
  function life(st) {
    let s = '';
    if (PCT < 0.5) s += `<g opacity="${f1(1 - PCT)}">${gull(330, 396, false)}${gull(346, 400, true)}</g>`;
    if (PCT > 0.3) s += `<g class="bird"><path d="M190 128 q4 -4 8 0 q4 -4 8 0 M214 140 q3 -3 6 0 q3 -3 6 0" stroke="#4a4a50" stroke-width="1.5" fill="none"/></g>`;
    if (PCT > 0.6 && SEASON !== 'winter') s += `<g class="bfly b1"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="#f2a7b8"/></g>`;
    if (PCT > 0.8 && SEASON === 'summer') s += `<g class="bfly b2"><path d="M0 0 q-5 -6 -7 0 q2 5 7 0 q5 -6 7 0 q-2 5 -7 0" fill="#fbd85c"/></g>`;
    return s;
  }

  function weather() {
    let s = '';
    if (SEASON === 'winter') {
      for (let i = 0; i < 26; i++) s += `<circle class="flake" cx="${(i * 61) % 400}" cy="-10" r="${1.5 + (i % 3) * 0.7}" fill="#fff" style="animation-delay:-${(i * 0.83) % 9}s;animation-duration:${7 + (i % 5)}s"/>`;
    } else if (SEASON === 'autumn') {
      const cols = ['#d9822b', '#c4462f', '#e9b23c'];
      for (let i = 0; i < 6; i++) s += `<ellipse class="fleaf" cx="${(i * 67 + 20) % 400}" cy="-10" rx="4" ry="2" fill="${cols[i % 3]}" style="animation-delay:-${(i * 1.3) % 10}s;animation-duration:${9 + (i % 4)}s"/>`;
    } else if (SEASON === 'spring') {
      for (let i = 0; i < 8; i++) s += `<ellipse class="fleaf" cx="${(i * 53 + 10) % 400}" cy="-10" rx="2.6" ry="1.6" fill="#f7c3d6" style="animation-delay:-${(i * 1.7) % 11}s;animation-duration:${11 + (i % 3)}s"/>`;
    }
    return `<g class="weather" pointer-events="none">${s}</g>`;
  }

  // evening: darken everything except the lit windows, then let lights glow
  function night(st, decor) {
    const lit = (part) => st[part] && !PEND[part];
    let holes = '';
    if (lit('hutWindow')) holes += '<rect x="59" y="379" width="14" height="17"/>';
    if (lit('lantern')) holes += '<rect x="335" y="68" width="26" height="18"/>';
    if (lit('vanInside')) holes += VAN_WIN.map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="14"/>`).join('');
    let s = `<mask id="${id('Dark')}"><rect width="400" height="540" fill="#fff"/><g fill="#000">${holes}</g></mask>
      <rect width="400" height="540" fill="#1b2350" opacity="0.55" style="mix-blend-mode:multiply" mask="url(#${id('Dark')})"/>
      <rect width="400" height="540" fill="#24306a" opacity="0.18" mask="url(#${id('Dark')})"/>`;
    for (let i = 0; i < 30; i++) s += `<circle class="star" cx="${(i * 97) % 400}" cy="${8 + ((i * 53) % 150)}" r="${0.6 + (i % 3) * 0.4}" fill="#fff" style="animation-delay:-${(i * 0.7) % 4}s"/>`;
    s += `<mask id="${id('Moon')}"><rect width="400" height="200" fill="#fff"/><circle cx="77" cy="56" r="14" fill="#000"/></mask><circle cx="70" cy="62" r="16" fill="#fff6d8" mask="url(#${id('Moon')})"/><circle cx="70" cy="62" r="30" fill="#fff6d8" opacity="0.08"/>`;
    // the moon's path across the water
    for (let i = 0; i < 16; i++) {
      const y = 176 + i * 10, w = 3 + i * 1.5, x = 70 + Math.sin(i * 1.7) * 3;
      s += `<path d="M${f1(x - w)} ${y} H${f1(x + w)}" stroke="#fff6d8" stroke-width="1.4" opacity="${f1(0.55 - i * 0.025)}" stroke-dasharray="${f1(w * 0.6)} ${f1(w * 0.25)}"/>`;
    }
    const glow = (x, y, rx, ry = rx) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${rx}" ry="${ry}" fill="${url('Glow')}"/>`;
    if (lit('lantern')) {
      s += `<g class="cv-beam"><path d="M348 77 L-60 36 L-60 118Z" fill="${url('Beam')}"/></g>${glow(348, 77, 30)}<rect x="335" y="68" width="26" height="18" fill="#fff2b0" opacity="0.35"/>`;
    }
    if (lit('hutWindow')) s += `<rect x="59" y="379" width="14" height="17" fill="#ffd98a" opacity="0.4"/>${glow(66, 388, 30)}${glow(66, 420, 26, 6)}`;
    if (lit('vanInside')) s += VAN_WIN.map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="14" rx="3" fill="#ffd98a" opacity="0.3"/>${glow(x + w / 2, y + 7, 18)}`).join('');
    if (decor['v-lanterns']) for (const [x, y] of LANTERNS) s += `${glow(x, y - 24, 18)}<rect x="${f1(x - 2.2)}" y="${f1(y - 27.6)}" width="4.4" height="6.4" fill="#fff0b8"/>`;
    if (decor['v-firepit']) s += `${glow(FIRE[0], FIRE[1] - 8, 46, 34)}${glow(FIRE[0], FIRE[1] + 4, 40, 8)}`;
    if (decor['v-kiosk']) s += `<rect x="322" y="478" width="32" height="12" fill="#ffd98a" opacity="0.45"/>${glow(338, 484, 30, 16)}`;
    return `<g class="night" pointer-events="none">${s}</g>`;
  }

  const SPOTS = {
    beach: [252, 382], sand: [232, 352], hut: [90, 384], boat: [226, 312], dunes: [300, 498], boardwalk: [222, 494], hutWindow: [66, 388],
    rockpool: [330, 314], boatPaint: [226, 306], shells: [160, 398], jetty: [136, 268], lantern: [348, 78], lighthouse: [348, 168], castle: [276, 396],
    van: [86, 500], vanInside: [100, 479], vanWax: [122, 494], vanShine: [151, 512],
  };
  function sparkles(part, st) {
    if (!part) return '';
    let spot = SPOTS[part] || [200, 330];
    if (part === 'boatPaint' && st.jetty) spot = [180, 226];
    let s = '';
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2, d = 18 + (i % 3) * 10;
      const x = spot[0] + Math.cos(a) * d, y = spot[1] + Math.sin(a) * d * 0.7;
      s += `<path class="spark" style="animation-delay:${(i * 0.09).toFixed(2)}s" d="M${f1(x)} ${f1(y - 6)} L${f1(x + 1.5)} ${f1(y - 1.5)} L${f1(x + 6)} ${f1(y)} L${f1(x + 1.5)} ${f1(y + 1.5)} L${f1(x)} ${f1(y + 6)} L${f1(x - 1.5)} ${f1(y + 1.5)} L${f1(x - 6)} ${f1(y)} L${f1(x - 1.5)} ${f1(y - 1.5)}Z" fill="#fff7cc"/>`;
    }
    return `<g class="sparkles" pointer-events="none">${s}</g>`;
  }

  // st: map of restored part -> true; cols: chosen paint colours (hut, boat,
  // stripes); opts as for HOUSE.render plus forSale (still in the shop) and
  // uid (id suffix when several coves share a page)
  function render(st, cols = {}, opts = {}) {
    SEASON = opts.season || 'spring'; PEND = opts.pending || {}; UID = opts.uid ? String(opts.uid).replace(/[^\w-]/g, '') : ''; FORSALE = !!opts.forSale;
    PCT = U.clamp(opts.pct || 0, 0, 1);
    const decor = opts.decor || {};
    palette({ hut: cols.hut || '#8fbfe6', boat: cols.boat || '#c9474f', stripes: cols.stripes || '#c9474f' });
    const C = K.C;
    return `<svg viewBox="0 0 ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" class="house cove">
      ${style()}${defs()}${sky()}${sea()}${farDecor(decor)}${flotsam()}
      ${sand(st)}${rocks()}${rockpool(st)}${lighthouse(st, C)}${lantern(st)}${railing(st)}
      ${jetty(st)}${boat(st, C)}${hut(st, C)}${hutWindow(st)}${shells(st)}${castle(st, C)}${beach(st)}${saleSign()}
      ${dunes(st)}${carPark()}${boardwalk(st)}${van(st)}${vanInside(st)}${vanWax(st)}${vanShine(st)}
      ${decorations(decor)}${life(st)}${weather()}${opts.night ? night(st, decor) : ''}${sparkles(opts.fresh, st)}
    </svg>`;
  }

  return { render, DECOR, PARTS: Object.keys(SPOTS) };
})();
