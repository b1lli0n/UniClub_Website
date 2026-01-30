import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import EventCard from './EventCard';
import '../styles/EventSection.css';

const EventSection = () => {
  // Sample event data (public events)
  const [events] = useState([
    {
      id: 1,
      name: 'Hội thảo Công nghệ 2024',
      description: 'Khám phá xu hướng công nghệ mới nhất trong năm 2024',
      date: '2024-03-15',
      location: 'Hội trường A',
    },
    {
      id: 2,
      name: 'Triển lãm Nghệ thuật Sinh viên',
      description: 'Trưng bày các tác phẩm nghệ thuật của sinh viên',
      date: '2024-03-20',
      location: 'Phòng triển lãm',
    },
    {
      id: 3,
      name: 'Giải bóng đá liên khoa',
      description: 'Giải đấu bóng đá giữa các khoa trong trường',
      date: '2024-03-25',
      location: 'Sân vận động',
    },
    {
      id: 4,
      name: 'Workshop Kỹ năng Viết',
      description: 'Học cách viết hiệu quả và sáng tạo',
      date: '2024-04-01',
      location: 'Phòng 101',
    },
    {
      id: 5,
      name: 'Ngày hội Khởi nghiệp',
      description: 'Cơ hội gặp gỡ các nhà đầu tư và doanh nhân',
      date: '2024-04-10',
      location: 'Hội trường B',
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleEvents = 3;

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(events.length - visibleEvents, prev + 1));
  };

  const displayedEvents = events.slice(currentIndex, currentIndex + visibleEvents);

  return (
    <section className="event-section">
      <div className="section-header">
        <h2 className="section-title">Event</h2>
        <Link to="/events" className="see-more-link">
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

      <div className="event-section-content">
        <button
          className="nav-arrow nav-arrow-left"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          aria-label="Previous events"
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

        <div className="event-cards-container">
          {displayedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        <button
          className="nav-arrow nav-arrow-right"
          onClick={handleNext}
          disabled={currentIndex >= events.length - visibleEvents}
          aria-label="Next events"
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

export default EventSection;
