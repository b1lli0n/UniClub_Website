import React, { useEffect, useMemo, useState } from "react";
import { Badge, Button, Container } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../styles/Event.css";
import { getEventById } from "../data/events";
import EventTopbar from "../components/EventTopbar";
import RegistrationModal from "../components/RegistrationModal";
import {
  addFeedback,
  checkInEvent,
  getCheckinTime,
  getFeedbackList,
  getProfile,
  isCheckedIn,
  isRegistered,
} from "../data/eventLocalStore";

const CATEGORY_BADGE_MAP = {
  Workshop: "Workshop, Học tập",
  "Thể thao": "Thể thao, Sức khoẻ",
  "Giải trí": "Giải trí, Trải nghiệm",
  "Cộng đồng": "Hoạt động, Cộng đồng",
};

const EventDetail = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [showRegister, setShowRegister] = useState(false);
  const [regVersion, setRegVersion] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackVersion, setFeedbackVersion] = useState(0);
  const [checkinVersion, setCheckinVersion] = useState(0);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinError, setCheckinError] = useState(null);

  useEffect(() => {
    document.body.classList.add("event-body");
    return () => {
      document.body.classList.remove("event-body");
    };
  }, []);

  const event = useMemo(() => getEventById(eventId), [eventId]);
  const registered = useMemo(() => {
    // bump when registration changed
    void regVersion;
    return isRegistered(eventId);
  }, [eventId, regVersion]);

  const hasEnded = useMemo(() => {
    const raw = event?.endDate ?? event?.startDate ?? "";
    const parts = String(raw).split("/");
    if (parts.length !== 3) return false;
    const [dd, mm, yyyy] = parts.map((p) => parseInt(p, 10));
    if (!dd || !mm || !yyyy) return false;
    const end = new Date(yyyy, mm - 1, dd, 23, 59, 59, 999).getTime();
    return Date.now() > end;
  }, [event?.endDate, event?.startDate]);

  const isOngoing = useMemo(() => {
    if (!event) return false;
    const now = Date.now();
    const startRaw = event.startDate ?? "";
    const endRaw = event.endDate ?? event.startDate ?? "";
    const startParts = String(startRaw).split("/");
    const endParts = String(endRaw).split("/");
    if (startParts.length !== 3 || endParts.length !== 3) return false;
    const [sd, sm, sy] = startParts.map((p) => parseInt(p, 10));
    const [ed, em, ey] = endParts.map((p) => parseInt(p, 10));
    if (!sd || !sm || !sy || !ed || !em || !ey) return false;
    const start = new Date(sy, sm - 1, sd, 0, 0, 0, 0).getTime();
    const end = new Date(ey, em - 1, ed, 23, 59, 59, 999).getTime();
    return now >= start && now <= end;
  }, [event]);

  const checkedIn = useMemo(() => {
    void checkinVersion;
    return isCheckedIn(eventId);
  }, [eventId, checkinVersion]);

  const checkinTime = useMemo(() => {
    void checkinVersion;
    return getCheckinTime(eventId);
  }, [eventId, checkinVersion]);

  const feedbackList = useMemo(() => {
    // bump when added
    void feedbackVersion;
    return getFeedbackList(eventId);
  }, [eventId, feedbackVersion]);

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
              {event.status}
            </Badge>
          </div>
        </div>

        <div className="event-detailLayout">
          <div className="event-detailMain">
            <div className="event-detailPill">{CATEGORY_BADGE_MAP[event.category] ?? event.category}</div>
            <h1 className="event-detailH1">{event.title}</h1>

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
                <li>Thời gian: {event.timeText}</li>
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
                <div className="event-rowMediaOverlay" />
              </div>

              <div className="event-sideInfo">
                <div className="event-sideTwoCol">
                  <div className="event-sideMini">
                    <div className="event-sideMiniLabel">Ngày bắt đầu</div>
                    <div className="event-sideMiniValue">{event.startDate ?? event.dateText}</div>
                  </div>
                  <div className="event-sideMini">
                    <div className="event-sideMiniLabel">Ngày kết thúc</div>
                    <div className="event-sideMiniValue">{event.endDate ?? event.dateText}</div>
                  </div>
                </div>

                <div className="event-sideBlock">
                  <div className="event-sideMiniLabel">Làng concept</div>
                  <div className="event-sideMiniValue">{event.location}</div>
                  <div className="event-sideLink">Xem bản đồ</div>
                </div>

                <div className="event-sideParticipants">
                  <div className="event-sideAvatars" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="event-sideParticipantsText">
                    {typeof event.participants === "number" ? event.participants : "Nhiều"} người sẽ tham gia sự kiện này
                  </div>
                </div>
              </div>

              <Button className="event-sideRegisterBtn" type="button" onClick={() => setShowRegister(true)}>
                {registered ? "Huỷ/Chỉnh sửa đăng ký" : "Đăng ký"}
              </Button>

              {registered && isOngoing && (
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
                  ) : (
                    <div className="event-checkinForm">
                      <div className="event-checkinEmailLabel">Check-in bằng email</div>
                      <div className="event-checkinEmailValue">{getProfile().email}</div>
                      {checkinError && (
                        <div className="event-checkinError">{checkinError}</div>
                      )}
                      <Button
                        className="event-checkinBtn"
                        type="button"
                        disabled={checkinLoading}
                        onClick={async () => {
                          setCheckinLoading(true);
                          setCheckinError(null);
                          try {
                            const profile = getProfile();
                            // TODO: Gọi API backend check-in với email
                            // const response = await fetch(`/api/events/${eventId}/checkin`, {
                            //   method: 'POST',
                            //   headers: { 'Content-Type': 'application/json' },
                            //   body: JSON.stringify({ email: profile.email })
                            // });
                            // if (!response.ok) throw new Error('Check-in thất bại');
                            
                            // Simulate API call
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            
                            // Lưu vào localStorage sau khi API thành công
                            checkInEvent(eventId);
                            setCheckinVersion((v) => v + 1);
                          } catch (err) {
                            setCheckinError(err.message || "Check-in thất bại. Vui lòng thử lại.");
                          } finally {
                            setCheckinLoading(false);
                          }
                        }}
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
              )}
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
                <div key={f.id} className="event-feedbackItem">
                  <div className="event-feedbackItemTop">
                    <div className="event-feedbackName">{f.userName}</div>
                    <div className="event-feedbackDate">{new Date(f.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="event-feedbackText">{f.text}</div>
                </div>
              ))
            )}
          </div>

          <div className="event-feedbackForm">
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
              disabled={!hasEnded || !registered || !feedbackText.trim()}
              onClick={() => {
                const profile = getProfile();
                addFeedback(eventId, {
                  id: `${Date.now()}`,
                  userName: profile.fullName,
                  text: feedbackText.trim(),
                  createdAt: new Date().toISOString(),
                });
                setFeedbackText("");
                setFeedbackVersion((v) => v + 1);
              }}
            >
              Gửi feedback
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

