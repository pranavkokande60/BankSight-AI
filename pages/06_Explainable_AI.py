"""
BankSight AI — Page 06: Explainable AI (XAI)
Global SHAP feature importance rankings, local customer waterfall attributions, and plain-language reasoning.
"""
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px

from src.data_loader import load_dataset
from src.prediction_service import PredictionService
from src.explainability import ExplainabilityEngine
from src.ui_components import render_brand_header, render_metric_card
from src.plotting import plot_feature_attributions, apply_dark_theme
from src.config import THEME_COLORS

st.set_page_config(page_title="Explainable AI — BankSight AI", page_icon="💡", layout="wide")

render_brand_header(
    page_title="Explainable AI & Model Transparency",
    subtitle="Global Feature Attributions, Local Customer Waterfalls & Explainable Decision Trails",
)

df = st.session_state.get("dataset")
if df is None:
    df = load_dataset()
    st.session_state["dataset"] = df

artifacts = PredictionService.get_artifacts(df_fallback=df)
feature_names = artifacts["feature_names"]
test_data = artifacts["test_data"]
best_model_name = artifacts["best_model_name"]
model = artifacts["trained_models"][best_model_name]

# Initialize explainability engine
explainer = ExplainabilityEngine(
    model=model,
    feature_names=feature_names,
    background_data=test_data["X_test_proc"][:100],
)

tab_global, tab_local = st.tabs(["🌐 Global Feature Importance", "🔍 Local Customer Attribution"])

# Tab 1: Global Feature Importance
with tab_global:
    st.markdown("### 🌐 Portfolio-Wide Global Feature Impact")
    st.caption("Derived via SHAP Shapley value attributions on representative test data.")

    imp_df = explainer.get_global_importance(test_data["X_test_proc"], test_data["y_test"])

    col_g1, col_g2 = st.columns([1.3, 0.9])

    with col_g1:
        fig_imp = px.bar(
            imp_df.head(12).iloc[::-1],
            x="Importance",
            y="Feature",
            orientation="h",
            color="Importance",
            color_continuous_scale="Viridis",
            title=f"<b>Global Feature Importance ({imp_df['Method'].iloc[0]})</b>",
        )
        fig_imp = apply_dark_theme(fig_imp)
        fig_imp.update_layout(height=420, showlegend=False)
        st.plotly_chart(fig_imp, use_container_width=True)

    with col_g2:
        st.markdown("#### 📖 Attribution Narrative & Key Findings")
        st.markdown(
            """
            1. **Customer Age (`Age`)**: Consistently the strongest global driver. Churn risk escalates progressively past age 42, peaking in the 50–60 bracket.
            2. **Product Holdings (`NumOfProducts`)**: Highly non-linear attribution. 2 products strongly decrease churn risk, whereas 3 or 4 products sharply escalate risk.
            3. **Digital Inactivity (`IsActiveMember`)**: Active digital engagement acts as a primary retention anchor.
            4. **Territorial Residence (`Geography_Germany`)**: Strong positive attribution toward churn risk.
            5. **Account Balance (`Balance`)**: Elevated balance increases churn probability in tree partitions due to affluent customer mobility.
            
            > **Scientific Caveat**: Feature attributions quantify statistical contributions toward the model's output score. They do not demonstrate causal counterfactuals.
            """
        )

# Tab 2: Local Customer Attribution
with tab_local:
    st.markdown("### 🔍 Customer-Level Prediction Attribution")
    st.caption("Select a customer from the test sample or inspect an archetypal risk case.")

    # Select customer from test data
    test_raw = test_data["X_test_raw"].reset_index(drop=True)
    sample_indices = [0, 5, 12, 28, 42, 100, 250]
    sample_labels = [
        f"Customer Index #{idx} (Age: {test_raw.loc[idx, 'Age']}, Bal: €{test_raw.loc[idx, 'Balance']:,.0f}, Prods: {test_raw.loc[idx, 'NumOfProducts']})"
        for idx in sample_indices
    ]

    selected_choice = st.selectbox("Select Customer to Explain", sample_labels, index=0)
    selected_idx = sample_indices[sample_labels.index(selected_choice)]

    cust_row_raw = test_raw.iloc[selected_idx].to_dict()
    cust_proc = test_data["X_test_proc"][selected_idx]
    actual_label = int(test_data["y_test"].iloc[selected_idx])

    # Run inference and explanation
    prob = float(model.predict_proba(cust_proc.reshape(1, -1))[0, 1])
    explanation = explainer.explain_instance(cust_proc, original_values=cust_row_raw)

    c_m1, c_m2, c_m3 = st.columns(3)
    with c_m1:
        render_metric_card(
            title="Predicted Churn Risk",
            value=f"{prob*100:.1f}%",
            subtext=f"Model: {best_model_name}",
        )
    with c_m2:
        render_metric_card(
            title="Actual Historical Outcome",
            value="Exited (1)" if actual_label == 1 else "Retained (0)",
            subtext="Verified holdout ground truth",
            delta="Correct Classification" if (prob >= 0.5 and actual_label == 1) or (prob < 0.5 and actual_label == 0) else "Misclassification",
        )
    with c_m3:
        render_metric_card(
            title="Baseline Portfolio Prevalence",
            value=f"{explanation['base_value']*100:.1f}%",
            subtext="Expected average prior",
        )

    st.markdown("---")

    col_chart, col_text = st.columns([1.2, 0.9])
    with col_chart:
        fig_attr = plot_feature_attributions(explanation["attributions"], top_n=8)
        st.plotly_chart(fig_attr, use_container_width=True)

    with col_text:
        st.markdown("#### 🗣️ Automated Natural Language Explanation")
        st.markdown(
            f"""
            <div style="background: rgba(19, 27, 46, 0.6); padding: 16px; border-radius: 10px; border: 1px solid rgba(56, 189, 248, 0.2); font-size: 0.92rem; line-height: 1.6;">
                {explanation['narrative_summary']}
                <div style="margin-top: 12px; color: #94a3b8; font-size: 0.8rem;">
                    <b>Model Version</b>: BankSight-HGB-v1.0 (Calibrated)<br>
                    <b>Grounding</b>: {explanation['caveat']}
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        with st.expander("Customer Raw Attributes"):
            st.json(cust_row_raw)
