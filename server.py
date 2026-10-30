"""
BankSight AI — Production FastAPI Backend Server
Serves RESTful analytics endpoints and mounts the modern web frontend.
"""
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import pandas as pd
import numpy as np

from src.data_loader import load_dataset
from src.data_validation import DataQualityAuditor
from src.analytics import compute_portfolio_kpis, compute_segment_breakdown, compute_cross_tabulation
from src.statistical_analysis import analyze_categorical_association, analyze_numerical_difference
from src.segmentation import CustomerSegmentationEngine
from src.prediction_service import PredictionService
from src.explainability import ExplainabilityEngine
from src.risk_scoring import suggest_analyst_action
from src.eara import EARAPrioritizer
from src.fairness import audit_subgroup_fairness
from src.simulation import run_retention_scenario
from src.report_generation import generate_executive_report_markdown, generate_research_paper_text
from src.config import BASE_DIR

app = FastAPI(
    title="BankSight AI API",
    description="Explainable Customer Segmentation, Churn Analytics & EARA Decision Engine",
    version="1.0.0",
)

# Enable CORS for local or remote web frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global in-memory dataset & artifact cache
import joblib
from src.config import MODELS_DIR

DF = load_dataset()
ARTIFACTS = PredictionService.get_artifacts(df_fallback=DF)
SCORED_CACHE_PATH = MODELS_DIR / "scored_portfolio.joblib"
if SCORED_CACHE_PATH.exists():
    SCORED_DF = joblib.load(SCORED_CACHE_PATH)
else:
    SCORED_DF = PredictionService.score_batch(DF, artifacts=ARTIFACTS)
    joblib.dump(SCORED_DF, SCORED_CACHE_PATH)

BEST_CLF = ARTIFACTS["trained_models"][ARTIFACTS["best_model_name"]]
EXPLAINER = ExplainabilityEngine(
    model=BEST_CLF,
    feature_names=ARTIFACTS["feature_names"],
    background_data=ARTIFACTS["test_data"]["X_test_proc"][:50],
)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "dataset_rows": len(DF),
        "best_model": ARTIFACTS["best_model_name"],
        "timestamp": pd.Timestamp.now().isoformat(),
    }


@app.get("/api/kpis")
def get_kpis(high_value_threshold: float = 100000.0):
    """Returns macro portfolio KPIs and capital exposure."""
    return compute_portfolio_kpis(DF, high_value_balance_threshold=high_value_threshold)


@app.get("/api/data-quality")
def get_data_quality():
    """Runs automated 10-point data validation audit."""
    auditor = DataQualityAuditor(DF)
    return auditor.run_full_audit()


@app.get("/api/segmentation")
def get_segmentation(k: int = Query(4, ge=2, le=6), algo: str = "kmeans"):
    """Runs clustering engine, generates 3D PCA coordinates and persona profiles."""
    engine = CustomerSegmentationEngine(algorithm=algo, n_clusters=k)
    annotated, results = engine.fit_predict(DF)

    # Return sample of 1500 points for snappy 3D WebGL rendering in browser
    sample_pts = annotated.sample(min(1500, len(annotated)), random_state=42)
    points = sample_pts[[
        "CustomerId", "PCA_1", "PCA_2", "PCA_3", "Cluster", "Cluster_Name",
        "Age", "Balance", "NumOfProducts", "Geography", "Exited"
    ]].to_dict(orient="records")

    return {
        "metrics": results["metrics"],
        "explained_variance_2d": results["explained_variance_2d"],
        "explained_variance_3d": results["explained_variance_3d"],
        "cluster_profiles": results["cluster_profiles"].to_dict(orient="records"),
        "points": points,
    }


