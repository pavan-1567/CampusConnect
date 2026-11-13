import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const ItemCard = ({ item, type = 'lost' }) => {
  if (!item) return null;

  const dateValue = type === 'lost' ? item.lostDate : item.foundDate;
  const formattedDate = dateValue ? new Date(dateValue).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) : 'Unknown date';

  const locationValue = type === 'lost' ? item.lastSeenLocation : item.foundLocation;
  const detailLink = type === 'lost' ? `/student/lost-items/${item._id}` : `/student/found-items/${item._id}`;

  return (
    <div className="card h-100 card-hover shadow-sm border-0">
      <div className="position-relative bg-light rounded-top overflow-hidden" style={{ height: '180px' }}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.itemName}
            className="w-100 h-100 object-fit-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/600x400/e2e8f0/475569?text=CampusConnect';
            }}
          />
        ) : (
          <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-muted">
            <i className={`bi ${type === 'lost' ? 'bi-search' : 'bi-box-seam'} fs-1 mb-1 text-secondary`}></i>
            <small className="fw-semibold">No Image Provided</small>
          </div>
        )}
        <div className="position-absolute top-0 end-0 m-2">
          <StatusBadge status={item.status} />
        </div>
        <div className="position-absolute bottom-0 start-0 m-2">
          <span className="badge bg-dark bg-opacity-75 text-white">
            <i className="bi bi-tag me-1"></i>
            {item.category}
          </span>
        </div>
      </div>

      <div className="card-body d-flex flex-column p-3">
        <h5 className="card-title text-truncate fw-bold mb-2 text-navy" title={item.itemName}>
          {item.itemName}
        </h5>

        <p className="card-text text-muted small flex-grow-1 text-truncate-2 mb-3" style={{ minHeight: '2.5rem' }}>
          {item.description}
        </p>

        <div className="small text-secondary mb-3 pt-2 border-top">
          <div className="d-flex align-items-center mb-1 text-truncate">
            <i className="bi bi-geo-alt-fill text-danger me-2"></i>
            <span className="text-truncate">{locationValue || 'Campus'}</span>
          </div>
          <div className="d-flex align-items-center">
            <i className="bi bi-calendar3 text-primary me-2"></i>
            <span>{formattedDate}</span>
          </div>
        </div>

        <Link to={detailLink} className="btn btn-outline-primary btn-sm w-100 fw-semibold">
          <i className="bi bi-eye me-1"></i> View Details
        </Link>
      </div>
    </div>
  );
};

export default ItemCard;

