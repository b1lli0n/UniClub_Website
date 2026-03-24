import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ClubDetailCard.css';
import { ASSET_BASE } from '../api/api';

const ROLE_DISPLAY = {
  0: { label: 'Member', color: '#e471ed' },
  1: { label: 'Leader', color: '#ed3414' },
  2: { label: 'Sub Leader', color: '#FFB84D' },
  3: { label: 'Secretary', color: '#13C2C2' },
  4: { label: 'Treasurer', color: '#52C41A' },
};

const ClubDetailCard = ({ club }) => {
  const navigate = useNavigate();

  const handleSeeMore = () => {
    const clubId = club.id || club._id;
    const roleNum = club.membershipRole ?? club.role;

    // Persist selected club context so sidebar can render role-based items.
    if (clubId) {
      localStorage.setItem('clubId', String(clubId));
    }
    if (roleNum !== undefined && roleNum !== null) {
      localStorage.setItem('clubRole', String(roleNum));
    }

    // Management roles (Leader, Sub Leader, Secretary, Treasurer) can access dashboard
    // Role: 1=leader, 2=sub_leader, 3=secretary, 4=treasurer
    if (roleNum > 0) {
      navigate(`/clubs/${clubId}/dashboard`);
    } else {
      navigate(`/clubs/${clubId}`);
    }
  };

  const handleCardClick = () => {
    handleSeeMore();
  };

  const rawLogo = club.logo_url;
  const logoSrc = rawLogo
    ? rawLogo.startsWith('http')
      ? rawLogo
      : `${ASSET_BASE}${rawLogo}`
    : null;

  const roleNum = club.membershipRole ?? club.role;
  const roleInfo = typeof roleNum === 'number' ? ROLE_DISPLAY[roleNum] : null;

  const membersCount = club.members ?? club.member_total ?? 0;
  const eventsCount = club.events ?? club.event_total ?? 0;

  return (
    <div
      className="club-detail-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="club-detail-card-visual">
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
            <span>Club</span>
          </div>
        )}
        <span className="club-detail-tag club-detail-tag--meta">
          {(club.category || 'Khác').toUpperCase()}
        </span>
      </div>
      <div className="club-detail-card-body">
        <h3 className="club-detail-title">{club.name || 'Club Name'}</h3>
        <p className="club-detail-description">{club.description || 'Mô tả về câu lạc bộ này...'}</p>
        <div className="club-detail-info">
          <span className="club-detail-members">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 9C10.6569 9 12 7.65685 12 6C12 4.34315 10.6569 3 9 3C7.34315 3 6 4.34315 6 6C6 7.65685 7.34315 9 9 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2.25 16.5C2.25 14.3475 4.34754 12.75 6.75 12.75H11.25C13.6525 12.75 15.75 14.3475 15.75 16.5V18H2.25V16.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {membersCount} thành viên
          </span>
          <span className="club-detail-events">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 2V4M13 2V4M3 7H15M4 4H14C14.5523 4 15 4.44772 15 5V14C15 14.5523 14.5523 15 14 15H4C3.44772 15 3 14.5523 3 14V5C3 4.44772 3.44772 4 4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {eventsCount} sự kiện
          </span>
          {roleInfo && (
            <span
              className="club-detail-role"
              style={{
                display: 'inline-block',
                paddingLeft: '8px',
                paddingRight: '8px',
                paddingTop: '4px',
                paddingBottom: '4px',
                backgroundColor: `${roleInfo.color}20`,
                color: roleInfo.color,
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: '600',
                whiteSpace: 'nowrap',
              }}
            >
              {roleInfo.label}
            </span>
          )}
        </div>
        <div className="club-detail-card-arrow" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 6L16 12l-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ClubDetailCard;
