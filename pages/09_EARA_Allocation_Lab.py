"""
BankSight AI — Page 09: Evidence-Aware Retention Allocation (EARA) Lab
Evaluates multi-criteria retention ranking strategies, review budget queues, and consensus penalties.
"""
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go

from src.data_loader import load_dataset
from src.prediction_service import PredictionService
from src.eara import EARAPrioritizer
from src.ui_components import render_brand_header, render_metric_card
from src.plotting import apply_dark_theme
from src.config import THEME_COLORS

st.set_page_config(page_title="EARA Allocation Lab — BankSight AI", page_icon="⚖️", layout="wide")

render_brand_header(
    page_title="Evidence-Aware Retention Allocation (EARA) Lab",
    subtitle="Signature Decision-Support Framework: Multi-Criteria Prioritization Under Finite Review Budgets",
)

df = st.session_state.get("dataset")
if df is None:
    df = load_dataset()
    st.session_state["dataset"] = df

artifacts = PredictionService.get_artifacts(df_fallback=df)

# Score entire dataset using batch inference
@st.cache_data
def get_scored_portfolio(data: pd.DataFrame):
    return PredictionService.score_batch(data, artifacts=artifacts)

scored_df = get_scored_portfolio(df)

# Sidebar Controls for EARA Experimentation
st.sidebar.markdown("### 🎛️ EARA Review Budget & Weights")
budget_input = st.sidebar.slider("Operational Review Budget (Customers)", min_value=100, max_value=2500, value=800, step=100)
risk_weight = st.sidebar.slider("Risk Weight vs. Exposure (α)", min_value=0.10, max_value=0.90, value=0.60, step=0.05)
disagree_penalty = st.sidebar.slider("Model Disagreement Penalty (λ)", min_value=0.0, max_value=0.70, value=0.35, step=0.05)
active_strategy = st.sidebar.selectbox("Active Allocation Strategy", ["EARA", "Risk + Value Proxy", "Risk-Only"], index=0)

prioritizer = EARAPrioritizer(
    risk_weight=risk_weight,
    disagreement_penalty=disagree_penalty,
    value_proxy_col="Balance",
)

# Run full evaluation
eara_alloc = prioritizer.evaluate_budget_allocation(scored_df, review_budget=budget_input, strategy=active_strategy)
comp_table = prioritizer.compare_all_strategies(scored_df, review_budget=budget_input)

# Top Metrics Row for Active Strategy
c1, c2, c3, c4 = st.columns(4)
with c1:
    render_metric_card(
        title="Allocated Review Budget",
        value=f"{eara_alloc['review_budget']:,} Accts",
        subtext=f"{eara_alloc['budget_share_pct']:.1f}% of entire customer base",
    )
with c2:
    render_metric_card(
        title=f"Churner Capture (Recall@{budget_input})",
        value=f"{eara_alloc['churner_capture_rate']*100:.2f}%",
        subtext=f"Captured {eara_alloc['captured_churners']:,} / {int(scored_df['Exited'].sum()):,} churners",
        delta=f"Precision: {eara_alloc['precision_at_budget']*100:.1f}%",
    )
with c3:
    bal_m = eara_alloc['selected_balance_exposure'] / 1e6
    render_metric_card(
        title="Balance Exposure Covered",
        value=f"€{bal_m:.1f}M",
        subtext=f"{eara_alloc['balance_exposure_coverage']*100:.1f}% of total portfolio balance",
    )
with c4:
    render_metric_card(
        title="Flagged Disagreement Cases",
        value=str(eara_alloc["high_disagreement_selected"]),
        subtext=f"Mean Spread: {eara_alloc['mean_model_spread']:.3f}",
        delta="Divergence Audit",
    )

st.markdown("---")

# Strategy Comparison Table
st.markdown("### 📊 Head-to-Head Prioritization Strategy Benchmark")
st.markdown(
    """
    **Framework Formulation**:
    - **Strategy 1 (Risk-Only)**: Prioritizes customers purely by predicted churn probability $\\hat{P}_i$.
    - **Strategy 2 (Risk + Value Proxy)**: Blends risk and balance exposure: $S_{\\text{value}} = \\alpha \\widetilde{P}_i + (1-\\alpha) \\widetilde{V}_i$.
    - **Strategy 3 (EARA)**: Adjusts for model consensus and evidence completeness: $S_{\\text{EARA}} = S_{\\text{value}} \\times (1 - \\lambda \\Delta_i) \\times E_i$.
    """
)
st.dataframe(comp_table, use_container_width=True, hide_index=True)

