from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import admin, auth, contact, loader, driver, deals

app = FastAPI()


# cors (cross origin resorce sharing)=>to allow origins and  prevent error
app.add_middleware(
    CORSMiddleware,
    allow_origins=[ "http://localhost:5173","http://127.0.0.1:5173",],
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

# root api
@app.get("/")
def root():
    return { "message": "TL Hub API is running"}