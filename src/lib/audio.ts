// WebAudio-Engine — komplett ohne Audio-Files.
// "tick"  = mechanischer Peg-auf-Holz-Klick (gefilterter Noise + Body-Resonance)
// "win"   = Casino-Jackpot-Fanfare (Brass-Arpeggio + Drums + Shimmer-Bells)

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    master = ctx.createGain();
    master.gain.value = 0.85;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function getNoiseBuffer(c: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    const size = c.sampleRate * 0.12;
    noiseBuffer = c.createBuffer(1, size, c.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < size; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }
  return noiseBuffer;
}

/* ------------------------------------------------------------------
   TICK — mechanischer Peg-Click
   Komponenten:
   - Bandpass-gefilterter Noise-Burst (1.4–2 kHz, sehr kurz) → "klick"
   - Sine-Body (180→90 Hz, ~70 ms) → "thock"
   - Leicht randomisierte Frequenz pro Aufruf
   ------------------------------------------------------------------ */
export function tick(volume = 1) {
  const c = getCtx();
  if (!c || !master) return;
  const now = c.currentTime;
  const vol = Math.max(0, Math.min(1, volume));

  // 1) Click — kurzer Noise-Burst durch Bandpass
  const noise = c.createBufferSource();
  noise.buffer = getNoiseBuffer(c);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1500 + Math.random() * 600;
  bp.Q.value = 4;
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 600;
  const nGain = c.createGain();
  nGain.gain.setValueAtTime(0, now);
  nGain.gain.linearRampToValueAtTime(0.32 * vol, now + 0.001);
  nGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.045);
  noise.connect(bp).connect(hp).connect(nGain).connect(master);
  noise.start(now);
  noise.stop(now + 0.06);

  // 2) Body — tiefer Holz-„thock"
  const body = c.createOscillator();
  body.type = "sine";
  const bodyF = 170 + Math.random() * 40;
  body.frequency.setValueAtTime(bodyF, now);
  body.frequency.exponentialRampToValueAtTime(bodyF * 0.55, now + 0.05);
  const bGain = c.createGain();
  bGain.gain.setValueAtTime(0, now);
  bGain.gain.linearRampToValueAtTime(0.22 * vol, now + 0.003);
  bGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.09);
  body.connect(bGain).connect(master);
  body.start(now);
  body.stop(now + 0.1);

  // 3) Mini-„attack" auf 3kHz für extra Knack
  const attack = c.createOscillator();
  attack.type = "square";
  attack.frequency.value = 2800;
  const aGain = c.createGain();
  aGain.gain.setValueAtTime(0, now);
  aGain.gain.linearRampToValueAtTime(0.05 * vol, now + 0.0005);
  aGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);
  attack.connect(aGain).connect(master);
  attack.start(now);
  attack.stop(now + 0.015);
}

/* ------------------------------------------------------------------
   WIN — Casino-Jackpot-Fanfare
   Komponenten:
   - Brass-Sawtooth-Arpeggio (C-E-G-C-E-G aufsteigend)
   - Held C-Major-Chord (~1.6s)
   - Kick-Drums (4 Beats)
   - Shimmer-Bells (zufällige hohe Sines)
   - Ducked Master-Gain damit das Zeug nicht clipped
   ------------------------------------------------------------------ */
export function winFanfare() {
  const c = getCtx();
  if (!c || !master) return;
  const now = c.currentTime;

  // Master-Ducking: Anfang etwas runter, dann wieder hoch
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(0.85, now);
  master.gain.linearRampToValueAtTime(0.7, now + 0.05);
  master.gain.linearRampToValueAtTime(0.85, now + 2.2);

  // 1) Brass-Arpeggio aufsteigend
  const arp = [
    { f: 523.25, t: 0.00 },  // C5
    { f: 659.25, t: 0.08 },  // E5
    { f: 783.99, t: 0.16 },  // G5
    { f: 1046.5, t: 0.24 },  // C6
    { f: 1318.5, t: 0.32 },  // E6
    { f: 1568.0, t: 0.40 },  // G6
    { f: 2093.0, t: 0.48 },  // C7
  ];

  arp.forEach(({ f, t }) => {
    const osc = c.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = f;
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, now + t);
    filter.frequency.exponentialRampToValueAtTime(4500, now + t + 0.05);
    filter.Q.value = 3.5;
    const g = c.createGain();
    g.gain.setValueAtTime(0, now + t);
    g.gain.linearRampToValueAtTime(0.09, now + t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.22);
    osc.connect(filter).connect(g).connect(master!);
    osc.start(now + t);
    osc.stop(now + t + 0.25);
  });

  // 2) Held C-Major-Chord nach dem Arpeggio
  const chord = [1046.5, 1318.5, 1568.0, 2093.0]; // C6 E6 G6 C7
  chord.forEach((f, i) => {
    const osc = c.createOscillator();
    osc.type = i < 2 ? "sawtooth" : "square";
    osc.frequency.value = f;
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 3500;
    filter.Q.value = 2;
    const g = c.createGain();
    const t = 0.56;
    g.gain.setValueAtTime(0, now + t);
    g.gain.linearRampToValueAtTime(0.06, now + t + 0.06);
    g.gain.setValueAtTime(0.06, now + t + 1.2);
    g.gain.exponentialRampToValueAtTime(0.0008, now + t + 1.7);
    osc.connect(filter).connect(g).connect(master!);
    osc.start(now + t);
    osc.stop(now + t + 1.75);
  });

  // 3) Kick-Drums — 4 Beats
  [0.05, 0.32, 0.6, 1.1].forEach((t, i) => {
    const drum = c.createOscillator();
    const dg = c.createGain();
    drum.type = "sine";
    drum.frequency.setValueAtTime(150, now + t);
    drum.frequency.exponentialRampToValueAtTime(38, now + t + 0.18);
    const peak = i === 0 ? 0.5 : 0.38;
    dg.gain.setValueAtTime(0, now + t);
    dg.gain.linearRampToValueAtTime(peak, now + t + 0.005);
    dg.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.25);
    drum.connect(dg).connect(master!);
    drum.start(now + t);
    drum.stop(now + t + 0.28);
  });

  // 4) Shimmer-Bells — 18 zufällige hohe Sines
  for (let i = 0; i < 18; i++) {
    const t = 0.35 + Math.random() * 1.65;
    const f = 1800 + Math.random() * 2800;
    const bell = c.createOscillator();
    const bg = c.createGain();
    bell.type = "sine";
    bell.frequency.value = f;
    bg.gain.setValueAtTime(0, now + t);
    bg.gain.linearRampToValueAtTime(0.045, now + t + 0.005);
    bg.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.35);
    bell.connect(bg).connect(master!);
    bell.start(now + t);
    bell.stop(now + t + 0.4);
  }

  // 5) Sub-Bass-Sweep am Ende für „landing"
  const sub = c.createOscillator();
  sub.type = "sine";
  sub.frequency.setValueAtTime(60, now + 1.4);
  sub.frequency.linearRampToValueAtTime(80, now + 1.7);
  const sg = c.createGain();
  sg.gain.setValueAtTime(0, now + 1.4);
  sg.gain.linearRampToValueAtTime(0.3, now + 1.45);
  sg.gain.exponentialRampToValueAtTime(0.0005, now + 2.1);
  sub.connect(sg).connect(master);
  sub.start(now + 1.4);
  sub.stop(now + 2.15);
}

/* ------------------------------------------------------------------
   SPIN-START — kurzer „whoosh" beim Drücken auf DREHEN
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
