import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EventCard from './EventCard';
import api from '../api/api';
import '../styles/EventSection.css';

const EventSection = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Try to fetch all public events
        const response = await api.get('/events');
        const eventData = response.data.data || response.data || [];
        setEvents(Array.isArray(eventData) ? eventData : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.message || 'Không thể tải danh sách sự kiện');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);
  const visibleEvents = 3;

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(events.length - visibleEvents, prev + 1));
  };

  const displayedEvents = events.slice(currentIndex, currentIndex + visibleEvents);

  if (loading) {
    return (
      <section className="event-section">
        <div className="section-header">
          <h2 className="section-title">Sự kiện</h2>
        </div>
        <div className="event-section-content" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <p>Đang tải danh sách sự kiện...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="event-section">
        <div className="section-header">
          <h2 className="section-title">Sự kiện</h2>
        </div>
        <div className="event-section-content" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <p style={{ color: '#e74c3c' }}>Lỗi: {error}</p>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="event-section">
        <div className="section-header">
          <h2 className="section-title">Sự kiện</h2>
        </div>
        <div className="event-section-content" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <p>Không có sự kiện nào</p>
        </div>
      </section>
    );
  }

  return (
    <section className="event-section">
      <div className="section-header">
        <h2 className="section-title">Sự kiện</h2>
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
