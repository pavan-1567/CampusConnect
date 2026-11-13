import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon = 'bi-inbox',
  title = 'No records found',
  description = 'There are no items or activities matching your criteria right now.',
  actionText = '',
  actionLink = '',
  onAction = null,
}) => {
  return (
    <div className="card border-0 shadow-sm p-5 text-center my-4 bg-white">
      <div className="mb-3">
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-primary"
          style={{ width: '80px', height: '80px' }}
        >
          <i className={`bi ${icon} fs-1`}></i>
        </div>
      </div>
      <h4 className="fw-bold text-navy mb-2">{title}</h4>
      <p className="text-muted mx-auto mb-4" style={{ maxWidth: '480px' }}>
        {description}
      </p>
      {(actionText && actionLink) && (
        <div>
          <Link to={actionLink} className="btn btn-primary px-4 fw-semibold">
            {actionText}
          </Link>
        </div>
      )}
      {(actionText && onAction && !actionLink) && (
        <div>
          <button type="button" onClick={onAction} className="btn btn-primary px-4 fw-semibold">
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;

