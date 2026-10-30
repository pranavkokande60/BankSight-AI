"""
BankSight AI — Page 07: Customer Risk Passport
Individual customer risk profiling, multi-model consensus, spread diagnostics, and analyst follow-up.
"""
import streamlit as st
import pandas as pd
import numpy as np

from src.data_loader import load_dataset
from src.prediction_service import PredictionService
from src.risk_scoring import suggest_analyst_action
from src.explainability import ExplainabilityEngine
from src.ui_components import render_brand_header, render_metric_card
from src.plotting import plot_risk_gauge, plot_feature_attributions
from src.config import THEME_COLORS

st.set_page_config(page_title="Customer Risk Passport — BankSight AI", page_icon="🛡️", layout="wide")

render_brand_header(
    page_title="Customer Risk Passport",
    subtitle="Individual Profile Scoring, Multi-Model Agreement Diagnostics & Prescriptive Follow-Up Rules",
)

df = st.session_state.get("dataset")
if df is None:
    df = load_dataset()
    st.session_state["dataset"] = df

artifacts = PredictionService.get_artifacts(df_fallback=df)

mode = st.radio("Customer Input Method", ["🔍 Search Existing Customer by ID", "✍️ Create Hypothetical Customer Profile"], horizontal=True)

if mode == "🔍 Search Existing Customer by ID":
    col_s1, col_s2 = st.columns([1.5, 1.5])
    with col_s1:
        # Prepopulate sample customer IDs
        sample_ids = df["CustomerId"].head(10).tolist()
        cust_id_input = st.selectbox("Select or Enter Customer ID", options=sample_ids, index=0)

    matching_rows = df[df["CustomerId"] == cust_id_input]
    if matching_rows.empty:
        st.error(f"Customer ID {cust_id_input} not found.")
        st.stop()

    cust_profile = matching_rows.iloc[0].to_dict()
else:
    st.markdown("#### ✍️ Enter Customer Attributes")
    c_in1, c_in2, c_in3, c_in4 = st.columns(4)
    with c_in1:
        c_country = st.selectbox("Geography", ["France", "Germany", "Spain"], index=1)
        c_gender = st.selectbox("Gender", ["Female", "Male"], index=0)
    with c_in2:
        c_age = st.slider("Age", 18, 92, 48)
        c_tenure = st.slider("Tenure (Years)", 0, 10, 3)
    with c_in3:
        c_balance = st.number_input("Balance (€)", min_value=0.0, max_value=300000.0, value=115000.0, step=5000.0)
        c_salary = st.number_input("Estimated Salary (€)", min_value=0.0, max_value=300000.0, value=95000.0, step=5000.0)
    with c_in4:
        c_prods = st.slider("Products Held", 1, 4, 3)
        c_credit = st.slider("Credit Score", 350, 850, 620)
        c_active = st.checkbox("Is Active Member", value=False)
        c_card = st.checkbox("Has Credit Card", value=True)

    cust_profile = {
        "CustomerId": 99999999,
        "Surname": "Hypothetical",
        "Geography": c_country,
        "Gender": c_gender,
        "Age": c_age,
        "Tenure": c_tenure,
        "Balance": c_balance,
        "EstimatedSalary": c_salary,
        "NumOfProducts": c_prods,
        "CreditScore": c_credit,
        "IsActiveMember": int(c_active),
        "HasCrCard": int(c_card),
    }

# Run prediction service
consensus = PredictionService.predict_single(cust_profile, artifacts=artifacts)
risk_tier = consensus["risk_tier"]
p_mean = consensus["mean_probability"]
p_best = consensus["best_model_prob"]
spread = consensus["spread"]
has_disagree = consensus["has_strong_disagreement"]

# Action recommendation
action = suggest_analyst_action(risk_tier, has_disagree, cust_profile)

# Display Key Passport Findings
st.markdown("---")
c_p1, c_p2, c_p3, c_p4 = st.columns(4)

with c_p1:
    render_metric_card(
        title="Consensus Churn Risk",
        value=f"{p_best*100:.1f}%",
        subtext=f"Ensemble Mean: {p_mean*100:.1f}%",
    )
with c_p2:
    tier_class = "tier-crit" if risk_tier == "Critical Risk" else ("tier-high" if risk_tier == "High Risk" else ("tier-mod" if risk_tier == "Moderate Risk" else "tier-low"))
    st.markdown(
        f"""
        <div class="glass-card">
            <div class="glass-metric-title">Risk Assessment Tier</div>
            <div class="glass-metric-value"><span class="{tier_class}">{risk_tier}</span></div>
            <div class="glass-metric-sub">Calibrated Decision Band</div>
        </div>
        """,
        unsafe_allow_html=True,
    )
with c_p3:
    spread_eval = "Strong Disagreement" if has_disagree else "Models In Agreement"
    render_metric_card(
        title="Model Disagreement Spread",
        value=f"{spread*100:.1f}%",
        subtext=spread_eval,
        delta="Audit Alert" if has_disagree else "Stable Consensus",
    )
with c_p4:
    render_metric_card(
        title="Account Balance Exposure",
        value=f"€{cust_profile.get('Balance', 0):,.0f}",
        subtext=f"Territory: {cust_profile.get('Geography', 'N/A')}",
    )

# Visual Gauge & Multi-Model Breakdown
col_gauge, col_models = st.columns([1.1, 1.1])

with col_gauge:
    fig_gauge = plot_risk_gauge(p_best, f"Calibrated Risk ({artifacts['best_model_name']})")
    st.plotly_chart(fig_gauge, use_container_width=True)

with col_models:
    st.markdown("#### 🤖 Individual Algorithm Estimates")
    preds = consensus["individual_probabilities"]
    model_df = pd.DataFrame([
        {"Algorithm": k, "Predicted Churn Probability": f"{v*100:.1f}%", "Status": "Selected Best" if k == artifacts["best_model_name"] else "Candidate"}
        for k, v in preds.items()
    ])
    st.dataframe(model_df, use_container_width=True, hide_index=True)

    if has_disagree:
        st.warning("⚠️ High model disagreement detected (Spread > 25%). Statistical models diverge; review customer behavioral context manually.")

# Prescriptive Action Recommendation
st.markdown("---")
st.markdown("### 📋 Prescriptive Follow-Up & Action Guidance")
st.markdown(
    f"""
    <div style="background: rgba(19, 27, 46, 0.7); padding: 18px; border-radius: 12px; border: 1px solid rgba(56, 189, 248, 0.25);">
        <h4 style="color: #00d4ff; margin-top: 0;">Recommended Strategy: {action['recommended_action']}</h4>
        <p style="color: #f1f5f9; font-size: 0.92rem; margin-bottom: 8px;">
            <b>Operational Rationale</b>: {action['rationale']}
        </p>
        <span class="banksight-badge">Priority: {action['urgency']}</span>
    </div>
    """,
    unsafe_allow_html=True,
)

st.caption("Notice: BankSight AI decision guidance provides transparent analyst prioritization and does not make automated credit or adverse decisions.")
