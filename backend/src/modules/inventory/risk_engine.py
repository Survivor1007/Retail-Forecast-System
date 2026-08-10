import pandas as pd
from datetime import  timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from src.core.models import DailySalesAggregate, Product, Store
from src.modules import ModelEvaluator

class InventoryRiskEngine:
    @staticmethod
    def calculate_abc_classification(db: Session, store_id: int = None) -> Dict[str, Any]:
        """
        Executes Pareto ABC 80/15/5 revenue classification on products.
        - Class A: Top 80% cumulative revenue
        - Class B: Next 15% (80% - 95%) cumulative revenue
        - Class C: Remaining 5% (95% - 100%) cumulative revenue
        """
        query = db.query(
            Product.id.label("product_id"),
            Product.product_name,
            func.coalesce(func.sum(DailySalesAggregate.total_revenue), 0).label("total_revenue")
        ).outerjoin(DailySalesAggregate, Product.id == DailySalesAggregate.product_id)

        if store_id:
            query = query.filter(DailySalesAggregate.store_id == store_id)

        records = query.group_by(Product.id, Product.product_name).all()

        if not records:
            return {"class_a_count": 0, "class_b_count": 0, "class_c_count": 0, "items": []}

        df = pd.DataFrame([
            {"product_id": r.product_id, "product_name": r.product_name, "total_revenue": float(r.total_revenue)}
            for r in records
        ]).sort_values("total_revenue", ascending=False).reset_index(drop=True)

        grand_total = df["total_revenue"].sum()
        if grand_total == 0:
            df["revenue_share_pct"] = 0.0
            df["cumulative_revenue_pct"] = 0.0
            df["abc_class"] = "C"
        else:
            df["revenue_share_pct"] = (df["total_revenue"] / grand_total * 100.0).round(2)
            df["cumulative_revenue_pct"] = df["revenue_share_pct"].cumsum().round(2)

            def assign_abc(cum_pct):
                if cum_pct <= 80.0:
                    return "A"
                elif cum_pct <= 95.0:
                    return "B"
                else:
                    return "C"

            df["abc_class"] = df["cumulative_revenue_pct"].apply(assign_abc)

        class_a_count = int((df["abc_class"] == "A").sum())
        class_b_count = int((df["abc_class"] == "B").sum())
        class_c_count = int((df["abc_class"] == "C").sum())

        return {
            "class_a_count": class_a_count,
            "class_b_count": class_b_count,
            "class_c_count": class_c_count,
            "items": df.to_dict(orient="records")
        }

    @staticmethod
    def detect_inventory_alerts(db: Session, store_id: int = None) -> List[Dict[str, Any]]:
        """
        Scans all store-product combinations to generate operational risk alerts:
        1. STOCKOUT RISK: High demand (Class A) exceeding threshold.
        2. DEADSTOCK RISK: >40% WoW sales drop or zero sales in 14 days.
        """
        alerts = []

        # Get ABC classifications
        abc_data = InventoryRiskEngine.calculate_abc_classification(db, store_id=store_id)
        abc_map = {item["product_id"]: item["abc_class"] for item in abc_data["items"]}

        # Fetch recent daily sales history
        query = db.query(DailySalesAggregate).order_by(DailySalesAggregate.sales_date)
        if store_id:
            query = query.filter(DailySalesAggregate.store_id == store_id)

        aggregates = query.all()
        if not aggregates:
            return []

        df_agg = pd.DataFrame([
            {
                "sales_date": a.sales_date,
                "store_id": a.store_id,
                "product_id": a.product_id,
                "quantity": a.total_quantity_sold,
                "revenue": float(a.total_revenue)
            }
            for a in aggregates
        ])

        products = db.query(Product).all()
        product_map = {p.id: p.product_name for p in products}
        stores = db.query(Store).all()
        store_map = {s.id: s.store_name for s in stores}

        max_date = df_agg["sales_date"].max()
        cutoff_7d = max_date - timedelta(days=7)
        cutoff_14d = max_date - timedelta(days=14)

        for (st_id, prod_id), group in df_agg.groupby(["store_id", "product_id"]):
            prod_name = product_map.get(prod_id, f"Product #{prod_id}")
            st_name = store_map.get(st_id, f"Store #{st_id}")
            abc_category = abc_map.get(prod_id, "C")

            group_sorted = group.sort_values("sales_date").reset_index(drop=True)
            
            # Recent 7 days vs previous 7 days volume comparison
            last_7d_vol = group_sorted[group_sorted["sales_date"] > cutoff_7d]["quantity"].sum()
            prev_7d_vol = group_sorted[
                (group_sorted["sales_date"] <= cutoff_7d) & (group_sorted["sales_date"] > cutoff_14d)
            ]["quantity"].sum()

            # 1. Deadstock / Slow-Moving Risk Check
            if prev_7d_vol > 0:
                wow_drop_pct = ((prev_7d_vol - last_7d_vol) / prev_7d_vol) * 100.0
                if wow_drop_pct > 40.0:
                    alerts.append({
                        "id": f"ALERT-DEADSTOCK-{st_id}-{prod_id}",
                        "product_id": prod_id,
                        "product_name": prod_name,
                        "store_id": st_id,
                        "store_name": st_name,
                        "alert_type": "DEADSTOCK_RISK",
                        "severity": "HIGH" if wow_drop_pct > 60 else "MEDIUM",
                        "description": f"Sales dropped by {round(wow_drop_pct, 1)}% WoW ({prev_7d_vol} units -> {last_7d_vol} units). High overstock accumulation risk.",
                        "metric_value": round(wow_drop_pct, 1),
                        "recommended_action": "Mark down item price or bundle with fast-moving Class A items to clear inventory."
                    })
            elif last_7d_vol == 0 and len(group_sorted) >= 14:
                alerts.append({
                    "id": f"ALERT-ZERO-SALES-{st_id}-{prod_id}",
                    "product_id": prod_id,
                    "product_name": prod_name,
                    "store_id": st_id,
                    "store_name": st_name,
                    "alert_type": "DEADSTOCK_RISK",
                    "severity": "HIGH",
                    "description": "Zero units sold over 14 consecutive days.",
                    "metric_value": 0.0,
                    "recommended_action": "Audit physical inventory and transfer stock to high-demand store locations."
                })

            # 2. Stockout Risk Check for Class A Items
            if abc_category == "A" and len(group_sorted) >= 7:
                # Forecast 7-day demand
                eval_res = ModelEvaluator.evaluate_and_forecast(group_sorted[["sales_date", "quantity"]], horizon=7)
                forecast_7d_sum = sum(eval_res["predictions"])

                # Estimated current stock benchmark
                estimated_safety_stock = last_7d_vol * 0.8
                if forecast_7d_sum > estimated_safety_stock and forecast_7d_sum > 20:
                    alerts.append({
                        "id": f"ALERT-STOCKOUT-{st_id}-{prod_id}",
                        "product_id": prod_id,
                        "product_name": prod_name,
                        "store_id": st_id,
                        "store_name": st_name,
                        "alert_type": "STOCKOUT_RISK",
                        "severity": "HIGH",
                        "description": f"Class A revenue driver predicted to sell {round(forecast_7d_sum, 1)} units over next 7 days, exceeding safety threshold.",
                        "metric_value": round(forecast_7d_sum, 1),
                        "recommended_action": "Issue urgent purchase order to replenish safety stock immediately."
                    })

        return alerts
