import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { useTheme, PALETTES, PaletteId } from '../themeContext';

interface AccentPalettePickerProps {
  className?: string;
}

export const AccentPalettePicker: React.FC<AccentPalettePickerProps> = ({ className = '' }) => {
  const { palette, setPalette, isDarkTheme, currentPalette } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const paletteList = Object.values(PALETTES);

  return (
    <div ref={dropdownRef} className={`relative select-none ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-full border transition-all cursor-pointer group ${
          isDarkTheme
            ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600 text-slate-200 shadow-md'
            : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-sm'
        }`}
        title="Change Accent Color Theme"
        aria-label="Change Accent Color Theme"
      >
        <div
          className="w-4 h-4 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-110"
          style={{ backgroundColor: currentPalette.primary }}
        >
          <Sparkles className="w-2.5 h-2.5 text-slate-950" />
        </div>
        <span className="text-xs font-semibold hidden sm:inline-block">
          {currentPalette.name.split(' ')[0]}
        </span>
        <Palette className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-colors" />
      </button>

      {/* Floating Theme Palette Dropdown */}
      {isOpen && (
        <div
          className={`absolute top-full right-0 mt-2 w-64 p-2.5 rounded-2xl backdrop-blur-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 border ${
            isDarkTheme
              ? 'bg-[#050b18]/95 border-slate-700/80 text-white shadow-black/80'
              : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/60'
          }`}
        >
          <div className="flex items-center justify-between px-2 py-1.5 mb-1 border-b border-slate-800/60">
            <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${
              isDarkTheme ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Accent Palette
            </span>
            <span className="text-[10px] font-mono text-slate-400">6 Themes</span>
          </div>

          <div className="space-y-1">
            {paletteList.map((p) => {
              const isSelected = p.id === palette;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setPalette(p.id as PaletteId);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? isDarkTheme
                        ? 'bg-slate-800/80 border border-slate-700 shadow-sm'
                        : 'bg-slate-100 border border-slate-200 shadow-sm'
                      : isDarkTheme
                      ? 'hover:bg-slate-900/60 border border-transparent'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    {/* Multi-tone Color Pill */}
                    <div className="flex items-center -space-x-1 shrink-0">
                      <span
                        className="w-4 h-4 rounded-full border border-black/20 shadow-sm z-20"
                        style={{ backgroundColor: p.primary }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-sm z-10"
                        style={{ backgroundColor: p.secondary }}
                      />
                    </div>

                    <div className="leading-tight">
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-xs font-bold ${isSelected ? (isDarkTheme ? 'text-white' : 'text-slate-950') : (isDarkTheme ? 'text-slate-200' : 'text-slate-700')}`}>
                          {p.name}
                        </span>
                      </div>
                      <span className={`text-[10px] block ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                        {p.subtitle}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: p.primary }}
                    >
                      <Check className="w-3 h-3 text-slate-950 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
