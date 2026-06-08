import { useEffect, useState } from "react";

function WebSocketNotifications() {

    const [message, setMessage] =
        useState("");

    useEffect(() => {

        const socket =
            new WebSocket(
                import.meta.env.VITE_WS_URL
            );

        socket.onopen = () => {

            console.log(
                "WebSocket connected"
            );

        };

        socket.onmessage = (
            event
        ) => {

            setMessage(
                event.data
            );

            setTimeout(() => {

                setMessage("");

            }, 5000);

        };

        socket.onerror = (
            error
        ) => {

            console.log(
                error
            );

        };

        socket.onclose = () => {

            console.log(
                "WebSocket disconnected"
            );

        };

        return () => {

            socket.close();

        };

    }, []);

    if (!message) {

        return null;

    }

    return (

        <div className="notification">

            🔔 {message}

        </div>

    );

}

export default WebSocketNotifications;