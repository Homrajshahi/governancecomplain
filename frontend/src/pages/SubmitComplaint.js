import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import './SubmitComplaint.css';

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', category: '', description: '' });
  const [locations, setLocations] = useState({ provinces: [], districts: {}, offices: {} });
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('');
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableOffices, setAvailableOffices] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState('');
  const [role, setRole] = useState('user');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) navigate('/login');
    loadProfile();
    loadLocations();
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

  const loadLocations = async () => {
    try {
      const { data } = await api.get('locations/');
      setLocations(data);
    } catch (err) {
      setError('Unable to load locations. Please refresh.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
    setSelectedDistrict('');
    setSelectedOffice('');
    const nextDistricts = value ? locations.districts?.[value] || [] : [];
    setAvailableDistricts(nextDistricts);
    setAvailableOffices([]);
  };

  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);
    setSelectedOffice('');
    const nextOffices = value ? (locations.offices?.[selectedProvince]?.[value] || []) : [];
    setAvailableOffices(nextOffices);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!selectedProvince || !selectedDistrict || !selectedOffice) {
      setError('Please select province, district, and office.');
      setLoading(false);
      return;
    }

    try {
      await api.post('complaints/', {
        ...formData,
        province: selectedProvince,
        district: selectedDistrict,
        office: selectedOffice,
      });
      setSuccess('Complaint submitted successfully!');
      setFormData({ title: '', category: '', description: '' });
      setSelectedProvince('');
      setSelectedDistrict('');
      setSelectedOffice('');
      setAvailableDistricts([]);
      setAvailableOffices([]);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-logo">📋 DCMS<span className="sub-text">Digital Complaint Management</span></div>
        <nav className="dashboard-nav">
          <Link to="/dashboard" className="nav-item">Dashboard</Link>
          <Link to="/submit" className="nav-item active">Submit Complaint</Link>
          <Link to="/track" className="nav-item">Track Complaints</Link>
        </nav>
        <div className="user-info">
          <span>{user}</span>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="back-link">
          <Link to="/dashboard">← Back to Dashboard</Link>
        </div>

        <section className="submit-form-section">
          <div className="form-container">
            <h2>Submit New Complaint</h2>
            <p className="form-subtitle">Fill out the form below to submit your complaint. Our team will review and respond accordingly.</p>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit} className="complaint-form">
              <label>
                <span className="label-text">Complaint Title *</span>
                <input
                  type="text"
                  name="title"
                  placeholder="Brief description of the issue"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                <span className="label-text">Category *</span>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Water">Water</option>
                  <option value="College">College / Education</option>
                  <option value="Road">Road / Transportation</option>
                  <option value="Health">Health</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <div className="location-grid">
                <label>
                  <span className="label-text">Province *</span>
                  <select
                    name="province"
                    value={selectedProvince}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    required
                  >
                    <option value="">Select province</option>
                    {locations.provinces?.map((province) => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="label-text">District *</span>
                  <select
                    name="district"
                    value={selectedDistrict}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    required
                    disabled={!selectedProvince}
                  >
                    <option value="">{selectedProvince ? 'Select district' : 'Choose province first'}</option>
                    {availableDistricts.map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="label-text">Office / Department *</span>
                  <select
                    name="office"
                    value={selectedOffice}
                    onChange={(e) => setSelectedOffice(e.target.value)}
                    required
                    disabled={!selectedDistrict}
                  >
                    <option value="">{selectedDistrict ? 'Select office' : 'Choose district first'}</option>
                    {availableOffices.map((office) => (
                      <option key={office} value={office}>{office}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                <span className="label-text">Description *</span>
                <textarea
                  name="description"
                  placeholder="Provide detailed information about your complaint..."
                  rows="6"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </label>

              <p className="form-note">Please include as much detail as possible to help us address your concern effectively.</p>

              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Complaint'}
                </button>
                <button type="button" className="btn-cancel" onClick={() => navigate('/dashboard')}>
                  Cancel
                </button>
              </div>
            </form>

            <div className="info-box">
              <h4>What happens next?</h4>
              <ul>
                <li>Your complaint will be reviewed by the concerned department</li>
                <li>You will receive updates as the status changes</li>
                <li>Track your complaint progress from the dashboard</li>
                <li>Average response time: 2-3 business days</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
