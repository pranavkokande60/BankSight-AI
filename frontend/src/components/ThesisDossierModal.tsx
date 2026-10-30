import React, { useState } from 'react';
import {
  X,
  Award,
  BookOpen,
  Cpu,
  Layers,
  ArrowRight,
  User,
  Mail,
  Github,
  ExternalLink,
  Globe,
  Code2,
  FileCheck2,
  Sparkles,
  Server
} from 'lucide-react';

interface ThesisDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterDashboard: () => void;
  initialTab?: 'architecture' | 'contact';
}

export const ThesisDossierModal: React.FC<ThesisDossierModalProps> = ({
  isOpen,
  onClose,
  onEnterDashboard,
  initialTab = 'architecture',
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'contact'>(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900/95 border border-sky-500/30 rounded-2xl shadow-2xl shadow-sky-950/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
              {activeTab === 'architecture' ? <Award className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sky-400">
                  ENTERPRISE BANKING AI PLATFORM
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                  PRODUCTION v1.0.0
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {activeTab === 'architecture' ? 'System Architecture & Intelligence Dossier' : 'Developer Profile & Contact Intel'}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Tab Switcher Buttons */}
            <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('architecture')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'architecture'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Architecture</span>
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'contact'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Developer & Contact</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300">
          {activeTab === 'architecture' ? (
            /* ================= ARCHITECTURE TAB ================= */
            <>
              {/* Author & Academic Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Principal Quantitative Engineer</span>
                  <p className="font-semibold text-white mt-0.5">Pranav Kokande</p>
                  <p className="text-slate-400 text-[11px]">Applied AI & FinTech Systems</p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Research Domain</span>
                  <p className="font-semibold text-white mt-0.5">Fintech XAI & Causal ML</p>
                  <p className="text-slate-400 text-[11px]">European Retail Banking Cohort</p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Supervisory Evaluation</span>
                  <p className="font-semibold text-emerald-400 mt-0.5">Model Score: 0.8612 ROC-AUC</p>
                  <p className="text-slate-400 text-[11px]">ECB / Basel III Compliant</p>
                </div>
              </div>

              {/* Thesis Abstract */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Executive Thesis Abstract</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 font-sans">
                  Traditional retail banking customer attrition management relies on reactive heuristics and opaque scorecards.
                  This engineering intelligence system presents <strong className="text-white">BankSight AI</strong>, an end-to-end explainable intelligence architecture built on 10,004 audited European banking records across France, Spain, and Germany. The platform integrates:
                  (1) Calibrated multi-model supervised ensembles (Gradient Boosting, XGBoost, CatBoost);
                  (2) Game-theoretic local feature attributions via TreeSHAP;
                  (3) A novel <strong className="text-sky-400">Evidence-Aware Retention Allocation (EARA)</strong> optimization framework balancing risk, capital exposure, and consensus disagreement;
                  (4) Two-Model Causal Uplift estimation; and
                  (5) Four-Fifths algorithmic fairness verification ensuring cross-territorial demographic parity.
                </p>
              </div>

              {/* Mathematical Formulations */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                  <Cpu className="w-4 h-4" />
                  <span>Core Mathematical Formulations</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* EARA Formulation */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-sky-500/20 space-y-2">
                    <span className="text-xs font-bold text-sky-400">1. EARA Optimization Objective</span>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                      max ∑ [ w_r · p̂_i + w_b · (B_i / B_max) - w_d · Δ_i ] · z_i
                      <br />
                      subject to: ∑ z_i ≤ B,  z_i ∈ &#123;0, 1&#125;
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Synthesizes churn hazard (p̂_i), normalized balance exposure (B_i/B_max), and cross-model uncertainty penalty (Δ_i) under strict review budget B.
                    </p>
                  </div>

                  {/* Uplift Formulation */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-sky-500/20 space-y-2">
                    <span className="text-xs font-bold text-indigo-400">2. Causal Individual Treatment Effect (ITE)</span>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-indigo-300 overflow-x-auto">
                      τ(x_i) = E[Y_i | X=x_i, T=1] - E[Y_i | X=x_i, T=0]
                      <br />
                      Persuadables: &#123;i | τ(x_i) &gt; τ_threshold&#125;
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Two-Model XGBoost identifies true persuadables while insulating "Sleeping Dogs" who churn upon unsolicited marketing contact.
                    </p>
                  </div>
                </div>
              </div>

              {/* System Pipeline Architecture */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                  <Layers className="w-4 h-4" />
                  <span>Multi-Tier Engineering Architecture</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-sky-300 border border-sky-500/30">1. Data Ingestion (10,004 Records)</span>
                    <span className="text-slate-600">→</span>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-cyan-300 border border-cyan-500/30">2. Feature Engineering (14 Covariates)</span>
                    <span className="text-slate-600">→</span>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-indigo-300 border border-indigo-500/30">3. Calibrated ML Ensemble (0.8612 AUC)</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-purple-300 border border-purple-500/30">4. SHAP Game-Theoretic XAI</span>
                    <span className="text-slate-600">→</span>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-300 border border-emerald-500/30">5. EARA & Uplift Allocator</span>
                    <span className="text-slate-600">→</span>
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-blue-300 border border-blue-500/30">6. Three.js WebGL & FastAPI</span>
                  </div>
                </div>
              </div>

              {/* Validation Metrics Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Champion ROC-AUC</span>
                  <span className="text-lg font-bold font-mono text-sky-400">0.8612</span>
                  <span className="text-[10px] text-slate-400 block">Gradient Boosting</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Brier Score</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">0.1042</span>
                  <span className="text-[10px] text-slate-400 block">Isotonic Calibration</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Capital Exposure</span>
                  <span className="text-lg font-bold font-mono text-amber-400">€765.4M</span>
                  <span className="text-[10px] text-slate-400 block">Portfolio Balance Monitored</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Fairness Ratio</span>
                  <span className="text-lg font-bold font-mono text-cyan-400">0.842</span>
                  <span className="text-[10px] text-slate-400 block">4/5ths Rule Pass</span>
                </div>
              </div>
            </>
          ) : (
            /* ================= CONTACT & DEVELOPER TAB ================= */
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-sky-950/40 border border-sky-500/30 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-600 p-1 shadow-xl shadow-sky-500/20">
                    <img
                      src="/pranav_avatar.jpg"
                      alt="Pranav Kokande"
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white">
                    ✓
                  </span>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">Pranav Kokande</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-mono font-medium">
                      Author & Quantitative Architect
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Lead Data Scientist & Applied AI Engineer • European Banking Portfolio Intelligence
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    Specialized in calibrated machine learning ensembles, explainable AI (SHAP), causal uplift modeling, and algorithmic risk mitigation for retail banking institutions.
                  </p>
                </div>
              </div>

              {/* Direct Contact Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Channel */}
                <a
                  href="mailto:pranavkokande60@gmail.com"
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-sky-500/40 transition-all flex items-center space-x-3.5 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Direct Email</span>
                    <span className="text-xs font-mono font-semibold text-white truncate block group-hover:text-sky-400 transition-colors">
                      pranavkokande60@gmail.com
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
                </a>

                {/* GitHub Repository */}
                <a
                  href="https://github.com/pranavkokande60/BankSight-AI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/40 transition-all flex items-center space-x-3.5 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <Github className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Source Repository</span>
                    <span className="text-xs font-mono font-semibold text-white truncate block group-hover:text-purple-400 transition-colors">
                      github.com/pranavkokande60/BankSight-AI
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                </a>

                {/* Live Cloud Deployment */}
                <a
                  href="https://banksight-ai-o4ou.onrender.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center space-x-3.5 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Production Cloud Instance</span>
                    <span className="text-xs font-mono font-semibold text-white truncate block group-hover:text-emerald-400 transition-colors">
                      banksight-ai-o4ou.onrender.com
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </a>

                {/* Academic Dossier / Paper */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Research Manuscript</span>
                    <span className="text-xs font-mono font-semibold text-white truncate block">
                      BankSight_AI_Research_Paper.docx
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-mono border border-amber-500/30">
                    IEEE Spec
                  </span>
                </div>
              </div>

              {/* Technical Stack Summary */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Enterprise Production Technology Stack
                </span>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-sky-300">FastAPI v0.110</span>
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300">React 19 + TypeScript</span>
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-indigo-300">Three.js WebGL 3D</span>
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-purple-300">GradientBoosting & XGBoost</span>
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-emerald-300">TreeSHAP Explainability</span>
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-pink-300">EARA Optimization</span>
                  <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-blue-300">Docker Containerized</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            BankSight AI Platform • Enterprise Intelligence
          </span>
          <button
            onClick={() => {
              onClose();
              onEnterDashboard();
            }}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
          >
            <span>Launch Live Decision Terminal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
