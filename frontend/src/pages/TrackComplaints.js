import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import './TrackComplaints.css';

export default function TrackComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState('');
  const [role, setRole] = useState('user');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) navigate('/login');
    loadProfile();
    loadComplaints();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      const { data } = await api.get('me/');
      const displayName = (data.full_name && data.full_name.trim()) || data.email;
      setUser(displayName);
      setRole(data.role || 'user');
    } catch (err) {
      setUser(localStorage.getItem('user') || 'User');
    }
  };

  const loadComplaints = async () => {
    try {
      const { data } = await api.get('complaints/');
      setComplaints(data);
      setFilteredComplaints(data);
    } catch (err) {
      console.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    if (status === 'All Statuses') {
      setFilteredComplaints(complaints);
    } else {
      setFilteredComplaints(complaints.filter(c => c.status === status));
    }
  };

  const getProgressPercentage = (status) => {
    switch (status) {
      case 'Pending':
        return 33;
      case 'In Progress':
        return 66;
      case 'Resolved':
        return 100;
      case 'Rejected':
        return 100;
      default:
        return 0;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'pending';
      case 'In Progress':
        return 'in-progress';
      case 'Resolved':
        return 'resolved';
      case 'Rejected':
        return 'rejected';
      default:
        return 'default';
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-logo">📋 DCMS<span className="sub-text">Digital Complaint Management</span></div>
        <nav className="dashboard-nav">
          <Link to="/dashboard" className="nav-item">Dashboard</Link>
          <Link to="/submit" className="nav-item">Submit Complaint</Link>
          <Link to="/track" className="nav-item active">Track Complaints</Link>
        </nav>
        <div className="user-info">
          <span>{user}</span>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="back-link">
          <Link to="/dashboard">← Back to Dashboard</Link>
        </div>

        <section className="track-section">
          <div className="track-header">
            <div>
              <h2>Track Complaints</h2>
              <p>Monitor the status of all your submitted complaints</p>
            </div>
            <div className="filter-group">
              <label>Filter by Status:</label>
              <select value={filterStatus} onChange={(e) => handleFilterChange(e.target.value)}>
                <option>All Statuses</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Rejected</option>
              </select>
              <span className="showing-count">Showing {filteredComplaints.length} complaint{filteredComplaints.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {loading ? (
            <p className="loading">Loading complaints...</p>
          ) : filteredComplaints.length > 0 ? (
            <div className="complaints-list">
              {filteredComplaints.map(complaint => (
                <div key={complaint.id} className="complaint-card">
                  <div className="complaint-header">
                    <div>
                      <h3>{complaint.title}</h3>
                      <p className="complaint-meta">
                        Category: {complaint.category} • Submitted: {new Date(complaint.created_at).toLocaleDateString()} • ID: #{complaint.id}
                        {complaint.district ? ` • ${complaint.district}, ${complaint.province}` : ''}
                      </p>
                    </div>
                    <span className={`status-badge status-${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </div>

                  <p className="complaint-description">{complaint.description}</p>

                  {complaint.remarks ? (
                    <p className="complaint-remarks"><strong>Remarks:</strong> {complaint.remarks}</p>
                  ) : null}

                  <div className="complaint-progress">
                    <p className="progress-label">Progress: <strong>{getProgressPercentage(complaint.status)}%</strong></p>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${getStatusColor(complaint.status)}`}
                        style={{ width: `${getProgressPercentage(complaint.status)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="status-timeline">
                    <p className="timeline-label">Status Timeline</p>
                    <div className="timeline">
                      <div className={`timeline-step ${complaint.status !== 'Pending' ? 'completed' : 'active'}`}>
                        <div className="timeline-circle">✓</div>
                        <div className="timeline-text">Submitted</div>
                      </div>
                      <div className={`timeline-step ${complaint.status === 'In Progress' ? 'active' : complaint.status === 'Resolved' ? 'completed' : ''}`}>
                        <div className="timeline-circle"></div>
                        <div className="timeline-text">In Progress</div>
                      </div>
                      <div className={`timeline-step ${complaint.status === 'Resolved' ? 'completed' : ''}`}>
                        <div className="timeline-circle"></div>
                        <div className="timeline-text">Resolved</div>
                      </div>
                      <div className={`timeline-step ${complaint.status === 'Rejected' ? 'completed' : ''}`}>
                        <div className="timeline-circle"></div>
                        <div className="timeline-text">Rejected</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <p>No complaints found</p>
              <Link to="/submit" className="btn-primary">Submit Your First Complaint</Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
