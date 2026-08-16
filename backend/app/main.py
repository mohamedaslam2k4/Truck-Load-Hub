from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import admin, auth, contact, loader, driver, deals

app = FastAPI()

# 1. Define allowed origins explicitly
origins = [
    "https://truck-load-hub.onrender.com",  # Your production frontend
    "http://localhost:5173",               # Your local development (Vite)
    "http://127.0.0.1:5173"
]

# 2. Apply the middleware with the explicit origins list
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Changed from ["*"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# routers
app.include_router(admin.router)
app.include_router(auth.router)
app.include_router(contact.router)
app.include_router(deals.router)
app.include_router(driver.router)
app.include_router(loader.router)

@app.get("/")
def root():
    return { "message": "TL Hub API is running"}
