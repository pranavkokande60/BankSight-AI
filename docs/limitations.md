# BankSight AI — System Limitations & Regulatory Boundaries

## 1. Data Limitations
1. **Cross-Sectional Snapshot**: The dataset reflects a single observation point (`Year = 2025`). It lacks high-frequency transactional velocity, mobile app session logs, and service ticket complaint streams.
2. **Geographic Coverage**: Limited to three European economies (France, Germany, Spain). Findings cannot be naively generalized to Nordic, Eastern European, or Asian banking jurisdictions.
3. **Synthetic Salary Properties**: The uniform distribution of `EstimatedSalary` indicates benchmark or synthetic generation.

## 2. Modeling & Methodological Boundaries
1. **Correlation vs. Causation**: Feature importance scores and SHAP waterfall attributions reflect statistical associations within the trained model, not proven causal drivers. Changing an attribute in real life (e.g. encouraging an inactive member to log in) will not automatically guarantee churn reduction by the predicted delta without campaign uplift testing.
2. **Intervention Feasibility**: Churn prediction models estimate the likelihood of exit, not customer persuadability. Certain high-risk churners may be irrecoverable.

## 3. Responsible AI & Regulatory Constraints
1. **Human-in-the-Loop Requirement**: Under GDPR Article 22, solely automated decision-making producing significant legal or financial effects is restricted. BankSight AI is designed strictly as an analyst decision-support system.
2. **Prohibition of Adverse Actions**: Demographic variables (e.g. Gender, Age) are tracked for bias auditing and must NEVER be used to justify credit denial, unfavorable interest margins, or punitive fee structures.
