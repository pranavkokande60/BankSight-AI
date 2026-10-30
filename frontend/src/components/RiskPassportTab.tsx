import React, { useState, useEffect } from 'react';
import {
  Search,
  User,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  ArrowDownRight,
  TrendingDown,
  Wand2,
} from 'lucide-react';
import { api } from '../api';

export const RiskPassportTab: React.FC = () => {
  const [customerId, setCustomerId] = useState<number>(15634602);
  const [profile, setProfile] = useState<any>(null);
  const [scoreResult, setScoreResult] = useState<any>(null);
  const [recourseResult, setRecourseResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [recourseLoading, setRecourseLoading] = useState<boolean>(false);
  const [quickLiveAccounts, setQuickLiveAccounts] = useState<any[]>([]);

  useEffect(() => {
    api.listCustomers({ limit: 4 })
      .then((res) => {
        if (res.customers && res.customers.length > 0) {
          setQuickLiveAccounts(res.customers);
        }
      })
      .catch(console.error);
  }, []);

  const loadCustomer = (id: number) => {
    setLoading(true);
    setRecourseResult(null);
    api.getCustomerProfile(id)
      .then((res) => {
        setProfile(res.customer);
        return api.scoreCustomer({ CustomerId: id });
      })
      .then(setScoreResult)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleComputeRecourse = () => {
    if (!profile) return;
    setRecourseLoading(true);
    api.getCounterfactualRecourse(profile)
      .then((res) => setRecourseResult(res))
      .catch(console.error)
      .finally(() => setRecourseLoading(false));
  };

  useEffect(() => {
    loadCustomer(customerId);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100">Customer Risk Passport</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time customer risk assessment with multi-model consensus, model spread (Δ), and human-in-the-loop action triggers.
          </p>
        </div>

        {/* Quick Customer Lookup */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={customerId}
              onChange={(e) => setCustomerId(Number(e.target.value))}
              placeholder="Enter Customer ID..."
              className="w-48 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={() => loadCustomer(customerId)}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              Lookup
            </button>
          </div>
          {quickLiveAccounts.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="text-cyan-400 font-semibold">Live SQLite:</span>
              {quickLiveAccounts.map((c) => (
                <button
                  key={c.customer_id}
                  onClick={() => {
                    setCustomerId(c.customer_id);
                    loadCustomer(c.customer_id);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                    customerId === c.customer_id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  #{c.customer_id}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Passport Card */}
      {profile && scoreResult && (
        <div className="fintech-card p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-slate-100">
                    {profile.Surname}
                  </h2>
                  <span className="text-xs font-mono text-slate-400">#{profile.CustomerId}</span>
                  {profile.Exited === null || profile.Exited === undefined ? (
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-semibold">
                      Live Customer (Exited: NULL)
                    </span>
                  ) : profile.Exited === 1 ? (
                    <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-semibold">
                      Historical Churned
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                      Historical Retained
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {profile.Geography} • {profile.Gender} • {profile.Age} years old • Tenure: {profile.Tenure} yrs
                </p>
              </div>
            </div>

            {/* Risk Tier Badge */}
            <div className="text-right">
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border ${
                scoreResult.risk_category === 'Critical' || scoreResult.risk_category === 'High'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : scoreResult.risk_category === 'Medium'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {scoreResult.risk_category.toUpperCase()} RISK
              </span>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                Calibrated Prob: {(scoreResult.predicted_prob * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Account Holdings & Balance */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 font-mono text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Account Balance</span>
              <span className="text-base font-bold text-slate-100">€{profile.Balance?.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Num of Products</span>
              <span className={`text-base font-bold ${profile.NumOfProducts >= 3 ? 'text-rose-400' : 'text-slate-100'}`}>
                {profile.NumOfProducts} {profile.NumOfProducts >= 3 ? '(Cliff Risk)' : ''}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Estimated Salary</span>
              <span className="text-base font-bold text-slate-100">€{profile.EstimatedSalary?.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Active Member</span>
              <span className={`text-base font-bold ${profile.IsActiveMember === 1 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {profile.IsActiveMember === 1 ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Multi-Model Consensus Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Multi-Model Consensus & Disagreement Spread (Δ)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-1">Gradient Boosting (Champion):</span>
                <span className="text-sm font-bold text-sky-400">
                  {((scoreResult.individual_probs?.gradient_boosting || scoreResult.predicted_prob) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-1">Random Forest:</span>
                <span className="text-sm font-bold text-indigo-300">
                  {((scoreResult.individual_probs?.random_forest || scoreResult.predicted_prob) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-1">Logistic Regression:</span>
                <span className="text-sm font-bold text-slate-300">
                  {((scoreResult.individual_probs?.logistic_regression || scoreResult.predicted_prob) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Model Spread Flag */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Model Spread (Δ = max P - min P):</span>
                <span className="font-mono font-bold text-sky-400">{scoreResult.model_spread?.toFixed(4)}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                scoreResult.is_high_disagreement
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {scoreResult.is_high_disagreement ? 'HIGH DISAGREEMENT (Δ ≥ 0.25)' : 'MODELS AGREE'}
              </span>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-500/30 text-xs text-sky-200">
            <span className="font-bold text-sky-400 block mb-1">Analyst Decision Directive:</span>
            {typeof scoreResult.recommended_action === 'object' && scoreResult.recommended_action !== null
              ? (scoreResult.recommended_action.recommended_action || JSON.stringify(scoreResult.recommended_action))
              : String(scoreResult.recommended_action || 'Review account portfolio and assign proactive retention offer.')}
          </div>

          {/* Counterfactual Actionable Recourse Engine (XAI 2.0) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-indigo-950/30 border border-indigo-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Counterfactual Actionable Recourse Engine
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      XAI 2.0 Prescriptive
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calculates minimum plausible behavioral adjustments to safely reverse customer churn risk.
                  </p>
                </div>
              </div>

              <button
                onClick={handleComputeRecourse}
                disabled={recourseLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {recourseLoading ? (
                  <>Computing Recourse...</>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Compute Optimal Recourse
                  </>
                )}
              </button>
            </div>

            {recourseResult && (
              <div className="pt-4 border-t border-slate-800/80 space-y-4">
                {/* Risk Transition Pill */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Initial Churn Risk</span>
                    <span className="text-lg font-bold font-mono text-rose-400">
                      {(recourseResult.original_prob * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Target Safety Threshold</span>
                    <span className="text-lg font-bold font-mono text-slate-300">
                      ≤ {(recourseResult.target_threshold * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/30">
                    <span className="text-[11px] text-emerald-400 block mb-0.5">Counterfactual Recourse Risk</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold font-mono text-emerald-400">
                        {(recourseResult.achieved_prob * 100).toFixed(1)}%
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3" />
                        -{( (recourseResult.original_prob - recourseResult.achieved_prob) * 100 ).toFixed(1)} pts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Prescribed Actions */}
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                    Prescribed Operational Interventions
                  </span>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {recourseResult.actions?.map((act: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                  {recourseResult.recommendation_summary && (
                    <p className="text-xs text-indigo-300/90 pt-2 border-t border-slate-800/80 italic">
                      Strategy: {recourseResult.recommendation_summary}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
