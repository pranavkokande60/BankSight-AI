"""
BankSight AI — Prediction Service Module
Provides unified caching and prediction interfaces for trained models.
"""
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
import joblib
import pandas as pd
import numpy as np

from src.config import MODEL_ARTIFACTS_PATH
from src.preprocessing import get_feature_matrix
from src.risk_scoring import compute_multi_model_consensus, assign_risk_tier
from src.train_models import train_and_evaluate_all_models


class PredictionService:
    """Manages loaded model artifacts and performs single/batch scoring."""

    _instance = None
    _artifacts = None

    @classmethod
    def get_artifacts(cls, df_fallback: Optional[pd.DataFrame] = None) -> Dict[str, Any]:
        """Loads cached model artifacts from disk or trains if absent."""
        if cls._artifacts is not None:
            return cls._artifacts

        if MODEL_ARTIFACTS_PATH.exists():
            try:
                cls._artifacts = joblib.load(MODEL_ARTIFACTS_PATH)
                return cls._artifacts
            except Exception:
                pass

        if df_fallback is not None:
            cls._artifacts = train_and_evaluate_all_models(df_fallback, save_artifacts=True)
            return cls._artifacts

        raise FileNotFoundError("Model artifacts not found and no training data provided.")

    @classmethod
    def predict_single(
        cls, customer_dict: Dict[str, Any], artifacts: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Runs inference for a single customer profile across all trained models."""
        if artifacts is None:
            artifacts = cls.get_artifacts()

        preprocessor = artifacts["preprocessor"]
        trained_models = artifacts["trained_models"]

        df_single = pd.DataFrame([customer_dict])
        X, _, _, _, _ = get_feature_matrix(df_single, include_engineered=True)
        X_proc = preprocessor.transform(X)

        predictions = {}
        for name, model in trained_models.items():
            prob = float(model.predict_proba(X_proc)[0, 1])
            predictions[name] = prob

        consensus = compute_multi_model_consensus(predictions)
        consensus["processed_features"] = X_proc[0]
        consensus["feature_names"] = artifacts["feature_names"]
        consensus["best_model_name"] = artifacts["best_model_name"]
        consensus["best_model_prob"] = predictions.get(artifacts["best_model_name"], consensus["mean_probability"])

        return consensus

    @classmethod
    def score_batch(
        cls, df: pd.DataFrame, artifacts: Optional[Dict[str, Any]] = None
    ) -> pd.DataFrame:
        """Scores an entire customer DataFrame and appends consensus probabilities and risk tiers."""
        if artifacts is None:
            artifacts = cls.get_artifacts()

        preprocessor = artifacts["preprocessor"]
        trained_models = artifacts["trained_models"]

        X, _, _, _, _ = get_feature_matrix(df, include_engineered=True)
        X_proc = preprocessor.transform(X)

        scored_df = df.copy()

        model_probs = {}
        for name, model in trained_models.items():
            probs = model.predict_proba(X_proc)[:, 1]
            scored_df[f"Prob_{name.replace(' ', '_')}"] = probs
            model_probs[name] = probs

        # Ensemble consensus metrics
        all_p = np.column_stack(list(model_probs.values()))
        scored_df["Predicted_Churn_Prob"] = np.mean(all_p, axis=1)
        scored_df["Model_Spread"] = np.max(all_p, axis=1) - np.min(all_p, axis=1)
        scored_df["Model_Std_Dev"] = np.std(all_p, axis=1)
        scored_df["Model_Disagreement_Flag"] = scored_df["Model_Spread"] >= 0.25
        scored_df["Risk_Tier"] = scored_df["Predicted_Churn_Prob"].apply(assign_risk_tier)

        return scored_df
