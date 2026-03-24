import StatusBadge from '../events/StatusBadge';
import '../../styles/EventListCard.css';
import { Plus, Calendar, Edit, ChevronRight, CheckSquare, ExternalLink } from 'lucide-react';

export function EventListCard({ title = 'Sự kiện', events = [], clubName, onCreate, onView, onEdit, onAttend, onSeeAll, loading = false }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'TBC';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Đang cập nhật';
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit'
        });
    };

    return (
        <div className="glass-card-premium dashboard-event-list-container">
            <div className="event-list-header-premium">
                <div className="title-area">
                    <h3 className="event-list-title-modern">{title}</h3>
                    <p className="event-list-subtitle-modern">Hành động và tiến độ sự kiện nhanh</p>
                </div>
                <button className="btn-create-small-premium" onClick={onCreate}>
                    <Plus size={16} />
                    <span>Tạo sự kiện</span>
                </button>
            </div>

            <div className="event-list-content-premium">
                {loading ? (
                    <div className="list-loading-state">
                        <div className="mini-spinner"></div>
                        <p>Đang tải sự kiện...</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="list-empty-state">
                        <Calendar size={32} className="empty-icon-soft" />
                        <p>Chưa có sự kiện nào. Hãy tạo sự kiện đầu tiên!</p>
                    </div>
                ) : (
                    <div className="event-stack-premium">
                        {events.map((event) => {
                            const startTime = event.start_time || event.startAt || event.start_at;
                            const endTime = event.end_time || event.endAt || event.end_at;
                            
                            return (
                                <div
                                    key={event._id || event.id}
                                    className="event-row-item-modern"
                                >
                                    <div className="event-row-left">
                                        <div className="event-row-icon-box">
                                            <Calendar size={20} />
                                        </div>
                                        <div className="event-row-info">
                                            <h4 className="event-title-modern">{event.title}</h4>
                                            <p className="event-club-name-modern">{clubName}</p>
                                            <div className="event-row-actions-premium">
                                                <button className="btn-action-soft-pink" onClick={() => onView?.(event._id || event.id)}>
                                                    <ExternalLink size={14} />
                                                    <span>Xem</span>
                                                </button>
                                                <button className="btn-action-soft-blue" onClick={() => onEdit?.(event._id || event.id)}>
                                                    <Edit size={14} />
                                                    <span>Sửa</span>
                                                </button>
                                                <button className="btn-action-attend-premium" onClick={() => onAttend?.(event._id || event.id)}>
                                                    <CheckSquare size={14} />
                                                    <span>Điểm danh</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="event-row-right">
                                        <StatusBadge status={event.status} />
                                        <div className="event-date-badge-premium">
                                            <span className="date-text">
                                                {formatDate(startTime)} - {formatDate(endTime)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && (
                    <button
                        onClick={onSeeAll}
                        className="btn-see-all-full-width"
                    >
                        <span>Xem tất cả sự kiện CLB</span>
                        <ChevronRight size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}

export default EventListCard;
