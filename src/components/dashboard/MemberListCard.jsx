export function MemberListCard({ title = 'Thành viên', members = [], onManage }) {
    return (
        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{title}</h3>
                <button
                    className="card-button"
                    onClick={onManage}
                    style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    +
                </button>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
                {members.map((member) => (
                    <div
                        key={member.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px',
                            borderRadius: '12px',
                            background: 'rgba(255,255,255,0.3)'
                        }}
                    >
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'var(--candy-paleblue)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                color: 'var(--candy-text)'
                            }}
                        >
                            {member.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 600, marginBottom: '2px' }}>{member.name}</p>
                            <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>{member.role}</p>
                        </div>
                    </div>
                ))}

                <button
                    onClick={onManage}
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
                    Quản lý thành viên
                </button>
            </div>
        </div>
    );
}

export default MemberListCard;
