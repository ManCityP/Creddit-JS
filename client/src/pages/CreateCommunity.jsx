import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createCommunity, isLoggedIn } from "../api/communityApi";
import "./CreateCommunity.css";

const COMMUNITY_NAME_REGEX = /^[a-zA-Z0-9_]{3,21}$/;
const NAME_MAX = 21;
const DESCRIPTION_MAX = 500;

function CreateCommunity() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // /create-community?name=gaming opens the form with the name filled in
    const [name, setName] = useState(() => (searchParams.get("name") || "").slice(0, NAME_MAX));
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [needsLogin, setNeedsLogin] = useState(false);
    const [loading, setLoading] = useState(false);

    const trimmedName = name.trim();
    const nameIsValid = COMMUNITY_NAME_REGEX.test(trimmedName);
    const showNameError = trimmedName.length > 0 && !nameIsValid;

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setNeedsLogin(false);

        if (!nameIsValid) {
            setError("Please choose a valid community name.");
            return;
        }

        if (!isLoggedIn()) {
            setNeedsLogin(true);
            return;
        }

        setLoading(true);
        try {
            const data = await createCommunity(trimmedName, description.trim());
            navigate(`/r/${data.community.name}`);
        } catch (err) {
            if (err.status === 401) {
                setNeedsLogin(true);
            } else {
                setError(err.message);
            }
            setLoading(false);
        }
    }

    return (
        <div className="create-community-container">
            <h1>Tell us about your community</h1>
            <p className="create-community-subtitle">
                A name and description help people understand what your community is all about.
            </p>

            <form onSubmit={handleSubmit} noValidate>
                <div className="create-community-layout">
                    <div className="create-community-fields">
                        <div className="create-community-field">
                            <label htmlFor="community-name">Community name *</label>
                            <div className={`community-name-input ${showNameError ? "has-error" : ""}`}>
                                <span>r/</span>
                                <input
                                    id="community-name"
                                    type="text"
                                    value={name}
                                    maxLength={NAME_MAX}
                                    autoComplete="off"
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="create-community-hint">
                                <span className={showNameError ? "error-text" : ""}>
                                    3-21 characters: letters, numbers and underscores. You can't change it later.
                                </span>
                                <span>{name.length}/{NAME_MAX}</span>
                            </div>
                        </div>

                        <div className="create-community-field">
                            <label htmlFor="community-description">Description</label>
                            <textarea
                                id="community-description"
                                rows={6}
                                value={description}
                                maxLength={DESCRIPTION_MAX}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <div className="create-community-hint">
                                <span />
                                <span>{description.length}/{DESCRIPTION_MAX}</span>
                            </div>
                        </div>
                    </div>

                    <div className="community-preview">
                        <div className="community-preview-header">
                            <div className="community-preview-icon">r/</div>
                            <div>
                                <div className="community-preview-name">
                                    r/{trimmedName || "communityname"}
                                </div>
                                <div className="community-preview-members">1 member</div>
                            </div>
                        </div>
                        <p className="community-preview-description">
                            {description.trim() || "Your community description"}
                        </p>
                    </div>
                </div>

                {error && <p className="create-community-error">{error}</p>}

                {needsLogin && (
                    <p className="create-community-error">
                        You need to log in to create a community. <Link to="/login">Log in</Link>
                    </p>
                )}

                <div className="create-community-actions">
                    <Link to="/" className="create-community-cancel">
                        Cancel
                    </Link>
                    <button type="submit" disabled={loading || !nameIsValid}>
                        {loading ? "Creating..." : "Create Community"}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CreateCommunity;
