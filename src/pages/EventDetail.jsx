import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/EventDetail.css';

const EventDetail = () => {
  const { id } = useParams();
  const [comment, setComment] = useState('');

  // Sample event data
  const event = {
    id: id || 1,
    category: 'Work Shop Học tập',
    name: 'Workshop Lập trình Web',
    club: 'CLB Công nghệ',
    description: 'Tham gia workshop này để học cách xây dựng website hiện đại với React và Node.js. Chúng tôi sẽ hướng dẫn bạn từ cơ bản đến nâng cao, bao gồm cả việc deploy ứng dụng lên production. Workshop phù hợp cho cả người mới bắt đầu và những người đã có kinh nghiệm muốn nâng cao kỹ năng.',
    startDate: '2024-03-20',
    endDate: '2024-03-22',
    location: 'Phòng 101, Tòa nhà A',
    participants: 45,
    maxParticipants: 100,
  };

  // Sample feedback data
  const [feedbacks] = useState([
    {
      id: 1,
      user: 'Nguyễn Văn A',
      comment: 'Workshop rất hay và bổ ích!',
      date: '2024-03-15',
    },
    {
      id: 2,
      user: 'Trần Thị B',
      comment: 'Giảng viên nhiệt tình, nội dung dễ hiểu.',
      date: '2024-03-16',
    },
  ]);

  const handleRegister = () => {
    // Handle registration logic
    alert('Đăng ký thành công!');
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      // Handle comment submission
      console.log('Comment:', comment);
      setComment('');
    }
  };

  return (
    <div className="event-detail-page">
      <div className="event-detail-container">
        {/* Event Information Section */}
        <section className="event-information-section">
          <div className="event-info-grid">
            {/* Left Column */}
            <div className="event-info-left">
              <div className="event-info-item">
                <label>Thể loại</label>
                <p className="event-category">{event.category}</p>
              </div>
              <div className="event-info-item">
                <label>Tên sự kiện</label>
                <h1 className="event-name">{event.name}</h1>
              </div>
              <div className="event-club-badge">
                <span>{event.club}</span>
              </div>
              <div className="event-info-item">
                <label>Mô Tả</label>
                <p className="event-description">{event.description}</p>
              </div>
              <div className="event-image-placeholder">
                <span>Image</span>
              </div>
            </div>

            {/* Right Column */}
            <div className="event-info-right">
              <div className="event-info-item">
                <label>Ngày bắt đầu</label>
                <p className="event-date">{new Date(event.startDate).toLocaleDateString('vi-VN')}</p>
              </div>
              <div className="event-info-item">
                <label>Ngày kết thúc</label>
                <p className="event-date">{new Date(event.endDate).toLocaleDateString('vi-VN')}</p>
              </div>
              <div className="event-info-item">
                <label>Địa điểm diễn ra</label>
                <p className="event-location">{event.location}</p>
              </div>
              <div className="event-info-item">
                <label>Số lượng tham gia</label>
                <p className="event-participants">
                  {event.participants} / {event.maxParticipants} người
                </p>
              </div>
              <button className="register-button" onClick={handleRegister}>
                Đăng kí
              </button>
            </div>
          </div>
        </section>

        {/* Feedback Section */}
        <section className="feedback-section">
          <h2 className="section-title">Feedback</h2>
          <div className="feedback-form">
            <form onSubmit={handleSubmitComment}>
              <textarea
                className="feedback-input"
                placeholder="Viết bình luận của bạn..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="4"
              />
              <button type="submit" className="submit-comment-button">
                Gửi bình luận
              </button>
            </form>
          </div>
          <div className="feedbacks-list">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="feedback-item">
                <div className="feedback-header">
                  <span className="feedback-user">{feedback.user}</span>
                  <span className="feedback-date">
                    {new Date(feedback.date).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="feedback-comment">{feedback.comment}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EventDetail;
