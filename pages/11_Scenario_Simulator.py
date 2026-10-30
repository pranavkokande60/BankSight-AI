"""
BankSight AI — Page 11: Retention Scenario Simulator
Simulates what-if retention campaign economics, intervention costs, and hypothetical ROI outcomes.
"""
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

from src.data_loader import load_dataset
from src.prediction_service import PredictionService
from src.simulation import run_retention_scenario
from src.ui_components import render_brand_header, render_metric_card
from src.plotting import apply_dark_theme
from src.config import THEME_COLORS

st.set_page_config(page_title="Scenario Simulator — BankSight AI", page_icon="🔮", layout="wide")

render_brand_header(
    page_title="Retention Scenario Simulator",
    subtitle="Interactive What-If Economics, Campaign Cost Modeling & Sensitivity Scenarios",
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

# Sidebar Simulator Controls
st.sidebar.markdown("### 🎛️ Campaign Assumption Sliders")
budget_sim = st.sidebar.slider("Intervention Review Budget", min_value=200, max_value=3000, value=1000, step=100)
risk_cutoff = st.sidebar.slider("Risk Cutoff Threshold (τ)", min_value=0.20, max_value=0.75, value=0.40, step=0.05)
cost_per_cust = st.sidebar.number_input("Campaign Cost Per Contact (€)", min_value=10.0, max_value=250.0, value=45.0, step=5.0)
success_rate = st.sidebar.slider("Assumed Retention Success Rate (%)", min_value=5.0, max_value=50.0, value=20.0, step=2.5) / 100.0
margin_rate = st.sidebar.slider("Annual Net Margin on Retained Balance (%)", min_value=0.5, max_value=5.0, value=2.0, step=0.25) / 100.0

# Run scenario modeling
sim_res = run_retention_scenario(
    scored_df,
    review_budget=budget_sim,
    risk_threshold=risk_cutoff,
    cost_per_contact=cost_per_cust,
    assumed_success_rate=success_rate,
    annual_margin_on_balance=margin_rate,
)

scenarios_df = sim_res["scenarios"]

# Top Metrics Row for Baseline Scenario
c1, c2, c3, c4 = st.columns(4)

with c1:
    render_metric_card(
        title="Eligible Targets Identified",
        value=f"{sim_res['total_eligible_above_threshold']:,} Accts",
        subtext=f"Customers with predicted risk ≥ {risk_cutoff*100:.0f}%",
    )
with c2:
    render_metric_card(
        title="Outreach Cap (Budgeted)",
        value=f"{sim_res['targeted_count']:,} Accts",
        subtext=f"Limited by operational budget ({budget_sim:,})",
    )
with c3:
    bal_m = sim_res['total_targeted_balance'] / 1e6
    render_metric_card(
        title="Targeted Deposit Base",
        value=f"€{bal_m:.1f}M",
        subtext=f"Mean: €{sim_res['mean_targeted_balance']:,.0f} per target",
    )
with c4:
    base_cost = sim_res['targeted_count'] * cost_per_cust
    render_metric_card(
        title="Baseline Campaign Cost",
        value=f"€{base_cost:,.0f}",
        subtext=f"@ €{cost_per_cust:.0f} per customer contact",
    )

st.markdown("---")

# Scenario Comparison Table: Conservative vs Baseline vs Optimistic
st.markdown("### 📈 Multi-Scenario Financial Outlook (Conservative · Baseline · Optimistic)")

display_sim = scenarios_df.copy()
display_sim["Total_Campaign_Cost"] = display_sim["Total_Campaign_Cost"].apply(lambda v: f"€{v:,.0f}")
display_sim["Retained_Balance_Proxy"] = display_sim["Retained_Balance_Proxy"].apply(lambda v: f"€{v:,.0f}")
display_sim["Annual_Value_Proxy"] = display_sim["Annual_Value_Proxy"].apply(lambda v: f"€{v:,.0f}")
display_sim["Net_Simulated_Outcome"] = display_sim["Net_Simulated_Outcome"].apply(lambda v: f"€{v:,.0f}")

st.dataframe(
    display_sim[[
        "Scenario", "Targeted_Customers", "Assumed_Success_Rate", "Retained_Customers_Est",
        "Total_Campaign_Cost", "Annual_Value_Proxy", "Net_Simulated_Outcome", "Simulated_ROI", "Notes"
    ]],
    use_container_width=True,
    hide_index=True,
)

st.markdown("---")

# Visual Scenario Comparison Chart
col_roi_bar, col_roi_desc = st.columns([1.3, 0.9])

with col_roi_bar:
    fig_sim_bar = px.bar(
        scenarios_df,
        x="Scenario",
        y="Net_Simulated_Outcome",
        color="Scenario",
        text=scenarios_df["Net_Simulated_Outcome"].apply(lambda v: f"€{v:,.0f}"),
        title="<b>Net Simulated Financial Outcome by Scenario (€)</b>",
        color_discrete_map={
            "Conservative": THEME_COLORS["accent_amber"],
            "Baseline": THEME_COLORS["primary"],
            "Optimistic": THEME_COLORS["accent_emerald"],
        },
    )
    fig_sim_bar = apply_dark_theme(fig_sim_bar)
    fig_sim_bar.update_layout(height=360, showlegend=False)
    st.plotly_chart(fig_sim_bar, use_container_width=True)

with col_roi_desc:
    st.markdown("#### 🔬 Assumptions & Sensitivity Notes")
    st.markdown(
        f"""
        - **Conservative Outlook**: Success rate drops to <code>{float(scenarios_df.loc[0, 'Assumed_Success_Rate'].replace('%','')):.1f}%</code>, contact friction increases costs by 25%.
        - **Baseline Outlook**: User assumptions: <code>{success_rate*100:.1f}%</code> retention success, <code>€{cost_per_cust:.0f}</code> cost per contact.
        - **Optimistic Outlook**: Streamlined digital outreach lifts success to <code>{float(scenarios_df.loc[2, 'Assumed_Success_Rate'].replace('%','')):.1f}%</code>, contact costs reduced by 15%.
        """
    )
    st.warning(sim_res["disclaimer"])
