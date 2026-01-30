import React from 'react';
import { printReceipt } from '../utils/printReceipt';
import './ReceiptView.css';

const ReceiptView = ({ receipt }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    printReceipt();
  };

  return (
    <div className="receipt-view">
      <div className="receipt-paper">
        <div className="receipt-header">
          <div className="shop-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h2 className="shop-name">{receipt.shop.name}</h2>
          <p className="shop-address">{receipt.shop.address}</p>
          <p className="shop-phone">{receipt.shop.phone}</p>
        </div>

        <div className="receipt-divider"></div>

        <div className="receipt-info">
          <div className="info-row">
            <span className="info-label">Invoice:</span>
            <span className="info-value">#{receipt.invoiceNumber}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Date:</span>
            <span className="info-value">
              {new Date(receipt.dateTime).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Time:</span>
            <span className="info-value">
              {new Date(receipt.dateTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Cashier:</span>
            <span className="info-value">{receipt.cashier}</span>
          </div>
        </div>

        <div className="receipt-divider"></div>

        <div className="receipt-items">
          <table className="items-table">
            <thead>
              <tr>
                <th className="item-name-header">Item</th>
                <th className="item-qty-header">Qty</th>
                <th className="item-price-header">Price</th>
                <th className="item-total-header">Total</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item, idx) => (
                <tr key={idx} className="item-row">
                  <td className="item-name">{item.name}</td>
                  <td className="item-qty">{item.qty}</td>
                  <td className="item-price">{parseFloat(item.unitPrice).toFixed(2)}</td>
                  <td className="item-total">{parseFloat(item.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="receipt-divider"></div>

        <div className="receipt-total">
          <div className="total-row">
            <span className="total-label">Total Amount</span>
            <span className="total-amount">Rs. {parseFloat(receipt.totalAmount).toFixed(2)}</span>
          </div>
        </div>

        <div className="receipt-divider"></div>

        <div className="receipt-footer">
          <p className="footer-text">{receipt.footer}</p>
          <div className="footer-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>
      </div>

      <div className="receipt-actions">
        <button className="print-btn" onClick={handlePrint}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Print Receipt
        </button>
      </div>
    </div>
  );
};

export default ReceiptView;