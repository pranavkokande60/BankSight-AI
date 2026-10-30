"""
BankSight AI — Risk Scoring & Multi-Model Consensus Engine
Computes calibrated risk tiers, ensemble consensus, and model disagreement flags.
"""
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
from src.config import RISK_TIERS


def assign_risk_tier(probability: float) -> str:
    """Categorizes churn probability into documented risk tiers."""
    for tier, (low, high) in RISK_TIERS.items():
        if low <= probability < high:
            return tier
    return "Critical Risk"


def compute_multi_model_consensus(
    model_predictions: Dict[str, float]
) -> Dict[str, Any]:
    """
    Evaluates multi-model consensus and flags analytical disagreement.

    Parameters:
    -----------
    model_predictions : Dict[str, float]
        Mapping of model names to predicted churn probabilities.

    Returns:
    --------
    Dict containing mean probability, spread, std dev, consensus flag, and risk tier.
    """
    probs = list(model_predictions.values())
    if not probs:
        return {
            "mean_probability": 0.0,
            "min_probability": 0.0,
            "max_probability": 0.0,
            "spread": 0.0,
            "std_dev": 0.0,
            "has_strong_disagreement": False,
            "risk_tier": "Low Risk",
        }

    p_mean = float(np.mean(probs))
    p_min = float(np.min(probs))
    p_max = float(np.max(probs))
    spread = float(p_max - p_min)
    std_dev = float(np.std(probs))

    # Flag disagreement when models diverge by more than 25 percentage points
    has_strong_disagreement = spread >= 0.25

    return {
        "mean_probability": p_mean,
        "min_probability": p_min,
        "max_probability": p_max,
        "spread": spread,
        "std_dev": std_dev,
        "has_strong_disagreement": has_strong_disagreement,
        "risk_tier": assign_risk_tier(p_mean),
        "individual_probabilities": model_predictions,
    }


def suggest_analyst_action(
    risk_tier: str,
    has_strong_disagreement: bool,
    customer_attributes: Dict[str, Any],
) -> Dict[str, str]:
    """
    Generates transparent, rule-grounded analyst review guidance.
    Does NOT make automated credit, pricing, or adverse banking decisions.
    """
    if has_strong_disagreement:
        return {
            "recommended_action": "Manual Senior Analyst Review Required",
            "rationale": "High model disagreement detected across algorithms. Statistical evidence is inconclusive; inspect raw behavioral history.",
            "urgency": "Review within 5 business days",
        }

    prods = customer_attributes.get("NumOfProducts", 1)
    is_active = customer_attributes.get("IsActiveMember", 1)
    balance = customer_attributes.get("Balance", 0.0)

    if risk_tier == "Critical Risk":
        if prods >= 3:
            return {
                "recommended_action": "Product Portfolio Rationalization Advisory",
                "rationale": "Customer holds 3+ products, which is associated with an 82%+ portfolio churn rate. Proactively offer product consolidation.",
                "urgency": "Immediate (Within 48 hours)",
            }
        elif balance > 100_000:
            return {
                "recommended_action": "Dedicated Private Banking Relationship Manager Outreach",
                "rationale": "High capital exposure (>€100k) combined with critical churn propensity.",
                "urgency": "Immediate (Within 48 hours)",
            }
        else:
            return {
                "recommended_action": "Targeted Retention Incentive & Account Review",
                "rationale": "High predicted exit probability. Review fee schedule and service touchpoints.",
                "urgency": "High (Within 3 business days)",
            }
    elif risk_tier == "High Risk":
        if is_active == 0:
            return {
                "recommended_action": "Digital Banking Re-engagement Campaign",
                "rationale": "Customer is inactive; inactivity doubles baseline churn hazard. Trigger personalized digital onboarding.",
                "urgency": "Moderate (Within 7 business days)",
            }
        else:
            return {
                "recommended_action": "Loyalty Program & Fee Waiver Consideration",
                "rationale": "Customer shows active usage but elevated churn indicators.",
                "urgency": "Moderate (Within 7 business days)",
            }
    elif risk_tier == "Moderate Risk":
        return {
            "recommended_action": "Standard Quarterly Portfolio Check-In",
            "rationale": "Moderate baseline probability; monitor next billing and transaction cycle.",
            "urgency": "Routine",
        }
    else:
        return {
            "recommended_action": "Standard Relationship Maintenance",
            "rationale": "Customer shows strong retention signals. Potential candidate for selective cross-sell.",
            "urgency": "Low / Routine",
        }
