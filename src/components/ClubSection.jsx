import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ClubCard from './ClubCard';
import { getAllClubs } from '../api/clubApi';
import '../styles/ClubSection.css';

const ClubSection = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        const data = await getAllClubs();
        setClubs(data.data || data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching clubs:', err);
        setError(err.message || 'Không thể tải danh sách câu lạc bộ');
        setClubs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);
  const visibleClubs = 3;

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(clubs.length - visibleClubs, prev + 1));
  };

  const displayedClubs = clubs.slice(currentIndex, currentIndex + visibleClubs);

  if (loading) {
    return (
      <section className="club-section">
        <div className="section-header">
          <h2 className="section-title">Câu lạc bộ</h2>
        </div>
        <div className="club-section-content" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <p>Đang tải danh sách câu lạc bộ...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="club-section">
        <div className="section-header">
          <h2 className="section-title">Câu lạc bộ</h2>
        </div>
        <div className="club-section-content" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <p style={{ color: '#e74c3c' }}>Lỗi: {error}</p>
        </div>
      </section>
    );
  }

  if (clubs.length === 0) {
    return (
      <section className="club-section">
        <div className="section-header">
          <h2 className="section-title">Câu lạc bộ</h2>
        </div>
        <div className="club-section-content" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <p>Không có câu lạc bộ nào</p>
        </div>
      </section>
    );
  }

  return (
    <section className="club-section">
      <div className="section-header">
        <h2 className="section-title">Câu lạc bộ</h2>
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
