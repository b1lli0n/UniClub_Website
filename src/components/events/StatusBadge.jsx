const statusConfig = {
    published: { label: 'Đã xuất bản', bg: 'var(--candy-paleblue)' },
    active: { label: 'Hoạt động', bg: 'var(--candy-paleblue)' },
    draft: { label: 'Nháp', bg: 'var(--candy-lightpink)' },
    completed: { label: 'Hoàn thành', bg: 'var(--candy-purple)' },
    paused: { label: 'Tạm dừng', bg: 'rgba(255, 200, 221, 0.8)' },
    canceled: { label: 'Đã hủy', bg: '#fee2e2' },
    pending: { label: 'Đang chờ', bg: 'var(--candy-lightpink)' },
    rejected: { label: 'Bị từ chối', bg: '#fee2e2' },
    left: { label: 'Đã rời', bg: '#f3f4f6' }
};

// Map numeric codes to labels
const CODE_MAP = {
    0: 'draft',
    1: 'published',
    2: 'paused',
    3: 'canceled'
};

export function StatusBadge({ status, statusCode }) {
    // Handle both string label and numeric code
    let finalStatus = status;

    // If statusCode is provided and is a number, use it
    if (typeof statusCode === 'number') {
        finalStatus = CODE_MAP[statusCode] || 'draft';
    }
    // If status is a number, map it
    else if (typeof status === 'number') {
        finalStatus = CODE_MAP[status] || 'draft';
    }

    const config = statusConfig[finalStatus] || statusConfig.draft;

    return (
        <span
            style={{
                background: config.bg,
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--candy-text)'
            }}
        >
            {config.label}
        </span>
    );
}

export default StatusBadge;
