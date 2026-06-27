import app.models  # noqa: F401
from app.core.database import Base, engine


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    create_tables()
    print("Database tables created.")
