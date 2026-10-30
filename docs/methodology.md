# BankSight AI — Research Methodology & Scientific Standards

## 1. Objective
BankSight AI was engineered as a final-year engineering capstone project to investigate:
1. Customer attrition patterns across European retail banking markets (France, Germany, Spain).
2. Behavioral archetypes discovered through unsupervised clustering without target contamination.
3. Supervised classification under class imbalance (~4:1 retention:churn ratio).
4. The **Evidence-Aware Retention Allocation (EARA)** framework for prioritizing finite customer review budgets.

## 2. Statistical Methodology
- **Wilson Score Intervals**: Computed for all binomial churn proportions to provide robust 95% confidence intervals across varying segment sizes.
- **Categorical Association**: Pearson's Chi-Square Test of Independence with Cramer's V effect size.
- **Continuous Group Differences**: Welch's two-sample t-test (unequal variances assumed) and Mann-Whitney U rank sums with Cohen's d effect size.
- **Scientific Humility**: Correlation is never presented as causation; associations reflect empirical distributions rather than proven causal levers.

## 3. Evidence-Aware Retention Allocation (EARA)
Under an operational review budget $B$, let each customer $i$ possess predicted churn probability $\hat{P}_i$, capital exposure proxy $V_i = \text{Balance}_i$, and multi-model spread $\Delta_i = \max_m P_{m,i} - \min_m P_{m,i}$.

$$S_{\text{EARA}, i} = \left[ \alpha \cdot \widetilde{P}_i + (1 - \alpha) \cdot \widetilde{V}_i \right] \times \left(1 - \lambda \cdot \Delta_i\right) \times E_i$$

Where:
- $\alpha \in [0, 1]$ represents the operational weight between churn risk and financial exposure.
- $\lambda \in [0, 1]$ penalizes predictions characterized by significant model disagreement.
- $E_i \in [0, 1]$ denotes evidence completeness.
