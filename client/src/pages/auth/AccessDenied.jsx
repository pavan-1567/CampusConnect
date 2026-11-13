import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AccessDenied = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="card shadow-sm border-0 text-center p-4 p-md-5">
      <div className="mb-4">
        <div
          className="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle"
          style={{ width: '80px', height: '80px' }}
        >
          <i className="bi bi-shield-x fs-1"></i>
        </div>
      </div>

      <h3 className="fw-bold text-navy mb-2">403 – Access Denied</h3>
      <p className="text-muted mb-4">
        You do not have the necessary permissions to access this administrative section. All actions are logged and audited.
      </p>

      <div>
        <Link
          to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
          className="btn btn-primary px-4 fw-semibold"
        >
          <i className="bi bi-house-door me-2"></i>
          Return to Your Dashboard
        </Link>
      </div>
    </div>
  );
};

export default AccessDenied;

