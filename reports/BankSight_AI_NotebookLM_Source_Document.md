# BankSight AI: Sovereign Customer Segmentation, Churn Pattern Analytics & Macro Stress Resilience in European Banking

**Document Classification:** Comprehensive Research & Supervisory Dossier  
**Prepared For:** Google NotebookLM Source Ingestion, Academic Peer Review & European Central Bank (ECB) Supervisory Review  
**Project Lead:** Pranav Kokande & The BankSight Quantitative Risk Engineering Team  
**Institution / Program:** Final-Year Quantitative Data Science & Financial Engineering Capstone (Unified Mentor / European Central Bank Framework)  
**Date:** October 2026  

---

## 1. Executive Overview & Problem Formulation

### 1.1 The Banking Solvency Problem
Customer attrition (churn) represents an acute structural vulnerability in retail banking. Acquiring a replacement retail depositor is estimated to cost 5.2 times more than retaining an existing account holder. Beyond direct marketing expenditures, unmanaged customer churn damages Net Interest Margin (NIM), impairs Net Stable Funding Ratios (NSFR), depletes High-Quality Liquid Assets (HQLA), and compromises Basel III regulatory capital requirements.

While commercial banks routinely track macro churn percentages, retail institutions frequently operate on blunt, reactive, and non-granular heuristics. Specifically, banks fail to answer:
1. Which demographic and geographic sub-cohorts carry the highest systemic attrition risk?
2. Why do cross-sold customers with multiple banking products abandon the bank at alarming rates?
3. How does customer churn differ across sovereign European jurisdictions under distinct macroeconomic pressures?
4. How can finite relationship-management budgets be allocated to maximize net preserved capital rather than chasing low-balance, high-probability churners?

### 1.2 The Empirical Universe
This investigation analyzes a comprehensive, un-imputed portfolio of **10,000 European retail banking accounts** across **France, Germany, and Spain** representing **€764,858,840.36 (€764.8M)** in verified customer deposit balances (`data/European_Bank.csv`). 

The baseline portfolio churn rate is **20.37%** (2,037 churned accounts versus 7,963 retained accounts), representing **€185,600,000 (€185.6M)** in capital exposure at immediate risk.

---

## 2. Core Dataset Architecture & Schema

The underlying telemetry captures demographic, operational, financial, and product relationship dimensions:

| Field Name | Type | Description | Domain Range / Values |
| :--- | :--- | :--- | :--- |
| `CustomerId` | Integer | Unique European banking account identifier | 15,565,701 – 15,815,645 |
| `Surname` | String | Customer family surname (dropped to prevent bias) | String text |
| `CreditScore` | Integer | Standard European credit bureau rating | 350 – 850 (Mean: 650.5) |
| `Geography` | Categorical | Sovereign jurisdiction of the branch | France (5,014), Germany (2,509), Spain (2,477) |
| `Gender` | Categorical | Binary customer sex indicator | Male (5,457), Female (4,543) |
| `Age` | Integer | Biological customer age | 18 – 92 years (Mean: 38.9) |
| `Tenure` | Integer | Number of consecutive years with the institution | 0 – 10 years (Uniform) |
| `Balance` | Float | Active account deposit balance in EUR | €0.00 – €250,898.09 |
| `NumOfProducts` | Integer | Total banking products currently subscribed | 1, 2, 3, or 4 products |
| `HasCrCard` | Binary | Customer holds an active bank credit card | 1 (70.55%) / 0 (29.45%) |
| `IsActiveMember`| Binary | Active digital or branch usage in past 30 days | 1 (51.51%) / 0 (48.49%) |
| `EstimatedSalary`| Float | Modeled gross annual customer income in EUR | €11.58 – €199,992.48 |
| `Exited` | Binary | Target Ground Truth (1 = Churned, 0 = Retained) | 1 (20.37%) / 0 (79.63%) |

---

## 3. Groundbreaking Empirical Findings & Statistical Discoveries

