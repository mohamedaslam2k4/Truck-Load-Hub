from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Change your imports to look like this (explicit files):
from app.routes.admin import router as admin_router
from app.routes.auth import router as auth_router
from app.routes.contact import router as contact_router
from app.routes.loader import router as loader_router
from app.routes.driver import router as driver_router
from app.routes.deals import router as deals_router

app = FastAPI()

# 1. CORS Configuration (Keep the exact production URL)
origins = [
    "https://onrender.com",  # Production frontend URL
    "http://localhost:5173",                # Local testing
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Update the router references to use the explicitly renamed variables
app.include_router(auth_router)    # Placing auth at the top avoids route conflicts
app.include_router(admin_router)
app.include_router(contact_router)
app.include_router(deals_router)
app.include_router(driver_router)
app.include_router(loader_router)

@app.get("/")
def root():
    return {"message": "TL Hub API is running"}
