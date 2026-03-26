import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  getPollDetail,
  votePoll,
  closePoll,
  updatePoll,
} from '../api/pollApi';
import '../styles/PollVoteModal.css';

const toLocalInput = (d) => {
  if (!d) return '';
  const x = new Date(d);
  if (isNaN(x.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
};

const PollVoteModal = ({
  clubId,
  pollId,
  open,
  onClose,
  isLeader,
  onUpdated,
}) => {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [err, setErr] = useState('');
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [editEnd, setEditEnd] = useState('');
  const [showEditEnd, setShowEditEnd] = useState(false);

  const load = useCallback(async () => {
    if (!clubId || !pollId) return;
    setLoading(true);
    setErr('');
    try {
      const res = await getPollDetail(clubId, pollId);
      if (res.success && res.data) {
        setDetail(res.data);
        const mv = res.data.my_vote?.option_ids?.map((id) => String(id)) || [];
        setSelected(mv);
        setEditEnd(toLocalInput(res.data.poll?.end_date));
      } else {
        setErr(res.message || 'Không tải được poll');
      }
    } catch (e) {
      setErr(e?.message || 'Không tải được poll');
    } finally {
      setLoading(false);
    }
  }, [clubId, pollId]);

  useEffect(() => {
    if (open && clubId && pollId) {
      load();
    }
  }, [open, clubId, pollId, load]);

  if (!open) return null;

  const poll = detail?.poll;
  const options = detail?.options || [];
  const totalVotes = detail?.total_votes ?? 0;
  const myVoteIds = (detail?.my_vote?.option_ids || []).map((id) => String(id));
  const isOpen = poll?.status === 'open';
  const isSingle = Number(poll?.type) === 0;
  const canVote =
    isOpen &&
    totalVotes >= 0 &&
    (!myVoteIds.length || poll?.allow_change_vote);

  const toggleOption = (oid) => {
    const s = String(oid);
    if (isSingle) {
      setSelected([s]);
    } else {
      setSelected((prev) =>
        prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
      );
    }
  };

  const handleVote = async () => {
    if (!selected.length) {
      toast.error('Chọn ít nhất một lựa chọn');
      return;
    }
    setSubmitting(true);
    try {
      const res = await votePoll(clubId, pollId, selected);
      if (res.success) {
        toast.success(res.message || 'Đã ghi nhận bình chọn');
        await load();
        onUpdated?.();
      } else {
        toast.error(res.message || 'Không thể bình chọn');
      }
    } catch (e) {
      toast.error(e?.message || 'Không thể bình chọn');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClosePoll = async () => {
    setSubmitting(true);
    try {
      const res = await closePoll(clubId, pollId);
      if (res.success) {
        toast.success(res.message || 'Đã đóng poll');
        await load();
        onUpdated?.();
      } else {
        toast.error(res.message || 'Không thể đóng poll');
      }
    } catch (e) {
      toast.error(e?.message || 'Không thể đóng poll');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEnd = async () => {
    if (!editEnd) return;
    setSubmitting(true);
    try {
      const res = await updatePoll(clubId, pollId, {
        end_date: new Date(editEnd).toISOString(),
      });
      if (res.success) {
        toast.success(res.message || 'Đã cập nhật');
        setShowEditEnd(false);
        await load();
        onUpdated?.();
      } else {
        toast.error(res.message || 'Không thể cập nhật');
      }
    } catch (e) {
      toast.error(e?.message || 'Không thể cập nhật');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="poll-vm-overlay" role="presentation" onClick={onClose}>
      <div
        className="poll-vm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="poll-vm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="poll-vm-head">
          <h2 id="poll-vm-title" className="poll-vm-title">
            {poll?.title || 'Poll'}
          </h2>
          <button type="button" className="poll-vm-close" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>
        <div className="poll-vm-meta">
          {poll?.status === 'open' ? (
            <span className="poll-vm-pill poll-vm-pill--open">Đang mở</span>
          ) : (
            <span className="poll-vm-pill poll-vm-pill--closed">Đã đóng</span>
          )}
          <span className="poll-vm-pill poll-vm-pill--muted">
            {isSingle ? 'Chọn một' : 'Chọn nhiều'}
          </span>
          {poll?.min_points_required != null ? (
            <span className="poll-vm-pill poll-vm-pill--muted">
              &gt; {poll.min_points_required} điểm
            </span>
          ) : null}
        </div>
        <div className="poll-vm-body">
          {loading && <p className="poll-vm-loading">Đang tải...</p>}
          {!loading && err && <p className="poll-vm-error">{err}</p>}
          {!loading && !err && detail && (
            <>
              <div className="poll-vm-total">
                <span className="poll-vm-total-lbl">Tổng phiếu</span>
                <span className="poll-vm-total-val">{totalVotes}</span>
              </div>
              {options.map((opt) => (
                <div key={String(opt.option_id)} className="poll-vm-row">
                  <div className="poll-vm-row-top">
                    <span className="poll-vm-opt-label" title={opt.label}>
                      {opt.label}
                    </span>
                    <span className="poll-vm-opt-pct">{opt.percentage ?? 0}%</span>
                  </div>
                  <div className="poll-vm-bar">
                    <div
                      className={`poll-vm-bar-fill ${opt.is_leading ? 'poll-vm-bar-fill--lead' : ''}`}
                      style={{ width: `${Math.min(100, opt.percentage ?? 0)}%` }}
                    />
                  </div>
                </div>
              ))}

              {canVote && (
                <div className="poll-vm-vote-block">
                  <p className="poll-vm-vote-title">
                    {myVoteIds.length && !poll?.allow_change_vote
                      ? 'Bạn đã bình chọn'
                      : 'Chọn lựa chọn của bạn'}
                  </p>
                  {options.map((opt) => {
                    const id = String(opt.option_id);
                    const sel = selected.includes(id);
                    const disabled = myVoteIds.length > 0 && !poll?.allow_change_vote;
                    return (
                      <button
                        key={id}
                        type="button"
                        className={`poll-vm-option-btn ${sel ? 'is-selected' : ''}`}
                        onClick={() => !disabled && toggleOption(id)}
                        disabled={disabled}
                      >
                        <span
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: isSingle ? '50%' : 6,
                            border: '2px solid #d1d5db',
                            background: sel ? 'var(--poll-accent, #ff7051)' : '#fff',
                            flexShrink: 0,
                          }}
                          aria-hidden
                        />
                        <span className="poll-vm-opt-label">{opt.label}</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    className="poll-vm-submit"
                    disabled={
                      submitting ||
                      !selected.length ||
                      (myVoteIds.length > 0 && !poll?.allow_change_vote)
                    }
                    onClick={handleVote}
                  >
                    {submitting ? 'Đang gửi...' : 'Gửi bình chọn'}
                  </button>
                </div>
              )}

              {isLeader && (
                <div className="poll-vm-leader">
                  {isOpen && (
                    <>
                      <button
                        type="button"
                        className="poll-vm-btn-ghost poll-vm-btn-danger"
                        onClick={handleClosePoll}
                        disabled={submitting}
                      >
                        Đóng poll
                      </button>
                      <button
                        type="button"
                        className="poll-vm-btn-ghost"
                        onClick={() => setShowEditEnd((v) => !v)}
                      >
                        {showEditEnd ? 'Huỷ sửa hạn' : 'Sửa hạn kết thúc'}
                      </button>
                    </>
                  )}
                </div>
              )}
              {isLeader && showEditEnd && isOpen && (
                <div className="poll-vm-form" style={{ marginTop: 12 }}>
                  <label htmlFor="poll-end-edit">Hạn kết thúc</label>
                  <input
                    id="poll-end-edit"
                    type="datetime-local"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                  />
                  <button
                    type="button"
                    className="poll-vm-submit"
                    disabled={submitting}
                    onClick={handleSaveEnd}
                  >
                    Lưu hạn
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollVoteModal;
