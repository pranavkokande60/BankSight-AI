"""
BankSight AI — Persistent Customer Database & Lifecycle Management Module
========================================================================
Provides a hardened SQLite storage engine for newly registered banking customers,
field validation rules, duplicate prevention, and historical ML prediction audit trails.

Core Principles:
1. Strict Parameterized SQL: Prevents SQL injection across all queries.
2. Dataset Integrity: Preserves the original training CSV (European_Bank.csv) untouched.
3. Churn Separation: The 'Exited' field is strictly NULL for newly registered customers,
   representing an unobserved future outcome. Model predictions are NEVER stored as actual labels.
4. Auditability: All predictions are traceable to the model version, timestamps, and input snapshot.
"""
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
from datetime import datetime, timezone
import sqlite3
import json
import logging
import pandas as pd

from src.config import CUSTOMER_DB_PATH, DEFAULT_DATA_PATH

logger = logging.getLogger("BankSight.CustomerDB")

VALID_GEOGRAPHIES = {"France", "Germany", "Spain"}
VALID_GENDERS = {"Female", "Male"}
VALID_STATUSES = {"ACTIVE", "INACTIVE", "ARCHIVED"}


def get_db_path(db_path: Optional[Path] = None) -> Path:
    """Returns database path, defaulting to configured CUSTOMER_DB_PATH."""
    p = db_path if db_path is not None else CUSTOMER_DB_PATH
    p.parent.mkdir(parents=True, exist_ok=True)
    return p


