import React, { useEffect, useMemo, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { cancelRegistration, getProfile, isRegistered, registerEvent, setProfile } from "../data/eventLocalStore";

const RegistrationModal = ({ show, onHide, eventId, eventTitle = "Sự kiện", onChanged }) => {
  const [mode, setMode] = useState("view"); // "view" | "edit"
  const [user, setUser] = useState(getProfile());
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (!show) return;
    setMode("view");
    setUser(getProfile());
    setRegistered(isRegistered(eventId));
  }, [show, eventId]);

  const canSubmit = useMemo(() => {
    return Boolean(user.fullName?.trim() && user.phone?.trim() && user.email?.trim());
  }, [user]);

  const handleRegister = () => {
    setProfile(user);
    registerEvent(eventId);
    onChanged?.();
    onHide?.();
  };

  const handleCancel = () => {
    cancelRegistration(eventId);
    onChanged?.();
    onHide?.();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      dialogClassName="event-regDialog"
      contentClassName="event-regContent"
    >
      <div className="event-regHeader">
        <div className="event-regHeaderTitle">Đăng ký tham gia sự kiện</div>
        <button type="button" className="event-regClose" onClick={onHide} aria-label="Close">
          ×
        </button>
      </div>

      <div className="event-regBanner" aria-hidden="true" />

      <div className="event-regTitle">{eventTitle}</div>

      {mode === "view" ? (
        <div className="event-regInfoWrap">
          <div className="event-regAvatar" aria-hidden="true" />

          <div className="event-regInfo">
            <div className="event-regInfoHeading">Thông tin của bạn</div>
            <div className="event-regInfoRow">
              <div className="event-regInfoKey">Họ và tên:</div>
              <div className="event-regInfoVal">{user.fullName}</div>
            </div>
            <div className="event-regInfoRow">
              <div className="event-regInfoKey">Số điện thoại:</div>
              <div className="event-regInfoVal">{user.phone}</div>
            </div>
            <div className="event-regInfoRow">
              <div className="event-regInfoKey">Email:</div>
              <div className="event-regInfoVal">{user.email}</div>
            </div>
          </div>

          <button
            type="button"
            className="event-regEditBtn"
            onClick={() => setMode("edit")}
            aria-label="Edit"
          >
            ✎
          </button>
        </div>
      ) : (
        <div className="event-regForm">
          <div className="event-regField">
            <div className="event-regLabel">Họ và tên</div>
            <Form.Control
              value={user.fullName}
              onChange={(e) => setUser((u) => ({ ...u, fullName: e.target.value }))}
              className="event-regInput"
            />
          </div>

          <div className="event-regField">
            <div className="event-regLabel">Số điện thoại</div>
            <Form.Control
              value={user.phone}
              onChange={(e) => setUser((u) => ({ ...u, phone: e.target.value }))}
              className="event-regInput"
            />
          </div>

          <div className="event-regField">
            <div className="event-regLabel">Email</div>
            <Form.Control
              value={user.email}
              onChange={(e) => setUser((u) => ({ ...u, email: e.target.value }))}
              className="event-regInput"
            />
          </div>

          <div className="event-regNote">
            Bấm vào nút “Đăng ký” ngay để tạo tài khoản và khám phá trải nghiệm đăng ký sự kiện chỉ với một bước,
            cũng sử dụng các tính năng hữu ích trên trang ngay thôi!
          </div>
        </div>
      )}

      <div className="event-regFooter">
        {registered ? (
          <Button className="event-regSubmit is-danger" type="button" onClick={handleCancel}>
            Huỷ đăng ký
          </Button>
        ) : (
          <Button className="event-regSubmit" type="button" disabled={!canSubmit} onClick={handleRegister}>
            Đăng ký
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default RegistrationModal;

