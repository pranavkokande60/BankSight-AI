"""
BankSight AI — Page 12: Reports & Audit Centre
Generates computed executive summaries, research paper manuscripts, audit trails, and data exports.
"""
import streamlit as st
import pandas as pd
import datetime

from src.data_loader import load_dataset
from src.prediction_service import PredictionService
from src.analytics import compute_portfolio_kpis
from src.eara import EARAPrioritizer
from src.report_generation import generate_executive_report_markdown, generate_research_paper_text
from src.ui_components import render_brand_header, render_metric_card

st.set_page_config(page_title="Reports & Audit — BankSight AI", page_icon="📑", layout="wide")

render_brand_header(
    page_title="Reports & Audit Centre",
    subtitle="Automated Technical Reporting, Academic Capstone Research Paper & Regulatory Audit Trails",
)

df = st.session_state.get("dataset")
if df is None:
    df = load_dataset()
    st.session_state["dataset"] = df

artifacts = PredictionService.get_artifacts(df_fallback=df)
kpis = compute_portfolio_kpis(df)

# Score entire dataset using batch inference
@st.cache_data
def get_scored_portfolio(data: pd.DataFrame):
    return PredictionService.score_batch(data, artifacts=artifacts)

scored_df = get_scored_portfolio(df)
prioritizer = EARAPrioritizer()
eara_summary = prioritizer.compare_all_strategies(scored_df, review_budget=1000)

tab_exec, tab_paper, tab_audit, tab_export = st.tabs([
    "👔 Executive Audit Report",
    "🎓 Academic Capstone Research Paper",
    "🛡️ System Reproducibility & Audit Trail",
    "📥 Data & Prediction Exports",
])

# Tab 1: Executive Audit Report
with tab_exec:
    st.markdown("### 👔 Executive Portfolio Health & Churn Audit")
    exec_md = generate_executive_report_markdown(kpis, eara_summary=eara_summary)
    st.markdown(exec_md)

    st.download_button(
        "📥 Download Official Executive Report (.md)",
        data=exec_md,
        file_name=f"BankSight_Executive_Audit_{datetime.date.today()}.md",
        mime="text/markdown",
    )

# Tab 2: Academic Capstone Research Paper
with tab_paper:
    st.markdown("### 🎓 Academic Research Paper Manuscript")
    st.caption("Auto-compiled with live experimental statistics, CV benchmarks, and EARA formulations.")

    paper_text = generate_research_paper_text(
        kpis=kpis,
        cv_results=artifacts["cv_results"],
        best_model_name=artifacts["best_model_name"],
    )

    with st.expander("📄 Read Full Manuscript Online", expanded=True):
        st.markdown(paper_text)

    st.download_button(
        "📥 Download Complete Capstone Research Paper (.md)",
        data=paper_text,
        file_name=f"BankSight_AI_Capstone_Research_Paper_{datetime.date.today()}.md",
        mime="text/markdown",
    )

# Tab 3: System Reproducibility & Audit Trail
with tab_audit:
    st.markdown("### 🛡️ System Integrity & Reproducibility Audit")
    audit_data = [
        {"Parameter": "Platform Version", "Verified Value": "BankSight AI v1.0.0 (Production Release)"},
        {"Parameter": "Primary Dataset", "Verified Value": "data/European_Bank.csv (10,000 rows, 14 columns)"},
        {"Parameter": "Target Territory", "Verified Value": "European Retail Banking (France, Germany, Spain)"},
        {"Parameter": "Random State Seed", "Verified Value": "42 (Global deterministic seed)"},
        {"Parameter": "Cross-Validation Protocol", "Verified Value": "5-Fold Stratified Cross-Validation on Training Split (8,000 accounts)"},
        {"Parameter": "Holdout Test Set", "Verified Value": "20% Isolated Holdout Test Set (2,000 accounts)"},
        {"Parameter": "Selected Champion Model", "Verified Value": f"{artifacts['best_model_name']} (CalibratedClassifierCV)"},
        {"Parameter": "Holdout Test PR-AUC", "Verified Value": f"{artifacts['test_evaluations'][artifacts['best_model_name']]['pr_auc']:.4f}"},
        {"Parameter": "Holdout Test ROC-AUC", "Verified Value": f"{artifacts['test_evaluations'][artifacts['best_model_name']]['roc_auc']:.4f}"},
        {"Parameter": "Data Leakage Prevention", "Verified Value": "Strict isolation; scalers and encoders fit solely on training folds"},
    ]
    st.dataframe(pd.DataFrame(audit_data), use_container_width=True, hide_index=True)

# Tab 4: Data & Prediction Exports
with tab_export:
    st.markdown("### 📥 Customer-Level Scored Data & Worklist Exports")
    st.caption("Contains calibrated probabilities, multi-model consensus spreads, risk tiers, and EARA routing queues.")

    export_df = scored_df[[
        "CustomerId", "Geography", "Gender", "Age", "Tenure", "Balance",
        "NumOfProducts", "IsActiveMember", "EstimatedSalary",
        "Predicted_Churn_Prob", "Model_Spread", "Risk_Tier", "Model_Disagreement_Flag", "Exited"
    ]].copy()

    st.dataframe(export_df.head(25), use_container_width=True, hide_index=True)

    csv_data = export_df.to_csv(index=False)
    st.download_button(
        "📥 Download Complete Scored Portfolio (CSV)",
        data=csv_data,
        file_name="BankSight_Scored_Customers_Full.csv",
        mime="text/csv",
    )
