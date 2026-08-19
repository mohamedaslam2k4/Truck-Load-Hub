from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import ContactRequest

router = APIRouter(tags=["Contact"])
@router.post("")

def create_contact(request: ContactRequest, db: Session = Depends(get_db)):
    db.execute(
        text("INSERT INTO contacts (name, email, phone, message) VALUES (:name, :email, :phone, :message)"),
        {
            "name": request.name,
            "email": request.email,
            "phone": request.phone,
            "message": request.message,
        },
    )
    db.commit()
    return {"message": "Contact request submitted successfully"}

@router.get("")

def get_contacts(db: Session = Depends(get_db)):
    contacts = db.execute(
        text("SELECT id, name, email, phone, message, created_at FROM contacts ORDER BY created_at DESC")
    ).mappings().all()

    result = []
    for contact in contacts:
        contact_data = dict(contact)
        contact_data["status"] = "OPEN"
        contact_data["createdAt"] = contact_data["created_at"].strftime("%Y-%m-%d") if contact_data["created_at"] else None
        contact_data["subject"] = "Contact Request"
        contact_data.pop("created_at", None)
        result.append(contact_data)

    return result
