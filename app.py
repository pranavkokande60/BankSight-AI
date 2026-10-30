"""
BankSight AI — An Explainable Customer Segmentation, Churn Prediction
and Evidence-Aware Retention Intelligence Platform for European Retail Banking

Main Application Entry Point
"""
import streamlit as st
import pandas as pd
from pathlib import Path

from src.config import DEFAULT_DATA_PATH, THEME_COLORS
from src.data_loader import load_dataset
from src.data_validation import DataQualityAuditor
from src.ui_components import render_brand_header, render_metric_card, inject_custom_css
from src.prediction_service import PredictionService

# Configure Streamlit page settings
st.set_page_config(
    page_title="BankSight AI — European Banking Intelligence",
    page_icon="🏦",
    layout="wide",
    initial_sidebar_state="expanded",
)

inject_custom_css()

# Session State Initialization
if "dataset" not in st.session_state:
    try:
        st.session_state["dataset"] = load_dataset()
        st.session_state["dataset_source"] = "Default Repository Data (data/European_Bank.csv)"
    except Exception as e:
        st.session_state["dataset"] = None
        st.session_state["dataset_source"] = f"Failed to load: {e}"

# Sidebar Repository & Upload Section
st.sidebar.markdown("### 🏦 **BankSight AI Core**")
st.sidebar.caption("Final-Year Engineering Project")
st.sidebar.markdown(f"**Data Status**: `Loaded ({len(st.session_state['dataset']):,} rows)`" if st.session_state["dataset"] is not None else "**Data Status**: `Not Loaded`")

uploaded_file = st.sidebar.file_uploader(
    "Upload Custom Banking CSV", type=["csv"], help="Upload an alternative European banking dataset"
)
if uploaded_file is not None:
    try:
        st.session_state["dataset"] = pd.read_csv(uploaded_file)
        st.session_state["dataset_source"] = f"Uploaded File ({uploaded_file.name})"
        st.sidebar.success(f"Loaded {len(st.session_state['dataset']):,} rows!")
    except Exception as ex:
        st.sidebar.error(f"Error parsing CSV: {ex}")

# Header Banner
render_brand_header(
    page_title="Intelligence Terminal",
    subtitle="Explainable Customer Segmentation, Calibrated Churn Prediction & Evidence-Aware Retention Prioritization",
)

# Hero Section
col_hero_1, col_hero_2 = st.columns([1.8, 1.2])

