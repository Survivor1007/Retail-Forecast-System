import pandas as pd
import numpy as np
from datetime import date, timedelta
from src.modules import MovingAverageForecaster, RidgeRegressionForecaster
from src.modules import ModelEvaluator

def test_moving_average_forecaster():
    series = pd.Series([10.0, 12.0, 14.0, 16.0, 18.0, 20.0, 22.0])
    preds = MovingAverageForecaster.predict_sma(series, window=7, horizon=5)

    assert len(preds) == 5
    # Mean of 10..22 = 16.0
    assert preds[0] == 16.0

def test_ridge_forecaster_fit_predict():
    dates = [date(2026, 1, 1) + timedelta(days=i) for i in range(30)]
    quantities = [10 + (i % 7) * 2 + i * 0.5 for i in range(30)] # Trend + weekly cycle
    df = pd.DataFrame({"sales_date": dates, "quantity": quantities})

    preds = RidgeRegressionForecaster.fit_and_predict(df, horizon=7)
    assert len(preds) == 7
    assert np.all(preds >= 0.0)

def test_model_evaluator_competition():
    dates = [date(2026, 1, 1) + timedelta(days=i) for i in range(40)]
    quantities = [20.0 + (i % 7) * 5.0 for i in range(40)]
    df = pd.DataFrame({"sales_date": dates, "quantity": quantities})

    result = ModelEvaluator.evaluate_and_forecast(df, horizon=7)
    
    assert "winning_model" in result
    assert result["winning_model"] in ["SMA_7", "Ridge_Regression"]
    assert len(result["predictions"]) == 7
    assert len(result["confidence_lower"]) == 7
    assert len(result["confidence_upper"]) == 7
