"""
BankSight AI — Retention Scenario Simulator
Models what-if financial trade-offs, intervention costs, and hypothetical campaign returns.
"""
from typing import Dict, Any, List
import pandas as pd
import numpy as np


def run_retention_scenario(
    scored_df: pd.DataFrame,
    review_budget: int = 1000,
    risk_threshold: float = 0.40,
    cost_per_contact: float = 45.0,
    assumed_success_rate: float = 0.20,
    annual_margin_on_balance: float = 0.02,
) -> Dict[str, Any]:
    """
    Simulates hypothetical campaign economics across conservative, baseline, and optimistic assumptions.

    Parameters:
    -----------
    scored_df : pd.DataFrame
        Scored customer data with 'Predicted_Churn_Prob' and 'Balance'.
    review_budget : int
        Maximum customers the retention team can outreach.
    risk_threshold : float
        Minimum predicted probability required to trigger outreach.
    cost_per_contact : float
        Outreach cost in EUR per customer.
    assumed_success_rate : float
        Fraction of outreach targets successfully persuaded to stay (e.g. 0.20 = 20%).
    annual_margin_on_balance : float
        Estimated annual net interest margin / value proxy rate on retained balance (e.g. 2%).
    """
    df = scored_df.copy()

    # Filter eligible targets above risk threshold
    eligible = df[df["Predicted_Churn_Prob"] >= risk_threshold].copy()
    # Prioritize eligible by predicted risk descending
    eligible = eligible.sort_values(by="Predicted_Churn_Prob", ascending=False).reset_index(drop=True)

    # Apply finite review budget
    targeted = eligible.iloc[: min(review_budget, len(eligible))]
    targeted_count = len(targeted)

    if targeted_count == 0:
        return {
            "targeted_count": 0,
            "message": "No customers meet both the risk threshold and review budget criteria.",
            "scenarios": pd.DataFrame(),
        }

    total_targeted_balance = float(targeted["Balance"].sum())
    mean_balance = float(targeted["Balance"].mean())

    # Build three scenarios: Conservative, Baseline, Optimistic
    scenario_configs = [
        {
            "Scenario": "Conservative",
            "Success_Rate": max(0.05, assumed_success_rate * 0.60),
            "Cost_Multiplier": 1.25,
            "Description": "Lower intervention responsiveness and higher contact friction.",
        },
        {
            "Scenario": "Baseline",
            "Success_Rate": assumed_success_rate,
            "Cost_Multiplier": 1.00,
            "Description": "Target user-specified operational assumptions.",
        },
        {
            "Scenario": "Optimistic",
            "Success_Rate": min(0.60, assumed_success_rate * 1.40),
            "Cost_Multiplier": 0.85,
            "Description": "High digital responsiveness and streamlined operational outreach.",
        },
    ]

    scenario_rows = []
    scenarios_dict = {}
    for sc in scenario_configs:
        succ_rate = sc["Success_Rate"]
        cost_mult = sc["Cost_Multiplier"]

        actual_cost_per_cust = cost_per_contact * cost_mult
        total_campaign_cost = targeted_count * actual_cost_per_cust

        hypothetical_retained_customers = int(round(targeted_count * succ_rate))
        hypothetical_retained_balance = total_targeted_balance * succ_rate
        hypothetical_annual_value = hypothetical_retained_balance * annual_margin_on_balance
        net_financial_outcome = hypothetical_annual_value - total_campaign_cost
        roi_ratio = (net_financial_outcome / total_campaign_cost) if total_campaign_cost > 0 else 0.0

        sc_name = sc["Scenario"]
        scenarios_dict[sc_name] = {
            "name": sc_name,
            "success_rate": round(float(succ_rate), 4),
            "campaign_cost": round(float(total_campaign_cost), 2),
            "retained_customers": hypothetical_retained_customers,
            "retained_balance": round(float(hypothetical_retained_balance), 2),
            "net_annual_profit": round(float(net_financial_outcome), 2),
            "roi": round(float(roi_ratio), 4),
            "notes": sc["Description"],
        }

        scenario_rows.append({
            "Scenario": sc_name,
            "Targeted_Customers": targeted_count,
            "Assumed_Success_Rate": f"{succ_rate*100:.1f}%",
            "Retained_Customers_Est": hypothetical_retained_customers,
            "Total_Campaign_Cost": total_campaign_cost,
            "Retained_Balance_Proxy": hypothetical_retained_balance,
            "Annual_Value_Proxy": hypothetical_annual_value,
            "Net_Simulated_Outcome": net_financial_outcome,
            "Simulated_ROI": f"{roi_ratio*100:.1f}%",
            "Notes": sc["Description"],
        })

    return {
        "targeted_count": targeted_count,
        "total_eligible_above_threshold": len(eligible),
        "total_targeted_balance": total_targeted_balance,
        "mean_targeted_balance": mean_balance,
        "scenarios": scenarios_dict,
        "scenarios_table": pd.DataFrame(scenario_rows),
        "disclaimer": (
            "NOTICE: All scenario outcomes are hypothetical simulations based on user assumptions. "
            "They do not constitute guaranteed financial returns or verified intervention causal effects."
        ),
    }
