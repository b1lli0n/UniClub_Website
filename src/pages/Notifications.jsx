import { useEffect, useState, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import { fetchNotifications, markNotificationAsRead } from '../api/notificationApi';
import '../styles/Notifications.css';

const NotificationTypeBadge = ({ type }) => {
    const typeConfig = {
        event_canceled: { label: 'Sự kiện bị hủy', className: 'event-canceled' },
        join_request_approved: { label: 'Yêu cầu được duyệt', className: 'join-request-approved' },
        join_request_rejected: { label: 'Yêu cầu bị từ chối', className: 'join-request-rejected' },
        event_reminder: { label: 'Nhắc nhở', className: 'event-reminder' },
        general: { label: 'Thông báo chung', className: 'general' }
    };
    const config = typeConfig[type] || typeConfig.general;

    return (
        <span className={`notification-type-badge notification-type-${config.className}`}>
            {config.label}
        </span>
    );
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(20);

    // TODO: lấy từ auth/context
    const clubId = localStorage.getItem('clubId') || 'default';

    const loadNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchNotifications(clubId, { page, limit, unread: false });

            // Handle different response formats
            if (Array.isArray(data)) {
                setNotifications(data);
                setTotal(data.length);
            } else if (data.items && Array.isArray(data.items)) {
                setNotifications(data.items);
                setTotal(data.total || data.items.length);
            } else {
                setNotifications([]);
                setTotal(0);
            }
            setError('');
        } catch (err) {
            console.error('Failed to load notifications:', err);
            setError(err.message || 'Failed to load notifications');
            toast.error(err.message || 'Không thể tải thông báo');
        } finally {
            setLoading(false);
        }
    }, [clubId, page, limit]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    // Listen for real-time notification updates
    useEffect(() => {
        const handleRealtimeNotification = () => {
            // Refetch notifications when new notification arrives
            loadNotifications();
        };

        window.addEventListener('notification_received', handleRealtimeNotification);
        return () => {
            window.removeEventListener('notification_received', handleRealtimeNotification);
        };
    }, [loadNotifications]);

    const handleMarkAsRead = async (notificationItem) => {
        if (notificationItem.is_read) {
            // Already read, do nothing
            return;
        }

        try {
            await markNotificationAsRead(clubId, notificationItem._id);
            // Update local state
            setNotifications(prev =>
                prev.map(n =>
                    n._id === notificationItem._id
                        ? { ...n, is_read: true }
                        : n
                )
            );
            toast.success('Đã đánh dấu đã đọc');
        } catch (err) {
            console.error('Failed to mark as read:', err);
            toast.error(err.message || 'Không thể đánh dấu đã đọc');
        }
    };

    const filteredNotifications = useMemo(() => {
        let result = [...notifications];

        if (typeFilter !== 'all') {
            result = result.filter(n => {
                const notificationObj = n.notification || n;
                return notificationObj.type === typeFilter;
            });
        }

        // Sort by date (newest first)
        result.sort((a, b) => {
            const dateA = new Date(a.created_at || a.createdAt || 0);
            const dateB = new Date(b.created_at || b.createdAt || 0);
            return dateB - dateA;
        });

        return result;
    }, [notifications, typeFilter]);

    const formatDateTime = (dateString) => {
        if (!dateString) return '--/--/---- --:--';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (loading) {
        return (
            <div className="home-page">
                <div className="home-overlay" />
                <div className="myclub-container">
                    <div className="glass-card notifications-loading-card">
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    if (error && notifications.length === 0) {
        return (
            <div className="home-page">
                <div className="home-overlay" />
                <div className="myclub-container">
                    <div className="glass-card notifications-error-card">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="home-page">
            <div className="home-overlay" />
            <div className="myclub-container">
                {/* Header */}
                <div className="notifications-header">
                    <h2 className="notifications-title">
                        Thông báo
                    </h2>
                    <p className="notifications-subtitle">
                        Tất cả thông báo của bạn ({unreadCount} chưa đọc)
                    </p>
                </div>

                {/* Filter section */}
                <div className="glass-card notifications-filter-card">
                    <div className="notifications-filter-row">
                        <span className="notifications-filter-label">
                            Lọc theo loại:
                        </span>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="notifications-filter-select"
                        >
                            <option value="all">Tất cả</option>
                            <option value="event_canceled">Sự kiện bị hủy</option>
                            <option value="join_request_approved">Yêu cầu được duyệt</option>
                            <option value="join_request_rejected">Yêu cầu bị từ chối</option>
                            <option value="event_reminder">Nhắc nhở</option>
                        </select>
                    </div>
                </div>

                {/* Notifications list */}
                {filteredNotifications.length > 0 ? (
                    <div className="notifications-list">
                        {filteredNotifications.map((notificationItem) => {
                            // Notification structure: { _id, notification: {...}, is_read, created_at }
                            const notification = notificationItem.notification || notificationItem;
                            const isRead = notificationItem.is_read ?? notification.is_read ?? false;
                            const createdAt = notificationItem.created_at || notification.created_at || notification.createdAt;

                            return (
                                <div
                                    key={notificationItem._id || notification._id}
                                    className={`glass-card notification-item ${isRead ? 'is-read' : 'is-unread'}`}
                                    onClick={() => handleMarkAsRead(notificationItem)}
                                >
                                    <div className="notification-row">
                                        <div className="notification-content">
                                            <div className="notification-header">
                                                <h3 className="notification-title">
                                                    {notification.title}
                                                </h3>
                                                <NotificationTypeBadge type={notification.type} />
                                            </div>

                                            <p className="notification-body">
                                                {notification.description || notification.body}
                                            </p>

                                            {notification.payload?.eventTitle && (
                                                <div className="notification-event-info">
                                                    <div className="notification-event-title">
                                                        Sự kiện: {notification.payload.eventTitle}
                                                    </div>
                                                    {notification.payload.startAt && (
                                                        <div className="notification-event-time">
                                                            Thời gian: {formatDateTime(notification.payload.startAt)}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <p className="notification-date">
                                                {formatDateTime(createdAt)}
                                            </p>
                                        </div>

                                        <div className="notification-status">
                                            {isRead ? (
                                                <span className="notification-status-read">
                                                    ✓ Đã đọc
                                                </span>
                                            ) : (
                                                <span className="notification-status-unread">
                                                    <span className="notification-status-dot" />
                                                    Mới
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="glass-card notifications-empty">
                        <div className="notifications-empty-icon">
                            🔔
                        </div>
                        <h3 className="notifications-empty-title">
                            Không có thông báo nào
                        </h3>
                        <p className="notifications-empty-text">
                            Bạn sẽ nhận được thông báo khi có hoạt động mới
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}