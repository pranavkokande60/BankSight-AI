"""
Retain360 / BankSight AI — Continuous MLOps & PSI Sentinel API Router
====================================================================
Module: backend/app/routes/drift.py
Author: Principal Financial Data Scientist & Lead AI Engineer

Provides endpoints for:
1. Population Stability Index (PSI) drift monitoring across feature distributions
2. Automated Basel III Model Risk Management (MRM) alert triggers
"""
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Query
import numpy as np
import pandas as pd

from backend.app.database import get_scored_portfolio_df
from src.mlops_sentinel import PSISentinel

router = APIRouter(prefix="/mlops", tags=["Continuous MLOps & PSI Sentinel"])


@router.get("/psi-drift")
def get_portfolio_drift_audit(
    simulated_euribor_shift: float = Query(0.0, ge=-2.0, le=4.0),
    simulated_deposit_shock_pct: float = Query(0.0, ge=-30.0, le=30.0),
):
    """
    Computes Population Stability Index (PSI) between baseline training data and
    current/stressed production distribution.
    """
    df = get_scored_portfolio_df().copy()

    # Create reference baseline (unperturbed historical distribution)
    baseline_df = df.copy()

    # Create current monitored batch with optional simulated macro drift
    current_df = df.copy()
    if simulated_deposit_shock_pct != 0.0:
        current_df["Balance"] = np.maximum(0, current_df["Balance"] * (1.0 + (simulated_deposit_shock_pct / 100.0)))
    if simulated_euribor_shift != 0.0:
        # High Euribor induces balance drawdown in non-wealth and shifts churn distribution upward
        current_df["Predicted_Churn_Prob"] = np.clip(
            current_df["Predicted_Churn_Prob"] * (1.0 + simulated_euribor_shift * 0.12), 0.01, 0.99
        )

    drift_report = PSISentinel.audit_portfolio_drift(baseline_df, current_df)
    return drift_report
