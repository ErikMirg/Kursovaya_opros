import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";

function Polls() {

    const [polls, setPolls] = useState([]);
    const role =
    localStorage.getItem(
        "role"
    );

    const [message, setMessage] =
        useState("");

    useEffect(() => {

        loadPolls();

    }, []);

    const loadPolls = async () => {

        try {

            const response =
                await axios.get(
                    `${API_URL}/polls/`
                );

            setPolls(
                response.data
            );

        } catch (error) {

            console.log(error);

        }

    };

    const deletePoll = async (
        pollId
    ) => {

        const token =
            localStorage.getItem(
                "token"
            );

        try {

            await axios.delete(
                `${API_URL}/polls/${pollId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setMessage(
                "Опрос удалён"
            );

            loadPolls();

        } catch (error) {

            setMessage(
                error.response?.data?.detail
                ||
                "Ошибка удаления"
            );

        }

    };

    const togglePoll = async (
        pollId
    ) => {

        const token =
            localStorage.getItem(
                "token"
            );

        try {

            await axios.put(
                `${API_URL}/polls/${pollId}/toggle`,
                {},
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            loadPolls();

        } catch (error) {

            setMessage(
                error.response?.data?.detail
                ||
                "Ошибка изменения статуса"
            );

        }

    };

    return (

        <div>

            <h2 className="page-title">
                Опросы
            </h2>

            {
                message && (

                    <p
                        className="form-message"
                    >
                        {message}
                    </p>

                )
            }

            {
                polls.map(
                    (poll) => (

                        <div
                            key={poll.id}
                            className="poll-card"
                        >

                            <h3>
                                {poll.title}
                            </h3>

                            <p>
                                {poll.description}
                            </p>

                            <p
                                className="poll-status"
                            >

                                {
                                    poll.is_active
                                        ? "🟢 Активен"
                                        : "🔴 Закрыт"
                                }

                            </p>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    flexWrap: "wrap",
                                    marginTop: "15px"
                                }}
                            >

                                <Link
                                    to={`/poll/${poll.id}`}
                                    style={{
                                        flex: 1
                                    }}
                                >

                                    <button>
                                        Открыть
                                    </button>

                                </Link>

                                {
                                    (
                                        role === "admin" ||
                                        role === "moderator"
                                    ) && (
                                        <>
                                            <button
                                                style={{
                                                    flex: 1
                                                }}
                                                onClick={() =>
                                                    togglePoll(
                                                        poll.id
                                                    )
                                                }
                                            >
                                                {
                                                    poll.is_active
                                                        ? "Закрыть"
                                                        : "Открыть"
                                                }
                                            </button>

                                            <button
                                                style={{
                                                    flex: 1,
                                                    background: "#dfe6d5#bfc9bd"
                                                }}
                                                onClick={() =>
                                                    deletePoll(
                                                        poll.id
                                                    )
                                                }
                                            >
                                                Удалить
                                            </button>
                                        </>
                                    )
                                }

                            </div>

                        </div>

                    )
                )
            }

        </div>

    );
}

export default Polls;