import React, { useState, useMemo } from 'react';
import { ConcreteDataRow, ConcreteFeature } from '../../types/concrete';
import {
  CONCRETE_COLUMNS,
  calculatePearsonCorrelation,
  calculateColumnStats,
} from '../../data/concreteDataset';
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
  Legend,
} from 'recharts';
import {
  BarChart2,
  GitCommit,
  Grid,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DataVisualizationProps {
  data: ConcreteDataRow[];
  isDemo: boolean;
}

export const DataVisualization: React.FC<DataVisualizationProps> = ({ data, isDemo }) => {
  const [activeTab, setActiveTab] = useState<'histogram' | 'scatter' | 'correlation' | 'boxplot'>('correlation');

  // Histogram state
  const [histFeature, setHistFeature] = useState<ConcreteFeature>('Strenght_Mpa');
  const [binCount, setBinCount] = useState<number>(8);

  // Scatter state
  const [scatterX, setScatterX] = useState<ConcreteFeature>('cement');
  const [scatterY, setScatterY] = useState<ConcreteFeature>('Strenght_Mpa');

  // Correlation Matrix calculation across all 9 columns
  const allFeatures: ConcreteFeature[] = [
    'cement',
    'slag',
    'flyash',
    'water',
    'superplasticizer',
    'coarseaggregate',
    'fineaggregate',
    'age',
    'Strenght_Mpa',
  ];

  const correlationMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};
    allFeatures.forEach(rowFeat => {
      matrix[rowFeat] = {};
      allFeatures.forEach(colFeat => {
        matrix[rowFeat][colFeat] = calculatePearsonCorrelation(data, rowFeat, colFeat);
      });
    });
    return matrix;
  }, [data]);

  // Histogram calculation
  const histData = useMemo(() => {
    const vals = data.map(d => d[histFeature]).filter(v => !isNaN(v));
    if (vals.length === 0) return [];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const step = (max - min) / binCount || 1;

    const bins = Array.from({ length: binCount }, (_, i) => ({
      range: `${(min + i * step).toFixed(1)} - ${(min + (i + 1) * step).toFixed(1)}`,
      minVal: min + i * step,
      maxVal: min + (i + 1) * step,
      count: 0,
    }));

    vals.forEach(v => {
      let placed = false;
      for (let i = 0; i < bins.length; i++) {
        if (v >= bins[i].minVal && (i === bins.length - 1 ? v <= bins[i].maxVal : v < bins[i].maxVal)) {
          bins[i].count++;
          placed = true;
          break;
        }
      }
      if (!placed && bins.length > 0) bins[bins.length - 1].count++;
    });

    return bins;
  }, [data, histFeature, binCount]);

  // Scatter plot data
  const scatterData = useMemo(() => {
    return data.slice(0, 80).map(d => ({
      x: d[scatterX],
      y: d[scatterY],
      age: d.age,
      id: d.id,
    }));
  }, [data, scatterX, scatterY]);

  // Boxplot quantile summary by Curing Age Bracket
  const boxplotAgeData = useMemo(() => {
    const groups: Record<string, number[]> = {
      'Early (<=7d)': [],
      'Standard (8-28d)': [],
      'Medium (29-90d)': [],
      'Long (>90d)': [],
    };

    data.forEach(d => {
      if (d.age <= 7) groups['Early (<=7d)'].push(d.Strenght_Mpa);
      else if (d.age <= 28) groups['Standard (8-28d)'].push(d.Strenght_Mpa);
      else if (d.age <= 90) groups['Medium (29-90d)'].push(d.Strenght_Mpa);
      else groups['Long (>90d)'].push(d.Strenght_Mpa);
    });

    const getQuantiles = (arr: number[]) => {
      if (arr.length === 0) return { min: 0, q1: 0, median: 0, q3: 0, max: 0, count: 0 };
      const sorted = [...arr].sort((a, b) => a - b);
      const n = sorted.length;
      return {
        min: sorted[0],
        q1: sorted[Math.floor(n * 0.25)],
        median: sorted[Math.floor(n * 0.5)],
        q3: sorted[Math.floor(n * 0.75)],
        max: sorted[n - 1],
        count: n,
      };
    };

    return Object.entries(groups).map(([bracket, values]) => ({
      bracket,
      ...getQuantiles(values),
    }));
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('correlation')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'correlation'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Pearson Correlation Heatmap Matrix
        </button>
        <button
          onClick={() => setActiveTab('histogram')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'histogram'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Dynamic Feature Histograms
        </button>
        <button
          onClick={() => setActiveTab('scatter')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'scatter'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Bivariate Scatter & Relationship
        </button>
        <button
          onClick={() => setActiveTab('boxplot')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'boxplot'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Quantile Boxplot Distributions
        </button>
      </div>

      {/* TAB 1: Pearson Correlation Heatmap */}
      {activeTab === 'correlation' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pearson Linear Correlation Matrix</h3>
              <p className="text-xs text-slate-500">Pairwise correlation coefficients (r) between all 8 ingredients and target Strenght_Mpa</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 font-mono text-[11px] text-blue-700">
                <span className="w-3 h-3 bg-blue-600 rounded inline-block" /> Strong Positive (+1.0)
              </span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-amber-700">
                <span className="w-3 h-3 bg-amber-500 rounded inline-block" /> Strong Negative (-1.0)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2.5 px-3 text-left bg-slate-50 font-bold text-slate-700">Variable</th>
                  {allFeatures.map(f => (
                    <th key={f} className={`py-2.5 px-2 text-center text-[11px] font-bold ${f === 'Strenght_Mpa' ? 'bg-blue-50 text-blue-900' : 'text-slate-700'}`}>
                      {f === 'Strenght_Mpa' ? 'Strength' : f.slice(0, 7)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allFeatures.map(rowFeat => (
                  <tr key={rowFeat}>
                    <td className={`py-2 px-3 text-left font-bold text-[11px] ${rowFeat === 'Strenght_Mpa' ? 'bg-blue-50 text-blue-900 font-extrabold' : 'text-slate-800'}`}>
                      {rowFeat}
                    </td>
                    {allFeatures.map(colFeat => {
                      const r = correlationMatrix[rowFeat]?.[colFeat] ?? 0;
                      const isSelf = rowFeat === colFeat;
                      const isTarget = rowFeat === 'Strenght_Mpa' || colFeat === 'Strenght_Mpa';

                      // Color scale based on r
                      let bgStyle = 'bg-slate-50 text-slate-400';
                      if (!isSelf) {
                        if (r > 0.4) bgStyle = 'bg-blue-600 text-white font-bold';
                        else if (r > 0.2) bgStyle = 'bg-blue-100 text-blue-900 font-semibold';
                        else if (r > 0) bgStyle = 'bg-blue-50/60 text-blue-800';
                        else if (r < -0.4) bgStyle = 'bg-amber-600 text-white font-bold';
                        else if (r < -0.2) bgStyle = 'bg-amber-100 text-amber-900 font-semibold';
                        else if (r < 0) bgStyle = 'bg-amber-50/60 text-amber-800';
                      } else {
                        bgStyle = 'bg-slate-200 text-slate-800 font-bold';
                      }

                      return (
                        <td
                          key={colFeat}
                          className={`py-2 px-2 text-center tabular-nums transition-colors ${bgStyle} ${isTarget && !isSelf ? 'border border-blue-300' : ''}`}
                          title={`${rowFeat} vs ${colFeat}: r = ${r}`}
                        >
                          {r.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Key Correlation Insights:</p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              <li><span className="font-bold text-blue-700">Cement</span> has the highest positive correlation (+0.50) with concrete compressive strength.</li>
              <li><span className="font-bold text-amber-700">Water</span> shows a negative correlation (-0.29) due to capillary porosity from excess hydration water.</li>
              <li><span className="font-bold text-blue-700">Superplasticizer</span> & <span className="font-bold text-slate-700">Water</span> have a strong inverse relationship (-0.66), reflecting water-reduction chemistry.</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 2: Dynamic Feature Histogram */}
      {activeTab === 'histogram' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Feature Histogram & Binning</h3>
              <p className="text-xs text-slate-500">Distribution frequencies across selected component intervals</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-600">Feature:</span>
                <select
                  value={histFeature}
                  onChange={(e: any) => setHistFeature(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white font-mono text-slate-800"
                >
                  {CONCRETE_COLUMNS.map(c => (
                    <option key={c.key} value={c.key}>{c.label} ({c.key})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-600">Bins:</span>
                <select
                  value={binCount}
                  onChange={(e) => setBinCount(Number(e.target.value))}
                  className="px-2 py-1 text-xs border border-slate-300 rounded-md bg-white font-mono text-slate-800"
                >
                  <option value={6}>6 Bins</option>
                  <option value={8}>8 Bins</option>
                  <option value={10}>10 Bins</option>
                  <option value={12}>12 Bins</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} test samples`, 'Count']}
                  labelFormatter={(lbl) => `Interval: ${lbl}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 3: Bivariate Scatter */}
      {activeTab === 'scatter' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Bivariate Scatter & Interaction Analysis</h3>
              <p className="text-xs text-slate-500">Cross-plot any two variables to detect non-linear dependencies and clusters</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-600">X-Axis:</span>
                <select
                  value={scatterX}
                  onChange={(e: any) => setScatterX(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-300 rounded-md bg-white font-mono"
                >
                  {CONCRETE_COLUMNS.map(c => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-slate-600">Y-Axis:</span>
                <select
                  value={scatterY}
                  onChange={(e: any) => setScatterY(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-300 rounded-md bg-white font-mono"
                >
                  {CONCRETE_COLUMNS.map(c => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name={scatterX}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name={scatterY}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(val: any, name: any) => [`${val}`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Scatter name="Concrete Cylinders" data={scatterData} fill="#0d9488" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 4: Quantile Boxplot */}
      {activeTab === 'boxplot' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Quantile Dispersion across Curing Age Groups</h3>
            <p className="text-xs text-slate-500">Summary distribution (Min, Q1, Median, Q3, Max) of Strenght_Mpa across curing intervals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {boxplotAgeData.map(b => (
              <div key={b.bracket} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-xs font-bold text-slate-800">{b.bracket}</span>
                <p className="text-[11px] text-slate-500">Sample count: {b.count}</p>
                <div className="space-y-1 text-xs font-mono pt-2 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Max:</span>
                    <span className="font-bold">{b.max.toFixed(1)} MPa</span>
                  </div>
                  <div className="flex justify-between text-blue-800">
                    <span>Q3 (75%):</span>
                    <span>{b.q3.toFixed(1)} MPa</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 bg-white p-1 rounded">
                    <span>Median:</span>
                    <span>{b.median.toFixed(1)} MPa</span>
                  </div>
                  <div className="flex justify-between text-blue-800">
                    <span>Q1 (25%):</span>
                    <span>{b.q1.toFixed(1)} MPa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Min:</span>
                    <span className="font-bold">{b.min.toFixed(1)} MPa</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
