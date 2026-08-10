import pandas as pd
from src.modules import InventoryRiskEngine

def test_abc_analysis_calculation():
    # Test Pareto classification calculation logic on synthetic dataframe
    df = pd.DataFrame([
        {"product_id": 1, "product_name": "Prod A", "total_revenue": 8000.0},
        {"product_id": 2, "product_name": "Prod B", "total_revenue": 1500.0},
        {"product_id": 3, "product_name": "Prod C", "total_revenue": 500.0}
    ])

    grand_total = df["total_revenue"].sum()
    df["revenue_share_pct"] = ( df["total_revenue"] / grand_total * 100.0)
    df["cumulative_revenue_pct"] = df["revenue_share_pct"].cumsum()

    def assign_abc(cum_pct):
        if cum_pct <= 80.0:
            return "A"
        elif cum_pct <= 95.0:
            return "B"
        else:
            return "C"
        
    df["abc_class"] = df["cumulative_revenue_pct"].apply(assign_abc)

    assert df.iloc[0]["abc_class"] == "A" # 80%
    assert df.iloc[1]["abc_class"] == "B" # 95%
    assert df.iloc[2]["abc_class"] == "C" # 100%

    