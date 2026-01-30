import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <Container>
            <Row className="align-items-center">
              <Col md={6}>
                <span className="hero-badge">New Season</span>
                <h1 className="hero-title">Sweet Vibes Only ✨</h1>
                <p className="hero-description">
                  Kết nối với cộng đồng, tham gia sự kiện và tận hưởng màu sắc cuộc sống.
                </p>
                <div className="hero-buttons">
                  <button 
                    className="btn-primary"
                    onClick={() => navigate('/clubs')}
                  >
                    Khám phá ngay
                  </button>
                  <button className="btn-secondary">Xem video</button>
                </div>
              </Col>
              <Col md={6} className="d-none d-md-block">
                <div className="hero-decoration">
                  <div className="decoration-blob blob-1"></div>
                  <div className="decoration-blob blob-2"></div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </div>

      {/* Trending Clubs Section */}
      <Container className="trending-section">
        <div className="section-header">
          <h2 className="section-title">Trending Clubs 🔥</h2>
          <a href="/clubs" className="section-link">Xem tất cả →</a>
        </div>

        <Row className="clubs-grid">
          <Col md={4} className="mb-4">
            <div className="club-card glass-card">
              <div className="club-image club-image-1">
                <div className="club-badge">🎨 Design</div>
              </div>
              <div className="club-content">
                <h4 className="club-title">Pastel Lovers</h4>
                <p className="club-description">
                  Dành cho những người yêu thích sự nhẹ nhàng.
                </p>
                <div className="club-footer">
                  <div className="club-members">
                    <div className="member-avatar avatar-1"></div>
                    <div className="member-avatar avatar-2"></div>
                    <div className="member-avatar avatar-3">+99</div>
                  </div>
                  <button className="club-action-btn">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </Col>

          <Col md={4} className="mb-4">
            <div className="club-card glass-card event-card">
              <div className="club-image club-image-2">
                <div className="event-badge">LIVE EVENT</div>
                <div className="event-date">
                  <p className="event-month">THÁNG 3</p>
                  <p className="event-day">15</p>
                </div>
              </div>
              <div className="club-content">
                <h4 className="club-title">Pool Party 2024</h4>
                <p className="club-description">
                  Tiệc hồ bơi sôi động nhất mùa hè này.
                </p>
                <button className="event-ticket-btn">Đặt vé ngay</button>
              </div>
            </div>
          </Col>

          <Col md={4} className="mb-4">
            <div className="club-card glass-card progress-card">
              <div className="club-content">
                <span className="progress-badge">COMMUNITY</span>
                <h4 className="club-title">Music Festival</h4>
                <p className="club-description">Sự kiện âm nhạc lớn nhất.</p>
                <div className="progress-section">
                  <div className="progress-header">
                    <span>Đã bán</span>
                    <span>85%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Featured Event Section */}
      <Container className="featured-event-section">
        <div className="featured-event-card glass-card">
          <div className="featured-event-header">
            <button className="back-btn">⬅ Back</button>
            <div className="featured-logo">
              <div className="logo-content">LOGO</div>
            </div>
          </div>
          
          <div className="featured-event-body">
            <Row>
              <Col md={8}>
                <span className="event-category">Workshop Online</span>
                <h1 className="featured-event-title">Làm Bánh Ngọt Candy</h1>
                <p className="featured-event-description">
                  Học cách làm những chiếc bánh macaron màu pastel tuyệt đẹp với công thức độc quyền. 
                  Phù hợp cho người mới bắt đầu.
                </p>
                
                <div className="event-tags">
                  <span className="tag tag-1">#Cooking</span>
                  <span className="tag tag-2">#Pastel</span>
                  <span className="tag tag-3">#Weekend</span>
                </div>

                <div className="event-actions">
                  <button 
                    className="register-btn"
                    onClick={() => navigate('/events')}
                  >
                    Đăng ký ($29)
                  </button>
                  <button className="favorite-btn">♥</button>
                </div>
              </Col>
              
              <Col md={4}>
                <div className="event-info-card">
                  <h3 className="info-card-title">Thông tin</h3>
                  <div className="info-items">
                    <div className="info-item">
                      <div className="info-icon icon-1">🕒</div>
                      <div className="info-text">
                        <p className="info-label">Thời gian</p>
                        <p className="info-value">14:00 - 16:00</p>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon icon-2">📅</div>
                      <div className="info-text">
                        <p className="info-label">Ngày</p>
                        <p className="info-value">20 Tháng 5, 2024</p>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon icon-3">👤</div>
                      <div className="info-text">
                        <p className="info-label">Host</p>
                        <p className="info-value">Sweetie Team</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Home;
