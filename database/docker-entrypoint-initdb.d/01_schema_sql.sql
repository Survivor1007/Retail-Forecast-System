-- ============================================================================
-- Automated Demand Forecasting & Inventory Intelligence Engine Database Schema
-- File: 01_schema.sql
-- Description: Core tables, foreign key relationships, constraints, and indexes.
-- ============================================================================
-- Drop tables if exists (for clean initialization)
DROP TABLE IF EXISTS forecast_results CASCADE;
DROP TABLE IF EXISTS daily_sales_aggregates CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS sales_orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS stores CASCADE;

-- 1. Store Master Table
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    store_name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- 2. Product Category Master Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE
);
-- 3. Product Master Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- 4. Sales Orders Header Table
CREATE TABLE sales_orders (
    id SERIAL PRIMARY KEY,
    order_date TIMESTAMP WITH TIME ZONE NOT NULL,
    store_id INT REFERENCES stores(id) ON DELETE CASCADE,
    customer_type VARCHAR(30) DEFAULT 'Retail', -- Retail, Wholesale, Member
    payment_mode VARCHAR(30) DEFAULT 'Cash',    -- Cash, Card, UPI, Mobile
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- 5. Order Line Items Table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE RESTRICT,
    quantity_sold INT NOT NULL CHECK (quantity_sold > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    discount_amount NUMERIC(10, 2) DEFAULT 0.00 CHECK (discount_amount >= 0),
    tax_amount NUMERIC(10, 2) DEFAULT 0.00 CHECK (tax_amount >= 0),
    total_sales NUMERIC(10, 2) NOT NULL CHECK (total_sales >= 0) -- (quantity * unit_price) - discount + tax
);
-- 6. Pre-Aggregated Daily Sales Time Series Table
CREATE TABLE daily_sales_aggregates (
    id SERIAL PRIMARY KEY,
    sales_date DATE NOT NULL,
    store_id INT REFERENCES stores(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    total_quantity_sold INT NOT NULL DEFAULT 0,
    total_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_orders INT NOT NULL DEFAULT 0,
    UNIQUE(sales_date, store_id, product_id)
);
-- 7. Forecasting Results & Model Competition Audit Logs Table
CREATE TABLE forecast_results (
    id SERIAL PRIMARY KEY,
    forecast_date DATE NOT NULL,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    store_id INT REFERENCES stores(id) ON DELETE CASCADE,
    predicted_quantity NUMERIC(10, 2) NOT NULL CHECK (predicted_quantity >= 0),
    model_name VARCHAR(50) NOT NULL, -- e.g., 'SMA_7', 'EMA_14', 'Ridge_Regression'
    mape_score NUMERIC(5, 2),        -- Evaluation MAPE percentage score
    rmse_score NUMERIC(10, 2),       -- Evaluation RMSE score
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(forecast_date, product_id, store_id, model_name)
);
-- ============================================================================
-- Performance Indexes for Time-Series Aggregations & Query Filtering
-- ============================================================================
CREATE INDEX idx_orders_date_store ON sales_orders(order_date, store_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_daily_agg_lookup ON daily_sales_aggregates(sales_date, store_id, product_id);
CREATE INDEX idx_forecast_lookup ON forecast_results(forecast_date, product_id, store_id);