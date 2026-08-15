# create and manage load store and retrieve from db to showing in loaders dashboard

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.schemas import LoadCreate

router = APIRouter(prefix="", tags=["Loader & Loads"])

# create loads details to  db 
@router.post("/loads/", status_code=status.HTTP_201_CREATED)
def create_load(load: LoadCreate, db: Session = Depends(get_db)):
    if load.minPrice > load.maxPrice:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Minimum price cannot be greater than maximum price.")

    query = text("""
        INSERT INTO loads (pickup, destination, load_type, weight, truck_type,  pickup_date, min_price, max_price, description,  loader_id, status) 
        VALUES (:pickup, :destination, :loadType, :weight, :truckType, :pickupDate, :minPrice, :maxPrice, :description, :loaderId, 'AVAILABLE')""")

    result = db.execute(query, load.model_dump())
    db.commit()
    return {"message": "Load created successfully", "loadId": result.lastrowid}


# get loads by using loader id
@router.get("/loads/loader/{loader_id}")
def get_loader_loads(loader_id: int, db: Session = Depends(get_db)):
    query = text("""
        SELECT id, pickup, destination, load_type AS loadType, weight, 
               truck_type AS truckType, pickup_date AS pickupDate, 
               min_price AS minPrice, max_price AS maxPrice, description, 
               status, loader_id AS loaderId 
        FROM loads 
        WHERE loader_id = :loader_id 
        ORDER BY created_at DESC""")
    loads = db.execute(query, {"loader_id": loader_id}).mappings().all()
    return [dict(load) for load in loads]



# get to all loads for  dashbaord
@router.get("/loads/available")
def get_available_loads(db: Session = Depends(get_db)):
    query = text("""
        SELECT id, pickup, destination, load_type AS loadType, weight, 
               truck_type AS truckType, pickup_date AS pickupDate, 
               min_price AS minPrice, max_price AS maxPrice, description, 
               status, loader_id AS loaderId 
        FROM loads 
        WHERE status = 'AVAILABLE' 
        ORDER BY created_at DESC""")
    loads = db.execute(query).mappings().all()
    return [dict(load) for load in loads]



# cancel the load
@router.put("/loads/{load_id}/cancel")
def cancel_load(load_id: int, db: Session = Depends(get_db)):
    update_query = text("UPDATE loads SET status = 'CANCELLED' WHERE id = :load_id")
    result = db.execute(update_query, {"load_id": load_id})
    db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Load not found")
    return {"message": "Load cancelled successfully"}



# get availble /verifed driver shoing in laders dashbard
@router.get("/loader/available-drivers")
def get_available_drivers(db: Session = Depends(get_db)):
    query = text("""
        SELECT u.id AS user_id, u.name, u.phone, u.city, 
               dp.experience, dp.truck_number, dp.truck_type, 
               dp.capacity, dp.license_number 
        FROM users u 
        INNER JOIN driver_profiles dp ON u.id = dp.user_id 
        WHERE u.role = 'DRIVER' AND u.status = 'VERIFIED' 
        ORDER BY u.created_at DESC  """)


    drivers = db.execute(query).mappings().all()
    result = []
    for driver in drivers:
        driver_data = dict(driver)
        driver_data["driverUserId"] = driver_data["user_id"]
        driver_data["driverId"] = f"DRV-{driver_data['user_id']:03d}"
        driver_data["vehicleType"] = driver_data["truck_type"]
        driver_data["vehicleNumber"] = driver_data["truck_number"]
        driver_data["location"] = driver_data["city"]
        driver_data["experience"] = f"{driver_data['experience']} Years" if driver_data["experience"] is not None else "Not specified"
        driver_data["capacity"] = float(driver_data["capacity"]) if driver_data["capacity"] is not None else None
        driver_data["availabilityStatus"] = "Available"
        driver_data.pop("user_id", None)
        driver_data.pop("truck_type", None)
        driver_data.pop("truck_number", None)
        driver_data.pop("city", None)
        driver_data.pop("license_number", None)
        result.append(driver_data)
    return result