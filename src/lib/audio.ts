// WebAudio-Engine — komplett ohne Audio-Files.
// tick = mechanischer Casino-Peg-Click
// winFanfare = Las-Vegas-Jackpot (Triplet-Opener + Coin-Shower + Brass + Held-Chord
//              mit Vibrato + Sleigh-Bells + Bass-Drop + Noise-Wash)
// spinStart  = kurzer „Whoosh" beim DREHEN-Klick

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();

    // Master-Bus mit Compressor — verhindert Clipping bei den vielen Layern.
    master = ctx.createGain();
    master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 24;
    comp.ratio.value = 4;
    comp.attack.value = 0.003;
    comp.release.value = 0.25;
    master.connect(comp);
    comp.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function getNoiseBuffer(c: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    const size = c.sampleRate * 0.4;
    noiseBuffer = c.createBuffer(1, size, c.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

/* ------------------------------------------------------------------
   TICK — mechanischer Peg-Click. Lauter & markanter: kräftigerer
   Holz-„Tock" + schärferer High-Transient, damit er über der
   Hintergrundmusik klar durchschlägt.
   ------------------------------------------------------------------ */
export function tick(volume = 1) {
  const c = getCtx();
  if (!c || !master) return;
  const now = c.currentTime;
  const vol = Math.max(0, Math.min(1, volume));

  const noise = c.createBufferSource();
  noise.buffer = getNoiseBuffer(c);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1700 + Math.random() * 700;
  bp.Q.value = 4;
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 600;
  const nGain = c.createGain();
  nGain.gain.setValueAtTime(0, now);
  nGain.gain.linearRampToValueAtTime(0.52 * vol, now + 0.001);
  nGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.05);
  noise.connect(bp).connect(hp).connect(nGain).connect(master);
  noise.start(now);
  noise.stop(now + 0.06);

  // Holz-Körper — kräftiger „Tock" mit Pitch-Drop
  const body = c.createOscillator();
  body.type = "triangle";
  const bodyF = 185 + Math.random() * 40;
  body.frequency.setValueAtTime(bodyF, now);
  body.frequency.exponentialRampToValueAtTime(bodyF * 0.5, now + 0.06);
  const bGain = c.createGain();
  bGain.gain.setValueAtTime(0, now);
  bGain.gain.linearRampToValueAtTime(0.42 * vol, now + 0.002);
  bGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.11);
  body.connect(bGain).connect(master);
  body.start(now);
  body.stop(now + 0.12);

  // Scharfer High-Transient — gibt dem Click seinen „Snap"
  const attack = c.createOscillator();
  attack.type = "square";
  attack.frequency.value = 3000;
  const aGain = c.createGain();
  aGain.gain.setValueAtTime(0, now);
  aGain.gain.linearRampToValueAtTime(0.12 * vol, now + 0.0005);
  aGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);
  attack.connect(aGain).connect(master);
  attack.start(now);
  attack.stop(now + 0.016);
}

/* ------------------------------------------------------------------
   SPIN-START — Whoosh
   ------------------------------------------------------------------ */
export function spinStart() {
  const c = getCtx();
  if (!c || !master) return;
  const now = c.currentTime;
  const noise = c.createBufferSource();
  noise.buffer = getNoiseBuffer(c);
  noise.loop = true;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(400, now);
  filter.frequency.exponentialRampToValueAtTime(2200, now + 0.3);
  filter.Q.value = 2;
  const g = c.createGain();
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(0.18, now + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0005, now + 0.45);
  noise.connect(filter).connect(g).connect(master);
  noise.start(now);
  noise.stop(now + 0.5);
}

/* ==================================================================
   VEGAS-JACKPOT — Bausteine + Komposition
   ================================================================== */

