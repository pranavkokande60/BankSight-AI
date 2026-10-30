"""
BankSight AI — Evidence-Aware Retention Allocation (EARA) Engine
Implements multi-criteria decision prioritization under configurable review budgets.
"""
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import pandas as pd


class EARAPrioritizer:
    """
    Evidence-Aware Retention Allocation (EARA) Framework.
    Ranks customers for retention interventions under finite review budgets
    by evaluating predicted risk, customer exposure proxy, and model agreement.
    """

    def __init__(
        self,
        risk_weight: float = 0.60,
        disagreement_penalty: float = 0.35,
        value_proxy_col: str = "Balance",
    ):
        r"""
        Parameters:
        -----------
        risk_weight : float (\alpha)
            Weight assigned to churn risk vs financial exposure proxy (in [0, 1]).
        disagreement_penalty : float (\lambda)
            Penalty multiplier applied when models strongly disagree.
        value_proxy_col : str
            Column used as value proxy (default 'Balance').
            Explicitly documented as an exposure proxy, NOT lifetime profitability.
        """
        self.risk_weight = max(0.0, min(1.0, risk_weight))
        self.disagreement_penalty = max(0.0, min(1.0, disagreement_penalty))
        self.value_proxy_col = value_proxy_col

    def compute_priority_scores(self, scored_df: pd.DataFrame) -> pd.DataFrame:
        r"""
        Computes three comparative ranking scores for each customer:
        1. Score_Risk_Only: P(churn)
        2. Score_Risk_Value: \alpha * P_norm + (1 - \alpha) * Value_norm
        3. Score_EARA: Score_Risk_Value * (1 - \lambda * Disagreement) * DataIntegrity
        """
        df = scored_df.copy()

        # Risk normalization
        p = df["Predicted_Churn_Prob"].values if "Predicted_Churn_Prob" in df.columns else np.zeros(len(df))
        p_min, p_max = np.min(p), np.max(p)
        p_norm = (p - p_min) / (p_max - p_min + 1e-8)

        # Exposure value proxy normalization
        val = df[self.value_proxy_col].values if self.value_proxy_col in df.columns else np.zeros(len(df))
        val_min, val_max = np.min(val), np.max(val)
        val_norm = (val - val_min) / (val_max - val_min + 1e-8)

        # Strategy 1: Risk Only
        score_risk = p_norm

        # Strategy 2: Risk + Value Proxy
        score_value = (self.risk_weight * p_norm) + ((1.0 - self.risk_weight) * val_norm)

        # Strategy 3: Evidence-Aware (EARA)
        # Measure disagreement
        spread = df["Model_Spread"].values if "Model_Spread" in df.columns else np.zeros(len(df))
        spread_norm = np.clip(spread, 0.0, 1.0)

        # Confidence factor based on absence of model disagreement
        agreement_factor = 1.0 - (self.disagreement_penalty * spread_norm)

        # Stability / Evidence factor (proxy: completeness and active engagement history)
        evidence_factor = np.ones(len(df))
        if "Tenure" in df.columns:
            # Customers with tenure < 1 yr have less historical signal
            evidence_factor = np.where(df["Tenure"] == 0, 0.88, 1.0)

        score_eara = score_value * agreement_factor * evidence_factor

        df["Score_Risk_Only"] = score_risk
        df["Score_Risk_Value"] = score_value
        df["Score_EARA"] = score_eara

        # Flag customers routed to dedicated Expert Disagreement Queue
        df["Routing_Queue"] = np.where(
            df.get("Model_Disagreement_Flag", False),
            "Disagreement / Expert Review Queue",
            "Automated / Frontline Retention Queue",
        )

        return df

    def evaluate_budget_allocation(
        self,
        scored_df: pd.DataFrame,
        review_budget: int = 500,
        strategy: str = "EARA",
    ) -> Dict[str, Any]:
        """
        Simulates deploying a retention campaign on the top B budgeted customers.
        Computes Churner Capture, Precision@B, Capital Exposure Covered, and Group Selection.
        """
        df = self.compute_priority_scores(scored_df)
        total_customers = len(df)
        budget = min(review_budget, total_customers)

        score_col_map = {
            "Risk-Only": "Score_Risk_Only",
            "Risk + Value Proxy": "Score_Risk_Value",
            "EARA": "Score_EARA",
        }
        score_col = score_col_map.get(strategy, "Score_EARA")

        # Rank customers descending
        ranked_df = df.sort_values(by=score_col, ascending=False).reset_index(drop=True)
        selected = ranked_df.iloc[:budget]
        excluded = ranked_df.iloc[budget:]

        # Metrics computation
        has_ground_truth = "Exited" in df.columns
        total_churners = int(df["Exited"].sum()) if has_ground_truth else 1
        captured_churners = int(selected["Exited"].sum()) if has_ground_truth else 0

        churner_capture_rate = captured_churners / total_churners if total_churners > 0 else 0.0
        precision_at_budget = captured_churners / budget if budget > 0 else 0.0

        total_portfolio_balance = float(df["Balance"].sum()) if "Balance" in df.columns else 1.0
        selected_balance = float(selected["Balance"].sum()) if "Balance" in selected.columns else 0.0
        balance_exposure_coverage = selected_balance / total_portfolio_balance if total_portfolio_balance > 0 else 0.0

        mean_model_spread = float(selected["Model_Spread"].mean()) if "Model_Spread" in selected.columns else 0.0
        disagreement_count = int(selected["Model_Disagreement_Flag"].sum()) if "Model_Disagreement_Flag" in selected.columns else 0

        # Demographic selection fairness audit under this budget
        group_selection_rates = {}
        for demo_col in ["Geography", "Gender"]:
            if demo_col in df.columns:
                rates = {}
                for val, grp in df.groupby(demo_col):
                    n_group = len(grp)
                    n_sel = len(selected[selected[demo_col] == val])
                    rates[str(val)] = {
                        "group_size": n_group,
                        "selected_count": n_sel,
                        "selection_rate": n_sel / n_group if n_group > 0 else 0.0,
                    }
                group_selection_rates[demo_col] = rates

        return {
            "strategy": strategy,
            "review_budget": budget,
            "budget_share_pct": (budget / total_customers) * 100,
            "captured_churners": captured_churners,
            "churner_capture_rate": churner_capture_rate,
            "precision_at_budget": precision_at_budget,
            "selected_balance_exposure": selected_balance,
            "balance_exposure_coverage": balance_exposure_coverage,
            "mean_model_spread": mean_model_spread,
            "high_disagreement_selected": disagreement_count,
            "group_selection_rates": group_selection_rates,
            "selected_customers_preview": selected.head(50),
        }

    def compare_all_strategies(
        self, scored_df: pd.DataFrame, review_budget: int = 500
    ) -> pd.DataFrame:
        """Compares Risk-Only, Risk+Value, and EARA head-to-head at a given review budget."""
        results = []
        for strat in ["Risk-Only", "Risk + Value Proxy", "EARA"]:
            res = self.evaluate_budget_allocation(scored_df, review_budget=review_budget, strategy=strat)
            results.append({
                "Strategy": strat,
                "Budget (Customers)": res["review_budget"],
                "Churners Captured": res["captured_churners"],
                "Capture Rate (Recall@B)": f"{res['churner_capture_rate']*100:.2f}%",
                "Precision@B": f"{res['precision_at_budget']*100:.2f}%",
                "Balance Exposure Covered": f"€{res['selected_balance_exposure']:,.0f} ({res['balance_exposure_coverage']*100:.1f}%)",
                "Mean Model Spread": f"{res['mean_model_spread']:.3f}",
                "Disagreement Cases Flagged": res["high_disagreement_selected"],
            })
        return pd.DataFrame(results)
