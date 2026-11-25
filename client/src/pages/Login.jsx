import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    function resetForm() {
        setEmail("");
        setPassword("");
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            window.alert("Please fill all fields");
            return;
        }

        //todo check if existing in db

        window.alert("Registered Successfully");
        resetForm();
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