from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


# ------------------------------------------------------------------------------
# Store Schemas
# ------------------------------------------------------------------------------

class StoreBase(BaseModel):
    store_name: str = Field(..., examples="Downtown Flagship")
    city: str  = Field(..., examples="Mumbai")

class StoreCreate(StoreBase):
    pass

class StoreUpdate(StoreBase):
    pass

class StoreOut(StoreBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

