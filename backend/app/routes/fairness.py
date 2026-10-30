"""
BankSight AI — Model Trust & Fairness Audit API Router
Audits demographic parity, equal opportunity differences, and 4/5ths rule compliance.
"""
import math
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Query
import pandas as pd

from backend.app.database import get_scored_portfolio_df
from src.fairness import audit_subgroup_fairness

router = APIRouter(prefix="/fairness", tags=["Model Trust & Fairness"])


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


@router.get("/audit")
def get_fairness_audit(
    group_col: str = Query("Geography"),
    threshold: float = Query(0.50, ge=0.1, le=0.9),
):
    df = get_scored_portfolio_df()
    raw = audit_subgroup_fairness(
        df,
        group_col=group_col,
        y_true_col="Exited",
        y_prob_col="Predicted_Churn_Prob",
        threshold=threshold,
    )
    res = dict(raw)
    if "subgroup_table" in res and hasattr(res["subgroup_table"], "to_dict"):
        res["subgroup_table"] = res["subgroup_table"].to_dict(orient="records")
    return sanitize_nan(res)
