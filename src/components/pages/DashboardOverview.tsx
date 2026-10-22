import React, { useState } from 'react';
import { ConcreteDataRow } from '../../types/concrete';
import { NavPage } from '../layout/Sidebar';
import { parseConcreteCSV } from '../../data/concreteDataset';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
} from 'recharts';
import {
  Database,
  Layers,
  Activity,
  Award,
  ArrowRight,
  TrendingUp,
  GitFork,
  Boxes,
  Sliders,
  Sparkles,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  TableProperties,
  Network,
  FileText,
} from 'lucide-react';

interface DashboardOverviewProps {
  data: ConcreteDataRow[];
  onNavigate: (page: NavPage) => void;
  isDemo: boolean;
  onUpdateData?: (newData: ConcreteDataRow[]) => void;
  onResetData?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  data,
  onNavigate,
  isDemo,
  onUpdateData,
  onResetData,
}) => {
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Compute Key Metrics dynamically from the currently active dataset
  const totalCount = data.length;
  const strengths = data.map(d => d.Strenght_Mpa);
  const meanStrength = totalCount > 0 ? (strengths.reduce((a, b) => a + b, 0) / totalCount).toFixed(2) : '0.00';
  const maxStrength = totalCount > 0 ? Math.max(...strengths).toFixed(2) : '0.00';
  const minStrength = totalCount > 0 ? Math.min(...strengths).toFixed(2) : '0.00';

  // 1. Strength Distribution Bins (Histogram)
  const strengthBins = [
    { range: '0 - 15', min: 0, max: 15, count: 0 },
    { range: '15 - 25', min: 15, max: 25, count: 0 },
    { range: '25 - 35', min: 25, max: 35, count: 0 },
    { range: '35 - 45', min: 35, max: 45, count: 0 },
    { range: '45 - 55', min: 45, max: 55, count: 0 },
    { range: '55 - 65', min: 55, max: 65, count: 0 },
    { range: '65+', min: 65, max: 150, count: 0 },
  ];

  strengths.forEach(s => {
    for (const b of strengthBins) {
      if (s >= b.min && s < b.max) {
        b.count++;
        break;
      }
    }
  });

  // 2. Age vs Average Strength (Hydration Kinetics curve)
  const ageBuckets = [1, 3, 7, 14, 28, 56, 90, 100, 180, 270, 360, 365];
  const ageDataMap = new Map<number, { sum: number; count: number }>();
  data.forEach(d => {
    const bucket = ageBuckets.includes(d.age) ? d.age : (d.age > 100 ? 180 : 28);
    const curr = ageDataMap.get(bucket) || { sum: 0, count: 0 };
    curr.sum += d.Strenght_Mpa;
    curr.count++;
    ageDataMap.set(bucket, curr);
  });

  const ageChartData = ageBuckets
    .filter(age => ageDataMap.has(age) && ageDataMap.get(age)!.count > 0)
    .map(age => ({
      age: `${age}d`,
      avgStrength: Number((ageDataMap.get(age)!.sum / ageDataMap.get(age)!.count).toFixed(2)),
      sampleCount: ageDataMap.get(age)!.count,
    }));

  // 3. Cement vs Strength sample points (up to 75 points for performance & legibility)
  const cementScatterData = data.slice(0, 75).map(d => ({
    cement: d.cement,
    strength: d.Strenght_Mpa,
    age: d.age,
  }));

  // Handle direct CSV upload from Dashboard Overview
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = parseConcreteCSV(text);
        if (result.errors.length > 0) {
          setUploadMessage({ type: 'error', text: result.errors[0] });
        } else if (onUpdateData) {
          onUpdateData(result.rows);
          setUploadMessage({
            type: 'success',
            text: `Loaded ${result.rows.length.toLocaleString()} rows from ${file.name}. Target column 'Strenght_Mpa' and 8 input features verified.`,
          });
        }
      } catch {
        setUploadMessage({
          type: 'error',
          text: 'Unable to parse CSV file. Please ensure comma-separated values with concrete feature headers.',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (onResetData) {
      onResetData();
      setUploadMessage({
        type: 'success',
        text: 'Reset to standard benchmark dataset (Concrete_strength_preprocessed.csv, 1,030 rows).',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcoming Hero Header with Quick CSV Actions */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
              <span>College Data Mining Mini-Project</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 font-mono text-[11px]">ASTM C39 Standards</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Concrete Strength Data Mining Dashboard
            </h2>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              Explore concrete mixture formulations, ingredient distributions, and predictive data mining models (regression, classification, clustering, and association rules) for compressive strength analysis.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Primary CSV Upload Action */}
            <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Upload CSV Dataset</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Reset to Standard Benchmark */}
            {onResetData && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 transition-colors cursor-pointer"
                title="Reset to 1,030-row benchmark dataset"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset Benchmark</span>
              </button>
            )}

            {/* Explore Dataset Shortcut */}
            <button
              type="button"
              onClick={() => onNavigate('explorer')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              <TableProperties className="w-3.5 h-3.5 text-blue-600" />
              <span>Explore Data</span>
            </button>
          </div>
        </div>

        {/* Upload Success or Error Message Banner */}
        {uploadMessage && (
          <div
            className={`mt-4 p-3 rounded-lg border text-xs flex items-center justify-between gap-3 ${
              uploadMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {uploadMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span className="truncate">{uploadMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setUploadMessage(null)}
              className="text-slate-400 hover:text-slate-700 text-xs font-medium shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Dynamic Dataset Status & KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Row Count */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Record Count
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {totalCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">specimens</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 truncate">
            {totalCount === 1030
              ? 'Concrete_strength_preprocessed.csv'
              : `${totalCount} records loaded in memory`}
          </p>
        </div>

        {/* Card 2: Feature Count */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Input Features
            </span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              8
            </span>
            <span className="text-xs text-slate-500">+ 1 Target (Strenght_Mpa)</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 truncate">
            Cement, slag, flyash, water, aggregates & age
          </p>
        </div>

        {/* Card 3: Mean Concrete Strength */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Mean Strength (μ)
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {meanStrength}
            </span>
            <span className="text-xs font-bold text-indigo-600 font-mono">MPa</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 truncate">
            Min: <span className="font-mono text-slate-700">{minStrength}</span> · Max: <span className="font-mono text-slate-700">{maxStrength} MPa</span>
          </p>
        </div>

        {/* Card 4: Maximum Concrete Strength */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Maximum Strength
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {maxStrength}
            </span>
            <span className="text-xs font-bold text-amber-600 font-mono">MPa</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 truncate">
            High-performance concrete formulation
          </p>
        </div>
      </div>

      {/* Main Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strength Distribution Histogram */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Concrete Strength Distribution</h3>
              <p className="text-xs text-slate-500">Frequency histogram across compressive strength classes (Strenght_Mpa)</p>
            </div>
            <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              Mean: {meanStrength} MPa
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strengthBins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: any) => [`${value} samples`, 'Count']}
                  labelFormatter={(label) => `Strength Class: ${label} MPa`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age vs Strength (Hydration Progression) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hydration Kinetics: Curing Age vs Strength</h3>
              <p className="text-xs text-slate-500">Mean compressive strength development across moist curing durations (Days)</p>
            </div>
            <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              28d Standard Benchmark
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ageChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="age" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: any) => [`${value} MPa`, 'Mean Strength']}
                  labelFormatter={(label) => `Curing Age: ${label}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="avgStrength"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#0d9488' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cement vs Strength Bivariate Scatter */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Cement Content vs Compressive Strength</h3>
            <p className="text-xs text-slate-500">Bivariate scatter plot demonstrating positive correlation between cement mass and strength</p>
          </div>
          <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
            Positive Correlation (r ≈ +0.498)
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                type="number"
                dataKey="cement"
                name="Cement"
                unit=" kg/m³"
                tick={{ fontSize: 11, fill: '#64748b' }}
                domain={[80, 560]}
              />
              <YAxis
                type="number"
                dataKey="strength"
                name="Strength"
                unit=" MPa"
                tick={{ fontSize: 11, fill: '#64748b' }}
                domain={[0, 90]}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(val: any, name: any) => [
                  name === 'Cement' ? `${val} kg/m³` : `${val} MPa`,
                  name
                ]}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Scatter name="Concrete Cylinders" data={cementScatterData} fill="#2563eb" fillOpacity={0.65} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Workflow Navigation Shortcuts to Major Features */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Major Feature Shortcuts
          </h3>
          <span className="text-xs text-slate-400">Navigate directly to curriculum modules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card: Dataset Explorer */}
          <button
            type="button"
            onClick={() => onNavigate('explorer')}
            className="p-4 bg-white rounded-xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all text-left cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <TableProperties className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Dataset Explorer</h4>
              <p className="text-xs text-slate-500">Inspect records, descriptive statistics, missing value audit, and CSV export.</p>
            </div>
            <span className="text-[11px] font-semibold text-blue-600 mt-3 block">View Records →</span>
          </button>

          {/* Card: Preprocessing */}
          <button
            type="button"
            onClick={() => onNavigate('preprocessing')}
            className="p-4 bg-white rounded-xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all text-left cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Sliders className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Data Preprocessing</h4>
              <p className="text-xs text-slate-500">Duplicate detection, normalization scaling (Min-Max/Z-Score), and data cleaning.</p>
            </div>
            <span className="text-[11px] font-semibold text-indigo-600 mt-3 block">Clean Data →</span>
          </button>

          {/* Card: Data Warehouse & OLAP */}
          <button
            type="button"
            onClick={() => onNavigate('olap')}
            className="p-4 bg-white rounded-xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all text-left cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-lg group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <Boxes className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Warehouse & OLAP</h4>
              <p className="text-xs text-slate-500">Star-schema architecture, roll-up, drill-down, slice, dice, and pivot operations.</p>
            </div>
            <span className="text-[11px] font-semibold text-teal-600 mt-3 block">Cube Analysis →</span>
          </button>

          {/* Card: Regression Modeling */}
          <button
            type="button"
            onClick={() => onNavigate('regression')}
            className="p-4 bg-white rounded-xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all text-left cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Regression Models</h4>
              <p className="text-xs text-slate-500">Linear regression, R² metrics, residual plots, and interactive strength calculator.</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 mt-3 block">Predict Strength →</span>
          </button>

          {/* Card: Classification */}
          <button
            type="button"
            onClick={() => onNavigate('classification')}
            className="p-4 bg-white rounded-xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all text-left cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <GitFork className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Classification</h4>
              <p className="text-xs text-slate-500">Decision Tree (CART) and Gaussian Naive Bayes concrete grade prediction.</p>
            </div>
            <span className="text-[11px] font-semibold text-purple-600 mt-3 block">Classify Grades →</span>
          </button>

          {/* Card: Clustering */}
          <button
            type="button"
            onClick={() => onNavigate('clustering')}
            className="p-4 bg-white rounded-xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all text-left cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Sparkles className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Clustering Analysis</h4>
              <p className="text-xs text-slate-500">K-Means, Agglomerative clustering, PCA projections, and silhouette scores.</p>
            </div>
            <span className="text-[11px] font-semibold text-amber-600 mt-3 block">Discover Clusters →</span>
          </button>

          {/* Card: Association Rules */}
          <button
            type="button"
            onClick={() => onNavigate('association')}
            className="p-4 bg-white rounded-xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all text-left cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <Network className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Association Rules</h4>
              <p className="text-xs text-slate-500">Apriori algorithm, frequent mix patterns, support, confidence, and lift metrics.</p>
            </div>
            <span className="text-[11px] font-semibold text-rose-600 mt-3 block">Extract Rules →</span>
          </button>

          {/* Card: Experiment Reports */}
          <button
            type="button"
            onClick={() => onNavigate('reports')}
            className="p-4 bg-white rounded-xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all text-left cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-sky-50 text-sky-600 rounded-lg group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <FileText className="w-4 h-4" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">9 Lab Reports</h4>
              <p className="text-xs text-slate-500">Comprehensive curriculum experiment reports with methodology and verified R code.</p>
            </div>
            <span className="text-[11px] font-semibold text-sky-600 mt-3 block">View All Labs →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
