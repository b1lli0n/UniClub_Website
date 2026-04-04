import { useEffect, useState, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import { fetchNotifications, markNotificationAsRead } from '../api/notificationApi';
import { acceptInvitation, rejectInvitation } from '../api/invitationApi';
import '../styles/Notifications.css';
import {
    Bell,
    CheckCircle,
    XCircle,
    Calendar,
    Clock,
    Info,
    AlertCircle,
    Filter,
    Sparkles,
    Search,
    Check
} from 'lucide-react';

const getNotificationConfig = (type) => {
    const configs = {
        event_canceled: { label: 'Sự kiện bị hủy', icon: XCircle, colorClass: 'error' },
        join_request_approved: { label: 'Yêu cầu được duyệt', icon: CheckCircle, colorClass: 'success' },
        join_request_rejected: { label: 'Yêu cầu bị từ chối', icon: AlertCircle, colorClass: 'danger' },
        event_reminder: { label: 'Nhắc nhở', icon: Clock, colorClass: 'info' },
        general: { label: 'Thông báo chung', icon: Info, colorClass: 'general' }
    };
    return configs[type] || configs.general;
};

const NotificationTypeBadge = ({ type }) => {
    const config = getNotificationConfig(type);
    const Icon = config.icon;

    return (
        <span className={`noti-badge-premium noti-badge-${config.colorClass}`}>
            <Icon size={12} />
            {config.label}
        </span>
    );
};

const getInvitationMeta = (notificationItem) => {
    const notification = notificationItem?.notification || notificationItem || {};
    const payload = notification.payload || notification.metadata || notification.data || {};

    const invitationRaw =
        payload.invitation ||
        payload.invitationInfo ||
        payload.data ||
        null;

    const invitationId =
        payload.invitationId ||
        payload.invitation_id ||
        payload.inviteId ||
        payload.referenceId ||
        payload.reference_id ||
        invitationRaw?._id ||
        invitationRaw?.id ||
        notification.invitationId ||
        notification.invitation_id ||
        null;

    const clubId =
        payload.clubId ||
        payload.club_id ||
        invitationRaw?.clubId ||
        invitationRaw?.club_id ||
        localStorage.getItem('clubId') ||
        null;

    const status =
        payload.status ||
        payload.invitationStatus ||
        invitationRaw?.status ||
        null;

    const typeText = String(notification.type || '').toLowerCase();
    const isInvitation = typeText.includes('invitation') || Boolean(invitationId);

    return { isInvitation, invitationId, clubId, status };
};

const isFinalInvitationStatus = (status) => {
    const normalized = String(status || '').toLowerCase();
    return ['approved', 'accepted', 'rejected', 'declined', 'canceled', 'cancelled'].includes(normalized);
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(20);
    const [invitationActionLoading, setInvitationActionLoading] = useState({});

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
            setError(err.message || 'Không thể tải thông báo');
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

    const handleInvitationAction = async (notificationItem, action) => {
        const meta = getInvitationMeta(notificationItem);
        if (!meta.invitationId) {
            toast.error('Không tìm thấy mã lời mời để xử lý');
            return;
        }

        const notificationId = notificationItem._id || notificationItem?.notification?._id || meta.invitationId;
        setInvitationActionLoading((prev) => ({ ...prev, [notificationId]: action }));

        try {
            if (action === 'accept') {
                await acceptInvitation(meta.invitationId, meta.clubId);
                toast.success('Đã đồng ý tham gia câu lạc bộ');
            } else {
                await rejectInvitation(meta.invitationId, meta.clubId);
                toast.success('Đã từ chối lời mời');
            }

            await handleMarkAsRead(notificationItem);
            await loadNotifications();
        } catch (err) {
            toast.error(err?.message || 'Xử lý lời mời thất bại');
        } finally {
            setInvitationActionLoading((prev) => {
                const next = { ...prev };
                delete next[notificationId];
                return next;
            });
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
            <div className="noti-page-wrapper">
                <div className="noti-container">
                    <div className="glass-card-premium loading-placeholder-premium">
                        <div className="mini-spinner-large"></div>
                        <p>Đang tải thông báo...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && notifications.length === 0) {
        return (
            <div className="noti-page-wrapper">
                <div className="noti-container">
                    <div className="glass-card-premium error-placeholder-premium">
                        <AlertCircle size={48} className="icon-error-red" />
                        <h3 className="error-title-modern">{error}</h3>
                        <button className="btn-retry-premium" onClick={loadNotifications}>
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="noti-page-wrapper">
            <div className="noti-container">
                {/* Header */}
                <header className="noti-header-premium">
                    <div className="noti-header-left">
                        <div className="noti-badge-count-wrap">
                            <div className="header-badge-premium highlight">
                                <Sparkles size={14} />
                                Trung tâm thông báo
                            </div>
                            <h1 className="noti-page-title">Thông báo</h1>
                        </div>
                        <div className="noti-count-pill-premium">
                            <Bell size={16} />
                            <span>{unreadCount} tin nhắn mới</span>
                        </div>
                    </div>
                </header>

                {/* Filter section */}
                <div className="noti-controls-row-premium">
                    <div className="filter-group-modern">
                        <div className="filter-label-wrap">
                            <Filter size={18} />
                            <span>Phân loại:</span>
                        </div>
                        <div className="filter-pills-wrap">
                            {['all', 'event_canceled', 'event_reminder', 'join_request_approved'].map((type) => (
                                <button
                                    key={type}
                                    className={`filter-pill-modern ${typeFilter === type ? 'active' : ''}`}
                                    onClick={() => setTypeFilter(type)}
                                >
                                    {type === 'all' ? 'Tất cả' : getNotificationConfig(type).label}
                                </button>
                            ))}
                            <div className="mobile-only-filter">
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="noti-filter-select-mobile"
                                >
                                    <option value="all">Tất cả</option>
                                    <option value="event_canceled">Sự kiện bị hủy</option>
                                    <option value="join_request_approved">Yêu cầu được duyệt</option>
                                    <option value="join_request_rejected">Yêu cầu bị từ chối</option>
                                    <option value="event_reminder">Nhắc nhở</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications list */}
                <div className="noti-content-area">
                    {filteredNotifications.length > 0 ? (
                        <div className="noti-stack-premium">
                            {filteredNotifications.map((notificationItem) => {
                                const notification = notificationItem.notification || notificationItem;
                                const isRead = notificationItem.is_read ?? notification.is_read ?? false;
                                const createdAt = notificationItem.created_at || notification.created_at || notification.createdAt;
                                const config = getNotificationConfig(notification.type);
                                const Icon = config.icon;
                                const inviteMeta = getInvitationMeta(notificationItem);
                                const showInvitationActions =
                                    inviteMeta.isInvitation &&
                                    inviteMeta.invitationId &&
                                    !isFinalInvitationStatus(inviteMeta.status);
                                const actionLoading = invitationActionLoading[notificationItem._id || notification._id];

                                return (
                                    <div
                                        key={notificationItem._id || notification._id}
                                        className={`noti-card-premium ${isRead ? 'is-read' : 'is-unread'}`}
                                        onClick={() => handleMarkAsRead(notificationItem)}
                                    >
                                        <div className="noti-card-inner">
                                            <div className="noti-icon-column">
                                                <div className={`noti-icon-wrapper-premium color-${config.colorClass}`}>
                                                    <Icon size={24} />
                                                </div>
                                                {!isRead && <div className="noti-unread-glow"></div>}
                                            </div>

                                            <div className="noti-content-column">
                                                <div className="noti-top-row">
                                                    <h3 className="noti-title-modern">{notification.title}</h3>
                                                    <div className="noti-meta-right">
                                                        <NotificationTypeBadge type={notification.type} />
                                                        <span className="noti-time-modern">
                                                            <Clock size={12} />
                                                            {formatDateTime(createdAt)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className="noti-body-modern">
                                                    {notification.description || notification.body}
                                                </p>

                                                {showInvitationActions && (
                                                    <div className="noti-invite-actions" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            type="button"
                                                            className="noti-invite-btn noti-invite-btn-accept"
                                                            disabled={Boolean(actionLoading)}
                                                            onClick={() => handleInvitationAction(notificationItem, 'accept')}
                                                        >
                                                            {actionLoading === 'accept' ? 'Đang xử lý...' : 'Đồng ý tham gia'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="noti-invite-btn noti-invite-btn-reject"
                                                            disabled={Boolean(actionLoading)}
                                                            onClick={() => handleInvitationAction(notificationItem, 'reject')}
                                                        >
                                                            {actionLoading === 'reject' ? 'Đang xử lý...' : 'Từ chối'}
                                                        </button>
                                                    </div>
                                                )}

                                                {notification.payload?.eventTitle && (
                                                    <div className="noti-event-box-premium">
                                                        <Calendar size={14} className="icon-soft" />
                                                        <div className="event-box-text">
                                                            <strong>Sự kiện:</strong> {notification.payload.eventTitle}
                                                            {notification.payload.startAt && (
                                                                <span className="ml-2 opacity-70">
                                                                    ({formatDateTime(notification.payload.startAt)})
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="noti-footer-row">
                                                    <div className="noti-status-indication">
                                                        {isRead ? (
                                                            <div className="noti-status-read-wrap">
                                                                <Check size={14} />
                                                                <span>Đã đọc</span>
                                                            </div>
                                                        ) : (
                                                            <div className="noti-status-unread-wrap">
                                                                <Sparkles size={14} />
                                                                <span>Mới</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="glass-card-premium noti-empty-state-premium">
                            <div className="noti-empty-icon-wrap">
                                <Bell size={48} />
                            </div>
                            <h3 className="noti-empty-title-modern">Không có thông báo nào</h3>
                            <p className="noti-empty-text-modern">
                                Bạn sẽ nhận được thông báo khi có hoạt động mới liên quan đến sự kiện hoặc câu lạc bộ.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}