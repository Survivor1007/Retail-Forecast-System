from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.models import Store
from src.core.schemas import StoreOut, StoreCreate, StoreUpdate

router = APIRouter(prefix="/stores", tags=["Stores Master"])

@router.get("", response_model=List[StoreOut])
def list_stores(db: Session = Depends(get_db)):
    """List all registered store locations."""
    return db.query(Store).order_by(Store.id).all()

@router.post("", response_model=StoreOut, status_code=status.HTTP_201_CREATED)
def create_store(payload: StoreCreate, db: Session = Depends(get_db)):
    """Register a new store location."""
    store = Store(store_name=payload.store_name, city=payload.city)
    db.add(store)
    db.commit()
    db.refresh(store)
    return store

@router.put("/{store_id}", response_model=StoreOut)
def update_store(store_id: int, payload: StoreUpdate, db: Session = Depends(get_db)):
    """Update store details."""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found")
    store.store_name = payload.store_name
    store.city = payload.city
    db.commit()
    db.refresh(store)
    return store

@router.delete("/{store_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_store(store_id: int, db: Session = Depends(get_db)):
    """Remove a store location."""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found")
    db.delete(store)
    db.commit()
    return None
