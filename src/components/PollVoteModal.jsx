import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { getPollDetail, votePoll } from '../api/pollApi';
import '../styles/PollVoteModal.css';

const formatDateTime = (input) => {
  if (!input) return '—';
  const d = new Date(input);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const PollVoteModal = ({
  clubId,
  pollId,
  open,
  onClose,
  onUpdated,
  userPoints = null,
}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState([]);

  const loadDetail = useCallback(async () => {
    if (!clubId || !pollId) return;
    setLoading(true);
    setError('');
    try {
      const res = await getPollDetail(clubId, pollId);
      if (res?.success && res?.data) {
        const data = res.data;
        setDetail(data);
        const picked = (data?.my_vote?.option_ids || []).map((id) => String(id));
        setSelected(picked);
      } else {
        setError(res?.message || 'Không tải được poll');
      }
    } catch (e) {
      setError(e?.message || 'Không tải được poll');
    } finally {
      setLoading(false);
    }
  }, [clubId, pollId]);

  useEffect(() => {
    if (open) {
      loadDetail();
    }
  }, [open, loadDetail]);

  const poll = detail?.poll;
  const options = detail?.options || [];
  const totalVotes = detail?.total_votes ?? 0;
  const isSingle = Number(poll?.type) === 0;
  const isOpen = poll?.status === 'open';
  const nowMs = Date.now();
  const endMs = poll?.end_date ? new Date(poll.end_date).getTime() : null;
  const expired = endMs != null && !Number.isNaN(endMs) && nowMs > endMs;
  const myVoteIds = (detail?.my_vote?.option_ids || []).map((id) => String(id));
  const alreadyVotedLocked = myVoteIds.length > 0 && !poll?.allow_change_vote;
  const pointRestricted = poll?.min_points_required != null;
  const notEnoughPoints =
    pointRestricted &&
    userPoints != null &&
    Number(userPoints) < Number(poll.min_points_required);

  const disableVote = !isOpen || expired || alreadyVotedLocked || notEnoughPoints;
  const disableReason = useMemo(() => {
    if (!isOpen) return 'Bảng vote đã đóng';
    if (expired) return 'Bảng vote đã hết hạn';
    if (alreadyVotedLocked) return 'Bạn đã vote và bảng này không cho đổi lựa chọn';
    if (notEnoughPoints) return `Yêu cầu tối thiểu ${poll?.min_points_required} điểm`;
    return '';
  }, [isOpen, expired, alreadyVotedLocked, notEnoughPoints, poll?.min_points_required]);

  const handleToggleOption = (optionId) => {
    const id = String(optionId);
    if (isSingle) {
      setSelected([id]);
      return;
    }
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleVote = async () => {
    if (!selected.length) {
      toast.error('Vui lòng chọn ít nhất một lựa chọn');
      return;
    }
    setSubmitting(true);
    try {
      const res = await votePoll(clubId, pollId, selected);
      if (res?.success) {
        toast.success(res.message || 'Bình chọn thành công');
        await loadDetail();
        onUpdated?.();
      } else {
        toast.error(res?.message || 'Không thể bình chọn');
      }
    } catch (e) {
      toast.error(e?.message || 'Không thể bình chọn');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="poll-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="poll-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="poll-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="poll-modal-head">
          <h3 id="poll-modal-title">{poll?.title || 'Bình chọn'}</h3>
          <button type="button" className="poll-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="poll-modal-meta">
          <span className={`poll-modal-pill ${isOpen ? 'is-open' : 'is-closed'}`}>
            {isOpen ? 'Đang mở' : 'Đã đóng'}
          </span>
          <span className="poll-modal-pill is-muted">{isSingle ? 'Chọn một' : 'Chọn nhiều'}</span>
          <span className="poll-modal-pill is-muted">Hạn: {formatDateTime(poll?.end_date)}</span>
          {pointRestricted ? (
            <span className="poll-modal-pill is-muted">Tối thiểu {poll?.min_points_required} điểm</span>
          ) : null}
        </div>

        <div className="poll-modal-body">
          {loading ? <p className="poll-modal-note">Đang tải dữ liệu poll...</p> : null}
          {!loading && error ? <p className="poll-modal-error">{error}</p> : null}
          {!loading && !error && detail ? (
            <>
              <div className="poll-modal-total-wrap">
                <div className="poll-modal-total">Tổng phiếu: {totalVotes}</div>
                <div className="poll-modal-description">
                  Bình chọn phương án phù hợp. Bạn có thể chọn {isSingle ? '1' : 'nhiều'} lựa chọn.
                </div>
              </div>
              <div className="poll-modal-options">
                {options.map((opt) => {
                  const id = String(opt.option_id);
                  const checked = selected.includes(id);
                  return (
                    <button
                      type="button"
                      key={id}
                      className={`poll-modal-option ${checked ? 'is-selected' : ''}`}
                      onClick={() => !disableVote && handleToggleOption(opt.option_id)}
                      disabled={disableVote}
                    >
                      <div className="poll-modal-option-head">
                        <span className={`poll-modal-check ${checked ? 'is-checked' : ''}`} />
                        {checked ? (
                          <span className="poll-modal-picked" aria-hidden>
                            ✓
                          </span>
                        ) : null}
                        <span className="poll-modal-label">{opt.label}</span>
                        <span className="poll-modal-votes">{opt.votes ?? 0} phiếu</span>
                        <span className="poll-modal-pct">{opt.percentage ?? 0}%</span>
                      </div>
                      <div className="poll-modal-bar">
                        <div
                          className={`poll-modal-fill ${opt.is_leading ? 'is-leading' : ''}`}
                          style={{ width: `${Math.min(100, Number(opt.percentage || 0))}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
        {!loading && !error && detail ? (
          <div className="poll-modal-actions">
            <button
              type="button"
              className="poll-modal-submit"
              onClick={handleVote}
              disabled={disableVote || submitting || selected.length === 0}
            >
              {submitting ? 'Đang gửi...' : 'Vote ngay'}
            </button>
            {disableReason ? <span className="poll-modal-disable-reason">{disableReason}</span> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PollVoteModal;
