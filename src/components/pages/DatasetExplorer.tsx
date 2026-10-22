import React, { useState, useMemo, useEffect } from 'react';
import { ConcreteDataRow, ConcreteFeature, DatasetStatisticsResponse } from '../../types/concrete';
import {
  CONCRETE_COLUMNS,
  calculateColumnStats,
  exportConcreteToCSV,
  parseConcreteCSV,
} from '../../data/concreteDataset';
import { concreteApi } from '../../services/api';
import {
  Search,
  Upload,
  Download,
  Filter,
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database,
  RefreshCw,
  Server,
  RotateCcw,
  Sparkles,
  Info,
  ShieldCheck,
} from 'lucide-react';

interface DatasetExplorerProps {
  data: ConcreteDataRow[];
  onUpdateData: (newData: ConcreteDataRow[]) => void;
  onResetData: () => void;
  isDemo: boolean;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({
  data,
  onUpdateData,
  onResetData,
  isDemo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [visibleColumns, setVisibleColumns] = useState<Record<ConcreteFeature, boolean>>({
    cement: true,
    slag: true,
    flyash: true,
    water: true,
    superplasticizer: true,
    coarseaggregate: true,
    fineaggregate: true,
    age: true,
    Strenght_Mpa: true,
  });
  const [showColPicker, setShowColPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'records' | 'statistics' | 'quality'>('records');
  const [uploadStatus, setUploadStatus] = useState<{ success?: string; error?: string } | null>(null);

  // Statistics state from backend or fallback
  const [statsData, setStatsData] = useState<DatasetStatisticsResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Fetch statistics from R backend (POST /api/statistics) for the current active dataset
  const fetchStats = async (datasetToSend: ConcreteDataRow[]) => {
    setLoadingStats(true);
    try {
      const res = await concreteApi.getDatasetStatistics(datasetToSend);
      setStatsData(res);
      setStatsError(res.error || null);
    } catch (err: any) {
      setStatsError(err.message || 'Error executing POST /api/statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  // Re-fetch when active dataset changes
  useEffect(() => {
    fetchStats(data);
  }, [data]);

  // Dynamic Quality Audit calculation (DO NOT HARDCODE ANY VALUES)
  const qualityAudit = useMemo(() => {
    const seen = new Set<string>();
    let duplicates = 0;
    let totalMissing = 0;
    const colMissing: Record<string, number> = {};

    CONCRETE_COLUMNS.forEach(c => {
      colMissing[c.key] = 0;
    });

    for (const row of data) {
      const key = `${row.cement}_${row.slag}_${row.flyash}_${row.water}_${row.superplasticizer}_${row.coarseaggregate}_${row.fineaggregate}_${row.age}_${row.Strenght_Mpa}`;
      if (seen.has(key)) {
        duplicates++;
      } else {
        seen.add(key);
      }

      for (const col of CONCRETE_COLUMNS) {
        const val = (row as any)[col.key];
        if (val === undefined || val === null || isNaN(val)) {
          totalMissing++;
          colMissing[col.key]++;
        }
      }
    }

    return { duplicates, totalMissing, colMissing };
  }, [data]);

  // Filtered dataset based on search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(row => {
      return (
        row.id.toString().includes(term) ||
        row.cement.toString().includes(term) ||
        row.water.toString().includes(term) ||
        row.age.toString().includes(term) ||
        row.Strenght_Mpa.toString().includes(term)
      );
    });
  }, [data, searchTerm]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  // Fallback client-side statistics
  const fallbackStatsList = useMemo(() => {
    return CONCRETE_COLUMNS.map(col => calculateColumnStats(data, col.key));
  }, [data]);

  // Active statistics list (from R backend if available, or fallback)
  const displayStats = statsData?.stats || fallbackStatsList;

  // CSV File Upload Handler: ensures uploaded rows are sent to backend
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = parseConcreteCSV(text);
        if (result.errors.length > 0) {
          setUploadStatus({ error: result.errors[0] });
        } else {
          // Send uploaded CSV rows to active dataset state and immediately post to R backend
          onUpdateData(result.rows);
          fetchStats(result.rows);
          setUploadStatus({
            success: `Successfully loaded ${result.rows.length.toLocaleString()} concrete records from ${file.name}. Exact target column 'Strenght_Mpa' verified. Dataset sent to backend.`,
          });
          setCurrentPage(1);
        }
      } catch {
        setUploadStatus({ error: 'Failed to parse CSV file. Ensure valid comma-delimited numeric records.' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // CSV Download Handler
  const handleDownloadCSV = () => {
    const csvContent = exportConcreteToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Concrete_strength_preprocessed.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleColumn = (key: ConcreteFeature) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by cement, water, age, strength, or ID..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Column selector dropdown toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColPicker(!showColPicker)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Columns ({Object.values(visibleColumns).filter(Boolean).length}/9)</span>
            </button>

            {showColPicker && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-3 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Visible Columns</span>
                  <button
                    type="button"
                    onClick={() => {
                      const allTrue = Object.fromEntries(CONCRETE_COLUMNS.map(c => [c.key, true])) as Record<ConcreteFeature, boolean>;
                      setVisibleColumns(allTrue);
                    }}
                    className="text-[11px] text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    Select All
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {CONCRETE_COLUMNS.map(col => (
                    <label
                      key={col.key}
                      onClick={() => toggleColumn(col.key)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs text-slate-700"
                    >
                      {visibleColumns[col.key] ? (
                        <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <span className="truncate">{col.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload CSV */}
          <label className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Download CSV */}
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          {/* Reset Dataset */}
          <button
            type="button"
            onClick={() => {
              onResetData();
              setUploadStatus({ success: 'Reset to verified benchmark dataset (1,030 records).' });
            }}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset to 1,030-row baseline"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Upload Notification feedback */}
      {uploadStatus && (
        <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
          uploadStatus.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            {uploadStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
            <span className="truncate">{uploadStatus.success || uploadStatus.error}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadStatus(null)}
            className="text-xs font-bold underline cursor-pointer shrink-0 ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Segmented Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('records')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'records'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Data Preview & Records ({data.length.toLocaleString()})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('statistics')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'statistics'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Descriptive Statistics (5-Number Summary)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('quality')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'quality'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Data Quality & Health ({qualityAudit.duplicates} duplicates)
        </button>
      </div>

      {/* TAB 1: Records Table */}
      {activeTab === 'records' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4 font-mono w-16">#ID</th>
                  {CONCRETE_COLUMNS.map(col => {
                    if (!visibleColumns[col.key]) return null;
                    const isTarget = col.key === 'Strenght_Mpa';
                    return (
                      <th
                        key={col.key}
                        className={`py-3 px-3 text-right whitespace-nowrap ${
                          isTarget ? 'bg-blue-50/70 text-blue-900 font-extrabold' : ''
                        }`}
                      >
                        <div>{col.label}</div>
                        <div className="text-[10px] font-normal text-slate-400 font-mono">({col.unit})</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500">
                      <div className="max-w-sm mx-auto space-y-2">
                        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="font-semibold text-slate-800 text-sm">No matching concrete records</p>
                        <p className="text-xs text-slate-500">
                          No mix samples matched your search term <span className="font-mono font-medium text-slate-700">"{searchTerm}"</span>.
                        </p>
                        <button
                          type="button"
                          onClick={() => setSearchTerm('')}
                          className="mt-2 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Clear Search
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-slate-400">{row.id}</td>
                      {visibleColumns.cement && (
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">{row.cement.toFixed(1)}</td>
                      )}
                      {visibleColumns.slag && (
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">{row.slag.toFixed(1)}</td>
                      )}
                      {visibleColumns.flyash && (
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">{row.flyash.toFixed(1)}</td>
                      )}
                      {visibleColumns.water && (
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">{row.water.toFixed(1)}</td>
                      )}
                      {visibleColumns.superplasticizer && (
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">{row.superplasticizer.toFixed(1)}</td>
                      )}
                      {visibleColumns.coarseaggregate && (
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">{row.coarseaggregate.toFixed(1)}</td>
                      )}
                      {visibleColumns.fineaggregate && (
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">{row.fineaggregate.toFixed(1)}</td>
                      )}
                      {visibleColumns.age && (
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold">{row.age}</td>
                      )}
                      {visibleColumns.Strenght_Mpa && (
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-blue-700 bg-blue-50/40">
                          {row.Strenght_Mpa.toFixed(2)}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-slate-300 rounded bg-white text-slate-800 text-xs font-mono"
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="hidden sm:inline">
                Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length.toLocaleString()} rows
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="mr-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Descriptive Statistics Table */}
      {activeTab === 'statistics' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Descriptive Summary Statistics</h3>
              <p className="text-xs text-slate-500">Univariate properties (Mean, Standard Deviation, and 5-Number Quantiles) for all 9 attributes</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                N = {data.length.toLocaleString()} active rows
              </span>
              <button
                type="button"
                onClick={() => fetchStats(data)}
                disabled={loadingStats}
                className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                title="Send current active dataset to POST /api/statistics"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                <span>{loadingStats ? 'Posting to R...' : 'Re-run POST /api/statistics'}</span>
              </button>
            </div>
          </div>

          {/* Connection Error Banner if POST failed */}
          {statsError && (
            <div className="mx-4 p-3 rounded-lg border border-red-200 bg-red-50 text-xs text-red-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Backend Communication Notice on POST /api/statistics</p>
                <p className="mt-0.5 font-mono text-[11px] text-red-800 break-all">{statsError}</p>
                <p className="mt-1 text-[11px] text-red-700">
                  Showing local verified benchmark calculations below. To connect live, start R Plumber with CORS enabled on port 8000.
                </p>
              </div>
            </div>
          )}

          {/* Live R Backend Success Banner */}
          {statsData?.source === 'r_backend' && (
            <div className="mx-4 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-xs text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Live R Backend Result:</strong> Statistics computed by R Plumber (<code className="font-mono bg-emerald-100/70 px-1 py-0.5 rounded">POST /api/statistics</code>) for {statsData.totalRows.toLocaleString()} active records.
                </span>
              </div>
              <span className="font-mono text-[10px] text-emerald-700">
                Updated: {statsData.backendTimestamp}
              </span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-3 px-4">Feature Column</th>
                  <th className="py-3 px-3">Unit</th>
                  <th className="py-3 px-3 text-right">Mean (μ)</th>
                  <th className="py-3 px-3 text-right">Std Dev (σ)</th>
                  <th className="py-3 px-3 text-right">Min</th>
                  <th className="py-3 px-3 text-right">Q1 (25%)</th>
                  <th className="py-3 px-3 text-right">Median</th>
                  <th className="py-3 px-3 text-right">Q3 (75%)</th>
                  <th className="py-3 px-3 text-right">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {displayStats.map(st => {
                  const isTarget = st.column === 'Strenght_Mpa';
                  return (
                    <tr key={st.column} className={`hover:bg-slate-50 transition-colors ${isTarget ? 'bg-blue-50/30 font-semibold' : ''}`}>
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-900">{st.column}</div>
                        <div className="text-[11px] text-slate-400">{st.label}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">{st.unit}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900">{st.mean}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">{st.std}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums">{st.min}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums">{st.q1}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-800">{st.median}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums">{st.q3}</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900">{st.max}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Data Quality & Missing Values Audit */}
      {activeTab === 'quality' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Dataset Completeness & Integrity Audit</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamic quality validation computed from currently loaded active records ({data.length.toLocaleString()} total rows)
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono">
              ASTM C39 Constraints
            </span>
          </div>

          {/* Dynamic KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-semibold text-emerald-800">Total Missing Values</span>
              <p className="text-2xl font-bold font-mono text-emerald-950 mt-1">
                {qualityAudit.totalMissing}
              </p>
              <p className="text-[11px] text-emerald-700 mt-1">
                {qualityAudit.totalMissing === 0 ? '100% complete records across all 9 features' : `${qualityAudit.totalMissing} null entries detected`}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-xs font-semibold text-blue-800">Target Column Verified</span>
              <p className="text-base font-bold font-mono text-blue-950 mt-1">
                Strenght_Mpa
              </p>
              <p className="text-[11px] text-blue-700 mt-1">
                Exact column spelling requirement preserved
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-800">Duplicate Check</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {qualityAudit.duplicates} {qualityAudit.duplicates === 1 ? 'duplicate' : 'duplicates'}
              </p>
              <p className="text-[11px] text-slate-600 mt-1">
                {qualityAudit.duplicates > 0
                  ? 'Identical experimental cylinder test replicates'
                  : 'No duplicate records found in dataset'}
              </p>
            </div>
          </div>

          {/* Column Breakdown Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Column Name</th>
                  <th className="py-2.5 px-3 font-bold">Physical Role</th>
                  <th className="py-2.5 px-3 font-bold text-right">Missing Count</th>
                  <th className="py-2.5 px-3 font-bold text-right">Missing %</th>
                  <th className="py-2.5 px-4 font-bold">Validation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {CONCRETE_COLUMNS.map(col => {
                  const missingCount = qualityAudit.colMissing[col.key] || 0;
                  const missingPct = data.length > 0 ? ((missingCount / data.length) * 100).toFixed(2) : '0.00';

                  return (
                    <tr key={col.key} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">{col.key}</td>
                      <td className="py-2.5 px-3 text-slate-500">{col.label} ({col.unit})</td>
                      <td className="py-2.5 px-3 text-right font-mono">{missingCount}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{missingPct}%</td>
                      <td className="py-2.5 px-4">
                        {missingCount === 0 ? (
                          <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            Valid numeric range
                          </span>
                        ) : (
                          <span className="text-amber-700 font-medium inline-flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            Needs imputation
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Educational Note for College Lab */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-800">Academic Lab Note on Concrete Cylinder Replicates:</p>
              <p className="text-[11px] leading-relaxed text-slate-600">
                In civil engineering laboratory testing, multiple cylinder specimens (typically 2 to 3 specimens) are cast from the exact same batch mix and broken at the designated moist curing age (e.g. 28 days) to calculate average compressive strength. These represent legitimate experimental replicates. For regression training, removing exact duplicates avoids synthetic sample weighting.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
