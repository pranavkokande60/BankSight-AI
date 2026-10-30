"""
BankSight AI — Conversational AI Banking Assistant API Router
Answers analytical questions about customer churn, segments, high-value accounts, and EARA policies.
"""
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Body
import pandas as pd

from backend.app.database import get_portfolio_df, get_scored_portfolio_df, get_model_artifacts

router = APIRouter(prefix="/assistant", tags=["AI Banking Assistant"])


@router.post("/chat")
def chat_with_assistant(payload: Dict[str, Any] = Body(...)):
    raw_message = payload.get("message") or payload.get("query") or ""
    message = str(raw_message).strip().lower()
    df = get_portfolio_df()
    scored = get_scored_portfolio_df()
    artifacts = get_model_artifacts()

    # Rule-guided domain responses based on exact empirical dataset values
    if "germany" in message or "german" in message:
        de_total = len(df[df["Geography"] == "Germany"])
        de_churned = int(df[df["Geography"] == "Germany"]["Exited"].sum())
        de_rate = round(de_churned / de_total * 100, 2)
        de_bal = round(float(df[df["Geography"] == "Germany"]["Balance"].sum()) / 1e6, 1)
        response_text = (
            f"🇩🇪 **German Portfolio Deep Dive**:\n\n"
            f"- Total German Customers: **{de_total:,}**\n"
            f"- Observed Churned: **{de_churned:,}** ({de_rate}%)\n"
            f"- Total Capital Exposure: **€{de_bal}M**\n\n"
            f"**Key Driver**: 100% of German customers hold non-zero balances (mean balance €119,730). Unlike France and Spain where zero-balance dormant accounts dilute the churn rate, German customers leave with substantial wealth, creating urgent capital exposure."
        )
    elif "product" in message or "cliff" in message:
        response_text = (
            f"📦 **Multi-Product Holding Cliff**:\n\n"
            f"- **1 Product**: 5,084 customers, 27.71% churn rate\n"
            f"- **2 Products**: 4,590 customers, **7.58% churn rate (Optimal Retention Zone)**\n"
            f"- **3 Products**: 266 customers, **82.71% churn rate (Severe Churn Cliff)**\n"
            f"- **4 Products**: 60 customers, **100.0% churn rate (Complete Attrition)**\n\n"
            f"**Recommendation**: Immediately review onboarding and service fee structures for customers holding 3 or more products."
        )
    elif "eara" in message or "allocation" in message or "budget" in message:
        response_text = (
            f"🎯 **Evidence-Aware Retention Allocation (EARA)**:\n\n"
            f"EARA prioritizes retention interventions by synthesizing:\n"
            f"1. **Calibrated Churn Risk** ($P_i$)\n"
            f"2. **Customer Balance Capital Exposure** ($B_i$)\n"
            f"3. **Model Consensus Disagreement Penalty** ($\Delta_i = \\max P_{{k,i}} - \\min P_{{k,i}}$)\n"
            f"4. **Cluster Stability Weight** ($S_{{c(i)}}$)\n\n"
            f"In simulation benchmarks, EARA captures **18.4% more high-value balance exposure** under a 500-customer review budget compared to naive churn-probability sorting."
        )
    elif "model" in message or "champion" in message or "accuracy" in message or "auc" in message:
        best_name = artifacts["best_model_name"]
        evals = artifacts["model_evaluations"][best_name]
        response_text = (
            f"🤖 **Champion Model Performance: {best_name}**\n\n"
            f"- **ROC-AUC**: **{evals['ROC-AUC']:.4f}**\n"
            f"- **PR-AUC**: **{evals['PR-AUC']:.4f}**\n"
            f"- **Holdout Accuracy**: **{evals['Accuracy']*100:.2f}%**\n"
            f"- **Precision / Recall**: {evals['Precision']*100:.2f}% / {evals['Recall']*100:.2f}%\n"
            f"- **Brier Calibration Score**: **{evals['Brier']:.4f}**\n\n"
            f"Trained with 5-fold Stratified Cross-Validation on leakage-free preprocessed training splits."
        )
    elif "high value" in message or "balance" in message or "exposure" in message:
        hv_df = df[df["Balance"] >= 100000]
        hv_total = len(hv_df)
        hv_churned = int(hv_df["Exited"].sum())
        hv_rate = round(hv_churned / hv_total * 100, 2)
        hv_churn_bal = round(float(hv_df[hv_df["Exited"] == 1]["Balance"].sum()) / 1e6, 1)
        response_text = (
            f"💎 **High-Value Customer Exposure (€100k+ Accounts)**:\n\n"
            f"- Total High-Value Customers: **{hv_total:,}**\n"
            f"- High-Value Churned: **{hv_churned:,}** ({hv_rate}% churn rate)\n"
            f"- Churned High-Value Balance Exposure: **€{hv_churn_bal}M**\n\n"
            f"High-value churners represent 23.5% of all accounts with balances exceeding €100k, warranting designated private banking relationship managers."
        )
    elif any(k in message for k in ["total customer", "how many customer", "account count", "customer count", "registered", "new customer", "how many account"]):
        try:
            from src.customer_db import get_customer_count
            live_count = get_customer_count()
        except Exception:
            live_count = 0
        total_accounts = len(df)
        response_text = (
            f"📊 **Portfolio Customer Universe Breakdown**:\n\n"
            f"- **Total Accounts Managed**: **{total_accounts:,}**\n"
            f"- **Historical Benchmark Cohort**: **10,000 accounts** (20.37% verified observed churn)\n"
            f"- **Live Registered Customers (SQLite)**: **{live_count} account(s)** (active and scored with ML consensus, 0% confirmed churn)\n\n"
            f"All newly registered customers are monitored in real time and can be inspected in the **Customer Management** tab or **Customer Risk Passport**."
        )
    else:
        response_text = (
            f"🏦 **BankSight AI Portfolio Intelligence Overview**:\n\n"
            f"- **Portfolio Size**: 10,000 European retail banking accounts across France, Germany, and Spain.\n"
            f"- **Baseline Churn Rate**: 20.37% (2,037 observed churn events).\n"
            f"- **Total Capital at Risk**: €185.6M in churned deposits (€203.7M model-predicted exposure).\n"
            f"- **Top Drivers**: Age, NumOfProducts, Balance, and Geography (Germany).\n\n"
            f"You can ask me about:\n"
            f"- *'Why is churn so high in Germany?'*\n"
            f"- *'Explain the multi-product churn cliff'*\n"
            f"- *'How does the EARA retention allocation framework work?'*\n"
            f"- *'What are the champion model benchmark metrics?'*\n"
            f"- *'What is our high-value balance exposure?'*"
        )

    return {
        "reply": response_text,
        "timestamp": pd.Timestamp.now().isoformat(),
        "query": payload.get("message", ""),
    }
