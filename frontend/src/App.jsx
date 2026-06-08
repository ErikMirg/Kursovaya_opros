import { Routes, Route, Link } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Polls from "./pages/Polls";
import Profile from "./pages/Profile";
import CreatePoll from "./pages/CreatePoll";
import Poll from "./pages/Poll";
import Admin from "./pages/Admin";

import WebSocketNotifications from "./WebSocketNotifications";

function App() {


const token =
    localStorage.getItem(
        "token"
    );

const role =
    localStorage.getItem(
        "role"
    );

const username =
    localStorage.getItem(
        "username"
    );

return (

    <div className="container">

        <WebSocketNotifications />

        <div className="app-header">

            <div>

                <h1 className="app-title">
                    Система онлайн-опросов
                </h1>

            </div>

            {
                username && (

                    <div className="app-user-card">

                        <div className="user-name">
                            {username}
                        </div>

                    </div>

                )
            }

        </div>

        <nav className="app-nav">

            {
                !token && (
                    <>
                        <Link to="/">
                            Вход
                        </Link>

                        <Link to="/register">
                            Регистрация
                        </Link>
                    </>
                )
            }

            <Link to="/polls">
                Опросы
            </Link>

            {
                token && (
                    <>
                        {
                            (
                                role === "admin" ||
                                role === "moderator"
                            ) && (
                                <Link to="/create-poll">
                                    Создать опрос
                                </Link>
                            )
                        }

                        <Link to="/profile">
                            Профиль
                        </Link>

                        {
                            role === "admin" && (
                                <Link to="/admin">
                                    Админка
                                </Link>
                            )
                        }
                    </>
                )
            }

        </nav>

        <hr />

        <Routes>

            <Route
                path="/"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/polls"
                element={<Polls />}
            />

            <Route
                path="/create-poll"
                element={<CreatePoll />}
            />

            <Route
                path="/profile"
                element={<Profile />}
            />

            <Route
                path="/poll/:id"
                element={<Poll />}
            />

            <Route
                path="/admin"
                element={<Admin />}
            />

        </Routes>

    </div>

);


}

export default App;
