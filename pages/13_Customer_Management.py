"""
BankSight AI — Page 13: Customer Management & Live Churn Risk Assessment
========================================================================
Interactive customer registration form, strict field validation, duplicate prevention,
persistent SQLite storage, real-time ML risk scoring, SHAP attributions, and lifecycle tracking.

Strict Banking Compliance:
- 'Exited' observed label is strictly NULL for all newly registered customers.
- Model predictions are never treated as observed historical churn labels.
- Original CSV training dataset (data/European_Bank.csv) is strictly preserved.
"""
import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from datetime import datetime

from src.config import THEME_COLORS, MODEL_ARTIFACTS_PATH
from src.customer_db import (
    init_customer_db,
    generate_unique_customer_id,
    add_customer,
    get_customer,
    update_customer,
    set_customer_status,
    search_customers,
    get_customer_count,
    score_registered_customer,
    get_prediction_history,
)
from src.ui_components import render_brand_header, render_metric_card, inject_custom_css
from src.plotting import plot_risk_gauge

st.set_page_config(
    page_title="Customer Management — BankSight AI",
    page_icon="👥",
    layout="wide",
)

inject_custom_css()
init_customer_db()

render_brand_header(
    page_title="Customer Management & Live Risk Scoring",
    subtitle="Persistent Customer Registration, Strict Validation, Lifecycle Management & Real-Time ML Churn Assessment",
)

# Top Status Indicators
col_kpi1, col_kpi2, col_kpi3, col_kpi4 = st.columns(4)
total_registered = get_customer_count(status=None)
active_count = get_customer_count(status="ACTIVE")
inactive_count = get_customer_count(status="INACTIVE")
archived_count = get_customer_count(status="ARCHIVED")

with col_kpi1:
    render_metric_card("Registered Customers", f"{total_registered:,}", "SQLite Persistent Store")
with col_kpi2:
    render_metric_card("Active Accounts", f"{active_count:,}", "Operational Status")
with col_kpi3:
    render_metric_card("Inactive / Dormant", f"{inactive_count:,}", "Lifecycle Review")
with col_kpi4:
    render_metric_card("Archived Records", f"{archived_count:,}", "Soft-Deleted Audit")

st.markdown("---")

tab_register, tab_directory, tab_profile = st.tabs([
    "➕ Register New Customer",
    "🔍 Customer Directory & Search",
    "👤 Customer Profile & Lifecycle",
])

