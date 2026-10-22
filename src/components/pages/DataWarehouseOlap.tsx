import React, { useState, useMemo } from 'react';
import { ConcreteDataRow, OlapCubeQuery } from '../../types/concrete';
import { STAR_SCHEMA_DEFINITION } from '../../data/defaultOlapData';
import { concreteApi } from '../../services/api';
import {
  Boxes,
  Database,
  Layers,
  ArrowUpDown,
  Filter,
  Grid,
  RotateCcw,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface DataWarehouseOlapProps {
  data: ConcreteDataRow[];
  isDemo: boolean;
}

export const DataWarehouseOlap: React.FC<DataWarehouseOlapProps> = ({ data, isDemo }) => {
  const [activeTab, setActiveTab] = useState<'starschema' | 'olapoperations' | 'tables'>('olapoperations');

  // OLAP Controls State
  const [query, setQuery] = useState<OlapCubeQuery>({
    rollUpLevel: 'age_bracket',
    sliceAge: 0, // 0 = all ages
    diceWaterMax: 0, // 0 = unconstrained
    diceSuperplasticizerMin: 0,
    pivotRow: 'age_bracket',
    pivotCol: 'strength_class',
  });

  // Calculate OLAP data based on active query
  const olapResult = useMemo(() => {
    return concreteApi.getOlapData(query, data);
  }, [query, data]);

  // Extract grid data for display
  const [gridData, setGridData] = useState<{
    totalSamples: number;
    rowLabels: string[];
    colLabels: string[];
    cells: any[];
  } | null>(null);

  React.useEffect(() => {
    olapResult.then(res => setGridData(res));
  }, [olapResult]);

  const handleResetOlap = () => {
    setQuery({
      rollUpLevel: 'age_bracket',
      sliceAge: 0,
      diceWaterMax: 0,
      diceSuperplasticizerMin: 0,
      pivotRow: 'age_bracket',
      pivotCol: 'strength_class',
    });
  };

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('olapoperations')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'olapoperations'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Interactive OLAP Operations (Roll-Up, Drill, Slice, Dice, Pivot)
        </button>
        <button
          onClick={() => setActiveTab('starschema')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'starschema'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Star Schema Architectural Diagram
        </button>
        <button
          onClick={() => setActiveTab('tables')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'tables'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Fact & Dimension Schema Tables
        </button>
      </div>

      {/* Explicit Model Status Notice */}
      <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">Model Status:</span>
          <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
            Preview only — this feature is not connected to the analysis server yet.
          </span>
          <span className="text-slate-500 hidden md:inline">
            (Client-side multidimensional cube operations)
          </span>
        </div>
      </div>

      {/* TAB 1: Interactive OLAP Operations */}
      {activeTab === 'olapoperations' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Grid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">OLAP Multidimensional Cube Operations</h3>
                  <p className="text-xs text-slate-500">Perform real-time analytical queries on concrete quality aggregates</p>
                </div>
              </div>
              <button
                onClick={handleResetOlap}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. SLICE */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-blue-600" />
                    1. Slice (1-Dim Filter)
                  </span>
                  {query.sliceAge !== 0 && (
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-mono px-1 rounded">Active</span>
                  )}
                </div>
                <label className="text-[11px] text-slate-600 block">Filter by Specific Curing Age:</label>
                <select
                  value={query.sliceAge}
                  onChange={(e) => setQuery(q => ({ ...q, sliceAge: Number(e.target.value) }))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-800"
                >
                  <option value={0}>All Curing Durations</option>
                  <option value={3}>Slice: Age = 3 Days (Early)</option>
                  <option value={7}>Slice: Age = 7 Days</option>
                  <option value={28}>Slice: Age = 28 Days (Standard ACI)</option>
                  <option value={56}>Slice: Age = 56 Days</option>
                  <option value={90}>Slice: Age = 90 Days</option>
                  <option value={365}>Slice: Age = 365 Days (Long-term)</option>
                </select>
              </div>

              {/* 2. DICE */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1">
                    <Boxes className="w-3.5 h-3.5 text-teal-600" />
                    2. Dice (Multi-Dim Filter)
                  </span>
                  {(query.diceWaterMax !== 0 || query.diceSuperplasticizerMin !== 0) && (
                    <span className="text-[10px] bg-teal-100 text-teal-800 font-mono px-1 rounded">Active</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-600 flex justify-between">
                    <span>Max Water:</span>
                    <span className="font-mono font-bold text-slate-800">{query.diceWaterMax === 0 ? 'Any' : `${query.diceWaterMax} kg`}</span>
                  </label>
                  <select
                    value={query.diceWaterMax}
                    onChange={(e) => setQuery(q => ({ ...q, diceWaterMax: Number(e.target.value) }))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-800"
                  >
                    <option value={0}>Any Water Content</option>
                    <option value={180}>Water &le; 180 kg/m³ (Low)</option>
                    <option value={200}>Water &le; 200 kg/m³ (Medium)</option>
                  </select>

                  <label className="text-[11px] text-slate-600 flex justify-between pt-1">
                    <span>Min Superplasticizer:</span>
                    <span className="font-mono font-bold text-slate-800">{query.diceSuperplasticizerMin === 0 ? 'Any' : `${query.diceSuperplasticizerMin} kg`}</span>
                  </label>
                  <select
                    value={query.diceSuperplasticizerMin}
                    onChange={(e) => setQuery(q => ({ ...q, diceSuperplasticizerMin: Number(e.target.value) }))}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-800"
                  >
                    <option value={0}>Any SP Content</option>
                    <option value={5}>SP &ge; 5 kg/m³</option>
                    <option value={10}>SP &ge; 10 kg/m³ (High-Range)</option>
                  </select>
                </div>
              </div>

              {/* 3. PIVOT (Row Dimension) */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600" />
                  3. Pivot Row Dimension
                </span>
                <label className="text-[11px] text-slate-600 block">Vertical Axis Hierarchy:</label>
                <select
                  value={query.pivotRow}
                  onChange={(e: any) => setQuery(q => ({ ...q, pivotRow: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-800"
                >
                  <option value="age_bracket">Curing Age Brackets (Early / Std / Long)</option>
                  <option value="admixture">Admixture Presence (SP vs No-SP)</option>
                  <option value="wc_ratio">Water-to-Cement Ratio Categories</option>
                </select>
              </div>

              {/* 4. PIVOT (Col Dimension) */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1">
                  <Grid className="w-3.5 h-3.5 text-purple-600" />
                  4. Pivot Column Dimension
                </span>
                <label className="text-[11px] text-slate-600 block">Horizontal Axis Measure:</label>
                <select
                  value={query.pivotCol}
                  onChange={(e: any) => setQuery(q => ({ ...q, pivotCol: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white text-slate-800"
                >
                  <option value="strength_class">Strength Classes (Low / Med / High)</option>
                  <option value="superplasticizer">Superplasticizer Dosage Tiers</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cross-Tabulation Pivot Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  OLAP Cross-Tabulated Result Matrix
                </h4>
                <p className="text-xs text-slate-500">
                  Showing aggregates for <span className="font-bold text-slate-700">{gridData?.totalSamples || 0}</span> matching cylinders (Mean Compressive Strength & Sample Count)
                </p>
              </div>
              <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">
                Fact: Strenght_Mpa
              </span>
            </div>

            <div className="overflow-x-auto p-4">
              {gridData && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-3 px-4 bg-slate-100 font-bold text-slate-800 w-48">
                        {query.pivotRow === 'age_bracket' ? 'Curing Duration' : query.pivotRow === 'admixture' ? 'Admixture' : 'W/C Ratio'}
                      </th>
                      {gridData.colLabels.map(col => (
                        <th key={col} className="py-3 px-4 text-center font-bold text-slate-800 border-l border-slate-200 bg-slate-50">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {gridData.rowLabels.map(row => (
                      <tr key={row} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-semibold text-slate-800 bg-slate-50">
                          {row}
                        </td>
                        {gridData.colLabels.map(col => {
                          const cell = gridData.cells.find(c => c.rowLabel === row && c.colLabel === col);
                          if (!cell || cell.count === 0) {
                            return (
                              <td key={col} className="py-3 px-4 text-center text-slate-300 font-mono border-l border-slate-100">
                                —
                              </td>
                            );
                          }
                          return (
                            <td key={col} className="py-3 px-4 text-center border-l border-slate-100">
                              <div className="font-mono font-bold text-slate-900 text-sm">
                                {cell.avgStrength} <span className="text-[10px] text-slate-400 font-normal">MPa</span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                N = {cell.count} · W/C: {cell.avgWCRatio}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Star Schema Architecture Diagram */}
      {activeTab === 'starschema' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Concrete Strength Data Warehouse Star Schema</h3>
            <p className="text-xs text-slate-500">
              Dimensional modeling architecture separating additive properties into dimensions centered on physical test cylinder breaks
            </p>
          </div>

          {/* Interactive Visual Star Schema */}
          <div className="p-8 bg-slate-900 rounded-xl text-white relative min-h-[460px] flex items-center justify-center">
            {/* Center: Fact Table */}
            <div className="z-10 w-64 bg-blue-900 border-2 border-blue-400 rounded-xl p-4 shadow-xl text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">
                <Database className="w-4 h-4 text-blue-300" />
                FACT TABLE
              </div>
              <h4 className="text-base font-extrabold text-white font-mono">Fact_ConcreteTest</h4>
              <div className="mt-3 text-[11px] text-left space-y-1 bg-blue-950/80 p-2.5 rounded font-mono">
                <p className="text-teal-300 font-bold">* Strenght_Mpa (Target)</p>
                <p className="text-slate-300">· WaterCementRatio</p>
                <p className="text-slate-300">· TotalBinder_kg</p>
                <div className="pt-1 border-t border-blue-800 text-[10px] text-blue-300">
                  [FKs]: MixID, CuringTimeID, AdmixtureID, AggregateRatioID
                </div>
              </div>
            </div>

            {/* Dimension Top: Dim_MixComposition */}
            <div className="absolute top-4 w-56 bg-slate-800 border border-slate-700 rounded-lg p-3 text-left">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Dimension 1</span>
              <p className="text-xs font-bold font-mono text-white">Dim_MixComposition</p>
              <p className="text-[10px] text-slate-400 mt-1">cement, slag, flyash</p>
            </div>

            {/* Dimension Bottom: Dim_CuringTime */}
            <div className="absolute bottom-4 w-56 bg-slate-800 border border-slate-700 rounded-lg p-3 text-left">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Dimension 2</span>
              <p className="text-xs font-bold font-mono text-white">Dim_CuringTime</p>
              <p className="text-[10px] text-slate-400 mt-1">age (Days), Age_Bracket</p>
            </div>

            {/* Dimension Left: Dim_Admixtures */}
            <div className="absolute left-6 w-48 bg-slate-800 border border-slate-700 rounded-lg p-3 text-left">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Dimension 3</span>
              <p className="text-xs font-bold font-mono text-white">Dim_Admixtures</p>
              <p className="text-[10px] text-slate-400 mt-1">superplasticizer, water</p>
            </div>

            {/* Dimension Right: Dim_AggregateRatio */}
            <div className="absolute right-6 w-48 bg-slate-800 border border-slate-700 rounded-lg p-3 text-left">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Dimension 4</span>
              <p className="text-xs font-bold font-mono text-white">Dim_AggregateRatio</p>
              <p className="text-[10px] text-slate-400 mt-1">coarseagg, fineagg</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Fact & Dimension Tables */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Fact Table: {STAR_SCHEMA_DEFINITION.factTable.name}
            </h4>
            <p className="text-xs text-slate-500">{STAR_SCHEMA_DEFINITION.factTable.granularity}</p>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-2.5">Field / Metric</th>
                    <th className="p-2.5">Data Type</th>
                    <th className="p-2.5">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="p-2 font-bold text-blue-700">Strenght_Mpa</td>
                    <td className="p-2 text-slate-600">Float (MPa)</td>
                    <td className="p-2 text-emerald-700 font-sans font-semibold">Additive Measure</td>
                  </tr>
                  <tr>
                    <td className="p-2">WaterCementRatio</td>
                    <td className="p-2 text-slate-600">Float</td>
                    <td className="p-2 text-slate-600 font-sans">Derived Measure</td>
                  </tr>
                  {STAR_SCHEMA_DEFINITION.factTable.foreignKeys.map(fk => (
                    <tr key={fk}>
                      <td className="p-2 text-slate-500">{fk}</td>
                      <td className="p-2 text-slate-600">Integer (FK)</td>
                      <td className="p-2 text-indigo-700 font-sans">Foreign Key Link</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Dimension Tables Overview
            </h4>
            <p className="text-xs text-slate-500">4 Orthogonal dimensional hierarchies</p>
            <div className="space-y-3">
              {STAR_SCHEMA_DEFINITION.dimensions.map(dim => (
                <div key={dim.name} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs text-slate-900">{dim.name}</span>
                    <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-mono">PK: {dim.key}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-1.5">{dim.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {dim.attributes.map(att => (
                      <span key={att} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-700">
                        {att}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
