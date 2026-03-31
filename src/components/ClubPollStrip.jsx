import { canVoteOnPollRow, statusLabelVi } from '../lib/pollUtils';
import '../styles/ClubPollStrip.css';

function stripActionLabel(poll) {
  const closed = poll?.status === 'closed' || poll?.status_code === 1;
  if (closed) return { text: 'Đã đóng', disabled: true };
  const votable = canVoteOnPollRow(poll);
  if (votable) return { text: 'Bình chọn', disabled: false };
  const now = Date.now();
  const start = poll?.start_date ? new Date(poll.start_date).getTime() : 0;
  const end = poll?.end_date ? new Date(poll.end_date).getTime() : 0;
  if (start && now < start) return { text: 'Chưa mở', disabled: true };
  if (end && now > end) return { text: 'Hết hạn', disabled: true };
  return { text: 'Đã đóng', disabled: true };
}

export default function ClubPollStrip({ poll, onOpenModal }) {
  if (!poll) return null;

  const closed = poll.status === 'closed' || poll.status_code === 1;
  const votable = canVoteOnPollRow(poll);
  const action = stripActionLabel(poll);

  const handleCardClick = () => {
    if (!votable || closed) return;
    onOpenModal?.(poll);
  };

  const handleBtn = (e) => {
    e.stopPropagation();
    if (action.disabled) return;
    onOpenModal?.(poll);
  };

  return (
    <article
      className={`cps-card${votable && !closed ? ' cps-card--active' : ''}`}
      onClick={handleCardClick}
      role="presentation"
    >
      <div className="cps-card-inner">
        <div className="cps-head">
          <h3 className="cps-title">{poll.title || 'Bình chọn'}</h3>
          <span className={`cps-badge cps-badge--${closed ? 'closed' : 'open'}`}>
            {statusLabelVi(closed ? 'closed' : 'open')}
          </span>
        </div>
        <p className="cps-meta">
          Kết thúc: {poll.end_date ? new Date(poll.end_date).toLocaleString('vi-VN') : '—'} ·{' '}
          {poll.vote_count ?? 0} phiếu
        </p>
        <div className="cps-actions">
          <button
            type="button"
            className={`cps-btn${action.disabled ? ' cps-btn--disabled' : ' cps-btn--vote'}`}
            onClick={handleBtn}
            disabled={action.disabled}
          >
            {action.text}
          </button>
        </div>
      </div>
    </article>
  );
}
