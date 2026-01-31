import { useEffect, useState, useMemo } from 'react';
import { getNotifications } from '../services/api';
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

    // TODO: lấy từ auth/context
    const clubId = localStorage.getItem('clubId');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                setLoading(true);
                const data = await getNotifications(clubId, token);
                setNotifications(data);
                setError('');
            } catch (err) {
                setError(err.message || 'Failed to load notifications');
            } finally {
                setLoading(false);
            }
        };
        loadNotifications();
    }, []);

    const filteredNotifications = useMemo(() => {
        let result = [...notifications];

        if (typeFilter !== 'all') {
            result = result.filter(n => n.type === typeFilter);
        }

        // Sort by date (newest first)
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return result;
    }, [notifications, typeFilter]);

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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

    if (error) {
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
                        Tất cả thông báo của bạn
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
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`glass-card notification-item ${notification.read ? 'is-read' : 'is-unread'}`}
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
                                            {notification.body}
                                        </p>

                                        {notification.data && notification.data.eventTitle && (
                                            <div className="notification-event-info">
                                                <div className="notification-event-title">
                                                    Sự kiện: {notification.data.eventTitle}
                                                </div>
                                                {notification.data.startAt && (
                                                    <div className="notification-event-time">
                                                        Thời gian: {formatDateTime(notification.data.startAt)}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <p className="notification-date">
                                            {formatDateTime(notification.createdAt)}
                                        </p>
                                    </div>

                                    <div className="notification-status">
                                        {notification.read ? (
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
                        ))}
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