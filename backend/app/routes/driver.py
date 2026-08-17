from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import DealCreate

router = APIRouter(tags=["Driver"])

@router.get("/")
def driver_home():
    return {"message": "Driver API is ready"}


@router.get("/available-loads")
def get_available_loads(db: Session = Depends(get_db)):
    query = text("""
        SELECT id, pickup, destination, load_type AS "loadType", weight, 
               truck_type AS "truckType", pickup_date AS "pickupDate", 
               min_price AS "minPrice", max_price AS "maxPrice", description, 
               status, loader_id AS "loaderId" 
        FROM loads 
        WHERE status = 'AVAILABLE' 
          AND id NOT IN (SELECT load_id FROM deals WHERE status = 'PENDING') 
        ORDER BY created_at DESC
    """)
    loads = db.execute(query).mappings().all()
    return [dict(load) for load in loads]


@router.post("/deals", status_code=status.HTTP_201_CREATED)
def create_deal(data: DealCreate, db: Session = Depends(get_db)):
    # 1. Validate Driver Profile
    driver_query = text("""
        SELECT id, name, role, status 
        FROM users 
        WHERE id = :driver_id AND role = 'DRIVER' AND status = 'VERIFIED'
    """)
    driver = db.execute(driver_query, {"driver_id": data.driverId}).mappings().first()
    if not driver:
        raise HTTPException(status_code=400, detail="Invalid or unverified driver")

    # 2. Validate Load Eligibility
    load_query = text("""
        SELECT id, pickup, destination, min_price, max_price, status, loader_id 
        FROM loads 
        WHERE id = :load_id
    """)
    load = db.execute(load_query, {"load_id": data.loadId}).mappings().first()
    if not load:
        raise HTTPException(status_code=404, detail="Load not found")

    if load["status"] != "AVAILABLE":
        raise HTTPException(status_code=400, detail="This load is no longer available")

    # 3. Check Financial Boundaries
    if data.dealPrice < float(load["min_price"]) or data.dealPrice > float(load["max_price"]):
        raise HTTPException(
            status_code=400, 
            detail=f"Deal price must be between ₹{load['min_price']} and ₹{load['max_price']}"
        )

    # 4. Check for Existing Offer Duplicate
    deal_check_query = text("""
        SELECT 1 
        FROM deals 
        WHERE load_id = :load_id AND driver_id = :driver_id AND status = 'PENDING'
    """)
    existing_deal = db.execute(deal_check_query, {"load_id": data.loadId, "driver_id": data.driverId}).scalar()
    if existing_deal:
        raise HTTPException(status_code=400, detail="You already have a pending deal for this load")

    # 5. Execute DB Mutations Safely
    try:
        # Using RETURNING guarantees identity mapping regardless of DB engine engine variants
        insert_deal_query = text("""
            INSERT INTO deals (load_id, driver_id, deal_price, status) 
            VALUES (:load_id, :driver_id, :deal_price, 'PENDING')
            RETURNING id
        """)
        deal_id = db.execute(insert_deal_query, {
            "load_id": data.loadId, 
            "driver_id": data.driverId, 
            "deal_price": data.dealPrice
        }).scalar()

        update_load_query = text("UPDATE loads SET status = 'BOOKED' WHERE id = :load_id")
        db.execute(update_load_query, {"load_id": data.loadId})
        
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to safely process deal submission transaction")

    return {
        "message": "Deal request sent successfully", 
        "dealId": deal_id, 
        "loadId": data.loadId, 
        "driverId": data.driverId, 
        "driverName": driver["name"], 
        "dealPrice": data.dealPrice, 
        "status": "PENDING"
    }
