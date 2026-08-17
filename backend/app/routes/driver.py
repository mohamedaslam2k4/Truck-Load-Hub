from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import DealCreate
from app.auth import require_role
from app.models import User

router = APIRouter(tags=["Driver"])
driver_guard = Depends(require_role(["DRIVER"]))

@router.get("/")
def driver_home():
    return {"message": "Driver API is ready"}

@router.get("/available-loads")
def get_available_loads(db: Session = Depends(get_db), current_user: User = driver_guard):
    query = text("""
        SELECT id, pickup, destination, load_type AS loadType, weight, 
               truck_type AS truckType, pickup_date AS pickupDate, 
               min_price AS minPrice, max_price AS maxPrice, description, 
               status, loader_id AS loaderId 
        FROM loads 
        WHERE status = 'AVAILABLE' 
          AND id NOT IN (SELECT load_id FROM deals WHERE status = 'PENDING') 
        ORDER BY created_at DESC
    """)
    loads = db.execute(query).mappings().all()
    return [dict(load) for load in loads]

@router.post("/deals", status_code=status.HTTP_201_CREATED)
def create_deal(data: DealCreate, db: Session = Depends(get_db), current_user: User = driver_guard):
    if current_user.status != "VERIFIED":
        raise HTTPException(status_code=403, detail="Unverified driver account")

    load = db.execute(
        text("SELECT id, min_price, max_price, status FROM loads WHERE id = :load_id"),
        {"load_id": data.loadId}
    ).mappings().first()

    if not load:
        raise HTTPException(status_code=404, detail="Load not found")

    if load["status"] != "AVAILABLE":
        raise HTTPException(status_code=400, detail="This load is no longer available")

    if data.dealPrice < float(load["min_price"]) or data.dealPrice > float(load["max_price"]):
        raise HTTPException(status_code=400, detail=f"Deal price must be between ₹{load['min_price']} and ₹{load['max_price']}")

    existing_deal = db.execute(
        text("SELECT id FROM deals WHERE load_id = :load_id AND driver_id = :driver_id AND status = 'PENDING'"),
        {"load_id": data.loadId, "driver_id": current_user.id}
    ).first()
    if existing_deal:
        raise HTTPException(status_code=400, detail="You already have a pending deal for this load")

    result = db.execute(
        text("INSERT INTO deals (load_id, driver_id, deal_price, status) VALUES (:load_id, :driver_id, :deal_price, 'PENDING')"),
        {"load_id": data.loadId, "driver_id": current_user.id, "deal_price": data.dealPrice}
    )

    db.execute(text("UPDATE loads SET status = 'BOOKED' WHERE id = :load_id"), {"load_id": data.loadId})
    db.commit()

    return {
        "message": "Deal request sent successfully", 
        "dealId": result.lastrowid, 
        "loadId": data.loadId, 
        "driverId": current_user.id, 
        "driverName": current_user.name, 
        "dealPrice": data.dealPrice, 
        "status": "PENDING"
    }
