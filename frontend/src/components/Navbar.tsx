import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  Command,
  ShieldCheck,
  LogOut,
  User,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { api } from '../api';
import { useTheme } from '../themeContext';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenNotifications: () => void;
  onOpenCommandPalette: () => void;
  onLogout: () => void;
  onNavigateLanding?: () => void;
  currentUser: any;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLogin,
  onOpenNotifications,
  onOpenCommandPalette,
  onLogout,
  onNavigateLanding,
  currentUser,
  unreadCount = 4,
}) => {
  const { currentPalette } = useTheme();
  const [totalAccounts, setTotalAccounts] = useState<number>(10000);

  const fetchLiveCounts = () => {
    api.getCustomerSummary()
      .then((res) => {
        if (res.status === 'success') {
          setTotalAccounts(10000 + (res.total || 0));
        }
      })
      .catch(() => {
        api.getSummary()
          .then((s) => {
            if (s?.total_managed_accounts) {
              setTotalAccounts(s.total_managed_accounts);
            }
          })
          .catch(console.error);
      });
  };

  useEffect(() => {
    fetchLiveCounts();
    window.addEventListener('customer-registered', fetchLiveCounts);
    window.addEventListener('focus', fetchLiveCounts);
    return () => {
      window.removeEventListener('customer-registered', fetchLiveCounts);
      window.removeEventListener('focus', fetchLiveCounts);
    };
  }, []);
  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-6 flex items-center justify-between z-30 select-none">
      {/* Brand & Terminal Badge */}
      <div className="flex items-center space-x-4">
        <div
          onClick={onNavigateLanding}
          className="flex items-center space-x-3 cursor-pointer group"
          title="Return to 3D Showcase Landing Page"
        >
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${currentPalette.brandGradient} flex items-center justify-center shadow-lg shadow-sky-500/20 border border-white/20 group-hover:scale-105 transition-transform`}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-400 bg-clip-text text-transparent">
                BankSight AI
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full tracking-wide">
                EUROPEAN BANKING
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Explainable Customer Segmentation & Churn Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Global Command Palette Trigger (`Ctrl + K`) */}
      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-all text-sm group"
        >
          <div className="flex items-center space-x-2.5">
            <Search className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
            <span className="text-xs">Quick jump or search customer / model...</span>
          </div>
          <kbd className="flex items-center space-x-1 px-2 py-0.5 text-[10px] bg-slate-800 border border-slate-700 text-slate-300 rounded font-mono">
            <Command className="w-3 h-3 mr-0.5" /> K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Notifications, Data Status & Profile */}
      <div className="flex items-center space-x-3">
        {/* Live Portfolio Health Indicator */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-slate-950/50 border border-slate-800/80 rounded-lg text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-medium">{totalAccounts.toLocaleString()} Accounts</span>
          <span className="text-slate-600">•</span>
          <span className="text-sky-400 font-mono">Champion: GB (0.8612)</span>
        </div>


        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg bg-slate-800/50 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          title="Audit Alerts & Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-slate-900 rounded-full"></span>
          )}
        </button>

        {/* User Account / Profile */}
        {currentUser ? (
          <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
            <img
              src={currentUser.avatar || '/pranav_avatar.jpg'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full border border-sky-400/40 object-cover object-[center_20%]"
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-200">{currentUser.name}</p>
              <p className="text-[10px] text-sky-400 font-mono">{currentUser.role}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="flex items-center space-x-2 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-sky-600/20 transition-all"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
