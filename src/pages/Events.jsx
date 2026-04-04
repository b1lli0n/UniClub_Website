import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEventsByClubToManage } from '../api/clubApi';
import EventCard from '../components/events/EventCard';
import EmptyEventState from '../components/events/EmptyEventState';
import '../styles/Events.css';
import { Plus, Calendar, Settings, Sparkles, Filter, Search } from 'lucide-react';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [progressStatusFilter, setProgressStatusFilter] = useState('all');

    // Get clubId from params, user context, or localStorage
    const clubId = paramClubId || user?.clubId || localStorage.getItem('clubId');

    const loadEvents = useCallback(async () => {
        if (!clubId) {
            setError('Bạn chưa chọn câu lạc bộ. Vui lòng quay lại trang chính và chọn một câu lạc bộ.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');
            const progressValue = progressStatusFilter === 'all' ? null : progressStatusFilter;
            const params = {};
            if (progressValue) params.progress_status = progressValue;
            const response = await getEventsByClubToManage(clubId, params);
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
    }, [clubId, progressStatusFilter]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const filteredEvents = useMemo(() => {
        let eventsList = [...events];
        
        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            eventsList = eventsList.filter(event => 
                (event.title || '').toLowerCase().includes(query) ||
                (event.name || '').toLowerCase().includes(query) ||
                (event.description || '').toLowerCase().includes(query)
            );
        }
        
        // Sort by start date (earliest first)
        const dateKey = events[0]?.startAt ? 'startAt' : (events[0]?.start_time ? 'start_time' : 'start_at');
        eventsList.sort((a, b) => new Date(a[dateKey]).getTime() - new Date(b[dateKey]).getTime());
        return eventsList;
    }, [events, searchQuery]);

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Thời gian: TBC';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Thời gian: Đang cập nhật';
        
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
                        Đang tải...
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
        <div className="events-page-wrapper">
            <div className="events-container">
                {/* Header with title and create button */}
                <header className="events-header">
                    <div className="events-header-content">
                        <div className="header-badge-premium">
                            <Sparkles size={14} />
                            Quản lý cộng đồng
                        </div>
                        <h1 className="events-page-title">Sự kiện CLB</h1>
                        <p className="events-page-subtitle">Sáng tạo và điều phối các hoạt động ngoại khóa hấp dẫn</p>
                    </div>
                    
                    <button
                        className="btn-create-premium"
                        onClick={() => navigate('/clubEvent/create')}
                    >
                        <Plus size={20} />
                        <span>Tạo sự kiện mới</span>
                    </button>
                </header>

                <div className="events-controls-row">
                    <div className="search-input-wrap">
                        <Search size={18} className="events-search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sự kiện..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="events-search-input"
                        />
                        {searchQuery && (
                            <button
                                className="search-clear-btn"
                                onClick={() => setSearchQuery('')}
                                aria-label="Xóa tìm kiếm"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    
                    <div className="filter-label-wrap">
                        <Filter size={18} />
                        <span>Lọc tiến độ:</span>
                    </div>
                    <select
                        value={progressStatusFilter}
                        onChange={(e) => setProgressStatusFilter(e.target.value)}
                        className="events-filter-select"
                        style={{ minWidth: '150px' }}
                    >
                        <option value="all">Tất cả</option>
                        <option value="0">Nháp</option>
                        <option value="1">Hoàn thành</option>
                    </select>
                </div>

                {/* Events grid */}
                <div className="events-content-area">
                    {filteredEvents.length > 0 ? (
                        <div className="events-grid-modern">
                            {filteredEvents.map((event) => (
                                <EventCard
                                    key={event._id}
                                    event={event}
                                    onViewDetails={(id) => navigate(`/clubEvent/${id}`)}
                                    onEdit={(id) => navigate(`/clubEvent/${id}/update`)}
                                    onAttend={(id) => navigate(`/clubs/${clubId}/events/${id}/attendance`)}
                                    formatDateTime={formatDateTime}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyEventState onCreateEvent={() => navigate('/clubEvent/create')} />
                    )}
                </div>
            </div>
        </div>
    );
}