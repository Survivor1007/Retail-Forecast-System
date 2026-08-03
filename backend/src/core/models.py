from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Numeric, DateTime, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from src.core.database import Base


class Store(Base):
    __tablename__ = "stores"
    id = Column(Integer, primary_key=True, index=True)
    store_name = Column(String(100), nullable=False)
    city = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.now(datetime.UTC))
    products = relationship("DailySalesAggregate", back_populates="store", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(50), nullable=False, unique=True)
    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(100), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    unit_price = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.now(datetime.UTC))
    category = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")


class SalesOrder(Base):
    __tablename__ = "sales_orders"
    id = Column(Integer, primary_key=True, index=True)
    order_date = Column(DateTime(timezone=True), nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    customer_type = Column(String(30), default="Retail")
    payment_mode = Column(String(30), default="Cash")
    created_at = Column(DateTime(timezone=True), default=datetime.now(datetime.UTC))
    store = relationship("Store")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("sales_orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    quantity_sold = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    discount_amount = Column(Numeric(10, 2), default=0.00)
    tax_amount = Column(Numeric(10, 2), default=0.00)
    total_sales = Column(Numeric(10, 2), nullable=False)
    order = relationship("SalesOrder", back_populates="items")
    product = relationship("Product", back_populates="order_items")

    
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
    store = relationship("Store", back_populates="products")
    product = relationship("Product")


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
    created_at = Column(DateTime(timezone=True), default=datetime.now(datetime.UTC))
    product = relationship("Product")
    store = relationship("Store")