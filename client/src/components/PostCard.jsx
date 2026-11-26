import { useState } from "react";
import { useNavigate } from "react-router-dom";
import JoinButton from "./JoinButton";
import {SERVER_URL} from "../api/api.js"
import "./PostCard.css";

function formatMediaUrl(url = "") {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${SERVER_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

function formatTimeAgo(dateInput) {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return "";

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
}

function PostCard({ post, onVoteButtonClick }) {
    const navigate = useNavigate();

    const initialScore = typeof post.score === "number" ? post.score : (post.upvotes ?? 0) - (post.downvotes ?? 0);

    const [voteStatus, setVoteStatus] = useState(post.userVote || 0); // 1 | -1 | 0
    const [score, setScore] = useState(initialScore);
    const [voting, setVoting] = useState(false);

    const communityObj = post.community && typeof post.community === "object" ? post.community : null;
    const communityName = communityObj?.name || post.communityName || "";
    const initialIsMember = Boolean(
        communityObj?.isMember ?? post.isMember ?? post.isCommunityMember
    );
    const [isMember, setIsMember] = useState(initialIsMember);
    const isModerator = Boolean(
        communityObj?.isModerator ?? post.isModerator ?? post.isCommunityModerator
    );

    const authorName =
        typeof post.author === "object"
            ? post.author?.username || "deleted"
            : post.username || "test";

    const commentCount =
        typeof post.commentCount === "number"
            ? post.commentCount
            : Array.isArray(post.comments)
                ? post.comments.length
                : 0;

    const mediaList = Array.isArray(post.media) ? post.media : [];
    const firstImage = mediaList.find(
        (m) => m.type === "image" || (m.mimeType && m.mimeType.startsWith("image/"))
    );

    function goToPostDetail() {
        if (!post._id) return;
        navigate(`/posts/${post._id}`);
    }

    function handleCardKeyDown(e) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            goToPostDetail();
        }
    }

    async function handleVote(e, direction) {
        e.stopPropagation();
        if (voting) return;

        const prevVote = voteStatus;
        const prevScore = score;
        const nextVote = voteStatus === direction ? 0 : direction;
        const diff = nextVote - prevVote;

        setVoteStatus(nextVote);
        setScore(prevScore + diff);

        if (!onVoteButtonClick) return;

        setVoting(true);
        try {
            const updated = await onVoteButtonClick(post._id, nextVote);
            if (updated && typeof updated.score === "number") {
                setScore(updated.score);
            }
            if (updated && typeof updated.userVote === "number") {
                setVoteStatus(updated.userVote);
            }
        } catch {
            setVoteStatus(prevVote);
            setScore(prevScore);
        } finally {
            setVoting(false);
        }
    }

    function handleCommentClick(e) {
        e.stopPropagation();
        goToPostDetail();
    }

    function handleMembershipChange(result) {
        setIsMember(result.isMember);
    }

    return (
        <article
            className="post-card"
            role="button"
            tabIndex={0}
            onClick={goToPostDetail}
            onKeyDown={handleCardKeyDown}
        >
            {/* Left Vote Rail */}
            <div className="post-vote-rail" onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    aria-label="Upvote post"
                    aria-pressed={voteStatus === 1}
                    className={`vote-btn upvote ${voteStatus === 1 ? "active" : ""}`}
                    onClick={(e) => handleVote(e, 1)}
                    disabled={voting}
                >
                    ▲
                </button>
                <span
                    className={`vote-count ${
                        voteStatus === 1 ? "up" : voteStatus === -1 ? "down" : ""
                    }`}
                >
          {score}
        </span>
                <button
                    type="button"
                    aria-label="Downvote post"
                    aria-pressed={voteStatus === -1}
                    className={`vote-btn downvote ${voteStatus === -1 ? "active" : ""}`}
                    onClick={(e) => handleVote(e, -1)}
                    disabled={voting}
                >
                    ▼
                </button>
            </div>

            {/* Main Post Content */}
            <div className="post-card-body">
                <header className="post-card-header">
                    <div className="post-meta-left">
                        {communityName ? (
                            <span className="post-community">c/{communityName}</span>
                        ) : (
                            <span className="post-community general">General</span>
                        )}
                        <span className="post-meta-sep">•</span>
                        <span className="post-author">Posted by u/{authorName}</span>
                        {post.createdAt && (
                            <>
                                <span className="post-meta-sep">•</span>
                                <span className="post-time">{formatTimeAgo(post.createdAt)}</span>
                            </>
                        )}
                    </div>

                    {communityName && (
                        <div
                            className="post-join-wrap"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <JoinButton
                                communityName={communityName}
                                isMember={isMember}
                                isModerator={isModerator}
                                onChange={handleMembershipChange}
                            />
                        </div>
                    )}
                </header>

                <h2 className="post-card-title">{post.title}</h2>

                {post.content && <p className="post-card-text">{post.content}</p>}

                {firstImage && (
                    <div className="post-media-preview">
                        <img
                            src={formatMediaUrl(firstImage.url)}
                            alt={post.title}
                            className="post-image"
                        />
                        {mediaList.length > 1 && (
                            <span className="media-count-badge">+{mediaList.length - 1} more</span>
                        )}
                    </div>
                )}

                {!firstImage && mediaList.length > 0 && (
                    <div className="post-file-pill">
                        {mediaList.length}{" "}
                        {mediaList.length === 1 ? "attachment" : "attachments"}
                    </div>
                )}

                <footer className="post-card-footer">
                    <button
                        type="button"
                        className="post-action-btn"
                        onClick={handleCommentClick}
                    >
            <span className="comment-icon" aria-hidden="true">
              💬
            </span>
                        <span>{commentCount}</span>
                        <span>{commentCount === 1 ? "Comment" : "Comments"}</span>
                    </button>
                </footer>
            </div>
        </article>
    );
}

export default PostCard;