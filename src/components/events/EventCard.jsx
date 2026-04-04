import StatusBadge from './StatusBadge';
import '../../styles/EventCard.css';
import { Calendar, MapPin, Users, ArrowRight, ImageIcon, Edit3, ClipboardCheck, Eye } from 'lucide-react';

const getProgressStatusLabel = (progressStatus) => {
    switch (String(progressStatus)) {
        case '0': return 'Nháp';
        case '1': return 'Hoàn thành';
        default: return 'N/A';
    }
};

const EventCard = ({ event, onViewDetails, onEdit, onAttend, formatDateTime }) => {
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
                <img 
                    src={hasImage 
                        ? (mainImage.startsWith('http') ? mainImage : `http://localhost:5000${mainImage}`) 
                        : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"} 
                    alt={title} 
                    className="event-card-img" 
                    onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop";
                    }}
                />
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
                        title="Xem chi tiết"
                        style={{ flex: 1, justifyContent: 'center' }}
                    >
                        <Eye size={16} />
                        <span>Xem chi tiết</span>
                    </button>

                    {onAttend && (
                        <button
                            onClick={() => onAttend(event._id)}
                            className="btn-attend-modern"
                            title="Điểm danh"
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '8px', 
                                padding: '10px 20px', borderRadius: '12px', border: 'none',
                                background: 'linear-gradient(135deg, #FF4B91 0%, #7B66FF 100%)', 
                                color: 'white', transition: 'all 0.3s ease', fontSize: '0.9rem',
                                fontWeight: '600', flex: 1.2, justifyContent: 'center',
                                boxShadow: '0 4px 15px rgba(123, 102, 255, 0.3)'
                            }}
                        >
                            <ClipboardCheck size={18} />
                            <span>Điểm danh</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventCard;
