import React, { createContext, useContext, useState, useEffect } from 'react';

export type PaletteId = 'cyan' | 'emerald' | 'gold' | 'violet' | 'sapphire' | 'rose';

export interface PaletteConfig {
  id: PaletteId;
  name: string;
  subtitle: string;
  primary: string; // hex
  secondary: string; // hex
  accent: string; // hex
  badgeClass: string;
  textAccentClass: string;
  ctaGradientClass: string;
  ctaShadowClass: string;
  hoverBorderClass: string;
  ambientGlowTop: string;
  ambientGlowRight: string;
  ambientGlowLeft: string;
  bankPulseGlow: string;
  sparklineColor: string;
  donutColors: [string, string, string, string, string];
  brandGradient: string;
}

export const PALETTES: Record<PaletteId, PaletteConfig> = {
  cyan: {
    id: 'cyan',
    name: 'Cyber Cyan',
    subtitle: 'Electric AI & Cyberpunk Blue',
    primary: '#00f0ff',
    secondary: '#6366f1',
    accent: '#d946ef',
    badgeClass: 'bg-sky-500/15 border-sky-400/50 text-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.25)]',
    textAccentClass: 'text-[#00f0ff] drop-shadow-[0_0_20px_rgba(0,240,255,0.4)]',
    ctaGradientClass: 'bg-gradient-to-r from-[#00d2ff] via-[#6366f1] to-[#c026d3] hover:from-[#38bdf8] hover:to-[#d946ef]',
    ctaShadowClass: 'shadow-[0_0_25px_rgba(0,210,255,0.35)] hover:shadow-[0_0_35px_rgba(192,38,211,0.5)]',
    hoverBorderClass: 'hover:border-sky-400/80',
    ambientGlowTop: 'bg-sky-600/15',
    ambientGlowRight: 'bg-blue-600/15',
    ambientGlowLeft: 'bg-purple-600/10',
    bankPulseGlow: 'radial-gradient(circle, rgba(0,240,255,0.4) 0%, rgba(99,102,241,0.25) 45%, transparent 70%)',
    sparklineColor: '#38bdf8',
    donutColors: ['#06b6d4', '#3b82f6', '#a855f7', '#ec4899', '#f97316'],
    brandGradient: 'from-cyan-500 via-sky-600 to-indigo-600',
  },
  emerald: {
    id: 'emerald',
    name: 'FinTech Emerald',
    subtitle: 'Institutional Wealth & Mint Green',
    primary: '#10b981',
    secondary: '#0d9488',
    accent: '#06b6d4',
    badgeClass: 'bg-emerald-500/15 border-emerald-400/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    textAccentClass: 'text-[#10b981] drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]',
    ctaGradientClass: 'bg-gradient-to-r from-[#10b981] via-[#0d9488] to-[#0284c7] hover:from-[#34d399] hover:to-[#38bdf8]',
    ctaShadowClass: 'shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(14,165,233,0.5)]',
    hoverBorderClass: 'hover:border-emerald-400/80',
    ambientGlowTop: 'bg-emerald-600/15',
    ambientGlowRight: 'bg-teal-600/15',
    ambientGlowLeft: 'bg-cyan-600/10',
    bankPulseGlow: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, rgba(13,148,136,0.25) 45%, transparent 70%)',
    sparklineColor: '#10b981',
    donutColors: ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6'],
    brandGradient: 'from-emerald-500 via-teal-600 to-cyan-700',
  },
  gold: {
    id: 'gold',
    name: 'Royal Gold',
    subtitle: 'Private Wealth & Warm Amber',
    primary: '#f59e0b',
    secondary: '#d97706',
    accent: '#fbbf24',
    badgeClass: 'bg-amber-500/15 border-amber-400/50 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    textAccentClass: 'text-[#fbbf24] drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]',
    ctaGradientClass: 'bg-gradient-to-r from-[#f59e0b] via-[#ea580c] to-[#b45309] hover:from-[#fbbf24] hover:to-[#f97316]',
    ctaShadowClass: 'shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(234,88,12,0.5)]',
    hoverBorderClass: 'hover:border-amber-400/80',
    ambientGlowTop: 'bg-amber-600/15',
    ambientGlowRight: 'bg-orange-600/15',
    ambientGlowLeft: 'bg-yellow-600/10',
    bankPulseGlow: 'radial-gradient(circle, rgba(245,158,11,0.4) 0%, rgba(217,119,6,0.25) 45%, transparent 70%)',
    sparklineColor: '#f59e0b',
    donutColors: ['#fbbf24', '#f59e0b', '#f97316', '#ea580c', '#c2410c'],
    brandGradient: 'from-amber-400 via-orange-500 to-amber-700',
  },
  violet: {
    id: 'violet',
    name: 'Electric Violet',
    subtitle: 'Deep AI & Neon Magenta',
    primary: '#a855f7',
    secondary: '#9333ea',
    accent: '#f43f5e',
    badgeClass: 'bg-purple-500/15 border-purple-400/50 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.25)]',
    textAccentClass: 'text-[#c084fc] drop-shadow-[0_0_20px_rgba(192,132,252,0.4)]',
    ctaGradientClass: 'bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#6366f1] hover:from-[#c084fc] hover:to-[#f43f5e]',
    ctaShadowClass: 'shadow-[0_0_25px_rgba(168,85,247,0.35)] hover:shadow-[0_0_35px_rgba(236,72,153,0.5)]',
    hoverBorderClass: 'hover:border-purple-400/80',
    ambientGlowTop: 'bg-purple-600/15',
    ambientGlowRight: 'bg-fuchsia-600/15',
    ambientGlowLeft: 'bg-indigo-600/10',
    bankPulseGlow: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(236,72,153,0.25) 45%, transparent 70%)',
    sparklineColor: '#c084fc',
    donutColors: ['#a855f7', '#ec4899', '#8b5cf6', '#6366f1', '#06b6d4'],
    brandGradient: 'from-purple-500 via-fuchsia-600 to-indigo-700',
  },
  sapphire: {
    id: 'sapphire',
    name: 'Corporate Sapphire',
    subtitle: 'Tier-1 Investment Banking Blue',
    primary: '#2563eb',
    secondary: '#1d4ed8',
    accent: '#38bdf8',
    badgeClass: 'bg-blue-500/15 border-blue-400/50 text-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.25)]',
    textAccentClass: 'text-[#60a5fa] drop-shadow-[0_0_20px_rgba(96,165,250,0.4)]',
    ctaGradientClass: 'bg-gradient-to-r from-[#2563eb] via-[#1d4ed8] to-[#0284c7] hover:from-[#3b82f6] hover:to-[#38bdf8]',
    ctaShadowClass: 'shadow-[0_0_25px_rgba(37,99,235,0.35)] hover:shadow-[0_0_35px_rgba(2,132,199,0.5)]',
    hoverBorderClass: 'hover:border-blue-400/80',
    ambientGlowTop: 'bg-blue-600/15',
    ambientGlowRight: 'bg-indigo-600/15',
    ambientGlowLeft: 'bg-sky-600/10',
    bankPulseGlow: 'radial-gradient(circle, rgba(37,99,235,0.4) 0%, rgba(29,78,216,0.25) 45%, transparent 70%)',
    sparklineColor: '#60a5fa',
    donutColors: ['#2563eb', '#3b82f6', '#60a5fa', '#0ea5e9', '#38bdf8'],
    brandGradient: 'from-blue-600 via-indigo-600 to-sky-600',
  },
  rose: {
    id: 'rose',
    name: 'Ruby Crimson',
    subtitle: 'Risk Sentinel & Quantitative Red',
    primary: '#f43f5e',
    secondary: '#e11d48',
    accent: '#fb923c',
    badgeClass: 'bg-rose-500/15 border-rose-400/50 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.25)]',
    textAccentClass: 'text-[#fb7185] drop-shadow-[0_0_20px_rgba(251,113,133,0.4)]',
    ctaGradientClass: 'bg-gradient-to-r from-[#f43f5e] via-[#e11d48] to-[#ea580c] hover:from-[#fb7185] hover:to-[#f97316]',
    ctaShadowClass: 'shadow-[0_0_25px_rgba(244,63,94,0.35)] hover:shadow-[0_0_35px_rgba(234,88,12,0.5)]',
    hoverBorderClass: 'hover:border-rose-400/80',
    ambientGlowTop: 'bg-rose-600/15',
    ambientGlowRight: 'bg-red-600/15',
    ambientGlowLeft: 'bg-orange-600/10',
    bankPulseGlow: 'radial-gradient(circle, rgba(244,63,94,0.4) 0%, rgba(225,29,72,0.25) 45%, transparent 70%)',
    sparklineColor: '#fb7185',
    donutColors: ['#f43f5e', '#fb7185', '#fb923c', '#ea580c', '#e11d48'],
    brandGradient: 'from-rose-500 via-red-600 to-orange-600',
  },
};

