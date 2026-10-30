# BankSight AI — System Architecture & Component Design

## 1. High-Level Architecture
BankSight AI is structured into decoupled, modular subsystems ensuring high maintainability, testability, and strict separation of concerns:

```
BankSight-AI/
├── app.py                            # Streamlit entry point, brand banner & routing
├── pages/                            # Multi-page dashboard modules (01 to 12)
│   ├── 01_Executive_Dashboard.py
│   ├── 02_Data_Quality_Centre.py
│   ├── 03_Customer_Segmentation.py
│   ├── 04_Churn_Intelligence.py
│   ├── 05_Model_Laboratory.py
│   ├── 06_Explainable_AI.py
│   ├── 07_Customer_Risk_Passport.py
│   ├── 08_High_Value_Intelligence.py
│   ├── 09_EARA_Allocation_Lab.py
│   ├── 10_Model_Trust_Fairness.py
│   ├── 11_Scenario_Simulator.py
│   └── 12_Reports_Audit.py
│
├── src/                              # Core algorithmic & engineering modules
│   ├── config.py                     # Global paths, thresholds, and theme styling
│   ├── data_loader.py                # Safe CSV ingestion & caching
│   ├── data_validation.py            # Automated 10-point data quality auditor
│   ├── preprocessing.py              # ColumnTransformer, train/test splitting
│   ├── feature_engineering.py        # Financial ratios & demographic cohorting
│   ├── analytics.py                  # Portfolio metrics & cross-tabulations
│   ├── statistical_analysis.py       # Chi-square, Welch t-test, Wilson score CIs
│   ├── segmentation.py               # K-Means, GMM, Agglomerative, PCA & personas
│   ├── clustering_stability.py       # Bootstrap ARI agreement & churn stability
│   ├── train_models.py               # Supervised training & 5-fold cross-validation
│   ├── model_evaluation.py           # ROC-AUC, PR-AUC, Brier score, and curves
│   ├── prediction_service.py         # Batch & single customer inference engine
│   ├── explainability.py             # Global & local SHAP attributions
│   ├── risk_scoring.py               # Consensus spread & decision rules
│   ├── eara.py                       # Evidence-Aware Retention Allocation engine
│   ├── fairness.py                   # Subgroup audits & demographic parity
│   ├── simulation.py                 # Multi-scenario campaign economics
│   ├── report_generation.py          # Academic paper & executive report compiler
│   ├── plotting.py                   # Plotly charts & genuine 3D customer galaxy
│   └── ui_components.py              # Custom CSS & dark glassmorphism widgets
│
├── models/                           # Persisted serialized artifacts (.joblib)
├── reports/                          # Auto-generated audit exports
├── tests/                            # Comprehensive Pytest automated test suite
├── docs/                             # Architecture & methodology documentation
├── train_all.py                      # Offline batch pre-training runner
└── requirements.txt                  # Dependency specifications
```

## 2. Data Flow & Leakage Prevention
1. **Raw Ingestion**: Data is read via `data_loader.py` and validated by `DataQualityAuditor`.
2. **Feature Separation**: Target (`Exited`), PII (`CustomerId`, `Surname`), and zero-variance constant features (`Year`) are segregated.
3. **Strict Train/Test Split**: 80/20 Stratified train/test split. Preprocessing scalers and encoders are fit *strictly* on training folds.
4. **Model Cross-Validation & Calibration**: 5-Fold Stratified CV on training set, followed by sigmoid probability calibration (`CalibratedClassifierCV`).
5. **Persistence**: Serialized artifacts are cached in `models/` for instantaneous loading.
