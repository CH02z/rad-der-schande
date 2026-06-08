"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, RotateCcw, Target, Swords, Check } from "lucide-react";
import { tick, winFanfare, spinStart } from "@/lib/audio";
import { fireConfetti } from "@/lib/confetti";
import { useSound } from "@/lib/sound";

/* ============================================================
   PALETTE & CONSTANTS
   ============================================================ */

const PALETTE = [
  "#FF2D55", "#E8C36A", "#5FE3C4", "#69A6FF",
  "#C589FF", "#FF8A3D", "#3DDC91", "#FF6B86",
];

const STARTING_NAMES = ["Du", "Schnüsi", "Bruno", "Lea", "Tom"];
const MAX_NAMES = 12;
const TWO_PI = Math.PI * 2;
const POINTER_ANGLE = -Math.PI / 2;

// Physik: ~9 s Spin mit dramatischem Tail
const BASE_DECEL = 1.0;
const VEL_DRAG = 0.20;
const STOP_THRESHOLD = 0.05;

// Ruhezustand: ganz leichtes Drehen, lebendig aber unaufdringlich
const IDLE_VELOCITY = 0.32;     // rad/s ≈ 1 U / 20 s

// Auto-Fit-Fonts
const FONT_PROBE = 100;
const FONT_FALLBACK = 'system-ui, "Helvetica Neue", Arial, sans-serif';
const FONT_WEIGHT = 800;
const FONT_MIN = 18;
const FONT_MAX = 100;

type Mode = "classic" | "elim";
type Phase = "idle" | "spinning" | "stopped";

const MODES = [
  {
    id: "classic" as Mode,
    title: "Klassisch",
    desc: "Ein Spin, eine Schande.",
    accent: "#FF2D55",
    Icon: Target,
  },
  {
    id: "elim" as Mode,
    title: "Eliminierung",
    desc: "Letzter im Rad verliert.",
    accent: "#E8C36A",
    Icon: Swords,
  },
];

/* ============================================================
   HELPERS
   ============================================================ */

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

/* ============================================================
   COMPONENT
   ============================================================ */

