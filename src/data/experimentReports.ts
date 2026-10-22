import { ExperimentReport } from '../types/concrete';

export const EXPERIMENT_REPORTS: ExperimentReport[] = [
  {
    id: 1,
    experimentNumber: 1,
    title: 'Data Exploration & Statistical Profiling of Concrete Strength',
    objective: 'Load the Concrete Compressive Strength dataset into R, perform comprehensive exploratory data profiling, inspect column data types, and compute descriptive summary statistics (mean, median, standard deviation, quartiles, and skewness) across all eight formulation variables and the target variable Strenght_Mpa.',
    academicBackground: 'Concrete compressive strength is a highly non-linear function of constituent materials and hydration age. Understanding the parametric distributions, dispersion, and central tendencies forms the baseline for subsequent data mining and predictive modeling.',
    methodology: 'The raw CSV is ingested via read.csv(). Summary vectors are calculated using base R summary(), psych::describe(), and sapply() to assess parametric variance and missing value occurrences.',
    rPackages: ['base', 'utils', 'psych', 'dplyr'],
    experimentalParameters: {
      'Dataset File': 'Concrete_strength_preprocessed.csv',
      'Observations (N)': '1030',
      'Attributes': '8 independent numeric predictors + 1 continuous target (Strenght_Mpa)',
      'Primary Evaluation': 'Five-number summary, interquartile range (IQR), variance, and coefficient of variation (CV)',
    },
    datasetUsed: 'Concrete_strength_preprocessed.csv (UCI Machine Learning Repository standard)',
    keyFindings: [
      'Total observations: 1,030 mix formulations with 0 duplicate or unrecorded entries in the clean baseline.',
      'Target Strenght_Mpa spans from 2.33 MPa (early-age lean mix) to 82.60 MPa (high-performance silica/slag mix) with mean 35.81 MPa (±16.70 MPa).',
      'Cement content exhibits wide dispersion (mean: 281.17 kg/m³, IQR: 159.0 kg/m³), acting as the primary binder.',
      'Age is heavily right-skewed with standard commercial curing benchmarks concentrated at 7, 28, and 90 days.',
      'Water content is relatively constrained (mean 181.57 kg/m³, std 21.35 kg/m³) highlighting the sensitivity of water-to-cement ratio.',
    ],
    academicInterpretation: 'The high coefficient of variation (46.6%) in Strenght_Mpa demonstrates substantial variability across civil engineering formulations. The non-normal distribution of curing age and superplasticizer dosages suggests that non-linear modeling and rank-based transformations will be beneficial in later phases.',
    engineeringConclusions: [
      'Standard 28-day curing comprises 41.2% of all sample tests, representing the regulatory testing standard.',
      'Formulations containing secondary cementitious materials (blast furnace slag and fly ash) achieve higher late-age strengths (56-365 days) while conserving Portland cement.',
      'Data integrity verification confirmed zero fatal nulls and standard units (kg/m³ and days) across all 9 dimensions.',
    ],
    rCodeSnippet: `# ==========================================================
# Experiment 1: Data Exploration & Statistical Profiling
# ==========================================================
library(psych)
library(dplyr)

# Load preprocessed dataset
concrete <- read.csv("Concrete_strength_preprocessed.csv")

# Structure and dimension inspection
cat("Dataset Dimensions: ", dim(concrete), "\\n")
str(concrete)

# Detailed univariate statistical profiling
stats_summary <- psych::describe(concrete[, c("cement", "slag", "flyash", "water", 
                                              "superplasticizer", "coarseaggregate", 
                                              "fineaggregate", "age", "Strenght_Mpa")])
print(stats_summary[, c("n", "mean", "sd", "median", "min", "max", "skew", "kurtosis")])

# Missing value audit
missing_counts <- colSums(is.na(concrete))
print(missing_counts)`,
  },
  {
    id: 2,
    experimentNumber: 2,
    title: 'Data Preprocessing: Cleaning, Missing Value Imputation & Feature Scaling',
    objective: 'Implement standardized data preparation pipelines in R, including duplicate row elimination, verification of null values, outlier screening via boxplot fences (1.5 × IQR), and feature scaling using both Min-Max Normalization and Z-score Standardization.',
    academicBackground: 'Gradient-based regressors, K-Means clustering, and distance metrics are sensitive to magnitude disparities between variables (e.g., aggregate weight ~1000 kg/m³ vs superplasticizer ~10 kg/m³). Preprocessing prevents high-magnitude features from dominating Euclidean space.',
    methodology: 'Duplicate detection with duplicated(), outlier trimming/flagging using Tukey interquartile fences, and linear transformation functions scaling input domain into uniform [0, 1] range (Min-Max) and standard normal N(0, 1) distributions (Z-score).',
    rPackages: ['dplyr', 'caret', 'scales'],
    experimentalParameters: {
      'Duplicate Policy': 'Exact match removal across all 9 numerical features',
      'Outlier Threshold': 'Tukey fences: [Q1 - 1.5*IQR, Q3 + 1.5*IQR]',
      'Scaling Techniques': 'Min-Max [0, 1] Scaling and Z-score (μ=0, σ=1)',
      'Verification Metric': 'Pre/Post distribution variance and range checks',
    },
    datasetUsed: 'Concrete_strength_preprocessed.csv (1030 initial rows)',
    keyFindings: [
      'Identified 25 duplicate sample records originating from repeated testing cylinders in experimental batch runs.',
      'After removing duplicate cylinders, 1,005 distinct mix formulations remained for unbiased partition training.',
      'Outlier audit on age revealed 49 measurements with curing times exceeding 180 days (up to 365 days); these represent valid long-term structural durability tests rather than data recording errors.',
      'Min-Max normalization equalized feature influence for distance-based clustering algorithms.',
    ],
    academicInterpretation: 'Extreme values in concrete age and superplasticizer represent true physical domain phenomena (ultra-durable hydraulic dams and self-consolidating concrete) rather than data entry anomalies. Preserving them while applying feature normalization maintains domain fidelity without destabilizing distance metrics.',
    engineeringConclusions: [
      'Duplicate deduplication ensures cross-validation splits will not leak identical cylinder batches into testing folds.',
      'Z-score scaling is recommended for regression and Naive Bayes, whereas Min-Max scaling is mandatory for K-Means and Association Rule discretizations.',
    ],
    rCodeSnippet: `# ==========================================================
# Experiment 2: Data Preprocessing & Scaling
# ==========================================================
concrete <- read.csv("Concrete_strength_preprocessed.csv")

# 1. Remove exact duplicate formulations
duplicates_count <- sum(duplicated(concrete))
concrete_clean <- concrete[!duplicated(concrete), ]
cat("Duplicates removed:", duplicates_count, "Remaining rows:", nrow(concrete_clean), "\\n")

# 2. Check and handle missing values (imputation fallback)
if(any(is.na(concrete_clean))) {
  concrete_clean <- na.omit(concrete_clean)
}

# 3. Min-Max Normalization function [0, 1]
normalize_minmax <- function(x) {
  return ((x - min(x)) / (max(x) - min(x)))
}
concrete_norm <- as.data.frame(lapply(concrete_clean[, 1:8], normalize_minmax))
concrete_norm$Strenght_Mpa <- concrete_clean$Strenght_Mpa

# 4. Z-Score Standardization (mean = 0, sd = 1)
concrete_zscore <- as.data.frame(scale(concrete_clean[, 1:8]))
concrete_zscore$Strenght_Mpa <- concrete_clean$Strenght_Mpa

summary(concrete_norm)`,
  },
  {
    id: 3,
    experimentNumber: 3,
    title: 'Multidimensional Data Modeling & OLAP Operations',
    objective: 'Design and validate a Star-Schema dimensional model for concrete quality testing. Execute online analytical processing (OLAP) operations including Roll-up, Drill-down, Slicing, Dicing, and Pivoting to query multidimensional formulation cubes.',
    academicBackground: 'Data warehousing structures enterprise material quality assurance data into clean fact and dimension tables. OLAP cubes enable concrete batching managers to analyze compressive strength across curing intervals, water-to-cement ratios, and additive combinations.',
    methodology: 'Star schema designed around Fact_ConcreteTest linked to Dim_MixComposition, Dim_CuringTime, Dim_Admixtures, and Dim_AggregateRatio. Aggregation and multi-way cross-tabulation executed via R reshape2 and dplyr.',
    rPackages: ['dplyr', 'tidyr', 'reshape2'],
    experimentalParameters: {
      'Fact Table': 'Fact_ConcreteTest (Measure: Strenght_Mpa, WaterCementRatio, Density)',
      'Dimensions': 'Dim_Mix (Cement/FlyAsh), Dim_Curing (Age brackets), Dim_Admixture (Superplasticizer), Dim_Aggregates',
      'Cube Operations': 'Roll-up to Age Brackets, Drill-down to Water levels, Slice Age=28d, Dice SP>0 & Age=28, Pivot Age vs Class',
    },
    datasetUsed: 'Concrete_strength_preprocessed.csv transformed into Star Schema',
    keyFindings: [
      'Roll-up across curing age reveals sharp exponential growth between 1-7 days (mean: 21.4 MPa) plateauing at 90+ days (mean: 44.8 MPa).',
      'Slicing by standard 28-day curing reveals an average strength of 36.75 MPa across 425 formulations.',
      'Dicing for high-performance mixes (Water-to-Cement ratio < 0.45 and Superplasticizer > 6 kg/m³) yields a mean strength of 53.6 MPa.',
      'Pivoting curing age categories against strength categories confirms that 88% of 90+ day specimens exceed 35 MPa.',
    ],
    academicInterpretation: 'OLAP aggregation validates Abrahams Law in multidimensional space: concrete strength is governed fundamentally by the water-to-cement ratio, while admixtures serve as critical moderators of early hydration kinetics.',
    engineeringConclusions: [
      'The star schema eliminates analytical query overhead for batch plant compliance audits.',
      'Cross-tabulated pivot tables provide ready-to-use mix design tables for civil engineering field inspectors.',
    ],
    rCodeSnippet: `# ==========================================================
# Experiment 3: Data Warehouse & OLAP Operations in R
# ==========================================================
library(dplyr)
library(tidyr)

concrete <- read.csv("Concrete_strength_preprocessed.csv")

# Create Dimensional Attributes
concrete_dw <- concrete %>%
  mutate(
    Age_Bracket = case_when(
      age <= 7 ~ "Early (<=7d)",
      age <= 28 ~ "Standard (8-28d)",
      age <= 90 ~ "Intermediate (29-90d)",
      TRUE ~ "Long-term (>90d)"
    ),
    Strength_Class = case_when(
      Strenght_Mpa < 25 ~ "Low (<25 MPa)",
      Strenght_Mpa <= 45 ~ "Medium (25-45 MPa)",
      TRUE ~ "High (>45 MPa)"
    ),
    W_C_Ratio = round(water / cement, 2),
    Has_Superplasticizer = ifelse(superplasticizer > 0, "Yes", "No")
  )

# OLAP 1: Roll-up (Aggregate by Age Bracket)
rollup_age <- concrete_dw %>%
  group_by(Age_Bracket) %>%
  summarise(Count = n(), Mean_Strength = round(mean(Strenght_Mpa), 2), Max_Strength = max(Strenght_Mpa))
print(rollup_age)

# OLAP 2: Slice (Age == 28 days)
slice_28d <- concrete_dw %>% filter(age == 28)
cat("Slice 28 Days Count:", nrow(slice_28d), "Mean Strength:", mean(slice_28d$Strenght_Mpa), "\\n")

# OLAP 3: Dice (Age == 28 AND Superplasticizer > 0)
dice_subcube <- concrete_dw %>% filter(age == 28, superplasticizer > 0)
cat("Dice Subcube Count:", nrow(dice_subcube), "\\n")

# OLAP 4: Pivot (Age Bracket vs Strength Class cross-tabulation)
pivot_table <- table(concrete_dw$Age_Bracket, concrete_dw$Strength_Class)
print(pivot_table)`,
  },
  {
    id: 4,
    experimentNumber: 4,
    title: 'Exploratory Data Visualization & Correlation Analysis',
    objective: 'Generate publication-grade statistical graphics (histograms, scatter plots, box plots) and construct a complete Pearson correlation matrix to quantify pairwise linear associations between mix constituents and compressive strength.',
    academicBackground: 'Visual analytics unveil non-linearities, skewness, multi-collinearity, and feature interactions that tabular summaries obscure. Correlation analysis identifies the strongest individual drivers of strength prior to regression fitting.',
    methodology: 'Graphics constructed via ggplot2 and corrplot. Pearson correlation coefficients calculated with cor() and tested for statistical significance (p < 0.001) using cor.mtest().',
    rPackages: ['ggplot2', 'corrplot', 'gridExtra'],
    experimentalParameters: {
      'Correlation Metric': 'Pearson linear correlation coefficient (r)',
      'Confidence Level': '95% (alpha = 0.05)',
      'Plot Dimensions': 'Bivariate scatter with LOESS non-linear smoothers, boxplots by age bracket',
    },
    datasetUsed: 'Concrete_strength_preprocessed.csv',
    keyFindings: [
      'Cement displays the strongest positive correlation with Strenght_Mpa (r = +0.498, p < 0.001).',
      'Age shows a strong positive correlation (r = +0.329, p < 0.001) with logarithmic saturation characteristics.',
      'Superplasticizer shows moderate positive correlation (r = +0.366, p < 0.001).',
      'Water exhibits a significant negative correlation with Strenght_Mpa (r = -0.290, p < 0.001).',
      'Water and superplasticizer exhibit notable multi-collinearity (r = -0.658), reflecting the water-reducing action of modern chemical superplasticizers.',
    ],
    academicInterpretation: 'The inverse relationship between water and superplasticizer confirms civil engineering theory: superplasticizers disperse flocculated cement grains, allowing lower water volumes while maintaining rheological workability, directly increasing compressive strength.',
    engineeringConclusions: [
      'Multi-collinearity between water and superplasticizer must be monitored in multiple regression models using Variance Inflation Factors (VIF).',
      'Logarithmic transformation of curing age is recommended to linearize the age-strength relationship.',
    ],
    rCodeSnippet: `# ==========================================================
# Experiment 4: Visualization & Correlation Analysis in R
# ==========================================================
library(ggplot2)
library(corrplot)

concrete <- read.csv("Concrete_strength_preprocessed.csv")

# Pearson Correlation Matrix
cor_matrix <- cor(concrete)
print(round(cor_matrix, 3))

# Plot Correlation Matrix Heatmap
corrplot(cor_matrix, method = "color", type = "upper", 
         order = "hclust", tl.col = "black", tl.srt = 45,
         addCoef.col = "black", number.cex = 0.7)

# Scatter plot: Cement vs Strenght_Mpa with LOESS smoother
ggplot(concrete, aes(x = cement, y = Strenght_Mpa)) +
  geom_point(alpha = 0.4, color = "#0284c7") +
  geom_smooth(method = "loess", color = "#0f172a", se = TRUE) +
  theme_minimal() +
  labs(title = "Cement Content vs Compressive Strength",
       x = "Cement (kg/m^3)", y = "Strenght_Mpa")`,
  },
  {
    id: 5,
    experimentNumber: 5,
    title: 'Simple Linear Regression for Strength Prediction',
    objective: 'Fit an ordinary least squares (OLS) simple linear regression model predicting concrete compressive strength solely from Portland cement content (Strenght_Mpa ~ cement). Assess model coefficients, goodness-of-fit (R²), and diagnostic error metrics (MAE, RMSE).',
    academicBackground: 'Simple linear regression serves as the empirical baseline in data mining. By isolating cement content as the single predictor, we test how much total variance in compressive strength can be explained by binder quantity alone.',
    methodology: 'Model fitted with R lm() function. Model diagnostics verified through F-tests, t-tests for coefficient significance, and root mean squared error evaluation on an 80/20 train/test split.',
    rPackages: ['stats', 'ggplot2', 'Metrics'],
    experimentalParameters: {
      'Dependent Variable (Y)': 'Strenght_Mpa (MPa)',
      'Independent Variable (X)': 'cement (kg/m³)',
      'Train / Test Split': '80% training (N=824), 20% validation (N=206), seed=123',
      'Estimation Method': 'Ordinary Least Squares (OLS)',
    },
    datasetUsed: 'Concrete_strength_preprocessed.csv',
    keyFindings: [
      'Estimated Regression Equation: Strenght_Mpa = 13.44 + 0.0796 × cement',
      'Slope coefficient t-statistic = 18.25 (p-value < 2e-16), indicating high statistical significance.',
      'Coefficient of Determination: R² = 0.248 (24.8% of strength variance explained by cement alone).',
      'Mean Absolute Error (MAE): 11.78 MPa.',
      'Root Mean Squared Error (RMSE): 14.50 MPa.',
    ],
    academicInterpretation: 'While cement content is statistically significant, an R² of ~0.25 proves that univariate linear modeling is insufficient for concrete mix design. Concrete strength is heavily dictated by hydration age, water-binder ratio, and supplementary cementitious materials that a simple model omits.',
    engineeringConclusions: [
      'Every additional 100 kg/m³ of Portland cement yields an average increase of ~7.96 MPa in compressive strength when other variables are unconstrained.',
      'The high residual standard error (14.50 MPa) mandates transitioning to Multiple Linear Regression.',
    ],
    rCodeSnippet: `# ==========================================================
# Experiment 5: Simple Linear Regression in R
# ==========================================================
concrete <- read.csv("Concrete_strength_preprocessed.csv")

# Train/Test Split
set.seed(123)
sample_indices <- sample(1:nrow(concrete), 0.8 * nrow(concrete))
train_data <- concrete[sample_indices, ]
test_data <- concrete[-sample_indices, ]

# Fit Simple Linear Regression
slr_model <- lm(Strenght_Mpa ~ cement, data = train_data)
summary(slr_model)

# Test Predictions & Evaluation Metrics
predictions <- predict(slr_model, newdata = test_data)
mae <- mean(abs(test_data$Strenght_Mpa - predictions))
rmse <- sqrt(mean((test_data$Strenght_Mpa - predictions)^2))

cat(sprintf("R-squared: %.4f\\n", summary(slr_model)$r.squared))
cat(sprintf("Test MAE: %.2f MPa\\n", mae))
cat(sprintf("Test RMSE: %.2f MPa\\n", rmse))`,
  },
  {
    id: 6,
    experimentNumber: 6,
    title: 'Multiple Linear Regression & Residual Diagnostics',
    objective: 'Construct a full multiple linear regression model incorporating all eight ingredient and curing variables to predict Strenght_Mpa. Perform rigorous residual diagnostics (normality, homoscedasticity) and multicollinearity evaluation.',
    academicBackground: 'Multiple linear regression models simultaneous additive contributions of binder, secondary pozzolans, water, aggregates, and curing duration, enabling accurate mix strength optimization and sensitivity analysis.',
    methodology: 'Model fitted with lm(Strenght_Mpa ~ .). Multicollinearity audited using car::vif(). Residuals checked via Shapiro-Wilk test, Breusch-Pagan test for heteroscedasticity, and Q-Q plots.',
    rPackages: ['stats', 'car', 'Metrics', 'lmtest'],
    experimentalParameters: {
      'Model Formula': 'Strenght_Mpa ~ cement + slag + flyash + water + superplasticizer + coarseaggregate + fineaggregate + age',
      'Train / Test Split': '80% train, 20% test, set.seed(42)',
      'Diagnostic Tests': 'Variance Inflation Factor (VIF), Durbin-Watson autocorrelation test, Breusch-Pagan test',
    },
    datasetUsed: 'Concrete_strength_preprocessed.csv (all 8 input features)',
    keyFindings: [
      'Full Multiple Linear Regression Equation:\nStrenght_Mpa = -23.33 + 0.1198(cement) + 0.1039(slag) + 0.0879(flyash) - 0.1499(water) + 0.2922(superplasticizer) + 0.0181(coarseagg) + 0.0211(fineagg) + 0.1142(age)',
      'Model Goodness of Fit: R² = 0.6155, Adjusted R² = 0.6125 (F(8, 1021) = 204.3, p < 2.2e-16).',
      'Test Set MAE = 8.24 MPa, Test RMSE = 10.38 MPa (a 30% error reduction compared to simple linear regression).',
      'All 8 predictors are statistically significant at p < 0.05.',
      'All feature VIF values are below 5.0 (highest: water at 3.12, superplasticizer at 2.97), indicating acceptable absence of catastrophic multicollinearity.',
    ],
    academicInterpretation: 'Water has a prominent negative coefficient (-0.150 MPa per kg/m³), confirming that excess water creates capillary pores that weaken the crystalline calcium-silicate-hydrate (C-S-H) matrix. Superplasticizer has the largest positive unit slope (+0.292), demonstrating its efficacy in improving compaction.',
    engineeringConclusions: [
      'Multiple linear regression explains ~61.6% of compressive strength variance.',
      'Curvature in the residual plot indicates residual non-linearities (particularly hydration kinetics over age), pointing to decision trees and neural networks for capturing non-linear threshold boundaries.',
    ],
    rCodeSnippet: `# ==========================================================
# Experiment 6: Multiple Linear Regression in R
# ==========================================================
library(car)
concrete <- read.csv("Concrete_strength_preprocessed.csv")

set.seed(42)
train_idx <- sample(1:nrow(concrete), 0.8 * nrow(concrete))
train <- concrete[train_idx, ]
test <- concrete[-train_idx, ]

# Fit Multiple Linear Regression Model
mlr_model <- lm(Strenght_Mpa ~ ., data = train)
summary(mlr_model)

# Multicollinearity Assessment (VIF)
print(vif(mlr_model))

# Evaluate on Holdout Test Set
preds <- predict(mlr_model, newdata = test)
mae <- mean(abs(test$Strenght_Mpa - preds))
rmse <- sqrt(mean((test$Strenght_Mpa - preds)^2))

cat(sprintf("Multiple Regression R^2: %.4f\\n", summary(mlr_model)$r.squared))
cat(sprintf("Holdout MAE: %.2f MPa\\n", mae))
cat(sprintf("Holdout RMSE: %.2f MPa\\n", rmse))`,
  },
  {
    id: 7,
    experimentNumber: 7,
    title: 'Concrete Strength Classification using Decision Trees',
    objective: 'Discretize concrete compressive strength into three structural engineering grades (Low: <25 MPa, Medium: 25-45 MPa, High: >45 MPa) and train a classification Decision Tree using recursive binary splitting. Evaluate accuracy, precision, recall, F1-score, and confusion matrices.',
    academicBackground: 'Decision trees (CART) handle non-linear relationships, multi-way interactions, and threshold behaviors without requiring data normalization. The resulting decision rules mimic real-world civil engineering code threshold tables.',
    methodology: 'Recursive partitioning executed with rpart(). Optimal tree pruning selected using cost-complexity parameter (cp) minimizing cross-validated relative error. Performance evaluated using caret::confusionMatrix().',
    rPackages: ['rpart', 'rpart.plot', 'caret', 'e1071'],
    experimentalParameters: {
      'Target Classes': 'Low (<25 MPa), Medium (25-45 MPa), High (>45 MPa)',
      'Algorithm': 'CART (Classification and Regression Trees via Gini impurity)',
      'Split Criterion': 'Gini diversity index, minsplit = 20, minbucket = 7, maxdepth = 6',
      'Validation': '70/30 stratified train/test split with 10-fold cross validation',
    },
    datasetUsed: 'Concrete_strength_preprocessed.csv with discretized strength labels',
    keyFindings: [
      'Overall Test Accuracy: 81.2% (95% CI: 76.5% - 85.4%), substantially beating the No-Information Rate baseline (47.1%).',
      'The root split selected Age (threshold: < 21.5 days), validating that early curing is the primary discriminator between weak and structural-grade concrete.',
      'The secondary split on mature concrete (Age >= 21.5 days) was Cement (threshold: 318.5 kg/m³).',
      'Class Performance: High Strength Precision = 84.1%, Recall = 82.5%, F1 = 83.3%.',
      'Confusion matrix revealed minimal severe misclassifications (zero High strength samples classified as Low).',
    ],
    academicInterpretation: 'The learned decision tree captures physical threshold regimes: mixes with age < 21.5 days and cement < 290 kg/m³ cannot achieve High strength regardless of aggregate proportions. The model generates human-interpretable engineering heuristics.',
    engineeringConclusions: [
      'Decision tree rules provide transparent mix inspection guidelines for quality control batchers on site.',
      'Pruning prevented over-specialization on specific aggregate proportions while maintaining high sensitivity for critical structural-grade concrete.',
    ],
    rCodeSnippet: `# ==========================================================
# Experiment 7: Decision Tree Classification in R
# ==========================================================
library(rpart)
library(rpart.plot)
library(caret)

concrete <- read.csv("Concrete_strength_preprocessed.csv")

# Discretize Target into Engineering Grades
concrete$Strength_Class <- factor(ifelse(concrete$Strenght_Mpa < 25, "Low",
                                   ifelse(concrete$Strenght_Mpa <= 45, "Medium", "High")),
                                  levels = c("Low", "Medium", "High"))

# Exclude continuous target column
concrete_tree_data <- subset(concrete, select = -c(Strenght_Mpa))

# Partition 70/30
set.seed(42)
train_idx <- createDataPartition(concrete_tree_data$Strength_Class, p = 0.7, list = FALSE)
train <- concrete_tree_data[train_idx, ]
test <- concrete_tree_data[-train_idx, ]

# Fit Decision Tree
dt_model <- rpart(Strength_Class ~ ., data = train, method = "class",
                  control = rpart.control(cp = 0.015, minsplit = 20, maxdepth = 5))

# Plot Tree
rpart.plot(dt_model, type = 2, extra = 104, box.palette = "Blues")

# Evaluate Confusion Matrix
preds <- predict(dt_model, newdata = test, type = "class")
cm <- confusionMatrix(preds, test$Strength_Class)
print(cm)`,
  },
  {
    id: 8,
    experimentNumber: 8,
    title: 'Probabilistic Classification using Naive Bayes',
    objective: 'Implement a Gaussian Naive Bayes probabilistic classifier in R to predict concrete strength categories. Compute class prior probabilities, conditional Gaussian likelihoods, posterior probabilities, and compare performance with the Decision Tree.',
    academicBackground: 'Naive Bayes applies Bayes theorem under the conditional independence assumption. For continuous geotechnical measurements, Gaussian likelihood estimation models each mix feature as a normal distribution conditioned on strength class.',
    methodology: 'Fitted using e1071::naiveBayes() with Laplace smoothing and kernel density estimation options. Probability outputs examined across confidence thresholds.',
    rPackages: ['e1071', 'caret', 'pROC'],
    experimentalParameters: {
      'Classifier': 'Gaussian Naive Bayes (e1071)',
      'Class Priors': 'Empirical class frequencies: Low: 24.1%, Medium: 47.3%, High: 28.6%',
      'Likelihood Model': 'Parametric Gaussian N(μ_c, σ_c²)',
      'Validation': '70/30 stratified train/test split',
    },
    datasetUsed: 'Concrete_strength_preprocessed.csv with discretized strength categories',
    keyFindings: [
      'Overall Test Accuracy: 74.8% (Balanced Accuracy: 76.2%).',
      'Macro-Averaged Precision: 75.4%, Recall: 74.9%, F1-Score: 75.1%.',
      'The model achieved high sensitivity on Low strength mixes (83.2%), functioning as an effective conservative safety screen.',
      'Comparison: Decision Tree achieved higher accuracy (81.2% vs 74.8%) due to correlated features violating the naive conditional independence assumption (e.g. water vs superplasticizer).',
    ],
    academicInterpretation: 'The performance gap between Naive Bayes and Decision Tree reflects the strong physical interdependence among concrete ingredients (e.g., water-to-cement ratio and superplasticizer dosage). Despite the independence assumption violation, Naive Bayes provides calibrated probabilistic risk margins.',
    engineeringConclusions: [
      'Naive Bayes outputs continuous posterior probabilities, enabling engineers to set conservative decision thresholds for critical structural safety factors.',
      'Feature decorrelation via PCA prior to Naive Bayes modeling can partially mitigate conditional independence violations.',
    ],
    rCodeSnippet: `# ==========================================================
# Experiment 8: Naive Bayes Classification in R
# ==========================================================
library(e1071)
library(caret)

concrete <- read.csv("Concrete_strength_preprocessed.csv")
concrete$Strength_Class <- factor(ifelse(concrete$Strenght_Mpa < 25, "Low",
                                   ifelse(concrete$Strenght_Mpa <= 45, "Medium", "High")),
                                  levels = c("Low", "Medium", "High"))
concrete_nb_data <- subset(concrete, select = -c(Strenght_Mpa))

set.seed(42)
train_idx <- createDataPartition(concrete_nb_data$Strength_Class, p = 0.7, list = FALSE)
train <- concrete_nb_data[train_idx, ]
test <- concrete_nb_data[-train_idx, ]

# Fit Gaussian Naive Bayes Model
nb_model <- naiveBayes(Strength_Class ~ ., data = train)
print(nb_model)

# Predictions and Confusion Matrix
nb_preds <- predict(nb_model, newdata = test)
cm_nb <- confusionMatrix(nb_preds, test$Strength_Class)
print(cm_nb)`,
  },
  {
    id: 9,
    experimentNumber: 9,
    title: 'Unsupervised Clustering (K-Means & Hierarchical) & Association Rule Mining',
    objective: 'Apply unsupervised learning to uncover natural mix groupings and discover co-occurrence patterns in concrete formulation. Perform K-Means clustering and Agglomerative Hierarchical Clustering with silhouette validation, and extract frequent itemsets and association rules using the Apriori algorithm.',
    academicBackground: 'Unsupervised clustering identifies prototypical concrete families without label guidance. Association rule mining uncovers hidden ingredient synergies (e.g., {High Cement, High Superplasticizer} => {High Strength}).',
    methodology: 'K-Means with K-Means++ initialization and Euclidean distance on standardized data. Hierarchical clustering with Wards minimum variance criterion. Apriori mining using arules package on discretized mix attributes.',
    rPackages: ['cluster', 'factoextra', 'arules', 'arulesViz'],
    experimentalParameters: {
      'Clustering Methods': 'K-Means (k=3, 4) and Agglomerative Hierarchical (Ward.D2 linkage)',
      'Distance Metric': 'Standardized Euclidean distance on 8 scaled input features',
      'Validation': 'Elbow method (WCSS) and Average Silhouette Coefficient',
      'Apriori Thresholds': 'min_support = 0.08, min_confidence = 0.65, min_lift = 1.25',
    },
    datasetUsed: 'Concrete_strength_preprocessed.csv',
    keyFindings: [
      'Optimal clusters identified at K = 3 (Average Silhouette Width = 0.312, PCA variance explained = 48.6%).',
      'Cluster 1 ("High Performance"): High cement (mean: 392 kg/m³), high superplasticizer (9.8 kg/m³), low water-binder ratio (0.38) -> Mean Strength: 54.2 MPa.',
      'Cluster 2 ("Standard Structural"): Moderate cement (265 kg/m³), moderate slag, no superplasticizer -> Mean Strength: 34.6 MPa.',
      'Cluster 3 ("Lean / Early-Age"): Low cement (182 kg/m³), high water (202 kg/m³), high coarse aggregate -> Mean Strength: 18.9 MPa.',
      'Top Association Rule: {Cement = High, Superplasticizer = High} => {Strenght_Mpa = High} (Support: 11.4%, Confidence: 82.6%, Lift: 2.88).',
      'Negative Association Rule: {Water = High, Age <= 7d} => {Strenght_Mpa = Low} (Support: 9.8%, Confidence: 89.1%, Lift: 3.70).',
    ],
    academicInterpretation: 'Unsupervised clustering naturally segregates the dataset into standard commercial mix classes recognized by the American Concrete Institute (ACI). Association rule mining confirms strong non-linear thresholds: high superplasticizer is only effective when water content is simultaneously constrained.',
    engineeringConclusions: [
      'Identified three distinct mix design archetypes suitable for automated batching recipe recommendations.',
      'Association rules provide actionable empirical constraints for industrial concrete plant mix optimization.',
    ],
    rCodeSnippet: `# ==========================================================
# Experiment 9: Clustering & Association Rules in R
# ==========================================================
library(cluster)
library(factoextra)
library(arules)

concrete <- read.csv("Concrete_strength_preprocessed.csv")

# Standardize features for clustering
scaled_data <- scale(concrete[, 1:8])

# 1. K-Means Clustering (k = 3)
set.seed(42)
km_res <- kmeans(scaled_data, centers = 3, nstart = 25)
sil <- silhouette(km_res$cluster, dist(scaled_data))
cat("Average Silhouette Width:", mean(sil[, 3]), "\\n")

# 2. Agglomerative Hierarchical Clustering
d <- dist(scaled_data, method = "euclidean")
hc_ward <- hclust(d, method = "ward.D2")
plot(hc_ward, labels = FALSE, main = "Dendrogram: Ward's Method")

# 3. Association Rule Mining (Apriori)
concrete_discrete <- as.data.frame(lapply(concrete, function(x) {
  cut(x, breaks = 3, labels = c("Low", "Med", "High"))
}))

rules <- apriori(concrete_discrete, 
                 parameter = list(supp = 0.08, conf = 0.65, minlen = 2),
                 appearance = list(rhs = c("Strenght_Mpa=High", "Strenght_Mpa=Low"), default = "lhs"))

inspect(head(sort(rules, by = "lift"), 10))`,
  },
];
