import React, { useState } from 'react';

interface HolographicCustomerOrbProps {
  className?: string;
  isDarkTheme?: boolean;
}

export const HolographicCustomerOrb: React.FC<HolographicCustomerOrbProps> = ({
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
        perspective: '800px',
      }}
    >
      <style>{`
        @keyframes holoSpinY {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }
        @keyframes holoRingClockwise {
          0% {
            transform: rotateX(66deg) rotateZ(0deg);
          }
          100% {
            transform: rotateX(66deg) rotateZ(360deg);
          }
        }
        @keyframes holoRingCounter {
          0% {
            transform: rotateY(62deg) rotateZ(0deg);
          }
          100% {
            transform: rotateY(62deg) rotateZ(-360deg);
          }
        }
        @keyframes holoScanline {
          0% {
            top: 5%;
            opacity: 0;
          }
          20% {
            opacity: 0.85;
          }
          80% {
            opacity: 0.85;
          }
          100% {
            top: 92%;
            opacity: 0;
          }
        }
        @keyframes holoFloatBob {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        @keyframes holoPulseAura {
          0%, 100% {
            transform: scale(0.96);
            opacity: 0.55;
          }
          50% {
            transform: scale(1.12);
            opacity: 0.95;
          }
        }
      `}</style>

      {/* Floating Wrapper */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          animation: 'holoFloatBob 4s ease-in-out infinite',
        }}
      >
        {/* 1. Outer Deep Ambient Radial Energy Glow */}
        <div
          className="absolute inset-0 rounded-full blur-[24px] pointer-events-none transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle, rgba(14,165,233,0.7) 0%, rgba(6,182,212,0.3) 50%, transparent 75%)',
            animation: 'holoPulseAura 3s ease-in-out infinite',
            opacity: isHovered ? 1 : 0.75,
          }}
        />

        {/* 2. Glass Holographic Sphere Body */}
        <div
          className="relative w-[82%] h-[82%] rounded-full overflow-hidden flex items-center justify-center border border-cyan-400/50 shadow-[0_0_25px_rgba(6,182,212,0.6),inset_0_0_20px_rgba(56,189,248,0.5)] transition-all duration-300 group-hover:scale-105"
          style={{
            background: isDarkTheme
              ? 'radial-gradient(circle at 35% 30%, rgba(56,189,248,0.35) 0%, rgba(14,165,233,0.2) 40%, rgba(2,132,199,0.12) 70%, rgba(3,7,18,0.6) 100%)'
              : 'radial-gradient(circle at 35% 30%, rgba(56,189,248,0.45) 0%, rgba(14,165,233,0.25) 50%, rgba(255,255,255,0.7) 100%)',
            backdropFilter: 'blur(3px)',
          }}
        >
          {/* Glass Specular Curved Highlight */}
          <div
            className="absolute top-[8%] left-[16%] w-[42%] h-[24%] rounded-[50%] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%)',
              transform: 'rotate(-28deg)',
            }}
          />

          {/* Sweeping Holographic Scanline */}
          <div
            className="absolute left-0 right-0 h-[2px] pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.9), rgba(255,255,255,0.95), rgba(56,189,248,0.9), transparent)',
              boxShadow: '0 0 8px #38bdf8',
              animation: 'holoScanline 2.8s linear infinite',
            }}
          />

          {/* 3. The 3D Rotating Person/Customer Hologram */}
          <div
            className="relative w-[56%] h-[56%] flex items-center justify-center will-change-transform"
            style={{
              transformStyle: 'preserve-3d',
              animation: isHovered
                ? 'holoSpinY 3.5s linear infinite'
                : 'holoSpinY 7s linear infinite',
            }}
          >
            {/* SVG Hologram of the Person Silhouette matching reference */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full transition-transform"
              style={{
                filter: 'drop-shadow(0 0 6px #38bdf8) drop-shadow(0 0 12px rgba(6,182,212,0.8))',
              }}
            >
              {/* Circular Head */}
              <circle
                cx="50"
                cy="32"
                r="16"
                fill="none"
                stroke="#e0f2fe"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  filter: 'drop-shadow(0 0 4px #06b6d4)',
                }}
              />
              <circle
                cx="50"
                cy="32"
                r="12"
                fill="rgba(56, 189, 248, 0.45)"
              />

              {/* Shoulders / Torso Body Contour */}
              <path
                d="M 22 84 C 22 62, 34 54, 50 54 C 66 54, 78 62, 78 84 Z"
                fill="rgba(56, 189, 248, 0.45)"
                stroke="#e0f2fe"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  filter: 'drop-shadow(0 0 4px #06b6d4)',
                }}
              />

              {/* Holographic Chest Core Accent */}
              <circle
                cx="50"
                cy="68"
                r="3.5"
                fill="#ffffff"
                style={{
                  filter: 'drop-shadow(0 0 6px #ffffff)',
                }}
              />
            </svg>
          </div>
        </div>

        {/* 4. Gyroscopic 3D Orbital Ring 1 (Tilted X, Clockwise Orbit) */}
        <div
          className="absolute inset-[-8%] pointer-events-none rounded-full border border-dashed border-cyan-400/50"
          style={{
            animation: isHovered
              ? 'holoRingClockwise 5s linear infinite'
              : 'holoRingClockwise 10s linear infinite',
            transformStyle: 'preserve-3d',
            boxShadow: '0 0 12px rgba(6,182,212,0.4)',
          }}
        >
          {/* Orbiting Satellite Data Bead 1 */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-200 border border-white shadow-[0_0_10px_#38bdf8]"
          />
        </div>

        {/* 5. Gyroscopic 3D Orbital Ring 2 (Tilted Y, Counter-Clockwise Orbit) */}
        <div
          className="absolute inset-[-4%] pointer-events-none rounded-full border border-sky-300/40"
          style={{
            animation: isHovered
              ? 'holoRingCounter 6s linear infinite'
              : 'holoRingCounter 12s linear infinite',
            transformStyle: 'preserve-3d',
            boxShadow: '0 0 10px rgba(14,165,233,0.35)',
          }}
        >
          {/* Orbiting Satellite Data Bead 2 */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]"
          />
        </div>

        {/* 6. Pedestal Beam of Light / Bottom Lens Flare */}
        <div
          className="absolute bottom-[-18%] left-1/2 -translate-x-1/2 w-[70%] h-[16px] pointer-events-none rounded-full blur-[6px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(56,189,248,0.9) 0%, rgba(14,165,233,0.5) 40%, transparent 80%)',
          }}
        />

        {/* 7. Hover Cyber Telemetry Tooltip */}
        {isHovered && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 pointer-events-none whitespace-nowrap">
            <div className="px-2.5 py-1 rounded-md bg-slate-950/90 border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center space-x-1.5 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-300">
                AI CUSTOMER NODE • 3D ROTATION
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
