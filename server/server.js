import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Creddit Backend is running");
});

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Hello from Creddit"
    });
});

app.get("/api/test/create-user", async (req, res) => {
    try {
        const user = await User.create({
            username: "TestUser",
            email: "test@example.com",
            passwordHash: await bcrypt.hash("Test1234", 12),
            bio: "This is a test account"
        });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            userId: user._id
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


await connectDB();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server running on port 5000");
});