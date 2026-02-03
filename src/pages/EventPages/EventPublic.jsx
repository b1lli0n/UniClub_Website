import React, { useEffect, useMemo, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import '../../styles/Event.css';
import eventApi from '../../api/eventApi';
import { getAllClubs } from '../../api/clubApi';

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

  useEffect(() => {
    document.body.classList.add('event-body');
    return () => document.body.classList.remove('event-body');
  }, []);

  // Đồng bộ UI state <-> query params
  useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    const fetchPublicEvents = async () => {
      setLoading(true);
      try {
        // Backend hiện không có endpoint public rõ ràng trong FE,
        // nên gom events bằng cách lấy list clubs rồi fetch events theo từng club.
        const clubsRes = await getAllClubs();
        const clubs = clubsRes?.data || clubsRes?.data?.clubs || clubsRes?.clubs || [];

        const results = await Promise.all(
          (clubs || []).map(async (c) => {
            const clubId = c._id || c.id;
            if (!clubId) return [];
            const res = await eventApi.getEventsByClub(clubId);
            const list = res?.data?.data || [];
            return (Array.isArray(list) ? list : []).map((e) => ({
              ...e,
              __clubId: clubId,
              __clubName: c.name,
            }));
          })
        );

        setEvents(results.flat());
      } catch (err) {
        setEvents([]);
      }
      setLoading(false);
    };
    fetchPublicEvents();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(events.map((e) => (e.category ? e.category.trim() : '')).filter(Boolean));
    return ['Tất cả', ...Array.from(set)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    const activeCat = activeCategory.trim().toLowerCase();

    const filtered = events.filter((e) => {
      const eventCat = e.category ? e.category.trim().toLowerCase() : '';
      const byCategory = activeCat === 'tất cả' ? true : eventCat.includes(activeCat);
      const byQuery = !q
        ? true
        : `${e.title} ${e.description} ${e.category} ${e.location} ${e.__clubName || ''}`.toLowerCase().includes(q);
      return byCategory && byQuery;
    });

    const sorted = [...filtered];
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
  }, [events, activeCategory, query, sortBy]);

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
        <div className="event-sectionHead">
          <div>
            <h3 className="event-sectionTitle">{activeCategory === 'Tất cả' ? 'Sự kiện' : `Sự kiện • ${activeCategory}`}</h3>
            <p className="event-sectionSub">
              {filteredEvents.length} sự kiện{query ? ' (đã lọc theo tìm kiếm)' : ''}.
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
        ) : filteredEvents.length === 0 ? (
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
          <div className="event-rowList">
            {filteredEvents.map((e) => {
              const { day, month } = getDateParts(e);
              const badgeText = CATEGORY_BADGE_MAP[e.category] ?? e.category;
              const clubId = e.__clubId || e.club_id?._id || e.club_id?.id || e.clubId;
              const eventId = e._id || e.id;
              return (
                <div key={`${clubId || 'club'}-${eventId}`} className="event-row glass-panel">
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
                      {/* ID lấy từ params route (clubId/eventId), query chỉ dùng filter */}
                      <Link className="event-rowTitle" to={clubId ? `/club/${clubId}/events/${eventId}` : '#'}>
                        {e.title}
                      </Link>
                      <div className="event-rowBadge">{badgeText}</div>
                    </div>

                    <div className="event-rowMeta">
                      <div className="event-rowMetaItem">
                        <span className="event-rowMetaIcon" aria-hidden="true">
                          👤
                        </span>
                        <span className="event-rowMetaText">{e.__clubName || e.host || 'UniClub'}</span>
                      </div>
                      <div className="event-rowMetaItem">
                        <span className="event-rowMetaIcon" aria-hidden="true">
                          📍
                        </span>
                        <span className="event-rowMetaText">{e.location}</span>
                      </div>
                    </div>

                    <Button className="event-rowBtn" type="button" as={Link} to={clubId ? `/club/${clubId}/events/${eventId}` : '#'}>
                      Xem chi tiết
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
    </div>
  );
};

export default EventPublic;

