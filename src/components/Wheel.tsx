"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, RotateCcw } from "lucide-react";
import { tick, winFanfare, spinStart } from "@/lib/audio";
import { fireConfetti } from "@/lib/confetti";
import { useSound } from "@/lib/sound";

const PALETTE = [
  "#FF2D55", "#FFD15C", "#5FE3C4", "#69A6FF",
  "#C589FF", "#FF8A3D", "#3DDC91", "#FF6B86",
];

const STARTING_NAMES = ["Du", "Schnüsi", "Bruno", "Lea", "Tom"];
const MAX_NAMES = 12;
const TWO_PI = Math.PI * 2;
const POINTER_ANGLE = -Math.PI / 2; // 12 Uhr

// Physik: exponential decay mit linear-stop tail.
// decel = BASE + DRAG·v  → mehr DRAG = mehr „exponentiell", mehr BASE = schnellerer Stop.
// Mit BASE=1.0, DRAG=0.20 läuft das Rad ~9 s; die letzten 1.5 s sind langsam & spannend.
const BASE_DECEL = 1.0;
const VEL_DRAG = 0.20;
const STOP_THRESHOLD = 0.05;

function shade(hex: string, amount: number): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const adj = (v: number) => Math.max(0, Math.min(255, Math.round(v + 255 * amount)));
  return `rgb(${adj(r)}, ${adj(g)}, ${adj(b)})`;
}

function segmentAtPointer(angle: number, n: number): number {
  if (n === 0) return 0;
  const seg = TWO_PI / n;
  let t = (POINTER_ANGLE - angle) % TWO_PI;
  if (t < 0) t += TWO_PI;
  return Math.floor(t / seg) % n;
}

