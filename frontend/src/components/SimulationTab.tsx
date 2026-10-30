import React, { useState, useEffect } from 'react';
import {
  Calculator,
  TrendingUp,
  Coins,
  Sliders,
  CheckCircle2,
  ShieldAlert,
  Building2,
  Activity,
  Euro,
  Scale,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../api';

export const SimulationTab: React.FC = () => {
  const [budget, setBudget] = useState<number>(1000);
  const [costPerContact, setCostPerContact] = useState<number>(45);
  const [successRate, setSuccessRate] = useState<number>(0.20);
  const [marginRate, setMarginRate] = useState<number>(0.02);
  const [simData, setSimData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ECB Stress Test State
  const [stressScenario, setStressScenario] = useState<string>('ADVERSE_INFLATION_SHOCK');
  const [customEuriborBps, setCustomEuriborBps] = useState<number>(0);
  const [customBalanceShock, setCustomBalanceShock] = useState<number>(0);
  const [stressData, setStressData] = useState<any>(null);
  const [stressLoading, setStressLoading] = useState(false);

  const fetchSimulation = () => {
    setLoading(true);
    api.getScenarioSimulation({
      budget,
      cost_per_contact: costPerContact,
      success_rate: successRate,
      margin_rate: marginRate,
    })
      .then(setSimData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchStressTest = () => {
    setStressLoading(true);
    api.getEcbStressTest(stressScenario, customEuriborBps, customBalanceShock)
      .then(setStressData)
      .catch(console.error)
      .finally(() => setStressLoading(false));
  };

  useEffect(() => {
    fetchSimulation();
  }, [budget, costPerContact, successRate, marginRate]);

  useEffect(() => {
    fetchStressTest();
  }, [stressScenario, customEuriborBps, customBalanceShock]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-100">Retention Campaign Scenario Simulator</h1>
        <p className="text-xs text-slate-400 mt-1">
          Estimate campaign expenditure, retained deposit value, annual interest margin, and projected financial ROI.
        </p>
      </div>

      {/* Simulator Inputs */}
      <div className="fintech-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <span>Campaign Economics Parameters</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="flex justify-between font-semibold text-slate-400 mb-1">
              <span>Contact Budget</span>
              <span className="text-sky-400 font-mono">{budget} Contacts</span>
            </div>
            <input
              type="range"
              min="200"
              max="3000"
              step="100"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-400 mb-1">
              <span>Cost Per Contact</span>
              <span className="text-slate-200 font-mono">€{costPerContact}</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={costPerContact}
              onChange={(e) => setCostPerContact(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-400 mb-1">
              <span>Retention Success Rate</span>
              <span className="text-emerald-400 font-mono">{(successRate * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={successRate}
              onChange={(e) => setSuccessRate(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-400 mb-1">
              <span>Annual Net Margin</span>
              <span className="text-amber-400 font-mono">{(marginRate * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.005"
              max="0.05"
              step="0.005"
              value={marginRate}
              onChange={(e) => setMarginRate(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Scenario Comparison Cards */}
      {simData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(simData.scenarios || {}).map(([name, s]: [string, any]) => (
            <div
              key={name}
              className={`fintech-card p-5 space-y-3 ${
                name === 'Baseline' ? 'border-sky-500/40 bg-slate-900/90' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-100">{name} Scenario</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-400">
                  {(s.success_rate * 100).toFixed(0)}% Success
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                  <span>Campaign Cost:</span>
                  <span className="text-slate-200">€{s.campaign_cost?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                  <span>Retained Customers:</span>
                  <span className="text-emerald-400 font-bold">{s.retained_customers} Accounts</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                  <span>Protected Deposits:</span>
                  <span className="text-sky-400 font-bold">€{(s.retained_balance / 1e6).toFixed(2)}M</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                  <span>Net Annual Profit:</span>
                  <span className="text-emerald-400 font-bold">€{Math.round(s.net_annual_profit || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-400">
                  <span>Projected ROI:</span>
                  <span className="text-amber-400 font-bold">{(s.roi * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* European Central Bank (ECB) Basel III Macro Stress Tester */}
      <div className="fintech-card p-6 space-y-6 border-indigo-500/30 bg-slate-900/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                European Central Bank (ECB) Basel III Macro Stress Tester
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  SSM / EBA Compliant
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Simulates severe macroeconomic shocks, stagflation, rate hikes, and sovereign capital flight.
              </p>
            </div>
          </div>

          {/* Scenario Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            {[
              { key: 'ADVERSE_INFLATION_SHOCK', label: 'Adverse Stagflation' },
              { key: 'SEVERELY_ADVERSE_RECESSION', label: 'Severe Eurozone Recession' },
              { key: 'FINTECH_DISRUPTION', label: 'Neobank Deposit Flight' },
              { key: 'ECB_BASELINE', label: 'ECB Baseline (SREP)' },
            ].map((sc) => (
              <button
                key={sc.key}
                onClick={() => setStressScenario(sc.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  stressScenario === sc.key
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stress Parameters Fine-Tuning */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-xs">
          <div>
            <div className="flex justify-between font-semibold text-slate-400 mb-1">
              <span>Euribor Shock Increment</span>
              <span className="text-indigo-400 font-mono">+{customEuriborBps} bps</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="25"
              value={customEuriborBps}
              onChange={(e) => setCustomEuriborBps(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-400 mb-1">
              <span>Deposit Balance Drawdown Shock</span>
              <span className="text-rose-400 font-mono">{customBalanceShock}%</span>
            </div>
            <input
              type="range"
              min="-40"
              max="0"
              step="5"
              value={customBalanceShock}
              onChange={(e) => setCustomBalanceShock(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
          </div>
        </div>

        {/* Stressed Portfolio Metrics Display */}
        {stressData && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Stressed Churn Rate</span>
                <div className="text-2xl font-bold font-mono text-rose-400">
                  {stressData.portfolio_impact.stressed_churn_rate_pct}%
                </div>
                <div className="text-[10px] text-rose-300 mt-1 flex items-center gap-1 font-mono">
                  +{stressData.portfolio_impact.churn_rate_increase_pts} pts vs Baseline ({stressData.portfolio_impact.baseline_churn_rate_pct}%)
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Stressed Capital at Risk</span>
                <div className="text-2xl font-bold font-mono text-white">
                  €{(stressData.portfolio_impact.stressed_capital_at_risk_eur / 1e6).toFixed(1)}M
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Incremental: +€{(stressData.portfolio_impact.incremental_capital_loss_eur / 1e6).toFixed(1)}M
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">CET1 Capital Depletion</span>
                <div className="text-2xl font-bold font-mono text-amber-400">
                  -{stressData.portfolio_impact.cet1_capital_depletion_bps} bps
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Pillar 2 Capital Surcharge
                </div>
              </div>

              <div className="p-4 bg-indigo-950/30 rounded-xl border border-indigo-500/30">
                <span className="text-[11px] text-indigo-300 block mb-1">Recommended EARA Buffer</span>
                <div className="text-2xl font-bold font-mono text-indigo-400">
                  €{(stressData.portfolio_impact.recommended_eara_buffer_eur / 1e6).toFixed(2)}M
                </div>
                <div className="text-[10px] text-emerald-400 mt-1 font-mono">
                  Protects solvency margin
                </div>
              </div>
            </div>

            {/* Sovereign Vulnerability Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Jurisdictional Capital Exposure Under Stress
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-left">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Jurisdiction</th>
                      <th className="py-2.5 px-3">Baseline Churn</th>
                      <th className="py-2.5 px-3">Stressed Churn</th>
                      <th className="py-2.5 px-3">Stressed Attrition Exposure</th>
                      <th className="py-2.5 px-3">Liquidity Risk Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {stressData.geographic_vulnerability?.map((g: any) => (
                      <tr key={g.country} className="hover:bg-slate-950/40">
                        <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                          <span>{g.country === 'Germany' ? '🇩🇪' : g.country === 'France' ? '🇫🇷' : '🇪🇸'}</span>
                          {g.country}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{g.baseline_churn_rate}%</td>
                        <td className="py-2.5 px-3 text-rose-400 font-bold">{g.stressed_churn_rate}%</td>
                        <td className="py-2.5 px-3 text-white">€{(g.stressed_capital_at_risk_eur / 1e6).toFixed(1)}M</td>
                        <td className="py-2.5 px-3 text-sky-400 font-bold">{g.liquidity_share_pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Supervisory Action Items */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                ECB SSM Supervisory Action Protocol
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {stressData.supervisory_action_items?.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
