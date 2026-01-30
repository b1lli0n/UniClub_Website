export function QuickActionCard({ title, subtitle, onClick }) {
    return (
        <div
            className="glass-card"
            style={{
                padding: '24px',
                borderRadius: '16px',
                textAlign: 'center',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.2s'
            }}
            onClick={onClick}
        >
            <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>{title}</h3>
            <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '16px' }}>{subtitle}</p>
            <div
                style={{
                    width: '48px',
                    height: '48px',
                    margin: '0 auto',
                    borderRadius: '50%',
                    border: '2px dashed rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <span style={{ fontSize: '1.5rem' }}>+</span>
            </div>
        </div>
    );
}

export default QuickActionCard;
