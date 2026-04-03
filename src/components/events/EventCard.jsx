import StatusBadge from './StatusBadge';
import '../../styles/EventCard.css';
import { Calendar, MapPin, Users, ArrowRight, ImageIcon } from 'lucide-react';

const getProgressStatusLabel = (progressStatus) => {
    switch (String(progressStatus)) {
        case '0': return 'Nháp';
        case '1': return 'Hoàn thành';
        default: return 'N/A';
    }
};

const EventCard = ({ event, onViewDetails, formatDateTime }) => {
    const startTime = event.start_time || event.startAt || event.start_at;
    const location = event.location || 'Địa điểm: TBC';
    const capacity = event.capacity || 'N/A';
    const title = event.title || 'Sự kiện không tên';
    const description = event.description || 'Chưa có thông tin mô tả chi tiết cho sự kiện này...';
    
    // Check if we have an image
    const hasImage = event.media_urls && event.media_urls.length > 0;
    const mainImage = hasImage ? event.media_urls[0] : null;

    return (
        <div className="glass-card-premium event-card-modern">
            <div className="event-card-media-wrapper">
                {hasImage ? (
                    <img src={mainImage} alt={title} className="event-card-img" />
                ) : (
                    <div className="event-card-img-placeholder">
                        <ImageIcon size={32} />
                    </div>
                )}
                <div className="event-card-badges">
                    <StatusBadge status={event.status} />
                    {event.progress_status !== undefined && (
                        <div className="event-card-badge-progress">
                            {getProgressStatusLabel(event.progress_status)}
                        </div>
                    )}
                </div>
            </div>

            <div className="event-card-body">
                <h3 className="event-card-title-modern" title={title}>{title}</h3>
                <p className="event-card-desc-modern">{description}</p>
                
                <div className="event-card-info-grid">
                    <div className="info-item-modern">
                        <MapPin size={14} className="info-icon" />
                        <span className="info-text">{location}</span>
                    </div>
                    <div className="info-item-modern">
                        <Calendar size={14} className="info-icon" />
                        <span className="info-text">{formatDateTime(startTime)}</span>
                    </div>
                    <div className="info-item-modern">
                        <Users size={14} className="info-icon" />
                        <span className="info-text">Sức chứa: {capacity}</span>
                    </div>
                </div>

                <div className="event-card-footer">
                    <button
                        onClick={() => onViewDetails(event._id)}
                        className="btn-view-modern"
                    >
                        <span>Xem chi tiết</span>
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
