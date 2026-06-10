import { APP_VERSION, CHANGELOG } from "@/lib/version";

/**
 * Diskrete Versionsanzeige (z.B. Footer / Settings).
 * Tooltip zeigt das Datum des letzten Releases.
 */
export default function VersionTag({ className = "" }: { className?: string }) {
  const latest = CHANGELOG[0];
  return (
    <span
      className={
        "font-mono text-[10px] tracking-wider text-fg-faint select-none " + className
      }
      title={`Rad der Schande v${APP_VERSION}${latest ? ` · ${latest.date}` : ""}`}
    >
      v{APP_VERSION}
    </span>
  );
}
