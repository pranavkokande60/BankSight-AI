import React from 'react';
import {
  LayoutDashboard,
  Orbit,
  ShieldCheck,
  Users,
  LineChart,
  Binary,
  Layers,
  Sparkles,
  Sliders,
  Scale,
  Calculator,
  Bot,
  FileText,
  BadgeAlert,
  ChevronRight,
  Activity,
  Globe,
  Clock,
  GitFork,
  Share2,
  Gauge,
  BarChart2,
  UserPlus,
} from 'lucide-react';

export type TabKey =
  | 'landing'
  | 'dashboard'
  | 'customer-mgmt'
  | 'data-comparison'
  | 'live-ops'
  | 'geospatial'
  | 'galaxy3d'
  | 'quality'
  | 'segmentation'
  | 'churn-intel'
  | 'survival'
  | 'household-graph'
  | 'model-lab'
  | 'explainability'
  | 'risk-passport'
  | 'playground'
  | 'eara-lab'
  | 'uplift'
  | 'fairness'
  | 'simulator'
  | 'mlops-psi'
  | 'ai-assistant'
  | 'reports';

interface SidebarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  collapsed?: boolean;
}

interface NavSection {
  title: string;
  items: {
    key: TabKey;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const sections: NavSection[] = [
    {
      title: 'COMMAND & VISUAL',
      items: [
        { key: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
        { key: 'data-comparison', label: 'Data Comparison & Graphs', icon: BarChart2, badge: 'Compare' },
        { key: 'live-ops', label: 'Live Operations Stream', icon: Activity, badge: 'Live WS' },
        { key: 'geospatial', label: 'European Sovereign Map', icon: Globe, badge: 'ECB' },
        { key: 'galaxy3d', label: '3D Customer Galaxy', icon: Orbit, badge: 'WebGL' },
      ],
    },
    {
      title: 'DATA & INTELLIGENCE',
      items: [
        { key: 'customer-mgmt', label: 'Customer Management', icon: UserPlus, badge: 'New' },
        { key: 'quality', label: 'Data Quality Centre', icon: ShieldCheck, badge: '10-Pt' },
        { key: 'segmentation', label: 'Customer Segmentation', icon: Users },
        { key: 'churn-intel', label: 'Churn Intelligence', icon: LineChart },
        { key: 'survival', label: 'Survival & Dynamic CLTV', icon: Clock, badge: 'Cox PH' },
        { key: 'household-graph', label: 'Household Contagion', icon: Share2, badge: 'Network' },
      ],
    },
    {
      title: 'MACHINE LEARNING & XAI',
      items: [
        { key: 'model-lab', label: 'ML Model Laboratory', icon: Binary, badge: '0.8612' },
        { key: 'explainability', label: 'Explainable AI (SHAP)', icon: Sparkles },
        { key: 'risk-passport', label: 'Customer Risk Passport', icon: BadgeAlert },
        { key: 'playground', label: 'Prediction Sandbox', icon: Sliders },
      ],
    },
    {
      title: 'STRATEGY & DECISION',
      items: [
        { key: 'eara-lab', label: 'EARA Allocation Lab', icon: Layers, badge: 'Proposed' },
        { key: 'uplift', label: 'Causal Uplift Matrix', icon: GitFork, badge: 'Uplift' },
        { key: 'fairness', label: 'Model Trust & Fairness', icon: Scale },
        { key: 'simulator', label: 'Scenario Simulator', icon: Calculator },
      ],
    },
    {
      title: 'ENTERPRISE & AUDIT',
      items: [
        { key: 'mlops-psi', label: 'Continuous MLOps (PSI)', icon: Gauge, badge: 'Sentinel' },
        { key: 'ai-assistant', label: 'AI Banking Assistant', icon: Bot, badge: 'Live' },
        { key: 'reports', label: 'Executive Reports', icon: FileText, badge: 'Generator' },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col h-full select-none overflow-y-auto">
      <div className="py-4 space-y-6">
        {sections.map((sec, sIdx) => (
          <div key={sIdx} className="px-3">
            <h3 className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-2">
              {sec.title}
            </h3>
            <div className="space-y-1">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onSelectTab(item.key)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-sky-600/15 text-sky-400 border border-sky-500/30 shadow-sm shadow-sky-900/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer System Status */}
      <div className="mt-auto p-4 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>API v1 Online</span>
          </span>
          <span className="font-mono text-slate-500">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
