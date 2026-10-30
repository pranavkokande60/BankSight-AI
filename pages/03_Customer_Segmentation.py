"""
BankSight AI — Page 03: Customer Segmentation Galaxy
Interactive 3D Galaxy visualization, unsupervised clustering, and empirical banking persona profiles.
"""
import streamlit as st
import pandas as pd
import plotly.express as px
import joblib

from src.data_loader import load_dataset
from src.segmentation import CustomerSegmentationEngine
from src.config import SEGMENTATION_ARTIFACTS_PATH, THEME_COLORS
from src.plotting import plot_3d_customer_galaxy, plot_radar_personas, apply_dark_theme
from src.ui_components import render_brand_header, render_metric_card

st.set_page_config(page_title="Customer Galaxy — BankSight AI", page_icon="🌌", layout="wide")

render_brand_header(
    page_title="Customer Segmentation Galaxy",
    subtitle="Unsupervised Behavioral Clustering, 3D PCA Manifold Projection & Persona Archetypes",
)

df = st.session_state.get("dataset")
if df is None:
    df = load_dataset()
    st.session_state["dataset"] = df

# Clustering Configuration Sidebar Controls
st.sidebar.markdown("### 🧬 Cluster Engine Settings")
selected_algo = st.sidebar.selectbox("Clustering Algorithm", ["K-Means", "Gaussian Mixture Models (GMM)", "Agglomerative Clustering"], index=0)
algo_key_map = {"K-Means": "kmeans", "Gaussian Mixture Models (GMM)": "gmm", "Agglomerative Clustering": "agglomerative"}
k_clusters = st.sidebar.slider("Number of Clusters (k)", min_value=2, max_value=6, value=4)

# Run clustering or load cached artifact
@st.cache_data
def get_segmentation_results(data: pd.DataFrame, algo: str, k: int):
    engine = CustomerSegmentationEngine(algorithm=algo, n_clusters=k)
    annotated, results = engine.fit_predict(data)
    return annotated, results

algo_key = algo_key_map[selected_algo]
annotated_df, seg_results = get_segmentation_results(df, algo_key, k_clusters)
metrics = seg_results["metrics"]
profiles = seg_results["cluster_profiles"]

# Top Metrics Row
c1, c2, c3, c4 = st.columns(4)
with c1:
    render_metric_card(
        title="Active Clusters",
        value=f"k = {k_clusters}",
        subtext=f"Algorithm: {selected_algo}",
    )
with c2:
    sil = metrics["silhouette_score"]
    sil_eval = "Good Separation" if sil > 0.3 else ("Moderate" if sil > 0.15 else "Weak Boundaries")
    render_metric_card(
        title="Silhouette Score",
        value=f"{sil:.3f}",
        subtext=sil_eval,
        delta="Cluster Quality",
    )
with c3:
    db = metrics["davies_bouldin_index"]
    render_metric_card(
        title="Davies-Bouldin Index",
        value=f"{db:.3f}",
        subtext="Lower index indicates better separation",
    )
with c4:
    ch = metrics["calinski_harabasz_score"]
    render_metric_card(
        title="Calinski-Harabasz Score",
        value=f"{ch:.1f}",
        subtext="Variance ratio criterion",
    )

st.markdown("---")

# Main 3D Customer Galaxy Centerpiece
st.markdown("### 🌌 3D Customer Space Projection")

col_3d_controls, col_3d_chart = st.columns([0.8, 2.2])

with col_3d_controls:
    st.markdown("#### ⚙️ Axis Coordinates")
    axis_options = ["PCA_1", "PCA_2", "PCA_3", "Balance", "Age", "CreditScore", "EstimatedSalary", "NumOfProducts"]
    x_axis = st.selectbox("X-Axis", options=axis_options, index=0)
    y_axis = st.selectbox("Y-Axis", options=axis_options, index=1)
    z_axis = st.selectbox("Z-Axis", options=axis_options, index=2)

    color_by = st.selectbox(
        "Color Points By",
        options=["Cluster_Name", "Exited", "Geography", "NumOfProducts"],
        index=0,
    )
    max_pts = st.slider("Rendered Sample Points", min_value=500, max_value=5000, value=2500, step=500)

    st.markdown(
        """
        <div style="background: rgba(19, 27, 46, 0.5); padding: 12px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.15); font-size: 0.82rem; color: #94a3b8; margin-top: 14px;">
            <b>3D Manifold Interpretation</b>: PCA axes represent the principal orthogonal directions of behavioral variance.
            Click and drag to rotate the customer galaxy in genuine 3D space.
        </div>
        """,
        unsafe_allow_html=True,
    )

with col_3d_chart:
    fig_3d = plot_3d_customer_galaxy(
        annotated_df,
        x_col=x_axis,
        y_col=y_axis,
        z_col=z_axis,
        color_col=color_by,
        max_points=max_pts,
    )
    st.plotly_chart(fig_3d, use_container_width=True)

st.markdown("---")

# Empirical Segment Persona Profiles & Radar Comparison
st.markdown("### 🎭 Empirical Banking Persona Archetypes")

col_table, col_radar = st.columns([1.3, 1.0])

with col_table:
    st.markdown("#### 📊 Centroid Summary & Churn Distribution")
    display_profiles = profiles.copy()
    display_profiles["Observed_Churn_Rate"] = display_profiles["Observed_Churn_Rate"].apply(lambda v: f"{v*100:.1f}%")
    display_profiles["Share_of_Total"] = display_profiles["Share_of_Total"].apply(lambda v: f"{v*100:.1f}%")
    display_profiles["Churn_Contribution"] = display_profiles["Churn_Contribution"].apply(lambda v: f"{v*100:.1f}%")
    display_profiles["Mean_Balance"] = display_profiles["Mean_Balance"].apply(lambda v: f"€{v:,.0f}")
    display_profiles["Mean_Salary"] = display_profiles["Mean_Salary"].apply(lambda v: f"€{v:,.0f}")
    display_profiles["Mean_Age"] = display_profiles["Mean_Age"].apply(lambda v: f"{v:.1f} yrs")
    display_profiles["Mean_Products"] = display_profiles["Mean_Products"].apply(lambda v: f"{v:.2f}")
    display_profiles["Active_Member_Rate"] = display_profiles["Active_Member_Rate"].apply(lambda v: f"{v*100:.1f}%")

    st.dataframe(
        display_profiles[[
            "Cluster", "Persona_Title", "Customer_Count", "Share_of_Total",
            "Observed_Churn_Rate", "Churn_Contribution", "Mean_Balance", "Active_Member_Rate"
        ]],
        use_container_width=True,
        hide_index=True,
    )

with col_radar:
    st.markdown("#### 🕸️ Persona Radar Comparison")
    fig_radar = plot_radar_personas(profiles)
    st.plotly_chart(fig_radar, use_container_width=True)

# Export segment assignments
st.markdown("---")
st.markdown("### 📥 Export Segment Assignments")
seg_export_csv = annotated_df[["CustomerId", "Cluster", "Cluster_Name", "PCA_1", "PCA_2", "PCA_3"]].to_csv(index=False)
st.download_button(
    "Download Customer Segment Assignments (CSV)",
    data=seg_export_csv,
    file_name="BankSight_Customer_Segments.csv",
    mime="text/csv",
)
