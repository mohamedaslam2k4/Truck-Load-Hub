from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.schemas import LoadCreate
from app.auth import require_role, get_current_user
from app.models import User

router = APIRouter(tags=["Loader & Loads"])
loader_guard = Depends(require_role(["LOADER"]))

@router.post("/loads/", status_code=status.HTTP_201_CREATED)
def create_load(load: LoadCreate, db: Session = Depends(get_db), current_user: User = loader_guard):
    if load.minPrice > load.maxPrice:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Minimum price cannot be greater than maximum price.")

    payload = load.model_dump()
    payload["loaderId"] = current_user.id  # Overrides payload loader ID with session user ID

    query = text("""
        INSERT INTO loads (pickup, destination, load_type, weight, truck_type, pickup_date, min_price, max_price, description, loader_id, status) 
        VALUES (:pickup, :destination, :loadType, :weight, :truckType, :pickupDate, :minPrice, :maxPrice, :description, :loaderId, 'AVAILABLE')
    """)

    result = db.execute(query, payload)
    db.commit()
    return {"message": "Load created successfully", "loadId": result.lastrowid}

@router.get("/loads/loader/{loader_id}")
def get_loader_loads(loader_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role(["LOADER", "ADMIN"]))):
    if current_user.role == "LOADER" and current_user.id != loader_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    query = text("""
        SELECT id, pickup, destination, load_type AS loadType, weight, 
               truck_type AS truckType, pickup_date AS pickupDate, 
               min_price AS minPrice, max_price AS maxPrice, description, 
               status, loader_id AS loaderId 
        FROM loads WHERE loader_id = :loader_id ORDER BY created_at DESC
    """)
    loads = db.execute(query, {"loader_id": loader_id}).mappings().all()
    return [dict(load) for load in loads]

@router.get("/loads/available")
def get_available_loads(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = text("""
        SELECT id, pickup, destination, load_type AS loadType, weight, 
               truck_type AS truckType, pickup_date AS pickupDate, 
               min_price AS minPrice, max_price AS maxPrice, description, 
               status, loader_id AS loaderId 
        FROM loads WHERE status = 'AVAILABLE' ORDER BY created_at DESC
    """)
    loads = db.execute(query).mappings().all()
    return [dict(load) for load in loads]

@router.put("/loads/{load_id}/cancel")
def cancel_load(load_id: int, db: Session = Depends(get_db), current_user: User = loader_guard):
    load = db.execute(text("SELECT loader_id FROM loads WHERE id = :load_id"), {"load_id": load_id}).mappings().first()
    if not load:
        raise HTTPException(status_code=404, detail="Load not found")
    if load["loader_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: You cannot cancel another user's load")

    db.execute(text("UPDATE loads SET status = 'CANCELLED' WHERE id = :load_id"), {"load_id": load_id})
    db.commit()
    return {"message": "Load cancelled successfully"}

@router.get("/loader/available-drivers")
def get_available_drivers(db: Session = Depends(get_db), current_user: User = loader_guard):
    query = text("""
        SELECT u.id AS user_id, u.name, u.phone, u.city, 
               dp.experience, dp.truck_number, dp.truck_type, 
               dp.capacity, dp.license_number 
        FROM users u 
        INNER JOIN driver_profiles dp ON u.id = dp.user_id 
        WHERE u.role = 'DRIVER' AND u.status = 'VERIFIED' 
        ORDER BY u.created_at DESC
    """)

    drivers = db.execute(query).mappings().all()
    result = []
    for driver in drivers:
        d = dict(driver)
        d["driverUserId"] = d["user_id"]
        d["driverId"] = f"DRV-{d['user_id']:03d}"
        d["vehicleType"] = d["truck_type"]
        d["vehicleNumber"] = d["truck_number"]
        d["location"] = d["city"]
        d["experience"] = f"{d['experience']} Years" if d["experience"] is not None else "Not specified"
        d["capacity"] = float(d["capacity"]) if d["capacity"] is not None else None
        d["availabilityStatus"] = "Available"
        
        for key in ["user_id", "truck_type", "truck_number", "city", "license_number"]:
            d.pop(key, None)
        result.append(d)

    return result
