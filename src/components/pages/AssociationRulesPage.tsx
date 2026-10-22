import React, { useState, useEffect } from 'react';
import { AssociationRulesResult, ConcreteDataRow } from '../../types/concrete';
import { concreteApi } from '../../services/api';
import {
  Network,
  Filter,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface AssociationRulesPageProps {
  data: ConcreteDataRow[];
  isDemo: boolean;
}

export const AssociationRulesPage: React.FC<AssociationRulesPageProps> = ({ data, isDemo }) => {
  const [minSupport, setMinSupport] = useState<number>(0.08);
  const [minConfidence, setMinConfidence] = useState<number>(0.65);
  const [minLift, setMinLift] = useState<number>(1.25);
  const [targetFilter, setTargetFilter] = useState<string>('all');
  const [result, setResult] = useState<AssociationRulesResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    concreteApi.runAssociationRules(minSupport, minConfidence, minLift).then(res => {
      setResult(res);
      setLoading(false);
    });
  }, [minSupport, minConfidence, minLift]);

  // Filter rules by target filter if selected
  const filteredRules = (result?.rules || []).filter(r => {
    if (targetFilter === 'all') return true;
    if (targetFilter === 'high') return r.rhs.some(item => item.includes('Strenght_Mpa=High') || item.includes('High'));
    if (targetFilter === 'low') return r.rhs.some(item => item.includes('Strenght_Mpa=Low') || item.includes('Low'));
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Configuration Toolbar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Network className="w-4 h-4 text-blue-600" />
              Apriori Association Rule Mining Parameters
            </h3>
            <p className="text-xs text-slate-500">
              Extract itemset synergies: <code className="font-mono text-blue-700">&#123;Antecedents&#125; &rarr; &#123;Consequents&#125;</code> on discretized concrete mix formulation bins
            </p>
          </div>
          <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">
            arules package (R)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Min Support Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Min. Support:</span>
              <span className="font-mono font-bold text-blue-700">{(minSupport * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.25"
              step="0.01"
              value={minSupport}
              onChange={(e) => setMinSupport(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">Frequency across all concrete batches</p>
          </div>

          {/* Min Confidence Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Min. Confidence:</span>
              <span className="font-mono font-bold text-teal-700">{(minConfidence * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.95"
              step="0.05"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">Rule conditional probability P(RHS | LHS)</p>
          </div>

          {/* Min Lift Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Min. Lift:</span>
              <span className="font-mono font-bold text-indigo-700">{minLift.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.5"
              step="0.25"
              value={minLift}
              onChange={(e) => setMinLift(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">Correlation strength over random baseline</p>
          </div>

          {/* Target Consequent Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Filter by Target Outcome:
            </label>
            <select
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white font-mono"
            >
              <option value="all">All Discovered Rules</option>
              <option value="high">Rules &rarr; Strenght_Mpa=High</option>
              <option value="low">Rules &rarr; Strenght_Mpa=Low</option>
            </select>
          </div>
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

      {/* Discovered Association Rules Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Mined Association Rules (LHS &rArr; RHS)
            </h4>
            <p className="text-xs text-slate-500">
              Filtered {filteredRules.length} strong synergistic mix rules
            </p>
          </div>
          <span className="text-xs font-mono bg-emerald-50 text-emerald-800 px-2 py-1 rounded border border-emerald-200">
            Lift &gt; 1.0 (Positive Association)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-3 px-4 font-mono w-24">Rule ID</th>
                <th className="py-3 px-4">Antecedent (LHS Formulation)</th>
                <th className="py-3 px-3 text-center w-12">&rarr;</th>
                <th className="py-3 px-4">Consequent (RHS Outcome)</th>
                <th className="py-3 px-3 text-right font-mono">Support</th>
                <th className="py-3 px-3 text-right font-mono">Confidence</th>
                <th className="py-3 px-3 text-right font-mono">Lift Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No rules met the current support/confidence/lift thresholds. Try lowering the sliders above.
                  </td>
                </tr>
              ) : (
                filteredRules.map(rule => (
                  <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 font-medium">{rule.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                        {rule.lhs.map(item => (
                          <span key={item} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                            {item}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-400 font-bold">&rArr;</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                        {rule.rhs.map(item => {
                          const isHigh = item.includes('High');
                          const isLow = item.includes('Low');
                          const badgeColor = isHigh ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : isLow ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-blue-50 text-blue-800 border-blue-200';
                          return (
                            <span key={item} className={`px-2 py-0.5 rounded border font-bold ${badgeColor}`}>
                              {item}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                      {(rule.support * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-teal-700">
                      {(rule.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-extrabold text-blue-700">
                      {rule.lift.toFixed(2)}x
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Support vs Confidence Plot & Frequent Itemsets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Support vs Confidence Scatter Plot */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Rule Quality: Support vs Confidence</h4>
            <p className="text-xs text-slate-500">Bubble position indicating rule reliability and dataset prevalence</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="support"
                  name="Support"
                  domain={[0.05, 0.25]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                />
                <YAxis
                  type="number"
                  dataKey="confidence"
                  name="Confidence"
                  domain={[0.6, 1.0]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    name === 'Lift' ? `${val}x` : `${(val * 100).toFixed(1)}%`,
                    name
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Scatter name="Rules" data={filteredRules} fill="#0d9488" fillOpacity={0.8} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Frequent Itemsets Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Frequent Formulation Itemsets</h4>
            <p className="text-xs text-slate-500">Co-occurring ingredient combinations passing minimum support</p>
          </div>

          <div className="space-y-2.5">
            {result?.frequentItemsets.map((itemset, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex flex-wrap gap-1 font-mono text-xs">
                  {itemset.items.map(it => (
                    <span key={it} className="bg-white text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                      {it}
                    </span>
                  ))}
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className="font-mono font-bold text-blue-700 text-xs">
                    {(itemset.support * 100).toFixed(1)}% Support
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    N = {itemset.count} batches
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
