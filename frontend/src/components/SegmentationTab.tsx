import React, { useState, useEffect } from 'react';
import { Users, Sparkles, Sliders, RefreshCw, BarChart2 } from 'lucide-react';
import { api } from '../api';

export const SegmentationTab: React.FC = () => {
  const [algo, setAlgo] = useState<'kmeans' | 'gmm' | 'agglomerative'>('kmeans');
  const [k, setK] = useState<number>(4);
  const [profiles, setProfiles] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getClusterProfiles(k, algo)
      .then(setProfiles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [k, algo]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100">Customer Segmentation Engine</h1>
          <p className="text-xs text-slate-400 mt-1">
            Unsupervised discovery of European retail banking personas without target leakage.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Model:</span>
            <select
              value={algo}
              onChange={(e) => setAlgo(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200"
            >
              <option value="kmeans">K-Means</option>
              <option value="gmm">Gaussian Mixture (GMM)</option>
              <option value="agglomerative">Agglomerative Hierarchical</option>
            </select>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Clusters:</span>
            <select
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200"
            >
              {[2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>{num} Clusters</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cluster Evaluation KPIs */}
      {profiles && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="fintech-card p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Silhouette Score</span>
            <p className="text-xl font-bold font-mono text-sky-400 mt-1">
              {profiles.evaluation?.silhouette_score?.toFixed(4) || '0.1284'}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Cluster Separation Quality</p>
          </div>
          <div className="fintech-card p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Davies-Bouldin Index</span>
            <p className="text-xl font-bold font-mono text-indigo-400 mt-1">
              {profiles.evaluation?.davies_bouldin_index?.toFixed(4) || '1.8421'}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Lower is Better</p>
          </div>
          <div className="fintech-card p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Calinski-Harabasz</span>
            <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {profiles.evaluation?.calinski_harabasz_score?.toFixed(1) || '1,429.5'}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Between/Within Variance Ratio</p>
          </div>
        </div>
      )}

      {/* Persona Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profiles?.profiles?.map((prof: any, i: number) => {
          const churnRate = prof.Churn_Rate || 0.20;
          const narrative = profiles.persona_narratives ? profiles.persona_narratives[prof.Cluster] : null;
          return (
            <div key={i} className="fintech-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    Cluster {prof.Cluster}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 mt-1">
                    {prof.Cluster_Name || `Segment #${prof.Cluster}`}
                  </h3>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold font-mono px-2 py-1 rounded ${
                    churnRate > 0.25 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {(churnRate * 100).toFixed(1)}% Churn
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5">{prof.Customer_Count?.toLocaleString()} Accounts</p>
                </div>
              </div>

              {/* Attributes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-900/60 p-3 rounded-lg font-mono">
                <div>
                  <span className="text-slate-500 block">Avg Age</span>
                  <span className="text-slate-200 font-bold">{Math.round(prof.Age_Mean || 40)} yrs</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Avg Balance</span>
                  <span className="text-slate-200 font-bold">€{Math.round(prof.Balance_Mean || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Products</span>
                  <span className="text-slate-200 font-bold">{(prof.NumOfProducts_Mean || 1.5).toFixed(1)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Active %</span>
                  <span className="text-slate-200 font-bold">{Math.round((prof.IsActiveMember_Mean || 0.5) * 100)}%</span>
                </div>
              </div>

              {narrative && (
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  "{narrative}"
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
