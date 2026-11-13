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

const FoundItemsAdmin = () => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [possessionStatus, setPossessionStatus] = useState('All');
  const [page, setPage] = useState(1);

  // Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalStatus, setModalStatus] = useState('');
  const [modalPossession, setModalPossession] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await adminService.getFoundItemsAdmin({
        page,
        limit: 15,
        search: search.trim(),
        category: category !== 'All' ? category : undefined,
        status: status !== 'All' ? status : undefined,
        possessionStatus: possessionStatus !== 'All' ? possessionStatus : undefined,
      });
      setItems(res.data.items);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load found items: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchItems();
    }, 250);
    return () => clearTimeout(handler);
  }, [page, search, category, status, possessionStatus]);

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setModalStatus(item.status);
    setModalPossession(item.possessionStatus);
    setAdminRemarks(item.adminRemarks || '');
  };

  const handleSaveModal = async () => {
    if (!selectedItem) return;
    try {
      setActionLoading(true);
      await adminService.updateFoundItemAdmin(selectedItem._id, {
        status: modalStatus,
        possessionStatus: modalPossession,
        adminRemarks,
      });
      toast.success('Found item report updated successfully.');
      setSelectedItem(null);
      fetchItems();
    } catch (err) {
      toast.error('Failed to update found item: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickDeposit = async (item) => {
    try {
      await adminService.updateFoundItemAdmin(item._id, {
        possessionStatus: 'Deposited at admin office',
        status: 'HANDED_OVER_TO_ADMIN',
        adminRemarks: 'Item physically deposited by finder at College Admin Block.',
      });
      toast.success('Recorded deposit at College Admin Block.');
      fetchItems();
    } catch (err) {
      toast.error('Failed to record deposit: ' + err.message);
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="mb-4">
        <h3 className="fw-bold text-navy mb-1">Found Items Administration</h3>
        <p className="text-muted small mb-0">
          Manage found reports, track finder possession, and record physical item custody at the College Admin Block.
        </p>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3 p-lg-4">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold text-secondary">Search Found Item</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search item name, location..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
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
              <label className="form-label small fw-semibold text-secondary">Possession Status</label>
              <select
                className="form-select"
                value={possessionStatus}
                onChange={(e) => {
                  setPossessionStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="All">All Possessions</option>
                <option value="Still with me">Still with Finder</option>
                <option value="Deposited at admin office">Deposited at Admin Office</option>
              </select>
            </div>

            <div className="col-12 col-sm-6 col-md-2">
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
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                <option value="RESERVED">RESERVED</option>
                <option value="HANDED_OVER_TO_ADMIN">WITH ADMIN</option>
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
                <th>Finder (Student)</th>
                <th>Private Observations</th>
                <th>Possession</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <LoadingSpinner message="Loading found items..." />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No found items found matching criteria.
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
                            <i className="bi bi-box-seam text-muted"></i>
                          )}
                        </div>
                        <div>
                          <div className="fw-bold text-navy">{item.itemName}</div>
                          <small className="text-muted">
                            <i className="bi bi-geo-alt me-1"></i> {item.foundLocation} •{' '}
                            {new Date(item.foundDate).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="fw-semibold text-navy small">{item.studentId?.name || 'Finder'}</div>
                      <code className="text-primary small d-block">{item.studentId?.collegeId}</code>
                      <small className="text-muted">{item.studentId?.phone}</small>
                    </td>

                    <td>
                      {item.privateObservations ? (
                        <div className="p-2 bg-light rounded small border border-teal border-opacity-25" style={{ maxWidth: '240px' }}>
                          <i className="bi bi-eye-slash-fill text-teal me-1"></i>
                          <span className="text-navy">{item.privateObservations}</span>
                        </div>
                      ) : (
                        <span className="text-muted small">None recorded</span>
                      )}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          item.possessionStatus === 'Deposited at admin office'
                            ? 'bg-success text-white'
                            : 'bg-light text-dark border'
                        }`}
                      >
                        {item.possessionStatus}
                      </span>
                      {item.possessionStatus === 'Still with me' && (
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-decoration-none d-block p-0 mt-1 small"
                          onClick={() => handleQuickDeposit(item)}
                        >
                          Record Deposit →
                        </button>
                      )}
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

      {/* Edit Modal */}
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
                  Manage Found Item: {selectedItem.itemName}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedItem(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-secondary">
                      Possession Custody
                    </label>
                    <select
                      className="form-select"
                      value={modalPossession}
                      onChange={(e) => setModalPossession(e.target.value)}
                    >
                      <option value="Still with me">Still with Finder</option>
                      <option value="Deposited at admin office">Deposited at Admin Office</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-secondary">
                      Lifecycle Status
                    </label>
                    <select
                      className="form-select"
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value)}
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                      <option value="RESERVED">RESERVED</option>
                      <option value="HANDED_OVER_TO_ADMIN">HANDED_OVER_TO_ADMIN</option>
                      <option value="RETURNED">RETURNED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Administrative Remarks
                  </label>
                  <textarea
                    rows="3"
                    className="form-control"
                    placeholder="Enter notes on custody location, locker box number, or verification instructions..."
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                  ></textarea>
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

export default FoundItemsAdmin;

