"""
Retain360 / BankSight AI — Survival Analysis & Dynamic Customer Lifetime Value (CLTV) Engine
=============================================================================================
Module: src/survival_analysis.py
Author: Principal Financial Data Scientist & Lead AI Engineer

Implements research-grounded survival analytics and customer lifetime valuation:
1. Non-parametric Kaplan-Meier survival curves S(t) with Greenwood confidence intervals
2. Semi-parametric Cox Proportional Hazards regression h(t|x) = h0(t) * exp(beta^T * x)
3. Dynamic Customer Lifetime Value (CLTV): CLTV_i = sum_t (MonthlyMargin_i * S(t|x_i)) / (1+r)^t
   where the retention horizon is dynamically truncated at max{t : S(t|x_i) > 0.10}.
"""
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import pandas as pd
from scipy.optimize import minimize


class KaplanMeierEstimator:
    """
    Non-parametric estimator of the survival function S(t) = P(T > t).
    Computes cumulative survival rates across banking tenure horizons (0–10 years).
    """

    @staticmethod
    def fit(durations: np.ndarray, events: np.ndarray) -> Dict[str, Any]:
        """
        Calculates Kaplan-Meier product-limit estimates and Greenwood standard errors.
        """
        durations = np.asarray(durations, dtype=float)
        events = np.asarray(events, dtype=int)

        unique_times = np.sort(np.unique(durations))
        n_at_risk = len(durations)
        survival_prob = 1.0

        timeline = [0.0]
        survival_curve = [1.0]
        cumulative_variance = [0.0]
        event_counts = [0]
        at_risk_counts = [n_at_risk]

        var_sum = 0.0

        for t in unique_times:
            if t == 0:
                continue
            mask_t = durations == t
            d_t = int(np.sum(events[mask_t]))  # deaths/churns at time t
            n_t = int(np.sum(durations >= t))  # number at risk just prior to t

            if n_t > 0:
                p_t = 1.0 - (d_t / n_t)
                survival_prob *= p_t

                if n_t > d_t and d_t > 0:
                    var_sum += d_t / (n_t * (n_t - d_t))

            timeline.append(float(t))
            survival_curve.append(float(np.clip(survival_prob, 0.0, 1.0)))
            cumulative_variance.append(float(var_sum))
            event_counts.append(d_t)
            at_risk_counts.append(n_t)

        # Greenwood 95% Confidence Intervals
        curve_arr = np.array(survival_curve)
        var_arr = np.array(cumulative_variance)
        se_arr = curve_arr * np.sqrt(var_arr)
        ci_lower = np.clip(curve_arr - 1.96 * se_arr, 0.0, 1.0).tolist()
        ci_upper = np.clip(curve_arr + 1.96 * se_arr, 0.0, 1.0).tolist()

        return {
            "timeline": timeline,
            "survival_probability": [round(p, 4) for p in survival_curve],
            "ci_lower": [round(p, 4) for p in ci_lower],
            "ci_upper": [round(p, 4) for p in ci_upper],
            "events": event_counts,
            "at_risk": at_risk_counts,
        }

    @classmethod
    def compare_cohorts(
        cls, df: pd.DataFrame, cohort_col: str, duration_col: str = "Tenure", event_col: str = "Exited"
    ) -> Dict[str, Any]:
        """
        Computes stratified Kaplan-Meier curves across customer sub-cohorts.
        """
        cohorts = {}
        for val, group in df.groupby(cohort_col):
            res = cls.fit(group[duration_col].values, group[event_col].values)
            cohorts[str(val)] = res
        return cohorts


