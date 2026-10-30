"""
BankSight AI — Customer Segmentation Engine
Implements K-Means, Agglomerative Clustering, and GMM with PCA projections and persona profiling.
"""
from typing import Dict, Any, List, Tuple, Optional
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans, AgglomerativeClustering
from sklearn.mixture import GaussianMixture
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score

from src.config import RANDOM_STATE

CLUSTERING_DEFAULT_FEATURES = [
    "CreditScore",
    "Age",
    "Tenure",
    "Balance",
    "NumOfProducts",
    "IsActiveMember",
    "EstimatedSalary",
]


class CustomerSegmentationEngine:
    """Executes unsupervised clustering, PCA projections, and empirical persona profiling."""

    def __init__(
        self,
        features: Optional[List[str]] = None,
        algorithm: str = "kmeans",
        n_clusters: int = 4,
        random_state: int = RANDOM_STATE,
    ):
        self.features = features or CLUSTERING_DEFAULT_FEATURES
        self.algorithm = algorithm.lower()
        self.n_clusters = n_clusters
        self.random_state = random_state
        self.scaler = StandardScaler()
        self.model = None
        self.pca_2d = PCA(n_components=2, random_state=random_state)
        self.pca_3d = PCA(n_components=3, random_state=random_state)
        self.metrics: Dict[str, float] = {}
        self.explained_variance_2d: List[float] = []
        self.explained_variance_3d: List[float] = []

    def fit_predict(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Fits selected clustering algorithm, generates 2D/3D PCA embeddings,
        and returns annotated DataFrame with metrics.
        """
        valid_cols = [c for c in self.features if c in df.columns]
        if len(valid_cols) < 2:
            raise ValueError(f"Insufficient clustering features in dataframe: {valid_cols}")

        X = df[valid_cols].copy()
        X_scaled = self.scaler.fit_transform(X)

        # Fit chosen algorithm
        if self.algorithm == "agglomerative":
            self.model = AgglomerativeClustering(n_clusters=self.n_clusters)
            labels = self.model.fit_predict(X_scaled)
        elif self.algorithm == "gmm":
            self.model = GaussianMixture(
                n_components=self.n_clusters, random_state=self.random_state
            )
            labels = self.model.fit_predict(X_scaled)
        else:  # Default kmeans
            self.model = KMeans(
                n_clusters=self.n_clusters, random_state=self.random_state, n_init=10
            )
            labels = self.model.fit_predict(X_scaled)

        # Calculate cluster evaluation metrics
        # For efficiency on large data, sample up to 5000 for silhouette score
        sample_indices = np.random.RandomState(self.random_state).choice(
            len(X_scaled), size=min(5000, len(X_scaled)), replace=False
        )
        sil_score = float(
            silhouette_score(X_scaled[sample_indices], labels[sample_indices])
        )
        db_score = float(davies_bouldin_score(X_scaled, labels))
        ch_score = float(calinski_harabasz_score(X_scaled, labels))

        self.metrics = {
            "silhouette_score": sil_score,
            "davies_bouldin_index": db_score,
            "calinski_harabasz_score": ch_score,
            "n_clusters": self.n_clusters,
            "algorithm": self.algorithm,
        }

        # Compute PCA projections
        coords_2d = self.pca_2d.fit_transform(X_scaled)
        coords_3d = self.pca_3d.fit_transform(X_scaled)

        self.explained_variance_2d = [float(v) for v in self.pca_2d.explained_variance_ratio_]
        self.explained_variance_3d = [float(v) for v in self.pca_3d.explained_variance_ratio_]

        result_df = df.copy()
        result_df["Cluster"] = labels
        result_df["Cluster_Name"] = [f"Cluster {l}" for l in labels]
        result_df["PCA_1"] = coords_3d[:, 0]
        result_df["PCA_2"] = coords_3d[:, 1]
        result_df["PCA_3"] = coords_3d[:, 2]

        cluster_profiles = self._generate_cluster_profiles(result_df)

        centroids_3d = []
        for cluster_id, grp in result_df.groupby("Cluster"):
            centroids_3d.append({
                "cluster": int(cluster_id),
                "cluster_name": str(grp["Cluster_Name"].iloc[0]),
                "x": round(float(grp["PCA_1"].mean()), 4),
                "y": round(float(grp["PCA_2"].mean()), 4),
                "z": round(float(grp["PCA_3"].mean()), 4),
                "account_count": int(len(grp)),
                "mean_balance": round(float(grp["Balance"].mean()), 2) if "Balance" in grp.columns else 0.0,
                "churn_rate": round(float(grp["Exited"].mean()) * 100, 2) if "Exited" in grp.columns else 20.0,
            })

        return result_df, {
            "metrics": self.metrics,
            "explained_variance_2d": self.explained_variance_2d,
            "explained_variance_3d": self.explained_variance_3d,
            "cluster_profiles": cluster_profiles,
            "centroids_3d": centroids_3d,
        }

    def _generate_cluster_profiles(self, annotated_df: pd.DataFrame) -> pd.DataFrame:
        """Derives empirical statistical profiles and persona titles for each cluster."""
        total_customers = len(annotated_df)
        total_churned = int(annotated_df["Exited"].sum()) if "Exited" in annotated_df.columns else 1

        profiles = []
        for cluster_id, grp in annotated_df.groupby("Cluster"):
            cnt = len(grp)
            churned_cnt = int(grp["Exited"].sum()) if "Exited" in grp.columns else 0
            churn_rate = churned_cnt / cnt if cnt > 0 else 0.0
            churn_contrib = churned_cnt / total_churned if total_churned > 0 else 0.0

            mean_bal = float(grp["Balance"].mean()) if "Balance" in grp.columns else 0.0
            mean_salary = float(grp["EstimatedSalary"].mean()) if "EstimatedSalary" in grp.columns else 0.0
            mean_age = float(grp["Age"].mean()) if "Age" in grp.columns else 0.0
            mean_prod = float(grp["NumOfProducts"].mean()) if "NumOfProducts" in grp.columns else 0.0
            act_rate = float(grp["IsActiveMember"].mean()) if "IsActiveMember" in grp.columns else 0.0

            # Derive persona title grounded in centroid characteristics
            persona_title = self._derive_persona_title(mean_bal, mean_age, mean_prod, act_rate, churn_rate)

            profiles.append({
                "Cluster": cluster_id,
                "Persona_Title": persona_title,
                "Customer_Count": cnt,
                "Share_of_Total": cnt / total_customers,
                "Observed_Churn_Rate": churn_rate,
                "Churn_Contribution": churn_contrib,
                "Mean_Balance": mean_bal,
                "Mean_Age": mean_age,
                "Mean_Products": mean_prod,
                "Active_Member_Rate": act_rate,
                "Mean_Salary": mean_salary,
            })

        return pd.DataFrame(profiles).sort_values("Cluster").reset_index(drop=True)

    @staticmethod
    def _derive_persona_title(
        balance: float, age: float, products: float, active_rate: float, churn_rate: float
    ) -> str:
        """Assigns an empirical label based on quartile centroid patterns."""
        wealth = "Affluent" if balance > 90_000 else ("Mid-Tier" if balance > 20_000 else "Zero/Low Balance")
        activity = "Active" if active_rate > 0.55 else "Inactive"
        age_lbl = "Senior" if age > 45 else ("Young" if age < 33 else "Prime")
        return f"{wealth} {age_lbl} ({activity})"
