"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, RotateCcw, Target, Swords, Check, ArrowLeft, ArrowRight,
  Users, UserPlus, RefreshCw,
} from "lucide-react";
import { tick, winFanfare, spinStart, startCasinoAmbience, stopCasinoAmbience } from "@/lib/audio";
import { fireConfetti } from "@/lib/confetti";
import { useSound } from "@/lib/sound";
import { useCrew } from "@/lib/crew-context";
import { useT } from "@/lib/i18n";
import BindingDecree from "@/components/BindingDecree";

/* ============================================================
   CONSTANTS
   ============================================================ */

const PALETTE = [
  "#FF2D55", "#E8C36A", "#5FE3C4", "#69A6FF",
  "#C589FF", "#FF8A3D", "#3DDC91", "#FF6B86",
];

const SOLO_DEFAULT_NAMES = ["Du", "Schnüsi", "Bruno", "Lea", "Tom"];
const MAX_ROSTER = 12;
const TWO_PI = Math.PI * 2;
const POINTER_ANGLE = -Math.PI / 2;

const BASE_DECEL = 1.0;
const VEL_DRAG = 0.20;
const STOP_THRESHOLD = 0.05;
const IDLE_VELOCITY = 0.32;

// Hand-Spin (Drag/Flick): ab welcher Schleudergeschwindigkeit ein Wurf zählt
// und die Bandbreite (rad/s), auf die der Auswurf gemappt wird. So fühlt sich
// ein sanfter Anstoss kurz, ein kräftiger Flick lang an — wie ein echtes Rad.
const THROW_MIN_VEL = 2.0;
const MIN_LAUNCH_VEL = 7;
const MAX_LAUNCH_VEL = 44;

const FONT_PROBE = 100;
const FONT_FALLBACK = 'system-ui, "Helvetica Neue", Arial, sans-serif';
const FONT_WEIGHT = 800;
const FONT_MIN = 18;
const FONT_MAX = 100;

type Mode = "classic" | "elim";
type Phase = "idle" | "dragging" | "spinning" | "stopped";
type View = "setup" | "game";

/** Ein Teilnehmer am Rad — entweder Crew-Member (userId) oder Gast (null). */
interface RosterEntry {
  userId: string | null;
  name: string;
  image?: string | null;
  isGuest: boolean;
  /** Aktuelle Session-Beteiligung. Ausgeschlossene erscheinen nicht auf dem Rad. */
  included: boolean;
}

function makeKey(r: { userId: string | null; name: string }): string {
  return r.userId ? `u:${r.userId}` : `g:${r.name}`;
}

function defaultSoloRoster(): RosterEntry[] {
  return SOLO_DEFAULT_NAMES.map((n) => ({
    userId: null,
    name: n,
    isGuest: true,
    included: true,
  }));
}

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

