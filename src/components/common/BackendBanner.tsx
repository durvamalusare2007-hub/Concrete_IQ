import React, { useState } from 'react';
import { BackendStatus } from '../../types/concrete';
import { concreteApi } from '../../services/api';
import { 
  AlertCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  RefreshCw, 
  Settings, 
  Server,
  Activity,
  Layers
} from 'lucide-react';

interface BackendBannerProps {
  status: BackendStatus;
  onOpenSettings: () => void;
}

export const BackendBanner: React.FC<BackendBannerProps> = ({ status, onOpenSettings }) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await concreteApi.checkBackendHealth();
    } catch {
      // Error handled inside API service
    } finally {
      setIsRetrying(false);
    }
  };

  const isConnected = status.isConnected;

  return (
    <div className={`border-b transition-colors ${
      isConnected 
        ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950' 
        : 'bg-amber-50/80 border-amber-200/80 text-amber-950'
    }`}>
      {/* Compact Status Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Indicator, Title & Plain Language Message */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Status Indicator Dot */}
          <div className="flex items-center shrink-0">
            {isConnected ? (
              <span className="relative flex h-2.5 w-2.5" title="Connected">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
              </span>
            ) : (
              <span className="relative flex h-2.5 w-2.5" title="Not Connected">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600" />
              </span>
            )}
          </div>

          {/* Status Title & Subtitle */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 shrink-0">
              <span>{isConnected ? 'Analysis Server: Connected' : 'Analysis Server: Not Connected'}</span>
              
              {/* Tooltip trigger */}
              <div 
                className="relative inline-flex items-center"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <button
                  type="button"
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-0.5 rounded focus:outline-none"
                  aria-label="About the analysis server"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                {/* Hover / Click Tooltip */}
                {showTooltip && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-40 w-64 p-2.5 bg-slate-900 text-white text-[11px] font-normal leading-relaxed rounded-md shadow-lg border border-slate-700">
                    The analysis server processes supported calculations for your dataset.
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-t border-l border-slate-700" />
                  </div>
                )}
              </div>
            </div>

            <span className="hidden sm:inline text-slate-400">·</span>

            {/* Plain English User-Facing Status Message */}
            <span className="text-slate-600 truncate">
              {isConnected 
                ? 'Your dataset can be sent to the analysis server.' 
                : "We couldn't reach the analysis server. Please check your connection or try again."
              }
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Try Again Button (shown when disconnected) */}
          {!isConnected && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-md shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Checking...' : 'Try Again'}</span>
            </button>
          )}

          {/* Technical Details Toggle */}
          <button
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-black/5 rounded transition-colors cursor-pointer"
            aria-expanded={isDetailsOpen}
          >
            <span>Technical Details</span>
            {isDetailsOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-black/5 rounded transition-colors cursor-pointer"
            title="Configure Server URL"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Settings</span>
          </button>
        </div>
      </div>

      {/* Expandable Technical Details Section */}
      {isDetailsOpen && (
        <div className="border-t border-slate-200/80 bg-white/95 px-4 md:px-6 py-4 text-xs text-slate-700 animate-fadeIn">
          <div className="max-w-7xl mx-auto space-y-4">
            
            {/* Top Diagnostics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Server Endpoint
                </span>
                <span className="font-mono text-slate-900 break-all text-[11px] font-medium block">
                  {status.baseUrl}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Health Check
                </span>
                <div className="flex items-center gap-1.5 text-[11px] font-medium">
                  {isConnected ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-emerald-800">GET /api/health (200 OK)</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="text-amber-800">GET /api/health (Failed)</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Response Latency
                </span>
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-slate-900">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isConnected ? `${status.latencyMs} ms` : 'Unreachable'}</span>
                  {status.version && (
                    <span className="text-slate-400 text-[10px]">({status.version})</span>
                  )}
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Active Live Endpoints
                </span>
                <div className="font-mono text-[11px] text-slate-800">
                  <span className="inline-block bg-slate-200/70 px-1 py-0.5 rounded text-[10px] mr-1">/health</span>
                  <span className="inline-block bg-slate-200/70 px-1 py-0.5 rounded text-[10px]">/statistics</span>
                </div>
              </div>
            </div>

            {/* Error Message Details if disconnected */}
            {!isConnected && status.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-xs">
                <span className="font-bold">Diagnostics: </span>
                <span className="font-mono">{status.error}</span>
              </div>
            )}

            {/* Algorithm Status Matrix in Plain Language */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-slate-900 text-xs">Feature & Algorithm Server Support</h4>
                </div>
                <span className="text-[11px] text-slate-500">
                  Accurate execution state for each module
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {/* Dataset Statistics / Profiling */}
                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200/80">
                  <span className="font-medium text-slate-800">Dataset Exploration & Statistics</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    isConnected 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isConnected ? 'Ready to use.' : 'Preview only — this feature is not connected to the analysis server yet.'}
                  </span>
                </div>

                {/* Regression Modeling */}
                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200/80">
                  <span className="font-medium text-slate-800">Linear & Multiple Regression</span>
                  <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Preview only — this feature is not connected to the analysis server yet.
                  </span>
                </div>

                {/* Classification */}
                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200/80">
                  <span className="font-medium text-slate-800">Classification (CART & Naive Bayes)</span>
                  <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Preview only — this feature is not connected to the analysis server yet.
                  </span>
                </div>

                {/* Clustering */}
                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200/80">
                  <span className="font-medium text-slate-800">Clustering (K-Means & Hierarchical)</span>
                  <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Preview only — this feature is not connected to the analysis server yet.
                  </span>
                </div>

                {/* Association Rules */}
                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200/80">
                  <span className="font-medium text-slate-800">Association Rules (Apriori)</span>
                  <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Preview only — this feature is not connected to the analysis server yet.
                  </span>
                </div>

                {/* Data Warehouse & OLAP */}
                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200/80">
                  <span className="font-medium text-slate-800">Data Warehouse & OLAP Cubes</span>
                  <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Preview only — this feature is not connected to the analysis server yet.
                  </span>
                </div>

                {/* Preprocessing */}
                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200/80 md:col-span-2">
                  <span className="font-medium text-slate-800">Data Preprocessing & Normalization</span>
                  <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Preview only — this feature is not connected to the analysis server yet.
                  </span>
                </div>
              </div>
            </div>

            {/* Hint / Setup Link */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>
                To configure backend URL or test API endpoints, open Connection Settings.
              </span>
              <button
                onClick={onOpenSettings}
                className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Server className="w-3 h-3" />
                Open Connection Settings
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
