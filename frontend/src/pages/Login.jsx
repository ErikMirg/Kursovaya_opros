import { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

function Login() {

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const loginUser = async () => {

        console.log("API_URL =", API_URL);

        try {

            const response = await axios.post(
                `${API_URL}/auth/login`,
                {
                    login,
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

            setMessage(
                "✅ Вход выполнен успешно"
            );

            setTimeout(() => {

                window.location.href =
                    "/polls";

            }, 500);

        } catch {

            setMessage(
                "❌ Неверный логин или пароль"
            );

        }

    };

    return (
        <div>

            <h2 className="page-title">
                🔐 Вход в систему
            </h2>

            <div className="form-card">

                <div className="form-group">

                    <label>
                        Логин или Email
                    </label>

                    <input
                        value={login}
                        onChange={(e) =>
                            setLogin(
                                e.target.value
                            )
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
                            setPassword(
                                e.target.value
                            )
                        }
                    />

                </div>

                <button
                    onClick={loginUser}
                >
                    Войти
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

export default Login;