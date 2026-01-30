import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents } from '../services/api';
import EventCard from '../components/events/EventCard';
import EventsFilter from '../components/events/EventsFilter';
import EmptyEventState from '../components/events/EmptyEventState';

export default function EventsPage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // TODO: lấy từ auth/context
    const clubId = '69776c80120c12cc18c813bc';
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Nzc2YzgwMTIwYzEyY2MxOGM4MTNiOSIsImlhdCI6MTc2OTYyMjQ5Nn0.799v8HXXSCiVdjVlhZPr8cK-kygJfUDso4nxJrQFqsg';

    const loadEvents = async () => {
        try {
            setLoading(true);
            const filterValue = statusFilter === 'all' ? null : statusFilter;
            const data = await getEvents(clubId, token, filterValue);
            setEvents(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, [statusFilter]);

    const filteredEvents = useMemo(() => {
        let eventsList = [...events];
        // Sort by start date (earliest first)
        eventsList.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
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
                <header className="myclub-header">
                    <h1 className="myclub-title">Sự kiện</h1>
                </header>

                {/* Header with title and create button */}
                <div className="myclub-hero glass-card" style={{ marginBottom: '24px' }}>
                    <div className="myclub-hero-content">
                        <h2>Sự kiện</h2>
                        <p>Quản lý tất cả sự kiện của câu lạc bộ</p>
                    </div>
                    <button
                        className="myclub-add"
                        onClick={() => navigate('/events/create')}
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
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '16px'
                    }}>
                        {filteredEvents.map((event) => (
                            <EventCard
                                key={event._id}
                                event={event}
                                onViewDetails={(id) => navigate(`/events/${id}`)}
                                formatDateTime={formatDateTime}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyEventState onCreateEvent={() => navigate('/events/create')} />
                )}
            </div>
        </div>
    );
}