"""
BankSight AI — Plotting & Visual Styling Module
Builds modern Plotly charts adhering to the dark futuristic glassmorphism design system.
"""
from typing import Dict, Any, List, Optional
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import numpy as np

from src.config import THEME_COLORS


def apply_dark_theme(fig: go.Figure, title: str = "") -> go.Figure:
    """Applies cohesive futuristic glassmorphism styling to any Plotly figure."""
    fig.update_layout(
        title=dict(
            text=f"<b>{title}</b>" if title else "",
            font=dict(color=THEME_COLORS["text_main"], size=16),
            x=0.02,
            y=0.96,
        ),
        paper_bgcolor="rgba(11, 15, 25, 0.0)",  # Transparent to blend with Streamlit cards
        plot_bgcolor="rgba(19, 27, 46, 0.4)",
        font=dict(color=THEME_COLORS["text_main"], family="sans-serif"),
        margin=dict(l=40, r=40, t=50, b=40),
        legend=dict(
            bgcolor="rgba(19, 27, 46, 0.8)",
            bordercolor="rgba(56, 189, 248, 0.2)",
            borderwidth=1,
            font=dict(color=THEME_COLORS["text_main"]),
        ),
        xaxis=dict(
            gridcolor="rgba(255, 255, 255, 0.07)",
            zerolinecolor="rgba(56, 189, 248, 0.2)",
            tickfont=dict(color=THEME_COLORS["text_muted"]),
        ),
        yaxis=dict(
            gridcolor="rgba(255, 255, 255, 0.07)",
            zerolinecolor="rgba(56, 189, 248, 0.2)",
            tickfont=dict(color=THEME_COLORS["text_muted"]),
        ),
    )
    return fig


def plot_3d_customer_galaxy(
    df: pd.DataFrame,
    x_col: str = "PCA_1",
    y_col: str = "PCA_2",
    z_col: str = "PCA_3",
    color_col: str = "Cluster_Name",
    hover_cols: Optional[List[str]] = None,
    max_points: int = 3000,
) -> go.Figure:
    """
    Renders a genuine interactive 3D scatter galaxy plot using actual processed customer points.
    """
    plot_df = df.copy()
    if len(plot_df) > max_points:
        plot_df = plot_df.sample(max_points, random_state=42)

    default_hovers = ["Age", "Geography", "Balance", "NumOfProducts"]
    if "Exited" in plot_df.columns:
        default_hovers.append("Exited")
    if "Predicted_Churn_Prob" in plot_df.columns:
        default_hovers.append("Predicted_Churn_Prob")

    hover_data = hover_cols or [c for c in default_hovers if c in plot_df.columns]

    # Color palette
    discrete_palette = [
        THEME_COLORS["primary"],
        THEME_COLORS["secondary"],
        THEME_COLORS["accent_magenta"],
        THEME_COLORS["accent_emerald"],
        THEME_COLORS["accent_amber"],
        THEME_COLORS["accent_rose"],
    ]

    fig = px.scatter_3d(
        plot_df,
        x=x_col,
        y=y_col,
        z=z_col,
        color=color_col,
        hover_data=hover_data,
        color_discrete_sequence=discrete_palette,
        opacity=0.82,
    )

    fig.update_traces(marker=dict(size=4, line=dict(width=0.5, color="rgba(255,255,255,0.4)")))

    fig.update_layout(
        scene=dict(
            xaxis=dict(
                title=f"<b>{x_col}</b>",
                backgroundcolor="rgba(11, 15, 25, 0.8)",
                gridcolor="rgba(56, 189, 248, 0.15)",
                color=THEME_COLORS["text_muted"],
            ),
            yaxis=dict(
                title=f"<b>{y_col}</b>",
                backgroundcolor="rgba(11, 15, 25, 0.8)",
                gridcolor="rgba(56, 189, 248, 0.15)",
                color=THEME_COLORS["text_muted"],
            ),
            zaxis=dict(
                title=f"<b>{z_col}</b>",
                backgroundcolor="rgba(11, 15, 25, 0.8)",
                gridcolor="rgba(56, 189, 248, 0.15)",
                color=THEME_COLORS["text_muted"],
            ),
        ),
        paper_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=10, r=10, t=30, b=10),
        height=620,
    )
    return fig


