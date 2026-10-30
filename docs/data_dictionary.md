# BankSight AI — Data Dictionary

| Column Name | Type | Physical Range | Banking Meaning / Analytical Role |
| :--- | :--- | :--- | :--- |
| `Year` | `int64` | `2025` | Static snapshot identifier. Constant across all records; pruned during training. |
| `CustomerId` | `int64` | `15,565,701` to `15,815,690` | Primary key. Unique customer identifier (PII; excluded from training). |
| `Surname` | `object` | 2,932 distinct strings | Customer surname (PII; excluded from training). |
| `CreditScore` | `int64` | `350` to `850` | Standardized credit score (FICO-like scale). Mean: 650.53. |
| `Geography` | `object` | `France`, `Germany`, `Spain` | Operational territory. France (50.14%), Germany (25.09%), Spain (24.77%). |
| `Gender` | `object` | `Male`, `Female` | Demographic gender cohort. Male (54.57%), Female (45.43%). |
| `Age` | `int64` | `18` to `92` | Customer age in years. Mean: 38.92. |
| `Tenure` | `int64` | `0` to `10` | Relationship duration with bank in years. Mean: 5.01. |
| `Balance` | `float64` | `€0.00` to `€250,898.09` | Account balance in EUR. Bimodal: 36.17% hold €0.00 (France/Spain). |
| `NumOfProducts`| `int64` | `1`, `2`, `3`, `4` | Total bank products currently held (current, savings, credit, mortgage). |
| `HasCrCard` | `int64` | `0`, `1` | Binary flag: 1 if customer holds bank-issued credit card. |
| `IsActiveMember`| `int64` | `0`, `1` | Binary flag: 1 if active digital/branch transaction engagement in past cycle. |
| `EstimatedSalary`| `float64`| `€11.58` to `€199,992.48` | Estimated annual income in EUR. |
| `Exited` | `int64` | `0`, `1` | Supervised target: 1 = Departed / Churned (20.37%), 0 = Retained (79.63%). |
