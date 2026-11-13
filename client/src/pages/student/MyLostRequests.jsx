import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchMyLostItems, cancelLostItem } from '../../features/lostItems/lostItemSlice';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const MyLostRequests = () => {
  const dispatch = useDispatch();
  const { myItems, isLoading } = useSelector((state) => state.lostItems);

  const [statusFilter, setStatusFilter] = useState('All');
  const [cancelModalItem, setCancelModalItem] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    dispatch(fetchMyLostItems());
  }, [dispatch]);

  const handleCancelClick = (item) => {
    setCancelModalItem(item);
    setCancelReason('I found it myself / No longer need assistance.');
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalItem) return;
    const result = await dispatch(
      cancelLostItem({ id: cancelModalItem._id, reason: cancelReason })
    );

    if (cancelLostItem.fulfilled.match(result)) {
      toast.success('Lost item report has been cancelled.');
      setCancelModalItem(null);
    } else {
      toast.error('Failed to cancel report: ' + result.payload);
    }
  };

  const filteredItems = myItems.filter((item) => {
    if (statusFilter === 'All') return true;
    return item.status === statusFilter;
  });

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-navy mb-1">My Lost Requests</h3>
          <p className="text-muted small mb-0">
            Track, view responses, and manage all lost item reports you have submitted.
          </p>
        </div>
        <Link to="/student/report-lost" className="btn btn-primary fw-semibold">
          <i className="bi bi-plus-circle me-1"></i> Report Lost Item
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-4 overflow-x-auto pb-1">
        {['All', 'OPEN', 'UNDER_REVIEW', 'MATCHED', 'APPROVED', 'RETURNED', 'CLOSED'].map((st) => (
          <button
            key={st}
            type="button"
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${
              statusFilter === st ? 'btn-primary' : 'btn-outline-secondary bg-white'
            }`}
            onClick={() => setStatusFilter(st)}
          >
            {st === 'All' ? 'All Requests' : st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading your lost reports..." />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon="bi-file-earmark-text"
          title="No Lost Reports Found"
          description={
            statusFilter === 'All'
              ? "You haven't reported any lost belongings yet."
              : `You have no lost item requests with status "${statusFilter}".`
          }
          actionText="Report a Lost Item"
          actionLink="/student/report-lost"
        />
      ) : (
        <div className="row g-3">
          {filteredItems.map((item) => (
            <div key={item._id} className="col-12">
              <div className="card border-0 shadow-sm p-3 p-md-4">
                <div className="row align-items-center g-3">
                  {/* Thumbnail */}
                  <div className="col-auto">
                    <div
                      className="rounded bg-light border d-flex align-items-center justify-content-center"
                      style={{ width: '80px', height: '80px', minWidth: '80px' }}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.itemName}
                          className="w-100 h-100 object-fit-cover rounded"
                        />
                      ) : (
                        <i className="bi bi-search text-muted fs-3"></i>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="col">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                      <h5 className="fw-bold text-navy mb-0">{item.itemName}</h5>
                      <span className="badge bg-secondary rounded-pill px-2 py-1 small">
                        {item.category}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>

                    <div className="small text-secondary mb-2">
                      <span className="me-3">
                        <i className="bi bi-geo-alt-fill text-danger me-1"></i> {item.lastSeenLocation}
                      </span>
                      <span className="me-3">
                        <i className="bi bi-calendar-event text-primary me-1"></i>{' '}
                        {new Date(item.lostDate).toLocaleDateString()}
                      </span>
                      <span>
                        <i className="bi bi-clock me-1"></i> {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-muted small text-truncate-2 mb-0">{item.description}</p>
                  </div>

                  {/* Responses & Actions */}
                  <div className="col-12 col-md-auto text-md-end pt-2 pt-md-0 border-top border-md-top-0">
                    <div className="d-flex flex-row flex-md-column gap-2 justify-content-end align-items-center align-items-md-end">
                      <div className="badge bg-primary bg-opacity-10 text-primary p-2 mb-md-2">
                        <i className="bi bi-reply-fill me-1"></i>
                        <strong>{item.responseCount || 0}</strong> Responses
                      </div>

                      <div className="d-flex gap-2">
                        <Link
                          to={`/student/lost-items/${item._id}`}
                          className="btn btn-outline-primary btn-sm fw-semibold"
                        >
                          <i className="bi bi-eye me-1"></i> View
                        </Link>

                        {['OPEN', 'UNDER_REVIEW'].includes(item.status) && (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleCancelClick(item)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!cancelModalItem}
        title="Cancel Lost Request"
        message={`Are you sure you want to cancel the lost report for "${cancelModalItem?.itemName}"? This will close the request.`}
        confirmText="Confirm Cancellation"
        confirmVariant="danger"
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModalItem(null)}
      />
    </div>
  );
};

export default MyLostRequests;