with col_hero_1:
    st.markdown(
        """
        <div class="glass-card" style="padding: 24px; border-left: 4px solid #00d4ff;">
            <h2 style="margin-top: 0; color: #ffffff; font-size: 1.5rem;">
                Evidence-Aware Banking Analytics for European Markets
            </h2>
            <p style="color: #94a3b8; font-size: 0.95rem; line-height: 1.6;">
                <b>BankSight AI</b> is an enterprise-grade analytical intelligence platform engineered
                to discover behavioral customer segments, diagnose cross-border churn dynamics,
                predict customer departure probabilities with multi-model consensus, and prioritize
                retention interventions under finite review budgets.
            </p>
            <div style="display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap;">
                <span class="banksight-badge">10,000 Verified Accounts</span>
                <span class="banksight-badge">France · Germany · Spain</span>
                <span class="banksight-badge">SHAP Explainability</span>
                <span class="banksight-badge">EARA Framework</span>
                <span class="banksight-badge">3D Galaxy Projection</span>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

with col_hero_2:
    if st.session_state["dataset"] is not None:
        df = st.session_state["dataset"]
        n_cust = len(df)
        churn_rate = (df["Exited"].mean() * 100) if "Exited" in df.columns else 0.0
        tot_balance = (df["Balance"].sum() / 1e6) if "Balance" in df.columns else 0.0

        st.markdown(
            f"""
            <div class="glass-card">
                <div style="color: #38bdf8; font-weight: 700; font-size: 0.85rem; text-transform: uppercase;">Platform Data Anchor</div>
                <div style="font-size: 1.8rem; font-weight: 800; color: #ffffff; margin-top: 4px;">{n_cust:,} Customers</div>
                <div style="color: #94a3b8; font-size: 0.85rem; margin-top: 8px;">
                    • <b>Territory Baseline Churn</b>: <span style="color: #f43f5e; font-weight: 600;">{churn_rate:.2f}%</span><br>
                    • <b>Total Balance Monitored</b>: <span style="color: #34d399; font-weight: 600;">€{tot_balance:.1f}M</span><br>
                    • <b>Data Source</b>: <span style="color: #e2e8f0;">{st.session_state['dataset_source']}</span>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

st.markdown("### 🧭 Platform Navigation & Modules")

# Navigation Grid
c1, c2, c3, c4 = st.columns(4)

with c1:
    st.markdown(
        """
        <div class="glass-card">
            <h4 style="color: #00d4ff; margin-top: 0;">📊 Executive & EDA</h4>
            <p style="color: #94a3b8; font-size: 0.84rem;">
                <b>Page 01 & 04</b>: Macro portfolio KPIs, country-level attrition, product saturation cliffs, and demographic exposure.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.markdown(
        """
        <div class="glass-card">
            <h4 style="color: #818cf8; margin-top: 0;">🔍 Data Quality</h4>
            <p style="color: #94a3b8; font-size: 0.84rem;">
                <b>Page 02</b>: Automated 10-point data validation, missing value verification, and temporal anomaly audits.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

with c2:
    st.markdown(
        """
        <div class="glass-card">
            <h4 style="color: #38bdf8; margin-top: 0;">🌌 3D Galaxy</h4>
            <p style="color: #94a3b8; font-size: 0.84rem;">
                <b>Page 03</b>: Unsupervised clustering (K-Means, GMM), 3D PCA interactive projection, and persona profiles.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.markdown(
        """
        <div class="glass-card">
            <h4 style="color: #c084fc; margin-top: 0;">🤖 Model Lab</h4>
            <p style="color: #94a3b8; font-size: 0.84rem;">
                <b>Page 05</b>: Cross-validation benchmarks, ROC/PR curves, probability calibration, and demographic ablation.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

with c3:
    st.markdown(
        """
        <div class="glass-card">
            <h4 style="color: #34d399; margin-top: 0;">💡 Explainable AI</h4>
            <p style="color: #94a3b8; font-size: 0.84rem;">
                <b>Page 06</b>: SHAP global beeswarm, feature importances, and local customer waterfall attribution plots.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.markdown(
        """
        <div class="glass-card">
            <h4 style="color: #f59e0b; margin-top: 0;">🛡️ Risk Passport</h4>
            <p style="color: #94a3b8; font-size: 0.84rem;">
                <b>Page 07</b>: Individual customer lookup, multi-model consensus, spread evaluation, and analyst follow-up rules.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

with c4:
    st.markdown(
        """
        <div class="glass-card">
            <h4 style="color: #f43f5e; margin-top: 0;">⚖️ EARA Allocation</h4>
            <p style="color: #94a3b8; font-size: 0.84rem;">
                <b>Page 09</b>: Evidence-Aware Retention Allocation: Risk-only vs Risk+Value vs Disagreement-penalized review budgets.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.markdown(
        """
        <div class="glass-card">
            <h4 style="color: #38bdf8; margin-top: 0;">📑 Reports & Audit</h4>
            <p style="color: #94a3b8; font-size: 0.84rem;">
                <b>Page 10, 11, 12</b>: Fairness auditing, What-if scenario simulator, and downloadable academic capstone reports.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.markdown(
        """
        <div class="glass-card">
            <h4 style="color: #00d4ff; margin-top: 0;">👥 Customer Management</h4>
            <p style="color: #94a3b8; font-size: 0.84rem;">
                <b>Page 13</b>: Add new customers, strict SQLite persistence, instant ML churn risk assessment, and lifecycle management.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

st.divider()

# Demo Workflow & Presentation Guide
with st.expander("📖 Recommended Academic Evaluation & Demonstration Workflow", expanded=True):
    st.markdown(
        """
        **Follow this sequential walkthrough to evaluate the project's research and engineering capabilities:**
        1. **Page 01 (Executive Dashboard)**: Inspect macro KPIs, verified portfolio balance, and the prominent German churn hazard.
        2. **Page 02 (Data Quality Centre)**: Review the automated 10-point verification and the detection of the constant `Year=2025` snapshot.
        3. **Page 03 (Customer Segmentation Galaxy)**: Explore the interactive 3D PCA scatter plot, rotating clusters and reviewing empirical persona centroids.
        4. **Page 04 (Churn Intelligence)**: Examine bivariate cross-tabulations and the dramatic 82%+ churn rate on 3+ banking products.
        5. **Page 05 (ML Model Laboratory)**: Compare Logistic Regression, Random Forest, and Gradient Boosting across 5-fold CV and isolated test holdout.
        6. **Page 06 (Explainable AI)**: Trace global feature importances and inspect individual customer SHAP waterfalls.
        7. **Page 07 (Customer Risk Passport)**: Query customer IDs (e.g. `15634602` or `15647311`) to observe multi-model agreement/disagreement spreads.
        8. **Page 08 (High-Value Intelligence)**: Analyze capital at risk and the zero-balance account clustering in France and Spain.
        9. **Page 09 (EARA Allocation Lab)**: Compare the signature EARA prioritization strategy against Risk-Only ranking under configurable analyst budgets.
        10. **Page 10 (Model Trust & Fairness)**: Audit subgroup demographic parity and equal opportunity differences across Gender and Geography.
        11. **Page 11 (Scenario Simulator)**: Simulate retention campaign economics under conservative, baseline, and optimistic assumptions.
        12. **Page 12 (Reports & Audit)**: Export the complete academic research capstone paper and CSV analytical audit trails.
        13. **Page 13 (Customer Management)**: Register new customer profiles into persistent SQLite storage, run real-time ML risk scoring, audit SHAP attributions, and manage customer lifecycle statuses.
        """
    )

st.caption("BankSight AI — Built with Streamlit, Scikit-Learn, SHAP, and Plotly · Offline Capstone Implementation")
