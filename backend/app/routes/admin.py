from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from typing import List, Dict, Any

router = APIRouter(tags=["Admin"])

# --- Request Schemas ---
class VerificationUpdate(BaseModel):
    status: str = Field(..., description="Must be 'VERIFIED' or 'REJECTED'")

# --- Endpoints ---

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    # Combined count queries to execute in 1 single database round-trip
    counts = db.execute(text("""
        SELECT 
            COUNT(CASE WHEN role = 'DRIVER' THEN 1 END) as driver_count,
            COUNT(CASE WHEN role = 'LOADER' THEN 1 END) as loader_count,
            COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_count,
            (SELECT COUNT(*) FROM deals WHERE status IN ('PENDING', 'ACCEPTED')) as active_deals
        FROM users
    """)).mappings().first()

    pending_users = db.execute(text("""
        SELECT id, name, email, phone, role, status, created_at 
        FROM users 
        WHERE status = 'PENDING' 
        ORDER BY created_at DESC 
        LIMIT 5
    """)).mappings().all()

    return {
        "driver_count": counts["driver_count"] or 0,
        "loader_count": counts["loader_count"] or 0,
        "pending_count": counts["pending_count"] or 0,
        "active_deals": counts["active_deals"] or 0,
        "pending_users": [dict(user) for user in pending_users]
    }


@router.get("/drivers")
def get_all_drivers(db: Session = Depends(get_db)):
    drivers = db.execute(text("""
        SELECT 
            u.id, u.name, u.email, u.phone, u.city, u.role, u.status, 
            u.created_at AS "createdAt", 
            dp.id AS "driverId", dp.experience, 
            dp.truck_number AS "truckNumber", dp.truck_type AS "truckType", 
            dp.capacity, dp.license_number AS "licenseNumber"
        FROM users u 
        LEFT JOIN driver_profiles dp ON u.id = dp.user_id 
        WHERE u.role = 'DRIVER' 
        ORDER BY u.id DESC
    """)).mappings().all()
    return [dict(driver) for driver in drivers]


@router.get("/loaders")
def get_loaders(db: Session = Depends(get_db)):
    loaders = db.execute(text("""
        SELECT 
            u.id, u.name, u.email, u.phone, u.city, u.role, u.status, u.created_at, 
            lp.id AS "loaderId", lp.company_name AS "companyName", 
            lp.contact_person AS "contactPerson", lp.business_type AS "businessType",
            (SELECT COUNT(*) FROM loads l WHERE l.loader_id = u.id) AS "totalLoads"
        FROM users u 
        LEFT JOIN loader_profiles lp ON u.id = lp.user_id 
        WHERE u.role = 'LOADER' 
        ORDER BY u.created_at DESC
    """)).mappings().all()
    return [dict(loader) for loader in loaders]


@router.get("/verification")
def get_pending_users(db: Session = Depends(get_db)):
    users = db.execute(text("""
        SELECT id, name, email, phone, city, role, status, created_at 
        FROM users 
        WHERE status = 'PENDING' 
        ORDER BY created_at DESC
    """)).mappings().all()
    return [dict(user) for user in users]


@router.put("/verification/{user_id}")
def update_verification(user_id: int, payload: VerificationUpdate, db: Session = Depends(get_db)):
    if payload.status not in ["VERIFIED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    user_exists = db.execute(
        text("SELECT 1 FROM users WHERE id = :user_id"), 
        {"user_id": user_id}
    ).scalar()

    if not user_exists:
        raise HTTPException(status_code=404, detail="User not found")

    db.execute(
        text("UPDATE users SET status = :status WHERE id = :user_id"),
        {"status": payload.status, "user_id": user_id}
    )
    db.commit()
    return {"message": "User status updated", "user_id": user_id, "status": payload.status}


@router.get("/contacts")
def get_contacts(db: Session = Depends(get_db)):
    # Date formatting offloaded directly to SQL (PostgreSQL template shown here)
    # If using MySQL, swap TO_CHAR(...) with DATE_FORMAT(created_at, '%d-%m-%Y')
    contacts = db.execute(text("""
        SELECT id, name, email, phone, message, status, 
               TO_CHAR(created_at, 'DD-MM-YYYY') AS "createdAt"
        FROM contacts 
        WHERE status = 'PENDING' 
        ORDER BY created_at DESC
    """)).mappings().all()
    return [dict(contact) for contact in contacts]


@router.put("/contacts/{contact_id}/resolve")
def resolve_contact(contact_id: int, db: Session = Depends(get_db)):
    contact_exists = db.execute(
        text("SELECT 1 FROM contacts WHERE id = :contact_id"), 
        {"contact_id": contact_id}
    ).scalar()

    if not contact_exists:
        raise HTTPException(status_code=404, detail="Contact request not found")

    db.execute(
        text("UPDATE contacts SET status = 'CLOSED' WHERE id = :contact_id"), 
        {"contact_id": contact_id}
    )
    db.commit()
    return {"message": "Contact request closed", "contact_id": contact_id, "status": "CLOSED"}
