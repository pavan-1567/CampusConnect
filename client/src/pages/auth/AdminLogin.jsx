import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { loginUser, clearAuthError } from '../../features/auth/authSlice';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    collegeId: '',
    password: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        toast.error('Student accounts cannot access the administrative portal.');
        navigate('/student/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.collegeId || !formData.password) {
      toast.warning('Please enter both Admin ID and password.');
      return;
    }

    const result = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(result)) {
      if (result.payload.data.user.role === 'admin') {
        toast.success('Admin authentication verified.');
        navigate('/admin/dashboard');
      } else {
        toast.error('Access Denied: This account does not possess administrative privileges.');
        navigate('/student/dashboard');
      }
    }
  };

  const handleFillAdmin = () => {
    setFormData({ collegeId: 'ADM2026', password: 'AdminPass@2026' });
  };

  return (
    <div className="card shadow-sm border-0 border-top border-4 border-danger">
      <div className="card-body p-4 p-md-5">
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle mb-3"
            style={{ width: '60px', height: '60px' }}
          >
            <i className="bi bi-shield-lock-fill fs-2"></i>
          </div>
          <h3 className="fw-bold text-navy mb-1">Admin Console</h3>
          <p className="text-muted small">Restricted to authorized college administrative personnel</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label fw-semibold text-secondary small">
              Administrator ID <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-person-badge text-muted"></i>
              </span>
              <input
                type="text"
                name="collegeId"
                className="form-control border-start-0 ps-0"
                placeholder="e.g. ADM2026"
                value={formData.collegeId}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold text-secondary small">
              Master Password <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-key text-muted"></i>
              </span>
              <input
                type="password"
                name="password"
                className="form-control border-start-0 ps-0"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-danger w-100 py-2 fw-semibold mb-3 shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Verifying Credentials...
              </>
            ) : (
              'Enter Admin Console'
            )}
          </button>
        </form>

        <div className="text-center pt-3 border-top">
          <Link to="/auth/login" className="text-secondary small text-decoration-none fw-semibold">
            <i className="bi bi-arrow-left me-1"></i> Return to Student Portal
          </Link>
        </div>

        {/* Demo Credentials Quick-Fill helper */}
        <div className="mt-4 p-3 bg-light rounded border border-subtle small">
          <div className="fw-bold text-navy mb-1 d-flex align-items-center">
            <i className="bi bi-shield-check text-danger me-2"></i>
            Default Admin Credentials
          </div>
          <div className="text-muted mb-2" style={{ fontSize: '0.8rem' }}>
            ID: <code>ADM2026</code> | Pass: <code>AdminPass@2026</code>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger py-1 px-3 w-100 fw-semibold"
            onClick={handleFillAdmin}
          >
            Auto-fill Admin Credentials
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

