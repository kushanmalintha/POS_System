import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { getCategories } from '../../api/categoryApi';
import { getProducts } from '../../api/productApi';
import { getAllUsers } from '../../api/userApi';
import { getAllSales } from '../../api/saleApi';
import './Dashboard.css';

const AdminDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    getCategories().then(res => setCategories(res.data)).catch(err => console.log(err));
    getProducts().then(res => setProducts(res.data)).catch(err => console.log(err));
    getAllUsers().then(res => setUsers(res.data)).catch(err => console.log(err));
    getAllSales().then(res => setSales(res.data)).catch(err => console.log(err));
  }, []);

  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-content">
        <Sidebar />
        <div className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <h1>Admin Dashboard</h1>
              <p className="dashboard-subtitle">Welcome back! Here's your store overview</p>
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

          <div className="stats-grid">
            <div className="stat-card revenue">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Total Revenue</p>
                <h2 className="stat-value">Rs. {totalRevenue.toFixed(2)}</h2>
                <span className="stat-badge">All time</span>
              </div>
            </div>

            <div className="stat-card sales">
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
                <span className="stat-badge">Transactions</span>
              </div>
            </div>

            <div className="stat-card products">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Products</p>
                <h2 className="stat-value">{products.length}</h2>
                <span className="stat-badge">{categories.length} Categories</span>
              </div>
            </div>

            <div className="stat-card users">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Team Members</p>
                <h2 className="stat-value">{users.length}</h2>
                <span className="stat-badge">Active users</span>
              </div>
            </div>
          </div>

          <div className="quick-info">
            <div className="info-section">
              <h3>Quick Stats</h3>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-dot revenue-dot"></span>
                  <span>Average Sale: Rs. {sales.length > 0 ? (totalRevenue / sales.length).toFixed(2) : '0.00'}</span>
                </div>
                <div className="info-item">
                  <span className="info-dot products-dot"></span>
                  <span>Products per Category: {categories.length > 0 ? Math.round(products.length / categories.length) : 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;