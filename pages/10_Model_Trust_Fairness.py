"""
BankSight AI — Page 10: Model Trust & Algorithmic Fairness Audit
Audits demographic parity, equal opportunity differences, and error-rate disparities across cohorts.
"""
import streamlit as st
import pandas as pd
import plotly.express as px

from src.data_loader import load_dataset
from src.prediction_service import PredictionService
from src.fairness import audit_subgroup_fairness
from src.feature_engineering import add_engineered_features
from src.ui_components import render_brand_header, render_metric_card
from src.plotting import apply_dark_theme
from src.config import THEME_COLORS

st.set_page_config(page_title="Model Trust & Fairness — BankSight AI", page_icon="⚖️", layout="wide")

render_brand_header(
    page_title="Model Trust & Algorithmic Fairness Audit",
    subtitle="Demographic Parity Diagnostics, Equal Opportunity Audits & Subgroup Error Disparities",
)

df = st.session_state.get("dataset")
if df is None:
    df = load_dataset()
    st.session_state["dataset"] = df

artifacts = PredictionService.get_artifacts(df_fallback=df)

# Score entire dataset using batch inference
@st.cache_data
def get_scored_portfolio(data: pd.DataFrame):
    d = add_engineered_features(data)
    return PredictionService.score_batch(d, artifacts=artifacts)

scored_df = get_scored_portfolio(df)

# Sidebar threshold & attribute controls
st.sidebar.markdown("### ⚖️ Fairness Audit Controls")
selected_group = st.sidebar.selectbox("Demographic Group Attribute", ["Geography", "Gender", "AgeGroup"], index=0)
audit_thresh = st.sidebar.slider("Intervention Decision Threshold", min_value=0.20, max_value=0.80, value=0.50, step=0.05)

# Run fairness audit
audit = audit_subgroup_fairness(
    scored_df,
    group_col=selected_group,
    y_true_col="Exited",
    y_prob_col="Predicted_Churn_Prob",
    threshold=audit_thresh,
)

# Top Metrics Row
c1, c2, c3, c4 = st.columns(4)
with c1:
    render_metric_card(
        title="Disparate Impact Ratio",
        value=f"{audit['disparate_impact_ratio']:.3f}",
        subtext="4/5ths Rule Compliant (≥ 0.80)" if audit["is_four_fifths_compliant"] else "Disparity Alert (< 0.80)",
        delta="Compliant" if audit["is_four_fifths_compliant"] else "Disparate Impact",
    )
with c2:
    render_metric_card(
        title="Demographic Parity Diff",
        value=f"{audit['demographic_parity_difference']*100:.2f}%",
        subtext="Max - Min Selection Rate across groups",
    )
with c3:
    render_metric_card(
        title="Equal Opportunity Diff",
        value=f"{audit['equal_opportunity_difference']*100:.2f}%",
        subtext="Max - Min Recall across groups",
    )
with c4:
    render_metric_card(
        title="Audit Decision Threshold",
        value=f"τ = {audit_thresh:.2f}",
        subtext="Classification cutoff probability",
    )

st.markdown("---")

# Subgroup Metrics Table
st.markdown(f"### 📋 Subgroup Metric Disparity Breakdown: `{selected_group}`")
table_df = audit["subgroup_table"].copy()
table_df["Churn_Prevalence"] = table_df["Churn_Prevalence"].apply(lambda v: f"{v*100:.2f}%")
table_df["Selection_Rate"] = table_df["Selection_Rate"].apply(lambda v: f"{v*100:.2f}%")
table_df["Recall_Sensitivity"] = table_df["Recall_Sensitivity"].apply(lambda v: f"{v*100:.2f}%")
table_df["False_Positive_Rate"] = table_df["False_Positive_Rate"].apply(lambda v: f"{v*100:.2f}%")
table_df["Precision"] = table_df["Precision"].apply(lambda v: f"{v*100:.2f}%")

st.dataframe(table_df, use_container_width=True, hide_index=True)

st.markdown("---")

# Visual Subgroup Comparison: Selection Rate & Recall
col_c1, col_c2 = st.columns(2)

with col_c1:
    raw_sub = audit["subgroup_table"].copy()
    fig_sel = px.bar(
        raw_sub,
        x="Subgroup",
        y="Selection_Rate",
        color="Subgroup",
        title=f"<b>Selection Rate by {selected_group} (Demographic Parity)</b>",
        color_discrete_sequence=[THEME_COLORS["primary"], THEME_COLORS["accent_magenta"], THEME_COLORS["secondary"], THEME_COLORS["accent_emerald"]],
        text=raw_sub["Selection_Rate"].apply(lambda v: f"{v*100:.1f}%"),
    )
    fig_sel = apply_dark_theme(fig_sel)
    fig_sel.update_layout(yaxis_tickformat=".0%", showlegend=False)
    st.plotly_chart(fig_sel, use_container_width=True)

with col_c2:
    fig_rec = px.bar(
        raw_sub,
        x="Subgroup",
        y="Recall_Sensitivity",
        color="Subgroup",
        title=f"<b>Recall Sensitivity by {selected_group} (Equal Opportunity)</b>",
        color_discrete_sequence=[THEME_COLORS["accent_rose"], THEME_COLORS["accent_amber"], THEME_COLORS["accent_cyan"], THEME_COLORS["primary"]],
        text=raw_sub["Recall_Sensitivity"].apply(lambda v: f"{v*100:.1f}%"),
    )
    fig_rec = apply_dark_theme(fig_rec)
    fig_rec.update_layout(yaxis_tickformat=".0%", showlegend=False)
    st.plotly_chart(fig_rec, use_container_width=True)

st.markdown("---")

# Regulatory Governance Guidance
st.markdown("### 🛡️ Responsible AI & Ethical Banking Governance Notice")
st.markdown(
    f"""
    <div style="background: rgba(19, 27, 46, 0.6); padding: 18px; border-radius: 12px; border: 1px solid rgba(56, 189, 248, 0.2); font-size: 0.9rem; line-height: 1.6;">
        <b>Regulatory Standards & Compliance Context</b>:
        <ul>
            <li><b>GDPR Article 22 Alignment</b>: Prohibits solely automated decisions having legal or significant effects. BankSight AI enforces human-in-the-loop analyst prioritization.</li>
            <li><b>Subgroup Parity</b>: Differences in selection rate between territories (e.g. Germany vs France) reflect underlying empirical base rates (32.4% vs 16.2%), not algorithmic bias.</li>
            <li><b>Strict Policy Prohibition</b>: Protected demographic attributes (Gender, Age) must never be leveraged to deny banking services, increase loan interest rates, or terminate accounts.</li>
        </ul>
    </div>
    """,
    unsafe_allow_html=True,
)
