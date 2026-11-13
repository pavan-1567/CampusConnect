import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { updateUserProfile } from '../../features/auth/authSlice';
import authService from '../../services/authService';

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

const StudentProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    academicYear: user?.academicYear || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateUserProfile(profileData));
    if (updateUserProfile.fulfilled.match(result)) {
      toast.success('Profile details updated successfully!');
      setIsEditing(false);
    } else {
      toast.error('Failed to update profile: ' + result.payload);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    try {
      setPasswordLoading(true);
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmNewPassword,
      });
      toast.success('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container-fluid px-0" style={{ maxWidth: '850px' }}>
      <div className="mb-4">
        <h3 className="fw-bold text-navy mb-1">My Student Profile</h3>
        <p className="text-muted small mb-0">
          Manage your verified college credentials and personal contact information.
        </p>
      </div>

      {/* Account Verification Status Card */}
      <div className="card border-0 shadow-sm p-4 mb-4 bg-white">
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
          <div className="d-flex align-items-center">
            <div
              className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-3"
              style={{ width: '64px', height: '64px', minWidth: '64px' }}
            >
              <i className="bi bi-person-badge fs-2"></i>
            </div>
            <div>
              <h4 className="fw-bold text-navy mb-1">{user?.name}</h4>
              <div className="text-muted small">
                College ID: <strong>{user?.collegeId}</strong> • Email: {user?.email}
              </div>
            </div>
          </div>

          <div className="text-sm-end">
            <span className="badge bg-success bg-opacity-15 text-success border border-success border-opacity-25 px-3 py-2 fw-semibold">
              <i className="bi bi-patch-check-fill me-1"></i> Roster Verified Student
            </span>
            <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
              Status: <strong>{user?.accountStatus}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Form */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-bottom py-3 d-flex align-items-center justify-content-between">
          <h5 className="fw-bold text-navy mb-0">Personal Information</h5>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="btn btn-outline-primary btn-sm fw-semibold"
            >
              <i className="bi bi-pencil me-1"></i> Edit Profile
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn btn-outline-secondary btn-sm"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleProfileSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-secondary small">
                  College ID (Immutable)
                </label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={user?.collegeId || ''}
                  disabled
                />
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                  College ID cannot be modified by students.
                </small>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-secondary small">
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-secondary small">
                  College Email (Institutional)
                </label>
                <input
                  type="email"
                  className="form-control bg-light"
                  value={user?.email || ''}
                  disabled
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
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold text-secondary small">
                  Department <span className="text-danger">*</span>
                </label>
                <select
                  name="department"
                  className="form-select"
                  value={profileData.department}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  required
                >
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
                  value={profileData.academicYear}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                  required
                >
                  {academicYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isEditing && (
              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-light px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-4 fw-semibold">
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom py-3">
          <h5 className="fw-bold text-navy mb-0">Change Account Password</h5>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handlePasswordSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold text-secondary small">
                  Current Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold text-secondary small">
                  New Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Min. 6 chars"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold text-secondary small">
                  Confirm New Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Repeat new password"
                  value={passwordData.confirmNewPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="d-flex justify-content-end pt-2">
              <button
                type="submit"
                className="btn btn-outline-primary fw-semibold"
                disabled={passwordLoading}
              >
                {passwordLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;

