from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

router = APIRouter(tags=["Deals"])

# --- Helper Functions ---
def fetch_deal_or_404(deal_id: int, db: Session):
    deal = db.execute(
        text("SELECT id, load_id, driver_id, status FROM deals WHERE id = :deal_id"), 
        {"deal_id": deal_id}
    ).mappings().first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return deal


# --- Endpoints ---

@router.get("/driver/{driver_id}")
def get_driver_deals(driver_id: int, db: Session = Depends(get_db)):
    query = text("""
        SELECT d.id AS "dealId", d.load_id AS "loadId", d.driver_id AS "driverId", 
               d.deal_price AS "dealPrice", d.status AS status, l.pickup, 
               l.destination, l.load_type AS "loadType", l.weight, 
               l.truck_type AS "truckType", l.pickup_date AS "pickupDate", 
               l.loader_id AS "loaderId", loader.name AS "loaderName", 
               loader.phone AS "loaderPhone", loader.city AS "loaderCity" 
        FROM deals d 
        INNER JOIN loads l ON d.load_id = l.id 
        INNER JOIN users loader ON l.loader_id = loader.id 
        WHERE d.driver_id = :driver_id 
        ORDER BY d.id DESC
    """)
    deals = db.execute(query, {"driver_id": driver_id}).mappings().all()
    return [dict(deal) for deal in deals]


@router.get("/loader/{loader_id}")
def get_loader_deals(loader_id: int, db: Session = Depends(get_db)):
    query = text("""
        SELECT d.id AS "dealId", d.load_id AS "loadId", d.driver_id AS "driverId", 
               d.deal_price AS "dealPrice", d.status AS status, l.pickup, 
               l.destination, l.load_type AS "loadType", l.weight, 
               l.truck_type AS "truckType", l.pickup_date AS "pickupDate", 
               driver.name AS "driverName", driver.phone AS "driverPhone", 
               driver.city AS "driverCity", dp.truck_type AS "vehicleType", 
               dp.truck_number AS "vehicleNumber", dp.capacity, dp.experience 
        FROM deals d 
        INNER JOIN loads l ON d.load_id = l.id 
        INNER JOIN users driver ON d.driver_id = driver.id 
        LEFT JOIN driver_profiles dp ON driver.id = dp.user_id 
        WHERE l.loader_id = :loader_id 
        ORDER BY d.id DESC
    """)
    deals = db.execute(query, {"loader_id": loader_id}).mappings().all()
    return [dict(deal) for deal in deals]


@router.put("/{deal_id}/accept")
def accept_deal(deal_id: int, db: Session = Depends(get_db)):
    deal = fetch_deal_or_404(deal_id, db)
    if deal["status"] != "PENDING":
        raise HTTPException(status_code=400, detail="Only pending deals can be accepted")
    
    try:
        db.execute(text("UPDATE deals SET status = 'ACCEPTED' WHERE id = :deal_id"), {"deal_id": deal_id})
        db.execute(text("UPDATE loads SET status = 'BOOKED' WHERE id = :load_id"), {"load_id": deal["load_id"]})
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to accept deal transaction")

    return {"message": "Deal accepted successfully", "dealId": deal_id, "status": "ACCEPTED"}


@router.put("/{deal_id}/start")
def start_trip(deal_id: int, db: Session = Depends(get_db)):
    deal = fetch_deal_or_404(deal_id, db)
    if deal["status"] != "ACCEPTED":
        raise HTTPException(status_code=400, detail="Only accepted deals can be started")
    
    try:
        db.execute(text("UPDATE deals SET status = 'IN TRANSIT' WHERE id = :deal_id"), {"deal_id": deal_id})
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to start trip transaction")

    return {"message": "Trip started successfully", "dealId": deal_id, "status": "IN TRANSIT"}


@router.put("/{deal_id}/complete")
def complete_deal(deal_id: int, db: Session = Depends(get_db)):
    deal = fetch_deal_or_404(deal_id, db)
    if deal["status"] != "IN TRANSIT":
        raise HTTPException(status_code=400, detail="Only in-transit trips can be completed")
    
    try:
        db.execute(text("UPDATE deals SET status = 'COMPLETED' WHERE id = :deal_id"), {"deal_id": deal_id})
        db.execute(text("UPDATE loads SET status = 'COMPLETED' WHERE id = :load_id"), {"load_id": deal["load_id"]})
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to complete deal transaction")

    return {"message": "Trip completed successfully", "dealId": deal_id, "status": "COMPLETED"}


@router.put("/{deal_id}/reject")
def reject_deal(deal_id: int, db: Session = Depends(get_db)):
    deal = fetch_deal_or_404(deal_id, db)
    if deal["status"] != "PENDING":
        raise HTTPException(status_code=400, detail="Only pending deals can be rejected")
    
    try:
        db.execute(text("UPDATE deals SET status = 'REJECTED' WHERE id = :deal_id"), {"deal_id": deal_id})
        db.execute(text("UPDATE loads SET status = 'AVAILABLE' WHERE id = :load_id"), {"load_id": deal["load_id"]})
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to reject deal transaction")

    return {"message": "Deal rejected", "dealId": deal_id, "status": "REJECTED"}


@router.get("/{deal_id}")
def get_deal(deal_id: int, db: Session = Depends(get_db)):
    query = text("""
        SELECT d.id AS "dealId", d.load_id AS "loadId", d.driver_id AS "driverId", 
               d.deal_price AS "dealPrice", d.status AS status, l.pickup, 
               l.destination, l.load_type AS "loadType", l.weight, 
               l.truck_type AS "truckType", l.pickup_date AS "pickupDate", 
               l.loader_id AS "loaderId", driver.name AS "driverName", 
               driver.phone AS "driverPhone", driver.city AS "driverCity", 
               loader.name AS "loaderName", loader.phone AS "loaderPhone", 
               loader.city AS "loaderCity" 
        FROM deals d 
        INNER JOIN loads l ON d.load_id = l.id 
        INNER JOIN users driver ON d.driver_id = driver.id 
        INNER JOIN users loader ON l.loader_id = loader.id 
        WHERE d.id = :deal_id
    """)
    deal = db.execute(query, {"deal_id": deal_id}).mappings().first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return dict(deal)
