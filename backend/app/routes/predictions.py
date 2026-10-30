"""
BankSight AI — Machine Learning, Risk Passport & Explainability API Router
Provides multi-model consensus scoring, SHAP waterfall attributions, and prediction playground.
"""
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Body
import math
import pandas as pd
import numpy as np

from backend.app.database import get_portfolio_df, get_scored_portfolio_df, get_model_artifacts, get_explainer
from src.prediction_service import PredictionService
from src.risk_scoring import suggest_analyst_action

router = APIRouter(tags=["ML & Predictions"])


@router.get("/models")
def get_model_benchmarks():
    artifacts = get_model_artifacts()
    evals = artifacts.get("test_evaluations", {})
    cv_res = artifacts.get("cv_results", {})
    records = []
    for model_name, metrics in evals.items():
        # Downsample curves to ~60-80 points for smooth frontend rendering
        roc_data = metrics.get("roc_curve", {})
        fpr = roc_data.get("fpr", [])
        tpr = roc_data.get("tpr", [])
        if len(fpr) > 100:
            step = max(1, len(fpr) // 80)
            fpr = fpr[::step]
            tpr = tpr[::step]
            if fpr[-1] != 1.0:
                fpr.append(1.0)
                tpr.append(1.0)

        pr_data = metrics.get("pr_curve", {})
        prec = pr_data.get("precision", [])
        rec = pr_data.get("recall", [])
        if len(prec) > 100:
            step = max(1, len(prec) // 80)
            prec = prec[::step]
            rec = rec[::step]

        records.append({
            "model_name": model_name,
            "is_champion": (model_name == artifacts.get("best_model_name")),
            "roc_auc": round(float(metrics.get("roc_auc", 0)), 4),
            "pr_auc": round(float(metrics.get("pr_auc", 0)), 4),
            "accuracy": round(float(metrics.get("accuracy", 0)), 4),
            "precision": round(float(metrics.get("precision", 0)), 4),
            "recall": round(float(metrics.get("recall", 0)), 4),
            "f1_score": round(float(metrics.get("f1_score", 0)), 4),
            "brier_score": round(float(metrics.get("brier_score", 0)), 4),
            "confusion_matrix": metrics.get("confusion_matrix", {}),
            "roc_curve": {"fpr": [round(float(x), 4) for x in fpr], "tpr": [round(float(x), 4) for x in tpr]},
            "pr_curve": {"precision": [round(float(x), 4) for x in prec], "recall": [round(float(x), 4) for x in rec]},
            "calibration_curve": metrics.get("calibration_curve", {}),
            "cv_metrics": cv_res.get(model_name, {}),
        })

    return {
        "champion_model": artifacts.get("best_model_name", "Gradient Boosting"),
        "models": records,
        "feature_ablation": artifacts.get("demographic_ablation", {}),
    }


@router.post("/predictions/score")
def score_customer_profile(payload: Dict[str, Any] = Body(...)):
    """
    Computes multi-model calibrated consensus churn probabilities, model spread, and analyst action.
    """
    df = get_portfolio_df()
    customer_id = payload.get("CustomerId")

    if customer_id is not None:
        scored_df = get_scored_portfolio_df()
        match = scored_df[scored_df["CustomerId"] == int(customer_id)]
        if not match.empty:
            row = match.iloc[0]
            churn_prob = float(row.get("Predicted_Churn_Prob", 0.5))
            model_spread = float(row.get("Model_Spread", 0.0))
            balance = float(row.get("Balance", 0.0))

            action_dict = suggest_analyst_action(churn_prob, model_spread, balance)
            action_text = (
                f"{action_dict.get('recommended_action', 'Review')} "
                f"({action_dict.get('urgency', 'Normal')}): {action_dict.get('rationale', '')}"
            )
            risk_tier = row.get("Risk_Tier", row.get("Risk_Category", "Moderate"))
            disagree_flag = bool(row.get("Model_Disagreement_Flag", row.get("Is_High_Disagreement", False)))

            return {
                "customer_id": int(row["CustomerId"]),
                "surname": str(row.get("Surname", "")),
                "predicted_prob": round(churn_prob, 4),
                "risk_category": risk_tier,
                "risk_tier": risk_tier,
                "model_spread": round(model_spread, 4),
                "is_high_disagreement": disagree_flag,
                "individual_probs": {
                    "gradient_boosting": round(float(row.get("Prob_Gradient_Boosting", churn_prob)), 4),
                    "random_forest": round(float(row.get("Prob_Random_Forest", churn_prob)), 4),
                    "logistic_regression": round(float(row.get("Prob_Logistic_Regression", churn_prob)), 4),
                },
                "recommended_action": action_text,
                "action_details": action_dict,
            }

    # Otherwise score custom user attributes
    sample_row = pd.DataFrame([{
        "CreditScore": int(payload.get("CreditScore", 650)),
        "Geography": str(payload.get("Geography", "France")),
        "Gender": str(payload.get("Gender", "Female")),
        "Age": int(payload.get("Age", 42)),
        "Tenure": int(payload.get("Tenure", 5)),
        "Balance": float(payload.get("Balance", 85000.0)),
        "NumOfProducts": int(payload.get("NumOfProducts", 2)),
        "HasCrCard": int(payload.get("HasCrCard", 1)),
        "IsActiveMember": int(payload.get("IsActiveMember", 0)),
        "EstimatedSalary": float(payload.get("EstimatedSalary", 95000.0)),
    }])

    scored = PredictionService.score_batch(sample_row, artifacts=get_model_artifacts())
    res = scored.iloc[0]

    churn_prob = float(res.get("Predicted_Churn_Prob", 0.5))
    model_spread = float(res.get("Model_Spread", 0.0))
    balance = float(res.get("Balance", 0.0))

    action_dict = suggest_analyst_action(churn_prob, model_spread, balance)
    action_text = (
        f"{action_dict.get('recommended_action', 'Review')} "
        f"({action_dict.get('urgency', 'Normal')}): {action_dict.get('rationale', '')}"
    )
    risk_tier = res.get("Risk_Tier", res.get("Risk_Category", "Moderate"))
    disagree_flag = bool(res.get("Model_Disagreement_Flag", res.get("Is_High_Disagreement", False)))

    return {
        "customer_id": None,
        "surname": "Simulated Customer",
        "predicted_prob": round(churn_prob, 4),
        "risk_category": risk_tier,
        "risk_tier": risk_tier,
        "model_spread": round(model_spread, 4),
        "is_high_disagreement": disagree_flag,
        "individual_probs": {
            "gradient_boosting": round(float(res.get("Prob_Gradient_Boosting", churn_prob)), 4),
            "random_forest": round(float(res.get("Prob_Random_Forest", churn_prob)), 4),
            "logistic_regression": round(float(res.get("Prob_Logistic_Regression", churn_prob)), 4),
        },
        "recommended_action": action_text,
        "action_details": action_dict,
    }


def _sanitize_nan(obj: Any) -> Any:
    if isinstance(obj, dict):
        return {k: _sanitize_nan(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_sanitize_nan(v) for v in obj]
    elif isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
        return None
    elif pd.isna(obj):
        return None
    return obj


@router.post("/predictions/counterfactual")
def compute_counterfactual_recourse(payload: Dict[str, Any] = Body(...)):
    """
    Computes minimum actionable feature perturbations to transition an at-risk customer
    into the safe retention zone.
    """
    from src.counterfactual import CounterfactualRecourseEngine
    artifacts = get_model_artifacts()
    engine = CounterfactualRecourseEngine(artifacts=artifacts)

    customer_id = payload.get("CustomerId") or payload.get("customer_id")
    if customer_id is not None:
        df = get_portfolio_df()
        match = df[df["CustomerId"] == int(customer_id)]
        if not match.empty:
            raw_profile = match.iloc[0].to_dict()
            recourse = engine.compute_recourse(raw_profile)
            return _sanitize_nan(recourse)

    # Custom attributes
    recourse = engine.compute_recourse(payload)
    return _sanitize_nan(recourse)


@router.post("/predictions/explain")
def explain_customer(payload: Dict[str, Any] = Body(...)):
    """
    Computes local SHAP waterfall feature attributions for a given customer profile.
    """
    artifacts = get_model_artifacts()
    explainer = get_explainer()

    customer_id = payload.get("CustomerId")
    if customer_id is not None:
        df = get_portfolio_df()
        match = df[df["CustomerId"] == int(customer_id)]
        if not match.empty:
            raw_sample = match.iloc[[0]]
            proc_sample = artifacts["preprocessor"].transform(raw_sample)
            attribution = explainer.explain_instance(proc_sample[0], raw_sample.iloc[0].to_dict())
            return attribution

    # Default to first test sample
    x_test_proc = artifacts["test_data"]["X_test_proc"]
    attribution = explainer.explain_instance(x_test_proc[0])
    return attribution