def get_db_connection(db_path: Optional[Path] = None) -> sqlite3.Connection:
    """Creates a configured SQLite connection with row factory and foreign keys enabled."""
    conn = sqlite3.connect(str(get_db_path(db_path)), timeout=10.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_customer_db(db_path: Optional[Path] = None) -> Path:
    """
    Initializes customer and prediction history tables with appropriate indices.
    Safe to call idempotently.
    """
    target_path = get_db_path(db_path)
    with get_db_connection(target_path) as conn:
        cursor = conn.cursor()
        # 1. Customers Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS customers (
                customer_id INTEGER PRIMARY KEY,
                surname TEXT,
                credit_score INTEGER NOT NULL,
                geography TEXT NOT NULL,
                gender TEXT NOT NULL,
                age INTEGER NOT NULL,
                tenure INTEGER NOT NULL,
                balance REAL NOT NULL,
                num_of_products INTEGER NOT NULL,
                has_cr_card INTEGER NOT NULL,
                is_active_member INTEGER NOT NULL,
                estimated_salary REAL NOT NULL,
                exited INTEGER DEFAULT NULL,
                record_status TEXT NOT NULL DEFAULT 'ACTIVE',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            """
        )

        # 2. Prediction History Audit Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS customer_predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER NOT NULL,
                predicted_churn_prob REAL NOT NULL,
                risk_tier TEXT NOT NULL,
                model_name TEXT NOT NULL,
                model_version TEXT NOT NULL,
                model_spread REAL NOT NULL,
                has_disagreement INTEGER NOT NULL,
                cluster_id INTEGER DEFAULT NULL,
                cluster_name TEXT DEFAULT NULL,
                shap_summary_json TEXT DEFAULT NULL,
                features_snapshot_json TEXT NOT NULL,
                scored_at TEXT NOT NULL,
                FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
            );
            """
        )

        # 3. Indices
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(record_status);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_customers_surname ON customers(surname);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_predictions_cust ON customer_predictions(customer_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_predictions_time ON customer_predictions(scored_at);")

        conn.commit()

    logger.info(f"Customer database initialized at: {target_path}")
    return target_path


def check_id_exists_in_base_csv(customer_id: int) -> bool:
    """Checks if a Customer ID exists in the original base CSV (read-only verification)."""
    if not DEFAULT_DATA_PATH.exists():
        return False
    try:
        # Read only CustomerId column for fast lookup
        df_ids = pd.read_csv(DEFAULT_DATA_PATH, usecols=["CustomerId"])
        return bool((df_ids["CustomerId"] == customer_id).any())
    except Exception as e:
        logger.warning(f"Unable to verify base CSV IDs: {e}")
        return False


def generate_unique_customer_id(db_path: Optional[Path] = None) -> int:
    """
    Generates a unique Customer ID that does not collide with either
    the historical dataset (typically 15,565,701 - 15,815,660) or the SQLite database.
    """
    init_customer_db(db_path)
    max_id = 15820000

    # Check maximum ID in SQLite table
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT MAX(customer_id) FROM customers;")
        row = cursor.fetchone()
        if row and row[0] is not None:
            max_id = max(max_id, int(row[0]))

    # Verify base CSV max ID if present
    if DEFAULT_DATA_PATH.exists():
        try:
            df_ids = pd.read_csv(DEFAULT_DATA_PATH, usecols=["CustomerId"])
            csv_max = int(df_ids["CustomerId"].max())
            max_id = max(max_id, csv_max)
        except Exception:
            pass

    return max_id + 1


def validate_customer_payload(
    data: Dict[str, Any],
    is_update: bool = False,
    existing_customer_id: Optional[int] = None,
    db_path: Optional[Path] = None,
) -> Tuple[bool, List[str]]:
    """
    Performs comprehensive schema and business-rule validation on customer attributes.
    Returns (is_valid, list_of_error_messages).
    """
    errors: List[str] = []

    # 1. CustomerId validation
    if not is_update:
        if "customer_id" not in data or data["customer_id"] is None:
            errors.append("Customer ID is required.")
        else:
            try:
                cid = int(data["customer_id"])
                if cid <= 0:
                    errors.append("Customer ID must be a positive integer.")
                else:
                    # Check SQLite duplicate
                    with get_db_connection(db_path) as conn:
                        cursor = conn.cursor()
                        cursor.execute("SELECT 1 FROM customers WHERE customer_id = ?;", (cid,))
                        if cursor.fetchone():
                            errors.append(f"Customer ID {cid} already exists in the customer registry.")

                    # Check base CSV duplicate
                    if check_id_exists_in_base_csv(cid):
                        errors.append(f"Customer ID {cid} already exists in historical bank records.")
            except (ValueError, TypeError):
                errors.append("Customer ID must be a valid integer.")
    else:
        # For updates, cannot change customer_id to another existing ID
        if "customer_id" in data and existing_customer_id is not None:
            try:
                cid = int(data["customer_id"])
                if cid != existing_customer_id:
                    errors.append("Changing Customer ID is not permitted on existing records.")
            except (ValueError, TypeError):
                errors.append("Invalid Customer ID provided.")

    # 2. Surname (Optional, but if present must be string)
    if "surname" in data and data["surname"] is not None:
        if not isinstance(data["surname"], str):
            errors.append("Surname must be a valid text string.")
        elif len(data["surname"].strip()) > 100:
            errors.append("Surname cannot exceed 100 characters.")

    # 3. CreditScore (Required: 300 to 850)
    if "credit_score" not in data or data["credit_score"] is None:
        errors.append("Credit Score is required.")
    else:
        try:
            cs = int(data["credit_score"])
            if cs < 300 or cs > 850:
                errors.append(f"Credit Score ({cs}) must be between 300 and 850 (FICO standard range).")
        except (ValueError, TypeError):
            errors.append("Credit Score must be an integer between 300 and 850.")

    # 4. Geography (Required: France, Germany, Spain)
    if "geography" not in data or not data["geography"]:
        errors.append("Geography is required.")
    else:
        geo = str(data["geography"]).strip().capitalize()
        # Handle title case
        if geo == "Spain" or geo == "France" or geo == "Germany":
            pass
        else:
            errors.append(f"Geography '{data['geography']}' is invalid. Allowed: {sorted(list(VALID_GEOGRAPHIES))}.")

    # 5. Gender (Required: Female, Male)
    if "gender" not in data or not data["gender"]:
        errors.append("Gender is required.")
    else:
        gen = str(data["gender"]).strip().capitalize()
        if gen not in VALID_GENDERS:
            errors.append(f"Gender '{data['gender']}' is invalid. Allowed: Female, Male.")

    # 6. Age (Required: 18 to 100)
    if "age" not in data or data["age"] is None:
        errors.append("Age is required.")
    else:
        try:
            age = int(data["age"])
            if age < 18 or age > 100:
                errors.append(f"Age ({age}) must be between 18 and 100 years.")
        except (ValueError, TypeError):
            errors.append("Age must be an integer between 18 and 100.")

    # 7. Tenure (Required: 0 to 10)
    if "tenure" not in data or data["tenure"] is None:
        errors.append("Tenure is required.")
    else:
        try:
            tenure = int(data["tenure"])
            if tenure < 0 or tenure > 10:
                errors.append(f"Tenure ({tenure}) must be between 0 and 10 years.")
        except (ValueError, TypeError):
            errors.append("Tenure must be an integer between 0 and 10.")

    # 8. Balance (Required: >= 0.0)
    if "balance" not in data or data["balance"] is None:
        errors.append("Balance is required.")
    else:
        try:
            bal = float(data["balance"])
            if bal < 0.0:
                errors.append("Balance cannot be negative.")
            elif bal > 10_000_000.0:
                errors.append("Balance exceeds supported banking limit (€10,000,000).")
        except (ValueError, TypeError):
            errors.append("Balance must be a valid numeric amount.")

    # 9. NumOfProducts (Required: 1 to 4)
    if "num_of_products" not in data or data["num_of_products"] is None:
        errors.append("Number of Products is required.")
    else:
        try:
            nop = int(data["num_of_products"])
            if nop < 1 or nop > 4:
                errors.append(f"Number of Products ({nop}) must be between 1 and 4.")
        except (ValueError, TypeError):
            errors.append("Number of Products must be an integer between 1 and 4.")

    # 10. HasCrCard (Required: 0 or 1)
    if "has_cr_card" not in data or data["has_cr_card"] is None:
        errors.append("HasCrCard indicator is required.")
    else:
        try:
            hcc = int(data["has_cr_card"])
            if hcc not in (0, 1):
                errors.append("HasCrCard must be 0 (No) or 1 (Yes).")
        except (ValueError, TypeError):
            errors.append("HasCrCard must be a binary 0 or 1 value.")

    # 11. IsActiveMember (Required: 0 or 1)
    if "is_active_member" not in data or data["is_active_member"] is None:
        errors.append("IsActiveMember indicator is required.")
    else:
        try:
            iam = int(data["is_active_member"])
            if iam not in (0, 1):
                errors.append("IsActiveMember must be 0 (No) or 1 (Yes).")
        except (ValueError, TypeError):
            errors.append("IsActiveMember must be a binary 0 or 1 value.")

    # 12. EstimatedSalary (Required: >= 0.0)
    if "estimated_salary" not in data or data["estimated_salary"] is None:
        errors.append("Estimated Salary is required.")
    else:
        try:
            sal = float(data["estimated_salary"])
            if sal < 0.0:
                errors.append("Estimated Salary cannot be negative.")
            elif sal > 5_000_000.0:
                errors.append("Estimated Salary exceeds supported upper limit (€5,000,000).")
        except (ValueError, TypeError):
            errors.append("Estimated Salary must be a valid numeric amount.")

    # 13. Record Status (Optional on create, default 'ACTIVE')
    if "record_status" in data and data["record_status"] is not None:
        st = str(data["record_status"]).upper()
        if st not in VALID_STATUSES:
            errors.append(f"Record Status '{data['record_status']}' is invalid. Allowed: {sorted(list(VALID_STATUSES))}.")

    # 14. Verification of 'Exited'
    # Newly registered customer MUST have exited as None / NULL.
    if data.get("exited") is not None:
        errors.append(
            "The 'Exited' field represents an observed historical outcome and cannot be supplied for newly registered customers."
        )

    return (len(errors) == 0, errors)


def add_customer(customer_data: Dict[str, Any], db_path: Optional[Path] = None) -> Dict[str, Any]:
    """
    Registers and persists a new customer in SQLite.
    Validates all inputs, prevents duplicate IDs, and guarantees that 'exited' is NULL.
    """
    init_customer_db(db_path)

    # First validate input payload (rejects any user-supplied exited label)
    is_valid, errors = validate_customer_payload(customer_data, is_update=False, db_path=db_path)
    if not is_valid:
        raise ValueError(f"Customer validation failed: {'; '.join(errors)}")

    # Clean and normalize payload
    payload = dict(customer_data)

    # Normalize casing
    if "geography" in payload and isinstance(payload["geography"], str):
        payload["geography"] = payload["geography"].strip().capitalize()
    if "gender" in payload and isinstance(payload["gender"], str):
        payload["gender"] = payload["gender"].strip().capitalize()

    # Ensure exited is None
    payload["exited"] = None

    now_iso = datetime.now(timezone.utc).isoformat()
    cid = int(payload["customer_id"])
    surname = str(payload.get("surname", "")).strip() if payload.get("surname") else None
    credit_score = int(payload["credit_score"])
    geography = str(payload["geography"])
    gender = str(payload["gender"])
    age = int(payload["age"])
    tenure = int(payload["tenure"])
    balance = round(float(payload["balance"]), 2)
    num_of_products = int(payload["num_of_products"])
    has_cr_card = int(payload["has_cr_card"])
    is_active_member = int(payload["is_active_member"])
    estimated_salary = round(float(payload["estimated_salary"]), 2)
    record_status = str(payload.get("record_status", "ACTIVE")).upper()

    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO customers (
                customer_id, surname, credit_score, geography, gender, age,
                tenure, balance, num_of_products, has_cr_card, is_active_member,
                estimated_salary, exited, record_status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?);
            """,
            (
                cid, surname, credit_score, geography, gender, age,
                tenure, balance, num_of_products, has_cr_card, is_active_member,
                estimated_salary, record_status, now_iso, now_iso
            )
        )
        conn.commit()

    return get_customer(cid, db_path=db_path)


def get_customer(customer_id: int, db_path: Optional[Path] = None) -> Optional[Dict[str, Any]]:
    """Retrieves a single customer record by Customer ID, or None if not found."""
    init_customer_db(db_path)
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT customer_id, surname, credit_score, geography, gender, age,
                   tenure, balance, num_of_products, has_cr_card, is_active_member,
                   estimated_salary, exited, record_status, created_at, updated_at
            FROM customers
            WHERE customer_id = ?;
            """,
            (customer_id,)
        )
        row = cursor.fetchone()
        if not row:
            return None
        return dict(row)


