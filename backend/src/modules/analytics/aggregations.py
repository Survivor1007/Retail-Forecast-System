# ===============================================================
# analytics/aggregations.py
# Function: Reading analytical information from database
# ===============================================================
from datetime import date
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from src.core.models import DailySalesAggregate, Product, Category

class AnalyticsEngine:
    @staticmethod
    def get_summary_metrics(
        db: Session, 
        start_date: Optional[date] = None, 
        end_date: Optional[date] = None, 
        store_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Executes optimized SQL aggregations for high-level dashboard KPI summary cards.
        """
        query = db.query(
            func.coalesce(func.sum(DailySalesAggregate.total_revenue), 0).label("total_revenue"),
            func.coalesce(func.sum(DailySalesAggregate.total_quantity_sold), 0).label("total_units"),
            func.coalesce(func.sum(DailySalesAggregate.total_orders), 0).label("total_orders"),
            func.count(func.distinct(DailySalesAggregate.store_id)).label("active_stores"),
            func.count(func.distinct(DailySalesAggregate.product_id)).label("active_products")
        )

        if start_date:
            query = query.filter(DailySalesAggregate.sales_date >= start_date)
        if end_date:
            query = query.filter(DailySalesAggregate.sales_date <= end_date)
        if store_id:
            query = query.filter(DailySalesAggregate.store_id == store_id)

        result = query.first()

        total_rev = float(result.total_revenue or 0.0)
        total_orders = int(result.total_orders or 0)
        aov = round(total_rev / total_orders, 2) if total_orders > 0 else 0.0

        return {
            "total_revenue": total_rev,
            "total_units_sold": int(result.total_units or 0),
            "total_orders": total_orders,
            "average_order_value": aov,
            "active_stores": int(result.active_stores or 0),
            "active_products": int(result.active_products or 0)
        }

    @staticmethod
    def get_daily_sales_trends(
        db: Session, 
        start_date: Optional[date] = None, 
        end_date: Optional[date] = None, 
        store_id: Optional[int] = None,
        product_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieves daily aggregated sales time series data for charting.
        """
        query = db.query(
            DailySalesAggregate.sales_date,
            func.sum(DailySalesAggregate.total_quantity_sold).label("total_quantity"),
            func.sum(DailySalesAggregate.total_revenue).label("total_revenue"),
            func.sum(DailySalesAggregate.total_orders).label("total_orders")
        ).group_by(DailySalesAggregate.sales_date).order_by(DailySalesAggregate.sales_date)

        if start_date:
            query = query.filter(DailySalesAggregate.sales_date >= start_date)
        if end_date:
            query = query.filter(DailySalesAggregate.sales_date <= end_date)
        if store_id:
            query = query.filter(DailySalesAggregate.store_id == store_id)
        if product_id:
            query = query.filter(DailySalesAggregate.product_id == product_id)

        records = query.all()
        return [
            {
                "sales_date": r.sales_date,
                "total_quantity": int(r.total_quantity or 0),
                "total_revenue": float(r.total_revenue or 0.0),
                "total_orders": int(r.total_orders or 0)
            }
            for r in records
        ]

    @staticmethod
    def get_top_products(
        db: Session, 
        metric: str = "revenue", 
        limit: int = 10,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieves top performing products ranked by revenue or quantity sold.
        """
        sort_col = func.sum(DailySalesAggregate.total_revenue) if metric == "revenue" else func.sum(DailySalesAggregate.total_quantity_sold)

        query = db.query(
            Product.id.label("product_id"),
            Product.product_name,
            Category.category_name,
            func.sum(DailySalesAggregate.total_quantity_sold).label("total_quantity_sold"),
            func.sum(DailySalesAggregate.total_revenue).label("total_revenue")
        ).join(Product, DailySalesAggregate.product_id == Product.id).outerjoin(Category, Product.category_id == Category.id)

        if start_date:
            query = query.filter(DailySalesAggregate.sales_date >= start_date)
        if end_date:
            query = query.filter(DailySalesAggregate.sales_date <= end_date)

        query = query.group_by(Product.id, Product.product_name, Category.category_name).order_by(desc(sort_col)).limit(limit)

        records = query.all()
        return [
            {
                "product_id": r.product_id,
                "product_name": r.product_name,
                "category_name": r.category_name,
                "total_quantity_sold": int(r.total_quantity_sold or 0),
                "total_revenue": float(r.total_revenue or 0.0)
            }
            for r in records
        ]
