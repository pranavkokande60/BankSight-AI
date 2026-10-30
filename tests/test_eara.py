"""
Unit Tests for Evidence-Aware Retention Allocation (EARA) Framework
"""
import pytest
import pandas as pd
import numpy as np
from src.eara import EARAPrioritizer


@pytest.fixture
def mock_scored_customers():
    return pd.DataFrame({
        "CustomerId": [1, 2, 3, 4],
        "Balance": [10000.0, 150000.0, 80000.0, 200000.0],
        "Predicted_Churn_Prob": [0.90, 0.40, 0.85, 0.80],
        "Model_Spread": [0.05, 0.45, 0.08, 0.35],
        "Model_Disagreement_Flag": [False, True, False, True],
        "Tenure": [5, 1, 8, 0],
        "Geography": ["France", "Germany", "France", "Spain"],
        "Gender": ["Female", "Male", "Female", "Male"],
        "Exited": [1, 0, 1, 1],
    })


def test_eara_hand_checkable_scores(mock_scored_customers):
    prioritizer = EARAPrioritizer(risk_weight=0.5, disagreement_penalty=0.5)
    scored = prioritizer.compute_priority_scores(mock_scored_customers)

    assert "Score_Risk_Only" in scored.columns
    assert "Score_Risk_Value" in scored.columns
    assert "Score_EARA" in scored.columns

    # Customer 1: Highest risk (0.90), low disagreement (spread 0.05) -> high EARA score
    # Customer 4: High risk (0.80), high balance (200k), but high disagreement (0.35) and 0 tenure -> penalized
    assert scored.loc[scored["CustomerId"] == 1, "Score_EARA"].iloc[0] > 0.0
    assert scored.loc[scored["CustomerId"] == 2, "Routing_Queue"].iloc[0] == "Disagreement / Expert Review Queue"


def test_budget_allocation_constraints(mock_scored_customers):
    prioritizer = EARAPrioritizer()
    alloc_2 = prioritizer.evaluate_budget_allocation(mock_scored_customers, review_budget=2, strategy="EARA")

    assert alloc_2["review_budget"] == 2
    assert len(alloc_2["selected_customers_preview"]) == 2
    assert 0.0 <= alloc_2["churner_capture_rate"] <= 1.0
    assert 0.0 <= alloc_2["precision_at_budget"] <= 1.0


def test_strategy_comparison_output(mock_scored_customers):
    prioritizer = EARAPrioritizer()
    comp_df = prioritizer.compare_all_strategies(mock_scored_customers, review_budget=2)

    assert len(comp_df) == 3
    assert "Strategy" in comp_df.columns
    assert "Capture Rate (Recall@B)" in comp_df.columns
