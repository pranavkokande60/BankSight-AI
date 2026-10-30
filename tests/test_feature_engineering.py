"""
Unit Tests for Feature Engineering Module
"""
import pytest
import pandas as pd
import numpy as np
from src.feature_engineering import add_engineered_features


def test_feature_engineering_integrity():
    df = pd.DataFrame({
        "CreditScore": [600, 750, 400],
        "Age": [25, 42, 65],
        "Tenure": [0, 5, 10],
        "Balance": [0.0, 100000.0, 50000.0],
        "NumOfProducts": [1, 2, 4],
        "EstimatedSalary": [50000.0, 0.0, 120000.0],
        "IsActiveMember": [1, 0, 1],
    })

    eng_df = add_engineered_features(df)

    # Check that new columns exist
    expected_cols = [
        "BalanceSalaryRatio",
        "CreditScoreAgeRatio",
        "ProductPerTenure",
        "IsZeroBalance",
        "IsMultiProductRisk",
        "AgeGroup",
        "CreditScoreBand",
        "TenureGroup",
    ]
    for col in expected_cols:
        assert col in eng_df.columns, f"Missing engineered column {col}"

    # Verify zero-division safety
    assert not eng_df["BalanceSalaryRatio"].isna().any()
    assert not np.isinf(eng_df["BalanceSalaryRatio"]).any()
    assert not eng_df["ProductPerTenure"].isna().any()
    assert not np.isinf(eng_df["ProductPerTenure"]).any()

    # Verify specific value logic
    assert eng_df.loc[0, "IsZeroBalance"] == 1
    assert eng_df.loc[1, "IsZeroBalance"] == 0
    assert eng_df.loc[2, "IsMultiProductRisk"] == 1
    assert eng_df.loc[0, "AgeGroup"] == "Under 30"
    assert eng_df.loc[2, "AgeGroup"] == "60+"
