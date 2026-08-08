import numpy as np
import pandas as pd
from typing import Tuple
from sklearn.linear_model import Ridge

class MovingAverageForecaster:
    """
    Simple & Exponential Moving Average baseline forecasters.
    """
    @staticmethod
    def predict_sma(series: pd.Series, window: int, horizon: int) -> np.ndarray:
        if len(series) == 0:
            return np.zeros(horizon)
        val = series.iloc[-min(window, len(series)):].mean()
        return np.full(horizon, max(0.0, float(val)))

    @staticmethod
    def predict_ema(series: pd.Series, span: int, horizon: int) -> np.ndarray:
        if len(series) == 0:
            return np.zeros(horizon)
        ema_val = series.ewm(span=span, adjust=False).mean().iloc[-1]
        return np.full(horizon, max(0.0, float(ema_val)))


class RidgeRegressionForecaster:
    """
    Statistical Machine Learning forecaster using Scikit-Learn Ridge Regression
    with calendar, lag, and trend feature engineering.
    """
    @staticmethod
    def create_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Engineers feature matrix X and target y from time-series DataFrame with columns ['sales_date', 'quantity'].
        Features:
        - dayofweek (0-6)
        - lag_1, lag_7
        - rolling 7-day mean
        - linear trend index
        """
        data = df.copy().sort_values('sales_date').reset_index(drop=True)
        data['sales_date'] = pd.to_datetime(data['sales_date'])
        
        data['dayofweek'] = data['sales_date'].dt.dayofweek
        data['lag_1'] = data['quantity'].shift(1)
        data['lag_7'] = data['quantity'].shift(7)
        data['rolling_7'] = data['quantity'].shift(1).rolling(7).mean()
        data['trend'] = np.arange(len(data))

        # Drop NaN rows resulting from shifts
        data_clean = data.dropna().copy()
        
        feature_cols = ['dayofweek', 'lag_1', 'lag_7', 'rolling_7', 'trend']
        X = data_clean[feature_cols]
        y = data_clean['quantity']
        return X, y

    @classmethod
    def fit_and_predict(cls, df_history: pd.DataFrame, horizon: int) -> np.ndarray:
        """
        Fits Ridge Regression model on historical data and recursively predicts forward horizon days.
        """
        if len(df_history) < 14:
            # Fallback to SMA if insufficient data for feature engineering
            return MovingAverageForecaster.predict_sma(df_history['quantity'], window=7, horizon=horizon)

        data = df_history.copy().sort_values('sales_date').reset_index(drop=True)
        X, y = cls.create_features(data)

        if len(X) < 5:
            return MovingAverageForecaster.predict_sma(df_history['quantity'], window=7, horizon=horizon)

        model = Ridge(alpha=1.0)
        model.fit(X, y)

        # Recursive multi-step prediction
        predictions = []
        last_date = pd.to_datetime(data['sales_date'].iloc[-1])
        temp_df = data.copy()

        for step in range(1, horizon + 1):
            next_date = last_date + pd.Timedelta(days=step)
            next_trend = len(temp_df)
            dayofweek = next_date.dayofweek
            lag_1 = temp_df['quantity'].iloc[-1]
            lag_7 = temp_df['quantity'].iloc[-7] if len(temp_df) >= 7 else temp_df['quantity'].iloc[-1]
            rolling_7 = temp_df['quantity'].iloc[-7:].mean()

            x_pred = pd.DataFrame([{
                'dayofweek': dayofweek,
                'lag_1': lag_1,
                'lag_7': lag_7,
                'rolling_7': rolling_7,
                'trend': next_trend
            }])

            pred_val = float(model.predict(x_pred)[0])
            pred_val = max(0.0, pred_val)
            predictions.append(pred_val)

            # Append prediction to temp_df for recursive next lag step
            new_row = pd.DataFrame([{'sales_date': next_date, 'quantity': pred_val}])
            temp_df = pd.concat([temp_df, new_row], ignore_index=True)

        return np.array(predictions)
