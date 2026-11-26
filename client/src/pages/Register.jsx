import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    const navigate = useNavigate()

    function resetForm() {
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
    }

    async function handleSubmit(e) { //todo check non-existing in db already
        e.preventDefault();

        if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            window.alert("Please fill all fields");
            return;
        }

        if(!USERNAME_REGEX.test(username.trim())) {
            window.alert("Username must be 3-20 characters and contain only letters, numbers or underscores");
            return;
        }

        if(!EMAIL_REGEX.test(email.trim())) {
            window.alert("Invalid email address");
            return;
        }

        if(!PASSWORD_REGEX.test(password.trim())) {
            window.alert("Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number");
            return;
        }

        if(password.trim() !== confirmPassword.trim()) {
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
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div>
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
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