import StatusBadge from './StatusBadge';

const EventCard = ({ event, onViewDetails, formatDateTime }) => {
    return (
        <div className="glass-card myclub-card" style={{ padding: '16px' }}>
            <div style={{
                height: '140px',
                background: 'rgba(255,255,255,0.5)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                marginBottom: '12px'
            }}>
                📅
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{event.title}</h3>
                <StatusBadge status={event.status} />
            </div>
            <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '8px' }}>
                {event.description || 'Không có mô tả'}
            </p>
            <div style={{ fontSize: '0.875rem', color: 'var(--candy-text)', marginBottom: '8px' }}>
                <div>📍 {event.location}</div>
                <div>🕐 {formatDateTime(event.startAt)}</div>
                <div>👥 Sức chứa: {event.capacity}</div>
            </div>
            <button
                className="card-button"
                onClick={() => onViewDetails(event._id)}
                style={{ width: '100%', marginTop: '8px' }}
            >
                Xem chi tiết
            </button>
        </div>
    );
};

export default EventCard;
