import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { loginUser, clearAuthError } from '../../features/auth/authSlice';

const Login = () => {
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
      toast.warning('Please enter both College ID and password.');
      return;
    }

    const result = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Logged in successfully!');
      if (result.payload.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    }
  };

  const handleDemoFill = (id, pass) => {
    setFormData({ collegeId: id, password: pass });
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4 p-md-5">
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-3"
            style={{ width: '60px', height: '60px' }}
          >
            <i className="bi bi-person-lock fs-2"></i>
          </div>
          <h3 className="fw-bold text-navy mb-1">Student Portal</h3>
          <p className="text-muted small">Sign in using your authorized College ID and password</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label fw-semibold text-secondary small">
              College ID <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-card-text text-muted"></i>
              </span>
              <input
                type="text"
                name="collegeId"
                className="form-control border-start-0 ps-0"
                placeholder="e.g. CS2023001"
                value={formData.collegeId}
                onChange={handleChange}
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold text-secondary small">
              Password <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-lock text-muted"></i>
              </span>
              <input
                type="password"
                name="password"
                className="form-control border-start-0 ps-0"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold mb-3 shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Authenticating...
              </>
            ) : (
              'Sign In to CampusConnect'
            )}
          </button>
        </form>

        <div className="text-center pt-3 border-top">
          <p className="text-muted small mb-2">
            Don't have an account yet?{' '}
            <Link to="/auth/register" className="fw-semibold text-primary text-decoration-none">
              Register with College ID
            </Link>
          </p>
          <p className="text-muted small mb-0">
            College Administrative Authority?{' '}
            <Link to="/auth/admin-login" className="fw-semibold text-danger text-decoration-none">
              Admin Console Login
            </Link>
          </p>
        </div>

        {/* Demo Credentials Quick-Fill helper */}
        <div className="mt-4 p-3 bg-light rounded border border-subtle small">
          <div className="fw-bold text-navy mb-1 d-flex align-items-center">
            <i className="bi bi-info-circle-fill text-primary me-2"></i>
            Demonstration Student Accounts
          </div>
          <div className="text-muted" style={{ fontSize: '0.8rem' }}>
            Click an account to auto-fill credentials:
          </div>
          <div className="d-flex flex-wrap gap-2 mt-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary py-1 px-2"
              onClick={() => handleDemoFill('CS2023001', 'Password@123')}
            >
              John Doe (CS2023001)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary py-1 px-2"
              onClick={() => handleDemoFill('EC2023042', 'Password@123')}
            >
              Sarah Miller (EC2023042)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary py-1 px-2"
              onClick={() => handleDemoFill('ME2024018', 'Password@123')}
            >
              Alex Johnson (ME2024018)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

