import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-navy py-3 shadow-sm">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center">
            <span
              className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle me-2"
              style={{ width: '38px', height: '38px' }}
            >
              <i className="bi bi-shield-check fs-5"></i>
            </span>
            <div>
              <span className="fw-bold tracking-tight text-white fs-4">CampusConnect</span>
              <span className="d-block text-teal small" style={{ fontSize: '0.75rem', marginTop: '-4px' }}>
                Lost & Found System
              </span>
            </div>
          </Link>

          <div className="d-flex align-items-center gap-2">
            <Link to="/auth/login" className="btn btn-outline-light btn-sm fw-semibold">
              Student Login
            </Link>
            <Link to="/auth/admin-login" className="btn btn-primary btn-sm fw-semibold">
              Admin Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="container my-auto py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-9 col-lg-6 col-xl-5">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-3 bg-white border-top text-center text-muted small mt-auto">
        <div className="container">
          <p className="mb-1 fw-semibold text-secondary">
            CampusConnect – "Lost something? Found something? Let's reconnect."
          </p>
          <p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
            Centralized digital platform exclusively designed for college students & campus administration.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;