def update_customer(
    customer_id: int, updates: Dict[str, Any], db_path: Optional[Path] = None
) -> Dict[str, Any]:
    """
    Updates mutable customer fields with strict validation.
    Customer ID cannot be changed. 'exited' outcome remains preserved.
    """
    init_customer_db(db_path)
    existing = get_customer(customer_id, db_path=db_path)
    if not existing:
        raise KeyError(f"Customer ID {customer_id} does not exist.")

    # Merge updates into existing record for validation
    merged = dict(existing)
    for k, v in updates.items():
        if k in merged and k not in ("created_at", "updated_at", "exited"):
            merged[k] = v

    # Normalize
    if "geography" in merged and isinstance(merged["geography"], str):
        merged["geography"] = merged["geography"].strip().capitalize()
    if "gender" in merged and isinstance(merged["gender"], str):
        merged["gender"] = merged["gender"].strip().capitalize()

    # Ensure exited remains untouched unless an explicit confirmed outcome is provided via a designated workflow
    merged["exited"] = existing.get("exited")

    is_valid, errors = validate_customer_payload(
        merged, is_update=True, existing_customer_id=customer_id, db_path=db_path
    )
    if not is_valid:
        raise ValueError(f"Update validation failed: {'; '.join(errors)}")

    now_iso = datetime.now(timezone.utc).isoformat()
    surname = str(merged.get("surname", "")).strip() if merged.get("surname") else None
    credit_score = int(merged["credit_score"])
    geography = str(merged["geography"])
    gender = str(merged["gender"])
    age = int(merged["age"])
    tenure = int(merged["tenure"])
    balance = round(float(merged["balance"]), 2)
    num_of_products = int(merged["num_of_products"])
    has_cr_card = int(merged["has_cr_card"])
    is_active_member = int(merged["is_active_member"])
    estimated_salary = round(float(merged["estimated_salary"]), 2)
    record_status = str(merged.get("record_status", existing.get("record_status", "ACTIVE"))).upper()

    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE customers SET
                surname = ?,
                credit_score = ?,
                geography = ?,
                gender = ?,
                age = ?,
                tenure = ?,
                balance = ?,
                num_of_products = ?,
                has_cr_card = ?,
                is_active_member = ?,
                estimated_salary = ?,
                record_status = ?,
                updated_at = ?
            WHERE customer_id = ?;
            """,
            (
                surname, credit_score, geography, gender, age,
                tenure, balance, num_of_products, has_cr_card, is_active_member,
                estimated_salary, record_status, now_iso, customer_id
            )
        )
        conn.commit()

    return get_customer(customer_id, db_path=db_path)


def set_customer_status(
    customer_id: int, status: str, db_path: Optional[Path] = None
) -> Dict[str, Any]:
    """Updates customer lifecycle status ('ACTIVE', 'INACTIVE', 'ARCHIVED')."""
    init_customer_db(db_path)
    clean_status = status.upper().strip()
    if clean_status not in VALID_STATUSES:
        raise ValueError(f"Invalid status '{status}'. Must be one of {sorted(list(VALID_STATUSES))}.")

    existing = get_customer(customer_id, db_path=db_path)
    if not existing:
        raise KeyError(f"Customer ID {customer_id} does not exist.")

    now_iso = datetime.now(timezone.utc).isoformat()
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE customers SET record_status = ?, updated_at = ? WHERE customer_id = ?;",
            (clean_status, now_iso, customer_id)
        )
        conn.commit()

    return get_customer(customer_id, db_path=db_path)


def search_customers(
    query: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 200,
    db_path: Optional[Path] = None,
) -> List[Dict[str, Any]]:
    """
    Searches customers by Customer ID or Surname (case-insensitive substring).
    Optionally filters by lifecycle status. Returns list of customer dictionaries.
    """
    init_customer_db(db_path)
    sql = """
        SELECT customer_id, surname, credit_score, geography, gender, age,
               tenure, balance, num_of_products, has_cr_card, is_active_member,
               estimated_salary, exited, record_status, created_at, updated_at
        FROM customers
        WHERE 1=1
    """
    params: List[Any] = []

    if status and status.upper() != "ALL":
        clean_status = status.upper().strip()
        sql += " AND record_status = ?"
        params.append(clean_status)

    if query and query.strip():
        q = f"%{query.strip()}%"
        sql += " AND (CAST(customer_id AS TEXT) LIKE ? OR surname LIKE ?)"
        params.extend([q, q])

    sql += " ORDER BY created_at DESC LIMIT ?;"
    params.append(limit)

    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(sql, tuple(params))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]


def get_all_customers(
    include_archived: bool = True, db_path: Optional[Path] = None
) -> List[Dict[str, Any]]:
    """Returns all customer records from SQLite."""
    status_filter = None if include_archived else "ACTIVE"
    return search_customers(status=status_filter, limit=10000, db_path=db_path)


def get_customer_count(status: Optional[str] = None, db_path: Optional[Path] = None) -> int:
    """Returns the count of customers matching the given status (or total)."""
    init_customer_db(db_path)
    sql = "SELECT COUNT(*) FROM customers WHERE 1=1"
    params = []
    if status and status.upper() != "ALL":
        sql += " AND record_status = ?"
        params.append(status.upper().strip())

    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(sql, tuple(params))
        row = cursor.fetchone()
        return row[0] if row else 0


def record_prediction(
    customer_id: int,
    prediction_result: Dict[str, Any],
    features_snapshot: Dict[str, Any],
    db_path: Optional[Path] = None,
) -> int:
    """
    Appends an immutable prediction scoring audit record into customer_predictions.
    Captures the exact model name, version, predicted risk, spread, SHAP, and feature snapshot.
    """
    init_customer_db(db_path)
    existing = get_customer(customer_id, db_path=db_path)
    if not existing:
        raise KeyError(f"Cannot record prediction: Customer ID {customer_id} does not exist.")

    now_iso = datetime.now(timezone.utc).isoformat()
    prob = float(prediction_result.get("predicted_churn_prob", prediction_result.get("best_model_prob", 0.0)))
    risk_tier = str(prediction_result.get("risk_tier", "Unknown"))
    model_name = str(prediction_result.get("model_name", prediction_result.get("best_model_name", "Ensemble Consensus")))
    model_version = str(prediction_result.get("model_version", "v1.0.0 (Production)"))
    model_spread = float(prediction_result.get("model_spread", prediction_result.get("spread", 0.0)))
    has_disagree = int(bool(prediction_result.get("has_disagreement", prediction_result.get("has_strong_disagreement", False))))
    cluster_id = prediction_result.get("cluster_id")
    cluster_name = prediction_result.get("cluster_name")

    shap_json = None
    if "shap_attributions" in prediction_result and prediction_result["shap_attributions"]:
        shap_json = json.dumps(prediction_result["shap_attributions"])

    snapshot_json = json.dumps(features_snapshot)

    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO customer_predictions (
                customer_id, predicted_churn_prob, risk_tier, model_name,
                model_version, model_spread, has_disagreement, cluster_id,
                cluster_name, shap_summary_json, features_snapshot_json, scored_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                customer_id, prob, risk_tier, model_name,
                model_version, model_spread, has_disagree, cluster_id,
                cluster_name, shap_json, snapshot_json, now_iso
            )
        )
        conn.commit()
        return cursor.lastrowid


def get_prediction_history(
    customer_id: int, limit: int = 50, db_path: Optional[Path] = None
) -> List[Dict[str, Any]]:
    """Returns chronological prediction audit history for a customer."""
    init_customer_db(db_path)
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, customer_id, predicted_churn_prob, risk_tier, model_name,
                   model_version, model_spread, has_disagreement, cluster_id,
                   cluster_name, shap_summary_json, features_snapshot_json, scored_at
            FROM customer_predictions
            WHERE customer_id = ?
            ORDER BY scored_at DESC
            LIMIT ?;
            """,
            (customer_id, limit)
        )
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            if d.get("shap_summary_json"):
                try:
                    d["shap_attributions"] = json.loads(d["shap_summary_json"])
                except Exception:
                    d["shap_attributions"] = []
            if d.get("features_snapshot_json"):
                try:
                    d["features_snapshot"] = json.loads(d["features_snapshot_json"])
                except Exception:
                    d["features_snapshot"] = {}
            result.append(d)
        return result


