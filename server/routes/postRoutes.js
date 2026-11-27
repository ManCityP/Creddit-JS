import express from "express";
import Upload from "../helpers/Upload.js";
import Post from "../models/Post.js";
import PostVote from "../models/PostVote.js";
import Auth from "../helpers/Auth.js";
import jwt from "jsonwebtoken";

const router = express.Router();

function resolveMediaType(mimeType = "") {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.startsWith("application/") || mimeType.startsWith("text/")) {
        return "file";
    }
    return "other";
}

function getOptionalUserId(req) {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.slice(7).trim();
    if (!token || !process.env.JWT_SECRET) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded?.userId || null;
    } catch {
        return null;
    }
}

// Create a Post
router.post("/create", Auth, Upload.array("media", 20), async (req, res) => {
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
});

// Upvote/Downvote Post
router.post("/:id/vote", Auth, async (req, res) => {
    try {
        const { id } = req.params;
        const rawValue = req.body?.value;
        const value = Number(rawValue);

        if (![1, -1, 0].includes(value)) {
            return res.status(400).json({ message: "Vote value must be 1, -1, or 0." });
        }

        const post = await Post.findById(id);
        if (!post || post.deletedBy) {
            return res.status(404).json({ message: "Post not found." });
        }

        const existingVote = await PostVote.findOne({ post: id, user: req.userId });
        const prevValue = existingVote ? existingVote.value : 0;

        let nextValue = value;
        if (value === 0 || prevValue === value) {
            // Removing vote or toggling off the same vote
            nextValue = 0;
            if (existingVote) {
                await PostVote.deleteOne({ _id: existingVote._id });
            }
        } else if (existingVote) {
            existingVote.value = value;
            await existingVote.save();
        } else {
            await PostVote.create({
                post: id,
                user: req.userId,
                value,
            });
        }

        const delta = nextValue - prevValue;
        const updatedPost = await Post.findByIdAndUpdate(
            id,
            { $inc: { score: delta } },
            { new: true }
        );

        return res.status(200).json({
            postId: id,
            score: updatedPost.score,
            userVote: nextValue,
        });
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid post ID." });
        }
        if (err.code === 11000) {
            return res.status(409).json({ message: "Duplicate vote conflict. Please retry." });
        }
        console.error("Error voting on post:", err);
        return res.status(500).json({ message: "Failed to record vote." });
    }
});

// Get latest posts (defaults to 10)
router.get("/latest", async (req, res) => {
    try {
        const parsedLimit = Number.parseInt(req.query.limit, 10);
        const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10;

        const docs = await Post.find({ deletedBy: null }).sort({ createdAt: -1 }).limit(limit).populate("author", "username").populate("community", "name");

        const userId = getOptionalUserId(req);
        let voteMap = new Map();

        if (userId && docs.length > 0) {
            const postIds = docs.map((p) => p._id);
            const votes = await PostVote.find({user: userId, post: { $in: postIds }}).select("post value");

            voteMap = new Map(votes.map((v) => [String(v.post), v.value]));
        }

        const posts = docs.map((doc) => {
            const obj = doc.toObject();
            obj.userVote = voteMap.get(String(doc._id)) || 0;
            return obj;
        });

        return res.status(200).json({ posts });
    } catch (err) {
        console.error("Error fetching posts:", err);
        return res.status(500).json({ message: "Failed to fetch posts." });
    }
});

export default router;
