import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

endpoints = [
    # Static & App Root
    ("/", "GET", None),
    ("/pranav_avatar.jpg", "GET", None),
    ("/bank_hero.jpg", "GET", None),
    
    # Auth Endpoints
    ("/api/v1/auth/demo-accounts", "GET", None),
    ("/api/v1/auth/login", "POST", {"username": "pranav"}),
    
    # Dashboard & Operations
    ("/api/v1/dashboard/summary", "GET", None),
    ("/api/v1/dashboard/charts", "GET", None),
    ("/api/v1/dashboard/ai-summary", "GET", None),
    ("/api/v1/notifications", "GET", None),
    ("/api/v1/search?q=France", "GET", None),
    ("/api/v1/data-quality", "GET", None),
    
    # Customers
    ("/api/v1/customers?limit=10", "GET", None),
    ("/api/v1/customers/15634602", "GET", None),
    
    # Segmentation & 3D Galaxy
    ("/api/v1/segmentation/clusters", "GET", None),
    ("/api/v1/segmentation/galaxy", "GET", None),
    
    # Models & Predictions
    ("/api/v1/models", "GET", None),
    ("/api/v1/predictions/score", "POST", {
        "features": {
            "CreditScore": 650, "Geography": "France", "Gender": "Female",
            "Age": 40, "Tenure": 3, "Balance": 60000.0, "NumOfProducts": 2,
            "HasCrCard": 1, "IsActiveMember": 1, "EstimatedSalary": 50000.0
        }
    }),
    ("/api/v1/predictions/counterfactual", "POST", {
        "customer_id": 15634602,
        "target_churn_prob": 0.25
    }),
    ("/api/v1/predictions/explain", "POST", {
        "customer_id": 15634602
    }),
    
    # EARA (Retention Allocation)
    ("/api/v1/eara/allocate?budget=500", "GET", None),
    
    # Fairness
    ("/api/v1/fairness/audit", "GET", None),
    
    # Simulator
    ("/api/v1/simulator/scenarios?budget=1000", "GET", None),
    ("/api/v1/simulator/stress-test", "GET", None),
    
    # Assistant (AI Banking Chat)
    ("/api/v1/assistant/chat", "POST", {"message": "What is the average customer balance?", "history": []}),
    
    # Reports
    ("/api/v1/reports/executive", "GET", None),
    ("/api/v1/reports/paper", "GET", None),
    ("/api/v1/reports/government-summary", "GET", None),
    
    # Advanced Analytics: Survival, Uplift, Graph, MLOps Drift
    ("/api/v1/survival/kaplan-meier", "GET", None),
    ("/api/v1/survival/cox-hazards", "GET", None),
    ("/api/v1/survival/cltv", "GET", None),
    ("/api/v1/uplift/summary", "GET", None),
    ("/api/v1/uplift/accounts", "GET", None),
    ("/api/v1/network/household-graph", "GET", None),
    ("/api/v1/mlops/psi-drift", "GET", None),
    
    # Analytics Visualizer
    ("/api/v1/visualizer/metadata", "GET", None),
    ("/api/v1/visualizer/data?limit=50", "GET", None),
    
    # Customer Management
    ("/api/v1/customer-management/next-id", "GET", None),
    ("/api/v1/customer-management/summary", "GET", None),
    ("/api/v1/customer-management/customers?limit=10", "GET", None),
    ("/api/v1/customer-management/customers/15820005", "GET", None),
]

passed = 0
failed = 0
results = []

for path, method, data in endpoints:
    url = f"{BASE_URL}{path}"
    try:
        req = urllib.request.Request(url, method=method)
        if data:
            req.add_header('Content-Type', 'application/json')
            body = json.dumps(data).encode('utf-8')
            res = urllib.request.urlopen(req, data=body, timeout=15)
        else:
            res = urllib.request.urlopen(req, timeout=15)
        
        status = res.getcode()
        content_len = len(res.read())
        results.append((path, method, status, f"OK ({content_len} bytes)"))
        passed += 1
    except urllib.error.HTTPError as e:
        results.append((path, method, e.code, f"HTTP Error: {e.read().decode('utf-8', errors='ignore')[:150]}"))
        failed += 1
    except Exception as e:
        results.append((path, method, "ERR", str(e)))
        failed += 1

print(f"\n{'='*80}")
print(f"BankSight AI Comprehensive Test Suite: {passed} PASSED, {failed} FAILED / {len(endpoints)} TOTAL")
print(f"{'='*80}")
for path, method, status, msg in results:
    flag = "[PASS]" if status in [200, 201] else "[FAIL]"
    print(f"{flag} {method:4} {path:46} -> {status} : {msg}")
print(f"{'='*80}\n")

if failed > 0:
    sys.exit(1)
else:
    sys.exit(0)
