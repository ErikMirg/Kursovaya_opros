from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Header
)

from sqlalchemy.orm import Session

from models import (
    User,
    Poll,
    Vote,
    get_db
)

from auth import get_current_user

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


def get_admin_user(
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

    if user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Доступ запрещён"
        )

    return user


@router.get("/stats")
def get_stats(
    admin=Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    return {
        "users": db.query(User).count(),
        "polls": db.query(Poll).count(),
        "votes": db.query(Vote).count()
    }


@router.get("/users")
def get_users(
    admin=Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()

    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active
        }
        for u in users
    ]


@router.put("/users/{user_id}/role")
def change_role(
    user_id: int,
    role: str,
    admin=Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    if role not in ["user", "moderator", "admin"]:
        raise HTTPException(
            status_code=400,
            detail="Неверная роль"
        )

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Пользователь не найден"
        )

    user.role = role
    db.commit()

    return {
        "message": "Роль обновлена"
    }


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    admin=Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    if admin.id == user_id:
        raise HTTPException(
            status_code=400,
            detail="Нельзя удалить самого себя"
        )

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Пользователь не найден"
        )

    if user.role == "admin":
        admins_count = db.query(User).filter(
            User.role == "admin"
        ).count()

        if admins_count <= 1:
            raise HTTPException(
                status_code=400,
                detail="Нельзя удалить последнего администратора"
            )

    db.query(Vote).filter(
        Vote.user_id == user_id
    ).delete()

    db.delete(user)
    db.commit()

    return {
        "message": "Пользователь удалён"
    }