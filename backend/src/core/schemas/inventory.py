from pydantic import BaseModel, Field
from typing import List

# ------------------------------------------------------------------------------
# Inventory Intelligence & Risk Schemas
# ------------------------------------------------------------------------------
class InventoryAlertOut(BaseModel):
    id: str
    product_id: int
    product_name: str
    store_id: int
    store_name: str
    alert_type: str  # "STOCKOUT_RISK", "DEADSTOCK_RISK"
    severity: str    # "HIGH", "MEDIUM", "LOW"
    description: str
    metric_value: float
    recommended_action: str
class ABCItemOut(BaseModel):
    product_id: int
    product_name: str
    total_revenue: float
    revenue_share_pct: float
    cumulative_revenue_pct: float
    abc_class: str  # "A", "B", "C"
class ABCAnalysisOut(BaseModel):
    class_a_count: int
    class_b_count: int
    class_c_count: int
    items: List[ABCItemOut]
class AlertDismissRequest(BaseModel):
    status: str = Field("dismissed", example="dismissed")