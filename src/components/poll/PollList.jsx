import React, { useMemo } from 'react';
import { Search } from 'lucide-react';
import PollItem from './PollItem';

const PollList = ({
  searchText,
  onSearchChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  loading,
  filteredPolls,
  selectedPollId,
  onSelectPoll,
  formatDate,
}) => {
  const maxVotes = useMemo(() => {
    const nums = filteredPolls.map((p) => Number(p.vote_count) || 0);
    const m = Math.max(1, ...nums);
    return m;
  }, [filteredPolls]);

  return (
    <div className="pm-glass-panel pm-glass-panel--list">
      <div className="pm-glass-panel-head">
        <h2 className="pm-glass-panel-title">Danh sách poll</h2>
        <div className="pm-glass-search-wrap pm-glass-search-wrap--full">
          <Search className="pm-glass-search-icon" size={16} strokeWidth={2.2} aria-hidden />
          <input
            className="pm-glass-input"
            placeholder="Tìm theo tiêu đề..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="pm-glass-filters-row">
          <select className="pm-glass-select" value={status} onChange={(e) => onStatusChange(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="open">Đang mở</option>
            <option value="closed">Đã đóng</option>
          </select>
          <select className="pm-glass-select" value={sort} onChange={(e) => onSortChange(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="newest">Mới nhất</option>
            <option value="ending_soon">Sắp hết hạn</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="pm-glass-skeleton-list">
          {[1, 2, 3, 4].map((k) => (
            <div key={k} className="pm-glass-skeleton-card" />
          ))}
        </div>
      ) : null}

      {!loading && filteredPolls.length === 0 ? (
        <div className="pm-glass-empty">
          <p className="pm-glass-empty-title">Không có poll phù hợp</p>
          <p className="pm-glass-empty-desc">Thử đổi bộ lọc hoặc tạo poll mới.</p>
        </div>
      ) : null}

      {!loading && filteredPolls.length > 0 ? (
        <div className="pm-glass-list-scroll">
          {filteredPolls.map((poll) => (
            <PollItem
              key={poll._id}
              poll={poll}
              selected={String(selectedPollId) === String(poll._id)}
              onSelect={onSelectPoll}
              formatDate={formatDate}
              voteBarPct={(Number(poll.vote_count) || 0) / maxVotes * 100}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default PollList;
