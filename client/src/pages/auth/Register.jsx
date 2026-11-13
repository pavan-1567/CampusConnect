import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { registerUser, clearAuthError } from '../../features/auth/authSlice';

const departments = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Information Technology',
  'Civil Engineering',
  'Electrical & Electronics',
  'Chemical Engineering',
  'Business Administration',
  'Basic Sciences & Humanities',
];

const academicYears = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

const Register = () => {
  const [formData, setFormData] = useState({
    collegeId: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    academicYear: '',
    password: '',
    confirmPassword: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

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

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    const result = await dispatch(registerUser(formData));

    if (registerUser.fulfilled.match(result)) {
      if (result.payload.data?.requiresApproval) {
        toast.info(
          'Registration submitted! Your account is pending college roster verification or admin approval.'
        );
        navigate('/auth/pending-approval');
      } else {
        toast.success('Registration verified with authorized college roster! Welcome!');
        navigate('/student/dashboard');
      }
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4 p-md-5">
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-3"
            style={{ width: '60px', height: '60px' }}
          >
            <i className="bi bi-person-plus fs-2"></i>
          </div>
          <h3 className="fw-bold text-navy mb-1">Student Registration</h3>
          <p className="text-muted small">
            Register with your official College ID to join CampusConnect
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-secondary small">
                College ID <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="collegeId"
                className="form-control"
                placeholder="e.g. IT2023055"
                value={formData.collegeId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-secondary small">
                Full Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="e.g. Emily Davis"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-secondary small">
                College Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="emily.d@campusconnect.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-secondary small">
                Phone Number <span className="text-danger">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="+1 555-0155"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-secondary small">
                Department <span className="text-danger">*</span>
              </label>
              <select
                name="department"
                className="form-select"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-secondary small">
                Academic Year <span className="text-danger">*</span>
              </label>
              <select
                name="academicYear"
                className="form-select"
                value={formData.academicYear}
                onChange={handleChange}
                required
              >
                <option value="">Select Year</option>
                {academicYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-secondary small">
                Password <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-secondary small">
                Confirm Password <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
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
                Verifying & Creating Account...
              </>
            ) : (
              'Create Student Account'
            )}
          </button>
        </form>

        <div className="text-center pt-3 border-top">
          <p className="text-muted small mb-0">
            Already have an authorized account?{' '}
            <Link to="/auth/login" className="fw-semibold text-primary text-decoration-none">
              Sign In Here
            </Link>
          </p>
        </div>

        {/* College Roster note */}
        <div className="mt-4 p-3 bg-light rounded border border-subtle small">
          <div className="fw-bold text-navy mb-1 d-flex align-items-center">
            <i className="bi bi-shield-check text-success me-2"></i>
            College Roster Auto-Verification
          </div>
          <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
            IDs present on the official campus roster (e.g. <code>IT2023055</code> for Emily Davis) are
            instantly activated. Unrostered IDs are placed in pending verification for administrative review.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

