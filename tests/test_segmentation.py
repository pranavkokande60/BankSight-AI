"""
Unit Tests for Customer Segmentation & 3D PCA Projections
"""
import pytest
import pandas as pd
import numpy as np
from src.segmentation import CustomerSegmentationEngine
from src.clustering_stability import run_cluster_stability_analysis


@pytest.fixture
def sample_banking_data():
    np.random.seed(42)
    n = 200
    return pd.DataFrame({
        "CreditScore": np.random.randint(400, 850, n),
        "Age": np.random.randint(18, 75, n),
        "Tenure": np.random.randint(0, 10, n),
        "Balance": np.random.uniform(0, 200000, n),
        "NumOfProducts": np.random.randint(1, 5, n),
        "IsActiveMember": np.random.randint(0, 2, n),
        "EstimatedSalary": np.random.uniform(20000, 150000, n),
        "Exited": np.random.binomial(1, 0.20, n),
    })


def test_segmentation_engine_fit_predict(sample_banking_data):
    engine = CustomerSegmentationEngine(n_clusters=3, algorithm="kmeans")
    annotated_df, results = engine.fit_predict(sample_banking_data)

    assert "Cluster" in annotated_df.columns
    assert "PCA_1" in annotated_df.columns
    assert "PCA_2" in annotated_df.columns
    assert "PCA_3" in annotated_df.columns
    assert len(annotated_df["Cluster"].unique()) == 3

    metrics = results["metrics"]
    assert -1.0 <= metrics["silhouette_score"] <= 1.0
    assert metrics["davies_bouldin_index"] >= 0.0

    profiles = results["cluster_profiles"]
    assert len(profiles) == 3
    assert "Persona_Title" in profiles.columns


def test_clustering_stability(sample_banking_data):
    stability = run_cluster_stability_analysis(
        sample_banking_data, n_clusters=3, n_bootstraps=3, sample_fraction=0.80
    )
    assert "mean_ari" in stability
    assert -1.0 <= stability["mean_ari"] <= 1.0
    assert not stability["cluster_stability_summary"].empty
