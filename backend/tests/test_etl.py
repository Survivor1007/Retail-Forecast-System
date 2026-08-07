import pandas as pd
import pytest
from src.modules.etl.cleaner import DataCleaner

def test_data_cleaner_valid_df():
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

    assert len(clean_df) == 2
    assert dropped == 0
    # Verify total_sales formula: (5 * 10) - 2 + 1 = 49.0
    assert clean_df.iloc[0]["total_sales"] == 49.0
    # (2 * 20) - 0 + 0 = 40.0
    assert clean_df.iloc[1]["total_sales"] == 40.0

def test_data_cleaner_dirty_rows():
    data = {
        "order_date": ["2026-08-01", "invalid_date", "2026-08-03"],
        "store_id": [1, 1, 1],
        "product_id": [1, 2, 3],
        "quantity_sold": [5, -3, 0], # negative and zero quantities
        "unit_price": [10.0, 20.0, 15.0]
    }
    df = pd.DataFrame(data)
    clean_df, dropped = DataCleaner.clean_raw_sales_df(df)
    assert dropped == 2 # drops row 1 (invalid_date/-3) and row 2 (qty=0)
    assert len(clean_df) == 1
    assert clean_df.iloc[0]["product_id"] == 1
