from sqlalchemy import text
# from src.core.models import DailySalesAggregate
from datetime import date
from sqlalchemy.orm import Session


class ETLAggregate:
    @staticmethod
    def rebuild_daily_aggregates(db: Session, target_date: date = None) -> int:
        """
        Uses high-performance SQL UPSERT window aggregations to populate daily_sales_aggregates.
        """
        sql_query = """
            INSERT INTO daily_sales_aggregates (sales_date, store_id, product_id, total_quantity_sold, total_revenue, total_orders)
            SELECT 
                DATE(so.order_date) AS sales_date,
                so.store_id,
                oi.product_id,
                SUM(oi.quantity_sold) AS total_quantity_sold,
                SUM(oi.total_sales) AS total_revenue,
                COUNT(DISTINCT so.id) AS total_orders
            FROM sales_orders so
            JOIN order_items oi ON so.id = oi.order_id
            """

        if target_date:
            sql_query += f" WHERE DATE(so.order_date) = '{target_date}'"

        sql_query += """
            GROUP BY DATE(so.order_date), so.product_id, io.product_id
            ON CONFLICT (sales_date, store_id, product_id) DO UPDATE  SET 
                total_quantity_sold = EXCLUDED.total_quantity_sold,
                total_revenue = EXCLUDED.total_revenue,
                total_orders = EXCLUDED.total_orders;
        """

        result = db.execute(text(sql_query))
        db.commit()
        return result.rowcount
