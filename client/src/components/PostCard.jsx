import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import JoinButton from "./JoinButton";
import { SERVER_URL, votePost } from "../api/api.js";
import "./PostCard.css";

function formatMediaUrl(url = "") {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${SERVER_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

function getMediaKind(item = {}) {
    if (item.type) return item.type;
    const mime = item.mimeType || "";
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("video/")) return "video";
    if (mime.startsWith("audio/")) return "audio";
    return "file";
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

function PostCard({ post }) {
    const navigate = useNavigate();

    const initialScore =
        typeof post.score === "number"
            ? post.score
            : (post.upvotes ?? 0) - (post.downvotes ?? 0);

    const [voteStatus, setVoteStatus] = useState(post.userVote || 0); // 1 | -1 | 0
    const [score, setScore] = useState(initialScore);
    const [voting, setVoting] = useState(false);

    const communityObj =
        post.community && typeof post.community === "object" ? post.community : null;
    const communityName = communityObj?.name || post.communityName || "";
    const initialIsMember = Boolean(
        communityObj?.isMember ?? post.isMember ?? post.isCommunityMember
    );
    const [isMember, setIsMember] = useState(initialIsMember);
    const isModerator = Boolean(
        communityObj?.isModerator ?? post.isModerator ?? post.isCommunityModerator
    );

    useEffect(() => {
        setIsMember(
            Boolean(communityObj?.isMember ?? post.isMember ?? post.isCommunityMember)
        );
    }, [communityObj?.isMember, post.isMember, post.isCommunityMember]);

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
    const [mediaIndex, setMediaIndex] = useState(0);
    const [brokenMedia, setBrokenMedia] = useState({});
    const [lightboxOpen, setLightboxOpen] = useState(false);

    useEffect(() => {
        setMediaIndex(0);
        setBrokenMedia({});
        setLightboxOpen(false);
    }, [post._id, mediaList.length]);

    useEffect(() => {
        if (!lightboxOpen) return;

        function handleKeyDown(e) {
            if (e.key === "Escape") {
                setLightboxOpen(false);
            } else if (e.key === "ArrowLeft" && mediaList.length > 1) {
                setMediaIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
            } else if (e.key === "ArrowRight" && mediaList.length > 1) {
                setMediaIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightboxOpen, mediaList.length]);

    const safeIndex =
        mediaList.length > 0 ? Math.min(mediaIndex, mediaList.length - 1) : 0;
    const activeMedia = mediaList[safeIndex] || null;
    const activeMediaSrc = activeMedia ? formatMediaUrl(activeMedia.url) : "";
    const activeMediaKind = activeMedia ? getMediaKind(activeMedia) : null;
    const isActiveBroken = activeMedia
        ? Boolean(brokenMedia[`${safeIndex}-${activeMediaSrc}`])
        : false;

    function handlePrevMedia(e) {
        e.stopPropagation();
        if (mediaList.length <= 1) return;
        setMediaIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
    }

    function handleNextMedia(e) {
        e.stopPropagation();
        if (mediaList.length <= 1) return;
        setMediaIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
    }

    function handleSelectMediaDot(e, idx) {
        e.stopPropagation();
        setMediaIndex(idx);
    }

    function handleOpenLightbox(e) {
        e.stopPropagation();
        if (!activeMedia) return;
        setLightboxOpen(true);
    }

    function handleCloseLightbox(e) {
        if (e) e.stopPropagation();
        setLightboxOpen(false);
    }

    function goToPostDetail() {
        if (!post._id) return;
        //TODO: Navigate to a page with post and all its comments
        //navigate(`/posts/${post._id}`);
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

        setVoting(true);
        try {
            const updated = await votePost(post._id, nextVote);
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

    function renderMediaContent(isExpanded = false) {
        if (!activeMedia) return null;

        if (!activeMediaSrc || isActiveBroken) {
            return (
                <div className="post-media-fallback">
                    <span>
                        Unable to load media ({activeMedia.mimeType || activeMediaKind || "file"})
                    </span>
                    {activeMediaSrc && (
                        <a
                            href={activeMediaSrc}
                            target="_blank"
                            rel="noreferrer"
                            className="post-file-link"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Open file in new tab
                        </a>
                    )}
                </div>
            );
        }

        if (activeMediaKind === "image") {
            return (
                <img
                    src={activeMediaSrc}
                    alt={`${post.title} (${safeIndex + 1} of ${mediaList.length})`}
                    className={isExpanded ? "lightbox-image" : "post-image"}
                    onError={() =>
                        setBrokenMedia((prev) => ({
                            ...prev,
                            [`${safeIndex}-${activeMediaSrc}`]: true,
                        }))
                    }
                />
            );
        }

        if (activeMediaKind === "video") {
            return (
                <video
                    src={activeMediaSrc}
                    controls
                    className={isExpanded ? "lightbox-video" : "post-video"}
                    onClick={(e) => e.stopPropagation()}
                    onError={() =>
                        setBrokenMedia((prev) => ({
                            ...prev,
                            [`${safeIndex}-${activeMediaSrc}`]: true,
                        }))
                    }
                />
            );
        }

        if (activeMediaKind === "audio") {
            return (
                <div className="post-audio-box" onClick={(e) => e.stopPropagation()}>
                    <span className="post-audio-label">
                        Audio attachment ({activeMedia.mimeType || "audio"})
                    </span>
                    <audio
                        src={activeMediaSrc}
                        controls
                        className="post-audio"
                        onError={() =>
                            setBrokenMedia((prev) => ({
                                ...prev,
                                [`${safeIndex}-${activeMediaSrc}`]: true,
                            }))
                        }
                    />
                </div>
            );
        }

        return (
            <div className="post-file-box" onClick={(e) => e.stopPropagation()}>
                <span className="post-file-pill">
                    Attachment ({activeMedia.mimeType || activeMedia.type || "file"})
                </span>
                <a
                    href={activeMediaSrc}
                    target="_blank"
                    rel="noreferrer"
                    className="post-file-link"
                >
                    Download / View file
                </a>
            </div>
        );
    }

    //TODO: Maybe show if it has been edited

    return (
        <>
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

                    {activeMedia && (
                        <div
                            className="post-media-carousel"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                className="post-media-preview expandable"
                                role="button"
                                tabIndex={0}
                                aria-label="Expand media view"
                                onClick={handleOpenLightbox}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        handleOpenLightbox(e);
                                    }
                                }}
                            >
                                {renderMediaContent(false)}

                                <button
                                    type="button"
                                    aria-label="Expand media view"
                                    className="expand-media-btn"
                                    onClick={handleOpenLightbox}
                                >
                                    ⤢
                                </button>

                                {mediaList.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            aria-label="Previous media item"
                                            className="carousel-arrow prev"
                                            onClick={handlePrevMedia}
                                        >
                                            ‹
                                        </button>
                                        <button
                                            type="button"
                                            aria-label="Next media item"
                                            className="carousel-arrow next"
                                            onClick={handleNextMedia}
                                        >
                                            ›
                                        </button>
                                        <span className="media-count-badge">
                                            {safeIndex + 1} / {mediaList.length}
                                        </span>
                                    </>
                                )}
                            </div>

                            {mediaList.length > 1 && (
                                <div
                                    className="carousel-dots"
                                    role="tablist"
                                    aria-label="Media slides"
                                >
                                    {mediaList.map((item, idx) => (
                                        <button
                                            key={item._id || `${item.url || "media"}-${idx}`}
                                            type="button"
                                            role="tab"
                                            aria-selected={idx === safeIndex}
                                            aria-label={`View media ${idx + 1}`}
                                            className={`carousel-dot ${idx === safeIndex ? "active" : ""}`}
                                            onClick={(e) => handleSelectMediaDot(e, idx)}
                                        />
                                    ))}
                                </div>
                            )}
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

            {lightboxOpen && activeMedia && (
                <div
                    className="media-lightbox-backdrop"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${post.title} media viewer`}
                    onClick={handleCloseLightbox}
                >
                    <div
                        className="media-lightbox-panel"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="media-lightbox-topbar">
                            <span className="media-lightbox-title">
                                {post.title}
                                {mediaList.length > 1
                                    ? ` (${safeIndex + 1} / ${mediaList.length})`
                                    : ""}
                            </span>
                            <button
                                type="button"
                                aria-label="Close expanded media view"
                                className="lightbox-close-btn"
                                onClick={handleCloseLightbox}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="media-lightbox-stage">
                            {renderMediaContent(true)}

                            {mediaList.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        aria-label="Previous media item"
                                        className="carousel-arrow prev lightbox-arrow"
                                        onClick={handlePrevMedia}
                                    >
                                        ‹
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Next media item"
                                        className="carousel-arrow next lightbox-arrow"
                                        onClick={handleNextMedia}
                                    >
                                        ›
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default PostCard;