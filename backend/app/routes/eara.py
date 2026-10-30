"""
BankSight AI — Evidence-Aware Retention Allocation (EARA) API Router
Connects churn probabilities, model disagreement, balance exposure, and review budgets.
"""
import math
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Query
import pandas as pd
import numpy as np

from backend.app.database import get_scored_portfolio_df
from src.eara import EARAPrioritizer

router = APIRouter(prefix="/eara", tags=["EARA Retention Intelligence"])


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


@router.get("/allocate")
def allocate_retention_budget(
    budget: int = Query(500, ge=50, le=3000),
    weight_risk: float = Query(0.60, ge=0.0, le=1.0),
    weight_balance: float = Query(0.35, ge=0.0, le=1.0),
    weight_disagreement: float = Query(0.15, ge=0.0, le=1.0),
    weight_segment: Optional[float] = Query(0.10, ge=0.0, le=1.0),
):
    df = get_scored_portfolio_df()
    prioritizer = EARAPrioritizer(
        risk_weight=weight_risk,
        disagreement_penalty=weight_disagreement,
        value_proxy_col="Balance",
    )

    prioritized_df = prioritizer.compute_priority_scores(df)
    alloc = prioritizer.evaluate_budget_allocation(prioritized_df, review_budget=budget, strategy="EARA")

    # Build comparison table for the 3 allocation policies
    comparison_table = []
    for strat in ["Risk-Only", "Risk + Value Proxy", "EARA"]:
        strat_res = prioritizer.evaluate_budget_allocation(df, review_budget=budget, strategy=strat)
        comparison_table.append({
            "Policy": strat,
            "Strategy": strat,
            "Selected_Count": strat_res["review_budget"],
            "Budget": strat_res["review_budget"],
            "Balance_Protected": round(float(strat_res["selected_balance_exposure"]), 2),
            "Mean_Risk": round(float(strat_res["precision_at_budget"]), 4),
            "High_Disagreement_Count": int(strat_res["high_disagreement_selected"]),
            "Capture_Rate": round(float(strat_res["churner_capture_rate"]), 4),
            "Balance_Coverage": round(float(strat_res["balance_exposure_coverage"]), 4),
        })

    # Format selected customer preview safely
    preview_df = alloc.get("selected_customers_preview")
    selected_preview = []
    if preview_df is not None and hasattr(preview_df, "to_dict"):
        keep_cols = [
            "CustomerId", "Surname", "CreditScore", "Geography", "Gender", "Age",
            "Tenure", "Balance", "NumOfProducts", "Predicted_Churn_Prob",
            "Model_Spread", "Score_EARA", "Routing_Queue", "Risk_Category"
        ]
        avail_cols = [c for c in keep_cols if c in preview_df.columns]
        preview_clean = preview_df[avail_cols].copy()
        selected_preview = preview_clean.to_dict(orient="records")

    res = {
        "budget": budget,
        "selected_count": alloc.get("review_budget", budget),
        "mean_selected_risk": round(float(alloc.get("precision_at_budget", 0.5)), 4),
        "total_balance_protected": round(float(alloc.get("selected_balance_exposure", 0)), 2),
        "balance_exposure_coverage": round(float(alloc.get("balance_exposure_coverage", 0)), 4),
        "mean_model_spread": round(float(alloc.get("mean_model_spread", 0)), 4),
        "high_disagreement_selected": int(alloc.get("high_disagreement_selected", 0)),
        "comparison_table": comparison_table,
        "group_selection_rates": alloc.get("group_selection_rates", {}),
        "selected_preview": selected_preview,
    }
    return sanitize_nan(res)
