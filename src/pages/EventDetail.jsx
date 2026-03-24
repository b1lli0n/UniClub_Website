import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventsByClub } from '../api/clubApi';
import EventHeader from '../components/eventDetail/EventHeader';
import EventInfoCard from '../components/eventDetail/EventInfoCard';
import CancelledEventAlert from '../components/eventDetail/CancelledEventAlert';
import '../styles/EventDetail.css';

export default function EventDetailPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [canceling, setCanceling] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    // Get clubId from localStorage
    const clubId = localStorage.getItem('clubId');

    // Check if current user is leader/organizer
    const isOrganizer = true; // TODO: Check from user role in club

    useEffect(() => {
        const loadDetail = async () => {
            if (!clubId) {
                setError('Không tìm thấy clubId. Vui lòng quay lại Dashboard.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await getEventsByClub(clubId);
                console.log('✅ Events response:', response);
                const eventsData = response?.data || response?.events || response || [];

                // Find event by ID
                const foundEvent = Array.isArray(eventsData) ? eventsData.find(e => e._id === eventId || e.id === eventId) : null;

                if (foundEvent) {
                    setEvent(foundEvent);
                    setError('');
                    // Check if user is already registered
                    if (foundEvent.userRegistration?.status === 'approved' || foundEvent.userRegistration?.status === 1) {
                        setIsRegistered(true);
                    }
                } else {
                    setError('Event không tồn tại');
                }
            } catch (err) {
                console.error('❌ Failed to load event detail:', err);
                setError(err.message || 'Không thể tải chi tiết sự kiện');
            } finally {
                setLoading(false);
            }
        };
        loadDetail();
    }, [eventId, clubId]);

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

    const handleRegisterEvent = async () => {
        try {
            setRegistering(true);
            const response = await fetch(`http://localhost:5000/api/events/${eventId}/register`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: localStorage.getItem('userId') })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Đăng ký thất bại');
            }

            setIsRegistered(true);
            alert('Đăng ký sự kiện thành công!');
        } catch (err) {
            console.error('❌ Register error:', err);
            alert(err.message || 'Không thể đăng ký sự kiện');
        } finally {
            setRegistering(false);
        }
    };

    const handleCancelEvent = async () => {
        try {
            setRegistering(true);
            const response = await fetch(`http://localhost:5000/api/events/${eventId}/register`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: localStorage.getItem('userId') })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Hủy đăng ký thất bại');
            }

            setIsRegistered(false);
            alert('Hủy đăng ký thành công!');
        } catch (err) {
            console.error('❌ Cancel error:', err);
            alert(err.message || 'Không thể hủy đăng ký');
        } finally {
            setRegistering(false);
        }
    };

    const handleCancelWholeEvent = async () => {
        if (!cancelReason.trim()) {
            alert('Vui lòng nhập lý do hủy sự kiện');
            return;
        }

        try {
            setCanceling(true);
            const response = await fetch(`http://localhost:5000/api/clubs/${clubId}/events/${eventId}/cancel`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: cancelReason })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Hủy sự kiện thất bại');
            }

            alert('Hủy sự kiện thành công!');
            setShowCancelDialog(false);
            // Reload event data
            window.location.reload();
        } catch (err) {
            console.error('❌ Cancel event error:', err);
            alert(err.message || 'Không thể hủy sự kiện');
        } finally {
            setCanceling(false);
        }
    };

    if (loading) {
        return (
            <div className="home-page">
                <div className="home-overlay" />
                <div className="myclub-container">
                    <div className="glass-card event-detail-loading-card">
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
                    <div className="glass-card event-detail-error-card">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="home-page">
                <div className="home-overlay" />
                <div className="myclub-container">
                    <div className="glass-card event-detail-notfound-card">
                        <div className="event-detail-notfound-icon">⚠️</div>
                        <h3 className="event-detail-notfound-title"> 
                            Không tìm thấy sự kiện
                        </h3>
                        <p className="event-detail-notfound-text">
                            Sự kiện này không tồn tại hoặc đã bị xóa
                        </p>
                        <button className="card-button" onClick={() => navigate(clubId ? `/clubs/${clubId}/dashboard` : '/events')}>
                            ← Quay lại danh sách
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="home-page">
            <div className="home-overlay" />
            <div className="myclub-container">
                <div className="event-detail-header-section">
                    <EventHeader
                        title={event.title}
                        status={event.status}
                        onBack={() => navigate(clubId ? `/clubs/${clubId}/dashboard` : '/events')}
                        onEdit={() => navigate(`/events/${eventId}/edit`)}
                        canEdit={event.status !== 'canceled'}
                    />
                    
                    <button
                        className="timeline-trigger-button"
                        onClick={() => navigate(`/events/${eventId}/timeline`)}
                        title="Xem timeline sự kiện"
                    >
                        📅 Timeline Sự Kiện
                    </button>
                </div>

                <EventInfoCard
                    event={event}
                    formatDateTime={formatDateTime}
                />

               
                <div className="event-detail-actions">
                    {isRegistered ? (
                        <button
                            className="card-button"
                            onClick={handleCancelEvent}
                            disabled={registering}
                            style={{ backgroundColor: '#ff4444', color: 'white' }}
                        >
                            {registering ? 'Đang xử lý...' : ' Hủy đăng ký'}
                        </button>
                    ) : (
                        <button
                            className="card-button"
                            onClick={handleRegisterEvent}
                            disabled={registering || event.status === 'canceled'}
                            style={{ backgroundColor: '#44aa44', color: 'white' }}
                        >
                            {registering ? 'Đang xử lý...' : ' Đăng ký sự kiện'}
                        </button>
                    )}

                    {isOrganizer && event.status !== 'canceled' && (
                        <>
                            <button
                                className="card-button"
                                onClick={() => setShowCancelDialog(true)}
                                style={{ backgroundColor: '#d9534f', color: 'white' }}
                            >
                                Hủy sự kiện
                            </button>
                        </>
                    )}
                </div>

                {showCancelDialog && (
                    <div className="modal-overlay" onClick={() => setShowCancelDialog(false)}>
                        <div className="modal-body" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                            <div className="modal-header">
                                <h3 style={{ margin: 0, color: '#fff' }}>Hủy sự kiện</h3>
                                <button
                                    className="modal-close"
                                    onClick={() => setShowCancelDialog(false)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="modal-content" style={{ padding: '20px' }}>
                                <p style={{ marginBottom: '15px', color: '#fff' }}>
                                    Bạn có chắc chắn muốn hủy sự kiện <strong>"{event.title}"</strong>?
                                </p>
                                <p style={{ marginBottom: '15px', color: '#ffaa00' }}>
                                    ⚠️ Hành động này không thể hoàn tác!
                                </p>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#fff', fontWeight: 'bold' }}>
                                        Lý do hủy sự kiện: <span style={{ color: '#ff4444' }}>*</span>
                                    </label>
                                    <textarea
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        placeholder="Nhập lý do hủy sự kiện..."
                                        rows={4}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            color: '#fff',
                                            resize: 'vertical',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button
                                        className="card-button"
                                        onClick={() => setShowCancelDialog(false)}
                                        disabled={canceling}
                                        style={{ backgroundColor: '#6c757d', color: 'white' }}
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        className="card-button"
                                        onClick={handleCancelWholeEvent}
                                        disabled={canceling || !cancelReason.trim()}
                                        style={{
                                            backgroundColor: canceling || !cancelReason.trim() ? '#999' : '#d9534f',
                                            color: 'white'
                                        }}
                                    >
                                        {canceling ? 'Đang hủy...' : '🚫 Xác nhận hủy'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {event.status === 'canceled' && event.canceledAt && (
                    <CancelledEventAlert
                        canceledAt={event.canceledAt}
                        cancelReason={event.cancelReason}
                        formatDateTime={formatDateTime}
                    />
                )}
            </div>
        </div>
    );
}