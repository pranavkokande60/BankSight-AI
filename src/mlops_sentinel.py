"""
Retain360 / BankSight AI — Continuous MLOps & Population Stability Index (PSI) Sentinel
========================================================================================
Module: src/mlops_sentinel.py
Author: Principal Financial Data Scientist & Lead AI Engineer

Implements automated model governance and distribution drift monitoring:
1. Population Stability Index (PSI):
   PSI = sum (Actual_% - Expected_%) * ln(Actual_% / Expected_%)
2. Regulatory drift classification:
   - PSI < 0.10: Stable / Green (No action required)
   - 0.10 <= PSI < 0.25: Moderate Shift / Amber (Increased monitoring frequency)
   - PSI >= 0.25: Critical Drift / Red (Automated model retraining mandated)
3. Feature-level and prediction-level drift tracking across macro cycles.
"""
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd


class PSISentinel:
    """
    Automated Population Stability Index (PSI) drift monitoring engine.
    """

    @staticmethod
    def calculate_single_feature_psi(
        expected: np.ndarray,
        actual: np.ndarray,
        num_buckets: int = 10,
        epsilon: float = 1e-4,
    ) -> Dict[str, Any]:
        """
        Calculates Population Stability Index between reference (expected) and current (actual) feature distributions.
        """
        expected = np.asarray(expected, dtype=float)
        actual = np.asarray(actual, dtype=float)

        expected = expected[~np.isnan(expected)]
        actual = actual[~np.isnan(actual)]

        if len(expected) == 0 or len(actual) == 0:
            return {"psi": 0.0, "status": "STABLE", "bucket_details": []}

        # Determine bucket cutoffs based on expected distribution quantiles
        quantiles = np.linspace(0, 100, num_buckets + 1)
        try:
            cutoffs = np.percentile(expected, quantiles)
            cutoffs = np.unique(cutoffs)
            if len(cutoffs) < 2:
                cutoffs = np.array([np.min(expected) - 1e-5, np.max(expected) + 1e-5])
        except Exception:
            cutoffs = np.linspace(np.min(expected), np.max(expected), num_buckets + 1)

        cutoffs[0] = -np.inf
        cutoffs[-1] = np.inf

        n_exp = len(expected)
        n_act = len(actual)

        psi_total = 0.0
        buckets = []

        for b in range(len(cutoffs) - 1):
            low = cutoffs[b]
            high = cutoffs[b + 1]

            cnt_exp = np.sum((expected > low) & (expected <= high))
            cnt_act = np.sum((actual > low) & (actual <= high))

            pct_exp = max(cnt_exp / n_exp, epsilon)
            pct_act = max(cnt_act / n_act, epsilon)

            bucket_psi = (pct_act - pct_exp) * np.log(pct_act / pct_exp)
            psi_total += bucket_psi

            buckets.append({
                "bucket": b + 1,
                "range": f"({low:.1f}, {high:.1f}]",
                "expected_pct": round(pct_exp * 100, 2),
                "actual_pct": round(pct_act * 100, 2),
                "bucket_psi": round(float(bucket_psi), 4),
            })

        psi_val = round(float(psi_total), 4)

        if psi_val < 0.10:
            status = "STABLE"
            badge = "Green (Within Tolerance)"
            directive = "Feature distribution stable. Champion models maintain regulatory validity."
        elif psi_val < 0.25:
            status = "MODERATE_DRIFT"
            badge = "Amber (Moderate Shift)"
            directive = "Noticeable distribution shift detected. Increase monitoring cadence and verify calibration."
        else:
            status = "CRITICAL_DRIFT"
            badge = "Red (Critical Drift)"
            directive = "Severe distribution divergence. Automated retraining pipeline mandated under Basel III MRM."

        return {
            "psi": psi_val,
            "status": status,
            "badge": badge,
            "directive": directive,
            "bucket_details": buckets,
        }

    @classmethod
    def audit_portfolio_drift(
        cls,
        baseline_df: pd.DataFrame,
        current_df: pd.DataFrame,
        features_to_monitor: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Executes comprehensive multi-feature drift audit between reference and current portfolio batches.
        """
        if features_to_monitor is None:
            features_to_monitor = [
                "Balance",
                "CreditScore",
                "Age",
                "NumOfProducts",
                "EstimatedSalary",
                "Predicted_Churn_Prob",
            ]

        feature_reports = {}
        max_psi = 0.0
        critical_count = 0
        moderate_count = 0

        for col in features_to_monitor:
            if col in baseline_df.columns and col in current_df.columns:
                res = cls.calculate_single_feature_psi(baseline_df[col].values, current_df[col].values)
                feature_reports[col] = res
                max_psi = max(max_psi, res["psi"])
                if res["status"] == "CRITICAL_DRIFT":
                    critical_count += 1
                elif res["status"] == "MODERATE_DRIFT":
                    moderate_count += 1

        overall_status = "STABLE"
        if critical_count > 0 or max_psi >= 0.25:
            overall_status = "CRITICAL_DRIFT"
        elif moderate_count > 0 or max_psi >= 0.10:
            overall_status = "MODERATE_DRIFT"

        return {
            "overall_status": overall_status,
            "maximum_psi": max_psi,
            "critical_features_count": critical_count,
            "moderate_features_count": moderate_count,
            "monitored_feature_count": len(feature_reports),
            "feature_reports": feature_reports,
            "mlops_governance_verdict": (
                "ALL CLEAR: Baseline feature distributions match production."
                if overall_status == "STABLE"
                else (
                    "WARNING: Distributional drift in key features. Model recalibration advised."
                    if overall_status == "MODERATE_DRIFT"
                    else "EMERGENCY: Model drift breached Basel III threshold (PSI >= 0.25). Immediate retraining required."
                )
            ),
        }
