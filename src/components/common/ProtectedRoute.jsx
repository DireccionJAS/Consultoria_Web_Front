import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import MobileNavMenu from './MobileNavMenu.jsx';
import FloatingHomeButton from './FloatingHomeButton.jsx';
import NotificationBell from './NotificationBell.jsx';
import styles from './../../styles/ProtectedRoute.module.css';

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

    return (
      <>
        {children}
        <MobileNavMenu role={decoded.role} />
        <FloatingHomeButton role={decoded.role} />
        {decoded.role === 'USER' && (
          <div className={styles.clienteBellWrap}>
            <NotificationBell />
          </div>
        )}
      </>
    );
  } catch (error) {
    console.error("Token inválido", error);
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;
