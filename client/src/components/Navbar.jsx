import { Link } from 'react-router-dom'

function Navegator(){
    return(
        <nav className="navbar">
            <Link to="/" className="navbar-logo">
                <img src="./reddit.png" alt="Creddit" />
                <span>Creddit</span>
            </Link>

            <div className="navbar-actions">
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

export default Navegator;