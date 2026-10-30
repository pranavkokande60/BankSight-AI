"""
Unit Tests for Core Analytics & Statistical Methods
"""
import pytest
import pandas as pd
import numpy as np
from src.analytics import compute_portfolio_kpis, compute_segment_breakdown
from src.statistical_analysis import wilson_score_interval, cramers_v, analyze_categorical_association


def test_portfolio_kpi_calculations():
    # 4 customers: 2 retained, 2 churned
    df = pd.DataFrame({
        "Balance": [10000.0, 50000.0, 120000.0, 200000.0],
        "Exited": [0, 0, 1, 1],
    })

    kpis = compute_portfolio_kpis(df, high_value_balance_threshold=100000.0)

    assert kpis["total_customers"] == 4
    assert kpis["total_churned"] == 2
    assert kpis["total_retained"] == 2
    assert kpis["churn_rate"] == 0.50
    assert kpis["total_balance_exposure"] == 380000.0
    assert kpis["churned_balance_exposure"] == 320000.0
    assert kpis["high_val_customer_count"] == 2  # 120k and 200k
    assert kpis["high_val_churned_count"] == 2
    assert kpis["high_val_churn_rate"] == 1.0


def test_segment_breakdown_denominators():
    df = pd.DataFrame({
        "Geography": ["France", "France", "Germany", "Germany"],
        "Balance": [100.0, 200.0, 300.0, 400.0],
        "Exited": [0, 1, 1, 1],
    })

    breakdown = compute_segment_breakdown(df, "Geography")

    france_row = breakdown[breakdown["Geography"] == "France"].iloc[0]
    germany_row = breakdown[breakdown["Geography"] == "Germany"].iloc[0]

    # France: 1 churned out of 2 = 50% segment churn rate
    assert france_row["segment_churn_rate"] == 0.50
    # France: 1 churned out of 3 total churned = 33.3% churn contribution
    assert pytest.approx(france_row["churn_contribution"], 0.01) == 0.333

    # Germany: 2 churned out of 2 = 100% segment churn rate
    assert germany_row["segment_churn_rate"] == 1.0
    # Germany: 2 churned out of 3 total churned = 66.7% churn contribution
    assert pytest.approx(germany_row["churn_contribution"], 0.01) == 0.667


def test_wilson_interval_bounds():
    lower, upper = wilson_score_interval(successes=20, trials=100, confidence=0.95)
    assert 0.0 <= lower <= 0.20
    assert 0.20 <= upper <= 1.0
    # Extreme cases
    l_zero, u_zero = wilson_score_interval(0, 50)
    assert l_zero == 0.0 and u_zero > 0.0
    l_all, u_all = wilson_score_interval(50, 50)
    assert l_all < 1.0 and u_all == 1.0


def test_categorical_association_function():
    df = pd.DataFrame({
        "Geography": ["France"] * 50 + ["Germany"] * 50,
        "Exited": [0] * 40 + [1] * 10 + [0] * 20 + [1] * 30,
    })
    res = analyze_categorical_association(df, "Geography", "Exited")
    assert "chi2_statistic" in res
    assert "p_value" in res
    assert res["is_significant"] is True
    assert res["cramers_v"] > 0.0
