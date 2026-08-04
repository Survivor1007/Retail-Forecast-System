import pandas as pd
import numpy as np
from typing import Tuple

class DataCleaner:
    REQUIRED_COLUMNS = [
        "order_date", "store_id", "product_id","quantity_sold", "unit_price"
    ]

    @classmethod
    def clean_raw_sales_df(cls, df: pd.DataFrame) -> Tuple[pd.DataFrame, int]:
        """
        Cleans raw ingested sales data:
        1. Ensures required columns exist.
        2. Converts dates to ISO datetime.
        3. Filters negative or zero quantities.
        4. Fills missing discounts/taxes with 0.0.
        5. Computes total_sales = (quantity_sold * unit_price) - discount_amount + tax_amount.
        Returns cleaned DataFrame and number of invalid rows dropped.
        """

        initial_count = len(df)

        # --- Check required columns ---
        for col in cls.REQUIRED_COLUMNS:
            if col not in df.columns:
                raise ValueError(f"Missing required CSV column: '{col}'")

        # --- Convert types ---
        df['order_date'] = pd.to_datetime(df['order_date'], errors='coerce')
        df['store_id'] = pd.to_numeric(df['store_id'], errors='coerce')
        df['product_id'] = pd.to_numeric(df['product_id'], errors='coerce')
        df['quantity_sold'] = pd.to_numeric(df['quantity_sold'], errors='coerce')
        df['unit_price'] = pd.to_numeric(df['unit_price'], errors='coerce')


        # If values are not found for these columns -> fill them with 0.0
        if 'discount_amount' not in df.columns:
            df['discount_amount'] = 0.0
        else:
            df['discount_amount'] = pd.to_numeric(df['discount_amount'], errors='coerce').fillna(0.0)
        if 'tax_amount' not in df.columns:
            df['tax_amount'] = 0.0
        else:
            df['tax_amount'] = pd.to_numeric(df['tax_amount'], errors='coerce').fillna(0.0)

        # --- Drop invalid rows ---
        clean_df = df.dropna(subset=['order_date', 'store_id', 'product_id', 'quantity_sold', 'unit_price']).copy()
        
        # Filter non-positive quantities or unit prices
        clean_df = clean_df[(clean_df['quantity_sold'] > 0) & (clean_df['unit_price'] >= 0)]
        clean_df = clean_df[(clean_df['discount_amount'] >= 0) & (clean_df['tax_amount'] >= 0)]

        # Calculate total sales
        clean_df['total_sales'] = (
            (clean_df['quantity_sold'] * clean_df['unit_price']) 
            - clean_df['discount_amount'] 
            + clean_df['tax_amount']
        ).round(2)


        clean_df = clean_df[clean_df['total_sales'] >= 0]
        
        invalid_count = initial_count - len(clean_df)
        return clean_df, invalid_count
        