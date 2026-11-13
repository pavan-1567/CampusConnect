import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [actionFilter, setActionFilter] = useState('All');
  const [page, setPage] = useState(1);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAuditLogs({
        page,
        limit: 20,
        action: actionFilter !== 'All' ? actionFilter : undefined,
      });
      setLogs(res.data.logs || []);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const getActionBadge = (action) => {
    if (action.includes('APPROVED') || action.includes('COMPLETED') || action.includes('VERIFIED')) {
      return 'bg-success';
    }
    if (action.includes('REJECTED') || action.includes('DEACTIVATED') || action.includes('CANCELLED')) {
      return 'bg-danger';
    }
    if (action.includes('CREATED') || action.includes('SCHEDULED')) {
      return 'bg-primary';
    }
    return 'bg-secondary';
  };

  return (
    <div className="container-fluid px-0">
      <div className="mb-4">
        <h3 className="fw-bold text-navy mb-1">Administrative Audit Logs</h3>
        <p className="text-muted small mb-0">
          Permanent security audit trail of all sensitive operations, ownership approvals, and handovers.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-4 overflow-x-auto pb-1">
        {[
          'All',
          'OWNERSHIP_VERIFIED',
          'OWNERSHIP_REJECTED',
          'HANDOVER_COMPLETED',
          'HANDOVER_SCHEDULED',
          'MATCH_CREATED',
          'STUDENT_APPROVED',
          'ROSTER_IMPORTED',
        ].map((act) => (
          <button
            key={act}
            type="button"
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${
              actionFilter === act ? 'btn-primary' : 'btn-outline-secondary bg-white'
            }`}
            onClick={() => {
              setActionFilter(act);
              setPage(1);
            }}
          >
            {act.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Audit Log Table */}
      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Administrator</th>
                <th>Action Type</th>
                <th>Entity Reference</th>
                <th>Activity Description</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <LoadingSpinner message="Retrieving secure audit logs..." />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No administrative audit events recorded for this filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <div className="small fw-bold text-navy">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                      <small className="text-muted">
                        {new Date(log.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </small>
                    </td>

                    <td>
                      <div className="small fw-semibold">{log.adminId?.name || 'System Admin'}</div>
                      <small className="text-muted">{log.adminId?.email}</small>
                    </td>

                    <td>
                      <span className={`badge rounded-pill px-2 py-1 ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td>
                      <span className="badge bg-light text-dark border">
                        {log.entityType}
                      </span>
                      {log.entityId && (
                        <code className="d-block small text-muted mt-1">
                          {log.entityId.substring(0, 8)}
                        </code>
                      )}
                    </td>

                    <td>
                      <span className="small text-secondary">{log.description}</span>
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
    </div>
  );
};

export default AuditLogs;

