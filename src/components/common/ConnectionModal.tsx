import React, { useState } from 'react';
import { BackendStatus } from '../../types/concrete';
import { concreteApi } from '../../services/api';
import { CheckCircle2, XCircle, RefreshCw, Server, X, Copy, Check, AlertCircle } from 'lucide-react';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: BackendStatus;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({ isOpen, onClose, status }) => {
  const [url, setUrl] = useState(status.baseUrl);
  const [testingHealth, setTestingHealth] = useState(false);
  const [testingStats, setTestingStats] = useState(false);
  const [statsTestResult, setStatsTestResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleTestHealth = async () => {
    setTestingHealth(true);
    setStatsTestResult(null);
    concreteApi.setBaseUrl(url);
    await concreteApi.checkBackendHealth();
    setTestingHealth(false);
  };

  const handleTestStatistics = async () => {
    setTestingStats(true);
    setStatsTestResult(null);
    try {
      const res = await concreteApi.getDatasetStatistics();
      if (res.source === 'r_backend') {
        setStatsTestResult(`Success: POST /api/statistics returned data for ${res.totalRows} rows from R backend at ${res.backendTimestamp}.`);
      } else if (res.error) {
        setStatsTestResult(`Error: ${res.error}`);
      } else {
        setStatsTestResult('Backend unreachable: returned fallback statistics.');
      }
    } catch (err: any) {
      setStatsTestResult(`Error: ${err.message}`);
    } finally {
      setTestingStats(false);
    }
  };

  const rServerSnippet = `# ========================================================
# R Plumber API Server for ConcreteIQ (server.R)
# Endpoints: GET /api/health, POST /api/statistics
# Install: install.packages(c("plumber", "jsonlite"))
# Run:
#   library(plumber)
#   pr <- plumber::pr("server.R")
#   pr$run(port = 8000, host = "0.0.0.0")
# ========================================================
library(plumber)
library(jsonlite)

#* Mandatory CORS filter so browser fetch() can connect
#* @filter cors
function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept")
  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  }
  plumber::forward()
}

#* @get /api/health
#* @serializer json
function() {
  list(
    status = "online",
    engine = "R",
    version = R.version.string,
    time = as.character(Sys.time())
  )
}

#* @post /api/statistics
#* @serializer json
function(req) {
  # Parse JSON dataset posted by ConcreteIQ frontend
  raw_body <- req$postBody
  parsed <- jsonlite::fromJSON(raw_body)
  df <- if (is.data.frame(parsed)) parsed else if (!is.null(parsed$data)) parsed$data else as.data.frame(parsed)
  
  cols <- c("cement", "slag", "flyash", "water", "superplasticizer", 
            "coarseaggregate", "fineaggregate", "age", "Strenght_Mpa")
  
  stats_list <- list()
  for (col in cols) {
    if (col %in% names(df)) {
      v <- na.omit(as.numeric(df[[col]]))
      n <- length(v)
      if (n > 0) {
        qs <- quantile(v, probs = c(0.25, 0.5, 0.75), names = FALSE)
        stats_list[[length(stats_list) + 1]] <- list(
          column = col,
          count = n,
          mean = round(mean(v), 2),
          std = round(sd(v), 2),
          min = round(min(v), 2),
          q1 = round(qs[1], 2),
          median = round(qs[2], 2),
          q3 = round(qs[3], 2),
          max = round(max(v), 2),
          missing = sum(is.na(df[[col]]))
        )
      }
    }
  }
  
  list(
    status = "success",
    totalRows = nrow(df),
    stats = stats_list,
    time = as.character(Sys.time())
  )
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(rServerSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Analysis Server Settings</h3>
            <p className="text-xs text-slate-500">Connecting to your R Plumber analysis backend</p>
          </div>
        </div>

        {/* Current Status Box */}
        <div className={`p-4 rounded-lg border mb-5 ${
          status.isConnected 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-amber-50 border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 text-sm">
              {status.isConnected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-xs">
                  {status.isConnected ? 'Analysis Server: Connected' : 'Analysis Server: Not Connected'}
                </p>
                <p className="text-xs mt-0.5 opacity-90">
                  {status.isConnected ? (
                    <span>
                      GET /api/health responded in <strong className="font-mono">{status.latencyMs}ms</strong>. Engine: <strong className="font-mono">{status.version || 'R'}</strong> · Last checked: {status.lastChecked}
                    </span>
                  ) : (
                    <span>
                      {status.error || `Could not connect to ${status.baseUrl}/health.`}
                    </span>
                  )}
                </p>
                {status.isConnected && (
                  <p className="text-[11px] text-emerald-800 mt-1">
                    ✓ Available endpoints: <code className="font-mono bg-emerald-100 px-1 rounded">GET /api/health</code> and <code className="font-mono bg-emerald-100 px-1 rounded">POST /api/statistics</code>
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                onClick={handleTestHealth}
                disabled={testingHealth}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-md hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingHealth ? 'animate-spin' : ''}`} />
                {testingHealth ? 'Checking...' : 'Ping Health (GET)'}
              </button>
              {status.isConnected && (
                <button
                  onClick={handleTestStatistics}
                  disabled={testingStats}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-md hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingStats ? 'animate-spin text-blue-600' : ''}`} />
                  {testingStats ? 'Posting...' : 'Test POST /statistics'}
                </button>
              )}
            </div>
          </div>

          {statsTestResult && (
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 text-xs font-mono">
              <span className="font-bold">POST Test Result: </span>
              <span className={statsTestResult.startsWith('Success') ? 'text-emerald-800 font-semibold' : 'text-red-700 font-semibold'}>
                {statsTestResult}
              </span>
            </div>
          )}
        </div>

        {/* URL Input */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            R API Base URL Endpoint
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:8000/api"
              className="flex-1 px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800"
            />
            <button
              onClick={handleTestHealth}
              disabled={testingHealth}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            >
              Update & Test
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1.5">
            Configurable via <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">VITE_R_API_BASE_URL</code>. Defaults to <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">http://localhost:8000/api</code>.
          </p>
        </div>

        {/* Quick Instructions & Code */}
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">R Plumber Server Script (`server.R`)</span>
            <button
              onClick={copyCode}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy R Code'}
            </button>
          </div>
          <pre className="text-xs font-mono bg-slate-900 text-slate-100 p-3 rounded overflow-x-auto max-h-52 leading-relaxed">
            {rServerSnippet}
          </pre>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
