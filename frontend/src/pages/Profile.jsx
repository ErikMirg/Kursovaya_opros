import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

function Profile() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/");
            return;
        }

        loadProfile();

    }, [navigate]);

    const loadProfile = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${API_URL}/auth/me`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setUser(response.data);

        } catch (error) {

            console.log(error);

            setMessage("Необходимо войти в систему");
        }
    };

    const logout = () => {

        localStorage.clear();

        window.location.href = "/";
    };

    if (message) {
        return (
            <div>
                <h2 className="page-title">Профиль</h2>
                <p className="form-message error">{message}</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div>
                <h2 className="loading">Загрузка...</h2>
            </div>
        );
    }

    return (
        <div>

            <h2 className="page-title">
                Мой профиль
            </h2>

            <div className="profile-card">

                <div className="profile-row">
                    <span>ID</span>
                    <span>{user.id}</span>
                </div>

                <div className="profile-row">
                    <span>Имя пользователя</span>
                    <span>{user.username}</span>
                </div>

                <div className="profile-row">
                    <span>Email</span>
                    <span>{user.email}</span>
                </div>

                <div className="profile-row">
                    <span>Роль</span>
                    <span
                        className={
                            user.role === "admin"
                                ? "role-admin"
                                : user.role === "moderator"
                                    ? "role-moderator"
                                    : "role-user"
                        }
                    >
                        {user.role}
                    </span>
                </div>

                <div style={{ marginTop: "22px" }}>
                    <button onClick={logout}>
                        Выход
                    </button>
                </div>

            </div>

        </div>
    );
}

export default Profile;