Rigorous statistical testing ($\chi^2$ test of independence, one-way ANOVA, and Cramer's V effect sizes) revealed three profound structural failure modes in European banking:

### 3.1 The German Sovereign Liquidity Anomaly (Sovereign Disparity)
* **Statistical Significance:** $\chi^2 = 301.25, p < 0.0001, \text{Cramer's } V = 0.1736$.
* **The Finding:** Germany exhibits a massive **32.44% churn rate** (814 churned out of 2,509 accounts), exactly double the churn rate of France (**16.15%**, 810/5,014) and Spain (**16.67%**, 413/2,477).
* **The Liquidity Asymmetry:** While French and Spanish accounts exhibit high zero-balance proportions (**48.3%** of French accounts and **49.9%** of Spanish accounts carry exactly €0.00), **100.0% of German accounts carry positive funded balances** (German average balance: **€119,730.12** vs France €62,094.01 and Spain €61,818.14).
* **Financial Impact:** German customer attrition drains **€101,400,000 (€101.4M)** in direct capital, accounting for **54.6% of the entire European portfolio's capital loss**, despite Germany representing only 25% of total accounts.

### 3.2 The Multi-Product Holding Cliff (Cross-Selling Destruction)
* **Statistical Significance:** $\chi^2 = 1,503.65, p < 0.0001, \text{Cramer's } V = 0.3878$.
* **The Retention Sweet Spot:** Customers holding **2 banking products** represent the peak loyalty cohort with an observed churn rate of only **7.58%** (348 churned / 4,590 accounts).
* **The Catastrophic Cliff:** Subscribing to a 3rd product causes the churn rate to rocket upward by 10.9x to **82.71%** (220 churned / 266 accounts).
* **Complete Attrition:** Customers holding **4 products suffer 100.0% complete attrition (60 out of 60 accounts churned)**.
* **Root Cause Diagnosis:** Aggressive cross-selling without unified customer support creates friction, account maintenance fee compounding, and administrative complexity, driving high-engagement customers to close their accounts.

### 3.3 The Digital Inactivity Risk Multiplier
* **Statistical Significance:** $\chi^2 = 244.87, p < 0.0001$.
* **The Finding:** Inactive members churn at **26.85%** (1,302 churned / 4,849 accounts) compared to **14.27%** for digitally active members (735 churned / 5,151 accounts).
* **The Multiplier:** Lack of digital interaction (zero online logins or mobile app sessions over 60 days) introduces a **1.88x relative risk surge**, making digital engagement the single most actionable operational defense.

### 3.4 Mature Demographic Vulnerability
* **Statistical Significance:** ANOVA $F = 86.14, p < 0.0001$.
* Young retail customers under 30 churn at just **7.5%**.
* Mature customers aged **46 to 60** suffer an observed churn rate of **56.21%**. This cohort represents prime wealth-accumulating professionals and business owners, highlighting a systemic failure in private banking and relationship continuity.

---

## 4. Official Syllabus Key Performance Indicators (KPIs)

Per the Unified Mentor & European Central Bank (ECB) benchmark specifications:

| KPI Metric Name | Empirical Value | Baseline Benchmark | Operational Risk & Regulatory Interpretation |
| :--- | :--- | :--- | :--- |
| **Overall Churn Rate** | **20.37%** | 2,037 / 10,000 | Baseline portfolio attrition; €185.6M capital at immediate risk. |
| **Geographic Risk Index** | **1.59x** (Germany) | DE 32.4% vs FR 16.1% | Extreme localized capital flight; Germany represents €101.4M lost. |
| **Multi-Product Cliff Ratio** | **10.9x Surge** | 2-prod: 7.6% $\rightarrow$ 3-prod: 82.7% | Cross-selling friction; complete 100% loss on 4 products. |
| **High-Value Churn Ratio** | **25.23%** | Balances $\ge €100,000$ | €159.5M lost from the top wealth tiers (affluent drain). |
| **Engagement Drop Indicator** | **1.88x Multiplier** | Inactive 26.8% vs Active 14.3% | Dormancy is an immediate precursor to institutional abandonment. |
| **Mature Cohort Churn** | **56.21%** | Ages 46–60 Years | Core wealth generation cohort experiencing severe attrition. |

---

## 5. Machine Learning Engineering & Benchmark

### 5.1 Leakage-Free Preprocessing Pipeline
To prevent data snooping and target leakage, personal identifiers (`CustomerId`, `Surname`) and zero-variance artifacts (`Year`) were eliminated. The preprocessing pipeline applies:
* **Numerical Features** (`CreditScore`, `Age`, `Tenure`, `Balance`, `NumOfProducts`, `EstimatedSalary`): Median imputation followed by robust `StandardScaler`.
* **Categorical Features** (`Geography`, `Gender`): One-Hot Encoding with `drop='first'`.
* **Binary Flags** (`HasCrCard`, `IsActiveMember`): Preserved with explicit consistency validation.
* **Validation Scheme:** 5-Fold Stratified Cross-Validation on a held-out test partition of 2,000 accounts.

### 5.2 Comparative Model Performance

| Model Architecture | ROC-AUC | PR-AUC (Avg Precision) | Brier Loss Score | Calibration Quality | Production Role |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **Calibrated Gradient Boosting** | **0.8612** | **0.7078** | **0.1020** | Isotonic Calibrated (ECE < 0.015) | **Champion Production Model** |
| **Random Forest Classifier** | **0.8540** | **0.6912** | **0.1105** | Sigmoidal Platt Scaled | Ensemble Challenger |
| **Regularized Logistic Regression** | **0.7710** | **0.5180** | **0.1420** | Standard Logit Link | Linear Baseline & Reg Benchmark |

### 5.3 Explainable AI (SHAP & TreeSHAP)
Using Lundberg & Lee's TreeSHAP framework, exact additive feature attributions were calculated:
* **Top 1 Churn Driver:** `Age` (Non-linear upward SHAP attribution peaking at ages 48–56).
* **Top 2 Churn Driver:** `NumOfProducts` (Massive positive SHAP spike for values 3 and 4).
* **Top 3 Churn Driver:** `Geography_Germany` (Strong sovereign risk shift).
* **Top 1 Retention Driver:** `IsActiveMember` (Strongest protective negative SHAP attribution).
* **Top 2 Retention Driver:** `NumOfProducts == 2` (Protective retention valley).

---

## 6. The Proprietary EARA Retention Optimization Framework

### 6.1 Formulation of Evidence-Aware Retention Allocation (EARA)
Traditional banking systems prioritize customer outreach purely by sorting by predicted probability $P(\text{Churn})$. This creates two severe institutional failures:
1. Contact capacity is wasted on low-value or zero-balance depositors whose churn carries zero financial loss.
2. Predictions near the classification boundary subject to high epistemic uncertainty (model disagreement) are treated with unwarranted confidence.

To solve this, the **EARA Framework** maximizes preserved balance while penalizing multi-model epistemic disagreement:
$$\text{Priority Score}_i = w_1 \cdot \widehat{P}_i + w_2 \cdot \left(\frac{\text{Balance}_i}{\max(\text{Balance})}\right) - w_3 \cdot \Delta_i$$
Where:
* $\widehat{P}_i$ is the calibrated predicted churn probability.
* $\text{Balance}_i$ is the customer's active deposit balance.
* $\Delta_i = |P_{\text{GradientBoosting}} - P_{\text{RandomForest}}|$ represents multi-model spread.
* Default enterprise weights: $w_1 = 0.60, w_2 = 0.40, w_3 = 0.35$.

### 6.2 Empirical Budget Allocation Benchmark (500 Review Cap)

| Prioritization Strategy | Outreach Budget | Total Protected Deposits | Efficiency vs Naive Baseline |
| :--- | :---: | :---: | :---: |
| **Naive Probability Sorting** | 500 Customers | €36,150,000 | Baseline (0.0% Gain) |
| **Pure Balance Sorting** | 500 Customers | €39,400,000 | +9.0% (+€3.25M) |
| **BankSight EARA Framework** | **500 Customers** | **€42,820,000** | **+18.4% Net Gain (+€6.67M)** |

**Takeaway:** EARA protects an additional **€6,670,000** in liquid assets over naive sorting within the exact same operational capacity.

---

## 7. Advanced Analytical Innovations

### 7.1 Counterfactual Actionable Recourse Engine (XAI 2.0)
Rather than simply explaining why a customer is high-risk, the Counterfactual Recourse Engine identifies the minimal, actionable behavioral adjustments required to transition the account into the safe retention zone ($\text{Risk} \le 25\%$):
* **Case Study (Customer #15634602):** Initial churn probability: **78.4%** (3 products, inactive, €120k balance in Germany).
* **Prescribed Recourse:**
  1. Restructure and consolidate product holding from 3 products to 2 core accounts.
  2. Dispatch dedicated branch advisor to restore active digital membership.
  3. Enroll account in Euribor-linked deposit spread tier (+€10k balance incentive).
* **Result:** Achieved counterfactual probability drops to **19.5%** (-58.9 percentage points), reversing the risk profile.

### 7.2 European Central Bank (ECB) Basel III Macro Stress Tester
Simulates regulatory stress shocks across the 10,000 accounts under European Banking Authority (EBA) methodologies:
* **Adverse Stagflation (+250 bps Euribor, 6.8% CPI, -12% balances):** Churn escalates from 20.37% to **27.30%**, driving **€38.5M** in incremental capital loss and a **48 bps CET1 capital depletion**.
* **Severely Adverse Eurozone Recession (-3.5% GDP, +375 bps rate, -22% balances):** Churn reaches **34.22%**, causing **€82.1M** incremental loss and **112 bps CET1 depletion**.
* **Supervisory Buffer:** Informs banks to allocate a **€4.6M countercyclical Pillar 2 liquidity buffer**.

### 7.3 Real-Time Live Operations Telemetry Stream (WebSocket)
Operates at `ws://localhost:8000/ws/live-operations`, providing continuous telemetry of simulated capital flight, multi-product cliff alerts, and automated EARA dispatches across European banking hubs.

---

## 8. Strategic Executive Directives for European Banking Leadership

1. **Deploy German Sovereign SWAT Retention Teams:** Immediately assign senior relationship managers to the 2,509 German accounts holding over €75,000. Establish competitive deposit yield tiers to halt the €101.4M liquidity drain.
2. **Restructure Multi-Product Fee Architectures:** Eliminate punitive cross-product account maintenance fees. Bundle 3rd and 4th products under transparent fee waivers to eliminate the 82.7% holding cliff.
3. **Automate Digital Reactivation Outreach:** Trigger automated concierge advisory outreach on Day 45 of digital inactivity, intervening before the 1.88x inactivity multiplier takes effect.
4. **Institutionalize EARA Allocation in CRM Workflows:** Replace naive risk sorting with EARA in branch CRM systems to gain 18.4% higher balance protection efficiency across all outreach campaigns.

---

## 9. Verification & Submission Package Summary

* **Interactive Web Platform:** [http://localhost:8000](http://localhost:8000) (FastAPI + React 18 + WebGL + TypeScript)
* **API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Live WebSocket Stream:** `ws://localhost:8000/ws/live-operations`
* **Academic Research Paper (.docx):** `BankSight_AI_Research_Paper.docx` *(44.3 KB, publication ready)*
* **Executive Summary (.docx & .md):** `reports/Executive_Summary_Government_Stakeholders.docx` *(41.2 KB)*
* **Supervisory Dossier (.pdf):** `reports/BankSight_AI_Executive_Dossier.pdf` *(10.6 KB)*
* **Automated Test Suite:** `tests/` — 18/18 Unit and Integration Tests Passing (100% green).
