import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';
import { fetchNotifications } from '../features/notifications/notificationSlice';

const StudentLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications({ limit: 10 }));
    const timer = setInterval(() => {
      dispatch(fetchNotifications({ limit: 10 }));
    }, 60000);
    return () => clearInterval(timer);
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/auth/login');
  };

  const navItems = [
    { to: '/student/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/student/report-lost', icon: 'bi-plus-circle', label: 'Report Lost Item' },
    { to: '/student/report-found', icon: 'bi-check2-circle', label: 'Report Found Item' },
    { to: '/student/browse-lost', icon: 'bi-search', label: 'Browse Lost Items' },
    { to: '/student/browse-found', icon: 'bi-box-seam', label: 'Browse Found Items' },
    { to: '/student/my-lost', icon: 'bi-file-earmark-text', label: 'My Lost Requests' },
    { to: '/student/my-found', icon: 'bi-archive', label: 'My Found Reports' },
    { to: '/student/my-responses', icon: 'bi-reply-all', label: 'My Responses' },
    {
      to: '/student/notifications',
      icon: 'bi-bell',
      label: 'Notifications',
      badge: unreadCount > 0 ? unreadCount : null,
    },
    { to: '/student/profile', icon: 'bi-person-circle', label: 'My Profile' },
  ];

  const sidebarContent = (
    <div className="d-flex flex-column h-100">
      {/* Brand */}
      <div className="p-3 border-bottom d-flex align-items-center">
        <span
          className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle me-3"
          style={{ width: '40px', height: '40px' }}
        >
          <i className="bi bi-shield-check fs-5"></i>
        </span>
        <div>
          <h6 className="fw-bold mb-0 text-navy">CampusConnect</h6>
          <small className="text-teal" style={{ fontSize: '0.75rem' }}>
            Student Portal
          </small>
        </div>
      </div>

      {/* Nav Links */}
      <div className="p-3 flex-grow-1 overflow-y-auto">
        <ul className="nav flex-column gap-1">
          {navItems.map((item) => (
            <li key={item.to} className="nav-item">
              <NavLink
                to={item.to}
                onClick={() => setIsOffcanvasOpen(false)}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <i className={`bi ${item.icon}`}></i>
                <span className="flex-grow-1">{item.label}</span>
                {item.badge && (
                  <span className="badge bg-danger rounded-pill px-2">{item.badge}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* User Info & Logout */}
      <div className="p-3 border-top bg-light">
        <div className="d-flex align-items-center mb-3">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2 fw-bold"
            style={{ width: '38px', height: '38px', fontSize: '0.9rem' }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="text-truncate">
            <div className="fw-bold text-navy text-truncate small">{user?.name}</div>
            <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
              {user?.collegeId}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Desktop Fixed Sidebar */}
      <aside
        className="d-none d-lg-block bg-white border-end position-fixed top-0 bottom-0 start-0 shadow-sm"
        style={{ width: '260px', zIndex: 1020 }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Offcanvas Sidebar */}
      <div
        className={`offcanvas offcanvas-start ${isOffcanvasOpen ? 'show' : ''}`}
        tabIndex="-1"
        style={{ visibility: isOffcanvasOpen ? 'visible' : 'hidden', width: '280px' }}
      >
        <div className="offcanvas-header p-2 justify-content-end">
          <button
            type="button"
            className="btn-close"
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
      <div className="student-main-content d-flex flex-column min-vh-100 flex-grow-1">
        {/* Top Header Navbar */}
        <header className="navbar navbar-expand bg-white border-bottom py-2 px-3 px-lg-4 sticky-top shadow-xs">
          <div className="container-fluid p-0">
            {/* Mobile Toggle Button */}
            <button
              className="btn btn-light d-lg-none me-2"
              type="button"
              onClick={() => setIsOffcanvasOpen(true)}
              aria-label="Toggle navigation"
            >
              <i className="bi bi-list fs-5"></i>
            </button>

            <span className="navbar-text d-none d-sm-block text-secondary small">
              <span className="text-primary fw-semibold">{user?.department}</span> •{' '}
              {user?.academicYear}
            </span>

            <div className="ms-auto d-flex align-items-center gap-3">
              {/* Notifications Link */}
              <Link
                to="/student/notifications"
                className="btn btn-light rounded-circle position-relative p-2"
                title="Notifications"
              >
                <i className="bi bi-bell fs-5 text-secondary"></i>
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* Profile Pill */}
              <Link to="/student/profile" className="d-flex align-items-center text-decoration-none text-navy">
                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 me-2 d-none d-md-inline-block">
                  Verified Student
                </span>
                <span className="fw-semibold small d-none d-md-inline">{user?.name}</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Dynamic Outlet Page Content */}
        <main className="flex-grow-1 p-3 p-lg-4 bg-light">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
