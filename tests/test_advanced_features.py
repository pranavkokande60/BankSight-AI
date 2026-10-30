"""
BankSight AI — Automated Tests for Advanced Analytics Features
=============================================================
Tests Counterfactual Recourse, ECB Macro Stress Tester, and PDF Dossier.
"""
import pytest
from pathlib import Path
import pandas as pd

from src.data_loader import load_dataset
from backend.app.database import get_model_artifacts
from src.counterfactual import CounterfactualRecourseEngine
from src.stress_testing import ECBStressTester
from src.pdf_generator import build_executive_pdf_dossier


@pytest.fixture(scope="module")
def shared_artifacts():
    df = load_dataset()
    artifacts = get_model_artifacts()
    return df, artifacts


def test_counterfactual_recourse_engine(shared_artifacts):
    df, artifacts = shared_artifacts
    engine = CounterfactualRecourseEngine(artifacts=artifacts, target_threshold=0.25)

    high_risk_customer = {
        "CustomerId": 99999999,
        "CreditScore": 500,
        "Geography": "Germany",
        "Gender": "Female",
        "Age": 52,
        "Tenure": 2,
        "Balance": 120000.0,
        "NumOfProducts": 3,
        "HasCrCard": 1,
        "IsActiveMember": 0,
        "EstimatedSalary": 90000.0,
    }

    result = engine.compute_recourse(high_risk_customer)
    assert "original_prob" in result
    assert "achieved_prob" in result
    assert "actions" in result
    assert len(result["actions"]) > 0
    assert result["achieved_prob"] < result["original_prob"]


def test_ecb_stress_tester(shared_artifacts):
    df, _ = shared_artifacts
    df_sample = df.copy()
    df_sample["Predicted_Churn_Prob"] = 0.2037

    res = ECBStressTester.run_stress_test(
        scored_df=df_sample,
        scenario_key="ADVERSE_INFLATION_SHOCK",
        custom_euribor_bps=100,
        custom_balance_shock_pct=-10.0,
    )

    assert "scenario_name" in res
    assert "portfolio_impact" in res
    assert res["portfolio_impact"]["stressed_churn_rate_pct"] > 20.37
    assert res["portfolio_impact"]["incremental_capital_loss_eur"] > 0
    assert len(res["geographic_vulnerability"]) == 3
    assert len(res["supervisory_action_items"]) > 0


def test_pdf_dossier_compilation(tmp_path):
    out_pdf = str(tmp_path / "Test_Dossier.pdf")
    path = build_executive_pdf_dossier(out_pdf)
    assert Path(path).exists()
    assert Path(path).stat().st_size > 10000
