from datetime import date
from pydantic import BaseModel
from typing import Optional

# ------------------------------------------------------------------------------
# ETL Schemas
# ------------------------------------------------------------------------------
class ETLUploadSummary(BaseModel):
    total_rows_ingested: int
    clean_rows_inserted: int
    invalid_rows_skipped: int
    message: str
class ETLAggregateRequest(BaseModel):
    target_date: Optional[date] = None
