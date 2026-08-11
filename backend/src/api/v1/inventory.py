from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.schemas import InventoryAlertOut, ABCAnalysisOut, AlertDismissRequest
from src.modules import InventoryRiskEngine

router = APIRouter(prefix="/inventory", tags=["Inventory Intelligence & Risk"])

# Memory cache for dismissed alerts (in production persisted to DB table)
dismissed_alerts = set()

@router.get("/alerts", response_model=List[InventoryAlertOut])
def get_inventory_alerts(
    store_id: Optional[int] = None,
    severity: Optional[str] = Query(None, regex="^(HIGH|MEDIUM|LOW)$"),
    alert_type: Optional[str] = Query(None, regex="^(STOCKOUT_RISK|DEADSTOCK_RISK)$"),
    db: Session = Depends(get_db)
):
    """Retrieve operational inventory risk alerts (stockout & deadstock alerts)."""
    alerts = InventoryRiskEngine.detect_inventory_alerts(db, store_id=store_id)
    
    # Filter dismissed
    active_alerts = [a for a in alerts if a["id"] not in dismissed_alerts]

    if severity:
        active_alerts = [a for a in active_alerts if a["severity"] == severity]
    if alert_type:
        active_alerts = [a for a in active_alerts if a["alert_type"] == alert_type]

    return active_alerts

@router.get("/abc-analysis", response_model=ABCAnalysisOut)
def get_abc_analysis(store_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Retrieve Pareto ABC 80/15/5 revenue categorization of inventory items."""
    return InventoryRiskEngine.calculate_abc_classification(db, store_id=store_id)

@router.patch("/alerts/{alert_id}/dismiss", status_code=status.HTTP_200_OK)
def dismiss_inventory_alert(alert_id: str, payload: AlertDismissRequest):
    """Acknowledge or dismiss an inventory risk alert."""
    dismissed_alerts.add(alert_id)
    return {"message": f"Alert '{alert_id}' status updated to {payload.status}", "alert_id": alert_id}
