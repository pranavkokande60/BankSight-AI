"""
BankSight AI — Customer Search & Profile Inspection API Router
Provides high-performance filtering across 10,000 European retail banking accounts.
"""
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Query, HTTPException
import math
import numpy as np
import pandas as pd

from backend.app.database import get_scored_portfolio_df

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("")
def list_customers(
    search: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    products: Optional[int] = Query(None),
    is_active: Optional[int] = Query(None),
    risk_category: Optional[str] = Query(None),
    exited: Optional[int] = Query(None),
    high_disagreement_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    sort_by: str = Query("Balance"),
    sort_dir: str = Query("desc"),
):
    df = get_scored_portfolio_df()
    filtered = df.copy()

    if search:
        s = search.lower().strip()
        filtered = filtered[
            filtered["CustomerId"].astype(str).str.contains(s, na=False) |
            filtered["Surname"].str.lower().str.contains(s, na=False)
        ]

    if country and country != "ALL":
        filtered = filtered[filtered["Geography"] == country]

    if products is not None and products > 0:
        filtered = filtered[filtered["NumOfProducts"] == products]

    if is_active is not None and is_active in [0, 1]:
        filtered = filtered[filtered["IsActiveMember"] == is_active]

    if risk_category and risk_category != "ALL" and "Risk_Category" in filtered.columns:
        filtered = filtered[filtered["Risk_Category"] == risk_category]

    if exited is not None and exited in [0, 1]:
        filtered = filtered[filtered["Exited"] == exited]

    if high_disagreement_only and "Model_Spread" in filtered.columns:
        filtered = filtered[filtered["Model_Spread"] >= 0.25]

    total_count = len(filtered)

    # Sorting
    if sort_by in filtered.columns:
        ascending = (sort_dir.lower() == "asc")
        filtered = filtered.sort_values(by=sort_by, ascending=ascending)

    paginated = filtered.iloc[offset : offset + limit]

    cols = [
        "CustomerId", "Surname", "CreditScore", "Geography", "Gender",
        "Age", "Tenure", "Balance", "NumOfProducts", "HasCrCard",
        "IsActiveMember", "EstimatedSalary", "Exited"
    ]
    if "Predicted_Churn_Prob" in paginated.columns:
        cols.extend(["Predicted_Churn_Prob", "Risk_Category", "Model_Spread", "Is_High_Disagreement"])

    records = paginated[[c for c in cols if c in paginated.columns]].to_dict(orient="records")

    return {
        "total_count": total_count,
        "offset": offset,
        "limit": limit,
        "customers": records,
    }


@router.get("/{customer_id}")
def get_customer_profile(customer_id: int):
    df = get_scored_portfolio_df()
    match = df[df["CustomerId"] == customer_id]
    if match.empty:
        raise HTTPException(status_code=404, detail=f"Customer with ID {customer_id} not found.")

    raw_dict = match.iloc[0].to_dict()
    # Sanitize NaN/Inf values so FastAPI can JSON-serialize without 500 error
    clean_dict = {}
    for k, v in raw_dict.items():
        if pd.isna(v) or (isinstance(v, float) and (np.isnan(v) or np.isinf(v))):
            clean_dict[k] = None
        else:
            clean_dict[k] = v
    return {"customer": clean_dict}
