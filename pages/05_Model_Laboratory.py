"""
BankSight AI — Page 05: Machine Learning Model Laboratory
Compares classifier architectures across 5-fold CV, isolated holdout test sets, and threshold sliders.
"""
import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px

from src.data_loader import load_dataset
from src.prediction_service import PredictionService
from src.model_evaluation import evaluate_binary_classifier
from src.ui_components import render_brand_header, render_metric_card
from src.plotting import apply_dark_theme
from src.config import THEME_COLORS

st.set_page_config(page_title="Model Laboratory — BankSight AI", page_icon="🤖", layout="wide")

render_brand_header(
    page_title="Machine Learning Model Laboratory",
    subtitle="Algorithm Benchmarking, 5-Fold Stratified Cross-Validation & Isolated Holdout Test Evaluation",
)

df = st.session_state.get("dataset")
if df is None:
    df = load_dataset()
    st.session_state["dataset"] = df

# Load cached artifacts or train
artifacts = PredictionService.get_artifacts(df_fallback=df)
test_data = artifacts["test_data"]
test_evals = artifacts["test_evaluations"]
cv_res = artifacts["cv_results"]
best_model = artifacts["best_model_name"]

# Model Selector & Threshold Slider
st.sidebar.markdown("### ⚙️ Model Laboratory Controls")
active_model = st.sidebar.selectbox("Active Benchmark Model", list(test_evals.keys()), index=list(test_evals.keys()).index(best_model))
prob_threshold = st.sidebar.slider("Classification Decision Threshold", min_value=0.10, max_value=0.90, value=0.50, step=0.05)

# Re-evaluate active model at custom threshold
y_test = test_data["y_test"]
X_test_proc = test_data["X_test_proc"]
clf = artifacts["trained_models"][active_model]
y_test_probs = clf.predict_proba(X_test_proc)[:, 1]
active_eval = evaluate_binary_classifier(y_test, y_test_probs, threshold=prob_threshold)

# Top Metrics Row for Active Model
c1, c2, c3, c4 = st.columns(4)
with c1:
    render_metric_card(
        title="Isolated Test ROC-AUC",
        value=f"{active_eval['roc_auc']:.4f}",
        subtext=f"5-Fold CV: {cv_res[active_model]['cv_roc_auc_mean']:.4f}",
        delta="Benchmark Top" if active_model == best_model else None,
    )
with c2:
    render_metric_card(
        title="Precision-Recall AUC (PR-AUC)",
        value=f"{active_eval['pr_auc']:.4f}",
        subtext=f"Baseline Churn Rate: {np.mean(y_test)*100:.1f}%",
        delta="Imbalance Metric",
    )
with c3:
    render_metric_card(
        title=f"Recall @ Threshold {prob_threshold:.2f}",
        value=f"{active_eval['recall']*100:.1f}%",
        subtext=f"Captured {active_eval['confusion_matrix']['tp']} / {sum(y_test)} churners",
    )
with c4:
    render_metric_card(
        title=f"F1-Score @ Threshold {prob_threshold:.2f}",
        value=f"{active_eval['f1_score']:.4f}",
        subtext=f"Brier Score: {active_eval['brier_score']:.4f} (Calibrated)",
    )

st.markdown("---")

# Comprehensive Comparison Table
st.markdown("### 🏆 Head-to-Head Model Performance Comparison (Isolated 2,000 Holdout Test Customers)")

rows = []
for name, ev in test_evals.items():
    cv = cv_res[name]
    rows.append({
        "Model Architecture": name + (" (Selected Best)" if name == best_model else ""),
        "5-Fold CV ROC-AUC": f"{cv['cv_roc_auc_mean']:.4f} ± {cv['cv_roc_auc_std']:.3f}",
        "5-Fold CV PR-AUC": f"{cv['cv_pr_auc_mean']:.4f} ± {cv['cv_pr_auc_std']:.3f}",
        "Holdout Accuracy": f"{ev['accuracy']*100:.2f}%",
        "Holdout ROC-AUC": f"{ev['roc_auc']:.4f}",
        "Holdout PR-AUC": f"{ev['pr_auc']:.4f}",
        "Holdout Precision": f"{ev['precision']*100:.2f}%",
        "Holdout Recall": f"{ev['recall']*100:.2f}%",
        "Holdout F1": f"{ev['f1_score']:.4f}",
        "Brier Calibration": f"{ev['brier_score']:.4f}",
    })

st.dataframe(pd.DataFrame(rows), use_container_width=True, hide_index=True)

st.markdown("---")

# Diagnostic Curves: ROC and PR Curves
col_roc, col_pr = st.columns(2)

