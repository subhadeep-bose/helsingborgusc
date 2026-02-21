const CricketBallLoader = ({ size = 48, className = "" }: { size?: number; className?: string }) => {
  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        className="cricket-ball-spin"
        aria-hidden="true"
      >
        {/* Ball body */}
        <circle cx="32" cy="32" r="28" fill="hsl(var(--primary))" />
        <circle cx="32" cy="32" r="28" fill="url(#ballShading)" />

        {/* Seam */}
        <path
          d="M 18 12 Q 32 28, 18 52"
          fill="none"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M 46 12 Q 32 28, 46 52"
          fill="none"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Stitch marks */}
        {[14, 20, 26, 32, 38, 44, 50].map((y, i) => (
          <g key={i}>
            <line
              x1="16"
              y1={y - 1}
              x2="14"
              y2={y + 1}
              stroke="hsl(var(--primary-foreground))"
              strokeWidth="0.8"
              opacity="0.6"
            />
            <line
              x1="48"
              y1={y - 1}
              x2="50"
              y2={y + 1}
              stroke="hsl(var(--primary-foreground))"
              strokeWidth="0.8"
              opacity="0.6"
            />
          </g>
        ))}

        {/* Shading gradient */}
        <defs>
          <radialGradient id="ballShading" cx="0.35" cy="0.35" r="0.65">
            <stop offset="0%" stopColor="white" stopOpacity="0.2" />
            <stop offset="100%" stopColor="black" stopOpacity="0.2" />
          </radialGradient>
        </defs>
      </svg>
      <span className="sr-only">Loading…</span>
    </div>
  );
};

export default CricketBallLoader;
