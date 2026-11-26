import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPost } from "../api/api";
import "./CreatePost.css";

const MAX_TITLE_LENGTH = 255;
const MAX_CONTENT_LENGTH = 65535;
const MAX_FILES = 20;

function CreatePost() {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const [communities, setCommunities] = useState([]);
    const [loadingCommunities, setLoadingCommunities] = useState(true);
    const [selectedCommunityId, setSelectedCommunityId] = useState("");
    const [communityFilter, setCommunityFilter] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    //TODO: Load Communities

    const filteredCommunities = useMemo(() => {
        const query = communityFilter.trim().toLowerCase();
        if (!query) return communities;
        return communities.filter((c) =>
            (c.name || "").toLowerCase().includes(query)
        );
    }, [communities, communityFilter]);

    const selectedCommunity = useMemo(
        () => communities.find((c) => c._id === selectedCommunityId) || null,
        [communities, selectedCommunityId]
    );

    // Preview Image Files
    useEffect(() => {
        const nextPreviews = files.map((file, index) => ({
            id: `${file.name}-${file.size}-${index}`,
            name: file.name,
            size: file.size,
            type: file.type,
            url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        }));

        setPreviews(nextPreviews);

        return () => {
            nextPreviews.forEach((item) => {
                if (item.url) URL.revokeObjectURL(item.url);
            });
        };
    }, [files]);

    function addFiles(incomingFiles) {
        const selected = Array.from(incomingFiles || []);
        if (!selected.length) return;

        setError("");
        setFiles((prev) => {
            const combined = [...prev, ...selected];
            if (combined.length > MAX_FILES) {
                setError(`You can attach up to ${MAX_FILES} files per post.`);
                return combined.slice(0, MAX_FILES);
            }
            return combined;
        });
    }

    function handleSelectCommunity(community) {
        if (!community) {
            setSelectedCommunityId("");
            setCommunityFilter("");
        } else {
            setSelectedCommunityId(community._id);
            setCommunityFilter(community.name);
        }
        setDropdownOpen(false);
    }

    function handleFilterInputChange(e) {
        const val = e.target.value;
        setCommunityFilter(val);
        setDropdownOpen(true);

        if (
            selectedCommunity &&
            val.trim().toLowerCase() !== selectedCommunity.name.toLowerCase()
        ) {
            setSelectedCommunityId("");
        }
    }

    function handleFileChange(e) {
        addFiles(e.target.files);
        e.target.value = "";
    }

    function handleDragEnter(e) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = "copy";
        }
        if (!isDragging) {
            setIsDragging(true);
        }
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragging(false);
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = e.dataTransfer?.files;
        if (droppedFiles && droppedFiles.length > 0) {
            addFiles(droppedFiles);
        }
    }

    function removeFile(indexToRemove) {
        setError("");
        setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    }

    function resetForm() {
        setTitle("");
        setContent("");
        setSelectedCommunityId("");
        setCommunityFilter("");
        setDropdownOpen(false);
        setFiles([]);
        setIsDragging(false);
        setError("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setError("Title is required.");
            return;
        }
        if (trimmedTitle.length > MAX_TITLE_LENGTH) {
            setError(`Title must be ${MAX_TITLE_LENGTH} characters or fewer.`);
            return;
        }
        if (content.length > MAX_CONTENT_LENGTH) {
            setError(`Body text must be ${MAX_CONTENT_LENGTH} characters or fewer.`);
            return;
        }

        const formData = new FormData();
        formData.append("title", trimmedTitle);
        formData.append("content", content.trim());

        const communityValue = selectedCommunityId || communityFilter.trim();
        if (communityValue) {
            formData.append("community", communityValue);
        }

        files.forEach((file) => {
            formData.append("media", file);
        });

        try {
            setSubmitting(true);
            await createPost(formData);
            resetForm();
            navigate("/");
        } catch (err) {
            if (err instanceof TypeError) {
                setError("Network error while creating post!");
            } else {
                setError(err.message || "Failed to create post!");
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="create-post-page">
            <div className="create-post-header">
                <h1>Create a post</h1>
            </div>

            <div className="create-post-card">
                {/* Filterable Community Dropdown */}
                <div
                    className="community-picker"
                    onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget)) {
                            setDropdownOpen(false);
                        }
                    }}
                >
                    <div className="label-row">
                        <label htmlFor="community-filter">Choose a community (optional)</label>
                        {selectedCommunityId && (
                            <button
                                type="button"
                                className="clear-community-btn"
                                onClick={() => handleSelectCommunity(null)}
                            >
                                Clear selection
                            </button>
                        )}
                    </div>

                    <div className="community-input-wrap">
                        <input
                            id="community-filter"
                            type="text"
                            autoComplete="off"
                            placeholder={
                                loadingCommunities
                                    ? "Loading communities..."
                                    : "Type to filter communities or leave blank..."
                            }
                            value={communityFilter}
                            onFocus={() => setDropdownOpen(true)}
                            onChange={handleFilterInputChange}
                        />
                        <button
                            type="button"
                            className="dropdown-toggle-btn"
                            aria-label="Toggle community list"
                            onClick={() => setDropdownOpen((prev) => !prev)}
                        >
                            {dropdownOpen ? "▲" : "▼"}
                        </button>
                    </div>

                    {dropdownOpen && (
                        <div className="community-dropdown-menu" role="listbox">
                            <button
                                type="button"
                                role="option"
                                aria-selected={selectedCommunityId === ""}
                                className={`community-option ${
                                    selectedCommunityId === "" ? "selected" : ""
                                }`}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSelectCommunity(null)}
                            >
                                <span>None (General post)</span>
                            </button>

                            {filteredCommunities.length > 0 ? (
                                filteredCommunities.map((comm) => (
                                    <button
                                        key={comm._id}
                                        type="button"
                                        role="option"
                                        aria-selected={selectedCommunityId === comm._id}
                                        className={`community-option ${
                                            selectedCommunityId === comm._id ? "selected" : ""
                                        }`}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleSelectCommunity(comm)}
                                    >
                                        <span className="community-option-name">c/{comm.name}</span>
                                        {typeof comm.memberCount === "number" && (
                                            <span className="community-option-meta">
                                                {comm.memberCount} members
                                            </span>
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="community-empty">
                                    {communities.length === 0
                                        ? "No communities loaded yet (you can still paste a community ID or post without one)."
                                        : `No communities matching "${communityFilter.trim()}".`}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="create-post-form">
                    {/* Title + counter */}
                    <div className="field-group">
                        <div className="label-row">
                            <label htmlFor="post-title">Title *</label>
                            <span className="char-count">
                                {title.length}/{MAX_TITLE_LENGTH}
                            </span>
                        </div>
                        <input
                            id="post-title"
                            type="text"
                            maxLength={MAX_TITLE_LENGTH}
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Body text */}
                    <div className="field-group">
                        <div className="label-row">
                            <label htmlFor="post-body">Body text (optional)</label>
                            <span className="char-count">
                                {content.length}/{MAX_CONTENT_LENGTH}
                            </span>
                        </div>
                        <textarea
                            id="post-body"
                            rows={5}
                            maxLength={MAX_CONTENT_LENGTH}
                            placeholder="Text (optional)"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    {/* Drag-and-drop media & file uploader below body text */}
                    <div className="field-group">
                        <div
                            className={`dropzone ${isDragging ? "dragging" : ""}`}
                            onDragEnter={handleDragEnter}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <span className="dropzone-title">
                                {isDragging
                                    ? "Drop files here to attach"
                                    : "Drag and drop or choose files to upload"}
                            </span>
                            <span className="dropzone-hint">
                                Images, video, audio, PDF, DOCX, ZIP, TXT, CSV (max 50MB each, up to 20 files)
                            </span>
                            <label htmlFor="media-upload" className="dropzone-btn">
                                Select Files
                            </label>
                            <input
                                id="media-upload"
                                type="file"
                                multiple
                                accept="image/*,video/*,audio/*,.pdf,.docx,.zip,.txt,.csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip,application/x-zip-compressed,text/plain,text/csv"
                                onChange={handleFileChange}
                                hidden
                            />
                        </div>

                        {previews.length > 0 && (
                            <div className="attachment-list">
                                {previews.map((item, idx) => (
                                    <div key={item.id} className="attachment-chip">
                                        {item.url ? (
                                            <img
                                                src={item.url}
                                                alt={item.name}
                                                className="attachment-thumb"
                                            />
                                        ) : (
                                            <span className="attachment-badge">FILE</span>
                                        )}
                                        <span className="attachment-name" title={item.name}>
                                            {item.name}
                                        </span>
                                        <button
                                            type="button"
                                            className="remove-file-btn"
                                            onClick={() => removeFile(idx)}
                                            aria-label={`Remove ${item.name}`}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && <div className="form-error">{error}</div>}

                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={resetForm}
                            disabled={submitting}
                        >
                            Clear
                        </button>
                        <button type="submit" className="submit-btn" disabled={submitting}>
                            {submitting ? "Posting..." : "Post"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreatePost;