import React from "react";

interface SplashLogoProps {
  /** Width in pixels (height scales proportionally) */
  width?: number;
  /** Additional className for the wrapper */
  className?: string;
}

const SplashLogo: React.FC<SplashLogoProps> = ({ width = 100, className = "" }) => {
  const height = width * 0.65; // aspect ratio slightly taller for tagline
  const id = `sayf-grad-${width}`; // unique gradient ID per size

  return (
    <div className={`sayf-logo ${className}`} style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        viewBox="0 0 200 130"
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="SAYF"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#f0f0f0" />
            <stop offset="25%"  stopColor="#c8c8c8" />
            <stop offset="50%"  stopColor="#a8a8a8" />
            <stop offset="75%"  stopColor="#d4d4d4" />
            <stop offset="100%" stopColor="#ebebeb" />
          </linearGradient>
        </defs>

        {/* SAYF — main wordmark */}
        <text
          x="100"
          y="60"
          textAnchor="middle"
          fontFamily="'Cormorant Garamond', 'Georgia', serif"
          fontSize="52"
          fontWeight="400"
          letterSpacing="12"
          fill={`url(#${id})`}
        >
          SAYF
        </text>

        {/* Left decorative line */}
        <line x1="30" y1="88" x2="75" y2="88" stroke={`url(#${id})`} strokeWidth="0.8" />


        {/* Right decorative line */}
        <line x1="125" y1="88" x2="170" y2="88" stroke={`url(#${id})`} strokeWidth="0.8" />

        {/* Tagline */}
        <text
          x="100"
          y="118"
          textAnchor="middle"
          fontFamily="'Montserrat', sans-serif"
          fontSize="6.5"
          fontWeight="400"
          letterSpacing="5"
          fill={`url(#${id})`}
        >
          LET THE SUNNAH GO FORTH
        </text>
      </svg>
    </div>
  );
};

export default SplashLogo;
