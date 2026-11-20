const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (typeof password !== "string" || password.length < 8) {
            return res
                .status(400)
                .json({ message: "Password must be at least 8 characters long" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const trimmedUsername = username.trim();

        const existingUser = await User.findOne({
            $or: [{ email: normalizedEmail }, { username: trimmedUsername }],
        });
        if (existingUser) {
            return res
                .status(409)
                .json({ message: "Username or email already exists" });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({
            username: trimmedUsername,
            email: normalizedEmail,
            passwordHash,
        });

        res.status(201).json({
            message: "User registered successfully",
            user: { id: user._id, username: user.username, email: user.email },
        });
    } catch (err) {
        if (err.name === "ValidationError") {
            const firstError =
                Object.values(err.errors)[0]?.message || "Invalid input data";
            return res.status(400).json({ message: firstError });
        }
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// Login an existing user
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                bio: user.bio,
            },
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

module.exports = router;