export default function Wheel({ initialNames }: { initialNames?: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);
  const wheelStageRef = useRef<HTMLDivElement>(null);

  const angleRef = useRef(0);
  const velRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastSegRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const [names, setNames] = useState<string[]>(initialNames?.length ? initialNames : STARTING_NAMES);
  const [input, setInput] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [winning, setWinning] = useState(false);
  const [size, setSize] = useState(380);

  const { muted } = useSound();

  // Responsives Sizing
  useEffect(() => {
    function update() {
      const w = Math.min(480, window.innerWidth - 40);
      setSize(Math.max(280, Math.round(w)));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const draw = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    if (cvs.width !== Math.round(size * dpr)) {
      cvs.width = Math.round(size * dpr);
      cvs.height = Math.round(size * dpr);
    }
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const S = size;
    const C = S / 2;
    const R_OUTER = S * 0.5 - 4;
    const R_RING = R_OUTER - Math.max(14, S * 0.045);
    const R_SEG = R_RING * 0.985;
    const R_HUB = Math.max(28, S * 0.085);
    const A = angleRef.current;
    const n = names.length;

    ctx.clearRect(0, 0, S, S);

    // Outer ring (gold, metallic)
    const ring = ctx.createRadialGradient(C, C, R_RING, C, C, R_OUTER);
    ring.addColorStop(0, "#2a1f08");
    ring.addColorStop(0.45, "#8a6a1c");
    ring.addColorStop(0.78, "#FFD15C");
    ring.addColorStop(0.92, "#A07820");
    ring.addColorStop(1, "#3a2a08");
    ctx.beginPath();
    ctx.arc(C, C, R_OUTER, 0, TWO_PI);
    ctx.arc(C, C, R_RING, 0, TWO_PI, true);
    ctx.fillStyle = ring;
    ctx.fill();

    if (n === 0) return;
    const seg = TWO_PI / n;

    // Segments
    for (let i = 0; i < n; i++) {
      const a0 = i * seg + A;
      const base = PALETTE[i % PALETTE.length];

      ctx.beginPath();
      ctx.moveTo(C, C);
      ctx.arc(C, C, R_SEG, a0, a0 + seg);
      ctx.closePath();

      const grad = ctx.createRadialGradient(C, C, R_HUB * 0.5, C, C, R_SEG);
      grad.addColorStop(0, shade(base, -0.12));
      grad.addColorStop(0.55, base);
      grad.addColorStop(1, shade(base, -0.28));
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.lineWidth = 1.4;
      ctx.strokeStyle = "rgba(0,0,0,0.22)";
      ctx.stroke();

      // Name
      ctx.save();
      ctx.translate(C, C);
      ctx.rotate(a0 + seg / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 1;
      const fs = Math.max(13, Math.min(20, S / 22));
      ctx.font = `700 ${fs}px var(--font-display), system-ui, sans-serif`;
      const label = names[i].length > 12 ? names[i].slice(0, 11) + "…" : names[i];
      ctx.fillText(label, R_SEG - 18, 0);
      ctx.restore();
    }

    // Glanz-Highlight (oben links)
    ctx.save();
    ctx.beginPath();
    ctx.arc(C, C, R_SEG, 0, TWO_PI);
    ctx.clip();
    const gloss = ctx.createRadialGradient(C - S * 0.18, C - S * 0.22, S * 0.05, C - S * 0.18, C - S * 0.22, S * 0.5);
    gloss.addColorStop(0, "rgba(255,255,255,0.18)");
    gloss.addColorStop(0.6, "rgba(255,255,255,0)");
    ctx.fillStyle = gloss;
    ctx.fillRect(0, 0, S, S);
    ctx.restore();

    // Nabe
    const hubGrad = ctx.createRadialGradient(C - R_HUB * 0.35, C - R_HUB * 0.35, R_HUB * 0.1, C, C, R_HUB);
    hubGrad.addColorStop(0, "#3a3650");
    hubGrad.addColorStop(1, "#07060B");
    ctx.beginPath();
    ctx.arc(C, C, R_HUB, 0, TWO_PI);
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,209,92,0.85)";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(C, C, R_HUB * 0.22, 0, TWO_PI);
    ctx.fillStyle = "#FFD15C";
    ctx.fill();
  }, [names, size]);

  useEffect(() => {
    draw();
  }, [draw]);

  function kickPointer(velocity: number) {
    const el = pointerRef.current;
    if (!el) return;
    // Bei hoher Velocity ein grosser, bei niedriger ein deutlicher dramatischer Kick.
    const deg = Math.min(28, Math.max(5, velocity * 0.7 + 4));
    el.animate(
      [
        { transform: `translateX(-50%) rotate(${deg}deg)` },
        { transform: `translateX(-50%) rotate(-${deg * 0.18}deg)` },
        { transform: `translateX(-50%) rotate(0deg)` },
      ],
      { duration: velocity < 2 ? 380 : 260, easing: "cubic-bezier(.2,.7,.3,1)" }
    );
  }

  const step = useCallback((now: number) => {
    const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
    lastTimeRef.current = now;

    const v = velRef.current;
    const decel = BASE_DECEL + VEL_DRAG * v;
    let newV = v - decel * dt;
    if (newV < 0) newV = 0;

    angleRef.current += newV * dt;
    velRef.current = newV;

    const n = names.length;
    if (n > 0) {
      const idx = segmentAtPointer(angleRef.current, n);
      if (lastSegRef.current !== null && idx !== lastSegRef.current) {
        // Volume folgt der Velocity, aber min 0.25 damit auch leise Ticks knallen
        const vol = Math.max(0.25, Math.min(1, v / 14));
        if (!muted) tick(vol);
        kickPointer(v);
      }
      lastSegRef.current = idx;
    }

    draw();

    if (velRef.current <= STOP_THRESHOLD) {
      angleRef.current = ((angleRef.current % TWO_PI) + TWO_PI) % TWO_PI;
      const winnerIdx = segmentAtPointer(angleRef.current, n);
      const loser = names[winnerIdx];
      setSpinning(false);
      setResult(loser);
      setWinning(true);
      // Win-Pulse-Ring nach 1s wieder aus
      setTimeout(() => setWinning(false), 1400);
      if (!muted) winFanfare();
      fireConfetti();
      void logResult(loser);
      return;
    }

    rafRef.current = requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [names, muted, draw]);

  function spin() {
    if (spinning || names.length < 2) return;
    setSpinning(true);
    setResult(null);
    setWinning(false);
    lastSegRef.current = segmentAtPointer(angleRef.current, names.length);
    // 26–36 rad/s ≈ 4.1–5.7 U/s → ~9 s Spin
    velRef.current = 26 + Math.random() * 10;
    lastTimeRef.current = performance.now();
    if (!muted) spinStart();
    rafRef.current = requestAnimationFrame(step);
  }

  async function logResult(loser: string) {
    try {
      await fetch("/api/spins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loser, participants: names }),
      });
      window.dispatchEvent(new Event("spin-logged"));
    } catch (e) {
      console.error(e);
    }
  }

  function addName() {
    const v = input.trim();
    if (!v || names.length >= MAX_NAMES) return;
    if (names.includes(v)) {
      setInput("");
      return;
    }
    setNames((p) => [...p, v]);
    setInput("");
  }

  function removeName(i: number) {
    if (names.length <= 2 || spinning) return;
    setNames((p) => p.filter((_, idx) => idx !== i));
  }

  function resetWheel() {
    if (spinning) return;
    setResult(null);
    angleRef.current = 0;
    velRef.current = 0;
    lastSegRef.current = null;
    draw();
  }

  const canSpin = !spinning && names.length >= 2;

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Namens-Chips */}
      <div className="flex flex-wrap gap-2 justify-center max-w-[520px]">
        <AnimatePresence initial={false}>
          {names.map((name, i) => (
            <motion.span
              key={name + i}
              layout
              initial={{ opacity: 0, scale: 0.7, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: -8 }}
              transition={{ duration: 0.18 }}
              className="chip"
              style={{ borderLeft: `3px solid ${PALETTE[i % PALETTE.length]}` }}
            >
              <span>{name}</span>
              <button
                onClick={() => removeName(i)}
                disabled={spinning || names.length <= 2}
                aria-label={`${name} entfernen`}
                className="chip-x disabled:opacity-30"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="flex gap-2 w-full max-w-[420px]">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addName())}
          placeholder={names.length >= MAX_NAMES ? "Maximum erreicht" : "Name hinzufügen…"}
          maxLength={14}
          disabled={spinning || names.length >= MAX_NAMES}
          className="field"
        />
        <button
          onClick={addName}
          disabled={!input.trim() || spinning || names.length >= MAX_NAMES}
          className="btn-ghost !rounded-2xl !px-4 !py-3 disabled:opacity-40"
          aria-label="Hinzufügen"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Wheel-Stage */}
      <div ref={wheelStageRef} className="relative" style={{ width: size, height: size + 40 }}>
        {/* glow underneath */}
        <div
          className="absolute inset-0 -z-10 rounded-full opacity-70 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(255,45,85,0.35), transparent 60%)",
          }}
        />

        {/* Win Pulse Rings — Mitte des Canvas: (50%, 18 + size/2) */}
        {winning && (
          <>
            <span
              className="absolute rounded-full pointer-events-none"
              style={{
                width: size,
                height: size,
                left: "50%",
                top: 18 + size / 2,
                transform: "translate(-50%, -50%)",
                border: "3px solid rgba(255,209,92,0.75)",
                animation: "pulse-ring 1.2s ease-out forwards",
              }}
            />
            <span
              className="absolute rounded-full pointer-events-none"
              style={{
                width: size,
                height: size,
                left: "50%",
                top: 18 + size / 2,
                transform: "translate(-50%, -50%)",
                border: "3px solid rgba(255,45,85,0.7)",
                animation: "pulse-ring 1.2s ease-out 0.18s forwards",
              }}
            />
          </>
        )}

        {/* Pointer */}
        <div
          ref={pointerRef}
          className="absolute left-1/2 -translate-x-1/2 z-20"
          style={{ top: 0, transformOrigin: "50% 92%" }}
          aria-hidden
        >
          <svg width="46" height="56" viewBox="0 0 46 56" fill="none">
            <defs>
              <linearGradient id="ptr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFE8A8" />
                <stop offset="45%" stopColor="#FFD15C" />
                <stop offset="100%" stopColor="#A07820" />
              </linearGradient>
              <linearGradient id="ptr-edge" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7a5a18" />
                <stop offset="100%" stopColor="#2a1f08" />
              </linearGradient>
            </defs>
            <path
              d="M23 54 L4 14 Q4 4 14 4 L32 4 Q42 4 42 14 Z"
              fill="url(#ptr)"
              stroke="url(#ptr-edge)"
              strokeWidth="1.5"
            />
            <circle cx="23" cy="14" r="3" fill="#2a1f08" />
          </svg>
        </div>

        {/* Canvas */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full shadow-wheel"
          style={{ top: 18, width: size, height: size }}
        >
          <canvas
            ref={canvasRef}
            width={size}
            height={size}
            style={{ width: size, height: size, display: "block", borderRadius: "50%" }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button onClick={spin} disabled={!canSpin} className="btn-primary text-lg px-12 py-4">
          {spinning ? "Dreht…" : "DREHEN"}
        </button>
        <button onClick={resetWheel} className="btn-ghost" aria-label="Zurücksetzen" disabled={spinning}>
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 220, damping: 16 }}
            className="glass-strong mt-2 px-8 py-6 sm:px-10 sm:py-7 rounded-[28px] text-center relative overflow-hidden"
            style={{
              boxShadow: "0 30px 80px -10px rgba(255,45,85,0.5), 0 0 0 1px rgba(255,209,92,0.18) inset",
            }}
          >
            <div
              className="absolute inset-0 -z-10"
              style={{
                background: "radial-gradient(circle at 50% 0%, rgba(255,209,92,0.15), transparent 70%)",
              }}
            />
            <div className="text-xs uppercase tracking-[0.28em] text-fg-mute mb-2">
              🎰 Jackpot
            </div>
            <div className="font-display font-black text-5xl sm:text-6xl gradient-shame leading-none">
              {result}
            </div>
            <div className="mt-2 text-fg-soft text-sm font-medium">
              — du zahlst. Schande! 🔥
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
