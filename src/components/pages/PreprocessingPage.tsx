import React, { useState, useMemo } from 'react';
import { ConcreteDataRow, PreprocessingOptions, PreprocessingSummary } from '../../types/concrete';
import { concreteApi } from '../../services/api';
import {
  Sliders,
  Check,
  RefreshCw,
  ArrowRight,
  Database,
  BarChart,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface PreprocessingPageProps {
  data: ConcreteDataRow[];
  onApplyProcessedData: (processedData: ConcreteDataRow[]) => void;
  isDemo: boolean;
}

export const PreprocessingPage: React.FC<PreprocessingPageProps> = ({
  data,
  onApplyProcessedData,
  isDemo,
}) => {
  const [options, setOptions] = useState<PreprocessingOptions>({
    removeDuplicates: true,
    missingHandling: 'drop',
    scalingMethod: 'minmax',
    outlierRemoval: false,
  });

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<PreprocessingSummary | null>(null);
  const [previewRows, setPreviewRows] = useState<ConcreteDataRow[] | null>(null);
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);

  // Dynamically calculate duplicate rows count in the active dataset
  const actualDuplicateCount = useMemo(() => {
    const seen = new Set<string>();
    let count = 0;
    for (const row of data) {
      const key = `${row.cement}_${row.slag}_${row.flyash}_${row.water}_${row.superplasticizer}_${row.coarseaggregate}_${row.fineaggregate}_${row.age}`;
      if (seen.has(key)) count++;
      else seen.add(key);
    }
    return count;
  }, [data]);

  const handleRunPipeline = async () => {
    setLoading(true);
    setAppliedMessage(null);
    const result = await concreteApi.runPreprocessing(data, options);
    setSummary(result.summary);
    setPreviewRows(result.processedData.slice(0, 5));
    setLoading(false);
  };

  const handleApplyToActive = async () => {
    setLoading(true);
    const result = await concreteApi.runPreprocessing(data, options);
    onApplyProcessedData(result.processedData);
    setSummary(result.summary);
    setPreviewRows(result.processedData.slice(0, 5));
    setAppliedMessage(`Applied pipeline: active dataset updated to ${result.processedData.length.toLocaleString()} rows (${result.summary.duplicatesRemoved} duplicates removed, ${options.scalingMethod.toUpperCase()} scaling applied).`);
    setLoading(false);
  };

  const estimatedProcessedCount = summary
    ? summary.processedRows
    : data.length - (options.removeDuplicates ? actualDuplicateCount : 0);

  return (
    <div className="space-y-6">
      {/* Configuration Controls Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Data Mining Preprocessing Pipeline Configuration
            </h3>
            <p className="text-xs text-slate-500">
              Prepare raw concrete mixture parameters for distance-based clustering and gradient-based models
            </p>
          </div>
          {summary && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Pipeline Computed
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Duplicate Handling */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              1. Duplicate Sample Policy
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.removeDuplicates}
                  onChange={(e) => setOptions(o => ({ ...o, removeDuplicates: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-900">Remove identical cylinder tests</span>
              </label>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Eliminates repeated experimental cylinder replicates ({actualDuplicateCount} duplicates in active dataset) to prevent training bias.
              </p>
            </div>
          </div>

          {/* 2. Missing Value Handling */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              2. Missing Value Imputation
            </label>
            <select
              value={options.missingHandling}
              onChange={(e: any) => setOptions(o => ({ ...o, missingHandling: e.target.value }))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="none">None (Preserve current values)</option>
              <option value="drop">Drop Rows with NA / Incomplete</option>
              <option value="mean">Mean Imputation (Column mean)</option>
              <option value="median">Median Imputation (Robust to outliers)</option>
            </select>
            <p className="text-[11px] text-slate-500">
              Handles null or blank entries if custom batches or field CSV logs are uploaded.
            </p>
          </div>

          {/* 3. Feature Scaling */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              3. Feature Normalization
            </label>
            <select
              value={options.scalingMethod}
              onChange={(e: any) => setOptions(o => ({ ...o, scalingMethod: e.target.value }))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="none">No Scaling (Keep physical kg/m³ units)</option>
              <option value="minmax">Min-Max Normalization [0, 1] (Recommended for K-Means)</option>
              <option value="zscore">Z-Score Standardization (μ=0, σ=1)</option>
            </select>
            <p className="text-[11px] text-slate-500">
              Balances large aggregate weights (~1000 kg) against superplasticizer (~10 kg) without altering target <code className="font-mono">Strenght_Mpa</code>.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Target column <code className="font-bold text-blue-700">Strenght_Mpa</code> is strictly preserved in original MPa units for physical interpretation.
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRunPipeline}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Preview Transformation</span>
            </button>
            <button
              type="button"
              onClick={handleApplyToActive}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Pipeline to Active Dataset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Applied Feedback Notice */}
      {appliedMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{appliedMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setAppliedMessage(null)}
            className="text-xs font-semibold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Explicit Preprocessing Status Notice */}
      <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">Model Status:</span>
          <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
            Preview only — this feature is not connected to the analysis server yet.
          </span>
          <span className="text-slate-500 hidden md:inline">
            (Client-side pipeline demonstration)
          </span>
        </div>
      </div>

      {/* Before and After Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Initial Observations</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">{data.length.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 mt-1">Raw active specimens in memory</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Processed Output Rows</span>
          <p className="text-xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
            {estimatedProcessedCount.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {summary ? `${summary.duplicatesRemoved} duplicates removed` : `${actualDuplicateCount} duplicates eligible for removal`}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Scaling Technique</span>
          <p className="text-sm font-bold font-mono text-slate-800 mt-2 truncate">
            {options.scalingMethod === 'minmax' ? 'Min-Max [0, 1]' : options.scalingMethod === 'zscore' ? 'Z-Score Standard' : 'Unscaled Physical'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Applied to 8 input features</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Target Integrity</span>
          <p className="text-sm font-bold font-mono text-blue-700 mt-2">
            Strenght_Mpa (Preserved)
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Exact column name & ASTM units retained</p>
        </div>
      </div>

      {/* Transformed Data Preview */}
      {previewRows && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Transformed Feature Preview (First 5 Rows)
            </h4>
            <span className="text-xs font-mono text-slate-500">
              Scaling: {options.scalingMethod.toUpperCase()}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-mono">
                <tr>
                  <th className="py-2.5 px-3">id</th>
                  <th className="py-2.5 px-3 text-right">cement</th>
                  <th className="py-2.5 px-3 text-right">slag</th>
                  <th className="py-2.5 px-3 text-right">flyash</th>
                  <th className="py-2.5 px-3 text-right">water</th>
                  <th className="py-2.5 px-3 text-right">superplasticizer</th>
                  <th className="py-2.5 px-3 text-right">coarseagg</th>
                  <th className="py-2.5 px-3 text-right">fineagg</th>
                  <th className="py-2.5 px-3 text-right">age</th>
                  <th className="py-2.5 px-3 text-right font-bold text-blue-700 bg-blue-50/60">Strenght_Mpa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums text-slate-700">
                {previewRows.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-400">{r.id}</td>
                    <td className="py-2 px-3 text-right">{r.cement}</td>
                    <td className="py-2 px-3 text-right">{r.slag}</td>
                    <td className="py-2 px-3 text-right">{r.flyash}</td>
                    <td className="py-2 px-3 text-right">{r.water}</td>
                    <td className="py-2 px-3 text-right">{r.superplasticizer}</td>
                    <td className="py-2 px-3 text-right">{r.coarseaggregate}</td>
                    <td className="py-2 px-3 text-right">{r.fineaggregate}</td>
                    <td className="py-2 px-3 text-right">{r.age}</td>
                    <td className="py-2 px-3 text-right font-bold text-blue-700 bg-blue-50/30">{r.Strenght_Mpa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
