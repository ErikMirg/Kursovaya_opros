import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";

function Register() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    const register = async () => {

        try {

            const response = await axios.post(
                `${API_URL}/auth/register`,
                {
                    username,
                    email,
                    password
                }
            );

            localStorage.setItem(
                "token",
                response.data.access_token
            );

            localStorage.setItem(
                "role",
                response.data.role
            );

            localStorage.setItem(
                "username",
                response.data.username
            );

            setIsError(false);

            setMessage(
                response.data.email_sent
                    ? "Регистрация прошла успешно. Вы вошли в систему."
                    : "Регистрация прошла успешно. Аккаунт создан."
            );

            setTimeout(() => {

                window.location.href =
                "/profile";

            }, 1000);

        } catch (error) {

            setIsError(true);

            setMessage(
                error.response?.data?.detail ||
                "Ошибка регистрации"
            );
        }
    };

    return (
        <div>

            <h2 className="page-title">
                Регистрация
            </h2>

            <div className="form-card">

                <div className="form-group">

                    <label>
                        Имя пользователя
                    </label>

                    <input
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                    />

                </div>

                <div className="form-group">

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />

                </div>

                <div className="form-group">

                    <label>
                        Пароль
                    </label>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                    />

                </div>

                <button onClick={register}>
                    Зарегистрироваться
                </button>

                {
                    message && (
                        <p
                            className={
                                isError
                                    ? "form-message error"
                                    : "form-message success"
                            }
                        >
                            {message}
                        </p>
                    )
                }

            </div>

        </div>
    );
}

export default Register;