import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/ClubCard.css';

const ClubCard = ({ club }) => {
  const navigate = useNavigate();
  const imageUrl = club?.logo_url;
  const clubId = club?.id || club?._id;

  const normalizeClubStatus = (c) => {
    const raw = c?.status ?? c?.club_status ?? c?.clubStatus;

    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') {
      const s = raw.trim().toLowerCase();
      if (s === 'active' || s === 'approved' || s === '1') return 1;
      if (s === 'pending' || s === '0') return 0;
      // In many places BE/FE uses "inactive/paused" interchangeably.
      if (s === 'pause' || s === 'paused' || s === 'inactive' || s === '2') return 2;
      if (s === 'reject' || s === 'rejected' || s === 'declined' || s === '3') return 3;
    }

    // Fallback when backend returns boolean flag.
    const isActive = c?.is_active ?? c?.isActive ?? c?.active;
    if (typeof isActive === 'boolean') return isActive ? 1 : 2;

    return null;
  };

  const clubStatus = normalizeClubStatus(club);
  const isPaused = clubStatus === 2;
  const isRejected = clubStatus === 3;
  // Only pause (2) is treated as "greyed out" per requirement.
  const isInactive = isPaused;
  const shouldShowPill = isPaused || isRejected;
  const statusLabel = isPaused ? 'Tạm dừng' : isRejected ? 'Từ chối' : '';

  const handleViewDetail = () => {
    if (!clubId) return;
    navigate(`/clubs/${clubId}`);
  };

  return (
    <div
      className={`club-card${isInactive ? ' club-card--inactive' : ''}`}
      onClick={handleViewDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleViewDetail();
        }
      }}
      aria-disabled={!clubId}
      style={{ cursor: clubId ? 'pointer' : 'default' }}
    >
      <div className="club-card-image">
        {shouldShowPill && (
          <div
            className={`club-card-status-pill${isPaused ? ' club-card-status-pill--paused' : ' club-card-status-pill--rejected'}`}
            aria-hidden
          >
            {statusLabel}
          </div>
        )}
        {imageUrl ? (
          <img 
            src={`http://localhost:5000${imageUrl}`} 
            alt={club.name || 'Club Image'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
          <span>Club Image</span>
      </div>
      <div className="club-card-content">
        <h3 className="club-card-title">{club.name || 'Club Name'}</h3>
        <p className="club-card-description">
          {club.description || 'Mô tả về câu lạc bộ này...'}
        </p>
        <div className="club-card-footer">
          <span className="club-members">{club.member_total ||  0} thành viên</span>
        </div>
      </div>
    </div>
  );
};

export default ClubCard;
