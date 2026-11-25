import { useState } from "react";
import "./Register.css";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{8,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");


    function resetForm() {
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
    }

    function handleSubmit(e) { //todo check non-existing in db already
        e.preventDefault();

        if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            window.alert("Please fill all fields");
            return;
        }

        if(!USERNAME_REGEX.test(username.trim())) {
            window.alert("Invalid username");
            return;
        }

        if(!EMAIL_REGEX.test(email.trim())) {
            window.alert("Invalid email address");
            return;
        }

        if(!PASSWORD_REGEX.test(password.trim())) {
            window.alert("Invalid password");
            return;
        }

        if(password.trim() !== confirmPassword.trim()) {
            window.alert("Passwords do not match");
            return;
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
        </div>
    )
}

export default Register;