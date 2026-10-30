"""
Retain360 / BankSight AI — Automated Tests for Advanced Retain360 Engines
========================================================================
Tests Survival Analysis, Dynamic CLTV, Uplift Modeling, Household Graph, and PSI Sentinel.
"""
import pytest
import numpy as np
import pandas as pd

from src.data_loader import load_dataset
from src.survival_analysis import KaplanMeierEstimator, CoxPHSurvivalModel, DynamicCLTVEngine
from src.uplift_modeling import TwoModelUpliftEngine
from src.household_graph import HouseholdGraphEngine
from src.mlops_sentinel import PSISentinel
from src.advanced_models import apply_smote_rebalance, build_advanced_model_suite


@pytest.fixture(scope="module")
def sample_banking_df():
    df = load_dataset()
    return df.head(500).copy()


def test_kaplan_meier_estimator(sample_banking_df):
    km = KaplanMeierEstimator.fit(sample_banking_df["Tenure"].values, sample_banking_df["Exited"].values)
    assert "timeline" in km
    assert "survival_probability" in km
    assert len(km["survival_probability"]) > 1
    # Monotonically non-increasing survival curve
    probs = km["survival_probability"]
    for i in range(len(probs) - 1):
        assert probs[i] >= probs[i + 1]


def test_cox_ph_and_dynamic_cltv(sample_banking_df):
    features = ["CreditScore", "Age", "Balance"]
    X = sample_banking_df[features].copy()
    for col in features:
        X[col] = (X[col] - X[col].mean()) / max(X[col].std(), 1e-4)

    cox = CoxPHSurvivalModel()
    cox.fit(X, durations=sample_banking_df["Tenure"].values, events=sample_banking_df["Exited"].values)
    assert cox.fitted is True
    assert len(cox.hazard_ratios) == len(features)

    # Test individual survival curve
    surv_curve = cox.predict_survival_function(X.iloc[0].values)
    assert 1.0 in surv_curve
    assert surv_curve[1.0] <= 1.0

    # Test Dynamic CLTV computation
    cltv = DynamicCLTVEngine.compute_customer_cltv(
        survival_curve=surv_curve,
        balance=125000.0,
        num_products=2,
    )
    assert "dynamic_cltv_eur" in cltv
    assert cltv["dynamic_cltv_eur"] > 0
    assert "value_tier" in cltv


def test_two_model_uplift_engine(sample_banking_df):
    features = ["CreditScore", "Age", "Tenure", "Balance", "NumOfProducts"]
    y = 1 - sample_banking_df["Exited"].values
    treatment = (sample_banking_df["IsActiveMember"] == 1).astype(int).values

    engine = TwoModelUpliftEngine()
    engine.fit(sample_banking_df[features], y=y, treatment=treatment)
    assert engine.fitted is True

    segmented = engine.segment_portfolio(sample_banking_df, feature_cols=features)
    assert "Uplift_Score" in segmented.columns
    assert "Causal_Quadrant" in segmented.columns
    summary = TwoModelUpliftEngine.compute_quadrant_summary(segmented)
    assert "Persuadables" in summary
    assert "Sleeping Dogs" in summary


def test_household_graph_engine(sample_banking_df):
    engine = HouseholdGraphEngine(contagion_lambda=0.25)
    graph = engine.build_network(sample_banking_df, max_nodes=60)
    assert "nodes" in graph
    assert "edges" in graph
    assert graph["node_count"] > 0
    assert "high_contagion_hubs" in graph


def test_psi_sentinel():
    expected = np.random.normal(100, 15, 1000)
    actual_stable = np.random.normal(101, 15, 1000)
    actual_drift = np.random.normal(130, 20, 1000)

    res_stable = PSISentinel.calculate_single_feature_psi(expected, actual_stable)
    assert res_stable["status"] == "STABLE"

    res_drift = PSISentinel.calculate_single_feature_psi(expected, actual_drift)
    assert res_drift["status"] in ["MODERATE_DRIFT", "CRITICAL_DRIFT"]
    assert res_drift["psi"] > res_stable["psi"]


def test_advanced_models_suite():
    models = build_advanced_model_suite()
    assert "Class-Weighted Random Forest" in models
    assert "5-Node Artificial Neural Network (ANN)" in models
