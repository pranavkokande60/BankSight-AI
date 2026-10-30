import React, { useState, useEffect, useRef } from 'react';
import bankHeroImg from '../assets/bank_hero.jpg';
import { useTheme } from '../themeContext';

interface FuturisticBankTower3DProps {
  className?: string;
  isDarkTheme?: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  alpha: number;
  alphaSpeed: number;
  color: string;
}

export const FuturisticBankTower3D: React.FC<FuturisticBankTower3DProps> = ({
  className = '',
  isDarkTheme: isDarkThemeProp,
}) => {
  const { currentPalette, isDarkTheme: isDarkThemeCtx } = useTheme();
  const isDarkTheme = isDarkThemeProp !== undefined ? isDarkThemeProp : isDarkThemeCtx;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // 1. Interactive Mouse Parallax
  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      targetX = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      targetY = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1
    };

    const updateParallax = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      setMouseOffset({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(updateParallax);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrameId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 2. Cyber Floating Ambient Particles (Subtle Glowing Blue & Magenta Sparks)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 1200);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 760);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = [
      currentPalette.primary,
      currentPalette.secondary,
      currentPalette.accent,
      '#ffffff',
      '#38bdf8',
    ];
    const particles: Particle[] = Array.from({ length: 32 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      speedY: -(Math.random() * 0.45 + 0.15),
      speedX: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.6 + 0.2,
      alphaSpeed: Math.random() * 0.008 + 0.004,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.alpha += p.alphaSpeed;

        if (p.alpha > 0.85 || p.alpha < 0.15) {
          p.alphaSpeed = -p.alphaSpeed;
        }

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[640px] lg:min-h-[760px] overflow-hidden select-none ${className}`}
    >
      {/* 1. Base Layer: Bank Photo with Smooth Interactive 3D Parallax */}
      <div
        className="absolute inset-0 transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: `scale(1.06) translate3d(${mouseOffset.x * -14}px, ${mouseOffset.y * -10}px, 0)`,
        }}
      >
        <div className="w-full h-full translate-x-[6%] sm:translate-x-[8%] lg:translate-x-[11%] xl:translate-x-[12%]">
          <img
            src={bankHeroImg}
            alt="BankSight AI Futuristic Headquarters"
            className="w-full h-full object-cover object-center brightness-[1.04] contrast-[1.08]"
          />
        </div>
      </div>

      {/* 2. Left Contrast Vignette (Preserves 100% legibility of headline & analytics boxes) */}
      <div
        className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${
          isDarkTheme
            ? 'bg-gradient-to-r from-[#030712] via-[#030712]/90 30% via-[#030712]/50 45% to-transparent 60%'
            : 'bg-gradient-to-r from-white via-white/90 30% via-white/50 45% to-transparent 60%'
        }`}
      />

      {/* 3. Bottom Seamless Floor Blend into KPI Section */}
      <div
        className={`absolute inset-x-0 bottom-0 h-40 pointer-events-none bg-gradient-to-t ${
          isDarkTheme
            ? 'from-[#030712] via-[#030712]/70 to-transparent'
            : 'from-[#f8fafc] via-[#f8fafc]/70 to-transparent'
        }`}
      />

      {/* 4. Top Fade into Navbar */}
      <div
        className={`absolute inset-x-0 top-0 h-24 pointer-events-none bg-gradient-to-b ${
          isDarkTheme
            ? 'from-[#030712]/75 to-transparent'
            : 'from-white/75 to-transparent'
        }`}
      />

      {/* 5. Center-Bank Ambient Glow Pulse */}
      <div
        className="absolute top-[42%] left-[62%] xl:left-[64%] -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full pointer-events-none blur-[100px] opacity-45 animate-pulse"
        style={{
          background: currentPalette.bankPulseGlow,
        }}
      />

      {/* 6. Floating Ambient Cyber Sparkles Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
      />


    </div>
  );
};
