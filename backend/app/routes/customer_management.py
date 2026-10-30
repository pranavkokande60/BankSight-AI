"""
BankSight AI — Customer Management REST API Router
=================================================
Provides endpoints for customer registration, strict field validation,
SQLite persistence, customer search, lifecycle updates, and real-time ML risk scoring.
"""
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query, Path as FPath, Body
from pydantic import BaseModel, Field

from src.customer_db import (
    add_customer,
    get_customer,
    update_customer,
    set_customer_status,
    search_customers,
    get_customer_count,
    generate_unique_customer_id,
    score_registered_customer,
    get_prediction_history,
)

router = APIRouter(prefix="/customer-management", tags=["Customer Management"])


class CustomerRegisterSchema(BaseModel):
    customer_id: Optional[int] = Field(None, description="Unique customer ID. If omitted, one is auto-generated.")
    surname: Optional[str] = Field(None, max_length=100, description="Optional surname (excluded from ML features).")
    credit_score: int = Field(..., ge=300, le=850, description="FICO Credit Score (300-850).")
    geography: str = Field(..., description="Country of residence ('France', 'Germany', 'Spain').")
    gender: str = Field(..., description="Demographic gender ('Female', 'Male').")
    age: int = Field(..., ge=18, le=100, description="Customer age (18-100).")
    tenure: int = Field(..., ge=0, le=10, description="Tenure in years (0-10).")
    balance: float = Field(..., ge=0.0, description="Account balance in Euros.")
    num_of_products: int = Field(..., ge=1, le=4, description="Number of products held (1-4).")
    has_cr_card: int = Field(..., ge=0, le=1, description="Credit card indicator (0 or 1).")
    is_active_member: int = Field(..., ge=0, le=1, description="Active membership indicator (0 or 1).")
    estimated_salary: float = Field(..., ge=0.0, description="Estimated annual salary in Euros.")
    record_status: Optional[str] = Field("ACTIVE", description="Lifecycle status ('ACTIVE', 'INACTIVE', 'ARCHIVED').")


class CustomerUpdateSchema(BaseModel):
    surname: Optional[str] = Field(None, max_length=100)
    credit_score: Optional[int] = Field(None, ge=300, le=850)
    geography: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = Field(None, ge=18, le=100)
    tenure: Optional[int] = Field(None, ge=0, le=10)
    balance: Optional[float] = Field(None, ge=0.0)
    num_of_products: Optional[int] = Field(None, ge=1, le=4)
    has_cr_card: Optional[int] = Field(None, ge=0, le=1)
    is_active_member: Optional[int] = Field(None, ge=0, le=1)
    estimated_salary: Optional[float] = Field(None, ge=0.0)
    record_status: Optional[str] = None


class StatusUpdateSchema(BaseModel):
    status: str = Field(..., description="New lifecycle status ('ACTIVE', 'INACTIVE', 'ARCHIVED').")


@router.get("/next-id")
async def get_next_customer_id():
    """Generates next available unique Customer ID checking both SQLite and historical records."""
    next_id = generate_unique_customer_id()
    return {"status": "success", "suggested_id": next_id}


@router.get("/summary")
async def get_summary_metrics():
    """Returns total, active, inactive, and archived counts in SQLite."""
    return {
        "status": "success",
        "total": get_customer_count(None),
        "active": get_customer_count("ACTIVE"),
        "inactive": get_customer_count("INACTIVE"),
        "archived": get_customer_count("ARCHIVED"),
    }


@router.post("/register")
async def register_customer(payload: CustomerRegisterSchema):
    """
    Registers a new banking customer with strict validation.
    The 'exited' field is strictly NULL (unknown future outcome).
    """
    data = payload.model_dump()
    if data.get("customer_id") is None:
        data["customer_id"] = generate_unique_customer_id()

    try:
        saved = add_customer(data)
        return {
            "status": "success",
            "message": f"Customer {saved['customer_id']} successfully registered.",
            "customer": saved,
        }
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Database error: {str(exc)}")


@router.get("/customers")
async def list_customers(
    query: Optional[str] = Query(None, description="Search query by Customer ID or Surname"),
    status: Optional[str] = Query("ALL", description="Filter by status ('ALL', 'ACTIVE', 'INACTIVE', 'ARCHIVED')"),
    limit: int = Query(100, ge=1, le=1000),
):
    """Lists registered customers with optional substring search and status filter."""
    results = search_customers(query=query, status=status, limit=limit)
    return {
        "status": "success",
        "count": len(results),
        "customers": results,
    }


@router.get("/customers/{customer_id}")
async def get_single_customer(customer_id: int = FPath(..., description="Customer ID")):
    """Retrieves full profile for a registered customer."""
    cust = get_customer(customer_id)
    if not cust:
        raise HTTPException(status_code=404, detail=f"Customer ID {customer_id} not found.")
    return {"status": "success", "customer": cust}


@router.put("/customers/{customer_id}")
async def update_single_customer(
    customer_id: int = FPath(..., description="Customer ID"),
    payload: CustomerUpdateSchema = Body(...),
):
    """Updates customer fields with strict validation. Customer ID cannot be changed."""
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    try:
        updated = update_customer(customer_id, data)
        return {
            "status": "success",
            "message": f"Customer {customer_id} updated.",
            "customer": updated,
        }
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Customer ID {customer_id} not found.")
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Database error: {str(exc)}")


@router.patch("/customers/{customer_id}/status")
async def update_status(
    customer_id: int = FPath(..., description="Customer ID"),
    payload: StatusUpdateSchema = Body(...),
):
    """Soft updates customer lifecycle status ('ACTIVE', 'INACTIVE', 'ARCHIVED')."""
    try:
        updated = set_customer_status(customer_id, payload.status)
        return {
            "status": "success",
            "message": f"Customer {customer_id} status updated to {payload.status}.",
            "customer": updated,
        }
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Customer ID {customer_id} not found.")
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Database error: {str(exc)}")


@router.post("/customers/{customer_id}/predict")
async def run_live_prediction(
    customer_id: int = FPath(..., description="Customer ID"),
    save_history: bool = Query(True, description="Whether to append result to prediction history"),
):
    """
    Scores customer churn risk using loaded trained ML models.
    Returns predicted churn probability, risk tier, SHAP attributions,
    cluster persona, model disagreement spread, and data quality advisories.
    """
    try:
        result = score_registered_customer(customer_id, save_to_history=save_history)
        return {
            "status": "success",
            "prediction": result,
        }
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Customer ID {customer_id} not found.")
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=503, detail=str(fnf))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Scoring error: {str(exc)}")


@router.get("/customers/{customer_id}/history")
async def get_customer_history(
    customer_id: int = FPath(..., description="Customer ID"),
    limit: int = Query(50, ge=1, le=100),
):
    """Retrieves chronological prediction history for auditing and compliance."""
    cust = get_customer(customer_id)
    if not cust:
        raise HTTPException(status_code=404, detail=f"Customer ID {customer_id} not found.")
    history = get_prediction_history(customer_id, limit=limit)
    return {
        "status": "success",
        "customer_id": customer_id,
        "count": len(history),
        "history": history,
    }
