import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import lostItemService from '../../services/lostItemService';
import foundItemService from '../../services/foundItemService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ItemDetails = ({ type = 'lost' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const service = type === 'lost' ? lostItemService.getLostItemById : foundItemService.getFoundItemById;
        const response = await service(id);
        setItem(response.data);
      } catch (err) {
        setError(err.message || 'Failed to load item details.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, type]);

  if (loading) {
    return <LoadingSpinner message="Loading report details..." />;
  }

  if (error || !item) {
    return (
      <div className="alert alert-danger my-4 p-4 rounded shadow-sm text-center">
        <i className="bi bi-exclamation-triangle fs-2 mb-2 d-block"></i>
        <h5>Report Not Found</h5>
        <p className="mb-3">{error || 'The requested item report does not exist or has been removed.'}</p>
        <Link to={type === 'lost' ? '/student/browse-lost' : '/student/browse-found'} className="btn btn-outline-danger">
          Return to Listings
        </Link>
      </div>
    );
  }

  const isOwner = user && item.studentId && (user._id === item.studentId._id || user._id === item.studentId);
  const dateValue = type === 'lost' ? item.lostDate : item.foundDate;
  const locationValue = type === 'lost' ? item.lastSeenLocation : item.foundLocation;
  const timeValue = type === 'lost' ? item.lostTime : item.foundTime;

  return (
    <div className="container-fluid px-0" style={{ maxWidth: '960px' }}>
      {/* Navigation Breadcrumb */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to="/student/dashboard" className="text-decoration-none text-muted">
                Dashboard
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link
                to={type === 'lost' ? '/student/browse-lost' : '/student/browse-found'}
                className="text-decoration-none text-muted"
              >
                {type === 'lost' ? 'Lost Items' : 'Found Items'}
              </Link>
            </li>
            <li className="breadcrumb-item active text-navy fw-semibold" aria-current="page">
              {item.itemName}
            </li>
          </ol>
        </nav>

        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i> Back
        </button>
      </div>

      {/* Main Details Card */}
      <div className="card border-0 shadow-sm overflow-hidden mb-4">
        <div className="row g-0">
          {/* Item Image Section */}
          <div className="col-12 col-md-5 bg-light d-flex align-items-center justify-content-center p-3 border-end">
            {item.image ? (
              <img
                src={item.image}
                alt={item.itemName}
                className="img-fluid rounded shadow-xs"
                style={{ maxHeight: '380px', objectFit: 'contain' }}
              />
            ) : (
              <div className="text-center p-5 text-muted">
                <i className={`bi ${type === 'lost' ? 'bi-search' : 'bi-box-seam'} fs-1 text-secondary mb-2 d-block`}></i>
                <span className="fw-semibold">No photograph provided</span>
              </div>
            )}
          </div>

          {/* Item Content Section */}
          <div className="col-12 col-md-7 p-4 p-lg-5 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="badge bg-secondary rounded-pill px-3 py-1">
                  <i className="bi bi-tag me-1"></i> {item.category}
                </span>
                <StatusBadge status={item.status} />
              </div>

              <h3 className="fw-bold text-navy mb-3">{item.itemName}</h3>

              <div className="mb-4">
                <h6 className="text-secondary fw-semibold small text-uppercase">Description</h6>
                <p className="text-secondary leading-relaxed mb-0">{item.description}</p>
              </div>

              {/* Incident Metadata Grid */}
              <div className="row g-3 py-3 border-top border-bottom mb-4">
                <div className="col-6">
                  <span className="text-muted small d-block mb-1">
                    <i className="bi bi-geo-alt-fill text-danger me-1"></i> {type === 'lost' ? 'Last Seen' : 'Found At'}
                  </span>
                  <span className="fw-semibold text-navy">{locationValue}</span>
                </div>

                <div className="col-6">
                  <span className="text-muted small d-block mb-1">
                    <i className="bi bi-calendar-event text-primary me-1"></i> Date
                  </span>
                  <span className="fw-semibold text-navy">
                    {dateValue ? new Date(dateValue).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                {timeValue && (
                  <div className="col-6">
                    <span className="text-muted small d-block mb-1">
                      <i className="bi bi-clock text-secondary me-1"></i> Time
                    </span>
                    <span className="fw-semibold text-navy">{timeValue}</span>
                  </div>
                )}

                {item.possessionStatus && (
                  <div className="col-6">
                    <span className="text-muted small d-block mb-1">
                      <i className="bi bi-building text-teal me-1"></i> Possession
                    </span>
                    <span className="badge bg-light text-dark border">
                      {item.possessionStatus}
                    </span>
                  </div>
                )}

                <div className="col-6">
                  <span className="text-muted small d-block mb-1">Report Reference</span>
                  <code className="text-primary small">{item._id.substring(0, 8).toUpperCase()}</code>
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div>
              {type === 'lost' && !isOwner && item.status === 'OPEN' && (
                <Link
                  to={`/student/respond/${item._id}`}
                  className="btn btn-teal btn-lg w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                >
                  <i className="bi bi-reply-fill fs-5"></i>
                  <span>Respond – I Found This Item</span>
                </Link>
              )}

              {type === 'lost' && isOwner && (
                <div className="alert alert-info py-2 px-3 small d-flex align-items-center mb-0">
                  <i className="bi bi-info-circle-fill fs-5 me-2 text-primary"></i>
                  <div>
                    This is your lost item request. Active responses:{' '}
                    <strong>{item.responseCount || 0}</strong>.{' '}
                    <Link to="/student/my-lost" className="fw-bold text-decoration-none">
                      Manage in My Lost Requests →
                    </Link>
                  </div>
                </div>
              )}

              {type === 'found' && (
                <div className="alert alert-light border py-2 px-3 small d-flex align-items-center mb-0">
                  <i className="bi bi-shield-check fs-5 me-2 text-success"></i>
                  <div>
                    Campus administrator verifies claims before coordinating return at the College Admin Block.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confidential Details Display (Owner or Admin Only) */}
      {isOwner && (item.identifyingDetails || item.privateObservations) && (
        <div className="card border-0 shadow-sm bg-light mb-4">
          <div className="card-body p-4">
            <h6 className="fw-bold text-navy mb-2 d-flex align-items-center">
              <i className="bi bi-lock-fill text-danger me-2"></i>
              Your Confidential Report Information (Visible only to you and Admin)
            </h6>
            <p className="text-secondary small mb-0">
              {item.identifyingDetails || item.privateObservations}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetails;

