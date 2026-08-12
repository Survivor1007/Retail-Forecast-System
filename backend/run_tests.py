import unittest
import pandas as pd
import numpy as np
from datetime import date, timedelta

# Import domain modules
from src.modules import MovingAverageForecaster, RidgeRegressionForecaster, ModelEvaluator,DataCleaner


class TestRetailEngine(unittest.TestCase):
    def test_data_cleaner_valid_df(self):
        data = {
            "order_date": ["2026-08-01", "2026-08-02"],
            "store_id": [1, 1],
            "product_id": [1, 2],
            "quantity_sold": [5, 2],
            "unit_price": [10.0, 20.0],
            "discount_amount": [2.0, 0.0],
            "tax_amount": [1.0, 0.0]
        }
        df = pd.DataFrame(data)
        clean_df, dropped = DataCleaner.clean_raw_sales_df(df)

        self.assertEqual(dropped, 0)
        self.assertEqual(len(clean_df), 2)
        self.assertEqual(clean_df.iloc[0]["total_sales"], 49.0)
        self.assertEqual(clean_df.iloc[1]["total_sales"], 40.0)

    def test_data_cleaner_dirty_rows(self):
        data = {
            "order_date": ["2026-08-01", "invalid_date", "2026-08-03"],
            "store_id": [1, 1, 1],
            "product_id": [1, 2, 3],
            "quantity_sold": [5, -3, 0],
            "unit_price": [10.0, 20.0, 15.0]
        }
        df = pd.DataFrame(data)
        clean_df, dropped = DataCleaner.clean_raw_sales_df(df)

        self.assertEqual(dropped, 2)
        self.assertEqual(len(clean_df), 1)
        self.assertEqual(clean_df.iloc[0]["product_id"], 1)

    def test_moving_average_forecaster(self):
        series = pd.Series([10.0, 12.0, 14.0, 16.0, 18.0, 20.0, 22.0])
        preds = MovingAverageForecaster.predict_sma(series, window=7, horizon=5)

        self.assertEqual(len(preds), 5)
        self.assertEqual(preds[0], 16.0)

    def test_ridge_forecaster_fit_predict(self):
        dates = [date(2026, 1, 1) + timedelta(days=i) for i in range(30)]
        quantities = [10 + (i % 7) * 2 + i * 0.5 for i in range(30)]
        df = pd.DataFrame({"sales_date": dates, "quantity": quantities})

        preds = RidgeRegressionForecaster.fit_and_predict(df, horizon=7)
        self.assertEqual(len(preds), 7)
        self.assertTrue(np.all(preds >= 0.0))

    def test_model_evaluator_competition(self):
        dates = [date(2026, 1, 1) + timedelta(days=i) for i in range(40)]
        quantities = [20.0 + (i % 7) * 5.0 for i in range(40)]
        df = pd.DataFrame({"sales_date": dates, "quantity": quantities})

        result = ModelEvaluator.evaluate_and_forecast(df, horizon=7)
        
        self.assertIn("winning_model", result)
        self.assertIn(result["winning_model"], ["SMA_7", "Ridge_Regression"])
        self.assertEqual(len(result["predictions"]), 7)
        self.assertEqual(len(result["confidence_lower"]), 7)
        self.assertEqual(len(result["confidence_upper"]), 7)

if __name__ == "__main__":
    unittest.main()
