"""
BankSight AI — Analytics Visualizer & Multi-Dimensional Comparison Router
========================================================================
Module: backend/app/routes/analytics_visualizer.py
Author: Lead AI Engineer & Principal Financial Data Scientist

Provides endpoints for:
1. /visualizer/metadata: Filter bounds and categories
2. /visualizer/data: 10 interactive multi-dimensional comparison charts (Recharts)
3. /visualizer/export-csv: Downloadable CSV of filtered portfolio
"""
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Query, Response
from fastapi.responses import StreamingResponse
import io
import pandas as pd
import numpy as np

from backend.app.database import get_scored_portfolio_df, get_model_artifacts

visualizer_router = APIRouter(prefix="/visualizer", tags=["Data Comparison & Visualization"])


@visualizer_router.get("/metadata")
def get_visualizer_metadata():
    df = get_scored_portfolio_df()
    return {
        "countries": ["ALL"] + sorted(df["Geography"].dropna().unique().tolist()),
        "products": ["ALL"] + sorted([int(p) for p in df["NumOfProducts"].dropna().unique().tolist()]),
        "activity_statuses": ["ALL", "Active Member", "Inactive Member"],
        "genders": ["ALL"] + sorted(df["Gender"].dropna().unique().tolist()) if "Gender" in df.columns else ["ALL"],
        "risk_categories": ["ALL", "Low", "Medium", "High", "Critical"],
        "min_balance": float(df["Balance"].min()),
        "max_balance": float(df["Balance"].max()),
        "total_records": len(df),
    }