interface ThemeContextType {
  palette: PaletteId;
  setPalette: (p: PaletteId) => void;
  isDarkTheme: boolean;
  setIsDarkTheme: React.Dispatch<React.SetStateAction<boolean>>;
  currentPalette: PaletteConfig;
}

const ThemeContext = createContext<ThemeContextType>({
  palette: 'cyan',
  setPalette: () => {},
  isDarkTheme: true,
  setIsDarkTheme: () => {},
  currentPalette: PALETTES.cyan,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [palette, setPaletteState] = useState<PaletteId>(() => {
    const saved = localStorage.getItem('banksight_palette') as PaletteId;
    return saved && PALETTES[saved] ? saved : 'cyan';
  });

  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    const saved = localStorage.getItem('banksight_dark_theme');
    return saved !== null ? saved === 'true' : true;
  });

  const setPalette = (p: PaletteId) => {
    setPaletteState(p);
    localStorage.setItem('banksight_palette', p);
  };

  useEffect(() => {
    localStorage.setItem('banksight_dark_theme', String(isDarkTheme));
  }, [isDarkTheme]);

  const currentPalette = PALETTES[palette] || PALETTES.cyan;

  return (
    <ThemeContext.Provider
      value={{
        palette,
        setPalette,
        isDarkTheme,
        setIsDarkTheme,
        currentPalette,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
