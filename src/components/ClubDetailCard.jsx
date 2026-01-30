import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ClubDetailCard.css';

// Backend base URL (dùng để build đường dẫn logo_url tương đối)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ASSET_BASE = API_BASE.replace(/\/api\/?$/, '');

const ClubDetailCard = ({ club }) => {
  const navigate = useNavigate();

  const handleSeeMore = () => {
    const clubId = club.id || club._id;
    navigate(`/clubs/${clubId}`);
  };

  const rawLogo = club.logo_url;
  const logoSrc = rawLogo
    ? rawLogo.startsWith('http')
      ? rawLogo
      : `${ASSET_BASE}${rawLogo}`
    : null;

  return (
    <div className="club-detail-card">
      <div className="club-detail-text">
        <h3 className="club-detail-title">{club.name || 'Club Name'}</h3>
        <p className="club-detail-description">
          {club.description || 'Mô tả về câu lạc bộ này...'}
        </p>
        <div className="club-detail-info">
          <span className="club-detail-members">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 9C10.6569 9 12 7.65685 12 6C12 4.34315 10.6569 3 9 3C7.34315 3 6 4.34315 6 6C6 7.65685 7.34315 9 9 9Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.25 16.5C2.25 14.3475 4.34754 12.75 6.75 12.75H11.25C13.6525 12.75 15.75 14.3475 15.75 16.5V18H2.25V16.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {club.members ?? club.member_total ?? 0} thành viên
          </span>
          <span className="club-detail-events">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 2V4M13 2V4M3 7H15M4 4H14C14.5523 4 15 4.44772 15 5V14C15 14.5523 14.5523 15 14 15H4C3.44772 15 3 14.5523 3 14V5C3 4.44772 3.44772 4 4 4Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {club.events ?? club.event_total ?? 0} sự kiện
          </span>
          <span className="club-detail-category">{club.category || 'Khác'}</span>
        </div>
        <button className="club-detail-see-more" onClick={handleSeeMore}>
          Xem thêm
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 12L10 8L6 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="club-detail-image">
        {logoSrc ? (
          <img
            src={logoSrc}
            alt={club.name}
            className="club-detail-logo-img"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/clubs/default.png';
            }}
          />
        ) : (
          <div className="club-detail-image-placeholder">
            <span>Club Image</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubDetailCard;
