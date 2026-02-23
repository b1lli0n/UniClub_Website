import StatusBadge from '../events/StatusBadge';
import '../../styles/EventListCard.css';

export function EventListCard({ title = 'Sự kiện', events = [], clubName, onCreate, onView, onEdit, onSeeAll, loading = false }) {
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

    return (
        <div className="glass-card event-list-card">
            <div className="event-list-header">
                <h3 className="event-list-title">{title}</h3>
                <button className="card-button event-list-create" onClick={onCreate}>
                    + Tạo sự kiện
                </button>
            </div>

            <div className="event-list-grid">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        Đang tải sự kiện...
                    </div>
                ) : events.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        Chưa có sự kiện nào. Hãy tạo sự kiện đầu tiên!
                    </div>
                ) : events.map((event) => (
                    <div
                        key={event._id || event.id}
                        className="myclub-card event-list-item"
                    >
                        <div className="event-list-thumb">
                            📅
                        </div>

                        <div>
                            <h4 className="event-list-item-title">{event.title}</h4>
                            <p className="event-list-club">{clubName}</p>
                            <div className="event-list-actions">
                                <button className="card-button event-list-action" onClick={() => onView?.(event._id || event.id)}>
                                    Xem sự kiện
                                </button>
                                <button className="card-button event-list-action" onClick={() => onEdit?.(event._id || event.id)}>
                                    Chỉnh sửa
                                </button>
                            </div>
                        </div>

                        <div className="event-list-meta">
                            <StatusBadge status={event.status} />
                            <span className="event-list-date">
                                {formatDate(event.startAt)} - {formatDate(event.endAt)}
                            </span>
                        </div>
                    </div>
                ))}

                {!loading && (
                    <button
                        onClick={onSeeAll}
                        className="event-list-see-all"
                    >
                        Xem tất cả sự kiện
                    </button>
                )}
            </div>
        </div>
    );
}

export default EventListCard;
