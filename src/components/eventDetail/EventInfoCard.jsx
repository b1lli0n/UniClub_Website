const InfoItem = ({ icon, label, value, subValue }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(162, 210, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem'
        }}>
            {icon}
        </div>
        <div>
            <p style={{ fontSize: '0.875rem', opacity: 0.7, margin: 0 }}>{label}</p>
            <p style={{ fontWeight: 600, margin: 0 }}>{value}</p>
            {subValue && <p style={{ fontSize: '0.875rem', opacity: 0.7, margin: 0 }}>{subValue}</p>}
        </div>
    </div>
);

const EventInfoCard = ({ event, registrationsCount, formatDateTime }) => {
    return (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
                Thông tin sự kiện
            </h3>

            {event.description && (
                <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--candy-text)', opacity: 0.7, marginBottom: '8px' }}>
                        Mô tả
                    </h4>
                    <p style={{ color: 'var(--candy-text)' }}>{event.description}</p>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
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
