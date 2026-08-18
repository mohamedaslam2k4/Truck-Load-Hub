from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.schemas import LoadCreate
from datetime import date

router = APIRouter(tags=["Loader & Loads"])


@router.post("/loads/", status_code=status.HTTP_201_CREATED)
def create_load(load: LoadCreate, db: Session = Depends(get_db)):
    if load.minPrice > load.maxPrice:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Minimum price cannot be greater than maximum price."
        )

    try:
        # MySQL compatible query (Removed RETURNING id)
        query = text("""
            INSERT INTO loads (
                pickup, destination, load_type, weight, truck_type, 
                pickup_date, min_price, max_price, description, loader_id, status
            ) 
            VALUES (
                :pickup, :destination, :loadType, :weight, :truckType, 
                :pickupDate, :minPrice, :maxPrice, :description, :loaderId, 'AVAILABLE'
            )
        """)
        
        result = db.execute(query, {
            "pickup": load.pickup,
            "destination": load.destination,
            "loadType": load.loadType,
            "weight": load.weight,
            "truckType": load.truckType,
            "pickupDate": load.pickupDate,
            "minPrice": load.minPrice,
            "maxPrice": load.maxPrice,
            "description": load.description,
            "loaderId": load.loaderId
        })
        
        db.commit()
        load_id = result.lastrowid

    except Exception as e:
        db.rollback()
        print(f"❌ Database Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to initialize and save load details: {str(e)}"
        )

    return {"message": "Load created successfully", "loadId": load_id}


@router.get("/loads/loader/{loader_id}")
def get_loader_loads(loader_id: int, db: Session = Depends(get_db)):
    query = text("""
        SELECT id, pickup, destination, load_type AS "loadType", weight, 
               truck_type AS "truckType", DATE_FORMAT(pickup_date, '%d/%m/%Y') AS pickupDate, 
               min_price AS "minPrice", max_price AS "maxPrice", description, 
               status, loader_id AS "loaderId" 
        FROM loads 
        WHERE loader_id = :loader_id 
        ORDER BY created_at DESC
    """)
    loads = db.execute(query, {"loader_id": loader_id}).mappings().all()
    return [dict(load) for load in loads]


@router.get("/loads/available")
def get_available_loads(db: Session = Depends(get_db)):
    query = text("""
        SELECT id, pickup, destination, load_type AS "loadType", weight, 
               truck_type AS "truckType", DATE_FORMAT(pickup_date, '%d/%m/%Y') AS pickupDate, 
               min_price AS "minPrice", max_price AS "maxPrice", description, 
               status, loader_id AS "loaderId" 
        FROM loads 
        WHERE status = 'AVAILABLE' 
        ORDER BY created_at DESC
    """)
    loads = db.execute(query).mappings().all()
    return [dict(load) for load in loads]


@router.put("/loads/{load_id}/cancel")
def cancel_load(load_id: int, db: Session = Depends(get_db)):
    try:
        # Validate that the target row exists and is mutable
        check_query = text("SELECT status FROM loads WHERE id = :load_id FOR UPDATE")
        current_status = db.execute(check_query, {"load_id": load_id}).scalar()
        
        if not current_status:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Load profile not found")
        
        if current_status != "AVAILABLE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Cannot cancel a load that is currently '{current_status}'"
            )

        update_query = text("UPDATE loads SET status = 'CANCELLED' WHERE id = :load_id")
        db.execute(update_query, {"load_id": load_id})
        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Cancellation transaction failed."
        )

    return {"message": "Load cancelled successfully"}


@router.get("/loader/available-drivers")
def get_available_drivers(db: Session = Depends(get_db)):
    # Data transformations offloaded to SQL engine for performance optimization
    query = text("""
        SELECT 
            u.id AS "driverUserId",
            u.name,
            u.phone,
            CONCAT('DRV-', LPAD(CAST(u.id AS VARCHAR), 3, '0')) AS "driverId",
            dp.truck_type AS "vehicleType",
            dp.truck_number AS "vehicleNumber",
            u.city AS "location",
            CASE 
                WHEN dp.experience IS NOT NULL THEN CONCAT(dp.experience, ' Years')
                ELSE 'Not specified'
            END AS "experience",
            CAST(dp.capacity AS FLOAT) AS "capacity",
            'Available' AS "availabilityStatus"
        FROM users u 
        INNER JOIN driver_profiles dp ON u.id = dp.user_id 
        WHERE u.role = 'DRIVER' AND u.status = 'VERIFIED' 
        ORDER BY u.created_at DESC
    """)
    drivers = db.execute(query).mappings().all()
    return [dict(driver) for driver in drivers]
