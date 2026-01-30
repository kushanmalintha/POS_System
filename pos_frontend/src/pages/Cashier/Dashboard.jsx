import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getMySales } from '../../api/saleApi';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const CashierDashboard = () => {
  const { user } = useContext(AuthContext);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMySales()
      .then(res => {
        setSales(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.timestamp);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  });

  const todayRevenue = todaySales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const averageSale = sales.length > 0 ? totalRevenue / sales.length : 0;

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-content">
        <Sidebar />
        <div className="dashboard-main">
          <div className="cashier-header">
            <div className="welcome-section">
              <h1>Welcome back, {user?.username}! 👋</h1>
              <p className="dashboard-subtitle">Ready to start your shift? Here's your performance overview</p>
            </div>
            <div className="current-date">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your dashboard...</p>
            </div>
          ) : (
            <>
              <div className="stats-grid">
                <div className="stat-card today-sales">
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Today's Revenue</p>
                    <h2 className="stat-value">Rs. {todayRevenue.toFixed(2)}</h2>
                    <span className="stat-badge">{todaySales.length} Transactions</span>
                  </div>
                </div>

                <div className="stat-card total-sales">
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Total Sales</p>
                    <h2 className="stat-value">{sales.length}</h2>
                    <span className="stat-badge">All Time</span>
                  </div>
                </div>

                <div className="stat-card average-sale">
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Average Sale</p>
                    <h2 className="stat-value">Rs. {averageSale.toFixed(2)}</h2>
                    <span className="stat-badge">Per Transaction</span>
                  </div>
                </div>

                <div className="stat-card total-revenue">
                  <div className="stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Total Revenue</p>
                    <h2 className="stat-value">Rs. {totalRevenue.toFixed(2)}</h2>
                    <span className="stat-badge">All Time</span>
                  </div>
                </div>
              </div>

              <div className="action-cards">
                <div className="action-card primary-action" onClick={() => navigate('/cashier/create-sale')}>
                  <div className="action-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </div>
                  <div className="action-content">
                    <h3>Create New Sale</h3>
                    <p>Start a new transaction and process customer purchases</p>
                  </div>
                  <div className="action-arrow">→</div>
                </div>

                <div className="action-card secondary-action" onClick={() => navigate('/cashier/my-sales')}>
                  <div className="action-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div className="action-content">
                    <h3>View My Sales</h3>
                    <p>Review your sales history and transaction details</p>
                  </div>
                  <div className="action-arrow">→</div>
                </div>
              </div>

              {todaySales.length > 0 && (
                <div className="content-card">
                  <div className="card-header">
                    <h3>Recent Transactions Today</h3>
                  </div>
                  <div className="recent-sales-list">
                    {todaySales.slice(0, 5).map(sale => (
                      <div key={sale.id} className="recent-sale-item">
                        <div className="sale-info">
                          <span className="sale-invoice">#{sale.invoiceNumber || sale.id}</span>
                          <span className="sale-time">
                            {new Date(sale.timestamp).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <div className="sale-amount">Rs. {sale.totalAmount.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;