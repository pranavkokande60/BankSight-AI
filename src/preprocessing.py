"""
BankSight AI — Preprocessing Pipeline Module
Builds leakage-free scikit-learn transformers and handles train/test splitting.
"""
from typing import Tuple, List, Optional
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from src.config import (
    TARGET_COL,
    PII_COLUMNS,
    UNINFORMATIVE_COLUMNS,
    NUMERIC_FEATURES,
    BINARY_FEATURES,
    CATEGORICAL_FEATURES,
    RANDOM_STATE,
)
from src.feature_engineering import add_engineered_features


def get_feature_matrix(
    df: pd.DataFrame, include_engineered: bool = True
) -> Tuple[pd.DataFrame, Optional[pd.Series], List[str], List[str], List[str]]:
    """
    Extracts feature matrix X and target y, pruning uninformative/PII columns.

    Parameters:
    -----------
    df : pd.DataFrame
        Input raw banking data.
    include_engineered : bool
        Whether to add domain-engineered features.

    Returns:
    --------
    X : pd.DataFrame
    y : Optional[pd.Series] (None if TARGET_COL not in df)
    num_cols : List[str]
    bin_cols : List[str]
    cat_cols : List[str]
    """
    data = df.copy()

    # Separate target if present
    y = None
    if TARGET_COL in data.columns and data[TARGET_COL].notna().any():
        try:
            y = data[TARGET_COL].dropna().astype(int)
        except Exception:
            y = data[TARGET_COL]

    # Drop target, PII, and zero-variance columns
    cols_to_drop = [TARGET_COL] + PII_COLUMNS + UNINFORMATIVE_COLUMNS
    cols_to_drop = [c for c in cols_to_drop if c in data.columns]
    X = data.drop(columns=cols_to_drop)

    num_cols = [c for c in NUMERIC_FEATURES if c in X.columns]
    bin_cols = [c for c in BINARY_FEATURES if c in X.columns]
    cat_cols = [c for c in CATEGORICAL_FEATURES if c in X.columns]

    if include_engineered:
        # Add engineered features safely
        eng_df = add_engineered_features(X)
        for col in ["BalanceSalaryRatio", "CreditScoreAgeRatio", "ProductPerTenure"]:
            if col in eng_df.columns and col not in num_cols:
                num_cols.append(col)
        for col in ["IsZeroBalance", "IsMultiProductRisk"]:
            if col in eng_df.columns and col not in bin_cols:
                bin_cols.append(col)
        X = eng_df[num_cols + bin_cols + cat_cols]
    else:
        X = X[num_cols + bin_cols + cat_cols]

    return X, y, num_cols, bin_cols, cat_cols


def create_preprocessor(
    num_cols: List[str], bin_cols: List[str], cat_cols: List[str]
) -> ColumnTransformer:
    """
    Builds a ColumnTransformer that scales continuous features and one-hot encodes categoricals.
    Binary features are passed through unchanged.
    """
    transformers = []

    if num_cols:
        transformers.append(
            ("num", StandardScaler(), num_cols)
        )
    if bin_cols:
        transformers.append(
            ("bin", "passthrough", bin_cols)
        )
    if cat_cols:
        transformers.append(
            (
                "cat",
                OneHotEncoder(drop="first", sparse_output=False, handle_unknown="ignore"),
                cat_cols,
            )
        )

    preprocessor = ColumnTransformer(transformers=transformers, remainder="drop")
    return preprocessor


def get_preprocessed_feature_names(
    preprocessor: ColumnTransformer,
    num_cols: List[str],
    bin_cols: List[str],
    cat_cols: List[str],
) -> List[str]:
    """Retrieves human-readable feature names post-encoding."""
    feature_names = []
    if num_cols:
        feature_names.extend(num_cols)
    if bin_cols:
        feature_names.extend(bin_cols)
    if cat_cols:
        cat_encoder = preprocessor.named_transformers_.get("cat")
        if cat_encoder and hasattr(cat_encoder, "get_feature_names_out"):
            cat_names = list(cat_encoder.get_feature_names_out(cat_cols))
            feature_names.extend(cat_names)
        else:
            feature_names.extend(cat_cols)
    return feature_names


def prepare_train_test_split(
    df: pd.DataFrame, test_size: float = 0.20, random_state: int = RANDOM_STATE
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, ColumnTransformer, List[str]]:
    """
    Performs leakage-free stratified split, fits preprocessor on train only,
    and returns transformed arrays along with feature names.
    """
    X, y, num_cols, bin_cols, cat_cols = get_feature_matrix(df, include_engineered=True)

    if y is None:
        raise ValueError("Cannot perform train/test split without target column 'Exited'.")

    # Stratified split to preserve class imbalance in both sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    preprocessor = create_preprocessor(num_cols, bin_cols, cat_cols)
    # Fit strictly on train!
    preprocessor.fit(X_train)

    feature_names = get_preprocessed_feature_names(preprocessor, num_cols, bin_cols, cat_cols)

    return X_train, X_test, y_train, y_test, preprocessor, feature_names