function bellHit(c: AudioContext, dest: AudioNode, when: number, freq: number, vol: number, decay = 0.35) {
  // Grund-Sine
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.value = freq;
  const g = c.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0005, when + decay);
  o.connect(g).connect(dest);
  o.start(when);
  o.stop(when + decay + 0.05);

  // 3. Harmonische für Glanz
  const o2 = c.createOscillator();
  o2.type = "sine";
  o2.frequency.value = freq * 3.01;
  const g2 = c.createGain();
  g2.gain.setValueAtTime(0, when);
  g2.gain.linearRampToValueAtTime(vol * 0.32, when + 0.001);
  g2.gain.exponentialRampToValueAtTime(0.0005, when + decay * 0.45);
  o2.connect(g2).connect(dest);
  o2.start(when);
  o2.stop(when + decay * 0.5 + 0.02);

  // 2. Harmonische, leicht detunet → Chorus-Effekt
  const o3 = c.createOscillator();
  o3.type = "sine";
  o3.frequency.value = freq * 2.005;
  const g3 = c.createGain();
  g3.gain.setValueAtTime(0, when);
  g3.gain.linearRampToValueAtTime(vol * 0.22, when + 0.0015);
  g3.gain.exponentialRampToValueAtTime(0.0005, when + decay * 0.65);
  o3.connect(g3).connect(dest);
  o3.start(when);
  o3.stop(when + decay * 0.7 + 0.02);
}

function coinTink(c: AudioContext, dest: AudioNode, when: number) {
  const noise = c.createBufferSource();
  noise.buffer = getNoiseBuffer(c);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 4000 + Math.random() * 3500;
  bp.Q.value = 12;
  const g = c.createGain();
  const amp = 0.06 + Math.random() * 0.05;
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(amp, when + 0.0015);
  g.gain.exponentialRampToValueAtTime(0.0005, when + 0.06);
  noise.connect(bp).connect(g).connect(dest);
  noise.start(when);
  noise.stop(when + 0.07);
}

function brassNote(c: AudioContext, dest: AudioNode, when: number, freq: number, vol = 0.18) {
  const osc = c.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = freq;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(900, when);
  filter.frequency.exponentialRampToValueAtTime(5500, when + 0.06);
  filter.Q.value = 3.5;
  const g = c.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + 0.012);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.28);
  osc.connect(filter).connect(g).connect(dest);
  osc.start(when);
  osc.stop(when + 0.3);
}

function chordVoice(c: AudioContext, dest: AudioNode, when: number, freq: number, duration: number, vol: number) {
  // Hauptoszillator mit Vibrato-LFO → orchestrales Gefühl
  const osc = c.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = freq;

  const lfo = c.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 5.8;
  const lfoGain = c.createGain();
  lfoGain.gain.value = freq * 0.005;
  lfo.connect(lfoGain).connect(osc.frequency);

  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 4200;
  filter.Q.value = 1.4;

  const g = c.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + 0.1);
  g.gain.setValueAtTime(vol, when + duration - 0.5);
  g.gain.exponentialRampToValueAtTime(0.0005, when + duration);

  osc.connect(filter).connect(g).connect(dest);
  lfo.start(when);
  osc.start(when);
  lfo.stop(when + duration + 0.05);
  osc.stop(when + duration + 0.05);

  // Sub-Oktave (Sine) für Wärme
  const sub = c.createOscillator();
  sub.type = "sine";
  sub.frequency.value = freq * 0.5;
  const sg = c.createGain();
  sg.gain.setValueAtTime(0, when);
  sg.gain.linearRampToValueAtTime(vol * 0.5, when + 0.1);
  sg.gain.setValueAtTime(vol * 0.5, when + duration - 0.4);
  sg.gain.exponentialRampToValueAtTime(0.0005, when + duration);
  sub.connect(sg).connect(dest);
  sub.start(when);
  sub.stop(when + duration + 0.05);
}

function bassDrop(c: AudioContext, dest: AudioNode, when: number) {
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(220, when);
  osc.frequency.exponentialRampToValueAtTime(40, when + 0.35);
  const g = c.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(0.55, when + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0005, when + 0.8);
  osc.connect(g).connect(dest);
  osc.start(when);
  osc.stop(when + 0.85);

  // Knack on top für punch
  const click = c.createOscillator();
  click.type = "triangle";
  click.frequency.value = 80;
  const cg = c.createGain();
  cg.gain.setValueAtTime(0, when);
  cg.gain.linearRampToValueAtTime(0.35, when + 0.001);
  cg.gain.exponentialRampToValueAtTime(0.0005, when + 0.03);
  click.connect(cg).connect(dest);
  click.start(when);
  click.stop(when + 0.04);
}

