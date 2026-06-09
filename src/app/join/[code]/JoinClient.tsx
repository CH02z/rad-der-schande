"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertTriangle, ArrowRight } from "lucide-react";
import { useCrew } from "@/lib/crew-context";

export default function JoinClient({ code }: { code: string }) {
  const router = useRouter();
  const { refresh } = useCrew();
  const [status, setStatus] = useState<"joining" | "success" | "error">("joining");
  const [error, setError] = useState<string | null>(null);
  const [crewName, setCrewName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/crews/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        if (cancelled) return;
        if (!res.ok) {
          const { error } = await res.json().catch(() => ({ error: "Fehler" }));
          setError(error || "Beitritt fehlgeschlagen");
          setStatus("error");
          return;
        }
        const crew = (await res.json()) as { id: string; name: string };
        setCrewName(crew.name);
        setStatus("success");
        await refresh();
        // Kurz pause für „Willkommen"-Splash, dann redirect
        setTimeout(() => router.push(`/crew/${crew.id}`), 1100);
      } catch {
        if (!cancelled) {
          setError("Netzwerk-Fehler");
          setStatus("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, refresh, router]);

  return (
    <div className="max-w-md mx-auto">
      <div className="card-casino p-8 sm:p-10 text-center">
        {status === "joining" && (
          <>
            <div
              className="mx-auto grid place-items-center w-16 h-16 rounded-2xl mb-4"
              style={{ background: "var(--surface-gold)", color: "var(--text-gold)" }}
            >
              <Loader2 size={28} className="animate-spin" strokeWidth={2.4} />
            </div>
            <p className="eyebrow-gold justify-center mb-3">Beitreten</p>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-fg mb-2">
              Code wird geprüft…
            </h1>
            <p className="text-fg-soft text-sm font-mono tracking-[0.3em]">
              {code}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div
              className="mx-auto grid place-items-center w-16 h-16 rounded-2xl mb-4 text-3xl"
              style={{ background: "var(--surface-gold)" }}
            >
              🎉
            </div>
            <p className="eyebrow-gold justify-center mb-3">Willkommen</p>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-fg mb-2">
              {crewName ?? "Crew beigetreten!"}
            </h1>
            <p className="text-fg-soft text-sm">Du wirst weitergeleitet…</p>
          </>
        )}

        {status === "error" && (
          <>
            <div
              className="mx-auto grid place-items-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: "rgba(255,45,85,0.12)",
                color: "#FF6B86",
                border: "1px solid rgba(255,45,85,0.3)",
              }}
            >
              <AlertTriangle size={28} strokeWidth={2.2} />
            </div>
            <h1 className="font-display font-extrabold text-2xl text-fg mb-2">
              Hat nicht geklappt
            </h1>
            <p className="text-fg-soft text-sm mb-6">
              {error ?? "Code ungültig oder Crew nicht erreichbar."}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/crew" className="btn-primary text-sm py-2.5 px-5">
                Crews öffnen <ArrowRight size={14} strokeWidth={2.6} />
              </Link>
              <Link href="/" className="btn-ghost text-sm py-2.5 px-5">
                Zur Startseite
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
