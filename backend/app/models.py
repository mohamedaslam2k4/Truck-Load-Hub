from sqlalchemy import DECIMAL, TIMESTAMP, Column, Date, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func
from app.database import Base

# USER
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    phone = Column(String(20))
    city = Column(String(100), nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum("DRIVER", "LOADER", "ADMIN"), nullable=False)
    status = Column(Enum("PENDING", "VERIFIED", "REJECTED"), default="PENDING")
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())

# DRIVER PROFILE
class DriverProfile(Base):
    __tablename__ = "driver_profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    experience = Column(Integer)
    truck_number = Column(String(50))
    truck_type = Column(String(50))
    capacity = Column(DECIMAL(10, 2))
    license_number = Column(String(100))

# LOADER PROFILE
class LoaderProfile(Base):
    __tablename__ = "loader_profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    company_name = Column(String(150))
    contact_person = Column(String(100))
    business_type = Column(String(100))

# LOAD
class Load(Base):
    __tablename__ = "loads"

    id = Column(Integer, primary_key=True)
    loader_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    pickup = Column(String(150), nullable=False)
    destination = Column(String(150), nullable=False)
    load_type = Column(String(100))
    weight = Column(DECIMAL(10, 2))
    truck_type = Column(String(50))
    pickup_date = Column(Date)
    min_price = Column(DECIMAL(12, 2))
    max_price = Column(DECIMAL(12, 2))
    price = Column(DECIMAL(12, 2))
    description = Column(Text)
    status = Column(Enum("AVAILABLE", "BOOKED", "COMPLETED", "CANCELLED"), default="AVAILABLE")
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())

# DEAL
class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True)
    load_id = Column(Integer, ForeignKey("loads.id", ondelete="CASCADE"), nullable=False)
    driver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    deal_price = Column(DECIMAL(12, 2), nullable=False)
    status = Column(Enum("PENDING", "ACCEPTED", "IN TRANSIT", "REJECTED", "COMPLETED"), default="PENDING")
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())

# CONTACT
class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    phone = Column(String(20))
    message = Column(Text, nullable=False)
    status = Column(Enum("PENDING", "CLOSED"), nullable=False, default="PENDING")
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())