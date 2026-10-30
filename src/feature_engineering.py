"""
BankSight AI — Feature Engineering Module
Transforms raw banking data into domain-specific behavioral and risk features.
"""
import pandas as pd
import numpy as np


def add_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes domain-specific financial and behavioral indicators.
    Pure transformation, safe for both training and inference without target leakage.
    """
    df = df.copy()

    # 1. Balance to Salary ratio (Financial exposure relative to earnings)
    if "Balance" in df.columns and "EstimatedSalary" in df.columns:
        df["BalanceSalaryRatio"] = df["Balance"] / (df["EstimatedSalary"] + 1.0)

    # 2. Credit Score to Age ratio (Financial maturity proxy)
    if "CreditScore" in df.columns and "Age" in df.columns:
        df["CreditScoreAgeRatio"] = df["CreditScore"] / (df["Age"] + 1.0)

    # 3. Product density relative to tenure (Velocity of adoption)
    if "NumOfProducts" in df.columns and "Tenure" in df.columns:
        df["ProductPerTenure"] = df["NumOfProducts"] / (df["Tenure"] + 1.0)

    # 4. Zero balance indicator (France/Spain phenomenon)
    if "Balance" in df.columns:
        df["IsZeroBalance"] = (df["Balance"] == 0.0).astype(int)

    # 5. Multi-product anomaly flag (Observed 82%+ churn risk for 3+ products)
    if "NumOfProducts" in df.columns:
        df["IsMultiProductRisk"] = (df["NumOfProducts"] >= 3).astype(int)

    # 6. Standardized Age Cohorts (Under 30, 30-45, 46-59, 60+)
    if "Age" in df.columns:
        df["AgeGroup"] = pd.cut(
            df["Age"],
            bins=[0, 29, 45, 59, 120],
            labels=["Under 30", "30–45", "46–59", "60+"],
            right=True,
        ).astype(str)

    # 7. Credit Score Bands (FICO standard ranges)
    if "CreditScore" in df.columns:
        df["CreditScoreBand"] = pd.cut(
            df["CreditScore"],
            bins=[0, 579, 669, 739, 799, 1000],
            labels=["Poor (<580)", "Fair (580-669)", "Good (670-739)", "Very Good (740-799)", "Exceptional (800+)"],
            right=True,
        ).astype(str)

    # 8. Tenure Groups
    if "Tenure" in df.columns:
        df["TenureGroup"] = pd.cut(
            df["Tenure"],
            bins=[-1, 2, 6, 20],
            labels=["New (0–2 yrs)", "Established (3–6 yrs)", "Veteran (7–10 yrs)"],
            right=True,
        ).astype(str)

    # 9. Balance Exposure Tiers
    if "Balance" in df.columns:
        df["BalanceTier"] = pd.cut(
            df["Balance"],
            bins=[-1, 1.0, 50_000, 100_000, 150_000, 1_000_000],
            labels=["Zero Balance", "Low (<€50k)", "Medium (€50k-€100k)", "High (€100k-€150k)", "Affluent (>€150k)"],
            right=True,
        ).astype(str)

    return df
