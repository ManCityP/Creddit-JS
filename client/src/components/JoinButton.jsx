import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn, joinCommunity, leaveCommunity } from "../api/api";
import "./JoinButton.css";

function JoinButton({ communityName, isMember, isModerator, onChange }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    if (isModerator) {
        return <span className="moderator-badge">Moderator</span>;
    }

    async function handleClick() {
        if (!isLoggedIn()) {
            navigate("/login");
            return;
        }

        setLoading(true);
        try {
            const data = isMember
                ? await leaveCommunity(communityName)
                : await joinCommunity(communityName);

            onChange({ isMember: data.isMember, memberCount: data.memberCount });
        } catch (error) {
            if (error.status === 401) {
                navigate("/login");
            } else {
                window.alert(error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            type="button"
            className={isMember ? "join-btn joined" : "join-btn"}
            onClick={handleClick}
            disabled={loading}
        >
            {isMember ? (
                <>
                    <span className="join-btn-joined">Joined</span>
                    <span className="join-btn-leave">Leave</span>
                </>
            ) : (
                "Join"
            )}
        </button>
    )
}

export default JoinButton;
