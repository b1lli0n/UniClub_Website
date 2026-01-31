import StatusBadge from './StatusBadge';
import '../../styles/EventCard.css';

const EventCard = ({ event, onViewDetails, formatDateTime }) => {
    return (
        <div className="glass-card myclub-card event-card">
            <div className="event-card-hero">
                📅
            </div>
            <div className="event-card-header">
                <h3 className="event-card-title">{event.title}</h3>
                <StatusBadge status={event.status} />
            </div>
            <p className="event-card-description">
                {event.description || 'Không có mô tả'}
            </p>
            <div className="event-card-meta">
                <div>📍 {event.location}</div>
                <div>🕐 {formatDateTime(event.startAt)}</div>
                <div>👥 Sức chứa: {event.capacity}</div>
            </div>
            <button
                onClick={() => onViewDetails(event._id)}
                className="card-button event-card-button"
            >
                Xem chi tiết
            </button>
        </div>
    );
};

export default EventCard;
