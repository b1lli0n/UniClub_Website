import StatusBadge from '../events/StatusBadge';

const EventHeader = ({ title, status, onBack, onEdit, canEdit }) => {
    return (
        <>
            <header className="myclub-header">
                <h1 className="myclub-title">Chi tiết sự kiện</h1>
            </header>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <button className="card-button" onClick={onBack}>
                    ← Quay lại
                </button>
                {canEdit && (
                    <button className="card-button" onClick={onEdit}>
                        ✏️ Chỉnh sửa
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--candy-text)', margin: 0 }}>
                    {title}
                </h2>
                <StatusBadge status={status} />
            </div>
        </>
    );
};

export default EventHeader;
