"""
BankSight AI — Automated Test Suite: Customer Management Module
=============================================================
Comprehensive unit and integration testing covering:
1. Field validation rules & business constraints
2. Duplicate Customer ID prevention (SQLite & base CSV)
3. SQLite persistence and data integrity
4. Strict NULL isolation for observed 'Exited' label
5. Customer search, retrieval, and status lifecycle transitions
6. Profile editing and validation safeguards
7. Instant ML scoring pipeline and prediction audit logging
8. Edge cases: Empty database, missing model artifacts, and model disagreement flags
"""
import pytest
import sqlite3
import tempfile
from pathlib import Path
from datetime import datetime

from src.customer_db import (
    init_customer_db,
    generate_unique_customer_id,
    validate_customer_payload,
    add_customer,
    get_customer,
    update_customer,
    set_customer_status,
    search_customers,
    get_customer_count,
    record_prediction,
    get_prediction_history,
    score_registered_customer,
)
from src.config import DEFAULT_DATA_PATH


@pytest.fixture
def temp_db(tmp_path):
    """Provides a fresh isolated SQLite database for each test."""
    db_file = tmp_path / "test_customers.db"
    init_customer_db(db_file)
    return db_file


def test_empty_database_and_id_generation(temp_db):
    """Verifies behavior on an empty database and auto-ID generation."""
    assert get_customer_count(db_path=temp_db) == 0
    results = search_customers(db_path=temp_db)
    assert len(results) == 0

    next_id = generate_unique_customer_id(db_path=temp_db)
    assert isinstance(next_id, int)
    assert next_id >= 15820000


def test_field_validation_rules(temp_db):
    """Tests all schema constraints and boundary validation rules."""
    base_valid = {
        "customer_id": 16000001,
        "surname": "Dupont",
        "credit_score": 680,
        "geography": "France",
        "gender": "Female",
        "age": 35,
        "tenure": 5,
        "balance": 50000.0,
        "num_of_products": 2,
        "has_cr_card": 1,
        "is_active_member": 1,
        "estimated_salary": 70000.0,
    }

    # 1. Valid payload passes
    is_valid, errors = validate_customer_payload(base_valid, db_path=temp_db)
    assert is_valid is True
    assert len(errors) == 0

    # 2. Credit score out of range
    inv_cs = dict(base_valid, credit_score=250)
    is_valid, errors = validate_customer_payload(inv_cs, db_path=temp_db)
    assert is_valid is False
    assert any("Credit Score" in e for e in errors)

    inv_cs_high = dict(base_valid, credit_score=900)
    is_valid, errors = validate_customer_payload(inv_cs_high, db_path=temp_db)
    assert is_valid is False

    # 3. Invalid Geography
    inv_geo = dict(base_valid, geography="United States")
    is_valid, errors = validate_customer_payload(inv_geo, db_path=temp_db)
    assert is_valid is False
    assert any("Geography" in e for e in errors)

    # 4. Invalid Gender
    inv_gen = dict(base_valid, gender="Other")
    is_valid, errors = validate_customer_payload(inv_gen, db_path=temp_db)
    assert is_valid is False
    assert any("Gender" in e for e in errors)

    # 5. Invalid Age
    inv_age_low = dict(base_valid, age=16)
    is_valid, errors = validate_customer_payload(inv_age_low, db_path=temp_db)
    assert is_valid is False

    inv_age_high = dict(base_valid, age=120)
    is_valid, errors = validate_customer_payload(inv_age_high, db_path=temp_db)
    assert is_valid is False

    # 6. Negative Financials
    inv_bal = dict(base_valid, balance=-100.0)
    is_valid, errors = validate_customer_payload(inv_bal, db_path=temp_db)
    assert is_valid is False

    inv_sal = dict(base_valid, estimated_salary=-500.0)
    is_valid, errors = validate_customer_payload(inv_sal, db_path=temp_db)
    assert is_valid is False

    # 7. Invalid Products
    inv_prod = dict(base_valid, num_of_products=5)
    is_valid, errors = validate_customer_payload(inv_prod, db_path=temp_db)
    assert is_valid is False


