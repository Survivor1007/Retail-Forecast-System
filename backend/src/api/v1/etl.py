from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.schemas import ETLUploadSummary, ETLAggregateRequest
from src.modules.etl.importer import ETLImport, ETLAggregate

router = APIRouter(prefix="/etl", tags=["ETL Data Pipeline"])

@router.post("/upload", response_model=ETLUploadSummary, status_code=status.HTTP_200_OK)
async def upload_sales_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Ingests and processes raw sales CSV data.
    Sanitizes invalid rows, inserts line items, and updates daily aggregate statistics.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only CSV files are supported")
    contents = await file.read()
    try:
        result = ETLImport.process_csv_file(db, contents)
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"ETL pipeline processing error: {str(e)}")

@router.post("/aggregate", status_code=status.HTTP_200_OK)
def trigger_daily_aggregates(payload: ETLAggregateRequest, db: Session = Depends(get_db)):
    """
    Manually triggers daily sales SQL window aggregate recalculation.
    """
    rows_affected = ETLAggregate.rebuild_daily_aggregates(db, target_date=payload.target_date)
    return {"message": "Daily sales aggregate recalculation complete", "records_aggregated": rows_affected}