import { statusLabelVi } from '../../lib/pollUtils';

export default function PollList({
  items,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortKey,
  onSortChange,
  selectedPollId,
  onSelectPoll,
}) {
  const q = (search || '').trim().toLowerCase();
  const visible = (items || []).filter((row) =>
    q ? String(row.title || '').toLowerCase().includes(q) : true
  );

  return (
    <div className="poll-pm-list-wrap">
      <div className="poll-pm-toolbar">
        <div className="poll-pm-toolbar-row">
          <label className="poll-pm-field">
            <span className="poll-pm-field-label">Tìm theo tiêu đề</span>
            <input
              type="search"
              className="poll-pm-input"
              placeholder="Nhập từ khóa..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </label>
          <label className="poll-pm-field">
            <span className="poll-pm-field-label">Trạng thái</span>
            <select
              className="poll-pm-select"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="open">Đang mở</option>
              <option value="closed">Đã đóng</option>
            </select>
          </label>
          <label className="poll-pm-field">
            <span className="poll-pm-field-label">Sắp xếp</span>
            <select className="poll-pm-select" value={sortKey} onChange={(e) => onSortChange(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="newest">Mới nhất</option>
              <option value="ending_soon">Sắp kết thúc</option>
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="poll-pm-loading">Đang tải...</div>
      ) : visible.length === 0 ? (
        <div className="poll-pm-empty">Không có bảng vote phù hợp.</div>
      ) : (
        <ul className="poll-pm-ul">
          {visible.map((row) => {
            const active = selectedPollId && String(selectedPollId) === String(row._id);
            const st = row.status === 'open' ? 'open' : 'closed';
            return (
              <li key={row._id}>
                <button
                  type="button"
                  className={`poll-pm-row${active ? ' is-active' : ''}`}
                  onClick={() => onSelectPoll(row._id)}
                >
                  <div className="poll-pm-row-main">
                    <span className="poll-pm-row-title">{row.title}</span>
                    <span className="poll-pm-meta">
                      Kết thúc: {row.end_date ? new Date(row.end_date).toLocaleString('vi-VN') : '—'} ·{' '}
                      {row.vote_count ?? 0} phiếu
                    </span>
                  </div>
                  <span className={`poll-pm-badge poll-pm-badge--${st}`}>{statusLabelVi(st)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
