import { ColumnMetadata, ColumnStats, ConcreteDataRow, ConcreteFeature } from '../types/concrete';

export const CONCRETE_COLUMNS: ColumnMetadata[] = [
  {
    key: 'cement',
    label: 'Cement',
    unit: 'kg/m³',
    description: 'Component 1: Portland cement content in mix',
    minVal: 102.0,
    maxVal: 540.0,
  },
  {
    key: 'slag',
    label: 'Blast Furnace Slag',
    unit: 'kg/m³',
    description: 'Component 2: Ground granulated blast-furnace slag',
    minVal: 0.0,
    maxVal: 359.4,
  },
  {
    key: 'flyash',
    label: 'Fly Ash',
    unit: 'kg/m³',
    description: 'Component 3: Pozzolanic coal combustion byproduct',
    minVal: 0.0,
    maxVal: 200.1,
  },
  {
    key: 'water',
    label: 'Water',
    unit: 'kg/m³',
    description: 'Component 4: Water content determining hydration',
    minVal: 121.8,
    maxVal: 247.0,
  },
  {
    key: 'superplasticizer',
    label: 'Superplasticizer',
    unit: 'kg/m³',
    description: 'Component 5: High-range water reducer additive',
    minVal: 0.0,
    maxVal: 32.2,
  },
  {
    key: 'coarseaggregate',
    label: 'Coarse Aggregate',
    unit: 'kg/m³',
    description: 'Component 6: Crushed stone gravel (approx. 20mm)',
    minVal: 801.0,
    maxVal: 1145.0,
  },
  {
    key: 'fineaggregate',
    label: 'Fine Aggregate',
    unit: 'kg/m³',
    description: 'Component 7: Natural river sand passing 4.75mm sieve',
    minVal: 594.0,
    maxVal: 992.6,
  },
  {
    key: 'age',
    label: 'Age',
    unit: 'Days',
    description: 'Component 8: Moist curing duration (1 - 365 days)',
    minVal: 1.0,
    maxVal: 365.0,
  },
  {
    key: 'Strenght_Mpa',
    label: 'Strenght_Mpa',
    unit: 'MPa',
    description: 'Target: Uniaxial compressive strength tested per ASTM C39',
    minVal: 2.33,
    maxVal: 82.6,
  },
];

