import React, { useState } from 'react';
import { EXPERIMENT_REPORTS } from '../../data/experimentReports';
import { ExperimentReport } from '../../types/concrete';
import {
  FileText,
  Printer,
  Copy,
  Check,
  BookOpen,
  Terminal,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const ExperimentReportsPage: React.FC = () => {
  const [selectedExpId, setSelectedExpId] = useState<number>(1);
  const [copiedCodeId, setCopiedCodeId] = useState<number | null>(null);

  const currentReport: ExperimentReport =
    EXPERIMENT_REPORTS.find(r => r.id === selectedExpId) || EXPERIMENT_REPORTS[0];

  const handleCopyCode = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Selector Grid */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              University Data Mining Laboratory Experiment Reports
            </h3>
            <p className="text-xs text-slate-500">
              Complete academic documentation for 9 curriculum experiments with methodology, verified R scripts, and engineering interpretations
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            Print / Save PDF
          </button>
        </div>

        {/* 9 Experiment Selector Tabs */}
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
          {EXPERIMENT_REPORTS.map(exp => {
            const isSelected = exp.id === selectedExpId;
            return (
              <button
                key={exp.id}
                onClick={() => setSelectedExpId(exp.id)}
                className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-80 font-mono">
                  EXP {exp.experimentNumber}
                </div>
                <div className="text-xs font-semibold truncate mt-0.5">
                  {exp.title.split(':')[0].replace('Data ', '').replace('Concrete ', '')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Experiment Full Academic Record Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden print:border-none print:shadow-none">
        {/* Report Header Banner */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 bg-teal-950/80 border border-teal-800/80 px-2 py-0.5 rounded">
              LAB EXPERIMENT #{currentReport.experimentNumber}
            </span>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <span>R Packages:</span>
              <div className="flex gap-1">
                {currentReport.rPackages.map(pkg => (
                  <span key={pkg} className="bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-teal-300">
                    {pkg}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {currentReport.title}
          </h2>
          <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
            {currentReport.academicBackground}
          </p>
        </div>

        {/* Report Body */}
        <div className="p-6 space-y-6">
          {/* Section 1: Objective & Methodology */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                1. Practical Objective
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {currentReport.objective}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-teal-600" />
                2. Data Mining Methodology
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {currentReport.methodology}
              </p>
            </div>
          </div>

          {/* Section 2: Experimental Parameters */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              3. Experimental Test Parameters & Hyperparameters
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 w-1/3">Parameter Name</th>
                    <th className="py-2.5 px-4">Configured Experimental Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                  {Object.entries(currentReport.experimentalParameters).map(([k, v]) => (
                    <tr key={k} className="hover:bg-slate-50">
                      <td className="py-2 px-4 font-semibold text-slate-900 font-sans">{k}</td>
                      <td className="py-2 px-4 text-blue-700">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Actual Findings & Results */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              4. Actual Experimental Results & Diagnostic Outputs
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-800">
              {currentReport.keyFindings.map((finding, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{finding}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 4: Academic Interpretation */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              5. Academic Discussion & Interpretation
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {currentReport.academicInterpretation}
            </p>
          </div>

          {/* Section 5: Engineering Conclusions */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              6. Practical Engineering Conclusions
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-800">
              {currentReport.engineeringConclusions.map((concl, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{concl}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 6: Verified R Script Code */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-800 text-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono">
                <Terminal className="w-4 h-4 text-teal-400" />
                <span>R Script Source: Experiment_{currentReport.experimentNumber}.R</span>
              </div>
              <button
                onClick={() => handleCopyCode(currentReport.rCodeSnippet, currentReport.id)}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 px-2.5 py-1 rounded transition-colors cursor-pointer"
              >
                {copiedCodeId === currentReport.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy R Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed max-h-96">
              <code>{currentReport.rCodeSnippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
