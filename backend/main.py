from contextlib import asynccontextmanager
from polls import router as polls_router
from fastapi import FastAPI
from websocket import router as websocket_router
from fastapi.middleware.cors import CORSMiddleware
from admin import router as admin_router

from models import (
    create_tables,
    SessionLocal,
    User
)

from auth import (
    router as auth_router,
    hash_password
)


@asynccontextmanager
async def lifespan(app: FastAPI):

    create_tables()

    db = SessionLocal()

    try:

        admin = db.query(User).filter(
            User.username == "admin"
        ).first()

        if not admin:
            db.add(
                User(
                    username="admin",
                    email="admin@test.ru",
                    hashed_password=hash_password("admin123"),
                    role="admin"
                )
            )

        moderator = db.query(User).filter(
            User.username == "moderator"
        ).first()

        if not moderator:
            db.add(
                User(
                    username="moderator",
                    email="moderator@test.ru",
                    hashed_password=hash_password("moderator123"),
                    role="moderator"
                )
            )

        db.commit()

    finally:
        db.close()

    yield


app = FastAPI(
    title="Online Poll System",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://kursovaya-frontend.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(polls_router)
app.include_router(websocket_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {
        "message": "Backend is working"
    }