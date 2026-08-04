# ----------------------------------------------------------------------------------------
# src/core/models/__init__.py
# Function: Export  all models from __init__.py, the rest of your application can import models smoothly without knowing where they reside physically
# ----------------------------------------------------------------------------------------

from src.core.database import Base
from src.core.models.store import Store
from src.core.models.category import Category
from src.core.models.product import Product
from src.core.models.order import SalesOrder, OrderItem
from src.core.models.aggregate import DailySalesAggregate
from src.core.models.forecast import ForecastResult

__all__ = [
    "Base",
    "Store",
    "Category",
    "Product",
    "SalesOrder",
    "OrderItem",
    "DailySalesAggregate",
    "ForecastResult",
]