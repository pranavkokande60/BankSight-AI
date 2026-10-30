"""
BankSight AI — In-Memory Database & Analytics Store
Loads dataset, models, and precomputed risk scores for sub-millisecond retrieval.
"""
from pathlib import Path
from typing import Dict, Any, Optional
import pandas as pd
import joblib

from src.data_loader import load_dataset
from src.prediction_service import PredictionService
from src.explainability import ExplainabilityEngine
from src.config import BASE_DIR, MODELS_DIR

# Global Singletons
DF: pd.DataFrame = load_dataset()
ARTIFACTS: Dict[str, Any] = PredictionService.get_artifacts(df_fallback=DF)

SCORED_CACHE_PATH = MODELS_DIR / "scored_portfolio.joblib"
if SCORED_CACHE_PATH.exists():
    SCORED_DF: pd.DataFrame = joblib.load(SCORED_CACHE_PATH)
else:
    SCORED_DF: pd.DataFrame = PredictionService.score_batch(DF, artifacts=ARTIFACTS)
    joblib.dump(SCORED_DF, SCORED_CACHE_PATH)

BEST_MODEL_NAME = ARTIFACTS["best_model_name"]
BEST_CLF = ARTIFACTS["trained_models"][BEST_MODEL_NAME]

EXPLAINER = ExplainabilityEngine(
    model=BEST_CLF,
    feature_names=ARTIFACTS["feature_names"],
    background_data=ARTIFACTS["test_data"]["X_test_proc"][:50],
)


def get_sqlite_customers_df() -> pd.DataFrame:
    """Loads active newly registered customers from SQLite as a formatted DataFrame."""
    try:
        from src.customer_db import get_all_customers
        records = get_all_customers(include_archived=False)
        if not records:
            return pd.DataFrame()
        rows = []
        for r in records:
            rows.append({
                "Year": 2026,
                "CustomerId": int(r["customer_id"]),
                "Surname": r.get("surname") or f"Customer {r['customer_id']}",
                "CreditScore": int(r["credit_score"]),
                "Geography": str(r["geography"]),
                "Gender": str(r["gender"]),
                "Age": int(r["age"]),
                "Tenure": int(r["tenure"]),
                "Balance": float(r["balance"]),
                "NumOfProducts": int(r["num_of_products"]),
                "HasCrCard": int(r["has_cr_card"]),
                "IsActiveMember": int(r["is_active_member"]),
                "EstimatedSalary": float(r["estimated_salary"]),
                "Exited": None,  # Strictly None for newly registered customers
                "record_status": r.get("record_status", "ACTIVE"),
                "created_at": r.get("created_at"),
            })
        return pd.DataFrame(rows)
    except Exception:
        return pd.DataFrame()


def get_portfolio_df(include_new: bool = True) -> pd.DataFrame:
    if not include_new:
        return DF
    df_sqlite = get_sqlite_customers_df()
    if df_sqlite.empty:
        return DF
    return pd.concat([DF, df_sqlite], ignore_index=True)


def get_scored_portfolio_df(include_new: bool = True) -> pd.DataFrame:
    base_scored = SCORED_DF.copy()
    if "Risk_Category" not in base_scored.columns and "Risk_Tier" in base_scored.columns:
        base_scored["Risk_Category"] = base_scored["Risk_Tier"]
    if "Model_Spread" in base_scored.columns:
        base_scored["Is_High_Disagreement"] = base_scored["Model_Spread"] >= 0.25

    if not include_new:
        return base_scored

    df_sqlite = get_sqlite_customers_df()
    if df_sqlite.empty:
        return base_scored

    try:
        df_scored_new = PredictionService.score_batch(df_sqlite, artifacts=ARTIFACTS)
        df_scored_new["Risk_Category"] = df_scored_new["Risk_Tier"]
        df_scored_new["Is_High_Disagreement"] = df_scored_new["Model_Spread"] >= 0.25
        return pd.concat([base_scored, df_scored_new], ignore_index=True)
    except Exception:
        return base_scored


def get_model_artifacts() -> Dict[str, Any]:
    return ARTIFACTS


def get_explainer() -> ExplainabilityEngine:
    return EXPLAINER
