const CancelledEventAlert = ({ canceledAt, cancelReason, formatDateTime }) => {
    return (
        <div className="glass-card" style={{
            padding: '24px',
            border: '2px solid #fee2e2',
            background: 'rgba(254, 226, 226, 0.3)'
        }}>
            <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
            }}>
                ⚠️ Sự kiện đã bị hủy
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                    <p style={{ fontSize: '0.875rem', opacity: 0.7, margin: 0 }}>Thời gian hủy</p>
                    <p style={{ fontWeight: 600, margin: 0 }}>{formatDateTime(canceledAt)}</p>
                </div>
                {cancelReason && (
                    <div>
                        <p style={{ fontSize: '0.875rem', opacity: 0.7, margin: 0 }}>Lý do</p>
                        <p style={{ fontWeight: 600, margin: 0 }}>{cancelReason}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CancelledEventAlert;
