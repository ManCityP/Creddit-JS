import { useState } from "react";
import { Link, useNavigate} from "react-router-dom";
import "./Login.css";
import {loginUser} from '../api/api';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate= useNavigate()


    function resetForm() {
        setEmail("");
        setPassword("");
    }

    async function handleSubmit(e) {
        try {
            e.preventDefault();

            if (!email.trim() || !password.trim()) {
                window.alert("Please fill all fields");
                return;
            }
            const data = await loginUser(email, password);

            localStorage.setItem("token", data.token);

            window.alert("Login successful! Welcome " + data.user.username);

            resetForm();
            navigate("/");
        } catch (error) {
            window.alert(error.message);
        }

    }

    return (
        <div className="login-container">
            <h1>Log in to Creddit</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button type="submit">Login</button>
            </form>

            <p>
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    )
}

export default Login;