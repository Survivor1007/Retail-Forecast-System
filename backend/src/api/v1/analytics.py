from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.schemas import AnalyticsSummaryOut, DailyTrendPoint, TopProductOut
from src.modules import AnalyticsEngine

router = APIRouter(prefix="/analytics", tags=["Historical Analytics Engine"])

@router.get("/summary", response_model=AnalyticsSummaryOut)
def get_analytics_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    store_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get high-level dashboard business KPI metrics summary."""
    return AnalyticsEngine.get_summary_metrics(db, start_date=start_date, end_date=end_date, store_id=store_id)

@router.get("/daily-trends", response_model=List[DailyTrendPoint])
def get_daily_trends(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    store_id: Optional[int] = None,
    product_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Retrieve daily time-series sales aggregations for charts."""
    return AnalyticsEngine.get_daily_sales_trends(
        db, start_date=start_date, end_date=end_date, store_id=store_id, product_id=product_id
    )

@router.get("/top-products", response_model=List[TopProductOut])
def get_top_products(
    by: str = Query("revenue", regex="^(revenue|volume)$"),
    limit: int = Query(10, ge=1, le=50),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Get top performing products ranked by revenue or volume."""
    return AnalyticsEngine.get_top_products(
        db, metric=by, limit=limit, start_date=start_date, end_date=end_date
    )