def score_registered_customer(
    customer_id: int,
    db_path: Optional[Path] = None,
    save_to_history: bool = True,
) -> Dict[str, Any]:
    """
    Executes instant ML churn scoring for a registered customer.
    Loads persisted, validated model artifacts (does NOT retrain models).
    Computes:
    - Multi-model consensus churn probability
    - Risk Tier
    - Best model probability & name
    - Model disagreement spread & warning
    - Individual model probabilities
    - Single-instance SHAP attribution
    - Cluster Persona title & ID
    - Domain data-quality advisories
    Persists scoring audit record to prediction history if save_to_history is True.
    """
    from src.config import MODEL_ARTIFACTS_PATH
    from src.prediction_service import PredictionService
    from src.explainability import ExplainabilityEngine
    from src.segmentation import CustomerSegmentationEngine

    customer = get_customer(customer_id, db_path=db_path)
    if not customer:
        raise KeyError(f"Customer ID {customer_id} not found in database.")

    if not MODEL_ARTIFACTS_PATH.exists():
        raise FileNotFoundError(
            "Trained model artifacts not found at models/banksight_models.joblib. "
            "Please train the model pipeline in Page 05 (Model Laboratory) before scoring."
        )

    artifacts = PredictionService.get_artifacts()

    # Feature mapping matching exact training pipeline
    feature_dict = {
        "CustomerId": customer["customer_id"],
        "Surname": customer["surname"] or "Customer",
        "CreditScore": customer["credit_score"],
        "Geography": customer["geography"],
        "Gender": customer["gender"],
        "Age": customer["age"],
        "Tenure": customer["tenure"],
        "Balance": customer["balance"],
        "NumOfProducts": customer["num_of_products"],
        "HasCrCard": customer["has_cr_card"],
        "IsActiveMember": customer["is_active_member"],
        "EstimatedSalary": customer["estimated_salary"],
    }

    # Run inference across models
    consensus = PredictionService.predict_single(feature_dict, artifacts=artifacts)

    # Local SHAP attribution
    best_name = consensus["best_model_name"]
    best_clf = artifacts["trained_models"][best_name]
    background_data = artifacts.get("test_data", {}).get("X_test_proc", None)
    if background_data is not None and len(background_data) > 50:
        background_data = background_data[:50]

    explainer = ExplainabilityEngine(
        model=best_clf,
        feature_names=artifacts["feature_names"],
        background_data=background_data,
    )
    shap_explanation = explainer.explain_instance(
        consensus["processed_features"], original_values=feature_dict
    )

    # Derive persona & cluster assignment
    persona = CustomerSegmentationEngine._derive_persona_title(
        balance=customer["balance"],
        age=customer["age"],
        products=customer["num_of_products"],
        active_rate=float(customer["is_active_member"]),
        churn_rate=consensus["best_model_prob"],
    )

    # Data quality / outlier advisories
    advisories = []
    if customer["balance"] > 200_000:
        advisories.append("High Net-Worth Tier: Balance exceeds €200,000 (top 2% of portfolio).")
    if customer["age"] > 70:
        advisories.append("Sparse Cohort: Age > 70 is lightly represented in historical training distribution.")
    if customer["credit_score"] < 450:
        advisories.append("Subprime Credit: Significantly elevated macro default correlation.")
    if customer["num_of_products"] >= 3:
        advisories.append("Severe Multi-Product Hazard: Accounts holding 3+ products show 82%+ historical attrition hazard.")
    if customer["balance"] == 0:
        advisories.append("Zero-Balance Account: Vulnerable to immediate silent dormancy.")

    score_result = {
        "customer_id": customer_id,
        "predicted_churn_prob": consensus["best_model_prob"],
        "ensemble_mean_prob": consensus["mean_probability"],
        "risk_tier": consensus["risk_tier"],
        "model_name": best_name,
        "model_version": "v1.0.0 (Production Calibrated)",
        "model_spread": consensus["spread"],
        "has_disagreement": consensus["has_strong_disagreement"],
        "disagreement_warning": (
            f"Model Disagreement Alert: Model spread ({consensus['spread']*100:.1f}%) exceeds 25% threshold."
            if consensus["has_strong_disagreement"] else None
        ),
        "individual_probabilities": consensus["individual_probabilities"],
        "cluster_name": persona,
        "cluster_id": None,
        "shap_attributions": shap_explanation.get("feature_attributions", []),
        "advisories": advisories,
        "observed_exited_status": "UNKNOWN (New Registered Customer)",
    }

    if save_to_history:
        record_prediction(customer_id, score_result, feature_dict, db_path=db_path)

    return score_result

