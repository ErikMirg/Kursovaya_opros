import sys
import os

sys.path.append(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root():

    response = client.get("/")

    assert response.status_code == 200


def test_register_validation():

    response = client.post(
        "/auth/register",
        json={
            "username": "",
            "email": "wrong",
            "password": "123"
        }
    )

    assert response.status_code == 422