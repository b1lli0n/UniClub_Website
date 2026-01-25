import React, { useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../styles/Event.css";
import { EVENTS } from "../data/events";
import { getRegistrationsMap } from "../data/eventLocalStore";
import EventTopbar from "../components/EventTopbar";

const CATEGORY_BADGE_MAP = {
  Workshop: "Workshop, Học tập",
  "Thể thao": "Thể thao, Sức khoẻ",
  "Giải trí": "Giải trí, Trải nghiệm",
  "Cộng đồng": "Hoạt động, Cộng đồng",
};

const MyEvent = () => {
  const [sortBy, setSortBy] = useState("date-desc"); // "date-desc" | "date-asc" | "name"
  const [activeNav, setActiveNav] = useState("events"); // "club" | "events"

  useEffect(() => {
    document.body.classList.add("event-body");
    return () => {
      document.body.classList.remove("event-body");
    };
  }, []);

  const myEvents = useMemo(() => {
    const regs = getRegistrationsMap();
    const registeredIds = Object.keys(regs).filter((id) => regs[id]);
    const registered = EVENTS.filter((e) => registeredIds.includes(e.id));

    // Filter past events (endDate < today)
    const now = Date.now();
    const past = registered.filter((e) => {
      const raw = e.endDate ?? e.startDate ?? "";
      const parts = String(raw).split("/");
      if (parts.length !== 3) return false;
      const [dd, mm, yyyy] = parts.map((p) => parseInt(p, 10));
      if (!dd || !mm || !yyyy) return false;
      const end = new Date(yyyy, mm - 1, dd, 23, 59, 59, 999).getTime();
      return end < now;
    });

    // Sort
    if (sortBy === "date-desc") {
      past.sort((a, b) => {
        const aDate = parseDate(a.endDate ?? a.startDate ?? "");
        const bDate = parseDate(b.endDate ?? b.startDate ?? "");
        return bDate - aDate;
      });
    } else if (sortBy === "date-asc") {
      past.sort((a, b) => {
        const aDate = parseDate(a.endDate ?? a.startDate ?? "");
        const bDate = parseDate(b.endDate ?? b.startDate ?? "");
        return aDate - bDate;
      });
    } else if (sortBy === "name") {
      past.sort((a, b) => a.title.localeCompare(b.title));
    }

    return past;
  }, [sortBy]);

  function parseDate(dateStr) {
    const parts = String(dateStr).split("/");
    if (parts.length !== 3) return 0;
    const [dd, mm, yyyy] = parts.map((p) => parseInt(p, 10));
    if (!dd || !mm || !yyyy) return 0;
    return new Date(yyyy, mm - 1, dd).getTime();
  }

  return (
    <div className="event-container">
      <Container className="pt-4 pb-3">
        <EventTopbar placeholder="Tìm kiếm sự kiện của tôi..." />
      </Container>

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
          <Col lg={3}>
            <div className="myevent-sidebar glass-panel">
              <button
                type="button"
                className={`myevent-navItem ${activeNav === "club" ? "is-active" : ""}`}
                onClick={() => setActiveNav("club")}
              >
                Quản lý câu lạc bộ
              </button>
              <button
                type="button"
                className={`myevent-navItem ${activeNav === "events" ? "is-active" : ""}`}
                onClick={() => setActiveNav("events")}
              >
                Quản lý sự kiện
              </button>
            </div>
          </Col>

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

            {myEvents.length === 0 ? (
              <div className="myevent-empty glass-panel">
                <div className="myevent-emptyTitle">Chưa có sự kiện đã tham gia</div>
                <div className="myevent-emptySub">Các sự kiện bạn đã đăng ký và kết thúc sẽ hiển thị ở đây.</div>
                <Button as={Link} to="/event" className="event-secondaryBtn mt-3">
                  Khám phá sự kiện
                </Button>
              </div>
            ) : (
              <div className="myevent-list">
                {myEvents.map((e) => {
                  const badgeText = CATEGORY_BADGE_MAP[e.category] ?? e.category;
                  return (
                    <div key={e.id} className="myevent-card glass-panel">
                      <Row className="g-3 align-items-center">
                        <Col md={4}>
                          <div className="myevent-cardImage" aria-hidden="true">
                            <div className="event-rowMediaOverlay" />
                          </div>
                        </Col>
                        <Col md={8}>
                          <div className="myevent-cardBadges">
                            <span className="myevent-badge">{badgeText}</span>
                            <span className="myevent-badge">
                              {e.startDate ?? e.dateText} / {e.endDate ?? e.dateText}
                            </span>
                          </div>
                          <h3 className="myevent-cardTitle">{e.title}</h3>
                          <div className="myevent-cardHost">Clb đảm nhận sự kiện: {e.host ?? "UniClub"}</div>
                          <Button as={Link} to={`/event/${e.id}`} className="myevent-cardBtn">
                            Xem sự kiện
                          </Button>
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
