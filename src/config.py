"""
BankSight AI — Global Configuration and Constants
"""
import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"
ASSETS_DIR = BASE_DIR / "assets"
DOCS_DIR = BASE_DIR / "docs"
MPL_CACHE_DIR = BASE_DIR / ".matplotlib_cache"

# Set matplotlib configuration dir to avoid sandboxed permission issues on Windows
os.environ["MPLCONFIGDIR"] = str(MPL_CACHE_DIR)

# Ensure runtime directories exist
DATA_DIR.mkdir(exist_ok=True)
MODELS_DIR.mkdir(exist_ok=True)
REPORTS_DIR.mkdir(exist_ok=True)
ASSETS_DIR.mkdir(exist_ok=True)
DOCS_DIR.mkdir(exist_ok=True)
MPL_CACHE_DIR.mkdir(exist_ok=True)

DEFAULT_DATA_PATH = DATA_DIR / "European_Bank.csv"
CUSTOMER_DB_PATH = DATA_DIR / "customers.db"
MODEL_ARTIFACTS_PATH = MODELS_DIR / "banksight_models.joblib"
SEGMENTATION_ARTIFACTS_PATH = MODELS_DIR / "segmentation_models.joblib"

# Reproducibility
RANDOM_STATE = 42

# Column Schema Definitions
TARGET_COL = "Exited"
ID_COL = "CustomerId"
NAME_COL = "Surname"
YEAR_COL = "Year"

PII_COLUMNS = [ID_COL, NAME_COL]
UNINFORMATIVE_COLUMNS = [YEAR_COL]

NUMERIC_FEATURES = [
    "CreditScore",
    "Age",
    "Tenure",
    "Balance",
    "NumOfProducts",
    "EstimatedSalary",
]

BINARY_FEATURES = [
    "HasCrCard",
    "IsActiveMember",
]

CATEGORICAL_FEATURES = [
    "Geography",
    "Gender",
]

# Raw features to use in model training (strictly excluding PII, Year, and Target)
MODEL_FEATURE_COLS = NUMERIC_FEATURES + BINARY_FEATURES + CATEGORICAL_FEATURES

# Engineered feature names
ENGINEERED_NUMERIC = [
    "BalanceSalaryRatio",
    "CreditScoreAgeRatio",
    "ProductPerTenure",
]
ENGINEERED_BINARY = [
    "IsZeroBalance",
    "IsMultiProductRisk",
]

# Risk Tier Thresholds
RISK_TIERS = {
    "Low Risk": (0.0, 0.25),
    "Moderate Risk": (0.25, 0.50),
    "High Risk": (0.50, 0.75),
    "Critical Risk": (0.75, 1.01),
}

# Theme Colors (Dark Futuristic Glassmorphism)
THEME_COLORS = {
    "bg_main": "#0b0f19",
    "bg_card": "rgba(19, 27, 46, 0.7)",
    "primary": "#00d4ff",
    "secondary": "#818cf8",
    "accent_cyan": "#38bdf8",
    "accent_magenta": "#c084fc",
    "accent_emerald": "#10b981",
    "accent_rose": "#f43f5e",
    "accent_amber": "#f59e0b",
    "text_main": "#f1f5f9",
    "text_muted": "#94a3b8",
    "border": "rgba(56, 189, 248, 0.18)",
}
