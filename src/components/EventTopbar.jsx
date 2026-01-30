import React from "react";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import '../styles/EventTopbar.css';

const EventTopbar = ({ query = "", onQueryChange, placeholder = "Tìm kiếm theo tên, địa điểm...", isLoggedIn = false }) => {
  const navigate = useNavigate();

  return (
    <div className="event-topbar glass-panel">
      <div className="d-flex align-items-center gap-2">
        <img
          className="event-logo"
          src="/src/image/logo.png"
          alt="UniClub Logo"
        />
        <div className="event-brand">
          <div className="event-brandName">UniClub</div>
          <div className="event-brandSub">Eventssssss</div>
        </div>
      </div>

      <Form className="event-search" role="search" onSubmit={(e) => e.preventDefault()}>
        <Form.Control
          value={query}
          onChange={onQueryChange ? (e) => onQueryChange(e.target.value) : undefined}
          type="search"
          placeholder={placeholder}
          aria-label="Search events"
          readOnly={!onQueryChange}
        />
      </Form>

      <div className="event-actions">
        {isLoggedIn ? (
          <>
            <button className="event-iconBtn" type="button" aria-label="Notifications">
              🔔
            </button>
            <div className="event-userChip" aria-label="User">
              <div className="event-avatar" aria-hidden="true" />
              <div className="event-userText">
                <div className="event-userName">User</div>
                <div className="event-userSub">Member</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <button
              className="event-login-btn"
              type="button"
              onClick={() => navigate('/login')}
            >
              Đăng nhập
            </button>
            <button
              className="event-register-btn"
              type="button"
              onClick={() => navigate('/register')}
            >
              Đăng ký
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EventTopbar;