class CoxPHSurvivalModel:
    """
    Semi-parametric Cox Proportional Hazards Model.
    Estimates covariate effect coefficients beta and individual survival curves S(t|x).
    """

    def __init__(self):
        self.feature_names: List[str] = []
        self.coefficients: np.ndarray = np.array([])
        self.hazard_ratios: Dict[str, float] = {}
        self.baseline_hazard: Dict[float, float] = {}
        self.baseline_survival: Dict[float, float] = {}
        self.fitted: bool = False

    def fit(
        self,
        X: pd.DataFrame,
        durations: np.ndarray,
        events: np.ndarray,
        l2_reg: float = 0.01,
    ) -> "CoxPHSurvivalModel":
        """
        Maximizes Cox partial log-likelihood with L2 ridge regularization.
        """
        # Try lifelines if installed; fallback to robust scipy numerical solver
        try:
            from lifelines import CoxPHFitter
            cph = CoxPHFitter(penalizer=l2_reg)
            train_df = X.copy()
            train_df["T"] = durations
            train_df["E"] = events
            cph.fit(train_df, duration_col="T", event_col="E")
            self.feature_names = list(X.columns)
            self.coefficients = cph.params_.values
            self.hazard_ratios = {col: round(float(np.exp(cph.params_[col])), 4) for col in self.feature_names}
            b_surv = cph.baseline_survival_
            self.baseline_survival = {float(t): float(s) for t, s in zip(b_surv.index, b_surv.iloc[:, 0])}
            self.fitted = True
            return self
        except Exception:
            pass

        # Numerical Scipy Implementation (Breslow's partial likelihood)
        X_mat = np.asarray(X, dtype=float)
        durations = np.asarray(durations, dtype=float)
        events = np.asarray(events, dtype=int)
        n_samples, n_features = X_mat.shape
        self.feature_names = list(X.columns)

        def neg_log_partial_likelihood(beta):
            theta = np.dot(X_mat, beta)
            theta = np.clip(theta, -20.0, 20.0)
            exp_theta = np.exp(theta)

            log_lik = 0.0
            unique_times = np.sort(np.unique(durations[events == 1]))

            for t in unique_times:
                at_risk = durations >= t
                sum_exp = np.sum(exp_theta[at_risk])
                if sum_exp > 0:
                    events_at_t = (durations == t) & (events == 1)
                    log_lik += np.sum(theta[events_at_t]) - np.sum(events_at_t) * np.log(sum_exp)

            # L2 regularization
            penalty = 0.5 * l2_reg * np.sum(beta**2)
            return -(log_lik - penalty)

        init_beta = np.zeros(n_features)
        res = minimize(neg_log_partial_likelihood, init_beta, method="L-BFGS-B")
        self.coefficients = res.x
        self.hazard_ratios = {
            self.feature_names[i]: round(float(np.exp(np.clip(self.coefficients[i], -10, 10))), 4)
            for i in range(n_features)
        }

        # Compute Breslow Baseline Hazard & Baseline Survival S0(t)
        unique_t = np.sort(np.unique(durations))
        cum_hazard = 0.0
        exp_xb = np.exp(np.clip(np.dot(X_mat, self.coefficients), -20, 20))

        self.baseline_survival = {0.0: 1.0}
        for t in unique_t:
            if t == 0:
                continue
            d_t = np.sum((durations == t) & (events == 1))
            sum_risk = np.sum(exp_xb[durations >= t])
            if sum_risk > 0:
                cum_hazard += d_t / sum_risk
            self.baseline_survival[float(t)] = float(np.exp(-cum_hazard))

        self.fitted = True
        return self

    def predict_survival_function(self, x_vector: np.ndarray, time_points: Optional[List[float]] = None) -> Dict[float, float]:
        """
        Calculates S(t|x) = [S0(t)]^exp(beta^T * x).
        """
        if not self.fitted:
            raise RuntimeError("Model is not fitted.")

        risk_score = float(np.exp(np.clip(np.dot(x_vector, self.coefficients), -15, 15)))
        if time_points is None:
            time_points = sorted(self.baseline_survival.keys())

        surv_curves = {}
        for t in time_points:
            s0 = self.baseline_survival.get(float(t), 1.0)
            surv_curves[float(t)] = round(float(np.clip(s0**risk_score, 0.0, 1.0)), 4)

        return surv_curves


