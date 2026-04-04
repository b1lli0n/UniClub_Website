import React, { useEffect, useMemo, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import '../../styles/Event.css';
import eventApi from '../../api/eventApi';
import { getAllClubs } from '../../api/clubApi';
import Pagination from '../../components/common/Pagination';

const CATEGORY_BADGE_MAP = {
  Workshop: 'Workshop, Học tập',
  'Thể thao': 'Thể thao, Sức khoẻ',
  'Giải trí': 'Giải trí, Trải nghiệm',
  'Cộng đồng': 'Hoạt động, Cộng đồng',
};

const getDateParts = (event) => {
  const dateStr = event.start_time || event.startDate || event.dateText || '';
  if (!dateStr) return { day: '--', month: '--' };
  if (typeof dateStr === 'object' && dateStr instanceof Date) {
    return { day: String(dateStr.getDate()).padStart(2, '0'), month: String(dateStr.getMonth() + 1).padStart(2, '0') };
  }
  if (String(dateStr).includes('T')) {
    const d = new Date(dateStr);
    return { day: String(d.getDate()).padStart(2, '0'), month: String(d.getMonth() + 1).padStart(2, '0') };
  }
  const parts = String(dateStr).split('/');
  if (parts.length >= 2) return { day: parts[0], month: parts[1] };
  return { day: '--', month: '--' };
};

const parseDate = (dateStr) => {
  if (dateStr && String(dateStr).includes('T')) return new Date(dateStr).getTime();
  const parts = String(dateStr).split('/');
  if (parts.length !== 3) return 0;
  const [dd, mm, yyyy] = parts.map((p) => parseInt(p, 10));
  if (!dd || !mm || !yyyy) return 0;
  return new Date(yyyy, mm - 1, dd).getTime();
};

const DISCOVER_CATEGORIES = [
  { id: 'all', labelTop: 'Tất cả', labelBottom: '', mapsTo: 'Tất cả', icon: ' 🌟' },
  { id: 'workshop', labelTop: 'Work Shop,', labelBottom: 'Học tập', mapsTo: 'Workshop', icon: '💡' },
  { id: 'sport', labelTop: 'Thể Thao', labelBottom: '', mapsTo: 'Thể thao', icon: '🏀' },
  { id: 'entertainment', labelTop: 'Giải trí', labelBottom: '', mapsTo: 'Giải trí', icon: '🎮' },
  { id: 'community', labelTop: 'Hoạt động', labelBottom: 'cộng đồng', mapsTo: 'Cộng đồng', icon: '🤝' },
];

const EventPublic = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Query params chỉ dùng cho search/sort/filter
  const query = searchParams.get('q') || '';
  const sortBy = searchParams.get('sort') || 'date-desc';
  const categoryParam = searchParams.get('category') || 'Tất cả';

  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const EVENTS_PER_PAGE = 12;

  // Scroll to top khi đổi trang
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    document.body.classList.add('event-body');
    return () => document.body.classList.remove('event-body');
  }, []);

  // Reset về trang 1 khi lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryParam, query, sortBy]);

  // Đồng bộ UI state <-> query params
  useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    const fetchPublicEvents = async () => {
      setLoading(true);
      try {
        // Sử dụng API getAllEvents thay vì duyệt từng club
        const res = await eventApi.getAllEvents({
          q: query || '',
          category: activeCategory !== 'Tất cả' ? activeCategory : '',
          sort: sortBy,
          page: currentPage,
          limit: EVENTS_PER_PAGE
        });

        if (res?.data?.success) {
          const list = res?.data?.data || [];
          setEvents(list.map(e => ({
            ...e,
            __clubName: e.club_id?.name || 'UniClub',
          })));
          setTotalPages(res?.data?.pagination?.pages || 1);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setEvents([]);
      }
      setLoading(false);
    };

    fetchPublicEvents();
  }, [activeCategory, query, sortBy, currentPage]);

  const categories = useMemo(() => {
    const set = new Set(events.map((e) => (e.category ? e.category.trim() : '')).filter(Boolean));
    return ['Tất cả', ...Array.from(set)];
  }, [events]);

  // Bỏ filter ở client vì BE đã filter sẵn
  const filteredEvents = events;

  const sortedEvents = useMemo(() => {
    const sorted = [...filteredEvents];
    if (sortBy === 'date-desc') {
      sorted.sort((a, b) => {
        const aDate = parseDate(a.end_time ?? a.start_time ?? a.endDate ?? a.startDate ?? a.dateText ?? '');
        const bDate = parseDate(b.end_time ?? b.start_time ?? b.endDate ?? b.startDate ?? b.dateText ?? '');
        return bDate - aDate;
      });
    } else if (sortBy === 'date-asc') {
      sorted.sort((a, b) => {
        const aDate = parseDate(a.end_time ?? a.start_time ?? a.endDate ?? a.startDate ?? a.dateText ?? '');
        const bDate = parseDate(b.end_time ?? b.start_time ?? b.endDate ?? b.startDate ?? b.dateText ?? '');
        return aDate - bDate;
      });
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
    return sorted;
  }, [filteredEvents, sortBy]);

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
                  onClick={() => {
                    // Always allow switching to the selected category
                    // Filtering logic will handle empty results if needed
                    const nextCat = mapsTo;
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.set('category', nextCat);
                      return next;
                    });
                  }}
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
        {/* Search Bar */}
        <div className="event-searchBar mb-4">
          <div className="event-searchWrapper">
            <span className="event-searchIcon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </span>
            <input
              type="text"
              className="event-searchInput"
              placeholder="Tìm kiếm sự kiện..."
              value={query}
              onChange={(e) => {
                const nextQuery = e.target.value;
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  if (nextQuery) {
                    next.set('q', nextQuery);
                  } else {
                    next.delete('q');
                  }
                  return next;
                });
              }}
            />
            {query && (
              <button
                type="button"
                className="event-searchClear"
                onClick={() => {
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.delete('q');
                    return next;
                  });
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="event-sectionHead">
          <div>
            <h3 className="event-sectionTitle">{activeCategory === 'Tất cả' ? 'Sự kiện' : `Sự kiện • ${activeCategory}`}</h3>
            <p className="event-sectionSub">
              {sortedEvents.length} sự kiện{query ? ' (đã lọc theo tìm kiếm)' : ''}.
            </p>
          </div>

          <div className="event-sort">
            <label className="event-sortLabel">Sort:</label>
            <select
              className="event-sortSelect"
              value={sortBy}
              onChange={(e) => {
                const nextSort = e.target.value;
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set('sort', nextSort);
                  return next;
                });
              }}
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
        ) : sortedEvents.length === 0 ? (
          <div className="event-empty glass-panel">
            <div className="event-emptyTitle">Không tìm thấy sự kiện phù hợp</div>
            <div className="event-emptySub">Thử đổi danh mục hoặc từ khóa khác nhé.</div>
            <Button
              className="event-secondaryBtn mt-3"
              type="button"
              onClick={() => {
                setSearchParams({});
              }}
            >
              Xoá bộ lọc
            </Button>
          </div>
        ) : (
          <div className="event-grid">
            {events.map((e) => {
              const { day, month } = getDateParts(e);
              const badgeText = CATEGORY_BADGE_MAP[e.category] ?? e.category;
              const clubId = e.club_id?._id || e.club_id?.id || e.clubId || e.__clubId;
              const eventId = e._id || e.id;
              const eventLink = clubId ? `/club/${clubId}/events/${eventId}` : '#';

              return (
                <div key={`${clubId || 'event'}-${eventId}`} className="event-grid-card glass-panel">
                  {/* Category Badge */}
                  <div className="event-grid-badge">{badgeText}</div>
                  
                  {/* Date Overlay */}
                  <div className="event-grid-date-overlay">
                    <span className="event-grid-day">{day}</span>
                    <span className="event-grid-month">Tháng {month}</span>
                  </div>

                  {/* Media Section */}
                  <div className="event-grid-media">
                    <img
                      src={e.media_urls && e.media_urls.length > 0 
                        ? (e.media_urls[0].startsWith('http') ? e.media_urls[0] : `http://localhost:5000${e.media_urls[0]}`)
                        : "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop"}
                      alt={e.title}
                      className="event-grid-img"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop";
                      }}
                    />
                  </div>

                  {/* Body Content */}
                  <div className="event-grid-body">
                    <Link className="event-grid-title" to={eventLink}>
                      {e.title}
                    </Link>

                    <div className="event-grid-meta">
                      <div className="event-grid-meta-item">
                        <span aria-hidden="true">👥</span>
                        <span>{e.__clubName || e.club_id?.name || 'UniClub'}</span>
                      </div>
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

        {!loading && events.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            loading={loading}
          />
        )}
      </Container>
    </div>
  );
};

export default EventPublic;
