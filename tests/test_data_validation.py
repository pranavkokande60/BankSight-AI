"""
Unit Tests for Data Validation & Quality Auditing
"""
import pytest
import pandas as pd
import numpy as np
from src.data_loader import load_dataset
from src.data_validation import DataQualityAuditor


def test_real_dataset_audit():
    df = load_dataset()
    auditor = DataQualityAuditor(df)
    report = auditor.run_full_audit()

    assert report["row_count"] == 10000
    assert report["column_count"] == 14
    assert report["total_missing_values"] == 0
    assert report["duplicate_rows"] == 0
    assert report["duplicate_customer_ids"] == 0
    assert report["status"] in ["HEALTHY", "ACCEPTABLE"]
    assert report["suitability_score"] >= 90.0

    # Ensure Year anomaly is correctly flagged as a single constant snapshot
    assert any("Temporal Field Notice" in w for w in report["warnings"])


def test_invalid_dataset_detection():
    # Construct synthetic invalid dataframe
    bad_df = pd.DataFrame({
        "CustomerId": [101, 101, 103],  # Duplicate CustomerId
        "CreditScore": [200, 700, 1100],  # Out of bounds
        "Geography": ["France", "Moon", "Spain"],  # Invalid category
        "Exited": [0, 2, 1],  # Non-binary target
        "Age": [12, 45, 150],  # Age out of range
    })
    auditor = DataQualityAuditor(bad_df)
    report = auditor.run_full_audit()

    assert report["duplicate_customer_ids"] == 1
    assert "Geography" in report["invalid_categories"]
    assert "Exited" in report["invalid_binaries"]
    assert len(report["missing_required_columns"]) > 0
    assert len(report["warnings"]) >= 3
    assert report["status"] == "REQUIRES_ATTENTION"
