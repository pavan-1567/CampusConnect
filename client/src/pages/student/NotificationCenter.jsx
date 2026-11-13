import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../features/notifications/notificationSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'RESPONSE_RECEIVED':
      return { icon: 'bi-reply-all-fill', color: 'text-primary', bg: 'bg-primary bg-opacity-10' };
    case 'ADMIN_REVIEWED':
      return { icon: 'bi-chat-left-text-fill', color: 'text-info', bg: 'bg-info bg-opacity-10' };
    case 'VERIFICATION_REQUESTED':
      return { icon: 'bi-shield-check', color: 'text-warning', bg: 'bg-warning bg-opacity-10' };
    case 'CLAIM_APPROVED':
      return { icon: 'bi-patch-check-fill', color: 'text-success', bg: 'bg-success bg-opacity-10' };
    case 'CLAIM_REJECTED':
      return { icon: 'bi-x-circle-fill', color: 'text-danger', bg: 'bg-danger bg-opacity-10' };
    case 'COLLECTION_SCHEDULED':
      return { icon: 'bi-calendar-check-fill', color: 'text-primary', bg: 'bg-primary bg-opacity-10' };
    case 'HANDOVER_COMPLETED':
      return { icon: 'bi-check2-all', color: 'text-success', bg: 'bg-success bg-opacity-10' };
    default:
      return { icon: 'bi-bell-fill', color: 'text-secondary', bg: 'bg-secondary bg-opacity-10' };
  }
};

const NotificationCenter = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading } = useSelector(
    (state) => state.notifications
  );

  useEffect(() => {
    dispatch(fetchNotifications({ limit: 50 }));
  }, [dispatch]);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      dispatch(markNotificationRead(notif._id));
    }

    if (notif.relatedEntityType === 'LostItem' && notif.relatedEntityId) {
      navigate(`/student/lost-items/${notif.relatedEntityId}`);
    } else if (notif.relatedEntityType === 'FoundItem' && notif.relatedEntityId) {
      navigate(`/student/found-items/${notif.relatedEntityId}`);
    } else if (notif.relatedEntityType === 'Response') {
      navigate('/student/my-responses');
    } else if (['Match', 'Handover'].includes(notif.relatedEntityType)) {
      navigate('/student/my-lost');
    }
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  return (
    <div className="container-fluid px-0" style={{ maxWidth: '850px' }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3 className="fw-bold text-navy mb-1">Notification Center</h3>
          <p className="text-muted small mb-0">
            Real-time campus updates regarding your reports, responses, and item collections.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="btn btn-outline-primary btn-sm fw-semibold"
            onClick={handleMarkAllRead}
          >
            <i className="bi bi-check2-all me-1"></i> Mark All as Read
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon="bi-bell-slash"
          title="No Notifications Yet"
          description="You have no notifications at this time. Activity on your reported or found items will appear here."
        />
      ) : (
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="list-group list-group-flush">
            {notifications.map((n) => {
              const { icon, color, bg } = getNotificationIcon(n.type);
              return (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`list-group-item list-group-item-action p-3 p-md-4 d-flex align-items-start gap-3 cursor-pointer ${
                    !n.isRead ? 'bg-light bg-opacity-75 border-start border-primary border-4' : ''
                  }`}
                  style={{ transition: 'background-color 0.15s ease' }}
                >
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center p-3 ${bg} ${color}`}
                    style={{ width: '45px', height: '45px', minWidth: '45px' }}
                  >
                    <i className={`bi ${icon} fs-5`}></i>
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <h6 className={`mb-0 fw-bold ${!n.isRead ? 'text-primary' : 'text-navy'}`}>
                        {n.title}
                      </h6>
                      <small className="text-muted">
                        {new Date(n.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </small>
                    </div>

                    <p className="text-secondary small mb-1 leading-relaxed">{n.message}</p>

                    <div className="d-flex align-items-center gap-2 mt-2">
                      <span className="badge bg-secondary bg-opacity-10 text-secondary" style={{ fontSize: '0.7rem' }}>
                        {n.type.replace(/_/g, ' ')}
                      </span>
                      {!n.isRead && (
                        <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.65rem' }}>
                          Unread
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