@app.get("/api/churn-intelligence")
def get_churn_intelligence():
    """Provides territorial, demographic, and product holding breakdown."""
    geo_df = compute_segment_breakdown(DF, "Geography")
    prod_df = compute_segment_breakdown(DF, "NumOfProducts", sort_by="NumOfProducts")

    from src.feature_engineering import add_engineered_features
    df_eng = add_engineered_features(DF)
    age_df = compute_segment_breakdown(df_eng, "AgeGroup", sort_by="AgeGroup")
    gender_df = compute_segment_breakdown(DF, "Gender")
    active_df = compute_segment_breakdown(DF, "IsActiveMember")

    # Heatmap: products vs activity
    ct_matrix = compute_cross_tabulation(DF, "NumOfProducts", "IsActiveMember", metric="mean_churn")

    return {
        "geography": geo_df.to_dict(orient="records"),
        "products": prod_df.to_dict(orient="records"),
        "age_groups": age_df.to_dict(orient="records"),
        "gender": gender_df.to_dict(orient="records"),
        "activity": active_df.to_dict(orient="records"),
        "heatmap": {
            "x": ["Inactive", "Active"],
            "y": [str(p) for p in ct_matrix.index],
            "z": (ct_matrix * 100).round(1).values.tolist(),
        },
    }


@app.get("/api/models")
def get_model_benchmarks():
    """Returns cross-validation scores, isolated holdout test metrics, and ROC/PR curve data."""
    test_evals = ARTIFACTS["test_evaluations"]
    cv_res = ARTIFACTS["cv_results"]

    summary = []
    curves = {}
    for name, ev in test_evals.items():
        cv = cv_res[name]
        summary.append({
            "name": name,
            "is_best": name == ARTIFACTS["best_model_name"],
            "cv_roc_auc": cv["cv_roc_auc_mean"],
            "cv_pr_auc": cv["cv_pr_auc_mean"],
            "test_accuracy": ev["accuracy"],
            "test_roc_auc": ev["roc_auc"],
            "test_pr_auc": ev["pr_auc"],
            "test_recall": ev["recall"],
            "test_precision": ev["precision"],
            "test_f1": ev["f1_score"],
            "brier_score": ev["brier_score"],
            "confusion_matrix": ev["confusion_matrix"],
        })
        curves[name] = {
            "roc": ev["roc_curve"],
            "pr": ev["pr_curve"],
            "calibration": ev["calibration_curve"],
        }

    return {
        "best_model": ARTIFACTS["best_model_name"],
        "models": summary,
        "curves": curves,
        "demographic_ablation": ARTIFACTS.get("demographic_ablation", {}),
    }


@app.get("/api/customers/search")
def search_customers(q: str = Query("", min_length=1), limit: int = 15):
    """Searches customers by CustomerId or Surname prefix."""
    q_str = str(q).strip().lower()
    matches = DF[
        DF["CustomerId"].astype(str).str.contains(q_str) |
        DF["Surname"].str.lower().str.contains(q_str)
    ].head(limit)
    return matches.to_dict(orient="records")


@app.post("/api/predict")
def predict_customer(customer: Dict[str, Any] = Body(...)):
    """Predicts churn risk for a single customer, computes multi-model consensus & SHAP factors."""
    consensus = PredictionService.predict_single(customer, artifacts=ARTIFACTS)
    action = suggest_analyst_action(
        consensus["risk_tier"],
        consensus["has_strong_disagreement"],
        customer,
    )

    # Compute local SHAP attribution using globally cached explainer
    explanation = EXPLAINER.explain_instance(consensus["processed_features"], original_values=customer)

    return {
        "consensus": {
            "mean_probability": consensus["mean_probability"],
            "best_model_prob": consensus["best_model_prob"],
            "best_model_name": consensus["best_model_name"],
            "spread": consensus["spread"],
            "std_dev": consensus["std_dev"],
            "has_strong_disagreement": consensus["has_strong_disagreement"],
            "risk_tier": consensus["risk_tier"],
            "individual_probabilities": consensus["individual_probabilities"],
        },
        "action": action,
        "explanation": {
            "base_value": explanation["base_value"],
            "narrative_summary": explanation["narrative_summary"],
            "top_attributions": explanation["attributions"].head(8).to_dict(orient="records"),
        },
    }


