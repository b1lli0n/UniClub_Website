const EmptyEventState = ({ onCreateEvent }) => {
    return (
        <div className="glass-card" style={{
            padding: '64px 32px',
            textAlign: 'center'
        }}>
            <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '2rem'
            }}>
                +
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>
                Không có sự kiện nào
            </h3>
            <p style={{ opacity: 0.8, marginBottom: '16px' }}>
                Tạo sự kiện đầu tiên của bạn ngay bây giờ
            </p>
            <button
                className="card-button"
                onClick={onCreateEvent}
            >
                + Tạo sự kiện
            </button>
        </div>
    );
};

export default EmptyEventState;