export default function Wheel() {
  const { activeCrew, activeCrewId } = useCrew();
  const { t } = useT();
  const MODES_TR = [
    { id: "classic" as Mode, title: t("wheel.modes.classic"), desc: t("wheel.modes.classicDesc"), accent: "#FF2D55", Icon: Target },
    { id: "elim" as Mode, title: t("wheel.modes.elim"), desc: t("wheel.modes.elimDesc"), accent: "#E8C36A", Icon: Swords },
  ];

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);

  // === Animation-Refs ===
  const angleRef = useRef(0);
  const velRef = useRef(IDLE_VELOCITY);
  const lastTimeRef = useRef(0);
  const lastSegRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>("idle");

  // === Hand-Spin (Drag/Flick) ===
  const pointerIdRef = useRef<number | null>(null);
  const dragLastAngleRef = useRef(0);
  const dragSpeedRef = useRef(0);
  const dragMovedRef = useRef(0);
  const dragSamplesRef = useRef<Array<{ t: number; a: number }>>([]);

  // === Roster-Refs (für RAF-Loop) ===
  const rosterRef = useRef<RosterEntry[]>(defaultSoloRoster());
  const modeRef = useRef<Mode>("classic");
  const mutedRef = useRef(false);
  const sizeRef = useRef(380);
  const fontFamilyRef = useRef<string>(FONT_FALLBACK);

  // === UI-State ===
  const [view, setView] = useState<View>("setup");
  const [roster, setRoster] = useState<RosterEntry[]>(defaultSoloRoster());
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [input, setInput] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<RosterEntry | null>(null);
  const [resultConsequence, setResultConsequence] = useState<string | null>(null);
  const [winning, setWinning] = useState(false);
  const [size, setSize] = useState(380);
  const [mode, setMode] = useState<Mode>("classic");
  const [consequences, setConsequences] = useState<string[]>([]);
  // Während Elim-Spiel: Snapshot des Rosters (gefilterte Included) für „Neue Runde"
  const [originalRoster, setOriginalRoster] = useState<RosterEntry[] | null>(null);
  const [eliminated, setEliminated] = useState<RosterEntry | null>(null);
  const [fontFamily, setFontFamily] = useState<string>(FONT_FALLBACK);

  const consequencesRef = useRef<string[]>([]);
  const lastCrewIdRef = useRef<string | null>(null);

  const { muted } = useSound();

  // Sync state → refs
  useEffect(() => { rosterRef.current = roster; }, [roster]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => { sizeRef.current = size; }, [size]);
  useEffect(() => { fontFamilyRef.current = fontFamily; }, [fontFamily]);
  useEffect(() => { consequencesRef.current = consequences; }, [consequences]);

  const inElimGame = mode === "elim" && originalRoster !== null;
  const includedRoster = roster.filter((r) => r.included);
  const canSpin =
    !spinning && !eliminated && includedRoster.length >= 2;
  const lockedForElim = inElimGame;

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

  // === Crew-Roster Loading ===
  // Wenn activeCrewId set: lade Members aus /api/crews/[id].
  // Solo: fallback auf SOLO_DEFAULT_NAMES.
  const loadCrewRoster = useCallback(async () => {
    if (!activeCrewId) {
      setRoster(defaultSoloRoster());
      setConsequences([]);
      setOriginalRoster(null);
      lastCrewIdRef.current = null;
      return;
    }
    setLoadingRoster(true);
    try {
      const res = await fetch(`/api/crews/${activeCrewId}`);
      if (!res.ok) {
        setRoster(defaultSoloRoster());
        setConsequences([]);
        return;
      }
      const data = (await res.json()) as {
        defaultMode: "classic" | "elim";
        consequences: string[];
        members: Array<{
          userId: string;
          displayName: string;
          image: string | null;
        }>;
      };
      const entries: RosterEntry[] = data.members.slice(0, MAX_ROSTER).map((m) => ({
        userId: m.userId,
        name: m.displayName,
        image: m.image,
        isGuest: false,
        included: true,
      }));
      setRoster(entries);
      setConsequences(data.consequences ?? []);
      setOriginalRoster(null);
      // Default-Modus nur bei echtem Crew-Wechsel anwenden, nicht jeden Refresh
      if (lastCrewIdRef.current !== activeCrewId) {
        setMode(data.defaultMode ?? "classic");
        lastCrewIdRef.current = activeCrewId;
      }
    } finally {
      setLoadingRoster(false);
    }
  }, [activeCrewId]);

  useEffect(() => {
    void loadCrewRoster();
  }, [loadCrewRoster]);

  // === Draw ===
  const drawWheel = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const names = rosterRef.current.filter((r) => r.included).map((r) => r.name);
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
    const labelRadial = R_SEG - R_HUB - 14;
    const radialMid = (R_SEG + R_HUB) / 2;
    const labelTangential = radialMid * seg * 0.78;

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

    // Glanz
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

  async function logResult(loser: RosterEntry, allPlaying: RosterEntry[]) {
    try {
      await fetch("/api/spins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loser: { userId: loser.userId, name: loser.name },
          participants: allPlaying.map((p) => ({ userId: p.userId, name: p.name })),
          mode: modeRef.current,
        }),
      });
      window.dispatchEvent(new Event("spin-logged"));
    } catch (e) {
      console.error(e);
    }
  }

  const finishSpin = useCallback(() => {
    const currentRoster = rosterRef.current;
    const playing = currentRoster.filter((r) => r.included);
    const mode = modeRef.current;
    const n = playing.length;
    if (n === 0) return;

    const winnerIdx = segmentAtPointer(angleRef.current, n);
    const landed = playing[winnerIdx];
    setSpinning(false);

    if (mode === "classic") {
      setResult(landed);
      const list = consequencesRef.current;
      setResultConsequence(
        list.length > 0 ? list[Math.floor(Math.random() * list.length)] : null
      );
      setWinning(true);
      setTimeout(() => setWinning(false), 1400);
      if (!mutedRef.current) winFanfare();
      fireConfetti();
      void logResult(landed, playing);
      return;
    }

    // === Elim-Mode ===
    if (n <= 2) {
      const loser = playing.find((_, i) => i !== winnerIdx)!;
      setEliminated(landed);
      setTimeout(() => {
        setEliminated(null);
        // Letzten Schritt anwenden: only loser included
        setRoster((prev) =>
          prev.map((r) =>
            makeKey(r) === makeKey(loser)
              ? { ...r, included: true }
              : { ...r, included: false }
          )
        );
        setResult(loser);
        const list = consequencesRef.current;
        setResultConsequence(
          list.length > 0 ? list[Math.floor(Math.random() * list.length)] : null
        );
        setWinning(true);
        setTimeout(() => setWinning(false), 1400);
        if (!mutedRef.current) winFanfare();
        fireConfetti();
        void logResult(loser, [loser]);
      }, 1600);
    } else {
      // Eliminierung: lander.included = false
      setEliminated(landed);
      setTimeout(() => {
        setRoster((prev) =>
          prev.map((r) =>
            makeKey(r) === makeKey(landed) ? { ...r, included: false } : r
          )
        );
        setEliminated(null);
        phaseRef.current = "idle";
        lastSegRef.current = null;
      }, 1600);
    }
  }, []);

  const step = useCallback(
    (now: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = now;
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      const phase = phaseRef.current;
      const playingCount = rosterRef.current.filter((r) => r.included).length;

      // Peg-Tick + Pointer-Kick bei jedem Segmentwechsel — für Spin UND Hand-Drag.
      const emitSegmentTick = (speed: number) => {
        if (playingCount <= 0) return;
        const idx = segmentAtPointer(angleRef.current, playingCount);
        if (lastSegRef.current !== null && idx !== lastSegRef.current) {
          if (!mutedRef.current) tick(Math.max(0.3, Math.min(1, speed / 14)));
          kickPointer(speed);
        }
        lastSegRef.current = idx;
      };

      if (phase === "idle") {
        velRef.current = IDLE_VELOCITY;
        angleRef.current += IDLE_VELOCITY * dt;
      } else if (phase === "dragging") {
        // Winkel wird in den Pointer-Handlern direkt gesetzt; hier nur das
        // taktile Feedback, damit es beim Drehen von Hand schon „klackert".
        emitSegmentTick(Math.abs(dragSpeedRef.current));
      } else if (phase === "spinning") {
        // Vorzeichenbehaftet → Hand-Spin funktioniert in beide Richtungen.
        const v = velRef.current;
        const speed = Math.abs(v);
        const dir = Math.sign(v) || 1;
        let newV = v - dir * (BASE_DECEL + VEL_DRAG * speed) * dt;
        if (Math.sign(newV) !== Math.sign(v)) newV = 0; // nicht über 0 hinausschiessen
        angleRef.current += newV * dt;
        velRef.current = newV;

        emitSegmentTick(Math.abs(newV));

        if (Math.abs(newV) <= STOP_THRESHOLD) {
          phaseRef.current = "stopped";
          angleRef.current = ((angleRef.current % TWO_PI) + TWO_PI) % TWO_PI;
          finishSpin();
        }
      }

      drawWheel();
      rafRef.current = requestAnimationFrame(step);
    },
    [drawWheel, finishSpin]
  );

  useEffect(() => {
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [step]);

  // Casino-Hintergrundmusik im Spielmodus. Startet erst nach der Nutzer-Geste
  // „Spiel starten" (AudioContext darf dann laufen) und stoppt beim Verlassen
  // des Spielmodus, beim Stummschalten und beim Unmount.
  useEffect(() => {
    if (view === "game" && !muted) startCasinoAmbience();
    else stopCasinoAmbience();
    return () => stopCasinoAmbience();
  }, [view, muted]);

  // Gemeinsamer Spin-Start für Button (zufällige Kraft) und Hand-Flick (gemessene Kraft).
  function launchSpin(velocity: number) {
    if (mode === "elim" && originalRoster === null) {
      setOriginalRoster(roster.filter((r) => r.included));
    }
    setSpinning(true);
    setResult(null);
    setWinning(false);
    lastSegRef.current = segmentAtPointer(
      angleRef.current,
      roster.filter((r) => r.included).length
    );
    velRef.current = velocity;
    phaseRef.current = "spinning";
    if (!muted) spinStart();
  }

  function spin() {
    if (!canSpin) return;
    launchSpin(26 + Math.random() * 10);
  }

  /* === Hand-Spin: das Rad mit Maus/Finger anstossen ============== */

  function pointerToAngle(clientX: number, clientY: number): number | null {
    const cvs = canvasRef.current;
    if (!cvs) return null;
    const rect = cvs.getBoundingClientRect();
    return Math.atan2(
      clientY - (rect.top + rect.height / 2),
      clientX - (rect.left + rect.width / 2)
    );
  }

  function onWheelPointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!canSpin || result) return;
    const a = pointerToAngle(e.clientX, e.clientY);
    if (a === null) return;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    pointerIdRef.current = e.pointerId;
    dragLastAngleRef.current = a;
    dragSpeedRef.current = 0;
    dragMovedRef.current = 0;
    dragSamplesRef.current = [{ t: performance.now(), a: angleRef.current }];
    lastSegRef.current = segmentAtPointer(angleRef.current, includedRoster.length);
    phaseRef.current = "dragging";
    setIsDragging(true);
  }

  function onWheelPointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (phaseRef.current !== "dragging" || e.pointerId !== pointerIdRef.current) return;
    const a = pointerToAngle(e.clientX, e.clientY);
    if (a === null) return;
    let d = a - dragLastAngleRef.current;
    if (d > Math.PI) d -= TWO_PI; // kürzesten Weg über den ±π-Sprung nehmen
    else if (d < -Math.PI) d += TWO_PI;
    angleRef.current += d;
    dragMovedRef.current += Math.abs(d);
    dragLastAngleRef.current = a;

    const now = performance.now();
    const s = dragSamplesRef.current;
    s.push({ t: now, a: angleRef.current });
    while (s.length > 2 && now - s[0].t > 120) s.shift();
    const dtS = (now - s[0].t) / 1000;
    dragSpeedRef.current = dtS > 0 ? (angleRef.current - s[0].a) / dtS : 0;
  }

  function endDrag(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (phaseRef.current !== "dragging" || e.pointerId !== pointerIdRef.current) return;
    pointerIdRef.current = null;
    setIsDragging(false);

    // Auswurf-Geschwindigkeit aus dem jüngsten Bewegungsfenster (~90 ms).
    const s = dragSamplesRef.current;
    const now = performance.now();
    let v = 0;
    if (s.length >= 2) {
      let i = s.length - 1;
      while (i > 0 && now - s[i - 1].t < 90) i--;
      const dtS = (now - s[i].t) / 1000;
      if (dtS > 0) v = (angleRef.current - s[i].a) / dtS;
    }

    // Echte Schleuderbewegung → Spin. Kaum bewegt / still losgelassen → Idle.
    if (Math.abs(v) >= THROW_MIN_VEL && dragMovedRef.current > 0.12) {
      const dir = v < 0 ? -1 : 1;
      launchSpin(dir * Math.min(MAX_LAUNCH_VEL, Math.max(MIN_LAUNCH_VEL, Math.abs(v))));
    } else {
      phaseRef.current = "idle";
      lastSegRef.current = null;
    }
  }

  function toggleParticipant(key: string) {
    if (spinning || lockedForElim) return;
    setRoster((prev) =>
      prev.map((r) => (makeKey(r) === key ? { ...r, included: !r.included } : r))
    );
  }

  function addGuest() {
    const v = input.trim();
    if (!v || roster.length >= MAX_ROSTER || lockedForElim) return;
    const key = `g:${v}`;
    if (roster.some((r) => makeKey(r) === key)) {
      setInput("");
      return;
    }
    setRoster((prev) => [
      ...prev,
      { userId: null, name: v, isGuest: true, included: true },
    ]);
    setInput("");
  }

  function removeGuest(key: string) {
    if (spinning || lockedForElim) return;
    setRoster((prev) => prev.filter((r) => makeKey(r) !== key));
  }

  function dismissResult() {
    setResult(null);
    setResultConsequence(null);
    if (mode === "elim" && originalRoster) {
      setRoster((prev) => {
        const inSet = new Set(originalRoster.map(makeKey));
        return prev.map((r) => ({ ...r, included: inSet.has(makeKey(r)) }));
      });
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
      setRoster((prev) => {
        const inSet = new Set(originalRoster.map(makeKey));
        return prev.map((r) => ({ ...r, included: inSet.has(makeKey(r)) }));
      });
      setOriginalRoster(null);
    } else {
      setRoster((prev) => prev.map((r) => ({ ...r, included: true })));
    }
  }

  function changeMode(next: Mode) {
    if (spinning || eliminated || next === mode) return;
    if (originalRoster) {
      setRoster((prev) => prev.map((r) => ({ ...r, included: true })));
      setOriginalRoster(null);
    }
    setResult(null);
    setMode(next);
  }

  function startGame() {
    if (includedRoster.length < 2) return;
    setView("game");
  }

  function backToSetup() {
    // Auch während des Spins erlaubt: laufenden Spin abbrechen und zurück.
    if (spinning) {
      setSpinning(false);
      velRef.current = IDLE_VELOCITY;
    }
    if (originalRoster) {
      setRoster((prev) => {
        const inSet = new Set(originalRoster.map(makeKey));
        return prev.map((r) => ({ ...r, included: inSet.has(makeKey(r)) }));
      });
      setOriginalRoster(null);
    }
    setResult(null);
    setEliminated(null);
    phaseRef.current = "idle";
    lastSegRef.current = null;
    setView("setup");
  }

  const activeMode = MODES_TR.find((m) => m.id === mode)!;
  const isCrewMode = activeCrewId !== null;

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {view === "setup" ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
            className="max-w-2xl mx-auto"
          >
            {/* Hero */}
            <div className="text-center mb-8 sm:mb-12">
              <p className="eyebrow-gold justify-center mb-3">{t("wheel.setup.eyebrow")}</p>
              <h1 className="font-display font-black leading-[0.92] tracking-tight text-4xl sm:text-6xl text-fg">
                {t("wheel.setup.titlePre")}{" "}
                <span className="gradient-shame">{t("wheel.setup.titleAccent")}</span>
                <span className="text-fg-faint">?</span>
              </h1>
              <p className="mt-3 text-fg-soft text-sm sm:text-base max-w-md mx-auto">
                {isCrewMode ? t("wheel.setup.crewSubtitle") : t("wheel.setup.soloSubtitle")}
              </p>
            </div>

            {/* Crew-Context-Indicator */}
            {isCrewMode && activeCrew && (
              <div className="mb-5 flex justify-center">
                <div
                  className="inline-flex items-center gap-2 rounded-full pl-1.5 pr-3.5 py-1 text-xs font-semibold"
                  style={{
                    background: "var(--surface-gold)",
                    color: "var(--text-gold)",
                    border: "1px solid var(--border-gold)",
                  }}
                >
                  <span
                    className="grid place-items-center w-5 h-5 rounded-full text-[12px]"
                    style={{
                      background: `color-mix(in srgb, ${activeCrew.accentColor} 25%, transparent)`,
                    }}
                  >
                    {activeCrew.emoji}
                  </span>
                  <span>{activeCrew.name}</span>
                </div>
              </div>
            )}

            {/* === MODUS === */}
            <section className="card-casino p-5 sm:p-6 mb-6 sm:mb-7">
              <header className="mb-4">
                <p className="eyebrow-gold">{t("wheel.setup.modeSection")}</p>
                <h2 className="font-display font-bold text-lg sm:text-xl text-fg mt-1">
                  {t("wheel.setup.modeTitle")}
                </h2>
              </header>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {MODES_TR.map((m) => {
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
            </section>

            {/* === SPIELER === */}
            <section className="card-casino p-5 sm:p-6 mb-6 sm:mb-7">
              <header className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="eyebrow-gold">{t("wheel.setup.playersSection")}</p>
                  <h2 className="font-display font-bold text-lg sm:text-xl text-fg mt-1">
                    {isCrewMode ? t("wheel.setup.playersTitleCrew") : t("wheel.setup.playersTitleSolo")}
                  </h2>
                </div>
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tabular-nums"
                  style={{
                    background: "var(--surface-gold)",
                    color: "var(--text-gold)",
                    border: "1px solid var(--border-gold)",
                  }}
                >
                  <Users size={12} />
                  {includedRoster.length}/{roster.length}
                </div>
              </header>

              {loadingRoster ? (
                <div className="py-6 text-center text-sm text-fg-mute flex items-center justify-center gap-2">
                  <RefreshCw size={14} className="animate-spin" /> {t("wheel.setup.loadingMembers")}
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <AnimatePresence initial={false}>
                      {roster.map((r, i) => {
                        const key = makeKey(r);
                        const accentColor = PALETTE[i % PALETTE.length];
                        return (
                          <motion.span
                            key={key}
                            layout
                            initial={{ opacity: 0, scale: 0.7, y: 8 }}
                            animate={{ opacity: r.included ? 1 : 0.45, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.5, x: -20, transition: { duration: 0.4 } }}
                            transition={{ duration: 0.18 }}
                            className="inline-flex items-center gap-1.5 rounded-full pl-1 pr-1 py-0.5 text-sm font-medium"
                            style={{
                              background: r.included ? "var(--surface)" : "transparent",
                              border: `1.5px solid ${r.included ? accentColor : "var(--border)"}`,
                              borderStyle: r.included ? "solid" : "dashed",
                              color: "var(--text)",
                            }}
                          >
                            {r.image ? (
                              <Image
                                src={r.image}
                                alt={r.name}
                                width={24}
                                height={24}
                                className="rounded-full"
                                style={{ opacity: r.included ? 1 : 0.6 }}
                              />
                            ) : (
                              <span
                                className="grid place-items-center w-6 h-6 rounded-full text-[11px] font-bold"
                                style={{
                                  background: r.isGuest
                                    ? "var(--surface-gold)"
                                    : "var(--surface)",
                                  color: r.isGuest
                                    ? "var(--text-gold)"
                                    : "var(--text-soft)",
                                }}
                              >
                                {r.isGuest ? "★" : r.name.slice(0, 1).toUpperCase()}
                              </span>
                            )}
                            <span className="px-1.5">{r.name}</span>
                            {/* Toggle / Remove */}
                            {r.isGuest ? (
                              <button
                                onClick={() => removeGuest(key)}
                                disabled={spinning || lockedForElim}
                                aria-label={`${r.name} entfernen`}
                                className="grid place-items-center w-6 h-6 rounded-full transition disabled:opacity-30"
                                style={{
                                  background: "transparent",
                                  color: "var(--text-mute)",
                                }}
                              >
                                <X size={13} strokeWidth={2.6} />
                              </button>
                            ) : (
                              <button
                                onClick={() => toggleParticipant(key)}
                                disabled={spinning || lockedForElim}
                                aria-label={
                                  r.included ? `${r.name} ausschliessen` : `${r.name} dabeihaben`
                                }
                                className="grid place-items-center w-6 h-6 rounded-full transition disabled:opacity-30"
                                style={{
                                  background: r.included
                                    ? "transparent"
                                    : "var(--surface-gold)",
                                  color: r.included ? "var(--text-mute)" : "var(--text-gold)",
                                }}
                              >
                                {r.included ? (
                                  <X size={13} strokeWidth={2.6} />
                                ) : (
                                  <Plus size={13} strokeWidth={2.8} />
                                )}
                              </button>
                            )}
                          </motion.span>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  {/* Gast-Input */}
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addGuest())
                      }
                      placeholder={
                        lockedForElim
                          ? t("wheel.setup.lockedElim")
                          : roster.length >= MAX_ROSTER
                            ? t("wheel.setup.maxReached")
                            : isCrewMode
                              ? t("wheel.setup.addGuest")
                              : t("wheel.setup.addName")
                      }
                      maxLength={20}
                      disabled={roster.length >= MAX_ROSTER || lockedForElim}
                      className="field"
                    />
                    <button
                      onClick={addGuest}
                      disabled={!input.trim() || roster.length >= MAX_ROSTER || lockedForElim}
                      className="btn-ghost !rounded-2xl !px-4 !py-3 disabled:opacity-40"
                      aria-label={t("wheel.setup.addGuest")}
                    >
                      <UserPlus size={18} strokeWidth={2.5} />
                    </button>
                  </div>

                  {includedRoster.length < 2 && (
                    <p className="text-xs text-shame mt-3 text-center">
                      {t("wheel.setup.minPlayers")}
                    </p>
                  )}
                </>
              )}
            </section>

            <button
              onClick={startGame}
              disabled={includedRoster.length < 2}
              className="btn-primary w-full text-lg py-5 disabled:opacity-50"
            >
              {t("wheel.setup.startGame")}
              <ArrowRight size={20} strokeWidth={2.5} />
            </button>
          </motion.div>
        ) : (
          /* === GAME VIEW === */
          <motion.div
            key="game"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <button
                onClick={backToSetup}
                className="btn-ghost"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">{t("wheel.game.back")}</span>
              </button>
              <div
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold"
                style={{
                  background: `color-mix(in srgb, ${activeMode.accent} 14%, transparent)`,
                  color: activeMode.accent,
                  border: `1px solid color-mix(in srgb, ${activeMode.accent} 38%, transparent)`,
                }}
              >
                <activeMode.Icon size={13} strokeWidth={2.4} />
                {activeMode.title}
                <span className="opacity-50">·</span>
                {inElimGame ? (
                  <span className="tabular-nums">
                    {includedRoster.length}/{originalRoster?.length}
                  </span>
                ) : (
                  <span className="tabular-nums">{includedRoster.length}</span>
                )}
              </div>
              <button
                onClick={resetWheel}
                disabled={spinning}
                className="btn-ghost"
                aria-label="Reset"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="flex flex-col items-center gap-7 sm:gap-9">
              <div className="relative" style={{ width: size, height: size + 40 }}>
                <div
                  className="absolute inset-0 -z-10 rounded-full opacity-70 blur-3xl"
                  style={{ background: "radial-gradient(circle, rgba(255,45,85,0.35), transparent 60%)" }}
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
                    onPointerDown={onWheelPointerDown}
                    onPointerMove={onWheelPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    style={{
                      width: size,
                      height: size,
                      display: "block",
                      borderRadius: "50%",
                      touchAction: "none",
                      cursor: canSpin ? (isDragging ? "grabbing" : "grab") : "default",
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={spin}
                  disabled={!canSpin}
                  className="btn-primary text-xl sm:text-2xl px-14 py-5 sm:px-16 sm:py-6"
                  style={{ minWidth: 220 }}
                >
                  {spinning ? t("common.spinning") : t("wheel.game.spin")}
                </button>
                {!spinning && (
                  <p className="text-xs text-fg-mute text-center max-w-[18rem]">
                    {t("wheel.game.dragHint")}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Eliminations-Banner */}
      <AnimatePresence>
        {eliminated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 grid place-items-center px-6 pointer-events-none overflow-hidden"
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
              className="text-center w-full max-w-2xl mx-auto"
            >
              <div className="text-xs font-bold uppercase tracking-[0.4em] text-shame mb-3">
                {t("wheel.elim.eliminated")}
              </div>
              <div
                className="font-display font-black gradient-shame leading-[0.85] max-w-full break-words"
                style={{
                  fontSize: "clamp(3rem, 13vw, 8rem)",
                  filter: "drop-shadow(0 6px 30px rgba(255,45,85,0.45))",
                  textDecoration: "line-through",
                  textDecorationThickness: "0.05em",
                  textDecorationColor: "rgba(255,255,255,0.3)",
                  overflowWrap: "anywhere",
                }}
              >
                {eliminated.name}
              </div>
              <div className="mt-3 text-white/70 text-sm uppercase tracking-[0.25em]">
                {t("wheel.elim.safe")}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loser-Reveal */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden overscroll-contain"
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
            {/* Scroll-/Zentrier-Wrapper: min-h-full hält die Karte mittig; bei
                sehr hohem Inhalt (kleine Mobiles, lange Namen) wird sauber
                gescrollt statt schräg abgeschnitten. */}
            <div className="relative min-h-full flex items-center justify-center px-5 py-12">
              <motion.div
                initial={{ scale: 0.7, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.08 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-2xl mx-auto text-center"
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className="font-bold gradient-gold tracking-[0.4em] sm:tracking-[0.5em] text-sm sm:text-base mb-5 sm:mb-7"
                >
                  👑 {t("wheel.result.jackpot")} 👑
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.8, type: "spring", stiffness: 140, damping: 14 }}
                  className="font-display font-black gradient-shame leading-[0.85] mb-6 max-w-full break-words"
                  style={{
                    fontSize: "clamp(2.75rem, 15vw, 8.5rem)",
                    filter: "drop-shadow(0 8px 40px rgba(255,45,85,0.5))",
                    overflowWrap: "anywhere",
                    hyphens: "auto",
                  }}
                >
                  {result.name}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="font-display font-bold text-2xl sm:text-4xl text-white/95 mb-4"
                >
                  {t("wheel.result.bears")} <span className="gradient-shame">{t("wheel.result.shame")}</span>
                </motion.div>

                {resultConsequence && (
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.85, duration: 0.5 }}
                    className="font-display font-bold text-base sm:text-2xl mb-9 sm:mb-10"
                    style={{
                      color: "#FFD15C",
                      textShadow: "0 2px 12px rgba(232,195,106,0.4)",
                    }}
                  >
                    {t("wheel.result.consequencePrefix")} {resultConsequence}
                  </motion.div>
                )}

                {!resultConsequence && <div className="mb-9 sm:mb-10" />}

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
                  {mode === "elim" ? t("common.newRound") : t("common.continue")}
                </motion.button>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="mt-10 flex flex-col items-center gap-2"
                >
                  <span className="text-xs uppercase tracking-[0.3em] text-white/40">
                    {t("wheel.result.tapToClose")}
                  </span>
                  <BindingDecree variant="fineprint" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
