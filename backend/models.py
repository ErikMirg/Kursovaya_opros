from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    UniqueConstraint
)

from sqlalchemy.orm import (
    declarative_base,
    sessionmaker
)

Base = declarative_base()

engine = create_engine(
    "sqlite:///database.db",
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True, nullable=False)

    email = Column(String, unique=True, nullable=False)

    hashed_password = Column(String, nullable=False)

    role = Column(String, default="user")

    is_active = Column(Boolean, default=True)


class Poll(Base):
    __tablename__ = "polls"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    description = Column(String)

    is_active = Column(Boolean, default=True)

    created_by = Column(Integer, ForeignKey("users.id"))


class Option(Base):
    __tablename__ = "options"

    id = Column(Integer, primary_key=True, index=True)

    text = Column(String, nullable=False)

    poll_id = Column(Integer, ForeignKey("polls.id"))


class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    poll_id = Column(Integer, ForeignKey("polls.id"))

    option_id = Column(Integer, ForeignKey("options.id"))

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "poll_id",
            name="one_vote_per_poll"
        ),
    )


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def create_tables():
    Base.metadata.create_all(bind=engine)