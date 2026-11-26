import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import communityRoutes from "./routes/communityRoutes.js";

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
            username: "FuckingMohamedAshraf",
            email: "FuckingMohamedAshraf@gmail.com",
            passwordHash: await bcrypt.hash("FuckingMohamedAshraf", 233),
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

app.use("/api/communities", communityRoutes);



app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check that all fields are provided(no need for it as it was handled in frontend "login.jsx")
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });
        }

        // Find the user using their email
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+passwordHash");

        // Check if that user email even exists or not
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // if email found Compare the entered password with the stored hash
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.passwordHash
        );

        // Check if the password is incorrect
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Login token: the browser sends it back with every request,  so the server knows who is logged in (see middleware/auth.js)
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // if password is correct then Login successful
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) { // catch if the server itself fails or raise an error when trying to login
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
});


await connectDB();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server running on port 5000");
});