function noiseWash(c: AudioContext, dest: AudioNode, when: number) {
  const noise = c.createBufferSource();
  noise.buffer = getNoiseBuffer(c);
  noise.loop = true;
  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 4000;
  const g = c.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(0.07, when + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0005, when + 0.7);
  noise.connect(filter).connect(g).connect(dest);
  noise.start(when);
  noise.stop(when + 0.75);
}

/* ------------------------------------------------------------------
   WIN — die ganze Komposition
   ------------------------------------------------------------------ */
export function winFanfare() {
  const c = getCtx();
  if (!c || !master) return;
  const now = c.currentTime;

  // 1) Opener — DING DING DING (E6 → G6 → C7, drittes akzentuiert)
  bellHit(c, master, now + 0.00, 1318.5, 0.18, 0.32);
  bellHit(c, master, now + 0.10, 1567.9, 0.20, 0.34);
  bellHit(c, master, now + 0.20, 2093.0, 0.28, 0.55);

  // 2) Coin-Shower — 42 zufällig verteilte Tinks zwischen 0.28 s und 2.4 s
  const coinCount = 42;
  for (let i = 0; i < coinCount; i++) {
    const t = 0.28 + (i / coinCount) * 2.1 + (Math.random() - 0.5) * 0.06;
    coinTink(c, master, now + t);
  }

  // 3) Brass-Arpeggio C-E-G-C ab 0.34 s
  [
    { f: 523.25, t: 0.34 },  // C5
    { f: 659.25, t: 0.42 },  // E5
    { f: 783.99, t: 0.50 },  // G5
    { f: 1046.5, t: 0.58 },  // C6
  ].forEach(({ f, t }) => brassNote(c, master!, now + t, f, 0.20));

  // 4) Held C-Dur-Chord (C E G C) mit Vibrato — ab 0.7 s, 2.0 s lang
  const chord = [523.25, 659.25, 783.99, 1046.5];
  chord.forEach((f, i) => {
    chordVoice(c, master!, now + 0.70, f, 2.0, i === 0 || i === 3 ? 0.085 : 0.07);
  });

  // 5) Sleigh-Bell-Shimmer — 26 sehr hohe Sines, zufällig verteilt
  for (let i = 0; i < 26; i++) {
    const t = 0.4 + Math.random() * 2.3;
    const f = 2500 + Math.random() * 3500;
    bellHit(c, master, now + t, f, 0.04 + Math.random() * 0.03, 0.18);
  }

  // 6) Bass-Drop bei 1.5 s — markiert den Höhepunkt
  bassDrop(c, master, now + 1.45);

  // 7) Noise-Wash on top of bass drop → cymbal-crash-feel
  noiseWash(c, master, now + 1.45);

  // 8) Final-Ding bei 2.6 s — die Auflösung
  bellHit(c, master, now + 2.55, 2093.0, 0.22, 0.7);
  bellHit(c, master, now + 2.55, 2637.0, 0.16, 0.6);  // E7
}

/* ==================================================================
   CASINO-HINTERGRUNDMUSIK — sanftes Lounge-Bett (Maj7-Turnaround) +
   Walking-Bass + Brush-Backbeat + zufälliges Münz-/Glöckchen-Glitzer.
   Eigener Music-Bus unter dem Master → leiser als die Ticks. Per
   Lookahead-Scheduler getaktet, sauber loop- und fade-bar.
   ================================================================== */

let musicGain: GainNode | null = null;
let musicTimer: number | null = null;
let musicPlaying = false;
let nextBeatTime = 0;
let beatIndex = 0;

const BPM = 86;
const BEAT = 60 / BPM;

// I–vi–ii–V Turnaround in C (klassisches Lounge-Geländer), je 1 Takt.
const PROG: Array<{ chord: number[]; bass: number }> = [
  { chord: [261.63, 329.63, 392.0, 493.88], bass: 130.81 }, // Cmaj7
  { chord: [220.0, 261.63, 329.63, 392.0], bass: 110.0 },   // Am7
  { chord: [293.66, 349.23, 440.0, 523.25], bass: 146.83 }, // Dm7
  { chord: [196.0, 246.94, 293.66, 349.23], bass: 98.0 },   // G7
];

