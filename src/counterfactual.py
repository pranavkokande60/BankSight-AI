"""
BankSight AI — Counterfactual Actionable Recourse Engine (XAI 2.0)
Calculates minimum actionable behavioral adjustments to reverse customer churn risk.
"""
from typing import Dict, Any, List, Optional
import copy
import pandas as pd
import numpy as np

from src.prediction_service import PredictionService


class CounterfactualRecourseEngine:
    """
    Computes minimum actionable feature perturbations to transition an at-risk customer
    into the safe retention zone (predicted probability <= target_threshold).
    """

    def __init__(self, artifacts: Dict[str, Any], target_threshold: float = 0.25):
        self.artifacts = artifacts
        self.target_threshold = target_threshold
        self.model = artifacts["trained_models"][artifacts["best_model_name"]]
        self.preprocessor = artifacts["preprocessor"]

    def compute_recourse(self, customer_row: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates plausible actionable levers:
        1. IsActiveMember: 0 -> 1 (Digital Engagement / Relationship Manager Contact)
        2. NumOfProducts: 3/4 -> 2 (Product Consolidation / Fee Restructure)
        3. Balance: Retention Deposit Incentive / Tier Optimization (+€5k, +€10k, or rebalancing)
        4. CreditScore: Loyalty credit enhancement (+20, +40 pts via credit builder)
        """
        orig_df = pd.DataFrame([customer_row])
        orig_scored = PredictionService.score_batch(orig_df, artifacts=self.artifacts).iloc[0]
        orig_prob = float(orig_scored["Predicted_Churn_Prob"])

        # If already low risk, no urgent recourse needed
        if orig_prob <= self.target_threshold:
            return {
                "original_prob": round(orig_prob, 4),
                "target_threshold": self.target_threshold,
                "recourse_needed": False,
                "achieved_prob": round(orig_prob, 4),
                "actions": ["Customer is already in the optimal retention zone (Risk <= 25%)."],
                "recommendation_summary": "Maintain standard automated relationship monitoring.",
                "counterfactual_profile": customer_row,
            }

        best_candidate = None
        best_prob = orig_prob
        best_actions = []

        # Candidate perturbation permutations
        candidate_plans = []

        # Plan 1: Activate Member (Engagement intervention)
        if customer_row.get("IsActiveMember", 0) == 0:
            c = copy.deepcopy(customer_row)
            c["IsActiveMember"] = 1
            candidate_plans.append((c, ["Engage customer through designated relationship manager to restore active membership status."]))

        # Plan 2: Product Consolidation (Addressing the 3+ product cliff)
        if customer_row.get("NumOfProducts", 1) >= 3:
            c = copy.deepcopy(customer_row)
            c["NumOfProducts"] = 2
            candidate_plans.append((c, ["Consolidate product bundle from 3+ products down to 2 optimized core banking products with fee waivers."]))

        # Plan 3: Combined Activation + Product Consolidation
        if customer_row.get("IsActiveMember", 0) == 0 and customer_row.get("NumOfProducts", 1) >= 3:
            c = copy.deepcopy(customer_row)
            c["IsActiveMember"] = 1
            c["NumOfProducts"] = 2
            candidate_plans.append((c, [
                "Restore active membership via proactive outreach.",
                "Streamline and consolidate product holdings to 2 core products."
            ]))

        # Plan 4: Activation + High-Yield Deposit Incentive (+€10,000 preferential tier)
        if customer_row.get("IsActiveMember", 0) == 0:
            c = copy.deepcopy(customer_row)
            c["IsActiveMember"] = 1
            c["Balance"] = float(c.get("Balance", 0.0)) + 10000.0
            candidate_plans.append((c, [
                "Restore active membership status.",
                "Offer a preferential European Central Bank deposit rate tier (+€10k balance incentive)."
            ]))

        # Plan 5: Comprehensive White-Glove Retention Package
        c_full = copy.deepcopy(customer_row)
        c_full["IsActiveMember"] = 1
        if c_full.get("NumOfProducts", 1) >= 3:
            c_full["NumOfProducts"] = 2
        c_full["CreditScore"] = min(850, int(c_full.get("CreditScore", 650)) + 30)
        candidate_plans.append((c_full, [
            "Assign dedicated private wealth advisor (Active status).",
            "Restructure accounts to eliminate 3+ product holding cliff friction.",
            "Enroll customer in priority credit-builder loyalty tier (+30 CreditScore proxy)."
        ]))

        # Test each candidate plan through the calibrated model
        for cand_profile, actions in candidate_plans:
            cand_df = pd.DataFrame([cand_profile])
            scored_cand = PredictionService.score_batch(cand_df, artifacts=self.artifacts).iloc[0]
            cand_prob = float(scored_cand["Predicted_Churn_Prob"])

            if cand_prob < best_prob:
                best_prob = cand_prob
                best_candidate = cand_profile
                best_actions = actions

            if cand_prob <= self.target_threshold:
                # Target achieved
                break

        risk_reduction = orig_prob - best_prob
        return {
            "original_prob": round(orig_prob, 4),
            "achieved_prob": round(best_prob, 4),
            "target_threshold": self.target_threshold,
            "recourse_needed": True,
            "risk_reduction_pct": round(risk_reduction * 100, 2),
            "is_target_met": (best_prob <= self.target_threshold),
            "actions": best_actions if best_actions else ["Execute standard retention outreach."],
            "recommendation_summary": f"Implementing this recourse plan reduces churn probability by {risk_reduction * 100:.1f} percentage points.",
            "counterfactual_profile": best_candidate if best_candidate else customer_row,
        }
