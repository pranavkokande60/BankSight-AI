import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Copy,
  Check,
  Printer,
  Sliders,
  FileSpreadsheet,
} from 'lucide-react';
import { api } from '../api';

export const ReportsTab: React.FC = () => {
  const [reportType, setReportType] = useState<'executive' | 'government' | 'retention'>('executive');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [lastGenerated, setLastGenerated] = useState<string>('');

  const generateReport = () => {
    setLoading(true);
    setError(null);

    let fetcher = api.getExecutiveReport;
    if (reportType === 'government') fetcher = api.getGovernmentSummary;
    if (reportType === 'retention') {
      // Fetch retention-focused executive report
      fetcher = api.getExecutiveReport;
    }

    fetcher()
      .then((text) => {
        setContent(text || '');
        setLastGenerated(new Date().toLocaleTimeString());
        setError(null);
      })
      .catch((err) => {
        console.error('Report fetch error:', err);
        setError(err?.message || 'Failed to generate report.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    generateReport();
  }, [reportType]);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadMarkdown = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BankSight_AI_${reportType.toUpperCase()}_REPORT_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-sky-400" />
            <span>Executive Reports Generator</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate and export real-time portfolio risk assessments, executive briefings, and compliance audit dossiers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Telemetry Engine</span>
          </div>
        </div>
      </div>

      {/* Report Generator Controls Card */}
      <div className="fintech-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>Select Report Specification</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose the audit objective and analytical depth for dynamic report compilation.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={generateReport}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-md shadow-sky-900/20 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Compiling Report...' : 'Re-Generate Report'}</span>
            </button>

            <button
              onClick={handleCopy}
              disabled={!content || loading}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
              title="Copy markdown content to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              disabled={!content || loading}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
              title="Download Report in Markdown format (.md)"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Export (.md)</span>
            </button>

            <a
              href="/api/v1/reports/download-pdf-dossier"
              download="BankSight_AI_Executive_Dossier.pdf"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-lg text-xs font-bold shadow-md transition-all"
              title="Download Publication-Ready Executive Dossier (PDF)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Executive Dossier (PDF)</span>
            </a>

            <a
              href="/api/v1/reports/download-government-summary"
              download="Executive_Summary_Government_Stakeholders.docx"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium shadow-sm transition-all"
              title="Download Regulatory Summary in Word format (.docx)"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Gov Summary (.docx)</span>
            </a>
          </div>
        </div>

        {/* Report Type Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => setReportType('executive')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              reportType === 'executive'
                ? 'bg-sky-950/40 border-sky-500/50 ring-1 ring-sky-500'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${reportType === 'executive' ? 'text-sky-300' : 'text-slate-200'}`}>
                Executive Risk Audit
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400">
                Primary
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Complete portfolio overview, sovereign disparity metrics, capital flight risks, and model consensus.
            </p>
          </button>

          <button
            onClick={() => setReportType('government')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              reportType === 'government'
                ? 'bg-indigo-950/40 border-indigo-500/50 ring-1 ring-indigo-500'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${reportType === 'government' ? 'text-indigo-300' : 'text-slate-200'}`}>
                Government & ECB Summary
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                Regulatory
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Macroprudential briefing, ECB stress testing scenarios, demographic fairness audit, and governance directives.
            </p>
          </button>

          <button
            onClick={() => setReportType('retention')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              reportType === 'retention'
                ? 'bg-emerald-950/40 border-emerald-500/50 ring-1 ring-emerald-500'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${reportType === 'retention' ? 'text-emerald-300' : 'text-slate-200'}`}>
                Retention Action Plan
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                Actionable
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              EARA prioritization framework, high-value deposit protection, and frontline CRM intervention queues.
            </p>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
          <span>{error}</span>
        </div>
      )}

      {/* Live Generated Report Container */}
      <div className="fintech-card p-6 bg-slate-900/90 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap overflow-x-auto border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-[11px] font-mono text-slate-400 not-sr-only">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Report Format: Markdown Specification</span>
          </div>
          {lastGenerated && (
            <span>Last Generated: {lastGenerated}</span>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <span className="w-5 h-5 rounded-full border-2 border-sky-400/30 border-t-sky-400 animate-spin"></span>
            <span>Compiling report from live database records and ML artifacts...</span>
          </div>
        ) : (
          content || <div className="text-slate-500 italic py-8 text-center">No report content available. Click Re-Generate Report above.</div>
        )}
      </div>
    </div>
  );
};
