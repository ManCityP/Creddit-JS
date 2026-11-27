import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

import path from "path";
import { fileURLToPath } from "url";
import Auth from "./helpers/Auth.js";
import Upload from "./helpers/Upload.js";
import Post from "./models/Post.js";
import Comment from "./models/Comment.js";

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

function buildCommentTree(comments) {
    const nodeMap = new Map();
    const roots = [];

    for (const c of comments) {
        const isDeleted = Boolean(c.deletedBy);
        nodeMap.set(c._id.toString(), {
            _id: c._id,
            post: c.post,
            parentComment: c.parentComment,
            author: isDeleted ? null : c.author,
            content: isDeleted ? "[deleted]" : c.content,
            score: c.score,
            editedAt: c.editedAt,
            isDeleted,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            replies: []
        });
    }

    for (const node of nodeMap.values()) {
        if (node.parentComment) {
            const parent = nodeMap.get(node.parentComment.toString());
            if (parent) {
                parent.replies.push(node);
            } else {
                roots.push(node);
            }
        } else {
            roots.push(node);
        }
    }

    function pruneDeletedLeaves(list) {
        return list
            .map((node) => ({
                ...node,
                replies: pruneDeletedLeaves(node.replies)
            }))
            .filter((node) => !node.isDeleted || node.replies.length > 0);
    }

    return pruneDeletedLeaves(roots);
}

app.get("/api/auth/me", Auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("_id username");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.json({ user });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch current user", error: err.message });
    }
});

app.get("/api/posts", async (_req, res) => {
    try {
        const posts = await Post.find({ deletedBy: null })
            .sort({ createdAt: -1 })
            .populate("author", "username");

        return res.json({ posts });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch posts", error: err.message });
    }
});

app.get("/api/posts/:postId", async (req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.postId, deletedBy: null })
            .populate("author", "username");

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        return res.json({ post });
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid post ID" });
        }
        return res.status(500).json({ message: "Failed to fetch post", error: err.message });
    }
});

app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.postId, deletedBy: null });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comments = await Comment.find({ post: req.params.postId })
            .sort({ createdAt: 1 })
            .populate("author", "username")
            .lean();

        return res.json({
            comments: buildCommentTree(comments),
            commentCount: post.commentCount
        });
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid post ID" });
        }
        return res.status(500).json({ message: "Failed to fetch comments", error: err.message });
    }
});

app.post("/api/posts/:postId/comments", Auth, async (req, res) => {
    try {
        const { content, parentComment } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Comment content is required" });
        }

        const post = await Post.findOne({ _id: req.params.postId, deletedBy: null });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        let parentId = null;
        if (parentComment) {
            const parent = await Comment.findOne({
                _id: parentComment,
                post: req.params.postId
            });
            if (!parent) {
                return res.status(404).json({ message: "Parent comment not found" });
            }
            if (parent.deletedBy) {
                return res.status(400).json({ message: "Cannot reply to a deleted comment" });
            }
            parentId = parent._id;
        }

        const comment = new Comment({
            post: post._id,
            author: req.userId,
            parentComment: parentId,
            content: content.trim()
        });

        await comment.save();
        await Post.findByIdAndUpdate(post._id, { $inc: { commentCount: 1 } });
        await comment.populate("author", "username");

        return res.status(201).json({
            message: "Comment created successfully",
            comment: {
                _id: comment._id,
                post: comment.post,
                parentComment: comment.parentComment,
                author: comment.author,
                content: comment.content,
                score: comment.score,
                editedAt: comment.editedAt,
                isDeleted: false,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                replies: []
            }
        });
    } catch (err) {
        if (err.name === "ValidationError" || err.name === "CastError") {
            return res.status(400).json({ message: err.message });
        }
        return res.status(500).json({ message: "Failed to create comment", error: err.message });
    }
});

app.patch("/api/comments/:commentId", Auth, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Comment content is required" });
        }

        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        if (comment.deletedBy) {
            return res.status(400).json({ message: "Cannot edit a deleted comment" });
        }
        if (comment.author.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: "You can only edit your own comments" });
        }

        comment.content = content.trim();
        comment.editedAt = new Date();
        await comment.save();
        await comment.populate("author", "username");

        return res.json({
            message: "Comment updated successfully",
            comment: {
                _id: comment._id,
                post: comment.post,
                parentComment: comment.parentComment,
                author: comment.author,
                content: comment.content,
                score: comment.score,
                editedAt: comment.editedAt,
                isDeleted: false,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt
            }
        });
    } catch (err) {
        if (err.name === "ValidationError" || err.name === "CastError") {
            return res.status(400).json({ message: err.message });
        }
        return res.status(500).json({ message: "Failed to update comment", error: err.message });
    }
});

app.delete("/api/comments/:commentId", Auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        if (comment.deletedBy) {
            return res.status(400).json({ message: "Comment is already deleted" });
        }
        if (comment.author.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: "You can only delete your own comments" });
        }

        const hasReplies = Boolean(
            await Comment.exists({ parentComment: comment._id })
        );

        if (hasReplies) {
            comment.deletedBy = req.userId;
            comment.content = "[deleted]";
            await comment.save();
        } else {
            const parentId = comment.parentComment;
            await Comment.deleteOne({ _id: comment._id });

            // Clean up any soft-deleted ancestors that no longer have replies
            let currentParentId = parentId;
            while (currentParentId) {
                const parent = await Comment.findById(currentParentId);
                if (!parent || !parent.deletedBy) break;
                const remainingChildren = await Comment.exists({ parentComment: parent._id });
                if (remainingChildren) break;
                currentParentId = parent.parentComment;
                await Comment.deleteOne({ _id: parent._id });
            }
        }

        await Post.findOneAndUpdate(
            { _id: comment.post, commentCount: { $gt: 0 } },
            { $inc: { commentCount: -1 } }
        );

        return res.json({
            message: "Comment deleted successfully",
            deletedId: comment._id,
            softDeleted: hasReplies
        });
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ message: "Invalid comment ID" });
        }
        return res.status(500).json({ message: "Failed to delete comment", error: err.message });
    }
});

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
