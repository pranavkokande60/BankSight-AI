"""
BankSight AI — UI Components & Dark Glassmorphism Styling
Injects custom CSS and renders reusable components across all dashboard pages.
"""
from typing import Dict, Any, List, Optional
import streamlit as st
import pandas as pd

from src.config import THEME_COLORS


def inject_custom_css():
    """Injects premium futuristic glassmorphism stylesheet."""
    css = f"""
    <style>
    /* Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

    html, body, [class*="css"] {{
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }}

    /* Top navbar / Main background */
    .stApp {{
        background: radial-gradient(circle at 15% 10%, #111a33 0%, #0b0f19 55%, #060911 100%);
        color: #f1f5f9;
    }}

    /* Futuristic Top Header Bar */
    .banksight-header {{
        background: rgba(19, 27, 46, 0.65);
        backdrop-filter: blur(14px);
        border: 1px solid rgba(56, 189, 248, 0.22);
        border-radius: 14px;
        padding: 16px 24px;
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    }}
    .banksight-brand-title {{
        font-size: 1.55rem;
        font-weight: 800;
        background: linear-gradient(135deg, #00d4ff 0%, #38bdf8 50%, #c084fc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: -0.5px;
    }}
    .banksight-badge {{
        background: rgba(56, 189, 248, 0.12);
        border: 1px solid rgba(56, 189, 248, 0.35);
        color: #38bdf8;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.78rem;
        font-weight: 600;
        letter-spacing: 0.4px;
        text-transform: uppercase;
    }}

    /* Glassmorphism Metric Card */
    .glass-card {{
        background: rgba(19, 27, 46, 0.6);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(56, 189, 248, 0.16);
        border-radius: 12px;
        padding: 18px 20px;
        margin-bottom: 14px;
        transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    }}
    .glass-card:hover {{
        border-color: rgba(0, 212, 255, 0.45);
        box-shadow: 0 6px 24px rgba(0, 212, 255, 0.12);
    }}
    .glass-metric-title {{
        color: #94a3b8;
        font-size: 0.82rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        margin-bottom: 6px;
    }}
    .glass-metric-value {{
        color: #ffffff;
        font-size: 1.65rem;
        font-weight: 800;
        letter-spacing: -0.5px;
    }}
    .glass-metric-sub {{
        color: #64748b;
        font-size: 0.78rem;
        margin-top: 4px;
    }}

    /* Risk Tier Pills */
    .tier-low {{ background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 3px 8px; border-radius: 6px; font-weight: 600; }}
    .tier-mod {{ background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); padding: 3px 8px; border-radius: 6px; font-weight: 600; }}
    .tier-high {{ background: rgba(249, 115, 22, 0.15); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.3); padding: 3px 8px; border-radius: 6px; font-weight: 600; }}
    .tier-crit {{ background: rgba(244, 63, 94, 0.2); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.4); padding: 3px 8px; border-radius: 6px; font-weight: 700; }}

    /* Sidebar Styling */
    section[data-testid="stSidebar"] {{
        background: #0d1322 !important;
        border-right: 1px solid rgba(56, 189, 248, 0.15);
    }}

    /* Tab styling */
    .stTabs [data-baseweb="tab-list"] {{
        gap: 8px;
    }}
    .stTabs [data-baseweb="tab"] {{
        background-color: rgba(19, 27, 46, 0.5);
        border: 1px solid rgba(56, 189, 248, 0.15);
        border-radius: 8px;
        color: #94a3b8;
        padding: 8px 16px;
    }}
    .stTabs [aria-selected="true"] {{
        background: rgba(0, 212, 255, 0.15) !important;
        border-color: #00d4ff !important;
        color: #ffffff !important;
    }}
    </style>
    """
    st.markdown(css, unsafe_allow_html=True)


def render_brand_header(page_title: str, subtitle: str = ""):
    """Renders consistent top banner across all pages."""
    inject_custom_css()
    sub_html = f"<div style='color: #94a3b8; font-size: 0.88rem; margin-top: 3px;'>{subtitle}</div>" if subtitle else ""
    st.markdown(
        f"""
        <div class="banksight-header">
            <div>
                <div class="banksight-brand-title">🏦 BankSight AI — {page_title}</div>
                {sub_html}
            </div>
            <div>
                <span class="banksight-badge">European Retail Banking</span>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_metric_card(title: str, value: str, subtext: str = "", delta: Optional[str] = None):
    """Renders single glassmorphism metric tile."""
    delta_html = ""
    if delta:
        delta_color = "#34d399" if delta.startswith("+") or "retention" in delta.lower() else "#f43f5e"
        delta_html = f"<span style='color: {delta_color}; font-size: 0.8rem; font-weight: 600; margin-left: 8px;'>{delta}</span>"

    st.markdown(
        f"""
        <div class="glass-card">
            <div class="glass-metric-title">{title}</div>
            <div class="glass-metric-value">{value}{delta_html}</div>
            <div class="glass-metric-sub">{subtext}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_sidebar_filters(df: pd.DataFrame) -> pd.DataFrame:
    """
    Renders standard sidebar filters for demographic and behavioral variables.
    Returns filtered subset of the dataframe.
    """
    st.sidebar.markdown("### 🎛️ Global Data Filters")

    filtered_df = df.copy()

    # Geography filter
    if "Geography" in df.columns:
        countries = sorted(list(df["Geography"].unique()))
        selected_countries = st.sidebar.multiselect(
            "Territory (Country)", options=countries, default=countries
        )
        if selected_countries:
            filtered_df = filtered_df[filtered_df["Geography"].isin(selected_countries)]

    # Gender filter
    if "Gender" in df.columns:
        genders = sorted(list(df["Gender"].unique()))
        selected_genders = st.sidebar.multiselect(
            "Gender Cohort", options=genders, default=genders
        )
        if selected_genders:
            filtered_df = filtered_df[filtered_df["Gender"].isin(selected_genders)]

    # Age filter
    if "Age" in df.columns:
        min_age = int(df["Age"].min())
        max_age = int(df["Age"].max())
        age_range = st.sidebar.slider(
            "Customer Age Span", min_value=min_age, max_value=max_age, value=(min_age, max_age)
        )
        filtered_df = filtered_df[
            (filtered_df["Age"] >= age_range[0]) & (filtered_df["Age"] <= age_range[1])
        ]

    # Number of products filter
    if "NumOfProducts" in df.columns:
        prods = sorted(list(df["NumOfProducts"].unique()))
        selected_prods = st.sidebar.multiselect(
            "Banking Products Held", options=prods, default=prods
        )
        if selected_prods:
            filtered_df = filtered_df[filtered_df["NumOfProducts"].isin(selected_prods)]

    # Activity status
    if "IsActiveMember" in df.columns:
        activity_choice = st.sidebar.radio(
            "Engagement Activity",
            options=["All Accounts", "Active Members Only", "Inactive Members Only"],
            index=0,
        )
        if activity_choice == "Active Members Only":
            filtered_df = filtered_df[filtered_df["IsActiveMember"] == 1]
        elif activity_choice == "Inactive Members Only":
            filtered_df = filtered_df[filtered_df["IsActiveMember"] == 0]

    st.sidebar.markdown(f"**Filtered Portfolio**: `{len(filtered_df):,}` / `{len(df):,}` accounts")
    st.sidebar.divider()
    return filtered_df
