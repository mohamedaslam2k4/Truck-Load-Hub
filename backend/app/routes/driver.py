from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import DealCreate

router = APIRouter(tags=["Driver"])




@router.get("/available-loads")
def get_available_loads(driver_id: int = None, db: Session = Depends(get_db)):
    if driver_id:
        query = text("""
            SELECT l.id, l.pickup, l.destination, l.load_type AS "loadType", l.weight, 
                   l.truck_type AS "truckType",  DATE_FORMAT(l.pickup_date, '%d/%m/%Y') AS "pickupDate", 
                   l.min_price AS "minPrice", l.max_price AS "maxPrice", l.description, 
                   l.status, l.loader_id AS "loaderId" 
            FROM loads l
            WHERE l.status = 'AVAILABLE'
              AND l.id NOT IN (
                  SELECT load_id 
                  FROM deals 
                  WHERE driver_id = :driver_id AND status IN ('PENDING', 'ACCEPTED')
              )
            ORDER BY l.created_at DESC
        """)
        loads = db.execute(query, {"driver_id": driver_id}).mappings().all()
    else:
        query = text("""
            SELECT id, pickup, destination, load_type AS "loadType", weight, 
                   truck_type AS "truckType",  DATE_FORMAT(pickup_date, '%d/%m/%Y') AS "pickupDate", 
                   min_price AS "minPrice", max_price AS "maxPrice", description, 
                   status, loader_id AS "loaderId" 
            FROM loads 
            WHERE status = 'AVAILABLE' 
            ORDER BY created_at DESC
        """)
        loads = db.execute(query).mappings().all()

    return [dict(load) for load in loads]

@router.post("/deals", status_code=status.HTTP_201_CREATED)
def create_deal(data: DealCreate, db: Session = Depends(get_db)):
    
    # 1. Verify driver profile
    driver = db.execute(text("""
        SELECT id, name, role, status 
        FROM users 
        WHERE id = :driver_id AND role = 'DRIVER' AND status = 'VERIFIED'
    """), {"driver_id": data.driverId}).mappings().first()

    if not driver:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid or unverified driver profile."
        )

    try:
        # 2. Check load availability and price bounds
        load = db.execute(text("""
            SELECT id, min_price, max_price, status 
            FROM loads 
            WHERE id = :load_id FOR UPDATE
        """), {"load_id": data.loadId}).mappings().first()

        if not load:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Load not found."
            )

        if load["status"] != "AVAILABLE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="This load has already been assigned or is no longer available."
            )

        # 3. Validate deal amount against loader budget range
        if data.dealPrice < float(load["min_price"]) or data.dealPrice > float(load["max_price"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Offered amount must be between ₹{load['min_price']} and ₹{load['max_price']}."
            )

        # 4. Prevent the same driver from bidding multiple times on the same load
        existing_deal = db.execute(text("""
            SELECT 1 FROM deals 
            WHERE load_id = :load_id AND driver_id = :driver_id AND status = 'PENDING'
        """), {"load_id": data.loadId, "driver_id": data.driverId}).scalar()

        if existing_deal:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="You have already submitted a pending deal for this load."
            )

        # 5. Insert deal bid without locking/changing the load status
        result = db.execute(text("""
            INSERT INTO deals (load_id, driver_id, deal_price, status) 
            VALUES (:load_id, :driver_id, :deal_price, 'PENDING')
        """), {
            "load_id": data.loadId, 
            "driver_id": data.driverId, 
            "deal_price": data.dealPrice
        })

        db.commit()

        return {
            "message": "Deal offer submitted successfully.", 
            "dealId": result.lastrowid, 
            "loadId": data.loadId,
            "driverId": data.driverId,
            "dealPrice": data.dealPrice,
            "status": "PENDING"
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Transaction failed: {str(e)}"
        )
