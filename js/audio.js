// Sons retrô sintetizados com WebAudio (nenhum arquivo de áudio).
let ctx = null, master = null, hum = null, enabled = true;

function noise(dur) {
  const b = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = ctx.createBufferSource(); s.buffer = b; return s;
}
function env(g, t, a, peak, dec) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
}
function ok() { return ctx && enabled; }

export const Sfx = {
  init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
    } catch (e) { ctx = null; }
  },
  toggle() {
    enabled = !enabled;
    if (master) master.gain.setTargetAtTime(enabled ? 0.55 : 0, ctx.currentTime, 0.05);
    document.dispatchEvent(new CustomEvent('sound', { detail: enabled }));
    return enabled;
  },
  get enabled() { return enabled; },
  humStart() {
    if (!ctx || hum) return;
    const g = ctx.createGain(); g.gain.value = 0.012;
    const o1 = ctx.createOscillator(); o1.frequency.value = 60; o1.type = 'sine';
    const o2 = ctx.createOscillator(); o2.frequency.value = 15734 / 4; o2.type = 'sine';
    const g2 = ctx.createGain(); g2.gain.value = 0.05;
    o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(master);
    o1.start(); o2.start(); hum = g;
  },
  key() {
    if (!ok()) return;
    const t = ctx.currentTime, n = noise(0.05), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = 'bandpass'; f.frequency.value = 2500 + Math.random() * 1500; f.Q.value = 2;
    n.connect(f); f.connect(g); g.connect(master); env(g, t, 0.002, 0.5, 0.04); n.start(t); n.stop(t + 0.06);
  },
  click() {
    if (!ok()) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.setValueAtTime(900, t); o.frequency.exponentialRampToValueAtTime(200, t + 0.04);
    o.connect(g); g.connect(master); env(g, t, 0.002, 0.15, 0.05); o.start(t); o.stop(t + 0.08);
  },
  tick() {
    if (!ok()) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = 1800;
    o.connect(g); g.connect(master); env(g, t, 0.001, 0.035, 0.02); o.start(t); o.stop(t + 0.03);
  },
  blip() {
    if (!ok()) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.setValueAtTime(660, t); o.frequency.setValueAtTime(990, t + 0.06);
    o.connect(g); g.connect(master); env(g, t, 0.002, 0.08, 0.12); o.start(t); o.stop(t + 0.15);
  },
  thunk() {
    if (!ok()) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.25);
    o.connect(g); g.connect(master); env(g, t, 0.005, 0.5, 0.3); o.start(t); o.stop(t + 0.35);
    const n = noise(0.3), f = ctx.createBiquadFilter(), g2 = ctx.createGain();
    f.type = 'highpass'; f.frequency.value = 6000; n.connect(f); f.connect(g2); g2.connect(master);
    env(g2, t, 0.01, 0.06, 0.25); n.start(t); n.stop(t + 0.3);
  },
  degauss() {
    if (!ok()) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.value = 60;
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 9; lg.gain.value = 0.5;
    lfo.connect(lg); lg.connect(g.gain);
    o.connect(g); g.connect(master); env(g, t, 0.01, 0.12, 0.6); o.start(t); o.stop(t + 0.65); lfo.start(t); lfo.stop(t + 0.65);
  },
  whoosh() {
    if (!ok()) return;
    const t = ctx.currentTime, n = noise(0.6), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(1800, t + 0.5);
    n.connect(f); f.connect(g); g.connect(master); env(g, t, 0.15, 0.07, 0.4); n.start(t); n.stop(t + 0.6);
  },
  paper() {
    if (!ok()) return;
    const t = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const n = noise(0.12), f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = 'highpass'; f.frequency.value = 2500 + i * 800;
      n.connect(f); f.connect(g); g.connect(master); env(g, t + i * 0.07, 0.01, 0.12, 0.09); n.start(t + i * 0.07); n.stop(t + i * 0.07 + 0.12);
    }
  },
};
