"""
BankSight AI — Model Trust & Algorithmic Fairness Audit Module
Evaluates demographic parity, equalized odds, and subgroup metrics across sensitive groups.
"""
from typing import Dict, Any, List, Tuple
import pandas as pd
import numpy as np
from sklearn.metrics import recall_score, precision_score, confusion_matrix


def audit_subgroup_fairness(
    df: pd.DataFrame,
    group_col: str,
    y_true_col: str = "Exited",
    y_prob_col: str = "Predicted_Churn_Prob",
    threshold: float = 0.50,
) -> Dict[str, Any]:
    """
    Evaluates algorithmic fairness and error-rate disparities across demographic cohorts.
    """
    if group_col not in df.columns or y_true_col not in df.columns or y_prob_col not in df.columns:
        raise ValueError("Required columns missing for fairness audit.")

    # Filter out unlabelled customers (e.g. newly registered accounts) to ensure valid ground-truth evaluation
    eval_df = df[df[y_true_col].notna()].copy()
    if eval_df.empty:
        raise ValueError("No labelled records available for fairness evaluation.")

    group_metrics = []
    y_true_all = eval_df[y_true_col].astype(int)
    y_pred_all = (eval_df[y_prob_col] >= threshold).astype(int)

    subgroup_metrics_dict = {}

    for group_val, grp in eval_df.groupby(group_col, observed=False):
        n = len(grp)
        if n < 5:
            continue

        y_true = grp[y_true_col].astype(int)
        y_pred = (grp[y_prob_col] >= threshold).astype(int)

        churn_prevalence = float(y_true.mean())
        selection_rate = float(y_pred.mean())

        # Confusion matrix for subgroup
        cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
        tn, fp, fn, tp = cm.ravel()

        rec = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
        prec = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0
        fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0
        acc = float((tp + tn) / (tp + tn + fp + fn)) if (tp + tn + fp + fn) > 0 else 0.0

        group_name = str(group_val)
        group_metrics.append({
            "Subgroup": group_name,
            "Sample_Size": n,
            "Churn_Prevalence": churn_prevalence,
            "Selection_Rate": selection_rate,
            "Recall_Sensitivity": rec,
            "False_Positive_Rate": fpr,
            "Precision": prec,
            "Accuracy": acc,
        })
        subgroup_metrics_dict[group_name] = {
            "count": n,
            "selection_rate": round(selection_rate, 4),
            "tpr": round(rec, 4),
            "fpr": round(fpr, 4),
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
        }

    metrics_df = pd.DataFrame(group_metrics)

    # Disparity measures
    demographic_parity_diff = 0.0
    equal_opportunity_diff = 0.0
    disparate_impact_ratio = 1.0

    if not metrics_df.empty:
        sel_max = metrics_df["Selection_Rate"].max()
        sel_min = metrics_df["Selection_Rate"].min()
        demographic_parity_diff = float(sel_max - sel_min)
        disparate_impact_ratio = float(sel_min / sel_max) if sel_max > 0 else 1.0

        rec_max = metrics_df["Recall_Sensitivity"].max()
        rec_min = metrics_df["Recall_Sensitivity"].min()
        equal_opportunity_diff = float(rec_max - rec_min)

    is_compliant = bool(disparate_impact_ratio >= 0.80)

    return {
        "group_attribute": group_col,
        "decision_threshold": threshold,
        "subgroup_table": metrics_df,
        "subgroup_metrics": subgroup_metrics_dict,
        "demographic_parity_diff": round(demographic_parity_diff, 4),
        "demographic_parity_difference": round(demographic_parity_diff, 4),
        "equal_opportunity_diff": round(equal_opportunity_diff, 4),
        "equal_opportunity_difference": round(equal_opportunity_diff, 4),
        "disparate_impact_ratio": round(disparate_impact_ratio, 4),
        "four_fifths_rule_compliant": is_compliant,
        "is_four_fifths_compliant": is_compliant,
        "guidance": (
            "Fairness metrics measure statistical differences between groups under model predictions. "
            "Statistical alignment across one metric does not guarantee holistic ethical fairness. "
            "Demographic factors should never be used to make adverse banking decisions."
        ),
    }
