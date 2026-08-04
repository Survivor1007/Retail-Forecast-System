# src/core/schemas/__init__.py

# 1. Base/Independent Schemas
from src.core.schemas.store import StoreBase, StoreCreate, StoreUpdate, StoreOut
from src.core.schemas.category import CategoryBase, CategoryCreate, CategoryOut

# 2. Level 1 Dependencies (Depends on Category)
from src.core.schemas.product import ProductBase, ProductCreate, ProductUpdate, ProductPatch, ProductOut

# 3. Level 2 Dependencies (Depends on Product)
from src.core.schemas.order import OrderItemCreate, OrderItemOut, SalesOrderCreate, SalesOrderOut

# 4. Domain & Analytical Schemas (Independent)
from src.core.schemas.etl import ETLUploadSummary, ETLAggregateRequest
from src.core.schemas.analytics import AnalyticsSummaryOut, DailyTrendPoint, TopProductOut
from src.core.schemas.forecasting import ForecastGenerateRequest, ForecastDataPoint, ForecastResultOut, ModelMetricOut
from src.core.schemas.inventory import InventoryAlertOut, ABCItemOut, ABCAnalysisOut, AlertDismissRequest


__all__ = [
    # Store
    "StoreBase", "StoreCreate", "StoreUpdate", "StoreOut",
    # Category
    "CategoryBase", "CategoryCreate", "CategoryOut",
    # Product
    "ProductBase", "ProductCreate", "ProductUpdate", "ProductPatch", "ProductOut",
    # Order
    "OrderItemCreate", "OrderItemOut", "SalesOrderCreate", "SalesOrderOut",
    # ETL
    "ETLUploadSummary", "ETLAggregateRequest",
    # Analytics
    "AnalyticsSummaryOut", "DailyTrendPoint", "TopProductOut",
    # Forecasting
    "ForecastGenerateRequest", "ForecastDataPoint", "ForecastResultOut", "ModelMetricOut",
    # Inventory
    "InventoryAlertOut", "ABCItemOut", "ABCAnalysisOut", "AlertDismissRequest",
]