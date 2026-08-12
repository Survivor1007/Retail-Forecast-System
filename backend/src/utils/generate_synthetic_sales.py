import random
from datetime import date, datetime, timedelta
import pandas as pd
from sqlalchemy.orm import Session
from ..core.database import SessionLocal
from ..core.models import Store, Product, SalesOrder, OrderItem
from ..modules import ETLAggregate

def generate_synthetic_data(days_history: int = 10, db: Session = None):
    """
    Generates realistic synthetic retail transactional sales history over specified days.
    Includes day-of-week seasonality, trend index, and price discounts.
    """
    close_session_at_end = False
    if db is None:
        db = SessionLocal()
        close_session_at_end = True

    try:
        # Ensure seed stores and products exist
        stores = db.query(Store).all()
        products = db.query(Product).all()

        if not stores or not products:
            print("No stores or products found. Please seed master database tables first.")
            return

        print(f"Generating {days_history} days of synthetic sales transactions across {len(stores)} stores and {len(products)} products...")

        end_date = date.today()
        start_date = end_date - timedelta(days=days_history)

        total_orders_created = 0
        total_items_created = 0

        current_date = start_date
        while current_date <= end_date:
            day_of_week = current_date.weekday() # 0 = Mon, 6 = Sun
            # Weekend multiplier for realistic retail pattern
            weekend_factor = 1.6 if day_of_week in [5, 6] else 1.0

            for store in stores:
                # Number of orders per store per day
                num_orders = int(random.randint(5, 15) * weekend_factor)

                for _ in range(num_orders):
                    order_time = datetime.combine(
                        current_date, 
                        datetime.min.time()
                    ) + timedelta(hours=random.randint(8, 20), minutes=random.randint(0, 59))

                    order = SalesOrder(
                        order_date=order_time,
                        store_id=store.id,
                        customer_type=random.choice(["Retail", "Member", "Wholesale"]),
                        payment_mode=random.choice(["Cash", "Card", "UPI", "Mobile"])
                    )
                    db.add(order)
                    db.flush()

                    total_orders_created += 1

                    # 1 to 4 products per order
                    purchased_products = random.sample(products, random.randint(1, min(4, len(products))))
                    for prod in purchased_products:
                        base_qty = random.randint(1, 5)
                        # Add seasonality spike for dairy/beverage
                        if prod.category_id in [1, 3] and day_of_week in [4, 5]:
                            base_qty += random.randint(1, 3)

                        unit_price = float(prod.unit_price)
                        discount = round(unit_price * random.choice([0.0, 0.0, 0.0, 0.1, 0.15]), 2)
                        tax = round((unit_price * base_qty - discount) * 0.05, 2)
                        total_sales = round((base_qty * unit_price) - discount + tax, 2)

                        item = OrderItem(
                            order_id=order.id,
                            product_id=prod.id,
                            quantity_sold=base_qty,
                            unit_price=unit_price,
                            discount_amount=discount,
                            tax_amount=tax,
                            total_sales=total_sales
                        )
                        db.add(item)
                        total_items_created += 1

            current_date += timedelta(days=1)

        db.commit()
        print(f"Created {total_orders_created} orders and {total_items_created} line items.")

        print("Recalculating daily sales aggregates...")
        aggregated_rows = ETLAggregate.rebuild_daily_aggregates(db)
        print(f"Aggregation completed! {aggregated_rows} aggregate rows created/updated.")

    finally:
        if close_session_at_end:
            db.close()

if __name__ == "__main__":
    generate_synthetic_data()
