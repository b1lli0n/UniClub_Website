import React, { useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../../styles/Event.css";
import eventApi from "../../api/eventApi";

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

        const res = await eventApi.getPastEvents();
        setMyEvents(res.data.data || []);
      } catch (err) {
        setMyEvents([]);
      }
      setLoading(false);
    };
    fetchMyEvents();
  }, []);

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
              <div className="myevent-list">
                {sortedEvents.map((e) => {
                  const badgeText = CATEGORY_BADGE_MAP[e.category] ?? e.category;
                  return (
                    <div key={e._id || e.id} className="myevent-card glass-panel">
                      <Row className="g-3 align-items-center">
                        <Col md={4}>
                          <div className="myevent-cardImage" aria-hidden="true">
                            {e.media_urls && e.media_urls.length > 0 ? (
                              <img
                                src={`http://localhost:5000${e.media_urls[0]}`}
                                alt={e.title}
                                className="myevent-cardImg"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                              />
                            ) : (
                              <div className="event-rowMediaOverlay" />
                            )}
                          </div>
                        </Col>
                        <Col md={8}>
                          <div className="myevent-cardBadges">
                            <span className="myevent-badge">{badgeText}</span>
                            <span className="myevent-badge">
                              {formatDate(e.start_time)} – {formatDate(e.end_time)}
                            </span>
                          </div>
                          <h3 className="myevent-cardTitle">{e.title}</h3>
                          <div className="myevent-cardHost">
                            Clb đảm nhận sự kiện: {e.club_id?.name ?? e.host ?? "UniClub"}
                          </div>
                          {(() => {
                            const clubId = e.club_id?._id || e.club_id?.id || e.club_id;
                            // If no clubId found, might need fallback or keep '#'
                            const linkTarget = clubId
                              ? `/club/${clubId}/events/${e._id || e.id}`
                              : '#';

                            return (
                              <Button as={Link} to={linkTarget} className="myevent-cardBtn">
                                Xem sự kiện
                              </Button>
                            );
                          })()}
                        </Col>
                      </Row>
                    </div>
                  );
                })}
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MyEvent;
