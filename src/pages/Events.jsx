import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEventsByClub } from '../api/clubApi';
import EventCard from '../components/events/EventCard';
import EventsFilter from '../components/events/EventsFilter';
import EmptyEventState from '../components/events/EmptyEventState';
import '../styles/Events.css';

export default function EventsPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const navigate = useNavigate();
    const { clubId: paramClubId } = useParams();
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Get clubId from params, user context, or localStorage
    const clubId = paramClubId || user?.clubId || localStorage.getItem('clubId');

    const loadEvents = async () => {
        if (!clubId) {
            setError('Bạn chưa chọn câu lạc bộ. Vui lòng quay lại trang chính và chọn một câu lạc bộ.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');
            const filterValue = statusFilter === 'all' ? null : statusFilter;
            const params = filterValue ? { status: filterValue } : {};
            const response = await getEventsByClub(clubId, params);
            console.log('✅ Events response:', response);
            const eventsData = response?.data || response?.events || response || [];
            console.log('✅ Events data:', eventsData);

            // Sort events by start date
            const sortedEvents = [...(Array.isArray(eventsData) ? eventsData : [])].sort((a, b) => {
                const dateA = new Date(a.start_time || a.startAt || a.start_at);
                const dateB = new Date(b.start_time || b.startAt || b.start_at);
                return dateA - dateB;
            });
            setEvents(sortedEvents);
        } catch (err) {
            console.error('❌ Failed to load events:', err);
            setError(err.message || 'Không thể tải danh sách sự kiện');
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, [statusFilter, clubId]);

    const filteredEvents = useMemo(() => {
        let eventsList = [...events];
        // Sort by start date (earliest first)
        const dateKey = events[0]?.startAt ? 'startAt' : (events[0]?.start_time ? 'start_time' : 'start_at');
        eventsList.sort((a, b) => new Date(a[dateKey]).getTime() - new Date(b[dateKey]).getTime());
        return eventsList;
    }, [events]);

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
                    <div className="glass-card events-loading-card">
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
                    <div className="glass-card events-error-card">
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
                {/* Header with title and create button */}
                <div className="myclub-hero glass-card events-hero">
                    <div className="myclub-hero-content">
                        <h2>Sự kiện</h2>
                        <p>Quản lý tất cả sự kiện của câu lạc bộ</p>
                    </div>
                    <button
                        className="myclub-add clubevent-primary-btn"
                        onClick={() => navigate('/clubEvent/create')}
                    >
                        + Tạo sự kiện
                    </button>
                </div>

                {/* Filter section */}
                <EventsFilter
                    statusFilter={statusFilter}
                    onFilterChange={setStatusFilter}
                />

                {/* Events grid */}
                {filteredEvents.length > 0 ? (
                    <div className="events-grid">
                        {filteredEvents.map((event) => (
                            <EventCard
                                key={event._id}
                                event={event}
                                onViewDetails={(id) => navigate(`/clubEvent/${id}`)}
                                formatDateTime={formatDateTime}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyEventState onCreateEvent={() => navigate('/clubEvent/create')} />
                )}
            </div>
        </div>
    );
}