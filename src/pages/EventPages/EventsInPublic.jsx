import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ListOfEvents.css';

const ListOfEvents = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [eventStatus, setEventStatus] = useState('all');
  const [timeFilter, setTimeFilter] = useState('nearest');
  const navigate = useNavigate();

  // Sample event data
  const [allEvents] = useState([
    {
      id: 1,
      name: 'Workshop Lập trình Web',
      category: 'Work Shop Học tập',
      description: 'Học cách xây dựng website hiện đại với React và Node.js',
      date: '2024-03-20',
      location: 'Phòng 101',
      participants: 45,
      status: 'upcoming',
      club: 'CLB Công nghệ',
    },
    {
      id: 2,
      name: 'Giải bóng đá liên khoa',
      category: 'Thể Thao',
      description: 'Giải đấu bóng đá giữa các khoa trong trường',
      date: '2024-03-25',
      location: 'Sân vận động',
      participants: 120,
      status: 'upcoming',
      club: 'CLB Thể thao',
    },
    {
      id: 3,
      name: 'Đêm nhạc Acoustic',
      category: 'Giải trí',
      description: 'Buổi biểu diễn âm nhạc acoustic với các ca sĩ sinh viên',
      date: '2024-03-18',
      location: 'Sân khấu trung tâm',
      participants: 200,
      status: 'ongoing',
      club: 'CLB Nghệ thuật',
    },
    {
      id: 4,
      name: 'Ngày hội Tình nguyện',
      category: 'Hoạt động cộng đồng',
      description: 'Tham gia các hoạt động tình nguyện vì cộng đồng',
      date: '2024-04-01',
      location: 'Khu vực trung tâm',
      participants: 150,
      status: 'upcoming',
      club: 'CLB Tình nguyện',
    },
  ]);

  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'workshop', name: 'Work Shop Học tập' },
    { id: 'sports', name: 'Thể Thao' },
    { id: 'entertainment', name: 'Giải trí' },
    { id: 'community', name: 'Hoạt động cộng đồng' },
  ];

  const statusOptions = [
    { id: 'all', name: 'Tất cả' },
    { id: 'upcoming', name: 'Sắp diễn ra' },
    { id: 'ongoing', name: 'Đang diễn ra' },
    { id: 'ended', name: 'Đã kết thúc' },
  ];

  const getCategoryId = (categoryName) => {
    const map = {
      'Work Shop Học tập': 'workshop',
      'Thể Thao': 'sports',
      'Giải trí': 'entertainment',
      'Hoạt động cộng đồng': 'community',
    };
    return map[categoryName] || 'all';
  };

  const filteredEvents = allEvents.filter((event) => {
    const categoryMatch = selectedCategory === 'all' || getCategoryId(event.category) === selectedCategory;
    const statusMatch = eventStatus === 'all' || event.status === eventStatus;
    return categoryMatch && statusMatch;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (timeFilter === 'nearest') {
      return new Date(a.date) - new Date(b.date);
    } else {
      return new Date(b.date) - new Date(a.date);
    }
  });

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  return (
    <div className="list-of-events-page">
      <div className="events-container">
        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-buttons">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`filter-button ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
          <div className="sort-section">
            <button className="sort-button">
              Sort
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Event Status Filter */}
        <div className="event-status-filter">
          <label>Trạng thái sự kiện:</label>
          <div className="status-buttons">
            {statusOptions.map((status) => (
              <button
                key={status.id}
                className={`status-button ${eventStatus === status.id ? 'active' : ''}`}
                onClick={() => setEventStatus(status.id)}
              >
                {status.name}
              </button>
            ))}
          </div>
        </div>

        {/* Time Filter */}
        <div className="time-filter-section">
          <button
            className={`time-filter-button ${timeFilter === 'nearest' ? 'active' : ''}`}
            onClick={() => setTimeFilter('nearest')}
          >
            Thời gian gần nhất
          </button>
          <button
            className={`time-filter-button ${timeFilter === 'furthest' ? 'active' : ''}`}
            onClick={() => setTimeFilter('furthest')}
          >
            Thời gian xa nhất
          </button>
        </div>

        {/* Events List */}
        <div className="events-list">
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event, index) => (
              <div key={event.id} className="event-card-container">
                {index === 0 ? (
                  // Large event card (first event)
                  <div className="event-card large" onClick={() => handleEventClick(event.id)}>
                    <div className="event-text-large">
                      <h3 className="event-name-large">{event.name}</h3>
                      <p className="event-description-large">{event.description}</p>
                      <div className="event-meta-large">
                        <span className="event-club">{event.club}</span>
                        <span className="event-date">{new Date(event.date).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Regular event card
                  <div className="event-card regular" onClick={() => handleEventClick(event.id)}>
                    <div className="event-text">
                      <h3 className="event-name">{event.name}</h3>
                      <p className="event-description">{event.description}</p>
                      <div className="event-meta">
                        <span className="event-club">{event.club}</span>
                      </div>
                    </div>
                    <div className="event-date-box">
                      <label>Ngày Hoạt động</label>
                      <p>{new Date(event.date).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <button
                      className="register-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle registration
                      }}
                    >
                      Đăng ký
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-events">
              <p>Không tìm thấy sự kiện nào</p>
            </div>
          )}
        </div>

        {/* View More Button */}
        {sortedEvents.length > 0 && (
          <div className="view-more-section">
            <button className="view-more-button">
              Xem thêm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListOfEvents;
