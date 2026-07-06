import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { User, Activity, Trash2, Award, Edit2, X, Check } from 'lucide-react';
import './Profile.css';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(',', '');
};

function Profile() {
  const { user, updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', email: '', password: '', avatarSeed: '', bio: '' });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const [confirmModal, setConfirmModal] = useState({ open: false, message: '', onConfirm: null });

  const AVATAR_SEEDS = [
    'felix', 'aneka', 'luna', 'zara', 'nova', 'alex',
    'milo', 'sage', 'river', 'echo', 'pixel', 'ghost'
  ];

  const getAvatarUrl = (seed) =>
    `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed || user?.username || 'default'}`;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchScores = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/scores/me`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          // Data comes sorted by createdAt descending
          setScores(data);
        }
      } catch (error) {
        console.error('Failed to fetch scores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [user, navigate]);

  const showConfirm = (message, onConfirm) => {
    setConfirmModal({ open: true, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmModal({ open: false, message: '', onConfirm: null });
  };

  const doResetAnalytics = async () => {
    closeConfirm();
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/scores/me`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (response.ok) {
        setScores([]);
      }
    } catch (error) {
      console.error('Error deleting analytics:', error);
    }
  };

  const handleResetAnalytics = () => {
    showConfirm(
      'Are you sure you want to reset your analytics? This will permanently delete all your typing test history.',
      doResetAnalytics
    );
  };

  const doDeleteAccount = async () => {
    closeConfirm();
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (response.ok) {
        logout();
        navigate('/login');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Server error occurred while deleting account');
    }
  };

  const handleDeleteAccount = () => {
    showConfirm(
      'Are you sure you want to delete your account? This will permanently delete your profile, stats, and all associated data. This action CANNOT be undone.',
      doDeleteAccount
    );
  };


  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');

    const updateData = { username: editForm.username };
    if (editForm.email) updateData.email = editForm.email;
    if (editForm.password) updateData.password = editForm.password;
    if (editForm.avatarSeed !== undefined) updateData.avatarSeed = editForm.avatarSeed;
    if (editForm.bio !== undefined) updateData.bio = editForm.bio;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        updateUser(data);
        setIsEditing(false);
        setEditForm({ username: '', email: '', password: '', avatarSeed: '', bio: '' });
      } else {
        setEditError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setEditError('Server error occurred');
    } finally {
      setEditLoading(false);
    }
  };

  const startEditing = () => {
    setEditForm({
      username: user.username,
      email: '',
      password: '',
      avatarSeed: user.avatarSeed || '',
      bio: user.bio || ''
    });
    setEditError('');
    setIsEditing(true);
  };

  if (loading) {
    return <div className="profile-container"><div className="loading">Loading...</div></div>;
  }

  // Reverse scores for chronological chart display
  const chartData = [...scores].reverse().map((s, idx) => ({
    name: `Test ${idx + 1}`,
    wpm: s.wpm,
    date: new Date(s.createdAt)
  }));

  const maxWpm = scores.length > 0 ? Math.max(...scores.map(s => s.wpm)) : 0;
  const avgWpm = scores.length > 0 ? (scores.reduce((acc, curr) => acc + curr.wpm, 0) / scores.length).toFixed(1) : 0;
  const testsCompleted = scores.length;

  return (
    <div className="profile-container fade-in">

      {/* Custom Confirm Modal */}
      {confirmModal.open && (
        <div className="confirm-modal-overlay" onClick={closeConfirm}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-icon">⚠️</div>
            <p className="confirm-modal-message">{confirmModal.message}</p>
            <div className="confirm-modal-actions">
              <button className="confirm-btn-danger" onClick={confirmModal.onConfirm}>Yes, delete</button>
              <button className="confirm-btn-cancel" onClick={closeConfirm}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="edit-modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3><Edit2 size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />Edit Profile</h3>
              <button className="edit-modal-close" onClick={() => setIsEditing(false)}><X size={20} /></button>
            </div>
            {editError && <div className="edit-error">{editError}</div>}
            <form className="edit-profile-form" onSubmit={handleEditSubmit}>

              {/* Avatar Picker */}
              <div className="edit-field">
                <label>Profile Avatar</label>
                <div className="avatar-picker">
                  {AVATAR_SEEDS.map((seed) => (
                    <button
                      key={seed}
                      type="button"
                      className={`avatar-option ${editForm.avatarSeed === seed ? 'avatar-selected' : ''}`}
                      onClick={() => setEditForm({ ...editForm, avatarSeed: seed })}
                      disabled={editLoading}
                      title={seed}
                    >
                      <img src={getAvatarUrl(seed)} alt={seed} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="edit-field">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  disabled={editLoading}
                  required
                />
              </div>
              <div className="edit-field">
                <label>Bio <span className="edit-optional">(optional)</span></label>
                <textarea
                  placeholder="Tell us something about yourself..."
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  disabled={editLoading}
                  maxLength={200}
                  rows={3}
                  className="edit-bio-textarea"
                />
                <span className="bio-char-count">{editForm.bio.length}/200</span>
              </div>
              <div className="edit-field">
                <label>Email <span className="edit-optional">(optional)</span></label>
                <input
                  type="email"
                  placeholder="Enter new email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  disabled={editLoading}
                />
              </div>
              <div className="edit-field">
                <label>Password <span className="edit-optional">(optional)</span></label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  disabled={editLoading}
                />
              </div>
              <div className="edit-actions">
                <button type="submit" className="edit-btn-save" disabled={editLoading}>
                  {editLoading ? 'Saving...' : <><Check size={16} /> Save Changes</>}
                </button>
                <button type="button" className="edit-btn-cancel" onClick={() => setIsEditing(false)} disabled={editLoading}>
                  <X size={16} /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-avatar">
            <img
              src={getAvatarUrl(user?.avatarSeed)}
              alt="avatar"
              style={{ width: '100%', height: '100%', borderRadius: '50%' }}
            />
          </div>
          <div className="profile-details">
            <h1>{user?.username}</h1>
            {user?.bio
              ? <p className="profile-bio">{user.bio}</p>
              : <span className="profile-joined">Typing Enthusiast</span>
            }
          </div>
        </div>
        <div className="profile-actions" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button className="btn outline" onClick={startEditing}>
            <Edit2 size={16} style={{ marginRight: '8px' }} /> Edit Profile
          </button>
          <button className="btn outline danger" onClick={handleResetAnalytics}>
            <Trash2 size={16} style={{ marginRight: '8px' }} /> Reset Analytics
          </button>
          <button className="btn outline danger" onClick={handleDeleteAccount}>
            <Trash2 size={16} style={{ marginRight: '8px' }} /> Delete Account
          </button>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <Activity size={24} className="stat-icon" />
          <div className="stat-value">{testsCompleted}</div>
          <div className="stat-label">Tests Completed</div>
        </div>
        <div className="stat-card">
          <Award size={24} className="stat-icon" />
          <div className="stat-value">{maxWpm}</div>
          <div className="stat-label">Highest WPM</div>
        </div>
        <div className="stat-card">
          <Activity size={24} className="stat-icon" />
          <div className="stat-value">{avgWpm}</div>
          <div className="stat-label">Average WPM</div>
        </div>
      </div>

      <div className="analytics-section">
        <h2>WPM Progression</h2>
        {scores.length > 0 ? (
          <div className="chart-wrapper profile-chart">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-color-alt)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--text-color-light)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--bg-color-alt)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-color-light)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--main-color)', borderRadius: '8px', color: 'var(--text-color)' }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0 && payload[0].payload.date) {
                      return formatDate(payload[0].payload.date);
                    }
                    return label;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="wpm"
                  stroke="var(--main-color)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--main-color)', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: 'var(--main-color)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="no-data">No typing tests completed yet.</div>
        )}
      </div>

      <div className="history-section">
        <h2>Recent Tests</h2>
        {scores.length > 0 ? (
          <>
            <div className="table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th className="col-date text-light">Date</th>
                  <th className="col-wpm text-light">WPM</th>
                  <th className="col-acc text-light">Accuracy</th>
                  <th className="col-raw text-light">Raw</th>
                  <th className="col-cons text-light">Consistency</th>
                  <th className="col-lang text-light">Language</th>
                  <th className="col-mode text-light">Mode</th>
                </tr>
              </thead>
              <tbody>
                {scores.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((score) => (
                  <tr key={score._id} className="history-row bg-sub">
                    <td className="col-date">
                      <span className="date-top">{formatDate(score.createdAt).split(',')[0]}</span>
                      <span className="date-bottom text-light">{formatDate(score.createdAt).split(',')[1]}</span>
                    </td>
                    <td className="col-wpm text-main">{score.wpm}</td>
                    <td className="col-acc">{score.accuracy}%</td>
                    <td className="col-raw">{score.raw !== undefined && score.raw !== null ? score.raw : score.wpm}</td>
                    <td className="col-cons">{score.consistency !== undefined && score.consistency !== null ? `${score.consistency}%` : 'N/A'}</td>
                    <td className="col-lang">
                      <span className="lb-lang-badge">{score.language || 'english'}</span>
                    </td>
                    <td className="col-mode">{score.mode} {score.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {scores.length > itemsPerPage && (
            <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              <button 
                className="btn outline" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                style={{ padding: '0.4rem 1rem', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                &larr; Prev
              </button>
              <span className="text-light" style={{ fontSize: '0.9rem' }}>
                Page {currentPage} of {Math.ceil(scores.length / itemsPerPage)}
              </span>
              <button 
                className="btn outline" 
                disabled={currentPage >= Math.ceil(scores.length / itemsPerPage)}
                onClick={() => setCurrentPage(prev => prev + 1)}
                style={{ padding: '0.4rem 1rem', opacity: currentPage >= Math.ceil(scores.length / itemsPerPage) ? 0.5 : 1, cursor: currentPage >= Math.ceil(scores.length / itemsPerPage) ? 'not-allowed' : 'pointer' }}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
        ) : (
          <div className="no-data">Take your first typing test to see history!</div>
        )}
      </div>
    </div>
  );
}

export default Profile;
