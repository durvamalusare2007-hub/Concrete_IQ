# ConcreteIQ — Concrete Strength Data Mining Dashboard

**ConcreteIQ** is an analytics web application and university laboratory interface for exploring, preprocessing, querying, and modeling concrete compressive strength data.

The application serves as the frontend for academic data mining projects, providing a decoupled API service layer designed to connect directly with an **R** backend microservice (using **R Plumber** or **OpenCPU**).

---

## Architecture Overview

```
                      ┌──────────────────────────────────────────────┐
                      │            ConcreteIQ (Frontend)             │
                      │  React 19 + TypeScript + Tailwind CSS        │
                      │  Recharts Interactive Visual Analytics       │
                      └──────────────────────┬───────────────────────┘
                                             │ HTTP REST / JSON
                                             │ (VITE_R_API_BASE_URL)
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │          R Microservice (Backend)            │
                      │  R Plumber API Server (port 8000)            │
                      │  • GET  /api/health (status check)           │
                      │  • POST /api/statistics (dataset profiling)  │
                      └──────────────────────────────────────────────┘
```

> **Important Architecture Constraint**:  
> No data mining algorithms are implemented in JavaScript or replaced with Python. The frontend connects to an external R backend. Currently, the live backend serves `GET /api/health` and `POST /api/statistics`. When the R server is offline or when viewing algorithms not yet deployed on the backend, the interface explicitly operates in **Demo Mode**, displaying verified experimental benchmarks with clear disclaimers to prevent presenting demo values as real experimental runs.

---

## Dataset Description

The application is built for the **Concrete Compressive Strength dataset** (Prof. I-Cheng Yeh, Chung-Hua University; standard UCI Machine Learning Repository).

The target column maintains the exact spelling: **`Strenght_Mpa`**.

| Column | Full Name | Physical Unit | Description |
| :--- | :--- | :--- | :--- |
| `cement` | Portland Cement | kg/m³ | Primary hydraulic binder |
| `slag` | Blast Furnace Slag | kg/m³ | Ground granulated secondary pozzolanic binder |
| `flyash` | Fly Ash | kg/m³ | Supplementary coal combustion pozzolan |
| `water` | Water | kg/m³ | Water content controlling water-to-cement ratio |
| `superplasticizer` | Superplasticizer | kg/m³ | High-range chemical water-reducing admixture |
| `coarseaggregate` | Coarse Aggregate | kg/m³ | Crushed stone/gravel (approx. 20mm) |
| `fineaggregate` | Fine Aggregate | kg/m³ | Natural river sand passing 4.75mm sieve |
| `age` | Curing Age | Days | Moist curing time interval (1 to 365 days) |
| **`Strenght_Mpa`** | Compressive Strength | **MPa** | **Uniaxial compressive strength (ASTM C39)** |

---

## Key Features

1. **Overview Dashboard**:
   - Executive metric cards: sample record count, 8 input predictors, mean strength, and maximum strength.
   - Interactive charts: Strength distribution histogram, Curing age hydration gain curve, and Cement vs Strength correlation scatter.

2. **Dataset Explorer**:
   - Full dataset grid with search, pagination, and configurable column visibility.
   - Direct CSV upload (`Concrete_strength_preprocessed.csv`) with automatic header mapping and schema validation.
   - Live **Descriptive Statistics** computed via `POST /api/statistics` on the R backend for the active dataset (including uploaded CSV rows).
   - Missing-value audit and one-click CSV export.

3. **Data Preprocessing**:
   - Duplicate cylinder re-test removal controls.
   - Missing value handling policies (Drop, Mean imputation, Median imputation).
   - Normalization options: Min-Max [0, 1] scaling and Z-Score standardization.
   - Before-and-after transformation summary cards and transformed sample preview.

4. **Data Warehouse & OLAP**:
   - Star Schema architectural diagram centered on `Fact_ConcreteTest`.
   - Dimensions: `Dim_MixComposition`, `Dim_CuringTime`, `Dim_Admixtures`, `Dim_AggregateRatio`.
   - Interactive OLAP controls:
     - **Roll-up**: Aggregate from fine measurements to age brackets.
     - **Drill-down**: Inspect specific curing ages and water-to-cement ratios.
     - **Slice**: Filter by specific curing age (e.g. 28 days).
     - **Dice**: Multi-dimensional sub-cube filtering (e.g., Age = 28 AND Superplasticizer > 0).
     - **Pivot**: Cross-tabulation matrix with sample counts and average compressive strength.

5. **Data Visualization**:
   - Dynamic feature histograms with customizable bin counts.
   - Bivariate scatter plots with selectable X and Y axes.
   - Quantile boxplot distributions grouped across moist curing brackets.
   - Complete 9x9 Pearson correlation matrix heatmap with color intensity coding.

6. **Regression Modeling**:
   - Simple Linear Regression (`Strenght_Mpa ~ cement` or custom predictor).
   - Multiple Linear Regression incorporating all 8 formulation predictors.
   - Goodness-of-fit metrics: $R^2$, Adjusted $R^2$, MAE, RMSE, F-statistic, and p-values.
   - Actual vs Predicted validation plot with diagonal reference.
   - Interactive Concrete Strength Prediction Calculator with ACI 211 mix proportion checks.

