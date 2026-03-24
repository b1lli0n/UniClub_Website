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
      <div className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Nên tăng quản lý câu lạc bộ</h2>
          <p className="cta-description">Tạo câu lạc bộ của bạn và quản lý các thành viên, sự kiện dễ dàng.</p>
          <button 
            className="cta-button"
            onClick={() => navigate('/clubs/create')}
          >
            Tạo CLB của riêng bạn
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;