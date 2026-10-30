import React, { useState } from 'react';
import {
  Globe,
  MapPin,
  Building,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  Euro,
  Users,
  Compass,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface CountryData {
  country: string;
  code: string;
  churnRate: number;
  totalCustomers: number;
  churnedCustomers: number;
  totalDeposits: string;
  capitalAtRisk: string;
  avgBalance: string;
  zeroBalancePct: number;
  riskSeverity: 'Critical' | 'Moderate' | 'Stable';
  flag: string;
  hubs: { name: string; accounts: number; churn: number; status: string }[];
  strategicNote: string;
}

const COUNTRIES: CountryData[] = [
  {
    country: 'Germany',
    code: 'DE',
    churnRate: 32.44,
    totalCustomers: 2509,
    churnedCustomers: 814,
    totalDeposits: '€300.4M',
    capitalAtRisk: '€101.4M',
    avgBalance: '€119,730',
    zeroBalancePct: 0.0,
    riskSeverity: 'Critical',
    flag: '🇩🇪',
    hubs: [
      { name: 'Frankfurt Central Branch', accounts: 890, churn: 33.1, status: 'High Capital Outflow' },
      { name: 'Munich Wealth Hub', accounts: 740, churn: 31.8, status: 'Private Client Attrition' },
      { name: 'Berlin Tech & Retail', accounts: 520, churn: 34.2, status: 'Neobank Disintermediation' },
      { name: 'Hamburg Maritime Hub', accounts: 359, churn: 30.2, status: 'Commercial Deposit Flight' },
    ],
    strategicNote:
      'Critical Epicenter: 100% of German churners carry positive active balances. With €101.4M in lost liquidity, Germany generates over 54.6% of the entire European portfolio attrition cost. Immediate executive intervention required.',
  },
  {
    country: 'France',
    code: 'FR',
    churnRate: 16.15,
    totalCustomers: 5014,
    churnedCustomers: 810,
    totalDeposits: '€311.3M',
    capitalAtRisk: '€54.2M',
    avgBalance: '€62,094',
    zeroBalancePct: 48.3,
    riskSeverity: 'Stable',
    flag: '🇫🇷',
    hubs: [
      { name: 'Paris Île-de-France Head', accounts: 2150, churn: 15.8, status: 'Balanced Retention' },
      { name: 'Lyon Commercial Branch', accounts: 1120, churn: 16.4, status: 'Stable Engagement' },
      { name: 'Marseille Mediterranean', accounts: 980, churn: 17.1, status: 'Minor Inactivity Drift' },
      { name: 'Toulouse Aerospace Hub', accounts: 764, churn: 15.2, status: 'Optimal Retention' },
    ],
    strategicNote:
      'High volume, lower liquidity risk: Although France represents 50.1% of customer volume, 48.3% of French accounts maintain zero balances, mitigating systemic liquidity risk.',
  },
  {
    country: 'Spain',
    code: 'ES',
    churnRate: 16.67,
    totalCustomers: 2477,
    churnedCustomers: 413,
    totalDeposits: '€153.1M',
    capitalAtRisk: '€30.0M',
    avgBalance: '€61,818',
    zeroBalancePct: 49.9,
    riskSeverity: 'Stable',
    flag: '🇪🇸',
    hubs: [
      { name: 'Madrid Financial Center', accounts: 1050, churn: 16.2, status: 'Stable Core Accounts' },
      { name: 'Barcelona Innovation Hub', accounts: 790, churn: 17.5, status: 'Digital Competition' },
      { name: 'Valencia Coastal Branch', accounts: 410, churn: 16.0, status: 'Standard Activity' },
      { name: 'Seville Regional Node', accounts: 227, churn: 16.8, status: 'Low Churn Baseline' },
    ],
    strategicNote:
      'Controlled Risk Profile: Spain mirrors France with a low 16.67% churn rate and 49.9% zero-balance accounts. Capital attrition is constrained to €30.0M.',
  },
];

export const GeospatialMapTab: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(COUNTRIES[0]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-900/30 rounded-xl border border-blue-500/30 text-blue-400">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                European Sovereign Risk & Capital Flight Map
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950/60 text-blue-300 border border-blue-500/30">
                  3 Jurisdictions
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Macroprudential geographic exposure across Germany, France, and Spain representing €764.8M in deposits.
              </p>
            </div>
          </div>
        </div>

        {/* Global Sovereign Overview Badges */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            Total Capital Exposure:{' '}
            <span className="font-semibold text-rose-400">€185.6M</span>
          </div>
        </div>
      </div>

      {/* Sovereign Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {COUNTRIES.map((c) => {
          const isSelected = selectedCountry.country === c.country;
          return (
            <button
              key={c.country}
              onClick={() => setSelectedCountry(c)}
              className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 border-blue-500 shadow-xl shadow-blue-950/40 ring-1 ring-blue-500'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{c.flag}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{c.country}</h3>
                    <div className="text-xs text-slate-400">Code: {c.code} · {c.totalCustomers} Accounts</div>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    c.riskSeverity === 'Critical'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {c.riskSeverity} Risk
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800/80">
                <div>
                  <div className="text-[11px] text-slate-400">Churn Rate</div>
                  <div
                    className={`text-xl font-bold mt-0.5 ${
                      c.churnRate > 25 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {c.churnRate}%
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Capital at Risk</div>
                  <div className="text-xl font-bold text-white mt-0.5">{c.capitalAtRisk}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Mean Balance</div>
                  <div className="text-sm font-semibold text-slate-200 mt-0.5">{c.avgBalance}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Zero-Balance Accounts</div>
                  <div className="text-sm font-semibold text-slate-200 mt-0.5">{c.zeroBalancePct}%</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-blue-400 font-medium pt-2">
                <span>View Regional Nodes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Sovereign Jurisdiction Deep Dive */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{selectedCountry.flag}</span>
            <div>
              <h2 className="text-xl font-bold text-white">
                {selectedCountry.country} Sovereign Liquidity Profile
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                European Central Bank Single Supervisory Mechanism (SSM) Inspection Focus
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Total Deposit Base:</span>
            <span className="text-sm font-bold text-white">{selectedCountry.totalDeposits}</span>
          </div>
        </div>

        {/* Strategic Analysis Callout */}
        <div
          className={`p-4 rounded-xl border flex items-start gap-3.5 ${
            selectedCountry.riskSeverity === 'Critical'
              ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
              : 'bg-blue-950/20 border-blue-500/30 text-blue-200'
          }`}
        >
          {selectedCountry.riskSeverity === 'Critical' ? (
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          )}
          <p className="text-xs leading-relaxed">{selectedCountry.strategicNote}</p>
        </div>

        {/* Regional Branch Hubs Grid */}
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <Building className="w-4 h-4 text-cyan-400" />
            Key Urban Banking Hubs & Branches in {selectedCountry.country}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedCountry.hubs.map((hub) => (
              <div
                key={hub.name}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="text-xs font-semibold text-white">{hub.name}</div>
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Monitored Accounts:</span>
                  <span className="text-slate-200 font-mono font-medium">{hub.accounts}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Local Churn Rate:</span>
                  <span
                    className={`font-mono font-bold ${
                      hub.churn > 25 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {hub.churn}%
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-medium text-amber-400/90">{hub.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sovereign Action Protocol */}
        <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Recommended Supervisory Action for {selectedCountry.country}
          </h4>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            {selectedCountry.country === 'Germany' ? (
              <>
                <li>Deploy dedicated private banking relationship managers to Frankfurt and Munich hubs.</li>
                <li>Halt cross-selling campaigns for 3+ products; offer fee waivers on multi-holding accounts.</li>
                <li>Implement dynamic Euribor deposit bonus (+25 bps) on balances above €100k to prevent capital flight.</li>
              </>
            ) : (
              <>
                <li>Focus engagement on transitioning zero-balance accounts to active primary salary accounts.</li>
                <li>Promote mobile app onboarding to sustain active member status above the 14.3% retention baseline.</li>
                <li>Monitor competitive neo-banking yield promotions in regional metropolitan centers.</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
