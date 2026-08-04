import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    if (!allowedRoles.includes(decoded.role)) {
      return <Navigate to="/no-encontrado" replace />;
    }

    return children;
  } catch (error) {
    console.error("Token inválido", error);
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;
