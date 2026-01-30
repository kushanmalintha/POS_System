import React, { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { login as loginApi } from '../api/authApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const decoded = jwtDecode(token);
    return {
      username: decoded.sub,
      role: decoded.role
    };
  });

  const login = async (username, password) => {
    const response = await loginApi(username, password);

    //console.log('Received token:', response);

    const token = response.token;

    //console.log('Clean token:', token);

    try {
      const decoded = jwtDecode(token);

      //console.log('Decoded JWT:', decoded);

      setUser({
        username: decoded.sub,
        role: decoded.role
      });

      localStorage.setItem('token', token);
      //console.log('Username:', decoded.sub);
      //console.log('Userrole:', decoded.role);
      if (decoded.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/cashier/dashboard');
      }

    } catch (err) {
      console.error('JWT decode failed:', err);
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
