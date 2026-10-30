"""
BankSight AI — Core Analytics & Portfolio Metrics
Provides verified portfolio metrics, demographic breakdowns, and financial exposure calculations.
"""
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

from src.feature_engineering import add_engineered_features


def compute_portfolio_kpis(df: pd.DataFrame, high_value_balance_threshold: float = 100_000.0) -> Dict[str, Any]:
    """
    Computes portfolio-wide baseline KPIs with strict definitions.

    Parameters:
    -----------
    df : pd.DataFrame
        Banking dataset.
    high_value_balance_threshold : float
        Threshold in EUR defining high-value balance exposure (default €100k).

    Returns:
    --------
    Dict containing verified scalar metrics.
    """
    total_customers = int(len(df))
    if total_customers == 0:
        return {}

    has_target = "Exited" in df.columns
    total_churned = int(df["Exited"].sum()) if has_target else 0
    total_retained = total_customers - total_churned
    churn_rate = float(total_churned / total_customers) if has_target else 0.0

    total_balance = float(df["Balance"].sum()) if "Balance" in df.columns else 0.0
    churned_balance = (
        float(df.loc[df["Exited"] == 1, "Balance"].sum())
        if has_target and "Balance" in df.columns
        else 0.0
    )

    # High-value customer metrics
    high_val_mask = df["Balance"] >= high_value_balance_threshold if "Balance" in df.columns else pd.Series(False, index=df.index)
    high_val_count = int(high_val_mask.sum())
    high_val_churned = int(df.loc[high_val_mask, "Exited"].sum()) if has_target else 0
    high_val_churn_rate = (
        float(high_val_churned / high_val_count) if high_val_count > 0 else 0.0
    )
    high_val_balance_exposure = (
        float(df.loc[high_val_mask & (df["Exited"] == 1), "Balance"].sum())
        if has_target and "Balance" in df.columns
        else 0.0
    )

    return {
        "total_customers": total_customers,
        "total_churned": total_churned,
        "total_retained": total_retained,
        "churn_rate": churn_rate,
        "total_balance_exposure": total_balance,
        "churned_balance_exposure": churned_balance,
        "high_val_customer_count": high_val_count,
        "high_val_churned_count": high_val_churned,
        "high_val_churn_rate": high_val_churn_rate,
        "high_val_churned_balance_exposure": high_val_balance_exposure,
        "high_value_threshold": high_value_balance_threshold,
    }


def compute_segment_breakdown(
    df: pd.DataFrame, group_col: str, sort_by: str = "customer_count"
) -> pd.DataFrame:
    """
    Computes segment size, segment churn rate, churn contribution, and balance exposure.
    Strictly separates segment churn rate from total churn contribution.
    """
    if group_col not in df.columns:
        raise ValueError(f"Column '{group_col}' not found in DataFrame.")

    total_customers = len(df)
    total_churned_all = int(df["Exited"].sum()) if "Exited" in df.columns else 1

    records = []
    for val, grp in df.groupby(group_col, observed=False):
        count = len(grp)
        pct_of_total = count / total_customers
        balance_exp = float(grp["Balance"].sum()) if "Balance" in grp.columns else 0.0
        avg_balance = float(grp["Balance"].mean()) if "Balance" in grp.columns else 0.0
        avg_age = float(grp["Age"].mean()) if "Age" in grp.columns else 0.0

        if "Exited" in grp.columns:
            churned = int(grp["Exited"].sum())
            retained = count - churned
            seg_churn_rate = churned / count if count > 0 else 0.0
            churn_contrib = churned / total_churned_all if total_churned_all > 0 else 0.0
            churned_balance = float(grp.loc[grp["Exited"] == 1, "Balance"].sum())
        else:
            churned = 0
            retained = count
            seg_churn_rate = 0.0
            churn_contrib = 0.0
            churned_balance = 0.0

        records.append({
            group_col: str(val),
            "customer_count": count,
            "share_of_customers": pct_of_total,
            "retained_count": retained,
            "churned_count": churned,
            "segment_churn_rate": seg_churn_rate,
            "churn_contribution": churn_contrib,
            "total_balance": balance_exp,
            "churned_balance_exposure": churned_balance,
            "mean_balance": avg_balance,
            "mean_age": avg_age,
        })

    res = pd.DataFrame(records)
    if sort_by in res.columns:
        res = res.sort_values(by=sort_by, ascending=False).reset_index(drop=True)
    return res


def compute_cross_tabulation(
    df: pd.DataFrame, row_col: str, col_col: str, metric: str = "mean_churn"
) -> pd.DataFrame:
    """Computes bivariate cross-tabulation table for heatmap visualizations."""
    if "Exited" not in df.columns:
        return pd.DataFrame()

    if metric == "mean_churn":
        ct = df.groupby([row_col, col_col], observed=False)["Exited"].mean().unstack()
    elif metric == "count":
        ct = df.groupby([row_col, col_col], observed=False)["Exited"].count().unstack()
    elif metric == "churned_count":
        ct = df.groupby([row_col, col_col], observed=False)["Exited"].sum().unstack()
    else:
        ct = df.groupby([row_col, col_col], observed=False)["Balance"].sum().unstack()

    return ct.fillna(0.0)
