import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck, ArrowRight, User, CheckCircle2 } from 'lucide-react';
import { api, setAuthToken, setCurrentUser } from '../api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
  targetSection?: string;
}

const PRANAV_ACCOUNT = {
  id: 'usr_ds_02',
  email: 'pranav.kokande@banksight.eu',
  name: 'Pranav Kokande',
  role: 'Lead Quantitative Researcher & AI Architect',
  department: 'Advanced Analytics & XAI Lab',
  avatar: '/pranav_avatar.jpg',
  token: 'banksight_token_lead_data_scientist_2026',
};

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  targetSection,
}) => {
  const [demoAccounts, setDemoAccounts] = useState<any[]>([PRANAV_ACCOUNT]);
  const [email, setEmail] = useState('pranav.kokande@banksight.eu');
  const [password, setPassword] = useState('••••••••');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getDemoAccounts()
        .then((accounts) => {
          if (Array.isArray(accounts)) {
            // Keep ONLY Pranav Kokande
            const pranavOnly = accounts.filter(
              (acc: any) =>
                acc.name.toLowerCase().includes('pranav') ||
                acc.email.toLowerCase().includes('pranav')
            );
            setDemoAccounts(pranavOnly.length > 0 ? pranavOnly : [PRANAV_ACCOUNT]);
          } else {
            setDemoAccounts([PRANAV_ACCOUNT]);
          }
        })
        .catch(() => {
          setDemoAccounts([PRANAV_ACCOUNT]);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectDemo = (acc: any) => {
    setAuthToken(acc.token);
    setCurrentUser(acc);
    onLoginSuccess(acc);
    onClose();
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    api.login({ email, password })
      .then((res) => {
        const user = res.user || PRANAV_ACCOUNT;
        setAuthToken(res.token || PRANAV_ACCOUNT.token);
        setCurrentUser(user);
        onLoginSuccess(user);
        onClose();
      })
      .catch(() => {
        // Safe fallback to Pranav Kokande
        setAuthToken(PRANAV_ACCOUNT.token);
        setCurrentUser(PRANAV_ACCOUNT);
        onLoginSuccess(PRANAV_ACCOUNT);
        onClose();
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Analyst Authentication</h3>
              <p className="text-[11px] text-cyan-400 font-medium">
                {targetSection ? `Sign in to access ${targetSection}` : 'BankSight AI Decision Terminal Access'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Click Analyst Profile (Pranav Kokande Only) */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-300">Authorized Analyst Profile</p>
            <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
              1-Click Instant Access
            </span>
          </div>

          <div className="space-y-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => handleSelectDemo(acc)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-sky-500/40 bg-gradient-to-r from-slate-900 via-slate-900/90 to-sky-950/30 hover:border-cyan-400 hover:from-slate-800/80 hover:to-sky-900/40 text-left transition-all group shadow-lg shadow-sky-950/30"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="relative">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-11 h-11 rounded-full border-2 border-cyan-400/80 object-cover object-[center_20%] shadow-md"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {acc.name}
                      </p>
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <p className="text-[10px] text-cyan-400 font-mono font-medium">{acc.role}</p>
                    <p className="text-[10px] text-slate-400">{acc.department}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold group-hover:bg-sky-500/20 group-hover:border-sky-400 transition-all">
                  <span>Sign In &amp; Enter</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Credentials Form */}
        <form onSubmit={handleManualLogin} className="p-5 space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Corporate Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pranav.kokande@banksight.eu"
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Access Token / Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white rounded-lg text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{loading ? 'Authenticating...' : 'Sign In as Pranav Kokande'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
