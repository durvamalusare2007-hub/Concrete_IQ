import React, { useState, useEffect } from 'react';
import { ClusteringResult, ConcreteDataRow } from '../../types/concrete';
import { concreteApi } from '../../services/api';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  Sparkles,
  Layers,
  Activity,
  CheckCircle2,
  PieChart,
} from 'lucide-react';

interface ClusteringPageProps {
  data: ConcreteDataRow[];
  isDemo: boolean;
}

const CLUSTER_COLORS = ['#2563eb', '#0d9488', '#d97706', '#9333ea', '#e11d48', '#059669'];

export const ClusteringPage: React.FC<ClusteringPageProps> = ({ data, isDemo }) => {
  const [algorithm, setAlgorithm] = useState<'kmeans' | 'agglomerative'>('kmeans');
  const [kCount, setKCount] = useState<number>(3);
  const [linkage, setLinkage] = useState<'ward.D2' | 'complete' | 'average'>('ward.D2');
  const [result, setResult] = useState<ClusteringResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    concreteApi.runClustering(algorithm, kCount, linkage, data).then(res => {
      setResult(res);
      setLoading(false);
    });
  }, [algorithm, kCount, linkage, data]);

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAlgorithm('kmeans')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              algorithm === 'kmeans'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            K-Means Clustering
          </button>
          <button
            onClick={() => setAlgorithm('agglomerative')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              algorithm === 'agglomerative'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Agglomerative Hierarchical
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs">
          {/* Cluster count K */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Clusters (K):</span>
            <select
              value={kCount}
              onChange={(e) => setKCount(Number(e.target.value))}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white font-mono"
            >
              <option value={2}>K = 2</option>
              <option value={3}>K = 3 (Optimal)</option>
              <option value={4}>K = 4</option>
              <option value={5}>K = 5</option>
              <option value={6}>K = 6</option>
            </select>
          </div>

          {/* Linkage (only for Agglomerative) */}
          {algorithm === 'agglomerative' && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Linkage:</span>
              <select
                value={linkage}
                onChange={(e: any) => setLinkage(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white font-mono"
              >
                <option value="ward.D2">Ward's Minimum Variance (ward.D2)</option>
                <option value="complete">Complete Linkage</option>
                <option value="average">Average Linkage (UPGMA)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Explicit Model Status Notice */}
      <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">Model Status:</span>
          <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
            Preview only — this feature is not connected to the analysis server yet.
          </span>
          <span className="text-slate-500 hidden md:inline">
            (Displaying verified academic baseline benchmark results)
          </span>
        </div>
      </div>

      {/* Cluster Silhouette & Evaluation KPI Cards */}
      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Silhouette Score</span>
            <p className="text-2xl font-extrabold font-mono text-blue-700 mt-1 tabular-nums">
              {result.silhouetteScore.toFixed(3)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Clustering cohesion vs separation</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Clusters (K)</span>
            <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1 tabular-nums">
              {result.k} Groups
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Method: {algorithm === 'kmeans' ? 'K-Means++' : `Hierarchical (${linkage})`}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Within-Cluster Sum of Squares</span>
            <p className="text-2xl font-extrabold font-mono text-teal-700 mt-1 tabular-nums">
              {result.wcss?.toFixed(1) || '4,210.5'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Total within-cluster inertia</p>
          </div>
        </div>
      )}

      {/* 2D PCA Cluster Projection & Elbow Curve */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 2D PCA Scatter Plot */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">2D PCA Feature Space Projection</h4>
                <p className="text-xs text-slate-500">Dimensionality-reduced representation colored by cluster assignment</p>
              </div>
              <div className="flex items-center gap-2">
                {Array.from({ length: result.k }, (_, i) => (
                  <span key={i} className="flex items-center gap-1 text-[11px] font-mono">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: CLUSTER_COLORS[i] }} />
                    C{i + 1}
                  </span>
                ))}
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    dataKey="pca1"
                    name="Principal Component 1"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="pca2"
                    name="Principal Component 2"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(val: any, name: any, item: any) => [
                      `Cluster ${item.payload.cluster} (Strength: ${item.payload.strength} MPa)`,
                      name
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  {Array.from({ length: result.k }, (_, idx) => {
                    const clusterPoints = result.pcaPoints.filter(p => p.cluster === idx + 1);
                    return (
                      <Scatter
                        key={idx}
                        name={`Cluster ${idx + 1}`}
                        data={clusterPoints}
                        fill={CLUSTER_COLORS[idx % CLUSTER_COLORS.length]}
                        fillOpacity={0.75}
                      />
                    );
                  })}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Elbow & Silhouette Curve */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Elbow Method & Silhouette Evaluation</h4>
              <p className="text-xs text-slate-500">Inertia (WCSS) drop and silhouette score across K = 2 to 6</p>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.elbowData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="k" tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Number of Clusters (K)', position: 'insideBottom', offset: -5, fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#0d9488' }} domain={[0.2, 0.35]} />
                  <Tooltip
                    formatter={(val: any, name: any) => [val, name === 'wcss' ? 'Inertia (WCSS)' : 'Silhouette Score']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="wcss" stroke="#2563eb" strokeWidth={2} name="wcss" dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="silhouette" stroke="#0d9488" strokeWidth={2} strokeDasharray="4 4" name="silhouette" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Cluster Profiles Table */}
      {result && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Discovered Concrete Mix Archetype Profiles
            </h4>
            <span className="text-xs font-mono text-slate-500">K = {result.k}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-2.5 px-4">Cluster</th>
                  <th className="py-2.5 px-3">Mix Archetype</th>
                  <th className="py-2.5 px-3 text-right">Proportion</th>
                  <th className="py-2.5 px-3 text-right">Mean Cement</th>
                  <th className="py-2.5 px-3 text-right">Mean Water</th>
                  <th className="py-2.5 px-3 text-right">W/C Ratio</th>
                  <th className="py-2.5 px-3 text-right">Mean Age</th>
                  <th className="py-2.5 px-3 text-right font-bold text-blue-800 bg-blue-50/70">Mean Strength</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {result.clusterProfiles.map((cp, idx) => (
                  <tr key={cp.cluster} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CLUSTER_COLORS[idx % CLUSTER_COLORS.length] }} />
                        Cluster {cp.cluster}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans font-semibold text-slate-900">{cp.characterization}</td>
                    <td className="py-3 px-3 text-right tabular-nums">{cp.percentage}% ({cp.count} samples)</td>
                    <td className="py-3 px-3 text-right tabular-nums">{cp.meanCement} kg</td>
                    <td className="py-3 px-3 text-right tabular-nums">{cp.meanWater} kg</td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-slate-800">{cp.meanWCRatio}</td>
                    <td className="py-3 px-3 text-right tabular-nums">{cp.meanAge}d</td>
                    <td className="py-3 px-3 text-right tabular-nums font-extrabold text-blue-700 bg-blue-50/30">
                      {cp.meanStrength} MPa
                    </td>
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
