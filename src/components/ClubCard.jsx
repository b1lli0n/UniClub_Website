import React from 'react';
import '../styles/ClubCard.css';

const ClubCard = ({ club }) => {
  const imageUrl = club?.logo_url;
  console.log('ClubCard received club:', club);
  console.log('ClubCard imageUrl:', imageUrl);
  return (
    <div className="club-card">
      <div className="club-card-image">
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
