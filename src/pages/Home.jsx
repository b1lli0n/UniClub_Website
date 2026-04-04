import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Carousel from '../components/Carousel';
import ClubSection from '../components/ClubSection';
import EventSection from '../components/EventSection';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-page">
      {/* Carousel Section */}
      <Carousel />

      {/* Club Section */}
      <ClubSection />

      {/* Event Section */}
      <EventSection />

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="cta-decoration">
          <div className="cta-blob cta-blob-1"></div>
          <div className="cta-blob cta-blob-2"></div>
        </div>
        <div className="cta-content glass-card">
          <h2 className="cta-title">Nâng tầm quản lý câu lạc bộ</h2>
          <p className="cta-description">
            Tạo câu lạc bộ của riêng bạn và bắt đầu hành trình xây dựng cộng đồng sinh viên vững mạnh ngay hôm nay.
          </p>
          <button
            className="cta-button-premium"
            onClick={() => navigate('/clubs/create')}
          >
            <span>Tạo CLB của riêng bạn</span>
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;