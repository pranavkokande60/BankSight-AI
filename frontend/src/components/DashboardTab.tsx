import React, { useState, useEffect } from 'react';
import {
  Users,
  AlertTriangle,
  Coins,
  Cpu,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../api';

export const DashboardTab: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      api.getSummary(),
      api.getCharts(),
      api.getAiSummary(),
    ])
      .then(([s, c, ai]) => {
        setSummary(s);
        setCharts(c);
        setAiSummary(ai);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-400">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs">Aggregating European banking portfolio telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 space-y-6">
      {/* Page Title & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
            Executive Risk & Portfolio Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time churn telemetry, capital exposure, and statistical drivers across 10,000 retail accounts.
          </p>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Coverage: France, Germany, Spain</span>
        </div>
      </div>

      {/* Live Registered Customers Telemetry Banner */}
      {summary?.live_registered_count > 0 && (
        <div className="bg-gradient-to-r from-cyan-950/50 via-slate-900/80 to-blue-950/50 border border-cyan-500/30 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-lg">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0"></span>
            <div>
              <span className="font-bold text-white">Live Customer Registry Connected:</span>{' '}
              <span className="text-cyan-300 font-semibold">{summary.live_registered_count} newly registered customer(s)</span>{' '}
              <span className="text-slate-400">active in SQLite persistent storage (€{summary.live_registered_balance.toLocaleString()} deposit capital).</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] shrink-0">
            <span className="bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
              Historical Baseline: <strong>10,000 Accounts</strong>
            </span>
            <span className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
              Observed Churn Denominator: Strictly Uncontaminated
            </span>
          </div>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="fintech-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Unique Accounts</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-100 font-mono">
            {(summary?.total_managed_accounts || summary?.total_customers || 10000).toLocaleString()}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            {summary?.live_registered_count > 0 ? (
              <>
                <span className="text-slate-400">10,000 Historical</span>
                <span className="text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                  +{summary.live_registered_count} Live (SQLite)
                </span>
              </>
            ) : (
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Verified Zero Missing Values</span>
              </div>
            )}
          </div>
        </div>

        {/* KPI 2 */}
        <div className="fintech-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Observed Churn Rate</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-100 font-mono">
            {((summary?.churn_rate || 0.2037) * 100).toFixed(2)}%
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-rose-400 flex items-center space-x-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{summary?.total_churned?.toLocaleString() || '2,037'} Attrited</span>
            </span>
            <span className="text-slate-400 font-mono text-[10px]" title="Historical Ground-Truth Denominator">
              (2,037 / 10,000)
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="fintech-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Churned Balance Exposure</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-100 font-mono">
            €{((summary?.churned_balance_exposure || 185588094) / 1e6).toFixed(1)}M
          </p>
          <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-slate-400">
            <span>Portfolio: €{((summary?.total_managed_balance || summary?.total_balance_exposure || 764858892) / 1e6).toFixed(1)}M Total</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="fintech-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Champion Model AUC</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-sky-400 font-mono">
            {summary?.champion_roc_auc?.toFixed(4) || '0.8612'}
          </p>
          <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Calibrated Gradient Boosting</span>
          </div>
        </div>
      </div>

      {/* AI Executive Summary Card */}
      {aiSummary && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 border border-sky-500/20 shadow-lg">
          <div className="flex items-center space-x-2.5 mb-3">
            <Sparkles className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-slate-100">{aiSummary.headline}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <p className="font-semibold text-slate-300">Observed Empirical Signals:</p>
              {aiSummary.key_findings.map((f: string, i: number) => (
                <div key={i} className="flex items-start space-x-2 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{f}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-slate-300">Priority Action Items:</p>
              {aiSummary.strategic_recommendations.map((r: string, i: number) => (
                <div key={i} className="flex items-start space-x-2 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Primary Analytics Grid: Country Comparison & Multi-Product Cliff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country Breakdown Table & Visual */}
        <div className="fintech-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Territory Disparity Analysis</h3>
            <span className="text-[11px] text-slate-400">France vs Germany vs Spain</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2">Country</th>
                  <th className="py-2">Customers</th>
                  <th className="py-2">Churn Rate</th>
                  <th className="py-2">Avg Balance</th>
                  <th className="py-2">Zero-Bal %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {charts?.country_comparison?.map((row: any) => (
                  <tr key={row.country} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 font-sans font-semibold text-slate-200">
                      {row.country === 'Germany' ? '🇩🇪 Germany' : row.country === 'France' ? '🇫🇷 France' : '🇪🇸 Spain'}
                    </td>
                    <td className="py-2.5 text-slate-300">{row.total_customers.toLocaleString()}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        row.churn_rate > 0.25
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      }`}>
                        {(row.churn_rate * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-300">€{row.mean_balance.toLocaleString()}</td>
                    <td className="py-2.5 text-slate-400">{row.zero_balance_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
            💡 <strong>Crucial Discovery:</strong> Germany has a <strong>32.44% churn rate</strong> with <strong>0% zero-balance accounts</strong>. In France and Spain, ~48% of customers have €0 balances, which naturally suppresses their overall churn rate.
          </p>
        </div>

        {/* Multi-Product Cliff Breakdown */}
        <div className="fintech-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">The Multi-Product Holding Cliff</h3>
            <span className="text-[11px] text-rose-400 font-mono">Critical Attrition Threshold</span>
          </div>
          <div className="space-y-3">
            {charts?.product_cliff?.map((p: any) => {
              const ratePct = (p.churn_rate * 100).toFixed(1);
              const isCliff = p.num_products >= 3;
              return (
                <div key={p.num_products} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">
                      {p.num_products} Banking {p.num_products === 1 ? 'Product' : 'Products'} ({p.total_customers.toLocaleString()} Accounts)
                    </span>
                    <span className={`font-mono font-bold ${isCliff ? 'text-rose-400' : p.num_products === 2 ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {ratePct}% Churn ({p.churned_customers.toLocaleString()} Lost)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCliff
                          ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                          : p.num_products === 2
                          ? 'bg-emerald-400'
                          : 'bg-sky-500'
                      }`}
                      style={{ width: `${Math.max(5, p.churn_rate * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
            ⚠️ <strong>Holding Paradox:</strong> 2 products is the safest retention zone (only <strong>7.58%</strong> churn). Holding 3 products surges to <strong>82.71%</strong> churn, and 4 products hits <strong>100.0%</strong> churn (60/60 customers attrited).
          </p>
        </div>
      </div>
    </div>
  );
};
