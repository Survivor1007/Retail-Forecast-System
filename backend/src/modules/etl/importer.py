import io
import pandas as pd
from sqlalchemy.orm import Session
# from sqlalchemy import text
from src.modules.etl import DataCleaner
from src.core.models import SalesOrder, OrderItem
from src.modules.etl import ETLAggregate

class ETLImport:
    @staticmethod
    def process_csv_file(db: Session, file_contents: bytes) -> dict:
        """
        Parses raw CSV bytes, cleans dataset, inserts sales orders & line items,
        and triggers daily aggregate calculation.
        """

        df = pd.read_csv(io.BytesIO(file_contents))
        cleaned_df, dropped_rows = DataCleaner.clean_raw_sales_df(df)
        if cleaned_df.empty:
            return {
                "total_rows_ingested": len(df),
                "clean_rows_inserted": 0,
                "invalid_rows_skipped": dropped_rows,
                "message": "No valid rows found after cleaning."
            }

        inserted_items = 0
        # Group by order_date and store_id to create orders
        for (order_datetime, store_id), group in cleaned_df.groupby(["order_date", "store_id"]):
            sales_order = SalesOrder(
                order_date=order_datetime,
                store_id=int(store_id),
                customer_type="Retail",
                payment_mode="Cash"
            )
            db.add(sales_order)
            db.flush()  # Retrieve sales_order.id
            for _, row in group.iterrows():
                order_item = OrderItem(
                    order_id=sales_order.id,
                    product_id=int(row["product_id"]),
                    quantity_sold=int(row["quantity_sold"]),
                    unit_price=float(row["unit_price"]),
                    discount_amount=float(row["discount_amount"]),
                    tax_amount=float(row["tax_amount"]),
                    total_sales=float(row["total_sales"])
                )
                db.add(order_item)
                inserted_items += 1
        db.commit()

        # Update daily sales aggregates
        ETLAggregate.rebuild_daily_aggregates(db)

        return {
            "total_rows_ingested": len(df),
            "clean_rows_inserted": inserted_items,
            "invalid_rows_skipped": dropped_rows,
            "message": "Data ingestion and aggregate recalculation complete."
        }