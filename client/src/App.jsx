import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function App() {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();

    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (mode === "register") {
      if (!trimmedUsername) {
        setError("Username is required.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "register") {
        await axios.post(`${API_URL}/register`, {
          username: trimmedUsername,
          email: trimmedEmail,
          password,
        });

        const loginRes = await axios.post(`${API_URL}/login`, {
          email: trimmedEmail,
          password,
        });

        localStorage.setItem("token", loginRes.data.token);
        localStorage.setItem("user", JSON.stringify(loginRes.data.user));
        setUser(loginRes.data.user);
        setMessage("Account created and logged in!");
      } else {
        const res = await axios.post(`${API_URL}/login`, {
          email: trimmedEmail,
          password,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
        setMessage("Logged in successfully!");
      }

      setPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMessage("Logged out.");
    setError("");
  };

  return (
      <div style={{ maxWidth: "420px", margin: "40px auto", fontFamily: "sans-serif" }}>
        <h1>Reddit Clone</h1>

        {message && <p style={{ color: "green" }}>{message}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {user ? (
            <div>
              <p>
                Signed in as <strong>{user.username}</strong> ({user.email})
              </p>
              <button onClick={handleLogout}>Log Out</button>
            </div>
        ) : (
            <div>
              <div style={{ marginBottom: "16px" }}>
                <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError("");
                      setMessage("");
                    }}
                    disabled={mode === "login"}
                >
                  Login
                </button>
                <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setError("");
                      setMessage("");
                    }}
                    disabled={mode === "register"}
                    style={{ marginLeft: "8px" }}
                >
                  Register
                </button>
              </div>

              <form
                  onSubmit={handleSubmit}
                  style={{ display: "flex", flexDirection: "column", gap: "10px" }}
              >
                {mode === "register" && (
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                )}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder={
                      mode === "register" ? "Password (min 8 characters)" : "Password"
                    }
                    minLength={mode === "register" ? 8 : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit" disabled={loading}>
                  {loading
                      ? "Please wait..."
                      : mode === "register"
                          ? "Create Account"
                          : "Log In"}
                </button>
              </form>
            </div>
        )}
      </div>
  );
}