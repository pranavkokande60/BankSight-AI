"""
BankSight AI — Offline Pre-training Runner
Trains supervised models (with 5-fold CV and test evaluation) and segmentation pipelines.
"""
import sys
from pathlib import Path
import joblib

from src.data_loader import load_dataset
from src.train_models import train_and_evaluate_all_models
from src.segmentation import CustomerSegmentationEngine
from src.config import SEGMENTATION_ARTIFACTS_PATH, MODEL_ARTIFACTS_PATH


def main():
    print("--- 1. Loading Dataset ---")
    df = load_dataset()
    print(f"Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns.")

    print("\n--- 2. Training Supervised ML Models (5-Fold CV & Holdout Evaluation) ---")
    artifacts = train_and_evaluate_all_models(df, save_artifacts=True)

    print(f"\nBest Model Selected: {artifacts['best_model_name']}")
    print("\n--- 5-Fold Stratified Cross-Validation (Training Split) ---")
    for m, res in artifacts["cv_results"].items():
        print(f"  [{m}]")
        print(f"    ROC-AUC : {res['cv_roc_auc_mean']:.4f} (+/- {res['cv_roc_auc_std']:.4f})")
        print(f"    PR-AUC  : {res['cv_pr_auc_mean']:.4f} (+/- {res['cv_pr_auc_std']:.4f})")
        print(f"    Recall  : {res['cv_recall_mean']:.4f}")
        print(f"    F1-Score: {res['cv_f1_mean']:.4f}")

    print("\n--- Isolated Test Set Evaluation (2,000 Customers / 20% Holdout) ---")
    for m, res in artifacts["test_evaluations"].items():
        print(f"  [{m}]")
        print(f"    Accuracy : {res['accuracy']:.4f}")
        print(f"    ROC-AUC  : {res['roc_auc']:.4f}")
        print(f"    PR-AUC   : {res['pr_auc']:.4f}")
        print(f"    Recall   : {res['recall']:.4f}")
        print(f"    Precision: {res['precision']:.4f}")
        print(f"    F1-Score : {res['f1_score']:.4f}")
        print(f"    Brier    : {res['brier_score']:.4f}")

    print("\n--- Sensitive Attribute Demographic Ablation ---")
    abl = artifacts["demographic_ablation"]
    print(f"  Model: {abl['model']}")
    print(f"  ROC-AUC: {abl['roc_auc']:.4f} | PR-AUC: {abl['pr_auc']:.4f} | F1: {abl['f1_score']:.4f}")

    print("\n--- 3. Training Customer Segmentation Engine (K-Means, PCA) ---")
    seg_engine = CustomerSegmentationEngine(n_clusters=4)
    annotated_df, seg_results = seg_engine.fit_predict(df)
    joblib.dump(seg_results, SEGMENTATION_ARTIFACTS_PATH)
    print("Saved segmentation models.")
    print("\nCluster Profiles Grounded in Data:")
    print(seg_results["cluster_profiles"].to_string())

    print("\n=== Training Completed Successfully! Artifacts Persisted to models/ ===")


if __name__ == "__main__":
    main()
