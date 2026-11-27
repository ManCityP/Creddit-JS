import { useEffect, useState } from "react";
import {
    createComment,
    deleteComment,
    getComments,
    getCurrentUser,
    getPosts,
    updateComment
} from "../api/api";

function CommentRow({ comment, currentUserId, onReply, onEdit, onDelete, depth = 0 }) {
    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content);

    const isOwner = !comment.isDeleted && currentUserId && comment.author?._id === currentUserId;

    return (
        <div
            style={{
                marginLeft: depth * 20,
                padding: "10px 12px",
                marginTop: 8,
                borderLeft: "2px solid var(--border)",
                background: "var(--surface)",
                borderRadius: 8
            }}
        >
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>
                <strong>{comment.isDeleted ? "[deleted]" : `u/${comment.author?.username || "unknown"}`}</strong>
                {comment.editedAt && !comment.isDeleted && " (edited)"}
            </div>

            {editing ? (
                <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                    <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        style={{
                            flex: 1,
                            padding: 6,
                            background: "var(--input-bg)",
                            color: "var(--text)",
                            border: "1px solid var(--border)",
                            borderRadius: 6
                        }}
                    />
                    <button
                        type="button"
                        onClick={async () => {
                            await onEdit(comment._id, editText);
                            setEditing(false);
                        }}
                    >
                        Save
                    </button>
                    <button type="button" onClick={() => setEditing(false)}>Cancel</button>
                </div>
            ) : (
                <div style={{ marginBottom: 6, fontStyle: comment.isDeleted ? "italic" : "normal" }}>
                    {comment.content}
                </div>
            )}

            {!comment.isDeleted && !editing && (
                <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
                    <button type="button" onClick={() => setReplying((prev) => !prev)}>Reply</button>
                    {isOwner && (
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditText(comment.content);
                                    setEditing(true);
                                    setReplying(false);
                                }}
                            >
                                Edit
                            </button>
                            <button type="button" onClick={() => onDelete(comment._id)}>Delete</button>
                        </>
                    )}
                </div>
            )}

            {replying && (
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <input
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        style={{
                            flex: 1,
                            padding: 6,
                            background: "var(--input-bg)",
                            color: "var(--text)",
                            border: "1px solid var(--border)",
                            borderRadius: 6
                        }}
                    />
                    <button
                        type="button"
                        onClick={async () => {
                            if (!replyText.trim()) return;
                            await onReply(comment._id, replyText);
                            setReplyText("");
                            setReplying(false);
                        }}
                    >
                        Send
                    </button>
                </div>
            )}

            {comment.replies?.map((reply) => (
                <CommentRow
                    key={reply._id}
                    comment={reply}
                    currentUserId={currentUserId}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    depth={depth + 1}
                />
            ))}
        </div>
    );
}

function CommentsTest() {
    const [posts, setPosts] = useState([]);
    const [postId, setPostId] = useState("");
    const [comments, setComments] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [error, setError] = useState("");

    async function loadComments(id) {
        if (!id) return;
        try {
            setError("");
            const data = await getComments(id);
            setComments(data.comments || []);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        getPosts()
            .then((data) => {
                const list = data.posts || [];
                setPosts(list);
                if (list.length > 0) setPostId(list[0]._id);
            })
            .catch((err) => setError(err.message));

        getCurrentUser()
            .then((data) => setCurrentUserId(data.user?._id || null))
            .catch(() => setCurrentUserId(null));
    }, []);

    useEffect(() => {
        if (!postId) return;
        let active = true;
        getComments(postId)
            .then((data) => {
                if (active) setComments(data.comments || []);
            })
            .catch((err) => {
                if (active) setError(err.message);
            });
        return () => {
            active = false;
        };
    }, [postId]);

    async function handleAdd(e) {
        e.preventDefault();
        if (!postId || !newComment.trim()) return;
        try {
            setError("");
            await createComment(postId, newComment.trim(), null);
            setNewComment("");
            await loadComments(postId);
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleReply(parentId, text) {
        try {
            setError("");
            await createComment(postId, text.trim(), parentId);
            await loadComments(postId);
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleEdit(commentId, text) {
        try {
            setError("");
            await updateComment(commentId, text.trim());
            await loadComments(postId);
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleDelete(commentId) {
        try {
            setError("");
            await deleteComment(commentId);
            await loadComments(postId);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div style={{ maxWidth: 700, margin: "24px auto", padding: "0 16px", textAlign: "left" }}>
            <h2>Comments Test UI (Temporary)</h2>

            <div style={{ marginBottom: 16 }}>
                <label htmlFor="post-select" style={{ marginRight: 8 }}>Post:</label>
                <select
                    id="post-select"
                    value={postId}
                    onChange={(e) => setPostId(e.target.value)}
                    style={{
                        padding: 8,
                        background: "var(--input-bg)",
                        color: "var(--text)",
                        border: "1px solid var(--border)",
                        borderRadius: 6
                    }}
                >
                    {posts.map((p) => (
                        <option key={p._id} value={p._id}>
                            {p.title}
                        </option>
                    ))}
                </select>
            </div>

            <form onSubmit={handleAdd} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{
                        flex: 1,
                        padding: 10,
                        background: "var(--input-bg)",
                        color: "var(--text)",
                        border: "1px solid var(--border)",
                        borderRadius: 8
                    }}
                />
                <button type="submit" className="signup-btn">Comment</button>
            </form>

            {error && <div style={{ color: "var(--primary)", marginBottom: 12 }}>{error}</div>}

            {comments.length === 0 ? (
                <p style={{ color: "var(--text-secondary)" }}>No comments yet.</p>
            ) : (
                comments.map((c) => (
                    <CommentRow
                        key={c._id}
                        comment={c}
                        currentUserId={currentUserId}
                        onReply={handleReply}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))
            )}
        </div>
    );
}

export default CommentsTest;
