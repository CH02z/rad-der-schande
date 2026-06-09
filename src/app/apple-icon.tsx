import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple-Touch-Icon — wird beim „Zum Home-Bildschirm" auf iPhone verwendet.
 * Casino-Schwarz mit golden-roter Mark.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 50% 30%, #1A0B0E 0%, #07060B 70%)",
          color: "#FFD15C",
          fontSize: 110,
          fontWeight: 900,
          letterSpacing: -4,
          borderRadius: 36,
        }}
      >
        <svg width="140" height="140" viewBox="0 0 40 40" fill="none">
          <defs>
            <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFD15C" />
              <stop offset="55%" stopColor="#FF6B86" />
              <stop offset="100%" stopColor="#FF2D55" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="14" stroke="url(#ring)" strokeWidth="3" />
          <circle cx="20" cy="20" r="3.5" fill="url(#ring)" />
          <path d="M20 8 V13 M20 27 V32 M8 20 H13 M27 20 H32" stroke="url(#ring)" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
