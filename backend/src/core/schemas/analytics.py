from pydantic import BaseModel
from datetime import date
from typing import Optional

# -----------------------------------------------------------------------------
# Analytics Schemas
# ------------------------------------------------------------------------------
class AnalyticsSummaryOut(BaseModel):
    total_revenue: float
    total_units_sold: int
    total_orders: int
    average_order_value: float
    active_stores: int
    active_products: int

class DailyTrendPoint(BaseModel):
    sales_date: date
    total_quantity: int
    total_revenue: float
    total_orders: int
    
class TopProductOut(BaseModel):
    product_id: int
    product_name: str
    category_name: Optional[str] = None
    total_quantity_sold: int
    total_revenue: float