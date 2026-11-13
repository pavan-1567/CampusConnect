import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RoleRoute = ({ requiredRole }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user.role !== requiredRole) {
    return <Navigate to="/auth/access-denied" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;

