// Mini-WebAudio-Helper: Tick + Win-Fanfare ohne Audio-Files.
// Lazy init bei erster User-Interaktion (Safari/iOS-Policy).

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export function tick(volume = 1) {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(820, now);
  osc.frequency.exponentialRampToValueAtTime(380, now + 0.05);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.14 * volume, now + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.07);
}

export function winFanfare() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = f;
    const t = now + i * 0.07;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.55);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.6);
  });
}
