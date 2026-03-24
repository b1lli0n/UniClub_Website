import React, { useState } from 'react';
import EventTimelineViewModal from './EventTimelineViewModal';
import './EventTimeline.css';

export default function EventTimeline({ eventId }) {
  const [showModal, setShowModal] = useState(false);

  if (!eventId) return null;

  return (
    <>
      <button
        className="timeline-trigger-button"
        onClick={() => setShowModal(true)}
        title="Xem timeline sự kiện"
      >
        📅 Xem Timeline
      </button>

      {showModal && (
        <EventTimelineViewModal 
          eventId={eventId} 
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
