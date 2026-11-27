import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PostCard from "../components/PostCard";
import {
    createComment,
    deleteComment,
    getComments,
    getPostById,
    getStoredUser,
    isLoggedIn,
    updateComment
} from "../api/api";
import "./CommentsPage.css";

const MAX_COMMENT_LENGTH = 10000;

function formatRelativeTime(dateString) {
    if (!dateString) return "";
    const diffMs = Date.now() - new Date(dateString).getTime();
    const seconds = Math.max(0, Math.floor(diffMs / 1000));
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateString).toLocaleDateString();
}

function CommentItem({
    comment,
    currentUserId,
    loggedIn,
    onReply,
    onEdit,
    onDelete,
    depth = 0
}) {
    const [collapsed, setCollapsed] = useState(false);

    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [replyError, setReplyError] = useState("");
    const [replySubmitting, setReplySubmitting] = useState(false);

    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content);
    const [editError, setEditError] = useState("");
    const [editSubmitting, setEditSubmitting] = useState(false);

    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [actionError, setActionError] = useState("");

    const isOwner = Boolean(
        !comment.isDeleted &&
        currentUserId &&
        comment.author?._id === currentUserId
    );
    const replyCount = comment.replies ? comment.replies.length : 0;

    async function handleReplySubmit(e) {
        e.preventDefault();
        setReplyError("");
        const trimmed = replyText.trim();
        if (!trimmed) {
            setReplyError("Reply cannot be empty.");
            return;
        }
        try {
            setReplySubmitting(true);
            await onReply(comment._id, trimmed);
            setReplyText("");
            setReplying(false);
            setCollapsed(false);
        } catch (err) {
            setReplyError(err.message || "Failed to post reply.");
        } finally {
            setReplySubmitting(false);
        }
    }

    async function handleEditSubmit(e) {
        e.preventDefault();
        setEditError("");
        const trimmed = editText.trim();
        if (!trimmed) {
            setEditError("Comment cannot be empty.");
            return;
        }
        try {
            setEditSubmitting(true);
            await onEdit(comment._id, trimmed);
            setEditing(false);
        } catch (err) {
            setEditError(err.message || "Failed to update comment.");
        } finally {
            setEditSubmitting(false);
        }
    }

    async function handleDeleteConfirm() {
        setActionError("");
        try {
            setDeleting(true);
            await onDelete(comment._id);
            setConfirmingDelete(false);
        } catch (err) {
            setActionError(err.message || "Failed to delete comment.");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className={`comment-item ${depth > 0 ? "comment-nested" : ""}`}>
            <div className="comment-header">
                <button
                    type="button"
                    className="collapse-btn"
                    onClick={() => setCollapsed((prev) => !prev)}
                    aria-label={collapsed ? "Expand thread" : "Collapse thread"}
                >
                    {collapsed ? "[+]" : "[-]"}
                </button>

                <span className={`comment-author ${comment.isDeleted ? "deleted-text" : ""}`}>
                    {comment.isDeleted
                        ? "[deleted]"
                        : `u/${comment.author?.username || "unknown"}`}
                </span>

                <span className="comment-dot">•</span>
                <span className="comment-time">{formatRelativeTime(comment.createdAt)}</span>

                {comment.editedAt && !comment.isDeleted && (
                    <span className="comment-edited" title={new Date(comment.editedAt).toLocaleString()}>
                        (edited)
                    </span>
                )}

                {collapsed && replyCount > 0 && (
                    <span className="comment-collapsed-hint">
                        ({replyCount} {replyCount === 1 ? "reply" : "replies"} hidden)
                    </span>
                )}
            </div>

            {!collapsed && (
                <div className="comment-body-wrap">
                    <div
                        className="comment-thread-line"
                        onClick={() => setCollapsed(true)}
                        title="Collapse thread"
                    />

                    <div className="comment-main">
                        {editing ? (
                            <form onSubmit={handleEditSubmit} className="inline-comment-form">
                                <textarea
                                    rows={3}
                                    maxLength={MAX_COMMENT_LENGTH}
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    disabled={editSubmitting}
                                />
                                {editError && <div className="comment-error">{editError}</div>}
                                <div className="inline-form-actions">
                                    <span className="comment-char-count">
                                        {editText.length}/{MAX_COMMENT_LENGTH}
                                    </span>
                                    <div className="inline-btn-group">
                                        <button
                                            type="button"
                                            className="comment-cancel-btn"
                                            disabled={editSubmitting}
                                            onClick={() => {
                                                setEditing(false);
                                                setEditText(comment.content);
                                                setEditError("");
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="comment-submit-btn"
                                            disabled={editSubmitting}
                                        >
                                            {editSubmitting ? "Saving..." : "Save"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <p className={`comment-content ${comment.isDeleted ? "deleted-text" : ""}`}>
                                {comment.content}
                            </p>
                        )}

                        {actionError && <div className="comment-error">{actionError}</div>}

                        {!comment.isDeleted && !editing && (
                            <div className="comment-actions">
                                {loggedIn && (
                                    <button
                                        type="button"
                                        className="comment-action-btn"
                                        onClick={() => {
                                            setReplying((prev) => !prev);
                                            setReplyError("");
                                        }}
                                    >
                                        Reply
                                    </button>
                                )}

                                {isOwner && (
                                    <>
                                        <button
                                            type="button"
                                            className="comment-action-btn"
                                            onClick={() => {
                                                setEditText(comment.content);
                                                setEditError("");
                                                setEditing(true);
                                                setReplying(false);
                                                setConfirmingDelete(false);
                                            }}
                                        >
                                            Edit
                                        </button>

                                        {confirmingDelete ? (
                                            <span className="delete-confirm-group">
                                                <span className="delete-confirm-label">Delete?</span>
                                                <button
                                                    type="button"
                                                    className="comment-action-btn danger"
                                                    disabled={deleting}
                                                    onClick={handleDeleteConfirm}
                                                >
                                                    {deleting ? "Deleting..." : "Confirm"}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="comment-action-btn"
                                                    disabled={deleting}
                                                    onClick={() => setConfirmingDelete(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                className="comment-action-btn danger"
                                                onClick={() => setConfirmingDelete(true)}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {replying && (
                            <form onSubmit={handleReplySubmit} className="inline-comment-form reply-form">
                                <textarea
                                    rows={3}
                                    maxLength={MAX_COMMENT_LENGTH}
                                    placeholder={`Reply to u/${comment.author?.username || "comment"}...`}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    disabled={replySubmitting}
                                />
                                {replyError && <div className="comment-error">{replyError}</div>}
                                <div className="inline-form-actions">
                                    <span className="comment-char-count">
                                        {replyText.length}/{MAX_COMMENT_LENGTH}
                                    </span>
                                    <div className="inline-btn-group">
                                        <button
                                            type="button"
                                            className="comment-cancel-btn"
                                            disabled={replySubmitting}
                                            onClick={() => {
                                                setReplying(false);
                                                setReplyText("");
                                                setReplyError("");
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="comment-submit-btn"
                                            disabled={replySubmitting}
                                        >
                                            {replySubmitting ? "Replying..." : "Reply"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {replyCount > 0 && (
                            <div className="comment-replies">
                                {comment.replies.map((reply) => (
                                    <CommentItem
                                        key={reply._id}
                                        comment={reply}
                                        currentUserId={currentUserId}
                                        loggedIn={loggedIn}
                                        onReply={onReply}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        depth={depth + 1}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function CommentsPage() {
    const { postId } = useParams();
    const storedUser = getStoredUser();
    const currentUserId = storedUser?.id || storedUser?._id || null;
    const loggedIn = isLoggedIn();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [newComment, setNewComment] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const refreshComments = useCallback(async () => {
        const data = await getComments(postId);
        setComments(data.comments || []);
        if (typeof data.commentCount === "number") {
            setPost((prev) => (prev ? { ...prev, commentCount: data.commentCount } : prev));
        }
    }, [postId]);

    useEffect(() => {
        let active = true;

        async function loadPage() {
            try {
                const [postData, commentsData] = await Promise.all([
                    getPostById(postId),
                    getComments(postId)
                ]);
                if (!active) return;
                setError("");
                setPost(postData.post);
                setComments(commentsData.comments || []);
            } catch (err) {
                if (active) {
                    setError(err.message || "Failed to load post and comments.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadPage();
        return () => {
            active = false;
        };
    }, [postId]);

    async function handleCreateTopLevel(e) {
        e.preventDefault();
        setSubmitError("");
        const trimmed = newComment.trim();
        if (!trimmed) {
            setSubmitError("Comment cannot be empty.");
            return;
        }

        try {
            setSubmitting(true);
            await createComment(postId, trimmed, null);
            setNewComment("");
            await refreshComments();
        } catch (err) {
            setSubmitError(err.message || "Failed to post comment.");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleReply(parentCommentId, content) {
        await createComment(postId, content, parentCommentId);
        await refreshComments();
    }

    async function handleEdit(commentId, content) {
        await updateComment(commentId, content);
        await refreshComments();
    }

    async function handleDelete(commentId) {
        await deleteComment(commentId);
        await refreshComments();
    }

    return (
        <div className="comments-page">
            <div className="comments-page-top">
                <Link to="/" className="back-link">
                    ← Back to Home
                </Link>
            </div>

            {loading ? (
                <div className="comments-card comments-status">Loading...</div>
            ) : error ? (
                <div className="comments-card comment-error">{error}</div>
            ) : !post ? (
                <div className="comments-card comments-status">Post not found.</div>
            ) : (
                <>
                    <PostCard post={post} />

                    <section className="comments-card">
                        <div className="comments-header">
                            <h2>
                                Comments{" "}
                                <span className="comment-count-badge">
                                    {post.commentCount || 0}
                                </span>
                            </h2>
                        </div>

                        {loggedIn ? (
                            <form onSubmit={handleCreateTopLevel} className="comment-composer">
                                <textarea
                                    rows={3}
                                    maxLength={MAX_COMMENT_LENGTH}
                                    placeholder="Join the conversation..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    disabled={submitting}
                                />
                                {submitError && <div className="comment-error">{submitError}</div>}
                                <div className="composer-footer">
                                    <span className="comment-char-count">
                                        {newComment.length}/{MAX_COMMENT_LENGTH}
                                    </span>
                                    <div className="inline-btn-group">
                                        {newComment && (
                                            <button
                                                type="button"
                                                className="comment-cancel-btn"
                                                disabled={submitting}
                                                onClick={() => {
                                                    setNewComment("");
                                                    setSubmitError("");
                                                }}
                                            >
                                                Clear
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            className="comment-submit-btn"
                                            disabled={submitting}
                                        >
                                            {submitting ? "Commenting..." : "Comment"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="login-prompt">
                                <Link to="/login" className="login-prompt-link">
                                    Log in
                                </Link>{" "}
                                to add a comment or reply.
                            </div>
                        )}

                        {comments.length === 0 ? (
                            <div className="comments-status">
                                No comments yet. Be the first to share your thoughts!
                            </div>
                        ) : (
                            <div className="comment-list">
                                {comments.map((comment) => (
                                    <CommentItem
                                        key={comment._id}
                                        comment={comment}
                                        currentUserId={currentUserId}
                                        loggedIn={loggedIn}
                                        onReply={handleReply}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}

export default CommentsPage;
