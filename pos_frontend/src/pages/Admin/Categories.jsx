import React, { useState, useEffect } from 'react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../../api/categoryApi';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const fetchCategories = () => {
    getCategories()
      .then(res => setCategories(res.data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (editId) {
      updateCategory(editId, { name })
        .then(() => {
          setEditId(null);
          setName('');
          fetchCategories();
        })
        .catch(err => {
          setError(err.response?.data?.message || 'Failed to update category');
        });
    } else {
      createCategory({ name })
        .then(() => {
          setName('');
          fetchCategories();
        })
        .catch(err => {
          setError(err.response?.data?.message || 'Failed to create category');
        });
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat.id);
    setName(cat.name);
    setError('');
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    deleteCategory(id)
      .then(() => {
        setError('');
        fetchCategories();
      })
      .catch(err => {
        const message =
          err.response?.data?.message ||
          'Cannot delete category. Products exist under this category.';
        setError(message);
      });
  };

  const handleCancel = () => {
    setEditId(null);
    setName('');
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
              <h1>Categories</h1>
              <p className="page-subtitle">Manage product categories</p>
            </div>
            <div className="header-stats">
              <div className="stat-badge">
                <span>{categories.length} Categories</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          <div className="content-card">
            <div className="card-header">
              <h3>{editId ? 'Edit Category' : 'Add New Category'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  placeholder="Enter category name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editId ? 'Update Category' : 'Add Category'}
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
              <h3>All Categories</h3>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Category Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="empty-state">
                        No categories found
                      </td>
                    </tr>
                  ) : (
                    categories.map(cat => (
                      <tr key={cat.id}>
                        <td>{cat.id}</td>
                        <td>{cat.name}</td>
                        <td>
                          <button
                            onClick={() => handleEdit(cat)}
                            className="btn-edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="btn-delete"
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

export default Categories;
