from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

connections = []


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    connections.append(websocket)

    try:
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        connections.remove(websocket)


async def notify_all(message: str):
    for connection in connections:
        try:
            await connection.send_text(message)
        except:
            pass