"""
BankSight AI — European Central Bank (ECB) Basel III Macro Stress Tester
========================================================================
Module: src/stress_testing.py
Author: BankSight AI Quantitative Risk Engineering Team

Simulates macroprudential stress scenarios in accordance with European Central Bank (ECB)
Single Supervisory Mechanism (SSM) guidelines and EBA stress testing methodologies:
1. Baseline Scenario (Current SREP Trajectory)
2. Adverse Inflation & Rate Hike Shock (+250 bps Euribor, +5.5% CPI surge)
3. Severely Adverse Recession & Sovereign Divergence (-3.5% GDP, Liquidity Contraction)
4. FinTech / Neobank Digital Disruption (High-velocity deposit flight in affluent segments)
"""
from typing import Dict, Any, List
import numpy as np
import pandas as pd


class ECBStressTester:
    """
    Evaluates retail banking portfolio resilience under supervisory macroeconomic stress shocks.
    Measures attrition escalation, capital exposure at risk, and capital adequacy depletion.
    """

    SCENARIO_CONFIGS = {
        "ECB_BASELINE": {
            "name": "ECB Baseline (SREP Outlook)",
            "description": "Standard European Central Bank supervisory benchmark reflecting moderate growth and stable Euribor.",
            "gdp_growth_pct": 0.8,
            "euribor_bps_delta": 0,
            "inflation_pct": 2.4,
            "balance_shock_pct": 0.0,
            "inactivity_shock_pct": 0.0,
            "churn_multiplier": 1.00,
            "cet1_impact_bps": 0,
            "stress_severity": "Low (Benchmark)",
        },
        "ADVERSE_INFLATION_SHOCK": {
            "name": "Adverse Inflation & Rate Shock",
            "description": "Stagflationary impulse with aggressive ECB policy rate hikes (+250 bps) and elevated CPI reducing household disposable buffers.",
            "gdp_growth_pct": -1.2,
            "euribor_bps_delta": 250,
            "inflation_pct": 6.8,
            "balance_shock_pct": -0.12,
            "inactivity_shock_pct": 0.18,
            "churn_multiplier": 1.34,
            "cet1_impact_bps": -48,
            "stress_severity": "Moderate-High",
        },
        "SEVERELY_ADVERSE_RECESSION": {
            "name": "Severely Adverse Eurozone Recession",
            "description": "Systemic European contraction with sovereign bond spread divergence, -3.5% GDP contraction, and cross-border deposit flight.",
            "gdp_growth_pct": -3.5,
            "euribor_bps_delta": 375,
            "inflation_pct": 9.1,
            "balance_shock_pct": -0.22,
            "inactivity_shock_pct": 0.35,
            "churn_multiplier": 1.68,
            "cet1_impact_bps": -112,
            "stress_severity": "Severe (Supervisory Boundary)",
        },
        "FINTECH_DISRUPTION": {
            "name": "Neobank Digital Arbitrage Flight",
            "description": "Aggressive deposit-siphoning by European digital neobanks offering 4.25% instant-access yield on balances over €50,000.",
            "gdp_growth_pct": 0.4,
            "euribor_bps_delta": 100,
            "inflation_pct": 3.2,
            "balance_shock_pct": -0.28,
            "inactivity_shock_pct": 0.25,
            "churn_multiplier": 1.52,
            "cet1_impact_bps": -76,
            "stress_severity": "High (Deposit Disintermediation)",
        },
    }

    @classmethod
    def run_stress_test(
        cls,
        scored_df: pd.DataFrame,
        scenario_key: str = "ADVERSE_INFLATION_SHOCK",
        custom_euribor_bps: int = 0,
        custom_balance_shock_pct: float = 0.0,
    ) -> Dict[str, Any]:
        """
        Executes macro stress testing on the current scored banking portfolio.
        """
        cfg = cls.SCENARIO_CONFIGS.get(scenario_key, cls.SCENARIO_CONFIGS["ADVERSE_INFLATION_SHOCK"])

        df = scored_df.copy()
        total_customers = len(df)
        total_baseline_balance = float(df["Balance"].sum())

        # Baseline portfolio metrics
        base_churn_rate = float(df["Exited"].mean()) if "Exited" in df.columns else 0.2037
        base_predicted_prob = float(df["Predicted_Churn_Prob"].mean()) if "Predicted_Churn_Prob" in df.columns else 0.2037
        base_churn_capital = float((df["Predicted_Churn_Prob"] * df["Balance"]).sum()) if "Predicted_Churn_Prob" in df.columns else (base_churn_rate * total_baseline_balance)

        # Macro perturbation factors
        balance_shock = cfg["balance_shock_pct"] + (custom_balance_shock_pct / 100.0)
        rate_bps = cfg["euribor_bps_delta"] + custom_euribor_bps
        churn_mult = cfg["churn_multiplier"] * (1.0 + (rate_bps / 1000.0) * 0.15)

        # Country-specific sensitivity (Germany higher balance sensitivity, Spain higher economic stress)
        country_mult = {"Germany": 1.18, "Spain": 1.12, "France": 0.95}

        # Stressed churn probabilities
        if "Predicted_Churn_Prob" in df.columns:
            stressed_probs = df["Predicted_Churn_Prob"] * churn_mult
            if "Geography" in df.columns:
                weights = df["Geography"].map(country_mult).fillna(1.0)
                stressed_probs = stressed_probs * weights
            stressed_probs = np.clip(stressed_probs, 0.01, 0.99)
        else:
            stressed_probs = np.full(total_customers, min(0.99, base_predicted_prob * churn_mult))

        # Stressed balances
        stressed_balances = np.maximum(0.0, df["Balance"] * (1.0 + balance_shock))

        stressed_mean_churn_prob = float(stressed_probs.mean())
        stressed_churn_customers = int(np.round(stressed_mean_churn_prob * total_customers))
        incremental_churners = max(0, stressed_churn_customers - int(base_churn_rate * total_customers))
        stressed_capital_at_risk = float((stressed_probs * stressed_balances).sum())
        incremental_capital_loss = max(0.0, stressed_capital_at_risk - base_churn_capital)

        # Geographic breakdown under stress
        geo_breakdown = []
        if "Geography" in df.columns:
            for country in ["Germany", "France", "Spain"]:
                c_mask = df["Geography"] == country
                c_count = int(c_mask.sum())
                if c_count > 0:
                    c_base_prob = float(df.loc[c_mask, "Predicted_Churn_Prob"].mean()) if "Predicted_Churn_Prob" in df.columns else 0.20
                    c_stressed_prob = float(stressed_probs[c_mask].mean())
                    c_stressed_bal = float(stressed_balances[c_mask].sum())
                    c_stressed_loss = float((stressed_probs[c_mask] * stressed_balances[c_mask]).sum())
                    geo_breakdown.append({
                        "country": country,
                        "customer_count": c_count,
                        "baseline_churn_rate": round(c_base_prob * 100, 2),
                        "stressed_churn_rate": round(c_stressed_prob * 100, 2),
                        "rate_delta_pct": round((c_stressed_prob - c_base_prob) * 100, 2),
                        "stressed_capital_at_risk_eur": round(c_stressed_loss, 2),
                        "liquidity_share_pct": round((c_stressed_loss / max(1.0, stressed_capital_at_risk)) * 100, 2),
                    })

        # CET1 regulatory depletion
        cet1_depletion = abs(cfg["cet1_impact_bps"]) + int((incremental_capital_loss / 1e6) * 1.5)

        # Recommended EARA liquidity buffer
        recommended_eara_buffer = round(incremental_capital_loss * 0.12, 2)

        return {
            "scenario_key": scenario_key,
            "scenario_name": cfg["name"],
            "description": cfg["description"],
            "stress_severity": cfg["stress_severity"],
            "macro_assumptions": {
                "gdp_growth_pct": cfg["gdp_growth_pct"],
                "euribor_hike_bps": rate_bps,
                "inflation_pct": cfg["inflation_pct"],
                "balance_shock_pct": round(balance_shock * 100, 1),
            },
            "portfolio_impact": {
                "total_customers": total_customers,
                "baseline_churn_rate_pct": round(base_churn_rate * 100, 2),
                "stressed_churn_rate_pct": round(stressed_mean_churn_prob * 100, 2),
                "churn_rate_increase_pts": round((stressed_mean_churn_prob - base_churn_rate) * 100, 2),
                "incremental_churned_accounts": incremental_churners,
                "baseline_capital_at_risk_eur": round(base_churn_capital, 2),
                "stressed_capital_at_risk_eur": round(stressed_capital_at_risk, 2),
                "incremental_capital_loss_eur": round(incremental_capital_loss, 2),
                "cet1_capital_depletion_bps": cet1_depletion,
                "recommended_eara_buffer_eur": recommended_eara_buffer,
            },
            "geographic_vulnerability": geo_breakdown,
            "supervisory_action_items": [
                f"Escalate ECB SSM liquidity buffer by €{recommended_eara_buffer:,.0f} to cover potential capital flight.",
                "Enforce active relationship manager quotas in high-balance German branches (€119k mean balance).",
                "Execute preemptive product fee consolidation for 3-product holders prior to Euribor repricing.",
                "Deploy proactive EARA retention packages to the top 500 highest-value at-risk accounts.",
            ],
        }
