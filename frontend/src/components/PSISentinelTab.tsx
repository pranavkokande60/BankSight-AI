import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Gauge,
  Sliders,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { api } from '../api';

export const PSISentinelTab: React.FC = () => {
  const [driftReport, setDriftReport] = useState<any>(null);
  const [euriborShift, setEuriborShift] = useState<number>(0.0);
  const [depositShock, setDepositShock] = useState<number>(0.0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDrift = () => {
    setLoading(true);
    api.getPSIDrift(euriborShift, depositShock)
      .then(setDriftReport)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDrift();
  }, [euriborShift, depositShock]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'STABLE':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Stable Distribution (PSI &lt; 0.10)
          </span>
        );
      case 'MODERATE_DRIFT':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Moderate Shift (0.10 ≤ PSI &lt; 0.25)
          </span>
        );
      case 'CRITICAL_DRIFT':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Critical Drift (PSI ≥ 0.25)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-900/30 rounded-xl border border-blue-500/30 text-blue-400">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Continuous MLOps & PSI Sentinel
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950/60 text-blue-300 border border-blue-500/30">
                Drift Monitor
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Population Stability Index (PSI) monitoring feature distribution shifts across interest rate and credit cycles.
            </p>
          </div>
        </div>

        {/* Live Drift Status Badge */}
        {driftReport && getStatusBadge(driftReport.overall_status)}
      </div>

      {/* Simulated Macro Cycle Drift Sliders */}
      <div className="fintech-card p-5 space-y-4 bg-slate-900/80 border-slate-800">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          Simulate Production Macroeconomic Distribution Shift
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Euribor Interest Rate Shift:</span>
              <span className="text-blue-400 font-bold">{euriborShift > 0 ? '+' : ''}{euriborShift.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="-1.0"
              max="3.0"
              step="0.5"
              value={euriborShift}
              onChange={(e) => setEuriborShift(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Deposit Balance Drawdown Shift:</span>
              <span className="text-rose-400 font-bold">{depositShock.toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="-30"
              max="10"
              step="5"
              value={depositShock}
              onChange={(e) => setDepositShock(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Feature-Level PSI Cards */}
      {driftReport && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Monitored Feature Covariate Stability</h2>
            <span className="text-xs text-slate-400 font-mono">
              Max PSI: <strong className="text-white">{driftReport.maximum_psi}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(driftReport.feature_reports || {}).map(([fName, rep]: [string, any]) => {
              const isCritical = rep.status === 'CRITICAL_DRIFT';
              const isMod = rep.status === 'MODERATE_DRIFT';
              return (
                <div
                  key={fName}
                  className={`p-5 rounded-2xl border transition ${
                    isCritical
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : isMod
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white font-mono">{fName}</span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-300'
                          : isMod
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      PSI: {rep.psi}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">{rep.directive}</p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Buckets: {rep.bucket_details?.length || 10} quantiles</span>
                    <span className="text-slate-300 font-medium">{rep.badge}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* MLOps Governance Verdict Banner */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs text-slate-300 font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>{driftReport.mlops_governance_verdict}</span>
            </div>
            <span className="text-slate-500">Basel III Model Risk Management Standard</span>
          </div>
        </div>
      )}
    </div>
  );
};
