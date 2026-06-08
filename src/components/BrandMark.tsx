// Kleines Logo-Mark: Kreis-Rad mit „S" — als SVG, beliebig skalierbar.
export default function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="bm-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD15C" />
          <stop offset="55%" stopColor="#FF6B86" />
          <stop offset="100%" stopColor="#FF2D55" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="17" stroke="url(#bm-ring)" strokeWidth="3" />
      <circle cx="20" cy="20" r="4" fill="url(#bm-ring)" />
      <path d="M20 6 V14" stroke="url(#bm-ring)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M20 26 V34" stroke="url(#bm-ring)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M6 20 H14" stroke="url(#bm-ring)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M26 20 H34" stroke="url(#bm-ring)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
