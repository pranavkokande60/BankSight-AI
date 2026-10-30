import React, { useState, useEffect } from 'react';
import {
  Clock,
  TrendingDown,
  ShieldAlert,
  Coins,
  Search,
  User,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  Sliders,
} from 'lucide-react';
import { api } from '../api';

export const SurvivalCLTVTab: React.FC = () => {
  const [cohortDimension, setCohortDimension] = useState<string>('Geography');
  const [kmData, setKmData] = useState<any>(null);
  const [coxData, setCoxData] = useState<any>(null);
  const [customerId, setCustomerId] = useState<number>(15634602);
  const [cltvData, setCltvData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cltvLoading, setCltvLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getSurvivalKaplanMeier(cohortDimension),
      api.getCoxHazards(),
    ])
      .then(([km, cox]) => {
        setKmData(km);
        setCoxData(cox);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [cohortDimension]);

  const loadCLTV = (cid: number) => {
    setCltvLoading(true);
    api.getCustomerCLTV(cid)
      .then(setCltvData)
      .catch(console.error)
      .finally(() => setCltvLoading(false));
  };

  useEffect(() => {
    loadCLTV(customerId);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-900/30 rounded-xl border border-emerald-500/30 text-emerald-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Survival Analysis & Dynamic CLTV Engine
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                Non-Parametric & Cox PH
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Tenure-horizon hazard estimation, Kaplan-Meier curves, and survival-discounted Customer Lifetime Value.
            </p>
          </div>
        </div>

        {/* Stratification Selector */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 px-2 font-medium">Stratify By:</span>
          {['Geography', 'NumOfProducts', 'IsActiveMember', 'Gender'].map((dim) => (
            <button
              key={dim}
              onClick={() => setCohortDimension(dim)}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                cohortDimension === dim
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {dim}
            </button>
          ))}
        </div>
      </div>

      {/* Kaplan-Meier Survival Curve Matrix */}
      {kmData && (
        <div className="fintech-card p-6 space-y-5 bg-slate-900/80 border-emerald-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Kaplan-Meier Survival Curves S(t)
                <span className="text-xs font-normal text-slate-400">
                  Tenure Horizons (0 to 10 Years)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Product-limit cumulative probability of retaining an account across consecutive banking years.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Overall 5-Year Survival:{' '}
              <strong className="text-white">
                {((kmData.overall_survival?.survival_probability[5] || 0.79) * 100).toFixed(1)}%
              </strong>
            </div>
          </div>

          {/* Cohort Curve Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(kmData.cohort_survival || {}).map(([cName, cData]: [string, any]) => {
              const surv5 = cData.survival_probability[5] || 0.75;
              const surv10 = cData.survival_probability[cData.survival_probability.length - 1] || 0.65;
              return (
                <div key={cName} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{cohortDimension}: {cName}</span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        surv5 > 0.80 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {(surv5 * 100).toFixed(1)}% at Yr 5
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>1-Year Survival S(1):</span>
                      <span className="text-slate-200">{((cData.survival_probability[1] || 0.95) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>5-Year Survival S(5):</span>
                      <span className="text-slate-200">{(surv5 * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>10-Year Cumulative S(10):</span>
                      <span className="text-slate-200">{(surv10 * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Visual Sparkline representation */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full ${surv5 > 0.80 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${surv5 * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cox Proportional Hazards Engine */}
      {coxData && (
        <div className="fintech-card p-6 space-y-4 bg-slate-900/80 border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            Cox Proportional Hazards Model h(t|x) = h0(t) * exp(β^T * x)
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              L2 Ridge Penalized
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(coxData.hazard_ratios || {}).map(([covariate, hr]: [string, any]) => (
              <div key={covariate} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 font-mono">{covariate}</span>
                  <span
                    className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                      hr > 1.25 ? 'bg-rose-500/20 text-rose-300' : hr < 0.85 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Hazard Ratio: {hr}x
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {hr > 1.0
                    ? `Elevates instantaneous churn hazard by +${((hr - 1) * 100).toFixed(0)}%.`
                    : `Protective covariate; diminishes instantaneous churn hazard by -${((1 - hr) * 100).toFixed(0)}%.`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Customer Lifetime Value (CLTV) Individual Explorer */}
      <div className="fintech-card p-6 space-y-5 bg-gradient-to-br from-slate-900/90 to-emerald-950/30 border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Dynamic Customer Lifetime Value (CLTV) Calculator
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Discounted Cashflow Integral
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Integrates customer survival curve S(t|x) until S(t) &gt; 10% to compute net lifetime capital value.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customerId}
              onChange={(e) => setCustomerId(Number(e.target.value))}
              placeholder="Customer ID..."
              className="w-40 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => loadCLTV(customerId)}
              disabled={cltvLoading}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              Compute CLTV
            </button>
          </div>
        </div>

        {cltvData && cltvData.cltv_metrics && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Dynamic CLTV Valuation</span>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  €{cltvData.cltv_metrics.dynamic_cltv_eur?.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-300 mt-1 font-mono">
                  {cltvData.cltv_metrics.value_tier}
                </div>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Expected Retention Horizon</span>
                <div className="text-2xl font-bold font-mono text-white">
                  {cltvData.cltv_metrics.expected_retention_years} Years
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Cutoff: S(t) &gt; 10%
                </div>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Net Monthly Margin</span>
                <div className="text-2xl font-bold font-mono text-sky-400">
                  €{cltvData.cltv_metrics.monthly_margin_eur?.toFixed(2)}/mo
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  NIM 2.5% + Product Fees
                </div>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Current Balance Exposure</span>
                <div className="text-2xl font-bold font-mono text-white">
                  €{cltvData.balance_eur?.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  {cltvData.geography} • {cltvData.num_products} Products
                </div>
              </div>
            </div>

            {/* Yearly Cashflow Projection Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Discounted Lifetime Value Cashflow Schedule (6% WACC)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-left">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Horizon Year</th>
                      <th className="py-2.5 px-3">Survival Prob S(t)</th>
                      <th className="py-2.5 px-3">Expected Cashflow</th>
                      <th className="py-2.5 px-3">Discounted Value</th>
                      <th className="py-2.5 px-3">Cumulative CLTV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {cltvData.cltv_metrics.yearly_projections?.map((proj: any) => (
                      <tr key={proj.year} className="hover:bg-slate-950/40">
                        <td className="py-2 px-3 font-bold text-white">Year {proj.year}</td>
                        <td className="py-2 px-3 text-emerald-400">{(proj.survival_probability * 100).toFixed(1)}%</td>
                        <td className="py-2 px-3 text-slate-300">€{proj.expected_margin_eur?.toFixed(2)}</td>
                        <td className="py-2 px-3 text-sky-400">€{proj.discounted_value_eur?.toFixed(2)}</td>
                        <td className="py-2 px-3 font-bold text-white">€{proj.cumulative_cltv_eur?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
