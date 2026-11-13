import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import authService from '../../services/authService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const StudentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await authService.getStudentDashboard();
        setDashboardData(response.data);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  const stats = dashboardData?.stats || {
    totalLostSubmitted: 0,
    totalFoundSubmitted: 0,
    totalResponsesReceived: 0,
    totalReturned: 0,
  };

  const recentLost = dashboardData?.recentActivity?.recentLost || [];
  const recentFound = dashboardData?.recentActivity?.recentFound || [];

  return (
    <div className="container-fluid px-0">
      {/* Welcome Banner */}
      <div className="card border-0 shadow-sm bg-navy text-white mb-4 overflow-hidden">
        <div className="card-body p-4 p-lg-5 position-relative">
          <div className="row align-items-center">
            <div className="col-12 col-md-8">
              <span className="badge bg-primary mb-2 px-3 py-1 fw-normal">
                {user?.department} • {user?.academicYear}
              </span>
              <h2 className="fw-bold mb-2">Welcome back, {user?.name}!</h2>
              <p className="text-light text-opacity-75 mb-0" style={{ maxWidth: '600px' }}>
                "Lost something? Found something? Let's reconnect." CampusConnect provides a verified,
                secure pipeline to recover lost belongings or return items to fellow students.
              </p>
            </div>
            <div className="col-12 col-md-4 mt-3 mt-md-0 text-md-end">
              <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-3 py-2 fs-6">
                <i className="bi bi-shield-check me-1"></i> Roster Verified Student
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <Link
            to="/student/report-lost"
            className="btn btn-primary w-100 py-3 d-flex flex-column align-items-center justify-content-center shadow-sm"
          >
            <i className="bi bi-plus-circle fs-3 mb-1"></i>
            <span className="fw-bold">Report Lost Item</span>
          </Link>
        </div>
        <div className="col-6 col-md-3">
          <Link
            to="/student/report-found"
            className="btn btn-teal w-100 py-3 d-flex flex-column align-items-center justify-content-center shadow-sm"
          >
            <i className="bi bi-check2-circle fs-3 mb-1"></i>
            <span className="fw-bold">Report Found Item</span>
          </Link>
        </div>
        <div className="col-6 col-md-3">
          <Link
            to="/student/browse-lost"
            className="btn btn-outline-primary w-100 py-3 d-flex flex-column align-items-center justify-content-center bg-white shadow-sm"
          >
            <i className="bi bi-search fs-3 mb-1"></i>
            <span className="fw-bold">Browse Lost</span>
          </Link>
        </div>
        <div className="col-6 col-md-3">
          <Link
            to="/student/browse-found"
            className="btn btn-outline-secondary w-100 py-3 d-flex flex-column align-items-center justify-content-center bg-white shadow-sm"
          >
            <i className="bi bi-box-seam fs-3 mb-1"></i>
            <span className="fw-bold">Browse Found</span>
          </Link>
        </div>
      </div>

      {/* Database-Driven Statistics Grid */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold">My Lost Requests</span>
              <div className="bg-primary bg-opacity-10 text-primary rounded p-2">
                <i className="bi bi-file-earmark-text fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold text-navy mb-0">{stats.totalLostSubmitted}</h3>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold">My Found Reports</span>
              <div className="bg-success bg-opacity-10 text-success rounded p-2">
                <i className="bi bi-archive fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold text-navy mb-0">{stats.totalFoundSubmitted}</h3>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold">Responses Received</span>
              <div className="bg-warning bg-opacity-10 text-warning rounded p-2">
                <i className="bi bi-reply-all fs-5 text-warning"></i>
              </div>
            </div>
            <h3 className="fw-bold text-navy mb-0">{stats.totalResponsesReceived}</h3>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold">Items Returned</span>
              <div className="bg-teal bg-opacity-10 text-teal rounded p-2">
                <i className="bi bi-check-circle fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold text-navy mb-0">{stats.totalReturned}</h3>
          </div>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="row g-4">
        {/* Recent Lost Requests */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3 d-flex align-items-center justify-content-between">
              <h5 className="fw-bold text-navy mb-0">My Recent Lost Reports</h5>
              <Link to="/student/my-lost" className="btn btn-sm btn-link text-decoration-none fw-semibold">
                View All ({stats.totalLostSubmitted})
              </Link>
            </div>
            <div className="card-body p-0">
              {recentLost.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <i className="bi bi-file-earmark-x fs-1 text-secondary mb-2 d-block"></i>
                  <p className="mb-0">No lost items reported by you yet.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentLost.map((item) => (
                    <Link
                      key={item._id}
                      to={`/student/lost-items/${item._id}`}
                      className="list-group-item list-group-item-action p-3 d-flex align-items-center justify-content-between"
                    >
                      <div className="d-flex align-items-center text-truncate me-3">
                        <div
                          className="rounded bg-light d-flex align-items-center justify-content-center me-3"
                          style={{ width: '48px', height: '48px', minWidth: '48px' }}
                        >
                          {item.image ? (
                            <img src={item.image} alt="" className="w-100 h-100 object-fit-cover rounded" />
                          ) : (
                            <i className="bi bi-search text-muted"></i>
                          )}
                        </div>
                        <div className="text-truncate">
                          <h6 className="fw-bold text-navy mb-1 text-truncate">{item.itemName}</h6>
                          <div className="small text-secondary text-truncate">
                            <i className="bi bi-geo-alt me-1"></i> {item.lastSeenLocation} •{' '}
                            {new Date(item.lostDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={item.status} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Found Reports */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3 d-flex align-items-center justify-content-between">
              <h5 className="fw-bold text-navy mb-0">My Recent Found Reports</h5>
              <Link to="/student/my-found" className="btn btn-sm btn-link text-decoration-none fw-semibold">
                View All ({stats.totalFoundSubmitted})
              </Link>
            </div>
            <div className="card-body p-0">
              {recentFound.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <i className="bi bi-inbox fs-1 text-secondary mb-2 d-block"></i>
                  <p className="mb-0">No found items reported by you yet.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentFound.map((item) => (
                    <Link
                      key={item._id}
                      to={`/student/found-items/${item._id}`}
                      className="list-group-item list-group-item-action p-3 d-flex align-items-center justify-content-between"
                    >
                      <div className="d-flex align-items-center text-truncate me-3">
                        <div
                          className="rounded bg-light d-flex align-items-center justify-content-center me-3"
                          style={{ width: '48px', height: '48px', minWidth: '48px' }}
                        >
                          {item.image ? (
                            <img src={item.image} alt="" className="w-100 h-100 object-fit-cover rounded" />
                          ) : (
                            <i className="bi bi-box-seam text-muted"></i>
                          )}
                        </div>
                        <div className="text-truncate">
                          <h6 className="fw-bold text-navy mb-1 text-truncate">{item.itemName}</h6>
                          <div className="small text-secondary text-truncate">
                            <i className="bi bi-geo-alt me-1"></i> {item.foundLocation} •{' '}
                            {new Date(item.foundDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={item.status} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

