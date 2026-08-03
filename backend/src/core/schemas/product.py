from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from schemas.category import CategoryOut
# ------------------------------------------------------------------------------
# Product Schemas
# ------------------------------------------------------------------------------

class ProductBase(BaseModel):
    product_name: str = Field(..., examples="Organic Whole Milk 1L")
    category_id: Optional[int] = Field(None, examples=1)
    unit_price: float = Field(..., gt = 0, examples=3.49)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class ProductPatch(BaseModel):
    product_name: str = None
    category_id: Optional[int]
    unit_price: float = Field(None, gt = 0)

class ProductOut(ProductBase):
    id: int
    created_at: datetime
    category: Optional[CategoryOut]
    model_config = ConfigDict(from_attributes=True)