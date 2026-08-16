from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.admin import router as admin_router
from app.routes.auth import router as auth_router
from app.routes.contact import router as contact_router
from app.routes.deals import router as deals_router
from app.routes.driver import router as driver_router
from app.routes.loader import router as loader_router

app = FastAPI(title="TruckLoad Hub API")

# 1. Allowed Origins Configuration
origins = [
    "https://truck-load-hub.onrender.com",
    "https://truck-load-hub.onrender.com/",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# 2. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Include Routers (Keep prefixes here, remove tags to avoid duplicating router-level tags)
app.include_router(auth_router, prefix="/auth")
app.include_router(admin_router, prefix="/admin")
app.include_router(contact_router, prefix="/contact")
app.include_router(deals_router, prefix="/deals")
app.include_router(driver_router, prefix="/driver")
app.include_router(loader_router, prefix="/loader")


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "TL Hub API is running"}