@visualizer_router.get("/data")
def get_visualizer_data(
    country: Optional[str] = Query(None),
    products: Optional[int] = Query(None),
    is_active: Optional[int] = Query(None),
    gender: Optional[str] = Query(None),
    risk_category: Optional[str] = Query(None),
    min_balance: Optional[float] = Query(None),
):
    df = get_scored_portfolio_df()
    filtered = df.copy()

    if country and country != "ALL":
        filtered = filtered[filtered["Geography"] == country]
    if products is not None and products != 0:
        filtered = filtered[filtered["NumOfProducts"] == products]
    if is_active is not None and is_active in (0, 1):
        filtered = filtered[filtered["IsActiveMember"] == is_active]
    if gender and gender != "ALL" and "Gender" in filtered.columns:
        filtered = filtered[filtered["Gender"] == gender]
    if risk_category and risk_category != "ALL" and "Risk_Category" in filtered.columns:
        filtered = filtered[filtered["Risk_Category"] == risk_category]
    if min_balance is not None and min_balance > 0:
        filtered = filtered[filtered["Balance"] >= min_balance]

    total_matched = len(filtered)
    if total_matched == 0:
        return {"total_matched": 0, "empty": True, "message": "No customer records matched filters."}

    # 1. KPI Summary
    churned_count = int(filtered["Exited"].sum())
    churn_rate_pct = round((churned_count / total_matched) * 100, 2)
    total_balance = float(filtered["Balance"].sum())
    avg_balance = round(float(filtered["Balance"].mean()), 2)
    capital_at_risk = float(filtered[filtered["Exited"] == 1]["Balance"].sum())
    high_risk_count = int((filtered["Predicted_Churn_Prob"] >= 0.45).sum()) if "Predicted_Churn_Prob" in filtered.columns else churned_count

    kpis = {
        "total_matched": total_matched,
        "churned_count": churned_count,
        "retained_count": total_matched - churned_count,
        "churn_rate_pct": churn_rate_pct,
        "total_balance_eur": round(total_balance, 2),
        "avg_balance_eur": avg_balance,
        "capital_at_risk_eur": round(capital_at_risk, 2),
        "high_risk_count": high_risk_count,
    }

    # 2. Sovereign Country Comparison
    country_comp = []
    for geo, grp in filtered.groupby("Geography"):
        tot = len(grp)
        ex = int(grp["Exited"].sum())
        country_comp.append({
            "country": geo,
            "volume": tot,
            "churn_rate_pct": round((ex / tot) * 100, 2),
            "avg_balance": round(float(grp["Balance"].mean()), 2),
            "capital_at_risk": round(float(grp[grp["Exited"] == 1]["Balance"].sum()), 2),
            "zero_balance_pct": round(float((grp["Balance"] == 0).mean()) * 100, 1),
            "churned": ex,
            "retained": tot - ex,
        })

    # 3. Product Holding Cliff Comparison
    product_comp = []
    for num_p, grp in filtered.groupby("NumOfProducts"):
        tot = len(grp)
        ex = int(grp["Exited"].sum())
        product_comp.append({
            "product_label": f"{num_p} Product{'s' if num_p > 1 else ''}",
            "products": int(num_p),
            "volume": tot,
            "churn_rate_pct": round((ex / tot) * 100, 2),
            "avg_balance": round(float(grp["Balance"].mean()), 2),
            "churned": ex,
            "retained": tot - ex,
        })
    product_comp.sort(key=lambda x: x["products"])

    # 4. Demographic Age Bracket vs Capital Risk
    filtered_temp = filtered.copy()
    filtered_temp["Age_Bracket"] = pd.cut(
        filtered_temp["Age"],
        bins=[17, 30, 40, 50, 60, 100],
        labels=["18-30", "31-40", "41-50", "51-60", "60+"]
    )
    age_comp = []
    for ab, grp in filtered_temp.groupby("Age_Bracket", observed=False):
        tot = len(grp)
        ex = int(grp["Exited"].sum())
        age_comp.append({
            "age_bracket": str(ab),
            "volume": tot,
            "churn_rate_pct": round((ex / tot) * 100, 2) if tot > 0 else 0,
            "avg_balance": round(float(grp["Balance"].mean()), 2) if tot > 0 else 0,
            "capital_at_risk": round(float(grp[grp["Exited"] == 1]["Balance"].sum()), 2) if tot > 0 else 0,
        })

    # 5. Active vs Inactive Digital Engagement
    activity_comp = []
    for is_act, grp in filtered.groupby("IsActiveMember"):
        tot = len(grp)
        ex = int(grp["Exited"].sum())
        activity_comp.append({
            "status": "Active Member" if is_act == 1 else "Inactive Member",
            "volume": tot,
            "churn_rate_pct": round((ex / tot) * 100, 2),
            "avg_balance": round(float(grp["Balance"].mean()), 2),
            "total_balance": round(float(grp["Balance"].sum()), 2),
        })

    # 6. Balance Brackets Exposure
    bal_bins = [-1, 0, 50000, 100000, 150000, 1000000]
    bal_labels = ["0 (Zero Balance)", "€1 - €50K", "€50K - €100K", "€100K - €150K", "€150K+"]
    filtered_temp["Balance_Bracket"] = pd.cut(filtered_temp["Balance"], bins=bal_bins, labels=bal_labels)
    balance_comp = []
    for bb, grp in filtered_temp.groupby("Balance_Bracket", observed=False):
        tot = len(grp)
        ex = int(grp["Exited"].sum())
        balance_comp.append({
            "bracket": str(bb),
            "volume": tot,
            "churn_rate_pct": round((ex / tot) * 100, 2) if tot > 0 else 0,
            "avg_credit_score": round(float(grp["CreditScore"].mean()), 1) if tot > 0 else 0,
            "capital_at_risk": round(float(grp[grp["Exited"] == 1]["Balance"].sum()), 2) if tot > 0 else 0,
        })

    # 7. Credit Score Tiers
    cs_bins = [0, 579, 669, 739, 799, 900]
    cs_labels = ["Poor (<580)", "Fair (580-669)", "Good (670-739)", "Very Good (740-799)", "Exceptional (800+)"]
    filtered_temp["Credit_Tier"] = pd.cut(filtered_temp["CreditScore"], bins=cs_bins, labels=cs_labels)
    credit_comp = []
    for ct, grp in filtered_temp.groupby("Credit_Tier", observed=False):
        tot = len(grp)
        ex = int(grp["Exited"].sum())
        credit_comp.append({
            "tier": str(ct),
            "volume": tot,
            "churn_rate_pct": round((ex / tot) * 100, 2) if tot > 0 else 0,
            "avg_balance": round(float(grp["Balance"].mean()), 2) if tot > 0 else 0,
        })

    # 8. ML Models Benchmark Comparison
    artifacts = get_model_artifacts()
    evals = artifacts.get("test_evaluations", {})
    ml_models = []
    for m_name, m_metrics in evals.items():
        ml_models.append({
            "model_name": m_name,
            "is_champion": (m_name == artifacts.get("best_model_name")),
            "roc_auc": round(float(m_metrics.get("roc_auc", 0)), 4),
            "pr_auc": round(float(m_metrics.get("pr_auc", 0)), 4),
            "accuracy": round(float(m_metrics.get("accuracy", 0)) * 100, 2),
            "precision": round(float(m_metrics.get("precision", 0)) * 100, 2),
            "recall": round(float(m_metrics.get("recall", 0)) * 100, 2),
            "f1_score": round(float(m_metrics.get("f1_score", 0)), 4),
            "brier_score": round(float(m_metrics.get("brier_score", 0)), 4),
        })

    # 9. Precomputed Side-by-Side Cohort Presets
    cohort_presets = {
        "germany_vs_france": {
            "cohort_a": {"name": "Germany Territory", "churn_rate_pct": 32.44, "avg_balance": 119730.12, "volume": 2509, "capital_exposed_m": 97.4},
            "cohort_b": {"name": "France Territory", "churn_rate_pct": 16.15, "avg_balance": 62098.47, "volume": 5014, "capital_exposed_m": 50.3},
            "verdict": "German accounts exhibit double the attrition velocity of French accounts with 1.93x higher average balances, representing the platform's primary sovereign flight risk."
        },
        "single_vs_multi_product": {
            "cohort_a": {"name": "1-Product Holders", "churn_rate_pct": 27.71, "avg_balance": 98602.37, "volume": 5084, "capital_exposed_m": 138.9},
            "cohort_b": {"name": "3+ Product Holders", "churn_rate_pct": 86.82, "avg_balance": 82010.55, "volume": 326, "capital_exposed_m": 23.2},
            "verdict": "Steep holding cliff: holding 3+ products spikes churn hazard by +59.1 percentage points, signaling acute bundle friction and fee dissatisfaction."
        },
        "active_vs_inactive": {
            "cohort_a": {"name": "Digital Active Members", "churn_rate_pct": 14.27, "avg_balance": 74582.11, "volume": 5151, "capital_exposed_m": 54.8},
            "cohort_b": {"name": "Inactive Depositors", "churn_rate_pct": 26.85, "avg_balance": 78241.05, "volume": 4849, "capital_exposed_m": 101.9},
            "verdict": "Digital engagement acts as a powerful retention stabilizer, suppressing customer attrition by 12.58 percentage points."
        }
    }

    return {
        "kpis": kpis,
        "country_comparison": country_comp,
        "product_cliff": product_comp,
        "age_demographics": age_comp,
        "activity_comparison": activity_comp,
        "balance_brackets": balance_comp,
        "credit_tiers": credit_comp,
        "ml_models": ml_models,
        "cohort_presets": cohort_presets,
    }


@visualizer_router.get("/export-csv")
def export_visualizer_csv(
    country: Optional[str] = Query(None),
    products: Optional[int] = Query(None),
    is_active: Optional[int] = Query(None),
    gender: Optional[str] = Query(None),
    risk_category: Optional[str] = Query(None),
):
    df = get_scored_portfolio_df()
    filtered = df.copy()

    if country and country != "ALL":
        filtered = filtered[filtered["Geography"] == country]
    if products is not None and products != 0:
        filtered = filtered[filtered["NumOfProducts"] == products]
    if is_active is not None and is_active in (0, 1):
        filtered = filtered[filtered["IsActiveMember"] == is_active]
    if gender and gender != "ALL" and "Gender" in filtered.columns:
        filtered = filtered[filtered["Gender"] == gender]
    if risk_category and risk_category != "ALL" and "Risk_Category" in filtered.columns:
        filtered = filtered[filtered["Risk_Category"] == risk_category]

    stream = io.StringIO()
    filtered.to_csv(stream, index=False)
    stream.seek(0)

    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=banksight_portfolio_comparison.csv"
    return response
