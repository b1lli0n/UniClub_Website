import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/EventCard.css';

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/events/${event.id}`);
  };
  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="event-card" onClick={handleClick}>
      <div className="event-card-image">
        <div className="event-image-placeholder">
          <span>Event Image</span>
        </div>
        <div className="event-date-badge">
          {formatDate(event.date)}
        </div>
      </div>
      <div className="event-card-content">
        <h3 className="event-card-title">{event.name || 'Event Name'}</h3>
        <p className="event-card-description">
          {event.description || 'Mô tả về sự kiện này...'}
        </p>
        <div className="event-card-footer">
          <span className="event-location">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 8.66667C9.10457 8.66667 10 7.77124 10 6.66667C10 5.5621 9.10457 4.66667 8 4.66667C6.89543 4.66667 6 5.5621 6 6.66667C6 7.77124 6.89543 8.66667 8 8.66667Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8 1.33333C6.15905 1.33333 4.66667 2.82572 4.66667 4.66667C4.66667 7.33333 8 14.6667 8 14.6667C8 14.6667 11.3333 7.33333 11.3333 4.66667C11.3333 2.82572 9.84095 1.33333 8 1.33333Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            {event.location || 'TBA'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
