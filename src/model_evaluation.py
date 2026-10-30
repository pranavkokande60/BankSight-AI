"""
BankSight AI — Model Evaluation & Metrics Module
Computes comprehensive classification metrics, curves, and calibration scores.
"""
from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    brier_score_loss,
    confusion_matrix,
    roc_curve,
    precision_recall_curve,
)
from sklearn.calibration import calibration_curve


def evaluate_binary_classifier(
    y_true: np.ndarray, y_pred_proba: np.ndarray, threshold: float = 0.50
) -> Dict[str, Any]:
    """
    Computes a complete suite of classification metrics at a given probability threshold.
    """
    y_true = np.asarray(y_true).astype(int)
    y_pred_proba = np.asarray(y_pred_proba).astype(float)
    y_pred = (y_pred_proba >= threshold).astype(int)

    # Core scalar metrics
    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_true, y_pred_proba))
    pr_auc = float(average_precision_score(y_true, y_pred_proba))
    brier = float(brier_score_loss(y_true, y_pred_proba))

    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()

    # ROC and PR curve data
    fpr, tpr, roc_thresholds = roc_curve(y_true, y_pred_proba)
    precision_vals, recall_vals, pr_thresholds = precision_recall_curve(y_true, y_pred_proba)

    # Calibration curve (reliability diagram)
    prob_true, prob_pred = calibration_curve(y_true, y_pred_proba, n_bins=10, strategy="uniform")

    return {
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1_score": f1,
        "roc_auc": roc_auc,
        "pr_auc": pr_auc,
        "brier_score": brier,
        "threshold": threshold,
        "confusion_matrix": {
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp),
            "matrix": cm.tolist(),
        },
        "roc_curve": {
            "fpr": fpr.tolist(),
            "tpr": tpr.tolist(),
        },
        "pr_curve": {
            "precision": precision_vals.tolist(),
            "recall": recall_vals.tolist(),
        },
        "calibration_curve": {
            "prob_true": prob_true.tolist(),
            "prob_pred": prob_pred.tolist(),
        },
    }
