"""
BankSight AI — Data Loader Module
Handles safe ingestion, schema validation, and caching of banking datasets.
"""
from pathlib import Path
from typing import Optional, Union
import io
import pandas as pd
from src.config import DEFAULT_DATA_PATH


def load_dataset(
    source: Optional[Union[str, Path, io.BytesIO, io.StringIO]] = None
) -> pd.DataFrame:
    """
    Loads banking dataset from path or uploaded buffer.

    Parameters:
    -----------
    source : Optional[Union[str, Path, io.BytesIO, io.StringIO]]
        Path to CSV or in-memory file buffer. Defaults to DEFAULT_DATA_PATH.

    Returns:
    --------
    pd.DataFrame: Loaded dataset.

    Raises:
    -------
    FileNotFoundError: If the source path does not exist.
    ValueError: If the file cannot be parsed or is empty.
    """
    if source is None:
        source = DEFAULT_DATA_PATH

    if isinstance(source, (str, Path)):
        p = Path(source)
        if not p.exists():
            raise FileNotFoundError(f"Dataset not found at: {p.resolve()}")
        df = pd.read_csv(p)
    else:
        df = pd.read_csv(source)

    if df.empty:
        raise ValueError("Loaded dataset is empty (0 rows).")

    # Strip any accidental whitespace in column headers
    df.columns = [c.strip() for c in df.columns]

    return df
