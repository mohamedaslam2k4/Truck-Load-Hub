from pydantic import BaseModel, EmailStr
from typing import Optional

class LoadCreate(BaseModel):
    pickup: str
    destination: str
    loadType: str
    weight: float
    truckType: str
    pickupDate: str
    minPrice: float
    maxPrice: float
    description: Optional[str] = ""
    loaderId: int

class RegisterRequest(BaseModel):
    # User fields
    name: str
    email: EmailStr
    phone: Optional[str] = None
    city: str
    password: str
    role: str
    # Driver profile fields
    experience: Optional[int] = None
    truckNumber: Optional[str] = None
    truckType: Optional[str] = None
    capacity: Optional[float] = None
    licenseNumber: Optional[str] = None
    # Loader profile fields
    companyName: Optional[str] = None
    contactPerson: Optional[str] = None
    businessType: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
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