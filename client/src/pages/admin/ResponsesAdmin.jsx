import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ResponsesAdmin = () => {
  const navigate = useNavigate();
  const [responses, setResponses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);

  // Review modal state
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const res = await adminService.getResponsesAdmin({
        page,
        limit: 15,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      });
      setResponses(res.data.responses);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load responses: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, [page, statusFilter]);

  const handleOpenReview = (r) => {
    setSelectedResponse(r);
    setAdminRemarks(r.adminRemarks || '');
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedResponse) return;
    try {
      setActionLoading(true);
      await adminService.updateResponseAdmin(selectedResponse._id, {
        status,
        adminRemarks,
      });

      toast.success(`Response status updated to ${status}.`);

      // If accepted for matching and we have lostItemId, redirect to matching workspace
      if (status === 'ACCEPTED' && selectedResponse.lostItemId) {
        navigate(
          `/admin/matches?lostItemId=${selectedResponse.lostItemId._id}&responseId=${selectedResponse._id}`
        );
      } else {
        setSelectedResponse(null);
        fetchResponses();
      }
    } catch (err) {
      toast.error('Failed to update response: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-navy mb-1">Student Responses</h3>
          <p className="text-muted small mb-0">
            Review claims from finders responding to student lost-item requests.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-4 overflow-x-auto pb-1">
        {['All', 'PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'].map((st) => (
          <button
            key={st}
            type="button"
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${
              statusFilter === st ? 'btn-primary' : 'btn-outline-secondary bg-white'
            }`}
            onClick={() => {
              setStatusFilter(st);
              setPage(1);
            }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Responder</th>
                <th>Lost Request</th>
                <th>Found Evidence / Location</th>
                <th>Date Submitted</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <LoadingSpinner message="Loading responses..." />
                  </td>
                </tr>
              ) : responses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No student responses found for this status.
                  </td>
                </tr>
              ) : (
                responses.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className="fw-semibold text-navy">{r.responderId?.name}</div>
                      <code className="text-primary small">{r.responderId?.collegeId}</code>
                      <small className="text-muted d-block">{r.responderId?.phone}</small>
                    </td>

                    <td>
                      <div className="fw-bold text-navy">{r.lostItemId?.itemName || 'Item'}</div>
                      <small className="text-muted">
                        Owner: {r.lostItemId?.studentId?.name} ({r.lostItemId?.studentId?.collegeId})
                      </small>
                    </td>

                    <td>
                      <div className="small text-truncate" style={{ maxWidth: '240px' }}>
                        "{r.message}"
                      </div>
                      <small className="text-secondary">
                        <i className="bi bi-geo-alt me-1"></i> {r.foundLocation}
                      </small>
                    </td>

                    <td>
                      <small className="text-muted">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </small>
                    </td>

                    <td>
                      <StatusBadge status={r.status} />
                    </td>

                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-primary fw-semibold"
                        onClick={() => handleOpenReview(r)}
                      >
                        Review Claim
                      </button>
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

      {/* Review Modal */}
      {selectedResponse && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-navy">
                  Review Response: {selectedResponse.lostItemId?.itemName}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedResponse(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <h6 className="fw-bold text-secondary small text-uppercase mb-2">Lost Item Details</h6>
                    <div className="p-3 bg-light rounded border">
                      <div className="fw-bold text-navy">{selectedResponse.lostItemId?.itemName}</div>
                      <small className="text-muted d-block">
                        Owner: {selectedResponse.lostItemId?.studentId?.name} ({selectedResponse.lostItemId?.studentId?.collegeId})
                      </small>
                      <small className="text-muted d-block">
                        Phone: {selectedResponse.lostItemId?.studentId?.phone}
                      </small>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <h6 className="fw-bold text-secondary small text-uppercase mb-2">Responder (Finder) Details</h6>
                    <div className="p-3 bg-light rounded border">
                      <div className="fw-bold text-navy">{selectedResponse.responderId?.name}</div>
                      <small className="text-muted d-block">
                        College ID: {selectedResponse.responderId?.collegeId} ({selectedResponse.responderId?.department})
                      </small>
                      <small className="text-muted d-block">
                        Phone: {selectedResponse.responderId?.phone}
                      </small>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="fw-bold text-secondary small text-uppercase mb-1">Responder's Message</h6>
                  <p className="p-3 bg-light rounded border text-navy mb-0">"{selectedResponse.message}"</p>
                </div>

                <div className="mb-3">
                  <h6 className="fw-bold text-secondary small text-uppercase mb-1">Found Item Description</h6>
                  <p className="p-3 bg-light rounded border text-secondary small mb-0">
                    {selectedResponse.description}
                  </p>
                </div>

                {selectedResponse.evidenceImage && (
                  <div className="mb-3">
                    <h6 className="fw-bold text-secondary small text-uppercase mb-2">Attached Photograph</h6>
                    <img
                      src={selectedResponse.evidenceImage}
                      alt="Evidence"
                      className="rounded border"
                      style={{ maxHeight: '180px', objectFit: 'contain' }}
                    />
                  </div>
                )}

                <div className="mb-2">
                  <label className="form-label small fw-semibold text-secondary">
                    Administrative Remarks
                  </label>
                  <textarea
                    rows="2"
                    className="form-control"
                    placeholder="Enter reason for approval/rejection or instructions for students..."
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer border-top d-flex justify-content-between">
                <div>
                  <button
                    type="button"
                    className="btn btn-outline-danger me-2"
                    onClick={() => handleUpdateStatus('REJECTED')}
                    disabled={actionLoading}
                  >
                    Reject Response
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-info"
                    onClick={() => handleUpdateStatus('UNDER_REVIEW')}
                    disabled={actionLoading}
                  >
                    Mark Under Review
                  </button>
                </div>

                <div>
                  <button
                    type="button"
                    className="btn btn-light me-2"
                    onClick={() => setSelectedResponse(null)}
                    disabled={actionLoading}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-success fw-bold px-4"
                    onClick={() => handleUpdateStatus('ACCEPTED')}
                    disabled={actionLoading}
                  >
                    <i className="bi bi-check-circle me-1"></i> Accept for Matching
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsesAdmin;

