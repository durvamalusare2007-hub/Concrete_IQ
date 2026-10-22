import {
  AssociationRulesResult,
  BackendStatus,
  ClassificationResult,
  ClusteringResult,
  ColumnStats,
  ConcreteDataRow,
  ConcreteFeature,
  ConcretePredictionInput,
  DatasetStatisticsResponse,
  OlapCubeQuery,
  PredictionResult,
  PreprocessingOptions,
  PreprocessingSummary,
  RegressionResult,
} from '../types/concrete';
import { calculateColumnStats, CONCRETE_COLUMNS, INITIAL_CONCRETE_DATA } from '../data/concreteDataset';
import { executeOlapQuery } from '../data/defaultOlapData';

// API Configuration: default to http://localhost:8000/api while allowing VITE_R_API_BASE_URL override
const DEFAULT_API_BASE_URL = (import.meta.env.VITE_R_API_BASE_URL as string) || 'http://localhost:8000/api';

class ConcreteApiService {
  private baseUrl: string = DEFAULT_API_BASE_URL;
  private isConnected: boolean = false;
  private lastChecked: string | null = null;
  private latencyMs: number = 0;
  private lastError: string | undefined = undefined;
  private backendVersion: string | undefined = undefined;
  private statusListeners: Array<(status: BackendStatus) => void> = [];

  constructor() {
    // Check connection status on initialization
    this.checkBackendHealth();
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.trim().replace(/\/$/, '');
    this.checkBackendHealth();
  }

  public subscribeStatus(listener: (status: BackendStatus) => void): () => void {
    this.statusListeners.push(listener);
    listener(this.getStatus());
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  public getStatus(): BackendStatus {
    return {
      isConnected: this.isConnected,
      baseUrl: this.baseUrl,
      latencyMs: this.latencyMs,
      lastChecked: this.lastChecked || 'Never checked',
      version: this.backendVersion,
      error: this.lastError,
      isDemo: !this.isConnected,
      endpoints: {
        health: this.isConnected,
        statistics: this.isConnected,
      },
    };
  }

  private notifyStatus() {
    const status = this.getStatus();
    this.statusListeners.forEach(listener => listener(status));
  }

  /**
   * Connection-status check: calls GET /api/health on the R Plumber backend
   */
  public async checkBackendHealth(): Promise<BackendStatus> {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

      const res = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      this.latencyMs = Math.round(performance.now() - start);
      this.lastChecked = new Date().toLocaleTimeString();

      if (res.ok) {
        this.isConnected = true;
        this.lastError = undefined;
        try {
          const data = await res.json();
          if (data && typeof data === 'object') {
            this.backendVersion = data.version || data.engine || 'R Plumber';
          }
        } catch {
          this.backendVersion = 'R Plumber (OK)';
        }
      } else {
        this.isConnected = false;
        this.lastError = `R Backend at ${this.baseUrl}/health returned HTTP ${res.status}: ${res.statusText || 'Health check failed'}`;
      }
    } catch (err: any) {
      this.latencyMs = 0;
      this.lastChecked = new Date().toLocaleTimeString();
      this.isConnected = false;
      if (err.name === 'AbortError') {
        this.lastError = `Connection timeout: R backend at ${this.baseUrl}/health did not respond within 3500ms`;
      } else {
        this.lastError = `Cannot connect to R backend at ${this.baseUrl}/health: ${err.message || 'Connection refused or CORS error'}`;
      }
    }

    this.notifyStatus();
    return this.getStatus();
  }

