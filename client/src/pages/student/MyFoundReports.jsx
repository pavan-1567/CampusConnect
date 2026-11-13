import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyFoundItems } from '../../features/foundItems/foundItemSlice';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const MyFoundReports = () => {
  const dispatch = useDispatch();
  const { myItems, isLoading } = useSelector((state) => state.foundItems);

  useEffect(() => {
    dispatch(fetchMyFoundItems());
  }, [dispatch]);

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-navy mb-1">My Found Reports</h3>
          <p className="text-muted small mb-0">
            All belongings you reported finding on campus. Thank you for your honesty!
          </p>
        </div>
        <Link to="/student/report-found" className="btn btn-teal fw-semibold">
          <i className="bi bi-plus-circle me-1"></i> Report Found Item
        </Link>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading your found reports..." />
      ) : myItems.length === 0 ? (
        <EmptyState
          icon="bi-box-seam"
          title="No Found Reports Submitted"
          description="You haven't reported finding any belongings yet."
          actionText="Report a Found Item"
          actionLink="/student/report-found"
        />
      ) : (
        <div className="row g-3">
          {myItems.map((item) => (
            <div key={item._id} className="col-12">
              <div className="card border-0 shadow-sm p-3 p-md-4">
                <div className="row align-items-center g-3">
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
                        <i className="bi bi-box-seam text-muted fs-3"></i>
                      )}
                    </div>
                  </div>

                  <div className="col">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                      <h5 className="fw-bold text-navy mb-0">{item.itemName}</h5>
                      <span className="badge bg-secondary rounded-pill px-2 py-1 small">
                        {item.category}
                      </span>
                      <StatusBadge status={item.status} />
                      <span className="badge bg-light text-dark border small">
                        {item.possessionStatus}
                      </span>
                    </div>

                    <div className="small text-secondary mb-2">
                      <span className="me-3">
                        <i className="bi bi-geo-alt-fill text-danger me-1"></i> {item.foundLocation}
                      </span>
                      <span className="me-3">
                        <i className="bi bi-calendar-event text-primary me-1"></i>{' '}
                        {new Date(item.foundDate).toLocaleDateString()}
                      </span>
                      <span>
                        <i className="bi bi-clock me-1"></i> {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-muted small text-truncate-2 mb-0">{item.description}</p>

                    {item.linkedMatch && (
                      <div className="mt-2 p-2 bg-light rounded small border">
                        <i className="bi bi-diagram-3 text-primary me-2"></i>
                        Linked to potential match for: <strong>{item.linkedMatch.lostItemId?.itemName}</strong> (Status: {item.linkedMatch.matchStatus})
                      </div>
                    )}
                  </div>

                  <div className="col-12 col-md-auto text-md-end pt-2 pt-md-0 border-top border-md-top-0">
                    <Link
                      to={`/student/found-items/${item._id}`}
                      className="btn btn-outline-primary btn-sm fw-semibold"
                    >
                      <i className="bi bi-eye me-1"></i> View Details
                    </Link>
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

export default MyFoundReports;