# ==============================================================================
# TAB 1: ADD NEW CUSTOMER
# ==============================================================================
with tab_register:
    st.markdown("### ➕ Register New Customer Record")
    st.caption(
        "Enter customer demographic and account attributes. All inputs undergo strict validation, range checking, "
        "and duplicate prevention before being persisted to the SQLite database. The original training dataset is preserved."
    )

    # Informational Alert regarding Observed vs Predicted Churn
    st.info(
        "ℹ️ **Regulatory Notice — Observed vs Predicted Outcome Separation**:\n"
        "Newly registered customers have an **unknown future churn outcome**. The `Exited` historical field is stored "
        "as `NULL` and will never be populated with a synthetic model prediction or merged into training data without confirmed outcomes."
    )

    with st.form("customer_registration_form", clear_on_submit=False):
        st.markdown("#### 1. Identification & Identity")
        c_id_mode = st.radio(
            "Customer ID Assignment",
            ["✨ Automatically Generate Unique ID", "✍️ Manual ID Entry"],
            horizontal=True,
        )

        suggested_id = generate_unique_customer_id()
        if c_id_mode == "✨ Automatically Generate Unique ID":
            reg_customer_id = suggested_id
            st.text_input("Generated Customer ID", value=str(reg_customer_id), disabled=True)
        else:
            reg_customer_id = st.number_input(
                "Enter Unique Customer ID",
                min_value=1,
                max_value=99_999_999,
                value=suggested_id,
                step=1,
                help="Must be a unique positive integer not already in the registry or base training data.",
            )

        reg_surname = st.text_input(
            "Customer Surname (Optional)",
            value="",
            placeholder="e.g. Dupont, Müller, Garcia",
            help="Stored for profile identification only. Excluded from machine learning feature engineering to prevent bias.",
        )

        st.markdown("#### 2. Demographics & Geographic Attributes")
        c_dem1, c_dem2, c_dem3 = st.columns(3)
        with c_dem1:
            reg_geography = st.selectbox(
                "Geography (Country)",
                options=["France", "Germany", "Spain"],
                index=0,
                help="Member state of primary banking residence.",
            )
        with c_dem2:
            reg_gender = st.selectbox(
                "Gender",
                options=["Female", "Male"],
                index=0,
                help="Customer demographic gender classification.",
            )
        with c_dem3:
            reg_age = st.number_input(
                "Age (Years)",
                min_value=18,
                max_value=100,
                value=38,
                step=1,
                help="Age must be between 18 and 100 years.",
            )

        st.markdown("#### 3. Banking Relationship & Financial Balances")
        c_fin1, c_fin2, c_fin3 = st.columns(3)
        with c_fin1:
            reg_credit_score = st.number_input(
                "Credit Score (FICO Standard)",
                min_value=300,
                max_value=850,
                value=650,
                step=5,
                help="Standard credit score ranging from 300 to 850.",
            )
            reg_tenure = st.number_input(
                "Tenure (Years as Bank Client)",
                min_value=0,
                max_value=10,
                value=3,
                step=1,
                help="Completed years of account relationship (0 to 10).",
            )
        with c_fin2:
            reg_balance = st.number_input(
                "Account Balance (€ EUR)",
                min_value=0.0,
                max_value=1_000_000.0,
                value=45_000.0,
                step=1_000.0,
                format="%.2f",
                help="Current liquid deposit balance in Euros. Zero balances are valid.",
            )
            reg_estimated_salary = st.number_input(
                "Estimated Annual Salary (€ EUR)",
                min_value=0.0,
                max_value=1_000_000.0,
                value=62_000.0,
                step=1_000.0,
                format="%.2f",
                help="Estimated annual income of the account holder.",
            )
        with c_fin3:
            reg_num_of_products = st.selectbox(
                "Number of Bank Products Held",
                options=[1, 2, 3, 4],
                index=0,
                help="Number of active banking products (1 to 4). Note: 3+ products show severe empirical churn hazard.",
            )
            reg_has_cr_card = st.selectbox(
                "Credit Card Holder",
                options=["Yes (1)", "No (0)"],
                index=0,
                help="Does the customer hold an active credit card facility?",
            )
            reg_is_active_member = st.selectbox(
                "Active Membership Status",
                options=["Yes (1)", "No (0)"],
                index=0,
                help="Has the client performed transactions or digital logins recently?",
            )

        submit_btn = st.form_submit_button("💾 Register & Persist Customer Record", use_container_width=True)

    if submit_btn:
        payload = {
            "customer_id": int(reg_customer_id),
            "surname": reg_surname.strip() if reg_surname else None,
            "credit_score": int(reg_credit_score),
            "geography": reg_geography,
            "gender": reg_gender,
            "age": int(reg_age),
            "tenure": int(reg_tenure),
            "balance": float(reg_balance),
            "num_of_products": int(reg_num_of_products),
            "has_cr_card": 1 if "Yes" in reg_has_cr_card else 0,
            "is_active_member": 1 if "Yes" in reg_is_active_member else 0,
            "estimated_salary": float(reg_estimated_salary),
            "record_status": "ACTIVE",
            "exited": None,  # Strictly None / NULL for new customers
        }

        try:
            saved_record = add_customer(payload)
            st.session_state["last_registered_id"] = saved_record["customer_id"]
            st.success(
                f"✅ **Customer {saved_record['customer_id']} successfully registered and persisted to SQLite!**"
            )
        except ValueError as val_err:
            st.error(f"❌ **Registration Rejected**: {val_err}")
        except Exception as exc:
            st.error(f"❌ **Database Error**: {exc}")

    # Display Instant ML Risk Assessment if a customer was just registered
    active_cid = st.session_state.get("last_registered_id")
    if active_cid:
        st.markdown("---")
        st.markdown(f"### ⚡ Instant ML Risk Assessment for Customer #{active_cid}")

        cust_rec = get_customer(active_cid)
        if cust_rec:
            # Summary Pill
            c_info1, c_info2, c_info3, c_info4 = st.columns(4)
            c_info1.markdown(f"**Customer ID**: `{cust_rec['customer_id']}`")
            c_info2.markdown(f"**Surname**: `{cust_rec['surname'] or 'N/A'}`")
            c_info3.markdown(f"**Demographics**: `{cust_rec['geography']} · {cust_rec['gender']} · {cust_rec['age']} yrs`")
            c_info4.markdown(f"**Observed Churn (Exited)**: `NULL (Unknown - New Client)`")

            # Check if model artifacts are available
            if not MODEL_ARTIFACTS_PATH.exists():
                st.warning(
                    "⚠️ **ML Model Artifacts Not Found**: Predictive scoring will become available after "
                    "training models in Page 05 (ML Model Laboratory). No simulated or placeholder probabilities "
                    "are presented, preserving empirical integrity."
                )
            else:
                score_col1, score_col2 = st.columns([1, 2])
                with score_col1:
                    run_score = st.button("🚀 Run Live ML Churn Prediction", key="btn_run_score_new", use_container_width=True)

                if run_score or st.session_state.get(f"scored_{active_cid}"):
                    st.session_state[f"scored_{active_cid}"] = True
                    try:
                        res = score_registered_customer(active_cid, save_to_history=True)

                        col_m1, col_m2, col_m3 = st.columns(3)
                        with col_m1:
                            render_metric_card(
                                "Predicted Churn Probability",
                                f"{res['predicted_churn_prob']*100:.2f}%",
                                f"Ensemble Mean: {res['ensemble_mean_prob']*100:.2f}%",
                            )
                        with col_m2:
                            tier = res["risk_tier"]
                            tier_color = "#f43f5e" if "Critical" in tier else ("#f59e0b" if "High" in tier else ("#818cf8" if "Moderate" in tier else "#10b981"))
                            st.markdown(
                                f"""
                                <div class="glass-card" style="border-left: 4px solid {tier_color};">
                                    <div class="glass-metric-title">Calibrated Risk Tier</div>
                                    <div class="glass-metric-value" style="color: {tier_color};">{tier}</div>
                                    <div class="glass-metric-sub">Model: {res['model_name']} ({res['model_version']})</div>
                                </div>
                                """,
                                unsafe_allow_html=True,
                            )
                        with col_m3:
                            st.markdown(
                                f"""
                                <div class="glass-card">
                                    <div class="glass-metric-title">Assigned Persona & Cluster</div>
                                    <div class="glass-metric-value" style="font-size: 1.15rem; color: #38bdf8;">{res['cluster_name']}</div>
                                    <div class="glass-metric-sub">Observed Churn Label: Strictly NULL</div>
                                </div>
                                """,
                                unsafe_allow_html=True,
                            )

                        # Disagreement Warning
                        if res["has_disagreement"]:
                            st.warning(
                                f"⚠️ **Model Disagreement Alert (Spread: {res['model_spread']*100:.1f}%)**: "
                                f"Different ML architectures express divergent confidence levels for this customer profile. "
                                f"Manual supervisory review recommended."
                            )

                        # Individual Model Probabilities breakdown
                        with st.expander("📊 View Multi-Model Consensus Breakdown", expanded=False):
                            probs_df = pd.DataFrame([
                                {"Model Architecture": k, "Predicted Churn Prob": f"{v*100:.2f}%"}
                                for k, v in res["individual_probabilities"].items()
                            ])
                            st.table(probs_df)

                        # SHAP Feature Attributions
                        if res.get("shap_attributions"):
                            st.markdown("#### 💡 Explainable AI (SHAP Local Attribution)")
                            st.caption("Directional impact of customer attributes on predicted churn risk.")

                            top_attribs = sorted(res["shap_attributions"], key=lambda x: x["AbsMagnitude"], reverse=True)[:8]
                            feats = [x["Feature"] for x in reversed(top_attribs)]
                            vals = [x["Attribution"] for x in reversed(top_attribs)]
                            colors = ["#f43f5e" if v > 0 else "#10b981" for v in vals]

                            fig = go.Figure(
                                go.Bar(
                                    x=vals,
                                    y=feats,
                                    orientation="h",
                                    marker_color=colors,
                                    text=[f"{v:+.3f}" for v in vals],
                                    textposition="outside",
                                )
                            )
                            fig.update_layout(
                                title="SHAP Attribution Waterfall (Top Drivers)",
                                template="plotly_dark",
                                paper_bgcolor="rgba(0,0,0,0)",
                                plot_bgcolor="rgba(0,0,0,0)",
                                height=320,
                                margin=dict(l=20, r=40, t=40, b=20),
                                xaxis_title="SHAP Impact (Log-Odds / Probability Push)",
                            )
                            st.plotly_chart(fig, use_container_width=True)

                        # Data Quality Advisories
                        if res.get("advisories"):
                            st.markdown("#### 🛡️ Data Quality & Outlier Advisories")
                            for adv in res["advisories"]:
                                st.markdown(f"- ⚠️ **Advisory**: {adv}")

                    except Exception as score_exc:
                        st.error(f"Error during scoring: {score_exc}")

