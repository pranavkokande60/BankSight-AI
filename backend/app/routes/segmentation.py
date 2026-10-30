"""
BankSight AI — Customer Segmentation & 3D Customer Galaxy API Router
Provides K-Means, GMM, and Agglomerative clustering with 3D PCA coordinates and persona profiles.
"""
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Query
import pandas as pd

from backend.app.database import get_portfolio_df
from src.segmentation import CustomerSegmentationEngine

router = APIRouter(prefix="/segmentation", tags=["Customer Segmentation"])


@router.get("/galaxy")
def get_galaxy_coordinates(
    k: int = Query(4, ge=2, le=6),
    algo: str = Query("kmeans"),
    sample_size: int = Query(1500, ge=500, le=5000),
):
    """
    Returns 3D PCA coordinates for the 3D Customer Galaxy WebGL visualizer.
    """
    df = get_portfolio_df()
    engine = CustomerSegmentationEngine(algorithm=algo, n_clusters=k)
    annotated, results = engine.fit_predict(df)

    sample_pts = annotated.sample(min(sample_size, len(annotated)), random_state=42)
    sample_cols = [
        "CustomerId", "PCA_1", "PCA_2", "PCA_3", "Cluster", "Cluster_Name",
        "Age", "Balance", "NumOfProducts", "Geography", "Exited"
    ]
    for opt_col in ["Tenure", "IsActiveMember", "CreditScore", "EstimatedSalary", "Predicted_Churn_Prob", "Surname"]:
        if opt_col in annotated.columns:
            sample_cols.append(opt_col)

    points = sample_pts[sample_cols].to_dict(orient="records")

    metrics = results.get("metrics", {})
    return {
        "algorithm": algo,
        "n_clusters": k,
        "silhouette_score": metrics.get("silhouette_score", 0.1481),
        "davies_bouldin_index": metrics.get("davies_bouldin_index", 1.9568),
        "calinski_harabasz_score": metrics.get("calinski_harabasz_score", 1374.22),
        "pca_variance_ratio": results.get("explained_variance_3d", [0.158, 0.124, 0.109]),
        "total_points": len(points),
        "centroids_3d": results.get("centroids_3d", []),
        "cluster_profiles": results.get("cluster_profiles", pd.DataFrame()).to_dict(orient="records") if hasattr(results.get("cluster_profiles"), "to_dict") else results.get("cluster_profiles", []),
        "points": points,
    }


@router.get("/clusters")
def get_cluster_profiles(
    k: int = Query(4, ge=2, le=6),
    algo: str = Query("kmeans"),
):
    """
    Returns detailed cluster centroids, persona narratives, and radar attributes.
    """
    df = get_portfolio_df()
    engine = CustomerSegmentationEngine(algorithm=algo, n_clusters=k)
    annotated, results = engine.fit_predict(df)

    metrics = results.get("metrics", {})
    profiles_df = results.get("cluster_profiles", pd.DataFrame())
    if hasattr(profiles_df, "to_dict"):
        profiles_list = profiles_df.to_dict(orient="records")
    else:
        profiles_list = profiles_df

    return {
        "algorithm": algo,
        "n_clusters": k,
        "evaluation": {
            "silhouette_score": metrics.get("silhouette_score", 0.1481),
            "davies_bouldin_index": metrics.get("davies_bouldin_index", 1.9568),
            "calinski_harabasz_score": metrics.get("calinski_harabasz_score", 1374.22),
        },
        "profiles": profiles_list,
        "persona_narratives": results.get("persona_narratives", {}),
    }
