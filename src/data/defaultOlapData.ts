import { ConcreteDataRow, OlapCubeQuery } from '../types/concrete';

export interface StarSchemaDimension {
  name: string;
  key: string;
  attributes: string[];
  description: string;
}

export interface StarSchemaFact {
  name: string;
  foreignKeys: string[];
  measures: string[];
  granularity: string;
}

export const STAR_SCHEMA_DEFINITION = {
  factTable: {
    name: 'Fact_ConcreteTest',
    foreignKeys: ['MixID', 'CuringTimeID', 'AdmixtureID', 'AggregateRatioID'],
    measures: ['Strenght_Mpa', 'WaterCementRatio', 'TotalBinder_kg', 'Density_kg_m3'],
    granularity: 'One physical compressive strength cylinder compression break test',
  } as StarSchemaFact,
  dimensions: [
    {
      name: 'Dim_MixComposition',
      key: 'MixID',
      attributes: ['CementContent', 'SlagContent', 'FlyAshContent', 'SupplementaryRatio', 'MixCategory'],
      description: 'Binder components and pozzolanic material proportions',
    },
    {
      name: 'Dim_CuringTime',
      key: 'CuringTimeID',
      attributes: ['Age_Days', 'Age_Bracket', 'HydrationStage', 'StandardTestFlag'],
      description: 'Moist curing intervals and standard civil testing milestones',
    },
    {
      name: 'Dim_Admixtures',
      key: 'AdmixtureID',
      attributes: ['Superplasticizer_Dosage', 'AdmixtureClass', 'HasSuperplasticizer'],
      description: 'Chemical water-reducing agents and rheology modifiers',
    },
    {
      name: 'Dim_AggregateRatio',
      key: 'AggregateRatioID',
      attributes: ['CoarseAggregate_kg', 'FineAggregate_kg', 'TotalAggregate_kg', 'CoarseToFineRatio'],
      description: 'Granular skeletal filler proportions and gradation ratios',
    },
  ] as StarSchemaDimension[],
};

export interface OlapAggregatedCell {
  rowLabel: string;
  colLabel: string;
  count: number;
  avgStrength: number;
  avgCement: number;
  avgWCRatio: number;
}

export function executeOlapQuery(data: ConcreteDataRow[], query: OlapCubeQuery) {
  // Step 1: Apply Slice & Dice filters
  let filtered = [...data];

  if (query.sliceAge !== undefined && query.sliceAge > 0) {
    filtered = filtered.filter(d => d.age === query.sliceAge);
  }

  if (query.diceWaterMax !== undefined && query.diceWaterMax > 0) {
    filtered = filtered.filter(d => d.water <= query.diceWaterMax!);
  }

  if (query.diceSuperplasticizerMin !== undefined && query.diceSuperplasticizerMin > 0) {
    filtered = filtered.filter(d => d.superplasticizer >= query.diceSuperplasticizerMin!);
  }

  // Helper row classifier
  const getRowKey = (d: ConcreteDataRow): string => {
    if (query.pivotRow === 'age_bracket') {
      if (d.age <= 7) return 'Early Age (<= 7d)';
      if (d.age <= 28) return 'Standard (8 - 28d)';
      if (d.age <= 90) return 'Intermediate (29 - 90d)';
      return 'Long-Term (> 90d)';
    } else if (query.pivotRow === 'admixture') {
      return d.superplasticizer > 0 ? 'With Superplasticizer' : 'No Superplasticizer';
    } else {
      const wc = d.water / (d.cement || 1);
      if (wc < 0.40) return 'Low W/C (< 0.40)';
      if (wc <= 0.55) return 'Medium W/C (0.40 - 0.55)';
      return 'High W/C (> 0.55)';
    }
  };

  // Helper col classifier
  const getColKey = (d: ConcreteDataRow): string => {
    if (query.pivotCol === 'strength_class') {
      if (d.Strenght_Mpa < 25) return 'Low (< 25 MPa)';
      if (d.Strenght_Mpa <= 45) return 'Medium (25 - 45 MPa)';
      return 'High (> 45 MPa)';
    } else {
      return d.superplasticizer > 5 ? 'High SP (> 5kg)' : d.superplasticizer > 0 ? 'Low SP (<= 5kg)' : 'Zero SP';
    }
  };

  // Step 2: Build cross-tabulation cells
  const grid: Record<string, Record<string, { count: number; sumStrength: number; sumCement: number; sumWC: number }>> = {};
  const rowLabelsSet = new Set<string>();
  const colLabelsSet = new Set<string>();

  filtered.forEach(d => {
    const r = getRowKey(d);
    const c = getColKey(d);
    rowLabelsSet.add(r);
    colLabelsSet.add(c);

    if (!grid[r]) grid[r] = {};
    if (!grid[r][c]) {
      grid[r][c] = { count: 0, sumStrength: 0, sumCement: 0, sumWC: 0 };
    }

    grid[r][c].count++;
    grid[r][c].sumStrength += d.Strenght_Mpa;
    grid[r][c].sumCement += d.cement;
    grid[r][c].sumWC += d.water / (d.cement || 1);
  });

  const rowLabels = Array.from(rowLabelsSet).sort();
  const colLabels = Array.from(colLabelsSet).sort();

  const cells: OlapAggregatedCell[] = [];
  rowLabels.forEach(r => {
    colLabels.forEach(c => {
      const item = grid[r]?.[c];
      if (item && item.count > 0) {
        cells.push({
          rowLabel: r,
          colLabel: c,
          count: item.count,
          avgStrength: Number((item.sumStrength / item.count).toFixed(2)),
          avgCement: Number((item.sumCement / item.count).toFixed(1)),
          avgWCRatio: Number((item.sumWC / item.count).toFixed(2)),
        });
      } else {
        cells.push({
          rowLabel: r,
          colLabel: c,
          count: 0,
          avgStrength: 0,
          avgCement: 0,
          avgWCRatio: 0,
        });
      }
    });
  });

  return {
    totalSamples: filtered.length,
    rowLabels,
    colLabels,
    cells,
  };
}
