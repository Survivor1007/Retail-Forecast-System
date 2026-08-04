from sqlalchemy import Column, Integer, Date, Numeric, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from src.core.database import Base

class DailySalesAggregate(Base):
    __tablename__ = "daily_sales_aggregates"
    __table_args__ = (UniqueConstraint("sales_date", "store_id", "product_id", name="uq_daily_agg"),)

    id = Column(Integer, primary_key=True, index=True)
    sales_date = Column(Date, nullable=False, index=True)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    total_quantity_sold = Column(Integer, nullable=False, default=0)
    total_revenue = Column(Numeric(12, 2), nullable=False, default=0.00)
    total_orders = Column(Integer, nullable=False, default=0)

    store = relationship("Store", back_populates="daily_aggregates")
    product = relationship("Product")