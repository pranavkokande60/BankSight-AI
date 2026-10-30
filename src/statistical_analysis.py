"""
BankSight AI — Statistical Analysis & Hypothesis Testing
Provides rigorous hypothesis testing, effect sizes, and Wilson Score confidence intervals.
"""
from typing import Dict, Any, List, Tuple
import pandas as pd
import numpy as np
from scipy import stats


def wilson_score_interval(successes: int, trials: int, confidence: float = 0.95) -> Tuple[float, float]:
    """
    Computes Wilson Score confidence interval for a binomial proportion.
    Robust for both small sample sizes and extreme proportions.
    """
    if trials == 0:
        return (0.0, 0.0)
    if successes == 0:
        z = stats.norm.ppf(1 - (1 - confidence) / 2)
        upper = (z**2) / (trials + z**2)
        return (0.0, float(upper))
    if successes == trials:
        z = stats.norm.ppf(1 - (1 - confidence) / 2)
        lower = trials / (trials + z**2)
        return (float(lower), 1.0)

    z = stats.norm.ppf(1 - (1 - confidence) / 2)
    p_hat = successes / trials
    denominator = 1 + (z**2) / trials
    centre = p_hat + (z**2) / (2 * trials)
    spread = z * np.sqrt((p_hat * (1 - p_hat) + (z**2) / (4 * trials)) / trials)

    lower = max(0.0, (centre - spread) / denominator)
    upper = min(1.0, (centre + spread) / denominator)
    return (float(lower), float(upper))


def cramers_v(contingency_table: np.ndarray) -> float:
    """Computes Cramer's V effect size for categorical contingency tables."""
    chi2 = stats.chi2_contingency(contingency_table)[0]
    n = contingency_table.sum()
    r, k = contingency_table.shape
    phi2 = chi2 / n
    r_corr = r - ((r - 1) ** 2) / (n - 1)
    k_corr = k - ((k - 1) ** 2) / (n - 1)
    denominator = min(k_corr - 1, r_corr - 1)
    if denominator <= 0:
        return 0.0
    return float(np.sqrt(max(0.0, phi2) / denominator))


def analyze_categorical_association(df: pd.DataFrame, feature: str, target: str = "Exited") -> Dict[str, Any]:
    """
    Conducts Pearson's Chi-Square Test of Independence with Cramer's V effect size.
    """
    if feature not in df.columns or target not in df.columns:
        raise ValueError(f"Columns {feature} or {target} missing from dataset.")

    contingency = pd.crosstab(df[feature], df[target])
    chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
    v = cramers_v(contingency.values)

    return {
        "test": "Pearson Chi-Square",
        "feature": feature,
        "chi2_statistic": float(chi2),
        "p_value": float(p_val),
        "degrees_of_freedom": int(dof),
        "cramers_v": float(v),
        "is_significant": bool(p_val < 0.05),
        "contingency_table": contingency.to_dict(),
        "null_hypothesis": f"Independence between {feature} and {target} (churn outcome)",
        "interpretation": (
            f"Statistically significant association detected (p < 0.05, V={v:.3f}). "
            "Note: Association does not imply direct causality."
            if p_val < 0.05
            else f"No statistically significant association detected (p >= 0.05)."
        ),
    }


def analyze_numerical_difference(
    df: pd.DataFrame, feature: str, target: str = "Exited"
) -> Dict[str, Any]:
    """
    Conducts two-sample t-test and Mann-Whitney U test comparing feature between Retained and Churned.
    Computes Cohen's d effect size.
    """
    if feature not in df.columns or target not in df.columns:
        raise ValueError(f"Columns {feature} or {target} missing from dataset.")

    group_0 = df.loc[df[target] == 0, feature].dropna()
    group_1 = df.loc[df[target] == 1, feature].dropna()

    n0, n1 = len(group_0), len(group_1)
    if n0 < 2 or n1 < 2:
        return {}

    # Welch's t-test (unequal variances assumed)
    t_stat, t_pval = stats.ttest_ind(group_0, group_1, equal_var=False)

    # Mann-Whitney U test (non-parametric rank sum)
    u_stat, u_pval = stats.mannwhitneyu(group_0, group_1, alternative="two-sided")

    # Cohen's d
    s_pooled = np.sqrt(((n0 - 1) * group_0.var() + (n1 - 1) * group_1.var()) / (n0 + n1 - 2))
    cohens_d = (group_1.mean() - group_0.mean()) / s_pooled if s_pooled > 0 else 0.0

    return {
        "feature": feature,
        "n_retained": n0,
        "n_churned": n1,
        "mean_retained": float(group_0.mean()),
        "mean_churned": float(group_1.mean()),
        "median_retained": float(group_0.median()),
        "median_churned": float(group_1.median()),
        "welch_t_stat": float(t_stat),
        "welch_t_pval": float(t_pval),
        "mann_whitney_u": float(u_stat),
        "mann_whitney_pval": float(u_pval),
        "cohens_d": float(cohens_d),
        "is_significant": bool(t_pval < 0.05),
        "interpretation": (
            f"Statistically significant difference (p < 0.05, Cohen's d = {cohens_d:.3f})."
            if t_pval < 0.05
            else "Difference between retained and churned is not statistically significant."
        ),
    }
