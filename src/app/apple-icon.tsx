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
          background: "radial-gradient(circle at 50% 30%, #0E4630 0%, #06140D 72%)",
          color: "#E6C879",
          fontSize: 110,
          fontWeight: 900,
          letterSpacing: -4,
          borderRadius: 36,
        }}
      >
        <svg width="140" height="140" viewBox="0 0 40 40" fill="none">
          <defs>
            <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FBE7B0" />
              <stop offset="50%" stopColor="#E6C879" />
              <stop offset="100%" stopColor="#A07820" />
            </linearGradient>
            <radialGradient id="ruby" cx="0.4" cy="0.36" r="0.7">
              <stop offset="0%" stopColor="#FF6B86" />
              <stop offset="55%" stopColor="#E5163F" />
              <stop offset="100%" stopColor="#7A0420" />
            </radialGradient>
          </defs>
          <circle cx="20" cy="20" r="14" stroke="url(#gold)" strokeWidth="3" />
          <path d="M20 8 V13 M20 27 V32 M8 20 H13 M27 20 H32" stroke="url(#gold)" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="20" cy="20" r="4.6" fill="url(#ruby)" stroke="url(#gold)" strokeWidth="1.4" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
