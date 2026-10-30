"""
BankSight AI — Authentication & Demo Analyst Roles
Provides token-based authentication and pre-configured European banking analyst profiles.
"""
from typing import Dict, Any, List, Optional
import time

DEMO_ACCOUNTS = [
    {
        "id": "usr_ds_02",
        "email": "pranav.kokande@banksight.eu",
        "name": "Pranav Kokande",
        "role": "Lead Quantitative Researcher & AI Architect",
        "department": "Advanced Analytics & XAI Lab",
        "avatar": "/pranav_avatar.jpg",
        "token": "banksight_token_lead_data_scientist_2026",
    },
]


def authenticate_user(email: str, password: str = "") -> Optional[Dict[str, Any]]:
    for acc in DEMO_ACCOUNTS:
        if acc["email"].lower() == email.lower() or "pranav" in email.lower():
            return acc
    return DEMO_ACCOUNTS[0]


def get_account_by_token(token: str) -> Optional[Dict[str, Any]]:
    for acc in DEMO_ACCOUNTS:
        if acc["token"] == token:
            return acc
    if token.startswith("banksight_token_"):
        return DEMO_ACCOUNTS[0]
    return None
