import React, { useEffect, useMemo, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/Event.css';
import { EVENTS } from '../data/events';
import RegistrationModal from '../components/RegistrationModal';
import { isRegistered } from '../data/eventLocalStore';

// Icon Components
const IconBase = ({ children, viewBox = '0 0 24 24' }) => (
    <svg
        className="event-catIcon"
        viewBox={viewBox}
        width="26"
        height="26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        {children}
    </svg>
);

const IconBook = () => (
    <IconBase>
        <path
            d="M6.5 4.8h8.3c1.6 0 2.7 1.3 2.7 2.9v11.1c0 .8-.7 1.5-1.6 1.5H7.9c-.8 0-1.4-.7-1.4-1.5V6.3c0-.8.7-1.5 1.6-1.5Z"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinejoin="round"
        />
        <path d="M9.2 8h6.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M9.2 11h6.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </IconBase>
);

const IconShoe = () => (
    <IconBase>
        <path
            d="M6 14.5c1.8 1.4 3.9 2.2 6.2 2.2h6.4c.9 0 1.7.7 1.7 1.7v.7H5.2c-.8 0-1.4-.6-1.4-1.4 0-1.6.8-2.8 2.2-3.2Z"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinejoin="round"
        />
        <path
            d="M10.2 12.2c.5 1.1 1.3 2.2 2.4 3.1"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
        />
    </IconBase>
);

const IconClover = () => (
    <IconBase>
        <path
            d="M12 20c0-3.2-2.4-4.6-4.3-6.1-1.4-1.1-2.7-2.2-2.7-3.9 0-1.5 1.2-2.7 2.7-2.7 1.3 0 2.3.8 2.6 2 .3-1.2 1.3-2 2.6-2 1.5 0 2.7 1.2 2.7 2.7 0 1.7-1.3 2.8-2.7 3.9C14.4 15.4 12 16.8 12 20Z"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinejoin="round"
        />
    </IconBase>
);

const IconCommunity = () => (
    <IconBase>
        <path
            d="M8.2 11.2c1.4 0 2.5-1.1 2.5-2.5S9.6 6.2 8.2 6.2 5.7 7.3 5.7 8.7s1.1 2.5 2.5 2.5Z"
            stroke="currentColor"
            strokeWidth="1.9"
        />
        <path
            d="M15.8 11.2c1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5-2.5 1.1-2.5 2.5 1.1 2.5 2.5 2.5Z"
            stroke="currentColor"
            strokeWidth="1.9"
        />
        <path
            d="M4.8 19.2c.4-2.3 2.4-4 4.9-4h4.6c2.5 0 4.5 1.7 4.9 4"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </IconBase>
);

// Category data
const DISCOVER_CATEGORIES = [
    { id: 'workshop', labelTop: 'Workshop,', labelBottom: 'Học tập', mapsTo: 'Workshop', Icon: IconBook },
    { id: 'sport', labelTop: 'Thể Thao', labelBottom: '', mapsTo: 'Thể thao', Icon: IconShoe },
    { id: 'entertainment', labelTop: 'Giải trí', labelBottom: '', mapsTo: 'Giải trí', Icon: IconClover },
    { id: 'community', labelTop: 'Hoạt động', labelBottom: 'cộng đồng', mapsTo: 'Cộng đồng', Icon: IconCommunity },
];

const CATEGORY_BADGE_MAP = {
    Workshop: 'Workshop, Học tập',
    'Thể thao': 'Thể thao, Sức khoẻ',
    'Giải trí': 'Giải trí, Trải nghiệm',
    'Cộng đồng': 'Hoạt động, Cộng đồng',
};

const getDateParts = (dateText) => {
    if (!dateText) return { day: '--', month: '--' };
    const [day, month] = String(dateText).split('/');
    return { day: day || '--', month: month || '--' };
};

const parseDate = (dateStr) => {
    const parts = String(dateStr).split('/');
    if (parts.length !== 3) return 0;
    const [dd, mm, yyyy] = parts.map((p) => parseInt(p, 10));
    if (!dd || !mm || !yyyy) return 0;
    return new Date(yyyy, mm - 1, dd).getTime();
};

const Event = () => {
    const [activeCategory, setActiveCategory] = useState('Tất cả');
    const [sortBy, setSortBy] = useState('date-desc');
    const [showRegister, setShowRegister] = useState(false);
    const [registerEventTitle, setRegisterEventTitle] = useState('Sự kiện');
    const [registerEventId, setRegisterEventId] = useState(null);
    const [regVersion, setRegVersion] = useState(0);

    useEffect(() => {
        document.body.classList.add('event-body');
        return () => {
            document.body.classList.remove('event-body');
        };
    }, []);

    const categories = useMemo(() => {
        const set = new Set(EVENTS.map((e) => e.category));
        return ['Tất cả', ...Array.from(set)];
    }, []);

    const filteredEvents = useMemo(() => {
        const filtered = EVENTS.filter((e) => {
            const byCategory = activeCategory === 'Tất cả' ? true : e.category === activeCategory;
            return byCategory;
        });

        const sorted = [...filtered];
        if (sortBy === 'date-desc') {
            sorted.sort((a, b) => {
                const aDate = parseDate(a.endDate ?? a.startDate ?? a.dateText ?? '');
                const bDate = parseDate(b.endDate ?? b.startDate ?? b.dateText ?? '');
                return bDate - aDate;
            });
        } else if (sortBy === 'date-asc') {
            sorted.sort((a, b) => {
                const aDate = parseDate(a.endDate ?? a.startDate ?? a.dateText ?? '');
                const bDate = parseDate(b.endDate ?? b.startDate ?? b.dateText ?? '');
                return aDate - bDate;
            });
        } else if (sortBy === 'name') {
            sorted.sort((a, b) => a.title.localeCompare(b.title));
        }

        return sorted;
    }, [activeCategory, sortBy]);

    return (
        <div className="event-container">
            {/* Hero Section with Categories */}
            <div className="event-hero">
                <Container className="py-4">
                    <div className="event-catGrid" role="list">
                        {DISCOVER_CATEGORIES.map(({ id, labelTop, labelBottom, mapsTo, Icon }) => {
                            const canMap = categories.includes(mapsTo);
                            const isActive = canMap && activeCategory === mapsTo;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    className={`event-catItem ${isActive ? 'is-active' : ''}`}
                                    role="listitem"
                                    onClick={() => setActiveCategory(canMap ? mapsTo : 'Tất cả')}
                                    aria-label={`${labelTop} ${labelBottom}`}
                                >
                                    <div className="event-catCircle">
                                        <Icon />
                                    </div>
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

            {/* Events List */}
            <Container className="pb-5">
                <div className="event-sectionHead">
                    <div>
                        <h3 className="event-sectionTitle">
                            {activeCategory === 'Tất cả' ? 'Sự kiện' : `Sự kiện • ${activeCategory}`}
                        </h3>
                        <p className="event-sectionSub">
                            {filteredEvents.length} sự kiện.
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

                {filteredEvents.length === 0 ? (
                    <div className="event-empty glass-panel">
                        <div className="event-emptyTitle">Không tìm thấy sự kiện phù hợp</div>
                        <div className="event-emptySub">Thử đổi danh mục khác nhé.</div>
                        <Button
                            className="event-secondaryBtn mt-3"
                            type="button"
                            onClick={() => setActiveCategory('Tất cả')}
                        >
                            Xoá bộ lọc
                        </Button>
                    </div>
                ) : (
                    <div className="event-rowList">
                        {filteredEvents.map((e) => {
                            const { day, month } = getDateParts(e.dateText);
                            const badgeText = CATEGORY_BADGE_MAP[e.category] ?? e.category;
                            const registered = regVersion >= 0 ? isRegistered(e.id) : false;
                            return (
                                <div key={e.id} className="event-row glass-panel">
                                    <div className="event-rowMedia" aria-hidden="true">
                                        <div className="event-rowMediaOverlay" />
                                    </div>

                                    <div className="event-rowBody">
                                        <div className="event-rowTitleWrap">
                                            <div className="event-rowBadge">{badgeText}</div>
                                            <Link className="event-rowTitle" to={`/events/${e.id}`}>
                                                {e.title}
                                            </Link>
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
                                            className={`event-rowBtn ${registered ? 'registered' : ''}`}
                                            type="button"
                                            onClick={() => {
                                                setRegisterEventTitle(e.title);
                                                setRegisterEventId(e.id);
                                                setShowRegister(true);
                                            }}
                                        >
                                            {registered ? 'Đã đăng ký ✓' : 'Đăng ký'}
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

            {/* Registration Modal */}
            <RegistrationModal
                show={showRegister}
                onHide={() => setShowRegister(false)}
                onChanged={() => setRegVersion((v) => v + 1)}
                eventId={registerEventId}
                eventTitle={registerEventTitle}
            />
        </div>
    );
};

export default Event;
