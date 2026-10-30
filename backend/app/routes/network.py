"""
Retain360 / BankSight AI — Household Graph Analytics API Router
===============================================================
Module: backend/app/routes/network.py
Author: Principal Financial Data Scientist & Lead AI Engineer

Provides endpoints for:
1. Household Graph nodes and edges for 2D/3D force-directed network rendering
2. High Contagion Key Account alerts and spillover risk propagation
"""
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Query

from backend.app.database import get_scored_portfolio_df
from src.household_graph import HouseholdGraphEngine

router = APIRouter(prefix="/network", tags=["Household Graph & Churn Contagion"])

_CACHED_GRAPH = None


@router.get("/household-graph")
def get_household_graph(
    max_nodes: int = Query(120, ge=30, le=300),
    contagion_lambda: float = Query(0.25, ge=0.05, le=0.60),
):
    """
    Returns graph topology (nodes, edges, centrality, contagion scores) for interactive visualization.
    """
    df = get_scored_portfolio_df()
    engine = HouseholdGraphEngine(contagion_lambda=contagion_lambda)
    graph_data = engine.build_network(df, max_nodes=max_nodes)
    return graph_data
