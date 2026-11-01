'use strict';
// Small helpers shared by every other file: seeded randomness, value noise,
// colour maths and easing. Nothing here touches the DOM.

const U = (() => {
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // 2D value noise with fractal sum. Cheap enough to run per pixel on a
  // low-resolution canvas that is then scaled up.
  function noise(seed) {
    const r = rng(seed);
    const perm = new Uint8Array(512);
    const vals = new Float32Array(256);
    const p = [];
    for (let i = 0; i < 256; i++) { p.push(i); vals[i] = r(); }
    for (let i = 255; i > 0; i--) { const j = (r() * (i + 1)) | 0; [p[i], p[j]] = [p[j], p[i]]; }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    const lat = (x, y) => vals[perm[(x & 255) + perm[y & 255]]];
    function n2(x, y) {
      const ix = Math.floor(x), iy = Math.floor(y);
      let fx = x - ix, fy = y - iy;
      fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
      const a = lat(ix, iy), b = lat(ix + 1, iy), c = lat(ix, iy + 1), d = lat(ix + 1, iy + 1);
      return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
    }
    function fbm(x, y, oct = 4) {
      let s = 0, amp = 0.5, f = 1, norm = 0;
      for (let i = 0; i < oct; i++) { s += n2(x * f, y * f) * amp; norm += amp; amp *= 0.5; f *= 2.03; }
      return s / norm;
    }
    return { n2, fbm };
  }

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeBack = (t) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

  function hex(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const toHex = (r, g, b) => '#' + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
  function mix(a, b, t) {
    const A = hex(a), B = hex(b);
    return toHex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t));
  }
  // amt > 0 lightens towards white, < 0 darkens towards black
  const shade = (c, amt) => (amt >= 0 ? mix(c, '#ffffff', amt) : mix(c, '#000000', -amt));
  function rgba(c, a) { const [r, g, b] = hex(c); return `rgba(${r},${g},${b},${a})`; }
  function lum(c) { const [r, g, b] = hex(c); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; }

  function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w));
    c.height = Math.max(1, Math.round(h));
    return c;
  }

  function fmt(n) {
    n = Math.floor(n);
    if (n < 10000) return n.toLocaleString('en-US');
    if (n < 1e6) return (n / 1000).toFixed(n < 1e5 ? 1 : 0).replace(/\.0$/, '') + 'k';
    return (n / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M';
  }

  const pick = (r, arr) => arr[(r() * arr.length) | 0];

  return { rng, noise, clamp, lerp, smooth, easeOut, easeBack, hex, toHex, mix, shade, rgba, lum, canvas, fmt, pick };
})();
