import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getAdminDashboard();
        setData(response.data);
      } catch (err) {
        console.error('Failed to load admin dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating college statistics and live metrics..." />;
  }

  const stats = data?.stats || {};
  const recentLost = data?.recentLost || [];
  const recentFound = data?.recentFound || [];
  const recentResponses = data?.recentResponses || [];
  const recentHandovers = data?.recentHandovers || [];
  const categoryDist = data?.categoryDistribution || [];

  // Chart 1: Category Distribution Doughnut
  const categoryLabels = categoryDist.map((c) => c._id || 'Other');
  const categoryCounts = categoryDist.map((c) => c.count);

  const doughnutData = {
    labels: categoryLabels.length > 0 ? categoryLabels : ['ID Cards', 'Electronics', 'Books', 'Other'],
    datasets: [
      {
        data: categoryCounts.length > 0 ? categoryCounts : [4, 6, 3, 2],
        backgroundColor: [
          '#1D4ED8',
          '#0F766E',
          '#F59E0B',
          '#8B5CF6',
          '#EC4899',
          '#10B981',
          '#64748B',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Chart 2: Pipeline Overview Bar Chart
  const pipelineBarData = {
    labels: ['Total Lost', 'Total Found', 'Responses', 'Matches', 'Handovers Done'],
    datasets: [
      {
        label: 'Volume',
        data: [
          stats.totalLostReports || 0,
          stats.totalFoundReports || 0,
          stats.totalResponses || 0,
          stats.potentialMatches || 0,
          stats.successfullyReturned || 0,
        ],
        backgroundColor: ['#1D4ED8', '#0F766E', '#F59E0B', '#3B82F6', '#16A34A'],
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="container-fluid px-0">
      {/* Top Banner */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-navy mb-1">Administrative Overview</h3>
          <p className="text-muted small mb-0">
            Real-time management dashboard for CampusConnect Lost & Found Operations.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/verification" className="btn btn-warning text-dark fw-bold btn-sm shadow-xs">
            <i className="bi bi-patch-check me-1"></i> Verify Claims ({stats.pendingVerifications || 0})
          </Link>
          <Link to="/admin/handovers" className="btn btn-primary fw-bold btn-sm shadow-xs">
            <i className="bi bi-calendar-check me-1"></i> Handovers ({stats.scheduledHandovers || 0})
          </Link>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-secondary fw-semibold">Students</span>
              <div className="p-2 rounded bg-primary bg-opacity-10 text-primary">
                <i className="bi bi-people-fill fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold text-navy mb-1">{stats.totalRegisteredStudents || 0}</h3>
            <div className="small text-muted">
              Active: <strong className="text-success">{stats.activeStudents || 0}</strong> • Pending:{' '}
              <strong className="text-warning">{stats.pendingStudentRegistrations || 0}</strong>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-secondary fw-semibold">Lost Reports</span>
              <div className="p-2 rounded bg-danger bg-opacity-10 text-danger">
                <i className="bi bi-search fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold text-navy mb-1">{stats.totalLostReports || 0}</h3>
            <div className="small text-muted">
              Under Review: <strong className="text-info">{stats.pendingReviews || 0}</strong>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-secondary fw-semibold">Found Items</span>
              <div className="p-2 rounded bg-teal bg-opacity-10 text-teal">
                <i className="bi bi-box-seam-fill fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold text-navy mb-1">{stats.totalFoundReports || 0}</h3>
            <div className="small text-muted">
              Responses: <strong>{stats.totalResponses || 0}</strong>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-secondary fw-semibold">Items Returned</span>
              <div className="p-2 rounded bg-success bg-opacity-10 text-success">
                <i className="bi bi-check-circle-fill fs-5"></i>
              </div>
            </div>
            <h3 className="fw-bold text-navy mb-1">{stats.successfullyReturned || 0}</h3>
            <div className="small text-muted">
              Success Rate:{' '}
              <strong className="text-success">
                {stats.totalLostReports > 0
                  ? Math.round((stats.successfullyReturned / stats.totalLostReports) * 100)
                  : 0}
                %
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="fw-bold text-navy mb-0">Pipeline Funnel Metrics</h6>
            </div>
            <div className="card-body p-4 d-flex align-items-center">
              <div className="w-100" style={{ maxHeight: '280px' }}>
                <Bar
                  data={pipelineBarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="fw-bold text-navy mb-0">Category Breakdown</h6>
            </div>
            <div className="card-body p-4 d-flex align-items-center justify-content-center">
              <div style={{ width: '220px', height: '220px' }}>
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="row g-4">
        {/* Latest Lost Requests */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold text-navy mb-0">Recent Lost Reports</h6>
              <Link to="/admin/lost-items" className="btn btn-sm btn-link text-decoration-none fw-semibold">
                View All
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Student</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLost.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="fw-bold text-navy text-truncate" style={{ maxWidth: '160px' }}>
                          {item.itemName}
                        </div>
                        <small className="text-muted">{item.category}</small>
                      </td>
                      <td>
                        <div className="small fw-semibold">{item.studentId?.name || 'Student'}</div>
                        <small className="text-muted">{item.studentId?.collegeId}</small>
                      </td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td>
                        <Link to="/admin/lost-items" className="btn btn-sm btn-light">
                          <i className="bi bi-pencil-square"></i>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Latest Responses */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold text-navy mb-0">Latest Student Responses</h6>
              <Link to="/admin/responses" className="btn btn-sm btn-link text-decoration-none fw-semibold">
                View All
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Responder</th>
                    <th>For Item</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentResponses.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <div className="small fw-semibold">{r.responderId?.name}</div>
                        <small className="text-muted">{r.responderId?.collegeId}</small>
                      </td>
                      <td>
                        <div className="small text-truncate" style={{ maxWidth: '160px' }}>
                          {r.lostItemId?.itemName || 'Item'}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td>
                        <Link to="/admin/responses" className="btn btn-sm btn-primary">
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