7. **Classification**:
   - Decision Tree (CART / `rpart`) and Gaussian Naive Bayes (`e1071`).
   - Configurable strength thresholds: Low (<25 MPa), Medium (25-45 MPa), High (>45 MPa).
   - Overall Accuracy, Macro-Precision, Macro-Recall, and Macro-F1 scores.
   - Full 3x3 Confusion Matrix with diagonal highlighting.
   - Human-interpretable decision tree rule paths and prior probabilities.
   - Interactive single-mix category classifier.

8. **Unsupervised Clustering**:
   - K-Means and Agglomerative Hierarchical Clustering (Ward's method, Complete, Average).
   - Configurable cluster count $K$ (2 to 6).
   - 2D PCA feature space projection scatter plot colored by cluster assignments.
   - Discovered mix archetype profiles (High-Performance, Standard Structural, Lean mixes).
   - Silhouette scores and Elbow method (Inertia/WCSS) curve.

9. **Association Rules Mining**:
   - Discretized concrete mix itemsets with Apriori rule extraction (`arules`).
   - Interactive sliders for Minimum Support, Minimum Confidence, and Minimum Lift.
   - Extracted rules table with LHS $\rightarrow$ RHS mappings and lift ratios.
   - Support vs Confidence scatter plot sized by lift.

10. **Experiment Reports (9 Complete Curriculum Labs)**:
    - Detailed documentation for all 9 data mining lab experiments:
      - **Exp 1**: Data Exploration & Statistical Profiling of Concrete Strength Data
      - **Exp 2**: Data Preprocessing (Cleaning, Missing Values, and Normalization)
      - **Exp 3**: Multidimensional Data Modeling & OLAP Operations
      - **Exp 4**: Exploratory Data Visualization & Correlation Analysis
      - **Exp 5**: Simple Linear Regression for Strength Prediction
      - **Exp 6**: Multiple Linear Regression & Residual Diagnostics
      - **Exp 7**: Concrete Strength Classification using Decision Trees
      - **Exp 8**: Probabilistic Classification using Naive Bayes
      - **Exp 9**: Unsupervised Concrete Mix Clustering & Association Rule Mining
    - Each report contains: Objective, Methodology, Parameters, Actual Results, Academic Interpretation, Engineering Conclusions, and verified copyable R scripts.
    - One-click PDF printing capability for laboratory record submission.

---

## Getting Started

### 1. Running the Frontend

```bash
# Install packages
npm install

# Start Vite development server on port 3000
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## Connecting to an R Backend

The R backend runs at `http://localhost:8000/api` with endpoints `GET /api/health` and `POST /api/statistics`.

### Step 1: Install R Packages

In R or RStudio, install the required packages:

```R
install.packages(c("plumber", "jsonlite"))
```

### Step 2: Create `server.R`

Create a file named `server.R`:

```R
library(plumber)
library(jsonlite)

#* Mandatory CORS filter so browser fetch() can connect from port 3000
#* @filter cors
function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept")
  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  }
  plumber::forward()
}

#* @get /api/health
#* @serializer json
function() {
  list(
    status = "online",
    engine = "R",
    version = R.version.string,
    time = as.character(Sys.time())
  )
}

#* @post /api/statistics
#* @serializer json
function(req) {
  # Parse JSON dataset posted by ConcreteIQ frontend
  raw_body <- req$postBody
  parsed <- jsonlite::fromJSON(raw_body)
  df <- if (is.data.frame(parsed)) parsed else if (!is.null(parsed$data)) parsed$data else as.data.frame(parsed)
  
  cols <- c("cement", "slag", "flyash", "water", "superplasticizer", 
            "coarseaggregate", "fineaggregate", "age", "Strenght_Mpa")
  
  stats_list <- list()
  for (col in cols) {
    if (col %in% names(df)) {
      v <- na.omit(as.numeric(df[[col]]))
      n <- length(v)
      if (n > 0) {
        qs <- quantile(v, probs = c(0.25, 0.5, 0.75), names = FALSE)
        stats_list[[length(stats_list) + 1]] <- list(
          column = col,
          count = n,
          mean = round(mean(v), 2),
          std = round(sd(v), 2),
          min = round(min(v), 2),
          q1 = round(qs[1], 2),
          median = round(qs[2], 2),
          q3 = round(qs[3], 2),
          max = round(max(v), 2),
          missing = sum(is.na(df[[col]]))
        )
      }
    }
  }
  
  list(
    status = "success",
    totalRows = nrow(df),
    stats = stats_list,
    time = as.character(Sys.time())
  )
}
```

### Step 3: Run the R Server

```R
library(plumber)
pr <- plumber::pr("server.R")
pr$run(port = 8000, host = "0.0.0.0")
```

### Step 4: Test & Verify the Connection

1. Click **Backend Settings** in the top navigation or bottom sidebar of ConcreteIQ.
2. Confirm the endpoint URL is set to `http://localhost:8000/api`.
3. Click **Ping Health (GET)**. The status banner will update to **"Connected: R Plumber Backend Active"**.
4. Click **Test POST /statistics** to test transmitting the dataset JSON.
5. In **Dataset Explorer**, open the **Descriptive Statistics** tab:
   - Notice the live status badge: `Live R Backend Result: Statistics computed by R Plumber (POST /api/statistics)`.
   - Click **Upload CSV** to upload a custom concrete dataset file.
   - The newly uploaded rows are immediately sent via `POST /api/statistics` to your R backend, updating the statistics table with R's calculations.
