import React, { useState, useEffect } from 'react';
import { getAllUsers, createUser } from '../../api/userApi';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import './Users.css';

const Users = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cashiers, setCashiers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = () => {
    getAllUsers()
      .then(res => setCashiers(res.data.filter(u => u.role === 'CASHIER')))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUser({ username, password, role: 'CASHIER' });
      setUsername('');
      setPassword('');
      setError('');
      setSuccess('Cashier created successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating cashier');
      setSuccess('');
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-content">
        <Sidebar />
        <div className="dashboard-main">
          <div className="page-header">
            <div>
              <h1>Manage Cashiers</h1>
              <p className="page-subtitle">Create and view cashier accounts</p>
            </div>
            <div className="header-stats">
              <div className="stat-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>{cashiers.length} Cashiers</span>
              </div>
            </div>
          </div>

          <div className="content-card">
            <div className="card-header">
              <h3>Add New Cashier</h3>
            </div>
            <form onSubmit={handleSubmit} className="user-form">
              {error && (
                <div className="alert alert-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="alert alert-success">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{success}</span>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cashierUsername">Username</label>
                  <div className="input-with-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input 
                      id="cashierUsername"
                      type="text" 
                      placeholder="Enter cashier username" 
                      value={username} 
                      onChange={e => setUsername(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="cashierPassword">Password</label>
                  <div className="input-with-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input 
                      id="cashierPassword"
                      type="password" 
                      placeholder="Enter password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  Add Cashier
                </button>
              </div>
            </form>
          </div>

          <div className="content-card">
            <div className="card-header">
              <h3>All Cashiers</h3>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cashiers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <p>No cashiers found. Add your first cashier above.</p>
                      </td>
                    </tr>
                  ) : (
                    cashiers.map(c => (
                      <tr key={c.id}>
                        <td className="id-cell">{c.id}</td>
                        <td className="username-cell">
                          <div className="user-info-cell">
                            <div className="user-avatar-small">
                              {c.username.charAt(0).toUpperCase()}
                            </div>
                            <span>{c.username}</span>
                          </div>
                        </td>
                        <td className="role-cell">
                          <span className="role-badge">Cashier</span>
                        </td>
                        <td className="status-cell">
                          <span className="status-badge active">
                            <span className="status-dot"></span>
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;