def plot_risk_gauge(probability: float, title: str = "Churn Risk Probability") -> go.Figure:
    """Renders a sleek semicircular risk gauge with distinct risk tiers."""
    p_pct = probability * 100
    fig = go.Figure(
        go.Indicator(
            mode="gauge+number",
            value=p_pct,
            number={"suffix": "%", "font": {"color": THEME_COLORS["text_main"], "size": 38}},
            title={"text": f"<b>{title}</b>", "font": {"color": THEME_COLORS["text_main"], "size": 15}},
            gauge={
                "axis": {"range": [0, 100], "tickwidth": 1, "tickcolor": THEME_COLORS["text_muted"]},
                "bar": {"color": THEME_COLORS["primary"], "thickness": 0.28},
                "bgcolor": "rgba(19, 27, 46, 0.6)",
                "borderwidth": 1,
                "bordercolor": "rgba(56, 189, 248, 0.3)",
                "steps": [
                    {"range": [0, 25], "color": "rgba(16, 185, 129, 0.3)"},
                    {"range": [25, 50], "color": "rgba(245, 158, 11, 0.3)"},
                    {"range": [50, 75], "color": "rgba(249, 115, 22, 0.3)"},
                    {"range": [75, 100], "color": "rgba(244, 63, 94, 0.4)"},
                ],
                "threshold": {
                    "line": {"color": "#ef4444", "width": 4},
                    "thickness": 0.8,
                    "value": p_pct,
                },
            },
        )
    )
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=25, r=25, t=40, b=20),
        height=260,
    )
    return fig


def plot_feature_attributions(attribution_df: pd.DataFrame, top_n: int = 10) -> go.Figure:
    """Horizontal bar chart showing features pushing risk up (crimson) vs down (cyan)."""
    sub_df = attribution_df.head(top_n).copy()
    # Invert order for top-to-bottom reading
    sub_df = sub_df.iloc[::-1]

    colors = [
        THEME_COLORS["accent_rose"] if d == "Increases Risk" else THEME_COLORS["primary"]
        for d in sub_df["Direction"]
    ]

    fig = go.Figure(
        go.Bar(
            x=sub_df["Attribution"],
            y=sub_df["Feature"],
            orientation="h",
            marker=dict(color=colors, line=dict(color="rgba(255,255,255,0.2)", width=1)),
            text=[f"{v:+.3f}" for v in sub_df["Attribution"]],
            textposition="auto",
        )
    )
    fig = apply_dark_theme(fig, "Key Prediction Factor Attributions (Local Impact)")
    fig.update_layout(height=360, xaxis_title="Attribution Impact on Churn Propensity")
    return fig


def plot_radar_personas(cluster_profiles_df: pd.DataFrame) -> go.Figure:
    """Generates multi-attribute radar chart comparing cluster centroids."""
    categories = ["Mean_Balance", "Mean_Age", "Mean_Products", "Active_Member_Rate", "Mean_Salary"]
    readable_cats = ["Balance", "Age", "Product Count", "Activity Rate", "Salary"]

    fig = go.Figure()

    # Normalize categories across clusters to [0, 1] for balanced radar display
    norm_df = cluster_profiles_df.copy()
    for cat in categories:
        c_min = norm_df[cat].min()
        c_max = norm_df[cat].max()
        norm_df[cat + "_norm"] = (norm_df[cat] - c_min) / (c_max - c_min + 1e-8)

    palette = [
        THEME_COLORS["primary"],
        THEME_COLORS["secondary"],
        THEME_COLORS["accent_magenta"],
        THEME_COLORS["accent_emerald"],
        THEME_COLORS["accent_amber"],
    ]

    for idx, row in norm_df.iterrows():
        vals = [row[c + "_norm"] for c in categories]
        vals.append(vals[0])  # Close polygon
        cats_closed = readable_cats + [readable_cats[0]]

        fig.add_trace(
            go.Scatterpolar(
                r=vals,
                theta=cats_closed,
                fill="toself",
                name=f"Cluster {row['Cluster']} ({row['Persona_Title']})",
                line=dict(color=palette[idx % len(palette)], width=2),
                opacity=0.65,
            )
        )

    fig.update_layout(
        polar=dict(
            radialaxis=dict(visible=True, range=[0, 1], gridcolor="rgba(255,255,255,0.1)"),
            angularaxis=dict(gridcolor="rgba(255,255,255,0.15)", linecolor="rgba(255,255,255,0.2)"),
            bgcolor="rgba(19, 27, 46, 0.4)",
        ),
        paper_bgcolor="rgba(0,0,0,0)",
        font=dict(color=THEME_COLORS["text_main"]),
        height=450,
        margin=dict(l=40, r=40, t=40, b=40),
    )
    return fig
