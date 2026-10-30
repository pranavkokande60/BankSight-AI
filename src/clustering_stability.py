"""
BankSight AI — Clustering Stability Laboratory
Assesses empirical stability of clusters and segment churn rates across bootstrap resamples.
"""
from typing import Dict, Any, List
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import adjusted_rand_score
from scipy import stats

from src.segmentation import CLUSTERING_DEFAULT_FEATURES
from src.config import RANDOM_STATE


def run_cluster_stability_analysis(
    df: pd.DataFrame,
    features: List[str] = CLUSTERING_DEFAULT_FEATURES,
    n_clusters: int = 4,
    n_bootstraps: int = 10,
    sample_fraction: float = 0.85,
    random_state: int = RANDOM_STATE,
) -> Dict[str, Any]:
    """
    Executes repeated bootstrap subsampling to assess cluster stability,
    ARI agreement, and variance of segment churn rates.
    """
    valid_cols = [c for c in features if c in df.columns]
    rng = np.random.RandomState(random_state)
    scaler = StandardScaler()

    # Base fit on full dataset
    X_full = scaler.fit_transform(df[valid_cols])
    base_kmeans = KMeans(n_clusters=n_clusters, random_state=random_state, n_init=5)
    base_labels = base_kmeans.fit_predict(X_full)

    ari_scores = []
    cluster_churn_rates = {k: [] for k in range(n_clusters)}
    cluster_sizes = {k: [] for k in range(n_clusters)}

    n_samples = int(len(df) * sample_fraction)

    for i in range(n_bootstraps):
        sub_indices = rng.choice(len(df), size=n_samples, replace=True)
        sub_df = df.iloc[sub_indices].copy()
        X_sub = scaler.transform(sub_df[valid_cols])

        # Cluster on resample
        sub_kmeans = KMeans(n_clusters=n_clusters, random_state=random_state + i, n_init=3)
        sub_labels = sub_kmeans.fit_predict(X_sub)

        # Map to base cluster centers by nearest centroid
        # to ensure cluster index alignment
        centers_dist = np.linalg.norm(
            sub_kmeans.cluster_centers_[:, None, :] - base_kmeans.cluster_centers_[None, :, :],
            axis=-1,
        )
        mapping = centers_dist.argmin(axis=1)
        aligned_sub_labels = np.array([mapping[l] for l in sub_labels])

        # Compute ARI with base model predictions on this subsample
        base_sub_labels = base_labels[sub_indices]
        ari = adjusted_rand_score(base_sub_labels, sub_labels)
        ari_scores.append(float(ari))

        # Record churn rates per cluster
        if "Exited" in sub_df.columns:
            for c_id in range(n_clusters):
                mask = aligned_sub_labels == c_id
                c_size = mask.sum()
                cluster_sizes[c_id].append(int(c_size))
                if c_size > 0:
                    c_churn = float(sub_df.iloc[mask]["Exited"].mean())
                    cluster_churn_rates[c_id].append(c_churn)

    mean_ari = float(np.mean(ari_scores))
    std_ari = float(np.std(ari_scores))

    stability_level = (
        "High Stability" if mean_ari > 0.70
        else ("Moderate Stability" if mean_ari > 0.45 else "Low Stability / High Sensitivity")
    )

    cluster_stability_summary = []
    for c_id in range(n_clusters):
        churn_vals = cluster_churn_rates[c_id]
        if churn_vals:
            m = float(np.mean(churn_vals))
            ci_low = float(np.percentile(churn_vals, 2.5))
            ci_high = float(np.percentile(churn_vals, 97.5))
            sd = float(np.std(churn_vals))
        else:
            m, ci_low, ci_high, sd = 0.0, 0.0, 0.0, 0.0

        cluster_stability_summary.append({
            "Cluster": c_id,
            "Mean_Churn_Rate": m,
            "Churn_CI_95_Lower": ci_low,
            "Churn_CI_95_Upper": ci_high,
            "Churn_Std_Dev": sd,
            "Mean_Sample_Size": int(np.mean(cluster_sizes[c_id])) if cluster_sizes[c_id] else 0,
        })

    return {
        "n_bootstraps": n_bootstraps,
        "sample_fraction": sample_fraction,
        "mean_ari": mean_ari,
        "std_ari": std_ari,
        "stability_level": stability_level,
        "raw_ari_scores": ari_scores,
        "cluster_stability_summary": pd.DataFrame(cluster_stability_summary),
    }
