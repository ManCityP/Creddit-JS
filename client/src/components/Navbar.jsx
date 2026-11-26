import { Link } from 'react-router-dom'

function Navbar(){
    return(
        <nav className="navbar">
            <Link to="/" className="navbar-logo">
                <img src="/reddit.png" alt="Creddit" />
                <span>Creddit</span>
            </Link>

            <div className="navbar-actions">
                <Link to="/CreatePost" className="signup-btn">
                    Create Post
                </Link>

                <Link to="/login" className="login-btn">
                    Log in
                </Link>

                <Link to="/register" className="signup-btn">
                    Sign up
                </Link>

                <Link to="/create-community" className="create-btn">
                    <span className="create-btn-plus">+</span>
                    <span className="create-btn-text">Create community</span>
                </Link>

            </div>
        </nav>
    )
}

export default Navbar;