class DynamicCLTVEngine:
    """
    Computes Dynamic Customer Lifetime Value (CLTV) by integrating customer survival probability
    over the active horizon until S(t|x) drops below the solvency threshold (10%).
    """

    @staticmethod
    def compute_customer_cltv(
        survival_curve: Dict[float, float],
        balance: float,
        num_products: int = 1,
        net_interest_margin: float = 0.025,
        annual_discount_rate: float = 0.06,
        survival_threshold: float = 0.10,
    ) -> Dict[str, Any]:
        """
        Parameters:
        -----------
        survival_curve : Dict[float, float]
            Yearly survival probabilities S(t|x) for t in 1..10.
        balance : float
            Current account balance in EUR.
        num_products : int
            Number of active bank products.
        net_interest_margin : float
            Annual net interest spread earned on balances (default 2.5%).
        annual_discount_rate : float
            Cost of capital / weighted average cost of capital (default 6%).
        survival_threshold : float
            Operational survival cutoff (default 0.10 / 10%).
        """
        # Monthly margin = (Balance * NIM / 12) + fee revenue per product (€12/mo/prod)
        monthly_margin = (balance * (net_interest_margin / 12.0)) + (num_products * 12.0)
        annual_margin = monthly_margin * 12.0

        # Sort years
        years = sorted([y for y in survival_curve.keys() if y > 0])
        if not years:
            years = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0]

        # Determine effective retention horizon T* = max{t : S(t) > threshold}
        active_years = [y for y in years if survival_curve.get(y, 0.0) >= survival_threshold]
        expected_lifespan_years = max(active_years) if active_years else 1.0

        # Discounted Cumulative Lifetime Value
        cltv_total = 0.0
        yearly_breakdown = []

        for yr in years:
            p_surv = survival_curve.get(yr, 0.0)
            discount_factor = 1.0 / ((1.0 + annual_discount_rate) ** yr)
            expected_cashflow = annual_margin * p_surv
            discounted_cashflow = expected_cashflow * discount_factor

            if yr <= expected_lifespan_years:
                cltv_total += discounted_cashflow

            yearly_breakdown.append({
                "year": yr,
                "survival_probability": round(p_surv, 4),
                "expected_margin_eur": round(expected_cashflow, 2),
                "discounted_value_eur": round(discounted_cashflow, 2),
                "cumulative_cltv_eur": round(cltv_total, 2),
            })

        # Value Tier Designation
        if cltv_total > 5000:
            value_tier = "Diamond VIP Tier"
        elif cltv_total > 2500:
            value_tier = "Gold High-Value"
        elif cltv_total > 1000:
            value_tier = "Silver Core Account"
        else:
            value_tier = "Bronze Low-Margin"

        return {
            "dynamic_cltv_eur": round(cltv_total, 2),
            "expected_retention_years": expected_lifespan_years,
            "monthly_margin_eur": round(monthly_margin, 2),
            "annual_margin_eur": round(annual_margin, 2),
            "value_tier": value_tier,
            "yearly_projections": yearly_breakdown,
        }

    @classmethod
    def evaluate_portfolio_cltv(
        cls, df: pd.DataFrame, cox_model: CoxPHSurvivalModel, feature_cols: List[str]
    ) -> pd.DataFrame:
        """
        Attaches Dynamic CLTV, expected lifespan, and value tier to every account in the portfolio.
        """
        results = []
        X_mat = df[feature_cols].values
        balances = df["Balance"].values
        products = df["NumOfProducts"].values if "NumOfProducts" in df.columns else np.ones(len(df))

        for i in range(len(df)):
            surv_curve = cox_model.predict_survival_function(X_mat[i], time_points=[1.0, 2.0, 3.0, 5.0, 7.0, 10.0])
            c_info = cls.compute_customer_cltv(
                surv_curve,
                balance=float(balances[i]),
                num_products=int(products[i]),
            )
            results.append({
                "Dynamic_CLTV_EUR": c_info["dynamic_cltv_eur"],
                "Expected_Lifespan_Years": c_info["expected_retention_years"],
                "Customer_Value_Tier": c_info["value_tier"],
                "Year_3_Survival_Prob": surv_curve.get(3.0, 0.5),
                "Year_5_Survival_Prob": surv_curve.get(5.0, 0.3),
            })

        return pd.concat([df.reset_index(drop=True), pd.DataFrame(results)], axis=1)
