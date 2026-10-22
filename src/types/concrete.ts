export interface ConcreteDataRow {
  id: number;
  cement: number;
  slag: number;
  flyash: number;
  water: number;
  superplasticizer: number;
  coarseaggregate: number;
  fineaggregate: number;
  age: number;
  Strenght_Mpa: number; // Exact target column spelling preserved as specified
}

export type ConcreteFeature = keyof Omit<ConcreteDataRow, 'id'>;

export interface ColumnMetadata {
  key: ConcreteFeature;
  label: string;
  unit: string;
  description: string;
  minVal: number;
  maxVal: number;
}

export interface ColumnStats {
  column: ConcreteFeature;
  label: string;
  unit: string;
  count: number;
  mean: number;
  std: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  missing: number;
}

export interface PreprocessingOptions {
  removeDuplicates: boolean;
  missingHandling: 'none' | 'drop' | 'mean' | 'median';
  scalingMethod: 'none' | 'minmax' | 'zscore';
  outlierRemoval: boolean;
}

export interface PreprocessingSummary {
  originalRows: number;
  processedRows: number;
  duplicatesRemoved: number;
  missingValuesFixed: number;
  scalingApplied: string;
  outliersRemoved: number;
}

export interface RegressionCoefficient {
  term: string;
  estimate: number;
  stdError: number;
  tValue: number;
  pValue: number;
}

export interface RegressionResult {
  modelType: 'simple' | 'multiple';
  predictor: string;
  formula: string;
  rSquared: number;
  adjRSquared: number;
  mae: number;
  rmse: number;
  fStatistic: number;
  coefficients: RegressionCoefficient[];
  actualVsPredicted: Array<{
    id: number;
    actual: number;
    predicted: number;
    residual: number;
  }>;
  residualsSummary: {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
  };
  isDemo: boolean;
}

export interface ConcretePredictionInput {
  cement: number;
  slag: number;
  flyash: number;
  water: number;
  superplasticizer: number;
  coarseaggregate: number;
  fineaggregate: number;
  age: number;
}

export interface PredictionResult {
  predictedStrength: number;
  lowerConfidence95: number;
  upperConfidence95: number;
  waterCementRatio: number;
  mixEvaluation: {
    status: 'optimal' | 'acceptable' | 'warning';
    notes: string[];
  };
  isDemo: boolean;
}

export interface ConfusionMatrixData {
  labels: string[];
  matrix: number[][]; // [trueLabelIndex][predictedLabelIndex]
}

export interface ClassificationResult {
  algorithm: 'decisionTree' | 'naiveBayes';
  targetBins: {
    low: number;
    high: number;
  };
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: ConfusionMatrixData;
  classMetrics: Array<{
    className: string;
    precision: number;
    recall: number;
    f1: number;
    support: number;
  }>;
  treeRules?: Array<{
    condition: string;
    prediction: string;
    samples: number;
    confidence: number;
  }>;
  priorProbabilities?: Record<string, number>;
  isDemo: boolean;
}

export interface PCAPoint {
  id: number;
  pca1: number;
  pca2: number;
  cluster: number;
  strength: number;
  cement: number;
  age: number;
}

export interface ClusterProfile {
  cluster: number;
  count: number;
  percentage: number;
  meanCement: number;
  meanWater: number;
  meanAge: number;
  meanStrength: number;
  meanWCRatio: number;
  characterization: string;
}

export interface ClusteringResult {
  algorithm: 'kmeans' | 'agglomerative';
  k: number;
  linkage?: 'ward.D2' | 'complete' | 'average';
  silhouetteScore: number;
  wcss?: number;
  clusterProfiles: ClusterProfile[];
  pcaPoints: PCAPoint[];
  elbowData: Array<{
    k: number;
    wcss: number;
    silhouette: number;
  }>;
  isDemo: boolean;
}

export interface AssociationRule {
  id: string;
  lhs: string[];
  rhs: string[];
  support: number;
  confidence: number;
  lift: number;
  count: number;
}

export interface FrequentItemset {
  items: string[];
  support: number;
  count: number;
}

export interface AssociationRulesResult {
  minSupport: number;
  minConfidence: number;
  minLift: number;
  totalRulesFound: number;
  frequentItemsets: FrequentItemset[];
  rules: AssociationRule[];
  isDemo: boolean;
}

export interface OlapCubeQuery {
  rollUpLevel: 'all' | 'age_bracket' | 'strength_class';
  sliceAge?: number;
  diceWaterMax?: number;
  diceSuperplasticizerMin?: number;
  pivotRow: 'age_bracket' | 'admixture' | 'wc_ratio';
  pivotCol: 'strength_class' | 'superplasticizer';
}

export interface ExperimentReport {
  id: number;
  experimentNumber: number;
  title: string;
  objective: string;
  academicBackground: string;
  methodology: string;
  rPackages: string[];
  experimentalParameters: Record<string, string>;
  datasetUsed: string;
  keyFindings: string[];
  academicInterpretation: string;
  engineeringConclusions: string[];
  rCodeSnippet: string;
}

export interface DatasetStatisticsResponse {
  stats: ColumnStats[];
  totalRows: number;
  isDemo: boolean;
  source: 'r_backend' | 'client_fallback';
  error?: string;
  backendTimestamp?: string;
}

export interface BackendStatus {
  isConnected: boolean;
  baseUrl: string;
  latencyMs?: number;
  lastChecked?: string;
  version?: string;
  error?: string;
  isDemo: boolean;
  endpoints?: {
    health: boolean;
    statistics: boolean;
  };
}
