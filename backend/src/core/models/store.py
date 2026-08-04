from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from src.core.database import Base

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    store_name = Column(String(100), nullable=False)
    city = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.now(datetime.UTC))

    # String reference "DailySalesAggregate" prevents circular imports
    daily_aggregates = relationship("DailySalesAggregate", back_populates="store", cascade="all, delete-orphan")