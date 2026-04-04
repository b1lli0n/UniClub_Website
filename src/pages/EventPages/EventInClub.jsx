import React, { useEffect, useMemo, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import '../../styles/Event.css';
import RegistrationModal from '../../components/modals/RegistrationModal';
import eventApi from '../../api/eventApi';
import { Form } from "react-bootstrap";
import Pagination from '../../components/common/Pagination';

const CATEGORY_BADGE_MAP = {
    'Workshop': 'Workshop, Học tập',
    'Thể thao': 'Thể thao, Sức khoẻ',
    'Giải trí': 'Giải trí, Trải nghiệm',
    'Cộng đồng': 'Hoạt động, Cộng đồng',
};

// hàm này để lấy ngày/tháng từ start_time (ISO) hoặc startDate/dateText (DD/MM/YYYY)
const getDateParts = (event) => {
    let dateStr = event.start_time || event.startDate || event.dateText || "";
    if (!dateStr) return { day: '--', month: '--' };

    // Nếu là ISO date (2026-01-28T00:00:00.000Z)
    if (typeof dateStr === 'object' && dateStr instanceof Date) {
        // Nếu là object Date
        return {
            day: String(dateStr.getDate()).padStart(2, '0'),
            month: String(dateStr.getMonth() + 1).padStart(2, '0')
        };
    }
    if (dateStr.includes('T')) {
        const d = new Date(dateStr);
        return {
            day: String(d.getDate()).padStart(2, '0'),
            month: String(d.getMonth() + 1).padStart(2, '0')
        };
    }
    // Nếu là dạng DD/MM/YYYY hoặc DD/MM
    const parts = dateStr.split('/');
    if (parts.length >= 2) {
        return { day: parts[0], month: parts[1] };
    }
    return { day: '--', month: '--' };
};

const parseDate = (dateStr) => {
    // Ưu tiên ISO date
    if (dateStr && dateStr.includes('T')) {
        return new Date(dateStr).getTime();
    }
    const parts = String(dateStr).split('/');
    if (parts.length !== 3) return 0;
    const [dd, mm, yyyy] = parts.map((p) => parseInt(p, 10));
    if (!dd || !mm || !yyyy) return 0;
    return new Date(yyyy, mm - 1, dd).getTime();
};

const DISCOVER_CATEGORIES = [
    { id: 'all', labelTop: 'Tất cả', labelBottom: '', mapsTo: 'Tất cả', icon: " 🌟" },
    { id: 'workshop', labelTop: 'Work Shop,', labelBottom: 'Học tập', mapsTo: 'Workshop', icon: "💡" },
    { id: 'sport', labelTop: 'Thể Thao', labelBottom: '', mapsTo: 'Thể thao', icon: "🏀" },
    { id: 'entertainment', labelTop: 'Giải trí', labelBottom: '', mapsTo: 'Giải trí', icon: "🎮" },
    { id: 'community', labelTop: 'Hoạt động', labelBottom: 'cộng đồng', mapsTo: 'Cộng đồng', icon: "🤝" },
];

const Event = () => {
    const { clubId } = useParams();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tất cả');
    const [sortBy, setSortBy] = useState('date-desc');
    const [showRegister, setShowRegister] = useState(false);
    const [registerEventTitle, setRegisterEventTitle] = useState('Sự kiện');
    const [registerEventId, setRegisterEventId] = useState(null);
    const [regVersion, setRegVersion] = useState(0);

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const EVENTS_PER_PAGE = 12;

    // Reset về trang 1 khi lọc
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, query, sortBy]);

    // Scroll to top khi đổi trang
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentPage]);

    useEffect(() => {
        document.body.classList.add('event-body');
        return () => {
            document.body.classList.remove('event-body');
        };
    }, []);

    // Lấy danh sách sự kiện từ backend theo club
    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                // Tạo params để gửi lên BE
                const params = {
                    q: query || '',
                    category: activeCategory !== 'Tất cả' ? activeCategory : '',
                    sort: sortBy,
                    page: currentPage,
                    limit: EVENTS_PER_PAGE
                };

                const res = await eventApi.getEventsByClub(clubId, params);
                if (res?.data?.success) {
                    setEvents(res.data.data || []);
                    setTotalPages(res.data.pagination?.pages || 1);
                } else {
                    setEvents(res?.data?.data || []);
                    setTotalPages(1);
                }
            } catch (err) {
                console.error('Error fetching events:', err);
                setEvents([]);
                setTotalPages(1);
            }
            setLoading(false);
        };
        if (clubId) fetchEvents();
    }, [regVersion, clubId, query, activeCategory, sortBy, currentPage]);

    const categories = useMemo(() => {
        // Lọc bỏ null/undefined và chuẩn hóa về đúng kiểu
        const set = new Set(events.map((e) => (e.category ? e.category.trim() : '')).filter(Boolean));
        return ['Tất cả', ...Array.from(set)];
    }, [events]);

    // Bỏ filter ở client vì BE đã filter sẵn
    const filteredEvents = events;

    return (
        <div className="event-container">
            <div className="event-hero">

                <Container className="pb-4">
                    <div className="event-catGrid" role="list">
                        {DISCOVER_CATEGORIES.map(({ id, labelTop, labelBottom, mapsTo, icon }) => {
                            const isActive = activeCategory.toLowerCase() === mapsTo.toLowerCase();
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    className={`event-catItem ${isActive ? 'is-active' : ''}`}
                                    role="listitem"
                                    onClick={() => setActiveCategory(mapsTo)}
                                    aria-label={`${labelTop} ${labelBottom}`}
                                >
                                    <div className="event-catCircle">{icon}</div>
                                    <div className="event-catLabel">
                                        <div>{labelTop}</div>
                                        {labelBottom && <div>{labelBottom}</div>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </Container>
            </div>

            <Container className="pb-5">
                <div className="event-sectionHead">
                    <div>
                        <h3 className="event-sectionTitle">
                            {activeCategory === 'Tất cả' ? 'Sự kiện' : `Sự kiện • ${activeCategory}`}
                        </h3>
                        <p className="event-sectionSub">
                            {filteredEvents.length} sự kiện{query ? ' (đã lọc theo tìm kiếm)' : ''}.
                        </p>
                    </div>
                    <div className="event-sort">
                        <label className="event-sortLabel">Sort:</label>
                        <select
                            className="event-sortSelect"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="date-desc">Ngày mới nhất</option>
                            <option value="date-asc">Ngày cũ nhất</option>
                            <option value="name">Tên A-Z</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="event-empty glass-panel">
                        <div className="event-emptyTitle">Đang tải dữ liệu...</div>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="event-empty glass-panel">
                        <div className="event-emptyTitle">Không tìm thấy sự kiện phù hợp</div>
                        <div className="event-emptySub">Thử đổi danh mục hoặc từ khóa khác nhé.</div>
                        <Button
                            className="event-secondaryBtn mt-3"
                            type="button"
                            onClick={() => {
                                setQuery('');
                                setActiveCategory('Tất cả');
                            }}
                        >
                            Xoá bộ lọc
                        </Button>
                    </div>
                ) : (
                    <div className="event-grid">
                        {filteredEvents.map((e) => {
                            const { day, month } = getDateParts(e);
                            const badgeText = CATEGORY_BADGE_MAP[e.category] ?? e.category;
                            const eventId = e._id || e.id;
                            const eventLink = `/club/${clubId}/events/${eventId}`;

                            return (
                                <div key={`${clubId || 'event'}-${eventId}`} className="event-grid-card glass-panel">
                                    <div className="event-grid-badge">{badgeText}</div>

                                    <div className="event-grid-date-overlay">
                                        <span className="event-grid-day">{day}</span>
                                        <span className="event-grid-month">Tháng {month}</span>
                                    </div>

                                    <div className="event-grid-media">
                                        <img
                                            src={e.media_urls && e.media_urls.length > 0 
                                                ? (e.media_urls[0].startsWith('http') ? e.media_urls[0] : `http://localhost:5000${e.media_urls[0]}`)
                                                : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"}
                                            alt={e.title}
                                            className="event-grid-img"
                                            onError={(e) => {
                                                e.target.src = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop";
                                            }}
                                        />
                                    </div>

                                    <div className="event-grid-body">
                                        <Link className="event-grid-title" to={eventLink}>
                                            {e.title}
                                        </Link>

                                        <div className="event-grid-meta">
                                            <div className="event-grid-meta-item">
                                                <span aria-hidden="true">📍</span>
                                                <span title={e.location}>{e.location}</span>
                                            </div>
                                        </div>

                                        <div className="event-grid-footer">
                                            <Link to={eventLink} className="btn event-grid-btn">
                                                Xem chi tiết
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination Section */}
                {!loading && events.length > 0 && totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        loading={loading}
                    />
                )}
            </Container>

            {/* <RegistrationModal
                show={showRegister}
                onHide={() => setShowRegister(false)}
                onChanged={() => setRegVersion((v) => v + 1)}
                eventId={registerEventId}
                eventTitle={registerEventTitle}
            /> */}
        </div>
    );
};

export default Event;
