from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Date, Numeric, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from src.core.database import Base

class ForecastResult(Base):
    __tablename__ = "forecast_results"
    __table_args__ = (UniqueConstraint("forecast_date", "product_id", "store_id", "model_name", name="uq_forecast"),)

    id = Column(Integer, primary_key=True, index=True)
    forecast_date = Column(Date, nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    predicted_quantity = Column(Numeric(10, 2), nullable=False)
    model_name = Column(String(50), nullable=False)
    mape_score = Column(Numeric(5, 2), nullable=True)
    rmse_score = Column(Numeric(10, 2), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda:datetime.now(timezone.utc))

    product = relationship("Product")
    store = relationship("Store")