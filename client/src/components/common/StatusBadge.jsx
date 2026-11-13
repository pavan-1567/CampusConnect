import React from 'react';

const statusConfig = {
  // Lost & Found
  OPEN: { bg: 'bg-primary', text: 'Open' },
  AVAILABLE: { bg: 'bg-success', text: 'Available' },
  UNDER_REVIEW: { bg: 'bg-info text-dark', text: 'Under Review' },
  MATCHED: { bg: 'bg-primary', text: 'Matched' },
  VERIFICATION_PENDING: { bg: 'bg-warning text-dark', text: 'Verification Pending' },
  UNDER_VERIFICATION: { bg: 'bg-warning text-dark', text: 'Under Verification' },
  APPROVED: { bg: 'bg-success', text: 'Approved' },
  REJECTED: { bg: 'bg-danger', text: 'Rejected' },
  RETURNED: { bg: 'bg-success', text: 'Returned' },
  CLOSED: { bg: 'bg-secondary', text: 'Closed' },
  RESERVED: { bg: 'bg-warning text-dark', text: 'Reserved' },
  HANDED_OVER_TO_ADMIN: { bg: 'bg-info text-dark', text: 'With Admin Office' },

  // Responses & Matches & Handovers
  PENDING: { bg: 'bg-warning text-dark', text: 'Pending' },
  ACCEPTED: { bg: 'bg-primary', text: 'Accepted' },
  SCHEDULED: { bg: 'bg-primary', text: 'Scheduled' },
  COMPLETED: { bg: 'bg-success', text: 'Completed' },
  CANCELLED: { bg: 'bg-danger', text: 'Cancelled' },

  // Account
  ACTIVE: { bg: 'bg-success', text: 'Active' },
  PENDING_APPROVAL: { bg: 'bg-warning text-dark', text: 'Pending Approval' },
  DEACTIVATED: { bg: 'bg-danger', text: 'Deactivated' },
};

const StatusBadge = ({ status = 'OPEN', className = '' }) => {
  const config = statusConfig[status] || { bg: 'bg-secondary', text: status };

  return (
    <span className={`badge rounded-pill px-3 py-2 fw-semibold ${config.bg} ${className}`}>
      {config.text}
    </span>
  );
};

export default StatusBadge;

