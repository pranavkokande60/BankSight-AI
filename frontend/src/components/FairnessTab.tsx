import React, { useState, useEffect } from 'react';
import { Scale, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../api';

export const FairnessTab: React.FC = () => {
  const [groupCol, setGroupCol] = useState<'Geography' | 'Gender'>('Geography');
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getFairnessAudit(groupCol)
      .then((res) => {
        setAudit(res);
        setError(null);
      })
      .catch((err) => {
        console.error('Fairness audit error:', err);
        setError(err?.detail || err?.message || 'Failed to calculate fairness audit metrics.');
      })
      .finally(() => setLoading(false));
  }, [groupCol]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100">Model Trust & Algorithmic Fairness Audit</h1>
          <p className="text-xs text-slate-400 mt-1">
            Subgroup fairness evaluation checking Demographic Parity and Equal Opportunity across European territories and gender.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Audited Group:</span>
          <select
            value={groupCol}
            onChange={(e) => setGroupCol(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
          >
            <option value="Geography">Geography (France, Germany, Spain)</option>
            <option value="Gender">Gender (Female, Male)</option>
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && !audit && (
        <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-sky-400/30 border-t-sky-400 animate-spin"></span>
          <span>Auditing demographic parity and equal opportunity metrics...</span>
        </div>
      )}

      {/* Fairness Metrics Table */}
      {audit && (
        <div className="fintech-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Subgroup Parity & Four-Fifths Compliance</h3>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
              audit.four_fifths_rule_compliant
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-amber-500/20 text-amber-300'
            }`}>
              {audit.four_fifths_rule_compliant ? '4/5ths Rule Compliant' : 'Disparity Flagged'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5">Subgroup</th>
                  <th className="py-2.5">Count</th>
                  <th className="py-2.5">Selection Rate</th>
                  <th className="py-2.5">True Positive Rate (TPR)</th>
                  <th className="py-2.5">False Positive Rate (FPR)</th>
                  <th className="py-2.5">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {Object.entries(audit.subgroup_metrics || {}).map(([grp, m]: [string, any]) => (
                  <tr key={grp} className="hover:bg-slate-800/30">
                    <td className="py-3 font-sans font-semibold text-slate-200">{grp}</td>
                    <td className="py-3 text-slate-400">{m.count?.toLocaleString()}</td>
                    <td className="py-3 text-sky-400 font-bold">{(m.selection_rate * 100).toFixed(1)}%</td>
                    <td className="py-3 text-emerald-400">{(m.tpr * 100).toFixed(1)}%</td>
                    <td className="py-3 text-amber-400">{(m.fpr * 100).toFixed(1)}%</td>
                    <td className="py-3 text-slate-300">{(m.accuracy * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono pt-2">
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block mb-1">Demographic Parity Difference:</span>
              <span className="text-base font-bold text-sky-400">{audit.demographic_parity_diff?.toFixed(4)}</span>
              <p className="text-[10px] text-slate-500 mt-1">Disparity between highest and lowest selection rate</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block mb-1">Equal Opportunity Difference:</span>
              <span className="text-base font-bold text-indigo-300">{audit.equal_opportunity_diff?.toFixed(4)}</span>
              <p className="text-[10px] text-slate-500 mt-1">Maximum difference in true positive rates across groups</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
