<<<<<<< HEAD
import React from 'react';
import '../styles/ClubPollStrip.css';

const formatEnd = (d) => {
  if (!d) return '—';
  const x = new Date(d);
  if (isNaN(x.getTime())) return '—';
  return x.toLocaleString('vi-VN', {
=======
import React, { useMemo } from 'react';
import { isPollVotingOpen } from '../utils/pollVoting';
import '../styles/ClubPollStrip.css';

const formatDateTime = (input) => {
  if (!input) return '—';
  const d = new Date(input);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
>>>>>>> 1b8a56d1ec66f446bd8a5ec2b9c7e30407fb32e9
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

<<<<<<< HEAD
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
=======
const buildExpiryHint = (endDate, isOpen) => {
  if (!endDate) return isOpen ? 'Chưa có thời hạn kết thúc' : '—';
  const end = new Date(endDate);
  if (isNaN(end.getTime())) return '—';
  const now = Date.now();
  const endMs = end.getTime();
  const full = `Kết thúc: ${formatDateTime(endDate)}`;
  if (!isOpen || endMs <= now) return full;
  const diff = endMs - now;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days >= 1) return `Còn ${days} ngày · ${full}`;
  if (hours >= 1) return `Còn ${hours} giờ · ${full}`;
  if (mins >= 1) return `Còn ${mins} phút · ${full}`;
  return `Sắp kết thúc · ${full}`;
};

const ClubPollStrip = ({ detail, onOpen }) => {
  const poll = detail?.poll;
  const options = (detail?.options || []).slice(0, 6);
  const total = detail?.total_votes ?? 0;
  const myVoteIds = useMemo(
    () => (detail?.my_vote?.option_ids || []).map((id) => String(id)),
    [detail?.my_vote?.option_ids]
  );

  if (!poll) return null;

  const votingOpen = isPollVotingOpen(poll);
  const isOngoing = votingOpen;
  const canOpen = isOngoing && typeof onOpen === 'function';

  return (
    <div
      className={`club-poll-strip club-poll-strip--dark ${isOngoing ? 'club-poll-strip--ongoing' : ''} ${canOpen ? '' : 'club-poll-strip--disabled'}`}
      role={canOpen ? 'button' : undefined}
      tabIndex={canOpen ? 0 : -1}
      onClick={() => canOpen && onOpen()}
      onKeyDown={(e) => {
        if (!canOpen) return;
>>>>>>> 1b8a56d1ec66f446bd8a5ec2b9c7e30407fb32e9
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen?.();
        }
      }}
    >
<<<<<<< HEAD
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
=======
      <div className="club-poll-strip-top">
        <h3 className="club-poll-strip-title" title={poll.title}>
          {poll.title}
        </h3>
        <span className={`club-poll-strip-badge ${votingOpen ? 'is-open' : 'is-closed'}`}>
          {votingOpen ? 'Đang mở' : 'Đang đóng'}
        </span>
      </div>

      <p className="club-poll-strip-expiry">{buildExpiryHint(poll.end_date, votingOpen)}</p>

      <p
        className={`club-poll-strip-change-rule ${poll.allow_change_vote ? 'club-poll-strip-change-rule--yes' : 'club-poll-strip-change-rule--no'}`}
        role="note"
      >
        {poll.allow_change_vote
          ? 'Được đổi lựa chọn sau khi đã bình chọn'
          : 'Không đổi lựa chọn sau khi đã bình chọn'}
      </p>

      <div className="club-poll-strip-options">
        {options.map((opt, idx) => {
          const pct = Math.min(100, Number(opt.percentage ?? 0));
          const votes = opt.votes ?? 0;
          const oid = String(opt.option_id ?? opt._id ?? idx);
          const isLeading = !!opt.is_leading;
          const isMine = myVoteIds.includes(oid);

          return (
            <div
              key={oid}
              className={`club-poll-strip-opt ${isLeading ? 'is-leading' : ''} ${isMine ? 'is-mine' : ''}`}
            >
              <div className="club-poll-strip-opt-fill" style={{ width: `${pct}%` }} aria-hidden />
              <div className="club-poll-strip-opt-inner">
                <span className="club-poll-strip-num">{idx + 1}.</span>
                {(isLeading || isMine) && (
                  <span className="club-poll-strip-check" aria-hidden>
                    ✓
                  </span>
                )}
                <span className="club-poll-strip-label">{opt.label}</span>
                <span className="club-poll-strip-votes">{votes} phiếu</span>
                <span className="club-poll-strip-pct">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="club-poll-strip-footer">
        <span className="club-poll-strip-total">{total.toLocaleString('vi-VN')} phiếu</span>
        <span className={`club-poll-strip-vote-pill ${canOpen ? '' : 'is-disabled'}`}>
          {canOpen ? 'Bình chọn' : 'Đang đóng'}
        </span>
>>>>>>> 1b8a56d1ec66f446bd8a5ec2b9c7e30407fb32e9
      </div>
    </div>
  );
};

export default ClubPollStrip;
