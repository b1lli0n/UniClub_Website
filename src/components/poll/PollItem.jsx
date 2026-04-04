import React from 'react';
import { isPollVotingOpen } from '../../utils/pollVoting';

const PollItem = ({ poll, selected, onSelect, formatDate, voteBarPct }) => {
  const isOpen = isPollVotingOpen(poll);
  const pct = Math.min(100, Math.max(0, Number(voteBarPct) || 0));

  return (
    <button
      type="button"
      className={`pm-glass-item ${selected ? 'is-active' : ''}`}
      onClick={() => onSelect(poll._id)}
    >
      <div className="pm-glass-item-head">
        <h3 className="pm-glass-item-title" title={poll.title}>
          {poll.title}
        </h3>
        <span className={`pm-glass-badge ${isOpen ? 'is-open' : 'is-closed'}`}>
          {isOpen ? 'Đang mở' : 'Đang đóng'}
        </span>
      </div>
      <div className="pm-glass-item-meta">
        <span>Hết hạn: {formatDate(poll.end_date)}</span>
        <span className="pm-glass-item-votes">{(poll.vote_count ?? 0).toLocaleString('vi-VN')} phiếu</span>
      </div>
      <div className="pm-glass-item-bar" aria-hidden>
        <div className="pm-glass-item-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </button>
  );
};

export default PollItem;
