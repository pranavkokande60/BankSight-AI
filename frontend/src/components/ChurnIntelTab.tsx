import React from 'react';
import { LineChart, CheckCircle2, TrendingUp, AlertTriangle, HelpCircle } from 'lucide-react';

export const ChurnIntelTab: React.FC = () => {
  const categoricalTests = [
    {
      feature: 'Geography (France vs Germany vs Spain)',
      test: "Pearson Chi-Square",
      stat: '301.25',
      pValue: '< 0.0001',
      effectSize: "Cramer's V = 0.1736",
      interpretation: 'Highly statistically significant disparity. German accounts drive disproportionate attrition.',
      status: 'SIGNIFICANT',
    },
    {
      feature: 'Gender (Female vs Male)',
      test: "Pearson Chi-Square",
      stat: '113.40',
      pValue: '< 0.0001',
      effectSize: "Cramer's V = 0.1065",
      interpretation: 'Female churn rate is 25.07% vs Male 16.46%. Statistically significant gap.',
      status: 'SIGNIFICANT',
    },
    {
      feature: 'NumOfProducts (1, 2, 3, 4)',
      test: "Pearson Chi-Square",
      stat: '1503.65',
      pValue: '< 0.0001',
      effectSize: "Cramer's V = 0.3878",
      interpretation: 'Very large effect size. Steep holding cliff occurs at 3+ products (82.7% to 100% churn).',
      status: 'SIGNIFICANT',
    },
    {
      feature: 'IsActiveMember (Active vs Inactive)',
      test: "Pearson Chi-Square",
      stat: '243.87',
      pValue: '< 0.0001',
      effectSize: "Cramer's V = 0.1562",
      interpretation: 'Active members churn at 14.27% vs Inactive 26.85%. Membership engagement is highly protective.',
      status: 'SIGNIFICANT',
    },
    {
      feature: 'HasCrCard (Cardholder vs Non)',
      test: "Pearson Chi-Square",
      stat: '0.509',
      pValue: '0.4755',
      effectSize: "Cramer's V = 0.0071",
      interpretation: 'Credit card ownership has no statistically discernible impact on churn (p > 0.05).',
      status: 'NOT SIGNIFICANT',
    },
  ];

  const numericalTests = [
    {
      feature: 'Age',
      test: "Welch's t-test",
      tStat: '29.77',
      pValue: '< 0.0001',
      effectSize: "Cohen's d = 0.7421",
      meanChurn: '44.83 yrs',
      meanRetain: '37.40 yrs',
      status: 'LARGE EFFECT',
    },
    {
      feature: 'Balance',
      test: "Welch's t-test",
      tStat: '11.83',
      pValue: '< 0.0001',
      effectSize: "Cohen's d = 0.2845",
      meanChurn: '€91,108',
      meanRetain: '€72,745',
      status: 'MODERATE EFFECT',
    },
    {
      feature: 'CreditScore',
      test: "Welch's t-test",
      tStat: '-2.71',
      pValue: '0.0068',
      effectSize: "Cohen's d = -0.0654",
      meanChurn: '645.35',
      meanRetain: '651.85',
      status: 'SMALL EFFECT',
    },
    {
      feature: 'EstimatedSalary',
      test: "Welch's t-test",
      tStat: '1.21',
      pValue: '0.2264',
      effectSize: "Cohen's d = 0.0291",
      meanChurn: '€101,465',
      meanRetain: '€99,737',
      status: 'NO EFFECT',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-100">Churn Intelligence & Statistical Inference</h1>
        <p className="text-xs text-slate-400 mt-1">
          Formal statistical hypothesis testing: Chi-Square tests of independence, Welch's t-tests, and effect size metrics.
        </p>
      </div>

      {/* Categorical Associations */}
      <div className="fintech-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-100">Categorical Feature Associations (Pearson Chi-Square & Cramer's V)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-2.5">Feature</th>
                <th className="py-2.5">Chi-Square (χ²)</th>
                <th className="py-2.5">p-value</th>
                <th className="py-2.5">Effect Size (Cramer's V)</th>
                <th className="py-2.5">Finding</th>
                <th className="py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {categoricalTests.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-sans font-semibold text-slate-200">{t.feature}</td>
                  <td className="py-3 text-sky-400 font-bold">{t.stat}</td>
                  <td className="py-3 text-slate-300">{t.pValue}</td>
                  <td className="py-3 text-indigo-300 font-bold">{t.effectSize}</td>
                  <td className="py-3 font-sans text-slate-400 max-w-xs">{t.interpretation}</td>
                  <td className="py-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'SIGNIFICANT' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Numerical Differences */}
      <div className="fintech-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-100">Numerical Feature Differences (Welch's t-test & Cohen's d)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-2.5">Feature</th>
                <th className="py-2.5">t-statistic</th>
                <th className="py-2.5">p-value</th>
                <th className="py-2.5">Cohen's d</th>
                <th className="py-2.5">Churned Mean</th>
                <th className="py-2.5">Retained Mean</th>
                <th className="py-2.5">Effect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {numericalTests.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-sans font-semibold text-slate-200">{t.feature}</td>
                  <td className="py-3 text-sky-400 font-bold">{t.tStat}</td>
                  <td className="py-3 text-slate-300">{t.pValue}</td>
                  <td className="py-3 text-indigo-300 font-bold">{t.effectSize}</td>
                  <td className="py-3 text-rose-300">{t.meanChurn}</td>
                  <td className="py-3 text-emerald-300">{t.meanRetain}</td>
                  <td className="py-3 font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
