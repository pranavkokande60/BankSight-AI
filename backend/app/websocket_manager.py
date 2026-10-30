"""
BankSight AI — Real-Time WebSocket Banking Operations Simulator
Streams live simulated European banking transactions, attrition alerts, and EARA retention triggers.
"""
import asyncio
import json
import random
import time
from typing import List, Dict, Any
from fastapi import WebSocket

LOCATIONS = [
    {"city": "Frankfurt", "country": "Germany"},
    {"city": "Munich", "country": "Germany"},
    {"city": "Berlin", "country": "Germany"},
    {"city": "Paris", "country": "France"},
    {"city": "Lyon", "country": "France"},
    {"city": "Marseille", "country": "France"},
    {"city": "Madrid", "country": "Spain"},
    {"city": "Barcelona", "country": "Spain"},
    {"city": "Valencia", "country": "Spain"},
]

EVENT_TYPES = [
    {
        "type": "LARGE_CAPITAL_WITHDRAWAL",
        "severity": "critical",
        "title": "High-Value Capital Flight Detected",
        "impact_score": 0.88,
        "msg_template": "Customer #{cid} in {city}, {country} executed wire transfer of €{amount:,.0f} to external asset manager. Real-time churn probability escalated to 86.4%.",
    },
    {
        "type": "MULTI_PRODUCT_CLIFF_ALERT",
        "severity": "warning",
        "title": "3rd Product Subscribed (Cliff Friction)",
        "impact_score": 0.74,
        "msg_template": "Customer #{cid} in {city} subscribed to an additional insurance product (Total: 3 Products). Triggered automated Multi-Product Cliff review.",
    },
    {
        "type": "INACTIVITY_DROP_FLAG",
        "severity": "warning",
        "title": "Account Engagement Drop",
        "impact_score": 0.65,
        "msg_template": "Customer #{cid} in {city} recorded zero online banking logins for 60 consecutive days. Inactivity multiplier applied (1.88x risk).",
    },
    {
        "type": "EARA_VIP_INTERVENTION",
        "severity": "success",
        "title": "EARA Retention Priority Triggered",
        "impact_score": 0.22,
        "msg_template": "EARA Engine successfully dispatched €120k balance protection package to Customer #{cid} in {city}. Churn risk dropped to 18.2%.",
    },
    {
        "type": "RECOURSE_ACTION_EXECUTED",
        "severity": "success",
        "title": "Counterfactual Recourse Applied",
        "impact_score": 0.19,
        "msg_template": "Customer #{cid} in {city} accepted product consolidation offer. Churn probability lowered by 48 percentage points.",
    },
]


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)


manager = ConnectionManager()


async def live_banking_simulator_loop():
    """Background task generating realistic real-time banking event telemetries."""
    while True:
        try:
            if manager.active_connections:
                loc = random.choice(LOCATIONS)
                event_def = random.choice(EVENT_TYPES)
                cid = random.randint(15600000, 15815000)
                amount = random.randint(25000, 140000)

                msg = event_def["msg_template"].format(
                    cid=cid,
                    city=loc["city"],
                    country=loc["country"],
                    amount=amount,
                )

                payload = {
                    "event_id": f"evt_{int(time.time() * 1000)}",
                    "timestamp": time.strftime("%H:%M:%S"),
                    "type": event_def["type"],
                    "severity": event_def["severity"],
                    "title": event_def["title"],
                    "message": msg,
                    "city": loc["city"],
                    "country": loc["country"],
                    "customer_id": cid,
                    "risk_score": event_def["impact_score"],
                }
                await manager.broadcast(payload)
        except Exception:
            pass
        await asyncio.sleep(2.5)
