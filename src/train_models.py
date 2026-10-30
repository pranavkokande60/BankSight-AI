"""
BankSight AI — Supervised Model Training Pipeline
Trains, cross-validates, calibrates, and persists churn prediction models.
"""
from typing import Dict, Any, List, Tuple
import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import StratifiedKFold, cross_validate

from src.config import (
    MODEL_ARTIFACTS_PATH,
    RANDOM_STATE,
    TARGET_COL,
)
from src.preprocessing import prepare_train_test_split, get_feature_matrix, create_preprocessor
from src.model_evaluation import evaluate_binary_classifier


def build_candidate_models(random_state: int = RANDOM_STATE) -> Dict[str, Any]:
    """Returns baseline and advanced classifier estimators."""
    return {
        "Logistic Regression": LogisticRegression(
            C=1.0,
            max_iter=1000,
            class_weight="balanced",
            random_state=random_state,
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=150,
            max_depth=10,
            min_samples_split=6,
            class_weight="balanced",
            random_state=random_state,
            n_jobs=-1,
        ),
        "Gradient Boosting": HistGradientBoostingClassifier(
            max_iter=150,
            learning_rate=0.08,
            max_depth=7,
            class_weight="balanced",
            random_state=random_state,
        ),
    }


def train_and_evaluate_all_models(
    df: pd.DataFrame,
    test_size: float = 0.20,
    random_state: int = RANDOM_STATE,
    save_artifacts: bool = True,
) -> Dict[str, Any]:
    """
    Executes end-to-end ML pipeline:
    1. Stratified split & pipeline fit strictly on training set.
    2. 5-Fold Stratified Cross-Validation on training set.
    3. Calibration and test-set evaluation.
    4. Demographic ablation study (with vs without Gender).
    5. Artifact serialization.
    """
    X_train, X_test, y_train, y_test, preprocessor, feature_names = prepare_train_test_split(
        df, test_size=test_size, random_state=random_state
    )

    X_train_proc = preprocessor.transform(X_train)
    X_test_proc = preprocessor.transform(X_test)

    candidate_models = build_candidate_models(random_state)
    trained_models = {}
    cv_results = {}
    test_evaluations = {}

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=random_state)

    for name, estimator in candidate_models.items():
        # Cross-validation on training data only
        scoring = ["roc_auc", "average_precision", "f1", "accuracy", "recall", "precision"]
        cv_res = cross_validate(
            estimator, X_train_proc, y_train, cv=cv, scoring=scoring, n_jobs=-1
        )
        cv_results[name] = {
            "cv_roc_auc_mean": float(np.mean(cv_res["test_roc_auc"])),
            "cv_roc_auc_std": float(np.std(cv_res["test_roc_auc"])),
            "cv_pr_auc_mean": float(np.mean(cv_res["test_average_precision"])),
            "cv_pr_auc_std": float(np.std(cv_res["test_average_precision"])),
            "cv_f1_mean": float(np.mean(cv_res["test_f1"])),
            "cv_recall_mean": float(np.mean(cv_res["test_recall"])),
        }

        # Fit model on entire train split
        estimator.fit(X_train_proc, y_train)

        # Calibrate probability predictions using sigmoid calibration on 3-fold internal CV
        calibrated = CalibratedClassifierCV(estimator=estimator, method="sigmoid", cv=3)
        calibrated.fit(X_train_proc, y_train)

        trained_models[name] = calibrated

        # Evaluate on isolated test set
        y_test_pred_proba = calibrated.predict_proba(X_test_proc)[:, 1]
        eval_metrics = evaluate_binary_classifier(y_test, y_test_pred_proba)
        test_evaluations[name] = eval_metrics

    # Select best model based on PR-AUC on isolated test set (most suitable for 4:1 class imbalance)
    best_model_name = max(test_evaluations.keys(), key=lambda k: test_evaluations[k]["pr_auc"])

    # Demographic Ablation: Train Gradient Boosting WITHOUT Gender
    ablation_results = _run_demographic_ablation(
        df, test_size=test_size, random_state=random_state
    )

    artifacts = {
        "trained_models": trained_models,
        "preprocessor": preprocessor,
        "feature_names": feature_names,
        "cv_results": cv_results,
        "test_evaluations": test_evaluations,
        "best_model_name": best_model_name,
        "test_data": {
            "X_test_raw": X_test,
            "X_test_proc": X_test_proc,
            "y_test": y_test,
        },
        "demographic_ablation": ablation_results,
    }

    if save_artifacts:
        joblib.dump(artifacts, MODEL_ARTIFACTS_PATH)

    return artifacts


def _run_demographic_ablation(
    df: pd.DataFrame, test_size: float = 0.20, random_state: int = RANDOM_STATE
) -> Dict[str, Any]:
    """Evaluates performance when removing sensitive attribute 'Gender' from inputs."""
    data_no_gender = df.drop(columns=["Gender"], errors="ignore")
    X_train, X_test, y_train, y_test, prep, feat_names = prepare_train_test_split(
        data_no_gender, test_size=test_size, random_state=random_state
    )

    X_train_p = prep.transform(X_train)
    X_test_p = prep.transform(X_test)

    clf = HistGradientBoostingClassifier(
        max_iter=150, learning_rate=0.08, max_depth=7, class_weight="balanced", random_state=random_state
    )
    clf.fit(X_train_p, y_train)
    probs = clf.predict_proba(X_test_p)[:, 1]
    metrics = evaluate_binary_classifier(y_test, probs)

    return {
        "model": "Gradient Boosting (Ablated: No Gender)",
        "features_used": feat_names,
        "roc_auc": metrics["roc_auc"],
        "pr_auc": metrics["pr_auc"],
        "f1_score": metrics["f1_score"],
        "recall": metrics["recall"],
    }
