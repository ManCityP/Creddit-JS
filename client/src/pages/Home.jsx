import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchLatestPosts } from "../api/api";
import PostCard from "../components/PostCard";
import "./Home.css";

function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadLatestPosts() {
            //TODO: Load more posts when scrolling down, and actually load with different filters (This is just a test)
            try {
                setLoading(true);
                setError("");
                const list = await fetchLatestPosts(10);
                if (active) {
                    setPosts(list.slice(0, 10));
                }
            } catch (err) {
                if (active) {
                    setError(err.message || "Failed to load posts.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadLatestPosts();
        return () => {
            active = false;
        };
    }, []);

    function handleCommunityChange(communityName, { isMember }) {
        setPosts((prev) =>
            prev.map((post) => {
                const name = typeof post.community === "object" ? post.community?.name : post.communityName;
                if (name !== communityName) return post;

                return {
                    ...post,
                    isMember,
                    community: typeof post.community === "object" && post.community ? { ...post.community, isMember } : post.community
                };
            })
        );
    }

    return (
        <main className="home-page">
            <div className="home-header">
                <h1>Latest Posts</h1>
            </div>

            {loading && <p className="home-status">Loading latest posts...</p>}
            {error && <div className="home-error">{error}</div>}

            {!loading && !error && posts.length === 0 && (
                <p className="home-status">No posts yet. Create the first one!</p>
            )}

            {!loading && !error && posts.length > 0 && (
                <div className="posts-feed">
                    {posts.map((post) => (
                        <PostCard
                            key={post._id}
                            post={post}
                            onCommunityChange={handleCommunityChange}
                        />
                    ))}
                </div>
            )}
        </main>
    );
}

export default Home;