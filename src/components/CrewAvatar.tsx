"use client";

interface Props {
  emoji?: string | null;
  color?: string | null;
  size?: number;
  className?: string;
}

/**
 * Crew-Avatar — coloured rounded-square mit Emoji.
 * Fallback wenn null: Gold + 🎰.
 */
export default function CrewAvatar({
  emoji,
  color,
  size = 44,
  className = "",
}: Props) {
  const finalEmoji = emoji ?? "🎰";
  const finalColor = color ?? "#E8C36A";
  const emojiSize = Math.round(size * 0.55);

  return (
    <div
      className={`grid place-items-center rounded-xl shrink-0 select-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `color-mix(in srgb, ${finalColor} 20%, transparent)`,
        border: `1px solid color-mix(in srgb, ${finalColor} 45%, transparent)`,
        fontSize: emojiSize,
        lineHeight: 1,
      }}
      aria-hidden="true"
    >
      <span style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))" }}>
        {finalEmoji}
      </span>
    </div>
  );
}
