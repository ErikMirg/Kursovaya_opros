from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Header,
    BackgroundTasks
)

from sqlalchemy.orm import Session
from pydantic import BaseModel

from models import (
    Poll,
    Option,
    Vote,
    get_db
)

from auth import get_current_user
from websocket import notify_all

router = APIRouter(
    prefix="/polls",
    tags=["Polls"]
)


class PollCreate(BaseModel):
    title: str
    description: str
    options: list[str]


class VoteModel(BaseModel):
    option_id: int


@router.post("/")
def create_poll(
    poll: PollCreate,
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
            detail="Доступ запрещен"
        )

    new_poll = Poll(
        title=poll.title,
        description=poll.description,
        created_by=user.id
    )

    db.add(new_poll)
    db.commit()
    db.refresh(new_poll)

    for option_text in poll.options:

        if option_text.strip():

            option = Option(
                text=option_text,
                poll_id=new_poll.id
            )

            db.add(option)

    db.commit()

    return {
        "message": "Опрос создан успешно",
        "poll_id": new_poll.id
    }


@router.get("/")
def get_polls(
    db: Session = Depends(get_db)
):
    polls = db.query(Poll).all()

    return [
        {
            "id": poll.id,
            "title": poll.title,
            "description": poll.description,
            "is_active": poll.is_active
        }
        for poll in polls
    ]


@router.get("/{poll_id}")
def get_poll(
    poll_id: int,
    db: Session = Depends(get_db)
):
    poll = db.query(Poll).filter(
        Poll.id == poll_id
    ).first()

    if not poll:
        raise HTTPException(
            status_code=404,
            detail="Опрос не найден"
        )

    options = db.query(Option).filter(
        Option.poll_id == poll_id
    ).all()

    return {
        "id": poll.id,
        "title": poll.title,
        "description": poll.description,
        "is_active": poll.is_active,
        "options": [
            {
                "id": option.id,
                "text": option.text
            }
            for option in options
        ]
    }


@router.post("/{poll_id}/vote")
def vote(
    poll_id: int,
    vote_data: VoteModel,
    background_tasks: BackgroundTasks,
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

    poll = db.query(Poll).filter(
        Poll.id == poll_id
    ).first()

    if not poll:
        raise HTTPException(
            status_code=404,
            detail="Опрос не найден"
        )

    if not poll.is_active:
        raise HTTPException(
            status_code=400,
            detail="Голосование закрыто"
        )

    option = db.query(Option).filter(
        Option.id == vote_data.option_id,
        Option.poll_id == poll_id
    ).first()

    if not option:
        raise HTTPException(
            status_code=404,
            detail="Вариант ответа не найден"
        )

    existing_vote = db.query(Vote).filter(
        Vote.user_id == user.id,
        Vote.poll_id == poll_id
    ).first()

    if existing_vote:
        raise HTTPException(
            status_code=400,
            detail="Вы уже проголосовали"
        )

    new_vote = Vote(
        user_id=user.id,
        poll_id=poll_id,
        option_id=vote_data.option_id
    )

    db.add(new_vote)
    db.commit()

    background_tasks.add_task(
        notify_all,
        f"Новый голос в опросе «{poll.title}»"
    )

    return {
        "message": "Голос успешно учтён"
    }


@router.get("/{poll_id}/results")
def get_results(
    poll_id: int,
    db: Session = Depends(get_db)
):
    poll = db.query(Poll).filter(
        Poll.id == poll_id
    ).first()

    if not poll:
        raise HTTPException(
            status_code=404,
            detail="Опрос не найден"
        )

    options = db.query(Option).filter(
        Option.poll_id == poll_id
    ).all()

    total_votes = db.query(Vote).filter(
        Vote.poll_id == poll_id
    ).count()

    results = []

    for option in options:

        votes_count = db.query(Vote).filter(
            Vote.option_id == option.id
        ).count()

        percent = 0

        if total_votes > 0:
            percent = round(
                votes_count * 100 / total_votes,
                1
            )

        results.append(
            {
                "option": option.text,
                "votes": votes_count,
                "percent": percent
            }
        )

    return {
        "total_votes": total_votes,
        "results": results
    }


@router.put("/{poll_id}/toggle")
def toggle_poll(
    poll_id: int,
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

    if user.role not in [
        "admin",
        "moderator"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Вы уже проголосовали"
        )

    poll = db.query(Poll).filter(
        Poll.id == poll_id
    ).first()

    if not poll:
        raise HTTPException(
            status_code=404,
            detail="Опрос не найден"
        )

    poll.is_active = not poll.is_active

    db.commit()

    return {
        "is_active": poll.is_active
    }

@router.delete("/{poll_id}")
def delete_poll(
    poll_id: int,
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

    if user.role not in [
        "admin",
        "moderator"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Доступ запрещён"
        )

    poll = db.query(Poll).filter(
        Poll.id == poll_id
    ).first()

    if not poll:
        raise HTTPException(
            status_code=404,
            detail="Опрос не найден"
        )

    db.query(Vote).filter(
        Vote.poll_id == poll_id
    ).delete()

    db.query(Option).filter(
        Option.poll_id == poll_id
    ).delete()

    db.delete(poll)

    db.commit()

    return {
        "message": "Опрос удалён"
    }