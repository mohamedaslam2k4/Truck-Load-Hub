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

# 3. Include Routers
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])
app.include_router(contact_router, prefix="/contact", tags=["Contact"])
app.include_router(deals_router, prefix="/deals", tags=["Deals"])
app.include_router(driver_router, prefix="/driver", tags=["Driver"])
app.include_router(loader_router, prefix="/loader", tags=["Loader"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "TL Hub API is running"}
