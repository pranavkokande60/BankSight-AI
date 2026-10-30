import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Orbit,
  Users,
  Target,
  ShieldCheck,
  AlertTriangle,
  Star,
  Brain,
  Sparkles,
  Database,
  BarChart3,
  BookOpen,
  UserCheck,
  User,
  Sun,
  Moon,
  Search,
  CheckCircle2,
  Percent,
  Coins,
  Shield,
  Activity,
  Globe
} from 'lucide-react';
import { FuturisticBankTower3D } from './FuturisticBankTower3D';
import { ThesisDossierModal } from './ThesisDossierModal';
import { useTheme } from '../themeContext';
import { api } from '../api';

interface LandingPageProps {
  onOpenLogin: () => void;
  onEnterDashboard: () => void;
  onNavigateGalaxy?: () => void;
  onNavigateTab?: (tab: any) => void;
  isAuthenticated?: boolean;
  currentUser?: any;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onEnterDashboard,
  onNavigateGalaxy = onEnterDashboard,
  onNavigateTab,
  isAuthenticated = false,
  currentUser,
}) => {
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<'home' | 'features' | 'analytics' | 'about' | 'contact'>('home');
  const { currentPalette, isDarkTheme, setIsDarkTheme } = useTheme();
  const [isAnalyticsDropdownOpen, setIsAnalyticsDropdownOpen] = useState(false);

  useEffect(() => {
    try {
      if (isDarkTheme) {
        document.documentElement.classList.add('dark');
        document.body.style.backgroundColor = '#030712';
        document.body.style.color = '#f8fafc';
      } else {
        document.documentElement.classList.remove('dark');
        document.body.style.backgroundColor = '#f8fafc';
        document.body.style.color = '#0f172a';
      }
      localStorage.setItem('banksight_theme', isDarkTheme ? 'dark' : 'light');
    } catch {}
  }, [isDarkTheme]);

  const featuresRef = useRef<HTMLDivElement>(null);

  // Helper for navigating to specific deep-dive tabs
  const handleNavigate = (tab: string) => {
    setIsAnalyticsDropdownOpen(false);
    if (onNavigateTab) {
      onNavigateTab(tab);
    } else {
      onEnterDashboard();
    }
  };

  // Live KPI state with fallback defaults matching European dataset
  const [totalAccounts, setTotalAccounts] = useState<number>(10847);
  const [churnRate, setChurnRate] = useState<number>(14.8);
  const [balanceExposure, setBalanceExposure] = useState<string>('€185.6M');
  const [championAuc, setChampionAuc] = useState<number>(0.861);
  const [countryStats, setCountryStats] = useState({
    France: 11.2,
    Spain: 14.8,
    Germany: 10.3,
  });

  useEffect(() => {
    api.getSummary()
      .then((data) => {
        if (data) {
          if (data.total_managed_accounts) setTotalAccounts(data.total_managed_accounts);
          if (data.churn_rate) setChurnRate(Number((data.churn_rate * 100).toFixed(1)));
          if (data.churned_balance_exposure) {
            const m = (data.churned_balance_exposure / 1_000_000).toFixed(1);
            setBalanceExposure(`€${m}M`);
          }
          if (data.champion_roc_auc) setChampionAuc(Number(data.champion_roc_auc.toFixed(3)));
        }
      })
      .catch(() => {});

    api.getCharts()
      .then((charts) => {
        if (charts && Array.isArray(charts.country_comparison)) {
          const map: Record<string, number> = {};
          charts.country_comparison.forEach((c: any) => {
            map[c.country] = Number((c.churn_rate * 100).toFixed(1));
          });
          if (map.France && map.Spain && map.Germany) {
            setCountryStats({
              France: map.France,
              Spain: map.Spain,
              Germany: map.Germany,
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  const scrollToFeatures = () => {
    setActiveNav('features');
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen flex flex-col overflow-x-hidden selection:bg-cyan-500 selection:text-white relative font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300 ${
      isDarkTheme ? 'bg-[#030712] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Background Ambient Glows & Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-32 left-1/4 w-[650px] h-[650px] rounded-full blur-[140px] transition-opacity duration-500 ${
          isDarkTheme ? currentPalette.ambientGlowTop : 'bg-sky-300/25'
        }`} />
        <div className={`absolute top-28 right-10 w-[600px] h-[600px] rounded-full blur-[150px] transition-opacity duration-500 ${
          isDarkTheme ? currentPalette.ambientGlowRight : 'bg-blue-200/35'
        }`} />
        <div className={`absolute top-[450px] left-10 w-[500px] h-[500px] rounded-full blur-[160px] transition-opacity duration-500 ${
          isDarkTheme ? currentPalette.ambientGlowLeft : 'bg-purple-200/25'
        }`} />
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${isDarkTheme ? 'opacity-[0.035]' : 'opacity-[0.06]'}`}
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${isDarkTheme ? currentPalette.primary : '#0284c7'} 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* 1. TOP NAVBAR */}
      <header className={`h-20 px-6 sm:px-10 lg:px-12 flex items-center justify-between border-b backdrop-blur-md sticky top-0 z-40 transition-colors duration-300 ${
        isDarkTheme ? 'border-slate-800/60 bg-[#030712]/85' : 'border-slate-200/80 bg-white/85 shadow-sm'
      }`}>
        {/* Brand: 3D Hexagonal Isometric Logo */}
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={onEnterDashboard}>
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${currentPalette.brandGradient} p-[1px] shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform`}>
            <div className={`w-full h-full rounded-[11px] flex items-center justify-center ${isDarkTheme ? 'bg-[#050b18]' : 'bg-white'}`}>
              <svg
                className="w-6 h-6 transition-all"
                style={{ color: currentPalette.primary, filter: `drop-shadow(0 0 8px ${currentPalette.primary}80)` }}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L3 7V17L12 22L21 17V7L12 2ZM12 4.3L18.8 8.1L12 11.9L5.2 8.1L12 4.3ZM5 9.8L11 13.1V20L5 16.7V9.8ZM13 20V13.1L19 9.8V16.7L13 20Z" />
              </svg>
            </div>
          </div>

          <span className={`font-extrabold text-xl tracking-tight font-['Plus_Jakarta_Sans',sans-serif] leading-none ${
            isDarkTheme ? 'text-white' : 'text-slate-900'
          }`}>
            BankSight AI
          </span>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveNav('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              activeNav === 'home'
                ? (isDarkTheme ? currentPalette.badgeClass : 'bg-sky-100 text-sky-800 font-bold')
                : (isDarkTheme ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            <span>Home</span>
          </button>

          <button
            onClick={scrollToFeatures}
            className={`relative py-1 transition-colors ${
              activeNav === 'features'
                ? (isDarkTheme ? 'text-white' : 'text-sky-600 font-bold')
                : (isDarkTheme ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            <span>Features</span>
            {activeNav === 'features' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-sky-500 rounded-full shadow-[0_0_8px_#38bdf8]" />
            )}
          </button>

          {/* Analytics Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsAnalyticsDropdownOpen((prev) => !prev)}
              className={`relative py-1 transition-colors flex items-center space-x-1 ${
                activeNav === 'analytics' || isAnalyticsDropdownOpen
                  ? (isDarkTheme ? 'text-white' : 'text-sky-600 font-bold')
                  : (isDarkTheme ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              <span>Analytics</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isAnalyticsDropdownOpen ? 'rotate-180 text-cyan-400' : 'text-slate-400'}`} />
            </button>

            {isAnalyticsDropdownOpen && (
              <div className={`absolute top-full left-0 mt-2 w-64 p-2 rounded-xl backdrop-blur-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 border ${
                isDarkTheme ? 'bg-slate-950/95 border-sky-500/30 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/50'
              }`}>
                <button
                  onClick={() => handleNavigate('dashboard')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center space-x-2 transition-colors ${
                    isDarkTheme ? 'hover:bg-slate-900/90 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                  <div>
                    <span className="font-semibold block">Executive Decision Terminal</span>
                    <span className={`text-[10px] ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>KPI portfolio & high-level health</span>
                  </div>
                </button>
                <button
                  onClick={() => handleNavigate('galaxy3d')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center space-x-2 transition-colors ${
                    isDarkTheme ? 'hover:bg-slate-900/90 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <Orbit className="w-3.5 h-3.5 text-purple-400" />
                  <div>
                    <span className="font-semibold block">3D Customer Galaxy</span>
                    <span className={`text-[10px] ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>10,847 customer embeddings</span>
                  </div>
                </button>
                <button
                  onClick={() => handleNavigate('model-lab')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center space-x-2 transition-colors ${
                    isDarkTheme ? 'hover:bg-slate-900/90 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5 text-sky-400" />
                  <div>
                    <span className="font-semibold block">ML Model Laboratory</span>
                    <span className={`text-[10px] ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>LightGBM, XGBoost, CatBoost</span>
                  </div>
                </button>
                <button
                  onClick={() => handleNavigate('explainability')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center space-x-2 transition-colors ${
                    isDarkTheme ? 'hover:bg-slate-900/90 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-emerald-400" />
                  <div>
                    <span className="font-semibold block">SHAP Explainability</span>
                    <span className={`text-[10px] ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Transparent feature contributions</span>
                  </div>
                </button>
                <button
                  onClick={() => handleNavigate('eara-lab')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center space-x-2 transition-colors ${
                    isDarkTheme ? 'hover:bg-slate-900/90 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <Target className="w-3.5 h-3.5 text-pink-400" />
                  <div>
                    <span className="font-semibold block">EARA Retention Lab</span>
                    <span className={`text-[10px] ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Evidence-aware retention strategies</span>
                  </div>
                </button>
                <button
                  onClick={() => handleNavigate('geospatial')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center space-x-2 transition-colors ${
                    isDarkTheme ? 'hover:bg-slate-900/90 text-slate-200' : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <div>
                    <span className="font-semibold block">European Geospatial Intel</span>
                    <span className={`text-[10px] ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>France, Spain, Germany regional risk</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setActiveNav('about');
              setIsDossierOpen(true);
            }}
            className={`relative py-1 transition-colors ${
              activeNav === 'about'
                ? (isDarkTheme ? 'text-white' : 'text-sky-600 font-bold')
                : (isDarkTheme ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            <span>About</span>
          </button>

          <button
            onClick={() => {
              setActiveNav('contact');
              setIsDossierOpen(true);
            }}
            className={`relative py-1 transition-colors ${
              activeNav === 'contact'
                ? (isDarkTheme ? 'text-white' : 'text-sky-600 font-bold')
                : (isDarkTheme ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            <span>Contact</span>
          </button>
        </nav>

        {/* Right Nav Actions */}
        <div className="flex items-center space-x-3 sm:space-x-3.5">
          <button
            onClick={onOpenLogin}
            className={`hidden sm:inline-flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
              isDarkTheme
                ? 'text-slate-300 hover:text-white border-slate-700/80 hover:border-slate-600 bg-slate-900/60 hover:bg-slate-800'
                : 'text-slate-700 hover:text-slate-900 border-slate-300 hover:border-slate-400 bg-white shadow-sm'
            }`}
            title="Analyst Profile: Pranav Kokande"
          >
            <img
              src="/pranav_avatar.jpg"
              alt="Pranav Kokande"
              className="w-5 h-5 rounded-full object-cover object-[center_20%] border border-cyan-400/60 shadow-sm"
            />
            <span>{currentUser ? currentUser.name : 'Sign In'}</span>
          </button>

          <button
            onClick={onEnterDashboard}
            className={`flex items-center space-x-2 px-5 py-2.5 ${currentPalette.ctaGradientClass} ${currentPalette.ctaShadowClass} text-white rounded-full text-xs sm:text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer`}
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION: FULL-WIDTH UNIFIED 3D STAGE */}
      <section className="relative w-full overflow-hidden flex flex-col justify-between">
        {/* Full-bleed 3D Bank Scene spanning the whole hero area */}
        <div className="absolute inset-0 z-0">
          <FuturisticBankTower3D isDarkTheme={isDarkTheme} />
        </div>

        {/* Hero Foreground Content Overlay */}
        <div className="relative z-10 w-full max-w-[1520px] mx-auto px-6 sm:px-10 lg:px-12 pt-6 pb-6 flex-1 flex flex-col justify-between pointer-events-none">
          {/* Main Hero Row */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-4">
            {/* HERO LEFT COLUMN */}
            <div className="w-full lg:w-[47%] xl:w-[45%] max-w-2xl flex flex-col items-start text-left space-y-4 pt-1 lg:pt-0 pointer-events-auto z-20">
              {/* Headline matching reference image exactly */}
              <h1 className={`text-4xl sm:text-5xl lg:text-[46px] xl:text-[50px] font-black tracking-tight leading-[1.08] transition-colors ${
                isDarkTheme ? 'text-white' : 'text-slate-900'
              }`}>
                Smarter Banking.
                <br />
                Stronger Decisions.
                <br />
                <span className={currentPalette.textAccentClass}>
                  Powered{' '}
                </span>
                <span style={{ color: currentPalette.accent, filter: `drop-shadow(0 0 20px ${currentPalette.accent}80)` }}>
                  by AI.
                </span>
              </h1>

              {/* Supporting Description matching reference image exactly */}
              <p className={`text-xs sm:text-sm max-w-xl leading-relaxed font-normal transition-colors ${
                isDarkTheme ? 'text-slate-300' : 'text-slate-600'
              }`}>
                BankSight AI combines explainable AI, advanced analytics and evidence-aware retention intelligence to help banks understand churn, segment customers and retain what matters — with confidence.
              </p>

              {/* Action Buttons matching reference image */}
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  onClick={onEnterDashboard}
                  className={`px-5 py-3 ${currentPalette.ctaGradientClass} ${currentPalette.ctaShadowClass} text-white rounded-full text-xs sm:text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center space-x-2 group cursor-pointer`}
                >
                  <span>Enter Decision Terminal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onNavigateGalaxy}
                  className={`px-4 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all backdrop-blur-md flex items-center space-x-2 cursor-pointer border ${
                    isDarkTheme
                      ? 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-700/80 hover:border-slate-500 text-slate-200 hover:text-white'
                      : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm'
                  }`}
                >
                  <Orbit className="w-4 h-4 transition-colors" style={{ color: currentPalette.primary }} />
                  <span>Explore 3D Customer Galaxy</span>
                </button>
              </div>

              {/* 4 Feature Pills beneath CTAs matching reference photo: Explainable AI, Real Data, Secure, Scalable */}
              <div className="pt-1 flex flex-wrap items-center gap-2.5 text-xs">
                <div
                  onClick={() => handleNavigate('explainability')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                    isDarkTheme ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-sky-400' : 'bg-white border-slate-200 text-slate-700 shadow-sm hover:border-sky-400'
                  }`}
                  title="Click to explore Explainable AI & SHAP"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: currentPalette.primary }} />
                  <span className="font-medium text-[11px]">Explainable AI</span>
                </div>
                <div
                  onClick={() => handleNavigate('quality')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                    isDarkTheme ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-cyan-400' : 'bg-white border-slate-200 text-slate-700 shadow-sm hover:border-cyan-400'
                  }`}
                  title="Click to view Data Quality & Validation Centre"
                >
                  <BarChart3 className="w-3.5 h-3.5" style={{ color: currentPalette.secondary }} />
                  <span className="font-medium text-[11px]">Real Data</span>
                </div>
                <div
                  onClick={() => handleNavigate('risk-passport')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                    isDarkTheme ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-emerald-400' : 'bg-white border-slate-200 text-slate-700 shadow-sm hover:border-emerald-400'
                  }`}
                  title="Click to inspect Customer Risk Passports"
                >
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: currentPalette.primary }} />
                  <span className="font-medium text-[11px]">Secure</span>
                </div>
                <div
                  onClick={() => handleNavigate('dashboard')}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                    isDarkTheme ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-purple-400' : 'bg-white border-slate-200 text-slate-700 shadow-sm hover:border-purple-400'
                  }`}
                  title="Click to open Executive Decision Dashboard"
                >
                  <Brain className="w-3.5 h-3.5" style={{ color: currentPalette.accent }} />
                  <span className="font-medium text-[11px]">Scalable</span>
                </div>
              </div>

              {/* THE 4 ANALYTICS BOXES: MOVED DIRECTLY BELOW THE FIRST IMAGE */}
              <div className="pt-2 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Customer Churn by Country */}
                <div
                  onClick={() => handleNavigate('geospatial')}
                  className={`pointer-events-auto cursor-pointer p-3 rounded-2xl backdrop-blur-xl border transition-all hover:scale-[1.02] group shadow-xl ${
                    isDarkTheme
                      ? 'bg-slate-950/85 border-sky-500/30 text-white shadow-sky-950/60 hover:border-sky-400/80'
                      : 'bg-white/95 border-sky-300 text-slate-900 shadow-slate-300/80 hover:border-sky-500'
                  }`}
                  title="Click to view Geospatial Country Intelligence"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <Globe className="w-3.5 h-3.5 text-sky-400" />
                      <span className={`text-[11px] font-bold tracking-wide ${isDarkTheme ? 'text-slate-100' : 'text-slate-900'}`}>
                        Customer Churn by Country
                      </span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] group-hover:text-cyan-400 transition-colors ${
                      isDarkTheme ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}>
                      🌍
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-2 rounded-sm bg-gradient-to-r from-blue-700 via-white to-red-600 inline-block shadow-sm" />
                        <span className={`font-medium text-[11px] ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>France</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-mono font-semibold text-[11px] ${isDarkTheme ? 'text-slate-200' : 'text-slate-900'}`}>
                          {countryStats.France}%
                        </span>
                        <svg className="w-9 h-3" viewBox="0 0 40 12">
                          <path d="M0 9 L 10 5 L 20 8 L 30 2 L 40 4" fill="none" stroke={currentPalette.sparklineColor} strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-2 rounded-sm bg-gradient-to-r from-red-600 via-yellow-400 to-red-600 inline-block shadow-sm" />
                        <span className={`font-medium text-[11px] ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>Spain</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-mono font-semibold text-[11px] ${isDarkTheme ? 'text-slate-200' : 'text-slate-900'}`}>
                          {countryStats.Spain}%
                        </span>
                        <svg className="w-9 h-3" viewBox="0 0 40 12">
                          <path d="M0 4 L 10 7 L 20 3 L 30 6 L 40 2" fill="none" stroke={currentPalette.sparklineColor} strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-2 rounded-sm bg-gradient-to-r from-black via-red-600 to-yellow-400 inline-block shadow-sm" />
                        <span className={`font-medium text-[11px] ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>Germany</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-mono font-semibold text-[11px] ${isDarkTheme ? 'text-slate-200' : 'text-slate-900'}`}>
                          {countryStats.Germany}%
                        </span>
                        <svg className="w-9 h-3" viewBox="0 0 40 12">
                          <path d="M0 6 L 10 3 L 20 8 L 30 4 L 40 5" fill="none" stroke={currentPalette.sparklineColor} strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Customer Segments */}
                <div
                  onClick={() => handleNavigate('segmentation')}
                  className={`pointer-events-auto cursor-pointer p-3 rounded-2xl backdrop-blur-xl border transition-all hover:scale-[1.02] group shadow-xl ${
                    isDarkTheme
                      ? 'bg-slate-950/85 border-sky-500/30 text-white shadow-sky-950/60 hover:border-sky-400/80'
                      : 'bg-white/95 border-sky-300 text-slate-900 shadow-slate-300/80 hover:border-sky-500'
                  }`}
                  title="Click to view Customer Segments & Personas"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[11px] font-bold ${isDarkTheme ? 'text-slate-100' : 'text-slate-900'}`}>Customer Segments</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                  </div>

                  <div className="flex items-center space-x-2.5">
                    {/* Segmented Donut Chart SVG */}
                    <div className="relative w-13 h-13 shrink-0 flex items-center justify-center">
                      <svg className="w-13 h-13 transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="transparent" stroke={currentPalette.donutColors[0]} strokeWidth="4.5" strokeDasharray="19.3 80.7" strokeDashoffset="0" />
                        <circle cx="18" cy="18" r="14" fill="transparent" stroke={currentPalette.donutColors[1]} strokeWidth="4.5" strokeDasharray="29.9 70.1" strokeDashoffset="-19.3" />
                        <circle cx="18" cy="18" r="14" fill="transparent" stroke={currentPalette.donutColors[2]} strokeWidth="4.5" strokeDasharray="15.8 84.2" strokeDashoffset="-49.2" />
                        <circle cx="18" cy="18" r="14" fill="transparent" stroke={currentPalette.donutColors[3]} strokeWidth="4.5" strokeDasharray="13.2 86.8" strokeDashoffset="-65.0" />
                        <circle cx="18" cy="18" r="14" fill="transparent" stroke={currentPalette.donutColors[4]} strokeWidth="4.5" strokeDasharray="9.6 90.4" strokeDashoffset="-78.2" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-3 h-3" style={{ color: currentPalette.primary }} />
                      </div>
                    </div>

                    {/* Legend with matching percentages */}
                    <div className={`space-y-0.5 text-[9px] font-medium flex-1 ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentPalette.donutColors[0] }} />
                          <span>High-Value</span>
                        </div>
                        <span className={`font-mono ${isDarkTheme ? 'text-slate-200' : 'text-slate-900'}`}>22%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentPalette.donutColors[1] }} />
                          <span>Standard</span>
                        </div>
                        <span className={`font-mono ${isDarkTheme ? 'text-slate-200' : 'text-slate-900'}`}>34%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentPalette.donutColors[2] }} />
                          <span>At-Risk</span>
                        </div>
                        <span className={`font-mono ${isDarkTheme ? 'text-slate-200' : 'text-slate-900'}`}>18%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentPalette.donutColors[3] }} />
                          <span>Dormant</span>
                        </div>
                        <span className={`font-mono ${isDarkTheme ? 'text-slate-200' : 'text-slate-900'}`}>15%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentPalette.donutColors[4] }} />
                          <span>New</span>
                        </div>
                        <span className={`font-mono ${isDarkTheme ? 'text-slate-200' : 'text-slate-900'}`}>11%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Key Insights */}
                <div
                  onClick={() => handleNavigate('churn-intel')}
                  className={`pointer-events-auto cursor-pointer p-3 rounded-2xl backdrop-blur-xl border transition-all hover:scale-[1.02] group shadow-xl ${
                    isDarkTheme
                      ? 'bg-slate-950/85 border-sky-500/30 text-white shadow-sky-950/60 hover:border-sky-400/80'
                      : 'bg-white/95 border-sky-300 text-slate-900 shadow-slate-300/80 hover:border-sky-500'
                  }`}
                  title="Click to view Churn Insights"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span className={`text-[11px] font-bold ${isDarkTheme ? 'text-slate-100' : 'text-slate-900'}`}>Key Insights</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] group-hover:text-cyan-400 transition-colors ${
                      isDarkTheme ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}>
                      ✢
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className={`flex items-start space-x-2 ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>
                      <div className="w-3.5 h-3.5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Users className="w-2 h-2" />
                      </div>
                      <span className="text-[10px] leading-tight">High churn risk in 46–59 age group</span>
                    </div>

                    <div className={`flex items-start space-x-2 ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>
                      <div className="w-3.5 h-3.5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                        <BookOpen className="w-2 h-2" />
                      </div>
                      <span className="text-[10px] leading-tight">Germany shows highest risk</span>
                    </div>

                    <div className={`flex items-start space-x-2 ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-2 h-2" />
                      </div>
                      <span className="text-[10px] leading-tight">Inactive members 2.3x more likely</span>
                    </div>

                    <div className={`flex items-start space-x-2 ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>
                      <div className="w-3.5 h-3.5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Star className="w-2 h-2" />
                      </div>
                      <span className="text-[10px] leading-tight">High-value customers at risk: 8.7%</span>
                    </div>
                  </div>
                </div>

                {/* 4. Model Performance */}
                <div
                  onClick={() => handleNavigate('model-lab')}
                  className={`pointer-events-auto cursor-pointer p-3 rounded-2xl backdrop-blur-xl border transition-all hover:scale-[1.02] group shadow-xl ${
                    isDarkTheme
                      ? 'bg-slate-950/85 border-sky-500/30 text-white shadow-sky-950/60 hover:border-sky-400/80'
                      : 'bg-white/95 border-sky-300 text-slate-900 shadow-slate-300/80 hover:border-sky-500'
                  }`}
                  title="Click to open ML Model Lab"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[11px] font-bold ${isDarkTheme ? 'text-slate-100' : 'text-slate-900'}`}>Model Performance</span>
                    <BarChart3 className="w-3.5 h-3.5 text-sky-400 group-hover:text-cyan-400 transition-colors" />
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Circular Donut Metric 0.861 */}
                    <div
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-inner ${
                        isDarkTheme ? 'bg-slate-900/90' : 'bg-slate-100'
                      }`}
                      style={{ borderColor: currentPalette.primary }}
                    >
                      <div className="text-center">
                        <span className={`text-[11px] font-black font-mono block leading-none ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{championAuc}</span>
                        <span className={`text-[7px] uppercase font-semibold block mt-0.5 ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>ROC-AUC</span>
                      </div>
                    </div>

                    {/* 4 Performance Metrics */}
                    <div className={`space-y-0.5 text-[9px] font-medium flex-1 pl-2.5 ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span>Accuracy</span>
                        </div>
                        <span className={`font-mono ${isDarkTheme ? 'text-slate-200' : 'text-slate-900'}`}>0.82</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span>Precision</span>
                        </div>
                        <span className={`font-mono ${isDarkTheme ? 'text-slate-200' : 'text-slate-900'}`}>0.78</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          <span>Recall</span>
                        </div>
                        <span className={`font-mono ${isDarkTheme ? 'text-slate-200' : 'text-slate-900'}`}>0.74</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          <span>F1 Score</span>
                        </div>
                        <span className={`font-mono ${isDarkTheme ? 'text-slate-200' : 'text-slate-900'}`}>0.76</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* HERO RIGHT AREA: 3D BANK & EUROPEAN MAP */}
            <div className="w-full lg:w-[53%] xl:w-[55%] relative min-h-[500px] lg:min-h-[640px] pointer-events-none">
              {/* European Attrition Map Preview */}
              <div
                onClick={() => handleNavigate('geospatial')}
                className={`pointer-events-auto cursor-pointer absolute bottom-2 sm:bottom-4 right-0 sm:right-2 w-72 p-3.5 rounded-2xl backdrop-blur-xl border transition-all hover:scale-[1.02] group shadow-2xl ${
                  isDarkTheme
                    ? 'bg-slate-950/85 border-sky-500/30 text-white shadow-sky-950/60 hover:border-sky-400/80'
                    : 'bg-white/95 border-sky-300 text-slate-900 shadow-slate-300/80 hover:border-sky-500'
                }`}
                title="Click to view European Geospatial Map"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: currentPalette.primary }} />
                    <span className={`text-[11px] font-bold ${isDarkTheme ? 'text-slate-100' : 'text-slate-900'}`}>European Attrition Map</span>
                  </div>
                  <div className={`flex items-center space-x-2 text-[9px] font-medium ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span className="flex items-center space-x-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#38bdf8]" /><span>France</span></span>
                    <span className="flex items-center space-x-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" /><span>Spain</span></span>
                    <span className="flex items-center space-x-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_#f43f5e]" /><span>Germany</span></span>
                  </div>
                </div>

                {/* Europe Stylized Vector Map with Active Telemetry Nodes */}
                <div className={`relative w-full h-14 rounded-xl border overflow-hidden flex items-center justify-center p-1 ${
                  isDarkTheme ? 'bg-slate-900/50 border-slate-800/80' : 'bg-slate-100/90 border-slate-200'
                }`}>
                  <svg className="w-full h-full" viewBox="0 0 220 50">
                    {/* Background Grid Lines */}
                    <line x1="0" y1="25" x2="220" y2="25" stroke={isDarkTheme ? "#1e293b" : "#cbd5e1"} strokeWidth="0.8" strokeDasharray="3 3" />
                    <line x1="75" y1="0" x2="75" y2="50" stroke={isDarkTheme ? "#1e293b" : "#cbd5e1"} strokeWidth="0.8" strokeDasharray="3 3" />
                    <line x1="145" y1="0" x2="145" y2="50" stroke={isDarkTheme ? "#1e293b" : "#cbd5e1"} strokeWidth="0.8" strokeDasharray="3 3" />

                    {/* Regional Map Landmass Curves */}
                    <path
                      d="M 25 45 Q 35 38, 50 35 Q 65 32, 75 22 Q 85 15, 105 18 Q 125 12, 140 16 Q 160 10, 185 24 Q 200 35, 215 42"
                      fill="none"
                      stroke={isDarkTheme ? "#0369a1" : "#38bdf8"}
                      strokeWidth="1.5"
                      opacity="0.6"
                    />

                    {/* Flight & Telemetry Arc Connectors */}
                    <path d="M 45 36 Q 65 14, 90 22" fill="none" stroke="#38bdf8" strokeWidth="1.6" strokeDasharray="2 2" opacity="0.8" />
                    <path d="M 90 22 Q 115 8, 145 18" fill="none" stroke="#ec4899" strokeWidth="1.6" strokeDasharray="2 2" opacity="0.8" />

                    {/* Node 1: Spain (Madrid) */}
                    <circle cx="45" cy="36" r="3.5" fill="#f59e0b" />
                    <circle cx="45" cy="36" r="6" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.6" className="animate-ping" />
                    <text x="45" y="46" fill={isDarkTheme ? "#cbd5e1" : "#334155"} fontSize="7" fontWeight="bold" textAnchor="middle">ES {countryStats.Spain}%</text>

                    {/* Node 2: France (Paris) */}
                    <circle cx="90" cy="22" r="3.5" fill="#3b82f6" />
                    <circle cx="90" cy="22" r="6.5" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.6" className="animate-ping" />
                    <text x="90" y="14" fill={isDarkTheme ? "#cbd5e1" : "#334155"} fontSize="7" fontWeight="bold" textAnchor="middle">FR {countryStats.France}%</text>

                    {/* Node 3: Germany (Frankfurt/Berlin) */}
                    <circle cx="145" cy="18" r="4" fill="#f43f5e" />
                    <circle cx="145" cy="18" r="7.5" fill="none" stroke="#f43f5e" strokeWidth="1" opacity="0.6" className="animate-ping" />
                    <text x="145" y="32" fill={isDarkTheme ? "#fda4af" : "#9f1239"} fontSize="7" fontWeight="bold" textAnchor="middle">DE {countryStats.Germany}%</text>

                    {/* Attrition Trend Sparkline */}
                    <path d="M 175 42 L 188 34 L 198 38 L 212 20" fill="none" stroke={currentPalette.primary} strokeWidth="2" strokeLinecap="round" />
                    <circle cx="212" cy="20" r="2.5" fill={currentPalette.primary} />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LOWER CONTENT SECTION */}
      <main className="w-full max-w-[1520px] mx-auto px-6 sm:px-10 lg:px-12 pb-8 flex flex-col justify-between relative z-10">
        {/* 4 KPI METRIC CARDS */}
        <div className="mt-6 pt-2 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Total Customers */}
            <div
              onClick={() => handleNavigate('customer-mgmt')}
              className={`p-4 rounded-2xl backdrop-blur-xl border transition-all hover:scale-[1.01] cursor-pointer group shadow-xl flex items-center justify-between ${
                isDarkTheme
                  ? 'bg-slate-900/60 border-sky-500/20 text-white shadow-slate-950/40 hover:border-sky-400/50'
                  : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/70 hover:border-sky-400'
              }`}
              title="Click to explore customer portfolio management"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                    Total Customers
                  </span>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <p className={`text-xl font-black font-mono ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{totalAccounts.toLocaleString()}</p>
                    <span className="text-[10px] font-bold text-emerald-500">↑ 2.6%</span>
                  </div>
                  <p className={`text-[10px] ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Unique customers in dataset</p>
                </div>
              </div>

              {/* Cyan Sparkline */}
              <svg className="w-16 h-8 overflow-visible shrink-0 ml-2" viewBox="0 0 60 30">
                <path d="M0 24 L 15 20 L 30 25 L 45 12 L 60 6" fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>

            {/* KPI 2: Observed Churn Rate */}
            <div
              onClick={() => handleNavigate('churn-intel')}
              className={`p-4 rounded-2xl backdrop-blur-xl border transition-all hover:scale-[1.01] cursor-pointer group shadow-xl flex items-center justify-between ${
                isDarkTheme
                  ? 'bg-slate-900/60 border-sky-500/20 text-white shadow-slate-950/40 hover:border-fuchsia-400/50'
                  : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/70 hover:border-fuchsia-400'
              }`}
              title="Click to view Churn Intelligence"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500 shadow-sm group-hover:scale-110 transition-transform">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                    Observed Churn Rate
                  </span>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <p className={`text-xl font-black font-mono ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{churnRate}%</p>
                    <span className="text-[10px] font-bold text-rose-500">↑ 0.8%</span>
                  </div>
                  <p className={`text-[10px] ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Historical churn rate (labelled)</p>
                </div>
              </div>

              {/* Magenta Sparkline */}
              <svg className="w-16 h-8 overflow-visible shrink-0 ml-2" viewBox="0 0 60 30">
                <path d="M0 22 L 15 26 L 30 14 L 45 18 L 60 6" fill="none" stroke="#e879f9" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>

            {/* KPI 3: Churned Balance Exposure */}
            <div
              onClick={() => handleNavigate('survival')}
              className={`p-4 rounded-2xl backdrop-blur-xl border transition-all hover:scale-[1.01] cursor-pointer group shadow-xl flex items-center justify-between ${
                isDarkTheme
                  ? 'bg-slate-900/60 border-sky-500/20 text-white shadow-slate-950/40 hover:border-cyan-400/50'
                  : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/70 hover:border-cyan-400'
              }`}
              title="Click to view Balance & CLTV Survival analysis"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-500 shadow-sm group-hover:scale-110 transition-transform">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                    Churned Balance Exposure
                  </span>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <p className={`text-xl font-black font-mono ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{balanceExposure}</p>
                    <span className="text-[10px] font-bold text-emerald-500">↑ 3.2%</span>
                  </div>
                  <p className={`text-[10px] ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Total balance of churned customers</p>
                </div>
              </div>

              {/* Bar Chart Indicator */}
              <div className="flex items-end space-x-1 h-7 shrink-0 ml-2">
                <span className="w-1.5 h-2 bg-indigo-500/60 rounded-t-sm" />
                <span className="w-1.5 h-3.5 bg-indigo-500/80 rounded-t-sm" />
                <span className="w-1.5 h-5 bg-indigo-400 rounded-t-sm" />
                <span className="w-1.5 h-7 bg-cyan-400 rounded-t-sm shadow-[0_0_8px_#22d3ee]" />
              </div>
            </div>

            {/* KPI 4: Champion Model ROC-AUC */}
            <div
              onClick={() => handleNavigate('model-lab')}
              className={`p-4 rounded-2xl backdrop-blur-xl border transition-all hover:scale-[1.01] cursor-pointer group shadow-xl flex items-center justify-between ${
                isDarkTheme
                  ? 'bg-slate-900/60 border-sky-500/20 text-white shadow-slate-950/40 hover:border-sky-400/50'
                  : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/70 hover:border-sky-400'
              }`}
              title="Click to view Model Lab metrics"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-500 shadow-sm group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                    Champion Model ROC-AUC
                  </span>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <p className={`text-xl font-black font-mono ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{championAuc}</p>
                    <span className="text-[10px] font-bold text-emerald-500">↑ 1.4%</span>
                  </div>
                  <p className={`text-[10px] ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Best model performance (test set)</p>
                </div>
              </div>

              {/* Curved Sparkline */}
              <svg className="w-16 h-8 overflow-visible shrink-0 ml-2" viewBox="0 0 60 30">
                <path d="M0 26 C 20 25, 35 15, 60 5" fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* System Status Telemetry Indicator */}
        <div className="flex items-center justify-center my-6 z-20">
          <div className={`inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full border text-[11px] font-mono backdrop-blur-xl shadow-lg transition-colors ${
            isDarkTheme ? 'bg-slate-900/80 border-emerald-500/30 text-emerald-400 shadow-slate-950/60' : 'bg-white/90 border-emerald-300 text-emerald-700 shadow-slate-200'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className={`font-semibold ${isDarkTheme ? 'text-slate-200' : 'text-slate-800'}`}>DATASET CONNECTED • EUROPE (10,847 PORTFOLIO RECORDS)</span>
            <span className={isDarkTheme ? 'text-slate-600' : 'text-slate-300'}>|</span>
            <span className="text-sky-500 font-semibold">CHAMPION MODEL ONLINE (TEST ROC-AUC {championAuc})</span>
          </div>
        </div>

        {/* 4. BOTTOM SECTION: "WHAT WE OFFER" & 4 MODULE CARDS */}
        <div ref={featuresRef} className="mt-12 pt-4 w-full">
          <div className="flex flex-col lg:flex-row items-stretch gap-6">
            {/* Left Header Box */}
            <div className={`lg:w-1/4 flex flex-col justify-between p-6 rounded-2xl border transition-colors ${
              isDarkTheme ? 'bg-slate-950/60 border-slate-800/80' : 'bg-white border-slate-200 shadow-md'
            }`}>
              <div>
                <span className={`text-[10px] font-mono uppercase tracking-widest block mb-1 ${isDarkTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                  WHAT WE OFFER
                </span>
                <h2 className={`text-2xl font-black leading-tight ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                  Powerful Modules
                  <br />
                  <span className={`font-bold text-xl ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>for Smarter Banking</span>
                </h2>
                <div
                  className="w-16 h-1 rounded-full mt-4"
                  style={{ background: `linear-gradient(to right, ${currentPalette.primary}, ${currentPalette.secondary})` }}
                />
              </div>

              <div className="mt-6 flex items-center space-x-2">
                <button
                  onClick={onEnterDashboard}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors shadow-md cursor-pointer ${
                    isDarkTheme
                      ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                      : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900'
                  }`}
                  title="Enter Command Center"
                >
                  <ArrowRight className="w-4 h-4" style={{ color: currentPalette.primary }} />
                </button>
              </div>
            </div>

            {/* Right: 4 Module Cards */}
            <div className="lg:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Module 1: Customer Segmentation */}
              <div
                onClick={() => handleNavigate('galaxy3d')}
                className={`p-5 rounded-2xl backdrop-blur-xl border transition-all hover:scale-[1.01] cursor-pointer group shadow-xl flex flex-col justify-between ${
                  isDarkTheme
                    ? 'bg-slate-900/60 border-sky-500/20 text-white shadow-slate-950/40 hover:border-blue-400/50'
                    : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/70 hover:border-blue-500'
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className={`text-sm font-bold mb-1.5 transition-colors ${
                    isDarkTheme ? 'text-white group-hover:text-blue-300' : 'text-slate-900 group-hover:text-blue-600'
                  }`}>
                    Customer Segmentation
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>
                    Discover meaningful customer groups through advanced clustering and interactive 3D visualization.
                  </p>
                </div>

                <div className={`mt-6 pt-3 border-t ${isDarkTheme ? 'border-slate-800/80' : 'border-slate-100'}`}>
                  <span className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Learn More</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </div>

              {/* Module 2: Churn Prediction */}
              <div
                onClick={() => handleNavigate('model-lab')}
                className={`p-5 rounded-2xl backdrop-blur-xl border transition-all hover:scale-[1.01] cursor-pointer group shadow-xl flex flex-col justify-between ${
                  isDarkTheme
                    ? 'bg-slate-900/60 border-sky-500/20 text-white shadow-slate-950/40 hover:border-purple-400/50'
                    : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/70 hover:border-purple-500'
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <Brain className="w-5 h-5" />
                  </div>
                  <h3 className={`text-sm font-bold mb-1.5 transition-colors ${
                    isDarkTheme ? 'text-white group-hover:text-purple-300' : 'text-slate-900 group-hover:text-purple-600'
                  }`}>
                    Churn Prediction
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>
                    Compare machine-learning models, evaluate risk and identify important churn patterns.
                  </p>
                </div>

                <div className={`mt-6 pt-3 border-t ${isDarkTheme ? 'border-slate-800/80' : 'border-slate-100'}`}>
                  <span className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Learn More</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </div>

              {/* Module 3: Explainable AI */}
              <div
                onClick={() => handleNavigate('explainability')}
                className={`p-5 rounded-2xl backdrop-blur-xl border transition-all hover:scale-[1.01] cursor-pointer group shadow-xl flex flex-col justify-between ${
                  isDarkTheme
                    ? 'bg-slate-900/60 border-sky-500/20 text-white shadow-slate-950/40 hover:border-indigo-400/50'
                    : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/70 hover:border-indigo-500'
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <Search className="w-5 h-5" />
                  </div>
                  <h3 className={`text-sm font-bold mb-1.5 transition-colors ${
                    isDarkTheme ? 'text-white group-hover:text-indigo-300' : 'text-slate-900 group-hover:text-indigo-600'
                  }`}>
                    Explainable AI
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>
                    Understand the factors influencing predictions with transparent model explanations.
                  </p>
                </div>

                <div className={`mt-6 pt-3 border-t ${isDarkTheme ? 'border-slate-800/80' : 'border-slate-100'}`}>
                  <span className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Learn More</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </div>

              {/* Module 4: EARA Retention Lab */}
              <div
                onClick={() => handleNavigate('eara-lab')}
                className={`p-5 rounded-2xl backdrop-blur-xl border transition-all hover:scale-[1.01] cursor-pointer group shadow-xl flex flex-col justify-between ${
                  isDarkTheme
                    ? 'bg-slate-900/60 border-sky-500/20 text-white shadow-slate-950/40 hover:border-pink-400/50'
                    : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/70 hover:border-pink-500'
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-500 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className={`text-sm font-bold mb-1.5 transition-colors ${
                    isDarkTheme ? 'text-white group-hover:text-pink-300' : 'text-slate-900 group-hover:text-pink-600'
                  }`}>
                    EARA Retention Lab
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>
                    Prioritize customer reviews using risk estimates, evidence quality and configurable review budgets.
                  </p>
                </div>

                <div className={`mt-6 pt-3 border-t ${isDarkTheme ? 'border-slate-800/80' : 'border-slate-100'}`}>
                  <span className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Learn More</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. FOOTER & SCROLL PROMPT */}
        <div className={`mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between text-xs transition-colors ${
          isDarkTheme ? 'border-slate-900 text-slate-500' : 'border-slate-200 text-slate-600'
        }`}>
          {/* Cyber Aurora Waves at Bottom-Left matching reference photo */}
          <div className="flex items-center space-x-3.5">
            <div className="relative w-32 h-8 overflow-hidden shrink-0 opacity-90">
              <svg className="w-full h-full" viewBox="0 0 160 36" fill="none">
                <defs>
                  <linearGradient id="waveGrad1" x1="0" y1="0" x2="160" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#00f0ff" />
                    <stop offset="45%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#d946ef" />
                  </linearGradient>
                  <linearGradient id="waveGrad2" x1="0" y1="0" x2="160" y2="0" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="65%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <path d="M0 32 C 30 8, 60 36, 90 16 C 120 0, 140 28, 160 12" stroke="url(#waveGrad1)" strokeWidth="1.8" fill="none" opacity="0.9" />
                <path d="M0 25 C 25 36, 55 10, 85 24 C 115 38, 135 12, 160 22" stroke="url(#waveGrad2)" strokeWidth="1.4" fill="none" opacity="0.8" />
                <path d="M0 34 C 35 18, 70 32, 105 14 C 130 4, 150 18, 160 26" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 2" fill="none" opacity="0.65" />
              </svg>
            </div>
            <span className={`font-mono text-[11px] ${isDarkTheme ? 'text-slate-400' : 'text-slate-600'}`}>
              © 2026 BankSight AI • European Banking Retention Intelligence
            </span>
          </div>

          <div className={`my-3 sm:my-0 flex items-center space-x-2 text-[11px] font-mono ${
            isDarkTheme ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <span>🖱️</span>
            <span>Scroll to explore more</span>
          </div>

          <div className={`flex items-center space-x-3 text-[11px] font-medium ${
            isDarkTheme ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <span>Data</span>
            <span className={isDarkTheme ? 'text-slate-600' : 'text-slate-300'}>•</span>
            <span>Intelligence</span>
            <span className={isDarkTheme ? 'text-slate-600' : 'text-slate-300'}>•</span>
            <span>Retention</span>
          </div>
        </div>
      </main>

      {/* THESIS DOSSIER MODAL */}
      <ThesisDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        onEnterDashboard={() => {
          setIsDossierOpen(false);
          onEnterDashboard();
        }}
      />
    </div>
  );
};
