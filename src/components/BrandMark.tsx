// Logo-Mark: edles Mini-Glücksrad — Gold-Bezel, Speichen, Ruby-Hub.
export default function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="bm-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FBE7B0" />
          <stop offset="50%" stopColor="#E6C879" />
          <stop offset="100%" stopColor="#A07820" />
        </linearGradient>
        <radialGradient id="bm-ruby" cx="0.4" cy="0.36" r="0.7">
          <stop offset="0%" stopColor="#FF6B86" />
          <stop offset="55%" stopColor="#E5163F" />
          <stop offset="100%" stopColor="#7A0420" />
        </radialGradient>
      </defs>
      {/* Bezel */}
      <circle cx="20" cy="20" r="17" stroke="url(#bm-gold)" strokeWidth="3" />
      {/* Speichen */}
      <path d="M20 5 V13" stroke="url(#bm-gold)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M20 27 V35" stroke="url(#bm-gold)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M5 20 H13" stroke="url(#bm-gold)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M27 20 H35" stroke="url(#bm-gold)" strokeWidth="2.4" strokeLinecap="round" />
      {/* Ruby-Hub */}
      <circle cx="20" cy="20" r="5.5" fill="url(#bm-ruby)" stroke="url(#bm-gold)" strokeWidth="1.6" />
      <circle cx="18.4" cy="18.4" r="1.4" fill="rgba(255,255,255,0.7)" />
    </svg>
  );
}
