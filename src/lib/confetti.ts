// Konfetti per CSS-Drops + Screen-Flash, ohne Library.
const COLORS = ["#FF2D55", "#FFD15C", "#5FE3C4", "#69A6FF", "#C589FF", "#FF8A3D", "#FFFFFF"];

function burst(count: number, startMs: number) {
  setTimeout(() => {
    const wrap = document.createElement("div");
    wrap.className = "confetti-wrap";

    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "confetti-piece";
      p.style.left = `${Math.random() * 100}vw`;
      p.style.background = COLORS[i % COLORS.length];
      p.style.setProperty("--dx", `${(Math.random() - 0.5) * 320}px`);
      p.style.setProperty("--rot", `${(Math.random() < 0.5 ? -1 : 1) * (720 + Math.random() * 720)}deg`);
      p.style.setProperty("--dur", `${2.0 + Math.random() * 1.8}s`);
      p.style.animationDelay = `${Math.random() * 0.25}s`;
      p.style.width = `${6 + Math.random() * 10}px`;
      p.style.height = `${10 + Math.random() * 14}px`;
      wrap.appendChild(p);
    }

    document.body.appendChild(wrap);
    setTimeout(() => wrap.remove(), 4500);
  }, startMs);
}

export function fireConfetti() {
  if (typeof document === "undefined") return;

  // 3 gestaffelte Bursts — fühlt sich nach mehr an
  burst(90, 0);
  burst(60, 280);
  burst(50, 560);

  // Kurzer warmer Screen-Flash
  const flash = document.createElement("div");
  flash.className = "win-flash";
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 1100);
}
