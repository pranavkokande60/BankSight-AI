import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Radio,
  Play,
  Pause,
  Trash2,
  Filter,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  TrendingDown,
  Building,
  RefreshCw,
  Compass,
} from 'lucide-react';

interface BankingEvent {
  event_id: string;
  timestamp: string;
  type: string;
  severity: 'critical' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  city: string;
  country: string;
  customer_id: number;
  risk_score: number;
}

export const LiveOperationsTab: React.FC = () => {
  const [events, setEvents] = useState<BankingEvent[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    warning: 0,
    success: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const isPausedRef = useRef<boolean>(false);
  isPausedRef.current = isPaused;

  useEffect(() => {
    let reconnectTimeout: any;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host || 'localhost:8000';
      const wsUrl = `${protocol}//${host}/ws/live-operations`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data: BankingEvent = JSON.parse(event.data);
          if (!isPausedRef.current) {
            setEvents((prev) => [data, ...prev.slice(0, 99)]);
            setStats((prev) => ({
              total: prev.total + 1,
              critical: prev.critical + (data.severity === 'critical' ? 1 : 0),
              warning: prev.warning + (data.severity === 'warning' ? 1 : 0),
              success: prev.success + (data.severity === 'success' ? 1 : 0),
            }));
          }
        } catch (err) {
          console.error('Failed to parse live event:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = () => {
        setIsConnected(false);
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const filteredEvents = events.filter((ev) => {
    if (filterSeverity !== 'all' && ev.severity !== filterSeverity) return false;
    if (filterCountry !== 'all' && ev.country.toLowerCase() !== filterCountry.toLowerCase()) return false;
    return true;
  });

  const handleClear = () => {
    setEvents([]);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-400" /> Critical
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" /> Warning
          </span>
        );
      case 'success':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> EARA Action
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            Telemetry
          </span>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-900/30 rounded-xl border border-cyan-500/30 text-cyan-400">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                Live Operations Telemetry Stream
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    isConnected
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
                  {isConnected ? 'WebSocket Active' : 'Connecting...'}
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Real-time European retail banking transactions, capital flight monitoring, and autonomous EARA triggers.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition ${
              isPaused
                ? 'bg-amber-600/20 border-amber-500/40 text-amber-300 hover:bg-amber-600/30'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {isPaused ? 'Resume Stream' : 'Pause Stream'}
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Feed
          </button>
        </div>
      </div>

      {/* Real-Time Telemetry Counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Stream Events</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
            <div className="text-[11px] text-cyan-400 mt-0.5 flex items-center gap-1">
              <Radio className="w-3 h-3" /> Live feed buffer
            </div>
          </div>
          <div className="p-3 bg-cyan-950/50 rounded-xl border border-cyan-800/40 text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Capital Flight Alerts</div>
            <div className="text-2xl font-bold text-rose-400 mt-1">{stats.critical}</div>
            <div className="text-[11px] text-rose-300 mt-0.5 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> High-risk outflows
            </div>
          </div>
          <div className="p-3 bg-rose-950/50 rounded-xl border border-rose-800/40 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Product Cliff / Inactivity</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{stats.warning}</div>
            <div className="text-[11px] text-amber-300 mt-0.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Behavioral flags
            </div>
          </div>
          <div className="p-3 bg-amber-950/50 rounded-xl border border-amber-800/40 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Autonomous Interventions</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.success}</div>
            <div className="text-[11px] text-emerald-300 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> EARA packages sent
            </div>
          </div>
          <div className="p-3 bg-emerald-950/50 rounded-xl border border-emerald-800/40 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Stream Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 border border-slate-800/80 rounded-xl p-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Severity:</span>
          {['all', 'critical', 'warning', 'success'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterSeverity(s)}
              className={`px-2.5 py-1 rounded-lg text-xs capitalize transition ${
                filterSeverity === s
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Jurisdiction:</span>
          {['all', 'Germany', 'France', 'Spain'].map((c) => (
            <button
              key={c}
              onClick={() => setFilterCountry(c)}
              className={`px-2.5 py-1 rounded-lg text-xs capitalize transition ${
                filterCountry === c
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Event Feed */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/30 border border-slate-800/80 rounded-xl">
            <Radio className="w-10 h-10 text-cyan-400/50 mx-auto animate-pulse mb-3" />
            <div className="text-slate-300 font-medium">Listening for live European banking events...</div>
            <p className="text-xs text-slate-500 mt-1">
              Events stream over WebSocket every ~2.5 seconds from Frankfurt, Munich, Paris, Lyon, and Madrid.
            </p>
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div
              key={evt.event_id}
              className={`p-4 rounded-xl border transition duration-200 ${
                evt.severity === 'critical'
                  ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                  : evt.severity === 'warning'
                  ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
                  : 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  {getSeverityBadge(evt.severity)}
                  <span className="text-sm font-semibold text-white">{evt.title}</span>
                  <span className="text-xs text-slate-400 font-mono">ID: #{evt.customer_id}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-slate-300 font-medium">
                    <Building className="w-3.5 h-3.5 text-cyan-400" />
                    {evt.city}, {evt.country}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-mono">
                    {evt.timestamp}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-mono">
                    Impact: {(evt.risk_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{evt.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
