import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./Login.css";
import { loginUser } from '../api/api';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

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

                    <div className="password-field">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <span
                            className="password-eye"
                            onClick={() => setShowPassword(!showPassword)}
                            role="button"
                            tabIndex={0}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    setShowPassword(!showPassword);
                                }
                            }}
                        >
                            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                        </span>
                    </div>
                </div>

                <button type="submit">Login</button>
            </form>

            <p>
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    );
}

export default Login;
