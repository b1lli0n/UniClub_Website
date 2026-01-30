import { useEffect, useState, useMemo } from 'react';
import { getNotifications } from '../services/api';

const NotificationTypeBadge = ({ type }) => {
    const typeConfig = {
        event_canceled: { label: 'Sự kiện bị hủy', bg: 'var(--candy-lightpink)' },
        join_request_approved: { label: 'Yêu cầu được duyệt', bg: 'var(--candy-paleblue)' },
        join_request_rejected: { label: 'Yêu cầu bị từ chối', bg: '#fee2e2' },
        event_reminder: { label: 'Nhắc nhở', bg: 'var(--candy-purple)' },
        general: { label: 'Thông báo chung', bg: 'rgba(255, 255, 255, 0.8)' }
    };
    const config = typeConfig[type] || typeConfig.general;

    return (
        <span style={{
            background: config.bg,
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--candy-text)'
        }}>
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
    const clubId = '69776c80120c12cc18c813bc';
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Nzc2YzgwMTIwYzEyY2MxOGM4MTNiOSIsImlhdCI6MTc2OTYyMjQ5Nn0.799v8HXXSCiVdjVlhZPr8cK-kygJfUDso4nxJrQFqsg';

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
                    <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
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
                    <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'red' }}>
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
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--candy-text)', margin: 0 }}>
                        Thông báo
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--candy-text)', opacity: 0.7, marginTop: '4px' }}>
                        Tất cả thông báo của bạn
                    </p>
                </div>

                {/* Filter section */}
                <div className="glass-card" style={{ padding: '16px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--candy-text)', opacity: 0.8 }}>
                            Lọc theo loại:
                        </span>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid rgba(0,0,0,0.1)',
                                background: 'rgba(255,255,255,0.9)',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: 'var(--candy-text)',
                                cursor: 'pointer',
                                minWidth: '200px'
                            }}
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                className="glass-card"
                                style={{
                                    padding: '16px',
                                    borderRadius: '16px',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    border: notification.read ? '1px solid rgba(0,0,0,0.05)' : '2px solid var(--candy-paleblue)',
                                    background: notification.read ? 'rgba(255,255,255,0.7)' : 'rgba(226, 236, 246, 0.826)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                            <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0, color: 'var(--candy-text)' }}>
                                                {notification.title}
                                            </h3>
                                            <NotificationTypeBadge type={notification.type} />
                                        </div>

                                        <p style={{ fontSize: '0.875rem', color: 'var(--candy-text)', opacity: 0.8, marginBottom: '8px' }}>
                                            {notification.body}
                                        </p>

                                        {notification.data && notification.data.eventTitle && (
                                            <div style={{
                                                marginTop: '8px',
                                                padding: '12px',
                                                background: 'rgba(162, 210, 255, 0.1)',
                                                borderLeft: '3px solid var(--candy-paleblue)',
                                                borderRadius: '6px',
                                                fontSize: '0.85rem',
                                                color: 'var(--candy-text)'
                                            }}>
                                                <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                                                    Sự kiện: {notification.data.eventTitle}
                                                </div>
                                                {notification.data.startAt && (
                                                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                                        Thời gian: {formatDateTime(notification.data.startAt)}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <p style={{ fontSize: '0.75rem', color: 'var(--candy-text)', opacity: 0.6, marginTop: '8px' }}>
                                            {formatDateTime(notification.createdAt)}
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                        {notification.read ? (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '0.75rem',
                                                color: '#16a34a',
                                                fontWeight: 600
                                            }}>
                                                ✓ Đã đọc
                                            </span>
                                        ) : (
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '0.75rem',
                                                color: 'var(--candy-paleblue)',
                                                fontWeight: 700
                                            }}>
                                                <span style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    background: 'var(--candy-paleblue)',
                                                    display: 'inline-block'
                                                }} />
                                                Mới
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card" style={{
                        padding: '64px 32px',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            fontSize: '2rem'
                        }}>
                            🔔
                        </div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px', color: 'var(--candy-text)' }}>
                            Không có thông báo nào
                        </h3>
                        <p style={{ opacity: 0.8, color: 'var(--candy-text)' }}>
                            Bạn sẽ nhận được thông báo khi có hoạt động mới
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}