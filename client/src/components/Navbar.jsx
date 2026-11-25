import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getStoredUser, logoutUser } from '../api/api';

function Navbar() {
    const [user, setUser] = useState(getStoredUser);
    const [showMenu, setShowMenu] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    // Update the navbar when navigating, including after login.
    useEffect(() => {
        setUser(getStoredUser());
    }, [location.pathname]);

    async function handleLogout() {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null);
            setShowMenu(false);
            navigate('/');
        }
    }

    const initial = user?.username
        ? user.username.charAt(0).toUpperCase()
        : '';

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo">
                <img src="/frisset.jpg" alt="Creddit" />
                <span>Creddit</span>
            </Link>

            <div className="navbar-actions">
                {user ? (
                    <>
                        <Link to="/CreatePost" className="signup-btn">
                            Create Post
                        </Link>

                        <div className="user-menu">
                            <button
                                className="user-menu-btn"
                                onClick={() => setShowMenu(!showMenu)}
                            >
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt="User avatar"
                                        className="user-avatar"
                                    />
                                ) : (
                                    <span className="user-avatar">
                                        {initial}
                                    </span>
                                )}

                                <span>{user.username}</span>
                            </button>

                            {showMenu && (
                                <div className="user-dropdown">
                                    <button onClick={handleLogout}>
                                        Log out
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="login-btn">
                            Log in
                        </Link>

                        <Link to="/create-community" className="create-btn">
                            <span className="create-btn-plus">+</span>
                            <span className="create-btn-text">Create community</span>
                        </Link>

                        <Link to="/register" className="signup-btn">
                            Sign up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;