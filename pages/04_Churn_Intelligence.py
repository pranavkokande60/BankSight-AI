"""
BankSight AI — Page 04: Churn Intelligence
Detailed statistical breakdown across geographic, demographic, engagement, and financial vectors.
"""
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

from src.data_loader import load_dataset
from src.analytics import compute_segment_breakdown, compute_cross_tabulation
from src.statistical_analysis import analyze_categorical_association, analyze_numerical_difference
from src.feature_engineering import add_engineered_features
from src.ui_components import render_brand_header, render_metric_card
from src.plotting import apply_dark_theme
from src.config import THEME_COLORS

st.set_page_config(page_title="Churn Intelligence — BankSight AI", page_icon="📈", layout="wide")

render_brand_header(
    page_title="Churn Intelligence & Statistical Inference",
    subtitle="Multivariate Behavioral Diagnostics, Interaction Effects & Statistical Hypothesis Testing",
)

df = st.session_state.get("dataset")
if df is None:
    df = load_dataset()
    st.session_state["dataset"] = df

# Ensure engineered demographic cohorts are present
df = add_engineered_features(df)

tab_geo, tab_demo, tab_engage, tab_stats = st.tabs([
    "🌍 Geographic Exposure",
    "👥 Demographics & Cohorts",
    "⚡ Engagement & Products",
    "🔬 Statistical Hypothesis Tests",
])

# Tab 1: Geographic Exposure
with tab_geo:
    st.markdown("### 🗺️ Cross-Border Territory Dynamics")
    c1, c2 = st.columns([1.1, 0.9])

    with c1:
        geo_summary = compute_segment_breakdown(df, "Geography")
        fig_geo_contrib = px.pie(
            geo_summary,
            names="Geography",
            values="churned_count",
            title="<b>Territory Share of Total Churned Population</b>",
            color_discrete_sequence=[THEME_COLORS["accent_rose"], THEME_COLORS["primary"], THEME_COLORS["secondary"]],
            hole=0.45,
        )
        fig_geo_contrib = apply_dark_theme(fig_geo_contrib)
        st.plotly_chart(fig_geo_contrib, use_container_width=True)

    with c2:
        st.markdown("#### 📊 Territory Breakdown Table")
        t_geo = geo_summary.copy()
        t_geo["segment_churn_rate"] = t_geo["segment_churn_rate"].apply(lambda v: f"{v*100:.2f}%")
        t_geo["churn_contribution"] = t_geo["churn_contribution"].apply(lambda v: f"{v*100:.2f}%")
        t_geo["churned_balance_exposure"] = t_geo["churned_balance_exposure"].apply(lambda v: f"€{v:,.0f}")
        st.dataframe(
            t_geo[["Geography", "customer_count", "churned_count", "segment_churn_rate", "churn_contribution", "churned_balance_exposure"]],
            use_container_width=True,
            hide_index=True,
        )

# Tab 2: Demographics
with tab_demo:
    st.markdown("### 👥 Demographic Vulnerability Vectors")
    c_d1, c_d2 = st.columns(2)

    with c_d1:
        age_break = compute_segment_breakdown(df, "AgeGroup", sort_by="AgeGroup")
        fig_age_line = px.line(
            age_break,
            x="AgeGroup",
            y="segment_churn_rate",
            markers=True,
            title="<b>Observed Churn Rate by Age Bracket</b>",
            labels={"segment_churn_rate": "Churn Rate", "AgeGroup": "Age Bracket"},
            color_discrete_sequence=[THEME_COLORS["accent_rose"]],
        )
        fig_age_line = apply_dark_theme(fig_age_line)
        fig_age_line.update_layout(yaxis_tickformat=".0%")
        st.plotly_chart(fig_age_line, use_container_width=True)

    with c_d2:
        gender_break = compute_segment_breakdown(df, "Gender")
        fig_gen = px.bar(
            gender_break,
            x="Gender",
            y="segment_churn_rate",
            color="Gender",
            title="<b>Gender Subgroup Churn Comparison</b>",
            labels={"segment_churn_rate": "Churn Rate"},
            color_discrete_sequence=[THEME_COLORS["primary"], THEME_COLORS["accent_magenta"]],
            text=gender_break["segment_churn_rate"].apply(lambda v: f"{v*100:.1f}%"),
        )
        fig_gen = apply_dark_theme(fig_gen)
        fig_gen.update_layout(yaxis_tickformat=".0%")
        st.plotly_chart(fig_gen, use_container_width=True)

