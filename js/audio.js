'use strict';
// All sound is synthesised with Web Audio: no files to download. A soft
// working sound that follows how much you are cleaning, coin tinks that climb
// a pentatonic scale, chimes, and slow generative music.

const AUDIO = (() => {
  let ac = null, master, sfx, music, verb, noiseBuf;
  const on = { sfx: true, music: true };
  let work = null, kind = '', engine = null;
  let coinStep = 0, lastCoin = 0;
  let musicTimer = 0, chordIdx = 0, beat = 0;

  function unlock() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try { if (navigator.audioSession) navigator.audioSession.type = 'ambient'; } catch (_) {}
      ac = new AC();
      master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
      sfx = ac.createGain(); sfx.gain.value = on.sfx ? 1 : 0; sfx.connect(master);
      music = ac.createGain(); music.gain.value = on.music ? 0.5 : 0; music.connect(master);
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
    g.gain.setTargetAtTime(val ? (which === 'sfx' ? 1 : 0.5) : 0, ac.currentTime, 0.1);
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
    mow: { type: 'bandpass', f: 2600, q: 1.4, vol: 0.18 },
    mower: { type: 'lowpass', f: 900, q: 0.7, vol: 0.22, engine: 58 },
    scrub: { type: 'bandpass', f: 1700, q: 1.1, vol: 0.32 },
    washer: { type: 'highpass', f: 1800, q: 0.5, vol: 0.2 },
    paint: { type: 'lowpass', f: 650, q: 0.8, vol: 0.4 },
    wash: { type: 'bandpass', f: 2300, q: 2.2, vol: 0.25 },
    weed: { type: 'bandpass', f: 1100, q: 1.2, vol: 0.32 },
    skim: { type: 'lowpass', f: 800, q: 1.5, vol: 0.38 },
    dust: { type: 'highpass', f: 2600, q: 0.6, vol: 0.18 },
    rake: { type: 'bandpass', f: 1400, q: 0.9, vol: 0.3 },
    vacuum: { type: 'bandpass', f: 900, q: 0.8, vol: 0.2, engine: 120 },
    snow: { type: 'bandpass', f: 1000, q: 0.7, vol: 0.34 },
    snowblower: { type: 'bandpass', f: 1400, q: 0.6, vol: 0.2, engine: 70 },
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
  function soft() { if (!ac) return; tone(520, ac.currentTime, 0.12, 'triangle', 0.05, sfx, 0.15); }
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
  // Slow chords and sparse notes; nothing loops exactly.
  const CHORDS = [
    [48, 55, 64, 71], [45, 52, 60, 67], [41, 48, 57, 64], [43, 50, 59, 66],
    [48, 52, 59, 67], [40, 47, 55, 62], [41, 48, 55, 64], [43, 50, 57, 62],
  ];
  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function startMusic() {
    clearInterval(musicTimer);
    beat = 0;
    musicTimer = setInterval(musicTick, 850);
  }
  function musicTick() {
    if (!ac || ac.state !== 'running' || !on.music) return;
    const t = ac.currentTime + 0.05;
    const chord = CHORDS[chordIdx % CHORDS.length];
    if (beat % 8 === 0) {
      chord.forEach((m, i) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = i === 0 ? 'triangle' : 'sine'; o.frequency.value = midi(m - (i === 0 ? 12 : 0));
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(i === 0 ? 0.05 : 0.025, t + 1.6);
        g.gain.linearRampToValueAtTime(0.0001, t + 7.2);
        o.connect(g); g.connect(music);
        const w = ac.createGain(); w.gain.value = 0.6; g.connect(w); w.connect(verb);
        o.start(t); o.stop(t + 7.4);
      });
    }
    if (Math.random() < (beat % 2 === 0 ? 0.55 : 0.25)) {
      const scale = [0, 2, 4, 7, 9];
      const root = chord[0] + 24;
      const m = root + scale[(Math.random() * scale.length) | 0] + (Math.random() < 0.3 ? 12 : 0);
      tone(midi(m), t, 2.2, 'sine', 0.045, music, 0.8, 0.01);
      tone(midi(m) * 2, t, 0.6, 'sine', 0.008, music, 0.5, 0.01);
    }
    beat++;
    if (beat % 8 === 0) chordIdx++;
  }

  function suspend() { if (ac && ac.state === 'running') ac.suspend(); }
  function resume() { if (ac && ac.state !== 'running') ac.resume(); }

  return { unlock, set, on, setWork, stopWork, activity, coin, pop, soft, buy, chime, shimmer, suspend, resume };
})();
