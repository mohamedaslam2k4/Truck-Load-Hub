from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import LoginRequest, RegisterRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])

# REGISTER

@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    
    if data.role not in ["DRIVER", "LOADER", "ADMIN"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    existing_user = db.execute(text("SELECT id FROM users WHERE email = :email"), {"email": data.email}).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        #user basic details store to db
        result = db.execute(
            text("""INSERT INTO users (name, email, phone, password, role, status, city) 
            VALUES (:name, :email, :phone, :password, :role, 'PENDING', :city)"""),
            {"name": data.name, "email": data.email, "phone": data.phone, "password": data.password, "role": data.role, "city": data.city},
        )
        user_id = result.lastrowid

         #user driver profile store to db
        if data.role == "DRIVER":
            db.execute(
                text("""INSERT INTO driver_profiles (user_id, experience, truck_number, truck_type, capacity, license_number) 
                        VALUES (:user_id, :experience, :truck_number, :truck_type, :capacity, :license_number)"""),
                {"user_id": user_id, "experience": data.experience, "truck_number": data.truckNumber, "truck_type": data.truckType, "capacity": data.capacity, "license_number": data.licenseNumber},
            )

         #user loader profile store to db
        elif data.role == "LOADER":
            db.execute(
                text("""INSERT INTO loader_profiles (user_id, company_name, contact_person, business_type) 
                VALUES (:user_id, :company_name, :contact_person, :business_type)"""),
                {"user_id": user_id, "company_name": data.companyName, "contact_person": data.contactPerson, "business_type": data.businessType},
            )

        db.commit()
        return {"message": "Registration successful", "user_id": user_id, "role": data.role, "status": "PENDING"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# LOGIN
@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.execute(
        text("SELECT id, name, email, password, role, status, city FROM users WHERE email = :email"),
        {"email": data.email},
    ).mappings().first()

    if not user or user["password"] != data.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user["status"] == "PENDING":
        raise HTTPException(status_code=403, detail="Your account is waiting for admin verification")

    if user["status"] == "REJECTED":
        raise HTTPException(status_code=403, detail="Your account has been rejected by admin")

    return {
        "message": "Login successful",
        "user": {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"], "status": user["status"], "city": user["city"]},
    }