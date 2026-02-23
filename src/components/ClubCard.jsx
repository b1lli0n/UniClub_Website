import React from 'react';
import '../styles/ClubCard.css';

const ClubCard = ({ club }) => {
  return (
    <div className="club-card">
      <div className="club-card-image">
        <div className="club-image-placeholder">
          <span>Club Image</span>
        </div>
      </div>
      <div className="club-card-content">
        <h3 className="club-card-title">{club.name || 'Club Name'}</h3>
        <p className="club-card-description">
          {club.description || 'Mô tả về câu lạc bộ này...'}
        </p>
        <div className="club-card-footer">
          <span className="club-members">{club.members || 0} thành viên</span>
        </div>
      </div>
    </div>
  );
};

export default ClubCard;
