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


def test_get_polls():

    response = client.get(
        "/polls/"
    )

    assert response.status_code == 200


def test_poll_not_found():

    response = client.get(
        "/polls/999999"
    )

    assert response.status_code == 404