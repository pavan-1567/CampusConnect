import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyResponses } from '../../features/responses/responseSlice';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const MyResponses = () => {
  const dispatch = useDispatch();
  const { myResponses, isLoading } = useSelector((state) => state.responses);

  useEffect(() => {
    dispatch(fetchMyResponses());
  }, [dispatch]);

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-navy mb-1">My Responses</h3>
          <p className="text-muted small mb-0">
            Track all responses you have submitted to fellow students' lost item requests.
          </p>
        </div>
        <Link to="/student/browse-lost" className="btn btn-outline-primary fw-semibold">
          <i className="bi bi-search me-1"></i> Browse Lost Items
        </Link>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading your responses..." />
      ) : myResponses.length === 0 ? (
        <EmptyState
          icon="bi-reply-all"
          title="No Responses Submitted"
          description="You haven't responded to any lost item requests yet. When you spot an item belonging to someone else, let them know!"
          actionText="Browse Lost Items"
          actionLink="/student/browse-lost"
        />
      ) : (
        <div className="row g-3">
          {myResponses.map((res) => (
            <div key={res._id} className="col-12">
              <div className="card border-0 shadow-sm p-3 p-md-4">
                <div className="row g-3 align-items-center">
                  <div className="col-auto">
                    <div
                      className="rounded bg-light border d-flex align-items-center justify-content-center"
                      style={{ width: '70px', height: '70px', minWidth: '70px' }}
                    >
                      {res.evidenceImage ? (
                        <img
                          src={res.evidenceImage}
                          alt=""
                          className="w-100 h-100 object-fit-cover rounded"
                        />
                      ) : res.lostItemId?.image ? (
                        <img
                          src={res.lostItemId.image}
                          alt=""
                          className="w-100 h-100 object-fit-cover rounded"
                        />
                      ) : (
                        <i className="bi bi-reply-all text-muted fs-3"></i>
                      )}
                    </div>
                  </div>

                  <div className="col">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                      <span className="small text-muted">Response to:</span>
                      <h5 className="fw-bold text-navy mb-0">
                        {res.lostItemId ? res.lostItemId.itemName : 'Lost Request'}
                      </h5>
                      <StatusBadge status={res.status} />
                    </div>

                    <p className="text-secondary small mb-2">
                      <strong>Your message:</strong> "{res.message}"
                    </p>

                    <div className="small text-muted d-flex flex-wrap gap-3">
                      <span>
                        <i className="bi bi-geo-alt me-1"></i> Found at: {res.foundLocation}
                      </span>
                      <span>
                        <i className="bi bi-calendar-event me-1"></i>{' '}
                        {new Date(res.foundDate).toLocaleDateString()}
                      </span>
                      <span>
                        <i className="bi bi-clock me-1"></i> Sent:{' '}
                        {new Date(res.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {res.adminRemarks && (
                      <div className="mt-2 p-2 bg-light rounded small border">
                        <i className="bi bi-chat-left-dots text-primary me-2"></i>
                        <strong>Admin Remarks:</strong> {res.adminRemarks}
                      </div>
                    )}
                  </div>

                  <div className="col-12 col-md-auto text-md-end">
                    {res.lostItemId && (
                      <Link
                        to={`/student/lost-items/${res.lostItemId._id}`}
                        className="btn btn-outline-primary btn-sm fw-semibold"
                      >
                        <i className="bi bi-eye me-1"></i> View Lost Item
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyResponses;

