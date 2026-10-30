import React from 'react';
import {
  X,
  FileText,
  Award,
  BookOpen,
  Cpu,
  Layers,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  Scale,
  GitBranch,
  ArrowRight
} from 'lucide-react';

interface ThesisDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterDashboard: () => void;
}

export const ThesisDossierModal: React.FC<ThesisDossierModalProps> = ({
  isOpen,
  onClose,
  onEnterDashboard,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900/95 border border-sky-500/30 rounded-2xl shadow-2xl shadow-sky-950/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-sky-400">
                  ENTERPRISE BANKING AI PLATFORM
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                  PRODUCTION RELEASE 2026
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                System Architecture & Intelligence Dossier
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300">
          {/* Author & Academic Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Principal Quantitative Engineer</span>
              <p className="font-semibold text-white mt-0.5">Advanced Analytics Team</p>
              <p className="text-slate-400 text-[11px]">European Retail Banking Cohort</p>
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
              This engineering intelligence system presents <strong className="text-white">BankSight AI</strong>, an end-to-end explainable intelligence architecture built on 10,000 audited European banking records across France, Spain, and Germany. The platform integrates:
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
                <span className="px-2.5 py-1 rounded bg-slate-800 text-sky-300 border border-sky-500/30">1. Data Ingestion & Sanitization (10,000 Records)</span>
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
              <span className="text-lg font-bold font-mono text-amber-400">€185.6M</span>
              <span className="text-[10px] text-slate-400 block">Identified & Monitored</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Fairness Ratio</span>
              <span className="text-lg font-bold font-mono text-cyan-400">0.842</span>
              <span className="text-[10px] text-slate-400 block">4/5ths Rule Pass</span>
            </div>
          </div>
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
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-500/25 transition-all"
          >
            <span>Launch Live Decision Terminal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
