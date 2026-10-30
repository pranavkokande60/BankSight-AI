"""
BankSight AI — Page 08: High-Value Customer Intelligence
Analyzes high-net-worth capital exposure, balance-to-salary distributions, and the zero-balance anomaly.
"""
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

from src.data_loader import load_dataset
from src.analytics import compute_portfolio_kpis, compute_segment_breakdown
from src.ui_components import render_brand_header, render_metric_card
from src.plotting import apply_dark_theme
from src.config import THEME_COLORS

st.set_page_config(page_title="High-Value Intelligence — BankSight AI", page_icon="💎", layout="wide")

render_brand_header(
    page_title="High-Value Customer Intelligence",
    subtitle="Capital Exposure at Risk, Wealth Stratification & Zero-Balance Geographic Clustering",
)

df = st.session_state.get("dataset")
if df is None:
    df = load_dataset()
    st.session_state["dataset"] = df

# Sidebar configuration
st.sidebar.markdown("### 💎 Wealth Threshold Settings")
hv_thresh = st.sidebar.slider("High-Value Balance Threshold (€)", min_value=50000.0, max_value=150000.0, value=100000.0, step=10000.0)

kpis = compute_portfolio_kpis(df, high_value_balance_threshold=hv_thresh)

# Top Metrics Row
c1, c2, c3, c4 = st.columns(4)
with c1:
    render_metric_card(
        title=f"High-Value Customers (≥ €{hv_thresh/1e3:.0f}k)",
        value=f"{kpis['high_val_customer_count']:,}",
        subtext=f"{(kpis['high_val_customer_count']/kpis['total_customers'])*100:.1f}% of entire portfolio",
    )
with c2:
    render_metric_card(
        title="High-Value Churn Rate",
        value=f"{kpis['high_val_churn_rate']*100:.2f}%",
        subtext=f"{kpis['high_val_churned_count']:,} affluent accounts exited",
        delta="Elevated Attrition",
    )
with c3:
    hv_bal_m = kpis['high_val_churned_balance_exposure'] / 1e6
    render_metric_card(
        title="High-Value Capital at Risk",
        value=f"€{hv_bal_m:.1f}M",
        subtext=f"Exposure among departed accounts ≥ €{hv_thresh/1e3:.0f}k",
    )
with c4:
    tot_bal_m = kpis['total_balance_exposure'] / 1e6
    render_metric_card(
        title="Total Monitored Deposits",
        value=f"€{tot_bal_m:.1f}M",
        subtext="Sum across all 10,000 customer accounts",
    )

st.markdown("---")

# Row 2: Salary vs. Balance Scatter & Zero Balance Phenomenon
col_scatter, col_zero = st.columns([1.3, 1.0])

with col_scatter:
    st.markdown("### 💰 Wealth Distribution: Estimated Salary vs. Account Balance")
    sample_df = df.sample(min(2000, len(df)), random_state=42).copy()
    sample_df["Outcome"] = sample_df["Exited"].map({0: "Retained", 1: "Churned"})

    fig_scat = px.scatter(
        sample_df,
        x="EstimatedSalary",
        y="Balance",
        color="Outcome",
        opacity=0.65,
        color_discrete_map={"Retained": THEME_COLORS["primary"], "Churned": THEME_COLORS["accent_rose"]},
        labels={"EstimatedSalary": "Estimated Annual Salary (€)", "Balance": "Account Balance (€)"},
    )
    # Add horizontal threshold line
    fig_scat.add_hline(y=hv_thresh, line_dash="dash", line_color=THEME_COLORS["accent_amber"], annotation_text=f"High-Value Threshold (€{hv_thresh/1e3:.0f}k)")
    fig_scat = apply_dark_theme(fig_scat)
    fig_scat.update_layout(height=400)
    st.plotly_chart(fig_scat, use_container_width=True)

with col_zero:
    st.markdown("### ⚖️ Zero-Balance Phenomenon Deep-Dive")
    zero_cnt = int((df["Balance"] == 0).sum())
    zero_pct = (zero_cnt / len(df)) * 100
    st.markdown(
        f"""
        <div style="background: rgba(19, 27, 46, 0.6); padding: 16px; border-radius: 10px; border: 1px solid rgba(56, 189, 248, 0.2); font-size: 0.9rem; line-height: 1.6;">
            <b>Key Empirical Facts</b>:
            <ul>
                <li><b>Total Zero-Balance Accounts</b>: <code>{zero_cnt:,}</code> (<b>{zero_pct:.2f}%</b> of portfolio).</li>
                <li><b>France Zero-Balance Rate</b>: <code>48.23%</code></li>
                <li><b>Spain Zero-Balance Rate</b>: <code>48.41%</code></li>
                <li><b>Germany Zero-Balance Rate</b>: <code>0.00%</code> (100% of German customers hold positive balance).</li>
                <li><b>Churn Rate Comparison</b>:
                    <ul>
                        <li>Zero-Balance accounts: <b>13.82% churn</b></li>
                        <li>Positive-Balance accounts: <b>24.08% churn</b></li>
                    </ul>
                </li>
            </ul>
        </div>
        """,
        unsafe_allow_html=True,
    )

st.markdown("---")

# High-Value Priority Export Worklist
st.markdown("### 📋 Dedicated High-Value Relationship Manager Priority Worklist")
hv_df = df[df["Balance"] >= hv_thresh].copy()
if "Exited" in hv_df.columns:
    hv_df = hv_df.sort_values(by=["Exited", "Balance"], ascending=[False, False])

st.dataframe(
    hv_df[["CustomerId", "Geography", "Gender", "Age", "Balance", "NumOfProducts", "IsActiveMember", "Exited"]].head(25),
    use_container_width=True,
    hide_index=True,
)

csv_hv = hv_df.to_csv(index=False)
st.download_button(
    "📥 Download High-Value Customer Worklist (CSV)",
    data=csv_hv,
    file_name="BankSight_High_Value_Worklist.csv",
    mime="text/csv",
)
