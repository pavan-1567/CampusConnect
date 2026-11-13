import React from 'react';
import { Link } from 'react-router-dom';

const PendingApproval = () => {
  return (
    <div className="card shadow-sm border-0 text-center p-4 p-md-5">
      <div className="mb-4">
        <div
          className="d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-10 text-warning rounded-circle"
          style={{ width: '80px', height: '80px' }}
        >
          <i className="bi bi-hourglass-split fs-1 text-warning"></i>
        </div>
      </div>

      <h3 className="fw-bold text-navy mb-2">Account Verification Pending</h3>
      <p className="text-muted mb-4">
        Thank you for registering with CampusConnect! Your student account is currently pending verification
        against the official college student roster or approval by a campus administrator.
      </p>

      <div className="p-3 bg-light rounded text-start mb-4 small border">
        <div className="fw-bold text-navy mb-1">
          <i className="bi bi-info-circle text-primary me-2"></i>
          Next Steps:
        </div>
        <ul className="mb-0 text-secondary ps-3">
          <li>College administrators review new registrations daily.</li>
          <li>Once approved, you will be able to log in with your College ID and password.</li>
          <li>If you believe this is an error, visit the Campus Administration Office with your physical College ID card.</li>
        </ul>
      </div>

      <div>
        <Link to="/auth/login" className="btn btn-primary px-4 fw-semibold">
          Return to Login
        </Link>
      </div>
    </div>
  );
};

export default PendingApproval;

