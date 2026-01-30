export function DangerZoneCard({ registrationsCount, onOpenDialog }) {
    return (
        <div className="glass-card" style={{
            padding: '32px',
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
                ⚠️ Danger Zone
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--candy-text)', opacity: 0.8, marginBottom: '16px' }}>
                Hủy sự kiện sẽ gửi thông báo đến tất cả {registrationsCount} người đã đăng ký.
                Hành động này không thể hoàn tác.
            </p>
            <button
                onClick={onOpenDialog}
                style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#dc2626',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = '#b91c1c';
                    e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = '#dc2626';
                    e.target.style.transform = 'translateY(0)';
                }}
            >
                Hủy sự kiện
            </button>
        </div>
    );
}

export default DangerZoneCard;
