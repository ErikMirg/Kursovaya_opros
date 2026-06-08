import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";

function CreatePoll() {

    const [title, setTitle] = useState("");
    const [description, setDescription] =
        useState("");

    const [options, setOptions] = useState([
        "",
        ""
    ]);

    const [message, setMessage] = useState("");
    useEffect(() => {

    const role =
        localStorage.getItem(
            "role"
        );

    if (
        role !== "admin" &&
        role !== "moderator"
    ) {

        window.location.href =
            "/polls";
    }

}, []);

    const addOption = () => {

        setOptions([
            ...options,
            ""
        ]);

    };

    const updateOption = (
        index,
        value
    ) => {

        const updated = [...options];

        updated[index] = value;

        setOptions(updated);

    };

    const createPoll = async () => {

        try {

            const token =
                localStorage.getItem("token");

            const response = await axios.post(
                `${API_URL}/polls/`,
                {
                    title,
                    description,
                    options: options.filter(
                        option =>
                            option.trim() !== ""
                    )
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setMessage(
                "✅ Опрос успешно создан"
            );

            console.log(response.data);

            setTitle("");
            setDescription("");

            setOptions([
                "",
                ""
            ]);

        } catch (error) {

            console.log(error);

            if (
                error.response?.status === 403
            ) {

                setMessage(
                    "❌ Недостаточно прав"
                );

            } else {

                setMessage(
                    "❌ Ошибка создания опроса"
                );

            }

        }

    };

    return (
        <div>

            <h2 className="page-title">
                📊 Создание опроса
            </h2>

            <div className="form-card">

                <div className="form-group">

                    <label>
                        Название опроса
                    </label>

                    <input
                        value={title}
                        onChange={(e) =>
                            setTitle(
                                e.target.value
                            )
                        }
                    />

                </div>

                <div className="form-group">

                    <label>
                        Описание
                    </label>

                    <input
                        value={description}
                        onChange={(e) =>
                            setDescription(
                                e.target.value
                            )
                        }
                    />

                </div>

                {
                    options.map(
                        (
                            option,
                            index
                        ) => (

                            <div
                                className="form-group"
                                key={index}
                            >

                                <label>
                                    Вариант {index + 1}
                                </label>

                                <input
                                    value={option}
                                    onChange={(e) =>
                                        updateOption(
                                            index,
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                        )
                    )
                }

                <button
                    onClick={addOption}
                >
                    ➕ Добавить вариант
                </button>

                <br />
                <br />

                <button
                    onClick={createPoll}
                >
                    Создать опрос
                </button>

                {
                    message && (
                        <p
                            className="form-message"
                        >
                            {message}
                        </p>
                    )
                }

            </div>

        </div>
    );
}

export default CreatePoll;