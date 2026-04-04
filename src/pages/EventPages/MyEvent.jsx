import React, { useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../../styles/Event.css";
import eventApi from "../../api/eventApi";
import Pagination from "../../components/common/Pagination";

const CATEGORY_BADGE_MAP = {
  Workshop: "Workshop, Học tập",
  "Thể thao": "Thể thao, Sức khoẻ",
  "Giải trí": "Giải trí, Trải nghiệm",
  "Cộng đồng": "Hoạt động, Cộng đồng",
};

function formatDate(date) {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d)) return "—";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function getEventTime(e) {
  const t = e.end_time ?? e.start_time ?? e.endDate ?? e.startDate ?? e.dateText;
  if (!t) return 0;
  if (typeof t === "string" && t.includes("T")) return new Date(t).getTime();
  if (typeof t === "string" && t.includes("/")) {
    const parts = t.split("/");
    if (parts.length >= 3) {
      const [dd, mm, yyyy] = parts.map((p) => parseInt(p, 10));
      return new Date(yyyy, mm - 1, dd).getTime();
    }
  }
  return new Date(t).getTime();
}

const MyEvent = () => {
  const [sortBy, setSortBy] = useState("date-desc");
  const [activeNav, setActiveNav] = useState("events");
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const EVENTS_PER_PAGE = 10;

  useEffect(() => {
    document.body.classList.add("event-body");
    return () => {
      document.body.classList.remove("event-body");
    };
  }, []);

  useEffect(() => {
    // Gọi API lấy sự kiện đã tham gia
    const fetchMyEvents = async () => {
      setLoading(true);
      try {
        const res = await eventApi.getPastEvents({
          page: currentPage,
          limit: EVENTS_PER_PAGE,
          sort: sortBy
        });
        if (res?.data?.success) {
          setMyEvents(res.data.data || []);
          setTotalPages(res.data.pagination?.pages || 1);
        }
      } catch (err) {
        console.error("Error fetching my events:", err);
        setMyEvents([]);
      }
      setLoading(false);
    };
    fetchMyEvents();
  }, [currentPage, sortBy]);

  // Sắp xếp sự kiện theo sortBy (backend past events trả start_time, end_time ISO)
  const sortedEvents = useMemo(() => {
    const events = [...myEvents];
    if (sortBy === "date-desc") {
      events.sort((a, b) => {
        const aDate = getEventTime(a);
        const bDate = getEventTime(b);
        return bDate - aDate;
      });
    } else if (sortBy === "date-asc") {
      events.sort((a, b) => {
        const aDate = getEventTime(a);
        const bDate = getEventTime(b);
        return aDate - bDate;
      });
    } else if (sortBy === "name") {
      events.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }
    return events;
  }, [myEvents, sortBy]);

  return (
    <div className="event-container">
      <Container className="pb-5">
        <div className="myevent-header">
          <div>
            <h1 className="myevent-title">Sự kiện tôi đã tham gia</h1>
            <p className="myevent-subtitle">
              Quản lý danh sách các sự kiện mà bạn đã Tạo hoặc đã Tham gia.
            </p>
          </div>
        </div>

        <Row className="g-4">
          <Col lg={9}>
            <div className="myevent-toolbar">
              <div className="myevent-sort">
                <label className="myevent-sortLabel">Sort:</label>
                <select
                  className="myevent-sortSelect"
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
              <div className="myevent-empty glass-panel">
                <div className="myevent-emptyTitle">Đang tải dữ liệu...</div>
              </div>
            ) : sortedEvents.length === 0 ? (
              <div className="myevent-empty glass-panel">
                <div className="myevent-emptyTitle">Chưa có sự kiện đã tham gia</div>
                <div className="myevent-emptySub">Các sự kiện bạn đã đăng ký và kết thúc sẽ hiển thị ở đây.</div>
                <Button as={Link} to="/events" className="event-secondaryBtn mt-3">
                  Khám phá sự kiện
                </Button>
              </div>
            ) : (
              <>
                <div className="event-grid">
                  {sortedEvents.map((e) => {
                    const badgeText = CATEGORY_BADGE_MAP[e.category] ?? e.category;
                    const clubId = e.club_id?._id || e.club_id?.id || e.club_id;
                    const eventId = e._id || e.id;
                    const eventLink = clubId ? `/club/${clubId}/events/${eventId}` : '#';
                    const { day, month } = (() => {
                      const d = new Date(e.start_time);
                      return {
                        day: isNaN(d) ? "--" : String(d.getDate()).padStart(2, "0"),
                        month: isNaN(d) ? "--" : String(d.getMonth() + 1).padStart(2, "0")
                      };
                    })();

                    return (
                      <div key={`${clubId || 'my'}-${eventId}`} className="event-grid-card glass-panel">
                        <div className="event-grid-badge">{badgeText}</div>

                        <div className="event-grid-date-overlay">
                          <span className="event-grid-day">{day}</span>
                          <span className="event-grid-month">Tháng {month}</span>
                        </div>

                        {/* Media Section */}
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
                              <span aria-hidden="true">👥</span>
                              <span>{e.club_id?.name || e.host || 'UniClub'}</span>
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

                {!loading && myEvents.length > 0 && totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    loading={loading}
                  />
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MyEvent;