export default function Wheel({ initialNames }: { initialNames?: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);

  // Animation-Refs (immer aktueller Wert für RAF-Loop)
  const angleRef = useRef(0);
  const velRef = useRef(IDLE_VELOCITY);
  const lastTimeRef = useRef(0);
  const lastSegRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>("idle");

  // Refs gespiegelt von State (damit RAF immer aktuelle Werte sieht)
  const namesRef = useRef<string[]>(initialNames?.length ? initialNames : STARTING_NAMES);
  const modeRef = useRef<Mode>("classic");
  const mutedRef = useRef(false);
  const sizeRef = useRef(380);
  const fontFamilyRef = useRef<string>(FONT_FALLBACK);

  // React State (UI)
  const [names, setNames] = useState<string[]>(initialNames?.length ? initialNames : STARTING_NAMES);
  const [input, setInput] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [winning, setWinning] = useState(false);
  const [size, setSize] = useState(380);
  const [mode, setMode] = useState<Mode>("classic");
  const [originalRoster, setOriginalRoster] = useState<string[] | null>(null);
  const [eliminated, setEliminated] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState<string>(FONT_FALLBACK);

  const { muted } = useSound();

  // === Sync state → refs ===
  useEffect(() => { namesRef.current = names; }, [names]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => { sizeRef.current = size; }, [size]);
  useEffect(() => { fontFamilyRef.current = fontFamily; }, [fontFamily]);

  const inElimGame = mode === "elim" && originalRoster !== null;

  // === Resize ===
  useEffect(() => {
    function update() {
      const w = Math.min(580, window.innerWidth - 40);
      setSize(Math.max(280, Math.round(w)));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // === Font-Resolution ===
  useEffect(() => {
    try {
      const resolved = getComputedStyle(document.documentElement)
        .getPropertyValue("--font-display")
        .trim();
      if (resolved) setFontFamily(`${resolved}, ${FONT_FALLBACK}`);
    } catch {}
  }, []);

  // === Draw (nutzt Refs) ===
  const drawWheel = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const names = namesRef.current;
    const S = sizeRef.current;
    const fontFamily = fontFamilyRef.current;

    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    if (cvs.width !== Math.round(S * dpr)) {
      cvs.width = Math.round(S * dpr);
      cvs.height = Math.round(S * dpr);
    }
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const C = S / 2;
    const R_OUTER = S * 0.5 - 4;
    const R_RING = R_OUTER - Math.max(14, S * 0.045);
    const R_SEG = R_RING * 0.985;
    const R_HUB = Math.max(28, S * 0.085);
    const A = angleRef.current;
    const n = names.length;

    ctx.clearRect(0, 0, S, S);

    // Gold-Ring
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

    // Auto-Fit Box
    const labelRadial = R_SEG - R_HUB - 14;
    const radialMid = (R_SEG + R_HUB) / 2;
    const labelTangential = radialMid * seg * 0.78;

    // Uniform Font-Size — kleinste die für ALLE passt
    ctx.font = `${FONT_WEIGHT} ${FONT_PROBE}px ${fontFamily}`;
    let chosenFs = Math.min(FONT_MAX, labelTangential);
    for (const name of names) {
      const w = Math.max(1, ctx.measureText(name).width);
      const fitByWidth = (labelRadial / w) * FONT_PROBE;
      if (fitByWidth < chosenFs) chosenFs = fitByWidth;
    }
    chosenFs = Math.max(FONT_MIN, chosenFs);

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

      ctx.save();
      ctx.translate(C, C);
      ctx.rotate(a0 + seg / 2);
      ctx.font = `${FONT_WEIGHT} ${chosenFs}px ${fontFamily}`;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.lineWidth = Math.max(3, chosenFs * 0.10);
      ctx.strokeStyle = "rgba(0,0,0,0.78)";
      ctx.lineJoin = "round";
      ctx.miterLimit = 2;
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = Math.max(5, chosenFs * 0.16);
      ctx.shadowOffsetY = 2;
      ctx.strokeText(names[i], R_SEG - 10, 0);
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = "#fff";
      ctx.fillText(names[i], R_SEG - 10, 0);
      ctx.restore();
    }

    // Glanz-Highlight
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

    // Hub
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
  }, []);

  function kickPointer(velocity: number) {
    const el = pointerRef.current;
    if (!el) return;
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

  async function logResult(loser: string) {
    try {
      await fetch("/api/spins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loser, participants: namesRef.current }),
      });
      window.dispatchEvent(new Event("spin-logged"));
    } catch (e) {
      console.error(e);
    }
  }

  // === Phasen-Übergang am Ende eines Spins ===
  const finishSpin = useCallback(() => {
    const names = namesRef.current;
    const mode = modeRef.current;
    const n = names.length;
    const winnerIdx = segmentAtPointer(angleRef.current, n);
    const landedName = names[winnerIdx];

    setSpinning(false);

    if (mode === "classic") {
      setResult(landedName);
      setWinning(true);
      setTimeout(() => setWinning(false), 1400);
      if (!mutedRef.current) winFanfare();
      fireConfetti();
      void logResult(landedName);
    } else {
      if (n <= 2) {
        const loser = names.find((_, i) => i !== winnerIdx)!;
        setEliminated(landedName);
        setTimeout(() => {
          setEliminated(null);
          setNames([loser]);
          setResult(loser);
          setWinning(true);
          setTimeout(() => setWinning(false), 1400);
          if (!mutedRef.current) winFanfare();
          fireConfetti();
          void logResult(loser);
        }, 1600);
      } else {
        setEliminated(landedName);
        setTimeout(() => {
          setNames((p) => p.filter((_, i) => i !== winnerIdx));
          setEliminated(null);
          phaseRef.current = "idle";
          lastSegRef.current = null;
        }, 1600);
      }
    }
  }, []);

  // === RAF-Loop (läuft permanent) ===
  const step = useCallback(
    (now: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = now;
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      const phase = phaseRef.current;
      const n = namesRef.current.length;

      if (phase === "idle") {
        velRef.current = IDLE_VELOCITY;
        angleRef.current += IDLE_VELOCITY * dt;
        // Keine Ticks, keine Kicks
      } else if (phase === "spinning") {
        const v = velRef.current;
        const decel = BASE_DECEL + VEL_DRAG * v;
        let newV = v - decel * dt;
        if (newV < 0) newV = 0;
        angleRef.current += newV * dt;
        velRef.current = newV;

        if (n > 0) {
          const idx = segmentAtPointer(angleRef.current, n);
          if (lastSegRef.current !== null && idx !== lastSegRef.current) {
            const vol = Math.max(0.25, Math.min(1, v / 14));
            if (!mutedRef.current) tick(vol);
            kickPointer(v);
          }
          lastSegRef.current = idx;
        }

        if (newV <= STOP_THRESHOLD) {
          phaseRef.current = "stopped";
          angleRef.current = ((angleRef.current % TWO_PI) + TWO_PI) % TWO_PI;
          finishSpin();
        }
      }
      // "stopped" → keine Bewegung, draw zeigt den Endzustand

      drawWheel();
      rafRef.current = requestAnimationFrame(step);
    },
    [drawWheel, finishSpin]
  );

  // RAF einmal starten
  useEffect(() => {
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [step]);

  function spin() {
    if (spinning || eliminated || names.length < 2) return;
    if (mode === "elim" && originalRoster === null) {
      setOriginalRoster([...names]);
    }
    setSpinning(true);
    setResult(null);
    setWinning(false);
    lastSegRef.current = segmentAtPointer(angleRef.current, names.length);
    velRef.current = 26 + Math.random() * 10;
    phaseRef.current = "spinning";
    if (!muted) spinStart();
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
    if (names.length <= 2 || spinning || inElimGame) return;
    setNames((p) => p.filter((_, idx) => idx !== i));
  }

  function dismissResult() {
    setResult(null);
    if (mode === "elim" && originalRoster) {
      setNames(originalRoster);
      setOriginalRoster(null);
    }
    phaseRef.current = "idle";
    lastSegRef.current = null;
  }

  function resetWheel() {
    if (spinning) return;
    setResult(null);
    setEliminated(null);
    angleRef.current = 0;
    velRef.current = IDLE_VELOCITY;
    lastSegRef.current = null;
    phaseRef.current = "idle";
    if (mode === "elim" && originalRoster) {
      setNames(originalRoster);
      setOriginalRoster(null);
    }
  }

  function changeMode(next: Mode) {
    if (spinning || eliminated) return;
    if (next === mode) return;
    if (originalRoster) {
      setNames(originalRoster);
      setOriginalRoster(null);
    }
    setResult(null);
    setMode(next);
  }

  const canSpin = !spinning && !eliminated && names.length >= 2;
  const lockedForElim = inElimGame;

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* === MODE CARDS === */}
      <div className="grid grid-cols-2 gap-2.5 w-full max-w-[480px]">
        {MODES.map((m) => {
          const active = mode === m.id;
          const Icon = m.Icon;
          return (
            <button
              key={m.id}
              onClick={() => changeMode(m.id)}
              disabled={spinning || eliminated !== null}
              data-active={active}
              className="mode-card disabled:cursor-not-allowed"
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className="grid place-items-center w-10 h-10 rounded-xl"
                  style={{
                    background: `color-mix(in srgb, ${m.accent} 18%, transparent)`,
                    color: m.accent,
                  }}
                >
                  <Icon size={18} strokeWidth={2.3} />
                </div>
                {active && (
                  <div
                    className="grid place-items-center w-5 h-5 rounded-full"
                    style={{
                      background: "linear-gradient(135deg, #FFE8A8, #E8C36A)",
                      color: "#1a1a1a",
                      boxShadow: "0 2px 8px rgba(232,195,106,0.5)",
                    }}
                  >
                    <Check size={12} strokeWidth={3.5} />
                  </div>
                )}
              </div>
              <div className="font-display font-extrabold text-base sm:text-lg text-fg leading-tight">
                {m.title}
              </div>
              <div className="text-[11px] sm:text-xs text-fg-mute mt-0.5 leading-snug">
                {m.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* Status / Roster-Info */}
      {inElimGame && (
        <div
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold"
          style={{
            background: "rgba(232,195,106,0.12)",
            color: "#E8C36A",
            border: "1px solid rgba(232,195,106,0.32)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#E8C36A", boxShadow: "0 0 8px #E8C36A" }}
          />
          {names.length} von {originalRoster?.length} im Rennen
        </div>
      )}

      {/* Namens-Chips */}
      <div className="flex flex-wrap gap-2 justify-center max-w-[520px]">
        <AnimatePresence initial={false}>
          {names.map((name, i) => (
            <motion.span
              key={name + "-" + i}
              layout
              initial={{ opacity: 0, scale: 0.7, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: -20, transition: { duration: 0.4 } }}
              transition={{ duration: 0.18 }}
              className="chip"
              style={{ borderLeft: `3px solid ${PALETTE[i % PALETTE.length]}` }}
            >
              <span>{name}</span>
              <button
                onClick={() => removeName(i)}
                disabled={spinning || names.length <= 2 || lockedForElim}
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
          placeholder={
            lockedForElim
              ? "Spiel läuft — keine Änderungen möglich"
              : names.length >= MAX_NAMES
                ? "Maximum erreicht"
                : "Name hinzufügen…"
          }
          maxLength={14}
          disabled={spinning || names.length >= MAX_NAMES || lockedForElim}
          className="field"
        />
        <button
          onClick={addName}
          disabled={!input.trim() || spinning || names.length >= MAX_NAMES || lockedForElim}
          className="btn-ghost !rounded-2xl !px-4 !py-3 disabled:opacity-40"
          aria-label="Hinzufügen"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Wheel-Stage */}
      <div className="relative" style={{ width: size, height: size + 40 }}>
        <div
          className="absolute inset-0 -z-10 rounded-full opacity-70 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(255,45,85,0.35), transparent 60%)",
          }}
        />

        {winning && (
          <>
            <span
              className="absolute rounded-full pointer-events-none"
              style={{
                width: size, height: size,
                left: "50%", top: 18 + size / 2,
                transform: "translate(-50%, -50%)",
                border: "3px solid rgba(232,195,106,0.75)",
                animation: "pulse-ring 1.2s ease-out forwards",
              }}
            />
            <span
              className="absolute rounded-full pointer-events-none"
              style={{
                width: size, height: size,
                left: "50%", top: 18 + size / 2,
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

      {/* Eliminations-Banner */}
      <AnimatePresence>
        {eliminated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 grid place-items-center px-6 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 40%, rgba(180,30,40,0.35), rgba(0,0,0,0.55))",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -6 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="text-center"
            >
              <div className="text-xs font-bold uppercase tracking-[0.4em] text-shame mb-3">
                Ausgeschieden
              </div>
              <div
                className="font-display font-black gradient-shame leading-[0.85]"
                style={{
                  fontSize: "clamp(3.5rem, 14vw, 8rem)",
                  filter: "drop-shadow(0 6px 30px rgba(255,45,85,0.45))",
                  textDecoration: "line-through",
                  textDecorationThickness: "0.05em",
                  textDecorationColor: "rgba(255,255,255,0.3)",
                }}
              >
                {eliminated}
              </div>
              <div className="mt-3 text-white/70 text-sm uppercase tracking-[0.25em]">
                ist sicher
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen-Loser-Reveal */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-50 grid place-items-center px-6"
            onClick={dismissResult}
            style={{
              background:
                "radial-gradient(circle at 50% 25%, rgba(60,0,20,0.78), rgba(0,0,0,0.95))",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 45%, rgba(255,45,85,0.35), transparent 55%)",
              }}
            />

            <motion.div
              initial={{ scale: 0.7, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.08 }}
              onClick={(e) => e.stopPropagation()}
              className="relative text-center max-w-3xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="font-bold gradient-gold tracking-[0.5em] text-sm sm:text-base mb-5 sm:mb-7"
              >
                🎰 JACKPOT 🎰
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.8, type: "spring", stiffness: 140, damping: 14 }}
                className="font-display font-black gradient-shame leading-[0.82] mb-6 break-words"
                style={{
                  fontSize: "clamp(4rem, 18vw, 11rem)",
                  filter: "drop-shadow(0 8px 40px rgba(255,45,85,0.5))",
                }}
              >
                {result}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="font-display font-bold text-2xl sm:text-4xl text-white/95 mb-10"
              >
                trägt die <span className="gradient-shame">Schande</span>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.4 }}
                onClick={dismissResult}
                className="inline-flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-semibold transition-all"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(232,195,106,0.4)",
                  color: "#fff",
                  backdropFilter: "blur(20px)",
                }}
              >
                {mode === "elim" ? "Neue Runde" : "Weiter"}
              </motion.button>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-white/40 whitespace-nowrap"
              >
                Tippe irgendwo, um zu schliessen
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
