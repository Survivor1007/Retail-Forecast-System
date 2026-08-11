from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.models import Product, Category
from src.core.schemas import ProductOut, ProductCreate, ProductUpdate, ProductPatch

router = APIRouter(prefix="/products", tags=["Products Catalog"])

@router.get("", response_model=List[ProductOut])
def list_products(
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Retrieve product catalog with optional category and search filtering."""
    query = db.query(Product)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if search:
        query = query.filter(Product.product_name.ilike(f"%{search}%"))
    return query.order_by(Product.id).offset(offset).limit(limit).all()

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Fetch single product details by ID."""
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return prod

@router.post("", response_model=ProductOut, status_code=status.HTTP_217_CREATED if hasattr(status, 'HTTP_217_CREATED') else status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product item in the catalog."""
    if payload.category_id:
        cat = db.query(Category).filter(Category.id == payload.category_id).first()
        if not cat:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category_id")

    prod = Product(
        product_name=payload.product_name,
        category_id=payload.category_id,
        unit_price=payload.unit_price
    )
    db.add(prod)
    db.commit()
    db.refresh(prod)
    return prod

@router.put("/{product_id}", response_model=ProductOut)
def replace_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    """Replace/update all fields of an existing product item."""
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if payload.category_id:
        cat = db.query(Category).filter(Category.id == payload.category_id).first()
        if not cat:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category_id")

    prod.product_name = payload.product_name
    prod.category_id = payload.category_id
    prod.unit_price = payload.unit_price

    db.commit()
    db.refresh(prod)
    return prod

@router.patch("/{product_id}", response_model=ProductOut)
def patch_product(product_id: int, payload: ProductPatch, db: Session = Depends(get_db)):
    """Partially update specific fields of a product (e.g. price adjustment)."""
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if payload.product_name is not None:
        prod.product_name = payload.product_name
    if payload.category_id is not None:
        cat = db.query(Category).filter(Category.id == payload.category_id).first()
        if not cat:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category_id")
        prod.category_id = payload.category_id
    if payload.unit_price is not None:
        prod.unit_price = payload.unit_price

    db.commit()
    db.refresh(prod)
    return prod

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Remove a product from the catalog."""
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    db.delete(prod)
    db.commit()
    return None