@app.get("/api/eara")
def get_eara_allocation(
    budget: int = Query(800, ge=50, le=5000),
    risk_weight: float = Query(0.60, ge=0.0, le=1.0),
    disagreement_penalty: float = Query(0.35, ge=0.0, le=1.0),
    strategy: str = "EARA",
):
    """Executes Evidence-Aware Retention Allocation under finite budget."""
    prioritizer = EARAPrioritizer(
        risk_weight=risk_weight,
        disagreement_penalty=disagreement_penalty,
        value_proxy_col="Balance",
    )
    comparison = prioritizer.compare_all_strategies(SCORED_DF, review_budget=budget)
    alloc = prioritizer.evaluate_budget_allocation(SCORED_DF, review_budget=budget, strategy=strategy)

    preview_cols = [
        "CustomerId", "Geography", "Gender", "Age", "Balance",
        "Predicted_Churn_Prob", "Model_Spread", "Score_EARA", "Routing_Queue", "Exited"
    ]
    valid_cols = [c for c in preview_cols if c in alloc["selected_customers_preview"].columns]
    selected_preview = alloc["selected_customers_preview"][valid_cols].head(50).to_dict(orient="records")

    return {
        "strategy": strategy,
        "review_budget": alloc["review_budget"],
        "captured_churners": alloc["captured_churners"],
        "churner_capture_rate": alloc["churner_capture_rate"],
        "precision_at_budget": alloc["precision_at_budget"],
        "selected_balance_exposure": alloc["selected_balance_exposure"],
        "balance_exposure_coverage": alloc["balance_exposure_coverage"],
        "mean_model_spread": alloc["mean_model_spread"],
        "high_disagreement_selected": alloc["high_disagreement_selected"],
        "comparison_table": comparison.to_dict(orient="records"),
        "group_selection_rates": alloc["group_selection_rates"],
        "selected_preview": selected_preview,
    }


@app.get("/api/fairness")
def get_fairness_audit(group_col: str = "Geography", threshold: float = 0.50):
    """Audits subgroup demographic parity, equal opportunity, and disparate impact."""
    return audit_subgroup_fairness(
        SCORED_DF,
        group_col=group_col,
        y_true_col="Exited",
        y_prob_col="Predicted_Churn_Prob",
        threshold=threshold,
    )


@app.get("/api/simulator")
def get_scenario_simulation(
    budget: int = 1000,
    risk_threshold: float = 0.40,
    cost_per_contact: float = 45.0,
    success_rate: float = 0.20,
    margin_rate: float = 0.02,
):
    """Simulates multi-scenario retention economics."""
    return run_retention_scenario(
        SCORED_DF,
        review_budget=budget,
        risk_threshold=risk_threshold,
        cost_per_contact=cost_per_contact,
        assumed_success_rate=success_rate,
        annual_margin_on_balance=margin_rate,
    )


# Mount Web Frontend Directory
FRONTEND_DIR = BASE_DIR / "frontend"
FRONTEND_DIR.mkdir(exist_ok=True)

app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


@app.get("/")
def serve_index():
    index_file = FRONTEND_DIR / "index.html"
    if not index_file.exists():
        raise HTTPException(status_code=404, detail="Frontend index.html not found.")
    return FileResponse(index_file)


if __name__ == "__main__":
    import os
    import sys
    import socket
    import uvicorn

    def find_free_port(preferred: int = 8000) -> int:
        for p in [preferred, 8001, 8080, 8501, 8088, 5000]:
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                    s.bind(("127.0.0.1", p))
                    return p
            except OSError:
                continue
        return preferred

    cli_port = None
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        cli_port = int(sys.argv[1])
    elif "PORT" in os.environ:
        cli_port = int(os.environ["PORT"])

    selected_port = cli_port if cli_port else find_free_port(8000)
    print(f"\n{'='*70}\n  BankSight AI Web Platform\n  Serving at: http://localhost:{selected_port}\n  API docs:   http://localhost:{selected_port}/docs\n{'='*70}\n")
    uvicorn.run("server:app", host="127.0.0.1", port=selected_port, reload=False)
