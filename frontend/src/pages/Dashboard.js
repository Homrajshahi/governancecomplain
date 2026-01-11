import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [role, setRole] = useState('user');
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    loadUser();
    loadComplaints();
  }, [navigate]);

  const loadUser = async () => {
    try {
      const { data } = await api.get('me/');
      const displayName = (data.full_name && data.full_name.trim()) || data.email;
      setUser(displayName);
      setRole(data.role || 'user');
    } catch (err) {
      setUser('User');
    }
  };

  const loadComplaints = async () => {
    try {
      const { data } = await api.get('complaints/');
      setComplaints(data.slice(0, 5));
      
      // Calculate stats
      const total = data.length;
      const pending = data.filter(c => c.status === 'Pending').length;
      const inProgress = data.filter(c => c.status === 'In Progress').length;
      const resolved = data.filter(c => c.status === 'Resolved').length;
      const rejected = data.filter(c => c.status === 'Rejected').length;
      
      setStats({ total, pending, inProgress, resolved, rejected });
    } catch (err) {
      console.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-logo">📋 DCMS<span className="sub-text">Digital Complaint Management</span></div>
        <nav className="dashboard-nav">
          <Link to="/dashboard" className="nav-item active">Dashboard</Link>
          {role === 'user' && (
            <>
              <Link to="/submit" className="nav-item">Submit Complaint</Link>
              <Link to="/track" className="nav-item">Track Complaints</Link>
            </>
          )}
          {role === 'admin' && (
            <Link to="/admin" className="nav-item">Admin Panel</Link>
          )}
        </nav>
        <div className="user-info">
          <span>{user}</span>
          <select defaultValue="user" onChange={(e) => {
            if (e.target.value === 'logout') handleLogout();
          }}>
            <option value="user">User</option>
            <option value="logout">Logout</option>
          </select>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="welcome-section">
          <h1>Welcome, {user}</h1>
          <p>Manage and track your complaints from your dashboard</p>
        </section>

        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-icon total">📋</div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Total Complaints</p>
              <small>All time</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">⏳</div>
            <div className="stat-info">
              <h3>{stats.pending}</h3>
              <p>Pending</p>
              <small>Awaiting review</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon inprogress">🔄</div>
            <div className="stat-info">
              <h3>{stats.inProgress}</h3>
              <p>In Progress</p>
              <small>Being processed</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon resolved">✅</div>
            <div className="stat-info">
              <h3>{stats.resolved}</h3>
              <p>Resolved</p>
              <small>Completed</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon rejected">❌</div>
            <div className="stat-info">
              <h3>{stats.rejected}</h3>
              <p>Rejected</p>
              <small>Declined by admin</small>
            </div>
          </div>
        </section>

        <section className="action-section">
          <Link to="/submit" className="btn-action btn-primary">+ Submit New Complaint</Link>
        </section>

        <section className="complaints-section">
          <div className="complaints-header">
            <h2>Recent Complaints</h2>
          </div>

          {loading ? (
            <p className="loading">Loading complaints...</p>
          ) : complaints.length > 0 ? (
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(complaint => (
                  <tr key={complaint.id}>
                    <td className="title-cell">{complaint.title}</td>
                    <td>{complaint.category}</td>
                    <td>{complaint.district ? `${complaint.district}, ${complaint.province}` : '—'}</td>
                    <td>{new Date(complaint.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge status-${complaint.status.toLowerCase().replace(' ', '-')}`}>
                        {complaint.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <p>No complaints submitted yet</p>
              <Link to="/submit" className="btn-primary">Submit Your First Complaint</Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
