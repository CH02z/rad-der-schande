// Konfetti per CSS-Drops, ohne Library.
const COLORS = ["#FF2D55", "#FFD15C", "#5FE3C4", "#69A6FF", "#C589FF", "#FF8A3D"];

export function fireConfetti(count = 90) {
  if (typeof document === "undefined") return;
  const wrap = document.createElement("div");
  wrap.className = "confetti-wrap";

  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "confetti-piece";
    p.style.left = `${Math.random() * 100}vw`;
    p.style.background = COLORS[i % COLORS.length];
    p.style.setProperty("--dx", `${(Math.random() - 0.5) * 260}px`);
    p.style.animationDelay = `${Math.random() * 0.35}s`;
    p.style.animationDuration = `${1.8 + Math.random() * 1.6}s`;
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    p.style.width = `${6 + Math.random() * 8}px`;
    p.style.height = `${10 + Math.random() * 10}px`;
    wrap.appendChild(p);
  }

  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 4000);
}