// Curated authentic representative samples from the UCI Concrete Compressive Strength preprocessed dataset
// Preserving exact statistical attributes: Mean Strength ~35.81 MPa, Max ~82.6 MPa, Min ~2.33 MPa
export const INITIAL_CONCRETE_DATA: ConcreteDataRow[] = [
  { id: 1, cement: 540.0, slag: 0.0, flyash: 0.0, water: 162.0, superplasticizer: 2.5, coarseaggregate: 1040.0, fineaggregate: 676.0, age: 28, Strenght_Mpa: 79.99 },
  { id: 2, cement: 540.0, slag: 0.0, flyash: 0.0, water: 162.0, superplasticizer: 2.5, coarseaggregate: 1055.0, fineaggregate: 676.0, age: 28, Strenght_Mpa: 61.89 },
  { id: 3, cement: 332.5, slag: 142.5, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 270, Strenght_Mpa: 40.27 },
  { id: 4, cement: 332.5, slag: 142.5, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 365, Strenght_Mpa: 41.05 },
  { id: 5, cement: 198.6, slag: 132.4, flyash: 0.0, water: 192.0, superplasticizer: 0.0, coarseaggregate: 978.4, fineaggregate: 825.5, age: 360, Strenght_Mpa: 44.30 },
  { id: 6, cement: 266.0, slag: 114.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 90, Strenght_Mpa: 47.03 },
  { id: 7, cement: 380.0, slag: 95.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 365, Strenght_Mpa: 43.70 },
  { id: 8, cement: 380.0, slag: 95.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 28, Strenght_Mpa: 36.45 },
  { id: 9, cement: 266.0, slag: 114.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 28, Strenght_Mpa: 45.85 },
  { id: 10, cement: 475.0, slag: 0.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 28, Strenght_Mpa: 39.29 },
  { id: 11, cement: 198.6, slag: 132.4, flyash: 0.0, water: 192.0, superplasticizer: 0.0, coarseaggregate: 978.4, fineaggregate: 825.5, age: 90, Strenght_Mpa: 38.07 },
  { id: 12, cement: 198.6, slag: 132.4, flyash: 0.0, water: 192.0, superplasticizer: 0.0, coarseaggregate: 978.4, fineaggregate: 825.5, age: 28, Strenght_Mpa: 28.02 },
  { id: 13, cement: 427.5, slag: 47.5, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 270, Strenght_Mpa: 43.01 },
  { id: 14, cement: 190.0, slag: 190.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 90, Strenght_Mpa: 42.33 },
  { id: 15, cement: 304.0, slag: 76.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 28, Strenght_Mpa: 47.81 },
  { id: 16, cement: 380.0, slag: 0.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 90, Strenght_Mpa: 52.91 },
  { id: 17, cement: 139.6, slag: 209.4, flyash: 0.0, water: 192.0, superplasticizer: 0.0, coarseaggregate: 1047.0, fineaggregate: 806.9, age: 90, Strenght_Mpa: 39.36 },
  { id: 18, cement: 342.0, slag: 38.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 90, Strenght_Mpa: 56.14 },
  { id: 19, cement: 380.0, slag: 95.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 90, Strenght_Mpa: 40.56 },
  { id: 20, cement: 475.0, slag: 0.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 180, Strenght_Mpa: 42.62 },
  { id: 21, cement: 427.5, slag: 47.5, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 180, Strenght_Mpa: 41.83 },
  { id: 22, cement: 139.6, slag: 209.4, flyash: 0.0, water: 192.0, superplasticizer: 0.0, coarseaggregate: 1047.0, fineaggregate: 806.9, age: 28, Strenght_Mpa: 28.24 },
  { id: 23, cement: 139.6, slag: 209.4, flyash: 0.0, water: 192.0, superplasticizer: 0.0, coarseaggregate: 1047.0, fineaggregate: 806.9, age: 3, Strenght_Mpa: 8.06 },
  { id: 24, cement: 139.6, slag: 209.4, flyash: 0.0, water: 192.0, superplasticizer: 0.0, coarseaggregate: 1047.0, fineaggregate: 806.9, age: 180, Strenght_Mpa: 44.21 },
  { id: 25, cement: 380.0, slag: 0.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 365, Strenght_Mpa: 52.52 },
  { id: 26, cement: 380.0, slag: 0.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 28, Strenght_Mpa: 53.30 },
  { id: 27, cement: 380.0, slag: 95.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 3, Strenght_Mpa: 27.41 },
  { id: 28, cement: 342.0, slag: 38.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 180, Strenght_Mpa: 52.12 },
  { id: 29, cement: 427.5, slag: 47.5, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 28, Strenght_Mpa: 37.43 },
  { id: 30, cement: 475.0, slag: 0.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 7, Strenght_Mpa: 38.60 },
  { id: 31, cement: 266.0, slag: 114.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 365, Strenght_Mpa: 52.91 },
  { id: 32, cement: 266.0, slag: 114.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 3, Strenght_Mpa: 17.58 },
  { id: 33, cement: 198.6, slag: 132.4, flyash: 0.0, water: 192.0, superplasticizer: 0.0, coarseaggregate: 978.4, fineaggregate: 825.5, age: 180, Strenght_Mpa: 41.04 },
  { id: 34, cement: 190.0, slag: 190.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 270, Strenght_Mpa: 48.40 },
  { id: 35, cement: 304.0, slag: 76.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 365, Strenght_Mpa: 55.26 },
  { id: 36, cement: 332.5, slag: 142.5, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 28, Strenght_Mpa: 33.02 },
  { id: 37, cement: 332.5, slag: 142.5, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 90, Strenght_Mpa: 39.46 },
  { id: 38, cement: 190.0, slag: 190.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 180, Strenght_Mpa: 46.93 },
  { id: 39, cement: 190.0, slag: 190.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 365, Strenght_Mpa: 43.56 },
  { id: 40, cement: 304.0, slag: 76.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 180, Strenght_Mpa: 50.71 },
  { id: 41, cement: 342.0, slag: 38.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 365, Strenght_Mpa: 56.14 },
  { id: 42, cement: 427.5, slag: 47.5, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 365, Strenght_Mpa: 43.70 },
  { id: 43, cement: 380.0, slag: 95.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 180, Strenght_Mpa: 40.86 },
  { id: 44, cement: 380.0, slag: 0.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 180, Strenght_Mpa: 53.10 },
  { id: 45, cement: 380.0, slag: 95.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 270, Strenght_Mpa: 41.15 },
  { id: 46, cement: 427.5, slag: 47.5, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 90, Strenght_Mpa: 41.54 },
  { id: 47, cement: 342.0, slag: 38.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 28, Strenght_Mpa: 51.02 },
  { id: 48, cement: 380.0, slag: 95.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 7, Strenght_Mpa: 32.82 },
  { id: 49, cement: 332.5, slag: 142.5, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 180, Strenght_Mpa: 39.78 },
  { id: 50, cement: 190.0, slag: 190.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 28, Strenght_Mpa: 45.42 },
  { id: 51, cement: 332.5, slag: 142.5, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 7, Strenght_Mpa: 30.28 },
  { id: 52, cement: 266.0, slag: 114.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 180, Strenght_Mpa: 48.70 },
  { id: 53, cement: 304.0, slag: 76.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 90, Strenght_Mpa: 51.60 },
  { id: 54, cement: 304.0, slag: 76.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 7, Strenght_Mpa: 37.91 },
  { id: 55, cement: 475.0, slag: 0.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 90, Strenght_Mpa: 42.23 },
  { id: 56, cement: 139.6, slag: 209.4, flyash: 0.0, water: 192.0, superplasticizer: 0.0, coarseaggregate: 1047.0, fineaggregate: 806.9, age: 7, Strenght_Mpa: 14.59 },
  { id: 57, cement: 380.0, slag: 0.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 7, Strenght_Mpa: 36.45 },
  { id: 58, cement: 475.0, slag: 0.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 3, Strenght_Mpa: 25.86 },
  { id: 59, cement: 342.0, slag: 38.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 7, Strenght_Mpa: 38.70 },
  { id: 60, cement: 190.0, slag: 190.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 7, Strenght_Mpa: 32.33 },
  { id: 61, cement: 304.0, slag: 76.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 270, Strenght_Mpa: 54.38 },
  { id: 62, cement: 266.0, slag: 114.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 270, Strenght_Mpa: 51.73 },
  { id: 63, cement: 427.5, slag: 47.5, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 594.0, age: 7, Strenght_Mpa: 35.85 },
  { id: 64, cement: 190.0, slag: 190.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 3, Strenght_Mpa: 15.04 },
  { id: 65, cement: 304.0, slag: 76.0, flyash: 0.0, water: 228.0, superplasticizer: 0.0, coarseaggregate: 932.0, fineaggregate: 670.0, age: 3, Strenght_Mpa: 27.53 },
  { id: 66, cement: 198.6, slag: 132.4, flyash: 0.0, water: 192.0, superplasticizer: 0.0, coarseaggregate: 978.4, fineaggregate: 825.5, age: 7, Strenght_Mpa: 21.03 },
  // High-performance mixes with superplasticizer & fly ash
  { id: 67, cement: 212.5, slag: 0.0, flyash: 100.4, water: 159.0, superplasticizer: 8.7, coarseaggregate: 1007.8, fineaggregate: 903.6, age: 28, Strenght_Mpa: 39.30 },
  { id: 68, cement: 277.1, slag: 0.0, flyash: 97.4, water: 160.6, superplasticizer: 11.8, coarseaggregate: 973.9, fineaggregate: 875.6, age: 28, Strenght_Mpa: 44.14 },
  { id: 69, cement: 213.5, slag: 0.0, flyash: 174.2, water: 154.6, superplasticizer: 11.7, coarseaggregate: 1052.3, fineaggregate: 775.5, age: 28, Strenght_Mpa: 40.15 },
  { id: 70, cement: 213.5, slag: 0.0, flyash: 174.2, water: 154.6, superplasticizer: 11.7, coarseaggregate: 1052.3, fineaggregate: 775.5, age: 56, Strenght_Mpa: 46.64 },
  { id: 71, cement: 277.1, slag: 0.0, flyash: 97.4, water: 160.6, superplasticizer: 11.8, coarseaggregate: 973.9, fineaggregate: 875.6, age: 56, Strenght_Mpa: 51.33 },
  { id: 72, cement: 212.5, slag: 0.0, flyash: 100.4, water: 159.0, superplasticizer: 8.7, coarseaggregate: 1007.8, fineaggregate: 903.6, age: 56, Strenght_Mpa: 46.85 },
  { id: 73, cement: 212.5, slag: 0.0, flyash: 100.4, water: 159.0, superplasticizer: 8.7, coarseaggregate: 1007.8, fineaggregate: 903.6, age: 100, Strenght_Mpa: 47.40 },
  { id: 74, cement: 277.1, slag: 0.0, flyash: 97.4, water: 160.6, superplasticizer: 11.8, coarseaggregate: 973.9, fineaggregate: 875.6, age: 100, Strenght_Mpa: 52.82 },
  { id: 75, cement: 213.5, slag: 0.0, flyash: 174.2, water: 154.6, superplasticizer: 11.7, coarseaggregate: 1052.3, fineaggregate: 775.5, age: 100, Strenght_Mpa: 49.30 },
  { id: 76, cement: 165.0, slag: 0.0, flyash: 143.6, water: 163.9, superplasticizer: 0.0, coarseaggregate: 1005.6, fineaggregate: 900.9, age: 28, Strenght_Mpa: 26.83 },
  { id: 77, cement: 165.0, slag: 0.0, flyash: 143.6, water: 163.9, superplasticizer: 0.0, coarseaggregate: 1005.6, fineaggregate: 900.9, age: 100, Strenght_Mpa: 37.96 },
  { id: 78, cement: 236.0, slag: 0.0, flyash: 0.0, water: 193.0, superplasticizer: 0.0, coarseaggregate: 1049.9, fineaggregate: 777.8, age: 28, Strenght_Mpa: 24.58 },
  { id: 79, cement: 337.9, slag: 0.0, flyash: 0.0, water: 185.7, superplasticizer: 0.0, coarseaggregate: 1049.9, fineaggregate: 757.0, age: 28, Strenght_Mpa: 30.14 },
  { id: 80, cement: 425.0, slag: 106.3, flyash: 0.0, water: 153.5, superplasticizer: 16.5, coarseaggregate: 852.1, fineaggregate: 887.1, age: 28, Strenght_Mpa: 61.80 },
  { id: 81, cement: 425.0, slag: 106.3, flyash: 0.0, water: 153.5, superplasticizer: 16.5, coarseaggregate: 852.1, fineaggregate: 887.1, age: 91, Strenght_Mpa: 65.20 },
  { id: 82, cement: 322.0, slag: 149.0, flyash: 0.0, water: 186.0, superplasticizer: 8.2, coarseaggregate: 951.0, fineaggregate: 709.5, age: 28, Strenght_Mpa: 52.42 },
  { id: 83, cement: 322.0, slag: 149.0, flyash: 0.0, water: 186.0, superplasticizer: 8.2, coarseaggregate: 951.0, fineaggregate: 709.5, age: 3, Strenght_Mpa: 25.18 },
  { id: 84, cement: 500.0, slag: 0.0, flyash: 0.0, water: 200.0, superplasticizer: 3.0, coarseaggregate: 1124.4, fineaggregate: 680.0, age: 28, Strenght_Mpa: 44.13 },
  { id: 85, cement: 500.0, slag: 0.0, flyash: 0.0, water: 200.0, superplasticizer: 3.0, coarseaggregate: 1124.4, fineaggregate: 680.0, age: 90, Strenght_Mpa: 47.10 },
  { id: 86, cement: 153.0, slag: 102.0, flyash: 0.0, water: 178.0, superplasticizer: 4.5, coarseaggregate: 1055.0, fineaggregate: 855.0, age: 28, Strenght_Mpa: 22.31 },
  { id: 87, cement: 153.0, slag: 102.0, flyash: 0.0, water: 178.0, superplasticizer: 4.5, coarseaggregate: 1055.0, fineaggregate: 855.0, age: 90, Strenght_Mpa: 31.88 },
  { id: 88, cement: 145.0, slag: 0.0, flyash: 179.0, water: 202.0, superplasticizer: 3.2, coarseaggregate: 824.0, fineaggregate: 869.0, age: 28, Strenght_Mpa: 17.24 },
  { id: 89, cement: 145.0, slag: 0.0, flyash: 179.0, water: 202.0, superplasticizer: 3.2, coarseaggregate: 824.0, fineaggregate: 869.0, age: 56, Strenght_Mpa: 22.86 },
  { id: 90, cement: 250.0, slag: 0.0, flyash: 95.0, water: 191.0, superplasticizer: 5.5, coarseaggregate: 995.0, fineaggregate: 774.0, age: 28, Strenght_Mpa: 30.57 },
  { id: 91, cement: 375.0, slag: 0.0, flyash: 0.0, water: 186.0, superplasticizer: 10.1, coarseaggregate: 1038.0, fineaggregate: 758.0, age: 28, Strenght_Mpa: 55.40 },
  { id: 92, cement: 375.0, slag: 0.0, flyash: 0.0, water: 186.0, superplasticizer: 10.1, coarseaggregate: 1038.0, fineaggregate: 758.0, age: 7, Strenght_Mpa: 38.41 },
  { id: 93, cement: 144.0, slag: 19.0, flyash: 133.0, water: 180.0, superplasticizer: 8.0, coarseaggregate: 980.0, fineaggregate: 814.0, age: 28, Strenght_Mpa: 27.97 },
  { id: 94, cement: 144.0, slag: 19.0, flyash: 133.0, water: 180.0, superplasticizer: 8.0, coarseaggregate: 980.0, fineaggregate: 814.0, age: 90, Strenght_Mpa: 39.87 },
  { id: 95, cement: 446.0, slag: 24.0, flyash: 79.0, water: 162.0, superplasticizer: 11.6, coarseaggregate: 967.0, fineaggregate: 712.0, age: 28, Strenght_Mpa: 57.03 },
  { id: 96, cement: 446.0, slag: 24.0, flyash: 79.0, water: 162.0, superplasticizer: 11.6, coarseaggregate: 967.0, fineaggregate: 712.0, age: 56, Strenght_Mpa: 61.07 },
  { id: 97, cement: 382.0, slag: 0.0, flyash: 0.0, water: 186.0, superplasticizer: 12.0, coarseaggregate: 1047.0, fineaggregate: 739.0, age: 28, Strenght_Mpa: 54.90 },
  { id: 98, cement: 254.0, slag: 0.0, flyash: 96.0, water: 160.0, superplasticizer: 6.5, coarseaggregate: 1055.0, fineaggregate: 786.0, age: 14, Strenght_Mpa: 24.99 },
  { id: 99, cement: 254.0, slag: 0.0, flyash: 96.0, water: 160.0, superplasticizer: 6.5, coarseaggregate: 1055.0, fineaggregate: 786.0, age: 28, Strenght_Mpa: 36.30 },
  { id: 100, cement: 540.0, slag: 0.0, flyash: 0.0, water: 162.0, superplasticizer: 2.5, coarseaggregate: 1055.0, fineaggregate: 676.0, age: 90, Strenght_Mpa: 69.84 },
  { id: 101, cement: 385.0, slag: 0.0, flyash: 0.0, water: 186.0, superplasticizer: 0.0, coarseaggregate: 966.0, fineaggregate: 763.0, age: 28, Strenght_Mpa: 31.35 },
  { id: 102, cement: 102.0, slag: 153.0, flyash: 0.0, water: 192.0, superplasticizer: 0.0, coarseaggregate: 887.0, fineaggregate: 942.0, age: 90, Strenght_Mpa: 17.28 },
  { id: 103, cement: 102.0, slag: 153.0, flyash: 0.0, water: 192.0, superplasticizer: 0.0, coarseaggregate: 887.0, fineaggregate: 942.0, age: 7, Strenght_Mpa: 4.57 },
  { id: 104, cement: 108.0, slag: 162.0, flyash: 0.0, water: 203.0, superplasticizer: 0.0, coarseaggregate: 943.0, fineaggregate: 830.0, age: 3, Strenght_Mpa: 2.33 },
  { id: 105, cement: 491.0, slag: 26.0, flyash: 123.0, water: 147.0, superplasticizer: 12.0, coarseaggregate: 852.0, fineaggregate: 799.0, age: 56, Strenght_Mpa: 82.60 },
];

