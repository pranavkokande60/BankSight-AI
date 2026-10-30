import React, { useState } from 'react';
import { Sliders, Sparkles, RefreshCw, Cpu, ShieldAlert, ArrowRight } from 'lucide-react';
import { api } from '../api';

export const PredictionPlaygroundTab: React.FC = () => {
  const [form, setForm] = useState({
    Age: 45,
    Balance: 110000,
    NumOfProducts: 2,
    Geography: 'Germany',
    Gender: 'Female',
    CreditScore: 680,
    Tenure: 4,
    IsActiveMember: 0,
    HasCrCard: 1,
    EstimatedSalary: 95000,
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = () => {
    setLoading(true);
    api.scoreCustomer(form)
      .then(setResult)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-100">Prediction Playground & Risk Sandbox</h1>
        <p className="text-xs text-slate-400 mt-1">
          Adjust customer attributes dynamically to evaluate multi-model consensus response and decision directives in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Parameters Form */}
        <div className="lg:col-span-2 fintech-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>Customer Attributes Sandbox</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Country */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Country</label>
              <select
                value={form.Geography}
                onChange={(e) => setForm({ ...form, Geography: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="France">France</option>
                <option value="Germany">Germany (High Attrition Territory)</option>
                <option value="Spain">Spain</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Gender</label>
              <select
                value={form.Gender}
                onChange={(e) => setForm({ ...form, Gender: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>

            {/* Age Slider */}
            <div>
              <div className="flex justify-between text-slate-400 font-semibold mb-1">
                <span>Age</span>
                <span className="text-sky-400 font-mono">{form.Age} yrs</span>
              </div>
              <input
                type="range"
                min="18"
                max="90"
                value={form.Age}
                onChange={(e) => setForm({ ...form, Age: Number(e.target.value) })}
                className="w-full accent-sky-500"
              />
            </div>

            {/* Products */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Number of Products</label>
              <select
                value={form.NumOfProducts}
                onChange={(e) => setForm({ ...form, NumOfProducts: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value={1}>1 Product (27.7% Churn)</option>
                <option value={2}>2 Products (7.6% Optimal Retention)</option>
                <option value={3}>3 Products (82.7% Churn Cliff)</option>
                <option value={4}>4 Products (100% Churn Cliff)</option>
              </select>
            </div>

            {/* Balance */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Account Balance (€)</label>
              <input
                type="number"
                value={form.Balance}
                onChange={(e) => setForm({ ...form, Balance: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Active Member */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Membership Activity</label>
              <select
                value={form.IsActiveMember}
                onChange={(e) => setForm({ ...form, IsActiveMember: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value={1}>Active Member (Protective)</option>
                <option value={0}>Inactive Member (High Risk)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-sky-600/20 transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Evaluating Model Consensus...' : 'Simulate Risk Scoring'}</span>
          </button>
        </div>

        {/* Results Panel */}
        <div className="fintech-card p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 mb-3">Model Consensus Output</h3>
            {result ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400">Calibrated Churn Probability</span>
                  <p className="text-3xl font-extrabold font-mono text-sky-400 mt-1">
                    {(result.predicted_prob * 100).toFixed(1)}%
                  </p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                    result.risk_category === 'Critical' || result.risk_category === 'High'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : result.risk_category === 'Medium'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {result.risk_category.toUpperCase()} RISK TIER
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                    <span>Gradient Boosting:</span>
                    <span className="text-slate-200">{((result.individual_probs?.gradient_boosting || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                    <span>Random Forest:</span>
                    <span className="text-slate-200">{((result.individual_probs?.random_forest || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                    <span>Logistic Regression:</span>
                    <span className="text-slate-200">{((result.individual_probs?.logistic_regression || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-400">
                    <span>Model Spread (Δ):</span>
                    <span className="text-sky-400 font-bold">{result.model_spread?.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                Adjust features on the left and click "Simulate Risk Scoring" to evaluate live predictions.
              </div>
            )}
          </div>

          {result?.recommended_action && (
            <div className="p-3.5 rounded-lg bg-sky-950/30 border border-sky-500/30 text-xs text-sky-200 leading-relaxed">
              <strong className="block text-sky-400 mb-0.5">Directive:</strong>
              {typeof result.recommended_action === 'object' && result.recommended_action !== null
                ? (result.recommended_action.recommended_action || JSON.stringify(result.recommended_action))
                : String(result.recommended_action)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
