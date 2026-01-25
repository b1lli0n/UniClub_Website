import React from "react";
import { Form } from "react-bootstrap";
import logo from "../assets/logo-uniclub.png";

const EventTopbar = ({ query = "", onQueryChange, placeholder = "Tìm kiếm theo tên, địa điểm..." }) => {
  return (
    <div className="event-topbar glass-panel">
      <div className="d-flex align-items-center gap-2">
        <img className="event-logo" src={logo} alt="UniClub Logo" />
        <div className="event-brand">
          <div className="event-brandName">UniClub</div>
          <div className="event-brandSub">Events</div>
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
      </div>
    </div>
  );
};

export default EventTopbar;

