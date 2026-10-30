import React, { useState, useEffect } from 'react';
import { Search, X, Command, User, ArrowRight, Layers, Sparkles, Orbit } from 'lucide-react';
import { api } from '../api';
import { TabKey } from './Sidebar';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: TabKey) => void;
  onSelectCustomer?: (customerId: number) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onSelectCustomer,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      api.globalSearch(query)
        .then((res) => {
          setResults(res.results || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type customer ID, surname, model, or analytics tab..."
            className="w-full py-3.5 bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {loading && (
            <div className="py-6 text-center text-xs text-slate-400">Searching...</div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching customers or analytics tabs found for "{query}".
            </div>
          )}

          {!query && (
            <div className="p-3 text-xs text-slate-400">
              <p className="font-semibold text-slate-300 mb-2">Suggested Quick Actions:</p>
              <div className="space-y-1">
                {[
                  { id: 'customer-mgmt', title: 'Customer Management & Live Scoring', icon: Sparkles },
                  { id: 'live-ops', title: 'Live Operations Stream (WebSocket)', icon: Sparkles },
                  { id: 'survival', title: 'Survival Analysis & Dynamic CLTV (Cox PH)', icon: Sparkles },
                  { id: 'uplift', title: 'Causal Uplift Matrix (Two-Model XGBoost)', icon: Sparkles },
                  { id: 'household-graph', title: 'Household Contagion & Ripple Graph', icon: Orbit },
                  { id: 'mlops-psi', title: 'Continuous MLOps (PSI Sentinel Drift)', icon: Layers },
                  { id: 'geospatial', title: 'European Sovereign Risk Map', icon: Orbit },
                  { id: 'galaxy3d', title: 'Open 3D Customer Galaxy', icon: Orbit },
                  { id: 'dashboard', title: 'View Executive Dashboard', icon: Layers },
                  { id: 'eara-lab', title: 'Run EARA Retention Allocation', icon: Sparkles },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id as TabKey);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800 text-left transition-colors"
                  >
                    <div className="flex items-center space-x-2 text-slate-300">
                      <item.icon className="w-4 h-4 text-sky-400" />
                      <span>{item.title}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item.type === 'customer' && onSelectCustomer) {
                  onSelectCustomer(item.id);
                  onSelectTab('risk-passport');
                } else if (item.tab) {
                  onSelectTab(item.tab as TabKey);
                }
                onClose();
              }}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 text-left transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-slate-200">{item.title}</p>
                <p className="text-xs text-slate-400">{item.subtitle}</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                {item.type.toUpperCase()}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Press ESC to close</span>
          <span className="font-mono">BankSight AI Spotlight</span>
        </div>
      </div>
    </div>
  );
};
