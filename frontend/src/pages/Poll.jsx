import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";

function Poll() {

const { id } = useParams();

const [poll, setPoll] = useState(null);

const [results, setResults] = useState([]);

const [selectedOption, setSelectedOption] =
    useState(null);

const [message, setMessage] = useState("");

const [voted, setVoted] =
    useState(false);

useEffect(() => {

    loadPoll();
    loadResults();

}, [id]);

const loadPoll = async () => {

    try {

        const response =
            await axios.get(
                `${API_URL}/polls/${id}`
            );

        setPoll(
            response.data
        );

    } catch (error) {

        console.log(error);

        setMessage(
            "Опрос не найден"
        );

    }

};

const loadResults = async () => {

    try {

        const response =
            await axios.get(
                `${API_URL}/polls/${id}/results`
            );

        setResults(
            response.data.results
        );

    } catch (error) {

        console.log(error);

    }

};

const vote = async () => {

    if (!selectedOption) {

        setMessage(
            "Выберите вариант ответа"
        );

        return;

    }

    try {

        const token =
            localStorage.getItem(
                "token"
            );

        const response =
            await axios.post(
                 `${API_URL}/polls/${id}/vote`,
                {
                    option_id:
                        selectedOption
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        setMessage(
            "Ваш голос учтён"
        );

        setVoted(true);

        loadResults();

    } catch (error) {

        if (
            error.response?.data?.detail
        ) {

            setMessage(
                error.response.data.detail
            );

        } else {

            setMessage(
                "Ошибка голосования"
            );

        }

    }

};

if (!poll) {

    return (
        <div>

            <Link
                to="/polls"
                className="back-link"
            >
                ← Назад к опросам
            </Link>

            <h2>
                Загрузка...
            </h2>

        </div>
    );

}

return (
    <div>

        <Link
            to="/polls"
            className="back-link"
        >
            ← Назад к опросам
        </Link>

        <div className="card">

            <h2>
                📊 {poll.title}
            </h2>

            <p>
                {poll.description}
            </p>

            <p>

                {
                    poll.is_active
                        ? "🟢 Голосование открыто"
                        : "🔴 Голосование закрыто"
                }

            </p>

            <hr />

            <h3>
                Выберите вариант ответа
            </h3>

            {
                poll.options?.map(
                    (option) => (

                        <div
                            key={option.id}
                            className={
                                selectedOption === option.id
                                    ? "option-card selected"
                                    : "option-card"
                            }
                            onClick={() =>
                                setSelectedOption(
                                    option.id
                                )
                            }
                        >

                            <input
                                type="radio"
                                checked={
                                    selectedOption === option.id
                                }
                                readOnly
                            />

                            <span>
                                {option.text}
                            </span>

                        </div>

                    )
                )
            }

            <br />

            <button
                onClick={vote}
                disabled={
                    voted ||
                    !poll.is_active
                }
            >
                Проголосовать
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

        <div
            className="card"
            style={{
                marginTop: "20px"
            }}
        >

            <h3>
                📈 Результаты
            </h3>

            {
                results.length === 0 && (

                    <p>
                        Пока нет голосов
                    </p>

                )
            }

            {
                results.map(
                    (
                        result,
                        index
                    ) => (

                        <div
                            key={index}
                            className="result-card"
                        >

                            <div
                                className="result-header"
                            >

                                <span>
                                    {result.option}
                                </span>

                                <strong>

                                    {result.votes}
                                    {" "}
                                    голосов

                                </strong>

                            </div>

                            <div
                                className="progress"
                            >

                                <div
                                    className="progress-fill"
                                    style={{
                                        width:
                                            `${result.percent}%`
                                    }}
                                />

                            </div>

                            <small>

                                {result.percent}
                                %

                            </small>

                        </div>

                    )
                )
            }

        </div>

    </div>
);

}

export default Poll;
