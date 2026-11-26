import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import communityRoutes from "./routes/communityRoutes.js";

import path from "path";
import { fileURLToPath } from "url";
import Auth from "./helpers/Auth.js";
import Upload from "./helpers/upload.js";
import Post from "./models/Post.js";
import Session from "./models/Session.js";
import jwt from "jsonwebtoken";


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((err, _req, res, next) => {
    if (err && err.name === "MulterError") {
        return res.status(400).json({ message: err.message });
    }
    if (err && err.message === "Unsupported file type") {
        return res.status(400).json({ message: err.message });
    }
    next(err);
});

function resolveMediaType(mimeType = "") {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.startsWith("application/") || mimeType.startsWith("text/")) {
        return "file";
    }
    return "other";
}


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

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+passwordHash");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Create a new session with a 60-minute inactivity timeout.
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        const session = await Session.create({
            userId: user._id,
            lastActivityAt: new Date(),
            expiresAt
        });

        // Generate a token linked to this specific session.
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                sessionId: session._id.toString()
            },
            process.env.JWT_SECRET
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
               id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
});



app.post("/api/auth/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const cleanUsername = username.trim();
        const cleanEmail = email.trim().toLowerCase();

        // Check if username or email already exists
        const existingUser = await User.findOne({
            $or: [
                { username: cleanUsername },
                { email: cleanEmail }
            ]
        });

        if (existingUser) {
            if (existingUser.username === cleanUsername) {
                return res.status(409).json({
                    success: false,
                    message: "Username already exists"
                });
            }

            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create the new user
        const user = await User.create({
            username: cleanUsername,
            email: cleanEmail,
            passwordHash
        });

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        // Handle duplicate entries
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];

            return res.status(409).json({
                success: false,
                message: `${field} already exists`
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error during registration"
        });
    }
});




app.post("/api/auth/logout", Auth, async (req, res) => {
    try {
        await Session.findByIdAndDelete(req.sessionId);

        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });

    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error during logout"
        });
    }
});



app.post("/api/post/create", Auth, Upload.array("media", 20), async (req, res) => {
    try {
        const { title, content, community } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Title is required" });
        }

        const media = (req.files || []).map((file) => ({
            url: `/uploads/${file.filename}`,
            type: resolveMediaType(file.mimetype),
            mimeType: file.mimetype
        }));

        const post = new Post({
            title: title.trim(),
            content: content ? content.trim() : "",
            author: req.userId,
            community: community || null,
            media
        });

        await post.save();
        await post.populate("author", "username");
        if (post.community) {
            await post.populate("community", "name");
        }

        return res.status(201).json({
            message: "Post created successfully",
            post,
        });
    } catch (err) {
        if (err.name === "ValidationError" || err.name === "CastError") {
            return res.status(400).json({ message: err.message });
        }
        return res
            .status(500)
            .json({ message: "Failed to create post", error: err.message });
    }
})

await connectDB();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server running on port 5000");
});
