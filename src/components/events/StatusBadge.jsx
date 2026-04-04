import '../../styles/StatusBadge.css';

const statusConfig = {
    published: { label: 'Đã xuất bản', className: 'published' },
    active: { label: 'Hoạt động', className: 'active' },
    draft: { label: 'Nháp', className: 'draft' },
    completed: { label: 'Hoàn thành', className: 'completed' },
    paused: { label: 'Tạm dừng', className: 'paused' },
    canceled: { label: 'Đã hủy', className: 'canceled' },
    pending: { label: 'Chờ duyệt', className: 'pending' },
    rejected: { label: 'Bị từ chối', className: 'rejected' },
    approved: { label: 'Đã duyệt', className: 'published' },
    left: { label: 'Đã rời', className: 'left' }
};

// Map numeric codes to labels
const CODE_MAP = {
    0: 'pending',
    1: 'approved',
    2: 'rejected',
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
        <span className={`status-badge status-${config.className}`}>
            {config.label}
        </span>
    );
}

export default StatusBadge;