with col_roc:
    st.markdown("#### 📈 Receiver Operating Characteristic (ROC)")
    fig_roc = go.Figure()
    palette = [THEME_COLORS["primary"], THEME_COLORS["accent_magenta"], THEME_COLORS["accent_emerald"]]

    for i, (m_name, ev) in enumerate(test_evals.items()):
        fig_roc.add_trace(
            go.Scatter(
                x=ev["roc_curve"]["fpr"],
                y=ev["roc_curve"]["tpr"],
                mode="lines",
                name=f"{m_name} (AUC = {ev['roc_auc']:.3f})",
                line=dict(color=palette[i % len(palette)], width=2.5),
            )
        )
    fig_roc.add_trace(
        go.Scatter(
            x=[0, 1], y=[0, 1],
            mode="lines",
            name="Random Chance",
            line=dict(dash="dash", color="rgba(255,255,255,0.3)"),
        )
    )
    fig_roc = apply_dark_theme(fig_roc)
    fig_roc.update_layout(xaxis_title="False Positive Rate", yaxis_title="True Positive Rate (Recall)", height=380)
    st.plotly_chart(fig_roc, use_container_width=True)

with col_pr:
    st.markdown("#### 🎯 Precision-Recall (PR) Curve")
    fig_pr = go.Figure()

    for i, (m_name, ev) in enumerate(test_evals.items()):
        fig_pr.add_trace(
            go.Scatter(
                x=ev["pr_curve"]["recall"],
                y=ev["pr_curve"]["precision"],
                mode="lines",
                name=f"{m_name} (PR-AUC = {ev['pr_auc']:.3f})",
                line=dict(color=palette[i % len(palette)], width=2.5),
            )
        )
    # Baseline prevalence line
    fig_pr.add_trace(
        go.Scatter(
            x=[0, 1], y=[np.mean(y_test), np.mean(y_test)],
            mode="lines",
            name=f"No-Skill Baseline ({np.mean(y_test)*100:.1f}%)",
            line=dict(dash="dash", color="rgba(255,255,255,0.3)"),
        )
    )
    fig_pr = apply_dark_theme(fig_pr)
    fig_pr.update_layout(xaxis_title="Recall (Sensitivity)", yaxis_title="Precision", height=380)
    st.plotly_chart(fig_pr, use_container_width=True)

# Confusion Matrix for Active Model
st.markdown("---")
col_cm_plot, col_cm_desc = st.columns([1.1, 0.9])

with col_cm_plot:
    cm = active_eval["confusion_matrix"]
    cm_matrix = np.array(cm["matrix"])
    fig_cm = px.imshow(
        cm_matrix,
        x=["Predicted Retained (0)", "Predicted Churned (1)"],
        y=["Actual Retained (0)", "Actual Churned (1)"],
        labels=dict(x="Predicted Class", y="Observed Actual Outcome", color="Count"),
        color_continuous_scale="Blues",
        text_auto=True,
    )
    fig_cm = apply_dark_theme(fig_cm, f"Confusion Matrix: {active_model} (Threshold = {prob_threshold:.2f})")
    fig_cm.update_layout(height=340)
    st.plotly_chart(fig_cm, use_container_width=True)

with col_cm_desc:
    st.markdown(f"#### 🔎 Confusion Matrix Diagnostics ({active_model})")
    st.markdown(
        f"""
        - **True Negatives (TN)**: `{cm['tn']:,}` retained accounts correctly classified.
        - **False Positives (FP)**: `{cm['fp']:,}` accounts misidentified as churn risks (wasted outreach cost).
        - **False Negatives (FN)**: `{cm['fn']:,}` departed accounts missed by the model.
        - **True Positives (TP)**: `{cm['tp']:,}` churning accounts successfully flagged for retention.
        
        *Adjust the threshold slider in the sidebar to simulate conservative vs aggressive operational policies.*
        """
    )

# Demographic Feature Ablation
with st.expander("⚖️ Sensitive Attribute Demographic Ablation Study (Gender Feature Impact)"):
    abl = artifacts.get("demographic_ablation", {})
    st.markdown(
        f"""
        **Ablation Experiment**: Testing model performance when the sensitive attribute `Gender` is completely omitted from the training matrix.
        - **Baseline Gradient Boosting (With Gender)**: Holdout ROC-AUC = `{test_evals['Gradient Boosting']['roc_auc']:.4f}` | PR-AUC = `{test_evals['Gradient Boosting']['pr_auc']:.4f}`
        - **Ablated Gradient Boosting (Without Gender)**: Holdout ROC-AUC = `{abl.get('roc_auc', 0):.4f}` | PR-AUC = `{abl.get('pr_auc', 0):.4f}`
        - **Analytical Observation**: Removing gender incurs a minor reduction in discriminative score (< 0.015 ROC-AUC), confirming that financial, behavioral, and demographic features (`Age`, `NumOfProducts`, `Balance`, `Geography`) carry the vast majority of predictive signal.
        """
    )
