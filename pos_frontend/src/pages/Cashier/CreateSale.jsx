import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { getProducts } from '../../api/productApi';
import { createSale } from '../../api/saleApi';
import './CreateSale.css';

const CreateSale = () => {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getProducts()
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  // Search suggestions
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setSuggestions(
      products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    );
  }, [query, products]);

  const addToBill = (product) => {
    setError('');
    setQuery('');
    setSuggestions([]);

    setBillItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + (i.unitType === 'KG' ? 0.5 : 1) }
            : i
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          unitType: product.unitType,
          quantity: product.unitType === 'KG' ? 0.5 : 1
        }
      ];
    });
  };

  const updateQuantity = (index, value) => {
    setBillItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: value } : item
      )
    );
  };

  const removeItem = (index) => {
    setBillItems(prev => prev.filter((_, i) => i !== index));
  };

  const total = billItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  ).toFixed(2);

  const submitSale = () => {
    setError('');
    setMessage('');

    if (billItems.length === 0) {
      setError('No items added to the bill');
      return;
    }

    const payload = {
      items: billItems.map(i => ({
        productId: i.productId,
        quantity: i.quantity
      }))
    };

    createSale(payload)
      .then(res => {
        setMessage(`Sale completed successfully! Invoice: ${res.data.invoiceNumber}`);
        setBillItems([]);
        setTimeout(() => setMessage(''), 5000);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Sale failed');
      });
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-content">
        <Sidebar />

        <div className="dashboard-main">
          <div className="page-header">
            <div>
              <h1>Create Sale</h1>
              <p className="page-subtitle">Process customer purchases</p>
            </div>
            <div className="header-stats">
              <div className="stat-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span>{billItems.length} Items</span>
              </div>
            </div>
          </div>

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

          {message && (
            <div className="alert alert-success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{message}</span>
            </div>
          )}

          <div className="content-card">
            <div className="card-header">
              <h3>Search & Add Products</h3>
            </div>
            <div className="search-container">
              <div className="search-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search products by name..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="search-input"
                />
                {query && (
                  <button 
                    className="clear-search"
                    onClick={() => {
                      setQuery('');
                      setSuggestions([]);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>

              {suggestions.length > 0 && (
                <div className="suggestions">
                  {suggestions.map(p => (
                    <div
                      key={p.id}
                      className="suggestion-item"
                      onClick={() => addToBill(p)}
                    >
                      <div className="suggestion-info">
                        <span className="suggestion-name">{p.name}</span>
                        <span className="suggestion-category">{p.category?.name || 'Uncategorized'}</span>
                      </div>
                      <div className="suggestion-price">
                        <span className="price">Rs. {p.price.toFixed(2)}</span>
                        <span className="unit">/ {p.unitType === 'KG' ? 'kg' : 'unit'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="content-card">
            <div className="card-header">
              <h3>Bill Items</h3>
            </div>
            
            {billItems.length === 0 ? (
              <div className="empty-bill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <p>No items in the bill</p>
                <span>Search and add products to start billing</span>
              </div>
            ) : (
              <>
                <div className="table-container">
                  <table className="bill-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billItems.map((item, index) => (
                        <tr key={index}>
                          <td className="product-name">{item.name}</td>
                          <td className="quantity-cell">
                            <input
                              type="number"
                              step={item.unitType === 'KG' ? '0.01' : '1'}
                              min={item.unitType === 'KG' ? '0.01' : '1'}
                              value={item.quantity}
                              onChange={e =>
                                updateQuantity(index, parseFloat(e.target.value))
                              }
                              className="quantity-input"
                            />
                          </td>
                          <td className="unit-cell">
                            <span className="unit-badge">{item.unitType}</span>
                          </td>
                          <td className="price-cell">Rs. {item.price.toFixed(2)}</td>
                          <td className="total-cell">Rs. {(item.price * item.quantity).toFixed(2)}</td>
                          <td className="action-cell">
                            <button onClick={() => removeItem(index)} className="remove-btn" title="Remove">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bill-footer">
                  <div className="total-section">
                    <span className="total-label">Grand Total</span>
                    <span className="total-amount">Rs. {total}</span>
                  </div>
                  <button className="submit-btn" onClick={submitSale}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Complete Sale
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSale;