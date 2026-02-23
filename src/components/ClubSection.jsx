import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ClubCard from './ClubCard';
import '../styles/ClubSection.css';

const ClubSection = () => {
  // Sample club data
  const [clubs] = useState([
    { id: 1, name: 'Câu lạc bộ Công nghệ', description: 'Nơi gặp gỡ và chia sẻ về công nghệ thông tin', members: 150 },
    { id: 2, name: 'Câu lạc bộ Nghệ thuật', description: 'Khám phá và phát triển tài năng nghệ thuật', members: 120 },
    { id: 3, name: 'Câu lạc bộ Thể thao', description: 'Rèn luyện sức khỏe và tinh thần đồng đội', members: 200 },
    { id: 4, name: 'Câu lạc bộ Văn học', description: 'Chia sẻ đam mê văn học và viết lách', members: 80 },
    { id: 5, name: 'Câu lạc bộ Kinh doanh', description: 'Phát triển kỹ năng kinh doanh và khởi nghiệp', members: 180 },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleClubs = 3;

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(clubs.length - visibleClubs, prev + 1));
  };

  const displayedClubs = clubs.slice(currentIndex, currentIndex + visibleClubs);

  return (
    <section className="club-section">
      <div className="section-header">
        <h2 className="section-title">Club</h2>
        <Link to="/clubs" className="see-more-link">
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
        </Link>
      </div>

      <div className="club-section-content">
        <button
          className="nav-arrow nav-arrow-left"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          aria-label="Previous clubs"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="club-cards-container">
          {displayedClubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>

        <button
          className="nav-arrow nav-arrow-right"
          onClick={handleNext}
          disabled={currentIndex >= clubs.length - visibleClubs}
          aria-label="Next clubs"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default ClubSection;
