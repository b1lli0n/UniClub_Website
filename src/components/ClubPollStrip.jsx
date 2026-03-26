import React from 'react';
import '../styles/ClubPollStrip.css';

const formatEnd = (d) => {
  if (!d) return '—';
  const x = new Date(d);
  if (isNaN(x.getTime())) return '—';
  return x.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ClubPollStrip = ({
  detail,
  onOpen,
  onViewAll,
  variant = 'spotlight',
}) => {
  const poll = detail?.poll;
  const options = (detail?.options || []).slice(0, 4);
  const total = detail?.total_votes ?? 0;
  const title = poll?.title || 'Bình chọn';

  return (
    <div
      className={`clubdetail-poll-strip ${variant === 'bottom' ? 'clubdetail-poll-strip--bottom' : ''}`}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen?.();
        }
      }}
    >
      <div className="clubdetail-poll-strip-head">
        <h3 className="clubdetail-poll-strip-title" title={title}>
          {title}
        </h3>
        <div className="clubdetail-poll-strip-actions">
          {poll?.status === 'open' ? (
            <span className="clubdetail-poll-strip-pill clubdetail-poll-strip-pill--open">Mở</span>
          ) : (
            <span className="clubdetail-poll-strip-pill clubdetail-poll-strip-pill--closed">Đóng</span>
          )}
          <button
            type="button"
            className="clubdetail-poll-strip-link"
            onClick={(e) => {
              e.stopPropagation();
              onViewAll?.();
            }}
          >
            Tất cả
          </button>
        </div>
      </div>
      <div className="clubdetail-poll-strip-meta">
        <span>{total} phiếu</span>
        <span>Hạn: {formatEnd(poll?.end_date)}</span>
      </div>
      <div className="clubdetail-poll-strip-bars">
        {options.map((opt) => (
          <div key={String(opt.option_id)} className="clubdetail-poll-strip-row">
            <span className="clubdetail-poll-strip-opt" title={opt.label}>
              {opt.label}
            </span>
            <div className="clubdetail-poll-strip-bar">
              <div
                className="clubdetail-poll-strip-bar-fill"
                style={{ width: `${Math.min(100, opt.percentage ?? 0)}%` }}
              />
            </div>
            <span className="clubdetail-poll-strip-pct">{opt.percentage ?? 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClubPollStrip;
