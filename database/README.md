# Database Architecture & Migration Management
## Overview
The **Automated Demand Forecasting & Inventory Intelligence Engine** utilizes a standalone PostgreSQL 16 database instance for storing:
1. **Master Relational Data**: Stores, Product Categories, Products.
2. **Transactional Line Items**: Sales Orders, Order Items.
3. **Time-Series Aggregations**: Pre-calculated daily aggregations (`daily_sales_aggregates`) for sub-millisecond chart and analytics rendering.
4. **Forecasting Model Results**: Dual-model competition results (`forecast_results`) with MAPE and RMSE metrics.
---
## Directory Structure
```
database/
├── docker-entrypoint-initdb.d/
│   ├── 01_schema.sql      # DDL table declarations, foreign keys, indexes
│   └── 02_seed_data.sql   # Seed records for stores, categories, products
└── README.md
```
---
## Connecting via CLI or GUI
- **Host**: `localhost` (or `db` inside Docker network)
- **Port**: `5432`
- **Database**: `forecast_db`(example)
- **Username**: `forecast_user`(example)
- **Password**: `forecast_secret`(example)
### Psql Connection Command
```bash
psql -h localhost -p 5432 -U forecast_user -d forecast_db
```