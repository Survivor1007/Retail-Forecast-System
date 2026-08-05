from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from src.core.schemas import ProductOut
# ------------------------------------------------------------------------------
# Sales Order Schemas
# ------------------------------------------------------------------------------

class OrderItemCreate(BaseModel):
    product_id: int
    quantity_sold: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    discount_amount: float = Field(0.0, ge=0)
    tax_amount: float = Field(0.0, ge=0)

class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity_sold: int
    unit_price: float
    discount_amount: float
    tax_amount: float
    total_sales: float
    product: Optional[ProductOut] = None
    model_config = ConfigDict(from_attributes=True)

class SalesOrderCreate(BaseModel):
    order_date: datetime
    store_id: int
    customer_type: str = "Retail"
    payment_mode: str = "Cash"
    items: List[OrderItemCreate]
    
class SalesOrderOut(BaseModel):
    id: int
    order_date: datetime
    store_id: int
    customer_type: str
    payment_mode: str
    created_at: datetime
    items: List[OrderItemOut] = []
    model_config = ConfigDict(from_attributes=True)