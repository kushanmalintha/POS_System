import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import CashierDashboard from './pages/Cashier/Dashboard';

const PrivateRoute = ({ children, role }) => {
  const { token, role: userRole } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (role && role !== userRole) return <Navigate to="/login" />;
  return children;
};

function RoutesConfig() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin/*"
        element={
          <PrivateRoute role="ADMIN">
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/cashier/*"
        element={
          <PrivateRoute role="CASHIER">
            <CashierDashboard />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default RoutesConfig;
