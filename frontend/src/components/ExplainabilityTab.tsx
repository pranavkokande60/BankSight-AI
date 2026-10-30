import React from 'react';
import { Sparkles, Layers, ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';

export const ExplainabilityTab: React.FC = () => {
  const globalFeatures = [
    { name: 'Age', importance: 0.324, impact: 'Older depositors (>40) correlate strongly with churn attrition', direction: 'positive' },
    { name: 'NumOfProducts', importance: 0.285, impact: 'Steep non-linear cliff at 3+ products; 2 products is safest', direction: 'non-linear' },
    { name: 'Balance', importance: 0.168, impact: 'High balances drive capital exposure, particularly in Germany', direction: 'positive' },
    { name: 'IsActiveMember', importance: 0.122, impact: 'Active membership provides strong retention protection', direction: 'negative' },
    { name: 'Geography (Germany)', importance: 0.089, impact: 'German account holders exhibit 2x attrition over France/Spain', direction: 'positive' },
    { name: 'CreditScore', importance: 0.012, impact: 'Marginal individual predictive weight across European portfolio', direction: 'neutral' },
  ];

  const sampleWaterfall = [
    { feature: 'Base Value (Expected)', value: '+0.2037', type: 'base' },
    { feature: 'Age = 52 yrs (+12 vs avg)', value: '+0.2410', type: 'risk' },
    { feature: 'NumOfProducts = 3', value: '+0.3120', type: 'risk' },
    { feature: 'Geography = Germany', value: '+0.0980', type: 'risk' },
    { feature: 'IsActiveMember = 0 (Inactive)', value: '+0.0750', type: 'risk' },
    { feature: 'Tenure = 8 yrs (Loyal)', value: '-0.0420', type: 'protect' },
    { feature: 'CreditScore = 720 (Excellent)', value: '-0.0180', type: 'protect' },
    { feature: 'Final Calibrated Churn Prob', value: '0.8697 (Critical)', type: 'final' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-100">Explainable AI (XAI) & Interpretability</h1>
        <p className="text-xs text-slate-400 mt-1">
          SHAP (SHapley Additive exPlanations) TreeExplainer global rankings and individual customer waterfall attributions.
        </p>
      </div>

      {/* Global Feature Attribution Rankings */}
      <div className="fintech-card p-5 space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-slate-100">Global Feature Importance (SHAP Mean Absolute Attributions)</h3>
        </div>
        <div className="space-y-3">
          {globalFeatures.map((f, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-200">{f.name}</span>
                <span className="font-mono text-sky-400">{(f.importance * 100).toFixed(1)}% Weight</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"
                  style={{ width: `${f.importance * 100 * 2.5}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">{f.impact}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Illustrative SHAP Waterfall Explanation */}
      <div className="fintech-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-100">Local Attribution Waterfall: High-Risk Customer Profile</h3>
        <p className="text-xs text-slate-400">
          Decomposition of individual calibrated churn probability from population base value (E[f(x)] = 0.2037).
        </p>
        <div className="space-y-2 font-mono text-xs">
          {sampleWaterfall.map((w, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                w.type === 'risk'
                  ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                  : w.type === 'protect'
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : w.type === 'final'
                  ? 'bg-sky-950/40 border-sky-500/40 text-sky-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2 font-sans font-medium">
                {w.type === 'risk' && <ArrowUp className="w-3.5 h-3.5 text-rose-400" />}
                {w.type === 'protect' && <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{w.feature}</span>
              </div>
              <span className="font-bold">{w.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
