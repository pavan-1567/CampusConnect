import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const departments = [
  'All',
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Information Technology',
  'Civil Engineering',
  'Electrical & Electronics',
  'Chemical Engineering',
  'Business Administration',
];

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);

  // Modal actions
  const [activeModal, setActiveModal] = useState(null); // { student, action: 'ACTIVE' | 'DEACTIVATED' }
  const [actionLoading, setActionLoading] = useState(false);

  // Roster CSV import modal
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [csvText, setCsvText] = useState(
    'collegeId,name,email,department,academicYear\nEC2024090,Lucas Vance,lucas.v@campusconnect.edu,Electronics & Communication,1st Year\nCS2024101,Maya Lin,maya.l@campusconnect.edu,Computer Science & Engineering,1st Year'
  );
  const [importLoading, setImportLoading] = useState(false);

  const fetchStudentsList = async () => {
    try {
      setLoading(true);
      const res = await adminService.getStudents({
        page,
        limit: 15,
        search: search.trim(),
        department: department !== 'All' ? department : undefined,
        status: status !== 'All' ? status : undefined,
      });
      setStudents(res.data.students);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to fetch students: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchStudentsList();
    }, 250);
    return () => clearTimeout(handler);
  }, [page, search, department, status]);

  const handleStatusUpdate = async () => {
    if (!activeModal) return;
    try {
      setActionLoading(true);
      await adminService.updateStudentStatus(activeModal.student._id, activeModal.action);
      toast.success(
        `Student status updated to ${activeModal.action === 'ACTIVE' ? 'Approved / Active' : 'Deactivated'}.`
      );
      setActiveModal(null);
      fetchStudentsList();
    } catch (err) {
      toast.error('Failed to update status: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleImportRoster = async () => {
    try {
      setImportLoading(true);
      const lines = csvText.trim().split('\n');
      const records = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim());
        if (parts.length >= 3) {
          records.push({
            collegeId: parts[0],
            name: parts[1],
            email: parts[2],
            department: parts[3] || 'General',
            academicYear: parts[4] || '1st Year',
          });
        }
      }

      if (records.length === 0) {
        toast.warning('No valid student records found in CSV format.');
        return;
      }

      const res = await adminService.importRoster(records);
      toast.success(
        `College roster import complete: ${res.data.insertedCount} inserted, ${res.data.updatedCount} updated.`
      );
      setShowRosterModal(false);
      fetchStudentsList();
    } catch (err) {
      toast.error('Import failed: ' + err.message);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-navy mb-1">Student Account Management</h3>
          <p className="text-muted small mb-0">
            Verify student college IDs, approve registrations, manage status, and import authorized rosters.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowRosterModal(true)}
          className="btn btn-primary fw-semibold btn-sm shadow-xs"
        >
          <i className="bi bi-file-earmark-spreadsheet me-1"></i> Import College Roster (CSV)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3 p-lg-4">
          <div className="row g-3">
            <div className="col-12 col-md-5">
              <label className="form-label small fw-semibold text-secondary">Search Students</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search College ID, Name, or Email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-4">
              <label className="form-label small fw-semibold text-secondary">Department</label>
              <select
                className="form-select"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setPage(1);
                }}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label small fw-semibold text-secondary">Account Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="All">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="DEACTIVATED">Deactivated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>College ID</th>
                <th>Full Name</th>
                <th>Email / Phone</th>
                <th>Department & Year</th>
                <th>Status</th>
                <th className="text-end">Administrative Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <LoadingSpinner message="Loading student records..." />
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <i className="bi bi-person-x fs-1 mb-2 d-block text-secondary"></i>
                    No student records found matching criteria.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <code className="fw-bold text-primary">{s.collegeId}</code>
                      {s.isCollegeVerified && (
                        <i
                          className="bi bi-patch-check-fill text-success ms-1"
                          title="Verified against College Roster"
                        ></i>
                      )}
                    </td>
                    <td>
                      <div className="fw-bold text-navy">{s.name}</div>
                      <small className="text-muted">
                        Joined: {new Date(s.createdAt).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      <div className="small text-truncate" style={{ maxWidth: '200px' }}>
                        {s.email}
                      </div>
                      <small className="text-muted">{s.phone}</small>
                    </td>
                    <td>
                      <div className="small text-truncate" style={{ maxWidth: '180px' }}>
                        {s.department}
                      </div>
                      <small className="text-muted">{s.academicYear}</small>
                    </td>
                    <td>
                      <StatusBadge status={s.accountStatus} />
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        {s.accountStatus === 'PENDING_APPROVAL' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-success fw-semibold"
                            onClick={() => setActiveModal({ student: s, action: 'ACTIVE' })}
                          >
                            <i className="bi bi-check-lg me-1"></i> Approve
                          </button>
                        )}

                        {s.accountStatus === 'ACTIVE' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setActiveModal({ student: s, action: 'DEACTIVATED' })}
                          >
                            Deactivate
                          </button>
                        )}

                        {s.accountStatus === 'DEACTIVATED' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success"
                            onClick={() => setActiveModal({ student: s, action: 'ACTIVE' })}
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="p-3 border-top bg-light">
            <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!activeModal}
        title={activeModal?.action === 'ACTIVE' ? 'Approve Student Account' : 'Deactivate Account'}
        message={`Are you sure you want to change account status for ${activeModal?.student?.name} (${activeModal?.student?.collegeId}) to ${activeModal?.action}?`}
        confirmText={activeModal?.action === 'ACTIVE' ? 'Approve / Activate' : 'Deactivate Account'}
        confirmVariant={activeModal?.action === 'ACTIVE' ? 'success' : 'danger'}
        onConfirm={handleStatusUpdate}
        onCancel={() => setActiveModal(null)}
        isLoading={actionLoading}
      />

      {/* Roster Import Modal */}
      {showRosterModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-navy">
                  <i className="bi bi-file-earmark-spreadsheet text-primary me-2"></i>
                  Import Authorized College Student Roster (CSV)
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRosterModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <p className="text-secondary small mb-3">
                  Paste authorized college student records below in comma-separated format. When these students
                  register, their accounts will automatically be marked <strong>VERIFIED</strong>.
                </p>

                <div className="mb-3">
                  <label className="form-label fw-semibold small text-secondary">
                    CSV Data (Header: collegeId,name,email,department,academicYear)
                  </label>
                  <textarea
                    rows="6"
                    className="form-control font-monospace small"
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer border-top">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowRosterModal(false)}
                  disabled={importLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary fw-semibold"
                  onClick={handleImportRoster}
                  disabled={importLoading}
                >
                  {importLoading ? 'Importing Roster...' : 'Import Records'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;

