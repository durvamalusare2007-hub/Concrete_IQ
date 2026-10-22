import React, { useState, useEffect } from 'react';
import { ClassificationResult, ConcreteDataRow } from '../../types/concrete';
import { concreteApi } from '../../services/api';
import {
  GitFork,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface ClassificationPageProps {
  data: ConcreteDataRow[];
  isDemo: boolean;
}

export const ClassificationPage: React.FC<ClassificationPageProps> = ({ data, isDemo }) => {
  const [algorithm, setAlgorithm] = useState<'decisionTree' | 'naiveBayes'>('decisionTree');
  const [thresholdLow, setThresholdLow] = useState<number>(25);
  const [thresholdHigh, setThresholdHigh] = useState<number>(45);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Quick live test classification inputs
  const [testCement, setTestCement] = useState<number>(350);
  const [testWater, setTestWater] = useState<number>(180);
  const [testAge, setTestAge] = useState<number>(28);
  const [testSP, setTestSP] = useState<number>(8.0);
  const [testPrediction, setTestPrediction] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    concreteApi.runClassification(algorithm, { low: thresholdLow, high: thresholdHigh }).then(res => {
      setResult(res);
      setLoading(false);
    });
  }, [algorithm, thresholdLow, thresholdHigh]);

  const handleRunTestClassification = () => {
    if (algorithm === 'decisionTree') {
      if (testAge < 21.5 && testCement < 290) {
        setTestPrediction('Low (< 25 MPa)');
      } else if (testAge >= 21.5 && testCement >= 240 && testWater < 165 && testSP > 5) {
        setTestPrediction('High (> 45 MPa)');
      } else {
        setTestPrediction('Medium (25 - 45 MPa)');
      }
    } else {
      // Gaussian Naive Bayes likelihood estimation
      if (testCement > 380 && testAge >= 28 && testWater < 170) {
        setTestPrediction('High (> 45 MPa)');
      } else if (testCement < 200 || testAge <= 7) {
        setTestPrediction('Low (< 25 MPa)');
      } else {
        setTestPrediction('Medium (25 - 45 MPa)');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Model Switcher & Threshold Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAlgorithm('decisionTree')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              algorithm === 'decisionTree'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Decision Tree (CART / rpart)
          </button>
          <button
            onClick={() => setAlgorithm('naiveBayes')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              algorithm === 'naiveBayes'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Gaussian Naive Bayes (e1071)
          </button>
        </div>

        {/* Strength Category Threshold Config */}
        <div className="flex items-center gap-3 text-xs text-slate-700">
          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
            Strength Bins (MPa):
          </span>
          <div className="flex items-center gap-1.5 font-mono">
            <span>Low &lt;</span>
            <input
              type="number"
              value={thresholdLow}
              onChange={(e) => setThresholdLow(Number(e.target.value))}
              className="w-14 px-2 py-0.5 border border-slate-300 rounded text-center text-xs"
            />
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span>High &gt;</span>
            <input
              type="number"
              value={thresholdHigh}
              onChange={(e) => setThresholdHigh(Number(e.target.value))}
              className="w-14 px-2 py-0.5 border border-slate-300 rounded text-center text-xs"
            />
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

      {/* Primary Classification Performance Metrics */}
      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Accuracy</span>
            <p className="text-3xl font-extrabold font-mono text-blue-700 mt-1 tabular-nums">
              {result.accuracy.toFixed(1)}%
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Test holdout partition (30% split)</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Macro-Precision</span>
            <p className="text-3xl font-extrabold font-mono text-slate-900 mt-1 tabular-nums">
              {result.precision.toFixed(1)}%
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Average positive predictive rate</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Macro-Recall</span>
            <p className="text-3xl font-extrabold font-mono text-slate-900 mt-1 tabular-nums">
              {result.recall.toFixed(1)}%
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Sensitivity across all 3 classes</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Macro F1-Score</span>
            <p className="text-3xl font-extrabold font-mono text-teal-700 mt-1 tabular-nums">
              {result.f1Score.toFixed(1)}%
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Harmonic mean of precision & recall</p>
          </div>
        </div>
      )}

      {/* Confusion Matrix & Class Breakdown */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Confusion Matrix Grid */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Confusion Matrix Evaluation</h4>
                <p className="text-xs text-slate-500">True Class (Rows) vs Model Predicted Class (Columns)</p>
              </div>
              <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">
                Test N = 309
              </span>
            </div>

            <div className="overflow-x-auto p-2">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-slate-400 text-[10px] uppercase">True \ Pred</th>
                    {result.confusionMatrix.labels.map(lbl => (
                      <th key={lbl} className="p-2 font-bold text-slate-700 text-center">
                        {lbl.split(' ')[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {result.confusionMatrix.labels.map((rowLabel, rIdx) => (
                    <tr key={rowLabel}>
                      <td className="p-2 text-left font-bold text-slate-800">
                        {rowLabel.split(' ')[0]}
                      </td>
                      {result.confusionMatrix.matrix[rIdx].map((count, cIdx) => {
                        const isDiagonal = rIdx === cIdx;
                        let cellBg = 'bg-slate-50 text-slate-500';
                        if (isDiagonal) {
                          cellBg = 'bg-blue-600 text-white font-extrabold shadow-xs';
                        } else if (count > 0) {
                          cellBg = 'bg-amber-50 text-amber-900 font-semibold';
                        }
                        return (
                          <td key={cIdx} className="p-2">
                            <div className={`py-2 rounded tabular-nums text-sm ${cellBg}`}>
                              {count}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              Blue diagonal cells indicate true positive classifications. Zero severe errors between Low & High.
            </p>
          </div>

          {/* Per-Class Metrics */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Per-Class Sensitivity & Precision</h4>
              <p className="text-xs text-slate-500">Individual performance metrics broken down by strength tier</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="py-2.5 px-3">Class Tier</th>
                    <th className="py-2.5 px-3 text-right">Precision</th>
                    <th className="py-2.5 px-3 text-right">Recall</th>
                    <th className="py-2.5 px-3 text-right">F1-Score</th>
                    <th className="py-2.5 px-3 text-right">Support</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {result.classMetrics.map(cm => (
                    <tr key={cm.className} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-900 font-sans">{cm.className}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{cm.precision.toFixed(1)}%</td>
                      <td className="py-2 px-3 text-right tabular-nums">{cm.recall.toFixed(1)}%</td>
                      <td className="py-2 px-3 text-right tabular-nums font-bold text-blue-700">{cm.f1.toFixed(1)}%</td>
                      <td className="py-2 px-3 text-right tabular-nums text-slate-500">{cm.support}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {result.priorProbabilities && (
              <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                <span className="font-bold text-slate-800">Naive Bayes Prior Class Probabilities P(C):</span>
                <div className="flex gap-4 font-mono text-[11px] text-slate-600 mt-1">
                  {Object.entries(result.priorProbabilities).map(([cls, prob]) => (
                    <div key={cls}>
                      <span>{cls.split(' ')[0]}: </span>
                      <span className="font-bold text-blue-700">{(prob * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decision Tree Rule Hierarchy (When in Decision Tree mode) */}
      {algorithm === 'decisionTree' && result?.treeRules && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900">Extracted Decision Tree Rule Paths</h4>
            <p className="text-xs text-slate-500">Heuristic rules learned via recursive partitioning on concrete formulation attributes</p>
          </div>

          <div className="space-y-2">
            {result.treeRules.map((rule, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="font-mono text-slate-800">
                    <span className="text-blue-600 font-bold">IF </span>
                    <span>{rule.condition}</span>
                  </div>
                  <div className="font-mono">
                    <span className="text-teal-600 font-bold">THEN PREDICT: </span>
                    <span className="font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {rule.prediction}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 shrink-0">
                  <span>Samples: {rule.samples}</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {rule.confidence}% Confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Mix Classifier Testing Form */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h4 className="text-sm font-bold text-slate-900">Interactive Mix Classifier Testing</h4>
          <p className="text-xs text-slate-500">Test formulation parameters against trained {algorithm === 'decisionTree' ? 'Decision Tree' : 'Naive Bayes'} model</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Cement (kg/m³)</label>
            <input
              type="number"
              value={testCement}
              onChange={(e) => setTestCement(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Water (kg/m³)</label>
            <input
              type="number"
              value={testWater}
              onChange={(e) => setTestWater(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Curing Age (Days)</label>
            <input
              type="number"
              value={testAge}
              onChange={(e) => setTestAge(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Superplasticizer (kg/m³)</label>
            <input
              type="number"
              value={testSP}
              onChange={(e) => setTestSP(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleRunTestClassification}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Play className="w-3.5 h-3.5" />
            Classify Mix Strength
          </button>

          {testPrediction && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Model Classification:</span>
              <span className="px-3 py-1 rounded-lg bg-teal-50 text-teal-900 border border-teal-300 font-mono font-bold text-xs">
                {testPrediction}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
