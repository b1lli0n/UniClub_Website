import '../../styles/EventInfoCard.css';

const InfoItem = ({ icon, label, value, subValue }) => (
    <div className="event-info-item">
        <div className="event-info-icon">
            {icon}
        </div>
        <div>
            <p className="event-info-label">{label}</p>
            <p className="event-info-value">{value}</p>
            {subValue && <p className="event-info-subvalue">{subValue}</p>}
        </div>
    </div>
);

const EventInfoCard = ({ event, registrationsCount, formatDateTime }) => {
    return (
        <div className="glass-card event-info-card">
            <h3 className="event-info-title">
                Thông tin sự kiện
            </h3>

            {event.description && (
                <div className="event-info-description">
                    <h4 className="event-info-description-title">
                        Mô tả
                    </h4>
                    <p className="event-info-description-text">{event.description}</p>
                </div>
            )}

            <div className="event-info-grid">
                <InfoItem
                    icon="📍"
                    label="Địa điểm"
                    value={event.location || 'Chưa xác định'}
                />
                <InfoItem
                    icon="👥"
                    label="Sức chứa"
                    value={`${event.capacity} người`}
                />
                <InfoItem
                    icon="🕐"
                    label="Thời gian bắt đầu"
                    value={formatDateTime(event.startAt)}
                />
                <InfoItem
                    icon="🕐"
                    label="Thời gian kết thúc"
                    value={formatDateTime(event.endAt)}
                />
                <InfoItem
                    icon="👥"
                    label="Số người đăng ký"
                    value={`${registrationsCount} / ${event.capacity}`}
                />
                {event.createdBy && (
                    <InfoItem
                        icon="👤"
                        label="Người tạo"
                        value={event.createdBy.name}
                        subValue={event.createdBy.email}
                    />
                )}
            </div>
        </div>
    );
};

export default EventInfoCard;