# ==============================================================================
# TAB 2: CUSTOMER DIRECTORY & SEARCH
# ==============================================================================
with tab_directory:
    st.markdown("### 🔍 Customer Directory & Search")
    st.caption("Search persistent SQLite customer records by Customer ID or Surname with real-time status filtering.")

    c_s1, c_s2 = st.columns([2, 1])
    with c_s1:
        search_query = st.text_input("Search by Customer ID or Surname", placeholder="e.g. 15820001 or Müller")
    with c_s2:
        status_filter = st.selectbox("Filter Lifecycle Status", options=["ALL", "ACTIVE", "INACTIVE", "ARCHIVED"], index=0)

    customers_found = search_customers(query=search_query, status=status_filter, limit=200)

    if not customers_found:
        st.info("No registered customers found matching the search criteria.")
    else:
        st.markdown(f"**Found {len(customers_found)} matching record(s)** in SQLite database:")
        df_display = pd.DataFrame(customers_found)

        # Re-order and rename columns for executive presentation
        cols_order = [
            "customer_id", "surname", "record_status", "geography", "gender", "age",
            "credit_score", "balance", "num_of_products", "is_active_member",
            "exited", "created_at", "updated_at"
        ]
        present_cols = [c for c in cols_order if c in df_display.columns]
        df_sub = df_display[present_cols].copy()
        df_sub["exited"] = "UNKNOWN (NULL)"
        df_sub["balance"] = df_sub["balance"].apply(lambda x: f"€{x:,.2f}")

        st.dataframe(df_sub, use_container_width=True, height=360)

