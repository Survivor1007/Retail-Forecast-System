from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

# ------------------------------------------------------------------------------
# Forecasting Schemas
# ------------------------------------------------------------------------------
class ForecastGenerateRequest(BaseModel):
    horizon_days: int = Field(7, ge=1, le=60)
    store_id: Optional[int] = None
    product_id: Optional[int] = None

class ForecastDataPoint(BaseModel):
    date: date
    actual_quantity: Optional[float] = None
    predicted_quantity: float
    confidence_lower: float
    confidence_upper: float
    
class ForecastResultOut(BaseModel):
    product_id: int
    product_name: str
    store_id: int
    winning_model: str
    mape_score: Optional[float] = None
    rmse_score: Optional[float] = None
    forecast_points: List[ForecastDataPoint]

class ModelMetricOut(BaseModel):
    product_id: int
    product_name: str
    store_id: int
    winning_model: str
    sma_mape: Optional[float] = None
    ridge_mape: Optional[float] = None
    selected_mape: Optional[float] = None