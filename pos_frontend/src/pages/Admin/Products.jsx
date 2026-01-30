import React, { useState, useEffect } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../../api/productApi';
import { getCategories } from '../../api/categoryApi';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    categoryId: '',
    unitType: 'UNIT'
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const fetchProducts = () =>
    getProducts().then(res => setProducts(res.data));

  const fetchCategories = () =>
    getCategories().then(res => setCategories(res.data));

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseFloat(form.stock)
    };

    const action = editId
      ? updateProduct(editId, payload)
      : createProduct(payload);

    action
      .then(() => {
        setEditId(null);
        setForm({
          name: '',
          price: '',
          stock: '',
          categoryId: '',
          unitType: 'UNIT'
        });
        fetchProducts();
      })
      .catch(err => {
        setError(
          err.response?.data?.message ||
          'Operation failed'
        );
      });
  };

  const handleEdit = (prod) => {
    setEditId(prod.id);
    setForm({
      name: prod.name,
      price: prod.price,
      stock: prod.stock,
      categoryId: prod.category.id,
      unitType: prod.unitType
    });
    setError('');
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    deleteProduct(id)
      .then(fetchProducts)
      .catch(err => {
        setError(
          err.response?.data?.message ||
          'Cannot delete product'
        );
      });
  };

  const handleCancel = () => {
    setEditId(null);
    setForm({
      name: '',
      price: '',
      stock: '',
      categoryId: '',
      unitType: 'UNIT'
    });
    setError('');
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-content">
        <Sidebar />
        <div className="dashboard-main">

          <div className="page-header">
            <div>
              <h1>Products</h1>
              <p className="page-subtitle">
                Manage your inventory and pricing
              </p>
            </div>
            <div className="header-stats">
              <div className="stat-badge">
                <span>{products.length} Products</span>
              </div>
            </div>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <div className="content-card">
            <div className="card-header">
              <h3>{editId ? 'Edit Product' : 'Add New Product'}</h3>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e =>
                      setForm({ ...form, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={form.categoryId}
                    onChange={e =>
                      setForm({ ...form, categoryId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Unit Type</label>
                  <select
                    value={form.unitType}
                    onChange={e =>
                      setForm({ ...form, unitType: e.target.value })
                    }
                  >
                    <option value="UNIT">Per Unit</option>
                    <option value="KG">Per Kilogram</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Price (Rs / {form.unitType === 'KG' ? 'kg' : 'unit'})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={e =>
                      setForm({ ...form, price: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Stock ({form.unitType === 'KG' ? 'Kg' : 'Units'})
                  </label>
                  <input
                    type="number"
                    step={form.unitType === 'KG' ? '0.01' : '1'}
                    value={form.stock}
                    onChange={e =>
                      setForm({ ...form, stock: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editId ? 'Update Product' : 'Add Product'}
                </button>

                {editId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="content-card">
            <div className="card-header">
              <h3>All Products</h3>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Unit</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-state">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    products.map(p => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.name}</td>
                        <td>
                          Rs. {parseFloat(p.price).toFixed(2)} /
                          {p.unitType === 'KG' ? 'kg' : 'unit'}
                        </td>
                        <td>
                          {p.stock} {p.unitType === 'KG' ? 'kg' : 'units'}
                        </td>
                        <td>{p.unitType}</td>
                        <td>{p.category.name}</td>
                        <td>
                          <button
                            className="btn-edit"
                            onClick={() => handleEdit(p)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(p.id)}
                          >
                            Delete
                          </button>
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

export default Products;
