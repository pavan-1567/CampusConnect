import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const categories = [
  'All',
  'ID Cards',
  'Electronics',
  'Personal Accessories',
  'Books and Stationery',
  'Bags',
  'Clothing',
  'Documents',
  'Keys',
  'Other',
];

const LostItemsAdmin = () => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);

  // Edit / Close modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalStatus, setModalStatus] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [closedReason, setClosedReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await adminService.getLostItemsAdmin({
        page,
        limit: 15,
        search: search.trim(),
        category: category !== 'All' ? category : undefined,
        status: status !== 'All' ? status : undefined,
      });
      setItems(res.data.items);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load lost items: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchItems();
    }, 250);
    return () => clearTimeout(handler);
  }, [page, search, category, status]);

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setModalStatus(item.status);
    setAdminRemarks(item.adminRemarks || '');
    setClosedReason(item.closedReason || '');
  };

  const handleSaveModal = async () => {
    if (!selectedItem) return;
    try {
      setActionLoading(true);
      await adminService.updateLostItemAdmin(selectedItem._id, {
        status: modalStatus,
        adminRemarks,
        closedReason: modalStatus === 'CLOSED' ? closedReason : undefined,
      });
      toast.success('Lost item report updated successfully.');
      setSelectedItem(null);
      fetchItems();
    } catch (err) {
      toast.error('Failed to update item: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="mb-4">
        <h3 className="fw-bold text-navy mb-1">Lost Items Administration</h3>
        <p className="text-muted small mb-0">
          Complete administrative visibility including private identifying details and direct student contacts.
        </p>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3 p-lg-4">
          <div className="row g-3">
            <div className="col-12 col-md-5">
              <label className="form-label small fw-semibold text-secondary">Search Item</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search item name, description, location..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-4">
              <label className="form-label small fw-semibold text-secondary">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label small fw-semibold text-secondary">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="All">All Statuses</option>
                <option value="OPEN">OPEN</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="MATCHED">MATCHED</option>
                <option value="APPROVED">APPROVED</option>
                <option value="RETURNED">RETURNED</option>
                <option value="CLOSED">CLOSED</option>
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
                <th>Item Details</th>
                <th>Owner (Student)</th>
                <th>Private Verification Info</th>
                <th>Location & Date</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <LoadingSpinner message="Loading lost items..." />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No lost items found matching criteria.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded bg-light border d-flex align-items-center justify-content-center me-2"
                          style={{ width: '48px', height: '48px', minWidth: '48px' }}
                        >
                          {item.image ? (
                            <img src={item.image} alt="" className="w-100 h-100 object-fit-cover rounded" />
                          ) : (
                            <i className="bi bi-search text-muted"></i>
                          )}
                        </div>
                        <div>
                          <div className="fw-bold text-navy">{item.itemName}</div>
                          <span className="badge bg-secondary rounded-pill" style={{ fontSize: '0.7rem' }}>
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="fw-semibold text-navy small">{item.studentId?.name || 'Unknown'}</div>
                      <code className="text-primary small d-block">{item.studentId?.collegeId}</code>
                      <small className="text-muted">{item.contactNumber || item.studentId?.phone}</small>
                    </td>

                    <td>
                      {item.identifyingDetails ? (
                        <div className="p-2 bg-light rounded small border border-primary border-opacity-25" style={{ maxWidth: '240px' }}>
                          <i className="bi bi-shield-lock-fill text-primary me-1"></i>
                          <span className="text-navy">{item.identifyingDetails}</span>
                        </div>
                      ) : (
                        <span className="text-muted small">None provided</span>
                      )}
                    </td>

                    <td>
                      <div className="small text-truncate" style={{ maxWidth: '160px' }}>
                        <i className="bi bi-geo-alt-fill text-danger me-1"></i> {item.lastSeenLocation}
                      </div>
                      <small className="text-muted">
                        {new Date(item.lostDate).toLocaleDateString()}
                      </small>
                    </td>

                    <td>
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary fw-semibold"
                        onClick={() => handleOpenModal(item)}
                      >
                        Manage
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

      {/* Edit / Review Modal */}
      {selectedItem && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-navy">
                  Manage Lost Item: {selectedItem.itemName}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedItem(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-secondary">
                      Update Administrative Status
                    </label>
                    <select
                      className="form-select"
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value)}
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                      <option value="MATCHED">MATCHED</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="RETURNED">RETURNED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>

                  {modalStatus === 'CLOSED' && (
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">
                        Reason for Closing Report
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Expired, item found off-campus, invalid request"
                        value={closedReason}
                        onChange={(e) => setClosedReason(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Administrative Remarks
                  </label>
                  <textarea
                    rows="3"
                    className="form-control"
                    placeholder="Enter internal notes, follow-up comments, or instructions..."
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                  ></textarea>
                </div>

                {/* Confidential Details Callout */}
                <div className="p-3 bg-light rounded border small">
                  <h6 className="fw-bold text-navy mb-1">
                    <i className="bi bi-shield-lock-fill text-danger me-1"></i>
                    Private Verification Details (Owner Secret):
                  </h6>
                  <p className="text-secondary mb-1">
                    {selectedItem.identifyingDetails || 'No private identifying details provided.'}
                  </p>
                  <small className="text-muted">
                    Direct Contact: <strong>{selectedItem.contactNumber || selectedItem.studentId?.phone}</strong>
                  </small>
                </div>
              </div>

              <div className="modal-footer border-top">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setSelectedItem(null)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary fw-semibold"
                  onClick={handleSaveModal}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Saving Changes...' : 'Save Updates'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostItemsAdmin;

