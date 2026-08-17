from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from auth import require_role
from app.models import User

router = APIRouter(tags=["Admin"])

# Apply ADMIN protection to all admin endpoints
admin_guard = Depends(require_role(["ADMIN"]))

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), current_user: User = admin_guard):
    driver_count = db.execute(text("""SELECT COUNT(*) FROM users WHERE role = 'DRIVER'""")).scalar()
    loader_count = db.execute(text("""SELECT COUNT(*) FROM users WHERE role = 'LOADER'""")).scalar()
    pending_count = db.execute(text("""SELECT COUNT(*) FROM users WHERE status = 'PENDING'""")).scalar()
    active_deals = db.execute(text("""SELECT COUNT(*) FROM deals WHERE status IN ('PENDING', 'ACCEPTED')""")).scalar()

    pending_users = db.execute(
        text("""
            SELECT id, name, email, phone, role, status, created_at
            FROM users WHERE status = 'PENDING'
            ORDER BY created_at DESC LIMIT 5
        """)
    ).mappings().all()

    return {
        "driver_count": driver_count,
        "loader_count": loader_count,
        "pending_count": pending_count,
        "active_deals": active_deals,
        "pending_users": [dict(user) for user in pending_users]
    }

@router.get("/drivers")
def get_all_drivers(db: Session = Depends(get_db), current_user: User = admin_guard):
    drivers = db.execute(
        text("""
            SELECT u.id, u.name, u.email, u.phone, u.city, u.role, u.status, u.created_at AS createdAt,
                   dp.id AS driverid, dp.experience, dp.truck_number AS truckNumber,
                   dp.truck_type AS truckType, dp.capacity, dp.license_number AS licenseNumber
            FROM users u
            LEFT JOIN driver_profiles dp ON u.id = dp.user_id
            WHERE u.role = 'DRIVER' ORDER BY u.id DESC
        """)
    ).mappings().all()
    return [dict(driver) for driver in drivers]

@router.get("/loaders")
def get_loaders(db: Session = Depends(get_db), current_user: User = admin_guard):
    loaders = db.execute(
        text("""
            SELECT u.id, u.name, u.email, u.phone, u.city, u.role, u.status, u.created_at,
                   lp.id AS loaderid, lp.company_name AS companyName, lp.contact_person AS contactPerson,
                   lp.business_type AS businessType,
                   (SELECT COUNT(*) FROM loads l WHERE l.loader_id = u.id) AS totalLoads
            FROM users u
            LEFT JOIN loader_profiles lp ON u.id = lp.user_id
            WHERE u.role = 'LOADER' ORDER BY u.created_at DESC
        """)
    ).mappings().all()
    return [dict(loader) for loader in loaders]

@router.get("/verification")
def get_pending_users(db: Session = Depends(get_db), current_user: User = admin_guard):
    users = db.execute(
        text("""
            SELECT id, name, email, phone, city, role, status, created_at
            FROM users WHERE status = 'PENDING' ORDER BY created_at DESC
        """)
    ).mappings().all()
    return [dict(user) for user in users]

@router.put("/verification/{user_id}")
def update_verification(user_id: int, status: str, db: Session = Depends(get_db), current_user: User = admin_guard):
    if status not in ["VERIFIED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    user = db.execute(text("""SELECT id FROM users WHERE id = :user_id"""), {"user_id": user_id}).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.execute(text("""UPDATE users SET status = :status WHERE id = :user_id"""), {"status": status, "user_id": user_id})
    db.commit()
    return {"message": "User status updated", "user_id": user_id, "status": status}

@router.get("/contacts")
def get_contacts(db: Session = Depends(get_db), current_user: User = admin_guard):
    contacts = db.execute(
        text("""SELECT id, name, email, phone, message, status, created_at FROM contacts WHERE status = 'PENDING' ORDER BY created_at DESC""")
    ).mappings().all()
    
    result = []
    for contact in contacts:
        c = dict(contact)
        c["createdAt"] = c["created_at"].strftime("%d-%m-%Y") if c["created_at"] else None
        c.pop("created_at", None)
        result.append(c)
    return result

@router.put("/contacts/{contact_id}/resolve")
def resolve_contact(contact_id: int, db: Session = Depends(get_db), current_user: User = admin_guard):
    contact = db.execute(text("""SELECT id FROM contacts WHERE id = :contact_id"""), {"contact_id": contact_id}).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact request not found")

    db.execute(text("""UPDATE contacts SET status = 'CLOSED' WHERE id = :contact_id"""), {"contact_id": contact_id})
    db.commit()
    return {"message": "Contact request closed", "contact_id": contact_id, "status": "CLOSED"}