# ==============================================================================
# TAB 3: CUSTOMER PROFILE & LIFECYCLE MANAGEMENT
# ==============================================================================
with tab_profile:
    st.markdown("### 👤 Customer Profile & Lifecycle Management")
    st.caption("Inspect profile attributes, update information with validation, toggle active/archived state, and audit prediction history.")

    # Select customer to manage
    all_active_customers = search_customers(limit=1000)
    if not all_active_customers:
        st.info("The customer database is currently empty. Register a customer in Tab 1 to enable management.")
    else:
        cust_options = {f"#{c['customer_id']} — {c.get('surname') or 'Unnamed'} ({c['geography']}, {c['record_status']})": c['customer_id'] for c in all_active_customers}
        selected_label = st.selectbox("Select Customer to Manage", options=list(cust_options.keys()))
        selected_cid = cust_options[selected_label]

        current_cust = get_customer(selected_cid)
        if current_cust:
            # Action cards
            col_p_act1, col_p_act2 = st.columns([2, 1])

            with col_p_act1:
                st.markdown(f"#### Edit Profile: #{current_cust['customer_id']}")
                with st.form("edit_customer_form"):
                    e_col1, e_col2 = st.columns(2)
                    with e_col1:
                        e_surname = st.text_input("Surname", value=current_cust["surname"] or "")
                        e_geo = st.selectbox("Geography", ["France", "Germany", "Spain"], index=["France", "Germany", "Spain"].index(current_cust["geography"]))
                        e_gender = st.selectbox("Gender", ["Female", "Male"], index=["Female", "Male"].index(current_cust["gender"]))
                        e_age = st.number_input("Age", min_value=18, max_value=100, value=int(current_cust["age"]))
                        e_tenure = st.number_input("Tenure", min_value=0, max_value=10, value=int(current_cust["tenure"]))
                    with e_col2:
                        e_credit = st.number_input("Credit Score", min_value=300, max_value=850, value=int(current_cust["credit_score"]))
                        e_bal = st.number_input("Balance (€)", min_value=0.0, max_value=10_000_000.0, value=float(current_cust["balance"]), step=500.0)
                        e_sal = st.number_input("Estimated Salary (€)", min_value=0.0, max_value=5_000_000.0, value=float(current_cust["estimated_salary"]), step=500.0)
                        e_prods = st.selectbox("Products", [1, 2, 3, 4], index=int(current_cust["num_of_products"]) - 1)
                        e_active = st.selectbox("Active Member", ["Yes (1)", "No (0)"], index=0 if current_cust["is_active_member"] == 1 else 1)
                        e_card = st.selectbox("Has Credit Card", ["Yes (1)", "No (0)"], index=0 if current_cust["has_cr_card"] == 1 else 1)

                    e_submit = st.form_submit_button("💾 Save Profile Changes", use_container_width=True)

                if e_submit:
                    upd_payload = {
                        "surname": e_surname.strip() if e_surname else None,
                        "geography": e_geo,
                        "gender": e_gender,
                        "age": int(e_age),
                        "tenure": int(e_tenure),
                        "credit_score": int(e_credit),
                        "balance": float(e_bal),
                        "estimated_salary": float(e_sal),
                        "num_of_products": int(e_prods),
                        "is_active_member": 1 if "Yes" in e_active else 0,
                        "has_cr_card": 1 if "Yes" in e_card else 0,
                    }
                    try:
                        updated_rec = update_customer(selected_cid, upd_payload)
                        st.success("✅ Customer profile updated successfully!")
                        st.rerun()
                    except Exception as err:
                        st.error(f"❌ Update failed: {err}")

            with col_p_act2:
                st.markdown("#### Lifecycle Status Management")
                st.markdown(
                    f"**Current Status**: `{current_cust['record_status']}`\n\n"
                    f"**Created At**: `{current_cust['created_at']}`\n\n"
                    f"**Last Updated**: `{current_cust['updated_at']}`"
                )

                st.caption("Change account status instead of hard deletion to maintain audit compliance:")
                new_status = st.selectbox(
                    "Transition Status To",
                    options=["ACTIVE", "INACTIVE", "ARCHIVED"],
                    index=["ACTIVE", "INACTIVE", "ARCHIVED"].index(current_cust["record_status"]),
                )
                if st.button("Apply Status Change", use_container_width=True):
                    try:
                        set_customer_status(selected_cid, new_status)
                        st.success(f"Status transitioned to {new_status}!")
                        st.rerun()
                    except Exception as st_err:
                        st.error(f"Failed to update status: {st_err}")

                st.markdown("---")
                st.markdown("#### Re-Score Risk")
                if st.button("🔄 Re-Run ML Prediction Scoring", use_container_width=True):
                    try:
                        res = score_registered_customer(selected_cid, save_to_history=True)
                        st.success(f"Scored! Risk Tier: **{res['risk_tier']}** ({res['predicted_churn_prob']*100:.1f}%)")
                        st.rerun()
                    except Exception as e:
                        st.error(f"Scoring error: {e}")

            # Chronological Prediction Audit Trail
            st.markdown("---")
            st.markdown(f"#### 📜 Prediction History Audit Log for Customer #{selected_cid}")
            history = get_prediction_history(selected_cid, limit=20)
            if not history:
                st.info("No prediction scorings logged for this customer yet. Click 'Re-Run ML Prediction Scoring' above to generate an audit entry.")
            else:
                hist_records = []
                for h in history:
                    hist_records.append({
                        "Scored At": h["scored_at"],
                        "Model Name": h["model_name"],
                        "Version": h["model_version"],
                        "Predicted Prob": f"{h['predicted_churn_prob']*100:.2f}%",
                        "Risk Tier": h["risk_tier"],
                        "Spread": f"{h['model_spread']*100:.1f}%",
                        "Disagreement": "Yes ⚠️" if h["has_disagreement"] else "No",
                        "Persona": h["cluster_name"] or "N/A",
                    })
                st.dataframe(pd.DataFrame(hist_records), use_container_width=True)

st.markdown("---")
st.caption(
    "BankSight AI — Customer Management Module · SQLite Persistence · Strict Unknown Churn Isolation"
)
