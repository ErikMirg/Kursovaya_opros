from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy import or_
from email_service import send_email
from fastapi import Header
from fastapi import BackgroundTasks

from models import User, get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])

SECRET_KEY = "super_secret_key"
ALGORITHM = "HS256"

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


class RegisterModel(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginModel(BaseModel):
    login: str
    password: str

class UpdateProfileModel(BaseModel):
    username: str
    email: EmailStr

def hash_password(password):
    return pwd_context.hash(password)


def verify_password(password, hashed):
    return pwd_context.verify(password, hashed)


def create_token(user_id):
    return jwt.encode(
        {"sub": str(user_id)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )

def get_current_user(token: str, db: Session):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = int(payload["sub"])

        user = db.query(User).filter(
            User.id == user_id
        ).first()

        return user

    except:
        raise HTTPException(
            status_code=401,
            detail="Зарегистрируйтесь"
        )

@router.post("/register")
def register(
    data: RegisterModel,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    email_exists = db.query(User).filter(
        User.email == data.email
    ).first()

    if email_exists:
        raise HTTPException(
            status_code=400,
            detail="Такая почта уже зарегистрирована"
        )

    username_exists = db.query(User).filter(
        User.username == data.username
    ).first()

    if username_exists:
        raise HTTPException(
            status_code=400,
            detail="Такое имя пользователя уже занято"
        )

    new_user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(
            data.password
        ),
        role="user"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_token(
        new_user.id
    )

    background_tasks.add_task(
        send_email,
        data.email,
        "Online Poll System",
        "Регистрация прошла успешно."
    )

    return {
        "message": "Пользователь зарегистрирован",
        "email_sent": True,
        "access_token": token,
        "role": new_user.role,
        "username": new_user.username
    }


@router.post("/login")
def login(
    data: LoginModel,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        or_(
            User.email == data.login,
            User.username == data.login
        )
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Wrong credentials"
        )

    if not verify_password(
            data.password,
            user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Wrong credentials"
        )

    token = create_token(user.id)

    return {
        "access_token": token,
        "role": user.role,
        "username": user.username
    }

@router.get("/me")
def get_profile(
    authorization: str = Header(),
    db: Session = Depends(get_db)
):
    token = authorization.replace(
        "Bearer ",
        ""
    )

    user = get_current_user(
        token,
        db
    )

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role
    }


@router.put("/me")
def update_profile(
    profile: UpdateProfileModel,
    authorization: str = Header(),
    db: Session = Depends(get_db)
):
    token = authorization.replace(
        "Bearer ",
        ""
    )

    user = get_current_user(
        token,
        db
    )

    user.username = profile.username
    user.email = profile.email

    db.commit()

    return {
        "message": "Профиль обновлён"
    }