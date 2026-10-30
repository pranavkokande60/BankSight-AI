"""
Retain360 / BankSight AI — Survival Analysis & Dynamic CLTV API Router
======================================================================
Module: backend/app/routes/survival.py
Author: Principal Financial Data Scientist & Lead AI Engineer

Exposes endpoints for:
1. Non-parametric Kaplan-Meier survival curves by cohort
2. Semi-parametric Cox Proportional Hazards ratios & individual S(t|x)
3. Dynamic Customer Lifetime Value (CLTV) computations
"""
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Query, HTTPException
import numpy as np
import pandas as pd

from backend.app.database import get_portfolio_df, get_scored_portfolio_df
from src.survival_analysis import KaplanMeierEstimator, CoxPHSurvivalModel, DynamicCLTVEngine

router = APIRouter(prefix="/survival", tags=["Survival Analysis & Dynamic CLTV"])

_CACHED_COX_MODEL = None
_CACHED_COX_FEATURES = ["CreditScore", "Age", "Balance", "NumOfProducts", "IsActiveMember"]


def get_trained_cox_model() -> CoxPHSurvivalModel:
    global _CACHED_COX_MODEL
    if _CACHED_COX_MODEL is None:
        df = get_portfolio_df(include_new=False)
        X = df[_CACHED_COX_FEATURES].copy()
        # Normalize continuous features for numerical stability
        for col in ["CreditScore", "Age", "Balance"]:
            X[col] = (X[col] - X[col].mean()) / max(X[col].std(), 1e-4)

        model = CoxPHSurvivalModel()
        model.fit(X, durations=df["Tenure"].values, events=df["Exited"].values)
        _CACHED_COX_MODEL = model
    return _CACHED_COX_MODEL


@router.get("/kaplan-meier")
def get_kaplan_meier_curves(
    cohort_by: str = Query("Geography", pattern="^(Geography|NumOfProducts|IsActiveMember|Gender)$"),
):
    """
    Computes Kaplan-Meier survival curves stratified by demographic or product cohort.
    """
    df = get_portfolio_df(include_new=False)
    cohort_curves = KaplanMeierEstimator.compare_cohorts(
        df, cohort_col=cohort_by, duration_col="Tenure", event_col="Exited"
    )
    overall = KaplanMeierEstimator.fit(df["Tenure"].values, df["Exited"].values)

    return {
        "cohort_dimension": cohort_by,
        "overall_survival": overall,
        "cohort_survival": cohort_curves,
        "tenure_horizons_years": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    }


@router.get("/cox-hazards")
def get_cox_hazard_ratios():
    """
    Returns Cox Proportional Hazards regression coefficients, hazard ratios, and baseline survival.
    """
    model = get_trained_cox_model()
    return {
        "model": "Cox Proportional Hazards (L2 Penalized)",
        "hazard_ratios": model.hazard_ratios,
        "baseline_survival": {str(k): round(v, 4) for k, v in model.baseline_survival.items()},
        "feature_interpretation": {
            "Age": "Every 1-SD increase in age increases churn hazard by " + str(model.hazard_ratios.get("Age", 1.4)) + "x",
            "NumOfProducts": "Holding 3+ products multiplies churn hazard significantly",
            "IsActiveMember": "Active membership cuts churn hazard substantially (< 1.0 hazard ratio)",
        }
    }


@router.get("/cltv")
def get_customer_cltv(customer_id: int = Query(15634602)):
    """
    Computes Dynamic Customer Lifetime Value (CLTV) for a specific account.
    """
    df = get_portfolio_df()
    match = df[df["CustomerId"] == customer_id]
    if match.empty:
        raise HTTPException(status_code=404, detail=f"Customer ID {customer_id} not found.")

    row = match.iloc[0]
    model = get_trained_cox_model()

    # Form normalized vector
    vec = np.array([
        (float(row["CreditScore"]) - 650.5) / 96.6,
        (float(row["Age"]) - 38.9) / 10.4,
        (float(row["Balance"]) - 76485.8) / 62397.4,
        float(row["NumOfProducts"]),
        float(row["IsActiveMember"]),
    ])

    surv_curve = model.predict_survival_function(vec, time_points=[1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0])
    cltv_result = DynamicCLTVEngine.compute_customer_cltv(
        survival_curve=surv_curve,
        balance=float(row["Balance"]),
        num_products=int(row["NumOfProducts"]),
    )

    return {
        "customer_id": customer_id,
        "surname": str(row.get("Surname", "Client")),
        "geography": str(row.get("Geography", "France")),
        "balance_eur": float(row["Balance"]),
        "num_products": int(row["NumOfProducts"]),
        "cltv_metrics": cltv_result,
        "survival_curve": surv_curve,
    }
