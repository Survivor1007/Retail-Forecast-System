import pandas as pd
from datetime import date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.models import DailySalesAggregate, Product, Store, ForecastResult
from src.core.schemas import ForecastGenerateRequest, ForecastResultOut, ForecastDataPoint, ModelMetricOut
from src.modules.forecasting.evaluator import ModelEvaluator

router = APIRouter(prefix="/forecasting", tags=["Forecasting Model Engine"])

@router.post("/generate", status_code=status.HTTP_200_OK)
def generate_forecasts(payload: ForecastGenerateRequest, db: Session = Depends(get_db)):
    """
    Triggers model competition (SMA, EMA, Ridge, Lasso, Random Forest) across store-product items.
    Saves winning forecast predictions with MAPE/RMSE scores to database.
    """
    query = db.query(DailySalesAggregate).order_by(DailySalesAggregate.sales_date)
    if payload.store_id:
        query = query.filter(DailySalesAggregate.store_id == payload.store_id)
    if payload.product_id:
        query = query.filter(DailySalesAggregate.product_id == payload.product_id)

    aggregates = query.all()
    if not aggregates:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No historical aggregate sales data found for forecasting.")

    df = pd.DataFrame([
        {
            "sales_date": a.sales_date,
            "store_id": a.store_id,
            "product_id": a.product_id,
            "quantity": a.total_quantity_sold
        }
        for a in aggregates
    ])

    saved_count = 0

    for (st_id, prod_id), group in df.groupby(["store_id", "product_id"]):
        eval_result = ModelEvaluator.evaluate_and_forecast(group[["sales_date", "quantity"]], horizon=payload.horizon_days)

        winning_model = eval_result["winning_model"]
        mape = eval_result["mape"]
        rmse = eval_result["rmse"]
        preds = eval_result["predictions"]

        max_history_date = group["sales_date"].max()
        forecast_start = max_history_date + timedelta(days=1)

        for step, pred_qty in enumerate(preds):
            target_date = forecast_start + timedelta(days=step)

            # UPSERT forecast result
            forecast_rec = db.query(ForecastResult).filter(
                ForecastResult.forecast_date == target_date,
                ForecastResult.product_id == prod_id,
                ForecastResult.store_id == st_id,
                ForecastResult.model_name == winning_model
            ).first()

            if forecast_rec:
                forecast_rec.predicted_quantity = pred_qty
                forecast_rec.mape_score = mape
                forecast_rec.rmse_score = rmse
            else:
                forecast_rec = ForecastResult(
                    forecast_date=target_date,
                    product_id=prod_id,
                    store_id=st_id,
                    predicted_quantity=pred_qty,
                    model_name=winning_model,
                    mape_score=mape,
                    rmse_score=rmse
                )
                db.add(forecast_rec)
            saved_count += 1

    db.commit()
    return {
        "message": f"Successfully evaluated models and generated {payload.horizon_days}-day sales forecast",
        "horizon_days": payload.horizon_days,
        "forecast_points_saved": saved_count
    }

@router.get("/results", response_model=List[ForecastResultOut])
def get_forecast_results(
    product_id: Optional[int] = None,
    store_id: Optional[int] = None,
    horizon_days: int = Query(7, ge=1, le=60),
    db: Session = Depends(get_db)
):
    """
    Retrieves dual-line chart data comparing historical actual sales vs generated forecasts.
    """
    query = db.query(DailySalesAggregate).order_by(DailySalesAggregate.sales_date)
    if product_id:
        query = query.filter(DailySalesAggregate.product_id == product_id)
    if store_id:
        query = query.filter(DailySalesAggregate.store_id == store_id)

    aggregates = query.all()
    if not aggregates:
        return []

    df = pd.DataFrame([
        {
            "sales_date": a.sales_date,
            "store_id": a.store_id,
            "product_id": a.product_id,
            "quantity": a.total_quantity_sold
        }
        for a in aggregates
    ])

    products_map = {p.id: p.product_name for p in db.query(Product).all()}
    results = []

    for (st_id, prod_id), group in df.groupby(["store_id", "product_id"]):
        group_sorted = group.sort_values("sales_date").reset_index(drop=True)
        eval_res = ModelEvaluator.evaluate_and_forecast(group_sorted[["sales_date", "quantity"]], horizon=horizon_days)

        points = []
        recent_history = group_sorted.iloc[-14:]
        for _, r in recent_history.iterrows():
            points.append(ForecastDataPoint(
                date=r["sales_date"],
                actual_quantity=float(r["quantity"]),
                predicted_quantity=float(r["quantity"]),
                confidence_lower=float(r["quantity"]),
                confidence_upper=float(r["quantity"])
            ))

        last_date = group_sorted["sales_date"].max()
        for i in range(horizon_days):
            f_date = last_date + timedelta(days=i+1)
            points.append(ForecastDataPoint(
                date=f_date,
                actual_quantity=None,
                predicted_quantity=eval_res["predictions"][i],
                confidence_lower=eval_res["confidence_lower"][i],
                confidence_upper=eval_res["confidence_upper"][i]
            ))

        results.append(ForecastResultOut(
            product_id=prod_id,
            product_name=products_map.get(prod_id, f"Product #{prod_id}"),
            store_id=st_id,
            winning_model=eval_res["winning_model"],
            mape_score=eval_res["mape"],
            rmse_score=eval_res["rmse"],
            forecast_points=points
        ))

    return results

@router.get("/metrics", response_model=List[ModelMetricOut])
def get_model_metrics(store_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Leaderboard of model evaluation metrics (MAPE/RMSE) across all items and candidate models.
    """
    query = db.query(DailySalesAggregate).order_by(DailySalesAggregate.sales_date)
    if store_id:
        query = query.filter(DailySalesAggregate.store_id == store_id)

    aggregates = query.all()
    if not aggregates:
        return []

    df = pd.DataFrame([
        {
            "sales_date": a.sales_date,
            "store_id": a.store_id,
            "product_id": a.product_id,
            "quantity": a.total_quantity_sold
        }
        for a in aggregates
    ])

    products_map = {p.id: p.product_name for p in db.query(Product).all()}
    metrics = []

    for (st_id, prod_id), group in df.groupby(["store_id", "product_id"]):
        group_sorted = group.sort_values("sales_date").reset_index(drop=True)
        eval_res = ModelEvaluator.evaluate_and_forecast(group_sorted[["sales_date", "quantity"]], horizon=7)

        metrics.append(ModelMetricOut(
            product_id=prod_id,
            product_name=products_map.get(prod_id, f"Product #{prod_id}"),
            store_id=st_id,
            winning_model=eval_res["winning_model"],
            sma_mape=eval_res.get("sma_mape"),
            ema_mape=eval_res.get("ema_mape"),
            ridge_mape=eval_res.get("ridge_mape"),
            lasso_mape=eval_res.get("lasso_mape"),
            rf_mape=eval_res.get("rf_mape"),
            selected_mape=eval_res["mape"]
        ))

    return metrics
 