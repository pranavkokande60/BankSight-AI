import React, { useState, useEffect } from 'react';
import {
  GitFork,
  Target,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Percent,
  Euro,
  Users,
} from 'lucide-react';
import { api } from '../api';

export const UpliftModelingTab: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>('Persuadables');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [accountsLoading, setAccountsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getUpliftSummary()
      .then((res) => {
        setSummary(res);
        setError(null);
      })
      .catch((err) => {
        console.error('Uplift summary error:', err);
        setError(err?.detail || err?.message || 'Failed to load uplift summary.');
      })
      .finally(() => setLoading(false));
  }, []);

  const loadAccounts = (quad: string) => {
    setAccountsLoading(true);
    api.getUpliftAccounts(quad, 25)
      .then((res) => setAccounts(res.accounts || []))
      .catch((err) => {
        console.error('Uplift accounts error:', err);
      })
      .finally(() => setAccountsLoading(false));
  };

  useEffect(() => {
    loadAccounts(selectedQuadrant);
  }, [selectedQuadrant]);

  const getQuadrantStyle = (quad: string) => {
    switch (quad) {
      case 'Persuadables':
        return {
          bg: 'bg-emerald-950/40',
          border: 'border-emerald-500/40',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300',
          desc: 'High Positive Uplift: Responds strongly to retention outreach.',
        };
      case 'Sure Things':
        return {
          bg: 'bg-blue-950/40',
          border: 'border-blue-500/40',
          text: 'text-blue-400',
          badge: 'bg-blue-500/20 text-blue-300',
          desc: 'Organic Loyalty: Stays regardless of intervention. Zero spend.',
        };
      case 'Lost Causes':
        return {
          bg: 'bg-slate-900/60',
          border: 'border-slate-800',
          text: 'text-slate-400',
          badge: 'bg-slate-800 text-slate-300',
          desc: 'High Attrition Regardless: Incentives fail to alter outcome.',
        };
      case 'Sleeping Dogs':
        return {
          bg: 'bg-rose-950/40',
          border: 'border-rose-500/40',
          text: 'text-rose-400',
          badge: 'bg-rose-500/20 text-rose-300',
          desc: 'Negative Uplift: Outreach reminds them of fees & triggers exit!',
        };
      default:
        return {
          bg: 'bg-slate-900',
          border: 'border-slate-800',
          text: 'text-white',
          badge: 'bg-slate-800',
          desc: '',
        };
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-900/30 rounded-xl border border-indigo-500/30 text-indigo-400">
            <GitFork className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Causal Inference & Uplift Modeling Matrix
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                Two-Model XGBoost
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Individual Treatment Effect τ(x) = E[Y|x, T=1] - E[Y|x, T=0] categorizing accounts into 4 actionable quadrants.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <span>Max Marketing ROI:</span>
          <strong className="text-emerald-400 font-bold">Target Persuadables Only</strong>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !summary && (
        <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-indigo-400/30 border-t-indigo-400 animate-spin"></span>
          <span>Computing two-model causal uplift inference across retail accounts...</span>
        </div>
      )}

      {/* 4-Quadrant Visual Grid */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(summary.quadrant_breakdown || {}).map(([qName, qInfo]: [string, any]) => {
            const style = getQuadrantStyle(qName);
            const isSelected = selectedQuadrant === qName;
            return (
              <button
                key={qName}
                onClick={() => setSelectedQuadrant(qName)}
                className={`p-5 rounded-2xl border text-left transition relative overflow-hidden ${
                  isSelected
                    ? `${style.bg} ${style.border} ring-1 ring-indigo-500 shadow-xl`
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className={`text-base font-bold ${style.text}`}>{qName}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                    {qInfo.percentage}%
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Account Volume:</span>
                    <span className="text-white font-bold">{qInfo.count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Deposit Base:</span>
                    <span className="text-white">€{(qInfo.total_balance_eur / 1e6).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Mean Uplift (τ):</span>
                    <span className={qInfo.mean_uplift > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {(qInfo.mean_uplift * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800/80 leading-relaxed">
                  {style.desc}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Drill-down Accounts Table */}
      <div className="fintech-card p-6 space-y-4 bg-slate-900/80 border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Cohort Inspection: {selectedQuadrant}
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getQuadrantStyle(selectedQuadrant).badge}`}>
                Active Filter
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Individual account treatment effects, stay probabilities under treatment vs control, and CRM routing directive.
            </p>
          </div>
        </div>

        {accountsLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading causal accounts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Jurisdiction</th>
                  <th className="py-2.5 px-3">Balance</th>
                  <th className="py-2.5 px-3">Uplift (τ)</th>
                  <th className="py-2.5 px-3">P(Stay | Treated)</th>
                  <th className="py-2.5 px-3">P(Stay | Control)</th>
                  <th className="py-2.5 px-3">Operational Directive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {accounts.map((acc: any) => (
                  <tr key={acc.CustomerId} className="hover:bg-slate-950/40">
                    <td className="py-2 px-3 font-bold text-white">
                      {acc.Surname} <span className="text-[11px] text-slate-500">#{acc.CustomerId % 10000}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-300">{acc.Geography}</td>
                    <td className="py-2 px-3 text-white">€{acc.Balance?.toLocaleString()}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`font-bold ${
                          acc.Uplift_Score > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {acc.Uplift_Score > 0 ? '+' : ''}{(acc.Uplift_Score * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2 px-3 text-sky-400 font-bold">{(acc.P_Stay_Treated * 100).toFixed(1)}%</td>
                    <td className="py-2 px-3 text-slate-400">{(acc.P_Stay_Control * 100).toFixed(1)}%</td>
                    <td className="py-2 px-3 text-[11px] text-slate-300 max-w-xs truncate" title={acc.Retention_Directive}>
                      {acc.Retention_Directive}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