  /**
   * Sends the current active dataset as JSON using POST /api/statistics with Content-Type: application/json
   * Ensures uploaded CSV rows (not just the bundled sample dataset) are sent to the backend.
   */
  public async getDatasetStatistics(currentData: ConcreteDataRow[] = INITIAL_CONCRETE_DATA): Promise<DatasetStatisticsResponse> {
    if (this.isConnected) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout for large uploads

        // Send active dataset array directly as JSON payload
        const res = await fetch(`${this.baseUrl}/statistics`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(currentData),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          const parsedStats = this.normalizeBackendStats(json, currentData);
          const totalRows = (typeof json.totalRows === 'number') ? json.totalRows : currentData.length;

          return {
            stats: parsedStats,
            totalRows,
            isDemo: false,
            source: 'r_backend',
            backendTimestamp: json.time || new Date().toLocaleTimeString(),
          };
        } else {
          const errorText = await res.text().catch(() => '');
          const errMsg = `R Backend HTTP ${res.status} error on POST ${this.baseUrl}/statistics: ${errorText || res.statusText}`;
          this.lastError = errMsg;
          this.notifyStatus();

          return {
            stats: CONCRETE_COLUMNS.map(col => calculateColumnStats(currentData, col.key)),
            totalRows: currentData.length,
            isDemo: true,
            source: 'client_fallback',
            error: errMsg,
          };
        }
      } catch (err: any) {
        const errMsg = `Failed to post active dataset (${currentData.length} rows) to ${this.baseUrl}/statistics: ${err.message || 'Network error'}`;
        this.lastError = errMsg;
        this.notifyStatus();

        return {
          stats: CONCRETE_COLUMNS.map(col => calculateColumnStats(currentData, col.key)),
          totalRows: currentData.length,
          isDemo: true,
          source: 'client_fallback',
          error: errMsg,
        };
      }
    }

    // Backend not connected: return client-side calculation
    return {
      stats: CONCRETE_COLUMNS.map(col => calculateColumnStats(currentData, col.key)),
      totalRows: currentData.length,
      isDemo: true,
      source: 'client_fallback',
    };
  }

  /**
   * Helper to normalize R statistics output into standard ColumnStats structure.
   * Accommodates both array-of-stats, object keyed by column names, and R psych/summary formats.
   */
  private normalizeBackendStats(json: any, currentData: ConcreteDataRow[]): ColumnStats[] {
    const rawList: any[] = Array.isArray(json)
      ? json
      : Array.isArray(json.stats)
      ? json.stats
      : json.stats && typeof json.stats === 'object'
      ? Object.entries(json.stats).map(([k, v]: [string, any]) => ({ column: k, ...v }))
      : [];

    return CONCRETE_COLUMNS.map(col => {
      const fallback = calculateColumnStats(currentData, col.key);
      const match = rawList.find((item: any) => {
        const colName = (item.column || item.feature || item.variable || item.name || '').toLowerCase();
        return colName === col.key.toLowerCase();
      });

      if (!match) return fallback;

      return {
        column: col.key,
        label: col.label,
        unit: col.unit,
        count: match.count ?? match.n ?? match.N ?? fallback.count,
        mean: Number(match.mean ?? match.Mean ?? match.avg ?? fallback.mean),
        std: Number(match.std ?? match.sd ?? match.SD ?? match.stdDev ?? fallback.std),
        min: Number(match.min ?? match.Min ?? fallback.min),
        q1: Number(match.q1 ?? match.Q1 ?? match['25%'] ?? fallback.q1),
        median: Number(match.median ?? match.Median ?? match.med ?? fallback.median),
        q3: Number(match.q3 ?? match.Q3 ?? match['75%'] ?? fallback.q3),
        max: Number(match.max ?? match.Max ?? fallback.max),
        missing: Number(match.missing ?? match.Missing ?? match.na ?? match.NA ?? fallback.missing),
      };
    });
  }

  // =========================================================================
  // DEMO IMPLEMENTATIONS FOR ALGORITHMS NOT YET DEPLOYED ON R BACKEND
  // Note: Only GET /api/health and POST /api/statistics exist on the R backend.
  // The algorithms below are explicitly marked isDemo: true to avoid inventing
  // fake endpoints or claiming live execution.
  // =========================================================================

  // Preprocessing (Demo / client-side transformation)
  public async runPreprocessing(
    data: ConcreteDataRow[],
    options: PreprocessingOptions
  ): Promise<{
    processedData: ConcreteDataRow[];
    summary: PreprocessingSummary;
    isDemo: boolean;
  }> {
    let processed = [...data];
    let duplicatesRemoved = 0;
    const missingFixed = 0;

    if (options.removeDuplicates) {
      const seen = new Set<string>();
      processed = processed.filter(row => {
        const key = `${row.cement}_${row.slag}_${row.flyash}_${row.water}_${row.superplasticizer}_${row.coarseaggregate}_${row.fineaggregate}_${row.age}`;
        if (seen.has(key)) {
          duplicatesRemoved++;
          return false;
        }
        seen.add(key);
        return true;
      });
    }

    if (options.scalingMethod === 'minmax') {
      const statsMap = new Map<ConcreteFeature, { min: number; max: number }>();
      CONCRETE_COLUMNS.forEach(c => {
        const vals = processed.map(r => r[c.key]);
        statsMap.set(c.key, { min: Math.min(...vals), max: Math.max(...vals) });
      });

      processed = processed.map(row => {
        const copy: any = { ...row };
        (['cement', 'slag', 'flyash', 'water', 'superplasticizer', 'coarseaggregate', 'fineaggregate', 'age'] as ConcreteFeature[]).forEach(feat => {
          const { min, max } = statsMap.get(feat)!;
          const range = max - min || 1;
          copy[feat] = Number(((row[feat] - min) / range).toFixed(4));
        });
        return copy as ConcreteDataRow;
      });
    } else if (options.scalingMethod === 'zscore') {
      const statsMap = new Map<ConcreteFeature, { mean: number; std: number }>();
      CONCRETE_COLUMNS.forEach(c => {
        const stat = calculateColumnStats(processed, c.key);
        statsMap.set(c.key, { mean: stat.mean, std: stat.std || 1 });
      });

      processed = processed.map(row => {
        const copy: any = { ...row };
        (['cement', 'slag', 'flyash', 'water', 'superplasticizer', 'coarseaggregate', 'fineaggregate', 'age'] as ConcreteFeature[]).forEach(feat => {
          const { mean, std } = statsMap.get(feat)!;
          copy[feat] = Number(((row[feat] - mean) / std).toFixed(4));
        });
        return copy as ConcreteDataRow;
      });
    }

    return {
      processedData: processed,
      summary: {
        originalRows: data.length,
        processedRows: processed.length,
        duplicatesRemoved,
        missingValuesFixed: missingFixed,
        scalingApplied: options.scalingMethod === 'minmax' ? 'Min-Max Normalization [0, 1]' : options.scalingMethod === 'zscore' ? 'Z-Score Standardization (N(0, 1))' : 'None (Raw Unscaled Units)',
        outliersRemoved: 0,
      },
      isDemo: true,
    };
  }

  // Regression (Demo benchmark parameters from R Experiments 5 & 6)
  public async runRegression(
    type: 'simple' | 'multiple',
    singlePredictor: ConcreteFeature = 'cement',
    data: ConcreteDataRow[] = INITIAL_CONCRETE_DATA
  ): Promise<RegressionResult> {
    if (type === 'simple') {
      const intercept = 13.44;
      const slope = 0.0796;
      const actualVsPredicted = data.slice(0, 50).map(d => {
        const pred = Number((intercept + slope * d[singlePredictor]).toFixed(2));
        return {
          id: d.id,
          actual: d.Strenght_Mpa,
          predicted: pred,
          residual: Number((d.Strenght_Mpa - pred).toFixed(2)),
        };
      });

      return {
        modelType: 'simple',
        predictor: singlePredictor,
        formula: `Strenght_Mpa = 13.4425 + 0.0796 × (${singlePredictor})`,
        rSquared: 0.2483,
        adjRSquared: 0.2476,
        mae: 11.78,
        rmse: 14.50,
        fStatistic: 339.8,
        coefficients: [
          { term: '(Intercept)', estimate: 13.4425, stdError: 1.2941, tValue: 10.39, pValue: 1.2e-23 },
          { term: singlePredictor, estimate: 0.0796, stdError: 0.0043, tValue: 18.43, pValue: 2.1e-64 },
        ],
        actualVsPredicted,
        residualsSummary: { min: -29.2, q1: -10.1, median: -1.4, q3: 8.8, max: 37.1 },
        isDemo: true,
      };
    } else {
      const coeffs = {
        intercept: -23.332,
        cement: 0.1198,
        slag: 0.1039,
        flyash: 0.0879,
        water: -0.1499,
        superplasticizer: 0.2922,
        coarseaggregate: 0.0181,
        fineaggregate: 0.0211,
        age: 0.1142,
      };

      const actualVsPredicted = data.slice(0, 50).map(d => {
        const pred = Number((
          coeffs.intercept +
          coeffs.cement * d.cement +
          coeffs.slag * d.slag +
          coeffs.flyash * d.flyash +
          coeffs.water * d.water +
          coeffs.superplasticizer * d.superplasticizer +
          coeffs.coarseaggregate * d.coarseaggregate +
          coeffs.fineaggregate * d.fineaggregate +
          coeffs.age * d.age
        ).toFixed(2));

        return {
          id: d.id,
          actual: d.Strenght_Mpa,
          predicted: pred,
          residual: Number((d.Strenght_Mpa - pred).toFixed(2)),
        };
      });

      return {
        modelType: 'multiple',
        predictor: 'all 8 features',
        formula: 'Strenght_Mpa = -23.33 + 0.12(cement) + 0.10(slag) + 0.088(flyash) - 0.15(water) + 0.29(superplasticizer) + 0.018(coarseagg) + 0.021(fineagg) + 0.114(age)',
        rSquared: 0.6155,
        adjRSquared: 0.6125,
        mae: 8.24,
        rmse: 10.38,
        fStatistic: 204.3,
        coefficients: [
          { term: '(Intercept)', estimate: -23.332, stdError: 26.58, tValue: -0.88, pValue: 0.380 },
          { term: 'cement', estimate: 0.1198, stdError: 0.0085, tValue: 14.12, pValue: 2.4e-41 },
          { term: 'slag', estimate: 0.1039, stdError: 0.0101, tValue: 10.25, pValue: 1.1e-23 },
          { term: 'flyash', estimate: 0.0879, stdError: 0.0126, tValue: 6.98, pValue: 5.3e-12 },
          { term: 'water', estimate: -0.1499, stdError: 0.0402, tValue: -3.73, pValue: 0.0002 },
          { term: 'superplasticizer', estimate: 0.2922, stdError: 0.0934, tValue: 3.13, pValue: 0.0018 },
          { term: 'coarseaggregate', estimate: 0.0181, stdError: 0.0094, tValue: 1.93, pValue: 0.049 },
          { term: 'fineaggregate', estimate: 0.0211, stdError: 0.0107, tValue: 1.97, pValue: 0.048 },
          { term: 'age', estimate: 0.1142, stdError: 0.0054, tValue: 21.05, pValue: 3.2e-78 },
        ],
        actualVsPredicted,
        residualsSummary: { min: -28.6, q1: -6.2, median: -0.4, q3: 5.9, max: 34.5 },
        isDemo: true,
      };
    }
  }

  // Predict Strength (Demo formula from Experiment 6)
  public async predictStrength(input: ConcretePredictionInput): Promise<PredictionResult> {
    const predicted = (
      -23.332 +
      0.1198 * input.cement +
      0.1039 * input.slag +
      0.0879 * input.flyash -
      0.1499 * input.water +
      0.2922 * input.superplasticizer +
      0.0181 * input.coarseaggregate +
      0.0211 * input.fineaggregate +
      0.1142 * input.age
    );

    const safePredicted = Math.max(1.0, Number(predicted.toFixed(2)));
    const totalBinder = input.cement + input.slag + input.flyash;
    const wcRatio = totalBinder > 0 ? Number((input.water / totalBinder).toFixed(2)) : 0.5;

    const notes: string[] = [];
    let status: 'optimal' | 'acceptable' | 'warning' = 'acceptable';

    if (wcRatio > 0.60) {
      status = 'warning';
      notes.push('High water-to-cementitious ratio (>0.60) can result in excessive porosity and lower durability.');
    } else if (wcRatio < 0.35 && input.superplasticizer < 3) {
      status = 'warning';
      notes.push('Very low water content (<0.35) without sufficient superplasticizer may impair mix workability.');
    } else {
      status = 'optimal';
      notes.push('Water-to-binder ratio falls within standard structural concrete design guidelines (ACI 211).');
    }

    if (input.age < 7) {
      notes.push('Early age test (< 7 days) captures initial hydration; strength will significantly increase by 28 days.');
    }

    return {
      predictedStrength: safePredicted,
      lowerConfidence95: Number(Math.max(0, safePredicted - 10.38).toFixed(2)),
      upperConfidence95: Number((safePredicted + 10.38).toFixed(2)),
      waterCementRatio: wcRatio,
      mixEvaluation: { status, notes },
      isDemo: true,
    };
  }

  // Classification (Demo benchmark models from Experiments 7 & 8)
  public async runClassification(
    algorithm: 'decisionTree' | 'naiveBayes',
    targetBins = { low: 25, high: 45 }
  ): Promise<ClassificationResult> {
    if (algorithm === 'decisionTree') {
      return {
        algorithm: 'decisionTree',
        targetBins,
        accuracy: 81.2,
        precision: 81.6,
        recall: 80.9,
        f1Score: 81.2,
        confusionMatrix: {
          labels: ['Low (< 25 MPa)', 'Medium (25 - 45 MPa)', 'High (> 45 MPa)'],
          matrix: [
            [61, 12, 1],
            [10, 122, 15],
            [0, 20, 68],
          ],
        },
        classMetrics: [
          { className: 'Low (< 25 MPa)', precision: 85.9, recall: 82.4, f1: 84.1, support: 74 },
          { className: 'Medium (25 - 45 MPa)', precision: 79.2, recall: 83.0, f1: 81.1, support: 147 },
          { className: 'High (> 45 MPa)', precision: 81.0, recall: 77.3, f1: 79.1, support: 88 },
        ],
        treeRules: [
          { condition: 'age < 21.5 AND cement < 290.0', prediction: 'Low (< 25 MPa)', samples: 68, confidence: 91.2 },
          { condition: 'age < 21.5 AND cement >= 290.0 AND water >= 185.0', prediction: 'Medium (25 - 45 MPa)', samples: 44, confidence: 75.0 },
          { condition: 'age >= 21.5 AND cement < 240.0 AND flyash == 0', prediction: 'Low (< 25 MPa)', samples: 22, confidence: 81.8 },
          { condition: 'age >= 21.5 AND cement >= 240.0 AND water < 165.0 AND superplasticizer > 5.0', prediction: 'High (> 45 MPa)', samples: 86, confidence: 88.4 },
          { condition: 'age >= 21.5 AND water >= 165.0', prediction: 'Medium (25 - 45 MPa)', samples: 89, confidence: 82.0 },
        ],
        isDemo: true,
      };
    } else {
      return {
        algorithm: 'naiveBayes',
        targetBins,
        accuracy: 74.8,
        precision: 75.4,
        recall: 74.9,
        f1Score: 75.1,
        priorProbabilities: {
          'Low (< 25 MPa)': 0.241,
          'Medium (25 - 45 MPa)': 0.473,
          'High (> 45 MPa)': 0.286,
        },
        confusionMatrix: {
          labels: ['Low (< 25 MPa)', 'Medium (25 - 45 MPa)', 'High (> 45 MPa)'],
          matrix: [
            [62, 10, 2],
            [22, 104, 21],
            [3, 20, 65],
          ],
        },
        classMetrics: [
          { className: 'Low (< 25 MPa)', precision: 71.3, recall: 83.8, f1: 77.0, support: 74 },
          { className: 'Medium (25 - 45 MPa)', precision: 77.6, recall: 70.7, f1: 74.0, support: 147 },
          { className: 'High (> 45 MPa)', precision: 73.9, recall: 73.9, f1: 73.9, support: 88 },
        ],
        isDemo: true,
      };
    }
  }

  // Clustering (Demo benchmark from Experiment 9)
  public async runClustering(
    algorithm: 'kmeans' | 'agglomerative',
    k: number = 3,
    linkage: 'ward.D2' | 'complete' | 'average' = 'ward.D2',
    data: ConcreteDataRow[] = INITIAL_CONCRETE_DATA
  ): Promise<ClusteringResult> {
    const pcaPoints = data.slice(0, 80).map((d, idx) => {
      const pca1 = Number(((d.cement * 0.45 + d.Strenght_Mpa * 0.5 - d.water * 0.3) / 100 - 1.2).toFixed(2));
      const pca2 = Number(((d.age * 0.05 + d.slag * 0.01 - d.flyash * 0.01) - 0.5).toFixed(2));
      const cluster = (idx % k) + 1;
      return {
        id: d.id,
        pca1,
        pca2,
        cluster,
        strength: d.Strenght_Mpa,
        cement: d.cement,
        age: d.age,
      };
    });

    const clusterProfiles = [
      {
        cluster: 1,
        count: Math.round(data.length * 0.35),
        percentage: 35,
        meanCement: 392.5,
        meanWater: 164.2,
        meanAge: 48.6,
        meanStrength: 54.2,
        meanWCRatio: 0.38,
        characterization: 'High Performance / High Early-Strength Mixes',
      },
      {
        cluster: 2,
        count: Math.round(data.length * 0.42),
        percentage: 42,
        meanCement: 265.8,
        meanWater: 184.1,
        meanAge: 32.4,
        meanStrength: 34.6,
        meanWCRatio: 0.52,
        characterization: 'Standard Structural Ready-Mix Grade',
      },
      {
        cluster: 3,
        count: Math.round(data.length * 0.23),
        percentage: 23,
        meanCement: 182.4,
        meanWater: 202.6,
        meanAge: 18.2,
        meanStrength: 18.9,
        meanWCRatio: 0.68,
        characterization: 'Lean / Mass Concrete / Early Uncured Cylinders',
      },
    ].slice(0, k);

    return {
      algorithm,
      k,
      linkage: algorithm === 'agglomerative' ? linkage : undefined,
      silhouetteScore: k === 3 ? 0.312 : k === 2 ? 0.285 : 0.264,
      wcss: k === 3 ? 4210.5 : k === 2 ? 5890.2 : 3620.1,
      clusterProfiles,
      pcaPoints,
      elbowData: [
        { k: 2, wcss: 5890, silhouette: 0.285 },
        { k: 3, wcss: 4210, silhouette: 0.312 },
        { k: 4, wcss: 3620, silhouette: 0.264 },
        { k: 5, wcss: 3150, silhouette: 0.241 },
        { k: 6, wcss: 2790, silhouette: 0.228 },
      ],
      isDemo: true,
    };
  }

  // Association Rules Mining (Demo Apriori from Experiment 9)
  public async runAssociationRules(
    minSupport: number = 0.08,
    minConfidence: number = 0.65,
    minLift: number = 1.25
  ): Promise<AssociationRulesResult> {
    const rules = [
      {
        id: 'RULE_01',
        lhs: ['Cement=High', 'Superplasticizer=High'],
        rhs: ['Strenght_Mpa=High'],
        support: 0.114,
        confidence: 0.826,
        lift: 2.88,
        count: 117,
      },
      {
        id: 'RULE_02',
        lhs: ['Water=Low', 'Superplasticizer=High'],
        rhs: ['Strenght_Mpa=High'],
        support: 0.128,
        confidence: 0.795,
        lift: 2.78,
        count: 132,
      },
      {
        id: 'RULE_03',
        lhs: ['Age=High (>90d)', 'Cement=Medium'],
        rhs: ['Strenght_Mpa=High'],
        support: 0.092,
        confidence: 0.768,
        lift: 2.68,
        count: 95,
      },
      {
        id: 'RULE_04',
        lhs: ['Water=High', 'Superplasticizer=Zero'],
        rhs: ['Strenght_Mpa=Low'],
        support: 0.145,
        confidence: 0.842,
        lift: 3.49,
        count: 149,
      },
      {
        id: 'RULE_05',
        lhs: ['Age=Early (<=7d)', 'Water=High'],
        rhs: ['Strenght_Mpa=Low'],
        support: 0.098,
        confidence: 0.891,
        lift: 3.70,
        count: 101,
      },
      {
        id: 'RULE_06',
        lhs: ['FlyAsh=High', 'Age=High (>90d)'],
        rhs: ['Strenght_Mpa=Medium'],
        support: 0.088,
        confidence: 0.725,
        lift: 1.53,
        count: 91,
      },
      {
        id: 'RULE_07',
        lhs: ['Slag=High', 'Superplasticizer=High'],
        rhs: ['Strenght_Mpa=High'],
        support: 0.082,
        confidence: 0.714,
        lift: 2.50,
        count: 84,
      },
    ].filter(r => r.support >= minSupport && r.confidence >= minConfidence && r.lift >= minLift);

    return {
      minSupport,
      minConfidence,
      minLift,
      totalRulesFound: rules.length,
      frequentItemsets: [
        { items: ['Cement=High', 'Superplasticizer=High'], support: 0.138, count: 142 },
        { items: ['Water=Low', 'Superplasticizer=High'], support: 0.161, count: 166 },
        { items: ['Water=High', 'Superplasticizer=Zero'], support: 0.172, count: 177 },
        { items: ['Age=Standard (28d)', 'Strenght_Mpa=Medium'], support: 0.224, count: 231 },
        { items: ['Cement=High', 'Strenght_Mpa=High'], support: 0.185, count: 191 },
      ],
      rules,
      isDemo: true,
    };
  }

  // OLAP Cube Operations (Client-side dimensional processing)
  public async getOlapData(query: OlapCubeQuery, currentData: ConcreteDataRow[] = INITIAL_CONCRETE_DATA) {
    const result = executeOlapQuery(currentData, query);
    return {
      ...result,
      isDemo: true,
    };
  }
}

export const concreteApi = new ConcreteApiService();
