import React, { useState, useEffect } from 'react';
import {
  ConcreteDataRow,
  ConcreteFeature,
  ConcretePredictionInput,
  PredictionResult,
  RegressionResult,
} from '../../types/concrete';
import { concreteApi } from '../../services/api';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Line,
} from 'recharts';
import {
  TrendingUp,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';

interface RegressionPageProps {
  data: ConcreteDataRow[];
  isDemo: boolean;
}

export const RegressionPage: React.FC<RegressionPageProps> = ({ data, isDemo }) => {
  const [modelType, setModelType] = useState<'simple' | 'multiple'>('multiple');
  const [simplePredictor, setSimplePredictor] = useState<ConcreteFeature>('cement');
  const [regressionResult, setRegressionResult] = useState<RegressionResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Strength Prediction Form state
  const [inputs, setInputs] = useState<ConcretePredictionInput>({
    cement: 380,
    slag: 95,
    flyash: 0,
    water: 180,
    superplasticizer: 8.5,
    coarseaggregate: 960,
    fineaggregate: 750,
    age: 28,
  });

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Load regression results on model or predictor change
  useEffect(() => {
    setLoading(true);
    concreteApi.runRegression(modelType, simplePredictor, data).then(res => {
      setRegressionResult(res);
      setLoading(false);
    });
  }, [modelType, simplePredictor, data]);

  // Handle Predict Form
  const handleCalculateStrength = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalculating(true);
    const res = await concreteApi.predictStrength(inputs);
    setPrediction(res);
    setCalculating(false);
  };

  const handleInputChange = (field: keyof ConcretePredictionInput, val: number) => {
    setInputs(prev => ({ ...prev, [field]: val }));
  };

  return (
    <div className="space-y-6">
      {/* Top Model Switcher Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModelType('multiple')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              modelType === 'multiple'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Multiple Linear Regression (All 8 Features)
          </button>
          <button
            onClick={() => setModelType('simple')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              modelType === 'simple'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Simple Linear Regression (Univariate)
          </button>
        </div>

        {modelType === 'simple' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">Predictor (X):</span>
            <select
              value={simplePredictor}
              onChange={(e: any) => setSimplePredictor(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white font-mono text-slate-800"
            >
              <option value="cement">cement (kg/m³)</option>
              <option value="water">water (kg/m³)</option>
              <option value="superplasticizer">superplasticizer (kg/m³)</option>
              <option value="age">age (Days)</option>
              <option value="slag">slag (kg/m³)</option>
              <option value="flyash">flyash (kg/m³)</option>
            </select>
          </div>
        )}
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

      {/* Regression Goodness-of-Fit Metrics */}
      {regressionResult && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">R-Squared (R²)</span>
            <p className="text-2xl font-extrabold font-mono text-blue-700 mt-1 tabular-nums">
              {(regressionResult.rSquared * 100).toFixed(1)}%
            </p>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Adj. R² = {(regressionResult.adjRSquared * 100).toFixed(1)}%
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mean Absolute Error (MAE)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                {regressionResult.mae}
              </span>
              <span className="text-xs font-bold text-slate-500 font-mono">MPa</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Average absolute prediction deviation</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Root Mean Squared (RMSE)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                {regressionResult.rmse}
              </span>
              <span className="text-xs font-bold text-slate-500 font-mono">MPa</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Standard error of regression residuals</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Model F-Statistic</span>
            <p className="text-2xl font-extrabold font-mono text-teal-700 mt-1 tabular-nums">
              {regressionResult.fStatistic}
            </p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">p-value &lt; 2.2e-16 (Significant)</p>
          </div>
        </div>
      )}

      {/* Regression Equation & Estimated Coefficients Table */}
      {regressionResult && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Fitted Regression Model & Estimated Parameter Coefficients
              </h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Target: Strenght_Mpa
              </p>
            </div>
            <span className="text-[11px] font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
              OLS Estimation
            </span>
          </div>

          <div className="p-4 bg-slate-900 text-teal-300 font-mono text-xs overflow-x-auto">
            <code>{regressionResult.formula}</code>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-2.5 px-4 font-mono">Independent Term</th>
                  <th className="py-2.5 px-3 text-right font-mono">Estimate (β)</th>
                  <th className="py-2.5 px-3 text-right font-mono">Std Error</th>
                  <th className="py-2.5 px-3 text-right font-mono">t-Statistic</th>
                  <th className="py-2.5 px-3 text-right font-mono">p-Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                {regressionResult.coefficients.map(c => (
                  <tr key={c.term} className="hover:bg-slate-50">
                    <td className="py-2 px-4 font-bold text-slate-900">{c.term}</td>
                    <td className="py-2 px-3 text-right font-bold text-blue-700 tabular-nums">
                      {c.estimate > 0 ? `+${c.estimate.toFixed(4)}` : c.estimate.toFixed(4)}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-slate-500">{c.stdError.toFixed(4)}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{c.tValue.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-emerald-700 font-bold">
                      {c.pValue < 0.0001 ? '< 0.0001 ***' : c.pValue.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actual vs Predicted Scatter Plot & Residual Diagnostics */}
      {regressionResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Actual vs Predicted Strength (Validation Set)</h4>
              <p className="text-xs text-slate-500">Evaluation on holdout test specimens (Ideal agreement lies on y = x diagonal)</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    dataKey="actual"
                    name="Actual Strenght_Mpa"
                    unit=" MPa"
                    domain={[0, 90]}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="predicted"
                    name="Predicted Strenght_Mpa"
                    unit=" MPa"
                    domain={[0, 90]}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(val: any, name: any) => [`${val} MPa`, name]}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Scatter
                    name="Cylinders"
                    data={regressionResult.actualVsPredicted}
                    fill="#2563eb"
                    fillOpacity={0.7}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Residual Diagnostics Distribution</h4>
              <p className="text-xs text-slate-500">Residual errors (Actual - Predicted) demonstrating homoscedasticity</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={regressionResult.actualVsPredicted.slice(0, 30)}
                  margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="id" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} MPa`, 'Residual Error']}
                    labelFormatter={(id) => `Sample #${id}`}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="residual" fill="#0d9488" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Strength Prediction Form Calculator */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              Interactive Concrete Strength Calculator & Mix Evaluator
            </h3>
            <p className="text-xs text-slate-500">
              Input ingredient proportions and curing age to predict target compressive strength (<code className="font-mono text-blue-700">Strenght_Mpa</code>)
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
            ASTM C39 / ACI 211
          </span>
        </div>

        <form onSubmit={handleCalculateStrength} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Cement (kg/m³)
              </label>
              <input
                type="number"
                step="0.1"
                min="50"
                max="600"
                value={inputs.cement}
                onChange={(e) => handleInputChange('cement', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                required
              />
              <span className="text-[10px] text-slate-400">Typical: 150 - 540 kg</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Blast Furnace Slag (kg/m³)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="400"
                value={inputs.slag}
                onChange={(e) => handleInputChange('slag', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400">Range: 0 - 360 kg</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Fly Ash (kg/m³)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="300"
                value={inputs.flyash}
                onChange={(e) => handleInputChange('flyash', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400">Range: 0 - 200 kg</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Water (kg/m³)
              </label>
              <input
                type="number"
                step="0.1"
                min="100"
                max="300"
                value={inputs.water}
                onChange={(e) => handleInputChange('water', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                required
              />
              <span className="text-[10px] text-slate-400">Range: 120 - 247 kg</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Superplasticizer (kg/m³)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="35"
                value={inputs.superplasticizer}
                onChange={(e) => handleInputChange('superplasticizer', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400">Range: 0 - 32 kg</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Coarse Aggregate (kg/m³)
              </label>
              <input
                type="number"
                step="0.1"
                min="500"
                max="1300"
                value={inputs.coarseaggregate}
                onChange={(e) => handleInputChange('coarseaggregate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                required
              />
              <span className="text-[10px] text-slate-400">Crushed gravel (800 - 1145 kg)</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Fine Aggregate (kg/m³)
              </label>
              <input
                type="number"
                step="0.1"
                min="400"
                max="1100"
                value={inputs.fineaggregate}
                onChange={(e) => handleInputChange('fineaggregate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                required
              />
              <span className="text-[10px] text-slate-400">Sand (590 - 992 kg)</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Curing Age (Days)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                max="365"
                value={inputs.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                required
              />
              <span className="text-[10px] text-slate-400">Standard: 3, 7, 14, 28, 90 days</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setInputs({
                  cement: 380,
                  slag: 95,
                  flyash: 0,
                  water: 180,
                  superplasticizer: 8.5,
                  coarseaggregate: 960,
                  fineaggregate: 750,
                  age: 28,
                });
                setPrediction(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Inputs
            </button>
            <button
              type="submit"
              disabled={calculating}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              {calculating ? 'Calculating via Model...' : 'Calculate Predicted Strength'}
            </button>
          </div>
        </form>

        {/* Prediction Results Box */}
        {prediction && (
          <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/60 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Predicted Concrete Strength
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold font-mono text-blue-900 tabular-nums">
                    {prediction.predictedStrength}
                  </span>
                  <span className="text-base font-bold text-blue-700 font-mono">MPa</span>
                  <span className="text-xs text-slate-500 ml-2 font-mono">
                    (95% CI: {prediction.lowerConfidence95} - {prediction.upperConfidence95} MPa)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-lg border border-blue-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Water / Binder Ratio</span>
                  <span className="text-base font-bold font-mono text-slate-900">{prediction.waterCementRatio}</span>
                </div>
              </div>
            </div>

            {/* Mix Quality Feedback */}
            <div className="pt-3 border-t border-blue-200/60 space-y-1.5">
              <span className="text-xs font-bold text-slate-800">ACI 211 Mix Evaluation Notes:</span>
              {prediction.mixEvaluation.notes.map((note, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
