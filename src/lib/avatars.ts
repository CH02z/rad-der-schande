/**
 * Curated Avatar-Pool für Crews. Casino/Glücksspiel-Themen + ein paar
 * Tier-/Trink-Fun-Optionen.
 */

export const CREW_EMOJIS = [
  "🎰", "🎲", "🃏", "💎", "👑", "🎯", "⚔️", "🔥",
  "⚡", "🌟", "🎪", "🍻", "🍕", "🚀", "🐺", "🦁",
  "🦅", "🐍", "🐉", "🃎", "🎺", "🏴‍☠️", "🤘", "🎭",
] as const;

export const CREW_COLORS = [
  "#E8C36A", // gold
  "#FF2D55", // shame red
  "#5FE3C4", // mint
  "#69A6FF", // sky
  "#C589FF", // royal
  "#FF8A3D", // coral
  "#3DDC91", // felt-green
  "#FF6B86", // pink
] as const;

export function pickRandomAvatar() {
  return {
    emoji: CREW_EMOJIS[Math.floor(Math.random() * CREW_EMOJIS.length)],
    accentColor: CREW_COLORS[Math.floor(Math.random() * CREW_COLORS.length)],
  };
}

export function isValidEmoji(emoji: string): boolean {
  return (
    typeof emoji === "string" &&
    emoji.length >= 1 &&
    emoji.length <= 8 &&
    (CREW_EMOJIS as readonly string[]).includes(emoji)
  );
}

export function isValidColor(color: string): boolean {
  return (
    typeof color === "string" &&
    (CREW_COLORS as readonly string[]).includes(color)
  );
}
