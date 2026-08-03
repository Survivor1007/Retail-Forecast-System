from pydantic import BaseModel, ConfigDict, Field

# ------------------------------------------------------------------------------
# Category Schemas
# ------------------------------------------------------------------------------

class CategoryBase(BaseModel):
    category_name: str = Field(..., examples="Dairy & Refrigerated")

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)