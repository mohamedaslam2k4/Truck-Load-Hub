from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date  # <--- Import date

class LoadCreate(BaseModel):
    pickup: str
    destination: str
    loadType: str
    weight: float
    truckType: str
    pickupDate: date  # <--- Change from str to date
    minPrice: float
    maxPrice: float
    description: Optional[str] = ""
    loaderId: intional[str] = ""
    loaderId: int

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    city: str
    password: str
    role: str
    
    # Optional Driver fields
    experience: Optional[int] = None
    truckNumber: Optional[str] = None
    truckType: Optional[str] = None
    capacity: Optional[int] = None
    licenseNumber: Optional[str] = None
    
    # Optional Loader fields
    companyName: Optional[str] = None
    contactPerson: Optional[str] = None
    businessType: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str

class DealCreate(BaseModel):
    loadId: int
    driverId: int
    dealPrice: float
