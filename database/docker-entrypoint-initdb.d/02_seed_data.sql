-- ============================================================================
-- Automated Demand Forecasting & Inventory Intelligence Engine Seed Data
-- File: 02_seed_data.sql
-- Description: Seed data for stores, product categories, and baseline products.
-- ============================================================================
-- 1. Seed Stores
INSERT INTO stores (id, store_name, city) VALUES
(1, 'Downtown Flagship', 'New York'),
(2, 'Suburban Center', 'Chicago'),
(3, 'Metro Outlet', 'San Francisco'),
(4, 'Harbor Square', 'Seattle')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for stores
SELECT setval('stores_id_seq', (SELECT MAX(id) FROM stores));

-- 2. Seed Product Categories
INSERT INTO categories (id, category_name) VALUES
(1, 'Dairy & Refrigerated'),
(2, 'Bakery & Bread'),
(3, 'Beverages'),
(4, 'Fresh Produce'),
(5, 'Packaged Foods'),
(6, 'Personal Care')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for categories
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- 3. Seed Products
INSERT INTO products (id, product_name, category_id, unit_price) VALUES
(1, 'Organic Whole Milk 1L', 1, 3.49),
(2, 'Greek Yogurt Vanilla 500g', 1, 4.99),
(3, 'Artisanal Sourdough Bread', 2, 5.25),
(4, 'Whole Wheat Sandwich Loaf', 2, 2.99),
(5, 'Cold Brew Coffee 32oz', 3, 6.49),
(6, 'Sparkling Mineral Water 6-Pack', 3, 4.99),
(7, 'Organic Gala Apples (1kg)', 4, 3.99),
(8, 'Fresh Hass Avocados (Bag of 4)', 4, 4.49),
(9, 'Extra Virgin Olive Oil 500ml', 5, 8.99),
(10, 'Organic Almond Butter 340g', 5, 9.49)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for products
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));