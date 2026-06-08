import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

function Admin() {

    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {

        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "admin") {
            navigate("/polls");
            return;
        }

        loadStats();
        loadUsers();

    }, [navigate]);

    const getHeaders = () => {

        const token = localStorage.getItem("token");

        return {
            Authorization: `Bearer ${token}`
        };
    };

    const loadStats = async () => {

        try {

            const response = await axios.get(
                `${API_URL}/admin/stats`,
                {
                    headers: getHeaders()
                }
            );

            setStats(response.data);

        } catch (error) {

            console.log(error);
        }
    };

    const loadUsers = async () => {

        try {

            const response = await axios.get(
                `${API_URL}/admin/users`,
                {
                    headers: getHeaders()
                }
            );

            setUsers(response.data);

        } catch (error) {

            console.log(error);
        }
    };

    const changeRole = async (userId, role) => {

        try {

            await axios.put(
                `${API_URL}/admin/users/${userId}/role?role=${role}`,
                {},
                {
                    headers: getHeaders()
                }
            );

            setMessage("Роль изменена");
            loadUsers();

        } catch (error) {

            setMessage(
                error.response?.data?.detail ||
                "Ошибка изменения роли"
            );
        }
    };

    const deleteUser = async (userId, username) => {

        if (!window.confirm(`Удалить пользователя ${username}?`)) {
            return;
        }

        try {

            await axios.delete(
                `${API_URL}/admin/users/${userId}`,
                {
                    headers: getHeaders()
                }
            );

            setMessage("Пользователь удалён");
            loadUsers();
            loadStats();

        } catch (error) {

            setMessage(
                error.response?.data?.detail ||
                "Ошибка удаления пользователя"
            );
        }
    };

    return (
        <div>

            <h2 className="page-title">
                ⚙️ Админ-панель
            </h2>

            {
                stats && (
                    <div className="card">
                        <h3>Статистика</h3>
                        <p>Пользователей: {stats.users}</p>
                        <p>Опросов: {stats.polls}</p>
                        <p>Голосов: {stats.votes}</p>
                    </div>
                )
            }

            <div className="card">

                <h3>
                    Пользователи
                </h3>

                {
                    users.map((user) => (
                        <div
                            key={user.id}
                            className="profile-row"
                        >

                            <div>
                                <strong>{user.username}</strong>
                                <br />
                                {user.email}
                            </div>

                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                <select
                                    value={user.role}
                                    onChange={(e) =>
                                        changeRole(
                                            user.id,
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="user">user</option>
                                    <option value="moderator">moderator</option>
                                    <option value="admin">admin</option>
                                </select>

                                <button
                                    style={{
                                        width: "auto",
                                        padding: "10px 14px",
                                        background: "#dc2626"
                                    }}
                                    onClick={() =>
                                        deleteUser(
                                            user.id,
                                            user.username
                                        )
                                    }
                                    disabled={user.role === "admin" && user.username === localStorage.getItem("username")}
                                >
                                    Удалить
                                </button>
                            </div>

                        </div>
                    ))
                }

            </div>

            {
                message && (
                    <p className="form-message">
                        {message}
                    </p>
                )
            }

        </div>
    );
}

export default Admin;