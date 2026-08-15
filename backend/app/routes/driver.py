 #createing deals and managaing loads from driver dashboard

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import DealCreate

router = APIRouter(prefix="/driver", tags=["Driver"])


# driver root api
@router.get("/")
def driver_home():
    return {"message": "Driver API is ready"}


# get available loads for driver dashbaord
@router.get("/available-loads")
def get_available_loads(db: Session = Depends(get_db)):
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



# create deals
@router.post("/deals", status_code=status.HTTP_201_CREATED)
def create_deal(data: DealCreate, db: Session = Depends(get_db)):

    # check driver
    driver_query = text("""
        SELECT id, name, role, status 
        FROM users 
        WHERE id = :driver_id AND role = 'DRIVER' AND status = 'VERIFIED'
    """)
    driver = db.execute(driver_query, {"driver_id": data.driverId}).mappings().first()
    if not driver:
        raise HTTPException(status_code=400, detail="Invalid or unverified driver")


    # check loads
    load_query = text("""
        SELECT id, pickup, destination, min_price, max_price, status, loader_id 
        FROM loads 
        WHERE id = :load_id
    """)
    load = db.execute(load_query, {"load_id": data.loadId}).mappings().first()
    if not load:
        raise HTTPException(status_code=404, detail="Load not found")


    # check load status
    if load["status"] != "AVAILABLE":
        raise HTTPException(status_code=400, detail="This load is no longer available")


    # check the deal price 
    if data.dealPrice < float(load["min_price"]) or data.dealPrice > float(load["max_price"]):
        raise HTTPException(status_code=400, detail=f"Deal price must be between ₹{load['min_price']} and ₹{load['max_price']}")


    # check existing pending deal

    deal_check_query = text("""
        SELECT id 
        FROM deals 
        WHERE load_id = :load_id AND driver_id = :driver_id AND status = 'PENDING'
    """)
    existing_deal = db.execute(deal_check_query, {"load_id": data.loadId, "driver_id": data.driverId}).first()
    if existing_deal:
        raise HTTPException(status_code=400, detail="You already have a pending deal for this load")


    # insert  deal
    insert_deal_query = text("""
        INSERT INTO deals (load_id, driver_id, deal_price, status) 
        VALUES (:load_id, :driver_id, :deal_price, 'PENDING')
    """)
    result = db.execute(insert_deal_query, {"load_id": data.loadId, "driver_id": data.driverId, "deal_price": data.dealPrice})


    # chnage load status  (AVAILABLE -> BOOKED)
    update_load_query = text("UPDATE loads SET status = 'BOOKED' WHERE id = :load_id")
    db.execute(update_load_query, {"load_id": data.loadId})


    # COMMIT & RESPONSE
    db.commit()
    return {"message": "Deal request sent successfully", 
            "dealId": result.lastrowid, "loadId": data.loadId, "driverId": data.driverId, "driverName": driver["name"], "dealPrice": data.dealPrice, "status": "PENDING"}