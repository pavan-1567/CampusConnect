import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/auth/admin-login');
  };

  const navItems = [
    { to: '/admin/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
    { to: '/admin/students', icon: 'bi-people', label: 'Student Management' },
    { to: '/admin/lost-items', icon: 'bi-search', label: 'Lost Requests' },
    { to: '/admin/found-items', icon: 'bi-box-seam', label: 'Found Reports' },
    { to: '/admin/responses', icon: 'bi-chat-left-text', label: 'Responses' },
    { to: '/admin/matches', icon: 'bi-diagram-3', label: 'Potential Matches' },
    { to: '/admin/verification', icon: 'bi-patch-check', label: 'Ownership Verification' },
    { to: '/admin/handovers', icon: 'bi-arrow-left-right', label: 'Handover Management' },
    { to: '/admin/analytics', icon: 'bi-bar-chart-line', label: 'Analytics & Reports' },
    { to: '/admin/audit-logs', icon: 'bi-journal-text', label: 'Audit Logs' },
    { to: '/admin/settings', icon: 'bi-gear', label: 'Settings & Roster' },
  ];

  const sidebarContent = (
    <div className="d-flex flex-column h-100 bg-navy text-white">
      {/* Brand */}
      <div className="p-3 border-bottom border-secondary border-opacity-25 d-flex align-items-center">
        <span
          className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle me-3"
          style={{ width: '40px', height: '40px' }}
        >
          <i className="bi bi-shield-shaded fs-5"></i>
        </span>
        <div>
          <h6 className="fw-bold mb-0 text-white">CampusConnect</h6>
          <span className="badge bg-danger rounded-pill px-2" style={{ fontSize: '0.65rem' }}>
            ADMIN CONSOLE
          </span>
        </div>
      </div>

      {/* Nav items */}
      <div className="p-3 flex-grow-1 overflow-y-auto">
        <ul className="nav flex-column gap-1">
          {navItems.map((item) => (
            <li key={item.to} className="nav-item">
              <NavLink
                to={item.to}
                onClick={() => setIsOffcanvasOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link sidebar-link-admin ${isActive ? 'active' : ''}`
                }
              >
                <i className={`bi ${item.icon}`}></i>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Admin User info & Logout */}
      <div className="p-3 border-top border-secondary border-opacity-25 bg-black bg-opacity-25">
        <div className="d-flex align-items-center mb-3">
          <div
            className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center me-2 fw-bold"
            style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}
          >
            AD
          </div>
          <div className="text-truncate">
            <div className="fw-bold text-white small text-truncate">{user?.name}</div>
            <div className="text-secondary small text-truncate" style={{ fontSize: '0.75rem' }}>
              {user?.collegeId} (Administrator)
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>Admin Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Desktop Fixed Sidebar */}
      <aside
        className="d-none d-lg-block position-fixed top-0 bottom-0 start-0 shadow"
        style={{ width: '260px', zIndex: 1020 }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Offcanvas */}
      <div
        className={`offcanvas offcanvas-start ${isOffcanvasOpen ? 'show' : ''}`}
        tabIndex="-1"
        style={{ visibility: isOffcanvasOpen ? 'visible' : 'hidden', width: '280px' }}
      >
        <div className="offcanvas-header bg-navy p-2 justify-content-end">
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={() => setIsOffcanvasOpen(false)}
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body p-0">{sidebarContent}</div>
      </div>
      {isOffcanvasOpen && (
        <div
          className="offcanvas-backdrop fade show"
          onClick={() => setIsOffcanvasOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="admin-main-content d-flex flex-column min-vh-100 flex-grow-1">
        {/* Top Navbar */}
        <header className="navbar navbar-expand bg-white border-bottom py-2 px-3 px-lg-4 sticky-top shadow-xs">
          <div className="container-fluid p-0">
            <button
              className="btn btn-light d-lg-none me-2"
              type="button"
              onClick={() => setIsOffcanvasOpen(true)}
              aria-label="Toggle navigation"
            >
              <i className="bi bi-list fs-5"></i>
            </button>

            <span className="navbar-text text-secondary small d-none d-sm-block">
              <i className="bi bi-shield-lock-fill text-danger me-1"></i>
              College Administrative Authority Workspace
            </span>

            <div className="ms-auto d-flex align-items-center gap-3">
              <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-2 fw-semibold">
                Super Admin Access
              </span>
              <div className="d-flex align-items-center">
                <i className="bi bi-person-badge text-navy fs-4 me-1"></i>
                <span className="fw-semibold text-navy small">{user?.name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Outlet */}
        <main className="flex-grow-1 p-3 p-lg-4 bg-light">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

