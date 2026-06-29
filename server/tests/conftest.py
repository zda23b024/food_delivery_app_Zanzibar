import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
import app.models  # noqa: F401
from app.main import app


@pytest.fixture()
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def register_user(client: TestClient, role: str, phone: str, email: str):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": f"{role.title()} User",
            "email": email,
            "phone_number": phone,
            "preferred_language": "en",
            "password": "Password123",
            "role": role,
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


def login_user(client: TestClient, phone: str):
    response = client.post(
        "/api/v1/auth/login",
        json={"phone_number": phone, "password": "Password123"},
    )
    assert response.status_code == 200, response.text
    token_data = response.json()
    return {
        "Authorization": f"Bearer {token_data['access_token']}",
    }, token_data
