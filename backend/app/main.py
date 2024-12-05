from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.auth import auth_router, admin_router

app = FastAPI(
    title="UHFC Fitness",
    description=f"ap1/v1/openapi.json",
    version="3.0.0",
)

origins = [
    origin.strip() for origin in settings.CLIENT_ORIGIN.split(",")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router.router, tags=[
                   'Authentication'], prefix=f"/api/v1/auth")
app.include_router(admin_router.router, tags=[
                   'Admin'], prefix=f"/api/v1/admin")


@app.get("/health")
async def health_check():
    return {"status": "I'm Enjoy Great Health WBU?"}