def test_observed_exited_label_rejection_for_new_customers(temp_db):
    """
    CRITICAL REQUIREMENT:
    Verifies that supplying an observed 'Exited' label on customer registration is rejected.
    New customers have unknown outcomes; exited must be strictly NULL.
    """
    payload_with_exited = {
        "customer_id": 16000002,
        "surname": "Schmidt",
        "credit_score": 710,
        "geography": "Germany",
        "gender": "Male",
        "age": 42,
        "tenure": 4,
        "balance": 82000.0,
        "num_of_products": 1,
        "has_cr_card": 1,
        "is_active_member": 0,
        "estimated_salary": 95000.0,
        "exited": 1,  # Attempting to assign observed churn outcome
    }

    is_valid, errors = validate_customer_payload(payload_with_exited, db_path=temp_db)
    assert is_valid is False
    assert any("Exited" in e for e in errors)

    # Attempting to add_customer must raise ValueError
    with pytest.raises(ValueError, match="Exited"):
        add_customer(payload_with_exited, db_path=temp_db)


def test_duplicate_prevention(temp_db):
    """Verifies that duplicate customer IDs are strictly rejected in SQLite and historical records."""
    valid_customer = {
        "customer_id": 16000010,
        "surname": "Garcia",
        "credit_score": 620,
        "geography": "Spain",
        "gender": "Female",
        "age": 29,
        "tenure": 2,
        "balance": 35000.0,
        "num_of_products": 1,
        "has_cr_card": 1,
        "is_active_member": 1,
        "estimated_salary": 45000.0,
    }

    # First insertion succeeds
    saved = add_customer(valid_customer, db_path=temp_db)
    assert saved["customer_id"] == 16000010

    # Second insertion with same ID must fail
    with pytest.raises(ValueError, match="already exists"):
        add_customer(valid_customer, db_path=temp_db)

    # Historical base CSV customer ID (e.g. 15634602) must also be blocked
    historical_collision = dict(valid_customer, customer_id=15634602)
    with pytest.raises(ValueError, match="already exists"):
        add_customer(historical_collision, db_path=temp_db)


def test_database_persistence_and_csv_preservation(temp_db):
    """Verifies persistent storage in SQLite and guarantees original CSV is untouched."""
    # Record initial CSV stats if CSV exists
    csv_mtime_before = DEFAULT_DATA_PATH.stat().st_mtime if DEFAULT_DATA_PATH.exists() else None
    csv_size_before = DEFAULT_DATA_PATH.stat().st_size if DEFAULT_DATA_PATH.exists() else None

    cust_data = {
        "customer_id": 16000020,
        "surname": "Lefebvre",
        "credit_score": 750,
        "geography": "France",
        "gender": "Male",
        "age": 51,
        "tenure": 8,
        "balance": 115200.50,
        "num_of_products": 2,
        "has_cr_card": 1,
        "is_active_member": 0,
        "estimated_salary": 88000.00,
    }

    created = add_customer(cust_data, db_path=temp_db)
    assert created is not None
    assert created["customer_id"] == 16000020
    assert created["surname"] == "Lefebvre"
    assert created["balance"] == 115200.50
    assert created["record_status"] == "ACTIVE"
    # STRICT ASSERTION: exited must be None (NULL in SQLite)
    assert created["exited"] is None

    # Retrieve directly from database connection
    fetched = get_customer(16000020, db_path=temp_db)
    assert fetched == created

    # Guarantee CSV was not modified or overwritten
    if DEFAULT_DATA_PATH.exists():
        assert DEFAULT_DATA_PATH.stat().st_mtime == csv_mtime_before
        assert DEFAULT_DATA_PATH.stat().st_size == csv_size_before


def test_customer_search_and_filtering(temp_db):
    """Tests search by ID, Surname, and status filtering."""
    c1 = {
        "customer_id": 16000031,
        "surname": "Muller",
        "credit_score": 640,
        "geography": "Germany",
        "gender": "Male",
        "age": 45,
        "tenure": 3,
        "balance": 60000.0,
        "num_of_products": 1,
        "has_cr_card": 1,
        "is_active_member": 1,
        "estimated_salary": 55000.0,
    }
    c2 = {
        "customer_id": 16000032,
        "surname": "Muller-Junior",
        "credit_score": 590,
        "geography": "Germany",
        "gender": "Female",
        "age": 22,
        "tenure": 1,
        "balance": 15000.0,
        "num_of_products": 2,
        "has_cr_card": 0,
        "is_active_member": 0,
        "estimated_salary": 32000.0,
    }
    add_customer(c1, db_path=temp_db)
    add_customer(c2, db_path=temp_db)

    # Search by surname substring
    res = search_customers(query="muller", db_path=temp_db)
    assert len(res) >= 2

    # Search by exact ID
    res_id = search_customers(query="16000031", db_path=temp_db)
    assert len(res_id) == 1
    assert res_id[0]["customer_id"] == 16000031

    # Filter by status
    set_customer_status(16000032, "ARCHIVED", db_path=temp_db)
    active_res = search_customers(status="ACTIVE", db_path=temp_db)
    assert any(c["customer_id"] == 16000031 for c in active_res)
    assert not any(c["customer_id"] == 16000032 for c in active_res)

    archived_res = search_customers(status="ARCHIVED", db_path=temp_db)
    assert any(c["customer_id"] == 16000032 for c in archived_res)


