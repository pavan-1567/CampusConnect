import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OwnershipVerification = () => {
  const [searchParams] = useSearchParams();
  const preselectedMatchId = searchParams.get('matchId');
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await adminService.getMatches({ limit: 50 });
      const allMatches = res.data.matches || [];
      setMatches(allMatches);

      if (preselectedMatchId) {
        const found = allMatches.find((m) => m._id === preselectedMatchId);
        if (found) setSelectedMatch(found);
      } else if (allMatches.length > 0) {
        // Default to first pending or under_verification match
        const pending = allMatches.find((m) =>
          ['PENDING', 'UNDER_VERIFICATION'].includes(m.matchStatus)
        );
        setSelectedMatch(pending || allMatches[0]);
      }
    } catch (err) {
      toast.error('Failed to load verification matches: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [preselectedMatchId]);

  const handleDecision = async (action) => {
    if (!selectedMatch) return;

    if (action === 'REJECT' && !remarks.trim()) {
      toast.warning('Please enter a clear reason or administrative remarks for rejection.');
      return;
    }

    try {
      setActionLoading(true);
      await adminService.verifyOwnership(selectedMatch._id, {
        action,
        remarks: remarks.trim(),
      });

      if (action === 'APPROVE') {
        toast.success(
          'Ownership claim verified and approved! Handover scheduling is now enabled.'
        );
        navigate(`/admin/handovers?matchId=${selectedMatch._id}`);
      } else {
        toast.info('Ownership claim rejected. The claimant has been notified.');
        setRemarks('');
        fetchMatches();
      }
    } catch (err) {
      toast.error('Verification failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading ownership verification queue..." />;
  }

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-navy mb-1">Ownership Verification Protocol</h3>
          <p className="text-muted small mb-0">
            Verify the claimant's identity and secret identifying marks before releasing any found property.
          </p>
        </div>
        <Link to="/admin/handovers" className="btn btn-outline-primary btn-sm fw-semibold">
          <i className="bi bi-calendar-check me-1"></i> Handover Schedule
        </Link>
      </div>

      <div className="row g-4">
        {/* Match Selection Column */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="fw-bold text-navy mb-0">
                Verification Queue ({matches.length})
              </h6>
            </div>
            <div className="card-body p-0 overflow-y-auto" style={{ maxHeight: '600px' }}>
              {matches.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  No matches queued for verification.
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {matches.map((m) => (
                    <button
                      key={m._id}
                      type="button"
                      onClick={() => {
                        setSelectedMatch(m);
                        setRemarks(m.remarks || '');
                      }}
                      className={`list-group-item list-group-item-action p-3 text-start ${
                        selectedMatch?._id === m._id ? 'bg-primary bg-opacity-10 border-start border-primary border-4' : ''
                      }`}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="badge bg-secondary rounded-pill" style={{ fontSize: '0.65rem' }}>
                          Score: {m.matchScore}%
                        </span>
                        <StatusBadge status={m.matchStatus} />
                      </div>
                      <div className="fw-bold text-navy text-truncate">{m.lostItemId?.itemName}</div>
                      <small className="text-secondary d-block text-truncate">
                        Owner: {m.lostItemId?.studentId?.name} ({m.lostItemId?.studentId?.collegeId})
                      </small>
                      <small className="text-teal d-block text-truncate">
                        Found: {m.foundItemId?.itemName}
                      </small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Verification Workspace */}
        <div className="col-12 col-lg-8">
          {!selectedMatch ? (
            <div className="card border-0 shadow-sm p-5 text-center bg-white">
              <i className="bi bi-patch-question fs-1 text-secondary mb-3 d-block"></i>
              <h5 className="fw-bold text-navy">Select a Claim to Verify</h5>
              <p className="text-muted small mb-0">
                Choose an item claim from the queue on the left to inspect proof and authorize handover.
              </p>
            </div>
          ) : (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                <div>
                  <span className="badge bg-primary bg-opacity-10 text-primary me-2">
                    Match Score: {selectedMatch.matchScore}%
                  </span>
                  <StatusBadge status={selectedMatch.matchStatus} />
                </div>
                <small className="text-muted">
                  Ref: <code>{selectedMatch._id.substring(0, 8).toUpperCase()}</code>
                </small>
              </div>

              <div className="card-body p-4">
                {/* 1. Review of Lost Report vs Found Report */}
                <h6 className="fw-bold text-navy text-uppercase border-bottom pb-2 mb-3">
                  1. Multi-Party Cross Examination
                </h6>

                <div className="row g-3 mb-4">
                  {/* Claimant Owner Information */}
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded border h-100">
                      <div className="fw-bold text-primary mb-2 d-flex align-items-center">
                        <i className="bi bi-person-fill me-2"></i>
                        Claimant (Lost Owner) Details
                      </div>
                      <table className="table table-sm table-borderless small mb-0">
                        <tbody>
                          <tr>
                            <td className="text-muted" style={{ width: '100px' }}>Full Name:</td>
                            <td className="fw-bold text-navy">{selectedMatch.lostItemId?.studentId?.name}</td>
                          </tr>
                          <tr>
                            <td className="text-muted">College ID:</td>
                            <td>
                              <span className="badge bg-dark">{selectedMatch.lostItemId?.studentId?.collegeId}</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-muted">Department:</td>
                            <td>{selectedMatch.lostItemId?.studentId?.department}</td>
                          </tr>
                          <tr>
                            <td className="text-muted">Phone:</td>
                            <td className="fw-semibold">{selectedMatch.lostItemId?.studentId?.phone}</td>
                          </tr>
                          <tr>
                            <td className="text-muted">Email:</td>
                            <td>{selectedMatch.lostItemId?.studentId?.email}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Finder Information */}
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-light rounded border h-100">
                      <div className="fw-bold text-teal mb-2 d-flex align-items-center">
                        <i className="bi bi-box-seam me-2"></i>
                        Finder Information
                      </div>
                      <table className="table table-sm table-borderless small mb-0">
                        <tbody>
                          <tr>
                            <td className="text-muted" style={{ width: '100px' }}>Full Name:</td>
                            <td className="fw-bold text-navy">{selectedMatch.foundItemId?.studentId?.name}</td>
                          </tr>
                          <tr>
                            <td className="text-muted">College ID:</td>
                            <td>
                              <span className="badge bg-secondary">{selectedMatch.foundItemId?.studentId?.collegeId}</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-muted">Department:</td>
                            <td>{selectedMatch.foundItemId?.studentId?.department}</td>
                          </tr>
                          <tr>
                            <td className="text-muted">Possession:</td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                {selectedMatch.foundItemId?.possessionStatus}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="text-muted">Found At:</td>
                            <td>{selectedMatch.foundItemId?.foundLocation}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* 2. Critical Secret Verification Marks */}
                <h6 className="fw-bold text-navy text-uppercase border-bottom pb-2 mb-3">
                  2. Secret Marks & Private Observations Comparison
                </h6>

                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-warning bg-opacity-10 rounded border border-warning">
                      <label className="fw-bold text-danger small mb-1 d-block">
                        <i className="bi bi-lock-fill me-1"></i> Claimant's Secret Identifying Details:
                      </label>
                      <p className="text-navy fw-semibold small mb-0">
                        {selectedMatch.lostItemId?.identifyingDetails || 'No private identifying details provided by owner.'}
                      </p>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="p-3 bg-teal bg-opacity-10 rounded border border-teal">
                      <label className="fw-bold text-teal small mb-1 d-block">
                        <i className="bi bi-eye-slash-fill me-1"></i> Finder's Private Observations:
                      </label>
                      <p className="text-navy fw-semibold small mb-0">
                        {selectedMatch.foundItemId?.privateObservations || 'No private observations recorded by finder.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Decision & Remarks */}
                <h6 className="fw-bold text-navy text-uppercase border-bottom pb-2 mb-3">
                  3. Administrative Verification Decision
                </h6>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-secondary">
                    Verification Audit Remarks <span className="text-danger">*</span> (Required for rejection, recorded in audit logs)
                  </label>
                  <textarea
                    rows="3"
                    className="form-control"
                    placeholder="Document your verification rationale: e.g. 'Student provided College ID and verified the engraved initials SM matching finder observation.'"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  ></textarea>
                </div>

                {/* Action Buttons */}
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-outline-danger fw-semibold px-4"
                    onClick={() => handleDecision('REJECT')}
                    disabled={actionLoading || selectedMatch.matchStatus === 'COMPLETED'}
                  >
                    <i className="bi bi-x-circle me-1"></i> Reject Ownership Claim
                  </button>

                  <div className="d-flex gap-2">
                    {selectedMatch.matchStatus === 'APPROVED' ? (
                      <Link
                        to={`/admin/handovers?matchId=${selectedMatch._id}`}
                        className="btn btn-success fw-bold px-4"
                      >
                        <i className="bi bi-calendar-check me-1"></i> Already Approved – Schedule Handover →
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-success fw-bold px-4 shadow-sm"
                        onClick={() => handleDecision('APPROVE')}
                        disabled={actionLoading || selectedMatch.matchStatus === 'COMPLETED'}
                      >
                        {actionLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Authorizing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle-fill me-1"></i> Verify Ownership (Approve Claim)
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnershipVerification;

