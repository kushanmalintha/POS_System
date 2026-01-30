import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

import AdminDashboard from './pages/Admin/Dashboard';
import Users from './pages/Admin/Users';
import Categories from './pages/Admin/Categories';
import Products from './pages/Admin/Products';

import CashierDashboard from './pages/Cashier/Dashboard';
import CreateSale from './pages/Cashier/CreateSale';
import MySales from './pages/Cashier/MySales';

import { AuthContext } from './context/AuthContext';

function App() {
  const { user } = useContext(AuthContext);

  const PrivateRoute = ({ children, roles }) => {
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
    return children;
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* ADMIN ROUTES */}
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute roles={['ADMIN']}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <PrivateRoute roles={['ADMIN']}>
            <Users />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <PrivateRoute roles={['ADMIN']}>
            <Categories />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <PrivateRoute roles={['ADMIN']}>
            <Products />
          </PrivateRoute>
        }
      />

      {/* CASHIER ROUTES */}
      <Route
        path="/cashier/dashboard"
        element={
          <PrivateRoute roles={['CASHIER']}>
            <CashierDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/cashier/create-sale"
        element={
          <PrivateRoute roles={['CASHIER']}>
            <CreateSale />
          </PrivateRoute>
        }
      />
      <Route
        path="/cashier/my-sales"
        element={
          <PrivateRoute roles={['CASHIER']}>
            <MySales />
          </PrivateRoute>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
