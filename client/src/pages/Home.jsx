
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
    return (
        <div className="home-page">

            {/* Hero Section */}
            <section className="hero-section">

                <div className="hero-content">
                    <span className="hero-tag">
                        WELCOME TO CREDDIT
                    </span>

                    <h1>
                        Find your people.
                        <br />
                        <span>Share your world.</span>
                    </h1>

                    <p>
                        Discover communities, share your interests,
                        and join conversations with people who
                        understand what you love.
                    </p>

                    <div className="hero-buttons">
                        <Link to="/register" className="get-started-btn">
                            Get Started
                        </Link>

                        <Link to="/login" className="explore-btn">
                            I already have an account
                        </Link>
                    </div>
                </div>

                {/* Decorative Visual */}
                <div className="hero-visual">

                    <div className="visual-circle">
                        <img src="/frisset.jpg" alt="Creddit logo" />
                    </div>

                    <div className="floating-card card-one">
                        <span>💻</span>
                        <div>
                            <strong>Technology</strong>
                            <small>Explore what's new</small>
                        </div>
                    </div>

                    <div className="floating-card card-two">
                        <span>🎮</span>
                        <div>
                            <strong>Gaming</strong>
                            <small>Play. Discuss. Connect.</small>
                        </div>
                    </div>

                    <div className="floating-card card-three">
                        <span>🚀</span>
                        <div>
                            <strong>Discover</strong>
                            <small>Something interesting</small>
                        </div>
                    </div>

                </div>

            </section>


            {/* Communities Section */}
            <section className="communities-section">

                <div className="section-heading">
                    <span>EXPLORE YOUR INTERESTS</span>

                    <h2>
                        There's a community for everyone.
                    </h2>

                    <p>
                        Whatever you're passionate about,
                        there's a place for you on Creddit.
                    </p>
                </div>


                <div className="community-grid">

                    <div className="community-card">
                        <span className="community-icon">💻</span>
                        <h3>Technology</h3>
                        <p>
                            Discuss programming, AI, gadgets,
                            and the latest innovations.
                        </p>
                    </div>

                    <div className="community-card">
                        <span className="community-icon">🎮</span>
                        <h3>Gaming</h3>
                        <p>
                            Share your favorite games,
                            experiences, and gaming news.
                        </p>
                    </div>

                    <div className="community-card">
                        <span className="community-icon">⚽</span>
                        <h3>Sports</h3>
                        <p>
                            Talk about your favorite teams,
                            players, and competitions.
                        </p>
                    </div>

                    <div className="community-card">
                        <span className="community-icon">🎬</span>
                        <h3>Entertainment</h3>
                        <p>
                            Discover movies, series,
                            music, and more.
                        </p>
                    </div>

                </div>

            </section>


            {/* Join Section */}
            <section className="join-section">

                <h2>
                    Your community is waiting.
                </h2>

                <p>
                    Join Creddit and become part of the conversation.
                </p>

                <Link to="/register" className="get-started-btn">
                    Join Creddit
                </Link>

            </section>

        </div>
    );
}

export default Home;
