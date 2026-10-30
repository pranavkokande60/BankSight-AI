import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ComposedChart,
} from 'recharts';
import {
  Filter,
  Download,
  Printer,
  RefreshCw,
  BarChart2,
  TrendingUp,
  Cpu,
  AlertTriangle,
  Layers,
  Globe,
  Users,
  DollarSign,
  CheckCircle2,
  ShieldAlert,
  SlidersHorizontal,
  Activity,
  Award,
  Sparkles,
  GitCompare,
} from 'lucide-react';
import { api } from '../api';

export const DataComparisonTab: React.FC = () => {
  // Metadata for filter dropdowns
  const [metadata, setMetadata] = useState<any | null>(null);

  // Active Filter States
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<string>('ALL');
  const [selectedActivity, setSelectedActivity] = useState<string>('ALL');
  const [selectedRiskCategory, setSelectedRiskCategory] = useState<string>('ALL');
  const [selectedCohortPreset, setSelectedCohortPreset] = useState<string>('germany_vs_france');

  // Component Data & UI States
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial filter metadata
  useEffect(() => {
    api.getVisualizerMetadata()
      .then(setMetadata)
      .catch((err) => console.error('Failed to load visualizer metadata:', err));
  }, []);

  // Fetch aggregated data whenever filters change
  const fetchData = () => {
    setLoading(true);
    setError(null);

    const isActiveParam =
      selectedActivity === 'Active Member'
        ? 1
        : selectedActivity === 'Inactive Member'
        ? 0
        : undefined;

    const prodParam = selectedProduct !== 'ALL' ? Number(selectedProduct) : undefined;

    api.getVisualizerData({
      country: selectedCountry !== 'ALL' ? selectedCountry : undefined,
      products: prodParam,
      is_active: isActiveParam,
      risk_category: selectedRiskCategory !== 'ALL' ? selectedRiskCategory : undefined,
    })
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching visualizer data:', err);
        setError(err.message || 'Failed to load visualizer analytics data.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [selectedCountry, selectedProduct, selectedActivity, selectedRiskCategory]);

  const handleResetFilters = () => {
    setSelectedCountry('ALL');
    setSelectedProduct('ALL');
    setSelectedActivity('ALL');
    setSelectedRiskCategory('ALL');
  };

  const handleExportCsv = () => {
    const isActiveParam =
      selectedActivity === 'Active Member'
        ? 1
        : selectedActivity === 'Inactive Member'
        ? 0
        : undefined;

    const url = api.exportVisualizerCsvUrl({
      country: selectedCountry !== 'ALL' ? selectedCountry : undefined,
      products: selectedProduct !== 'ALL' ? Number(selectedProduct) : undefined,
      is_active: isActiveParam,
      risk_category: selectedRiskCategory !== 'ALL' ? selectedRiskCategory : undefined,
    });
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  // Custom Dark Tooltip for Recharts
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 z-50">
          <p className="font-bold text-sky-400 border-b border-slate-800 pb-1 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-bold text-white">
                {typeof entry.value === 'number'
                  ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                  : entry.value}
                {entry.unit ? ` ${entry.unit}` : ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 space-y-6 text-slate-100">
      {/* Header Banner (RouteNexa AI Style) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart2 className="w-4 h-4" />
            <span>Portfolio Intelligence & Performance Graphs</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Data Comparison & Analytical Visualizer Suite
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Interactive multi-dimensional comparison graphs, cross-sovereign cohorts, product holding cliff distributions, and machine learning benchmarks.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition flex items-center gap-1.5 text-xs font-medium"
            title="Refresh Charts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition flex items-center gap-1.5 text-xs font-medium"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition flex items-center gap-1.5 text-xs font-medium"
            title="Print Dossier"
          >
            <Printer className="w-3.5 h-3.5 text-purple-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar Bar (RouteNexa AI Style) */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Filter className="w-4 h-4 text-sky-400" />
            <span>Dimensional Comparison Filters</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
          >
            Reset All Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Country Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Sovereign Territory (Country)
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {metadata?.countries?.map((c: string) => (
                <option key={c} value={c}>{c === 'ALL' ? `All European Countries (${metadata?.total_records?.toLocaleString() || '10,000'})` : c}</option>
              ))}
            </select>
          </div>

          {/* Product Holding Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Products Held
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {metadata?.products?.map((p: any) => (
                <option key={String(p)} value={String(p)}>
                  {p === 'ALL' ? 'All Holding Tiers (1 - 4)' : `${p} Product${p > 1 ? 's' : ''}`}
                </option>
              ))}
            </select>
          </div>

          {/* Activity Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Digital Engagement Status
            </label>
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {metadata?.activity_statuses?.map((s: string) => (
                <option key={s} value={s}>{s === 'ALL' ? 'All Activity Levels' : s}</option>
              ))}
            </select>
          </div>

          {/* Risk Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Consensus Risk Category
            </label>
            <select
              value={selectedRiskCategory}
              onChange={(e) => setSelectedRiskCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {metadata?.risk_categories?.map((r: string) => (
                <option key={r} value={r}>{r === 'ALL' ? 'All Risk Tiers' : `${r} Risk`}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Top Level Metric Summary Cards */}
      {data && data.kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
            <span className="text-xs font-medium text-slate-400">Matched Accounts</span>
            <div className="text-2xl font-bold text-white mt-1">
              {data.kpis.total_matched?.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Portfolio subset</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
            <span className="text-xs font-medium text-slate-400">Observed Churn Rate</span>
            <div className="text-2xl font-bold text-rose-400 mt-1">
              {data.kpis.churn_rate_pct}%
            </div>
            <span className="text-[10px] text-rose-400 font-mono">{data.kpis.churned_count} departures</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
            <span className="text-xs font-medium text-slate-400">Total Matched Balance</span>
            <div className="text-2xl font-bold text-sky-400 mt-1">
              €{(data.kpis.total_balance_eur / 1_000_000).toFixed(1)}M
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Deposit volume</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
            <span className="text-xs font-medium text-slate-400">Average Balance</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              €{Math.round(data.kpis.avg_balance_eur).toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">Per account</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
            <span className="text-xs font-medium text-slate-400">Capital at Risk</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">
              €{(data.kpis.capital_at_risk_eur / 1_000_000).toFixed(1)}M
            </div>
            <span className="text-[10px] text-amber-400 font-mono">Exited account balance</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
            <span className="text-xs font-medium text-slate-400">High Risk Forecast</span>
            <div className="text-2xl font-bold text-purple-400 mt-1">
              {data.kpis.high_risk_count?.toLocaleString()}
            </div>
            <span className="text-[10px] text-purple-300 font-mono">Predicted churn &gt; 45%</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHART SECTION: ROUTENEXA AI COMPARISON GRAPHS                             */}
      {/* ========================================================================= */}
      {data && (
        <div className="space-y-6">
          {/* CHART ROW 1: SOVEREIGN COUNTRY & PRODUCT CLIFF */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CHART 1: Sovereign Country Comparison */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  1. Sovereign Territory Comparison (Germany vs France vs Spain)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Comparison across sovereign cohorts showing customer account volume, average deposit balance, and attrition rates.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.country_comparison} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="country" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="vol" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="rate" orientation="right" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                    <Tooltip content={renderCustomTooltip} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar yAxisId="vol" dataKey="volume" name="Account Volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="rate" dataKey="churn_rate_pct" name="Churn Rate (%)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Country summary metrics */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                {data.country_comparison.map((c: any) => (
                  <div key={c.country} className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-center font-mono">
                    <span className="text-[11px] font-bold text-slate-200 block">{c.country}</span>
                    <div className="text-xs font-bold text-rose-400 mt-0.5">{c.churn_rate_pct}% Churn</div>
                    <div className="text-[10px] text-slate-400">€{Math.round(c.avg_balance).toLocaleString()} avg</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CHART 2: Product Holding Cliff Analysis */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  2. Multi-Product Holding Cliff Analysis (1 to 4 Products)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Illustrates the severe holding cliff: churn rate accelerates from 7.6% (2 products) to 82.7% (3 products) and 100% (4 products).
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.product_cliff} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="product_label" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="vol" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="rate" orientation="right" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" domain={[0, 100]} />
                    <Tooltip content={renderCustomTooltip} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar yAxisId="vol" dataKey="volume" name="Holding Volume" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="rate" dataKey="churn_rate_pct" name="Churn Rate (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
                {data.product_cliff.map((p: any) => (
                  <div key={p.products} className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-center font-mono">
                    <span className="text-[10px] font-bold text-slate-300 block">{p.products} Prod</span>
                    <div className={`text-xs font-bold mt-0.5 ${p.churn_rate_pct > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {p.churn_rate_pct}%
                    </div>
                    <div className="text-[10px] text-slate-500">{p.volume.toLocaleString()} accts</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CHART ROW 2: AGE DEMOGRAPHIC COMPOSED & DIGITAL ENGAGEMENT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CHART 3: Age Demographic Curve */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  3. Demographic Age Brackets vs Capital Risk Exposure
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Dual-axis composed area and line chart tracking account volume alongside churn probability across age cohorts.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.age_demographics} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <defs>
                      <linearGradient id="ageVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="age_bracket" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" domain={[0, 65]} />
                    <Tooltip content={renderCustomTooltip} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="volume"
                      name="Account Volume"
                      stroke="#8b5cf6"
                      fillOpacity={1}
                      fill="url(#ageVolumeGrad)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="churn_rate_pct"
                      name="Churn Rate (%)"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-800/80">
                {data.age_demographics.map((a: any) => (
                  <div key={a.age_bracket} className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 text-center font-mono">
                    <span className="text-[10px] font-bold text-slate-300 block">{a.age_bracket}</span>
                    <div className="text-xs font-bold text-purple-400 mt-0.5">{a.churn_rate_pct}%</div>
                    <div className="text-[9px] text-slate-500">{a.volume} accts</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CHART 4: Digital Engagement Disparity */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  4. Digital Active Member vs Inactive Depositor Disparity
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Comparison highlighting how active online/mobile banking status suppresses customer churn by nearly half.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.activity_comparison} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="status" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="vol" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="rate" orientation="right" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" domain={[0, 35]} />
                    <Tooltip content={renderCustomTooltip} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar yAxisId="vol" dataKey="volume" name="Account Volume" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="rate" dataKey="churn_rate_pct" name="Churn Rate (%)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 font-mono text-xs">
                {data.activity_comparison.map((act: any) => (
                  <div key={act.status} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px] font-bold">{act.status}</span>
                    <div className="text-base font-bold text-white mt-1">{act.churn_rate_pct}% Churn Rate</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">€{(act.total_balance / 1_000_000).toFixed(1)}M total deposits</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CHART ROW 3: BALANCE BRACKETS & CREDIT SCORE TIERS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CHART 5: Balance Brackets Exposure */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  5. Account Balance Bracket Distribution & Flight Risk
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Evaluates flight hazard across zero-balance depositors vs mass-affluent €100K+ cohorts.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.balance_brackets} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="bracket" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis yAxisId="vol" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="rate" orientation="right" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                    <Tooltip content={renderCustomTooltip} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar yAxisId="vol" dataKey="volume" name="Account Volume" fill="#0284c7" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="rate" dataKey="churn_rate_pct" name="Churn Rate (%)" fill="#e11d48" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CHART 6: Credit Score Tiers */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  6. Credit Score Rating Tiers vs Churn Risk
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Examines correlation between credit rating bands (Poor &lt;580 to Exceptional 800+) and account retention.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.credit_tiers} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="tier" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis yAxisId="vol" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="rate" orientation="right" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                    <Tooltip content={renderCustomTooltip} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar yAxisId="vol" dataKey="volume" name="Account Volume" fill="#d97706" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="rate" dataKey="churn_rate_pct" name="Churn Rate (%)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* CHART ROW 4: MACHINE LEARNING BENCHMARK COMPARISON */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                7. Machine Learning Model Benchmark Comparison (Holdout Test Set)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Head-to-head comparison across Gradient Boosting, Random Forest, and Logistic Regression algorithms on ROC-AUC, PR-AUC, Accuracy, Precision, and Recall.
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.ml_models} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="model_name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip content={renderCustomTooltip} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="accuracy" name="Accuracy (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="precision" name="Precision (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recall" name="Recall (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 5: SIDE-BY-SIDE COHORT COMPARATOR (ROUTENEXA AI STYLE)            */}
          {/* ========================================================================= */}
          {data.cohort_presets && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Side-by-Side Customer Cohort Comparator
                    </h3>
                    <p className="text-xs text-slate-400">
                      Head-to-head benchmarking of risk exposure, capital distribution, and churn velocity between portfolio segments.
                    </p>
                  </div>
                </div>

                {/* Preset Selector */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCohortPreset('germany_vs_france')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      selectedCohortPreset === 'germany_vs_france'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    Germany vs France
                  </button>
                  <button
                    onClick={() => setSelectedCohortPreset('single_vs_multi_product')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      selectedCohortPreset === 'single_vs_multi_product'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    1-Prod vs 3+ Prod
                  </button>
                  <button
                    onClick={() => setSelectedCohortPreset('active_vs_inactive')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      selectedCohortPreset === 'active_vs_inactive'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    Active vs Inactive
                  </button>
                </div>
              </div>

              {/* Active Cohort Preset Details */}
              {(() => {
                const preset = data.cohort_presets[selectedCohortPreset];
                if (!preset) return null;
                const { cohort_a, cohort_b, verdict } = preset;

                return (
                  <div className="space-y-4">
                    {/* Executive Verdict Banner */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-indigo-950/30 to-slate-950 border border-indigo-500/30 flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                          Executive Differential Finding
                        </span>
                        <p className="text-xs text-slate-200 mt-0.5 leading-relaxed font-medium">
                          {verdict}
                        </p>
                      </div>
                    </div>

                    {/* Side-by-Side Dual Column Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Cohort A */}
                      <div className="p-5 bg-slate-950 rounded-xl border border-sky-500/30 space-y-3 font-mono text-xs">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="font-bold text-sky-400 text-sm">{cohort_a.name}</span>
                          <span className="text-slate-400">{cohort_a.volume.toLocaleString()} accounts</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Observed Churn Rate:</span>
                          <strong className="text-rose-400 text-sm">{cohort_a.churn_rate_pct}%</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Average Account Balance:</span>
                          <strong className="text-emerald-400">€{cohort_a.avg_balance.toLocaleString()}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Capital Exposed to Attrition:</span>
                          <strong className="text-amber-400">€{cohort_a.capital_exposed_m}M</strong>
                        </div>
                      </div>

                      {/* Cohort B */}
                      <div className="p-5 bg-slate-950 rounded-xl border border-purple-500/30 space-y-3 font-mono text-xs">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="font-bold text-purple-400 text-sm">{cohort_b.name}</span>
                          <span className="text-slate-400">{cohort_b.volume.toLocaleString()} accounts</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Observed Churn Rate:</span>
                          <strong className="text-rose-400 text-sm">{cohort_b.churn_rate_pct}%</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Average Account Balance:</span>
                          <strong className="text-emerald-400">€{cohort_b.avg_balance.toLocaleString()}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Capital Exposed to Attrition:</span>
                          <strong className="text-amber-400">€{cohort_b.capital_exposed_m}M</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