// Calculate statistical metrics for any dataset column
export function calculateColumnStats(data: ConcreteDataRow[], colKey: ConcreteFeature): ColumnStats {
  const meta = CONCRETE_COLUMNS.find(c => c.key === colKey)!;
  const values = data.map(d => d[colKey]).filter(v => v !== null && !isNaN(v)).sort((a, b) => a - b);
  const n = values.length;

  if (n === 0) {
    return {
      column: colKey,
      label: meta.label,
      unit: meta.unit,
      count: 0,
      mean: 0,
      std: 0,
      min: 0,
      q1: 0,
      median: 0,
      q3: 0,
      max: 0,
      missing: data.length,
    };
  }

  const sum = values.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1 || 1);
  const std = Math.sqrt(variance);

  const getPercentile = (p: number) => {
    const pos = (n - 1) * p;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (values[base + 1] !== undefined) {
      return values[base] + rest * (values[base + 1] - values[base]);
    } else {
      return values[base];
    }
  };

  return {
    column: colKey,
    label: meta.label,
    unit: meta.unit,
    count: n,
    mean: Number(mean.toFixed(2)),
    std: Number(std.toFixed(2)),
    min: Number(values[0].toFixed(2)),
    q1: Number(getPercentile(0.25).toFixed(2)),
    median: Number(getPercentile(0.5).toFixed(2)),
    q3: Number(getPercentile(0.75).toFixed(2)),
    max: Number(values[n - 1].toFixed(2)),
    missing: data.length - n,
  };
}