def test_customer_editing_and_lifecycle(temp_db):
    """Tests updating fields, validation during updates, and preventing ID mutation."""
    initial = {
        "customer_id": 16000040,
        "surname": "InitialName",
        "credit_score": 600,
        "geography": "France",
        "gender": "Female",
        "age": 30,
        "tenure": 2,
        "balance": 10000.0,
        "num_of_products": 1,
        "has_cr_card": 1,
        "is_active_member": 1,
        "estimated_salary": 40000.0,
    }
    add_customer(initial, db_path=temp_db)

    # Valid update
    updated = update_customer(
        16000040,
        {"balance": 25000.0, "num_of_products": 2, "is_active_member": 0},
        db_path=temp_db,
    )
    assert updated["balance"] == 25000.0
    assert updated["num_of_products"] == 2
    assert updated["is_active_member"] == 0
    assert updated["exited"] is None  # Remains strictly None

    # Invalid update (invalid credit score)
    with pytest.raises(ValueError, match="Credit Score"):
        update_customer(16000040, {"credit_score": 150}, db_path=temp_db)

    # Attempt to change Customer ID must fail
    with pytest.raises(ValueError, match="Changing Customer ID is not permitted"):
        update_customer(16000040, {"customer_id": 99999999}, db_path=temp_db)


def test_instant_ml_scoring_and_audit_history(temp_db):
    """
    Verifies that running ML prediction on a registered customer produces
    calibrated probabilities, risk tier, SHAP attributions, persona, and logs to history.
    """
    cust = {
        "customer_id": 16000050,
        "surname": "Bauer",
        "credit_score": 660,
        "geography": "Germany",
        "gender": "Male",
        "age": 48,
        "tenure": 6,
        "balance": 92000.0,
        "num_of_products": 3,
        "has_cr_card": 1,
        "is_active_member": 0,
        "estimated_salary": 85000.0,
    }
    add_customer(cust, db_path=temp_db)

    # Score customer
    score_res = score_registered_customer(16000050, db_path=temp_db, save_to_history=True)

    assert "predicted_churn_prob" in score_res
    assert 0.0 <= score_res["predicted_churn_prob"] <= 1.0
    assert score_res["risk_tier"] in ["Low Risk", "Moderate Risk", "High Risk", "Critical Risk"]
    assert "model_name" in score_res
    assert "model_version" in score_res
    assert "shap_attributions" in score_res
    assert "cluster_name" in score_res
    assert score_res["observed_exited_status"] == "UNKNOWN (New Registered Customer)"

    # Verify prediction history
    history = get_prediction_history(16000050, db_path=temp_db)
    assert len(history) == 1
    h_entry = history[0]
    assert h_entry["customer_id"] == 16000050
    assert h_entry["predicted_churn_prob"] == score_res["predicted_churn_prob"]
    assert h_entry["risk_tier"] == score_res["risk_tier"]
    assert "scored_at" in h_entry
    assert len(h_entry["features_snapshot"]) > 0


def test_missing_model_artifacts_handling(temp_db, monkeypatch):
    """
    Verifies that if model artifacts are missing, the system gracefully
    raises FileNotFoundError and NEVER fabricates a placeholder probability.
    """
    cust = {
        "customer_id": 16000060,
        "surname": "NoModelCust",
        "credit_score": 700,
        "geography": "France",
        "gender": "Female",
        "age": 34,
        "tenure": 3,
        "balance": 40000.0,
        "num_of_products": 1,
        "has_cr_card": 1,
        "is_active_member": 1,
        "estimated_salary": 60000.0,
    }
    add_customer(cust, db_path=temp_db)

    # Point MODEL_ARTIFACTS_PATH to a non-existent file
    from src import config
    monkeypatch.setattr(config, "MODEL_ARTIFACTS_PATH", Path("models/non_existent_artifacts.joblib"))

    with pytest.raises(FileNotFoundError, match="Trained model artifacts not found"):
        score_registered_customer(16000060, db_path=temp_db)
