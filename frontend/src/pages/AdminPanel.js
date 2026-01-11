import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './Dashboard.css';
import './AdminPanel.css';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('user');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    loadProfile();
    loadComplaints();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      const { data } = await api.get('me/');
      const displayName = (data.full_name && data.full_name.trim()) || data.email;
      setUserName(displayName);
      setRole(data.role || 'user');
      if (!(data.role === 'admin')) {
        navigate('/dashboard');
      }
    } catch (err) {
      navigate('/login');
    }
  };

  const loadComplaints = async () => {
    try {
      const { data } = await api.get('complaints/');
      setComplaints(data);
    } catch (err) {
      setError('Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  const allowedActions = (status) => {
    if (status === 'Pending') return ['In Progress', 'Rejected'];
    if (status === 'In Progress') return ['Resolved'];
    return [];
  };

  const handleStatusUpdate = async (complaintId, nextStatus) => {
    if (!nextStatus) return;
    setStatusMessage('');
    setError('');
    
    try {
      await api.patch(`complaints/${complaintId}/`, {
        status: nextStatus,
        remarks: remarks || '',
      });
      setStatusMessage('✅ Status updated successfully');
      setSelectedComplaint(null);
      setRemarks('');
      await loadComplaints();
    } catch (err) {
      setError('❌ ' + (err?.response?.data?.detail || 'Update failed'));
    }
  };

  const filteredComplaints = complaints.filter((c) =>
    filterStatus === 'All' ? true : c.status === filterStatus
  );

  if (loading) {
    return (
      <div className="dashboard">
        <main className="dashboard-content"><p>Loading...</p></main>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-logo">📋 DCMS<span className="sub-text">Admin</span></div>
        <nav className="dashboard-nav">
          <Link to="/dashboard" className="nav-item">Dashboard</Link>
          <Link to="/admin" className="nav-item active">Admin Panel</Link>
        </nav>
        <div className="user-info">
          <span>{userName}</span>
          <span className="role-pill">{role}</span>
        </div>
      </header>

      <main className="dashboard-content admin-panel">
        <div className="back-link">
          <Link to="/dashboard">← Back to Dashboard</Link>
        </div>

        {!selectedComplaint ? (
          <>
            <section className="panel-header">
              <div>
                <h1>Assigned Complaints</h1>
                <p>Review and manage complaints assigned to your office.</p>
              </div>
              <div className="filter-group">
                <label>Filter</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </section>

            {error && <div className="error-message">{error}</div>}

            {filteredComplaints.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>No complaints assigned to your office yet.</p>
              </div>
            ) : (
              <div className="complaint-list-admin">
                {filteredComplaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="complaint-item-admin"
                    onClick={() => {
                      setSelectedComplaint(complaint);
                      setRemarks(complaint.remarks || '');
                    }}
                  >
                    <div className="complaint-item-header">
                      <div>
                        <h3>{complaint.title}</h3>
                        <p className="complaint-item-meta">
                          #{complaint.id} • {complaint.category} • {new Date(complaint.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`status-badge status-${complaint.status.toLowerCase().replace(' ', '-')}`}>
                        {complaint.status}
                      </span>
                    </div>
                    <p className="complaint-item-description">{complaint.description.substring(0, 100)}...</p>
                    <p className="complaint-item-user">Submitted by: <strong>{complaint.user}</strong></p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="complaint-detail-admin">
            <button className="btn-back-detail" onClick={() => setSelectedComplaint(null)}>
              ← Back to List
            </button>

            <div className="detail-card">
              <div className="detail-header">
                <div>
                  <h1>{selectedComplaint.title}</h1>
                  <p className="detail-meta">
                    ID: #{selectedComplaint.id} • Category: {selectedComplaint.category}
                  </p>
                  <p className="detail-location">
                    📍 {selectedComplaint.office}, {selectedComplaint.district}
                  </p>
                </div>
                <span className={`status-badge status-${selectedComplaint.status.toLowerCase().replace(' ', '-')}`}>
                  {selectedComplaint.status}
                </span>
              </div>

              <div className="detail-section">
                <h3>Description</h3>
                <p>{selectedComplaint.description}</p>
              </div>

              <div className="detail-section">
                <h3>Submitted by</h3>
                <p><strong>{selectedComplaint.user}</strong></p>
                <p className="detail-meta">Date: {new Date(selectedComplaint.created_at).toLocaleString()}</p>
              </div>

              {selectedComplaint.remarks && (
                <div className="detail-section">
                  <h3>Current Remarks</h3>
                  <p className="remarks-box">{selectedComplaint.remarks}</p>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}
              {statusMessage && <div className="success-message">{statusMessage}</div>}

              <div className="detail-section">
                <h3>Action: Update Status</h3>
                <textarea
                  placeholder="Add remarks or resolution notes..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows="4"
                />
              </div>

              <div className="action-buttons-detail">
                {allowedActions(selectedComplaint.status).map((nextStatus) => (
                  <button
                    key={nextStatus}
                    className={`btn-action-detail btn-${nextStatus.toLowerCase().replace(' ', '-')}`}
                    onClick={() => handleStatusUpdate(selectedComplaint.id, nextStatus)}
                  >
                    Mark as {nextStatus}
                  </button>
                ))}
                {allowedActions(selectedComplaint.status).length === 0 && (
                  <p className="no-actions">No further actions available for this complaint.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
