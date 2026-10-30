import React from 'react';
import { X, AlertTriangle, AlertCircle, CheckCircle2, Info, Bell } from 'lucide-react';

interface NotificationCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: any[];
}

export const NotificationCenterDrawer: React.FC<NotificationCenterDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
}) => {
  if (!isOpen) return null;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-sky-400" />;
    }
  };

  const getSeverityBorder = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-rose-500/30 bg-rose-950/20';
      case 'warning':
        return 'border-amber-500/30 bg-amber-950/20';
      case 'success':
        return 'border-emerald-500/30 bg-emerald-950/20';
      default:
        return 'border-sky-500/30 bg-sky-950/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-slate-100">Telemetry & Audit Alerts</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-xl border ${getSeverityBorder(notif.severity)} transition-all`}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">{getSeverityIcon(notif.severity)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-200">{notif.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono border border-slate-700/60">
                        {notif.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-center text-xs text-slate-500">
            Real-time European Retail Portfolio Monitor
          </div>
        </div>
      </div>
    </div>
  );
};
