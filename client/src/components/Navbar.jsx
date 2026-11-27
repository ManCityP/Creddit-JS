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

                <Link to="/comments-test" className="login-btn">
                    Test Comments
                </Link>

                <Link to="/login" className="login-btn">
                    Log in
                </Link>

                <Link to="/register" className="signup-btn">
                    Sign up
                </Link>
            </div>
        </nav>
    )
}

export default Navbar;