# Tab 3: Engagement
with tab_engage:
    st.markdown("### ⚡ Engagement & Relationship Depth")
    c_e1, c_e2 = st.columns(2)

    with c_e1:
        act_break = compute_segment_breakdown(df, "IsActiveMember")
        act_break["Engagement"] = act_break["IsActiveMember"].map({"0": "Inactive Member", "1": "Active Member", 0: "Inactive Member", 1: "Active Member"})
        fig_act = px.bar(
            act_break,
            x="Engagement",
            y="segment_churn_rate",
            color="Engagement",
            title="<b>Digital Activity vs. Churn Rate</b>",
            labels={"segment_churn_rate": "Churn Rate"},
            color_discrete_sequence=[THEME_COLORS["accent_rose"], THEME_COLORS["accent_emerald"]],
            text=act_break["segment_churn_rate"].apply(lambda v: f"{v*100:.1f}%"),
        )
        fig_act = apply_dark_theme(fig_act)
        fig_act.update_layout(yaxis_tickformat=".0%")
        st.plotly_chart(fig_act, use_container_width=True)

    with c_e2:
        ct_prod_act = compute_cross_tabulation(df, "NumOfProducts", "IsActiveMember", metric="mean_churn")
        ct_prod_act.columns = ["Inactive Member", "Active Member"]
        fig_heatmap = px.imshow(
            ct_prod_act * 100,
            labels=dict(x="Engagement Status", y="Product Holdings", color="Churn Rate (%)"),
            title="<b>Churn Intensity: Products Held × Digital Activity (%)</b>",
            color_continuous_scale="Reds",
            text_auto=".1f",
        )
        fig_heatmap = apply_dark_theme(fig_heatmap)
        st.plotly_chart(fig_heatmap, use_container_width=True)

# Tab 4: Statistical Hypothesis Tests
with tab_stats:
    st.markdown("### 🔬 Rigorous Hypothesis Testing & Effect Sizes")
    st.markdown(
        "> **Methodological Standard**: Pearson Chi-Square tests are computed with Cramer's V for categorical features. "
        "Two-sample Welch's t-tests and Mann-Whitney U rank sums are computed with Cohen's d for continuous features. "
        "Statistical association does not constitute proven causality."
    )

    col_t1, col_t2 = st.columns(2)

    with col_t1:
        st.markdown("#### 📐 Categorical Chi-Square Association Tests")
        cat_tests = []
        for feat in ["Geography", "Gender", "NumOfProducts", "IsActiveMember", "HasCrCard", "AgeGroup"]:
            res = analyze_categorical_association(df, feat, "Exited")
            cat_tests.append({
                "Feature": feat,
                "Chi-Square Stat": f"{res['chi2_statistic']:.1f}",
                "p-value": "< 0.001" if res["p_value"] < 0.001 else f"{res['p_value']:.4f}",
                "Cramer's V": f"{res['cramers_v']:.3f}",
                "Significance": "Significant (p < 0.05)" if res["is_significant"] else "Not Significant",
            })
        st.dataframe(pd.DataFrame(cat_tests), use_container_width=True, hide_index=True)

    with col_t2:
        st.markdown("#### 📏 Continuous Numerical Group Differences")
        num_tests = []
        for feat in ["Age", "Balance", "CreditScore", "EstimatedSalary", "BalanceSalaryRatio"]:
            res = analyze_numerical_difference(df, feat, "Exited")
            if res:
                num_tests.append({
                    "Feature": feat,
                    "Welch t-stat": f"{res['welch_t_stat']:.2f}",
                    "p-value": "< 0.001" if res["welch_t_pval"] < 0.001 else f"{res['welch_t_pval']:.4f}",
                    "Cohen's d": f"{res['cohens_d']:.3f}",
                    "Significance": "Significant (p < 0.05)" if res["is_significant"] else "Not Significant",
                })
        st.dataframe(pd.DataFrame(num_tests), use_container_width=True, hide_index=True)
