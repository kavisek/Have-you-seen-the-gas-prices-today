import os
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, HTTPException, Query

from logger import logger

router = APIRouter()

# Resolve the data directory: prefer DATA_DIR env var, otherwise walk up from this file
_default_data_dir = Path(__file__).resolve().parent.parent.parent / "data"
DATA_DIR = Path(os.getenv("DATA_DIR", str(_default_data_dir)))
CSV_PATH = DATA_DIR / "canadian_hs_tariff_2026.csv"

_df: pd.DataFrame | None = None


def get_df() -> pd.DataFrame:
    global _df
    if _df is None:
        logger.info(f"Loading HS codes from {CSV_PATH}")
        try:
            _df = pd.read_csv(
                CSV_PATH,
                dtype=str,
                usecols=["TARIFF", "DESC1", "DESC2", "DESC3", "UOM", "MFN", "UST", "GPT", "General Tariff"],
            )
        except FileNotFoundError:
            raise
        except pd.errors.EmptyDataError:
            raise ValueError(f"HS codes CSV at {CSV_PATH} is empty")
        except pd.errors.ParserError as e:
            raise ValueError(f"Failed to parse HS codes CSV: {e}")
        except KeyError as e:
            raise ValueError(f"HS codes CSV is missing expected column: {e}")

        _df.fillna("", inplace=True)
        _df["description"] = (
            _df["DESC1"].str.strip()
            + _df["DESC2"].apply(lambda x: f" {x.strip()}" if x.strip() else "")
            + _df["DESC3"].apply(lambda x: f" {x.strip()}" if x.strip() else "")
        ).str.strip()
        _df.drop(columns=["DESC1", "DESC2", "DESC3"], inplace=True)
        _df.rename(columns={
            "TARIFF": "tariff",
            "UOM": "uom",
            "MFN": "mfn",
            "UST": "ust",
            "GPT": "gpt",
            "General Tariff": "general_tariff",
        }, inplace=True)
        logger.info(f"Loaded {len(_df)} HS code rows")
    return _df


@router.get("/", description="List Canadian HS codes with optional search and pagination.", tags=["HS Codes"])
async def list_hs_codes(
    q: str = Query(default="", description="Search by tariff code or description"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
):
    try:
        df = get_df()
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail=f"HS codes dataset not found at {CSV_PATH}")
    except ValueError as e:
        logger.error(f"HS codes data error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error loading HS codes: {e}")
        raise HTTPException(status_code=500, detail="Failed to load HS codes dataset")

    if q:
        try:
            mask = (
                df["tariff"].str.contains(q, case=False, na=False, regex=False)
                | df["description"].str.contains(q, case=False, na=False, regex=False)
            )
            df = df[mask]
        except Exception as e:
            logger.error(f"Search filter error for query {q!r}: {e}")
            raise HTTPException(status_code=400, detail=f"Invalid search query: {q!r}")

    try:
        total = len(df)
        start = (page - 1) * page_size
        page_data = df.iloc[start : start + page_size]

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": -(-total // page_size),
            "data": page_data.to_dict(orient="records"),
        }
    except Exception as e:
        logger.error(f"Error paginating HS codes results: {e}")
        raise HTTPException(status_code=500, detail="Failed to paginate results")
