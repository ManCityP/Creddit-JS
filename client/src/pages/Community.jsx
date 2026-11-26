import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCommunity } from "../api/communityApi";
import "./Community.css";

function formatDate(value) {
    return new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

function CakeIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor"
             strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3.5 17h13M4.5 17v-5.5h11V17M4.5 14c1.2 0 1.2-1 2.6-1s1.4 1 2.9 1 1.5-1 2.9-1 1.4 1 2.6 1" />
            <path d="M10 11.5V8.5M10 6.5c-.8 0-1.2-.6-1.2-1.2S10 3 10 3s1.2 1.7 1.2 2.3-.4 1.2-1.2 1.2z" />
        </svg>
    )
}

function GlobeIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor"
             strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            <circle cx="10" cy="10" r="7.5" />
            <path d="M2.5 10h15M10 2.5c2 2.2 3 4.7 3 7.5s-1 5.3-3 7.5c-2-2.2-3-4.7-3-7.5s1-5.3 3-7.5z" />
        </svg>
    )
}

// The page at /r/:name
function Community() {
    const { name } = useParams();

    // The key makes the page start fresh when you go to another community
    return <CommunityView key={name.toLowerCase()} name={name} />;
}

function CommunityView({ name }) {
    const [community, setCommunity] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;

        getCommunity(name)
            .then((data) => {
                if (!ignore) setCommunity(data.community);
            })
            .catch((err) => {
                if (ignore) return;
                if (err.status === 404) {
                    setNotFound(true);
                } else {
                    setError(err.message);
                }
            });

        return () => {
            ignore = true;
        };
    }, [name]);

    if (notFound) {
        return (
            <div className="community-message">
                <h2>Sorry, there aren't any communities on Creddit with that name.</h2>
                <p>r/{name} doesn't exist yet. You can create it.</p>
                <Link to={`/create-community?name=${encodeURIComponent(name)}`} className="community-message-btn">
                    Create r/{name}
                </Link>
            </div>
        )
    }

    if (error) {
        return (
            <div className="community-message">
                <h2>Couldn't load this community</h2>
                <p>{error}</p>
            </div>
        )
    }

    if (!community) {
        return (
            <div className="community-message">
                <p>Loading...</p>
            </div>
        )
    }

    const memberLabel = community.memberCount === 1 ? "Member" : "Members";

    return (
        <div className="community-page">
            <div className="community-banner" />

            <div className="community-header">
                <div className="community-icon">r/</div>
                <h1>r/{community.name}</h1>
                {/* The Join / Leave button will go here (next feature) */}
            </div>

            <div className="community-body">
                <main className="community-posts">
                    <div className="community-empty">
                        <h2>This community doesn't have any posts yet</h2>
                        <p>Make one and get this feed started.</p>
                    </div>
                </main>

                <aside className="community-sidebar">
                    <h2>{community.name}</h2>
                    <p className="community-description">
                        {community.description || "No description yet."}
                    </p>

                    <div className="community-info">
                        <CakeIcon />
                        <span>Created {formatDate(community.createdAt)}</span>
                    </div>
                    <div className="community-info">
                        <GlobeIcon />
                        <span>Public</span>
                    </div>

                    <div className="community-stats">
                        <strong>{community.memberCount}</strong>
                        <span>{memberLabel}</span>
                    </div>

                    <hr />

                    <h3>MODERATORS</h3>
                    {community.creator ? (
                        <div className="community-moderator">
                            <div className="community-moderator-avatar">
                                {community.creator.username[0].toUpperCase()}
                            </div>
                            <span>u/{community.creator.username}</span>
                        </div>
                    ) : (
                        <p className="community-description">No moderator</p>
                    )}
                </aside>
            </div>
        </div>
    )
}

export default Community;
