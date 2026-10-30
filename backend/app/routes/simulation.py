"""
BankSight AI — What-If Scenario Simulator API Router
Evaluates financial ROI, contact costs, and net retention profit across scenarios.
"""
import math
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Query
import pandas as pd
import numpy as np

from backend.app.database import get_scored_portfolio_df
from src.simulation import run_retention_scenario

router = APIRouter(prefix="/simulator", tags=["Retention Scenario Simulator"])


def sanitize_nan(obj: Any) -> Any:
    """Recursively replaces NaN, Infinity, and pd.NA values with valid JSON types."""
    if isinstance(obj, dict):
        return {k: sanitize_nan(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_nan(v) for v in obj]
    elif isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    elif pd.isna(obj):
        return None
    return obj


@router.get("/scenarios")
def get_scenario_simulation(
    budget: int = Query(1000, ge=100, le=5000),
    risk_threshold: float = Query(0.40, ge=0.1, le=0.9),
    cost_per_contact: float = Query(45.0, ge=5.0, le=200.0),
    success_rate: float = Query(0.20, ge=0.05, le=0.80),
    margin_rate: float = Query(0.02, ge=0.005, le=0.10),
):
    df = get_scored_portfolio_df()
    raw = run_retention_scenario(
        df,
        review_budget=budget,
        risk_threshold=risk_threshold,
        cost_per_contact=cost_per_contact,
        assumed_success_rate=success_rate,
        annual_margin_on_balance=margin_rate,
    )
    res = dict(raw)
    if "scenarios_table" in res and hasattr(res["scenarios_table"], "to_dict"):
        res["scenarios_table"] = res["scenarios_table"].to_dict(orient="records")
    return sanitize_nan(res)


@router.get("/stress-test")
@router.post("/stress-test")
def get_ecb_stress_test(
    scenario: str = Query("ADVERSE_INFLATION_SHOCK"),
    euribor_delta_bps: int = Query(0, ge=-500, le=1000),
    balance_shock_pct: float = Query(0.0, ge=-50.0, le=50.0),
):
    """
    Executes macroprudential stress testing under ECB Basel III guidelines.
    """
    from src.stress_testing import ECBStressTester
    df = get_scored_portfolio_df()
    return ECBStressTester.run_stress_test(
        scored_df=df,
        scenario_key=scenario,
        custom_euribor_bps=euribor_delta_bps,
        custom_balance_shock_pct=balance_shock_pct,
    )

