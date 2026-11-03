'use strict';
// All sound is synthesised with Web Audio: no files to download. A soft
// working sound that follows how much you are cleaning, coin tinks that climb
// a pentatonic scale, chimes, and slow generative music.

const AUDIO = (() => {
  let ac = null, master, sfx, music, verb, noiseBuf;
  const on = { sfx: true, music: true };
  let work = null, kind = '', engine = null;
  let coinStep = 0, lastCoin = 0;
  let musicTimer = 0;

  function unlock() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try { if (navigator.audioSession) navigator.audioSession.type = 'ambient'; } catch (_) {}
      ac = new AC();
      master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
      sfx = ac.createGain(); sfx.gain.value = on.sfx ? 1 : 0; sfx.connect(master);
      music = ac.createGain(); music.gain.value = on.music ? musicVol : 0; music.connect(master);
      noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      let b = 0;
      for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b = 0.97 * b + 0.03 * w; d[i] = w * 0.6 + b * 2.2; }
      verb = ac.createConvolver();
      const len = ac.sampleRate * 2.6, ir = ac.createBuffer(2, len, ac.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const x = ir.getChannelData(ch); for (let i = 0; i < len; i++) x[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
      verb.buffer = ir;
      const vg = ac.createGain(); vg.gain.value = 0.35; verb.connect(vg); vg.connect(master);
      startMusic();
    }
    if (ac.state !== 'running') ac.resume();
  }

  function set(which, val) {
    on[which] = val;
    if (!ac) return;
    const g = which === 'sfx' ? sfx : music;
    g.gain.setTargetAtTime(val ? (which === 'sfx' ? 1 : musicVol) : 0, ac.currentTime, 0.1);
  }

  function tone(freq, t0, dur, type = 'sine', vol = 0.2, dest = sfx, wet = 0.4, attack = 0.005) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest);
    if (wet > 0) { const w = ac.createGain(); w.gain.value = wet; g.connect(w); w.connect(verb); }
    o.start(t0); o.stop(t0 + dur + 0.05);
    return o;
  }

  // ------------------------------------------------------------ work sound
  const WORK = {
    mow: { type: 'bandpass', f: 2600, q: 1.4, vol: 0.117 },
    mower: { type: 'lowpass', f: 900, q: 0.7, vol: 0.143, engine: 58 },
    scrub: { type: 'bandpass', f: 1700, q: 1.1, vol: 0.208 },
    washer: { type: 'highpass', f: 1800, q: 0.5, vol: 0.13 },
    paint: { type: 'lowpass', f: 650, q: 0.8, vol: 0.26 },
    wash: { type: 'bandpass', f: 2300, q: 2.2, vol: 0.163 },
    weed: { type: 'bandpass', f: 1100, q: 1.2, vol: 0.208 },
    skim: { type: 'lowpass', f: 800, q: 1.5, vol: 0.247 },
    dust: { type: 'highpass', f: 2600, q: 0.6, vol: 0.117 },
    rake: { type: 'bandpass', f: 1400, q: 0.9, vol: 0.195 },
    vacuum: { type: 'bandpass', f: 900, q: 0.8, vol: 0.13, engine: 120 },
    snow: { type: 'bandpass', f: 1000, q: 0.7, vol: 0.221 },
    snowblower: { type: 'bandpass', f: 1400, q: 0.6, vol: 0.13, engine: 70 },
    plant: { type: 'lowpass', f: 700, q: 1.0, vol: 0.2 },
    build: { type: 'bandpass', f: 1300, q: 1.0, vol: 0.1 },
    collect: { type: 'lowpass', f: 900, q: 0.8, vol: 0.16 },
    polish: { type: 'bandpass', f: 2000, q: 1.6, vol: 0.12 },
    buffer: { type: 'bandpass', f: 1600, q: 0.9, vol: 0.1, engine: 95 },
    arrange: { type: 'bandpass', f: 1500, q: 1.2, vol: 0.07 },
    wipe: { type: 'bandpass', f: 2100, q: 1.8, vol: 0.14 },
    steam: { type: 'highpass', f: 2600, q: 0.5, vol: 0.08 },
    groom: { type: 'bandpass', f: 1500, q: 1.4, vol: 0.15 },
    shower: { type: 'highpass', f: 2200, q: 0.5, vol: 0.1 },
    brew: { type: 'lowpass', f: 650, q: 1.4, vol: 0.13 },
    feed: { type: 'bandpass', f: 950, q: 1.1, vol: 0.13 },
    walk: { type: 'bandpass', f: 1900, q: 1.5, vol: 0.06 },
    brush: { type: 'bandpass', f: 2500, q: 1.3, vol: 0.1 },
    muck: { type: 'bandpass', f: 1250, q: 0.9, vol: 0.17 },
  };
  function setWork(k) {
    if (!ac || k === kind) return;
    stopWork();
    kind = k;
    const w = WORK[k] || WORK.scrub;
    const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = ac.createBiquadFilter(); f.type = w.type; f.frequency.value = w.f; f.Q.value = w.q;
    const g = ac.createGain(); g.gain.value = 0;
    src.connect(f); f.connect(g); g.connect(sfx);
    src.start();
    work = { src, f, g, w };
    if (w.engine) {
      const o = ac.createOscillator(), o2 = ac.createOscillator(), lp = ac.createBiquadFilter(), eg = ac.createGain();
      o.type = 'sawtooth'; o.frequency.value = w.engine; o2.type = 'square'; o2.frequency.value = w.engine * 0.5;
      lp.type = 'lowpass'; lp.frequency.value = 320; eg.gain.value = 0;
      const g2 = ac.createGain(); g2.gain.value = 0.35;
      o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(eg); eg.connect(sfx);
      o.start(); o2.start();
      engine = { o, o2, lp, eg, base: w.engine };
    }
  }
  function stopWork() {
    if (work) { try { work.src.stop(); } catch (_) {} work = null; }
    if (engine) { try { engine.o.stop(); engine.o2.stop(); } catch (_) {} engine = null; }
    kind = '';
  }
  function activity(level, down) {
    if (!ac || !work) return;
    const t = ac.currentTime;
    const wob = 1 + Math.sin(t * 9) * 0.08 * level;
    work.g.gain.setTargetAtTime(level * work.w.vol * wob, t, 0.05);
    work.f.frequency.setTargetAtTime(work.w.f * (0.85 + level * 0.3), t, 0.08);
    if (engine) {
      engine.eg.gain.setTargetAtTime(down ? 0.05 + level * 0.06 : 0, t, 0.15);
      engine.o.frequency.setTargetAtTime(engine.base * (1 + level * 0.25), t, 0.2);
      engine.o2.frequency.setTargetAtTime(engine.base * 0.5 * (1 + level * 0.25), t, 0.2);
    }
  }

  // ------------------------------------------------------------- one-shots
  const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
  function coin() {
    if (!ac || !on.sfx) return;
    const now = ac.currentTime;
    if (now - lastCoin > 0.9) coinStep = 0;
    lastCoin = now;
    const semi = PENTA[Math.min(coinStep, PENTA.length - 1)];
    coinStep = (coinStep + 1) % (PENTA.length + 4);
    const f = 1046.5 * Math.pow(2, semi / 12);
    tone(f, now, 0.25, 'sine', 0.07, sfx, 0.25);
    tone(f * 2.01, now, 0.12, 'sine', 0.02, sfx, 0.1);
  }
  function pop() { if (!ac) return; const t = ac.currentTime; tone(660, t, 0.09, 'sine', 0.08, sfx, 0.1); tone(990, t + 0.03, 0.08, 'sine', 0.05, sfx, 0.1); }
  // a piece clicks into place: a wooden knock when building, a soft bloop
  // when a plant springs up; both climb the scale so a run makes a tune
  let unitStep = 0, lastUnit = 0;
  function unit(kind) {
    if (!ac || !on.sfx) return;
    const now = ac.currentTime;
    if (now - lastUnit < 0.05) return;
    if (now - lastUnit > 1.2) unitStep = 0;
    lastUnit = now;
    const semi = PENTA[unitStep % PENTA.length];
    unitStep++;
    if (kind === 'lights' || kind === 'clink') {
      // a glassy ting for a bulb coming on or a bottle set down
      const f = (kind === 'lights' ? 784 : 1046.5) * Math.pow(2, semi / 12);
      tone(f, now, 0.35, 'sine', 0.06, sfx, 0.45);
      tone(f * 2.4, now, 0.12, 'sine', 0.02, sfx, 0.3);
    } else if (kind === 'collect') {
      // a little hop: two quick rising notes
      const f = 523.25 * Math.pow(2, semi / 12);
      tone(f, now, 0.1, 'triangle', 0.07, sfx, 0.1);
      tone(f * 1.5, now + 0.06, 0.16, 'triangle', 0.06, sfx, 0.2);
    } else if (kind === 'build' || kind === 'sand') {
      const f = (kind === 'sand' ? 130 : 196) * Math.pow(2, semi / 12);
      tone(f, now, 0.16, 'triangle', 0.16, sfx, 0.12);
      tone(f * 2.76, now, 0.05, 'sine', 0.05, sfx, 0);
      const src = ac.createBufferSource(), g = ac.createGain(), bp = ac.createBiquadFilter();
      src.buffer = noiseBuf; bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 2;
      g.gain.setValueAtTime(0.12, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      src.connect(bp); bp.connect(g); g.connect(sfx);
      src.start(now, Math.random()); src.stop(now + 0.05);
    } else {
      const f = 392 * Math.pow(2, semi / 12);
      const o = ac.createOscillator(), g = ac.createGain(), w = ac.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(f * 0.75, now); o.frequency.exponentialRampToValueAtTime(f, now + 0.08);
      g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(0.09, now + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      w.gain.value = 0.3;
      o.connect(g); g.connect(sfx); g.connect(w); w.connect(verb);
      o.start(now); o.stop(now + 0.35);
    }
  }
  function soft() { if (!ac) return; tone(520, ac.currentTime, 0.12, 'triangle', 0.05, sfx, 0.15); }
  // puzzles: a kind "not there" (two soft falling notes, never a buzzer),
  // food pouring into a bowl, and the click of a pipe turning
  function nope() {
    if (!ac) return;
    const t = ac.currentTime;
    tone(466, t, 0.14, 'triangle', 0.045, sfx, 0.15); tone(392, t + 0.1, 0.2, 'triangle', 0.04, sfx, 0.2);
  }
  function noiseBurst(t, dur, f0, f1, vol, q = 1.2) {
    const src = ac.createBufferSource(), g = ac.createGain(), bp = ac.createBiquadFilter();
    src.buffer = noiseBuf; bp.type = 'bandpass'; bp.Q.value = q;
    bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + Math.min(0.04, dur / 3)); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(bp); bp.connect(g); g.connect(sfx);
    src.start(t, Math.random()); src.stop(t + dur + 0.02);
  }
  function pour() { if (!ac) return; const t = ac.currentTime; noiseBurst(t, 0.38, 2200, 650, 0.1); tone(330, t + 0.18, 0.12, 'sine', 0.03, sfx, 0.2); }
  function turn() { if (!ac) return; const t = ac.currentTime; noiseBurst(t, 0.05, 3200, 2400, 0.08, 3); tone(294, t, 0.09, 'triangle', 0.05, sfx, 0.05); }
  function buy() {
    if (!ac) return;
    const t = ac.currentTime;
    [0, 4, 7, 12, 16].forEach((s, i) => tone(523.25 * Math.pow(2, s / 12), t + i * 0.06, 0.5, 'triangle', 0.09, sfx, 0.5));
  }
  function chime() {
    if (!ac) return;
    const t = ac.currentTime;
    [0, 7, 12, 16, 19, 24].forEach((s, i) => {
      tone(392 * Math.pow(2, s / 12), t + i * 0.11, 1.6, 'sine', 0.11, sfx, 0.7);
      tone(392 * Math.pow(2, s / 12) * 3, t + i * 0.11, 0.4, 'sine', 0.015, sfx, 0.5);
    });
  }
  function shimmer() {
    if (!ac) return;
    const t = ac.currentTime;
    for (let i = 0; i < 10; i++) tone(1568 * Math.pow(2, PENTA[i] / 12) / 2, t + i * 0.045, 0.35, 'sine', 0.035, sfx, 0.6);
  }

  // ----------------------------------------------------------------- music
  // Quiet tunes of our own (so there are no rights to worry about), one
  // per place, each a 16-bar loop: a soft pad, a felt-piano arpeggio, a music
  // box melody and a little bass. The season picks the key, the evening slows
  // it down, and every pass round the loop is arranged a little differently
  // (an intro without melody, a pass an octave up, a sparse one to breathe).
  const MAJOR = [0, 2, 4, 5, 7, 9, 11];
  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
  // chords as [scale degree of the root, add the seventh?]
  const TUNES = {
    cottage: {
      chords: [[1], [5], [6], [4], [1], [4], [2], [5], [4], [1], [6], [5], [4], [1], [2], [5]],
      melody: [
        [[0, 3, 1], [1, 5, 1], [2, 8, 2]], [[0, 7, 1.5], [1.5, 6, 0.5], [2, 5, 2]], [[0, 6, 1], [1, 5, 1], [2, 3, 2]], [[0, 4, 1], [1, 3, 1], [2, 2, 2]],
        [[0, 3, 1], [1, 5, 1], [2, 8, 1], [3, 9, 1]], [[0, 10, 2], [2, 8, 2]], [[0, 9, 1], [1, 8, 1], [2, 6, 2]], [[0, 5, 3]],
        [[0, 6, 1], [1, 8, 1], [2, 10, 2]], [[0, 9, 1], [1, 8, 1], [2, 5, 2]], [[0, 6, 1], [1, 8, 1], [2, 9, 1], [3, 8, 1]], [[0, 7, 2], [2, 5, 2]],
        [[0, 4, 1], [1, 6, 1], [2, 8, 2]], [[0, 10, 1.5], [1.5, 9, 0.5], [2, 8, 2]], [[0, 9, 1], [1, 7, 1], [2, 5, 2]], [[0, 8, 4]],
      ],
    },
    cafe: {
      chords: [[1, 1], [6, 1], [2, 1], [5, 1], [1, 1], [4, 1], [3, 1], [6, 1], [2, 1], [5, 1], [1, 1], [4, 1], [2, 1], [5, 1], [1, 1], [5, 1]],
      melody: [
        [[0, 5, 1], [1, 6, 1], [2, 7, 2]], [[0, 8, 1.5], [1.5, 7, 0.5], [2, 6, 2]], [[0, 4, 1], [1, 6, 1], [2, 8, 1], [3, 6, 1]], [[0, 7, 3]],
        [[0, 3, 1], [1, 5, 1], [2, 7, 1], [3, 9, 1]], [[0, 8, 2], [2, 6, 2]], [[0, 7, 1], [1, 5, 1], [2, 3, 2]], [[0, 6, 3]],
        [[0, 6, 1], [1, 8, 1], [2, 9, 2]], [[0, 8, 1], [1, 7, 1], [2, 5, 2]], [[0, 7, 1], [1, 5, 1], [2, 3, 1], [3, 5, 1]], [[0, 6, 4]],
        [[0, 4, 1], [1, 6, 1], [2, 8, 2]], [[0, 7, 1.5], [1.5, 6, 0.5], [2, 4, 2]], [[0, 3, 1], [1, 5, 1], [2, 8, 2]], [[0, 7, 2], [2, 5, 2]],
      ],
    },
    cove: {
      chords: [[1, 1], [4, 1], [1, 1], [4, 1], [6, 1], [4, 1], [2, 1], [5], [4, 1], [5], [6, 1], [3, 1], [4, 1], [1], [2, 1], [5]],
      melody: [
        [[0, 5, 2], [2, 3, 2]], [[0, 6, 2], [2, 4, 2]], [[0, 5, 1], [1, 7, 1], [2, 8, 2]], [[0, 6, 4]],
        [[0, 6, 1], [1, 8, 1], [2, 10, 2]], [[0, 9, 2], [2, 8, 2]], [[0, 6, 2], [2, 4, 2]], [[0, 5, 4]],
        [[0, 8, 2], [2, 10, 2]], [[0, 9, 2], [2, 7, 2]], [[0, 8, 1], [1, 6, 1], [2, 5, 2]], [[0, 7, 4]],
        [[0, 6, 1], [1, 8, 1], [2, 10, 2]], [[0, 12, 2], [2, 10, 2]], [[0, 9, 2], [2, 6, 2]], [[0, 5, 4]],
      ],
    },
    // a little folk tune for the farm
    rescue: {
      chords: [[1], [4], [1], [5], [6], [4], [1], [5], [4], [1], [2, 1], [5], [1], [4], [5, 1], [1]],
      melody: [
        [[0, 5, 1], [1, 5, 0.5], [1.5, 6, 0.5], [2, 8, 2]], [[0, 8, 1], [1, 6, 1], [2, 4, 2]], [[0, 5, 1], [1, 3, 1], [2, 5, 1], [3, 8, 1]], [[0, 7, 3], [3, 5, 1]],
        [[0, 6, 1], [1, 8, 1], [2, 10, 2]], [[0, 9, 1], [1, 8, 1], [2, 6, 2]], [[0, 5, 1], [1, 6, 1], [2, 8, 2]], [[0, 7, 4]],
        [[0, 8, 1], [1, 9, 1], [2, 11, 2]], [[0, 10, 1], [1, 8, 1], [2, 5, 2]], [[0, 6, 1.5], [1.5, 7, 0.5], [2, 9, 2]], [[0, 7, 3]],
        [[0, 5, 1], [1, 5, 0.5], [1.5, 6, 0.5], [2, 8, 2]], [[0, 11, 1.5], [1.5, 10, 0.5], [2, 8, 2]], [[0, 7, 1], [1, 9, 1], [2, 6, 2]], [[0, 8, 4]],
      ],
    },
    // a slow, lilting tune for the walled garden
    glasshouse: {
      chords: [[1], [3, 1], [4], [1], [6], [2, 1], [5], [5, 1], [4], [5], [3, 1], [6], [2, 1], [5], [1], [1]],
      melody: [
        [[0, 8, 1.5], [1.5, 9, 0.5], [2, 10, 2]], [[0, 10, 1], [1, 9, 1], [2, 7, 2]], [[0, 8, 1], [1, 6, 1], [2, 8, 1], [3, 11, 1]], [[0, 10, 3]],
        [[0, 10, 1.5], [1.5, 11, 0.5], [2, 12, 2]], [[0, 11, 1], [1, 9, 1], [2, 8, 2]], [[0, 7, 1], [1, 9, 1], [2, 11, 1], [3, 9, 1]], [[0, 9, 4]],
        [[0, 8, 1], [1, 10, 1], [2, 13, 2]], [[0, 12, 1.5], [1.5, 11, 0.5], [2, 9, 2]], [[0, 10, 1], [1, 12, 1], [2, 10, 1], [3, 8, 1]], [[0, 6, 3]],
        [[0, 6, 1], [1, 8, 1], [2, 11, 2]], [[0, 9, 1.5], [1.5, 7, 0.5], [2, 5, 2]], [[0, 8, 1], [1, 10, 1], [2, 12, 2]], [[0, 8, 4]],
      ],
    },
    // a slow rocking tune for the canal, like a boat at its mooring
    canal: {
      chords: [[1], [5], [6], [3], [4], [1], [2, 1], [5], [1], [5], [6, 1], [3], [4], [5], [1], [1]],
      melody: [
        [[0, 8, 3], [3, 7, 1]], [[0, 5, 2], [2, 7, 2]], [[0, 6, 1.5], [1.5, 8, 0.5], [2, 10, 2]], [[0, 7, 3], [3, 5, 1]],
        [[0, 6, 1], [1, 8, 1], [2, 6, 1], [3, 4, 1]], [[0, 5, 2], [2, 3, 2]], [[0, 4, 1], [1, 6, 1], [2, 9, 2]], [[0, 7, 4]],
        [[0, 8, 1.5], [1.5, 9, 0.5], [2, 10, 2]], [[0, 9, 2], [2, 7, 2]], [[0, 8, 1], [1, 10, 1], [2, 12, 2]], [[0, 10, 3], [3, 7, 1]],
        [[0, 6, 1], [1, 8, 1], [2, 11, 2]], [[0, 9, 1.5], [1.5, 8, 0.5], [2, 7, 2]], [[0, 5, 1], [1, 7, 1], [2, 8, 2]], [[0, 8, 4]],
      ],
    },
    // soft sevenths for the bookshop, a tune to read by
    books: {
      chords: [[4, 1], [3, 1], [2, 1], [1, 1], [4, 1], [5, 1], [3, 1], [6, 1], [2, 1], [5, 1], [1, 1], [6, 1], [2, 1], [5, 1], [1, 1], [1]],
      melody: [
        [[0, 10, 2], [2, 8, 1], [3, 6, 1]], [[0, 9, 2], [2, 7, 1], [3, 5, 1]], [[0, 8, 2], [2, 6, 1], [3, 4, 1]], [[0, 7, 3], [3, 5, 1]],
        [[0, 6, 1], [1, 8, 1], [2, 10, 1.5], [3.5, 9, 0.5]], [[0, 9, 2], [2, 11, 2]], [[0, 10, 1], [1, 9, 1], [2, 7, 2]], [[0, 8, 4]],
        [[0, 9, 1.5], [1.5, 8, 0.5], [2, 6, 2]], [[0, 7, 1], [1, 9, 1], [2, 11, 2]], [[0, 10, 1.5], [1.5, 12, 0.5], [2, 14, 2]], [[0, 13, 2], [2, 10, 2]],
        [[0, 11, 1], [1, 9, 1], [2, 8, 2]], [[0, 9, 2], [2, 7, 2]], [[0, 8, 1], [1, 7, 1], [2, 5, 2]], [[0, 8, 4]],
      ],
    },
    // a slow waltz for the pottery, the tune on a soft wooden mallet, like a marimba
    pottery: {
      beats: 3, bpm: 78, lead: 'mallet',
      chords: [[1], [4], [5], [1], [6], [4], [2, 1], [5], [1], [3], [4], [1], [2], [5], [1], [1]],
      melody: [
        [[0, 5, 2], [2, 3, 1]], [[0, 4, 1], [1, 6, 1], [2, 8, 1]], [[0, 7, 2], [2, 5, 1]], [[0, 3, 3]],
        [[0, 6, 2], [2, 8, 1]], [[0, 8, 1.5], [1.5, 6, 0.5], [2, 4, 1]], [[0, 6, 2], [2, 5, 1]], [[0, 5, 3]],
        [[0, 8, 2], [2, 10, 1]], [[0, 10, 1], [1, 9, 1], [2, 7, 1]], [[0, 8, 2], [2, 6, 1]], [[0, 5, 3]],
        [[0, 6, 1], [1, 8, 1], [2, 9, 1]], [[0, 9, 1.5], [1.5, 7, 0.5], [2, 5, 1]], [[0, 3, 1], [1, 5, 1], [2, 8, 1]], [[0, 8, 3]],
      ],
    },
    // the station: a slow tune over a soft brushed clickety-clack, like a train far away
    halt: {
      bpm: 68, brush: true,
      chords: [[1], [6], [4], [5], [1], [6], [2, 1], [5], [4], [1], [6], [3], [4], [5, 1], [1], [1]],
      melody: [
        [[0, 5, 1], [1, 5, 1], [2, 6, 1], [3, 8, 1]], [[0, 8, 2], [2, 6, 2]], [[0, 6, 1], [1, 8, 1], [2, 10, 2]], [[0, 9, 3], [3, 7, 1]],
        [[0, 8, 1], [1, 8, 1], [2, 9, 1], [3, 10, 1]], [[0, 10, 2], [2, 8, 2]], [[0, 9, 1], [1, 8, 1], [2, 6, 2]], [[0, 5, 4]],
        [[0, 6, 1], [1, 8, 1], [2, 11, 2]], [[0, 10, 1.5], [1.5, 8, 0.5], [2, 5, 2]], [[0, 6, 1], [1, 8, 1], [2, 10, 1], [3, 8, 1]], [[0, 7, 4]],
        [[0, 8, 1], [1, 6, 1], [2, 4, 1], [3, 6, 1]], [[0, 9, 2], [2, 7, 2]], [[0, 8, 1], [1, 5, 1], [2, 3, 2]], [[0, 8, 4]],
      ],
    },
  };
  const KEY = { spring: 65, summer: 60, autumn: 62, winter: 67 };
  let theme = { place: 'cottage', season: 'spring', night: false }, nextTheme = null;
  let musicVol = 0.45, nextBar = 0, bar = 0, cycle = 0;

  const note = (tonic, deg) => tonic + 12 * Math.floor((deg - 1) / 7) + MAJOR[(deg - 1) % 7];
  function out(g, wet) {
    g.connect(music);
    if (wet > 0) { const w = ac.createGain(); w.gain.value = wet; g.connect(w); w.connect(verb); }
  }
  // felt piano: a sine and a quiet octave through a closing low-pass
  function keys(f, t, dur, vol) {
    const o = ac.createOscillator(), o2 = ac.createOscillator(), g2 = ac.createGain(), lp = ac.createBiquadFilter(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = f; o2.type = 'triangle'; o2.frequency.value = f * 2; g2.gain.value = 0.16;
    lp.type = 'lowpass'; lp.Q.value = 0.3; lp.frequency.setValueAtTime(2200, t); lp.frequency.exponentialRampToValueAtTime(600, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); out(g, 0.35);
    o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }
  // music box: a pure tone with a faint, quickly fading bell partial
  function box(f, t, vol) {
    tone(f, t, 1.8, 'sine', vol, music, 0.55, 0.006);
    tone(f * 3.01, t, 0.35, 'sine', vol * 0.12, music, 0.4, 0.004);
  }
  // pad: two slightly detuned triangles per note, slow in and out
  function pad(freqs, t, dur, vol) {
    const lp = ac.createBiquadFilter(), g = ac.createGain();
    lp.type = 'lowpass'; lp.frequency.value = 850; lp.Q.value = 0.2;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 1.1); g.gain.setValueAtTime(vol, t + dur - 0.4); g.gain.linearRampToValueAtTime(0.0001, t + dur + 1.4);
    for (const f of freqs) for (const d of [-5, 5]) {
      const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = f; o.detune.value = d;
      o.connect(lp); o.start(t); o.stop(t + dur + 1.5);
    }
    lp.connect(g); out(g, 0.5);
  }
  // a wooden mallet: a quick sine with the bright, short partial a marimba bar has
  function mallet(f, t, vol) {
    tone(f, t, 1.1, 'sine', vol * 1.1, music, 0.45, 0.004);
    tone(f * 3.93, t, 0.12, 'sine', vol * 0.22, music, 0.2, 0.002);
    tone(f * 2, t, 0.25, 'triangle', vol * 0.08, music, 0.2, 0.003);
  }
  // a soft brush on a snare, far away
  function brushTap(t, vol) {
    const src = ac.createBufferSource(), g = ac.createGain(), bp = ac.createBiquadFilter();
    src.buffer = noiseBuf; bp.type = 'bandpass'; bp.Q.value = 0.9;
    bp.frequency.setValueAtTime(4200, t); bp.frequency.exponentialRampToValueAtTime(2600, t + 0.09);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    src.connect(bp); bp.connect(g); out(g, 0.25);
    src.start(t, Math.random()); src.stop(t + 0.15);
  }
  function bass(f, t, dur, vol) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); out(g, 0.1); o.start(t); o.stop(t + dur + 0.05);
  }

  function playBar(t, beat) {
    const tune = TUNES[theme.place] || TUNES.cottage, tonic = KEY[theme.season] || 60;
    const i = bar % 16, [deg, seventh] = tune.chords[i];
    const r = U.rng(cycle * 97 + i * 13 + 1);
    // how this pass round the loop is arranged
    const pass = cycle % 4, quiet = theme.night || pass === 3, beats = tune.beats || 4;
    const chord = [deg, deg + 2, deg + 4].concat(seventh ? [deg + 6] : []).map((d) => note(tonic - 12, d));
    pad(chord.slice(0, 3).map(midi), t, beat * beats, 0.016);
    const tones = chord.length > 3 ? chord : chord.concat([chord[0] + 12]);
    if (beats === 3) {
      // a waltz: the root low on one, the chord softly on two and three
      if (pass !== 0) bass(midi(note(tonic - 24, deg)), t, beat * 1.8, 0.05);
      keys(midi(tones[0] - 12), t, beat * 2.4, 0.045);
      for (const b of [1, 2]) {
        if (quiet && b === 2) continue;
        keys(midi(tones[1]), t + b * beat, beat * 1.4, 0.026 + r() * 0.008);
        keys(midi(tones[2]), t + b * beat + 0.012, beat * 1.4, 0.022 + r() * 0.008);
      }
    } else {
      if (pass !== 0) bass(midi(note(tonic - 24, deg)), t, beat * 2.2, 0.055);
      if (pass !== 0 && !quiet) bass(midi(note(tonic - 24, deg + (r() < 0.5 ? 4 : 0))), t + beat * 2, beat * 2, 0.04);
      // a gentle broken chord, sparser on quiet passes
      const arp = [0, 1, 2, 3, 2, 1, 3, 1];
      for (let k = 0; k < 8; k++) {
        if ((quiet || pass === 2) && k % 2) continue;
        if (pass === 0 && k % 4 === 3) continue;
        keys(midi(tones[arp[k]] + (k === 0 ? -12 : 0)), t + k * beat * 0.5, beat * 2.6, k === 0 ? 0.05 : 0.032 + r() * 0.01);
      }
    }
    // the far-away clickety-clack: two soft taps, twice a bar
    if (tune.brush && pass !== 0) for (const b of [0, 0.5, 2, 2.5]) brushTap(t + b * beat, (quiet ? 0.006 : 0.011) * (b % 1 ? 0.7 : 1));
    // the tune itself, missing on the intro pass and only every other bar when breathing
    if (pass !== 0 && !(pass === 3 && i % 2)) {
      const up = pass === 2 ? 12 : 0;
      for (const [at, d, len] of tune.melody[i]) {
        if (theme.night && r() < 0.25) continue;
        const f = midi(note(tonic + 12 + up, d)), v = 0.07 * (len >= 2 ? 1 : 0.85);
        if (tune.lead === 'mallet') mallet(f, t + at * beat, v * 0.9); else box(f, t + at * beat, v);
      }
    }
  }
  // each tune has its own pace (72 beats a minute unless it says), slower in the evening
  const tuneOf = () => TUNES[theme.place] || TUNES.cottage;
  const beatOf = () => { const bpm = tuneOf().bpm || 72; return 60 / (theme.night ? bpm - 8 : bpm); };
  function musicTick() {
    if (!ac || ac.state !== 'running' || !on.music) { if (ac) nextBar = Math.max(nextBar, ac.currentTime + 0.1); return; }
    if (nextBar < ac.currentTime) nextBar = ac.currentTime + 0.1;
    while (nextBar < ac.currentTime + 0.6) {
      if (nextTheme && (bar % 8 === 0 || nextTheme.place !== theme.place)) {
        const fresh = nextTheme.place !== theme.place || nextTheme.season !== theme.season;
        theme = nextTheme; nextTheme = null;
        if (fresh) { bar = 0; cycle = 0; }
      }
      const beat = beatOf();
      playBar(nextBar, beat);
      nextBar += beat * (tuneOf().beats || 4);
      bar++;
      if (bar % 16 === 0) cycle++;
    }
  }
  function startMusic() {
    clearInterval(musicTimer);
    nextBar = ac.currentTime + 0.3;
    musicTimer = setInterval(musicTick, 200);
  }
  // which tune: the place you are at, in its season, slower in the evening
  function music_(o) {
    const t = { place: o.place || 'cottage', season: o.season || 'spring', night: !!o.night };
    if (t.place === theme.place && t.season === theme.season && t.night === theme.night) { nextTheme = null; return; }
    nextTheme = t;
  }
  // test hook: render a stretch of music offline (no speakers needed) and
  // report how loud it is, next to a few coin tinks for comparison
  async function debugRender(o = {}, secs = 16) {
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const keep = { ac, music, verb, sfx, theme, bar, cycle };
    const off = new OAC(1, 22050 * secs, 22050);
    try {
      ac = off;
      music = off.createGain(); music.gain.value = musicVol; music.connect(off.destination);
      sfx = off.createGain(); sfx.gain.value = 0;
      verb = off.createConvolver();
      const len = 22050 * 2, ir = off.createBuffer(1, len, 22050), x = ir.getChannelData(0);
      for (let i = 0; i < len; i++) x[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
      verb.buffer = ir; const vg = off.createGain(); vg.gain.value = 0.35; verb.connect(vg); vg.connect(off.destination);
      if (!noiseBuf || noiseBuf.sampleRate !== 22050) { const nb = off.createBuffer(1, 22050 * 2, 22050), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; keep.noiseBuf = noiseBuf; noiseBuf = nb; }
      theme = { place: o.place || 'cottage', season: o.season || 'spring', night: !!o.night }; bar = 0; cycle = o.cycle == null ? 1 : o.cycle;
      const beat = beatOf();
      for (let t = 0.1; t < secs - 3; t += beat * (tuneOf().beats || 4)) { playBar(t, beat); bar++; if (bar % 16 === 0) cycle++; }
      if (o.coins) { sfx.gain.value = 1; sfx.connect(off.destination); music.gain.value = 0; for (let k = 0; k < 8; k++) tone(1046.5 * Math.pow(2, PENTA[k] / 12), 1 + k * 0.25, 0.25, 'sine', 0.07, sfx, 0.25); }
      const data = (await off.startRendering()).getChannelData(0);
      let peak = 0, sum = 0;
      for (let i = 0; i < data.length; i++) { const v = Math.abs(data[i]); if (v > peak) peak = v; sum += v * v; }
      return { peak: +peak.toFixed(4), rms: +Math.sqrt(sum / data.length).toFixed(4) };
    } finally { if ('noiseBuf' in keep) noiseBuf = keep.noiseBuf; ac = keep.ac; music = keep.music; verb = keep.verb; sfx = keep.sfx; theme = keep.theme; bar = keep.bar; cycle = keep.cycle; }
  }
  function volume(v) {
    musicVol = U.clamp(v, 0, 1);
    if (ac) music.gain.setTargetAtTime(on.music ? musicVol : 0, ac.currentTime, 0.1);
  }
  // the music fades out slowly (goodnight); volume() brings it back
  function fade(secs = 4) { if (ac) music.gain.setTargetAtTime(0, ac.currentTime, secs / 4); }
  // a light going out at goodnight: a soft note sinking a little, lower each time
  function lightOff(i = 0) {
    if (!ac) return;
    const t = ac.currentTime, f = 784 * Math.pow(2, -[0, 3, 5, 7, 10, 12, 15, 17][i % 8] / 12);
    const o = tone(f, t, 1.5, 'sine', 0.045, sfx, 0.65, 0.012);
    o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.95, t + 1.3);
  }

  // ------------------------------------------------------------ birdsong
  // A bird now and then while you look at the cottage in spring and summer.
  let birdTimer = 0;
  function chirp(t0) {
    const o = ac.createOscillator(), g = ac.createGain();
    const f0 = 2600 + Math.random() * 1600, notes = 2 + ((Math.random() * 4) | 0);
    o.type = 'sine';
    g.gain.setValueAtTime(0, t0);
    let t = t0;
    for (let i = 0; i < notes; i++) {
      const f = f0 * (0.9 + Math.random() * 0.3), d = 0.06 + Math.random() * 0.07;
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * (Math.random() < 0.5 ? 1.35 : 0.75), t + d);
      g.gain.linearRampToValueAtTime(0.03, t + 0.01); g.gain.linearRampToValueAtTime(0, t + d);
      t += d + 0.03 + Math.random() * 0.05;
    }
    o.connect(g); g.connect(sfx);
    const w = ac.createGain(); w.gain.value = 0.5; g.connect(w); w.connect(verb);
    o.start(t0); o.stop(t + 0.1);
  }
  function birds(enable) {
    clearTimeout(birdTimer);
    if (!enable) return;
    const next = () => {
      birdTimer = setTimeout(() => {
        if (ac && ac.state === 'running' && on.sfx) { const t = ac.currentTime + 0.05; chirp(t); if (Math.random() < 0.4) chirp(t + 0.5 + Math.random() * 0.4); }
        next();
      }, 3500 + Math.random() * 6000);
    };
    next();
  }

  function suspend() { if (ac && ac.state === 'running') ac.suspend(); }
  function resume() { if (ac && ac.state !== 'running') ac.resume(); }

  return { unlock, set, on, setWork, stopWork, activity, coin, pop, soft, nope, pour, turn, unit, buy, chime, shimmer, suspend, resume, birds, theme: music_, volume, fade, lightOff, debugRender, TUNES };
})();
