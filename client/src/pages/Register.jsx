import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./Register.css";
import { registerUser } from "../api/api";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{8,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    function resetForm() {
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            window.alert("Please fill all fields");
            return;
        }

        if (!USERNAME_REGEX.test(username.trim())) {
            window.alert("Username must be 3-20 characters and contain only letters, numbers or underscores");
            return;
        }

        if (!EMAIL_REGEX.test(email.trim())) {
            window.alert("Invalid email address");
            return;
        }

        if (!PASSWORD_REGEX.test(password.trim())) {
            window.alert("Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number");
            return;
        }

        if (password.trim() !== confirmPassword.trim()) {
            window.alert("Passwords do not match");
            return;
        }

        try {
            const data = await registerUser(
                username.trim(),
                email.trim().toLowerCase(),
                password
            );

            window.alert(data.message);

            resetForm();
            navigate("/login");

        } catch (error) {
            window.alert(error.message);
        }

        window.alert("Registered Successfully");
        resetForm();
    }

    return (
        <div className="register-container">
            <h1>Create an Account</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

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
                        >
                            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                        </span>
                    </div>
                </div>

                <div>
                    <label>Confirm Password</label>
                    <div className="password-field">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <span
                            className="password-eye"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            role="button"
                            tabIndex={0}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                            {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                        </span>
                    </div>
                </div>

                <button type="submit">Register</button>
            </form>

            <p>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}

export default Register;
