# ===============================================================
# forecasting/evaluator.py
# Function: Analyze which models is better for forecasting
# e.g. SMA or Ridge Regression
# ===============================================================
import numpy as np
import pandas as pd
from typing import Dict, Any
from .models import MovingAverageForecaster, RidgeRegressionForecaster

class ModelEvaluator:
    @staticmethod
    def calculate_mape(actual: np.ndarray, predicted: np.ndarray) -> float:
        """Calculates Mean Absolute Percentage Error (MAPE)."""
        actual, predicted = np.array(actual), np.array(predicted)
        # Avoid division by zero
        mask = actual != 0
        if not np.any(mask):
            return 0.0
        mape = np.mean(np.abs((actual[mask] - predicted[mask]) / actual[mask])) * 100.0
        return round(float(mape), 2)

    @staticmethod
    def calculate_rmse(actual: np.ndarray, predicted: np.ndarray) -> float:
        """Calculates Root Mean Squared Error (RMSE)."""
        actual, predicted = np.array(actual), np.array(predicted)
        rmse = np.sqrt(np.mean((actual - predicted) ** 2))
        return round(float(rmse), 2)

    @classmethod
    def evaluate_and_forecast(cls, df_history: pd.DataFrame, horizon: int = 7) -> Dict[str, Any]:
        """
        Runs model competition between SMA and Ridge Regression on historical time series data.
        Selects model with minimum test MAPE score and returns forward-looking forecasts with confidence intervals.
        """
        if df_history.empty or len(df_history) < 5:
            # Empty fallback
            return {
                "winning_model": "SMA_7",
                "mape": 0.0,
                "rmse": 0.0,
                "predictions": [0.0] * horizon,
                "confidence_lower": [0.0] * horizon,
                "confidence_upper": [0.0] * horizon
            }

        df_sorted = df_history.copy().sort_values('sales_date').reset_index(drop=True)
        
        # Test split: hold out last 7 days (or 20% of data if dataset is small)
        test_size = min(7, max(2, int(len(df_sorted) * 0.2)))
        train_df = df_sorted.iloc[:-test_size]
        test_df = df_sorted.iloc[-test_size:]
        actual_test = test_df['quantity'].values

        # 1. Evaluate SMA (7-day window)
        sma_pred_test = MovingAverageForecaster.predict_sma(train_df['quantity'], window=7, horizon=test_size)
        sma_mape = cls.calculate_mape(actual_test, sma_pred_test)
        sma_rmse = cls.calculate_rmse(actual_test, sma_pred_test)

        # 2. Evaluate Ridge Regression
        if len(train_df) >= 14:
            ridge_pred_test = RidgeRegressionForecaster.fit_and_predict(train_df, horizon=test_size)
            ridge_mape = cls.calculate_mape(actual_test, ridge_pred_test)
            ridge_rmse = cls.calculate_rmse(actual_test, ridge_pred_test)
        else:
            # Fallback if train set is < 14 days
            ridge_mape = float('inf')
            ridge_rmse = float('inf')

        # Model Competition: Select lower MAPE
        if ridge_mape < sma_mape and ridge_mape != float('inf'):
            winning_model = "Ridge_Regression"
            winning_mape = ridge_mape
            winning_rmse = ridge_rmse
            final_predictions = RidgeRegressionForecaster.fit_and_predict(df_sorted, horizon=horizon)
        else:
            winning_model = "SMA_7"
            winning_mape = sma_mape
            winning_rmse = sma_rmse
            final_predictions = MovingAverageForecaster.predict_sma(df_sorted['quantity'], window=7, horizon=horizon)

        # Compute residual standard error for 95% confidence interval
        residuals = df_sorted['quantity'].values[-min(14, len(df_sorted)):] - df_sorted['quantity'].mean()
        residual_error = float(np.std(residuals)) if len(residuals) > 1 else 1.0

        confidence_lower = np.maximum(0.0, final_predictions - (1.96 * residual_error)).round(2).tolist()
        confidence_upper = (final_predictions + (1.96 * residual_error)).round(2).tolist()
        final_preds_list = np.round(final_predictions, 2).tolist()

        return {
            "winning_model": winning_model,
            "mape": winning_mape,
            "rmse": winning_rmse,
            "predictions": final_preds_list,
            "confidence_lower": confidence_lower,
            "confidence_upper": confidence_upper,
            "sma_mape": sma_mape,
            "ridge_mape": ridge_mape if ridge_mape != float('inf') else None
        }
