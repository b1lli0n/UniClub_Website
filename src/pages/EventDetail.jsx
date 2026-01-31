import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventDetail } from '../services/api';
import EventHeader from '../components/eventDetail/EventHeader';
import EventInfoCard from '../components/eventDetail/EventInfoCard';
import CancelledEventAlert from '../components/eventDetail/CancelledEventAlert';
import '../styles/EventDetail.css';

export default function EventDetailPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [registrationsCount, setRegistrationsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // TODO: lấy từ auth/context
    const clubId = localStorage.getItem('clubId');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const loadDetail = async () => {
            try {
                setLoading(true);
                const data = await getEventDetail(clubId, eventId, token);
                setEvent(data.event);
                setRegistrationsCount(data.registrationsCount || 0);
                setError('');
            } catch (err) {
                setError(err.message || 'Failed to load event');
            } finally {
                setLoading(false);
            }
        };
        loadDetail();
    }, [eventId, clubId, token]);

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
                        <button className="card-button" onClick={() => navigate('/events')}>
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
                <EventHeader
                    title={event.title}
                    status={event.status}
                    onBack={() => navigate('/events')}
                    onEdit={() => navigate(`/events/${eventId}/edit`)}
                    canEdit={event.status !== 'canceled'}
                />

                <EventInfoCard
                    event={event}
                    registrationsCount={registrationsCount}
                    formatDateTime={formatDateTime}
                />

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