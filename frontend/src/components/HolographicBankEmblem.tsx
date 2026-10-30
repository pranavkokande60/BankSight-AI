import React, { useState } from 'react';

interface HolographicBankEmblemProps {
  className?: string;
  isDarkTheme?: boolean;
}

export const HolographicBankEmblem: React.FC<HolographicBankEmblemProps> = ({
  className = '',
  isDarkTheme = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center cursor-pointer select-none group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        perspective: '900px',
      }}
    >
      <style>{`
        @keyframes bankEmblemSpinY {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }
        @keyframes bankAuraPulse {
          0%, 100% {
            transform: scale(0.92);
            opacity: 0.65;
          }
          50% {
            transform: scale(1.18);
            opacity: 0.98;
          }
        }
        @keyframes bankRingSpin {
          0% {
            transform: rotateZ(0deg);
          }
          100% {
            transform: rotateZ(360deg);
          }
        }
        @keyframes bankBobbing {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }
      `}</style>

      {/* Floating Levitation Container */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          animation: 'bankBobbing 4.5s ease-in-out infinite',
        }}
      >
        {/* 1. Behind-Emblem Ambient Cyan Energy Glow */}
        <div
          className="absolute inset-[-15%] rounded-full blur-[14px] pointer-events-none transition-all duration-300"
          style={{
            background: 'radial-gradient(circle, rgba(56,189,248,0.7) 0%, rgba(6,182,212,0.3) 50%, transparent 75%)',
            animation: 'bankAuraPulse 3s ease-in-out infinite',
            opacity: isHovered ? 1 : 0.8,
          }}
        />

        {/* 2. Delicate Rotating Holographic Frame Ring */}
        <div
          className="absolute inset-[-10%] rounded-full border border-dashed border-cyan-400/40 pointer-events-none"
          style={{
            animation: isHovered
              ? 'bankRingSpin 6s linear infinite'
              : 'bankRingSpin 14s linear infinite',
            boxShadow: '0 0 10px rgba(6,182,212,0.3)',
          }}
        >
          {/* Micro Glowing Orbit Node */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-200 shadow-[0_0_8px_#38bdf8]" />
        </div>

        {/* 3. The 3D Rotating Bank Emblem */}
        <div
          className="relative w-[86%] h-[86%] flex items-center justify-center will-change-transform"
          style={{
            transformStyle: 'preserve-3d',
            animation: isHovered
              ? 'bankEmblemSpinY 3.5s linear infinite'
              : 'bankEmblemSpinY 7s linear infinite',
          }}
        >
          {/* Classical Bank Temple SVG matching user reference exactly */}
          <svg
            viewBox="0 0 100 80"
            className="w-full h-full transition-transform"
            style={{
              filter: 'drop-shadow(0 0 6px #38bdf8) drop-shadow(0 0 14px rgba(6,182,212,0.85))',
            }}
          >
            <defs>
              <linearGradient id="bankCyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="40%" stopColor="#7dd3fc" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.75" />
              </linearGradient>
            </defs>

            {/* Triangular Pediment / Roof */}
            <polygon
              points="10,24 50,4 90,24"
              fill="url(#bankCyanGlow)"
              stroke="#e0f2fe"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Inner Pediment Inset Cutout */}
            <polygon
              points="24,22 50,10 76,22"
              fill={isDarkTheme ? 'rgba(3,7,18,0.7)' : 'rgba(15,23,42,0.5)'}
              stroke="#7dd3fc"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* Architrave / Top Horizontal Beam */}
            <rect
              x="8"
              y="24"
              width="84"
              height="6.5"
              rx="1.5"
              fill="url(#bankCyanGlow)"
              stroke="#e0f2fe"
              strokeWidth="1.5"
            />

            {/* 4 Classical Columns */}
            {/* Pillar 1 */}
            <rect
              x="16"
              y="32"
              width="10"
              height="34"
              rx="1.5"
              fill="url(#bankCyanGlow)"
              stroke="#e0f2fe"
              strokeWidth="1.5"
            />
            {/* Pillar 2 */}
            <rect
              x="36"
              y="32"
              width="10"
              height="34"
              rx="1.5"
              fill="url(#bankCyanGlow)"
              stroke="#e0f2fe"
              strokeWidth="1.5"
            />
            {/* Pillar 3 */}
            <rect
              x="54"
              y="32"
              width="10"
              height="34"
              rx="1.5"
              fill="url(#bankCyanGlow)"
              stroke="#e0f2fe"
              strokeWidth="1.5"
            />
            {/* Pillar 4 */}
            <rect
              x="74"
              y="32"
              width="10"
              height="34"
              rx="1.5"
              fill="url(#bankCyanGlow)"
              stroke="#e0f2fe"
              strokeWidth="1.5"
            />

            {/* Stepped Base / Plinth */}
            <rect
              x="8"
              y="67"
              width="84"
              height="5"
              rx="1.2"
              fill="url(#bankCyanGlow)"
              stroke="#e0f2fe"
              strokeWidth="1.2"
            />
            <rect
              x="4"
              y="72"
              width="92"
              height="6"
              rx="1.5"
              fill="url(#bankCyanGlow)"
              stroke="#e0f2fe"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* 4. Bottom Laser Pedestal Flare */}
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[80%] h-[10px] pointer-events-none rounded-full blur-[4px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(56,189,248,0.95) 0%, rgba(6,182,212,0.4) 50%, transparent 80%)',
          }}
        />

        {/* 5. Hover Telemetry Badge */}
        {isHovered && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-30 pointer-events-none whitespace-nowrap">
            <div className="px-2.5 py-0.5 rounded-md bg-slate-950/90 border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center space-x-1.5 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />
              <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-300">
                CENTRAL BANK CORE • 3D ROTATION
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
