import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventDetail } from '../services/api';
import EventHeader from '../components/eventDetail/EventHeader';
import EventInfoCard from '../components/eventDetail/EventInfoCard';
import CancelledEventAlert from '../components/eventDetail/CancelledEventAlert';

export default function EventDetailPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [registrationsCount, setRegistrationsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // TODO: lấy từ auth/context
    const clubId = '69776c80120c12cc18c813bc';
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Nzc2YzgwMTIwYzEyY2MxOGM4MTNiOSIsImlhdCI6MTc2OTYyMjQ5Nn0.799v8HXXSCiVdjVlhZPr8cK-kygJfUDso4nxJrQFqsg';

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

    if (!event) {
        return (
            <div className="home-page">
                <div className="home-overlay" />
                <div className="myclub-container">
                    <div className="glass-card" style={{ padding: '64px 32px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>
                            Không tìm thấy sự kiện
                        </h3>
                        <p style={{ opacity: 0.8, marginBottom: '16px' }}>
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