import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { getMySales, getReceipt } from '../../api/saleApi';
import ReceiptView from '../../components/ReceiptView';
import './MySales.css';

const MySales = () => {
  const [sales, setSales] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const viewReceipt = async (saleId) => {
    const res = await getReceipt(saleId);
    setSelectedReceipt(res.data);
  };

  const closeReceipt = () => {
    setSelectedReceipt(null);
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-content">
        <Sidebar />
        <div className="dashboard-main">
          <div className="page-header">
            <div>
              <h1>My Sales</h1>
              <p className="page-subtitle">View your transaction history</p>
            </div>
            <div className="header-stats">
              <div className="stat-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span>{sales.length} Sales</span>
              </div>
              <div className="stat-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span>Rs. {totalRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading sales...</p>
            </div>
          ) : (
            <div className="content-card">
              <div className="card-header">
                <h3>Sales History</h3>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invoice Number</th>
                      <th>Date & Time</th>
                      <th>Total Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="empty-state">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                          </svg>
                          <p>No sales found. Start creating sales to see them here.</p>
                        </td>
                      </tr>
                    ) : (
                      sales.map(sale => (
                        <tr key={sale.id}>
                          <td className="invoice-cell">
                            <span className="invoice-badge">#{sale.invoiceNumber}</span>
                          </td>
                          <td className="date-cell">
                            <div className="date-time">
                              <span className="date">
                                {new Date(sale.timestamp).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                              <span className="time">
                                {new Date(sale.timestamp).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="amount-cell">
                            Rs. {sale.totalAmount.toFixed(2)}
                          </td>
                          <td className="action-cell">
                            <button 
                              onClick={() => viewReceipt(sale.id)}
                              className="view-btn"
                              title="View Receipt"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              View Receipt
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedReceipt && (
            <div className="receipt-modal-overlay" onClick={closeReceipt}>
              <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal" onClick={closeReceipt}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                <ReceiptView receipt={selectedReceipt} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MySales;