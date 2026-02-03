import React, { useEffect, useMemo, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import '../../styles/Event.css';
import RegistrationModal from '../../components/RegistrationModal';
import eventService from '../../services/eventService';
import { Form } from "react-bootstrap";

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
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tất cả');
    const [sortBy, setSortBy] = useState('date-desc');
    const [showRegister, setShowRegister] = useState(false);
    const [registerEventTitle, setRegisterEventTitle] = useState('Sự kiện');
    const [registerEventId, setRegisterEventId] = useState(null);
    const [regVersion, setRegVersion] = useState(0);

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

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
                console.log('Fetching events for clubId:', clubId);
                const res = await eventService.getEventsByClub(clubId);
                setEvents(res.data.data || []);
            } catch (err) {
                console.error('Error fetching events:', err);
                setEvents([]);
            }
            setLoading(false);
        };
        fetchEvents();
    }, [regVersion, clubId]);

    const categories = useMemo(() => {
        // Lọc bỏ null/undefined và chuẩn hóa về đúng kiểu
        const set = new Set(events.map((e) => (e.category ? e.category.trim() : '')).filter(Boolean));
        return ['Tất cả', ...Array.from(set)];
    }, [events]);

    const filteredEvents = useMemo(() => {
        const q = query.trim().toLowerCase();
        const filtered = events.filter((e) => {
            const eventCat = e.category ? e.category.trim().toLowerCase() : '';
            const activeCat = activeCategory.trim().toLowerCase();
            const byCategory = activeCat === 'tất cả'
                ? true
                : eventCat === activeCat;
            const byQuery = !q
                ? true
                : `${e.title} ${e.description} ${e.category} ${e.location}`.toLowerCase().includes(q);
            return byCategory && byQuery;
        });


        // Sort
        const sorted = [...filtered];
        if (sortBy === 'date-desc') {
            sorted.sort((a, b) => {
                const aDate = parseDate(a.end_time ?? a.start_time ?? a.endDate ?? a.startDate ?? a.dateText ?? '');
                const bDate = parseDate(b.end_time ?? b.start_time ?? b.endDate ?? b.startDate ?? b.dateText ?? '');
                return bDate - aDate; //mới nhất
            });
        } else if (sortBy === 'date-asc') {
            sorted.sort((a, b) => {
                const aDate = parseDate(a.end_time ?? a.start_time ?? a.endDate ?? a.startDate ?? a.dateText ?? '');
                const bDate = parseDate(b.end_time ?? b.start_time ?? b.endDate ?? b.startDate ?? b.dateText ?? '');
                return aDate - bDate;//cũ nhất
            });
        } else if (sortBy === 'name') {
            sorted.sort((a, b) => a.title.localeCompare(b.title));
        }

        return sorted;
    }, [events, activeCategory, query, sortBy]);

    return (
        <div className="event-container">
            <div className="event-hero">
                
                <Container className="pb-4">
                    <div className="event-catGrid" role="list">
                        {DISCOVER_CATEGORIES.map(({ id, labelTop, labelBottom, mapsTo, icon }) => {
                            const canMap = categories.includes(mapsTo);
                            const isActive = canMap && activeCategory.toLowerCase() === mapsTo.toLowerCase();
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    className={`event-catItem ${isActive ? 'is-active' : ''}`}
                                    role="listitem"
                                    onClick={() => setActiveCategory(canMap ? mapsTo : 'Tất cả')}
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
                    <div className="event-rowList">
                        {filteredEvents.map((e) => {
                            const { day, month } = getDateParts(e);
                            const badgeText = CATEGORY_BADGE_MAP[e.category] ?? e.category;
                            return (
                                <div key={e._id || e.id} className="event-row glass-panel">
                                    <div className="event-rowMedia" aria-hidden="true">
                                        {e.media_urls && e.media_urls.length > 0 ? (
                                            <img
                                                src={`http://localhost:5000${e.media_urls[0]}`}
                                                alt={e.title}
                                                className="event-rowImg"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                                            />
                                        ) : (
                                            <div className="event-rowMediaOverlay" />
                                        )}
                                    </div>

                                    <div className="event-rowBody">
                                        <div className="event-rowTitleWrap">
                                            <Link className="event-rowTitle" to={`/club/${clubId}/events/${e._id}`}>
                                                {e.title}
                                            </Link>
                                            <div className="event-rowBadge">{badgeText}</div>
                                        </div>

                                        <div className="event-rowMeta">
                                            <div className="event-rowMetaItem">
                                                <span className="event-rowMetaIcon" aria-hidden="true">
                                                    👤
                                                </span>
                                                <span className="event-rowMetaText">{e.host ?? 'UniClub'}</span>
                                            </div>
                                            <div className="event-rowMetaItem">
                                                <span className="event-rowMetaIcon" aria-hidden="true">
                                                    📍
                                                </span>
                                                <span className="event-rowMetaText">{e.location}</span>
                                            </div>
                                        </div>

                                        <Button
                                            className="event-rowBtn"
                                            type="button"
                                            onClick={() => {
                                                setRegisterEventTitle(e.title);
                                                setRegisterEventId(e._id || e.id);
                                                setShowRegister(true);
                                            }}
                                        >
                                            Đăng ký
                                        </Button>
                                    </div>

                                    <div className="event-rowDate" aria-hidden="true">
                                        <div className="event-rowDay">{day}</div>
                                        <div className="event-rowMonth">Tháng {month}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
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
