import StatusBadge from '../events/StatusBadge';

export function EventListCard({ title = 'Sự kiện', events = [], clubName, onCreate, onView, onEdit, onSeeAll }) {
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

    return (
        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{title}</h3>
                <button className="card-button" onClick={onCreate} style={{ padding: '8px 16px' }}>
                    + Tạo sự kiện
                </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
                {events.map((event) => (
                    <div
                        key={event.id}
                        className="myclub-card"
                        style={{
                            padding: '16px',
                            display: 'grid',
                            gridTemplateColumns: '100px 1fr auto',
                            gap: '16px',
                            alignItems: 'center'
                        }}
                    >
                        <div
                            style={{
                                height: '80px',
                                background: 'rgba(255,255,255,0.5)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem'
                            }}
                        >
                            📅
                        </div>

                        <div>
                            <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>{event.title}</h4>
                            <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '8px' }}>{clubName}</p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="card-button" onClick={() => onView?.(event.id)} style={{ padding: '6px 12px', fontSize: '0.875rem' }}>
                                    Xem sự kiện
                                </button>
                                <button className="card-button" onClick={() => onEdit?.(event.id)} style={{ padding: '6px 12px', fontSize: '0.875rem' }}>
                                    Chỉnh sửa
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                            <StatusBadge status={event.status} />
                            <span
                                style={{
                                    fontSize: '0.75rem',
                                    background: 'rgba(255,255,255,0.6)',
                                    padding: '4px 8px',
                                    borderRadius: '8px'
                                }}
                            >
                                {formatDate(event.startAt)} - {formatDate(event.endAt)}
                            </span>
                        </div>
                    </div>
                ))}

                <button
                    onClick={onSeeAll}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--candy-text)',
                        fontWeight: 700,
                        cursor: 'pointer'
                    }}
                >
                    Xem tất cả sự kiện
                </button>
            </div>
        </div>
    );
}

export default EventListCard;
