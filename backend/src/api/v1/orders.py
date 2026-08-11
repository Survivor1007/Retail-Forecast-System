from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.models import SalesOrder, OrderItem, Store, Product
from src.core.schemas import SalesOrderOut, SalesOrderCreate
from src.modules import ETLAggregate

router = APIRouter(prefix="/orders", tags=["Transactional Sales Orders"])

@router.get("", response_model=List[SalesOrderOut])
def list_orders(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    store_id: Optional[int] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Retrieve transactional sales orders history."""
    query = db.query(SalesOrder)
    if start_date:
        query = query.filter(SalesOrder.order_date >= start_date)
    if end_date:
        query = query.filter(SalesOrder.order_date <= end_date)
    if store_id:
        query = query.filter(SalesOrder.store_id == store_id)
    return query.order_by(SalesOrder.order_date.desc()).offset(offset).limit(limit).all()

@router.get("/{order_id}", response_model=SalesOrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Fetch order details with line items."""
    order = db.query(SalesOrder).filter(SalesOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sales order not found")
    return order

@router.post("", response_model=SalesOrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: SalesOrderCreate, db: Session = Depends(get_db)):
    """Record a new transactional sales order."""
    store = db.query(Store).filter(Store.id == payload.store_id).first()
    if not store:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid store_id")

    if not payload.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order must contain at least 1 item")

    order = SalesOrder(
        order_date=payload.order_date,
        store_id=payload.store_id,
        customer_type=payload.customer_type,
        payment_mode=payload.payment_mode
    )
    db.add(order)
    db.flush()

    for item_data in payload.items:
        prod = db.query(Product).filter(Product.id == item_data.product_id).first()
        if not prod:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid product_id: {item_data.product_id}")

        total_sales = round((item_data.quantity_sold * item_data.unit_price) - item_data.discount_amount + item_data.tax_amount, 2)
        item = OrderItem(
            order_id=order.id,
            product_id=item_data.product_id,
            quantity_sold=item_data.quantity_sold,
            unit_price=item_data.unit_price,
            discount_amount=item_data.discount_amount,
            tax_amount=item_data.tax_amount,
            total_sales=total_sales
        )
        db.add(item)

    db.commit()
    db.refresh(order)

    # Automatically trigger daily aggregate rebuild for the order date
    ETLAggregate.rebuild_daily_aggregates(db, target_date=payload.order_date.date())

    return order

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Cancel/delete an existing sales order."""
    order = db.query(SalesOrder).filter(SalesOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sales order not found")
    
    order_date = order.order_date.date()
    db.delete(order)
    db.commit()

    # Update daily sales aggregates
    ETLAggregate.rebuild_daily_aggregates(db, target_date=order_date)
    return None
