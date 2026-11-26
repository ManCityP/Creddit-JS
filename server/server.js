import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

import path from "path";
import { fileURLToPath } from "url";
import Auth from "./helpers/Auth.js";
import Upload from "./helpers/upload.js";
import Post from "./models/Post.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


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

app.use((err, _req, res, next) => {
    if (err && err.name === "MulterError") {
        return res.status(400).json({ message: err.message });
    }
    if (err && err.message === "Unsupported file type") {
        return res.status(400).json({ message: err.message });
    }
    next(err);
});

await connectDB();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server running on port 5000");
});