st.markdown("---")

# Visual Comparison & Routing Queues
col_chart, col_routing = st.columns([1.2, 0.9])

with col_chart:
    st.markdown("#### 🎯 Churner Capture vs. Capital Exposure Trade-off")
    chart_data = comp_table.copy()
    chart_data["Capture_Num"] = chart_data["Capture Rate (Recall@B)"].apply(lambda s: float(s.replace("%", "")))
    fig_comp = px.bar(
        chart_data,
        x="Strategy",
        y="Capture_Num",
        color="Strategy",
        text=chart_data["Capture Rate (Recall@B)"],
        title="<b>Churner Capture Rate (%) across Strategies</b>",
        labels={"Capture_Num": "Recall@Budget (%)"},
        color_discrete_sequence=[THEME_COLORS["primary"], THEME_COLORS["secondary"], THEME_COLORS["accent_magenta"]],
    )
    fig_comp = apply_dark_theme(fig_comp)
    fig_comp.update_layout(height=340, showlegend=False)
    st.plotly_chart(fig_comp, use_container_width=True)

with col_routing:
    st.markdown("#### 🔀 Automated vs. Expert Review Queue")
    routed_df = prioritizer.compute_priority_scores(scored_df)
    queue_counts = routed_df["Routing_Queue"].value_counts().reset_index()
    queue_counts.columns = ["Queue", "Count"]

    fig_queue = px.pie(
        queue_counts,
        names="Queue",
        values="Count",
        title="<b>Operational Queue Routing</b>",
        color_discrete_sequence=[THEME_COLORS["accent_emerald"], THEME_COLORS["accent_rose"]],
        hole=0.45,
    )
    fig_queue = apply_dark_theme(fig_queue)
    fig_queue.update_layout(height=340)
    st.plotly_chart(fig_queue, use_container_width=True)

# Demographic Selection Rate Fairness Audit under Active Policy
st.markdown("---")
st.markdown("### ⚖️ Subgroup Selection Coverage & Fairness Diagnostics")
st.caption(f"Verifying whether '{active_strategy}' disproportionately concentrates retention offers across demographic cohorts.")

c_f1, c_f2 = st.columns(2)
with c_f1:
    geo_rates = eara_alloc["group_selection_rates"].get("Geography", {})
    geo_rate_df = pd.DataFrame([
        {"Territory": k, "Group Size": v["group_size"], "Selected": v["selected_count"], "Selection Rate": f"{v['selection_rate']*100:.2f}%"}
        for k, v in geo_rates.items()
    ])
    st.dataframe(geo_rate_df, use_container_width=True, hide_index=True)

with c_f2:
    gen_rates = eara_alloc["group_selection_rates"].get("Gender", {})
    gen_rate_df = pd.DataFrame([
        {"Gender": k, "Group Size": v["group_size"], "Selected": v["selected_count"], "Selection Rate": f"{v['selection_rate']*100:.2f}%"}
        for k, v in gen_rates.items()
    ])
    st.dataframe(gen_rate_df, use_container_width=True, hide_index=True)

# Customer Priority Worklist Export
st.markdown("---")
st.markdown(f"### 📥 Export Ranked Retention Worklist ({active_strategy})")
export_cols = ["CustomerId", "Geography", "Gender", "Age", "Balance", "Predicted_Churn_Prob", "Model_Spread", "Score_EARA", "Routing_Queue", "Exited"]
valid_exp_cols = [c for c in export_cols if c in eara_alloc["selected_customers_preview"].columns]
st.dataframe(eara_alloc["selected_customers_preview"][valid_exp_cols].head(30), use_container_width=True, hide_index=True)

csv_eara = eara_alloc["selected_customers_preview"][valid_exp_cols].to_csv(index=False)
st.download_button(
    f"Download Top {budget_input} Ranked Retention Targets (CSV)",
    data=csv_eara,
    file_name=f"BankSight_EARA_Allocation_Top{budget_input}.csv",
    mime="text/csv",
)
