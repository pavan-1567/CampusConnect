import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const HandoverManagement = () => {
  const [searchParams] = useSearchParams();
  const preselectedMatchId = searchParams.get('matchId');

  const [handovers, setHandovers] = useState([]);
  const [approvedMatches, setApprovedMatches] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');

  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(!!preselectedMatchId);
  const [scheduleData, setScheduleData] = useState({
    matchId: preselectedMatchId || '',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    collectionLocation: 'College Admin Block, Room 104',
    verificationMethod: 'College ID and Physical Identifying Verification',
    remarks: 'Please bring original College ID card and collect between 10:00 AM and 04:00 PM.',
  });
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Complete handover modal
  const [activeHandover, setActiveHandover] = useState(null);
  const [completeRemarks, setCompleteRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchHandoversList = async () => {
    try {
      setLoading(true);
      const [hRes, mRes] = await Promise.all([
        adminService.getHandovers({
          page,
          limit: 15,
          status: statusFilter !== 'All' ? statusFilter : undefined,
        }),
        adminService.getMatches({ status: 'APPROVED', limit: 50 }),
      ]);
      setHandovers(hRes.data.handovers || []);
      setPagination(hRes.data.pagination);
      setApprovedMatches(mRes.data.matches || []);
    } catch (err) {
      toast.error('Failed to load handovers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandoversList();
  }, [page, statusFilter]);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleData.matchId) {
      toast.warning('Please select an approved match.');
      return;
    }

    try {
      setScheduleLoading(true);
      await adminService.scheduleHandover(scheduleData);
      toast.success('Collection scheduled successfully! Notifications dispatched to students.');
      setShowScheduleModal(false);
      fetchHandoversList();
    } catch (err) {
      toast.error('Failed to schedule handover: ' + err.message);
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!activeHandover) return;
    try {
      setActionLoading(true);
      await adminService.updateHandover(activeHandover._id, {
        status: 'COMPLETED',
        finderDepositedAt: activeHandover.finderDepositedAt || new Date().toISOString(),
        remarks: completeRemarks.trim() || 'Item handed over to verified owner in person.',
      });
      toast.success('Item marked as RETURNED! Handover successfully completed.');
      setActiveHandover(null);
      setCompleteRemarks('');
      fetchHandoversList();
    } catch (err) {
      toast.error('Failed to complete handover: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordFinderDeposit = async (handover) => {
    try {
      await adminService.updateHandover(handover._id, {
        finderDepositedAt: new Date().toISOString(),
        remarks: 'Finder deposited item at College Admin Block.',
      });
      toast.success('Recorded finder item deposit at College Admin Block.');
      fetchHandoversList();
    } catch (err) {
      toast.error('Failed to record deposit: ' + err.message);
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-navy mb-1">Handover & Collection Management</h3>
          <p className="text-muted small mb-0">
            Schedule collection appointments at the College Admin Block and officially finalize item return.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowScheduleModal(true)}
          className="btn btn-primary fw-semibold btn-sm shadow-xs"
        >
          <i className="bi bi-calendar-plus me-1"></i> Schedule New Collection Handover
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-4 overflow-x-auto pb-1">
        {['All', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((st) => (
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

      {/* Handover List Table */}
      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Item</th>
                <th>Owner (Claimant)</th>
                <th>Finder</th>
                <th>Scheduled At / Location</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <LoadingSpinner message="Loading handover schedule..." />
                  </td>
                </tr>
              ) : handovers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No collection handovers found for this status.
                  </td>
                </tr>
              ) : (
                handovers.map((h) => (
                  <tr key={h._id}>
                    <td>
                      <div className="fw-bold text-navy">{h.lostItemId?.itemName}</div>
                      <small className="text-muted">{h.lostItemId?.category}</small>
                    </td>

                    <td>
                      <div className="small fw-semibold text-navy">{h.ownerId?.name}</div>
                      <code className="text-primary small">{h.ownerId?.collegeId}</code>
                      <small className="text-muted d-block">{h.ownerId?.phone}</small>
                    </td>

                    <td>
                      <div className="small fw-semibold text-teal">{h.finderId?.name}</div>
                      <code className="text-secondary small">{h.finderId?.collegeId}</code>
                      <small className="text-muted d-block">{h.finderId?.phone}</small>
                    </td>

                    <td>
                      <div className="small fw-bold text-navy">
                        <i className="bi bi-clock me-1 text-primary"></i>
                        {new Date(h.scheduledAt).toLocaleString()}
                      </div>
                      <small className="text-muted">
                        <i className="bi bi-geo-alt me-1 text-danger"></i> {h.collectionLocation}
                      </small>
                    </td>

                    <td>
                      <StatusBadge status={h.status} />
                      {h.finderDepositedAt && (
                        <div className="badge bg-success bg-opacity-10 text-success d-block mt-1" style={{ fontSize: '0.65rem' }}>
                          <i className="bi bi-check me-1"></i> With Admin Office
                        </div>
                      )}
                    </td>

                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        {!h.finderDepositedAt && h.status === 'SCHEDULED' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-teal"
                            onClick={() => handleRecordFinderDeposit(h)}
                            title="Record that finder dropped off the item at admin office"
                          >
                            <i className="bi bi-box-arrow-in-down me-1"></i> Deposit
                          </button>
                        )}

                        {h.status === 'SCHEDULED' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-success fw-bold"
                            onClick={() => {
                              setActiveHandover(h);
                              setCompleteRemarks(
                                'Handover completed in person at College Admin Block with verified College ID.'
                              );
                            }}
                          >
                            <i className="bi bi-check2-circle me-1"></i> Finalize Return
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

      {/* Schedule Handover Modal */}
      {showScheduleModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-navy">
                  <i className="bi bi-calendar-check text-primary me-2"></i>
                  Schedule Item Collection Appointment
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowScheduleModal(false)}
                ></button>
              </div>

              <form onSubmit={handleScheduleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Select Approved Match Claim <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={scheduleData.matchId}
                      onChange={(e) => setScheduleData({ ...scheduleData, matchId: e.target.value })}
                      required
                    >
                      <option value="">-- Choose an Approved Ownership Claim --</option>
                      {approvedMatches.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.lostItemId?.itemName} (Owner: {m.lostItemId?.studentId?.name}) ↔{' '}
                          {m.foundItemId?.itemName} (Finder: {m.foundItemId?.studentId?.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">
                        Collection Date & Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={scheduleData.scheduledAt}
                        onChange={(e) =>
                          setScheduleData({ ...scheduleData, scheduledAt: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">
                        Collection Location <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={scheduleData.collectionLocation}
                        onChange={(e) =>
                          setScheduleData({ ...scheduleData, collectionLocation: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Verification Method Required at Desk
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={scheduleData.verificationMethod}
                      onChange={(e) =>
                        setScheduleData({ ...scheduleData, verificationMethod: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-secondary">
                      Instructions Dispatched to Students
                    </label>
                    <textarea
                      rows="2"
                      className="form-control"
                      value={scheduleData.remarks}
                      onChange={(e) =>
                        setScheduleData({ ...scheduleData, remarks: e.target.value })
                      }
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setShowScheduleModal(false)}
                    disabled={scheduleLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary fw-bold"
                    disabled={scheduleLoading}
                  >
                    {scheduleLoading ? 'Scheduling...' : 'Confirm Handover Schedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Complete Handover Modal */}
      {activeHandover && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-navy">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  Finalize In-Person Handover
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setActiveHandover(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <p className="text-secondary small mb-3">
                  You are about to record the successful physical return of{' '}
                  <strong>"{activeHandover.lostItemId?.itemName}"</strong> to student owner{' '}
                  <strong>{activeHandover.ownerId?.name} ({activeHandover.ownerId?.collegeId})</strong>.
                </p>

                <div className="alert alert-success py-2 px-3 small mb-3">
                  <i className="bi bi-info-circle-fill me-1"></i>
                  Both the lost item and found item records will be automatically updated to <strong>RETURNED</strong>, closing the pipeline and updating college statistics.
                </div>

                <div className="mb-2">
                  <label className="form-label small fw-semibold text-secondary">
                    Handover Confirmation Remarks
                  </label>
                  <textarea
                    rows="2"
                    className="form-control"
                    value={completeRemarks}
                    onChange={(e) => setCompleteRemarks(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer border-top">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setActiveHandover(null)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success fw-bold px-4"
                  onClick={handleMarkCompleted}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Finalizing...' : 'Complete Return'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HandoverManagement;

