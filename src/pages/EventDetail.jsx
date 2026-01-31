import React, { useEffect, useState } from "react";
import { Badge, Button, Container, Spinner } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/Event.css";
import EventTopbar from "../components/EventTopbar";
import RegistrationModal from "../components/RegistrationModal";
import eventService from "../services/eventService";

const CATEGORY_BADGE_MAP = {
  Workshop: "Workshop, Học tập",
  "Thể thao": "Thể thao, Sức khoẻ",
  "Giải trí": "Giải trí, Trải nghiệm",
  "Cộng đồng": "Hoạt động, Cộng đồng",
};
const STATUS_MAP = {
  0: "Sắp diễn ra",
  1: "Đang mở",
  2: "Đã kết thúc",
  3: "Đã huỷ",
};
// 0: not_open, 1: open, 2: closed
const CHECK_IN_STATUS_MAP = {
  0: "Chưa mở check-in",
  1: "Đang mở check-in",
  2: "Đã đóng check-in",
};
// Hàm format ngày từ ISO string
function formatDate(date) {
  if (!date) return '--/--/----';
  const d = new Date(date);
  if (isNaN(d)) return '--/--/----';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

// Hàm giả lập lấy profile user 
function getProfile() {
  return {
    userId: localStorage.getItem("userId"),
    fullName: localStorage.getItem("fullName") || "Bạn",
    email: localStorage.getItem("email") || "",
  };
}

const EventDetail = () => {
  const { eventId } = useParams();
  const [showRegister, setShowRegister] = useState(false);
  const [regVersion, setRegVersion] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackVersion, setFeedbackVersion] = useState(0);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [checkinVersion, setCheckinVersion] = useState(0);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinError, setCheckinError] = useState(null);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [isOngoing, setIsOngoing] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkinTime, setCheckinTime] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);

  useEffect(() => {
    document.body.classList.add("event-body");
    return () => {
      document.body.classList.remove("event-body");
    };
  }, []);

  // Lấy chi tiết event
  useEffect(() => {
    setLoading(true);
    const fetchEvent = async () => {
      try {
        const profile = getProfile();
        const userIdentifier = profile.userId || profile.email;
        const res = await eventService.getEventById(eventId, userIdentifier || undefined);
        const ev = res.data.data;
        setEvent(ev);
        setRegistered(
          !!ev.userRegistration ||
          ["pending", "approved", "attended"].includes(ev.userRegistrationStatus)
        );
        setCheckedIn(ev.userRegistration?.status === 3 || false);
        setCheckinTime(ev.userRegistration?.check_in_time ?? null);
        setHasEnded(ev.isEventEnded);
        setIsOngoing(ev.isEventStarted && !ev.isEventEnded);
      } catch (err) {
        setEvent(null);
      }
      setLoading(false);
    };
    fetchEvent();
    // eslint-disable-next-line
  }, [eventId, regVersion, checkinVersion]);

  // Lấy feedbacks (view feedback – không cần userId)
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await eventService.getFeedbacks(eventId);
        const data = res.data?.data;
        const list = Array.isArray(data) ? data : (data?.feedbacks || []);
        setFeedbackList(list);
      } catch (err) {
        setFeedbackList([]);
      }
    };
    fetchFeedbacks();
  }, [eventId, feedbackVersion]);

  // Check-in
  const handleCheckin = async () => {
    setCheckinLoading(true);
    setCheckinError(null);
    try {
      const profile = getProfile();
      const res = await eventService.checkInEvent(eventId, profile.email);
      setCheckedIn(true);
      setCheckinTime(
        res.data?.data?.checkInTime ??
        res.data?.data?.registration?.check_in_time ??
        new Date()
      );
      setCheckinVersion((v) => v + 1);
    } catch (err) {
      const data = err.response?.data;
      const message = data?.message || err.message || "Check-in thất bại. Vui lòng thử lại.";
      const checkInStatusFromApi = data?.checkInStatus;
      setCheckinError(message);
      // Toast: dùng message từ backend, có thể đổi nội dung theo checkInStatus
      if (checkInStatusFromApi === "not_open") {
        toast.warning(message, { autoClose: 6000 });
      } else if (checkInStatusFromApi === "closed") {
        toast.info(message, { autoClose: 6000 });
      } else {
        toast.error(message, { autoClose: 6000 });
      }
    }
    setCheckinLoading(false);
  };

  // Gửi feedback (POST /api/events/:id/feedback { userId, rating, comment })
  const handleFeedbackSubmit = async () => {
    const profile = getProfile();
    const userId = profile.userId || profile.email;
    if (!userId || !feedbackText.trim()) return;
    setFeedbackSubmitting(true);
    try {
      await eventService.submitFeedback(eventId, {
        userId,
        rating: feedbackRating,
        comment: feedbackText.trim(),
      });
      setFeedbackText("");
      setFeedbackRating(5);
      setFeedbackVersion((v) => v + 1);
      toast.success("Đã gửi feedback.");
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Gửi feedback thất bại.";
      toast.error(message);
    }
    setFeedbackSubmitting(false);
  };

  if (loading) {
    return (
      <div className="event-container">
        <Container className="py-5 text-center">
          <Spinner animation="border" />
        </Container>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-container">
        <Container className="py-5">
          <div className="event-detailNotFound glass-panel">
            <div className="event-detailNotFoundTitle">Không tìm thấy sự kiện</div>
            <div className="event-detailNotFoundSub">
              Sự kiện này có thể đã bị xoá hoặc đường dẫn không đúng.
            </div>
            <Button as={Link} to="/event" className="event-secondaryBtn mt-3">
              Quay lại danh sách
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="event-container">
      <Container className="pt-4 pb-3">
        <EventTopbar placeholder="Tìm kiếm sự kiện..." />
      </Container>

      <Container className="pb-5">
        <div className="event-detailTop">
          <div className="event-detailTopRight">
            <Badge className="event-status" bg="info">
              {event.status === 3
                ? STATUS_MAP[3]
                : event.isEventEnded
                  ? STATUS_MAP[2]
                  : event.isEventStarted
                    ? STATUS_MAP[1]
                    : STATUS_MAP[0]}
            </Badge>
          </div>
        </div>
        <div className="event-detailLayout">
          <div className="event-detailMain">
            <h1 className="event-detailH1">
              {event.title}
              {event.category && (
                <span className="event-detailTag" style={{ marginLeft: 10 }}>
                  {CATEGORY_BADGE_MAP[event.category] ?? event.category}
                </span>
              )}
            </h1>
            <div className="event-orgCard glass-panel">
              <div className="event-orgLeft">
                <div className="event-orgAvatar" aria-hidden="true" />
                <div>
                  <div className="event-orgName">{event.host ?? "UniClub"}</div>
                  <div className="event-orgSub">Đơn vị tổ chức</div>
                </div>
              </div>
              <Button className="event-orgBtn" type="button">
                Liên hệ
              </Button>
            </div>

            <div className="event-detailContent glass-panel">
              <div className="event-detailContentTitle">Nội dung chi tiết</div>
              <div className="event-detailSectionTitle">1) GIỚI THIỆU</div>
              <p className="event-detailParagraph">{event.longDescription ?? event.description}</p>
              <div className="event-detailSectionTitle">2) HOẠT ĐỘNG CHÍNH</div>
              <ul className="event-detailList">
                <li>{event.description}</li>
                <li>
                  Thời gian:{" "}
                  {event.start_time && event.end_time
                    ? `${formatDate(event.start_time)} – ${formatDate(event.end_time)}`
                    : (event.timeText ?? "—")}
                </li>
                <li>Địa điểm: {event.location}</li>
              </ul>
              <div className="event-detailSectionTitle">3) Ý NGHĨA</div>
              <p className="event-detailParagraph">
                Cùng UniClub kết nối bạn bè, trải nghiệm hoạt động thú vị và tạo kỷ niệm đẹp trong trường.
              </p>
            </div>
          </div>

          <div className="event-detailSide">
            <div className="event-sideCard glass-panel">
              <div className="event-sideImage" aria-hidden="true">
                {event.media_urls && event.media_urls.length > 0 ? (
                  <img
                    src={`http://localhost:5000${event.media_urls[0]}`}
                    alt={event.title}
                    className="event-rowImg"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                  />
                ) : (
                  <div className="event-rowMediaOverlay" />
                )}
              </div>
              <div className="event-sideInfo">
                <div className="event-sideTwoCol">
                  <div className="event-sideMini">
                    <div className="event-sideMiniLabel">Ngày bắt đầu</div>
                    <div className="event-sideMiniValue">{formatDate(event.start_time)}</div>
                  </div>
                  <div className="event-sideMini">
                    <div className="event-sideMiniLabel">Ngày kết thúc</div>
                    <div className="event-sideMiniValue">{formatDate(event.end_time)}</div>
                  </div>
                </div>
                <div className="event-sideBlock">
                  <div className="event-sideMiniLabel">Địa điểm</div>
                  <div className="event-sideMiniValue">{event.location ?? "—"}</div>
                </div>
                <div className="event-sideParticipants">
                  <div className="event-sideAvatars" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="event-sideParticipantsText">
                    {typeof event.registrationCount === "number"
                      ? `${event.registrationCount} người sẽ tham gia sự kiện này`
                      : typeof event.currentParticipants === "number"
                        ? `${event.currentParticipants} người sẽ tham gia sự kiện này`
                        : "Nhiều người sẽ tham gia sự kiện này"}
                  </div>
                </div>
              </div>
              <Button className="event-sideRegisterBtn" type="button" onClick={() => setShowRegister(true)}>
                {registered ? "Huỷ/Chỉnh sửa đăng ký" : "Đăng ký"}
              </Button>
              {registered && isOngoing && (() => {
                const checkInStatus = event.check_in_status ?? 0;
                const isCheckInOpen = checkInStatus === 1;
                const status = event.userRegistrationStatus;
                const isApproved =
                  status === "approved" ||
                  status === "attended" ||
                  [2, 3].includes(Number(status));
                const canClickCheckIn = isCheckInOpen && isApproved && !checkedIn;

                return (
                  <div className="event-checkinSection">
                    {checkedIn ? (
                      <div className="event-checkinStatus">
                        <div className="event-checkinIcon">✓</div>
                        <div className="event-checkinInfo">
                          <div className="event-checkinTitle">Đã check-in</div>
                          {checkinTime && (
                            <div className="event-checkinTime">
                              {new Date(checkinTime).toLocaleString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : checkInStatus === 0 ? (
                      <div className="event-checkinForm event-checkinForm--disabled">
                        <div className="event-checkinStatusLabel">{CHECK_IN_STATUS_MAP[0]}</div>
                        <div className="event-checkinHint">Ban tổ chức chưa mở check-in.</div>
                        <Button className="event-checkinBtn" type="button" disabled>
                          Check-in chưa mở
                        </Button>
                      </div>
                    ) : checkInStatus === 2 ? (
                      <div className="event-checkinForm event-checkinForm--disabled">
                        <div className="event-checkinStatusLabel">{CHECK_IN_STATUS_MAP[2]}</div>
                        <div className="event-checkinHint">Không thể check-in sau khi đã đóng.</div>
                        <Button className="event-checkinBtn" type="button" disabled>
                          Check-in đã đóng
                        </Button>
                      </div>
                    ) : (
                      <div className="event-checkinForm">
                        {!isApproved && (
                          <div className="event-checkinHint mb-2">Bạn cần được duyệt đăng ký để check-in.</div>
                        )}
                        <div className="event-checkinEmailLabel">Check-in bằng email</div>
                        <div className="event-checkinEmailValue">{getProfile().email}</div>
                        {checkinError && (
                          <div className="event-checkinError">{checkinError}</div>
                        )}
                        <Button
                          className="event-checkinBtn"
                          type="button"
                          disabled={checkinLoading || !canClickCheckIn}
                          onClick={handleCheckin}
                        >
                          {checkinLoading ? (
                            <>
                              <span className="event-checkinBtnSpinner">⏳</span>
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <span className="event-checkinBtnIcon">📍</span>
                              Check-in ngay
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="event-feedbackPanel glass-panel">
          <div className="event-feedbackHeader">
            <div className="event-feedbackTitle2">Feedback</div>
            {!hasEnded ? (
              <div className="event-feedbackHint">Chỉ feedback sau khi sự kiện kết thúc.</div>
            ) : !registered ? (
              <div className="event-feedbackHint">Bạn cần đăng ký tham gia để feedback.</div>
            ) : null}
          </div>
          <div className="event-feedbackList">
            {feedbackList.length === 0 ? (
              <div className="event-feedbackEmpty2">Chưa có feedback.</div>
            ) : (
              feedbackList.map((f) => (
                <div key={f._id || f.id} className="event-feedbackItem">
                  <div className="event-feedbackItemTop">
                    <div className="event-feedbackName">
                      {f.user_id?.name ?? f.userName ?? "Ẩn danh"}
                    </div>
                    <div className="event-feedbackDate">
                      {(f.created_at ?? f.createdAt)
                        ? new Date(f.created_at ?? f.createdAt).toLocaleString("vi-VN")
                        : ""}
                    </div>
                  </div>
                  {f.rating != null && (
                    <div className="event-feedbackRating">⭐ {f.rating}/5</div>
                  )}
                  <div className="event-feedbackText">{f.comment ?? f.text ?? ""}</div>
                </div>
              ))
            )}
          </div>
          <div className="event-feedbackForm">
            <div className="event-feedbackRatingWrap mb-2">
              <label className="event-feedbackRatingLabel">Đánh giá (1–5 sao):</label>
              <select
                className="event-feedbackRatingSelect"
                value={feedbackRating}
                onChange={(e) => setFeedbackRating(Number(e.target.value))}
                disabled={!hasEnded || !registered}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} sao
                  </option>
                ))}
              </select>
            </div>
            <textarea
              className="event-feedbackTextarea"
              placeholder="Viết cảm nhận của bạn..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              disabled={!hasEnded || !registered}
              rows={4}
            />
            <Button
              className="event-feedbackSubmit"
              type="button"
              disabled={!hasEnded || !registered || !feedbackText.trim() || feedbackSubmitting}
              onClick={handleFeedbackSubmit}
            >
              {feedbackSubmitting ? "Đang gửi..." : "Gửi feedback"}
            </Button>
          </div>
        </div>

        <RegistrationModal
          show={showRegister}
          onHide={() => setShowRegister(false)}
          onChanged={() => setRegVersion((v) => v + 1)}
          eventId={eventId}
          eventTitle={event.title}
        />
      </Container>
    </div>
  );
};

export default EventDetail;