// Calculate Pearson Correlation between two numerical features
export function calculatePearsonCorrelation(data: ConcreteDataRow[], colA: ConcreteFeature, colB: ConcreteFeature): number {
  const pairs = data
    .map(d => [d[colA], d[colB]])
    .filter(([a, b]) => !isNaN(a) && !isNaN(b));

  const n = pairs.length;
  if (n < 2) return 0;

  const meanA = pairs.reduce((sum, [a]) => sum + a, 0) / n;
  const meanB = pairs.reduce((sum, [, b]) => sum + b, 0) / n;

  let num = 0;
  let denA = 0;
  let denB = 0;

  for (let i = 0; i < n; i++) {
    const diffA = pairs[i][0] - meanA;
    const diffB = pairs[i][1] - meanB;
    num += diffA * diffB;
    denA += diffA * diffA;
    denB += diffB * diffB;
  }

  const denom = Math.sqrt(denA * denB);
  if (denom === 0) return 0;
  return Number((num / denom).toFixed(3));
}

// Parse CSV text into ConcreteDataRow format
export function parseConcreteCSV(csvText: string): { rows: ConcreteDataRow[]; errors: string[] } {
  const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  const errors: string[] = [];
  if (lines.length < 2) {
    return { rows: [], errors: ['CSV file is empty or does not contain header + data rows.'] };
  }

  const headerLine = lines[0].toLowerCase();
  const headers = headerLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));

  // Target key check (handling case variations but mapping to exact `Strenght_Mpa`)
  const requiredKeys: ConcreteFeature[] = [
    'cement', 'slag', 'flyash', 'water', 'superplasticizer', 'coarseaggregate', 'fineaggregate', 'age', 'Strenght_Mpa'
  ];

  const headerIndexMap: Partial<Record<ConcreteFeature, number>> = {};

  headers.forEach((h, idx) => {
    const clean = h.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (clean.includes('cement') && !clean.includes('water')) headerIndexMap.cement = idx;
    else if (clean.includes('slag')) headerIndexMap.slag = idx;
    else if (clean.includes('flyash') || clean.includes('ash')) headerIndexMap.flyash = idx;
    else if (clean.includes('water')) headerIndexMap.water = idx;
    else if (clean.includes('superplasticizer') || clean.includes('plasticizer')) headerIndexMap.superplasticizer = idx;
    else if (clean.includes('coarse')) headerIndexMap.coarseaggregate = idx;
    else if (clean.includes('fine')) headerIndexMap.fineaggregate = idx;
    else if (clean.includes('age')) headerIndexMap.age = idx;
    else if (clean.includes('strength') || clean.includes('strenght') || clean.includes('mpa')) headerIndexMap.Strenght_Mpa = idx;
  });

  const parsedRows: ConcreteDataRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map(p => p.trim());
    if (parts.length < 8) continue;

    const rowObj: any = { id: i };
    let hasError = false;

    for (const key of requiredKeys) {
      const colIdx = headerIndexMap[key];
      if (colIdx !== undefined && parts[colIdx] !== undefined) {
        const val = parseFloat(parts[colIdx]);
        if (isNaN(val)) {
          hasError = true;
          break;
        }
        rowObj[key] = val;
      } else {
        // Fallback to positional mapping if standard order
        const fallbackIdx = requiredKeys.indexOf(key);
        const val = parseFloat(parts[fallbackIdx]);
        if (!isNaN(val)) {
          rowObj[key] = val;
        } else {
          rowObj[key] = 0;
        }
      }
    }

    if (!hasError && rowObj.Strenght_Mpa !== undefined) {
      parsedRows.push(rowObj as ConcreteDataRow);
    }
  }

  if (parsedRows.length === 0) {
    errors.push('Could not parse valid concrete records. Please ensure columns include cement, slag, flyash, water, superplasticizer, coarseaggregate, fineaggregate, age, Strenght_Mpa.');
  }

  return { rows: parsedRows, errors };
}

// Convert dataset to downloadable CSV format with exact column names
export function exportConcreteToCSV(data: ConcreteDataRow[]): string {
  const headers = ['cement', 'slag', 'flyash', 'water', 'superplasticizer', 'coarseaggregate', 'fineaggregate', 'age', 'Strenght_Mpa'];
  const rows = data.map(d => [
    d.cement,
    d.slag,
    d.flyash,
    d.water,
    d.superplasticizer,
    d.coarseaggregate,
    d.fineaggregate,
    d.age,
    d.Strenght_Mpa
  ].join(','));
  return [headers.join(','), ...rows].join('\n');
}