function padVoice(c: AudioContext, dest: AudioNode, when: number, freq: number, dur: number, vol: number) {
  const o1 = c.createOscillator();
  o1.type = "triangle";
  o1.frequency.value = freq;
  o1.detune.value = -5;
  const o2 = c.createOscillator();
  o2.type = "triangle";
  o2.frequency.value = freq;
  o2.detune.value = 6;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1900;
  lp.Q.value = 0.7;
  const g = c.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + 0.18);
  g.gain.setValueAtTime(vol, Math.max(when + 0.2, when + dur - 0.55));
  g.gain.exponentialRampToValueAtTime(0.0005, when + dur);
  o1.connect(lp);
  o2.connect(lp);
  lp.connect(g).connect(dest);
  o1.start(when);
  o2.start(when);
  o1.stop(when + dur + 0.05);
  o2.stop(when + dur + 0.05);
}

function ambBass(c: AudioContext, dest: AudioNode, when: number, freq: number, dur: number, vol: number) {
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.value = freq;
  const g = c.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0005, when + dur);
  o.connect(g).connect(dest);
  o.start(when);
  o.stop(when + dur + 0.05);
}

function brush(c: AudioContext, dest: AudioNode, when: number, vol: number) {
  const noise = c.createBufferSource();
  noise.buffer = getNoiseBuffer(c);
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 6500;
  const g = c.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0005, when + 0.09);
  noise.connect(hp).connect(g).connect(dest);
  noise.start(when);
  noise.stop(when + 0.11);
}

function scheduleBeat(c: AudioContext, bus: AudioNode, idx: number, when: number) {
  const { chord, bass } = PROG[Math.floor(idx / 4) % PROG.length];
  const beatInBar = idx % 4;

  if (beatInBar === 0) {
    chord.forEach((f, i) => padVoice(c, bus, when, f, BEAT * 4 * 0.98, i === 0 ? 0.05 : 0.042));
    ambBass(c, bus, when, bass, BEAT * 1.7, 0.2);
  }
  if (beatInBar === 2) {
    ambBass(c, bus, when, bass * 1.5, BEAT * 1.4, 0.13); // Quinte → leichtes Wandern
  }
  if (beatInBar === 1 || beatInBar === 3) {
    brush(c, bus, when, 0.05); // sanfter Backbeat
  }

  // Casino-Atmosphäre: vereinzeltes Münz-Glitzer / fernes Glöckchen
  if (Math.random() < 0.12) coinTink(c, bus, when + Math.random() * BEAT * 0.5);
  if (Math.random() < 0.05) {
    bellHit(c, bus, when + Math.random() * BEAT * 0.4, 1800 + Math.random() * 1600, 0.05, 0.5);
  }
}

export function startCasinoAmbience() {
  const c = getCtx();
  if (!c || !master) return;
  if (musicPlaying) return;
  musicPlaying = true;

  if (!musicGain) {
    musicGain = c.createGain();
    musicGain.gain.value = 0;
    musicGain.connect(master);
  }
  const bus = musicGain;
  const now = c.currentTime;
  bus.gain.cancelScheduledValues(now);
  bus.gain.setValueAtTime(bus.gain.value, now);
  bus.gain.linearRampToValueAtTime(0.55, now + 1.2); // sanfter Fade-In

  beatIndex = 0;
  nextBeatTime = now + 0.15;

  const run = () => {
    if (!musicPlaying || !ctx) return;
    while (nextBeatTime < ctx.currentTime + 0.12) {
      scheduleBeat(ctx, bus, beatIndex, nextBeatTime);
      nextBeatTime += BEAT;
      beatIndex++;
    }
  };
  run();
  musicTimer = window.setInterval(run, 25);
}

export function stopCasinoAmbience() {
  if (!musicPlaying) return;
  musicPlaying = false;
  if (musicTimer !== null) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
  if (ctx && musicGain) {
    const now = ctx.currentTime;
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(musicGain.gain.value, now);
    musicGain.gain.linearRampToValueAtTime(0, now + 0.5); // sanfter Fade-Out
  }
}
