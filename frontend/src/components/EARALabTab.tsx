import React, { useState, useEffect } from 'react';
import { Layers, Sliders, ShieldCheck, ArrowRight, TrendingUp, Users, AlertTriangle, CheckCircle2, UserCheck, ShieldAlert } from 'lucide-react';
import { api } from '../api';

export const EARALabTab: React.FC = () => {
  const [budget, setBudget] = useState<number>(500);
  const [wRisk, setWRisk] = useState<number>(0.60);
  const [wBalance, setWBalance] = useState<number>(0.35);
  const [wDisagreement, setWDisagreement] = useState<number>(0.15);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewFilter, setPreviewFilter] = useState<string>('ALL');

  const fetchAllocation = () => {
    setLoading(true);
    setError(null);
    api.allocateEARA({
      budget,
      weight_risk: wRisk,
      weight_balance: wBalance,
      weight_disagreement: wDisagreement,
      weight_segment: 0.10,
    })
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => {
        console.error('EARA allocation error:', err);
        setError(err?.detail || err?.message || 'Failed to calculate retention allocation.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAllocation();
  }, [budget]);

  const filteredPreview = data?.selected_preview
    ? data.selected_preview.filter((c: any) => {
        if (previewFilter === 'EXPERT') {
          return c.Routing_Queue?.includes('Disagreement') || c.Routing_Queue?.includes('Expert');
        }
        if (previewFilter === 'FRONTLINE') {
          return !c.Routing_Queue?.includes('Disagreement') && !c.Routing_Queue?.includes('Expert');
        }
        return true;
      })
    : [];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Evidence-Aware Retention Allocation (EARA) Lab</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic prioritization synthesis balancing churn risk, balance exposure, model consensus spread, and review budgets.
          </p>
        </div>
        <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Active Optimization Engine</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Control Sliders Card */}
      <div className="fintech-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>Configurable Review Budget & Weighting Parameters</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Normalization: α + (1-α) + λ spread penalty
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="flex justify-between font-semibold text-slate-400 mb-1">
              <span>Review Budget (B)</span>
              <span className="text-sky-400 font-mono font-bold">{budget} Accounts</span>
            </div>
            <input
              type="range"
              min="50"
              max="2000"
              step="50"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-400 mb-1">
              <span>Risk Weight (w_r)</span>
              <span className="text-indigo-400 font-mono font-bold">{wRisk.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={wRisk}
              onChange={(e) => setWRisk(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-400 mb-1">
              <span>Balance Weight (w_b)</span>
              <span className="text-emerald-400 font-mono font-bold">{wBalance.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={wBalance}
              onChange={(e) => setWBalance(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-400 mb-1">
              <span>Disagreement Weight (w_d)</span>
              <span className="text-amber-400 font-mono font-bold">{wDisagreement.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.5"
              step="0.05"
              value={wDisagreement}
              onChange={(e) => setWDisagreement(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={fetchAllocation}
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-900/20 transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                <span>Calculating Allocation...</span>
              </>
            ) : (
              <>
                <Sliders className="w-3.5 h-3.5" />
                <span>Re-Calculate Allocation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Allocation Outcomes Summary */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="fintech-card p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Selected Customers</span>
            <p className="text-2xl font-bold font-mono text-slate-100 mt-1">{data.selected_count} Accounts</p>
            <p className="text-[10px] text-slate-500 mt-1">Review Capacity Bound</p>
          </div>
          <div className="fintech-card p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Capital Protected</span>
            <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              €{(data.total_balance_protected / 1e6).toFixed(1)}M
            </p>
            <p className="text-[10px] text-emerald-400 mt-1">
              {(data.balance_exposure_coverage * 100).toFixed(1)}% of Total Deposit Base
            </p>
          </div>
          <div className="fintech-card p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Mean Selected Risk</span>
            <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
              {(data.mean_selected_risk * 100).toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Precision@B Churn Concentration</p>
          </div>
          <div className="fintech-card p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Disagreement Accounts</span>
            <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{data.high_disagreement_selected}</p>
            <p className="text-[10px] text-amber-400 mt-1">Spread Δ ≥ 0.25 Routed to Experts</p>
          </div>
        </div>
      )}

      {/* Baseline Comparison Table */}
      {data?.comparison_table && (
        <div className="fintech-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>EARA vs Naive Probability Baseline Comparison</span>
            </h3>
            <span className="text-xs text-slate-400">Head-to-head simulation across 3 retention strategies</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5">Allocation Policy</th>
                  <th className="py-2.5">Accounts Reviewed</th>
                  <th className="py-2.5">Balance Protected (€)</th>
                  <th className="py-2.5">Mean Churn Risk</th>
                  <th className="py-2.5">High-Disagreement Flagged</th>
                  <th className="py-2.5">Recall@B</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {data.comparison_table.map((row: any, i: number) => {
                  const isEara = row.Policy === 'EARA';
                  return (
                    <tr key={i} className={`hover:bg-slate-800/30 transition-colors ${isEara ? 'bg-cyan-950/20 font-bold' : ''}`}>
                      <td className="py-3 font-sans font-semibold text-slate-200 flex items-center gap-2">
                        {isEara && <span className="w-2 h-2 rounded-full bg-cyan-400"></span>}
                        <span>{row.Policy}</span>
                        {isEara && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                            Champion Policy
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-slate-300">{row.Selected_Count || row.Budget}</td>
                      <td className="py-3 text-emerald-400 font-bold">€{Number(row.Balance_Protected || 0).toLocaleString()}</td>
                      <td className="py-3 text-sky-400">{((row.Mean_Risk || 0) * 100).toFixed(1)}%</td>
                      <td className="py-3 text-amber-400">{row.High_Disagreement_Count}</td>
                      <td className="py-3 text-indigo-300">
                        {row.Capture_Rate ? `${(row.Capture_Rate * 100).toFixed(1)}%` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Prioritized Customers Queue Preview */}
      {data?.selected_preview && data.selected_preview.length > 0 && (
        <div className="fintech-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span>Prioritized Customer Queue Inspection (Top {filteredPreview.length} Accounts)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Customers dynamically ranked by EARA priority score for frontline and expert retention intervention.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setPreviewFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  previewFilter === 'ALL' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({data.selected_preview.length})
              </button>
              <button
                onClick={() => setPreviewFilter('EXPERT')}
                className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                  previewFilter === 'EXPERT' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-3 h-3" />
                Expert Queue
              </button>
              <button
                onClick={() => setPreviewFilter('FRONTLINE')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  previewFilter === 'FRONTLINE' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Frontline Queue
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5">Customer ID</th>
                  <th className="py-2.5">Surname</th>
                  <th className="py-2.5">Geography</th>
                  <th className="py-2.5">Balance</th>
                  <th className="py-2.5">Predicted Risk</th>
                  <th className="py-2.5">Spread (Δ)</th>
                  <th className="py-2.5">EARA Score</th>
                  <th className="py-2.5">Target Routing Queue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredPreview.slice(0, 15).map((c: any, idx: number) => {
                  const isExpert = c.Routing_Queue?.includes('Disagreement') || c.Routing_Queue?.includes('Expert');
                  return (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 font-bold text-slate-200">{c.CustomerId}</td>
                      <td className="py-2.5 font-sans text-slate-300">{c.Surname || '—'}</td>
                      <td className="py-2.5 font-sans text-slate-400">{c.Geography}</td>
                      <td className="py-2.5 text-emerald-400 font-bold">€{Number(c.Balance || 0).toLocaleString()}</td>
                      <td className="py-2.5 text-rose-400 font-bold">{((c.Predicted_Churn_Prob || 0) * 100).toFixed(1)}%</td>
                      <td className="py-2.5 text-amber-400 font-bold">{Number(c.Model_Spread || 0).toFixed(3)}</td>
                      <td className="py-2.5 text-cyan-300 font-bold">{Number(c.Score_EARA || 0).toFixed(4)}</td>
                      <td className="py-2.5 font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            isExpert
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                              : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                          }`}
                        >
                          {c.Routing_Queue || 'Standard Queue'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
