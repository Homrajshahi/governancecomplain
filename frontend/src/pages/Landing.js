import { useNavigate } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-logo">
          <span className="logo-icon">📋</span> DCMS
        </div>
        <nav className="landing-nav">
          <button className="btn-login" onClick={() => navigate('/login')}>Login</button>
          <button className="btn-register" onClick={() => navigate('/register')}>Register</button>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="hero-content">
          <h1>Digital Complaint Management System</h1>
          <p className="hero-subtitle">
            Submit and track your complaints online with ease. A transparent and efficient platform for citizens to raise concerns and authorities to respond promptly.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/register')}>Get Started</button>
            <button className="btn-secondary" onClick={() => navigate('/login')}>Sign In</button>
          </div>
        </div>
        <div className="hero-image">
          <div className="image-placeholder">📊</div>
        </div>
      </section>

      <section className="landing-features">
        <h2>How It Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Submit Complaint</h3>
            <p>Easily submit your complaints through our user-friendly online form. Provide details and attach relevant information.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h3>Track Progress</h3>
            <p>Monitor the status of your complaints in real-time. Get updates as authorities work on resolving your issues.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Get Resolution</h3>
            <p>Receive timely responses and solutions from the concerned authorities. Track resolution history for transparency.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© 2026 Digital Complaint Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}
