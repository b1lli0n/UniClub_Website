import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/EventCard.css';

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const eventId = event?.id || event?._id;
  const clubId = event?.club_id || event?.clubId || event?.club?.id || event?.club?._id;

  const handleClick = () => {
    if (!eventId) return;
    const targetPath = clubId ? `/club/${clubId}/events/${eventId}` : `/events/${eventId}`;
    navigate(targetPath);
  };

  // Handle both array and string formats safely
  let rawUrl = event?.media_urls || event?.media_url || event?.image_url;
  let imageUrl = Array.isArray(rawUrl) && rawUrl.length > 0 ? rawUrl[0] : (typeof rawUrl === 'string' ? rawUrl : null);
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
    <div
      className="event-card-modern"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-disabled={!eventId}
      style={{ cursor: eventId ? 'pointer' : 'default' }}
    >
      <div className="event-card-media-wrapper">
        <img 
          src={imageUrl 
            ? (typeof imageUrl === 'string' && imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`)
            : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"}  
          alt={event.name || event.title || 'Event Image'}
          className="event-card-img"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop";
          }}
        />
        <div className="event-card-badges">
          <span style={{ background: 'rgba(45, 27, 61, 0.75)', backdropFilter: 'blur(4px)', color: '#fff', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
             {formatDate(event.date || event.start_at || event.start_time)}
          </span>
        </div>
      </div>
      
      <div className="event-card-body">
        <h3 className="event-card-title-modern">{event.name || event.title || 'Sự kiện chưa có tên'}</h3>
        <p className="event-card-desc-modern">
          {event.description || 'Tham gia sự kiện này cùng câu lạc bộ để có những trải nghiệm thật thú vị!'}
        </p>

        <div className="event-card-info-grid">
          <div className="info-item-modern">
            <svg
              className="info-icon"
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
            <span className="info-text">{event.location || 'Chưa cập nhật địa điểm'}</span>
          </div>
        </div>

        <div className="event-card-footer">
          <button className="btn-view-modern">
            Xem chi tiết
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
