const EventsFilter = ({ statusFilter, onFilterChange }) => {
    return (
        <div className="glass-card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--candy-text)' }}>
                Lọc theo trạng thái:
            </span>
            <select
                value={statusFilter}
                onChange={(e) => onFilterChange(e.target.value)}
                style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    background: 'white',
                    fontWeight: 600,
                    color: 'var(--candy-text)',
                    cursor: 'pointer'
                }}
            >
                <option value="all">Tất cả</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
            </select>
        </div>
    );
};

export default EventsFilter;
