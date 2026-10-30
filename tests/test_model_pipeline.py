"""
Unit Tests for Machine Learning Pipeline & Prediction Service
"""
import pytest
import pandas as pd
import numpy as np
from src.preprocessing import prepare_train_test_split, get_feature_matrix
from src.risk_scoring import compute_multi_model_consensus, assign_risk_tier
from src.model_evaluation import evaluate_binary_classifier


@pytest.fixture
def mock_clean_dataset():
    np.random.seed(42)
    n = 300
    return pd.DataFrame({
        "CustomerId": range(1000, 1000 + n),
        "Surname": [f"User_{i}" for i in range(n)],
        "Year": [2025] * n,
        "CreditScore": np.random.randint(500, 800, n),
        "Geography": np.random.choice(["France", "Germany", "Spain"], n),
        "Gender": np.random.choice(["Male", "Female"], n),
        "Age": np.random.randint(20, 70, n),
        "Tenure": np.random.randint(0, 10, n),
        "Balance": np.random.uniform(0, 150000, n),
        "NumOfProducts": np.random.choice([1, 2, 3], n, p=[0.5, 0.4, 0.1]),
        "HasCrCard": np.random.choice([0, 1], n),
        "IsActiveMember": np.random.choice([0, 1], n),
        "EstimatedSalary": np.random.uniform(30000, 120000, n),
        "Exited": np.random.choice([0, 1], n, p=[0.8, 0.2]),
    })


def test_preprocessing_no_leakage(mock_clean_dataset):
    X_train, X_test, y_train, y_test, preprocessor, feature_names = prepare_train_test_split(
        mock_clean_dataset, test_size=0.25, random_state=42
    )

    # Assert PII and zero-variance columns dropped
    assert "CustomerId" not in feature_names
    assert "Surname" not in feature_names
    assert "Year" not in feature_names
    assert "Exited" not in feature_names

    X_train_proc = preprocessor.transform(X_train)
    X_test_proc = preprocessor.transform(X_test)

    assert X_train_proc.shape[1] == len(feature_names)
    assert X_test_proc.shape[1] == len(feature_names)


def test_multi_model_consensus():
    # Test case 1: Agreement
    preds_agree = {"LR": 0.80, "RF": 0.82, "GB": 0.79}
    cons_agree = compute_multi_model_consensus(preds_agree)
    assert not cons_agree["has_strong_disagreement"]
    assert cons_agree["risk_tier"] == "Critical Risk"

    # Test case 2: Disagreement
    preds_disagree = {"LR": 0.20, "RF": 0.75, "GB": 0.45}
    cons_disagree = compute_multi_model_consensus(preds_disagree)
    assert cons_disagree["has_strong_disagreement"]
    assert cons_disagree["spread"] == 0.55


def test_evaluate_binary_classifier():
    y_true = np.array([0, 0, 1, 1, 1])
    y_pred_proba = np.array([0.1, 0.3, 0.8, 0.65, 0.9])
    res = evaluate_binary_classifier(y_true, y_pred_proba)

    assert res["accuracy"] == 1.0
    assert res["roc_auc"] == 1.0
    assert 0.0 <= res["brier_score"] <= 1.0
